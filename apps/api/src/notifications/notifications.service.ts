import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string, query: PaginationDto) {
    const where = { userId };
    const [items, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);
    return {
      items,
      total,
      unread,
      page: query.page || 1,
      pageSize: query.pageSize || 20,
    };
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async create(userId: string, type: string, title: string, body: string, metadata?: any) {
    return this.prisma.notification.create({
      data: { userId, type: type as any, channel: 'system', title, body, metadata },
    });
  }
}
