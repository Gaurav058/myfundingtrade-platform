// ── Platform Constants ───────────────────────────────────────────────────
// Single source of truth for business thresholds and configuration values.

import type { LegalDocumentType } from '@myfundingtrade/types';

/** Default profit split: trader gets 80%, company keeps 20% */
export const DEFAULT_PROFIT_SPLIT = 80;

/** Minimum payout request amount in USD */
export const MIN_PAYOUT_AMOUNT = 50;

/** How many calendar days after a funded account is created before first payout is allowed */
export const FIRST_PAYOUT_WAIT_DAYS = 14;

/** Attribution window in days — how long after a click a conversion can be attributed */
export const ATTRIBUTION_WINDOW_DAYS = 30;

/** Maximum affiliate clicks from a single IP per day before flagging as suspicious */
export const MAX_CLICKS_PER_IP_PER_DAY = 10;

/** KYC approval validity in days */
export const KYC_VALIDITY_DAYS = 365;

/** Maximum concurrent active (non-terminal) payout requests per account */
export const MAX_PENDING_PAYOUTS_PER_ACCOUNT = 1;

/** Default affiliate commission rate (percentage of order total) */
export const DEFAULT_AFFILIATE_COMMISSION_RATE = 10;

/** Minimum days between affiliate commission payouts */
export const AFFILIATE_PAYOUT_COOLDOWN_DAYS = 30;

/** Minimum confirmed conversions before affiliate payout is allowed */
export const AFFILIATE_MIN_CONVERSIONS_FOR_PAYOUT = 1;

/** Legal documents required for account purchase */
export const REQUIRED_LEGAL_CONSENTS_FOR_PURCHASE: LegalDocumentType[] = [
  'TERMS_OF_SERVICE',
  'PRIVACY_POLICY',
  'RISK_DISCLOSURE',
  'REFUND_POLICY',
];

/** Legal documents required before payout */
export const REQUIRED_LEGAL_CONSENTS_FOR_PAYOUT: LegalDocumentType[] = [
  'TERMS_OF_SERVICE',
  'AML_POLICY',
];

/** Legal documents required for affiliate enrollment */
export const REQUIRED_LEGAL_CONSENTS_FOR_AFFILIATE: LegalDocumentType[] = [
  'AFFILIATE_AGREEMENT',
];

/** Maximum coupon discount percentage cap (prevent 100% off abuse) */
export const MAX_COUPON_DISCOUNT_PCT = 50;

/** Days of inactivity before auto-failing a phase (fallback if ruleSet.maxInactivityDays is null) */
export const DEFAULT_MAX_INACTIVITY_DAYS = 30;

// ── State Transitions ───────────────────────────────────────────────────

import type {
  OrderStatus,
  TraderAccountStatus,
  ChallengeStatus,
  PayoutStatus,
  TicketStatus,
  KycStatus,
  AffiliateStatus,
} from '@myfundingtrade/types';

/** Valid OrderStatus transitions */
export const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
  PENDING_PAYMENT: ['PAID', 'CANCELLED'],
  PAID: ['FULFILLED', 'REFUNDED', 'DISPUTED'],
  FULFILLED: ['REFUNDED', 'DISPUTED'],
  CANCELLED: [],
  REFUNDED: [],
  DISPUTED: ['REFUNDED', 'PAID'],
};

/** Valid TraderAccountStatus transitions */
export const ACCOUNT_TRANSITIONS: Record<TraderAccountStatus, readonly TraderAccountStatus[]> = {
  PROVISIONING: ['ACTIVE', 'CLOSED'],
  ACTIVE: ['BREACHED', 'PASSED', 'SUSPENDED', 'CLOSED'],
  BREACHED: ['CLOSED'],
  PASSED: ['FUNDED', 'CLOSED'],
  FUNDED: ['BREACHED', 'SUSPENDED', 'CLOSED'],
  SUSPENDED: ['ACTIVE', 'FUNDED', 'CLOSED'],
  CLOSED: [],
};

/** Valid ChallengeStatus (phase-level) transitions */
export const PHASE_TRANSITIONS: Record<ChallengeStatus, readonly ChallengeStatus[]> = {
  PENDING: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['PASSED', 'FAILED', 'EXPIRED', 'CANCELLED'],
  PASSED: [],
  FAILED: [],
  EXPIRED: [],
  CANCELLED: [],
};

/** Valid PayoutStatus transitions */
export const PAYOUT_TRANSITIONS: Record<PayoutStatus, readonly PayoutStatus[]> = {
  DRAFT: ['PENDING_KYC', 'PENDING_APPROVAL', 'CANCELLED'],
  PENDING_KYC: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
  APPROVED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['COMPLETED', 'FAILED'],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  FAILED: ['PROCESSING'],
};

/** Valid TicketStatus transitions */
export const TICKET_TRANSITIONS: Record<TicketStatus, readonly TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'AWAITING_CUSTOMER', 'ESCALATED', 'RESOLVED', 'CLOSED'],
  AWAITING_CUSTOMER: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  AWAITING_AGENT: ['IN_PROGRESS', 'AWAITING_CUSTOMER', 'ESCALATED', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS: ['AWAITING_CUSTOMER', 'AWAITING_AGENT', 'ESCALATED', 'RESOLVED', 'CLOSED'],
  ESCALATED: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['OPEN', 'CLOSED'],
  CLOSED: ['OPEN'],
};

/** Valid KycStatus transitions */
export const KYC_TRANSITIONS: Record<KycStatus, readonly KycStatus[]> = {
  NOT_STARTED: ['PENDING_DOCUMENTS'],
  PENDING_DOCUMENTS: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['APPROVED', 'REJECTED'],
  APPROVED: ['EXPIRED'],
  REJECTED: ['RESUBMISSION_REQUIRED'],
  EXPIRED: ['PENDING_DOCUMENTS'],
  RESUBMISSION_REQUIRED: ['PENDING_DOCUMENTS'],
};

/** Valid AffiliateStatus transitions */
export const AFFILIATE_TRANSITIONS: Record<AffiliateStatus, readonly AffiliateStatus[]> = {
  PENDING: ['ACTIVE', 'TERMINATED'],
  ACTIVE: ['SUSPENDED', 'TERMINATED'],
  SUSPENDED: ['ACTIVE', 'TERMINATED'],
  TERMINATED: [],
};

// ── Terminal States ─────────────────────────────────────────────────────

export const TERMINAL_ORDER_STATUSES: readonly OrderStatus[] = ['CANCELLED', 'REFUNDED'];
export const TERMINAL_ACCOUNT_STATUSES: readonly TraderAccountStatus[] = ['BREACHED', 'CLOSED'];
export const TERMINAL_PHASE_STATUSES: readonly ChallengeStatus[] = ['PASSED', 'FAILED', 'EXPIRED', 'CANCELLED'];
export const TERMINAL_PAYOUT_STATUSES: readonly PayoutStatus[] = ['COMPLETED', 'REJECTED', 'CANCELLED'];
export const ACTIVE_PAYOUT_STATUSES: readonly PayoutStatus[] = ['DRAFT', 'PENDING_KYC', 'PENDING_APPROVAL', 'APPROVED', 'PROCESSING'];
