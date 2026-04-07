"use client";

import { motion } from "framer-motion";
import { SectionHeader, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@myfundingtrade/ui";
import { faqItems } from "@/data/faq";
import Link from "next/link";
import { Button } from "@myfundingtrade/ui";

const previewItems = faqItems.slice(0, 6);

export function FaqPreviewSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="section-container max-w-3xl">
        <SectionHeader
          label="FAQ"
          title="Frequently Asked Questions"
          description="Quick answers to common questions. Visit our full FAQ page for more."
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {previewItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/faq">View All Questions</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
