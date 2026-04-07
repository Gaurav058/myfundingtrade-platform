// ── User & Identity ─────────────────────────────────────────────────────
export type UserRole = 'TRADER' | 'AFFILIATE' | 'SUPPORT_AGENT' | 'KYC_REVIEWER' | 'FINANCE_ADMIN' | 'CONTENT_ADMIN' | 'SUPER_ADMIN';
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BANNED';

// ── Commerce ────────────────────────────────────────────────────────────
export type OrderStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED' | 'DISPUTED';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'DISPUTED' | 'CANCELLED';
export type PaymentProvider = 'STRIPE' | 'CRYPTO' | 'BANK_TRANSFER' | 'MANUAL';
export type CouponType = 'PERCENTAGE' | 'FIXED_AMOUNT';

// ── Trading Evaluation ──────────────────────────────────────────────────
export type ChallengeStatus = 'PENDING' | 'ACTIVE' | 'PASSED' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
export type TraderAccountStatus = 'PROVISIONING' | 'ACTIVE' | 'BREACHED' | 'PASSED' | 'FUNDED' | 'SUSPENDED' | 'CLOSED';
export type TraderAccountPhaseType = 'PHASE_1' | 'PHASE_2' | 'FUNDED';
export type EvaluationVerdict = 'IN_PROGRESS' | 'PASSED' | 'FAILED_DAILY_LOSS' | 'FAILED_TOTAL_LOSS' | 'FAILED_TIME_LIMIT' | 'FAILED_MIN_DAYS' | 'FAILED_INACTIVITY' | 'FAILED_RULE_VIOLATION';

// ── KYC / Compliance ────────────────────────────────────────────────────
export type KycStatus = 'NOT_STARTED' | 'PENDING_DOCUMENTS' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'RESUBMISSION_REQUIRED';
export type KycDocumentType = 'GOVERNMENT_ID' | 'PASSPORT' | 'DRIVERS_LICENSE' | 'PROOF_OF_ADDRESS' | 'SELFIE' | 'BANK_STATEMENT';
export type LegalDocumentType = 'TERMS_OF_SERVICE' | 'PRIVACY_POLICY' | 'RISK_DISCLOSURE' | 'REFUND_POLICY' | 'COOKIE_POLICY' | 'AML_POLICY' | 'AFFILIATE_AGREEMENT';
export type RestrictionType = 'BLOCKED' | 'ALLOWED';

// ── Payouts ─────────────────────────────────────────────────────────────
export type PayoutStatus = 'DRAFT' | 'PENDING_KYC' | 'PENDING_APPROVAL' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED' | 'FAILED';
export type PayoutMethodType = 'BANK_WIRE' | 'CRYPTO_WALLET' | 'PAYPAL' | 'WISE' | 'RISE';

// ── Affiliates ──────────────────────────────────────────────────────────
export type AffiliateStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
export type AffiliateConversionStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'PAID';
export type CommissionPayoutStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

// ── Support ─────────────────────────────────────────────────────────────
export type TicketStatus = 'OPEN' | 'AWAITING_CUSTOMER' | 'AWAITING_AGENT' | 'IN_PROGRESS' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TicketCategory = 'ACCOUNT' | 'BILLING' | 'TRADING' | 'KYC' | 'PAYOUT' | 'TECHNICAL' | 'OTHER';

// ── Notifications ───────────────────────────────────────────────────────
export type NotificationType = 'EMAIL' | 'IN_APP' | 'SMS' | 'PUSH';
export type NotificationStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';

// ── Content ─────────────────────────────────────────────────────────────
export type BlogPostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

// ── Audit ───────────────────────────────────────────────────────────────
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'APPROVE' | 'REJECT' | 'ESCALATE' | 'EXPORT' | 'IMPERSONATE' | 'SETTINGS_CHANGE';
