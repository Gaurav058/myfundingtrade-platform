import type { ChallengePhase, ChallengeStatus } from './enums';

export interface ChallengePlan {
  id: string;
  name: string;
  description: string;
  accountSize: number;
  price: number;
  profitTarget: number;
  maxDailyLoss: number;
  maxTotalLoss: number;
  minTradingDays: number;
  maxTradingDays: number;
  leverage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Challenge {
  id: string;
  userId: string;
  planId: string;
  phase: ChallengePhase;
  status: ChallengeStatus;
  startDate: string;
  endDate: string | null;
  startingBalance: number;
  currentBalance: number;
  highWaterMark: number;
  profitLoss: number;
  tradingDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface TradingAccount {
  id: string;
  userId: string;
  challengeId: string;
  accountNumber: string;
  broker: string;
  balance: number;
  equity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  userId: string;
  challengeId: string;
  amount: number;
  status: string;
  requestedAt: string;
  processedAt: string | null;
}
