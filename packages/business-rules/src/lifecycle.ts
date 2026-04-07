// ── Account Lifecycle Rules ──────────────────────────────────────────────
// Controls the trader account state machine from provisioning to funded/closed.

import type { TraderAccountStatus, TraderAccountPhaseType } from '@myfundingtrade/types';
import { allow, deny, type RuleResult } from './result';
import { ACCOUNT_TRANSITIONS, TERMINAL_ACCOUNT_STATUSES } from './constants';

// ── State Machine ───────────────────────────────────────────────────────

/** Check if account status transition is valid. */
export function canTransitionAccount(from: TraderAccountStatus, to: TraderAccountStatus): RuleResult {
  const allowed = ACCOUNT_TRANSITIONS[from];
  if (!allowed?.includes(to)) {
    return deny(`Cannot transition account from ${from} to ${to}`, 'INVALID_ACCOUNT_TRANSITION');
  }
  return allow();
}

/** Check if the account is in a terminal (irreversible) state. */
export function isAccountTerminal(status: TraderAccountStatus): boolean {
  return TERMINAL_ACCOUNT_STATUSES.includes(status);
}

/** Check if trading is allowed on the account. */
export function canTrade(status: TraderAccountStatus): RuleResult {
  if (status === 'ACTIVE' || status === 'FUNDED') {
    return allow();
  }
  return deny(`Trading not allowed in ${status} state`, 'TRADING_NOT_ALLOWED');
}

// ── Lifecycle Events ────────────────────────────────────────────────────

export interface AccountActivationInput {
  accountStatus: TraderAccountStatus;
  platformProvisioned: boolean;
  loginAssigned: boolean;
}

/** Check if a provisioning account can be activated. */
export function canActivateAccount(input: AccountActivationInput): RuleResult {
  if (input.accountStatus !== 'PROVISIONING') {
    return deny('Account must be in PROVISIONING state to activate', 'NOT_PROVISIONING');
  }
  if (!input.platformProvisioned) {
    return deny('Trading platform account must be provisioned', 'PLATFORM_NOT_PROVISIONED');
  }
  if (!input.loginAssigned) {
    return deny('Trading platform login must be assigned', 'LOGIN_NOT_ASSIGNED');
  }
  return allow();
}

export interface FundedActivationInput {
  accountStatus: TraderAccountStatus;
  currentPhase: TraderAccountPhaseType;
  allPhasesPassedInSequence: boolean;
  kycApproved: boolean;
}

/** Check if an account can be promoted to FUNDED status. */
export function canActivateFunded(input: FundedActivationInput): RuleResult {
  if (input.accountStatus !== 'PASSED') {
    return deny('Account must be in PASSED state', 'NOT_PASSED');
  }
  if (!input.allPhasesPassedInSequence) {
    return deny('All challenge phases must be passed in sequence', 'PHASES_INCOMPLETE');
  }
  if (!input.kycApproved) {
    return deny('KYC must be approved before funded activation', 'KYC_NOT_APPROVED');
  }
  return allow();
}

/** Determine what status an account should move to after a phase passes. */
export function statusAfterPhasePass(
  currentPhase: TraderAccountPhaseType,
  totalPhases: number,
): TraderAccountStatus {
  // If on last evaluation phase, account moves to PASSED
  if (currentPhase === 'PHASE_1' && totalPhases === 1) return 'PASSED';
  if (currentPhase === 'PHASE_2') return 'PASSED';
  // Otherwise stays ACTIVE for the next phase
  return 'ACTIVE';
}

/** Determine what status an account should move to after a phase fails. */
export function statusAfterPhaseFail(): TraderAccountStatus {
  return 'BREACHED';
}
