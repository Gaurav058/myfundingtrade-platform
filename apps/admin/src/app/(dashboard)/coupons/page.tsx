"use client";

import React, { useEffect, useState } from "react";
import { getCoupons } from "@/lib/api-client";
import type { Coupon, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";
import { Plus } from "lucide-react";

export default function CouponsPage() {
  const [data, setData] = useState<PaginatedResponse<Coupon> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError(false);
    getCoupons(page).then((res) => {
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
    { key: "code", header: "Code", render: (r: Coupon) => (
      <span className="font-mono text-sm font-semibold text-[var(--color-brand)]">{r.code}</span>
    )},
    { key: "type", header: "Type", render: (r: Coupon) => (
      <span className="text-xs">{r.type === "PERCENTAGE" ? `${r.value}% off` : `$${r.value} off`}</span>
    )},
    { key: "usageCount", header: "Usage", render: (r: Coupon) => (
      <span className="text-sm">{r.usageCount}/{r.maxUsageCount ?? "∞"}</span>
    )},
    { key: "validFrom", header: "Valid From", render: (r: Coupon) => (
      <span className="text-xs text-[var(--color-text-muted)]">{new Date(r.validFrom).toLocaleDateString()}</span>
    )},
    { key: "validUntil", header: "Valid Until", render: (r: Coupon) => (
      <span className="text-xs text-[var(--color-text-muted)]">{r.validUntil ? new Date(r.validUntil).toLocaleDateString() : "No expiry"}</span>
    )},
    { key: "isActive", header: "Status", render: (r: Coupon) => <StatusBadge status={r.isActive ? "ACTIVE" : "INACTIVE"} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons"
        description={`${data.total} coupons`}
        actions={
          <button className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-hover)]">
            <Plus className="h-4 w-4" /> New Coupon
          </button>
        }
      />
      <DataTable columns={columns} data={data.items} keyField="id" />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
}
