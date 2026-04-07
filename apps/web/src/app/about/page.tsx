import type { Metadata } from "next";
import { Badge, SectionHeader } from "@myfundingtrade/ui";
import { Shield, Users, Globe, Award, TrendingUp, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about MyFundingTrade — our mission to democratize access to capital for talented traders worldwide.",
};

const values = [
  {
    icon: Shield,
    title: "Transparency",
    description: "No hidden rules, no surprise fees. Every policy is published and enforced equally.",
  },
  {
    icon: Users,
    title: "Trader-First",
    description: "We built the platform traders asked for — fast payouts, fair rules, real support.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description: "Serving traders from 150+ countries with multilingual support and local payout methods.",
  },
  {
    icon: Award,
    title: "Meritocracy",
    description: "Your results define your journey. Age, background, and credentials don't matter — skill does.",
  },
  {
    icon: TrendingUp,
    title: "Growth-Oriented",
    description: "From scaling plans to educational content, we invest in our traders' long-term success.",
  },
  {
    icon: Zap,
    title: "Technology-Driven",
    description: "Enterprise-grade infrastructure with 99.9% uptime, fast execution, and modern trading tools.",
  },
];

const milestones = [
  { year: "2023", event: "MyFundingTrade founded with a mission to democratize funded trading." },
  { year: "2023", event: "First 1,000 traders funded within 6 months of launch." },
  { year: "2024", event: "Expanded platform support to MT4, MT5, and cTrader." },
  { year: "2024", event: "$5M total paid out to funded traders." },
  { year: "2025", event: "15,000+ active funded accounts across 150+ countries." },
  { year: "2025", event: "Launched scaling plan and community Discord." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="section-container text-center">
          <Badge variant="brand" className="mb-4">About Us</Badge>
          <h1 className="mb-4 text-4xl font-bold text-slate-50 md:text-5xl lg:text-6xl">
            Funding <span className="gradient-text">Serious Traders</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            We believe every skilled trader deserves access to institutional capital — regardless
            of background, location, or account balance.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="section-container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-slate-50">Our Mission</h2>
            <p className="text-lg leading-relaxed text-slate-300">
              MyFundingTrade was founded on a simple idea: <strong className="text-slate-50">talent should not be limited by capital.</strong>{" "}
              We provide skilled traders with funded accounts up to $200,000, transparent rules,
              and up to 90% profit sharing — so traders can focus on what they do best.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="section-container">
          <SectionHeader
            label="Our Values"
            title="What We Stand For"
            description="The principles that guide every decision we make."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-[#1a1f36] bg-[#0c1020] p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <v.icon className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="mb-1 font-semibold text-slate-50">{v.title}</h3>
                <p className="text-sm text-slate-400">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="section-container">
          <SectionHeader
            label="Our Journey"
            title="Milestones"
          />
          <div className="mx-auto max-w-2xl">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-6 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10 text-xs font-bold text-green-400">
                    {i + 1}
                  </div>
                  {i < milestones.length - 1 && (
                    <div className="mt-2 w-px flex-1 bg-[#1a1f36]" />
                  )}
                </div>
                <div className="pt-1">
                  <p className="text-xs font-semibold text-green-400">{m.year}</p>
                  <p className="mt-1 text-sm text-slate-300">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
