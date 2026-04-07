// ── Support Ticket Workflow Rules ─────────────────────────────────────────
// State machine rules for support tickets.

import type { TicketStatus } from '@myfundingtrade/types';
import { allow, deny, type RuleResult } from './result';
import { TICKET_TRANSITIONS } from './constants';

// ── Inputs ──────────────────────────────────────────────────────────────

export interface TicketReplyInput {
  ticketStatus: TicketStatus;
  isStaff: boolean;
}

// ── Rules ───────────────────────────────────────────────────────────────

/** Check if a ticket status transition is valid. */
export function canTransitionTicket(from: TicketStatus, to: TicketStatus): RuleResult {
  const validTargets = TICKET_TRANSITIONS[from];
  if (!validTargets?.includes(to)) {
    return deny(`Cannot transition ticket from ${from} to ${to}`, 'INVALID_TICKET_TRANSITION');
  }
  return allow();
}

/** Check if a reply can be added to a ticket. */
export function canReplyToTicket(input: TicketReplyInput): RuleResult {
  if (input.ticketStatus === 'CLOSED') {
    return deny('Cannot reply to a closed ticket', 'TICKET_CLOSED');
  }
  if (input.ticketStatus === 'RESOLVED') {
    // Only the user can re-open by replying; staff cannot reply to resolved
    if (input.isStaff) {
      return deny('Ticket is resolved — customer must re-open it', 'TICKET_RESOLVED_STAFF');
    }
  }
  return allow();
}

/** Determine the next ticket status after a reply. */
export function statusAfterReply(
  currentStatus: TicketStatus,
  isStaff: boolean,
): TicketStatus {
  if (currentStatus === 'RESOLVED' && !isStaff) {
    // User re-opening a resolved ticket
    return 'OPEN' as TicketStatus;
  }
  if (isStaff) {
    return 'AWAITING_CUSTOMER' as TicketStatus;
  }
  return 'OPEN' as TicketStatus;
}

/** Check if a ticket can be closed. */
export function canCloseTicket(currentStatus: TicketStatus): RuleResult {
  if (currentStatus === 'CLOSED') {
    return deny('Ticket is already closed', 'ALREADY_CLOSED');
  }
  return allow();
}

/** Suggest priority based on ticket metadata. */
export function suggestPriority(input: {
  subjectContains?: string[];
  isKycRelated?: boolean;
  isPayoutRelated?: boolean;
}): 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' {
  const urgentKeywords = ['breach', 'suspended', 'disabled', 'locked'];
  const highKeywords = ['payout', 'withdrawal', 'kyc', 'verification'];

  const subject = (input.subjectContains ?? []).map(s => s.toLowerCase());

  if (subject.some(s => urgentKeywords.some(k => s.includes(k)))) {
    return 'URGENT';
  }
  if (input.isPayoutRelated || input.isKycRelated) {
    return 'HIGH';
  }
  if (subject.some(s => highKeywords.some(k => s.includes(k)))) {
    return 'HIGH';
  }
  return 'MEDIUM';
}
