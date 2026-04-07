import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RulesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.challengeRuleSet.findMany({ orderBy: { name: 'asc' } });
  }

  async findById(id: string) {
    const rule = await this.prisma.challengeRuleSet.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Rule set not found');
    return rule;
  }

  async create(data: any) {
    return this.prisma.challengeRuleSet.create({ data });
  }

  async update(id: string, data: any) {
    await this.findById(id);
    return this.prisma.challengeRuleSet.update({ where: { id }, data });
  }
}
