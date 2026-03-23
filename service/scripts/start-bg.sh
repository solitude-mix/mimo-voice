#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p .runtime
VENV_PY="$(pwd)/.venv/bin/python3"
if [ ! -x "$VENV_PY" ]; then
  echo "venv python missing: $VENV_PY" >&2
  exit 1
fi
nohup "$VENV_PY" -m uvicorn run:app --host 127.0.0.1 --port 8091 > .runtime/service.log 2>&1 &
echo $! > .runtime/service.pid
echo "started pid=$(cat .runtime/service.pid) log=$(pwd)/.runtime/service.log"
