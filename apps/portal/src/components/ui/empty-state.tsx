import { type ReactNode } from "react";
import { cn } from "@myfundingtrade/ui";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="mb-4 rounded-full bg-[var(--color-bg-surface)] p-4 text-[var(--color-text-muted)]">{icon}</div>
      <h3 className="text-lg font-semibold text-[var(--color-text-heading)]">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--color-text-muted)]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
