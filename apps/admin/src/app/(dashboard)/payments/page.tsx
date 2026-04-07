"use client";

import React, { useEffect, useState } from "react";
import { getPayments, refundPayment } from "@/lib/api-client";
import type { Payment, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";

export default function PaymentsPage() {
  const [data, setData] = useState<PaginatedResponse<Payment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [refunding, setRefunding] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(false);
    getPayments(page).then((res) => {
      if (res.success && res.data) setData(res.data);
      else setError(true);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);

  const handleRefund = async (paymentId: string) => {
    if (!confirm("Are you sure you want to refund this payment?")) return;
    setRefunding(paymentId);
    try {
      const res = await refundPayment(paymentId);
      if (res.success) {
        load(); // reload after refund
      }
    } finally {
      setRefunding(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={load} />;

  const columns = [
    { key: "id", header: "Payment ID", render: (r: Payment) => (
      <span className="font-mono text-xs text-[var(--color-text)]">{r.id}</span>
    )},
    { key: "orderId", header: "Order", render: (r: Payment) => (
      <span className="font-mono text-xs text-[var(--color-text-muted)]">{r.orderId}</span>
    )},
    { key: "provider", header: "Provider", render: (r: Payment) => <StatusBadge status={r.provider} /> },
    { key: "amount", header: "Amount", render: (r: Payment) => (
      <span className="font-semibold">${Number(r.amount).toFixed(2)}</span>
    )},
    { key: "providerFee", header: "Fee", render: (r: Payment) => r.providerFee ? `$${Number(r.providerFee).toFixed(2)}` : "—" },
    { key: "status", header: "Status", render: (r: Payment) => <StatusBadge status={r.status} /> },
    { key: "paidAt", header: "Paid", render: (r: Payment) => (
      <span className="text-xs text-[var(--color-text-muted)]">{r.paidAt ? new Date(r.paidAt).toLocaleDateString() : "—"}</span>
    )},
    { key: "actions", header: "Actions", render: (r: Payment) => (
      r.status === "SUCCEEDED" ? (
        <button
          onClick={() => handleRefund(r.id)}
          disabled={refunding === r.id}
          className="rounded bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/20 disabled:opacity-50"
        >
          {refunding === r.id ? "Refunding…" : "Refund"}
        </button>
      ) : r.refundedAmount ? (
        <span className="text-xs text-neutral-500">Refunded ${Number(r.refundedAmount).toFixed(2)}</span>
      ) : null
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description={`${data.total} payment records`} />
      <FilterBar
        searchPlaceholder="Search by payment ID..."
        onSearch={() => {}}
        filters={[
          { key: "status", label: "Status", options: [
            { value: "SUCCEEDED", label: "Succeeded" }, { value: "FAILED", label: "Failed" },
            { value: "REFUNDED", label: "Refunded" }, { value: "PENDING", label: "Pending" },
            { value: "DISPUTED", label: "Disputed" },
          ]},
          { key: "provider", label: "Provider", options: [
            { value: "STRIPE", label: "Stripe" }, { value: "CRYPTO", label: "Crypto" },
          ]},
        ]}
        onFilterChange={() => {}}
      />
      <DataTable columns={columns} data={data.items} keyField="id" />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
}
