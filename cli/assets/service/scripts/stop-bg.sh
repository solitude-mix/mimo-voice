#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
PID_FILE=.runtime/service.pid
if [ ! -f "$PID_FILE" ]; then
  echo "pid file not found: $(pwd)/$PID_FILE"
  exit 1
fi
PID=$(cat "$PID_FILE")
if kill "$PID" 2>/dev/null; then
  rm -f "$PID_FILE"
  echo "stopped pid=$PID"
else
  echo "failed to stop pid=$PID"
  exit 1
fi
