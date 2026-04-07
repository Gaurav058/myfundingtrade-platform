import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser, Roles } from '../common/decorators';
import { PaginationDto } from '../common/dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string, @Query() query: PaginationDto) {
    return this.service.findAllForUser(userId, query);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.markAsRead(id, userId);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.service.markAllAsRead(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.deleteNotification(id, userId);
  }

  // ── Admin endpoints ────────────────────────────────────────────────────

  @Get('admin/list')
  @Roles('SUPER_ADMIN', 'SUPPORT_ADMIN')
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  adminFindAll(
    @Query() query: PaginationDto,
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.service.adminFindAll({ ...query, userId, type, status });
  }

  @Get('admin/stats')
  @Roles('SUPER_ADMIN', 'SUPPORT_ADMIN')
  adminStats() {
    return this.service.adminGetStats();
  }
}
