import { GAME_ID, STAGES } from './levels.js';

const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25, 783.99];

class ArcadeSynth {
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

  playHit(combo = 1) {
    const f = SCALE[Math.min(SCALE.length - 1, Math.max(0, combo - 1))];
    this.tone(f, 0.11, 'triangle', 0.085);
  }

  playDamage() {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(170, now);
    osc.frequency.exponentialRampToValueAtTime(62, now + 0.22);
    g.gain.setValueAtTime(0.09, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  playStageClear() {
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

class SequenceArcadeGame {
  constructor() {
    this.canvas = document.getElementById('weaverCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvasBox = document.getElementById('canvasBox');

    this.stageNavEl = document.getElementById('stageNav');
    this.gpBadgeEl = document.getElementById('gpBadge');
    this.hudScoreEl = document.getElementById('hudScore');
    this.hudComboEl = document.getElementById('hudCombo');
    this.hudHpEl = document.getElementById('hudHp');
    this.stageBadgeEl = document.getElementById('stageBadge');
    this.stageTitleEl = document.getElementById('stageTitle');
    this.stageFormulaEl = document.getElementById('stageFormula');
    this.stageGoalEl = document.getElementById('stageGoal');
    this.progressFillEl = document.getElementById('stageProgressFill');
    this.toastEl = document.getElementById('toastFeed');
    this.deckButtonsEl = document.getElementById('deckButtons');
    this.deckHintEl = document.getElementById('deckHint');
    this.btnAudio = document.getElementById('btnAudio');
    this.btnPause = document.getElementById('btnPause');

    this.endOverlayEl = document.getElementById('endOverlay');
    this.endGlyphEl = document.getElementById('endGlyph');
    this.endTitleEl = document.getElementById('endTitle');
    this.endDescEl = document.getElementById('endDesc');
    this.endScoreEl = document.getElementById('endScore');
    this.endAccEl = document.getElementById('endAcc');
    this.endRankEl = document.getElementById('endRank');
    this.btnEndPrimary = document.getElementById('btnEndPrimary');
    this.btnEndNext = document.getElementById('btnEndNext');
    this.btnEndHub = document.getElementById('btnEndHub');

    this.audio = new ArcadeSynth();
    this.gpState = window.ArcadeCore?.Gamepad?.createState ? window.ArcadeCore.Gamepad.createState() : null;

    this.stageIdx = 0;
    this.clearedStages = new Set();
    this.score = 0;
    this.combo = 1;
    this.hp = 5;
    this.maxHp = 5;
    this.hits = 0;
    this.attempts = 0;
    this.correctHits = 0;
    this.paused = false;
    this.ended = false;
    this.endFocusIdx = 0;

    this.keys = {};
    this.pointer = { active: false, x: 360, y: 220 };
    this.particles = [];
    this.beams = [];
    this.cobwebs = [];
    this.toastTimer = 0;
    this.shake = 0;

    this.w = 840;
    this.h = 460;
    this.dpr = 1;
    this.lastTs = 0;

    // Mode-specific dynamic entities
    this.st = {};

    this.pauseMenu = window.ArcadeCore?.PauseMenu?.attach({
      title: 'نسّاج المتتاليات — إيقاف مؤقت',
      subtitle: 'معركة التقارب (الدرس 3 • 2BAC PC)',
      controlsHelp: [
        '🎮 عصا اليسار / WASD / الماوس: الحركة والتصويب',
        '✕ / Space: تنفيذ الفعل أو الاندفاع • ▢ / △ / ◯: أسلحة الرتابة والصدّ',
        'L1 / R1: تبديل الطور • L2 / R2: ضبط السقف M أو فكّي الدركيين',
        'Options (Start) / Esc: فتح هذه القائمة في أي لحظة'
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
      const w = Math.max(320, Math.floor(r.width));
      const h = Math.max(240, Math.floor(r.height));
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

  restartFullRun() {
    this.endOverlayEl?.classList.add('hidden');
    this.ended = false;
    this.paused = false;
    this.score = 0;
    this.combo = 1;
    this.hp = this.maxHp;
    this.attempts = 0;
    this.correctHits = 0;
    this.clearedStages.clear();
    this.loadStage(0);
  }

  renderStageNav() {
    if (!this.stageNavEl) return;
    this.stageNavEl.innerHTML = STAGES.map((st, idx) => {
      const cls = ['sw-stage-pill'];
      if (idx === this.stageIdx) cls.push('active');
      if (this.clearedStages.has(st.id)) cls.push('cleared');
      return `<button type="button" class="${cls.join(' ')}" data-idx="${idx}">${st.tab}</button>`;
    }).join('');
    this.stageNavEl.querySelectorAll('.sw-stage-pill').forEach((b) => {
      b.addEventListener('click', () => {
        this.audio.unlock();
        this.loadStage(Number(b.getAttribute('data-idx')));
      });
    });
  }

  renderDeck(stage) {
    if (!this.deckButtonsEl) return;
    this.deckButtonsEl.innerHTML = stage.controls
      .map((c) => `<button type="button" class="sw-deck-btn ${c.cls}" data-act="${c.action}">${c.label}</button>`)
      .join('');
    this.deckButtonsEl.querySelectorAll('.sw-deck-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.triggerAction(btn.getAttribute('data-act'));
      });
    });
    renderTex(this.deckHintEl, stage.deckHint);
  }

  loadStage(idx) {
    this.stageIdx = ((idx % STAGES.length) + STAGES.length) % STAGES.length;
    const stage = this.getStage();
    this.ended = false;
    this.paused = false;
    this.endOverlayEl?.classList.add('hidden');
    this.hits = 0;
    this.hp = this.maxHp;
    this.combo = 1;
    this.particles = [];
    this.beams = [];
    this.cobwebs = [];

    renderTex(this.stageBadgeEl, `الطور ${this.stageIdx + 1}/${STAGES.length}`);
    renderTex(this.stageTitleEl, stage.title);
    renderTex(this.stageFormulaEl, stage.formula);
    renderTex(this.stageGoalEl, stage.goalText);
    this.renderStageNav();
    this.renderDeck(stage);

    if (stage.mode === 'induction-catcher') {
      this.st = {
        paddleX: 2.2,
        ceilM: 4.0,
        shieldTimer: 0,
        spawnTimer: 0.6,
        orbs: []
      };
    } else if (stage.mode === 'monotone-shooter') {
      this.st = {
        px: 2.1,
        py: 2.0,
        dashCd: 0,
        dashTime: 0,
        spawnTimer: 0.5,
        orbs: [],
        variant: 0
      };
    } else if (stage.mode === 'rhythm-lanes') {
      this.st = {
        lane: 0, // 0=converge 0, 1=converge L!=0 / const, 2=diverge
        sumCharge: 0,
        spawnTimer: 0.5,
        notes: []
      };
    } else if (stage.mode === 'homographic-boss') {
      this.st = {
        px: 2.4,
        py: 2.6,
        dashCd: 0,
        dashTime: 0,
        bossHp: stage.targetHits,
        spawnTimer: 0.7,
        bullets: [],
        lockedIdx: new Set(),
        wavePhase: 0,
        targetIdx: 0
      };
    } else if (stage.mode === 'squeeze-tunnel') {
      this.st = {
        centerY: 2.5,
        halfGap: 0.85,
        targetL: 2.5,
        shieldTimer: 0,
        scrollT: 0,
        gateTimer: 1.4,
        gates: [],
        meteors: []
      };
    }

    this.syncHUD();
    this.showToast(`انطلق! ${stage.tab}`, false);
  }

  syncHUD() {
    const stage = this.getStage();
    if (this.hudScoreEl) this.hudScoreEl.textContent = String(this.score);
    if (this.hudComboEl) this.hudComboEl.textContent = `×${this.combo}`;
    if (this.hudHpEl) {
      this.hudHpEl.textContent = '♥'.repeat(Math.max(0, this.hp)) + '♡'.repeat(Math.max(0, this.maxHp - this.hp));
    }
    if (this.progressFillEl) {
      const pct = Math.min(100, Math.round((this.hits / stage.targetHits) * 100));
      this.progressFillEl.style.width = `${pct}%`;
    }
  }

  showToast(msg, isBad = false) {
    if (!this.toastEl) return;
    this.toastEl.classList.remove('hidden', 'bad');
    if (isBad) this.toastEl.classList.add('bad');
    renderTex(this.toastEl, msg);
    this.toastTimer = 1.65;
  }

  spawnParticles(sx, sy, color, count = 12) {
    for (let i = 0; i < count; i += 1) {
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const spd = 65 + Math.random() * 140;
      this.particles.push({
        x: sx,
        y: sy,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color,
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7
      });
    }
  }

  awardHit(points, sx, sy, color, msg) {
    this.hits += 1;
    this.attempts += 1;
    this.correctHits += 1;
    this.score += points * this.combo;
    this.combo = Math.min(8, this.combo + 1);
    this.audio.playHit(this.combo);
    window.ArcadeCore?.Gamepad?.triggerHaptic(this.gpState, 60, 0.2, 0.45);
    if (sx !== undefined && sy !== undefined) {
      this.spawnParticles(sx, sy, color || '#10b981', 14);
    }
    if (msg) this.showToast(msg, false);
    this.syncHUD();

    if (this.hits >= this.getStage().targetHits) {
      this.completeStage();
    }
  }

  takeDamage(msg, sx, sy) {
    this.attempts += 1;
    this.combo = 1;
    this.hp = Math.max(0, this.hp - 1);
    this.shake = 0.28;
    this.audio.playDamage();
    window.ArcadeCore?.Gamepad?.triggerHaptic(this.gpState, 160, 0.7, 0.85);
    if (sx !== undefined && sy !== undefined) {
      this.spawnParticles(sx, sy, '#fb7185', 16);
    }
    this.showToast(msg, true);
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

    if (this.endGlyphEl) this.endGlyphEl.textContent = victory ? '🏆' : '💥';
    if (this.endTitleEl) {
      this.endTitleEl.textContent = !victory
        ? 'انهار درع التقارب!'
        : (isFinal ? 'سيطرة تامة على المتتاليات العددية!' : `تمت السيطرة على ${this.getStage().tab}!`);
    }
    if (this.endDescEl) {
      this.endDescEl.textContent = !victory
        ? 'أعد المحاولة — راقب إشارة f(x)−x وقيمة الحدّ لتفادي الفخاخ!'
        : (isFinal ? 'أتممت جميع الأطوار الـ 5 في المقرر الرسمي (41–52) بنجاح.' : 'انتقل للطور التالي أو أعد هذا الطور لتحسين الرتبة.');
    }
    if (this.endScoreEl) this.endScoreEl.textContent = String(this.score);
    if (this.endAccEl) this.endAccEl.textContent = `${acc}%`;
    if (this.endRankEl) this.endRankEl.textContent = rank;

    const hasNext = victory && !isFinal;
    this.btnEndNext?.classList.toggle('hidden', !hasNext);
    this.endOverlayEl?.classList.remove('hidden');
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
      this.pointer.active = true;
      this.pointer.x = e.clientX - r.left;
      this.pointer.y = e.clientY - r.top;
      const mode = this.getStage().mode;
      if (mode === 'induction-catcher') this.triggerAction('shield');
      else if (mode === 'homographic-boss') this.triggerAction('lockPoint');
      else if (mode === 'rhythm-lanes') {
        const lane = clamp(Math.floor((this.pointer.x / this.w) * 3), 0, 2);
        this.st.lane = lane;
        this.triggerAction('pulseHit');
      } else if (mode === 'squeeze-tunnel') {
        this.triggerAction('shield');
      }
    });

    this.canvas.addEventListener('pointermove', (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.pointer.active = true;
      this.pointer.x = e.clientX - r.left;
      this.pointer.y = e.clientY - r.top;
    });

    this.canvas.addEventListener('wheel', (e) => {
      const mode = this.getStage().mode;
      if (mode === 'induction-catcher') {
        e.preventDefault();
        this.st.ceilM = clamp(this.st.ceilM + (e.deltaY < 0 ? 0.25 : -0.25), 2.0, 5.8);
      } else if (mode === 'squeeze-tunnel') {
        e.preventDefault();
        this.st.halfGap = clamp(this.st.halfGap + (e.deltaY < 0 ? 0.1 : -0.1), 0.2, 1.5);
      }
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (this.pauseMenu?.isOpen()) return;
      this.audio.unlock();

      if (this.ended) {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          if (!this.btnEndNext?.classList.contains('hidden')) this.btnEndNext.click();
          else this.btnEndPrimary?.click();
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
        else if (mode === 'rhythm-lanes') this.triggerAction('pulseHit');
        else if (mode === 'homographic-boss') this.triggerAction('dash');
        else if (mode === 'squeeze-tunnel') this.triggerAction('shield');
      } else if (e.code === 'Digit1' || e.code === 'KeyQ') {
        if (mode === 'monotone-shooter') this.triggerAction('beamInc');
        else if (mode === 'homographic-boss') this.triggerAction('lockPoint');
      } else if (e.code === 'Digit2' || e.code === 'KeyE') {
        if (mode === 'monotone-shooter') this.triggerAction('beamDec');
        else if (mode === 'rhythm-lanes') this.triggerAction('sumNova');
      } else if (e.code === 'Digit3' || e.code === 'KeyF') {
        if (mode === 'monotone-shooter') this.triggerAction('beamDiv');
        else if (mode === 'homographic-boss') this.triggerAction('lockPoint');
      } else if (mode === 'rhythm-lanes' && (e.code === 'ArrowLeft' || e.code === 'KeyA')) {
        this.st.lane = clamp(this.st.lane - 1, 0, 2);
      } else if (mode === 'rhythm-lanes' && (e.code === 'ArrowRight' || e.code === 'KeyD')) {
        this.st.lane = clamp(this.st.lane + 1, 0, 2);
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  triggerAction(act) {
    if (this.paused || this.ended) return;
    const mode = this.getStage().mode;

    if (mode === 'induction-catcher') {
      if (act === 'shield') {
        this.st.shieldTimer = 0.28;
        this.audio.tone(440, 0.08, 'sine', 0.07);
      } else if (act === 'ceilUp') {
        this.st.ceilM = clamp(this.st.ceilM + 0.25, 2.0, 5.8);
      } else if (act === 'ceilDown') {
        this.st.ceilM = clamp(this.st.ceilM - 0.25, 2.0, 5.8);
      }
    } else if (mode === 'monotone-shooter') {
      if (act === 'dash' && this.st.dashCd <= 0) {
        this.st.dashTime = 0.2;
        this.st.dashCd = 0.7;
        this.audio.tone(620, 0.08, 'sine', 0.08);
      } else if (act === 'beamInc' || act === 'beamDec' || act === 'beamDiv') {
        const want = act === 'beamInc' ? 'inc' : (act === 'beamDec' ? 'dec' : 'div');
        this.fireMonotoneBeam(want);
      }
    } else if (mode === 'rhythm-lanes') {
      if (act === 'laneLeft') this.st.lane = clamp(this.st.lane - 1, 0, 2);
      else if (act === 'laneRight') this.st.lane = clamp(this.st.lane + 1, 0, 2);
      else if (act === 'pulseHit') this.hitRhythmLane();
      else if (act === 'sumNova') this.fireSumNova();
    } else if (mode === 'homographic-boss') {
      if (act === 'dash' && this.st.dashCd <= 0) {
        this.st.dashTime = 0.22;
        this.st.dashCd = 0.75;
        this.audio.tone(640, 0.08, 'sine', 0.08);
      } else if (act === 'lockPoint') {
        this.attemptFixedPointLock();
      }
    } else if (mode === 'squeeze-tunnel') {
      if (act === 'shield') {
        this.st.shieldTimer = 0.35;
        this.audio.tone(520, 0.09, 'triangle', 0.08);
      } else if (act === 'pinchIn') {
        this.st.halfGap = clamp(this.st.halfGap - 0.14, 0.18, 1.5);
      } else if (act === 'pinchOut') {
        this.st.halfGap = clamp(this.st.halfGap + 0.14, 0.18, 1.5);
      }
    }
  }

  pollGamepad(dt) {
    const GP = window.ArcadeCore?.Gamepad;
    if (!GP || !this.gpState) return { lx: 0, ly: 0, l2: 0, r2: 0 };
    const gp = GP.resolveActiveGamepad(this.gpState);
    GP.updateBanner(this.gpState, this.gpBadgeEl, this.gpBadgeEl, '🎮 لوحة المفاتيح / الماوس');

    if (this.pauseMenu?.pollGamepad(gp, this.gpState)) {
      return { lx: 0, ly: 0, l2: 0, r2: 0 };
    }

    if (!gp) return { lx: 0, ly: 0, l2: 0, r2: 0 };

    if (this.ended) {
      if (GP.justPressed(gp, this.gpState, 0)) {
        this.btnEndPrimary?.click();
      } else if (GP.justPressed(gp, this.gpState, 3) && !this.btnEndNext?.classList.contains('hidden')) {
        this.btnEndNext?.click();
      } else if (GP.justPressed(gp, this.gpState, 1)) {
        window.location.href = '../../index.html?from=game';
      }
      GP.snapshotButtons(gp, this.gpState);
      return { lx: 0, ly: 0, l2: 0, r2: 0 };
    }

    const axes = GP.sampleAnalogAxes(gp, 0.18);
    const nav = GP.sampleDirectionalNav(gp, this.gpState);
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
    } else if (mode === 'rhythm-lanes') {
      if (nav.dLeft) this.st.lane = clamp(this.st.lane - 1, 0, 2);
      if (nav.dRight) this.st.lane = clamp(this.st.lane + 1, 0, 2);
      if (GP.justPressed(gp, this.gpState, 0) || GP.justPressed(gp, this.gpState, 2)) this.triggerAction('pulseHit');
      if (GP.justPressed(gp, this.gpState, 1) || GP.justPressed(gp, this.gpState, 3)) this.triggerAction('sumNova');
    } else if (mode === 'homographic-boss') {
      if (GP.justPressed(gp, this.gpState, 2)) this.triggerAction('lockPoint');
      if (GP.justPressed(gp, this.gpState, 0)) this.triggerAction('dash');
    } else if (mode === 'squeeze-tunnel') {
      if (GP.justPressed(gp, this.gpState, 2) || GP.justPressed(gp, this.gpState, 0)) this.triggerAction('shield');
    }

    GP.snapshotButtons(gp, this.gpState);
    return {
      lx: axes.lx || (gp.buttons[14]?.pressed ? -1 : gp.buttons[15]?.pressed ? 1 : 0),
      ly: axes.ly || (gp.buttons[12]?.pressed ? -1 : gp.buttons[13]?.pressed ? 1 : 0),
      l2: axes.l2,
      r2: axes.r2
    };
  }

  // ---------- Stage 2 Action ----------
  fireMonotoneBeam(want) {
    const stage = this.getStage();
    let best = null;
    let bestD = 999;
    for (const orb of this.st.orbs) {
      const d = Math.hypot(orb.x - this.st.px, orb.y - this.st.py);
      if (d < bestD) {
        bestD = d;
        best = orb;
      }
    }
    if (!best || bestD > 1.45) {
      this.showToast('اقترب من الحدّة أولاً لتوجيه الشعاع!', true);
      return;
    }
    const sx = this.mapX(best.x, stage.domain);
    const sy = this.mapY(best.y, stage.domain);
    if (best.kind === want) {
      this.st.orbs = this.st.orbs.filter((o) => o !== best);
      this.beams.push({
        x1: this.mapX(this.st.px, stage.domain),
        y1: this.mapY(this.st.py, stage.domain),
        x2: sx,
        y2: sy,
        color: want === 'inc' ? '#38bdf8' : want === 'dec' ? '#f59e0b' : '#fb7185',
        life: 0.24
      });
      this.awardHit(120, sx, sy, '#10b981', want === 'div' ? 'صدّ التباعد!' : 'إشارة f(x)−x دقيقة ✓');
    } else {
      this.takeDamage('خطأ في رتابة f(x) − x!', sx, sy);
    }
  }

  // ---------- Stage 3 Action ----------
  hitRhythmLane() {
    const hitY = this.h - 86;
    const lane = this.st.lane;
    let target = null;
    let bestDy = 999;
    for (const n of this.st.notes) {
      if (n.lane !== lane) continue;
      const dy = Math.abs(n.y - hitY);
      if (dy < 62 && dy < bestDy) {
        bestDy = dy;
        target = n;
      }
    }
    if (!target) {
      this.audio.tone(210, 0.06, 'sine', 0.04);
      return;
    }
    const lx = ((target.targetLane + 0.5) / 3) * this.w;
    if (target.lane === target.targetLane) {
      this.st.notes = this.st.notes.filter((n) => n !== target);
      this.st.sumCharge = Math.min(100, this.st.sumCharge + 25);
      this.awardHit(110, lx, hitY, '#10b981', `${target.label} ✓`);
    } else {
      this.st.notes = this.st.notes.filter((n) => n !== target);
      this.takeDamage(`مسار خاطئ! (${target.label})`, lx, hitY);
    }
  }

  fireSumNova() {
    if (this.st.sumCharge < 100) {
      this.showToast(`اشحن خزان Sₙ إلى 100% أولاً (${this.st.sumCharge}%)`, true);
      return;
    }
    this.st.sumCharge = 0;
    const cleared = this.st.notes.length;
    this.st.notes = [];
    this.spawnParticles(this.w * 0.5, this.h * 0.5, '#f59e0b', 28);
    this.awardHit(250 + cleared * 40, this.w * 0.5, this.h * 0.5, '#f59e0b', 'تفجير المجموع Sₙ = u₀(1−qⁿ)/(1−q)!');
  }

  // ---------- Stage 4 Action ----------
  attemptFixedPointLock() {
    const stage = this.getStage();
    const tgt = stage.fixedTargets[this.st.targetIdx % stage.fixedTargets.length];
    const d = Math.hypot(this.st.px - tgt.x, this.st.py - tgt.y);
    const sx = this.mapX(tgt.x, stage.domain);
    const sy = this.mapY(tgt.y, stage.domain);
    if (d <= 0.55) {
      this.beams.push({
        x1: this.mapX(this.st.px, stage.domain),
        y1: this.mapY(this.st.py, stage.domain),
        x2: sx,
        y2: sy,
        color: '#f59e0b',
        life: 0.35
      });
      this.st.targetIdx = (this.st.targetIdx + 1) % stage.fixedTargets.length;
      this.st.bullets = [];
      this.awardHit(180, sx, sy, '#f59e0b', `إقفال النقطة الصامدة ${tgt.label} (f(L)=L)!`);
    } else {
      this.takeDamage(`صوّب على التقاطع ${tgt.label} على y = x!`, this.mapX(this.st.px, stage.domain), this.mapY(this.st.py, stage.domain));
    }
  }

  mapX(vx, domain) {
    const pad = 48;
    return pad + ((vx - domain.min) / (domain.max - domain.min)) * (this.w - pad * 2);
  }

  mapY(vy, domain) {
    const pad = 34;
    return pad + (this.h - pad * 2) - ((vy - domain.min) / (domain.max - domain.min)) * (this.h - pad * 2);
  }

  unmapX(px, domain) {
    const pad = 48;
    return domain.min + ((px - pad) / Math.max(1, this.w - pad * 2)) * (domain.max - domain.min);
  }

  unmapY(py, domain) {
    const pad = 34;
    return domain.min + ((pad + (this.h - pad * 2) - py) / Math.max(1, this.h - pad * 2)) * (domain.max - domain.min);
  }

  loop(ts) {
    const dt = Math.min(0.05, this.lastTs ? (ts - this.lastTs) / 1000 : 0.016);
    this.lastTs = ts;
    const inp = this.pollGamepad(dt);
    if (!this.paused && !this.ended) {
      this.update(dt, inp);
    }
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt, inp) {
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) this.toastEl?.classList.add('hidden');
    }
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);

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
    for (let i = this.cobwebs.length - 1; i >= 0; i -= 1) {
      this.cobwebs[i].life -= dt;
      if (this.cobwebs[i].life <= 0) this.cobwebs.splice(i, 1);
    }

    let kx = (this.keys.ArrowRight || this.keys.KeyD ? 1 : 0) - (this.keys.ArrowLeft || this.keys.KeyA ? 1 : 0);
    let ky = (this.keys.ArrowDown || this.keys.KeyS ? 1 : 0) - (this.keys.ArrowUp || this.keys.KeyW ? 1 : 0);
    const moveX = Math.abs(inp.lx) > 0.1 ? inp.lx : kx;
    const moveY = Math.abs(inp.ly) > 0.1 ? inp.ly : ky;

    const stage = this.getStage();
    const mode = stage.mode;

    if (mode === 'induction-catcher') {
      if (this.pointer.active) {
        const tx = this.unmapX(this.pointer.x, stage.domain);
        this.st.paddleX += (clamp(tx, 0.3, 5.7) - this.st.paddleX) * Math.min(1, dt * 12);
      } else {
        this.st.paddleX = clamp(this.st.paddleX + moveX * dt * 3.8, 0.3, 5.7);
      }
      const ceilDelta = (inp.r2 - inp.l2) + (this.keys.ArrowUp || this.keys.KeyW ? 1 : 0) - (this.keys.ArrowDown || this.keys.KeyS ? 1 : 0);
      this.st.ceilM = clamp(this.st.ceilM + ceilDelta * dt * 2.2, 2.0, 5.8);
      if (this.st.shieldTimer > 0) this.st.shieldTimer -= dt;

      this.st.spawnTimer -= dt;
      if (this.st.spawnTimer <= 0) {
        this.st.spawnTimer = 1.25;
        const rogue = Math.random() < 0.38;
        const u0 = rogue ? (4.35 + Math.random() * 1.3) : (0.5 + Math.random() * 3.2);
        this.st.orbs.push({
          x: u0,
          y: 5.7,
          vy: -(1.25 + Math.random() * 0.45),
          rogue
        });
      }

      for (let i = this.st.orbs.length - 1; i >= 0; i -= 1) {
        const o = this.st.orbs[i];
        o.y += o.vy * dt;
        const caught = Math.abs(o.x - this.st.paddleX) < 0.58 && o.y <= 0.65 && o.y >= 0.0;
        if (caught) {
          this.st.orbs.splice(i, 1);
          const sx = this.mapX(o.x, stage.domain);
          const sy = this.mapY(0.4, stage.domain);
          if (o.rogue) {
            if (this.st.shieldTimer > 0) {
              this.awardHit(130, sx, sy, '#38bdf8', `تم صدّ u₀=${o.x.toFixed(1)} > M!`);
            } else {
              this.takeDamage(`فخ! u₀=${o.x.toFixed(1)} خارج [0, 4] (صدّه بـ ▢)`, sx, sy);
            }
          } else {
            const ceilOk = Math.abs(this.st.ceilM - 4.0) <= 0.65;
            this.cobwebs.push({ u0: o.x, life: 1.4 });
            this.awardHit(ceilOk ? 150 : 100, sx, sy, '#10b981', ceilOk ? 'ترجع مضبوط M≈4 ✓' : 'مقبول (قرّب السقف M→4)');
          }
          continue;
        }
        if (o.y < -0.1) {
          this.st.orbs.splice(i, 1);
          if (!o.rogue) {
            this.takeDamage(`فاتتك البذرة الآمنة u₀=${o.x.toFixed(1)}!`, this.mapX(o.x, stage.domain), this.mapY(0.1, stage.domain));
          }
        }
      }
    } else if (mode === 'monotone-shooter') {
      if (this.st.dashCd > 0) this.st.dashCd -= dt;
      if (this.st.dashTime > 0) this.st.dashTime -= dt;
      const spd = this.st.dashTime > 0 ? 5.8 : 2.9;
      if (this.pointer.active && Math.abs(moveX) < 0.05 && Math.abs(moveY) < 0.05) {
        const tx = this.unmapX(this.pointer.x, stage.domain);
        const ty = this.unmapY(this.pointer.y, stage.domain);
        this.st.px += (clamp(tx, 0.2, 4.0) - this.st.px) * Math.min(1, dt * 8);
        this.st.py += (clamp(ty, 0.2, 4.0) - this.st.py) * Math.min(1, dt * 8);
      } else {
        this.st.px = clamp(this.st.px + moveX * spd * dt, 0.2, 4.0);
        this.st.py = clamp(this.st.py - moveY * spd * dt, 0.2, 4.0);
      }

      this.st.spawnTimer -= dt;
      if (this.st.spawnTimer <= 0 && this.st.orbs.length < 5) {
        this.st.spawnTimer = 1.65;
        const r = Math.random();
        let x0, kind, label;
        if (r < 0.35) {
          x0 = 0.35 + Math.random() * 0.45;
          kind = 'inc';
          label = `u₀=${x0.toFixed(1)}`;
        } else if (r < 0.72) {
          x0 = 1.35 + Math.random() * 1.3;
          kind = 'dec';
          label = `u₀=${x0.toFixed(1)}`;
        } else {
          x0 = 3.25 + Math.random() * 0.65;
          kind = 'div';
          label = `u₀=${x0.toFixed(1)}`;
        }
        this.st.orbs.push({ x: x0, y: stage.f(x0), kind, label, life: 9.0, drift: (Math.random() - 0.5) * 0.25 });
      }

      for (let i = this.st.orbs.length - 1; i >= 0; i -= 1) {
        const o = this.st.orbs[i];
        o.life -= dt;
        o.x = clamp(o.x + o.drift * dt, 0.25, 3.95);
        o.y = stage.f(o.x);
        if (o.life <= 0) {
          this.st.orbs.splice(i, 1);
          this.takeDamage('انتهى وقت تصنيف الحدّ!', this.mapX(o.x, stage.domain), this.mapY(o.y, stage.domain));
        }
      }
    } else if (mode === 'rhythm-lanes') {
      this.st.spawnTimer -= dt;
      if (this.st.spawnTimer <= 0) {
        this.st.spawnTimer = 1.3;
        const catalog = [
          { label: '(0.6)^n', targetLane: 0 },
          { label: '(-0.5)^n', targetLane: 0 },
          { label: 'n^{-2}', targetLane: 0 },
          { label: '3·(1)^n', targetLane: 1 },
          { label: '2 + (0.4)^n', targetLane: 1 },
          { label: '(1.4)^n', targetLane: 2 },
          { label: '(-1.2)^n', targetLane: 2 },
          { label: 'n^{0.5}', targetLane: 2 }
        ];
        const pick = catalog[Math.floor(Math.random() * catalog.length)];
        const spawnLane = Math.floor(Math.random() * 3);
        this.st.notes.push({
          lane: spawnLane,
          targetLane: pick.targetLane,
          label: pick.label,
          y: 36,
          vy: 120 + this.hits * 4
        });
      }
      const hitY = this.h - 86;
      for (let i = this.st.notes.length - 1; i >= 0; i -= 1) {
        const n = this.st.notes[i];
        n.y += n.vy * dt;
        // Player's active gate redirects matching lane if aligned
        if (Math.abs(n.y - hitY) < 42 && n.lane !== this.st.lane) {
          // keep note in its spawn lane; player moves to note's lane OR sorts it!
        }
        if (n.y > this.h - 24) {
          this.st.notes.splice(i, 1);
          this.takeDamage(`فاتتك ${n.label}!`, ((n.lane + 0.5) / 3) * this.w, hitY);
        }
      }
    } else if (mode === 'homographic-boss') {
      if (this.st.dashCd > 0) this.st.dashCd -= dt;
      if (this.st.dashTime > 0) this.st.dashTime -= dt;
      const spd = this.st.dashTime > 0 ? 5.5 : 2.6;
      if (this.pointer.active && Math.abs(moveX) < 0.05 && Math.abs(moveY) < 0.05) {
        this.st.px += (clamp(this.unmapX(this.pointer.x, stage.domain), 0.5, 4.3) - this.st.px) * Math.min(1, dt * 8);
        this.st.py += (clamp(this.unmapY(this.pointer.y, stage.domain), 0.5, 4.3) - this.st.py) * Math.min(1, dt * 8);
      } else {
        this.st.px = clamp(this.st.px + moveX * spd * dt, 0.5, 4.3);
        this.st.py = clamp(this.st.py - moveY * spd * dt, 0.5, 4.3);
      }

      this.st.wavePhase += dt * 1.4;
      this.st.spawnTimer -= dt;
      if (this.st.spawnTimer <= 0) {
        this.st.spawnTimer = 0.85;
        const ang = this.st.wavePhase;
        this.st.bullets.push({
          x: 2.6,
          y: 2.6,
          vx: Math.cos(ang) * 1.65,
          vy: Math.sin(ang) * 1.65
        });
      }
      for (let i = this.st.bullets.length - 1; i >= 0; i -= 1) {
        const b = this.st.bullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < 0.3 || b.x > 4.6 || b.y < 0.3 || b.y > 4.6) {
          this.st.bullets.splice(i, 1);
          continue;
        }
        if (this.st.dashTime <= 0 && Math.hypot(b.x - this.st.px, b.y - this.st.py) < 0.26) {
          this.st.bullets.splice(i, 1);
          this.takeDamage('أصابتك موجة متخاطة! تفادَ بـ [✕]', this.mapX(this.st.px, stage.domain), this.mapY(this.st.py, stage.domain));
        }
      }
    } else if (mode === 'squeeze-tunnel') {
      this.st.scrollT += dt;
      if (this.st.shieldTimer > 0) this.st.shieldTimer -= dt;
      if (this.pointer.active && Math.abs(moveY) < 0.05) {
        const ty = 5.0 - (this.pointer.y / Math.max(1, this.h)) * 5.0;
        this.st.centerY += (clamp(ty, 0.7, 4.3) - this.st.centerY) * Math.min(1, dt * 10);
      } else {
        this.st.centerY = clamp(this.st.centerY - moveY * 2.4 * dt, 0.7, 4.3);
      }
      const gapDelta = (inp.r2 - inp.l2) + (this.keys.ArrowRight || this.keys.KeyD ? 1 : 0) - (this.keys.ArrowLeft || this.keys.KeyA ? 1 : 0);
      this.st.halfGap = clamp(this.st.halfGap + gapDelta * 1.2 * dt, 0.18, 1.5);

      this.st.gateTimer -= dt;
      if (this.st.gateTimer <= 0) {
        this.st.gateTimer = 2.0;
        const isMeteor = Math.random() < 0.35;
        if (isMeteor) {
          this.st.meteors.push({ x: this.w + 30, y: this.h * (0.25 + Math.random() * 0.5), vx: -(210 + this.hits * 8) });
        } else {
          const L = 1.4 + Math.random() * 2.2;
          const reqAmp = 0.25 + Math.random() * 0.4;
          this.st.gates.push({ x: this.w + 40, L, reqAmp, vx: -(185 + this.hits * 6) });
        }
      }

      const shipX = this.w * 0.24;
      const toScreenY = (yv) => this.h - (yv / 5.0) * this.h;
      const shipY = toScreenY(this.st.centerY);

      for (let i = this.st.gates.length - 1; i >= 0; i -= 1) {
        const g = this.st.gates[i];
        g.x += g.vx * dt;
        if (g.x < shipX + 16 && g.x > shipX - 16) {
          const distL = Math.abs(this.st.centerY - g.L);
          const gapOk = this.st.halfGap >= g.reqAmp * 0.85 && this.st.halfGap <= g.reqAmp + 0.45;
          this.st.gates.splice(i, 1);
          if (distL <= 0.65 && gapOk) {
            this.awardHit(135, shipX, shipY, '#10b981', `حصر مثالي عند L=${g.L.toFixed(1)} ✓`);
          } else {
            this.takeDamage(distL > 0.65 ? `مركِز عند L=${g.L.toFixed(1)}!` : 'اضبط فكّي الدركيين (L2/R2 أو ◀▶)!', shipX, shipY);
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
            this.awardHit(140, shipX, shipY, '#38bdf8', 'تدمير شهاب +∞ بدرع α√n!');
          } else {
            this.takeDamage('اصطدمت بشهاب التباعد! فعّل الدرع [▢]', shipX, shipY);
          }
          continue;
        }
        if (m.x < -40) this.st.meteors.splice(i, 1);
      }
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

    if (AK) AK.clearWithGrid(ctx, this.w, this.h, { bg: '#040b12', gridColor: 'rgba(16, 185, 129, 0.08)', step: 36 });
    else {
      ctx.fillStyle = '#040b12';
      ctx.fillRect(0, 0, this.w, this.h);
    }

    const stage = this.getStage();
    const mode = stage.mode;

    if (mode === 'induction-catcher') this.renderInductionCatcher(stage);
    else if (mode === 'monotone-shooter') this.renderMonotoneShooter(stage);
    else if (mode === 'rhythm-lanes') this.renderRhythmLanes();
    else if (mode === 'homographic-boss') this.renderHomographicBoss(stage);
    else if (mode === 'squeeze-tunnel') this.renderSqueezeTunnel();

    for (const b of this.beams) {
      ctx.save();
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 4;
      ctx.globalAlpha = Math.max(0, b.life / 0.35);
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();
      ctx.restore();
    }

    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  drawRich(expr, x, y, opts) {
    const AK = window.ArcadeCore?.CanvasAxisKit;
    if (AK && AK.drawMathRich) AK.drawMathRich(this.ctx, expr, x, y, opts);
    else {
      this.ctx.fillStyle = opts?.color || '#f8fafc';
      this.ctx.fillText(expr, x, y);
    }
  }

  renderInductionCatcher(stage) {
    const ctx = this.ctx;
    const d = stage.domain;
    const toX = (v) => this.mapX(v, d);
    const toY = (v) => this.mapY(v, d);

    // y = x & y = f(x)
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(toX(d.min), toY(d.min));
    ctx.lineTo(toX(d.max), toY(d.max));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    for (let i = 0; i <= 80; i += 1) {
      const xv = d.min + (i / 80) * (d.max - d.min);
      const px = toX(xv);
      const py = toY(stage.f(xv));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Ceiling laser M
    const my = toY(this.st.ceilM);
    const ceilGood = Math.abs(this.st.ceilM - 4.0) <= 0.65;
    ctx.strokeStyle = ceilGood ? '#10b981' : '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(toX(0), my);
    ctx.lineTo(toX(this.st.ceilM), my);
    ctx.lineTo(toX(this.st.ceilM), toY(0));
    ctx.stroke();
    this.drawRich(`M = ${this.st.ceilM.toFixed(2)}`, toX(0) + 52, my - 12, { color: ceilGood ? '#6ee7b7' : '#fde68a', fontSize: 13 });

    // Live cobweb trails from caught seeds
    for (const cw of this.cobwebs) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, cw.life / 1.4);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      let u = cw.u0;
      ctx.moveTo(toX(u), toY(0));
      for (let k = 0; k < 5; k += 1) {
        const nu = stage.f(u);
        ctx.lineTo(toX(u), toY(nu));
        ctx.lineTo(toX(nu), toY(nu));
        u = nu;
      }
      ctx.stroke();
      ctx.restore();
    }

    // Falling seed orbs
    for (const o of this.st.orbs) {
      const px = toX(o.x);
      const py = toY(o.y);
      ctx.fillStyle = o.rogue ? '#fb7185' : '#10b981';
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      this.drawRich(`u_0=${o.x.toFixed(1)}`, px, py - 22, { color: o.rogue ? '#fda4af' : '#d1fae5', fontSize: 11 });
    }

    // Player catcher paddle
    const px = toX(this.st.paddleX);
    const py = toY(0.35);
    ctx.fillStyle = this.st.shieldTimer > 0 ? '#38bdf8' : '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(px - 42, py - 9, 84, 18, 9);
    ctx.fill();
    if (this.st.shieldTimer > 0) {
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px, py, 48, Math.PI, 0);
      ctx.stroke();
    }
  }

  renderMonotoneShooter(stage) {
    const ctx = this.ctx;
    const d = stage.domain;
    const toX = (v) => this.mapX(v, d);
    const toY = (v) => this.mapY(v, d);

    // y = x divider
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toX(d.min), toY(d.min));
    ctx.lineTo(toX(d.max), toY(d.max));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    for (let i = 0; i <= 80; i += 1) {
      const xv = d.min + (i / 80) * (d.max - d.min);
      if (i === 0) ctx.moveTo(toX(xv), toY(stage.f(xv)));
      else ctx.lineTo(toX(xv), toY(stage.f(xv)));
    }
    ctx.stroke();

    this.drawRich('f(x) > x', toX(0.55), toY(1.3), { color: '#7dd3fc', fontSize: 12 });
    this.drawRich('f(x) < x', toX(2.2), toY(1.65), { color: '#fcd34d', fontSize: 12 });

    for (const o of this.st.orbs) {
      const ox = toX(o.x);
      const oy = toY(o.y);
      const col = o.kind === 'inc' ? '#38bdf8' : o.kind === 'dec' ? '#f59e0b' : '#fb7185';
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(ox, oy, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      this.drawRich(o.label, ox, oy - 22, { color: '#f8fafc', fontSize: 11 });
    }

    const px = toX(this.st.px);
    const py = toY(this.st.py);
    ctx.strokeStyle = this.st.dashTime > 0 ? '#6ee7b7' : '#ffffff';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.arc(px, py, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(px, py, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  renderRhythmLanes() {
    const ctx = this.ctx;
    const laneTitles = ['→ 0  (|q| < 1, n^{-p})', '→ L ≠ 0  (q = 1)', '→ ±∞  (|q| > 1, n^{+p})'];
    const laneCols = ['#10b981', '#f59e0b', '#fb7185'];
    const hitY = this.h - 86;

    for (let l = 0; l < 3; l += 1) {
      const x0 = (l / 3) * this.w;
      const lw = this.w / 3;
      const active = this.st.lane === l;
      ctx.fillStyle = active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.45)';
      ctx.fillRect(x0 + 6, 12, lw - 12, this.h - 24);
      ctx.strokeStyle = active ? laneCols[l] : 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = active ? 2.5 : 1;
      ctx.strokeRect(x0 + 6, 12, lw - 12, this.h - 24);

      this.drawRich(laneTitles[l], x0 + lw * 0.5, 32, { color: laneCols[l], fontSize: 12 });

      // Receptor pad at hitY
      ctx.fillStyle = active ? laneCols[l] : 'rgba(30, 41, 59, 0.85)';
      ctx.beginPath();
      ctx.roundRect(x0 + 22, hitY - 14, lw - 44, 28, 14);
      ctx.fill();
    }

    for (const n of this.st.notes) {
      const nx = ((n.lane + 0.5) / 3) * this.w;
      ctx.fillStyle = laneCols[n.targetLane];
      ctx.beginPath();
      ctx.roundRect(nx - 60, n.y - 17, 120, 34, 10);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      this.drawRich(n.label, nx, n.y, { color: '#04090e', fontSize: 13 });
    }

    // Sum tank bar
    this.drawRich(`S_n = ${this.st.sumCharge}%`, this.w - 75, hitY + 46, { color: '#fcd34d', fontSize: 12 });
  }

  renderHomographicBoss(stage) {
    const ctx = this.ctx;
    const d = stage.domain;
    const toX = (v) => this.mapX(v, d);
    const toY = (v) => this.mapY(v, d);

    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(toX(d.min), toY(d.min));
    ctx.lineTo(toX(d.max), toY(d.max));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    for (let i = 0; i <= 80; i += 1) {
      const xv = d.min + (i / 80) * (d.max - d.min);
      if (i === 0) ctx.moveTo(toX(xv), toY(stage.f(xv)));
      else ctx.lineTo(toX(xv), toY(stage.f(xv)));
    }
    ctx.stroke();

    stage.fixedTargets.forEach((tgt, i) => {
      const isCur = i === this.st.targetIdx % stage.fixedTargets.length;
      const tx = toX(tgt.x);
      const ty = toY(tgt.y);
      ctx.strokeStyle = isCur ? '#f59e0b' : 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = isCur ? 3 : 1.5;
      ctx.beginPath();
      ctx.arc(tx, ty, isCur ? 20 : 13, 0, Math.PI * 2);
      ctx.stroke();
      this.drawRich(tgt.label, tx, ty - 26, { color: isCur ? '#fde68a' : '#94a3b8', fontSize: 12 });
    });

    for (const b of this.st.bullets) {
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(toX(b.x), toY(b.y), 7, 0, Math.PI * 2);
      ctx.fill();
    }

    const px = toX(this.st.px);
    const py = toY(this.st.py);
    ctx.strokeStyle = this.st.dashTime > 0 ? '#6ee7b7' : '#ffffff';
    ctx.lineWidth = 2.5;
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

  renderSqueezeTunnel() {
    const ctx = this.ctx;
    const toScreenY = (yv) => this.h - (yv / 5.0) * this.h;
    const shipX = this.w * 0.24;
    const shipY = toScreenY(this.st.centerY);
    const topY = toScreenY(this.st.centerY + this.st.halfGap);
    const botY = toScreenY(this.st.centerY - this.st.halfGap);

    // Gendarme pincers
    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
    ctx.fillRect(0, topY, this.w, botY - topY);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(0, topY);
    ctx.lineTo(this.w, topY);
    ctx.moveTo(0, botY);
    ctx.lineTo(this.w, botY);
    ctx.stroke();

    this.drawRich('w_n', 36, topY - 12, { color: '#fde68a', fontSize: 12 });
    this.drawRich('v_n', 36, botY + 14, { color: '#fde68a', fontSize: 12 });

    // Incoming target gates
    for (const g of this.st.gates) {
      const gy = toScreenY(g.L);
      const halfPx = (g.reqAmp / 5.0) * this.h;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(g.x - 10, gy - halfPx, 20, halfPx * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(g.x - 10, gy - halfPx, 20, halfPx * 2);
      this.drawRich(`L=${g.L.toFixed(1)}`, g.x, gy - halfPx - 14, { color: '#bae6fd', fontSize: 12 });
    }

    // Divergence meteors
    for (const m of this.st.meteors) {
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.arc(m.x, m.y, 16, 0, Math.PI * 2);
      ctx.fill();
      this.drawRich('+∞', m.x, m.y, { color: '#ffffff', fontSize: 12 });
    }

    // Oscillating spark inside corridor
    const oscY = shipY + Math.sin(this.st.scrollT * 9) * Math.min(24, (botY - topY) * 0.35);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(shipX, oscY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
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
  new SequenceArcadeGame();
});
