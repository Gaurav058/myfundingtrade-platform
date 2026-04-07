import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(code: string, orderAmount?: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
    if (coupon.validFrom > new Date()) throw new BadRequestException('Coupon not yet valid');
    if (coupon.validUntil && coupon.validUntil < new Date()) throw new BadRequestException('Coupon expired');
    if (coupon.maxUsageCount && coupon.usageCount >= coupon.maxUsageCount) throw new BadRequestException('Coupon usage limit reached');
    if (coupon.minOrderAmount && orderAmount && orderAmount < Number(coupon.minOrderAmount)) {
      throw new BadRequestException(`Minimum order amount is $${coupon.minOrderAmount}`);
    }
    return { valid: true, type: coupon.type, value: coupon.value, code: coupon.code };
  }

  async findAll() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(data: any) {
    return this.prisma.coupon.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.coupon.update({ where: { id }, data });
  }
}
