/**
 * Complex Plane Citadel (قلعة أرغاند) - 2D Argand-Cauchy Plane Simulation & Orbital Combat Engine
 * Implements the 2400x1800 Complex Plane centered at Origin O(1200, 900) with scale 180px = 1 unit,
 * 4 Quadrant Argand Seals (Q1..Q4), Polar Laser Obstacles, Euler Phase Dash, Conjugate Reflection,
 * Roots-of-Unity Polygon Shield (z^n = 1), Homothety Shockwave, and the Moivre Origin Boss Core.
 */

window.SEQ_WORLD = {
  WIDTH: 2400,
  HEIGHT: 1800,
  ORIGIN_X: 1200,
  ORIGIN_Y: 900,
  UNIT_PX: 180,     // 1 complex unit = 180 pixels
  MAX_MODULUS: 6.2, // Outer Argand containment ring
  MAX_PARTICLES: 140
};

window.worldToComplex = function(x, y) {
  const re = (x - window.SEQ_WORLD.ORIGIN_X) / window.SEQ_WORLD.UNIT_PX;
  const im = (window.SEQ_WORLD.ORIGIN_Y - y) / window.SEQ_WORLD.UNIT_PX;
  const mod = Math.hypot(re, im);
  const arg = Math.atan2(im, re);
  return { re, im, mod, arg };
};

window.complexToWorld = function(re, im) {
  return {
    x: window.SEQ_WORLD.ORIGIN_X + re * window.SEQ_WORLD.UNIT_PX,
    y: window.SEQ_WORLD.ORIGIN_Y - im * window.SEQ_WORLD.UNIT_PX
  };
};

window.createInitialStriderState = function(topicFilter = 'all') {
  const sectors = window.SEQ_SECTORS || [];

  // Architectural Complex Monoliths / Bastion Walls across the 4 Quadrants
  const platforms = [
    // Quadrant 1 (Re > 0, Im > 0)
    { x: 1460, y: 580, w: 210, h: 24, label: 'z = a + ib', oscAmp: 14, oscFreq: 1.6, baseY: 580 },
    { x: 1820, y: 340, w: 190, h: 24, label: '|z - zA| = R', oscAmp: 0, oscFreq: 0, baseY: 340 },
    { x: 1520, y: 260, w: 180, h: 22, label: 'z · z̄ = |z|²', oscAmp: 0, oscFreq: 0, baseY: 260 },

    // Quadrant 2 (Re < 0, Im > 0)
    { x: 720, y: 580, w: 210, h: 24, label: 'r·e^{iθ}', oscAmp: 16, oscFreq: 1.8, baseY: 580 },
    { x: 390, y: 340, w: 195, h: 24, label: 'Euler & Moivre', oscAmp: 0, oscFreq: 0, baseY: 340 },
    { x: 680, y: 260, w: 185, h: 22, label: '2cos(θ/2)e^{iθ/2}', oscAmp: 0, oscFreq: 0, baseY: 260 },

    // Quadrant 3 (Re < 0, Im < 0)
    { x: 720, y: 1200, w: 210, h: 24, label: 'arg((zC-zA)/(zB-zA))', oscAmp: 15, oscFreq: 1.7, baseY: 1200 },
    { x: 390, y: 1440, w: 195, h: 24, label: 'Équilatéral e^{iπ/3}', oscAmp: 0, oscFreq: 0, baseY: 1440 },
    { x: 680, y: 1520, w: 185, h: 22, label: '(AB) ⊥ (AC) ∈ iℝ*', oscAmp: 0, oscFreq: 0, baseY: 1520 },

    // Quadrant 4 (Re > 0, Im < 0)
    { x: 1460, y: 1200, w: 210, h: 24, label: 'z\' - ω = e^{iθ}(z - ω)', oscAmp: 15, oscFreq: 1.9, baseY: 1200 },
    { x: 1820, y: 1440, w: 195, h: 24, label: 'Homothétie k(z - ω)', oscAmp: 0, oscFreq: 0, baseY: 1440 },
    { x: 1520, y: 1520, w: 185, h: 22, label: '1 + j + j² = 0', oscAmp: 0, oscFreq: 0, baseY: 1520 }
  ];

  // 4 Quadrant Seals positioned in Q1, Q2, Q3, Q4
  const gatePositions = [
    { x: 1740, y: 450, affix: '3 + 2.5i' },
    { x: 660, y: 450, affix: '-3 + 2.5i' },
    { x: 660, y: 1350, affix: '-3 - 2.5i' },
    { x: 1740, y: 1350, affix: '3 - 2.5i' }
  ];

  const gates = gatePositions.map((pos, idx) => {
    const sec = sectors[idx] || { id: idx + 1, name: `الربع ${idx + 1}`, topics: [51 + idx * 3], color: '#fbbf24' };
    return {
      id: idx,
      x: pos.x,
      y: pos.y,
      affix: pos.affix,
      radius: 38,
      sectorName: sec.name,
      topics: sec.topics,
      color: sec.color,
      broken: false,
      pulse: idx * 1.2
    };
  });

  // Rotating Polar Hazard Beams orbiting inside the Quadrants
  const polarHazards = [
    { cx: 1740, cy: 450, orbitR: 115, angle: 0, speed: 1.45, radius: 13 },
    { cx: 660, cy: 450, orbitR: 115, angle: Math.PI / 2, speed: -1.55, radius: 13 },
    { cx: 660, cy: 1350, orbitR: 115, angle: Math.PI, speed: 1.65, radius: 13 },
    { cx: 1740, cy: 1350, orbitR: 115, angle: 1.5 * Math.PI, speed: -1.5, radius: 13 }
  ];

  // Harmonic Energy & Modulus Repair Orbs across the Complex Plane
  const orbs = [
    { id: 1, x: 1380, y: 720, radius: 12, kind: 'energy' },
    { id: 2, x: 1020, y: 720, radius: 12, kind: 'hp' },
    { id: 3, x: 1020, y: 1080, radius: 12, kind: 'energy' },
    { id: 4, x: 1380, y: 1080, radius: 12, kind: 'hp' },
    { id: 5, x: 1200, y: 540, radius: 12, kind: 'energy' },
    { id: 6, x: 1200, y: 1260, radius: 12, kind: 'hp' }
  ];

  return {
    mode: 'intro', // 'intro' | 'play' | 'override' | 'pause' | 'end'
    topicFilter,
    time: 0,
    screenShake: 0,
    damageFlash: 0,
    bannerText: 'الربع الأول Q1 — اخترق أختام أرغاند الأربعة عبر الأعداد العقدية (51–64)',
    bannerTimer: 4.5,

    player: {
      x: 1380,
      y: 720,
      vx: 0,
      vy: 0,
      radius: 18,
      facing: 1,
      aimAngle: -Math.PI / 4,
      hp: 100,
      maxHp: 100,
      energy: 100,
      maxEnergy: 100,
      grounded: true,
      coyoteTimer: 0,
      jumpsLeft: 2,
      invulnTimer: 0,
      dashTimer: 0,
      dashCooldown: 0,
      dashVx: 0,
      dashVy: 0,
      pulseCooldown: 0,
      aegisCooldown: 0,
      aegisTimer: 0,
      rootsOrder: 6,
      overdriveCooldown: 0
    },

    platforms,
    gates,
    polarHazards,
    orbs,
    drones: [],
    projectiles: [],
    enemyProjectiles: [],
    particles: [],
    floatingTexts: [],

    nextDroneId: 1,
    spawnTimer: 1.1,
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

window.spawnSeqParticles = function(state, x, y, count = 12, color = '#fbbf24', maxSpd = 230) {
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

window.addSeqFloatText = function(state, x, y, text, color = '#fbbf24', life = 1.2) {
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
    if (r < 0.44) kind = 'divergent';
    else if (r < 0.78) kind = 'oscillator';
    else kind = 'gendarme';
  }

  const spawnAngle = Math.random() * Math.PI * 2;
  const spawnDist = 380 + Math.random() * 140;
  let sx = Math.max(120, Math.min(window.SEQ_WORLD.WIDTH - 120, p.x + Math.cos(spawnAngle) * spawnDist));
  let sy = Math.max(120, Math.min(window.SEQ_WORLD.HEIGHT - 120, p.y + Math.sin(spawnAngle) * spawnDist));
  if (kind === 'boss') {
    sx = window.SEQ_WORLD.ORIGIN_X;
    sy = window.SEQ_WORLD.ORIGIN_Y;
  }

  const mult = 1 + broken * 0.16;
  const cfg = {
    divergent: { r: 19, hp: Math.round(46 * mult), speed: 158 + broken * 10, dmg: 12, label: '|z| → +∞' },
    oscillator: { r: 18, hp: Math.round(42 * mult), speed: 140 + broken * 8, dmg: 11, label: 'r·e^{iθ}' },
    gendarme: { r: 25, hp: Math.round(92 * mult), speed: 98 + broken * 6, dmg: 16, label: 'zⁿ = e^{iπ}' },
    boss: { r: 46, hp: 480, speed: 128, dmg: 20, label: 'نواة موافر (cos θ + i sin θ)ⁿ' }
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
    shootTimer: kind === 'boss' ? 1.4 : 2.2,
    phase: Math.random() * Math.PI * 2
  });
};

window.spawnFixedPointBoss = function(state) {
  if (state.bossSpawned) return;
  state.bossSpawned = true;
  window.spawnSeqDrone(state, 'boss');
  state.screenShake = Math.max(state.screenShake, 16);
  window.SeqAudio?.playOverdrive?.();
  window.setSectorBanner(state, '⚠ تحطمت الأختام الأربعة — نواة موافر الأعظم ظهرت في المركز O(0,0)!', 5.0);
  window.addSeqFloatText(state, state.player.x, state.player.y - 45, 'BOSS: نواة موافر في O(0,0)!', '#f59e0b', 2.4);
};

window.damageSeqDrone = function(state, drone, dmg, forceKill = false) {
  drone.hp -= dmg;
  drone.hitFlash = 0.15;
  window.spawnSeqParticles(state, drone.x, drone.y, 8, '#fbbf24', 190);

  if (!drone.staggered && drone.hp > 0 && drone.hp <= drone.maxHp * 0.38 && (drone.kind === 'boss' || drone.kind === 'gendarme')) {
    drone.staggered = true;
    window.addSeqFloatText(state, drone.x, drone.y - drone.radius - 14, 'مشلول! [▢ / E] لاختراق النواة', '#fbbf24', 1.6);
  }

  if (drone.hp <= 0 || forceKill) {
    const idx = state.drones.indexOf(drone);
    if (idx !== -1) state.drones.splice(idx, 1);

    state.stats.kills++;
    state.stats.combo++;
    state.stats.comboTimer = 4.2;
    const mult = Math.min(5, 1 + Math.floor(state.stats.combo / 3));
    const pts = (drone.kind === 'boss' ? 1400 : drone.kind === 'gendarme' ? 170 : 85) * mult;
    state.stats.score += pts;
    state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 13);

    window.spawnSeqParticles(state, drone.x, drone.y, drone.kind === 'boss' ? 40 : 16, '#fbbf24', 280);
    window.addSeqFloatText(state, drone.x, drone.y - 18, `+${pts}`, '#34d399', 0.95);

    if (drone.kind !== 'boss' && Math.random() < 0.34) {
      state.orbs.push({
        id: Date.now() + Math.random(),
        x: drone.x,
        y: drone.y,
        radius: 12,
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

// [✕ / Space]: Euler Rotation Phase Dash (z -> z * e^{i*pi/3})
window.performJump = function(state) {
  const p = state.player;
  if (p.dashCooldown > 0 && p.jumpsLeft <= 0) return false;
  const isSecond = p.dashTimer > 0 || p.jumpsLeft === 1;
  p.jumpsLeft = Math.max(0, p.jumpsLeft - 1);
  p.dashTimer = 0.22;
  p.dashCooldown = 0.55;
  p.invulnTimer = Math.max(p.invulnTimer, 0.34);

  const angle = p.aimAngle;
  p.dashVx = Math.cos(angle) * 760;
  p.dashVy = Math.sin(angle) * 760;

  window.SeqAudio?.playJump?.(isSecond);
  window.spawnSeqParticles(state, p.x, p.y, 14, '#fbbf24', 190);
  window.addSeqFloatText(state, p.x, p.y - 26, 'z · e^{iπ/3}', '#fde68a', 0.85);
  return true;
};

// [◯ / Shift]: Complex Conjugate Reflection Pulse (z -> z_bar)
window.performStriderDash = function(state, moveX) {
  const p = state.player;
  if (p.dashCooldown > 0) return false;
  p.dashCooldown = 0.88;
  p.invulnTimer = Math.max(p.invulnTimer, 0.36);

  const oldX = p.x;
  const oldY = p.y;
  // Shockwave at origin of reflection
  window.spawnSeqParticles(state, oldX, oldY, 16, '#fb7185', 220);
  for (let i = state.drones.length - 1; i >= 0; i--) {
    const d = state.drones[i];
    if (Math.hypot(d.x - oldX, d.y - oldY) <= 170) {
      window.damageSeqDrone(state, d, 42, false);
    }
  }

  // Conjugate step: invert vertical component relative to local trajectory or step across chord
  const stepAngle = Math.abs(moveX) > 0.15 ? (moveX > 0 ? 0 : Math.PI) : -p.aimAngle;
  p.x = Math.max(90, Math.min(window.SEQ_WORLD.WIDTH - 90, p.x + Math.cos(stepAngle) * 185));
  p.y = Math.max(90, Math.min(window.SEQ_WORLD.HEIGHT - 90, p.y + Math.sin(stepAngle) * 185));

  window.SeqAudio?.playDash?.();
  window.spawnSeqParticles(state, p.x, p.y, 16, '#38bdf8', 220);
  window.addSeqFloatText(state, p.x, p.y - 28, 'مرافق z̄', '#38bdf8', 0.95);
  return true;
};

// [△ / Q]: Roots of Unity Polygon Shield (z^n = 1)
window.performAegisShield = function(state) {
  const p = state.player;
  if (p.aegisCooldown > 0) return false;
  p.aegisCooldown = 5.0;
  p.aegisTimer = 3.4;
  p.invulnTimer = Math.max(p.invulnTimer, 1.1);
  window.SeqAudio?.playAegis?.();
  window.spawnSeqParticles(state, p.x, p.y, 18, '#34d399', 220);
  window.setSectorBanner(state, '🛡️ درع جذور الوحدة (z⁶ = 1) مفعّل — تدمير القذائف وإبطاء الأعداء', 2.5);
  window.addSeqFloatText(state, p.x, p.y + 38, '🛡️ درع zⁿ = 1', '#34d399', 1.15);
  return true;
};

// [R2 / J]: Affix Vector Plasma Shot
window.performPulseShot = function(state) {
  const p = state.player;
  if (p.pulseCooldown > 0) return false;
  p.pulseCooldown = 0.18;
  const spd = 760;
  const perpX = -Math.sin(p.aimAngle) * 7;
  const perpY = Math.cos(p.aimAngle) * 7;
  for (const sgn of [-1, 1]) {
    state.projectiles.push({
      x: p.x + Math.cos(p.aimAngle) * 18 + perpX * sgn,
      y: p.y + Math.sin(p.aimAngle) * 18 + perpY * sgn,
      vx: Math.cos(p.aimAngle) * spd,
      vy: Math.sin(p.aimAngle) * spd,
      dmg: 18,
      life: 1.1
    });
  }
  window.SeqAudio?.playPulse?.();
  return true;
};

// [L2 / F]: Homothety Radial Blast (z' - w = k(z - w))
window.performOverdriveWorld = function(state) {
  const p = state.player;
  if (p.overdriveCooldown > 0 || p.energy < 40) {
    if (p.energy < 40) window.addSeqFloatText(state, p.x, p.y + 36, 'تحتاج 40% طاقة أولير!', '#fbbf24', 1.0);
    return false;
  }
  p.energy -= 40;
  p.overdriveCooldown = 2.4;
  state.screenShake = Math.max(state.screenShake, 15);
  window.SeqAudio?.playOverdrive?.();
  window.triggerStriderHaptic?.(140, 0.7, 0.85);
  window.spawnSeqParticles(state, p.x, p.y, 36, '#c084fc', 340);
  window.setSectorBanner(state, '⚡ موجة التحاكي العظمى z\' - ω = k(z - ω)!', 2.3);
  window.addSeqFloatText(state, p.x, p.y + 38, '⚡ تحاكي k·z', '#e9d5ff', 1.2);

  for (let i = state.drones.length - 1; i >= 0; i--) {
    const d = state.drones[i];
    const dist = Math.hypot(d.x - p.x, d.y - p.y);
    if (dist <= 390) {
      const ang = Math.atan2(d.y - p.y, d.x - p.x);
      d.x = Math.max(80, Math.min(window.SEQ_WORLD.WIDTH - 80, d.x + Math.cos(ang) * 95));
      d.y = Math.max(80, Math.min(window.SEQ_WORLD.HEIGHT - 80, d.y + Math.sin(ang) * 95));
      window.damageSeqDrone(state, d, 120, d.kind !== 'boss');
    }
  }
  return true;
};

window.findNearestSeqInteract = function(state) {
  const p = state.player;
  for (const d of state.drones) {
    if (d.staggered && Math.hypot(d.x - p.x, d.y - p.y) <= 135) {
      return { kind: 'execute', drone: d };
    }
  }
  for (const g of state.gates) {
    if (!g.broken && Math.hypot(g.x - p.x, g.y - p.y) <= 125) {
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

  for (const plat of state.platforms) {
    if (plat.oscAmp > 0) {
      plat.y = plat.baseY + Math.sin(state.time * plat.oscFreq) * plat.oscAmp;
    }
  }

  for (const hz of state.polarHazards) {
    hz.angle += hz.speed * dt;
    hz.x = hz.cx + Math.cos(hz.angle) * hz.orbitR;
    hz.y = hz.cy + Math.sin(hz.angle) * hz.orbitR;
  }

  if (state.mode === 'play') {
    p.invulnTimer = Math.max(0, p.invulnTimer - dt);
    p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    if (p.dashCooldown <= 0) p.jumpsLeft = 2;
    p.pulseCooldown = Math.max(0, p.pulseCooldown - dt);
    p.aegisCooldown = Math.max(0, p.aegisCooldown - dt);
    p.aegisTimer = Math.max(0, p.aegisTimer - dt);
    p.overdriveCooldown = Math.max(0, p.overdriveCooldown - dt);
    p.energy = Math.min(p.maxEnergy, p.energy + dt * 5.6);

    if (state.stats.comboTimer > 0) {
      state.stats.comboTimer -= dt;
      if (state.stats.comboTimer <= 0) state.stats.combo = 0;
    }

    if (Math.abs(moveVec.x) > 0.12) {
      p.facing = Math.sign(moveVec.x);
    }

    if (aimVec && Math.hypot(aimVec.x, aimVec.y) > 0.16) {
      p.aimAngle = Math.atan2(aimVec.y, aimVec.x);
    } else if (Math.hypot(moveVec.x, moveVec.y) > 0.16) {
      p.aimAngle = Math.atan2(moveVec.y, moveVec.x);
    }

    if (p.dashTimer > 0) {
      p.dashTimer -= dt;
      p.x += p.dashVx * dt;
      p.y += p.dashVy * dt;
    } else {
      const targetVx = moveVec.x * 355;
      const targetVy = moveVec.y * 355;
      p.vx += (targetVx - p.vx) * Math.min(1, dt * 14);
      p.vy += (targetVy - p.vy) * Math.min(1, dt * 14);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    // Keep player inside the Argand Citadel bounds
    p.x = Math.max(70, Math.min(window.SEQ_WORLD.WIDTH - 70, p.x));
    p.y = Math.max(70, Math.min(window.SEQ_WORLD.HEIGHT - 70, p.y));

    // Check Polar Hazard Orbs around unbroken Seals
    for (let i = 0; i < state.polarHazards.length; i++) {
      if (state.gates[i] && state.gates[i].broken) continue;
      const hz = state.polarHazards[i];
      if (Math.hypot(hz.x - p.x, hz.y - p.y) <= p.radius + hz.radius) {
        if (p.invulnTimer <= 0 && p.aegisTimer <= 0) {
          applyPlayerHit(state, 11, 'اصطدام بالحاجز القطبي!');
        }
      }
    }

    // Collect Orbs
    for (let i = state.orbs.length - 1; i >= 0; i--) {
      const o = state.orbs[i];
      if (Math.hypot(o.x - p.x, o.y - p.y) <= p.radius + o.radius + 10) {
        if (o.kind === 'hp') {
          p.hp = Math.min(p.maxHp, p.hp + 25);
          window.addSeqFloatText(state, p.x, p.y - 24, '+25 معيار |z|', '#fbbf24', 1.0);
        } else {
          p.energy = Math.min(p.maxEnergy, p.energy + 35);
          window.addSeqFloatText(state, p.x, p.y - 24, '+35% طاقة أولير', '#c084fc', 1.0);
        }
        window.SeqAudio?.playUiTick?.();
        state.orbs.splice(i, 1);
      }
    }

    // Spawner
    state.spawnTimer -= dt;
    const cap = state.bossSpawned ? 7 : 5 + state.stats.brokenGates;
    if (state.spawnTimer <= 0 && state.drones.length < cap) {
      window.spawnSeqDrone(state);
      state.spawnTimer = Math.max(1.5, 3.0 - state.stats.brokenGates * 0.35);
    }
  }

  // Player Affix Bolts
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const b = state.projectiles[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    let rm = b.life <= 0 || b.x < 10 || b.x > window.SEQ_WORLD.WIDTH - 10 || b.y < 10 || b.y > window.SEQ_WORLD.HEIGHT - 10;
    if (!rm) {
      for (let j = state.drones.length - 1; j >= 0; j--) {
        const d = state.drones[j];
        if (Math.hypot(d.x - b.x, d.y - b.y) <= d.radius + 9) {
          window.damageSeqDrone(state, d, b.dmg, false);
          rm = true;
          break;
        }
      }
    }
    if (rm) state.projectiles.splice(i, 1);
  }

  // Enemy Projectiles (destroyed by Roots of Unity Shield!)
  for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
    const ep = state.enemyProjectiles[i];
    ep.x += ep.vx * dt;
    ep.y += ep.vy * dt;
    ep.life -= dt;
    let rm = ep.life <= 0;
    const distP = Math.hypot(ep.x - p.x, ep.y - p.y);
    if (!rm && p.aegisTimer > 0 && distP <= 56) {
      window.spawnSeqParticles(state, ep.x, ep.y, 5, '#34d399', 120);
      rm = true;
    } else if (!rm && distP <= p.radius + 8 && p.invulnTimer <= 0 && p.aegisTimer <= 0 && state.mode === 'play') {
      applyPlayerHit(state, 12, '-12 |z|');
      rm = true;
    }
    if (rm) state.enemyProjectiles.splice(i, 1);
  }

  // Drones AI
  const slowMul = p.aegisTimer > 0 ? 0.45 : 1.0;
  for (const d of state.drones) {
    d.hitFlash = Math.max(0, d.hitFlash - dt);
    d.phase += rawDt * 4.2;
    const dx = p.x - d.x;
    const dy = p.y - d.y;
    const dist = Math.hypot(dx, dy);

    if (state.mode === 'play' && dist > 1) {
      const spd = (d.staggered ? d.speed * 0.25 : d.speed) * slowMul;
      const baseAng = Math.atan2(dy, dx);
      const moveAng = d.kind === 'oscillator' ? baseAng + Math.sin(d.phase) * 0.65 : baseAng;
      d.x = Math.max(70, Math.min(window.SEQ_WORLD.WIDTH - 70, d.x + Math.cos(moveAng) * spd * dt));
      d.y = Math.max(70, Math.min(window.SEQ_WORLD.HEIGHT - 70, d.y + Math.sin(moveAng) * spd * dt));

      if (d.kind === 'gendarme' || d.kind === 'boss') {
        d.shootTimer -= dt;
        if (d.shootTimer <= 0) {
          d.shootTimer = d.kind === 'boss' ? 1.5 : 2.2;
          const offsets = d.kind === 'boss' ? [-0.28, 0, 0.28] : [-0.15, 0.15];
          for (const off of offsets) {
            state.enemyProjectiles.push({
              x: d.x, y: d.y,
              vx: Math.cos(baseAng + off) * 330,
              vy: Math.sin(baseAng + off) * 330,
              life: 2.5
            });
          }
        }
      }

      if (p.aegisTimer > 0 && dist <= 58 + d.radius) {
        window.damageSeqDrone(state, d, 32 * dt, false);
      } else if (!d.staggered && dist <= p.radius + d.radius + 3 && p.invulnTimer <= 0 && p.aegisTimer <= 0) {
        applyPlayerHit(state, d.dmg, `-${d.dmg} |z|`);
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
