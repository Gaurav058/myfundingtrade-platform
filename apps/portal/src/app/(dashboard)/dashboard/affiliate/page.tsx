"use client";

import { useEffect, useState } from "react";
import { Users, Copy, Check, DollarSign, MousePointerClick, UserPlus } from "lucide-react";
import { formatCurrency } from "@myfundingtrade/utils";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingPage } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { getAffiliateAccount, getAffiliateConversions } from "@/lib/api-client";
import type { AffiliateAccount, AffiliateConversion } from "@myfundingtrade/types";

export default function AffiliatePage() {
  const [affiliate, setAffiliate] = useState<AffiliateAccount | null>(null);
  const [conversions, setConversions] = useState<AffiliateConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [aRes, cRes] = await Promise.all([getAffiliateAccount(), getAffiliateConversions()]);
      if (aRes.success && aRes.data) setAffiliate(aRes.data);
      if (cRes.success && cRes.data) setConversions(cRes.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function copyLink() {
    if (!affiliate) return;
    navigator.clipboard.writeText(`https://myfundingtrade.com/?ref=${affiliate.affiliateCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <LoadingPage />;
  if (error) return <ErrorState onRetry={load} />;
  if (!affiliate) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Affiliate Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-400">Earn commissions by referring traders</p>
      </div>

      {/* Referral link */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <p className="mb-2 text-sm font-medium text-neutral-300">Your Referral Link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-lg bg-[var(--color-bg)] px-3 py-2 font-mono text-sm text-neutral-300">
            {`https://myfundingtrade.com/?ref=${affiliate.affiliateCode}`}
          </code>
          <button
            onClick={copyLink}
            className="rounded-lg border border-[var(--color-border)] p-2 text-neutral-400 hover:bg-[var(--color-bg-surface-hover)] hover:text-white"
          >
            {copied ? <Check className="h-4 w-4 text-[var(--color-brand)]" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Referral code: <strong className="text-neutral-400">{affiliate.affiliateCode}</strong> ·
          Commission rate: <strong className="text-neutral-400">{affiliate.commissionRate}%</strong>
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Earned"
          value={formatCurrency(affiliate.totalEarnings)}
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: "+$240", positive: true }}
        />
        <StatCard
          label="Pending"
          value={formatCurrency(affiliate.pendingBalance)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Total Clicks"
          value={String(conversions.length)}
          icon={<MousePointerClick className="h-5 w-5" />}
        />
        <StatCard
          label="Conversions"
          value={String(conversions.length)}
          icon={<UserPlus className="h-5 w-5" />}
        />
      </div>

      {/* Conversions table */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Recent Conversions</h2>
        {conversions.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 text-center">
            <Users className="mx-auto mb-3 h-8 w-8 text-neutral-500" />
            <p className="text-sm text-neutral-400">No conversions yet. Share your link to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            {conversions.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-neutral-200">
                    {formatCurrency(c.commissionAmount)}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Order: {formatCurrency(c.orderAmount)} ·{" "}
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
