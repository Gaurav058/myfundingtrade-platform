import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AffiliatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateLink(userId: string) {
    let affiliate = await this.prisma.affiliateAccount.findUnique({ where: { userId } });
    if (!affiliate) {
      affiliate = await this.prisma.affiliateAccount.create({
        data: {
          userId,
          affiliateCode: uuid().replace(/-/g, '').slice(0, 12).toUpperCase(),
          commissionRate: 10,
          status: 'PENDING',
        },
      });
    }
    return affiliate;
  }

  async getDashboard(userId: string) {
    const affiliate = await this.prisma.affiliateAccount.findUnique({ where: { userId } });
    if (!affiliate) throw new NotFoundException('No affiliate account found');

    const conversions = await this.prisma.affiliateConversion.aggregate({
      where: { affiliateId: affiliate.id },
      _sum: { commissionAmount: true },
      _count: { id: true },
    });

    const pendingPayouts = await this.prisma.affiliateConversion.aggregate({
      where: { affiliateId: affiliate.id, status: 'PENDING' },
      _sum: { commissionAmount: true },
      _count: { id: true },
    });

    return {
      affiliate,
      totalConversions: conversions._count.id,
      totalEarnings: conversions._sum.commissionAmount || 0,
      pendingPayouts: pendingPayouts._count.id,
      pendingAmount: pendingPayouts._sum.commissionAmount || 0,
    };
  }

  async getConversions(userId: string, query: PaginationDto) {
    const affiliate = await this.prisma.affiliateAccount.findUnique({ where: { userId } });
    if (!affiliate) throw new NotFoundException('No affiliate account found');

    const where = { affiliateId: affiliate.id };
    const [items, total] = await Promise.all([
      this.prisma.affiliateConversion.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.affiliateConversion.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async adminFindAll(query: PaginationDto) {
    const [items, total] = await Promise.all([
      this.prisma.affiliateAccount.findMany({
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
          _count: { select: { conversions: true } },
        },
      }),
      this.prisma.affiliateAccount.count(),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async updateCommissionRate(id: string, rate: number) {
    return this.prisma.affiliateAccount.update({
      where: { id },
      data: { commissionRate: rate },
    });
  }
}
