import type { Metadata } from "next";
import Link from "next/link";
import { Button, Badge, SectionHeader } from "@myfundingtrade/ui";
import { challengePlans, challengeRules } from "@/data/challenges";
import { Target, Shield, AlertTriangle, Calendar, Clock, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Challenge Plans",
  description:
    "Choose your funded trading challenge. Account sizes from $10,000 to $200,000. One-time fee, no subscriptions. Up to 90% profit split.",
};

const ruleIcons: Record<string, React.ElementType> = {
  target: Target,
  shield: Shield,
  "alert-triangle": AlertTriangle,
  calendar: Calendar,
  clock: Clock,
  zap: Zap,
};

export default function ChallengePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="section-container text-center">
          <Badge variant="brand" className="mb-4">
            Funded Trading Challenges
          </Badge>
          <h1 className="mb-4 text-4xl font-bold text-slate-50 md:text-5xl lg:text-6xl">
            Pick Your <span className="gradient-text">Account Size</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            One-time fee. No subscriptions. Pass the evaluation so we can fund you with real
            capital and share up to 90% of the profits.
          </p>
        </div>
      </section>

      {/* Plans grid */}
      <section className="pb-20">
        <div className="section-container">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {challengePlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                  plan.popular
                    ? "border-green-500/30 bg-green-500/5 shadow-lg shadow-green-500/5"
                    : "border-[#1a1f36] bg-[#0c1020]"
                }`}
              >
                {plan.popular && (
                  <Badge variant="brand" className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}

                <div className="mb-6 text-center">
                  <p className="text-sm text-slate-500">{plan.name}</p>
                  <p className="mt-1 text-3xl font-bold text-slate-50">
                    ${plan.accountSize.toLocaleString()}
                  </p>
                </div>

                <ul className="mb-6 flex-1 space-y-3 text-sm">
                  <PlanRow label="Profit Target" value={`${plan.profitTarget}%`} />
                  <PlanRow label="Daily Loss Limit" value={`${plan.maxDailyLoss}%`} />
                  <PlanRow label="Max Drawdown" value={`${plan.maxTotalLoss}%`} />
                  <PlanRow label="Profit Split" value={`${plan.profitSplit}%`} highlight />
                  <PlanRow label="Min Trading Days" value={`${plan.minTradingDays}`} />
                  <PlanRow label="Leverage" value={plan.leverage} />
                  <PlanRow label="Time Limit" value="Unlimited" highlight />
                </ul>

                <div className="mt-auto">
                  <p className="mb-3 text-center text-3xl font-bold text-slate-50">
                    ${plan.price}
                  </p>
                  <Button
                    variant={plan.popular ? "primary" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <Link href={`/challenge#${plan.slug}`}>Start Challenge</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="section-container">
          <SectionHeader
            label="Challenge Rules"
            title="Clear & Fair Rules for Every Trader"
            description="We believe in transparency. Here are the only rules you need to follow."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {challengeRules.map((rule) => {
              const Icon = ruleIcons[rule.icon] ?? Target;
              return (
                <div
                  key={rule.title}
                  className="rounded-2xl border border-[#1a1f36] bg-[#0c1020] p-6"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <Icon className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-50">{rule.title}</h3>
                  <p className="text-sm text-slate-400">{rule.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="section-container text-center">
          <h2 className="mb-4 text-3xl font-bold text-slate-50 md:text-4xl">
            Ready to Prove Your Edge?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-slate-400">
            Choose a plan above and start your evaluation today. No time limit, no hidden fees.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="primary" size="lg" asChild>
              <Link href="#top">Select a Plan</Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/faq">Read FAQ</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function PlanRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <li className="flex items-center justify-between text-slate-400">
      <span>{label}</span>
      <span className={highlight ? "font-semibold text-green-400" : "text-slate-200"}>
        {value}
      </span>
    </li>
  );
}
