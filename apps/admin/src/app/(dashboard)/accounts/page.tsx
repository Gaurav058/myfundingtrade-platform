"use client";

import React, { useEffect, useState } from "react";
import { getAccounts } from "@/lib/api-client";
import type { TraderAccount, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";

export default function AccountsPage() {
  const [data, setData] = useState<PaginatedResponse<TraderAccount> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError(false);
    getAccounts(page).then((res) => {
      if (res.success && res.data) setData(res.data);
      else setError(true);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={load} />;

  const columns = [
    { key: "accountNumber", header: "Account", render: (r: TraderAccount) => (
      <div>
        <p className="font-mono text-xs font-medium text-[var(--color-text)]">{r.accountNumber}</p>
        <p className="text-[10px] text-[var(--color-text-muted)]">{r.platform} · {r.login ?? "—"}</p>
      </div>
    )},
    { key: "userId", header: "User", render: (r: TraderAccount) => (
      <span className="font-mono text-xs text-[var(--color-text-muted)]">{r.userId}</span>
    )},
    { key: "startingBalance", header: "Starting", render: (r: TraderAccount) => `$${r.startingBalance.toLocaleString()}` },
    { key: "currentBalance", header: "Current", render: (r: TraderAccount) => (
      <span className={r.currentBalance >= r.startingBalance ? "text-[var(--color-brand)]" : "text-[var(--color-danger)]"}>
        ${r.currentBalance.toLocaleString()}
      </span>
    )},
    { key: "currentPhase", header: "Phase", render: (r: TraderAccount) => <StatusBadge status={r.currentPhase} /> },
    { key: "status", header: "Status", render: (r: TraderAccount) => <StatusBadge status={r.status} /> },
    { key: "createdAt", header: "Created", render: (r: TraderAccount) => (
      <span className="text-xs text-[var(--color-text-muted)]">{new Date(r.createdAt).toLocaleDateString()}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Trader Accounts" description={`${data.total} accounts`} />
      <FilterBar
        searchPlaceholder="Search by account number..."
        onSearch={() => {}}
        filters={[
          { key: "status", label: "Status", options: [
            { value: "ACTIVE", label: "Active" }, { value: "FUNDED", label: "Funded" },
            { value: "BREACHED", label: "Breached" }, { value: "CLOSED", label: "Closed" },
          ]},
          { key: "phase", label: "Phase", options: [
            { value: "PHASE_1", label: "Phase 1" }, { value: "PHASE_2", label: "Phase 2" },
            { value: "FUNDED", label: "Funded" },
          ]},
        ]}
        onFilterChange={() => {}}
      />
      <DataTable columns={columns} data={data.items} keyField="id" />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
}
