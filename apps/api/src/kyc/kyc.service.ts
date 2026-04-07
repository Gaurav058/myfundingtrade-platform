import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitKycDto, ReviewKycDto } from './dto/kyc.dto';
import { PaginationDto } from '../common/dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvents } from '../notifications/events';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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

    const submission = await this.prisma.kycSubmission.create({
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

    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
    this.eventEmitter.emit(NotificationEvents.KYC_SUBMITTED, {
      userId,
      email: user?.email,
      firstName: user?.profile?.firstName,
    });

    return submission;
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

    const user = await this.prisma.user.findUnique({ where: { id: submission.userId }, include: { profile: true } });
    const basePayload = { userId: submission.userId, email: user?.email ?? '', firstName: user?.profile?.firstName };

    if (dto.decision === 'APPROVED') {
      this.eventEmitter.emit(NotificationEvents.KYC_APPROVED, basePayload);
    } else if (dto.decision === 'REJECTED') {
      this.eventEmitter.emit(NotificationEvents.KYC_REJECTED, { ...basePayload, reason: dto.rejectionReason || 'Documents could not be verified' });
    }

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
