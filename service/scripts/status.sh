#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PID_FILE=.runtime/service.pid
LOG_FILE=.runtime/service.log
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE" || true)
  if [ -n "${PID:-}" ] && kill -0 "$PID" 2>/dev/null; then
    echo "running pid=$PID"
    echo "log=$(pwd)/$LOG_FILE"
    exit 0
  fi
  echo "stale pid file: ${PID:-unknown}"
  echo "log=$(pwd)/$LOG_FILE"
  exit 1
fi

echo "not running"
if [ -f "$LOG_FILE" ]; then
  echo "log=$(pwd)/$LOG_FILE"
fi
exit 1
