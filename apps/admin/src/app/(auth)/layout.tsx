export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-xl font-bold text-[var(--color-text-heading)]">
            <span className="text-[var(--color-brand)]">MFT</span> Admin
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

import type React from "react";
