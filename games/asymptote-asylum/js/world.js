/**
 * Asymptote Asylum - World Simulation, Gore Decals, Victims, Seals & Boss Engine
 * Designed for locked 60 FPS on integrated GPUs with ring-capped decals & particles.
 */

window.WORLD_CONFIG = {
  WIDTH: 1920,
  HEIGHT: 1280,
  MAX_DECALS: 165,
  MAX_PARTICLES: 145
};

window.createInitialAsylumState = function(topicFilter = 'all') {
  const W = window.WORLD_CONFIG.WIDTH;
  const H = window.WORLD_CONFIG.HEIGHT;

  // Strategic morgue walls/pillars creating spooky sightlines without snagging player
  const pillars = [
    { x: 640, y: 420, w: 96, h: 170 },
    { x: 1184, y: 420, w: 96, h: 170 },
    { x: 640, y: 710, w: 96, h: 170 },
    { x: 1184, y: 710, w: 96, h: 170 },
    { x: 900, y: 200, w: 120, h: 90 },
    { x: 900, y: 990, w: 120, h: 90 },
    { x: 250, y: 580, w: 110, h: 120 },
    { x: 1560, y: 580, w: 110, h: 120 }
  ];

  const wards = window.ASYLUM_WARDS || [];
  const sealCoords = [
    { x: 410, y: 270 },
    { x: 1510, y: 270 },
    { x: 1510, y: 1010 },
    { x: 410, y: 1010 }
  ];

  const seals = sealCoords.map((pos, idx) => {
    const ward = wards[idx] || { id: idx + 1, name: `الختم ${idx + 1}`, topics: [23 + idx], sealColor: '#ef4444' };
    return {
      id: idx,
      x: pos.x,
      y: pos.y,
      radius: 42,
      wardName: ward.name,
      topics: ward.topics,
      color: ward.sealColor,
      broken: false,
      pulse: idx * 1.4
    };
  });

  // Shackled captives in blood cages — core "الغاية تبرر الوسيلة" sacrifice targets
  const captiveCoords = [
    { x: 560, y: 260, label: 'سجين #07' },
    { x: 1360, y: 260, label: 'سجين #14' },
    { x: 960, y: 470, label: 'مريض معزول' },
    { x: 560, y: 1020, label: 'سجين #23' },
    { x: 1360, y: 1020, label: 'سجين #38' },
    { x: 960, y: 810, label: 'حارس مصاب' }
  ];

  const captives = captiveCoords.map((c, idx) => ({
    id: idx,
    x: c.x,
    y: c.y,
    radius: 20,
    label: c.label,
    alive: true,
    shiverPhase: Math.random() * Math.PI * 2
  }));

  // Initial ambient floor blood puddles & scratches so asylum looks gruesome right on spawn
  const decals = [];
  for (let i = 0; i < 28; i++) {
    decals.push({
      kind: i % 5 === 0 ? 'bones' : 'blood',
      x: 220 + Math.random() * (W - 440),
      y: 180 + Math.random() * (H - 360),
      r: 14 + Math.random() * 28,
      rot: Math.random() * Math.PI * 2,
      alpha: 0.36 + Math.random() * 0.35
    });
  }

  return {
    mode: 'intro', // 'intro' | 'play' | 'ritual' | 'pause' | 'end'
    topicFilter,   // 'all' | 'sectionA' | 'sectionB'
    time: 0,
    worldTimeScale: 1,
    screenShake: 0,
    damageFlash: 0,
    jumpscareTimer: 0,
    heartbeatTimer: 0,
    bannerText: 'جناح المشرحة — حطّم الأختام الأربعة',
    bannerTimer: 4.5,

    player: {
      x: W / 2,
      y: H / 2,
      vx: 0,
      vy: 0,
      radius: 19,
      aimAngle: -Math.PI / 2,
      hp: 100,
      maxHp: 100,
      sanity: 100,
      maxSanity: 100,
      speed: 285,
      invulnTimer: 0,
      dashTimer: 0,
      dashCooldown: 0,
      dashVx: 0,
      dashVy: 0,
      slashCooldown: 0,
      slashAnim: 0,
      boltCooldown: 0,
      flareCooldown: 0,
      flareTimer: 0,
      sacrificeCooldown: 0,
      frenzyTimer: 0
    },

    pillars,
    seals,
    captives,
    enemies: [],
    projectiles: [],
    enemyProjectiles: [],
    pickups: [
      { id: 1, kind: 'blood', x: 760, y: 640, radius: 13 },
      { id: 2, kind: 'battery', x: 1160, y: 640, radius: 13 },
      { id: 3, kind: 'blood', x: 960, y: 340, radius: 13 },
      { id: 4, kind: 'battery', x: 960, y: 940, radius: 13 }
    ],
    decals,
    particles: [],
    floatingTexts: [],

    spawnTimer: 1.4,
    nextEnemyId: 1,
    bossSpawned: false,
    bossDefeated: false,

    stats: {
      brokenSeals: 0,
      kills: 0,
      combo: 0,
      comboTimer: 0,
      sacrifices: 0,
      questionsAnswered: 0,
      questionsCorrect: 0,
      score: 0
    },

    recentQuestionIds: [],
    activeRitual: null
  };
};

window.addBloodDecal = function(state, x, y, r = 24, kind = 'blood') {
  const decals = state.decals;
  decals.push({
    kind,
    x,
    y,
    r,
    rot: Math.random() * Math.PI * 2,
    alpha: kind === 'bones' ? 0.72 : 0.45 + Math.random() * 0.35
  });
  if (decals.length > window.WORLD_CONFIG.MAX_DECALS) {
    decals.shift();
  }
};

window.spawnGoreParticles = function(state, x, y, count = 12, color = '#dc2626', speedMax = 240) {
  const parts = state.particles;
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 45 + Math.random() * speedMax;
    parts.push({
      x,
      y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      size: 2.2 + Math.random() * 4.5,
      life: 0.35 + Math.random() * 0.45,
      maxLife: 0.8,
      color
    });
  }
  while (parts.length > window.WORLD_CONFIG.MAX_PARTICLES) {
    parts.shift();
  }
};

window.addFloatingText = function(state, x, y, text, color = '#fca5a5', life = 1.15) {
  state.floatingTexts.push({ x, y, text, color, life, maxLife: life });
  if (state.floatingTexts.length > 26) state.floatingTexts.shift();
};

window.setWardBanner = function(state, text, dur = 3.2) {
  state.bannerText = text;
  state.bannerTimer = dur;
};

function resolveCircleRect(ent, rect) {
  const closestX = Math.max(rect.x, Math.min(ent.x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(ent.y, rect.y + rect.h));
  const dx = ent.x - closestX;
  const dy = ent.y - closestY;
  const distSq = dx * dx + dy * dy;
  const rad = ent.radius;
  if (distSq >= rad * rad) return;

  if (distSq > 0.0001) {
    const dist = Math.sqrt(distSq);
    const push = rad - dist;
    ent.x += (dx / dist) * push;
    ent.y += (dy / dist) * push;
  } else {
    // Inside rect fallback
    const left = Math.abs(ent.x - rect.x);
    const right = Math.abs(rect.x + rect.w - ent.x);
    const top = Math.abs(ent.y - rect.y);
    const bottom = Math.abs(rect.y + rect.h - ent.y);
    const m = Math.min(left, right, top, bottom);
    if (m === left) ent.x = rect.x - rad;
    else if (m === right) ent.x = rect.x + rect.w + rad;
    else if (m === top) ent.y = rect.y - rad;
    else ent.y = rect.y + rect.h + rad;
  }
}

function clampToAsylum(ent) {
  const pad = ent.radius + 26;
  ent.x = Math.max(pad, Math.min(window.WORLD_CONFIG.WIDTH - pad, ent.x));
  ent.y = Math.max(pad, Math.min(window.WORLD_CONFIG.HEIGHT - pad, ent.y));
}

window.spawnAsylumEnemy = function(state, forceType = null) {
  const p = state.player;
  const broken = state.stats.brokenSeals;

  // Spawn off-flashlight edge around player within world bounds
  let sx = p.x;
  let sy = p.y;
  for (let tries = 0; tries < 8; tries++) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 460 + Math.random() * 240;
    const tx = Math.max(80, Math.min(window.WORLD_CONFIG.WIDTH - 80, p.x + Math.cos(ang) * dist));
    const ty = Math.max(80, Math.min(window.WORLD_CONFIG.HEIGHT - 80, p.y + Math.sin(ang) * dist));
    if (Math.hypot(tx - p.x, ty - p.y) > 360) {
      sx = tx;
      sy = ty;
      break;
    }
  }

  let kind = forceType;
  if (!kind) {
    const roll = Math.random();
    if (roll < 0.55) kind = 'stalker';
    else if (roll < 0.82) kind = 'wisp';
    else kind = 'butcher';
  }

  const scale = 1 + broken * 0.16;
  let radius = 19;
  let hp = Math.round(52 * scale);
  let speed = 168 + broken * 8;
  let dmg = 14 + broken * 2;
  let name = 'زاحف المشتقة';

  if (kind === 'butcher') {
    radius = 27;
    hp = Math.round(115 * scale);
    speed = 112 + broken * 5;
    dmg = 22 + broken * 3;
    name = 'جزّار المشرحة';
  } else if (kind === 'wisp') {
    radius = 17;
    hp = Math.round(38 * scale);
    speed = 195 + broken * 9;
    dmg = 11 + broken * 2;
    name = 'طيف المماس';
  } else if (kind === 'boss') {
    radius = 44;
    hp = 460;
    speed = 148;
    dmg = 26;
    name = 'شبح المقارب اللانهائي';
  }

  state.enemies.push({
    id: state.nextEnemyId++,
    kind,
    name,
    x: sx,
    y: sy,
    radius,
    hp,
    maxHp: hp,
    speed,
    dmg,
    hitFlash: 0,
    staggered: false,
    shootTimer: kind === 'boss' ? 1.8 : 99,
    twitchPhase: Math.random() * Math.PI * 2
  });
};

window.spawnBossFiend = function(state) {
  if (state.bossSpawned) return;
  state.bossSpawned = true;
  window.spawnAsylumEnemy(state, 'boss');
  state.screenShake = Math.max(state.screenShake, 18);
  state.jumpscareTimer = 0.45;
  window.HorrorAudio?.playJumpscare?.();
  window.setWardBanner(state, '⚠ تحطمت الأختام الأربعة — شبح المقارب اللانهائي يطاردك!', 5.0);
  window.addFloatingText(state, state.player.x, state.player.y - 46, 'BOSS: شبح المقارب اللانهائي!', '#ef4444', 2.4);
};

window.damageEnemy = function(state, enemy, dmg, knockAngle, forceExecution = false) {
  enemy.hp -= dmg;
  enemy.hitFlash = 0.16;
  const kForce = enemy.kind === 'boss' ? 14 : 34;
  enemy.x += Math.cos(knockAngle) * kForce;
  enemy.y += Math.sin(knockAngle) * kForce;
  window.spawnGoreParticles(state, enemy.x, enemy.y, 10, '#dc2626', 210);
  window.addBloodDecal(state, enemy.x, enemy.y, 14 + Math.random() * 14, 'blood');

  // Check stagger threshold for Execution ritual opportunity!
  if (!enemy.staggered && enemy.hp > 0 && enemy.hp <= enemy.maxHp * 0.42 && (enemy.kind === 'butcher' || enemy.kind === 'boss')) {
    enemy.staggered = true;
    window.addFloatingText(state, enemy.x, enemy.y - enemy.radius - 12, 'مشلول! [✕/▢] للإعدام', '#fbbf24', 1.6);
  }

  if (enemy.hp <= 0 || forceExecution) {
    window.killEnemy(state, enemy, forceExecution);
    return true;
  }
  return false;
};

window.killEnemy = function(state, enemy, wasExecuted = false) {
  const idx = state.enemies.indexOf(enemy);
  if (idx !== -1) state.enemies.splice(idx, 1);

  state.stats.kills++;
  state.stats.combo++;
  state.stats.comboTimer = 4.2;
  const mult = Math.min(5, 1 + Math.floor(state.stats.combo / 3));
  const basePts = enemy.kind === 'boss' ? 1200 : enemy.kind === 'butcher' ? 180 : 90;
  state.stats.score += basePts * mult * (wasExecuted ? 2 : 1);

  window.addBloodDecal(state, enemy.x, enemy.y, enemy.kind === 'boss' ? 58 : 28, 'blood');
  window.addBloodDecal(state, enemy.x + 8, enemy.y - 6, enemy.radius * 0.8, 'bones');
  window.spawnGoreParticles(state, enemy.x, enemy.y, wasExecuted ? 26 : 16, '#ef4444', 300);
  window.spawnGoreParticles(state, enemy.x, enemy.y, 6, '#e5e7eb', 160); // bone splinters

  if (wasExecuted) {
    state.screenShake = Math.max(state.screenShake, 12);
    window.HorrorAudio?.playExecuteGore?.();
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 15);
    state.player.sanity = Math.min(state.player.maxSanity, state.player.sanity + 20);
    window.addFloatingText(state, enemy.x, enemy.y - 26, 'إعدام دموي +15 دم!', '#34d399', 1.4);
  } else {
    window.addFloatingText(state, enemy.x, enemy.y - 18, `تمزيق +${basePts}`, '#fca5a5', 0.9);
  }

  // Drop pickups cleanly
  if (enemy.kind !== 'boss' && Math.random() < 0.36) {
    state.pickups.push({
      id: Date.now() + Math.random(),
      kind: Math.random() < 0.58 ? 'blood' : 'battery',
      x: enemy.x,
      y: enemy.y,
      radius: 13
    });
  }

  if (enemy.kind === 'boss') {
    state.bossDefeated = true;
    window.HorrorAudio?.playSealBreak?.();
    window.triggerVictoryOrDeath(state, true);
  }
};

window.performSlashAttack = function(state) {
  const p = state.player;
  if (p.slashCooldown > 0) return false;

  // Priority: check if an adjacent staggered Butcher/Boss is within execution distance!
  const execTarget = state.enemies.find(e => e.staggered && Math.hypot(e.x - p.x, e.y - p.y) < 105);
  if (execTarget) {
    window.openRitualChallenge(state, { kind: 'execute', enemy: execTarget });
    return true;
  }

  p.slashCooldown = p.frenzyTimer > 0 ? 0.22 : 0.34;
  p.slashAnim = 0.22;
  window.HorrorAudio?.playSlash?.();

  const range = 104;
  const dmg = p.frenzyTimer > 0 ? 78 : 42;
  let hitAny = false;

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    const dx = e.x - p.x;
    const dy = e.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= range + e.radius) {
      let diff = Math.atan2(dy, dx) - p.aimAngle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      if (Math.abs(diff) <= 1.25 || dist < 42) {
        hitAny = true;
        window.damageEnemy(state, e, dmg, Math.atan2(dy, dx), false);
      }
    }
  }

  if (hitAny) {
    state.screenShake = Math.max(state.screenShake, 5);
    window.triggerGamepadHaptic?.(55, 0.4, 0.55);
  }
  return true;
};

window.performBloodDash = function(state, moveX, moveY) {
  const p = state.player;
  if (p.dashCooldown > 0) return false;
  let dx = moveX;
  let dy = moveY;
  if (Math.hypot(dx, dy) < 0.2) {
    dx = Math.cos(p.aimAngle);
    dy = Math.sin(p.aimAngle);
  } else {
    const mag = Math.hypot(dx, dy);
    dx /= mag;
    dy /= mag;
  }
  p.dashTimer = 0.19;
  p.dashCooldown = 1.05;
  p.invulnTimer = Math.max(p.invulnTimer, 0.32);
  p.dashVx = dx * 760;
  p.dashVy = dy * 760;
  window.HorrorAudio?.playDash?.();
  window.addBloodDecal(state, p.x, p.y, 18, 'blood');
  window.spawnGoreParticles(state, p.x, p.y, 10, '#991b1b', 140);
  return true;
};

window.performBloodBolt = function(state) {
  const p = state.player;
  if (p.boltCooldown > 0) return false;
  p.boltCooldown = p.frenzyTimer > 0 ? 0.16 : 0.26;
  const spd = 680;
  state.projectiles.push({
    x: p.x + Math.cos(p.aimAngle) * 20,
    y: p.y + Math.sin(p.aimAngle) * 20,
    vx: Math.cos(p.aimAngle) * spd,
    vy: Math.sin(p.aimAngle) * spd,
    dmg: p.frenzyTimer > 0 ? 54 : 30,
    life: 1.15
  });
  window.HorrorAudio?.playBolt?.();
  return true;
};

window.performFlare = function(state) {
  const p = state.player;
  if (p.flareCooldown > 0) return false;
  p.flareCooldown = 5.5;
  p.flareTimer = 3.5;
  p.sanity = Math.min(p.maxSanity, p.sanity + 35);
  window.HorrorAudio?.playFlare?.();
  window.spawnGoreParticles(state, p.x, p.y, 20, '#34d399', 260);
  window.addFloatingText(state, p.x, p.y - 34, 'شعلة UV كاشفة — تبطيء الوحوش!', '#34d399', 1.5);
  return true;
};

/**
 * Core Dark Mechanic: "الغاية تبرر الوسيلة" (The End Justifies the Means)
 * - Near a live captive (<135px): violently sacrifice the captive for +35 HP, +50 Sanity, Blood Frenzy, and a massive Blood Nova!
 * - Otherwise: sacrifice 20 self HP (if hp > 20) to erupt a Crimson Blood Nova and enter Blood Frenzy!
 */
window.performForbiddenSacrificeWorld = function(state) {
  const p = state.player;
  if (p.sacrificeCooldown > 0) return false;

  const captive = state.captives.find(c => c.alive && Math.hypot(c.x - p.x, c.y - p.y) <= 135);
  if (!captive && p.hp <= 22) {
    window.addFloatingText(state, p.x, p.y - 26, 'الدم غير كافٍ للتضحية!', '#fbbf24', 1.1);
    return false;
  }

  p.sacrificeCooldown = 3.0;
  state.stats.sacrifices++;
  window.HorrorAudio?.playSacrifice?.();
  window.triggerGamepadHaptic?.(160, 0.8, 0.9);
  state.screenShake = Math.max(state.screenShake, 16);

  if (captive) {
    captive.alive = false;
    p.hp = Math.min(p.maxHp, p.hp + 35);
    p.sanity = Math.min(p.maxSanity, p.sanity + 50);
    p.frenzyTimer = 7.0;
    window.addBloodDecal(state, captive.x, captive.y, 50, 'blood');
    window.addBloodDecal(state, captive.x, captive.y, 24, 'bones');
    window.spawnGoreParticles(state, captive.x, captive.y, 34, '#ef4444', 340);
    window.addFloatingText(state, captive.x, captive.y - 28, 'قربان «الغاية تبرر الوسيلة» +35 دم!', '#f87171', 2.0);
  } else {
    p.hp -= 20;
    p.sanity = Math.min(p.maxSanity, p.sanity + 30);
    p.frenzyTimer = 5.0;
    window.addBloodDecal(state, p.x, p.y, 44, 'blood');
    window.spawnGoreParticles(state, p.x, p.y, 28, '#dc2626', 320);
    window.addFloatingText(state, p.x, p.y - 28, 'نزيف محرّم -20 دم ➔ هيجان الدم!', '#f87171', 1.8);
  }

  // Obliterate / blast nearby enemies in a lethal Blood Nova
  const blastRadius = 330;
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    const dist = Math.hypot(e.x - p.x, e.y - p.y);
    if (dist <= blastRadius) {
      const ang = Math.atan2(e.y - p.y, e.x - p.x);
      window.damageEnemy(state, e, 110, ang, e.kind !== 'boss');
    }
  }
  return true;
};

window.findNearestInteractable = function(state) {
  const p = state.player;
  // 1. Staggered enemy ready for Ritual Execution
  for (const e of state.enemies) {
    if (e.staggered && Math.hypot(e.x - p.x, e.y - p.y) <= 115) {
      return { kind: 'execute', enemy: e };
    }
  }
  // 2. Intact Seal Altar
  for (const s of state.seals) {
    if (!s.broken && Math.hypot(s.x - p.x, s.y - p.y) <= 110) {
      return { kind: 'seal', seal: s };
    }
  }
  return null;
};

window.updateAsylumWorld = function(state, rawDt, moveVec, aimVec) {
  if (state.mode !== 'play' && state.mode !== 'ritual') return;

  // Extreme horror slow-motion during Ritual Math Solving so monsters crawl dreadfully!
  state.worldTimeScale = state.mode === 'ritual' ? 0.035 : 1.0;
  const dt = rawDt * state.worldTimeScale;
  state.time += rawDt;

  const p = state.player;

  // Timers decay in play time
  if (state.bannerTimer > 0) state.bannerTimer = Math.max(0, state.bannerTimer - rawDt);
  if (state.damageFlash > 0) state.damageFlash = Math.max(0, state.damageFlash - rawDt * 2.4);
  if (state.jumpscareTimer > 0) state.jumpscareTimer = Math.max(0, state.jumpscareTimer - rawDt);
  if (state.screenShake > 0) state.screenShake = Math.max(0, state.screenShake - rawDt * 38);

  if (state.mode === 'play') {
    p.invulnTimer = Math.max(0, p.invulnTimer - dt);
    p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    p.slashCooldown = Math.max(0, p.slashCooldown - dt);
    p.slashAnim = Math.max(0, p.slashAnim - dt);
    p.boltCooldown = Math.max(0, p.boltCooldown - dt);
    p.flareCooldown = Math.max(0, p.flareCooldown - dt);
    p.flareTimer = Math.max(0, p.flareTimer - dt);
    p.sacrificeCooldown = Math.max(0, p.sacrificeCooldown - dt);
    p.frenzyTimer = Math.max(0, p.frenzyTimer - dt);

    if (state.stats.comboTimer > 0) {
      state.stats.comboTimer -= dt;
      if (state.stats.comboTimer <= 0) state.stats.combo = 0;
    }

    // Flashlight sanity gentle drain & slow regen when UV flare active
    p.sanity = Math.max(8, Math.min(p.maxSanity, p.sanity - dt * 1.1));

    // Aim angle
    if (aimVec && Math.hypot(aimVec.x, aimVec.y) > 0.15) {
      p.aimAngle = Math.atan2(aimVec.y, aimVec.x);
    } else if (Math.hypot(moveVec.x, moveVec.y) > 0.25) {
      p.aimAngle = Math.atan2(moveVec.y, moveVec.x);
    }

    // Player movement
    if (p.dashTimer > 0) {
      p.dashTimer -= dt;
      p.x += p.dashVx * dt;
      p.y += p.dashVy * dt;
      if (Math.random() < 0.5) window.addBloodDecal(state, p.x, p.y, 10, 'blood');
    } else {
      const spd = p.speed * (p.frenzyTimer > 0 ? 1.25 : 1.0);
      p.x += moveVec.x * spd * dt;
      p.y += moveVec.y * spd * dt;
    }
    for (const pil of state.pillars) resolveCircleRect(p, pil);
    clampToAsylum(p);

    // Pickup collection
    for (let i = state.pickups.length - 1; i >= 0; i--) {
      const pk = state.pickups[i];
      if (Math.hypot(pk.x - p.x, pk.y - p.y) <= p.radius + pk.radius + 10) {
        if (pk.kind === 'blood') {
          p.hp = Math.min(p.maxHp, p.hp + 22);
          window.addFloatingText(state, p.x, p.y - 24, '+22 دم', '#f87171', 1.0);
        } else {
          p.sanity = Math.min(p.maxSanity, p.sanity + 32);
          window.addFloatingText(state, p.x, p.y - 24, '+32% مصباح', '#34d399', 1.0);
        }
        window.HorrorAudio?.playUiTick?.();
        state.pickups.splice(i, 1);
      }
    }

    // Spawner (cap max simultaneous enemies at 11 for buttery 60FPS even on weak CPUs)
    state.spawnTimer -= dt;
    const cap = state.bossSpawned ? 8 : 7 + state.stats.brokenSeals;
    if (state.spawnTimer <= 0 && state.enemies.length < cap) {
      window.spawnAsylumEnemy(state);
      state.spawnTimer = Math.max(1.3, 3.0 - state.stats.brokenSeals * 0.38);
    }
  }

  // Update player blood bolts
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const b = state.projectiles[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    let removed = b.life <= 0 || b.x < 24 || b.x > window.WORLD_CONFIG.WIDTH - 24 || b.y < 24 || b.y > window.WORLD_CONFIG.HEIGHT - 24;

    if (!removed) {
      for (const pil of state.pillars) {
        if (b.x >= pil.x && b.x <= pil.x + pil.w && b.y >= pil.y && b.y <= pil.y + pil.h) {
          removed = true;
          break;
        }
      }
    }
    if (!removed) {
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const e = state.enemies[j];
        if (Math.hypot(e.x - b.x, e.y - b.y) <= e.radius + 7) {
          window.damageEnemy(state, e, b.dmg, Math.atan2(b.vy, b.vx), false);
          removed = true;
          break;
        }
      }
    }
    if (removed) state.projectiles.splice(i, 1);
  }

  // Update boss crimson orbs
  for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
    const ep = state.enemyProjectiles[i];
    ep.x += ep.vx * dt;
    ep.y += ep.vy * dt;
    ep.life -= dt;
    let rm = ep.life <= 0;
    if (!rm && Math.hypot(ep.x - p.x, ep.y - p.y) <= p.radius + 8 && p.invulnTimer <= 0 && state.mode === 'play') {
      p.hp = Math.max(0, p.hp - 14);
      p.invulnTimer = 0.65;
      state.damageFlash = 1.0;
      state.screenShake = Math.max(state.screenShake, 10);
      window.HorrorAudio?.playDamage?.();
      rm = true;
      if (p.hp <= 0) window.triggerVictoryOrDeath(state, false);
    }
    if (rm) state.enemyProjectiles.splice(i, 1);
  }

  // Update enemies & measure closest threat for heartbeat horror
  let nearestEnemyDist = 9999;
  const enemySlowFactor = p.flareTimer > 0 ? 0.42 : 1.0;

  for (const e of state.enemies) {
    e.hitFlash = Math.max(0, e.hitFlash - dt);
    e.twitchPhase += rawDt * 7.5;
    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const dist = Math.hypot(dx, dy);
    nearestEnemyDist = Math.min(nearestEnemyDist, dist);

    if (state.mode === 'play' && dist > 1) {
      const spd = (e.staggered ? e.speed * 0.25 : e.speed) * enemySlowFactor;
      e.x += (dx / dist) * spd * dt;
      e.y += (dy / dist) * spd * dt;
      for (const pil of state.pillars) resolveCircleRect(e, pil);
      clampToAsylum(e);

      // Boss ranged blood volley
      if (e.kind === 'boss') {
        e.shootTimer -= dt;
        if (e.shootTimer <= 0) {
          e.shootTimer = e.staggered ? 2.6 : 1.7;
          const baseAng = Math.atan2(dy, dx);
          for (const off of [-0.22, 0, 0.22]) {
            state.enemyProjectiles.push({
              x: e.x,
              y: e.y,
              vx: Math.cos(baseAng + off) * 320,
              vy: Math.sin(baseAng + off) * 320,
              life: 2.2
            });
          }
        }
      }

      // Melee bite damage
      if (!e.staggered && dist <= p.radius + e.radius + 3 && p.invulnTimer <= 0) {
        p.hp = Math.max(0, p.hp - e.dmg);
        p.sanity = Math.max(6, p.sanity - 8);
        p.invulnTimer = 0.72;
        state.damageFlash = 1.0;
        state.screenShake = Math.max(state.screenShake, 12);
        window.HorrorAudio?.playDamage?.();
        window.triggerGamepadHaptic?.(120, 0.7, 0.8);
        window.addBloodDecal(state, p.x, p.y, 22, 'blood');
        window.spawnGoreParticles(state, p.x, p.y, 12, '#ef4444', 200);
        if (p.hp <= 0) {
          window.triggerVictoryOrDeath(state, false);
          return;
        }
      }
    }
  }

  // Dynamic Horror Heartbeat Audio when monster approaches or HP low
  const threatFactor = Math.max(nearestEnemyDist < 340 ? (340 - nearestEnemyDist) / 340 : 0, p.hp < 40 ? (40 - p.hp) / 40 : 0);
  if (threatFactor > 0.15) {
    state.heartbeatTimer -= rawDt;
    if (state.heartbeatTimer <= 0) {
      window.HorrorAudio?.playHeartbeat?.(threatFactor);
      state.heartbeatTimer = Math.max(0.45, 1.15 - threatFactor * 0.65);
    }
  }

  // Seal rings pulse
  for (const s of state.seals) s.pulse += rawDt * 2.4;

  // Gore particles update
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const pt = state.particles[i];
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vx *= 0.92;
    pt.vy *= 0.92;
    pt.life -= rawDt;
    if (pt.life <= 0) state.particles.splice(i, 1);
  }

  // Floating text popups
  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const ft = state.floatingTexts[i];
    ft.y -= 26 * rawDt;
    ft.life -= rawDt;
    if (ft.life <= 0) state.floatingTexts.splice(i, 1);
  }
};
