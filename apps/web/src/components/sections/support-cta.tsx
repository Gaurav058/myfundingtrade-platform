"use client";

import { motion } from "framer-motion";
import { Button } from "@myfundingtrade/ui";
import Link from "next/link";
import { Headphones, MessageCircle } from "lucide-react";

export function SupportCtaSection() {
  return (
    <section className="py-20 md:py-28 bg-[#0a0e1a]">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
            <Headphones className="h-7 w-7 text-green-400" />
          </div>
          <h2 className="mb-3 text-3xl font-bold text-slate-50 md:text-4xl">
            Need Help Getting Started?
          </h2>
          <p className="mb-8 text-lg text-slate-400">
            Our support team is available 24/7 to answer your questions and guide you through the
            challenge process.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="primary" size="lg" asChild>
              <Link href="/contact">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
            <Button variant="ghost" size="lg" asChild>
              <Link href="/faq">Browse FAQ</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
