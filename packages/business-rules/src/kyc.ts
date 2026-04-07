// ── KYC Requirement Rules ────────────────────────────────────────────────
// Determines when KYC is required and its current validity.

import type { KycStatus, TraderAccountStatus } from '@myfundingtrade/types';
import { allow, deny, type RuleResult } from './result';
import { KYC_VALIDITY_DAYS, KYC_TRANSITIONS } from './constants';

// ── Inputs ──────────────────────────────────────────────────────────────

export interface KycRequirementInput {
  kycStatus: KycStatus;
  kycApprovedAt: Date | null;
  accountStatus: TraderAccountStatus;
}

// ── Rules ───────────────────────────────────────────────────────────────

/** Check if KYC is required for the user's current situation. */
export function isKycRequired(accountStatus: TraderAccountStatus): boolean {
  // KYC is required before funded activation and before payout
  return accountStatus === 'PASSED' || accountStatus === 'FUNDED';
}

/** Check if KYC has been completed and is still valid. */
export function isKycValid(status: KycStatus, approvedAt: Date | null): boolean {
  if (status !== 'APPROVED' || !approvedAt) return false;
  const expiresAt = new Date(approvedAt.getTime() + KYC_VALIDITY_DAYS * 86_400_000);
  return expiresAt > new Date();
}

/** Check if a user's KYC status allows a specific action. */
export function checkKycForAction(input: KycRequirementInput): RuleResult {
  if (!isKycRequired(input.accountStatus)) {
    return allow();
  }

  if (input.kycStatus === 'APPROVED') {
    if (!isKycValid(input.kycStatus, input.kycApprovedAt)) {
      return deny('KYC approval has expired. Please resubmit.', 'KYC_EXPIRED');
    }
    return allow();
  }

  if (input.kycStatus === 'UNDER_REVIEW') {
    return deny('KYC is pending review', 'KYC_PENDING');
  }

  if (input.kycStatus === 'REJECTED' || input.kycStatus === 'RESUBMISSION_REQUIRED') {
    return deny('KYC was rejected. Please resubmit with correct documents.', 'KYC_REJECTED');
  }

  return deny('KYC must be completed', 'KYC_NOT_STARTED');
}

/** Check if a KYC status transition is valid. */
export function canTransitionKyc(from: KycStatus, to: KycStatus): RuleResult {
  const allowed = KYC_TRANSITIONS[from];
  if (!allowed?.includes(to)) {
    return deny(`Cannot transition KYC from ${from} to ${to}`, 'INVALID_KYC_TRANSITION');
  }
  return allow();
}

/** Check if a user can submit KYC documents. */
export function canSubmitKyc(currentStatus: KycStatus): RuleResult {
  if (currentStatus === 'APPROVED') {
    return deny('KYC already approved', 'KYC_ALREADY_APPROVED');
  }
  if (currentStatus === 'UNDER_REVIEW') {
    return deny('A KYC submission is already pending review', 'KYC_ALREADY_PENDING');
  }
  return allow();
}

/** The minimum required documents for KYC submission. */
export function getRequiredKycDocuments(): string[] {
  return ['GOVERNMENT_ID', 'PROOF_OF_ADDRESS', 'SELFIE'];
}
