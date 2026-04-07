import { describe, it, expect } from 'vitest';
import {
  evaluatePhase,
  canTransitionPhase,
  getNextPhase,
} from '../src/evaluation';
import type { RuleSetThresholds, PhaseMetrics } from '../src/evaluation';

const rules: RuleSetThresholds = {
  profitTargetPct: 10,
  maxDailyLossPct: 5,
  maxTotalLossPct: 10,
  minTradingDays: 5,
  maxCalendarDays: 30,
  maxInactivityDays: 7,
};

function makeMetrics(overrides: Partial<PhaseMetrics> = {}): PhaseMetrics {
  return {
    startingBalance: 100_000,
    currentBalance: 110_000,
    highWaterMark: 110_000,
    maxDailyDrawdownPct: 2,
    maxTotalDrawdownPct: 3,
    tradingDays: 6,
    calendarDaysElapsed: 10,
    daysSinceLastTrade: 1,
    profitPct: 10,
    ...overrides,
  };
}

describe('evaluatePhase', () => {
  it('returns PASSED when all targets met', () => {
    const result = evaluatePhase({ rules, metrics: makeMetrics() });
    expect(result.verdict).toBe('PASSED');
    expect(result.profitTargetMet).toBe(true);
    expect(result.minDaysMet).toBe(true);
  });

  it('returns IN_PROGRESS when profit target not met', () => {
    const result = evaluatePhase({ rules, metrics: makeMetrics({ profitPct: 5 }) });
    expect(result.verdict).toBe('IN_PROGRESS');
    expect(result.profitTargetMet).toBe(false);
  });

  it('returns IN_PROGRESS when min days not met', () => {
    const result = evaluatePhase({ rules, metrics: makeMetrics({ tradingDays: 3 }) });
    expect(result.verdict).toBe('IN_PROGRESS');
    expect(result.minDaysMet).toBe(false);
  });

  it('returns FAILED_DAILY_LOSS when daily drawdown exceeds limit', () => {
    const result = evaluatePhase({ rules, metrics: makeMetrics({ maxDailyDrawdownPct: 6 }) });
    expect(result.verdict).toBe('FAILED_DAILY_LOSS');
    expect(result.dailyLossBreached).toBe(true);
  });

  it('returns FAILED_TOTAL_LOSS when total drawdown exceeds limit', () => {
    const result = evaluatePhase({ rules, metrics: makeMetrics({ maxTotalDrawdownPct: 11 }) });
    expect(result.verdict).toBe('FAILED_TOTAL_LOSS');
    expect(result.totalLossBreached).toBe(true);
  });

  it('returns FAILED_TIME_LIMIT when calendar days exceeded', () => {
    const result = evaluatePhase({ rules, metrics: makeMetrics({ calendarDaysElapsed: 31 }) });
    expect(result.verdict).toBe('FAILED_TIME_LIMIT');
  });

  it('returns FAILED_INACTIVITY when inactive too long', () => {
    const result = evaluatePhase({ rules, metrics: makeMetrics({ daysSinceLastTrade: 8 }) });
    expect(result.verdict).toBe('FAILED_INACTIVITY');
  });

  it('daily loss breach takes priority over total loss breach', () => {
    const result = evaluatePhase({
      rules,
      metrics: makeMetrics({ maxDailyDrawdownPct: 6, maxTotalDrawdownPct: 11 }),
    });
    expect(result.verdict).toBe('FAILED_DAILY_LOSS');
  });

  it('allows unlimited calendar days when maxCalendarDays is null', () => {
    const unlimitedRules = { ...rules, maxCalendarDays: null };
    const result = evaluatePhase({
      rules: unlimitedRules,
      metrics: makeMetrics({ calendarDaysElapsed: 999 }),
    });
    expect(result.verdict).toBe('PASSED');
  });
});

describe('canTransitionPhase', () => {
  it('allows ACTIVE → PASSED', () => {
    expect(canTransitionPhase('ACTIVE', 'PASSED').allowed).toBe(true);
  });

  it('denies PASSED → ACTIVE', () => {
    const r = canTransitionPhase('PASSED', 'ACTIVE');
    expect(r.allowed).toBe(false);
    expect(r.code).toBe('INVALID_PHASE_TRANSITION');
  });
});

describe('getNextPhase', () => {
  it('returns PHASE_2 after PHASE_1 when 2+ phases', () => {
    expect(getNextPhase('PHASE_1', 2)).toBe('PHASE_2');
  });

  it('returns FUNDED after PHASE_1 when 1 phase only', () => {
    expect(getNextPhase('PHASE_1', 1)).toBe('FUNDED');
  });

  it('returns FUNDED after PHASE_2', () => {
    expect(getNextPhase('PHASE_2', 2)).toBe('FUNDED');
  });
});
