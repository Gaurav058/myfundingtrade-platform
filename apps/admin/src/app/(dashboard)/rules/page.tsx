"use client";

import React, { useEffect, useState } from "react";
import { getRuleSets } from "@/lib/api-client";
import type { ChallengeRuleSet } from "@myfundingtrade/types";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, ErrorState } from "@/components/ui/shared";
import { Plus, Check, X } from "lucide-react";

export default function RulesPage() {
  const [rules, setRules] = useState<ChallengeRuleSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getRuleSets().then((res) => {
      if (res.success && res.data) setRules(res.data);
      else setError(true);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={load} />;

  const Bool = ({ val }: { val: boolean }) => val
    ? <Check className="h-4 w-4 text-[var(--color-brand)]" />
    : <X className="h-4 w-4 text-[var(--color-danger)]" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Challenge Rule Sets"
        description={`${rules.length} rule sets configured`}
        actions={
          <button className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-hover)]">
            <Plus className="h-4 w-4" /> New Rule Set
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {rules.map((rs) => (
          <div key={rs.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-heading)]">{rs.name}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-[var(--color-text-muted)]">Profit Target</p><p className="font-medium text-[var(--color-text)]">{rs.profitTargetPct}%</p></div>
              <div><p className="text-xs text-[var(--color-text-muted)]">Max Daily Loss</p><p className="font-medium text-[var(--color-text)]">{rs.maxDailyLossPct}%</p></div>
              <div><p className="text-xs text-[var(--color-text-muted)]">Max Total Loss</p><p className="font-medium text-[var(--color-text)]">{rs.maxTotalLossPct}%</p></div>
              <div><p className="text-xs text-[var(--color-text-muted)]">Min Trading Days</p><p className="font-medium text-[var(--color-text)]">{rs.minTradingDays}</p></div>
              <div><p className="text-xs text-[var(--color-text-muted)]">Max Calendar Days</p><p className="font-medium text-[var(--color-text)]">{rs.maxCalendarDays ?? "Unlimited"}</p></div>
              <div><p className="text-xs text-[var(--color-text-muted)]">Max Inactivity Days</p><p className="font-medium text-[var(--color-text)]">{rs.maxInactivityDays}</p></div>
            </div>
            <div className="mt-4 border-t border-[var(--color-border)] pt-4">
              <p className="mb-2 text-xs text-[var(--color-text-muted)]">Trading Permissions</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1.5"><Bool val={rs.allowWeekendHolding} /> Weekend</div>
                <div className="flex items-center gap-1.5"><Bool val={rs.allowNewsTrading} /> News</div>
                <div className="flex items-center gap-1.5"><Bool val={rs.allowExpertAdvisors} /> EAs</div>
                <div className="flex items-center gap-1.5"><Bool val={rs.allowHedging} /> Hedging</div>
                <div className="flex items-center gap-1.5"><Bool val={rs.allowCopying} /> Copy</div>
                <div className="flex items-center gap-1.5 text-[var(--color-text-muted)]">Lots: {rs.maxLotSize ?? "∞"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
