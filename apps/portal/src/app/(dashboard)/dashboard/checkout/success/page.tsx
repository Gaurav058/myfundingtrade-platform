"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Your challenge purchase has been confirmed. We&apos;re setting up your trading account now.
        </p>
        {sessionId && (
          <p className="mt-3 text-xs text-neutral-600">
            Reference: {sessionId.slice(0, 20)}…
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/dashboard/challenges"
            className="rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-black hover:bg-[var(--color-brand-hover)]"
          >
            View My Challenges
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-400 hover:text-white"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-neutral-500">Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
