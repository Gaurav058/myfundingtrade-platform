"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Upload, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@myfundingtrade/ui";
import { StatusBadge } from "@/components/ui/status-badge";
import { FileUpload } from "@/components/ui/file-upload";
import { LoadingRows } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { getKycStatus, submitKyc } from "@/lib/api-client";
import type { KycSubmission } from "@myfundingtrade/types";

export default function KycPage() {
  const [kyc, setKyc] = useState<KycSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [addressFile, setAddressFile] = useState<File | null>(null);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await getKycStatus();
      if (res.success && res.data) setKyc(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit() {
    if (!idFile) return;
    setSubmitting(true);
    const fd = new FormData();
    fd.append("idDocument", idFile);
    if (addressFile) fd.append("addressProof", addressFile);
    try {
      const res = await submitKyc(fd);
      if (res.success) setKyc(res.data as KycSubmission);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingRows rows={4} />;
  if (error) return <ErrorState onRetry={load} />;

  const statusIcon: Record<string, React.ReactNode> = {
    APPROVED: <CheckCircle className="h-8 w-8 text-[var(--color-brand)]" />,
    UNDER_REVIEW: <Clock className="h-8 w-8 text-[var(--color-warning)]" />,
    REJECTED: <XCircle className="h-8 w-8 text-[var(--color-danger)]" />,
    NOT_STARTED: <ShieldCheck className="h-8 w-8 text-neutral-500" />,
    PENDING_DOCUMENTS: <Clock className="h-8 w-8 text-[var(--color-warning)]" />,
    EXPIRED: <XCircle className="h-8 w-8 text-neutral-500" />,
    RESUBMISSION_REQUIRED: <XCircle className="h-8 w-8 text-[var(--color-warning)]" />,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">KYC Verification</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Verify your identity to unlock payouts and full account access
        </p>
      </div>

      {/* Current status */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <div className="flex items-center gap-4">
          {statusIcon[kyc?.status ?? "NOT_STARTED"]}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-white">Verification Status</h2>
              <StatusBadge status={kyc?.status ?? "NOT_STARTED"} />
            </div>
            <p className="mt-0.5 text-sm text-neutral-400">
              {kyc?.status === "APPROVED" && "Your identity has been verified. You're all set!"}
              {kyc?.status === "UNDER_REVIEW" && "We're reviewing your documents. This usually takes 1-2 business days."}
              {kyc?.status === "REJECTED" && `Your submission was rejected. Please resubmit.`}
              {(!kyc || kyc.status === "NOT_STARTED") && "Please upload your documents below to start the verification process."}
            </p>
          </div>
        </div>

        {kyc?.documentType && (
          <div className="mt-4 grid gap-3 border-t border-[var(--color-border)] pt-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-neutral-500">Document Type</p>
              <p className="text-sm text-neutral-300">{kyc.documentType}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Submitted</p>
              <p className="text-sm text-neutral-300">
                {kyc?.submittedAt && new Date(kyc.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Upload form — show if not submitted or rejected */}
      {(!kyc || kyc.status === "NOT_STARTED" || kyc.status === "REJECTED") && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Upload Documents</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <FileUpload
              label="Government-issued ID"
              accept="image/*,.pdf"
              onFile={setIdFile}
            />
            <FileUpload
              label="Proof of Address (optional)"
              accept="image/*,.pdf"
              onFile={setAddressFile}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={!idFile}
              isLoading={submitting}
            >
              <Upload className="mr-2 h-4 w-4" />
              Submit for Review
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
