"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@myfundingtrade/ui";
import { trustMetrics } from "@/data/site";
import { ShieldCheck, DollarSign, Clock, Server } from "lucide-react";

const metricIcons = [ShieldCheck, DollarSign, Clock, Server];

export function TrustMetricsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="section-container">
        <SectionHeader
          label="Why Traders Trust Us"
          title="Built on Transparency & Reliability"
          description="Real numbers. Real payouts. No gimmicks."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustMetrics.map((metric, i) => {
            const Icon = metricIcons[i] ?? ShieldCheck;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="glow-card rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                  <Icon className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-slate-50">
                  {metric.value}
                  {"suffix" in metric && metric.suffix ? metric.suffix : ""}
                </p>
                <p className="mt-1 text-sm text-slate-400">{metric.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
