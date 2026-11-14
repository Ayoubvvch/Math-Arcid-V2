/**
 * Complex Plane Citadel (قلعة أرغاند) - 60 FPS Argand-Cauchy Plane Renderer & Complex Graph Plotter
 * Draws Real Axis Re(z), Imaginary Axis i·Im(z), Concentric Modulus Circles |z|=R,
 * Polar Rays, 4 Quadrant Seals (Q1..Q4), Roots-of-Unity Polygon Shield (z^n=1),
 * Live Complex Affix Vector z = x + iy, Mini-Argand Radar, and Interactive Modal Argand Plots.
 */

window.renderStriderFrame = function(ctx, viewW, viewH, state) {
  const p = state.player;
  const time = state.time;
  const W = window.SEQ_WORLD.WIDTH;
  const H = window.SEQ_WORLD.HEIGHT;
  const OX = window.SEQ_WORLD.ORIGIN_X;
  const OY = window.SEQ_WORLD.ORIGIN_Y;
  const UNIT = window.SEQ_WORLD.UNIT_PX;

  const shakeX = state.screenShake > 0.2 ? (Math.random() - 0.5) * state.screenShake : 0;
  const shakeY = state.screenShake > 0.2 ? (Math.random() - 0.5) * state.screenShake : 0;

  const camX = Math.max(0, Math.min(W - viewW, p.x - viewW * 0.5)) + shakeX;
  const camY = Math.max(0, Math.min(H - viewH, p.y - viewH * 0.5)) + shakeY;

  ctx.fillStyle = '#040714';
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.save();
  ctx.translate(-camX, -camY);

  // 1. Subtle Cartesian Grid
  const gx0 = Math.max(0, Math.floor(camX / 90) * 90);
  const gx1 = Math.min(W, camX + viewW + 90);
  const gy0 = Math.max(0, Math.floor(camY / 90) * 90);
  const gy1 = Math.min(H, camY + viewH + 90);

  ctx.strokeStyle = 'rgba(251, 191, 36, 0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = gx0; gx <= gx1; gx += 90) {
    ctx.moveTo(gx, gy0); ctx.lineTo(gx, gy1);
  }
  for (let gy = gy0; gy <= gy1; gy += 90) {
    ctx.moveTo(gx0, gy); ctx.lineTo(gx1, gy);
  }
  ctx.stroke();

  // 2. Concentric Modulus Circles |z| = 1, 2, 3, 4, 5
  for (let r = 1; r <= 5; r++) {
    const rad = r * UNIT;
    ctx.strokeStyle = r === 1 ? 'rgba(56, 189, 248, 0.34)' : 'rgba(251, 191, 36, 0.14)';
    ctx.lineWidth = r === 1 ? 2.2 : 1.2;
    ctx.beginPath();
    ctx.arc(OX, OY, rad, 0, Math.PI * 2);
    ctx.stroke();

    ctx.direction = 'ltr';
    ctx.fillStyle = r === 1 ? '#38bdf8' : 'rgba(251, 191, 36, 0.48)';
    ctx.font = '800 11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(r === 1 ? '|z| = 1 (Unit Circle)' : `|z| = ${r}`, OX + rad + 6, OY - 6);
  }

  // 3. Polar Angle Rays (k * pi / 6)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.09)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let k = 0; k < 12; k++) {
    const a = (k * Math.PI) / 6;
    ctx.moveTo(OX, OY);
    ctx.lineTo(OX + Math.cos(a) * (5.2 * UNIT), OY + Math.sin(a) * (5.2 * UNIT));
  }
  ctx.stroke();

  // 4. Real Axis Re(z) and Imaginary Axis i·Im(z)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(60, OY); ctx.lineTo(W - 60, OY);
  ctx.moveTo(OX, 60); ctx.lineTo(OX, H - 60);
  ctx.stroke();

  ctx.direction = 'ltr';
  ctx.fillStyle = '#fde68a';
  ctx.font = '800 12px monospace';
  ctx.textAlign = 'center';
  for (let u = -5; u <= 5; u++) {
    if (u === 0) continue;
    const tx = OX + u * UNIT;
    ctx.fillText(`${u}`, tx, OY + 18);
  }
  for (let v = -4; v <= 4; v++) {
    if (v === 0) continue;
    const ty = OY - v * UNIT;
    ctx.fillText(`${v}i`, OX + 22, ty + 4);
  }
  ctx.fillStyle = '#fbbf24';
  ctx.font = '900 13px monospace';
  ctx.fillText('O(0,0)', OX - 28, OY + 20);

  // 5. Live Vector OM(z) & Conjugate Reflection Chord M̄(z̄)
  const conjY = 2 * OY - p.y;
  ctx.save();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x, conjY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Conjugate Ghost Point M̄(z̄)
  if (conjY >= 60 && conjY <= H - 60) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(p.x, conjY, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#7dd3fc';
    ctx.font = '800 11px monospace';
    ctx.fillText('M̄(z̄)', p.x + 26, conjY + 4);
  }

  // Vector OM from Origin O to Player M(z)
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.42)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(OX, OY);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  ctx.restore();

  // 6. Architectural Formula Bastions
  for (const plat of state.platforms) {
    if (plat.x + plat.w < camX - 20 || plat.x > camX + viewW + 20) continue;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    ctx.strokeStyle = plat.oscAmp > 0 ? '#a855f7' : '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

    ctx.direction = 'ltr';
    ctx.fillStyle = plat.oscAmp > 0 ? '#e9d5ff' : '#fef3c7';
    ctx.font = '800 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(plat.label, plat.x + plat.w / 2, plat.y + 15);
  }

  // 7. 4 Quadrant Seals (Q1..Q4) & Orbiting Polar Hazards
  const numerals = ['Q1', 'Q2', 'Q3', 'Q4'];
  for (let idx = 0; idx < state.gates.length; idx++) {
    const g = state.gates[idx];
    if (g.x + 140 < camX || g.x - 140 > camX + viewW) continue;
    const dist = Math.hypot(g.x - p.x, g.y - p.y);

    // Draw Polar Hazard Orbit & Orb if seal not broken
    const hz = state.polarHazards[idx];
    if (!g.broken && hz) {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.28)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hz.cx, hz.cy, hz.orbitR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(hz.x, hz.y, hz.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fecdd3';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(g.x, g.y);
    if (g.broken) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, g.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.direction = 'ltr';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '800 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SOLVED', 0, 4);
    } else {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.16)';
      ctx.beginPath();
      ctx.arc(0, 0, g.radius + Math.sin(g.pulse) * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = g.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, g.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.direction = 'ltr';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(numerals[g.id] || 'ℂ', 0, -4);
      ctx.font = '700 10px monospace';
      ctx.fillStyle = '#fde68a';
      ctx.fillText(g.affix || '', 0, 12);

      if (dist <= 130) {
        ctx.direction = 'rtl';
        ctx.fillStyle = '#fbbf24';
        ctx.font = '800 12px Tahoma, sans-serif';
        ctx.fillText('[▢ / E] اختراق ختم أرغاند', 0, -g.radius - 14);
      }
    }
    ctx.restore();
  }

  // 8. Orbs
  for (const o of state.orbs) {
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.fillStyle = o.kind === 'hp' ? '#fbbf24' : '#c084fc';
    ctx.beginPath();
    ctx.arc(0, 0, o.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.direction = 'ltr';
    ctx.fillStyle = '#030712';
    ctx.font = '900 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(o.kind === 'hp' ? '|z|' : 'eⁱ', 0, 0.5);
    ctx.restore();
  }

  // 9. Projectiles
  ctx.fillStyle = '#fbbf24';
  for (const b of state.projectiles) {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 4.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#fb7185';
  for (const ep of state.enemyProjectiles) {
    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 5.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 10. Complex Anomaly Drones & Boss
  for (const d of state.drones) {
    if (d.x + 90 < camX || d.x - 90 > camX + viewW) continue;
    ctx.save();
    ctx.translate(d.x, d.y);

    const col = d.kind === 'boss' ? '#f59e0b'
      : d.kind === 'gendarme' ? '#a855f7'
      : d.kind === 'oscillator' ? '#38bdf8' : '#fb7185';

    ctx.fillStyle = d.hitFlash > 0 ? '#ffffff' : '#0f172a';
    ctx.strokeStyle = d.staggered ? '#fbbf24' : col;
    ctx.lineWidth = d.kind === 'boss' ? 4 : 2.6;

    ctx.beginPath();
    ctx.arc(0, 0, d.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.direction = 'ltr';
    ctx.fillStyle = '#f8fafc';
    ctx.font = d.kind === 'boss' ? '900 12px monospace' : '800 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.label, 0, 0);

    const bw = d.radius * 1.9;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(-bw / 2, -d.radius - 12, bw, 5);
    ctx.fillStyle = d.staggered ? '#fbbf24' : col;
    ctx.fillRect(-bw / 2, -d.radius - 12, bw * Math.max(0, d.hp / d.maxHp), 5);

    if (d.staggered) {
      ctx.direction = 'rtl';
      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 11px Tahoma, sans-serif';
      ctx.fillText('[▢ / E] تفكيك النواة', 0, -d.radius - 20);
    }
    ctx.restore();
  }

  // 11. Player M(z) Craft & Roots of Unity Polygon Shield (z^n = 1)
  ctx.save();
  ctx.translate(p.x, p.y);

  if (p.aegisTimer > 0) {
    const n = p.rootsOrder || 6;
    const shR = 54;
    ctx.strokeStyle = '#34d399';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let k = 0; k < n; k++) {
      const ang = time * 2.5 + (k * Math.PI * 2) / n;
      const vx = Math.cos(ang) * shR;
      const vy = Math.sin(ang) * shR;
      if (k === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    for (let k = 0; k < n; k++) {
      const ang = time * 2.5 + (k * Math.PI * 2) / n;
      ctx.fillStyle = '#fde68a';
      ctx.beginPath();
      ctx.arc(Math.cos(ang) * shR, Math.sin(ang) * shR, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(p.aimAngle) * 34, Math.sin(p.aimAngle) * 34);
  ctx.stroke();

  ctx.fillStyle = p.invulnTimer > 0 && Math.floor(time * 20) % 2 === 0 ? '#ffffff' : '#0b1329';
  ctx.strokeStyle = p.dashTimer > 0 ? '#fb7185' : '#fbbf24';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.direction = 'ltr';
  ctx.fillStyle = '#fef3c7';
  ctx.font = '900 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('M(z)', 0, 0.5);
  ctx.restore();

  // 12. Particles & Floating Texts
  for (const pt of state.particles) {
    ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  for (const ft of state.floatingTexts) {
    ctx.globalAlpha = Math.max(0, ft.life / ft.maxLife);
    ctx.fillStyle = ft.color;
    ctx.font = '800 13px Tahoma, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;

  ctx.restore();

  // 13. Screen-Space Telemetry Bar (z = a + bi, |z|, arg(z)) & Mini-Argand Radar
  const c = window.worldToComplex(p.x, p.y);
  const signIm = c.im >= 0 ? '+' : '-';
  const deg = Math.round((c.arg * 180) / Math.PI);
  const affixStr = `z = ${c.re.toFixed(2)} ${signIm} ${Math.abs(c.im).toFixed(2)}i   |z| = ${c.mod.toFixed(2)}   arg(z) = ${deg}°`;

  ctx.save();
  ctx.direction = 'ltr';
  const pillW = Math.min(viewW - 24, 390);
  const pillX = (viewW - pillW) / 2;
  const pillY = viewH - 68;
  ctx.fillStyle = 'rgba(8, 14, 28, 0.88)';
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
  ctx.lineWidth = 1.4;
  ctx.fillRect(pillX, pillY, pillW, 24);
  ctx.strokeRect(pillX, pillY, pillW, 24);
  ctx.fillStyle = '#fde68a';
  ctx.font = '800 11.5px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(affixStr, viewW / 2, pillY + 12);

  // Mini-Argand Radar in Top-Left / Bottom-Left
  if (viewW > 520) {
    const radSize = 86;
    const rx = 14;
    const ry = viewH - radSize - 64;
    ctx.fillStyle = 'rgba(6, 11, 24, 0.86)';
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.fillRect(rx, ry, radSize, radSize);
    ctx.strokeRect(rx, ry, radSize, radSize);

    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.moveTo(rx, ry + radSize / 2); ctx.lineTo(rx + radSize, ry + radSize / 2);
    ctx.moveTo(rx + radSize / 2, ry); ctx.lineTo(rx + radSize / 2, ry + radSize);
    ctx.stroke();

    for (const g of state.gates) {
      const gx = rx + (g.x / W) * radSize;
      const gy = ry + (g.y / H) * radSize;
      ctx.fillStyle = g.broken ? '#475569' : g.color;
      ctx.beginPath();
      ctx.arc(gx, gy, 3.8, 0, Math.PI * 2);
      ctx.fill();
    }

    const px = rx + (p.x / W) * radSize;
    const py = ry + (p.y / H) * radSize;
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(px, py, 3.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  if (state.damageFlash > 0) {
    ctx.fillStyle = `rgba(244, 63, 94, ${state.damageFlash * 0.28})`;
    ctx.fillRect(0, 0, viewW, viewH);
  }
};

/**
 * Interactive Modal Complex Plane Graph Plotter (390x185)
 */
window.drawSequenceGraph = function(canvas, graphSpec) {
  if (!canvas || !graphSpec) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.fillStyle = '#050914';
  ctx.fillRect(0, 0, W, H);
  ctx.direction = 'ltr';

  const cx = W / 2;
  const cy = H / 2;
  const scale = 34;

  const toX = x => cx + x * scale;
  const toY = y => cy - y * scale;

  // Grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = -5; gx <= 5; gx++) {
    ctx.moveTo(toX(gx), 0); ctx.lineTo(toX(gx), H);
  }
  for (let gy = -2; gy <= 2; gy++) {
    ctx.moveTo(0, toY(gy)); ctx.lineTo(W, toY(gy));
  }
  ctx.stroke();

  // Axes Re and Im
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, cy); ctx.lineTo(W, cy);
  ctx.moveTo(cx, 0); ctx.lineTo(cx, H);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '800 10px monospace';
  ctx.fillText('Re', W - 22, cy - 5);
  ctx.fillText('Im', cx + 6, 12);

  if (graphSpec.type === 'unit_trig') {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, scale * 1.8, 0, Math.PI * 2);
    ctx.stroke();

    const ang = -Math.PI / 6;
    const px = cx + Math.cos(ang) * scale * 1.8;
    const py = cy - Math.sin(ang) * scale * 1.8;
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy); ctx.lineTo(px, py);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText('M(z), θ = -π/6', px + 8, py + 12);
  } else if (graphSpec.type === 'mediatrice_ab') {
    const ax = toX(1.5), ay = toY(-0.8);
    const bx = toX(-1.0), by = toY(1.6);
    ctx.strokeStyle = '#94a3b8';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(toX(-2.5), toY(-1.6));
    ctx.lineTo(toX(3.0), toY(2.4));
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(ax, ay, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(bx, by, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('A(2-i)', ax + 6, ay + 4);
    ctx.fillText('B(-1+3i)', bx - 52, by - 6);
    ctx.fillStyle = '#34d399';
    ctx.fillText('|z - zA| = |z - zB|', toX(1.1), toY(1.9));
  } else if (graphSpec.type === 'circle_locus') {
    const ox = toX(0.8), oy = toY(0.6);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.arc(ox, oy, scale * 1.6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(ox, oy, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillText('Ω(1+2i), R=3', ox + 8, oy - 6);
  } else if (graphSpec.type === 'equilateral_abc') {
    const ax = toX(-1.2), ay = toY(-1.0);
    const bx = toX(1.6), by = toY(-1.0);
    const cx2 = toX(0.2), cy2 = toY(1.42);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx2, cy2); ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('A', ax - 12, ay + 4);
    ctx.fillText('B', bx + 6, by + 4);
    ctx.fillText('C (e^{iπ/3})', cx2 - 22, cy2 - 8);
  } else if (graphSpec.type === 'right_iso_abc') {
    const cpx = toX(-0.8), cpy = toY(-0.8);
    const apx = toX(1.5), apy = toY(-0.8);
    const bpx = toX(-0.8), bpy = toY(1.5);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.3;
    ctx.beginPath();
    ctx.moveTo(cpx, cpy); ctx.lineTo(apx, apy); ctx.lineTo(bpx, bpy); ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('C (90°)', cpx - 42, cpy + 12);
    ctx.fillText('A', apx + 6, apy + 4);
    ctx.fillText('B', bpx - 14, bpy - 4);
  } else if (graphSpec.type === 'roots_unity') {
    const R = scale * 1.75;
    ctx.strokeStyle = 'rgba(148,163,184,0.35)';
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI * 2) / 3;
      const vx = cx + Math.cos(a) * R;
      const vy = cy - Math.sin(a) * R;
      if (k === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('1', cx + R + 5, cy - 4);
    ctx.fillText('j', cx - R * 0.5 - 14, cy - R * 0.86 - 4);
    ctx.fillText('j²', cx - R * 0.5 - 16, cy + R * 0.86 + 12);
  } else if (graphSpec.type === 'rotation_center' || graphSpec.type === 'half_angle_chord') {
    const ox = toX(-0.5), oy = toY(-0.5);
    const mx = toX(1.7), my = toY(-0.5);
    const mpx = toX(-0.5), mpy = toY(1.7);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(mx, my); ctx.lineTo(ox, oy); ctx.lineTo(mpx, mpy);
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.fillText('Ω(ω)', ox - 28, oy + 14);
    ctx.fillText('M(z)', mx + 6, my + 4);
    ctx.fillText('M\'(z\') [+π/2]', mpx + 6, mpy + 4);
  }
};
