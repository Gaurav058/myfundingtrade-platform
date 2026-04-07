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
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition-colors hover:bg-[var(--color-bg-surface-hover)]",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-400">{label}</span>
        <span className="text-neutral-500">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
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
