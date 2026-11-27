import { GAME_ID, STAGES } from './levels.js';

const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25, 783.99];

class AstrolabeAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  unlock() {
    if (this.muted || typeof window === 'undefined') return;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
      } catch (_) {
        return;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  tone(freq, dur = 0.09, type = 'triangle', vol = 0.08, delay = 0) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.015);
  }

  playHit(combo = 1) {
    const f = PENTATONIC[Math.min(PENTATONIC.length - 1, Math.max(0, combo - 1))];
    this.tone(f, 0.11, 'triangle', 0.085);
    this.tone(f * 1.5, 0.07, 'sine', 0.045, 0.03);
  }

  playDeflect() {
    this.tone(540, 0.07, 'sine', 0.075);
    this.tone(760, 0.1, 'triangle', 0.065, 0.035);
  }

  playDash() {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.11);
    g.gain.setValueAtTime(0.065, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  playLockTick() {
    this.tone(680, 0.045, 'sine', 0.04);
  }

  playClashTick(step = 0) {
    this.tone(240 + Math.min(step, 10) * 42, 0.06, 'triangle', 0.06);
  }

  playCrossover() {
    this.tone(440, 0.09, 'sawtooth', 0.065);
    this.tone(659.25, 0.12, 'triangle', 0.075, 0.05);
    this.tone(880, 0.16, 'sine', 0.08, 0.1);
  }

  playNova() {
    [392.0, 523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      this.tone(f, 0.22, 'triangle', 0.075, idx * 0.04);
    });
  }

  playDamage() {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(175, now);
    osc.frequency.exponentialRampToValueAtTime(58, now + 0.22);
    g.gain.setValueAtTime(0.09, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  playWaveClear() {
    [440, 554.37, 659.25].forEach((f, idx) => {
      this.tone(f, 0.16, 'sine', 0.075, idx * 0.055);
    });
  }

  playStageClear() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      this.tone(f, 0.24, 'sine', 0.085, idx * 0.06);
    });
  }
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function renderTex(el, txt) {
  if (!el) return;
  if (window.ArcadeCore && typeof window.ArcadeCore.renderMath === 'function') {
    window.ArcadeCore.renderMath(el, txt);
  } else {
    el.textContent = String(txt ?? '');
  }
}

function fmtNum(v, dec = 1) {
  const n = Math.abs(v) < 0.0005 ? 0 : v;
  return n.toFixed(dec);
}

class SequenceAstrolabeGame {
  constructor() {
    this.canvas = document.getElementById('weaverCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasBox = document.getElementById('canvasBox');

    this.stageNavEl = document.getElementById('stageNav');
    this.gpBadgeEl = document.getElementById('gpBadge');
    this.gpLabelEl = document.getElementById('gpLabel');
    this.hudScoreEl = document.getElementById('hudScore');
    this.hudComboEl = document.getElementById('hudCombo');
    this.hudHpEl = document.getElementById('hudHp');
    this.stageBadgeEl = document.getElementById('stageBadge');
    this.wavePipsEl = document.getElementById('wavePips');
    this.stageTitleEl = document.getElementById('stageTitle');
    this.stageFormulaEl = document.getElementById('stageFormula');
    this.stageGoalEl = document.getElementById('stageGoal');
    this.stageCounterEl = document.getElementById('stageCounter');
    this.progressFillEl = document.getElementById('stageProgressFill');
    this.toastEl = document.getElementById('toastFeed');
    this.deckButtonsEl = document.getElementById('deckButtons');
    this.termTapeEl = document.getElementById('termTape');
    this.deckHintEl = document.getElementById('deckHint');
    this.btnAudio = document.getElementById('btnAudio');
    this.btnPause = document.getElementById('btnPause');

    this.endOverlayEl = document.getElementById('endOverlay');
    this.endGlyphEl = document.getElementById('endGlyph');
    this.endTitleEl = document.getElementById('endTitle');
    this.endDescEl = document.getElementById('endDesc');
    this.endScoreEl = document.getElementById('endScore');
    this.endAccEl = document.getElementById('endAcc');
    this.endComboEl = document.getElementById('endCombo');
    this.endRankEl = document.getElementById('endRank');
    this.btnEndPrimary = document.getElementById('btnEndPrimary');
    this.btnEndNext = document.getElementById('btnEndNext');
    this.btnEndHub = document.getElementById('btnEndHub');

    this.audio = new AstrolabeAudio();
    this.gpState = window.ArcadeCore?.Gamepad?.createState ? window.ArcadeCore.Gamepad.createState() : null;

    this.stageIdx = 0;
    this.waveIdx = 0;
    this.waveHits = 0;
    this.clearedStages = new Set();
    this.score = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.hp = 5;
    this.maxHp = 5;
    this.hits = 0;
    this.attempts = 0;
    this.correctHits = 0;
    this.paused = false;
    this.ended = false;

    // Decoupled inputMode so an idle mouse NEVER hijacks Keyboard or DualSense!
    this.inputMode = 'keyboard';
    this.keys = {};
    this.pointer = { x: 400, y: 220, lastX: 400, lastY: 220, down: false };
    this.lastActionAt = {};

    // Juice & visual effects
    this.particles = [];
    this.rings = [];
    this.beams = [];
    this.cobwebs = [];
    this.trail = [];
    this.toastTimer = 0;
    this.shake = 0;
    this.hitStop = 0;
    this.hitFlash = 0;
    this.invulnTimer = 0;
    this.clock = 0;

    this.w = 900;
    this.h = 460;
    this.dpr = 1;
    this.lastTs = 0;
    this.st = {};

    this.pauseMenu = window.ArcadeCore?.PauseMenu?.attach({
      title: 'نسّاج المتتاليات — إيقاف مؤقت',
      subtitle: 'الإسطرلاب الزمردي (الدرس 3 • المهارات 41–52)',
      controlsHelp: [
        '🎮 العصا اليسرى / WASD / الماوس: الحركة والتصويب • العصا اليمنى: ضبط دقيق',
        '✕ / Space: فرز سريع / إطلاق المبارزة / اندفاع التفادي',
        '▢ / △ / ◯ (1 / 2 / 3): درع الصدّ، أشعة الرتابة، المتتالية المساعدة، وقنبلة المجموع',
        'L1 / R1 ( [ / ] ): تبديل الطور • L2 / R2: السقف M وفكّي الدركيين • Start / Esc: القائمة'
      ],
      gpState: this.gpState,
      onPause: () => { this.paused = true; },
      onResume: () => { this.paused = false; this.lastTs = performance.now(); },
      onRestart: () => { this.restartFullRun(); }
    });

    this.setupResize();
    this.bindEvents();
    this.loadStage(0);
    requestAnimationFrame((ts) => this.loop(ts));
  }

  setupResize() {
    const sync = () => {
      if (!this.canvasBox || !this.canvas) return;
      const r = this.canvasBox.getBoundingClientRect();
      const w = Math.max(300, Math.floor(r.width));
      const h = Math.max(220, Math.floor(r.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (w !== this.w || h !== this.h || dpr !== this.dpr) {
        this.w = w;
        this.h = h;
        this.dpr = dpr;
        this.canvas.width = Math.floor(w * dpr);
        this.canvas.height = Math.floor(h * dpr);
      }
    };
    sync();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(sync).observe(this.canvasBox);
    } else {
      window.addEventListener('resize', sync);
    }
  }

  getStage() {
    return STAGES[this.stageIdx];
  }

  getWave() {
    const st = this.getStage();
    return st.waves[Math.min(this.waveIdx, st.waves.length - 1)];
  }

  restartFullRun() {
    this.endOverlayEl?.classList.add('hidden');
    this.ended = false;
    this.paused = false;
    this.score = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.hp = this.maxHp;
    this.attempts = 0;
    this.correctHits = 0;
    this.clearedStages.clear();
    this.loadStage(0);
  }

  renderStageNav() {
    if (!this.stageNavEl) return;
    this.stageNavEl.innerHTML = STAGES.map((st, idx) => {
      const cls = ['astro-dial-tab'];
      if (idx === this.stageIdx) cls.push('active');
      if (this.clearedStages.has(st.id)) cls.push('cleared');
      const numGlyph = this.clearedStages.has(st.id) ? '✓' : String(st.num);
      return `<button type="button" class="${cls.join(' ')}" data-idx="${idx}"><span class="astro-dial-num">${numGlyph}</span><span class="astro-dial-label">${st.shortTab}</span></button>`;
    }).join('');
    this.stageNavEl.querySelectorAll('.astro-dial-tab').forEach((b) => {
      b.addEventListener('click', () => {
        this.audio.unlock();
        this.loadStage(Number(b.getAttribute('data-idx')));
      });
    });
  }

  renderWavePips() {
    if (!this.wavePipsEl) return;
    const stage = this.getStage();
    this.wavePipsEl.innerHTML = stage.waves.map((_, idx) => {
      const cls = idx < this.waveIdx ? 'done' : (idx === this.waveIdx ? 'active' : '');
      return `<span class="astro-pip ${cls}" title="الموجة ${idx + 1}"></span>`;
    }).join('');
  }

  renderDeck(stage) {
    if (!this.deckButtonsEl) return;
    const wave = this.getWave();
    let controls = stage.controls;

    // Contextual crisp labels for Stage 3's two distinct waves
    if (stage.mode === 'rhythm-race' && wave.subMode === 'function-race') {
      controls = [
        { action: 'laneLeft', label: 'دعم الحسابية uₙ', key: '▢ · ◀', cls: 'amber' },
        { action: 'laneRight', label: 'دعم الهندسية vₙ', key: '△ · ▶', cls: 'emerald' },
        { action: 'pulseHit', label: 'إطلاق المبارزة!', key: '✕ · Space', cls: 'cyan' },
        { action: 'sumNova', label: 'شرارة الانقلاب', key: '◯ · E', cls: 'rose' }
      ];
    } else if (stage.mode === 'rhythm-race') {
      controls = [
        { action: 'laneLeft', label: 'محوّل يسار', key: '◀ · A', cls: 'emerald' },
        { action: 'pulseHit', label: 'فرز فوري', key: '✕ · Space', cls: 'cyan' },
        { action: 'laneRight', label: 'محوّل يمين', key: '▶ · D', cls: 'rose' },
        { action: 'sumNova', label: 'قنبلة Sₙ', key: '◯ · E', cls: 'amber' }
      ];
    }

    this.deckButtonsEl.className = `astro-deck-btns${controls.length === 3 ? ' cols-3' : ''}`;
    this.deckButtonsEl.innerHTML = controls
      .map((c) => `<button type="button" class="astro-pad ${c.cls}" data-act="${c.action}"><span>${c.label}</span><kbd>${c.key}</kbd></button>`)
      .join('');
    this.deckButtonsEl.querySelectorAll('.astro-pad').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.unlock();
        btn.classList.add('active-press');
        setTimeout(() => btn.classList.remove('active-press'), 120);
        this.triggerAction(btn.getAttribute('data-act'));
      });
    });
    if (this.deckHintEl) {
      this.deckHintEl.textContent = stage.deckHint;
    }
  }

  setTape(text) {
    if (!this.termTapeEl) return;
    renderTex(this.termTapeEl, text);
  }

  loadStage(idx) {
    this.stageIdx = ((idx % STAGES.length) + STAGES.length) % STAGES.length;
    this.waveIdx = 0;
    this.waveHits = 0;
    this.ended = false;
    this.paused = false;
    this.endOverlayEl?.classList.add('hidden');
    this.hits = 0;
    this.hp = this.maxHp;
    this.combo = 1;
    this.invulnTimer = 0;
    this.hitStop = 0;
    this.particles = [];
    this.rings = [];
    this.beams = [];
    this.cobwebs = [];
    this.trail = [];

    this.renderStageNav();
    this.initWave(0, true);
  }

  initWave(wIdx, isFreshStage = false) {
    const stage = this.getStage();
    this.waveIdx = clamp(wIdx, 0, stage.waves.length - 1);
    this.waveHits = 0;
    const wave = this.getWave();

    // Plain Arabic stage badge — NEVER "1/5" through KaTeX!
    if (this.stageBadgeEl) {
      this.stageBadgeEl.textContent = `الطور ${this.stageIdx + 1} من ${STAGES.length}`;
    }
    this.renderWavePips();
    if (this.stageTitleEl) this.stageTitleEl.textContent = stage.title;
    renderTex(this.stageFormulaEl, wave.formula);
    renderTex(this.stageGoalEl, wave.goalText);
    this.renderDeck(stage);

    this.beams = [];
    this.cobwebs = [];
    this.trail = [];

    if (stage.mode === 'induction-catcher') {
      const initialSafe = wave.boundType === 'upper' ? 1.8 : 4.4;
      this.st = {
        paddleX: 2.5,
        boundVal: wave.boundStart,
        shieldTimer: 0,
        spawnTimer: 0.9,
        orbs: [{
          x: initialSafe,
          y: 5.2,
          vy: -1.08,
          safe: true
        }]
      };
      this.setTape(wave.boundType === 'upper'
        ? 'الترجع: u₀ ≤ 4 ⇒ uₙ ≤ 4  |  M = 2.80'
        : 'الترجع: u₀ ≥ 2 ⇒ uₙ ≥ 2  |  m = 3.40');
    } else if (stage.mode === 'monotone-shooter') {
      const xA = wave.sampleX('inc');
      const xB = wave.sampleX('dec');
      this.st = {
        px: wave.domain.max * 0.48,
        py: wave.domain.max * 0.48,
        dashCd: 0,
        dashTime: 0,
        spawnTimer: 1.0,
        lockedOrb: null,
        orbs: [
          { x: xA, y: wave.f(xA), kind: wave.classify(xA), life: 10.5, maxLife: 10.5, drift: 0.08 },
          { x: xB, y: wave.f(xB), kind: wave.classify(xB), life: 11.5, maxLife: 11.5, drift: -0.06 }
        ]
      };
      this.setTape(`MCT: راقب إشارة f(x) − x حول α=${wave.alpha} و β=${wave.beta}`);
    } else if (stage.mode === 'rhythm-race') {
      if (wave.subMode === 'sorter') {
        const firstPick = wave.catalog[0];
        this.st = {
          subMode: 'sorter',
          lane: 1,
          sumCharge: 0,
          sumKind: 'geo',
          spawnTimer: 1.55,
          catIdx: 1,
          notes: [{
            y: 68,
            vy: 86,
            targetLane: firstPick.targetLane,
            label: firstPick.label,
            explain: firstPick.explain,
            routing: null
          }],
          routed: []
        };
        this.setTape('المحوّل: المسار الأوسط (→ L ≠ 0)  |  خزان Sₙ: 0%');
      } else {
        this.st = {
          subMode: 'function-race',
          duelIdx: 0,
          pick: 'arith', // 'arith' | 'geo'
          phase: 'choose', // 'choose' | 'clash' | 'resolve'
          chooseTimer: 9.0,
          clashT: 0,
          clashStep: -1,
          surgeAvailable: false,
          surgeClaimed: false,
          projectiles: [],
          arithDmg: 0,
          geoDmg: 0,
          fortressCrack: 0
        };
        this.syncDuelTape();
      }
    } else if (stage.mode === 'homographic-boss') {
      this.st = {
        px: 2.2,
        py: 2.5,
        dashCd: 0,
        dashTime: 0,
        spawnTimer: 0.9,
        bullets: [],
        phase: 'lock', // 'lock' -> 'aux'
        lockedTargets: new Set(),
        wavePhase: 0,
        shieldPulse: 0
      };
      this.setTape('الهدف: اقفل النقط الصامدة على y = x ثم فعّل المتتالية المساعدة vₙ');
    } else if (stage.mode === 'squeeze-tunnel') {
      if (wave.subMode === 'squeeze') {
        this.st = {
          subMode: 'squeeze',
          centerY: 2.5,
          halfGap: 0.72,
          shieldTimer: 0,
          scrollT: 0,
          gateTimer: 0.85,
          gates: [{ x: this.w * 0.82, L: 2.8, reqAmp: 0.45, vx: -165, expr: '|u_n - 2.8| ≤ 1/(n+1)' }],
          meteors: []
        };
        this.setTape('الدركيين: vₙ ≤ uₙ ≤ wₙ  |  L = 2.50 , ±0.72');
      } else if (wave.subMode === 'composite') {
        this.st = {
          subMode: 'composite',
          centerY: 2.5,
          halfGap: 0.55,
          shieldTimer: 0,
          scrollT: 0,
          portalIdx: 0,
          gateTimer: 0.5,
          portals: []
        };
        this.spawnCompositePortal(wave);
      } else {
        this.st = {
          subMode: 'heron',
          centerY: 1.65,
          halfGap: 0.34,
          shieldTimer: 0,
          scrollT: 0,
          stepIdx: 0,
          rings: [{
            x: this.w * 0.84,
            vx: -115,
            step: wave.steps[0]
          }]
        };
        this.setTape('هيرون: u₀ = 2.000 → u₁ = 1.500 → u₂ = 1.417 → √2 ≈ 1.414');
      }
    }

    this.syncHUD();
    this.showToast(isFreshStage ? `انطلق! ${stage.tab}` : `✦ ${wave.name}`, 'normal');
  }

  syncDuelTape() {
    const wave = this.getWave();
    const d = wave.duels[this.st.duelIdx % wave.duels.length];
    const side = this.st.pick === 'arith' ? 'الحسابية uₙ' : 'الهندسية vₙ';
    this.setTape(`${d.title} | الرهان: ${side} | HP = ${d.hp}`);
  }

  spawnCompositePortal(wave) {
    const p = wave.portals[this.st.portalIdx % wave.portals.length];
    this.st.portalIdx += 1;
    const opts = [p.answer, ...p.decoys].sort((a, b) => a - b);
    this.st.portals.push({
      x: this.w + 70,
      vx: -(148 + this.waveHits * 10),
      expr: p.expr,
      answer: p.answer,
      explain: p.explain,
      ports: opts
    });
    this.setTape(`مركّب متصلة: ${p.expr.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)').replace(/\\sqrt\{([^}]+)\}/g, '√($1)').replace(/\\cos/g, 'cos')}`);
  }

  syncHUD() {
    const stage = this.getStage();
    if (this.hudScoreEl) this.hudScoreEl.textContent = String(this.score);
    if (this.hudComboEl) this.hudComboEl.textContent = `×${this.combo}`;
    if (this.hudHpEl) {
      this.hudHpEl.textContent = '♥'.repeat(Math.max(0, this.hp)) + '♡'.repeat(Math.max(0, this.maxHp - this.hp));
    }
    if (this.stageCounterEl) {
      this.stageCounterEl.textContent = `${this.hits} / ${stage.targetHits}`;
    }
    if (this.progressFillEl) {
      const pct = Math.min(100, Math.round((this.hits / stage.targetHits) * 100));
      this.progressFillEl.style.width = `${pct}%`;
    }
    // Highlight S_n Nova button when charged
    if (stage.mode === 'rhythm-race' && this.st.subMode === 'sorter') {
      const novaBtn = this.deckButtonsEl?.querySelector('[data-act="sumNova"]');
      if (novaBtn) novaBtn.classList.toggle('ready', this.st.sumCharge >= 100);
    }
  }

  showToast(msg, tone = 'normal') {
    if (!this.toastEl) return;
    this.toastEl.classList.remove('hidden', 'bad', 'gold');
    if (tone === 'bad') this.toastEl.classList.add('bad');
    else if (tone === 'gold') this.toastEl.classList.add('gold');
    renderTex(this.toastEl, msg);
    this.toastTimer = 1.95;
  }

  spawnParticles(sx, sy, color, count = 14) {
    for (let i = 0; i < count; i += 1) {
      const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.45;
      const spd = 75 + Math.random() * 155;
      this.particles.push({
        x: sx,
        y: sy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: 2.2 + Math.random() * 2.5,
        color,
        life: 0.42 + Math.random() * 0.25,
        maxLife: 0.68
      });
    }
  }

  spawnRing(sx, sy, color, maxR = 64) {
    this.rings.push({ x: sx, y: sy, r: 10, maxR, color, life: 0.34, maxLife: 0.34 });
  }

  awardHit(points, sx, sy, color, msg, hitCount = 1) {
    const stage = this.getStage();
    const wave = this.getWave();
    const effHits = Math.max(1, Math.min(hitCount, Math.max(1, wave.hitsNeeded - this.waveHits)));
    this.hits += effHits;
    this.waveHits += effHits;
    this.attempts += 1;
    this.correctHits += 1;
    this.score += points * this.combo;
    this.combo = Math.min(8, this.combo + 1);
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.hitStop = 0.038;
    this.audio.playHit(this.combo);
    window.ArcadeCore?.Gamepad?.triggerHaptic(this.gpState, 55, 0.22, 0.45);
    if (sx !== undefined && sy !== undefined) {
      this.spawnParticles(sx, sy, color || '#10b981', 16);
      this.spawnRing(sx, sy, color || '#34d399', 58);
    }
    if (msg) this.showToast(msg, 'normal');
    this.syncHUD();

    if (this.hits >= stage.targetHits) {
      this.completeStage();
    } else if (this.waveHits >= wave.hitsNeeded && this.waveIdx + 1 < stage.waves.length) {
      this.audio.playWaveClear();
      this.initWave(this.waveIdx + 1, false);
    }
  }

  takeDamage(msg, sx, sy, bypassInvuln = false) {
    if (!bypassInvuln && this.invulnTimer > 0) return;
    this.invulnTimer = 0.72;
    this.attempts += 1;
    this.combo = 1;
    this.hp = Math.max(0, this.hp - 1);
    this.shake = 0.28;
    this.hitFlash = 0.32;
    this.audio.playDamage();
    window.ArcadeCore?.Gamepad?.triggerHaptic(this.gpState, 165, 0.75, 0.85);
    if (sx !== undefined && sy !== undefined) {
      this.spawnParticles(sx, sy, '#fb7185', 18);
      this.spawnRing(sx, sy, '#fb7185', 70);
    }
    this.showToast(msg, 'bad');
    this.syncHUD();

    if (this.hp <= 0) {
      this.finishRun(false);
    }
  }

  completeStage() {
    const stage = this.getStage();
    this.clearedStages.add(stage.id);
    this.audio.playStageClear();
    this.renderStageNav();
    const allCleared = this.clearedStages.size >= STAGES.length;
    if (allCleared) {
      this.finishRun(true);
      return;
    }
    // Persist partial progress cleanly
    const acc = this.attempts > 0 ? Math.round((this.correctHits / this.attempts) * 100) : 100;
    window.ArcadeCore?.Progress?.recordRun(GAME_ID, {
      score: this.score,
      stagesCleared: this.clearedStages.size,
      totalStages: STAGES.length,
      victory: false,
      accuracy: acc,
      bypasses: 0
    });
    this.showEndModal(true, false);
  }

  finishRun(victory) {
    const acc = this.attempts > 0 ? Math.round((this.correctHits / this.attempts) * 100) : 100;
    window.ArcadeCore?.Progress?.recordRun(GAME_ID, {
      score: this.score,
      stagesCleared: this.clearedStages.size,
      totalStages: STAGES.length,
      victory,
      accuracy: acc,
      bypasses: 0
    });
    this.showEndModal(victory, true);
  }

  showEndModal(victory, isFinal) {
    this.ended = true;
    const acc = this.attempts > 0 ? Math.round((this.correctHits / this.attempts) * 100) : 100;
    const rank = window.ArcadeCore?.Progress?.computeRank({
      victory: victory && isFinal,
      sealsCleared: Math.round((this.clearedStages.size / STAGES.length) * 4),
      accuracy: acc
    }) || 'A';

    if (this.endGlyphEl) this.endGlyphEl.textContent = victory ? '✦' : '⚠';
    if (this.endTitleEl) {
      this.endTitleEl.textContent = !victory
        ? 'انهار درع الإسطرلاب!'
        : (isFinal ? 'إتقان شامل للدرس 3: المتتاليات العددية!' : `اكتمل ${this.getStage().tab}!`);
    }
    if (this.endDescEl) {
      this.endDescEl.textContent = !victory
        ? 'راقب إشارة f(x)−x ونقط التقاطع مع المنصّف y=x وأعد المحاولة!'
        : (isFinal
          ? 'سيطرت على جميع مهارات المقرر الرسمي (41–52): الترجع، MCT، الهندسية والحسابية، المتخاطة، الدركيين وهيرون.'
          : 'انتقل للطور التالي أو أعد الطور لرفع الدقة والرتبة.');
    }
    if (this.endScoreEl) this.endScoreEl.textContent = String(this.score);
    if (this.endAccEl) this.endAccEl.textContent = `${acc}%`;
    if (this.endComboEl) this.endComboEl.textContent = `×${this.maxCombo}`;
    if (this.endRankEl) this.endRankEl.textContent = rank;

    const hasNext = victory && !isFinal;
    this.btnEndNext?.classList.toggle('hidden', !hasNext);
    this.endOverlayEl?.classList.remove('hidden');
  }

  canFire(act, cdMs = 135) {
    const now = performance.now();
    const prev = this.lastActionAt[act] || 0;
    if (now - prev < cdMs) return false;
    this.lastActionAt[act] = now;
    return true;
  }

  bindEvents() {
    this.btnPause?.addEventListener('click', () => {
      this.audio.unlock();
      this.pauseMenu?.toggle();
    });

    this.btnAudio?.addEventListener('click', () => {
      this.audio.muted = !this.audio.muted;
      this.btnAudio.textContent = this.audio.muted ? '🔇' : '🔊';
      if (!this.audio.muted) this.audio.unlock();
    });

    this.btnEndPrimary?.addEventListener('click', () => {
      this.audio.unlock();
      if (this.hp <= 0 || this.clearedStages.size >= STAGES.length) {
        this.restartFullRun();
      } else {
        this.loadStage(this.stageIdx);
      }
    });

    this.btnEndNext?.addEventListener('click', () => {
      this.audio.unlock();
      this.loadStage((this.stageIdx + 1) % STAGES.length);
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      this.audio.unlock();
      const r = this.canvas.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      this.pointer.x = px;
      this.pointer.y = py;
      this.pointer.lastX = px;
      this.pointer.lastY = py;
      this.pointer.down = true;
      this.inputMode = 'pointer';

      const stage = this.getStage();
      const mode = stage.mode;
      if (mode === 'induction-catcher') {
        this.triggerAction('shield');
      } else if (mode === 'homographic-boss') {
        const wave = this.getWave();
        this.st.px = clamp(this.unmapX(px, wave.domain), wave.domain.min + 0.1, wave.domain.max - 0.1);
        this.st.py = clamp(this.unmapY(py, wave.domain), wave.domain.min + 0.1, wave.domain.max - 0.1);
        if (this.st.phase === 'lock') this.triggerAction('lockPoint');
      } else if (mode === 'rhythm-race') {
        if (this.st.subMode === 'sorter') {
          const lane = clamp(Math.floor((px / Math.max(1, this.w)) * 3), 0, 2);
          this.st.lane = lane;
          this.triggerAction('pulseHit');
        } else if (this.st.phase === 'choose') {
          if (py < this.h * 0.5) this.st.pick = 'arith';
          else this.st.pick = 'geo';
          this.syncDuelTape();
          this.audio.playLockTick();
        } else if (this.st.phase === 'clash' && this.st.surgeAvailable) {
          this.triggerAction('sumNova');
        }
      } else if (mode === 'squeeze-tunnel') {
        if (this.st.subMode === 'squeeze' || this.st.subMode === 'heron') {
          this.triggerAction('shield');
        }
      }
    });

    this.canvas.addEventListener('pointermove', (e) => {
      const r = this.canvas.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      if (Math.hypot(px - this.pointer.lastX, py - this.pointer.lastY) > 3) {
        this.inputMode = 'pointer';
        this.pointer.lastX = px;
        this.pointer.lastY = py;
      }
      this.pointer.x = px;
      this.pointer.y = py;
    });

    window.addEventListener('pointerup', () => {
      this.pointer.down = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      const mode = this.getStage().mode;
      if (mode === 'induction-catcher') {
        e.preventDefault();
        this.st.boundVal = clamp(this.st.boundVal + (e.deltaY < 0 ? 0.25 : -0.25), 0.8, 5.6);
      } else if (mode === 'squeeze-tunnel') {
        e.preventDefault();
        const maxG = this.st.subMode === 'heron' ? 0.5 : 1.45;
        const minG = this.st.subMode === 'heron' ? 0.08 : 0.18;
        this.st.halfGap = clamp(this.st.halfGap + (e.deltaY < 0 ? 0.08 : -0.08), minG, maxG);
      }
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (this.pauseMenu?.isOpen()) return;
      this.audio.unlock();

      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(e.code)) {
        this.inputMode = 'keyboard';
      }

      if (this.ended) {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          if (!this.btnEndNext?.classList.contains('hidden')) this.btnEndNext.click();
          else this.btnEndPrimary?.click();
        } else if (e.code === 'KeyR') {
          this.btnEndPrimary?.click();
        }
        return;
      }

      const mode = this.getStage().mode;
      if (e.code === 'KeyM') this.btnAudio?.click();
      else if (e.code === 'BracketRight') this.loadStage((this.stageIdx + 1) % STAGES.length);
      else if (e.code === 'BracketLeft') this.loadStage((this.stageIdx - 1 + STAGES.length) % STAGES.length);
      else if (e.code === 'Space') {
        e.preventDefault();
        if (mode === 'induction-catcher') this.triggerAction('shield');
        else if (mode === 'monotone-shooter') this.triggerAction('dash');
        else if (mode === 'rhythm-race') this.triggerAction('pulseHit');
        else if (mode === 'homographic-boss') this.triggerAction('dash');
        else if (mode === 'squeeze-tunnel') this.triggerAction('shield');
      } else if (e.code === 'Digit1' || e.code === 'KeyJ') {
        if (mode === 'monotone-shooter') this.triggerAction('beamInc');
        else if (mode === 'homographic-boss') this.triggerAction('lockPoint');
        else if (mode === 'rhythm-race' && this.st.subMode === 'function-race') this.triggerAction('laneLeft');
      } else if (e.code === 'Digit2' || e.code === 'KeyK') {
        if (mode === 'monotone-shooter') this.triggerAction('beamDec');
        else if (mode === 'homographic-boss') this.triggerAction('auxGeo');
        else if (mode === 'rhythm-race' && this.st.subMode === 'function-race') this.triggerAction('laneRight');
      } else if (e.code === 'Digit3' || e.code === 'KeyL') {
        if (mode === 'monotone-shooter') this.triggerAction('beamDiv');
        else if (mode === 'homographic-boss') this.triggerAction('auxArith');
        else if (mode === 'rhythm-race') this.triggerAction('sumNova');
      } else if (e.code === 'KeyE') {
        if (mode === 'rhythm-race') this.triggerAction('sumNova');
        else if (mode === 'induction-catcher') this.triggerAction('ceilUp');
        else if (mode === 'squeeze-tunnel') this.triggerAction('pinchOut');
      } else if (e.code === 'KeyQ') {
        if (mode === 'induction-catcher') this.triggerAction('ceilDown');
        else if (mode === 'squeeze-tunnel') this.triggerAction('pinchIn');
        else if (mode === 'homographic-boss') this.triggerAction('lockPoint');
      } else if (mode === 'rhythm-race' && (e.code === 'ArrowLeft' || e.code === 'KeyA')) {
        this.triggerAction('laneLeft');
      } else if (mode === 'rhythm-race' && (e.code === 'ArrowRight' || e.code === 'KeyD')) {
        this.triggerAction('laneRight');
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  triggerAction(act) {
    if (this.paused || this.ended) return;
    if (!this.canFire(act, act === 'ceilUp' || act === 'ceilDown' || act === 'pinchIn' || act === 'pinchOut' ? 75 : 135)) {
      return;
    }
    const mode = this.getStage().mode;

    if (mode === 'induction-catcher') {
      if (act === 'shield') {
        this.st.shieldTimer = 0.38;
        this.audio.playDeflect();
      } else if (act === 'ceilUp') {
        this.st.boundVal = clamp(this.st.boundVal + 0.25, 0.8, 5.6);
        this.audio.playLockTick();
      } else if (act === 'ceilDown') {
        this.st.boundVal = clamp(this.st.boundVal - 0.25, 0.8, 5.6);
        this.audio.playLockTick();
      }
    } else if (mode === 'monotone-shooter') {
      if (act === 'dash' && this.st.dashCd <= 0) {
        this.st.dashTime = 0.22;
        this.st.dashCd = 0.65;
        this.audio.playDash();
      } else if (act === 'beamInc' || act === 'beamDec' || act === 'beamDiv') {
        const want = act === 'beamInc' ? 'inc' : (act === 'beamDec' ? 'dec' : 'div');
        this.fireMonotoneBeam(want);
      }
    } else if (mode === 'rhythm-race') {
      if (this.st.subMode === 'sorter') {
        if (act === 'laneLeft') {
          this.st.lane = clamp(this.st.lane - 1, 0, 2);
          this.audio.playLockTick();
          this.updateSorterTape();
        } else if (act === 'laneRight') {
          this.st.lane = clamp(this.st.lane + 1, 0, 2);
          this.audio.playLockTick();
          this.updateSorterTape();
        } else if (act === 'pulseHit') {
          this.snapRouteLowestCapsule();
        } else if (act === 'sumNova') {
          this.fireSumNova();
        }
      } else {
        if (act === 'laneLeft' && this.st.phase === 'choose') {
          this.st.pick = 'arith';
          this.audio.playLockTick();
          this.syncDuelTape();
        } else if (act === 'laneRight' && this.st.phase === 'choose') {
          this.st.pick = 'geo';
          this.audio.playLockTick();
          this.syncDuelTape();
        } else if (act === 'pulseHit' && this.st.phase === 'choose') {
          this.launchFunctionDuel();
        } else if (act === 'sumNova' && this.st.phase === 'clash') {
          this.triggerDuelSurge();
        }
      }
    } else if (mode === 'homographic-boss') {
      if (act === 'dash' && this.st.dashCd <= 0) {
        this.st.dashTime = 0.24;
        this.st.dashCd = 0.7;
        this.audio.playDash();
      } else if (act === 'lockPoint') {
        this.attemptFixedPointLock();
      } else if (act === 'auxGeo' || act === 'auxArith') {
        this.attemptAuxLens(act);
      }
    } else if (mode === 'squeeze-tunnel') {
      if (act === 'shield') {
        if (this.st.subMode === 'heron') {
          this.attemptHeronLock();
        } else {
          this.st.shieldTimer = 0.38;
          this.audio.playDeflect();
        }
      } else if (act === 'pinchIn') {
        const minG = this.st.subMode === 'heron' ? 0.08 : 0.18;
        this.st.halfGap = clamp(this.st.halfGap - 0.1, minG, 1.45);
        this.audio.playLockTick();
      } else if (act === 'pinchOut') {
        const maxG = this.st.subMode === 'heron' ? 0.5 : 1.45;
        this.st.halfGap = clamp(this.st.halfGap + 0.1, 0.08, maxG);
        this.audio.playLockTick();
      }
    }
  }

  pollGamepad() {
    const GP = window.ArcadeCore?.Gamepad;
    if (!GP || !this.gpState) return { lx: 0, ly: 0, rx: 0, ry: 0, l2: 0, r2: 0 };
    const gp = GP.resolveActiveGamepad(this.gpState);
    GP.updateBanner(this.gpState, this.gpBadgeEl, this.gpLabelEl, 'لوحة المفاتيح');

    if (this.pauseMenu?.pollGamepad(gp, this.gpState)) {
      return { lx: 0, ly: 0, rx: 0, ry: 0, l2: 0, r2: 0 };
    }
    if (!gp) return { lx: 0, ly: 0, rx: 0, ry: 0, l2: 0, r2: 0 };

    if (this.ended) {
      if (GP.justPressed(gp, this.gpState, 0)) {
        this.btnEndPrimary?.click();
      } else if (GP.justPressed(gp, this.gpState, 3) && !this.btnEndNext?.classList.contains('hidden')) {
        this.btnEndNext?.click();
      } else if (GP.justPressed(gp, this.gpState, 1)) {
        window.location.href = '../../index.html?from=game';
      }
      GP.snapshotButtons(gp, this.gpState);
      return { lx: 0, ly: 0, rx: 0, ry: 0, l2: 0, r2: 0 };
    }

    const axes = GP.sampleAnalogAxes(gp, 0.18);
    const nav = GP.sampleDirectionalNav(gp, this.gpState);
    const dpadX = (gp.buttons[15]?.pressed ? 1 : 0) - (gp.buttons[14]?.pressed ? 1 : 0);
    const dpadY = (gp.buttons[13]?.pressed ? 1 : 0) - (gp.buttons[12]?.pressed ? 1 : 0);
    const lx = Math.abs(axes.lx) > 0.05 ? axes.lx : dpadX;
    const ly = Math.abs(axes.ly) > 0.05 ? axes.ly : dpadY;

    if (Math.abs(lx) > 0.08 || Math.abs(ly) > 0.08 || Math.abs(axes.rx) > 0.08 || Math.abs(axes.ry) > 0.08) {
      this.inputMode = 'gamepad';
    }

    const mode = this.getStage().mode;
    if (GP.justPressed(gp, this.gpState, 4)) this.loadStage((this.stageIdx - 1 + STAGES.length) % STAGES.length);
    if (GP.justPressed(gp, this.gpState, 5)) this.loadStage((this.stageIdx + 1) % STAGES.length);

    if (mode === 'induction-catcher') {
      if (GP.justPressed(gp, this.gpState, 2) || GP.justPressed(gp, this.gpState, 0)) this.triggerAction('shield');
    } else if (mode === 'monotone-shooter') {
      if (GP.justPressed(gp, this.gpState, 2)) this.triggerAction('beamInc');
      if (GP.justPressed(gp, this.gpState, 3)) this.triggerAction('beamDec');
      if (GP.justPressed(gp, this.gpState, 1)) this.triggerAction('beamDiv');
      if (GP.justPressed(gp, this.gpState, 0)) this.triggerAction('dash');
    } else if (mode === 'rhythm-race') {
      if (nav.dLeft || GP.justPressed(gp, this.gpState, 2)) this.triggerAction('laneLeft');
      if (nav.dRight || GP.justPressed(gp, this.gpState, 3)) this.triggerAction('laneRight');
      if (GP.justPressed(gp, this.gpState, 0)) this.triggerAction('pulseHit');
      if (GP.justPressed(gp, this.gpState, 1)) this.triggerAction('sumNova');
    } else if (mode === 'homographic-boss') {
      if (GP.justPressed(gp, this.gpState, 2)) this.triggerAction('lockPoint');
      if (GP.justPressed(gp, this.gpState, 3)) this.triggerAction('auxGeo');
      if (GP.justPressed(gp, this.gpState, 1)) this.triggerAction('auxArith');
      if (GP.justPressed(gp, this.gpState, 0)) this.triggerAction('dash');
    } else if (mode === 'squeeze-tunnel') {
      if (GP.justPressed(gp, this.gpState, 2) || GP.justPressed(gp, this.gpState, 0)) this.triggerAction('shield');
    }

    GP.snapshotButtons(gp, this.gpState);
    return { lx, ly, rx: axes.rx, ry: axes.ry, l2: axes.l2, r2: axes.r2 };
  }

  // ---------- Stage 2 Action ----------
  fireMonotoneBeam(want) {
    const wave = this.getWave();
    let best = null;
    let bestD = 999;
    for (const orb of this.st.orbs) {
      const d = Math.hypot(orb.x - this.st.px, orb.y - this.st.py);
      if (d < bestD) {
        bestD = d;
        best = orb;
      }
    }
    const maxRange = this.st.dashTime > 0 ? 1.85 : 1.45;
    if (!best || bestD > maxRange) {
      this.showToast('حرّك المؤشّر قرب إحدى العقد أولاً!', 'bad');
      return;
    }
    const sx = this.mapX(best.x, wave.domain);
    const sy = this.mapY(best.y, wave.domain);
    if (best.kind === want) {
      this.st.orbs = this.st.orbs.filter((o) => o !== best);
      const col = want === 'inc' ? '#38bdf8' : want === 'dec' ? '#e6b95c' : '#fb7185';
      this.beams.push({
        x1: this.mapX(this.st.px, wave.domain),
        y1: this.mapY(this.st.py, wave.domain),
        x2: sx,
        y2: sy,
        color: col,
        life: 0.28,
        maxLife: 0.28
      });
      this.cobwebs.push({ u0: best.x, f: wave.f, color: col, life: 1.5, maxLife: 1.5 });
      const u1 = wave.f(best.x);
      const u2 = wave.f(u1);
      this.setTape(`u₀=${fmtNum(best.x, 2)} → u₁=${fmtNum(u1, 2)} → u₂=${fmtNum(u2, 2)} (${want === 'inc' ? 'تزايدية' : want === 'dec' ? 'تناقصية' : 'متباعدة +∞'})`);
      this.awardHit(
        130,
        sx,
        sy,
        col,
        want === 'inc' ? 'f(x) > x ومكبورة ⇒ متقاربة ✓' : (want === 'dec' ? 'f(x) < x ومصغورة ⇒ متقاربة ✓' : 'f(x) > x فوق β ⇒ متباعدة +∞ ✓')
      );
    } else {
      const hint = best.kind === 'inc' ? 'المنحنى فوق y=x وتحت α (تزايدية متقاربة)!'
        : (best.kind === 'dec' ? 'المنحنى تحت y=x (تناقصية متقاربة)!' : 'فوق العتبة β والمنحنى أعلى من y=x (متباعدة +∞)!');
      this.takeDamage(hint, sx, sy);
    }
  }

  // ---------- Stage 3 Wave 1: Active Sorter ----------
  updateSorterTape() {
    const names = ['→ 0 (|q|<1 أو 1/nᵖ)', '→ L ≠ 0 (ثابتة / q=1)', '→ ±∞ / متباعدة'];
    this.setTape(`المحوّل: ${names[this.st.lane]}  |  خزان Sₙ: ${this.st.sumCharge}%`);
  }

  routeCapsule(note, chosenLane, perfectBonus = false) {
    const compact = this.w < 540;
    const binX = ((chosenLane + 0.5) / 3) * this.w;
    const hitY = this.h - (compact ? 84 : 92);
    const ok = chosenLane === note.targetLane;
    this.st.routed.push({
      x1: this.w * 0.5,
      y1: note.y,
      x2: binX,
      y2: hitY,
      color: ok ? '#34d399' : '#fb7185',
      life: 0.34,
      maxLife: 0.34
    });
    if (ok) {
      this.st.sumCharge = Math.min(100, this.st.sumCharge + (perfectBonus ? 34 : 25));
      this.updateSorterTape();
      this.awardHit(
        perfectBonus ? 145 : 115,
        binX,
        hitY,
        '#34d399',
        `${perfectBonus ? 'فرز مثالي! ' : ''}${note.explain}`
      );
    } else {
      this.takeDamage(`مسار خاطئ! الصواب: ${note.explain}`, binX, hitY);
    }
  }

  snapRouteLowestCapsule() {
    if (!this.st.notes.length) {
      this.audio.tone(210, 0.05, 'sine', 0.04);
      return;
    }
    let lowest = this.st.notes[0];
    for (const n of this.st.notes) {
      if (n.y > lowest.y) lowest = n;
    }
    if (lowest.y < 52) return;
    this.st.notes = this.st.notes.filter((n) => n !== lowest);
    const hitY = this.h - (this.w < 540 ? 114 : 124);
    const perfect = Math.abs(lowest.y - hitY) < 68;
    this.routeCapsule(lowest, this.st.lane, perfect);
  }

  fireSumNova() {
    if (this.st.sumCharge < 100) {
      this.showToast(`اشحن خزان المجموع $S_n$ حتى 100% أولاً (${this.st.sumCharge}%)`, 'bad');
      return;
    }
    this.st.sumCharge = 0;
    const cleared = this.st.notes.length;
    this.st.notes = [];
    const isGeo = this.st.sumKind === 'geo';
    this.st.sumKind = isGeo ? 'arith' : 'geo';
    this.audio.playNova();
    this.shake = 0.22;
    this.spawnParticles(this.w * 0.5, this.h * 0.5, '#e6b95c', 30);
    this.spawnRing(this.w * 0.5, this.h * 0.5, '#e6b95c', 180);
    this.updateSorterTape();
    const formulaMsg = isGeo
      ? 'قنبلة المجموع الهندسي $S_n = u_0\\frac{1-q^{n+1}}{1-q}$!'
      : 'قنبلة المجموع الحسابي $S_n = \\frac{(n+1)(u_0+u_n)}{2}$!';
    this.awardHit(260 + cleared * 45, this.w * 0.5, this.h * 0.5, '#e6b95c', formulaMsg, 2);
  }

  // ---------- Stage 3 Wave 2: Function-Race Clash ----------
  launchFunctionDuel() {
    this.st.phase = 'clash';
    this.st.clashT = 0;
    this.st.clashStep = -1;
    this.st.projectiles = [];
    this.st.arithDmg = 0;
    this.st.geoDmg = 0;
    this.st.fortressCrack = 0;
    this.st.surgeAvailable = false;
    this.st.surgeClaimed = false;
    this.audio.playDash();
    this.showToast('⚡ انطلقت المبارزة الفيزيائية! راقب تصاعد القوى...', 'gold');
  }

  triggerDuelSurge() {
    if (!this.st.surgeAvailable || this.st.surgeClaimed) return;
    this.st.surgeClaimed = true;
    this.st.surgeAvailable = false;
    this.score += 120 * this.combo;
    this.audio.playCrossover();
    this.spawnParticles(this.w * 0.55, this.h * 0.5, '#e6b95c', 22);
    this.spawnRing(this.w * 0.55, this.h * 0.5, '#e6b95c', 110);
    this.showToast('✦ اقتنصت شرارة لحظة الانقلاب! +120', 'gold');
    this.syncHUD();
  }

  // ---------- Stage 4 Actions ----------
  attemptFixedPointLock() {
    const wave = this.getWave();
    if (this.st.phase !== 'lock') {
      this.showToast('الآن فعّل المتتالية المساعدة: [△] هندسية أو [◯] حسابية!', 'gold');
      return;
    }
    let matchedIdx = -1;
    let bestD = 999;
    wave.fixedTargets.forEach((tgt, idx) => {
      if (this.st.lockedTargets.has(idx)) return;
      const d = Math.hypot(this.st.px - tgt.x, this.st.py - tgt.y);
      if (d < bestD) {
        bestD = d;
        matchedIdx = idx;
      }
    });
    if (matchedIdx >= 0 && bestD <= 0.64) {
      const tgt = wave.fixedTargets[matchedIdx];
      const sx = this.mapX(tgt.x, wave.domain);
      const sy = this.mapY(tgt.y, wave.domain);
      this.beams.push({
        x1: this.mapX(this.st.px, wave.domain),
        y1: this.mapY(this.st.py, wave.domain),
        x2: sx,
        y2: sy,
        color: '#e6b95c',
        life: 0.35,
        maxLife: 0.35
      });
      this.st.lockedTargets.add(matchedIdx);
      this.st.bullets = [];
      if (this.st.lockedTargets.size >= wave.fixedTargets.length) {
        this.st.phase = 'aux';
        this.st.shieldPulse = 1.0;
        this.setTape('درع المساعدة مكشوف! اختر [△] هندسية أو [◯] حسابية');
      }
      this.awardHit(175, sx, sy, '#e6b95c', `إقفال النقطة الصامدة ${tgt.label} (f(L)=L) ✓`);
    } else {
      this.takeDamage('صوّب فوق تقاطع (C_f) مع المنصّف y = x!', this.mapX(this.st.px, wave.domain), this.mapY(this.st.py, wave.domain));
    }
  }

  attemptAuxLens(act) {
    const wave = this.getWave();
    if (this.st.phase !== 'aux') {
      this.showToast('اقفل النقط الصامدة أولاً بـ [▢] قبل إطلاق المتتالية المساعدة!', 'bad');
      return;
    }
    const cx = this.w * 0.5;
    const cy = this.h * 0.48;
    if (act === wave.auxAction) {
      this.st.bullets = [];
      this.audio.playNova();
      this.setTape(wave.auxFormula);
      this.awardHit(230, cx, cy, '#34d399', `تحطيم الدرع! ${wave.auxFormula}`);
    } else {
      const reason = wave.auxAction === 'auxArith'
        ? 'نقطة صامدة وحيدة α=2 ⇒ المساعدة حسابية vₙ = 1/(uₙ − α) [◯]!'
        : 'التآلفية والمتخاطة بنقطتين تُخطّطان بمساعدة هندسية [△]!';
      this.takeDamage(reason, cx, cy);
    }
  }

  // ---------- Stage 5 Wave 3 Action: Heron Lock ----------
  attemptHeronLock() {
    const wave = this.getWave();
    const shipX = this.w * 0.25;
    const ring = this.st.rings[0];
    if (!ring) return;
    const dx = Math.abs(ring.x - shipX);
    const shipY = this.mapRangeY(this.st.centerY, wave.yMin, wave.yMax);
    if (dx > 96) {
      this.showToast('انتظر اقتراب حلقة هيرون من المركبة ثم اقفل [▢]!', 'gold');
      return;
    }
    const distTarget = Math.abs(this.st.centerY - Math.SQRT2);
    const gapOk = this.st.halfGap <= ring.step.reqGap + 0.14;
    if (distTarget <= 0.18 && gapOk) {
      this.st.rings.shift();
      this.st.stepIdx += 1;
      this.setTape(`هيرون: قفل ${ring.step.label} | الخطأ |uₙ − √2| ≈ ${ring.step.err}`);
      if (this.st.stepIdx < wave.steps.length) {
        this.st.rings.push({
          x: this.w * 0.9,
          vx: -(115 + this.st.stepIdx * 16),
          step: wave.steps[this.st.stepIdx]
        });
      }
      this.awardHit(210, shipX, shipY, '#e6b95c', `تقريب هيرون ${ring.step.label} → √2 ✓`);
    } else {
      const msg = distTarget > 0.18 ? 'ثبّت المركبة على خط √2 ≈ 1.414!' : 'ضيّق فكّي الحصر [L2 / ◀] لقياس دقة هيرون!';
      this.takeDamage(msg, shipX, shipY);
    }
  }

  // ---------- Coordinate Mapping ----------
  mapX(vx, domain) {
    const padL = 56;
    const padR = 30;
    return padL + ((vx - domain.min) / (domain.max - domain.min)) * (this.w - padL - padR);
  }

  mapY(vy, domain) {
    const padT = 26;
    const padB = 42;
    return padT + (this.h - padT - padB) - ((vy - domain.min) / (domain.max - domain.min)) * (this.h - padT - padB);
  }

  unmapX(px, domain) {
    const padL = 56;
    const padR = 30;
    return domain.min + ((px - padL) / Math.max(1, this.w - padL - padR)) * (domain.max - domain.min);
  }

  unmapY(py, domain) {
    const padT = 26;
    const padB = 42;
    return domain.min + ((padT + (this.h - padT - padB) - py) / Math.max(1, this.h - padT - padB)) * (domain.max - domain.min);
  }

  mapRangeY(yv, yMin, yMax) {
    const padT = 28;
    const padB = 34;
    return padT + (this.h - padT - padB) - ((yv - yMin) / (yMax - yMin)) * (this.h - padT - padB);
  }

  unmapRangeY(py, yMin, yMax) {
    const padT = 28;
    const padB = 34;
    return yMin + ((padT + (this.h - padT - padB) - py) / Math.max(1, this.h - padT - padB)) * (yMax - yMin);
  }

  loop(ts) {
    const rawDt = Math.min(0.05, this.lastTs ? (ts - this.lastTs) / 1000 : 0.016);
    this.lastTs = ts;
    const inp = this.pollGamepad();
    if (!this.paused && !this.ended) {
      if (this.hitStop > 0) {
        this.hitStop = Math.max(0, this.hitStop - rawDt);
      } else {
        this.update(rawDt, inp);
      }
    }
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt, inp) {
    this.clock += dt;
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.toastEl?.classList.add('hidden');
    }
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
    if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.invulnTimer > 0) this.invulnTimer = Math.max(0, this.invulnTimer - dt);

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.rings.length - 1; i >= 0; i -= 1) {
      const r = this.rings[i];
      r.life -= dt;
      const t = 1 - Math.max(0, r.life / r.maxLife);
      r.r = 10 + t * (r.maxR - 10);
      if (r.life <= 0) this.rings.splice(i, 1);
    }
    for (let i = this.beams.length - 1; i >= 0; i -= 1) {
      this.beams[i].life -= dt;
      if (this.beams[i].life <= 0) this.beams.splice(i, 1);
    }
    for (let i = this.cobwebs.length - 1; i >= 0; i -= 1) {
      this.cobwebs[i].life -= dt;
      if (this.cobwebs[i].life <= 0) this.cobwebs.splice(i, 1);
    }

    const kx = (this.keys.ArrowRight || this.keys.KeyD ? 1 : 0) - (this.keys.ArrowLeft || this.keys.KeyA ? 1 : 0);
    const ky = (this.keys.ArrowDown || this.keys.KeyS ? 1 : 0) - (this.keys.ArrowUp || this.keys.KeyW ? 1 : 0);
    const moveX = (Math.abs(inp.lx) > 0.08 ? inp.lx : kx) + inp.rx * 0.38;
    const moveY = (Math.abs(inp.ly) > 0.08 ? inp.ly : ky) + inp.ry * 0.38;

    const stage = this.getStage();
    const wave = this.getWave();
    const mode = stage.mode;

    if (mode === 'induction-catcher') {
      this.updateInduction(dt, inp, moveX, wave);
    } else if (mode === 'monotone-shooter') {
      this.updateMonotone(dt, moveX, moveY, wave);
    } else if (mode === 'rhythm-race') {
      if (this.st.subMode === 'sorter') this.updateSorter(dt, wave);
      else this.updateFunctionRace(dt, wave);
    } else if (mode === 'homographic-boss') {
      this.updateHomographic(dt, moveX, moveY, wave);
    } else if (mode === 'squeeze-tunnel') {
      this.updateSqueeze(dt, inp, moveY, wave);
    }
  }

  updateInduction(dt, inp, moveX, wave) {
    if (this.inputMode === 'pointer') {
      const tx = this.unmapX(this.pointer.x, wave.domain);
      this.st.paddleX += (clamp(tx, 0.35, 5.65) - this.st.paddleX) * Math.min(1, dt * 13);
    } else {
      this.st.paddleX = clamp(this.st.paddleX + moveX * dt * 4.2, 0.35, 5.65);
    }
    const boundDelta = (inp.r2 - inp.l2) + (this.keys.ArrowUp || this.keys.KeyW ? 1 : 0) - (this.keys.ArrowDown || this.keys.KeyS ? 1 : 0);
    if (Math.abs(boundDelta) > 0.02) {
      this.st.boundVal = clamp(this.st.boundVal + boundDelta * dt * 2.2, 0.8, 5.6);
      this.setTape(`${wave.boundType === 'upper' ? 'السقف' : 'المصغّر'} ${wave.boundLabel} = ${fmtNum(this.st.boundVal, 2)} (الهدف ≈ ${wave.boundTarget})`);
    }
    if (this.st.shieldTimer > 0) this.st.shieldTimer -= dt;

    this.st.spawnTimer -= dt;
    if (this.st.spawnTimer <= 0 && this.st.orbs.length < 3) {
      this.st.spawnTimer = 1.42;
      const safe = Math.random() < 0.62;
      const u0 = safe ? wave.spawnSafe() : wave.spawnRogue();
      this.st.orbs.push({
        x: u0,
        y: 5.75,
        vy: -(1.12 + Math.random() * 0.34),
        safe
      });
    }

    for (let i = this.st.orbs.length - 1; i >= 0; i -= 1) {
      const o = this.st.orbs[i];
      o.y += o.vy * dt;
      const caught = Math.abs(o.x - this.st.paddleX) < 0.64 && o.y <= 0.72 && o.y >= -0.05;
      if (caught) {
        const sx = this.mapX(o.x, wave.domain);
        const sy = this.mapY(0.38, wave.domain);
        if (!o.safe) {
          this.st.orbs.splice(i, 1);
          if (this.st.shieldTimer > 0) {
            this.audio.playDeflect();
            this.awardHit(140, sx, sy, '#38bdf8', `صدّ ناجح للبذرة الشاذة u₀=${fmtNum(o.x)} ✓`);
          } else {
            const cond = wave.boundType === 'upper' ? 'u₀ > 4' : 'u₀ < 2';
            this.takeDamage(`فخ! u₀=${fmtNum(o.x)} (${cond}) — صدّها بـ [▢ / Space]`, sx, sy);
          }
        } else if (this.st.shieldTimer > 0) {
          // Gentle bounce warning if player accidentally shields a safe seed
          o.y = 1.1;
          o.vy = Math.abs(o.vy) * 0.55;
          this.audio.playLockTick();
          this.showToast(`u₀=${fmtNum(o.x)} بذرة آمنة — التقطها بدون درع!`, 'gold');
        } else {
          this.st.orbs.splice(i, 1);
          const boundOk = Math.abs(this.st.boundVal - wave.boundTarget) <= 0.65;
          this.cobwebs.push({ u0: o.x, f: wave.f, color: '#34d399', life: 1.65, maxLife: 1.65 });
          const u1 = wave.f(o.x);
          const u2 = wave.f(u1);
          const u3 = wave.f(u2);
          this.setTape(`u₀=${fmtNum(o.x)} → u₁=${fmtNum(u1, 2)} → u₂=${fmtNum(u2, 2)} → u₃=${fmtNum(u3, 2)} → L=${wave.boundTarget}`);
          this.awardHit(
            boundOk ? 155 : 105,
            sx,
            sy,
            '#34d399',
            boundOk ? `ترجع مضبوط ${wave.boundLabel} ≈ ${wave.boundTarget} ✓` : `مقبول (اضبط ${wave.boundLabel} → ${wave.boundTarget})`
          );
        }
        continue;
      }
      if (o.vy > 0) {
        o.vy -= 2.4 * dt; // gravity pull back down after gentle bounce
      }
      if (o.y < -0.15) {
        this.st.orbs.splice(i, 1);
        if (o.safe) {
          this.takeDamage(`فاتتك البذرة المستقرة u₀=${fmtNum(o.x)}!`, this.mapX(o.x, wave.domain), this.mapY(0.1, wave.domain));
        }
      }
    }
  }

  updateMonotone(dt, moveX, moveY, wave) {
    if (this.st.dashCd > 0) this.st.dashCd -= dt;
    if (this.st.dashTime > 0) this.st.dashTime -= dt;
    const spd = this.st.dashTime > 0 ? 5.8 : 2.9;
    const maxD = wave.domain.max - 0.12;
    if (this.inputMode === 'pointer') {
      const tx = clamp(this.unmapX(this.pointer.x, wave.domain), 0.18, maxD);
      const ty = clamp(this.unmapY(this.pointer.y, wave.domain), 0.18, maxD);
      this.st.px += (tx - this.st.px) * Math.min(1, dt * 11);
      this.st.py += (ty - this.st.py) * Math.min(1, dt * 11);
    } else {
      this.st.px = clamp(this.st.px + moveX * spd * dt, 0.18, maxD);
      this.st.py = clamp(this.st.py - moveY * spd * dt, 0.18, maxD);
    }

    this.trail.push({ x: this.mapX(this.st.px, wave.domain), y: this.mapY(this.st.py, wave.domain), life: 0.25 });
    if (this.trail.length > 16) this.trail.shift();
    for (const tr of this.trail) tr.life -= dt;

    this.st.spawnTimer -= dt;
    if (this.st.spawnTimer <= 0 && this.st.orbs.length < 4) {
      this.st.spawnTimer = 1.85;
      const kinds = ['inc', 'dec', 'div'];
      const kind = kinds[Math.floor(Math.random() * kinds.length)];
      const x0 = wave.sampleX(kind);
      this.st.orbs.push({
        x: x0,
        y: wave.f(x0),
        kind,
        life: 10.0,
        maxLife: 10.0,
        drift: (Math.random() - 0.5) * 0.14
      });
    }

    let nearest = null;
    let bestD = 999;
    for (let i = this.st.orbs.length - 1; i >= 0; i -= 1) {
      const o = this.st.orbs[i];
      o.life -= dt;
      const nx = clamp(o.x + o.drift * dt, 0.22, wave.domain.max - 0.22);
      // Keep orb cleanly inside its original monotonicity zone so it never switches class mid-aim!
      if (wave.classify(nx) === o.kind) {
        o.x = nx;
        o.y = wave.f(o.x);
      } else {
        o.drift *= -1;
      }
      const d = Math.hypot(o.x - this.st.px, o.y - this.st.py);
      if (d < bestD && d <= 1.45) {
        bestD = d;
        nearest = o;
      }
      if (o.life <= 0) {
        this.st.orbs.splice(i, 1);
        this.takeDamage('انتهى وقت تصنيف العقدة!', this.mapX(o.x, wave.domain), this.mapY(o.y, wave.domain));
      }
    }
    if (nearest && nearest !== this.st.lockedOrb) {
      this.audio.playLockTick();
    }
    this.st.lockedOrb = nearest;
  }

  updateSorter(dt, wave) {
    this.st.spawnTimer -= dt;
    if (this.st.spawnTimer <= 0 && this.st.notes.length < 3) {
      this.st.spawnTimer = Math.max(1.25, 1.85 - this.waveHits * 0.06);
      const idx = (this.st.catIdx + Math.floor(Math.random() * 3)) % wave.catalog.length;
      this.st.catIdx = (this.st.catIdx + 1) % wave.catalog.length;
      const pick = wave.catalog[idx];
      this.st.notes.push({
        y: 44,
        vy: 84 + this.waveHits * 6,
        targetLane: pick.targetLane,
        label: pick.label,
        explain: pick.explain
      });
    }

    const compact = this.w < 540;
    const hitY = this.h - (compact ? 114 : 124);
    for (let i = this.st.notes.length - 1; i >= 0; i -= 1) {
      const n = this.st.notes[i];
      n.y += n.vy * dt;
      if (n.y >= hitY - 8) {
        this.st.notes.splice(i, 1);
        this.routeCapsule(n, this.st.lane, false);
      }
    }
    for (let i = this.st.routed.length - 1; i >= 0; i -= 1) {
      this.st.routed[i].life -= dt;
      if (this.st.routed[i].life <= 0) this.st.routed.splice(i, 1);
    }
  }

  updateFunctionRace(dt, wave) {
    const duel = wave.duels[this.st.duelIdx % wave.duels.length];
    if (this.st.phase === 'choose') {
      this.st.chooseTimer -= dt;
      if (this.st.chooseTimer <= 0) {
        this.launchFunctionDuel();
      }
      return;
    }

    if (this.st.phase === 'clash') {
      this.st.clashT += dt;
      const duration = 2.05;
      const frac = clamp(this.st.clashT / duration, 0, 1);
      const curStep = Math.min(duel.rankN, Math.floor(frac * (duel.rankN + 0.99)));

      if (curStep > this.st.clashStep) {
        this.st.clashStep = curStep;
        const aVal = duel.arithVal(curStep);
        const gVal = duel.geoVal(curStep);
        this.st.arithDmg = aVal;
        this.st.geoDmg = gVal;
        this.audio.playClashTick(curStep);

        // Spawn physical projectiles from both cannons!
        const fortX = this.w * 0.77;
        const aCount = Math.min(5, Math.max(1, Math.ceil(aVal / Math.max(12, duel.hp * 0.25))));
        const gCount = Math.min(8, Math.max(1, Math.ceil(gVal / Math.max(10, duel.hp * 0.2))));
        for (let k = 0; k < aCount; k += 1) {
          this.st.projectiles.push({
            x: this.w * 0.2,
            y: this.h * 0.34 + (Math.random() - 0.5) * 26,
            vx: (fortX - this.w * 0.2) * 2.1,
            vy: (Math.random() - 0.5) * 24,
            color: '#e6b95c',
            r: 5.5
          });
        }
        for (let k = 0; k < gCount; k += 1) {
          this.st.projectiles.push({
            x: this.w * 0.2,
            y: this.h * 0.68 + (Math.random() - 0.5) * 26,
            vx: (fortX - this.w * 0.2) * 2.3,
            vy: (Math.random() - 0.5) * 30,
            color: '#34d399',
            r: 4.5 + Math.min(4, curStep * 0.4)
          });
        }

        // Detect live crossover spark for bonus surge tap!
        if (curStep >= 1) {
          const prevDiff = duel.geoVal(curStep - 1) - duel.arithVal(curStep - 1);
          const curDiff = gVal - aVal;
          if (prevDiff * curDiff <= 0 && !this.st.surgeClaimed) {
            this.st.surgeAvailable = true;
            this.audio.playCrossover();
            this.shake = 0.14;
            this.showToast('⚡ لحظة الانقلاب الآن! اضغط [◯ / E] لمكافأة السرعة!', 'gold');
          }
        }
        this.setTape(`n = ${curStep}/${duel.rankN} | u=${fmtNum(aVal, 1)} vs v=${fmtNum(gVal, 1)} | HP=${duel.hp}`);
      }

      const fortX = this.w * 0.77;
      for (let i = this.st.projectiles.length - 1; i >= 0; i -= 1) {
        const pr = this.st.projectiles[i];
        pr.x += pr.vx * dt;
        pr.y += pr.vy * dt;
        if (pr.x >= fortX) {
          this.st.projectiles.splice(i, 1);
          this.spawnParticles(fortX, pr.y, pr.color, 4);
        }
      }

      if (this.st.clashT >= duration) {
        this.st.phase = 'resolve';
        this.st.resolveTimer = 0.75;
        const won = this.st.pick === duel.winner;
        const fx = this.w * 0.77;
        const fy = duel.winner === 'arith' ? this.h * 0.34 : this.h * 0.68;
        if (won) {
          this.st.fortressCrack = 1;
          this.shake = 0.26;
          this.st.duelIdx += 1;
          this.awardHit(210, fx, fy, '#34d399', duel.verdict);
        } else {
          this.st.duelIdx += 1;
          this.takeDamage(`اختيار معاكس! ${duel.verdict}`, this.w * 0.22, fy, true);
        }
      }
      return;
    }

    if (this.st.phase === 'resolve') {
      this.st.resolveTimer -= dt;
      if (this.st.resolveTimer <= 0) {
        this.st.phase = 'choose';
        this.st.chooseTimer = 9.0;
        this.st.arithDmg = 0;
        this.st.geoDmg = 0;
        this.st.fortressCrack = 0;
        this.st.projectiles = [];
        this.syncDuelTape();
      }
    }
  }

  updateHomographic(dt, moveX, moveY, wave) {
    if (this.st.dashCd > 0) this.st.dashCd -= dt;
    if (this.st.dashTime > 0) this.st.dashTime -= dt;
    if (this.st.shieldPulse > 0) this.st.shieldPulse = Math.max(0, this.st.shieldPulse - dt);

    const spd = this.st.dashTime > 0 ? 5.6 : 2.8;
    const minD = wave.domain.min + 0.1;
    const maxD = wave.domain.max - 0.1;
    if (this.inputMode === 'pointer') {
      this.st.px += (clamp(this.unmapX(this.pointer.x, wave.domain), minD, maxD) - this.st.px) * Math.min(1, dt * 10);
      this.st.py += (clamp(this.unmapY(this.pointer.y, wave.domain), minD, maxD) - this.st.py) * Math.min(1, dt * 10);
    } else {
      this.st.px = clamp(this.st.px + moveX * spd * dt, minD, maxD);
      this.st.py = clamp(this.st.py - moveY * spd * dt, minD, maxD);
    }

    this.trail.push({ x: this.mapX(this.st.px, wave.domain), y: this.mapY(this.st.py, wave.domain), life: 0.24 });
    if (this.trail.length > 16) this.trail.shift();
    for (const tr of this.trail) tr.life -= dt;

    this.st.wavePhase += dt * 1.45;
    this.st.spawnTimer -= dt;
    if (this.st.spawnTimer <= 0) {
      this.st.spawnTimer = wave.spawnRate;
      const cx = (wave.domain.min + wave.domain.max) * 0.5;
      const ang = this.st.wavePhase;
      this.st.bullets.push({
        x: cx,
        y: cx,
        vx: Math.cos(ang) * wave.bulletSpeed,
        vy: Math.sin(ang) * wave.bulletSpeed
      });
    }

    for (let i = this.st.bullets.length - 1; i >= 0; i -= 1) {
      const b = this.st.bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < wave.domain.min - 0.2 || b.x > wave.domain.max + 0.2 || b.y < wave.domain.min - 0.2 || b.y > wave.domain.max + 0.2) {
        this.st.bullets.splice(i, 1);
        continue;
      }
      if (this.st.dashTime <= 0 && Math.hypot(b.x - this.st.px, b.y - this.st.py) < 0.25) {
        this.st.bullets.splice(i, 1);
        this.takeDamage('أصابتك موجة متخاطة! تفادَ بالاندفاع [✕ / Space]', this.mapX(this.st.px, wave.domain), this.mapY(this.st.py, wave.domain));
      }
    }
  }

  updateSqueeze(dt, inp, moveY, wave) {
    this.st.scrollT += dt;
    if (this.st.shieldTimer > 0) this.st.shieldTimer -= dt;
    const span = wave.yMax - wave.yMin;

    if (this.inputMode === 'pointer') {
      const ty = this.unmapRangeY(this.pointer.y, wave.yMin, wave.yMax);
      this.st.centerY += (clamp(ty, wave.yMin + span * 0.1, wave.yMax - span * 0.1) - this.st.centerY) * Math.min(1, dt * 11);
    } else {
      this.st.centerY = clamp(this.st.centerY - moveY * span * 0.48 * dt, wave.yMin + span * 0.1, wave.yMax - span * 0.1);
    }

    const gapDelta = (inp.r2 - inp.l2) + (this.keys.ArrowRight || this.keys.KeyD ? 1 : 0) - (this.keys.ArrowLeft || this.keys.KeyA ? 1 : 0);
    if (Math.abs(gapDelta) > 0.02) {
      const minG = this.st.subMode === 'heron' ? 0.08 : 0.18;
      const maxG = this.st.subMode === 'heron' ? 0.5 : 1.45;
      this.st.halfGap = clamp(this.st.halfGap + gapDelta * (this.st.subMode === 'heron' ? 0.45 : 1.15) * dt, minG, maxG);
    }

    const shipX = this.w * 0.25;
    const shipY = this.mapRangeY(this.st.centerY, wave.yMin, wave.yMax);

    if (this.st.subMode === 'squeeze') {
      this.st.gateTimer -= dt;
      if (this.st.gateTimer <= 0) {
        this.st.gateTimer = 2.05;
        if (Math.random() < 0.36) {
          this.st.meteors.push({
            x: this.w + 30,
            y: this.mapRangeY(1.2 + Math.random() * 2.6, wave.yMin, wave.yMax),
            vx: -(205 + this.waveHits * 10),
            label: 'u_n ≥ 2√n'
          });
        } else {
          const L = Number((1.4 + Math.random() * 2.2).toFixed(1));
          const reqAmp = Number((0.28 + Math.random() * 0.36).toFixed(2));
          this.st.gates.push({
            x: this.w + 42,
            L,
            reqAmp,
            vx: -(170 + this.waveHits * 8),
            expr: `|u_n - ${L.toFixed(1)}| ≤ ${reqAmp.toFixed(1)}`
          });
        }
      }

      for (let i = this.st.gates.length - 1; i >= 0; i -= 1) {
        const g = this.st.gates[i];
        g.x += g.vx * dt;
        if (g.x < shipX + 16 && g.x > shipX - 16) {
          const distL = Math.abs(this.st.centerY - g.L);
          const gapOk = this.st.halfGap >= g.reqAmp * 0.82 && this.st.halfGap <= g.reqAmp + 0.48;
          this.st.gates.splice(i, 1);
          if (distL <= 0.62 && gapOk) {
            this.setTape(`حصر مثالي: ${g.L.toFixed(1)} − ${this.st.halfGap.toFixed(2)} ≤ uₙ ≤ ${g.L.toFixed(1)} + ${this.st.halfGap.toFixed(2)}`);
            this.awardHit(140, shipX, shipY, '#34d399', `حصر الدركيين عند L = ${g.L.toFixed(1)} ✓`);
          } else {
            this.takeDamage(distL > 0.62 ? `مركِز المركبة عند L = ${g.L.toFixed(1)}!` : 'اضبط فكّي الدركيين [L2 · R2 أو ◀ ▶]!', shipX, shipY);
          }
          continue;
        }
        if (g.x < -40) this.st.gates.splice(i, 1);
      }

      for (let i = this.st.meteors.length - 1; i >= 0; i -= 1) {
        const m = this.st.meteors[i];
        m.x += m.vx * dt;
        if (Math.hypot(m.x - shipX, m.y - shipY) < 42) {
          this.st.meteors.splice(i, 1);
          if (this.st.shieldTimer > 0) {
            this.audio.playDeflect();
            this.awardHit(145, shipX, shipY, '#38bdf8', 'تدمير شهاب المقارنة uₙ ≥ 2√n → +∞ ✓');
          } else {
            this.takeDamage('اصطدمت بشهاب المقارنة +∞! فعّل الدرع [▢ / Space]', shipX, shipY);
          }
          continue;
        }
        if (m.x < -40) this.st.meteors.splice(i, 1);
      }
    } else if (this.st.subMode === 'composite') {
      if (this.st.portals.length === 0) {
        this.st.gateTimer -= dt;
        if (this.st.gateTimer <= 0) {
          this.spawnCompositePortal(wave);
        }
      }
      for (let i = this.st.portals.length - 1; i >= 0; i -= 1) {
        const p = this.st.portals[i];
        p.x += p.vx * dt;
        if (p.x <= shipX + 18 && p.x >= shipX - 18) {
          this.st.portals.splice(i, 1);
          this.st.gateTimer = 0.65;
          if (Math.abs(this.st.centerY - p.answer) <= 0.56) {
            this.awardHit(165, shipX, shipY, '#34d399', `مركّب متصلة صحيح: ${p.explain}`);
          } else {
            this.takeDamage(`بوابة خاطئة! الصواب g(a) = ${p.answer} (${p.explain})`, shipX, shipY);
          }
          continue;
        }
        if (p.x < -50) this.st.portals.splice(i, 1);
      }
    } else if (this.st.subMode === 'heron') {
      for (let i = this.st.rings.length - 1; i >= 0; i -= 1) {
        const r = this.st.rings[i];
        r.x += r.vx * dt;
        if (r.x < shipX - 42) {
          // Loop ring back smoothly if player missed timing, with gentle damage
          r.x = this.w * 0.88;
          this.takeDamage('فاتتك حلقة هيرون! اضغط [▢ / Space] عند عبور خط المركبة!', shipX, shipY);
        }
      }
    }
  }

  // ---------- Rendering ----------
  drawRich(expr, x, y, opts) {
    const AK = window.ArcadeCore?.CanvasAxisKit;
    if (AK && AK.drawMathRich) AK.drawMathRich(this.ctx, expr, x, y, opts);
    else {
      this.ctx.fillStyle = opts?.color || '#ecfdf5';
      this.ctx.fillText(expr, x, y);
    }
  }

  drawAstrolabeBackdrop() {
    const ctx = this.ctx;
    ctx.fillStyle = '#030e0c';
    ctx.fillRect(0, 0, this.w, this.h);

    // Subtle Emerald Astrolabe concentric degree arcs
    const cx = this.w * 0.52;
    const cy = this.h * 0.52;
    const maxR = Math.min(this.w, this.h) * 0.62;
    ctx.save();
    ctx.strokeStyle = 'rgba(230, 185, 92, 0.07)';
    ctx.lineWidth = 1;
    for (let k = 1; k <= 3; k += 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, maxR * (k / 3), 0, Math.PI * 2);
      ctx.stroke();
    }
    // Fine emerald coordinate mesh
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.065)';
    ctx.beginPath();
    for (let x = 36; x < this.w; x += 36) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.h);
    }
    for (let y = 36; y < this.h; y += 36) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.w, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  drawCartesianPlane(domain, tickStep = 1) {
    const ctx = this.ctx;
    const toX = (v) => this.mapX(v, domain);
    const toY = (v) => this.mapY(v, domain);
    const left = toX(domain.min);
    const right = toX(domain.max);
    const bot = toY(domain.min);
    const top = toY(domain.max);

    ctx.save();
    // Minor grid aligned to integer coordinates
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startT = Math.ceil(domain.min / tickStep) * tickStep;
    for (let v = startT; v <= domain.max + 0.001; v += tickStep) {
      const gx = toX(v);
      const gy = toY(v);
      ctx.moveTo(gx, top);
      ctx.lineTo(gx, bot);
      ctx.moveTo(left, gy);
      ctx.lineTo(right, gy);
    }
    ctx.stroke();

    // Main numbered axes with brass-ivory stroke
    ctx.strokeStyle = 'rgba(230, 185, 92, 0.62)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(left, bot);
    ctx.lineTo(right + 10, bot);
    ctx.moveTo(left, bot);
    ctx.lineTo(left, top - 10);
    ctx.stroke();

    // Arrowheads
    ctx.fillStyle = 'rgba(230, 185, 92, 0.85)';
    ctx.beginPath();
    ctx.moveTo(right + 14, bot);
    ctx.lineTo(right + 5, bot - 4);
    ctx.lineTo(right + 5, bot + 4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(left, top - 14);
    ctx.lineTo(left - 4, top - 5);
    ctx.lineTo(left + 4, top - 5);
    ctx.closePath();
    ctx.fill();

    // Ticks & Numbers
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94b8ad';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let v = startT; v <= domain.max + 0.001; v += tickStep) {
      const gx = toX(v);
      ctx.beginPath();
      ctx.moveTo(gx, bot - 4);
      ctx.lineTo(gx, bot + 4);
      ctx.stroke();
      ctx.fillText(Number.isInteger(v) ? String(v) : v.toFixed(1), gx, bot + 8);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let v = startT; v <= domain.max + 0.001; v += tickStep) {
      if (Math.abs(v - domain.min) < 0.01) continue;
      const gy = toY(v);
      ctx.beginPath();
      ctx.moveTo(left - 4, gy);
      ctx.lineTo(left + 4, gy);
      ctx.stroke();
      ctx.fillText(Number.isInteger(v) ? String(v) : v.toFixed(1), left - 9, gy);
    }

    this.drawRich('u_n', right + 2, bot - 14, { color: '#e6b95c', fontSize: 12, align: 'right' });
    this.drawRich('u_{n+1}', left + 26, top - 6, { color: '#e6b95c', fontSize: 12, align: 'left' });
    ctx.restore();
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    if (this.shake > 0) {
      const mag = (this.shake / 0.28) * 7;
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    this.drawAstrolabeBackdrop();

    const stage = this.getStage();
    const wave = this.getWave();
    if (stage.mode === 'induction-catcher') this.renderInduction(wave);
    else if (stage.mode === 'monotone-shooter') this.renderMonotone(wave);
    else if (stage.mode === 'rhythm-race') {
      if (this.st.subMode === 'sorter') this.renderSorter();
      else this.renderFunctionRace(wave);
    } else if (stage.mode === 'homographic-boss') this.renderHomographic(wave);
    else if (stage.mode === 'squeeze-tunnel') this.renderSqueeze(wave);

    // Tapering motion trail
    for (let i = 0; i < this.trail.length; i += 1) {
      const tr = this.trail[i];
      if (tr.life <= 0) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(0, (tr.life / 0.25) * 0.45);
      ctx.fillStyle = this.combo >= 4 ? '#e6b95c' : '#34d399';
      ctx.beginPath();
      ctx.arc(tr.x, tr.y, 2 + (i / this.trail.length) * 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Beams
    for (const b of this.beams) {
      ctx.save();
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = Math.max(0, b.life / (b.maxLife || 0.3));
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();
      ctx.restore();
    }

    // Shockwave rings
    for (const r of this.rings) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, (r.life / r.maxLife) * 0.85);
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r || 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Screen-edge hit flash
    if (this.hitFlash > 0) {
      ctx.save();
      ctx.strokeStyle = `rgba(251, 113, 133, ${(this.hitFlash / 0.32) * 0.65})`;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, this.w - 10, this.h - 10);
      ctx.restore();
    }

    // Combo overdrive subtle border glow (zero shadowBlur!)
    if (this.combo >= 4) {
      ctx.save();
      ctx.strokeStyle = `rgba(230, 185, 92, ${0.24 + Math.sin(this.clock * 8) * 0.12})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, this.w - 4, this.h - 4);
      ctx.restore();
    }

    ctx.restore();
  }

  renderInduction(wave) {
    const ctx = this.ctx;
    const d = wave.domain;
    const toX = (v) => this.mapX(v, d);
    const toY = (v) => this.mapY(v, d);

    this.drawCartesianPlane(d, 1);

    // Subtle shaded invariant square [0, M] or [m, 6]
    const bVal = this.st.boundVal;
    const bx = toX(bVal);
    const by = toY(bVal);
    ctx.save();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    if (wave.boundType === 'upper') {
      ctx.fillRect(toX(0), by, bx - toX(0), toY(0) - by);
    } else {
      ctx.fillRect(bx, toY(d.max), toX(d.max) - bx, by - toY(d.max));
    }
    ctx.restore();

    // Bisector y = x
    ctx.save();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = 'rgba(230, 185, 92, 0.78)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(toX(d.min), toY(d.min));
    ctx.lineTo(toX(d.max), toY(d.max));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    this.drawRich('y = x', toX(1.35), toY(0.95), { color: '#e6b95c', fontSize: 12 });

    // Curve y = f(x)
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    for (let i = 0; i <= 90; i += 1) {
      const xv = d.min + (i / 90) * (d.max - d.min);
      const px = toX(xv);
      const py = toY(wave.f(xv));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    this.drawRich('y = f(x)', toX(5.15), toY(wave.f(5.15)) - 16, { color: '#5eead4', fontSize: 12 });

    // Fixed point marker L (placed cleanly below the intersection away from curve)
    const lx = toX(wave.boundTarget);
    const ly = toY(wave.boundTarget);
    ctx.strokeStyle = '#e6b95c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(lx, ly, 6.5, 0, Math.PI * 2);
    ctx.stroke();
    this.drawRich(`L = ${wave.boundTarget}`, lx + 24, ly + 18, { color: '#fde68a', fontSize: 11 });

    // Adjustable Bound Laser M or m
    const boundGood = Math.abs(bVal - wave.boundTarget) <= 0.65;
    ctx.strokeStyle = boundGood ? '#34d399' : '#f59e0b';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    if (wave.boundType === 'upper') {
      ctx.moveTo(toX(0), by);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx, toY(0));
    } else {
      ctx.moveTo(bx, toY(d.max));
      ctx.lineTo(bx, by);
      ctx.lineTo(toX(d.max), by);
    }
    ctx.stroke();
    const lblX = toX(0) + 10;
    ctx.fillStyle = 'rgba(4, 18, 15, 0.9)';
    ctx.beginPath();
    ctx.roundRect(lblX - 4, by - 24, 74, 20, 6);
    ctx.fill();
    this.drawRich(`${wave.boundLabel} = ${bVal.toFixed(2)}`, lblX + 33, by - 14, {
      color: boundGood ? '#6ee7b7' : '#fde68a',
      fontSize: 11
    });

    // Live cobweb proofs from caught safe seeds
    for (const cw of this.cobwebs) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, cw.life / cw.maxLife);
      ctx.strokeStyle = cw.color || '#34d399';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      let u = cw.u0;
      ctx.moveTo(toX(u), toY(0));
      for (let k = 0; k < 5; k += 1) {
        const nu = cw.f(u);
        ctx.lineTo(toX(u), toY(nu));
        ctx.lineTo(toX(nu), toY(nu));
        u = nu;
      }
      ctx.stroke();
      ctx.restore();
    }

    // Falling Seed Pearls — UNIFORM IVORY-GOLD (ZERO COLOR SPOILERS!)
    for (const o of this.st.orbs) {
      const px = toX(o.x);
      const py = toY(o.y);
      ctx.fillStyle = '#0c2620';
      ctx.beginPath();
      ctx.arc(px, py, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e6b95c';
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.fillStyle = '#ecfdf5';
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      this.drawRich(`u_0 = ${o.x.toFixed(1)}`, px, py - 24, { color: '#fef3c7', fontSize: 12 });
    }

    // Astrolabe Catcher Paddle
    const px = toX(this.st.paddleX);
    const py = toY(0.32);
    ctx.fillStyle = this.st.shieldTimer > 0 ? '#38bdf8' : '#e6b95c';
    ctx.beginPath();
    ctx.roundRect(px - 44, py - 8, 88, 16, 8);
    ctx.fill();
    ctx.strokeStyle = '#ecfdf5';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    if (this.st.shieldTimer > 0) {
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px, py, 50, Math.PI, 0);
      ctx.stroke();
    }
  }

  renderMonotone(wave) {
    const ctx = this.ctx;
    const d = wave.domain;
    const toX = (v) => this.mapX(v, d);
    const toY = (v) => this.mapY(v, d);

    this.drawCartesianPlane(d, 1);

    // Bisector y = x
    ctx.save();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = 'rgba(230, 185, 92, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toX(d.min), toY(d.min));
    ctx.lineTo(toX(d.max), toY(d.max));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    this.drawRich('y = x', toX(d.max - 0.35), toY(d.max - 0.15), { color: '#e6b95c', fontSize: 12 });

    // Curve y = f(x)
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    for (let i = 0; i <= 90; i += 1) {
      const xv = d.min + (i / 90) * (d.max - d.min);
      const yv = clamp(wave.f(xv), d.min, d.max);
      if (i === 0) ctx.moveTo(toX(xv), toY(yv));
      else ctx.lineTo(toX(xv), toY(yv));
    }
    ctx.stroke();
    this.drawRich('y = f(x)', toX(d.min + 0.45), toY(wave.f(d.min + 0.45)) - 16, { color: '#5eead4', fontSize: 12 });

    // Fixed points α, β markers
    [wave.alpha, wave.beta].forEach((pt, idx) => {
      const fx = toX(pt);
      const fy = toY(pt);
      ctx.fillStyle = '#04120f';
      ctx.beginPath();
      ctx.arc(fx, fy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e6b95c';
      ctx.lineWidth = 2;
      ctx.stroke();
      this.drawRich(idx === 0 ? `α=${pt}` : `β=${pt}`, fx + 20, fy + 14, { color: '#fde68a', fontSize: 11 });
    });

    // Post-hit cobweb staircases
    for (const cw of this.cobwebs) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, cw.life / cw.maxLife);
      ctx.strokeStyle = cw.color;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      let u = cw.u0;
      ctx.moveTo(toX(u), toY(cw.f(u)));
      for (let k = 0; k < 5; k += 1) {
        const nu = clamp(cw.f(u), d.min, d.max);
        ctx.lineTo(toX(nu), toY(nu));
        const n2 = clamp(cw.f(nu), d.min, d.max);
        ctx.lineTo(toX(nu), toY(n2));
        u = nu;
      }
      ctx.stroke();
      ctx.restore();
    }

    // Vertical caliper line from locked orb to y = x (lets player see f(x) - x visually!)
    if (this.st.lockedOrb) {
      const lo = this.st.lockedOrb;
      const lx = toX(lo.x);
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#ecfdf5';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(lx, toY(lo.y));
      ctx.lineTo(lx, toY(lo.x));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Orbs — UNIFORM STARLIGHT-SILVER (ZERO COLOR SPOILERS!)
    for (const o of this.st.orbs) {
      const ox = toX(o.x);
      const oy = toY(o.y);
      const isLocked = o === this.st.lockedOrb;
      const lifeRatio = clamp(o.life / o.maxLife, 0, 1);

      // Countdown ring
      ctx.strokeStyle = lifeRatio < 0.3 ? '#fb7185' : 'rgba(230, 185, 92, 0.72)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(ox, oy, 20, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * lifeRatio);
      ctx.stroke();

      ctx.fillStyle = isLocked ? '#133a31' : '#0a221d';
      ctx.beginPath();
      ctx.arc(ox, oy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isLocked ? '#ecfdf5' : '#94b8ad';
      ctx.lineWidth = isLocked ? 2.6 : 1.8;
      ctx.stroke();

      ctx.fillStyle = '#ecfdf5';
      ctx.beginPath();
      ctx.arc(ox, oy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      this.drawRich(`u_0=${o.x.toFixed(1)}`, ox, oy - 28, { color: '#ecfdf5', fontSize: 11 });
    }

    // Player Astrolabe Reticle
    const px = toX(this.st.px);
    const py = toY(this.st.py);
    ctx.strokeStyle = this.st.dashTime > 0 ? '#34d399' : '#e6b95c';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(px, py, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px - 22, py);
    ctx.lineTo(px - 10, py);
    ctx.moveTo(px + 10, py);
    ctx.lineTo(px + 22, py);
    ctx.moveTo(px, py - 22);
    ctx.lineTo(px, py - 10);
    ctx.moveTo(px, py + 10);
    ctx.lineTo(px, py + 22);
    ctx.stroke();
  }

  renderSorter() {
    const ctx = this.ctx;
    const compact = this.w < 540;
    const hitY = this.h - (compact ? 114 : 124);
    const cx = this.w * 0.5;
    const chuteHalf = compact ? 62 : 78;
    const laneCols = ['#10b981', '#e6b95c', '#fb7185'];
    const laneTitles = compact
      ? ['→ 0', '→ L ≠ 0', '→ ±∞']
      : ['→ 0  (|q| < 1)', '→ L ≠ 0  (ثابتة)', '→ ±∞  / متباعدة'];

    // Central Astrolabe Drop Chute
    ctx.fillStyle = 'rgba(16, 185, 129, 0.06)';
    ctx.fillRect(cx - chuteHalf, 12, chuteHalf * 2, hitY - 22);
    ctx.strokeStyle = 'rgba(230, 185, 92, 0.32)';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(cx - chuteHalf, 12, chuteHalf * 2, hitY - 22);

    // Subtle animated downward flow chevrons inside chute
    ctx.save();
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.22)';
    ctx.lineWidth = 1.8;
    const flowOff = (this.clock * 44) % 44;
    for (let cy = 28 + flowOff; cy < hitY - 26; cy += 44) {
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 5);
      ctx.lineTo(cx, cy + 5);
      ctx.lineTo(cx + 12, cy - 5);
      ctx.stroke();
    }
    ctx.restore();

    // Curved Magnetic Diverter Rail from chute bottom to active bin!
    const activeBinX = ((this.st.lane + 0.5) / 3) * this.w;
    ctx.save();
    ctx.strokeStyle = laneCols[this.st.lane];
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx, hitY - 22);
    ctx.quadraticCurveTo(cx, hitY + 2, activeBinX, hitY + 14);
    ctx.stroke();
    ctx.restore();

    // 3 Target Limit Bins (lifted cleanly above bottom toast zone!)
    const binH = compact ? 50 : 58;
    for (let l = 0; l < 3; l += 1) {
      const x0 = (l / 3) * this.w + (compact ? 5 : 10);
      const bw = this.w / 3 - (compact ? 10 : 20);
      const active = this.st.lane === l;
      ctx.fillStyle = active ? 'rgba(16, 185, 129, 0.22)' : 'rgba(6, 22, 19, 0.88)';
      ctx.beginPath();
      ctx.roundRect(x0, hitY + 14, bw, binH, 12);
      ctx.fill();
      ctx.strokeStyle = active ? laneCols[l] : 'rgba(148, 184, 173, 0.28)';
      ctx.lineWidth = active ? 2.8 : 1.2;
      ctx.stroke();
      this.drawRich(laneTitles[l], x0 + bw * 0.5, hitY + 14 + binH * 0.5, { color: active ? '#ecfdf5' : laneCols[l], fontSize: compact ? 12 : 13 });
    }

    // Animated routed beams
    for (const rt of this.st.routed) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, rt.life / rt.maxLife);
      ctx.strokeStyle = rt.color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(rt.x1, rt.y1);
      ctx.lineTo(rt.x2, rt.y2);
      ctx.stroke();
      ctx.restore();
    }

    // Hit line across chute
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - chuteHalf - 8, hitY - 12);
    ctx.lineTo(cx + chuteHalf + 8, hitY - 12);
    ctx.stroke();

    // Falling Formula Capsules — UNIFORM NEUTRAL ASTROLABE BRASS (ZERO COLOR SPOILERS!)
    const capHalf = compact ? 54 : 68;
    for (const n of this.st.notes) {
      ctx.fillStyle = '#09241e';
      ctx.beginPath();
      ctx.roundRect(cx - capHalf, n.y - 19, capHalf * 2, 38, 10);
      ctx.fill();
      ctx.strokeStyle = '#e6b95c';
      ctx.lineWidth = 2;
      ctx.stroke();
      this.drawRich(n.label, cx, n.y, { color: '#ecfdf5', fontSize: compact ? 13 : 14 });
    }

    // Sum Nova Charge Gauge (compact-safe position on left with crisp visible track)
    const gx = compact ? 8 : 20;
    const gy = compact ? 14 : 24;
    const gw = compact ? Math.max(82, cx - chuteHalf - 16) : 146;
    ctx.fillStyle = 'rgba(4, 18, 15, 0.92)';
    ctx.beginPath();
    ctx.roundRect(gx, gy, gw, 48, 10);
    ctx.fill();
    ctx.strokeStyle = this.st.sumCharge >= 100 ? '#fbbf24' : 'rgba(230, 185, 92, 0.42)';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    this.drawRich(compact ? `S_n ${this.st.sumCharge}%` : (this.st.sumKind === 'geo' ? `S_n (هندسي) ${this.st.sumCharge}%` : `S_n (حسابي) ${this.st.sumCharge}%`), gx + gw * 0.5, gy + 15, { color: '#fde68a', fontSize: 10.5 });
    ctx.fillStyle = '#03100d';
    ctx.fillRect(gx + 10, gy + 30, gw - 20, 9);
    ctx.strokeStyle = 'rgba(230, 185, 92, 0.35)';
    ctx.lineWidth = 1;
    ctx.strokeRect(gx + 10, gy + 30, gw - 20, 9);
    ctx.fillStyle = this.st.sumCharge >= 100 ? '#fbbf24' : '#34d399';
    ctx.fillRect(gx + 10, gy + 30, ((gw - 20) * this.st.sumCharge) / 100, 9);
  }

  renderFunctionRace(wave) {
    const ctx = this.ctx;
    const compact = this.w < 580;
    const duel = wave.duels[this.st.duelIdx % wave.duels.length];
    const padX = compact ? 10 : 24;
    const fortW = compact ? Math.min(92, this.w * 0.25) : Math.min(132, this.w * 0.19);
    const fortX = this.w - padX - fortW;
    const topY = compact ? 54 : this.h * 0.22;
    const laneH = compact ? Math.min(94, (this.h - 82) * 0.44) : Math.min(112, this.h * 0.3);
    const botY = topY + laneH + (compact ? 14 : 22);

    // Header Banner inside arena
    ctx.fillStyle = 'rgba(5, 22, 19, 0.92)';
    ctx.beginPath();
    ctx.roundRect(padX, 10, this.w - padX * 2, 34, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(230, 185, 92, 0.4)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.font = `800 ${compact ? 11 : 13}px "Cairo", sans-serif`;
    ctx.fillStyle = '#fef3c7';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const timerTxt = this.st.phase === 'choose' ? ` • ⏳ ${this.st.chooseTimer.toFixed(1)}s` : ` • n=${Math.max(0, this.st.clashStep)}/${duel.rankN}`;
    ctx.fillText(`${duel.title}${timerTxt}`, this.w * 0.5, 27);

    // Draw 2 Launcher Bays (Top: Arithmetic u_n, Bottom: Geometric v_n)
    const bays = [
      { key: 'arith', y: topY, title: 'المدفع الحسابي', expr: duel.arithExpr, val: this.st.arithDmg, color: '#e6b95c' },
      { key: 'geo', y: botY, title: 'المدفع الهندسي', expr: duel.geoExpr, val: this.st.geoDmg, color: '#34d399' }
    ];
    const bayW = fortX - padX - (compact ? 10 : 22);
    const cannonW = compact ? Math.min(126, bayW * 0.54) : 176;

    for (const bay of bays) {
      const selected = this.st.pick === bay.key;
      ctx.fillStyle = selected ? 'rgba(16, 185, 129, 0.16)' : 'rgba(6, 22, 19, 0.85)';
      ctx.beginPath();
      ctx.roundRect(padX, bay.y, bayW, laneH, 12);
      ctx.fill();
      ctx.strokeStyle = selected ? bay.color : 'rgba(148, 184, 173, 0.24)';
      ctx.lineWidth = selected ? 2.8 : 1.2;
      ctx.stroke();

      // Cannon Box
      ctx.fillStyle = '#04120f';
      ctx.beginPath();
      ctx.roundRect(padX + 8, bay.y + 8, cannonW, laneH - 16, 9);
      ctx.fill();
      ctx.strokeStyle = bay.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = `800 ${compact ? 10 : 12}px "Cairo", sans-serif`;
      ctx.fillStyle = bay.color;
      ctx.textAlign = 'center';
      ctx.fillText(selected ? `★ ${bay.title}` : bay.title, padX + 8 + cannonW * 0.5, bay.y + 22);
      this.drawRich(bay.expr, padX + 8 + cannonW * 0.5, bay.y + laneH * 0.62, { color: '#ecfdf5', fontSize: compact ? 11 : 13 });

      // Live Power Progress Bar racing toward HP
      const barX = padX + cannonW + 16;
      const barW = Math.max(46, padX + bayW - barX - 10);
      const barY = bay.y + laneH * 0.5 - 11;
      ctx.fillStyle = '#03100d';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, 22, 8);
      ctx.fill();
      const fillPct = clamp(bay.val / Math.max(1, duel.hp), 0, 1);
      ctx.fillStyle = bay.color;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW * fillPct, 22, 8);
      ctx.fill();
      ctx.font = `800 ${compact ? 10 : 12}px "JetBrains Mono", monospace`;
      ctx.fillStyle = '#ecfdf5';
      ctx.textAlign = 'center';
      ctx.fillText(this.st.phase === 'choose' ? `n=${duel.rankN}?` : `${bay.val.toFixed(0)}/${duel.hp}`, barX + barW * 0.5, barY + 11);
    }

    // Right Layered Energy Fortress (Target HP)
    const fortTop = topY;
    const fortH = (botY + laneH) - topY;
    ctx.fillStyle = this.st.fortressCrack > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 113, 133, 0.12)';
    ctx.beginPath();
    ctx.roundRect(fortX, fortTop, fortW, fortH, 14);
    ctx.fill();
    ctx.strokeStyle = this.st.fortressCrack > 0 ? '#34d399' : '#fb7185';
    ctx.lineWidth = 2.6;
    ctx.stroke();

    // Armor strata lines inside fortress
    ctx.strokeStyle = 'rgba(251, 113, 133, 0.35)';
    ctx.lineWidth = 1.4;
    for (let s = 1; s < 5; s += 1) {
      const sy = fortTop + (fortH * s) / 5;
      ctx.beginPath();
      ctx.moveTo(fortX + 8, sy);
      ctx.lineTo(fortX + fortW - 8, sy);
      ctx.stroke();
    }
    ctx.font = `900 ${compact ? 11 : 13}px "Cairo", sans-serif`;
    ctx.fillStyle = '#fecdd3';
    ctx.textAlign = 'center';
    ctx.fillText('برج HP', fortX + fortW * 0.5, fortTop + fortH * 0.36);
    ctx.font = `900 ${compact ? 17 : 22}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#ecfdf5';
    ctx.fillText(`${duel.hp}`, fortX + fortW * 0.5, fortTop + fortH * 0.54);
    ctx.font = `700 ${compact ? 10 : 12}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#fde68a';
    ctx.fillText(`n = ${duel.rankN}`, fortX + fortW * 0.5, fortTop + fortH * 0.68);

    // Physical Volley Projectiles
    for (const pr of this.st.projectiles) {
      ctx.fillStyle = pr.color;
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, pr.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderHomographic(wave) {
    const ctx = this.ctx;
    const d = wave.domain;
    const toX = (v) => this.mapX(v, d);
    const toY = (v) => this.mapY(v, d);

    this.drawCartesianPlane(d, 1);

    // Bisector y = x
    ctx.save();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = 'rgba(230, 185, 92, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toX(d.min), toY(d.min));
    ctx.lineTo(toX(d.max), toY(d.max));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    this.drawRich('y = x', toX(d.max - 0.32), toY(d.max - 0.14), { color: '#e6b95c', fontSize: 12 });

    // Curve y = f(x)
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= 100; i += 1) {
      const xv = d.min + (i / 100) * (d.max - d.min);
      const yv = wave.f(xv);
      if (yv < d.min - 0.5 || yv > d.max + 0.5) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(toX(xv), toY(clamp(yv, d.min, d.max)));
        started = true;
      } else {
        ctx.lineTo(toX(xv), toY(clamp(yv, d.min, d.max)));
      }
    }
    ctx.stroke();
    this.drawRich('y = f(x)', toX(d.max - 0.55), toY(clamp(wave.f(d.max - 0.55), d.min, d.max)) - 16, { color: '#5eead4', fontSize: 12 });

    // Uniform neutral candidate rings along y = x (ZERO SPOILER HIGHLIGHT! Locked targets get ✓ glow)
    for (const c of wave.candidates) {
      const cx = toX(c);
      const cy = toY(c);
      const lockedIdx = wave.fixedTargets.findIndex((t, i) => t.x === c && this.st.lockedTargets.has(i));
      const isLocked = lockedIdx >= 0;
      ctx.strokeStyle = isLocked ? '#34d399' : 'rgba(148, 184, 173, 0.52)';
      ctx.lineWidth = isLocked ? 2.6 : 1.8;
      ctx.beginPath();
      ctx.arc(cx, cy, isLocked ? 15 : 13, 0, Math.PI * 2);
      ctx.stroke();
      this.drawRich(isLocked ? `✓ (${c},${c})` : `(${c},${c})`, cx + 22, cy + 16, { color: isLocked ? '#6ee7b7' : '#94b8ad', fontSize: 10 });
    }

    // Auxiliary Lens Boss Core Banner when phase === 'aux'
    if (this.st.phase === 'aux') {
      const bx = this.w * 0.5;
      const by = 44;
      ctx.fillStyle = 'rgba(8, 30, 26, 0.94)';
      ctx.beginPath();
      ctx.roundRect(bx - 165, by - 20, 330, 40, 12);
      ctx.fill();
      ctx.strokeStyle = '#e6b95c';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.font = '800 13px "Cairo", sans-serif';
      ctx.fillStyle = '#fef3c7';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('اختر العدسة المساعدة: [△] هندسية • [◯] حسابية', bx, by);
    }

    // Spiral Homographic Bullets
    for (const b of this.st.bullets) {
      const bx = toX(b.x);
      const by = toY(b.y);
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(bx, by, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffe4e6';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // Player Sniper Reticle
    const px = toX(this.st.px);
    const py = toY(this.st.py);
    ctx.strokeStyle = this.st.dashTime > 0 ? '#34d399' : '#ecfdf5';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(px, py, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px - 20, py);
    ctx.lineTo(px + 20, py);
    ctx.moveTo(px, py - 20);
    ctx.lineTo(px, py + 20);
    ctx.stroke();
  }

  renderSqueeze(wave) {
    const ctx = this.ctx;
    const toY = (yv) => this.mapRangeY(yv, wave.yMin, wave.yMax);
    const shipX = this.w * 0.25;
    const shipY = toY(this.st.centerY);

    // Numbered vertical axis on left
    const axX = 48;
    ctx.save();
    ctx.strokeStyle = 'rgba(230, 185, 92, 0.65)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(axX, 18);
    ctx.lineTo(axX, this.h - 22);
    ctx.stroke();

    const step = this.st.subMode === 'heron' ? 0.2 : 1;
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94b8ad';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let v = wave.yMin; v <= wave.yMax + 0.001; v += step) {
      const y = toY(v);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(axX, y);
      ctx.lineTo(this.w - 14, y);
      ctx.stroke();
      ctx.fillText(step < 1 ? v.toFixed(1) : String(Math.round(v)), axX - 8, y);
    }
    ctx.restore();

    if (this.st.subMode === 'squeeze' || this.st.subMode === 'heron') {
      const topY = toY(this.st.centerY + this.st.halfGap);
      const botY = toY(this.st.centerY - this.st.halfGap);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.13)';
      ctx.fillRect(axX, topY, this.w - axX, botY - topY);
      ctx.strokeStyle = '#e6b95c';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(axX, topY);
      ctx.lineTo(this.w, topY);
      ctx.moveTo(axX, botY);
      ctx.lineTo(this.w, botY);
      ctx.stroke();
      this.drawRich('w_n', axX + 26, topY - 11, { color: '#fde68a', fontSize: 12 });
      this.drawRich('v_n', axX + 26, botY + 13, { color: '#fde68a', fontSize: 12 });
    }

    if (this.st.subMode === 'squeeze') {
      for (const g of this.st.gates) {
        const gy = toY(g.L);
        const halfPx = (g.reqAmp / (wave.yMax - wave.yMin)) * (this.h - 62);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.fillRect(g.x - 12, gy - halfPx, 24, halfPx * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.4;
        ctx.strokeRect(g.x - 12, gy - halfPx, 24, halfPx * 2);
        this.drawRich(`L = ${g.L.toFixed(1)}`, g.x, gy - halfPx - 14, { color: '#bae6fd', fontSize: 12 });
      }
      for (const m of this.st.meteors) {
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(m.x, m.y, 17, 0, Math.PI * 2);
        ctx.fill();
        this.drawRich('+∞', m.x, m.y, { color: '#ffffff', fontSize: 12 });
        this.drawRich(m.label, m.x, m.y - 24, { color: '#fecdd3', fontSize: 11 });
      }
    } else if (this.st.subMode === 'composite') {
      for (const p of this.st.portals) {
        // Problem callout pill centered safely to the right of axis
        const boxW = Math.min(310, this.w - axX - 24);
        const boxCx = axX + (this.w - axX) * 0.5;
        ctx.fillStyle = 'rgba(5, 22, 19, 0.94)';
        ctx.beginPath();
        ctx.roundRect(boxCx - boxW * 0.5, 14, boxW, 38, 10);
        ctx.fill();
        ctx.strokeStyle = '#e6b95c';
        ctx.lineWidth = 1.6;
        ctx.stroke();
        this.drawRich(p.expr, boxCx, 33, { color: '#fef3c7', fontSize: this.w < 460 ? 12 : 14 });

        // Barrier wall with 3 UNIFORM NEUTRAL CONDUITS (ZERO COLOR SPOILERS!)
        ctx.strokeStyle = 'rgba(230, 185, 92, 0.45)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p.x, 56);
        ctx.lineTo(p.x, this.h - 24);
        ctx.stroke();

        for (const val of p.ports) {
          const py = toY(val);
          ctx.fillStyle = '#07221c';
          ctx.beginPath();
          ctx.roundRect(p.x - 24, py - 24, 48, 48, 12);
          ctx.fill();
          ctx.strokeStyle = '#2dd4bf';
          ctx.lineWidth = 2.4;
          ctx.stroke();
          this.drawRich(String(val), p.x, py, { color: '#ecfdf5', fontSize: 16 });
        }
      }
    } else if (this.st.subMode === 'heron') {
      // Target √2 golden asymptote
      const sqY = toY(Math.SQRT2);
      ctx.save();
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = '#e6b95c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(axX, sqY);
      ctx.lineTo(this.w - 14, sqY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      this.drawRich('√2 ≈ 1.414', this.w - 76, sqY - 14, { color: '#fde68a', fontSize: 12 });

      for (const r of this.st.rings) {
        const ry = toY(r.step.val);
        const rad = Math.max(18, (r.step.reqGap / (wave.yMax - wave.yMin)) * (this.h - 62));
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(r.x, ry, rad, 0, Math.PI * 2);
        ctx.stroke();
        this.drawRich(r.step.label, r.x, ry - rad - 14, { color: '#bae6fd', fontSize: 13 });
      }
    }

    // Oscillating Sequence Spark Ship
    const oscAmp = this.st.subMode === 'composite' ? 4 : Math.min(18, (this.st.halfGap / (wave.yMax - wave.yMin)) * (this.h - 62) * 0.45);
    const oscY = shipY + Math.sin(this.st.scrollT * 8.5) * oscAmp;
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(shipX, oscY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ecfdf5';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    if (this.st.shieldTimer > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(shipX, shipY, 44, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new SequenceAstrolabeGame();
});
