/**
 * Math Battle: Calculus Showdown [PlayStation Edition]
 * Full-Viewport Responsive Master Game Loop & Battle Coordinator
 */

import {
  ARENA,
  MATCH_CONFIGS,
  PLAYER_CONFIG,
  BASE_BALL_SPEED,
  toScreenX,
  toScreenY
} from './config.js';
import { audio } from './audio.js';
import { CalculusEngine } from './calculus.js';
import { ControlsManager } from './controls.js';
import { createPlayer, ObjectPools } from './entities.js';
import { GameRenderer } from './renderer.js';

export class MathBattleGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    this.viewport = document.getElementById('viewport');

    this.pools = new ObjectPools();
    this.controls = new ControlsManager(this.canvas);
    this.renderer = new GameRenderer(this.canvas, this.ctx);

    this.currentMatch = 'x3';
    this.isPlayerControlled = true;
    this.simSpeed = 1.0;

    this.gameState = 'COUNTDOWN'; // COUNTDOWN | PLAYING | PAUSED | VICTORY | GAMEOVER
    this.prePauseState = 'PLAYING';
    this.countdownTimer = 2.3;
    this.countdownStepPlayed = { 3: false, 2: false, 1: false, fight: false };
    this.frenzyMultiplier = 1.0;

    this.player = createPlayer();
    this.balls = [];
    this.nextBallId = 1;
    this.totalInitialHits = 16;
    this.remainingHits = 16;

    this.summonState = 'IDLE';
    this.summonTimer = 5.0;
    this.summonCurves = [];

    this.screenShake = 0;
    this.slowMoTimer = 0;
    this.slowMoCooldown = 0;

    this.overlayButtons = [];
    this.overlayFocusIndex = 0;
    this._runRecorded = false;
    this._damageHitsTaken = 0;
    this._defeatedBosses = new Set();
    this._lastProgressRes = null;
    this.lastTime = performance.now();

    this.initViewportSizer();
    this.initDOM();
    this.resetMatch(this.currentMatch);
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initViewportSizer() {
    const fitCanvas = () => {
      if (!this.viewport || !this.canvas) return;
      const w = this.viewport.clientWidth;
      const h = this.viewport.clientHeight;
      const size = Math.max(240, Math.floor(Math.min(w, h) - 8));
      this.canvas.style.width = `${size}px`;
      this.canvas.style.height = `${size}px`;
    };
    fitCanvas();
    if (typeof ResizeObserver !== 'undefined' && this.viewport) {
      new ResizeObserver(fitCanvas).observe(this.viewport);
    }
    window.addEventListener('resize', fitCanvas);
  }

  initDOM() {
    document.querySelectorAll('.roster-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const matchId = btn.getAttribute('data-match');
        if (matchId && MATCH_CONFIGS[matchId]) {
          this.switchMatch(matchId);
        }
      });
    });

    const pilotPlayer = document.getElementById('pilotPlayer');
    const pilotAuto = document.getElementById('pilotAuto');
    pilotPlayer?.addEventListener('click', () => this.setPilotMode(true));
    pilotAuto?.addEventListener('click', () => this.setPilotMode(false));

    document.getElementById('btnStart')?.addEventListener('click', () => this.togglePause());
    document.getElementById('btnRestart')?.addEventListener('click', () => {
      audio.init();
      this.resetMatch(this.currentMatch);
    });

    const btnAudio = document.getElementById('btnAudio');
    btnAudio?.addEventListener('click', () => {
      const enabled = audio.toggle();
      btnAudio.textContent = enabled ? '🔊 الصوت: مفعل' : '🔇 الصوت: مكتوم';
    });

    document.querySelectorAll('.btn-speed').forEach(btn => {
      btn.addEventListener('click', () => {
        const spd = parseFloat(btn.getAttribute('data-speed')) || 1.0;
        this.setSimSpeed(spd);
      });
    });

    // Clickable Deck Controls (for mouse/accessibility)
    document.getElementById('deckDashBtn')?.addEventListener('click', () => {
      if (this.gameState === 'PLAYING') this.triggerDash();
    });
    document.getElementById('deckBeamBtn')?.addEventListener('click', () => {
      if (this.gameState === 'PLAYING') this.triggerBeam();
    });
    document.getElementById('deckBombBtn')?.addEventListener('click', () => {
      if (this.gameState === 'PLAYING') this.triggerBomb();
    });
    document.getElementById('deckSlowBtn')?.addEventListener('click', () => {
      if (this.gameState === 'PLAYING') this.triggerSlowMo();
    });

    // Overlay Action Buttons
    document.getElementById('ovBtnPrimary')?.addEventListener('click', () => this.handleOverlayPrimary());
    document.getElementById('ovBtnSecondary')?.addEventListener('click', () => this.handleOverlaySecondary());
    document.getElementById('ovBtnHub')?.addEventListener('click', () => this.exitToHub());
  }

  setPilotMode(isPlayer) {
    this.isPlayerControlled = isPlayer;
    document.getElementById('pilotPlayer')?.classList.toggle('active', isPlayer);
    document.getElementById('pilotAuto')?.classList.toggle('active', !isPlayer);
    const labelEl = document.getElementById('pilotLabelText');
    if (labelEl) labelEl.textContent = isPlayer ? 'الطيار (أنت)' : 'طيار آلي ذكي';
  }

  setSimSpeed(spd) {
    this.simSpeed = spd;
    document.querySelectorAll('.btn-speed').forEach(b => {
      b.classList.toggle('active', parseFloat(b.getAttribute('data-speed')) === spd);
    });
  }

  togglePause() {
    if (this.gameState === 'VICTORY' || this.gameState === 'GAMEOVER') return;
    if (this.gameState === 'PAUSED') {
      this.gameState = this.prePauseState || 'PLAYING';
      this.hideOverlay();
    } else {
      this.prePauseState = this.gameState;
      this.gameState = 'PAUSED';
      this.showOverlay('PAUSED');
    }
    this.updatePauseButtonUI();
  }

  updatePauseButtonUI() {
    const btnStart = document.getElementById('btnStart');
    if (!btnStart) return;
    const isPaused = this.gameState === 'PAUSED';
    btnStart.textContent = isPaused ? '▶ استئناف' : '⏸ إيقاف مؤقت';
    btnStart.className = isPaused ? 'btn btn-primary' : 'btn';
  }

  switchMatch(matchId) {
    document.querySelectorAll('.roster-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-match') === matchId);
    });
    this.currentMatch = matchId;
    this.resetMatch(matchId);
  }

  cycleMatch(dir) {
    const keys = Object.keys(MATCH_CONFIGS);
    const idx = keys.indexOf(this.currentMatch);
    const nextIdx = (idx + dir + keys.length) % keys.length;
    this.switchMatch(keys[nextIdx]);
  }

  exitToHub() {
    window.location.href = '../../index.html?from=game';
  }

  resetMatch(matchType) {
    this.currentMatch = matchType;
    const config = MATCH_CONFIGS[matchType] || MATCH_CONFIGS.x3;

    this.gameState = 'COUNTDOWN';
    this.countdownTimer = 2.3;
    this.countdownStepPlayed = { 3: false, 2: false, 1: false, fight: false };
    this.frenzyMultiplier = 1.0;

    this.player = createPlayer();
    this.pools.reset();
    this.balls = [];
    this.nextBallId = 1;
    this.summonCurves = [];
    this.summonState = 'IDLE';
    this.summonTimer = config.summonInterval;
    this.screenShake = 0;
    this.slowMoTimer = 0;
    this.slowMoCooldown = 0;
    this._runRecorded = false;
    this._damageHitsTaken = 0;
    this._lastProgressRes = null;
    this.hideOverlay();
    this.updatePauseButtonUI();

    this.totalInitialHits = config.initialHits;
    this.remainingHits = config.initialHits;

    const initialSpeed = BASE_BALL_SPEED;
    const bAng = Math.random() * Math.PI * 2;

    if (matchType === 'x3') {
      this.balls.push({
        id: this.nextBallId++,
        type: 'x3',
        label: 'x³',
        power: 3,
        x: 0,
        y: 2.2,
        vx: Math.cos(bAng) * initialSpeed,
        vy: Math.sin(bAng) * initialSpeed,
        radius: 36,
        color: '#ff5500',
        halo: 'rgba(255, 85, 0, 0.25)',
        grace: 0
      });
    } else if (matchType === 'x4') {
      this.balls.push({
        id: this.nextBallId++,
        type: 'x4',
        label: 'x⁴',
        power: 4,
        x: 0,
        y: 2.2,
        vx: Math.cos(bAng) * initialSpeed,
        vy: Math.sin(bAng) * initialSpeed,
        radius: 38,
        color: '#c026d3',
        halo: 'rgba(192, 38, 211, 0.25)',
        grace: 0
      });
    } else if (matchType === 'sin') {
      const spawns = [
        { x: -2.4, y: 2.2, a: 0.6 },
        { x: 2.4, y: 2.2, a: 2.5 },
        { x: -2.4, y: -1.0, a: -0.7 },
        { x: 2.4, y: -1.0, a: -2.4 }
      ];
      spawns.forEach(s => {
        this.balls.push({
          id: this.nextBallId++,
          type: 'sin',
          label: 'sin(x)',
          power: 3,
          x: s.x,
          y: s.y,
          vx: Math.cos(s.a) * initialSpeed,
          vy: Math.sin(s.a) * initialSpeed,
          radius: 28,
          color: '#10b981',
          halo: 'rgba(16, 185, 129, 0.25)',
          grace: 0
        });
      });
    } else if (matchType === 'exp') {
      this.balls.push({
        id: this.nextBallId++,
        type: 'exp',
        label: 'eˣ',
        power: 5,
        x: 0,
        y: 2.0,
        vx: Math.cos(bAng) * (initialSpeed * 1.12),
        vy: Math.sin(bAng) * (initialSpeed * 1.12),
        radius: 35,
        color: '#ffd700',
        halo: 'rgba(255, 215, 0, 0.25)',
        grace: 0
      });
    }

    this.syncHUD();
  }

  triggerDash() {
    if (this.player.dashCharges <= 0) return;
    this.player.dashCharges--;
    this.player.isDashing = true;
    this.player.dashTimer = PLAYER_CONFIG.dashDuration;
    this.player.invulnerableTimer = PLAYER_CONFIG.dashInvulnerableDuration;

    let ang = this.player.facingAng;
    if (Math.hypot(this.player.vx, this.player.vy) > 0.2) {
      ang = Math.atan2(this.player.vy, this.player.vx);
    }
    this.player.vx = Math.cos(ang) * PLAYER_CONFIG.dashSpeed;
    this.player.vy = Math.sin(ang) * PLAYER_CONFIG.dashSpeed;

    audio.play('dash', this.player.x / 5.0);
    audio.triggerRumble(0.25, 0.55, 120);

    for (let i = 0; i < 14; i++) {
      this.pools.spawnParticle(toScreenX(this.player.x), toScreenY(this.player.y), '#00f0ff', 3.0);
    }
  }

  triggerBeam() {
    if (this.player.beamCooldown > 0) return;
    this.player.beamCooldown = PLAYER_CONFIG.beamCooldown;

    const spd = PLAYER_CONFIG.beamSpeed;
    const vx = Math.cos(this.player.facingAng) * spd;
    const vy = Math.sin(this.player.facingAng) * spd;
    this.pools.spawnBeam(this.player.x, this.player.y, vx, vy);

    audio.play('beam', this.player.x / 5.0);
    audio.triggerRumble(0.12, 0.25, 65);
  }

  triggerBomb() {
    if (this.player.bombEnergy < 100) return;
    this.player.bombEnergy = 0;
    this.screenShake = 20;

    audio.play('bomb', 0, 1.0);
    audio.triggerRumble(0.75, 1.0, 320);

    this.summonCurves = [];
    this.summonState = 'IDLE';
    this.summonTimer = MATCH_CONFIGS[this.currentMatch]?.summonInterval || 5.0;

    this.pools.spawnShockwave(toScreenX(this.player.x), toScreenY(this.player.y), 320, '#ff0055');
    this.pools.spawnShockwave(toScreenX(this.player.x), toScreenY(this.player.y), 240, '#00f0ff');
    this.pools.spawnPopup('💥 انفجار لايبنتز الفائق!', toScreenX(this.player.x), toScreenY(this.player.y) - 36, '#ffd700');

    const targets = [...this.balls];
    targets.forEach(b => {
      const d = Math.hypot(b.x - this.player.x, b.y - this.player.y);
      if (d <= 5.5) {
        this.strikeAndDifferentiate(b, true);
      }
    });
  }

  triggerSlowMo() {
    if (this.slowMoCooldown > 0 || this.slowMoTimer > 0) return;
    this.slowMoTimer = PLAYER_CONFIG.slowMoDuration;
    this.slowMoCooldown = PLAYER_CONFIG.slowMoCooldown;
    audio.play('dash', 0, 0.55);
    this.pools.spawnPopup('⏱ تبطيء أويلر الزمني', toScreenX(this.player.x), toScreenY(this.player.y) - 30, '#00ff88');
  }

  strikeAndDifferentiate(ball, ignoreGrace = false) {
    if (!this.balls.some(b => b.id === ball.id)) return;
    if (!ignoreGrace && ball.grace > 0) return;

    this.player.differentiations++;
    this.remainingHits = Math.max(0, this.remainingHits - 1);
    this.player.hitCooldown = 0.12;
    window.ArcadeCore?.Progress?.recordAnswer('math-battle', this.currentMatch, true);

    if (this.player.hp < this.player.maxHp) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 3);
      this.pools.spawnPopup('+3 درع', toScreenX(this.player.x), toScreenY(this.player.y) - 20, '#10b981');
      audio.play('heal', this.player.x / 5.0);
    }

    if (this.player.bombEnergy < 100) {
      this.player.bombEnergy = Math.min(100, this.player.bombEnergy + PLAYER_CONFIG.bombEnergyPerHit);
    }

    this.player.combos++;
    this.player.comboTimer = 2.4;
    const pitchMod = Math.min(2.3, 1.0 + this.player.combos * 0.08) * this.frenzyMultiplier;
    const panX = ball.x / 5.0;

    audio.triggerRumble(0.25, 0.55, 110);
    this.pools.spawnShockwave(toScreenX(ball.x), toScreenY(ball.y), 68, ball.color);

    this.balls = this.balls.filter(b => b.id !== ball.id);
    const curSpeed = BASE_BALL_SPEED * this.frenzyMultiplier;
    const bMathR = (ball.radius / ARENA.width) * (ARENA.xMax - ARENA.xMin);

    const result = CalculusEngine.differentiate(ball, curSpeed, bMathR);
    this.pools.spawnPopup(result.popup.text, toScreenX(ball.x), toScreenY(ball.y), result.popup.color);

    if (result.isAnnihilated) {
      audio.play('pop_zero', panX, pitchMod);
      for (let k = 0; k < 20; k++) {
        this.pools.spawnParticle(toScreenX(ball.x), toScreenY(ball.y), '#10b981', 3.5, 42);
      }
    } else {
      audio.play('diff_strike', panX, pitchMod);
      result.newBalls.forEach(nb => {
        nb.id = this.nextBallId++;
        this.balls.push(nb);
      });
    }

    if (this.remainingHits <= 0 || this.balls.length === 0) {
      this.remainingHits = 0;
      this.gameState = 'VICTORY';
      this._finishBattleRun(true);
      audio.play('victory');
      audio.triggerRumble(0.6, 1.0, 420);
      for (let k = 0; k < 55; k++) {
        this.pools.spawnParticle(
          ARENA.x + Math.random() * ARENA.width,
          ARENA.y + Math.random() * ARENA.height,
          '#00f0ff',
          4,
          70
        );
      }
      this.showOverlay('VICTORY');
    }
  }

  _finishBattleRun(victory) {
    if (this._runRecorded) return;
    this._runRecorded = true;
    if (victory) {
      this._defeatedBosses.add(this.currentMatch);
    }
    const prevSeals = Number(window.ArcadeCore?.Progress?.getGameProgress?.('math-battle')?.sealsCleared || 0);
    const sealsCleared = Math.min(4, Math.max(prevSeals, this._defeatedBosses.size));
    const score = victory
      ? Math.round(this.player.differentiations * 120 + this.player.combos * 45 + Math.max(0, this.player.hp) * 5)
      : Math.round(this.player.differentiations * 85 + this.player.combos * 25);
    const totalAns = this.player.differentiations + this._damageHitsTaken;
    this._lastProgressRes = window.ArcadeCore?.Progress?.recordRun('math-battle', {
      score,
      sealsCleared,
      victory: Boolean(victory),
      runQuestionsAnswered: totalAns,
      runQuestionsCorrect: this.player.differentiations,
      bypasses: 0,
      answersAlreadyRecorded: true
    }) || null;
  }

  _triggerBattleDefeat() {
    if (this.gameState === 'GAMEOVER') return;
    this.gameState = 'GAMEOVER';
    this._finishBattleRun(false);
    audio.play('gameover');
    audio.triggerRumble(0.8, 1.0, 450);
    this.showOverlay('GAMEOVER');
  }

  showOverlay(mode) {
    const overlay = document.getElementById('battleOverlay');
    const titleEl = document.getElementById('ovTitle');
    const subEl = document.getElementById('ovSubtitle');
    const primaryEl = document.getElementById('ovBtnPrimary');
    const secEl = document.getElementById('ovBtnSecondary');
    const hubEl = document.getElementById('ovBtnHub');

    if (!overlay || !titleEl || !subEl || !primaryEl || !secEl || !hubEl) return;

    const setBidi = (el, txt) => {
      if (window.ArcadeCore?.setBidiSafeMath) window.ArcadeCore.setBidiSafeMath(el, txt);
      else el.textContent = txt;
    };

    const res = this._lastProgressRes;
    const rankSuffix = res
      ? ` • الرتبة: ${res.rank}${res.isNewBest && res.entry?.bestScore > 0 ? ' • 🏆 رقم قياسي جديد!' : ''}`
      : '';

    if (mode === 'PAUSED') {
      titleEl.textContent = 'إيقاف مؤقت للمعركة';
      titleEl.style.color = '#00f0ff';
      setBidi(subEl, `${MATCH_CONFIGS[this.currentMatch]?.title || ''} • تبقّى ${this.remainingHits} ضربة اشتقاق`);
      primaryEl.innerHTML = '<span class="gp-tag gp-x">✕</span> استئناف المعركة';
      secEl.innerHTML = '<span class="gp-tag gp-sq">▢</span> إعادة النزال';
    } else if (mode === 'VICTORY') {
      titleEl.textContent = 'انتصار التفاضل!';
      titleEl.style.color = '#10b981';
      setBidi(subEl, `تم تلاشي الدالة إلى 0 بعد ${this.player.differentiations} ضربة d/dx!` + rankSuffix);
      primaryEl.innerHTML = '<span class="gp-tag gp-x">✕</span> العب مجدداً';
      secEl.innerHTML = '<span class="gp-tag gp-sq">▢</span> المنافس التالي [R1]';
    } else if (mode === 'GAMEOVER') {
      titleEl.textContent = 'نقطة شذوذ حرجة!';
      titleEl.style.color = '#ff007f';
      setBidi(subEl, `نفد الدرع وبقي ${this.remainingHits} اشتقاق قبل الصفر.` + rankSuffix);
      primaryEl.innerHTML = '<span class="gp-tag gp-x">✕</span> أعد الاشتقاق الآن';
      secEl.innerHTML = '<span class="gp-tag gp-sq">▢</span> المنافس التالي [R1]';
    }

    this.overlayButtons = [primaryEl, secEl, hubEl];
    this.overlayFocusIndex = 0;
    this.syncOverlayFocus();
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
  }

  hideOverlay() {
    const overlay = document.getElementById('battleOverlay');
    overlay?.classList.remove('active');
    overlay?.setAttribute('aria-hidden', 'true');
  }

  syncOverlayFocus() {
    this.overlayButtons.forEach((btn, i) => {
      btn.classList.toggle('gp-focused', i === this.overlayFocusIndex);
    });
  }

  handleOverlayPrimary() {
    if (this.gameState === 'PAUSED') {
      this.togglePause();
    } else {
      this.resetMatch(this.currentMatch);
    }
  }

  handleOverlaySecondary() {
    if (this.gameState === 'PAUSED') {
      this.resetMatch(this.currentMatch);
    } else {
      this.cycleMatch(1);
    }
  }

  processGlobalAndMenuInputs() {
    const p = this.player;
    this.controls.poll(p.x, p.y);

    // Live Deck Highlighting
    document.getElementById('deckDashBtn')?.classList.toggle('pressed', this.controls.heldButtons.cross);
    document.getElementById('deckBeamBtn')?.classList.toggle('pressed', this.controls.heldButtons.square || this.controls.heldButtons.r2);
    document.getElementById('deckBombBtn')?.classList.toggle('pressed', this.controls.heldButtons.circle);
    document.getElementById('deckSlowBtn')?.classList.toggle('pressed', this.controls.heldButtons.triangle);

    if (this.controls.consumeAction('togglePilot')) {
      this.setPilotMode(!this.isPlayerControlled);
    }

    if (this.controls.consumeAction('cycleLeft')) {
      this.cycleMatch(-1);
      return;
    }
    if (this.controls.consumeAction('cycleRight')) {
      this.cycleMatch(1);
      return;
    }

    if (this.controls.consumeAction('pauseToggle')) {
      this.togglePause();
      return;
    }

    // Menu states: PAUSED, VICTORY, GAMEOVER
    if (this.gameState === 'PAUSED' || this.gameState === 'VICTORY' || this.gameState === 'GAMEOVER') {
      if (this.controls.consumeAction('dpadUp') || this.controls.consumeAction('dpadLeft')) {
        this.overlayFocusIndex = (this.overlayFocusIndex - 1 + this.overlayButtons.length) % this.overlayButtons.length;
        this.syncOverlayFocus();
      }
      if (this.controls.consumeAction('dpadDown') || this.controls.consumeAction('dpadRight')) {
        this.overlayFocusIndex = (this.overlayFocusIndex + 1) % this.overlayButtons.length;
        this.syncOverlayFocus();
      }
      if (this.controls.consumeAction('menuConfirm')) {
        const focusedBtn = this.overlayButtons[this.overlayFocusIndex];
        if (focusedBtn) focusedBtn.click();
        else this.handleOverlayPrimary();
      } else if (this.controls.consumeAction('menuAlt')) {
        this.handleOverlaySecondary();
      } else if (this.controls.consumeAction('menuBack')) {
        if (this.gameState === 'PAUSED') {
          this.togglePause();
        } else {
          this.exitToHub();
        }
      }
      this.controls.clearGameplayActions();
      return;
    }

    // Countdown skip with ✕ or Space
    if (this.gameState === 'COUNTDOWN') {
      if (this.controls.consumeAction('menuConfirm') || this.controls.consumeAction('dash')) {
        this.countdownTimer = 0;
        this.gameState = 'PLAYING';
      }
      this.controls.clearGameplayActions();
    }
  }

  updateCountdown(dt) {
    this.countdownTimer -= dt;
    if (this.countdownTimer > 1.7 && !this.countdownStepPlayed[3]) {
      this.countdownStepPlayed[3] = true; audio.play('countdown', 0, 440);
    } else if (this.countdownTimer > 1.0 && this.countdownTimer <= 1.7 && !this.countdownStepPlayed[2]) {
      this.countdownStepPlayed[2] = true; audio.play('countdown', 0, 440);
    } else if (this.countdownTimer > 0.35 && this.countdownTimer <= 1.0 && !this.countdownStepPlayed[1]) {
      this.countdownStepPlayed[1] = true; audio.play('countdown', 0, 440);
    } else if (this.countdownTimer <= 0.35 && !this.countdownStepPlayed.fight) {
      this.countdownStepPlayed.fight = true; audio.play('countdown', 0, 880);
    }

    if (this.countdownTimer <= 0) {
      this.gameState = 'PLAYING';
    }
  }

  updatePlayerPhysics(dt) {
    const p = this.player;

    if (p.hitCooldown > 0) p.hitCooldown -= dt;
    if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;
    if (p.beamCooldown > 0) p.beamCooldown -= dt;

    if (p.comboTimer > 0) {
      p.comboTimer -= dt;
      if (p.comboTimer <= 0) p.combos = 0;
    }

    if (p.dashCharges < p.maxDashCharges) {
      p.dashRechargeTimer += dt;
      if (p.dashRechargeTimer >= PLAYER_CONFIG.dashRechargeTime) {
        p.dashCharges++;
        p.dashRechargeTimer = 0;
      }
    }

    if (p.isDashing) {
      p.dashTimer -= dt;
      if (p.dashTimer <= 0) p.isDashing = false;
    }

    if (this.isPlayerControlled) {
      p.facingAng = this.controls.facingAng;

      if (this.controls.consumeAction('dash')) this.triggerDash();
      if (this.controls.consumeAction('beam')) this.triggerBeam();
      if (this.controls.consumeAction('bomb')) this.triggerBomb();
      if (this.controls.consumeAction('slowMo')) this.triggerSlowMo();

      if (!p.isDashing) {
        const accel = this.controls.isBraking ? 2.0 : 9.0;
        const speedMult = this.controls.isBraking ? 0.55 : 1.0;
        const targetVx = this.controls.moveX * PLAYER_CONFIG.baseSpeed * speedMult;
        const targetVy = this.controls.moveY * PLAYER_CONFIG.baseSpeed * speedMult;
        p.vx += (targetVx - p.vx) * Math.min(1.0, accel * dt);
        p.vy += (targetVy - p.vy) * Math.min(1.0, accel * dt);
      }
    } else {
      this.controls.clearGameplayActions();
      this.updateAutoPilotAI(dt);
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    const pMathR = (p.radius / ARENA.width) * (ARENA.xMax - ARENA.xMin);
    if (p.x - pMathR < ARENA.xMin) { p.x = ARENA.xMin + pMathR; p.vx = 0; }
    if (p.x + pMathR > ARENA.xMax) { p.x = ARENA.xMax - pMathR; p.vx = 0; }
    if (p.y - pMathR < ARENA.yMin) { p.y = ARENA.yMin + pMathR; p.vy = 0; }
    if (p.y + pMathR > ARENA.yMax) { p.y = ARENA.yMax - pMathR; p.vy = 0; }

    p.trail.unshift({ x: toScreenX(p.x), y: toScreenY(p.y) });
    if (p.trail.length > 14) p.trail.pop();
  }

  updateAutoPilotAI(dt) {
    const p = this.player;
    if (this.balls.length === 0) return;

    let nearest = this.balls[0];
    let minDist = Infinity;
    this.balls.forEach(b => {
      const d = Math.hypot(b.x - p.x, b.y - p.y);
      if (d < minDist) { minDist = d; nearest = b; }
    });

    const ang = Math.atan2(nearest.y - p.y, nearest.x - p.x);
    p.facingAng = ang;

    const spd = PLAYER_CONFIG.baseSpeed * 0.92;
    p.vx += (Math.cos(ang) * spd - p.vx) * Math.min(1.0, 7.0 * dt);
    p.vy += (Math.sin(ang) * spd - p.vy) * Math.min(1.0, 7.0 * dt);

    if (minDist < 4.5 && p.beamCooldown <= 0) this.triggerBeam();
    if (minDist < 1.9 && p.dashCharges > 0 && !p.isDashing) this.triggerDash();
    if (this.balls.length >= 5 && p.bombEnergy >= 100) this.triggerBomb();
  }

  updateBallPhysics(dt) {
    const curSpeed = BASE_BALL_SPEED * this.frenzyMultiplier;

    this.balls.forEach(b => {
      if (b.grace > 0) b.grace = Math.max(0, b.grace - dt);
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      this.resolveWallBounce(b, curSpeed);
    });

    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        this.resolveBallBallCollision(this.balls[i], this.balls[j], curSpeed);
      }
    }
  }

  resolveWallBounce(b, targetSpeed) {
    let bounced = false;
    const rMath = (b.radius / ARENA.width) * (ARENA.xMax - ARENA.xMin);

    if (b.x - rMath < ARENA.xMin) {
      b.x = ARENA.xMin + rMath; b.vx = Math.abs(b.vx); bounced = true;
    } else if (b.x + rMath > ARENA.xMax) {
      b.x = ARENA.xMax - rMath; b.vx = -Math.abs(b.vx); bounced = true;
    }
    if (b.y - rMath < ARENA.yMin) {
      b.y = ARENA.yMin + rMath; b.vy = Math.abs(b.vy); bounced = true;
    } else if (b.y + rMath > ARENA.yMax) {
      b.y = ARENA.yMax - rMath; b.vy = -Math.abs(b.vy); bounced = true;
    }

    if (bounced) {
      this.enforceSpeed(b, targetSpeed);
      audio.play('wall_hit', b.x / 5.0, this.frenzyMultiplier);
    }
  }

  resolveBallBallCollision(b1, b2, targetSpeed) {
    const x1 = toScreenX(b1.x), y1 = toScreenY(b1.y);
    const x2 = toScreenX(b2.x), y2 = toScreenY(b2.y);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const minDist = b1.radius + b2.radius;

    if (dist < minDist && dist > 0.0001) {
      const overlap = minDist - dist;
      const nx = dx / dist;
      const ny = dy / dist;
      const overlapMath = (overlap / ARENA.width) * (ARENA.xMax - ARENA.xMin);

      b1.x -= nx * (overlapMath * 0.5);
      b1.y += ny * (overlapMath * 0.5);
      b2.x += nx * (overlapMath * 0.5);
      b2.y -= ny * (overlapMath * 0.5);

      const mdx = b2.x - b1.x;
      const mdy = b2.y - b1.y;
      const mdist = Math.hypot(mdx, mdy) || 1;
      const mnx = mdx / mdist;
      const mny = mdy / mdist;

      const kx = b1.vx - b2.vx;
      const ky = b1.vy - b2.vy;
      const p = (mnx * kx + mny * ky);

      b1.vx -= p * mnx; b1.vy -= p * mny;
      b2.vx += p * mnx; b2.vy += p * mny;

      this.enforceSpeed(b1, targetSpeed);
      this.enforceSpeed(b2, targetSpeed);
      audio.play('ball_clack', (b1.x + b2.x) / 10.0, this.frenzyMultiplier);
    }
  }

  enforceSpeed(b, targetSpeed) {
    const spd = Math.hypot(b.vx, b.vy);
    if (spd > 0.0001) {
      b.vx = (b.vx / spd) * targetSpeed;
      b.vy = (b.vy / spd) * targetSpeed;
    } else {
      const ang = Math.random() * Math.PI * 2;
      b.vx = Math.cos(ang) * targetSpeed;
      b.vy = Math.sin(ang) * targetSpeed;
    }
  }

  updateCollisions() {
    const p = this.player;
    const px = toScreenX(p.x);
    const py = toScreenY(p.y);

    // 1. Player vs Balls
    for (const b of [...this.balls]) {
      const bx = toScreenX(b.x);
      const by = toScreenY(b.y);
      const dist = Math.hypot(bx - px, by - py);

      if (dist < p.radius + b.radius) {
        if (p.isDashing) {
          this.strikeAndDifferentiate(b);
        } else if (p.invulnerableTimer <= 0 && b.grace <= 0) {
          p.hp = Math.max(0, p.hp - 12);
          p.invulnerableTimer = 0.55;
          this.screenShake = 12;
          this._damageHitsTaken++;
          window.ArcadeCore?.Progress?.recordAnswer('math-battle', this.currentMatch, false);
          this.pools.spawnPopup('-12 درع', px, py - 20, '#ff0055', true);
          audio.triggerRumble(0.4, 0.7, 170);

          if (p.hp <= 0) {
            this._triggerBattleDefeat();
            break;
          }
        }
      }
    }

    // 2. Beams vs Balls
    this.pools.beams.forEach(bm => {
      if (!bm.active) return;
      const bmx = toScreenX(bm.x);
      const bmy = toScreenY(bm.y);

      for (const b of this.balls) {
        if (b.grace > 0) continue;
        const bx = toScreenX(b.x);
        const by = toScreenY(b.y);
        if (Math.hypot(bx - bmx, by - bmy) < b.radius + 8) {
          bm.active = false;
          this.strikeAndDifferentiate(b);
          break;
        }
      }
    });
  }

  updateLasers(dt) {
    const interval = MATCH_CONFIGS[this.currentMatch]?.summonInterval || 5.0;
    this.summonTimer -= dt;

    if (this.summonTimer <= 0) {
      if (this.summonState === 'IDLE') {
        this.summonState = 'WARNING';
        this.summonTimer = 1.6;
        if (this.currentMatch === 'sin') {
          this.summonCurves = [
            { type: 'sine', a: 1.6, w: 1.3, x0: (Math.random() - 0.5) * 2, y0: (Math.random() - 0.5) * 1.5, color: '#10b981' },
            { type: 'line', m: (Math.random() - 0.5) * 1.4, x0: 0, y0: (Math.random() - 0.5) * 2.5, color: '#ff5500' }
          ];
        } else {
          this.summonCurves = [
            { type: 'line', m: (Math.random() - 0.5) * 1.8, x0: 0, y0: (Math.random() - 0.5) * 3, color: '#ff5500' },
            { type: 'parabola', a: (Math.random() > 0.5 ? 0.28 : -0.28), x0: (Math.random() - 0.5) * 2, y0: (Math.random() - 0.5) * 2, color: '#ff5500' }
          ];
        }
      } else if (this.summonState === 'WARNING') {
        this.summonState = 'LASER';
        this.summonTimer = 0.95;
        this.screenShake = 8;
        audio.triggerRumble(0.3, 0.55, 180);
      } else if (this.summonState === 'LASER') {
        this.summonState = 'IDLE';
        this.summonCurves = [];
        this.summonTimer = interval;
      }
    }

    if (this.summonState === 'LASER' && this.player.invulnerableTimer <= 0 && !this.player.isDashing) {
      for (const c of this.summonCurves) {
        let hit = false;
        if (c.type === 'line') {
          const expectedY = c.m * (this.player.x - c.x0) + c.y0;
          if (Math.abs(this.player.y - expectedY) < 0.32) hit = true;
        } else if (c.type === 'parabola') {
          const expectedY = c.a * Math.pow(this.player.x - c.x0, 2) + c.y0;
          if (Math.abs(this.player.y - expectedY) < 0.4) hit = true;
        } else if (c.type === 'sine') {
          const expectedY = c.a * Math.sin(c.w * (this.player.x - c.x0)) + c.y0;
          if (Math.abs(this.player.y - expectedY) < 0.36) hit = true;
        }

        if (hit) {
          this.player.hp = Math.max(0, this.player.hp - 15);
          this.player.invulnerableTimer = 0.6;
          this.screenShake = 14;
          this._damageHitsTaken++;
          window.ArcadeCore?.Progress?.recordAnswer('math-battle', this.currentMatch, false);
          this.pools.spawnPopup('-15 ليزر', toScreenX(this.player.x), toScreenY(this.player.y) - 25, '#ff0055', true);
          if (this.player.hp <= 0) {
            this._triggerBattleDefeat();
          }
          break;
        }
      }
    }
  }

  syncHUD() {
    const p = this.player;
    const config = MATCH_CONFIGS[this.currentMatch] || MATCH_CONFIGS.x3;

    // HP Bar
    const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
    const hpFill = document.getElementById('hudHpFill');
    const hpVal = document.getElementById('hudHpVal');
    if (hpFill) hpFill.style.width = `${hpPct}%`;
    if (hpVal) hpVal.textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;

    // Dash Charges (DOM-cached)
    if (this._lastDashCharges !== p.dashCharges) {
      this._lastDashCharges = p.dashCharges;
      const dashPips = document.getElementById('hudDashPips');
      if (dashPips) {
        let html = '';
        for (let i = 0; i < p.maxDashCharges; i++) {
          html += `<span class="dash-pip ${i < p.dashCharges ? 'ready' : ''}">⚡</span>`;
        }
        dashPips.innerHTML = html;
      }
    }

    // Bomb Energy
    const bombPct = Math.min(100, Math.floor(p.bombEnergy));
    if (this._lastBombPct !== bombPct) {
      this._lastBombPct = bombPct;
      const bombFill = document.getElementById('hudBombFill');
      const bombVal = document.getElementById('hudBombVal');
      if (bombFill) bombFill.style.width = `${bombPct}%`;
      if (bombVal) {
        bombVal.textContent = bombPct >= 100 ? 'جاهز [◯]' : `${bombPct}%`;
        bombVal.style.color = bombPct >= 100 ? '#ffd700' : '#ff3b7f';
      }
    }

    // Slow-Mo
    const slowKey = this.slowMoTimer > 0 ? `A:${this.slowMoTimer.toFixed(1)}` : this.slowMoCooldown > 0 ? `C:${this.slowMoCooldown.toFixed(1)}` : 'R';
    if (this._lastSlowKey !== slowKey) {
      this._lastSlowKey = slowKey;
      const slowVal = document.getElementById('hudSlowVal');
      if (slowVal) {
        if (this.slowMoTimer > 0) {
          slowVal.textContent = `نشط ${this.slowMoTimer.toFixed(1)}ث`;
          slowVal.style.color = '#00ff88';
        } else if (this.slowMoCooldown > 0) {
          slowVal.textContent = `انتظار ${this.slowMoCooldown.toFixed(1)}ث`;
          slowVal.style.color = '#64748b';
        } else {
          slowVal.textContent = 'جاهز [△]';
          slowVal.style.color = '#00ff88';
        }
      }
    }

    // Combos & Strikes
    const comboStr = p.combos > 1 ? `سلسلة x${p.combos}` : `${p.differentiations} اشتقاق`;
    if (this._lastComboStr !== comboStr) {
      this._lastComboStr = comboStr;
      const comboEl = document.getElementById('hudComboVal');
      if (comboEl) comboEl.textContent = comboStr;
    }

    // Boss & Derivation Bar
    if (this._lastBossKey !== config.id) {
      this._lastBossKey = config.id;
      const bossBadge = document.getElementById('hudBossBadge');
      const bossTitle = document.getElementById('hudBossTitle');
      if (bossBadge) {
        const badgeTxt = config.chain[0]?.label || config.id;
        if (window.ArcadeCore?.renderMath) window.ArcadeCore.renderMath(bossBadge, `$${badgeTxt}$`);
        else bossBadge.textContent = badgeTxt;
        bossBadge.style.borderColor = config.color;
        bossBadge.style.color = config.color;
      }
      if (bossTitle) {
        if (window.ArcadeCore?.setBidiSafeMath) window.ArcadeCore.setBidiSafeMath(bossTitle, config.title);
        else bossTitle.textContent = config.title;
      }
    }

    const remPct = Math.max(0, (this.remainingHits / Math.max(1, this.totalInitialHits)) * 100);
    const derivKey = `${this.remainingHits}/${this.totalInitialHits}`;
    if (this._lastDerivKey !== derivKey) {
      this._lastDerivKey = derivKey;
      const derivFill = document.getElementById('hudDerivFill');
      const derivVal = document.getElementById('hudDerivVal');
      const mDeriv = document.getElementById('mobileDerivVal');
      if (derivFill) derivFill.style.width = `${remPct}%`;
      if (derivVal) derivVal.textContent = `${this.remainingHits} / ${this.totalInitialHits}`;
      if (mDeriv) mDeriv.textContent = `المتبقي ${this.remainingHits}/${this.totalInitialHits}`;
    }

    if (this._lastOrbsCount !== this.balls.length) {
      this._lastOrbsCount = this.balls.length;
      const orbsEl = document.getElementById('hudOrbsCount');
      if (orbsEl) orbsEl.textContent = `${this.balls.length}`;
    }

    if (this._lastSummonState !== this.summonState) {
      this._lastSummonState = this.summonState;
      const hazardEl = document.getElementById('hudHazardState');
      if (hazardEl) {
        if (this.summonState === 'WARNING') {
          hazardEl.textContent = '⚠ تحذير ليزر';
          hazardEl.style.color = '#f59e0b';
        } else if (this.summonState === 'LASER') {
          hazardEl.textContent = '⚡ ليزر نشط';
          hazardEl.style.color = '#ff0055';
        } else {
          hazardEl.textContent = 'آمن';
          hazardEl.style.color = '#10b981';
        }
      }
    }

    // Derivation Lifecycle Ladder (DOM-cached)
    const counts = {};
    this.balls.forEach(b => {
      counts[b.type] = (counts[b.type] || 0) + 1;
    });
    const ladderKey = `${config.id}:${config.chain.map(n => `${n.id}=${counts[n.id] || 0}`).join(',')}`;
    if (this._lastLadderKey !== ladderKey) {
      this._lastLadderKey = ladderKey;
      const ladderEl = document.getElementById('hudLifecycleLadder');
      if (ladderEl) {
        ladderEl.textContent = '';
        config.chain.forEach((node, idx) => {
          if (idx > 0) {
            const arrow = document.createElement('span');
            arrow.className = 'ladder-arrow';
            arrow.textContent = '‹';
            ladderEl.appendChild(arrow);
          }
          const cnt = counts[node.id] || 0;
          const active = cnt > 0;
          const span = document.createElement('span');
          span.className = `ladder-node ${active ? 'active' : ''}`;
          span.style.setProperty('--node-col', node.color);
          const lblSpan = document.createElement('span');
          if (window.ArcadeCore?.renderMath) {
            window.ArcadeCore.renderMath(lblSpan, node.label);
          } else {
            lblSpan.textContent = node.label;
          }
          span.appendChild(lblSpan);
          if (cnt > 1) {
            span.appendChild(document.createTextNode(` (${cnt})`));
          }
          ladderEl.appendChild(span);
        });
      }
    }

    // Mobile slim header HP sync
    const ceilHp = Math.ceil(p.hp);
    if (this._lastCeilHp !== ceilHp) {
      this._lastCeilHp = ceilHp;
      const mHp = document.getElementById('mobileHpVal');
      if (mHp) mHp.textContent = `الدرع ${ceilHp}`;
    }
  }

  loop(timestamp) {
    const rawDt = Math.min(0.08, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    // Always poll gamepad & keyboard even in PAUSED / VICTORY / GAMEOVER / COUNTDOWN!
    this.processGlobalAndMenuInputs();

    if (this.gameState === 'COUNTDOWN') {
      this.updateCountdown(rawDt);
      this.pools.update(rawDt);
    } else if (this.gameState === 'PLAYING') {
      if (this.slowMoCooldown > 0) this.slowMoCooldown = Math.max(0, this.slowMoCooldown - rawDt);

      let effectiveSpeed = this.simSpeed;
      if (this.slowMoTimer > 0) {
        this.slowMoTimer = Math.max(0, this.slowMoTimer - rawDt);
        effectiveSpeed *= 0.45;
      }

      const dt = rawDt * effectiveSpeed;

      if (this.screenShake > 0) {
        this.screenShake = Math.max(0, this.screenShake - rawDt * 32);
      }

      this.updatePlayerPhysics(dt);
      this.updateBallPhysics(dt);
      this.updateCollisions();
      this.updateLasers(dt);
      this.pools.update(dt);
    }

    this.syncHUD();

    this.renderer.render(
      this.gameState,
      this.player,
      this.balls,
      this.pools,
      this.summonCurves,
      this.summonState,
      this.countdownTimer,
      this.screenShake,
      this.controls.touchJoystick,
      this.slowMoTimer
    );

    requestAnimationFrame(this.loop);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.mathBattleGame = new MathBattleGame();
});
