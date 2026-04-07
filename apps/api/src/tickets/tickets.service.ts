import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, ReplyTicketDto, UpdateTicketStatusDto } from './dto/ticket.dto';
import { PaginationDto } from '../common/dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvents } from '../notifications/events';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateTicketDto) {
    const ticketNumber = `TK-${Date.now().toString(36).toUpperCase()}`;
    const ticket = await this.prisma.supportTicket.create({
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

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { email: true, profile: { select: { firstName: true } } } });
    this.eventEmitter.emit(NotificationEvents.TICKET_CREATED, {
      userId,
      email: user?.email,
      firstName: user?.profile?.firstName,
      ticketId: ticket.ticketNumber,
      subject: dto.subject,
    });

    return ticket;
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

    // Notify ticket owner when an agent replies (not internal notes, not self-replies)
    if (isInternal && ticket.userId !== senderId) {
      const sender = await this.prisma.user.findUnique({ where: { id: senderId }, select: { profile: { select: { firstName: true } } } });
      const owner = await this.prisma.user.findUnique({ where: { id: ticket.userId }, select: { email: true, profile: { select: { firstName: true } } } });
      this.eventEmitter.emit(NotificationEvents.TICKET_REPLIED, {
        userId: ticket.userId,
        email: owner?.email,
        firstName: owner?.profile?.firstName,
        ticketId: ticket.ticketNumber,
        subject: ticket.subject,
        replierName: sender?.profile?.firstName || 'Support Agent',
      });
    }

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
