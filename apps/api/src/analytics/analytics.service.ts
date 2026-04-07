import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getRevenueStats(startDate?: string, endDate?: string) {
    const where: any = { status: 'COMPLETED' };
    if (startDate || endDate) {
      where.completedAt = {};
      if (startDate) where.completedAt.gte = new Date(startDate);
      if (endDate) where.completedAt.lte = new Date(endDate);
    }

    const [total, byMonth] = await Promise.all([
      this.prisma.payment.aggregate({ where, _sum: { amount: true }, _count: { id: true } }),
      this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', completed_at) as month,
          SUM(amount) as revenue,
          COUNT(*)::int as count
        FROM payments
        WHERE status = 'COMPLETED'
          AND completed_at IS NOT NULL
        GROUP BY DATE_TRUNC('month', completed_at)
        ORDER BY month DESC
        LIMIT 12
      ` as any,
    ]);

    return {
      totalRevenue: total._sum.amount || 0,
      totalTransactions: total._count.id,
      monthly: byMonth,
    };
  }

  async getUserGrowth() {
    const growth = await this.prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*)::int as new_users
      FROM users
      WHERE deleted_at IS NULL
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    ` as any;
    return growth;
  }

  async getChallengeStats() {
    const [statusDistribution, passRates] = await Promise.all([
      this.prisma.traderAccount.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { deletedAt: null },
      }),
      this.prisma.$queryRaw`
        SELECT 
          cp.name as plan_name,
          COUNT(ta.id)::int as total,
          COUNT(CASE WHEN ta.status = 'FUNDED' THEN 1 END)::int as passed,
          COUNT(CASE WHEN ta.status = 'FAILED' THEN 1 END)::int as failed
        FROM trader_accounts ta
        JOIN challenge_plan_variants cpv ON ta.variant_id = cpv.id
        JOIN challenge_plans cp ON cpv.plan_id = cp.id
        WHERE ta.deleted_at IS NULL
        GROUP BY cp.name
      ` as any,
    ]);

    return { statusDistribution, passRates };
  }

  async getPayoutStats() {
    const stats = await this.prisma.payoutRequest.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { amount: true, traderShare: true },
    });
    return stats;
  }
}
