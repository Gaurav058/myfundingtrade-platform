import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto';
import { QUEUE_NAMES } from '../queue/queue.module';
import { NotificationEvents } from './events';
import type {
  RegistrationPayload,
  EmailVerificationPayload,
  OrderConfirmationPayload,
  KycSubmittedPayload,
  KycApprovedPayload,
  KycRejectedPayload,
  PayoutRequestedPayload,
  PayoutApprovedPayload,
  PayoutRejectedPayload,
  TicketCreatedPayload,
  TicketRepliedPayload,
  AffiliateSignupPayload,
  AffiliatePayoutUpdatePayload,
  NewsletterSubscriptionPayload,
} from './events';
import * as templates from './templates';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NAMES.EMAIL) private readonly emailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private readonly notifQueue: Queue,
  ) {}

  // ── Query APIs ─────────────────────────────────────────────────────────

  async findAllForUser(userId: string, query: PaginationDto) {
    const where = { userId };
    const [items, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return {
      items,
      total,
      unread,
      page: query.page || 1,
      pageSize: query.pageSize || 20,
    };
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async deleteNotification(id: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id, userId },
    });
  }

  // ── Admin APIs ─────────────────────────────────────────────────────────

  async adminFindAll(query: PaginationDto & { userId?: string; type?: string; status?: string }) {
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } } },
      }),
      this.prisma.notification.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async adminGetStats() {
    const [total, queued, sent, failed, unread] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { status: 'QUEUED' } }),
      this.prisma.notification.count({ where: { status: 'SENT' } }),
      this.prisma.notification.count({ where: { status: 'FAILED' } }),
      this.prisma.notification.count({ where: { readAt: null, type: 'IN_APP' } }),
    ]);
    return { total, queued, sent, failed, unread };
  }

  // ── Dispatch helpers ───────────────────────────────────────────────────

  private async queueEmail(
    userId: string | null,
    email: string,
    subject: string,
    html: string,
    eventType: string,
  ) {
    let notificationId: string | undefined;

    if (userId) {
      const record = await this.prisma.notification.create({
        data: {
          userId,
          type: 'EMAIL',
          status: 'QUEUED',
          channel: 'email',
          title: subject,
          body: eventType,
          metadata: { email },
        },
      });
      notificationId = record.id;
    }

    await this.emailQueue.add(eventType, {
      notificationId,
      to: email,
      subject,
      html,
      tags: [{ name: 'event', value: eventType }],
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 500,
    });

    this.logger.log(`Queued email: event=${eventType} to=${email}`);
  }

  private async queueInApp(
    userId: string,
    title: string,
    body: string,
    eventType: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.notifQueue.add(eventType, {
      userId,
      type: eventType,
      title,
      body,
      metadata,
    }, {
      removeOnComplete: 100,
    });
  }

  // ── Event listeners ────────────────────────────────────────────────────

  @OnEvent(NotificationEvents.REGISTRATION)
  async onRegistration(payload: RegistrationPayload) {
    const tpl = templates.registrationEmail(payload);
    await this.queueEmail(payload.userId, payload.email, tpl.subject, tpl.html, NotificationEvents.REGISTRATION);
    await this.queueInApp(payload.userId, tpl.inAppTitle, tpl.inAppBody, NotificationEvents.REGISTRATION);
  }

  @OnEvent(NotificationEvents.EMAIL_VERIFICATION)
  async onEmailVerification(payload: EmailVerificationPayload) {
    const tpl = templates.emailVerificationEmail(payload);
    await this.queueEmail(payload.userId, payload.email, tpl.subject, tpl.html, NotificationEvents.EMAIL_VERIFICATION);
  }

  @OnEvent(NotificationEvents.ORDER_CONFIRMATION)
  async onOrderConfirmation(payload: OrderConfirmationPayload) {
    const tpl = templates.orderConfirmationEmail(payload);
    await this.queueEmail(payload.userId, payload.email, tpl.subject, tpl.html, NotificationEvents.ORDER_CONFIRMATION);
    await this.queueInApp(payload.userId, tpl.inAppTitle, tpl.inAppBody, NotificationEvents.ORDER_CONFIRMATION, {
      orderId: payload.orderId,
    });
  }

  @OnEvent(NotificationEvents.KYC_SUBMITTED)
  async onKycSubmitted(payload: KycSubmittedPayload) {
    const tpl = templates.kycSubmittedEmail(payload);
    await this.queueEmail(payload.userId, payload.email, tpl.subject, tpl.html, NotificationEvents.KYC_SUBMITTED);
    await this.queueInApp(payload.userId, tpl.inAppTitle, tpl.inAppBody, NotificationEvents.KYC_SUBMITTED);
  }

  @OnEvent(NotificationEvents.KYC_APPROVED)
  async onKycApproved(payload: KycApprovedPayload) {
    const tpl = templates.kycApprovedEmail(payload);
    await this.queueEmail(payload.userId, payload.email, tpl.subject, tpl.html, NotificationEvents.KYC_APPROVED);
    await this.queueInApp(payload.userId, tpl.inAppTitle, tpl.inAppBody, NotificationEvents.KYC_APPROVED);
  }

  @OnEvent(NotificationEvents.KYC_REJECTED)
  async onKycRejected(payload: KycRejectedPayload) {
    const tpl = templates.kycRejectedEmail(payload);
    await this.queueEmail(payload.userId, payload.email, tpl.subject, tpl.html, NotificationEvents.KYC_REJECTED);
    await this.queueInApp(payload.userId, tpl.inAppTitle, tpl.inAppBody, NotificationEvents.KYC_REJECTED, {
      reason: payload.reason,
    });
  }

  @OnEvent(NotificationEvents.PAYOUT_REQUESTED)
  async onPayoutRequested(payload: PayoutRequestedPayload) {
    const tpl = templates.payoutRequestedEmail(payload);
    await this.queueEmail(payload.userId, payload.email, tpl.subject, tpl.html, NotificationEvents.PAYOUT_REQUESTED);
    await this.queueInApp(payload.userId, tpl.inAppTitle, tpl.inAppBody, NotificationEvents.PAYOUT_REQUESTED, {
      payoutId: payload.payoutId,
    });
  }

  @OnEvent(NotificationEvents.PAYOUT_APPROVED)
  async onPayoutApproved(payload: PayoutApprovedPayload) {
    const tpl = templates.payoutApprovedEmail(payload);
    await this.queueEmail(payload.userId, payload.email, tpl.subject, tpl.html, NotificationEvents.PAYOUT_APPROVED);
    await this.queueInApp(payload.userId, tpl.inAppTitle, tpl.inAppBody, NotificationEvents.PAYOUT_APPROVED, {
      payoutId: payload.payoutId,
    });
  }

  @OnEvent(NotificationEvents.PAYOUT_REJECTED)
  async onPayoutRejected(payload: PayoutRejectedPayload) {
    const tpl = templates.payoutRejectedEmail(payload);
    await this.queueEmail(payload.userId, payload.email, tpl.subject, tpl.html, NotificationEvents.PAYOUT_REJECTED);
    await this.queueInApp(payload.userId, tpl.inAppTitle, tpl.inAppBody, NotificationEvents.PAYOUT_REJECTED, {
      payoutId: payload.payoutId,
      reason: payload.reason,
    });
  }

  @OnEvent(NotificationEvents.TICKET_CREATED)
  async onTicketCreated(payload: TicketCreatedPayload) {
    const tpl = templates.ticketCreatedEmail(payload);
    await this.queueEmail(payload.userId, payload.email, tpl.subject, tpl.html, NotificationEvents.TICKET_CREATED);
    await this.queueInApp(payload.userId, tpl.inAppTitle, tpl.inAppBody, NotificationEvents.TICKET_CREATED, {
      ticketId: payload.ticketId,
    });
  }

  @OnEvent(NotificationEvents.TICKET_REPLIED)
  async onTicketReplied(payload: TicketRepliedPayload) {
    const tpl = templates.ticketRepliedEmail(payload);
    await this.queueEmail(payload.userId, payload.email, tpl.subject, tpl.html, NotificationEvents.TICKET_REPLIED);
    await this.queueInApp(payload.userId, tpl.inAppTitle, tpl.inAppBody, NotificationEvents.TICKET_REPLIED, {
      ticketId: payload.ticketId,
    });
  }

  @OnEvent(NotificationEvents.AFFILIATE_SIGNUP)
  async onAffiliateSignup(payload: AffiliateSignupPayload) {
    const tpl = templates.affiliateSignupEmail(payload);
    await this.queueEmail(payload.userId, payload.email, tpl.subject, tpl.html, NotificationEvents.AFFILIATE_SIGNUP);
    await this.queueInApp(payload.userId, tpl.inAppTitle, tpl.inAppBody, NotificationEvents.AFFILIATE_SIGNUP, {
      affiliateCode: payload.affiliateCode,
    });
  }

  @OnEvent(NotificationEvents.AFFILIATE_PAYOUT_UPDATE)
  async onAffiliatePayoutUpdate(payload: AffiliatePayoutUpdatePayload) {
    const tpl = templates.affiliatePayoutUpdateEmail(payload);
    await this.queueEmail(payload.userId, payload.email, tpl.subject, tpl.html, NotificationEvents.AFFILIATE_PAYOUT_UPDATE);
    await this.queueInApp(payload.userId, tpl.inAppTitle, tpl.inAppBody, NotificationEvents.AFFILIATE_PAYOUT_UPDATE, {
      payoutId: payload.payoutId,
    });
  }

  @OnEvent(NotificationEvents.NEWSLETTER_SUBSCRIPTION)
  async onNewsletterSubscription(payload: NewsletterSubscriptionPayload) {
    const tpl = templates.newsletterSubscriptionEmail(payload);
    await this.queueEmail(null, payload.email, tpl.subject, tpl.html, NotificationEvents.NEWSLETTER_SUBSCRIPTION);
    // No in-app notification for newsletter — user may not have an account
  }
}
