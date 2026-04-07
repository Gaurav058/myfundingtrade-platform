import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLegalDocumentDto, UpdateLegalDocumentDto } from './dto/legal.dto';

@Injectable()
export class LegalService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Public document queries ────────────────────────────────────────────

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

  // ── Consent recording ──────────────────────────────────────────────────

  async recordConsent(userId: string, documentId: string, ipAddress: string, userAgent: string) {
    const doc = await this.prisma.legalDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Legal document not found');
    if (!doc.isActive) throw new NotFoundException('Legal document is no longer active');

    // Upsert: if user already consented to this exact document, update timestamp
    return this.prisma.legalConsent.upsert({
      where: { userId_documentId: { userId, documentId } },
      create: {
        userId,
        documentId,
        ipAddress: ipAddress.slice(0, 45),
        userAgent: userAgent.slice(0, 500),
      },
      update: {
        ipAddress: ipAddress.slice(0, 45),
        userAgent: userAgent.slice(0, 500),
        consentedAt: new Date(),
      },
    });
  }

  async recordBulkConsent(userId: string, documentIds: string[], ipAddress: string, userAgent: string) {
    const results = [];
    for (const documentId of documentIds) {
      const consent = await this.recordConsent(userId, documentId, ipAddress, userAgent);
      results.push(consent);
    }
    return results;
  }

  async getUserConsents(userId: string) {
    return this.prisma.legalConsent.findMany({
      where: { userId },
      include: {
        document: {
          select: { id: true, type: true, title: true, version: true, effectiveAt: true },
        },
      },
      orderBy: { consentedAt: 'desc' },
    });
  }

  async getPendingConsents(userId: string) {
    const activeDocuments = await this.prisma.legalDocument.findMany({
      where: { isActive: true },
      orderBy: { title: 'asc' },
    });

    const existingConsents = await this.prisma.legalConsent.findMany({
      where: { userId },
      select: { documentId: true },
    });

    const consentedIds = new Set(existingConsents.map((c) => c.documentId));
    return activeDocuments.filter((doc) => !consentedIds.has(doc.id));
  }

  // ── Cookie consent (public, no auth required) ──────────────────────────

  async recordCookieConsent(data: {
    userId?: string;
    sessionId: string;
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
    ipAddress: string;
    userAgent: string;
  }) {
    // Store as a platform restriction metadata entry for audit trail
    // This uses a dedicated Prisma model-less approach via raw JSONB
    // stored in the notification table pattern — OR we use a simple
    // cookie_policy consent on the legal_consents table for logged-in users.
    // For anonymous users, the preference is only stored client-side.

    if (data.userId) {
      // Find the active COOKIE_POLICY document
      const cookieDoc = await this.prisma.legalDocument.findFirst({
        where: { type: 'COOKIE_POLICY', isActive: true },
        orderBy: { effectiveAt: 'desc' },
      });

      if (cookieDoc) {
        await this.prisma.legalConsent.upsert({
          where: { userId_documentId: { userId: data.userId, documentId: cookieDoc.id } },
          create: {
            userId: data.userId,
            documentId: cookieDoc.id,
            ipAddress: data.ipAddress.slice(0, 45),
            userAgent: data.userAgent.slice(0, 500),
          },
          update: {
            ipAddress: data.ipAddress.slice(0, 45),
            userAgent: data.userAgent.slice(0, 500),
            consentedAt: new Date(),
          },
        });
      }
    }

    return {
      recorded: true,
      preferences: {
        essential: true, // always true
        analytics: data.analytics,
        marketing: data.marketing,
      },
    };
  }

  // ── Admin CRUD ─────────────────────────────────────────────────────────

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

  async adminGetConsentAudit(query: { page?: number; pageSize?: number; userId?: string; documentType?: string }) {
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.documentType) {
      where.document = { type: query.documentType };
    }

    const [items, total] = await Promise.all([
      this.prisma.legalConsent.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { consentedAt: 'desc' },
        include: {
          user: { select: { id: true, email: true } },
          document: { select: { type: true, title: true, version: true } },
        },
      }),
      this.prisma.legalConsent.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }
}
