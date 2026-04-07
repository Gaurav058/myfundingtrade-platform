import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin Panel — MyFundingTrade',
  description: 'Internal administration panel for MyFundingTrade platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--color-background)] antialiased">{children}</body>
    </html>
  );
}
