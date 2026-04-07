"use client";

import React from "react";
import { Bell, LogOut, User } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface HeaderProps {
  userName: string;
  role: string;
}

export function Header({ userName, role }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-surface)]/80 px-6 backdrop-blur-md">
      <div />
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-hover)]">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-danger)]" />
        </button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[var(--color-bg-surface-hover)]">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-brand-muted)] text-xs font-semibold text-[var(--color-brand)]">
              {userName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-[var(--color-text)]">{userName}</p>
              <p className="text-[10px] text-[var(--color-text-muted)]">{role.replace(/_/g, " ")}</p>
            </div>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              className="z-50 min-w-[160px] rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1 shadow-xl"
            >
              <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg-surface-hover)] hover:text-[var(--color-text)]">
                <User className="h-3.5 w-3.5" />
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
              <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-muted)]">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
