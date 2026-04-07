import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AffiliatesService } from './affiliates.service';
import { CurrentUser, Roles, Public } from '../common/decorators';
import { PaginationDto } from '../common/dto';
import {
  TrackClickDto,
  RequestCommissionPayoutDto,
  UpdateAffiliateStatusDto,
  UpdateCommissionRateDto,
  ReviewConversionDto,
  ReviewCommissionPayoutDto,
} from './dto';
import { Request } from 'express';

@ApiTags('Affiliates')
@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly service: AffiliatesService) {}

  // ── Public (no auth) ──────────────────────────────────────────────

  @Post('track')
  @Public()
  trackClick(@Body() dto: TrackClickDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '0.0.0.0';
    const userAgent = req.headers['user-agent'];
    return this.service.trackClick(dto, ip, userAgent);
  }

  // ── Affiliate (authenticated trader) ──────────────────────────────

  @Post('link')
  @ApiBearerAuth()
  getOrCreateLink(@CurrentUser('id') userId: string) {
    return this.service.getOrCreateLink(userId);
  }

  @Get('dashboard')
  @ApiBearerAuth()
  getDashboard(@CurrentUser('id') userId: string) {
    return this.service.getDashboard(userId);
  }

  @Get('clicks')
  @ApiBearerAuth()
  getClicks(@CurrentUser('id') userId: string, @Query() query: PaginationDto) {
    return this.service.getClicks(userId, query);
  }

  @Get('conversions')
  @ApiBearerAuth()
  getConversions(@CurrentUser('id') userId: string, @Query() query: PaginationDto) {
    return this.service.getConversions(userId, query);
  }

  @Post('payouts')
  @ApiBearerAuth()
  requestPayout(@CurrentUser('id') userId: string, @Body() dto: RequestCommissionPayoutDto) {
    return this.service.requestCommissionPayout(userId, dto);
  }

  @Get('payouts')
  @ApiBearerAuth()
  getPayoutHistory(@CurrentUser('id') userId: string, @Query() query: PaginationDto) {
    return this.service.getPayoutHistory(userId, query);
  }

  // ── Admin ─────────────────────────────────────────────────────────

  @Get('admin')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  adminFindAll(@Query() query: PaginationDto, @Query('status') status?: string) {
    return this.service.adminFindAll(query, status);
  }

  @Get('admin/fraud-signals')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  adminFraudSignals(@Query('affiliateId') affiliateId?: string) {
    return this.service.adminGetFraudSignals(affiliateId);
  }

  @Get('admin/conversions')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  adminGetConversions(@Query() query: PaginationDto, @Query('status') status?: string) {
    return this.service.adminGetConversions(query, status);
  }

  @Patch('admin/conversions/:id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  adminReviewConversion(@Param('id') id: string, @Body() dto: ReviewConversionDto) {
    return this.service.adminReviewConversion(id, dto);
  }

  @Get('admin/payouts')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  adminGetPayouts(@Query() query: PaginationDto, @Query('status') status?: string) {
    return this.service.adminGetPayouts(query, status);
  }

  @Patch('admin/payouts/:id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  adminReviewPayout(@Param('id') id: string, @Body() dto: ReviewCommissionPayoutDto) {
    return this.service.adminReviewPayout(id, dto);
  }

  @Get('admin/:id')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  adminFindById(@Param('id') id: string) {
    return this.service.adminFindById(id);
  }

  @Patch('admin/:id/status')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  adminUpdateStatus(@Param('id') id: string, @Body() dto: UpdateAffiliateStatusDto) {
    return this.service.adminUpdateStatus(id, dto);
  }

  @Patch('admin/:id/rate')
  @ApiBearerAuth()
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  updateRate(@Param('id') id: string, @Body() dto: UpdateCommissionRateDto) {
    return this.service.updateCommissionRate(id, dto.commissionRate);
  }
}
