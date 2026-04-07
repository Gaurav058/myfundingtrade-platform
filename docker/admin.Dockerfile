# ─── Stage 1: Install ─────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# ─── Stage 2: Build ──────────────────────────────────────
FROM base AS build
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/admin/package.json apps/admin/
COPY packages/ui/package.json packages/ui/
COPY packages/types/package.json packages/types/
COPY packages/utils/package.json packages/utils/
COPY packages/config/package.json packages/config/
RUN pnpm install --frozen-lockfile

COPY packages/ packages/
COPY apps/admin/ apps/admin/

RUN pnpm --filter @myfundingtrade/admin build

# ─── Stage 3: Production ─────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/apps/admin/.next/standalone ./
COPY --from=build /app/apps/admin/.next/static ./.next/static
COPY --from=build /app/apps/admin/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
