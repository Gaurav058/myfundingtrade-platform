# Admin Panel — Page Architecture

> `apps/admin` · Next.js 15 App Router · Port 3002

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.1 (App Router, React 19) |
| Styling | Tailwind CSS 4 (`@theme` directive) |
| UI Primitives | Radix UI (Dialog, DropdownMenu, Select, Tabs, Tooltip, Avatar, Switch, Checkbox, Popover, Separator) |
| Icons | Lucide React |
| Animations | Framer Motion |
| Types | `@myfundingtrade/types` (38 interfaces, 26 type aliases) |
| Data Layer | Mock adapter (`api-client.ts`) — swap with real API |

## Admin Roles

| Role | Access |
|---|---|
| `SUPER_ADMIN` | Full access to all modules |
| `FINANCE_ADMIN` | Orders, Payments, Payouts, Coupons, Affiliates, Settings |
| `KYC_REVIEWER` | KYC Reviews, User profiles |
| `SUPPORT_AGENT` | Tickets, User profiles, Accounts |
| `CONTENT_ADMIN` | Blog, FAQ, Legal, Notifications |

## Route Map (21 Routes)

### Auth (`/`)
| Route | File | Description |
|---|---|---|
| `/` | `page.tsx` | Redirects to `/dashboard` |
| `/login` | `(auth)/login/page.tsx` | Admin login form |

### Dashboard (`(dashboard)/`)
| Route | File | Description |
|---|---|---|
| `/dashboard` | `dashboard/page.tsx` | 8 KPI cards + recent audit trail |
| `/users` | `users/page.tsx` | User list with role/status filters |
| `/users/[id]` | `users/[id]/page.tsx` | User detail: profile, orders, accounts, suspend action |
| `/plans` | `plans/page.tsx` | Challenge plans list |
| `/plans/[id]` | `plans/[id]/page.tsx` | Plan detail with variant table |
| `/rules` | `rules/page.tsx` | Rule set cards with permission grid |
| `/orders` | `orders/page.tsx` | Order table with status filter |
| `/payments` | `payments/page.tsx` | Payment table with provider/status filters |
| `/coupons` | `coupons/page.tsx` | Coupon management with usage stats |
| `/accounts` | `accounts/page.tsx` | Trader accounts with balance/phase display |
| `/kyc` | `kyc/page.tsx` | KYC review queue — approve/reject with modals |
| `/payouts` | `payouts/page.tsx` | Payout approval queue — approve/reject with modals |
| `/affiliates` | `affiliates/page.tsx` | Affiliate accounts, conversions, commission payouts |
| `/tickets` | `tickets/page.tsx` | Ticket queue with threaded messages, reply + internal notes |
| `/content/blog` | `content/blog/page.tsx` | Blog CMS — post list with category/status |
| `/content/faq` | `content/faq/page.tsx` | FAQ manager with publish toggle |
| `/content/legal` | `content/legal/page.tsx` | Legal document versions |
| `/restrictions` | `restrictions/page.tsx` | Geo-blocking + platform feature toggles |
| `/settings` | `settings/page.tsx` | System key-value settings editor |
| `/audit-logs` | `audit-logs/page.tsx` | Full audit log table with before/after diffs |
| `/notifications` | `notifications/page.tsx` | Notification history with delivery status |

## Component Inventory

### Layout (`components/layout/`)
| Component | Purpose |
|---|---|
| `sidebar.tsx` | 19 nav items, 6 groups, role-filtered, collapsible |
| `header.tsx` | Sticky header with notification bell + user dropdown |
| `admin-shell.tsx` | Sidebar + Header + main content wrapper |

### UI (`components/ui/`)
| Component | Purpose |
|---|---|
| `data-table.tsx` | Generic `DataTable<T>` with typed columns, row click, empty state |
| `stat-card.tsx` | KPI card with variant colors and trends |
| `status-badge.tsx` | Maps 30+ status enums → colored badges |
| `page-header.tsx` | Title + description + action slot |
| `confirm-modal.tsx` | Radix Dialog — approve/reject with optional notes |
| `shared.tsx` | LoadingState, ErrorState, EmptyState, Pagination |
| `filter-bar.tsx` | Search + filter select dropdowns |
| `audit-trail.tsx` | Audit log display for sensitive modules |

## Data Architecture

### Mock Layer (`lib/mock-data.ts`)
- Comprehensive typed mock data for all 20 modules
- Realistic IDs, dates, relationships, and edge cases
- Helper: `d(daysAgo)` for relative date generation

### API Client (`lib/api-client.ts`)
- 30+ async functions wrapping mock data
- `ok<T>()` helper returns `ApiResponse<T>`
- `paginate<T>()` helper for list endpoints
- `delay()` simulates network latency
- **Swap strategy**: Replace function bodies with `fetch()` calls — zero page changes needed

## Design System Tokens

```css
--color-bg: #05070e          /* Page background */
--color-bg-surface: #0b0f1a  /* Card/panel background */
--color-border: #1e293b      /* Borders */
--color-text: #e2e8f0        /* Primary text */
--color-text-muted: #64748b  /* Secondary text */
--color-brand: #10b981       /* Primary actions — emerald */
--color-brand-muted: rgba(16,185,129,0.12)
--color-danger: #ef4444      /* Destructive actions */
--color-warning: #f59e0b     /* Warnings */
--color-info: #3b82f6        /* Info indicators */
```

## Page Patterns

Every dashboard page follows this structure:

```tsx
"use client";
// 1. Imports (api-client, types, components)
// 2. State: data, loading, error, page, filters
// 3. load() function calling API client
// 4. useEffect → load() on page/filter change
// 5. Early returns: LoadingState → ErrorState
// 6. Column definitions with typed render functions
// 7. JSX: PageHeader → FilterBar → DataTable → Pagination
```

### Sensitive Modules (KYC, Payouts, User Detail)
- Add `ConfirmModal` for approve/reject actions
- Include `AuditTrail` component at page bottom
- Require reason notes for rejection (`noteRequired`)

## Sidebar Navigation Groups

1. **Overview**: Dashboard
2. **Operations**: Users, Accounts, Orders, Payments
3. **Commerce**: Plans, Rules, Coupons, Affiliates
4. **Compliance**: KYC, Payouts
5. **Engagement**: Tickets, Notifications
6. **Content**: Blog, FAQ, Legal
7. **System**: Restrictions, Settings, Audit Logs
