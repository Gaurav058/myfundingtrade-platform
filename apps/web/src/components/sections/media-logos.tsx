"use client";

import { motion } from "framer-motion";
import { mediaLogos } from "@/data/site";

export function MediaLogosSection() {
  return (
    <section className="py-14 border-y border-[var(--color-border)]">
      <div className="section-container">
        <p className="mb-8 text-center text-sm uppercase tracking-wider text-slate-500">
          As Featured In
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {mediaLogos.map((logo, i) => (
            <motion.span
              key={logo}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="text-lg font-semibold text-slate-600 transition-colors hover:text-slate-400"
            >
              {logo}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
