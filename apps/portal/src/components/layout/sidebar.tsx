"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  BarChart3,
  ShieldCheck,
  Wallet,
  Users,
  LifeBuoy,
  Bell,
  User,
  FileText,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@myfundingtrade/ui";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/challenges", label: "Challenges", icon: Trophy },
  { href: "/dashboard/accounts", label: "Accounts", icon: BarChart3 },
  { href: "/dashboard/kyc", label: "KYC Verification", icon: ShieldCheck },
  { href: "/dashboard/payouts", label: "Payouts", icon: Wallet },
  { href: "/dashboard/affiliate", label: "Affiliate", icon: Users },
  { href: "/dashboard/support", label: "Support", icon: LifeBuoy },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/legal", label: "Legal", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)] transition-[width] duration-200 lg:flex",
        collapsed ? "w-[68px]" : "w-60",
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-[var(--color-border)] px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand)] text-sm font-bold text-black">
          MF
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-white">MyFundingTrade</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                      : "text-neutral-400 hover:bg-[var(--color-bg-surface)] hover:text-white",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-12 items-center justify-center border-t border-[var(--color-border)] text-neutral-500 hover:text-white"
      >
        <ChevronLeft
          className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
        />
      </button>
    </aside>
  );
}
