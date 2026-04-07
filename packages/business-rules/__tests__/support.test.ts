import { describe, it, expect } from 'vitest';
import {
  canTransitionTicket,
  canReplyToTicket,
  statusAfterReply,
  canCloseTicket,
  suggestPriority,
} from '../src/support';

describe('canTransitionTicket', () => {
  it('allows OPEN → IN_PROGRESS', () => {
    expect(canTransitionTicket('OPEN', 'IN_PROGRESS').allowed).toBe(true);
  });

  it('allows RESOLVED → OPEN (re-open)', () => {
    expect(canTransitionTicket('RESOLVED', 'OPEN').allowed).toBe(true);
  });

  it('denies invalid transition', () => {
    const r = canTransitionTicket('CLOSED', 'IN_PROGRESS');
    expect(r.allowed).toBe(false);
    expect(r.code).toBe('INVALID_TICKET_TRANSITION');
  });
});

describe('canReplyToTicket', () => {
  it('allows customer reply to OPEN ticket', () => {
    const r = canReplyToTicket({ ticketStatus: 'OPEN', isStaff: false });
    expect(r.allowed).toBe(true);
  });

  it('allows staff reply to OPEN ticket', () => {
    const r = canReplyToTicket({ ticketStatus: 'OPEN', isStaff: true });
    expect(r.allowed).toBe(true);
  });

  it('denies reply to CLOSED ticket', () => {
    const r = canReplyToTicket({ ticketStatus: 'CLOSED', isStaff: false });
    expect(r.code).toBe('TICKET_CLOSED');
  });

  it('denies staff reply to RESOLVED ticket', () => {
    const r = canReplyToTicket({ ticketStatus: 'RESOLVED', isStaff: true });
    expect(r.code).toBe('TICKET_RESOLVED_STAFF');
  });

  it('allows customer reply to RESOLVED ticket (re-open)', () => {
    const r = canReplyToTicket({ ticketStatus: 'RESOLVED', isStaff: false });
    expect(r.allowed).toBe(true);
  });
});

describe('statusAfterReply', () => {
  it('staff reply → AWAITING_CUSTOMER', () => {
    expect(statusAfterReply('OPEN', true)).toBe('AWAITING_CUSTOMER');
  });

  it('customer reply → OPEN', () => {
    expect(statusAfterReply('AWAITING_CUSTOMER', false)).toBe('OPEN');
  });

  it('customer reply to RESOLVED → OPEN', () => {
    expect(statusAfterReply('RESOLVED', false)).toBe('OPEN');
  });
});

describe('canCloseTicket', () => {
  it('allows closing OPEN ticket', () => {
    expect(canCloseTicket('OPEN').allowed).toBe(true);
  });

  it('denies closing already-closed ticket', () => {
    expect(canCloseTicket('CLOSED').code).toBe('ALREADY_CLOSED');
  });
});

describe('suggestPriority', () => {
  it('returns URGENT for breach keywords', () => {
    expect(suggestPriority({ subjectContains: ['Account breach detected'] })).toBe('URGENT');
  });

  it('returns HIGH for payout-related', () => {
    expect(suggestPriority({ isPayoutRelated: true })).toBe('HIGH');
  });

  it('returns HIGH for KYC-related', () => {
    expect(suggestPriority({ isKycRelated: true })).toBe('HIGH');
  });

  it('returns HIGH for high-priority keywords', () => {
    expect(suggestPriority({ subjectContains: ['KYC not working'] })).toBe('HIGH');
  });

  it('returns MEDIUM by default', () => {
    expect(suggestPriority({ subjectContains: ['General question'] })).toBe('MEDIUM');
  });

  it('returns MEDIUM with no input', () => {
    expect(suggestPriority({})).toBe('MEDIUM');
  });
});
