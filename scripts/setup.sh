#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Setting up myfundingtrade-platform..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Install v20+."; exit 1; }
command -v pnpm >/dev/null 2>&1 || { echo "❌ pnpm is required. Run: corepack enable && corepack prepare pnpm@9.15.4 --activate"; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy env
if [ ! -f .env ]; then
  echo "📄 Creating .env from .env.example..."
  cp .env.example .env
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
pnpm db:generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start infrastructure:  pnpm docker:up   (starts PostgreSQL + Redis)"
echo "  2. Push DB schema:        pnpm db:push"
echo "  3. Start development:     pnpm dev"
echo ""
echo "Services will be available at:"
echo "  Web:    http://localhost:3000"
echo "  Portal: http://localhost:3001"
echo "  Admin:  http://localhost:3002"
echo "  API:    http://localhost:4000"
echo "  Docs:   http://localhost:4000/api/docs"
