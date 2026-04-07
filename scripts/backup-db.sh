#!/usr/bin/env bash
set -euo pipefail

# ─── Database Backup Script ──────────────────────────────
# Usage: ./scripts/backup-db.sh [staging|production]
# Run via cron: 0 2 * * * /opt/myfundingtrade/scripts/backup-db.sh production

ENV="${1:-production}"
BACKUP_DIR="/opt/myfundingtrade/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

case "$ENV" in
  production)
    COMPOSE_CMD="docker compose -f docker-compose.yml -f docker-compose.prod.yml"
    DB_USER="${POSTGRES_USER:-mft_prod}"
    DB_NAME="${POSTGRES_DB:-myfundingtrade}"
    ;;
  staging)
    COMPOSE_CMD="docker compose -f docker-compose.yml -f docker-compose.staging.yml"
    DB_USER="${POSTGRES_USER:-mft_staging}"
    DB_NAME="${POSTGRES_DB:-myfundingtrade_staging}"
    ;;
  *)
    echo "Usage: $0 [staging|production]"
    exit 1
    ;;
esac

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting $ENV database backup..."

# Full database dump
BACKUP_FILE="$BACKUP_DIR/${ENV}_db_${TIMESTAMP}.sql.gz"
$COMPOSE_CMD exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup complete: $BACKUP_FILE ($SIZE)"

# Cleanup old backups
find "$BACKUP_DIR" -name "${ENV}_db_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
echo "[$(date)] Cleaned up backups older than ${RETENTION_DAYS} days"

# Optional: sync to remote storage
# aws s3 cp "$BACKUP_FILE" "s3://myfundingtrade-backups/$ENV/"
# echo "[$(date)] Uploaded to S3"
