/**
 * Limit Abyss — هاوية النهايات والاتصال 2BAC PC
 * Full-Screen 60FPS Abyssal Renderer, Real-Time Volumetric Caustics & Math Graphing Engine
 */

window.AbyssRenderer = (function() {
  let canvas = null;
  let ctx = null;
  let dpr = 1;

  const camera = {
    x: 1280,
    y: 120,
    width: window.innerWidth,
    height: window.innerHeight
  };

  function initRenderer() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);
    camera.width = window.innerWidth;
    camera.height = window.innerHeight;
  }

  function updateCamera(player) {
    // Smooth camera lag tracking
    const targetX = player.x - camera.width / 2;
    const targetY = player.y - camera.height / 2;

    const maxCamX = window.AbyssWorld.WORLD_WIDTH - camera.width;
    const maxCamY = window.AbyssWorld.WORLD_HEIGHT - camera.height;

    const clampedTargetX = Math.max(0, Math.min(maxCamX > 0 ? maxCamX : 0, targetX));
    const clampedTargetY = Math.max(0, Math.min(maxCamY > 0 ? maxCamY : 0, targetY));

    camera.x += (clampedTargetX - camera.x) * 0.1;
    camera.y += (clampedTargetY - camera.y) * 0.1;
  }

  function renderWorld() {
    if (!canvas || !ctx) return;
    const worldState = window.AbyssWorld?.getState?.();
    if (!worldState) return;

    updateCamera(worldState.player);

    ctx.save();
    ctx.clearRect(0, 0, camera.width, camera.height);

    // Apply camera translation
    ctx.translate(-camera.x, -camera.y);

    // 1. Draw Depth Backdrops & Stratification Layers
    drawAbyssalBackdrop();

    // 2. Draw Thermal Bubble Vents
    drawThermalVents(worldState.bubbleVents);

    // 3. Draw Abyssal Pressure Gates / Seals
    drawGates(worldState.gates, worldState.player);

    // 4. Draw Torpedoes
    drawTorpedoes(worldState.torpedoes);

    // 5. Draw Enemies & Boss
    drawEnemies(worldState.enemies);
    if (worldState.boss) drawBoss(worldState.boss);

    // 6. Draw Player Submersible (Nautilus-ε)
    drawPlayerSub(worldState.player);

    // 7. Draw Sonar Waves & Particles
    drawSonarWaves(worldState.sonarWaves);
    drawParticles(worldState.particles);

    // Restore Camera
    ctx.restore();

    // 8. Screen-space HUD & Mini-Sonar Radar
    drawMiniSonar(worldState);
  }

  function drawAbyssalBackdrop() {
    const W = window.AbyssWorld.WORLD_WIDTH;
    const H = window.AbyssWorld.WORLD_HEIGHT;

    // Sector 1 (0..380): Mesopelagic
    const grad1 = ctx.createLinearGradient(0, 0, 0, 380);
    grad1.addColorStop(0, '#03193a');
    grad1.addColorStop(1, '#020f26');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, W, 380);

    // Sector 2 (380..780): Bathypelagic
    const grad2 = ctx.createLinearGradient(0, 380, 0, 780);
    grad2.addColorStop(0, '#020f26');
    grad2.addColorStop(1, '#010817');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 380, W, 400);

    // Sector 3 (780..1180): Abyssopelagic
    const grad3 = ctx.createLinearGradient(0, 780, 0, 1180);
    grad3.addColorStop(0, '#010817');
    grad3.addColorStop(1, '#01040f');
    ctx.fillStyle = grad3;
    ctx.fillRect(0, 780, W, 400);

    // Sector 4 & Bed (1180..1600): Hadal Trench
    const grad4 = ctx.createLinearGradient(0, 1180, 0, 1600);
    grad4.addColorStop(0, '#01040f');
    grad4.addColorStop(1, '#000206');
    ctx.fillStyle = grad4;
    ctx.fillRect(0, 1180, W, 420);

    // Trench Sidewalls & Tectonic Grid
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 160) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 120) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();

      // Depth Labels along left & right trench walls
      ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(`${y * 4}m [y=${y}]`, 45, y - 4);
      ctx.fillText(`${y * 4}m`, W - 90, y - 4);
    }
  }

  function drawThermalVents(vents) {
    vents.forEach(v => {
      ctx.save();
      const grad = ctx.createRadialGradient(v.x, v.y, 5, v.x, v.y, v.radius);
      grad.addColorStop(0, 'rgba(0, 243, 255, 0.25)');
      grad.addColorStop(0.7, 'rgba(20, 184, 166, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(v.x, v.y, v.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(0, 243, 255, 0.35)';
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawGates(gates, player) {
    gates.forEach(g => {
      g.pulsePhase = (g.pulsePhase || 0) + 0.035;
      const r = g.radius + Math.sin(g.pulsePhase) * 4;

      ctx.save();
      ctx.translate(g.x, g.y);

      // Gate outer ring glow
      ctx.strokeStyle = g.isUnlocked ? '#10b981' : (g.sectorId === 1 ? '#00f3ff' : (g.sectorId === 2 ? '#38bdf8' : (g.sectorId === 3 ? '#10b981' : '#f59e0b')));
      ctx.lineWidth = g.isUnlocked ? 2.5 : 3.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      // Inner rotating glyphs
      ctx.rotate(g.pulsePhase * 0.5);
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.rotate(-g.pulsePhase * 0.5);
      // Center icon / status
      ctx.fillStyle = g.isUnlocked ? '#10b981' : '#ffffff';
      ctx.font = 'bold 15px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(g.isUnlocked ? '✓ مخترق' : (g.sectorId === 1 ? 'lim 0/0' : (g.sectorId === 2 ? 'x → x₀' : (g.sectorId === 3 ? 'TVI' : 'f⁻¹'))), 0, 0);

      // Depth badge
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(g.depthText, 0, r + 18);

      // Interaction prompt if near player
      const dist = Math.hypot(g.x - player.x, g.y - player.y);
      if (!g.isUnlocked && dist <= 100) {
        ctx.fillStyle = '#fde68a';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('[▢ / E] اختراق ختم الضغط', 0, -r - 12);
      }

      ctx.restore();
    });
  }

  function drawTorpedoes(torpedoes) {
    torpedoes.forEach(t => {
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.angle);

      ctx.fillStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4, 0, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  function drawEnemies(enemies) {
    const now = performance.now();
    enemies.forEach(e => {
      ctx.save();
      ctx.translate(e.x, e.y);

      const isStaggered = e.staggeredUntil > now;

      if (e.type === 'mine') {
        // Indeterminate Mine
        ctx.fillStyle = isStaggered ? '#38bdf8' : '#e11d48';
        ctx.shadowColor = isStaggered ? '#38bdf8' : '#f43f5e';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();

        // Mine spikes
        ctx.strokeStyle = isStaggered ? '#38bdf8' : '#fda4af';
        ctx.lineWidth = 2;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * e.radius, Math.sin(a) * e.radius);
          ctx.lineTo(Math.cos(a) * (e.radius + 7), Math.sin(a) * (e.radius + 7));
          ctx.stroke();
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(e.label, 0, 0);

      } else if (e.type === 'jelly') {
        // Discontinuity Jelly
        const pulseScale = 1 + Math.sin(e.pulse || 0) * 0.15;
        ctx.scale(pulseScale, pulseScale);

        ctx.fillStyle = isStaggered ? 'rgba(56, 189, 248, 0.65)' : 'rgba(168, 85, 247, 0.65)';
        ctx.shadowColor = isStaggered ? '#00f3ff' : '#a855f7';
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.arc(0, 0, e.radius, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();

        // Tentacles
        ctx.strokeStyle = isStaggered ? '#38bdf8' : '#c084fc';
        ctx.lineWidth = 2;
        for (let tx = -e.radius + 4; tx <= e.radius - 4; tx += 7) {
          ctx.beginPath();
          ctx.moveTo(tx, 0);
          ctx.quadraticCurveTo(tx + Math.sin(e.pulse + tx) * 6, 12, tx, 22);
          ctx.stroke();
        }

      } else if (e.type === 'vortex') {
        // Infinite Divergence Vortex
        ctx.rotate(e.pulse || 0);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 2;
        for (let r = 8; r < e.radius; r += 7) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 1.5);
          ctx.stroke();
        }
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('∞', 0, 4);
      }

      if (isStaggered) {
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('[▢ / E] تنفيذ قطعي', 0, -e.radius - 8);
      }

      ctx.restore();
    });
  }

  function drawBoss(boss) {
    ctx.save();
    ctx.translate(boss.x, boss.y);

    // Leviathan Outer Body & Tendrils
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 24;

    ctx.beginPath();
    ctx.arc(0, 0, boss.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Central Core Pulse
    const corePulse = 18 + Math.sin(boss.pulse) * 5;
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
    ctx.fill();

    // Core Discontinuity Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CORE: lim ≠ f', 0, 0);

    // HP Bar Above Boss
    const barW = 160;
    const hpFrac = boss.hp / boss.maxHp;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(-barW / 2, -boss.radius - 28, barW, 9);
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(-barW / 2, -boss.radius - 28, barW * hpFrac, 9);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(-barW / 2, -boss.radius - 28, barW, 9);

    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#fda4af';
    ctx.fillText('لوفياثان الانقطاع العظيم', 0, -boss.radius - 35);

    ctx.restore();
  }

  function drawPlayerSub(player) {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    const now = performance.now();
    const isInvuln = player.invulnerableUntil > now;

    // Headlights Cones casting into deep water
    ctx.save();
    const lightGrad = ctx.createRadialGradient(25, 0, 10, 140, 0, 120);
    lightGrad.addColorStop(0, 'rgba(0, 243, 255, 0.45)');
    lightGrad.addColorStop(0.6, 'rgba(0, 243, 255, 0.12)');
    lightGrad.addColorStop(1, 'rgba(0, 243, 255, 0)');
    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.moveTo(18, -6);
    ctx.lineTo(240, -65);
    ctx.lineTo(240, 65);
    ctx.lineTo(18, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Shield bubble when invulnerable
    if (isInvuln) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, player.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Submarine Hull (Nautilus-ε)
    ctx.fillStyle = '#0f294a';
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 12;

    // Streamlined hull ellipse
    ctx.beginPath();
    ctx.ellipse(0, 0, player.radius + 6, player.radius - 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Observation Cockpit Glass Dome
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(8, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    // Conning Tower
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-6, -player.radius - 2, 8, 5);

    // Propeller / Thruster at stern
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-player.radius - 8, -4, 4, 8);

    ctx.restore();
  }

  function drawSonarWaves(waves) {
    waves.forEach(w => {
      ctx.save();
      ctx.strokeStyle = w.color;
      ctx.globalAlpha = w.alpha;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  function drawParticles(particles) {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.isBubble) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
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

    // Player blip
    const p = worldState.player;
    const nx = rx + (p.x / window.AbyssWorld.WORLD_WIDTH) * radarW;
    const ny = ry + (p.y / window.AbyssWorld.WORLD_HEIGHT) * radarH;
    ctx.fillStyle = '#00f3ff';
    ctx.beginPath();
    ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Gates blips
    worldState.gates.forEach(g => {
      const gx = rx + (g.x / window.AbyssWorld.WORLD_WIDTH) * radarW;
      const gy = ry + (g.y / window.AbyssWorld.WORLD_HEIGHT) * radarH;
      ctx.fillStyle = g.isUnlocked ? '#10b981' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

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

  // Grid and Axes
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 25) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  const ox = W * 0.45;
  const oy = H * 0.58;

  // Main Axes
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(15, oy); ctx.lineTo(W - 15, oy); ctx.stroke(); // X
  ctx.beginPath(); ctx.moveTo(ox, 12); ctx.lineTo(ox, H - 12); ctx.stroke(); // Y

  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillText('x', W - 14, oy - 5);
  ctx.fillText('y', ox + 6, 15);
  ctx.fillText('O', ox - 12, oy + 12);

  const type = graphSpec.type;

  if (type === 'spec_conjugate_hole') {
    // Hole at x=1, y=0.25 on f(x) = (√(x+3)-2)/(x-1)
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

    // Hollow point at (1, 0.25)
    const hx = ox + 1 * scaleX;
    const hy = oy - 0.25 * scaleY;
    ctx.fillStyle = '#030814';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(hx, hy, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#fde68a';
    ctx.fillText('نقطة انفصال (1, 1/4)', hx + 8, hy - 6);

  } else if (type === 'spec_trig_limit') {
    // sin(3x)/x peaking at 3
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

    // Hollow point at (0, 3)
    const peakY = oy - 3 * scaleY;
    ctx.fillStyle = '#030814';
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(ox, peakY, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.fillText('lim = 3', ox + 10, peakY);

  } else if (type === 'spec_step_discontinuity') {
    // One sided jump: 2x+1 (x>=1) and x^2 (x<1)
    const scaleX = 35, scaleY = 22;
    // Left piece: x^2 (x < 1)
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

    // Hollow point at (1, 1)
    ctx.fillStyle = '#030814';
    ctx.strokeStyle = '#a855f7';
    ctx.beginPath(); ctx.arc(ox + 1 * scaleX, oy - 1 * scaleY, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // Right piece: 2x+1 (x >= 1)
    ctx.strokeStyle = '#f43f5e';
    ctx.beginPath();
    for (let px = 1; px <= 3.2; px += 0.1) {
      const py = 2 * px + 1;
      const cx = ox + px * scaleX;
      const cy = oy - py * scaleY;
      if (px === 1) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // Filled point at (1, 3)
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath(); ctx.arc(ox + 1 * scaleX, oy - 3 * scaleY, 4.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#fda4af';
    ctx.fillText('قفزة انقطاع: lim⁻ ≠ lim⁺', ox + 1 * scaleX + 8, oy - 2 * scaleY);

  } else if (type === 'spec_piecewise_continuity') {
    // Continuous piecewise join at (1, 2)
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

    // Joint point at (1, 2)
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(ox + 1 * scaleX, oy - 2 * scaleY, 5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('اتصال في x₀=1 (m=2)', ox + 1 * scaleX + 8, oy - 2 * scaleY - 4);

  } else if (type === 'spec_interval_image') {
    // Interval [1, 4] mapped to [2, 7]
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

    // Shaded bands
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.fillRect(ox + 1 * scaleX, oy - 7 * scaleY, 3 * scaleX, 7 * scaleY);

    ctx.fillStyle = '#fde68a';
    ctx.fillText('f([1, 4]) = [2, 7]', ox + 1.2 * scaleX, oy - 4 * scaleY);

  } else if (type === 'spec_tvi_roots') {
    // Curve crossing axis between 1 and 2
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

    // Root alpha
    const alphaX = 1.51;
    const ax = ox + alphaX * scaleX;
    ctx.fillStyle = '#10b981';
    ctx.beginPath(); ctx.arc(ax, oy, 5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#34d399';
    ctx.fillText('حل وحيد α (TVI)', ax - 25, oy - 14);

  } else if (type === 'spec_inverse_reflection') {
    // Cf and Cf^-1 reflection across y=x
    const scale = 32;
    // Line y = x
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(ox - 3 * scale, oy + 3 * scale); ctx.lineTo(ox + 4 * scale, oy - 4 * scale); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#94a3b8'; ctx.fillText('y = x', ox + 3.2 * scale, oy - 3.4 * scale);

    // Cf: y = x^2 (x >= 0)
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

    // Cf^-1: y = sqrt(x) (x >= 0)
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
    // y = x and y = cbrt(x)
    const scale = 40;
    // y = x
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + 3 * scale, oy - 3 * scale); ctx.stroke();
    ctx.setLineDash([]);

    // y = cbrt(x)
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

    // Intersection at (1, 1)
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.arc(ox + 1 * scale, oy - 1 * scale, 4.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('∛x > x على ]0, 1[', ox + 0.2 * scale, oy - 1.4 * scale);
  }
};

// Hub and generic compatibility alias
window.drawSequenceGraph = window.drawLimitGraph;
