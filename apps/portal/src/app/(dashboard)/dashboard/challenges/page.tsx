"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, ArrowRight, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@myfundingtrade/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingRows } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { getAccounts, getOrders } from "@/lib/api-client";
import type { TraderAccount, Order } from "@myfundingtrade/types";

export default function ChallengesPage() {
  const [accounts, setAccounts] = useState<TraderAccount[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [accRes, ordRes] = await Promise.all([getAccounts(), getOrders()]);
      if (accRes.success && accRes.data) setAccounts(accRes.data);
      if (ordRes.success && ordRes.data) setOrders(ordRes.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Challenges</h1>
        <p className="mt-1 text-sm text-neutral-400">Your purchased challenges and their status</p>
      </div>

      {/* Purchase history */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Purchase History</h2>
        <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-neutral-200">Order #{order.id.slice(-6)}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {new Date(order.createdAt).toLocaleDateString()} · {order.currency}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{formatCurrency(order.totalAmount)}</p>
                <StatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Active challenges / accounts */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Active Challenges</h2>
        {loading && <LoadingRows rows={3} />}
        {error && <ErrorState onRetry={load} />}
        {!loading && !error && accounts.length === 0 && (
          <EmptyState
            icon={<Trophy className="h-10 w-10" />}
            title="No challenges yet"
            description="Purchase a challenge to start your funded trading journey."
            action={
              <Link
                href="/dashboard/challenges/buy"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-black hover:bg-[var(--color-brand-hover)]"
              >
                <ShoppingCart className="h-4 w-4" /> Browse Challenges
              </Link>
            }
          />
        )}
        {!loading && !error && accounts.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {accounts.map((acc) => (
              <Link
                key={acc.id}
                href={`/dashboard/accounts/${acc.id}`}
                className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition-colors hover:bg-[var(--color-bg-surface-hover)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-300">{acc.login ?? acc.accountNumber}</span>
                  <StatusBadge status={acc.status} />
                </div>
                <p className="mt-3 text-xl font-semibold text-white">
                  {formatCurrency(acc.startingBalance)}
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                  <span>Balance: {formatCurrency(acc.currentBalance)}</span>
                  <ArrowRight className="h-4 w-4 text-neutral-600 transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-brand)]" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
