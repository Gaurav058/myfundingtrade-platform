// ── Payout Eligibility Rules ─────────────────────────────────────────────
// Determines when a trader can request a payout and validates payout state.

import type { PayoutStatus, TraderAccountStatus, KycStatus } from '@myfundingtrade/types';
import { allow, deny, type RuleResult } from './result';
import {
  DEFAULT_PROFIT_SPLIT,
  MIN_PAYOUT_AMOUNT,
  FIRST_PAYOUT_WAIT_DAYS,
  MAX_PENDING_PAYOUTS_PER_ACCOUNT,
  PAYOUT_TRANSITIONS,
  ACTIVE_PAYOUT_STATUSES,
} from './constants';

// ── Inputs ──────────────────────────────────────────────────────────────

export interface PayoutEligibilityInput {
  accountStatus: TraderAccountStatus;
  currentBalance: number;
  startingBalance: number;
  fundedAt: Date | null;
  kycStatus: KycStatus;
  activePendingPayoutCount: number;
  hasPayoutMethod: boolean;
}

export interface PayoutCalculation {
  grossProfit: number;
  profitSplit: number;
  traderShare: number;
  companyShare: number;
}

// ── Rules ───────────────────────────────────────────────────────────────

/** Check if a trader is eligible to request a payout. */
export function canRequestPayout(input: PayoutEligibilityInput): RuleResult {
  if (input.accountStatus !== 'FUNDED') {
    return deny('Payouts are only available for funded accounts', 'NOT_FUNDED');
  }

  if (input.kycStatus !== 'APPROVED') {
    return deny('KYC must be approved before requesting a payout', 'KYC_NOT_APPROVED');
  }

  if (!input.fundedAt) {
    return deny('Funded date not recorded', 'NO_FUNDED_DATE');
  }

  const daysSinceFunded = Math.floor(
    (Date.now() - input.fundedAt.getTime()) / 86_400_000,
  );
  if (daysSinceFunded < FIRST_PAYOUT_WAIT_DAYS) {
    const remaining = FIRST_PAYOUT_WAIT_DAYS - daysSinceFunded;
    return deny(
      `First payout available in ${remaining} day${remaining === 1 ? '' : 's'}`,
      'PAYOUT_WAIT_PERIOD',
    );
  }

  const profit = input.currentBalance - input.startingBalance;
  if (profit < MIN_PAYOUT_AMOUNT) {
    return deny(
      `Minimum payout amount is $${MIN_PAYOUT_AMOUNT}. Current profit: $${profit.toFixed(2)}`,
      'INSUFFICIENT_PROFIT',
    );
  }

  if (input.activePendingPayoutCount >= MAX_PENDING_PAYOUTS_PER_ACCOUNT) {
    return deny('A payout request is already in progress', 'PAYOUT_ALREADY_PENDING');
  }

  if (!input.hasPayoutMethod) {
    return deny('Please add a payout method before requesting', 'NO_PAYOUT_METHOD');
  }

  return allow();
}

/** Calculate profit split for a payout. */
export function calculatePayoutSplit(
  currentBalance: number,
  startingBalance: number,
  profitSplitPct?: number,
): PayoutCalculation {
  const split = profitSplitPct ?? DEFAULT_PROFIT_SPLIT;
  const grossProfit = Math.max(currentBalance - startingBalance, 0);
  const traderShare = Math.round(grossProfit * split / 100 * 100) / 100;
  const companyShare = Math.round((grossProfit - traderShare) * 100) / 100;

  return {
    grossProfit: Math.round(grossProfit * 100) / 100,
    profitSplit: split,
    traderShare,
    companyShare,
  };
}

/** Determine the initial payout status based on KYC. */
export function determineInitialPayoutStatus(kycApproved: boolean): PayoutStatus {
  return kycApproved ? 'PENDING_APPROVAL' : 'PENDING_KYC';
}

/** Check if a payout transition is valid. */
export function canTransitionPayout(from: PayoutStatus, to: PayoutStatus): RuleResult {
  const validTargets = PAYOUT_TRANSITIONS[from];
  if (!validTargets?.includes(to)) {
    return deny(`Cannot transition payout from ${from} to ${to}`, 'INVALID_PAYOUT_TRANSITION');
  }
  return allow();
}

/** Check if a payout is in a non-terminal active state. */
export function isPayoutActive(status: PayoutStatus): boolean {
  return ACTIVE_PAYOUT_STATUSES.includes(status);
}
