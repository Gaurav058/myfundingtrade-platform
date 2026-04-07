import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, ReplyTicketDto, UpdateTicketStatusDto } from './dto/ticket.dto';
import { CurrentUser, Roles } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('Support Tickets')
@ApiBearerAuth()
@Controller('tickets')
export class TicketsController {
  constructor(private readonly service: TicketsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTicketDto) {
    return this.service.create(userId, dto);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() query: PaginationDto) {
    return this.service.findAllForUser(userId, query);
  }

  @Get('admin')
  @Roles('SUPER_ADMIN', 'SUPPORT_AGENT')
  @ApiQuery({ name: 'status', required: false })
  adminFindAll(@Query() query: PaginationDto, @Query('status') status?: string) {
    return this.service.adminFindAll(query, status);
  }

  @Get(':id')
  findById(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.findById(id, userId);
  }

  @Post(':id/reply')
  reply(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReplyTicketDto,
  ) {
    return this.service.reply(id, userId, false, dto);
  }

  @Post(':id/admin-reply')
  @Roles('SUPER_ADMIN', 'SUPPORT_AGENT')
  adminReply(
    @Param('id') id: string,
    @CurrentUser('id') agentId: string,
    @Body() dto: ReplyTicketDto,
  ) {
    return this.service.reply(id, agentId, true, dto);
  }

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'SUPPORT_AGENT')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.service.updateStatus(id, dto);
  }
}
