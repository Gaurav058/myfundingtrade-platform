"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Badge, SectionHeader } from "@myfundingtrade/ui";
import { challengePlans } from "@/data/challenges";


export function ChallengeSummarySection() {
  return (
    <section className="py-20 md:py-28">
      <div className="section-container">
        <SectionHeader
          label="Challenge Plans"
          title="Choose Your Account Size"
          description="One-time fee. No subscriptions. No hidden charges. Pick the account size that matches your trading ambitions."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {challengePlans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`glow-card relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                plan.popular
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-[#1a1f36] bg-[#0c1020]"
              }`}
            >
              {plan.popular && (
                <Badge variant="brand" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}

              <div className="mb-4 text-center">
                <p className="text-sm text-slate-500">{plan.name}</p>
                <p className="mt-1 text-3xl font-bold text-slate-50">
                  ${plan.accountSize.toLocaleString()}
                </p>
              </div>

              <div className="mb-6 space-y-2.5 text-sm text-slate-400">
                <Row label="Profit Target" value={`${plan.profitTarget}%`} />
                <Row label="Daily Loss Limit" value={`${plan.maxDailyLoss}%`} />
                <Row label="Total Drawdown" value={`${plan.maxTotalLoss}%`} />
                <Row label="Profit Split" value={`${plan.profitSplit}%`} highlight />
                <Row label="Leverage" value={plan.leverage} />
              </div>

              <div className="mt-auto">
                <p className="mb-3 text-center text-2xl font-bold text-slate-50">
                  ${plan.price}
                </p>
                <Button
                  variant={plan.popular ? "primary" : "outline"}
                  size="sm"
                  className="w-full"
                  asChild
                >
                  <Link href="/challenge">Get Started</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className={highlight ? "font-semibold text-green-400" : "text-slate-200"}>
        {value}
      </span>
    </div>
  );
}
