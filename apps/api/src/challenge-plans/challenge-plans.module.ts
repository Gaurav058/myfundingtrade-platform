import { Module } from '@nestjs/common';
import { ChallengePlansController } from './challenge-plans.controller';
import { ChallengePlansService } from './challenge-plans.service';

@Module({
  controllers: [ChallengePlansController],
  providers: [ChallengePlansService],
  exports: [ChallengePlansService],
})
export class ChallengePlansModule {}
