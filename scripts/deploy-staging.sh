#!/usr/bin/env bash
set -euo pipefail

# ─── Staging Deploy Script ───────────────────────────────
# Usage: ./scripts/deploy-staging.sh

COMPOSE_CMD="docker compose -f docker-compose.yml -f docker-compose.staging.yml"

echo "═══════════════════════════════════════════"
echo "  MyFundingTrade — Staging Deploy"
echo "═══════════════════════════════════════════"
echo ""

if [ ! -f .env.staging ]; then
  echo "❌ .env.staging not found. Copy from .env.staging.example and fill in values."
  exit 1
fi

echo "▶ Pulling latest images..."
$COMPOSE_CMD pull

echo "▶ Running database migrations..."
$COMPOSE_CMD run --rm api npx prisma migrate deploy

echo "▶ Restarting services..."
$COMPOSE_CMD up -d --remove-orphans

echo "▶ Waiting for health checks..."
sleep 10

MAX_RETRIES=12
RETRY=0
until curl -sf http://localhost:4000/api/v1/health > /dev/null 2>&1; do
  RETRY=$((RETRY + 1))
  if [ $RETRY -ge $MAX_RETRIES ]; then
    echo "❌ API health check failed!"
    exit 1
  fi
  echo "  Waiting for API... (attempt $RETRY/$MAX_RETRIES)"
  sleep 5
done

echo ""
echo "✅ Staging deployment complete!"
$COMPOSE_CMD ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
