#!/usr/bin/env bash
# Publish The Bandland Game to a new GitHub repository.
# Run from this directory after installing GitHub CLI (gh) and logging in.

set -euo pipefail

REPO_NAME="The-Bandland-Game"
DISPLAY_NAME="The Bandland Game"

if [ ! -f "ProjectSettings/ProjectVersion.txt" ]; then
  echo "Error: run this script from the Unity project root (The-Bandland-Game)."
  exit 1
fi

if ! command -v gh >/dev/null; then
  echo "Install GitHub CLI: https://cli.github.com/"
  exit 1
fi

if [ ! -d .git ]; then
  git init -b main
  git add .
  git commit -m "Initial commit: ${DISPLAY_NAME} (Unity 2D)"
fi

echo "Creating GitHub repo: ${REPO_NAME}"
gh repo create "${REPO_NAME}" \
  --public \
  --description "${DISPLAY_NAME} — Unity 2D rhythm gig game" \
  --source=. \
  --remote=origin \
  --push

echo ""
echo "Done! Repository: https://github.com/$(gh repo view --json nameWithOwner -q .nameWithOwner)"
