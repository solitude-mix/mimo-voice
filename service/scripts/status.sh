#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PID_FILE=.runtime/service.pid
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "running pid=$PID"
    echo "log=$(pwd)/.runtime/service.log"
    exit 0
  fi
  echo "stale pid file: $PID"
  exit 1
fi

echo "not running"
exit 1
