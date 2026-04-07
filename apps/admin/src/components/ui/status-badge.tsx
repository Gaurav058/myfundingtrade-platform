"use client";

const statusStyles: Record<string, { bg: string; text: string }> = {
  // Generic
  ACTIVE: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  INACTIVE: { bg: "var(--color-bg-muted)", text: "var(--color-text-muted)" },
  SUSPENDED: { bg: "var(--color-warning-muted)", text: "var(--color-warning)" },
  BANNED: { bg: "var(--color-danger-muted)", text: "var(--color-danger)" },
  PENDING: { bg: "var(--color-warning-muted)", text: "var(--color-warning)" },
  // Order
  DRAFT: { bg: "var(--color-bg-muted)", text: "var(--color-text-muted)" },
  PENDING_PAYMENT: { bg: "var(--color-warning-muted)", text: "var(--color-warning)" },
  PAID: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  FULFILLED: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  CANCELLED: { bg: "var(--color-bg-muted)", text: "var(--color-text-muted)" },
  REFUNDED: { bg: "var(--color-danger-muted)", text: "var(--color-danger)" },
  DISPUTED: { bg: "var(--color-danger-muted)", text: "var(--color-danger)" },
  // Payment
  PROCESSING: { bg: "var(--color-info-muted)", text: "var(--color-info)" },
  SUCCEEDED: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  FAILED: { bg: "var(--color-danger-muted)", text: "var(--color-danger)" },
  // Trading
  PASSED: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  EXPIRED: { bg: "var(--color-bg-muted)", text: "var(--color-text-muted)" },
  PROVISIONING: { bg: "var(--color-info-muted)", text: "var(--color-info)" },
  BREACHED: { bg: "var(--color-danger-muted)", text: "var(--color-danger)" },
  FUNDED: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  CLOSED: { bg: "var(--color-bg-muted)", text: "var(--color-text-muted)" },
  // KYC
  NOT_STARTED: { bg: "var(--color-bg-muted)", text: "var(--color-text-muted)" },
  PENDING_DOCUMENTS: { bg: "var(--color-warning-muted)", text: "var(--color-warning)" },
  UNDER_REVIEW: { bg: "var(--color-info-muted)", text: "var(--color-info)" },
  APPROVED: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  REJECTED: { bg: "var(--color-danger-muted)", text: "var(--color-danger)" },
  RESUBMISSION_REQUIRED: { bg: "var(--color-warning-muted)", text: "var(--color-warning)" },
  // Payout
  PENDING_KYC: { bg: "var(--color-warning-muted)", text: "var(--color-warning)" },
  PENDING_APPROVAL: { bg: "var(--color-warning-muted)", text: "var(--color-warning)" },
  COMPLETED: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  // Affiliate
  TERMINATED: { bg: "var(--color-danger-muted)", text: "var(--color-danger)" },
  CONFIRMED: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  // Ticket
  OPEN: { bg: "var(--color-info-muted)", text: "var(--color-info)" },
  AWAITING_CUSTOMER: { bg: "var(--color-warning-muted)", text: "var(--color-warning)" },
  AWAITING_AGENT: { bg: "var(--color-warning-muted)", text: "var(--color-warning)" },
  IN_PROGRESS: { bg: "var(--color-info-muted)", text: "var(--color-info)" },
  ESCALATED: { bg: "var(--color-danger-muted)", text: "var(--color-danger)" },
  RESOLVED: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  // Content
  PUBLISHED: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  SCHEDULED: { bg: "var(--color-info-muted)", text: "var(--color-info)" },
  ARCHIVED: { bg: "var(--color-bg-muted)", text: "var(--color-text-muted)" },
  // Notification
  QUEUED: { bg: "var(--color-bg-muted)", text: "var(--color-text-muted)" },
  SENT: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  DELIVERED: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  READ: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  // Boolean-like
  ALLOWED: { bg: "var(--color-brand-muted)", text: "var(--color-brand)" },
  BLOCKED: { bg: "var(--color-danger-muted)", text: "var(--color-danger)" },
};

const fallback = { bg: "var(--color-bg-muted)", text: "var(--color-text-muted)" };

export function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status] ?? fallback;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
