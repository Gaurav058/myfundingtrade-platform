"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlans } from "@/lib/api-client";
import type { ChallengePlan, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";
import { Plus } from "lucide-react";
import { mockVariants } from "@/lib/mock-data";

export default function PlansPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<ChallengePlan> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getPlans().then((res) => {
      if (res.success && res.data) setData(res.data);
      else setError(true);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={load} />;

  const columns = [
    { key: "name", header: "Plan Name", render: (r: ChallengePlan) => (
      <p className="font-medium text-[var(--color-text)]">{r.name}</p>
    )},
    { key: "slug", header: "Slug", render: (r: ChallengePlan) => (
      <span className="font-mono text-xs text-[var(--color-text-muted)]">{r.slug}</span>
    )},
    { key: "variants", header: "Variants", render: (r: ChallengePlan) => (
      <span className="text-sm">{mockVariants.filter((v) => v.planId === r.id).length}</span>
    )},
    { key: "isActive", header: "Status", render: (r: ChallengePlan) => (
      <StatusBadge status={r.isActive ? "ACTIVE" : "INACTIVE"} />
    )},
    { key: "createdAt", header: "Created", render: (r: ChallengePlan) => (
      <span className="text-xs text-[var(--color-text-muted)]">{new Date(r.createdAt).toLocaleDateString()}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Challenge Plans"
        description={`${data.total} plans configured`}
        actions={
          <button className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-hover)]">
            <Plus className="h-4 w-4" /> New Plan
          </button>
        }
      />
      <DataTable
        columns={columns}
        data={data.items}
        keyField="id"
        onRowClick={(row) => router.push(`/plans/${(row as unknown as ChallengePlan).id}`)}
      />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={() => {}} />
    </div>
  );
}
