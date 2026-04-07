# Portal Pages — MyFundingTrade Trader Portal

> `apps/portal` — Next.js 15 App Router · Port 3001

## Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root layout (dark theme, fonts)
│   ├── page.tsx                # Redirect → /dashboard
│   ├── globals.css             # Design system (@theme tokens)
│   ├── (auth)/                 # Auth route group (centered layout)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   └── (dashboard)/            # Dashboard route group (shell layout)
│       ├── layout.tsx
│       └── dashboard/
│           ├── page.tsx                      # KPI overview
│           ├── challenges/page.tsx           # Purchase history + active challenges
│           ├── challenges/[id]/page.tsx      # Challenge detail + phase timeline
│           ├── accounts/page.tsx             # Account list
│           ├── accounts/[id]/page.tsx        # Account detail + phase progress
│           ├── kyc/page.tsx                  # KYC status + upload
│           ├── payouts/page.tsx              # Payout methods + history + request
│           ├── affiliate/page.tsx            # Referral link + stats + conversions
│           ├── support/page.tsx              # Ticket list + chat + create
│           ├── notifications/page.tsx        # Notification feed + mark read
│           ├── profile/page.tsx              # Profile form + account settings
│           └── legal/page.tsx                # Legal documents + consent history
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx          # Collapsible desktop sidebar (10 nav items)
│   │   ├── mobile-sidebar.tsx   # Mobile sidebar (Radix Dialog drawer)
│   │   ├── header.tsx           # Top bar (notifications bell, user dropdown)
│   │   └── dashboard-shell.tsx  # Sidebar + Header + main content wrapper
│   └── ui/
│       ├── stat-card.tsx        # KPI card (icon, value, label, trend)
│       ├── status-badge.tsx     # Maps 30+ enum statuses → colored badges
│       ├── empty-state.tsx      # Empty state (icon, title, description, action)
│       ├── loading-state.tsx    # Skeleton cards, rows, full-page loading
│       ├── error-state.tsx      # Error state with retry button
│       ├── progress-bar.tsx     # Progress bar (brand/danger/warning/info)
│       └── file-upload.tsx      # Drag & drop file upload for KYC
└── lib/
    ├── mock-data.ts             # Comprehensive typed mock data
    └── api-client.ts            # API adapter layer (mock → real swap)
```

## Routes (15)

| Route | Auth | Description |
|-------|------|-------------|
| `/` | — | Redirects to `/dashboard` |
| `/login` | Public | Email + password sign in |
| `/register` | Public | Account creation form |
| `/forgot-password` | Public | Password reset request |
| `/dashboard` | Protected | KPI cards, accounts overview, recent notifications |
| `/dashboard/challenges` | Protected | Purchase history, active challenges grid |
| `/dashboard/challenges/[id]` | Protected | Challenge detail, phase timeline with progress |
| `/dashboard/accounts` | Protected | Account list with balance & status |
| `/dashboard/accounts/[id]` | Protected | Account stats, evaluation phases with progress bars |
| `/dashboard/kyc` | Protected | KYC status display, document upload form |
| `/dashboard/payouts` | Protected | Payout summary, methods, history, request flow |
| `/dashboard/affiliate` | Protected | Referral link, stats, conversion history |
| `/dashboard/support` | Protected | Ticket list, message thread, create ticket |
| `/dashboard/notifications` | Protected | Notification feed, mark read, mark all read |
| `/dashboard/profile` | Protected | Personal info form, password, 2FA, delete account |
| `/dashboard/legal` | Protected | Legal documents, consent history with IP/date |

## Design System

- **Background**: `#06080f` (bg) → `#0c1020` (surface) → `#111631` (hover) → `#151a30` (elevated)
- **Border**: `#1a1f36`
- **Brand**: `#22c55e` (green) — primary actions, active states, success
- **Danger**: `#ef4444` — errors, destructive actions, loss indicators
- **Warning**: `#f59e0b` — pending states, approaching limits
- **Info**: `#3b82f6` — processing, neutral info states
- **Fonts**: Inter (sans), JetBrains Mono (mono)

## State Patterns

Every page implements three states via shared components:

1. **Loading** → `<LoadingPage />`, `<LoadingCards />`, `<LoadingRows />` (skeleton pulses)
2. **Error** → `<ErrorState onRetry={load} />` (AlertTriangle + retry button)
3. **Empty** → `<EmptyState icon title description action />` (contextual per section)

## Mock API Adapter

`src/lib/api-client.ts` exports typed async functions with simulated delay:

```ts
getMe()                          → UserWithProfile
getAccounts()                    → TraderAccount[]
getAccount(id)                   → TraderAccount
getAccountPhases(accountId)      → TraderAccountPhase[]
getKycStatus()                   → KycSubmission
submitKyc(formData)              → KycSubmission
getPayouts()                     → PayoutRequest[]
getPayoutMethods()               → PayoutMethod[]
requestPayout(data)              → { id, status }
getAffiliateAccount()            → AffiliateAccount
getAffiliateConversions()        → AffiliateConversion[]
getTickets()                     → SupportTicket[]
getTicketMessages(ticketId)      → SupportMessage[]
createTicket(data)               → { id, ticketNumber, status }
replyToTicket(ticketId, body)    → { id }
getNotifications()               → Notification[]
markNotificationRead(id)         → { id, readAt }
getLegalDocuments()               → LegalDocument[]
getLegalConsents()                → LegalConsent[]
getDashboardKpis()               → DashboardKpis
login(email, password)           → AuthTokens
register(data)                   → AuthTokens
forgotPassword(email)            → { message }
updateProfile(data)              → UserWithProfile
```

Swap to real HTTP calls by replacing the mock-data imports with fetch/axios calls.

## Dependencies

- `framer-motion` — animations
- `lucide-react` — icons (18px sidebar, 20px everywhere else)
- `@radix-ui/react-dialog` — mobile sidebar drawer
- `@radix-ui/react-dropdown-menu` — user menu
- `@radix-ui/react-avatar` — user avatar
- `@radix-ui/react-progress` — available for future use
- `@radix-ui/react-tabs` — available for future use
- `@radix-ui/react-tooltip` — available for future use
- `@radix-ui/react-select` — available for future use
- `@radix-ui/react-separator` — available for future use
- `@myfundingtrade/ui` — Button, Input, Card, Badge, cn
- `@myfundingtrade/types` — 40+ domain interfaces, 25+ enums
- `@myfundingtrade/utils` — formatCurrency
