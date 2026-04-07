import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import {
  EmailProcessor,
  NotificationProcessor,
  EvaluationProcessor,
  PayoutProcessor,
  AuditProcessor,
} from './processors';
import { EMAIL_PROVIDER } from '../notifications/email';
import { ResendEmailProvider } from '../notifications/email';
import { QUEUE_NAMES } from './constants';

export { QUEUE_NAMES };

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.EMAIL },
      { name: QUEUE_NAMES.NOTIFICATIONS },
      { name: QUEUE_NAMES.EVALUATION },
      { name: QUEUE_NAMES.PAYOUTS },
      { name: QUEUE_NAMES.AUDIT },
    ),
  ],
  providers: [
    { provide: EMAIL_PROVIDER, useClass: ResendEmailProvider },
    EmailProcessor,
    NotificationProcessor,
    EvaluationProcessor,
    PayoutProcessor,
    AuditProcessor,
  ],
  exports: [BullModule, EMAIL_PROVIDER],
})
export class QueueModule {}
