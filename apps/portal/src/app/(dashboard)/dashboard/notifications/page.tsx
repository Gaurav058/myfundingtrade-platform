"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@myfundingtrade/ui";
import { LoadingRows } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { getNotifications, markNotificationRead } from "@/lib/api-client";
import type { Notification } from "@myfundingtrade/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await getNotifications();
      if (res.success && res.data) setNotifications(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.readAt);
    await Promise.all(unread.map((n) => markNotificationRead(n.id)));
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
    );
  }

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingRows rows={5} />;
  if (error) return <ErrorState onRetry={load} />;

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="mt-1 text-sm text-neutral-400">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-10 w-10" />}
          title="No notifications"
          description="You're all caught up. New notifications will appear here."
        />
      ) : (
        <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.readAt && markRead(n.id)}
              className={`w-full px-5 py-4 text-left transition-colors hover:bg-[var(--color-bg-surface-hover)] ${
                !n.readAt ? "bg-[var(--color-brand)]/[0.03]" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    n.readAt ? "bg-neutral-700" : "bg-[var(--color-brand)]"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-200">{n.title}</p>
                  <p className="mt-0.5 text-sm text-neutral-400">{n.body}</p>
                  <p className="mt-1 text-xs text-neutral-600">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-500">
                  {n.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
