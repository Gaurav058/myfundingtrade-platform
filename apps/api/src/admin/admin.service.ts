import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalOrders,
      pendingOrders,
      totalRevenue,
      activeAccounts,
      pendingKyc,
      openTickets,
      pendingPayouts,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: 'PENDING_PAYMENT' } }),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
      this.prisma.traderAccount.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.kycSubmission.count({ where: { status: 'UNDER_REVIEW' } }),
      this.prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      this.prisma.payoutRequest.count({ where: { status: 'PENDING_APPROVAL' } }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers },
      orders: { total: totalOrders, pending: pendingOrders },
      revenue: totalRevenue._sum.amount || 0,
      accounts: { active: activeAccounts },
      pendingKyc,
      openTickets,
      pendingPayouts,
    };
  }

  async getRecentActivity(limit = 20) {
    const [recentOrders, recentUsers, recentTickets] = await Promise.all([
      this.prisma.order.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, orderNumber: true, status: true, totalAmount: true, createdAt: true,
          user: { select: { email: true } },
        },
      }),
      this.prisma.user.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, role: true, status: true, createdAt: true },
      }),
      this.prisma.supportTicket.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, ticketNumber: true, subject: true, status: true, createdAt: true },
      }),
    ]);

    return { recentOrders, recentUsers, recentTickets };
  }
}
