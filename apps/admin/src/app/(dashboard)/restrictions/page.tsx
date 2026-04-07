"use client";

import React, { useEffect, useState } from "react";
import { getGeoRestrictions, getPlatformRestrictions } from "@/lib/api-client";
import type { GeoRestriction, PlatformRestriction } from "@myfundingtrade/types";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, ErrorState } from "@/components/ui/shared";
import { Globe, Shield, ShieldBan, ToggleLeft, ToggleRight, Plus } from "lucide-react";

export default function RestrictionsPage() {
  const [geoRules, setGeoRules] = useState<GeoRestriction[]>([]);
  const [platRules, setPlatRules] = useState<PlatformRestriction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([getGeoRestrictions(), getPlatformRestrictions()]).then(([gRes, pRes]) => {
      if (gRes.success && gRes.data) setGeoRules(gRes.data as GeoRestriction[]);
      if (pRes.success && pRes.data) setPlatRules(pRes.data as PlatformRestriction[]);
      if (!gRes.success && !pRes.success) setError(true);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={load} />;

  const blocked = geoRules.filter((g) => g.type === "BLOCKED");
  const allowed = geoRules.filter((g) => g.type === "ALLOWED");

  return (
    <div className="space-y-8">
      <PageHeader title="Restrictions" description="Geo-blocking and platform feature toggles" />

      {/* Geo Restrictions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Globe className="h-4 w-4 text-[var(--color-brand)]" /> Geo Restrictions
          </h2>
          <button className="flex items-center gap-1.5 rounded bg-[var(--color-brand)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> Add Rule
          </button>
        </div>

        {blocked.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[var(--color-danger)]">
              <ShieldBan className="h-3.5 w-3.5" /> Blocked Countries ({blocked.length})
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {blocked.map((g) => (
                <div key={g.id} className="flex items-center justify-between rounded-lg border border-[var(--color-danger-muted)] bg-[var(--color-bg-surface)] p-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-[var(--color-danger-muted)] px-1.5 py-0.5 font-mono text-xs font-semibold text-[var(--color-danger)]">{g.countryCode}</span>
                    <span className="text-sm">{g.countryName}</span>
                  </div>
                  <span className="text-xs text-[var(--color-text-muted)]">{g.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {allowed.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[var(--color-brand)]">
              <Shield className="h-3.5 w-3.5" /> Allowed Countries ({allowed.length})
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {allowed.map((g) => (
                <div key={g.id} className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-3">
                  <span className="rounded bg-[var(--color-brand-muted)] px-1.5 py-0.5 font-mono text-xs font-semibold text-[var(--color-brand)]">{g.countryCode}</span>
                  <span className="text-sm">{g.countryName}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Platform Restrictions */}
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Shield className="h-4 w-4 text-[var(--color-brand)]" /> Platform Feature Toggles
        </h2>
        <div className="space-y-2">
          {platRules.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
              <div>
                <p className="text-sm font-medium">{p.description}</p>
                <p className="mt-0.5 font-mono text-xs text-[var(--color-text-muted)]">{p.key}</p>
              </div>
              <button
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  p.isEnabled
                    ? "bg-[var(--color-brand-muted)] text-[var(--color-brand)]"
                    : "bg-[var(--color-bg)] text-[var(--color-text-muted)]"
                }`}
              >
                {p.isEnabled ? (
                  <><ToggleRight className="h-4 w-4" /> Enabled</>
                ) : (
                  <><ToggleLeft className="h-4 w-4" /> Disabled</>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
