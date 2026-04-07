import { Button } from '@myfundingtrade/ui';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Navigation */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="text-xl font-bold text-white">
            <span className="text-emerald-500">MyFunding</span>Trade
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm text-slate-400 hover:text-white">
              How It Works
            </a>
            <a href="#plans" className="text-sm text-slate-400 hover:text-white">
              Challenge Plans
            </a>
            <a href="#payouts" className="text-sm text-slate-400 hover:text-white">
              Payouts
            </a>
            <a href="#faq" className="text-sm text-slate-400 hover:text-white">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
            <Button variant="primary" size="sm">
              Get Funded
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
            Accounts up to $200,000
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl">
            Prove Your Edge.
            <br />
            <span className="text-emerald-500">Get Funded.</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400">
            Trade our capital with up to 90% profit split. Pass a straightforward evaluation, and
            we&apos;ll back you with real funding. No hidden rules, no gimmicks.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg">Start Your Challenge</Button>
            <Button variant="outline" size="lg">
              View Plans
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-800 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {[
            { value: '$12M+', label: 'Paid to Traders' },
            { value: '15,000+', label: 'Funded Accounts' },
            { value: '90%', label: 'Profit Split' },
            { value: '24/7', label: 'Support' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-emerald-500">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-12">
        <div className="mx-auto max-w-7xl text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} MyFundingTrade. All rights reserved.</p>
          <p className="mt-2">
            Trading involves substantial risk. Past performance does not guarantee future results.
          </p>
        </div>
      </footer>
    </main>
  );
}
