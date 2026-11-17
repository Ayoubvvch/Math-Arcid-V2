/**
 * Logarithm Reactor (مفاعل اللوغاريتم والأسي) - 60FPS Bio-Cyber Metroidvania Renderer
 * Draws the 2800x1800 Containment Facility, Elevators, Acid Vats, 4 Wing Seals,
 * Asymptote Beams, Boss Phase 3 Rotating Shield, Mini-Radar, and 13 Interactive GraphSpecs.
 */

const REACTOR_WING_ZONES = [
  { x: 0, y: 0, w: 1400, h: 900, fill: 'rgba(16, 185, 129, 0.035)' },
  { x: 1400, y: 0, w: 1400, h: 900, fill: 'rgba(34, 211, 238, 0.035)' },
  { x: 0, y: 900, w: 1400, h: 900, fill: 'rgba(245, 158, 11, 0.035)' },
  { x: 1400, y: 900, w: 1400, h: 900, fill: 'rgba(168, 85, 247, 0.035)' }
];
const REACTOR_WING_GLYPHS = ['α', 'β', 'γ', 'δ'];

window.renderReactorFrame = function(ctx, viewW, viewH, state) {
  const p = state.player;
  const time = state.time;
  const W = window.REACTOR_WORLD.WIDTH;
  const H = window.REACTOR_WORLD.HEIGHT;

  const shakeX = state.screenShake > 0.2 ? (Math.random() - 0.5) * state.screenShake : 0;
  const shakeY = state.screenShake > 0.2 ? (Math.random() - 0.5) * state.screenShake : 0;

  const camX = Math.max(0, Math.min(W - viewW, p.x - viewW * 0.5)) + shakeX;
  const camY = Math.max(0, Math.min(H - viewH, p.y - viewH * 0.5)) + shakeY;

  ctx.fillStyle = '#03090c';
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.save();
  ctx.translate(-camX, -camY);

  // 1. Sector Background Zones & Central Reactor Core Silhouette
  for (let i = 0; i < REACTOR_WING_ZONES.length; i++) {
    const s = REACTOR_WING_ZONES[i];
    if (s.x + s.w < camX || s.x > camX + viewW || s.y + s.h < camY || s.y > camY + viewH) continue;
    ctx.fillStyle = s.fill;
    ctx.fillRect(s.x, s.y, s.w, s.h);
  }

  // Batched Containment Wall Grid
  const gx0 = Math.max(0, Math.floor(camX / 100) * 100);
  const gx1 = Math.min(W, camX + viewW + 100);
  const gy0 = Math.max(0, Math.floor(camY / 100) * 100);
  const gy1 = Math.min(H, camY + viewH + 100);

  ctx.strokeStyle = 'rgba(16, 185, 129, 0.07)';
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

  // Sector Divider Asymptotes
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.22)';
  ctx.setLineDash([12, 10]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.5, 40); ctx.lineTo(W * 0.5, H - 40);
  ctx.moveTo(40, H * 0.5); ctx.lineTo(W - 40, H * 0.5);
  ctx.stroke();
  ctx.setLineDash([]);

  // Central Reactor Core Decorative Rings at (1400, 920)
  if (1400 + 260 > camX && 1400 - 260 < camX + viewW && 920 + 260 > camY && 920 - 260 < camY + viewH) {
    ctx.save();
    ctx.translate(1400, 920);
    ctx.rotate(time * 0.25);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.18)';
    ctx.lineWidth = 3;
    ctx.setLineDash([18, 12]);
    ctx.beginPath(); ctx.arc(0, 0, 175, 0, Math.PI * 2); ctx.stroke();
    ctx.rotate(-time * 0.55);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.22)';
    ctx.beginPath(); ctx.arc(0, 0, 120, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 2. Elevator Rails, Terminal Docks & Lab Catwalks
  for (const plat of state.platforms) {
    if (plat.oscAxis === 'y' && plat.x + plat.w >= camX - 30 && plat.x <= camX + viewW + 30) {
      const railX = plat.x + plat.w * 0.5;
      const topY = plat.baseY - plat.amp;
      const botY = plat.baseY + plat.amp + plat.h;
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.26)';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(railX, topY);
      ctx.lineTo(railX, botY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top & Bottom Terminal Dock Markers
      ctx.fillStyle = plat.dockSide === -1 ? '#34d399' : 'rgba(34, 211, 238, 0.45)';
      ctx.fillRect(railX - 18, topY - 4, 36, 4);
      ctx.fillStyle = plat.dockSide === 1 ? '#34d399' : 'rgba(34, 211, 238, 0.45)';
      ctx.fillRect(railX - 18, botY, 36, 4);
    }

    if (plat.x + plat.w < camX - 20 || plat.x > camX + viewW + 20 ||
        plat.y + plat.h < camY - 20 || plat.y > camY + viewH + 20) continue;

    ctx.fillStyle = plat.solid ? '#091a1d' : 'rgba(10, 28, 32, 0.92)';
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

    const edgeColor = plat.oscAxis ? '#22d3ee' : (plat.solid ? '#10b981' : '#84cc16');
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = plat.solid ? 2.5 : 2;
    ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

    // Top highlight rail
    ctx.fillStyle = edgeColor;
    ctx.fillRect(plat.x, plat.y, plat.w, 3);

    if (plat.label) {
      ctx.direction = plat.isRtl ? 'rtl' : 'ltr';
      ctx.fillStyle = '#d1fae5';
      ctx.font = '800 10.5px Tahoma, monospace';
      ctx.textAlign = 'center';
      const txt = plat.oscAxis === 'y'
        ? `${plat.label} ${plat.velY < -12 ? '▲' : (plat.velY > 12 ? '▼' : '●')}`
        : plat.label;
      ctx.fillText(txt, plat.x + plat.w * 0.5, plat.y + (plat.solid ? 24 : 14));
    }
  }

  // 3. Bio-Acid Containment Vats (Undulating caustic wave & bubbles)
  for (const pool of state.acidPools) {
    if (pool.x + pool.w < camX - 20 || pool.x > camX + viewW + 20 ||
        pool.y + pool.h < camY - 30 || pool.y - 30 > camY + viewH) continue;

    ctx.fillStyle = 'rgba(132, 204, 22, 0.36)';
    ctx.fillRect(pool.x, pool.y, pool.w, pool.h);

    // Animated Caustic Wave Surface
    ctx.strokeStyle = '#bef264';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let wx = 0; wx <= pool.w; wx += 14) {
      const wy = pool.y + Math.sin(wx * 0.045 + time * 4.5) * 2.2;
      if (wx === 0) ctx.moveTo(pool.x + wx, wy);
      else ctx.lineTo(pool.x + wx, wy);
    }
    ctx.stroke();

    // Rising Acid Bubbles
    ctx.fillStyle = 'rgba(217, 249, 157, 0.65)';
    for (let b = 0; b < 5; b++) {
      const bx = pool.x + ((b * 79 + time * 24) % pool.w);
      const by = pool.y + pool.h - ((time * 28 + b * 11) % (pool.h + 8));
      ctx.beginPath();
      ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.direction = 'rtl';
    ctx.fillStyle = '#ecfccb';
    ctx.font = '800 11px Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pool.label, pool.x + pool.w * 0.5, pool.y - 7);
  }

  // 4. 4 Containment Wing Seals (α, β, γ, δ)
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
      ctx.fillStyle = '#34d399';
      ctx.font = '800 12px Tahoma, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ مخترق', 0, 4);
    } else {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.beginPath(); ctx.arc(0, 0, g.radius + Math.sin(g.pulse) * 4, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = g.color;
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, g.radius, 0, Math.PI * 2); ctx.stroke();

      ctx.rotate(g.pulse * 0.4);
      ctx.setLineDash([7, 7]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(0, 0, g.radius * 0.72, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.rotate(-g.pulse * 0.4);

      ctx.direction = 'ltr';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 14px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${REACTOR_WING_GLYPHS[idx]}: ${g.glyph}`, 0, 0);

      if (dist <= 130) {
        ctx.direction = 'rtl';
        ctx.fillStyle = '#bef264';
        ctx.font = '800 12px Tahoma, sans-serif';
        ctx.fillText('[▢ / E] اختراق ختم الاحتواء', 0, -g.radius - 14);
      }
    }
    ctx.restore();
  }

  // 5. Bio-Cells & Exponential Orbs (Full X+Y Culled)
  for (const o of state.orbs) {
    if (o.x + 30 < camX || o.x - 30 > camX + viewW ||
        o.y + 30 < camY || o.y - 30 > camY + viewH) continue;
    ctx.save();
    ctx.translate(o.x, o.y + Math.sin(time * 3 + o.id) * 4);
    ctx.fillStyle = o.kind === 'hp' ? '#10b981' : '#f59e0b';
    ctx.beginPath(); ctx.arc(0, 0, o.radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.direction = 'ltr';
    ctx.fillStyle = '#020617';
    ctx.font = '900 9.5px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(o.kind === 'hp' ? 'ln e' : 'eˣ', 0, 0.5);
    ctx.restore();
  }

  // 6. Boss Asymptote Sweeping Beams
  for (const bm of state.bossBeams) {
    ctx.save();
    if (bm.warnTimer > 0) {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.65)';
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
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
      ctx.lineWidth = 26;
      ctx.beginPath();
      if (bm.axis === 'x') {
        ctx.moveTo(bm.pos, 0); ctx.lineTo(bm.pos, H);
      } else {
        ctx.moveTo(0, bm.pos); ctx.lineTo(W, bm.pos);
      }
      ctx.stroke();

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 9;
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  // 7. Projectiles (Culled)
  ctx.fillStyle = '#a3e635';
  for (const b of state.projectiles) {
    if (b.x + 12 < camX || b.x - 12 > camX + viewW || b.y + 12 < camY || b.y - 12 > camY + viewH) continue;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const ep of state.enemyProjectiles) {
    if (ep.x + 12 < camX || ep.x - 12 > camX + viewW || ep.y + 12 < camY || ep.y - 12 > camY + viewH) continue;
    ctx.fillStyle = ep.color || '#fb7185';
    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Bio-Cyber Enemies & Boss Core (with Phase 3 Rotating Equivalence Window α=1)
  for (const e of state.enemies) {
    if (e.x + 115 < camX || e.x - 115 > camX + viewW || e.y + 115 < camY || e.y - 115 > camY + viewH) continue;
    ctx.save();
    ctx.translate(e.x, e.y);

    if (e.kind === 'boss' && e.shieldActive) {
      const shR = e.radius + 22;
      const gap = e.shieldGapHalf || 0.48;
      const a0 = e.shieldAngle || 0;

      // Solid Deflecting Logarithmic Barrier Arc
      ctx.fillStyle = 'rgba(34, 211, 238, 0.10)';
      ctx.beginPath(); ctx.arc(0, 0, shR, 0, Math.PI * 2); ctx.fill();

      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(0, 0, shR, a0 + gap, a0 + Math.PI * 2 - gap);
      ctx.stroke();

      // Open Equivalence Root Window α=1 (ln(1) = 0)
      ctx.strokeStyle = '#a3e635';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, shR, a0 - gap, a0 + gap);
      ctx.stroke();
      ctx.setLineDash([]);

      const wx = Math.cos(a0) * (shR + 14);
      const wy = Math.sin(a0) * (shR + 14);
      ctx.direction = 'ltr';
      ctx.fillStyle = '#bef264';
      ctx.font = '900 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('α=1', wx, wy);

      // Shield HP bar above Boss
      const sbw = e.radius * 1.9;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
      ctx.fillRect(-sbw * 0.5, -e.radius - 22, sbw, 4);
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(-sbw * 0.5, -e.radius - 22, sbw * Math.max(0, e.shieldHp / e.shieldMaxHp), 4);
    }

    ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : '#081519';
    ctx.strokeStyle = e.staggered ? '#fbbf24' : (e.stunTimer > 0 ? '#34d399' : e.color);
    ctx.lineWidth = e.kind === 'boss' ? 4 : 2.6;

    ctx.beginPath(); ctx.arc(0, 0, e.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.direction = e.isRtl ? 'rtl' : 'ltr';
    ctx.fillStyle = '#f8fafc';
    ctx.font = e.kind === 'boss' ? '800 11px Tahoma, sans-serif' : '800 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(e.label, 0, 0);

    const bw = e.radius * 1.9;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.fillRect(-bw * 0.5, -e.radius - 13, bw, 5);
    ctx.fillStyle = e.staggered ? '#fbbf24' : e.color;
    ctx.fillRect(-bw * 0.5, -e.radius - 13, bw * Math.max(0, e.hp / e.maxHp), 5);

    if (e.staggered) {
      ctx.direction = 'rtl';
      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 11px Tahoma, sans-serif';
      ctx.fillText('[▢ / E] تفكيك النواة', 0, -e.radius - 26);
    }
    ctx.restore();
  }

  // 9. Player Bio-Cyber Operative & Equivalence Aegis Shield
  ctx.save();
  ctx.translate(p.x, p.y);

  if (p.aegisTimer > 0) {
    ctx.strokeStyle = '#34d399';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
    ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.direction = 'ltr';
    ctx.fillStyle = '#a7f3d0';
    ctx.font = '800 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('e^{ln x} = x', 0, -56);
  }

  // Aim reticle line
  ctx.strokeStyle = 'rgba(163, 230, 53, 0.65)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(p.aimAngle) * 32, Math.sin(p.aimAngle) * 32);
  ctx.stroke();

  // Operative Suit
  ctx.fillStyle = p.invulnTimer > 0 && Math.floor(time * 20) % 2 === 0 ? '#ffffff' : '#082026';
  ctx.strokeStyle = p.dashTimer > 0 ? '#fb7185' : '#10b981';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, p.radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  ctx.direction = 'ltr';
  ctx.fillStyle = '#a3e635';
  ctx.font = '900 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ln·e', 0, 0.5);
  ctx.restore();

  // 10. Particles & Floating Texts (Culled & cached direction)
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

  // 11. Screen-Space Facility Mini-Radar (Bottom-Left)
  if (viewW > 520) {
    const radW = 104;
    const radH = 68;
    const rx = 14;
    const ry = viewH - radH - 64;
    ctx.save();
    ctx.fillStyle = 'rgba(4, 12, 14, 0.88)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
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
      ctx.fillStyle = '#a855f7';
      ctx.beginPath(); ctx.arc(bx, by, 4.2, 0, Math.PI * 2); ctx.fill();
    }

    const px = rx + (p.x / W) * radW;
    const py = ry + (p.y / H) * radH;
    ctx.fillStyle = '#a3e635';
    ctx.beginPath(); ctx.arc(px, py, 3.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  if (state.damageFlash > 0) {
    ctx.fillStyle = `rgba(244, 63, 94, ${state.damageFlash * 0.28})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }
};

/**
 * Interactive Modal Graph Plotter (#seqGraphCanvas: 390 x 185)
 * Renders 10 distinct 2BAC PC Logarithm & Exponential Visualizers.
 */
window.drawReactorGraph = function(canvas, graphSpec) {
  if (!canvas || !graphSpec) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.fillStyle = '#040b0e';
  ctx.fillRect(0, 0, W, H);
  ctx.direction = 'ltr';

  const ox = W * 0.44;
  const oy = H * 0.56;
  const scale = 32;

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

  if (type === 'ln_domain_band') {
    // Parabola u(x) = x^2 - x - 2, positive on ]-inf, -1[ U ]2, +inf[
    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
    ctx.fillRect(0, 0, toX(-1), H);
    ctx.fillRect(toX(2), 0, W - toX(2), H);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    for (let x = -2.4; x <= 3.4; x += 0.08) {
      const y = (x * x - x - 2) * 0.45;
      const px = toX(x), py = toY(y);
      if (x === -2.4) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    for (const r of [-1, 2]) {
      ctx.fillStyle = '#040b0e';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(toX(r), oy, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('u(x) > 0 : ]-∞,-1[ ∪ ]2,+∞[', toX(-0.7), toY(2.1));

  } else if (type === 'primitive_area_inv') {
    // Shaded area under 1/x on [1, e]
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.beginPath();
    ctx.moveTo(toX(1), oy);
    for (let x = 1; x <= Math.E; x += 0.05) {
      ctx.lineTo(toX(x), toY(1 / x));
    }
    ctx.lineTo(toX(Math.E), oy);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    for (let x = 0.35; x <= 4.5; x += 0.06) {
      const px = toX(x), py = toY(1 / x);
      if (x === 0.35) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#a3e635';
    ctx.fillText('1', toX(1) - 3, oy + 12);
    ctx.fillText('e', toX(Math.E) - 3, oy + 12);
    ctx.fillText('∫₁ᵉ (1/x)dx = ln(e) = 1', toX(1.3), toY(1.4));

  } else if (type === 'ln_curve_tangent') {
    // Vertical asymptote x = 0 & tangent y = x - 1
    ctx.strokeStyle = '#f43f5e';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox, H); ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(toX(-0.5), toY(-1.5));
    ctx.lineTo(toX(3.5), toY(2.5));
    ctx.stroke();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = 0.14; x <= 4.8; x += 0.07) {
      const px = toX(x), py = toY(Math.log(x));
      if (x === 0.14) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(toX(1), oy, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('y = x - 1', toX(2.4), toY(2.1));
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('ln(x) ≤ x - 1', toX(2.5), toY(0.5));

  } else if (type === 'ln_abs_both_sides') {
    // Symmetric branches ln|x|
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.3;
    for (const sgn of [1, -1]) {
      ctx.beginPath();
      for (let t = 0.16; t <= 4.2; t += 0.08) {
        const px = toX(sgn * t), py = toY(Math.log(t));
        if (t === 0.16) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.fillStyle = '#a5f3fc';
    ctx.fillText('ln(-x)', toX(-3.2), toY(1.4));
    ctx.fillText('ln(x)', toX(2.2), toY(1.4));

  } else if (type === 'exp_ln_symmetry') {
    // y = x
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.38)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(toX(-2.5), toY(-2.5)); ctx.lineTo(toX(3.0), toY(3.0)); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#cbd5e1'; ctx.fillText('y = x', toX(2.2), toY(2.4));

    // e^x
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    for (let x = -3.0; x <= 1.25; x += 0.06) {
      const px = toX(x), py = toY(Math.exp(x));
      if (x === -3.0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = '#fbbf24'; ctx.fillText('eˣ', toX(1.3), toY(2.4));

    // ln x
    ctx.strokeStyle = '#10b981';
    ctx.beginPath();
    for (let x = 0.14; x <= 4.2; x += 0.08) {
      const px = toX(x), py = toY(Math.log(x));
      if (x === 0.14) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = '#34d399'; ctx.fillText('ln(x)', toX(3.2), toY(1.4));

  } else if (type === 'exp_quad_roots') {
    // e^(2x) - 3e^x + 2 crossing 0 at 0 and ln(2)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    for (let x = -2.2; x <= 1.1; x += 0.05) {
      const ex = Math.exp(x);
      const y = ex * ex - 3 * ex + 2;
      const px = toX(x), py = toY(y);
      if (x === -2.2) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    for (const root of [{ x: 0, lbl: '0' }, { x: Math.log(2), lbl: 'ln(2)' }]) {
      ctx.fillStyle = '#34d399';
      ctx.beginPath(); ctx.arc(toX(root.x), oy, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillText(root.lbl, toX(root.x) - 4, oy + 14);
    }

  } else if (type === 'exp_tangent_bound') {
    // e^x and tangent y = x + 1
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(toX(-2.5), toY(-1.5));
    ctx.lineTo(toX(2.0), toY(3.0));
    ctx.stroke();

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = -3.2; x <= 1.15; x += 0.06) {
      const px = toX(x), py = toY(Math.exp(x));
      if (x === -3.2) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#22d3ee';
    ctx.beginPath(); ctx.arc(ox, toY(1), 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('y = x + 1', toX(1.2), toY(1.9));
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('eˣ ≥ x + 1', toX(-2.2), toY(1.2));

  } else if (type === 'growth_comparison') {
    // e^x, x^2, ln(x)
    const curves = [
      { fn: x => Math.exp(x) * 0.45, col: '#f43f5e', lbl: 'eˣ' },
      { fn: x => x * x * 0.25, col: '#fbbf24', lbl: 'xⁿ' },
      { fn: x => Math.log(Math.max(0.1, x)), col: '#10b981', lbl: 'ln x' }
    ];
    for (const c of curves) {
      ctx.strokeStyle = c.col;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let x = 0.2; x <= 3.2; x += 0.08) {
        const px = toX(x), py = toY(c.fn(x));
        if (x === 0.2) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.fillStyle = '#fda4af'; ctx.fillText('eˣ ≫ xⁿ ≫ ln(x)', toX(0.6), toY(2.2));

  } else if (type === 'ln_branch_parabolic') {
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = 0.16; x <= 5.2; x += 0.08) {
      const px = toX(x), py = toY(Math.log(x));
      if (x === 0.16) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = '#6ee7b7';
    ctx.fillText('فرع شلجمي ← (Ox)', toX(1.8), toY(1.8));
    ctx.fillText('lim (ln x)/x = 0', toX(1.8), toY(0.5));

  } else if (type === 'exp_parabolic_y') {
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = -3.0; x <= 1.2; x += 0.06) {
      const px = toX(x), py = toY(Math.exp(x));
      if (x === -3.0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = '#e9d5ff';
    ctx.fillText('فرع شلجمي ↑ (Oy)', toX(0.4), toY(2.3));
    ctx.fillText('lim eˣ/x = +∞', toX(-2.6), toY(1.2));

  } else if (type === 'log_ineq_band') {
    // Bracket: 1 - 1/x <= ln(x) <= x - 1
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(toX(-0.4), toY(-1.4));
    ctx.lineTo(toX(3.5), toY(2.5));
    ctx.stroke();

    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    for (let x = 0.34; x <= 4.8; x += 0.08) {
      const px = toX(x), py = toY(1 - 1 / x);
      if (x === 0.34) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = 0.16; x <= 4.8; x += 0.07) {
      const px = toX(x), py = toY(Math.log(x));
      if (x === 0.16) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath(); ctx.arc(toX(1), oy, 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fbbf24'; ctx.fillText('x - 1', toX(2.9), toY(2.2));
    ctx.fillStyle = '#34d399'; ctx.fillText('ln(x)', toX(3.5), toY(1.4));
    ctx.fillStyle = '#22d3ee'; ctx.fillText('1 - 1/x', toX(3.1), toY(0.45));

  } else if (type === 'exp_param_tangent') {
    // e^x vs y = ex (tangent at (1, e)) and y = mx (m > e, 2 intersections)
    const ys = 0.72;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let x = -2.8; x <= 1.55; x += 0.05) {
      const px = toX(x), py = toY(Math.exp(x) * ys);
      if (x === -2.8) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Tangent y = e*x
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(toX(-0.7), toY(-0.7 * Math.E * ys));
    ctx.lineTo(toX(1.5), toY(1.5 * Math.E * ys));
    ctx.stroke();

    // Secant y = 3.1x (m > e -> 2 roots)
    ctx.strokeStyle = '#f43f5e';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(toX(-0.6), toY(-0.6 * 3.1 * ys));
    ctx.lineTo(toX(1.35), toY(1.35 * 3.1 * ys));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#22d3ee';
    ctx.beginPath(); ctx.arc(toX(1), toY(Math.E * ys), 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('y = e·x (m=e)', toX(1.45), toY(1.9));
    ctx.fillStyle = '#fda4af';
    ctx.fillText('m > e : حلان', toX(-2.7), toY(1.8));

  } else if (type === 'ln_param_roots') {
    // g(x) = x ln(x) magnified vertically for crystal clarity on [-1/e, +inf[
    const yMul = 2.5;
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    for (let x = 0.02; x <= 2.3; x += 0.04) {
      const px = toX(x), py = toY(x * Math.log(x) * yMul);
      ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Horizontal line y = m in ]-1/e, 0[
    const mY = -0.22 * yMul;
    ctx.strokeStyle = '#fbbf24';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(toX(-0.4), toY(mY)); ctx.lineTo(toX(2.4), toY(mY)); ctx.stroke();
    ctx.setLineDash([]);

    const minX = 1 / Math.E;
    const minY = -minX * yMul;
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath(); ctx.arc(toX(minX), toY(minY), 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('m ∈ ]-1/e, 0[', toX(1.2), toY(-0.55));
    ctx.fillStyle = '#e9d5ff';
    ctx.fillText('g(x)=x·ln(x)', toX(1.5), toY(1.6));
  }
};

window.drawSequenceGraph = window.drawReactorGraph;
