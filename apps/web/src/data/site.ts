/* ──────────────────────────────────────────────
 * Mock CMS data – site-wide content
 * ────────────────────────────────────────────── */

export const siteConfig = {
  name: "MyFundingTrade",
  tagline: "Get Funded, Trade With Confidence",
  description:
    "Join MyFundingTrade and prove your trading skills. Pass a straightforward evaluation, get funded with up to $200,000, and keep up to 90% of your profits.",
  url: "https://myfundingtrade.com",
  ogImage: "/og-image.png",
  links: {
    app: "https://app.myfundingtrade.com",
    portal: "https://portal.myfundingtrade.com",
    twitter: "https://twitter.com/myfundingtrade",
    discord: "https://discord.gg/myfundingtrade",
    instagram: "https://instagram.com/myfundingtrade",
    youtube: "https://youtube.com/@myfundingtrade",
    telegram: "https://t.me/myfundingtrade",
  },
  email: "support@myfundingtrade.com",
};

export const stats = [
  { value: "$12M+", label: "Paid to Traders" },
  { value: "15,000+", label: "Funded Accounts" },
  { value: "90%", label: "Profit Split" },
  { value: "150+", label: "Countries" },
];

export const trustMetrics = [
  { value: "4.8", label: "Trustpilot Score", suffix: "/5" },
  { value: "$42K", label: "Avg. Monthly Payout" },
  { value: "<24h", label: "Payout Speed" },
  { value: "99.9%", label: "Platform Uptime" },
];

export const mediaLogos = [
  "Bloomberg",
  "Forbes",
  "TradingView",
  "Investing.com",
  "FXStreet",
  "DailyFX",
];

export const testimonials = [
  {
    id: "1",
    name: "Marcus R.",
    country: "Germany",
    avatar: "MR",
    rating: 5,
    text: "Got funded within 2 weeks. The rules are clear, payouts are fast, and support actually responds. Best prop firm I've tried.",
    profit: "$8,420",
  },
  {
    id: "2",
    name: "Aya K.",
    country: "Japan",
    avatar: "AK",
    rating: 5,
    text: "I was skeptical at first, but MyFundingTrade delivered. Received my first payout in under 24 hours. The platform is solid.",
    profit: "$15,200",
  },
  {
    id: "3",
    name: "Carlos M.",
    country: "Brazil",
    avatar: "CM",
    rating: 5,
    text: "Clean dashboard, no hidden rules, and the profit split is actually what they advertise. This is how prop trading should work.",
    profit: "$6,750",
  },
  {
    id: "4",
    name: "Sarah L.",
    country: "United Kingdom",
    avatar: "SL",
    rating: 5,
    text: "Passed Phase 1 and Phase 2, started trading live within a month. Their evaluation is tough but fair. Highly recommend.",
    profit: "$22,800",
  },
];

export const howItWorks = [
  {
    step: 1,
    title: "Choose Your Challenge",
    description:
      "Select an account size from $10K to $200K. Pay a one-time fee. No subscriptions, no hidden charges.",
  },
  {
    step: 2,
    title: "Pass the Evaluation",
    description:
      "Complete a two-phase assessment. Hit the profit target while respecting risk management rules. No time limit.",
  },
  {
    step: 3,
    title: "Get Your Funded Account",
    description:
      "Once you pass, receive your live funded account. Trade real capital with real market conditions.",
  },
  {
    step: 4,
    title: "Withdraw Your Profits",
    description:
      "Keep up to 90% of everything you make. Request payouts anytime — processed within 24 hours.",
  },
];

export const benefits = [
  {
    title: "No Time Limit",
    description: "Take your evaluation at your own pace. No pressure, no deadlines.",
    icon: "clock",
  },
  {
    title: "Up to 90% Profit Split",
    description: "Industry-leading payout ratio. Your skill, your money.",
    icon: "trending-up",
  },
  {
    title: "Fast Payouts",
    description: "Request a withdrawal anytime. Processed within 24 hours.",
    icon: "zap",
  },
  {
    title: "All Strategies Allowed",
    description: "EAs, scalping, swing, news trading — no restrictions on style.",
    icon: "layers",
  },
  {
    title: "Transparent Rules",
    description: "No hidden clauses. Every rule is clearly documented upfront.",
    icon: "shield",
  },
  {
    title: "Dedicated Support",
    description: "Real humans, real answers. Reach us anytime via live chat or email.",
    icon: "headphones",
  },
  {
    title: "Global Access",
    description: "Available in 150+ countries. Trade from anywhere in the world.",
    icon: "globe",
  },
  {
    title: "Scaling Plan",
    description: "Grow your account over time. Consistent performance unlocks higher capital.",
    icon: "bar-chart-3",
  },
];

export const platforms = [
  {
    name: "MetaTrader 5",
    description: "The industry standard for forex and CFD trading.",
  },
  {
    name: "MetaTrader 4",
    description: "Classic platform trusted by millions of traders.",
  },
  {
    name: "cTrader",
    description: "Advanced charting and algorithmic trading platform.",
  },
];

export const communityLinks = [
  { platform: "Discord", url: siteConfig.links.discord, members: "12,000+" },
  { platform: "Telegram", url: siteConfig.links.telegram, members: "8,500+" },
  { platform: "YouTube", url: siteConfig.links.youtube, subscribers: "25,000+" },
  { platform: "Instagram", url: siteConfig.links.instagram, followers: "18,000+" },
];
