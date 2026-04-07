"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Badge } from "@myfundingtrade/ui";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/3 translate-y-1/3 rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          <Badge variant="brand" className="mb-6">
            Accounts up to $200,000 — No Time Limit
          </Badge>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-slate-50 sm:text-5xl md:text-6xl lg:text-7xl">
            Prove Your Edge.{" "}
            <span className="gradient-text">Get Funded.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl">
            Trade our capital with up to 90% profit split. Pass a straightforward
            evaluation, and we&apos;ll back you with real funding. No hidden rules,
            no gimmicks.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/challenge">Start Your Challenge</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/how-it-works">How It Works</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
