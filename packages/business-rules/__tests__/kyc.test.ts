import { describe, it, expect } from 'vitest';
import {
  isKycRequired,
  isKycValid,
  checkKycForAction,
  canTransitionKyc,
  canSubmitKyc,
  getRequiredKycDocuments,
} from '../src/kyc';

describe('isKycRequired', () => {
  it('required for PASSED accounts', () => {
    expect(isKycRequired('PASSED')).toBe(true);
  });

  it('required for FUNDED accounts', () => {
    expect(isKycRequired('FUNDED')).toBe(true);
  });

  it('not required for ACTIVE accounts', () => {
    expect(isKycRequired('ACTIVE')).toBe(false);
  });

  it('not required for PROVISIONING accounts', () => {
    expect(isKycRequired('PROVISIONING')).toBe(false);
  });
});

describe('isKycValid', () => {
  it('returns true for recently approved KYC', () => {
    const recentDate = new Date(Date.now() - 30 * 86_400_000); // 30 days ago
    expect(isKycValid('APPROVED', recentDate)).toBe(true);
  });

  it('returns false for expired KYC', () => {
    const oldDate = new Date(Date.now() - 400 * 86_400_000); // 400 days ago
    expect(isKycValid('APPROVED', oldDate)).toBe(false);
  });

  it('returns false when status is not APPROVED', () => {
    expect(isKycValid('PENDING_DOCUMENTS', new Date())).toBe(false);
  });

  it('returns false when approvedAt is null', () => {
    expect(isKycValid('APPROVED', null)).toBe(false);
  });
});

describe('checkKycForAction', () => {
  it('allows when KYC not required', () => {
    const r = checkKycForAction({
      kycStatus: 'NOT_STARTED',
      kycApprovedAt: null,
      accountStatus: 'ACTIVE',
    });
    expect(r.allowed).toBe(true);
  });

  it('allows when KYC approved and valid', () => {
    const r = checkKycForAction({
      kycStatus: 'APPROVED',
      kycApprovedAt: new Date(),
      accountStatus: 'FUNDED',
    });
    expect(r.allowed).toBe(true);
  });

  it('denies when KYC expired', () => {
    const r = checkKycForAction({
      kycStatus: 'APPROVED',
      kycApprovedAt: new Date(Date.now() - 400 * 86_400_000),
      accountStatus: 'FUNDED',
    });
    expect(r.code).toBe('KYC_EXPIRED');
  });

  it('denies when KYC under review', () => {
    const r = checkKycForAction({
      kycStatus: 'UNDER_REVIEW',
      kycApprovedAt: null,
      accountStatus: 'PASSED',
    });
    expect(r.code).toBe('KYC_PENDING');
  });

  it('denies when KYC rejected', () => {
    const r = checkKycForAction({
      kycStatus: 'REJECTED',
      kycApprovedAt: null,
      accountStatus: 'PASSED',
    });
    expect(r.code).toBe('KYC_REJECTED');
  });

  it('denies when KYC not started but required', () => {
    const r = checkKycForAction({
      kycStatus: 'NOT_STARTED',
      kycApprovedAt: null,
      accountStatus: 'PASSED',
    });
    expect(r.code).toBe('KYC_NOT_STARTED');
  });
});

describe('canTransitionKyc', () => {
  it('allows NOT_STARTED → PENDING_DOCUMENTS', () => {
    expect(canTransitionKyc('NOT_STARTED', 'PENDING_DOCUMENTS').allowed).toBe(true);
  });

  it('denies NOT_STARTED → APPROVED', () => {
    const r = canTransitionKyc('NOT_STARTED', 'APPROVED');
    expect(r.allowed).toBe(false);
  });
});

describe('canSubmitKyc', () => {
  it('allows when NOT_STARTED', () => {
    expect(canSubmitKyc('NOT_STARTED').allowed).toBe(true);
  });

  it('allows when RESUBMISSION_REQUIRED', () => {
    expect(canSubmitKyc('RESUBMISSION_REQUIRED').allowed).toBe(true);
  });

  it('denies when APPROVED', () => {
    expect(canSubmitKyc('APPROVED').code).toBe('KYC_ALREADY_APPROVED');
  });

  it('denies when UNDER_REVIEW', () => {
    expect(canSubmitKyc('UNDER_REVIEW').code).toBe('KYC_ALREADY_PENDING');
  });
});

describe('getRequiredKycDocuments', () => {
  it('returns required document types', () => {
    const docs = getRequiredKycDocuments();
    expect(docs).toContain('GOVERNMENT_ID');
    expect(docs).toContain('PROOF_OF_ADDRESS');
    expect(docs).toContain('SELFIE');
    expect(docs).toHaveLength(3);
  });
});
