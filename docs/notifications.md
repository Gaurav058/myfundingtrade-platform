# Notification System — Architecture & Reference

## Overview

MyFundingTrade uses a queue-backed notification system powered by **BullMQ** (Redis) for asynchronous processing and **Resend** for transactional email delivery. Notifications are dispatched via **NestJS EventEmitter** for loose coupling between feature modules and the notification service.

## Architecture

```
Feature Module ─── EventEmitter ───▶ NotificationsService
                                          │
                        ┌─────────────────┼─────────────────┐
                        ▼                                   ▼
                  BullMQ "email"                     BullMQ "notifications"
                     queue                                queue
                        │                                   │
                        ▼                                   ▼
                  EmailProcessor                   NotificationProcessor
                  (sends via Resend)              (stores IN_APP record)
                        │                                   │
                        ▼                                   ▼
                  Notification row                   Notification row
                  (type=EMAIL)                      (type=IN_APP)
                  status tracking                   instant delivery
```

## Email Event Catalog

| Event Constant | Trigger | Template | Email | In-App |
|---|---|---|---|---|
| `REGISTRATION` | User signs up | `registrationEmail` | ✅ | ✅ |
| `EMAIL_VERIFICATION` | Registration / manual | `emailVerificationEmail` | ✅ | — |
| `ORDER_CONFIRMATION` | Stripe checkout success | `orderConfirmationEmail` | ✅ | ✅ |
| `KYC_SUBMITTED` | User uploads documents | `kycSubmittedEmail` | ✅ | ✅ |
| `KYC_APPROVED` | Admin approves KYC | `kycApprovedEmail` | ✅ | ✅ |
| `KYC_REJECTED` | Admin rejects KYC | `kycRejectedEmail` | ✅ | ✅ |
| `PAYOUT_REQUESTED` | User requests payout | `payoutRequestedEmail` | ✅ | ✅ |
| `PAYOUT_APPROVED` | Admin approves payout | `payoutApprovedEmail` | ✅ | ✅ |
| `PAYOUT_REJECTED` | Admin rejects payout | `payoutRejectedEmail` | ✅ | ✅ |
| `TICKET_CREATED` | User opens ticket | `ticketCreatedEmail` | ✅ | ✅ |
| `TICKET_REPLIED` | Agent replies to ticket | `ticketRepliedEmail` | ✅ | ✅ |
| `AFFILIATE_SIGNUP` | User creates affiliate link | `affiliateSignupEmail` | ✅ | ✅ |
| `AFFILIATE_PAYOUT_UPDATE` | Admin reviews commission payout | `affiliatePayoutUpdateEmail` | ✅ | ✅ |
| `NEWSLETTER_SUBSCRIPTION` | Public subscribe | `newsletterSubscriptionEmail` | ✅ | — |

## API Endpoints

### User Endpoints (require auth)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/notifications` | List user's notifications (paginated) |
| `PATCH` | `/api/v1/notifications/:id/read` | Mark one notification as read |
| `PATCH` | `/api/v1/notifications/read-all` | Mark all unread as read |
| `DELETE` | `/api/v1/notifications/:id` | Delete a notification |

### Admin Endpoints (require `SUPER_ADMIN` or `SUPPORT_ADMIN` role)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/notifications/admin/list` | List all notifications (filters: userId, type, status) |
| `GET` | `/api/v1/notifications/admin/stats` | Aggregated counts (total, queued, sent, failed, unread) |

## Email Provider

### Resend (primary)

Set `RESEND_API_KEY` in your environment. When the key is absent (dev mode), emails are logged to the console as **dry-run** — no external calls are made.

```env
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=MyFundingTrade <noreply@myfundingtrade.com>
```

### Switching Providers

The system uses an `EmailProvider` interface (`email-provider.interface.ts`). To swap to SendGrid, SES, or SMTP:

1. Create a new class implementing `EmailProvider`
2. Update the provider binding in `queue.module.ts`

```typescript
// queue.module.ts
{ provide: EMAIL_PROVIDER, useClass: SendGridProvider }
```

## Queue Configuration

Queues are registered globally in `QueueModule` and backed by Redis:

| Queue | Purpose |
|---|---|
| `email` | Transactional email delivery |
| `notifications` | In-app notification creation |
| `evaluation` | Trading account evaluation |
| `payouts` | Payout processing |
| `audit` | Audit log ingestion |

### Job Retry Policy (email queue)

- **Attempts**: 3
- **Backoff**: Exponential, starting at 5 seconds
- **Completed jobs retained**: 100
- **Failed jobs retained**: 500

## Notification Lifecycle

### Email Notifications

```
QUEUED  ──▶  SENT  ──▶  (read via email client)
                └──▶  FAILED (with failReason)
```

### In-App Notifications

```
DELIVERED  ──▶  READ (user marks read)
```

## Database Schema

```sql
-- notifications table
id          UUID PRIMARY KEY
user_id     UUID -> users(id) ON DELETE CASCADE
type        ENUM(EMAIL, IN_APP, SMS, PUSH)
status      ENUM(QUEUED, SENT, DELIVERED, FAILED, READ)
channel     VARCHAR(50)
title       VARCHAR(255)
body        TEXT
metadata    JSONB
sent_at     TIMESTAMP
read_at     TIMESTAMP
failed_at   TIMESTAMP
fail_reason VARCHAR(500)
created_at  TIMESTAMP DEFAULT NOW()

-- Indexes
(user_id, status)
(user_id, read_at)
(created_at)
```

## Local Development

1. Ensure Redis is running (`docker run -d -p 6379:6379 redis:7-alpine`)
2. Emails are dry-run logged when `RESEND_API_KEY` is not set
3. In-app notifications still work — they go through the notifications queue to PostgreSQL
4. Use the BullBoard UI (if installed) or Redis CLI to inspect queues:
   ```bash
   redis-cli LLEN bull:email:wait
   redis-cli LLEN bull:notifications:wait
   ```

## File Structure

```
apps/api/src/
├── notifications/
│   ├── notifications.module.ts      # Module registration
│   ├── notifications.service.ts     # Event listeners + query APIs
│   ├── notifications.controller.ts  # REST endpoints (user + admin)
│   ├── email/
│   │   ├── email-provider.interface.ts  # Provider abstraction
│   │   ├── resend.provider.ts           # Resend implementation
│   │   └── index.ts
│   ├── events/
│   │   ├── notification-events.ts   # Event names & payload types
│   │   └── index.ts
│   └── templates/
│       ├── email-templates.ts       # HTML templates per event type
│       └── index.ts
├── queue/
│   ├── queue.module.ts              # BullMQ config + processor registration
│   └── processors.ts               # Email + Notification workers
```
