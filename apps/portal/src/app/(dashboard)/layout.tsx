"use client";

import { type ReactNode } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell userName="Alex Morgan" unreadCount={2}>
      {children}
    </DashboardShell>
  );
}
