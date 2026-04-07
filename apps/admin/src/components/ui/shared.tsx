"use client";

import { AlertTriangle, Loader2, Inbox } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-[var(--color-brand)]" />
      <p className="text-sm text-[var(--color-text-muted)]">{message}</p>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong", onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      <AlertTriangle className="h-8 w-8 text-[var(--color-danger)]" />
      <p className="text-sm text-[var(--color-text-muted)]">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="rounded-lg bg-[var(--color-bg-elevated)] px-4 py-2 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-surface-hover)]">
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      {icon ?? <Inbox className="h-8 w-8 text-[var(--color-text-muted)]" />}
      <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
      {description && <p className="max-w-xs text-center text-xs text-[var(--color-text-muted)]">{description}</p>}
      {action}
    </div>
  );
}

export function Pagination({
  page, totalPages, onPageChange,
}: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-[var(--color-text-muted)]">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-hover)] disabled:opacity-40"
        >
          Previous
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-hover)] disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

import type React from "react";
