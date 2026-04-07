"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3 } from "lucide-react";
import { formatCurrency } from "@myfundingtrade/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingRows } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { getAccounts } from "@/lib/api-client";
import type { TraderAccount } from "@myfundingtrade/types";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<TraderAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await getAccounts();
      if (res.success && res.data) setAccounts(res.data);
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
        <h1 className="text-2xl font-bold text-white">Accounts</h1>
        <p className="mt-1 text-sm text-neutral-400">Monitor your trading accounts and progress</p>
      </div>

      {loading && <LoadingRows rows={4} />}
      {error && <ErrorState onRetry={load} />}
      {!loading && !error && accounts.length === 0 && (
        <EmptyState
          icon={<BarChart3 className="h-10 w-10" />}
          title="No accounts"
          description="Your trading accounts will appear here once a challenge is activated."
        />
      )}

      {!loading && !error && accounts.length > 0 && (
        <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          {accounts.map((acc) => (
            <Link
              key={acc.id}
              href={`/dashboard/accounts/${acc.id}`}
              className="group flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--color-bg-surface-hover)]"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-200">{acc.login ?? acc.accountNumber}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {acc.platform} · {acc.server}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-white">
                    {formatCurrency(acc.currentBalance)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    of {formatCurrency(acc.startingBalance)}
                  </p>
                </div>
                <StatusBadge status={acc.status} />
                <ArrowRight className="h-4 w-4 text-neutral-600 transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-brand)]" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
