import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from './stripe.service';
import type { PaginationDto } from '../common/dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvents } from '../notifications/events';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripeService: StripeService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ── Initiate Stripe Checkout ─────────────────────────────────────────

  async initiateCheckout(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { variant: { include: { plan: true } }, user: { select: { email: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING_PAYMENT') throw new BadRequestException('Order is not in payable state');

    if (!this.stripeService.isEnabled) {
      throw new BadRequestException('Payment processing is not configured');
    }

    // Idempotency: reuse existing PENDING payment for this order
    let payment = await this.prisma.payment.findFirst({
      where: { orderId, provider: 'STRIPE', status: 'PENDING' },
    });

    if (!payment) {
      payment = await this.prisma.payment.create({
        data: {
          orderId,
          provider: 'STRIPE',
          status: 'PENDING',
          amount: order.totalAmount,
          currency: order.currency,
        },
      });
    }

    const portalUrl = this.configService.get<string>('NEXT_PUBLIC_PORTAL_URL', 'http://localhost:3001');

    const session = await this.stripeService.createCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: Number(order.totalAmount),
      currency: order.currency,
      description: `${order.variant.plan.name} — $${Number(order.variant.accountSize).toLocaleString()} Account`,
      customerEmail: (order as any).user.email,
      successUrl: `${portalUrl}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${portalUrl}/dashboard/checkout/cancel?order_id=${order.id}`,
      metadata: { paymentId: payment.id },
    });

    // Store Stripe session ID for reconciliation
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PROCESSING',
        providerPaymentId: session.id,
        metadata: { stripeSessionId: session.id },
      },
    });

    return { checkoutUrl: session.url, sessionId: session.id, paymentId: payment.id };
  }

  // ── Webhook: checkout.session.completed ──────────────────────────────

  async handleCheckoutComplete(session: {
    id: string;
    payment_intent: string | { id: string };
    metadata?: { orderId?: string; paymentId?: string };
    amount_total?: number | null;
    payment_status?: string;
  }) {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      this.logger.warn(`Checkout session ${session.id} has no orderId in metadata`);
      return;
    }

    const paymentIntentId = typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;

    // Idempotency: check if already processed
    const existingSuccess = await this.prisma.payment.findFirst({
      where: { orderId, status: 'SUCCEEDED' },
    });
    if (existingSuccess) {
      this.logger.log(`Order ${orderId} already has successful payment — skipping duplicate`);
      return;
    }

    // Find the payment record
    const payment = await this.prisma.payment.findFirst({
      where: { providerPaymentId: session.id },
      include: { order: true },
    });

    if (!payment) {
      this.logger.warn(`No payment found for session ${session.id}`);
      return;
    }

    if (payment.order.status !== 'PENDING_PAYMENT') {
      this.logger.log(`Order ${orderId} is ${payment.order.status} — skipping`);
      return;
    }

    // Atomically update payment + order
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCEEDED',
          providerPaymentId: paymentIntentId || session.id,
          paidAt: now,
          metadata: {
            ...(payment.metadata as any),
            stripeSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
          },
        },
      }),
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID', paidAt: now },
      }),
    ]);

    // Emit order confirmation notification
    const orderWithDetails = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { include: { profile: true } },
        variant: { include: { plan: true } },
      },
    });
    if (orderWithDetails?.user) {
      this.eventEmitter.emit(NotificationEvents.ORDER_CONFIRMATION, {
        userId: orderWithDetails.user.id,
        email: orderWithDetails.user.email,
        firstName: orderWithDetails.user.profile?.firstName,
        orderId: orderWithDetails.orderNumber,
        planName: orderWithDetails.variant?.plan?.name || 'Challenge Plan',
        amount: Number(orderWithDetails.totalAmount),
        currency: orderWithDetails.currency,
      });
    }

    // Affiliate conversion attribution (fire-and-forget)
    if (payment.order.affiliateId) {
      this.createAffiliateConversion(payment.order).catch((err) =>
        this.logger.error(`Affiliate conversion failed for order ${orderId}: ${err.message}`),
      );
    }

    this.logger.log(`Payment ${payment.id} succeeded for order ${orderId}`);
  }

  // ── Webhook: checkout.session.expired ────────────────────────────────

  async handleCheckoutExpired(session: { id: string; metadata?: { orderId?: string } }) {
    const payment = await this.prisma.payment.findFirst({
      where: { providerPaymentId: session.id },
    });
    if (!payment || payment.status === 'SUCCEEDED') return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'CANCELLED', failureReason: 'Checkout session expired' },
    });

    this.logger.log(`Payment ${payment.id} marked cancelled — session expired`);
  }

  // ── Webhook: charge.refunded ─────────────────────────────────────────

  async handleChargeRefunded(charge: {
    payment_intent: string;
    amount_refunded: number;
    amount: number;
    refunds?: { data: Array<{ amount: number }> };
  }) {
    const piId = typeof charge.payment_intent === 'string' ? charge.payment_intent : '';
    const payment = await this.prisma.payment.findFirst({
      where: { providerPaymentId: piId, status: 'SUCCEEDED' },
      include: { order: true },
    });
    if (!payment) return;

    const refundedCents = charge.amount_refunded;
    const totalCents = charge.amount;
    const isFullRefund = refundedCents >= totalCents;
    const refundedAmount = refundedCents / 100;

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          refundedAmount,
        },
      }),
      ...(isFullRefund
        ? [
            this.prisma.order.update({
              where: { id: payment.orderId },
              data: { status: 'REFUNDED', refundedAt: new Date() },
            }),
          ]
        : []),
    ]);

    this.logger.log(`Payment ${payment.id} refunded ($${refundedAmount}) — ${isFullRefund ? 'full' : 'partial'}`);
  }

  // ── Webhook: charge.dispute.created ──────────────────────────────────

  async handleDisputeCreated(dispute: { payment_intent: string }) {
    const piId = typeof dispute.payment_intent === 'string' ? dispute.payment_intent : '';
    const payment = await this.prisma.payment.findFirst({
      where: { providerPaymentId: piId },
    });
    if (!payment) return;

    await this.prisma.$transaction([
      this.prisma.payment.update({ where: { id: payment.id }, data: { status: 'DISPUTED' } }),
      this.prisma.order.update({ where: { id: payment.orderId }, data: { status: 'DISPUTED' } }),
    ]);

    this.logger.warn(`Dispute created for payment ${payment.id}`);
  }

  // ── Admin: initiate refund ───────────────────────────────────────────

  async refundPayment(paymentId: string, amount?: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== 'SUCCEEDED') throw new BadRequestException('Only succeeded payments can be refunded');
    if (!payment.providerPaymentId) throw new BadRequestException('No provider payment ID available');

    if (!this.stripeService.isEnabled) throw new BadRequestException('Stripe not configured');

    const refund = await this.stripeService.createRefund(payment.providerPaymentId, amount);
    const refundedAmount = refund.amount / 100;
    const isFullRefund = !amount || amount >= Number(payment.amount);

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
          refundedAmount,
        },
      }),
      ...(isFullRefund
        ? [
            this.prisma.order.update({
              where: { id: payment.orderId },
              data: { status: 'REFUNDED', refundedAt: new Date() },
            }),
          ]
        : []),
    ]);

    this.logger.log(`Refund initiated for payment ${paymentId} — $${refundedAmount}`);
    return { refundId: refund.id, refundedAmount, status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED' };
  }

  // ── Confirm (manual / fallback) ──────────────────────────────────────

  async confirmPayment(paymentId: string, providerPaymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId }, include: { order: true } });
    if (!payment) throw new NotFoundException('Payment not found');

    const [updatedPayment] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'SUCCEEDED', providerPaymentId, paidAt: new Date() },
      }),
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAID', paidAt: new Date() },
      }),
    ]);

    if (payment.order.affiliateId) {
      await this.createAffiliateConversion(payment.order);
    }

    return updatedPayment;
  }

  // ── Query helpers ────────────────────────────────────────────────────

  async findByOrderId(orderId: string) {
    return this.prisma.payment.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }

  async adminFindAll(query: PaginationDto, status?: string, provider?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (provider) where.provider = provider;

    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async getPaymentDetails(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            variant: { include: { plan: true } },
            user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  // ── Affiliate conversion (private) ──────────────────────────────────

  private async createAffiliateConversion(order: { id: string; affiliateId: string | null; userId: string; totalAmount: any }) {
    if (!order.affiliateId) return;

    const affiliate = await this.prisma.affiliateAccount.findUnique({ where: { id: order.affiliateId } });
    if (!affiliate || affiliate.status !== 'ACTIVE') return;
    if (affiliate.userId === order.userId) return; // self-referral guard

    const existing = await this.prisma.affiliateConversion.findUnique({ where: { orderId: order.id } });
    if (existing) return; // prevent duplicate

    const rate = Number(affiliate.commissionRate);
    const orderAmount = Number(order.totalAmount);
    const commissionAmount = Math.round(orderAmount * rate / 100 * 100) / 100;

    await this.prisma.$transaction([
      this.prisma.affiliateConversion.create({
        data: {
          affiliateId: affiliate.id,
          orderId: order.id,
          orderAmount,
          commissionRate: rate,
          commissionAmount,
          status: 'PENDING',
        },
      }),
      this.prisma.affiliateAccount.update({
        where: { id: affiliate.id },
        data: {
          totalEarnings: { increment: commissionAmount },
          pendingBalance: { increment: commissionAmount },
        },
      }),
    ]);
  }
}
