#!/bin/bash

set -e

LOCK_FILE="/tmp/rebuild.lock"
APP_DIR="/app"
DIST_BLUE="${APP_DIR}/dist-blue"
DIST_GREEN="${APP_DIR}/dist-green"
NGINX_CONF="/etc/nginx/nginx.conf"

if [ -f "$LOCK_FILE" ]; then
    echo "Rebuild in progress, skipping"
    exit 0
fi

touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

echo "$(date): Starting rebuild"
cd "$APP_DIR"

if grep -q "root /app/dist-blue" "$NGINX_CONF"; then
    INACTIVE_DIST="$DIST_GREEN"
    INACTIVE_NAME="green"
    INACTIVE_PATH="/app/dist-green"
else
    INACTIVE_DIST="$DIST_BLUE"
    INACTIVE_NAME="blue"
    INACTIVE_PATH="/app/dist-blue"
fi

echo "$(date): Building into $INACTIVE_NAME environment..."

npm install
npx astro build

if [ ! -f "dist/index.html" ]; then
    echo "$(date): Build failed - no index.html"
    rm -rf dist node_modules
    exit 1
fi

rm -rf "$INACTIVE_DIST"
mv dist "$INACTIVE_DIST"

echo "$(date): Build complete, switching nginx to $INACTIVE_NAME..."

cp "$NGINX_CONF" "${NGINX_CONF}.new"
sed "s|root /app/dist-[^;]*|root $INACTIVE_PATH|" "$NGINX_CONF" > "${NGINX_CONF}.new"
cat "${NGINX_CONF}.new" > "$NGINX_CONF"
rm -f "${NGINX_CONF}.new"

nginx -s reload

echo "$(date): Rebuild complete, now serving from $INACTIVE_NAME"

rm -rf node_modules "$BUILD_DIR"

find "$APP_DIR" -maxdepth 1 -type d -name "build-[0-9]*" | xargs rm -rf 2>/dev/null || true

echo "$(date): Cleanup done"
