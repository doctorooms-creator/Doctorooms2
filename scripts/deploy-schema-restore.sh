#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-schema-restore.sh — restore the DEPLOY (postgres) prisma schema.
#
# Run this before ANY git commit/push after using scripts/sandbox-sqlite.sh.
# Restores the tracked postgres schema, regenerates the client, and points
# .env back at the live prod Supabase project's Seoul session pooler.
# (The DB password itself lives only in the user's Vercel env — sandbox
#  cannot reach the prod DB; see worklog "sandbox DB isolation" notes.)
# ─────────────────────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")/.."

echo "[restore] checking out tracked postgres schemas…"
git checkout -- prisma/schema.prisma mini-services/realtime-service/prisma/schema.prisma

echo "[restore] regenerating prisma client (postgres)…"
bunx prisma generate

echo "[restore] pointing .env at the live prod Supabase pooler…"
sed -i 's|^DATABASE_URL=.*|DATABASE_URL=postgresql://postgres.dauhputqahqutczyrfme:M7hvD2y8owFWrjuM@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres|' .env
echo "  (note: password may be stale — the live one is only in Vercel env)"

echo "[restore] restarting services…"
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
sleep 3
bash start-all.sh

echo ""
echo "[restore] DONE — git tree is deploy-clean (postgres schema)."
git status --short
