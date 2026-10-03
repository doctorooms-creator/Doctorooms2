#!/bin/bash
# Start realtime-service (default port 3006 in sandbox; PORT env respected).
# Env loaded from the main app .env (shared Supabase DATABASE_URL + NEXTAUTH_SECRET).
# Also keeps prisma/schema.prisma in sync with the repo root schema.
cd "$(dirname "$0")"

PORT_TO_USE="${PORT:-3006}"

if ss -tlnp 2>/dev/null | grep -q ":${PORT_TO_USE} "; then
  echo "realtime-service already running on :${PORT_TO_USE}"
  exit 0
fi

if [ -f ../../.env ]; then
  set -a
  . ../../.env
  set +a
else
  echo "FATAL: ../../.env missing"
  exit 1
fi

# Keep the service's Prisma schema in sync with the root schema (single source of truth)
cp ../../prisma/schema.prisma prisma/schema.prisma

# Ensure the Prisma client is generated (no-op when already generated)
bunx prisma generate >/dev/null 2>&1 || echo "[realtime] WARN: prisma generate failed"

exec env PORT="${PORT_TO_USE}" bun --hot index.ts
