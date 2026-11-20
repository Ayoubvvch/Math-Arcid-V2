/**
 * Quantum Casino (كازينو الاحتمالات الكمومي) - 2D Tactical Heist & Bullet-Time Simulation
 * Vault Dimensions: 2560 x 1600 across 4 Casino Wings (α, β, γ, δ) + Central Bernoulli Core.
 * Features solid tactical poker-table cover (circle-AABB collision + ricochet in Bullet-Time),
 * rotating roulette hazard beams, 3 enemy archetypes with stagger/execute, 6 PlayStation abilities,
 * Bullet-Time dilation (0.28x enemy/projectile slow), and 3-Phase Bernoulli Syndicate Boss.
 */

window.CASINO_WORLD = {
  WIDTH: 2560,
  HEIGHT: 1600,
  MAX_SPEED: 390,
  ACCEL: 1950,
  DRAG: 5.2,
  MAX_PARTICLES: 175
};

window.createInitialCasinoState = function (topicFilter = 'all') {
  const sectors = window.CASINO_SECTORS || [];

  // 4 Decorative Casino Felt Floor Zones (Sampling, Conditional, Tree, Binomial)
  const wingZones = [
    { x: 120, y: 110, w: 940, h: 580, label: 'جناح α: التعداد Cₙᵖ / Aₙᵖ', color: 'rgba(16, 185, 129, 0.06)', border: 'rgba(52, 211, 153, 0.25)' },
    { x: 1500, y: 110, w: 940, h: 580, label: 'جناح β: الاحتمال الشرطي P_A(B)', color: 'rgba(34, 211, 238, 0.06)', border: 'rgba(34, 211, 238, 0.25)' },
    { x: 120, y: 910, w: 940, h: 580, label: 'جناح γ: شجرة الاحتمالات الكلية', color: 'rgba(251, 191, 36, 0.06)', border: 'rgba(251, 191, 36, 0.25)' },
    { x: 1500, y: 910, w: 940, h: 580, label: 'جناح δ: برنولي B(n,p) و E(X)', color: 'rgba(168, 85, 247, 0.06)', border: 'rgba(192, 132, 252, 0.25)' }
  ];

  // Solid Tactical Poker Tables & Vault Pillars (cover blocks enemy shots & shapes gunplay!)
  const coverTables = [
    { x: 760, y: 310, w: 150, h: 72, label: 'طاولة Cₙᵖ' },
    { x: 1650, y: 310, w: 150, h: 72, label: 'طاولة P_A(B)' },
    { x: 760, y: 1218, w: 150, h: 72, label: 'طاولة Arbre' },
    { x: 1650, y: 1218, w: 150, h: 72, label: 'طاولة B(n,p)' },
    { x: 1030, y: 590, w: 80, h: 140, label: 'عمود Ω₁' },
    { x: 1450, y: 590, w: 80, h: 140, label: 'عمود Ω₂' },
    { x: 1030, y: 870, w: 80, h: 140, label: 'عمود Ω₃' },
    { x: 1450, y: 870, w: 80, h: 140, label: 'عمود Ω₄' }
  ];

  // 4 Quantum Vault Seals (α, β, γ, δ)
  const gatePositions = [
    { x: 350, y: 280, glyph: 'Cₙᵖ' },
    { x: 2210, y: 280, glyph: 'P_A(B)' },
    { x: 350, y: 1320, glyph: 'Σ P(B)' },
    { x: 2210, y: 1320, glyph: 'B(n,p)' }
  ];

  const gates = gatePositions.map((pos, idx) => {
    const sec = sectors[idx] || { id: idx + 1, name: `الجناح ${idx + 1}`, topics: [103 + idx * 3], color: '#10b981' };
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
      pulse: idx * 1.3
    };
  });

  // Orbiting Quantum Roulette Guard Mines around unbroken Vault Seals
  const rouletteMines = gatePositions.map((pos, idx) => {
    const startAng = idx * 1.57;
    return {
      id: idx,
      cx: pos.x,
      cy: pos.y,
      orbitR: 108,
      angle: startAng,
      speed: (idx % 2 === 0 ? 1 : -1) * 1.7,
      x: pos.x + Math.cos(startAng) * 108,
      y: pos.y + Math.sin(startAng) * 108,
      radius: 14
    };
  });

  // Ambient Neon Vault Floor Chips (decorative diamonds)
  const floorDots = [];
  for (let i = 0; i < 95; i += 1) {
    floorDots.push({
      x: 90 + Math.random() * 2380,
      y: 90 + Math.random() * 1420,
      suit: ['♠', '♥', '♦', '♣'][i % 4],
      alpha: 0.08 + Math.random() * 0.14
    });
  }

  // Repair Med-Chips (HP) & Quantum Flux Chips (Energy)
  const orbs = [
    { id: 1, x: 900, y: 460, radius: 12, kind: 'energy' },
    { id: 2, x: 1660, y: 460, radius: 12, kind: 'hp' },
    { id: 3, x: 580, y: 800, radius: 12, kind: 'hp' },
    { id: 4, x: 1980, y: 800, radius: 12, kind: 'energy' },
    { id: 5, x: 900, y: 1140, radius: 12, kind: 'energy' },
    { id: 6, x: 1660, y: 1140, radius: 12, kind: 'hp' },
    { id: 7, x: 1280, y: 490, radius: 12, kind: 'hp' },
    { id: 8, x: 1280, y: 1110, radius: 12, kind: 'energy' }
  ];

  const state = {
    mode: 'intro', // 'intro' | 'play' | 'override' | 'pause' | 'end'
    topicFilter,
    time: 0,
    worldTime: 0,
    timeScale: 1,
    screenShake: 0,
    damageFlash: 0,
    camera: { x: 1280, y: 800, zoom: 1, shake: 0 },
    bannerText: 'الجناح α — اخترق خزائن التعداد والاحتمال الشرطي وبرنولي (103–114)',
    bannerTimer: 4.5,

    player: {
      x: 1280,
      y: 800,
      vx: 0,
      vy: 0,
      radius: 19,
      aimAngle: 0,
      hp: 110,
      maxHp: 110,
      energy: 100,
      maxEnergy: 100,
      invulnTimer: 0,
      dashCooldown: 0,
      sliceTimer: 0,
      sliceCooldown: 0,
      sliceVx: 0,
      sliceVy: 0,
      shootCooldown: 0,
      bulletTimeCooldown: 0,
      bulletTimeTimer: 0,
      jackpotCooldown: 0,
      jackpotAnim: 0
    },

    wingZones,
    coverTables,
    gates,
    rouletteMines,
    floorDots,
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

  // Seed initial tactical heist guards across the 4 wings
  window.spawnCasinoEnemy(state, 'guard_card', 540, 440);
  window.spawnCasinoEnemy(state, 'turret_dice', 2020, 440);
  window.spawnCasinoEnemy(state, 'guard_card', 540, 1140);
  window.spawnCasinoEnemy(state, 'enforcer_markov', 2020, 1140);

  return state;
};

window.spawnCasinoParticles = function (state, x, y, count = 12, color = '#10b981', maxSpd = 240) {
  const parts = state.particles;
  for (let i = 0; i < count; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const s = 45 + Math.random() * maxSpd;
    parts.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      size: 2.0 + Math.random() * 4.0,
      life: 0.28 + Math.random() * 0.4,
      maxLife: 0.68,
      color
    });
  }
  while (parts.length > window.CASINO_WORLD.MAX_PARTICLES) parts.shift();
};

window.addCasinoFloatText = function (state, x, y, text, color = '#fbbf24', life = 1.2) {
  state.floatingTexts.push({
    x, y, text, color, life, maxLife: life,
    isRtl: /[\u0600-\u06FF]/.test(String(text || ''))
  });
  if (state.floatingTexts.length > 26) state.floatingTexts.shift();
};

window.setCasinoBanner = function (state, text, dur = 3.2) {
  state.bannerText = text;
  state.bannerTimer = dur;
};

window.spawnCasinoEnemy = function (state, forceKind = null, forceX = null, forceY = null) {
  const p = state.player;
  const broken = state.stats.brokenGates;
  let kind = forceKind;
  if (!kind) {
    const r = Math.random();
    if (r < 0.45) kind = 'guard_card';
    else if (r < 0.78) kind = 'turret_dice';
    else kind = 'enforcer_markov';
  }

  let sx = forceX;
  let sy = forceY;
  if (sx === null || sy === null) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 440 + Math.random() * 140;
    sx = Math.max(90, Math.min(window.CASINO_WORLD.WIDTH - 90, p.x + Math.cos(ang) * dist));
    sy = Math.max(110, Math.min(window.CASINO_WORLD.HEIGHT - 110, p.y + Math.sin(ang) * dist));
  }
  if (kind === 'boss') {
    sx = 1280;
    sy = 800;
  }

  const mult = 1 + broken * 0.16;
  const cfg = {
    guard_card: { r: 19, hp: Math.round(44 * mult), speed: 175 + broken * 10, dmg: 11, label: '♠A', color: '#34d399' },
    turret_dice: { r: 22, hp: Math.round(62 * mult), speed: 88 + broken * 6, dmg: 14, label: '🎲6', color: '#22d3ee' },
    enforcer_markov: { r: 27, hp: Math.round(104 * mult), speed: 110 + broken * 7, dmg: 18, label: 'B(n,p)', color: '#fbbf24' },
    boss: { r: 56, hp: 700, speed: 128, dmg: 22, label: 'نواة نقابة برنولي', color: '#a855f7' }
  }[kind];

  const enforcerShield = kind === 'enforcer_markov' && broken >= 1;
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
    shieldActive: enforcerShield,
    shieldHp: enforcerShield ? 55 : 0,
    shieldMaxHp: kind === 'boss' ? 155 : 55,
    shieldAngle: Math.random() * Math.PI * 2,
    shieldGapHalf: kind === 'boss' ? 0.50 : 0.72,
    shieldRechargeTimer: 0,
    stunTimer: 0,
    phase: 1,
    shootTimer: kind === 'boss' ? 1.4 : 2.0,
    beamTimer: 0,
    animPhase: Math.random() * Math.PI * 2
  });
};

window.spawnSyndicateBoss = function (state) {
  if (state.bossSpawned) return state.enemies.find((e) => e.kind === 'boss') || null;
  state.bossSpawned = true;
  window.spawnCasinoEnemy(state, 'boss');
  const boss = state.enemies.find((e) => e.kind === 'boss') || null;
  state.screenShake = Math.max(state.screenShake, 16);
  if (state.camera) state.camera.shake = state.screenShake;
  window.CasinoAudio?.playJackpotShock?.();
  window.triggerCasinoHaptic?.(175, 0.7, 0.92);
  window.setCasinoBanner(state, '🎰 تحطمت الأختام الأربعة — نواة نقابة برنولي استيقظت في الخزنة المركزية!', 5.0);
  window.addCasinoFloatText(state, state.player.x, state.player.y - 46, 'BOSS: نواة برنولي (1280, 800)!', '#c084fc', 2.4);
  return boss;
};

window.damageCasinoEnemy = function (state, enemy, dmg, forceKill = false, ignoreShield = false) {
  if (enemy.shieldActive && !ignoreShield && !forceKill) {
    enemy.shieldHp = Math.max(0, enemy.shieldHp - dmg * 0.65);
    enemy.hitFlash = 0.08;
    window.CasinoAudio?.playShieldDeflect?.();
    window.spawnCasinoParticles(state, enemy.x, enemy.y, 5, '#fbbf24', 140);
    if (enemy.shieldHp <= 0) {
      enemy.shieldActive = false;
      enemy.stunTimer = enemy.kind === 'boss' ? 2.6 : 1.5;
      enemy.shieldRechargeTimer = 8.5;
      if (enemy.kind !== 'boss') enemy.staggered = true;
      window.CasinoAudio?.playBulletTime?.();
      window.addCasinoFloatText(
        state,
        enemy.x,
        enemy.y - enemy.radius - 18,
        enemy.kind === 'boss' ? 'انكسر درع برنولي مؤقتاً! أطلق [R2]' : 'انكسر درع المنفذ! [▢ / E]',
        '#fde047',
        1.8
      );
    }
    return false;
  }

  enemy.hp -= dmg;
  enemy.hitFlash = 0.14;
  window.spawnCasinoParticles(state, enemy.x, enemy.y, 8, enemy.color || '#34d399', 190);

  if (enemy.kind === 'boss' && enemy.hp > 0) {
    const frac = enemy.hp / enemy.maxHp;
    if (enemy.phase === 1 && frac <= 0.65) {
      enemy.phase = 2;
      enemy.beamTimer = 1.0;
      window.CasinoAudio?.playBossPhaseShift?.();
      window.triggerCasinoHaptic?.(135, 0.55, 0.8);
      window.setCasinoBanner(state, '⚠ الطور 2: أشعة الروليت المزدوجة P(A∩B)!', 3.8);
      window.addCasinoFloatText(state, enemy.x, enemy.y - 60, 'الطور 2: أشعة الروليت!', '#fbbf24', 1.8);
    }
    if (enemy.phase < 3 && frac <= 0.30) {
      enemy.phase = 3;
      enemy.shieldActive = true;
      enemy.shieldHp = enemy.shieldMaxHp;
      enemy.shieldRechargeTimer = 8.5;
      window.CasinoAudio?.playBossPhaseShift?.();
      window.triggerCasinoHaptic?.(160, 0.65, 0.9);
      window.setCasinoBanner(state, '🎰 الطور 3: درع برنولي B(n,p)! صوّب نحو نافذة النجاح الخضراء p أو استعمل [△/L2]!', 4.6);
      window.addCasinoFloatText(state, enemy.x, enemy.y - 62, 'درع B(n,p) نشط — نافذة النجاح p أو [△/L2]!', '#34d399', 2.2);
    }
  }

  if (!enemy.staggered && enemy.hp > 0) {
    const canStagger = (enemy.kind === 'enforcer_markov' && enemy.hp <= enemy.maxHp * 0.40) ||
      (enemy.kind === 'boss' && !enemy.shieldActive && enemy.hp <= enemy.maxHp * 0.18);
    if (canStagger) {
      enemy.staggered = true;
      window.addCasinoFloatText(state, enemy.x, enemy.y - enemy.radius - 14, 'مشلول! [▢ / E] تصفية فورية', '#fde047', 1.6);
    }
  }

  if (enemy.hp <= 0 || forceKill) {
    const idx = state.enemies.indexOf(enemy);
    if (idx !== -1) state.enemies.splice(idx, 1);

    state.stats.kills += 1;
    state.stats.combo += 1;
    state.stats.comboTimer = 4.2;
    if (state.stats.combo >= 2) {
      window.CasinoAudio?.playComboChime?.(state.stats.combo);
    }
    const mult = Math.min(5, 1 + Math.floor(state.stats.combo / 3));
    const pts = (enemy.kind === 'boss' ? 2200 : enemy.kind === 'enforcer_markov' ? 195 : 95) * mult;
    state.stats.score += pts;
    state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 15);

    window.spawnCasinoParticles(state, enemy.x, enemy.y, enemy.kind === 'boss' ? 50 : 16, '#fbbf24', 290);
    window.addCasinoFloatText(state, enemy.x, enemy.y - 18, `+${pts}`, '#34d399', 0.95);

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
      window.CasinoAudio?.playVictory?.();
      window.triggerCasinoHaptic?.(220, 0.78, 1.0);
      window.finishCasinoGame(state, true);
    }
    return true;
  }
  return false;
};

// [✕ / Space]: Quantum Permutation Blink Dash (وثبة التبديل n!)
window.performCasinoDash = function (state, moveVec) {
  const p = state.player;
  if (p.dashCooldown > 0) return false;
  p.dashCooldown = 0.62;
  const ang = Math.hypot(moveVec.x, moveVec.y) > 0.15 ? Math.atan2(moveVec.y, moveVec.x) : p.aimAngle;
  p.vx = Math.cos(ang) * 700;
  p.vy = Math.sin(ang) * 700;
  p.invulnTimer = Math.max(p.invulnTimer, 0.25);
  window.CasinoAudio?.playDash?.();
  window.triggerCasinoHaptic?.(55, 0.32, 0.48);
  window.spawnCasinoParticles(state, p.x, p.y, 14, '#34d399', 210);
  window.addCasinoFloatText(state, p.x, p.y - 24, 'وثبة n!', '#6ee7b7', 0.75);
  return true;
};

// [◯ / Shift]: Card-Slice Evade Cₙᵖ (slices bullets & enemies in radius)
window.performCasinoSlice = function (state, moveVec) {
  const p = state.player;
  if (p.sliceCooldown > 0) return false;
  p.sliceCooldown = 0.80;
  p.sliceTimer = 0.22;
  p.invulnTimer = Math.max(p.invulnTimer, 0.42);

  const ang = Math.hypot(moveVec.x, moveVec.y) > 0.15 ? Math.atan2(moveVec.y, moveVec.x) : p.aimAngle;
  p.sliceVx = Math.cos(ang) * 840;
  p.sliceVy = Math.sin(ang) * 840;

  window.CasinoAudio?.playCardSlice?.();
  window.triggerCasinoHaptic?.(75, 0.42, 0.6);
  window.spawnCasinoParticles(state, p.x, p.y, 18, '#fb7185', 240);
  window.addCasinoFloatText(state, p.x, p.y - 26, 'قصّ Cₙᵖ', '#fda4af', 0.8);

  for (let i = state.enemyProjectiles.length - 1; i >= 0; i -= 1) {
    const ep = state.enemyProjectiles[i];
    if (Math.hypot(ep.x - p.x, ep.y - p.y) <= 135) {
      window.spawnCasinoParticles(state, ep.x, ep.y, 4, '#fbbf24', 110);
      state.enemyProjectiles.splice(i, 1);
    }
  }

  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const e = state.enemies[i];
    if (Math.hypot(e.x - p.x, e.y - p.y) <= 145) {
      window.damageCasinoEnemy(state, e, 46, false, false);
    }
  }
  return true;
};

// [△ / Q]: Bullet-Time Quantum Dilation (0.28x enemy/bullet time + deflector aura + stagger)
window.performCasinoBulletTime = function (state) {
  const p = state.player;
  if (p.bulletTimeCooldown > 0) return false;
  p.bulletTimeCooldown = 5.2;
  p.bulletTimeTimer = 3.6;
  p.invulnTimer = Math.max(p.invulnTimer, 1.0);
  window.CasinoAudio?.playBulletTime?.();
  window.triggerCasinoHaptic?.(100, 0.48, 0.7);
  window.spawnCasinoParticles(state, p.x, p.y, 22, '#a855f7', 235);
  window.setCasinoBanner(state, '⏱ تمديد الزمن الكمومي 0.28x — بطء الطلقات وارتداد رقائقك!', 2.6);
  window.addCasinoFloatText(state, p.x, p.y - 36, '⏱ BULLET-TIME 0.28x', '#e9d5ff', 1.2);

  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const e = state.enemies[i];
    if (Math.hypot(e.x - p.x, e.y - p.y) <= 230) {
      e.stunTimer = Math.max(e.stunTimer, 1.9);
      if (e.kind !== 'boss') e.staggered = true;
      else if (e.shieldActive) {
        e.shieldActive = false;
        e.shieldRechargeTimer = 8.5;
        e.stunTimer = Math.max(e.stunTimer, 2.6);
        window.addCasinoFloatText(state, e.x, e.y - 68, 'تعطل درع B(n,p) بالتمديد!', '#34d399', 1.8);
      }
      window.damageCasinoEnemy(state, e, 24, false, true);
    }
  }
  return true;
};

// [R2 / J / Click]: Prism Chip Blaster P(A) (ricochets off poker tables during Bullet-Time!)
window.performCasinoShoot = function (state) {
  const p = state.player;
  if (p.shootCooldown > 0) return false;
  const inBT = p.bulletTimeTimer > 0;
  p.shootCooldown = inBT ? 0.14 : 0.17;
  const ang = p.aimAngle;
  const spd = inBT ? 960 : 800;

  state.projectiles.push({
    x: p.x + Math.cos(ang) * 24,
    y: p.y + Math.sin(ang) * 24,
    vx: Math.cos(ang) * spd,
    vy: Math.sin(ang) * spd,
    radius: 6.5,
    dmg: inBT ? 26 : 21,
    bounces: inBT ? 1 : 0,
    life: 1.05,
    angle: ang
  });
  window.CasinoAudio?.playChipShot?.();
  return true;
};

// [L2 / F]: Bernoulli Jackpot Shockwave B(n,p)
window.performCasinoJackpot = function (state) {
  const p = state.player;
  if (p.jackpotCooldown > 0 || p.energy < 40) {
    if (p.energy < 40) window.setCasinoBanner(state, 'تحتاج إلى 40 تدفق احتمال على الأقل لصدمة برنولي!', 2.0);
    return false;
  }

  p.energy -= 40;
  p.jackpotCooldown = 2.6;
  p.jackpotAnim = 0.56;
  p.invulnTimer = Math.max(p.invulnTimer, 0.72);
  state.screenShake = Math.max(state.screenShake, 14);
  if (state.camera) state.camera.shake = state.screenShake;

  window.CasinoAudio?.playJackpotShock?.();
  window.triggerCasinoHaptic?.(160, 0.65, 0.92);
  window.spawnCasinoParticles(state, p.x, p.y, 34, '#fbbf24', 320);
  window.addCasinoFloatText(state, p.x, p.y - 40, 'B(n,p) = Cₙᵏ pᵏ(1-p)ⁿ⁻ᵏ!', '#fde047', 1.35);

  for (let i = state.enemyProjectiles.length - 1; i >= 0; i -= 1) {
    const ep = state.enemyProjectiles[i];
    if (Math.hypot(ep.x - p.x, ep.y - p.y) <= 420) {
      window.spawnCasinoParticles(state, ep.x, ep.y, 4, '#fbbf24', 120);
      state.enemyProjectiles.splice(i, 1);
    }
  }

  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const e = state.enemies[i];
    if (Math.hypot(e.x - p.x, e.y - p.y) <= 400) {
      if (e.kind === 'boss' && e.shieldActive) {
        e.shieldActive = false;
        e.shieldRechargeTimer = 8.5;
        e.stunTimer = Math.max(e.stunTimer, 2.8);
        window.addCasinoFloatText(state, e.x, e.y - 68, 'تحطم درع برنولي B(n,p)!', '#fde047', 1.9);
      }
      window.damageCasinoEnemy(state, e, 74, false, true);
    }
  }
  return true;
};

window.findNearestCasinoInteract = function (state) {
  const p = state.player;
  for (let i = 0; i < state.enemies.length; i += 1) {
    const e = state.enemies[i];
    if (e.staggered && Math.hypot(e.x - p.x, e.y - p.y) <= 95) {
      return { kind: 'execute', enemy: e };
    }
  }
  for (let i = 0; i < state.gates.length; i += 1) {
    const g = state.gates[i];
    if (!g.broken && Math.hypot(g.x - p.x, g.y - p.y) <= 98) {
      return { kind: 'gate', gate: g };
    }
  }
  return null;
};

window.getCasinoSectorLabel = function (x, y) {
  if (x < 1280 && y < 800) return 'α';
  if (x >= 1280 && y < 800) return 'β';
  if (x < 1280 && y >= 800) return 'γ';
  return 'δ';
};

/**
 * Push a circular entity cleanly outside solid rectangular poker tables / vault pillars.
 */
function resolveCircleRectCollision(entity, rect) {
  const closestX = Math.max(rect.x, Math.min(entity.x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(entity.y, rect.y + rect.h));
  const dx = entity.x - closestX;
  const dy = entity.y - closestY;
  const distSq = dx * dx + dy * dy;
  const r = entity.radius;
  if (distSq >= r * r) return;

  const dist = Math.sqrt(distSq);
  if (dist > 0.0001) {
    const push = r - dist;
    entity.x += (dx / dist) * push;
    entity.y += (dy / dist) * push;
  } else {
    // Inside rectangle center fallback
    const leftPen = Math.abs(entity.x - rect.x);
    const rightPen = Math.abs(rect.x + rect.w - entity.x);
    const topPen = Math.abs(entity.y - rect.y);
    const botPen = Math.abs(rect.y + rect.h - entity.y);
    const m = Math.min(leftPen, rightPen, topPen, botPen);
    if (m === leftPen) entity.x = rect.x - r;
    else if (m === rightPen) entity.x = rect.x + rect.w + r;
    else if (m === topPen) entity.y = rect.y - r;
    else entity.y = rect.y + rect.h + r;
  }
}

function pointInsideRect(x, y, pad, rect) {
  return (
    x >= rect.x - pad &&
    x <= rect.x + rect.w + pad &&
    y >= rect.y - pad &&
    y <= rect.y + rect.h + pad
  );
}

function applyPlayerDamage(state, amount, label) {
  const p = state.player;
  if (p.invulnTimer > 0) return;
  if (p.bulletTimeTimer > 0) {
    window.CasinoAudio?.playShieldDeflect?.();
    window.spawnCasinoParticles(state, p.x, p.y, 6, '#c084fc', 130);
    return;
  }
  p.hp = Math.max(0, p.hp - amount);
  p.invulnTimer = 0.85;
  state.damageFlash = 0.35;
  state.screenShake = Math.max(state.screenShake, 12);
  if (state.camera) state.camera.shake = state.screenShake;
  window.CasinoAudio?.playDamage?.();
  window.triggerCasinoHaptic?.(135, 0.6, 0.85);
  window.addCasinoFloatText(state, p.x, p.y - 24, `-${amount} ${label || ''}`.trim(), '#fb7185', 1.0);
  if (p.hp <= 0) {
    window.finishCasinoGame(state, false);
  }
}

function distPointToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq <= 0.0001) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function shortestAngleDiff(a, b) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

window.updateCasinoWorld = function (state, rawDt, moveVec, aimVec) {
  if (state.mode !== 'play') return;

  const p = state.player;
  const inBulletTime = p.bulletTimeTimer > 0;
  const enemyTimeScale = inBulletTime ? 0.28 : 1.0;
  state.timeScale = enemyTimeScale;

  const playerDt = rawDt;
  const worldDt = rawDt * enemyTimeScale;

  state.time += playerDt;
  state.worldTime += worldDt;

  if (state.bannerTimer > 0) state.bannerTimer = Math.max(0, state.bannerTimer - rawDt);
  if (state.damageFlash > 0) state.damageFlash = Math.max(0, state.damageFlash - rawDt);
  if (state.screenShake > 0) state.screenShake = Math.max(0, state.screenShake - rawDt * 28);
  if (state.camera) state.camera.shake = state.screenShake;

  if (state.stats.comboTimer > 0) {
    state.stats.comboTimer -= rawDt;
    if (state.stats.comboTimer <= 0) state.stats.combo = 0;
  }

  // Player cooldowns (unaffected by Bullet-Time!)
  p.invulnTimer = Math.max(0, p.invulnTimer - playerDt);
  p.dashCooldown = Math.max(0, p.dashCooldown - playerDt);
  p.sliceCooldown = Math.max(0, p.sliceCooldown - playerDt);
  p.shootCooldown = Math.max(0, p.shootCooldown - playerDt);
  p.bulletTimeCooldown = Math.max(0, p.bulletTimeCooldown - playerDt);
  p.bulletTimeTimer = Math.max(0, p.bulletTimeTimer - playerDt);
  p.jackpotCooldown = Math.max(0, p.jackpotCooldown - playerDt);
  p.jackpotAnim = Math.max(0, p.jackpotAnim - playerDt);
  p.energy = Math.min(p.maxEnergy, p.energy + (inBulletTime ? 3.5 : 8.5) * playerDt);

  if (Math.hypot(aimVec.x, aimVec.y) > 0.1) {
    p.aimAngle = Math.atan2(aimVec.y, aimVec.x);
  } else if (Math.hypot(moveVec.x, moveVec.y) > 0.15) {
    p.aimAngle = Math.atan2(moveVec.y, moveVec.x);
  }

  // Player movement
  if (p.sliceTimer > 0) {
    p.sliceTimer -= playerDt;
    p.vx = p.sliceVx;
    p.vy = p.sliceVy;
  } else {
    p.vx += moveVec.x * window.CASINO_WORLD.ACCEL * playerDt;
    p.vy += moveVec.y * window.CASINO_WORLD.ACCEL * playerDt;
    const damp = Math.exp(-window.CASINO_WORLD.DRAG * playerDt);
    p.vx *= damp;
    p.vy *= damp;
    const spd = Math.hypot(p.vx, p.vy);
    if (spd > window.CASINO_WORLD.MAX_SPEED && p.dashCooldown < 0.45) {
      const s = window.CASINO_WORLD.MAX_SPEED / spd;
      p.vx *= s;
      p.vy *= s;
    }
  }

  p.x += p.vx * playerDt;
  p.y += p.vy * playerDt;
  p.x = Math.max(46, Math.min(window.CASINO_WORLD.WIDTH - 46, p.x));
  p.y = Math.max(46, Math.min(window.CASINO_WORLD.HEIGHT - 46, p.y));

  for (let i = 0; i < state.coverTables.length; i += 1) {
    resolveCircleRectCollision(p, state.coverTables[i]);
  }

  // Smooth camera tracking
  const lookAheadX = Math.cos(p.aimAngle) * 42;
  const lookAheadY = Math.sin(p.aimAngle) * 28;
  const lerp = Math.min(1, playerDt * 7.5);
  state.camera.x += (p.x + lookAheadX - state.camera.x) * lerp;
  state.camera.y += (p.y + lookAheadY - state.camera.y) * lerp;

  window.CasinoAudio?.setTimeDilationAudio?.(inBulletTime, state.bossSpawned);

  // Orbiting Roulette Guard Mines (slow down cleanly during Bullet-Time!)
  for (let i = 0; i < state.rouletteMines.length; i += 1) {
    const m = state.rouletteMines[i];
    const gate = state.gates[m.id];
    if (gate && gate.broken) continue;
    m.angle += m.speed * worldDt;
    m.x = m.cx + Math.cos(m.angle) * m.orbitR;
    m.y = m.cy + Math.sin(m.angle) * m.orbitR;
    if (Math.hypot(m.x - p.x, m.y - p.y) <= m.radius + p.radius) {
      applyPlayerDamage(state, 13, 'ليزر الروليت');
    }
  }

  // Pickup Chips
  for (let i = state.orbs.length - 1; i >= 0; i -= 1) {
    const o = state.orbs[i];
    if (Math.hypot(o.x - p.x, o.y - p.y) <= o.radius + p.radius + 10) {
      if (o.kind === 'hp') {
        p.hp = Math.min(p.maxHp, p.hp + 26);
        window.addCasinoFloatText(state, o.x, o.y - 12, '+26 درع', '#34d399', 0.9);
      } else {
        p.energy = Math.min(p.maxEnergy, p.energy + 35);
        window.addCasinoFloatText(state, o.x, o.y - 12, '+35 تدفق', '#fbbf24', 0.9);
      }
      window.CasinoAudio?.playChipPickup?.(o.kind);
      state.orbs.splice(i, 1);
    }
  }

  // Spawn vault reinforcements
  state.spawnTimer -= worldDt;
  const maxEnemies = state.bossSpawned ? 5 : 6 + state.stats.brokenGates;
  if (state.spawnTimer <= 0 && state.enemies.length < maxEnemies) {
    state.spawnTimer = state.bossSpawned ? 4.4 : 3.2;
    window.spawnCasinoEnemy(state);
  }

  // Update player Quantum Chips (can ricochet off poker tables when Bullet-Time is active!)
  for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
    const pr = state.projectiles[i];
    const prevX = pr.x;
    const prevY = pr.y;
    pr.x += pr.vx * playerDt;
    pr.y += pr.vy * playerDt;
    pr.angle += 12 * playerDt;
    pr.life -= playerDt;

    if (pr.life <= 0 || pr.x < 22 || pr.x > window.CASINO_WORLD.WIDTH - 22 || pr.y < 22 || pr.y > window.CASINO_WORLD.HEIGHT - 22) {
      state.projectiles.splice(i, 1);
      continue;
    }

    // Cover table collision / ricochet
    let destroyed = false;
    for (let t = 0; t < state.coverTables.length; t += 1) {
      const rect = state.coverTables[t];
      if (pointInsideRect(pr.x, pr.y, pr.radius, rect)) {
        if (pr.bounces > 0) {
          pr.bounces -= 1;
          if (prevX < rect.x || prevX > rect.x + rect.w) pr.vx = -pr.vx;
          else pr.vy = -pr.vy;
          pr.x = prevX + pr.vx * playerDt;
          pr.y = prevY + pr.vy * playerDt;
          window.spawnCasinoParticles(state, pr.x, pr.y, 4, '#c084fc', 120);
        } else {
          window.spawnCasinoParticles(state, pr.x, pr.y, 4, '#94a3b8', 90);
          destroyed = true;
        }
        break;
      }
    }
    if (destroyed) {
      state.projectiles.splice(i, 1);
      continue;
    }

    for (let j = state.enemies.length - 1; j >= 0; j -= 1) {
      const e = state.enemies[j];
      const hitDist = e.shieldActive ? e.radius + pr.radius + 14 : e.radius + pr.radius;
      if (Math.hypot(pr.x - e.x, pr.y - e.y) <= hitDist) {
        let bypassShield = false;
        if (e.shieldActive) {
          const hitAng = Math.atan2(pr.y - e.y, pr.x - e.x);
          const diff = Math.abs(shortestAngleDiff(hitAng, e.shieldAngle));
          if (diff <= (e.shieldGapHalf || 0.5)) {
            bypassShield = true;
            window.addCasinoFloatText(state, e.x, e.y - e.radius - 16, 'اختراق نافذة النجاح p!', '#34d399', 0.9);
          }
        }
        window.damageCasinoEnemy(state, e, pr.dmg, false, bypassShield);
        state.projectiles.splice(i, 1);
        break;
      }
    }
  }

  // Update Enemy AI & Projectiles (affected by Bullet-Time 0.28x!)
  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const e = state.enemies[i];
    e.animPhase += worldDt * 4.0;
    if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - playerDt);

    if (e.shieldActive) {
      e.shieldAngle += (e.kind === 'boss' ? 1.05 : 1.55) * worldDt;
    } else if (e.shieldRechargeTimer > 0 && (e.kind === 'boss' && e.phase >= 3 || e.kind === 'enforcer_markov' && state.stats.brokenGates >= 1)) {
      e.shieldRechargeTimer -= worldDt;
      if (e.shieldRechargeTimer <= 0) {
        e.shieldActive = true;
        e.shieldHp = e.shieldMaxHp;
        window.addCasinoFloatText(state, e.x, e.y - e.radius - 14, 'تجديد الدرع!', '#fbbf24', 1.1);
      }
    }

    if (e.stunTimer > 0) {
      e.stunTimer -= worldDt;
      continue;
    }

    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const dist = Math.hypot(dx, dy);
    const nx = dist > 1 ? dx / dist : 1;
    const ny = dist > 1 ? dy / dist : 0;

    if (e.kind === 'guard_card') {
      e.vx = nx * e.speed;
      e.vy = ny * e.speed;
      e.shootTimer -= worldDt;
      if (e.shootTimer <= 0 && dist < 540) {
        e.shootTimer = 2.05;
        const baseA = Math.atan2(dy, dx);
        for (const off of [-0.14, 0.14]) {
          state.enemyProjectiles.push({
            x: e.x, y: e.y,
            vx: Math.cos(baseA + off) * 320,
            vy: Math.sin(baseA + off) * 320,
            radius: 7, dmg: e.dmg, life: 2.3, color: '#34d399', isCard: true
          });
        }
      }
    } else if (e.kind === 'turret_dice') {
      const desired = 310;
      const push = dist < desired - 40 ? -1 : dist > desired + 50 ? 1 : 0;
      e.vx = nx * e.speed * push;
      e.vy = ny * e.speed * push;
      e.shootTimer -= worldDt;
      if (e.shootTimer <= 0 && dist < 640) {
        e.shootTimer = 1.95;
        const baseA = Math.atan2(dy, dx);
        for (const off of [-0.22, 0, 0.22]) {
          state.enemyProjectiles.push({
            x: e.x, y: e.y,
            vx: Math.cos(baseA + off) * 290,
            vy: Math.sin(baseA + off) * 290,
            radius: 7.5, dmg: e.dmg, life: 2.6, color: '#22d3ee', isCard: false
          });
        }
      }
    } else if (e.kind === 'enforcer_markov') {
      e.vx = nx * e.speed;
      e.vy = ny * e.speed;
      e.shootTimer -= worldDt;
      if (e.shootTimer <= 0 && dist < 560) {
        e.shootTimer = 2.3;
        for (let k = 0; k < 6; k += 1) {
          const a = e.animPhase * 0.4 + (k * Math.PI) / 3;
          state.enemyProjectiles.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * 245,
            vy: Math.sin(a) * 245,
            radius: 8, dmg: e.dmg, life: 2.5, color: '#fbbf24', isCard: false
          });
        }
      }
    } else if (e.kind === 'boss') {
      const desired = 270;
      const moveScale = dist > desired ? 1 : (dist < desired - 55 ? -0.55 : 0.25);
      e.vx = (nx * moveScale - ny * 0.45) * e.speed;
      e.vy = (ny * moveScale + nx * 0.45) * e.speed;

      e.shootTimer -= worldDt;
      if (e.shootTimer <= 0) {
        e.shootTimer = e.phase === 3 ? 1.05 : e.phase === 2 ? 1.25 : 1.48;
        const count = e.phase >= 2 ? 10 : 7;
        for (let k = 0; k < count; k += 1) {
          const a = e.animPhase * 0.35 + (k * Math.PI * 2) / count;
          state.enemyProjectiles.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * 265,
            vy: Math.sin(a) * 265,
            radius: 8.5, dmg: e.dmg, life: 3.1, color: e.phase === 3 ? '#fbbf24' : '#c084fc', isCard: k % 2 === 0
          });
        }
      }

      if (e.phase >= 2) {
        e.beamTimer -= worldDt;
        if (e.beamTimer <= 0) {
          e.beamTimer = e.phase === 3 ? 3.8 : 4.6;
          const horiz = Math.random() < 0.5;
          const bAngle = horiz ? 0 : Math.PI * 0.5;
          state.bossBeams.push({
            x: e.x, y: e.y,
            angle: bAngle,
            charge: 0.95,
            active: 0.48,
            label: horiz ? 'شعاع P(A∩B)' : 'شعاع P(A∪B)'
          });
          window.CasinoAudio?.playBeamCharge?.();
        }
      }
    }

    e.x += e.vx * worldDt;
    e.y += e.vy * worldDt;
    e.x = Math.max(46, Math.min(window.CASINO_WORLD.WIDTH - 46, e.x));
    e.y = Math.max(46, Math.min(window.CASINO_WORLD.HEIGHT - 46, e.y));

    if (e.kind !== 'boss') {
      for (let t = 0; t < state.coverTables.length; t += 1) {
        resolveCircleRectCollision(e, state.coverTables[t]);
      }
    }

    if (dist <= e.radius + p.radius) {
      if (e.kind === 'boss') {
        const pushX = dist > 1 ? dx / dist : 1;
        const pushY = dist > 1 ? dy / dist : 0;
        p.x = e.x + pushX * (e.radius + p.radius + 14);
        p.y = e.y + pushY * (e.radius + p.radius + 14);
      }
      applyPlayerDamage(state, e.dmg, e.kind === 'boss' ? 'نواة برنولي' : 'حارس');
    }
  }

  // Update Boss Roulette Beams
  for (let i = state.bossBeams.length - 1; i >= 0; i -= 1) {
    const b = state.bossBeams[i];
    if (b.charge > 0) {
      b.charge -= worldDt;
      if (b.charge <= 0) window.CasinoAudio?.playBeamFire?.();
    } else {
      b.active -= worldDt;
      const x1 = b.x - Math.cos(b.angle) * 1400;
      const y1 = b.y - Math.sin(b.angle) * 1400;
      const x2 = b.x + Math.cos(b.angle) * 1400;
      const y2 = b.y + Math.sin(b.angle) * 1400;
      if (distPointToSegment(p.x, p.y, x1, y1, x2, y2) <= p.radius + 13) {
        applyPlayerDamage(state, 20, b.label);
      }
      if (b.active <= 0) state.bossBeams.splice(i, 1);
    }
  }

  // Update Enemy Projectiles (blocked by solid poker tables + slowed 0.28x in Bullet-Time!)
  for (let i = state.enemyProjectiles.length - 1; i >= 0; i -= 1) {
    const ep = state.enemyProjectiles[i];
    ep.x += ep.vx * worldDt;
    ep.y += ep.vy * worldDt;
    ep.life -= worldDt;

    if (ep.life <= 0 || ep.x < 16 || ep.x > window.CASINO_WORLD.WIDTH - 16 || ep.y < 16 || ep.y > window.CASINO_WORLD.HEIGHT - 16) {
      state.enemyProjectiles.splice(i, 1);
      continue;
    }

    let blockedByCover = false;
    for (let t = 0; t < state.coverTables.length; t += 1) {
      if (pointInsideRect(ep.x, ep.y, ep.radius * 0.7, state.coverTables[t])) {
        blockedByCover = true;
        window.spawnCasinoParticles(state, ep.x, ep.y, 3, '#94a3b8', 70);
        break;
      }
    }
    if (blockedByCover) {
      state.enemyProjectiles.splice(i, 1);
      continue;
    }

    const d = Math.hypot(ep.x - p.x, ep.y - p.y);
    if (p.bulletTimeTimer > 0 && d <= p.radius + 26) {
      window.spawnCasinoParticles(state, ep.x, ep.y, 5, '#c084fc', 120);
      window.CasinoAudio?.playShieldDeflect?.();
      state.enemyProjectiles.splice(i, 1);
      continue;
    }
    if (d <= ep.radius + p.radius) {
      applyPlayerDamage(state, ep.dmg, 'طلقة حارس');
      state.enemyProjectiles.splice(i, 1);
    }
  }

  // Particles & Floating Texts
  for (let i = state.particles.length - 1; i >= 0; i -= 1) {
    const pt = state.particles[i];
    pt.x += pt.vx * playerDt;
    pt.y += pt.vy * playerDt;
    pt.vx *= 0.94;
    pt.vy *= 0.94;
    pt.life -= playerDt;
    if (pt.life <= 0) state.particles.splice(i, 1);
  }

  for (let i = state.floatingTexts.length - 1; i >= 0; i -= 1) {
    const ft = state.floatingTexts[i];
    ft.y -= 28 * playerDt;
    ft.life -= playerDt;
    if (ft.life <= 0) state.floatingTexts.splice(i, 1);
  }
};
