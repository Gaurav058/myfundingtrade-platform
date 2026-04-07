import { AlertTriangle } from "lucide-react";

export function DisclaimerSection() {
  return (
    <section className="py-12 bg-[#06080f] border-t border-[#1a1f36]">
      <div className="section-container">
        <div className="flex gap-4 rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500/60" />
          <div className="text-xs leading-relaxed text-slate-500">
            <p className="mb-2 font-semibold text-slate-400">Risk Disclaimer</p>
            <p>
              Trading foreign exchange and contracts for difference on margin carries a high level
              of risk and may not be suitable for all investors. The high degree of leverage can
              work against you as well as for you. Before deciding to trade, you should carefully
              consider your investment objectives, level of experience, and risk appetite.
            </p>
            <p className="mt-2">
              MyFundingTrade provides simulated trading environments. No actual financial
              instruments are traded. Past performance is not indicative of future results. You
              should be aware of all the risks associated with trading and seek advice from an
              independent financial advisor if you have any doubts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
