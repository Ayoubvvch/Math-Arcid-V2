/**
 * Math Battle: Calculus Showdown
 * Entity Pools, Mathematical State & Lifecycle Management
 */

import { PLAYER_CONFIG, ARENA, toScreenX, toScreenY } from './config.js';

export function createPlayer() {
  return {
    x: 0,
    y: -2.8,
    vx: 0,
    vy: 0,
    radius: PLAYER_CONFIG.radius,
    color: PLAYER_CONFIG.color,
    facingAng: Math.PI / 2,

    hp: PLAYER_CONFIG.maxHp,
    maxHp: PLAYER_CONFIG.maxHp,
    differentiations: 0,
    combos: 0,
    comboTimer: 0,
    invulnerableTimer: 0,
    hitCooldown: 0,

    dashCharges: PLAYER_CONFIG.maxDashCharges,
    maxDashCharges: PLAYER_CONFIG.maxDashCharges,
    dashRechargeTimer: 0,
    isDashing: false,
    dashTimer: 0,

    beamCooldown: 0,
    bombEnergy: 100,
    maxBombEnergy: PLAYER_CONFIG.maxBombEnergy,

    trail: []
  };
}

export class ObjectPools {
  constructor() {
    this.MAX_BEAMS = 25;
    this.MAX_PARTICLES = 160;
    this.MAX_POPUPS = 30;

    this.beams = Array.from({ length: this.MAX_BEAMS }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 1.5
    }));

    this.particles = Array.from({ length: this.MAX_PARTICLES }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      color: '#00f0ff',
      size: 2,
      alpha: 1.0,
      life: 0,
      maxLife: 30,
      gravity: 0
    }));

    this.popups = Array.from({ length: this.MAX_POPUPS }, () => ({
      active: false,
      text: '',
      x: 0,
      y: 0,
      vy: -1.6,
      color: '#00f0ff',
      alpha: 1.0,
      life: 0,
      maxLife: 45,
      isDmg: false
    }));

    this.shockwaves = [];
  }

  reset() {
    this.beams.forEach(b => (b.active = false));
    this.particles.forEach(p => (p.active = false));
    this.popups.forEach(p => (p.active = false));
    this.shockwaves = [];
  }

  spawnBeam(x, y, vx, vy) {
    const b = this.beams.find(item => !item.active);
    if (!b) return;
    b.active = true;
    b.x = x;
    b.y = y;
    b.vx = vx;
    b.vy = vy;
    b.life = 0;
    b.maxLife = 1.2;
  }

  spawnParticle(x, y, color = '#00f0ff', size = 2.5, maxLife = 35, gravity = 0) {
    const p = this.particles.find(item => !item.active);
    if (!p) return;
    p.active = true;
    p.x = x;
    p.y = y;
    const ang = Math.random() * Math.PI * 2;
    const spd = (Math.random() * 3.5 + 1.0);
    p.vx = Math.cos(ang) * spd;
    p.vy = Math.sin(ang) * spd;
    p.color = color;
    p.size = size;
    p.alpha = 1.0;
    p.life = 0;
    p.maxLife = maxLife;
    p.gravity = gravity;
  }

  spawnPopup(text, x, y, color = '#00f0ff', isDmg = false) {
    const p = this.popups.find(item => !item.active);
    if (!p) return;
    p.active = true;
    p.text = text;
    p.x = x;
    p.y = y;
    p.vy = isDmg ? -1.2 : -1.8;
    p.color = color;
    p.alpha = 1.0;
    p.life = 0;
    p.maxLife = isDmg ? 45 : 40;
    p.isDmg = isDmg;
  }

  spawnShockwave(x, y, maxR = 90, color = '#00f0ff') {
    this.shockwaves.push({
      x,
      y,
      r: 8,
      maxR,
      color,
      alpha: 1.0
    });
  }

  update(dt) {
    // 1. Update Beams
    this.beams.forEach(b => {
      if (!b.active) return;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life += dt;
      if (
        b.life >= b.maxLife ||
        b.x < ARENA.xMin - 0.5 ||
        b.x > ARENA.xMax + 0.5 ||
        b.y < ARENA.yMin - 0.5 ||
        b.y > ARENA.yMax + 0.5
      ) {
        b.active = false;
      }
    });

    // 2. Update Particles
    this.particles.forEach(p => {
      if (!p.active) return;
      p.life += dt * 30;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) p.active = false;
    });

    // 3. Update Popups (smooth upward float and clean fade)
    this.popups.forEach(p => {
      if (!p.active) return;
      p.life += dt * 30;
      p.y += p.vy;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) p.active = false;
    });

    // 4. Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.r += dt * 300;
      sw.alpha = Math.max(0, 1 - sw.r / sw.maxR);
      if (sw.r >= sw.maxR) {
        this.shockwaves.splice(i, 1);
      }
    }
  }
}
