/**
 * Limit Abyss — هاوية النهايات والاتصال 2BAC PC
 * Full-Screen 60FPS Abyssal Renderer, Phase 3 TVI Shield Visualizer & Math Graphing Engine
 * Optimized for zero per-frame gradient/shadowBlur churn.
 */

window.AbyssRenderer = (function() {
  let canvas = null;
  let ctx = null;
  let dpr = 1;
  let cachedGradients = null;

  const camera = {
    x: 1280,
    y: 120,
    width: window.innerWidth,
    height: window.innerHeight
  };

  function initRenderer() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d', { alpha: false });
    cachedGradients = null;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    camera.width = window.innerWidth;
    camera.height = window.innerHeight;
    canvas.width = Math.round(camera.width * dpr);
    canvas.height = Math.round(camera.height * dpr);
    canvas.style.width = camera.width + 'px';
    canvas.style.height = camera.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function ensureBackdropGradients() {
    if (cachedGradients || !ctx) return cachedGradients;
    const g1 = ctx.createLinearGradient(0, 0, 0, 380);
    g1.addColorStop(0, '#03193a');
    g1.addColorStop(1, '#020f26');

    const g2 = ctx.createLinearGradient(0, 380, 0, 780);
    g2.addColorStop(0, '#020f26');
    g2.addColorStop(1, '#010817');

    const g3 = ctx.createLinearGradient(0, 780, 0, 1180);
    g3.addColorStop(0, '#010817');
    g3.addColorStop(1, '#01040f');

    const g4 = ctx.createLinearGradient(0, 1180, 0, 1600);
    g4.addColorStop(0, '#01040f');
    g4.addColorStop(1, '#000206');

    const subConeGrad = ctx.createRadialGradient(25, 0, 10, 140, 0, 120);
    subConeGrad.addColorStop(0, 'rgba(0, 243, 255, 0.42)');
    subConeGrad.addColorStop(0.6, 'rgba(0, 243, 255, 0.12)');
    subConeGrad.addColorStop(1, 'rgba(0, 243, 255, 0)');

    cachedGradients = { sectors: [g1, g2, g3, g4], subConeGrad, ventMap: new WeakMap() };
    return cachedGradients;
  }

  function updateCamera(player) {
    const targetX = player.x - camera.width / 2;
    const targetY = player.y - camera.height / 2;

    const maxCamX = window.AbyssWorld.WORLD_WIDTH - camera.width;
    const maxCamY = window.AbyssWorld.WORLD_HEIGHT - camera.height;

    const clampedTargetX = Math.max(0, Math.min(maxCamX > 0 ? maxCamX : 0, targetX));
    const clampedTargetY = Math.max(0, Math.min(maxCamY > 0 ? maxCamY : 0, targetY));

    camera.x += (clampedTargetX - camera.x) * 0.12;
    camera.y += (clampedTargetY - camera.y) * 0.12;
  }

  function renderWorld() {
    if (!canvas || !ctx) return;
    const worldState = window.AbyssWorld?.getState?.();
    if (!worldState) return;

    updateCamera(worldState.player);
    ensureBackdropGradients();

    ctx.save();
    ctx.clearRect(0, 0, camera.width, camera.height);
    ctx.translate(-camera.x, -camera.y);

    drawAbyssalBackdrop();
    drawThermalVents(worldState.bubbleVents);
    drawGates(worldState.gates, worldState.player);
    drawTorpedoes(worldState.torpedoes);
    drawEnemies(worldState.enemies);
    if (worldState.bossBeams && worldState.bossBeams.length > 0) {
      drawBossBeams(worldState.bossBeams);
    }
    if (worldState.boss) drawBoss(worldState.boss);
    drawPlayerSub(worldState.player);
    drawSonarWaves(worldState.sonarWaves);
    drawParticles(worldState.particles);

    ctx.restore();

    drawMiniSonar(worldState);
  }

  function drawAbyssalBackdrop() {
    const W = window.AbyssWorld.WORLD_WIDTH;
    const H = window.AbyssWorld.WORLD_HEIGHT;
    const grads = cachedGradients.sectors;

    ctx.fillStyle = grads[0];
    ctx.fillRect(0, 0, W, 380);
    ctx.fillStyle = grads[1];
    ctx.fillRect(0, 380, W, 400);
    ctx.fillStyle = grads[2];
    ctx.fillRect(0, 780, W, 400);
    ctx.fillStyle = grads[3];
    ctx.fillRect(0, 1180, W, 420);

    // Viewport-culled batched tectonic grid
    const vx0 = Math.max(0, Math.floor(camera.x / 160) * 160);
    const vx1 = Math.min(W, camera.x + camera.width + 160);
    const vy0 = Math.max(0, Math.floor(camera.y / 120) * 120);
    const vy1 = Math.min(H, camera.y + camera.height + 120);

    ctx.strokeStyle = 'rgba(0, 243, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = vx0; x <= vx1; x += 160) {
      ctx.moveTo(x, vy0);
      ctx.lineTo(x, vy1);
    }
    for (let y = vy0; y <= vy1; y += 120) {
      ctx.moveTo(vx0, y);
      ctx.lineTo(vx1, y);
    }
    ctx.stroke();

    ctx.direction = 'ltr';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    for (let y = vy0; y <= vy1; y += 120) {
      if (y === 0) continue;
      ctx.fillText(`${y * 4}m [y=${y}]`, 45, y - 4);
      ctx.fillText(`${y * 4}m`, W - 90, y - 4);
    }
  }

  function drawThermalVents(vents) {
    const ventMap = cachedGradients.ventMap;
    for (let i = 0; i < vents.length; i++) {
      const v = vents[i];
      if (v.x + v.radius < camera.x || v.x - v.radius > camera.x + camera.width ||
          v.y + v.radius < camera.y || v.y - v.radius > camera.y + camera.height) {
        continue;
      }
      let grad = ventMap.get(v);
      if (!grad) {
        grad = ctx.createRadialGradient(v.x, v.y, 5, v.x, v.y, v.radius);
        grad.addColorStop(0, 'rgba(0, 243, 255, 0.25)');
        grad.addColorStop(0.7, 'rgba(20, 184, 166, 0.08)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ventMap.set(v, grad);
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.35)';
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawGates(gates, player) {
    for (let i = 0; i < gates.length; i++) {
      const g = gates[i];
      g.pulsePhase = (g.pulsePhase || 0) + 0.035;
      if (g.x + 140 < camera.x || g.x - 140 > camera.x + camera.width ||
          g.y + 140 < camera.y || g.y - 140 > camera.y + camera.height) {
        continue;
      }
      const r = g.radius + Math.sin(g.pulsePhase) * 4;

      ctx.save();
      ctx.translate(g.x, g.y);

      ctx.strokeStyle = g.isUnlocked ? '#10b981' : (g.sectorId === 1 ? '#00f3ff' : (g.sectorId === 2 ? '#38bdf8' : (g.sectorId === 3 ? '#10b981' : '#f59e0b')));
      ctx.lineWidth = g.isUnlocked ? 2.5 : 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.rotate(g.pulsePhase * 0.5);
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.rotate(-g.pulsePhase * 0.5);
      ctx.direction = g.isUnlocked ? 'rtl' : 'ltr';
      ctx.fillStyle = g.isUnlocked ? '#10b981' : '#ffffff';
      ctx.font = 'bold 15px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(g.isUnlocked ? '✓ مخترق' : (g.sectorId === 1 ? 'lim 0/0' : (g.sectorId === 2 ? 'x → x₀' : (g.sectorId === 3 ? 'TVI' : 'f⁻¹'))), 0, 0);

      ctx.direction = 'rtl';
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(g.depthText, 0, r + 18);

      const dist = Math.hypot(g.x - player.x, g.y - player.y);
      if (!g.isUnlocked && dist <= 100) {
        ctx.fillStyle = '#fde68a';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('[▢ / E] اختراق ختم الضغط', 0, -r - 12);
      }

      ctx.restore();
    }
  }

  function drawTorpedoes(torpedoes) {
    for (let i = 0; i < torpedoes.length; i++) {
      const t = torpedoes[i];
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.angle);

      // Lightweight halo instead of expensive shadowBlur
      ctx.fillStyle = t.reflected ? 'rgba(168, 85, 247, 0.35)' : 'rgba(0, 243, 255, 0.30)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = t.reflected ? '#e879f9' : '#00f3ff';
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, 0, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function drawEnemies(enemies) {
    const now = performance.now();
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.x + 60 < camera.x || e.x - 60 > camera.x + camera.width ||
          e.y + 60 < camera.y || e.y - 60 > camera.y + camera.height) {
        continue;
      }

      ctx.save();
      ctx.translate(e.x, e.y);
      const isStaggered = e.staggeredUntil > now;

      if (e.type === 'mine') {
        ctx.fillStyle = isStaggered ? 'rgba(56, 189, 248, 0.22)' : 'rgba(244, 63, 94, 0.22)';
        ctx.beginPath();
        ctx.arc(0, 0, e.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isStaggered ? '#38bdf8' : '#e11d48';
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isStaggered ? '#38bdf8' : '#fda4af';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.moveTo(Math.cos(a) * e.radius, Math.sin(a) * e.radius);
          ctx.lineTo(Math.cos(a) * (e.radius + 7), Math.sin(a) * (e.radius + 7));
        }
        ctx.stroke();

        ctx.direction = 'ltr';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(e.label, 0, 0);

      } else if (e.type === 'jelly') {
        const pulseScale = 1 + Math.sin(e.pulse || 0) * 0.14;
        ctx.scale(pulseScale, pulseScale);

        ctx.fillStyle = isStaggered ? 'rgba(0, 243, 255, 0.18)' : 'rgba(168, 85, 247, 0.18)';
        ctx.beginPath();
        ctx.arc(0, 0, e.radius + 7, Math.PI, 0, false);
        ctx.fill();

        ctx.fillStyle = isStaggered ? 'rgba(56, 189, 248, 0.72)' : 'rgba(168, 85, 247, 0.72)';
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = isStaggered ? '#38bdf8' : '#c084fc';
        ctx.lineWidth = 2;
        for (let tx = -e.radius + 4; tx <= e.radius - 4; tx += 7) {
          ctx.beginPath();
          ctx.moveTo(tx, 0);
          ctx.quadraticCurveTo(tx + Math.sin(e.pulse + tx) * 6, 12, tx, 22);
          ctx.stroke();
        }

      } else if (e.type === 'vortex') {
        ctx.rotate(e.pulse || 0);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
        ctx.lineWidth = 2;
        for (let r = 8; r < e.radius; r += 7) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 1.5);
          ctx.stroke();
        }
        ctx.direction = 'ltr';
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('∞', 0, 4);
      }

      if (isStaggered) {
        ctx.direction = 'rtl';
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('[▢ / E] تنفيذ قطعي', 0, -e.radius - 10);
      }

      ctx.restore();
    }
  }

  function drawBossBeams(beams) {
    for (let i = 0; i < beams.length; i++) {
      const bm = beams[i];
      ctx.save();
      if (bm.warningFrames > 0) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.65)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.moveTo(bm.x1, bm.y1);
        ctx.lineTo(bm.x2, bm.y2);
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(232, 121, 249, 0.35)';
        ctx.lineWidth = 22;
        ctx.beginPath();
        ctx.moveTo(bm.x1, bm.y1);
        ctx.lineTo(bm.x2, bm.y2);
        ctx.stroke();

        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(bm.x1, bm.y1);
        ctx.lineTo(bm.x2, bm.y2);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawBoss(boss) {
    ctx.save();
    ctx.translate(boss.x, boss.y);

    // Outer Halo
    ctx.fillStyle = boss.phase === 3 ? 'rgba(16, 185, 129, 0.14)' : (boss.phase === 2 ? 'rgba(168, 85, 247, 0.14)' : 'rgba(244, 63, 94, 0.16)');
    ctx.beginPath();
    ctx.arc(0, 0, boss.radius + 18, 0, Math.PI * 2);
    ctx.fill();

    // Leviathan Core Hull
    ctx.fillStyle = boss.hitFlash > 0 ? 'rgba(255, 255, 255, 0.32)' : 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = boss.phase === 3 ? '#10b981' : (boss.phase === 2 ? '#a855f7' : '#f43f5e');
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Central Core Pulse
    const corePulse = 18 + Math.sin(boss.pulse) * 5;
    ctx.fillStyle = boss.phase === 3 ? '#10b981' : (boss.phase === 2 ? '#c084fc' : '#f43f5e');
    ctx.beginPath();
    ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
    ctx.fill();

    // Phase 3 TVI Resonance Shield Visualization
    if (boss.shieldActive) {
      const shieldR = boss.shieldRadius || (boss.radius + 30);
      const gap = boss.tviGapAngle || 0;
      const w = boss.tviGapWidth || 0.42;

      // Positive Polarity Arc f(b) > 0 (Cyan/Emerald)
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, shieldR, gap + w, gap + Math.PI - w);
      ctx.stroke();

      // Negative Polarity Arc f(a) < 0 (Crimson/Rose)
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, shieldR, gap + Math.PI + w, gap + Math.PI * 2 - w);
      ctx.stroke();

      // Rotating TVI Root Windows α₁, α₂ (f(α) = 0)
      for (const rootAng of [gap, gap + Math.PI]) {
        const rx = Math.cos(rootAng) * shieldR;
        const ry = Math.sin(rootAng) * shieldR;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(rx, ry, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.direction = 'ltr';
        ctx.fillStyle = '#a7f3d0';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('α', rx * 1.18, ry * 1.18);
      }

      // Shield Integrity Sub-Bar
      const sW = 120;
      const sFrac = Math.max(0, (boss.shieldHp || 0) / (boss.shieldMaxHp || 180));
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(-sW / 2, boss.radius + 42, sW, 6);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-sW / 2, boss.radius + 42, sW * sFrac, 6);

      ctx.direction = 'rtl';
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('درع TVI: استعمل [△] سونار أو [L2] أو استهدف α', 0, boss.radius + 60);
    }

    // Core Discontinuity Label
    ctx.direction = 'ltr';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(boss.phase === 3 ? 'TVI: f(a)·f(b)<0' : (boss.phase === 2 ? 'lim⁻ ≠ lim⁺' : 'CORE: lim ≠ f'), 0, 0);

    // HP Bar Above Boss
    const barW = 175;
    const hpFrac = Math.max(0, boss.hp / boss.maxHp);
    const barY = boss.shieldActive ? -boss.shieldRadius - 26 : -boss.radius - 28;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(-barW / 2, barY, barW, 9);
    ctx.fillStyle = boss.phase === 3 ? '#10b981' : (boss.phase === 2 ? '#a855f7' : '#f43f5e');
    ctx.fillRect(-barW / 2, barY, barW * hpFrac, 9);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(-barW / 2, barY, barW, 9);

    ctx.direction = 'rtl';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#fda4af';
    const phaseTag = boss.phase === 3 ? 'الطور 3: درع TVI' : (boss.phase === 2 ? 'الطور 2: حزم الانقطاع' : 'الطور 1: أشواك 0/0');
    ctx.fillText(`لوفياثان الانقطاع العظيم — ${phaseTag}`, 0, barY - 11);

    ctx.restore();
  }

  function drawPlayerSub(player) {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    const now = performance.now();
    const isInvuln = player.invulnerableUntil > now;

    // Volumetric Headlights Cone (using cached radial gradient)
    ctx.fillStyle = cachedGradients.subConeGrad;
    ctx.beginPath();
    ctx.moveTo(18, -6);
    ctx.lineTo(240, -65);
    ctx.lineTo(240, 65);
    ctx.lineTo(18, 6);
    ctx.closePath();
    ctx.fill();

    if (isInvuln) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Subtle Hull Glow Halo (zero shadowBlur)
    ctx.fillStyle = 'rgba(0, 243, 255, 0.16)';
    ctx.beginPath();
    ctx.ellipse(0, 0, player.radius + 11, player.radius, 0, 0, Math.PI * 2);
    ctx.fill();

    // Submarine Hull (Nautilus-ε)
    ctx.fillStyle = '#0f294a';
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, player.radius + 6, player.radius - 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(8, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-6, -player.radius - 2, 8, 5);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-player.radius - 8, -4, 4, 8);

    ctx.restore();
  }

  function drawSonarWaves(waves) {
    ctx.lineWidth = 2.5;
    for (let i = 0; i < waves.length; i++) {
      const w = waves[i];
      ctx.strokeStyle = w.color;
      ctx.globalAlpha = w.alpha;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawParticles(particles) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.globalAlpha = Math.max(0, p.alpha);
      if (p.isBubble) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawMiniSonar(worldState) {
    const radarW = 120;
    const radarH = 120;
    const rx = camera.width - radarW - 20;
    const ry = camera.height - radarH - 65;

    ctx.save();
    ctx.fillStyle = 'rgba(2, 11, 26, 0.75)';
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(rx + radarW / 2, ry + radarH / 2, radarW / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const p = worldState.player;
    const nx = rx + (p.x / window.AbyssWorld.WORLD_WIDTH) * radarW;
    const ny = ry + (p.y / window.AbyssWorld.WORLD_HEIGHT) * radarH;
    ctx.fillStyle = '#00f3ff';
    ctx.beginPath();
    ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
    ctx.fill();

    worldState.gates.forEach(g => {
      const gx = rx + (g.x / window.AbyssWorld.WORLD_WIDTH) * radarW;
      const gy = ry + (g.y / window.AbyssWorld.WORLD_HEIGHT) * radarH;
      ctx.fillStyle = g.isUnlocked ? '#10b981' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    if (worldState.boss) {
      const bx = rx + (worldState.boss.x / window.AbyssWorld.WORLD_WIDTH) * radarW;
      const by = ry + (worldState.boss.y / window.AbyssWorld.WORLD_HEIGHT) * radarH;
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(bx, by, 4.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  return {
    initRenderer,
    renderWorld
  };
})();

/**
 * Interactive Mathematical Graph Renderer inside #seqGraphCanvas (width 390, height 185)
 * Visualizes 2BAC PC Limits, Discontinuities, Interval Images, TVI, and Inverse Reflections.
 */
window.drawLimitGraph = function(canvas, graphSpec) {
  if (!canvas || !graphSpec) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#030814';
  ctx.fillRect(0, 0, W, H);
  ctx.direction = 'ltr';

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x < W; x += 30) {
    ctx.moveTo(x, 0); ctx.lineTo(x, H);
  }
  for (let y = 0; y < H; y += 25) {
    ctx.moveTo(0, y); ctx.lineTo(W, y);
  }
  ctx.stroke();

  const ox = W * 0.45;
  const oy = H * 0.58;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(15, oy); ctx.lineTo(W - 15, oy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ox, 12); ctx.lineTo(ox, H - 12); ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillText('x', W - 14, oy - 5);
  ctx.fillText('y', ox + 6, 15);
  ctx.fillText('O', ox - 12, oy + 12);

  const type = graphSpec.type;

  if (type === 'spec_conjugate_hole') {
    const scaleX = 40, scaleY = 120;
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let px = -2.5; px <= 4.5; px += 0.1) {
      if (Math.abs(px - 1) < 0.05) continue;
      const py = (Math.sqrt(px + 3) - 2) / (px - 1);
      const cx = ox + px * scaleX;
      const cy = oy - py * scaleY;
      if (px === -2.5) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    const hx = ox + 1 * scaleX;
    const hy = oy - 0.25 * scaleY;
    ctx.fillStyle = '#030814';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(hx, hy, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#fde68a';
    ctx.fillText('نقطة انفصال (1, 1/4)', hx + 8, hy - 6);

  } else if (type === 'spec_trig_limit') {
    const scaleX = 22, scaleY = 32;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let px = -5.5; px <= 5.5; px += 0.08) {
      const py = px === 0 ? 3 : Math.sin(3 * px) / px;
      const cx = ox + px * scaleX;
      const cy = oy - py * scaleY;
      if (px === -5.5) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    const peakY = oy - 3 * scaleY;
    ctx.fillStyle = '#030814';
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(ox, peakY, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.fillText('lim = 3', ox + 10, peakY);

  } else if (type === 'spec_step_discontinuity') {
    const scaleX = 35, scaleY = 22;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let px = -1.8; px < 1; px += 0.08) {
      const py = px * px;
      const cx = ox + px * scaleX;
      const cy = oy - py * scaleY;
      if (px === -1.8) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    ctx.fillStyle = '#030814';
    ctx.strokeStyle = '#a855f7';
    ctx.beginPath(); ctx.arc(ox + 1 * scaleX, oy - 1 * scaleY, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.strokeStyle = '#f43f5e';
    ctx.beginPath();
    for (let px = 1; px <= 3.2; px += 0.1) {
      const py = 2 * px + 1;
      const cx = ox + px * scaleX;
      const cy = oy - py * scaleY;
      if (px === 1) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    ctx.fillStyle = '#f43f5e';
    ctx.beginPath(); ctx.arc(ox + 1 * scaleX, oy - 3 * scaleY, 4.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#fda4af';
    ctx.fillText('قفزة انقطاع: lim⁻ ≠ lim⁺', ox + 1 * scaleX + 8, oy - 2 * scaleY);

  } else if (type === 'spec_piecewise_continuity') {
    const scaleX = 35, scaleY = 28;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let px = -1.5; px <= 3.5; px += 0.1) {
      const py = px + 1;
      const cx = ox + px * scaleX;
      const cy = oy - py * scaleY;
      if (px === -1.5) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(ox + 1 * scaleX, oy - 2 * scaleY, 5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('اتصال في x₀=1 (m=2)', ox + 1 * scaleX + 8, oy - 2 * scaleY - 4);

  } else if (type === 'spec_interval_image') {
    const scaleX = 28, scaleY = 16;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let px = 0.5; px <= 4.5; px += 0.1) {
      const py = 1.66 * px + 0.33;
      const cx = ox + px * scaleX;
      const cy = oy - py * scaleY;
      if (px === 0.5) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fillRect(ox + 1 * scaleX, oy - 7 * scaleY, 3 * scaleX, 7 * scaleY);

    ctx.fillStyle = '#fde68a';
    ctx.fillText('f([1, 4]) = [2, 7]', ox + 1.2 * scaleX, oy - 4 * scaleY);

  } else if (type === 'spec_tvi_roots') {
    const scaleX = 55, scaleY = 18;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let px = 0.5; px <= 2.5; px += 0.08) {
      const py = Math.pow(px, 3) + px - 5;
      const cx = ox + px * scaleX;
      const cy = oy - py * scaleY;
      if (px === 0.5) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    const alphaX = 1.51;
    const ax = ox + alphaX * scaleX;
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(ax, oy, 5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#34d399';
    ctx.fillText('حل وحيد α (TVI)', ax - 25, oy - 14);

  } else if (type === 'spec_inverse_reflection') {
    const scale = 32;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(ox - 3 * scale, oy + 3 * scale); ctx.lineTo(ox + 4 * scale, oy - 4 * scale); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#94a3b8'; ctx.fillText('y = x', ox + 3.2 * scale, oy - 3.4 * scale);

    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let px = 0; px <= 2; px += 0.05) {
      const py = px * px;
      const cx = ox + px * scale;
      const cy = oy - py * scale;
      if (px === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.fillStyle = '#00f3ff'; ctx.fillText('Cf', ox + 2 * scale + 4, oy - 4 * scale);

    ctx.strokeStyle = '#f43f5e';
    ctx.beginPath();
    for (let px = 0; px <= 4; px += 0.08) {
      const py = Math.sqrt(px);
      const cx = ox + px * scale;
      const cy = oy - py * scale;
      if (px === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.fillStyle = '#f43f5e'; ctx.fillText('Cf⁻¹', ox + 4 * scale + 4, oy - 2 * scale);

  } else if (type === 'spec_nth_root') {
    const scale = 40;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + 3 * scale, oy - 3 * scale); ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let px = 0; px <= 3; px += 0.05) {
      const py = Math.cbrt(px);
      const cx = ox + px * scale;
      const cy = oy - py * scale;
      if (px === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(ox + 1 * scale, oy - 1 * scale, 4.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('∛x > x على ]0, 1[', ox + 0.2 * scale, oy - 1.4 * scale);
  }
};

window.drawSequenceGraph = window.drawLimitGraph;
