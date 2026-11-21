/**
 * Quantum Casino (كازينو الاحتمالات الكمومي) — 2D Heist Renderer & Combinatorics/Probability GraphSpecs
 * High-speed 60FPS Canvas renderer with viewport culling, zero shadowBlur,
 * zero per-frame gradients, Bullet-Time dilation visual feedback, and 10 live graphSpec diagrams.
 */

(function () {
  'use strict';

  function isVisible(wx, wy, margin, cam, halfW, halfH) {
    return (
      Math.abs(wx - cam.x) <= halfW + margin &&
      Math.abs(wy - cam.y) <= halfH + margin
    );
  }

  function drawVaultFloor(ctx, state, halfW, halfH) {
    const cam = state.camera;
    const step = 160;
    const minX = Math.max(0, Math.floor((cam.x - halfW) / step) * step);
    const maxX = Math.min(2560, Math.ceil((cam.x + halfW) / step) * step);
    const minY = Math.max(0, Math.floor((cam.y - halfH) / step) * step);
    const maxY = Math.min(1600, Math.ceil((cam.y + halfH) / step) * step);

    // Subtle emerald casino felt grid
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.09)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = minX; x <= maxX; x += step) {
      ctx.moveTo(x, minY);
      ctx.lineTo(x, maxY);
    }
    for (let y = minY; y <= maxY; y += step) {
      ctx.moveTo(minX, y);
      ctx.lineTo(maxX, y);
    }
    ctx.stroke();

    // 4 Wing felt zones
    for (let i = 0; i < state.wingZones.length; i += 1) {
      const z = state.wingZones[i];
      if (!isVisible(z.x + z.w * 0.5, z.y + z.h * 0.5, z.w * 0.6, cam, halfW, halfH)) continue;
      ctx.fillStyle = z.color;
      ctx.fillRect(z.x, z.y, z.w, z.h);
      ctx.strokeStyle = z.border;
      ctx.lineWidth = 1.6;
      ctx.strokeRect(z.x, z.y, z.w, z.h);

      ctx.direction = 'rtl';
      ctx.font = '800 13px "Cairo", sans-serif';
      ctx.fillStyle = z.border;
      ctx.textAlign = 'center';
      ctx.fillText(z.label, z.x + z.w * 0.5, z.y + 24);
    }

    // Central Roulette Sanctuary Circle at (1280, 800)
    if (isVisible(1280, 800, 220, cam, halfW, halfH)) {
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(1280, 800, 175, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.32)';
      ctx.beginPath();
      ctx.arc(1280, 800, 125, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Card suit watermarks
    ctx.direction = 'ltr';
    ctx.font = '700 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < state.floorDots.length; i += 1) {
      const d = state.floorDots[i];
      if (!isVisible(d.x, d.y, 24, cam, halfW, halfH)) continue;
      ctx.fillStyle = (d.suit === '♥' || d.suit === '♦')
        ? `rgba(244, 63, 94, ${d.alpha})`
        : `rgba(52, 211, 153, ${d.alpha})`;
      ctx.fillText(d.suit, d.x, d.y);
    }

    // Vault outer security border
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.36)';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, 2524, 1564);
  }

  function drawCoverTables(ctx, state, halfW, halfH) {
    const cam = state.camera;
    const tables = state.coverTables;
    for (let i = 0; i < tables.length; i += 1) {
      const t = tables[i];
      const cx = t.x + t.w * 0.5;
      const cy = t.y + t.h * 0.5;
      if (!isVisible(cx, cy, Math.max(t.w, t.h), cam, halfW, halfH)) continue;

      ctx.fillStyle = t.hitFlash > 0 ? '#113a2d' : '#0a251d';
      ctx.fillRect(t.x, t.y, t.w, t.h);
      ctx.strokeStyle = t.hitFlash > 0 ? '#34d399' : '#fbbf24';
      ctx.lineWidth = 2.4;
      ctx.strokeRect(t.x, t.y, t.w, t.h);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(t.x + 5, t.y + 5, t.w - 10, t.h - 10);

      ctx.direction = 'rtl';
      ctx.font = '800 11px "Cairo", sans-serif';
      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'center';
      ctx.fillText(t.label, cx, cy + 4);
    }
  }

  function drawRouletteMines(ctx, state, halfW, halfH) {
    const cam = state.camera;
    for (let i = 0; i < state.rouletteMines.length; i += 1) {
      const m = state.rouletteMines[i];
      const gate = state.gates[m.id];
      if (gate && gate.broken) continue;
      if (!isVisible(m.x, m.y, 40, cam, halfW, halfH)) continue;

      ctx.strokeStyle = 'rgba(244, 63, 94, 0.38)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(m.cx, m.cy);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawGates(ctx, state, halfW, halfH) {
    const cam = state.camera;
    const p = state.player;
    for (let i = 0; i < state.gates.length; i += 1) {
      const g = state.gates[i];
      if (!isVisible(g.x, g.y, 90, cam, halfW, halfH)) continue;

      const near = !g.broken && Math.hypot(g.x - p.x, g.y - p.y) <= 98;
      const pulse = 1 + Math.sin(state.time * 4 + g.pulse) * 0.08;

      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.strokeStyle = g.broken ? 'rgba(148, 163, 184, 0.35)' : g.color;
      ctx.lineWidth = near ? 3.5 : 2.3;
      ctx.beginPath();
      ctx.arc(0, 0, g.radius * pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = g.broken ? 'rgba(15, 23, 42, 0.55)' : 'rgba(4, 24, 18, 0.88)';
      ctx.beginPath();
      ctx.arc(0, 0, g.radius - 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.direction = 'ltr';
      ctx.font = '900 13px "JetBrains Mono", monospace';
      ctx.fillStyle = g.broken ? '#64748b' : '#fde68a';
      ctx.textAlign = 'center';
      ctx.fillText(g.broken ? 'OPEN' : g.glyph, 0, 5);

      if (near) {
        ctx.direction = 'rtl';
        ctx.font = '800 12px "Cairo", sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.fillText('[▢ / E] اختراق الخزنة', 0, -g.radius - 14);
      }
      ctx.restore();
    }
  }

  function drawOrbs(ctx, state, halfW, halfH) {
    const cam = state.camera;
    for (let i = 0; i < state.orbs.length; i += 1) {
      const o = state.orbs[i];
      if (!isVisible(o.x, o.y, 26, cam, halfW, halfH)) continue;
      const isHp = o.kind === 'hp';
      ctx.fillStyle = isHp ? '#10b981' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.direction = 'ltr';
      ctx.font = '900 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#030907';
      ctx.textAlign = 'center';
      ctx.fillText(isHp ? '+' : 'P', o.x, o.y + 4);
    }
  }

  function drawBossBeams(ctx, state) {
    for (let i = 0; i < state.bossBeams.length; i += 1) {
      const b = state.bossBeams[i];
      const x1 = b.x - Math.cos(b.angle) * 1400;
      const y1 = b.y - Math.sin(b.angle) * 1400;
      const x2 = b.x + Math.cos(b.angle) * 1400;
      const y2 = b.y + Math.sin(b.angle) * 1400;

      ctx.save();
      if (b.charge > 0) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.72)';
        ctx.lineWidth = 2.4;
        ctx.setLineDash([10, 8]);
      } else {
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 18;
        ctx.globalAlpha = 0.85;
      }
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawEnemies(ctx, state, halfW, halfH) {
    const cam = state.camera;
    for (let i = 0; i < state.enemies.length; i += 1) {
      const e = state.enemies[i];
      if (!isVisible(e.x, e.y, e.radius + 70, cam, halfW, halfH)) continue;

      ctx.save();
      ctx.translate(e.x, e.y);

      // Binomial / Markov Shield with rotating green success window p
      if (e.shieldActive) {
        const sr = e.radius + 14;
        const gap = e.shieldGapHalf || 0.5;
        ctx.strokeStyle = '#fb7185';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, sr, e.shieldAngle + gap, e.shieldAngle + Math.PI * 2 - gap);
        ctx.stroke();

        // Success arc p (green piercing window)
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.arc(0, 0, sr, e.shieldAngle - gap, e.shieldAngle + gap);
        ctx.stroke();
        ctx.setLineDash([]);

        if (e.kind === 'boss') {
          const px = Math.cos(e.shieldAngle) * (sr + 14);
          const py = Math.sin(e.shieldAngle) * (sr + 14);
          const qx = Math.cos(e.shieldAngle + Math.PI) * (sr + 14);
          const qy = Math.sin(e.shieldAngle + Math.PI) * (sr + 14);
          ctx.direction = 'ltr';
          ctx.font = '900 11px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#34d399';
          ctx.fillText('p', px, py + 4);
          ctx.fillStyle = '#fb7185';
          ctx.fillText('1-p', qx, qy + 4);
        }
      }

      const bodyColor = e.hitFlash > 0 ? '#ffffff' : e.color;
      ctx.fillStyle = 'rgba(7, 16, 13, 0.92)';
      ctx.strokeStyle = bodyColor;
      ctx.lineWidth = e.kind === 'boss' ? 3.5 : 2.3;

      if (e.kind === 'guard_card') {
        ctx.rotate(Math.sin(e.animPhase) * 0.14);
        ctx.fillRect(-15, -20, 30, 40);
        ctx.strokeRect(-15, -20, 30, 40);
      } else if (e.kind === 'turret_dice') {
        ctx.fillRect(-19, -19, 38, 38);
        ctx.strokeRect(-19, -19, 38, 38);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.direction = e.isRtl ? 'rtl' : 'ltr';
      ctx.font = e.kind === 'boss' ? '900 13px "Cairo", sans-serif' : '800 12px "JetBrains Mono", monospace';
      ctx.fillStyle = bodyColor;
      ctx.textAlign = 'center';
      ctx.fillText(e.label, 0, e.kind === 'boss' ? 5 : 4);

      // HP bar above enemy
      const bw = e.kind === 'boss' ? 110 : 40;
      const frac = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(-bw * 0.5, -e.radius - 13, bw, 5);
      ctx.fillStyle = e.staggered ? '#fde047' : '#fb7185';
      ctx.fillRect(-bw * 0.5, -e.radius - 13, bw * frac, 5);

      if (e.staggered) {
        ctx.direction = 'rtl';
        ctx.font = '800 11px "Cairo", sans-serif';
        ctx.fillStyle = '#fde047';
        ctx.fillText('[▢ / E] تصفية', 0, -e.radius - 18);
      }
      ctx.restore();
    }
  }

  function drawPlayerAgent(ctx, state) {
    const p = state.player;
    ctx.save();
    ctx.translate(p.x, p.y);

    // Bullet-Time Quantum Aura
    if (p.bulletTimeTimer > 0) {
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.6;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 14 + Math.sin(state.time * 12) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Bernoulli Jackpot expanding ring
    if (p.jackpotAnim > 0) {
      const prog = 1 - p.jackpotAnim / 0.56;
      ctx.strokeStyle = `rgba(251, 191, 36, ${1 - prog})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 30 + prog * 370, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.rotate(p.aimAngle);
    if (p.invulnTimer > 0 && Math.floor(state.time * 18) % 2 === 0) {
      ctx.globalAlpha = 0.6;
    }

    // Heist Agent Chevron / Diamond Chassis
    ctx.fillStyle = '#064e3b';
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(-14, -15);
    ctx.lineTo(-7, 0);
    ctx.lineTo(-14, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gold Quantum Core
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(2, 0, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawProjectilesAndFx(ctx, state, halfW, halfH) {
    const cam = state.camera;

    // Player Prism Chips (with glowing trail when ricocheted in Bullet-Time)
    for (let i = 0; i < state.projectiles.length; i += 1) {
      const pr = state.projectiles[i];
      if (!isVisible(pr.x, pr.y, 26, cam, halfW, halfH)) continue;
      if (pr.ricocheted && typeof pr.prevX === 'number') {
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.72)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pr.prevX, pr.prevY);
        ctx.lineTo(pr.x, pr.y);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(pr.x, pr.y);
      ctx.rotate(pr.angle);
      ctx.fillStyle = pr.ricocheted ? '#e879f9' : (pr.bounces > 0 ? '#c084fc' : '#fbbf24');
      ctx.beginPath();
      ctx.arc(0, 0, pr.ricocheted ? pr.radius + 1.2 : pr.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Enemy Projectiles
    for (let i = 0; i < state.enemyProjectiles.length; i += 1) {
      const ep = state.enemyProjectiles[i];
      if (!isVisible(ep.x, ep.y, 20, cam, halfW, halfH)) continue;
      ctx.fillStyle = ep.color || '#f43f5e';
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, ep.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#030907';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // Particles
    for (let i = 0; i < state.particles.length; i += 1) {
      const pt = state.particles[i];
      if (!isVisible(pt.x, pt.y, 16, cam, halfW, halfH)) continue;
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size * 0.5, pt.y - pt.size * 0.5, pt.size, pt.size);
    }
    ctx.globalAlpha = 1;

    // Floating Texts
    for (let i = 0; i < state.floatingTexts.length; i += 1) {
      const ft = state.floatingTexts[i];
      if (!isVisible(ft.x, ft.y, 90, cam, halfW, halfH)) continue;
      ctx.globalAlpha = Math.max(0, Math.min(1, ft.life / ft.maxLife));
      ctx.direction = ft.isRtl ? 'rtl' : 'ltr';
      ctx.font = '800 13px "Cairo", "JetBrains Mono", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawMiniRadar(ctx, viewW, viewH, state) {
    const rw = 132;
    const rh = 82;
    const rx = 14;
    const ry = viewH - rh - 76;

    ctx.save();
    ctx.fillStyle = 'rgba(3, 12, 9, 0.86)';
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeRect(rx, ry, rw, rh);

    const sx = rw / window.CASINO_WORLD.WIDTH;
    const sy = rh / window.CASINO_WORLD.HEIGHT;

    for (let i = 0; i < state.gates.length; i += 1) {
      const g = state.gates[i];
      ctx.fillStyle = g.broken ? '#475569' : '#fbbf24';
      ctx.fillRect(rx + g.x * sx - 3, ry + g.y * sy - 3, 6, 6);
    }

    for (let i = 0; i < state.enemies.length; i += 1) {
      const e = state.enemies[i];
      ctx.fillStyle = e.kind === 'boss' ? '#c084fc' : '#f43f5e';
      const sz = e.kind === 'boss' ? 5 : 2.5;
      ctx.fillRect(rx + e.x * sx - sz * 0.5, ry + e.y * sy - sz * 0.5, sz, sz);
    }

    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(rx + state.player.x * sx, ry + state.player.y * sy, 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.direction = 'ltr';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('VAULT RADAR', rx + 5, ry + 11);
    ctx.restore();
  }

  window.renderCasinoFrame = function renderCasinoFrame(ctx, viewW, viewH, state) {
    ctx.fillStyle = '#030907';
    ctx.fillRect(0, 0, viewW, viewH);

    const cam = state.camera;
    const shakeX = cam.shake > 0 ? (Math.random() - 0.5) * cam.shake : 0;
    const shakeY = cam.shake > 0 ? (Math.random() - 0.5) * cam.shake : 0;
    const zoom = cam.zoom || 1;
    const halfW = (viewW * 0.5) / zoom + 40;
    const halfH = (viewH * 0.5) / zoom + 40;

    ctx.save();
    ctx.translate(viewW * 0.5 + shakeX, viewH * 0.5 + shakeY);
    ctx.scale(zoom, zoom);
    ctx.translate(-cam.x, -cam.y);

    drawVaultFloor(ctx, state, halfW, halfH);
    drawCoverTables(ctx, state, halfW, halfH);
    drawBossBeams(ctx, state);
    drawRouletteMines(ctx, state, halfW, halfH);
    drawGates(ctx, state, halfW, halfH);
    drawOrbs(ctx, state, halfW, halfH);
    drawEnemies(ctx, state, halfW, halfH);
    drawPlayerAgent(ctx, state);
    drawProjectilesAndFx(ctx, state, halfW, halfH);

    ctx.restore();

    // Bullet-Time Quantum Chromatic Frame Border
    if (state.player.bulletTimeTimer > 0) {
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.52)';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, viewW - 8, viewH - 8);
    }
    if (state.damageFlash > 0) {
      ctx.fillStyle = `rgba(244, 63, 94, ${state.damageFlash * 0.45})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }

    drawMiniRadar(ctx, viewW, viewH, state);
  };

  /* ═══════════════════════════════════════════════════════════════
     Probability & Combinatorics GraphSpec Engine (14 Live Diagrams)
     ═══════════════════════════════════════════════════════════════ */

  function drawBall(ctx, x, y, r, fill, text) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    if (text) {
      ctx.direction = 'ltr';
      ctx.font = '800 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#030907';
      ctx.textAlign = 'center';
      ctx.fillText(text, x, y + 3.5);
    }
  }

  window.drawCasinoGraph = function drawCasinoGraph(canvas, graphSpec) {
    if (!canvas || !graphSpec) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    if (window.ArcadeCore && window.ArcadeCore.CanvasAxisKit) {
      window.ArcadeCore.CanvasAxisKit.clearWithGrid(ctx, w, h, {
        bg: '#030b08',
        gridColor: 'rgba(16, 185, 129, 0.1)',
        step: 32,
        offset: 24
      });
    } else {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#030b08';
      ctx.fillRect(0, 0, w, h);
    }

    const t = graphSpec.type;
    const cx = w * 0.5;

    if (t === 'sampling_modes_table') {
      const cols = [
        { title: 'Simultané', f: 'Cₙᵖ', sub: 'Ordre: Non', c: '#34d399', x: 68 },
        { title: 'Sans remise', f: 'Aₙᵖ', sub: 'Ordre: Oui', c: '#22d3ee', x: 195 },
        { title: 'Avec remise', f: 'nᵖ', sub: 'Répétition', c: '#fbbf24', x: 322 }
      ];
      cols.forEach((col) => {
        ctx.fillStyle = 'rgba(10, 30, 24, 0.9)';
        ctx.strokeStyle = col.c;
        ctx.lineWidth = 1.6;
        ctx.fillRect(col.x - 54, 24, 108, 120);
        ctx.strokeRect(col.x - 54, 24, 108, 120);
        ctx.direction = 'ltr';
        ctx.textAlign = 'center';
        ctx.fillStyle = col.c;
        ctx.font = '800 11px "JetBrains Mono", monospace';
        ctx.fillText(col.title, col.x, 45);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 22px "JetBrains Mono", monospace';
        ctx.fillText(col.f, col.x, 86);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '700 10px "JetBrains Mono", monospace';
        ctx.fillText(col.sub, col.x, 122);
      });
    } else if (t === 'order_coeff_slots') {
      const patterns = [
        ['R', 'R', 'N'],
        ['R', 'N', 'R'],
        ['N', 'R', 'R']
      ];
      patterns.forEach((row, rIdx) => {
        const py = 36 + rIdx * 38;
        row.forEach((ch, cIdx) => {
          const px = 110 + cIdx * 52;
          drawBall(ctx, px, py, 13, ch === 'R' ? '#f43f5e' : '#94a3b8', ch);
        });
        ctx.direction = 'ltr';
        ctx.font = '800 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fde68a';
        ctx.textAlign = 'left';
        ctx.fillText(`Cas ${rIdx + 1}: A₄²·A₅¹`, 262, py + 4);
      });
    } else if (t === 'urn_balls_draw') {
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(65, 28, 260, 114);
      const balls = [
        { x: 105, y: 65, c: '#f43f5e', l: '1' },
        { x: 155, y: 65, c: '#f43f5e', l: '3' },
        { x: 205, y: 65, c: '#f43f5e', l: '5' },
        { x: 130, y: 112, c: '#34d399', l: '2' },
        { x: 195, y: 112, c: '#34d399', l: '2' },
        { x: 260, y: 112, c: '#34d399', l: '4' }
      ];
      balls.forEach((b) => drawBall(ctx, b.x, b.y, 15, b.c, b.l));
      ctx.direction = 'ltr';
      ctx.font = '800 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fda4af';
      ctx.textAlign = 'left';
      ctx.fillText('Impaires (3)', 242, 69);
    } else if (t === 'venn_complement_union') {
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(42, 22, 306, 128);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(158, 86, 46, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(34, 211, 238, 0.2)';
      ctx.strokeStyle = '#22d3ee';
      ctx.beginPath(); ctx.arc(228, 86, 46, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.direction = 'ltr';
      ctx.font = '800 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#34d399'; ctx.fillText('A', 124, 88);
      ctx.fillStyle = '#22d3ee'; ctx.fillText('B', 262, 88);
      ctx.fillStyle = '#fde047'; ctx.fillText('A∩B', 193, 88);
      ctx.fillStyle = '#cbd5e1'; ctx.fillText('Ω', 58, 38);
    } else if (t === 'conditional_subspace') {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.ellipse(cx - 18, 86, 108, 52, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(251, 191, 36, 0.26)';
      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath(); ctx.arc(cx + 22, 86, 36, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.direction = 'ltr';
      ctx.font = '800 11.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#6ee7b7'; ctx.fillText('Univers réduit A', cx - 64, 88);
      ctx.fillStyle = '#fde047'; ctx.fillText('A∩B', cx + 22, 90);
    } else if (t === 'weighted_prob_tree') {
      const rx = 56, ry = 88;
      const m1y = 48, m2y = 128;
      ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rx, ry); ctx.lineTo(175, m1y);
      ctx.moveTo(rx, ry); ctx.lineTo(175, m2y);
      ctx.moveTo(195, m1y); ctx.lineTo(315, 30);
      ctx.moveTo(195, m1y); ctx.lineTo(315, 66);
      ctx.moveTo(195, m2y); ctx.lineTo(315, 110);
      ctx.moveTo(195, m2y); ctx.lineTo(315, 146);
      ctx.stroke();

      ctx.direction = 'ltr';
      ctx.font = '800 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fde68a';
      ctx.textAlign = 'center';
      ctx.fillText('0.6', 112, 60);
      ctx.fillText('0.4', 112, 122);
      ctx.fillStyle = '#a7f3d0';
      ctx.fillText('M₁', 185, m1y + 4);
      ctx.fillText('M₂', 185, m2y + 4);
      ctx.fillStyle = '#fb7185';
      ctx.fillText('0.05 → D', 274, 30);
      ctx.fillText('0.10 → D', 274, 110);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('0.95 → D̄', 274, 68);
      ctx.fillText('0.90 → D̄', 274, 148);
    } else if (t === 'two_urns_transfer') {
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.strokeRect(42, 34, 108, 102);
      ctx.strokeStyle = '#22d3ee';
      ctx.strokeRect(236, 34, 112, 102);
      drawBall(ctx, 72, 72, 11, '#f8fafc', 'B');
      drawBall(ctx, 104, 72, 11, '#f8fafc', 'B');
      drawBall(ctx, 128, 108, 11, '#64748b', 'N');
      drawBall(ctx, 266, 72, 11, '#f8fafc', 'B');
      drawBall(ctx, 302, 72, 11, '#64748b', 'N');
      drawBall(ctx, 326, 108, 11, '#34d399', '+1');
      ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(154, 85); ctx.lineTo(230, 85); ctx.stroke();
      ctx.fillStyle = '#34d399';
      ctx.beginPath(); ctx.moveTo(232, 85); ctx.lineTo(222, 79); ctx.lineTo(222, 91); ctx.closePath(); ctx.fill();
      ctx.direction = 'ltr'; ctx.font = '800 11px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = '#fde68a'; ctx.fillText('U₁', 96, 26);
      ctx.fillStyle = '#67e8f9'; ctx.fillText('U₂', 292, 26);
    } else if (t === 'independence_matrix') {
      ctx.strokeStyle = '#34d399'; ctx.lineWidth = 1.6;
      ctx.strokeRect(70, 28, 250, 116);
      ctx.beginPath();
      ctx.moveTo(195, 28); ctx.lineTo(195, 144);
      ctx.moveTo(70, 86); ctx.lineTo(320, 86);
      ctx.stroke();
      ctx.direction = 'ltr'; ctx.font = '800 11px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = '#fde68a'; ctx.fillText('P(A) = 1/2', 132, 56);
      ctx.fillStyle = '#22d3ee'; ctx.fillText('P(B) = 1/3', 257, 56);
      ctx.fillStyle = '#34d399'; ctx.fillText('P(A∩B) = 1/6', 132, 118);
      ctx.fillStyle = '#c084fc'; ctx.fillText('P(A)·P(B) = 1/6', 257, 118);
    } else if (t === 'random_var_pmf') {
      const bars = [
        { k: 'x=0', p: 0.1, c: '#34d399' },
        { k: 'x=1', p: 0.4, c: '#fbbf24' },
        { k: 'x=2', p: 0.3, c: '#22d3ee' },
        { k: 'x=3', p: 0.2, c: '#a855f7' }
      ];
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(58, 142); ctx.lineTo(335, 142); ctx.stroke();
      bars.forEach((b, idx) => {
        const bx = 86 + idx * 66;
        const bh = b.p * 230;
        ctx.fillStyle = b.c;
        ctx.fillRect(bx - 18, 142 - bh, 36, bh);
        ctx.direction = 'ltr'; ctx.font = '800 10.5px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff'; ctx.fillText(String(b.p), bx, 136 - bh);
        ctx.fillStyle = '#cbd5e1'; ctx.fillText(b.k, bx, 156);
      });
    } else if (t === 'variance_spread_axis') {
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(64, 116); ctx.lineTo(326, 116); ctx.stroke();
      const pts = [
        { x: 105, l: '0 (1/4)', r: 10 },
        { x: 195, l: '1 (1/2)', r: 15 },
        { x: 285, l: '2 (1/4)', r: 10 }
      ];
      pts.forEach((pt) => {
        drawBall(ctx, pt.x, 116, pt.r, '#22d3ee', '');
        ctx.direction = 'ltr'; ctx.font = '800 10.5px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillStyle = '#e2e8f0'; ctx.fillText(pt.l, pt.x, 144);
      });
      // Fulcrum E(X)=1 and spread σ
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath(); ctx.moveTo(195, 76); ctx.lineTo(185, 58); ctx.lineTo(205, 58); ctx.closePath(); ctx.fill();
      ctx.direction = 'ltr'; ctx.font = '800 11px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047'; ctx.fillText('E(X)=1 | σ=√2/2', 195, 44);
    } else if (t === 'binomial_np_solver') {
      const heights = [0.028, 0.121, 0.233, 0.267, 0.200, 0.103, 0.037, 0.009];
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(42, 140); ctx.lineTo(348, 140); ctx.stroke();
      heights.forEach((pv, k) => {
        const bx = 66 + k * 36;
        const bh = pv * 310;
        ctx.fillStyle = k === 3 ? '#fbbf24' : '#34d399';
        ctx.fillRect(bx - 11, 140 - bh, 22, bh);
        ctx.direction = 'ltr'; ctx.font = '700 9.5px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillStyle = '#cbd5e1'; ctx.fillText(String(k), bx, 154);
      });
      ctx.direction = 'ltr'; ctx.font = '800 10.5px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047'; ctx.fillText('E(X) = np = 3   |   V(X) = 2.1', cx, 26);
    } else if (t === 'bayes_reverse_partition') {
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.6;
      ctx.strokeRect(54, 30, 282, 110);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.fillRect(54, 30, 113, 110);
      ctx.fillStyle = 'rgba(34, 211, 238, 0.10)';
      ctx.fillRect(167, 30, 169, 110);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.36)';
      ctx.fillRect(54, 63, 113, 77);
      ctx.fillStyle = 'rgba(244, 63, 94, 0.32)';
      ctx.fillRect(167, 118, 169, 22);
      ctx.strokeStyle = '#fbbf24'; ctx.beginPath(); ctx.moveTo(167, 30); ctx.lineTo(167, 140); ctx.stroke();
      ctx.direction = 'ltr'; ctx.font = '800 10.5px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = '#a7f3d0'; ctx.fillText('A (0.4)', 110, 48);
      ctx.fillStyle = '#67e8f9'; ctx.fillText('Ā (0.6)', 252, 48);
      ctx.fillStyle = '#fde047'; ctx.fillText('A∩B = 0.28', 110, 105);
      ctx.fillStyle = '#fda4af'; ctx.fillText('Ā∩B = 0.12', 252, 133);
    } else if (t === 'weighted_prob_tree_param') {
      const rx = 56, ry = 88;
      const ay = 48, nay = 128;
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rx, ry); ctx.lineTo(170, ay);
      ctx.moveTo(rx, ry); ctx.lineTo(170, nay);
      ctx.moveTo(192, ay); ctx.lineTo(308, 30);
      ctx.moveTo(192, ay); ctx.lineTo(308, 66);
      ctx.moveTo(192, nay); ctx.lineTo(308, 110);
      ctx.moveTo(192, nay); ctx.lineTo(308, 146);
      ctx.stroke();
      ctx.direction = 'ltr'; ctx.font = '800 10.5px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = '#fde047'; ctx.fillText('p', 110, 60);
      ctx.fillStyle = '#cbd5e1'; ctx.fillText('1-p', 110, 122);
      ctx.fillStyle = '#34d399'; ctx.fillText('A', 181, ay + 4);
      ctx.fillStyle = '#f43f5e'; ctx.fillText('Ā', 181, nay + 4);
      ctx.fillStyle = '#fde047'; ctx.fillText('p → B', 268, 30);
      ctx.fillStyle = '#94a3b8'; ctx.fillText('1-p → B̄', 268, 68);
      ctx.fillStyle = '#38bdf8'; ctx.fillText('0.3 → B', 268, 110);
      ctx.fillStyle = '#94a3b8'; ctx.fillText('0.7 → B̄', 268, 148);
    } else if (t === 'dice_diff_grid') {
      const vals = [1, 2, 3, 4];
      const cell = 28;
      const ox = 140, oy = 32;
      for (let r = 0; r < 4; r += 1) {
        for (let c = r + 1; c < 4; c += 1) {
          const diff = Math.abs(vals[r] - vals[c]);
          const gx = ox + c * cell;
          const gy = oy + r * cell;
          ctx.fillStyle = diff === 1 ? 'rgba(16, 185, 129, 0.45)' : diff === 2 ? 'rgba(251, 191, 36, 0.32)' : 'rgba(168, 85, 247, 0.35)';
          ctx.fillRect(gx, gy, cell - 2, cell - 2);
          ctx.strokeStyle = '#34d399';
          ctx.strokeRect(gx, gy, cell - 2, cell - 2);
          ctx.direction = 'ltr'; ctx.font = '800 11px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
          ctx.fillStyle = '#ffffff'; ctx.fillText(String(diff), gx + 13, gy + 18);
        }
      }
      ctx.direction = 'ltr'; ctx.font = '800 10px "JetBrains Mono", monospace'; ctx.textAlign = 'left';
      ctx.fillStyle = '#34d399'; ctx.fillText('X = 1 : 3 paires', 42, 62);
      ctx.fillStyle = '#fbbf24'; ctx.fillText('X = 2 : 2 paires', 42, 86);
      ctx.fillStyle = '#c084fc'; ctx.fillText('X = 3 : 1 paire', 42, 110);
    } else if (t === 'binomial_n_threshold') {
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(52, 144); ctx.lineTo(344, 144); ctx.stroke();
      const yThresh = 144 - 0.90 * 112;
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(52, yThresh); ctx.lineTo(344, yThresh); ctx.stroke();
      ctx.setLineDash([]);
      ctx.direction = 'ltr'; ctx.font = '800 10px "JetBrains Mono", monospace'; ctx.fillStyle = '#fda4af'; ctx.textAlign = 'left';
      ctx.fillText('0.90', 22, yThresh + 3);
      for (let n = 5; n <= 10; n += 1) {
        const val = 1 - Math.pow(0.75, n);
        const bx = 76 + (n - 5) * 46;
        const bh = val * 112;
        ctx.fillStyle = n === 9 ? '#34d399' : n === 8 ? '#fbbf24' : '#334155';
        ctx.fillRect(bx - 13, 144 - bh, 26, bh);
        ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'center';
        ctx.fillText(`n=${n}`, bx, 158);
        if (n === 8 || n === 9) {
          ctx.fillStyle = n === 9 ? '#34d399' : '#fbbf24';
          ctx.fillText(val.toFixed(3), bx, 139 - bh);
        }
      }
    } else {
      // binomial_dist_bars B(4, 1/3)
      const probs = [16 / 81, 32 / 81, 24 / 81, 8 / 81, 1 / 81];
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(46, 142); ctx.lineTo(344, 142); ctx.stroke();
      probs.forEach((pv, k) => {
        const bx = 78 + k * 58;
        const bh = pv * 240;
        ctx.fillStyle = k === 2 ? '#fbbf24' : '#a855f7';
        ctx.fillRect(bx - 16, 142 - bh, 32, bh);
        ctx.direction = 'ltr'; ctx.font = '800 10px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillStyle = '#cbd5e1'; ctx.fillText(`k=${k}`, bx, 156);
      });
    }

    if (graphSpec.label) {
      ctx.direction = 'ltr';
      ctx.font = '700 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#a7f3d0';
      ctx.textAlign = 'center';
      ctx.fillText(graphSpec.label, cx, h - 8);
    }
  };

  window.drawSequenceGraph = window.drawCasinoGraph;
})();
