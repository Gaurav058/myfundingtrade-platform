import { type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand)] text-lg font-bold text-black">
            MF
          </div>
          <span className="text-xl font-bold tracking-tight text-white">MyFundingTrade</span>
        </div>
        {children}
      </div>
    </div>
  );
}
