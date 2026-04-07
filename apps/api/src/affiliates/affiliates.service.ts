import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto';
import {
  TrackClickDto,
  RequestCommissionPayoutDto,
  UpdateAffiliateStatusDto,
  UpdateCommissionRateDto,
  ReviewConversionDto,
  ReviewCommissionPayoutDto,
} from './dto';
import * as crypto from 'crypto';

const ATTRIBUTION_WINDOW_DAYS = 30;
const MAX_CLICKS_PER_IP_PER_DAY = 10;
const DEFAULT_COMMISSION_RATE = 10;
const PAYOUT_COOLDOWN_DAYS = 30;

@Injectable()
export class AffiliatesService {
  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════════════
  //  CLICK TRACKING
  // ═══════════════════════════════════════════════════════════════════════

  async trackClick(dto: TrackClickDto, ip: string, userAgent?: string) {
    const affiliate = await this.prisma.affiliateAccount.findUnique({
      where: { affiliateCode: dto.code },
    });
    if (!affiliate || affiliate.status !== 'ACTIVE') {
      throw new NotFoundException('Affiliate not found or inactive');
    }

    const click = await this.prisma.affiliateClick.create({
      data: {
        affiliateId: affiliate.id,
        ipAddress: ip,
        userAgent: userAgent?.slice(0, 500),
        referrerUrl: dto.referrerUrl?.slice(0, 1000),
        landingUrl: dto.landingUrl?.slice(0, 1000),
        utmSource: dto.utmSource?.slice(0, 100),
        utmMedium: dto.utmMedium?.slice(0, 100),
        utmCampaign: dto.utmCampaign?.slice(0, 100),
        fingerprint: dto.fingerprint?.slice(0, 255),
      },
    });

    return {
      affiliateId: affiliate.id,
      affiliateCode: affiliate.affiliateCode,
      clickId: click.id,
      attributionWindowDays: ATTRIBUTION_WINDOW_DAYS,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  ENROLLMENT
  // ═══════════════════════════════════════════════════════════════════════

  async getOrCreateLink(userId: string) {
    let affiliate = await this.prisma.affiliateAccount.findUnique({ where: { userId } });
    if (!affiliate) {
      affiliate = await this.prisma.affiliateAccount.create({
        data: {
          userId,
          affiliateCode: crypto.randomBytes(6).toString('hex').toUpperCase().slice(0, 12),
          commissionRate: DEFAULT_COMMISSION_RATE,
          status: 'PENDING',
        },
      });
    }
    return affiliate;
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  AFFILIATE LOOKUP
  // ═══════════════════════════════════════════════════════════════════════

  async findByCode(code: string) {
    return this.prisma.affiliateAccount.findUnique({
      where: { affiliateCode: code },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  CONVERSION ATTRIBUTION (called when order is paid)
  // ═══════════════════════════════════════════════════════════════════════

  async attributeConversion(orderId: string, orderAmount: number, affiliateId: string, buyerUserId: string) {
    const affiliate = await this.prisma.affiliateAccount.findUnique({
      where: { id: affiliateId },
    });
    if (!affiliate) return;
    if (affiliate.status !== 'ACTIVE') return;

    // Anti-fraud: self-referral detection
    if (affiliate.userId === buyerUserId) return;

    // Prevent duplicate conversion for same order
    const existing = await this.prisma.affiliateConversion.findUnique({
      where: { orderId },
    });
    if (existing) return;

    // Check attribution window — find if there was a click within the window
    const windowStart = new Date(Date.now() - ATTRIBUTION_WINDOW_DAYS * 86_400_000);
    const hasRecentClick = await this.prisma.affiliateClick.count({
      where: {
        affiliateId: affiliate.id,
        createdAt: { gte: windowStart },
      },
    });
    // Attribution proceeds even without a click (direct code usage is valid)

    const rate = Number(affiliate.commissionRate);
    const commissionAmount = Math.round(orderAmount * rate / 100 * 100) / 100;

    await this.prisma.$transaction([
      this.prisma.affiliateConversion.create({
        data: {
          affiliateId: affiliate.id,
          orderId,
          orderAmount,
          commissionRate: rate,
          commissionAmount,
          status: 'PENDING',
        },
      }),
      this.prisma.affiliateAccount.update({
        where: { id: affiliate.id },
        data: {
          totalEarnings: { increment: commissionAmount },
          pendingBalance: { increment: commissionAmount },
        },
      }),
    ]);
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  AFFILIATE DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════

  async getDashboard(userId: string) {
    const affiliate = await this.prisma.affiliateAccount.findUnique({ where: { userId } });
    if (!affiliate) throw new NotFoundException('No affiliate account found');

    const [totalConversions, pendingConversions, clickCount, recentClicks] = await Promise.all([
      this.prisma.affiliateConversion.aggregate({
        where: { affiliateId: affiliate.id },
        _sum: { commissionAmount: true },
        _count: { id: true },
      }),
      this.prisma.affiliateConversion.aggregate({
        where: { affiliateId: affiliate.id, status: 'PENDING' },
        _sum: { commissionAmount: true },
        _count: { id: true },
      }),
      this.prisma.affiliateClick.count({
        where: { affiliateId: affiliate.id },
      }),
      this.prisma.affiliateClick.count({
        where: {
          affiliateId: affiliate.id,
          createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) },
        },
      }),
    ]);

    return {
      affiliate,
      totalConversions: totalConversions._count.id,
      totalEarnings: totalConversions._sum.commissionAmount || 0,
      pendingConversions: pendingConversions._count.id,
      pendingAmount: pendingConversions._sum.commissionAmount || 0,
      totalClicks: clickCount,
      clicksLast30Days: recentClicks,
    };
  }

  async getClicks(userId: string, query: PaginationDto) {
    const affiliate = await this.prisma.affiliateAccount.findUnique({ where: { userId } });
    if (!affiliate) throw new NotFoundException('No affiliate account found');

    const where = { affiliateId: affiliate.id };
    const [items, total] = await Promise.all([
      this.prisma.affiliateClick.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.affiliateClick.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
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

  // ═══════════════════════════════════════════════════════════════════════
  //  COMMISSION PAYOUT REQUESTS
  // ═══════════════════════════════════════════════════════════════════════

  async requestCommissionPayout(userId: string, dto: RequestCommissionPayoutDto) {
    const affiliate = await this.prisma.affiliateAccount.findUnique({ where: { userId } });
    if (!affiliate) throw new NotFoundException('No affiliate account found');
    if (affiliate.status !== 'ACTIVE') throw new ForbiddenException('Affiliate account must be active');

    if (Number(affiliate.pendingBalance) <= 0) {
      throw new BadRequestException('No pending balance to pay out');
    }

    // Check cooldown
    const lastPayout = await this.prisma.commissionPayout.findFirst({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: 'desc' },
    });
    if (lastPayout) {
      const daysSinceLast = Math.floor(
        (Date.now() - lastPayout.createdAt.getTime()) / 86_400_000,
      );
      if (daysSinceLast < PAYOUT_COOLDOWN_DAYS) {
        throw new BadRequestException(
          `Next payout available in ${PAYOUT_COOLDOWN_DAYS - daysSinceLast} day(s)`,
        );
      }
    }

    // Check confirmed conversions
    const confirmedCount = await this.prisma.affiliateConversion.count({
      where: { affiliateId: affiliate.id, status: 'CONFIRMED' },
    });
    if (confirmedCount < 1) {
      throw new BadRequestException('Need at least 1 confirmed conversion before requesting payout');
    }

    return this.prisma.commissionPayout.create({
      data: {
        affiliateId: affiliate.id,
        amount: affiliate.pendingBalance,
        currency: 'USD',
        status: 'PENDING',
        payoutMethod: dto.payoutMethod,
        note: dto.note,
      },
    });
  }

  async getPayoutHistory(userId: string, query: PaginationDto) {
    const affiliate = await this.prisma.affiliateAccount.findUnique({ where: { userId } });
    if (!affiliate) throw new NotFoundException('No affiliate account found');

    const where = { affiliateId: affiliate.id };
    const [items, total] = await Promise.all([
      this.prisma.commissionPayout.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.commissionPayout.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  ADMIN — AFFILIATES
  // ═══════════════════════════════════════════════════════════════════════

  async adminFindAll(query: PaginationDto, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.affiliateAccount.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
          _count: { select: { conversions: true, clicks: true } },
        },
      }),
      this.prisma.affiliateAccount.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async adminFindById(id: string) {
    const affiliate = await this.prisma.affiliateAccount.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
        _count: { select: { conversions: true, clicks: true, commissionPayouts: true } },
      },
    });
    if (!affiliate) throw new NotFoundException('Affiliate not found');

    const fraudSignals = await this.detectFraudSignals(id);

    return { affiliate, fraudSignals };
  }

  async adminUpdateStatus(id: string, dto: UpdateAffiliateStatusDto) {
    const affiliate = await this.prisma.affiliateAccount.findUnique({ where: { id } });
    if (!affiliate) throw new NotFoundException('Affiliate not found');

    const data: any = { status: dto.status };
    if (dto.status === 'ACTIVE' && !affiliate.approvedAt) {
      data.approvedAt = new Date();
    }
    if (dto.status === 'SUSPENDED') {
      data.suspendedAt = new Date();
    }

    return this.prisma.affiliateAccount.update({ where: { id }, data });
  }

  async updateCommissionRate(id: string, rate: number) {
    return this.prisma.affiliateAccount.update({
      where: { id },
      data: { commissionRate: rate },
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  ADMIN — CONVERSIONS
  // ═══════════════════════════════════════════════════════════════════════

  async adminGetConversions(query: PaginationDto, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.affiliateConversion.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          affiliate: { select: { affiliateCode: true, userId: true } },
          order: { select: { orderNumber: true, userId: true, status: true } },
        },
      }),
      this.prisma.affiliateConversion.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async adminReviewConversion(id: string, dto: ReviewConversionDto) {
    const conversion = await this.prisma.affiliateConversion.findUnique({ where: { id } });
    if (!conversion) throw new NotFoundException('Conversion not found');
    if (conversion.status !== 'PENDING') {
      throw new BadRequestException(`Conversion is already ${conversion.status}`);
    }

    if (dto.decision === 'CONFIRMED') {
      return this.prisma.affiliateConversion.update({
        where: { id },
        data: { status: 'CONFIRMED', confirmedAt: new Date() },
      });
    }

    // Rejected — reverse the pending balance
    const commAmount = Number(conversion.commissionAmount);
    await this.prisma.$transaction([
      this.prisma.affiliateConversion.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectedReason: dto.reason,
          rejectedAt: new Date(),
        },
      }),
      this.prisma.affiliateAccount.update({
        where: { id: conversion.affiliateId },
        data: {
          totalEarnings: { decrement: commAmount },
          pendingBalance: { decrement: commAmount },
        },
      }),
    ]);

    return this.prisma.affiliateConversion.findUnique({ where: { id } });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  ADMIN — COMMISSION PAYOUTS
  // ═══════════════════════════════════════════════════════════════════════

  async adminGetPayouts(query: PaginationDto, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.commissionPayout.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          affiliate: { select: { affiliateCode: true, userId: true, user: { select: { email: true } } } },
        },
      }),
      this.prisma.commissionPayout.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async adminReviewPayout(id: string, dto: ReviewCommissionPayoutDto) {
    const payout = await this.prisma.commissionPayout.findUnique({
      where: { id },
      include: { affiliate: true },
    });
    if (!payout) throw new NotFoundException('Commission payout not found');

    const data: any = {
      status: dto.decision,
      note: dto.note,
      transactionRef: dto.transactionRef,
    };

    if (dto.decision === 'COMPLETED') {
      data.processedAt = new Date();
      // Mark conversions as PAID and update affiliate balances
      const payoutAmount = Number(payout.amount);
      await this.prisma.$transaction([
        this.prisma.commissionPayout.update({ where: { id }, data }),
        this.prisma.affiliateAccount.update({
          where: { id: payout.affiliateId },
          data: {
            pendingBalance: { decrement: payoutAmount },
            totalPaid: { increment: payoutAmount },
          },
        }),
        // Mark confirmed conversions as PAID up to the payout amount
        this.prisma.affiliateConversion.updateMany({
          where: { affiliateId: payout.affiliateId, status: 'CONFIRMED' },
          data: { status: 'PAID' },
        }),
      ]);
      return this.prisma.commissionPayout.findUnique({ where: { id } });
    }

    if (dto.decision === 'REJECTED') {
      data.note = dto.note || 'Rejected by admin';
    }

    return this.prisma.commissionPayout.update({ where: { id }, data });
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  ADMIN — FRAUD DETECTION
  // ═══════════════════════════════════════════════════════════════════════

  async adminGetFraudSignals(affiliateId?: string) {
    if (affiliateId) {
      return this.detectFraudSignals(affiliateId);
    }
    // Get signals for all active affiliates
    const affiliates = await this.prisma.affiliateAccount.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, affiliateCode: true, userId: true },
    });

    const results = [];
    for (const aff of affiliates) {
      const signals = await this.detectFraudSignals(aff.id);
      if (signals.length > 0) {
        results.push({ affiliateId: aff.id, affiliateCode: aff.affiliateCode, signals });
      }
    }
    return results;
  }

  private async detectFraudSignals(affiliateId: string): Promise<Array<{ type: string; severity: string; detail: string }>> {
    const signals: Array<{ type: string; severity: string; detail: string }> = [];
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 86_400_000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);

    // 1. Self-referral detection: check if any conversion buyer is the affiliate owner
    const affiliate = await this.prisma.affiliateAccount.findUnique({
      where: { id: affiliateId },
      select: { userId: true },
    });
    if (affiliate) {
      const selfReferrals = await this.prisma.affiliateConversion.count({
        where: {
          affiliateId,
          order: { userId: affiliate.userId },
        },
      });
      if (selfReferrals > 0) {
        signals.push({
          type: 'SELF_REFERRAL',
          severity: 'HIGH',
          detail: `${selfReferrals} conversion(s) where buyer is the affiliate owner`,
        });
      }
    }

    // 2. Repeated IP anomalies: same IP clicking many times
    const ipCounts = await this.prisma.affiliateClick.groupBy({
      by: ['ipAddress'],
      where: { affiliateId, createdAt: { gte: oneDayAgo } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });
    const suspiciousIps = ipCounts.filter((r) => r._count.id > MAX_CLICKS_PER_IP_PER_DAY);
    if (suspiciousIps.length > 0) {
      signals.push({
        type: 'REPEATED_IP',
        severity: 'MEDIUM',
        detail: `${suspiciousIps.length} IP(s) with >${MAX_CLICKS_PER_IP_PER_DAY} clicks today: ${suspiciousIps.map((r) => `${r.ipAddress} (${r._count.id}x)`).join(', ')}`,
      });
    }

    // 3. Device/fingerprint anomalies
    const fingerprintCounts = await this.prisma.affiliateClick.groupBy({
      by: ['fingerprint'],
      where: {
        affiliateId,
        fingerprint: { not: null },
        createdAt: { gte: oneDayAgo },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });
    const suspiciousFingerprints = fingerprintCounts.filter((r) => r._count.id > MAX_CLICKS_PER_IP_PER_DAY);
    if (suspiciousFingerprints.length > 0) {
      signals.push({
        type: 'REPEATED_DEVICE',
        severity: 'MEDIUM',
        detail: `${suspiciousFingerprints.length} device(s) with repeated clicks today`,
      });
    }

    // 4. Click spike: compare last 7d avg to last 24h
    const [clicksLast7d, clicksLast24h] = await Promise.all([
      this.prisma.affiliateClick.count({
        where: { affiliateId, createdAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.affiliateClick.count({
        where: { affiliateId, createdAt: { gte: oneDayAgo } },
      }),
    ]);
    const dailyAvg7d = clicksLast7d / 7;
    if (dailyAvg7d > 0 && clicksLast24h > dailyAvg7d * 3) {
      signals.push({
        type: 'CLICK_SPIKE',
        severity: 'MEDIUM',
        detail: `${clicksLast24h} clicks in last 24h vs 7-day avg of ${dailyAvg7d.toFixed(1)}/day (${(clicksLast24h / dailyAvg7d).toFixed(1)}x normal)`,
      });
    }

    // 5. Low conversion rate: many clicks, few conversions (potential click fraud)
    const clicksLast30d = await this.prisma.affiliateClick.count({
      where: { affiliateId, createdAt: { gte: thirtyDaysAgo } },
    });
    const conversionsLast30d = await this.prisma.affiliateConversion.count({
      where: { affiliateId, createdAt: { gte: thirtyDaysAgo } },
    });
    if (clicksLast30d > 100 && conversionsLast30d === 0) {
      signals.push({
        type: 'ZERO_CONVERSION',
        severity: 'LOW',
        detail: `${clicksLast30d} clicks in 30 days with 0 conversions`,
      });
    }

    return signals;
  }
}
