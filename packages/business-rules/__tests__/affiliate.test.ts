import { describe, it, expect } from 'vitest';
import {
  canEarnCommission,
  canCreateConversion,
  calculateCommission,
  canConfirmConversion,
  canRequestCommissionPayout,
  canTransitionAffiliate,
} from '../src/affiliate';

describe('canEarnCommission', () => {
  it('allows when ACTIVE', () => {
    expect(canEarnCommission({ affiliateStatus: 'ACTIVE' }).allowed).toBe(true);
  });

  it('denies when PENDING', () => {
    const r = canEarnCommission({ affiliateStatus: 'PENDING' });
    expect(r.code).toBe('AFFILIATE_NOT_ACTIVE');
  });

  it('denies when SUSPENDED', () => {
    const r = canEarnCommission({ affiliateStatus: 'SUSPENDED' });
    expect(r.code).toBe('AFFILIATE_NOT_ACTIVE');
  });
});

describe('canCreateConversion', () => {
  it('allows valid conversion', () => {
    const r = canCreateConversion({
      affiliateStatus: 'ACTIVE',
      orderStatus: 'PAID',
      buyerIsAffiliateSelf: false,
    });
    expect(r.allowed).toBe(true);
  });

  it('denies self-referral', () => {
    const r = canCreateConversion({
      affiliateStatus: 'ACTIVE',
      orderStatus: 'PAID',
      buyerIsAffiliateSelf: true,
    });
    expect(r.code).toBe('SELF_REFERRAL');
  });

  it('denies when order not paid', () => {
    const r = canCreateConversion({
      affiliateStatus: 'ACTIVE',
      orderStatus: 'DRAFT',
      buyerIsAffiliateSelf: false,
    });
    expect(r.code).toBe('ORDER_NOT_PAID');
  });
});

describe('calculateCommission', () => {
  it('uses default 10% rate', () => {
    const r = calculateCommission(200);
    expect(r.rate).toBe(10);
    expect(r.commissionAmount).toBe(20);
  });

  it('uses custom rate', () => {
    const r = calculateCommission(200, 15);
    expect(r.rate).toBe(15);
    expect(r.commissionAmount).toBe(30);
  });
});

describe('canConfirmConversion', () => {
  it('allows when PENDING and order PAID', () => {
    expect(canConfirmConversion('PENDING', 'PAID').allowed).toBe(true);
  });

  it('allows when PENDING and order FULFILLED', () => {
    expect(canConfirmConversion('PENDING', 'FULFILLED').allowed).toBe(true);
  });

  it('denies when not PENDING', () => {
    const r = canConfirmConversion('CONFIRMED', 'PAID');
    expect(r.code).toBe('CONVERSION_NOT_PENDING');
  });

  it('denies when order refunded', () => {
    const r = canConfirmConversion('PENDING', 'REFUNDED');
    expect(r.code).toBe('ORDER_REFUNDED');
  });
});

describe('canRequestCommissionPayout', () => {
  const base = {
    affiliateStatus: 'ACTIVE' as const,
    confirmedConversionCount: 5,
    pendingBalance: 100,
    lastPayoutDate: null as Date | null,
  };

  it('allows when all conditions met', () => {
    expect(canRequestCommissionPayout(base).allowed).toBe(true);
  });

  it('denies when not active', () => {
    const r = canRequestCommissionPayout({ ...base, affiliateStatus: 'SUSPENDED' as any });
    expect(r.code).toBe('AFFILIATE_NOT_ACTIVE');
  });

  it('denies when insufficient conversions', () => {
    const r = canRequestCommissionPayout({ ...base, confirmedConversionCount: 0 });
    expect(r.code).toBe('INSUFFICIENT_CONVERSIONS');
  });

  it('denies when no pending balance', () => {
    const r = canRequestCommissionPayout({ ...base, pendingBalance: 0 });
    expect(r.code).toBe('NO_PENDING_BALANCE');
  });

  it('denies when within cooldown period', () => {
    const r = canRequestCommissionPayout({
      ...base,
      lastPayoutDate: new Date(Date.now() - 10 * 86_400_000), // 10 days ago
    });
    expect(r.code).toBe('PAYOUT_COOLDOWN');
  });

  it('allows when cooldown expired', () => {
    const r = canRequestCommissionPayout({
      ...base,
      lastPayoutDate: new Date(Date.now() - 31 * 86_400_000), // 31 days ago
    });
    expect(r.allowed).toBe(true);
  });
});

describe('canTransitionAffiliate', () => {
  it('allows PENDING → ACTIVE', () => {
    expect(canTransitionAffiliate('PENDING', 'ACTIVE').allowed).toBe(true);
  });

  it('denies TERMINATED → ACTIVE', () => {
    const r = canTransitionAffiliate('TERMINATED', 'ACTIVE');
    expect(r.allowed).toBe(false);
  });
});
