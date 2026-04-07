import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from './constants';
import { PrismaService } from '../prisma/prisma.service';
import {
  EMAIL_PROVIDER,
  type EmailProvider,
} from '../notifications/email';

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job) {
    const { notificationId, to, subject, html, text, tags } = job.data;
    this.logger.log(`Processing email job ${job.id}: to=${to} subject="${subject}"`);

    const result = await this.emailProvider.send({ to, subject, html, text, tags });

    if (notificationId) {
      if (result.success) {
        await this.prisma.notification.update({
          where: { id: notificationId },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            metadata: { emailId: result.id },
          },
        });
      } else {
        await this.prisma.notification.update({
          where: { id: notificationId },
          data: {
            status: 'FAILED',
            failedAt: new Date(),
            failReason: result.error?.slice(0, 500),
          },
        });
      }
    }

    if (!result.success) {
      throw new Error(`Email send failed: ${result.error}`);
    }
  }
}

@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job) {
    const { userId, type, title, body, metadata } = job.data;
    this.logger.log(`Processing in-app notification job ${job.id}: ${type}`);

    await this.prisma.notification.create({
      data: {
        userId,
        type: 'IN_APP',
        status: 'DELIVERED',
        channel: 'in_app',
        title,
        body,
        metadata,
        sentAt: new Date(),
      },
    });
  }
}

@Processor(QUEUE_NAMES.EVALUATION)
export class EvaluationProcessor extends WorkerHost {
  private readonly logger = new Logger(EvaluationProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing evaluation job ${job.id}: account ${job.data.traderAccountId}`);
  }
}

@Processor(QUEUE_NAMES.PAYOUTS)
export class PayoutProcessor extends WorkerHost {
  private readonly logger = new Logger(PayoutProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing payout job ${job.id}: request ${job.data.payoutRequestId}`);
  }
}

@Processor(QUEUE_NAMES.AUDIT)
export class AuditProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing audit job ${job.id}: ${job.data.action}`);
  }
}
