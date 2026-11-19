/**
 * Vector Odyssey (أوديسا الفضاء المتجهي) - 2.5D Starfighter Trench & Sphere Raid Simulation
 * Space Sector Dimensions: 2600 x 1700 across 4 Orbital Sectors (α, β, γ, δ) + HyperSphere Core.
 * Features 360° 6DOF starfighter thrust, parallax 3D wireframe polyhedra, orbital guard mines,
 * 3 enemy archetypes with stagger/execute, 6 PlayStation abilities, and 3-Phase HyperSphere Boss.
 */

window.ODYSSEY_WORLD = {
  WIDTH: 2600,
  HEIGHT: 1700,
  MAX_SPEED: 430,
  ACCEL: 1450,
  DRAG: 3.4,
  MAX_PARTICLES: 175
};

window.createInitialOdysseyState = function(topicFilter = 'all') {
  const sectors = window.ODYSSEY_SECTORS || [];

  // 2.5D Parallax Wireframe Polyhedra & Spatial Landmarks (rendered with depth perspective!)
  const landmarks3D = [
    { x: 650, y: 425, z: 140, size: 75, color: 'rgba(56, 189, 248, 0.24)', rotSpeed: 0.45, kind: 'octa' },
    { x: 1950, y: 425, z: 160, size: 80, color: 'rgba(34, 211, 238, 0.24)', rotSpeed: -0.5, kind: 'cube' },
    { x: 650, y: 1275, z: 150, size: 84, color: 'rgba(129, 140, 248, 0.24)', rotSpeed: 0.38, kind: 'sphere' },
    { x: 1950, y: 1275, z: 155, size: 82, color: 'rgba(251, 191, 36, 0.22)', rotSpeed: -0.42, kind: 'tetra' },
    { x: 1300, y: 850, z: 180, size: 110, color: 'rgba(168, 85, 247, 0.22)', rotSpeed: 0.3, kind: 'sphere' }
  ];

  // Trench Laser Deflector Pylons (tactical spatial cover & hazard lines)
  const trenchBarriers = [
    { x1: 860, y1: 280, x2: 860, y2: 560, label: 'مستوى x = 860' },
    { x1: 1740, y1: 280, x2: 1740, y2: 560, label: 'مستوى x = 1740' },
    { x1: 860, y1: 1140, x2: 860, y2: 1420, label: 'حاجز n⃗' },
    { x1: 1740, y1: 1140, x2: 1740, y2: 1420, label: 'حاجز ℝ³' }
  ];

  // 4 Orbital Sphere Seals (α, β, γ, δ)
  const gatePositions = [
    { x: 380, y: 310, glyph: 'u⃗·v⃗' },
    { x: 2220, y: 310, glyph: 'u⃗∧v⃗' },
    { x: 380, y: 1390, glyph: '(S)∩(P)' },
    { x: 2220, y: 1390, glyph: 'd(Ω,D)' }
  ];

  const gates = gatePositions.map((pos, idx) => {
    const sec = sectors[idx] || { id: idx + 1, name: `القطاع ${idx + 1}`, topics: [91 + idx * 3], color: '#38bdf8' };
    return {
      id: idx,
      x: pos.x,
      y: pos.y,
      glyph: pos.glyph,
      radius: 42,
      sectorName: sec.name,
      topics: sec.topics,
      color: sec.color,
      broken: false,
      pulse: idx * 1.4
    };
  });

  // Orbiting Vector Hazard Mines around each unbroken Seal
  const orbitalHazards = gatePositions.map((pos, idx) => {
    const startAng = idx * 1.5;
    return {
      id: idx,
      cx: pos.x,
      cy: pos.y,
      orbitR: 108,
      angle: startAng,
      speed: (idx % 2 === 0 ? 1 : -1) * 1.65,
      x: pos.x + Math.cos(startAng) * 108,
      y: pos.y + Math.sin(startAng) * 108,
      radius: 14
    };
  });

  // Background Starfield with Z depth for 2.5D parallax
  const stars = [];
  for (let i = 0; i < 130; i++) {
    stars.push({
      x: Math.random() * 2600,
      y: Math.random() * 1700,
      z: 0.25 + Math.random() * 0.75,
      size: 1.0 + Math.random() * 1.9
    });
  }

  // Repair Hull Nodes (HP) & Sphere Flux Nodes (Energy)
  const orbs = [
    { id: 1, x: 960, y: 460, radius: 12, kind: 'energy' },
    { id: 2, x: 1640, y: 460, radius: 12, kind: 'hp' },
    { id: 3, x: 640, y: 850, radius: 12, kind: 'hp' },
    { id: 4, x: 1960, y: 850, radius: 12, kind: 'energy' },
    { id: 5, x: 960, y: 1240, radius: 12, kind: 'energy' },
    { id: 6, x: 1640, y: 1240, radius: 12, kind: 'hp' },
    { id: 7, x: 1300, y: 560, radius: 12, kind: 'hp' },
    { id: 8, x: 1300, y: 1140, radius: 12, kind: 'energy' }
  ];

  const state = {
    mode: 'intro', // 'intro' | 'play' | 'override' | 'pause' | 'end'
    topicFilter,
    time: 0,
    worldTime: 0,
    screenShake: 0,
    damageFlash: 0,
    camera: { x: 1300, y: 850, zoom: 1, shake: 0 },
    bannerText: 'القطاع α — اخترق أختام الفلكة والمستويات الأربعة في الفضاء ℝ³ (91–102)',
    bannerTimer: 4.5,

    player: {
      x: 1300,
      y: 850,
      vx: 0,
      vy: 0,
      radius: 20,
      aimAngle: 0,
      shipAngle: 0,
      hp: 110,
      maxHp: 110,
      energy: 100,
      maxEnergy: 100,
      invulnTimer: 0,
      boostCooldown: 0,
      rollTimer: 0,
      rollCooldown: 0,
      rollVx: 0,
      rollVy: 0,
      pulseCooldown: 0,
      aegisCooldown: 0,
      aegisTimer: 0,
      overdriveCooldown: 0,
      overdriveAnim: 0
    },

    landmarks3D,
    trenchBarriers,
    gates,
    orbitalHazards,
    stars,
    orbs,
    enemies: [],
    projectiles: [],
    enemyProjectiles: [],
    bossBeams: [],
    particles: [],
    floatingTexts: [],

    nextEnemyId: 1,
    spawnTimer: 1.0,
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

  // Seed initial wing squadrons across all 4 orbital quadrants
  window.spawnOdysseyEnemy(state, 'interceptor_vec', 560, 460);
  window.spawnOdysseyEnemy(state, 'turret_plane', 2020, 440);
  window.spawnOdysseyEnemy(state, 'interceptor_vec', 560, 1220);
  window.spawnOdysseyEnemy(state, 'cruiser_sphere', 2040, 1240);

  return state;
};

window.spawnOdysseyParticles = function(state, x, y, count = 12, color = '#38bdf8', maxSpd = 240) {
  const parts = state.particles;
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 45 + Math.random() * maxSpd;
    parts.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      size: 2.0 + Math.random() * 4.0,
      life: 0.3 + Math.random() * 0.4,
      maxLife: 0.7,
      color
    });
  }
  while (parts.length > window.ODYSSEY_WORLD.MAX_PARTICLES) parts.shift();
};

window.addOdysseyFloatText = function(state, x, y, text, color = '#38bdf8', life = 1.2) {
  state.floatingTexts.push({
    x, y, text, color, life, maxLife: life,
    isRtl: /[\u0600-\u06FF]/.test(String(text || ''))
  });
  if (state.floatingTexts.length > 26) state.floatingTexts.shift();
};

window.setOdysseyBanner = function(state, text, dur = 3.2) {
  state.bannerText = text;
  state.bannerTimer = dur;
};

window.spawnOdysseyEnemy = function(state, forceKind = null, forceX = null, forceY = null) {
  const p = state.player;
  const broken = state.stats.brokenGates;
  let kind = forceKind;
  if (!kind) {
    const r = Math.random();
    if (r < 0.44) kind = 'interceptor_vec';
    else if (r < 0.78) kind = 'turret_plane';
    else kind = 'cruiser_sphere';
  }

  let sx = forceX;
  let sy = forceY;
  if (sx === null || sy === null) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 430 + Math.random() * 140;
    sx = Math.max(90, Math.min(window.ODYSSEY_WORLD.WIDTH - 90, p.x + Math.cos(ang) * dist));
    sy = Math.max(120, Math.min(window.ODYSSEY_WORLD.HEIGHT - 120, p.y + Math.sin(ang) * dist));
  }
  if (kind === 'boss') {
    sx = 1300;
    sy = 850;
  }

  const mult = 1 + broken * 0.16;
  const cfg = {
    interceptor_vec: { r: 19, hp: Math.round(46 * mult), speed: 170 + broken * 10, dmg: 12, label: 'u⃗', color: '#22d3ee' },
    turret_plane: { r: 22, hp: Math.round(64 * mult), speed: 94 + broken * 6, dmg: 14, label: 'n⃗⊥P', color: '#818cf8' },
    cruiser_sphere: { r: 27, hp: Math.round(102 * mult), speed: 112 + broken * 7, dmg: 18, label: '(S)', color: '#fbbf24' },
    boss: { r: 56, hp: 680, speed: 130, dmg: 22, label: 'النواة الفلكية العظمى', color: '#a855f7' }
  }[kind];

  const cruiserShield = kind === 'cruiser_sphere' && broken >= 1;
  state.enemies.push({
    id: state.nextEnemyId++,
    kind,
    label: cfg.label,
    isRtl: /[\u0600-\u06FF]/.test(cfg.label),
    color: cfg.color,
    x: sx,
    y: sy,
    vx: 0,
    vy: 0,
    radius: cfg.r,
    hp: cfg.hp,
    maxHp: cfg.hp,
    speed: cfg.speed,
    dmg: cfg.dmg,
    hitFlash: 0,
    staggered: false,
    shieldActive: cruiserShield,
    shieldHp: cruiserShield ? 55 : 0,
    shieldMaxHp: kind === 'boss' ? 150 : 55,
    shieldAngle: Math.random() * Math.PI * 2,
    shieldGapHalf: kind === 'boss' ? 0.48 : 0.72,
    shieldRechargeTimer: 0,
    stunTimer: 0,
    phase: 1,
    shootTimer: kind === 'boss' ? 1.45 : 2.1,
    beamTimer: 0,
    animPhase: Math.random() * Math.PI * 2
  });
};

window.spawnHyperSphereBoss = function(state) {
  if (state.bossSpawned) return state.enemies.find(e => e.kind === 'boss') || null;
  state.bossSpawned = true;
  window.spawnOdysseyEnemy(state, 'boss');
  const boss = state.enemies.find(e => e.kind === 'boss') || null;
  state.screenShake = Math.max(state.screenShake, 16);
  if (state.camera) state.camera.shake = state.screenShake;
  window.OdysseyAudio?.playOverdrive?.();
  window.triggerOdysseyHaptic?.(175, 0.7, 0.92);
  window.setOdysseyBanner(state, '🛸 تحطمت الأختام المدارية الأربعة — النواة الفلكية العظمى استيقظت في المركز!', 5.0);
  window.addOdysseyFloatText(state, state.player.x, state.player.y - 46, 'BOSS: النواة الفلكية (1300, 850)!', '#c084fc', 2.4);
  return boss;
};

window.damageOdysseyEnemy = function(state, enemy, dmg, forceKill = false, ignoreShield = false) {
  if (enemy.shieldActive && !ignoreShield && !forceKill) {
    enemy.shieldHp = Math.max(0, enemy.shieldHp - dmg * 0.65);
    enemy.hitFlash = 0.08;
    window.OdysseyAudio?.playShieldDeflect?.();
    window.spawnOdysseyParticles(state, enemy.x, enemy.y, 5, '#38bdf8', 140);
    if (enemy.shieldHp <= 0) {
      enemy.shieldActive = false;
      enemy.stunTimer = enemy.kind === 'boss' ? 2.6 : 1.5;
      enemy.shieldRechargeTimer = 8.5;
      if (enemy.kind !== 'boss') enemy.staggered = true;
      window.OdysseyAudio?.playAegis?.();
      window.addOdysseyFloatText(
        state,
        enemy.x,
        enemy.y - enemy.radius - 18,
        enemy.kind === 'boss' ? 'انكسر درع المماس مؤقتاً! أطلق [R2]' : 'انكسر درع الفلكة! [▢ / E]',
        '#fde047',
        1.8
      );
    }
    return false;
  }

  enemy.hp -= dmg;
  enemy.hitFlash = 0.14;
  window.spawnOdysseyParticles(state, enemy.x, enemy.y, 8, enemy.color || '#38bdf8', 190);

  // Boss Phase Escalation: Phase 2 (<= 65%) -> Phase 3 (<= 30%)
  if (enemy.kind === 'boss' && enemy.hp > 0) {
    const frac = enemy.hp / enemy.maxHp;
    if (enemy.phase === 1 && frac <= 0.65) {
      enemy.phase = 2;
      enemy.beamTimer = 1.0;
      window.OdysseyAudio?.playBossPhaseShift?.();
      window.triggerOdysseyHaptic?.(135, 0.55, 0.8);
      window.setOdysseyBanner(state, '⚠ الطور 2: أشعة المستويات المنظمية ax + by + c = 0!', 3.8);
      window.addOdysseyFloatText(state, enemy.x, enemy.y - 60, 'الطور 2: حزم المستويات!', '#818cf8', 1.8);
    }
    if (enemy.phase < 3 && frac <= 0.30) {
      enemy.phase = 3;
      enemy.shieldActive = true;
      enemy.shieldHp = enemy.shieldMaxHp;
      enemy.shieldRechargeTimer = 8.5;
      window.OdysseyAudio?.playBossPhaseShift?.();
      window.triggerOdysseyHaptic?.(160, 0.65, 0.9);
      window.setOdysseyBanner(state, '🛸 الطور 3: درع تماس الفلكة d(Ω,P)=R! اصب نقطة التماس H أو استعمل [△] / [L2]!', 4.6);
      window.addOdysseyFloatText(state, enemy.x, enemy.y - 62, 'درع (S) نشط — نقطة التماس H أو [△/L2]!', '#22d3ee', 2.2);
    }
  }

  if (!enemy.staggered && enemy.hp > 0) {
    const canStagger = (enemy.kind === 'cruiser_sphere' && enemy.hp <= enemy.maxHp * 0.38) ||
      (enemy.kind === 'boss' && !enemy.shieldActive && enemy.hp <= enemy.maxHp * 0.18);
    if (canStagger) {
      enemy.staggered = true;
      window.addOdysseyFloatText(state, enemy.x, enemy.y - enemy.radius - 14, 'مشلول! [▢ / E] تفكيك الفلكة', '#fde047', 1.6);
    }
  }

  if (enemy.hp <= 0 || forceKill) {
    const idx = state.enemies.indexOf(enemy);
    if (idx !== -1) state.enemies.splice(idx, 1);

    state.stats.kills++;
    state.stats.combo++;
    state.stats.comboTimer = 4.2;
    if (state.stats.combo >= 2) {
      window.OdysseyAudio?.playComboChime?.(state.stats.combo);
    }
    const mult = Math.min(5, 1 + Math.floor(state.stats.combo / 3));
    const pts = (enemy.kind === 'boss' ? 2000 : enemy.kind === 'cruiser_sphere' ? 190 : 95) * mult;
    state.stats.score += pts;
    state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 15);

    window.spawnOdysseyParticles(state, enemy.x, enemy.y, enemy.kind === 'boss' ? 48 : 16, '#38bdf8', 290);
    window.addOdysseyFloatText(state, enemy.x, enemy.y - 18, `+${pts}`, '#38bdf8', 0.95);

    if (enemy.kind !== 'boss' && state.orbs.length < 14 && Math.random() < 0.38) {
      state.orbs.push({
        id: Date.now() + Math.random(),
        x: enemy.x,
        y: enemy.y,
        radius: 12,
        kind: Math.random() < 0.55 ? 'energy' : 'hp'
      });
    }

    if (enemy.kind === 'boss') {
      state.bossDefeated = true;
      state.bossBeams = [];
      window.OdysseyAudio?.playVictory?.();
      window.triggerOdysseyHaptic?.(220, 0.78, 1.0);
      window.finishOdysseyGame(state, true);
    }
    return true;
  }
  return false;
};

// [✕ / Space]: Normal-Vector Afterburner Boost
window.performOdysseyBoost = function(state, moveVec) {
  const p = state.player;
  if (p.boostCooldown > 0) return false;
  p.boostCooldown = 0.65;
  const ang = Math.hypot(moveVec.x, moveVec.y) > 0.15 ? Math.atan2(moveVec.y, moveVec.x) : p.aimAngle;
  p.vx = Math.cos(ang) * 680;
  p.vy = Math.sin(ang) * 680;
  p.invulnTimer = Math.max(p.invulnTimer, 0.24);
  window.OdysseyAudio?.playBoost?.();
  window.triggerOdysseyHaptic?.(60, 0.35, 0.5);
  window.spawnOdysseyParticles(state, p.x, p.y, 14, '#38bdf8', 210);
  window.addOdysseyFloatText(state, p.x, p.y - 24, 'دفع n⃗', '#7dd3fc', 0.75);
  return true;
};

// [◯ / Shift]: Orthogonal Roll Evasion u⃗ ⊥ v⃗ (barrel roll dash slicing hazards & enemies)
window.performOdysseyRoll = function(state, moveVec) {
  const p = state.player;
  if (p.rollCooldown > 0) return false;
  p.rollCooldown = 0.82;
  p.rollTimer = 0.22;
  p.invulnTimer = Math.max(p.invulnTimer, 0.42);

  const ang = Math.hypot(moveVec.x, moveVec.y) > 0.15 ? Math.atan2(moveVec.y, moveVec.x) : p.aimAngle;
  p.rollVx = Math.cos(ang) * 840;
  p.rollVy = Math.sin(ang) * 840;

  window.OdysseyAudio?.playRollDash?.();
  window.triggerOdysseyHaptic?.(75, 0.42, 0.6);
  window.spawnOdysseyParticles(state, p.x, p.y, 18, '#fb7185', 240);
  window.addOdysseyFloatText(state, p.x, p.y - 26, 'مناورة ⊥', '#fda4af', 0.8);

  for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
    const ep = state.enemyProjectiles[i];
    if (Math.hypot(ep.x - p.x, ep.y - p.y) <= 135) {
      window.spawnOdysseyParticles(state, ep.x, ep.y, 4, '#38bdf8', 110);
      state.enemyProjectiles.splice(i, 1);
    }
  }

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (Math.hypot(e.x - p.x, e.y - p.y) <= 145) {
      window.damageOdysseyEnemy(state, e, 44, false, false);
    }
  }
  return true;
};

// [△ / Q]: Cross-Product Vector Shield u⃗ ∧ v⃗
window.performOdysseyAegis = function(state) {
  const p = state.player;
  if (p.aegisCooldown > 0) return false;
  p.aegisCooldown = 4.6;
  p.aegisTimer = 3.2;
  p.invulnTimer = Math.max(p.invulnTimer, 1.0);
  window.OdysseyAudio?.playAegis?.();
  window.triggerOdysseyHaptic?.(95, 0.45, 0.65);
  window.spawnOdysseyParticles(state, p.x, p.y, 20, '#34d399', 230);
  window.setOdysseyBanner(state, '🛡️ درع الجداء المتجهي u⃗∧v⃗ مفعّل — صد القذائف وشل الطرادات', 2.4);
  window.addOdysseyFloatText(state, p.x, p.y - 36, '🛡️ u⃗ ∧ v⃗', '#6ee7b7', 1.15);

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (Math.hypot(e.x - p.x, e.y - p.y) <= 275) {
      if (e.shieldActive) {
        e.shieldActive = false;
        e.shieldHp = 0;
        e.stunTimer = e.kind === 'boss' ? 2.6 : 1.6;
        e.shieldRechargeTimer = 8.5;
        window.addOdysseyFloatText(state, e.x, e.y - 68, 'تحطّم درع الفلكة!', '#fde047', 1.5);
      }
      if (e.kind !== 'boss') e.staggered = true;
      window.damageOdysseyEnemy(state, e, 42, false, true);
    }
  }
  return true;
};

// [R2 / J]: Scalar Dot-Product Railgun (360° aimed)
window.performOdysseyRailgun = function(state) {
  const p = state.player;
  if (p.pulseCooldown > 0) return false;
  p.pulseCooldown = 0.16;
  const spd = 840;
  const ang = p.aimAngle;
  state.projectiles.push({
    x: p.x + Math.cos(ang) * 22,
    y: p.y + Math.sin(ang) * 22,
    vx: Math.cos(ang) * spd,
    vy: Math.sin(ang) * spd,
    dmg: 26,
    life: 1.05
  });
  window.OdysseyAudio?.playRailgun?.();
  return true;
};

// [L2 / F]: Sphere Resonance Nova (||ΩM|| = R)
window.performOdysseyOverdrive = function(state) {
  const p = state.player;
  if (p.overdriveCooldown > 0 || p.energy < 40) {
    if (p.energy < 40) window.addOdysseyFloatText(state, p.x, p.y - 34, 'تحتاج 40% طاقة الفلكة!', '#fbbf24', 1.0);
    return false;
  }
  p.energy -= 40;
  p.overdriveCooldown = 2.4;
  p.overdriveAnim = 0.36;
  state.screenShake = Math.max(state.screenShake, 16);
  window.OdysseyAudio?.playOverdrive?.();
  window.triggerOdysseyHaptic?.(150, 0.72, 0.92);
  window.spawnOdysseyParticles(state, p.x, p.y, 38, '#a855f7', 360);
  window.setOdysseyBanner(state, '⚡ موجة الفلكة ||ΩM|| = R!', 2.2);
  window.addOdysseyFloatText(state, p.x, p.y - 38, '⚡ ||ΩM|| = R', '#e9d5ff', 1.25);

  for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
    const ep = state.enemyProjectiles[i];
    if (Math.hypot(ep.x - p.x, ep.y - p.y) <= 420) {
      window.spawnOdysseyParticles(state, ep.x, ep.y, 4, '#c084fc', 130);
      state.enemyProjectiles.splice(i, 1);
    }
  }

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (Math.hypot(e.x - p.x, e.y - p.y) <= 420) {
      if (e.shieldActive) {
        e.shieldActive = false;
        e.shieldHp = 0;
        e.stunTimer = e.kind === 'boss' ? 2.8 : 1.8;
        e.shieldRechargeTimer = 8.5;
      }
      window.damageOdysseyEnemy(state, e, 155, e.kind !== 'boss', true);
    }
  }
  return true;
};

window.findNearestOdysseyInteract = function(state) {
  const p = state.player;
  for (const e of state.enemies) {
    if (e.staggered && Math.hypot(e.x - p.x, e.y - p.y) <= 138) {
      return { kind: 'execute', enemy: e };
    }
  }
  for (const g of state.gates) {
    if (!g.broken && Math.hypot(g.x - p.x, g.y - p.y) <= 132) {
      return { kind: 'gate', gate: g };
    }
  }
  return null;
};

window.getOdysseySectorLabel = function(x, y) {
  if (x < 1300 && y < 850) return 'α (u⃗·v⃗)';
  if (x >= 1300 && y < 850) return 'β (u⃗∧v⃗)';
  if (x < 1300 && y >= 850) return 'γ ((S)∩P)';
  return 'δ (ℝ³)';
};

window.updateOdysseyWorld = function(state, rawDt, moveVec, aimVec) {
  if (state.mode !== 'play' && state.mode !== 'override') return;

  const tScale = state.mode === 'override' ? 0.035 : 1.0;
  const dt = rawDt * tScale;
  state.time += rawDt;
  state.worldTime += dt;

  const p = state.player;
  const W = window.ODYSSEY_WORLD.WIDTH;
  const H = window.ODYSSEY_WORLD.HEIGHT;

  if (state.bannerTimer > 0) state.bannerTimer = Math.max(0, state.bannerTimer - rawDt);
  if (state.damageFlash > 0) state.damageFlash = Math.max(0, state.damageFlash - rawDt * 2.4);
  if (state.screenShake > 0) state.screenShake = Math.max(0, state.screenShake - rawDt * 38);
  if (!state.camera) state.camera = { x: p.x, y: p.y, zoom: 1, shake: 0 };
  state.camera.x += (p.x - state.camera.x) * Math.min(1, rawDt * 8.5);
  state.camera.y += (p.y - state.camera.y) * Math.min(1, rawDt * 8.5);
  state.camera.shake = state.screenShake;

  // Orbiting Guard Mines around Unbroken Seals
  for (let i = 0; i < state.orbitalHazards.length; i++) {
    const hz = state.orbitalHazards[i];
    const g = state.gates[i];
    if (g && g.broken) continue;
    hz.angle += hz.speed * dt;
    hz.x = hz.cx + Math.cos(hz.angle) * hz.orbitR;
    hz.y = hz.cy + Math.sin(hz.angle) * hz.orbitR;
    if (state.mode === 'play' && Math.hypot(hz.x - p.x, hz.y - p.y) <= hz.radius + p.radius) {
      if (p.invulnTimer <= 0 && p.aegisTimer <= 0 && p.rollTimer <= 0) {
        applyOdysseyHit(state, 15, 'لغم مداري!');
      }
    }
  }

  if (state.mode === 'play') {
    p.invulnTimer = Math.max(0, p.invulnTimer - dt);
    p.boostCooldown = Math.max(0, p.boostCooldown - dt);
    p.rollTimer = Math.max(0, p.rollTimer - dt);
    p.rollCooldown = Math.max(0, p.rollCooldown - dt);
    p.overdriveAnim = Math.max(0, p.overdriveAnim - rawDt);
    p.pulseCooldown = Math.max(0, p.pulseCooldown - dt);
    p.aegisCooldown = Math.max(0, p.aegisCooldown - dt);
    p.aegisTimer = Math.max(0, p.aegisTimer - dt);
    p.overdriveCooldown = Math.max(0, p.overdriveCooldown - dt);
    p.energy = Math.min(p.maxEnergy, p.energy + dt * 6.0);

    if (state.stats.comboTimer > 0) {
      state.stats.comboTimer -= dt;
      if (state.stats.comboTimer <= 0) state.stats.combo = 0;
    }

    if (p.rollTimer > 0) {
      p.x += p.rollVx * dt;
      p.y += p.rollVy * dt;
    } else {
      const mLen = Math.hypot(moveVec.x, moveVec.y);
      const ax = mLen > 0.08 ? moveVec.x : 0;
      const ay = mLen > 0.08 ? moveVec.y : 0;
      p.vx += ax * window.ODYSSEY_WORLD.ACCEL * dt;
      p.vy += ay * window.ODYSSEY_WORLD.ACCEL * dt;
      const damp = Math.exp(-window.ODYSSEY_WORLD.DRAG * dt);
      p.vx *= damp;
      p.vy *= damp;
      const spd = Math.hypot(p.vx, p.vy);
      if (spd > window.ODYSSEY_WORLD.MAX_SPEED) {
        p.vx = (p.vx / spd) * window.ODYSSEY_WORLD.MAX_SPEED;
        p.vy = (p.vy / spd) * window.ODYSSEY_WORLD.MAX_SPEED;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (spd > 24) {
        p.shipAngle = Math.atan2(p.vy, p.vx);
      }
      window.OdysseyAudio?.setCombatIntensity?.(spd / window.ODYSSEY_WORLD.MAX_SPEED, state.bossSpawned);
    }

    if (aimVec && Math.hypot(aimVec.x, aimVec.y) > 0.16) {
      p.aimAngle = Math.atan2(aimVec.y, aimVec.x);
    } else if (Math.hypot(moveVec.x, moveVec.y) > 0.15) {
      p.aimAngle = Math.atan2(moveVec.y, moveVec.x);
    } else {
      p.aimAngle = p.shipAngle;
    }

    p.x = Math.max(44 + p.radius, Math.min(W - 44 - p.radius, p.x));
    p.y = Math.max(70 + p.radius, Math.min(H - 54 - p.radius, p.y));

    // Trench Laser Deflector Pylons Collision (bouncy barrier)
    for (const bar of state.trenchBarriers) {
      if (Math.abs(p.x - bar.x1) < p.radius + 7 && p.y >= bar.y1 && p.y <= bar.y2) {
        p.vx *= -0.75;
        p.x += (p.x >= bar.x1 ? 1 : -1) * (p.radius + 9 - Math.abs(p.x - bar.x1));
      }
    }

    // Collect Hull & Sphere Flux Orbs
    for (let i = state.orbs.length - 1; i >= 0; i--) {
      const o = state.orbs[i];
      if (Math.hypot(o.x - p.x, o.y - p.y) <= p.radius + o.radius + 10) {
        if (o.kind === 'hp') {
          p.hp = Math.min(p.maxHp, p.hp + 26);
          window.addOdysseyFloatText(state, p.x, p.y - 24, '+26 هيكل ℝ³', '#38bdf8', 1.0);
        } else {
          p.energy = Math.min(p.maxEnergy, p.energy + 35);
          window.addOdysseyFloatText(state, p.x, p.y - 24, '+35% طاقة (S)', '#a855f7', 1.0);
        }
        window.OdysseyAudio?.playOrbPickup?.(o.kind);
        state.orbs.splice(i, 1);
      }
    }

    // Enemy Spawner
    state.spawnTimer -= dt;
    const cap = state.bossSpawned ? 7 : 5 + state.stats.brokenGates;
    if (state.spawnTimer <= 0 && state.enemies.length < cap) {
      window.spawnOdysseyEnemy(state);
      state.spawnTimer = Math.max(1.8, 3.2 - state.stats.brokenGates * 0.35);
    }
  }

  // Player Scalar Railgun Bolts (checks Boss Phase 3 rotating tangent window H!)
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const b = state.projectiles[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    let rm = b.life <= 0 || b.x < 10 || b.x > W - 10 || b.y < 10 || b.y > H - 10;
    if (!rm) {
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const e = state.enemies[j];
        const hitDist = e.shieldActive ? (e.radius + 20) : (e.radius + 9);
        if (Math.hypot(e.x - b.x, e.y - b.y) <= hitDist) {
          if (e.shieldActive) {
            const ang = Math.atan2(b.y - e.y, b.x - e.x);
            const diff = Math.abs(Math.atan2(Math.sin(ang - e.shieldAngle), Math.cos(ang - e.shieldAngle)));
            if (diff <= e.shieldGapHalf) {
              window.damageOdysseyEnemy(state, e, Math.round(b.dmg * 1.25), false, true);
              window.spawnOdysseyParticles(state, b.x, b.y, 7, '#fde047', 175);
              if (e.kind === 'boss' && Math.random() < 0.32) {
                window.addOdysseyFloatText(state, b.x, b.y - 16, 'اختراق H!', '#4ade80', 0.65);
              }
            } else {
              window.damageOdysseyEnemy(state, e, b.dmg, false, false);
            }
          } else {
            window.damageOdysseyEnemy(state, e, b.dmg, false, false);
          }
          rm = true;
          break;
        }
      }
    }
    if (rm) state.projectiles.splice(i, 1);
  }

  // Enemy Projectiles (absorbed by Cross-Product Vector Shield or Trench Deflector Pylons!)
  for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
    const ep = state.enemyProjectiles[i];
    ep.x += ep.vx * dt;
    ep.y += ep.vy * dt;
    ep.life -= dt;
    let rm = ep.life <= 0;
    if (!rm) {
      for (let t = 0; t < state.trenchBarriers.length; t++) {
        const bar = state.trenchBarriers[t];
        if (Math.abs(ep.x - bar.x1) <= 9 && ep.y >= bar.y1 && ep.y <= bar.y2) {
          window.spawnOdysseyParticles(state, ep.x, ep.y, 3, '#7dd3fc', 95);
          rm = true;
          break;
        }
      }
    }
    const distP = Math.hypot(ep.x - p.x, ep.y - p.y);
    if (!rm && p.aegisTimer > 0 && distP <= 56) {
      window.spawnOdysseyParticles(state, ep.x, ep.y, 5, '#34d399', 120);
      rm = true;
    } else if (!rm && distP <= p.radius + 7 && p.invulnTimer <= 0 && p.aegisTimer <= 0 && state.mode === 'play') {
      applyOdysseyHit(state, 12, '-12 هيكل');
      rm = true;
    }
    if (rm) state.enemyProjectiles.splice(i, 1);
  }

  // Boss Normal-Plane Laser Sweeps (Phase 2 & 3)
  for (let i = state.bossBeams.length - 1; i >= 0; i--) {
    const bm = state.bossBeams[i];
    if (bm.warnTimer > 0) {
      bm.warnTimer -= dt;
      if (bm.warnTimer <= 0) {
        window.OdysseyAudio?.playBeamFire?.();
      }
    } else if (bm.activeTimer > 0) {
      bm.activeTimer -= dt;
      if (state.mode === 'play' && p.invulnTimer <= 0 && p.aegisTimer <= 0 && p.rollTimer <= 0) {
        const hitX = bm.axis === 'x' && Math.abs(p.x - bm.pos) < p.radius + 14;
        const hitY = bm.axis === 'y' && Math.abs(p.y - bm.pos) < p.radius + 14;
        if (hitX || hitY) {
          applyOdysseyHit(state, 18, 'شعاع المستوى!');
        }
      }
    } else {
      state.bossBeams.splice(i, 1);
    }
  }

  // Enemies AI & Boss Attacks
  const slowMul = p.aegisTimer > 0 ? 0.45 : 1.0;
  for (const e of state.enemies) {
    e.hitFlash = Math.max(0, e.hitFlash - dt);
    e.animPhase += rawDt * 4.0;
    if (e.shieldActive && e.kind !== 'boss') {
      e.shieldAngle = (e.shieldAngle + dt * 1.1) % (Math.PI * 2);
    }
    if (e.kind === 'boss' && e.phase >= 3) {
      e.shieldAngle = (e.shieldAngle + dt * 1.45) % (Math.PI * 2);
      if (e.stunTimer > 0) e.stunTimer = Math.max(0, e.stunTimer - dt);
      if (!e.shieldActive && !e.staggered && e.stunTimer <= 0) {
        e.shieldRechargeTimer -= dt;
        if (e.shieldRechargeTimer <= 0) {
          e.shieldActive = true;
          e.shieldHp = e.shieldMaxHp;
          window.OdysseyAudio?.playOverdrive?.();
          window.addOdysseyFloatText(state, e.x, e.y - 68, 'تجديد درع (S) — اصب فجوة H أو [△/L2]!', '#22d3ee', 1.8);
        }
      }
    }

    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const dist = Math.hypot(dx, dy);

    if (state.mode === 'play') {
      const stunned = e.stunTimer > 0;
      const spd = (e.staggered || stunned ? e.speed * 0.25 : e.speed) * slowMul;
      const baseAng = dist > 0.01 ? Math.atan2(dy, dx) : 0;

      if (dist > 1) {
        if (e.kind === 'interceptor_vec') {
          const moveAng = baseAng + Math.sin(e.animPhase) * 0.55;
          e.x = Math.max(70, Math.min(W - 70, e.x + Math.cos(moveAng) * spd * dt));
          e.y = Math.max(90, Math.min(H - 90, e.y + Math.sin(moveAng) * spd * dt));
        } else if (e.kind === 'turret_plane') {
          const moveDir = dist > 320 ? 1 : (dist < 180 ? -0.7 : 0);
          e.x = Math.max(80, Math.min(W - 80, e.x + Math.cos(baseAng) * spd * moveDir * dt));
          e.y = Math.max(100, Math.min(H - 100, e.y + Math.sin(baseAng) * spd * moveDir * dt));
        } else {
          const orbit = e.kind === 'boss' && e.phase >= 2 ? Math.sin(e.animPhase * 0.7) * 58 * dt : 0;
          e.x = Math.max(90, Math.min(W - 90, e.x + Math.cos(baseAng) * spd * dt));
          e.y = Math.max(100, Math.min(H - 100, e.y + Math.sin(baseAng) * spd * dt + orbit));
        }
      }

      if ((e.kind === 'turret_plane' || e.kind === 'cruiser_sphere' || e.kind === 'boss') && !stunned) {
        e.shootTimer -= dt;
        if (e.shootTimer <= 0 && !e.staggered) {
          e.shootTimer = e.kind === 'boss' ? (e.phase === 3 ? 1.3 : 1.7) : (e.kind === 'turret_plane' ? 2.2 : 2.55);
          const spiralShift = (e.kind === 'boss' && e.phase >= 2) ? Math.sin(e.animPhase * 0.9) * 0.16 : 0;
          const offsets = e.kind === 'boss' ? [-0.36, -0.18, 0, 0.18, 0.36] : [-0.16, 0.16];
          for (const off of offsets) {
            state.enemyProjectiles.push({
              x: e.x, y: e.y,
              vx: Math.cos(baseAng + off + spiralShift) * 330,
              vy: Math.sin(baseAng + off + spiralShift) * 330,
              life: 2.6,
              color: e.kind === 'boss' ? '#c084fc' : (e.kind === 'turret_plane' ? '#818cf8' : '#fbbf24')
            });
          }
        }
      }

      if (e.kind === 'boss' && e.phase >= 2 && !e.staggered && !stunned) {
        e.beamTimer -= dt;
        if (e.beamTimer <= 0) {
          e.beamTimer = e.phase === 3 ? 3.25 : 4.0;
          window.OdysseyAudio?.playBeamCharge?.();
          if (e.phase === 3) {
            state.bossBeams.push(
              { axis: 'x', pos: p.x, warnTimer: 1.15, activeTimer: 0.6, eqLabel: `x = ${Math.round(p.x)}` },
              { axis: 'y', pos: p.y, warnTimer: 1.15, activeTimer: 0.6, eqLabel: `y = ${Math.round(p.y)}` }
            );
          } else {
            const ax = Math.random() < 0.5 ? 'x' : 'y';
            const beamPos = ax === 'x' ? p.x : p.y;
            state.bossBeams.push({
              axis: ax,
              pos: beamPos,
              warnTimer: 1.05,
              activeTimer: 0.65,
              eqLabel: `${ax} = ${Math.round(beamPos)}`
            });
          }
        }
      }

      const effRad = (e.kind === 'boss' && e.shieldActive) ? e.radius + 22 : e.radius;
      if (e.kind === 'boss' && dist < effRad + p.radius) {
        const nx = dist > 0.01 ? dx / dist : 0;
        const ny = dist > 0.01 ? dy / dist : -1;
        const pushD = effRad + p.radius + 4;
        p.x = Math.max(44 + p.radius, Math.min(W - 44 - p.radius, e.x + nx * pushD));
        p.y = Math.max(70 + p.radius, Math.min(H - 54 - p.radius, e.y + ny * pushD));
      }

      if (p.aegisTimer > 0 && dist <= 58 + e.radius) {
        window.damageOdysseyEnemy(state, e, 30 * dt, false, true);
      } else if (!e.staggered && dist <= effRad + p.radius + 3 && p.invulnTimer <= 0 && p.aegisTimer <= 0 && p.rollTimer <= 0) {
        applyOdysseyHit(state, e.dmg, `-${e.dmg} هيكل`);
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

function applyOdysseyHit(state, dmg, msg) {
  const p = state.player;
  if (p.hp <= 0 || state.mode !== 'play') return;
  p.hp = Math.max(0, p.hp - dmg);
  p.invulnTimer = 0.78;
  state.damageFlash = 1.0;
  state.screenShake = Math.max(state.screenShake, 12);
  window.OdysseyAudio?.playDamage?.();
  window.triggerOdysseyHaptic?.(125, 0.65, 0.85);
  window.addOdysseyFloatText(state, p.x, p.y - 26, msg, '#fb7185', 1.1);
  if (p.hp <= 0) {
    window.finishOdysseyGame(state, false);
  }
}
