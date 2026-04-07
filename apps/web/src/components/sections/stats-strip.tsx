"use client";

import { motion } from "framer-motion";
import { stats } from "@/data/site";

export function StatsStripSection() {
  return (
    <section className="border-y border-[#1a1f36] bg-[#0a0e1a] py-12">
      <div className="section-container">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-green-400 md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
