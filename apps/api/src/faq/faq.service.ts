import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublished(category?: string) {
    const where: any = { isPublished: true };
    if (category) where.category = category;
    return this.prisma.fAQItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getCategories() {
    const faqs = await this.prisma.fAQItem.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ['category'],
    });
    return faqs.map((f) => f.category).filter(Boolean);
  }

  async create(data: { question: string; answer: string; category?: string; sortOrder?: number; isPublished?: boolean }) {
    return this.prisma.fAQItem.create({ data });
  }

  async update(id: string, data: { question?: string; answer?: string; category?: string; sortOrder?: number; isPublished?: boolean }) {
    const faq = await this.prisma.fAQItem.findUnique({ where: { id } });
    if (!faq) throw new NotFoundException('FAQ not found');
    return this.prisma.fAQItem.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.fAQItem.delete({ where: { id } });
  }

  async adminFindAll(query: PaginationDto) {
    const [items, total] = await Promise.all([
      this.prisma.fAQItem.findMany({
        skip: ((query.page || 1) - 1) * (query.pageSize || 50),
        take: query.pageSize || 50,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.fAQItem.count(),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 50 };
  }
}
