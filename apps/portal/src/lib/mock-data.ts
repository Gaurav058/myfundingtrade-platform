/* ──────────────────────────────────────────────
 * Mock data for the portal
 * All data is typed against @myfundingtrade/types
 * Replace with real API calls when backend is live
 * ────────────────────────────────────────────── */

import type {
  UserWithProfile,
  TraderAccount,
  TraderAccountPhase,
  Order,
  KycSubmission,
  PayoutRequest,
  PayoutMethod,
  AffiliateAccount,
  AffiliateConversion,
  SupportTicket,
  SupportMessage,
  Notification,
  LegalConsent,
  LegalDocument,
} from "@myfundingtrade/types";

// ── Current user ───────────────────────────────
export const mockUser: UserWithProfile = {
  id: "usr_001",
  email: "alex.trader@example.com",
  role: "TRADER",
  status: "ACTIVE",
  emailVerified: true,
  twoFactorEnabled: false,
  lastLoginAt: "2026-04-06T14:22:00Z",
  lastLoginIp: "192.168.1.1",
  deletedAt: null,
  createdAt: "2025-09-15T10:00:00Z",
  updatedAt: "2026-04-06T14:22:00Z",
  profile: {
    id: "prf_001",
    userId: "usr_001",
    firstName: "Alex",
    lastName: "Morgan",
    phone: "+44 7700 900123",
    dateOfBirth: "1994-06-15",
    country: "GB",
    state: null,
    city: "London",
    addressLine1: "42 Trading Lane",
    addressLine2: null,
    postalCode: "EC2R 8AH",
    timezone: "Europe/London",
    avatarUrl: null,
    bio: null,
    referralCode: "ALEXM2025",
    referredById: null,
    createdAt: "2025-09-15T10:00:00Z",
    updatedAt: "2026-03-20T09:00:00Z",
  },
};

// ── Orders ─────────────────────────────────────
export const mockOrders: Order[] = [
  {
    id: "ord_001", userId: "usr_001", variantId: "var_003", couponId: null,
    orderNumber: "MFT-2025-00147", status: "FULFILLED",
    subtotal: 299, discountAmount: 0, taxAmount: 0, totalAmount: 299, currency: "USD",
    affiliateId: null, metadata: null,
    paidAt: "2025-10-01T12:00:00Z", cancelledAt: null, refundedAt: null,
    createdAt: "2025-10-01T11:55:00Z", updatedAt: "2025-10-01T12:00:00Z",
  },
  {
    id: "ord_002", userId: "usr_001", variantId: "var_004", couponId: null,
    orderNumber: "MFT-2026-00312", status: "FULFILLED",
    subtotal: 499, discountAmount: 0, taxAmount: 0, totalAmount: 499, currency: "USD",
    affiliateId: null, metadata: null,
    paidAt: "2026-01-15T09:00:00Z", cancelledAt: null, refundedAt: null,
    createdAt: "2026-01-15T08:50:00Z", updatedAt: "2026-01-15T09:00:00Z",
  },
];

// ── Trader accounts ────────────────────────────
export const mockAccounts: TraderAccount[] = [
  {
    id: "acc_001", userId: "usr_001", orderId: "ord_001", variantId: "var_003",
    accountNumber: "MFT-50K-00147", platform: "MetaTrader 5", server: "MFT-Live-01",
    login: "50001234", status: "FUNDED", startingBalance: 50000,
    currentBalance: 54280, currentEquity: 54150, highWaterMark: 55100,
    currentPhase: "FUNDED", fundedAt: "2025-12-20T10:00:00Z",
    closedAt: null, closedReason: null, deletedAt: null,
    createdAt: "2025-10-01T12:00:00Z", updatedAt: "2026-04-06T18:00:00Z",
  },
  {
    id: "acc_002", userId: "usr_001", orderId: "ord_002", variantId: "var_004",
    accountNumber: "MFT-100K-00312", platform: "MetaTrader 5", server: "MFT-Live-01",
    login: "50005678", status: "ACTIVE", startingBalance: 100000,
    currentBalance: 104520, currentEquity: 104320, highWaterMark: 104520,
    currentPhase: "PHASE_1", fundedAt: null,
    closedAt: null, closedReason: null, deletedAt: null,
    createdAt: "2026-01-15T09:00:00Z", updatedAt: "2026-04-06T18:00:00Z",
  },
];

// ── Account phases ─────────────────────────────
export const mockPhases: TraderAccountPhase[] = [
  {
    id: "ph_001", traderAccountId: "acc_001", phase: "PHASE_1", status: "PASSED",
    startDate: "2025-10-01T12:00:00Z", endDate: "2025-11-10T16:00:00Z",
    startingBalance: 50000, endingBalance: 54200, highWaterMark: 54200,
    maxDailyDrawdown: 1.8, maxTotalDrawdown: 3.2,
    totalTrades: 87, winningTrades: 52, losingTrades: 35,
    tradingDays: 28, profitLoss: 4200,
    createdAt: "2025-10-01T12:00:00Z", updatedAt: "2025-11-10T16:00:00Z",
  },
  {
    id: "ph_002", traderAccountId: "acc_001", phase: "PHASE_2", status: "PASSED",
    startDate: "2025-11-12T09:00:00Z", endDate: "2025-12-18T15:00:00Z",
    startingBalance: 50000, endingBalance: 54100, highWaterMark: 54100,
    maxDailyDrawdown: 2.1, maxTotalDrawdown: 2.8,
    totalTrades: 65, winningTrades: 39, losingTrades: 26,
    tradingDays: 22, profitLoss: 4100,
    createdAt: "2025-11-12T09:00:00Z", updatedAt: "2025-12-18T15:00:00Z",
  },
  {
    id: "ph_003", traderAccountId: "acc_001", phase: "FUNDED", status: "ACTIVE",
    startDate: "2025-12-20T10:00:00Z", endDate: null,
    startingBalance: 50000, endingBalance: null, highWaterMark: 55100,
    maxDailyDrawdown: 2.4, maxTotalDrawdown: 4.1,
    totalTrades: 142, winningTrades: 82, losingTrades: 60,
    tradingDays: 68, profitLoss: 4280,
    createdAt: "2025-12-20T10:00:00Z", updatedAt: "2026-04-06T18:00:00Z",
  },
  {
    id: "ph_004", traderAccountId: "acc_002", phase: "PHASE_1", status: "ACTIVE",
    startDate: "2026-01-15T09:00:00Z", endDate: null,
    startingBalance: 100000, endingBalance: null, highWaterMark: 104520,
    maxDailyDrawdown: 1.9, maxTotalDrawdown: 2.3,
    totalTrades: 53, winningTrades: 31, losingTrades: 22,
    tradingDays: 35, profitLoss: 4520,
    createdAt: "2026-01-15T09:00:00Z", updatedAt: "2026-04-06T18:00:00Z",
  },
];

// ── KYC ────────────────────────────────────────
export const mockKyc: KycSubmission = {
  id: "kyc_001", userId: "usr_001", status: "APPROVED",
  documentType: "PASSPORT",
  documentFrontUrl: "/mock/passport-front.jpg",
  documentBackUrl: null,
  selfieUrl: "/mock/selfie.jpg",
  proofOfAddressUrl: "/mock/utility-bill.pdf",
  fullName: "Alexander Morgan", dateOfBirth: "1994-06-15", nationality: "GB",
  documentNumber: "***4567", documentExpiry: "2030-06-15",
  submittedAt: "2025-10-05T14:00:00Z", expiresAt: "2027-10-05T14:00:00Z",
  deletedAt: null,
  createdAt: "2025-10-05T14:00:00Z", updatedAt: "2025-10-07T09:00:00Z",
};

// ── Payout methods ─────────────────────────────
export const mockPayoutMethods: PayoutMethod[] = [
  {
    id: "pm_001", userId: "usr_001", type: "BANK_WIRE", label: "Barclays GBP",
    details: { bankName: "Barclays", accountEnding: "***7890", currency: "GBP" },
    isDefault: true, isVerified: true, deletedAt: null,
    createdAt: "2025-10-10T10:00:00Z", updatedAt: "2025-10-10T10:00:00Z",
  },
  {
    id: "pm_002", userId: "usr_001", type: "CRYPTO_WALLET", label: "USDT (TRC20)",
    details: { network: "TRC20", walletEnding: "***abc3" },
    isDefault: false, isVerified: true, deletedAt: null,
    createdAt: "2025-11-01T08:00:00Z", updatedAt: "2025-11-01T08:00:00Z",
  },
];

// ── Payout requests ────────────────────────────
export const mockPayouts: PayoutRequest[] = [
  {
    id: "pay_001", userId: "usr_001", traderAccountId: "acc_001", payoutMethodId: "pm_001",
    requestNumber: "PAY-2026-0042", amount: 3500, currency: "USD",
    profitSplit: 85, traderShare: 2975, companyShare: 525,
    status: "COMPLETED",
    reviewedBy: "admin_001", reviewNote: null, rejectionReason: null,
    transactionRef: "TXN-BW-20260305", processedAt: "2026-03-06T10:00:00Z",
    completedAt: "2026-03-06T14:00:00Z",
    createdAt: "2026-03-05T09:00:00Z", updatedAt: "2026-03-06T14:00:00Z",
  },
  {
    id: "pay_002", userId: "usr_001", traderAccountId: "acc_001", payoutMethodId: "pm_002",
    requestNumber: "PAY-2026-0098", amount: 1800, currency: "USD",
    profitSplit: 85, traderShare: 1530, companyShare: 270,
    status: "PENDING_APPROVAL",
    reviewedBy: null, reviewNote: null, rejectionReason: null,
    transactionRef: null, processedAt: null, completedAt: null,
    createdAt: "2026-04-04T11:00:00Z", updatedAt: "2026-04-04T11:00:00Z",
  },
];

// ── Affiliate ──────────────────────────────────
export const mockAffiliate: AffiliateAccount = {
  id: "aff_001", userId: "usr_001", affiliateCode: "ALEXM2025",
  status: "ACTIVE", commissionRate: 10, tier: 1,
  totalEarnings: 1240, totalPaid: 890, pendingBalance: 350,
  approvedAt: "2025-10-20T10:00:00Z", suspendedAt: null,
  createdAt: "2025-10-18T10:00:00Z", updatedAt: "2026-04-01T10:00:00Z",
};

export const mockConversions: AffiliateConversion[] = [
  {
    id: "conv_001", affiliateId: "aff_001", orderId: "ord_ext_001",
    status: "PAID", orderAmount: 299, commissionRate: 10, commissionAmount: 29.9,
    confirmedAt: "2025-12-05T10:00:00Z",
    createdAt: "2025-12-01T14:00:00Z", updatedAt: "2025-12-10T10:00:00Z",
  },
  {
    id: "conv_002", affiliateId: "aff_001", orderId: "ord_ext_002",
    status: "PAID", orderAmount: 499, commissionRate: 10, commissionAmount: 49.9,
    confirmedAt: "2026-01-20T10:00:00Z",
    createdAt: "2026-01-15T11:00:00Z", updatedAt: "2026-01-25T10:00:00Z",
  },
  {
    id: "conv_003", affiliateId: "aff_001", orderId: "ord_ext_003",
    status: "CONFIRMED", orderAmount: 299, commissionRate: 10, commissionAmount: 29.9,
    confirmedAt: "2026-03-28T10:00:00Z",
    createdAt: "2026-03-25T09:00:00Z", updatedAt: "2026-03-28T10:00:00Z",
  },
  {
    id: "conv_004", affiliateId: "aff_001", orderId: "ord_ext_004",
    status: "PENDING", orderAmount: 899, commissionRate: 10, commissionAmount: 89.9,
    confirmedAt: null,
    createdAt: "2026-04-02T16:00:00Z", updatedAt: "2026-04-02T16:00:00Z",
  },
];

// ── Support tickets ────────────────────────────
export const mockTickets: SupportTicket[] = [
  {
    id: "tkt_001", userId: "usr_001", assigneeId: "agent_001",
    ticketNumber: "TKT-2026-0134", subject: "Platform login issue on MT5",
    category: "TECHNICAL", priority: "MEDIUM", status: "RESOLVED",
    closedAt: "2026-02-20T14:00:00Z",
    createdAt: "2026-02-19T10:00:00Z", updatedAt: "2026-02-20T14:00:00Z",
  },
  {
    id: "tkt_002", userId: "usr_001", assigneeId: null,
    ticketNumber: "TKT-2026-0267", subject: "Payout processing delay",
    category: "PAYOUT", priority: "HIGH", status: "OPEN",
    closedAt: null,
    createdAt: "2026-04-05T08:00:00Z", updatedAt: "2026-04-05T08:00:00Z",
  },
];

export const mockMessages: SupportMessage[] = [
  {
    id: "msg_001", ticketId: "tkt_002", senderId: "usr_001",
    body: "Hi, I submitted a payout request (PAY-2026-0098) two days ago but haven't received any update. Could you please check the status?",
    isInternal: false, attachments: null,
    createdAt: "2026-04-05T08:00:00Z",
  },
  {
    id: "msg_002", ticketId: "tkt_002", senderId: "agent_002",
    body: "Hello Alex, thank you for reaching out. I can see your payout request is currently in the approval queue. We'll have an update for you within 24 hours.",
    isInternal: false, attachments: null,
    createdAt: "2026-04-05T09:30:00Z",
  },
];

// ── Notifications ──────────────────────────────
export const mockNotifications: Notification[] = [
  {
    id: "ntf_001", userId: "usr_001", type: "IN_APP", status: "READ",
    channel: "in_app", title: "Payout Completed",
    body: "Your payout of $2,975.00 (PAY-2026-0042) has been sent to your Barclays account.",
    metadata: null, sentAt: "2026-03-06T14:00:00Z", readAt: "2026-03-06T15:00:00Z",
    failedAt: null, failReason: null, createdAt: "2026-03-06T14:00:00Z",
  },
  {
    id: "ntf_002", userId: "usr_001", type: "IN_APP", status: "DELIVERED",
    channel: "in_app", title: "Phase 1 Progress: 4.5% of 8%",
    body: "Your MFT-100K-00312 account has reached 4.5% profit. Keep going!",
    metadata: null, sentAt: "2026-04-03T18:00:00Z", readAt: null,
    failedAt: null, failReason: null, createdAt: "2026-04-03T18:00:00Z",
  },
  {
    id: "ntf_003", userId: "usr_001", type: "IN_APP", status: "DELIVERED",
    channel: "in_app", title: "Payout Request Submitted",
    body: "Your payout request PAY-2026-0098 for $1,800.00 is pending approval.",
    metadata: null, sentAt: "2026-04-04T11:00:00Z", readAt: null,
    failedAt: null, failReason: null, createdAt: "2026-04-04T11:00:00Z",
  },
  {
    id: "ntf_004", userId: "usr_001", type: "IN_APP", status: "DELIVERED",
    channel: "in_app", title: "New Support Reply",
    body: "An agent replied to your ticket TKT-2026-0267.",
    metadata: null, sentAt: "2026-04-05T09:30:00Z", readAt: null,
    failedAt: null, failReason: null, createdAt: "2026-04-05T09:30:00Z",
  },
];

// ── Legal consents ─────────────────────────────
export const mockLegalDocuments: LegalDocument[] = [
  {
    id: "ldoc_001", type: "TERMS_OF_SERVICE", version: "2.1",
    title: "Terms of Service", content: "",
    effectiveAt: "2025-09-01T00:00:00Z", isActive: true,
    createdAt: "2025-08-15T00:00:00Z", updatedAt: "2025-08-15T00:00:00Z",
  },
  {
    id: "ldoc_002", type: "PRIVACY_POLICY", version: "2.0",
    title: "Privacy Policy", content: "",
    effectiveAt: "2025-09-01T00:00:00Z", isActive: true,
    createdAt: "2025-08-15T00:00:00Z", updatedAt: "2025-08-15T00:00:00Z",
  },
  {
    id: "ldoc_003", type: "RISK_DISCLOSURE", version: "1.3",
    title: "Risk Disclosure", content: "",
    effectiveAt: "2025-09-01T00:00:00Z", isActive: true,
    createdAt: "2025-08-15T00:00:00Z", updatedAt: "2025-08-15T00:00:00Z",
  },
  {
    id: "ldoc_004", type: "REFUND_POLICY", version: "1.1",
    title: "Refund Policy", content: "",
    effectiveAt: "2026-01-01T00:00:00Z", isActive: true,
    createdAt: "2025-12-15T00:00:00Z", updatedAt: "2025-12-15T00:00:00Z",
  },
];

export const mockLegalConsents: LegalConsent[] = [
  {
    id: "lc_001", userId: "usr_001", documentId: "ldoc_001",
    ipAddress: "192.168.1.1", userAgent: "Mozilla/5.0",
    consentedAt: "2025-09-15T10:00:00Z",
  },
  {
    id: "lc_002", userId: "usr_001", documentId: "ldoc_002",
    ipAddress: "192.168.1.1", userAgent: "Mozilla/5.0",
    consentedAt: "2025-09-15T10:00:00Z",
  },
  {
    id: "lc_003", userId: "usr_001", documentId: "ldoc_003",
    ipAddress: "192.168.1.1", userAgent: "Mozilla/5.0",
    consentedAt: "2025-09-15T10:00:00Z",
  },
];
