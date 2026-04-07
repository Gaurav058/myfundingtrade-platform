"use client";

import React, { useEffect, useState } from "react";
import { getFaqs } from "@/lib/api-client";
import type { FAQItem, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";
import { Plus, Eye, EyeOff, GripVertical } from "lucide-react";

export default function FaqPage() {
  const [data, setData] = useState<PaginatedResponse<FAQItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError(false);
    getFaqs(page).then((res) => {
      if (res.success && res.data) setData(res.data);
      else setError(true);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={load} />;

  const categories = [...new Set(data.items.map((f) => f.category))];

  const columns = [
    { key: "sortOrder", header: "", className: "w-10", render: (r: FAQItem) => (
      <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
        <GripVertical className="h-3.5 w-3.5" />
        <span className="text-xs">{r.sortOrder}</span>
      </div>
    )},
    { key: "question", header: "Question", render: (r: FAQItem) => (
      <div>
        <p className="font-medium text-[var(--color-text)]">{r.question}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-[var(--color-text-muted)]">{r.answer}</p>
      </div>
    )},
    { key: "category", header: "Category", render: (r: FAQItem) => (
      <span className="rounded bg-[var(--color-bg)] px-2 py-0.5 text-xs">{r.category}</span>
    )},
    { key: "isPublished", header: "Published", render: (r: FAQItem) => (
      <button className={`flex items-center gap-1 rounded px-2 py-1 text-xs ${
        r.isPublished
          ? "text-[var(--color-brand)]"
          : "text-[var(--color-text-muted)]"
      }`}>
        {r.isPublished ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        {r.isPublished ? "Live" : "Hidden"}
      </button>
    )},
    { key: "updatedAt", header: "Updated", render: (r: FAQItem) => (
      <span className="text-xs text-[var(--color-text-muted)]">{new Date(r.updatedAt).toLocaleDateString()}</span>
    )},
  ];

  const publishedCount = data.items.filter((f) => f.isPublished).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="FAQ Management"
        description={`${publishedCount} published, ${data.total - publishedCount} hidden`}
        actions={
          <button className="flex items-center gap-1.5 rounded bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> Add FAQ
          </button>
        }
      />
      <FilterBar
        searchPlaceholder="Search FAQs..."
        onSearch={() => {}}
        filters={[
          { key: "category", label: "Category", options: categories.filter((c): c is string => c !== null).map((c) => ({ value: c, label: c })) },
          { key: "published", label: "Visibility", options: [
            { value: "true", label: "Published" }, { value: "false", label: "Hidden" },
          ]},
        ]}
        onFilterChange={() => {}}
      />
      <DataTable columns={columns} data={data.items} keyField="id" />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
}
