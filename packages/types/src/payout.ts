import type { PayoutStatus, PayoutMethodType } from './enums';

export interface PayoutMethod {
  id: string;
  userId: string;
  type: PayoutMethodType;
  label: string | null;
  details: Record<string, unknown>;
  isDefault: boolean;
  isVerified: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutRequest {
  id: string;
  userId: string;
  traderAccountId: string;
  payoutMethodId: string | null;
  requestNumber: string;
  amount: number;
  currency: string;
  profitSplit: number;
  traderShare: number;
  companyShare: number;
  status: PayoutStatus;
  reviewedBy: string | null;
  reviewNote: string | null;
  rejectionReason: string | null;
  transactionRef: string | null;
  processedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
