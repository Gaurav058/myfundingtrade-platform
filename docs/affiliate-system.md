# Affiliate / Referral System

## Overview

The affiliate system enables users to earn commissions by referring new traders to MyFundingTrade. It covers the entire lifecycle: unique referral links, click tracking, attribution, conversion mapping, commission payouts, anti-fraud controls, and admin monitoring.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Marketing   │────▶│  Click Track  │────▶│  Set Cookie      │
│  Website     │     │  POST /track  │     │  (affiliateCode) │
└──────────────┘     └──────────────┘     └──────────────────┘
                                                   │
                                                   ▼
                     ┌──────────────┐     ┌──────────────────┐
                     │  Checkout    │────▶│  Create Order     │
                     │  (Portal)    │     │  w/ affiliateCode │
                     └──────────────┘     └──────────────────┘
                                                   │
                                                   ▼
                     ┌──────────────┐     ┌──────────────────┐
                     │  Payment OK  │────▶│  Create Affiliate │
                     │  (Stripe/etc)│     │  Conversion       │
                     └──────────────┘     └──────────────────┘
```

## Database Models

### AffiliateAccount
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | FK → User (unique) |
| affiliateCode | string | Unique 12-char code (e.g. `JAMES85`) |
| status | enum | PENDING, ACTIVE, SUSPENDED, TERMINATED |
| commissionRate | decimal | Percentage (0–100), default 10% |
| tier | int | Future: tiered commission support |
| totalEarnings | decimal | Lifetime earnings |
| totalPaid | decimal | Amount already paid out |
| pendingBalance | decimal | Available for payout |

### AffiliateClick
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| affiliateId | UUID | FK → AffiliateAccount |
| ipAddress | string | Visitor IP (indexed for fraud) |
| userAgent | string? | Browser user-agent |
| referrerUrl | string? | HTTP referrer |
| landingUrl | string? | Landing page URL |
| utmSource/Medium/Campaign | string? | UTM tracking params |
| fingerprint | string? | Browser fingerprint for fraud detection |
| country | string? | 2-letter ISO code (geo lookup) |

### AffiliateConversion
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| affiliateId | UUID | FK → AffiliateAccount |
| orderId | UUID | FK → Order (unique — one conversion per order) |
| orderAmount | decimal | Order total at time of conversion |
| commissionRate | decimal | Rate snapshot at conversion time |
| commissionAmount | decimal | Calculated commission |
| status | enum | PENDING → CONFIRMED → PAID (or REJECTED) |
| rejectedReason | string? | Why admin rejected |

### CommissionPayout
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| affiliateId | UUID | FK → AffiliateAccount |
| amount | decimal | Payout amount |
| status | enum | PENDING → APPROVED → PROCESSING → COMPLETED (or REJECTED) |
| payoutMethod | string? | e.g. BANK_WIRE, CRYPTO |
| transactionRef | string? | External reference |

## API Endpoints

### Public (no auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/affiliates/track` | Record a click. Body: `{ code, referrerUrl?, landingUrl?, utmSource?, utmMedium?, utmCampaign?, fingerprint? }`. Returns `{ affiliateId, affiliateCode, clickId, attributionWindowDays }` |

### Authenticated Trader
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/affiliates/link` | Enroll / get affiliate account |
| GET | `/affiliates/dashboard` | Dashboard with click + conversion stats |
| GET | `/affiliates/clicks` | Paginated click history |
| GET | `/affiliates/conversions` | Paginated conversion history |
| POST | `/affiliates/payouts` | Request commission payout |
| GET | `/affiliates/payouts` | Paginated payout history |

### Admin (SUPER_ADMIN / FINANCE_ADMIN)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/affiliates/admin` | List all affiliates (filter by status) |
| GET | `/affiliates/admin/:id` | Affiliate detail + fraud signals |
| PATCH | `/affiliates/admin/:id/status` | Update status (ACTIVE/SUSPENDED/TERMINATED) |
| PATCH | `/affiliates/admin/:id/rate` | Update commission rate |
| GET | `/affiliates/admin/conversions` | All conversions (filter by status) |
| PATCH | `/affiliates/admin/conversions/:id` | Confirm or reject conversion |
| GET | `/affiliates/admin/payouts` | All payout requests (filter by status) |
| PATCH | `/affiliates/admin/payouts/:id` | Approve/reject/complete payout |
| GET | `/affiliates/admin/fraud-signals` | Fraud signals for all or specific affiliate |

## Attribution Flow

1. **Click Tracking**: Visitor clicks `?ref=CODE` → frontend calls `POST /affiliates/track` → returns `clickId` + `affiliateCode`
2. **Cookie Storage**: Frontend stores `affiliateCode` in cookie (30-day TTL = attribution window)
3. **Order Creation**: At checkout, frontend sends `affiliateCode` via `CreateOrderDto` → orders service looks up affiliate, verifies ACTIVE + not self-referral, sets `affiliateId` on order
4. **Payment Confirmation**: When payment succeeds → payments service creates `AffiliateConversion` with PENDING status, increments affiliate `totalEarnings` + `pendingBalance`
5. **Admin Review**: Admin can CONFIRM (marks eligible for payout) or REJECT (reverses balance)
6. **Payout**: Affiliate requests payout → admin approves → processes → completes

## Anti-Fraud Controls

### Self-Referral Detection
- At order creation: `affiliate.userId !== order.userId` check
- At conversion: same check in payments service
- Admin signal: flags any conversions where buyer == affiliate owner

### IP Anomaly Detection
- Clicks grouped by IP per day
- Threshold: 10 clicks per IP per day (configurable via `MAX_CLICKS_PER_IP_PER_DAY`)
- Flagged in admin fraud signals panel

### Device Fingerprint Analysis
- Browser fingerprints tracked per click
- Repeated fingerprints flagged same as IP anomalies

### Click Spike Detection
- Compares last 24h click volume to 7-day daily average
- Flags if current volume exceeds 3× the rolling average

### Zero Conversion Detection
- Flags affiliates with 100+ clicks in 30 days but 0 conversions
- Indicator of potential click fraud

## Business Constants

| Constant | Value | Location |
|----------|-------|----------|
| `ATTRIBUTION_WINDOW_DAYS` | 30 | `packages/business-rules/src/constants.ts` |
| `MAX_CLICKS_PER_IP_PER_DAY` | 10 | `packages/business-rules/src/constants.ts` |
| `DEFAULT_AFFILIATE_COMMISSION_RATE` | 10% | `packages/business-rules/src/constants.ts` |
| `AFFILIATE_PAYOUT_COOLDOWN_DAYS` | 30 | `packages/business-rules/src/constants.ts` |
| `AFFILIATE_MIN_CONVERSIONS_FOR_PAYOUT` | 1 | `packages/business-rules/src/constants.ts` |

## Future Extensibility

### Tiered Commissions
- `tier` field exists on AffiliateAccount
- Implement tier-based rate lookup table (Tier 1 = 10%, Tier 2 = 15%, etc.)
- Auto-promote based on lifetime conversion count

### Coupon-Linked Campaigns
- `Coupon` model already has optional `affiliateId` FK
- Link coupons to specific affiliates for campaign tracking
- Auto-attribute conversions when affiliate's coupon is used

### Affiliate Leaderboard
- Aggregate totalEarnings, conversion counts per month
- Add public/internal leaderboard endpoint
- Gamification with badges/milestones

## Key Files

| File | Purpose |
|------|---------|
| `apps/api/src/affiliates/affiliates.service.ts` | Core service (click tracking, attribution, fraud detection, payout management) |
| `apps/api/src/affiliates/affiliates.controller.ts` | API endpoints (public + auth + admin) |
| `apps/api/src/affiliates/dto/index.ts` | Request DTOs with validation |
| `apps/api/src/orders/orders.service.ts` | Sets `affiliateId` on orders via `affiliateCode` |
| `apps/api/src/payments/payments.service.ts` | Creates AffiliateConversion on payment confirmation |
| `apps/api/prisma/schema.prisma` | Database models |
| `packages/business-rules/src/affiliate.ts` | Pure business rules (can earn, can convert, etc.) |
| `packages/business-rules/src/constants.ts` | Configuration constants |
| `apps/admin/src/app/(dashboard)/affiliates/page.tsx` | Admin management UI |
| `apps/portal/src/app/(dashboard)/dashboard/affiliate/page.tsx` | Trader affiliate dashboard |
