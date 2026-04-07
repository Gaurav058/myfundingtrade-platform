"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <XCircle className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Payment Cancelled</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Your payment was not completed. No charges have been made. You can try again at any time.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/dashboard/challenges/buy"
            className="rounded-lg bg-[var(--color-brand)] px-4 py-2.5 text-sm font-medium text-black hover:bg-[var(--color-brand-hover)]"
          >
            Try Again
          </Link>
          <Link
            href="/dashboard/challenges"
            className="text-sm text-neutral-400 hover:text-white"
          >
            Back to Challenges
          </Link>
        </div>
      </div>
    </div>
  );
}
