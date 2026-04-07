import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChallengePlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPlans(activeOnly = true) {
    return this.prisma.challengePlan.findMany({
      where: activeOnly ? { isActive: true, deletedAt: null } : { deletedAt: null },
      include: {
        variants: {
          where: activeOnly ? { isActive: true, deletedAt: null } : { deletedAt: null },
          include: { ruleSet: true },
          orderBy: { accountSize: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findPlanBySlug(slug: string) {
    return this.prisma.challengePlan.findUnique({
      where: { slug },
      include: {
        variants: {
          where: { isActive: true, deletedAt: null },
          include: { ruleSet: true },
          orderBy: { accountSize: 'asc' },
        },
      },
    });
  }

  async findVariantById(id: string) {
    return this.prisma.challengeVariant.findUnique({
      where: { id },
      include: { plan: true, ruleSet: true },
    });
  }
}
