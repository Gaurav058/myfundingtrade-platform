import { Card, CardHeader, CardTitle, CardContent } from '@myfundingtrade/ui';
import { formatCurrency } from '@myfundingtrade/utils';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6">
        <div className="mb-8 text-lg font-bold text-white">
          <span className="text-emerald-500">MFT</span> Portal
        </div>
        <nav className="space-y-1">
          {['Dashboard', 'Challenges', 'Accounts', 'Payouts', 'Profile', 'Support'].map(
            (item) => (
              <a
                key={item}
                href="#"
                className="block rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                {item}
              </a>
            ),
          )}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="mb-8 text-2xl font-bold text-white">Dashboard</h1>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { title: 'Account Balance', value: formatCurrency(52340) },
            { title: 'Total P&L', value: formatCurrency(2340) },
            { title: 'Active Challenges', value: '2' },
          ].map((stat) => (
            <Card key={stat.title} variant="bordered">
              <CardHeader>
                <CardTitle>{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">Your recent trading activity will appear here.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
