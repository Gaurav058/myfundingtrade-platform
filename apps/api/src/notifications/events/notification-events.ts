// ── Notification event names & payloads ────────────────────────────────

export const NotificationEvents = {
  // Auth
  REGISTRATION: 'notification.registration',
  EMAIL_VERIFICATION: 'notification.email-verification',

  // Orders / Payments
  ORDER_CONFIRMATION: 'notification.order-confirmation',

  // KYC
  KYC_SUBMITTED: 'notification.kyc-submitted',
  KYC_APPROVED: 'notification.kyc-approved',
  KYC_REJECTED: 'notification.kyc-rejected',

  // Payouts
  PAYOUT_REQUESTED: 'notification.payout-requested',
  PAYOUT_APPROVED: 'notification.payout-approved',
  PAYOUT_REJECTED: 'notification.payout-rejected',

  // Support
  TICKET_CREATED: 'notification.ticket-created',
  TICKET_REPLIED: 'notification.ticket-replied',

  // Affiliates
  AFFILIATE_SIGNUP: 'notification.affiliate-signup',
  AFFILIATE_PAYOUT_UPDATE: 'notification.affiliate-payout-update',

  // Newsletter
  NEWSLETTER_SUBSCRIPTION: 'notification.newsletter-subscription',
} as const;

export type NotificationEventName =
  (typeof NotificationEvents)[keyof typeof NotificationEvents];

// ── Event payloads ─────────────────────────────────────────────────────

export interface BaseNotificationPayload {
  userId: string;
  email: string;
  firstName?: string;
}

export interface RegistrationPayload extends BaseNotificationPayload {}

export interface EmailVerificationPayload extends BaseNotificationPayload {
  verificationUrl: string;
}

export interface OrderConfirmationPayload extends BaseNotificationPayload {
  orderId: string;
  planName: string;
  amount: number;
  currency: string;
}

export interface KycSubmittedPayload extends BaseNotificationPayload {}

export interface KycApprovedPayload extends BaseNotificationPayload {}

export interface KycRejectedPayload extends BaseNotificationPayload {
  reason: string;
}

export interface PayoutRequestedPayload extends BaseNotificationPayload {
  payoutId: string;
  amount: number;
  currency: string;
}

export interface PayoutApprovedPayload extends BaseNotificationPayload {
  payoutId: string;
  amount: number;
  currency: string;
}

export interface PayoutRejectedPayload extends BaseNotificationPayload {
  payoutId: string;
  reason: string;
}

export interface TicketCreatedPayload extends BaseNotificationPayload {
  ticketId: string;
  subject: string;
}

export interface TicketRepliedPayload extends BaseNotificationPayload {
  ticketId: string;
  subject: string;
  replierName: string;
}

export interface AffiliateSignupPayload extends BaseNotificationPayload {
  affiliateCode: string;
}

export interface AffiliatePayoutUpdatePayload extends BaseNotificationPayload {
  payoutId: string;
  amount: number;
  currency: string;
  status: string;
}

export interface NewsletterSubscriptionPayload {
  email: string;
}

export type NotificationPayload =
  | RegistrationPayload
  | EmailVerificationPayload
  | OrderConfirmationPayload
  | KycSubmittedPayload
  | KycApprovedPayload
  | KycRejectedPayload
  | PayoutRequestedPayload
  | PayoutApprovedPayload
  | PayoutRejectedPayload
  | TicketCreatedPayload
  | TicketRepliedPayload
  | AffiliateSignupPayload
  | AffiliatePayoutUpdatePayload
  | NewsletterSubscriptionPayload;
