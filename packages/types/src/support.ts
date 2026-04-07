import type { TicketStatus, TicketPriority, TicketCategory } from './enums';

export interface SupportTicket {
  id: string;
  userId: string;
  assigneeId: string | null;
  ticketNumber: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  body: string;
  isInternal: boolean;
  attachments: Record<string, unknown>[] | null;
  createdAt: string;
}
