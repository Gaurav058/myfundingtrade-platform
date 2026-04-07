import { cn } from "../lib/cn";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "gold" | "outline";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variant === "default" && "bg-[var(--color-bg-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]",
        variant === "brand" &&
          "border border-[var(--color-brand)]/20 bg-[var(--color-brand-muted)] text-[var(--color-brand)]",
        variant === "gold" &&
          "border border-amber-500/20 bg-amber-500/10 text-amber-400",
        variant === "outline" && "border border-[var(--color-border)] text-[var(--color-text-muted)]",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export type { BadgeProps };
