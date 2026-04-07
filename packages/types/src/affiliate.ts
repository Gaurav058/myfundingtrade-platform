import type {
  AffiliateStatus,
  AffiliateConversionStatus,
  CommissionPayoutStatus,
} from './enums';

export interface AffiliateAccount {
  id: string;
  userId: string;
  affiliateCode: string;
  status: AffiliateStatus;
  commissionRate: number;
  tier: number;
  totalEarnings: number;
  totalPaid: number;
  pendingBalance: number;
  approvedAt: string | null;
  suspendedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateClick {
  id: string;
  affiliateId: string;
  ipAddress: string;
  userAgent: string | null;
  referrerUrl: string | null;
  landingUrl: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  fingerprint: string | null;
  createdAt: string;
}

export interface AffiliateConversion {
  id: string;
  affiliateId: string;
  orderId: string;
  status: AffiliateConversionStatus;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CommissionPayout {
  id: string;
  affiliateId: string;
  amount: number;
  currency: string;
  status: CommissionPayoutStatus;
  payoutMethod: string | null;
  transactionRef: string | null;
  processedAt: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}
