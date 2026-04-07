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
  X,
} from "lucide-react";
import { cn } from "@myfundingtrade/ui";
import * as Dialog from "@radix-ui/react-dialog";

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

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand)] text-sm font-bold text-black">
                MF
              </div>
              <span className="text-sm font-semibold text-white">MyFundingTrade</span>
            </div>
            <Dialog.Close className="rounded-lg p-2 text-neutral-400 hover:text-white">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
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
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                          : "text-neutral-400 hover:bg-[var(--color-bg-surface)] hover:text-white",
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
