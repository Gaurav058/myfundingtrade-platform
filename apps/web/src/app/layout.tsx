import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CookieBanner } from "@/components/layout/cookie-banner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MyFundingTrade — Get Funded, Trade With Confidence",
    template: "%s | MyFundingTrade",
  },
  description:
    "Join MyFundingTrade and prove your trading skills. Pass a straightforward evaluation, get funded with up to $200,000, and keep up to 90% of your profits.",
  keywords: [
    "prop trading",
    "funded trader",
    "forex funding",
    "trading evaluation",
    "proprietary trading firm",
    "funded account",
    "MyFundingTrade",
  ],
  metadataBase: new URL("https://myfundingtrade.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://myfundingtrade.com",
    siteName: "MyFundingTrade",
    title: "MyFundingTrade — Get Funded, Trade With Confidence",
    description:
      "Pass a straightforward evaluation, get funded with up to $200,000, and keep up to 90% of your profits.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyFundingTrade — Get Funded, Trade With Confidence",
    description:
      "Pass a straightforward evaluation, get funded with up to $200,000, and keep up to 90% of your profits.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--color-bg)] font-sans antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
