#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Doctorooms — Watchdog
#
# Runs as a persistent background loop (reparented to PID 1 via start-all.sh).
# Every 60s: if port 3000 is down, restarts the Next.js server.
# Also revives mini-services (3004/3005) if they die.
#
# Log: /home/z/my-project/watchdog.log
# ─────────────────────────────────────────────────────────────────────────────

is_port_up() {
  ss -tln 2>/dev/null | grep -q ":$1 "
}

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> /home/z/my-project/watchdog.log
}

# SINGLE-DB directive: force .env to win over inherited platform env
# (stale SQLite DATABASE_URL is exported at the platform shell level).
if [ -f /home/z/my-project/.env ]; then
  set -a
  . /home/z/my-project/.env
  set +a
fi

start_next() {
  ( cd /home/z/my-project && setsid bash -c \
    'exec env NODE_OPTIONS=--max-old-space-size=1792 node node_modules/next/dist/bin/next dev -p 3000 --webpack' \
    > /home/z/my-project/dev.log 2>&1 < /dev/null & )
  log "Next.js restarted"
}

start_service() {
  local dir="$1" name="$2"
  ( cd "$dir" && setsid bash -c 'exec bun --hot index.ts' > "$dir/service.log" 2>&1 < /dev/null & )
  log "$name restarted"
}

log "Watchdog started (PID $$)"

while true; do
  sleep 60

  # Main Next.js app
  if ! is_port_up 3000; then
    log "Port 3000 DOWN — starting Next.js"
    start_next
    # Give it time to boot before the next check
    sleep 20
  fi

  # Realtime service (merged chat+notif, :3006 — Aturseva proactive pushes)
  # Via start.sh so it sources ../../.env (DB URL + secrets) properly.
  # NOTE: the legacy chat-service (:3004) and notification-service (:3005)
  # are RETIRED (merged into realtime-service). Their folders have empty
  # node_modules after sandbox resets — spawning them is a guaranteed
  # crash-loop, so those revive blocks were REMOVED.
  if ! is_port_up 3006; then
    log "Port 3006 DOWN — starting realtime service"
    (
      cd /home/z/my-project/mini-services/realtime-service
      setsid bash -c 'exec bash start.sh' > service.log 2>&1 < /dev/null &
    )
    sleep 10
  fi
done
