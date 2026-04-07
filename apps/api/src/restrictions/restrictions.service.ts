import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto';

@Injectable()
export class RestrictionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRestrictedCountries() {
    return this.prisma.geoRestriction.findMany({
      where: { isActive: true, type: 'BLOCKED' },
      select: { countryCode: true, countryName: true, reason: true },
      orderBy: { countryName: 'asc' },
    });
  }

  async checkCountry(countryCode: string) {
    const restriction = await this.prisma.geoRestriction.findUnique({
      where: { countryCode },
    });
    return {
      countryCode,
      restricted: restriction?.isActive && restriction?.type === 'BLOCKED',
      reason: restriction?.reason,
    };
  }

  async adminFindAll(query: PaginationDto) {
    const [items, total] = await Promise.all([
      this.prisma.geoRestriction.findMany({
        skip: ((query.page || 1) - 1) * (query.pageSize || 50),
        take: query.pageSize || 50,
        orderBy: { countryName: 'asc' },
      }),
      this.prisma.geoRestriction.count(),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 50 };
  }

  async upsert(countryCode: string, data: { countryName: string; type?: string; isActive?: boolean; reason?: string }) {
    return this.prisma.geoRestriction.upsert({
      where: { countryCode },
      create: {
        countryCode,
        countryName: data.countryName,
        type: (data.type as any) || 'BLOCKED',
        isActive: data.isActive ?? true,
        reason: data.reason,
      },
      update: {
        countryName: data.countryName,
        type: data.type as any,
        isActive: data.isActive,
        reason: data.reason,
      },
    });
  }

  async remove(countryCode: string) {
    return this.prisma.geoRestriction.delete({ where: { countryCode } });
  }
}
