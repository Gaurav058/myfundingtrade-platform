"use client";

import { type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardShellProps {
  children: ReactNode;
  userName: string;
  unreadCount: number;
}

export function DashboardShell({ children, userName, unreadCount }: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header userName={userName} unreadCount={unreadCount} />
        <main className="flex-1 overflow-y-auto">
          <div className="portal-container py-6 px-4 lg:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
