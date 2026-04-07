#!/bin/bash

# Load nvm if available
if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  . "$HOME/.nvm/nvm.sh"
elif [[ -x "$(command -v brew)" && -s "$(brew --prefix nvm)/nvm.sh" ]]; then
  . "$(brew --prefix nvm)/nvm.sh"
fi

# Set NODE_BINARY if not already set
[ -z "$NODE_BINARY" ] && export NODE_BINARY="node"

# Optional: Set app root from Xcode environment if available
# PROJECT_DIR points to the ios/ directory, but the RN app root is its parent
if [ -n "$PROJECT_DIR" ] && [ -z "$SUPERCONFIG_APP_ROOT" ]; then
  export SUPERCONFIG_APP_ROOT="$(dirname "$PROJECT_DIR")"
elif [ -n "$SRCROOT" ] && [ -z "$SUPERCONFIG_APP_ROOT" ]; then
  export SUPERCONFIG_APP_ROOT="$(dirname "$SRCROOT")"
fi

# Override the default with the global environment
ENV_PATH="$PODS_ROOT/../.xcode.env"
if [ -f "$ENV_PATH" ]; then
    source "$ENV_PATH"
fi

# Override the global with the local environment
LOCAL_ENV_PATH="${ENV_PATH}.local"
if [ -f "$LOCAL_ENV_PATH" ]; then
    source "$LOCAL_ENV_PATH"
fi

# Check if node is available
if ! type "$NODE_BINARY" >/dev/null 2>&1; then
  echo "error: Can't find '$NODE_BINARY' to generate Superconfig. " \
       "If you have a non-standard Node.js installation, set NODE_BINARY " \
       "to an absolute path to your node executable." >&2
  exit 2
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$NODE_BINARY" "$SCRIPT_DIR/generate-config.js"
