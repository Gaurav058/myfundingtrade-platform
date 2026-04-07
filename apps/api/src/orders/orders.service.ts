import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '../common/dto';
import * as crypto from 'crypto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateOrderDto, ip?: string, userAgent?: string) {
    const variant = await this.prisma.challengeVariant.findUnique({
      where: { id: dto.variantId },
      include: { plan: true },
    });
    if (!variant || !variant.isActive) throw new BadRequestException('Invalid or inactive variant');

    let coupon = null;
    let discountAmount = 0;
    if (dto.couponCode) {
      coupon = await this.prisma.coupon.findUnique({ where: { code: dto.couponCode } });
      if (!coupon || !coupon.isActive || (coupon.validUntil && coupon.validUntil < new Date())) {
        throw new BadRequestException('Invalid or expired coupon');
      }
      if (coupon.maxUsageCount && coupon.usageCount >= coupon.maxUsageCount) {
        throw new BadRequestException('Coupon usage limit reached');
      }
      discountAmount = coupon.type === 'PERCENTAGE'
        ? Number(variant.price) * Number(coupon.value) / 100
        : Number(coupon.value);
    }

    const subtotal = Number(variant.price);
    const totalAmount = Math.max(subtotal - discountAmount, 0);
    const orderNumber = `MFT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Affiliate attribution
    let affiliateId: string | undefined;
    if (dto.affiliateCode) {
      const affiliate = await this.prisma.affiliateAccount.findUnique({
        where: { affiliateCode: dto.affiliateCode },
      });
      if (affiliate && affiliate.status === 'ACTIVE' && affiliate.userId !== userId) {
        affiliateId = affiliate.id;
      }
    }

    const order = await this.prisma.order.create({
      data: {
        userId,
        variantId: variant.id,
        couponId: coupon?.id,
        affiliateId,
        orderNumber,
        status: 'PENDING_PAYMENT',
        subtotal,
        discountAmount,
        totalAmount,
        ipAddress: ip,
        userAgent,
      },
      include: { variant: { include: { plan: true } } },
    });

    if (coupon) {
      await this.prisma.coupon.update({ where: { id: coupon.id }, data: { usageCount: { increment: 1 } } });
    }

    return order;
  }

  async findAll(userId: string, query: PaginationDto) {
    const where = { userId };
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: { variant: { include: { plan: true } }, payments: true },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async findById(orderId: string, userId?: string) {
    const where: any = { id: orderId };
    if (userId) where.userId = userId;
    const order = await this.prisma.order.findFirst({
      where,
      include: { variant: { include: { plan: true, ruleSet: true } }, payments: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async adminFindAll(query: PaginationDto, status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
          variant: { include: { plan: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async cancelOrder(orderId: string, userId?: string) {
    const where: any = { id: orderId };
    if (userId) where.userId = userId;
    const order = await this.prisma.order.findFirst({ where });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING_PAYMENT' && order.status !== 'DRAFT') {
      throw new BadRequestException(`Cannot cancel order in ${order.status} state`);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
    });
  }
}
