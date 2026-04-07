"use client";

import React, { useEffect, useState } from "react";
import { getBlogPosts, getBlogCategories } from "@/lib/api-client";
import type { BlogPost, BlogCategory, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";
import { Plus, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function BlogPage() {
  const [data, setData] = useState<PaginatedResponse<BlogPost> | null>(null);
  const [cats, setCats] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([getBlogPosts(page), getBlogCategories()]).then(([postRes, catRes]) => {
      if (postRes.success && postRes.data) setData(postRes.data);
      else setError(true);
      if (catRes.success && catRes.data) setCats(catRes.data as BlogCategory[]);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={load} />;

  const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));

  const columns = [
    { key: "title", header: "Title", render: (r: BlogPost) => (
      <div>
        <p className="font-medium text-[var(--color-text)]">{r.title}</p>
        <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">/{r.slug}</p>
      </div>
    )},
    { key: "categoryId", header: "Category", render: (r: BlogPost) => (
      <span className="rounded bg-[var(--color-bg)] px-2 py-0.5 text-xs">{(r.categoryId && catMap[r.categoryId]) ?? "—"}</span>
    )},
    { key: "status", header: "Status", render: (r: BlogPost) => <StatusBadge status={r.status} /> },
    { key: "publishedAt", header: "Published", render: (r: BlogPost) =>
      r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : "—"
    },
    { key: "seoTitle", header: "SEO", render: (r: BlogPost) => (
      <span className={`text-xs ${r.seoTitle ? "text-[var(--color-brand)]" : "text-[var(--color-text-muted)]"}`}>
        {r.seoTitle ? "✓ Set" : "Missing"}
      </span>
    )},
    { key: "actions", header: "", render: (_r: BlogPost) => (
      <button className="rounded p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]" title="Preview">
        <ExternalLink className="h-3.5 w-3.5" />
      </button>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog Posts"
        description={`${data.total} posts`}
        actions={
          <Link href="/content/blog/editor" className="flex items-center gap-1.5 rounded bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <Plus className="h-4 w-4" /> New Post
          </Link>
        }
      />

      {/* Categories */}
      <div className="flex gap-2">
        {cats.map((c) => (
          <div key={c.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-xs">
            <span className="font-medium">{c.name}</span>
            <span className="ml-2 text-[var(--color-text-muted)]">/{c.slug}</span>
          </div>
        ))}
      </div>

      <FilterBar
        searchPlaceholder="Search posts..."
        onSearch={() => {}}
        filters={[
          { key: "status", label: "Status", options: [
            { value: "DRAFT", label: "Draft" }, { value: "PUBLISHED", label: "Published" },
            { value: "SCHEDULED", label: "Scheduled" }, { value: "ARCHIVED", label: "Archived" },
          ]},
          { key: "category", label: "Category", options: cats.map((c) => ({ value: c.id, label: c.name })) },
        ]}
        onFilterChange={() => {}}
      />

      <DataTable columns={columns} data={data.items} keyField="id" />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
    </div>
  );
}
