#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost}"
BASE_URL="${BASE_URL%/}"

echo "Checking ${BASE_URL}"

echo "1. Health"
curl -fsS "${BASE_URL}/api/health"
echo

echo "2. Status"
curl -fsS "${BASE_URL}/api/status"
echo

echo "3. Frontend"
curl -fsSI "${BASE_URL}/" | sed -n '1,8p'

echo "Domestic deployment smoke check passed."
