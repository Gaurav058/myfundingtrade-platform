#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting development environment..."

# Check if Docker services are running
if ! docker compose ps --services --filter "status=running" 2>/dev/null | grep -q postgres; then
  echo "📦 Starting Docker infrastructure (PostgreSQL + Redis)..."
  docker compose up -d postgres redis
  echo "⏳ Waiting for services to be healthy..."
  sleep 5
fi

echo "🏗️  Starting all apps in dev mode..."
pnpm dev
