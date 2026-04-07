# ─── Stage 1: Install ─────────────────────────────────────
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat curl && \
    corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# ─── Stage 2: Build ──────────────────────────────────────
FROM base AS build
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY packages/types/package.json packages/types/
COPY packages/config/package.json packages/config/
RUN pnpm install --frozen-lockfile

COPY packages/types/ packages/types/
COPY packages/config/ packages/config/
COPY apps/api/ apps/api/

RUN pnpm --filter @myfundingtrade/api run db:generate
RUN pnpm --filter @myfundingtrade/api run build

# Prune dev dependencies
RUN pnpm --filter @myfundingtrade/api deploy --prod /app/pruned

# ─── Stage 3: Production ─────────────────────────────────
FROM node:20-alpine AS production
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

ENV NODE_ENV=production

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
USER nestjs

COPY --from=build --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/apps/api/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/pruned/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/apps/api/package.json ./

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/api/v1/health || exit 1

CMD ["node", "dist/main"]
