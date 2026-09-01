#!/bin/bash
# Custom dev script — runs the Next.js dev server with memory limits.
# This is picked up by /start.sh on container boot (line 328-334).
# Running via /start.sh gives the process PPID=1, so it survives across
# sandbox sessions.

cd /home/z/my-project

# Ensure .env has critical vars (in case /start.sh already reset it)
if ! grep -q "^DEV_MODE=1$" /home/z/my-project/.env 2>/dev/null; then
  printf 'DATABASE_URL=file:/home/z/my-project/db/custom.db\nDEV_MODE=1\nNEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE\nNEXT_PUBLIC_SUPABASE_URL=https://fmsccgnfdjiophuyjwcv.supabase.co\nSUPABASE_SECRET_KEY=YOUR_SUPABASE_SECRET_KEY_HERE\nSUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SECRET_KEY_HERE\nSMS_PROVIDER=log\nNOTIFICATION_SERVICE_URL=http://localhost:3005\n' > /home/z/my-project/.env
fi

# Start Next.js dev server with webpack (uses less memory than Turbopack)
# and V8 heap limit to prevent OOM kills in the 4GB sandbox.
export NODE_OPTIONS="--max-old-space-size=768"
exec node /home/z/my-project/node_modules/next/dist/bin/next dev -p 3000 --webpack
