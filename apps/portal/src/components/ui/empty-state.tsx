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
      <div className="mb-4 text-neutral-500">{icon}</div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-neutral-400">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
