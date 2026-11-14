/**
 * Sequence Strider - 60 FPS Cyber Side-Scrolling Renderer & Suite Graph Plotter
 * Draws M/m laser boundaries, oscillating platforms, glowing Sector Gates,
 * Cobweb spirals, Squeeze Gendarmes envelopes, and Discrete Sequence plots.
 */

window.renderStriderFrame = function(ctx, viewW, viewH, state) {
  const p = state.player;
  const time = state.time;

  const shakeX = state.screenShake > 0.2 ? (Math.random() - 0.5) * state.screenShake : 0;
  const shakeY = state.screenShake > 0.2 ? (Math.random() - 0.5) * state.screenShake : 0;

  const camX = Math.max(0, Math.min(window.SEQ_WORLD.WIDTH - viewW, p.x - viewW * 0.44)) + shakeX;
  const camY = Math.max(0, Math.min(window.SEQ_WORLD.HEIGHT - viewH, p.y - viewH * 0.52)) + shakeY;

  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, viewW, viewH);

  ctx.save();
  ctx.translate(-camX, -camY);

  // Subtle geometric coordinate grid
  const gx0 = Math.max(0, Math.floor(camX / 80) * 80);
  const gx1 = Math.min(window.SEQ_WORLD.WIDTH, camX + viewW + 80);
  const gy0 = window.SEQ_WORLD.BOUND_M;
  const gy1 = window.SEQ_WORLD.BOUND_m;

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = gx0; gx <= gx1; gx += 80) {
    ctx.moveTo(gx, gy0); ctx.lineTo(gx, gy1);
  }
  for (let gy = gy0; gy <= gy1; gy += 80) {
    ctx.moveTo(gx0, gy); ctx.lineTo(gx1, gy);
  }
  ctx.stroke();

  // Upper Majorant M Ceiling & Lower Minorant m Floor Laser Barriers
  ctx.fillStyle = 'rgba(244, 63, 94, 0.16)';
  ctx.fillRect(camX, 0, viewW + 20, window.SEQ_WORLD.BOUND_M);
  ctx.fillRect(camX, window.SEQ_WORLD.BOUND_m, viewW + 20, window.SEQ_WORLD.HEIGHT - window.SEQ_WORLD.BOUND_m);

  ctx.strokeStyle = '#fb7185';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(camX, window.SEQ_WORLD.BOUND_M); ctx.lineTo(camX + viewW + 20, window.SEQ_WORLD.BOUND_M);
  ctx.moveTo(camX, window.SEQ_WORLD.BOUND_m); ctx.lineTo(camX + viewW + 20, window.SEQ_WORLD.BOUND_m);
  ctx.stroke();

  ctx.direction = 'ltr';
  ctx.fillStyle = '#fda4af';
  ctx.font = '800 12px monospace';
  ctx.textAlign = 'left';
  const upperLabelY = viewW <= 640 ? Math.max(window.SEQ_WORLD.BOUND_M + 16, camY + 98) : window.SEQ_WORLD.BOUND_M + 16;
  ctx.fillText('UPPER BOUND: y = M (Majorant)', Math.max(40, camX + 20), upperLabelY);
  ctx.fillText('LOWER BOUND: y = m (Minorant)', Math.max(40, camX + 20), window.SEQ_WORLD.BOUND_m - 10);

  // Platforms
  for (const plat of state.platforms) {
    if (plat.x + plat.w < camX - 20 || plat.x > camX + viewW + 20) continue;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    ctx.strokeStyle = plat.oscAmp > 0 ? '#a855f7' : '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

    ctx.fillStyle = plat.oscAmp > 0 ? '#d8b4fe' : '#bae6fd';
    ctx.font = '800 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(plat.label, plat.x + plat.w / 2, plat.y + 13);
  }

  // 4 Sector Gates
  const numerals = ['S1', 'S2', 'S3', 'S4'];
  for (const g of state.gates) {
    if (g.x + 80 < camX || g.x - 80 > camX + viewW) continue;
    const dist = Math.hypot(g.x - p.x, g.y - p.y);
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
      ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
      ctx.font = '800 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('OPENED', 0, 4);
    } else {
      ctx.fillStyle = 'rgba(14, 165, 233, 0.16)';
      ctx.beginPath();
      ctx.arc(0, 0, g.radius + Math.sin(g.pulse) * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = g.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, g.radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(numerals[g.id] || '∑', 0, 0);

      if (dist <= 125) {
        ctx.direction = 'rtl';
        ctx.fillStyle = '#fbbf24';
        ctx.font = '800 12px Tahoma, sans-serif';
        ctx.fillText('[▢ / E] اختراق البوابة', 0, -g.radius - 14);
      }
    }
    ctx.restore();
  }

  // Pickups
  for (const o of state.orbs) {
    ctx.save();
    ctx.translate(o.x, o.y + Math.sin(time * 5 + o.id) * 3);
    ctx.fillStyle = o.kind === 'hp' ? '#38bdf8' : '#c084fc';
    ctx.beginPath();
    ctx.arc(0, 0, o.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // Drones
  for (const d of state.drones) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.fillStyle = d.hitFlash > 0 ? '#ffffff'
      : d.kind === 'boss' ? '#4c0519'
      : d.kind === 'gendarme' ? '#064e3b'
      : d.kind === 'oscillator' ? '#4c1d95'
      : '#7f1d1d';
    ctx.beginPath();
    ctx.arc(0, 0, d.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = d.staggered ? '#fbbf24' : '#f43f5e';
    ctx.lineWidth = d.staggered ? 3 : 2;
    ctx.stroke();

    // Label
    ctx.direction = 'ltr';
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(d.kind === 'boss' ? 'f(L)=L' : d.label, 0, 0);

    // HP bar
    const bw = d.radius * 2;
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-bw / 2, -d.radius - 11, bw, 4);
    ctx.fillStyle = d.staggered ? '#fbbf24' : '#34d399';
    ctx.fillRect(-bw / 2, -d.radius - 11, bw * Math.max(0, d.hp / d.maxHp), 4);

    if (d.staggered) {
      ctx.direction = 'rtl';
      ctx.fillStyle = '#fbbf24';
      ctx.font = '800 11px Tahoma, sans-serif';
      ctx.fillText('مشلول! [▢ / E] اختراق', 0, -d.radius - 19);
    }
    ctx.restore();
  }

  // Projectiles
  for (const b of state.projectiles) {
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const ep of state.enemyProjectiles) {
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Player Strider
  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.aegisTimer > 0) {
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius + 9, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Core body
  ctx.fillStyle = p.invulnTimer > 0 && Math.floor(time * 24) % 2 === 0 ? '#bae6fd' : '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2.8;
  ctx.stroke();

  // Visor & Aim canon
  ctx.rotate(p.aimAngle);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(p.radius - 2, -3, 14, 6);
  ctx.restore();

  // Particles
  for (const pt of state.particles) {
    ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
    ctx.fillStyle = pt.color;
    ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
  }
  ctx.globalAlpha = 1;

  // Floating text
  for (const ft of state.floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, ft.life / 0.3);
    ctx.direction = 'rtl';
    ctx.fillStyle = ft.color;
    ctx.font = '900 13px Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore();

  // Damage flash vignette
  if (state.damageFlash > 0.02) {
    ctx.strokeStyle = `rgba(244, 63, 94, ${state.damageFlash * 0.6})`;
    ctx.lineWidth = 24;
    ctx.strokeRect(0, 0, viewW, viewH);
  }

  // Horizon Radar Arrow for Next Gate or Boss (shows clearly on screen edges)
  let nextTgt = state.gates.find(g => !g.broken);
  const boss = state.drones.find(d => d.kind === 'boss');
  if (boss) nextTgt = boss;
  if (nextTgt) {
    const sx = nextTgt.x - camX;
    const sy = nextTgt.y - camY;
    if (sx < 0 || sx > viewW || sy < 0 || sy > viewH) {
      const ang = Math.atan2(nextTgt.y - p.y, nextTgt.x - p.x);
      const ax = Math.max(36, Math.min(viewW - 36, viewW / 2 + Math.cos(ang) * (viewW * 0.42)));
      const ay = Math.max(76, Math.min(viewH - 76, viewH / 2 + Math.sin(ang) * (viewH * 0.34)));
      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(ang);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(11, 0); ctx.lineTo(-7, -7); ctx.lineTo(-7, 7); ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
};

/**
 * Renders Interactive Suites Numériques Graphs inside #seqGraphCanvas
 */
window.drawSequenceGraph = function(canvas, graphSpec) {
  if (!canvas || !graphSpec) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#060b16';
  ctx.fillRect(0, 0, W, H);
  ctx.direction = 'ltr';

  let xmin = -0.5, xmax = 10, ymin = -2, ymax = 5;
  if (graphSpec.type === 'fx_below_x' || graphSpec.type === 'cobweb_converge') {
    xmin = 0; xmax = 4; ymin = 0; ymax = 4;
  } else if (graphSpec.type === 'homographic_curve') {
    xmin = -0.5; xmax = 4.5; ymin = -0.5; ymax = 4.5;
  } else if (graphSpec.type === 'geo_limits') {
    xmin = 0; xmax = 12; ymin = -1.5; ymax = 5;
  } else if (graphSpec.type === 'squeeze_envelope') {
    xmin = 1; xmax = 14; ymin = 0.5; ymax = 3.5;
  }

  const toX = x => ((x - xmin) / (xmax - xmin)) * W;
  const toY = y => H - ((y - ymin) / (ymax - ymin)) * H;

  // Grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = Math.ceil(xmin); gx <= Math.floor(xmax); gx++) {
    ctx.moveTo(toX(gx), 0); ctx.lineTo(toX(gx), H);
  }
  for (let gy = Math.ceil(ymin); gy <= Math.floor(ymax); gy++) {
    ctx.moveTo(0, toY(gy)); ctx.lineTo(W, toY(gy));
  }
  ctx.stroke();

  // Axes
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ymin <= 0 && ymax >= 0) { ctx.moveTo(0, toY(0)); ctx.lineTo(W, toY(0)); }
  if (xmin <= 0 && xmax >= 0) { ctx.moveTo(toX(0), 0); ctx.lineTo(toX(0), H); }
  ctx.stroke();

  const plot = (fn, color, dashed = false) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.3;
    if (dashed) ctx.setLineDash([5, 4]);
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= 140; i++) {
      const x = xmin + ((xmax - xmin) * i) / 140;
      const y = fn(x);
      if (!Number.isFinite(y) || y < ymin - 2 || y > ymax + 2) { started = false; continue; }
      const px = toX(x), py = toY(y);
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();
  };

  if (graphSpec.type === 'bounded_scatter') {
    plot(() => 4, '#fb7185', true);
    plot(() => -1, '#fb7185', true);
    ctx.fillStyle = '#fda4af';
    ctx.font = '800 11px monospace';
    ctx.fillText('M = 4', toX(0.3), toY(4) - 5);
    ctx.fillText('m = -1', toX(0.3), toY(-1) - 5);
    for (let n = 0; n <= 9; n++) {
      const y = 1.5 + 2.1 * Math.cos(n * 1.1) * Math.pow(0.85, n);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(toX(n), toY(y), 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (graphSpec.type === 'fx_below_x') {
    plot(x => x, '#94a3b8', true);
    plot(x => 0.4 * x + 0.6, '#38bdf8');
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 11px monospace';
    ctx.fillText('y = x', toX(3.2), toY(3.4));
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('f(x) ≤ x', toX(2.6), toY(1.4));
  } else if (graphSpec.type === 'homographic_curve') {
    plot(x => x, '#94a3b8', true);
    plot(x => x > 0.25 ? (3 * x - 2) / x : NaN, '#a855f7');
    for (const r of [1, 2]) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(toX(r), toY(r), 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(String(r), toX(r) + 6, toY(r) - 6);
    }
  } else if (graphSpec.type === 'geo_limits') {
    plot(() => 3, '#34d399', true);
    ctx.fillStyle = '#34d399';
    ctx.font = '800 11px monospace';
    ctx.fillText('L = 3', toX(9.2), toY(3.25));
    for (let n = 1; n <= 11; n++) {
      const u = 3 - 5 * Math.pow(-2 / 3, n) + 4 / Math.pow(n, 1.5);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(toX(n), toY(u), 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (graphSpec.type === 'squeeze_envelope') {
    plot(x => 2 + 1 / Math.sqrt(x), '#fb7185', true);
    plot(x => 2 - 1 / Math.sqrt(x), '#fb7185', true);
    plot(() => 2, '#fbbf24', true);
    for (let n = 1; n <= 13; n++) {
      const u = 2 + Math.sin(n) / Math.sqrt(n);
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(toX(n), toY(u), 3.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fbbf24';
    ctx.font = '800 11px monospace';
    ctx.fillText('L = 2', toX(11), toY(2.15));
  } else if (graphSpec.type === 'cobweb_converge') {
    plot(x => x, '#94a3b8', true);
    const f = x => Math.sqrt(x + 2);
    plot(f, '#38bdf8');
    // Cobweb staircase from u0 = 0.5 -> L = 2
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    let u = 0.4;
    ctx.moveTo(toX(u), toY(0));
    for (let k = 0; k < 5; k++) {
      const nu = f(u);
      ctx.lineTo(toX(u), toY(nu));
      ctx.lineTo(toX(nu), toY(nu));
      u = nu;
    }
    ctx.stroke();
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(toX(2), toY(2), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 11px monospace';
    ctx.fillText('L=2', toX(2.1), toY(2.2));
  }
};
