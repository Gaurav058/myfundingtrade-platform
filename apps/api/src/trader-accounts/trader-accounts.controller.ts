import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TraderAccountsService } from './trader-accounts.service';
import { CurrentUser, Roles } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('Trader Accounts')
@ApiBearerAuth()
@Controller('trader-accounts')
export class TraderAccountsController {
  constructor(private readonly service: TraderAccountsService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() query: PaginationDto) {
    return this.service.findAllForUser(userId, query);
  }

  @Get('admin')
  @Roles('SUPER_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_AGENT')
  @ApiQuery({ name: 'status', required: false })
  adminFindAll(@Query() query: PaginationDto, @Query('status') status?: string) {
    return this.service.adminFindAll(query, status);
  }

  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.findById(id, userId);
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.getStatus(id, userId);
  }
}
