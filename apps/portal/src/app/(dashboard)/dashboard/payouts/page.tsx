"use client";

import { useEffect, useState } from "react";
import { Wallet, Plus, CreditCard, Bitcoin, X, Loader2 } from "lucide-react";
import { formatCurrency } from "@myfundingtrade/utils";
import { Button, Input } from "@myfundingtrade/ui";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingRows } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { getPayouts, getPayoutMethods, requestPayout, getAccounts } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";
import type { PayoutRequest, PayoutMethod, TraderAccount } from "@myfundingtrade/types";

export default function PayoutsPage() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [methods, setMethods] = useState<PayoutMethod[]>([]);
  const [accounts, setAccounts] = useState<TraderAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [pRes, mRes, aRes] = await Promise.all([getPayouts(), getPayoutMethods(), getAccounts()]);
      if (pRes.success && pRes.data) setPayouts(pRes.data);
      if (mRes.success && mRes.data) setMethods(mRes.data);
      if (aRes.success && aRes.data) setAccounts(aRes.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRequestPayout() {
    if (!selectedAccount || !amount) return;
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const res = await requestPayout({
        traderAccountId: selectedAccount,
        amount: Number(amount),
        payoutMethod: selectedMethod || undefined,
      });
      if (res.success) {
        toastSuccess("Payout request submitted");
        setShowModal(false);
        setSelectedAccount("");
        setAmount("");
        setSelectedMethod("");
        load();
      } else {
        toastError(res.error ?? "Failed to request payout");
        setSubmitError(res.error ?? "Failed to request payout");
      }
    } catch {
      toastError("An unexpected error occurred");
      setSubmitError("An unexpected error occurred");
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) return <LoadingRows rows={4} />;
  if (error) return <ErrorState onRetry={load} />;

  const totalPaid = payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Payouts</h1>
          <p className="mt-1 text-sm text-neutral-400">Request and track your profit payouts</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Request Payout
        </Button>
      </div>

      {/* Request Payout Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Request Payout</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Funded Account</label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-white"
                >
                  <option value="">Select account</option>
                  {accounts
                    .filter((a) => a.status === "FUNDED" || a.currentPhase === "FUNDED")
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.accountNumber} — {formatCurrency(a.currentBalance)}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Amount (USD)</label>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              {methods.length > 0 && (
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Payout Method</label>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-white"
                  >
                    <option value="">Default method</option>
                    {methods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label} ({m.type})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {submitError && (
                <p className="text-sm text-red-400">{submitError}</p>
              )}
              <Button onClick={handleRequestPayout} disabled={!selectedAccount || !amount || submitLoading} className="w-full">
                {submitLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {submitLoading ? "Submitting…" : "Submit Request"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
                .reduce((s, p) => s + Number(p.amount), 0),
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
