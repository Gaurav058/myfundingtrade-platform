import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(orderId: string, provider: 'STRIPE' | 'CRYPTO' | 'BANK_TRANSFER' | 'MANUAL') {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING_PAYMENT') throw new BadRequestException('Order not in payable state');

    return this.prisma.payment.create({
      data: {
        orderId,
        provider,
        status: 'PENDING',
        amount: order.totalAmount,
        currency: order.currency,
      },
    });
  }

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

    // Affiliate conversion attribution
    if (payment.order.affiliateId) {
      await this.createAffiliateConversion(payment.order);
    }

    return updatedPayment;
  }

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

  async findByOrderId(orderId: string) {
    return this.prisma.payment.findMany({ where: { orderId }, orderBy: { createdAt: 'desc' } });
  }
}
