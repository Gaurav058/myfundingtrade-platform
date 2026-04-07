"use client";

import React, { useEffect, useState } from "react";
import { getOrders } from "@/lib/api-client";
import type { Order, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";

export default function OrdersPage() {
  const [data, setData] = useState<PaginatedResponse<Order> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError(false);
    getOrders(page).then((res) => {
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
    { key: "orderNumber", header: "Order #", render: (r: Order) => (
      <span className="font-mono text-xs font-medium text-[var(--color-text)]">{r.orderNumber}</span>
    )},
    { key: "userId", header: "User", render: (r: Order) => (
      <span className="font-mono text-xs text-[var(--color-text-muted)]">{r.userId}</span>
    )},
    { key: "subtotal", header: "Subtotal", render: (r: Order) => `$${Number(r.subtotal).toFixed(2)}` },
    { key: "discountAmount", header: "Discount", render: (r: Order) => Number(r.discountAmount) > 0 ? `-$${Number(r.discountAmount).toFixed(2)}` : "—" },
    { key: "totalAmount", header: "Total", render: (r: Order) => (
      <span className="font-semibold">${Number(r.totalAmount).toFixed(2)}</span>
    )},
    { key: "status", header: "Status", render: (r: Order) => <StatusBadge status={r.status} /> },
    { key: "createdAt", header: "Date", render: (r: Order) => (
      <span className="text-xs text-[var(--color-text-muted)]">{new Date(r.createdAt).toLocaleDateString()}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description={`${data.total} total orders`} />
      <FilterBar
        searchPlaceholder="Search by order number..."
        onSearch={() => {}}
        filters={[
          { key: "status", label: "Status", options: [
            { value: "PAID", label: "Paid" }, { value: "PENDING_PAYMENT", label: "Pending" },
            { value: "REFUNDED", label: "Refunded" }, { value: "CANCELLED", label: "Cancelled" },
          ]},
        ]}
        onFilterChange={() => {}}
      />
      <DataTable columns={columns} data={data.items} keyField="id" />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
}
