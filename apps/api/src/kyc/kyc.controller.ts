import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { KycService } from './kyc.service';
import { SubmitKycDto, ReviewKycDto } from './dto/kyc.dto';
import { CurrentUser, Roles } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('KYC')
@ApiBearerAuth()
@Controller('kyc')
export class KycController {
  constructor(private readonly service: KycService) {}

  @Post('submit')
  submit(@CurrentUser('id') userId: string, @Body() dto: SubmitKycDto) {
    return this.service.submit(userId, dto);
  }

  @Get('status')
  getStatus(@CurrentUser('id') userId: string) {
    return this.service.getStatus(userId);
  }

  @Get('admin')
  @Roles('SUPER_ADMIN', 'KYC_REVIEWER')
  @ApiQuery({ name: 'status', required: false })
  adminFindAll(@Query() query: PaginationDto, @Query('status') status?: string) {
    return this.service.adminFindAll(query, status);
  }

  @Post(':id/review')
  @Roles('SUPER_ADMIN', 'KYC_REVIEWER')
  review(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: ReviewKycDto,
  ) {
    return this.service.review(id, reviewerId, dto);
  }
}
