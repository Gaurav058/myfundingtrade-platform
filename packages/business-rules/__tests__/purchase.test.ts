import { describe, it, expect } from 'vitest';
import {
  canPurchase,
  canTransitionOrder,
  validateCoupon,
  computeDiscount,
} from '../src/purchase';

describe('canPurchase', () => {
  const base = {
    userStatus: 'ACTIVE' as const,
    emailVerified: true,
    userCountry: 'US',
    blockedCountries: ['KP', 'IR'],
    consentedDocumentTypes: [
      'TERMS_OF_SERVICE' as const,
      'PRIVACY_POLICY' as const,
      'RISK_DISCLOSURE' as const,
      'REFUND_POLICY' as const,
    ],
  };

  it('allows when all conditions met', () => {
    expect(canPurchase(base).allowed).toBe(true);
  });

  it('denies when account not active', () => {
    const r = canPurchase({ ...base, userStatus: 'SUSPENDED' as any });
    expect(r.allowed).toBe(false);
    expect(r.code).toBe('ACCOUNT_NOT_ACTIVE');
  });

  it('denies when email not verified', () => {
    const r = canPurchase({ ...base, emailVerified: false });
    expect(r.allowed).toBe(false);
    expect(r.code).toBe('EMAIL_NOT_VERIFIED');
  });

  it('denies when country is blocked', () => {
    const r = canPurchase({ ...base, userCountry: 'KP' });
    expect(r.allowed).toBe(false);
    expect(r.code).toBe('COUNTRY_BLOCKED');
  });

  it('allows when userCountry is null', () => {
    expect(canPurchase({ ...base, userCountry: null }).allowed).toBe(true);
  });

  it('denies when missing legal consents', () => {
    const r = canPurchase({ ...base, consentedDocumentTypes: ['TERMS_OF_SERVICE' as const] });
    expect(r.allowed).toBe(false);
    expect(r.code).toBe('MISSING_CONSENTS');
  });
});

describe('canTransitionOrder', () => {
  it('allows valid transition DRAFT → PENDING_PAYMENT', () => {
    expect(canTransitionOrder('DRAFT', 'PENDING_PAYMENT').allowed).toBe(true);
  });

  it('allows PAID → REFUNDED', () => {
    expect(canTransitionOrder('PAID', 'REFUNDED').allowed).toBe(true);
  });

  it('denies invalid transition CANCELLED → PAID', () => {
    const r = canTransitionOrder('CANCELLED', 'PAID');
    expect(r.allowed).toBe(false);
    expect(r.code).toBe('INVALID_ORDER_TRANSITION');
  });
});

describe('validateCoupon', () => {
  const now = new Date();
  const base = {
    code: 'TEST20',
    type: 'PERCENTAGE' as const,
    value: 20,
    isActive: true,
    validFrom: new Date(now.getTime() - 86_400_000),
    validUntil: new Date(now.getTime() + 86_400_000),
    usageCount: 0,
    maxUsageCount: 100,
    minOrderAmount: null,
    maxUsagePerUser: 3,
    userPreviousUsageCount: 0,
    orderSubtotal: 200,
  };

  it('allows valid coupon and returns discount', () => {
    const r = validateCoupon(base);
    expect(r.allowed).toBe(true);
    expect(r.discount).toBeDefined();
    expect(r.discount!.discountAmount).toBe(40);
    expect(r.discount!.finalTotal).toBe(160);
  });

  it('denies inactive coupon', () => {
    const r = validateCoupon({ ...base, isActive: false });
    expect(r.allowed).toBe(false);
    expect(r.code).toBe('COUPON_INACTIVE');
  });

  it('denies expired coupon', () => {
    const r = validateCoupon({ ...base, validUntil: new Date(now.getTime() - 1000) });
    expect(r.allowed).toBe(false);
    expect(r.code).toBe('COUPON_EXPIRED');
  });

  it('denies when usage limit reached', () => {
    const r = validateCoupon({ ...base, usageCount: 100, maxUsageCount: 100 });
    expect(r.allowed).toBe(false);
    expect(r.code).toBe('COUPON_USAGE_LIMIT');
  });

  it('denies when user limit reached', () => {
    const r = validateCoupon({ ...base, userPreviousUsageCount: 3 });
    expect(r.allowed).toBe(false);
    expect(r.code).toBe('COUPON_USER_LIMIT');
  });

  it('denies when order is below minimum', () => {
    const r = validateCoupon({ ...base, minOrderAmount: 500 });
    expect(r.allowed).toBe(false);
    expect(r.code).toBe('COUPON_MIN_ORDER');
  });
});

describe('computeDiscount', () => {
  it('applies percentage discount', () => {
    const r = computeDiscount('PERCENTAGE', 20, 100);
    expect(r.discountAmount).toBe(20);
    expect(r.finalTotal).toBe(80);
  });

  it('caps percentage at MAX_COUPON_DISCOUNT_PCT (50%)', () => {
    const r = computeDiscount('PERCENTAGE', 80, 100);
    expect(r.discountAmount).toBe(50);
    expect(r.finalTotal).toBe(50);
  });

  it('applies fixed amount discount', () => {
    const r = computeDiscount('FIXED_AMOUNT', 25, 100);
    expect(r.discountAmount).toBe(25);
    expect(r.finalTotal).toBe(75);
  });

  it('does not let final total go below zero', () => {
    const r = computeDiscount('FIXED_AMOUNT', 200, 100);
    expect(r.discountAmount).toBe(100);
    expect(r.finalTotal).toBe(0);
  });
});
