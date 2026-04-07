import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AffiliatesService } from './affiliates.service';
import { CurrentUser, Roles } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('Affiliates')
@ApiBearerAuth()
@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly service: AffiliatesService) {}

  @Post('link')
  getOrCreateLink(@CurrentUser('id') userId: string) {
    return this.service.getOrCreateLink(userId);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser('id') userId: string) {
    return this.service.getDashboard(userId);
  }

  @Get('conversions')
  getConversions(@CurrentUser('id') userId: string, @Query() query: PaginationDto) {
    return this.service.getConversions(userId, query);
  }

  @Get('admin')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  adminFindAll(@Query() query: PaginationDto) {
    return this.service.adminFindAll(query);
  }

  @Patch('admin/:id/rate')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  updateRate(@Param('id') id: string, @Body('commissionRate') rate: number) {
    return this.service.updateCommissionRate(id, rate);
  }
}
