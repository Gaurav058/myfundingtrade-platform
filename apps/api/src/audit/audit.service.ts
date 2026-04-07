import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: {
    performerId: string;
    action: string;
    resource: string;
    resourceId?: string;
    targetUserId?: string;
    before?: any;
    after?: any;
    ipAddress: string;
    userAgent?: string;
    metadata?: any;
  }) {
    return this.prisma.adminActionLog.create({ data: data as any });
  }

  async findAll(query: PaginationDto, filters?: { performerId?: string; action?: string; resource?: string }) {
    const where: any = {};
    if (filters?.performerId) where.performerId = filters.performerId;
    if (filters?.action) where.action = filters.action;
    if (filters?.resource) where.resource = filters.resource;

    const [items, total] = await Promise.all([
      this.prisma.adminActionLog.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 50),
        take: query.pageSize || 50,
        orderBy: { createdAt: 'desc' },
        include: {
          performer: { select: { id: true, email: true } },
        },
      }),
      this.prisma.adminActionLog.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 50 };
  }

  async getActions() {
    const actions = await this.prisma.adminActionLog.findMany({
      select: { action: true },
      distinct: ['action'],
      orderBy: { action: 'asc' },
    });
    return actions.map((a) => a.action);
  }

  async getResources() {
    const resources = await this.prisma.adminActionLog.findMany({
      select: { resource: true },
      distinct: ['resource'],
      orderBy: { resource: 'asc' },
    });
    return resources.map((r) => r.resource);
  }
}
