"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Server, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@myfundingtrade/utils";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingPage } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { getAccount, getAccountPhases } from "@/lib/api-client";
import type { TraderAccount, TraderAccountPhase } from "@myfundingtrade/types";

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<TraderAccount | null>(null);
  const [phases, setPhases] = useState<TraderAccountPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [accRes, phRes] = await Promise.all([getAccount(id), getAccountPhases(id)]);
      if (accRes.success && accRes.data) setAccount(accRes.data);
      if (phRes.success && phRes.data) setPhases(phRes.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  if (loading) return <LoadingPage />;
  if (error || !account) return <ErrorState onRetry={load} />;

  const pnl = account.currentBalance - account.startingBalance;
  const pnlPct = ((pnl / account.startingBalance) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/accounts"
          className="rounded-lg p-2 text-neutral-400 hover:bg-[var(--color-bg-surface)] hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{account.login ?? account.accountNumber}</h1>
            <StatusBadge status={account.status} />
          </div>
          <p className="mt-0.5 text-sm text-neutral-400">
            {account.platform} · {account.server}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Balance"
          value={formatCurrency(account.currentBalance)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="P&L"
          value={`${pnl >= 0 ? "+" : ""}${formatCurrency(pnl)}`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: `${pnlPct}%`, positive: pnl >= 0 }}
        />
        <StatCard
          label="Starting Balance"
          value={formatCurrency(account.startingBalance)}
          icon={<Server className="h-5 w-5" />}
        />
        <StatCard
          label="Created"
          value={new Date(account.createdAt).toLocaleDateString()}
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>

      {/* Phases */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Evaluation Phases</h2>
        <div className="space-y-4">
          {phases.map((phase) => (
            <div
              key={phase.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-200">
                    {phase.phase.replace(/_/g, " ")}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {phase.startDate
                      ? `Started ${new Date(phase.startDate).toLocaleDateString()}`
                      : "Not started"}
                    {phase.endDate &&
                      ` · Ended ${new Date(phase.endDate).toLocaleDateString()}`}
                  </p>
                </div>
                <StatusBadge status={phase.status} />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-neutral-500">P&L</p>
                  <p className={`text-lg font-semibold ${phase.profitLoss >= 0 ? "text-[var(--color-brand)]" : "text-[var(--color-danger)]"}`}>
                    {phase.profitLoss >= 0 ? "+" : ""}{formatCurrency(phase.profitLoss)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Win Rate</p>
                  <p className="text-lg font-semibold text-white">
                    {phase.totalTrades > 0 ? ((phase.winningTrades / phase.totalTrades) * 100).toFixed(1) : "0"}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">High Water Mark</p>
                  <p className="text-lg font-semibold text-white">{formatCurrency(phase.highWaterMark)}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                <span>Trading days: {phase.tradingDays}</span>
                <span>Trades: {phase.totalTrades} ({phase.winningTrades}W / {phase.losingTrades}L)</span>
                {phase.maxDailyDrawdown != null && <span>Max daily DD: {phase.maxDailyDrawdown}%</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
