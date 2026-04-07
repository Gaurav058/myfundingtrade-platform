import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button, SectionHeader } from "@myfundingtrade/ui";
import { DollarSign, Users, BarChart3, Gift, Percent, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Affiliate Program",
  description:
    "Earn up to 15% commission for every trader you refer to MyFundingTrade. No limits, lifetime tracking.",
};

const perks = [
  {
    icon: Percent,
    title: "Up to 15% Commission",
    description: "Earn a percentage on every challenge purchase your referrals make.",
  },
  {
    icon: DollarSign,
    title: "Weekly Payouts",
    description: "Get paid every Friday via bank transfer, crypto, or e-wallet.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Dashboard",
    description: "Track clicks, conversions, and earnings with our live affiliate portal.",
  },
  {
    icon: Users,
    title: "Lifetime Attribution",
    description: "Earn on every future purchase your referrals make — no cookie expiry.",
  },
  {
    icon: Gift,
    title: "Exclusive Promotions",
    description: "Access special discount codes and campaigns to boost your conversion rate.",
  },
  {
    icon: ArrowRight,
    title: "Dedicated Support",
    description: "Affiliate managers available to help you optimize your campaigns.",
  },
];

const tiers = [
  { range: "1 – 20 referrals / month", rate: "10%" },
  { range: "21 – 50 referrals / month", rate: "12%" },
  { range: "51+ referrals / month", rate: "15%" },
];

export default function AffiliatePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="section-container text-center">
          <Badge variant="gold" className="mb-4">Affiliate Program</Badge>
          <h1 className="mb-4 text-4xl font-bold text-slate-50 md:text-5xl lg:text-6xl">
            Earn by Sharing <span className="gradient-text">MyFundingTrade</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Refer traders, earn commission on every challenge purchase. No limits, no caps,
            lifetime attribution.
          </p>
          <div className="mt-8">
            <Button variant="primary" size="lg" asChild>
              <Link href="https://app.myfundingtrade.com/affiliate">Join the Program</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="section-container">
          <SectionHeader
            label="Why Join"
            title="Affiliate Perks"
            description="Everything you need to monetize your audience."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {perks.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-[#1a1f36] bg-[#0c1020] p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <p.icon className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="mb-1 font-semibold text-slate-50">{p.title}</h3>
                <p className="text-sm text-slate-400">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission tiers */}
      <section className="py-20">
        <div className="section-container">
          <SectionHeader
            label="Commission Structure"
            title="Earn More as You Grow"
          />
          <div className="mx-auto max-w-xl">
            <div className="overflow-hidden rounded-2xl border border-[#1a1f36]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1a1f36] bg-[#0c1020]">
                    <th className="px-6 py-4 text-left font-semibold text-slate-300">Tier</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-300">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((t, i) => (
                    <tr key={i} className="border-b border-[#1a1f36] last:border-0">
                      <td className="px-6 py-4 text-slate-400">{t.range}</td>
                      <td className="px-6 py-4 text-right font-bold text-green-400">{t.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="section-container text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-50">Start Earning Today</h2>
          <p className="mx-auto mb-8 max-w-lg text-slate-400">
            Sign up takes under 2 minutes. Get your unique link and start sharing.
          </p>
          <Button variant="primary" size="lg" asChild>
            <Link href="https://app.myfundingtrade.com/affiliate">Create Affiliate Account</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
