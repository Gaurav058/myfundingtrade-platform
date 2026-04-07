"use client";

import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@myfundingtrade/ui";

export function NewsletterSection() {
  return (
    <section className="py-20 md:py-28 border-y border-[var(--color-border)] bg-[var(--color-bg-raised)]">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-xl text-center"
        >
          <h2 className="mb-3 text-2xl font-bold text-slate-50 md:text-3xl">
            Stay in the Loop
          </h2>
          <p className="mb-6 text-slate-400">
            Get trading tips, platform updates, and exclusive offers straight to your inbox.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              aria-label="Email address"
              className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
            />
            <Button variant="primary" type="submit" className="shrink-0">
              <Send className="mr-2 h-4 w-4" />
              Subscribe
            </Button>
          </form>
          <p className="mt-3 text-xs text-slate-600">
            No spam. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
