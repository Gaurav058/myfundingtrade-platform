"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@myfundingtrade/ui";
import { forgotPassword } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setSent(true);
      } else {
        setError(res.error ?? "Failed to send reset link");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand)]/15">
          <span className="text-xl">✉️</span>
        </div>
        <h1 className="text-xl font-semibold text-white">Check your email</h1>
        <p className="mt-2 text-sm text-neutral-400">
          We sent a password reset link to <strong className="text-neutral-200">{email}</strong>
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm text-[var(--color-brand)] hover:underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8">
      <h1 className="text-xl font-semibold text-white">Reset password</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Enter your email and we&apos;ll send you a reset link
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {error && (
          <p className="rounded-lg bg-[var(--color-danger)]/10 px-3 py-2 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={loading}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-400">
        Remember your password?{" "}
        <Link href="/login" className="text-[var(--color-brand)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
