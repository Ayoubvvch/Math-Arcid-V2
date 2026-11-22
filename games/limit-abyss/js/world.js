/**
 * Limit Abyss — هاوية النهايات والاتصال 2BAC PC
 * World Physics, Subnautic Trench Simulation & Mariana Leviathan 3-Phase Boss Engine
 */

window.AbyssWorld = (function() {
  const WORLD_WIDTH = 2560;
  const WORLD_HEIGHT = 1600;
  const MAX_PARTICLES = 180;
  const MAX_ENEMIES = 36;

  let state = {
    player: {
      x: 1280,
      y: 120,
      vx: 0,
      vy: 0,
      targetVx: 0,
      targetVy: 0,
      angle: Math.PI / 2,
      radius: 22,
      hp: 100,
      maxHp: 100,
      energy: 100,
      maxEnergy: 100,
      dashCooldown: 0,
      sonarCooldown: 0,
      torpedoCooldown: 0,
      tviCooldown: 0,
      invulnerableUntil: 0,
      speed: 4.8
    },
    gates: [],
    enemies: [],
    torpedoes: [],
    bossBeams: [],
    particles: [],
    bubbleVents: [],
    sonarWaves: [],
    boss: null,
    score: 0,
    combo: 1,
    comboTimer: 0,
    gatesCleared: 0,
    bypassesUsed: 0,
    correctAnswers: 0,
    totalAnswers: 0,
    currentSectorIdx: 0,
    lastSectorIdx: 0,
    lastBubbleSoundAt: 0,
    isBossSpawned: false,
    isVictory: false,
    isGameOver: false
  };

  function initWorld() {
    state.player.x = 1280;
    state.player.y = 120;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.targetVx = 0;
    state.player.targetVy = 0;
    state.player.angle = Math.PI / 2;
    state.player.hp = 100;
    state.player.energy = 100;
    state.player.dashCooldown = 0;
    state.player.sonarCooldown = 0;
    state.player.torpedoCooldown = 0;
    state.player.tviCooldown = 0;
    state.player.invulnerableUntil = 0;

    state.score = 0;
    state.combo = 1;
    state.comboTimer = 0;
    state.gatesCleared = 0;
    state.bypassesUsed = 0;
    state.correctAnswers = 0;
    state.totalAnswers = 0;
    state.currentSectorIdx = 0;
    state.lastSectorIdx = 0;
    state.lastBubbleSoundAt = 0;
    state.isBossSpawned = false;
    state.isVictory = false;
    state.isGameOver = false;

    state.torpedoes = [];
    state.bossBeams = [];
    state.particles = [];
    state.sonarWaves = [];
    state.enemies = [];
    state.boss = null;

    initGates();
    initBubbleVents();
    spawnSectorEnemies(1);
    window.AbyssAudio?.setDepthRatio?.(0.08);
  }

  function initGates() {
    state.gates = [
      {
        id: 'gate_1',
        sectorId: 1,
        x: 1280,
        y: 380,
        radius: 56,
        sectorName: 'منطقة الشفق — ختم النهايات (1–6)',
        depthText: 'عمق 380m',
        isUnlocked: false,
        pulsePhase: 0
      },
      {
        id: 'gate_2',
        sectorId: 2,
        x: 1280,
        y: 780,
        radius: 56,
        sectorName: 'منطقة الظلام — ختم الاتصال والتمديد (7–11)',
        depthText: 'عمق 780m',
        isUnlocked: false,
        pulsePhase: Math.PI / 2
      },
      {
        id: 'gate_3',
        sectorId: 3,
        x: 1280,
        y: 1180,
        radius: 56,
        sectorName: 'منطقة الهاوية — ختم TVI وصورة المجال (12–17)',
        depthText: 'عمق 1180m',
        isUnlocked: false,
        pulsePhase: Math.PI
      },
      {
        id: 'gate_4',
        sectorId: 4,
        x: 1280,
        y: 1460,
        radius: 56,
        sectorName: 'خندق الهدال — ختم التقابل و f⁻¹ والجذور (18–22)',
        depthText: 'عمق 1460m',
        isUnlocked: false,
        pulsePhase: (3 * Math.PI) / 2
      }
    ];
  }

  function initBubbleVents() {
    state.bubbleVents = [
      { x: 420, y: 280, radius: 45, restored: 0.15 },
      { x: 2140, y: 320, radius: 45, restored: 0.15 },
      { x: 500, y: 680, radius: 48, restored: 0.18 },
      { x: 2060, y: 720, radius: 48, restored: 0.18 },
      { x: 380, y: 1080, radius: 52, restored: 0.22 },
      { x: 2180, y: 1120, radius: 52, restored: 0.22 },
      { x: 620, y: 1380, radius: 55, restored: 0.25 },
      { x: 1940, y: 1420, radius: 55, restored: 0.25 }
    ];
  }

  function spawnSectorEnemies(sectorId) {
    const minHeight = (sectorId - 1) * 380 + 80;
    const maxHeight = sectorId * 380 + 40;

    for (let i = 0; i < 6; i++) {
      const labels = ['0/0', '∞/∞', '0×∞', '+∞-∞'];
      state.enemies.push({
        id: 'mine_' + Math.random().toString(36).slice(2, 7),
        type: 'mine',
        label: labels[i % labels.length],
        x: 240 + Math.random() * (WORLD_WIDTH - 480),
        y: minHeight + Math.random() * (maxHeight - minHeight),
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: 19,
        hp: 30,
        maxHp: 30,
        staggeredUntil: 0,
        pulse: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < 4; i++) {
      state.enemies.push({
        id: 'jelly_' + Math.random().toString(36).slice(2, 7),
        type: 'jelly',
        label: 'قنديل الانقطاع',
        x: 200 + Math.random() * (WORLD_WIDTH - 400),
        y: minHeight + Math.random() * (maxHeight - minHeight),
        vx: (Math.random() - 0.5) * 1.6,
        vy: -0.4 - Math.random() * 0.8,
        radius: 24,
        hp: 45,
        maxHp: 45,
        staggeredUntil: 0,
        pulse: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < 2; i++) {
      state.enemies.push({
        id: 'vortex_' + Math.random().toString(36).slice(2, 7),
        type: 'vortex',
        label: 'دوامة تباعد lim=∞',
        x: 350 + Math.random() * (WORLD_WIDTH - 700),
        y: minHeight + Math.random() * (maxHeight - minHeight),
        vx: 0,
        vy: 0,
        radius: 38,
        hp: 120,
        maxHp: 120,
        staggeredUntil: 0,
        pulse: 0
      });
    }
  }

  function spawnLeviathanBoss() {
    if (state.isBossSpawned || state.boss) return;
    state.isBossSpawned = true;
    state.boss = {
      x: 1280,
      y: 1490,
      baseY: 1490,
      vx: 1.7,
      vy: 0,
      radius: 72,
      hp: 1000,
      maxHp: 1000,
      phase: 1, // 1: Void Spikes, 2: Discontinuity Beams, 3: TVI Resonance Shield
      attackTimer: 0,
      beamTimer: 0,
      shieldActive: false,
      shieldHp: 0,
      shieldMaxHp: 180,
      shieldRadius: 104,
      shieldRechargeTimer: 0,
      tviGapAngle: 0,
      tviGapWidth: 0.42, // radians around each symmetric root window (α, α+π)
      stunnedUntil: 0,
      hitFlash: 0,
      pulse: 0,
      name: 'لوفياثان الانقطاع العظيم (Leviathan Discontinuity Core)'
    };

    window.AbyssAudio?.playBossPhaseShift?.();
    window.AbyssInput?.triggerHaptic?.(160, 0.55, 0.85);
    createSonarWave(1280, 1490, 520, '#f43f5e');
    for (let i = 0; i < 52; i++) {
      createParticle(1280, 1490, '#f43f5e', 4.5);
    }
  }

  function shortestAngleDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function isAngleInTviRootWindow(boss, angle) {
    const gap = boss.tviGapAngle || 0;
    const width = boss.tviGapWidth || 0.42;
    const d1 = Math.abs(shortestAngleDiff(angle, gap));
    const d2 = Math.abs(shortestAngleDiff(angle, gap + Math.PI));
    return d1 <= width || d2 <= width;
  }

  function shatterBossTviShield(boss, bonusCoreDmg = 0) {
    if (!boss || !boss.shieldActive) return;
    boss.shieldActive = false;
    boss.shieldHp = 0;
    boss.shieldRechargeTimer = 390; // ~6.5s vulnerability window before TVI shield regenerates
    boss.stunnedUntil = performance.now() + 1400;

    window.AbyssAudio?.playShieldBreak?.();
    window.AbyssInput?.triggerHaptic?.(150, 0.7, 0.9);
    createSonarWave(boss.x, boss.y, boss.shieldRadius + 130, '#10b981');
    for (let i = 0; i < 28; i++) {
      createParticle(boss.x, boss.y, i % 2 === 0 ? '#10b981' : '#8b5cf6', 4.2);
    }

    if (bonusCoreDmg > 0) {
      damageBoss(bonusCoreDmg, true);
    }
  }

  function damageBoss(dmg, ignoreShield = false) {
    const b = state.boss;
    if (!b || state.isVictory || state.isGameOver) return;

    if (b.shieldActive && !ignoreShield) {
      b.shieldHp = Math.max(0, b.shieldHp - dmg);
      if (b.shieldHp <= 0) {
        shatterBossTviShield(b, 0);
      }
      return;
    }

    b.hp = Math.max(0, b.hp - dmg);
    b.hitFlash = 7;

    const hpFrac = b.hp / b.maxHp;

    // Phase transitions: 1 -> 2 (<= 65%) -> 3 (<= 35%)
    if (b.phase === 1 && hpFrac <= 0.65 && b.hp > 0) {
      b.phase = 2;
      b.vx = Math.sign(b.vx || 1) * 2.4;
      b.beamTimer = 60;
      window.AbyssAudio?.playBossPhaseShift?.();
      window.AbyssInput?.triggerHaptic?.(140, 0.5, 0.8);
      createSonarWave(b.x, b.y, 440, '#a855f7');
      for (let i = 0; i < 32; i++) createParticle(b.x, b.y, '#a855f7', 4.0);
    }

    if (b.phase < 3 && hpFrac <= 0.35 && b.hp > 0) {
      b.phase = 3;
      b.vx = Math.sign(b.vx || 1) * 2.85;
      b.shieldActive = true;
      b.shieldMaxHp = 180;
      b.shieldHp = 180;
      b.shieldRechargeTimer = 0;
      window.AbyssAudio?.playBossPhaseShift?.();
      window.AbyssInput?.triggerHaptic?.(180, 0.65, 0.95);
      createSonarWave(b.x, b.y, 520, '#10b981');
      for (let i = 0; i < 38; i++) createParticle(b.x, b.y, '#10b981', 4.5);
    }

    if (b.hp <= 0) {
      b.shieldActive = false;
      state.bossBeams = [];
      state.isVictory = true;
      state.score += 3000;
      window.AbyssAudio?.playVictoryFanfare?.();
      window.AbyssInput?.triggerHaptic?.(220, 0.75, 1.0);
      createSonarWave(b.x, b.y, 640, '#10b981');
      for (let i = 0; i < 55; i++) createParticle(b.x, b.y, '#38bdf8', 5);
    }
  }

  // PLAYER ABILITY ACTIONS
  function actJump() {
    // ✕: Hydro-Jet Propulsion Boost
    const p = state.player;
    if (p.energy < 15 || p.dashCooldown > 0) return false;
    p.energy = Math.max(0, p.energy - 15);
    p.dashCooldown = 28;

    const boostSpeed = 10.5;
    p.vx = Math.cos(p.angle) * boostSpeed;
    p.vy = Math.sin(p.angle) * boostSpeed;

    window.AbyssAudio?.playJetBoost?.();
    window.AbyssInput?.triggerHaptic?.(55, 0.3, 0.45);

    for (let i = 0; i < 14; i++) {
      createBubble(p.x - Math.cos(p.angle) * 20, p.y - Math.sin(p.angle) * 20, -p.vx * 0.35, -p.vy * 0.35);
    }
    return true;
  }

  function actDash() {
    // ◯: Sub-Vortex Evasion Dive
    const p = state.player;
    if (p.energy < 22 || p.invulnerableUntil > performance.now()) return false;
    p.energy = Math.max(0, p.energy - 22);
    p.invulnerableUntil = performance.now() + 680;
    p.vx *= 1.85;
    p.vy *= 1.85;

    window.AbyssAudio?.playJetBoost?.();
    window.AbyssInput?.triggerHaptic?.(60, 0.35, 0.5);
    createSonarWave(p.x, p.y, 90, '#38bdf8');
    return true;
  }

  function actAegis() {
    // △: Continuity Sonar Ping (Stuns nearby hazards & shatters Boss TVI Shield)
    const p = state.player;
    if (p.energy < 28 || p.sonarCooldown > 0) return false;
    p.energy = Math.max(0, p.energy - 28);
    p.sonarCooldown = 90;

    window.AbyssAudio?.playSonarPing?.();
    window.AbyssInput?.triggerHaptic?.(85, 0.4, 0.6);
    createSonarWave(p.x, p.y, 350, '#00f3ff');

    const now = performance.now();
    state.enemies.forEach(e => {
      const dist = Math.hypot(e.x - p.x, e.y - p.y);
      if (dist < 350) {
        e.staggeredUntil = now + 4000;
        for (let i = 0; i < 6; i++) {
          createParticle(e.x, e.y, '#00f3ff', 2);
        }
      }
    });

    if (state.boss) {
      const bDist = Math.hypot(state.boss.x - p.x, state.boss.y - p.y);
      if (bDist < 420) {
        if (state.boss.shieldActive) {
          shatterBossTviShield(state.boss, 65);
        } else {
          damageBoss(55, true);
        }
        createSonarWave(state.boss.x, state.boss.y, 130, '#38bdf8');
      }
    }
    return true;
  }

  function actPulse() {
    // R2: Conjugate Torpedo
    const p = state.player;
    if (p.torpedoCooldown > 0) return false;
    p.torpedoCooldown = 18;

    window.AbyssAudio?.playTorpedo?.();

    const speed = 13.8;
    const offsetDist = 26;
    const tx = p.x + Math.cos(p.angle) * offsetDist;
    const ty = p.y + Math.sin(p.angle) * offsetDist;

    state.torpedoes.push({
      x: tx,
      y: ty,
      vx: Math.cos(p.angle) * speed,
      vy: Math.sin(p.angle) * speed,
      angle: p.angle,
      radius: 6,
      damage: 40,
      life: 95,
      reflected: false
    });

    createBubble(tx, ty, -Math.cos(p.angle) * 2, -Math.sin(p.angle) * 2);
    return true;
  }

  function actOverdrive() {
    // L2: TVI Resonance Shockwave (Shatters Phase 3 TVI Shield anywhere nearby)
    const p = state.player;
    if (p.energy < 60 || p.tviCooldown > 0) return false;
    p.energy = Math.max(0, p.energy - 60);
    p.tviCooldown = 120;

    window.AbyssAudio?.playExplosion?.();
    window.AbyssInput?.triggerHaptic?.(140, 0.7, 0.9);
    createSonarWave(p.x, p.y, 600, '#8b5cf6');

    state.enemies = state.enemies.filter(e => {
      const dist = Math.hypot(e.x - p.x, e.y - p.y);
      if (dist < 480) {
        state.score += 100 * state.combo;
        for (let i = 0; i < 14; i++) {
          createParticle(e.x, e.y, '#8b5cf6', 3.5);
        }
        return false;
      }
      return true;
    });

    if (state.boss) {
      const bDist = Math.hypot(state.boss.x - p.x, state.boss.y - p.y);
      if (bDist < 620) {
        if (state.boss.shieldActive) {
          shatterBossTviShield(state.boss, 160);
        } else {
          damageBoss(160, true);
        }
        for (let i = 0; i < 20; i++) {
          createParticle(state.boss.x, state.boss.y, '#8b5cf6', 4);
        }
      }
    }
    return true;
  }

  function findNearbyGate() {
    const p = state.player;
    return state.gates.find(g => !g.isUnlocked && Math.hypot(g.x - p.x, g.y - p.y) <= 100);
  }

  function findNearbyStaggeredEnemy() {
    const p = state.player;
    const now = performance.now();
    return state.enemies.find(e => e.staggeredUntil > now && Math.hypot(e.x - p.x, e.y - p.y) <= 75);
  }

  function executeStaggeredEnemy(e) {
    state.enemies = state.enemies.filter(item => item !== e);
    state.score += 150 * state.combo;
    state.combo = Math.min(10, state.combo + 1);
    state.comboTimer = 240;
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 15);
    state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 20);

    window.AbyssAudio?.playExplosion?.();
    window.AbyssInput?.triggerHaptic?.(95, 0.5, 0.75);
    for (let i = 0; i < 18; i++) {
      createParticle(e.x, e.y, '#10b981', 3.5);
    }
  }

  function unlockGate(gate) {
    if (!gate || gate.isUnlocked) return;
    gate.isUnlocked = true;
    state.gatesCleared++;
    window.ArcadeCore?.Progress?.recordSealProgress('limit-abyss', state.gatesCleared);
    state.score += 500 * state.combo;
    state.player.hp = state.player.maxHp;
    state.player.energy = state.player.maxEnergy;

    window.AbyssAudio?.playOverrideSuccess?.();
    window.AbyssInput?.triggerHaptic?.(120, 0.45, 0.8);
    createSonarWave(gate.x, gate.y, 400, '#10b981');

    if (gate.sectorId < 4) {
      spawnSectorEnemies(gate.sectorId + 1);
    } else {
      spawnLeviathanBoss();
    }
  }

  function bypassGateWithEnergy(gate) {
    if (!gate || gate.isUnlocked) return false;
    if (state.player.energy < 60) return false;
    state.player.energy -= 60;
    state.bypassesUsed++;
    unlockGate(gate);
    return true;
  }

  function createParticle(x, y, color = '#00f3ff', speed = 2.5) {
    if (state.particles.length >= MAX_PARTICLES) {
      state.particles.shift();
    }
    const ang = Math.random() * Math.PI * 2;
    const spd = (0.5 + Math.random() * 0.8) * speed;
    state.particles.push({
      x,
      y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      radius: 2 + Math.random() * 3.5,
      color,
      alpha: 1,
      decay: 0.02 + Math.random() * 0.03
    });
  }

  function createBubble(x, y, vx = 0, vy = -1) {
    if (state.particles.length >= MAX_PARTICLES) {
      state.particles.shift();
    }
    state.particles.push({
      x,
      y,
      vx: vx + (Math.random() - 0.5) * 0.8,
      vy: vy - 0.5 - Math.random() * 1.5,
      radius: 2 + Math.random() * 4,
      color: '#38bdf8',
      alpha: 0.8,
      isBubble: true,
      decay: 0.014
    });
  }

  function createSonarWave(x, y, maxRadius = 300, color = '#00f3ff') {
    if (state.sonarWaves.length > 16) state.sonarWaves.shift();
    state.sonarWaves.push({
      x,
      y,
      radius: 10,
      maxRadius,
      color,
      alpha: 0.9,
      speed: 7.5
    });
  }

  // Distance from point (px, py) to segment (x1, y1)-(x2, y2)
  function pointToSegmentDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  // MAIN PHYSICS UPDATE LOOP (60FPS)
  function updateWorld() {
    if (state.isGameOver || state.isVictory) return;

    const p = state.player;
    const now = performance.now();

    if (p.energy < p.maxEnergy) {
      p.energy = Math.min(p.maxEnergy, p.energy + 0.16);
    }

    if (p.dashCooldown > 0) p.dashCooldown--;
    if (p.sonarCooldown > 0) p.sonarCooldown--;
    if (p.torpedoCooldown > 0) p.torpedoCooldown--;
    if (p.tviCooldown > 0) p.tviCooldown--;

    if (state.comboTimer > 0) {
      state.comboTimer--;
      if (state.comboTimer <= 0) state.combo = 1;
    }

    p.vx += (p.targetVx - p.vx) * 0.12;
    p.vy += (p.targetVy - p.vy) * 0.12;

    p.x += p.vx;
    p.y += p.vy;

    p.x = Math.max(p.radius + 40, Math.min(WORLD_WIDTH - p.radius - 40, p.x));
    p.y = Math.max(p.radius + 30, Math.min(WORLD_HEIGHT - p.radius - 30, p.y));

    if (Math.hypot(p.vx, p.vy) > 0.4) {
      const targetAngle = Math.atan2(p.vy, p.vx);
      let diff = targetAngle - p.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      p.angle += diff * 0.18;
    }

    // Update acoustic depth atmosphere
    window.AbyssAudio?.setDepthRatio?.(p.y / WORLD_HEIGHT);

    // Thermal vents energy & acoustic bubbles
    for (let i = 0; i < state.bubbleVents.length; i++) {
      const v = state.bubbleVents[i];
      const d = Math.hypot(v.x - p.x, v.y - p.y);
      if (d < v.radius + p.radius) {
        p.energy = Math.min(p.maxEnergy, p.energy + v.restored);
        p.hp = Math.min(p.maxHp, p.hp + 0.04);
        if (now - state.lastBubbleSoundAt > 480) {
          state.lastBubbleSoundAt = now;
          window.AbyssAudio?.playBubblePop?.();
        }
      }
      if (Math.random() < 0.22) {
        createBubble(v.x + (Math.random() - 0.5) * v.radius, v.y + (Math.random() - 0.5) * v.radius);
      }
    }

    // Update Torpedoes & TVI Shield Interaction
    for (let i = state.torpedoes.length - 1; i >= 0; i--) {
      const t = state.torpedoes[i];
      t.x += t.vx;
      t.y += t.vy;
      t.life--;

      if (Math.random() < 0.28) {
        createBubble(t.x, t.y, -t.vx * 0.2, -t.vy * 0.2);
      }

      let hit = false;
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const e = state.enemies[j];
        if (Math.hypot(e.x - t.x, e.y - t.y) < e.radius + t.radius) {
          e.hp -= t.damage;
          hit = true;
          for (let k = 0; k < 5; k++) createParticle(t.x, t.y, '#38bdf8', 2);

          if (e.hp <= 0) {
            state.score += 80 * state.combo;
            state.enemies.splice(j, 1);
            window.AbyssAudio?.playExplosion?.();
            for (let k = 0; k < 12; k++) createParticle(e.x, e.y, '#f59e0b', 3);
          }
          break;
        }
      }

      // Boss & Phase 3 TVI Shield Collision
      if (!hit && state.boss && !t.reflected) {
        const b = state.boss;
        const distToBoss = Math.hypot(t.x - b.x, t.y - b.y);

        if (b.shieldActive) {
          const shieldR = b.shieldRadius || (b.radius + 30);
          if (distToBoss <= shieldR + t.radius) {
            const impactAngle = Math.atan2(t.y - b.y, t.x - b.x);
            if (isAngleInTviRootWindow(b, impactAngle)) {
              // Torpedo pierced through the TVI Root Window f(α) = 0!
              hit = true;
              b.shieldHp = Math.max(0, b.shieldHp - 55);
              for (let k = 0; k < 10; k++) createParticle(t.x, t.y, '#10b981', 3.2);
              damageBoss(25, true);
              if (b.shieldHp <= 0) {
                shatterBossTviShield(b, 0);
              } else {
                window.AbyssAudio?.playTorpedo?.();
              }
            } else {
              // Deflected off solid TVI sign barrier!
              const nx = Math.cos(impactAngle);
              const ny = Math.sin(impactAngle);
              const spd = Math.hypot(t.vx, t.vy);
              t.x = b.x + nx * (shieldR + t.radius + 3);
              t.y = b.y + ny * (shieldR + t.radius + 3);
              t.vx = nx * spd * 0.85;
              t.vy = ny * spd * 0.85;
              t.angle = Math.atan2(t.vy, t.vx);
              t.life = Math.min(t.life, 18);
              t.reflected = true;

              b.shieldHp = Math.max(0, b.shieldHp - 10);
              window.AbyssAudio?.playShieldDeflect?.();
              for (let k = 0; k < 7; k++) createParticle(t.x, t.y, '#a855f7', 2.8);
              if (b.shieldHp <= 0) {
                shatterBossTviShield(b, 0);
              }
            }
          }
        } else if (distToBoss < b.radius + t.radius) {
          hit = true;
          for (let k = 0; k < 7; k++) createParticle(t.x, t.y, '#f43f5e', 2.5);
          damageBoss(t.damage, true);
        }
      }

      if (hit || t.life <= 0 || t.x < 0 || t.x > WORLD_WIDTH || t.y < 0 || t.y > WORLD_HEIGHT) {
        state.torpedoes.splice(i, 1);
      }
    }

    // Update Enemies
    for (let idx = 0; idx < state.enemies.length; idx++) {
      const e = state.enemies[idx];
      e.pulse = (e.pulse || 0) + 0.04;
      const isStaggered = e.staggeredUntil > now;

      if (!isStaggered) {
        if (e.type === 'mine') {
          e.x += e.vx;
          e.y += e.vy;
          if (e.x < 80 || e.x > WORLD_WIDTH - 80) e.vx *= -1;
          if (e.y < 60 || e.y > WORLD_HEIGHT - 60) e.vy *= -1;
        } else if (e.type === 'jelly') {
          e.x += e.vx;
          e.y += e.vy;
          if (e.x < 100 || e.x > WORLD_WIDTH - 100) e.vx *= -1;
          if (e.y < 100 || e.y > WORLD_HEIGHT - 100) e.vy *= -1;
        } else if (e.type === 'vortex') {
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < 220 && d > 10) {
            const pull = 0.5 * (1 - d / 220);
            p.vx += ((e.x - p.x) / d) * pull;
            p.vy += ((e.y - p.y) / d) * pull;
          }
        }

        const dist = Math.hypot(e.x - p.x, e.y - p.y);
        if (dist < e.radius + p.radius) {
          if (p.invulnerableUntil <= now) {
            p.hp = Math.max(0, p.hp - 16);
            p.invulnerableUntil = now + 900;
            window.AbyssAudio?.playExplosion?.();
            window.AbyssInput?.triggerHaptic?.(110, 0.55, 0.8);
            for (let k = 0; k < 10; k++) createParticle(p.x, p.y, '#f43f5e', 3);

            if (p.hp <= 0) {
              state.isGameOver = true;
            }
          }
        }
      }
    }

    // Update Leviathan Boss & 3-Phase Attack Patterns
    if (state.boss) {
      const b = state.boss;
      b.pulse += 0.03;
      if (b.hitFlash > 0) b.hitFlash--;

      // Rotate TVI Root Window α (f(α) = 0)
      b.tviGapAngle = (b.tviGapAngle + (b.phase === 3 ? 0.022 : 0.012)) % (Math.PI * 2);

      const isStunned = (b.stunnedUntil || 0) > now;
      if (!isStunned) {
        b.x += b.vx;
        if (b.x < 300 || b.x > WORLD_WIDTH - 300) b.vx *= -1;

        if (b.phase === 3) {
          b.y = Math.max(1340, Math.min(WORLD_HEIGHT - 95, b.baseY + Math.sin(b.pulse * 1.4) * 44));
        }

        // Phase 3 TVI Shield Recharge Cycle
        if (b.phase === 3 && !b.shieldActive) {
          b.shieldRechargeTimer--;
          if (b.shieldRechargeTimer <= 0) {
            b.shieldActive = true;
            b.shieldHp = b.shieldMaxHp;
            createSonarWave(b.x, b.y, b.shieldRadius + 45, '#10b981');
            window.AbyssAudio?.playBossPhaseShift?.();
          }
        }

        // Spikes & Mines Launcher
        b.attackTimer++;
        const fireThreshold = b.phase === 1 ? 108 : (b.phase === 2 ? 95 : 88);
        if (b.attackTimer > fireThreshold) {
          b.attackTimer = 0;
          if (state.enemies.length < MAX_ENEMIES) {
            const baseAng = Math.atan2(p.y - b.y, p.x - b.x);
            const angles = b.phase === 1 ? [baseAng] : (b.phase === 2 ? [baseAng - 0.24, baseAng + 0.24] : [baseAng - 0.34, baseAng, baseAng + 0.34]);
            const spd = b.phase === 3 ? 4.6 : 4.2;
            for (let aIdx = 0; aIdx < angles.length; aIdx++) {
              const ang = angles[aIdx];
              state.enemies.push({
                id: 'spike_' + Math.random().toString(36).slice(2, 7),
                type: 'mine',
                label: b.phase === 3 ? '∞/∞' : (b.phase === 2 ? 'lim⁻≠lim⁺' : '0/0'),
                x: b.x + Math.cos(ang) * (b.radius + 10),
                y: b.y + Math.sin(ang) * (b.radius + 10),
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                radius: 15,
                hp: 20,
                maxHp: 20,
                staggeredUntil: 0,
                pulse: 0
              });
            }
          }
        }

        // Phase 2 & 3 Discontinuity Jump Beams
        if (b.phase >= 2) {
          b.beamTimer++;
          const beamCooldown = b.phase === 3 ? 210 : 185;
          if (b.beamTimer >= beamCooldown) {
            b.beamTimer = 0;
            const ang = Math.atan2(p.y - b.y, p.x - b.x);
            state.bossBeams.push({
              x1: b.x,
              y1: b.y,
              x2: b.x + Math.cos(ang) * 760,
              y2: b.y + Math.sin(ang) * 760,
              warningFrames: 54,
              activeFrames: 28,
              hitCooldown: 0
            });
            window.AbyssAudio?.playBeamCharge?.();
          }
        }
      }

      // Boss / TVI Shield Collision with Submarine (radial repulsion prevents entrapment!)
      const effectiveRadius = b.shieldActive ? (b.shieldRadius || b.radius + 30) : b.radius;
      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const dist = Math.hypot(dx, dy);

      if (dist < effectiveRadius + p.radius) {
        const nx = dist > 0.01 ? dx / dist : 0;
        const ny = dist > 0.01 ? dy / dist : -1;

        // Smooth separation push so submarine never stays trapped inside core or shield
        const pushDist = effectiveRadius + p.radius + 4;
        p.x = Math.max(p.radius + 40, Math.min(WORLD_WIDTH - p.radius - 40, b.x + nx * pushDist));
        p.y = Math.max(p.radius + 30, Math.min(WORLD_HEIGHT - p.radius - 30, b.y + ny * pushDist));

        if (p.invulnerableUntil <= now) {
          p.vx = nx * 8.2;
          p.vy = ny * 8.2;
          p.hp = Math.max(0, p.hp - (b.shieldActive ? 20 : 24));
          p.invulnerableUntil = now + 900;
          if (b.shieldActive) {
            window.AbyssAudio?.playShieldDeflect?.();
          } else {
            window.AbyssAudio?.playExplosion?.();
          }
          window.AbyssInput?.triggerHaptic?.(140, 0.65, 0.9);
          for (let k = 0; k < 14; k++) {
            createParticle(p.x, p.y, b.shieldActive ? '#10b981' : '#f43f5e', 3.4);
          }
          if (p.hp <= 0) state.isGameOver = true;
        }
      }
    }

    // Update Discontinuity Beams
    for (let i = state.bossBeams.length - 1; i >= 0; i--) {
      const bm = state.bossBeams[i];
      if (state.boss) {
        bm.x1 = state.boss.x;
        bm.y1 = state.boss.y;
      }
      if (bm.warningFrames > 0) {
        bm.warningFrames--;
        if (bm.warningFrames === 0) {
          window.AbyssAudio?.playBeamFire?.();
          window.AbyssInput?.triggerHaptic?.(90, 0.4, 0.65);
        }
      } else if (bm.activeFrames > 0) {
        bm.activeFrames--;
        if (bm.hitCooldown > 0) bm.hitCooldown--;
        const dSeg = pointToSegmentDist(p.x, p.y, bm.x1, bm.y1, bm.x2, bm.y2);
        if (dSeg < p.radius + 10 && p.invulnerableUntil <= now && bm.hitCooldown <= 0) {
          bm.hitCooldown = 24;
          p.hp = Math.max(0, p.hp - 18);
          p.invulnerableUntil = now + 850;
          window.AbyssAudio?.playExplosion?.();
          window.AbyssInput?.triggerHaptic?.(120, 0.6, 0.85);
          for (let k = 0; k < 10; k++) createParticle(p.x, p.y, '#e879f9', 3.2);
          if (p.hp <= 0) state.isGameOver = true;
        }
      } else {
        state.bossBeams.splice(i, 1);
      }
    }

    // Update Sonar Waves
    for (let i = state.sonarWaves.length - 1; i >= 0; i--) {
      const sw = state.sonarWaves[i];
      sw.radius += sw.speed;
      sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
      if (sw.radius >= sw.maxRadius || sw.alpha <= 0.02) {
        state.sonarWaves.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.alpha -= pt.decay;
      if (pt.isBubble) {
        pt.vx *= 0.98;
      }
      if (pt.alpha <= 0) {
        state.particles.splice(i, 1);
      }
    }

    // Update current sector index based on player depth Y
    if (p.y < 380) state.currentSectorIdx = 0;
    else if (p.y < 780) state.currentSectorIdx = 1;
    else if (p.y < 1180) state.currentSectorIdx = 2;
    else state.currentSectorIdx = 3;

    if (state.currentSectorIdx !== state.lastSectorIdx) {
      state.lastSectorIdx = state.currentSectorIdx;
      window.AbyssAudio?.playAbyssCreak?.();
    }
  }

  return {
    WORLD_WIDTH,
    WORLD_HEIGHT,
    initWorld,
    updateWorld,
    getState: () => state,
    actJump,
    actDash,
    actAegis,
    actPulse,
    actOverdrive,
    findNearbyGate,
    findNearbyStaggeredEnemy,
    executeStaggeredEnemy,
    unlockGate,
    bypassGateWithEnergy,
    createSonarWave,
    createParticle
  };
})();
