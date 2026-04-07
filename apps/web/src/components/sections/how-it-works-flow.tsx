"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@myfundingtrade/ui";
import { howItWorks } from "@/data/site";
import { ClipboardCheck, TrendingUp, BadgeCheck, Banknote } from "lucide-react";

const stepIcons = [ClipboardCheck, TrendingUp, BadgeCheck, Banknote];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="section-container">
        <SectionHeader
          label="How It Works"
          title="From Sign-Up to Payout in 4 Steps"
          description="A straightforward path to funded trading. No ambiguity, no fine print."
        />

        <div className="relative grid gap-8 md:grid-cols-4">
          {/* Connector line */}
          <div className="absolute top-10 left-[10%] right-[10%] hidden h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent md:block" />

          {howItWorks.map((step, i) => {
            const Icon = stepIcons[i] ?? ClipboardCheck;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
                className="relative text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10">
                  <Icon className="h-7 w-7 text-green-400" />
                </div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-400">
                  Step {step.step}
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-50">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
