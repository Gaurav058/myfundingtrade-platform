// ── Purchase Flow Rules ──────────────────────────────────────────────────
// Determines who can buy a challenge plan and what happens after purchase.

import type {
  AccountStatus,
  OrderStatus,
  CouponType,
  LegalDocumentType,
} from '@myfundingtrade/types';
import { allow, deny, type RuleResult } from './result';
import {
  REQUIRED_LEGAL_CONSENTS_FOR_PURCHASE,
  ORDER_TRANSITIONS,
  MAX_COUPON_DISCOUNT_PCT,
} from './constants';

// ── Inputs ──────────────────────────────────────────────────────────────

export interface PurchaseEligibilityInput {
  userStatus: AccountStatus;
  emailVerified: boolean;
  userCountry: string | null;
  blockedCountries: string[];
  consentedDocumentTypes: LegalDocumentType[];
}

export interface CouponApplicationInput {
  code: string;
  type: CouponType;
  value: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date | null;
  usageCount: number;
  maxUsageCount: number | null;
  minOrderAmount: number | null;
  maxUsagePerUser: number;
  userPreviousUsageCount: number;
  orderSubtotal: number;
}

export interface DiscountResult {
  discountAmount: number;
  finalTotal: number;
}

// ── Rules ───────────────────────────────────────────────────────────────

/** Check if a user is eligible to purchase a challenge plan. */
export function canPurchase(input: PurchaseEligibilityInput): RuleResult {
  if (input.userStatus !== 'ACTIVE') {
    return deny('Account must be active to purchase', 'ACCOUNT_NOT_ACTIVE');
  }

  if (!input.emailVerified) {
    return deny('Email must be verified before purchasing', 'EMAIL_NOT_VERIFIED');
  }

  if (input.userCountry && input.blockedCountries.includes(input.userCountry)) {
    return deny('Purchases are not available in your country', 'COUNTRY_BLOCKED');
  }

  const missing = REQUIRED_LEGAL_CONSENTS_FOR_PURCHASE.filter(
    (doc) => !input.consentedDocumentTypes.includes(doc),
  );
  if (missing.length > 0) {
    return deny(`Missing required consents: ${missing.join(', ')}`, 'MISSING_CONSENTS');
  }

  return allow();
}

/** Check if an order status transition is valid. */
export function canTransitionOrder(from: OrderStatus, to: OrderStatus): RuleResult {
  const allowed = ORDER_TRANSITIONS[from];
  if (!allowed?.includes(to)) {
    return deny(`Cannot transition order from ${from} to ${to}`, 'INVALID_ORDER_TRANSITION');
  }
  return allow();
}

/** Validate a coupon and compute discount. */
export function validateCoupon(input: CouponApplicationInput): RuleResult & { discount?: DiscountResult } {
  if (!input.isActive) {
    return deny('Coupon is inactive', 'COUPON_INACTIVE');
  }

  const now = new Date();
  if (input.validFrom > now) {
    return deny('Coupon is not yet valid', 'COUPON_NOT_YET_VALID');
  }
  if (input.validUntil && input.validUntil < now) {
    return deny('Coupon has expired', 'COUPON_EXPIRED');
  }

  if (input.maxUsageCount !== null && input.usageCount >= input.maxUsageCount) {
    return deny('Coupon usage limit reached', 'COUPON_USAGE_LIMIT');
  }

  if (input.userPreviousUsageCount >= input.maxUsagePerUser) {
    return deny('You have already used this coupon the maximum number of times', 'COUPON_USER_LIMIT');
  }

  if (input.minOrderAmount !== null && input.orderSubtotal < input.minOrderAmount) {
    return deny(`Minimum order amount is $${input.minOrderAmount}`, 'COUPON_MIN_ORDER');
  }

  const discount = computeDiscount(input.type, input.value, input.orderSubtotal);

  return { allowed: true, discount };
}

/** Pure discount calculation. */
export function computeDiscount(
  type: CouponType,
  value: number,
  subtotal: number,
): DiscountResult {
  let discountAmount: number;

  if (type === 'PERCENTAGE') {
    const cappedPct = Math.min(value, MAX_COUPON_DISCOUNT_PCT);
    discountAmount = subtotal * cappedPct / 100;
  } else {
    discountAmount = value;
  }

  discountAmount = Math.min(discountAmount, subtotal);
  const finalTotal = Math.max(subtotal - discountAmount, 0);

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalTotal: Math.round(finalTotal * 100) / 100,
  };
}
