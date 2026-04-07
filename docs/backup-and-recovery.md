# Backup and Recovery

> Backup strategies, disaster recovery procedures, and restore guides for the MyFundingTrade platform.

## Table of Contents

- [Backup Strategy Overview](#backup-strategy-overview)
- [PostgreSQL Backups](#postgresql-backups)
- [Redis Persistence](#redis-persistence)
- [Application Data](#application-data)
- [Automated Backup Schedule](#automated-backup-schedule)
- [Remote Backup Storage](#remote-backup-storage)
- [Restore Procedures](#restore-procedures)
- [Disaster Recovery](#disaster-recovery)
- [Monitoring Backup Health](#monitoring-backup-health)

---

## Backup Strategy Overview

| Component    | Method              | Frequency      | Retention   | Location            |
|-------------|---------------------|----------------|-------------|---------------------|
| PostgreSQL  | `pg_dump` (logical) | Every 6 hours  | 30 days     | Local + S3/remote   |
| Redis       | AOF + RDB snapshot  | Continuous + hourly | 7 days  | Docker volume       |
| Uploads/Media | File sync         | Daily          | 90 days     | S3 bucket           |
| Environment | Manual snapshot     | On change      | Indefinite  | Encrypted vault     |
| SSL Certs   | Let's Encrypt auto  | Auto (90 days) | N/A         | `/etc/letsencrypt`  |

**Recovery Point Objectives (RPO):**
- Database: 6 hours (worst case)
- Redis: Near-zero (AOF with `appendfsync everysec`)

**Recovery Time Objectives (RTO):**
- Single service failure: < 5 minutes (Docker restart)
- Full server restore: < 1 hour (from backups)
- Database restore: < 30 minutes (depending on size)

---

## PostgreSQL Backups

### Manual Backup

```bash
# Using the backup script
./scripts/backup-db.sh production

# Direct pg_dump via Docker
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  exec -T postgres pg_dump -U mft_prod myfundingtrade | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Backup Script

The included `scripts/backup-db.sh` handles:
- Full logical dump with compression
- Automatic rotation (configurable retention, default 30 days)
- Support for both staging and production environments
- Optional S3 upload (uncomment in script)

```bash
# Production backup
./scripts/backup-db.sh production

# Staging backup
./scripts/backup-db.sh staging
```

### Backup Formats

| Format            | Command                      | Use Case                    | Size  |
|-------------------|------------------------------|-----------------------------|-------|
| SQL compressed    | `pg_dump \| gzip`            | General backup, portability | Small |
| Custom format     | `pg_dump -Fc`                | Selective restore           | Small |
| Directory format  | `pg_dump -Fd -j4`            | Parallel backup/restore     | Small |
| Plain SQL         | `pg_dump`                    | Human-readable, debugging   | Large |

**For large databases (>1 GB), use directory format with parallel jobs:**
```bash
docker compose exec -T postgres pg_dump -U mft_prod -Fd -j4 -f /tmp/backup_dir myfundingtrade
docker cp $(docker compose ps -q postgres):/tmp/backup_dir ./backups/
```

### Point-in-Time Recovery (PITR)

For point-in-time recovery, enable WAL archiving in PostgreSQL:

```yaml
# Add to docker-compose.prod.yml under postgres command
command: >
  postgres
  -c wal_level=replica
  -c archive_mode=on
  -c archive_command='gzip < %p > /backups/wal/%f.gz'
  -c max_wal_senders=3
```

Then to recover to a specific point:
```bash
# 1. Stop the database
docker compose stop postgres

# 2. Restore the base backup
# 3. Configure recovery.conf with recovery_target_time
# 4. Start PostgreSQL — it will replay WAL up to the target time
```

> **Note:** PITR adds complexity. For most early-stage deployments, regular `pg_dump` backups with 6-hour intervals provide sufficient protection.

---

## Redis Persistence

Redis is configured with two persistence mechanisms:

### Append-Only File (AOF)
- Enabled by default in our compose config (`appendonly yes`)
- Syncs to disk every second (`appendfsync everysec`)
- Nearly zero data loss on crash
- Data stored in the `redis_data` Docker volume

### RDB Snapshots
- Automatic point-in-time snapshots
- Default: save after 3600s if 1 key changed, 300s if 100 keys, 60s if 10000 keys
- Used alongside AOF for faster restart

### Redis Backup

```bash
# Trigger an RDB snapshot
docker compose exec redis redis-cli BGSAVE

# Copy the dump file
docker cp $(docker compose ps -q redis):/data/dump.rdb ./backups/redis_dump_$(date +%Y%m%d).rdb

# Copy AOF file
docker cp $(docker compose ps -q redis):/data/appendonly.aof ./backups/redis_aof_$(date +%Y%m%d).aof
```

### Redis Recovery

Redis data (sessions, cache, job queues) is largely **reconstructible** from the database. After a complete Redis loss:
1. Restart Redis — it recovers from AOF/RDB automatically
2. If AOF is corrupted: `docker compose exec redis redis-check-aof --fix /data/appendonly.aof`
3. If all persistence is lost: restart Redis empty — users will need to re-authenticate, and BullMQ jobs will be re-enqueued

---

## Application Data

### Uploaded Files

If storing user uploads (KYC documents, profile images):

```bash
# Sync uploads to S3
aws s3 sync /opt/myfundingtrade/uploads/ s3://myfundingtrade-uploads/

# Or use the app's S3 integration directly (recommended)
# Files go straight to S3 — no local backup needed
```

### Environment Files

```bash
# Backup environment files (store securely, NOT in git)
cp .env.production /secure-backup/env.production.$(date +%Y%m%d)

# Consider using a secrets manager for production:
# - AWS Secrets Manager
# - HashiCorp Vault
# - 1Password CLI
# - Doppler
```

---

## Automated Backup Schedule

### Crontab Setup

```bash
# Edit crontab for the deploy user
crontab -e

# Add these entries:
# ┌─── Database backup every 6 hours
0 */6 * * * /opt/myfundingtrade/scripts/backup-db.sh production >> /var/log/mft-backup.log 2>&1

# ┌─── Redis RDB snapshot daily at 1 AM
0 1 * * * docker exec $(docker ps -qf name=redis) redis-cli BGSAVE >> /var/log/mft-backup.log 2>&1

# ┌─── Sync backups to S3 daily at 3 AM
0 3 * * * aws s3 sync /opt/myfundingtrade/backups/ s3://myfundingtrade-backups/ --storage-class STANDARD_IA >> /var/log/mft-backup.log 2>&1

# ┌─── SSL cert renewal check daily at 4 AM
0 4 * * * certbot renew --quiet --post-hook 'docker compose -f /opt/myfundingtrade/docker-compose.yml -f /opt/myfundingtrade/docker-compose.prod.yml restart nginx'
```

### Backup Rotation

The backup script automatically cleans up old backups. Default retention:

| Backup Type       | Retention |
|-------------------|-----------|
| Database dumps    | 30 days   |
| Deploy backups    | 7 days    |
| Redis snapshots   | 7 days    |

Modify retention in `scripts/backup-db.sh` by changing the `RETENTION_DAYS` variable.

---

## Remote Backup Storage

### AWS S3

```bash
# Install AWS CLI
apt install awscli -y
aws configure

# Create bucket with versioning
aws s3 mb s3://myfundingtrade-backups
aws s3api put-bucket-versioning \
  --bucket myfundingtrade-backups \
  --versioning-configuration Status=Enabled

# Set lifecycle policy (move to Glacier after 30 days, delete after 365)
aws s3api put-bucket-lifecycle-configuration \
  --bucket myfundingtrade-backups \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "BackupLifecycle",
      "Status": "Enabled",
      "Transitions": [{"Days": 30, "StorageClass": "GLACIER"}],
      "Expiration": {"Days": 365},
      "Filter": {"Prefix": ""}
    }]
  }'
```

### DigitalOcean Spaces

```bash
# Install s3cmd (compatible with Spaces)
apt install s3cmd -y
s3cmd --configure  # Use DO Spaces credentials

# Sync backups
s3cmd sync /opt/myfundingtrade/backups/ s3://mft-backups/
```

### Backblaze B2 (Budget Option)

```bash
# Install B2 CLI
pip install b2
b2 authorize-account <keyID> <applicationKey>

# Sync
b2 sync /opt/myfundingtrade/backups/ b2://mft-backups/
```

---

## Restore Procedures

### Full Database Restore

```bash
# 1. List available backups
ls -lah /opt/myfundingtrade/backups/production_db_*.sql.gz

# 2. Stop the API to prevent writes
docker compose stop api

# 3. Restore the database
gunzip -c /opt/myfundingtrade/backups/production_db_20250101_020000.sql.gz | \
  docker compose exec -T postgres psql -U mft_prod myfundingtrade

# 4. Restart the API
docker compose start api

# 5. Verify
curl -s http://localhost:4000/api/v1/health/ready | jq .
```

### Restore to a Clean Database

```bash
# 1. Drop and recreate the database
docker compose exec postgres psql -U mft_prod -c "DROP DATABASE IF EXISTS myfundingtrade;"
docker compose exec postgres psql -U mft_prod -c "CREATE DATABASE myfundingtrade;"

# 2. Restore from backup
gunzip -c backup_file.sql.gz | \
  docker compose exec -T postgres psql -U mft_prod myfundingtrade

# 3. Verify table counts
docker compose exec postgres psql -U mft_prod myfundingtrade -c "
  SELECT schemaname, relname, n_live_tup
  FROM pg_stat_user_tables
  ORDER BY n_live_tup DESC;"
```

### Restore from S3

```bash
# Download the specific backup
aws s3 cp s3://myfundingtrade-backups/production_db_20250101_020000.sql.gz ./

# Then follow the restore steps above
```

### Selective Table Restore

Using custom format backups:
```bash
# Create a custom format backup first
docker compose exec -T postgres pg_dump -U mft_prod -Fc myfundingtrade > backup.dump

# List tables in backup
pg_restore --list backup.dump

# Restore specific table
pg_restore -U mft_prod -d myfundingtrade --table=users --data-only backup.dump
```

---

## Disaster Recovery

### Scenario 1: Single Service Failure

**Impact:** One Docker container stops
**Recovery time:** < 1 minute

```bash
docker compose restart <service>
# Health check will verify automatically
```

### Scenario 2: Server Reboot

**Impact:** All services restart
**Recovery time:** < 5 minutes

```bash
# Docker containers auto-restart (restart: unless-stopped)
# Verify all services are healthy
docker compose ps
curl -s http://localhost:4000/api/v1/health/ready | jq .
```

### Scenario 3: Data Volume Corruption

**Impact:** Database or Redis data loss
**Recovery time:** 15-30 minutes

```bash
# 1. Stop affected service
docker compose stop postgres

# 2. Remove corrupted volume
docker volume rm myfundingtrade-platform_postgres_data

# 3. Restart PostgreSQL (creates fresh volume)
docker compose up -d postgres
sleep 10

# 4. Restore from latest backup
gunzip -c /opt/myfundingtrade/backups/production_db_LATEST.sql.gz | \
  docker compose exec -T postgres psql -U mft_prod myfundingtrade

# 5. Restart API
docker compose up -d api
```

### Scenario 4: Complete Server Loss

**Impact:** Server destroyed / unrecoverable
**Recovery time:** < 1 hour

```bash
# 1. Provision new server (same specs)
# 2. Install Docker (see deployment.md)
# 3. Clone repository
git clone https://github.com/Gaurav058/myfundingtrade-platform.git /opt/myfundingtrade
cd /opt/myfundingtrade

# 4. Restore environment file from secure backup
cp /secure-backup/.env.production .env.production

# 5. Download latest database backup from S3
aws s3 cp s3://myfundingtrade-backups/production_db_LATEST.sql.gz ./backups/

# 6. Start infrastructure
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres redis
sleep 15

# 7. Restore database
gunzip -c ./backups/production_db_LATEST.sql.gz | \
  docker compose exec -T postgres psql -U mft_prod myfundingtrade

# 8. Obtain new SSL certificates
certbot certonly --standalone -d myfundingtrade.com -d api.myfundingtrade.com ...

# 9. Start all services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 10. Update DNS to point to new server IP
# 11. Verify health
curl -s https://api.myfundingtrade.com/api/v1/health/ready
```

### Scenario 5: Database Migration Failure

**Impact:** Broken schema state
**Recovery time:** 5-15 minutes

```bash
# 1. Check migration status
docker compose exec api npx prisma migrate status

# 2. If the migration partially applied, restore from pre-deploy backup
# (deploy-prod.sh creates a backup before every migration)
ls -la /opt/myfundingtrade/backups/pre_deploy_*.sql.gz

# 3. Restore
gunzip -c /opt/myfundingtrade/backups/pre_deploy_TIMESTAMP.sql.gz | \
  docker compose exec -T postgres psql -U mft_prod myfundingtrade

# 4. Roll back code
git checkout <previous-commit>
docker compose up -d --build api
```

---

## Monitoring Backup Health

### Verification Script

Create a cron job to verify backups are running and valid:

```bash
#!/usr/bin/env bash
# /opt/myfundingtrade/scripts/verify-backup.sh

BACKUP_DIR="/opt/myfundingtrade/backups"
MAX_AGE_HOURS=12

# Check if recent backup exists
LATEST=$(find "$BACKUP_DIR" -name "production_db_*.sql.gz" -mmin -$((MAX_AGE_HOURS * 60)) | head -1)

if [[ -z "$LATEST" ]]; then
  echo "ALERT: No database backup found in the last ${MAX_AGE_HOURS} hours!"
  # Send alert (email, Slack webhook, etc.)
  exit 1
fi

# Check backup is not empty (minimum 1 KB)
SIZE=$(stat -f%z "$LATEST" 2>/dev/null || stat -c%s "$LATEST")
if [[ "$SIZE" -lt 1024 ]]; then
  echo "ALERT: Latest backup appears empty: $LATEST ($SIZE bytes)"
  exit 1
fi

echo "OK: Latest backup is valid: $LATEST ($(du -h "$LATEST" | cut -f1))"
```

### Backup Size Tracking

Monitor backup sizes to detect anomalies:

```bash
# Add to cron — logs backup sizes for trend analysis
ls -la /opt/myfundingtrade/backups/production_db_*.sql.gz | \
  awk '{print $5, $9}' >> /var/log/mft-backup-sizes.log
```

### Restoration Testing

**Monthly:** Test restoring a backup to a separate database instance:

```bash
# Create a test database
docker compose exec postgres createdb -U mft_prod myfundingtrade_restore_test

# Restore latest backup
gunzip -c /opt/myfundingtrade/backups/production_db_LATEST.sql.gz | \
  docker compose exec -T postgres psql -U mft_prod myfundingtrade_restore_test

# Verify row counts match
docker compose exec postgres psql -U mft_prod myfundingtrade_restore_test -c \
  "SELECT count(*) FROM users;"

# Clean up
docker compose exec postgres dropdb -U mft_prod myfundingtrade_restore_test
```
