import { HeroSection } from "@/components/sections/hero";
import { StatsStripSection } from "@/components/sections/stats-strip";
import { ChallengeSummarySection } from "@/components/sections/challenge-summary";
import { TrustMetricsSection } from "@/components/sections/trust-metrics";
import { HowItWorksSection } from "@/components/sections/how-it-works-flow";
import { BenefitsGridSection } from "@/components/sections/benefits-grid";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { PlatformsSection } from "@/components/sections/platforms";
import { MediaLogosSection } from "@/components/sections/media-logos";
import { FaqPreviewSection } from "@/components/sections/faq-preview";
import { SupportCtaSection } from "@/components/sections/support-cta";
import { NewsletterSection } from "@/components/sections/newsletter";
import { CommunitySection } from "@/components/sections/community";
import { DisclaimerSection } from "@/components/sections/disclaimer";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsStripSection />
      <ChallengeSummarySection />
      <TrustMetricsSection />
      <HowItWorksSection />
      <BenefitsGridSection />
      <TestimonialsSection />
      <PlatformsSection />
      <MediaLogosSection />
      <FaqPreviewSection />
      <SupportCtaSection />
      <CommunitySection />
      <NewsletterSection />
      <DisclaimerSection />
    </>
  );
}
