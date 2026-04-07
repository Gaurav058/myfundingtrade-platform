import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLegalDocumentDto, UpdateLegalDocumentDto } from './dto/legal.dto';

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

  async create(dto: CreateLegalDocumentDto) {
    return this.prisma.legalDocument.create({
      data: {
        title: dto.title,
        type: dto.type as any,
        version: dto.version,
        content: dto.content,
        effectiveAt: new Date(dto.effectiveAt),
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateLegalDocumentDto) {
    const doc = await this.prisma.legalDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException('Legal document not found');
    const data: any = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.effectiveAt !== undefined) data.effectiveAt = new Date(dto.effectiveAt);
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
