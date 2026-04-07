// ── Geo & Platform Restriction Enforcement ───────────────────────────────
// Pure rule functions for geographic and feature-level restrictions.

import { allow, deny, type RuleResult } from './result';

// ── Inputs ──────────────────────────────────────────────────────────────

export interface GeoRestrictionInput {
  userCountry: string;
  blockedCountries: string[];
}

export interface FeatureRestrictionInput {
  feature: string;
  disabledFeatures: string[];
}

export interface PlatformAccessInput {
  userCountry: string;
  blockedCountries: string[];
  userIpCountry?: string;
}

// ── Rules ───────────────────────────────────────────────────────────────

/** Check if a user's country is blocked. */
export function isCountryBlocked(country: string, blockedCountries: string[]): boolean {
  return blockedCountries.map(c => c.toUpperCase()).includes(country.toUpperCase());
}

/** Check if a user can access the platform based on geo restrictions. */
export function canAccessPlatform(input: PlatformAccessInput): RuleResult {
  const blockedUpper = input.blockedCountries.map(c => c.toUpperCase());

  if (blockedUpper.includes(input.userCountry.toUpperCase())) {
    return deny('Service is not available in your country', 'COUNTRY_BLOCKED');
  }

  if (input.userIpCountry && blockedUpper.includes(input.userIpCountry.toUpperCase())) {
    return deny('Access restricted from your current location', 'IP_COUNTRY_BLOCKED');
  }

  return allow();
}

/** Check if a feature is enabled (not in the disabled list). */
export function isFeatureEnabled(input: FeatureRestrictionInput): RuleResult {
  if (input.disabledFeatures.includes(input.feature)) {
    return deny(`Feature "${input.feature}" is currently disabled`, 'FEATURE_DISABLED');
  }
  return allow();
}

/** Check if a user can purchase from their country. */
export function canPurchaseFromCountry(input: GeoRestrictionInput): RuleResult {
  if (isCountryBlocked(input.userCountry, input.blockedCountries)) {
    return deny('Purchases are not available in your country', 'PURCHASE_COUNTRY_BLOCKED');
  }
  return allow();
}
