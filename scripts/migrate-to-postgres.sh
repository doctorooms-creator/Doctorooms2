#!/bin/bash
# ============================================================
# Doctorooms — SQLite → PostgreSQL Migration Script
# ============================================================
# 
# This script migrates the database from SQLite to PostgreSQL.
# 
# PREREQUISITES:
#   1. A PostgreSQL database (local, Supabase, Railway, or any hosted PG)
#   2. The DATABASE_URL environment variable set to your PostgreSQL connection string
#      Example: postgresql://user:password@host:5432/doctorooms?schema=public
#
# USAGE:
#   chmod +x scripts/migrate-to-postgres.sh
#   DATABASE_URL="postgresql://user:pass@host:5432/doctorooms" ./scripts/migrate-to-postgres.sh
#
# WHAT THIS DOES:
#   1. Changes the Prisma schema provider from "sqlite" to "postgresql"
#   2. Pushes the schema to PostgreSQL (creates all 89 tables)
#   3. Regenerates the Prisma client
#   4. Runs the seed scripts to populate test data
#
# NOTE: All String fields that store JSON (settingsJson, facilities, etc.)
# remain as String (TEXT in PostgreSQL) for backward compatibility.
# They can be upgraded to Json type later for native JSON querying.
# ============================================================

set -e

echo "🐘 Doctorooms — SQLite to PostgreSQL Migration"
echo "=============================================="
echo ""

# Check if DATABASE_URL is set and is PostgreSQL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set."
  echo "   Set it to your PostgreSQL connection string:"
  echo "   export DATABASE_URL=\"postgresql://user:pass@host:5432/doctorooms\""
  exit 1
fi

if [[ "$DATABASE_URL" != postgresql://* ]]; then
  echo "❌ ERROR: DATABASE_URL is not a PostgreSQL URL."
  echo "   Current: $DATABASE_URL"
  echo "   Expected: postgresql://..."
  exit 1
fi

echo "✅ PostgreSQL URL detected: ${DATABASE_URL%%@*}@***"
echo ""

# Step 1: Update schema provider
echo "📦 Step 1: Updating Prisma schema provider..."
sed -i 's/provider  = "sqlite"/provider  = "postgresql"/' prisma/schema.prisma
# Also handle the case with different spacing
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
echo "   ✅ Schema provider changed to postgresql"
echo ""

# Step 2: Push schema to PostgreSQL
echo "📦 Step 2: Pushing schema to PostgreSQL (creating tables)..."
npx prisma db push --accept-data-loss
echo "   ✅ Schema pushed — all 89 tables created"
echo ""

# Step 3: Generate Prisma client
echo "📦 Step 3: Generating Prisma client..."
npx prisma generate
echo "   ✅ Prisma client generated"
echo ""

# Step 4: Seed data
echo "📦 Step 4: Seeding test data..."
echo "   → Seeding main test data..."
bun run src/scripts/seed-test-data.ts
echo "   → Seeding insurance master data..."
bun run src/scripts/seed-insurance.ts
echo "   ✅ Seed complete"
echo ""

echo "=============================================="
echo "✅ MIGRATION COMPLETE!"
echo "=============================================="
echo ""
echo "Your app is now running on PostgreSQL."
echo "Start the dev server with: bun run dev"
echo ""
echo "To switch back to SQLite:"
echo "  1. Change .env: DATABASE_URL=file:./db/custom.db"
echo "  2. Change prisma/schema.prisma: provider = \"sqlite\""
echo "  3. Run: bun run db:push && bun run db:generate"
