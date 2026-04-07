"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface AdminShellProps {
  children: React.ReactNode;
  userName?: string;
  role?: string;
}

export function AdminShell({ children, userName = "System Admin", role = "SUPER_ADMIN" }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} role={role as "SUPER_ADMIN"} />
      <div className="flex flex-1 flex-col">
        <Header userName={userName} role={role} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
