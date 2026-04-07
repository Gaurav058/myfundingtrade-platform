import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitKycDto, ReviewKycDto } from './dto/kyc.dto';
import { PaginationDto } from '../common/dto';

@Injectable()
export class KycService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(userId: string, dto: SubmitKycDto) {
    const existing = await this.prisma.kycSubmission.findFirst({
      where: { userId, status: { in: ['UNDER_REVIEW', 'APPROVED'] } },
    });
    if (existing?.status === 'APPROVED') {
      throw new BadRequestException('KYC already approved');
    }
    if (existing?.status === 'UNDER_REVIEW') {
      throw new BadRequestException('KYC submission already pending review');
    }

    return this.prisma.kycSubmission.create({
      data: {
        userId,
        documentType: dto.documentType as any,
        documentNumber: dto.documentNumber,
        documentFrontUrl: dto.documentFrontUrl,
        documentBackUrl: dto.documentBackUrl,
        selfieUrl: dto.selfieUrl,
        status: 'UNDER_REVIEW',
        submittedAt: new Date(),
      },
    });
  }

  async getStatus(userId: string) {
    const latest = await this.prisma.kycSubmission.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { reviews: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!latest) return { status: 'NOT_SUBMITTED' };
    const lastReview = latest.reviews?.[0];
    return {
      status: latest.status,
      rejectionReason: lastReview?.reason,
      submittedAt: latest.submittedAt,
      reviewedAt: lastReview?.createdAt,
    };
  }

  async review(id: string, reviewerId: string, dto: ReviewKycDto) {
    const submission = await this.prisma.kycSubmission.findUnique({ where: { id } });
    if (!submission) throw new NotFoundException('KYC submission not found');
    if (submission.status !== 'UNDER_REVIEW') {
      throw new BadRequestException('Submission is not pending review');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.kycSubmission.update({
        where: { id },
        data: { status: dto.decision as any },
      }),
      this.prisma.kycReview.create({
        data: {
          submissionId: id,
          reviewerId,
          decision: dto.decision as any,
          reason: dto.decision === 'REJECTED' ? dto.rejectionReason : null,
        },
      }),
    ]);

    return updated;
  }

  async adminFindAll(query: PaginationDto, status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      this.prisma.kycSubmission.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
        },
      }),
      this.prisma.kycSubmission.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }
}
