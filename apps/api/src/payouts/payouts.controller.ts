import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PayoutsService } from './payouts.service';
import { RequestPayoutDto, ReviewPayoutDto } from './dto/payout.dto';
import { CurrentUser, Roles } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('Payouts')
@ApiBearerAuth()
@Controller('payouts')
export class PayoutsController {
  constructor(private readonly service: PayoutsService) {}

  @Post('request')
  requestPayout(@CurrentUser('id') userId: string, @Body() dto: RequestPayoutDto) {
    return this.service.requestPayout(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() query: PaginationDto) {
    return this.service.findAllForUser(userId, query);
  }

  @Get('admin')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  @ApiQuery({ name: 'status', required: false })
  adminFindAll(@Query() query: PaginationDto, @Query('status') status?: string) {
    return this.service.adminFindAll(query, status);
  }

  @Post(':id/review')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN')
  review(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: ReviewPayoutDto,
  ) {
    return this.service.review(id, reviewerId, dto);
  }
}
