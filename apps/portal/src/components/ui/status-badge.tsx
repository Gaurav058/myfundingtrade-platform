import { cn } from "@myfundingtrade/ui";

const statusColors: Record<string, string> = {
  // Account / Phase
  ACTIVE: "bg-[var(--color-brand)]/15 text-[var(--color-brand)]",
  FUNDED: "bg-[var(--color-brand)]/15 text-[var(--color-brand)]",
  PASSED: "bg-[var(--color-brand)]/15 text-[var(--color-brand)]",
  BREACHED: "bg-[var(--color-danger)]/15 text-[var(--color-danger)]",
  FAILED: "bg-[var(--color-danger)]/15 text-[var(--color-danger)]",
  SUSPENDED: "bg-[var(--color-danger)]/15 text-[var(--color-danger)]",
  CLOSED: "bg-neutral-500/15 text-neutral-400",
  INACTIVE: "bg-neutral-500/15 text-neutral-400",

  // KYC
  APPROVED: "bg-[var(--color-brand)]/15 text-[var(--color-brand)]",
  UNDER_REVIEW: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  REJECTED: "bg-[var(--color-danger)]/15 text-[var(--color-danger)]",
  NOT_SUBMITTED: "bg-neutral-500/15 text-neutral-400",

  // Payout
  COMPLETED: "bg-[var(--color-brand)]/15 text-[var(--color-brand)]",
  PROCESSING: "bg-[var(--color-info)]/15 text-[var(--color-info)]",
  PENDING_APPROVAL: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  DENIED: "bg-[var(--color-danger)]/15 text-[var(--color-danger)]",

  // Tickets
  OPEN: "bg-[var(--color-info)]/15 text-[var(--color-info)]",
  IN_PROGRESS: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
  RESOLVED: "bg-[var(--color-brand)]/15 text-[var(--color-brand)]",
  WAITING_ON_CUSTOMER: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",

  // Affiliate
  PAID: "bg-[var(--color-brand)]/15 text-[var(--color-brand)]",
  CONFIRMED: "bg-[var(--color-info)]/15 text-[var(--color-info)]",
  PENDING: "bg-[var(--color-warning)]/15 text-[var(--color-warning)]",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = statusColors[status] ?? "bg-neutral-500/15 text-neutral-400";
  const label = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        color,
        className,
      )}
    >
      {label.toLowerCase()}
    </span>
  );
}
