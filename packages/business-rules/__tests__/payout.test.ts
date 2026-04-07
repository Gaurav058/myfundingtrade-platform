import { describe, it, expect } from 'vitest';
import {
  canRequestPayout,
  calculatePayoutSplit,
  determineInitialPayoutStatus,
  canTransitionPayout,
  isPayoutActive,
} from '../src/payout';

describe('canRequestPayout', () => {
  const base = {
    accountStatus: 'FUNDED' as const,
    currentBalance: 110_000,
    startingBalance: 100_000,
    fundedAt: new Date(Date.now() - 30 * 86_400_000), // 30 days ago
    kycStatus: 'APPROVED' as const,
    activePendingPayoutCount: 0,
    hasPayoutMethod: true,
  };

  it('allows when all conditions met', () => {
    expect(canRequestPayout(base).allowed).toBe(true);
  });

  it('denies when account not funded', () => {
    const r = canRequestPayout({ ...base, accountStatus: 'ACTIVE' as any });
    expect(r.code).toBe('NOT_FUNDED');
  });

  it('denies when KYC not approved', () => {
    const r = canRequestPayout({ ...base, kycStatus: 'PENDING_DOCUMENTS' as any });
    expect(r.code).toBe('KYC_NOT_APPROVED');
  });

  it('denies when within wait period', () => {
    const r = canRequestPayout({
      ...base,
      fundedAt: new Date(Date.now() - 5 * 86_400_000), // 5 days ago
    });
    expect(r.code).toBe('PAYOUT_WAIT_PERIOD');
  });

  it('denies when profit below minimum', () => {
    const r = canRequestPayout({
      ...base,
      currentBalance: 100_020,
    });
    expect(r.code).toBe('INSUFFICIENT_PROFIT');
  });

  it('denies when payout already pending', () => {
    const r = canRequestPayout({ ...base, activePendingPayoutCount: 1 });
    expect(r.code).toBe('PAYOUT_ALREADY_PENDING');
  });

  it('denies when no payout method', () => {
    const r = canRequestPayout({ ...base, hasPayoutMethod: false });
    expect(r.code).toBe('NO_PAYOUT_METHOD');
  });

  it('denies when fundedAt is null', () => {
    const r = canRequestPayout({ ...base, fundedAt: null });
    expect(r.code).toBe('NO_FUNDED_DATE');
  });
});

describe('calculatePayoutSplit', () => {
  it('uses default 80/20 split', () => {
    const r = calculatePayoutSplit(110_000, 100_000);
    expect(r.grossProfit).toBe(10_000);
    expect(r.profitSplit).toBe(80);
    expect(r.traderShare).toBe(8_000);
    expect(r.companyShare).toBe(2_000);
  });

  it('uses custom split', () => {
    const r = calculatePayoutSplit(110_000, 100_000, 90);
    expect(r.traderShare).toBe(9_000);
    expect(r.companyShare).toBe(1_000);
  });

  it('handles no profit', () => {
    const r = calculatePayoutSplit(100_000, 100_000);
    expect(r.grossProfit).toBe(0);
    expect(r.traderShare).toBe(0);
    expect(r.companyShare).toBe(0);
  });

  it('handles loss (negative profit clamps to 0)', () => {
    const r = calculatePayoutSplit(95_000, 100_000);
    expect(r.grossProfit).toBe(0);
    expect(r.traderShare).toBe(0);
  });
});

describe('determineInitialPayoutStatus', () => {
  it('returns PENDING_APPROVAL when KYC approved', () => {
    expect(determineInitialPayoutStatus(true)).toBe('PENDING_APPROVAL');
  });

  it('returns PENDING_KYC when KYC not approved', () => {
    expect(determineInitialPayoutStatus(false)).toBe('PENDING_KYC');
  });
});

describe('canTransitionPayout', () => {
  it('allows PENDING_APPROVAL → APPROVED', () => {
    expect(canTransitionPayout('PENDING_APPROVAL', 'APPROVED').allowed).toBe(true);
  });

  it('denies COMPLETED → APPROVED', () => {
    const r = canTransitionPayout('COMPLETED', 'APPROVED');
    expect(r.allowed).toBe(false);
  });
});

describe('isPayoutActive', () => {
  it('returns true for PROCESSING', () => {
    expect(isPayoutActive('PROCESSING')).toBe(true);
  });

  it('returns false for COMPLETED', () => {
    expect(isPayoutActive('COMPLETED')).toBe(false);
  });

  it('returns false for REJECTED', () => {
    expect(isPayoutActive('REJECTED')).toBe(false);
  });
});
