"use client";

import React, { useEffect, useState } from "react";
import { getAffiliates, getAffiliateConversions, getCommissionPayouts, getAffiliateClicks, getAffiliateFraudSignals, updateAffiliateStatus, reviewAffiliateConversion, reviewCommissionPayout } from "@/lib/api-client";
import type { AffiliateAccount, AffiliateConversion, CommissionPayout, AffiliateClick, PaginatedResponse } from "@myfundingtrade/types";

interface FraudSignal {
  type: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  detail: string;
}
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";
import { Users, DollarSign, TrendingUp, AlertTriangle, MousePointerClick, ShieldAlert, CheckCircle, XCircle, Eye } from "lucide-react";

export default function AffiliatesPage() {
  const [data, setData] = useState<PaginatedResponse<AffiliateAccount> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AffiliateAccount | null>(null);
  const [conversions, setConversions] = useState<AffiliateConversion[]>([]);
  const [commPayouts, setCommPayouts] = useState<CommissionPayout[]>([]);
  const [clicks, setClicks] = useState<AffiliateClick[]>([]);
  const [fraudSignals, setFraudSignals] = useState<Array<{ affiliateId: string; affiliateCode: string; signals: FraudSignal[] }>>([]);
  const [tab, setTab] = useState<"details" | "fraud">("details");

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([
      getAffiliates(page),
      getAffiliateFraudSignals(),
    ]).then(([res, fraudRes]) => {
      if (res.success && res.data) setData(res.data);
      else setError(true);
      if (fraudRes.success && fraudRes.data) setFraudSignals(fraudRes.data);
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
      getAffiliateClicks(selected.id),
    ]).then(([convRes, payRes, clickRes]) => {
      if (convRes.success && convRes.data) setConversions(convRes.data);
      if (payRes.success && payRes.data) setCommPayouts(payRes.data);
      if (clickRes.success && clickRes.data) setClicks(clickRes.data);
    });
  }, [selected]);

  async function handleStatusChange(id: string, status: string) {
    await updateAffiliateStatus(id, status);
    load();
    setSelected(null);
  }

  async function handleReviewConversion(convId: string, decision: string) {
    await reviewAffiliateConversion(convId, decision);
    if (selected) {
      const res = await getAffiliateConversions(selected.id);
      if (res.success && res.data) setConversions(res.data);
    }
  }

  async function handleReviewPayout(payoutId: string, decision: string) {
    await reviewCommissionPayout(payoutId, decision);
    if (selected) {
      const res = await getCommissionPayouts(selected.id);
      if (res.success && res.data) setCommPayouts(res.data);
    }
  }

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
      <span className="font-semibold text-[var(--color-brand)]">${Number(r.totalEarnings).toLocaleString()}</span>
    )},
    { key: "totalPaid", header: "Paid", render: (r: AffiliateAccount) => `$${Number(r.totalPaid).toLocaleString()}` },
    { key: "pendingBalance", header: "Pending", render: (r: AffiliateAccount) => (
      <span className={Number(r.pendingBalance) > 0 ? "text-[var(--color-warning)]" : ""}>${Number(r.pendingBalance).toLocaleString()}</span>
    )},
    { key: "fraud", header: "Fraud", render: (r: AffiliateAccount) => {
      const affFraud = fraudSignals.find((f) => f.affiliateId === r.id);
      if (!affFraud || affFraud.signals.length === 0) return <span className="text-xs text-green-500">Clean</span>;
      const highCount = affFraud.signals.filter((s) => s.severity === "HIGH").length;
      return (
        <span className={`flex items-center gap-1 text-xs font-medium ${highCount > 0 ? "text-red-500" : "text-yellow-500"}`}>
          <AlertTriangle className="h-3 w-3" />
          {affFraud.signals.length} signal{affFraud.signals.length > 1 ? "s" : ""}
        </span>
      );
    }},
    { key: "status", header: "Status", render: (r: AffiliateAccount) => <StatusBadge status={r.status} /> },
  ];

  const convColumns = [
    { key: "orderId", header: "Order", render: (r: AffiliateConversion) => <span className="font-mono text-xs">{r.orderId}</span> },
    { key: "orderAmount", header: "Amount", render: (r: AffiliateConversion) => `$${Number(r.orderAmount).toLocaleString()}` },
    { key: "commissionRate", header: "Rate", render: (r: AffiliateConversion) => `${r.commissionRate}%` },
    { key: "commissionAmount", header: "Commission", render: (r: AffiliateConversion) => <span className="font-semibold">${Number(r.commissionAmount).toFixed(2)}</span> },
    { key: "status", header: "Status", render: (r: AffiliateConversion) => <StatusBadge status={r.status} /> },
    { key: "actions", header: "Actions", render: (r: AffiliateConversion) => r.status === "PENDING" ? (
      <div className="flex gap-1">
        <button onClick={() => handleReviewConversion(r.id, "CONFIRMED")} className="rounded bg-green-600/20 px-2 py-1 text-xs text-green-400 hover:bg-green-600/30"><CheckCircle className="inline h-3 w-3 mr-1" />Confirm</button>
        <button onClick={() => handleReviewConversion(r.id, "REJECTED")} className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-400 hover:bg-red-600/30"><XCircle className="inline h-3 w-3 mr-1" />Reject</button>
      </div>
    ) : null },
    { key: "createdAt", header: "Date", render: (r: AffiliateConversion) => new Date(r.createdAt).toLocaleDateString() },
  ];

  const payoutColumns = [
    { key: "amount", header: "Amount", render: (r: CommissionPayout) => <span className="font-semibold">${Number(r.amount).toLocaleString()}</span> },
    { key: "payoutMethod", header: "Method", render: (r: CommissionPayout) => r.payoutMethod?.replace("_", " ") ?? "—" },
    { key: "status", header: "Status", render: (r: CommissionPayout) => <StatusBadge status={r.status} /> },
    { key: "actions", header: "Actions", render: (r: CommissionPayout) => r.status === "PENDING" ? (
      <div className="flex gap-1">
        <button onClick={() => handleReviewPayout(r.id, "APPROVED")} className="rounded bg-green-600/20 px-2 py-1 text-xs text-green-400 hover:bg-green-600/30"><CheckCircle className="inline h-3 w-3 mr-1" />Approve</button>
        <button onClick={() => handleReviewPayout(r.id, "REJECTED")} className="rounded bg-red-600/20 px-2 py-1 text-xs text-red-400 hover:bg-red-600/30"><XCircle className="inline h-3 w-3 mr-1" />Reject</button>
      </div>
    ) : null },
    { key: "transactionRef", header: "Ref", render: (r: CommissionPayout) => <span className="font-mono text-xs">{r.transactionRef ?? "—"}</span> },
    { key: "processedAt", header: "Processed", render: (r: CommissionPayout) => r.processedAt ? new Date(r.processedAt).toLocaleDateString() : "—" },
  ];

  const clickColumns = [
    { key: "ipAddress", header: "IP", render: (r: AffiliateClick) => <span className="font-mono text-xs">{r.ipAddress}</span> },
    { key: "referrerUrl", header: "Referrer", render: (r: AffiliateClick) => <span className="truncate text-xs max-w-[200px] block">{r.referrerUrl ?? "Direct"}</span> },
    { key: "utmSource", header: "Source", render: (r: AffiliateClick) => r.utmSource ?? "—" },
    { key: "utmMedium", header: "Medium", render: (r: AffiliateClick) => r.utmMedium ?? "—" },
    { key: "utmCampaign", header: "Campaign", render: (r: AffiliateClick) => r.utmCampaign ?? "—" },
    { key: "fingerprint", header: "Fingerprint", render: (r: AffiliateClick) => <span className="font-mono text-xs">{r.fingerprint ?? "—"}</span> },
    { key: "createdAt", header: "Time", render: (r: AffiliateClick) => new Date(r.createdAt).toLocaleString() },
  ];

  const selectedFraud = selected ? fraudSignals.find((f) => f.affiliateId === selected.id) : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Affiliate Management" description={`${data.total} affiliates`} />

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <div className="rounded-lg bg-[var(--color-brand-muted)] p-2"><Users className="h-4 w-4 text-[var(--color-brand)]" /></div>
          <div><p className="text-xs text-[var(--color-text-muted)]">Active</p><p className="text-lg font-semibold">{data.items.filter((a) => a.status === "ACTIVE").length}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <div className="rounded-lg bg-[var(--color-brand-muted)] p-2"><DollarSign className="h-4 w-4 text-[var(--color-brand)]" /></div>
          <div><p className="text-xs text-[var(--color-text-muted)]">Total Paid</p><p className="text-lg font-semibold">${data.items.reduce((s, a) => s + Number(a.totalPaid), 0).toLocaleString()}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <div className="rounded-lg bg-[var(--color-warning-muted)] p-2"><TrendingUp className="h-4 w-4 text-[var(--color-warning)]" /></div>
          <div><p className="text-xs text-[var(--color-text-muted)]">Pending</p><p className="text-lg font-semibold">${data.items.reduce((s, a) => s + Number(a.pendingBalance), 0).toLocaleString()}</p></div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <div className="rounded-lg bg-red-900/30 p-2"><ShieldAlert className="h-4 w-4 text-red-400" /></div>
          <div><p className="text-xs text-[var(--color-text-muted)]">Fraud Alerts</p><p className="text-lg font-semibold">{fraudSignals.reduce((s, f) => s + f.signals.length, 0)}</p></div>
        </div>
      </div>

      {/* Fraud Alerts Banner */}
      {fraudSignals.length > 0 && (
        <div className="rounded-lg border border-red-800/40 bg-red-900/10 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-semibold text-red-300">Active Fraud Signals</h3>
          </div>
          <div className="space-y-2">
            {fraudSignals.map((f) =>
              f.signals.map((s, i) => (
                <div key={`${f.affiliateId}-${i}`} className="flex items-center gap-3 text-xs">
                  <span className={`rounded px-1.5 py-0.5 font-medium ${s.severity === "HIGH" ? "bg-red-600/20 text-red-400" : s.severity === "MEDIUM" ? "bg-yellow-600/20 text-yellow-400" : "bg-neutral-600/20 text-neutral-400"}`}>
                    {s.severity}
                  </span>
                  <span className="font-mono text-[var(--color-brand)]">{f.affiliateCode}</span>
                  <span className="text-[var(--color-text-muted)]">{s.type.replace(/_/g, " ")}</span>
                  <span className="text-neutral-400">{s.detail}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
        onRowClick={(row) => { setSelected(row as unknown as AffiliateAccount); setTab("details"); }}
      />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />

      {/* Detail Panel */}
      {selected && (
        <div className="space-y-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">{selected.affiliateCode} — Details</h3>
              <StatusBadge status={selected.status} />
            </div>
            <div className="flex items-center gap-2">
              {selected.status === "PENDING" && (
                <button onClick={() => handleStatusChange(selected.id, "ACTIVE")} className="rounded bg-green-600/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-600/30">Activate</button>
              )}
              {selected.status === "ACTIVE" && (
                <button onClick={() => handleStatusChange(selected.id, "SUSPENDED")} className="rounded bg-yellow-600/20 px-3 py-1.5 text-xs font-medium text-yellow-400 hover:bg-yellow-600/30">Suspend</button>
              )}
              {selected.status === "SUSPENDED" && (
                <>
                  <button onClick={() => handleStatusChange(selected.id, "ACTIVE")} className="rounded bg-green-600/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-600/30">Reactivate</button>
                  <button onClick={() => handleStatusChange(selected.id, "TERMINATED")} className="rounded bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30">Terminate</button>
                </>
              )}
              <button onClick={() => setSelected(null)} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Close</button>
            </div>
          </div>

          {/* Fraud signals for selected affiliate */}
          {selectedFraud && selectedFraud.signals.length > 0 && (
            <div className="rounded-lg border border-red-800/40 bg-red-900/10 p-3">
              <p className="mb-2 text-xs font-semibold text-red-300 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Fraud Signals</p>
              {selectedFraud.signals.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs mb-1">
                  <span className={`rounded px-1.5 py-0.5 font-medium ${s.severity === "HIGH" ? "bg-red-600/20 text-red-400" : "bg-yellow-600/20 text-yellow-400"}`}>{s.severity}</span>
                  <span className="text-neutral-400">{s.type.replace(/_/g, " ")}: {s.detail}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 border-b border-[var(--color-border)]">
            <button onClick={() => setTab("details")} className={`pb-2 text-sm font-medium ${tab === "details" ? "border-b-2 border-[var(--color-brand)] text-[var(--color-brand)]" : "text-[var(--color-text-muted)]"}`}>
              <Eye className="inline h-3 w-3 mr-1" />Conversions & Payouts
            </button>
            <button onClick={() => setTab("fraud")} className={`pb-2 text-sm font-medium ${tab === "fraud" ? "border-b-2 border-[var(--color-brand)] text-[var(--color-brand)]" : "text-[var(--color-text-muted)]"}`}>
              <MousePointerClick className="inline h-3 w-3 mr-1" />Click Analytics ({clicks.length})
            </button>
          </div>

          {tab === "details" && (
            <>
              <div>
                <h4 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">Conversions</h4>
                <DataTable columns={convColumns} data={conversions} keyField="id" />
              </div>
              <div>
                <h4 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">Commission Payouts</h4>
                <DataTable columns={payoutColumns} data={commPayouts} keyField="id" />
              </div>
            </>
          )}

          {tab === "fraud" && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-[var(--color-text-muted)]">Recent Clicks</h4>
              <DataTable columns={clickColumns} data={clicks} keyField="id" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
