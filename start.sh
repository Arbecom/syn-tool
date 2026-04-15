#!/bin/sh
# Synology NAS Storage Tool — start script

TOOL_DIR="$(cd "$(dirname "$0")" && pwd)"

# Find Python (same logic as install.sh)
PYTHON=""
for candidate in python3.9 python3 python; do
    if command -v "$candidate" >/dev/null 2>&1; then
        ver=$("$candidate" --version 2>&1)
        case "$ver" in
            *3.9*|*3.1*) PYTHON="$candidate"; break;;
        esac
    fi
done
for p in /var/packages/Python3.9/target/bin/python3.9 \
          /usr/local/bin/python3.9 /usr/bin/python3.9; do
    [ -z "$PYTHON" ] && [ -x "$p" ] && PYTHON="$p"
done
[ -z "$PYTHON" ] && PYTHON=python3

export PORT="${PORT:-8080}"
export HOST="${HOST:-0.0.0.0}"
export DATA_DIR="${DATA_DIR:-$TOOL_DIR/data}"

echo "Starting Synology Storage Tool..."
echo "URL: http://$(hostname -I | awk '{print $1}'):$PORT"
echo "Press Ctrl+C to stop."
echo ""

cd "$TOOL_DIR"
exec "$PYTHON" app.py
