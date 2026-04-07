"use client";

import React, { useEffect, useState } from "react";
import { getSettings, updateSetting } from "@/lib/api-client";
import type { SystemSetting } from "@myfundingtrade/types";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, ErrorState } from "@/components/ui/shared";
import { Save, Lock, Globe } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(false);
    getSettings().then((res) => {
      if (res.success && res.data) setSettings(res.data as SystemSetting[]);
      else setError(true);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={load} />;

  const handleChange = (id: string, value: string) => {
    setDirty((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (setting: SystemSetting) => {
    const newValue = dirty[setting.id];
    if (newValue === undefined) return;
    setSaving(setting.id);
    await updateSetting(setting.id, newValue);
    setSettings((prev) =>
      prev.map((s) => (s.id === setting.id ? { ...s, value: newValue, updatedAt: new Date().toISOString() } : s))
    );
    setDirty((prev) => {
      const next = { ...prev };
      delete next[setting.id];
      return next;
    });
    setSaving(null);
  };

  const publicSettings = settings.filter((s) => s.isPublic);
  const privateSettings = settings.filter((s) => !s.isPublic);

  const renderSettingRow = (s: SystemSetting) => {
    const currentValue = dirty[s.id] ?? s.value;
    const isDirty = dirty[s.id] !== undefined && dirty[s.id] !== s.value;

    return (
      <div key={s.id} className="flex items-center gap-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{s.description}</p>
            {!s.isPublic && <Lock className="h-3 w-3 text-[var(--color-text-muted)]" />}
          </div>
          <p className="mt-0.5 font-mono text-xs text-[var(--color-text-muted)]">{s.key}</p>
          <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">Type: {s.dataType} · Updated: {new Date(s.updatedAt).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type={s.dataType === "number" ? "number" : "text"}
            value={currentValue}
            onChange={(e) => handleChange(s.id, e.target.value)}
            className="w-[200px] rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
          />
          <button
            onClick={() => handleSave(s)}
            disabled={!isDirty || saving === s.id}
            className={`flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
              isDirty
                ? "bg-[var(--color-brand)] text-white hover:opacity-90"
                : "bg-[var(--color-bg)] text-[var(--color-text-muted)]"
            } disabled:opacity-50`}
          >
            <Save className="h-3.5 w-3.5" />
            {saving === s.id ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader title="System Settings" description={`${settings.length} configuration values`} />

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)]">
          <Globe className="h-3.5 w-3.5" /> Public Settings
        </h2>
        {publicSettings.map(renderSettingRow)}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-muted)]">
          <Lock className="h-3.5 w-3.5" /> Internal Settings
        </h2>
        {privateSettings.map(renderSettingRow)}
      </section>
    </div>
  );
}
