import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AdminAuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Admin — MyFundingTrade',
  description: 'Internal administration panel for MyFundingTrade platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[var(--color-bg)] font-sans antialiased">
        <AdminAuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
