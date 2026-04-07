import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(email: string) {
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    if (existing) {
      if (existing.isConfirmed && !existing.unsubscribedAt) throw new ConflictException('Already subscribed');
      return this.prisma.newsletterSubscriber.update({
        where: { email },
        data: { isConfirmed: true, confirmedAt: new Date(), unsubscribedAt: null },
      });
    }
    return this.prisma.newsletterSubscriber.create({
      data: { email, isConfirmed: true, confirmedAt: new Date() },
    });
  }

  async unsubscribe(email: string) {
    return this.prisma.newsletterSubscriber.updateMany({
      where: { email },
      data: { unsubscribedAt: new Date() },
    });
  }

  async adminFindAll(query: PaginationDto, activeOnly?: boolean) {
    const where: any = {};
    if (activeOnly) {
      where.isConfirmed = true;
      where.unsubscribedAt = null;
    }
    const [items, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 50),
        take: query.pageSize || 50,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.newsletterSubscriber.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 50 };
  }
}
