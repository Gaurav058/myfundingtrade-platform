import { Card, CardHeader, CardTitle, CardContent } from '@myfundingtrade/ui';

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 p-6">
        <div className="mb-8 text-lg font-bold text-white">
          <span className="text-emerald-500">MFT</span> Admin
        </div>
        <nav className="space-y-1">
          {[
            'Overview',
            'Users',
            'Challenges',
            'Payouts',
            'Plans',
            'Transactions',
            'Settings',
          ].map((item) => (
            <a
              key={item}
              href="#"
              className="block rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="mb-8 text-2xl font-bold text-white">Admin Overview</h1>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            { title: 'Total Users', value: '4,521' },
            { title: 'Active Challenges', value: '1,203' },
            { title: 'Pending Payouts', value: '47' },
            { title: 'Revenue (MTD)', value: '$182,400' },
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
            <CardTitle>Recent Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500">User management table will go here.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
