/* ──────────────────────────────────────────────
 * Mock CMS data – challenge plans
 * Replace with API calls when backend is live
 * ────────────────────────────────────────────── */

export interface ChallengePlan {
  id: string;
  name: string;
  slug: string;
  accountSize: number;
  price: number;
  profitTarget: number;
  maxDailyLoss: number;
  maxTotalLoss: number;
  profitSplit: number;
  minTradingDays: number;
  leverage: string;
  popular?: boolean;
}

export const challengePlans: ChallengePlan[] = [
  {
    id: "1",
    name: "Starter",
    slug: "starter-10k",
    accountSize: 10_000,
    price: 99,
    profitTarget: 8,
    maxDailyLoss: 5,
    maxTotalLoss: 10,
    profitSplit: 80,
    minTradingDays: 5,
    leverage: "1:100",
  },
  {
    id: "2",
    name: "Growth",
    slug: "growth-25k",
    accountSize: 25_000,
    price: 199,
    profitTarget: 8,
    maxDailyLoss: 5,
    maxTotalLoss: 10,
    profitSplit: 80,
    minTradingDays: 5,
    leverage: "1:100",
  },
  {
    id: "3",
    name: "Professional",
    slug: "pro-50k",
    accountSize: 50_000,
    price: 299,
    profitTarget: 8,
    maxDailyLoss: 5,
    maxTotalLoss: 10,
    profitSplit: 85,
    minTradingDays: 5,
    leverage: "1:100",
    popular: true,
  },
  {
    id: "4",
    name: "Elite",
    slug: "elite-100k",
    accountSize: 100_000,
    price: 499,
    profitTarget: 8,
    maxDailyLoss: 5,
    maxTotalLoss: 10,
    profitSplit: 90,
    minTradingDays: 5,
    leverage: "1:100",
  },
  {
    id: "5",
    name: "Apex",
    slug: "apex-200k",
    accountSize: 200_000,
    price: 899,
    profitTarget: 8,
    maxDailyLoss: 5,
    maxTotalLoss: 10,
    profitSplit: 90,
    minTradingDays: 5,
    leverage: "1:100",
  },
];

export const challengeRules = [
  {
    title: "Profit Target",
    description: "Reach 8% profit on your account to pass each phase.",
    icon: "target",
  },
  {
    title: "Maximum Daily Loss",
    description: "Do not exceed 5% loss in a single trading day.",
    icon: "shield",
  },
  {
    title: "Maximum Total Loss",
    description: "Your total drawdown must stay within 10% of the starting balance.",
    icon: "alert-triangle",
  },
  {
    title: "Minimum Trading Days",
    description: "You must trade on at least 5 separate days per phase.",
    icon: "calendar",
  },
  {
    title: "No Time Limit",
    description: "Take as long as you need — there is no deadline to hit your target.",
    icon: "clock",
  },
  {
    title: "All Strategies Welcome",
    description: "EAs, scalping, swing, news trading — trade however suits your edge.",
    icon: "zap",
  },
];
