/**
 * Sequence Strider - 2D Side-View Momentum Platformer & Suite Reactor Simulation
 * Implements M (upper majorant bound), m (lower minorant bound), stepped sequence platforms,
 * 4 Sector Override Gates, Converging/Oscillating Sequence Drones, and the Fixed-Point Boss Core.
 */

window.SEQ_WORLD = {
  WIDTH: 2560,
  HEIGHT: 760,
  BOUND_M: 66,   // Upper laser ceiling y = M
  BOUND_m: 704,  // Lower abyss floor y = m
  GRAVITY: 1480,
  MAX_PARTICLES: 130
};

window.createInitialStriderState = function(topicFilter = 'all') {
  const sectors = window.SEQ_SECTORS || [];

  // Platforms mapped across the 4 Sequence Sectors (with slight oscillating alternating platforms!)
  const platforms = [
    // Starting Sector 1 Launchpad & Induction Steps (0 .. 640)
    { x: 60, y: 540, w: 300, h: 20, label: 'u₀', oscAmp: 0, oscFreq: 0, baseY: 540 },
    { x: 390, y: 455, w: 190, h: 18, label: 'u₁', oscAmp: 0, oscFreq: 0, baseY: 455 },
    { x: 220, y: 345, w: 170, h: 18, label: 'u₂', oscAmp: 14, oscFreq: 1.8, baseY: 345 },
    { x: 460, y: 300, w: 210, h: 20, label: 'P(n+1)', oscAmp: 0, oscFreq: 0, baseY: 300 },

    // Sector 2 Arithmetic & Geometric Bridge (700 .. 1280)
    { x: 710, y: 470, w: 190, h: 18, label: '+r', oscAmp: 0, oscFreq: 0, baseY: 470 },
    { x: 940, y: 390, w: 180, h: 18, label: '×q', oscAmp: 18, oscFreq: 2.2, baseY: 390 },
    { x: 830, y: 245, w: 165, h: 18, label: 'vₙ', oscAmp: 0, oscFreq: 0, baseY: 245 },
    { x: 1090, y: 300, w: 210, h: 20, label: 'Homographique', oscAmp: 0, oscFreq: 0, baseY: 300 },

    // Sector 3 Squeeze Gendarme & Limits (1340 .. 1900)
    { x: 1340, y: 485, w: 195, h: 18, label: 'vₙ ≤ uₙ', oscAmp: 14, oscFreq: 2.0, baseY: 485 },
    { x: 1565, y: 385, w: 175, h: 18, label: 'uₙ ≤ wₙ', oscAmp: 0, oscFreq: 0, baseY: 385 },
    { x: 1440, y: 240, w: 175, h: 18, label: '(-1)ⁿ/n', oscAmp: 22, oscFreq: 2.6, baseY: 240 },
    { x: 1700, y: 310, w: 220, h: 20, label: 'Lim = L', oscAmp: 0, oscFreq: 0, baseY: 310 },

    // Sector 4 Fixed-Point Boss Arena (1960 .. 2480)
    { x: 1960, y: 515, w: 500, h: 22, label: 'I = [m, M]', oscAmp: 0, oscFreq: 0, baseY: 515 },
    { x: 2010, y: 370, w: 170, h: 18, label: 'f(L)=L', oscAmp: 12, oscFreq: 1.9, baseY: 370 },
    { x: 2250, y: 310, w: 220, h: 20, label: 'Noyau L', oscAmp: 0, oscFreq: 0, baseY: 310 }
  ];

  // 4 Sequence Gates positioned cleanly on major anchor platforms
  const gatePositions = [
    { x: 565, y: 264 },
    { x: 1195, y: 264 },
    { x: 1810, y: 274 },
    { x: 2360, y: 274 }
  ];

  const gates = gatePositions.map((pos, idx) => {
    const sec = sectors[idx] || { id: idx + 1, name: `القطاع ${idx + 1}`, topics: [39 + idx * 3], color: '#38bdf8' };
    return {
      id: idx,
      x: pos.x,
      y: pos.y,
      radius: 34,
      sectorName: sec.name,
      topics: sec.topics,
      color: sec.color,
      broken: false,
      pulse: idx * 1.1
    };
  });

  // Energy Orbs across route
  const orbs = [
    { id: 1, x: 485, y: 415, radius: 11, kind: 'energy' },
    { id: 2, x: 910, y: 205, radius: 11, kind: 'hp' },
    { id: 3, x: 1525, y: 195, radius: 11, kind: 'energy' },
    { id: 4, x: 2100, y: 330, radius: 11, kind: 'hp' }
  ];

  return {
    mode: 'intro', // 'intro' | 'play' | 'override' | 'pause' | 'end'
    topicFilter,
    time: 0,
    screenShake: 0,
    damageFlash: 0,
    bannerText: 'القطاع 1 — اخترق البوابات الأربع بين المكبر M والمصغر m',
    bannerTimer: 4.5,

    player: {
      x: 165,
      y: 480,
      vx: 0,
      vy: 0,
      radius: 17,
      facing: 1,
      aimAngle: 0,
      hp: 100,
      maxHp: 100,
      energy: 100,
      maxEnergy: 100,
      grounded: false,
      coyoteTimer: 0,
      jumpsLeft: 2,
      invulnTimer: 0,
      dashTimer: 0,
      dashCooldown: 0,
      dashVx: 0,
      pulseCooldown: 0,
      aegisCooldown: 0,
      aegisTimer: 0,
      overdriveCooldown: 0
    },

    platforms,
    gates,
    orbs,
    drones: [],
    projectiles: [],
    enemyProjectiles: [],
    particles: [],
    floatingTexts: [],

    nextDroneId: 1,
    spawnTimer: 1.2,
    bossSpawned: false,
    bossDefeated: false,

    stats: {
      brokenGates: 0,
      kills: 0,
      combo: 0,
      comboTimer: 0,
      bypasses: 0,
      questionsAnswered: 0,
      questionsCorrect: 0,
      score: 0
    },

    recentQuestionIds: [],
    activeOverride: null
  };
};

window.spawnSeqParticles = function(state, x, y, count = 12, color = '#38bdf8', maxSpd = 230) {
  const parts = state.particles;
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 40 + Math.random() * maxSpd;
    parts.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      size: 2.2 + Math.random() * 4,
      life: 0.3 + Math.random() * 0.4,
      maxLife: 0.7,
      color
    });
  }
  while (parts.length > window.SEQ_WORLD.MAX_PARTICLES) parts.shift();
};

window.addSeqFloatText = function(state, x, y, text, color = '#38bdf8', life = 1.2) {
  state.floatingTexts.push({ x, y, text, color, life, maxLife: life });
  if (state.floatingTexts.length > 24) state.floatingTexts.shift();
};

window.setSectorBanner = function(state, text, dur = 3.2) {
  state.bannerText = text;
  state.bannerTimer = dur;
};

window.spawnSeqDrone = function(state, forceKind = null) {
  const p = state.player;
  const broken = state.stats.brokenGates;
  let kind = forceKind;
  if (!kind) {
    const r = Math.random();
    if (r < 0.45) kind = 'divergent';
    else if (r < 0.78) kind = 'oscillator';
    else kind = 'gendarme';
  }

  let sx = Math.max(100, Math.min(window.SEQ_WORLD.WIDTH - 100, p.x + (Math.random() < 0.7 ? 420 : -380)));
  let sy = Math.max(115, Math.min(620, p.y + (Math.random() - 0.5) * 220));
  if (kind === 'boss') {
    sx = Math.max(240, Math.min(window.SEQ_WORLD.WIDTH - 140, p.x + 320));
    sy = 230;
  }

  const mult = 1 + broken * 0.16;
  const cfg = {
    divergent: { r: 19, hp: Math.round(45 * mult), speed: 155 + broken * 10, dmg: 12, label: 'qⁿ → +∞' },
    oscillator: { r: 18, hp: Math.round(40 * mult), speed: 135 + broken * 8, dmg: 11, label: '(-1)ⁿ' },
    gendarme: { r: 24, hp: Math.round(88 * mult), speed: 95 + broken * 6, dmg: 16, label: 'vₙ ≤ uₙ ≤ wₙ' },
    boss: { r: 42, hp: 440, speed: 130, dmg: 20, label: 'النقطة الصامدة f(L)=L' }
  }[kind];

  state.drones.push({
    id: state.nextDroneId++,
    kind,
    label: cfg.label,
    x: sx,
    y: sy,
    radius: cfg.r,
    hp: cfg.hp,
    maxHp: cfg.hp,
    speed: cfg.speed,
    dmg: cfg.dmg,
    hitFlash: 0,
    staggered: false,
    shootTimer: kind === 'boss' ? 1.5 : 2.3,
    phase: Math.random() * Math.PI * 2
  });
};

window.spawnFixedPointBoss = function(state) {
  if (state.bossSpawned) return;
  state.bossSpawned = true;
  window.spawnSeqDrone(state, 'boss');
  state.screenShake = Math.max(state.screenShake, 16);
  window.SeqAudio?.playOverdrive?.();
  window.setSectorBanner(state, '⚠ تحطمت البوابات الأربع — نواة النقطة الصامدة f(L)=L فعّالة!', 4.8);
  window.addSeqFloatText(state, state.player.x, state.player.y - 45, 'BOSS: النقطة الصامدة L!', '#f59e0b', 2.2);
};

window.damageSeqDrone = function(state, drone, dmg, forceKill = false) {
  drone.hp -= dmg;
  drone.hitFlash = 0.15;
  window.spawnSeqParticles(state, drone.x, drone.y, 8, '#38bdf8', 190);

  if (!drone.staggered && drone.hp > 0 && drone.hp <= drone.maxHp * 0.38 && (drone.kind === 'boss' || drone.kind === 'gendarme')) {
    drone.staggered = true;
    window.addSeqFloatText(state, drone.x, drone.y - drone.radius - 14, 'مشلول! [▢ / E] لاختراق النواة', '#fbbf24', 1.6);
  }

  if (drone.hp <= 0 || forceKill) {
    const idx = state.drones.indexOf(drone);
    if (idx !== -1) state.drones.splice(idx, 1);

    state.stats.kills++;
    state.stats.combo++;
    state.stats.comboTimer = 4.0;
    const mult = Math.min(5, 1 + Math.floor(state.stats.combo / 3));
    const pts = (drone.kind === 'boss' ? 1200 : drone.kind === 'gendarme' ? 160 : 80) * mult;
    state.stats.score += pts;
    state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 12);

    window.spawnSeqParticles(state, drone.x, drone.y, drone.kind === 'boss' ? 36 : 16, '#fbbf24', 280);
    window.addSeqFloatText(state, drone.x, drone.y - 18, `+${pts}`, '#34d399', 0.95);

    if (drone.kind !== 'boss' && Math.random() < 0.32) {
      state.orbs.push({
        id: Date.now() + Math.random(),
        x: drone.x,
        y: Math.min(640, drone.y),
        radius: 11,
        kind: Math.random() < 0.55 ? 'energy' : 'hp'
      });
    }

    if (drone.kind === 'boss') {
      state.bossDefeated = true;
      window.SeqAudio?.playGateBreak?.();
      window.finishSequenceGame(state, true);
    }
    return true;
  }
  return false;
};

window.performJump = function(state) {
  const p = state.player;
  if (p.grounded || p.coyoteTimer > 0) {
    p.vy = -590;
    p.grounded = false;
    p.coyoteTimer = 0;
    p.jumpsLeft = 1;
    window.SeqAudio?.playJump?.(false);
    window.spawnSeqParticles(state, p.x, p.y + p.radius, 7, '#38bdf8', 110);
    return true;
  }
  if (p.jumpsLeft > 0) {
    p.vy = -540;
    p.jumpsLeft--;
    window.SeqAudio?.playJump?.(true);
    window.spawnSeqParticles(state, p.x, p.y + p.radius, 10, '#c084fc', 150);
    return true;
  }
  return false;
};

window.performStriderDash = function(state, moveX) {
  const p = state.player;
  if (p.dashCooldown > 0) return false;
  const dir = Math.abs(moveX) > 0.2 ? Math.sign(moveX) : p.facing;
  p.facing = dir;
  p.dashTimer = 0.18;
  p.dashCooldown = 0.95;
  p.invulnTimer = Math.max(p.invulnTimer, 0.30);
  p.dashVx = dir * 740;
  p.vy = 0;
  window.SeqAudio?.playDash?.();
  window.spawnSeqParticles(state, p.x, p.y, 10, '#fb7185', 160);
  return true;
};

window.performAegisShield = function(state) {
  const p = state.player;
  if (p.aegisCooldown > 0) return false;
  p.aegisCooldown = 5.2;
  p.aegisTimer = 3.2;
  p.invulnTimer = Math.max(p.invulnTimer, 1.0);
  window.SeqAudio?.playAegis?.();
  window.spawnSeqParticles(state, p.x, p.y, 16, '#34d399', 210);
  window.setSectorBanner(state, '🛡️ درع الترجع مفعّل — حماية من M و m وتبطيء المتباعدات', 2.4);
  window.addSeqFloatText(state, p.x, p.y + 38, '🛡️ درع الترجع', '#34d399', 1.1);
  return true;
};

window.performPulseShot = function(state) {
  const p = state.player;
  if (p.pulseCooldown > 0) return false;
  p.pulseCooldown = 0.20;
  const spd = 720;
  state.projectiles.push({
    x: p.x + Math.cos(p.aimAngle) * 18,
    y: p.y + Math.sin(p.aimAngle) * 18,
    vx: Math.cos(p.aimAngle) * spd,
    vy: Math.sin(p.aimAngle) * spd,
    dmg: 28,
    life: 1.05
  });
  window.SeqAudio?.playPulse?.();
  return true;
};

window.performOverdriveWorld = function(state) {
  const p = state.player;
  if (p.overdriveCooldown > 0 || p.energy < 40) {
    if (p.energy < 40) window.addSeqFloatText(state, p.x, p.y + 36, 'تحتاج 40% طاقة ترجع!', '#fbbf24', 1.0);
    return false;
  }
  p.energy -= 40;
  p.overdriveCooldown = 2.6;
  state.screenShake = Math.max(state.screenShake, 14);
  window.SeqAudio?.playOverdrive?.();
  window.triggerStriderHaptic?.(140, 0.7, 0.85);
  window.spawnSeqParticles(state, p.x, p.y, 32, '#c084fc', 330);
  window.setSectorBanner(state, '⚡ موجة الترجع الكبرى!', 2.2);
  window.addSeqFloatText(state, p.x, p.y + 38, '⚡ موجة الترجع', '#e9d5ff', 1.2);

  for (let i = state.drones.length - 1; i >= 0; i--) {
    const d = state.drones[i];
    if (Math.hypot(d.x - p.x, d.y - p.y) <= 360) {
      window.damageSeqDrone(state, d, 115, d.kind !== 'boss');
    }
  }
  return true;
};

window.findNearestSeqInteract = function(state) {
  const p = state.player;
  for (const d of state.drones) {
    if (d.staggered && Math.hypot(d.x - p.x, d.y - p.y) <= 130) {
      return { kind: 'execute', drone: d };
    }
  }
  for (const g of state.gates) {
    if (!g.broken && Math.hypot(g.x - p.x, g.y - p.y) <= 115) {
      return { kind: 'gate', gate: g };
    }
  }
  return null;
};

window.updateStriderWorld = function(state, rawDt, moveVec, aimVec) {
  if (state.mode !== 'play' && state.mode !== 'override') return;

  const tScale = state.mode === 'override' ? 0.035 : 1.0;
  const dt = rawDt * tScale;
  state.time += rawDt;

  const p = state.player;

  if (state.bannerTimer > 0) state.bannerTimer = Math.max(0, state.bannerTimer - rawDt);
  if (state.damageFlash > 0) state.damageFlash = Math.max(0, state.damageFlash - rawDt * 2.4);
  if (state.screenShake > 0) state.screenShake = Math.max(0, state.screenShake - rawDt * 38);

  // Move oscillating sequence platforms smoothly
  for (const plat of state.platforms) {
    if (plat.oscAmp > 0) {
      plat.y = plat.baseY + Math.sin(state.time * plat.oscFreq) * plat.oscAmp;
    }
  }

  if (state.mode === 'play') {
    p.invulnTimer = Math.max(0, p.invulnTimer - dt);
    p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    p.pulseCooldown = Math.max(0, p.pulseCooldown - dt);
    p.aegisCooldown = Math.max(0, p.aegisCooldown - dt);
    p.aegisTimer = Math.max(0, p.aegisTimer - dt);
    p.overdriveCooldown = Math.max(0, p.overdriveCooldown - dt);
    p.energy = Math.min(p.maxEnergy, p.energy + dt * 5.2);

    if (state.stats.comboTimer > 0) {
      state.stats.comboTimer -= dt;
      if (state.stats.comboTimer <= 0) state.stats.combo = 0;
    }

    if (Math.abs(moveVec.x) > 0.12) {
      p.facing = Math.sign(moveVec.x);
    }

    if (aimVec && Math.hypot(aimVec.x, aimVec.y) > 0.16) {
      p.aimAngle = Math.atan2(aimVec.y, aimVec.x);
    } else if (Math.abs(moveVec.x) > 0.2 || Math.abs(moveVec.y) > 0.25) {
      p.aimAngle = Math.atan2(moveVec.y * 0.65, Math.abs(moveVec.x) > 0.1 ? moveVec.x : p.facing);
    } else {
      p.aimAngle = p.facing > 0 ? 0 : Math.PI;
    }

    const prevBottom = p.y + p.radius;

    if (p.dashTimer > 0) {
      p.dashTimer -= dt;
      p.x += p.dashVx * dt;
      p.vy = 0;
    } else {
      const targetVx = moveVec.x * 345;
      p.vx += (targetVx - p.vx) * Math.min(1, dt * 16);
      p.x += p.vx * dt;
      p.vy += window.SEQ_WORLD.GRAVITY * dt;
      p.vy = Math.min(820, p.vy);
      p.y += p.vy * dt;
    }

    p.x = Math.max(p.radius + 26, Math.min(window.SEQ_WORLD.WIDTH - p.radius - 26, p.x));

    // One-way cyber platform landing
    const wasGrounded = p.grounded;
    p.grounded = false;
    if (p.vy >= 0) {
      for (const plat of state.platforms) {
        if (p.x + p.radius * 0.65 >= plat.x && p.x - p.radius * 0.65 <= plat.x + plat.w) {
          if (prevBottom <= plat.y + 14 && p.y + p.radius >= plat.y) {
            p.y = plat.y - p.radius;
            p.vy = 0;
            p.grounded = true;
            p.jumpsLeft = 2;
            p.coyoteTimer = 0.12;
            break;
          }
        }
      }
    }
    if (!p.grounded && wasGrounded && p.vy >= 0) p.coyoteTimer = 0.12;
    else if (!p.grounded) p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);

    // Upper Bound y = M & Lower Bound y = m collisions!
    if (p.y - p.radius <= window.SEQ_WORLD.BOUND_M) {
      p.y = window.SEQ_WORLD.BOUND_M + p.radius + 4;
      p.vy = 220;
      if (p.invulnTimer <= 0 && p.aegisTimer <= 0) {
        applyPlayerHit(state, 10, 'اصطدام بالمكبر M!');
      }
    } else if (p.y + p.radius >= window.SEQ_WORLD.BOUND_m) {
      p.y = window.SEQ_WORLD.BOUND_m - p.radius - 6;
      p.vy = -520;
      p.jumpsLeft = 1;
      if (p.invulnTimer <= 0 && p.aegisTimer <= 0) {
        applyPlayerHit(state, 14, 'سقوط تحت المصغر m!');
      }
    }

    // Collect Orbs
    for (let i = state.orbs.length - 1; i >= 0; i--) {
      const o = state.orbs[i];
      if (Math.hypot(o.x - p.x, o.y - p.y) <= p.radius + o.radius + 10) {
        if (o.kind === 'hp') {
          p.hp = Math.min(p.maxHp, p.hp + 25);
          window.addSeqFloatText(state, p.x, p.y - 24, '+25 درع', '#38bdf8', 1.0);
        } else {
          p.energy = Math.min(p.maxEnergy, p.energy + 35);
          window.addSeqFloatText(state, p.x, p.y - 24, '+35% طاقة', '#c084fc', 1.0);
        }
        window.SeqAudio?.playUiTick?.();
        state.orbs.splice(i, 1);
      }
    }

    // Spawner (cap max simultaneous drones at 9 for locked 60FPS)
    state.spawnTimer -= dt;
    const cap = state.bossSpawned ? 7 : 5 + state.stats.brokenGates;
    if (state.spawnTimer <= 0 && state.drones.length < cap) {
      window.spawnSeqDrone(state);
      state.spawnTimer = Math.max(1.5, 3.1 - state.stats.brokenGates * 0.35);
    }
  }

  // Player pulse shots
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const b = state.projectiles[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    let rm = b.life <= 0 || b.x < 10 || b.x > window.SEQ_WORLD.WIDTH - 10;
    if (!rm) {
      for (let j = state.drones.length - 1; j >= 0; j--) {
        const d = state.drones[j];
        if (Math.hypot(d.x - b.x, d.y - b.y) <= d.radius + 8) {
          window.damageSeqDrone(state, d, b.dmg, false);
          rm = true;
          break;
        }
      }
    }
    if (rm) state.projectiles.splice(i, 1);
  }

  // Enemy projectiles
  for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
    const ep = state.enemyProjectiles[i];
    ep.x += ep.vx * dt;
    ep.y += ep.vy * dt;
    ep.life -= dt;
    let rm = ep.life <= 0;
    if (!rm && Math.hypot(ep.x - p.x, ep.y - p.y) <= p.radius + 8 && p.invulnTimer <= 0 && p.aegisTimer <= 0 && state.mode === 'play') {
      applyPlayerHit(state, 12, '-12 درع');
      rm = true;
    }
    if (rm) state.enemyProjectiles.splice(i, 1);
  }

  // Drones AI
  const slowMul = p.aegisTimer > 0 ? 0.45 : 1.0;
  for (const d of state.drones) {
    d.hitFlash = Math.max(0, d.hitFlash - dt);
    d.phase += rawDt * 4.5;
    const dx = p.x - d.x;
    const dy = p.y - d.y;
    const dist = Math.hypot(dx, dy);

    if (state.mode === 'play' && dist > 1) {
      const spd = (d.staggered ? d.speed * 0.25 : d.speed) * slowMul;
      let moveY = (dy / dist) * spd * dt;
      if (d.kind === 'oscillator') moveY += Math.sin(d.phase) * 95 * dt;
      d.x += (dx / dist) * spd * dt;
      d.y = Math.max(window.SEQ_WORLD.BOUND_M + 30, Math.min(window.SEQ_WORLD.BOUND_m - 30, d.y + moveY));

      if (d.kind === 'gendarme' || d.kind === 'boss') {
        d.shootTimer -= dt;
        if (d.shootTimer <= 0) {
          d.shootTimer = d.kind === 'boss' ? 1.6 : 2.3;
          const base = Math.atan2(dy, dx);
          const offsets = d.kind === 'boss' ? [-0.24, 0, 0.24] : [-0.14, 0.14];
          for (const off of offsets) {
            state.enemyProjectiles.push({
              x: d.x, y: d.y,
              vx: Math.cos(base + off) * 320,
              vy: Math.sin(base + off) * 320,
              life: 2.4
            });
          }
        }
      }

      if (!d.staggered && dist <= p.radius + d.radius + 3 && p.invulnTimer <= 0 && p.aegisTimer <= 0) {
        applyPlayerHit(state, d.dmg, `-${d.dmg}`);
      }
    }
  }

  for (const g of state.gates) g.pulse += rawDt * 2.6;

  for (let i = state.particles.length - 1; i >= 0; i--) {
    const pt = state.particles[i];
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vx *= 0.92;
    pt.vy *= 0.92;
    pt.life -= rawDt;
    if (pt.life <= 0) state.particles.splice(i, 1);
  }

  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const ft = state.floatingTexts[i];
    ft.y -= 28 * rawDt;
    ft.life -= rawDt;
    if (ft.life <= 0) state.floatingTexts.splice(i, 1);
  }
};

function applyPlayerHit(state, dmg, msg) {
  const p = state.player;
  if (p.hp <= 0 || state.mode !== 'play') return;
  p.hp = Math.max(0, p.hp - dmg);
  p.invulnTimer = 0.72;
  state.damageFlash = 1.0;
  state.screenShake = Math.max(state.screenShake, 11);
  window.SeqAudio?.playDamage?.();
  window.triggerStriderHaptic?.(110, 0.65, 0.8);
  window.addSeqFloatText(state, p.x, p.y - 24, msg, '#fb7185', 1.1);
  if (p.hp <= 0) {
    window.finishSequenceGame(state, false);
  }
}
