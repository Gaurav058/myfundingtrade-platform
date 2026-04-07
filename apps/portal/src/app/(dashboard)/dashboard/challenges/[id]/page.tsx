"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trophy, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatCurrency } from "@myfundingtrade/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { LoadingPage } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { getAccount, getAccountPhases } from "@/lib/api-client";
import type { TraderAccount, TraderAccountPhase } from "@myfundingtrade/types";

export default function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [account, setAccount] = useState<TraderAccount | null>(null);
  const [phases, setPhases] = useState<TraderAccountPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [aRes, pRes] = await Promise.all([getAccount(id), getAccountPhases(id)]);
      if (aRes.success && aRes.data) setAccount(aRes.data);
      if (pRes.success && pRes.data) setPhases(pRes.data);
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

  const completedPhases = phases.filter((p) => p.status === "PASSED").length;
  const totalPhases = phases.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/challenges"
          className="rounded-lg p-2 text-neutral-400 hover:bg-[var(--color-bg-surface)] hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">Challenge {account.login ?? account.accountNumber}</h1>
            <StatusBadge status={account.status} />
          </div>
          <p className="mt-0.5 text-sm text-neutral-400">
            {formatCurrency(account.startingBalance)} · {account.platform} · {account.server}
          </p>
        </div>
      </div>

      {/* Challenge progress summary */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="h-5 w-5 text-[var(--color-brand)]" />
          <h2 className="text-lg font-semibold text-white">Challenge Progress</h2>
        </div>
        <ProgressBar
          label={`${completedPhases} of ${totalPhases} phases completed`}
          value={completedPhases}
          max={totalPhases}
          variant="brand"
        />
      </div>

      {/* Phase timeline */}
      <div className="space-y-4">
        {phases.map((phase) => {
          const icon =
            phase.status === "PASSED" ? (
              <CheckCircle className="h-5 w-5 text-[var(--color-brand)]" />
            ) : phase.status === "CANCELLED" || phase.status === "EXPIRED" ? (
              <XCircle className="h-5 w-5 text-[var(--color-danger)]" />
            ) : (
              <Clock className="h-5 w-5 text-[var(--color-warning)]" />
            );

          return (
            <div
              key={phase.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {icon}
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {phase.phase.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {phase.startDate
                        ? new Date(phase.startDate).toLocaleDateString()
                        : "Not started"}
                      {phase.endDate &&
                        ` — ${new Date(phase.endDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <StatusBadge status={phase.status} />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
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

              <div className="mt-3 flex gap-6 text-xs text-neutral-500">
                <span>Trading days: {phase.tradingDays}</span>
                <span>Trades: {phase.totalTrades} ({phase.winningTrades}W / {phase.losingTrades}L)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
