// ── Evaluation & Phase Logic ─────────────────────────────────────────────
// Determines pass/fail for challenge phases and evaluation results.

import type {
  EvaluationVerdict,
  ChallengeStatus,
  TraderAccountPhaseType,
} from '@myfundingtrade/types';
import { allow, deny, type RuleResult } from './result';
import { PHASE_TRANSITIONS } from './constants';

// ── Inputs ──────────────────────────────────────────────────────────────

export interface RuleSetThresholds {
  profitTargetPct: number;
  maxDailyLossPct: number;
  maxTotalLossPct: number;
  minTradingDays: number;
  maxCalendarDays: number | null;
  maxInactivityDays: number;
}

export interface PhaseMetrics {
  startingBalance: number;
  currentBalance: number;
  highWaterMark: number;
  maxDailyDrawdownPct: number;
  maxTotalDrawdownPct: number;
  tradingDays: number;
  calendarDaysElapsed: number;
  daysSinceLastTrade: number;
  profitPct: number;
}

export interface EvaluationInput {
  rules: RuleSetThresholds;
  metrics: PhaseMetrics;
}

export interface EvaluationOutput {
  verdict: EvaluationVerdict;
  profitTargetMet: boolean;
  dailyLossBreached: boolean;
  totalLossBreached: boolean;
  minDaysMet: boolean;
  details: string;
}

// ── Phase Transition Rules ──────────────────────────────────────────────

/** Check if a phase status transition is valid. */
export function canTransitionPhase(from: ChallengeStatus, to: ChallengeStatus): RuleResult {
  const allowed = PHASE_TRANSITIONS[from];
  if (!allowed?.includes(to)) {
    return deny(`Cannot transition phase from ${from} to ${to}`, 'INVALID_PHASE_TRANSITION');
  }
  return allow();
}

/** Determine what the next phase is after the current one passes. */
export function getNextPhase(
  currentPhase: TraderAccountPhaseType,
  totalPhases: number,
): TraderAccountPhaseType | 'FUNDED' {
  if (currentPhase === 'PHASE_1' && totalPhases >= 2) return 'PHASE_2';
  return 'FUNDED';
}

// ── Core Evaluation Engine ──────────────────────────────────────────────

/** Evaluate a phase against the rule set. Returns verdict with detailed breakdown. */
export function evaluatePhase(input: EvaluationInput): EvaluationOutput {
  const { rules, metrics } = input;

  const dailyLossBreached = metrics.maxDailyDrawdownPct > rules.maxDailyLossPct;
  const totalLossBreached = metrics.maxTotalDrawdownPct > rules.maxTotalLossPct;
  const minDaysMet = metrics.tradingDays >= rules.minTradingDays;
  const profitTargetMet = metrics.profitPct >= rules.profitTargetPct;

  // Check hard breaches first (instant fail)
  if (dailyLossBreached) {
    return {
      verdict: 'FAILED_DAILY_LOSS',
      profitTargetMet,
      dailyLossBreached: true,
      totalLossBreached,
      minDaysMet,
      details: `Daily drawdown ${metrics.maxDailyDrawdownPct.toFixed(2)}% exceeded limit of ${rules.maxDailyLossPct}%`,
    };
  }

  if (totalLossBreached) {
    return {
      verdict: 'FAILED_TOTAL_LOSS',
      profitTargetMet,
      dailyLossBreached,
      totalLossBreached: true,
      minDaysMet,
      details: `Total drawdown ${metrics.maxTotalDrawdownPct.toFixed(2)}% exceeded limit of ${rules.maxTotalLossPct}%`,
    };
  }

  // Check time-based failures
  if (rules.maxCalendarDays !== null && metrics.calendarDaysElapsed > rules.maxCalendarDays) {
    return {
      verdict: 'FAILED_TIME_LIMIT',
      profitTargetMet,
      dailyLossBreached,
      totalLossBreached,
      minDaysMet,
      details: `Exceeded ${rules.maxCalendarDays} calendar day limit`,
    };
  }

  if (metrics.daysSinceLastTrade > rules.maxInactivityDays) {
    return {
      verdict: 'FAILED_INACTIVITY',
      profitTargetMet,
      dailyLossBreached,
      totalLossBreached,
      minDaysMet,
      details: `Inactive for ${metrics.daysSinceLastTrade} days (limit: ${rules.maxInactivityDays})`,
    };
  }

  // Check if passed
  if (profitTargetMet && minDaysMet) {
    return {
      verdict: 'PASSED',
      profitTargetMet: true,
      dailyLossBreached: false,
      totalLossBreached: false,
      minDaysMet: true,
      details: `Profit target ${metrics.profitPct.toFixed(2)}% met, ${metrics.tradingDays} trading days completed`,
    };
  }

  // Still in progress
  return {
    verdict: 'IN_PROGRESS',
    profitTargetMet,
    dailyLossBreached: false,
    totalLossBreached: false,
    minDaysMet,
    details: profitTargetMet
      ? `Profit target met, need ${rules.minTradingDays - metrics.tradingDays} more trading days`
      : `Need ${(rules.profitTargetPct - metrics.profitPct).toFixed(2)}% more profit`,
  };
}

/** Compute drawdown percentage from high-water mark. */
export function computeDrawdownPct(highWaterMark: number, currentEquity: number): number {
  if (highWaterMark <= 0) return 0;
  const drawdown = Math.max(highWaterMark - currentEquity, 0);
  return (drawdown / highWaterMark) * 100;
}

/** Compute daily drawdown: max loss from start-of-day equity. */
export function computeDailyDrawdownPct(startOfDayEquity: number, lowestEquityToday: number): number {
  if (startOfDayEquity <= 0) return 0;
  const loss = Math.max(startOfDayEquity - lowestEquityToday, 0);
  return (loss / startOfDayEquity) * 100;
}

/** Compute profit percentage relative to starting balance. */
export function computeProfitPct(startingBalance: number, currentBalance: number): number {
  if (startingBalance <= 0) return 0;
  return ((currentBalance - startingBalance) / startingBalance) * 100;
}
