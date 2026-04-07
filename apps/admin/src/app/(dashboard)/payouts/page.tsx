"use client";

import React, { useEffect, useState } from "react";
import { getPayoutRequests } from "@/lib/api-client";
import type { PayoutRequest, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AuditTrail } from "@/components/ui/audit-trail";
import { mockAuditLogs } from "@/lib/mock-data";
import { CheckCircle, XCircle } from "lucide-react";

export default function PayoutsPage() {
  const [data, setData] = useState<PaginatedResponse<PayoutRequest> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<PayoutRequest | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getPayoutRequests(page).then((res) => {
      if (res.success && res.data) setData(res.data);
      else setError(true);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={load} />;

  const payoutLogs = mockAuditLogs.filter((l) => l.resource === "payout");

  const columns = [
    { key: "requestNumber", header: "Request #", render: (r: PayoutRequest) => (
      <span className="font-mono text-xs font-medium text-[var(--color-text)]">{r.requestNumber}</span>
    )},
    { key: "userId", header: "User", render: (r: PayoutRequest) => (
      <span className="font-mono text-xs text-[var(--color-text-muted)]">{r.userId}</span>
    )},
    { key: "amount", header: "Amount", render: (r: PayoutRequest) => (
      <span className="font-semibold">${r.amount.toLocaleString()}</span>
    )},
    { key: "traderShare", header: "Trader Share", render: (r: PayoutRequest) => `$${r.traderShare.toLocaleString()}` },
    { key: "companyShare", header: "Company Share", render: (r: PayoutRequest) => `$${r.companyShare.toLocaleString()}` },
    { key: "status", header: "Status", render: (r: PayoutRequest) => <StatusBadge status={r.status} /> },
    { key: "actions", header: "Actions", render: (r: PayoutRequest) => (
      <div className="flex gap-1">
        {r.status === "PENDING_APPROVAL" && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setSelected(r); setApproveOpen(true); }} className="rounded p-1.5 text-[var(--color-brand)] hover:bg-[var(--color-brand-muted)]" title="Approve">
              <CheckCircle className="h-3.5 w-3.5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setSelected(r); setRejectOpen(true); }} className="rounded p-1.5 text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]" title="Reject">
              <XCircle className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Payout Approvals" description={`${data.items.filter((p) => p.status === "PENDING_APPROVAL").length} pending approval`} />
      <FilterBar
        searchPlaceholder="Search by request number..."
        onSearch={() => {}}
        filters={[
          { key: "status", label: "Status", options: [
            { value: "PENDING_APPROVAL", label: "Pending" }, { value: "APPROVED", label: "Approved" },
            { value: "COMPLETED", label: "Completed" }, { value: "REJECTED", label: "Rejected" },
          ]},
        ]}
        onFilterChange={() => {}}
      />
      <DataTable columns={columns} data={data.items} keyField="id" />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />

      <AuditTrail logs={payoutLogs} title="Payout Audit Trail" />

      <ConfirmModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve Payout"
        description={`Approve payout ${selected?.requestNumber} for $${selected?.traderShare.toLocaleString()} to trader?`}
        confirmLabel="Approve Payout"
        confirmVariant="success"
        onConfirm={() => setSelected(null)}
        showNote
        noteLabel="Approval Note"
      />
      <ConfirmModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject Payout"
        description={`Reject payout ${selected?.requestNumber}?`}
        confirmLabel="Reject Payout"
        confirmVariant="danger"
        onConfirm={() => setSelected(null)}
        showNote
        noteLabel="Rejection Reason"
        notePlaceholder="Enter reason..."
        noteRequired
      />
    </div>
  );
}
