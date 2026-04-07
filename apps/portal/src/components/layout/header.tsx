"use client";

import Link from "next/link";
import { Bell, Menu, LogOut, User, Settings } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Avatar from "@radix-ui/react-avatar";
import { useState } from "react";
import { MobileSidebar } from "./mobile-sidebar";

interface HeaderProps {
  userName: string;
  unreadCount: number;
}

export function Header({ userName, unreadCount }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4 lg:px-6">
        {/* Mobile menu */}
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-neutral-400 hover:bg-[var(--color-bg-surface)] hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden lg:block" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications bell */}
          <Link
            href="/dashboard/notifications"
            className="relative rounded-lg p-2 text-neutral-400 hover:bg-[var(--color-bg-surface)] hover:text-white"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-danger)] px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* User menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-[var(--color-bg-surface)]">
                <Avatar.Root className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-brand)]/15">
                  <Avatar.Fallback className="text-xs font-semibold text-[var(--color-brand)]">
                    {initials}
                  </Avatar.Fallback>
                </Avatar.Root>
                <span className="hidden text-sm font-medium text-neutral-300 md:block">
                  {userName}
                </span>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 min-w-[180px] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-1.5 shadow-xl"
              >
                <DropdownMenu.Item asChild>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-300 outline-none hover:bg-[var(--color-bg-surface)] hover:text-white"
                  >
                    <User className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-300 outline-none hover:bg-[var(--color-bg-surface)] hover:text-white"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
                <DropdownMenu.Item asChild>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-danger)] outline-none hover:bg-[var(--color-danger)]/10"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </header>

      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
