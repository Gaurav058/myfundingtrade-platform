# Content System Architecture

> Complete documentation for the blog, FAQ, and legal document content platform.

## Overview

The content system provides a CMS-backed content pipeline for the MyFundingTrade marketing website. Content is managed through the admin panel and served on the public website via the NestJS API, with static data fallback for zero-downtime deployments.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Admin Panel │────▶│  NestJS API │◀────│  Public Web  │
│  (CMS Forms) │     │  (CRUD)     │     │  (SSG + ISR) │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  PostgreSQL  │
                    │  (Prisma)    │
                    └─────────────┘
```

### Data Flow

1. **Admin** creates/edits content via CMS forms → calls API endpoints
2. **API** validates with class-validator DTOs → persists via Prisma
3. **Web** fetches from API at build time (SSG) or every 5 min (ISR)
4. **Web** falls back to static data files if API is unreachable

## Database Models

### BlogCategory
| Field     | Type     | Notes              |
|-----------|----------|--------------------|
| id        | UUID     | Primary key        |
| name      | VARCHAR  | Category name      |
| slug      | VARCHAR  | Unique URL slug    |
| sortOrder | INT      | Display order      |

### BlogPost
| Field          | Type           | Notes                          |
|----------------|----------------|--------------------------------|
| id             | UUID           | Primary key                    |
| authorId       | UUID           | FK → User                      |
| categoryId     | UUID?          | FK → BlogCategory              |
| title          | VARCHAR(255)   | Post title                     |
| slug           | VARCHAR(280)   | Unique URL slug                |
| excerpt        | VARCHAR(500)   | Summary for listings           |
| content        | TEXT           | Markdown body                  |
| coverImage     | VARCHAR(500)   | Image URL                      |
| status         | ENUM           | DRAFT/SCHEDULED/PUBLISHED/ARCHIVED |
| publishedAt    | DATETIME?      | Auto-set on publish            |
| seoTitle       | VARCHAR(255)   | Override for <title>           |
| seoDescription | VARCHAR(500)   | Override for meta description   |
| deletedAt      | DATETIME?      | Soft delete                    |

### FAQItem
| Field       | Type        | Notes              |
|-------------|-------------|---------------------|
| id          | UUID        | Primary key         |
| question    | VARCHAR(500)| Question text       |
| answer      | TEXT        | Answer text         |
| category    | VARCHAR?    | Grouping category   |
| sortOrder   | INT         | Display order       |
| isPublished | BOOLEAN     | Visibility toggle   |

### LegalDocument
| Field       | Type            | Notes                      |
|-------------|-----------------|----------------------------|
| id          | UUID            | Primary key                |
| type        | ENUM            | TERMS_OF_SERVICE, etc.     |
| version     | VARCHAR(20)     | Semver string              |
| title       | VARCHAR(200)    | Document title             |
| content     | TEXT            | HTML content               |
| effectiveAt | DATETIME        | When it takes effect       |
| isActive    | BOOLEAN         | Active version flag        |

## API Endpoints

### Blog

| Method | Path                  | Auth     | Description                |
|--------|-----------------------|----------|----------------------------|
| GET    | /blog                 | Public   | Published posts (paginated) |
| GET    | /blog/categories      | Public   | All categories              |
| GET    | /blog/slugs           | Public   | All published slugs         |
| GET    | /blog/:slug           | Public   | Single post by slug         |
| GET    | /blog/:slug/related   | Public   | Related posts               |
| GET    | /blog/admin/all       | Admin    | All posts (inc. drafts)     |
| POST   | /blog                 | Admin    | Create post                 |
| PATCH  | /blog/:id             | Admin    | Update post                 |
| DELETE | /blog/:id             | Admin    | Soft delete post            |
| POST   | /blog/categories      | Admin    | Create category             |
| PATCH  | /blog/categories/:id  | Admin    | Update category             |
| DELETE | /blog/categories/:id  | Admin    | Delete category             |

### FAQ

| Method | Path            | Auth     | Description              |
|--------|-----------------|----------|--------------------------|
| GET    | /faq            | Public   | Published FAQs           |
| GET    | /faq/categories | Public   | Distinct categories      |
| GET    | /faq/admin      | Admin    | All FAQs (paginated)     |
| POST   | /faq            | Admin    | Create FAQ               |
| PATCH  | /faq/:id        | Admin    | Update FAQ               |
| DELETE | /faq/:id        | Admin    | Delete FAQ               |

### Legal

| Method | Path            | Auth        | Description              |
|--------|-----------------|-------------|--------------------------|
| GET    | /legal          | Public      | Active documents summary |
| GET    | /legal/:type    | Public      | Full doc by type         |
| GET    | /legal/admin/all| Admin       | All documents            |
| POST   | /legal          | Admin       | Create document          |
| PATCH  | /legal/:id      | Admin       | Update document          |
| DELETE | /legal/:id      | SUPER_ADMIN | Delete document          |

## Admin CMS Pages

| Route                      | Purpose                        |
|----------------------------|--------------------------------|
| /content/blog              | Blog post listing & management |
| /content/blog/editor       | Create/edit blog post          |
| /content/faq               | FAQ listing & management       |
| /content/faq/editor        | Create/edit FAQ item           |
| /content/legal             | Legal document listing         |
| /content/legal/editor      | Create/edit legal document     |

## Public Website Pages

### Blog

- **`/blog`** — Listing page with category filter badges. Server-rendered async component with ISR (5-min revalidation). Falls back to `@/data/blog.ts` static data.
- **`/blog/[slug]`** — Article page with `generateStaticParams()` for SSG. Enhanced markdown renderer. Related posts section. JSON-LD BlogPosting structured data. Full OpenGraph & Twitter card metadata using seoTitle/seoDescription fields.

### FAQ

- **`/faq`** — Server-rendered async page with FAQ schema.org structured data for Google rich results. Accordion UI grouped by category. ISR with API fallback to `@/data/faq.ts`.

### Legal

- **`/legal`** — Index page listing all legal documents with descriptions.
- **`/legal/terms-and-conditions`** — Static hardcoded (critical SEO content).
- **`/legal/privacy-policy`** — Static hardcoded.
- **`/legal/refund-policy`** — Static hardcoded.
- **`/legal/disclaimer`** — Static hardcoded.

## SEO Infrastructure

### Metadata Generation

- Root layout sets `metadataBase`, default title template, OG/Twitter defaults
- Blog listing has custom OG metadata
- Blog articles use `generateMetadata()` with seoTitle/seoDescription overrides, article-type OpenGraph, author info, and cover image
- FAQ has custom OG metadata

### Structured Data (JSON-LD)

- **Blog posts**: `BlogPosting` schema with headline, author, publisher, datePublished
- **FAQ page**: `FAQPage` schema with all Q&A pairs (enables Google rich results)

### sitemap.xml

Generated dynamically at `/sitemap.xml` via `app/sitemap.ts`:
- All static marketing pages
- All dynamic blog post slugs (from API or static fallback)
- Legal pages

### robots.txt

Generated at `/robots.txt` via `app/robots.ts`:
- Allows all crawlers on `/`
- Disallows `/api/`, `/portal/`, `/admin/`
- Points to sitemap

### RSS Feed

Available at `/feed.xml`:
- Standard RSS 2.0 with Atom self-link
- All published blog posts with title, link, description, pubDate, author
- 1-hour cache

## Rendering Strategy

| Page          | Strategy         | Revalidation |
|---------------|------------------|--------------|
| /blog         | SSR + ISR        | 5 minutes    |
| /blog/[slug]  | SSG + ISR        | 5 minutes    |
| /faq          | SSR + ISR        | 5 minutes    |
| /legal/*      | SSG (static)     | Build-time   |
| /sitemap.xml  | Dynamic SSR      | Per request  |
| /robots.txt   | Dynamic SSR      | Per request  |
| /feed.xml     | Dynamic SSR      | 1 hour cache |

## Fallback Pattern

All public pages implement a graceful degradation pattern:

```typescript
async function getData() {
  const apiData = await apiFetch<T>("/endpoint");
  if (apiData) return apiData;
  return staticFallbackData; // from @/data/*.ts
}
```

This ensures the website works at build time without a running API, during API outages, and during initial development before the database is seeded.

## File Structure

```
apps/api/src/
├── blog/
│   ├── dto/blog.dto.ts          # CreateBlogPostDto, UpdateBlogPostDto, Category DTOs
│   ├── blog.service.ts          # CRUD + categories + related posts + slugs
│   ├── blog.controller.ts       # REST endpoints
│   └── blog.module.ts
├── faq/
│   ├── dto/faq.dto.ts           # CreateFaqDto, UpdateFaqDto
│   ├── faq.service.ts           # CRUD
│   └── faq.controller.ts
├── legal/
│   ├── dto/legal.dto.ts         # CreateLegalDocumentDto, UpdateLegalDocumentDto
│   ├── legal.service.ts         # CRUD with versioning
│   └── legal.controller.ts

apps/admin/src/app/(dashboard)/content/
├── blog/
│   ├── page.tsx                 # Blog listing with DataTable
│   └── editor/page.tsx          # Blog create/edit form
├── faq/
│   ├── page.tsx                 # FAQ listing with DataTable
│   └── editor/page.tsx          # FAQ create/edit form
├── legal/
│   ├── page.tsx                 # Legal document listing
│   └── editor/page.tsx          # Legal create/edit form

apps/web/src/
├── app/
│   ├── blog/
│   │   ├── page.tsx             # Blog listing (SSR + ISR)
│   │   └── [slug]/page.tsx      # Blog article (SSG + ISR)
│   ├── faq/page.tsx             # FAQ page (SSR + ISR)
│   ├── legal/
│   │   ├── page.tsx             # Legal index page
│   │   ├── terms-and-conditions/page.tsx
│   │   ├── privacy-policy/page.tsx
│   │   ├── refund-policy/page.tsx
│   │   └── disclaimer/page.tsx
│   ├── feed.xml/route.ts        # RSS feed
│   ├── sitemap.ts               # Dynamic sitemap
│   └── robots.ts                # Robots.txt
├── data/
│   ├── blog.ts                  # Static blog fallback data
│   └── faq.ts                   # Static FAQ fallback data
└── lib/
    └── api.ts                   # API fetch helper with ISR
```
