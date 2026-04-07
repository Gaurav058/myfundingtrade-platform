// ── Legal Compliance & Consent Rules ─────────────────────────────────────
// Enforces that users accept required legal documents before actions.

import {
  REQUIRED_LEGAL_CONSENTS_FOR_PURCHASE,
  REQUIRED_LEGAL_CONSENTS_FOR_PAYOUT,
  REQUIRED_LEGAL_CONSENTS_FOR_AFFILIATE,
} from './constants';
import { allow, deny, type RuleResult } from './result';

// ── Types ───────────────────────────────────────────────────────────────

export type ConsentAction = 'purchase' | 'payout' | 'affiliate';

export interface ConsentInput {
  acceptedConsents: string[];
  action: ConsentAction;
}

// ── Lookups ─────────────────────────────────────────────────────────────

const CONSENT_MAP: Record<ConsentAction, readonly string[]> = {
  purchase: REQUIRED_LEGAL_CONSENTS_FOR_PURCHASE,
  payout: REQUIRED_LEGAL_CONSENTS_FOR_PAYOUT,
  affiliate: REQUIRED_LEGAL_CONSENTS_FOR_AFFILIATE,
};

// ── Rules ───────────────────────────────────────────────────────────────

/** Get the consent types required for an action. */
export function getRequiredConsents(action: ConsentAction): readonly string[] {
  return CONSENT_MAP[action];
}

/** Return the list of consents the user has NOT yet accepted. */
export function getMissingConsents(input: ConsentInput): string[] {
  const required = CONSENT_MAP[input.action];
  const accepted = new Set(input.acceptedConsents);
  return required.filter(r => !accepted.has(r));
}

/** Check if the user has all required consents for the given action. */
export function hasRequiredConsents(input: ConsentInput): RuleResult {
  const missing = getMissingConsents(input);
  if (missing.length > 0) {
    return deny(
      `Missing required consent(s): ${missing.join(', ')}`,
      'MISSING_CONSENTS',
    );
  }
  return allow();
}

/** Check if a specific consent has been accepted. */
export function isConsentAccepted(consentType: string, acceptedConsents: string[]): boolean {
  return acceptedConsents.includes(consentType);
}
