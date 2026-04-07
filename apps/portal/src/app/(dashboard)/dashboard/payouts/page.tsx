"use client";

import { useEffect, useState } from "react";
import { Wallet, Plus, CreditCard, Bitcoin } from "lucide-react";
import { formatCurrency } from "@myfundingtrade/utils";
import { Button } from "@myfundingtrade/ui";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingRows } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { getPayouts, getPayoutMethods } from "@/lib/api-client";
import type { PayoutRequest, PayoutMethod } from "@myfundingtrade/types";

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [methods, setMethods] = useState<PayoutMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [pRes, mRes] = await Promise.all([getPayouts(), getPayoutMethods()]);
      if (pRes.success && pRes.data) setPayouts(pRes.data);
      if (mRes.success && mRes.data) setMethods(mRes.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingRows rows={4} />;
  if (error) return <ErrorState onRetry={load} />;

  const totalPaid = payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payouts</h1>
          <p className="mt-1 text-sm text-neutral-400">Request and track your profit payouts</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Request Payout
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <p className="text-sm text-neutral-400">Total Paid Out</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-brand)]">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <p className="text-sm text-neutral-400">Pending</p>
          <p className="mt-1 text-2xl font-semibold text-[var(--color-warning)]">
            {formatCurrency(
              payouts
                .filter((p) => p.status === "PENDING_APPROVAL" || p.status === "PROCESSING")
                .reduce((s, p) => s + p.amount, 0),
            )}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <p className="text-sm text-neutral-400">Payout Methods</p>
          <p className="mt-1 text-2xl font-semibold text-white">{methods.length}</p>
        </div>
      </div>

      {/* Payment methods */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Payment Methods</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {methods.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4"
            >
              {m.type === "CRYPTO_WALLET" ? (
                <Bitcoin className="h-5 w-5 text-[var(--color-warning)]" />
              ) : (
                <CreditCard className="h-5 w-5 text-[var(--color-info)]" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-200">{m.label}</p>
                <p className="text-xs text-neutral-500">{m.type}</p>
              </div>
              {m.isDefault && (
                <span className="rounded bg-[var(--color-brand)]/10 px-2 py-0.5 text-xs text-[var(--color-brand)]">
                  Default
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Payout history */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Payout History</h2>
        {payouts.length === 0 ? (
          <EmptyState
            icon={<Wallet className="h-10 w-10" />}
            title="No payouts yet"
            description="Once you have profits in a funded account, you can request a payout."
          />
        ) : (
          <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            {payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-neutral-200">
                    {formatCurrency(p.amount)}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                    {p.processedAt &&
                      ` · Processed ${new Date(p.processedAt).toLocaleDateString()}`}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
