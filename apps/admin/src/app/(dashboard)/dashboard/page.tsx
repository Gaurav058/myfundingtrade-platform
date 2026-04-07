"use client";

import React, { useEffect, useState } from "react";
import { getDashboardKpis, type DashboardKpis } from "@/lib/api-client";
import { StatCard } from "@/components/ui/stat-card";
import { LoadingState, ErrorState } from "@/components/ui/shared";
import { PageHeader } from "@/components/ui/page-header";
import {
  Users, Briefcase, Shield, DollarSign, Ticket, TrendingUp, UsersRound, ShoppingCart,
} from "lucide-react";
import { mockAuditLogs } from "@/lib/mock-data";
import { AuditTrail } from "@/components/ui/audit-trail";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getDashboardKpis().then((res) => {
      if (res.success && res.data) setKpis(res.data);
      else setError(true);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingState />;
  if (error || !kpis) return <ErrorState onRetry={load} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Platform overview and key metrics" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={kpis.totalUsers.toLocaleString()} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Active Accounts" value={kpis.activeAccounts} icon={<Briefcase className="h-4 w-4" />} variant="success" />
        <StatCard label="Pending KYC" value={kpis.pendingKyc} icon={<Shield className="h-4 w-4" />} variant="warning" />
        <StatCard label="Pending Payouts" value={kpis.pendingPayouts} icon={<DollarSign className="h-4 w-4" />} variant="warning" />
        <StatCard label="Open Tickets" value={kpis.openTickets} icon={<Ticket className="h-4 w-4" />} variant={kpis.openTickets > 5 ? "danger" : "info"} />
        <StatCard
          label="Revenue (MTD)"
          value={`$${kpis.revenueThisMonth.toLocaleString()}`}
          icon={<TrendingUp className="h-4 w-4" />}
          variant="success"
          trend={{ value: 12.5, label: "vs last month" }}
        />
        <StatCard label="Active Affiliates" value={kpis.activeAffiliates} icon={<UsersRound className="h-4 w-4" />} />
        <StatCard label="Total Orders" value={kpis.totalOrders} icon={<ShoppingCart className="h-4 w-4" />} />
      </div>

      <AuditTrail logs={mockAuditLogs.slice(0, 5)} title="Recent Admin Activity" />
    </div>
  );
}
