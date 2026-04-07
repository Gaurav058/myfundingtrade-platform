/* ──────────────────────────────────────────────
 * Mock CMS data – FAQ
 * ────────────────────────────────────────────── */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const faqCategories = [
  "General",
  "Evaluation",
  "Funded Account",
  "Payouts",
  "Account & Billing",
];

export const faqItems: FaqItem[] = [
  {
    id: "1",
    question: "What is MyFundingTrade?",
    answer:
      "MyFundingTrade is a proprietary trading firm that funds talented traders. Pass our evaluation process, and we provide you with capital to trade — up to $200,000. You keep up to 90% of the profits you generate.",
    category: "General",
  },
  {
    id: "2",
    question: "How does the evaluation work?",
    answer:
      "Our evaluation consists of two phases. In each phase, you need to reach an 8% profit target while staying within risk limits (5% daily loss, 10% total drawdown). There is no time limit — trade at your own pace.",
    category: "Evaluation",
  },
  {
    id: "3",
    question: "Is there a time limit to pass the evaluation?",
    answer:
      "No. You can take as long as you need to reach the profit target. There are no deadlines or expiration dates on your evaluation account.",
    category: "Evaluation",
  },
  {
    id: "4",
    question: "What trading strategies are allowed?",
    answer:
      "All legitimate trading strategies are welcome — including EAs, scalping, swing trading, and news trading. The only restriction is on strategies that exploit platform inefficiencies (e.g., latency arbitrage).",
    category: "Evaluation",
  },
  {
    id: "5",
    question: "What happens after I pass both phases?",
    answer:
      "You receive a live funded account with the same account size you evaluated on. Trade normally and request payouts whenever you have profits to withdraw.",
    category: "Funded Account",
  },
  {
    id: "6",
    question: "How much of my profits do I keep?",
    answer:
      "You keep between 80% and 90% of your profits, depending on your account size. Larger accounts qualify for the higher 90% split.",
    category: "Payouts",
  },
  {
    id: "7",
    question: "How fast are payouts processed?",
    answer:
      "All payout requests are processed within 24 hours on business days. We support bank transfers, crypto, and multiple e-wallet options.",
    category: "Payouts",
  },
  {
    id: "8",
    question: "Can I hold trades over the weekend?",
    answer:
      "Yes. There are no restrictions on holding positions overnight or over weekends.",
    category: "Funded Account",
  },
  {
    id: "9",
    question: "What platforms do you support?",
    answer:
      "We support MetaTrader 4, MetaTrader 5, and cTrader. You can choose your preferred platform when starting your challenge.",
    category: "General",
  },
  {
    id: "10",
    question: "Can I get a refund if I fail?",
    answer:
      "Challenge fees are non-refundable once the account has been activated and any trade has been placed. If you pass the challenge, we refund the fee with your first profit split payout.",
    category: "Account & Billing",
  },
  {
    id: "11",
    question: "Is there a scaling plan?",
    answer:
      "Yes. Traders who demonstrate consistent profitability can qualify for our scaling plan, receiving up to 25% additional capital every 3 months.",
    category: "Funded Account",
  },
  {
    id: "12",
    question: "Which countries are eligible?",
    answer:
      "We accept traders from 150+ countries. A few sanctioned regions are restricted — check our Terms & Conditions for the full list.",
    category: "General",
  },
];
