import type { Metadata } from "next";
import { Badge } from "@myfundingtrade/ui";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "MyFundingTrade risk disclaimer and important legal notices.",
};

export default function DisclaimerPage() {
  return (
    <section className="pt-32 pb-20 md:pt-40">
      <div className="section-container max-w-3xl">
        <Badge variant="outline" className="mb-4">Legal</Badge>
        <h1 className="mb-2 text-3xl font-bold text-slate-50 md:text-4xl">Disclaimer</h1>
        <p className="mb-10 text-sm text-slate-500">Last updated: January 15, 2026</p>

        <div className="prose prose-invert prose-green max-w-none prose-headings:text-slate-50 prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-slate-200">
          <h2>Risk Warning</h2>
          <p>
            Trading foreign exchange (forex) and contracts for difference (CFDs) on margin carries
            a high level of risk and may not be suitable for all investors. The high degree of
            leverage can work against you as well as for you. Before deciding to trade, you should
            carefully consider your investment objectives, level of experience, and risk appetite.
          </p>

          <h2>Simulated Trading</h2>
          <p>
            MyFundingTrade provides simulated trading environments for evaluation purposes. No
            actual financial instruments are bought or sold on live markets during the evaluation
            phase. Funded accounts trade on simulated environments that mirror real market
            conditions.
          </p>

          <h2>No Financial Advice</h2>
          <p>
            Nothing on this website constitutes financial, investment, trading, or any other form
            of advice. All content is for informational and educational purposes only. You should
            consult a qualified financial advisor before making any trading or investment decisions.
          </p>

          <h2>Past Performance</h2>
          <p>
            Past performance is not indicative of future results. Any performance figures or
            testimonials displayed on this website represent individual results and may not reflect
            typical outcomes.
          </p>

          <h2>Third-Party Links</h2>
          <p>
            This website may contain links to third-party websites. MyFundingTrade is not
            responsible for the content, privacy practices, or availability of external sites.
          </p>

          <h2>Regulatory Notice</h2>
          <p>
            MyFundingTrade is not a broker, investment firm, or financial institution. We do not
            hold client funds for investment purposes. Challenge fees are payments for access to
            our evaluation platform and services.
          </p>

          <h2>Accuracy of Information</h2>
          <p>
            While we strive to keep information on this website accurate and up-to-date, we make
            no warranties or representations regarding completeness, accuracy, reliability, or
            suitability. Any reliance you place on such information is strictly at your own risk.
          </p>
        </div>
      </div>
    </section>
  );
}
