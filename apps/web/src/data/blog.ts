/* ──────────────────────────────────────────────
 * Mock CMS data – Blog
 * ────────────────────────────────────────────── */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: string;
  readTime: string;
  coverImage: string;
  author: { name: string; avatar: string };
}

export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-pass-prop-firm-challenge",
    title: "How to Pass a Prop Firm Challenge on Your First Try",
    excerpt:
      "A complete guide to preparing for and passing your funded trader evaluation — from risk management to mindset.",
    content: `
## Preparation Is Everything

Most traders who fail prop firm challenges do so because of poor preparation, not poor skill. Before you even start trading, you need a clear plan.

### 1. Know the Rules Inside Out

Read every rule twice. Understand the daily drawdown limit, the maximum loss threshold, and the profit target. Calculate exactly how much you can risk per trade.

### 2. Start Conservative

The first few days should be about building a buffer. Risk 0.5–1% per trade maximum. Once you have a cushion of 2–3%, you can slightly increase position sizes.

### 3. Avoid Revenge Trading

This is the #1 killer. If you hit your daily loss limit early, stop trading for the day. The account will be there tomorrow.

### 4. Track Everything

Keep a trading journal. Note your entries, exits, the reasoning behind each trade, and your emotional state. Patterns will emerge that help you improve.

### 5. Be Patient

There is no time limit at MyFundingTrade. Taking 60 days to pass is infinitely better than blowing the account in 3 days trying to hit the target fast.

## Final Thoughts

Consistency beats intensity. Treat the evaluation like a marathon, not a sprint. If you can demonstrate controlled, disciplined trading, you will pass.
    `,
    category: "Education",
    publishedAt: "2026-03-28",
    readTime: "6 min read",
    coverImage: "/blog/challenge-guide.jpg",
    author: { name: "Trading Desk", avatar: "TD" },
  },
  {
    slug: "risk-management-funded-traders",
    title: "Risk Management Essentials for Funded Traders",
    excerpt:
      "You got funded — now what? Learn how to protect your funded account while maximizing profit extraction.",
    content: `
## Why Risk Management Matters More Now

Getting funded is the beginning, not the end. The real test is keeping your account alive while generating consistent payouts.

### Position Sizing

Never risk more than 1% of your account on a single trade. On a $100K account, that's $1,000 max risk per position. This gives you room for losing streaks without breaching drawdown limits.

### Daily Loss Budgets

Set your own daily loss limit below the firm's threshold. If the firm allows 5% daily drawdown, set your personal limit at 3%. This buffer protects you from edge cases.

### Correlation Risk

Don't open 5 trades in the same direction on correlated pairs. GBP/USD and EUR/USD often move together — what feels like 5 separate trades is really one big bet.

## The Golden Rule

Never let a winning week turn into a losing month. Take profits consistently and protect your capital above all else.
    `,
    category: "Education",
    publishedAt: "2026-03-21",
    readTime: "5 min read",
    coverImage: "/blog/risk-management.jpg",
    author: { name: "Trading Desk", avatar: "TD" },
  },
  {
    slug: "myfundingtrade-march-2026-update",
    title: "March 2026 Platform Update — What's New",
    excerpt:
      "New payout methods, improved dashboard, cTrader support, and our updated scaling plan.",
    content: `
## Platform Updates

We've been working hard to improve the MyFundingTrade experience. Here's what's new in March 2026.

### Faster Payouts

We've partnered with additional payment processors to bring payout times down to under 12 hours for most methods. Crypto payouts are now near-instant.

### cTrader Support

By popular demand, cTrader is now officially supported alongside MT4 and MT5. Select your platform when starting a new challenge.

### Improved Dashboard

The trader dashboard has been redesigned with clearer statistics, real-time equity tracking, and better mobile responsiveness.

### Updated Scaling Plan

Our new scaling plan rewards consistent traders with a 25% capital increase every 3 months, up to a maximum of $400,000.

## What's Coming Next

Stay tuned for our affiliate program relaunch, educational content library, and community trading challenges.
    `,
    category: "Announcements",
    publishedAt: "2026-03-15",
    readTime: "3 min read",
    coverImage: "/blog/platform-update.jpg",
    author: { name: "MyFundingTrade Team", avatar: "MF" },
  },
  {
    slug: "psychology-of-trading-discipline",
    title: "The Psychology of Trading Discipline",
    excerpt:
      "Discipline isn't about willpower — it's about systems. Here's how to build routines that keep you profitable.",
    content: `
## Systems Over Willpower

Relying on willpower alone is a losing strategy. You need systems and routines that remove emotion from the equation.

### Pre-Market Routine

Spend 15 minutes before each session reviewing your plan, checking the economic calendar, and identifying key levels. Never trade without preparation.

### Rules-Based Entries

Define your entry criteria in writing. If a setup doesn't meet ALL criteria, skip it. There will always be another trade.

### Post-Trade Review

After closing a trade, immediately log the result and your assessment. Was it a good trade regardless of outcome? Did you follow your rules?

## Building the Habit

It takes roughly 30 trading days to build a solid routine. Commit to the process, and the results will follow.
    `,
    category: "Education",
    publishedAt: "2026-03-08",
    readTime: "4 min read",
    coverImage: "/blog/trading-psychology.jpg",
    author: { name: "Trading Desk", avatar: "TD" },
  },
];
