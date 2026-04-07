"use client";

import { useEffect, useState } from "react";
import { LifeBuoy, Plus, Send, MessageSquare } from "lucide-react";
import { Button, Input } from "@myfundingtrade/ui";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingRows } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { getTickets, getTicketMessages, replyToTicket, createTicket } from "@/lib/api-client";
import type { SupportTicket, SupportMessage } from "@myfundingtrade/types";

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", category: "OTHER", body: "" });
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      const res = await getTickets();
      if (res.success && res.data) setTickets(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(ticketId: string) {
    setSelectedId(ticketId);
    setMsgLoading(true);
    try {
      const res = await getTicketMessages(ticketId);
      if (res.success && res.data) setMessages(res.data);
    } finally {
      setMsgLoading(false);
    }
  }

  async function handleReply() {
    if (!selectedId || !reply.trim()) return;
    await replyToTicket(selectedId, reply);
    setReply("");
    loadMessages(selectedId);
  }

  async function handleCreate() {
    if (!newTicket.subject || !newTicket.body) return;
    setCreating(true);
    try {
      await createTicket(newTicket);
      setShowNew(false);
      setNewTicket({ subject: "", category: "GENERAL", body: "" });
      load();
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support</h1>
          <p className="mt-1 text-sm text-neutral-400">Get help from our support team</p>
        </div>
        <Button onClick={() => setShowNew(!showNew)}>
          <Plus className="mr-2 h-4 w-4" /> New Ticket
        </Button>
      </div>

      {/* New ticket form */}
      {showNew && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Create Ticket</h2>
          <Input
            label="Subject"
            value={newTicket.subject}
            onChange={(e) => setNewTicket((t) => ({ ...t, subject: e.target.value }))}
            placeholder="Brief description of your issue"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">Category</label>
                    <select
              value={newTicket.category}
              onChange={(e) => setNewTicket((t) => ({ ...t, category: e.target.value }))}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-neutral-300"
            >
              <option value="OTHER">General</option>
              <option value="ACCOUNT">Account</option>
              <option value="BILLING">Billing</option>
              <option value="TECHNICAL">Technical</option>
              <option value="KYC">KYC</option>
              <option value="PAYOUT">Payout</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-300">Message</label>
            <textarea
              value={newTicket.body}
              onChange={(e) => setNewTicket((t) => ({ ...t, body: e.target.value }))}
              rows={4}
              placeholder="Describe your issue in detail..."
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-neutral-300 placeholder:text-neutral-600"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={creating}>Submit Ticket</Button>
          </div>
        </div>
      )}

      {loading && <LoadingRows rows={3} />}
      {error && <ErrorState onRetry={load} />}

      {!loading && !error && tickets.length === 0 && (
        <EmptyState
          icon={<LifeBuoy className="h-10 w-10" />}
          title="No tickets"
          description="You haven't created any support tickets yet."
        />
      )}

      {!loading && !error && tickets.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          {/* Ticket list */}
          <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => loadMessages(t.id)}
                className={`w-full px-5 py-4 text-left transition-colors hover:bg-[var(--color-bg-surface-hover)] ${
                  selectedId === t.id ? "bg-[var(--color-bg-surface-hover)]" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-neutral-500">{t.ticketNumber}</span>
                  <StatusBadge status={t.status} />
                </div>
                <p className="mt-1 text-sm font-medium text-neutral-200">{t.subject}</p>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {t.category} · {new Date(t.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
            {!selectedId && (
              <div className="flex h-64 items-center justify-center">
                <p className="text-sm text-neutral-500">Select a ticket to view messages</p>
              </div>
            )}
            {selectedId && msgLoading && (
              <div className="p-4"><LoadingRows rows={3} /></div>
            )}
            {selectedId && !msgLoading && (
              <div className="flex h-[400px] flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                        m.senderId === "usr_001"
                          ? "ml-auto bg-[var(--color-brand)]/10 text-neutral-200"
                          : "bg-[var(--color-bg)] text-neutral-300"
                      }`}
                    >
                      <p>{m.body}</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {new Date(m.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center">
                      <MessageSquare className="mr-2 h-5 w-5 text-neutral-600" />
                      <span className="text-sm text-neutral-500">No messages yet</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 border-t border-[var(--color-border)] p-4">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleReply()}
                    placeholder="Type a reply..."
                    className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-neutral-300 placeholder:text-neutral-600"
                  />
                  <Button size="sm" onClick={handleReply} disabled={!reply.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
