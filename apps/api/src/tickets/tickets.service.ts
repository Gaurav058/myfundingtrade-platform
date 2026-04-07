import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, ReplyTicketDto, UpdateTicketStatusDto } from './dto/ticket.dto';
import { PaginationDto } from '../common/dto';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTicketDto) {
    const ticketNumber = `TK-${Date.now().toString(36).toUpperCase()}`;
    return this.prisma.supportTicket.create({
      data: {
        userId,
        ticketNumber,
        subject: dto.subject,
        category: dto.category as any,
        priority: (dto.priority as any) || 'MEDIUM',
        status: 'OPEN',
        messages: {
          create: {
            senderId: userId,
            body: dto.message,
            isInternal: false,
          },
        },
      },
      include: { messages: true },
    });
  }

  async findAllForUser(userId: string, query: PaginationDto) {
    const where = { userId };
    const [items, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }

  async findById(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;
    const ticket = await this.prisma.supportTicket.findFirst({
      where,
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async reply(id: string, senderId: string, isInternal: boolean, dto: ReplyTicketDto) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (!isInternal && ticket.userId !== senderId) {
      throw new ForbiddenException('Not your ticket');
    }

    const [message] = await this.prisma.$transaction([
      this.prisma.supportMessage.create({
        data: {
          ticketId: id,
          senderId,
          body: dto.message,
          isInternal,
        },
      }),
      this.prisma.supportTicket.update({
        where: { id },
        data: {
          status: isInternal ? 'AWAITING_CUSTOMER' : 'OPEN',
          updatedAt: new Date(),
        },
      }),
    ]);
    return message;
  }

  async updateStatus(id: string, dto: UpdateTicketStatusDto) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status: dto.status as any },
    });
  }

  async adminFindAll(query: PaginationDto, status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip: ((query.page || 1) - 1) * (query.pageSize || 20),
        take: query.pageSize || 20,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);
    return { items, total, page: query.page || 1, pageSize: query.pageSize || 20 };
  }
}
