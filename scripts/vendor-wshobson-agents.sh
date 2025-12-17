#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/wshobson/agents}"
DEST_DIR="${DEST_DIR:-.claude/vendor/wshobson-agents}"
BRANCH="${BRANCH:-main}"

mkdir -p "$(dirname "$DEST_DIR")"

if [ -d "$DEST_DIR/.git" ]; then
  echo "Updating existing vendor repo: $DEST_DIR"
  git -C "$DEST_DIR" fetch --depth 1 origin "$BRANCH"
  git -C "$DEST_DIR" checkout -q "$BRANCH"
  git -C "$DEST_DIR" reset --hard "origin/$BRANCH"
else
  if [ -e "$DEST_DIR" ]; then
    echo "Destination exists but is not a git repo: $DEST_DIR" >&2
    echo "Delete it first, or set DEST_DIR to a new path." >&2
    exit 2
  fi
  echo "Cloning vendor repo: $REPO_URL -> $DEST_DIR"
  git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$DEST_DIR"
fi

echo "Done."

