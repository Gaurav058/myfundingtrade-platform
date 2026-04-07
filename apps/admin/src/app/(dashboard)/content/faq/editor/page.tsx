"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getFaqs, createFaq, updateFaq } from "@/lib/api-client";
import type { FAQItem, PaginatedResponse } from "@myfundingtrade/types";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, ErrorState } from "@/components/ui/shared";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function FaqEditorPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <FaqEditorContent />
    </Suspense>
  );
}

function FaqEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const [form, setForm] = useState({
    question: "",
    answer: "",
    category: "",
    sortOrder: 0,
    isPublished: true,
  });

  useEffect(() => {
    if (editId) {
      getFaqs(1).then((res) => {
        if (res.success && res.data) {
          const faq = (res.data as PaginatedResponse<FAQItem>).items.find((f) => f.id === editId);
          if (faq) {
            setForm({
              question: faq.question,
              answer: faq.answer,
              category: faq.category ?? "",
              sortOrder: faq.sortOrder,
              isPublished: faq.isPublished,
            });
          } else {
            setError(true);
          }
        }
        setLoading(false);
      });
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, category: form.category || undefined };
    const res = editId ? await updateFaq(editId, payload) : await createFaq(payload);
    setSaving(false);
    if (res.success) {
      router.push("/content/faq");
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
        title={editId ? "Edit FAQ" : "New FAQ"}
        actions={
          <Link
            href="/content/faq"
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className={labelCls}>Question</label>
          <input
            className={inputCls}
            value={form.question}
            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className={labelCls}>Answer</label>
          <textarea
            className={inputCls}
            rows={6}
            value={form.answer}
            onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Category</label>
            <input
              className={inputCls}
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="e.g. General, Payouts"
            />
          </div>

          <div>
            <label className={labelCls}>Sort Order</label>
            <input
              type="number"
              className={inputCls}
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublished"
            checked={form.isPublished}
            onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
            className="rounded border-[var(--color-border)]"
          />
          <label htmlFor="isPublished" className="text-sm text-[var(--color-text)]">
            Published (visible on website)
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : editId ? "Update FAQ" : "Create FAQ"}
        </button>
      </form>
    </div>
  );
}
