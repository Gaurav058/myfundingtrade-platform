"use client";

import React, { useEffect, useState } from "react";
import { getNotifications } from "@/lib/api-client";
import type { Notification, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";
import { Mail, Bell, Smartphone, Send } from "lucide-react";

export default function NotificationsPage() {
  const [data, setData] = useState<PaginatedResponse<Notification> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError(false);
    getNotifications(page).then((res) => {
      if (res.success && res.data) setData(res.data);
      else setError(true);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={load} />;

  const typeIcons: Record<string, React.ReactNode> = {
    EMAIL: <Mail className="h-3.5 w-3.5" />,
    IN_APP: <Bell className="h-3.5 w-3.5" />,
    SMS: <Smartphone className="h-3.5 w-3.5" />,
    PUSH: <Send className="h-3.5 w-3.5" />,
  };

  const columns = [
    { key: "type", header: "Type", render: (r: Notification) => (
      <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
        {typeIcons[r.type] ?? null}
        <span className="text-xs">{r.type}</span>
      </div>
    )},
    { key: "title", header: "Title", render: (r: Notification) => (
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{r.title}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-[var(--color-text-muted)]">{r.body}</p>
      </div>
    )},
    { key: "userId", header: "Recipient", render: (r: Notification) => (
      <span className="font-mono text-xs text-[var(--color-text-muted)]">{r.userId}</span>
    )},
    { key: "channel", header: "Channel", render: (r: Notification) => (
      <span className="rounded bg-[var(--color-bg)] px-2 py-0.5 text-xs">{r.channel}</span>
    )},
    { key: "status", header: "Status", render: (r: Notification) => <StatusBadge status={r.status} /> },
    { key: "sentAt", header: "Sent", render: (r: Notification) =>
      r.sentAt ? new Date(r.sentAt).toLocaleString() : "—"
    },
    { key: "readAt", header: "Read", render: (r: Notification) =>
      r.readAt ? new Date(r.readAt).toLocaleString() : "—"
    },
    { key: "failReason", header: "Error", render: (r: Notification) => (
      r.failReason
        ? <span className="text-xs text-[var(--color-danger)]">{r.failReason}</span>
        : <span className="text-xs text-[var(--color-text-muted)]">—</span>
    )},
  ];

  const delivered = data.items.filter((n) => n.status === "DELIVERED").length;
  const failed = data.items.filter((n) => n.status === "FAILED").length;

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description={`${data.total} total · ${delivered} delivered · ${failed} failed`} />

      <FilterBar
        searchPlaceholder="Search notifications..."
        onSearch={() => {}}
        filters={[
          { key: "type", label: "Type", options: [
            { value: "EMAIL", label: "Email" }, { value: "IN_APP", label: "In-App" },
            { value: "SMS", label: "SMS" }, { value: "PUSH", label: "Push" },
          ]},
          { key: "status", label: "Status", options: [
            { value: "QUEUED", label: "Queued" }, { value: "SENT", label: "Sent" },
            { value: "DELIVERED", label: "Delivered" }, { value: "FAILED", label: "Failed" },
            { value: "READ", label: "Read" },
          ]},
        ]}
        onFilterChange={() => {}}
      />

      <DataTable columns={columns} data={data.items} keyField="id" />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
}
