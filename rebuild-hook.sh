#!/bin/bash

set -e

LOCK_FILE="/tmp/pofys-rebuild.lock"
LOG_FILE="/app/rebuild.log"

if [ -f "$LOCK_FILE" ]; then
    echo "$(date): Rebuild already in progress, skipping" | tee -a "$LOG_FILE"
    exit 0
fi

touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

echo "$(date): Starting POFYS rebuild triggered by Strapi webhook" | tee -a "$LOG_FILE"

cd /workspace/POFYS/website

if [ -f .env.dev ]; then
    export $(grep -v '^#' .env.dev | xargs)
fi

export PUBLIC_STRAPI_URL="http://localhost:1337"

echo "$(date): Building Docker image..." | tee -a "$LOG_FILE"
docker build \
  --network host \
  --build-arg PUBLIC_STRAPI_URL="http://localhost:1337" \
  --build-arg STRAPI_API_TOKEN="${STRAPI_API_TOKEN}" \
  -t pofys-website \
  . 2>&1 | tee -a "$LOG_FILE"

if [ $? -ne 0 ]; then
    echo "$(date): Docker build failed!" | tee -a "$LOG_FILE"
    exit 1
fi

echo "$(date): Restarting production container..." | tee -a "$LOG_FILE"
cd /workspace/nginx-proxy
docker compose restart pofys 2>&1 | tee -a "$LOG_FILE"

echo "$(date): POFYS rebuild completed successfully" | tee -a "$LOG_FILE"
