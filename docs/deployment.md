# Deployment Guide

> Complete deployment reference for the MyFundingTrade platform.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Docker Deployment (VPS / DigitalOcean / AWS EC2)](#docker-deployment-vps)
- [Vercel Deployment (Frontend Apps)](#vercel-deployment-frontend)
- [Backend Deployment (AWS / DigitalOcean)](#backend-deployment)
- [SSL / TLS Setup](#ssl-tls-setup)
- [DNS Configuration](#dns-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Configuration](#environment-configuration)
- [Database Migrations](#database-migrations)
- [Monitoring & Logging](#monitoring--logging)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
                    ┌──────────────────────────────────┐
                    │           Cloudflare DNS          │
                    │    myfundingtrade.com (A record)  │
                    └──────────┬───────────────────────┘
                               │
                    ┌──────────▼───────────────────────┐
                    │         NGINX (Reverse Proxy)     │
                    │   SSL termination, rate limiting  │
                    │         gzip, security headers    │
                    └──┬───────┬────────┬──────────┬───┘
                       │       │        │          │
              ┌────────▼──┐ ┌─▼─────┐ ┌▼───────┐ ┌▼──────┐
              │  API :4000 │ │Web    │ │Portal  │ │Admin  │
              │  NestJS    │ │:3000  │ │:3001   │ │:3002  │
              │            │ │Next.js│ │Next.js │ │Next.js│
              └──┬──────┬──┘ └───────┘ └────────┘ └───────┘
                 │      │
         ┌───────▼──┐ ┌▼────────┐
         │PostgreSQL │ │ Redis   │
         │  :5432    │ │ :6379   │
         └───────────┘ └─────────┘
```

**Services:**

| Service    | Port | Technology   | Description                          |
|------------|------|-------------|--------------------------------------|
| API        | 4000 | NestJS      | REST API, business logic, auth       |
| Web        | 3000 | Next.js     | Public marketing website             |
| Portal     | 3001 | Next.js     | Trader dashboard                     |
| Admin      | 3002 | Next.js     | Admin management panel               |
| PostgreSQL | 5432 | PostgreSQL 16 | Primary database                   |
| Redis      | 6379 | Redis 7     | Caching, sessions, job queues        |
| NGINX      | 80/443 | NGINX     | Reverse proxy, SSL, rate limiting    |

---

## Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Docker** >= 24.0 & **Docker Compose** v2
- **Git**

For production servers:
- Ubuntu 22.04 LTS or later (recommended)
- Minimum 2 vCPU, 4 GB RAM, 40 GB SSD
- Domain name with DNS access
- SSH access to the server

---

## Local Development

### First-time setup

```bash
# Clone and install
git clone https://github.com/Gaurav058/myfundingtrade-platform.git
cd myfundingtrade-platform
pnpm install

# Generate Prisma client
pnpm db:generate

# Start infrastructure (Postgres + Redis)
docker compose up postgres redis -d

# Push database schema
pnpm db:push

# Seed database (optional)
pnpm db:seed

# Start all apps in dev mode
pnpm dev
```

### Using Docker for everything

```bash
# Build and start all services
pnpm docker:build
pnpm docker:up

# View logs
docker compose logs -f api

# Stop everything
pnpm docker:down
```

**Local URLs:**
- Web: http://localhost:3000
- Portal: http://localhost:3001
- Admin: http://localhost:3002
- API: http://localhost:4000/api/v1
- Health: http://localhost:4000/api/v1/health

---

## Docker Deployment (VPS) {#docker-deployment-vps}

This is the recommended approach for a single VPS (DigitalOcean Droplet, AWS EC2, Hetzner, etc.).

### 1. Server Preparation

```bash
# SSH into your server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker

# Install Docker Compose plugin
apt install docker-compose-plugin -y

# Create non-root deploy user
adduser deploy
usermod -aG docker deploy
su - deploy

# Clone repository
git clone https://github.com/Gaurav058/myfundingtrade-platform.git /opt/myfundingtrade
cd /opt/myfundingtrade
```

### 2. Configure Environment

```bash
# Copy and edit production environment
cp .env.production.example .env.production

# IMPORTANT: Change ALL placeholder values
nano .env.production
```

**Critical values to set:**
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection with password
- `JWT_SECRET` — Generate with `openssl rand -base64 64`
- `COOKIE_SECRET` — Generate with `openssl rand -base64 32`
- `STRIPE_SECRET_KEY` — Live Stripe key (starts with `sk_live_`)
- `STRIPE_WEBHOOK_SECRET` — From Stripe dashboard
- `RESEND_API_KEY` — Email provider key
- `ALLOWED_ORIGINS` — Your domain(s)

### 3. SSL Certificate Setup

```bash
# Install certbot
apt install certbot -y

# Get certificates (stop nginx first if running)
certbot certonly --standalone \
  -d myfundingtrade.com \
  -d www.myfundingtrade.com \
  -d api.myfundingtrade.com \
  -d portal.myfundingtrade.com \
  -d admin.myfundingtrade.com

# Generate DH parameters
openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048

# Set up auto-renewal cron
echo "0 3 * * * certbot renew --quiet --post-hook 'docker compose -f /opt/myfundingtrade/docker-compose.yml -f /opt/myfundingtrade/docker-compose.prod.yml restart nginx'" | crontab -
```

### 4. Deploy

```bash
# Build and start production
docker compose -f docker-compose.yml -f docker-compose.prod.yml build
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# OR use the deploy script
./scripts/deploy-prod.sh

# Verify health
curl http://localhost:4000/api/v1/health
curl http://localhost:4000/api/v1/health/ready
```

### 5. Subsequent Deployments

```bash
# Pull latest code
git pull origin main

# Run the production deploy script
./scripts/deploy-prod.sh
```

The deploy script handles: backup → pull images → migrate → restart → health check → cleanup.

---

## Vercel Deployment (Frontend) {#vercel-deployment-frontend}

For frontend apps, Vercel provides automatic deployments, edge CDN, and zero-config scaling.

### Setup for Each App

1. **Import the monorepo** on [vercel.com/new](https://vercel.com/new)
2. Configure each app as a separate Vercel project:

#### Web (Marketing Site)

| Setting           | Value                                      |
|-------------------|--------------------------------------------|
| Root Directory    | `apps/web`                                 |
| Framework Preset  | Next.js                                    |
| Build Command     | `cd ../.. && pnpm turbo build --filter=@myfundingtrade/web` |
| Output Directory  | `.next`                                    |
| Install Command   | `pnpm install`                             |
| Node.js Version   | 20.x                                       |

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://api.myfundingtrade.com/api/v1
NEXT_PUBLIC_APP_URL=https://myfundingtrade.com
```

#### Portal (Trader Dashboard)

| Setting           | Value                                      |
|-------------------|--------------------------------------------|
| Root Directory    | `apps/portal`                              |
| Framework Preset  | Next.js                                    |
| Build Command     | `cd ../.. && pnpm turbo build --filter=@myfundingtrade/portal` |
| Output Directory  | `.next`                                    |
| Install Command   | `pnpm install`                             |

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://api.myfundingtrade.com/api/v1
NEXT_PUBLIC_APP_URL=https://portal.myfundingtrade.com
```

#### Admin Panel

| Setting           | Value                                      |
|-------------------|--------------------------------------------|
| Root Directory    | `apps/admin`                               |
| Framework Preset  | Next.js                                    |
| Build Command     | `cd ../.. && pnpm turbo build --filter=@myfundingtrade/admin` |
| Output Directory  | `.next`                                    |
| Install Command   | `pnpm install`                             |

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://api.myfundingtrade.com/api/v1
NEXT_PUBLIC_APP_URL=https://admin.myfundingtrade.com
```

### Vercel Domain Configuration

For each project, go to **Settings → Domains** and add:
- Web: `myfundingtrade.com`, `www.myfundingtrade.com`
- Portal: `portal.myfundingtrade.com`
- Admin: `admin.myfundingtrade.com`

### Monorepo Optimization

In each Vercel project, set **Ignored Build Step** to only rebuild when relevant files change:

```bash
# For web app
npx turbo-ignore @myfundingtrade/web

# For portal
npx turbo-ignore @myfundingtrade/portal

# For admin
npx turbo-ignore @myfundingtrade/admin
```

---

## Backend Deployment {#backend-deployment}

### Option A: DigitalOcean Droplet (Recommended for Start)

**Recommended Spec:** 2 vCPU, 4 GB RAM ($24/mo)

```bash
# 1. Create droplet via CLI or dashboard
doctl compute droplet create mft-api \
  --region nyc3 \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --ssh-keys <your-key-fingerprint>

# 2. Follow "Docker Deployment (VPS)" section above

# 3. Enable DigitalOcean firewall
doctl compute firewall create \
  --name mft-firewall \
  --inbound-rules "protocol:tcp,ports:22,address:0.0.0.0/0 protocol:tcp,ports:80,address:0.0.0.0/0 protocol:tcp,ports:443,address:0.0.0.0/0" \
  --outbound-rules "protocol:tcp,ports:all,address:0.0.0.0/0 protocol:udp,ports:all,address:0.0.0.0/0" \
  --droplet-ids <droplet-id>
```

**Scaling path:** When you outgrow a single droplet:
1. Move PostgreSQL to DigitalOcean Managed Database ($15/mo)
2. Move Redis to DigitalOcean Managed Redis ($15/mo)
3. Run API on multiple droplets behind a Load Balancer

### Option B: AWS EC2

```bash
# 1. Launch EC2 instance
# - AMI: Ubuntu 22.04 LTS
# - Instance type: t3.medium (2 vCPU, 4 GB)
# - Storage: 40 GB gp3
# - Security group: allow 22, 80, 443

# 2. SSH in and follow "Docker Deployment (VPS)" section

# 3. Associate Elastic IP for static address
aws ec2 allocate-address --domain vpc
aws ec2 associate-address --instance-id <id> --allocation-id <alloc-id>
```

**AWS scaling path:**
1. Move to RDS for PostgreSQL (Multi-AZ)
2. Move to ElastiCache for Redis
3. Use ALB + ECS Fargate for container orchestration
4. Consider Aurora Serverless for variable workloads

### Option C: Managed Container Services

For teams preferring managed infrastructure:

| Service                    | Pros                            | Monthly Cost (est.)  |
|----------------------------|---------------------------------|----------------------|
| DigitalOcean App Platform  | Simple, built-in DB             | ~$30-50              |
| AWS ECS Fargate            | Auto-scaling, no server mgmt    | ~$50-100             |
| Railway                    | Git-push deploy, simple         | ~$20-40              |
| Render                     | Auto-deploy, managed Postgres   | ~$30-50              |

---

## SSL / TLS Setup {#ssl-tls-setup}

### Let's Encrypt (Self-managed VPS)

Already configured in `nginx/nginx.conf`. Certificates are expected at:
```
/etc/letsencrypt/live/myfundingtrade.com/fullchain.pem
/etc/letsencrypt/live/myfundingtrade.com/privkey.pem
```

**Initial setup:**
```bash
# Stop nginx temporarily
docker compose stop nginx

# Obtain certificates
certbot certonly --standalone \
  -d myfundingtrade.com \
  -d www.myfundingtrade.com \
  -d api.myfundingtrade.com \
  -d portal.myfundingtrade.com \
  -d admin.myfundingtrade.com

# Start nginx
docker compose start nginx
```

**Auto-renewal:** Add to crontab:
```cron
0 3 * * * certbot renew --quiet --post-hook 'docker compose -f /opt/myfundingtrade/docker-compose.yml -f /opt/myfundingtrade/docker-compose.prod.yml restart nginx'
```

### Cloudflare (Recommended with Vercel Frontend)

If using Vercel for frontends and Docker for backend:
1. Point domain NS to Cloudflare
2. Set SSL mode to **Full (Strict)** for backend
3. Vercel handles SSL automatically for frontend domains

---

## DNS Configuration {#dns-configuration}

### All-Docker Setup (Single VPS)

| Record | Name                        | Value            | Proxy |
|--------|-----------------------------|------------------|-------|
| A      | myfundingtrade.com          | `<server-ip>`    | Yes   |
| A      | www.myfundingtrade.com      | `<server-ip>`    | Yes   |
| A      | api.myfundingtrade.com      | `<server-ip>`    | Yes   |
| A      | portal.myfundingtrade.com   | `<server-ip>`    | Yes   |
| A      | admin.myfundingtrade.com    | `<server-ip>`    | Yes   |

### Hybrid Setup (Vercel Frontend + VPS Backend)

| Record | Name                        | Value                        | Proxy |
|--------|-----------------------------|------------------------------|-------|
| CNAME  | myfundingtrade.com          | `cname.vercel-dns.com`       | No    |
| CNAME  | www.myfundingtrade.com      | `cname.vercel-dns.com`       | No    |
| A      | api.myfundingtrade.com      | `<server-ip>`                | Yes   |
| CNAME  | portal.myfundingtrade.com   | `cname.vercel-dns.com`       | No    |
| CNAME  | admin.myfundingtrade.com    | `cname.vercel-dns.com`       | No    |

---

## CI/CD Pipeline {#cicd-pipeline}

The pipeline is defined in `.github/workflows/ci.yml`:

```
Push to any branch:
  ├── Lint (ESLint + Prettier format check)
  ├── Typecheck (tsc --noEmit)
  └── Build (turbo build)

Push to develop:
  └── All above + Docker build → GHCR push → Staging deploy (SSH)

Push to main:
  └── All above + Docker build → GHCR push (tagged as latest)
  └── Production deploy: MANUAL (run ./scripts/deploy-prod.sh)
```

### GitHub Secrets Required

| Secret               | Description                                  |
|----------------------|----------------------------------------------|
| `STAGING_HOST`       | Staging server IP address                    |
| `STAGING_USER`       | SSH user on staging server (e.g., `deploy`)  |
| `STAGING_SSH_KEY`    | Private SSH key for staging server           |

### GitHub Container Registry (GHCR)

Docker images are pushed to `ghcr.io/gaurav058/myfundingtrade-platform/*`:
- `ghcr.io/gaurav058/myfundingtrade-platform/api:latest`
- `ghcr.io/gaurav058/myfundingtrade-platform/web:latest`
- `ghcr.io/gaurav058/myfundingtrade-platform/portal:latest`
- `ghcr.io/gaurav058/myfundingtrade-platform/admin:latest`

Images are tagged with: branch name, commit SHA, and `latest` (for main branch).

---

## Environment Configuration {#environment-configuration}

### File Structure

```
.env                        # Local development (git-ignored)
.env.production             # Production values (git-ignored)
.env.staging                # Staging values (git-ignored)
.env.production.example     # Template with placeholders (committed)
.env.staging.example        # Template with placeholders (committed)
```

### Generating Secrets

```bash
# JWT Secret (64 bytes)
openssl rand -base64 64

# Cookie Secret (32 bytes)
openssl rand -base64 32

# Redis Password
openssl rand -hex 32

# PostgreSQL Password
openssl rand -hex 24
```

### Environment Validation

The API validates required environment variables at startup via `apps/api/src/config/env.validation.ts`. Missing or invalid values cause the app to fail fast with descriptive errors.

**Always required:** `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`

**Required in production (NODE_ENV=production):** `REDIS_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `COOKIE_SECRET`

---

## Database Migrations {#database-migrations}

### Development

```bash
# After schema changes, create a migration
pnpm db:migrate -- --name descriptive_name

# Or push schema directly (dev only)
pnpm db:push
```

### Production

Migrations are run automatically by the deploy script. To run manually:

```bash
# Via Docker
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  exec api npx prisma migrate deploy

# Direct (if Node.js available on server)
cd apps/api && DATABASE_URL="..." npx prisma migrate deploy
```

**Safety rules:**
- Never use `db:push` in production — always use `migrate deploy`
- Always back up the database before migrating
- Test migrations on staging first
- Keep migrations small and reversible when possible

---

## Monitoring & Logging {#monitoring--logging}

### Health Checks

| Endpoint           | Purpose          | Expected Response |
|--------------------|------------------|-------------------|
| `GET /api/v1/health` | Liveness probe  | `{"status":"ok"}` — always returns 200 |
| `GET /api/v1/health/ready` | Readiness probe | Checks DB + Redis connectivity |

```bash
# Quick health check
curl -s http://localhost:4000/api/v1/health | jq .

# Full readiness check
curl -s http://localhost:4000/api/v1/health/ready | jq .
```

### Docker Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api

# Last 100 lines
docker compose logs --tail 100 api
```

Logs are configured with JSON format and rotation (10 MB max, 3 files retained).

### Recommended Monitoring Stack

For production, consider adding:

1. **Uptime monitoring:** UptimeRobot, Better Stack, or Checkly — ping `/api/v1/health` every 60s
2. **Log aggregation:** Grafana Loki, Datadog, or Papertrail
3. **APM:** Sentry for error tracking (add `@sentry/nestjs` to API)
4. **Metrics:** Prometheus + Grafana for system/app metrics

### Basic Server Monitoring

```bash
# Add to crontab for disk space alerts
0 * * * * df -h / | awk 'NR==2{if($5+0 > 85) print "DISK WARNING: "$5" used"}' | mail -s "Disk Alert" admin@myfundingtrade.com
```

---

## Rollback Procedures {#rollback-procedures}

### Application Rollback

```bash
# Check what's currently running
docker compose ps

# Roll back to a specific image tag (commit SHA)
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
# Edit docker-compose.prod.yml to pin the image tag, then:
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d api

# Or roll back via git
git log --oneline -5           # Find the commit to roll back to
git checkout <commit-hash>
./scripts/deploy-prod.sh --skip-backup
```

### Database Rollback

```bash
# List available backups
ls -la /opt/myfundingtrade/backups/

# Restore from backup
gunzip -c /opt/myfundingtrade/backups/production_db_20250101_020000.sql.gz | \
  docker compose exec -T postgres psql -U mft_prod myfundingtrade
```

### Emergency Procedures

1. **Service down:** `docker compose restart <service>`
2. **Full restart:** `docker compose down && docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d`
3. **Database corruption:** Restore from backup (see [Backup and Recovery](./backup-and-recovery.md))
4. **Redis issues:** `docker compose restart redis` (data persisted via AOF)

---

## Troubleshooting {#troubleshooting}

### Common Issues

**Container won't start:**
```bash
docker compose logs <service>          # Check for errors
docker compose exec <service> sh       # Shell into container
```

**Database connection refused:**
```bash
docker compose exec postgres pg_isready -U mft_prod
docker compose logs postgres
```

**Redis connection issues:**
```bash
docker compose exec redis redis-cli ping
# With password:
docker compose exec redis redis-cli -a <password> ping
```

**NGINX 502 Bad Gateway:**
```bash
# Check if upstream services are healthy
curl http://localhost:4000/api/v1/health
curl http://localhost:3000
# Check nginx logs
docker compose logs nginx
```

**Port already in use:**
```bash
lsof -i :4000    # Find process using the port
kill <pid>        # Or change the port in .env
```

**Prisma migration failed:**
```bash
# Check migration status
docker compose exec api npx prisma migrate status

# Reset (DESTRUCTIVE — dev only)
docker compose exec api npx prisma migrate reset
```

### Performance Checklist

- [ ] PostgreSQL connection pooling configured (default: 10 connections)
- [ ] Redis maxmemory set (256 MB default in compose)
- [ ] NGINX gzip enabled for text responses
- [ ] Static assets served with long cache headers
- [ ] Docker resource limits set in production compose
- [ ] Log rotation configured (10 MB max, 3 files)
