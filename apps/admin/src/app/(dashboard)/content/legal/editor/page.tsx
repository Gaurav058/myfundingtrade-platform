"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLegalDocuments, createLegalDocument, updateLegalDocument } from "@/lib/api-client";
import type { LegalDocument, PaginatedResponse } from "@myfundingtrade/types";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, ErrorState } from "@/components/ui/shared";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const LEGAL_TYPES = [
  { value: "TERMS_OF_SERVICE", label: "Terms of Service" },
  { value: "PRIVACY_POLICY", label: "Privacy Policy" },
  { value: "RISK_DISCLOSURE", label: "Risk Disclosure" },
  { value: "REFUND_POLICY", label: "Refund Policy" },
  { value: "COOKIE_POLICY", label: "Cookie Policy" },
  { value: "AML_POLICY", label: "AML Policy" },
  { value: "AFFILIATE_AGREEMENT", label: "Affiliate Agreement" },
];

export default function LegalEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const [form, setForm] = useState({
    title: "",
    type: "TERMS_OF_SERVICE",
    version: "1.0",
    content: "",
    effectiveAt: new Date().toISOString().split("T")[0],
    isActive: true,
  });

  useEffect(() => {
    if (editId) {
      getLegalDocuments(1).then((res) => {
        if (res.success && res.data) {
          const doc = (res.data as PaginatedResponse<LegalDocument>).items.find((d) => d.id === editId);
          if (doc) {
            setForm({
              title: doc.title,
              type: doc.type,
              version: doc.version,
              content: doc.content,
              effectiveAt: new Date(doc.effectiveAt).toISOString().split("T")[0],
              isActive: doc.isActive,
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
    const res = editId
      ? await updateLegalDocument(editId, { title: form.title, content: form.content, isActive: form.isActive, effectiveAt: form.effectiveAt })
      : await createLegalDocument(form);
    setSaving(false);
    if (res.success) {
      router.push("/content/legal");
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
        title={editId ? "Edit Legal Document" : "New Legal Document"}
        actions={
          <Link
            href="/content/legal"
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Title</label>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className={labelCls}>Type</label>
            <select
              className={inputCls}
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              disabled={!!editId}
            >
              {LEGAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Version</label>
            <input
              className={inputCls}
              value={form.version}
              onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))}
              placeholder="e.g. 1.0"
              required
              disabled={!!editId}
            />
          </div>

          <div>
            <label className={labelCls}>Effective Date</label>
            <input
              type="date"
              className={inputCls}
              value={form.effectiveAt}
              onChange={(e) => setForm((f) => ({ ...f, effectiveAt: e.target.value }))}
              required
            />
          </div>

          <div className="flex items-end pb-0.5">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="rounded border-[var(--color-border)]"
              />
              <label htmlFor="isActive" className="text-sm text-[var(--color-text)]">
                Active
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>Content (HTML)</label>
          <textarea
            className={`${inputCls} font-mono`}
            rows={24}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : editId ? "Update Document" : "Create Document"}
        </button>
      </form>
    </div>
  );
}
