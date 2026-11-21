/**
 * Vector Odyssey (أوديسا الفضاء المتجهي) — 2.5D Starfighter Renderer & 3D GraphSpecs
 * High-speed HTML5 Canvas renderer with viewport culling, zero shadowBlur,
 * zero per-frame gradients, 3D wireframe polyhedra, and 10 live 3D graphSpec plots.
 */

(function () {
  'use strict';

  const POLY_DEFS = {
    octa: {
      verts: [
        [1, 0, 0], [-1, 0, 0],
        [0, 1, 0], [0, -1, 0],
        [0, 0, 1], [0, 0, -1]
      ],
      edges: [
        [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 4], [4, 3], [3, 5], [5, 2]
      ]
    },
    tetra: {
      verts: [
        [1, 1, 1], [-1, -1, 1],
        [-1, 1, -1], [1, -1, -1]
      ],
      edges: [
        [0, 1], [0, 2], [0, 3],
        [1, 2], [2, 3], [3, 1]
      ]
    },
    cube: {
      verts: [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
      ],
      edges: [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
      ]
    },
    sphere: {
      verts: [
        [0, 1.15, 0], [0, -1.15, 0],
        [1, 0, 0], [0.707, 0, 0.707], [0, 0, 1], [-0.707, 0, 0.707],
        [-1, 0, 0], [-0.707, 0, -0.707], [0, 0, -1], [0.707, 0, -0.707]
      ],
      edges: [
        [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 2],
        [0, 2], [0, 4], [0, 6], [0, 8],
        [1, 2], [1, 4], [1, 6], [1, 8]
      ]
    }
  };

  // Pre-allocated scratch pool (zero per-frame allocations in 60FPS loop)
  const PROJ_POOL = Array.from({ length: 12 }, () => ({ x: 0, y: 0, z: 0 }));

  /**
   * Rotate and project a 3D point around Y and X axes into a pre-allocated target object.
   * @param {number[]} v - 3D coordinates [x, y, z].
   * @param {number} ay - Y-axis angle (rad).
   * @param {number} ax - X-axis tilt (rad).
   * @param {number} scale - World radius multiplier.
   * @param {{x: number, y: number, z: number}} out - Output scratch object.
   */
  function projectPolyVertexInto(v, ay, ax, scale, out) {
    const cosY = Math.cos(ay);
    const sinY = Math.sin(ay);
    const x1 = v[0] * cosY - v[2] * sinY;
    const z1 = v[0] * sinY + v[2] * cosY;
    const cosX = Math.cos(ax);
    const sinX = Math.sin(ax);
    const y2 = v[1] * cosX - z1 * sinX;
    const z2 = v[1] * sinX + z1 * cosX;
    const persp = 2.8 / (2.8 - z2 * 0.45);
    out.x = x1 * scale * persp;
    out.y = y2 * scale * persp;
    out.z = z2;
  }

  /**
   * Test whether a world-space bounding box overlaps the visible viewport rectangle.
   * @param {number} wx - World X coordinate.
   * @param {number} wy - World Y coordinate.
   * @param {number} margin - Frustum padding in world units.
   * @param {Object} cam - Camera object { x, y, zoom }.
   * @param {number} halfW - Half CSS viewport width in world units.
   * @param {number} halfH - Half CSS viewport height in world units.
   * @returns {boolean} True if visible inside expanded frustum.
   */
  function isVisible(wx, wy, margin, cam, halfW, halfH) {
    return (
      Math.abs(wx - cam.x) <= halfW + margin &&
      Math.abs(wy - cam.y) <= halfH + margin
    );
  }

  /**
   * Draw faint deep-space R3 isometric grid lines inside viewport bounds.
   */
  function drawSpaceGrid(ctx, cam, halfW, halfH) {
    const step = 160;
    const minX = Math.max(0, Math.floor((cam.x - halfW) / step) * step);
    const maxX = Math.min(2600, Math.ceil((cam.x + halfW) / step) * step);
    const minY = Math.max(0, Math.floor((cam.y - halfH) / step) * step);
    const maxY = Math.min(1700, Math.ceil((cam.y + halfH) / step) * step);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
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

    // Sector quadrant crosshairs & Origin O(1300, 850) triad
    if (isVisible(1300, 850, 140, cam, halfW, halfH)) {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(1300, 850);
      ctx.lineTo(1366, 850);
      ctx.moveTo(1300, 850);
      ctx.lineTo(1300, 784);
      ctx.moveTo(1300, 850);
      ctx.lineTo(1256, 894);
      ctx.stroke();

      ctx.direction = 'ltr';
      ctx.font = '700 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(186, 230, 253, 0.55)';
      ctx.textAlign = 'left';
      ctx.fillText('O(ℝ³)', 1306, 864);
      ctx.fillText('j⃗', 1370, 854);
      ctx.fillText('k⃗', 1304, 782);
      ctx.fillText('i⃗', 1244, 902);
    }

    // Sector perimeter border
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.35)';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, 2564, 1664);
  }

  /**
   * Render 2.5D parallax starfield dots clipped to visible sector.
   */
  function drawStars(ctx, state, halfW, halfH) {
    const cam = state.camera;
    const stars = state.stars;
    ctx.fillStyle = '#e2e8f0';
    for (let i = 0; i < stars.length; i += 1) {
      const s = stars[i];
      const px = s.x + (cam.x - 1300) * (1 - s.z) * 0.32;
      const py = s.y + (cam.y - 850) * (1 - s.z) * 0.32;
      if (!isVisible(px, py, 30, cam, halfW, halfH)) continue;
      ctx.globalAlpha = 0.25 + s.z * 0.55;
      ctx.fillRect(px, py, s.size, s.size);
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Render 3D rotating wireframe polyhedral space landmarks with depth cues
   * (dashed/dim back-facing edges vs crisp front edges + near-vertex dots).
   */
  function drawLandmarks3D(ctx, state, halfW, halfH) {
    const cam = state.camera;
    const list = state.landmarks3D;
    for (let i = 0; i < list.length; i += 1) {
      const lm = list[i];
      const px = lm.x + (cam.x - 1300) * (1 - lm.z * 0.004) * 0.14;
      const py = lm.y + (cam.y - 850) * (1 - lm.z * 0.004) * 0.14;
      if (!isVisible(px, py, lm.size + 48, cam, halfW, halfH)) continue;

      const def = POLY_DEFS[lm.kind] || POLY_DEFS.octa;
      const ay = state.time * lm.rotSpeed + i * 0.8;
      const ax = 0.48 + Math.sin(state.time * 0.4 + i) * 0.25;

      for (let v = 0; v < def.verts.length; v += 1) {
        projectPolyVertexInto(def.verts[v], ay, ax, lm.size, PROJ_POOL[v]);
      }

      ctx.save();
      ctx.translate(px, py);
      ctx.strokeStyle = lm.color;

      // Pass 1: Back-facing edges (zMid < 0) dashed & dim for 3D depth occlusion cue
      ctx.setLineDash([4, 4]);
      ctx.globalAlpha = 0.18;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let e = 0; e < def.edges.length; e += 1) {
        const a = PROJ_POOL[def.edges[e][0]];
        const b = PROJ_POOL[def.edges[e][1]];
        if ((a.z + b.z) * 0.5 < 0) {
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
      }
      ctx.stroke();

      // Pass 2: Front-facing edges (zMid >= 0) solid & bright
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.52;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (let e = 0; e < def.edges.length; e += 1) {
        const a = PROJ_POOL[def.edges[e][0]];
        const b = PROJ_POOL[def.edges[e][1]];
        if ((a.z + b.z) * 0.5 >= 0) {
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
        }
      }
      ctx.stroke();

      // Pass 3: Near-camera vertex nodes
      ctx.fillStyle = '#e0f2fe';
      ctx.globalAlpha = 0.42;
      for (let v = 0; v < def.verts.length; v += 1) {
        const pt = PROJ_POOL[v];
        if (pt.z > 0.25) {
          ctx.fillRect(pt.x - 1.8, pt.y - 1.8, 3.6, 3.6);
        }
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Draw laser trench structural walls and mathematical notation labels.
   */
  function drawTrenchBarriers(ctx, state, halfW, halfH) {
    const cam = state.camera;
    const bars = state.trenchBarriers;
    for (let i = 0; i < bars.length; i += 1) {
      const b = bars[i];
      const cx = (b.x1 + b.x2) * 0.5;
      const cy = (b.y1 + b.y2) * 0.5;
      const span = Math.hypot(b.x2 - b.x1, b.y2 - b.y1) * 0.5 + 40;
      if (!isVisible(cx, cy, span, cam, halfW, halfH)) continue;

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.26)';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();

      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();

      if (b.label) {
        ctx.direction = 'ltr';
        ctx.font = '700 11px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText(b.label, cx, cy - 12);
      }
    }
  }

  /**
   * Draw Boss sweeping vector telegraph and active cross-sector lasers.
   */
  function drawBossBeams(ctx, state) {
    const beams = state.bossBeams;
    for (let i = 0; i < beams.length; i += 1) {
      const bm = beams[i];
      const isLive = bm.activeTimer > 0;
      ctx.save();
      if (isLive) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
        ctx.lineWidth = 34;
      } else {
        ctx.setLineDash([12, 10]);
        ctx.strokeStyle = 'rgba(251, 113, 133, 0.65)';
        ctx.lineWidth = 3;
      }
      ctx.beginPath();
      if (bm.axis === 'x') {
        ctx.moveTo(bm.pos, 0);
        ctx.lineTo(bm.pos, 1700);
      } else {
        ctx.moveTo(0, bm.pos);
        ctx.lineTo(2600, bm.pos);
      }
      ctx.stroke();

      if (isLive) {
        ctx.strokeStyle = '#fecdd3';
        ctx.lineWidth = 6;
        ctx.stroke();
      } else if (bm.eqLabel) {
        ctx.setLineDash([]);
        ctx.direction = 'ltr';
        ctx.font = '800 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fda4af';
        ctx.textAlign = 'center';
        const lx = bm.axis === 'x' ? bm.pos + 38 : state.camera.x;
        const ly = bm.axis === 'y' ? bm.pos - 10 : state.camera.y - 60;
        ctx.fillText(bm.eqLabel, lx, ly);
      }
      ctx.restore();
    }
  }

  /**
   * Render orbital vector mines tethered to their anchor center.
   */
  function drawOrbitalHazards(ctx, state, halfW, halfH) {
    const cam = state.camera;
    const mines = state.orbitalHazards;
    for (let i = 0; i < mines.length; i += 1) {
      const m = mines[i];
      if (!isVisible(m.x, m.y, 60, cam, halfW, halfH)) continue;

      // Tether line
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.24)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(m.cx, m.cy);
      ctx.lineTo(m.x, m.y);
      ctx.stroke();

      // Rotating spike diamond
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(state.time * 3.4 + i);
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(0, -m.radius);
      ctx.lineTo(m.radius, 0);
      ctx.lineTo(0, m.radius);
      ctx.lineTo(-m.radius, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#fecdd3';
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Render the 4 Orbital Sphere Seals and interaction proximity prompt.
   */
  function drawGates(ctx, state, halfW, halfH) {
    const cam = state.camera;
    const p = state.player;
    const gates = state.gates;

    for (let i = 0; i < gates.length; i += 1) {
      const g = gates[i];
      if (!isVisible(g.x, g.y, 110, cam, halfW, halfH)) continue;

      const dist = Math.hypot(p.x - g.x, p.y - g.y);
      const near = !g.broken && dist <= 130;

      ctx.save();
      ctx.translate(g.x, g.y);

      if (g.broken) {
        ctx.strokeStyle = 'rgba(74, 222, 128, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, g.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.direction = 'ltr';
        ctx.font = '800 18px "JetBrains Mono", monospace';
        ctx.fillStyle = '#4ade80';
        ctx.textAlign = 'center';
        ctx.fillText('✓', 0, 6);
      } else {
        const pulseR = g.radius + Math.sin(state.time * 3.2 + i) * 4;
        ctx.strokeStyle = g.color;
        ctx.lineWidth = near ? 3.5 : 2.4;
        ctx.beginPath();
        ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.rotate(state.time * 0.9);
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 0, g.radius * 0.92, g.radius * 0.36, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.rotate(Math.PI * 0.5);
        ctx.beginPath();
        ctx.ellipse(0, 0, g.radius * 0.92, g.radius * 0.36, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        ctx.direction = 'ltr';
        ctx.font = '800 17px "JetBrains Mono", monospace';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.fillText(g.glyph, 0, 6);

        ctx.direction = 'rtl';
        ctx.font = '700 11px "Cairo", sans-serif';
        ctx.fillStyle = near ? '#fef08a' : '#cbd5e1';
        ctx.fillText(near ? '[□ / E] اختراق' : g.sectorName, 0, g.radius + 18);
      }
      ctx.restore();
    }
  }

  /**
   * Render repair and energy pickup orbs.
   */
  function drawOrbs(ctx, state, halfW, halfH) {
    const cam = state.camera;
    const orbs = state.orbs;
    for (let i = 0; i < orbs.length; i += 1) {
      const o = orbs[i];
      if (!isVisible(o.x, o.y, 40, cam, halfW, halfH)) continue;

      const bob = Math.sin(state.time * 4 + i) * 3;
      const isHp = o.kind === 'hp';
      ctx.fillStyle = isHp ? 'rgba(74, 222, 128, 0.24)' : 'rgba(251, 191, 36, 0.24)';
      ctx.beginPath();
      ctx.arc(o.x, o.y + bob, o.radius + 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = isHp ? '#4ade80' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(o.x, o.y + bob, o.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Render enemies, shielded cruisers, and HyperSphere Boss with Phase-3 H-window cue.
   */
  function drawEnemies(ctx, state, halfW, halfH) {
    const cam = state.camera;
    const enemies = state.enemies;

    for (let i = 0; i < enemies.length; i += 1) {
      const e = enemies[i];
      if (!isVisible(e.x, e.y, e.radius + 60, cam, halfW, halfH)) continue;

      ctx.save();
      ctx.translate(e.x, e.y);

      const baseCol = e.hitFlash > 0 ? '#ffffff' : e.color;
      if (e.kind === 'boss') {
        // Rotating sphere meridians
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.rotate(state.time * 0.7);
        ctx.beginPath();
        ctx.ellipse(0, 0, e.radius * 0.94, e.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.rotate(Math.PI * 0.5);
        ctx.beginPath();
        ctx.ellipse(0, 0, e.radius * 0.94, e.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // Core nucleus Omega
        ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : '#be123c';
        ctx.beginPath();
        ctx.arc(0, 0, e.radius * 0.52, 0, Math.PI * 2);
        ctx.fill();

        ctx.direction = 'ltr';
        ctx.font = '800 22px "JetBrains Mono", monospace';
        ctx.fillStyle = '#fff1f2';
        ctx.textAlign = 'center';
        ctx.fillText('Ω', 0, 8);
      } else {
        ctx.rotate(e.animPhase + state.time * (e.kind === 'turret_plane' ? 0.5 : 1.1));
        ctx.fillStyle = baseCol;
        ctx.beginPath();
        if (e.kind === 'cruiser_sphere') {
          ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
        } else if (e.kind === 'turret_plane') {
          ctx.rect(-e.radius * 0.85, -e.radius * 0.85, e.radius * 1.7, e.radius * 1.7);
        } else {
          ctx.moveTo(e.radius, 0);
          ctx.lineTo(-e.radius * 0.8, -e.radius * 0.72);
          ctx.lineTo(-e.radius * 0.45, 0);
          ctx.lineTo(-e.radius * 0.8, e.radius * 0.72);
          ctx.closePath();
        }
        ctx.fill();
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.restore();

      // Directional tangent-plane shield arc with vulnerable gap window H
      if (e.shieldActive) {
        const r = e.radius + 13;
        const startGap = e.shieldAngle - e.shieldGapHalf;
        const endGap = e.shieldAngle + e.shieldGapHalf;

        ctx.strokeStyle = e.kind === 'boss' && e.phase === 3 ? '#fbbf24' : '#38bdf8';
        ctx.lineWidth = e.kind === 'boss' ? 5 : 3.5;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r, endGap, startGap + Math.PI * 2);
        ctx.stroke();

        // Highlight H vulnerable gap center
        const hx = e.x + Math.cos(e.shieldAngle) * (r + 8);
        const hy = e.y + Math.sin(e.shieldAngle) * (r + 8);
        ctx.direction = 'ltr';
        ctx.font = '800 11px "JetBrains Mono", monospace';
        ctx.fillStyle = '#4ade80';
        ctx.textAlign = 'center';
        ctx.fillText('H', hx, hy + 4);
      }

      // Label + HP bar
      const barW = e.kind === 'boss' ? 110 : 50;
      const hpRatio = Math.max(0, Math.min(1, e.hp / e.maxHp));
      ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
      ctx.fillRect(e.x - barW * 0.5, e.y - e.radius - 20, barW, 6);
      ctx.fillStyle = e.kind === 'boss' ? '#f43f5e' : '#38bdf8';
      ctx.fillRect(e.x - barW * 0.5, e.y - e.radius - 20, barW * hpRatio, 6);

      ctx.direction = e.isRtl ? 'rtl' : 'ltr';
      ctx.font = '700 10.5px "Cairo", sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.textAlign = 'center';
      ctx.fillText(e.label, e.x, e.y - e.radius - 26);
    }
  }

  /**
   * Render player VECTRA-R3 starfighter, thrusters, barrel-roll ring, and Aegis shield.
   */
  function drawPlayerShip(ctx, state) {
    const p = state.player;
    const blink = p.invulnTimer > 0 && Math.floor(state.time * 18) % 2 === 0;

    ctx.save();
    ctx.translate(p.x, p.y);

    // Overdrive aura
    if (p.overdriveAnim > 0) {
      const r = 34 + (1 - p.overdriveAnim) * 260;
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.72)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Barrel-Roll Cross-Product Slash Ring
    if (p.rollTimer > 0) {
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius + 14, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Tri-Axis Cross-Product Aegis Shield
    if (p.aegisTimer > 0) {
      ctx.save();
      ctx.rotate(state.time * 2.4);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 3;
      const triR = p.radius + 17;
      ctx.beginPath();
      for (let k = 0; k < 3; k += 1) {
        const ang = (k * Math.PI * 2) / 3;
        const tx = Math.cos(ang) * triR;
        const ty = Math.sin(ang) * triR;
        if (k === 0) ctx.moveTo(tx, ty);
        else ctx.lineTo(tx, ty);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    if (!blink) {
      ctx.rotate(p.shipAngle);

      // Thruster flame
      const speed = Math.hypot(p.vx, p.vy);
      if (speed > 28) {
        const flameLen = 14 + Math.min(26, speed * 0.045) + Math.sin(state.time * 40) * 3;
        ctx.fillStyle = p.boostCooldown > 0.35 ? '#fbbf24' : '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(-14, -6);
        ctx.lineTo(-14 - flameLen, 0);
        ctx.lineTo(-14, 6);
        ctx.closePath();
        ctx.fill();
      }

      // Main Delta Wing Starfighter Hull
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(22, 0);
      ctx.lineTo(-10, -17);
      ctx.lineTo(-17, -11);
      ctx.lineTo(-12, 0);
      ctx.lineTo(-17, 11);
      ctx.lineTo(-10, 17);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing canopy core
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.ellipse(4, 0, 8, 3.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Independent aim turret reticle direction tick
    ctx.restore();
    const ax = p.x + Math.cos(p.aimAngle) * 38;
    const ay = p.y + Math.sin(p.aimAngle) * 38;
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.72)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * Render player and enemy projectiles, particles, and floating feedback labels.
   */
  function drawProjectilesAndFx(ctx, state, halfW, halfH) {
    const cam = state.camera;

    // Player railgun bolts
    for (let i = 0; i < state.projectiles.length; i += 1) {
      const pr = state.projectiles[i];
      if (!isVisible(pr.x, pr.y, 40, cam, halfW, halfH)) continue;
      ctx.strokeStyle = pr.color || '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pr.x, pr.y);
      ctx.lineTo(pr.x - pr.vx * 0.025, pr.y - pr.vy * 0.025);
      ctx.stroke();
    }

    // Enemy bolts
    for (let i = 0; i < state.enemyProjectiles.length; i += 1) {
      const ep = state.enemyProjectiles[i];
      if (!isVisible(ep.x, ep.y, 35, cam, halfW, halfH)) continue;
      ctx.fillStyle = ep.color || '#f43f5e';
      ctx.beginPath();
      ctx.arc(ep.x, ep.y, ep.radius || 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Particles
    for (let i = 0; i < state.particles.length; i += 1) {
      const pt = state.particles[i];
      if (!isVisible(pt.x, pt.y, 30, cam, halfW, halfH)) continue;
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size * 0.5, pt.y - pt.size * 0.5, pt.size, pt.size);
    }
    ctx.globalAlpha = 1;

    // Floating combat texts
    ctx.textAlign = 'center';
    for (let i = 0; i < state.floatingTexts.length; i += 1) {
      const ft = state.floatingTexts[i];
      if (!isVisible(ft.x, ft.y, 120, cam, halfW, halfH)) continue;
      ctx.globalAlpha = Math.max(0, Math.min(1, ft.life / ft.maxLife));
      ctx.direction = ft.isRtl ? 'rtl' : 'ltr';
      ctx.font = '800 13px "Cairo", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;
  }

  /**
   * Render compact bottom-left Space Mini-Radar showing ship, unbroken seals, and boss.
   */
  function drawMiniRadar(ctx, viewW, viewH, state) {
    const rw = 142;
    const rh = 94;
    const rx = 14;
    const ry = viewH - rh - 86;
    if (viewW < 640) return;

    ctx.save();
    ctx.fillStyle = 'rgba(4, 8, 22, 0.82)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.4;
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeRect(rx, ry, rw, rh);

    const sx = rw / 2600;
    const sy = rh / 1700;

    // Unbroken gates
    for (let i = 0; i < state.gates.length; i += 1) {
      const g = state.gates[i];
      ctx.fillStyle = g.broken ? '#4ade80' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(rx + g.x * sx, ry + g.y * sy, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Enemies & Boss
    for (let i = 0; i < state.enemies.length; i += 1) {
      const e = state.enemies[i];
      ctx.fillStyle = e.kind === 'boss' ? '#f43f5e' : '#fb7185';
      const r = e.kind === 'boss' ? 4.4 : 2.1;
      ctx.fillRect(rx + e.x * sx - r * 0.5, ry + e.y * sy - r * 0.5, r, r);
    }

    // Player dot
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(rx + state.player.x * sx, ry + state.player.y * sy, 3.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.direction = 'ltr';
    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('R3 RADAR', rx + 6, ry + 11);
    ctx.restore();
  }

  /**
   * Main 60FPS render entry point called from game.js requestAnimationFrame loop.
   * @param {CanvasRenderingContext2D} ctx - Scaled 2D context.
   * @param {number} viewW - Viewport CSS width.
   * @param {number} viewH - Viewport CSS height.
   * @param {Object} state - World state object.
   */
  window.renderOdysseyFrame = function renderOdysseyFrame(ctx, viewW, viewH, state) {
    ctx.fillStyle = '#040712';
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

    drawSpaceGrid(ctx, cam, halfW, halfH);
    drawStars(ctx, state, halfW, halfH);
    drawLandmarks3D(ctx, state, halfW, halfH);
    drawTrenchBarriers(ctx, state, halfW, halfH);
    drawBossBeams(ctx, state);
    drawOrbitalHazards(ctx, state, halfW, halfH);
    drawGates(ctx, state, halfW, halfH);
    drawOrbs(ctx, state, halfW, halfH);
    drawEnemies(ctx, state, halfW, halfH);
    drawPlayerShip(ctx, state);
    drawProjectilesAndFx(ctx, state, halfW, halfH);

    ctx.restore();
    drawMiniRadar(ctx, viewW, viewH, state);
  };

  /* ═══════════════════════════════════════════════════════════════
     3D GraphSpec Engine — Renders all 10 R3 Topic Diagrams in Override Modal
     ═══════════════════════════════════════════════════════════════ */

  /**
   * Draw an arrowed vector segment from (x1,y1) to (x2,y2) with optional label.
   */
  function drawVectorArrow(ctx, x1, y1, x2, y2, color, label, lx, ly) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(ang - 0.42) * 9, y2 - Math.sin(ang - 0.42) * 9);
    ctx.lineTo(x2 - Math.cos(ang + 0.42) * 9, y2 - Math.sin(ang + 0.42) * 9);
    ctx.closePath();
    ctx.fill();

    if (label) {
      ctx.direction = 'ltr';
      ctx.font = '800 11.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, lx ?? (x1 + x2) * 0.5 + 10, ly ?? (y1 + y2) * 0.5 - 6);
    }
  }

  /**
   * Draw a tilted 3D parallelogram representing plane (P).
   */
  function drawTiltedPlane(ctx, cx, cy, w, h, label) {
    const dx = w * 0.5;
    const dy = h * 0.5;
    const skew = 34;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.72)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx - dx + skew, cy - dy);
    ctx.lineTo(cx + dx + skew, cy - dy);
    ctx.lineTo(cx + dx - skew, cy + dy);
    ctx.lineTo(cx - dx - skew, cy + dy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (label) {
      ctx.direction = 'ltr';
      ctx.font = '800 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#7dd3fc';
      ctx.textAlign = 'right';
      ctx.fillText(label, cx + dx + skew - 8, cy - dy + 14);
    }
  }

  /**
   * Draw a labeled point marker on the diagram canvas.
   */
  function drawDot(ctx, x, y, color, label, ox, oy) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    if (label) {
      ctx.direction = 'ltr';
      ctx.font = '800 11px "JetBrains Mono", monospace';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(label, x + (ox || 0), y + (oy || -8));
    }
  }

  /**
   * Draw a 3D wireframe sphere with front-solid / back-dashed equator and meridian arcs.
   */
  function drawSphereWireframe(ctx, cx, cy, r, color) {
    ctx.fillStyle = 'rgba(167, 139, 250, 0.11)';
    ctx.strokeStyle = color || '#a78bfa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Back-half equator (dashed for 3D depth)
    ctx.strokeStyle = 'rgba(196, 181, 253, 0.4)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.34, 0, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Front-half equator (solid & brighter)
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(221, 214, 254, 0.72)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.34, 0, 0, Math.PI);
    ctx.stroke();
  }

  /**
   * Render interactive 3D Euclidean space geometry diagrams for Override Challenge Modal.
   * Exported as both window.drawOdysseyGraph and window.drawSequenceGraph.
   * @param {HTMLCanvasElement} canvas - Target <canvas> inside #seqGraphWrap.
   * @param {Object} graphSpec - Curriculum specification { type, label }.
   */
  window.drawOdysseyGraph = function drawOdysseyGraph(canvas, graphSpec) {
    if (!canvas || !graphSpec) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    if (window.ArcadeCore && window.ArcadeCore.CanvasAxisKit) {
      window.ArcadeCore.CanvasAxisKit.clearWithGrid(ctx, w, h, {
        bg: '#060c1f',
        gridColor: 'rgba(56, 189, 248, 0.1)',
        step: 32,
        offset: 24
      });
    } else {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#060c1f';
      ctx.fillRect(0, 0, w, h);
    }

    const cx = w * 0.5;
    const cy = h * 0.58;
    const t = graphSpec.type;

    if (t === 'plane_normal_3d') {
      drawTiltedPlane(ctx, cx, cy + 12, 230, 56, '(P)');
      drawDot(ctx, cx - 42, cy + 16, '#f8fafc', 'A', -10, 15);
      drawVectorArrow(ctx, cx + 10, cy + 8, cx + 10, cy - 64, '#fbbf24', 'n', cx + 24, cy - 36);
      drawDot(ctx, cx + 10, cy + 8, '#fbbf24', '⊥', 10, 0);
    } else if (t === 'dist_point_plane_3d') {
      drawTiltedPlane(ctx, cx, cy + 20, 240, 52, '(P)');
      drawDot(ctx, cx - 10, cy - 58, '#4ade80', 'A', -14, -4);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 58);
      ctx.lineTo(cx - 10, cy + 18);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeRect(cx - 10, cy + 9, 9, 9);
      drawDot(ctx, cx - 10, cy + 18, '#fbbf24', 'H', -12, 14);
      ctx.direction = 'ltr';
      ctx.font = '800 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'left';
      ctx.fillText('d(A,(P)) = AH', cx + 4, cy - 20);
    } else if (t === 'line_plane_intersect_3d') {
      drawTiltedPlane(ctx, cx, cy + 14, 240, 52, '(P)');
      drawVectorArrow(ctx, cx - 80, cy - 56, cx + 90, cy + 48, '#f472b6', '(D)', cx - 72, cy - 38);
      drawDot(ctx, cx + 14, cy + 8, '#fbbf24', 'H = (D)∩(P)', 56, -8);
    } else if (t === 'cross_product_3d') {
      drawTiltedPlane(ctx, cx, cy + 20, 210, 52, 'Plan(u,v)');
      drawVectorArrow(ctx, cx - 36, cy + 20, cx + 62, cy + 20, '#38bdf8', 'u', cx + 32, cy + 35);
      drawVectorArrow(ctx, cx - 36, cy + 20, cx + 18, cy - 12, '#4ade80', 'v', cx - 12, cy - 4);
      drawVectorArrow(ctx, cx - 36, cy + 20, cx - 36, cy - 66, '#fbbf24', 'u ∧ v', cx - 64, cy - 44);
    } else if (t === 'dist_point_line_3d') {
      drawVectorArrow(ctx, cx - 120, cy + 26, cx + 125, cy + 26, '#38bdf8', '(D), u', cx + 88, cy + 44);
      drawDot(ctx, cx - 60, cy + 26, '#cbd5e1', 'A', -6, 16);
      drawDot(ctx, cx + 32, cy - 48, '#fb7185', 'M', 12, -4);
      drawVectorArrow(ctx, cx - 60, cy + 26, cx + 32, cy - 48, '#a78bfa', 'AM', cx - 26, cy - 22);
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(cx + 32, cy - 48);
      ctx.lineTo(cx + 32, cy + 26);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.direction = 'ltr';
      ctx.fillStyle = '#fbbf24';
      ctx.textAlign = 'left';
      ctx.fillText('d = ||AM∧u||/||u||', cx + 40, cy - 10);
    } else if (t === 'sphere_center_3d') {
      drawSphereWireframe(ctx, cx, cy - 14, 58, '#a78bfa');
      drawDot(ctx, cx, cy - 14, '#fbbf24', 'Ω', -12, -6);
      drawVectorArrow(ctx, cx, cy - 14, cx + 46, cy - 44, '#38bdf8', 'R', cx + 22, cy - 36);
      drawDot(ctx, cx + 46, cy - 44, '#4ade80', 'M ∈ (S)', 32, -2);
    } else if (t === 'sphere_diameter_3d') {
      drawSphereWireframe(ctx, cx, cy - 14, 58, '#38bdf8');
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 52, cy + 8);
      ctx.lineTo(cx + 52, cy - 36);
      ctx.stroke();
      drawDot(ctx, cx - 52, cy + 8, '#4ade80', 'A', -12, 12);
      drawDot(ctx, cx + 52, cy - 36, '#4ade80', 'B', 12, -6);
      drawDot(ctx, cx, cy - 14, '#fbbf24', 'Ω', -8, -10);
    } else if (t === 'sphere_plane_tan_3d') {
      drawTiltedPlane(ctx, cx, cy + 32, 240, 42, '(P)');
      drawSphereWireframe(ctx, cx, cy - 22, 50, '#fb7185');
      drawDot(ctx, cx, cy - 22, '#fbbf24', 'Ω', -14, -4);
      drawVectorArrow(ctx, cx, cy - 22, cx, cy + 28, '#4ade80', 'R = d', cx + 26, cy + 2);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(cx, cy + 19, 8, 8);
      drawDot(ctx, cx, cy + 28, '#4ade80', 'H', -12, 13);
    } else if (t === 'sphere_plane_circle_3d') {
      drawSphereWireframe(ctx, cx, cy - 16, 62, '#38bdf8');
      drawTiltedPlane(ctx, cx, cy + 12, 244, 44, '(P)');
      // Back half of intersection circle (dashed)
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.ellipse(cx, cy + 12, 46, 15, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      // Front half of intersection circle (solid)
      ctx.setLineDash([]);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 12, 46, 15, 0, 0, Math.PI);
      ctx.stroke();

      drawDot(ctx, cx, cy - 16, '#fbbf24', 'Ω', -14, -6);
      drawDot(ctx, cx, cy + 12, '#4ade80', 'H', -12, 12);
      drawDot(ctx, cx + 46, cy + 12, '#38bdf8', 'M', 12, 4);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 16);
      ctx.lineTo(cx, cy + 12);
      ctx.lineTo(cx + 46, cy + 12);
      ctx.closePath();
      ctx.stroke();
      ctx.strokeRect(cx, cy + 4, 8, 8);
      ctx.direction = 'ltr';
      ctx.font = '800 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#fde047';
      ctx.textAlign = 'left';
      ctx.fillText('r² = R² - d²', cx + 58, cy - 8);
    } else if (t === 'sphere_tangent_plane_param_3d') {
      // Twin parallel tangent planes on both sides of sphere (d(Ω, P_m) = R)
      drawTiltedPlane(ctx, cx, cy - 52, 224, 34, '(P_m1)');
      drawSphereWireframe(ctx, cx, cy - 4, 46, '#fb7185');
      drawTiltedPlane(ctx, cx, cy + 44, 224, 34, '(P_m2)');
      drawDot(ctx, cx, cy - 4, '#fbbf24', 'Ω', -14, -4);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 50);
      ctx.lineTo(cx, cy + 42);
      ctx.stroke();
      ctx.setLineDash([]);
      drawDot(ctx, cx, cy - 50, '#4ade80', 'H₁', 14, -2);
      drawDot(ctx, cx, cy + 42, '#4ade80', 'H₂', 14, 12);
      drawVectorArrow(ctx, cx + 52, cy - 4, cx + 52, cy - 40, '#38bdf8', 'n⃗', cx + 66, cy - 22);
    } else if (t === 'sphere_circle_param_3d') {
      // Twin parallel secant planes cutting circle (C) of radius r
      drawSphereWireframe(ctx, cx, cy - 6, 56, '#38bdf8');
      drawTiltedPlane(ctx, cx, cy - 34, 224, 30, '(P_k1)');
      drawTiltedPlane(ctx, cx, cy + 22, 224, 30, '(P_k2)');
      for (const py of [cy - 34, cy + 22]) {
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, py, 38, 11, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      drawDot(ctx, cx, cy - 6, '#fbbf24', 'Ω', -14, 4);
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 6);
      ctx.lineTo(cx, cy + 22);
      ctx.lineTo(cx + 38, cy + 22);
      ctx.stroke();
      drawDot(ctx, cx, cy + 22, '#4ade80', 'H', -12, 12);
    } else if (t === 'sphere_line_dist_3d') {
      drawSphereWireframe(ctx, cx - 12, cy - 10, 56, '#a78bfa');
      drawVectorArrow(ctx, cx - 120, cy + 14, cx + 115, cy - 44, '#38bdf8', '(D), u⃗', cx + 92, cy - 50);
      drawDot(ctx, cx - 12, cy - 10, '#fbbf24', 'Ω', -14, 8);
      drawDot(ctx, cx - 64, cy, '#cbd5e1', 'A', -10, 14);
      drawDot(ctx, cx - 4, cy - 15, '#4ade80', 'H', 10, 12);
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 10);
      ctx.lineTo(cx - 4, cy - 15);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.direction = 'ltr';
      ctx.font = '800 10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'left';
      ctx.fillText('d(Ω,(D)) < R ⇒ 2 pts', cx + 32, cy + 36);
    } else if (t === 'tetrahedron_volume_3d') {
      const ax = cx - 72;
      const ay = cy + 30;
      const bx = cx + 68;
      const by = cy + 36;
      const cxp = cx + 18;
      const cyp = cy + 6;
      const dx = cx - 4;
      const dy = cy - 58;
      // Shaded base triangle ABC
      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.lineTo(cxp, cyp);
      ctx.closePath();
      ctx.fill();
      // Back edge AC dashed
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(cxp, cyp);
      ctx.stroke();
      // Front edges solid
      ctx.setLineDash([]);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.lineTo(cxp, cyp);
      ctx.moveTo(dx, dy);
      ctx.lineTo(ax, ay);
      ctx.moveTo(dx, dy);
      ctx.lineTo(bx, by);
      ctx.moveTo(dx, dy);
      ctx.lineTo(cxp, cyp);
      ctx.stroke();
      // Altitude h = d(D, ABC)
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx, cy + 24);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeRect(dx, cy + 16, 7, 7);
      drawDot(ctx, ax, ay, '#f8fafc', 'A', -10, 12);
      drawDot(ctx, bx, by, '#f8fafc', 'B', 10, 12);
      drawDot(ctx, cxp, cyp, '#cbd5e1', 'C', 14, -4);
      drawDot(ctx, dx, dy, '#fbbf24', 'D', -12, -4);
      drawVectorArrow(ctx, dx + 38, cy + 22, dx + 38, cy - 26, '#4ade80', 'AB∧AC', dx + 68, cy - 8);
    } else {
      // sphere_line_3d
      drawSphereWireframe(ctx, cx, cy - 16, 56, '#a78bfa');
      drawVectorArrow(ctx, cx - 105, cy - 2, cx + 115, cy - 42, '#38bdf8', '(D)', cx + 96, cy - 48);
      drawDot(ctx, cx - 50, cy - 12, '#4ade80', 'E', -10, -10);
      drawDot(ctx, cx + 48, cy - 30, '#4ade80', 'F', 8, -10);
      drawDot(ctx, cx, cy - 16, '#fbbf24', 'Ω', -10, 14);
    }

    // Bottom caption label
    if (graphSpec.label) {
      ctx.direction = 'ltr';
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.fillText(graphSpec.label, cx, h - 9);
    }
  };

  window.drawSequenceGraph = window.drawOdysseyGraph;
})();
