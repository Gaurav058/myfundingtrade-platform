"use client";

import { motion } from "framer-motion";
import { SectionHeader } from "@myfundingtrade/ui";
import { testimonials } from "@/data/site";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="section-container">
        <SectionHeader
          label="Trader Reviews"
          title="Hear From Funded Traders"
          description="Join thousands of traders who turned their skills into a funded career."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="glow-card rounded-2xl border border-[#1a1f36] bg-[#0c1020] p-6"
            >
              <div className="mb-4 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`h-4 w-4 ${si < t.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-700"}`}
                  />
                ))}
              </div>

              <blockquote className="mb-4 text-sm leading-relaxed text-slate-300">
                &ldquo;{t.text}&rdquo;
              </blockquote>

              <div className="flex items-center gap-3 border-t border-[#1a1f36] pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-sm font-bold text-green-400">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-50">{t.name}</p>
                  <p className="text-xs text-slate-500">
                    {t.country} · {t.profit} profit
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
