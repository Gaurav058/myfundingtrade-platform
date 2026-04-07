import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChallengesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.challengePlan.findMany({
      where: { isActive: true },
      orderBy: { accountSize: 'asc' },
    });
  }

  async getUserChallenges(userId: string) {
    return this.prisma.challenge.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
