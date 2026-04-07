# Compliance Implementation Guide

> **Status**: Infrastructure scaffolded — awaiting final legal review.
>
> This document describes the compliance-ready product infrastructure built into the MyFundingTrade platform. All placeholder text, disclaimers, and legal copy should be reviewed and finalized by qualified legal counsel before production launch.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Legal Document Management](#legal-document-management)
3. [Legal Consent Capture](#legal-consent-capture)
4. [Cookie Consent](#cookie-consent)
5. [Geo-Restriction System](#geo-restriction-system)
6. [Platform Restriction System](#platform-restriction-system)
7. [Disclaimer Surfaces](#disclaimer-surfaces)
8. [Database Schema](#database-schema)
9. [API Reference](#api-reference)
10. [Integration Points](#integration-points)
11. [Checklist Before Launch](#checklist-before-launch)

---

## Architecture Overview

The compliance system spans three layers:

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Web / Portal / Admin)                        │
│  • Cookie banner with granular preferences              │
│  • Consent checkboxes at checkout                       │
│  • Region restriction notices                           │
│  • Disclaimer banners on public pages                   │
│  • Admin CRUD for legal docs, restrictions              │
├─────────────────────────────────────────────────────────┤
│  API (NestJS)                                           │
│  • LegalModule — document CRUD + consent recording      │
│  • RestrictionsModule — geo + platform restriction APIs  │
│  • GeoRestrictionGuard — opt-in route-level blocking    │
├─────────────────────────────────────────────────────────┤
│  Database (PostgreSQL via Prisma)                        │
│  • LegalDocument, LegalConsent                          │
│  • GeoRestriction, PlatformRestriction                  │
└─────────────────────────────────────────────────────────┘
```

---

## Legal Document Management

### Storage

Legal documents are stored in the `LegalDocument` table with:

- **type**: Enum — `TERMS_AND_CONDITIONS`, `PRIVACY_POLICY`, `REFUND_POLICY`, `RISK_DISCLAIMER`, `COOKIE_POLICY`, `AML_POLICY`, `ACCEPTABLE_USE`
- **version**: Semantic version string (e.g., `"1.0"`)
- **isActive**: Boolean flag — only one active version per type at a time
- **effectiveAt**: Date when this version becomes legally binding
- **content**: Full HTML/Markdown body of the document

### Admin Interface

- **List**: `GET /api/v1/legal/admin/documents` — paginated, filterable by type
- **Create/Update**: Admin panel at `/content/legal/editor`
- **Public Access**: `GET /api/v1/legal/document/:type` — returns current active version

### Web Pages

Static legal pages exist at:
- `/legal` — hub page linking to all legal documents
- `/legal/terms-and-conditions`
- `/legal/privacy-policy`
- `/legal/refund-policy`
- `/legal/disclaimer`

> **TODO**: Consider fetching document content from the API (CMS-driven) rather than static JSX, so legal can update copy without code deploys.

---

## Legal Consent Capture

### How It Works

1. User must accept Terms & Conditions and Risk Disclaimer checkboxes before checkout
2. Frontend calls `POST /api/v1/legal/consent` or `POST /api/v1/legal/consent/bulk`
3. Backend records consent with: userId, documentId, IP address, user-agent, timestamp
4. Consents are idempotent — re-accepting the same document version is a no-op (upsert)

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/v1/legal/consent` | JWT | Record consent for a single document |
| `POST` | `/api/v1/legal/consent/bulk` | JWT | Record consent for multiple documents |
| `GET` | `/api/v1/legal/consent` | JWT | Get current user's consent history |
| `GET` | `/api/v1/legal/consent/pending` | JWT | Get documents user hasn't consented to |
| `GET` | `/api/v1/legal/admin/consents` | Admin | Paginated consent audit log |

### Consent Data Stored

```
LegalConsent {
  id          UUID
  userId      UUID (FK → User)
  documentId  UUID (FK → LegalDocument)
  ipAddress   String
  userAgent   String
  consentedAt DateTime
}
Unique constraint: [userId, documentId]
```

### Re-Consent Flow

When a legal document is updated (new version published), the old consent record is invalidated because the `documentId` changes. The `GET /consent/pending` endpoint surfaces any active documents the user has not yet accepted, enabling a re-consent prompt.

---

## Cookie Consent

### Frontend (Web)

The cookie banner (`apps/web/src/components/layout/cookie-banner.tsx`) provides:

1. **Accept All** — enables essential + analytics + marketing
2. **Decline** — enables essential only
3. **Preferences** — expandable panel for granular control:
   - Essential (always on, cannot disable)
   - Analytics (opt-in)
   - Marketing (opt-in)

Preferences are stored in `localStorage` under `mft-cookie-consent` as a JSON object:
```json
{ "essential": true, "analytics": true, "marketing": false }
```

### Server-Side Recording

On consent, the banner also POSTs to `POST /api/v1/legal/cookie-consent` (public endpoint) with:
```json
{
  "sessionId": "sess_abc123",
  "essential": true,
  "analytics": true,
  "marketing": false
}
```

This creates an audit trail. For authenticated users, a `CookieConsent` record is created and (if a COOKIE_POLICY document exists) a `LegalConsent` record is also upserted.

---

## Geo-Restriction System

### Guard-Based Approach

The `GeoRestrictionGuard` is an opt-in NestJS guard activated by the `@GeoRestricted()` decorator.

**Country detection** reads from (in priority order):
1. `cf-ipcountry` header (Cloudflare)
2. `x-country-code` header (custom proxy)
3. `x-vercel-ip-country` header (Vercel)

**Behavior**:
- If no header is present → fail open (allow request)
- If country is in `GeoRestriction` table with `type=BLOCKED` and `isActive=true` → `403 Forbidden`
- Response includes: `message`, `countryCode`, `reason`

**Applied to**:
- `POST /api/v1/orders` — order creation
- `POST /api/v1/payments/checkout` — payment initiation

### Admin Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/restrictions/countries` | Public | List blocked countries |
| `GET` | `/api/v1/restrictions/countries/:code/check` | Public | Check if a country is restricted |
| `GET` | `/api/v1/restrictions/admin/countries` | Admin | Paginated list for admin |
| `POST` | `/api/v1/restrictions/admin/countries` | Admin | Upsert a geo restriction |
| `DELETE` | `/api/v1/restrictions/admin/countries/:code` | Admin | Remove a geo restriction |

### Frontend Integration

The `<RegionNotice>` component in the portal checks the user's region and displays a warning banner if services are restricted. This is a passive notice — the actual block happens at the API level via the guard.

---

## Platform Restriction System

Platform restrictions are feature flags that control platform-wide behavior:

| Key | Description |
|-----|-------------|
| `new_registrations` | Toggle new user registrations on/off |
| `crypto_payments` | Enable/disable cryptocurrency payment methods |
| `affiliate_signups` | Toggle affiliate program enrollment |
| `maintenance_mode` | Put the platform in maintenance mode |

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/v1/restrictions/platform` | Public | List all platform restrictions |
| `GET` | `/api/v1/restrictions/platform/:key/check` | Public | Check a specific restriction |
| `POST` | `/api/v1/restrictions/admin/platform` | Admin | Upsert a platform restriction |
| `DELETE` | `/api/v1/restrictions/admin/platform/:key` | Admin | Remove a platform restriction |

### Frontend Integration

The `<PlatformNotice restrictionKey="maintenance_mode" />` component checks a specific restriction key and displays a notice if enabled.

---

## Disclaimer Surfaces

### Public Website (Web)

1. **Homepage**: `<DisclaimerSection />` at the bottom — risk disclaimer about leveraged trading
2. **Challenge Page**: `<DisclaimerSection />` before the CTA section
3. **Footer**: Every page includes a risk disclaimer in the footer bottom bar
4. **Legal Hub** (`/legal`): Central page linking to all legal documents

### Trader Portal

1. **Checkout Page** (`/dashboard/challenges/buy`):
   - Mandatory checkboxes: Terms & Conditions + Risk Disclaimer
   - Inline risk warning banner with AlertTriangle icon
   - Button disabled until both consents are checked
   - Region restriction notice component
   - Platform restriction notice (e.g., maintenance mode)

2. **Legal Page** (`/dashboard/legal`): View legal documents and consent history

---

## Database Schema

```prisma
model LegalDocument {
  id          String   @id @default(uuid())
  type        LegalDocumentType
  version     String
  title       String
  content     String   @db.Text
  isActive    Boolean  @default(true)
  effectiveAt DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  consents    LegalConsent[]

  @@unique([type, version])
}

model LegalConsent {
  id          String   @id @default(uuid())
  userId      String
  documentId  String
  ipAddress   String?
  userAgent   String?
  consentedAt DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
  document    LegalDocument @relation(fields: [documentId], references: [id])

  @@unique([userId, documentId])
}

model GeoRestriction {
  id          String @id @default(uuid())
  countryCode String @unique
  countryName String
  type        RestrictionType @default(BLOCKED)
  reason      String?
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PlatformRestriction {
  id          String  @id @default(uuid())
  key         String  @unique
  isEnabled   Boolean @default(false)
  description String?
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum LegalDocumentType {
  TERMS_AND_CONDITIONS
  PRIVACY_POLICY
  REFUND_POLICY
  RISK_DISCLAIMER
  COOKIE_POLICY
  AML_POLICY
  ACCEPTABLE_USE
}

enum RestrictionType {
  BLOCKED
  ALLOWED
}
```

---

## API Reference

### Legal Module

```
GET    /api/v1/legal/document/:type     — Public: get active document by type
GET    /api/v1/legal/admin/documents    — Admin: list all documents
POST   /api/v1/legal/admin/documents    — Admin: create document
PUT    /api/v1/legal/admin/documents/:id — Admin: update document
DELETE /api/v1/legal/admin/documents/:id — Admin: delete document
POST   /api/v1/legal/consent            — Auth: record single consent
POST   /api/v1/legal/consent/bulk       — Auth: record multiple consents
GET    /api/v1/legal/consent            — Auth: list user's consents
GET    /api/v1/legal/consent/pending    — Auth: list documents awaiting consent
POST   /api/v1/legal/cookie-consent     — Public: record cookie preferences
GET    /api/v1/legal/admin/consents     — Admin: consent audit log
```

### Restrictions Module

```
GET    /api/v1/restrictions/countries             — Public: blocked countries
GET    /api/v1/restrictions/countries/:code/check  — Public: check country
GET    /api/v1/restrictions/admin/countries        — Admin: list all geo restrictions
POST   /api/v1/restrictions/admin/countries        — Admin: upsert geo restriction
DELETE /api/v1/restrictions/admin/countries/:code   — Admin: remove geo restriction
GET    /api/v1/restrictions/platform               — Public: list platform restrictions
GET    /api/v1/restrictions/platform/:key/check    — Public: check platform restriction
POST   /api/v1/restrictions/admin/platform         — Admin: upsert platform restriction
DELETE /api/v1/restrictions/admin/platform/:key     — Admin: remove platform restriction
```

---

## Integration Points

### Where Consent Is Required

| Action | Required Consents | Enforcement |
|--------|------------------|-------------|
| Purchase challenge | Terms & Conditions, Risk Disclaimer | Frontend checkbox + API call |
| Registration | Terms & Conditions, Privacy Policy | Frontend checkbox (future) |
| Newsletter signup | Privacy Policy | Implicit via signup action |
| Cookie usage | Cookie Policy | Banner + localStorage + API |

### Where Geo-Restriction Is Enforced

| Endpoint | Guard | Behavior |
|----------|-------|----------|
| `POST /orders` | `@GeoRestricted()` | 403 if country blocked |
| `POST /payments/checkout` | `@GeoRestricted()` | 403 if country blocked |
| Portal checkout page | `<RegionNotice>` | Visual warning |

### Where Disclaimers Appear

| Surface | Component | Location |
|---------|-----------|----------|
| Homepage | `<DisclaimerSection>` | Above newsletter |
| Challenge page | `<DisclaimerSection>` | Before CTA |
| All pages (footer) | `<Footer>` | Bottom bar text |
| Checkout | Inline banner | Above purchase button |

---

## Checklist Before Launch

> All items below require review by qualified legal counsel.

- [ ] **Terms & Conditions**: Replace placeholder content with final legal copy
- [ ] **Privacy Policy**: Review for GDPR/CCPA compliance; include data processing details
- [ ] **Refund Policy**: Align with actual refund procedures and Stripe configuration
- [ ] **Risk Disclaimer**: Have compliance team review trading risk disclosures
- [ ] **Cookie Policy**: Enumerate all cookies used (analytics, marketing, session)
- [ ] **AML Policy**: Draft and publish if required by jurisdiction
- [ ] **Geo-restrictions**: Confirm blocked country list with compliance team
- [ ] **Cookie banner**: Verify granular consent meets GDPR requirements
- [ ] **Consent flow**: Confirm re-consent triggers when legal documents are updated
- [ ] **Data retention**: Define retention periods for consent records
- [ ] **Right to erasure**: Implement GDPR Article 17 (right to be forgotten) for consent data
- [ ] **Age verification**: Consider adding age verification if required
- [ ] **Accessibility**: Ensure all legal pages and consent flows meet WCAG 2.1 AA
- [ ] **CDN headers**: Verify Cloudflare/Vercel passes correct country code headers
- [ ] **Monitoring**: Set up alerts for geo-restriction guard blocks
