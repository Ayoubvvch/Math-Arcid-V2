/**
 * Asymptote Asylum - Fast 60 FPS Horror World Renderer & Calculus Graph Plotter
 * Zero ctx.shadowBlur, zero offscreen blur overhead, cached radial gradients, explicit ctx.direction safety.
 */

const ASYLUM_GRAD_CACHE = {
  coneGrad: null,
  darkGrad: null,
  darkKey: '',
  ctxRef: null
};

window.renderAsylumFrame = function(ctx, viewW, viewH, state) {
  if (ASYLUM_GRAD_CACHE.ctxRef !== ctx) {
    ASYLUM_GRAD_CACHE.ctxRef = ctx;
    ASYLUM_GRAD_CACHE.coneGrad = null;
    ASYLUM_GRAD_CACHE.darkGrad = null;
    ASYLUM_GRAD_CACHE.darkKey = '';
  }
  const p = state.player;
  const time = state.time;

  const shakeX = state.screenShake > 0.2 ? (Math.random() - 0.5) * state.screenShake : 0;
  const shakeY = state.screenShake > 0.2 ? (Math.random() - 0.5) * state.screenShake : 0;
  const camX = p.x - viewW / 2 + shakeX;
  const camY = p.y - viewH / 2 + shakeY;

  // Base Abyss Fill
  ctx.fillStyle = '#070508';
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.save();
  ctx.translate(-camX, -camY);

  // Visible world rectangle culling bounds
  const minX = Math.max(0, Math.floor(camX / 128) * 128);
  const maxX = Math.min(window.WORLD_CONFIG.WIDTH, camX + viewW + 128);
  const minY = Math.max(0, Math.floor(camY / 128) * 128);
  const maxY = Math.min(window.WORLD_CONFIG.HEIGHT, camY + viewH + 128);

  // Morgue tile floor inside world bounds
  ctx.fillStyle = '#0f0a0f';
  ctx.fillRect(0, 0, window.WORLD_CONFIG.WIDTH, window.WORLD_CONFIG.HEIGHT);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = minX; gx <= maxX; gx += 128) {
    ctx.moveTo(gx, minY);
    ctx.lineTo(gx, maxY);
  }
  for (let gy = minY; gy <= maxY; gy += 128) {
    ctx.moveTo(minX, gy);
    ctx.lineTo(maxX, gy);
  }
  ctx.stroke();

  // Outer asylum blood-stained perimeter wall
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 14;
  ctx.strokeRect(14, 14, window.WORLD_CONFIG.WIDTH - 28, window.WORLD_CONFIG.HEIGHT - 28);

  // Gore & Bone Decals (culled to viewport)
  for (const d of state.decals) {
    if (d.x + d.r < camX - 40 || d.x - d.r > camX + viewW + 40 || d.y + d.r < camY - 40 || d.y - d.r > camY + viewH + 40) continue;
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.rot);
    if (d.kind === 'bones') {
      ctx.globalAlpha = d.alpha;
      ctx.strokeStyle = '#d6d3d1';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-d.r * 0.45, -4);
      ctx.lineTo(d.r * 0.45, 5);
      ctx.moveTo(-d.r * 0.25, 6);
      ctx.lineTo(d.r * 0.3, -6);
      ctx.stroke();
      ctx.fillStyle = '#e7e5e4';
      ctx.beginPath();
      ctx.arc(0, -d.r * 0.25, 4.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = '#6b0f14';
      ctx.beginPath();
      ctx.ellipse(0, 0, d.r, d.r * 0.72, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(d.r * 0.45, -d.r * 0.2, d.r * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Blood Seal Altars (The 4 Calculus Wards)
  const sealNumerals = ['I', 'II', 'III', 'IV'];
  for (const s of state.seals) {
    const pulseR = s.radius + Math.sin(s.pulse) * 5;
    const dist = Math.hypot(s.x - p.x, s.y - p.y);

    ctx.save();
    ctx.translate(s.x, s.y);
    if (s.broken) {
      ctx.strokeStyle = 'rgba(107, 114, 128, 0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([7, 7]);
      ctx.beginPath();
      ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.direction = 'ltr';
      ctx.fillStyle = 'rgba(156, 163, 175, 0.5)';
      ctx.font = '800 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SEAL BROKEN', 0, 4);
    } else {
      // Glowing outer altar circle
      ctx.fillStyle = 'rgba(127, 29, 29, 0.18)';
      ctx.beginPath();
      ctx.arc(0, 0, pulseR + 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(0, 0, s.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating inner pentagram/triangle runes
      ctx.save();
      ctx.rotate(time * 0.55);
      ctx.strokeStyle = 'rgba(254, 202, 202, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      for (let i = 0; i <= 3; i++) {
        const a = (i * Math.PI * 2) / 3;
        const rx = Math.cos(a) * (s.radius - 7);
        const ry = Math.sin(a) * (s.radius - 7);
        if (i === 0) ctx.moveTo(rx, ry);
        else ctx.lineTo(rx, ry);
      }
      ctx.stroke();
      ctx.restore();

      ctx.direction = 'ltr';
      ctx.fillStyle = '#fef2f2';
      ctx.font = '900 18px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sealNumerals[s.id] || '∑', 0, 0);

      if (dist <= 125) {
        ctx.direction = 'rtl';
        ctx.fillStyle = '#fbbf24';
        ctx.font = '800 12px Tahoma, sans-serif';
        ctx.fillText('[▢ / L] افتح طقس الختم', 0, -s.radius - 14);
      }
    }
    ctx.restore();
  }

  // Shackled Captives ("الغاية تبرر الوسيلة" Targets)
  for (const c of state.captives) {
    if (!c.alive) continue;
    const dist = Math.hypot(c.x - p.x, c.y - p.y);
    const shiver = Math.sin(time * 16 + c.shiverPhase) * 1.4;

    ctx.save();
    ctx.translate(c.x + shiver, c.y);
    // Iron cage square
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-18, -18, 36, 36);
    ctx.beginPath();
    ctx.moveTo(-6, -18); ctx.lineTo(-6, 18);
    ctx.moveTo(6, -18); ctx.lineTo(6, 18);
    ctx.stroke();

    // Victim head & pale shivering silhouette
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    if (dist <= 145) {
      ctx.direction = 'rtl';
      ctx.fillStyle = '#f87171';
      ctx.font = '800 11.5px Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('[L2 / F] تضحية +35 دم', 0, -27);
    }
    ctx.restore();
  }

  // Pickups
  for (const pk of state.pickups) {
    ctx.save();
    ctx.translate(pk.x, pk.y);
    const bob = Math.sin(time * 5 + pk.id) * 2.5;
    ctx.translate(0, bob);
    if (pk.kind === 'blood') {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fecaca';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.direction = 'ltr';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', 0, 0);
    } else {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-8, -10, 16, 20);
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-8, -10, 16, 20);
      ctx.direction = 'ltr';
      ctx.fillStyle = '#064e3b';
      ctx.font = '900 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('UV', 0, 1);
    }
    ctx.restore();
  }

  // Dungeon Pillars / Operating Walls
  for (const pil of state.pillars) {
    if (pil.x + pil.w < camX - 20 || pil.x > camX + viewW + 20 || pil.y + pil.h < camY - 20 || pil.y > camY + viewH + 20) continue;
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(pil.x, pil.y, pil.w, pil.h);
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 3;
    ctx.strokeRect(pil.x, pil.y, pil.w, pil.h);
    // dried blood stain accent
    ctx.fillStyle = 'rgba(153, 27, 27, 0.35)';
    ctx.fillRect(pil.x + 6, pil.y + 8, pil.w - 12, 10);
  }

  // Enemies
  for (const e of state.enemies) {
    if (e.x + 80 < camX || e.x - 80 > camX + viewW || e.y + 80 < camY || e.y - 80 > camY + viewH) continue;
    const ang = Math.atan2(p.y - e.y, p.x - e.x);

    ctx.save();
    ctx.translate(e.x, e.y);

    // Boss cosmic blood aura
    if (e.kind === 'boss') {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, e.radius + 14 + Math.sin(time * 8) * 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Spindly claws / limbs
    ctx.save();
    ctx.rotate(ang);
    ctx.strokeStyle = e.hitFlash > 0 ? '#ffffff' : e.kind === 'wisp' ? '#c084fc' : '#991b1b';
    ctx.lineWidth = e.kind === 'boss' ? 5 : 3;
    const clawSwing = Math.sin(e.twitchPhase) * 0.25;
    ctx.beginPath();
    ctx.moveTo(0, -e.radius * 0.7);
    ctx.lineTo(e.radius * 1.45, -e.radius * (0.65 + clawSwing));
    ctx.moveTo(0, e.radius * 0.7);
    ctx.lineTo(e.radius * 1.45, e.radius * (0.65 - clawSwing));
    ctx.stroke();

    // Body
    ctx.fillStyle = e.hitFlash > 0 ? '#ffffff'
      : e.kind === 'boss' ? '#450a0a'
      : e.kind === 'butcher' ? '#7f1d1d'
      : e.kind === 'wisp' ? '#3b0764'
      : '#270a12';
    ctx.beginPath();
    ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = e.staggered ? '#fbbf24' : '#ef4444';
    ctx.lineWidth = e.staggered ? 3 : 2;
    ctx.stroke();

    // Glowing Horror Eyes
    ctx.fillStyle = e.staggered ? '#fbbf24' : '#ff2a2a';
    ctx.beginPath();
    ctx.arc(e.radius * 0.42, -e.radius * 0.28, e.kind === 'boss' ? 5 : 3.2, 0, Math.PI * 2);
    ctx.arc(e.radius * 0.42, e.radius * 0.28, e.kind === 'boss' ? 5 : 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // HP bar
    const bw = e.radius * 2;
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-bw / 2, -e.radius - 13, bw, 5);
    ctx.fillStyle = e.staggered ? '#fbbf24' : '#ef4444';
    ctx.fillRect(-bw / 2, -e.radius - 13, bw * Math.max(0, e.hp / e.maxHp), 5);

    if (e.staggered) {
      ctx.direction = 'rtl';
      ctx.fillStyle = '#fde047';
      ctx.font = '900 11.5px Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('مشلول! [✕/▢] إعدام', 0, -e.radius - 20);
    }
    ctx.restore();
  }

  // Projectiles
  for (const b of state.projectiles) {
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  for (const ep of state.enemyProjectiles) {
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Bone Saw Slash Arc Animation
  if (p.slashAnim > 0) {
    const progress = 1 - p.slashAnim / 0.22;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.aimAngle);
    ctx.strokeStyle = p.frenzyTimer > 0 ? '#ef4444' : '#e5e7eb';
    ctx.lineWidth = 7 * (1 - progress * 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, 88, -1.1, 1.1);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 74, -0.95, 0.95);
    ctx.stroke();
    ctx.restore();
  }

  // Player Survivor
  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.frenzyTimer > 0) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.72)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 9 + Math.sin(time * 20) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.rotate(p.aimAngle);
  // Bone saw blade held forward
  ctx.fillStyle = '#d1d5db';
  ctx.fillRect(p.radius - 2, 5, 22, 5);
  // Flashlight cylinder
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(p.radius - 3, -9, 13, 4);
  // Coat / Body
  ctx.fillStyle = p.invulnTimer > 0 && Math.floor(time * 24) % 2 === 0 ? '#fca5a5' : '#1e293b';
  ctx.beginPath();
  ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // Gore Particles (viewport-culled)
  for (const pt of state.particles) {
    if (pt.x + 16 < camX || pt.x - 16 > camX + viewW || pt.y + 16 < camY || pt.y - 16 > camY + viewH) continue;
    ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
  }
  ctx.globalAlpha = 1;

  // Floating Texts (viewport-culled)
  for (const ft of state.floatingTexts) {
    if (ft.x + 140 < camX || ft.x - 140 > camX + viewW || ft.y + 40 < camY || ft.y - 40 > camY + viewH) continue;
    ctx.save();
    ctx.globalAlpha = Math.min(1, ft.life / 0.35);
    ctx.direction = 'rtl';
    ctx.fillStyle = ft.color;
    ctx.font = '900 13px Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore(); // Exit World Camera Transform

  // =========================================================================
  // FAST 1-PASS HORROR FLASHLIGHT CONE & DARKNESS (Cached Gradients, Zero GPU lag!)
  // =========================================================================
  const cx = viewW / 2;
  const cy = viewH / 2;

  if (p.flareTimer > 0) {
    // UV Flare illumination bursts toxic emerald visibility across screen
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.fillRect(0, 0, viewW, viewH);
  } else {
    // Cached directional darkness gradient (rebuilt only on resize or sanity bucket change)
    const reach = Math.max(220, Math.round(((viewW * 0.46) * (0.55 + 0.45 * (p.sanity / p.maxSanity))) / 8) * 8);
    const dKey = `${viewW}x${viewH}:${reach}`;
    if (ASYLUM_GRAD_CACHE.darkKey !== dKey) {
      ASYLUM_GRAD_CACHE.darkKey = dKey;
      const g = ctx.createRadialGradient(cx, cy, 70, cx, cy, reach);
      g.addColorStop(0, 'rgba(4, 2, 5, 0.0)');
      g.addColorStop(0.55, 'rgba(4, 2, 5, 0.42)');
      g.addColorStop(1, 'rgba(2, 1, 4, 0.82)');
      ASYLUM_GRAD_CACHE.darkGrad = g;
    }
    ctx.fillStyle = ASYLUM_GRAD_CACHE.darkGrad;
    ctx.fillRect(0, 0, viewW, viewH);
  }

  // Cached Visible Flashlight Cone Ray
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(p.aimAngle);
  if (!ASYLUM_GRAD_CACHE.coneGrad) {
    const cg = ctx.createRadialGradient(0, 0, 12, 0, 0, 340);
    cg.addColorStop(0, 'rgba(254, 243, 199, 0.22)');
    cg.addColorStop(1, 'rgba(254, 243, 199, 0.0)');
    ASYLUM_GRAD_CACHE.coneGrad = cg;
  }
  ctx.fillStyle = ASYLUM_GRAD_CACHE.coneGrad;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 340, -0.42, 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Damage & Low-HP Crimson Vignette
  const lowHpAlpha = p.hp < 40 ? ((40 - p.hp) / 40) * (0.28 + Math.sin(time * 9) * 0.1) : 0;
  const flashAlpha = Math.max(lowHpAlpha, state.damageFlash * 0.42, state.jumpscareTimer > 0 ? 0.35 : 0);
  if (flashAlpha > 0.01) {
    ctx.strokeStyle = `rgba(220, 38, 38, ${Math.min(0.85, flashAlpha)})`;
    ctx.lineWidth = 28;
    ctx.strokeRect(0, 0, viewW, viewH);
  }

  // Compact Seal & Boss Radar Compass around player
  const compassTargets = [];
  for (const s of state.seals) {
    if (!s.broken) compassTargets.push({ x: s.x, y: s.y, color: s.color, label: sealNumerals[s.id] });
  }
  const boss = state.enemies.find(e => e.kind === 'boss');
  if (boss) compassTargets.push({ x: boss.x, y: boss.y, color: '#ef4444', label: 'BOSS' });

  for (const tgt of compassTargets) {
    const dx = tgt.x - p.x;
    const dy = tgt.y - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 170) continue;
    const ang = Math.atan2(dy, dx);
    const r = Math.min(viewW, viewH) * 0.22;
    const px = cx + Math.cos(ang) * r;
    const py = cy + Math.sin(ang) * r;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(ang);
    ctx.fillStyle = tgt.color;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-6, -6);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.rotate(-ang);
    ctx.direction = 'ltr';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(tgt.label, 0, -10);
    ctx.restore();
  }
};

/**
 * Renders Crisp Mathematical Curves for Visual Questions (Topics 24, 25, 30, 32, 34, 35, 36, 38)
 */
window.drawRitualGraph = function(canvas, graphSpec) {
  if (!canvas || !graphSpec) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#070b14';
  ctx.fillRect(0, 0, W, H);
  ctx.direction = 'ltr';

  // Grid & Axes mapping helper
  let xmin = -4, xmax = 4, ymin = -3, ymax = 4;
  if (graphSpec.type === 'intersect_fg') { xmin = -3; xmax = 4; ymin = -2; ymax = 5; }
  else if (graphSpec.type === 'cubic_ox_sign') { xmin = -3.5; xmax = 3.5; ymin = -3; ymax = 3; }
  else if (graphSpec.type === 'inflection_cubic') { xmin = -1.5; xmax = 3.5; ymin = -1; ymax = 6; }
  else if (graphSpec.type === 'branch_parabolic_ox') { xmin = -0.5; xmax = 8; ymin = -0.5; ymax = 4.5; }
  else if (graphSpec.type === 'oblique_asymptote') { xmin = -1; xmax = 5; ymin = -4; ymax = 8; }
  else if (graphSpec.type === 'relative_position') { xmin = -3.5; xmax = 3.5; ymin = -4; ymax = 4; }
  else if (graphSpec.type === 'inverse_curve_sym') { xmin = -1.5; xmax = 4.5; ymin = -1.5; ymax = 4.5; }
  else if (graphSpec.type === 'vertical_half_tangent') { xmin = -0.8; xmax = 4.2; ymin = -0.5; ymax = 2.8; }

  const toX = (x) => ((x - xmin) / (xmax - xmin)) * W;
  const toY = (y) => H - ((y - ymin) / (ymax - ymin)) * H;

  // Faint Grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = Math.ceil(xmin); gx <= Math.floor(xmax); gx++) {
    const px = toX(gx);
    ctx.moveTo(px, 0); ctx.lineTo(px, H);
  }
  for (let gy = Math.ceil(ymin); gy <= Math.floor(ymax); gy++) {
    const py = toY(gy);
    ctx.moveTo(0, py); ctx.lineTo(W, py);
  }
  ctx.stroke();

  // Axes (Ox, Oy)
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.52)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  if (ymin <= 0 && ymax >= 0) { ctx.moveTo(0, toY(0)); ctx.lineTo(W, toY(0)); }
  if (xmin <= 0 && xmax >= 0) { ctx.moveTo(toX(0), 0); ctx.lineTo(toX(0), H); }
  ctx.stroke();

  const plotCurve = (fn, color, dashed = false, startX = xmin, endX = xmax) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    if (dashed) ctx.setLineDash([6, 5]);
    ctx.beginPath();
    let started = false;
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const x = startX + ((endX - startX) * i) / steps;
      const y = fn(x);
      if (!Number.isFinite(y) || y < ymin - 2 || y > ymax + 2) {
        started = false;
        continue;
      }
      const px = toX(x);
      const py = toY(y);
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  };

  const dot = (x, y, color, label) => {
    const px = toX(x);
    const py = toY(y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fill();
    if (label) {
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 11px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, px + 6, py - 6);
    }
  };

  switch (graphSpec.type) {
    case 'tangent_parabola':
      plotCurve(x => x * x - 2 * x + 3, '#38bdf8');
      plotCurve(x => 2 * x - 1, '#f87171', true);
      dot(2, 3, '#fbbf24', 'A(2,3)');
      break;
    case 'point_anguleux':
      plotCurve(x => Math.abs(x - 1), '#38bdf8');
      dot(1, 0, '#fbbf24', 'A(1,0)');
      break;
    case 'vertical_half_tangent':
      plotCurve(x => x >= 0 ? Math.sqrt(x) : NaN, '#38bdf8', false, 0, xmax);
      plotCurve(() => 0, '#fbbf24');
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(0));
      ctx.lineTo(toX(0), toY(1.6));
      ctx.stroke();
      dot(0, 0, '#ef4444', '(0,0) ↑');
      break;
    case 'sign_fprime':
      plotCurve(x => x * x - 4, '#34d399');
      dot(-2, 0, '#fbbf24', '-2');
      dot(2, 0, '#fbbf24', '2');
      break;
    case 'intersect_fg':
      plotCurve(x => x * x - 2, '#38bdf8');
      plotCurve(x => x, '#f87171');
      dot(-1, -1, '#fbbf24', '-1');
      dot(2, 2, '#fbbf24', '2');
      break;
    case 'cubic_ox_sign':
      plotCurve(x => 0.25 * x * (x - 2) * (x + 2), '#38bdf8');
      dot(-2, 0, '#fbbf24', '-2');
      dot(0, 0, '#fbbf24', '0');
      dot(2, 0, '#fbbf24', '2');
      break;
    case 'inflection_cubic':
      plotCurve(x => x * x * x - 3 * x * x + 4, '#c084fc');
      dot(1, 2, '#fbbf24', 'I(1,2)');
      break;
    case 'branch_parabolic_ox':
      plotCurve(x => x >= 0 ? 1.45 * Math.sqrt(x) : NaN, '#34d399', false, 0, xmax);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '800 11px monospace';
      ctx.fillText('lim f(x)/x = 0', toX(3.8), toY(1.2));
      break;
    case 'oblique_asymptote':
      plotCurve(x => 2 * x - 3, '#fbbf24', true);
      plotCurve(x => 2 * x - 3 + 1.8 / (x + 1.6), '#38bdf8');
      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 11px monospace';
      ctx.fillText('y = 2x - 3', toX(2.1), toY(0.2));
      break;
    case 'relative_position':
      plotCurve(x => x - 1, '#fbbf24', true);
      plotCurve(x => x - 1 + (1.2 * x) / (x * x + 0.8), '#38bdf8');
      dot(0, -1, '#ef4444', '0');
      break;
    case 'inverse_curve_sym':
      plotCurve(x => x, '#94a3b8', true);
      plotCurve(x => x >= -0.4 ? Math.exp(x * 0.45) - 0.5 : NaN, '#38bdf8');
      plotCurve(x => x >= 0.4 ? Math.log(x + 0.5) / 0.45 : NaN, '#f472b6');
      ctx.fillStyle = '#94a3b8';
      ctx.font = '800 11px monospace';
      ctx.fillText('y = x', toX(3.1), toY(3.4));
      break;
  }
};
