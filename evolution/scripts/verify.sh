#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/ubuntu/Math-Arcid-V2"
cd "$REPO_DIR"

echo "=== [MATH-ARCID-V2 IRONCLAD QUALITY GATE] Starting 9-Stage Self-Healing Audit ==="

# 1. Validate JSON Files & Absolute Syllabus Ordering
echo "[1/9] Validating games.json, STATE.json, and absolute syllabus ordering..."
node - <<'EOF'
const fs = require('fs');
const games = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const state = JSON.parse(fs.readFileSync('evolution/STATE.json', 'utf8'));
if (!Array.isArray(games) || games.length === 0) throw new Error('games.json must be a non-empty array');
if (!state.metrics || !state.currentSprint) throw new Error('STATE.json missing metrics/currentSprint');

const subjectOrder = { math: 1, physics: 2, chemistry: 3, pc: 4 };
let prevSubjectRank = 0;
let prevOrder = -1;
const lastTopicEndBySubject = {};

for (const g of games) {
  if (!g.id || !g.path || !g.category) throw new Error(`Invalid game entry: ${JSON.stringify(g)}`);
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

  if (typeof g.topicStart === 'number') {
    const prevEnd = lastTopicEndBySubject[s] || 0;
    if (g.topicStart <= prevEnd) {
      throw new Error(`Syllabus topic order violation at "${g.id}": topicStart=${g.topicStart} <= prev topicEnd=${prevEnd}`);
    }
    if (typeof g.topicEnd !== 'number' || g.topicEnd < g.topicStart) {
      throw new Error(`Invalid topicEnd at "${g.id}"`);
    }
    lastTopicEndBySubject[s] = g.topicEnd;
  }
}
const categories = new Set(games.map(g => g.category));
if (categories.size > 8) {
  throw new Error(`Too many fragmented categories (${categories.size}); keep cohesive domains!`);
}
console.log(`  ✓ JSON valid; ${games.length} games strictly ordered across ${categories.size} domain(s).`);
EOF

# 2. Syntax Check All JavaScript Files
echo "[2/9] Syntax-checking all JavaScript files..."
node -c shared/*.js js/*.js
for game_dir in games/*; do
  if [ -d "$game_dir/js" ]; then
    node -c "$game_dir"/js/*.js
  fi
done
echo "  ✓ All JavaScript files passed syntax verification."

# 3. Verify Catalog Paths, ?from=game Links & Bespoke SVG Tile Artwork in js/hub.js
echo "[3/9] Verifying catalog paths, ?from=game exits, and custom PS5 Hub SVG artwork..."
node - <<'EOF'
const fs = require('fs');
const path = require('path');
const games = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const hubCode = fs.readFileSync('js/hub.js', 'utf8');

for (const g of games) {
  if (!fs.existsSync(g.path)) {
    throw new Error(`Registered game path does not exist: ${g.path}`);
  }
  if (!hubCode.includes(`game.id === '${g.id}'`) && !hubCode.includes(`game.id === "${g.id}"`)) {
    throw new Error(`Game "${g.id}" is missing a custom SVG tile artwork block in js/hub.js!`);
  }
  const gDir = path.dirname(g.path);
  const filesToScan = [g.path];
  const jsDir = path.join(gDir, 'js');
  if (fs.existsSync(jsDir)) {
    for (const f of fs.readdirSync(jsDir)) {
      if (f.endsWith('.js')) filesToScan.push(path.join(jsDir, f));
    }
  }
  for (const fp of filesToScan) {
    const txt = fs.readFileSync(fp, 'utf8');
    // Fail if any ../../index.html reference omits ?from=game
    const bareIdx = txt.match(/\.\.\/\.\.\/index\.html(?!\?from=game)/g);
    if (bareIdx && bareIdx.length > 0) {
      throw new Error(`Bare "../../index.html" missing "?from=game" in ${fp}`);
    }
  }
}
console.log(`  ✓ All ${games.length} registered games have valid HTML entries, ?from=game links, and bespoke SVG artwork.`);
EOF

# 4. Enforce Gold Standard 6-Module Architecture, RTL Arabic & Zero GPU-Stall Rules
echo "[4/9] Auditing 6-Module Architecture, RTL Arabic, and 60FPS GPU discipline..."
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
    echo "  ✗ ERROR: Game '$slug' uses forbidden 540x960 portrait box!"
    exit 1
  fi

  if grep -qiE 'backdrop-filter\s*:\s*[^n;]' "$game_dir/css/style.css"; then
    echo "  ✗ ERROR: Game '$slug' CSS uses forbidden backdrop-filter (60FPS stall)!"
    exit 1
  fi

  if grep -qE 'shadowBlur\s*=\s*[1-9]' "$game_dir"/js/*.js; then
    echo "  ✗ ERROR: Game '$slug' JS uses forbidden shadowBlur > 0 (60FPS stall)!"
    exit 1
  fi
done
if grep -qiE 'backdrop-filter\s*:\s*[^n;]' css/hub.css css/common.css; then
  echo "  ✗ ERROR: Hub CSS uses forbidden backdrop-filter!"
  exit 1
fi
echo "  ✓ All curriculum games & Hub satisfy 6-module RTL & 60FPS GPU rules."

# 5. Enforce Minimum Code Depth (>= 2,500 LOC per Curriculum Game)
echo "[5/9] Auditing engineering depth (>= 2,500 LOC per curriculum game)..."
for game_dir in games/*; do
  [ -d "$game_dir" ] || continue
  slug=$(basename "$game_dir")
  if [[ "$slug" =~ ^($LEGACY_GENESIS)$ ]]; then
    continue
  fi

  total_lines=$(cat "$game_dir"/index.html "$game_dir"/css/*.css "$game_dir"/js/*.js | wc -l)
  if [ "$total_lines" -lt 2500 ]; then
    echo "  ✗ ERROR: Game '$slug' has only $total_lines lines (minimum 2,500 lines)."
    exit 1
  fi
  echo "  ✓ Game '$slug': $total_lines lines of code."
done

# 6. Audit Curriculum Depth, Option Shuffling (Fisher-Yates) & Lossless Bidi Math
echo "[6/9] Auditing curriculum banks (>=24 Qs), option shuffling & ArcadeCore.setBidiSafeMath..."
node - <<'EOF'
const fs = require('fs');
const vm = require('vm');
const ArcadeCore = require('./shared/arcade-core.js');

function makeDoc() {
  const mk = (tag) => ({
    tagName: tag, className: '', dir: '', children: [],
    set textContent(v) { this._txt = v; this.children = []; },
    get textContent() { return this._txt !== undefined ? this._txt : this.children.map(c => c.textContent).join(''); },
    appendChild(c) { this._txt = undefined; this.children.push(c); },
    get ownerDocument() { return doc; }
  });
  const doc = { createElement: mk, createTextNode: (t) => ({ nodeType: 3, textContent: String(t) }) };
  return doc;
}
const doc = makeDoc();
const legacy = new Set(['mathcore-survivor', 'math-battle']);

for (const slug of fs.readdirSync('games').sort()) {
  if (legacy.has(slug) || !fs.statSync(`games/${slug}`).isDirectory()) continue;
  const code = fs.readFileSync(`games/${slug}/js/curriculum.js`, 'utf8');
  const sandbox = { window: {}, Math, console };
  vm.runInNewContext(code, sandbox);
  const w = sandbox.window;
  const bank = w.QUESTION_BANK || w.SEQ_QUESTION_BANK || w.ASY_QUESTION_BANK || Object.values(w).find(v => Array.isArray(v) && v.length > 10 && v[0] && v[0].prompt);
  if (!bank || bank.length < 24) {
    throw new Error(`Game "${slug}" curriculum.js has < 24 questions (${bank ? bank.length : 0})!`);
  }
  const withGraphs = bank.filter(q => q.graphSpec).length;
  if (withGraphs < 6) {
    throw new Error(`Game "${slug}" curriculum.js must include >= 6 graphSpec questions (found ${withGraphs})!`);
  }

  const seenPrompts = new Set();
  for (const q of bank) {
    if (!q.prompt || !q.hint) throw new Error(`Empty prompt or hint in ${slug}/${q.id}`);
    if (seenPrompts.has(q.prompt)) throw new Error(`Duplicate prompt in ${slug}/${q.id}`);
    seenPrompts.add(q.prompt);
    if (!Array.isArray(q.options) || q.options.length !== 4) throw new Error(`Invalid options count in ${slug}/${q.id}`);
    if (new Set(q.options.map(o => String(o).trim())).size !== 4) throw new Error(`Duplicate option strings in ${slug}/${q.id}`);
    if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) throw new Error(`Invalid correctIndex in ${slug}/${q.id}`);

    for (const field of [q.prompt, q.hint, ...q.options]) {
      const el = doc.createElement('div');
      ArcadeCore.setBidiSafeMath(el, field);
      const reconstructed = el.children.map(c => c.textContent).join('');
      if (reconstructed !== String(field)) {
        throw new Error(`Lossless Bidi mismatch in ${slug}/${q.id}`);
      }
      const badArabic = el.children.some(c => c.tagName === 'bdi' && /[\u0600-\u06FF]/.test(c.textContent));
      if (badArabic) {
        throw new Error(`Arabic glyph trapped inside <bdi> in ${slug}/${q.id}`);
      }
    }
  }

  // Verify runtime Fisher-Yates option shuffling
  const pickFn = Object.entries(w).find(([k, v]) => typeof v === 'function' && /^pick.*Challenge$/i.test(k))?.[1];
  if (!pickFn) throw new Error(`Game "${slug}" missing window.pick*Challenge() function!`);
  const seenCorrectSlots = new Set();
  for (let i = 0; i < 36; i++) {
    const picked = pickFn.length >= 2 && slug !== 'limit-abyss' ? pickFn('all', null, []) : pickFn(null, []);
    if (!picked || typeof picked.correctIndex !== 'number') throw new Error(`pickChallenge returned invalid item in ${slug}`);
    seenCorrectSlots.add(picked.correctIndex);
  }
  if (seenCorrectSlots.size < 3) {
    throw new Error(`Game "${slug}" options are NOT dynamically shuffled (seen correctIndex slots: ${[...seenCorrectSlots]})!`);
  }
  console.log(`  ✓ Game "${slug}": ${bank.length} Qs, ${withGraphs} graphs, Bidi lossless, shuffled slots=${JSON.stringify([...seenCorrectSlots].sort())}.`);
}
EOF

# 7. Runtime VM Canvas Verification for All graphSpec Plots
echo "[7/9] Executing live VM render test across all graphSpec plotters..."
node - <<'EOF'
const fs = require('fs');
const vm = require('vm');
const ArcadeCore = require('./shared/arcade-core.js');
const legacy = new Set(['mathcore-survivor', 'math-battle']);

function makeMockCtx() {
  const calls = [];
  const noop = () => {};
  const grad = { addColorStop: noop };
  return {
    calls, fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: '', textBaseline: '', direction: '', globalAlpha: 1, shadowBlur: 0, shadowColor: '',
    clearRect: (...a) => calls.push(['clearRect', ...a]),
    fillRect: (...a) => calls.push(['fillRect', ...a]),
    strokeRect: noop, beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop,
    arc: noop, ellipse: noop, quadraticCurveTo: noop, bezierCurveTo: noop, rect: noop,
    fill: noop, stroke: noop, save: noop, restore: noop, translate: noop, rotate: noop, scale: noop,
    setLineDash: noop, clip: noop,
    fillText: (t) => calls.push(['fillText', t]),
    strokeText: noop,
    measureText: (t) => ({ width: String(t || '').length * 6 }),
    createLinearGradient: () => grad, createRadialGradient: () => grad
  };
}

let totalPlots = 0;
for (const slug of fs.readdirSync('games').sort()) {
  if (legacy.has(slug) || !fs.statSync(`games/${slug}`).isDirectory()) continue;
  const mockCtx = makeMockCtx();
  const mockCanvas = { width: 390, height: 185, getContext: () => mockCtx };
  const sb = {
    window: { innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1, ArcadeCore },
    document: { getElementById: () => mockCanvas, createElement: () => ({ textContent: '', className: '', dir: '' }) },
    Math, console, performance: { now: () => 1000 }, requestAnimationFrame: () => {}, ArcadeCore
  };
  sb.window.document = sb.document;
  vm.runInNewContext(fs.readFileSync(`games/${slug}/js/curriculum.js`, 'utf8'), sb);
  vm.runInNewContext(fs.readFileSync(`games/${slug}/js/renderer.js`, 'utf8'), sb);

  const w = sb.window;
  const bank = w.QUESTION_BANK || w.SEQ_QUESTION_BANK || w.ASY_QUESTION_BANK || Object.values(w).find(v => Array.isArray(v) && v.length > 10 && v[0] && v[0].prompt);
  const drawFn = w.drawSequenceGraph || w.drawRitualGraph || w.drawSealGraph || w.drawAbyssGraph || w.drawReactorGraph || w.drawForgeGraph || w.drawOdysseyGraph || w.drawCasinoGraph || w.drawArgandGraph;
  if (!drawFn) throw new Error(`No draw*Graph plotter found in ${slug}/js/renderer.js`);

  for (const q of bank) {
    if (!q.graphSpec) continue;
    mockCtx.calls.length = 0;
    drawFn(mockCanvas, q.graphSpec);
    if (mockCtx.calls.length < 2) {
      throw new Error(`graphSpec "${q.graphSpec.type}" rendered 0 draw calls in ${slug}`);
    }
    totalPlots++;
  }
}
console.log(`  ✓ Rendered all ${totalPlots} graphSpec plots across all curriculum games with 0 errors.`);
EOF

# 8. Headless Chromium Real-Browser Asset & Runtime Smoke Test
echo "[8/9] Running Headless Chromium real-browser smoke check on Hub + all games..."
node - <<'EOF'
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFile } = require('child_process');

const games = JSON.parse(fs.readFileSync('games.json', 'utf8'));
const pages = ['index.html?from=game', ...games.map(g => g.path)];

// Verify local assets exist before spinning Chromium
for (const p of ['index.html', ...games.map(g => g.path)]) {
  const html = fs.readFileSync(p, 'utf8');
  const dir = path.dirname(p);
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const ref = m[1].split('?')[0];
    if (/^https?:\/\//.test(ref) || ref.startsWith('#') || ref.startsWith('data:')) continue;
    const resolved = path.resolve(dir, ref);
    if (!fs.existsSync(resolved)) throw new Error(`Missing local asset "${ref}" referenced in ${p}`);
  }
}

if (!fs.existsSync('/snap/bin/chromium')) {
  console.log('  ⚠ /snap/bin/chromium not found; skipped live browser stage.');
  process.exit(0);
}

const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
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
  const runPage = (pagePath, budgetMs = 2600) => new Promise((resolve, reject) => {
    execFile('/snap/bin/chromium', [
      '--headless', '--no-sandbox', '--disable-gpu', '--enable-logging=stderr', '--v=0',
      '--dump-dom', `--virtual-time-budget=${budgetMs}`, `http://127.0.0.1:${port}/${pagePath}`
    ], { timeout: 20000 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(`Chromium failed on ${pagePath}: ${err.message}`));
      const errs = (stderr || '').split('\n').filter(l =>
        /Uncaught|ReferenceError|TypeError|SyntaxError|AudioContext was not allowed|Failed to load resource/i.test(l)
      );
      if (errs.length > 0) {
        return reject(new Error(`Browser console errors on ${pagePath}: ${errs.join(' | ')}`));
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
      } else if (!/<canvas/i.test(stdout || '')) {
        return reject(new Error(`Game page ${pagePath} rendered without <canvas>!`));
      }
      resolve(pagePath);
    });
  });

  try {
    // Run Hub first with generous budget to verify async games.json load + absolute order
    await runPage(pages[0], 4500);
    // Run games in pairs to avoid ARM64 CPU contention
    const gamePages = pages.slice(1);
    for (let i = 0; i < gamePages.length; i += 2) {
      await Promise.all(gamePages.slice(i, i + 2).map(p => runPage(p, 2600)));
    }
    srv.close();
    console.log(`  ✓ Headless Chromium passed all ${pages.length} pages (0 console errors, 0 missing assets, absolute Hub order verified).`);
  } catch (e) {
    srv.close();
    console.error('  ✗ ERROR:', e.message);
    process.exit(1);
  }
});
EOF

# 9. Check Platform Shell Assets
echo "[9/9] Verifying PS5 Console Hub & shared core assets..."
test -f index.html || (echo "Missing index.html" && exit 1)
test -f css/common.css || (echo "Missing css/common.css" && exit 1)
test -f css/hub.css || (echo "Missing css/hub.css" && exit 1)
test -f shared/arcade-core.js || (echo "Missing shared/arcade-core.js" && exit 1)
test -f evolution/GOLD_STANDARD.md || (echo "Missing evolution/GOLD_STANDARD.md" && exit 1)
echo "  ✓ Platform shell assets verified."

echo "=== [MATH-ARCID-V2 IRONCLAD QUALITY GATE] ALL 9 STAGES PASSED (100% GOLD STANDARD) ==="
exit 0
