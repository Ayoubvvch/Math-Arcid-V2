import { GAME_ID, SECTORS } from './tracks.js';

const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 659.25, 783.99];

class RiderAudio {
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

  tone(freq, dur = 0.08, type = 'triangle', vol = 0.07) {
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

  playJump() {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.11);
    g.gain.setValueAtTime(0.09, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  playSlice(step) {
    const f = SCALE[Math.min(SCALE.length - 1, step + 2)];
    this.tone(f, 0.14, 'triangle', 0.085);
  }

  playWin() {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const t = now + i * 0.055;
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

  playCrash() {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(175, now);
    osc.frequency.exponentialRampToValueAtTime(68, now + 0.24);
    g.gain.setValueAtTime(0.09, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }
}

function renderTex(el, text) {
  if (!el) return;
  if (window.ArcadeCore && typeof window.ArcadeCore.renderMath === 'function') {
    window.ArcadeCore.renderMath(el, text);
  } else {
    el.textContent = String(text ?? '');
  }
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function snap(v, lo, hi, step) {
  const s = step || 0.25;
  return clamp(Number((Math.round((v - lo) / s) * s + lo).toFixed(4)), lo, hi);
}

class ContinuityRiderGame {
  constructor() {
    this.canvas = document.getElementById('riderCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.frame = document.getElementById('canvasFrame');

    this.sectorTabsEl = document.getElementById('sectorTabs');
    this.trackPillsEl = document.getElementById('trackPills');
    this.sectorBadgeEl = document.getElementById('sectorBadge');
    this.trackTitleEl = document.getElementById('trackTitle');
    this.formulaBannerEl = document.getElementById('formulaBanner');
    this.missionLineEl = document.getElementById('missionLine');
    this.deckToolsEl = document.getElementById('deckTools');
    this.btnPrimary = document.getElementById('btnPrimary');
    this.btnPrimaryIcon = document.getElementById('btnPrimaryIcon');
    this.btnPrimaryText = document.getElementById('btnPrimaryText');
    this.btnNextTrack = document.getElementById('btnNextTrack');
    this.rideBannerEl = document.getElementById('rideBanner');
    this.proofDrawerEl = document.getElementById('proofDrawer');
    this.proofBodyEl = document.getElementById('proofBody');
    this.btnProof = document.getElementById('btnProof');
    this.btnAudio = document.getElementById('btnAudio');
    this.btnReset = document.getElementById('btnReset');
    this.scoreEl = document.getElementById('scoreVal');
    this.sectorClearedEl = document.getElementById('sectorClearedVal');
    this.finishModal = document.getElementById('finishModal');

    this.audio = new RiderAudio();
    this.gpState = window.ArcadeCore?.Gamepad?.createState ? window.ArcadeCore.Gamepad.createState() : null;

    this.sectorIdx = 0;
    this.trackIdx = 0;
    this.st = {};
    this.clearedTracks = new Set();
    this.clearedSectors = new Set();
    this.score = 0;
    this.attempts = 0;
    this.correctAttempts = 0;

    this.w = 880;
    this.h = 420;
    this.dpr = 1;
    this.lastTs = 0;
    this.flashTimer = null;

    this.handles = [];
    this.activeDrag = null;
    this.hoverHandle = null;
    this.particles = [];

    // Active rider physics entity
    this.rider = {
      active: false,
      state: 'idle', // idle | riding | falling | won | crashed
      x: 0,
      y: 0,
      vy: 0,
      onGround: true,
      warped: false,
      trail: [],
      failReason: ''
    };

    // Bisection dynamic zoom camera
    this.bisectCam = { xMin: 0.75, xMax: 2.25 };
    // Mirror fold animation [0..1]
    this.mirrorT = 0;

    this.init();
  }

  init() {
    this.setupResize();
    this.renderSectorTabs();
    this.loadTrack(0, 0);
    this.bindEvents();
    requestAnimationFrame((ts) => this.loop(ts));
  }

  setupResize() {
    const sync = () => {
      if (!this.frame || !this.canvas) return;
      const r = this.frame.getBoundingClientRect();
      const w = Math.max(300, Math.floor(r.width));
      const h = Math.max(260, Math.floor(r.height));
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (w !== this.w || h !== this.h || dpr !== this.dpr) {
        this.w = w;
        this.h = h;
        this.dpr = dpr;
        this.canvas.width = Math.floor(w * dpr);
        this.canvas.height = Math.floor(h * dpr);
        if (this.st && Object.keys(this.st).length > 0) this.render();
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

  getTrack() {
    return this.getSector().tracks[this.trackIdx];
  }

  renderSectorTabs() {
    if (!this.sectorTabsEl) return;
    this.sectorTabsEl.innerHTML = SECTORS.map((sec, idx) => {
      const cls = ['sector-tab'];
      if (idx === this.sectorIdx) cls.push('active');
      if (this.clearedSectors.has(sec.id)) cls.push('done');
      return `<button class="${cls.join(' ')}" data-sec="${idx}" type="button"><span class="s-dot"></span><span>${sec.tab}</span></button>`;
    }).join('');

    this.sectorTabsEl.querySelectorAll('.sector-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.loadTrack(Number(btn.getAttribute('data-sec')), 0);
      });
    });
  }

  renderTrackPills() {
    if (!this.trackPillsEl) return;
    const sec = this.getSector();
    this.trackPillsEl.textContent = '';
    sec.tracks.forEach((tr, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const done = this.clearedTracks.has(tr.id);
      btn.className = `track-pill ${idx === this.trackIdx ? 'active' : ''} ${done ? 'done' : ''}`;
      btn.textContent = done ? `✓ مسار ${idx + 1}` : `مسار ${idx + 1}`;
      btn.addEventListener('click', () => {
        this.audio.unlock();
        this.loadTrack(this.sectorIdx, idx);
      });
      this.trackPillsEl.appendChild(btn);
    });
  }

  loadTrack(sectorIdx, trackIdx) {
    this.sectorIdx = clamp(sectorIdx, 0, SECTORS.length - 1);
    const sec = this.getSector();
    this.trackIdx = clamp(trackIdx, 0, sec.tracks.length - 1);
    const tr = this.getTrack();

    this.st = {};
    if (tr.slider) this.st[tr.slider.key] = tr.slider.init;
    for (const sl of tr.sliders || []) this.st[sl.key] = sl.init;
    if (tr.ops) this.st.op = tr.ops[0].id;
    if (tr.mode === 'bisection-slicer') {
      this.st.a = tr.initA;
      this.st.b = tr.initB;
      this.st.cuts = 0;
      this.st.history = [];
      this.bisectCam = { xMin: tr.initA - 0.25, xMax: tr.initB + 0.25 };
    }
    if (tr.mode === 'inverse-mirror') {
      this.st.mirrored = false;
      this.mirrorT = 0;
    }

    this.resetRider();
    this.hideBanner();
    this.btnNextTrack?.classList.add('hidden');
    this.proofDrawerEl?.classList.add('hidden');
    this.btnProof?.classList.remove('active');

    if (this.sectorBadgeEl) this.sectorBadgeEl.textContent = `${sec.tab} • ${sec.skills}`;
    renderTex(this.trackTitleEl, tr.title);
    renderTex(this.formulaBannerEl, tr.formula);
    renderTex(this.missionLineEl, tr.mission);
    renderTex(this.proofBodyEl, tr.proof);

    this.renderSectorTabs();
    this.renderTrackPills();
    this.renderDeckTools();
    this.updatePrimaryButton();
    this.updateStats();
    if (this.w > 0 && this.h > 0) this.render();
  }

  resetRider() {
    const tr = this.getTrack();
    let x0 = tr.xStart !== undefined ? tr.xStart : (tr.domA !== undefined ? tr.domA : 0);
    let y0 = 0;
    if (tr.mode === 'piecewise-weld') y0 = tr.fLeft(x0);
    else if (tr.mode === 'floor-jump') y0 = Math.floor(x0);
    else if (tr.mode === 'domain-carve') {
      x0 = this.st.domA ?? 1;
      y0 = tr.f(x0);
    } else if (tr.mode === 'asymptote-vh') {
      x0 = -2.8;
      y0 = tr.f(x0);
    } else if (tr.mode === 'inverse-mirror') {
      x0 = 1.05;
      y0 = tr.fInv(x0);
    } else if (tr.mode === 'rational-power') {
      const opObj = tr.ops.find((o) => o.id === this.st.op) || tr.ops[0];
      y0 = Math.pow(x0, opObj.exp);
    } else if (tr.f) {
      y0 = tr.f(x0);
    }
    this.rider = {
      active: false,
      state: 'idle',
      x: x0,
      y: Number.isFinite(y0) ? y0 : 0,
      vy: 0,
      onGround: true,
      warped: false,
      trail: [],
      failReason: ''
    };
  }

  updatePrimaryButton() {
    const tr = this.getTrack();
    if (!this.btnPrimary) return;
    this.btnPrimary.classList.remove('jump-mode');
    if (tr.mode === 'bisection-slicer') {
      this.btnPrimaryIcon.textContent = '🔄';
      this.btnPrimaryText.textContent = 'أعد الشطر';
    } else if (tr.mode === 'floor-jump' && this.rider.active && this.rider.state === 'riding') {
      this.btnPrimary.classList.add('jump-mode');
      this.btnPrimaryIcon.textContent = '⬆';
      this.btnPrimaryText.textContent = 'اقفز! [Space]';
    } else {
      this.btnPrimaryIcon.textContent = '▶';
      this.btnPrimaryText.textContent = tr.mode === 'floor-jump' ? 'انطلق على E(x)' : 'أطلق المتزلّج';
    }
  }

  renderDeckTools() {
    if (!this.deckToolsEl) return;
    const tr = this.getTrack();
    this.deckToolsEl.textContent = '';

    // Bisection left/right slicer controls
    if (tr.mode === 'bisection-slicer') {
      const a = this.st.a;
      const b = this.st.b;
      const c = 0.5 * (a + b);
      const grp = document.createElement('div');
      grp.className = 'tool-group';
      const ttl = document.createElement('div');
      ttl.className = 'tool-group-title';
      renderTex(ttl, `المجال $[${a.toFixed(3)}, ${b.toFixed(3)}]$ • المنتصف $c = ${c.toFixed(3)}$ • الشطرات: ${this.st.cuts}/${tr.targetCuts}`);
      const row = document.createElement('div');
      row.className = 'chip-bar';

      const btnL = document.createElement('button');
      btnL.type = 'button';
      btnL.className = 'bisect-btn';
      btnL.id = 'btnSliceLeft';
      renderTex(btnL, `◀ أبقِ الأيسر $[${a.toFixed(2)}, ${c.toFixed(2)}]$`);
      btnL.addEventListener('click', () => this.performBisect('left'));

      const btnR = document.createElement('button');
      btnR.type = 'button';
      btnR.className = 'bisect-btn';
      btnR.id = 'btnSliceRight';
      renderTex(btnR, `أبقِ الأيمن $[${c.toFixed(2)}, ${b.toFixed(2)}]$ ▶`);
      btnR.addEventListener('click', () => this.performBisect('right'));

      row.appendChild(btnL);
      row.appendChild(btnR);
      grp.appendChild(ttl);
      grp.appendChild(row);
      this.deckToolsEl.appendChild(grp);
      return;
    }

    // Floor jump live status chip
    if (tr.mode === 'floor-jump') {
      const grp = document.createElement('div');
      grp.className = 'tool-group';
      const ttl = document.createElement('div');
      ttl.className = 'tool-group-title';
      renderTex(ttl, 'نقط عدم الاتصال في $\\mathbb{Z}$: $x \\in \\{1, 2, 3, 4\\}$ — اضغط `Space` أو انقر داخل المبيان للقفز!');
      grp.appendChild(ttl);
      this.deckToolsEl.appendChild(grp);
      return;
    }

    // Operator / Choice chips
    if (tr.ops) {
      const grp = document.createElement('div');
      grp.className = 'tool-group';
      const ttl = document.createElement('div');
      ttl.className = 'tool-group-title';
      ttl.textContent = tr.mode === 'rational-power' ? 'اختر القوة الجذرية' : 'الأداة الرياضية';
      const bar = document.createElement('div');
      bar.className = 'chip-bar';
      tr.ops.forEach((op) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.op = op.id;
        btn.className = `op-chip ${this.st.op === op.id ? 'active' : ''}`;
        renderTex(btn, op.label);
        btn.addEventListener('click', () => {
          this.audio.unlock();
          this.audio.tone(540, 0.04, 'sine', 0.04);
          this.st.op = op.id;
          bar.querySelectorAll('.op-chip').forEach((b) => b.classList.toggle('active', b.dataset.op === op.id));
          this.resetRider();
          this.hideBanner();
        });
        bar.appendChild(btn);
      });
      grp.appendChild(ttl);
      grp.appendChild(bar);
      this.deckToolsEl.appendChild(grp);
    }

    // Mirror flip switch for 6-1
    if (tr.mode === 'inverse-mirror') {
      const grp = document.createElement('div');
      grp.className = 'tool-group';
      const ttl = document.createElement('div');
      ttl.className = 'tool-group-title';
      renderTex(ttl, 'التماثل المحوري حول $y = x$');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'btnMirrorFlip';
      btn.className = `op-chip ${this.st.mirrored ? 'active' : ''}`;
      renderTex(btn, this.st.mirrored ? '✓ تم عكس $\\mathcal{C}_f$ إلى $\\mathcal{C}_{f^{-1}}$' : '🪞 اعكس المسار حول $y = x$');
      btn.addEventListener('click', () => {
        this.audio.unlock();
        if (Math.abs(this.st.clipX - tr.targetClipX) > 0.05) {
          this.audio.playCrash();
          this.flashFrame('err');
          this.showBanner('قصّ المجال أولاً إلى $x_{\\min} = 1$ لتصبح $f$ رتيبة قطعاً وتقبل دالة عكسية!', 'err');
          return;
        }
        this.st.mirrored = !this.st.mirrored;
        this.audio.playSlice(3);
        this.renderDeckTools();
        this.hideBanner();
      });
      grp.appendChild(ttl);
      grp.appendChild(btn);
      this.deckToolsEl.appendChild(grp);
    }

    // Sliders
    const allSliders = [];
    if (tr.slider) allSliders.push(tr.slider);
    for (const s of tr.sliders || []) allSliders.push(s);

    for (const sl of allSliders) {
      const grp = document.createElement('div');
      grp.className = 'tool-group';
      const ttl = document.createElement('div');
      ttl.className = 'tool-group-title';
      const lbl = document.createElement('span');
      renderTex(lbl, sl.label);
      const val = document.createElement('span');
      val.className = 'tool-group-val';
      val.dir = 'ltr';
      val.id = `val_${sl.key}`;
      val.textContent = Number(this.st[sl.key]).toFixed(2);
      ttl.appendChild(lbl);
      ttl.appendChild(val);

      const bar = document.createElement('div');
      bar.className = 'stepper-bar';
      const bMin = document.createElement('button');
      bMin.type = 'button';
      bMin.className = 'step-btn';
      bMin.textContent = '−';
      bMin.addEventListener('click', () => {
        this.audio.unlock();
        this.setSlider(sl.key, this.st[sl.key] - sl.step);
      });

      const rng = document.createElement('input');
      rng.type = 'range';
      rng.className = 'step-range';
      rng.id = `rng_${sl.key}`;
      rng.min = String(sl.min);
      rng.max = String(sl.max);
      rng.step = String(sl.step);
      rng.value = String(this.st[sl.key]);
      rng.addEventListener('input', () => {
        this.audio.unlock();
        this.setSlider(sl.key, parseFloat(rng.value));
      });

      const bPlus = document.createElement('button');
      bPlus.type = 'button';
      bPlus.className = 'step-btn';
      bPlus.textContent = '+';
      bPlus.addEventListener('click', () => {
        this.audio.unlock();
        this.setSlider(sl.key, this.st[sl.key] + sl.step);
      });

      bar.appendChild(bMin);
      bar.appendChild(rng);
      bar.appendChild(bPlus);
      grp.appendChild(ttl);
      grp.appendChild(bar);
      this.deckToolsEl.appendChild(grp);
    }
  }

  setSlider(key, val) {
    const tr = this.getTrack();
    const list = tr.slider ? [tr.slider] : (tr.sliders || []);
    const spec = list.find((s) => s.key === key);
    if (!spec) return;
    const next = snap(val, spec.min, spec.max, spec.step);
    if (Math.abs(next - this.st[key]) > 1e-6) {
      this.audio.tone(720, 0.022, 'sine', 0.03);
    }
    this.st[key] = next;
    const r = document.getElementById(`rng_${key}`);
    if (r) r.value = String(next);
    const v = document.getElementById(`val_${key}`);
    if (v) v.textContent = next.toFixed(2);
    if (tr.mode === 'inverse-mirror' && key === 'clipX' && Math.abs(next - tr.targetClipX) > 0.05) {
      this.st.mirrored = false;
      const mBtn = document.getElementById('btnMirrorFlip');
      if (mBtn) {
        mBtn.classList.remove('active');
        renderTex(mBtn, '🪞 اعكس المسار حول $y = x$');
      }
    }
    this.resetRider();
    this.hideBanner();
  }

  performBisect(side) {
    this.audio.unlock();
    const tr = this.getTrack();
    if (tr.mode !== 'bisection-slicer' || this.st.cuts >= tr.targetCuts) return;

    const a = this.st.a;
    const b = this.st.b;
    const c = 0.5 * (a + b);
    const fa = tr.f(a);
    const fc = tr.f(c);
    const fb = tr.f(b);

    const chosenLeft = side === 'left';
    const valid = chosenLeft ? (fa * fc < 0) : (fc * fb < 0);

    this.attempts += 1;
    if (!valid) {
      this.audio.playCrash();
      this.flashFrame('err');
      const prodLabel = chosenLeft ? `f(${a.toFixed(2)}) \\cdot f(${c.toFixed(2)}) > 0` : `f(${c.toFixed(2)}) \\cdot f(${b.toFixed(2)}) > 0`;
      this.showBanner(`لا يضمن TVI جذراً هنا! $${prodLabel}$ (نفس الإشارة). اختر النصف الآخر!`, 'err');
      this.recordAttempt(false);
      return;
    }

    this.correctAttempts += 1;
    this.recordAttempt(true);
    this.st.history.push({ droppedMin: chosenLeft ? c : a, droppedMax: chosenLeft ? b : c });
    if (chosenLeft) this.st.b = c;
    else this.st.a = c;
    this.st.cuts += 1;

    this.spawnBurst(this.w * (chosenLeft ? 0.68 : 0.32), this.h * 0.5, '#ff4d6d', 18);
    this.audio.playSlice(this.st.cuts);
    this.renderDeckTools();

    if (this.st.cuts >= tr.targetCuts) {
      this.markTrackCleared(`حصر دقيق بالتفرع الثنائي! $\\alpha \\in [${this.st.a.toFixed(4)}, ${this.st.b.toFixed(4)}]$ بسعة $${(this.st.b - this.st.a).toFixed(4)}$.`);
    } else {
      this.showBanner(`شطرة ناجحة (${this.st.cuts}/${tr.targetCuts})! السعة تقلصت إلى $${(this.st.b - this.st.a).toFixed(3)}$.`, 'info');
    }
  }

  triggerPrimaryAction() {
    this.audio.unlock();
    const tr = this.getTrack();

    if (tr.mode === 'bisection-slicer') {
      this.loadTrack(this.sectorIdx, this.trackIdx);
      return;
    }

    if (tr.mode === 'floor-jump') {
      if (this.rider.active && this.rider.state === 'riding') {
        if (this.rider.onGround) {
          this.rider.vy = 5.4;
          this.rider.onGround = false;
          this.audio.playJump();
          this.spawnBurst(this.toScreenX(this.rider.x), this.toScreenY(this.rider.y), '#fbbf24', 10);
        }
        return;
      }
      this.resetRider();
      this.rider.active = true;
      this.rider.state = 'riding';
      this.hideBanner();
      this.updatePrimaryButton();
      return;
    }

    // Launch physics ride on the curve!
    this.resetRider();
    this.rider.active = true;
    this.rider.state = 'riding';
    this.hideBanner();
    this.audio.tone(440, 0.08, 'triangle', 0.06);
  }

  recordAttempt(ok) {
    const tr = this.getTrack();
    if (window.ArcadeCore?.Progress?.recordAnswer) {
      window.ArcadeCore.Progress.recordAnswer(GAME_ID, tr.topic, ok);
    }
    this.syncProgress();
  }

  markTrackCleared(msg) {
    const tr = this.getTrack();
    const sec = this.getSector();
    const wasNew = !this.clearedTracks.has(tr.id);
    this.clearedTracks.add(tr.id);
    if (wasNew) this.score += 250;
    if (sec.tracks.every((t) => this.clearedTracks.has(t.id))) {
      this.clearedSectors.add(sec.id);
    }

    this.rider.state = 'won';
    this.rider.active = false;
    this.audio.playWin();
    this.flashFrame('ok');
    this.spawnBurst(this.w * 0.65, this.h * 0.4, '#4ade80', 26);
    this.showBanner(msg, 'ok');
    this.btnNextTrack?.classList.remove('hidden');
    this.renderSectorTabs();
    this.renderTrackPills();
    this.updatePrimaryButton();
    this.updateStats();
    this.syncProgress();
  }

  failRide(msg) {
    this.attempts += 1;
    this.recordAttempt(false);
    this.rider.state = 'crashed';
    this.rider.active = false;
    this.audio.playCrash();
    this.flashFrame('err');
    this.showBanner(msg, 'err');
    this.updatePrimaryButton();
  }

  syncProgress() {
    if (!window.ArcadeCore?.Progress?.recordRun) return;
    const acc = this.attempts > 0 ? Math.round((this.correctAttempts / this.attempts) * 100) : 100;
    const victory = this.clearedSectors.size >= SECTORS.length;
    window.ArcadeCore.Progress.recordRun(GAME_ID, {
      score: this.score,
      stagesCleared: this.clearedSectors.size,
      totalStages: SECTORS.length,
      victory,
      accuracy: acc,
      answersAlreadyRecorded: true
    });
  }

  advanceTrack() {
    this.audio.unlock();
    const sec = this.getSector();
    if (this.trackIdx + 1 < sec.tracks.length) {
      this.loadTrack(this.sectorIdx, this.trackIdx + 1);
      return;
    }
    if (this.sectorIdx + 1 < SECTORS.length) {
      this.loadTrack(this.sectorIdx + 1, 0);
      return;
    }
    this.openFinishModal();
  }

  openFinishModal() {
    const acc = this.attempts > 0 ? Math.round((this.correctAttempts / this.attempts) * 100) : 100;
    const rank = window.ArcadeCore?.Progress?.computeRank
      ? window.ArcadeCore.Progress.computeRank({ victory: true, accuracy: acc, sealsCleared: 4, bypasses: 0 })
      : 'S';
    renderTex(
      document.getElementById('finishDesc'),
      'اجتزت جميع مهارات الدرس 1 (1–22): النهايات، إزالة الأشكال غير المحددة، الجزء الصحيح $E(x)$، المقاربات، التفرع الثنائي TVI، والدالة العكسية $f^{-1}$!'
    );
    document.getElementById('fScore').textContent = String(this.score);
    document.getElementById('fAcc').textContent = `${acc}%`;
    document.getElementById('fRank').textContent = rank;
    this.finishModal?.classList.remove('hidden');
    this.syncProgress();
  }

  updateStats() {
    if (this.scoreEl) this.scoreEl.textContent = String(this.score);
    if (this.sectorClearedEl) this.sectorClearedEl.textContent = `${this.clearedSectors.size}/${SECTORS.length}`;
  }

  flashFrame(kind) {
    if (!this.frame) return;
    this.frame.classList.remove('flash-ok', 'flash-err');
    void this.frame.offsetWidth;
    this.frame.classList.add(kind === 'ok' ? 'flash-ok' : 'flash-err');
    clearTimeout(this.flashTimer);
    this.flashTimer = setTimeout(() => this.frame?.classList.remove('flash-ok', 'flash-err'), 500);
  }

  showBanner(msg, type) {
    if (!this.rideBannerEl) return;
    this.rideBannerEl.className = `ride-banner ${type}`;
    renderTex(this.rideBannerEl, msg);
  }

  hideBanner() {
    if (!this.rideBannerEl) return;
    this.rideBannerEl.className = 'ride-banner hidden';
  }

  spawnBurst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const spd = 50 + Math.random() * 140;
      this.particles.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd, life: 0.65, maxLife: 0.65, color });
    }
  }

  bindEvents() {
    this.btnPrimary?.addEventListener('click', () => this.triggerPrimaryAction());
    this.btnNextTrack?.addEventListener('click', () => this.advanceTrack());

    this.btnProof?.addEventListener('click', () => {
      this.audio.unlock();
      const open = this.proofDrawerEl?.classList.toggle('hidden') === false;
      this.btnProof?.classList.toggle('active', open);
    });
    document.getElementById('btnCloseProof')?.addEventListener('click', () => {
      this.proofDrawerEl?.classList.add('hidden');
      this.btnProof?.classList.remove('active');
    });

    this.btnAudio?.addEventListener('click', () => {
      this.audio.muted = !this.audio.muted;
      if (this.btnAudio) this.btnAudio.textContent = this.audio.muted ? '🔇' : '🔊';
      if (!this.audio.muted) this.audio.unlock();
    });

    this.btnReset?.addEventListener('click', () => {
      this.audio.unlock();
      this.loadTrack(this.sectorIdx, this.trackIdx);
    });

    document.getElementById('btnReplay')?.addEventListener('click', () => {
      this.finishModal?.classList.add('hidden');
      this.clearedTracks.clear();
      this.clearedSectors.clear();
      this.score = 0;
      this.attempts = 0;
      this.correctAttempts = 0;
      this.loadTrack(0, 0);
    });

    const toLocal = (e) => {
      const r = this.canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      this.audio.unlock();
      const tr = this.getTrack();
      if (tr.mode === 'floor-jump' && this.rider.active && this.rider.state === 'riding') {
        this.triggerPrimaryAction();
        return;
      }
      const pt = toLocal(e);
      let best = null;
      let bestDist = 30;
      for (const h of this.handles) {
        const d = Math.hypot(pt.x - h.x, pt.y - h.y);
        if (d <= bestDist) {
          bestDist = d;
          best = h;
        }
      }
      if (best) {
        this.activeDrag = best;
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
      let bestDist = 26;
      for (const h of this.handles) {
        const d = Math.hypot(pt.x - h.x, pt.y - h.y);
        if (d <= bestDist) {
          bestDist = d;
          hover = h.id;
        }
      }
      this.hoverHandle = hover;
      this.canvas.style.cursor = hover ? 'grab' : 'crosshair';
    });

    const endDrag = () => { this.activeDrag = null; };
    this.canvas.addEventListener('pointerup', endDrag);
    this.canvas.addEventListener('pointercancel', endDrag);

    window.addEventListener('keydown', (e) => {
      if (!this.finishModal?.classList.contains('hidden')) return;
      this.audio.unlock();
      const tr = this.getTrack();
      const sec = this.getSector();

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (!this.btnNextTrack?.classList.contains('hidden')) this.advanceTrack();
        else this.triggerPrimaryAction();
      } else if (tr.mode === 'bisection-slicer' && (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        this.performBisect('left');
      } else if (tr.mode === 'bisection-slicer' && (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        this.performBisect('right');
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        const sl = tr.slider || tr.sliders?.[0];
        if (sl) { e.preventDefault(); this.setSlider(sl.key, this.st[sl.key] + sl.step); }
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        const sl = tr.slider || tr.sliders?.[0];
        if (sl) { e.preventDefault(); this.setSlider(sl.key, this.st[sl.key] - sl.step); }
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        const sl = tr.sliders?.[1] || tr.slider;
        if (sl) { e.preventDefault(); this.setSlider(sl.key, this.st[sl.key] + sl.step); }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        const sl = tr.sliders?.[1] || tr.slider;
        if (sl) { e.preventDefault(); this.setSlider(sl.key, this.st[sl.key] - sl.step); }
      } else if (e.key === '1' || e.key === '2' || e.key === '3') {
        const idx = Number(e.key) - 1;
        if (idx < sec.tracks.length) this.loadTrack(this.sectorIdx, idx);
      } else if (e.key === 'h' || e.key === 'H') {
        this.btnProof?.click();
      } else if (e.key === 'r' || e.key === 'R') {
        this.loadTrack(this.sectorIdx, this.trackIdx);
      } else if (e.key === 'm' || e.key === 'M') {
        this.btnAudio?.click();
      } else if (e.key === ']') {
        this.loadTrack((this.sectorIdx + 1) % SECTORS.length, 0);
      } else if (e.key === '[') {
        this.loadTrack((this.sectorIdx - 1 + SECTORS.length) % SECTORS.length, 0);
      }
    });
  }

  pollGamepad() {
    const GP = window.ArcadeCore?.Gamepad;
    if (!GP || !this.gpState) return;
    const gp = GP.resolveActiveGamepad(this.gpState);
    if (!gp) return;

    const tr = this.getTrack();
    const nav = GP.sampleDirectionalNav(gp, this.gpState);
    if (tr.mode === 'bisection-slicer') {
      if (nav.dLeft) this.performBisect('left');
      if (nav.dRight) this.performBisect('right');
    } else {
      const sl0 = tr.slider || tr.sliders?.[0];
      const sl1 = tr.sliders?.[1];
      if (sl0 && nav.dUp) this.setSlider(sl0.key, this.st[sl0.key] + sl0.step);
      if (sl0 && nav.dDown) this.setSlider(sl0.key, this.st[sl0.key] - sl0.step);
      if (sl1 && nav.dRight) this.setSlider(sl1.key, this.st[sl1.key] + sl1.step);
      if (sl1 && nav.dLeft) this.setSlider(sl1.key, this.st[sl1.key] - sl1.step);
    }

    if (GP.justPressed(gp, this.gpState, 0)) {
      if (!this.btnNextTrack?.classList.contains('hidden')) this.advanceTrack();
      else this.triggerPrimaryAction();
    }
    if (GP.justPressed(gp, this.gpState, 1)) this.loadTrack(this.sectorIdx, this.trackIdx);
    if (GP.justPressed(gp, this.gpState, 4)) this.loadTrack((this.sectorIdx - 1 + SECTORS.length) % SECTORS.length, 0);
    if (GP.justPressed(gp, this.gpState, 5)) this.loadTrack((this.sectorIdx + 1) % SECTORS.length, 0);

    GP.snapshotButtons(gp, this.gpState);
  }

  getView() {
    const tr = this.getTrack();
    if (tr.mode === 'bisection-slicer') {
      return { xMin: this.bisectCam.xMin, xMax: this.bisectCam.xMax, yMin: -2.5, yMax: 7.5 };
    }
    return tr.view;
  }

  toScreenX(x) {
    const v = this.getView();
    const pad = 42;
    return pad + ((x - v.xMin) / (v.xMax - v.xMin)) * (this.w - pad * 2);
  }

  toScreenY(y) {
    const v = this.getView();
    const pad = 34;
    return pad + (this.h - pad * 2) - ((y - v.yMin) / (v.yMax - v.yMin)) * (this.h - pad * 2);
  }

  fromScreenX(px) {
    const v = this.getView();
    const pad = 42;
    return v.xMin + ((px - pad) / (this.w - pad * 2)) * (v.xMax - v.xMin);
  }

  fromScreenY(py) {
    const v = this.getView();
    const pad = 34;
    return v.yMin + ((pad + (this.h - pad * 2) - py) / (this.h - pad * 2)) * (v.yMax - v.yMin);
  }

  loop(ts) {
    const dt = Math.min(0.05, this.lastTs ? (ts - this.lastTs) / 1000 : 0.016);
    this.lastTs = ts;
    this.pollGamepad();
    this.update(dt);
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const tr = this.getTrack();

    // Smooth camera zoom for bisection
    if (tr.mode === 'bisection-slicer') {
      const margin = Math.max(0.06, (this.st.b - this.st.a) * 0.35);
      const tMin = this.st.a - margin;
      const tMax = this.st.b + margin;
      this.bisectCam.xMin += (tMin - this.bisectCam.xMin) * Math.min(1, dt * 7);
      this.bisectCam.xMax += (tMax - this.bisectCam.xMax) * Math.min(1, dt * 7);
    }

    // Smooth mirror fold for inverse function
    if (tr.mode === 'inverse-mirror') {
      const targetT = this.st.mirrored ? 1 : 0;
      this.mirrorT += (targetT - this.mirrorT) * Math.min(1, dt * 5.5);
    }

    // Rider physics simulation
    if (this.rider.active) {
      if (this.rider.state === 'falling') {
        this.rider.vy -= 18 * dt;
        this.rider.y += this.rider.vy * dt;
        this.rider.x += 0.45 * dt;
        if (this.rider.y < this.getView().yMin - 1) {
          this.failRide(this.rider.failReason || 'سقط المتزلّج في الانقطاع!');
        }
      } else if (this.rider.state === 'riding') {
        this.stepRiderPhysics(tr, dt);
      }
      this.rider.trail.push({ x: this.rider.x, y: this.rider.y });
      if (this.rider.trail.length > 26) this.rider.trail.shift();
    }

    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  stepRiderPhysics(tr, dt) {
    const rd = this.rider;

    if (tr.mode === 'hole-repair') {
      const speed = (tr.xEnd - tr.xStart) / 2.2;
      const prevX = rd.x;
      rd.x += speed * dt;
      const crossedHole = prevX < tr.holeX && rd.x >= tr.holeX;
      const opObj = tr.ops.find((o) => o.id === this.st.op);
      const opOk = Boolean(opObj && opObj.correct);
      const plugOk = Math.abs(this.st.plugY - tr.targetL) < 0.08;

      if (crossedHole) {
        if (!opOk || !plugOk) {
          rd.state = 'falling';
          rd.vy = -1.5;
          rd.failReason = !opOk
            ? 'أداة الجراحة غير مناسبة لإزالة الشكل غير المحدد $\\frac{0}{0}$! اختر التقنية الصحيحة.'
            : `ارتفاع السدادة $${this.st.plugY.toFixed(2)}$ لا يطابق النهاية $L = ${tr.targetL}$!`;
          this.spawnBurst(this.toScreenX(tr.holeX), this.toScreenY(tr.targetL), '#ff4d6d', 16);
          return;
        }
        this.audio.playSlice(4);
        this.spawnBurst(this.toScreenX(tr.holeX), this.toScreenY(tr.targetL), '#4ade80', 14);
      }
      const y = Math.abs(rd.x - tr.holeX) < 0.08 ? tr.targetL : tr.f(rd.x);
      if (Number.isFinite(y)) rd.y = y;
      if (rd.x >= tr.xEnd) {
        this.attempts += 1;
        this.correctAttempts += 1;
        this.recordAttempt(true);
        this.markTrackCleared(`عبور متّصل! أزلت $\\frac{0}{0}$ ومدّدت الدالة عند $L = ${tr.targetL}$.`);
      }
      return;
    }

    if (tr.mode === 'piecewise-weld') {
      const prevX = rd.x;
      rd.x += 2.2 * dt;
      if (prevX < tr.splitX && rd.x >= tr.splitX) {
        if (Math.abs(this.st.k - tr.targetK) > 0.05) {
          this.spawnBurst(this.toScreenX(tr.splitX), this.toScreenY(2), '#ff4d6d', 16);
          this.failRide(`فجوة انقطاع عند $x = 1$! $\\lim_{1^-} f = 2 \\neq ${(2 + this.st.k).toFixed(1)} = \\lim_{1^+} f$. اضبط $k = 0$!`);
          return;
        }
        this.audio.playSlice(4);
      }
      rd.y = rd.x <= tr.splitX ? tr.fLeft(rd.x) : tr.fRight(rd.x, this.st.k);
      if (rd.x >= tr.xEnd) {
        this.attempts += 1;
        this.correctAttempts += 1;
        this.recordAttempt(true);
        this.markTrackCleared('لحام مثالي! توحّدت النهايتان يميناً ويساراً عند $f(1) = 2$ ($k = 0$).');
      }
      return;
    }

    if (tr.mode === 'floor-jump') {
      const prevX = rd.x;
      rd.x += 1.05 * dt;
      const stepY = Math.floor(rd.x);
      if (!rd.onGround) {
        rd.vy -= 14.5 * dt;
        rd.y += rd.vy * dt;
        if (rd.y <= stepY && rd.vy <= 0) {
          rd.y = stepY;
          rd.vy = 0;
          rd.onGround = true;
          this.audio.tone(SCALE[Math.min(7, stepY + 1)], 0.09, 'triangle', 0.06);
        }
      } else {
        rd.y = stepY;
      }
      // Check wall hit when crossing integer jump n in {1, 2, 3, 4}
      for (const n of tr.jumps) {
        if (prevX < n && rd.x >= n) {
          if (rd.y < n - 0.16) {
            this.spawnBurst(this.toScreenX(n), this.toScreenY(n - 0.5), '#ff4d6d', 16);
            this.failRide(`اصطدمت بدرجة عدم اتصال $E(x)$ عند $x = ${n}$ ($\\lim_{${n}^-} E = ${n - 1} \\neq ${n}$)! اقفز قبل العدد الصحيح!`);
            return;
          }
          this.spawnBurst(this.toScreenX(n), this.toScreenY(n), '#4ade80', 10);
        }
      }
      if (rd.x >= tr.xEnd) {
        this.attempts += 1;
        this.correctAttempts += 1;
        this.recordAttempt(true);
        this.markTrackCleared('بارع! قفزت فوق كل نقط عدم الاتصال في $\\mathbb{Z}$ لدالة الجزء الصحيح $E(x)$!');
      }
      return;
    }

    if (tr.mode === 'domain-carve') {
      const a = this.st.domA;
      const b = this.st.domB;
      if (a < tr.validMin - 1e-4) {
        this.failRide(`البداية $a = ${a.toFixed(2)} < 1$ خارج مجموعة التعريف ($x - 1 < 0$)!`);
        return;
      }
      if (b >= tr.poleX - 0.05) {
        rd.x += 2.2 * dt;
        const y = tr.f(rd.x);
        if (Number.isFinite(y)) rd.y = y;
        if (rd.x >= tr.poleX - 0.12) {
          this.spawnBurst(this.toScreenX(tr.poleX), this.toScreenY(4), '#ff4d6d', 18);
          this.failRide('اصطدمت بالقيمة الممنوعة $x = 4$ (انعدام المقام $4 - x = 0$)! اجعل $b < 4$.');
        }
        return;
      }
      if (b - a < 1.75) {
        this.failRide('المجال المقتطع ضيّق جداً! وسّع $[a, b]$ ليغطي معظم المجال المتصل $[1, 4[$.');
        return;
      }
      rd.x += 2.1 * dt;
      const y = tr.f(rd.x);
      if (Number.isFinite(y)) rd.y = y;
      if (rd.x >= b) {
        this.attempts += 1;
        this.correctAttempts += 1;
        this.recordAttempt(true);
        this.markTrackCleared(`مجال متصل آمن! $[${a.toFixed(2)}, ${b.toFixed(2)}] \\subset [1, 4[ \\subset D_f$.`);
      }
      return;
    }

    if (tr.mode === 'asymptote-oblique') {
      rd.x += 3.2 * dt;
      rd.y = tr.f(rd.x);
      if (rd.x >= tr.xEnd) {
        const ok = Math.abs(this.st.slopeA - tr.targetA) < 0.05 && Math.abs(this.st.intB - tr.targetB) < 0.05;
        if (!ok) {
          this.failRide(`سكة الليزر $y = ${this.st.slopeA.toFixed(2)}x + ${this.st.intB.toFixed(2)}$ لا تقارب $x + 1$ عند $+\\infty$!`);
          return;
        }
        this.attempts += 1;
        this.correctAttempts += 1;
        this.recordAttempt(true);
        this.markTrackCleared('التحام مثالي! $(\\Delta): y = x + 1$ مقارب مائل لأن $\\lim_{+\\infty} \\frac{2}{x} = 0$.');
      }
      return;
    }

    if (tr.mode === 'asymptote-vh') {
      const vaOk = Math.abs(this.st.va - tr.targetVA) < 0.05;
      const haOk = Math.abs(this.st.ha - tr.targetHA) < 0.05;
      const opOk = Boolean(tr.ops.find((o) => o.id === this.st.op)?.correct);
      rd.x += 3.8 * dt;
      if (!rd.warped && rd.x >= 1.72) {
        if (!vaOk || !opOk) {
          this.spawnBurst(this.toScreenX(2), this.toScreenY(-2), '#ff4d6d', 18);
          this.failRide(!vaOk ? 'ضع بوابة المقارب العمودي عند $x = 2$ أولاً!' : 'القطبية خاطئة! عند $2^-$ المقام $0^-$ ($-\\infty$) وعند $2^+$ المقام $0^+$ ($+\\infty$).');
          return;
        }
        rd.warped = true;
        rd.x = 2.28;
        rd.trail = [];
        this.audio.playJump();
        this.spawnBurst(this.toScreenX(2), this.toScreenY(8), '#38bdf8', 16);
      }
      const y = tr.f(rd.x);
      if (Number.isFinite(y)) rd.y = clamp(y, -5.5, 9.5);
      if (rd.x >= 7.0) {
        if (!haOk) {
          this.failRide('المتزلّج عبر القطب العمودي لكن المقارب الأفقي غير مضبوط عند $y = 2$!');
          return;
        }
        this.attempts += 1;
        this.correctAttempts += 1;
        this.recordAttempt(true);
        this.markTrackCleared('عبور خارق! المقاربان $x = 2$ و $y = 2$ والقطبية $2^-/2^+$ مضبوطة 100%.');
      }
      return;
    }

    if (tr.mode === 'image-projector') {
      rd.x += 2.2 * dt;
      rd.y = tr.f(rd.x);
      if (rd.x >= tr.domB) {
        const minOk = Math.abs(this.st.imgMin - tr.targetMin) < 0.05;
        const maxOk = Math.abs(this.st.imgMax - tr.targetMax) < 0.05;
        const opOk = Boolean(tr.ops.find((o) => o.id === this.st.op)?.correct);
        if (!minOk || !maxOk || !opOk) {
          this.failRide(!opOk ? 'الدالة تناقصية قطعاً على $[1, 5]$؛ يجب قلب الترتيب إلى $[f(5), f(1)]$!' : 'اضبط بوابتي الأراتيب على $m = f(5) = 1$ و $M = f(1) = 3$!');
          return;
        }
        this.attempts += 1;
        this.correctAttempts += 1;
        this.recordAttempt(true);
        this.markTrackCleared('إسقاط صحيح! بما أن $f$ متصلة وتناقصية فإن $f([1, 5]) = [1, 3]$.');
      }
      return;
    }

    if (tr.mode === 'inverse-mirror') {
      if (Math.abs(this.st.clipX - tr.targetClipX) > 0.05) {
        this.failRide('المنحنى غير رتيب على $[-1, 3]$! قصّه أولاً إلى $x_{\\min} = 1$ لتتحقق التقابلية.');
        return;
      }
      if (!this.st.mirrored) {
        this.failRide('اضغط على زر «🪞 اعكس المسار حول $y = x$» لتشكيل منحنى $f^{-1}$ أولاً!');
        return;
      }
      rd.x += 2.4 * dt;
      rd.y = tr.fInv(rd.x);
      if (rd.x >= 5.0) {
        if (Math.abs(this.st.invAns - tr.targetInvVal) > 0.05) {
          this.failRide(`بما أن $f(3) = 5$ فإن $f^{-1}(5) = 3$ وليس $${this.st.invAns.toFixed(1)}$!`);
          return;
        }
        this.attempts += 1;
        this.correctAttempts += 1;
        this.recordAttempt(true);
        this.markTrackCleared('تماثل مثالي! $\\mathcal{C}_{f^{-1}}$ متماثل مع $\\mathcal{C}_f$ حول $y = x$ و $f^{-1}(5) = 3$.');
      }
      return;
    }

    if (tr.mode === 'rational-power') {
      const opObj = tr.ops.find((o) => o.id === this.st.op) || tr.ops[0];
      rd.x += 4.2 * dt;
      rd.y = Math.pow(Math.max(0.01, rd.x), opObj.exp);
      if (rd.x >= tr.xEnd) {
        const rootOk = Math.abs(this.st.rootAns - 2) < 0.05;
        if (!opObj.correct || !rootOk) {
          this.failRide(!opObj.correct ? 'المنحنى أخطأ النجم $(8, 4)$! جرّب $r = \\frac{2}{3}$ لأن $8^{2/3} = (\\sqrt[3]{8})^2 = 4$.' : 'حل المعادلة $x^3 = 8$ هو $\\sqrt[3]{8} = 2$!');
          return;
        }
        this.attempts += 1;
        this.correctAttempts += 1;
        this.recordAttempt(true);
        this.markTrackCleared('إصابة مباشرة! $\\sqrt[3]{8} = 2$ ومنه $8^{2/3} = 4$.');
      }
    }
  }

  drawLabel(text, x, y, opts = {}) {
    const ctx = this.ctx;
    const str = String(text ?? '');
    const rich = window.ArcadeCore?.CanvasAxisKit?.drawMathRich;
    const hasArabic = /[\u0600-\u06FF]/.test(str);
    const hasRich = !hasArabic && /[₀-₉⁰-⁹ₙˣ√=_^{}\\]/.test(str);
    if (hasRich && rich) {
      rich(ctx, str, x, y, {
        fontSize: opts.fontSize || 12,
        color: opts.color || '#f1f5f9',
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
    ctx.fillStyle = opts.color || '#f1f5f9';
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  drawHandle(id, x, y, label, color) {
    const ctx = this.ctx;
    const active = this.activeDrag?.id === id || this.hoverHandle === id;
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
    ctx.strokeStyle = '#050816';
    ctx.stroke();

    if (label) {
      const w = Math.max(50, label.replace(/[_^{}\\]/g, '').length * 7.2 + 16);
      const px = clamp(x - w / 2, 8, this.w - w - 8);
      const py = y - r - 24 < 8 ? y + r + 6 : y - r - 24;
      ctx.fillStyle = 'rgba(7, 11, 28, 0.94)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px, py, w, 19, 5);
      ctx.fill();
      ctx.stroke();
      this.drawLabel(label, px + w / 2, py + 9.5, { color: '#fff', fontSize: 11 });
    }
    ctx.restore();
  }

  drawAxesAndGrid() {
    const ctx = this.ctx;
    const v = this.getView();
    if (window.ArcadeCore?.CanvasAxisKit?.clearWithGrid) {
      window.ArcadeCore.CanvasAxisKit.clearWithGrid(ctx, this.w, this.h, {
        bg: '#040713',
        gridColor: 'rgba(56, 189, 248, 0.08)',
        step: 36,
        offset: 18
      });
    } else {
      ctx.fillStyle = '#040713';
      ctx.fillRect(0, 0, this.w, this.h);
    }

    const ox = this.toScreenX(0);
    const oy = this.toScreenY(0);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.42)';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    if (oy >= 10 && oy <= this.h - 10) {
      ctx.moveTo(16, oy);
      ctx.lineTo(this.w - 16, oy);
    }
    if (ox >= 10 && ox <= this.w - 10) {
      ctx.moveTo(ox, 12);
      ctx.lineTo(ox, this.h - 12);
    }
    ctx.stroke();

    // Ticks
    const spanX = v.xMax - v.xMin;
    const stepX = spanX <= 0.4 ? 0.05 : spanX <= 1.2 ? 0.25 : spanX <= 6 ? 1 : 2;
    const firstX = Math.ceil(v.xMin / stepX) * stepX;
    const tickY = clamp(oy, 24, this.h - 20);
    for (let x = firstX; x <= v.xMax - 1e-4; x += stepX) {
      if (Math.abs(x) < 1e-4) continue;
      const sx = this.toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, tickY - 3);
      ctx.lineTo(sx, tickY + 3);
      ctx.stroke();
      const lbl = Math.abs(x - Math.round(x)) < 1e-3 ? String(Math.round(x)) : x.toFixed(2);
      this.drawLabel(lbl, sx, tickY + 13, { color: '#94a3b8', font: '700 10px "KaTeX_Main", monospace' });
    }

    const spanY = v.yMax - v.yMin;
    const stepY = spanY <= 4 ? 1 : spanY <= 10 ? 2 : 4;
    const firstY = Math.ceil(v.yMin / stepY) * stepY;
    const tickX = clamp(ox, 28, this.w - 28);
    for (let y = firstY; y <= v.yMax - 1e-4; y += stepY) {
      if (Math.abs(y) < 1e-4) continue;
      const sy = this.toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(tickX - 3, sy);
      ctx.lineTo(tickX + 3, sy);
      ctx.stroke();
      this.drawLabel(String(Math.round(y)), tickX - 15, sy, { color: '#94a3b8', font: '700 10px "KaTeX_Main", monospace' });
    }
  }

  plotCurve(fn, xMin, xMax, color, width = 3, dashed = false) {
    const ctx = this.ctx;
    const v = this.getView();
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dashed) ctx.setLineDash([6, 5]);
    ctx.beginPath();
    let started = false;
    const N = 220;
    for (let i = 0; i <= N; i += 1) {
      const x = xMin + (i / N) * (xMax - xMin);
      const y = fn(x);
      if (!Number.isFinite(y) || y < v.yMin - 6 || y > v.yMax + 6) {
        started = false;
        continue;
      }
      const sx = this.toScreenX(x);
      const sy = this.toScreenY(y);
      if (!started) {
        ctx.moveTo(sx, sy);
        started = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  drawRiderGlider() {
    const ctx = this.ctx;
    const rd = this.rider;
    if (this.getTrack().mode === 'bisection-slicer') return;

    if (rd.trail.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      rd.trail.forEach((pt, i) => {
        const sx = this.toScreenX(pt.x);
        const sy = this.toScreenY(pt.y);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.stroke();
      ctx.restore();
    }

    const sx = this.toScreenX(rd.x);
    const sy = this.toScreenY(rd.y);
    ctx.save();
    ctx.fillStyle = rd.state === 'crashed' ? '#ff4d6d' : '#fbbf24';
    ctx.beginPath();
    ctx.arc(sx, sy - 7, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Glider ski bar
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(sx - 12, sy - 1);
    ctx.lineTo(sx + 12, sy - 1);
    ctx.stroke();
    ctx.restore();
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    this.handles = [];

    this.drawAxesAndGrid();
    const tr = this.getTrack();
    const v = this.getView();

    if (tr.mode === 'hole-repair') {
      this.plotCurve(tr.f, v.xMin, tr.holeX - 0.05, '#38bdf8', 3.2);
      this.plotCurve(tr.f, tr.holeX + 0.05, v.xMax, '#38bdf8', 3.2);

      // Vertical dashed guide at hole
      const hx = this.toScreenX(tr.holeX);
      const holeSy = this.toScreenY(tr.targetL);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255, 77, 109, 0.5)';
      ctx.beginPath();
      ctx.moveTo(hx, 20);
      ctx.lineTo(hx, this.h - 20);
      ctx.stroke();
      ctx.setLineDash([]);

      // Hollow discontinuity ring at (holeX, targetL)
      ctx.fillStyle = '#040713';
      ctx.strokeStyle = '#ff4d6d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hx, holeSy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Draggable continuity plug
      const plugSy = this.toScreenY(this.st.plugY);
      const plugOk = Math.abs(this.st.plugY - tr.targetL) < 0.08;
      this.drawHandle('plugY', hx, plugSy, `L=${this.st.plugY.toFixed(2)}`, plugOk ? '#4ade80' : '#fbbf24');
      this.handles.push({
        id: 'plugY', x: hx, y: plugSy,
        onDrag: (_, py) => this.setSlider('plugY', this.fromScreenY(py))
      });
    } else if (tr.mode === 'piecewise-weld') {
      this.plotCurve(tr.fLeft, v.xMin, tr.splitX, '#38bdf8', 3.2);
      this.plotCurve((x) => tr.fRight(x, this.st.k), tr.splitX, v.xMax, '#fbbf24', 3.2);
      const sx = this.toScreenX(tr.splitX);
      const leftY = this.toScreenY(tr.fLeft(tr.splitX));
      const rightY = this.toScreenY(tr.fRight(tr.splitX, this.st.k));
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(sx, leftY, 6, 0, Math.PI * 2);
      ctx.fill();
      this.drawHandle('k', sx + 22, rightY, `k=${this.st.k.toFixed(1)}`, Math.abs(this.st.k) < 0.05 ? '#4ade80' : '#ff4d6d');
      this.handles.push({
        id: 'k', x: sx + 22, y: rightY,
        onDrag: (_, py) => this.setSlider('k', this.fromScreenY(py) - 2)
      });
    } else if (tr.mode === 'floor-jump') {
      for (let n = 0; n <= 4; n += 1) {
        const x0 = this.toScreenX(n);
        const x1 = this.toScreenX(n + 1);
        const y = this.toScreenY(n);
        // Jump zone highlight before integer discontinuity
        if (n < 4) {
          ctx.fillStyle = 'rgba(251, 191, 36, 0.14)';
          ctx.fillRect(this.toScreenX(n + 0.66), y - 28, x1 - this.toScreenX(n + 0.66), 28);
        }
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
        // Filled left endpoint [n, n+1[
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.arc(x0, y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        // Hollow right endpoint
        ctx.fillStyle = '#040713';
        ctx.strokeStyle = '#ff4d6d';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(x1, y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      this.drawLabel('E(x) = ⌊x⌋', this.w - 80, 26, { color: '#bae6fd', fontSize: 13 });
    } else if (tr.mode === 'domain-carve') {
      // Forbidden x < 1 zone
      ctx.fillStyle = 'rgba(255, 77, 109, 0.14)';
      ctx.fillRect(0, 0, this.toScreenX(tr.validMin), this.h);
      // Pole laser at x = 4
      const px = this.toScreenX(tr.poleX);
      ctx.strokeStyle = '#ff4d6d';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(px, 10);
      ctx.lineTo(px, this.h - 10);
      ctx.stroke();
      ctx.setLineDash([]);
      this.drawLabel('x = 4', px + 26, 24, { color: '#fda4af', fontSize: 12 });

      // Safe carved window [domA, domB]
      const ax = this.toScreenX(this.st.domA);
      const bx = this.toScreenX(this.st.domB);
      ctx.fillStyle = 'rgba(74, 222, 128, 0.1)';
      ctx.fillRect(Math.min(ax, bx), 18, Math.abs(bx - ax), this.h - 36);

      this.plotCurve(tr.f, tr.validMin, tr.poleX - 0.1, '#38bdf8', 3);
      this.plotCurve(tr.f, tr.poleX + 0.1, v.xMax, '#38bdf8', 3);

      const handleY = this.toScreenY(0);
      this.drawHandle('domA', ax, handleY, `a=${this.st.domA.toFixed(2)}`, '#4ade80');
      this.drawHandle('domB', bx, handleY, `b=${this.st.domB.toFixed(2)}`, '#fbbf24');
      this.handles.push({ id: 'domA', x: ax, y: handleY, onDrag: (mx) => this.setSlider('domA', this.fromScreenX(mx)) });
      this.handles.push({ id: 'domB', x: bx, y: handleY, onDrag: (mx) => this.setSlider('domB', this.fromScreenX(mx)) });
    } else if (tr.mode === 'asymptote-oblique') {
      this.plotCurve(tr.f, 0.25, v.xMax, '#38bdf8', 3.2);
      const lineFn = (x) => this.st.slopeA * x + this.st.intB;
      this.plotCurve(lineFn, v.xMin, v.xMax, '#fbbf24', 2.4, true);

      const p1x = this.toScreenX(2);
      const p1y = this.toScreenY(lineFn(2));
      const p2x = this.toScreenX(6.5);
      const p2y = this.toScreenY(lineFn(6.5));
      this.drawHandle('intB', p1x, p1y, `b=${this.st.intB.toFixed(1)}`, '#fbbf24');
      this.drawHandle('slopeA', p2x, p2y, `a=${this.st.slopeA.toFixed(2)}`, '#4ade80');
      this.handles.push({ id: 'intB', x: p1x, y: p1y, onDrag: (_, py) => this.setSlider('intB', this.fromScreenY(py) - this.st.slopeA * 2) });
      this.handles.push({ id: 'slopeA', x: p2x, y: p2y, onDrag: (_, py) => this.setSlider('slopeA', (this.fromScreenY(py) - this.st.intB) / 6.5) });
    } else if (tr.mode === 'asymptote-vh') {
      this.plotCurve(tr.f, v.xMin, 1.9, '#38bdf8', 3);
      this.plotCurve(tr.f, 2.1, v.xMax, '#38bdf8', 3);

      const vax = this.toScreenX(this.st.va);
      const hay = this.toScreenY(this.st.ha);
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#ff4d6d';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(vax, 14);
      ctx.lineTo(vax, this.h - 14);
      ctx.stroke();
      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(16, hay);
      ctx.lineTo(this.w - 16, hay);
      ctx.stroke();
      ctx.setLineDash([]);

      this.drawHandle('va', vax, 42, `x=${this.st.va.toFixed(1)}`, '#ff4d6d');
      this.drawHandle('ha', this.w - 64, hay, `y=${this.st.ha.toFixed(1)}`, '#fbbf24');
      this.handles.push({ id: 'va', x: vax, y: 42, onDrag: (mx) => this.setSlider('va', this.fromScreenX(mx)) });
      this.handles.push({ id: 'ha', x: this.w - 64, y: hay, onDrag: (_, py) => this.setSlider('ha', this.fromScreenY(py)) });
    } else if (tr.mode === 'bisection-slicer') {
      const a = this.st.a;
      const b = this.st.b;
      const c = 0.5 * (a + b);
      const ax = this.toScreenX(a);
      const bx = this.toScreenX(b);
      const cx = this.toScreenX(c);

      // Active bracket shading
      ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
      ctx.fillRect(ax, 14, bx - ax, this.h - 28);

      // Midpoint laser scissor line
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, 16);
      ctx.lineTo(cx, this.h - 16);
      ctx.stroke();
      ctx.setLineDash([]);

      this.plotCurve(tr.f, v.xMin, v.xMax, '#38bdf8', 3.2);

      // Sign markers for a, c, b
      [[a, 'a'], [c, 'c'], [b, 'b']].forEach(([xv, name]) => {
        const yv = tr.f(xv);
        const px = this.toScreenX(xv);
        const py = clamp(this.toScreenY(yv), 26, this.h - 26);
        const col = yv >= 0 ? '#4ade80' : '#ff4d6d';
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fill();
        this.drawLabel(`f(${name})=${yv >= 0 ? '+' : ''}${yv.toFixed(2)}`, px, py + (yv >= 0 ? -18 : 18), { color: col, fontSize: 11 });
      });

      if (this.st.cuts >= tr.targetCuts) {
        const rx = this.toScreenX(tr.trueRoot);
        const ry = this.toScreenY(0);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(rx, ry, 9, 0, Math.PI * 2);
        ctx.fill();
        this.drawLabel(`α ≈ ${tr.trueRoot.toFixed(4)}`, rx, ry - 34, { color: '#fde68a', fontSize: 12 });
      }
    } else if (tr.mode === 'image-projector') {
      // Shaded domain [1, 5] & projected image [imgMin, imgMax]
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.fillRect(this.toScreenX(tr.domA), 14, this.toScreenX(tr.domB) - this.toScreenX(tr.domA), this.h - 28);
      const yLo = this.toScreenY(this.st.imgMin);
      const yHi = this.toScreenY(this.st.imgMax);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.12)';
      ctx.fillRect(this.toScreenX(0), Math.min(yLo, yHi), this.toScreenX(tr.domB) - this.toScreenX(0), Math.abs(yLo - yHi));

      this.plotCurve(tr.f, v.xMin, v.xMax, 'rgba(56, 189, 248, 0.3)', 2);
      this.plotCurve(tr.f, tr.domA, tr.domB, '#38bdf8', 3.8);

      const oyX = this.toScreenX(0);
      this.drawHandle('imgMin', oyX, yLo, `m=${this.st.imgMin.toFixed(1)}`, '#4ade80');
      this.drawHandle('imgMax', oyX, yHi, `M=${this.st.imgMax.toFixed(1)}`, '#fbbf24');
      this.handles.push({ id: 'imgMin', x: oyX, y: yLo, onDrag: (_, py) => this.setSlider('imgMin', this.fromScreenY(py)) });
      this.handles.push({ id: 'imgMax', x: oyX, y: yHi, onDrag: (_, py) => this.setSlider('imgMax', this.fromScreenY(py)) });
    } else if (tr.mode === 'inverse-mirror') {
      // Mirror line y = x
      this.plotCurve((x) => x, v.xMin, v.xMax, '#fbbf24', 2, true);
      this.drawLabel('y = x', this.toScreenX(5.4), this.toScreenY(5.6), { color: '#fde68a', fontSize: 12 });

      // Dimmed full parabola + active clipped branch
      this.plotCurve(tr.f, -1, 3, 'rgba(56, 189, 248, 0.25)', 2);
      this.plotCurve(tr.f, this.st.clipX, 3, '#38bdf8', 3.5);

      // Animated reflection fold towards f^{-1}
      if (this.mirrorT > 0.02) {
        ctx.save();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        for (let i = 0; i <= 80; i += 1) {
          const x = this.st.clipX + (i / 80) * (3 - this.st.clipX);
          const y = tr.f(x);
          const rx = (1 - this.mirrorT) * x + this.mirrorT * y;
          const ry = (1 - this.mirrorT) * y + this.mirrorT * x;
          const sx = this.toScreenX(rx);
          const sy = this.toScreenY(ry);
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Target star (5, 3) on f^{-1}
      const stX = this.toScreenX(5);
      const stY = this.toScreenY(3);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(stX, stY, 9, 0, Math.PI * 2);
      ctx.stroke();
      this.drawLabel('(5, 3)', stX, stY - 18, { color: '#fde68a', fontSize: 11 });

      const clipPx = this.toScreenX(this.st.clipX);
      const clipPy = this.toScreenY(tr.f(this.st.clipX));
      this.drawHandle('clipX', clipPx, clipPy, `x_{min}=${this.st.clipX.toFixed(1)}`, '#38bdf8');
      this.handles.push({ id: 'clipX', x: clipPx, y: clipPy, onDrag: (mx) => this.setSlider('clipX', this.fromScreenX(mx)) });
    } else if (tr.mode === 'rational-power') {
      const opObj = tr.ops.find((o) => o.id === this.st.op) || tr.ops[0];
      this.plotCurve((x) => (x < 0 ? NaN : Math.pow(x, opObj.exp)), 0, v.xMax, '#38bdf8', 3.4);

      const stX = this.toScreenX(tr.star.x);
      const stY = this.toScreenY(tr.star.y);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(stX, stY, 10, 0, Math.PI * 2);
      ctx.stroke();
      this.drawLabel('(8, 4)', stX, stY - 18, { color: '#fde68a', fontSize: 12 });

      const rx = this.toScreenX(this.st.rootAns);
      const ry = this.toScreenY(0.2);
      this.drawHandle('rootAns', rx, ry, `x_0=${this.st.rootAns.toFixed(1)}`, '#4ade80');
      this.handles.push({ id: 'rootAns', x: rx, y: ry, onDrag: (mx) => this.setSlider('rootAns', this.fromScreenX(mx)) });
    }

    this.drawRiderGlider();

    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

const boot = () => new ContinuityRiderGame();
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
