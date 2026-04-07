import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MyFundingTrade — Get Funded, Trade With Confidence',
  description:
    'Join MyFundingTrade and prove your trading skills. Pass the evaluation, get funded, and keep up to 90% of your profits.',
  keywords: ['prop trading', 'funded trader', 'forex funding', 'trading evaluation'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--color-background)] antialiased">{children}</body>
    </html>
  );
}
