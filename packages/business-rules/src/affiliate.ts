// ── Affiliate Tracking & Conversion Rules ────────────────────────────────
// Tracks affiliate referrals, conversion eligibility, and commission payouts.

import type { AffiliateStatus, AffiliateConversionStatus, OrderStatus } from '@myfundingtrade/types';
import { allow, deny, type RuleResult } from './result';
import {
  DEFAULT_AFFILIATE_COMMISSION_RATE,
  AFFILIATE_PAYOUT_COOLDOWN_DAYS,
  AFFILIATE_MIN_CONVERSIONS_FOR_PAYOUT,
  AFFILIATE_TRANSITIONS,
} from './constants';

// ── Inputs ──────────────────────────────────────────────────────────────

export interface AffiliateEligibilityInput {
  affiliateStatus: AffiliateStatus;
}

export interface ConversionInput {
  affiliateStatus: AffiliateStatus;
  orderStatus: OrderStatus;
  buyerIsAffiliateSelf: boolean;
}

export interface CommissionPayoutInput {
  affiliateStatus: AffiliateStatus;
  confirmedConversionCount: number;
  pendingBalance: number;
  lastPayoutDate: Date | null;
}

// ── Rules ───────────────────────────────────────────────────────────────

/** Check if an affiliate can earn commissions. */
export function canEarnCommission(input: AffiliateEligibilityInput): RuleResult {
  if (input.affiliateStatus !== 'ACTIVE') {
    return deny('Affiliate account must be active', 'AFFILIATE_NOT_ACTIVE');
  }
  return allow();
}

/** Check if an order qualifies as a valid affiliate conversion. */
export function canCreateConversion(input: ConversionInput): RuleResult {
  if (input.affiliateStatus !== 'ACTIVE') {
    return deny('Affiliate is not active', 'AFFILIATE_NOT_ACTIVE');
  }
  if (input.buyerIsAffiliateSelf) {
    return deny('Cannot earn commission on your own purchase', 'SELF_REFERRAL');
  }
  if (input.orderStatus !== 'PAID') {
    return deny('Conversion only counts for paid orders', 'ORDER_NOT_PAID');
  }
  return allow();
}

/** Calculate commission amount for a conversion. */
export function calculateCommission(
  orderAmount: number,
  commissionRate?: number,
): { commissionAmount: number; rate: number } {
  const rate = commissionRate ?? DEFAULT_AFFILIATE_COMMISSION_RATE;
  const commissionAmount = Math.round(orderAmount * rate / 100 * 100) / 100;
  return { commissionAmount, rate };
}

/** Check if conversion can be confirmed (order fulfilled, no refund). */
export function canConfirmConversion(
  currentStatus: AffiliateConversionStatus,
  orderStatus: OrderStatus,
): RuleResult {
  if (currentStatus !== 'PENDING') {
    return deny('Conversion is not in PENDING state', 'CONVERSION_NOT_PENDING');
  }
  if (orderStatus === 'REFUNDED' || orderStatus === 'CANCELLED') {
    return deny('Order was refunded or cancelled', 'ORDER_REFUNDED');
  }
  if (orderStatus !== 'PAID' && orderStatus !== 'FULFILLED') {
    return deny('Order must be paid or fulfilled', 'ORDER_NOT_COMPLETE');
  }
  return allow();
}

/** Check if an affiliate can request a commission payout. */
export function canRequestCommissionPayout(input: CommissionPayoutInput): RuleResult {
  if (input.affiliateStatus !== 'ACTIVE') {
    return deny('Affiliate account must be active', 'AFFILIATE_NOT_ACTIVE');
  }

  if (input.confirmedConversionCount < AFFILIATE_MIN_CONVERSIONS_FOR_PAYOUT) {
    return deny(
      `Need at least ${AFFILIATE_MIN_CONVERSIONS_FOR_PAYOUT} confirmed conversion(s)`,
      'INSUFFICIENT_CONVERSIONS',
    );
  }

  if (input.pendingBalance <= 0) {
    return deny('No pending balance to pay out', 'NO_PENDING_BALANCE');
  }

  if (input.lastPayoutDate) {
    const daysSinceLast = Math.floor(
      (Date.now() - input.lastPayoutDate.getTime()) / 86_400_000,
    );
    if (daysSinceLast < AFFILIATE_PAYOUT_COOLDOWN_DAYS) {
      const remaining = AFFILIATE_PAYOUT_COOLDOWN_DAYS - daysSinceLast;
      return deny(
        `Next payout available in ${remaining} day${remaining === 1 ? '' : 's'}`,
        'PAYOUT_COOLDOWN',
      );
    }
  }

  return allow();
}

/** Check if an affiliate status transition is valid. */
export function canTransitionAffiliate(from: AffiliateStatus, to: AffiliateStatus): RuleResult {
  const validTargets = AFFILIATE_TRANSITIONS[from];
  if (!validTargets?.includes(to)) {
    return deny(`Cannot transition affiliate from ${from} to ${to}`, 'INVALID_AFFILIATE_TRANSITION');
  }
  return allow();
}
