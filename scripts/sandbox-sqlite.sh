#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# sandbox-sqlite.sh — switch the sandbox to a LOCAL SQLite DB for full E2E tests
#
# WHY: the shared PROD Supabase DB is NOT reachable from this sandbox
#      (old project fmsccgnfdjiophuyjwcv = deleted/paused, NXDOMAIN;
#       live project dauhputqahqutczyrfme = Seoul pooler reachable but the
#       current DB password is unknown — only Vercel prod env has it).
#      So agent-browser E2E runs against a local seeded SQLite DB instead.
#
# USAGE: bash scripts/sandbox-sqlite.sh        (swap + push + generate + restart)
#        bash scripts/deploy-schema-restore.sh (go back to postgres / deploy state)
#
# NOTE: this script intentionally leaves prisma/schema.prisma DIRTY (sqlite).
#       NEVER commit while in sandbox mode — run deploy-schema-restore.sh first.
#       mini-services/realtime-service/start.sh re-syncs its schema from the
#       root schema on every start, so both flip together automatically.
# ─────────────────────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")/.."

echo "[sandbox] backing up postgres schema…"
cp prisma/schema.prisma /tmp/schema.postgres.bak

echo "[sandbox] generating sqlite schema…"
sed -e 's|provider = "postgresql"|provider = "sqlite"|' \
    -e 's|url      = env("DATABASE_URL")|url      = "file:/home/z/my-project/db/localtest.db"|' \
    -e 's|meta       Json?|meta       String?|' \
    /tmp/schema.postgres.bak > prisma/schema.prisma

echo "[sandbox] pushing local db…"
rm -f db/localtest.db
DATABASE_URL="file:/home/z/my-project/db/localtest.db" bunx prisma db push --skip-generate

echo "[sandbox] regenerating prisma client (sqlite)…"
bunx prisma generate

echo "[sandbox] pointing .env at the local db…"
sed -i 's|^DATABASE_URL=.*|DATABASE_URL=file:/home/z/my-project/db/localtest.db|' .env

echo "[sandbox] restarting services…"
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
sleep 3
bash start-all.sh

echo ""
echo "[sandbox] DONE — now seed test data:"
echo "  bun --conditions=dev run tmp-scripts/seed-local.ts   (Zydus: 2 depts, 3 doctors, Rina + Suresh)"
echo "  bun --conditions=dev run tmp-scripts/seed-clinic.ts  (Rajesh Clinic: 1 dept 1 doctor → auto-lock test)"
echo ""
echo "  ⚠ prisma/schema.prisma is now sqlite (git-dirty). Run scripts/deploy-schema-restore.sh before ANY commit/push!"
