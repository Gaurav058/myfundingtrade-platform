# QA Checklist — MyFundingTrade Platform

> Generated during integration phase. Every item should be manually verified before launch.

---

## 1. Authentication & Authorization

### Portal Auth
- [ ] Register new account — form validates, API returns success, redirect to login
- [ ] Login with valid credentials — receives JWT, lands on `/dashboard`
- [ ] Login with invalid credentials — shows error, no redirect
- [ ] Session refresh — close and reopen tab, session auto-restores via refresh cookie
- [ ] Logout — clears token, redirects to `/login`
- [ ] Forgot password — sends reset email (verify Resend integration)
- [ ] Access dashboard without login — middleware redirects to `/login?redirect=…`
- [ ] Refresh token expiry (7d) — after expiry, auto-redirect to login

### Admin Auth
- [ ] Admin login with valid admin credentials — lands on `/dashboard`
- [ ] Admin login with trader-role user — rejected ("Insufficient privileges")
- [ ] Admin session restoration — same refresh-cookie pattern as portal
- [ ] Role-based nav visibility — SUPER_ADMIN sees all; KYC_REVIEWER sees KYC only
- [ ] Access admin routes without login — middleware redirects to `/login`

---

## 2. Public Website (apps/web)

- [ ] Homepage loads — hero, stats, features, testimonials, CTA
- [ ] Challenge page — fetches plans from API, shows pricing cards (fallback to static data if API down)
- [ ] Blog index — fetches from `/api/v1/blog`, pagination works
- [ ] Blog detail — `/blog/[slug]` renders full article with ISR
- [ ] FAQ page — fetches from `/api/v1/faq`, accordion works
- [ ] About, How It Works, Affiliate, Contact — static pages render
- [ ] Legal pages (Terms, Privacy, Refund, Disclaimer) — render correctly
- [ ] SEO — sitemap.xml, robots.txt, meta tags present
- [ ] RSS feed — `/feed.xml` returns valid XML

---

## 3. Trader Portal — Dashboard

### Main Dashboard
- [ ] KPI cards load (total balance, P&L, accounts, payouts)
- [ ] Active accounts list shows
- [ ] Recent notifications display
- [ ] Loading state renders spinner, error state offers retry

### Accounts
- [ ] Accounts list loads from API
- [ ] Account detail shows phases, P&L, drawdown metrics
- [ ] Empty state shown when no accounts

### Challenge Purchase Flow
- [ ] Challenge plans load from API (not hardcoded)
- [ ] Select variant → variant highlighted
- [ ] Enter coupon code (optional)
- [ ] Check terms + risk disclaimer checkboxes
- [ ] Click "Proceed to Checkout" → order created → Stripe checkout URL opened
- [ ] Stripe success callback → `/dashboard/checkout/success` page
- [ ] Stripe cancel callback → `/dashboard/checkout/cancel` page
- [ ] Region restriction notice shows for blocked countries
- [ ] Legal consent documents fetched from API (not hardcoded IDs)

### KYC Verification
- [ ] Shows current KYC status (NOT_STARTED / UNDER_REVIEW / APPROVED / REJECTED)
- [ ] Upload ID document (file upload via FormData)
- [ ] Upload address proof
- [ ] Submit triggers API call, status changes to UNDER_REVIEW
- [ ] Rejected status shows reason and allows resubmission

### Payouts
- [ ] Payout history loads from API
- [ ] Payout methods load from API
- [ ] "Request Payout" button opens modal
- [ ] Modal shows funded accounts dropdown, amount input, method selector
- [ ] Submit calls `POST /payouts/request`
- [ ] Toast confirms submission
- [ ] Pending payouts show correct status badges

### Affiliate Dashboard
- [ ] Affiliate account info loads (code, commission rate, balance)
- [ ] Referral link copy-to-clipboard works
- [ ] Conversions tab shows data
- [ ] Clicks tab shows data
- [ ] Payouts tab shows commission payouts
- [ ] "Request Payout" works with loading state
- [ ] Disabled if balance insufficient

### Support Tickets
- [ ] Ticket list loads from API
- [ ] Create new ticket — subject, category, body
- [ ] View ticket messages (thread)
- [ ] Reply to ticket
- [ ] Category options: GENERAL, ACCOUNT, BILLING, TECHNICAL, KYC, PAYOUT

### Profile
- [ ] Profile data loads from `/auth/me`
- [ ] Edit form saves via `PATCH /profiles/me`
- [ ] Toast shows success/error feedback

### Notifications
- [ ] Notification list loads
- [ ] Mark single notification as read
- [ ] Mark all as read

### Legal Consents
- [ ] Pending consent documents listed
- [ ] Bulk consent recording works

---

## 4. Admin Panel

### Dashboard
- [ ] KPI cards load (users, accounts, KYC pending, payouts, tickets, revenue, affiliates, orders)
- [ ] Recent audit activity loads from `/admin/activity`

### User Management
- [ ] Users list loads with pagination
- [ ] User detail page loads user + related orders + accounts + audit history
- [ ] Suspend/activate user actions

### Challenge Plans
- [ ] Plans list loads with variant counts (from API `variants` relation)
- [ ] Plan detail page for editing

### Orders & Payments
- [ ] Orders list loads from `/orders/admin/list`
- [ ] Payments list loads from `/payments/admin/list`
- [ ] Refund payment action

### Coupons
- [ ] Coupons list loads

### Trader Accounts
- [ ] Accounts list loads from `/trader-accounts/admin`
- [ ] Status badges render correctly (ACTIVE, FUNDED, BREACHED, CLOSED)

### KYC Admin
- [ ] KYC submissions list loads with pagination
- [ ] View submission detail (name, DOB, nationality, document info)
- [ ] Approve KYC with note
- [ ] Reject KYC with required reason
- [ ] Audit trail shows KYC-related logs

### Payout Approvals
- [ ] Payout requests load with pagination
- [ ] Approve payout with note
- [ ] Reject payout with required reason
- [ ] Audit trail shows payout-related logs

### Affiliate Management
- [ ] Affiliate accounts list loads
- [ ] View conversions, clicks, payouts per affiliate
- [ ] Fraud signals load from `/affiliates/admin/fraud-signals`
- [ ] Review conversion (approve/reject)
- [ ] Review commission payout
- [ ] Update affiliate status / commission rate

### Support Admin
- [ ] Tickets list loads from `/tickets/admin`
- [ ] Admin reply (public or internal note)
- [ ] Update ticket status

### Content Management
- [ ] Blog posts list + create + edit + delete
- [ ] Blog categories CRUD
- [ ] FAQ list + create + edit + delete
- [ ] Legal documents list + create + edit + delete

### Restrictions
- [ ] Geo restrictions load
- [ ] Platform restrictions load

### Notifications Admin
- [ ] Admin notification list loads

### Audit Logs
- [ ] Full audit log page with pagination

### System Settings
- [ ] Settings key-value pairs load
- [ ] Update setting

---

## 5. API Backend (apps/api)

### Health & Infrastructure
- [ ] `GET /api/v1/health` returns 200
- [ ] Rate limiting active (ThrottlerGuard)
- [ ] JWT auth guard active on protected routes
- [ ] `@Public()` routes accessible without auth
- [ ] CORS configured for portal/admin/web origins
- [ ] Redis connection healthy (for token invalidation + BullMQ)

### Webhook Security
- [ ] Stripe webhook signature verification
- [ ] Webhook idempotency (replay protection)

---

## 6. Cross-Cutting Concerns

### Loading & Error States
- [ ] Every data-fetching page shows loading spinner/skeleton
- [ ] Every data-fetching page shows error state with retry button
- [ ] Empty states shown where appropriate (no accounts, no tickets, etc.)

### Toast Notifications
- [ ] ToastProvider mounted in both portal and admin root layouts
- [ ] Success toasts on: profile save, payout request, ticket create
- [ ] Error toasts on: API failures for mutations

### Middleware
- [ ] Portal: unauthenticated users redirected to `/login`
- [ ] Portal: public paths `/login`, `/register`, `/forgot-password` accessible
- [ ] Admin: unauthenticated users redirected to `/login`
- [ ] Admin: only `/login` is public

### Type Safety
- [ ] Full monorepo build passes: `pnpm turbo build` — 0 errors
- [ ] Shared types package used across all apps

---

## 7. External Dependencies (Require Credentials)

| Dependency | Purpose | Required For |
|---|---|---|
| PostgreSQL | Primary database | All |
| Redis | Token invalidation, BullMQ queues | Auth, notifications |
| Stripe | Payment processing | Challenge purchases, refunds |
| Resend | Transactional email | Auth emails, notifications |
| S3/Storage | KYC document uploads | KYC flow |

---

## 8. Browser Testing Matrix

- [ ] Chrome (latest) — all flows
- [ ] Firefox (latest) — login + dashboard
- [ ] Safari (latest) — login + dashboard
- [ ] Mobile Chrome (Android) — responsive layout check
- [ ] Mobile Safari (iOS) — responsive layout check
