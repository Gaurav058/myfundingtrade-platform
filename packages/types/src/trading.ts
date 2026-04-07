import type {
  ChallengeStatus,
  TraderAccountStatus,
  TraderAccountPhaseType,
  EvaluationVerdict,
  OrderStatus,
  PaymentStatus,
  PaymentProvider,
  CouponType,
} from './enums';

// ── Challenge Plans & Rules ─────────────────────────────────────────────

export interface ChallengePlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeVariant {
  id: string;
  planId: string;
  ruleSetId: string;
  accountSize: number;
  price: number;
  currency: string;
  leverage: number;
  profitSplit: number;
  phases: number;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeRuleSet {
  id: string;
  name: string;
  profitTargetPct: number;
  maxDailyLossPct: number;
  maxTotalLossPct: number;
  minTradingDays: number;
  maxCalendarDays: number | null;
  maxInactivityDays: number;
  allowWeekendHolding: boolean;
  allowNewsTrading: boolean;
  allowExpertAdvisors: boolean;
  allowHedging: boolean;
  allowCopying: boolean;
  maxLotSize: number | null;
  allowedInstruments: string | null;
  restrictedInstruments: string | null;
  fundedProfitTargetPct: number | null;
  fundedMaxDailyLossPct: number | null;
  fundedMaxTotalLossPct: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeVariantWithPlan extends ChallengeVariant {
  plan: ChallengePlan;
  ruleSet: ChallengeRuleSet;
}

// ── Commerce ────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  userId: string;
  variantId: string;
  couponId: string | null;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  affiliateId: string | null;
  metadata: Record<string, unknown> | null;
  paidAt: string | null;
  cancelledAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: string;
  providerPaymentId: string | null;
  providerFee: number | null;
  refundedAmount: number | null;
  failureReason: string | null;
  metadata: Record<string, unknown> | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  currency: string;
  minOrderAmount: number | null;
  maxUsageCount: number | null;
  usageCount: number;
  maxUsagePerUser: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  affiliateId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Trader Accounts & Evaluation ────────────────────────────────────────

export interface TraderAccount {
  id: string;
  userId: string;
  orderId: string;
  variantId: string;
  accountNumber: string;
  platform: string;
  server: string | null;
  login: string | null;
  status: TraderAccountStatus;
  startingBalance: number;
  currentBalance: number;
  currentEquity: number;
  highWaterMark: number;
  currentPhase: TraderAccountPhaseType;
  fundedAt: string | null;
  closedAt: string | null;
  closedReason: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TraderAccountPhase {
  id: string;
  traderAccountId: string;
  phase: TraderAccountPhaseType;
  status: ChallengeStatus;
  startDate: string | null;
  endDate: string | null;
  startingBalance: number;
  endingBalance: number | null;
  highWaterMark: number;
  maxDailyDrawdown: number | null;
  maxTotalDrawdown: number | null;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  tradingDays: number;
  profitLoss: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccountEvaluationResult {
  id: string;
  phaseId: string;
  verdict: EvaluationVerdict;
  profitTargetMet: boolean;
  dailyLossBreached: boolean;
  totalLossBreached: boolean;
  minDaysMet: boolean;
  ruleViolations: Record<string, unknown> | null;
  evaluatedAt: string;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string;
}
