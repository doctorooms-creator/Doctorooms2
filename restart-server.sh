#!/bin/bash
# Restart the Next.js dev server if it's not running.
# Called by cron every 2 minutes.

cd /home/z/my-project

# Check if server is alive
if ss -tlnp 2>/dev/null | grep -q ':3000 '; then
  exit 0  # Server is alive, nothing to do
fi

# Server is dead — restart it
pkill -9 -f "next" 2>/dev/null
sleep 1

# Ensure .env has critical vars
if ! grep -q "^DEV_MODE=1$" /home/z/my-project/.env 2>/dev/null; then
  printf 'DATABASE_URL=file:/home/z/my-project/db/custom.db\nDEV_MODE=1\nNEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE\nNEXT_PUBLIC_SUPABASE_URL=https://fmsccgnfdjiophuyjwcv.supabase.co\nSUPABASE_SECRET_KEY=YOUR_SUPABASE_SECRET_KEY_HERE\nSUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SECRET_KEY_HERE\nSMS_PROVIDER=log\nNOTIFICATION_SERVICE_URL=http://localhost:3005\n' > /home/z/my-project/.env
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
