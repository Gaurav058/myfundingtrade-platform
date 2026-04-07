"use client";

import { Badge, Button } from "@myfundingtrade/ui";
import { Send, Mail, MessageCircle, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="section-container text-center">
          <Badge variant="brand" className="mb-4">Contact Us</Badge>
          <h1 className="mb-4 text-4xl font-bold text-slate-50 md:text-5xl">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-slate-400">
            Have a question or need support? We&apos;re here 24/7.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="section-container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Form */}
            <div className="rounded-2xl border border-[#1a1f36] bg-[#0c1020] p-8">
              <h2 className="mb-6 text-xl font-bold text-slate-50">Send a Message</h2>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1 block text-sm text-slate-400">
                      Full Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      className="w-full rounded-lg border border-[#1a1f36] bg-[#06080f] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm text-slate-400">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className="w-full rounded-lg border border-[#1a1f36] bg-[#06080f] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="mb-1 block text-sm text-slate-400">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full rounded-lg border border-[#1a1f36] bg-[#06080f] px-4 py-3 text-sm text-slate-200 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="affiliate">Affiliate Program</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="mb-1 block text-sm text-slate-400">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    className="w-full resize-none rounded-lg border border-[#1a1f36] bg-[#06080f] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-green-500/50 focus:outline-none focus:ring-1 focus:ring-green-500/30"
                    placeholder="How can we help?"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full sm:w-auto">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact info */}
            <div className="space-y-8">
              <div>
                <h2 className="mb-6 text-xl font-bold text-slate-50">Other Ways to Reach Us</h2>
                <div className="space-y-6">
                  <ContactRow
                    icon={Mail}
                    title="Email"
                    detail="support@myfundingtrade.com"
                    href="mailto:support@myfundingtrade.com"
                  />
                  <ContactRow
                    icon={MessageCircle}
                    title="Live Chat"
                    detail="Available 24/7 on our platform"
                    href="https://app.myfundingtrade.com"
                  />
                  <ContactRow
                    icon={MapPin}
                    title="Office"
                    detail="London, United Kingdom"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-[#1a1f36] bg-[#0c1020] p-6">
                <h3 className="mb-2 font-semibold text-slate-50">Response Times</h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>
                    <span className="text-green-400">Email:</span> within 4 hours
                  </li>
                  <li>
                    <span className="text-green-400">Live Chat:</span> under 5 minutes
                  </li>
                  <li>
                    <span className="text-green-400">Discord:</span> community + staff support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactRow({
  icon: Icon,
  title,
  detail,
  href,
}: {
  icon: React.ElementType;
  title: string;
  detail: string;
  href?: string;
}) {
  const content = (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10">
        <Icon className="h-5 w-5 text-green-400" />
      </div>
      <div>
        <p className="font-semibold text-slate-50">{title}</p>
        <p className="text-sm text-slate-400">{detail}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block transition-opacity hover:opacity-80">
        {content}
      </a>
    );
  }
  return content;
}
