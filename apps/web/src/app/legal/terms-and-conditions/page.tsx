import type { Metadata } from "next";
import { Badge } from "@myfundingtrade/ui";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "MyFundingTrade Terms and Conditions governing the use of our platform and services.",
};

export default function TermsPage() {
  return (
    <section className="pt-32 pb-20 md:pt-40">
      <div className="section-container max-w-3xl">
        <Badge variant="outline" className="mb-4">Legal</Badge>
        <h1 className="mb-2 text-3xl font-bold text-slate-50 md:text-4xl">Terms &amp; Conditions</h1>
        <p className="mb-10 text-sm text-slate-500">Last updated: January 15, 2026</p>

        <div className="prose prose-invert prose-green max-w-none prose-headings:text-slate-50 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-slate-200">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using MyFundingTrade (&quot;the Platform&quot;), you agree to be bound
            by these Terms and Conditions. If you do not agree, you may not use the Platform.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 18 years old and reside in an eligible jurisdiction to use our
            services. You are responsible for ensuring compliance with local laws.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            You agree to provide accurate, current, and complete information during registration
            and to keep your account credentials secure. You are responsible for all activity under
            your account.
          </p>

          <h2>4. Challenge &amp; Evaluation</h2>
          <p>
            The evaluation process consists of two phases with defined profit targets and risk
            parameters. The specific rules for each challenge plan are displayed at the time of
            purchase and are binding.
          </p>

          <h2>5. Funded Accounts</h2>
          <p>
            Upon successful completion of both evaluation phases, you will receive a funded
            account. Funded accounts are subject to the same risk rules as the evaluation.
            MyFundingTrade reserves the right to terminate a funded account for rule violations.
          </p>

          <h2>6. Profit Sharing &amp; Payouts</h2>
          <p>
            Profits are shared according to the split defined in your challenge plan (80%–90%).
            Payout requests are processed within 24 hours on business days. Minimum payout is $50.
          </p>

          <h2>7. Prohibited Activities</h2>
          <ul>
            <li>Exploiting platform inefficiencies (latency arbitrage, etc.)</li>
            <li>Using third-party accounts or sharing credentials</li>
            <li>Manipulating trades or engaging in any fraudulent activity</li>
            <li>Violating applicable laws or regulations</li>
          </ul>

          <h2>8. Fees &amp; Payments</h2>
          <p>
            Challenge fees are non-refundable once a trade has been placed on the account. If you
            pass the challenge, your fee is refunded with your first profit split payout.
          </p>

          <h2>9. Intellectual Property</h2>
          <p>
            All content on the Platform, including text, graphics, logos, and software, is the
            property of MyFundingTrade and is protected by intellectual property laws.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            MyFundingTrade provides simulated trading environments. We are not liable for any
            trading losses, technical issues beyond our control, or indirect damages arising from
            the use of our services.
          </p>

          <h2>11. Termination</h2>
          <p>
            We may suspend or terminate your account at any time for cause, including violation of
            these Terms. You may close your account at any time by contacting support.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of England and Wales. Any disputes shall be
            resolved through binding arbitration in London, UK.
          </p>

          <h2>13. Changes</h2>
          <p>
            We reserve the right to modify these Terms at any time. Material changes will be
            communicated via email or platform notification at least 30 days before taking effect.
          </p>
        </div>
      </div>
    </section>
  );
}
