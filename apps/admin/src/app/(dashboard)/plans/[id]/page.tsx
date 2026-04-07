"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPlan } from "@/lib/api-client";
import type { ChallengePlan, ChallengeVariant } from "@myfundingtrade/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/ui/data-table";
import { LoadingState, ErrorState } from "@/components/ui/shared";
import { ArrowLeft, Plus, Pencil } from "lucide-react";

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plan, setPlan] = useState<ChallengePlan | null>(null);
  const [variants, setVariants] = useState<ChallengeVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getPlan(id).then((res) => {
      if (res.success && res.data) {
        setPlan(res.data.plan ?? null);
        setVariants(res.data.variants ?? []);
      } else setError(true);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  if (loading) return <LoadingState />;
  if (error || !plan) return <ErrorState onRetry={load} />;

  const variantCols = [
    { key: "accountSize", header: "Account Size", render: (r: ChallengeVariant) => (
      <span className="font-medium">${r.accountSize.toLocaleString()}</span>
    )},
    { key: "price", header: "Price", render: (r: ChallengeVariant) => `$${r.price}` },
    { key: "leverage", header: "Leverage", render: (r: ChallengeVariant) => `1:${r.leverage}` },
    { key: "profitSplit", header: "Profit Split", render: (r: ChallengeVariant) => `${r.profitSplit}%` },
    { key: "phases", header: "Phases" },
    { key: "isActive", header: "Status", render: (r: ChallengeVariant) => <StatusBadge status={r.isActive ? "ACTIVE" : "INACTIVE"} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={plan.name}
        description={plan.description ?? undefined}
        actions={
          <div className="flex gap-2">
            <button onClick={() => router.back()} className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-hover)]">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button className="flex items-center gap-1 rounded-lg bg-[var(--color-brand)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--color-brand-hover)]">
              <Pencil className="h-3.5 w-3.5" /> Edit Plan
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">Status</p>
          <StatusBadge status={plan.isActive ? "ACTIVE" : "INACTIVE"} />
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">Slug</p>
          <p className="font-mono text-sm text-[var(--color-text)]">{plan.slug}</p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <p className="text-xs text-[var(--color-text-muted)]">Variants</p>
          <p className="text-sm font-semibold text-[var(--color-text)]">{variants.length}</p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-text-heading)]">Pricing Variants</h3>
          <button className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-hover)]">
            <Plus className="h-3.5 w-3.5" /> Add Variant
          </button>
        </div>
        <DataTable
          columns={variantCols}
          data={variants}
          keyField="id"
        />
      </div>
    </div>
  );
}
