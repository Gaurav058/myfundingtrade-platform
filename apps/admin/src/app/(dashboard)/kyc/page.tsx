"use client";

import React, { useEffect, useState } from "react";
import { getKycSubmissions } from "@/lib/api-client";
import type { KycSubmission, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AuditTrail } from "@/components/ui/audit-trail";
import { getAuditLogs } from "@/lib/api-client";
import type { AdminActionLog } from "@myfundingtrade/types";
import { Eye, CheckCircle, XCircle } from "lucide-react";

export default function KycPage() {
  const [data, setData] = useState<PaginatedResponse<KycSubmission> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<KycSubmission | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AdminActionLog[]>([]);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([getKycSubmissions(page), getAuditLogs()]).then(([res, logsRes]) => {
      if (res.success && res.data) setData(res.data);
      else setError(true);
      if (logsRes.success && logsRes.data) {
        const items = Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data as any).items ?? [];
        setAuditLogs(items.filter((l: AdminActionLog) => l.resource === "kyc"));
      }
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={load} />;

  const kycLogs = auditLogs;

  const columns = [
    { key: "userId", header: "User", render: (r: KycSubmission) => (
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{r.fullName ?? "—"}</p>
        <p className="font-mono text-[10px] text-[var(--color-text-muted)]">{r.userId}</p>
      </div>
    )},
    { key: "documentType", header: "Doc Type", render: (r: KycSubmission) => (
      <span className="text-xs">{r.documentType.replace(/_/g, " ")}</span>
    )},
    { key: "nationality", header: "Nationality" },
    { key: "status", header: "Status", render: (r: KycSubmission) => <StatusBadge status={r.status} /> },
    { key: "submittedAt", header: "Submitted", render: (r: KycSubmission) => (
      <span className="text-xs text-[var(--color-text-muted)]">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "—"}</span>
    )},
    { key: "actions", header: "Actions", render: (r: KycSubmission) => (
      <div className="flex gap-1">
        <button onClick={(e) => { e.stopPropagation(); setSelected(r); }} className="rounded p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-hover)]" title="View">
          <Eye className="h-3.5 w-3.5" />
        </button>
        {r.status === "UNDER_REVIEW" && (
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
      <PageHeader title="KYC Reviews" description={`${data.items.filter((k) => k.status === "UNDER_REVIEW").length} pending review`} />
      <FilterBar
        searchPlaceholder="Search by name or user ID..."
        onSearch={() => {}}
        filters={[
          { key: "status", label: "Status", options: [
            { value: "UNDER_REVIEW", label: "Under Review" }, { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
          ]},
        ]}
        onFilterChange={() => {}}
      />
      <DataTable columns={columns} data={data.items} keyField="id" />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />

      {/* Detail slide-out */}
      {selected && !approveOpen && !rejectOpen && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--color-text-heading)]">Submission Details</h3>
            <button onClick={() => setSelected(null)} className="text-xs text-[var(--color-text-muted)]">Close</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-[var(--color-text-muted)]">Full Name</p><p>{selected.fullName}</p></div>
            <div><p className="text-xs text-[var(--color-text-muted)]">Date of Birth</p><p>{selected.dateOfBirth}</p></div>
            <div><p className="text-xs text-[var(--color-text-muted)]">Nationality</p><p>{selected.nationality}</p></div>
            <div><p className="text-xs text-[var(--color-text-muted)]">Document #</p><p className="font-mono">{selected.documentNumber}</p></div>
            <div><p className="text-xs text-[var(--color-text-muted)]">Expiry</p><p>{selected.documentExpiry}</p></div>
            <div><p className="text-xs text-[var(--color-text-muted)]">Status</p><StatusBadge status={selected.status} /></div>
          </div>
        </div>
      )}

      <AuditTrail logs={kycLogs} title="KYC Audit Trail" />

      <ConfirmModal
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title="Approve KYC"
        description={`Approve KYC for ${selected?.fullName}?`}
        confirmLabel="Approve"
        confirmVariant="success"
        onConfirm={() => setSelected(null)}
        showNote
        noteLabel="Review Note"
        notePlaceholder="Add approval note..."
      />
      <ConfirmModal
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        title="Reject KYC"
        description={`Reject KYC for ${selected?.fullName}? The user will be asked to resubmit.`}
        confirmLabel="Reject"
        confirmVariant="danger"
        onConfirm={() => setSelected(null)}
        showNote
        noteLabel="Rejection Reason"
        notePlaceholder="Enter reason for rejection..."
        noteRequired
      />
    </div>
  );
}
