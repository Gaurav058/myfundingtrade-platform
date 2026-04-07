import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button, SectionHeader } from "@myfundingtrade/ui";
import { howItWorks } from "@/data/site";
import { ClipboardCheck, TrendingUp, BadgeCheck, Banknote, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how MyFundingTrade works — from signing up to getting your first payout in 4 simple steps.",
};

const stepIcons = [ClipboardCheck, TrendingUp, BadgeCheck, Banknote];

export default function HowItWorksPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="section-container text-center">
          <Badge variant="brand" className="mb-4">How It Works</Badge>
          <h1 className="mb-4 text-4xl font-bold text-slate-50 md:text-5xl lg:text-6xl">
            From Sign-Up to <span className="gradient-text">Payout</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            A simple, transparent path to funded trading. No ambiguity, no fine print.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="section-container">
          <div className="mx-auto max-w-3xl space-y-12">
            {howItWorks.map((step, i) => {
              const Icon = stepIcons[i] ?? ClipboardCheck;
              return (
                <div key={step.title} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10">
                      <Icon className="h-6 w-6 text-green-400" />
                    </div>
                    {i < howItWorks.length - 1 && (
                      <div className="mt-3 w-px flex-1 bg-gradient-to-b from-green-500/30 to-transparent" />
                    )}
                  </div>
                  <div className="pb-8">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-green-400">
                      Step {step.step}
                    </p>
                    <h3 className="mb-2 text-xl font-bold text-slate-50">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detail sections */}
      <section className="py-20">
        <div className="section-container">
          <SectionHeader
            label="Evaluation Details"
            title="What to Expect in Each Phase"
          />

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-[#1a1f36] bg-[#0c1020] p-8">
              <h3 className="mb-4 text-xl font-bold text-slate-50">Phase 1 — Evaluation</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  Reach 8% profit target on your account
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  Stay within 5% daily and 10% total drawdown
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  Trade on at least 5 separate days
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  No time limit — take as long as you need
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#1a1f36] bg-[#0c1020] p-8">
              <h3 className="mb-4 text-xl font-bold text-slate-50">Phase 2 — Verification</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  Same profit target and risk rules as Phase 1
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  Proves consistency and discipline
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  Upon passing, your live funded account is activated
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  Challenge fee refunded with your first payout
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="section-container text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-50">Ready to Start?</h2>
          <p className="mx-auto mb-8 max-w-lg text-slate-400">
            Choose your account size and begin your evaluation today.
          </p>
          <Button variant="primary" size="lg" asChild>
            <Link href="/challenge">View Challenge Plans</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
