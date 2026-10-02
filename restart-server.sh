#!/bin/bash
# Restart the Next.js dev server if it's not running.
# Called by cron every 2 minutes.

cd /home/z/my-project

# Check if server is alive
if ss -tlnp 2>/dev/null | grep -q ':3000 '; then
  exit 0  # Server is alive, nothing to do
fi

# Server is dead — restart it
pkill -9 -f "next/dist/bin/next" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
sleep 1

# Load .env into the environment (overrides any inherited/system DATABASE_URL —
# the Supabase Postgres URL + Cloudinary keys live ONLY in .env, which is gitignored).
if [ -f /home/z/my-project/.env ]; then
  set -a
  . /home/z/my-project/.env
  set +a
else
  echo "[restart] FATAL: .env missing — cannot start without DB config $(date)" >> /home/z/my-project/restart.log
  exit 1
fi

# Start server
# Heap kept in sync with start-all.sh / watchdog.sh (1792MB).
export NODE_OPTIONS="--max-old-space-size=1792"
( cd /home/z/my-project && exec node node_modules/next/dist/bin/next dev -p 3000 --webpack ) > /home/z/my-project/dev.log 2>&1 &
disown

# Wait for ready (up to 30s)
for i in $(seq 1 30); do
  sleep 1
  curl -s -o /dev/null http://localhost:3000/ 2>/dev/null && break
done

# Pre-warm critical routes
curl -s -o /dev/null http://localhost:3000/ 2>/dev/null
curl -s -o /dev/null http://localhost:3000/login 2>/dev/null
curl -s -X POST http://localhost:3000/api/dev-login -H "Content-Type: application/json" -d '{"role":"doctor","userId":"dev-doctor"}' -o /dev/null 2>/dev/null

echo "[restart] Server started at $(date)" >> /home/z/my-project/restart.log
