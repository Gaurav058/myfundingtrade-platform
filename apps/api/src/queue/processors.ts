import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES } from './queue.module';

@Processor(QUEUE_NAMES.EMAIL)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing email job ${job.id}: ${job.data.type}`);
    // TODO: integrate real email provider (SendGrid / SES / SMTP)
    this.logger.log(`Email sent to ${job.data.to}`);
  }
}

@Processor(QUEUE_NAMES.NOTIFICATIONS)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing notification job ${job.id}: ${job.data.type}`);
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
