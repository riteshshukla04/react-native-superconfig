#!/bin/bash

# Load nvm if available
if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  . "$HOME/.nvm/nvm.sh"
elif [[ -x "$(command -v brew)" && -s "$(brew --prefix nvm)/nvm.sh" ]]; then
  . "$(brew --prefix nvm)/nvm.sh"
fi

# Set NODE_BINARY if not already set
[ -z "$NODE_BINARY" ] && export NODE_BINARY="node"

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
