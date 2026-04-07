import Link from "next/link";
import { siteConfig } from "@/data/site";

const footerLinks = {
  Products: [
    { href: "/challenge", label: "Challenge Plans" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/affiliate", label: "Affiliate Program" },
  ],
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ],
  Legal: [
    { href: "/legal/terms-and-conditions", label: "Terms & Conditions" },
    { href: "/legal/privacy-policy", label: "Privacy Policy" },
    { href: "/legal/refund-policy", label: "Refund Policy" },
    { href: "/legal/disclaimer", label: "Risk Disclaimer" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      {/* Main footer */}
      <div className="section-container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-lg font-bold tracking-tight">
              <span className="text-green-500">MyFunding</span>
              <span className="text-slate-50">Trade</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              A proprietary trading firm backing skilled traders with capital up to
              $200,000. Prove your edge, get funded, keep up to 90% of your profits.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {(
                [
                  ["Twitter", siteConfig.links.twitter],
                  ["Discord", siteConfig.links.discord],
                  ["YouTube", siteConfig.links.youtube],
                  ["Instagram", siteConfig.links.instagram],
                ] as const
              ).map(([label, url]) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 transition-colors hover:text-green-400"
                  aria-label={label}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--color-border)]">
        <div className="section-container flex flex-col items-center justify-between gap-4 py-6 text-xs text-slate-600 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} MyFundingTrade. All rights reserved.</p>
          <p className="max-w-xl text-center sm:text-right">
            Trading leveraged products carries a high level of risk and may not be
            suitable for all investors. Past performance is not indicative of future
            results. You should carefully consider whether trading is appropriate for
            you in light of your experience, objectives, financial resources, and
            other relevant circumstances.
          </p>
        </div>
      </div>
    </footer>
  );
}
