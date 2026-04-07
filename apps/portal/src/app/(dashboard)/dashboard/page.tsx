"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Wallet,
  Target,
  Activity,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@myfundingtrade/utils";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingPage } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { getDashboardKpis, getAccounts, getNotifications, type DashboardKpis } from "@/lib/api-client";
import type { TraderAccount, Notification } from "@myfundingtrade/types";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [accounts, setAccounts] = useState<TraderAccount[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [k, a, n] = await Promise.all([getDashboardKpis(), getAccounts(), getNotifications()]);
      if (k.success && k.data) setKpis(k.data);
      if (a.success && a.data) setAccounts(a.data);
      if (n.success && n.data) setNotifications(n.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingPage />;
  if (error) return <ErrorState onRetry={load} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-400">Overview of your trading performance</p>
      </div>

      {/* KPI cards */}
      {kpis && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Total Balance"
            value={formatCurrency(kpis.totalBalance)}
            icon={<DollarSign className="h-5 w-5" />}
            trend={{ value: "+5.8%", positive: true }}
          />
          <StatCard
            label="Total P&L"
            value={formatCurrency(kpis.totalPnl)}
            icon={<TrendingUp className="h-5 w-5" />}
            trend={{ value: "+$2,100", positive: true }}
          />
          <StatCard
            label="Active Accounts"
            value={String(kpis.activeAccounts)}
            icon={<BarChart3 className="h-5 w-5" />}
          />
          <StatCard
            label="Total Payouts"
            value={formatCurrency(kpis.totalPayouts)}
            icon={<Wallet className="h-5 w-5" />}
          />
          <StatCard
            label="Win Rate"
            value={`${kpis.winRate}%`}
            icon={<Target className="h-5 w-5" />}
            trend={{ value: "+1.2%", positive: true }}
          />
          <StatCard
            label="Total Trades"
            value={String(kpis.totalTrades)}
            icon={<Activity className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Accounts overview */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your Accounts</h2>
          <Link
            href="/dashboard/accounts"
            className="flex items-center gap-1 text-sm text-[var(--color-brand)] hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {accounts.map((acc) => (
            <Link
              key={acc.id}
              href={`/dashboard/accounts/${acc.id}`}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 transition-colors hover:bg-[var(--color-bg-surface-hover)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-300">{acc.login ?? acc.accountNumber}</span>
                <StatusBadge status={acc.status} />
              </div>
              <p className="mt-3 text-xl font-semibold text-white">
                {formatCurrency(acc.currentBalance)}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Starting: {formatCurrency(acc.startingBalance)} · Server: {acc.server}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent notifications */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Notifications</h2>
          <Link
            href="/dashboard/notifications"
            className="flex items-center gap-1 text-sm text-[var(--color-brand)] hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          {notifications.slice(0, 4).map((n) => (
            <div key={n.id} className="flex items-start gap-3 px-5 py-4">
              <div
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  n.readAt ? "bg-neutral-600" : "bg-[var(--color-brand)]"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-200">{n.title}</p>
                <p className="mt-0.5 text-xs text-neutral-500">{n.body}</p>
              </div>
              <span className="shrink-0 text-xs text-neutral-600">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
