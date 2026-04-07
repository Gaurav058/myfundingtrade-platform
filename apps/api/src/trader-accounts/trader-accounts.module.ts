import { Module } from '@nestjs/common';
import { TraderAccountsService } from './trader-accounts.service';
import { TraderAccountsController } from './trader-accounts.controller';

@Module({
  controllers: [TraderAccountsController],
  providers: [TraderAccountsService],
  exports: [TraderAccountsService],
})
export class TraderAccountsModule {}
