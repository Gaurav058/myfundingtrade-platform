import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('revenue')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getRevenue(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.service.getRevenueStats(startDate, endDate);
  }

  @Get('users')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  getUserGrowth() {
    return this.service.getUserGrowth();
  }

  @Get('challenges')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  getChallengeStats() {
    return this.service.getChallengeStats();
  }

  @Get('payouts')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  getPayoutStats() {
    return this.service.getPayoutStats();
  }
}
