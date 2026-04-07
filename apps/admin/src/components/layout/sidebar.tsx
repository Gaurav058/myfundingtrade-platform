"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Trophy, Scale, ShoppingCart, CreditCard, Percent,
  Briefcase, Shield, DollarSign, UsersRound, Ticket, FileText, HelpCircle,
  Gavel, Globe, Settings, ScrollText, Bell, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { UserRole } from "@myfundingtrade/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
  group: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "KYC_REVIEWER", "SUPPORT_AGENT", "CONTENT_ADMIN"], group: "Overview" },
  // Operations
  { href: "/users", label: "Users", icon: <Users className="h-4 w-4" />, roles: ["SUPER_ADMIN"], group: "Operations" },
  { href: "/plans", label: "Challenge Plans", icon: <Trophy className="h-4 w-4" />, roles: ["SUPER_ADMIN"], group: "Operations" },
  { href: "/rules", label: "Challenge Rules", icon: <Scale className="h-4 w-4" />, roles: ["SUPER_ADMIN"], group: "Operations" },
  { href: "/accounts", label: "Trader Accounts", icon: <Briefcase className="h-4 w-4" />, roles: ["SUPER_ADMIN", "FINANCE_ADMIN"], group: "Operations" },
  // Commerce
  { href: "/orders", label: "Orders", icon: <ShoppingCart className="h-4 w-4" />, roles: ["SUPER_ADMIN", "FINANCE_ADMIN"], group: "Commerce" },
  { href: "/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" />, roles: ["SUPER_ADMIN", "FINANCE_ADMIN"], group: "Commerce" },
  { href: "/coupons", label: "Coupons", icon: <Percent className="h-4 w-4" />, roles: ["SUPER_ADMIN", "FINANCE_ADMIN"], group: "Commerce" },
  // Compliance
  { href: "/kyc", label: "KYC Reviews", icon: <Shield className="h-4 w-4" />, roles: ["SUPER_ADMIN", "KYC_REVIEWER"], group: "Compliance" },
  { href: "/payouts", label: "Payout Approvals", icon: <DollarSign className="h-4 w-4" />, roles: ["SUPER_ADMIN", "FINANCE_ADMIN"], group: "Compliance" },
  { href: "/restrictions", label: "Restrictions", icon: <Globe className="h-4 w-4" />, roles: ["SUPER_ADMIN"], group: "Compliance" },
  // Engagement
  { href: "/affiliates", label: "Affiliates", icon: <UsersRound className="h-4 w-4" />, roles: ["SUPER_ADMIN", "FINANCE_ADMIN"], group: "Engagement" },
  { href: "/tickets", label: "Support Tickets", icon: <Ticket className="h-4 w-4" />, roles: ["SUPER_ADMIN", "SUPPORT_AGENT"], group: "Engagement" },
  { href: "/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" />, roles: ["SUPER_ADMIN"], group: "Engagement" },
  // Content
  { href: "/content/blog", label: "Blog CMS", icon: <FileText className="h-4 w-4" />, roles: ["SUPER_ADMIN", "CONTENT_ADMIN"], group: "Content" },
  { href: "/content/faq", label: "FAQ CMS", icon: <HelpCircle className="h-4 w-4" />, roles: ["SUPER_ADMIN", "CONTENT_ADMIN"], group: "Content" },
  { href: "/content/legal", label: "Legal Docs", icon: <Gavel className="h-4 w-4" />, roles: ["SUPER_ADMIN", "CONTENT_ADMIN"], group: "Content" },
  // System
  { href: "/settings", label: "Settings", icon: <Settings className="h-4 w-4" />, roles: ["SUPER_ADMIN"], group: "System" },
  { href: "/audit-logs", label: "Audit Logs", icon: <ScrollText className="h-4 w-4" />, roles: ["SUPER_ADMIN"], group: "System" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  role?: UserRole;
}

export function Sidebar({ collapsed, onToggle, role = "SUPER_ADMIN" }: SidebarProps) {
  const pathname = usePathname();
  const filteredItems = navItems.filter((item) => item.roles.includes(role));
  const groups = [...new Set(filteredItems.map((i) => i.group))];

  return (
    <aside
      className={`sticky top-0 flex h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] transition-all duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--color-border)] px-4">
        {!collapsed && (
          <span className="text-sm font-bold text-[var(--color-text-heading)]">
            <span className="text-[var(--color-brand)]">MFT</span> Admin
          </span>
        )}
        <button onClick={onToggle} className="rounded-lg p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-hover)]">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {groups.map((group) => (
          <div key={group} className="mb-3">
            {!collapsed && (
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)]">
                {group}
              </p>
            )}
            {filteredItems
              .filter((i) => i.group === group)
              .map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-[var(--color-brand-muted)] font-medium text-[var(--color-brand)]"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-hover)] hover:text-[var(--color-text)]"
                    }`}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
