/**
 * Math Battle: Calculus Showdown [PlayStation Edition]
 * Fast Square Arena Canvas Renderer (Zero shadowBlur lag, crisp 1:1 math plane)
 */

import { ARENA, toScreenX, toScreenY } from './config.js';

export class GameRenderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
  }

  render(gameState, player, balls, pools, summonCurves, summonState, countdownTimer, screenShake, touchJoystick, slowMoTimer) {
    const ctx = this.ctx;

    ctx.save();
    if (screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // Pure deep OLED background
    ctx.fillStyle = '#04070f';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Cartesian Coordinate Grid Arena
    this.drawArenaGrid(slowMoTimer > 0);

    // 2. Laser Hazards
    this.drawLaserCurves(summonCurves, summonState);

    // 3. Beams & Shockwaves
    this.drawBeams(pools.beams);
    this.drawShockwaves(pools.shockwaves);

    // 4. Mathematical Function Orbs
    this.drawBalls(balls);

    // 5. Player (d/dx Pilot)
    this.drawPlayer(player, slowMoTimer > 0);

    // 6. Virtual Touch Joystick
    if (touchJoystick && touchJoystick.active) {
      this.drawTouchJoystick(touchJoystick);
    }

    // 7. Floating Calculus Popups & Particles
    this.drawParticles(pools.particles);
    this.drawPopups(pools.popups);

    // 8. Countdown Overlay inside Arena
    if (gameState === 'COUNTDOWN') {
      this.drawCountdownOverlay(countdownTimer);
    }

    ctx.restore();
  }

  drawArenaGrid(isSlowMo) {
    const ctx = this.ctx;

    // Arena fill
    ctx.fillStyle = isSlowMo ? '#031217' : '#050811';
    ctx.fillRect(ARENA.x, ARENA.y, ARENA.width, ARENA.height);

    // Arena border
    ctx.strokeStyle = isSlowMo ? '#00ff88' : '#00f0ff';
    ctx.lineWidth = 2.0;
    ctx.strokeRect(ARENA.x, ARENA.y, ARENA.width, ARENA.height);

    // Grid lines
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1.0;
    for (let x = ARENA.xMin; x <= ARENA.xMax; x++) {
      if (x === 0) continue;
      const sx = toScreenX(x);
      ctx.moveTo(sx, ARENA.y);
      ctx.lineTo(sx, ARENA.y + ARENA.height);
    }
    for (let y = ARENA.yMin; y <= ARENA.yMax; y++) {
      if (y === 0) continue;
      const sy = toScreenY(y);
      ctx.moveTo(ARENA.x, sy);
      ctx.lineTo(ARENA.x + ARENA.width, sy);
    }
    ctx.stroke();

    // Cartesian Main Axes (x=0, y=0)
    const ox = toScreenX(0), oy = toScreenY(0);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.lineWidth = 1.6;
    ctx.moveTo(ARENA.x, oy);
    ctx.lineTo(ARENA.x + ARENA.width, oy);
    ctx.moveTo(ox, ARENA.y + ARENA.height);
    ctx.lineTo(ox, ARENA.y);
    ctx.stroke();

    // Axis labels & Origin
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 13px "Cambria Math", Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText('O', ox - 7, oy + 14);
    ctx.fillText('x', ARENA.x + ARENA.width - 10, oy + 16);
    ctx.fillText('y', ox - 9, ARENA.y + 16);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    [-4, -2, 2, 4].forEach(val => {
      ctx.fillText(`${val}`, toScreenX(val), oy + 14);
      ctx.fillText(`${val}`, ox - 14, toScreenY(val) + 4);
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
        for (let step = 0; step <= 70; step++) {
          const mx = ARENA.xMin + (step / 70) * (ARENA.xMax - ARENA.xMin);
          const my = c.a * Math.sin(c.w * (mx - c.x0)) + c.y0;
          const sx = toScreenX(mx), sy = toScreenY(my);
          if (step === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
      }

      if (isLaser) {
        ctx.strokeStyle = c.color || '#ff5500';
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.strokeStyle = c.color ? 'rgba(255, 130, 0, 0.55)' : 'rgba(255, 85, 0, 0.5)';
        ctx.lineWidth = 1.6;
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
      const len = 24;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - Math.cos(ang) * len, sy + Math.sin(ang) * len);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    });
  }

  drawShockwaves(shockwaves) {
    const ctx = this.ctx;
    shockwaves.forEach(sw => {
      ctx.save();
      ctx.globalAlpha = sw.alpha;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
  }

  drawBalls(balls) {
    const ctx = this.ctx;
    balls.forEach(b => {
      const sx = toScreenX(b.x), sy = toScreenY(b.y);

      ctx.fillStyle = b.halo || 'rgba(255, 85, 0, 0.22)';
      ctx.beginPath();
      ctx.arc(sx, sy, b.radius + 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(sx, sy, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0712';
      ctx.fill();
      ctx.lineWidth = 2.6;
      ctx.strokeStyle = b.color;
      ctx.stroke();

      ctx.fillStyle = b.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `italic bold ${Math.max(13, Math.round(b.radius * 0.85))}px "Cambria Math", Georgia, serif`;
      ctx.fillText(b.label, sx, sy + 1);
    });
  }

  drawPlayer(player, isSlowMo) {
    const ctx = this.ctx;
    const sx = toScreenX(player.x), sy = toScreenY(player.y);

    // Facing Aim Laser Pointer
    const faceX = sx + Math.cos(player.facingAng) * 44;
    const faceY = sy - Math.sin(player.facingAng) * 44;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(faceX, faceY);
    ctx.stroke();

    // Silky Trail
    if (player.trail.length > 2) {
      ctx.beginPath();
      ctx.moveTo(player.trail[0].x, player.trail[0].y);
      for (let i = 1; i < player.trail.length; i++) ctx.lineTo(player.trail[i].x, player.trail[i].y);
      ctx.strokeStyle = player.isDashing ? 'rgba(0, 240, 255, 0.9)' : 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = player.isDashing ? 5.0 : 2.2;
      ctx.stroke();
    }

    ctx.save();
    if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    if (isSlowMo) {
      ctx.beginPath();
      ctx.arc(sx, sy, player.radius + 14, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.fillStyle = player.isDashing ? 'rgba(0, 240, 255, 0.38)' : 'rgba(0, 240, 255, 0.14)';
    ctx.beginPath();
    ctx.arc(sx, sy, player.radius + 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sx, sy, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#001628';
    ctx.fill();
    ctx.lineWidth = player.isDashing ? 4.5 : 2.8;
    ctx.strokeStyle = '#00f0ff';
    ctx.stroke();

    ctx.fillStyle = '#00f0ff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'italic bold 12px "Cambria Math", Georgia, serif';
    ctx.fillText('d', sx, sy - 6);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(sx - 8, sy);
    ctx.lineTo(sx + 8, sy);
    ctx.strokeStyle = '#00f0ff';
    ctx.stroke();
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
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    const stickX = touchJoystick.startX + touchJoystick.dx * 45;
    const stickY = touchJoystick.startY + touchJoystick.dy * 45;
    ctx.beginPath();
    ctx.arc(stickX, stickY, 22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.42)';
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
      ctx.fillRect(pt.x - pt.size * 0.5, pt.y - pt.size * 0.5, pt.size, pt.size);
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
      ctx.font = p.isDmg
        ? '900 22px -apple-system, BlinkMacSystemFont, sans-serif'
        : 'italic bold 19px "Cambria Math", Georgia, serif';
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
      ctx.restore();
    });
  }

  drawCountdownOverlay(countdownTimer) {
    const cx = ARENA.x + ARENA.width / 2;
    const cy = ARENA.y + ARENA.height / 2;
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (countdownTimer > 1.7) {
      ctx.font = '900 100px -apple-system, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('3', cx, cy);
    } else if (countdownTimer > 1.0) {
      ctx.font = '900 100px -apple-system, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('2', cx, cy);
    } else if (countdownTimer > 0.35) {
      ctx.font = '900 100px -apple-system, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText('1', cx, cy);
    } else {
      ctx.font = '900 54px -apple-system, sans-serif';
      ctx.fillStyle = '#00f0ff';
      ctx.fillText('DIFFERENTIATE!', cx, cy);
    }

    ctx.font = '700 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('PRESS [✕] OR SPACE TO SKIP', cx, cy + 72);
    ctx.restore();
  }
}
