# Security Architecture — MyFundingTrade Platform

> This document describes the production security posture of the backend API.
> Last updated: 2026-04-07

---

## 1. Authentication

| Feature | Implementation |
|---------|---------------|
| Strategy | JWT access token (15 min) + httpOnly signed-cookie refresh token (7 days) |
| Password hashing | bcrypt, cost factor 12 |
| Password policy | Min 8 chars, upper + lower + digit + special character |
| Refresh token rotation | Family-based — each refresh issues a new token and revokes the previous |
| Token reuse detection | If a revoked refresh token is replayed, the **entire token family** is revoked and all access tokens are invalidated via Redis. A `REFRESH_TOKEN_REUSE` suspicious-activity event is logged. |
| Access token blacklist | On logout, a Redis key `security:token_invalidated:{userId}` is set with a 15-min TTL. The `JwtAuthGuard` checks every request's `iat` against this value. |
| Logout | Clears the httpOnly refresh cookie, revokes all refresh tokens in DB, invalidates access tokens via Redis. |

### Token Storage

| Token | Where | Accessible to JS? |
|-------|-------|-------------------|
| Access token | Response body → client stores in memory | Yes (short-lived) |
| Refresh token | `Set-Cookie: refreshToken=…; httpOnly; Secure; SameSite=Strict; Signed; Path=/api/v1/auth` | **No** |

---

## 2. Authorization (RBAC)

Seven roles, enforced by the global `RolesGuard` + `@Roles()` decorator:

| Role | Scope |
|------|-------|
| `TRADER` | Default for end-users |
| `AFFILIATE` | Affiliate-programme participants |
| `SUPPORT_AGENT` | Read users, manage tickets |
| `KYC_REVIEWER` | Review KYC submissions |
| `FINANCE_ADMIN` | Orders, payments, payouts, analytics |
| `CONTENT_ADMIN` | Blog, FAQ, newsletter, legal pages |
| `SUPER_ADMIN` | Full access |

### Guard Stack (applied globally)

1. **JwtAuthGuard** — passport-jwt; skip with `@Public()`
2. **RolesGuard** — enforce `@Roles()`; passes if no roles declared
3. **ThrottlerGuard** — `@nestjs/throttler` with named rate buckets

---

## 3. Rate Limiting

| Bucket | Window | Limit | Description |
|--------|--------|-------|-------------|
| `short` | 1 s | 3 | Burst protection |
| `medium` | 10 s | 20 | Mid-range |
| `long` | 60 s | 100 | General default |

**Per-route overrides (via `@Throttle()`):**

| Route | Limit | Window |
|-------|-------|--------|
| `POST /auth/register` | 3 | 60 s |
| `POST /auth/login` | 5 | 60 s |
| `POST /auth/refresh` | 10 | 60 s |

---

## 4. Brute-Force & Anti-Abuse Protection

Implemented in `SecurityService` backed by Redis:

| Protection | Threshold | Window | Effect |
|-----------|-----------|--------|--------|
| Failed logins per email | 5 | 15 min | Account temporarily locked |
| Failed logins per IP | 20 | 15 min | IP blocked from login |
| Signups per IP | 3 | 1 hour | Registration blocked |

On successful login, the per-email counter is **cleared**.

### Suspicious-Activity Logging

All suspicious events are:
1. Logged at `ERROR` level with structured metadata (`type`, `ip`, `email`, `userId`, `details`).
2. Persisted to Redis with a 7-day TTL for monitoring dashboards.

Events tracked: `REFRESH_TOKEN_REUSE`, failed-login spikes.

---

## 5. Audit Logging

### Automatic (AuditInterceptor)

Every mutating request (`POST`, `PUT`, `PATCH`, `DELETE`) made by a user with an admin role is **automatically** captured with:

- `performerId`, `action` (`METHOD:handlerName`), `resource` (controller)
- `resourceId` (from URL params)
- Sanitized request body and response (sensitive fields like `password`, `tokenHash`, `documentNumber` are `[REDACTED]`)
- `ipAddress`, `userAgent`, `path`, `query`

Written to the `AdminActionLog` table via `AuditService`.

### Audited Roles

`SUPER_ADMIN`, `FINANCE_ADMIN`, `CONTENT_ADMIN`, `KYC_REVIEWER`, `SUPPORT_AGENT`

---

## 6. Input Validation

- **Global `ValidationPipe`** with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- In production, `disableErrorMessages: true` — no field-level details in error responses.
- All DTOs use `class-validator` decorators with explicit `@MaxLength()` / `@MinLength()` to prevent oversized payloads.
- KYC document URLs enforce `https://` protocol and max 2048 characters.

---

## 7. Secure Headers (Helmet)

| Header | Value (production) |
|--------|-------------------|
| `Content-Security-Policy` | Default (script-src 'self', etc.) |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |
| `Cross-Origin-Embedder-Policy` | enabled |
| `X-DNS-Prefetch-Control` | `off` |
| `X-Permitted-Cross-Domain-Policies` | `none` |
| `X-Powered-By` | **removed** |

In development, CSP and CORP are disabled to allow Swagger UI.

---

## 8. CORS

- **Allowed origins**: configurable via `ALLOWED_ORIGINS` (comma-separated) or individual `NEXT_PUBLIC_*_URL` env vars.
- **Credentials**: enabled (for cookies).
- **Methods**: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- **Pre-flight cache**: 600 s.
- Non-matching origins are **rejected** and logged at `WARN` level.

---

## 9. Cookie Security

| Attribute | Value |
|-----------|-------|
| `httpOnly` | `true` |
| `secure` | `true` in production |
| `signed` | `true` (via `COOKIE_SECRET`) |
| `sameSite` | `strict` in production, `lax` in development |
| `path` | `/api/v1/auth` (only sent to auth endpoints) |
| `domain` | `COOKIE_DOMAIN` env var |
| `maxAge` | 7 days |

---

## 10. KYC File Upload Security

### URL-Based (current)

- Document URLs must use `https://` protocol.
- Max URL length: 2048 characters.
- Input validated via `class-validator` `@IsUrl()`.

### Binary Upload (future / multipart)

`FileValidationPipe` provides:
1. **Max size**: 10 MB.
2. **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
3. **Extension check**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.pdf`.
4. **Magic-byte verification**: Validates file content matches declared MIME type (prevents extension spoofing).
5. **Filename sanitization**: Strips path-traversal characters and special chars.

---

## 11. Environment Variable Validation

Enforced at bootstrap (`config/env.validation.ts`):

| Condition | Development | Production |
|-----------|-------------|------------|
| `DATABASE_URL` missing | warn | **fatal** |
| `JWT_SECRET` missing | warn (insecure default) | **fatal** |
| `JWT_SECRET` < 32 chars | — | **fatal** |
| `JWT_SECRET` = default value | — | **fatal** |
| `REDIS_URL` missing | — | **fatal** |
| `COOKIE_SECRET` missing | — | **fatal** |
| No allowed origins configured | — | **fatal** |

---

## 12. IP / User-Agent / Session Metadata

Captured at the following touchpoints:

| Event | IP | User-Agent | Stored in |
|-------|-----|-----------|-----------|
| Login | ✅ | ✅ | `User.lastLoginIp`, `RefreshToken` row |
| Register | ✅ | ✅ | `RefreshToken` row |
| Token refresh | ✅ | ✅ | New `RefreshToken` row |
| Admin mutation | ✅ | ✅ | `AdminActionLog` via `AuditInterceptor` |
| Suspicious activity | ✅ | ✅ | Redis + structured log |

`trust proxy` is enabled for correct IP extraction behind load balancers.

---

## 13. Swagger / API Documentation

- Available only when `NODE_ENV !== 'production'`.
- In production, no `/api/docs` endpoint is exposed.

---

## 14. Error Handling

- `AllExceptionsFilter` catches all uncaught exceptions.
- **HTTP exceptions** return their message and status.
- **Unhandled exceptions** (500s) return a generic `"An unexpected error occurred"` message in production — no stack traces, no internals.
- The `path` field is **omitted** from error responses to avoid leaking route internals.
- Full stack traces are logged server-side at `ERROR` level for debugging.

---

## 15. Recommendations for Next Phase

1. **Email verification flow** — prevent using unverified emails for KYC/payouts.
2. **2FA (TOTP)** — the `User` model already has `twoFactorEnabled` / `twoFactorSecret`.
3. **Webhook signature verification** — validate payment provider callbacks (Stripe, etc.).
4. **CSRF tokens** — not needed for Bearer-token APIs, but required if session cookies are used on the web app.
5. **Content Security Policy (CSP)** — tighten once front-end static hashes are known.
6. **Dependency scanning** — integrate `npm audit` / Snyk into CI.
7. **Secrets management** — migrate from `.env` to AWS Secrets Manager / Vault in production.
8. **WAF** — Cloudflare / AWS WAF in front of the API for DDoS and bot protection.
9. **Self-referral prevention** — validate that affiliate conversion's referred user ≠ affiliate owner (implement in order creation flow).
10. **Account enumeration** — currently `register` returns `ConflictException("Email already registered")`. Consider using a generic message + email-based confirmation to prevent enumeration.
