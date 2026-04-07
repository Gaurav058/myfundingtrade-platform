"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Loader2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@myfundingtrade/utils";
import { createOrder, initiateCheckout, recordBulkConsent, getChallengePlans, getPendingConsents } from "@/lib/api-client";
import { RegionNotice, PlatformNotice } from "@/components/region-notice";
import { LoadingRows } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";

interface Variant {
  id: string;
  planName: string;
  accountSize: number;
  price: number;
  currency: string;
  profitSplit: number;
  leverage: number;
  phases: number;
}

export default function BuyChallengesPage() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [consentDocIds, setConsentDocIds] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false);

  useEffect(() => {
    Promise.all([getChallengePlans(), getPendingConsents()])
      .then(([plansRes, consentsRes]) => {
        if (plansRes.success && plansRes.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped = (plansRes.data as any[]).flatMap((plan: any) =>
            (plan.variants ?? []).map((v: any) => ({
              id: v.id,
              planName: plan.name,
              accountSize: v.accountSize,
              price: Number(v.price),
              currency: v.currency ?? "USD",
              profitSplit: Number(v.profitSplit ?? 80),
              leverage: v.leverage ?? 100,
              phases: v.phases ?? 2,
            })),
          );
          setVariants(mapped);
        } else {
          setPageError(true);
        }
        if (consentsRes.success && consentsRes.data) {
          setConsentDocIds(consentsRes.data.map((d) => d.id));
        }
      })
      .catch(() => setPageError(true))
      .finally(() => setPageLoading(false));
  }, []);

  const canPurchase = selectedVariant && termsAccepted && riskAccepted;

  async function handlePurchase() {
    if (!canPurchase) return;
    setLoading(true);
    setError(null);

    try {
      // Record legal consents before processing order
      if (consentDocIds.length > 0) {
        await recordBulkConsent(consentDocIds);
      }

      // Step 1: Create order
      const orderRes = await createOrder({
        variantId: selectedVariant,
        couponCode: couponCode || undefined,
      });
      if (!orderRes.success || !orderRes.data) {
        setError("Failed to create order. Please try again.");
        return;
      }

      // Step 2: Initiate Stripe checkout
      const checkoutRes = await initiateCheckout(orderRes.data.id);
      if (!checkoutRes.success || !checkoutRes.data?.checkoutUrl) {
        setError("Failed to initiate payment. Please try again.");
        return;
      }

      // Step 3: Redirect to Stripe
      window.location.href = checkoutRes.data.checkoutUrl;
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) return <LoadingRows rows={6} />;
  if (pageError || variants.length === 0) return <ErrorState onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Buy a Challenge</h1>
        <p className="mt-1 text-sm text-neutral-400">Select an account size and proceed to checkout</p>
      </div>

      {/* Variants grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVariant(v.id)}
            className={`rounded-xl border p-5 text-left transition-all ${
              selectedVariant === v.id
                ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 ring-1 ring-[var(--color-brand)]/30"
                : "border-[var(--color-border)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-surface-hover)]"
            }`}
          >
            <p className="text-xs text-neutral-500">{v.planName}</p>
            <p className="mt-1 text-2xl font-bold text-white">${Number(v.accountSize).toLocaleString()}</p>
            <div className="mt-3 space-y-1 text-xs text-neutral-400">
              <p>Profit Split: {v.profitSplit}%</p>
              <p>Leverage: 1:{v.leverage}</p>
              <p>{v.phases}-Phase Evaluation</p>
            </div>
            <p className="mt-4 text-lg font-semibold text-[var(--color-brand)]">{formatCurrency(v.price)}</p>
          </button>
        ))}
      </div>

      {/* Coupon */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <label htmlFor="coupon" className="block text-sm font-medium text-neutral-300">
          Coupon Code (optional)
        </label>
        <input
          id="coupon"
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          placeholder="Enter coupon code"
          className="mt-2 w-full max-w-xs rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-[var(--color-brand)] focus:outline-none"
        />
      </div>

      {/* Checkout button */}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Region & platform restriction notices */}
      <RegionNotice />
      <PlatformNotice restrictionKey="maintenance_mode" />

      {/* Legal consent checkboxes — required before checkout */}
      <div className="space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
        <p className="text-sm font-medium text-neutral-300">Legal Agreements</p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-600 bg-transparent accent-[var(--color-brand)]"
          />
          <span className="text-sm text-neutral-400">
            I have read and agree to the{" "}
            <a href="/legal/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand)] underline underline-offset-2">
              Terms &amp; Conditions
            </a>{" "}
            and{" "}
            <a href="/legal/refund-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand)] underline underline-offset-2">
              Refund Policy
            </a>
            .
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={riskAccepted}
            onChange={(e) => setRiskAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-neutral-600 bg-transparent accent-[var(--color-brand)]"
          />
          <span className="text-sm text-neutral-400">
            I acknowledge the{" "}
            <a href="/legal/disclaimer" target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand)] underline underline-offset-2">
              Risk Disclaimer
            </a>{" "}
            and understand that trading involves significant risk of loss.
          </span>
        </label>
      </div>

      {/* Risk disclaimer inline notice */}
      <div className="flex items-start gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500/60" />
        <p className="text-xs text-neutral-500">
          Trading leveraged products carries a high level of risk. Past simulated performance
          is not indicative of future results. Please review all legal documents before proceeding.
        </p>
      </div>

      <button
        onClick={handlePurchase}
        disabled={!canPurchase || loading}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-brand)] px-6 py-3 font-medium text-black transition-colors hover:bg-[var(--color-brand-hover)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
        {loading ? "Processing…" : "Proceed to Checkout"}
      </button>
    </div>
  );
}
