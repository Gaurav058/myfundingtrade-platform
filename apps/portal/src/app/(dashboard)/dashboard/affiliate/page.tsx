"use client";

import { useEffect, useState } from "react";
import { Users, Copy, Check, DollarSign, MousePointerClick, UserPlus, ArrowUpRight, Clock, CreditCard } from "lucide-react";
import { formatCurrency } from "@myfundingtrade/utils";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingPage } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { getAffiliateAccount, getAffiliateConversions, getAffiliateClicks, getAffiliatePayouts, requestAffiliatePayout } from "@/lib/api-client";
import type { AffiliateAccount, AffiliateConversion, AffiliateClick, CommissionPayout } from "@myfundingtrade/types";

export default function AffiliatePage() {
  const [affiliate, setAffiliate] = useState<AffiliateAccount | null>(null);
  const [conversions, setConversions] = useState<AffiliateConversion[]>([]);
  const [clicks, setClicks] = useState<AffiliateClick[]>([]);
  const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payoutRequesting, setPayoutRequesting] = useState(false);
  const [tab, setTab] = useState<"conversions" | "clicks" | "payouts">("conversions");

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const [aRes, cRes, clkRes, payRes] = await Promise.all([
        getAffiliateAccount(),
        getAffiliateConversions(),
        getAffiliateClicks(),
        getAffiliatePayouts(),
      ]);
      if (aRes.success && aRes.data) setAffiliate(aRes.data);
      if (cRes.success && cRes.data) setConversions(cRes.data);
      if (clkRes.success && clkRes.data) setClicks(clkRes.data);
      if (payRes.success && payRes.data) setPayouts(payRes.data);
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

  async function handleRequestPayout() {
    if (payoutRequesting) return;
    setPayoutRequesting(true);
    try {
      await requestAffiliatePayout({});
      await load();
    } finally {
      setPayoutRequesting(false);
    }
  }

  if (loading) return <LoadingPage />;
  if (error) return <ErrorState onRetry={load} />;
  if (!affiliate) return null;

  const conversionRate = clicks.length > 0 ? ((conversions.length / clicks.length) * 100).toFixed(1) : "0";

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
          Commission rate: <strong className="text-neutral-400">{affiliate.commissionRate}%</strong> ·
          Status: <strong className="text-neutral-400">{affiliate.status}</strong>
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Earned"
          value={formatCurrency(affiliate.totalEarnings)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Pending Balance"
          value={formatCurrency(affiliate.pendingBalance)}
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          label="Total Paid"
          value={formatCurrency(affiliate.totalPaid)}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard
          label="Total Clicks"
          value={String(clicks.length)}
          icon={<MousePointerClick className="h-5 w-5" />}
        />
        <StatCard
          label="Conversions"
          value={`${conversions.length} (${conversionRate}%)`}
          icon={<UserPlus className="h-5 w-5" />}
        />
      </div>

      {/* Payout Request */}
      {affiliate.pendingBalance > 0 && affiliate.status === "ACTIVE" && (
        <div className="flex items-center justify-between rounded-xl border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/5 p-5">
          <div>
            <p className="text-sm font-medium text-white">Ready to cash out?</p>
            <p className="mt-0.5 text-xs text-neutral-400">
              Available balance: <strong className="text-[var(--color-brand)]">{formatCurrency(affiliate.pendingBalance)}</strong>
            </p>
          </div>
          <button
            onClick={handleRequestPayout}
            disabled={payoutRequesting}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-hover)] disabled:opacity-50"
          >
            <ArrowUpRight className="h-4 w-4" />
            {payoutRequesting ? "Requesting..." : "Request Payout"}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--color-border)]">
        <button onClick={() => setTab("conversions")} className={`pb-2 text-sm font-medium ${tab === "conversions" ? "border-b-2 border-[var(--color-brand)] text-[var(--color-brand)]" : "text-neutral-400 hover:text-white"}`}>
          Conversions ({conversions.length})
        </button>
        <button onClick={() => setTab("clicks")} className={`pb-2 text-sm font-medium ${tab === "clicks" ? "border-b-2 border-[var(--color-brand)] text-[var(--color-brand)]" : "text-neutral-400 hover:text-white"}`}>
          Click History ({clicks.length})
        </button>
        <button onClick={() => setTab("payouts")} className={`pb-2 text-sm font-medium ${tab === "payouts" ? "border-b-2 border-[var(--color-brand)] text-[var(--color-brand)]" : "text-neutral-400 hover:text-white"}`}>
          Payout History ({payouts.length})
        </button>
      </div>

      {/* Conversions Tab */}
      {tab === "conversions" && (
        <section>
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
                      Order: {formatCurrency(c.orderAmount)} · {c.commissionRate}% rate ·{" "}
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Click History Tab */}
      {tab === "clicks" && (
        <section>
          {clicks.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 text-center">
              <MousePointerClick className="mx-auto mb-3 h-8 w-8 text-neutral-500" />
              <p className="text-sm text-neutral-400">No clicks recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              {clicks.map((c) => (
                <div key={c.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-200">
                      {c.utmSource ? `${c.utmSource} / ${c.utmMedium || "unknown"}` : "Direct"}
                      {c.utmCampaign ? ` · ${c.utmCampaign}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {c.referrerUrl ? new URL(c.referrerUrl).hostname : "No referrer"} ·{" "}
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-500">{c.ipAddress}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Payout History Tab */}
      {tab === "payouts" && (
        <section>
          {payouts.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 text-center">
              <CreditCard className="mx-auto mb-3 h-8 w-8 text-neutral-500" />
              <p className="text-sm text-neutral-400">No payouts yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
              {payouts.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-200">
                      {formatCurrency(p.amount)}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {p.payoutMethod?.replace("_", " ") ?? "—"} ·{" "}
                      {p.transactionRef ?? "No ref"} ·{" "}
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
