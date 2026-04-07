"use client";

import React, { useEffect, useState } from "react";
import { getAffiliates, getAffiliateConversions, getCommissionPayouts } from "@/lib/api-client";
import type { AffiliateAccount, AffiliateConversion, CommissionPayout, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";
import { Users, DollarSign, TrendingUp } from "lucide-react";

export default function AffiliatesPage() {
  const [data, setData] = useState<PaginatedResponse<AffiliateAccount> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AffiliateAccount | null>(null);
  const [conversions, setConversions] = useState<AffiliateConversion[]>([]);
  const [commPayouts, setCommPayouts] = useState<CommissionPayout[]>([]);

  const load = () => {
    setLoading(true);
    setError(false);
    getAffiliates(page).then((res) => {
      if (res.success && res.data) setData(res.data);
      else setError(true);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);

  useEffect(() => {
    if (!selected) return;
    Promise.all([
      getAffiliateConversions(selected.id),
      getCommissionPayouts(selected.id),
    ]).then(([convRes, payRes]) => {
      if (convRes.success && convRes.data) setConversions(convRes.data);
      if (payRes.success && payRes.data) setCommPayouts(payRes.data);
    });
  }, [selected]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={load} />;

  const columns = [
    { key: "affiliateCode", header: "Code", render: (r: AffiliateAccount) => (
      <span className="font-mono text-xs font-semibold text-[var(--color-brand)]">{r.affiliateCode}</span>
    )},
    { key: "userId", header: "User", render: (r: AffiliateAccount) => (
      <span className="font-mono text-xs text-[var(--color-text-muted)]">{r.userId}</span>
    )},
    { key: "commissionRate", header: "Rate", render: (r: AffiliateAccount) => `${r.commissionRate}%` },
    { key: "tier", header: "Tier", render: (r: AffiliateAccount) => (
      <span className="rounded bg-[var(--color-bg)] px-2 py-0.5 text-xs font-medium">T{r.tier}</span>
    )},
    { key: "totalEarnings", header: "Total Earnings", render: (r: AffiliateAccount) => (
      <span className="font-semibold text-[var(--color-brand)]">${r.totalEarnings.toLocaleString()}</span>
    )},
    { key: "totalPaid", header: "Paid", render: (r: AffiliateAccount) => `$${r.totalPaid.toLocaleString()}` },
    { key: "pendingBalance", header: "Pending", render: (r: AffiliateAccount) => (
      <span className={r.pendingBalance > 0 ? "text-[var(--color-warning)]" : ""}>${r.pendingBalance.toLocaleString()}</span>
    )},
    { key: "status", header: "Status", render: (r: AffiliateAccount) => <StatusBadge status={r.status} /> },
  ];

  const convColumns = [
    { key: "orderId", header: "Order", render: (r: AffiliateConversion) => (
      <span className="font-mono text-xs">{r.orderId}</span>
    )},
    { key: "orderAmount", header: "Order Amount", render: (r: AffiliateConversion) => `$${r.orderAmount.toLocaleString()}` },
    { key: "commissionRate", header: "Rate", render: (r: AffiliateConversion) => `${r.commissionRate}%` },
    { key: "commissionAmount", header: "Commission", render: (r: AffiliateConversion) => (
      <span className="font-semibold">${r.commissionAmount.toFixed(2)}</span>
    )},
    { key: "status", header: "Status", render: (r: AffiliateConversion) => <StatusBadge status={r.status} /> },
    { key: "createdAt", header: "Date", render: (r: AffiliateConversion) => new Date(r.createdAt).toLocaleDateString() },
  ];

  const payoutColumns = [
    { key: "amount", header: "Amount", render: (r: CommissionPayout) => (
      <span className="font-semibold">${r.amount.toLocaleString()}</span>
    )},
    { key: "payoutMethod", header: "Method", render: (r: CommissionPayout) => r.payoutMethod?.replace("_", " ") ?? "—" },
    { key: "status", header: "Status", render: (r: CommissionPayout) => <StatusBadge status={r.status} /> },
    { key: "transactionRef", header: "Ref", render: (r: CommissionPayout) => (
      <span className="font-mono text-xs">{r.transactionRef ?? "—"}</span>
    )},
    { key: "processedAt", header: "Processed", render: (r: CommissionPayout) => r.processedAt ? new Date(r.processedAt).toLocaleDateString() : "—" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Affiliate Management" description={`${data.total} affiliates`} />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <div className="rounded-lg bg-[var(--color-brand-muted)] p-2"><Users className="h-4 w-4 text-[var(--color-brand)]" /></div>
          <div><p className="text-xs text-[var(--color-text-muted)]">Active</p><p className="text-lg font-semibold">{data.items.filter((a) => a.status === "ACTIVE").length}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <div className="rounded-lg bg-[var(--color-brand-muted)] p-2"><DollarSign className="h-4 w-4 text-[var(--color-brand)]" /></div>
          <div><p className="text-xs text-[var(--color-text-muted)]">Total Paid</p><p className="text-lg font-semibold">${data.items.reduce((s, a) => s + a.totalPaid, 0).toLocaleString()}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <div className="rounded-lg bg-[var(--color-warning-muted)] p-2"><TrendingUp className="h-4 w-4 text-[var(--color-warning)]" /></div>
          <div><p className="text-xs text-[var(--color-text-muted)]">Pending</p><p className="text-lg font-semibold">${data.items.reduce((s, a) => s + a.pendingBalance, 0).toLocaleString()}</p></div>
        </div>
      </div>

      <FilterBar
        searchPlaceholder="Search by affiliate code..."
        onSearch={() => {}}
        filters={[
          { key: "status", label: "Status", options: [
            { value: "ACTIVE", label: "Active" }, { value: "PENDING", label: "Pending" },
            { value: "SUSPENDED", label: "Suspended" }, { value: "TERMINATED", label: "Terminated" },
          ]},
        ]}
        onFilterChange={() => {}}
      />
      <DataTable
        columns={columns}
        data={data.items}
        keyField="id"
        onRowClick={(row) => setSelected(row as unknown as AffiliateAccount)}
      />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />

      {/* Detail Panel */}
      {selected && (
        <div className="space-y-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{selected.affiliateCode} — Details</h3>
            <button onClick={() => setSelected(null)} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Close</button>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">Conversions</h4>
            <DataTable
              columns={convColumns}
              data={conversions}
              keyField="id"
            />
          </div>

          <div>
            <h4 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">Commission Payouts</h4>
            <DataTable
              columns={payoutColumns}
              data={commPayouts}
              keyField="id"
            />
          </div>
        </div>
      )}
    </div>
  );
}
