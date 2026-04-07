"use client";

import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variantColors: Record<string, string> = {
  default: "var(--color-brand)",
  success: "var(--color-brand)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-info)",
};

export function StatCard({ label, value, icon, trend, variant = "default" }: StatCardProps) {
  const accent = variantColors[variant];
  return (
    <div className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition-all duration-200 hover:border-[var(--color-border-accent)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{label}</p>
        {icon && <div className="text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-brand)]">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-bold text-[var(--color-text-heading)]">{value}</p>
      {trend && (
        <p className="mt-1 text-xs" style={{ color: trend.value >= 0 ? accent : "var(--color-danger)" }}>
          {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
        </p>
      )}
    </div>
  );
}
