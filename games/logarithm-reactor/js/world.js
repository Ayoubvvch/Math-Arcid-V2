/**
 * Logarithm Reactor (مفاعل اللوغاريتم والأسي) - 2D Bio-Cyber Metroidvania Lab Simulation
 * Facility Dimensions: 2800 x 1800 across 4 Containment Wings (α, β, γ, δ) + Central Reactor Core.
 * Features one-way Metroidvania catwalks, vertical bio-elevators, ln(x<=0) acid pools,
 * 3 enemy archetypes with stagger/execute, 6 PlayStation abilities, and 3-Phase Asymptote Boss.
 */

window.REACTOR_WORLD = {
  WIDTH: 2800,
  HEIGHT: 1800,
  GRAVITY: 1280,
  JUMP_VEL: -635,
  DOUBLE_JUMP_VEL: -595,
  MAX_FALL: 780,
  MAX_PARTICLES: 160
};

window.createInitialReactorState = function(topicFilter = 'all') {
  const sectors = window.REACTOR_SECTORS || [];

  // Interconnected Metroidvania Catwalks, Decks & Moving Bio-Elevators
  // All catwalks support smooth jump-through from below and drop-through with Down+Jump
  const platforms = [
    // Solid Reactor Sub-Floor
    { x: 40, y: 1730, w: 2720, h: 70, label: 'قاع الاحتواء الرئيسي', solid: true, oscAxis: null },

    // Central Reactor Atrium & Spine (x: 1120..1680)
    { x: 1180, y: 500, w: 440, h: 20, label: 'منصة الانطلاق المركزية (ln 1 = 0)', oscAxis: null },
    { x: 1220, y: 780, w: 360, h: 20, label: 'جسر المفاعل الأوسط', oscAxis: null },
    { x: 1180, y: 1030, w: 440, h: 20, label: 'قاعة نواة المقاربات', oscAxis: null },
    { x: 1220, y: 1320, w: 360, h: 20, label: 'ممر المشتقات u\'/u', oscAxis: null },
    { x: 1180, y: 1550, w: 440, h: 20, label: 'بوابة التبريد السفلية', oscAxis: null },

    // Twin Vertical Bio-Elevators bridging upper & lower wings
    { x: 1020, y: 720, w: 130, h: 18, label: 'مصعد α↔γ', oscAxis: 'y', baseY: 960, amp: 460, freq: 0.72, prevX: 1020, prevY: 720 },
    { x: 1650, y: 1120, w: 130, h: 18, label: 'مصعد β↔δ', oscAxis: 'y', baseY: 960, amp: 460, freq: 0.72, phaseOffset: Math.PI, prevX: 1650, prevY: 1120 },

    // Wing α (Top-Left: Topics 65-67, Seal 1 at (330, 310))
    { x: 740, y: 640, w: 260, h: 18, label: 'x > 0 (شرط اللوغاريتم)', oscAxis: null },
    { x: 420, y: 760, w: 310, h: 18, label: 'D_ln = ]0, +∞[', oscAxis: null },
    { x: 140, y: 630, w: 250, h: 18, label: 'ln(ab) = ln a + ln b', oscAxis: null },
    { x: 460, y: 500, w: 260, h: 18, label: 'ln(a/b) = ln a - ln b', oscAxis: null },
    { x: 180, y: 390, w: 320, h: 20, label: 'غرفة الختم α (ln e = 1)', oscAxis: null },
    { x: 690, y: 310, w: 220, h: 18, label: 'جسر الأساس a', oscAxis: 'x', baseX: 740, amp: 90, freq: 1.05, prevX: 690, prevY: 310 },

    // Wing β (Top-Right: Topics 68-70, Seal 2 at (2470, 310))
    { x: 1800, y: 640, w: 260, h: 18, label: 'lim (ln x)/x = 0', oscAxis: null },
    { x: 2070, y: 760, w: 310, h: 18, label: 'lim x·ln x = 0', oscAxis: null },
    { x: 2400, y: 630, w: 260, h: 18, label: '(ln|u|)\' = u\'/u', oscAxis: null },
    { x: 2070, y: 500, w: 260, h: 18, label: 'ln x ≤ x - 1', oscAxis: null },
    { x: 2300, y: 390, w: 320, h: 20, label: 'غرفة الختم β (u\'/u)', oscAxis: null },
    { x: 1840, y: 310, w: 220, h: 18, label: 'مماس x₀ = 1', oscAxis: 'x', baseX: 1890, amp: 90, freq: 1.1, prevX: 1840, prevY: 310 },

    // Wing γ (Bottom-Left: Topics 71-74, Seal 3 at (330, 1150))
    { x: 720, y: 1520, w: 270, h: 18, label: 'eˣ > 0 قطعا على ℝ', oscAxis: null },
    { x: 140, y: 1560, w: 310, h: 18, label: 'e^{ln x} = x', oscAxis: null },
    { x: 450, y: 1410, w: 260, h: 18, label: 'e^{a+b} = eᵃ·eᵇ', oscAxis: null },
    { x: 760, y: 1280, w: 250, h: 18, label: '(eᵘ)\' = u\'·eᵘ', oscAxis: null },
    { x: 180, y: 1230, w: 320, h: 20, label: 'غرفة الختم γ (exp = ln⁻¹)', oscAxis: null },
    { x: 460, y: 1080, w: 240, h: 18, label: 'aˣ = e^{x ln a}', oscAxis: 'x', baseX: 500, amp: 85, freq: 1.0, prevX: 460, prevY: 1080 },

    // Wing δ (Bottom-Right: Topics 75-78, Seal 4 at (2470, 1150))
    { x: 1810, y: 1520, w: 270, h: 18, label: 'lim (eˣ - 1)/x = 1', oscAxis: null },
    { x: 2350, y: 1560, w: 310, h: 18, label: 'lim eˣ/xⁿ = +∞', oscAxis: null },
    { x: 2090, y: 1410, w: 260, h: 18, label: 'lim xⁿ·eˣ = 0 (-∞)', oscAxis: null },
    { x: 1790, y: 1280, w: 250, h: 18, label: 'eˣ ≥ x + 1', oscAxis: null },
    { x: 2300, y: 1230, w: 320, h: 20, label: 'غرفة الختم δ (النمو المقارن)', oscAxis: null },
    { x: 2040, y: 1080, w: 240, h: 18, label: 'فرع شلجمي (Oy)', oscAxis: 'x', baseX: 2080, amp: 85, freq: 1.05, prevX: 2040, prevY: 1080 }
  ];

  // Bio-Acid Containment Vats on the sub-floor (hazardous ln(x <= 0) pools)
  const acidPools = [
    { x: 470, y: 1712, w: 380, h: 22, label: 'حمض ln(x ≤ 0)' },
    { x: 1950, y: 1712, w: 380, h: 22, label: 'حمض ln(x ≤ 0)' }
  ];

  // 4 Reactor Containment Seals (one in each Wing α, β, γ, δ)
  const gatePositions = [
    { x: 340, y: 334, glyph: 'ln x' },
    { x: 2460, y: 334, glyph: 'u\'/u' },
    { x: 340, y: 1174, glyph: 'eˣ' },
    { x: 2460, y: 1174, glyph: 'eˣ≫xⁿ' }
  ];

  const gates = gatePositions.map((pos, idx) => {
    const sec = sectors[idx] || { id: idx + 1, name: `الجناح ${idx + 1}`, topics: [65 + idx * 3], color: '#10b981' };
    return {
      id: idx,
      x: pos.x,
      y: pos.y,
      glyph: pos.glyph,
      radius: 40,
      sectorName: sec.name,
      topics: sec.topics,
      color: sec.color,
      broken: false,
      pulse: idx * 1.3
    };
  });

  // Bio-Cells (HP) & Exponential Cores (Energy) across the lab
  const orbs = [
    { id: 1, x: 870, y: 600, radius: 12, kind: 'energy' },
    { id: 2, x: 1930, y: 600, radius: 12, kind: 'hp' },
    { id: 3, x: 575, y: 460, radius: 12, kind: 'hp' },
    { id: 4, x: 2200, y: 460, radius: 12, kind: 'energy' },
    { id: 5, x: 580, y: 1370, radius: 12, kind: 'energy' },
    { id: 6, x: 2220, y: 1370, radius: 12, kind: 'hp' },
    { id: 7, x: 1400, y: 740, radius: 12, kind: 'hp' },
    { id: 8, x: 1400, y: 1280, radius: 12, kind: 'energy' }
  ];

  const state = {
    mode: 'intro', // 'intro' | 'play' | 'override' | 'pause' | 'end'
    topicFilter,
    time: 0,
    screenShake: 0,
    damageFlash: 0,
    bannerText: 'الجناح α — اخترق أختام الاحتواء الأربعة عبر اللوغاريتم والأسية (65–78)',
    bannerTimer: 4.5,

    player: {
      x: 1400,
      y: 455,
      vx: 0,
      vy: 0,
      radius: 19,
      facing: 1,
      aimAngle: 0,
      hp: 100,
      maxHp: 100,
      energy: 100,
      maxEnergy: 100,
      grounded: false,
      coyoteTimer: 0,
      jumpBuffer: 0,
      jumpsLeft: 2,
      dropThroughTimer: 0,
      invulnTimer: 0,
      dashTimer: 0,
      dashCooldown: 0,
      dashVx: 0,
      dashVy: 0,
      pulseCooldown: 0,
      aegisCooldown: 0,
      aegisTimer: 0,
      overdriveCooldown: 0,
      ridingPlatform: null
    },

    platforms,
    acidPools,
    gates,
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

  // Seed initial wing patrols so the lab feels alive immediately
  window.spawnReactorEnemy(state, 'mutant_ln', 560, 720);
  window.spawnReactorEnemy(state, 'drone_exp', 2160, 620);
  window.spawnReactorEnemy(state, 'mutant_ln', 580, 1480);
  window.spawnReactorEnemy(state, 'sentinel_asym', 2220, 1360);

  return state;
};

window.spawnReactorParticles = function(state, x, y, count = 12, color = '#10b981', maxSpd = 230) {
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
  while (parts.length > window.REACTOR_WORLD.MAX_PARTICLES) parts.shift();
};

window.addReactorFloatText = function(state, x, y, text, color = '#a3e635', life = 1.2) {
  state.floatingTexts.push({ x, y, text, color, life, maxLife: life });
  if (state.floatingTexts.length > 26) state.floatingTexts.shift();
};

window.setReactorBanner = function(state, text, dur = 3.2) {
  state.bannerText = text;
  state.bannerTimer = dur;
};

window.spawnReactorEnemy = function(state, forceKind = null, forceX = null, forceY = null) {
  const p = state.player;
  const broken = state.stats.brokenGates;
  let kind = forceKind;
  if (!kind) {
    const r = Math.random();
    if (r < 0.42) kind = 'mutant_ln';
    else if (r < 0.78) kind = 'drone_exp';
    else kind = 'sentinel_asym';
  }

  let sx = forceX;
  let sy = forceY;
  if (sx === null || sy === null) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 420 + Math.random() * 140;
    sx = Math.max(100, Math.min(window.REACTOR_WORLD.WIDTH - 100, p.x + Math.cos(ang) * dist));
    sy = Math.max(160, Math.min(window.REACTOR_WORLD.HEIGHT - 120, p.y + Math.sin(ang) * dist));
  }
  if (kind === 'boss') {
    sx = 1400;
    sy = 920;
  }

  const mult = 1 + broken * 0.16;
  const cfg = {
    mutant_ln: { r: 19, hp: Math.round(48 * mult), speed: 155 + broken * 10, dmg: 12, label: 'ln(x≤0)', color: '#84cc16' },
    drone_exp: { r: 18, hp: Math.round(44 * mult), speed: 148 + broken * 8, dmg: 11, label: 'e^{kx}', color: '#f59e0b' },
    sentinel_asym: { r: 26, hp: Math.round(98 * mult), speed: 96 + broken * 6, dmg: 17, label: 'u\'/u', color: '#22d3ee' },
    boss: { r: 52, hp: 620, speed: 122, dmg: 22, label: 'مُفاعل المقاربات الأعظم', color: '#a855f7' }
  }[kind];

  state.enemies.push({
    id: state.nextEnemyId++,
    kind,
    label: cfg.label,
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
    shieldActive: false,
    shieldHp: 0,
    shieldMaxHp: 140,
    phase: 1,
    shootTimer: kind === 'boss' ? 1.5 : 2.1,
    beamTimer: 0,
    hopTimer: 0.6,
    animPhase: Math.random() * Math.PI * 2
  });
};

window.spawnAsymptoteBoss = function(state) {
  if (state.bossSpawned) return;
  state.bossSpawned = true;
  window.spawnReactorEnemy(state, 'boss');
  state.screenShake = Math.max(state.screenShake, 16);
  window.ReactorAudio?.playOverdrive?.();
  window.triggerReactorHaptic?.(170, 0.65, 0.9);
  window.setReactorBanner(state, '☢ تحطمت الأختام الأربعة — مُفاعل المقاربات الأعظم استيقظ في قلب المختبر!', 5.0);
  window.addReactorFloatText(state, state.player.x, state.player.y - 44, 'BOSS: قلب المفاعل (1400, 920)!', '#a855f7', 2.4);
};

window.damageReactorEnemy = function(state, enemy, dmg, forceKill = false, ignoreShield = false) {
  if (enemy.kind === 'boss' && enemy.shieldActive && !ignoreShield && !forceKill) {
    enemy.shieldHp = Math.max(0, enemy.shieldHp - dmg);
    enemy.hitFlash = 0.08;
    window.spawnReactorParticles(state, enemy.x, enemy.y, 5, '#22d3ee', 140);
    if (enemy.shieldHp <= 0) {
      enemy.shieldActive = false;
      enemy.staggered = true;
      window.ReactorAudio?.playAegis?.();
      window.addReactorFloatText(state, enemy.x, enemy.y - enemy.radius - 16, 'انكسر الدرع اللوغاريتمي! [▢ / E]', '#34d399', 1.8);
    }
    return false;
  }

  enemy.hp -= dmg;
  enemy.hitFlash = 0.14;
  window.spawnReactorParticles(state, enemy.x, enemy.y, 8, enemy.color || '#10b981', 190);

  // Boss Phase Escalation: Phase 2 (<= 65%) -> Phase 3 (<= 30%)
  if (enemy.kind === 'boss' && enemy.hp > 0) {
    const frac = enemy.hp / enemy.maxHp;
    if (enemy.phase === 1 && frac <= 0.65) {
      enemy.phase = 2;
      enemy.beamTimer = 1.0;
      window.ReactorAudio?.playBeamCharge?.();
      window.setReactorBanner(state, '⚠ الطور 2: أشعة المقاربات الأفقية والعمودية (x=0, y=0)!', 3.8);
      window.addReactorFloatText(state, enemy.x, enemy.y - 60, 'الطور 2: أشعة المقاربات!', '#f59e0b', 1.8);
    }
    if (enemy.phase < 3 && frac <= 0.30) {
      enemy.phase = 3;
      enemy.shieldActive = true;
      enemy.shieldHp = enemy.shieldMaxHp;
      window.ReactorAudio?.playOverdrive?.();
      window.setReactorBanner(state, '☢ الطور 3: درع الاحتواء اللوغاريتمي! اكسره بـ [△] أو [L2]!', 4.2);
      window.addReactorFloatText(state, enemy.x, enemy.y - 62, 'درع ln(x) نشط — استعمل [△] أو [L2]!', '#22d3ee', 2.0);
    }
  }

  if (!enemy.staggered && enemy.hp > 0 && enemy.hp <= enemy.maxHp * 0.36 && (enemy.kind === 'sentinel_asym' || (enemy.kind === 'boss' && !enemy.shieldActive))) {
    enemy.staggered = true;
    window.addReactorFloatText(state, enemy.x, enemy.y - enemy.radius - 14, 'مشلول! [▢ / E] تفكيك النواة', '#fbbf24', 1.6);
  }

  if (enemy.hp <= 0 || forceKill) {
    const idx = state.enemies.indexOf(enemy);
    if (idx !== -1) state.enemies.splice(idx, 1);

    state.stats.kills++;
    state.stats.combo++;
    state.stats.comboTimer = 4.2;
    const mult = Math.min(5, 1 + Math.floor(state.stats.combo / 3));
    const pts = (enemy.kind === 'boss' ? 1800 : enemy.kind === 'sentinel_asym' ? 180 : 90) * mult;
    state.stats.score += pts;
    state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 14);

    window.spawnReactorParticles(state, enemy.x, enemy.y, enemy.kind === 'boss' ? 44 : 16, '#84cc16', 280);
    window.addReactorFloatText(state, enemy.x, enemy.y - 18, `+${pts}`, '#34d399', 0.95);

    if (enemy.kind !== 'boss' && Math.random() < 0.36) {
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
      window.ReactorAudio?.playVictory?.();
      window.triggerReactorHaptic?.(220, 0.75, 1.0);
      window.finishReactorGame(state, true);
    }
    return true;
  }
  return false;
};

// [✕ / Space / W]: Double-Jump Bio-Thruster (supports coyote time & drop-through when holding Down)
window.performReactorJump = function(state, holdingDown = false) {
  const p = state.player;
  if (holdingDown && p.grounded && p.ridingPlatform && !p.ridingPlatform.solid) {
    p.dropThroughTimer = 0.24;
    p.grounded = false;
    p.y += 4;
    p.vy = 140;
    window.ReactorAudio?.playUiTick?.();
    return true;
  }

  if (p.grounded || p.coyoteTimer > 0) {
    p.vy = window.REACTOR_WORLD.JUMP_VEL;
    p.grounded = false;
    p.coyoteTimer = 0;
    p.jumpsLeft = 1;
    window.ReactorAudio?.playJump?.(false);
    window.spawnReactorParticles(state, p.x, p.y + p.radius, 8, '#34d399', 140);
    return true;
  }

  if (p.jumpsLeft > 0) {
    p.vy = window.REACTOR_WORLD.DOUBLE_JUMP_VEL;
    p.jumpsLeft--;
    window.ReactorAudio?.playJump?.(true);
    window.spawnReactorParticles(state, p.x, p.y + p.radius, 12, '#a3e635', 180);
    window.addReactorFloatText(state, p.x, p.y - 24, 'دفع نفاث eˣ', '#bef264', 0.7);
    return true;
  }

  p.jumpBuffer = 0.14;
  return false;
};

// [◯ / Shift]: Phase Dash (e^{ln x} blink dash slicing through enemies)
window.performReactorDash = function(state, moveX) {
  const p = state.player;
  if (p.dashCooldown > 0) return false;
  p.dashCooldown = 0.78;
  p.dashTimer = 0.2;
  p.invulnTimer = Math.max(p.invulnTimer, 0.36);

  const dirX = Math.abs(moveX) > 0.15 ? Math.sign(moveX) : (p.facing || 1);
  p.dashVx = dirX * 820;
  p.dashVy = 0;

  window.ReactorAudio?.playDash?.();
  window.triggerReactorHaptic?.(65, 0.35, 0.5);
  window.spawnReactorParticles(state, p.x, p.y, 16, '#fb7185', 220);
  window.addReactorFloatText(state, p.x, p.y - 26, 'اندفاع طوري', '#fda4af', 0.8);

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (Math.hypot(e.x - p.x, e.y - p.y) <= 135) {
      window.damageReactorEnemy(state, e, 36, false, false);
    }
  }
  return true;
};

// [△ / Q]: Equivalence Bio-Aegis e^{ln x} = x (Deflects bolts, stuns enemies & shatters Boss shield)
window.performReactorAegis = function(state) {
  const p = state.player;
  if (p.aegisCooldown > 0) return false;
  p.aegisCooldown = 4.8;
  p.aegisTimer = 3.2;
  p.invulnTimer = Math.max(p.invulnTimer, 1.0);
  window.ReactorAudio?.playAegis?.();
  window.triggerReactorHaptic?.(95, 0.45, 0.65);
  window.spawnReactorParticles(state, p.x, p.y, 20, '#34d399', 230);
  window.setReactorBanner(state, '🛡️ درع التكافؤ e^{ln x} = x مفعّل — شلّ الأعداء وامتصاص القذائف', 2.4);
  window.addReactorFloatText(state, p.x, p.y - 34, '🛡️ e^{ln x} = x', '#34d399', 1.15);

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (Math.hypot(e.x - p.x, e.y - p.y) <= 270) {
      if (e.kind === 'boss' && e.shieldActive) {
        e.shieldActive = false;
        e.shieldHp = 0;
        window.addReactorFloatText(state, e.x, e.y - 68, 'تحطّم درع المفاعل!', '#34d399', 1.5);
      }
      if (e.kind !== 'boss') e.staggered = true;
      window.damageReactorEnemy(state, e, 40, false, true);
    }
  }
  return true;
};

// [R2 / J]: Derivative Bio-Plasma Shot (u'/u)
window.performReactorPulse = function(state) {
  const p = state.player;
  if (p.pulseCooldown > 0) return false;
  p.pulseCooldown = 0.17;
  const spd = 790;
  const ang = p.aimAngle;
  state.projectiles.push({
    x: p.x + Math.cos(ang) * 20,
    y: p.y + Math.sin(ang) * 20,
    vx: Math.cos(ang) * spd,
    vy: Math.sin(ang) * spd,
    dmg: 24,
    life: 1.05
  });
  window.ReactorAudio?.playPulse?.();
  return true;
};

// [L2 / F]: Growth Comparison Overdrive (e^x >> x^n)
window.performReactorOverdrive = function(state) {
  const p = state.player;
  if (p.overdriveCooldown > 0 || p.energy < 40) {
    if (p.energy < 40) window.addReactorFloatText(state, p.x, p.y - 34, 'تحتاج 40% طاقة المفاعل!', '#fbbf24', 1.0);
    return false;
  }
  p.energy -= 40;
  p.overdriveCooldown = 2.4;
  state.screenShake = Math.max(state.screenShake, 15);
  window.ReactorAudio?.playOverdrive?.();
  window.triggerReactorHaptic?.(145, 0.7, 0.9);
  window.spawnReactorParticles(state, p.x, p.y, 36, '#a855f7', 350);
  window.setReactorBanner(state, '⚡ صدمة النمو المقارن (eˣ ≫ xⁿ)!', 2.2);
  window.addReactorFloatText(state, p.x, p.y - 36, '⚡ eˣ ≫ xⁿ', '#e9d5ff', 1.2);

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    const dist = Math.hypot(e.x - p.x, e.y - p.y);
    if (dist <= 400) {
      if (e.kind === 'boss' && e.shieldActive) {
        e.shieldActive = false;
        e.shieldHp = 0;
      }
      window.damageReactorEnemy(state, e, 145, e.kind !== 'boss', true);
    }
  }
  return true;
};

window.findNearestReactorInteract = function(state) {
  const p = state.player;
  for (const e of state.enemies) {
    if (e.staggered && Math.hypot(e.x - p.x, e.y - p.y) <= 135) {
      return { kind: 'execute', enemy: e };
    }
  }
  for (const g of state.gates) {
    if (!g.broken && Math.hypot(g.x - p.x, g.y - p.y) <= 125) {
      return { kind: 'gate', gate: g };
    }
  }
  return null;
};

window.getReactorWingLabel = function(x, y) {
  if (x < 1150 && y < 900) return 'α (ln)';
  if (x > 1650 && y < 900) return 'β (u\'/u)';
  if (x < 1150 && y >= 900) return 'γ (eˣ)';
  if (x > 1650 && y >= 900) return 'δ (نمو)';
  return 'النواة';
};

window.updateReactorWorld = function(state, rawDt, moveVec, aimVec, holdingDown = false) {
  if (state.mode !== 'play' && state.mode !== 'override') return;

  const tScale = state.mode === 'override' ? 0.035 : 1.0;
  const dt = rawDt * tScale;
  state.time += rawDt;

  const p = state.player;
  const W = window.REACTOR_WORLD.WIDTH;
  const H = window.REACTOR_WORLD.HEIGHT;

  if (state.bannerTimer > 0) state.bannerTimer = Math.max(0, state.bannerTimer - rawDt);
  if (state.damageFlash > 0) state.damageFlash = Math.max(0, state.damageFlash - rawDt * 2.4);
  if (state.screenShake > 0) state.screenShake = Math.max(0, state.screenShake - rawDt * 38);

  // Move Bio-Elevators & Oscillating Catwalks
  for (const plat of state.platforms) {
    plat.prevX = plat.x;
    plat.prevY = plat.y;
    if (plat.oscAxis === 'y') {
      plat.y = plat.baseY + Math.sin(state.time * plat.freq + (plat.phaseOffset || 0)) * plat.amp;
    } else if (plat.oscAxis === 'x') {
      plat.x = plat.baseX + Math.sin(state.time * plat.freq + (plat.phaseOffset || 0)) * plat.amp;
    }
  }

  if (state.mode === 'play') {
    p.invulnTimer = Math.max(0, p.invulnTimer - dt);
    p.dashTimer = Math.max(0, p.dashTimer - dt);
    p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    p.pulseCooldown = Math.max(0, p.pulseCooldown - dt);
    p.aegisCooldown = Math.max(0, p.aegisCooldown - dt);
    p.aegisTimer = Math.max(0, p.aegisTimer - dt);
    p.overdriveCooldown = Math.max(0, p.overdriveCooldown - dt);
    p.dropThroughTimer = Math.max(0, p.dropThroughTimer - dt);
    p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
    p.energy = Math.min(p.maxEnergy, p.energy + dt * 5.8);

    if (state.stats.comboTimer > 0) {
      state.stats.comboTimer -= dt;
      if (state.stats.comboTimer <= 0) state.stats.combo = 0;
    }

    if (Math.abs(moveVec.x) > 0.12) {
      p.facing = Math.sign(moveVec.x);
    }

    if (aimVec && Math.hypot(aimVec.x, aimVec.y) > 0.16) {
      p.aimAngle = Math.atan2(aimVec.y, aimVec.x);
    } else if (Math.abs(moveVec.x) > 0.12 || Math.abs(moveVec.y) > 0.12) {
      p.aimAngle = Math.atan2(moveVec.y * 0.6, Math.abs(moveVec.x) > 0.12 ? moveVec.x : p.facing);
    } else {
      p.aimAngle = p.facing >= 0 ? 0 : Math.PI;
    }

    // Carry player smoothly if standing on a moving elevator/catwalk
    if (p.grounded && p.ridingPlatform) {
      p.x += (p.ridingPlatform.x - p.ridingPlatform.prevX);
      p.y += (p.ridingPlatform.y - p.ridingPlatform.prevY);
    }

    const prevBottom = p.y + p.radius;

    if (p.dashTimer > 0) {
      p.x += p.dashVx * dt;
      p.y += p.dashVy * dt;
    } else {
      const targetVx = moveVec.x * 340;
      p.vx += (targetVx - p.vx) * Math.min(1, dt * 15);
      p.vy = Math.min(window.REACTOR_WORLD.MAX_FALL, p.vy + window.REACTOR_WORLD.GRAVITY * dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    p.x = Math.max(44 + p.radius, Math.min(W - 44 - p.radius, p.x));
    p.y = Math.max(90, Math.min(H - p.radius, p.y));

    // One-way & Solid Platform Landing
    p.grounded = false;
    p.ridingPlatform = null;
    const newBottom = p.y + p.radius;

    if (p.vy >= 0) {
      for (const plat of state.platforms) {
        if (!plat.solid && p.dropThroughTimer > 0) continue;
        if (p.x + p.radius * 0.65 >= plat.x && p.x - p.radius * 0.65 <= plat.x + plat.w) {
          const prevPlatTop = plat.prevY !== undefined ? plat.prevY : plat.y;
          if (prevBottom <= prevPlatTop + 14 && newBottom >= plat.y - 2) {
            p.y = plat.y - p.radius;
            p.vy = 0;
            p.grounded = true;
            p.coyoteTimer = 0.12;
            p.jumpsLeft = 2;
            p.ridingPlatform = plat;
            if (p.jumpBuffer > 0 && !holdingDown) {
              p.jumpBuffer = 0;
              window.performReactorJump(state, false);
            }
            break;
          }
        }
      }
    }

    // Bio-Acid Containment Pools Hazard
    for (const pool of state.acidPools) {
      if (p.x + p.radius * 0.6 >= pool.x && p.x - p.radius * 0.6 <= pool.x + pool.w &&
          p.y + p.radius >= pool.y && p.y - p.radius <= pool.y + pool.h) {
        if (p.invulnTimer <= 0 && p.aegisTimer <= 0 && p.dashTimer <= 0) {
          applyReactorHit(state, 14, 'حمض ln(x ≤ 0)!');
          p.vy = -440;
        }
      }
    }

    // Collect Bio-Cells & Exponential Cores
    for (let i = state.orbs.length - 1; i >= 0; i--) {
      const o = state.orbs[i];
      if (Math.hypot(o.x - p.x, o.y - p.y) <= p.radius + o.radius + 10) {
        if (o.kind === 'hp') {
          p.hp = Math.min(p.maxHp, p.hp + 25);
          window.addReactorFloatText(state, p.x, p.y - 24, '+25 درع حيوي', '#34d399', 1.0);
        } else {
          p.energy = Math.min(p.maxEnergy, p.energy + 35);
          window.addReactorFloatText(state, p.x, p.y - 24, '+35% طاقة eˣ', '#fbbf24', 1.0);
        }
        window.ReactorAudio?.playUiTick?.();
        state.orbs.splice(i, 1);
      }
    }

    // Enemy Spawner
    state.spawnTimer -= dt;
    const cap = state.bossSpawned ? 7 : 5 + state.stats.brokenGates;
    if (state.spawnTimer <= 0 && state.enemies.length < cap) {
      window.spawnReactorEnemy(state);
      state.spawnTimer = Math.max(1.8, 3.2 - state.stats.brokenGates * 0.35);
    }
  }

  // Player Derivative Plasma Bolts
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const b = state.projectiles[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    let rm = b.life <= 0 || b.x < 10 || b.x > W - 10 || b.y < 10 || b.y > H - 10;
    if (!rm) {
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const e = state.enemies[j];
        if (Math.hypot(e.x - b.x, e.y - b.y) <= e.radius + 9) {
          window.damageReactorEnemy(state, e, b.dmg, false, false);
          rm = true;
          break;
        }
      }
    }
    if (rm) state.projectiles.splice(i, 1);
  }

  // Enemy Projectiles (absorbed by Bio-Aegis Shield!)
  for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
    const ep = state.enemyProjectiles[i];
    ep.x += ep.vx * dt;
    ep.y += ep.vy * dt;
    ep.life -= dt;
    let rm = ep.life <= 0;
    const distP = Math.hypot(ep.x - p.x, ep.y - p.y);
    if (!rm && p.aegisTimer > 0 && distP <= 54) {
      window.spawnReactorParticles(state, ep.x, ep.y, 5, '#34d399', 120);
      rm = true;
    } else if (!rm && distP <= p.radius + 7 && p.invulnTimer <= 0 && p.aegisTimer <= 0 && state.mode === 'play') {
      applyReactorHit(state, 12, '-12 درع');
      rm = true;
    }
    if (rm) state.enemyProjectiles.splice(i, 1);
  }

  // Boss Asymptote Lasers (Phase 2 & 3)
  for (let i = state.bossBeams.length - 1; i >= 0; i--) {
    const bm = state.bossBeams[i];
    if (bm.warnTimer > 0) {
      bm.warnTimer -= dt;
      if (bm.warnTimer <= 0) {
        window.ReactorAudio?.playBeamFire?.();
      }
    } else if (bm.activeTimer > 0) {
      bm.activeTimer -= dt;
      if (state.mode === 'play' && p.invulnTimer <= 0 && p.aegisTimer <= 0 && p.dashTimer <= 0) {
        const hitX = bm.axis === 'x' && Math.abs(p.x - bm.pos) < p.radius + 14;
        const hitY = bm.axis === 'y' && Math.abs(p.y - bm.pos) < p.radius + 14;
        if (hitX || hitY) {
          applyReactorHit(state, 18, 'شعاع المقارب!');
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
    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const dist = Math.hypot(dx, dy);

    if (state.mode === 'play' && dist > 1) {
      const spd = (e.staggered ? e.speed * 0.25 : e.speed) * slowMul;
      const baseAng = Math.atan2(dy, dx);

      if (e.kind === 'mutant_ln') {
        // Horizontal hunter with periodic hops
        e.vx = Math.sign(dx) * spd;
        e.hopTimer -= dt;
        if (e.hopTimer <= 0 && e.y >= H - 90) {
          e.hopTimer = 1.4;
          e.vy = -340;
        }
        e.vy = Math.min(480, e.vy + 750 * dt);
        e.x = Math.max(70, Math.min(W - 70, e.x + e.vx * dt));
        e.y = Math.max(140, Math.min(H - 90, e.y + e.vy * dt));
        // Gentle vertical drift toward player layer
        e.y += Math.sign(dy) * spd * 0.35 * dt;
      } else {
        const moveAng = e.kind === 'drone_exp' ? baseAng + Math.sin(e.animPhase) * 0.55 : baseAng;
        e.x = Math.max(80, Math.min(W - 80, e.x + Math.cos(moveAng) * spd * dt));
        e.y = Math.max(120, Math.min(H - 100, e.y + Math.sin(moveAng) * spd * dt));
      }

      if (e.kind === 'sentinel_asym' || e.kind === 'boss') {
        e.shootTimer -= dt;
        if (e.shootTimer <= 0 && !e.staggered) {
          e.shootTimer = e.kind === 'boss' ? (e.phase === 3 ? 1.35 : 1.75) : 2.3;
          const offsets = e.kind === 'boss' ? [-0.36, -0.18, 0, 0.18, 0.36] : [-0.15, 0.15];
          for (const off of offsets) {
            state.enemyProjectiles.push({
              x: e.x, y: e.y,
              vx: Math.cos(baseAng + off) * 320,
              vy: Math.sin(baseAng + off) * 320,
              life: 2.6,
              color: e.kind === 'boss' ? '#a855f7' : '#22d3ee'
            });
          }
        }
      }

      // Boss Phase 2+ Telegraphed Asymptote Laser Beams
      if (e.kind === 'boss' && e.phase >= 2 && !e.staggered) {
        e.beamTimer -= dt;
        if (e.beamTimer <= 0) {
          e.beamTimer = e.phase === 3 ? 3.2 : 4.1;
          window.ReactorAudio?.playBeamCharge?.();
          state.bossBeams.push({
            axis: Math.random() < 0.5 ? 'x' : 'y',
            pos: Math.random() < 0.5 ? p.x : p.y,
            warnTimer: 1.05,
            activeTimer: 0.65
          });
        }
      }

      if (p.aegisTimer > 0 && dist <= 56 + e.radius) {
        window.damageReactorEnemy(state, e, 30 * dt, false, true);
      } else if (!e.staggered && dist <= p.radius + e.radius + 3 && p.invulnTimer <= 0 && p.aegisTimer <= 0 && p.dashTimer <= 0) {
        applyReactorHit(state, e.dmg, `-${e.dmg} درع`);
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

function applyReactorHit(state, dmg, msg) {
  const p = state.player;
  if (p.hp <= 0 || state.mode !== 'play') return;
  p.hp = Math.max(0, p.hp - dmg);
  p.invulnTimer = 0.78;
  state.damageFlash = 1.0;
  state.screenShake = Math.max(state.screenShake, 11);
  window.ReactorAudio?.playDamage?.();
  window.triggerReactorHaptic?.(120, 0.65, 0.85);
  window.addReactorFloatText(state, p.x, p.y - 24, msg, '#fb7185', 1.1);
  if (p.hp <= 0) {
    window.finishReactorGame(state, false);
  }
}
