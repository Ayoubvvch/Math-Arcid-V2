/**
 * Integral Forge (محرقة التكامل والمعادلات) - 60FPS Industrial Mech Foundry Renderer
 * Draws the 2600x1700 Molten Foundry, Magnetic Gantries, Slag Vats, 4 Wing Seals,
 * Area Slicer Cleave, Boss Rotating Root Window r₀, Mini-Radar, and 10 Interactive GraphSpecs.
 */

const FORGE_WING_ZONES = [
  { x: 0, y: 0, w: 1300, h: 850, fill: 'rgba(245, 158, 11, 0.038)' },
  { x: 1300, y: 0, w: 1300, h: 850, fill: 'rgba(249, 115, 22, 0.038)' },
  { x: 0, y: 850, w: 1300, h: 850, fill: 'rgba(56, 189, 248, 0.035)' },
  { x: 1300, y: 850, w: 1300, h: 850, fill: 'rgba(239, 68, 68, 0.038)' }
];
const FORGE_WING_GLYPHS = ['α', 'β', 'γ', 'δ'];

window.renderForgeFrame = function(ctx, viewW, viewH, state) {
  const p = state.player;
  const time = state.time;
  const W = window.FORGE_WORLD.WIDTH;
  const H = window.FORGE_WORLD.HEIGHT;

  const shakeX = state.screenShake > 0.2 ? (Math.random() - 0.5) * state.screenShake : 0;
  const shakeY = state.screenShake > 0.2 ? (Math.random() - 0.5) * state.screenShake : 0;

  const camX = Math.max(0, Math.min(W - viewW, p.x - viewW * 0.5)) + shakeX;
  const camY = Math.max(0, Math.min(H - viewH, p.y - viewH * 0.5)) + shakeY;

  ctx.fillStyle = '#090605';
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.save();
  ctx.translate(-camX, -camY);

  // 1. Foundry Sector Zones & Crucible Grid
  for (let i = 0; i < FORGE_WING_ZONES.length; i++) {
    const s = FORGE_WING_ZONES[i];
    if (s.x + s.w < camX || s.x > camX + viewW || s.y + s.h < camY || s.y > camY + viewH) continue;
    ctx.fillStyle = s.fill;
    ctx.fillRect(s.x, s.y, s.w, s.h);
  }

  const gx0 = Math.max(0, Math.floor(camX / 100) * 100);
  const gx1 = Math.min(W, camX + viewW + 100);
  const gy0 = Math.max(0, Math.floor(camY / 100) * 100);
  const gy1 = Math.min(H, camY + viewH + 100);

  ctx.strokeStyle = 'rgba(249, 115, 22, 0.07)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = gx0; gx <= gx1; gx += 100) {
    ctx.moveTo(gx, gy0);
    ctx.lineTo(gx, gy1);
  }
  for (let gy = gy0; gy <= gy1; gy += 100) {
    ctx.moveTo(gx0, gy);
    ctx.lineTo(gx1, gy);
  }
  ctx.stroke();

  // Sector Divider Integral Axes
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.22)';
  ctx.setLineDash([12, 10]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.5, 40); ctx.lineTo(W * 0.5, H - 40);
  ctx.moveTo(40, H * 0.5); ctx.lineTo(W - 40, H * 0.5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Central Differential Crucible Ring at (1300, 880)
  if (1300 + 250 > camX && 1300 - 250 < camX + viewW && 880 + 250 > camY && 880 - 250 < camY + viewH) {
    ctx.save();
    ctx.translate(1300, 880);
    ctx.rotate(time * 0.24);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.lineWidth = 3;
    ctx.setLineDash([18, 12]);
    ctx.beginPath(); ctx.arc(0, 0, 175, 0, Math.PI * 2); ctx.stroke();
    ctx.rotate(-time * 0.55);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.24)';
    ctx.beginPath(); ctx.arc(0, 0, 118, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 2. Magnetic Crane Rails, Terminal Pads & Foundry Catwalks
  for (const plat of state.platforms) {
    if (plat.oscAxis === 'y' && plat.x + plat.w >= camX - 30 && plat.x <= camX + viewW + 30) {
      const railX = plat.x + plat.w * 0.5;
      const topY = plat.baseY - plat.amp;
      const botY = plat.baseY + plat.amp + plat.h;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(railX, topY);
      ctx.lineTo(railX, botY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = plat.dockSide === -1 ? '#fde047' : 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(railX - 18, topY - 4, 36, 4);
      ctx.fillStyle = plat.dockSide === 1 ? '#fde047' : 'rgba(56, 189, 248, 0.45)';
      ctx.fillRect(railX - 18, botY, 36, 4);
    }

    if (plat.x + plat.w < camX - 20 || plat.x > camX + viewW + 20 ||
        plat.y + plat.h < camY - 20 || plat.y > camY + viewH + 20) continue;

    ctx.fillStyle = plat.solid ? '#1a110d' : 'rgba(28, 17, 12, 0.94)';
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

    const edgeColor = plat.oscAxis ? '#38bdf8' : (plat.solid ? '#f97316' : '#f59e0b');
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = plat.solid ? 2.5 : 2;
    ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

    ctx.fillStyle = edgeColor;
    ctx.fillRect(plat.x, plat.y, plat.w, 3);

    if (plat.label) {
      ctx.direction = plat.isRtl ? 'rtl' : 'ltr';
      ctx.fillStyle = '#ffedd5';
      ctx.font = '800 10.5px Tahoma, monospace';
      ctx.textAlign = 'center';
      const txt = plat.oscAxis === 'y'
        ? `${plat.label} ${plat.velY < -12 ? '▲' : (plat.velY > 12 ? '▼' : '●')}`
        : plat.label;
      ctx.fillText(txt, plat.x + plat.w * 0.5, plat.y + (plat.solid ? 24 : 14));
    }
  }

  // 3. Molten Slag Cooling Channels
  for (const pool of state.slagPools) {
    if (pool.x + pool.w < camX - 20 || pool.x > camX + viewW + 20 ||
        pool.y + pool.h < camY - 30 || pool.y - 30 > camY + viewH) continue;

    ctx.fillStyle = 'rgba(234, 88, 12, 0.42)';
    ctx.fillRect(pool.x, pool.y, pool.w, pool.h);

    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let wx = 0; wx <= pool.w; wx += 14) {
      const wy = pool.y + Math.sin(wx * 0.045 + time * 4.8) * 2.3;
      if (wx === 0) ctx.moveTo(pool.x + wx, wy);
      else ctx.lineTo(pool.x + wx, wy);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(254, 240, 138, 0.72)';
    for (let b = 0; b < 5; b++) {
      const bx = pool.x + ((b * 79 + time * 26) % pool.w);
      const by = pool.y + pool.h - ((time * 30 + b * 11) % (pool.h + 8));
      ctx.beginPath();
      ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.direction = 'rtl';
    ctx.fillStyle = '#fed7aa';
    ctx.font = '800 11px Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pool.label, pool.x + pool.w * 0.5, pool.y - 7);
  }

  // 4. 4 Foundry Containment Seals (α, β, γ, δ)
  for (let idx = 0; idx < state.gates.length; idx++) {
    const g = state.gates[idx];
    if (g.x + 140 < camX || g.x - 140 > camX + viewW || g.y + 140 < camY || g.y - 140 > camY + viewH) continue;
    const dist = Math.hypot(g.x - p.x, g.y - p.y);

    ctx.save();
    ctx.translate(g.x, g.y);

    if (g.broken) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, g.radius, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.direction = 'rtl';
      ctx.fillStyle = '#fde047';
      ctx.font = '800 12px Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ مصهور', 0, 4);
    } else {
      ctx.fillStyle = 'rgba(249, 115, 22, 0.16)';
      ctx.beginPath(); ctx.arc(0, 0, g.radius + Math.sin(g.pulse) * 4, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = g.color;
      ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.arc(0, 0, g.radius, 0, Math.PI * 2); ctx.stroke();

      ctx.rotate(g.pulse * 0.4);
      ctx.setLineDash([7, 7]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.48)';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(0, 0, g.radius * 0.72, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.rotate(-g.pulse * 0.4);

      ctx.direction = 'ltr';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 13.5px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${FORGE_WING_GLYPHS[idx]}: ${g.glyph}`, 0, 0);

      if (dist <= 132) {
        ctx.direction = 'rtl';
        ctx.fillStyle = '#fde047';
        ctx.font = '800 12px Tahoma, sans-serif';
        ctx.fillText('[▢ / E] اختراق ختم المحرقة', 0, -g.radius - 14);
      }
    }
    ctx.restore();
  }

  // 5. Armor Plates & Plasma Flux Orbs (Culled)
  for (const o of state.orbs) {
    if (o.x + 30 < camX || o.x - 30 > camX + viewW || o.y + 30 < camY || o.y - 30 > camY + viewH) continue;
    ctx.save();
    ctx.translate(o.x, o.y + Math.sin(time * 3 + o.id) * 4);
    ctx.fillStyle = o.kind === 'hp' ? '#f59e0b' : '#38bdf8';
    ctx.beginPath(); ctx.arc(0, 0, o.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.direction = 'ltr';
    ctx.fillStyle = '#090605';
    ctx.font = '900 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(o.kind === 'hp' ? '+HP' : '∫dx', 0, 0.5);
    ctx.restore();
  }

  // 6. Boss Integral Boundary Lasers
  for (const bm of state.bossBeams) {
    ctx.save();
    if (bm.warnTimer > 0) {
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.72)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([12, 8]);
      ctx.beginPath();
      if (bm.axis === 'x') {
        ctx.moveTo(bm.pos, 0); ctx.lineTo(bm.pos, H);
      } else {
        ctx.moveTo(0, bm.pos); ctx.lineTo(W, bm.pos);
      }
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.36)';
      ctx.lineWidth = 26;
      ctx.beginPath();
      if (bm.axis === 'x') {
        ctx.moveTo(bm.pos, 0); ctx.lineTo(bm.pos, H);
      } else {
        ctx.moveTo(0, bm.pos); ctx.lineTo(W, bm.pos);
      }
      ctx.stroke();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 9;
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 7. Projectiles (Culled)
  ctx.fillStyle = '#fde047';
  for (const b of state.projectiles) {
    if (b.x + 12 < camX || b.x - 12 > camX + viewW || b.y + 12 < camY || b.y - 12 > camY + viewH) continue;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5.2, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const ep of state.enemyProjectiles) {
    if (ep.x + 12 < camX || ep.x - 12 > camX + viewW || ep.y + 12 < camY || ep.y - 12 > camY + viewH) continue;
    ctx.fillStyle = ep.color || '#ef4444';
    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 5.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Foundry Enemies & Differential Boss Core (Phase 3 Rotating Window r0)
  for (const e of state.enemies) {
    if (e.x + 120 < camX || e.x - 120 > camX + viewW || e.y + 120 < camY || e.y - 120 > camY + viewH) continue;
    ctx.save();
    ctx.translate(e.x, e.y);

    if (e.kind === 'boss' && e.shieldActive) {
      const shR = e.radius + 22;
      const gap = e.shieldGapHalf || 0.48;
      const a0 = e.shieldAngle || 0;

      ctx.fillStyle = 'rgba(56, 189, 248, 0.10)';
      ctx.beginPath(); ctx.arc(0, 0, shR, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(0, 0, shR, a0 + gap, a0 + Math.PI * 2 - gap);
      ctx.stroke();

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, shR, a0 - gap, a0 + gap);
      ctx.stroke();
      ctx.setLineDash([]);

      const wx = Math.cos(a0) * (shR + 14);
      const wy = Math.sin(a0) * (shR + 14);
      ctx.direction = 'ltr';
      ctx.fillStyle = '#fde047';
      ctx.font = '900 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('r₀', wx, wy);

      const sbw = e.radius * 1.9;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
      ctx.fillRect(-sbw * 0.5, -e.radius - 22, sbw, 4);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-sbw * 0.5, -e.radius - 22, sbw * Math.max(0, e.shieldHp / e.shieldMaxHp), 4);
    }

    ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : '#18100c';
    ctx.strokeStyle = e.staggered ? '#fde047' : (e.stunTimer > 0 ? '#38bdf8' : e.color);
    ctx.lineWidth = e.kind === 'boss' ? 4 : 2.6;

    ctx.beginPath();
    if (e.kind === 'golem_ode' || e.kind === 'boss') {
      // Heavy Industrial Hex-Hull for Golems & Boss
      const sides = 6;
      for (let k = 0; k < sides; k++) {
        const ang = (k * Math.PI * 2) / sides + (e.kind === 'boss' ? time * 0.35 : 0);
        const vx = Math.cos(ang) * e.radius;
        const vy = Math.sin(ang) * e.radius;
        if (k === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.closePath();
    } else {
      ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    ctx.direction = e.isRtl ? 'rtl' : 'ltr';
    ctx.fillStyle = '#f8fafc';
    ctx.font = e.kind === 'boss' ? '800 11px Tahoma, sans-serif' : '800 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(e.label, 0, 0);

    const bw = e.radius * 1.9;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(-bw * 0.5, -e.radius - 13, bw, 5);
    ctx.fillStyle = e.staggered ? '#fde047' : e.color;
    ctx.fillRect(-bw * 0.5, -e.radius - 13, bw * Math.max(0, e.hp / e.maxHp), 5);

    if (e.staggered) {
      ctx.direction = 'rtl';
      ctx.fillStyle = '#fde047';
      ctx.font = '800 11px Tahoma, sans-serif';
      ctx.fillText('[▢ / E] سحق الغولم', 0, -e.radius - 26);
    }
    ctx.restore();
  }

  // 9. Player Heavy Mech TITAN-∫, Area Slicer Arc & Chasles Shield
  ctx.save();
  ctx.translate(p.x, p.y);

  if (p.overdrivePulseAnim > 0) {
    const prog = 1 - p.overdrivePulseAnim / 0.36;
    ctx.strokeStyle = `rgba(251, 146, 60, ${1 - prog})`;
    ctx.lineWidth = 6 * (1 - prog * 0.6);
    ctx.beginPath(); ctx.arc(0, 0, 60 + prog * 360, 0, Math.PI * 2); ctx.stroke();
  }

  if (p.sliceAnim > 0) {
    const prog = 1 - p.sliceAnim / 0.26;
    ctx.strokeStyle = `rgba(251, 113, 133, ${1 - prog * 0.7})`;
    ctx.lineWidth = 7 * (1 - prog * 0.4);
    ctx.beginPath(); ctx.arc(0, 0, 125, -Math.PI * 0.8 + prog * 1.2, Math.PI * 0.8 + prog * 1.2); ctx.stroke();
  }

  if (p.aegisTimer > 0) {
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.direction = 'ltr';
    ctx.fillStyle = '#bae6fd';
    ctx.font = '800 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('∫_a^c + ∫_c^b', 0, -58);
  }

  // Aim barrel
  ctx.save();
  ctx.rotate(p.aimAngle);
  ctx.fillStyle = '#fb923c';
  ctx.fillRect(p.radius - 4, -4, 16, 8);
  ctx.restore();

  // Mech Octagonal Armored Hull
  ctx.fillStyle = p.invulnTimer > 0 && Math.floor(time * 20) % 2 === 0 ? '#ffffff' : '#24140d';
  ctx.strokeStyle = p.dashTimer > 0 ? '#fb7185' : '#f59e0b';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  for (let k = 0; k < 8; k++) {
    const ang = (k * Math.PI * 2) / 8 + Math.PI / 8;
    const vx = Math.cos(ang) * p.radius;
    const vy = Math.sin(ang) * p.radius;
    if (k === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.direction = 'ltr';
  ctx.fillStyle = '#fde047';
  ctx.font = '900 13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('∫', 0, 0.5);
  ctx.restore();

  // 10. Particles & Floating Texts (Full X+Y Culled)
  for (const pt of state.particles) {
    if (pt.x + 16 < camX || pt.x - 16 > camX + viewW || pt.y + 16 < camY || pt.y - 16 > camY + viewH) continue;
    ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
    ctx.fillStyle = pt.color;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const ft of state.floatingTexts) {
    if (ft.x + 140 < camX || ft.x - 140 > camX + viewW || ft.y + 40 < camY || ft.y - 40 > camY + viewH) continue;
    ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
    ctx.direction = ft.isRtl ? 'rtl' : 'ltr';
    ctx.fillStyle = ft.color;
    ctx.font = '800 13px Tahoma, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;

  ctx.restore();

  // 11. Screen-Space Foundry Mini-Radar (Bottom-Left)
  if (viewW > 520) {
    const radW = 104;
    const radH = 68;
    const rx = 14;
    const ry = viewH - radH - 64;
    ctx.save();
    ctx.fillStyle = 'rgba(18, 11, 8, 0.88)';
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.48)';
    ctx.lineWidth = 1.5;
    ctx.fillRect(rx, ry, radW, radH);
    ctx.strokeRect(rx, ry, radW, radH);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.beginPath();
    ctx.moveTo(rx + radW * 0.5, ry); ctx.lineTo(rx + radW * 0.5, ry + radH);
    ctx.moveTo(rx, ry + radH * 0.5); ctx.lineTo(rx + radW, ry + radH * 0.5);
    ctx.stroke();

    for (const g of state.gates) {
      const gx = rx + (g.x / W) * radW;
      const gy = ry + (g.y / H) * radH;
      ctx.fillStyle = g.broken ? '#475569' : g.color;
      ctx.beginPath(); ctx.arc(gx, gy, 3.6, 0, Math.PI * 2); ctx.fill();
    }

    for (const e of state.enemies) {
      if (e.kind !== 'boss') continue;
      const bx = rx + (e.x / W) * radW;
      const by = ry + (e.y / H) * radH;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(bx, by, 4.2, 0, Math.PI * 2); ctx.fill();
    }

    const px = rx + (p.x / W) * radW;
    const py = ry + (p.y / H) * radH;
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.arc(px, py, 3.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  if (state.damageFlash > 0) {
    ctx.fillStyle = `rgba(239, 68, 68, ${state.damageFlash * 0.28})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }
};

/**
 * Interactive Modal Graph Plotter (#seqGraphCanvas: 390 x 185)
 * Renders 10 distinct 2BAC PC Integrals, Areas, Solids of Revolution & ODE Visualizers.
 */
window.drawForgeGraph = function(canvas, graphSpec) {
  if (!canvas || !graphSpec) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.fillStyle = '#090605';
  ctx.fillRect(0, 0, W, H);
  ctx.direction = 'ltr';

  const ox = W * 0.42;
  const oy = H * 0.58;
  const scale = 30;

  const toX = x => ox + x * scale;
  const toY = y => oy - y * scale;

  // Grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = -5; gx <= 6; gx++) {
    ctx.moveTo(toX(gx), 0); ctx.lineTo(toX(gx), H);
  }
  for (let gy = -2; gy <= 3; gy++) {
    ctx.moveTo(0, toY(gy)); ctx.lineTo(W, toY(gy));
  }
  ctx.stroke();

  // Axes
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.42)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, oy); ctx.lineTo(W, oy);
  ctx.moveTo(ox, 0); ctx.lineTo(ox, H);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '800 10px monospace';
  ctx.fillText('x', W - 14, oy - 5);
  ctx.fillText('y', ox + 6, 12);
  ctx.fillText('O', ox - 12, oy + 12);

  const type = graphSpec.type;

  if (type === 'primitive_shift') {
    // Base curve e^(x^2 - x) vs shifted F(x) passing through (1, 4) scaled nicely
    const fnBase = x => Math.exp((x * x - x) * 0.45) * 0.65;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let x = -1.2; x <= 2.2; x += 0.06) {
      const px = toX(x), py = toY(fnBase(x));
      if (x === -1.2) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = -1.2; x <= 2.2; x += 0.06) {
      const px = toX(x), py = toY(fnBase(x) + 1.35);
      if (x === -1.2) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.arc(toX(1), toY(fnBase(1) + 1.35), 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('F(1) = 4 (+C)', toX(1.2), toY(2.2));

  } else if (type === 'chasles_split') {
    // Shaded [0, 2] positive vs [2, 5] negative
    const f = x => 1.7 * Math.cos(x * 0.62);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
    ctx.beginPath(); ctx.moveTo(toX(0), oy);
    for (let x = 0; x <= 2.0; x += 0.06) ctx.lineTo(toX(x), toY(f(x)));
    ctx.lineTo(toX(2), oy); ctx.closePath(); ctx.fill();

    ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
    ctx.beginPath(); ctx.moveTo(toX(2), oy);
    for (let x = 2; x <= 5.0; x += 0.06) ctx.lineTo(toX(x), toY(f(x)));
    ctx.lineTo(toX(5), oy); ctx.closePath(); ctx.fill();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let x = -0.3; x <= 5.2; x += 0.06) {
      const px = toX(x), py = toY(f(x));
      if (x === -0.3) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = '#fde047'; ctx.fillText('+5', toX(0.75), toY(0.9));
    ctx.fillStyle = '#fca5a5'; ctx.fillText('-2', toX(3.3), toY(-0.9));
    ctx.fillStyle = '#38bdf8'; ctx.fillText('∫₀⁵ = ∫₀² + ∫₂⁵', toX(1.8), toY(2.2));

  } else if (type === 'riemann_integral_sign') {
    // f(x) = x - 1 on [0, 2]
    ctx.fillStyle = 'rgba(239, 68, 68, 0.26)';
    ctx.beginPath(); ctx.moveTo(toX(0), oy); ctx.lineTo(toX(0), toY(-1)); ctx.lineTo(toX(1), oy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
    ctx.beginPath(); ctx.moveTo(toX(1), oy); ctx.lineTo(toX(2), toY(1)); ctx.lineTo(toX(2), oy); ctx.closePath(); ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.3;
    ctx.beginPath(); ctx.moveTo(toX(-0.5), toY(-1.5)); ctx.lineTo(toX(3.0), toY(2.0)); ctx.stroke();

    ctx.fillStyle = '#fca5a5'; ctx.fillText('-1/2', toX(0.22), toY(-0.4));
    ctx.fillStyle = '#6ee7b7'; ctx.fillText('+1/2', toX(1.38), toY(0.4));
    ctx.fillStyle = '#fde047'; ctx.fillText('∫₀² (x-1)dx = 0 | A = 1', toX(1.2), toY(2.0));

  } else if (type === 'ipp_area_ln') {
    // Geometric Integration by Parts: rectangle [0,e]x[0,1] = e minus complementary ∫₀¹ e^y dy = (e-1)
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(ox, toY(1), toX(Math.E) - ox, oy - toY(1));
    ctx.setLineDash([]);

    // Complementary area ∫₀¹ e^y dy = e - 1
    ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox, toY(1)); ctx.lineTo(toX(Math.E), toY(1));
    for (let x = Math.E; x >= 1; x -= 0.05) ctx.lineTo(toX(x), toY(Math.log(x)));
    ctx.closePath(); ctx.fill();

    // Target area ∫₁ᵉ ln(x)dx = 1
    ctx.fillStyle = 'rgba(249, 115, 22, 0.34)';
    ctx.beginPath(); ctx.moveTo(toX(1), oy);
    for (let x = 1; x <= Math.E; x += 0.05) ctx.lineTo(toX(x), toY(Math.log(x)));
    ctx.lineTo(toX(Math.E), oy); ctx.closePath(); ctx.fill();

    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = 0.16; x <= 4.6; x += 0.06) {
      const px = toX(x), py = toY(Math.log(x));
      if (x === 0.16) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = '#bae6fd'; ctx.fillText('e - 1', toX(0.35), toY(0.55));
    ctx.fillStyle = '#fde047';
    ctx.fillText('1', toX(1) - 3, oy + 12);
    ctx.fillText('e', toX(Math.E) - 3, oy + 12);
    ctx.fillText('∫₁ᵉ ln(x)dx = e - (e - 1) = 1', toX(0.75), toY(1.8));

  } else if (type === 'integral_phi_deriv') {
    // Phi'(x) = (x - 2) * e^(-x) scaled for clarity, crossing 0 at x=2
    const yMul = 3.2;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = -0.3; x <= 5.0; x += 0.07) {
      const y = (x - 2) * Math.exp(-x) * yMul;
      const px = toX(x), py = toY(y);
      if (x === -0.3) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.arc(toX(2), oy, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('x = 2 (Φ\'=0)', toX(2.15), oy - 8);
    ctx.fillStyle = '#fca5a5'; ctx.fillText('Φ\' < 0', toX(0.35), toY(-1.2));
    ctx.fillStyle = '#6ee7b7'; ctx.fillText('Φ\' > 0 (min)', toX(2.8), toY(0.8));

  } else if (type === 'area_below_ox') {
    // f(x) = (x^2 - 4) * 0.45 below Ox on [-2, 2]
    const ys = 0.45;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath(); ctx.moveTo(toX(-2), oy);
    for (let x = -2; x <= 2; x += 0.08) ctx.lineTo(toX(x), toY((x * x - 4) * ys));
    ctx.lineTo(toX(2), oy); ctx.closePath(); ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    for (let x = -2.7; x <= 2.7; x += 0.07) {
      const px = toX(x), py = toY((x * x - 4) * ys);
      if (x === -2.7) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = '#bae6fd'; ctx.fillText('f(x) ≤ 0 ⟹ A = ∫ -(f)dx', toX(-1.8), toY(1.6));

  } else if (type === 'area_between_curves') {
    // f(x) = x + e^(-x) above y = x on [0, ln 3]
    const ln3 = Math.log(3);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
    ctx.beginPath();
    for (let x = 0; x <= ln3; x += 0.05) {
      const py = toY(x + Math.exp(-x));
      if (x === 0) ctx.moveTo(toX(x), py); else ctx.lineTo(toX(x), py);
    }
    for (let x = ln3; x >= 0; x -= 0.05) ctx.lineTo(toX(x), toY(x));
    ctx.closePath(); ctx.fill();

    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(toX(-1.5), toY(-1.5)); ctx.lineTo(toX(2.8), toY(2.8)); ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = -0.8; x <= 2.6; x += 0.06) {
      const px = toX(x), py = toY(x + Math.exp(-x));
      if (x === -0.8) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = '#fde047'; ctx.fillText('A = ∫ (f(x)-x)dx', toX(1.35), toY(1.8));

  } else if (type === 'volume_revolution_ox') {
    // Solid of revolution of y = e^x on [0, 1] around Ox with 3D sliced discs
    const ys = 0.65;
    ctx.fillStyle = 'rgba(249, 115, 22, 0.22)';
    ctx.beginPath();
    for (let x = 0; x <= 1.5; x += 0.05) {
      const px = toX(x), py = toY(Math.exp(x * 0.7) * ys);
      if (x === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    for (let x = 1.5; x >= 0; x -= 0.05) {
      ctx.lineTo(toX(x), toY(-Math.exp(x * 0.7) * ys));
    }
    ctx.closePath(); ctx.fill();

    // 3 cross-section disc slices illustrating dV = π·(f(x))² dx
    for (const sx of [0.45, 0.98, 1.5]) {
      const rx = 7;
      const ry = Math.abs(toY(Math.exp(sx * 0.7) * ys) - oy);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.strokeStyle = sx === 1.5 ? '#fde047' : 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = sx === 1.5 ? 2.0 : 1.3;
      ctx.beginPath(); ctx.ellipse(toX(sx), oy, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    // Radius indicator on middle disc
    ctx.strokeStyle = '#38bdf8';
    ctx.beginPath(); ctx.moveTo(toX(0.98), oy); ctx.lineTo(toX(0.98), toY(Math.exp(0.98 * 0.7) * ys)); ctx.stroke();

    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    for (let x = -0.5; x <= 1.8; x += 0.05) {
      const px = toX(x), py = toY(Math.exp(x * 0.7) * ys);
      if (x === -0.5) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    for (let x = -0.5; x <= 1.8; x += 0.05) {
      const px = toX(x), py = toY(-Math.exp(x * 0.7) * ys);
      if (x === -0.5) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#fed7aa'; ctx.fillText('V = π ∫ (f(x))² dx', toX(1.65), toY(2.1));

  } else if (type === 'ode_first_order') {
    // y = 5 e^(-3x) scaled cleanly
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = -0.25; x <= 3.8; x += 0.05) {
      const px = toX(x), py = toY(2.2 * Math.exp(-1.5 * x));
      if (x === -0.25) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.arc(ox, toY(2.2), 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('y(0) = 5', ox + 8, toY(2.2));
    ctx.fillStyle = '#fca5a5'; ctx.fillText('y(x) = 5·e^{-3x}', toX(1.3), toY(1.2));

  } else if (type === 'ode_second_harmonic') {
    // y = 2 cos(2x) - 3 sin(2x) scaled by 0.55
    const fn = x => (2 * Math.cos(2 * x) - 3 * Math.sin(2 * x)) * 0.55;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = -1.6; x <= 4.2; x += 0.05) {
      const px = toX(x), py = toY(fn(x));
      if (x === -1.6) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = '#fde047';
    ctx.beginPath(); ctx.arc(ox, toY(fn(0)), 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('y(0) = 2', ox + 8, toY(1.3));
    ctx.fillStyle = '#bae6fd'; ctx.fillText('y\'\' + 4y = 0 (Δ < 0)', toX(1.3), toY(2.2));

  } else if (type === 'ipp_x_exp_area') {
    // f(x) = x * e^(-x) on [0, alpha] magnified by 4.5x for visual clarity
    const ym = 4.5;
    const alpha = 3.1;
    ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
    ctx.beginPath(); ctx.moveTo(ox, oy);
    for (let x = 0; x <= alpha; x += 0.06) ctx.lineTo(toX(x), toY(x * Math.exp(-x) * ym));
    ctx.lineTo(toX(alpha), oy); ctx.closePath(); ctx.fill();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = 0; x <= 4.8; x += 0.06) {
      const px = toX(x), py = toY(x * Math.exp(-x) * ym);
      if (x === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.strokeStyle = '#38bdf8';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(toX(alpha), oy); ctx.lineTo(toX(alpha), toY(alpha * Math.exp(-alpha) * ym)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#38bdf8'; ctx.fillText('α', toX(alpha) - 3, oy + 12);
    ctx.fillStyle = '#fde047'; ctx.fillText('lim I(α) = 1 (x·e⁻ˣ)', toX(1.1), toY(2.1));

  } else if (type === 'volume_cone_disc') {
    // Rotating segment y = 2x on [0, 2] scaled vertically by 0.55 around (Ox)
    const ys = 0.55;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.20)';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(toX(2), toY(4 * ys));
    ctx.lineTo(toX(2), toY(-4 * ys));
    ctx.closePath(); ctx.fill();

    for (const sx of [0.8, 1.4, 2.0]) {
      const ry = Math.abs(toY(2 * sx * ys) - oy);
      ctx.strokeStyle = sx === 2.0 ? '#fde047' : 'rgba(251, 146, 60, 0.72)';
      ctx.lineWidth = sx === 2.0 ? 2.0 : 1.3;
      ctx.beginPath(); ctx.ellipse(toX(sx), oy, 6, ry, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(toX(2.4), toY(4.8 * ys)); ctx.stroke();
    ctx.fillStyle = '#fde047'; ctx.fillText('y = 2x , [0,2]', toX(2.2), toY(2.3));
    ctx.fillStyle = '#bae6fd'; ctx.fillText('V = (32π / 3) u.v', toX(1.3), toY(-1.8));

  } else if (type === 'ode_damped_pos_disc') {
    // Double root envelope (Ax + B)e^(2x) vs critical Δ=0 curve
    const fnCrit = x => (1 + 2 * x) * Math.exp(-x * 0.9) * 1.1;
    const fnExp = x => (Math.exp(-0.5 * x) + 0.6 * Math.exp(-1.6 * x));
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let x = -0.3; x <= 3.8; x += 0.06) {
      const px = toX(x), py = toY(fnExp(x));
      if (x === -0.3) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = -0.3; x <= 3.8; x += 0.06) {
      const px = toX(x), py = toY(fnCrit(x));
      if (x === -0.3) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = '#fde047'; ctx.fillText('Δ = 0 ⟹ (Ax+B)·e^{r₀x}', toX(0.9), toY(2.1));
  }
};

window.drawSequenceGraph = window.drawForgeGraph;
