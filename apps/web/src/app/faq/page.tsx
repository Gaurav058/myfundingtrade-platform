import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@myfundingtrade/ui";
import { faqItems, faqCategories } from "@/data/faq";
import { apiFetch } from "@/lib/api";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Find answers to common questions about MyFundingTrade challenges, funded accounts, payouts, and more.",
  openGraph: {
    title: "FAQ | MyFundingTrade",
    description: "Find answers to common questions about MyFundingTrade challenges, funded accounts, payouts, and more.",
  },
};

interface ApiFaqItem {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isPublished: boolean;
}

async function getFaqData() {
  const data = await apiFetch<ApiFaqItem[]>("/faq");
  if (data && data.length) {
    const categories = [...new Set(data.map((f) => f.category).filter(Boolean))] as string[];
    return {
      items: data.map((f) => ({ id: f.id, question: f.question, answer: f.answer, category: f.category ?? "General" })),
      categories,
    };
  }
  return { items: faqItems, categories: faqCategories };
}

export default async function FaqPage() {
  const { items, categories } = await getFaqData();

  // FAQ structured data for Google
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="section-container text-center">
          <Badge variant="brand" className="mb-4">FAQ</Badge>
          <h1 className="mb-4 text-4xl font-bold text-slate-50 md:text-5xl">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Everything you need to know about our evaluation process, funded accounts, and payouts.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="section-container max-w-3xl">
          {categories.map((category) => {
            const catItems = items.filter((item) => item.category === category);
            if (catItems.length === 0) return null;
            return (
              <div key={category} className="mb-12 last:mb-0">
                <h2 className="mb-4 text-lg font-bold text-slate-50">{category}</h2>
                <Accordion type="single" collapsible className="w-full">
                  {catItems.map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger>{item.question}</AccordionTrigger>
                      <AccordionContent>{item.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0a0e1a]">
        <div className="section-container text-center">
          <h2 className="mb-4 text-2xl font-bold text-slate-50">Still Have Questions?</h2>
          <p className="mx-auto mb-8 max-w-lg text-slate-400">
            Our support team is available 24/7 to help.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="primary" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/challenge">View Challenge Plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
