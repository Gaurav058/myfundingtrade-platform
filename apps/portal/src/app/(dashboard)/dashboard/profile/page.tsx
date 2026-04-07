"use client";

import { useEffect, useState } from "react";
import { User, Save } from "lucide-react";
import { Button, Input } from "@myfundingtrade/ui";
import { LoadingRows } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { getMe, updateProfile } from "@/lib/api-client";
import type { UserWithProfile } from "@myfundingtrade/types";

export default function ProfilePage() {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    postalCode: "",
  });

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await getMe();
      if (res.success && res.data) {
        setUser(res.data);
        const p = res.data.profile;
        setForm({
          firstName: p?.firstName ?? "",
          lastName: p?.lastName ?? "",
          phone: p?.phone ?? "",
          country: p?.country ?? "",
          city: p?.city ?? "",
          address: p?.addressLine1 ?? "",
          postalCode: p?.postalCode ?? "",
        });
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await updateProfile({ ...form, addressLine1: form.address } as any);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingRows rows={6} />;
  if (error) return <ErrorState onRetry={load} />;

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile & Settings</h1>
        <p className="mt-1 text-sm text-neutral-400">Manage your account information</p>
      </div>

      {/* Account info */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand)]/15">
            <User className="h-6 w-6 text-[var(--color-brand)]" />
          </div>
          <div>
            <p className="text-lg font-semibold text-white">
              {user?.profile?.firstName} {user?.profile?.lastName}
            </p>
            <p className="text-sm text-neutral-400">{user?.email}</p>
            <p className="text-xs text-neutral-500">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSave} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Personal Information</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="First Name"
            value={form.firstName}
            onChange={(e) => update("firstName", e.target.value)}
          />
          <Input
            label="Last Name"
            value={form.lastName}
            onChange={(e) => update("lastName", e.target.value)}
          />
          <div className="relative">
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+44 7700 900000"
            />
          </div>
          <Input
            label="Country"
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
          />
          <Input
            label="City"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
          />
          <Input
            label="Postal Code"
            value={form.postalCode}
            onChange={(e) => update("postalCode", e.target.value)}
          />
        </div>

        <Input
          label="Address"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          className="mt-4"
        />

        <div className="mt-6 flex justify-end">
          <Button type="submit" isLoading={saving}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </form>

      {/* Account settings */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-200">Change Password</p>
              <p className="text-xs text-neutral-500">Update your login password</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
          <div className="border-t border-[var(--color-border)]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-200">Two-Factor Authentication</p>
              <p className="text-xs text-neutral-500">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <div className="border-t border-[var(--color-border)]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-danger)]">Delete Account</p>
              <p className="text-xs text-neutral-500">Permanently delete your account and data</p>
            </div>
            <Button variant="outline" size="sm" className="border-[var(--color-danger)]/30 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10">
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
