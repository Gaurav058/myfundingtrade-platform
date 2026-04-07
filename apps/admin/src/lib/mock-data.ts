import type { UserWithProfile } from "@myfundingtrade/types";
import type {
  ChallengePlan, ChallengeVariant, ChallengeRuleSet,
  Order, Payment, Coupon, TraderAccount, TraderAccountPhase, AccountEvaluationResult,
} from "@myfundingtrade/types";
import type { PayoutRequest, PayoutMethod } from "@myfundingtrade/types";
import type { AffiliateAccount, AffiliateConversion, CommissionPayout, AffiliateClick } from "@myfundingtrade/types";
import type { KycSubmission, KycReview, LegalDocument, GeoRestriction, PlatformRestriction } from "@myfundingtrade/types";
import type { BlogPost, BlogCategory, FAQItem } from "@myfundingtrade/types";
import type { SupportTicket, SupportMessage } from "@myfundingtrade/types";
import type { Notification, AdminActionLog, SystemSetting } from "@myfundingtrade/types";

// ── Helper ──────────────────────────────────────────────────────────────

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString();

// ── Users ───────────────────────────────────────────────────────────────

export const mockUsers: UserWithProfile[] = [
  {
    id: "usr_001", email: "alex.morgan@example.com", role: "TRADER", status: "ACTIVE",
    emailVerified: true, twoFactorEnabled: true, lastLoginAt: d(0), lastLoginIp: "192.168.1.10",
    deletedAt: null, createdAt: d(120), updatedAt: d(0),
    profile: {
      id: "prf_001", userId: "usr_001", firstName: "Alex", lastName: "Morgan",
      phone: "+1-555-0101", dateOfBirth: "1990-06-15", country: "US", state: "CA",
      city: "Los Angeles", addressLine1: "123 Main St", addressLine2: null, postalCode: "90001",
      timezone: "America/Los_Angeles", avatarUrl: null, bio: null,
      referralCode: "ALEX2025", referredById: null, createdAt: d(120), updatedAt: d(0),
    },
  },
  {
    id: "usr_002", email: "sarah.chen@example.com", role: "TRADER", status: "ACTIVE",
    emailVerified: true, twoFactorEnabled: false, lastLoginAt: d(1), lastLoginIp: "10.0.0.55",
    deletedAt: null, createdAt: d(90), updatedAt: d(1),
    profile: {
      id: "prf_002", userId: "usr_002", firstName: "Sarah", lastName: "Chen",
      phone: "+44-7700-900123", dateOfBirth: "1988-03-22", country: "GB", state: null,
      city: "London", addressLine1: "45 Baker Street", addressLine2: "Flat 2B", postalCode: "W1U 8EW",
      timezone: "Europe/London", avatarUrl: null, bio: null,
      referralCode: "SARAH88", referredById: "usr_001", createdAt: d(90), updatedAt: d(1),
    },
  },
  {
    id: "usr_003", email: "james.wilson@example.com", role: "AFFILIATE", status: "ACTIVE",
    emailVerified: true, twoFactorEnabled: true, lastLoginAt: d(2), lastLoginIp: "172.16.0.22",
    deletedAt: null, createdAt: d(200), updatedAt: d(2),
    profile: {
      id: "prf_003", userId: "usr_003", firstName: "James", lastName: "Wilson",
      phone: "+1-555-0303", dateOfBirth: "1985-11-08", country: "US", state: "NY",
      city: "New York", addressLine1: "789 Broadway", addressLine2: null, postalCode: "10003",
      timezone: "America/New_York", avatarUrl: null, bio: "Pro affiliate marketer",
      referralCode: "JAMES85", referredById: null, createdAt: d(200), updatedAt: d(2),
    },
  },
  {
    id: "usr_004", email: "maria.garcia@example.com", role: "TRADER", status: "SUSPENDED",
    emailVerified: true, twoFactorEnabled: false, lastLoginAt: d(30), lastLoginIp: "203.0.113.50",
    deletedAt: null, createdAt: d(60), updatedAt: d(5),
    profile: {
      id: "prf_004", userId: "usr_004", firstName: "Maria", lastName: "Garcia",
      phone: "+34-600-123456", dateOfBirth: "1992-09-01", country: "ES", state: null,
      city: "Madrid", addressLine1: "Calle Gran Via 10", addressLine2: null, postalCode: "28013",
      timezone: "Europe/Madrid", avatarUrl: null, bio: null,
      referralCode: null, referredById: null, createdAt: d(60), updatedAt: d(5),
    },
  },
  {
    id: "usr_005", email: "admin@myfundingtrade.com", role: "SUPER_ADMIN", status: "ACTIVE",
    emailVerified: true, twoFactorEnabled: true, lastLoginAt: d(0), lastLoginIp: "10.0.0.1",
    deletedAt: null, createdAt: d(365), updatedAt: d(0),
    profile: {
      id: "prf_005", userId: "usr_005", firstName: "System", lastName: "Admin",
      phone: null, dateOfBirth: null, country: "US", state: null,
      city: null, addressLine1: null, addressLine2: null, postalCode: null,
      timezone: "UTC", avatarUrl: null, bio: null,
      referralCode: null, referredById: null, createdAt: d(365), updatedAt: d(0),
    },
  },
];

// ── Challenge Plans & Rules ─────────────────────────────────────────────

export const mockPlans: ChallengePlan[] = [
  { id: "plan_001", name: "Standard Challenge", slug: "standard", description: "Standard 2-phase evaluation", isActive: true, sortOrder: 1, deletedAt: null, createdAt: d(300), updatedAt: d(10) },
  { id: "plan_002", name: "Aggressive Challenge", slug: "aggressive", description: "Higher targets, faster funding", isActive: true, sortOrder: 2, deletedAt: null, createdAt: d(300), updatedAt: d(10) },
  { id: "plan_003", name: "Instant Funded", slug: "instant-funded", description: "Skip evaluation, start funded", isActive: false, sortOrder: 3, deletedAt: null, createdAt: d(200), updatedAt: d(30) },
];

export const mockRuleSets: ChallengeRuleSet[] = [
  {
    id: "rs_001", name: "Standard Rules", profitTargetPct: 8, maxDailyLossPct: 5, maxTotalLossPct: 10,
    minTradingDays: 5, maxCalendarDays: 30, maxInactivityDays: 14,
    allowWeekendHolding: true, allowNewsTrading: true, allowExpertAdvisors: true,
    allowHedging: true, allowCopying: false, maxLotSize: null,
    allowedInstruments: null, restrictedInstruments: null,
    fundedProfitTargetPct: null, fundedMaxDailyLossPct: 5, fundedMaxTotalLossPct: 10,
    createdAt: d(300), updatedAt: d(10),
  },
  {
    id: "rs_002", name: "Aggressive Rules", profitTargetPct: 12, maxDailyLossPct: 5, maxTotalLossPct: 8,
    minTradingDays: 3, maxCalendarDays: 14, maxInactivityDays: 7,
    allowWeekendHolding: false, allowNewsTrading: false, allowExpertAdvisors: false,
    allowHedging: false, allowCopying: false, maxLotSize: 50,
    allowedInstruments: "FOREX,INDICES", restrictedInstruments: "CRYPTO",
    fundedProfitTargetPct: null, fundedMaxDailyLossPct: 5, fundedMaxTotalLossPct: 8,
    createdAt: d(300), updatedAt: d(10),
  },
];

export const mockVariants: ChallengeVariant[] = [
  { id: "var_001", planId: "plan_001", ruleSetId: "rs_001", accountSize: 10000, price: 99, currency: "USD", leverage: 100, profitSplit: 80, phases: 2, isActive: true, deletedAt: null, createdAt: d(300), updatedAt: d(10) },
  { id: "var_002", planId: "plan_001", ruleSetId: "rs_001", accountSize: 25000, price: 199, currency: "USD", leverage: 100, profitSplit: 80, phases: 2, isActive: true, deletedAt: null, createdAt: d(300), updatedAt: d(10) },
  { id: "var_003", planId: "plan_001", ruleSetId: "rs_001", accountSize: 50000, price: 299, currency: "USD", leverage: 100, profitSplit: 80, phases: 2, isActive: true, deletedAt: null, createdAt: d(300), updatedAt: d(10) },
  { id: "var_004", planId: "plan_001", ruleSetId: "rs_001", accountSize: 100000, price: 499, currency: "USD", leverage: 100, profitSplit: 80, phases: 2, isActive: true, deletedAt: null, createdAt: d(300), updatedAt: d(10) },
  { id: "var_005", planId: "plan_002", ruleSetId: "rs_002", accountSize: 50000, price: 399, currency: "USD", leverage: 50, profitSplit: 90, phases: 2, isActive: true, deletedAt: null, createdAt: d(250), updatedAt: d(10) },
  { id: "var_006", planId: "plan_002", ruleSetId: "rs_002", accountSize: 100000, price: 699, currency: "USD", leverage: 50, profitSplit: 90, phases: 2, isActive: true, deletedAt: null, createdAt: d(250), updatedAt: d(10) },
];

// ── Orders & Payments ───────────────────────────────────────────────────

export const mockOrders: Order[] = [
  {
    id: "ord_001", userId: "usr_001", variantId: "var_003", couponId: null,
    orderNumber: "MFT-2025-0001", status: "PAID", subtotal: 299, discountAmount: 0, taxAmount: 0,
    totalAmount: 299, currency: "USD", affiliateId: null, metadata: null,
    paidAt: d(100), cancelledAt: null, refundedAt: null, createdAt: d(100), updatedAt: d(100),
  },
  {
    id: "ord_002", userId: "usr_001", variantId: "var_004", couponId: "cpn_001",
    orderNumber: "MFT-2025-0002", status: "PAID", subtotal: 499, discountAmount: 49.9, taxAmount: 0,
    totalAmount: 449.1, currency: "USD", affiliateId: null, metadata: null,
    paidAt: d(60), cancelledAt: null, refundedAt: null, createdAt: d(60), updatedAt: d(60),
  },
  {
    id: "ord_003", userId: "usr_002", variantId: "var_005", couponId: null,
    orderNumber: "MFT-2025-0003", status: "PAID", subtotal: 399, discountAmount: 0, taxAmount: 0,
    totalAmount: 399, currency: "USD", affiliateId: "aff_001", metadata: null,
    paidAt: d(45), cancelledAt: null, refundedAt: null, createdAt: d(45), updatedAt: d(45),
  },
  {
    id: "ord_004", userId: "usr_004", variantId: "var_001", couponId: null,
    orderNumber: "MFT-2025-0004", status: "REFUNDED", subtotal: 99, discountAmount: 0, taxAmount: 0,
    totalAmount: 99, currency: "USD", affiliateId: null, metadata: null,
    paidAt: d(50), cancelledAt: null, refundedAt: d(40), createdAt: d(50), updatedAt: d(40),
  },
  {
    id: "ord_005", userId: "usr_002", variantId: "var_002", couponId: null,
    orderNumber: "MFT-2025-0005", status: "PENDING_PAYMENT", subtotal: 199, discountAmount: 0, taxAmount: 0,
    totalAmount: 199, currency: "USD", affiliateId: null, metadata: null,
    paidAt: null, cancelledAt: null, refundedAt: null, createdAt: d(1), updatedAt: d(1),
  },
];

export const mockPayments: Payment[] = [
  { id: "pay_001", orderId: "ord_001", provider: "STRIPE", status: "SUCCEEDED", amount: 299, currency: "USD", providerPaymentId: "pi_3abc", providerFee: 8.97, refundedAmount: null, failureReason: null, metadata: null, paidAt: d(100), createdAt: d(100), updatedAt: d(100) },
  { id: "pay_002", orderId: "ord_002", provider: "STRIPE", status: "SUCCEEDED", amount: 449.1, currency: "USD", providerPaymentId: "pi_4def", providerFee: 13.47, refundedAmount: null, failureReason: null, metadata: null, paidAt: d(60), createdAt: d(60), updatedAt: d(60) },
  { id: "pay_003", orderId: "ord_003", provider: "CRYPTO", status: "SUCCEEDED", amount: 399, currency: "USD", providerPaymentId: "tx_0x5ghi", providerFee: 0, refundedAmount: null, failureReason: null, metadata: null, paidAt: d(45), createdAt: d(45), updatedAt: d(45) },
  { id: "pay_004", orderId: "ord_004", provider: "STRIPE", status: "REFUNDED", amount: 99, currency: "USD", providerPaymentId: "pi_6jkl", providerFee: 2.97, refundedAmount: 99, failureReason: null, metadata: null, paidAt: d(50), createdAt: d(50), updatedAt: d(40) },
];

// ── Coupons ─────────────────────────────────────────────────────────────

export const mockCoupons: Coupon[] = [
  { id: "cpn_001", code: "WELCOME10", type: "PERCENTAGE", value: 10, currency: "USD", minOrderAmount: null, maxUsageCount: 1000, usageCount: 342, maxUsagePerUser: 1, validFrom: d(180), validUntil: d(-90), isActive: true, affiliateId: null, createdAt: d(180), updatedAt: d(0) },
  { id: "cpn_002", code: "SUMMER25", type: "FIXED_AMOUNT", value: 25, currency: "USD", minOrderAmount: 199, maxUsageCount: 500, usageCount: 88, maxUsagePerUser: 1, validFrom: d(30), validUntil: d(-30), isActive: true, affiliateId: null, createdAt: d(30), updatedAt: d(0) },
  { id: "cpn_003", code: "AFFILIATE50", type: "PERCENTAGE", value: 15, currency: "USD", minOrderAmount: null, maxUsageCount: null, usageCount: 1205, maxUsagePerUser: 1, validFrom: d(300), validUntil: null, isActive: true, affiliateId: "aff_001", createdAt: d(300), updatedAt: d(0) },
];

// ── Trader Accounts & Phases ────────────────────────────────────────────

export const mockAccounts: TraderAccount[] = [
  {
    id: "acc_001", userId: "usr_001", orderId: "ord_001", variantId: "var_003",
    accountNumber: "MFT-50K-0001", platform: "MetaTrader 5", server: "MFT-Live-01", login: "500001",
    status: "FUNDED", startingBalance: 50000, currentBalance: 54200, currentEquity: 54100, highWaterMark: 54500,
    currentPhase: "FUNDED", fundedAt: d(30), closedAt: null, closedReason: null, deletedAt: null, createdAt: d(100), updatedAt: d(0),
  },
  {
    id: "acc_002", userId: "usr_001", orderId: "ord_002", variantId: "var_004",
    accountNumber: "MFT-100K-0001", platform: "MetaTrader 5", server: "MFT-Live-01", login: "500002",
    status: "ACTIVE", startingBalance: 100000, currentBalance: 103500, currentEquity: 103200, highWaterMark: 104000,
    currentPhase: "PHASE_1", fundedAt: null, closedAt: null, closedReason: null, deletedAt: null, createdAt: d(60), updatedAt: d(0),
  },
  {
    id: "acc_003", userId: "usr_002", orderId: "ord_003", variantId: "var_005",
    accountNumber: "MFT-50K-0002", platform: "MetaTrader 5", server: "MFT-Live-02", login: "500003",
    status: "BREACHED", startingBalance: 50000, currentBalance: 44500, currentEquity: 44500, highWaterMark: 51000,
    currentPhase: "PHASE_1", fundedAt: null, closedAt: d(10), closedReason: "Max total drawdown exceeded", deletedAt: null, createdAt: d(45), updatedAt: d(10),
  },
  {
    id: "acc_004", userId: "usr_004", orderId: "ord_004", variantId: "var_001",
    accountNumber: "MFT-10K-0001", platform: "MetaTrader 5", server: "MFT-Live-01", login: "500004",
    status: "CLOSED", startingBalance: 10000, currentBalance: 0, currentEquity: 0, highWaterMark: 10200,
    currentPhase: "PHASE_1", fundedAt: null, closedAt: d(35), closedReason: "Order refunded", deletedAt: null, createdAt: d(50), updatedAt: d(35),
  },
];

export const mockPhases: TraderAccountPhase[] = [
  { id: "ph_001", traderAccountId: "acc_001", phase: "PHASE_1", status: "PASSED", startDate: d(100), endDate: d(70), startingBalance: 50000, endingBalance: 54200, highWaterMark: 54500, maxDailyDrawdown: 1200, maxTotalDrawdown: 2500, totalTrades: 48, winningTrades: 31, losingTrades: 17, tradingDays: 12, profitLoss: 4200, createdAt: d(100), updatedAt: d(70) },
  { id: "ph_002", traderAccountId: "acc_001", phase: "PHASE_2", status: "PASSED", startDate: d(70), endDate: d(40), startingBalance: 50000, endingBalance: 52800, highWaterMark: 53000, maxDailyDrawdown: 800, maxTotalDrawdown: 1500, totalTrades: 35, winningTrades: 22, losingTrades: 13, tradingDays: 10, profitLoss: 2800, createdAt: d(70), updatedAt: d(40) },
  { id: "ph_003", traderAccountId: "acc_001", phase: "FUNDED", status: "ACTIVE", startDate: d(30), endDate: null, startingBalance: 50000, endingBalance: null, highWaterMark: 54500, maxDailyDrawdown: 1500, maxTotalDrawdown: 3000, totalTrades: 25, winningTrades: 16, losingTrades: 9, tradingDays: 8, profitLoss: 4200, createdAt: d(30), updatedAt: d(0) },
  { id: "ph_004", traderAccountId: "acc_002", phase: "PHASE_1", status: "ACTIVE", startDate: d(60), endDate: null, startingBalance: 100000, endingBalance: null, highWaterMark: 104000, maxDailyDrawdown: 2200, maxTotalDrawdown: 4500, totalTrades: 38, winningTrades: 24, losingTrades: 14, tradingDays: 15, profitLoss: 3500, createdAt: d(60), updatedAt: d(0) },
  { id: "ph_005", traderAccountId: "acc_003", phase: "PHASE_1", status: "FAILED", startDate: d(45), endDate: d(10), startingBalance: 50000, endingBalance: 44500, highWaterMark: 51000, maxDailyDrawdown: 3200, maxTotalDrawdown: 5500, totalTrades: 22, winningTrades: 8, losingTrades: 14, tradingDays: 9, profitLoss: -5500, createdAt: d(45), updatedAt: d(10) },
];

export const mockEvaluations: AccountEvaluationResult[] = [
  { id: "eval_001", phaseId: "ph_001", verdict: "PASSED", profitTargetMet: true, dailyLossBreached: false, totalLossBreached: false, minDaysMet: true, ruleViolations: null, evaluatedAt: d(70), reviewedBy: "usr_005", reviewNote: "Clean pass", createdAt: d(70) },
  { id: "eval_002", phaseId: "ph_005", verdict: "FAILED_TOTAL_LOSS", profitTargetMet: false, dailyLossBreached: false, totalLossBreached: true, minDaysMet: true, ruleViolations: null, evaluatedAt: d(10), reviewedBy: null, reviewNote: null, createdAt: d(10) },
];

// ── KYC ─────────────────────────────────────────────────────────────────

export const mockKycSubmissions: KycSubmission[] = [
  { id: "kyc_001", userId: "usr_001", status: "APPROVED", documentType: "PASSPORT", documentFrontUrl: "/mock/passport_front.jpg", documentBackUrl: null, selfieUrl: "/mock/selfie.jpg", proofOfAddressUrl: "/mock/poa.pdf", fullName: "Alexander Morgan", dateOfBirth: "1990-06-15", nationality: "US", documentNumber: "P12345678", documentExpiry: "2030-06-15", submittedAt: d(110), expiresAt: null, deletedAt: null, createdAt: d(110), updatedAt: d(108) },
  { id: "kyc_002", userId: "usr_002", status: "UNDER_REVIEW", documentType: "DRIVERS_LICENSE", documentFrontUrl: "/mock/dl_front.jpg", documentBackUrl: "/mock/dl_back.jpg", selfieUrl: "/mock/selfie2.jpg", proofOfAddressUrl: "/mock/poa2.pdf", fullName: "Sarah Chen", dateOfBirth: "1988-03-22", nationality: "GB", documentNumber: "CHEN883224", documentExpiry: "2028-03-22", submittedAt: d(3), expiresAt: null, deletedAt: null, createdAt: d(3), updatedAt: d(3) },
  { id: "kyc_003", userId: "usr_004", status: "REJECTED", documentType: "GOVERNMENT_ID", documentFrontUrl: "/mock/id_front.jpg", documentBackUrl: "/mock/id_back.jpg", selfieUrl: null, proofOfAddressUrl: null, fullName: "Maria Garcia", dateOfBirth: "1992-09-01", nationality: "ES", documentNumber: "X1234567A", documentExpiry: "2027-09-01", submittedAt: d(55), expiresAt: null, deletedAt: null, createdAt: d(55), updatedAt: d(53) },
];

export const mockKycReviews: KycReview[] = [
  { id: "kr_001", submissionId: "kyc_001", reviewerId: "usr_005", decision: "APPROVED", reason: "All documents verified", internalNote: "Passport matched, address confirmed", createdAt: d(108) },
  { id: "kr_002", submissionId: "kyc_003", reviewerId: "usr_005", decision: "REJECTED", reason: "Selfie missing, ID photo blurry", internalNote: "Low quality scan, needs resubmission", createdAt: d(53) },
];

// ── Payouts ─────────────────────────────────────────────────────────────

export const mockPayoutRequests: PayoutRequest[] = [
  { id: "pout_001", userId: "usr_001", traderAccountId: "acc_001", payoutMethodId: "pm_001", requestNumber: "PAY-2026-0042", amount: 3500, currency: "USD", profitSplit: 80, traderShare: 2800, companyShare: 700, status: "PENDING_APPROVAL", reviewedBy: null, reviewNote: null, rejectionReason: null, transactionRef: null, processedAt: null, completedAt: null, createdAt: d(5), updatedAt: d(5) },
  { id: "pout_002", userId: "usr_001", traderAccountId: "acc_001", payoutMethodId: "pm_001", requestNumber: "PAY-2026-0098", amount: 1800, currency: "USD", profitSplit: 80, traderShare: 1440, companyShare: 360, status: "COMPLETED", reviewedBy: "usr_005", reviewNote: "Approved — clean trading history", rejectionReason: null, transactionRef: "TXN-88823", processedAt: d(20), completedAt: d(18), createdAt: d(25), updatedAt: d(18) },
  { id: "pout_003", userId: "usr_002", traderAccountId: "acc_003", payoutMethodId: null, requestNumber: "PAY-2026-0110", amount: 500, currency: "USD", profitSplit: 90, traderShare: 450, companyShare: 50, status: "REJECTED", reviewedBy: "usr_005", reviewNote: null, rejectionReason: "Account breached before processing", transactionRef: null, processedAt: null, completedAt: null, createdAt: d(12), updatedAt: d(10) },
];

export const mockPayoutMethods: PayoutMethod[] = [
  { id: "pm_001", userId: "usr_001", type: "BANK_WIRE", label: "Chase Checking", details: { bankName: "Chase", accountNumber: "****4521", routingNumber: "****8900" }, isDefault: true, isVerified: true, deletedAt: null, createdAt: d(100), updatedAt: d(100) },
  { id: "pm_002", userId: "usr_001", type: "CRYPTO_WALLET", label: "BTC Wallet", details: { network: "Bitcoin", address: "bc1q...xyz" }, isDefault: false, isVerified: true, deletedAt: null, createdAt: d(80), updatedAt: d(80) },
];

// ── Affiliates ──────────────────────────────────────────────────────────

export const mockAffiliates: AffiliateAccount[] = [
  { id: "aff_001", userId: "usr_003", affiliateCode: "JAMES85", status: "ACTIVE", commissionRate: 10, tier: 1, totalEarnings: 3250, totalPaid: 2500, pendingBalance: 750, approvedAt: d(180), suspendedAt: null, createdAt: d(200), updatedAt: d(0) },
  { id: "aff_002", userId: "usr_001", affiliateCode: "ALEX2025", status: "ACTIVE", commissionRate: 8, tier: 1, totalEarnings: 890, totalPaid: 500, pendingBalance: 390, approvedAt: d(100), suspendedAt: null, createdAt: d(110), updatedAt: d(0) },
];

export const mockConversions: AffiliateConversion[] = [
  { id: "conv_001", affiliateId: "aff_001", orderId: "ord_003", status: "PAID", orderAmount: 399, commissionRate: 10, commissionAmount: 39.9, confirmedAt: d(40), createdAt: d(45), updatedAt: d(40) },
  { id: "conv_002", affiliateId: "aff_001", orderId: "ord_001", status: "CONFIRMED", orderAmount: 299, commissionRate: 10, commissionAmount: 29.9, confirmedAt: d(90), createdAt: d(100), updatedAt: d(90) },
  { id: "conv_003", affiliateId: "aff_002", orderId: "ord_002", status: "PENDING", orderAmount: 449.1, commissionRate: 8, commissionAmount: 35.93, confirmedAt: null, createdAt: d(60), updatedAt: d(60) },
];

export const mockCommissionPayouts: CommissionPayout[] = [
  { id: "cpay_001", affiliateId: "aff_001", amount: 2500, currency: "USD", status: "COMPLETED", payoutMethod: "BANK_WIRE", transactionRef: "AFP-001", processedAt: d(15), note: null, createdAt: d(20), updatedAt: d(15) },
];

export const mockAffiliateClicks: AffiliateClick[] = [
  { id: "clk_001", affiliateId: "aff_001", ipAddress: "203.0.113.10", userAgent: "Mozilla/5.0", referrerUrl: "https://youtube.com/watch?v=abc", landingUrl: "https://myfundingtrade.com/?ref=JAMES85", utmSource: "youtube", utmMedium: "video", utmCampaign: "q2-promo", fingerprint: "fp_abc123", createdAt: d(1) },
  { id: "clk_002", affiliateId: "aff_001", ipAddress: "198.51.100.20", userAgent: "Mozilla/5.0", referrerUrl: "https://twitter.com/james", landingUrl: "https://myfundingtrade.com/?ref=JAMES85", utmSource: "twitter", utmMedium: "social", utmCampaign: null, fingerprint: "fp_def456", createdAt: d(1) },
  { id: "clk_003", affiliateId: "aff_001", ipAddress: "203.0.113.10", userAgent: "Mozilla/5.0", referrerUrl: "https://youtube.com/watch?v=xyz", landingUrl: "https://myfundingtrade.com/?ref=JAMES85", utmSource: "youtube", utmMedium: "video", utmCampaign: "q2-promo", fingerprint: "fp_abc123", createdAt: d(0) },
  { id: "clk_004", affiliateId: "aff_002", ipAddress: "192.0.2.50", userAgent: "Mozilla/5.0", referrerUrl: null, landingUrl: "https://myfundingtrade.com/?ref=ALEX2025", utmSource: null, utmMedium: null, utmCampaign: null, fingerprint: "fp_ghi789", createdAt: d(2) },
];

export interface FraudSignal {
  type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  detail: string;
}

export const mockFraudSignals: Array<{ affiliateId: string; affiliateCode: string; signals: FraudSignal[] }> = [
  {
    affiliateId: "aff_001",
    affiliateCode: "JAMES85",
    signals: [
      { type: "REPEATED_IP", severity: "MEDIUM", detail: "1 IP(s) with >10 clicks today: 203.0.113.10 (15x)" },
      { type: "CLICK_SPIKE", severity: "MEDIUM", detail: "42 clicks in last 24h vs 7-day avg of 8.3/day (5.1x normal)" },
    ],
  },
];

// ── Support ─────────────────────────────────────────────────────────────

export const mockTickets: SupportTicket[] = [
  { id: "tk_001", userId: "usr_001", assigneeId: "usr_005", ticketNumber: "TK-0001", subject: "Cannot access funded account", category: "TRADING", priority: "HIGH", status: "IN_PROGRESS", closedAt: null, createdAt: d(2), updatedAt: d(1) },
  { id: "tk_002", userId: "usr_002", assigneeId: null, ticketNumber: "TK-0002", subject: "KYC document resubmission help", category: "KYC", priority: "MEDIUM", status: "OPEN", closedAt: null, createdAt: d(1), updatedAt: d(1) },
  { id: "tk_003", userId: "usr_004", assigneeId: "usr_005", ticketNumber: "TK-0003", subject: "Refund not received yet", category: "BILLING", priority: "URGENT", status: "ESCALATED", closedAt: null, createdAt: d(5), updatedAt: d(3) },
  { id: "tk_004", userId: "usr_001", assigneeId: "usr_005", ticketNumber: "TK-0004", subject: "Payout status inquiry", category: "PAYOUT", priority: "LOW", status: "RESOLVED", closedAt: d(8), createdAt: d(15), updatedAt: d(8) },
];

export const mockMessages: SupportMessage[] = [
  { id: "msg_001", ticketId: "tk_001", senderId: "usr_001", body: "I funded my 50K account last week but the platform says access denied. Can you help?", isInternal: false, attachments: null, createdAt: d(2) },
  { id: "msg_002", ticketId: "tk_001", senderId: "usr_005", body: "Looking into this now. Can you confirm your account number?", isInternal: false, attachments: null, createdAt: d(1) },
  { id: "msg_003", ticketId: "tk_001", senderId: "usr_005", body: "Server team confirmed — credentials will be reset in 2h.", isInternal: true, attachments: null, createdAt: d(1) },
  { id: "msg_004", ticketId: "tk_003", senderId: "usr_004", body: "My order was refunded 10 days ago but I still haven't received the money.", isInternal: false, attachments: null, createdAt: d(5) },
];

// ── Blog & Content ──────────────────────────────────────────────────────

export const mockBlogCategories: BlogCategory[] = [
  { id: "bcat_001", name: "Trading Education", slug: "trading-education", sortOrder: 1, createdAt: d(200), updatedAt: d(200) },
  { id: "bcat_002", name: "Platform Updates", slug: "platform-updates", sortOrder: 2, createdAt: d(200), updatedAt: d(200) },
  { id: "bcat_003", name: "Market Analysis", slug: "market-analysis", sortOrder: 3, createdAt: d(150), updatedAt: d(150) },
];

export const mockBlogPosts: BlogPost[] = [
  { id: "bp_001", authorId: "usr_005", categoryId: "bcat_001", title: "5 Rules Every Funded Trader Must Follow", slug: "5-rules-funded-trader", excerpt: "Key rules that keep funded traders profitable and within guidelines.", content: "<p>Long form content here...</p>", coverImage: null, status: "PUBLISHED", publishedAt: d(10), seoTitle: "5 Rules for Funded Traders", seoDescription: "Essential rules for prop firm funded traders", deletedAt: null, createdAt: d(15), updatedAt: d(10) },
  { id: "bp_002", authorId: "usr_005", categoryId: "bcat_002", title: "New Instant Funded Plan Coming Soon", slug: "instant-funded-announcement", excerpt: "We're launching a skip-evaluation plan.", content: "<p>Exciting update...</p>", coverImage: null, status: "DRAFT", publishedAt: null, seoTitle: null, seoDescription: null, deletedAt: null, createdAt: d(3), updatedAt: d(3) },
  { id: "bp_003", authorId: "usr_005", categoryId: "bcat_003", title: "Q2 2026 Market Outlook", slug: "q2-2026-outlook", excerpt: "Our analysis of the markets heading into Q2.", content: "<p>Market analysis content...</p>", coverImage: null, status: "SCHEDULED", publishedAt: d(-7), seoTitle: "Q2 2026 Market Outlook", seoDescription: "Market outlook for Q2 2026", deletedAt: null, createdAt: d(5), updatedAt: d(5) },
];

export const mockFaqs: FAQItem[] = [
  { id: "faq_001", question: "What is a prop firm challenge?", answer: "A prop firm challenge is an evaluation program where traders demonstrate their skills to receive funded trading capital.", category: "General", sortOrder: 1, isPublished: true, createdAt: d(200), updatedAt: d(50) },
  { id: "faq_002", question: "How long do I have to complete the challenge?", answer: "Standard challenges have a 30-day limit per phase. Aggressive challenges have a 14-day limit.", category: "Challenges", sortOrder: 2, isPublished: true, createdAt: d(200), updatedAt: d(50) },
  { id: "faq_003", question: "What payment methods do you accept?", answer: "We accept credit/debit cards via Stripe and cryptocurrency payments.", category: "Billing", sortOrder: 3, isPublished: true, createdAt: d(200), updatedAt: d(50) },
  { id: "faq_004", question: "How do I request a payout?", answer: "Navigate to the Payouts section in your trader portal and click Request Payout. You'll need approved KYC.", category: "Payouts", sortOrder: 4, isPublished: true, createdAt: d(180), updatedAt: d(30) },
  { id: "faq_005", question: "Can I use Expert Advisors?", answer: "EAs are allowed on Standard challenges but not on Aggressive challenges.", category: "Trading Rules", sortOrder: 5, isPublished: false, createdAt: d(10), updatedAt: d(10) },
];

// ── Legal ───────────────────────────────────────────────────────────────

export const mockLegalDocs: LegalDocument[] = [
  { id: "ld_001", type: "TERMS_OF_SERVICE", version: "2.1", title: "Terms of Service", content: "Full TOS content...", effectiveAt: d(30), isActive: true, createdAt: d(60), updatedAt: d(30) },
  { id: "ld_002", type: "PRIVACY_POLICY", version: "1.3", title: "Privacy Policy", content: "Full privacy policy...", effectiveAt: d(30), isActive: true, createdAt: d(90), updatedAt: d(30) },
  { id: "ld_003", type: "RISK_DISCLOSURE", version: "1.0", title: "Risk Disclosure", content: "Full risk disclosure...", effectiveAt: d(180), isActive: true, createdAt: d(200), updatedAt: d(180) },
  { id: "ld_004", type: "REFUND_POLICY", version: "1.1", title: "Refund Policy", content: "Full refund policy...", effectiveAt: d(30), isActive: true, createdAt: d(120), updatedAt: d(30) },
];

// ── Restrictions ────────────────────────────────────────────────────────

export const mockGeoRestrictions: GeoRestriction[] = [
  { id: "gr_001", countryCode: "US", countryName: "United States", type: "ALLOWED", reason: null, isActive: true, createdAt: d(300), updatedAt: d(300) },
  { id: "gr_002", countryCode: "KP", countryName: "North Korea", type: "BLOCKED", reason: "OFAC sanctions", isActive: true, createdAt: d(300), updatedAt: d(300) },
  { id: "gr_003", countryCode: "IR", countryName: "Iran", type: "BLOCKED", reason: "OFAC sanctions", isActive: true, createdAt: d(300), updatedAt: d(300) },
  { id: "gr_004", countryCode: "CU", countryName: "Cuba", type: "BLOCKED", reason: "OFAC sanctions", isActive: true, createdAt: d(300), updatedAt: d(300) },
];

export const mockPlatformRestrictions: PlatformRestriction[] = [
  { id: "pr_001", key: "new_registrations", isEnabled: true, description: "Allow new user registrations", metadata: null, createdAt: d(300), updatedAt: d(0) },
  { id: "pr_002", key: "crypto_payments", isEnabled: true, description: "Accept cryptocurrency payments", metadata: null, createdAt: d(300), updatedAt: d(0) },
  { id: "pr_003", key: "affiliate_signups", isEnabled: true, description: "Allow new affiliate applications", metadata: null, createdAt: d(300), updatedAt: d(0) },
  { id: "pr_004", key: "maintenance_mode", isEnabled: false, description: "Put platform in maintenance mode", metadata: null, createdAt: d(300), updatedAt: d(0) },
];

// ── Notifications ───────────────────────────────────────────────────────

export const mockNotifications: Notification[] = [
  { id: "notif_001", userId: "usr_001", type: "EMAIL", status: "DELIVERED", channel: "email", title: "Payout Approved", body: "Your payout of $1,440 has been approved.", metadata: null, sentAt: d(18), readAt: d(18), failedAt: null, failReason: null, createdAt: d(18) },
  { id: "notif_002", userId: "usr_002", type: "IN_APP", status: "SENT", channel: "in_app", title: "KYC Under Review", body: "We're reviewing your KYC documents.", metadata: null, sentAt: d(3), readAt: null, failedAt: null, failReason: null, createdAt: d(3) },
  { id: "notif_003", userId: "usr_004", type: "EMAIL", status: "FAILED", channel: "email", title: "Account Suspended", body: "Your account has been suspended.", metadata: null, sentAt: null, readAt: null, failedAt: d(5), failReason: "Email bounced", createdAt: d(5) },
];

// ── Audit Logs ──────────────────────────────────────────────────────────

export const mockAuditLogs: AdminActionLog[] = [
  { id: "al_001", performerId: "usr_005", targetUserId: "usr_001", action: "APPROVE", resource: "payout", resourceId: "pout_002", before: { status: "PENDING_APPROVAL" }, after: { status: "APPROVED" }, ipAddress: "10.0.0.1", userAgent: "Mozilla/5.0", metadata: null, createdAt: d(20) },
  { id: "al_002", performerId: "usr_005", targetUserId: "usr_003", action: "REJECT", resource: "kyc", resourceId: "kyc_003", before: { status: "UNDER_REVIEW" }, after: { status: "REJECTED" }, ipAddress: "10.0.0.1", userAgent: "Mozilla/5.0", metadata: { reason: "Blurry document" }, createdAt: d(53) },
  { id: "al_003", performerId: "usr_005", targetUserId: null, action: "SETTINGS_CHANGE", resource: "system_setting", resourceId: "ss_001", before: { value: "false" }, after: { value: "true" }, ipAddress: "10.0.0.1", userAgent: "Mozilla/5.0", metadata: null, createdAt: d(10) },
  { id: "al_004", performerId: "usr_005", targetUserId: "usr_004", action: "UPDATE", resource: "user", resourceId: "usr_004", before: { status: "ACTIVE" }, after: { status: "SUSPENDED" }, ipAddress: "10.0.0.1", userAgent: "Mozilla/5.0", metadata: { reason: "Suspicious activity" }, createdAt: d(5) },
  { id: "al_005", performerId: "usr_005", targetUserId: null, action: "CREATE", resource: "coupon", resourceId: "cpn_002", before: null, after: { code: "SUMMER25", value: 25 }, ipAddress: "10.0.0.1", userAgent: "Mozilla/5.0", metadata: null, createdAt: d(30) },
  { id: "al_006", performerId: "usr_005", targetUserId: "usr_002", action: "APPROVE", resource: "kyc", resourceId: "kyc_001", before: { status: "UNDER_REVIEW" }, after: { status: "APPROVED" }, ipAddress: "10.0.0.1", userAgent: "Mozilla/5.0", metadata: null, createdAt: d(108) },
];

// ── System Settings ─────────────────────────────────────────────────────

export const mockSettings: SystemSetting[] = [
  { id: "ss_001", key: "platform_name", value: "MyFundingTrade", dataType: "string", description: "Platform display name", isPublic: true, createdAt: d(365), updatedAt: d(0) },
  { id: "ss_002", key: "support_email", value: "support@myfundingtrade.com", dataType: "string", description: "Support contact email", isPublic: true, createdAt: d(365), updatedAt: d(0) },
  { id: "ss_003", key: "default_profit_split", value: "80", dataType: "number", description: "Default trader profit split percentage", isPublic: false, createdAt: d(300), updatedAt: d(30) },
  { id: "ss_004", key: "kyc_auto_expire_days", value: "365", dataType: "number", description: "Days before KYC approval expires", isPublic: false, createdAt: d(300), updatedAt: d(100) },
  { id: "ss_005", key: "max_payout_amount", value: "50000", dataType: "number", description: "Maximum single payout amount in USD", isPublic: false, createdAt: d(300), updatedAt: d(60) },
  { id: "ss_006", key: "affiliate_default_rate", value: "10", dataType: "number", description: "Default affiliate commission rate %", isPublic: false, createdAt: d(300), updatedAt: d(100) },
];
