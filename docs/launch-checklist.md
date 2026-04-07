# Launch Checklist — MyFundingTrade Platform

> Pre-launch gate for production deployment. All items must be completed or explicitly deferred with a reason.

---

## Phase 1 — Infrastructure & Environment

### Hosting & DNS
- [ ] Production server(s) provisioned (VPS, cloud instances, or Kubernetes cluster)
- [ ] DNS records configured: `myfundingtrade.com`, `portal.myfundingtrade.com`, `admin.myfundingtrade.com`, `api.myfundingtrade.com`
- [ ] SSL certificates issued (Let's Encrypt or managed provider) for all domains
- [ ] NGINX reverse proxy deployed with production config (`docker/nginx/`)
- [ ] Rate limiting, security headers, and GZIP compression verified via response headers

### Database
- [ ] PostgreSQL 15+ provisioned in production (managed service recommended)
- [ ] Connection pooling configured (PgBouncer or managed pool)
- [ ] Production database credentials stored in secrets manager (not `.env` files)
- [ ] Prisma migrations applied: `npx prisma migrate deploy`
- [ ] Database backup schedule configured (daily minimum, see `docs/backup-and-recovery.md`)
- [ ] Point-in-time recovery enabled if using managed PostgreSQL
- [ ] Seed data run for initial admin user: `npx prisma db seed`

### Redis
- [ ] Redis 7+ provisioned (managed service recommended)
- [ ] TLS enabled for Redis connections in production
- [ ] Used for: JWT token invalidation, BullMQ job queues, rate limiter state
- [ ] Persistence configured (AOF or RDB) to survive restarts

### Docker
- [ ] Production images built: `docker compose -f docker-compose.prod.yml build`
- [ ] Images tagged with git SHA or semantic version
- [ ] Container health checks passing: `/api/v1/health`
- [ ] Resource limits set (CPU, memory) per container
- [ ] Restart policies configured (`unless-stopped`)

---

## Phase 2 — External Services

### Stripe (Payments)
- [ ] Stripe production account activated
- [ ] Production API keys set in environment: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
- [ ] Webhook endpoint registered: `https://api.myfundingtrade.com/api/v1/webhooks/stripe`
- [ ] Webhook signing secret set: `STRIPE_WEBHOOK_SECRET`
- [ ] Test a real payment end-to-end (smallest plan) and verify order status updates
- [ ] Refund flow tested
- [ ] PCI compliance: no card data touches our servers (Stripe Checkout handles it)

### Resend (Email)
- [ ] Resend production account with verified sending domain
- [ ] API key set: `RESEND_API_KEY`
- [ ] From address configured: `noreply@myfundingtrade.com`
- [ ] SPF, DKIM, DMARC records configured for sending domain
- [ ] Test emails: welcome, password reset, KYC status change, payout confirmation
- [ ] BullMQ notification queue processing verified

### File Storage (KYC Documents)
- [ ] S3 bucket (or compatible) provisioned for KYC uploads
- [ ] Access credentials configured: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`
- [ ] Bucket policy: private (no public access)
- [ ] Encryption at rest enabled
- [ ] Lifecycle rule for document retention compliance

---

## Phase 3 — Application Configuration

### Environment Variables
- [ ] All required env vars set for production (see `.env.example` in each app):
  - `DATABASE_URL` — PostgreSQL connection string
  - `REDIS_URL` — Redis connection string
  - `JWT_SECRET` — Random 256-bit key
  - `JWT_REFRESH_SECRET` — Separate random 256-bit key
  - `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_API_URL` — `https://api.myfundingtrade.com` (for portal/admin/web)
  - `COOKIE_SECRET` — Random 256-bit key for signed cookies
  - `COOKIE_DOMAIN` — `.myfundingtrade.com`
- [ ] No secrets in source control (`.env` files in `.gitignore`)
- [ ] `NODE_ENV=production` set for all services

### Initial Data
- [ ] At least one admin user created (SUPER_ADMIN role)
- [ ] Challenge plans and variants configured
- [ ] Challenge rule sets defined
- [ ] Legal documents published (Terms & Conditions, Privacy Policy, Risk Disclaimer, Refund Policy)
- [ ] FAQ entries populated
- [ ] System settings initialized (platform name, support email, etc.)

### CORS & Cookies
- [ ] API CORS allows: web domain, portal domain, admin domain
- [ ] Cookie `domain` set to `.myfundingtrade.com` so refresh cookie works across subdomains
- [ ] Cookie `Secure` flag enabled (HTTPS only)
- [ ] Cookie `SameSite=Lax` or `Strict` for CSRF protection

---

## Phase 4 — Security Audit

### Authentication
- [ ] JWT access token TTL: 15 minutes (not longer)
- [ ] Refresh token TTL: 7 days
- [ ] Bcrypt salt rounds: 12+
- [ ] Token invalidation on logout (Redis blacklist)
- [ ] Account lockout after N failed login attempts (via ThrottlerGuard)

### API Security
- [ ] All admin endpoints require admin role (`@Roles` guard)
- [ ] Rate limiting active: 100 req/min default, tighter on auth endpoints
- [ ] Input validation on all POST/PATCH/PUT endpoints (NestJS validation pipes)
- [ ] SQL injection prevention: Prisma parameterized queries only
- [ ] XSS prevention: no `dangerouslySetInnerHTML`, CSP headers in NGINX
- [ ] CSRF: API-only backend + CORS + SameSite cookies mitigate
- [ ] Stripe webhook signature verified before processing

### Infrastructure Security
- [ ] SSH key-only access to servers (no password auth)
- [ ] Firewall: only ports 80, 443 open to public
- [ ] Database not publicly accessible (internal network only)
- [ ] Redis not publicly accessible
- [ ] Docker containers run as non-root user
- [ ] Dependency audit: `pnpm audit` shows no critical vulnerabilities

---

## Phase 5 — Monitoring & Observability

### Application Monitoring
- [ ] Error tracking service configured (Sentry, or similar)
- [ ] Unhandled exception handler in NestJS captures errors
- [ ] Client-side error boundary in Next.js apps

### Logging
- [ ] Structured JSON logging in API (NestJS Logger or Pino)
- [ ] Log aggregation (CloudWatch, Datadog, Loki, or similar)
- [ ] Request/response logging (no sensitive data: passwords, tokens)
- [ ] Audit trail for admin actions (stored in DB via `/admin/activity`)

### Uptime & Alerts
- [ ] Health check monitoring: API `/api/v1/health` pinged every 60s
- [ ] Alert on: API down, error rate spike, database connection failures
- [ ] Notification channel configured (email, Slack, PagerDuty)

### Performance
- [ ] API response times < 200ms for standard queries
- [ ] Next.js pages load < 3s on 3G connection (Lighthouse audit)
- [ ] Database query performance: no N+1 queries, indexes on foreign keys

---

## Phase 6 — Legal & Compliance

- [ ] Terms & Conditions reviewed by legal counsel
- [ ] Privacy Policy compliant with GDPR/applicable regulations
- [ ] Risk Disclaimer reviewed
- [ ] Refund Policy published
- [ ] User consent collection working (legal consent API)
- [ ] Geo-restrictions configured for blocked jurisdictions
- [ ] KYC/AML compliance verified with compliance officer
- [ ] Data retention policy documented
- [ ] Cookie consent banner (if applicable)

---

## Phase 7 — Final Verification

### Build & Deploy
- [ ] `pnpm turbo build` passes with 0 errors (✅ verified during integration)
- [ ] Production deploy via CI/CD: `deploy-prod.sh` or GitHub Actions
- [ ] Blue/green or rolling deployment to avoid downtime
- [ ] Rollback plan documented and tested

### Smoke Test (Post-Deploy)
- [ ] Web homepage loads in browser
- [ ] Portal login flow works
- [ ] Admin login flow works
- [ ] Create an order → complete Stripe checkout → verify order status
- [ ] Submit KYC → verify in admin panel
- [ ] Create support ticket → verify in admin panel
- [ ] Affiliate signup → verify tracking pixel/link works

### Backup Verification
- [ ] Database backup runs successfully
- [ ] Backup restore tested in staging environment
- [ ] Backup retention: minimum 30 days

---

## Remaining External Dependencies

| Item | Status | Notes |
|---|---|---|
| Stripe production keys | ⬜ Pending | Requires Stripe account activation |
| Resend production keys | ⬜ Pending | Requires domain verification |
| S3 / file storage | ⬜ Pending | For KYC document uploads |
| Trading platform integration | ⬜ Deferred | MT4/MT5 account provisioning API — post-launch |
| Real-time balance sync | ⬜ Deferred | Trading platform WebSocket integration — post-launch |
| Push notifications | ⬜ Deferred | Browser push / mobile — post-launch |

---

## Sign-Off

| Role | Name | Date | Approved |
|---|---|---|---|
| Engineering Lead | | | ☐ |
| Product Owner | | | ☐ |
| QA Lead | | | ☐ |
| Security | | | ☐ |
