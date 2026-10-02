#!/bin/bash
# Start chat-service (port 3004) with env loaded from the main app .env
# (same Supabase Postgres DATABASE_URL as the main app — shared DB).
cd "$(dirname "$0")"

if ss -tlnp 2>/dev/null | grep -q ':3004 '; then
  echo "chat-service already running"
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

exec bun --hot index.ts
