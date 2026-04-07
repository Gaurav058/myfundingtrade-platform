#!/usr/bin/env bash
set -euo pipefail

# ─── Production Deploy Script ────────────────────────────
# Usage: ./scripts/deploy-prod.sh [--skip-backup]
#
# This script:
#   1. Backs up the database
#   2. Pulls latest images
#   3. Runs database migrations
#   4. Restarts services with zero-downtime
#   5. Verifies health checks

COMPOSE_CMD="docker compose -f docker-compose.yml -f docker-compose.prod.yml"
BACKUP_DIR="/opt/myfundingtrade/backups"
SKIP_BACKUP=false

for arg in "$@"; do
  case $arg in
    --skip-backup) SKIP_BACKUP=true ;;
  esac
done

echo "═══════════════════════════════════════════"
echo "  MyFundingTrade — Production Deploy"
echo "═══════════════════════════════════════════"
echo ""

# 1. Pre-flight checks
echo "▶ Pre-flight checks..."
if [ ! -f .env.production ]; then
  echo "❌ .env.production not found. Copy from .env.production.example and fill in values."
  exit 1
fi

# 2. Database backup
if [ "$SKIP_BACKUP" = false ]; then
  echo "▶ Backing up database..."
  mkdir -p "$BACKUP_DIR"
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  $COMPOSE_CMD exec -T postgres pg_dump -U "${POSTGRES_USER:-mft_prod}" "${POSTGRES_DB:-myfundingtrade}" | gzip > "$BACKUP_DIR/db_${TIMESTAMP}.sql.gz"
  echo "  ✅ Backup saved to $BACKUP_DIR/db_${TIMESTAMP}.sql.gz"

  # Keep only last 7 backups
  ls -t "$BACKUP_DIR"/db_*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm
else
  echo "⏭️  Skipping database backup (--skip-backup)"
fi

# 3. Pull latest images
echo "▶ Pulling latest images..."
$COMPOSE_CMD pull

# 4. Run database migrations (if needed)
echo "▶ Running database migrations..."
$COMPOSE_CMD run --rm api npx prisma migrate deploy

# 5. Rolling restart
echo "▶ Restarting services..."
$COMPOSE_CMD up -d --remove-orphans

# 6. Wait for health checks
echo "▶ Waiting for health checks..."
sleep 10

MAX_RETRIES=12
RETRY=0
until curl -sf http://localhost:4000/api/v1/health > /dev/null 2>&1; do
  RETRY=$((RETRY + 1))
  if [ $RETRY -ge $MAX_RETRIES ]; then
    echo "❌ API health check failed after ${MAX_RETRIES} retries!"
    echo "  Check logs: $COMPOSE_CMD logs api --tail 50"
    exit 1
  fi
  echo "  Waiting for API... (attempt $RETRY/$MAX_RETRIES)"
  sleep 5
done

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Services:"
$COMPOSE_CMD ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# 7. Cleanup
echo ""
echo "▶ Cleaning up old images..."
docker image prune -f
