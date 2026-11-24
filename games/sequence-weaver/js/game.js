import { GAME_ID, STAGES } from './levels.js';

const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];

class SequenceAudio {
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

  playStep(val, minV = 0, maxV = 6) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const norm = Math.max(0, Math.min(1, (val - minV) / Math.max(0.001, maxV - minV)));
    const idx = Math.min(PENTATONIC.length - 1, Math.floor(norm * PENTATONIC.length));
    const freq = PENTATONIC[idx];
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.075, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playSuccess() {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.055;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  playFail() {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.22);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }
}

function bidi(el, text) {
  if (!el) return;
  if (window.ArcadeCore && typeof window.ArcadeCore.setBidiSafeMath === 'function') {
    window.ArcadeCore.setBidiSafeMath(el, text);
  } else {
    el.textContent = String(text ?? '');
  }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function snap(v, min, max, step) {
  const s = step || 0.1;
  const snapped = Math.round((v - min) / s) * s + min;
  const fixed = Number(snapped.toFixed(4));
  return clamp(fixed, min, max);
}

class SequenceWeaverGame {
  constructor() {
    this.canvas = document.getElementById('weaverCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.wrap = document.getElementById('canvasWrap');

    this.stageTabsEl = document.getElementById('stageTabs');
    this.scoreEl = document.getElementById('scoreVal');
    this.clearedEl = document.getElementById('clearedVal');
    this.stageTagEl = document.getElementById('stageTag');
    this.roundTagEl = document.getElementById('roundTag');
    this.formulaTagEl = document.getElementById('formulaTag');
    this.roundTitleEl = document.getElementById('roundTitle');
    this.missionTextEl = document.getElementById('missionText');
    this.liveChecksEl = document.getElementById('liveChecks');
    this.controlsEl = document.getElementById('dynamicControls');
    this.proofCardEl = document.getElementById('proofCard');
    this.proofTextEl = document.getElementById('proofText');
    this.feedbackEl = document.getElementById('stageFeedback');
    this.btnLaunch = document.getElementById('btnLaunch');
    this.btnLaunchLabel = document.getElementById('btnLaunchLabel');
    this.btnNextRound = document.getElementById('btnNextRound');
    this.btnHint = document.getElementById('btnHint');
    this.btnAudio = document.getElementById('btnAudio');
    this.btnReset = document.getElementById('btnReset');
    this.victoryModal = document.getElementById('victoryModal');

    this.audio = new SequenceAudio();
    this.gpState = window.ArcadeCore?.Gamepad?.createState ? window.ArcadeCore.Gamepad.createState() : null;

    this.stageIdx = 0;
    this.roundIdx = 0;
    this.paramState = {};
    this.clearedRounds = new Set();
    this.clearedStages = new Set();
    this.score = 0;
    this.attempts = 0;
    this.correctAttempts = 0;
    this.showProof = false;

    this.handles = [];
    this.activeDrag = null;
    this.hoverHandleId = null;
    this.particles = [];
    this.anim = { active: false, progress: 0, maxSteps: 12, lastStepChime: -1, evalResult: null };

    this.w = 720;
    this.h = 460;
    this.dpr = 1;
    this.lastTs = 0;

    this.init();
  }

  init() {
    this.setupResize();
    this.renderStageTabs();
    this.loadRound(0, 0);
    this.bindEvents();
    requestAnimationFrame((ts) => this.loop(ts));
  }

  setupResize() {
    const updateSize = () => {
      if (!this.wrap || !this.canvas) return;
      const rect = this.wrap.getBoundingClientRect();
      const w = Math.max(300, Math.floor(rect.width));
      const h = Math.max(280, Math.floor(rect.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (w !== this.w || h !== this.h || dpr !== this.dpr) {
        this.w = w;
        this.h = h;
        this.dpr = dpr;
        this.canvas.width = Math.floor(w * dpr);
        this.canvas.height = Math.floor(h * dpr);
        if (this.paramState && Object.keys(this.paramState).length > 0) {
          this.render();
        }
      }
    };
    updateSize();
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(updateSize).observe(this.wrap);
    } else {
      window.addEventListener('resize', updateSize);
    }
  }

  getStage() {
    return STAGES[this.stageIdx];
  }

  getRound() {
    return this.getStage().rounds[this.roundIdx];
  }

  renderStageTabs() {
    if (!this.stageTabsEl) return;
    this.stageTabsEl.innerHTML = STAGES.map((st, idx) => {
      const cls = ['stage-tab'];
      if (idx === this.stageIdx) cls.push('active');
      if (this.clearedStages.has(st.id)) cls.push('done');
      return `<button class="${cls.join(' ')}" data-stage="${idx}" type="button"><span class="tab-dot"></span><span>${st.tabTitle}</span></button>`;
    }).join('');

    this.stageTabsEl.querySelectorAll('.stage-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.unlock();
        const idx = Number(btn.getAttribute('data-stage'));
        this.loadRound(idx, 0);
      });
    });
  }

  loadRound(stageIdx, roundIdx) {
    this.stageIdx = clamp(stageIdx, 0, STAGES.length - 1);
    const stage = this.getStage();
    this.roundIdx = clamp(roundIdx, 0, stage.rounds.length - 1);
    const round = this.getRound();

    this.paramState = {};
    for (const p of round.params || []) {
      this.paramState[p.key] = p.init;
    }
    if (round.choice) {
      this.paramState[round.choice.key] = round.choice.init;
    }

    this.anim = { active: false, progress: 0, maxSteps: 12, lastStepChime: -1, evalResult: null };
    this.hideFeedback();
    this.btnNextRound?.classList.add('hidden');
    if (this.btnLaunchLabel) {
      this.btnLaunchLabel.textContent = this.clearedRounds.has(round.id) ? 'إعادة المحاكاة ⚡' : 'أطلق النبضة وتحقق';
    }

    if (this.stageTagEl) bidi(this.stageTagEl, `${stage.tabTitle} • ${stage.skillLabel}`);
    if (this.roundTagEl) this.roundTagEl.textContent = `${this.roundIdx + 1} / ${stage.rounds.length}`;
    if (this.formulaTagEl) bidi(this.formulaTagEl, round.formula);
    bidi(this.roundTitleEl, round.title);
    bidi(this.missionTextEl, round.mission);
    bidi(this.proofTextEl, round.proof);

    this.renderStageTabs();
    this.renderDynamicControls();
    this.updateLiveChecks();
    this.updateTopMetrics();
    if (this.w > 0 && this.h > 0) this.render();
  }

  renderDynamicControls() {
    if (!this.controlsEl) return;
    const round = this.getRound();
    this.controlsEl.textContent = '';

    for (const p of round.params || []) {
      const row = document.createElement('div');
      row.className = 'ctrl-row';

      const head = document.createElement('div');
      head.className = 'ctrl-head';
      const lbl = document.createElement('span');
      bidi(lbl, p.label);
      const valSpan = document.createElement('span');
      valSpan.className = 'ctrl-val';
      valSpan.dir = 'ltr';
      valSpan.id = `val_${p.key}`;
      valSpan.textContent = this.formatParam(p.key, this.paramState[p.key]);
      head.appendChild(lbl);
      head.appendChild(valSpan);

      const sliderRow = document.createElement('div');
      sliderRow.className = 'ctrl-slider-row';

      const minusBtn = document.createElement('button');
      minusBtn.type = 'button';
      minusBtn.className = 'nudge-btn';
      minusBtn.textContent = '−';
      minusBtn.addEventListener('click', () => {
        this.audio.unlock();
        this.setParam(p.key, this.paramState[p.key] - p.step);
      });

      const range = document.createElement('input');
      range.type = 'range';
      range.className = 'ctrl-range';
      range.id = `rng_${p.key}`;
      range.min = String(p.min);
      range.max = String(p.max);
      range.step = String(p.step);
      range.value = String(this.paramState[p.key]);
      range.addEventListener('input', () => {
        this.audio.unlock();
        this.setParam(p.key, parseFloat(range.value));
      });

      const plusBtn = document.createElement('button');
      plusBtn.type = 'button';
      plusBtn.className = 'nudge-btn';
      plusBtn.textContent = '+';
      plusBtn.addEventListener('click', () => {
        this.audio.unlock();
        this.setParam(p.key, this.paramState[p.key] + p.step);
      });

      sliderRow.appendChild(minusBtn);
      sliderRow.appendChild(range);
      sliderRow.appendChild(plusBtn);
      row.appendChild(head);
      row.appendChild(sliderRow);
      this.controlsEl.appendChild(row);
    }

    if (round.choice) {
      const c = round.choice;
      const row = document.createElement('div');
      row.className = 'ctrl-row';
      const head = document.createElement('div');
      head.className = 'ctrl-head';
      const lbl = document.createElement('span');
      bidi(lbl, c.label);
      head.appendChild(lbl);

      const cRow = document.createElement('div');
      cRow.className = 'choice-row';
      c.options.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `choice-btn ${this.paramState[c.key] === opt.value ? 'active' : ''}`;
        bidi(btn, opt.label);
        btn.addEventListener('click', () => {
          this.audio.unlock();
          this.paramState[c.key] = opt.value;
          cRow.querySelectorAll('.choice-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          this.anim.active = false;
          this.hideFeedback();
          this.updateLiveChecks();
        });
        cRow.appendChild(btn);
      });

      row.appendChild(head);
      row.appendChild(cRow);
      this.controlsEl.appendChild(row);
    }
  }

  formatParam(key, val) {
    if (key === 'steps') return String(Math.round(val));
    if (key === 'est') return Number(val).toFixed(3);
    return Number(val).toFixed(2);
  }

  setParam(key, val) {
    const round = this.getRound();
    const spec = (round.params || []).find((p) => p.key === key);
    if (!spec) return;
    const clamped = snap(val, spec.min, spec.max, spec.step);
    this.paramState[key] = clamped;
    const rng = document.getElementById(`rng_${key}`);
    if (rng) rng.value = String(clamped);
    const vEl = document.getElementById(`val_${key}`);
    if (vEl) vEl.textContent = this.formatParam(key, clamped);
    this.anim.active = false;
    this.hideFeedback();
    this.updateLiveChecks();
  }

  updateLiveChecks() {
    if (!this.liveChecksEl) return;
    const round = this.getRound();
    const res = round.evaluate(this.paramState);
    this.liveChecksEl.textContent = '';
    for (const chk of res.checks) {
      const li = document.createElement('li');
      li.className = `live-check-item ${chk.ok ? 'pass' : 'fail'}`;
      const txt = document.createElement('span');
      bidi(txt, chk.label);
      const st = document.createElement('span');
      st.className = 'check-status';
      st.textContent = chk.ok ? '✓' : '✕';
      li.appendChild(txt);
      li.appendChild(st);
      this.liveChecksEl.appendChild(li);
    }
    return res;
  }

  updateTopMetrics() {
    if (this.scoreEl) this.scoreEl.textContent = String(this.score);
    if (this.clearedEl) this.clearedEl.textContent = `${this.clearedStages.size}/${STAGES.length}`;
  }

  showFeedback(msg, type) {
    if (!this.feedbackEl) return;
    this.feedbackEl.className = `stage-feedback ${type}`;
    bidi(this.feedbackEl, msg);
  }

  hideFeedback() {
    if (!this.feedbackEl) return;
    this.feedbackEl.className = 'stage-feedback hidden';
  }

  launchSimulation() {
    this.audio.unlock();
    const round = this.getRound();
    const res = this.updateLiveChecks();

    this.attempts += 1;
    if (res.ok) this.correctAttempts += 1;

    if (window.ArcadeCore?.Progress?.recordAnswer) {
      window.ArcadeCore.Progress.recordAnswer(GAME_ID, round.skillTopic, res.ok);
    }

    this.anim = {
      active: true,
      progress: 0,
      maxSteps: 12,
      lastStepChime: -1,
      evalResult: res
    };

    if (res.ok) {
      const wasCleared = this.clearedRounds.has(round.id);
      this.clearedRounds.add(round.id);
      if (!wasCleared) this.score += 200;

      const stage = this.getStage();
      if (stage.rounds.every((r) => this.clearedRounds.has(r.id))) {
        this.clearedStages.add(stage.id);
      }

      this.spawnBurst(this.w * 0.45, this.h * 0.45, '#10b981', 20);
      this.audio.playSuccess();
      this.showFeedback(res.okMsg, 'ok');
      this.btnNextRound?.classList.remove('hidden');
      this.renderStageTabs();
      this.updateTopMetrics();
      this.syncProgress();
    } else {
      this.audio.playFail();
      this.showFeedback(res.failMsg, 'err');
      this.syncProgress();
    }
  }

  syncProgress() {
    if (!window.ArcadeCore?.Progress?.recordRun) return;
    const acc = this.attempts > 0 ? Math.round((this.correctAttempts / this.attempts) * 100) : 100;
    const victory = this.clearedStages.size >= STAGES.length;
    window.ArcadeCore.Progress.recordRun(GAME_ID, {
      score: this.score,
      stagesCleared: this.clearedStages.size,
      totalStages: STAGES.length,
      victory,
      accuracy: acc,
      answersAlreadyRecorded: true
    });
  }

  advanceRound() {
    this.audio.unlock();
    const stage = this.getStage();
    if (this.roundIdx + 1 < stage.rounds.length) {
      this.loadRound(this.stageIdx, this.roundIdx + 1);
      return;
    }
    if (this.stageIdx + 1 < STAGES.length) {
      this.loadRound(this.stageIdx + 1, 0);
      return;
    }
    this.openVictory();
  }

  openVictory() {
    const acc = this.attempts > 0 ? Math.round((this.correctAttempts / this.attempts) * 100) : 100;
    const rank = window.ArcadeCore?.Progress?.computeRank
      ? window.ArcadeCore.Progress.computeRank({ victory: true, accuracy: acc, sealsCleared: 4, bypasses: 0 })
      : 'S';
    const descEl = document.getElementById('victoryDesc');
    bidi(descEl, 'أتممت بنجاح جميع مهارات الدرس 3: الترجع، المحدودية، الرتابة، الهندسية والحسابية، المساعدة المتخاطة، الدركيين، والنقطة الصامدة ($u_{n+1}=f(u_n)$)!');
    const vs = document.getElementById('vScore');
    const va = document.getElementById('vAcc');
    const vr = document.getElementById('vRank');
    if (vs) vs.textContent = String(this.score);
    if (va) va.textContent = `${acc}%`;
    if (vr) vr.textContent = rank;
    this.victoryModal?.classList.remove('hidden');
    this.syncProgress();
  }

  spawnBurst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const spd = 45 + Math.random() * 115;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 0.75,
        maxLife: 0.75,
        color
      });
    }
  }

  bindEvents() {
    this.btnLaunch?.addEventListener('click', () => this.launchSimulation());
    this.btnNextRound?.addEventListener('click', () => this.advanceRound());

    this.btnHint?.addEventListener('click', () => {
      this.audio.unlock();
      this.showProof = !this.showProof;
      this.proofCardEl?.classList.toggle('hidden', !this.showProof);
      this.btnHint?.classList.toggle('active', this.showProof);
    });

    this.btnAudio?.addEventListener('click', () => {
      this.audio.muted = !this.audio.muted;
      if (this.btnAudio) this.btnAudio.textContent = this.audio.muted ? '🔇' : '🔊';
      if (!this.audio.muted) this.audio.unlock();
    });

    this.btnReset?.addEventListener('click', () => {
      this.audio.unlock();
      this.loadRound(this.stageIdx, this.roundIdx);
    });

    document.getElementById('btnReplayAll')?.addEventListener('click', () => {
      this.victoryModal?.classList.add('hidden');
      this.clearedRounds.clear();
      this.clearedStages.clear();
      this.score = 0;
      this.attempts = 0;
      this.correctAttempts = 0;
      this.loadRound(0, 0);
    });

    // Direct pointer dragging on canvas handles
    const toLocal = (e) => {
      const r = this.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      this.audio.unlock();
      const pt = toLocal(e);
      let best = null;
      let bestDist = 28;
      for (const h of this.handles) {
        const d = Math.hypot(pt.x - h.x, pt.y - h.y);
        if (d <= bestDist) {
          bestDist = d;
          best = h;
        }
      }
      if (best) {
        this.activeDrag = best;
        this.canvas.classList.add('dragging');
        this.canvas.setPointerCapture?.(e.pointerId);
        best.onDrag(pt.x, pt.y);
      }
    });

    this.canvas.addEventListener('pointermove', (e) => {
      const pt = toLocal(e);
      if (this.activeDrag) {
        this.activeDrag.onDrag(pt.x, pt.y);
        return;
      }
      let hover = null;
      let bestDist = 24;
      for (const h of this.handles) {
        const d = Math.hypot(pt.x - h.x, pt.y - h.y);
        if (d <= bestDist) {
          bestDist = d;
          hover = h.id;
        }
      }
      this.hoverHandleId = hover;
      this.canvas.style.cursor = hover ? 'grab' : 'default';
    });

    const stopDrag = () => {
      this.activeDrag = null;
      this.canvas.classList.remove('dragging');
    };
    this.canvas.addEventListener('pointerup', stopDrag);
    this.canvas.addEventListener('pointercancel', stopDrag);

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (!this.victoryModal?.classList.contains('hidden')) return;
      this.audio.unlock();
      const round = this.getRound();
      const p0 = round.params?.[0];
      const p1 = round.params?.[1];

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!this.btnNextRound?.classList.contains('hidden')) {
          this.advanceRound();
        } else {
          this.launchSimulation();
        }
      } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && p0) {
        e.preventDefault();
        this.setParam(p0.key, this.paramState[p0.key] + p0.step);
      } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && p0) {
        e.preventDefault();
        this.setParam(p0.key, this.paramState[p0.key] - p0.step);
      } else if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && p1) {
        e.preventDefault();
        this.setParam(p1.key, this.paramState[p1.key] + p1.step);
      } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && p1) {
        e.preventDefault();
        this.setParam(p1.key, this.paramState[p1.key] - p1.step);
      } else if (e.key === 'h' || e.key === 'H') {
        this.btnHint?.click();
      } else if (e.key === 'r' || e.key === 'R') {
        this.loadRound(this.stageIdx, this.roundIdx);
      } else if (e.key === 'm' || e.key === 'M') {
        this.btnAudio?.click();
      } else if (e.key === ']') {
        this.loadRound((this.stageIdx + 1) % STAGES.length, 0);
      } else if (e.key === '[') {
        this.loadRound((this.stageIdx - 1 + STAGES.length) % STAGES.length, 0);
      }
    });
  }

  pollGamepad(dt) {
    const GP = window.ArcadeCore?.Gamepad;
    if (!GP || !this.gpState) return;
    const gp = GP.resolveActiveGamepad(this.gpState);
    if (!gp) return;

    const round = this.getRound();
    const p0 = round.params?.[0];
    const p1 = round.params?.[1];
    const nav = GP.sampleDirectionalNav(gp, this.gpState);

    if (p0 && nav.dRight) this.setParam(p0.key, this.paramState[p0.key] + p0.step);
    if (p0 && nav.dLeft) this.setParam(p0.key, this.paramState[p0.key] - p0.step);
    if (p1 && nav.dUp) this.setParam(p1.key, this.paramState[p1.key] + p1.step);
    if (p1 && nav.dDown) this.setParam(p1.key, this.paramState[p1.key] - p1.step);

    if (GP.justPressed(gp, this.gpState, 0)) {
      if (!this.btnNextRound?.classList.contains('hidden')) this.advanceRound();
      else this.launchSimulation();
    }
    if (GP.justPressed(gp, this.gpState, 1)) this.loadRound(this.stageIdx, this.roundIdx);
    if (GP.justPressed(gp, this.gpState, 4)) this.loadRound((this.stageIdx - 1 + STAGES.length) % STAGES.length, 0);
    if (GP.justPressed(gp, this.gpState, 5)) this.loadRound((this.stageIdx + 1) % STAGES.length, 0);

    GP.snapshotButtons(gp, this.gpState);
  }

  loop(ts) {
    const dt = Math.min(0.05, this.lastTs ? (ts - this.lastTs) / 1000 : 0.016);
    this.lastTs = ts;

    this.pollGamepad(dt);
    this.update(dt);
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (this.anim.active && this.anim.progress < this.anim.maxSteps) {
      this.anim.progress = Math.min(this.anim.maxSteps, this.anim.progress + dt * 11.5);
      const stepIdx = Math.floor(this.anim.progress);
      if (stepIdx > this.anim.lastStepChime && stepIdx < this.anim.maxSteps) {
        this.anim.lastStepChime = stepIdx;
        const round = this.getRound();
        if (round.f) {
          let u = this.paramState.u0 ?? round.u0 ?? 1;
          for (let i = 0; i < stepIdx; i += 1) u = round.f(u);
          if (Number.isFinite(u)) {
            const dMin = round.domain?.min ?? 0;
            const dMax = round.domain?.max ?? 6;
            this.audio.playStep(u, dMin, dMax);
          }
        }
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  drawLabel(text, x, y, opts = {}) {
    const ctx = this.ctx;
    const str = String(text ?? '');
    const rich = window.ArcadeCore?.CanvasAxisKit?.drawMathRich;
    const hasArabic = /[\u0600-\u06FF]/.test(str);
    const hasRichMath = !hasArabic && /[₀-₉⁰-⁹ₙˣ√=_^{}\\]/.test(str);
    if (hasRichMath && rich) {
      const sz = opts.fontSize || (opts.font && /(\d+)px/.test(opts.font) ? Number(RegExp.$1) + 1 : 12);
      rich(ctx, str, x, y, {
        fontSize: sz,
        color: opts.color || '#e2e8f0',
        align: opts.align || 'center',
        baseline: opts.baseline || 'middle'
      });
      return;
    }
    ctx.save();
    ctx.direction = hasArabic ? 'rtl' : 'ltr';
    ctx.font = opts.font || '700 11px "Cairo", "KaTeX_Main", sans-serif';
    ctx.textAlign = opts.align || 'center';
    ctx.textBaseline = opts.baseline || 'middle';
    ctx.fillStyle = opts.color || '#e2e8f0';
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  drawDragHandle(id, x, y, label, color) {
    const ctx = this.ctx;
    const active = this.activeDrag?.id === id || this.hoverHandleId === id;
    const r = active ? 10 : 8;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r + 5, 0, Math.PI * 2);
    ctx.fillStyle = `${color}33`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#041014';
    ctx.stroke();

    if (label) {
      const w = Math.max(46, label.length * 7 + 12);
      ctx.fillStyle = 'rgba(4, 15, 20, 0.9)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y - r - 24, w, 18, 5);
      ctx.fill();
      ctx.stroke();
      this.drawLabel(label, x, y - r - 15, { color: '#fff', font: '800 10px "JetBrains Mono", monospace' });
    }
    ctx.restore();
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);

    this.handles = [];
    if (window.ArcadeCore?.CanvasAxisKit?.clearWithGrid) {
      window.ArcadeCore.CanvasAxisKit.clearWithGrid(ctx, this.w, this.h, {
        bg: '#030b0e',
        gridColor: 'rgba(16, 185, 129, 0.08)',
        step: 34,
        offset: 18
      });
    } else {
      ctx.fillStyle = '#030b0e';
      ctx.fillRect(0, 0, this.w, this.h);
    }

    const round = this.getRound();
    const mode = round.mode;

    if (mode === 'geometric-spectrum') {
      this.renderGeometricSpectrum(round);
    } else if (mode === 'arithmetic-and-ref') {
      this.renderArithmeticAndRef(round);
    } else if (mode === 'squeeze-corridor' || mode === 'squeeze-contraction') {
      this.renderSqueezeCorridor(round);
    } else if (mode.startsWith('auxiliary-')) {
      this.renderCobwebAndAuxiliary(round);
    } else {
      this.renderCobwebAndTrajectory(round);
    }

    for (const p of this.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  renderCobwebAndTrajectory(round) {
    const ctx = this.ctx;
    const isWide = this.w >= 620;
    const pad = 26;
    const cobRect = isWide
      ? { x: pad, y: 20, w: Math.floor(this.w * 0.56) - pad, h: this.h - 46 }
      : { x: pad, y: 16, w: this.w - pad * 2, h: Math.floor(this.h * 0.56) - 20 };
    const trajRect = isWide
      ? { x: cobRect.x + cobRect.w + 26, y: 20, w: this.w - (cobRect.x + cobRect.w + 42), h: this.h - 46 }
      : { x: pad, y: cobRect.y + cobRect.h + 24, w: this.w - pad * 2, h: this.h - (cobRect.y + cobRect.h + 40) };

    const dMin = round.domain.min;
    const dMax = round.domain.max;
    const toPxX = (x) => cobRect.x + ((x - dMin) / (dMax - dMin)) * cobRect.w;
    const toPxY = (y) => cobRect.y + cobRect.h - ((y - dMin) / (dMax - dMin)) * cobRect.h;
    const fromPxX = (px) => dMin + ((px - cobRect.x) / cobRect.w) * (dMax - dMin);
    const fromPxY = (py) => dMin + ((cobRect.y + cobRect.h - py) / cobRect.h) * (dMax - dMin);

    // Clip to cobweb plot box
    ctx.save();
    ctx.fillStyle = 'rgba(6, 20, 26, 0.72)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cobRect.x, cobRect.y, cobRect.w, cobRect.h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.clip();

    // Axes
    const ox = toPxX(0);
    const oy = toPxY(0);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.beginPath();
    ctx.moveTo(cobRect.x, oy);
    ctx.lineTo(cobRect.x + cobRect.w, oy);
    ctx.moveTo(ox, cobRect.y);
    ctx.lineTo(ox, cobRect.y + cobRect.h);
    ctx.stroke();

    // Shaded f(x) - x monotonicity zones
    if (round.mode === 'monotone-balance') {
      const steps = 90;
      for (let i = 0; i < steps; i += 1) {
        const x0 = dMin + (i / steps) * (dMax - dMin);
        const x1 = dMin + ((i + 1) / steps) * (dMax - dMin);
        const xm = 0.5 * (x0 + x1);
        const fx = round.f(xm);
        if (!Number.isFinite(fx)) continue;
        const px0 = toPxX(x0);
        const px1 = toPxX(x1);
        const pyF = toPxY(fx);
        const pyD = toPxY(xm);
        ctx.fillStyle = fx >= xm ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.14)';
        ctx.fillRect(px0, Math.min(pyF, pyD), Math.max(1, px1 - px0), Math.abs(pyF - pyD));
      }
    }

    // Invariant box [m, M] x [m, M] for induction modes
    if (round.mode === 'cobweb-bound-ceil' || round.mode === 'cobweb-bound-floor') {
      const lo = round.mode === 'cobweb-bound-floor' ? this.paramState.boundm : 0;
      const hi = round.mode === 'cobweb-bound-ceil' ? this.paramState.boundM : 6;
      const bx0 = toPxX(lo);
      const bx1 = toPxX(hi);
      const by0 = toPxY(hi);
      const by1 = toPxY(lo);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.fillRect(bx0, by0, bx1 - bx0, by1 - by0);
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(bx0, by0, bx1 - bx0, by1 - by0);
      ctx.setLineDash([]);
    }

    // y = x diagonal
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.72)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(toPxX(dMin), toPxY(dMin));
    ctx.lineTo(toPxX(dMax), toPxY(dMax));
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve y = f(x)
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= 160; i += 1) {
      const x = dMin + (i / 160) * (dMax - dMin);
      const y = round.f(x);
      if (!Number.isFinite(y)) {
        started = false;
        continue;
      }
      const px = toPxX(x);
      const py = toPxY(y);
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Highlight out-of-bounds curve segment in induction modes
    if (round.mode === 'cobweb-bound-ceil' || round.mode === 'cobweb-bound-floor') {
      const lo = round.mode === 'cobweb-bound-floor' ? this.paramState.boundm : 0;
      const hi = round.mode === 'cobweb-bound-ceil' ? this.paramState.boundM : 6;
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      let segStarted = false;
      for (let i = 0; i <= 100; i += 1) {
        const x = lo + (i / 100) * (hi - lo);
        const y = round.f(x);
        const outside = !Number.isFinite(y) || y > hi + 1e-4 || y < lo - 1e-4;
        if (outside && Number.isFinite(y)) {
          const px = toPxX(x);
          const py = toPxY(y);
          if (!segStarted) {
            ctx.moveTo(px, py);
            segStarted = true;
          } else {
            ctx.lineTo(px, py);
          }
        } else {
          segStarted = false;
        }
      }
      ctx.stroke();
    }

    // Fixed-point beacons
    for (const fp of round.fixedPoints || []) {
      const fpx = toPxX(fp);
      const fpy = toPxY(fp);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(fpx, fpy, 6, 0, Math.PI * 2);
      ctx.stroke();
      this.drawLabel(`L=${Number(fp.toFixed(2))}`, fpx + 18, fpy - 12, { color: '#fcd34d', font: '800 10px "JetBrains Mono", monospace' });
    }

    // Sequence trajectory points + Cobweb path
    const u0 = this.paramState.u0;
    const terms = [u0];
    let curr = u0;
    const maxTerms = round.mode === 'heron-approx' ? Math.max(5, Math.round(this.paramState.steps) + 1) : 13;
    for (let i = 0; i < maxTerms; i += 1) {
      const nxt = round.f(curr);
      if (!Number.isFinite(nxt) || Math.abs(nxt) > 50) break;
      terms.push(nxt);
      curr = nxt;
    }

    const visibleSteps = this.anim.active ? Math.min(terms.length - 1, this.anim.progress) : Math.min(terms.length - 1, 8);
    ctx.strokeStyle = this.anim.active && this.anim.evalResult && !this.anim.evalResult.ok ? '#fb7185' : '#10b981';
    ctx.lineWidth = this.anim.active ? 2.2 : 1.5;
    ctx.beginPath();
    ctx.moveTo(toPxX(u0), toPxY(0));
    const fullSteps = Math.floor(visibleSteps);
    const frac = visibleSteps - fullSteps;

    for (let i = 0; i < fullSteps; i += 1) {
      const u = terms[i];
      const nu = terms[i + 1];
      ctx.lineTo(toPxX(u), toPxY(nu));
      ctx.lineTo(toPxX(nu), toPxY(nu));
    }
    if (frac > 0 && fullSteps < terms.length - 1) {
      const u = terms[fullSteps];
      const nu = terms[fullSteps + 1];
      if (frac < 0.5) {
        const t = frac * 2;
        const startY = fullSteps === 0 ? 0 : u;
        ctx.lineTo(toPxX(u), toPxY(startY + (nu - startY) * t));
      } else {
        const t = (frac - 0.5) * 2;
        ctx.lineTo(toPxX(u), toPxY(nu));
        ctx.lineTo(toPxX(u + (nu - u) * t), toPxY(nu));
      }
    }
    ctx.stroke();

    ctx.restore();

    // Drag handles (unclipped so tooltips stay visible!)
    const u0Spec = (round.params || []).find((p) => p.key === 'u0');
    if (u0Spec) {
      const hx = clamp(toPxX(u0), cobRect.x + 8, cobRect.x + cobRect.w - 8);
      const hy = clamp(toPxY(0), cobRect.y + 12, cobRect.y + cobRect.h - 12);
      this.drawDragHandle('u0', hx, hy, `u_0=${u0.toFixed(2)}`, '#10b981');
      this.handles.push({
        id: 'u0', x: hx, y: hy,
        onDrag: (px) => this.setParam('u0', fromPxX(px))
      });
    }

    if (round.mode === 'cobweb-bound-ceil') {
      const M = this.paramState.boundM;
      const hx = clamp(toPxX(M * 0.52), cobRect.x + 26, cobRect.x + cobRect.w - 26);
      const hy = clamp(toPxY(M), cobRect.y + 14, cobRect.y + cobRect.h - 14);
      this.drawDragHandle('boundM', hx, hy, `M=${M.toFixed(2)}`, '#f59e0b');
      this.handles.push({
        id: 'boundM', x: hx, y: hy,
        onDrag: (_, py) => this.setParam('boundM', fromPxY(py))
      });
    }

    if (round.mode === 'cobweb-bound-floor') {
      const m = this.paramState.boundm;
      const hx = clamp(toPxX((m + 6) * 0.5), cobRect.x + 26, cobRect.x + cobRect.w - 26);
      const hy = clamp(toPxY(m), cobRect.y + 14, cobRect.y + cobRect.h - 14);
      this.drawDragHandle('boundm', hx, hy, `m=${m.toFixed(2)}`, '#f59e0b');
      this.handles.push({
        id: 'boundm', x: hx, y: hy,
        onDrag: (_, py) => this.setParam('boundm', fromPxY(py))
      });
    }

    // Secondary Strip: Trajectory or Heron Microscope or Composite g(u_n)
    ctx.save();
    ctx.fillStyle = 'rgba(6, 20, 26, 0.72)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.roundRect(trajRect.x, trajRect.y, trajRect.w, trajRect.h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    if (round.mode === 'heron-approx') {
      this.renderHeronMicroscope(round, trajRect, terms);
    } else if (round.mode === 'fixed-point-composite') {
      this.renderCompositeStrip(round, trajRect, terms);
    } else {
      this.renderTermTimeline(round, trajRect, terms, dMin, dMax);
    }
  }

  renderTermTimeline(round, rect, terms, yMin, yMax) {
    const ctx = this.ctx;
    const padX = 28;
    const padY = 26;
    const innerW = rect.w - padX * 2;
    const innerH = rect.h - padY * 2;
    const count = Math.min(terms.length, 12);
    const toX = (n) => rect.x + padX + (n / Math.max(1, count - 1)) * innerW;
    const toY = (v) => rect.y + padY + innerH - ((clamp(v, yMin, yMax) - yMin) / (yMax - yMin)) * innerH;

    this.drawLabel('uₙ (n = 0..11)', rect.x + rect.w / 2, rect.y + 13, { color: '#94a3b8' });

    if (round.mode === 'cobweb-bound-ceil') {
      const cy = toY(this.paramState.boundM);
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(rect.x + padX, cy);
      ctx.lineTo(rect.x + rect.w - padX, cy);
      ctx.stroke();
      ctx.setLineDash([]);
      this.drawLabel(`M=${this.paramState.boundM.toFixed(2)}`, rect.x + padX + 26, cy - 10, { color: '#fcd34d' });
    } else if (round.mode === 'cobweb-bound-floor') {
      const fy = toY(this.paramState.boundm);
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(rect.x + padX, fy);
      ctx.lineTo(rect.x + rect.w - padX, fy);
      ctx.stroke();
      ctx.setLineDash([]);
      this.drawLabel(`m=${this.paramState.boundm.toFixed(2)}`, rect.x + padX + 26, fy + 12, { color: '#fcd34d' });
    }

    ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < count; i += 1) {
      const px = toX(i);
      const py = toY(terms[i]);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    for (let i = 0; i < count; i += 1) {
      const v = terms[i];
      const px = toX(i);
      const py = toY(v);
      const out = (round.mode === 'cobweb-bound-ceil' && v > this.paramState.boundM + 1e-4) ||
                  (round.mode === 'cobweb-bound-floor' && v < this.paramState.boundm - 1e-4) ||
                  v > yMax;
      ctx.fillStyle = out ? '#fb7185' : '#10b981';
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
      if (i % 3 === 0 || i === count - 1) {
        this.drawLabel(v.toFixed(2), px, py - 12, { color: out ? '#fda4af' : '#a7f3d0', font: '700 9px "JetBrains Mono", monospace' });
      }
    }
  }

  renderCompositeStrip(round, rect, terms) {
    const ctx = this.ctx;
    const padX = 28;
    const padY = 30;
    const innerW = rect.w - padX * 2;
    const innerH = rect.h - padY * 2;
    const yMin = 1.5;
    const yMax = 6.5;
    const toX = (n) => rect.x + padX + (n / 10) * innerW;
    const toY = (v) => rect.y + padY + innerH - ((clamp(v, yMin, yMax) - yMin) / (yMax - yMin)) * innerH;

    this.drawLabel('vₙ = g(uₙ) → g(L)', rect.x + rect.w / 2, rect.y + 14, { color: '#bae6fd' });

    const gateY = toY(this.paramState.gLim);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(rect.x + padX, gateY);
    ctx.lineTo(rect.x + rect.w - padX, gateY);
    ctx.stroke();
    ctx.setLineDash([]);

    const count = Math.min(terms.length, 11);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < count; i += 1) {
      const gv = round.g(terms[i]);
      const px = toX(i);
      const py = toY(gv);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    for (let i = 0; i < count; i += 1) {
      const gv = round.g(terms[i]);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(toX(i), toY(gv), 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const hx = rect.x + rect.w - padX - 8;
    this.drawDragHandle('gLim', hx, gateY, `g(L)=${this.paramState.gLim.toFixed(2)}`, '#f59e0b');
    this.handles.push({
      id: 'gLim', x: hx, y: gateY,
      onDrag: (_, py) => {
        const val = yMin + ((rect.y + padY + innerH - py) / innerH) * (yMax - yMin);
        this.setParam('gLim', val);
      }
    });
  }

  renderHeronMicroscope(round, rect, terms) {
    const ctx = this.ctx;
    const zMin = 1.37;
    const zMax = 1.46;
    const padX = 24;
    const innerW = rect.w - padX * 2;
    const midY = rect.y + rect.h * 0.56;
    const toX = (v) => rect.x + padX + ((clamp(v, zMin, zMax) - zMin) / (zMax - zMin)) * innerW;

    this.drawLabel('مجهر التقريب حول √2 ≈ 1.4142', rect.x + rect.w / 2, rect.y + 18, { color: '#fcd34d' });

    // Bracket around est
    const est = this.paramState.est;
    const bx0 = toX(est - 0.004);
    const bx1 = toX(est + 0.004);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
    ctx.fillRect(bx0, midY - 38, Math.max(4, bx1 - bx0), 76);

    // Axis line
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rect.x + padX, midY);
    ctx.lineTo(rect.x + rect.w - padX, midY);
    ctx.stroke();

    // True sqrt(2) marker
    const sx = toX(Math.SQRT2);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx, midY - 45);
    ctx.lineTo(sx, midY + 45);
    ctx.stroke();
    this.drawLabel('√2', sx, midY - 54, { color: '#6ee7b7' });

    // Current u_N marker
    const nIdx = Math.min(terms.length - 1, Math.round(this.paramState.steps));
    const uN = terms[nIdx];
    const ux = toX(uN);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(ux, midY - 22, 6, 0, Math.PI * 2);
    ctx.fill();
    this.drawLabel(`u_${nIdx}=${uN.toFixed(4)}`, ux, midY - 36, { color: '#bae6fd', font: '700 10px "JetBrains Mono", monospace' });

    // Draggable est handle
    const ex = toX(est);
    this.drawDragHandle('est', ex, midY + 18, `${est.toFixed(3)}`, '#f59e0b');
    this.handles.push({
      id: 'est', x: ex, y: midY + 18,
      onDrag: (px) => {
        const val = zMin + ((px - (rect.x + padX)) / innerW) * (zMax - zMin);
        this.setParam('est', val);
      }
    });
  }

  renderGeometricSpectrum(round) {
    const ctx = this.ctx;
    const padX = 48;
    const padY = 44;
    const w = this.w - padX * 2;
    const h = this.h - padY * 2;
    const q = this.paramState.q;
    const nMax = 14;
    const yMin = -5;
    const yMax = 5;
    const toX = (n) => padX + (n / nMax) * w;
    const toY = (y) => padY + h - ((clamp(y, yMin, yMax) - yMin) / (yMax - yMin)) * h;
    const y0 = toY(0);

    // Zero baseline
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padX, y0);
    ctx.lineTo(padX + w, y0);
    ctx.stroke();
    this.drawLabel('y = 0 (نهاية التقارب)', padX + 75, y0 - 12, { color: '#94a3b8' });

    // Target gate at (2, 1)
    const gx = toX(2);
    const gy = toY(1);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(gx, gy, 11, 0, Math.PI * 2);
    ctx.stroke();
    this.drawLabel('u_2 = 1', gx, gy - 18, { color: '#fcd34d' });

    const lim = this.anim.active ? Math.min(nMax, Math.floor(this.anim.progress * 1.2)) : nMax;
    for (let n = 0; n <= lim; n += 1) {
      const val = round.u0 * Math.pow(q, n);
      const px = toX(n);
      const py = toY(val);
      const out = Math.abs(val) > 5;
      const col = out ? '#fb7185' : (val >= 0 ? '#10b981' : '#38bdf8');
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, y0);
      ctx.lineTo(px, py);
      ctx.stroke();

      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fill();
      if (n <= 4) {
        this.drawLabel(`u${n}`, px, y0 + (val >= 0 ? 14 : -14), { color: '#94a3b8', font: '700 10px "JetBrains Mono", monospace' });
      }
    }

    // Draggable u1 ratio puck at n = 1
    const u1 = round.u0 * q;
    const h1x = toX(1);
    const h1y = clamp(toY(u1), padY + 12, padY + h - 12);
    this.drawDragHandle('q', h1x, h1y, `q=${q.toFixed(2)}`, '#f59e0b');
    this.handles.push({
      id: 'q', x: h1x, y: h1y,
      onDrag: (_, py) => {
        const yVal = yMin + ((padY + h - py) / h) * (yMax - yMin);
        this.setParam('q', yVal / round.u0);
      }
    });
  }

  renderArithmeticAndRef(round) {
    const ctx = this.ctx;
    const padX = 44;
    const topRect = { x: padX, y: 24, w: this.w - padX * 2 - 90, h: Math.floor(this.h * 0.48) - 24 };
    const tankRect = { x: topRect.x + topRect.w + 18, y: 24, w: 68, h: topRect.h };
    const botRect = { x: padX, y: topRect.y + topRect.h + 28, w: this.w - padX * 2, h: this.h - (topRect.y + topRect.h + 44) };

    const r = this.paramState.r;
    const p = this.paramState.p;

    // Top: Arithmetic staircase n=2..7
    ctx.fillStyle = 'rgba(6, 20, 26, 0.72)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
    ctx.beginPath();
    ctx.roundRect(topRect.x, topRect.y, topRect.w, topRect.h, 10);
    ctx.fill();
    ctx.stroke();

    const toAX = (n) => topRect.x + 28 + ((n - 2) / 5) * (topRect.w - 56);
    const toAY = (y) => topRect.y + topRect.h - 22 - ((clamp(y, -5, 36) + 5) / 41) * (topRect.h - 44);

    // Target ring at (7, 20)
    const tx = toAX(7);
    const ty = toAY(20);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(tx, ty, 10, 0, Math.PI * 2);
    ctx.stroke();
    this.drawLabel('u₇=20', tx, ty - 16, { color: '#fcd34d' });

    for (let n = 2; n <= 7; n += 1) {
      const val = 5 + (n - 2) * r;
      const bx = toAX(n);
      const by = toAY(val);
      const base = toAY(0);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.55)';
      ctx.fillRect(bx - 11, Math.min(by, base), 22, Math.abs(base - by));
      this.drawLabel(val.toFixed(0), bx, by - 10, { color: '#d1fae5', font: '700 10px "JetBrains Mono", monospace' });
      this.drawLabel(`n=${n}`, bx, topRect.y + topRect.h - 10, { color: '#94a3b8', font: '700 9px "JetBrains Mono", monospace' });
    }

    const u7 = 5 + 5 * r;
    const sum = (6 * (5 + u7)) / 2;
    const dragY = clamp(toAY(u7), topRect.y + 14, topRect.y + topRect.h - 14);
    this.drawDragHandle('r', tx, dragY, `r=${r.toFixed(1)}`, '#f59e0b');
    this.handles.push({
      id: 'r', x: tx, y: dragY,
      onDrag: (_, py) => {
        const yVal = -5 + ((topRect.y + topRect.h - 22 - py) / (topRect.h - 44)) * 41;
        this.setParam('r', (yVal - 5) / 5);
      }
    });

    // Sum tank
    ctx.fillStyle = 'rgba(6, 20, 26, 0.8)';
    ctx.strokeStyle = Math.abs(sum - 75) < 1 ? '#10b981' : '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(tankRect.x, tankRect.y, tankRect.w, tankRect.h, 10);
    ctx.fill();
    ctx.stroke();
    const fillRatio = clamp(sum / 110, 0, 1);
    const fillH = fillRatio * (tankRect.h - 32);
    ctx.fillStyle = Math.abs(sum - 75) < 1 ? 'rgba(16, 185, 129, 0.65)' : 'rgba(56, 189, 248, 0.5)';
    ctx.fillRect(tankRect.x + 8, tankRect.y + tankRect.h - 10 - fillH, tankRect.w - 16, fillH);
    const markY = tankRect.y + tankRect.h - 10 - (75 / 110) * (tankRect.h - 32);
    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(tankRect.x + 4, markY);
    ctx.lineTo(tankRect.x + tankRect.w - 4, markY);
    ctx.stroke();
    this.drawLabel(`S=${sum.toFixed(0)}`, tankRect.x + tankRect.w / 2, tankRect.y + 13, { color: '#fcd34d' });

    // Bottom: w_n = n^p reference curve
    ctx.fillStyle = 'rgba(6, 20, 26, 0.72)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.roundRect(botRect.x, botRect.y, botRect.w, botRect.h, 10);
    ctx.fill();
    ctx.stroke();
    this.drawLabel(`w_n = n^{${p.toFixed(1)}} → ${p < 0 ? '0' : p === 0 ? '1' : '+∞'}`, botRect.x + botRect.w / 2, botRect.y + 14, { color: p < 0 ? '#6ee7b7' : '#fda4af' });

    const toRX = (n) => botRect.x + 28 + ((n - 1) / 13) * (botRect.w - 56);
    const toRY = (v) => botRect.y + botRect.h - 18 - (clamp(v, 0, 6) / 6) * (botRect.h - 42);
    ctx.strokeStyle = p < 0 ? '#10b981' : '#fb7185';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let n = 1; n <= 14; n += 1) {
      const wn = Math.pow(n, p);
      const px = toRX(n);
      const py = toRY(wn);
      if (n === 1) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
      ctx.fillStyle = p < 0 ? '#10b981' : '#fb7185';
      ctx.fillRect(px - 2.5, py - 2.5, 5, 5);
    }
    ctx.stroke();
  }

  renderCobwebAndAuxiliary(round) {
    const ctx = this.ctx;
    const pad = 26;
    const isWide = this.w >= 620;
    const cobRect = isWide
      ? { x: pad, y: 18, w: Math.floor(this.w * 0.48) - pad, h: this.h - 38 }
      : { x: pad, y: 14, w: this.w - pad * 2, h: Math.floor(this.h * 0.48) - 18 };
    const auxRect = isWide
      ? { x: cobRect.x + cobRect.w + 22, y: 18, w: this.w - (cobRect.x + cobRect.w + 38), h: this.h - 38 }
      : { x: pad, y: cobRect.y + cobRect.h + 18, w: this.w - pad * 2, h: this.h - (cobRect.y + cobRect.h + 32) };

    const dMin = round.domain.min;
    const dMax = round.domain.max;
    const toX = (x) => cobRect.x + ((x - dMin) / (dMax - dMin)) * cobRect.w;
    const toY = (y) => cobRect.y + cobRect.h - ((y - dMin) / (dMax - dMin)) * cobRect.h;
    const fromX = (px) => dMin + ((px - cobRect.x) / cobRect.w) * (dMax - dMin);

    // Cobweb box
    ctx.save();
    ctx.fillStyle = 'rgba(6, 20, 26, 0.72)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.28)';
    ctx.beginPath();
    ctx.roundRect(cobRect.x, cobRect.y, cobRect.w, cobRect.h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.clip();

    // Diagonal y = x
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(toX(dMin), toY(dMin));
    ctx.lineTo(toX(dMax), toY(dMax));
    ctx.stroke();
    ctx.setLineDash([]);

    // Function f(x)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= 120; i += 1) {
      const x = dMin + (i / 120) * (dMax - dMin);
      const y = round.f(x);
      if (!Number.isFinite(y) || Math.abs(y) > 25) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(toX(x), toY(y));
        started = true;
      } else {
        ctx.lineTo(toX(x), toY(y));
      }
    }
    ctx.stroke();

    // Compute u_n trajectory
    const terms = [round.u0];
    let curr = round.u0;
    for (let i = 0; i < 8; i += 1) {
      const nxt = round.f(curr);
      if (!Number.isFinite(nxt)) break;
      terms.push(nxt);
      curr = nxt;
    }
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(toX(terms[0]), toY(0));
    for (let i = 0; i < terms.length - 1; i += 1) {
      ctx.lineTo(toX(terms[i]), toY(terms[i + 1]));
      ctx.lineTo(toX(terms[i + 1]), toY(terms[i + 1]));
    }
    ctx.stroke();
    ctx.restore();

    // Draggable alpha (and beta) on diagonal y = x
    const a = this.paramState.alpha;
    const ax = clamp(toX(a), cobRect.x + 10, cobRect.x + cobRect.w - 10);
    const ay = clamp(toY(a), cobRect.y + 10, cobRect.y + cobRect.h - 10);
    this.drawDragHandle('alpha', ax, ay, `α=${a.toFixed(1)}`, '#f59e0b');
    this.handles.push({
      id: 'alpha', x: ax, y: ay,
      onDrag: (px) => this.setParam('alpha', fromX(px))
    });

    if (this.paramState.beta !== undefined) {
      const b = this.paramState.beta;
      const bx = clamp(toX(b), cobRect.x + 10, cobRect.x + cobRect.w - 10);
      const by = clamp(toY(b), cobRect.y + 10, cobRect.y + cobRect.h - 10);
      this.drawDragHandle('beta', bx, by, `β=${b.toFixed(1)}`, '#a855f7');
      this.handles.push({
        id: 'beta', x: bx, y: by,
        onDrag: (px) => this.setParam('beta', fromX(px))
      });
    }

    // Auxiliary Lens Diagnostics Panel
    ctx.save();
    ctx.fillStyle = 'rgba(6, 20, 26, 0.78)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.beginPath();
    ctx.roundRect(auxRect.x, auxRect.y, auxRect.w, auxRect.h, 10);
    ctx.fill();
    ctx.stroke();

    const vVals = terms.slice(0, 6).map((u) => round.auxFn(u, this.paramState.alpha, this.paramState.beta));
    const metricLabel = round.auxType === 'ratio' ? 'النسب vₙ₊₁ / vₙ' : 'الفروق vₙ₊₁ − vₙ';
    this.drawLabel(`عدسة المتتالية المساعدة vₙ | ${metricLabel}`, auxRect.x + auxRect.w / 2, auxRect.y + 16, { color: '#fcd34d' });

    const metrics = [];
    for (let i = 0; i < vVals.length - 1; i += 1) {
      const v0 = vVals[i];
      const v1 = vVals[i + 1];
      const m = round.auxType === 'ratio' ? (Math.abs(v0) > 1e-4 ? v1 / v0 : NaN) : v1 - v0;
      metrics.push(m);
    }
    const valid = metrics.filter((m) => Number.isFinite(m) && Math.abs(m) < 50);
    const uniform = valid.length >= 3 && valid.every((m) => Math.abs(m - valid[0]) < 0.02);

    const rowH = Math.min(34, (auxRect.h - 60) / Math.max(1, metrics.length));
    metrics.forEach((m, i) => {
      const y = auxRect.y + 42 + i * rowH;
      const barW = Number.isFinite(m) ? clamp(Math.abs(m) * 45, 6, auxRect.w - 135) : 10;
      ctx.fillStyle = uniform ? '#10b981' : '#fb7185';
      ctx.fillRect(auxRect.x + 90, y, barW, Math.max(10, rowH - 12));
      const tag = round.auxType === 'ratio' ? `v_{${i + 1}}/v_{${i}}` : `v_{${i + 1}}-v_{${i}}`;
      this.drawLabel(tag, auxRect.x + 48, y + (rowH - 12) / 2, { color: '#cbd5e1', font: '700 10px "JetBrains Mono", monospace' });
      this.drawLabel(Number.isFinite(m) ? m.toFixed(3) : '∞', auxRect.x + 98 + barW + 24, y + (rowH - 12) / 2, {
        color: uniform ? '#6ee7b7' : '#fda4af',
        font: '800 10px "JetBrains Mono", monospace'
      });
    });

    this.drawLabel(
      uniform ? (round.auxType === 'ratio' ? '✓ هندسية منتظمة!' : '✓ حسابية منتظمة!') : 'غير منتظمة — عدّل α / β',
      auxRect.x + auxRect.w / 2,
      auxRect.y + auxRect.h - 14,
      { color: uniform ? '#6ee7b7' : '#fda4af', font: '800 11px "Cairo", sans-serif' }
    );
    ctx.restore();
  }

  renderSqueezeCorridor(round) {
    const ctx = this.ctx;
    const padX = 46;
    const padY = 34;
    const w = this.w - padX * 2;
    const h = this.h - padY * 2;
    const nMax = round.mode === 'squeeze-contraction' ? 16 : 22;
    const yMin = 0;
    const yMax = 5;
    const toX = (n) => padX + (n / nMax) * w;
    const toY = (y) => padY + h - ((clamp(y, yMin, yMax) - yMin) / (yMax - yMin)) * h;
    const fromY = (py) => yMin + ((padY + h - py) / h) * (yMax - yMin);

    const L = this.paramState.L;
    const radFn = (n) => (round.mode === 'squeeze-contraction' ? 2 * Math.pow(this.paramState.k, n) : this.paramState.A / (n + 1));

    // Shaded Squeeze Corridor
    ctx.save();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
    ctx.beginPath();
    for (let n = 0; n <= nMax; n += 1) {
      const py = toY(L + radFn(n));
      if (n === 0) ctx.moveTo(toX(n), py);
      else ctx.lineTo(toX(n), py);
    }
    for (let n = nMax; n >= 0; n -= 1) {
      ctx.lineTo(toX(n), toY(L - radFn(n)));
    }
    ctx.closePath();
    ctx.fill();

    // Guard envelopes w_n & v_n
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let n = 0; n <= nMax; n += 1) {
      const px = toX(n);
      const py = toY(L + radFn(n));
      if (n === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.beginPath();
    for (let n = 0; n <= nMax; n += 1) {
      const px = toX(n);
      const py = toY(L - radFn(n));
      if (n === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // True limit crystal
    const cx = toX(nMax);
    const cy = toY(round.trueL);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx, cy + 10);
    ctx.lineTo(cx - 8, cy);
    ctx.closePath();
    ctx.fill();
    this.drawLabel(`L=${round.trueL}`, cx - 22, cy - 15, { color: '#bae6fd' });

    // Sequence points
    const drawLimit = this.anim.active ? Math.min(nMax, Math.floor(this.anim.progress * 2)) : nMax;
    for (let n = 0; n <= drawLimit; n += 1) {
      const u = round.seqFn(n);
      const r = radFn(n);
      const breach = u > L + r + 1e-6 || u < L - r - 1e-6;
      ctx.fillStyle = breach ? '#fb7185' : '#10b981';
      ctx.beginPath();
      ctx.arc(toX(n), toY(u), breach ? 5.2 : 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Draggable handles: Center L at right side, Envelope width at n=0 (or n=1 for k)
    const lx = toX(nMax);
    const ly = clamp(toY(L), padY + 12, padY + h - 12);
    this.drawDragHandle('L', lx, ly, `L=${L.toFixed(2)}`, '#38bdf8');
    this.handles.push({
      id: 'L', x: lx, y: ly,
      onDrag: (_, py) => this.setParam('L', fromY(py))
    });

    if (round.mode === 'squeeze-corridor') {
      const ax = toX(0);
      const ay = clamp(toY(L + this.paramState.A), padY + 12, padY + h - 12);
      this.drawDragHandle('A', ax, ay, `A=${this.paramState.A.toFixed(1)}`, '#f59e0b');
      this.handles.push({
        id: 'A', x: ax, y: ay,
        onDrag: (_, py) => this.setParam('A', fromY(py) - this.paramState.L)
      });
    } else {
      const kx = toX(1);
      const ky = clamp(toY(L + 2 * this.paramState.k), padY + 12, padY + h - 12);
      this.drawDragHandle('k', kx, ky, `k=${this.paramState.k.toFixed(2)}`, '#f59e0b');
      this.handles.push({
        id: 'k', x: kx, y: ky,
        onDrag: (_, py) => this.setParam('k', (fromY(py) - this.paramState.L) / 2)
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new SequenceWeaverGame();
});
