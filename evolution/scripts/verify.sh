#!/usr/bin/env bash
set -e

REPO_DIR="/home/ubuntu/math-arcade"
cd "$REPO_DIR"

echo "=== [MATH ARCADE QUALITY GATE] Starting Verification ==="

# 1. Validate JSON Files
echo "[1/4] Validating games.json and STATE.json..."
node -e "JSON.parse(require('fs').readFileSync('games.json'))"
node -e "JSON.parse(require('fs').readFileSync('evolution/STATE.json'))"
echo "  ✓ JSON syntax 100% valid."

# 2. Syntax Check All JavaScript Files
echo "[2/4] Syntax-checking JavaScript ES modules..."
node -c shared/*.js js/*.js
for game_dir in games/*; do
  if [ -d "$game_dir/js" ]; then
    node -c "$game_dir"/js/*.js
  fi
done
echo "  ✓ All JavaScript files passed syntax check."

# 3. Check Game Registry & HTML Entry Points
echo "[3/4] Verifying catalog entries and HTML assets..."
node -e '
  const fs = require("fs");
  const games = JSON.parse(fs.readFileSync("games.json"));
  games.forEach(g => {
    if (!fs.existsSync(g.path)) {
      throw new Error(`Registered game path does not exist: ${g.path}`);
    }
  });
  console.log(`  ✓ All ${games.length} registered games have valid HTML entry points.`);
'

# 4. Check Common CSS and Hub HTML
echo "[4/4] Verifying platform assets..."
test -f index.html || (echo "Missing index.html" && exit 1)
test -f css/common.css || (echo "Missing css/common.css" && exit 1)
test -f css/hub.css || (echo "Missing css/hub.css" && exit 1)
echo "  ✓ Platform shell assets verified."

echo "=== [MATH ARCADE QUALITY GATE] ALL CHECKS PASSED (100% GREEN) ==="
exit 0
