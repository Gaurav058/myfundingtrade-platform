import type { Metadata } from "next";
import { Badge } from "@myfundingtrade/ui";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "MyFundingTrade refund policy for challenge purchases.",
};

export default function RefundPolicyPage() {
  return (
    <section className="pt-32 pb-20 md:pt-40">
      <div className="section-container max-w-3xl">
        <Badge variant="outline" className="mb-4">Legal</Badge>
        <h1 className="mb-2 text-3xl font-bold text-slate-50 md:text-4xl">Refund Policy</h1>
        <p className="mb-10 text-sm text-slate-500">Last updated: January 15, 2026</p>

        <div className="prose prose-invert prose-green max-w-none prose-headings:text-slate-50 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-slate-200">
          <h2>1. Challenge Fee Refund</h2>
          <p>
            If you pass both phases of the evaluation, the original challenge fee will be refunded
            in full along with your first profit split payout. This is our commitment to rewarding
            successful traders.
          </p>

          <h2>2. Pre-Activation Refunds</h2>
          <p>
            If you have purchased a challenge but have <strong>not yet placed any trades</strong>{" "}
            and the account has not been activated, you may request a full refund within 14 days
            of purchase by contacting support@myfundingtrade.com.
          </p>

          <h2>3. Post-Activation Policy</h2>
          <p>
            Once a challenge account has been activated and any trade has been placed, the
            challenge fee is <strong>non-refundable</strong>. This applies regardless of whether
            the evaluation was passed or failed.
          </p>

          <h2>4. Failed Challenges</h2>
          <p>
            If you fail an evaluation, the challenge fee is not refunded. However, you may
            purchase a new challenge at any time to try again. We occasionally offer retry
            discounts — check your email or dashboard for available offers.
          </p>

          <h2>5. Technical Issues</h2>
          <p>
            If a technical issue on our platform directly causes you to fail the evaluation (e.g.,
            platform downtime, execution errors attributable to us), we will either reset your
            account or provide a free retry at our discretion.
          </p>

          <h2>6. Processing Time</h2>
          <p>
            Approved refunds are processed within 5–7 business days. Funds will be returned to the
            original payment method used for the purchase.
          </p>

          <h2>7. How to Request a Refund</h2>
          <p>
            To request a refund, email support@myfundingtrade.com with your account email, order
            number, and reason for the request. Our team will review and respond within 48 hours.
          </p>

          <h2>8. Chargebacks</h2>
          <p>
            Initiating a chargeback without first contacting our support team may result in
            permanent suspension of your account. We encourage you to reach out to us directly to
            resolve any billing concerns.
          </p>
        </div>
      </div>
    </section>
  );
}
