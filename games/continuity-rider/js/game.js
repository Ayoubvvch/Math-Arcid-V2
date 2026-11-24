import { GAME_ID, SECTORS } from './tracks.js';

const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25, 783.99];

class SkaterSynth {
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

  tone(freq, dur = 0.09, type = 'triangle', vol = 0.08) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  }

  playJump(isDouble = false) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(isDouble ? 440 : 300, now);
    osc.frequency.exponentialRampToValueAtTime(isDouble ? 880 : 680, now + 0.12);
    g.gain.setValueAtTime(0.085, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  playScore(combo = 1) {
    const f = SCALE[Math.min(SCALE.length - 1, Math.max(0, combo - 1))];
    this.tone(f, 0.11, 'triangle', 0.085);
  }

  playCrash() {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(165, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.22);
    g.gain.setValueAtTime(0.09, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playWin() {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const t = now + idx * 0.06;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.085, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
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

class ContinuitySkaterGame {
  constructor() {
    this.canvas = document.getElementById('riderCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.frame = document.getElementById('canvasFrame');

    this.sectorNavEl = document.getElementById('sectorNav');
    this.gpBadgeEl = document.getElementById('gpBadge');
    this.hudScoreEl = document.getElementById('hudScore');
    this.hudComboEl = document.getElementById('hudCombo');
    this.hudHpEl = document.getElementById('hudHp');
    this.sectorBadgeEl = document.getElementById('sectorBadge');
    this.sectorTitleEl = document.getElementById('sectorTitle');
    this.sectorFormulaEl = document.getElementById('sectorFormula');
    this.sectorGoalEl = document.getElementById('sectorGoal');
    this.progressFillEl = document.getElementById('progressFill');
    this.toastEl = document.getElementById('toastBanner');
    this.deckButtonsEl = document.getElementById('deckButtons');
    this.deckHintEl = document.getElementById('deckHint');
    this.btnAudio = document.getElementById('btnAudio');
    this.btnPause = document.getElementById('btnPause');

    this.finishOverlay = document.getElementById('finishOverlay');
    this.endGlyphEl = document.getElementById('endGlyph');
    this.endTitleEl = document.getElementById('endTitle');
    this.endDescEl = document.getElementById('endDesc');
    this.endScoreEl = document.getElementById('endScore');
    this.endAccEl = document.getElementById('endAcc');
    this.endRankEl = document.getElementById('endRank');
    this.btnEndReplay = document.getElementById('btnEndReplay');
    this.btnEndNext = document.getElementById('btnEndNext');

    this.audio = new SkaterSynth();
    this.gpState = window.ArcadeCore?.Gamepad?.createState ? window.ArcadeCore.Gamepad.createState() : null;

    this.sectorIdx = 0;
    this.clearedSectors = new Set();
    this.score = 0;
    this.combo = 1;
    this.hp = 5;
    this.maxHp = 5;
    this.hits = 0;
    this.attempts = 0;
    this.correctHits = 0;
    this.paused = false;
    this.ended = false;

    this.keys = {};
    this.pointerY = null;
    this.particles = [];
    this.beams = [];
    this.toastTimer = 0;
    this.shake = 0;

    this.w = 880;
    this.h = 420;
    this.dpr = 1;
    this.lastTs = 0;

    // Real-time skater physics
    this.skater = {
      screenX: 170,
      worldX: 0,
      y: 200,
      vy: 0,
      jumpsLeft: 2,
      coyote: 0,
      grounded: true,
      speed: 245,
      pitch: 0, // used in asymptote surfing
      mirrored: false, // used in inverse mirror flip
      invuln: 0,
      trail: []
    };

    this.obstacles = [];
    this.crystals = [];
    this.spawnTimer = 0.8;

    this.pauseMenu = window.ArcadeCore?.PauseMenu?.attach({
      title: 'متزلّج الاتصال — إيقاف مؤقت',
      subtitle: 'سباق النهايات و TVI (الدرس 1 • 2BAC PC)',
      controlsHelp: [
        '🎮 عصا اليسار / ◀▶ / A-D: تسارع/فرملة • ▲▼ / W-S: زاوية لوح المقارب',
        '✕ / Space: قفز وقفز مزدوج فوق الفجوات ومدرّج E(x)',
        '▢ / △ / ◯: إطلاق أشعة التعميل / المرافق / المثلثية (أو قلب y=x)',
        'L2 / R2 (أو Q / E): شطر مجال TVI • L1 / R1: تبديل المضمار • Options / Esc: القائمة'
      ],
      gpState: this.gpState,
      onPause: () => { this.paused = true; },
      onResume: () => { this.paused = false; this.lastTs = performance.now(); },
      onRestart: () => { this.restartAll(); }
    });

    this.setupResize();
    this.bindEvents();
    this.loadSector(0);
    requestAnimationFrame((ts) => this.loop(ts));
  }

  setupResize() {
    const sync = () => {
      if (!this.frame || !this.canvas) return;
      const r = this.frame.getBoundingClientRect();
      const w = Math.max(320, Math.floor(r.width));
      const h = Math.max(240, Math.floor(r.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (w !== this.w || h !== this.h || dpr !== this.dpr) {
        this.w = w;
        this.h = h;
        this.dpr = dpr;
        this.canvas.width = Math.floor(w * dpr);
        this.canvas.height = Math.floor(h * dpr);
        this.skater.screenX = Math.min(210, Math.round(w * 0.22));
      }
    };
    sync();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(sync).observe(this.frame);
    } else {
      window.addEventListener('resize', sync);
    }
  }

  getSector() {
    return SECTORS[this.sectorIdx];
  }

  restartAll() {
    this.finishOverlay?.classList.add('hidden');
    this.ended = false;
    this.paused = false;
    this.score = 0;
    this.combo = 1;
    this.hp = this.maxHp;
    this.attempts = 0;
    this.correctHits = 0;
    this.clearedSectors.clear();
    this.loadSector(0);
  }

  renderSectorNav() {
    if (!this.sectorNavEl) return;
    this.sectorNavEl.innerHTML = SECTORS.map((sec, idx) => {
      const cls = ['cr-sector-pill'];
      if (idx === this.sectorIdx) cls.push('active');
      if (this.clearedSectors.has(sec.id)) cls.push('cleared');
      return `<button type="button" class="${cls.join(' ')}" data-idx="${idx}">${sec.tab}</button>`;
    }).join('');
    this.sectorNavEl.querySelectorAll('.cr-sector-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.loadSector(Number(btn.getAttribute('data-idx')));
      });
    });
  }

  renderDeck(sec) {
    if (!this.deckButtonsEl) return;
    this.deckButtonsEl.innerHTML = sec.controls
      .map((c) => `<button type="button" class="cr-deck-btn ${c.cls}" data-act="${c.action}">${c.label}</button>`)
      .join('');
    this.deckButtonsEl.querySelectorAll('.cr-deck-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.triggerAction(btn.getAttribute('data-act'));
      });
    });
    renderTex(this.deckHintEl, sec.deckHint);
  }

  loadSector(idx) {
    this.sectorIdx = ((idx % SECTORS.length) + SECTORS.length) % SECTORS.length;
    const sec = this.getSector();
    this.ended = false;
    this.paused = false;
    this.finishOverlay?.classList.add('hidden');
    this.hits = 0;
    this.hp = this.maxHp;
    this.combo = 1;
    this.obstacles = [];
    this.crystals = [];
    this.particles = [];
    this.beams = [];
    this.spawnTimer = 0.7;

    this.skater.worldX = 0;
    this.skater.y = this.getTerrainY(0);
    this.skater.vy = 0;
    this.skater.jumpsLeft = 2;
    this.skater.grounded = true;
    this.skater.pitch = 0;
    this.skater.mirrored = false;
    this.skater.invuln = 0;
    this.skater.trail = [];

    renderTex(this.sectorBadgeEl, `المضمار ${this.sectorIdx + 1}/${SECTORS.length}`);
    renderTex(this.sectorTitleEl, sec.title);
    renderTex(this.sectorFormulaEl, sec.formula);
    renderTex(this.sectorGoalEl, sec.goalText);
    this.renderSectorNav();
    this.renderDeck(sec);
    this.syncHUD();
    this.showToast(`انطلق! ${sec.tab}`, false);
  }

  getTerrainY(worldX) {
    const sec = this.getSector();
    const base = this.h * 0.68;
    if (sec.mode === 'bridge-skater') {
      return base - Math.sin(worldX * 0.006) * 42 - Math.cos(worldX * 0.0025) * 22;
    }
    if (sec.mode === 'stair-runner') {
      const step = Math.floor(worldX / 170) % 4;
      return this.h * 0.76 - step * 38;
    }
    if (sec.mode === 'asymptote-surfer') {
      return this.h * 0.62 - Math.sin(worldX * 0.005) * 44;
    }
    if (sec.mode === 'tvi-dash') {
      return this.h * 0.68 - Math.sin(worldX * 0.004) * 24;
    }
    if (sec.mode === 'mirror-flipper') {
      return this.skater.mirrored ? this.h * 0.34 : this.h * 0.72;
    }
    return base;
  }

  syncHUD() {
    const sec = this.getSector();
    if (this.hudScoreEl) this.hudScoreEl.textContent = String(this.score);
    if (this.hudComboEl) this.hudComboEl.textContent = `×${this.combo}`;
    if (this.hudHpEl) {
      this.hudHpEl.textContent = '♥'.repeat(Math.max(0, this.hp)) + '♡'.repeat(Math.max(0, this.maxHp - this.hp));
    }
    if (this.progressFillEl) {
      const pct = Math.min(100, Math.round((this.hits / sec.targetLength) * 100));
      this.progressFillEl.style.width = `${pct}%`;
    }
  }

  showToast(msg, bad = false) {
    if (!this.toastEl) return;
    this.toastEl.classList.remove('hidden', 'bad');
    if (bad) this.toastEl.classList.add('bad');
    renderTex(this.toastEl, msg);
    this.toastTimer = 1.6;
  }

  spawnParticles(sx, sy, color, count = 14) {
    for (let i = 0; i < count; i += 1) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const spd = 70 + Math.random() * 145;
      this.particles.push({
        x: sx,
        y: sy,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        color,
        life: 0.42 + Math.random() * 0.25,
        maxLife: 0.68
      });
    }
  }

  award(pts, sx, sy, color, msg) {
    this.hits += 1;
    this.attempts += 1;
    this.correctHits += 1;
    this.score += pts * this.combo;
    this.combo = Math.min(8, this.combo + 1);
    this.audio.playScore(this.combo);
    window.ArcadeCore?.Gamepad?.triggerHaptic(this.gpState, 55, 0.2, 0.45);
    this.spawnParticles(sx, sy, color || '#4ade80', 14);
    if (msg) this.showToast(msg, false);
    this.syncHUD();

    if (this.hits >= this.getSector().targetLength) {
      this.completeSector();
    }
  }

  damage(msg, sx, sy) {
    if (this.skater.invuln > 0) return;
    this.skater.invuln = 0.85;
    this.attempts += 1;
    this.combo = 1;
    this.hp = Math.max(0, this.hp - 1);
    this.shake = 0.28;
    this.audio.playCrash();
    window.ArcadeCore?.Gamepad?.triggerHaptic(this.gpState, 160, 0.75, 0.85);
    this.spawnParticles(sx, sy, '#ff4d6d', 16);
    this.showToast(msg, true);
    this.syncHUD();

    if (this.hp <= 0) {
      this.finishRun(false);
    }
  }

  completeSector() {
    const sec = this.getSector();
    this.clearedSectors.add(sec.id);
    this.audio.playWin();
    this.renderSectorNav();
    if (this.clearedSectors.size >= SECTORS.length) {
      this.finishRun(true);
      return;
    }
    this.showEnd(true, false);
  }

  finishRun(victory) {
    const acc = this.attempts > 0 ? Math.round((this.correctHits / this.attempts) * 100) : 100;
    window.ArcadeCore?.Progress?.recordRun(GAME_ID, {
      score: this.score,
      stagesCleared: this.clearedSectors.size,
      totalStages: SECTORS.length,
      victory,
      accuracy: acc,
      bypasses: 0
    });
    this.showEnd(victory, true);
  }

  showEnd(victory, isFinal) {
    this.ended = true;
    const acc = this.attempts > 0 ? Math.round((this.correctHits / this.attempts) * 100) : 100;
    const rank = window.ArcadeCore?.Progress?.computeRank({
      victory: victory && isFinal,
      sealsCleared: Math.round((this.clearedSectors.size / SECTORS.length) * 4),
      accuracy: acc
    }) || 'A';

    if (this.endGlyphEl) this.endGlyphEl.textContent = victory ? '🏆' : '💥';
    if (this.endTitleEl) {
      this.endTitleEl.textContent = !victory
        ? 'سقط المتزلّج في عدم الاتصال!'
        : (isFinal ? 'أتقنت جميع مضامير النهايات والاتصال!' : `تمّ اجتياز ${this.getSector().tab}!`);
    }
    if (this.endDescEl) {
      this.endDescEl.textContent = !victory
        ? 'أعد المحاولة — توقّت القفز وأطلق الشعاع المناسب قبل الفجوة!'
        : (isFinal ? 'اجتزت المضامير الـ 5 (المهارات 1–22) بنجاح كامل.' : 'انتقل للمضمار التالي أو أعد السباق لرفع الرتبة.');
    }
    if (this.endScoreEl) this.endScoreEl.textContent = String(this.score);
    if (this.endAccEl) this.endAccEl.textContent = `${acc}%`;
    if (this.endRankEl) this.endRankEl.textContent = rank;

    const hasNext = victory && !isFinal;
    this.btnEndNext?.classList.toggle('hidden', !hasNext);
    this.finishOverlay?.classList.remove('hidden');
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

    this.btnEndReplay?.addEventListener('click', () => {
      this.audio.unlock();
      if (this.hp <= 0 || this.clearedSectors.size >= SECTORS.length) {
        this.restartAll();
      } else {
        this.loadSector(this.sectorIdx);
      }
    });

    this.btnEndNext?.addEventListener('click', () => {
      this.audio.unlock();
      this.loadSector((this.sectorIdx + 1) % SECTORS.length);
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      this.audio.unlock();
      const sec = this.getSector();
      if (sec.mode === 'mirror-flipper' && e.button === 2) {
        this.triggerAction('flipMirror');
      } else {
        this.triggerAction('jump');
      }
    });

    this.canvas.addEventListener('pointermove', (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.pointerY = e.clientY - r.top;
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (this.pauseMenu?.isOpen()) return;
      this.audio.unlock();

      if (this.ended) {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          if (!this.btnEndNext?.classList.contains('hidden')) this.btnEndNext.click();
          else this.btnEndReplay?.click();
        }
        return;
      }

      const mode = this.getSector().mode;
      if (e.code === 'KeyM') this.btnAudio?.click();
      else if (e.code === 'BracketRight') this.loadSector((this.sectorIdx + 1) % SECTORS.length);
      else if (e.code === 'BracketLeft') this.loadSector((this.sectorIdx - 1 + SECTORS.length) % SECTORS.length);
      else if (e.code === 'Space') {
        e.preventDefault();
        this.triggerAction('jump');
      } else if (e.code === 'Digit1' || e.code === 'KeyQ') {
        if (mode === 'bridge-skater') this.triggerAction('beamFactor');
        else if (mode === 'tvi-dash') this.triggerAction('sliceLeft');
      } else if (e.code === 'Digit2' || e.code === 'KeyE') {
        if (mode === 'bridge-skater') this.triggerAction('beamConj');
        else if (mode === 'tvi-dash') this.triggerAction('sliceRight');
      } else if (e.code === 'Digit3' || e.code === 'KeyF') {
        if (mode === 'bridge-skater') this.triggerAction('beamTrig');
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyF') {
        if (mode === 'mirror-flipper') this.triggerAction('flipMirror');
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  triggerAction(act) {
    if (this.paused || this.ended) return;
    const mode = this.getSector().mode;

    if (act === 'jump') {
      if (this.skater.grounded || this.skater.coyote > 0 || this.skater.jumpsLeft > 0) {
        const isDouble = !this.skater.grounded && this.skater.coyote <= 0;
        const dir = (mode === 'mirror-flipper' && this.skater.mirrored) ? 1 : -1;
        this.skater.vy = dir * 485;
        this.skater.grounded = false;
        this.skater.coyote = 0;
        this.skater.jumpsLeft = Math.max(0, this.skater.jumpsLeft - 1);
        this.audio.playJump(isDouble);
        window.ArcadeCore?.Gamepad?.triggerHaptic(this.gpState, 35, 0.15, 0.25);
        this.spawnParticles(this.skater.screenX, this.skater.y, '#38bdf8', 7);
      }
    } else if (act === 'beamFactor' || act === 'beamConj' || act === 'beamTrig') {
      this.fireBridgeBeam(act);
    } else if (act === 'pitchUp') {
      this.skater.pitch = clamp(this.skater.pitch - 0.18, -0.7, 0.7);
    } else if (act === 'pitchDown') {
      this.skater.pitch = clamp(this.skater.pitch + 0.18, -0.7, 0.7);
    } else if (act === 'sliceLeft' || act === 'sliceRight') {
      this.performTviSlice(act === 'sliceLeft' ? 'left' : 'right');
    } else if (act === 'flipMirror') {
      if (mode === 'mirror-flipper') {
        this.skater.mirrored = !this.skater.mirrored;
        this.skater.vy = 0;
        this.audio.tone(this.skater.mirrored ? 660 : 440, 0.11, 'sine', 0.08);
        this.spawnParticles(this.skater.screenX, this.skater.y, '#fbbf24', 12);
      }
    }
  }

  fireBridgeBeam(act) {
    const want = act === 'beamFactor' ? 'factor' : (act === 'beamConj' ? 'conj' : 'trig');
    const target = this.obstacles.find(
      (o) => o.kind === 'hole' && !o.bridged && o.x > this.skater.worldX - 30 && o.x < this.skater.worldX + 470
    );
    if (!target) {
      this.audio.tone(200, 0.06, 'sine', 0.04);
      return;
    }
    const sx = this.skater.screenX + (target.x - this.skater.worldX);
    const sy = this.getTerrainY(target.x);
    this.beams.push({
      x1: this.skater.screenX + 12,
      y1: this.skater.y - 6,
      x2: sx,
      y2: sy,
      color: want === 'factor' ? '#38bdf8' : want === 'conj' ? '#fbbf24' : '#ff4d6d',
      life: 0.22
    });
    if (target.fix === want) {
      target.bridged = true;
      this.award(140, sx, sy, '#4ade80', `جسر ${target.expr} ✓`);
    } else {
      this.damage(`تقنية خاطئة لـ ${target.expr}!`, sx, sy);
    }
  }

  performTviSlice(side) {
    const gate = this.obstacles.find(
      (o) => o.kind === 'tvi-gate' && !o.cleared && o.x > this.skater.worldX + 10 && o.x < this.skater.worldX + 620
    );
    if (!gate) return;
    const sx = this.skater.screenX + (gate.x - this.skater.worldX);
    const sy = this.h * 0.5;
    if (gate.want === side) {
      gate.slicesLeft -= 1;
      this.audio.playScore(this.combo);
      if (gate.slicesLeft <= 0) {
        gate.cleared = true;
        this.award(175, sx, sy, '#fbbf24', `حُدِّد α ∈ ]${gate.a.toFixed(2)}, ${gate.b.toFixed(2)}[ ✓`);
      } else {
        // Update next random sub-interval sign condition
        gate.want = Math.random() < 0.5 ? 'left' : 'right';
        const c = (gate.a + gate.b) * 0.5;
        if (gate.want === 'left') gate.b = c;
        else gate.a = c;
        this.showToast(`شطر دقيق! بقي ${gate.slicesLeft}`, false);
      }
    } else {
      this.damage('فخ TVI: يجب أن يكون f(a)·f(b) < 0!', sx, sy);
    }
  }

  pollGamepad() {
    const GP = window.ArcadeCore?.Gamepad;
    if (!GP || !this.gpState) return { lx: 0, ly: 0, l2: 0, r2: 0 };
    const gp = GP.resolveActiveGamepad(this.gpState);
    GP.updateBanner(this.gpState, this.gpBadgeEl, this.gpBadgeEl, '🎮 لوحة المفاتيح / الماوس');

    if (this.pauseMenu?.pollGamepad(gp, this.gpState)) {
      return { lx: 0, ly: 0, l2: 0, r2: 0 };
    }
    if (!gp) return { lx: 0, ly: 0, l2: 0, r2: 0 };

    if (this.ended) {
      if (GP.justPressed(gp, this.gpState, 0)) this.btnEndReplay?.click();
      else if (GP.justPressed(gp, this.gpState, 3) && !this.btnEndNext?.classList.contains('hidden')) this.btnEndNext?.click();
      else if (GP.justPressed(gp, this.gpState, 1)) window.location.href = '../../index.html?from=game';
      GP.snapshotButtons(gp, this.gpState);
      return { lx: 0, ly: 0, l2: 0, r2: 0 };
    }

    const axes = GP.sampleAnalogAxes(gp, 0.18);
    const mode = this.getSector().mode;

    if (GP.justPressed(gp, this.gpState, 4)) this.loadSector((this.sectorIdx - 1 + SECTORS.length) % SECTORS.length);
    if (GP.justPressed(gp, this.gpState, 5)) this.loadSector((this.sectorIdx + 1) % SECTORS.length);

    if (GP.justPressed(gp, this.gpState, 0)) this.triggerAction('jump');

    if (mode === 'bridge-skater') {
      if (GP.justPressed(gp, this.gpState, 2)) this.triggerAction('beamFactor');
      if (GP.justPressed(gp, this.gpState, 3)) this.triggerAction('beamConj');
      if (GP.justPressed(gp, this.gpState, 1)) this.triggerAction('beamTrig');
    } else if (mode === 'tvi-dash') {
      if (GP.justPressed(gp, this.gpState, 6) || GP.justPressed(gp, this.gpState, 2)) this.triggerAction('sliceLeft');
      if (GP.justPressed(gp, this.gpState, 7) || GP.justPressed(gp, this.gpState, 1)) this.triggerAction('sliceRight');
    } else if (mode === 'mirror-flipper') {
      if (GP.justPressed(gp, this.gpState, 1) || GP.justPressed(gp, this.gpState, 7)) this.triggerAction('flipMirror');
    }

    GP.snapshotButtons(gp, this.gpState);
    return {
      lx: axes.lx || (gp.buttons[14]?.pressed ? -1 : gp.buttons[15]?.pressed ? 1 : 0),
      ly: axes.ly || (gp.buttons[12]?.pressed ? -1 : gp.buttons[13]?.pressed ? 1 : 0),
      l2: axes.l2,
      r2: axes.r2
    };
  }

  loop(ts) {
    const dt = Math.min(0.05, this.lastTs ? (ts - this.lastTs) / 1000 : 0.016);
    this.lastTs = ts;
    const inp = this.pollGamepad();
    if (!this.paused && !this.ended) {
      this.update(dt, inp);
    }
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  spawnSectorObstacle() {
    const sec = this.getSector();
    const spawnX = this.skater.worldX + this.w + 90;

    if (sec.mode === 'bridge-skater') {
      const bank = [
        { expr: '(x²−4)/(x−2)', fix: 'factor' },
        { expr: '(x³−8)/(x−2)', fix: 'factor' },
        { expr: '(√(x+3)−2)/(x−1)', fix: 'conj' },
        { expr: '(∛x−2)/(x−8)', fix: 'conj' },
        { expr: 'sin(3x)/x', fix: 'trig' },
        { expr: '(1−cos x)/x²', fix: 'trig' }
      ];
      const item = bank[Math.floor(Math.random() * bank.length)];
      this.obstacles.push({ kind: 'hole', x: spawnX, w: 96, expr: item.expr, fix: item.fix, bridged: false });
    } else if (sec.mode === 'stair-runner') {
      const isJumpCliff = Math.random() < 0.7;
      if (isJumpCliff) {
        this.obstacles.push({
          kind: 'gap',
          x: spawnX,
          w: 76,
          label: Math.random() < 0.5 ? 'E(x): x∈ℤ' : 'x∉D_f',
          cleared: false
        });
      } else {
        this.crystals.push({ x: spawnX, y: this.getTerrainY(spawnX) - 70, label: 'C([a,b])', taken: false });
      }
    } else if (sec.mode === 'asymptote-surfer') {
      if (Math.random() < 0.45) {
        this.obstacles.push({ kind: 'pole', x: spawnX, w: 28, label: 'x = a (AV)', cleared: false });
      } else {
        const targetPitch = (Math.random() - 0.5) * 0.9;
        this.obstacles.push({ kind: 'asym-zone', x: spawnX, targetPitch, cleared: false });
      }
    } else if (sec.mode === 'tvi-dash') {
      const want = Math.random() < 0.5 ? 'left' : 'right';
      this.obstacles.push({
        kind: 'tvi-gate',
        x: spawnX,
        a: 1.0,
        b: 3.0,
        want,
        slicesLeft: 2,
        cleared: false
      });
    } else if (sec.mode === 'mirror-flipper') {
      const wallOnMirror = Math.random() < 0.5;
      this.obstacles.push({
        kind: 'dim-wall',
        x: spawnX,
        onMirror: wallOnMirror,
        label: wallOnMirror ? 'جدار f⁻¹' : 'جدار f',
        cleared: false
      });
      this.crystals.push({
        x: spawnX + 120,
        y: wallOnMirror ? this.h * 0.72 - 36 : this.h * 0.34 + 36,
        label: Math.random() < 0.5 ? '∛x' : 'x^{2/3}',
        taken: false
      });
    }
  }

  update(dt, inp) {
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.toastEl?.classList.add('hidden');
    }
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
    if (this.skater.invuln > 0) this.skater.invuln = Math.max(0, this.skater.invuln - dt);

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.beams.length - 1; i >= 0; i -= 1) {
      this.beams[i].life -= dt;
      if (this.beams[i].life <= 0) this.beams.splice(i, 1);
    }

    const sec = this.getSector();
    const kx = (this.keys.ArrowRight || this.keys.KeyD ? 1 : 0) - (this.keys.ArrowLeft || this.keys.KeyA ? 1 : 0);
    const ky = (this.keys.ArrowDown || this.keys.KeyS ? 1 : 0) - (this.keys.ArrowUp || this.keys.KeyW ? 1 : 0);
    const moveX = Math.abs(inp.lx) > 0.1 ? inp.lx : kx;
    const moveY = Math.abs(inp.ly) > 0.1 ? inp.ly : ky;

    this.skater.speed = clamp(245 + moveX * 95 + this.hits * 4, 155, 380);
    this.skater.worldX += this.skater.speed * dt;

    if (sec.mode === 'asymptote-surfer') {
      if (this.pointerY !== null && Math.abs(moveY) < 0.05) {
        this.skater.pitch = clamp((this.pointerY / this.h - 0.5) * 1.4, -0.7, 0.7);
      } else {
        this.skater.pitch = clamp(this.skater.pitch + moveY * 1.3 * dt, -0.7, 0.7);
      }
    }

    // Vertical physics (flipped gravity in mirrored f^-1 mode)
    const grav = (sec.mode === 'mirror-flipper' && this.skater.mirrored) ? -1280 : 1280;
    const groundY = this.getTerrainY(this.skater.worldX);
    this.skater.vy += grav * dt;
    this.skater.y += this.skater.vy * dt;

    const overUnbridgedHole = this.obstacles.some(
      (o) => (o.kind === 'hole' && !o.bridged || o.kind === 'gap') && Math.abs(this.skater.worldX - o.x) < o.w * 0.45
    );

    if (!overUnbridgedHole) {
      if (grav > 0 && this.skater.y >= groundY) {
        this.skater.y = groundY;
        this.skater.vy = 0;
        this.skater.grounded = true;
        this.skater.coyote = 0.12;
        this.skater.jumpsLeft = 2;
      } else if (grav < 0 && this.skater.y <= groundY) {
        this.skater.y = groundY;
        this.skater.vy = 0;
        this.skater.grounded = true;
        this.skater.coyote = 0.12;
        this.skater.jumpsLeft = 2;
      } else {
        this.skater.grounded = false;
        this.skater.coyote = Math.max(0, this.skater.coyote - dt);
      }
    } else {
      this.skater.grounded = false;
      this.skater.coyote = Math.max(0, this.skater.coyote - dt);
      if (this.skater.y > this.h + 24 || this.skater.y < -24) {
        this.skater.y = groundY - 40;
        this.skater.vy = 0;
        this.damage('سقطت في فجوة عدم الاتصال!', this.skater.screenX, groundY);
      }
    }

    this.skater.trail.push({ wx: this.skater.worldX, y: this.skater.y });
    if (this.skater.trail.length > 26) this.skater.trail.shift();

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = sec.mode === 'tvi-dash' ? 2.5 : (sec.mode === 'bridge-skater' ? 2.1 : 1.75);
      this.spawnSectorObstacle();
    }

    for (let i = this.obstacles.length - 1; i >= 0; i -= 1) {
      const o = this.obstacles[i];
      if (o.x < this.skater.worldX - 180) {
        this.obstacles.splice(i, 1);
        continue;
      }
      const dx = o.x - this.skater.worldX;
      const sx = this.skater.screenX + dx;

      if (o.kind === 'gap' && !o.cleared && dx < -o.w * 0.48) {
        o.cleared = true;
        this.award(115, sx, this.skater.y, '#4ade80', `قفز ${o.label} ✓`);
      } else if (o.kind === 'pole') {
        if (Math.abs(dx) < 18 && this.skater.y > groundY - 56) {
          o.cleared = true;
          this.obstacles.splice(i, 1);
          this.damage('اصطدمت بالمقارب العمودي! اقفز [✕]', sx, this.skater.y);
        } else if (!o.cleared && dx < -26) {
          o.cleared = true;
          this.award(120, sx, this.skater.y, '#38bdf8', 'تجاوز المقارب العمودي ✓');
        }
      } else if (o.kind === 'asym-zone' && !o.cleared && Math.abs(dx) < 22) {
        o.cleared = true;
        if (Math.abs(this.skater.pitch - o.targetPitch) <= 0.35) {
          this.award(145, sx, this.skater.y, '#fbbf24', 'تطابق ميل المقارب المائل ✓');
        } else {
          this.damage('اضبط ميل اللوح [▲▼] لمطابقة المقارب!', sx, this.skater.y);
        }
      } else if (o.kind === 'tvi-gate' && !o.cleared && Math.abs(dx) < 20) {
        this.obstacles.splice(i, 1);
        this.damage('اصطدمت بحاجز TVI! اشطر بـ [L2/R2] أو [Q/E]', sx, this.skater.y);
      } else if (o.kind === 'dim-wall' && !o.cleared && Math.abs(dx) < 18) {
        if (this.skater.mirrored === o.onMirror) {
          this.obstacles.splice(i, 1);
          this.damage(`اقلب البُعد [◯ / Shift] لتفادي ${o.label}!`, sx, this.skater.y);
        } else if (dx < -10) {
          o.cleared = true;
          this.award(130, sx, this.skater.y, '#fbbf24', 'عبور مرآة y = x ✓');
        }
      }
    }

    for (let i = this.crystals.length - 1; i >= 0; i -= 1) {
      const c = this.crystals[i];
      if (c.x < this.skater.worldX - 120) {
        this.crystals.splice(i, 1);
        continue;
      }
      if (!c.taken && Math.hypot(c.x - this.skater.worldX, c.y - this.skater.y) < 38) {
        c.taken = true;
        const sx = this.skater.screenX + (c.x - this.skater.worldX);
        this.award(125, sx, c.y, '#38bdf8', `التقاط ${c.label} ✓`);
        this.crystals.splice(i, 1);
      }
    }
  }

  drawRich(expr, x, y, opts) {
    const AK = window.ArcadeCore?.CanvasAxisKit;
    if (AK && AK.drawMathRich) AK.drawMathRich(this.ctx, expr, x, y, opts);
    else {
      this.ctx.fillStyle = opts?.color || '#f8fafc';
      this.ctx.fillText(expr, x, y);
    }
  }

  render() {
    const ctx = this.ctx;
    const AK = window.ArcadeCore?.CanvasAxisKit;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * 9, (Math.random() - 0.5) * 9);
    }

    if (AK) AK.clearWithGrid(ctx, this.w, this.h, { bg: '#040814', gridColor: 'rgba(56, 189, 248, 0.08)', step: 36 });
    else {
      ctx.fillStyle = '#040814';
      ctx.fillRect(0, 0, this.w, this.h);
    }

    const sec = this.getSector();

    // Mirror axis y = x visual guide in mirror-flipper mode
    if (sec.mode === 'mirror-flipper') {
      ctx.setLineDash([7, 5]);
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, this.h * 0.53);
      ctx.lineTo(this.w, this.h * 0.53);
      ctx.stroke();
      ctx.setLineDash([]);
      this.drawRich('y = x  (f ↔ f⁻¹)', 95, this.h * 0.53 - 14, { color: '#fde68a', fontSize: 12 });
    }

    // Continuous curve terrain (skipping unbridged holes)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    let penDown = false;
    for (let sx = 0; sx <= this.w; sx += 10) {
      const wx = this.skater.worldX + (sx - this.skater.screenX);
      const isHole = this.obstacles.some(
        (o) => (o.kind === 'hole' && !o.bridged || o.kind === 'gap') && Math.abs(wx - o.x) < o.w * 0.45
      );
      if (isHole) {
        penDown = false;
        continue;
      }
      const ty = this.getTerrainY(wx);
      if (!penDown) {
        ctx.moveTo(sx, ty);
        penDown = true;
      } else {
        ctx.lineTo(sx, ty);
      }
    }
    ctx.stroke();

    // Obstacles
    for (const o of this.obstacles) {
      const sx = this.skater.screenX + (o.x - this.skater.worldX);
      const ty = this.getTerrainY(o.x);
      if (o.kind === 'hole') {
        if (o.bridged) {
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(sx - o.w * 0.48, ty);
          ctx.lineTo(sx + o.w * 0.48, ty);
          ctx.stroke();
          this.drawRich(`${o.expr} ✓`, sx, ty - 22, { color: '#bbf7d0', fontSize: 12 });
        } else {
          ctx.strokeStyle = '#ff4d6d';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([5, 4]);
          ctx.beginPath();
          ctx.moveTo(sx, 24);
          ctx.lineTo(sx, this.h - 20);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#040814';
          ctx.beginPath();
          ctx.arc(sx, ty, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          this.drawRich(o.expr, sx, ty - 28, { color: '#fda4af', fontSize: 13 });
        }
      } else if (o.kind === 'gap') {
        ctx.fillStyle = 'rgba(255, 77, 109, 0.16)';
        ctx.fillRect(sx - o.w * 0.45, ty - 14, o.w * 0.9, this.h - ty + 14);
        this.drawRich(o.label, sx, ty - 24, { color: '#fda4af', fontSize: 12 });
      } else if (o.kind === 'pole') {
        ctx.strokeStyle = '#ff4d6d';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(sx, ty);
        ctx.lineTo(sx, ty - 62);
        ctx.stroke();
        this.drawRich(o.label, sx, ty - 74, { color: '#fda4af', fontSize: 12 });
      } else if (o.kind === 'asym-zone') {
        const y1 = ty - Math.sin(o.targetPitch) * 65;
        const y2 = ty + Math.sin(o.targetPitch) * 65;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(sx - 55, y1 - 36);
        ctx.lineTo(sx + 55, y2 - 36);
        ctx.stroke();
        ctx.setLineDash([]);
        this.drawRich('y = ax + b', sx, ty - 66, { color: '#fde68a', fontSize: 12 });
      } else if (o.kind === 'tvi-gate') {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        ctx.fillRect(sx - 14, 24, 28, this.h - 48);
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.strokeRect(sx - 14, 24, 28, this.h - 48);
        const tag = o.want === 'left'
          ? `f(a)·f(c)<0 [أيسر L2/Q] (${o.slicesLeft})`
          : `f(c)·f(b)<0 [أيمن R2/E] (${o.slicesLeft})`;
        this.drawRich(tag, sx, 46, { color: '#fde68a', fontSize: 12 });
      } else if (o.kind === 'dim-wall') {
        const wy = o.onMirror ? this.h * 0.34 : this.h * 0.72;
        ctx.fillStyle = o.onMirror ? '#fbbf24' : '#38bdf8';
        ctx.fillRect(sx - 9, wy - 44, 18, 88);
        this.drawRich(o.label, sx, wy - 56, { color: '#f8fafc', fontSize: 12 });
      }
    }

    // Crystals
    for (const c of this.crystals) {
      const sx = this.skater.screenX + (c.x - this.skater.worldX);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(sx, c.y - 12);
      ctx.lineTo(sx + 10, c.y);
      ctx.lineTo(sx, c.y + 12);
      ctx.lineTo(sx - 10, c.y);
      ctx.closePath();
      ctx.fill();
      this.drawRich(c.label, sx, c.y - 20, { color: '#bae6fd', fontSize: 12 });
    }

    // Beams
    for (const b of this.beams) {
      ctx.save();
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = Math.max(0, b.life / 0.22);
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();
      ctx.restore();
    }

    // Skater trail
    if (this.skater.trail.length > 1) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      this.skater.trail.forEach((pt, idx) => {
        const sx = this.skater.screenX + (pt.wx - this.skater.worldX);
        if (idx === 0) ctx.moveTo(sx, pt.y - 4);
        else ctx.lineTo(sx, pt.y - 4);
      });
      ctx.stroke();
    }

    // Skater avatar with tilt
    ctx.save();
    ctx.translate(this.skater.screenX, this.skater.y - 9);
    ctx.rotate(this.skater.pitch);
    if (this.skater.invuln > 0 && Math.floor(this.skater.invuln * 14) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -6, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-16, 6);
    ctx.lineTo(16, 6);
    ctx.stroke();
    ctx.restore();

    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ContinuitySkaterGame();
});
