import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LegalService {
  constructor(private readonly prisma: PrismaService) {}

  async findByType(type: string) {
    const doc = await this.prisma.legalDocument.findFirst({
      where: { type: type as any, isActive: true },
      orderBy: { effectiveAt: 'desc' },
    });
    if (!doc) throw new NotFoundException('Legal document not found');
    return doc;
  }

  async findAll() {
    return this.prisma.legalDocument.findMany({
      where: { isActive: true },
      select: { id: true, title: true, type: true, version: true, effectiveAt: true, updatedAt: true },
      orderBy: { title: 'asc' },
    });
  }

  async create(data: { title: string; type: string; version: string; content: string; effectiveAt: string; isActive?: boolean }) {
    return this.prisma.legalDocument.create({
      data: {
        title: data.title,
        type: data.type as any,
        version: data.version,
        content: data.content,
        effectiveAt: new Date(data.effectiveAt),
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(id: string, data: { title?: string; content?: string; isActive?: boolean }) {
    const doc = await this.prisma.legalDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Legal document not found');
    return this.prisma.legalDocument.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.legalDocument.delete({ where: { id } });
  }

  async adminFindAll() {
    return this.prisma.legalDocument.findMany({
      orderBy: { title: 'asc' },
    });
  }
}
