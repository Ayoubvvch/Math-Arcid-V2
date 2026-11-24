#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/ubuntu/Math-Arcid-V2"
cd "$REPO_DIR"

echo "=== [MATH-ARCID-V2 CREATIVE QUALITY GATE v3.0] Starting 7-Stage Audit ==="

# 1. Validate JSON Files, Syllabus Ordering & Anti-Clone Diversity Registry
echo "[1/7] Validating games.json, STATE.json & creativeProfile anti-clone uniqueness..."
node - <<'EOF'
const fs = require('fs');
const games = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const state = JSON.parse(fs.readFileSync('evolution/STATE.json', 'utf8'));
if (!Array.isArray(games) || games.length === 0) throw new Error('games.json must be a non-empty array');
if (!state.metrics || !state.currentSprint) throw new Error('STATE.json missing metrics/currentSprint');

const subjectOrder = { math: 1, physics: 2, chemistry: 3, pc: 4 };
let prevSubjectRank = 0;
let prevOrder = -1;

const seenGenres = new Map();
const seenCombos = new Map();

for (const g of games) {
  if (!g.id || !g.path || !g.category || !g.title) {
    throw new Error(`Invalid game entry: ${JSON.stringify(g)}`);
  }
  const s = g.subject || 'math';
  const sRank = subjectOrder[s];
  if (!sRank) throw new Error(`Unknown subject "${s}" in game "${g.id}"`);
  if (sRank < prevSubjectRank) {
    throw new Error(`Subject ordering regression at "${g.id}" (${s})`);
  }
  if (sRank > prevSubjectRank) {
    prevSubjectRank = sRank;
    prevOrder = -1;
  }
  if (typeof g.order !== 'number' || g.order <= prevOrder) {
    throw new Error(`Absolute order violation at "${g.id}": order=${g.order} must be > ${prevOrder}`);
  }
  prevOrder = g.order;

  // Anti-Clone Diversity Enforcement
  const cp = g.creativeProfile;
  if (!cp || !cp.genre || !cp.camera || !cp.coreMechanic || !cp.controlScheme || !cp.visualStyle) {
    throw new Error(`Game "${g.id}" missing mandatory creativeProfile {genre, camera, coreMechanic, controlScheme, visualStyle}`);
  }
  const normGenre = String(cp.genre).trim().toLowerCase();
  if (seenGenres.has(normGenre)) {
    throw new Error(`ANTI-CLONE VIOLATION: "${g.id}" repeats genre "${cp.genre}" already used by "${seenGenres.get(normGenre)}"!`);
  }
  seenGenres.set(normGenre, g.id);

  const normCombo = `${String(cp.camera).trim().toLowerCase()}|${String(cp.controlScheme).trim().toLowerCase()}`;
  if (seenCombos.has(normCombo)) {
    throw new Error(`ANTI-CLONE VIOLATION: "${g.id}" duplicates (camera + controlScheme) "${normCombo}" of "${seenCombos.get(normCombo)}"!`);
  }
  seenCombos.set(normCombo, g.id);
}

console.log(`  ✓ JSON valid; ${games.length} unique game(s) verified with distinct genres & control profiles.`);
EOF

# 2. Syntax Check All JavaScript Files
echo "[2/7] Syntax-checking all JavaScript files..."
node -c shared/*.js js/*.js
while IFS= read -r -d '' jsfile; do
  node -c "$jsfile"
done < <(find games -type f \( -name '*.js' -o -name '*.mjs' \) -print0)
echo "  ✓ All JavaScript files passed syntax verification."

# 3. Verify Catalog Paths, Bespoke SVG Artwork, ?from=game Exits & Zero Dead Clutter
echo "[3/7] Verifying catalog paths, ?from=game exits, Hub SVG artwork & zero dead clutter..."
if find games -name 'standalone.html' | grep -q .; then
  echo "  ✗ ERROR: Found leftover standalone.html clutter!"
  exit 1
fi
for dead in shared/canvas-kit.js shared/math-engine.js; do
  if [ -f "$dead" ]; then
    echo "  ✗ ERROR: Dead legacy module still present: $dead"
    exit 1
  fi
done

node - <<'EOF'
const fs = require('fs');
const path = require('path');
const games = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const hubCode = fs.readFileSync('js/hub.js', 'utf8');

function walkFiles(dir) {
  let out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out = out.concat(walkFiles(p));
    else if (/\.(html|js|mjs|css)$/i.test(ent.name)) out.push(p);
  }
  return out;
}

for (const g of games) {
  if (!fs.existsSync(g.path)) {
    throw new Error(`Registered game path does not exist: ${g.path}`);
  }
  if (!hubCode.includes(`game.id === '${g.id}'`) && !hubCode.includes(`game.id === "${g.id}"`)) {
    throw new Error(`Game "${g.id}" is missing bespoke SVG tile artwork in js/hub.js!`);
  }
  const gDir = path.dirname(g.path);
  for (const fp of walkFiles(gDir)) {
    const txt = fs.readFileSync(fp, 'utf8');
    const bareIdx = txt.match(/\.\.\/\.\.\/index\.html(?!\?from=game)/g);
    if (bareIdx && bareIdx.length > 0) {
      throw new Error(`Bare "../../index.html" missing "?from=game" in ${fp}`);
    }
  }
}

for (const htmlPath of ['index.html', ...games.map(g => g.path)]) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const dir = path.dirname(htmlPath);
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const ref = m[1].split('?')[0];
    if (/^https?:\/\//.test(ref) || ref.startsWith('#') || ref.startsWith('data:')) continue;
    const resolved = path.resolve(dir, ref);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Missing local asset "${ref}" referenced in ${htmlPath}`);
    }
  }
}

console.log(`  ✓ All ${games.length} game(s) verified: valid HTML, local assets, ?from=game links, bespoke SVG & zero clutter.`);
EOF

# 4. RTL Arabic, Universal KaTeX, GPU 60FPS Hygiene, ArcadeCore Integration & Anti-QCM-Clone Guard
echo "[4/7] Auditing RTL Arabic, universal KaTeX wiring, 60FPS hygiene & anti-QCM-clone guard..."
if grep -qiE 'backdrop-filter\s*:\s*[^n;]' css/hub.css css/common.css; then
  echo "  ✗ ERROR: Hub CSS uses forbidden backdrop-filter!"
  exit 1
fi

if ! grep -q 'katex\.min\.css' index.html || ! grep -q 'katex\.min\.js' index.html; then
  echo "  ✗ ERROR: Hub index.html must include shared/vendor/katex/katex.min.{css,js}!"
  exit 1
fi

for game_dir in games/*; do
  [ -d "$game_dir" ] || continue
  slug=$(basename "$game_dir")

  if [ ! -f "$game_dir/index.html" ]; then
    echo "  ✗ ERROR: Game '$slug' missing index.html"
    exit 1
  fi
  if ! grep -q 'lang="ar"' "$game_dir/index.html" || ! grep -q 'dir="rtl"' "$game_dir/index.html"; then
    echo "  ✗ ERROR: Game '$slug' index.html must use <html lang=\"ar\" dir=\"rtl\">!"
    exit 1
  fi
  if grep -q 'width="540"' "$game_dir/index.html"; then
    echo "  ✗ ERROR: Game '$slug' uses forbidden 540x960 narrow portrait box!"
    exit 1
  fi
  if ! grep -q 'katex\.min\.css' "$game_dir/index.html" || ! grep -q 'katex\.min\.js' "$game_dir/index.html"; then
    echo "  ✗ ERROR: Game '$slug' must include ../../shared/vendor/katex/katex.min.{css,js} (universal KaTeX rule)!"
    exit 1
  fi
  if ! grep -q 'arcade-core\.js' "$game_dir/index.html"; then
    echo "  ✗ ERROR: Game '$slug' must include ../../shared/arcade-core.js!"
    exit 1
  fi

  if grep -rqiE 'backdrop-filter\s*:\s*[^n;]' "$game_dir" --include='*.css'; then
    echo "  ✗ ERROR: Game '$slug' CSS uses forbidden backdrop-filter (60FPS stall)!"
    exit 1
  fi
  if grep -rqE 'shadowBlur\s*=\s*[1-9]' "$game_dir" --include='*.js' --include='*.mjs'; then
    echo "  ✗ ERROR: Game '$slug' JS uses forbidden shadowBlur > 0 (60FPS stall)!"
    exit 1
  fi

  # Guard against banned legacy QCM-door clones, passive GeoGebra slider applets, and missing Start/Gamepad support
  if [ "$slug" != "math-battle" ]; then
    if grep -rqE 'id="overrideModal"|id="seqOpt0"|StriderInput|pick(Abyss|Asylum|Seq|Argand|Reactor|Forge|Odyssey|Casino)Challenge' "$game_dir"; then
      echo "  ✗ ERROR: Game '$slug' reproduces banned legacy QCM-door clone template!"
      exit 1
    fi
    if grep -rqiE '<input[^>]*type=["\x27]range["\x27]|type:\s*["\x27]range["\x27]|class="[^"]*slider' "$game_dir"; then
      echo "  ✗ ERROR: Game '$slug' uses banned passive GeoGebra slider controls (must be a real-time game, not a slider worksheet)!"
      exit 1
    fi
    if ! grep -rqE 'PauseMenu\??\.attach' "$game_dir"; then
      echo "  ✗ ERROR: Game '$slug' must integrate ArcadeCore.PauseMenu.attach for Start(9)/Esc pause & Hub exit!"
      exit 1
    fi
    if ! grep -rqE 'ArcadeCore\??\.Gamepad|GamepadEngine' "$game_dir"; then
      echo "  ✗ ERROR: Game '$slug' must implement full ArcadeCore.Gamepad controller support!"
      exit 1
    fi
    if ! grep -rqE 'ArcadeCore\??\.Progress' "$game_dir" && ! grep -rq 'Progress\.' "$game_dir"; then
      echo "  ✗ ERROR: Game '$slug' must record progress via ArcadeCore.Progress!"
      exit 1
    fi
  fi
done
echo "  ✓ All games satisfy RTL, universal KaTeX, 60FPS GPU discipline, ArcadeCore & anti-clone rules."

# 5. Verify ArcadeCore.renderMath (KaTeX + Lossless Fallback) & Progress Unit Contract
echo "[5/7] Verifying ArcadeCore KaTeX renderMath & Progress unit contract..."
node - <<'EOF'
const katex = require('./shared/vendor/katex/katex.min.js');
const ArcadeCore = require('./shared/arcade-core.js');
const mk = (tag) => ({
  tagName: tag, className: '', dir: '', children: [], innerHTML: '',
  set textContent(v) { this._txt = v; this.children = []; this.innerHTML = ''; },
  get textContent() { return this._txt !== undefined ? this._txt : this.children.map(c => c.textContent).join(''); },
  appendChild(c) { this._txt = undefined; this.children.push(c); },
  get ownerDocument() { return doc; }
});
const doc = { createElement: mk, createTextNode: (t) => ({ nodeType: 3, textContent: String(t) }) };

const plainSamples = [
  'احسب نهاية المتتالية uₙ₊₁ = (2uₙ + 1)/(uₙ + 2) عند +∞',
  'مبرهنة القيم الوسيطية f(a)×f(b) < 0 و E(x) = ⌊x⌋',
  'التعبير العقدي للدوران z\' - ω = e^{iθ}(z - ω) و u⃗ ∧ v⃗'
];
for (const s of plainSamples) {
  const el = doc.createElement('div');
  ArcadeCore.setBidiSafeMath(el, s);
  const out = el.children.map(c => c.textContent).join('');
  if (out !== s) throw new Error(`Lossless Bidi failed on: ${s}`);
  if (el.children.some(c => c.tagName === 'bdi' && /[\u0600-\u06FF]/.test(c.textContent))) {
    throw new Error(`Arabic glyph trapped in <bdi> on: ${s}`);
  }
}

const htmlOut = katex.renderToString('u_{n+1} = \\frac{1}{2}u_n + 2', { throwOnError: true, strict: 'ignore' });
if (!htmlOut.includes('class="katex"') || htmlOut.includes('katex-error')) {
  throw new Error('KaTeX live render sanity failed!');
}

const res = ArcadeCore.Progress.recordRun('__verify_probe__', {
  score: 1200, stagesCleared: 3, totalStages: 5, victory: false, accuracy: 88
});
const metrics = ArcadeCore.Progress.computeGameMetrics('__verify_probe__');
if (!res || metrics.stagesCleared !== 3 || metrics.totalStages !== 5 || metrics.masteryPct <= 0) {
  throw new Error('ArcadeCore.Progress generic stages telemetry check failed!');
}
console.log('  ✓ ArcadeCore KaTeX + Bidi & Progress contracts verified.');
EOF

# 6. Headless Chromium Real-Browser Smoke & Universal KaTeX Audit
echo "[6/7] Running Headless Chromium live check on Hub + all games (including KaTeX audit)..."
node - <<'EOF'
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFile } = require('child_process');

const games = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const pages = ['index.html?from=game', ...games.map(g => g.path)];

if (!fs.existsSync('/snap/bin/chromium')) {
  console.log('  ⚠ /snap/bin/chromium not found; skipped live browser stage.');
  process.exit(0);
}

const mime = {
  '.html': 'text/html', '.js': 'application/javascript', '.mjs': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.webp': 'image/webp', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf'
};

const srv = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let fp = path.join(process.cwd(), urlPath === '/' ? 'index.html' : urlPath);
  if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
  if (!fs.existsSync(fp)) { res.writeHead(404); res.end('404'); return; }
  res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
});

srv.listen(0, '127.0.0.1', async () => {
  const port = srv.address().port;
  const runPage = (pagePath, budgetMs = 3000) => new Promise((resolve, reject) => {
    execFile('/snap/bin/chromium', [
      '--headless', '--no-sandbox', '--disable-gpu', '--enable-logging=stderr', '--v=0',
      '--dump-dom', `--virtual-time-budget=${budgetMs}`, `http://127.0.0.1:${port}/${pagePath}`
    ], { timeout: 22000 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(`Chromium failed on ${pagePath}: ${err.message}`));
      const errs = (stderr || '').split('\n').filter(l =>
        /Uncaught|ReferenceError|TypeError|SyntaxError|AudioContext was not allowed|Failed to load resource/i.test(l)
      );
      if (errs.length > 0) {
        return reject(new Error(`Browser console errors on ${pagePath}: ${errs.join(' | ')}`));
      }
      if (/class="[^"]*katex-error/.test(stdout || '')) {
        return reject(new Error(`KaTeX parse error (.katex-error) rendered on ${pagePath}!`));
      }
      if (!/class="katex"/.test(stdout || '')) {
        return reject(new Error(`No KaTeX-rendered math (.katex) detected on ${pagePath}!`));
      }
      if (pagePath.startsWith('index.html')) {
        const tileMatches = [...stdout.matchAll(/class="tile-title">([^<]+)</g)].map(m => m[1].trim());
        if (tileMatches.length !== games.length) {
          return reject(new Error(`Hub rendered ${tileMatches.length} tiles instead of ${games.length}!`));
        }
        for (let idx = 0; idx < games.length; idx++) {
          if (tileMatches[idx] !== games[idx].title) {
            return reject(new Error(`Hub tile #${idx+1} order mismatch: got "${tileMatches[idx]}", expected "${games[idx].title}"`));
          }
        }
      } else {
        const hasInteractiveStage = /<canvas|<svg|data-game-stage|role="application"/i.test(stdout || '');
        if (!hasInteractiveStage) {
          return reject(new Error(`Game page ${pagePath} rendered without an interactive <canvas>, <svg>, or game stage!`));
        }
      }
      resolve(pagePath);
    });
  });

  try {
    await runPage(pages[0], 4200);
    const gamePages = pages.slice(1);
    for (let i = 0; i < gamePages.length; i += 2) {
      await Promise.all(gamePages.slice(i, i + 2).map(p => runPage(p, 2800)));
    }
    srv.close();
    console.log(`  ✓ Headless Chromium passed all ${pages.length} page(s) (0 console errors, 0 404s, KaTeX rendered with 0 errors).`);
  } catch (e) {
    srv.close();
    console.error('  ✗ ERROR:', e.message);
    process.exit(1);
  }
});
EOF

# 7. Verify Platform Shell & Core Documentation
echo "[7/7] Verifying Console Hub & Creative Charter files..."
test -f index.html || (echo "Missing index.html" && exit 1)
test -f css/common.css || (echo "Missing css/common.css" && exit 1)
test -f css/hub.css || (echo "Missing css/hub.css" && exit 1)
test -f shared/arcade-core.js || (echo "Missing shared/arcade-core.js" && exit 1)
test -f evolution/CURRICULUM.md || (echo "Missing evolution/CURRICULUM.md" && exit 1)
test -f evolution/GOLD_STANDARD.md || (echo "Missing evolution/GOLD_STANDARD.md" && exit 1)
echo "  ✓ Platform shell & charter files verified."

echo "=== [MATH-ARCID-V2 CREATIVE QUALITY GATE v3.0] ALL 7 STAGES PASSED ==="
exit 0
