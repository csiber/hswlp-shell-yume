#!/bin/bash

echo "🕰️  Yumekaira / Next rollback script"
echo "-------------------------------"
read -p "Enter commit hash or relative ref (e.g. HEAD~1): " rollback_point

# Check if commit exists
if ! git cat-file -e "${rollback_point}^{commit}" 2>/dev/null; then
  echo "❌ Invalid commit. Check the hash or reference."
  exit 1
fi

echo "⚠️  'main' will be reset to: $rollback_point"
read -p "Are you sure? [y/N]: " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "⛔ Aborted."
  exit 0
fi

# Roll back
git reset --hard "$rollback_point"

# Recreate 'main' branch
git checkout -B main

# Force push
git push origin main --force

echo "✅ Rollback finished: main → $rollback_point"
