#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .runtime
VENV_PY="$(pwd)/.venv/bin/python3"
PID_FILE=.runtime/service.pid
LOG_FILE=.runtime/service.log

if [ ! -x "$VENV_PY" ]; then
  echo "venv python missing: $VENV_PY" >&2
  exit 1
fi

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE" || true)
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    echo "already running pid=$PID log=$(pwd)/$LOG_FILE"
    exit 0
  fi
  rm -f "$PID_FILE"
  echo "removed stale pid file"
fi

nohup "$VENV_PY" -m uvicorn run:app --host 127.0.0.1 --port 8091 > "$LOG_FILE" 2>&1 &
NEW_PID=$!
echo "$NEW_PID" > "$PID_FILE"
sleep 1
if kill -0 "$NEW_PID" 2>/dev/null; then
  echo "started pid=$NEW_PID log=$(pwd)/$LOG_FILE"
  exit 0
fi

echo "service failed to stay up; see log=$(pwd)/$LOG_FILE" >&2
exit 1
