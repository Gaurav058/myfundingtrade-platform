import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

export const QUEUE_NAMES = {
  EMAIL: 'email',
  NOTIFICATIONS: 'notifications',
  EVALUATION: 'evaluation',
  PAYOUTS: 'payouts',
  AUDIT: 'audit',
} as const;

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
  exports: [BullModule],
})
export class QueueModule {}
