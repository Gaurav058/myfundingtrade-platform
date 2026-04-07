/** A decision result from any business rule check. */
export interface RuleResult {
  allowed: boolean;
  reason?: string;
  code?: string;
}

export function allow(): RuleResult {
  return { allowed: true };
}

export function deny(reason: string, code?: string): RuleResult {
  return { allowed: false, reason, code };
}
