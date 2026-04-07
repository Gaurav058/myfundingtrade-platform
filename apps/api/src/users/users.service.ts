import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto, filters?: { role?: string; status?: string }) {
    const where: any = { deletedAt: null };
    if (filters?.role) where.role = filters.role;
    if (filters?.status) where.status = filters.status;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: query.sortOrder || 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          profile: { select: { firstName: true, lastName: true, country: true, avatarUrl: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    const { passwordHash, twoFactorSecret, ...safe } = user;
    return safe;
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED') {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: { status } });
  }

  async softDelete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
