"use client";

import React, { useEffect, useState } from "react";
import { getAuditLogs } from "@/lib/api-client";
import type { AdminActionLog, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";

export default function AuditLogsPage() {
  const [data, setData] = useState<PaginatedResponse<AdminActionLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError(false);
    getAuditLogs(page).then((res) => {
      if (res.success && res.data) setData(res.data);
      else setError(true);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={load} />;

  const actionColors: Record<string, string> = {
    CREATE: "bg-[var(--color-brand-muted)] text-[var(--color-brand)]",
    UPDATE: "bg-[var(--color-info-muted)] text-[var(--color-info)]",
    DELETE: "bg-[var(--color-danger-muted)] text-[var(--color-danger)]",
    APPROVE: "bg-[var(--color-brand-muted)] text-[var(--color-brand)]",
    REJECT: "bg-[var(--color-danger-muted)] text-[var(--color-danger)]",
    LOGIN: "bg-[var(--color-bg)] text-[var(--color-text-muted)]",
    LOGOUT: "bg-[var(--color-bg)] text-[var(--color-text-muted)]",
    SETTINGS_CHANGE: "bg-[var(--color-warning-muted)] text-[var(--color-warning)]",
    ESCALATE: "bg-[var(--color-warning-muted)] text-[var(--color-warning)]",
    EXPORT: "bg-[var(--color-info-muted)] text-[var(--color-info)]",
    IMPERSONATE: "bg-[var(--color-danger-muted)] text-[var(--color-danger)]",
  };

  const columns = [
    { key: "createdAt", header: "Timestamp", render: (r: AdminActionLog) => (
      <span className="font-mono text-xs text-[var(--color-text-muted)]">{new Date(r.createdAt).toLocaleString()}</span>
    )},
    { key: "action", header: "Action", render: (r: AdminActionLog) => (
      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${actionColors[r.action] ?? "bg-[var(--color-bg)] text-[var(--color-text-muted)]"}`}>
        {r.action}
      </span>
    )},
    { key: "resource", header: "Resource", render: (r: AdminActionLog) => (
      <div>
        <span className="text-sm">{r.resource}</span>
        <span className="ml-1 font-mono text-xs text-[var(--color-text-muted)]">{r.resourceId}</span>
      </div>
    )},
    { key: "performerId", header: "Performer", render: (r: AdminActionLog) => (
      <span className="font-mono text-xs">{r.performerId}</span>
    )},
    { key: "targetUserId", header: "Target", render: (r: AdminActionLog) => (
      <span className="font-mono text-xs text-[var(--color-text-muted)]">{r.targetUserId ?? "—"}</span>
    )},
    { key: "changes", header: "Changes", render: (r: AdminActionLog) => (
      <div className="flex gap-2 text-xs">
        {r.before && (
          <span className="rounded bg-[var(--color-danger-muted)] px-1.5 py-0.5 text-[var(--color-danger)]">
            {JSON.stringify(r.before)}
          </span>
        )}
        {r.before && r.after && <span className="text-[var(--color-text-muted)]">→</span>}
        {r.after && (
          <span className="rounded bg-[var(--color-brand-muted)] px-1.5 py-0.5 text-[var(--color-brand)]">
            {JSON.stringify(r.after)}
          </span>
        )}
      </div>
    )},
    { key: "ipAddress", header: "IP", render: (r: AdminActionLog) => (
      <span className="font-mono text-xs text-[var(--color-text-muted)]">{r.ipAddress}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description={`${data.total} entries`} />

      <FilterBar
        searchPlaceholder="Search by resource or performer..."
        onSearch={() => {}}
        filters={[
          { key: "action", label: "Action", options: [
            { value: "CREATE", label: "Create" }, { value: "UPDATE", label: "Update" },
            { value: "DELETE", label: "Delete" }, { value: "APPROVE", label: "Approve" },
            { value: "REJECT", label: "Reject" }, { value: "SETTINGS_CHANGE", label: "Settings Change" },
            { value: "LOGIN", label: "Login" }, { value: "ESCALATE", label: "Escalate" },
          ]},
          { key: "resource", label: "Resource", options: [
            { value: "user", label: "User" }, { value: "payout", label: "Payout" },
            { value: "kyc", label: "KYC" }, { value: "coupon", label: "Coupon" },
            { value: "system_setting", label: "Setting" },
          ]},
        ]}
        onFilterChange={() => {}}
      />

      <DataTable columns={columns} data={data.items} keyField="id" />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
}
