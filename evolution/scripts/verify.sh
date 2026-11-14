#!/usr/bin/env bash
set -e

REPO_DIR="/home/ubuntu/Math-Arcid-V2"
cd "$REPO_DIR"

echo "=== [MATH-ARCID-V2 IRONCLAD QUALITY GATE] Starting 7-Stage Audit ==="

# 1. Validate JSON Files
echo "[1/7] Validating games.json and evolution/STATE.json..."
node -e "JSON.parse(require('fs').readFileSync('games.json'))"
node -e "JSON.parse(require('fs').readFileSync('evolution/STATE.json'))"
echo "  ✓ JSON syntax 100% valid."

# 2. Syntax Check All JavaScript Files
echo "[2/7] Syntax-checking all JavaScript files..."
node -c shared/*.js js/*.js
for game_dir in games/*; do
  if [ -d "$game_dir/js" ]; then
    node -c "$game_dir"/js/*.js
  fi
done
echo "  ✓ All JavaScript files passed syntax verification."

# 3. Verify Catalog Entries & Custom SVG Tile Artwork in js/hub.js
echo "[3/7] Verifying catalog HTML paths & custom PS5 Hub SVG tile artwork..."
node -e '
  const fs = require("fs");
  const games = JSON.parse(fs.readFileSync("games.json", "utf8"));
  const hubCode = fs.readFileSync("js/hub.js", "utf8");
  games.forEach(g => {
    if (!fs.existsSync(g.path)) {
      throw new Error(`Registered game path does not exist: ${g.path}`);
    }
    if (!hubCode.includes(`game.id === '\''${g.id}'\''`) && !hubCode.includes(`game.id === "${g.id}"`)) {
      throw new Error(`Game "${g.id}" is missing a custom SVG tile artwork block in js/hub.js!`);
    }
  });
  console.log(`  ✓ All ${games.length} registered games have valid HTML entry points and bespoke SVG artwork in js/hub.js.`);
'

# 4. Enforce Gold Standard 6-Module Architecture & RTL Arabic on Curriculum Games
echo "[4/7] Auditing Gold Standard 6-Module Architecture (curriculum, world, renderer, controls, audio, game)..."
LEGACY_GENESIS="mathcore-survivor|math-battle"
for game_dir in games/*; do
  [ -d "$game_dir" ] || continue
  slug=$(basename "$game_dir")
  if [[ "$slug" =~ ^($LEGACY_GENESIS)$ ]]; then
    continue
  fi

  for req_file in index.html css/style.css js/audio.js js/curriculum.js js/world.js js/renderer.js js/controls.js js/game.js; do
    if [ ! -f "$game_dir/$req_file" ]; then
      echo "  ✗ ERROR: Game '$slug' is missing mandatory Gold Standard module: $req_file"
      exit 1
    fi
  done

  if ! grep -q 'lang="ar"' "$game_dir/index.html" || ! grep -q 'dir="rtl"' "$game_dir/index.html"; then
    echo "  ✗ ERROR: Game '$slug' index.html must use <html lang=\"ar\" dir=\"rtl\">!"
    exit 1
  fi

  if grep -q 'width="540"' "$game_dir/index.html"; then
    echo "  ✗ ERROR: Game '$slug' uses a forbidden 540x960 portrait box instead of full-screen 100vw x 100dvh canvas!"
    exit 1
  fi
done
echo "  ✓ All curriculum games satisfy the 6-module RTL full-screen architecture."

# 5. Enforce Minimum Code Depth (>= 2,500 LOC per Curriculum Game)
echo "[5/7] Auditing engineering depth and line-count floor (>= 2,500 lines per curriculum game)..."
for game_dir in games/*; do
  [ -d "$game_dir" ] || continue
  slug=$(basename "$game_dir")
  if [[ "$slug" =~ ^($LEGACY_GENESIS)$ ]]; then
    continue
  fi

  total_lines=$(cat "$game_dir"/index.html "$game_dir"/css/*.css "$game_dir"/js/*.js | wc -l)
  if [ "$total_lines" -lt 2500 ]; then
    echo "  ✗ ERROR: Game '$slug' has only $total_lines lines (minimum Gold Standard floor is 2,500 lines). No shallow builds allowed!"
    exit 1
  fi
  echo "  ✓ Game '$slug': $total_lines lines of code (Gold Standard verified)."
done

# 6. Audit Curriculum Question Bank Depth (>= 20 Questions + Hints + GraphSpecs)
echo "[6/7] Auditing 2BAC PC curriculum question banks and interactive graph plotting..."
node -e '
  const fs = require("fs");
  const vm = require("vm");
  const legacy = new Set(["mathcore-survivor", "math-battle"]);
  for (const slug of fs.readdirSync("games")) {
    if (legacy.has(slug) || !fs.statSync(`games/${slug}`).isDirectory()) continue;
    const code = fs.readFileSync(`games/${slug}/js/curriculum.js`, "utf8");
    const sandbox = { window: {}, Math, console };
    vm.runInNewContext(code, sandbox);
    const w = sandbox.window;
    const bank = w.QUESTION_BANK || w.SEQ_QUESTION_BANK || w.ASY_QUESTION_BANK || Object.values(w).find(v => Array.isArray(v) && v.length > 10 && v[0] && v[0].prompt);
    if (!bank || bank.length < 20) {
      throw new Error(`Game "${slug}" curriculum.js has fewer than 20 questions (found ${bank ? bank.length : 0})!`);
    }
    const withGraphs = bank.filter(q => q.graphSpec).length;
    if (withGraphs < 4) {
      throw new Error(`Game "${slug}" curriculum.js must include at least 4 interactive graphSpec questions (found ${withGraphs})!`);
    }
    console.log(`  ✓ Game "${slug}": ${bank.length} 2BAC questions (${withGraphs} with live canvas graphSpec).`);
  }
'

# 7. Check Platform Shell Assets
echo "[7/7] Verifying PS5 Console Hub shell assets..."
test -f index.html || (echo "Missing index.html" && exit 1)
test -f css/common.css || (echo "Missing css/common.css" && exit 1)
test -f css/hub.css || (echo "Missing css/hub.css" && exit 1)
test -f evolution/GOLD_STANDARD.md || (echo "Missing evolution/GOLD_STANDARD.md" && exit 1)
echo "  ✓ Platform shell assets verified."

echo "=== [MATH-ARCID-V2 IRONCLAD QUALITY GATE] ALL 7 STAGES PASSED (100% GOLD STANDARD) ==="
exit 0
