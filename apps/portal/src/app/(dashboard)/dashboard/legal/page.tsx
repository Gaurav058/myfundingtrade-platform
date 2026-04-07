"use client";

import { useEffect, useState } from "react";
import { FileText, CheckCircle, ExternalLink } from "lucide-react";
import { LoadingRows } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { getLegalDocuments, getLegalConsents } from "@/lib/api-client";
import type { LegalDocument, LegalConsent } from "@myfundingtrade/types";

export default function LegalPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [consents, setConsents] = useState<LegalConsent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [dRes, cRes] = await Promise.all([getLegalDocuments(), getLegalConsents()]);
      if (dRes.success && dRes.data) setDocuments(dRes.data);
      if (cRes.success && cRes.data) setConsents(cRes.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingRows rows={4} />;
  if (error) return <ErrorState onRetry={load} />;

  function getConsentFor(docId: string) {
    return consents.find((c) => c.documentId === docId);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Legal & Consent</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Review legal documents and your consent history
        </p>
      </div>

      {/* Documents */}
      <div className="space-y-3">
        {documents.map((doc) => {
          const consent = getConsentFor(doc.id);
          return (
            <div
              key={doc.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" />
                  <div>
                    <p className="text-sm font-medium text-neutral-200">{doc.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Version {doc.version} · Effective{" "}
                      {new Date(doc.effectiveAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-neutral-400 hover:bg-[var(--color-bg-surface-hover)] hover:text-white"
                >
                  View <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {consent && (
                <div className="mt-3 flex items-center gap-2 border-t border-[var(--color-border)] pt-3">
                  <CheckCircle className="h-4 w-4 text-[var(--color-brand)]" />
                  <span className="text-xs text-neutral-400">
                    Accepted on {new Date(consent.consentedAt).toLocaleDateString()}
                    {consent.ipAddress && ` from ${consent.ipAddress}`}
                  </span>
                </div>
              )}

              {!consent && (
                <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                  <span className="text-xs text-neutral-500">Not yet accepted</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Consent history */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Consent History</h2>
        <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          {consents.map((c) => {
            const doc = documents.find((d) => d.id === c.documentId);
            return (
              <div key={c.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-neutral-200">
                    {doc?.title ?? "Unknown Document"}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Accepted · IP: {c.ipAddress ?? "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-400">
                    {new Date(c.consentedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
