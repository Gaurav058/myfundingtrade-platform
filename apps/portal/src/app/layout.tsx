import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trader Portal — MyFundingTrade',
  description: 'Manage your challenges, view performance, and request payouts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--color-background)] antialiased">{children}</body>
    </html>
  );
}
