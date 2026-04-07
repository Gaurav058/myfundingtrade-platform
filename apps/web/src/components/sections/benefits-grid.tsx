"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@myfundingtrade/ui";
import { benefits } from "@/data/site";
import {
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Headphones,
  BarChart3,
  Award,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Headphones,
  BarChart3,
  Award,
};

export function BenefitsGridSection() {
  return (
    <section className="py-20 md:py-28 bg-[#0a0e1a]">
      <div className="section-container">
        <SectionHeader
          label="Why MyFundingTrade"
          title="Everything a Serious Trader Needs"
          description="We removed every barrier between you and consistent, funded trading."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((item, i) => {
            const Icon = iconMap[item.icon] ?? Zap;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="group rounded-2xl border border-[#1a1f36] bg-[#0c1020] p-6 transition-colors duration-300 hover:border-green-500/20"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 transition-colors duration-300 group-hover:bg-green-500/20">
                  <Icon className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="mb-1 font-semibold text-slate-50">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
