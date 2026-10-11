#!/bin/bash
# Start notification-service (port 3005). No DB — pure socket.io relay.
cd "$(dirname "$0")"

if ss -tlnp 2>/dev/null | grep -q ':3005 '; then
  echo "notification-service already running"
  exit 0
fi

if [ -f ../../.env ]; then
  set -a
  . ../../.env
  set +a
fi

exec bun --hot index.ts
