#!/bin/sh
# Synology NAS Storage Tool — standalone install script
# Tested on DSM 7.0+ with Python 3.9 from Package Center
#
# Usage:
#   1. Install Python 3.9 via Synology Package Center
#   2. SSH into the NAS as admin
#   3. Upload this project folder to the NAS (e.g. /volume1/tools/synology-tool)
#   4. Run: sh install.sh

set -e

TOOL_DIR="$(cd "$(dirname "$0")" && pwd)"
PYTHON=""

# Find Python 3.9
for candidate in python3.9 python3 python; do
    if command -v "$candidate" >/dev/null 2>&1; then
        ver=$("$candidate" --version 2>&1)
        case "$ver" in
            *3.9*|*3.1*) PYTHON="$candidate"; break;;
        esac
    fi
done

# Synology Package Center installs python3.9 at a known path
if [ -z "$PYTHON" ]; then
    for p in /var/packages/Python3.9/target/bin/python3.9 \
              /usr/local/bin/python3.9 \
              /usr/bin/python3.9; do
        if [ -x "$p" ]; then PYTHON="$p"; break; fi
    done
fi

if [ -z "$PYTHON" ]; then
    echo "ERROR: Python 3.9 not found."
    echo "Install Python 3.9 via Synology Package Center and try again."
    exit 1
fi

echo "Using Python: $PYTHON ($($PYTHON --version))"

# Install pip if needed
if ! "$PYTHON" -m pip --version >/dev/null 2>&1; then
    echo "Installing pip..."
    curl -sS https://bootstrap.pypa.io/get-pip.py | "$PYTHON"
fi

echo "Installing Python dependencies..."
"$PYTHON" -m pip install --upgrade pip --quiet
"$PYTHON" -m pip install -r "$TOOL_DIR/requirements.txt" --quiet

echo ""
echo "Installation complete!"
echo ""
echo "Start the tool with:  sh $TOOL_DIR/start.sh"
echo "Then open:            http://<NAS-IP>:8080"
