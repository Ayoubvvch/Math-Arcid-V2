/**
 * Limit Abyss — هاوية النهايات والاتصال 2BAC PC
 * World Physics, Subnautic Trench Simulation & Abyssal Ecosystem Engine
 */

window.AbyssWorld = (function() {
  const WORLD_WIDTH = 2560;
  const WORLD_HEIGHT = 1600;

  let state = {
    player: {
      x: 1280,
      y: 120,
      vx: 0,
      vy: 0,
      targetVx: 0,
      targetVy: 0,
      angle: Math.PI / 2, // Facing downwards into the trench
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
    isBossSpawned: false,
    isVictory: false,
    isGameOver: false
  };

  function initWorld() {
    state.player.x = 1280;
    state.player.y = 120;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.angle = Math.PI / 2;
    state.player.hp = 100;
    state.player.energy = 100;
    state.player.invulnerableUntil = 0;

    state.score = 0;
    state.combo = 1;
    state.comboTimer = 0;
    state.gatesCleared = 0;
    state.bypassesUsed = 0;
    state.correctAnswers = 0;
    state.totalAnswers = 0;
    state.currentSectorIdx = 0;
    state.isBossSpawned = false;
    state.isVictory = false;
    state.isGameOver = false;

    state.torpedoes = [];
    state.particles = [];
    state.sonarWaves = [];
    state.enemies = [];
    state.boss = null;

    initGates();
    initBubbleVents();
    spawnSectorEnemies(1);
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

    // Spawn Indeterminate Mines
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

    // Spawn Discontinuity Jellies
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

    // Spawn Infinite Divergence Vortices
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
      y: 1510,
      vx: 1.5,
      vy: 0,
      radius: 72,
      hp: 1000,
      maxHp: 1000,
      phase: 1, // 1: Void Spikes, 2: Discontinuity Beams, 3: TVI Resonance
      attackTimer: 0,
      shieldActive: false,
      pulse: 0,
      name: 'لوفياثان الانقطاع العظيم (Leviathan Discontinuity Core)'
    };

    // Emit massive spawn shockwave
    createSonarWave(1280, 1510, 480, '#f43f5e');
    for (let i = 0; i < 60; i++) {
      createParticle(1280, 1510, '#f43f5e', 4.5);
    }
  }

  // PLAYER ABILITY ACTIONS
  function actJump() {
    // ✕: Hydro-Jet Propulsion Boost
    const p = state.player;
    if (p.energy < 15 || p.dashCooldown > 0) return false;
    p.energy = Math.max(0, p.energy - 15);
    p.dashCooldown = 28; // frames

    const boostSpeed = 10.5;
    p.vx = Math.cos(p.angle) * boostSpeed;
    p.vy = Math.sin(p.angle) * boostSpeed;

    window.AbyssAudio?.playJetBoost?.();

    for (let i = 0; i < 16; i++) {
      createBubble(p.x - Math.cos(p.angle) * 20, p.y - Math.sin(p.angle) * 20, -p.vx * 0.35, -p.vy * 0.35);
    }
    return true;
  }

  function actDash() {
    // ◯: Sub-Vortex Evasion Dive
    const p = state.player;
    if (p.energy < 22 || p.invulnerableUntil > performance.now()) return false;
    p.energy = Math.max(0, p.energy - 22);
    p.invulnerableUntil = performance.now() + 650; // 650ms invulnerability
    p.vx *= 1.8;
    p.vy *= 1.8;

    window.AbyssAudio?.playJetBoost?.();
    createSonarWave(p.x, p.y, 85, '#38bdf8');
    return true;
  }

  function actAegis() {
    // △: Continuity Sonar Ping (Stuns all nearby hazards)
    const p = state.player;
    if (p.energy < 28 || p.sonarCooldown > 0) return false;
    p.energy = Math.max(0, p.energy - 28);
    p.sonarCooldown = 90; // frames (~1.5s)

    window.AbyssAudio?.playSonarPing?.();
    createSonarWave(p.x, p.y, 340, '#00f3ff');

    const now = performance.now();
    // Stun nearby enemies
    state.enemies.forEach(e => {
      const dist = Math.hypot(e.x - p.x, e.y - p.y);
      if (dist < 340) {
        e.staggeredUntil = now + 4000; // 4 seconds stun
        for (let i = 0; i < 8; i++) {
          createParticle(e.x, e.y, '#00f3ff', 2);
        }
      }
    });

    if (state.boss) {
      const bDist = Math.hypot(state.boss.x - p.x, state.boss.y - p.y);
      if (bDist < 360) {
        state.boss.hp = Math.max(0, state.boss.hp - 45);
        state.boss.shieldActive = false;
        createSonarWave(state.boss.x, state.boss.y, 110, '#38bdf8');
      }
    }
    return true;
  }

  function actPulse() {
    // R2: Conjugate Torpedo
    const p = state.player;
    if (p.torpedoCooldown > 0) return false;
    p.torpedoCooldown = 18; // frames

    window.AbyssAudio?.playTorpedo?.();

    const speed = 13.5;
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
      life: 95
    });

    createBubble(tx, ty, -Math.cos(p.angle) * 2, -Math.sin(p.angle) * 2);
    return true;
  }

  function actOverdrive() {
    // L2: TVI Resonance Shockwave
    const p = state.player;
    if (p.energy < 60 || p.tviCooldown > 0) return false;
    p.energy = Math.max(0, p.energy - 60);
    p.tviCooldown = 120; // 2 seconds

    window.AbyssAudio?.playExplosion?.();
    createSonarWave(p.x, p.y, 600, '#8b5cf6');

    // Annihilate non-boss enemies in wide radius
    state.enemies = state.enemies.filter(e => {
      const dist = Math.hypot(e.x - p.x, e.y - p.y);
      if (dist < 480) {
        state.score += 100 * state.combo;
        for (let i = 0; i < 18; i++) {
          createParticle(e.x, e.y, '#8b5cf6', 3.5);
        }
        return false;
      }
      return true;
    });

    if (state.boss) {
      state.boss.hp = Math.max(0, state.boss.hp - 160);
      for (let i = 0; i < 24; i++) {
        createParticle(state.boss.x, state.boss.y, '#8b5cf6', 4);
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
    for (let i = 0; i < 20; i++) {
      createParticle(e.x, e.y, '#10b981', 3.5);
    }
  }

  function unlockGate(gate) {
    if (!gate || gate.isUnlocked) return;
    gate.isUnlocked = true;
    state.gatesCleared++;
    state.score += 500 * state.combo;
    state.player.hp = state.player.maxHp;
    state.player.energy = state.player.maxEnergy;

    window.AbyssAudio?.playOverrideSuccess?.();
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

  // PARTICLE AND FX HELPERS
  function createParticle(x, y, color = '#00f3ff', speed = 2.5) {
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
    state.particles.push({
      x,
      y,
      vx: vx + (Math.random() - 0.5) * 0.8,
      vy: vy - 0.5 - Math.random() * 1.5,
      radius: 2 + Math.random() * 4,
      color: '#38bdf8',
      alpha: 0.8,
      isBubble: true,
      decay: 0.012
    });
  }

  function createSonarWave(x, y, maxRadius = 300, color = '#00f3ff') {
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

  // MAIN PHYSICS UPDATE LOOP (60FPS)
  function updateWorld() {
    if (state.isGameOver || state.isVictory) return;

    const p = state.player;
    const now = performance.now();

    // Recharging energy
    if (p.energy < p.maxEnergy) {
      p.energy = Math.min(p.maxEnergy, p.energy + 0.16);
    }

    // Cooldown timers
    if (p.dashCooldown > 0) p.dashCooldown--;
    if (p.sonarCooldown > 0) p.sonarCooldown--;
    if (p.torpedoCooldown > 0) p.torpedoCooldown--;
    if (p.tviCooldown > 0) p.tviCooldown--;

    if (state.comboTimer > 0) {
      state.comboTimer--;
      if (state.comboTimer <= 0) state.combo = 1;
    }

    // Player Movement & Inertia
    p.vx += (p.targetVx - p.vx) * 0.12;
    p.vy += (p.targetVy - p.vy) * 0.12;

    p.x += p.vx;
    p.y += p.vy;

    // Trench Boundaries Clamping
    p.x = Math.max(p.radius + 40, Math.min(WORLD_WIDTH - p.radius - 40, p.x));
    p.y = Math.max(p.radius + 30, Math.min(WORLD_HEIGHT - p.radius - 30, p.y));

    // Update player facing angle based on velocity or target
    if (Math.hypot(p.vx, p.vy) > 0.4) {
      const targetAngle = Math.atan2(p.vy, p.vx);
      let diff = targetAngle - p.angle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      p.angle += diff * 0.18;
    }

    // Thermal vents energy replenishment
    state.bubbleVents.forEach(v => {
      const d = Math.hypot(v.x - p.x, v.y - p.y);
      if (d < v.radius + p.radius) {
        p.energy = Math.min(p.maxEnergy, p.energy + v.restored);
        p.hp = Math.min(p.maxHp, p.hp + 0.04);
      }
      if (Math.random() < 0.25) {
        createBubble(v.x + (Math.random() - 0.5) * v.radius, v.y + (Math.random() - 0.5) * v.radius);
      }
    });

    // Update Torpedoes
    for (let i = state.torpedoes.length - 1; i >= 0; i--) {
      const t = state.torpedoes[i];
      t.x += t.vx;
      t.y += t.vy;
      t.life--;

      if (Math.random() < 0.3) {
        createBubble(t.x, t.y, -t.vx * 0.2, -t.vy * 0.2);
      }

      let hit = false;
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const e = state.enemies[j];
        if (Math.hypot(e.x - t.x, e.y - t.y) < e.radius + t.radius) {
          e.hp -= t.damage;
          hit = true;
          for (let k = 0; k < 6; k++) createParticle(t.x, t.y, '#38bdf8', 2);

          if (e.hp <= 0) {
            state.score += 80 * state.combo;
            state.enemies.splice(j, 1);
            window.AbyssAudio?.playExplosion?.();
            for (let k = 0; k < 14; k++) createParticle(e.x, e.y, '#f59e0b', 3);
          }
          break;
        }
      }

      if (!hit && state.boss) {
        if (Math.hypot(state.boss.x - t.x, state.boss.y - t.y) < state.boss.radius + t.radius) {
          state.boss.hp = Math.max(0, state.boss.hp - t.damage);
          hit = true;
          for (let k = 0; k < 8; k++) createParticle(t.x, t.y, '#f43f5e', 2.5);
          if (state.boss.hp <= 0) {
            state.isVictory = true;
            state.score += 3000;
            window.AbyssAudio?.playVictoryFanfare?.();
          }
        }
      }

      if (hit || t.life <= 0 || t.x < 0 || t.x > WORLD_WIDTH || t.y < 0 || t.y > WORLD_HEIGHT) {
        state.torpedoes.splice(i, 1);
      }
    }

    // Update Enemies
    state.enemies.forEach(e => {
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
          // Gravitational pull on player
          const d = Math.hypot(e.x - p.x, e.y - p.y);
          if (d < 220 && d > 10) {
            const pull = 0.5 * (1 - d / 220);
            p.vx += ((e.x - p.x) / d) * pull;
            p.vy += ((e.y - p.y) / d) * pull;
          }
        }

        // Check collision with player
        const dist = Math.hypot(e.x - p.x, e.y - p.y);
        if (dist < e.radius + p.radius) {
          if (p.invulnerableUntil <= now) {
            p.hp = Math.max(0, p.hp - 16);
            p.invulnerableUntil = now + 900;
            window.AbyssAudio?.playExplosion?.();
            for (let i = 0; i < 12; i++) createParticle(p.x, p.y, '#f43f5e', 3);

            if (p.hp <= 0) {
              state.isGameOver = true;
            }
          }
        }
      }
    });

    // Update Boss
    if (state.boss) {
      const b = state.boss;
      b.pulse += 0.03;
      b.x += b.vx;
      if (b.x < 300 || b.x > WORLD_WIDTH - 300) b.vx *= -1;

      b.attackTimer = (b.attackTimer || 0) + 1;
      if (b.attackTimer > 110) {
        b.attackTimer = 0;
        // Boss launches void spikes
        const ang = Math.atan2(p.y - b.y, p.x - b.x);
        state.enemies.push({
          id: 'spike_' + Math.random(),
          type: 'mine',
          label: '0/0',
          x: b.x,
          y: b.y,
          vx: Math.cos(ang) * 4.2,
          vy: Math.sin(ang) * 4.2,
          radius: 16,
          hp: 20,
          maxHp: 20,
          staggeredUntil: 0,
          pulse: 0
        });
      }

      // Boss collision with player
      if (Math.hypot(b.x - p.x, b.y - p.y) < b.radius + p.radius) {
        if (p.invulnerableUntil <= now) {
          p.hp = Math.max(0, p.hp - 24);
          p.invulnerableUntil = now + 1000;
          window.AbyssAudio?.playExplosion?.();
          if (p.hp <= 0) state.isGameOver = true;
        }
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
