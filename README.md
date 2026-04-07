# MyFundingTrade Platform

Production-grade prop trading evaluation and funding platform. Traders purchase challenges, prove their edge under defined risk parameters, and receive funded trading accounts with profit-sharing.

---

## Tech Stack

| Layer          | Technology                                   |
|----------------|----------------------------------------------|
| **Monorepo**   | pnpm Workspaces + Turborepo                  |
| **Frontend**   | Next.js 15 (App Router) + React 19 + Tailwind CSS v4 |
| **Backend**    | NestJS 10 + Prisma ORM + PostgreSQL          |
| **Auth**       | JWT (access + refresh tokens) + bcrypt        |
| **Cache**      | Redis 7                                      |
| **Infra**      | Docker Compose + Nginx reverse proxy         |
| **CI/CD**      | GitHub Actions (lint → typecheck → build)     |
| **Language**   | TypeScript (strict mode) throughout           |

---

## Project Structure

```
myfundingtrade-platform/
├── apps/
│   ├── web/          # Public marketing site          (localhost:3000)
│   ├── portal/       # Trader dashboard               (localhost:3001)
│   ├── admin/        # Internal admin panel            (localhost:3002)
│   └── api/          # NestJS REST API + Prisma        (localhost:4000)
├── packages/
│   ├── ui/           # Shared design system components
│   ├── config/       # Shared ESLint / TSConfig / Prettier
│   ├── types/        # Shared TypeScript types & DTOs
│   └── utils/        # Shared utility functions
├── docker/           # Dockerfiles for each app
├── nginx/            # Nginx reverse proxy config
├── scripts/          # Developer automation scripts
├── docs/             # Architecture documentation
└── .github/
    └── workflows/    # CI pipeline
```

---

## Prerequisites

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 9.0.0 (`corepack enable && corepack prepare pnpm@9.15.4 --activate`)
- **Docker** & **Docker Compose** (for PostgreSQL, Redis, and production builds)

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/myfundingtrade-platform.git
cd myfundingtrade-platform

# 2. Run setup script (installs deps, creates .env, generates Prisma client)
chmod +x scripts/setup.sh && ./scripts/setup.sh

# 3. Start infrastructure (PostgreSQL + Redis)
pnpm docker:up

# 4. Push database schema
pnpm db:push

# 5. Start all apps in development mode
pnpm dev
```

### Services After Startup

| Service       | URL                              |
|---------------|----------------------------------|
| Public Site   | http://localhost:3000             |
| Trader Portal | http://localhost:3001             |
| Admin Panel   | http://localhost:3002             |
| API           | http://localhost:4000             |
| Swagger Docs  | http://localhost:4000/api/docs    |

---

## Workspace Commands

### Development

```bash
pnpm dev                    # Start all apps in dev mode (parallel)
pnpm build                  # Build all apps and packages
pnpm lint                   # Lint all workspaces
pnpm lint:fix               # Auto-fix lint issues
pnpm typecheck              # Run TypeScript type checking
pnpm format                 # Format code with Prettier
pnpm format:check           # Check formatting without writing
pnpm clean                  # Remove all build artifacts and node_modules
```

### Database (Prisma)

```bash
pnpm db:generate            # Generate Prisma client from schema
pnpm db:push                # Push schema to database (no migration)
pnpm db:migrate             # Create and apply migrations
pnpm db:seed                # Seed database with sample data
```

### Docker

```bash
pnpm docker:up              # Start all containers (detached)
pnpm docker:down            # Stop and remove all containers
pnpm docker:build           # Build all Docker images
```

### Filtering (run commands for a single app)

```bash
pnpm --filter @myfundingtrade/web dev
pnpm --filter @myfundingtrade/api build
pnpm --filter @myfundingtrade/portal typecheck
```

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable                  | Description                          | Default                          |
|---------------------------|--------------------------------------|----------------------------------|
| `DATABASE_URL`            | PostgreSQL connection string         | `postgresql://postgres:postgres@localhost:5432/myfundingtrade` |
| `REDIS_URL`               | Redis connection string              | `redis://localhost:6379`         |
| `API_PORT`                | API server port                      | `4000`                           |
| `JWT_SECRET`              | JWT signing secret                   | `change-me-in-production`        |
| `JWT_EXPIRATION`          | Access token TTL                     | `15m`                            |
| `JWT_REFRESH_EXPIRATION`  | Refresh token TTL                    | `7d`                             |
| `NEXT_PUBLIC_API_URL`     | API URL for frontends                | `http://localhost:4000`          |
| `NEXT_PUBLIC_APP_URL`     | Public site URL                      | `http://localhost:3000`          |
| `NEXT_PUBLIC_PORTAL_URL`  | Portal URL                           | `http://localhost:3001`          |
| `NEXT_PUBLIC_ADMIN_URL`   | Admin panel URL                      | `http://localhost:3002`          |
| `STRIPE_SECRET_KEY`       | Stripe API secret key                | —                                |
| `STRIPE_WEBHOOK_SECRET`   | Stripe webhook signing secret        | —                                |
| `SMTP_HOST` / `SMTP_PORT` | Email SMTP server                   | —                                |

---

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on pushes and PRs to `main` and `develop`:

1. **Lint** — ESLint across all workspaces
2. **Typecheck** — TypeScript strict mode verification
3. **Build** — Full production build (runs after lint + typecheck pass)

---

## Docker Production Build

```bash
# Build all images
docker compose build

# Start everything (API + all frontends + Postgres + Redis + Nginx)
docker compose up -d

# View logs
docker compose logs -f api
```

The Nginx reverse proxy routes by subdomain:
- `myfundingtrade.com` → Web
- `portal.myfundingtrade.com` → Portal
- `admin.myfundingtrade.com` → Admin
- `api.myfundingtrade.com` → API

---

## API Documentation

Once the API is running, interactive Swagger documentation is available at:

```
http://localhost:4000/api/docs
```

### Available Endpoints (v1)

| Method | Endpoint                       | Description                |
|--------|--------------------------------|----------------------------|
| GET    | `/api/v1/health`               | Health check               |
| POST   | `/api/v1/auth/register`        | Register new trader        |
| POST   | `/api/v1/auth/login`           | Authenticate               |
| GET    | `/api/v1/users`                | List users (admin)         |
| GET    | `/api/v1/users/:id`            | Get user by ID             |
| GET    | `/api/v1/challenges/plans`     | List challenge plans       |
| GET    | `/api/v1/challenges/user/:id`  | Get user's challenges      |

---

## License

Proprietary. All rights reserved.
