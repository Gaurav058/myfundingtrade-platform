import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button } from "@myfundingtrade/ui";
import { FileText, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Legal",
  description: "Legal documents including terms and conditions, privacy policy, refund policy, and risk disclaimer.",
};

const LEGAL_PAGES = [
  { href: "/legal/terms-and-conditions", title: "Terms & Conditions", description: "Terms governing use of the MyFundingTrade platform and services." },
  { href: "/legal/privacy-policy", title: "Privacy Policy", description: "How we collect, use, and protect your personal data." },
  { href: "/legal/refund-policy", title: "Refund Policy", description: "Our refund policy for challenge purchases and evaluations." },
  { href: "/legal/disclaimer", title: "Risk Disclaimer", description: "Important risk warnings and disclaimers about simulated trading." },
];

export default function LegalIndexPage() {
  return (
    <>
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="section-container text-center">
          <Badge variant="outline" className="mb-4">Legal</Badge>
          <h1 className="mb-4 text-4xl font-bold text-slate-50 md:text-5xl">
            Legal <span className="gradient-text">Documents</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Our legal documents and policies. Last updated January 2026.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="section-container max-w-2xl">
          <div className="space-y-4">
            {LEGAL_PAGES.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className="group flex items-center gap-4 rounded-xl border border-[#1a1f36] bg-[#0c1020] p-5 transition-colors hover:border-green-500/20"
              >
                <FileText className="h-5 w-5 shrink-0 text-slate-500 group-hover:text-green-400" />
                <div className="flex-1">
                  <h2 className="font-semibold text-slate-50 group-hover:text-green-400">{page.title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{page.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#0a0e1a]">
        <div className="section-container text-center">
          <p className="mb-4 text-slate-400">Have questions about our legal documents?</p>
          <Button variant="primary" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
