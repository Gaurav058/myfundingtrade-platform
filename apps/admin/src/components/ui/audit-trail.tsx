"use client";

import type { AdminActionLog } from "@myfundingtrade/types";
import { Shield } from "lucide-react";

interface AuditTrailProps {
  logs: AdminActionLog[];
  title?: string;
}

export function AuditTrail({ logs, title = "Audit Trail" }: AuditTrailProps) {
  if (logs.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
      <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        <Shield className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="space-y-3">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 text-sm">
            <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand)]" />
            <div className="flex-1">
              <span className="font-medium text-[var(--color-text)]">{log.action}</span>
              <span className="text-[var(--color-text-muted)]"> on </span>
              <span className="font-mono text-xs text-[var(--color-text)]">{log.resource}/{log.resourceId}</span>
              {log.targetUserId && (
                <span className="text-[var(--color-text-muted)]"> → {log.targetUserId}</span>
              )}
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                {new Date(log.createdAt).toLocaleString()} · {log.ipAddress}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
