/**
 * Tangent Prism — Real-Time Optical Calculus Arcade (Lesson 2: Skills 23–40)
 * Full DualSense/Xbox Gamepad + ArcadeCore.PauseMenu + KaTeX + CanvasAxisKit.drawMathRich
 * 60FPS Clean Rendering (Zero shadowBlur, Zero passive sliders, Zero QCM popups).
 */

import { TRIALS } from './trials.js';

const GAME_ID = 'tangent-prism';
const ArcadeCore = window.ArcadeCore;

// ---------- Lightweight Procedural Optical WebAudio Synth ----------
class OpticalAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (this.muted) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch (_) {
      return null;
    }
  }

  tone(freq, dur = 0.12, type = 'triangle', gainVal = 0.08, slideTo = null) {
    const c = this.ensure();
    if (!c) return;
    try {
      const now = c.currentTime;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(gainVal, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(g);
      g.connect(c.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    } catch (_) {
      // Safe silent fallback
    }
  }

  playLock(combo = 1) {
    const base = 440 * Math.pow(1.06, Math.min(combo, 10));
    this.tone(base, 0.14, 'triangle', 0.09, base * 1.35);
    setTimeout(() => this.tone(base * 1.5, 0.16, 'sine', 0.07), 45);
  }

  playLaser() {
    this.tone(720, 0.09, 'sawtooth', 0.05, 290);
  }

  playSwitch() {
    this.tone(520, 0.06, 'sine', 0.05, 660);
  }

  playHit() {
    this.tone(185, 0.22, 'sawtooth', 0.09, 75);
  }

  playVictory() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      setTimeout(() => this.tone(f, 0.22, 'triangle', 0.085), idx * 90);
    });
  }
}

const audio = new OpticalAudio();

// ---------- DOM References ----------
const dom = {
  canvas: document.getElementById('prismCanvas'),
  canvasFrame: document.getElementById('canvasFrame'),
  trialNav: document.getElementById('trialNav'),
  btnPause: document.getElementById('btnPause'),
  btnAudio: document.getElementById('btnAudio'),
  gpBadge: document.getElementById('gpBadge'),
  trialBadge: document.getElementById('trialBadge'),
  trialName: document.getElementById('trialName'),
  waveCounter: document.getElementById('waveCounter'),
  progressFill: document.getElementById('progressFill'),
  hudScore: document.getElementById('hudScore'),
  hudCombo: document.getElementById('hudCombo'),
  hudHp: document.getElementById('hudHp'),
  skillTag: document.getElementById('skillTag'),
  subWaveTag: document.getElementById('subWaveTag'),
  formulaMain: document.getElementById('formulaMain'),
  formulaLive: document.getElementById('formulaLive'),
  missionGoal: document.getElementById('missionGoal'),
  scopeReadout: document.getElementById('scopeReadout'),
  gaugeDf: document.getElementById('gaugeDf'),
  gaugeD2f: document.getElementById('gaugeD2f'),
  valDf: document.getElementById('valDf'),
  valD2f: document.getElementById('valD2f'),
  actionDeck: document.getElementById('actionDeck'),
  controlHint: document.getElementById('controlHint'),
  toast: document.getElementById('toastOverlay'),
  endOverlay: document.getElementById('endOverlay'),
  endGlyph: document.getElementById('endGlyph'),
  endTitle: document.getElementById('endTitle'),
  endDesc: document.getElementById('endDesc'),
  endScore: document.getElementById('endScore'),
  endAcc: document.getElementById('endAcc'),
  endRank: document.getElementById('endRank'),
  btnEndReplay: document.getElementById('btnEndReplay'),
  btnEndNext: document.getElementById('btnEndNext'),
  btnEndHub: document.getElementById('btnEndHub')
};

const ctx = dom.canvas.getContext('2d');

// ---------- Persistent Game State ----------
const state = {
  trialIdx: 0,
  waveIdx: 0,
  clearedTrials: new Set(),
  score: 0,
  combo: 1,
  hp: 5,
  maxHp: 5,
  progress: 0,
  goalCount: 9,
  attempts: 0,
  correct: 0,
  ended: false,
  paused: false,
  time: 0,
  shake: 0,
  toastTimer: 0,
  hitCooldown: 0,
  width: 900,
  height: 580,
  dpr: Math.min(window.devicePixelRatio || 1, 2),

  // Player coordinates in mathematical world units
  px: -0.6,
  py: 0,
  vx: 0,
  vy: 0,
  pointerActive: false,
  pointerWorldX: 0,
  pointerWorldY: 0,

  // Active Trial Sub-States
  prismTarget: null,         // Trial 1 orbiting tangent prism
  anomalyOrb: null,          // Trial 1 descending derivative singularity
  laserBeam: null,           // Visual shot feedback
  meteors: [],               // Trial 2 falling auxiliary meteors
  stormTimer: 0,             // Trial 2 graphical storm cycle
  optSparks: [],             // Trial 2 optimization sparks
  optLocked: false,
  crystals: [],              // Trial 3 concavity crystals
  gateFlash: 0,              // Trial 3 inflection pulse
  shieldMode: 'convex',      // Trial 3 active shield
  branchScroll: 0,           // Trial 4 infinite flight scroll
  branchGateX: 1,            // Trial 4 approaching branch wall
  branchLocked: false,       // Trial 4 whether branch type was locked
  relOrbs: [],               // Trial 4 relative position orbs
  symMode: 'even',           // Trial 5 active twin symmetry rule
  twinNode: null,            // Trial 5 paired crystal {x, y, mx, my}
  twinHazards: [],           // Trial 5 sweeping disruption orbs
  tracedSegments: [],        // Trial 5 lit curve arcs

  // Juice entities
  particles: [],
  floaters: [],
  dust: []
};

const keys = new Set();
const gpState = ArcadeCore.Gamepad.createState();
let pauseMenu = null;
let endFocusIdx = 0;

// ---------- Coordinate Mapping Helpers ----------
function getWorldBounds() {
  const trial = TRIALS[state.trialIdx];
  const wave = trial.waves[state.waveIdx] || trial.waves[0];
  if (trial.id === 'asymptote-tree') {
    return { xMin: -0.6, xMax: 9.2, yMin: -2.6, yMax: 7.4 };
  }
  const [xMin, xMax] = wave.xRange || [-4.5, 4.5];
  const [yMin, yMax] = wave.yRange || [-3.5, 4.5];
  return { xMin, xMax, yMin, yMax };
}

function worldToScreen(wx, wy) {
  const b = getWorldBounds();
  const padX = 44;
  const padY = 36;
  const plotW = Math.max(100, state.width - padX * 2);
  const plotH = Math.max(100, state.height - padY * 2);
  const sx = padX + ((wx - b.xMin) / (b.xMax - b.xMin)) * plotW;
  const sy = state.height - padY - ((wy - b.yMin) / (b.yMax - b.yMin)) * plotH;
  return { x: sx, y: sy };
}

function screenToWorld(sx, sy) {
  const b = getWorldBounds();
  const padX = 44;
  const padY = 36;
  const plotW = Math.max(100, state.width - padX * 2);
  const plotH = Math.max(100, state.height - padY * 2);
  const wx = b.xMin + ((sx - padX) / plotW) * (b.xMax - b.xMin);
  const wy = b.yMin + ((state.height - padY - sy) / plotH) * (b.yMax - b.yMin);
  return { x: wx, y: wy };
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function fmtNum(v, digits = 1) {
  if (!Number.isFinite(v)) return '∞';
  const clean = Math.abs(v) < 0.005 ? 0 : v;
  return clean.toFixed(digits);
}

// ---------- Visual FX Helpers ----------
function spawnBurst(sx, sy, color, count = 16) {
  for (let i = 0; i < count; i += 1) {
    const a = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
    const sp = 75 + Math.random() * 195;
    state.particles.push({
      x: sx,
      y: sy,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 0.45 + Math.random() * 0.3,
      maxLife: 0.75,
      size: 2.5 + Math.random() * 3.5,
      color
    });
  }
}

function spawnFloater(sx, sy, text, color = '#fde047') {
  state.floaters.push({ x: sx, y: sy, text, color, life: 1.05, maxLife: 1.05 });
}

function showToast(msg, kind = 'info') {
  if (!dom.toast) return;
  dom.toast.classList.remove('hidden', 'good', 'bad');
  if (kind === 'good') dom.toast.classList.add('good');
  if (kind === 'bad') dom.toast.classList.add('bad');
  ArcadeCore.renderMath(dom.toast, msg);
  state.toastTimer = 2.6;
}

function flashDeckButton(actionId) {
  const btn = dom.actionDeck.querySelector(`[data-action="${actionId}"]`);
  if (!btn) return;
  btn.classList.add('flash');
  setTimeout(() => btn.classList.remove('flash'), 170);
}

function setActiveDeckMode(actionId) {
  dom.actionDeck.querySelectorAll('.tp-act-btn').forEach((b) => {
    b.classList.toggle('active-mode', b.getAttribute('data-action') === actionId);
  });
}

// ---------- Telemetry & Scoring ----------
function recordHit(skillId, pts, msg, sx, sy, color = '#34d399') {
  state.attempts += 1;
  state.correct += 1;
  state.combo = Math.min(8, state.combo + 1);
  const gained = Math.round(pts * (1 + (state.combo - 1) * 0.25));
  state.score += gained;
  state.progress = Math.min(state.goalCount, state.progress + 1);
  state.shake = Math.max(state.shake, 4.5);

  if (sx !== undefined && sy !== undefined) {
    spawnBurst(sx, sy, color, 18);
    spawnFloater(sx, sy - 16, `+${gained}  ×${state.combo}`, '#fde047');
  }
  audio.playLock(state.combo);
  ArcadeCore.Gamepad.triggerHaptic(gpState, 65, 0.3, 0.5);
  ArcadeCore.Progress.recordAnswer(GAME_ID, skillId, true);

  if (msg) showToast(msg, 'good');
  syncHud();
  advanceWaveIfNeeded();

  if (state.progress >= state.goalCount) {
    finishTrial(true);
  }
}

function recordMistake(skillId, msg, sx, sy) {
  if (state.hitCooldown > 0) return;
  state.hitCooldown = 0.65;
  state.attempts += 1;
  state.combo = 1;
  state.hp = Math.max(0, state.hp - 1);
  state.shake = Math.max(state.shake, 9);

  if (sx !== undefined && sy !== undefined) {
    spawnBurst(sx, sy, '#fb7185', 14);
    spawnFloater(sx, sy - 14, '−1 ♥', '#fb7185');
  }
  audio.playHit();
  ArcadeCore.Gamepad.triggerHaptic(gpState, 140, 0.65, 0.85);
  ArcadeCore.Progress.recordAnswer(GAME_ID, skillId, false);

  if (msg) showToast(msg, 'bad');
  syncHud();

  if (state.hp <= 0) {
    finishTrial(false);
  }
}

function advanceWaveIfNeeded() {
  const trial = TRIALS[state.trialIdx];
  const nWaves = trial.waves.length;
  if (nWaves <= 1) return;
  const targetWave = Math.min(nWaves - 1, Math.floor((state.progress / state.goalCount) * nWaves));
  if (targetWave !== state.waveIdx) {
    state.waveIdx = targetWave;
    setupWaveEntities();
    syncWaveUI();
  }
}

function finishTrial(victory) {
  state.ended = true;
  if (victory) {
    state.clearedTrials.add(TRIALS[state.trialIdx].id);
    audio.playVictory();
  }
  const acc = state.attempts > 0 ? Math.round((state.correct / state.attempts) * 100) : 100;
  const res = ArcadeCore.Progress.recordRun(GAME_ID, {
    score: state.score,
    stagesCleared: state.clearedTrials.size,
    totalStages: TRIALS.length,
    victory: state.clearedTrials.size >= TRIALS.length || victory,
    accuracy: acc,
    answersAlreadyRecorded: true
  });

  const trial = TRIALS[state.trialIdx];
  dom.endGlyph.textContent = victory ? '✦' : '⚠';
  dom.endTitle.textContent = victory ? `تم إتقان ${trial.name}!` : 'نفدت طاقة الدرع البصري!';
  ArcadeCore.renderMath(
    dom.endDesc,
    victory
      ? `أنجزت ${trial.skillsLabel} بدقة ${acc}% ومضاعف رنين حتى ×${state.combo}.`
      : 'أعد المحاولة واضبط المماس أو التحدّب أو التماثل قبل استنزاف الدرع.'
  );
  dom.endScore.textContent = String(state.score);
  dom.endAcc.textContent = `${acc}%`;
  dom.endRank.textContent = (res && res.rank) || (victory ? 'A' : 'B');

  const hasNext = state.trialIdx < TRIALS.length - 1;
  dom.btnEndNext.classList.toggle('hidden', !hasNext);
  dom.endOverlay.classList.remove('hidden');
  endFocusIdx = 0;
  syncEndFocus();
  renderTrialNav();
}

function syncEndFocus() {
  const btns = [dom.btnEndReplay, dom.btnEndNext, dom.btnEndHub].filter((b) => !b.classList.contains('hidden'));
  ArcadeCore.Gamepad.applyFocusRing(btns, endFocusIdx);
}

// ---------- UI Rendering ----------
function renderTrialNav() {
  dom.trialNav.innerHTML = '';
  TRIALS.forEach((tr, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tp-trial-tab';
    if (idx === state.trialIdx) btn.classList.add('active');
    if (state.clearedTrials.has(tr.id)) btn.classList.add('cleared');
    btn.textContent = tr.shortTab;
    btn.addEventListener('click', () => {
      audio.playSwitch();
      loadTrial(idx);
    });
    dom.trialNav.appendChild(btn);
  });
}

function renderActionDeck() {
  const trial = TRIALS[state.trialIdx];
  dom.actionDeck.innerHTML = '';
  trial.actions.forEach((act) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `tp-act-btn tone-${act.tone || 'gold'}${act.span2 ? ' span-2' : ''}`;
    btn.setAttribute('data-action', act.id);

    const kEl = document.createElement('span');
    kEl.className = 'btn-key';
    kEl.dir = 'ltr';
    kEl.textContent = act.key;

    const lEl = document.createElement('span');
    ArcadeCore.renderMath(lEl, act.label);

    btn.appendChild(kEl);
    btn.appendChild(lEl);
    btn.addEventListener('click', () => triggerAction(act.id));
    dom.actionDeck.appendChild(btn);
  });
  ArcadeCore.renderMath(dom.controlHint, trial.hint);
}

function syncWaveUI() {
  const trial = TRIALS[state.trialIdx];
  const wave = trial.waves[state.waveIdx] || trial.waves[0];
  dom.trialBadge.textContent = `المرصد ${state.trialIdx + 1}/${TRIALS.length}`;
  dom.trialName.textContent = trial.name;
  dom.skillTag.textContent = trial.skillsLabel;
  ArcadeCore.renderMath(dom.subWaveTag, `موجة ${state.waveIdx + 1} من ${trial.waves.length}: ${wave.title}`);

  dom.formulaMain.removeAttribute('data-katex-done');
  dom.formulaMain.setAttribute('data-tex', wave.formulaTex);
  dom.formulaLive.removeAttribute('data-katex-done');
  dom.formulaLive.setAttribute('data-tex', wave.liveTex);
  ArcadeCore.renderAllMath(dom.formulaMain.parentElement);
  ArcadeCore.renderMath(dom.missionGoal, wave.goalText);

  if (trial.id === 'concavity-lens') setActiveDeckMode(state.shieldMode);
  if (trial.id === 'symmetry-twin') setActiveDeckMode(state.symMode);
}

function syncHud() {
  dom.hudScore.textContent = String(state.score);
  dom.hudCombo.textContent = `×${state.combo}`;
  dom.hudHp.textContent = '♥'.repeat(state.hp) + '♡'.repeat(Math.max(0, state.maxHp - state.hp));
  dom.waveCounter.textContent = `${state.progress} / ${state.goalCount}`;
  const pct = Math.min(100, Math.round((state.progress / Math.max(1, state.goalCount)) * 100));
  dom.progressFill.style.width = `${pct}%`;
}

function updateDerivativeScope(x0, dfVal, d2fVal) {
  dom.scopeReadout.textContent = `x₀ = ${fmtNum(x0, 2)}`;
  const c1 = clamp(dfVal, -6, 6);
  const c2 = clamp(d2fVal, -6, 6);

  const w1 = (Math.abs(c1) / 6) * 50;
  dom.gaugeDf.style.width = `${w1.toFixed(1)}%`;
  dom.gaugeDf.style.left = c1 >= 0 ? '50%' : `${(50 - w1).toFixed(1)}%`;
  dom.gaugeDf.classList.toggle('neg', c1 < 0);
  dom.valDf.textContent = fmtNum(dfVal, 1);

  const w2 = (Math.abs(c2) / 6) * 50;
  dom.gaugeD2f.style.width = `${w2.toFixed(1)}%`;
  dom.gaugeD2f.style.left = c2 >= 0 ? '50%' : `${(50 - w2).toFixed(1)}%`;
  dom.gaugeD2f.classList.toggle('neg', c2 < 0);
  dom.valD2f.textContent = fmtNum(d2fVal, 1);
}

// ---------- Trial & Wave Spawners ----------
function loadTrial(idx) {
  state.trialIdx = ((idx % TRIALS.length) + TRIALS.length) % TRIALS.length;
  const trial = TRIALS[state.trialIdx];
  state.waveIdx = 0;
  state.progress = 0;
  state.goalCount = trial.goalCount;
  state.hp = state.maxHp;
  state.combo = 1;
  state.attempts = 0;
  state.correct = 0;
  state.ended = false;
  state.hitCooldown = 0;
  state.particles = [];
  state.floaters = [];
  state.tracedSegments = [];
  dom.endOverlay.classList.add('hidden');

  setupWaveEntities();
  renderTrialNav();
  renderActionDeck();
  syncWaveUI();
  syncHud();
  showToast(`انطلاق ${trial.name}!`, 'info');
}

function setupWaveEntities() {
  const trial = TRIALS[state.trialIdx];
  const wave = trial.waves[state.waveIdx] || trial.waves[0];
  state.meteors = [];
  state.optSparks = [];
  state.crystals = [];
  state.relOrbs = [];
  state.twinHazards = [];
  state.laserBeam = null;

  if (trial.id === 'tangent-ricochet') {
    state.px = -1.1;
    state.py = wave.f(state.px);
    spawnTangentPrism();
    spawnAnomalyOrb();
  } else if (trial.id === 'aux-extrema') {
    state.px = 0.2;
    state.py = 0.8;
    state.stormTimer = 0;
    state.optLocked = false;
    if (wave.mode === 'aux') {
      spawnAuxMeteor();
      spawnAuxMeteor();
    } else if (wave.mode === 'optimize') {
      state.px = 0.45;
      spawnOptSpark();
    }
  } else if (trial.id === 'concavity-lens') {
    state.px = -1.8;
    state.py = wave.f(state.px);
    state.shieldMode = wave.d2f(state.px) >= 0 ? 'convex' : 'concave';
    spawnConcavityCrystal();
    spawnConcavityCrystal();
  } else if (trial.id === 'asymptote-tree') {
    state.px = 1.6;
    state.py = wave.f(state.px);
    state.branchGateX = 8.4;
    state.branchLocked = false;
    spawnRelOrb();
  } else if (trial.id === 'symmetry-twin') {
    state.px = 0.4;
    state.py = 0.4;
    // Start with a distinct default or matching mode on first wave to keep it responsive
    if (state.waveIdx === 0) state.symMode = 'even';
    spawnTwinTarget();
    spawnTwinHazard();
  }
}

// --- Trial 1 Spawners ---
function spawnTangentPrism() {
  const wave = TRIALS[0].waves[state.waveIdx];
  const [xMin, xMax] = wave.xRange;
  const [yMin, yMax] = wave.yRange;
  for (let tries = 0; tries < 20; tries += 1) {
    let tx = xMin + 1.1 + Math.random() * (xMax - xMin - 2.2);
    if (wave.singularX !== undefined && Math.abs(tx - wave.singularX) < 0.55) {
      tx += tx >= wave.singularX ? 0.7 : -0.7;
    }
    const ty = wave.f(tx);
    const m = wave.df(tx);
    const dir = Math.random() < 0.5 ? 1 : -1;
    const dx = dir * (1.15 + Math.random() * 0.75);
    const px = tx + dx;
    const py = ty + m * dx;
    if (px > xMin + 0.45 && px < xMax - 0.45 && py > yMin + 0.55 && py < yMax - 0.55) {
      state.prismTarget = { x: px, y: py, tx, phase: Math.random() * 6.28, ttl: 12 };
      return;
    }
  }
  const tx = 1.0;
  const ty = wave.f(tx);
  const m = wave.df(tx);
  state.prismTarget = { x: tx + 1.0, y: clamp(ty + m, yMin + 0.7, yMax - 0.7), tx, phase: 0, ttl: 12 };
}

function spawnAnomalyOrb() {
  const wave = TRIALS[0].waves[state.waveIdx];
  const anom = wave.anomaly;
  let kind = anom.kind;
  let x0 = anom.x0;
  let label = anom.labelCanvas;
  // On wave 2 (angular / vertical), alternate angular |x-1| and vertical sqrt(x+2) anomalies!
  if (state.waveIdx === 2 && Math.random() < 0.48) {
    kind = 'vertical';
    x0 = -2.0;
    label = 'g\'_d(-2)=+∞';
  }
  const b = getWorldBounds();
  state.anomalyOrb = {
    x0,
    y: b.yMax - 0.25,
    targetY: wave.f(clamp(x0, b.xMin + 0.2, b.xMax - 0.2)),
    kind,
    label,
    speed: 0.42 + state.waveIdx * 0.06
  };
}

// --- Trial 2 Spawners ---
function spawnAuxMeteor() {
  const wave = TRIALS[1].waves[0];
  const isRoot = Math.random() < 0.34;
  const x = isRoot
    ? wave.roots[Math.floor(Math.random() * wave.roots.length)]
    : clamp(-3.2 + Math.random() * 7.6, -3.5, 4.5);
  const gx = wave.f(x);
  const kind = Math.abs(gx) < 0.45 ? 'root' : (gx > 0 ? 'inc' : 'dec');
  state.meteors.push({
    x,
    y: 5.5 + Math.random() * 1.4,
    vy: -(0.72 + Math.random() * 0.38),
    kind,
    gx
  });
}

function spawnOptSpark() {
  state.optSparks.push({
    x: -2.2 + Math.random() * 4.4,
    y: 4.8,
    vy: -(1.25 + Math.random() * 0.55)
  });
}

// --- Trial 3 Spawners ---
function spawnConcavityCrystal() {
  const wave = TRIALS[2].waves[state.waveIdx];
  const [xMin, xMax] = wave.xRange;
  let x = xMin + 0.5 + Math.random() * (xMax - xMin - 1.0);
  // Keep crystals slightly away from inflection x so player distinguishes zone vs gate
  for (const inf of wave.inflections) {
    if (Math.abs(x - inf.x) < 0.45) x += x >= inf.x ? 0.65 : -0.65;
  }
  x = clamp(x, xMin + 0.4, xMax - 0.4);
  const d2 = wave.d2f(x);
  state.crystals.push({
    x,
    y: wave.f(x),
    kind: d2 >= 0 ? 'convex' : 'concave',
    pulse: Math.random() * 6.28
  });
}

// --- Trial 4 Spawners ---
function spawnRelOrb() {
  const wave = TRIALS[3].waves[state.waveIdx];
  const x = 7.8 + Math.random() * 1.6;
  const base = wave.asym ? wave.asym(x) : wave.f(x);
  const offset = wave.asym ? wave.relSign * 0.95 : 0;
  state.relOrbs.push({
    x,
    y: clamp(base + offset, -2.0, 6.4),
    trueSide: wave.relSign
  });
}

// --- Trial 5 Spawners ---
function spawnTwinTarget() {
  const wave = TRIALS[4].waves[state.waveIdx];
  const pool = wave.targetX || [1.6, 2.3];
  const tx = pool[Math.floor(Math.random() * pool.length)] + (Math.random() - 0.5) * 0.4;
  const ty = wave.f(tx);
  const m = wave.mirror(tx, ty);
  state.twinNode = { x: tx, y: ty, mx: m.x, my: m.y, pulse: 0 };
}

function spawnTwinHazard() {
  const b = getWorldBounds();
  state.twinHazards.push({
    x: b.xMin - 0.2,
    y: b.yMin + 0.8 + Math.random() * (b.yMax - b.yMin - 1.6),
    vx: 1.55 + Math.random() * 0.65,
    r: 0.26
  });
}

// ---------- Player Actions Handler (DualSense / Keyboard / Touch) ----------
function triggerAction(actionId) {
  if (state.ended || state.paused) return;
  flashDeckButton(actionId);
  const trial = TRIALS[state.trialIdx];
  const wave = trial.waves[state.waveIdx] || trial.waves[0];

  // ===== TRIAL 1: Tangent Ricochet =====
  if (trial.id === 'tangent-ricochet') {
    const pScr = worldToScreen(state.px, state.py);
    if (actionId === 'fire') {
      audio.playLaser();
      const m = wave.df(state.px);
      state.laserBeam = { x0: state.px, y0: state.py, m, life: 0.28 };
      if (state.prismTarget) {
        const pt = state.prismTarget;
        const dist = Math.abs(m * (pt.x - state.px) + state.py - pt.y) / Math.hypot(1, m);
        const tScr = worldToScreen(pt.x, pt.y);
        if (dist < 0.44) {
          recordHit(
            wave.skillId,
            140,
            `إصابة مماسّية دقيقة! الميل $f'(${state.px.toFixed(1)})=${m.toFixed(2)}$`,
            tScr.x,
            tScr.y,
            '#fde047'
          );
          if (!state.ended) spawnTangentPrism();
        } else {
          showToast('حرّك الموشور حتى يلمس شعاع المماس $(T)$ البلورة الذهبية ثم أطلق!', 'info');
        }
      }
      return;
    }

    // Anomaly classification beams: smooth / angular / vertical / inverse
    if (state.anomalyOrb) {
      const aScr = worldToScreen(state.anomalyOrb.x0, state.anomalyOrb.y);
      if (actionId === state.anomalyOrb.kind) {
        const msg = actionId === 'vertical'
          ? 'صحيح! $g\'_d(-2)=+\\infty \\implies$ نصف مماس عمودي!'
          : (wave.anomaly.toastGood || 'تحليل اشتقاقي دقيق!');
        recordHit(wave.skillId, 160, msg, aScr.x, aScr.y, '#34d399');
        if (!state.ended) spawnAnomalyOrb();
      } else {
        recordMistake(wave.skillId, 'نوع المماس غير مطابق للشذوذ المرسوم!', pScr.x, pScr.y);
      }
    }
    return;
  }

  // ===== TRIAL 2: Auxiliary & Extrema =====
  if (trial.id === 'aux-extrema') {
    const pScr = worldToScreen(state.px, state.py);
    if (actionId === 'ineq') {
      // Bonus pulse verifying standard inequality x + 1/x >= 2 (Skill 34)
      audio.playLock(state.combo);
      spawnBurst(pScr.x, pScr.y, '#f59e0b', 14);
      showToast('متفاوتة الاستمثال: $h(x)=x+\\frac{1}{x}-2 \\ge 0$ لكل $x>0$ (دنوية عند $x=1$)!', 'good');
      return;
    }

    if (wave.mode === 'aux') {
      // Find closest meteor
      let best = null;
      let bestD = 99;
      for (const m of state.meteors) {
        const d = Math.hypot(m.x - state.px, m.y - state.py);
        if (d < bestD) { bestD = d; best = m; }
      }
      if (!best || bestD > 2.2) {
        showToast('اقترب من النيزك الساقط ثم طابق إشارة $g(x)$ بـ [▢/△/✕]!', 'info');
        return;
      }
      const mScr = worldToScreen(best.x, best.y);
      const want = best.kind === 'root' ? 'lock' : best.kind;
      if (actionId === want) {
        const label = best.kind === 'root'
          ? `مطراف دقيق! $g(${best.x.toFixed(0)})=0$ وتغيّر إشارة $f'$`
          : (best.kind === 'inc' ? 'صحيح! $g(x)>0 \\implies f$ تزايدية $\\nearrow$' : 'صحيح! $g(x)<0 \\implies f$ تناقصية $\\searrow$');
        state.meteors = state.meteors.filter((it) => it !== best);
        recordHit(32, 130, label, mScr.x, mScr.y, '#34d399');
        if (!state.ended) spawnAuxMeteor();
      } else {
        recordMistake(32, 'تحقّق من موقع النيزك: فوق $(Ox)$ يعني $g>0$ وتحته يعني $g<0$!', mScr.x, mScr.y);
      }
      return;
    }

    if (wave.mode === 'graphical') {
      const target = wave.intersections[0];
      const d = Math.hypot(state.px - target.x, state.py - target.y);
      if (actionId === 'lock' && d < 0.9) {
        const tScr = worldToScreen(target.x, target.y);
        recordHit(33, 175, 'تقاطع دقيق! $\\sqrt{x+2}=x \\iff x=2$ (مع رفض $-1$ لأن $x\\ge 0$)', tScr.x, tScr.y, '#fde047');
      } else {
        showToast('حَلّق نحو نقطة تقاطع المنحنيين $x=2, y=2$ واضغط [✕]!', 'info');
      }
      return;
    }

    if (wave.mode === 'optimize') {
      if (actionId === 'lock') {
        const xAbs = Math.abs(state.px);
        const err = Math.abs(xAbs - wave.optX);
        if (err < 0.24) {
          recordHit(
            34,
            210,
            'مساحة قصوى مثالية! $A\'(x)=8-6x^2=0 \\implies x=\\frac{2}{\\sqrt{3}}$',
            pScr.x,
            pScr.y,
            '#fde047'
          );
          state.px = Math.random() < 0.5 ? 0.35 : 1.8;
        } else {
          recordMistake(34, `المساحة ليست قصوى بعد! راقب $A'(x)=0$ عند $x\\approx 1.15$.`, pScr.x, pScr.y);
        }
      }
    }
    return;
  }

  // ===== TRIAL 3: Concavity Lens =====
  if (trial.id === 'concavity-lens') {
    const pScr = worldToScreen(state.px, state.py);
    if (actionId === 'convex' || actionId === 'concave') {
      state.shieldMode = actionId;
      setActiveDeckMode(actionId);
      audio.playSwitch();
      // Check if sitting on a matching crystal
      const near = state.crystals.find((c) => Math.abs(c.x - state.px) < 0.55);
      if (near) {
        const cScr = worldToScreen(near.x, near.y);
        if (near.kind === actionId) {
          state.crystals = state.crystals.filter((c) => c !== near);
          recordHit(
            35,
            135,
            actionId === 'convex' ? 'تحدّب $\\cup$ صحيح: $f\'\'(x)>0$ والمنحنى فوق مماسه!' : 'تقعّر $\\cap$ صحيح: $f\'\'(x)<0$ والمنحنى تحت مماسه!',
            cScr.x,
            cScr.y,
            actionId === 'convex' ? '#34d399' : '#fb7185'
          );
          if (!state.ended) spawnConcavityCrystal();
        } else {
          recordMistake(35, 'درع الانحناء معاكس لإشارة $f\'\'(x)$ في هذه المنطقة!', cScr.x, cScr.y);
        }
      }
      return;
    }

    if (actionId === 'inflect' || actionId === 'trap') {
      state.gateFlash = 0.32;
      const inf = wave.inflections.find((g) => Math.abs(g.x - state.px) < 0.55);
      if (!inf) {
        showToast('اقترب من البوابة المضيئة حيث $f\'\'(x)=0$ ثم فعّل النبضة!', 'info');
        return;
      }
      const gScr = worldToScreen(inf.x, wave.f(inf.x));
      if ((actionId === 'inflect' && inf.real) || (actionId === 'trap' && !inf.real)) {
        recordHit(
          35,
          185,
          inf.real
            ? 'عبور انعطاف مثالي! $f\'\'$ تنعدم وتغيّر إشارتها فيخترق $(C_f)$ مماسه.'
            : 'كشفت فخ البكالوريا! $f\'\'(0)=3x^2=0$ بلا تغيير إشارة $\\implies$ لا انعطاف!',
          gScr.x,
          gScr.y,
          '#fde047'
        );
      } else {
        recordMistake(
          35,
          inf.real ? 'هذه نقطة انعطاف حقيقية — اضغط [✕]!' : 'فخ! إشارة $f\'\'$ لا تتغير في $0$ — اضغط [◯]!',
          gScr.x,
          gScr.y
        );
      }
    }
    return;
  }

  // ===== TRIAL 4: Asymptote Tree =====
  if (trial.id === 'asymptote-tree') {
    const pScr = worldToScreen(state.px, state.py);
    if (actionId === 'rel') {
      if (wave.asym) {
        const dy = state.py - wave.asym(state.px);
        const onRightSide = (wave.relSign > 0 && dy > 0.05) || (wave.relSign < 0 && dy < -0.05);
        if (onRightSide) {
          recordHit(
            37,
            150,
            wave.relSign > 0 ? 'وضع نسبي صحيح: $(C_f)$ فوق المقارب $(\\Delta)$!' : 'وضع نسبي صحيح: $(C_f)$ تحت المقارب $(\\Delta)$!',
            pScr.x,
            pScr.y,
            '#fde047'
          );
          if (!state.ended) spawnRelOrb();
        } else {
          recordMistake(37, 'أنت في الجهة المعاكسة من $(\\Delta)$! راقب إشارة $f(x)-y_\\Delta$.', pScr.x, pScr.y);
        }
      } else {
        showToast('أقفل نوع الفرع اللانهائي أولاً بـ [▢ / △ / ◯ / L2]!', 'info');
      }
      return;
    }

    // Branch classification weapons
    if (actionId === wave.branchType) {
      state.branchLocked = true;
      state.branchGateX = 8.6;
      const gScr = worldToScreen(4.6, wave.f(4.6));
      recordHit(wave.skillId, 170, `فرع لانهائي دقيق: ${wave.title}!`, gScr.x, gScr.y, '#34d399');
    } else {
      recordMistake(36, 'راجع شجرة الفروع اللانهائية: $\\lim\\frac{f(x)}{x}$ ثم $\\lim[f(x)-ax]$!', pScr.x, pScr.y);
    }
    return;
  }

  // ===== TRIAL 5: Symmetry Twin =====
  if (trial.id === 'symmetry-twin') {
    if (['even', 'odd', 'axis', 'center', 'periodic'].includes(actionId)) {
      state.symMode = actionId;
      setActiveDeckMode(actionId);
      audio.playSwitch();
      if (actionId === wave.symMode) {
        showToast('قانون التماثل متطابق! الآن وجّه المركبة نحو البلورة الذهبية واضرب [✕].', 'good');
      }
      return;
    }

    if (actionId === 'sync' && state.twinNode) {
      const pScr = worldToScreen(state.px, state.py);
      if (state.symMode !== wave.symMode) {
        recordMistake(38, 'اختر أولاً قانون التماثل المطابق للدالة بـ [▢ / △ / ◯ / L2 / R2]!', pScr.x, pScr.y);
        return;
      }
      const twinPos = computeTwinPos(state.px, state.py, state.symMode);
      const d1 = Math.hypot(state.px - state.twinNode.x, state.py - state.twinNode.y);
      const d2 = Math.hypot(twinPos.x - state.twinNode.mx, twinPos.y - state.twinNode.my);
      const dSwap1 = Math.hypot(state.px - state.twinNode.mx, state.py - state.twinNode.my);
      const dSwap2 = Math.hypot(twinPos.x - state.twinNode.x, twinPos.y - state.twinNode.y);

      if ((d1 < 0.72 && d2 < 0.72) || (dSwap1 < 0.72 && dSwap2 < 0.72)) {
        const nScr1 = worldToScreen(state.twinNode.x, state.twinNode.y);
        const nScr2 = worldToScreen(state.twinNode.mx, state.twinNode.my);
        spawnBurst(nScr2.x, nScr2.y, '#fb7185', 16);
        state.tracedSegments.push(state.waveIdx);
        recordHit(
          wave.skillId,
          175,
          `رنين متماثل مثالي! ${wave.title}`,
          nScr1.x,
          nScr1.y,
          '#fde047'
        );
        if (!state.ended) spawnTwinTarget();
      } else {
        showToast('طابق مركبتك الذهبية مع البلورة ليلتقط توأمك صورتها المتماثلة!', 'info');
      }
    }
  }
}

function computeTwinPos(x, y, mode) {
  if (mode === 'even') return { x: -x, y };
  if (mode === 'odd') return { x: -x, y: -y };
  if (mode === 'axis') return { x: 2 - x, y };
  if (mode === 'center') return { x: 2 - x, y: 2 - y };
  return { x: x + 4 > 4.2 ? x - 4 : x + 4, y };
}

// ---------- Gamepad & Input Polling ----------
function pollController(dt) {
  const gp = ArcadeCore.Gamepad.resolveActiveGamepad(gpState);
  ArcadeCore.Gamepad.updateBanner(gpState, dom.gpBadge, dom.gpBadge, '🎮 لوحة المفاتيح / الماوس');

  if (pauseMenu && pauseMenu.pollGamepad(gp, gpState)) {
    return { ix: 0, iy: 0 };
  }

  if (!gp) {
    return { ix: 0, iy: 0 };
  }

  // End-overlay gamepad navigation
  if (state.ended) {
    const btns = [dom.btnEndReplay, dom.btnEndNext, dom.btnEndHub].filter((b) => !b.classList.contains('hidden'));
    const nav = ArcadeCore.Gamepad.sampleDirectionalNav(gp, gpState);
    if (nav.dUp || nav.dLeft) {
      endFocusIdx = (endFocusIdx - 1 + btns.length) % btns.length;
      syncEndFocus();
    } else if (nav.dDown || nav.dRight) {
      endFocusIdx = (endFocusIdx + 1) % btns.length;
      syncEndFocus();
    }
    if (ArcadeCore.Gamepad.justPressed(gp, gpState, 0)) {
      btns[endFocusIdx]?.click();
    } else if (ArcadeCore.Gamepad.justPressed(gp, gpState, 3) && !dom.btnEndNext.classList.contains('hidden')) {
      dom.btnEndNext.click();
    } else if (ArcadeCore.Gamepad.justPressed(gp, gpState, 1)) {
      window.location.href = '../../index.html?from=game';
    }
    ArcadeCore.Gamepad.snapshotButtons(gp, gpState);
    return { ix: 0, iy: 0 };
  }

  // L1 / R1 switch trials smoothly
  if (ArcadeCore.Gamepad.justPressed(gp, gpState, 4)) {
    audio.playSwitch();
    loadTrial(state.trialIdx - 1);
  }
  if (ArcadeCore.Gamepad.justPressed(gp, gpState, 5)) {
    audio.playSwitch();
    loadTrial(state.trialIdx + 1);
  }

  const trial = TRIALS[state.trialIdx];
  const mapById = (slot) => trial.actions[slot]?.id;

  // Cross (0) = Primary action (slot 0)
  if (ArcadeCore.Gamepad.justPressed(gp, gpState, 0) && mapById(0)) triggerAction(mapById(0));
  // Square (2) = slot 1
  if (ArcadeCore.Gamepad.justPressed(gp, gpState, 2) && mapById(1)) triggerAction(mapById(1));
  // Triangle (3) = slot 2
  if (ArcadeCore.Gamepad.justPressed(gp, gpState, 3) && mapById(2)) triggerAction(mapById(2));
  // Circle (1) = slot 3
  if (ArcadeCore.Gamepad.justPressed(gp, gpState, 1) && mapById(3)) triggerAction(mapById(3));
  // L2 (6) = slot 4
  if (ArcadeCore.Gamepad.justPressed(gp, gpState, 6) && mapById(4)) triggerAction(mapById(4));
  // R2 (7) = slot 5
  if (ArcadeCore.Gamepad.justPressed(gp, gpState, 7) && mapById(5)) triggerAction(mapById(5));

  const analog = ArcadeCore.Gamepad.sampleAnalogAxes(gp, 0.16);
  const hat = ArcadeCore.Gamepad.decodeDpadHat(gp);
  let ix = analog.lx;
  let iy = -analog.ly;
  if (Math.abs(ix) < 0.1) {
    if (hat.left || gp.buttons[14]?.pressed) ix = -0.9;
    if (hat.right || gp.buttons[15]?.pressed) ix = 0.9;
  }
  if (Math.abs(iy) < 0.1) {
    if (hat.up || gp.buttons[12]?.pressed) iy = 0.9;
    if (hat.down || gp.buttons[13]?.pressed) iy = -0.9;
  }

  ArcadeCore.Gamepad.snapshotButtons(gp, gpState);
  return { ix, iy };
}

function pollKeyboardAxes() {
  let kx = 0;
  let ky = 0;
  if (keys.has('ArrowLeft') || keys.has('KeyA')) kx -= 1;
  if (keys.has('ArrowRight') || keys.has('KeyD')) kx += 1;
  if (keys.has('ArrowUp') || keys.has('KeyW')) ky += 1;
  if (keys.has('ArrowDown') || keys.has('KeyS')) ky -= 1;
  return { kx, ky };
}

// ---------- Main Simulation Update ----------
function update(dt) {
  const gpAxes = pollController(dt);
  if (state.paused || state.ended) return;

  state.time += dt;
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 24);
  if (state.hitCooldown > 0) state.hitCooldown = Math.max(0, state.hitCooldown - dt);
  if (state.gateFlash > 0) state.gateFlash = Math.max(0, state.gateFlash - dt);
  if (state.laserBeam) {
    state.laserBeam.life -= dt;
    if (state.laserBeam.life <= 0) state.laserBeam = null;
  }
  if (state.toastTimer > 0) {
    state.toastTimer -= dt;
    if (state.toastTimer <= 0 && dom.toast) dom.toast.classList.add('hidden');
  }

  // Combine Keyboard + Analog Stick + Pointer steering
  const kb = pollKeyboardAxes();
  const moveX = clamp(kb.kx + gpAxes.ix, -1, 1);
  const moveY = clamp(kb.ky + gpAxes.iy, -1, 1);
  if (Math.abs(moveX) > 0.08 || Math.abs(moveY) > 0.08) {
    state.pointerActive = false;
  }

  const trial = TRIALS[state.trialIdx];
  const wave = trial.waves[state.waveIdx] || trial.waves[0];
  const b = getWorldBounds();

  // ===== TRIAL 1 UPDATE =====
  if (trial.id === 'tangent-ricochet') {
    const speed = 4.2;
    if (state.pointerActive) {
      state.px += (clamp(state.pointerWorldX, b.xMin + 0.3, b.xMax - 0.3) - state.px) * Math.min(1, dt * 11);
    } else {
      state.px = clamp(state.px + moveX * speed * dt, b.xMin + 0.3, b.xMax - 0.3);
    }
    state.py = wave.f(state.px);

    if (state.prismTarget) {
      state.prismTarget.phase += dt * 1.9;
      state.prismTarget.ttl -= dt;
      if (state.prismTarget.ttl <= 0) spawnTangentPrism();
    }
    if (state.anomalyOrb) {
      state.anomalyOrb.y -= state.anomalyOrb.speed * dt;
      if (state.anomalyOrb.y <= state.anomalyOrb.targetY + 0.12) {
        const aScr = worldToScreen(state.anomalyOrb.x0, state.anomalyOrb.y);
        recordMistake(wave.skillId, 'سقط الشذوذ الاشتقاقي على المنحنى قبل تفكيكه بـ [▢/△/◯/L2]!', aScr.x, aScr.y);
        if (!state.ended) spawnAnomalyOrb();
      }
    }
    updateDerivativeScope(state.px, wave.df(state.px), wave.d2f(state.px));
  }

  // ===== TRIAL 2 UPDATE =====
  if (trial.id === 'aux-extrema') {
    const sp = 5.2;
    if (state.pointerActive) {
      state.px += (clamp(state.pointerWorldX, b.xMin + 0.3, b.xMax - 0.3) - state.px) * Math.min(1, dt * 10);
      state.py += (clamp(state.pointerWorldY, b.yMin + 0.3, b.yMax - 0.3) - state.py) * Math.min(1, dt * 10);
    } else {
      state.px = clamp(state.px + moveX * sp * dt, b.xMin + 0.3, b.xMax - 0.3);
      state.py = clamp(state.py + moveY * sp * dt, b.yMin + 0.3, b.yMax - 0.3);
    }

    if (wave.mode === 'aux') {
      for (const m of state.meteors) {
        m.y += m.vy * dt;
      }
      const missed = state.meteors.find((m) => m.y < b.yMin + 0.15);
      if (missed) {
        const ms = worldToScreen(missed.x, b.yMin + 0.3);
        state.meteors = state.meteors.filter((it) => it !== missed);
        recordMistake(32, 'افلت نيزك الدالة المساعدة! اقترب منه واضغط [▢/△/✕].', ms.x, ms.y);
        if (!state.ended) spawnAuxMeteor();
      }
      if (state.meteors.length < 2) spawnAuxMeteor();
      updateDerivativeScope(state.px, wave.f(state.px), wave.df(state.px));
    } else if (wave.mode === 'graphical') {
      state.stormTimer += dt;
      if (state.stormTimer > 4.2) {
        state.stormTimer = 0;
        const fx = wave.f(state.px);
        const gx = wave.g(state.px);
        const safe = Number.isFinite(fx) && fx <= gx + 0.25 && state.px >= 1.5;
        if (!safe) {
          const ps = worldToScreen(state.px, state.py);
          recordMistake(33, 'ضربتك العاصفة! احتمِ في مجال $f(x)\\le g(x)$ ($x\\ge 2$).', ps.x, ps.y);
        }
      }
      updateDerivativeScope(state.px, wave.df(state.px), wave.d2f(state.px));
    } else if (wave.mode === 'optimize') {
      state.px = clamp(state.px, -1.96, 1.96);
      state.py = wave.f(state.px);
      for (const s of state.optSparks) s.y += s.vy * dt;
      for (const s of state.optSparks) {
        if (Math.hypot(s.x - state.px, s.y - state.py) < 0.36) {
          const ps = worldToScreen(state.px, state.py);
          s.y = -99;
          recordMistake(34, 'أصابتك شرارة الحمل الزائد! تفادَها أثناء ضبط المساحة القصوى.', ps.x, ps.y);
        }
      }
      state.optSparks = state.optSparks.filter((s) => s.y > b.yMin);
      if (state.optSparks.length < 2 && Math.random() < dt * 1.4) spawnOptSpark();
      const xAbs = Math.abs(state.px);
      updateDerivativeScope(xAbs, 8 - 6 * xAbs * xAbs, -12 * xAbs);
    }
  }

  // ===== TRIAL 3 UPDATE =====
  if (trial.id === 'concavity-lens') {
    const sp = 3.8;
    if (state.pointerActive) {
      state.px += (clamp(state.pointerWorldX, b.xMin + 0.25, b.xMax - 0.25) - state.px) * Math.min(1, dt * 10);
    } else {
      state.px = clamp(state.px + moveX * sp * dt, b.xMin + 0.25, b.xMax - 0.25);
    }
    state.py = wave.f(state.px);

    for (const c of state.crystals) {
      c.pulse += dt * 3.2;
      // Auto-collect crystal if glider touches it with the matching active concavity shield!
      if (Math.abs(c.x - state.px) < 0.34) {
        const cScr = worldToScreen(c.x, c.y);
        if (state.shieldMode === c.kind) {
          state.crystals = state.crystals.filter((it) => it !== c);
          recordHit(
            35,
            125,
            c.kind === 'convex' ? 'جمع محدّب $\\cup$ ($f\'\'>0$) متناغم!' : 'جمع مقعّر $\\cap$ ($f\'\'<0$) متناغم!',
            cScr.x,
            cScr.y,
            c.kind === 'convex' ? '#34d399' : '#fb7185'
          );
          if (!state.ended) spawnConcavityCrystal();
          break;
        }
      }
    }
    if (state.crystals.length < 2) spawnConcavityCrystal();
    updateDerivativeScope(state.px, wave.df(state.px), wave.d2f(state.px));
  }

  // ===== TRIAL 4 UPDATE =====
  if (trial.id === 'asymptote-tree') {
    state.branchScroll += dt * 2.4;
    const sp = 5.4;
    if (state.pointerActive) {
      state.py += (clamp(state.pointerWorldY, b.yMin + 0.3, b.yMax - 0.3) - state.py) * Math.min(1, dt * 10);
    } else {
      state.py = clamp(state.py + moveY * sp * dt, b.yMin + 0.3, b.yMax - 0.3);
    }
    state.px = 2.0;

    state.branchGateX -= dt * 0.92;
    if (state.branchGateX <= 1.2) {
      const ps = worldToScreen(state.px, state.py);
      if (!state.branchLocked) {
        recordMistake(36, 'اخترقت بوابة الفرع اللانهائي دون تحديده بـ [▢/△/◯/L2]!', ps.x, ps.y);
      }
      state.branchGateX = 8.6;
      state.branchLocked = false;
    }

    for (const o of state.relOrbs) {
      o.x -= dt * 2.1;
      if (Math.hypot(o.x - state.px, o.y - state.py) < 0.55) {
        const os = worldToScreen(o.x, o.y);
        o.x = -99;
        recordHit(37, 130, 'التقاط نقطة وضع نسبي دقيقة على جهة $(C_f)$!', os.x, os.y, '#fde047');
        if (!state.ended) spawnRelOrb();
      }
    }
    state.relOrbs = state.relOrbs.filter((o) => o.x > -0.5);
    if (state.relOrbs.length < 1 && wave.asym) spawnRelOrb();

    updateDerivativeScope(state.px + state.branchScroll * 0.4, wave.df(state.px + 2), wave.d2f(state.px + 2));
  }

  // ===== TRIAL 5 UPDATE =====
  if (trial.id === 'symmetry-twin') {
    const sp = 5.0;
    if (state.pointerActive) {
      state.px += (clamp(state.pointerWorldX, b.xMin + 0.3, b.xMax - 0.3) - state.px) * Math.min(1, dt * 10);
      state.py += (clamp(state.pointerWorldY, b.yMin + 0.3, b.yMax - 0.3) - state.py) * Math.min(1, dt * 10);
    } else {
      state.px = clamp(state.px + moveX * sp * dt, b.xMin + 0.3, b.xMax - 0.3);
      state.py = clamp(state.py + moveY * sp * dt, b.yMin + 0.3, b.yMax - 0.3);
    }

    if (state.twinNode) state.twinNode.pulse += dt * 3.5;

    for (const h of state.twinHazards) {
      h.x += h.vx * dt;
      if (Math.hypot(h.x - state.px, h.y - state.py) < h.r + 0.25) {
        const ps = worldToScreen(state.px, state.py);
        h.x = 99;
        recordMistake(38, 'اصطدمت بموجة تشويش! تفادَ الكرات الحمراء أثناء مطابقة التوأم.', ps.x, ps.y);
      }
    }
    state.twinHazards = state.twinHazards.filter((h) => h.x < b.xMax + 0.6);
    if (state.twinHazards.length < 2 && Math.random() < dt * 1.15) spawnTwinHazard();

    const dfVal = wave.df(state.px);
    const d2Val = wave.d2f(state.px);
    updateDerivativeScope(state.px, Number.isFinite(dfVal) ? dfVal : 0, Number.isFinite(d2Val) ? d2Val : 0);
  }

  // Update ambient particles & floaters
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);

  for (const f of state.floaters) {
    f.y -= 36 * dt;
    f.life -= dt;
  }
  state.floaters = state.floaters.filter((f) => f.life > 0);

  for (const d of state.dust) {
    d.x += d.vx * dt;
    d.y += d.vy * dt;
    if (d.x < 0) d.x += state.width;
    if (d.x > state.width) d.x -= state.width;
    if (d.y < 0) d.y += state.height;
    if (d.y > state.height) d.y -= state.height;
  }
}

// ---------- Canvas 2D Rendering (Zero shadowBlur, High Contrast Solar Atelier) ----------
function drawOpticalBackdrop() {
  const w = state.width;
  const h = state.height;
  const b = getWorldBounds();

  // Warm obsidian optical surface
  ctx.fillStyle = '#0e0a15';
  ctx.fillRect(0, 0, w, h);

  // Subtle concentric brass optical reticle rings in background
  const orig = worldToScreen(0, 0);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.065)';
  ctx.lineWidth = 1;
  for (let r = 80; r <= Math.max(w, h) * 0.72; r += 90) {
    ctx.beginPath();
    ctx.arc(orig.x, orig.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Mathematical integer grid lines
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = Math.ceil(b.xMin); gx <= Math.floor(b.xMax); gx += 1) {
    const p = worldToScreen(gx, 0);
    ctx.moveTo(p.x, 18);
    ctx.lineTo(p.x, h - 18);
  }
  for (let gy = Math.ceil(b.yMin); gy <= Math.floor(b.yMax); gy += 1) {
    const p = worldToScreen(0, gy);
    ctx.moveTo(22, p.y);
    ctx.lineTo(w - 22, p.y);
  }
  ctx.stroke();

  // Axes
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.34)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (orig.y >= 18 && orig.y <= h - 18) {
    ctx.moveTo(20, orig.y);
    ctx.lineTo(w - 20, orig.y);
  }
  if (orig.x >= 20 && orig.x <= w - 20) {
    ctx.moveTo(orig.x, h - 16);
    ctx.lineTo(orig.x, 16);
  }
  ctx.stroke();

  // Axis ticks & crisp KaTeX labels
  ArcadeCore.CanvasAxisKit.drawMathRich(ctx, 'x', w - 24, clamp(orig.y - 12, 24, h - 24), { fontSize: 13, color: '#fcd34d' });
  ArcadeCore.CanvasAxisKit.drawMathRich(ctx, 'y', clamp(orig.x + 14, 28, w - 28), 22, { fontSize: 13, color: '#fcd34d' });
  if (orig.x > 30 && orig.x < w - 30 && orig.y > 30 && orig.y < h - 30) {
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, 'O', orig.x - 13, orig.y + 14, { fontSize: 12, color: '#b8adc7' });
  }

  // Ambient floating optical dust motes
  ctx.fillStyle = 'rgba(253, 224, 71, 0.22)';
  for (const d of state.dust) {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCurve(fn, color, outerColor, lineWidth = 2.8, xStep = 0.04) {
  const b = getWorldBounds();
  const drawPass = (stroke, lw) => {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.beginPath();
    let started = false;
    let prevY = null;
    for (let x = b.xMin; x <= b.xMax; x += xStep) {
      const y = fn(x);
      if (!Number.isFinite(y) || Math.abs(y) > 40 || (prevY !== null && Math.abs(y - prevY) > 4.5)) {
        started = false;
        prevY = null;
        continue;
      }
      const p = worldToScreen(x, y);
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
      prevY = y;
    }
    ctx.stroke();
  };
  if (outerColor) drawPass(outerColor, lineWidth + 5);
  drawPass(color, lineWidth);
}

function drawPrismAvatar(sx, sy, angleRad, color = '#fde047') {
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(angleRad);
  ctx.fillStyle = 'rgba(253, 224, 71, 0.2)';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.lineTo(-9, -10);
  ctx.lineTo(-5, 0);
  ctx.lineTo(-9, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function renderTrial1(wave) {
  const b = getWorldBounds();

  // Inverse curve mirror & ghost for Wave 4 (Skill 30)
  if (wave.showInverseGhost) {
    const p1 = worldToScreen(b.xMin, b.xMin);
    const p2 = worldToScreen(b.xMax, b.xMax);
    ArcadeCore.CanvasAxisKit.drawDashedLine(ctx, p1.x, p1.y, p2.x, p2.y, 'rgba(192,132,252,0.55)', [6, 5], 1.6);
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, 'y = x', p2.x - 42, p2.y + 18, { fontSize: 12, color: '#c084fc' });
    // Draw inverse curve (f(t), t)
    ctx.strokeStyle = 'rgba(251, 113, 133, 0.72)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    let started = false;
    for (let t = -2.4; t <= 2.4; t += 0.05) {
      const p = worldToScreen(wave.f(t), t);
      if (!started) { ctx.moveTo(p.x, p.y); started = true; } else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, 'C_{f^{-1}}', worldToScreen(2.5, 1.3).x, worldToScreen(2.5, 1.3).y + 18, { fontSize: 13, color: '#fb7185' });
  }

  // Primary curve C_f
  drawCurve(wave.f, '#fef08a', 'rgba(245, 158, 11, 0.24)', 3.0);
  ArcadeCore.CanvasAxisKit.drawMathRich(ctx, 'C_f', worldToScreen(b.xMax - 0.65, clamp(wave.f(b.xMax - 0.65), b.yMin + 0.6, b.yMax - 0.6)).x, worldToScreen(0, clamp(wave.f(b.xMax - 0.65), b.yMin + 0.6, b.yMax - 0.6)).y - 18, { fontSize: 14, color: '#fde047' });

  // Live Tangent Line (T) sweeping from player position!
  const m = wave.df(state.px);
  const pt = state.prismTarget;
  let locked = false;
  if (pt) {
    const dist = Math.abs(m * (pt.x - state.px) + state.py - pt.y) / Math.hypot(1, m);
    locked = dist < 0.44;
  }

  const tL = worldToScreen(b.xMin, state.py + m * (b.xMin - state.px));
  const tR = worldToScreen(b.xMax, state.py + m * (b.xMax - state.px));
  ctx.save();
  ctx.strokeStyle = locked ? 'rgba(253, 224, 71, 0.92)' : 'rgba(245, 158, 11, 0.48)';
  ctx.lineWidth = locked ? 3.2 : 1.8;
  ctx.setLineDash(locked ? [] : [8, 5]);
  ctx.beginPath();
  ctx.moveTo(tL.x, tL.y);
  ctx.lineTo(tR.x, tR.y);
  ctx.stroke();
  ctx.restore();

  // Fired Tangent Laser Flash
  if (state.laserBeam) {
    const lb = state.laserBeam;
    const pA = worldToScreen(b.xMin, lb.y0 + lb.m * (b.xMin - lb.x0));
    const pB = worldToScreen(b.xMax, lb.y0 + lb.m * (b.xMax - lb.x0));
    ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
    ctx.lineWidth = 7 * (lb.life / 0.28);
    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.lineTo(pB.x, pB.y);
    ctx.stroke();
  }

  // Orbiting Golden Target Prism
  if (pt) {
    const s = worldToScreen(pt.x, pt.y);
    const pulse = 1 + Math.sin(pt.phase * 2.5) * 0.14;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.strokeStyle = locked ? '#34d399' : '#f59e0b';
    ctx.lineWidth = locked ? 3 : 2;
    ctx.beginPath();
    ctx.arc(0, 0, 21 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(pt.phase * 0.8);
    ctx.fillStyle = locked ? '#fde047' : '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(0, -13);
    ctx.lineTo(13, 0);
    ctx.lineTo(0, 13);
    ctx.lineTo(-13, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    if (locked) {
      ArcadeCore.CanvasAxisKit.drawMathRich(ctx, 'LOCK [✕]', s.x, s.y - 30, { fontSize: 12, color: '#34d399' });
    }
  }

  // Descending Derivative Anomaly Orb
  if (state.anomalyOrb) {
    const a = state.anomalyOrb;
    const s = worldToScreen(a.x0, a.y);
    const col = a.kind === 'angular' ? '#fb7185' : (a.kind === 'vertical' ? '#c084fc' : (a.kind === 'inverse' ? '#f59e0b' : '#34d399'));
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(20, 14, 29, 0.9)';
    ctx.fill();
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, a.label, s.x, s.y - 26, { fontSize: 12, color: col });

    // Target landing beacon on curve
    const tSpot = worldToScreen(a.x0, a.targetY);
    ArcadeCore.CanvasAxisKit.drawDashedLine(ctx, s.x, s.y + 18, tSpot.x, tSpot.y, col, [4, 4], 1.3);
  }

  // Player Prism Carrier riding on (C_f)
  const pScr = worldToScreen(state.px, state.py);
  const pNext = worldToScreen(state.px + 0.1, state.py + m * 0.1);
  const ang = Math.atan2(pNext.y - pScr.y, pNext.x - pScr.x);
  drawPrismAvatar(pScr.x, pScr.y, ang, '#fde047');
  ArcadeCore.CanvasAxisKit.drawMathRich(ctx, `f'=${fmtNum(m, 1)}`, pScr.x, pScr.y + 28, { fontSize: 12, color: '#fef08a' });
}

function renderTrial2(wave) {
  const b = getWorldBounds();

  if (wave.mode === 'aux') {
    // Shade f'>0 (jade) vs f'<0 (rose) bands softly
    const xL = worldToScreen(-1, 0).x;
    const xR = worldToScreen(3, 0).x;
    ctx.fillStyle = 'rgba(52, 211, 153, 0.06)';
    ctx.fillRect(20, 18, Math.max(0, xL - 20), state.height - 36);
    ctx.fillRect(xR, 18, Math.max(0, state.width - 20 - xR), state.height - 36);
    ctx.fillStyle = 'rgba(251, 113, 133, 0.06)';
    ctx.fillRect(xL, 18, Math.max(0, xR - xL), state.height - 36);

    drawCurve(wave.f, '#fde047', 'rgba(245, 158, 11, 0.22)', 2.8);

    // Extrema roots highlight
    for (const rx of wave.roots) {
      const rs = worldToScreen(rx, 0);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rs.x, rs.y, 11 + Math.sin(state.time * 5) * 2.5, 0, Math.PI * 2);
      ctx.stroke();
      ArcadeCore.CanvasAxisKit.drawMathRich(ctx, `x=${rx}`, rs.x, rs.y + 22, { fontSize: 12, color: '#fde047' });
    }

    // Falling polarity meteors
    for (const m of state.meteors) {
      const ms = worldToScreen(m.x, m.y);
      const col = m.kind === 'root' ? '#fde047' : (m.kind === 'inc' ? '#34d399' : '#fb7185');
      ctx.fillStyle = 'rgba(18, 13, 28, 0.92)';
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(ms.x, ms.y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ArcadeCore.CanvasAxisKit.drawMathRich(ctx, `x=${m.x.toFixed(1)}`, ms.x, ms.y - 22, { fontSize: 11, color: col });
    }
  } else if (wave.mode === 'graphical') {
    // Shelter zone f(x) <= g(x) for x >= 2
    const x2 = worldToScreen(2, 0).x;
    ctx.fillStyle = 'rgba(52, 211, 153, 0.09)';
    ctx.fillRect(x2, 18, Math.max(0, state.width - 20 - x2), state.height - 36);
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, 'f(x) \\le g(x)', x2 + 66, 40, { fontSize: 13, color: '#34d399' });

    drawCurve(wave.f, '#fde047', 'rgba(245, 158, 11, 0.22)', 3);
    drawCurve(wave.g, '#fb7185', 'rgba(251, 113, 133, 0.2)', 2.4);

    // Intersection node (2, 2)
    const is = worldToScreen(2, 2);
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(is.x, is.y, 16 + Math.sin(state.time * 6) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, 'f(2)=g(2)', is.x, is.y - 26, { fontSize: 12, color: '#fde047' });

    // Storm warning progress bar at top of canvas
    const stormRatio = clamp(state.stormTimer / 4.2, 0, 1);
    ctx.fillStyle = stormRatio > 0.78 ? 'rgba(251, 113, 133, 0.22)' : 'rgba(245, 158, 11, 0.14)';
    ctx.fillRect(24, 20, (state.width - 48) * stormRatio, 6);
  } else if (wave.mode === 'optimize') {
    drawCurve(wave.f, '#fde047', 'rgba(245, 158, 11, 0.2)', 3);
    // Inscribed rectangle [-x, x] x [0, 4-x^2]
    const xAbs = clamp(Math.abs(state.px), 0.1, 1.96);
    const yH = 4 - xAbs * xAbs;
    const tl = worldToScreen(-xAbs, yH);
    const br = worldToScreen(xAbs, 0);
    const nearOpt = Math.abs(xAbs - wave.optX) < 0.24;
    ctx.fillStyle = nearOpt ? 'rgba(52, 211, 153, 0.24)' : 'rgba(245, 158, 11, 0.18)';
    ctx.strokeStyle = nearOpt ? '#34d399' : '#f59e0b';
    ctx.lineWidth = 2.4;
    ctx.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
    ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);

    const area = 2 * xAbs * yH;
    ArcadeCore.CanvasAxisKit.drawMathRich(
      ctx,
      `A(${xAbs.toFixed(2)}) = ${area.toFixed(2)}`,
      (tl.x + br.x) * 0.5,
      (tl.y + br.y) * 0.5,
      { fontSize: 14, color: nearOpt ? '#6ee7b7' : '#fde047' }
    );

    // Falling sparks
    for (const s of state.optSparks) {
      const ss = worldToScreen(s.x, s.y);
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const ps = worldToScreen(state.px, state.py);
  drawPrismAvatar(ps.x, ps.y, -Math.PI * 0.5, '#fde047');
}

function renderTrial3(wave) {
  const b = getWorldBounds();

  // Color-coded curve segments: convex (jade) vs concave (rose)
  for (let x = b.xMin; x < b.xMax; x += 0.08) {
    const y1 = wave.f(x);
    const y2 = wave.f(x + 0.08);
    if (!Number.isFinite(y1) || !Number.isFinite(y2)) continue;
    const d2 = wave.d2f(x + 0.04);
    const p1 = worldToScreen(x, y1);
    const p2 = worldToScreen(x + 0.08, y2);
    ctx.strokeStyle = d2 >= 0 ? '#34d399' : '#fb7185';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }

  // Live tangent line at glider position showing above/below concavity geometrically!
  const m = wave.df(state.px);
  const t1 = worldToScreen(state.px - 1.5, state.py - m * 1.5);
  const t2 = worldToScreen(state.px + 1.5, state.py + m * 1.5);
  ArcadeCore.CanvasAxisKit.drawDashedLine(ctx, t1.x, t1.y, t2.x, t2.y, '#fde047', [6, 4], 2);

  // Inflection / Trap Gates
  for (const g of wave.inflections) {
    const gs = worldToScreen(g.x, wave.f(g.x));
    const col = g.real ? '#fde047' : '#c084fc';
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(gs.x, gs.y, 20 + Math.sin(state.time * 5.5) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, g.label, gs.x, gs.y - 30, { fontSize: 12, color: col });
  }

  // Curvature Crystals
  for (const c of state.crystals) {
    const cs = worldToScreen(c.x, c.y);
    const col = c.kind === 'convex' ? '#34d399' : '#fb7185';
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(cs.x, cs.y, 8 + Math.sin(c.pulse) * 2, 0, Math.PI * 2);
    ctx.fill();
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, c.kind === 'convex' ? 'f\'\'>0' : 'f\'\'<0', cs.x, cs.y + 20, { fontSize: 11, color: col });
  }

  // Glider + Active Concavity Polarity Shield Arc (∪ or ∩)
  const ps = worldToScreen(state.px, state.py);
  const shCol = state.shieldMode === 'convex' ? '#34d399' : '#fb7185';
  ctx.strokeStyle = shCol;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  if (state.shieldMode === 'convex') {
    ctx.arc(ps.x, ps.y, 24, 0.15 * Math.PI, 0.85 * Math.PI); // ∪ bowl
  } else {
    ctx.arc(ps.x, ps.y, 24, 1.15 * Math.PI, 1.85 * Math.PI); // ∩ dome
  }
  ctx.stroke();
  drawPrismAvatar(ps.x, ps.y, 0, shCol);
}

function renderTrial4(wave) {
  const b = getWorldBounds();

  // Asymptote / direction line (Δ) if present
  if (wave.asym) {
    const a1 = worldToScreen(b.xMin, wave.asym(b.xMin));
    const a2 = worldToScreen(b.xMax, wave.asym(b.xMax));
    ArcadeCore.CanvasAxisKit.drawDashedLine(ctx, a1.x, a1.y, a2.x, a2.y, '#fb7185', [8, 6], 2.2);
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, wave.asymLabel || '(\\Delta)', a2.x - 64, clamp(a2.y - 16, 26, state.height - 26), { fontSize: 13, color: '#fb7185' });
  }

  // Live Function Curve C_f stretching toward +∞
  drawCurve(wave.f, '#fde047', 'rgba(245, 158, 11, 0.25)', 3.2, 0.08);
  ArcadeCore.CanvasAxisKit.drawMathRich(ctx, 'x \\to +\\infty', state.width - 70, 32, { fontSize: 13, color: '#fde047' });

  // Approaching Branch Firewall Gate
  const gx = worldToScreen(state.branchGateX, 0).x;
  ctx.strokeStyle = state.branchLocked ? 'rgba(52, 211, 153, 0.7)' : 'rgba(251, 113, 133, 0.75)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(gx, 22);
  ctx.lineTo(gx, state.height - 22);
  ctx.stroke();
  ArcadeCore.CanvasAxisKit.drawMathRich(
    ctx,
    state.branchLocked ? 'LOCKED' : 'BRANCH?',
    gx,
    38,
    { fontSize: 12, color: state.branchLocked ? '#34d399' : '#fb7185' }
  );

  // Relative position checkpoints
  for (const o of state.relOrbs) {
    const os = worldToScreen(o.x, o.y);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(os.x, os.y, 13, 0, Math.PI * 2);
    ctx.stroke();
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, o.trueSide > 0 ? 'f>y_\\Delta' : 'f<y_\\Delta', os.x, os.y - 20, { fontSize: 11, color: '#6ee7b7' });
  }

  const ps = worldToScreen(state.px, state.py);
  drawPrismAvatar(ps.x, ps.y, 0, '#fde047');
}

function renderTrial5(wave) {
  const b = getWorldBounds();

  // Faint blueprint of (C_f), brightening once dual-locked
  const lit = state.tracedSegments.includes(state.waveIdx);
  drawCurve(
    wave.f,
    lit ? '#fde047' : 'rgba(253, 224, 71, 0.34)',
    lit ? 'rgba(245, 158, 11, 0.25)' : null,
    lit ? 3.2 : 2.0
  );

  // Draw symmetry axis or center line based on ACTIVE player mode!
  if (state.symMode === 'even' || state.symMode === 'axis') {
    const ax = state.symMode === 'even' ? 0 : 1;
    const pTop = worldToScreen(ax, b.yMax);
    const pBot = worldToScreen(ax, b.yMin);
    ArcadeCore.CanvasAxisKit.drawDashedLine(ctx, pTop.x, pTop.y, pBot.x, pBot.y, '#34d399', [7, 5], 2.2);
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, `x=${ax}`, pTop.x + 24, pTop.y + 20, { fontSize: 13, color: '#34d399' });
  } else if (state.symMode === 'odd' || state.symMode === 'center') {
    const cx = state.symMode === 'odd' ? 0 : 1;
    const cy = state.symMode === 'odd' ? 0 : 1;
    const cs = worldToScreen(cx, cy);
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(cs.x, cs.y, 12, 0, Math.PI * 2);
    ctx.stroke();
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, state.symMode === 'odd' ? 'O(0,0)' : '\\Omega(1,1)', cs.x, cs.y - 20, { fontSize: 12, color: '#c084fc' });
  } else if (state.symMode === 'periodic') {
    const s1 = worldToScreen(-2, 2.4);
    const s2 = worldToScreen(2, 2.4);
    ArcadeCore.CanvasAxisKit.drawDashedLine(ctx, s1.x, s1.y, s2.x, s2.y, '#34d399', [5, 4], 2);
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, 'T = 4', (s1.x + s2.x) * 0.5, s1.y - 14, { fontSize: 13, color: '#34d399' });
  }

  // Paired Target Nodes (Golden for M, Rose for Symmetric Twin M')
  if (state.twinNode) {
    const tn = state.twinNode;
    const s1 = worldToScreen(tn.x, tn.y);
    const s2 = worldToScreen(tn.mx, tn.my);
    const r = 14 + Math.sin(tn.pulse) * 2.5;
    ArcadeCore.CanvasAxisKit.drawDashedLine(ctx, s1.x, s1.y, s2.x, s2.y, 'rgba(255,255,255,0.2)', [4, 4], 1.2);

    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(s1.x, s1.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, 'M', s1.x, s1.y - 22, { fontSize: 12, color: '#fde047' });

    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(s2.x, s2.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, 'M\'', s2.x, s2.y - 22, { fontSize: 12, color: '#fb7185' });
  }

  // Disruption Orbs
  for (const h of state.twinHazards) {
    const hs = worldToScreen(h.x, h.y);
    ctx.fillStyle = 'rgba(251, 113, 133, 0.85)';
    ctx.beginPath();
    ctx.arc(hs.x, hs.y, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  // Primary Golden Craft M + Symmetric Rose Twin M'
  const ps = worldToScreen(state.px, state.py);
  const twin = computeTwinPos(state.px, state.py, state.symMode);
  const ts = worldToScreen(twin.x, twin.y);
  ArcadeCore.CanvasAxisKit.drawDashedLine(ctx, ps.x, ps.y, ts.x, ts.y, 'rgba(253, 224, 71, 0.35)', [4, 4], 1.4);
  drawPrismAvatar(ps.x, ps.y, -Math.PI * 0.5, '#fde047');
  drawPrismAvatar(ts.x, ts.y, -Math.PI * 0.5, '#fb7185');
}

function render() {
  ctx.save();
  if (state.shake > 0.2) {
    ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
  }

  drawOpticalBackdrop();

  const trial = TRIALS[state.trialIdx];
  const wave = trial.waves[state.waveIdx] || trial.waves[0];

  if (trial.id === 'tangent-ricochet') renderTrial1(wave);
  else if (trial.id === 'aux-extrema') renderTrial2(wave);
  else if (trial.id === 'concavity-lens') renderTrial3(wave);
  else if (trial.id === 'asymptote-tree') renderTrial4(wave);
  else if (trial.id === 'symmetry-twin') renderTrial5(wave);

  // Burst particles
  for (const p of state.particles) {
    const alpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Floating score callouts
  for (const f of state.floaters) {
    ctx.globalAlpha = clamp(f.life / f.maxLife, 0, 1);
    ArcadeCore.CanvasAxisKit.drawMathRich(ctx, f.text, f.x, f.y, { fontSize: 13, color: f.color });
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

// ---------- Canvas Resize & Bootstrap ----------
function resizeCanvas() {
  const rect = dom.canvasFrame.getBoundingClientRect();
  state.width = Math.max(300, Math.round(rect.width));
  state.height = Math.max(260, Math.round(rect.height));
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  dom.canvas.width = Math.round(state.width * state.dpr);
  dom.canvas.height = Math.round(state.height * state.dpr);
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

  if (state.dust.length === 0) {
    for (let i = 0; i < 28; i += 1) {
      state.dust.push({
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        vx: (Math.random() - 0.5) * 14,
        vy: -6 - Math.random() * 14,
        r: 1 + Math.random() * 1.8
      });
    }
  }
}

function bindEvents() {
  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyM') {
      audio.muted = !audio.muted;
      dom.btnAudio.textContent = audio.muted ? '🔇' : '🔊';
      return;
    }
    if (state.paused) return;

    if (state.ended) {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        dom.btnEndReplay.click();
      }
      return;
    }

    keys.add(e.code);
    const trial = TRIALS[state.trialIdx];
    const slot = (i) => trial.actions[i]?.id;

    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      if (slot(0)) triggerAction(slot(0));
    } else if (e.code === 'Digit1' && slot(1)) {
      triggerAction(slot(1));
    } else if (e.code === 'Digit2' && slot(2)) {
      triggerAction(slot(2));
    } else if (e.code === 'Digit3' && slot(3)) {
      triggerAction(slot(3));
    } else if ((e.code === 'KeyQ' || e.code === 'Digit4') && slot(4)) {
      triggerAction(slot(4));
    } else if ((e.code === 'KeyE' || e.code === 'Digit5') && slot(5)) {
      triggerAction(slot(5));
    } else if (e.code === 'BracketLeft') {
      loadTrial(state.trialIdx - 1);
    } else if (e.code === 'BracketRight') {
      loadTrial(state.trialIdx + 1);
    }
  });

  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });

  // Pointer steering + click/tap primary pulse
  const updatePointer = (ev) => {
    const rect = dom.canvas.getBoundingClientRect();
    const sx = ev.clientX - rect.left;
    const sy = ev.clientY - rect.top;
    const w = screenToWorld(sx, sy);
    state.pointerWorldX = w.x;
    state.pointerWorldY = w.y;
    state.pointerActive = true;
  };

  dom.canvas.addEventListener('pointermove', updatePointer);
  dom.canvas.addEventListener('pointerdown', (ev) => {
    audio.ensure();
    updatePointer(ev);
    const primary = TRIALS[state.trialIdx].actions[0]?.id;
    if (primary) triggerAction(primary);
  });

  dom.btnAudio.addEventListener('click', () => {
    audio.muted = !audio.muted;
    dom.btnAudio.textContent = audio.muted ? '🔇' : '🔊';
  });

  dom.btnPause.addEventListener('click', () => {
    if (pauseMenu) pauseMenu.toggle();
  });

  dom.btnEndReplay.addEventListener('click', () => loadTrial(state.trialIdx));
  dom.btnEndNext.addEventListener('click', () => loadTrial(state.trialIdx + 1));
}

function initPauseMenu() {
  pauseMenu = ArcadeCore.PauseMenu.attach({
    gpState,
    title: 'موشور المماس — قائمة الإيقاف',
    subtitle: 'الدرس 2: الاشتقاق ودراسة الدوال وتطبيقاتها (2BAC PC • 23–40)',
    exitUrl: '../../index.html?from=game',
    controlsHelp: [
      'عصا اليسار / WASD / الماوس: توجيه الموشور أو المركبة بسلاسة لحظية',
      '✕ (Cross / Space / نقر): إطلاق شعاع المماس / قفل المطراف / عبور الانعطاف / رنين التوأم',
      '▢ / △ / ◯ / L2 / R2: أسلحة الانكسار والمشتقات والتحدّب والفروع اللانهائية وقوانين التماثل',
      'L1 / R1: التنقل بين المراصد الخمسة • Start / Esc: القائمة'
    ],
    onPause: () => { state.paused = true; },
    onResume: () => { state.paused = false; },
    onRestart: () => {
      state.paused = false;
      loadTrial(state.trialIdx);
    }
  });
}

let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
  lastTime = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

function boot() {
  resizeCanvas();
  initPauseMenu();
  bindEvents();
  loadTrial(0);
  ArcadeCore.renderAllMath(document);
  requestAnimationFrame(loop);
}

boot();
