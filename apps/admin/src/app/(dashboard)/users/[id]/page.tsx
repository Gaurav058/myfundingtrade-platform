"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getUser } from "@/lib/api-client";
import type { UserWithProfile } from "@myfundingtrade/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState, ErrorState } from "@/components/ui/shared";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AuditTrail } from "@/components/ui/audit-trail";
import { mockAuditLogs, mockAccounts, mockOrders } from "@/lib/mock-data";
import { ArrowLeft, Ban, ShieldCheck } from "lucide-react";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getUser(id).then((res) => {
      if (res.success && res.data) setUser(res.data);
      else setError(true);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  if (loading) return <LoadingState />;
  if (error || !user) return <ErrorState onRetry={load} />;

  const userOrders = mockOrders.filter((o) => o.userId === user.id);
  const userAccounts = mockAccounts.filter((a) => a.userId === user.id);
  const userLogs = mockAuditLogs.filter((l) => l.targetUserId === user.id);

  const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div>
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="text-sm text-[var(--color-text)]">{value ?? "—"}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : user.email}
        description={user.email}
        actions={
          <div className="flex gap-2">
            <button onClick={() => router.back()} className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-hover)]">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            {user.status === "ACTIVE" ? (
              <button onClick={() => setSuspendOpen(true)} className="flex items-center gap-1 rounded-lg bg-[var(--color-danger-muted)] px-3 py-2 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]  hover:text-white">
                <Ban className="h-3.5 w-3.5" /> Suspend
              </button>
            ) : (
              <button className="flex items-center gap-1 rounded-lg bg-[var(--color-brand-muted)] px-3 py-2 text-xs font-medium text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white">
                <ShieldCheck className="h-3.5 w-3.5" /> Activate
              </button>
            )}
          </div>
        }
      />

      {/* User info */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-heading)]">Account Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="ID" value={<span className="font-mono text-xs">{user.id}</span>} />
            <Field label="Role" value={<StatusBadge status={user.role} />} />
            <Field label="Status" value={<StatusBadge status={user.status} />} />
            <Field label="Email Verified" value={user.emailVerified ? "Yes" : "No"} />
            <Field label="2FA" value={user.twoFactorEnabled ? "Enabled" : "Disabled"} />
            <Field label="Last Login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"} />
            <Field label="Last IP" value={user.lastLoginIp} />
            <Field label="Created" value={new Date(user.createdAt).toLocaleDateString()} />
          </div>
        </div>

        {user.profile && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
            <h3 className="mb-4 text-sm font-semibold text-[var(--color-text-heading)]">Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" value={`${user.profile.firstName} ${user.profile.lastName}`} />
              <Field label="Phone" value={user.profile.phone} />
              <Field label="Date of Birth" value={user.profile.dateOfBirth} />
              <Field label="Country" value={user.profile.country} />
              <Field label="City" value={user.profile.city} />
              <Field label="Address" value={user.profile.addressLine1} />
              <Field label="Timezone" value={user.profile.timezone} />
              <Field label="Referral Code" value={user.profile.referralCode} />
            </div>
          </div>
        )}
      </div>

      {/* Related data */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-heading)]">Orders ({userOrders.length})</h3>
          {userOrders.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No orders</p>
          ) : (
            <div className="space-y-2">
              {userOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg bg-[var(--color-bg)] px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{o.orderNumber}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">${o.totalAmount.toFixed(2)}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-heading)]">Accounts ({userAccounts.length})</h3>
          {userAccounts.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">No accounts</p>
          ) : (
            <div className="space-y-2">
              {userAccounts.map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg bg-[var(--color-bg)] px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{a.accountNumber}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">${a.currentBalance.toLocaleString()}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AuditTrail logs={userLogs} title="User Audit History" />

      <ConfirmModal
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        title="Suspend User"
        description={`Are you sure you want to suspend ${user.email}? They will lose access immediately.`}
        confirmLabel="Suspend User"
        confirmVariant="danger"
        onConfirm={() => {}}
        showNote
        noteLabel="Reason"
        notePlaceholder="Enter suspension reason..."
        noteRequired
      />
    </div>
  );
}
