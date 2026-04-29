#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../backend"

if [ -z "${PYTHON_BIN:-}" ]; then
  PYTHON_BIN="python3"
  if command -v python3.10 >/dev/null 2>&1; then
    PYTHON_BIN="python3.10"
  fi
fi

if [ ! -d ".venv" ]; then
  "$PYTHON_BIN" -m venv .venv
fi

source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --reload
