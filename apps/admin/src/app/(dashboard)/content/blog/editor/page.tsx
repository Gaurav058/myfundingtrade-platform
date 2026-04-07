"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBlogPost, getBlogCategories, createBlogPost, updateBlogPost } from "@/lib/api-client";
import type { BlogPost, BlogCategory } from "@myfundingtrade/types";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, ErrorState } from "@/components/ui/shared";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function BlogEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    categoryId: "",
    seoTitle: "",
    seoDescription: "",
    status: "DRAFT",
  });

  useEffect(() => {
    getBlogCategories().then((res) => {
      if (res.success && res.data) setCategories(res.data as BlogCategory[]);
    });

    if (editId) {
      getBlogPost(editId).then((res) => {
        if (res.success && res.data) {
          const p = res.data as BlogPost;
          setForm({
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt ?? "",
            content: p.content,
            coverImage: p.coverImage ?? "",
            categoryId: p.categoryId ?? "",
            seoTitle: p.seoTitle ?? "",
            seoDescription: p.seoDescription ?? "",
            status: p.status,
          });
        } else {
          setError(true);
        }
        setLoading(false);
      });
    }
  }, [editId]);

  const handleSlugify = () => {
    if (!form.slug && form.title) {
      setForm((f) => ({
        ...f,
        slug: f.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      categoryId: form.categoryId || undefined,
    };
    const res = editId
      ? await updateBlogPost(editId, payload)
      : await createBlogPost(payload);
    setSaving(false);
    if (res.success) {
      router.push("/content/blog");
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  const inputCls =
    "w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand)] focus:outline-none";
  const labelCls = "mb-1 block text-xs font-medium text-[var(--color-text-muted)]";

  return (
    <div className="space-y-6">
      <PageHeader
        title={editId ? "Edit Blog Post" : "New Blog Post"}
        actions={
          <Link
            href="/content/blog"
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main content — left 2 cols */}
        <div className="space-y-4 lg:col-span-2">
          <div>
            <label className={labelCls}>Title</label>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              onBlur={handleSlugify}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Slug</label>
            <input
              className={inputCls}
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Excerpt</label>
            <textarea
              className={inputCls}
              rows={3}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            />
          </div>

          <div>
            <label className={labelCls}>Content (Markdown)</label>
            <textarea
              className={`${inputCls} font-mono`}
              rows={20}
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* Sidebar — right col */}
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 space-y-4">
            <div>
              <label className={labelCls}>Status</label>
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Category</label>
              <select
                className={inputCls}
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Cover Image URL</label>
              <input
                className={inputCls}
                value={form.coverImage}
                onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))}
              />
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 space-y-4">
            <p className="text-xs font-semibold text-[var(--color-text)]">SEO</p>
            <div>
              <label className={labelCls}>SEO Title</label>
              <input
                className={inputCls}
                value={form.seoTitle}
                onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                maxLength={60}
              />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{form.seoTitle.length}/60</p>
            </div>

            <div>
              <label className={labelCls}>SEO Description</label>
              <textarea
                className={inputCls}
                rows={3}
                value={form.seoDescription}
                onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                maxLength={160}
              />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">{form.seoDescription.length}/160</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : editId ? "Update Post" : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
