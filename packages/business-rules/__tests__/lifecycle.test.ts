import { describe, it, expect } from 'vitest';
import {
  canTransitionAccount,
  isAccountTerminal,
  canTrade,
  canActivateAccount,
  canActivateFunded,
  statusAfterPhasePass,
  statusAfterPhaseFail,
} from '../src/lifecycle';

describe('canTransitionAccount', () => {
  it('allows PROVISIONING → ACTIVE', () => {
    expect(canTransitionAccount('PROVISIONING', 'ACTIVE').allowed).toBe(true);
  });

  it('allows ACTIVE → BREACHED', () => {
    expect(canTransitionAccount('ACTIVE', 'BREACHED').allowed).toBe(true);
  });

  it('denies CLOSED → ACTIVE', () => {
    const r = canTransitionAccount('CLOSED', 'ACTIVE');
    expect(r.allowed).toBe(false);
    expect(r.code).toBe('INVALID_ACCOUNT_TRANSITION');
  });
});

describe('isAccountTerminal', () => {
  it('returns true for BREACHED', () => {
    expect(isAccountTerminal('BREACHED')).toBe(true);
  });

  it('returns true for CLOSED', () => {
    expect(isAccountTerminal('CLOSED')).toBe(true);
  });

  it('returns false for ACTIVE', () => {
    expect(isAccountTerminal('ACTIVE')).toBe(false);
  });
});

describe('canTrade', () => {
  it('allows ACTIVE', () => {
    expect(canTrade('ACTIVE').allowed).toBe(true);
  });

  it('allows FUNDED', () => {
    expect(canTrade('FUNDED').allowed).toBe(true);
  });

  it('denies BREACHED', () => {
    expect(canTrade('BREACHED').allowed).toBe(false);
  });

  it('denies PROVISIONING', () => {
    expect(canTrade('PROVISIONING').allowed).toBe(false);
  });
});

describe('canActivateAccount', () => {
  const base = {
    accountStatus: 'PROVISIONING' as const,
    platformProvisioned: true,
    loginAssigned: true,
  };

  it('allows when all conditions met', () => {
    expect(canActivateAccount(base).allowed).toBe(true);
  });

  it('denies when not in PROVISIONING', () => {
    const r = canActivateAccount({ ...base, accountStatus: 'ACTIVE' as any });
    expect(r.code).toBe('NOT_PROVISIONING');
  });

  it('denies when platform not provisioned', () => {
    const r = canActivateAccount({ ...base, platformProvisioned: false });
    expect(r.code).toBe('PLATFORM_NOT_PROVISIONED');
  });

  it('denies when login not assigned', () => {
    const r = canActivateAccount({ ...base, loginAssigned: false });
    expect(r.code).toBe('LOGIN_NOT_ASSIGNED');
  });
});

describe('canActivateFunded', () => {
  const base = {
    accountStatus: 'PASSED' as const,
    currentPhase: 'PHASE_2' as const,
    allPhasesPassedInSequence: true,
    kycApproved: true,
  };

  it('allows when all conditions met', () => {
    expect(canActivateFunded(base).allowed).toBe(true);
  });

  it('denies when not PASSED', () => {
    const r = canActivateFunded({ ...base, accountStatus: 'ACTIVE' as any });
    expect(r.code).toBe('NOT_PASSED');
  });

  it('denies when phases not all passed', () => {
    const r = canActivateFunded({ ...base, allPhasesPassedInSequence: false });
    expect(r.code).toBe('PHASES_INCOMPLETE');
  });

  it('denies when KYC not approved', () => {
    const r = canActivateFunded({ ...base, kycApproved: false });
    expect(r.code).toBe('KYC_NOT_APPROVED');
  });
});

describe('statusAfterPhasePass', () => {
  it('returns PASSED for single-phase plan', () => {
    expect(statusAfterPhasePass('PHASE_1', 1)).toBe('PASSED');
  });

  it('returns ACTIVE for PHASE_1 in multi-phase plan', () => {
    expect(statusAfterPhasePass('PHASE_1', 2)).toBe('ACTIVE');
  });

  it('returns PASSED for PHASE_2', () => {
    expect(statusAfterPhasePass('PHASE_2', 2)).toBe('PASSED');
  });
});

describe('statusAfterPhaseFail', () => {
  it('returns BREACHED', () => {
    expect(statusAfterPhaseFail()).toBe('BREACHED');
  });
});
