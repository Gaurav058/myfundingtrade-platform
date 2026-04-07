"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUsers } from "@/lib/api-client";
import type { UserWithProfile, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";

export default function UsersPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<UserWithProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError(false);
    getUsers(page).then((res) => {
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
    { key: "email", header: "Email", render: (r: UserWithProfile) => (
      <div>
        <p className="font-medium text-[var(--color-text)]">{r.profile ? `${r.profile.firstName} ${r.profile.lastName}` : "—"}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{r.email}</p>
      </div>
    )},
    { key: "role", header: "Role", render: (r: UserWithProfile) => <StatusBadge status={r.role} /> },
    { key: "status", header: "Status", render: (r: UserWithProfile) => <StatusBadge status={r.status} /> },
    { key: "emailVerified", header: "Verified", render: (r: UserWithProfile) => (
      <span className={`text-xs ${r.emailVerified ? "text-[var(--color-brand)]" : "text-[var(--color-text-muted)]"}`}>
        {r.emailVerified ? "Yes" : "No"}
      </span>
    )},
    { key: "createdAt", header: "Joined", render: (r: UserWithProfile) => (
      <span className="text-xs text-[var(--color-text-muted)]">{new Date(r.createdAt).toLocaleDateString()}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description={`${data.total} total users`} />
      <FilterBar
        searchPlaceholder="Search users..."
        onSearch={() => {}}
        filters={[
          { key: "role", label: "Role", options: [
            { value: "TRADER", label: "Trader" }, { value: "AFFILIATE", label: "Affiliate" },
            { value: "SUPER_ADMIN", label: "Admin" },
          ]},
          { key: "status", label: "Status", options: [
            { value: "ACTIVE", label: "Active" }, { value: "SUSPENDED", label: "Suspended" },
            { value: "BANNED", label: "Banned" },
          ]},
        ]}
        onFilterChange={() => {}}
      />
      <DataTable
        columns={columns}
        data={data.items}
        keyField="id"
        onRowClick={(row) => router.push(`/users/${(row as unknown as UserWithProfile).id}`)}
      />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
}
