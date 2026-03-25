#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
ENV_FILE="$HOME/.openclaw/.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi
VENV_PY="$(pwd)/.venv/bin/python3"
if [ ! -x "$VENV_PY" ]; then
  echo "venv python missing: $VENV_PY" >&2
  exit 1
fi
exec "$VENV_PY" -m uvicorn run:app --host 127.0.0.1 --port 8091 --reload
