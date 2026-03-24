#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PID_FILE=.runtime/service.pid
if [ ! -f "$PID_FILE" ]; then
  echo "pid file not found: $(pwd)/$PID_FILE"
  exit 1
fi
PID=$(cat "$PID_FILE" || true)
if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  rm -f "$PID_FILE"
  echo "stopped pid=$PID"
  exit 0
fi
rm -f "$PID_FILE"
echo "removed stale pid file: ${PID:-unknown}"
exit 0
