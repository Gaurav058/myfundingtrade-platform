import type {
  RegistrationPayload,
  EmailVerificationPayload,
  OrderConfirmationPayload,
  KycSubmittedPayload,
  KycApprovedPayload,
  KycRejectedPayload,
  PayoutRequestedPayload,
  PayoutApprovedPayload,
  PayoutRejectedPayload,
  TicketCreatedPayload,
  TicketRepliedPayload,
  AffiliateSignupPayload,
  AffiliatePayoutUpdatePayload,
  NewsletterSubscriptionPayload,
} from '../events';

// ── Shared layout wrapper ──────────────────────────────────────────────

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0a;color:#e5e5e5}
  .container{max-width:600px;margin:0 auto;padding:40px 20px}
  .card{background:#171717;border-radius:12px;padding:32px;border:1px solid #262626}
  .logo{font-size:20px;font-weight:700;color:#f5a623;margin-bottom:24px}
  h1{font-size:22px;margin:0 0 16px;color:#fff}
  p{margin:0 0 12px;line-height:1.6;color:#a3a3a3}
  .btn{display:inline-block;padding:12px 24px;background:#f5a623;color:#0a0a0a;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0}
  .footer{margin-top:32px;padding-top:16px;border-top:1px solid #262626;font-size:12px;color:#525252;text-align:center}
  .highlight{color:#f5a623;font-weight:600}
  .detail{background:#1a1a1a;border-radius:8px;padding:16px;margin:16px 0}
  .detail td{padding:4px 12px 4px 0;color:#a3a3a3;font-size:14px}
  .detail td:first-child{color:#737373}
  .detail td:last-child{color:#e5e5e5}
</style></head>
<body><div class="container"><div class="card">
<div class="logo">MyFundingTrade</div>
${body}
<div class="footer">
  <p>&copy; ${new Date().getFullYear()} MyFundingTrade. All rights reserved.</p>
  <p>This is a transactional email. You received it because of your account activity.</p>
</div>
</div></div></body></html>`;
}

// ── Individual templates ───────────────────────────────────────────────

export function registrationEmail(p: RegistrationPayload) {
  const name = p.firstName || 'Trader';
  return {
    subject: 'Welcome to MyFundingTrade!',
    html: wrap(`
      <h1>Welcome, ${name}!</h1>
      <p>Your account has been created successfully. You're one step closer to becoming a funded trader.</p>
      <p>Start by choosing a challenge plan that fits your trading style.</p>
      <a href="${portalUrl()}/dashboard" class="btn">Go to Dashboard</a>
    `),
    inAppTitle: 'Welcome to MyFundingTrade',
    inAppBody: `Welcome, ${name}! Your account is ready. Browse challenge plans to get started.`,
  };
}

export function emailVerificationEmail(p: EmailVerificationPayload) {
  return {
    subject: 'Verify Your Email Address',
    html: wrap(`
      <h1>Verify Your Email</h1>
      <p>Please click the button below to verify your email address. This link expires in 24 hours.</p>
      <a href="${p.verificationUrl}" class="btn">Verify Email</a>
      <p style="font-size:12px;color:#525252">If you didn't create an account, you can safely ignore this email.</p>
    `),
    inAppTitle: 'Please verify your email',
    inAppBody: 'Check your inbox for a verification link to complete your registration.',
  };
}

export function orderConfirmationEmail(p: OrderConfirmationPayload) {
  return {
    subject: `Order Confirmed — ${p.planName}`,
    html: wrap(`
      <h1>Order Confirmed</h1>
      <p>Thank you for your purchase! Here are the details:</p>
      <table class="detail"><tbody>
        <tr><td>Order</td><td class="highlight">${p.orderId}</td></tr>
        <tr><td>Plan</td><td>${p.planName}</td></tr>
        <tr><td>Amount</td><td>${formatCurrency(p.amount, p.currency)}</td></tr>
      </tbody></table>
      <p>Your trading account will be provisioned shortly. You'll receive another email once it's ready.</p>
      <a href="${portalUrl()}/dashboard/orders" class="btn">View Orders</a>
    `),
    inAppTitle: `Order confirmed — ${p.planName}`,
    inAppBody: `Your purchase of ${p.planName} (${formatCurrency(p.amount, p.currency)}) is confirmed.`,
  };
}

export function kycSubmittedEmail(p: KycSubmittedPayload) {
  const name = p.firstName || 'Trader';
  return {
    subject: 'KYC Documents Received',
    html: wrap(`
      <h1>Documents Received</h1>
      <p>Hi ${name}, we've received your identity documents. Our team will review them within 1–2 business days.</p>
      <p>You'll be notified once the review is complete.</p>
    `),
    inAppTitle: 'KYC documents received',
    inAppBody: "Your KYC documents are under review. We'll notify you when it's complete.",
  };
}

export function kycApprovedEmail(p: KycApprovedPayload) {
  const name = p.firstName || 'Trader';
  return {
    subject: 'KYC Approved — You\'re Verified!',
    html: wrap(`
      <h1>Identity Verified</h1>
      <p>Congratulations, ${name}! Your identity verification has been approved. You now have full access to all platform features including payouts.</p>
      <a href="${portalUrl()}/dashboard" class="btn">Go to Dashboard</a>
    `),
    inAppTitle: 'KYC approved',
    inAppBody: 'Your identity is verified. You now have full access to payouts and all platform features.',
  };
}

export function kycRejectedEmail(p: KycRejectedPayload) {
  const name = p.firstName || 'Trader';
  return {
    subject: 'KYC Review — Action Required',
    html: wrap(`
      <h1>Verification Update</h1>
      <p>Hi ${name}, we were unable to verify your identity documents.</p>
      <table class="detail"><tbody>
        <tr><td>Reason</td><td>${p.reason}</td></tr>
      </tbody></table>
      <p>Please submit updated documents to continue.</p>
      <a href="${portalUrl()}/dashboard/kyc" class="btn">Resubmit Documents</a>
    `),
    inAppTitle: 'KYC review — action required',
    inAppBody: `Your KYC was not approved: ${p.reason}. Please resubmit your documents.`,
  };
}

export function payoutRequestedEmail(p: PayoutRequestedPayload) {
  return {
    subject: 'Payout Request Submitted',
    html: wrap(`
      <h1>Payout Requested</h1>
      <p>Your payout request has been submitted and is pending review.</p>
      <table class="detail"><tbody>
        <tr><td>Request ID</td><td class="highlight">${p.payoutId}</td></tr>
        <tr><td>Amount</td><td>${formatCurrency(p.amount, p.currency)}</td></tr>
      </tbody></table>
      <p>Payouts are typically processed within 1–3 business days.</p>
    `),
    inAppTitle: 'Payout request submitted',
    inAppBody: `Your payout request for ${formatCurrency(p.amount, p.currency)} is pending review.`,
  };
}

export function payoutApprovedEmail(p: PayoutApprovedPayload) {
  return {
    subject: 'Payout Approved!',
    html: wrap(`
      <h1>Payout Approved</h1>
      <p>Great news! Your payout has been approved and is being processed.</p>
      <table class="detail"><tbody>
        <tr><td>Request ID</td><td class="highlight">${p.payoutId}</td></tr>
        <tr><td>Amount</td><td>${formatCurrency(p.amount, p.currency)}</td></tr>
      </tbody></table>
      <p>Funds will arrive in your account within 1–3 business days.</p>
    `),
    inAppTitle: 'Payout approved',
    inAppBody: `Your payout of ${formatCurrency(p.amount, p.currency)} has been approved!`,
  };
}

export function payoutRejectedEmail(p: PayoutRejectedPayload) {
  return {
    subject: 'Payout Update — Action Needed',
    html: wrap(`
      <h1>Payout Update</h1>
      <p>Unfortunately your payout request was not approved.</p>
      <table class="detail"><tbody>
        <tr><td>Request ID</td><td class="highlight">${p.payoutId}</td></tr>
        <tr><td>Reason</td><td>${p.reason}</td></tr>
      </tbody></table>
      <p>If you believe this is an error, please contact support.</p>
      <a href="${portalUrl()}/dashboard/support" class="btn">Contact Support</a>
    `),
    inAppTitle: 'Payout request declined',
    inAppBody: `Your payout ${p.payoutId} was declined: ${p.reason}.`,
  };
}

export function ticketCreatedEmail(p: TicketCreatedPayload) {
  return {
    subject: `Support Ticket Created — ${p.subject}`,
    html: wrap(`
      <h1>Ticket Created</h1>
      <p>We've received your support request. Our team will respond as soon as possible.</p>
      <table class="detail"><tbody>
        <tr><td>Ticket</td><td class="highlight">${p.ticketId}</td></tr>
        <tr><td>Subject</td><td>${p.subject}</td></tr>
      </tbody></table>
      <a href="${portalUrl()}/dashboard/support" class="btn">View Ticket</a>
    `),
    inAppTitle: `Ticket created: ${p.subject}`,
    inAppBody: `Your support ticket ${p.ticketId} has been created. We'll respond shortly.`,
  };
}

export function ticketRepliedEmail(p: TicketRepliedPayload) {
  return {
    subject: `New Reply on Ticket — ${p.subject}`,
    html: wrap(`
      <h1>New Reply</h1>
      <p>${p.replierName} replied to your support ticket.</p>
      <table class="detail"><tbody>
        <tr><td>Ticket</td><td class="highlight">${p.ticketId}</td></tr>
        <tr><td>Subject</td><td>${p.subject}</td></tr>
      </tbody></table>
      <a href="${portalUrl()}/dashboard/support" class="btn">View Conversation</a>
    `),
    inAppTitle: `New reply on ticket ${p.ticketId}`,
    inAppBody: `${p.replierName} replied to your ticket "${p.subject}".`,
  };
}

export function affiliateSignupEmail(p: AffiliateSignupPayload) {
  const name = p.firstName || 'Partner';
  return {
    subject: 'Affiliate Account Activated!',
    html: wrap(`
      <h1>Welcome, ${name}!</h1>
      <p>Your affiliate account has been activated. Share your unique link to start earning commissions.</p>
      <table class="detail"><tbody>
        <tr><td>Affiliate Code</td><td class="highlight">${p.affiliateCode}</td></tr>
      </tbody></table>
      <a href="${portalUrl()}/dashboard/affiliate" class="btn">Affiliate Dashboard</a>
    `),
    inAppTitle: 'Affiliate account activated',
    inAppBody: `Your affiliate code is ${p.affiliateCode}. Start sharing to earn commissions!`,
  };
}

export function affiliatePayoutUpdateEmail(p: AffiliatePayoutUpdatePayload) {
  return {
    subject: `Affiliate Payout ${p.status}`,
    html: wrap(`
      <h1>Affiliate Payout Update</h1>
      <p>Your affiliate commission payout has been updated.</p>
      <table class="detail"><tbody>
        <tr><td>Payout ID</td><td class="highlight">${p.payoutId}</td></tr>
        <tr><td>Amount</td><td>${formatCurrency(p.amount, p.currency)}</td></tr>
        <tr><td>Status</td><td>${p.status}</td></tr>
      </tbody></table>
    `),
    inAppTitle: `Affiliate payout ${p.status.toLowerCase()}`,
    inAppBody: `Your affiliate payout of ${formatCurrency(p.amount, p.currency)} is now ${p.status.toLowerCase()}.`,
  };
}

export function newsletterSubscriptionEmail(p: NewsletterSubscriptionPayload) {
  return {
    subject: 'Welcome to the MyFundingTrade Newsletter',
    html: wrap(`
      <h1>You're Subscribed!</h1>
      <p>Thanks for subscribing to the MyFundingTrade newsletter. We'll keep you updated with the latest trading insights, platform updates, and exclusive offers.</p>
      <p style="font-size:12px;color:#525252">You can <a href="${webUrl()}/newsletter/unsubscribe?email=${encodeURIComponent(p.email)}" style="color:#737373">unsubscribe</a> at any time.</p>
    `),
    inAppTitle: null as string | null,
    inAppBody: null as string | null,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount / 100);
}

function portalUrl(): string {
  return process.env.NEXT_PUBLIC_PORTAL_URL || 'https://app.myfundingtrade.com';
}

function webUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://myfundingtrade.com';
}
