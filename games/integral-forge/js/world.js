/**
 * Integral Forge (محرقة التكامل والمعادلات) - 2D Heavy Mech Siege & Area Slicer Simulation
 * Foundry Dimensions: 2600 x 1700 across 4 Industrial Forge Wings (α, β, γ, δ) + Central Crucible.
 * Features magnetic gantry cranes, one-way forge catwalks, molten slag cooling channels,
 * 3 enemy archetypes with stagger/execute, Area Slicer cleave, and 3-Phase Differential Boss.
 */

window.FORGE_WORLD = {
  WIDTH: 2600,
  HEIGHT: 1700,
  GRAVITY: 1260,
  JUMP_VEL: -670,
  DOUBLE_JUMP_VEL: -620,
  MAX_FALL: 790,
  MAX_PARTICLES: 170
};

window.createInitialForgeState = function(topicFilter = 'all') {
  const sectors = window.FORGE_SECTORS || [];

  // Interconnected Foundry Catwalks, Crucible Decks & Twin Magnetic Gantry Cranes
  const platforms = [
    // Solid Foundry Sub-Floor
    { x: 40, y: 1630, w: 2520, h: 70, label: 'أرضية المحرقة الفولاذية', solid: true, oscAxis: null },

    // Central Crucible Spine (x: 1090..1510)
    { x: 1090, y: 490, w: 420, h: 20, label: 'منصة الإنطلاق TITAN-∫', oscAxis: null },
    { x: 1130, y: 760, w: 340, h: 20, label: 'جسر التكامل المحدود', oscAxis: null },
    { x: 1090, y: 1020, w: 420, h: 20, label: 'قاعة البوتقة التفاضلية', oscAxis: null },
    { x: 1130, y: 1280, w: 340, h: 20, label: 'ممر القيمة المتوسطة μ', oscAxis: null },
    { x: 1090, y: 1510, w: 420, h: 20, label: 'صمام التبريد المركزي', oscAxis: null },

    // Twin Magnetic Vertical Gantry Cranes bridging upper & lower foundry wings (490..1410)
    { x: 930, y: 950, w: 130, h: 18, label: 'رافعة α↔γ', oscAxis: 'y', baseY: 950, amp: 460, freq: 0.72, phaseOffset: 0, prevX: 930, prevY: 950, velY: 0, dockSide: 0 },
    { x: 1540, y: 950, w: 130, h: 18, label: 'رافعة β↔δ', oscAxis: 'y', baseY: 950, amp: 460, freq: 0.72, phaseOffset: Math.PI, prevX: 1540, prevY: 950, velY: 0, dockSide: 0 },

    // Wing α (Top-Left: Topics 79-81, Seal 1 at (320, 330))
    { x: 650, y: 630, w: 250, h: 18, label: 'u\'·uⁿ ↦ uⁿ⁺¹/(n+1)', oscAxis: null },
    { x: 350, y: 740, w: 290, h: 18, label: 'F(x₀) = y₀', oscAxis: null },
    { x: 120, y: 610, w: 240, h: 18, label: '∫_a^b = F(b) - F(a)', oscAxis: null },
    { x: 420, y: 490, w: 250, h: 18, label: 'علاقة شال ∫_a^c + ∫_c^b', oscAxis: null },
    { x: 160, y: 390, w: 320, h: 20, label: 'ختم المسبك α (79–81)', oscAxis: null },
    { x: 640, y: 310, w: 210, h: 18, label: 'جسر القيمة المتوسطة', oscAxis: 'x', baseX: 640, amp: 85, freq: 1.05, prevX: 640, prevY: 310 },

    // Wing β (Top-Right: Topics 82-84, Seal 2 at (2280, 330))
    { x: 1700, y: 630, w: 250, h: 18, label: 'ALPES: ∫ u\'v = [uv] - ∫ uv\'', oscAxis: null },
    { x: 1960, y: 740, w: 290, h: 18, label: 'cos²x = (1+cos 2x)/2', oscAxis: null },
    { x: 2240, y: 610, w: 240, h: 18, label: 'تفكيك الكسور الجبرية', oscAxis: null },
    { x: 1930, y: 490, w: 250, h: 18, label: 'Φ\'(x) = f(x)', oscAxis: null },
    { x: 2120, y: 390, w: 320, h: 20, label: 'ختم المطرقة β (82–84)', oscAxis: null },
    { x: 1750, y: 310, w: 210, h: 18, label: 'منصة التكامل بالأجزاء', oscAxis: 'x', baseX: 1750, amp: 85, freq: 1.1, prevX: 1750, prevY: 310 },

    // Wing γ (Bottom-Left: Topics 85-87, Seal 3 at (320, 1120))
    { x: 640, y: 1460, w: 260, h: 18, label: 'A = ∫ |f(x)| dx · ||i||·||j||', oscAxis: null },
    { x: 130, y: 1500, w: 290, h: 18, label: 'A = ∫ |f(x) - g(x)| dx', oscAxis: null },
    { x: 410, y: 1360, w: 250, h: 18, label: 'V = π ∫ (f(x))² dx', oscAxis: null },
    { x: 680, y: 1230, w: 240, h: 18, label: 'تحويل cm² (u.a)', oscAxis: null },
    { x: 160, y: 1180, w: 320, h: 20, label: 'ختم الفرن γ (85–87)', oscAxis: null },
    { x: 430, y: 1030, w: 230, h: 18, label: 'محور الدوران (Ox)', oscAxis: 'x', baseX: 430, amp: 80, freq: 1.0, prevX: 430, prevY: 1030 },

    // Wing δ (Bottom-Right: Topics 88-90, Seal 4 at (2280, 1120))
    { x: 1700, y: 1460, w: 260, h: 18, label: 'y\' = ay ↦ k·e^{ax}', oscAxis: null },
    { x: 2180, y: 1500, w: 290, h: 18, label: 'y\' = ay + b ↦ k·e^{ax} - b/a', oscAxis: null },
    { x: 1940, y: 1360, w: 250, h: 18, label: 'r² + ar + b = 0', oscAxis: null },
    { x: 1680, y: 1230, w: 240, h: 18, label: 'y\'\' + ω²y = 0', oscAxis: null },
    { x: 2120, y: 1180, w: 320, h: 20, label: 'ختم التفاضلية δ (88–90)', oscAxis: null },
    { x: 1940, y: 1030, w: 230, h: 18, label: 'التردد التوافقي Δ < 0', oscAxis: 'x', baseX: 1940, amp: 80, freq: 1.05, prevX: 1940, prevY: 1030 }
  ];

  for (const plat of platforms) {
    plat.isRtl = /[\u0600-\u06FF]/.test(plat.label || '');
  }

  // Molten Slag Channels on the sub-floor (hazardous thermal zones)
  const slagPools = [
    { x: 430, y: 1612, w: 380, h: 22, label: 'خبث مصهور (∫_a^b < 0)' },
    { x: 1790, y: 1612, w: 380, h: 22, label: 'خبث مصهور (∫_a^b < 0)' }
  ];

  // 4 Foundry Containment Seals
  const gatePositions = [
    { x: 320, y: 332, glyph: '∫f' },
    { x: 2280, y: 332, glyph: 'u·v\'' },
    { x: 320, y: 1122, glyph: 'π∫f²' },
    { x: 2280, y: 1122, glyph: 'y\'\'+ω²y' }
  ];

  const gates = gatePositions.map((pos, idx) => {
    const sec = sectors[idx] || { id: idx + 1, name: `القطاع ${idx + 1}`, topics: [79 + idx * 3], color: '#f59e0b' };
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

  // Armor Plates (HP) & Plasma Flux Cores (Energy)
  const orbs = [
    { id: 1, x: 775, y: 590, radius: 12, kind: 'energy' },
    { id: 2, x: 1825, y: 590, radius: 12, kind: 'hp' },
    { id: 3, x: 540, y: 450, radius: 12, kind: 'hp' },
    { id: 4, x: 2055, y: 450, radius: 12, kind: 'energy' },
    { id: 5, x: 535, y: 1320, radius: 12, kind: 'energy' },
    { id: 6, x: 2065, y: 1320, radius: 12, kind: 'hp' },
    { id: 7, x: 1300, y: 720, radius: 12, kind: 'hp' },
    { id: 8, x: 1300, y: 1240, radius: 12, kind: 'energy' }
  ];

  const state = {
    mode: 'intro', // 'intro' | 'play' | 'override' | 'pause' | 'end'
    topicFilter,
    time: 0,
    worldTime: 0,
    screenShake: 0,
    damageFlash: 0,
    bannerText: 'المسبك α — صُغ الدوال الأصلية واحسم أختام المحرقة الأربعة (79–90)',
    bannerTimer: 4.5,

    player: {
      x: 1300,
      y: 445,
      vx: 0,
      vy: 0,
      radius: 21,
      facing: 1,
      aimAngle: 0,
      hp: 120,
      maxHp: 120,
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
      sliceAnim: 0,
      pulseCooldown: 0,
      aegisCooldown: 0,
      aegisTimer: 0,
      overdriveCooldown: 0,
      overdrivePulseAnim: 0,
      ridingPlatform: null,
      lastRidingPlat: null,
      inSlag: false,
      slagSizzleCooldown: 0,
      slagMsgCooldown: 0
    },

    platforms,
    slagPools,
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

  // Seed initial wing patrols across the 4 foundry wings
  window.spawnForgeEnemy(state, 'drone_riemann', 520, 690);
  window.spawnForgeEnemy(state, 'turret_flux', 2060, 610);
  window.spawnForgeEnemy(state, 'drone_riemann', 540, 1410);
  window.spawnForgeEnemy(state, 'golem_ode', 2080, 1300);

  return state;
};

window.spawnForgeParticles = function(state, x, y, count = 12, color = '#f59e0b', maxSpd = 240) {
  const parts = state.particles;
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 45 + Math.random() * maxSpd;
    parts.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      size: 2.2 + Math.random() * 4.2,
      life: 0.3 + Math.random() * 0.4,
      maxLife: 0.7,
      color
    });
  }
  while (parts.length > window.FORGE_WORLD.MAX_PARTICLES) parts.shift();
};

window.addForgeFloatText = function(state, x, y, text, color = '#fde047', life = 1.2) {
  state.floatingTexts.push({
    x, y, text, color, life, maxLife: life,
    isRtl: /[\u0600-\u06FF]/.test(String(text || ''))
  });
  if (state.floatingTexts.length > 26) state.floatingTexts.shift();
};

window.setForgeBanner = function(state, text, dur = 3.2) {
  state.bannerText = text;
  state.bannerTimer = dur;
};

window.spawnForgeEnemy = function(state, forceKind = null, forceX = null, forceY = null) {
  const p = state.player;
  const broken = state.stats.brokenGates;
  let kind = forceKind;
  if (!kind) {
    const r = Math.random();
    if (r < 0.44) kind = 'drone_riemann';
    else if (r < 0.77) kind = 'turret_flux';
    else kind = 'golem_ode';
  }

  let sx = forceX;
  let sy = forceY;
  if (sx === null || sy === null) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 420 + Math.random() * 140;
    sx = Math.max(100, Math.min(window.FORGE_WORLD.WIDTH - 100, p.x + Math.cos(ang) * dist));
    sy = Math.max(150, Math.min(window.FORGE_WORLD.HEIGHT - 120, p.y + Math.sin(ang) * dist));
  }
  if (kind === 'boss') {
    sx = 1300;
    sy = 880;
  }

  const mult = 1 + broken * 0.16;
  const cfg = {
    drone_riemann: { r: 19, hp: Math.round(48 * mult), speed: 158 + broken * 10, dmg: 12, label: 'Δx·f', color: '#f59e0b' },
    turret_flux: { r: 21, hp: Math.round(64 * mult), speed: 92 + broken * 6, dmg: 14, label: 'u\'eᵘ', color: '#fb923c' },
    golem_ode: { r: 27, hp: Math.round(104 * mult), speed: 102 + broken * 7, dmg: 18, label: 'y\'\'+ω²y', color: '#38bdf8' },
    boss: { r: 54, hp: 680, speed: 125, dmg: 22, label: 'عملاق المعادلات التفاضلية', color: '#ef4444' }
  }[kind];

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
    shieldActive: false,
    shieldHp: 0,
    shieldMaxHp: 150,
    shieldAngle: 0,
    shieldGapHalf: 0.48,
    shieldRechargeTimer: 0,
    stunTimer: 0,
    phase: 1,
    shootTimer: kind === 'boss' ? 1.45 : 2.1,
    beamTimer: 0,
    animPhase: Math.random() * Math.PI * 2
  });
};

window.spawnDifferentialBoss = function(state) {
  if (state.bossSpawned) return;
  state.bossSpawned = true;
  window.spawnForgeEnemy(state, 'boss');
  state.screenShake = Math.max(state.screenShake, 16);
  window.ForgeAudio?.playOverdrive?.();
  window.triggerForgeHaptic?.(175, 0.7, 0.92);
  window.setForgeBanner(state, '🔥 تحطمت الأختام الأربعة — عملاق المعادلات التفاضلية انصهر في البوتقة الوسطى!', 5.0);
  window.addForgeFloatText(state, state.player.x, state.player.y - 46, 'BOSS: البوتقة الوسطى (1300, 880)!', '#ef4444', 2.4);
};

window.damageForgeEnemy = function(state, enemy, dmg, forceKill = false, ignoreShield = false) {
  if (enemy.kind === 'boss' && enemy.shieldActive && !ignoreShield && !forceKill) {
    enemy.shieldHp = Math.max(0, enemy.shieldHp - dmg * 0.65);
    enemy.hitFlash = 0.08;
    window.ForgeAudio?.playShieldDeflect?.();
    window.spawnForgeParticles(state, enemy.x, enemy.y, 5, '#38bdf8', 140);
    if (enemy.shieldHp <= 0) {
      enemy.shieldActive = false;
      enemy.stunTimer = 2.6;
      enemy.shieldRechargeTimer = 8.5;
      window.ForgeAudio?.playAegis?.();
      window.addForgeFloatText(state, enemy.x, enemy.y - enemy.radius - 18, 'تحطم الدرع التفاضلي مؤقتاً! أطلق [R2]', '#fde047', 1.8);
    }
    return false;
  }

  enemy.hp -= dmg;
  enemy.hitFlash = 0.14;
  window.spawnForgeParticles(state, enemy.x, enemy.y, 8, enemy.color || '#f59e0b', 190);

    // Boss Phase Escalation: Phase 2 (<= 65%) -> Phase 3 (<= 30%)
  if (enemy.kind === 'boss' && enemy.hp > 0) {
    const frac = enemy.hp / enemy.maxHp;
    if (enemy.phase === 1 && frac <= 0.65) {
      enemy.phase = 2;
      enemy.beamTimer = 1.0;
      window.ForgeAudio?.playBossPhaseShift?.();
      window.triggerForgeHaptic?.(135, 0.55, 0.8);
      window.setForgeBanner(state, '⚠ الطور 2: أشعة محدّدات التكامل (x = a, y = b)!', 3.8);
      window.addForgeFloatText(state, enemy.x, enemy.y - 60, 'الطور 2: حزم التكامل!', '#fb923c', 1.8);
    }
    if (enemy.phase < 3 && frac <= 0.30) {
      enemy.phase = 3;
      enemy.shieldActive = true;
      enemy.shieldHp = enemy.shieldMaxHp;
      enemy.shieldRechargeTimer = 8.5;
      window.ForgeAudio?.playBossPhaseShift?.();
      window.triggerForgeHaptic?.(160, 0.65, 0.9);
      window.setForgeBanner(state, '🔥 الطور 3: درع المميز Δ=0 الدوّار! اصب نافذة r₀ أو استعمل [△] / [L2]!', 4.6);
      window.addForgeFloatText(state, enemy.x, enemy.y - 62, 'درع Δ=0 نشط — فجوة r₀ أو [△/L2]!', '#38bdf8', 2.2);
    }
  }

  if (!enemy.staggered && enemy.hp > 0) {
    const canStagger = (enemy.kind === 'golem_ode' && enemy.hp <= enemy.maxHp * 0.38) ||
      (enemy.kind === 'boss' && !enemy.shieldActive && enemy.hp <= enemy.maxHp * 0.18);
    if (canStagger) {
      enemy.staggered = true;
      window.addForgeFloatText(state, enemy.x, enemy.y - enemy.radius - 14, 'مشلول! [▢ / E] تفكيك الغولم', '#fde047', 1.6);
    }
  }

  if (enemy.hp <= 0 || forceKill) {
    const idx = state.enemies.indexOf(enemy);
    if (idx !== -1) state.enemies.splice(idx, 1);

    state.stats.kills++;
    state.stats.combo++;
    state.stats.comboTimer = 4.2;
    const mult = Math.min(5, 1 + Math.floor(state.stats.combo / 3));
    const pts = (enemy.kind === 'boss' ? 2000 : enemy.kind === 'golem_ode' ? 190 : 95) * mult;
    state.stats.score += pts;
    state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 15);

    window.spawnForgeParticles(state, enemy.x, enemy.y, enemy.kind === 'boss' ? 46 : 16, '#fbbf24', 290);
    window.addForgeFloatText(state, enemy.x, enemy.y - 18, `+${pts}`, '#fde047', 0.95);

    if (enemy.kind !== 'boss' && Math.random() < 0.38) {
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
      window.ForgeAudio?.playVictory?.();
      window.triggerForgeHaptic?.(220, 0.78, 1.0);
      window.finishForgeGame(state, true);
    }
    return true;
  }
  return false;
};

// [✕ / Space / W]: Magnetic Mech Double-Jump (coyote time, jump buffer & drop-through)
window.performForgeJump = function(state, holdingDown = false) {
  const p = state.player;
  if (holdingDown && p.grounded && p.ridingPlatform && !p.ridingPlatform.solid) {
    p.dropThroughTimer = 0.24;
    p.grounded = false;
    p.lastRidingPlat = null;
    p.y += 4;
    p.vy = 145;
    window.ForgeAudio?.playUiTick?.();
    return true;
  }

  if (p.grounded || p.coyoteTimer > 0) {
    p.vy = window.FORGE_WORLD.JUMP_VEL;
    p.grounded = false;
    p.coyoteTimer = 0;
    p.lastRidingPlat = null;
    p.jumpsLeft = 1;
    window.ForgeAudio?.playJump?.(false);
    window.spawnForgeParticles(state, p.x, p.y + p.radius, 8, '#f59e0b', 140);
    return true;
  }

  if (p.jumpsLeft > 0) {
    p.vy = window.FORGE_WORLD.DOUBLE_JUMP_VEL;
    p.jumpsLeft--;
    window.ForgeAudio?.playJump?.(true);
    window.spawnForgeParticles(state, p.x, p.y + p.radius, 12, '#38bdf8', 180);
    window.addForgeFloatText(state, p.x, p.y - 26, 'دفع ∫', '#bae6fd', 0.7);
    return true;
  }

  p.jumpBuffer = 0.14;
  return false;
};

// [◯ / Shift]: Area Slicer Cleave |f(x) - g(x)| (High-speed dash + 145px wide plasma blade arc)
window.performForgeSlice = function(state, moveX) {
  const p = state.player;
  if (p.dashCooldown > 0) return false;
  p.dashCooldown = 0.74;
  p.dashTimer = 0.21;
  p.sliceAnim = 0.26;
  p.invulnTimer = Math.max(p.invulnTimer, 0.38);

  const dirX = Math.abs(moveX) > 0.15 ? Math.sign(moveX) : (p.facing || 1);
  p.dashVx = dirX * 810;
  p.dashVy = 0;

  window.ForgeAudio?.playSlice?.();
  window.triggerForgeHaptic?.(75, 0.42, 0.6);
  window.spawnForgeParticles(state, p.x, p.y, 18, '#fb7185', 240);
  window.addForgeFloatText(state, p.x, p.y - 28, 'مقص |f - g|', '#fda4af', 0.85);

  // Destroy nearby enemy bolts inside cleave radius
  for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
    const ep = state.enemyProjectiles[i];
    if (Math.hypot(ep.x - p.x, ep.y - p.y) <= 135) {
      window.spawnForgeParticles(state, ep.x, ep.y, 4, '#fbbf24', 110);
      state.enemyProjectiles.splice(i, 1);
    }
  }

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (Math.hypot(e.x - p.x, e.y - p.y) <= 145) {
      window.damageForgeEnemy(state, e, 46, false, false);
    }
  }
  return true;
};

// [△ / Q]: Chasles Thermal Aegis ∫_a^b = ∫_a^c + ∫_c^b
window.performForgeAegis = function(state) {
  const p = state.player;
  if (p.aegisCooldown > 0) return false;
  p.aegisCooldown = 4.6;
  p.aegisTimer = 3.2;
  p.invulnTimer = Math.max(p.invulnTimer, 1.0);
  window.ForgeAudio?.playAegis?.();
  window.triggerForgeHaptic?.(95, 0.45, 0.65);
  window.spawnForgeParticles(state, p.x, p.y, 20, '#38bdf8', 230);
  window.setForgeBanner(state, '🛡️ درع شال الحراري مفعّل — امتصاص القذائف وشل الحراس', 2.4);
  window.addForgeFloatText(state, p.x, p.y - 36, '🛡️ ∫_a^c + ∫_c^b', '#7dd3fc', 1.15);

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (Math.hypot(e.x - p.x, e.y - p.y) <= 275) {
      if (e.kind === 'boss' && e.shieldActive) {
        e.shieldActive = false;
        e.shieldHp = 0;
        e.stunTimer = 2.6;
        e.shieldRechargeTimer = 8.5;
        window.addForgeFloatText(state, e.x, e.y - 68, 'تحطّم الدرع التفاضلي!', '#fde047', 1.5);
      }
      if (e.kind !== 'boss') e.staggered = true;
      window.damageForgeEnemy(state, e, 42, false, true);
    }
  }
  return true;
};

// [R2 / J]: Riemann Plasma Cannon (360° aimed)
window.performForgeCannon = function(state) {
  const p = state.player;
  if (p.pulseCooldown > 0) return false;
  p.pulseCooldown = 0.17;
  const spd = 810;
  const ang = p.aimAngle;
  state.projectiles.push({
    x: p.x + Math.cos(ang) * 22,
    y: p.y + Math.sin(ang) * 22,
    vx: Math.cos(ang) * spd,
    vy: Math.sin(ang) * spd,
    dmg: 26,
    life: 1.05
  });
  window.ForgeAudio?.playCannon?.();
  return true;
};

// [L2 / F]: Volume of Revolution Shockwave (π ∫ f(x)² dx)
window.performForgeOverdrive = function(state) {
  const p = state.player;
  if (p.overdriveCooldown > 0 || p.energy < 40) {
    if (p.energy < 40) window.addForgeFloatText(state, p.x, p.y - 34, 'تحتاج 40% تدفق تكامل!', '#fbbf24', 1.0);
    return false;
  }
  p.energy -= 40;
  p.overdriveCooldown = 2.4;
  p.overdrivePulseAnim = 0.36;
  state.screenShake = Math.max(state.screenShake, 16);
  window.ForgeAudio?.playOverdrive?.();
  window.triggerForgeHaptic?.(150, 0.72, 0.92);
  window.spawnForgeParticles(state, p.x, p.y, 38, '#fb923c', 360);
  window.setForgeBanner(state, '⚡ صدمة حجم الدوران (π∫f² dx)!', 2.2);
  window.addForgeFloatText(state, p.x, p.y - 38, '⚡ π ∫ f² dx', '#fed7aa', 1.25);

  // Clear nearby enemy projectiles inside the Volume of Revolution shockwave
  for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
    const ep = state.enemyProjectiles[i];
    if (Math.hypot(ep.x - p.x, ep.y - p.y) <= 420) {
      window.spawnForgeParticles(state, ep.x, ep.y, 4, '#fb923c', 130);
      state.enemyProjectiles.splice(i, 1);
    }
  }

  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    if (Math.hypot(e.x - p.x, e.y - p.y) <= 420) {
      if (e.kind === 'boss' && e.shieldActive) {
        e.shieldActive = false;
        e.shieldHp = 0;
        e.stunTimer = 2.8;
        e.shieldRechargeTimer = 8.5;
      }
      window.damageForgeEnemy(state, e, 155, e.kind !== 'boss', true);
    }
  }
  return true;
};

window.findNearestForgeInteract = function(state) {
  const p = state.player;
  for (const e of state.enemies) {
    if (e.staggered && Math.hypot(e.x - p.x, e.y - p.y) <= 138) {
      return { kind: 'execute', enemy: e };
    }
  }
  for (const g of state.gates) {
    if (!g.broken && Math.hypot(g.x - p.x, g.y - p.y) <= 128) {
      return { kind: 'gate', gate: g };
    }
  }
  return null;
};

window.getForgeWingLabel = function(x, y) {
  if (x < 1070 && y < 850) return 'α (أصلية)';
  if (x > 1530 && y < 850) return 'β (أجزاء)';
  if (x < 1070 && y >= 850) return 'γ (مساحات)';
  if (x > 1530 && y >= 850) return 'δ (تفاضلية)';
  return 'البوتقة';
};

window.updateForgeWorld = function(state, rawDt, moveVec, aimVec, holdingDown = false) {
  if (state.mode !== 'play' && state.mode !== 'override') return;

  const tScale = state.mode === 'override' ? 0.035 : 1.0;
  const dt = rawDt * tScale;
  state.time += rawDt;
  state.worldTime += dt;

  const p = state.player;
  const W = window.FORGE_WORLD.WIDTH;
  const H = window.FORGE_WORLD.HEIGHT;

  if (state.bannerTimer > 0) state.bannerTimer = Math.max(0, state.bannerTimer - rawDt);
  if (state.damageFlash > 0) state.damageFlash = Math.max(0, state.damageFlash - rawDt * 2.4);
  if (state.screenShake > 0) state.screenShake = Math.max(0, state.screenShake - rawDt * 38);

  // Move Twin Magnetic Cranes & Oscillating Forge Bridges
  for (const plat of state.platforms) {
    plat.prevX = plat.x;
    plat.prevY = plat.y;
    if (plat.oscAxis === 'y') {
      const rawSin = Math.sin(state.worldTime * plat.freq + (plat.phaseOffset || 0));
      const wave = Math.max(-1, Math.min(1, 1.18 * rawSin));
      plat.y = plat.baseY + wave * plat.amp;
      plat.velY = dt > 0.0001 ? (plat.y - plat.prevY) / dt : 0;
      const newDock = wave <= -0.995 ? -1 : (wave >= 0.995 ? 1 : 0);
      if (newDock !== 0 && newDock !== plat.dockSide && state.mode === 'play') {
        if (Math.hypot(p.x - (plat.x + plat.w * 0.5), p.y - plat.y) < 620) {
          window.ForgeAudio?.playCraneDock?.();
          window.spawnForgeParticles(state, plat.x + plat.w * 0.5, plat.y + 6, 5, '#fbbf24', 95);
        }
      }
      plat.dockSide = newDock;
    } else if (plat.oscAxis === 'x') {
      plat.x = plat.baseX + Math.sin(state.worldTime * plat.freq + (plat.phaseOffset || 0)) * plat.amp;
    }
  }

  if (state.mode === 'play') {
    p.invulnTimer = Math.max(0, p.invulnTimer - dt);
    p.dashTimer = Math.max(0, p.dashTimer - dt);
    p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    p.sliceAnim = Math.max(0, p.sliceAnim - rawDt);
    p.overdrivePulseAnim = Math.max(0, p.overdrivePulseAnim - rawDt);
    p.pulseCooldown = Math.max(0, p.pulseCooldown - dt);
    p.aegisCooldown = Math.max(0, p.aegisCooldown - dt);
    p.aegisTimer = Math.max(0, p.aegisTimer - dt);
    p.overdriveCooldown = Math.max(0, p.overdriveCooldown - dt);
    p.dropThroughTimer = Math.max(0, p.dropThroughTimer - dt);
    p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    p.jumpBuffer = Math.max(0, p.jumpBuffer - dt);
    p.slagSizzleCooldown = Math.max(0, p.slagSizzleCooldown - dt);
    p.slagMsgCooldown = Math.max(0, p.slagMsgCooldown - dt);
    p.energy = Math.min(p.maxEnergy, p.energy + dt * 6.0);

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

    const wasRiding = p.ridingPlatform;
    if (p.grounded && wasRiding) {
      p.x += (wasRiding.x - wasRiding.prevX);
      p.y += (wasRiding.y - wasRiding.prevY);
    }

    const prevBottom = p.y + p.radius;

    if (p.dashTimer > 0) {
      p.x += p.dashVx * dt;
      p.y += p.dashVy * dt;
    } else {
      const targetVx = moveVec.x * 345;
      p.vx += (targetVx - p.vx) * Math.min(1, dt * 15);
      p.vy = Math.min(window.FORGE_WORLD.MAX_FALL, p.vy + window.FORGE_WORLD.GRAVITY * dt);
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
          const catchTol = Math.max(15, Math.abs(plat.y - prevPlatTop) + 12);
          const lockedOnMoving = wasRiding === plat && (plat.solid || p.dropThroughTimer <= 0);
          if (lockedOnMoving || (prevBottom <= prevPlatTop + catchTol && newBottom >= plat.y - 4)) {
            p.y = plat.y - p.radius;
            p.vy = 0;
            p.grounded = true;
            p.coyoteTimer = 0.12;
            p.jumpsLeft = 2;
            p.ridingPlatform = plat;
            if (plat.oscAxis === 'y' && p.lastRidingPlat !== plat) {
              p.lastRidingPlat = plat;
              window.ForgeAudio?.playCraneBoard?.();
              window.spawnForgeParticles(state, p.x, plat.y, 7, '#fbbf24', 115);
            } else if (!plat.oscAxis) {
              p.lastRidingPlat = null;
            }
            if (p.jumpBuffer > 0 && !holdingDown) {
              p.jumpBuffer = 0;
              window.performForgeJump(state, false);
            }
            break;
          }
        }
      }
    }
    if (!p.grounded) p.lastRidingPlat = null;

    // Molten Slag Cooling Channels Physics
    let inSlagNow = false;
    for (const pool of state.slagPools) {
      if (p.x + p.radius * 0.6 >= pool.x && p.x - p.radius * 0.6 <= pool.x + pool.w &&
          p.y + p.radius >= pool.y && p.y - p.radius <= pool.y + pool.h) {
        inSlagNow = true;
        p.vx *= Math.pow(0.28, dt);

        if (!p.inSlag) {
          window.ForgeAudio?.playSlagSplash?.();
          p.slagSizzleCooldown = 0.25;
          for (let k = 0; k < 10; k++) {
            state.particles.push({
              x: p.x + (Math.random() - 0.5) * 28,
              y: pool.y + 2,
              vx: (Math.random() - 0.5) * 180,
              vy: -(95 + Math.random() * 175),
              size: 2.5 + Math.random() * 3.5,
              life: 0.35 + Math.random() * 0.25,
              maxLife: 0.6,
              color: '#fb923c'
            });
          }
          while (state.particles.length > window.FORGE_WORLD.MAX_PARTICLES) state.particles.shift();
        }

        if (p.slagSizzleCooldown <= 0) {
          p.slagSizzleCooldown = 0.28;
          window.ForgeAudio?.playSlagSizzle?.();
          for (let k = 0; k < 4; k++) {
            state.particles.push({
              x: p.x + (Math.random() - 0.5) * 30,
              y: pool.y + 2,
              vx: (Math.random() - 0.5) * 55,
              vy: -(60 + Math.random() * 80),
              size: 2 + Math.random() * 2.5,
              life: 0.35,
              maxLife: 0.35,
              color: p.aegisTimer > 0 ? '#38bdf8' : '#fde047'
            });
          }
          while (state.particles.length > window.FORGE_WORLD.MAX_PARTICLES) state.particles.shift();
        }

        if (p.aegisTimer > 0) {
          if (p.slagMsgCooldown <= 0) {
            p.slagMsgCooldown = 1.1;
            window.addForgeFloatText(state, p.x, p.y - 30, '🛡️ درع شال يقاوم الخبث!', '#38bdf8', 1.0);
          }
        } else if (p.invulnTimer <= 0 && p.dashTimer <= 0) {
          applyForgeHit(state, 14, 'خبث مصهور!');
          p.vy = -490;
          p.jumpsLeft = Math.max(1, p.jumpsLeft);
        }
        break;
      }
    }
    p.inSlag = inSlagNow;

    // Collect Armor Plates & Plasma Flux Cores
    for (let i = state.orbs.length - 1; i >= 0; i--) {
      const o = state.orbs[i];
      if (Math.hypot(o.x - p.x, o.y - p.y) <= p.radius + o.radius + 10) {
        if (o.kind === 'hp') {
          p.hp = Math.min(p.maxHp, p.hp + 28);
          window.addForgeFloatText(state, p.x, p.y - 24, '+28 درع فولاذي', '#fbbf24', 1.0);
        } else {
          p.energy = Math.min(p.maxEnergy, p.energy + 35);
          window.addForgeFloatText(state, p.x, p.y - 24, '+35% تدفق ∫', '#38bdf8', 1.0);
        }
        window.ForgeAudio?.playUiTick?.();
        state.orbs.splice(i, 1);
      }
    }

    // Enemy Spawner
    state.spawnTimer -= dt;
    const cap = state.bossSpawned ? 7 : 5 + state.stats.brokenGates;
    if (state.spawnTimer <= 0 && state.enemies.length < cap) {
      window.spawnForgeEnemy(state);
      state.spawnTimer = Math.max(1.8, 3.2 - state.stats.brokenGates * 0.35);
    }
  }

  // Player Plasma Cannon Projectiles (checks Boss Phase 3 rotating root window r0!)
  for (let i = state.projectiles.length - 1; i >= 0; i--) {
    const b = state.projectiles[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    let rm = b.life <= 0 || b.x < 10 || b.x > W - 10 || b.y < 10 || b.y > H - 10;
    if (!rm) {
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const e = state.enemies[j];
        const hitDist = (e.kind === 'boss' && e.shieldActive) ? (e.radius + 24) : (e.radius + 9);
        if (Math.hypot(e.x - b.x, e.y - b.y) <= hitDist) {
          if (e.kind === 'boss' && e.shieldActive) {
            const ang = Math.atan2(b.y - e.y, b.x - e.x);
            const diff = Math.abs(Math.atan2(Math.sin(ang - e.shieldAngle), Math.cos(ang - e.shieldAngle)));
            if (diff <= e.shieldGapHalf) {
              window.damageForgeEnemy(state, e, Math.round(b.dmg * 1.25), false, true);
              window.spawnForgeParticles(state, b.x, b.y, 7, '#fde047', 165);
            } else {
              window.damageForgeEnemy(state, e, b.dmg, false, false);
            }
          } else {
            window.damageForgeEnemy(state, e, b.dmg, false, false);
          }
          rm = true;
          break;
        }
      }
    }
    if (rm) state.projectiles.splice(i, 1);
  }

  // Enemy Projectiles (absorbed by Chasles Shield or vaporized in Molten Slag!)
  for (let i = state.enemyProjectiles.length - 1; i >= 0; i--) {
    const ep = state.enemyProjectiles[i];
    ep.x += ep.vx * dt;
    ep.y += ep.vy * dt;
    ep.life -= dt;
    let rm = ep.life <= 0;
    if (!rm && ep.y >= 1612) {
      for (const pool of state.slagPools) {
        if (ep.x >= pool.x && ep.x <= pool.x + pool.w) {
          window.spawnForgeParticles(state, ep.x, pool.y, 4, '#fb923c', 100);
          rm = true;
          break;
        }
      }
    }
    const distP = Math.hypot(ep.x - p.x, ep.y - p.y);
    if (!rm && p.aegisTimer > 0 && distP <= 56) {
      window.spawnForgeParticles(state, ep.x, ep.y, 5, '#38bdf8', 120);
      rm = true;
    } else if (!rm && distP <= p.radius + 7 && p.invulnTimer <= 0 && p.aegisTimer <= 0 && state.mode === 'play') {
      applyForgeHit(state, 12, '-12 درع');
      rm = true;
    }
    if (rm) state.enemyProjectiles.splice(i, 1);
  }

  // Boss Integral Boundary Lasers (Phase 2 & 3)
  for (let i = state.bossBeams.length - 1; i >= 0; i--) {
    const bm = state.bossBeams[i];
    if (bm.warnTimer > 0) {
      bm.warnTimer -= dt;
      if (bm.warnTimer <= 0) {
        window.ForgeAudio?.playBeamFire?.();
      }
    } else if (bm.activeTimer > 0) {
      bm.activeTimer -= dt;
      if (state.mode === 'play' && p.invulnTimer <= 0 && p.aegisTimer <= 0 && p.dashTimer <= 0) {
        const hitX = bm.axis === 'x' && Math.abs(p.x - bm.pos) < p.radius + 14;
        const hitY = bm.axis === 'y' && Math.abs(p.y - bm.pos) < p.radius + 14;
        if (hitX || hitY) {
          applyForgeHit(state, 18, 'شعاع التكامل!');
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
    if (e.kind === 'boss' && e.phase >= 3) {
      e.shieldAngle = (e.shieldAngle + dt * 1.45) % (Math.PI * 2);
      if (e.stunTimer > 0) e.stunTimer = Math.max(0, e.stunTimer - dt);
      if (!e.shieldActive && !e.staggered && e.stunTimer <= 0) {
        e.shieldRechargeTimer -= dt;
        if (e.shieldRechargeTimer <= 0) {
          e.shieldActive = true;
          e.shieldHp = e.shieldMaxHp;
          window.ForgeAudio?.playOverdrive?.();
          window.addForgeFloatText(state, e.x, e.y - 68, 'تجديد درع Δ=0 — اصب فجوة r₀ أو [△/L2]!', '#38bdf8', 1.8);
        }
      }
    }

    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const dist = Math.hypot(dx, dy);

    if (state.mode === 'play' && dist > 1) {
      const stunned = e.stunTimer > 0;
      const spd = (e.staggered || stunned ? e.speed * 0.25 : e.speed) * slowMul;
      const baseAng = Math.atan2(dy, dx);

      if (e.kind === 'drone_riemann') {
        const moveAng = baseAng + Math.sin(e.animPhase) * 0.5;
        e.x = Math.max(70, Math.min(W - 70, e.x + Math.cos(moveAng) * spd * dt));
        e.y = Math.max(120, Math.min(H - 100, e.y + Math.sin(moveAng) * spd * dt));
      } else if (e.kind === 'turret_flux') {
        // Maintains mid-range mortar distance
        const moveDir = dist > 300 ? 1 : (dist < 170 ? -0.7 : 0);
        e.x = Math.max(80, Math.min(W - 80, e.x + Math.cos(baseAng) * spd * moveDir * dt));
        e.y = Math.max(130, Math.min(H - 110, e.y + Math.sin(baseAng) * spd * moveDir * dt));
      } else {
        // Golem or Boss harmonic y'' + ω²y oscillation
        const bob = e.kind === 'boss'
          ? (e.phase >= 2 ? Math.sin(e.animPhase * 0.75) * 62 * dt : 0)
          : Math.sin(e.animPhase * 1.35) * 38 * dt;
        e.x = Math.max(90, Math.min(W - 90, e.x + Math.cos(baseAng) * spd * dt));
        e.y = Math.max(130, Math.min(H - 110, e.y + Math.sin(baseAng) * spd * dt + bob));
      }

      if ((e.kind === 'turret_flux' || e.kind === 'golem_ode' || e.kind === 'boss') && !stunned) {
        e.shootTimer -= dt;
        if (e.shootTimer <= 0 && !e.staggered) {
          e.shootTimer = e.kind === 'boss' ? (e.phase === 3 ? 1.3 : 1.7) : (e.kind === 'turret_flux' ? 2.15 : 2.6);
          const spiralShift = (e.kind === 'boss' && e.phase >= 2) ? Math.sin(e.animPhase * 0.9) * 0.16 : 0;
          const offsets = e.kind === 'boss' ? [-0.36, -0.18, 0, 0.18, 0.36] : [-0.16, 0.16];
          for (const off of offsets) {
            state.enemyProjectiles.push({
              x: e.x, y: e.y,
              vx: Math.cos(baseAng + off + spiralShift) * 325,
              vy: Math.sin(baseAng + off + spiralShift) * 325,
              life: 2.6,
              color: e.kind === 'boss' ? '#ef4444' : (e.kind === 'turret_flux' ? '#fb923c' : '#38bdf8')
            });
          }
        }
      }

      // Boss Phase 2+ Boundary Integral Lasers
      if (e.kind === 'boss' && e.phase >= 2 && !e.staggered && !stunned) {
        e.beamTimer -= dt;
        if (e.beamTimer <= 0) {
          e.beamTimer = e.phase === 3 ? 3.25 : 4.0;
          window.ForgeAudio?.playBeamCharge?.();
          if (e.phase === 3) {
            state.bossBeams.push(
              { axis: 'x', pos: p.x, warnTimer: 1.15, activeTimer: 0.6 },
              { axis: 'y', pos: p.y, warnTimer: 1.15, activeTimer: 0.6 }
            );
          } else {
            state.bossBeams.push({
              axis: Math.random() < 0.5 ? 'x' : 'y',
              pos: Math.random() < 0.5 ? p.x : p.y,
              warnTimer: 1.05,
              activeTimer: 0.65
            });
          }
        }
      }

      // Radial repulsion for Boss active shield
      const effRad = (e.kind === 'boss' && e.shieldActive) ? e.radius + 22 : e.radius;
      if (e.kind === 'boss' && dist < effRad + p.radius) {
        const nx = dist > 0.01 ? dx / dist : 0;
        const ny = dist > 0.01 ? dy / dist : -1;
        const pushD = effRad + p.radius + 4;
        p.x = Math.max(44 + p.radius, Math.min(W - 44 - p.radius, e.x + nx * pushD));
        p.y = Math.max(90, Math.min(H - p.radius, e.y + ny * pushD));
      }

      if (p.aegisTimer > 0 && dist <= 58 + e.radius) {
        window.damageForgeEnemy(state, e, 30 * dt, false, true);
      } else if (!e.staggered && dist <= effRad + p.radius + 3 && p.invulnTimer <= 0 && p.aegisTimer <= 0 && p.dashTimer <= 0) {
        applyForgeHit(state, e.dmg, `-${e.dmg} درع`);
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

function applyForgeHit(state, dmg, msg) {
  const p = state.player;
  if (p.hp <= 0 || state.mode !== 'play') return;
  p.hp = Math.max(0, p.hp - dmg);
  p.invulnTimer = 0.78;
  state.damageFlash = 1.0;
  state.screenShake = Math.max(state.screenShake, 12);
  window.ForgeAudio?.playDamage?.();
  window.triggerForgeHaptic?.(125, 0.65, 0.85);
  window.addForgeFloatText(state, p.x, p.y - 26, msg, '#f87171', 1.1);
  if (p.hp <= 0) {
    window.finishForgeGame(state, false);
  }
}
