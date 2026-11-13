/**
 * Math Battle: Calculus Showdown [PlayStation Edition]
 * High-DPI Canvas Renderer with Calculus Lifecycle Bar & PlayStation HUD
 */

import { ARENA, MATCH_CONFIGS, toScreenX, toScreenY } from './config.js';

export class GameRenderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  render(gameState, currentMatch, player, balls, pools, summonCurves, summonState, countdownTimer, remainingHits, totalInitialHits, frenzyMultiplier, screenShake, touchJoystick) {
    const ctx = this.ctx;

    ctx.save();
    // Screen shake on heavy impacts / Supernova
    if (screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // Pure black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Cyber Match Header (VS display)
    this.drawMatchHeader(currentMatch);

    // 2. Calculus Derivation Lifecycle Bar (Pedagogical Clarity!)
    this.drawCalculusLifecycle(currentMatch, balls);

    // 3. Cartesian Coordinate Grid Arena
    this.drawArenaGrid();

    // 4. Laser Hazards
    this.drawLaserCurves(summonCurves, summonState);

    // 5. Beams & Shockwaves
    this.drawBeams(pools.beams);
    this.drawShockwaves(pools.shockwaves);

    // 6. Mathematical Function Orbs
    this.drawBalls(balls);

    // 7. Player (d/dx Pilot)
    this.drawPlayer(player);

    // 8. Virtual Touch Joystick
    if (touchJoystick && touchJoystick.active) {
      this.drawTouchJoystick(touchJoystick);
    }

    // 9. Floating Calculus Popups & Particles
    this.drawParticles(pools.particles);
    this.drawPopups(pools.popups);

    // 10. PlayStation HUD & Action Bars
    this.drawBottomHUD(player, remainingHits, totalInitialHits, balls.length, summonState, gameState);

    // 11. Overlays (Countdown, Victory, Game Over)
    this.drawOverlays(gameState, countdownTimer, currentMatch);

    ctx.restore();
  }

  drawMatchHeader(currentMatch) {
    const ctx = this.ctx;
    const config = MATCH_CONFIGS[currentMatch] || MATCH_CONFIGS.x3;
    const px = 90, py = 75, r = 32;

    // Player Pilot Avatar (d/dx)
    ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.beginPath(); ctx.arc(px, py, r + 5, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fillStyle = '#010c14'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = '#00f0ff'; ctx.stroke();

    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = 'italic bold 18px "Cambria Math", serif';
    ctx.fillText('d', px, py - 10);
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(px - 12, py); ctx.lineTo(px + 12, py);
    ctx.strokeStyle = '#00f0ff'; ctx.stroke();
    ctx.fillText('dx', px, py + 11);

    ctx.font = '900 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText('PILOT (YOU)', px, py + r + 14);

    // Center VS
    ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('VS', 270, py);

    // Boss Function Avatar
    const bx = 450, by = 75;
    ctx.fillStyle = `${config.color}15`;
    ctx.beginPath(); ctx.arc(bx, by, r + 5, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fillStyle = '#140600'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = config.color; ctx.stroke();

    ctx.fillStyle = config.color;
    ctx.font = 'italic bold 20px "Cambria Math", serif';
    ctx.fillText(config.chain[0]?.label || config.id, bx, by);

    ctx.font = '900 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillText(config.badge, bx, by + r + 14);
  }

  /**
   * Calculus Derivation Lifecycle Bar
   * Shows the mathematical derivation ladder so the user clearly understands
   * why orbs split and where they annihilate (at 0)!
   */
  drawCalculusLifecycle(currentMatch, balls) {
    const ctx = this.ctx;
    const config = MATCH_CONFIGS[currentMatch] || MATCH_CONFIGS.x3;
    const chain = config.chain;

    const startY = 152;
    const barWidth = ARENA.width;
    const startX = ARENA.x;
    const stepWidth = barWidth / chain.length;

    ctx.save();
    // Background capsule
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(startX, startY, barWidth, 32, 6);
    ctx.fill();
    ctx.stroke();

    // Count balls per type currently alive
    const typeCounts = {};
    balls.forEach(b => {
      typeCounts[b.type] = (typeCounts[b.type] || 0) + 1;
    });

    chain.forEach((node, idx) => {
      const cx = startX + idx * stepWidth + stepWidth / 2;
      const cy = startY + 16;
      const isActive = Boolean(typeCounts[node.id] && typeCounts[node.id] > 0);
      const isTerminal = (node.id === '0' || node.id === 'overload');

      // Node text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (isActive) {
        // Glowing pill behind active stage
        ctx.fillStyle = `${node.color}30`;
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cx - stepWidth * 0.42, startY + 3, stepWidth * 0.84, 26, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Cambria Math", serif';
        const countTxt = typeCounts[node.id] > 1 ? ` (${typeCounts[node.id]})` : '';
        ctx.fillText(`${node.label}${countTxt}`, cx, cy);
      } else {
        ctx.fillStyle = isTerminal ? '#10b981' : '#64748b';
        ctx.font = isTerminal ? '900 10px -apple-system, sans-serif' : 'italic 11px "Cambria Math", serif';
        ctx.fillText(node.label, cx, cy);
      }

      // Connecting derivation arrow "->" between nodes
      if (idx < chain.length - 1) {
        const arrowX = startX + (idx + 1) * stepWidth;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.font = '900 10px -apple-system, sans-serif';
        ctx.fillText('›', arrowX, cy);
      }
    });

    ctx.restore();
  }

  drawArenaGrid() {
    const ctx = this.ctx;

    // Arena border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.0;
    ctx.strokeRect(ARENA.x, ARENA.y, ARENA.width, ARENA.height);

    // Subtle Grid lines
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1.0;
    for (let x = ARENA.xMin; x <= ARENA.xMax; x++) {
      if (x === 0) continue;
      const sx = toScreenX(x);
      ctx.moveTo(sx, ARENA.y); ctx.lineTo(sx, ARENA.y + ARENA.height);
    }
    for (let y = ARENA.yMin; y <= ARENA.yMax; y++) {
      if (y === 0) continue;
      const sy = toScreenY(y);
      ctx.moveTo(ARENA.x, sy); ctx.lineTo(ARENA.x + ARENA.width, sy);
    }
    ctx.stroke();

    // Cartesian Main Axes (x=0, y=0)
    const ox = toScreenX(0), oy = toScreenY(0);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.6;
    ctx.moveTo(ARENA.x, oy); ctx.lineTo(ARENA.x + ARENA.width, oy);
    ctx.moveTo(ox, ARENA.y + ARENA.height); ctx.lineTo(ox, ARENA.y);
    ctx.stroke();

    // Axis labels & Origin
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 12px "Cambria Math", serif';
    ctx.textAlign = 'right';
    ctx.fillText('O', ox - 6, oy + 12);
    ctx.fillText('x', ARENA.x + ARENA.width - 8, oy + 14);
    ctx.fillText('y', ox - 8, ARENA.y + 14);

    // Numerical tick marks (-4, -2, 2, 4)
    ctx.font = '10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    [-4, -2, 2, 4].forEach(val => {
      const tx = toScreenX(val);
      ctx.fillText(`${val}`, tx, oy + 12);
    });
  }

  drawLaserCurves(summonCurves, summonState) {
    if (!summonCurves || summonCurves.length === 0) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.rect(ARENA.x, ARENA.y, ARENA.width, ARENA.height);
    ctx.clip();

    const isLaser = (summonState === 'LASER');

    summonCurves.forEach(c => {
      ctx.beginPath();
      if (c.type === 'line') {
        const yL = c.m * (ARENA.xMin - c.x0) + c.y0;
        const yR = c.m * (ARENA.xMax - c.x0) + c.y0;
        ctx.moveTo(toScreenX(ARENA.xMin), toScreenY(yL));
        ctx.lineTo(toScreenX(ARENA.xMax), toScreenY(yR));
      } else if (c.type === 'parabola') {
        for (let step = 0; step <= 60; step++) {
          const mx = ARENA.xMin + (step / 60) * (ARENA.xMax - ARENA.xMin);
          const my = c.a * Math.pow(mx - c.x0, 2) + c.y0;
          const sx = toScreenX(mx), sy = toScreenY(my);
          if (step === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
      } else if (c.type === 'sine') {
        for (let step = 0; step <= 80; step++) {
          const mx = ARENA.xMin + (step / 80) * (ARENA.xMax - ARENA.xMin);
          const my = c.a * Math.sin(c.w * (mx - c.x0)) + c.y0;
          const sx = toScreenX(mx), sy = toScreenY(my);
          if (step === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
      }

      if (isLaser) {
        ctx.strokeStyle = c.color || '#ff5500';
        ctx.lineWidth = 4.5;
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(255, 85, 0, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    ctx.restore();
  }

  drawBeams(beams) {
    const ctx = this.ctx;
    beams.forEach(b => {
      if (!b.active) return;
      const sx = toScreenX(b.x), sy = toScreenY(b.y);
      const ang = Math.atan2(b.vy, b.vx);
      const len = 22;

      ctx.save();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - Math.cos(ang) * len, sy + Math.sin(ang) * len);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });
  }

  drawShockwaves(shockwaves) {
    const ctx = this.ctx;
    shockwaves.forEach(sw => {
      ctx.save();
      ctx.globalAlpha = sw.alpha;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });
  }

  drawBalls(balls) {
    const ctx = this.ctx;
    balls.forEach(b => {
      const sx = toScreenX(b.x), sy = toScreenY(b.y);

      // Outer Glow
      ctx.fillStyle = b.halo || 'rgba(255, 85, 0, 0.15)';
      ctx.beginPath(); ctx.arc(sx, sy, b.radius + 5, 0, Math.PI * 2); ctx.fill();

      // Core Circle
      ctx.beginPath(); ctx.arc(sx, sy, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0400'; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = b.color; ctx.stroke();

      // Math Label
      ctx.fillStyle = b.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `italic bold ${Math.round(b.radius * 0.9)}px "Cambria Math", serif`;
      ctx.fillText(b.label, sx, sy + 1);
    });
  }

  drawPlayer(player) {
    const ctx = this.ctx;
    const sx = toScreenX(player.x), sy = toScreenY(player.y);

    // Facing Aim Laser Pointer Cone
    ctx.save();
    const faceX = sx + Math.cos(player.facingAng) * 36;
    const faceY = sy - Math.sin(player.facingAng) * 36;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(faceX, faceY);
    ctx.stroke();
    ctx.restore();

    // Silky Trail
    if (player.trail.length > 2) {
      ctx.beginPath();
      ctx.moveTo(player.trail[0].x, player.trail[0].y);
      for (let i = 1; i < player.trail.length; i++) ctx.lineTo(player.trail[i].x, player.trail[i].y);
      ctx.strokeStyle = player.isDashing ? 'rgba(0, 240, 255, 0.9)' : 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = player.isDashing ? 5.0 : 2.0;
      ctx.stroke();
    }

    ctx.save();
    if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    ctx.fillStyle = player.isDashing ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.12)';
    ctx.beginPath(); ctx.arc(sx, sy, player.radius + 6, 0, Math.PI * 2); ctx.fill();

    ctx.beginPath(); ctx.arc(sx, sy, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#001424'; ctx.fill();
    ctx.lineWidth = player.isDashing ? 4.5 : 2.8;
    ctx.strokeStyle = '#00f0ff';
    ctx.stroke();

    // d/dx fraction
    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'italic bold 12px "Cambria Math", serif';
    ctx.fillText('d', sx, sy - 6);
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(sx - 8, sy); ctx.lineTo(sx + 8, sy);
    ctx.strokeStyle = '#00f0ff'; ctx.stroke();
    ctx.fillText('dx', sx, sy + 7);
    ctx.restore();
  }

  drawTouchJoystick(touchJoystick) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(touchJoystick.startX, touchJoystick.startY, 50, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    const stickX = touchJoystick.startX + touchJoystick.dx * 45;
    const stickY = touchJoystick.startY + touchJoystick.dy * 45;
    ctx.beginPath();
    ctx.arc(stickX, stickY, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  }

  drawParticles(particles) {
    const ctx = this.ctx;
    particles.forEach(pt => {
      if (!pt.active) return;
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      ctx.fillStyle = pt.color;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
  }

  drawPopups(popups) {
    const ctx = this.ctx;
    popups.forEach(p => {
      if (!p.active) return;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (p.isDmg) {
        ctx.font = '900 24px -apple-system, sans-serif';
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.font = 'italic bold 18px "Cambria Math", serif';
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.restore();
    });
  }

  drawBottomHUD(player, remainingHits, totalInitialHits, activeOrbsCount, summonState, gameState) {
    const ctx = this.ctx;
    const barY = 685, bw = 215, bh = 20;
    const leftX = ARENA.x;
    const hpPct = Math.max(0, player.hp / player.maxHp);

    // Player Health Bar
    ctx.fillStyle = '#111827'; ctx.fillRect(leftX, barY, bw, bh);
    ctx.fillStyle = '#00f0ff'; ctx.fillRect(leftX, barY, bw * hpPct, bh);
    ctx.fillStyle = '#000000';
    ctx.font = '900 11px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`HP: ${player.hp} / ${player.maxHp}`, leftX + bw / 2, barY + bh / 2);

    // Dash Charges & Supernova Bomb Meter
    ctx.font = '800 11px -apple-system, sans-serif';
    ctx.textAlign = 'left';

    let dashTxt = `DASH: `;
    for (let i = 0; i < player.maxDashCharges; i++) {
      dashTxt += (i < player.dashCharges ? '⚡ ' : '○ ');
    }
    ctx.fillStyle = player.dashCharges > 0 ? '#00f0ff' : '#64748b';
    ctx.fillText(dashTxt, leftX, barY + bh + 16);

    const bombReady = (player.bombEnergy >= 100);
    ctx.fillStyle = bombReady ? '#ffd700' : '#ff0055';
    const bombTxt = bombReady ? `💥 BOMB [READY]` : `💥 BOMB [${Math.floor(player.bombEnergy)}%]`;
    ctx.fillText(bombTxt, leftX + 110, barY + bh + 16);

    // Enemy Remaining Hits Bar
    const rightX = ARENA.x + ARENA.width - bw;
    const remPct = Math.max(0, remainingHits / totalInitialHits);
    ctx.fillStyle = '#111827'; ctx.fillRect(rightX, barY, bw, bh);
    ctx.fillStyle = '#ff5500'; ctx.fillRect(rightX, barY, bw * remPct, bh);
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.fillText(`DERIVATION: ${remainingHits} / ${totalInitialHits}`, rightX + bw / 2, barY + bh / 2);

    ctx.textAlign = 'right';
    if (gameState === 'COUNTDOWN') {
      ctx.fillStyle = '#64748b'; ctx.fillText('[SYSTEM: READY]', rightX + bw, barY + bh + 16);
    } else if (summonState === 'WARNING' || summonState === 'LASER') {
      ctx.fillStyle = '#ff5500'; ctx.fillText('[LASER WARNING!]', rightX + bw, barY + bh + 16);
    } else {
      ctx.fillStyle = '#94a3b8'; ctx.fillText(`[ACTIVE ORBS: ${activeOrbsCount}]`, rightX + bw, barY + bh + 16);
    }

    // PlayStation Controls Quick Guide Ribbon at bottom of canvas
    const ribbonY = 745;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fillRect(ARENA.x, ribbonY, ARENA.width, 24);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.strokeRect(ARENA.x, ribbonY, ARENA.width, 24);

    ctx.font = '800 10px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#00f0ff';
    ctx.fillText('✕ DASH', ARENA.x + 45, ribbonY + 12);

    ctx.fillStyle = '#b537f2';
    ctx.fillText('▢ BEAM', ARENA.x + 135, ribbonY + 12);

    ctx.fillStyle = '#ff007f';
    ctx.fillText('◯ LEIBNIZ BOMB', ARENA.x + 250, ribbonY + 12);

    ctx.fillStyle = '#00ff88';
    ctx.fillText('△ SLOW-MO', ARENA.x + 375, ribbonY + 12);

    ctx.fillStyle = '#64748b';
    ctx.fillText('L2/R2 BRAKE/FIRE', ARENA.x + 440, ribbonY + 12);
  }

  drawOverlays(gameState, countdownTimer, currentMatch) {
    const cx = ARENA.x + ARENA.width / 2;
    const cy = ARENA.y + ARENA.height / 2;
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    if (gameState === 'COUNTDOWN') {
      if (countdownTimer > 2.6) {
        ctx.font = '900 110px -apple-system, sans-serif'; ctx.fillStyle = '#f8fafc'; ctx.fillText('3', cx, cy);
      } else if (countdownTimer > 1.6) {
        ctx.font = '900 110px -apple-system, sans-serif'; ctx.fillStyle = '#f8fafc'; ctx.fillText('2', cx, cy);
      } else if (countdownTimer > 0.6) {
        ctx.font = '900 110px -apple-system, sans-serif'; ctx.fillStyle = '#f8fafc'; ctx.fillText('1', cx, cy);
      } else {
        ctx.font = '900 75px -apple-system, sans-serif'; ctx.fillStyle = '#00f0ff'; ctx.fillText('DIFFERENTIATE!', cx, cy);
      }
    } else if (gameState === 'VICTORY') {
      ctx.font = '900 42px -apple-system, sans-serif'; ctx.fillStyle = '#00f0ff';
      ctx.fillText('DERIVATIVE VICTORY!', cx, cy - 24);
      ctx.font = '800 18px -apple-system, sans-serif'; ctx.fillStyle = '#10b981';
      ctx.fillText('POLYNOMIAL ANNIHILATED TO 0!', cx, cy + 18);
    } else if (gameState === 'GAMEOVER') {
      ctx.font = '900 46px -apple-system, sans-serif'; ctx.fillStyle = '#ff0055';
      ctx.fillText('FUNCTION SINGULARITY', cx, cy - 24);
      ctx.font = '800 18px -apple-system, sans-serif'; ctx.fillStyle = '#94a3b8';
      ctx.fillText('PRESS [✕] TO RE-DERIVE', cx, cy + 18);
    }
    ctx.restore();
  }
}
