"use client";

import { type ReactNode } from "react";
import { cn } from "@myfundingtrade/ui";

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition-all duration-200 hover:border-[var(--color-border-accent)] hover:bg-[var(--color-bg-surface-hover)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
        <span className="text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-brand)]">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text-heading)]">{value}</p>
      {trend && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            trend.positive ? "text-[var(--color-brand)]" : "text-[var(--color-danger)]",
          )}
        >
          {trend.positive ? "▲" : "▼"} {trend.value}
        </p>
      )}
    </div>
  );
}
