import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators';
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
}
