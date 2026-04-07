// ── Audit Log Requirements ───────────────────────────────────────────────
// Defines which actions must be audited and the shape of audit entries.

// ── Types ───────────────────────────────────────────────────────────────

export type AuditAction =
  | 'ORDER_CREATED'
  | 'ORDER_PAID'
  | 'ORDER_REFUNDED'
  | 'ACCOUNT_CREATED'
  | 'ACCOUNT_ACTIVATED'
  | 'ACCOUNT_BREACHED'
  | 'ACCOUNT_FUNDED'
  | 'PHASE_PASSED'
  | 'PHASE_FAILED'
  | 'KYC_SUBMITTED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'PAYOUT_REQUESTED'
  | 'PAYOUT_APPROVED'
  | 'PAYOUT_REJECTED'
  | 'PAYOUT_COMPLETED'
  | 'AFFILIATE_ENROLLED'
  | 'AFFILIATE_CONVERSION'
  | 'ADMIN_LOGIN'
  | 'SETTINGS_CHANGED'
  | 'USER_SUSPENDED'
  | 'USER_BANNED';

export interface AuditEntry {
  action: AuditAction;
  entityType: string;
  entityId: string;
  actorId: string;
  actorRole: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

// ── Constants ───────────────────────────────────────────────────────────

/** Actions that MUST be logged regardless of configuration. */
const MANDATORY_AUDIT_ACTIONS: readonly AuditAction[] = [
  'ORDER_PAID',
  'ORDER_REFUNDED',
  'ACCOUNT_BREACHED',
  'ACCOUNT_FUNDED',
  'KYC_APPROVED',
  'KYC_REJECTED',
  'PAYOUT_APPROVED',
  'PAYOUT_REJECTED',
  'PAYOUT_COMPLETED',
  'ADMIN_LOGIN',
  'SETTINGS_CHANGED',
  'USER_SUSPENDED',
  'USER_BANNED',
] as const;

/** All known auditable actions. */
const ALL_AUDIT_ACTIONS: readonly AuditAction[] = [
  'ORDER_CREATED',
  'ORDER_PAID',
  'ORDER_REFUNDED',
  'ACCOUNT_CREATED',
  'ACCOUNT_ACTIVATED',
  'ACCOUNT_BREACHED',
  'ACCOUNT_FUNDED',
  'PHASE_PASSED',
  'PHASE_FAILED',
  'KYC_SUBMITTED',
  'KYC_APPROVED',
  'KYC_REJECTED',
  'PAYOUT_REQUESTED',
  'PAYOUT_APPROVED',
  'PAYOUT_REJECTED',
  'PAYOUT_COMPLETED',
  'AFFILIATE_ENROLLED',
  'AFFILIATE_CONVERSION',
  'ADMIN_LOGIN',
  'SETTINGS_CHANGED',
  'USER_SUSPENDED',
  'USER_BANNED',
] as const;

// ── Rules ───────────────────────────────────────────────────────────────

/** Check if an action requires mandatory auditing. */
export function requiresAudit(action: AuditAction): boolean {
  return (MANDATORY_AUDIT_ACTIONS as readonly string[]).includes(action);
}

/** Get all auditable actions. */
export function getAuditableActions(): readonly AuditAction[] {
  return ALL_AUDIT_ACTIONS;
}

/** Get only the mandatory audit actions. */
export function getMandatoryAuditActions(): readonly AuditAction[] {
  return MANDATORY_AUDIT_ACTIONS;
}

/** Build a well-formed audit entry. */
export function buildAuditEntry(
  action: AuditAction,
  entityType: string,
  entityId: string,
  actorId: string,
  actorRole: string,
  metadata?: Record<string, unknown>,
  ipAddress?: string,
): AuditEntry {
  return {
    action,
    entityType,
    entityId,
    actorId,
    actorRole,
    timestamp: new Date(),
    ...(metadata && { metadata }),
    ...(ipAddress && { ipAddress }),
  };
}
