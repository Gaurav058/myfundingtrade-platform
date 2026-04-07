"use client";

import React, { useEffect, useState } from "react";
import { getTickets, getTicket, replyToTicket, updateTicketStatus } from "@/lib/api-client";
import type { SupportTicket, SupportMessage, PaginatedResponse } from "@myfundingtrade/types";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/ui/page-header";
import { FilterBar } from "@/components/ui/filter-bar";
import { LoadingState, ErrorState, Pagination } from "@/components/ui/shared";
import { Send, Lock, ArrowUpCircle, CheckCircle } from "lucide-react";

export default function TicketsPage() {
  const [data, setData] = useState<PaginatedResponse<SupportTicket> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getTickets(page).then((res) => {
      if (res.success && res.data) setData(res.data);
      else setError(true);
      setLoading(false);
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [page]);

  useEffect(() => {
    if (!selected) return;
    getTicket(selected.id).then((res) => {
      if (res.success && res.data) {
        const d = res.data as { ticket: SupportTicket; messages: SupportMessage[] };
        setMessages(d.messages);
      }
    });
  }, [selected]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={load} />;

  const priorityColor: Record<string, string> = {
    LOW: "text-[var(--color-text-muted)]",
    MEDIUM: "text-[var(--color-info)]",
    HIGH: "text-[var(--color-warning)]",
    URGENT: "text-[var(--color-danger)]",
  };

  const columns = [
    { key: "ticketNumber", header: "#", render: (r: SupportTicket) => (
      <span className="font-mono text-xs font-medium text-[var(--color-text)]">{r.ticketNumber}</span>
    )},
    { key: "subject", header: "Subject", render: (r: SupportTicket) => (
      <span className="max-w-[300px] truncate text-sm">{r.subject}</span>
    )},
    { key: "category", header: "Category", render: (r: SupportTicket) => (
      <span className="rounded bg-[var(--color-bg)] px-2 py-0.5 text-xs">{r.category}</span>
    )},
    { key: "priority", header: "Priority", render: (r: SupportTicket) => (
      <span className={`text-xs font-semibold ${priorityColor[r.priority] ?? ""}`}>{r.priority}</span>
    )},
    { key: "status", header: "Status", render: (r: SupportTicket) => <StatusBadge status={r.status} /> },
    { key: "assigneeId", header: "Assignee", render: (r: SupportTicket) => (
      <span className="font-mono text-xs text-[var(--color-text-muted)]">{r.assigneeId ?? "Unassigned"}</span>
    )},
    { key: "createdAt", header: "Created", render: (r: SupportTicket) => new Date(r.createdAt).toLocaleDateString() },
  ];

  const handleSend = async () => {
    if (!selected || !reply.trim()) return;
    await replyToTicket(selected.id, reply, isInternal);
    setMessages((prev) => [...prev, {
      id: `msg_local_${Date.now()}`,
      ticketId: selected.id,
      senderId: "usr_005",
      body: reply,
      isInternal,
      attachments: null,
      createdAt: new Date().toISOString(),
    }]);
    setReply("");
  };

  const handleStatusChange = async (status: string) => {
    if (!selected) return;
    await updateTicketStatus(selected.id, status);
    setSelected({ ...selected, status: status as SupportTicket["status"] });
    load();
  };

  const openCount = data.items.filter((t) => ["OPEN", "IN_PROGRESS", "ESCALATED"].includes(t.status)).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Support Tickets" description={`${openCount} open tickets`} />

      <FilterBar
        searchPlaceholder="Search tickets..."
        onSearch={() => {}}
        filters={[
          { key: "status", label: "Status", options: [
            { value: "OPEN", label: "Open" }, { value: "IN_PROGRESS", label: "In Progress" },
            { value: "ESCALATED", label: "Escalated" }, { value: "RESOLVED", label: "Resolved" },
            { value: "CLOSED", label: "Closed" },
          ]},
          { key: "priority", label: "Priority", options: [
            { value: "LOW", label: "Low" }, { value: "MEDIUM", label: "Medium" },
            { value: "HIGH", label: "High" }, { value: "URGENT", label: "Urgent" },
          ]},
          { key: "category", label: "Category", options: [
            { value: "ACCOUNT", label: "Account" }, { value: "BILLING", label: "Billing" },
            { value: "TRADING", label: "Trading" }, { value: "KYC", label: "KYC" },
            { value: "PAYOUT", label: "Payout" }, { value: "TECHNICAL", label: "Technical" },
          ]},
        ]}
        onFilterChange={() => {}}
      />

      <DataTable
        columns={columns}
        data={data.items}
        keyField="id"
        onRowClick={(row) => { setSelected(row as unknown as SupportTicket); setMessages([]); }}
      />
      <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />

      {/* Ticket Detail / Thread */}
      {selected && (
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{selected.ticketNumber}: {selected.subject}</h3>
              <div className="mt-1 flex gap-2">
                <StatusBadge status={selected.status} />
                <span className={`text-xs font-semibold ${priorityColor[selected.priority]}`}>{selected.priority}</span>
                <span className="rounded bg-[var(--color-bg)] px-2 py-0.5 text-xs">{selected.category}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {selected.status !== "RESOLVED" && selected.status !== "CLOSED" && (
                <>
                  <button onClick={() => handleStatusChange("ESCALATED")} className="flex items-center gap-1 rounded border border-[var(--color-border)] px-3 py-1.5 text-xs hover:bg-[var(--color-bg)]" title="Escalate">
                    <ArrowUpCircle className="h-3.5 w-3.5" /> Escalate
                  </button>
                  <button onClick={() => handleStatusChange("RESOLVED")} className="flex items-center gap-1 rounded bg-[var(--color-brand)] px-3 py-1.5 text-xs text-white hover:opacity-90" title="Resolve">
                    <CheckCircle className="h-3.5 w-3.5" /> Resolve
                  </button>
                </>
              )}
              <button onClick={() => setSelected(null)} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">Close</button>
            </div>
          </div>

          {/* Message Thread */}
          <div className="mb-4 max-h-[400px] space-y-3 overflow-y-auto rounded border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
            {messages.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">Loading messages...</p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-lg p-3 ${
                  msg.isInternal
                    ? "border border-dashed border-[var(--color-warning)] bg-[var(--color-warning-muted)]"
                    : msg.senderId === "usr_005"
                    ? "ml-8 bg-[var(--color-brand-muted)]"
                    : "mr-8 bg-[var(--color-bg-surface)]"
                }`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">{msg.senderId}</span>
                  {msg.isInternal && (
                    <span className="flex items-center gap-0.5 text-xs text-[var(--color-warning)]">
                      <Lock className="h-3 w-3" /> Internal
                    </span>
                  )}
                  <span className="ml-auto text-xs text-[var(--color-text-muted)]">{new Date(msg.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-sm">{msg.body}</p>
              </div>
            ))}
          </div>

          {/* Reply Box */}
          {selected.status !== "CLOSED" && (
            <div className="flex gap-2">
              <div className="flex flex-1 flex-col gap-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  rows={2}
                  className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
                />
                <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-[var(--color-border)]"
                  />
                  Internal note (not visible to customer)
                </label>
              </div>
              <button
                onClick={handleSend}
                disabled={!reply.trim()}
                className="flex h-10 items-center gap-1 self-start rounded bg-[var(--color-brand)] px-4 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" /> Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
