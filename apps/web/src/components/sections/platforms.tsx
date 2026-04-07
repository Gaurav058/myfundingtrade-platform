"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@myfundingtrade/ui";
import { platforms } from "@/data/site";
import { Monitor } from "lucide-react";


export function PlatformsSection() {
  return (
    <section className="py-20 md:py-28 bg-[#0a0e1a]">
      <div className="section-container">
        <SectionHeader
          label="Trading Platforms"
          title="Trade on Your Preferred Platform"
          description="We support the industry&rsquo;s most trusted platforms across desktop, mobile, and web."
        />

        <div className="grid gap-6 sm:grid-cols-3">
          {platforms.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="glow-card flex flex-col items-center rounded-2xl border border-[#1a1f36] bg-[#0c1020] p-8 text-center"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
                <Monitor className="h-7 w-7 text-green-400" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-50">{p.name}</h3>
              <p className="text-sm text-slate-400">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
