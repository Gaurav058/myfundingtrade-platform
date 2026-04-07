# ─── Stage 1: Install ─────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
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

# ─── Stage 3: Production ─────────────────────────────────
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/node_modules/.pnpm node_modules/.pnpm

EXPOSE 4000

CMD ["node", "dist/main"]
