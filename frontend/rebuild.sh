#!/bin/bash

set -e

LOCK_FILE="/tmp/rebuild.lock"
APP_DIR="/app"
DIST_BLUE="${APP_DIR}/dist-blue"
DIST_GREEN="${APP_DIR}/dist-green"
NGINX_CONF="/etc/nginx/nginx.conf"

SKIP_NGINX=0
for arg in "$@"; do
    case "$arg" in
        --no-nginx)
            SKIP_NGINX=1
            ;;
    esac
done

if [ "${SKIP_NGINX:-}" = "1" ] || [ -n "${SKIP_NGINX_env:-}" ] || [ -n "${SKIP_NGINX_ENV:-}" ]; then
    SKIP_NGINX=1
fi
if [ -n "${SKIP_NGINX}" ] && [ "${SKIP_NGINX}" = "1" ]; then
    echo "SKIP_NGINX is enabled; will not attempt to modify or reload nginx"
fi

if [ -f "$LOCK_FILE" ]; then
    echo "Rebuild in progress, skipping"
    exit 0
fi

touch "$LOCK_FILE"
trap "rm -f $LOCK_FILE" EXIT

echo "$(date): Starting rebuild"
cd "$APP_DIR"

if [ "$SKIP_NGINX" = "0" ] && [ -f "$NGINX_CONF" ]; then
    if grep -q "root /app/dist-blue" "$NGINX_CONF"; then
        INACTIVE_DIST="$DIST_GREEN"
        INACTIVE_NAME="green"
        INACTIVE_PATH="/app/dist-green"
    else
        INACTIVE_DIST="$DIST_BLUE"
        INACTIVE_NAME="blue"
        INACTIVE_PATH="/app/dist-blue"
    fi
else
    if [ -d "$DIST_BLUE" ] && [ -d "$DIST_GREEN" ]; then
        blue_time=$(stat -c %Y "$DIST_BLUE" 2>/dev/null || echo 0)
        green_time=$(stat -c %Y "$DIST_GREEN" 2>/dev/null || echo 0)
        if [ "$blue_time" -le "$green_time" ]; then
            INACTIVE_DIST="$DIST_BLUE"
            INACTIVE_NAME="blue"
            INACTIVE_PATH="/app/dist-blue"
        else
            INACTIVE_DIST="$DIST_GREEN"
            INACTIVE_NAME="green"
            INACTIVE_PATH="/app/dist-green"
        fi
    elif [ -d "$DIST_BLUE" ]; then
        INACTIVE_DIST="$DIST_GREEN"
        INACTIVE_NAME="green"
        INACTIVE_PATH="/app/dist-green"
    else
        INACTIVE_DIST="$DIST_BLUE"
        INACTIVE_NAME="blue"
        INACTIVE_PATH="/app/dist-blue"
    fi
fi

echo "$(date): Building into $INACTIVE_NAME environment..."

npm install
npx astro build

if [ ! -f "dist/index.html" ]; then
    echo "$(date): Build failed - no index.html"
    rm -rf dist
    if [ "$SKIP_NGINX" = "0" ] && [ "${NODE_ENV:-}" != "development" ]; then
        rm -rf node_modules
    else
        echo "${date}: Skipping node_modules removal due to dev/skip-nginx"
    fi
    exit 1
fi

rm -rf "$INACTIVE_DIST"
mv dist "$INACTIVE_DIST"

if [ "$SKIP_NGINX" = "1" ] || [ ! -f "$NGINX_CONF" ]; then
    echo "$(date): SKIP_NGINX or nginx missing; not updating /etc/nginx/nginx.conf or reloading nginx"
    echo "$(date): Rebuild complete, now serving from $INACTIVE_NAME (no nginx switch)"
else
    echo "$(date): Build complete, switching nginx to $INACTIVE_NAME..."

    cp "$NGINX_CONF" "${NGINX_CONF}.new"
    sed "s|root /app/dist-[^;]*|root $INACTIVE_PATH|" "$NGINX_CONF" > "${NGINX_CONF}.new"
    cat "${NGINX_CONF}.new" > "$NGINX_CONF"
    rm -f "${NGINX_CONF}.new"

    nginx -s reload || echo "nginx reload failed or not available"

    echo "$(date): Rebuild complete, now serving from $INACTIVE_NAME"
fi

if [ "$SKIP_NGINX" = "0" ] && [ "${NODE_ENV:-}" != "development" ]; then
    rm -rf node_modules "${BUILD_DIR:-}" 2>/dev/null || true
else
    echo "$(date): Skipping node_modules removal (SKIP_NGINX=$SKIP_NGINX NODE_ENV=${NODE_ENV:-})"
fi

find "$APP_DIR" -maxdepth 1 -type d -name "build-[0-9]*" | xargs rm -rf 2>/dev/null || true

echo "$(date): Cleanup done"
