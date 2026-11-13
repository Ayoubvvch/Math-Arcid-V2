/**
 * Math Battle: Calculus Showdown [PlayStation Edition]
 * Master Game Loop & Battle Coordinator
 */

import {
  ARENA,
  CANVAS_SIZE,
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

    this.pools = new ObjectPools();
    this.controls = new ControlsManager(this.canvas);
    this.renderer = new GameRenderer(this.canvas, this.ctx);

    this.currentMatch = 'x3';
    this.isPlayerControlled = true;
    this.simSpeed = 1.0;
    this.isRunning = true;

    this.gameState = 'COUNTDOWN';
    this.countdownTimer = 3.6;
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

    this.lastTime = performance.now();

    this.initDOM();
    this.resetMatch(this.currentMatch);
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initDOM() {
    // Top Nav / Roster Tabs
    document.querySelectorAll('.roster-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const matchId = btn.getAttribute('data-match');
        if (matchId && MATCH_CONFIGS[matchId]) {
          this.switchMatch(matchId);
        }
      });
    });

    // Pilot Mode
    const pilotPlayer = document.getElementById('pilotPlayer');
    const pilotAuto = document.getElementById('pilotAuto');
    if (pilotPlayer && pilotAuto) {
      pilotPlayer.addEventListener('click', () => {
        this.isPlayerControlled = true;
        pilotPlayer.classList.add('active');
        pilotAuto.classList.remove('active');
      });
      pilotAuto.addEventListener('click', () => {
        this.isPlayerControlled = false;
        pilotAuto.classList.add('active');
        pilotPlayer.classList.remove('active');
      });
    }

    // Controls Deck Buttons
    const btnStart = document.getElementById('btnStart');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        this.isRunning = !this.isRunning;
        btnStart.textContent = this.isRunning ? '⏸ PAUSE BATTLE' : '▶ RESUME BATTLE';
        btnStart.className = this.isRunning ? 'btn btn-primary' : 'btn btn-action';
      });
    }

    const btnRestart = document.getElementById('btnRestart');
    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        audio.init();
        this.resetMatch(this.currentMatch);
        this.isRunning = true;
        if (btnStart) {
          btnStart.textContent = '⏸ PAUSE BATTLE';
          btnStart.className = 'btn btn-primary';
        }
      });
    }

    const btnAudio = document.getElementById('btnAudio');
    if (btnAudio) {
      btnAudio.addEventListener('click', () => {
        const enabled = audio.toggle();
        btnAudio.textContent = enabled ? '🔊 AUDIO: ON' : '🔇 AUDIO: MUTED';
      });
    }

    // Speed Multipliers
    document.querySelectorAll('.btn-speed').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-speed').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.simSpeed = parseFloat(btn.getAttribute('data-speed')) || 1.0;
      });
    });
  }

  switchMatch(matchId) {
    document.querySelectorAll('.roster-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-match') === matchId);
    });
    this.currentMatch = matchId;
    this.resetMatch(matchId);
  }

  resetMatch(matchType) {
    this.currentMatch = matchType;
    const config = MATCH_CONFIGS[matchType] || MATCH_CONFIGS.x3;

    this.gameState = 'COUNTDOWN';
    this.countdownTimer = 3.6;
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

    this.totalInitialHits = config.initialHits;
    this.remainingHits = config.initialHits;

    // Spawn Initial Match Boss
    const bAng = Math.random() * Math.PI * 2;
    const initialSpeed = BASE_BALL_SPEED;

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
        halo: 'rgba(255, 85, 0, 0.25)'
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
        radius: 40,
        color: '#c026d3',
        halo: 'rgba(192, 38, 211, 0.25)'
      });
    } else if (matchType === 'sin') {
      this.balls.push({
        id: this.nextBallId++,
        type: 'sin',
        label: 'sin(x)',
        power: 3,
        x: -1.5,
        y: 2.0,
        vx: Math.cos(bAng) * initialSpeed,
        vy: Math.sin(bAng) * initialSpeed,
        radius: 32,
        color: '#10b981',
        halo: 'rgba(16, 185, 129, 0.25)'
      });
    } else if (matchType === 'exp') {
      this.balls.push({
        id: this.nextBallId++,
        type: 'exp',
        label: 'eˣ',
        power: 5,
        x: -1.0,
        y: 2.0,
        vx: Math.cos(bAng) * (initialSpeed * 1.1),
        vy: Math.sin(bAng) * (initialSpeed * 1.1),
        radius: 35,
        color: '#ffd700',
        halo: 'rgba(255, 215, 0, 0.25)'
      });
    }
  }

  triggerDash() {
    if (this.player.dashCharges <= 0) return;
    this.player.dashCharges--;
    this.player.isDashing = true;
    this.player.dashTimer = PLAYER_CONFIG.dashDuration;
    this.player.invulnerableTimer = PLAYER_CONFIG.dashInvulnerableDuration;

    let ang = this.player.facingAng;
    if (Math.hypot(this.player.vx, this.player.vy) > 0.1) {
      ang = Math.atan2(this.player.vy, this.player.vx);
    }
    this.player.vx = Math.cos(ang) * PLAYER_CONFIG.dashSpeed;
    this.player.vy = Math.sin(ang) * PLAYER_CONFIG.dashSpeed;

    audio.play('dash', this.player.x / 5.0);
    audio.triggerRumble(0.3, 0.6, 130);

    for (let i = 0; i < 20; i++) {
      this.pools.spawnParticle(toScreenX(this.player.x), toScreenY(this.player.y), '#00f0ff', 2.5);
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
    audio.triggerRumble(0.15, 0.3, 75);
  }

  triggerBomb() {
    if (this.player.bombEnergy < 100) return;
    this.player.bombEnergy = 0;
    this.screenShake = 22;

    audio.play('bomb', 0, 1.0);
    audio.triggerRumble(0.8, 1.0, 360);

    // Shatter laser curves
    this.summonCurves = [];
    this.summonState = 'IDLE';
    this.summonTimer = 5.0;

    // Shockwaves
    this.pools.spawnShockwave(toScreenX(this.player.x), toScreenY(this.player.y), 360, '#ff0055');
    this.pools.spawnShockwave(toScreenX(this.player.x), toScreenY(this.player.y), 280, '#00f0ff');

    this.pools.spawnPopup('💥 LEIBNIZ SUPERNOVA!', toScreenX(this.player.x), toScreenY(this.player.y) - 40, '#ffd700');

    // Differentiate all balls in math radius 4.5
    const targets = [...this.balls];
    targets.forEach(b => {
      const d = Math.hypot(b.x - this.player.x, b.y - this.player.y);
      if (d <= 4.5) {
        this.strikeAndDifferentiate(b);
      }
    });
  }

  triggerSlowMo() {
    this.slowMoTimer = 3.0; // 3 seconds of slow-mo
    audio.play('dash', 0, 0.5);
    this.pools.spawnPopup('⏱ EULER DILATION', toScreenX(this.player.x), toScreenY(this.player.y) - 30, '#00ff88');
  }

  strikeAndDifferentiate(ball) {
    if (!this.balls.some(b => b.id === ball.id)) return;

    this.player.differentiations++;
    this.remainingHits = Math.max(0, this.remainingHits - 1);
    this.player.hitCooldown = 0.12;

    // Lifesteal (+3 HP)
    if (this.player.hp < this.player.maxHp) {
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 3);
      this.pools.spawnPopup('+3 HP', toScreenX(this.player.x), toScreenY(this.player.y) - 20, '#10b981');
      audio.play('heal', this.player.x / 5.0);
    }

    // Bomb Charge (+6%)
    if (this.player.bombEnergy < 100) {
      this.player.bombEnergy = Math.min(100, this.player.bombEnergy + PLAYER_CONFIG.bombEnergyPerHit);
    }

    this.player.combos++;
    this.player.comboTimer = 2.2;
    const pitchMod = Math.min(2.4, 1.0 + this.player.combos * 0.08) * this.frenzyMultiplier;
    const panX = ball.x / 5.0;

    audio.triggerRumble(0.3, 0.6, 140);
    this.pools.spawnShockwave(toScreenX(ball.x), toScreenY(ball.y), 70, ball.color);

    // Remove the differentiated ball
    this.balls = this.balls.filter(b => b.id !== ball.id);
    const curSpeed = BASE_BALL_SPEED * this.frenzyMultiplier;
    const bMathR = (ball.radius / ARENA.width) * (ARENA.xMax - ARENA.xMin);

    // Delegate mathematical derivation to CalculusEngine
    const result = CalculusEngine.differentiate(ball, curSpeed, bMathR);

    // Spawn floating formula popup
    this.pools.spawnPopup(result.popup.text, toScreenX(ball.x), toScreenY(ball.y), result.popup.color);

    if (result.isAnnihilated) {
      // ZERO Annihilation chime & emerald sparkling particles!
      audio.play('pop_zero', panX, pitchMod);
      for (let k = 0; k < 24; k++) {
        this.pools.spawnParticle(toScreenX(ball.x), toScreenY(ball.y), '#10b981', 3.5, 45);
      }
    } else {
      audio.play('diff_strike', panX, pitchMod);
      // Add child balls
      result.newBalls.forEach(nb => {
        nb.id = this.nextBallId++;
        this.balls.push(nb);
      });
    }

    // Check Victory
    if (this.remainingHits <= 0 || this.balls.length === 0) {
      this.gameState = 'VICTORY';
      audio.play('victory');
      audio.triggerRumble(0.6, 1.0, 450);
      for (let k = 0; k < 70; k++) {
        this.pools.spawnParticle(
          ARENA.x + Math.random() * ARENA.width,
          ARENA.y + Math.random() * ARENA.height,
          '#00f0ff',
          4,
          80
        );
      }
    }
  }

  updateCountdown(dt) {
    this.countdownTimer -= dt;
    if (this.countdownTimer > 2.6 && !this.countdownStepPlayed[3]) {
      this.countdownStepPlayed[3] = true; audio.play('countdown', 0, 440);
    } else if (this.countdownTimer > 1.6 && this.countdownTimer <= 2.6 && !this.countdownStepPlayed[2]) {
      this.countdownStepPlayed[2] = true; audio.play('countdown', 0, 440);
    } else if (this.countdownTimer > 0.6 && this.countdownTimer <= 1.6 && !this.countdownStepPlayed[1]) {
      this.countdownStepPlayed[1] = true; audio.play('countdown', 0, 440);
    } else if (this.countdownTimer <= 0.6 && !this.countdownStepPlayed.fight) {
      this.countdownStepPlayed.fight = true; audio.play('countdown', 0, 880);
    }

    if (this.countdownTimer <= 0) {
      this.gameState = 'PLAYING';
    }
  }

  updatePlayerPhysics(dt) {
    const p = this.player;

    // Cooldown timers
    if (p.hitCooldown > 0) p.hitCooldown -= dt;
    if (p.invulnerableTimer > 0) p.invulnerableTimer -= dt;
    if (p.beamCooldown > 0) p.beamCooldown -= dt;

    if (p.comboTimer > 0) {
      p.comboTimer -= dt;
      if (p.comboTimer <= 0) p.combos = 0;
    }

    // Dash recharge
    if (p.dashCharges < p.maxDashCharges) {
      p.dashRechargeTimer += dt;
      if (p.dashRechargeTimer >= PLAYER_CONFIG.dashRechargeTime) {
        p.dashCharges++;
        p.dashRechargeTimer = 0;
      }
    }

    // Dash Active State
    if (p.isDashing) {
      p.dashTimer -= dt;
      if (p.dashTimer <= 0) p.isDashing = false;
    }

    // Handle Input Controls
    if (this.isPlayerControlled) {
      this.controls.poll(p.x, p.y);
      p.facingAng = this.controls.facingAng;

      // Check actions
      if (this.controls.consumeAction('dash')) this.triggerDash();
      if (this.controls.consumeAction('beam')) this.triggerBeam();
      if (this.controls.consumeAction('bomb')) this.triggerBomb();
      if (this.controls.consumeAction('slowMo')) this.triggerSlowMo();

      if (this.controls.consumeAction('cycleLeft')) {
        const keys = Object.keys(MATCH_CONFIGS);
        const idx = keys.indexOf(this.currentMatch);
        const nextIdx = (idx - 1 + keys.length) % keys.length;
        this.switchMatch(keys[nextIdx]);
      }
      if (this.controls.consumeAction('cycleRight')) {
        const keys = Object.keys(MATCH_CONFIGS);
        const idx = keys.indexOf(this.currentMatch);
        const nextIdx = (idx + 1) % keys.length;
        this.switchMatch(keys[nextIdx]);
      }
      if (this.controls.consumeAction('togglePilot')) {
        this.isPlayerControlled = !this.isPlayerControlled;
      }

      // Movement vector
      if (!p.isDashing) {
        const accel = this.controls.isBraking ? 1.5 : 8.0;
        const targetVx = this.controls.moveX * PLAYER_CONFIG.baseSpeed;
        const targetVy = this.controls.moveY * PLAYER_CONFIG.baseSpeed;
        p.vx += (targetVx - p.vx) * Math.min(1.0, accel * dt);
        p.vy += (targetVy - p.vy) * Math.min(1.0, accel * dt);
      }
    } else {
      // Auto Pilot AI mode
      this.updateAutoPilotAI(dt);
    }

    // Apply movement
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Arena boundary clamp
    const pMathR = (p.radius / ARENA.width) * (ARENA.xMax - ARENA.xMin);
    if (p.x - pMathR < ARENA.xMin) { p.x = ARENA.xMin + pMathR; p.vx = 0; }
    if (p.x + pMathR > ARENA.xMax) { p.x = ARENA.xMax - pMathR; p.vx = 0; }
    if (p.y - pMathR < ARENA.yMin) { p.y = ARENA.yMin + pMathR; p.vy = 0; }
    if (p.y + pMathR > ARENA.yMax) { p.y = ARENA.yMax - pMathR; p.vy = 0; }

    // Silky Trail
    p.trail.unshift({ x: toScreenX(p.x), y: toScreenY(p.y) });
    if (p.trail.length > 14) p.trail.pop();
  }

  updateAutoPilotAI(dt) {
    const p = this.player;
    if (this.balls.length === 0) return;

    // Find nearest ball
    let nearest = this.balls[0];
    let minDist = Infinity;
    this.balls.forEach(b => {
      const d = Math.hypot(b.x - p.x, b.y - p.y);
      if (d < minDist) { minDist = d; nearest = b; }
    });

    const ang = Math.atan2(nearest.y - p.y, nearest.x - p.x);
    p.facingAng = ang;

    // Steer towards nearest
    const spd = PLAYER_CONFIG.baseSpeed * 0.9;
    p.vx += (Math.cos(ang) * spd - p.vx) * Math.min(1.0, 7.0 * dt);
    p.vy += (Math.sin(ang) * spd - p.vy) * Math.min(1.0, 7.0 * dt);

    // Auto Fire Beam
    if (minDist < 4.0 && p.beamCooldown <= 0) {
      this.triggerBeam();
    }

    // Auto Dash
    if (minDist < 1.8 && p.dashCharges > 0 && !p.isDashing) {
      this.triggerDash();
    }

    // Auto Bomb
    if (this.balls.length >= 6 && p.bombEnergy >= 100) {
      this.triggerBomb();
    }
  }

  updateBallPhysics(dt) {
    const curSpeed = BASE_BALL_SPEED * this.frenzyMultiplier;

    this.balls.forEach(b => {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      this.resolveWallBounce(b, curSpeed);
    });

    // Ball-Ball billiard collisions
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
    const x1 = toScreenX(b1.x);
    const y1 = toScreenY(b1.y);
    const x2 = toScreenX(b2.x);
    const y2 = toScreenY(b2.y);

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
    this.balls.forEach(b => {
      const bx = toScreenX(b.x);
      const by = toScreenY(b.y);
      const dist = Math.hypot(bx - px, by - py);

      if (dist < p.radius + b.radius) {
        if (p.isDashing) {
          // Dash differentiates through enemy orb!
          this.strikeAndDifferentiate(b);
        } else if (p.invulnerableTimer <= 0) {
          // Take damage
          p.hp = Math.max(0, p.hp - 12);
          p.invulnerableTimer = 0.5;
          this.screenShake = 12;
          this.pools.spawnPopup('-12 HP', px, py - 20, '#ff0055', true);
          audio.triggerRumble(0.4, 0.7, 180);

          if (p.hp <= 0) {
            this.gameState = 'GAMEOVER';
            audio.play('gameover');
            audio.triggerRumble(0.8, 1.0, 500);
          }
        }
      }
    });

    // 2. Beams vs Balls
    this.pools.beams.forEach(bm => {
      if (!bm.active) return;
      const bmx = toScreenX(bm.x);
      const bmy = toScreenY(bm.y);

      for (const b of this.balls) {
        const bx = toScreenX(b.x);
        const by = toScreenY(b.y);
        if (Math.hypot(bx - bmx, by - bmy) < b.radius + 6) {
          bm.active = false;
          this.strikeAndDifferentiate(b);
          break;
        }
      }
    });
  }

  updateLasers(dt) {
    this.summonTimer -= dt;
    if (this.summonTimer <= 0) {
      if (this.summonState === 'IDLE') {
        this.summonState = 'WARNING';
        this.summonTimer = 1.6;
        // Generate hazard curves
        this.summonCurves = [
          { type: 'line', m: (Math.random() - 0.5) * 2, x0: 0, y0: (Math.random() - 0.5) * 3, color: '#ff5500' },
          { type: 'parabola', a: (Math.random() > 0.5 ? 0.3 : -0.3), x0: (Math.random() - 0.5) * 2, y0: (Math.random() - 0.5) * 2, color: '#ff5500' }
        ];
      } else if (this.summonState === 'WARNING') {
        this.summonState = 'LASER';
        this.summonTimer = 1.0;
        this.screenShake = 8;
        audio.triggerRumble(0.3, 0.6, 200);
      } else if (this.summonState === 'LASER') {
        this.summonState = 'IDLE';
        this.summonCurves = [];
        this.summonTimer = 5.0;
      }
    }

    // Laser damage test
    if (this.summonState === 'LASER' && this.player.invulnerableTimer <= 0 && !this.player.isDashing) {
      this.summonCurves.forEach(c => {
        let hit = false;
        if (c.type === 'line') {
          const expectedY = c.m * (this.player.x - c.x0) + c.y0;
          if (Math.abs(this.player.y - expectedY) < 0.35) hit = true;
        } else if (c.type === 'parabola') {
          const expectedY = c.a * Math.pow(this.player.x - c.x0, 2) + c.y0;
          if (Math.abs(this.player.y - expectedY) < 0.45) hit = true;
        }

        if (hit) {
          this.player.hp = Math.max(0, this.player.hp - 15);
          this.player.invulnerableTimer = 0.6;
          this.screenShake = 15;
          this.pools.spawnPopup('-15 LASER DMG', toScreenX(this.player.x), toScreenY(this.player.y) - 25, '#ff0055', true);
          if (this.player.hp <= 0) {
            this.gameState = 'GAMEOVER';
            audio.play('gameover');
          }
        }
      });
    }
  }

  loop(timestamp) {
    const rawDt = Math.min(0.08, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    if (this.isRunning) {
      let effectiveSpeed = this.simSpeed;
      if (this.slowMoTimer > 0) {
        this.slowMoTimer -= rawDt;
        effectiveSpeed *= 0.5;
      }

      const dt = rawDt * effectiveSpeed;

      if (this.screenShake > 0) {
        this.screenShake = Math.max(0, this.screenShake - rawDt * 30);
      }

      if (this.gameState === 'COUNTDOWN') {
        this.updateCountdown(rawDt);
      } else if (this.gameState === 'PLAYING') {
        this.updatePlayerPhysics(dt);
        this.updateBallPhysics(dt);
        this.updateCollisions();
        this.updateLasers(dt);
      }

      this.pools.update(dt);
    }

    this.renderer.render(
      this.gameState,
      this.currentMatch,
      this.player,
      this.balls,
      this.pools,
      this.summonCurves,
      this.summonState,
      this.countdownTimer,
      this.remainingHits,
      this.totalInitialHits,
      this.frenzyMultiplier,
      this.screenShake,
      this.controls.touchJoystick
    );

    requestAnimationFrame(this.loop);
  }
}

// Auto instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.mathBattleGame = new MathBattleGame();
});
