"use client";

import React, { useEffect, useState } from "react";
import { getLegalDocuments } from "@/lib/api-client";
import type { LegalDocument, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";
import { Plus, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function LegalPage() {
  const [data, setData] = useState<PaginatedResponse<LegalDocument> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError(false);
    getLegalDocuments(page).then((res) => {
      if (res.success && res.data) setData(res.data);
      else setError(true);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={load} />;

  const typeLabels: Record<string, string> = {
    TERMS_OF_SERVICE: "Terms of Service",
    PRIVACY_POLICY: "Privacy Policy",
    RISK_DISCLOSURE: "Risk Disclosure",
    REFUND_POLICY: "Refund Policy",
    COOKIE_POLICY: "Cookie Policy",
    AML_POLICY: "AML Policy",
    AFFILIATE_AGREEMENT: "Affiliate Agreement",
  };

  const columns = [
    { key: "type", header: "Type", render: (r: LegalDocument) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-[var(--color-text-muted)]" />
        <span className="font-medium">{typeLabels[r.type] ?? r.type}</span>
      </div>
    )},
    { key: "title", header: "Title", render: (r: LegalDocument) => r.title },
    { key: "version", header: "Version", render: (r: LegalDocument) => (
      <span className="rounded bg-[var(--color-bg)] px-2 py-0.5 font-mono text-xs">v{r.version}</span>
    )},
    { key: "isActive", header: "Active", render: (r: LegalDocument) => (
      r.isActive
        ? <CheckCircle className="h-4 w-4 text-[var(--color-brand)]" />
        : <span className="text-xs text-[var(--color-text-muted)]">Inactive</span>
    )},
    { key: "effectiveAt", header: "Effective", render: (r: LegalDocument) => new Date(r.effectiveAt).toLocaleDateString() },
    { key: "updatedAt", header: "Updated", render: (r: LegalDocument) => new Date(r.updatedAt).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Legal Documents"
        description={`${data.total} documents, ${data.items.filter((d) => d.isActive).length} active`}
        actions={
          <Link href="/content/legal/editor" className="flex items-center gap-1.5 rounded bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> New Document
          </Link>
        }
      />
      <DataTable columns={columns} data={data.items} keyField="id" />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
}
