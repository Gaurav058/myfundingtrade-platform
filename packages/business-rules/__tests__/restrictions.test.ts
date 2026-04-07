import { describe, it, expect } from 'vitest';
import {
  isCountryBlocked,
  canAccessPlatform,
  isFeatureEnabled,
  canPurchaseFromCountry,
} from '../src/restrictions';

describe('isCountryBlocked', () => {
  const blocked = ['KP', 'IR', 'SY'];

  it('returns true for blocked country', () => {
    expect(isCountryBlocked('KP', blocked)).toBe(true);
  });

  it('case insensitive', () => {
    expect(isCountryBlocked('kp', blocked)).toBe(true);
  });

  it('returns false for allowed country', () => {
    expect(isCountryBlocked('US', blocked)).toBe(false);
  });
});

describe('canAccessPlatform', () => {
  const blocked = ['KP', 'IR'];

  it('allows when country is not blocked', () => {
    const r = canAccessPlatform({ userCountry: 'US', blockedCountries: blocked });
    expect(r.allowed).toBe(true);
  });

  it('denies when user country is blocked', () => {
    const r = canAccessPlatform({ userCountry: 'KP', blockedCountries: blocked });
    expect(r.code).toBe('COUNTRY_BLOCKED');
  });

  it('denies when IP country is blocked', () => {
    const r = canAccessPlatform({
      userCountry: 'US',
      blockedCountries: blocked,
      userIpCountry: 'IR',
    });
    expect(r.code).toBe('IP_COUNTRY_BLOCKED');
  });

  it('allows when IP country is not blocked', () => {
    const r = canAccessPlatform({
      userCountry: 'US',
      blockedCountries: blocked,
      userIpCountry: 'GB',
    });
    expect(r.allowed).toBe(true);
  });
});

describe('isFeatureEnabled', () => {
  it('allows a feature not in disabled list', () => {
    const r = isFeatureEnabled({ feature: 'CRYPTO_PAYOUT', disabledFeatures: ['SMS_NOTIFY'] });
    expect(r.allowed).toBe(true);
  });

  it('denies a disabled feature', () => {
    const r = isFeatureEnabled({ feature: 'CRYPTO_PAYOUT', disabledFeatures: ['CRYPTO_PAYOUT'] });
    expect(r.code).toBe('FEATURE_DISABLED');
  });
});

describe('canPurchaseFromCountry', () => {
  it('allows when country not blocked', () => {
    const r = canPurchaseFromCountry({ userCountry: 'US', blockedCountries: ['KP'] });
    expect(r.allowed).toBe(true);
  });

  it('denies when country blocked', () => {
    const r = canPurchaseFromCountry({ userCountry: 'KP', blockedCountries: ['KP'] });
    expect(r.code).toBe('PURCHASE_COUNTRY_BLOCKED');
  });
});
