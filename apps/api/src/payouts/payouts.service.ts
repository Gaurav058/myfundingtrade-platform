import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestPayoutDto, ReviewPayoutDto } from './dto/payout.dto';
import { PaginationDto } from '../common/dto';

@Injectable()
export class PayoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async requestPayout(userId: string, dto: RequestPayoutDto) {
    const account = await this.prisma.traderAccount.findFirst({
      where: { id: dto.traderAccountId, userId, deletedAt: null },
    });
    if (!account) throw new NotFoundException('Trader account not found');
    if (account.status !== 'FUNDED') {
      throw new BadRequestException('Payouts are only available for funded accounts');
    }

    const pendingPayout = await this.prisma.payoutRequest.findFirst({
      where: { traderAccountId: account.id, status: 'DRAFT' },
    });
    if (pendingPayout) {
      throw new BadRequestException('A payout request is already pending');
    }

    const requestNumber = `PR-${Date.now().toString(36).toUpperCase()}`;
    return this.prisma.payoutRequest.create({
      data: {
        userId,
        traderAccountId: account.id,
        requestNumber,
        amount: dto.requestedAmount,
        profitSplit: 80,
        traderShare: dto.requestedAmount * 0.8,
        companyShare: dto.requestedAmount * 0.2,
        status: 'DRAFT',
      },
    });
  }

  async findAllForUser(userId: string, query: PaginationDto) {
    const where = { userId };
    const [items, total] = await Promise.all([
      this.prisma.payoutRequest.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: { traderAccount: { select: { accountNumber: true } } },
      }),
      this.prisma.payoutRequest.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async adminFindAll(query: PaginationDto, status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      this.prisma.payoutRequest.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
          traderAccount: { select: { accountNumber: true } },
        },
      }),
      this.prisma.payoutRequest.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async review(id: string, reviewerId: string, dto: ReviewPayoutDto) {
    const payout = await this.prisma.payoutRequest.findUnique({ where: { id } });
    if (!payout) throw new NotFoundException('Payout request not found');
    if (payout.status !== 'DRAFT' && payout.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Payout is not pending review');
    }

    return this.prisma.payoutRequest.update({
      where: { id },
      data: {
        status: dto.decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
        rejectionReason: dto.decision === 'REJECTED' ? dto.rejectionReason : null,
        reviewedBy: reviewerId,
        transactionRef: dto.transactionRef,
        processedAt: dto.decision === 'APPROVED' ? new Date() : undefined,
      },
    });
  }
}
