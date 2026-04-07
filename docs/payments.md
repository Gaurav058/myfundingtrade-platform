# Payment System Architecture

## Overview

MyFundingTrade uses **Stripe Checkout Sessions** for processing challenge purchases. The payment flow is webhook-driven and idempotent by design.

## Payment Flow

```
┌────────────┐     ┌──────────┐     ┌────────────┐     ┌────────┐
│   Portal    │────>│  API      │────>│   Stripe   │────>│ Webhook│
│ (Frontend)  │     │ (NestJS)  │     │  Checkout   │     │ Handler│
└────────────┘     └──────────┘     └────────────┘     └────────┘
      │                  │                  │                │
  1. Select plan     2. Create order    4. Customer     6. checkout.
  & checkout         3. Create payment     pays            session.
                     → Stripe session                      completed
                     → Return URL         5. Redirect
                                          to success     7. Update
                                          page              payment
                                                           + order
```

### Step-by-Step

1. **User selects a plan** in the portal (`/dashboard/challenges/buy`)
2. **POST /api/v1/orders** — Creates order with status `PENDING_PAYMENT`
3. **POST /api/v1/payments/checkout** — Creates a `PENDING` payment record, calls Stripe to create a Checkout Session, updates payment to `PROCESSING`, returns `{ checkoutUrl, sessionId }`
4. **Frontend redirects** user to `checkoutUrl` (Stripe hosted checkout)
5. **Stripe processes payment** — user pays with card
6. **Stripe sends webhook** `checkout.session.completed` to `POST /api/v1/webhooks/stripe`
7. **Webhook handler** verifies signature, finds payment by session ID, atomically updates:
   - Payment → `SUCCEEDED` (with Stripe payment intent ID)
   - Order → `PAID` (with `paidAt` timestamp)
   - Creates affiliate conversion if applicable

### Failure Handling

- `checkout.session.expired` → Payment marked `CANCELLED`
- `charge.refunded` → Payment marked `REFUNDED` / `PARTIALLY_REFUNDED`, order updated
- `charge.dispute.created` → Both payment and order marked `DISPUTED`

## Order State Machine

```
DRAFT → PENDING_PAYMENT → PAID → FULFILLED
                    ↓         ↓        ↓
                CANCELLED  REFUNDED  REFUNDED
                              ↓
                          DISPUTED
```

- **DRAFT** → **PENDING_PAYMENT**: Order created
- **PENDING_PAYMENT** → **PAID**: Webhook confirms payment
- **PENDING_PAYMENT** → **CANCELLED**: User or admin cancels
- **PAID** → **FULFILLED**: Trader account provisioned
- **PAID** → **REFUNDED**: Admin initiates refund via Stripe
- **PAID** → **DISPUTED**: Stripe dispute webhook received

## Payment State Machine

```
PENDING → PROCESSING → SUCCEEDED → REFUNDED
              ↓                ↓→ PARTIALLY_REFUNDED
          CANCELLED         DISPUTED
              ↓
            FAILED
```

## API Endpoints

### User Endpoints (authenticated)

| Method | Path                        | Description                    |
|--------|-----------------------------|--------------------------------|
| POST   | `/api/v1/orders`            | Create order from variant      |
| POST   | `/api/v1/orders/:id/cancel` | Cancel a pending order         |
| GET    | `/api/v1/orders`            | List user's orders             |
| GET    | `/api/v1/orders/:id`        | Get order detail               |
| POST   | `/api/v1/payments/checkout` | Initiate Stripe Checkout       |
| GET    | `/api/v1/payments/order/:id`| Get payments for an order      |

### Admin Endpoints (SUPER_ADMIN / FINANCE_ADMIN)

| Method | Path                              | Description                |
|--------|-----------------------------------|----------------------------|
| GET    | `/api/v1/payments/admin/list`     | List all payments          |
| GET    | `/api/v1/payments/admin/:id`      | Payment detail             |
| POST   | `/api/v1/payments/:id/refund`     | Initiate refund            |
| POST   | `/api/v1/payments/:id/confirm`    | Manual payment confirm     |
| GET    | `/api/v1/orders/admin/list`       | List all orders            |
| POST   | `/api/v1/orders/admin/:id/cancel` | Admin cancel order         |

### Webhook (public, signature-verified)

| Method | Path                        | Description                    |
|--------|-----------------------------|--------------------------------|
| POST   | `/api/v1/webhooks/stripe`   | Stripe webhook receiver        |

## Idempotency

All webhook handlers are idempotent:

1. **Checkout completed**: Checks for existing `SUCCEEDED` payment for the order before processing. If found, skips.
2. **Payment creation**: Reuses existing `PENDING` payment for the same order if one exists.
3. **Affiliate conversion**: Checks for existing conversion on the order before creating.
4. **Refund**: Uses Stripe's own idempotency — duplicate refund requests are rejected by Stripe.

## Security

- **Webhook signature verification** via `stripe.webhooks.constructEvent()` with `STRIPE_WEBHOOK_SECRET`
- **Raw body parsing** enabled in NestJS (`rawBody: true` in app creation) for accurate signature verification
- **@Public() decorator** on webhook endpoint (skips JWT auth)
- **Rate limiting** applied globally via ThrottlerGuard
- **Environment validation** enforces `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in production

## Configuration

Required environment variables:

```env
STRIPE_SECRET_KEY=sk_live_...       # Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_...     # Webhook signing secret
STRIPE_PUBLISHABLE_KEY=pk_live_...  # Frontend (not used server-side)
NEXT_PUBLIC_PORTAL_URL=https://portal.myfundingtrade.com  # For checkout redirect URLs
```

### Local Development with Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local API
stripe listen --forward-to localhost:4000/api/v1/webhooks/stripe

# The CLI will print a webhook signing secret — set it as STRIPE_WEBHOOK_SECRET
```

## Files

### Backend (`apps/api/src/payments/`)

- `stripe.service.ts` — Stripe SDK wrapper (checkout sessions, refunds, webhook verification)
- `payments.service.ts` — Business logic (checkout initiation, webhook handlers, refunds, queries)
- `payments.controller.ts` — REST endpoints for users and admins
- `webhook.controller.ts` — Stripe webhook receiver (@Public, raw body, signature verification)
- `payments.module.ts` — NestJS module registration

### Frontend

- `apps/portal/src/app/(dashboard)/dashboard/challenges/buy/page.tsx` — Plan selection + checkout
- `apps/portal/src/app/(dashboard)/dashboard/checkout/success/page.tsx` — Post-payment success page
- `apps/portal/src/app/(dashboard)/dashboard/checkout/cancel/page.tsx` — Payment cancelled page
- `apps/admin/src/app/(dashboard)/payments/page.tsx` — Admin payment list with refund actions

## Refund Flow

1. Admin clicks "Refund" on payment in admin panel
2. **POST /api/v1/payments/:id/refund** (optional `amount` for partial)
3. Backend calls `stripe.refunds.create()` with payment intent ID
4. Payment status updated to `REFUNDED` or `PARTIALLY_REFUNDED`
5. If full refund, order status → `REFUNDED`, `refundedAt` timestamp set
6. Stripe also sends `charge.refunded` webhook (handled idempotently)
