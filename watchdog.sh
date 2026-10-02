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

  # Chat service
  if ! is_port_up 3004; then
    log "Port 3004 DOWN — starting chat service"
    start_service /home/z/my-project/mini-services/chat-service "Chat service"
  fi

  # Notification service
  if ! is_port_up 3005; then
    log "Port 3005 DOWN — starting notification service"
    start_service /home/z/my-project/mini-services/notification-service "Notification service"
  fi
done
