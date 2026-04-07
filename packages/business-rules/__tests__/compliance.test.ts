import { describe, it, expect } from 'vitest';
import {
  getRequiredConsents,
  getMissingConsents,
  hasRequiredConsents,
  isConsentAccepted,
} from '../src/compliance';

describe('getRequiredConsents', () => {
  it('returns purchase consents', () => {
    const r = getRequiredConsents('purchase');
    expect(r).toContain('TERMS_OF_SERVICE');
    expect(r).toContain('PRIVACY_POLICY');
    expect(r).toContain('RISK_DISCLOSURE');
    expect(r).toContain('REFUND_POLICY');
  });

  it('returns payout consents', () => {
    const r = getRequiredConsents('payout');
    expect(r).toContain('TERMS_OF_SERVICE');
    expect(r).toContain('AML_POLICY');
  });

  it('returns affiliate consents', () => {
    const r = getRequiredConsents('affiliate');
    expect(r).toContain('AFFILIATE_AGREEMENT');
  });
});

describe('getMissingConsents', () => {
  it('returns empty when all accepted', () => {
    const r = getMissingConsents({
      acceptedConsents: ['TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'RISK_DISCLOSURE', 'REFUND_POLICY'],
      action: 'purchase',
    });
    expect(r).toHaveLength(0);
  });

  it('returns missing consents', () => {
    const r = getMissingConsents({
      acceptedConsents: ['TERMS_OF_SERVICE'],
      action: 'purchase',
    });
    expect(r).toContain('PRIVACY_POLICY');
    expect(r).toContain('RISK_DISCLOSURE');
    expect(r).toContain('REFUND_POLICY');
  });
});

describe('hasRequiredConsents', () => {
  it('allows when all consents accepted', () => {
    const r = hasRequiredConsents({
      acceptedConsents: ['AFFILIATE_AGREEMENT'],
      action: 'affiliate',
    });
    expect(r.allowed).toBe(true);
  });

  it('denies when consents missing', () => {
    const r = hasRequiredConsents({
      acceptedConsents: [],
      action: 'affiliate',
    });
    expect(r.code).toBe('MISSING_CONSENTS');
  });
});

describe('isConsentAccepted', () => {
  it('returns true when in list', () => {
    expect(isConsentAccepted('TERMS_OF_SERVICE', ['TERMS_OF_SERVICE', 'AML_POLICY'])).toBe(true);
  });

  it('returns false when not in list', () => {
    expect(isConsentAccepted('RISK_DISCLOSURE', ['TERMS_OF_SERVICE'])).toBe(false);
  });
});
