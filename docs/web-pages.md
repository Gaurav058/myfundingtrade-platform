# MyFundingTrade — Web Pages Documentation

> Public marketing website built with Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, and Radix UI.

## Pages

| Route | File | SEO Title | Description |
|-------|------|-----------|-------------|
| `/` | `src/app/page.tsx` | MyFundingTrade — Prove Your Edge. Get Funded. | Homepage with 14 sections: Hero, Stats, Challenge Summary, Trust Metrics, How It Works, Benefits, Testimonials, Platforms, Media Logos, FAQ Preview, Support CTA, Community, Newsletter, Disclaimer |
| `/challenge` | `src/app/challenge/page.tsx` | Challenge Plans | All 5 challenge plans ($10K–$200K) with pricing, rules, and comparison |
| `/about` | `src/app/about/page.tsx` | About Us | Mission, values (6), and milestones timeline |
| `/how-it-works` | `src/app/how-it-works/page.tsx` | How It Works | 4-step process + Phase 1 & 2 detail cards |
| `/affiliate` | `src/app/affiliate/page.tsx` | Affiliate Program | Perks (6), commission tiers (10%–15%), CTAs |
| `/contact` | `src/app/contact/page.tsx` | Contact Us | Contact form (name, email, subject, message) + info sidebar |
| `/blog` | `src/app/blog/page.tsx` | Blog | Blog listing with category, date, read time, excerpt |
| `/blog/[slug]` | `src/app/blog/[slug]/page.tsx` | {Post Title} | Individual blog post with simple markdown rendering |
| `/faq` | `src/app/faq/page.tsx` | FAQ | All 12 FAQ items grouped by 5 categories with accordions |
| `/legal/privacy-policy` | `src/app/legal/privacy-policy/page.tsx` | Privacy Policy | 9-section privacy policy |
| `/legal/terms-and-conditions` | `src/app/legal/terms-and-conditions/page.tsx` | Terms & Conditions | 13-section terms of service |
| `/legal/disclaimer` | `src/app/legal/disclaimer/page.tsx` | Disclaimer | Risk warning, simulated trading notice, regulatory info |
| `/legal/refund-policy` | `src/app/legal/refund-policy/page.tsx` | Refund Policy | 8-section refund rules including chargeback policy |

## Layout Components

| Component | File | Notes |
|-----------|------|-------|
| Navbar | `src/components/layout/navbar.tsx` | Sticky, backdrop-blur, mobile hamburger, 7 nav links, Client Area + Get Funded CTAs |
| Footer | `src/components/layout/footer.tsx` | 3-column links (Products/Company/Legal), social icons, risk disclaimer |
| Cookie Banner | `src/components/layout/cookie-banner.tsx` | GDPR consent, localStorage persistence, slide-up animation |

## Homepage Sections

| # | Section | File | Data Source |
|---|---------|------|-------------|
| 1 | Hero | `src/components/sections/hero.tsx` | — |
| 2 | Stats Strip | `src/components/sections/stats-strip.tsx` | `data/site.ts` → `stats` |
| 3 | Challenge Summary | `src/components/sections/challenge-summary.tsx` | `data/challenges.ts` → `challengePlans` |
| 4 | Trust Metrics | `src/components/sections/trust-metrics.tsx` | `data/site.ts` → `trustMetrics` |
| 5 | How It Works | `src/components/sections/how-it-works-flow.tsx` | `data/site.ts` → `howItWorks` |
| 6 | Benefits Grid | `src/components/sections/benefits-grid.tsx` | `data/site.ts` → `benefits` |
| 7 | Testimonials | `src/components/sections/testimonials.tsx` | `data/site.ts` → `testimonials` |
| 8 | Platforms | `src/components/sections/platforms.tsx` | `data/site.ts` → `platforms` |
| 9 | Media Logos | `src/components/sections/media-logos.tsx` | `data/site.ts` → `mediaLogos` |
| 10 | FAQ Preview | `src/components/sections/faq-preview.tsx` | `data/faq.ts` → `faqItems` (first 6) |
| 11 | Support CTA | `src/components/sections/support-cta.tsx` | — |
| 12 | Community | `src/components/sections/community.tsx` | `data/site.ts` → `communityLinks` |
| 13 | Newsletter | `src/components/sections/newsletter.tsx` | — |
| 14 | Disclaimer | `src/components/sections/disclaimer.tsx` | — |

## Mock CMS Data

| File | Exports |
|------|---------|
| `src/data/challenges.ts` | `ChallengePlan` (interface), `challengePlans` (5 plans), `challengeRules` (6 rules) |
| `src/data/site.ts` | `siteConfig`, `stats`, `trustMetrics`, `mediaLogos`, `testimonials`, `howItWorks`, `benefits`, `platforms`, `communityLinks` |
| `src/data/faq.ts` | `FaqItem` (interface), `faqCategories`, `faqItems` (12 items) |
| `src/data/blog.ts` | `BlogPost` (interface), `blogPosts` (4 posts with full markdown content) |

## Shared UI Components (`packages/ui`)

| Component | File | Notes |
|-----------|------|-------|
| Button | `src/components/button.tsx` | CVA variants: primary, outline, ghost, destructive. Sizes: sm, md, lg. Supports `asChild` |
| Card | `src/components/card.tsx` | Basic card wrapper |
| Input | `src/components/input.tsx` | Forwarded ref input |
| Badge | `src/components/badge.tsx` | Variants: default, brand, gold, outline |
| Section / SectionHeader | `src/components/section.tsx` | Section wrapper + header with label, title, description, align |
| Accordion | `src/components/accordion.tsx` | Radix-based with chevron animation |

## Global Requirements

- **SEO**: Full `<Metadata>` on every page, OpenGraph & Twitter cards on root layout
- **Responsive**: Mobile-first with sm/md/lg/xl breakpoints
- **Accessibility**: Semantic HTML, proper labels, keyboard-navigable
- **Dark Theme**: Custom color tokens via Tailwind `@theme` directive
- **Animations**: Framer Motion `whileInView` for scroll reveals
- **Design**: Dark premium finance-tech aesthetic (#06080f bg, #22c55e brand green)

## Tech Stack

- Next.js 15.1 (App Router, standalone output)
- React 19
- TypeScript 5.7
- Tailwind CSS 4 (`@theme` directive, no config file)
- Framer Motion
- Radix UI (Accordion, Dialog, NavigationMenu, Separator, Slot, Toast, Tooltip)
- Lucide React (icons)
- CVA + clsx + tailwind-merge (component variants)
- pnpm + Turborepo (monorepo)
