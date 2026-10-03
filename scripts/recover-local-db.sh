#!/bin/bash
# ============================================================================
# recover-local-db.sh — Full local-environment recovery after a sandbox reset.
#
# The sandbox occasionally hard-resets (wipes node_modules/, db/, mini-service
# .env files, and rewrites the root .env to the SQLite template — real secrets
# are never stored in git, so Supabase/Cloudinary credentials must be re-added
# by the owner). This script brings the app back up on a LOCAL userspace
# PostgreSQL 17 (no root/sudo needed) with seeded demo data, so development
# and QA can continue immediately.
#
# If you have the real Supabase pooler URL + Cloudinary keys, restore them in
# .env afterwards and restart — the schema is identical (provider=postgresql).
#
# Usage:  bash scripts/recover-local-db.sh
# ============================================================================
set -uo pipefail

ROOT="/home/z/my-project"
PG_HOME="/home/z/pg17"
PG_DATA="$ROOT/db/pgdata"
PG_PORT=5433
PG_URL="postgresql://postgres@127.0.0.1:${PG_PORT}/doctorooms?schema=public"

cd "$ROOT"
echo "== [1/6] Local Postgres binaries =="
if [ ! -x "$PG_HOME/bin/postgres" ]; then
  echo "   Downloading userspace PostgreSQL 17.5 (zonky embedded binaries)…"
  mkdir -p "$PG_HOME"
  curl -sL --max-time 300 -o /tmp/pg-binaries.jar \
    "https://repo1.maven.org/maven2/io/zonky/test/postgres/embedded-postgres-binaries-linux-amd64/17.5.0/embedded-postgres-binaries-linux-amd64-17.5.0.jar" \
    || { echo "FATAL: download failed"; exit 1; }
  unzip -o -q /tmp/pg-binaries.jar -d /tmp/pg-extract
  tar -xJf /tmp/pg-extract/postgres-linux-x86_64.txz -C "$PG_HOME" || { echo "FATAL: extract failed"; exit 1; }
else
  echo "   OK (already present)"
fi

echo "== [2/6] Cluster init =="
if [ ! -d "$PG_DATA" ]; then
  mkdir -p "$ROOT/db"
  LD_LIBRARY_PATH="$PG_HOME/lib" "$PG_HOME/bin/initdb" \
    -D "$PG_DATA" -U postgres -A trust -E UTF8 >/dev/null 2>&1 \
    || { echo "FATAL: initdb failed"; exit 1; }
fi
if ! (ss -tlnp 2>/dev/null | grep -q ":${PG_PORT} "); then
  LD_LIBRARY_PATH="$PG_HOME/lib" "$PG_HOME/bin/pg_ctl" \
    -D "$PG_DATA" -l /tmp/pg.log \
    -o "-p ${PG_PORT} -k /tmp -c listen_addresses=127.0.0.1" start >/dev/null 2>&1
  sleep 2
fi
ss -tlnp 2>/dev/null | grep -q ":${PG_PORT} " && echo "   Postgres UP on :${PG_PORT}" || { echo "FATAL: PG not listening"; exit 1; }

echo "== [3/6] Dependencies =="
if [ ! -d "$ROOT/node_modules/next" ]; then
  (cd "$ROOT" && bun install >/dev/null 2>&1) || { echo "FATAL: main bun install failed"; exit 1; }
fi
for svc in chat-service notification-service; do
  if [ ! -d "$ROOT/mini-services/$svc/node_modules" ]; then
    (cd "$ROOT/mini-services/$svc" && bun install >/dev/null 2>&1) || echo "   WARN: $svc install failed"
  fi
done
echo "   OK"

echo "== [4/6] Schema =="
# The reset rewrites .env to the SQLite template — point it at local PG.
# (No secret values involved; local PG uses trust auth.)
if ! grep -q "127.0.0.1:${PG_PORT}" "$ROOT/.env" 2>/dev/null; then
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${PG_URL}\"|" "$ROOT/.env"
fi
unset DATABASE_URL
export DATABASE_URL="$PG_URL"
(cd "$ROOT" && bunx prisma db push --skip-generate >/dev/null 2>&1 && bunx prisma generate >/dev/null 2>&1) \
  || { echo "FATAL: prisma db push/generate failed"; exit 1; }
echo "   Schema synced (108 models)"

echo "== [5/6] Seed (only if DB empty) =="
USER_COUNT=$(cd "$ROOT" && bun -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.user.count().then(c => { console.log(c); return db.\$disconnect(); });
" 2>/dev/null | tail -1)
if [ "${USER_COUNT:-0}" = "0" ] 2>/dev/null; then
  (cd "$ROOT" && bun prisma/seed-multispecialty.ts >/dev/null 2>&1) && echo "   multispecialty seed OK"
  (cd "$ROOT" && bun scripts/seed-demo-users.ts >/dev/null 2>&1) && echo "   demo users OK"
else
  echo "   skip (already has ${USER_COUNT} users)"
fi

echo "== [6/6] Services =="
pkill -9 -f "next/dist/bin/next" 2>/dev/null; pkill -9 -f "next-server" 2>/dev/null; sleep 1
bash "$ROOT/restart-server.sh" >/dev/null 2>&1 &
(cd "$ROOT/mini-services/chat-service" && nohup bun run dev >/tmp/chat-dev.log 2>&1 &)
(cd "$ROOT/mini-services/notification-service" && nohup bun run dev >/tmp/notif-dev.log 2>&1 &)
sleep 20
MAIN=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 http://localhost:3000/)
CHAT=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3004/)
NOTIF=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:3005/)
echo "   main(3000):$MAIN  chat(3004):$CHAT  notif(3005):$NOTIF"
[ "$MAIN" = "200" ] && echo "== RECOVERY COMPLETE ==" || echo "== PARTIAL: main did not return 200 — check dev.log =="
