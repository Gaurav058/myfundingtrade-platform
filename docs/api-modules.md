# API Modules & Routes Reference

> Auto-generated reference for the MyFundingTrade NestJS backend API.
> Base URL: `/api/v1` — Swagger UI at `/api/docs`

---

## Architecture

| Layer | Technology |
|-------|-----------|
| Framework | NestJS 10 |
| ORM | Prisma 6 |
| Database | PostgreSQL 16 |
| Cache / Token Blacklist | Redis 7 (ioredis) |
| Job Queue | BullMQ (5 queues: email, notifications, evaluation, payouts, audit) |
| Auth | JWT access (15 min) + refresh (7 days) with family-based rotation |
| RBAC | 7 roles — TRADER, AFFILIATE, SUPPORT_AGENT, KYC_REVIEWER, FINANCE_ADMIN, CONTENT_ADMIN, SUPER_ADMIN |

### Global Middleware

- **JwtAuthGuard** — applied globally; skip with `@Public()`
- **RolesGuard** — enforced when `@Roles()` is present
- **ThrottlerGuard** — 100 req / 60s
- **TransformInterceptor** — wraps all responses in `{ success, data, meta }`
- **AllExceptionsFilter** — consistent error shape `{ success, error, message, statusCode, path, timestamp }`

---

## Module Index

| # | Module | Prefix | Auth |
|---|--------|--------|------|
| 1 | Health | `/health` | Public |
| 2 | Auth | `/auth` | Mixed |
| 3 | Users | `/users` | Admin |
| 4 | Profiles | `/profiles` | Authenticated |
| 5 | Challenge Plans | `/challenge-plans` | Public |
| 6 | Rules | `/rules` | Admin |
| 7 | Orders | `/orders` | Authenticated / Admin |
| 8 | Payments | `/payments` | Authenticated |
| 9 | Coupons | `/coupons` | Mixed |
| 10 | Trader Accounts | `/trader-accounts` | Authenticated / Admin |
| 11 | KYC | `/kyc` | Authenticated / Admin |
| 12 | Payouts | `/payouts` | Authenticated / Admin |
| 13 | Affiliates | `/affiliates` | Authenticated / Admin |
| 14 | Tickets | `/tickets` | Authenticated / Admin |
| 15 | Notifications | `/notifications` | Authenticated |
| 16 | Blog | `/blog` | Mixed |
| 17 | FAQ | `/faq` | Mixed |
| 18 | Newsletter | `/newsletter` | Mixed |
| 19 | Legal | `/legal` | Mixed |
| 20 | Restrictions | `/restrictions` | Mixed |
| 21 | Admin | `/admin` | Admin |
| 22 | Analytics | `/analytics` | Admin |
| 23 | System Settings | `/system-settings` | Mixed |
| 24 | Audit | `/audit` | Admin |

---

## Route Details

### 1. Health (`/health`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | Public | Health check |

### 2. Auth (`/auth`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | Public | Create account |
| POST | `/auth/login` | Public | Login, returns access + refresh tokens |
| POST | `/auth/refresh` | Public | Rotate refresh token |
| POST | `/auth/logout` | Bearer | Blacklist tokens |
| GET | `/auth/me` | Bearer | Current user info |

### 3. Users (`/users`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/users` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | List users (paginated, filterable) |
| GET | `/users/:id` | Bearer | SUPER_ADMIN, FINANCE_ADMIN, SUPPORT_AGENT | Get user by ID |
| PATCH | `/users/:id/status` | Bearer | SUPER_ADMIN | Update user status |
| DELETE | `/users/:id` | Bearer | SUPER_ADMIN | Soft-delete user |

### 4. Profiles (`/profiles`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/profiles/me` | Bearer | Get own profile |
| PATCH | `/profiles/me` | Bearer | Update own profile |

### 5. Challenge Plans (`/challenge-plans`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/challenge-plans` | Public | List all active plans with variants |
| GET | `/challenge-plans/:slug` | Public | Get plan by slug |
| GET | `/challenge-plans/variants/:id` | Public | Get variant by ID |

### 6. Rules (`/rules`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/rules` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | List rule sets |
| GET | `/rules/:id` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | Get rule set |
| POST | `/rules` | Bearer | SUPER_ADMIN | Create rule set |
| PATCH | `/rules/:id` | Bearer | SUPER_ADMIN | Update rule set |
| DELETE | `/rules/:id` | Bearer | SUPER_ADMIN | Delete rule set |

### 7. Orders (`/orders`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| POST | `/orders` | Bearer | — | Create order |
| GET | `/orders` | Bearer | — | List own orders |
| GET | `/orders/:id` | Bearer | — | Get order by ID |
| GET | `/orders/admin` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | List all orders |

### 8. Payments (`/payments`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/payments/initiate` | Bearer | Create payment for order |
| POST | `/payments/:id/confirm` | Bearer | Confirm payment |
| GET | `/payments/order/:orderId` | Bearer | Get payments for order |

### 9. Coupons (`/coupons`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/coupons/validate/:code` | Public | — | Validate coupon code |
| GET | `/coupons` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | List all coupons |
| POST | `/coupons` | Bearer | SUPER_ADMIN | Create coupon |
| PATCH | `/coupons/:id` | Bearer | SUPER_ADMIN | Update coupon |

### 10. Trader Accounts (`/trader-accounts`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/trader-accounts` | Bearer | — | List own accounts |
| GET | `/trader-accounts/admin` | Bearer | SUPER_ADMIN, FINANCE_ADMIN, SUPPORT_AGENT | List all accounts |
| GET | `/trader-accounts/:id` | Bearer | — | Get account details |
| GET | `/trader-accounts/:id/status` | Bearer | — | Get account status/phase |

### 11. KYC (`/kyc`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| POST | `/kyc/submit` | Bearer | — | Submit KYC documents |
| GET | `/kyc/status` | Bearer | — | Get own KYC status |
| GET | `/kyc/admin` | Bearer | SUPER_ADMIN, KYC_REVIEWER | List KYC submissions |
| POST | `/kyc/:id/review` | Bearer | SUPER_ADMIN, KYC_REVIEWER | Review KYC submission |

### 12. Payouts (`/payouts`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| POST | `/payouts/request` | Bearer | — | Request payout |
| GET | `/payouts` | Bearer | — | List own payouts |
| GET | `/payouts/admin` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | List all payouts |
| POST | `/payouts/:id/review` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | Review payout |

### 13. Affiliates (`/affiliates`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| POST | `/affiliates/link` | Bearer | — | Get or create affiliate link |
| GET | `/affiliates/dashboard` | Bearer | — | Affiliate dashboard stats |
| GET | `/affiliates/conversions` | Bearer | — | List own conversions |
| GET | `/affiliates/admin` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | List all affiliates |
| PATCH | `/affiliates/admin/:id/rate` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | Update commission rate |

### 14. Tickets (`/tickets`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| POST | `/tickets` | Bearer | — | Create support ticket |
| GET | `/tickets` | Bearer | — | List own tickets |
| GET | `/tickets/admin` | Bearer | SUPER_ADMIN, SUPPORT_AGENT | List all tickets |
| GET | `/tickets/:id` | Bearer | — | Get ticket with messages |
| POST | `/tickets/:id/reply` | Bearer | — | Reply to ticket (user) |
| POST | `/tickets/:id/admin-reply` | Bearer | SUPER_ADMIN, SUPPORT_AGENT | Reply to ticket (agent) |
| PATCH | `/tickets/:id/status` | Bearer | SUPER_ADMIN, SUPPORT_AGENT | Update ticket status |

### 15. Notifications (`/notifications`)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/notifications` | Bearer | List notifications (includes unread count) |
| PATCH | `/notifications/:id/read` | Bearer | Mark notification as read |
| PATCH | `/notifications/read-all` | Bearer | Mark all as read |

### 16. Blog (`/blog`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/blog` | Public | — | List published posts |
| GET | `/blog/:slug` | Public | — | Get post by slug |
| GET | `/blog/admin/all` | Bearer | SUPER_ADMIN, CONTENT_ADMIN | List all posts |
| POST | `/blog` | Bearer | SUPER_ADMIN, CONTENT_ADMIN | Create post |
| PATCH | `/blog/:id` | Bearer | SUPER_ADMIN, CONTENT_ADMIN | Update post |
| DELETE | `/blog/:id` | Bearer | SUPER_ADMIN, CONTENT_ADMIN | Soft-delete post |

### 17. FAQ (`/faq`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/faq` | Public | — | List published FAQs |
| GET | `/faq/categories` | Public | — | List FAQ categories |
| GET | `/faq/admin` | Bearer | SUPER_ADMIN, CONTENT_ADMIN | List all FAQs |
| POST | `/faq` | Bearer | SUPER_ADMIN, CONTENT_ADMIN | Create FAQ |
| PATCH | `/faq/:id` | Bearer | SUPER_ADMIN, CONTENT_ADMIN | Update FAQ |
| DELETE | `/faq/:id` | Bearer | SUPER_ADMIN, CONTENT_ADMIN | Delete FAQ |

### 18. Newsletter (`/newsletter`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| POST | `/newsletter/subscribe` | Public | — | Subscribe |
| POST | `/newsletter/unsubscribe` | Public | — | Unsubscribe |
| GET | `/newsletter/admin` | Bearer | SUPER_ADMIN, CONTENT_ADMIN | List subscribers |

### 19. Legal (`/legal`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/legal` | Public | — | List active legal docs |
| GET | `/legal/:type` | Public | — | Get latest doc by type |
| GET | `/legal/admin/all` | Bearer | SUPER_ADMIN, CONTENT_ADMIN | List all docs |
| POST | `/legal` | Bearer | SUPER_ADMIN, CONTENT_ADMIN | Create doc |
| PATCH | `/legal/:id` | Bearer | SUPER_ADMIN, CONTENT_ADMIN | Update doc |
| DELETE | `/legal/:id` | Bearer | SUPER_ADMIN | Delete doc |

### 20. Restrictions (`/restrictions`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/restrictions/countries` | Public | — | List restricted countries |
| GET | `/restrictions/countries/:code/check` | Public | — | Check country |
| GET | `/restrictions/admin/countries` | Bearer | SUPER_ADMIN | List all restrictions |
| POST | `/restrictions/admin/countries` | Bearer | SUPER_ADMIN | Upsert restriction |
| DELETE | `/restrictions/admin/countries/:code` | Bearer | SUPER_ADMIN | Remove restriction |

### 21. Admin (`/admin`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/admin/dashboard` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | Dashboard stats |
| GET | `/admin/activity` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | Recent activity |

### 22. Analytics (`/analytics`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/analytics/revenue` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | Revenue stats |
| GET | `/analytics/users` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | User growth |
| GET | `/analytics/challenges` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | Challenge stats |
| GET | `/analytics/payouts` | Bearer | SUPER_ADMIN, FINANCE_ADMIN | Payout stats |

### 23. System Settings (`/system-settings`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/system-settings/public` | Public | — | Public settings |
| GET | `/system-settings` | Bearer | SUPER_ADMIN | All settings |
| GET | `/system-settings/:key` | Bearer | SUPER_ADMIN | Get setting by key |
| POST | `/system-settings` | Bearer | SUPER_ADMIN | Upsert setting |
| DELETE | `/system-settings/:key` | Bearer | SUPER_ADMIN | Delete setting |

### 24. Audit (`/audit`)
| Method | Route | Auth | Roles | Description |
|--------|-------|------|-------|-------------|
| GET | `/audit` | Bearer | SUPER_ADMIN | List audit logs (filterable) |
| GET | `/audit/actions` | Bearer | SUPER_ADMIN | List distinct actions |
| GET | `/audit/resources` | Bearer | SUPER_ADMIN | List distinct resources |

---

## BullMQ Queues

| Queue | Purpose |
|-------|---------|
| `email` | Transactional emails (welcome, password reset, notifications) |
| `notifications` | Push/in-app notification dispatch |
| `evaluation` | Trader account phase evaluation processing |
| `payouts` | Payout processing pipeline |
| `audit` | Async audit log writing |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `REDIS_URL` | Yes | — | Redis connection string |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `JWT_EXPIRES_IN` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `API_PORT` | No | `4000` | Server port |
| `API_HOST` | No | `0.0.0.0` | Server host |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | CORS origin |
| `NEXT_PUBLIC_PORTAL_URL` | No | `http://localhost:3001` | CORS origin |
| `NEXT_PUBLIC_ADMIN_URL` | No | `http://localhost:3002` | CORS origin |
