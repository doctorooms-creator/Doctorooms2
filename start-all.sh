#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# Doctorooms — Start All Services
#
# IMPORTANT: This sandbox kills all descendant processes of each Bash tool
# call when it completes. The `( ... & )` double-fork pattern below reparents
# each service to PID 1 so they survive between tool calls.
#
# Services:
#   1. Next.js app          → port 3000 (main user-facing app)
#   2. Chat service         → port 3004 (socket.io booking chat)
#   3. Notification service → port 3005 (socket.io + HTTP notifications)
# ─────────────────────────────────────────────────────────────────────────────

is_port_up() {
  ss -tln 2>/dev/null | grep -q ":$1 "
}

start_service() {
  local dir="$1" log="$2" cmd="$3" port="$4" name="$5"
  if is_port_up "$port"; then
    echo "[skip]  $name already running on port $port"
    return 0
  fi
  ( cd "$dir" && setsid bash -c "$cmd" > "$log" 2>&1 < /dev/null & )
  echo "[start] $name on port $port (log: $log)"
}

# 1. Main Next.js app (port 3000)
# NOTE: heap tuned to 1792MB. 2048MB let V8 grow past the container's ~4GB
# global limit during compile-heavy rounds → kernel OOM-killer; 1536MB made
# Next.js hit its internal "used memory threshold" restart (80% of heap =
# ~1.28GB) several times an hour, which FULL-RELOADS every open browser tab
# (users reported the app "reloading by itself"). 1792MB + experimental
# webpackMemoryOptimizations (next.config.ts) keeps the threshold restarts
# rare while staying clear of the kernel OOM limit.
start_service \
  /home/z/my-project \
  /home/z/my-project/dev.log \
  'exec env NODE_OPTIONS=--max-old-space-size=1792 node node_modules/next/dist/bin/next dev -p 3000 --webpack' \
  3000 "Next.js app"

# 2. Chat service (port 3004)
start_service \
  /home/z/my-project/mini-services/chat-service \
  /home/z/my-project/mini-services/chat-service/service.log \
  'exec bun --hot index.ts' \
  3004 "Chat service"

# 3. Notification service (port 3005)
start_service \
  /home/z/my-project/mini-services/notification-service \
  /home/z/my-project/mini-services/notification-service/service.log \
  'exec bun --hot index.ts' \
  3005 "Notification service"

echo ""
echo "Waiting for services to boot..."
for i in $(seq 1 30); do
  sleep 1
  MAIN=$(is_port_up 3000 && echo up || echo down)
  CHAT=$(is_port_up 3004 && echo up || echo down)
  NOTIF=$(is_port_up 3005 && echo up || echo down)
  if [ "$MAIN" = "up" ] && [ "$CHAT" = "up" ] && [ "$NOTIF" = "up" ]; then
    break
  fi
done

echo "Next.js (3000): $MAIN | Chat (3004): $CHAT | Notifications (3005): $NOTIF"
