import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto';

@Injectable()
export class TraderAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForUser(userId: string, query: PaginationDto) {
    const where = { userId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.traderAccount.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          variant: { include: { plan: true } },
          phases: { orderBy: { phase: 'asc' } },
        },
      }),
      this.prisma.traderAccount.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async findById(id: string, userId?: string) {
    const where: any = { id, deletedAt: null };
    if (userId) where.userId = userId;
    const account = await this.prisma.traderAccount.findFirst({
      where,
      include: {
        variant: { include: { plan: true, ruleSet: true } },
        phases: { include: { evaluationResult: true }, orderBy: { phase: 'asc' } },
      },
    });
    if (!account) throw new NotFoundException('Trader account not found');
    return account;
  }

  async getStatus(id: string, userId?: string) {
    const account = await this.findById(id, userId);
    const currentPhase = account.phases.find((p) => p.phase === account.currentPhase);
    return {
      id: account.id,
      accountNumber: account.accountNumber,
      status: account.status,
      currentPhase: account.currentPhase,
      currentBalance: account.currentBalance,
      currentEquity: account.currentEquity,
      highWaterMark: account.highWaterMark,
      phaseStats: currentPhase
        ? {
            tradingDays: currentPhase.tradingDays,
            totalTrades: currentPhase.totalTrades,
            winningTrades: currentPhase.winningTrades,
            losingTrades: currentPhase.losingTrades,
            profitLoss: currentPhase.profitLoss,
          }
        : null,
    };
  }

  async adminFindAll(query: PaginationDto, status?: string) {
    const where: any = { deletedAt: null };
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      this.prisma.traderAccount.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
          variant: { include: { plan: true } },
        },
      }),
      this.prisma.traderAccount.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }
}
