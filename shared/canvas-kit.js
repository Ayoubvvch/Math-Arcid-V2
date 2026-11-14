/**
 * Math Arcade Shared Canvas Kit
 * Hardware-accelerated 2D canvas utilities, HiDPI scaling, and zero-GC particle pooling.
 */

export class CanvasKit {
  /**
   * Configures canvas for sharp HiDPI / Retina displays
   */
  static setupHiDPI(canvas, width, height, maxDpr = 1.5) {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, dpr };
  }

  /**
   * Renders high-tech mathematical Cartesian grid
   */
  static drawCartesianGrid(ctx, width, height, step = 40, theme = {}) {
    const {
      bg = '#07090e',
      minorGrid = 'rgba(255, 255, 255, 0.03)',
      majorGrid = 'rgba(255, 255, 255, 0.08)',
      axes = 'rgba(0, 240, 255, 0.25)',
      originX = width / 2,
      originY = height / 2,
    } = theme;

    // Fill background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1;

    // Minor & Major grid lines
    ctx.beginPath();
    ctx.strokeStyle = minorGrid;
    for (let x = originX % step; x < width; x += step) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = originY % step; y < height; y += step) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Axes
    ctx.beginPath();
    ctx.strokeStyle = axes;
    ctx.lineWidth = 1.5;
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
  }

  /**
   * Draws vibrant concentric glow halo without costly shadowBlur multipasses
   */
  static drawGlowCircle(ctx, x, y, radius, color, glowLayers = 3) {
    for (let i = glowLayers; i >= 1; i--) {
      ctx.beginPath();
      ctx.arc(x, y, radius + i * 2, 0, Math.PI * 2);
      ctx.fillStyle = `${color}${Math.floor((0.08 / i) * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

/**
 * Pre-allocated Zero-GC Particle Pool
 */
export class ParticlePool {
  constructor(maxParticles = 500) {
    this.max = maxParticles;
    this.particles = new Array(maxParticles);
    for (let i = 0; i < maxParticles; i++) {
      this.particles[i] = {
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 2,
        color: '#00f0ff',
        alpha: 1,
        decay: 0.02,
      };
    }
  }

  spawn(x, y, count = 10, color = '#00f0ff', speed = 2.5) {
    let spawned = 0;
    for (let i = 0; i < this.max && spawned < count; i++) {
      const p = this.particles[i];
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        const angle = Math.random() * Math.PI * 2;
        const s = (Math.random() * 0.8 + 0.2) * speed;
        p.vx = Math.cos(angle) * s;
        p.vy = Math.sin(angle) * s;
        p.radius = Math.random() * 2.5 + 1;
        p.color = color;
        p.alpha = 1;
        p.decay = Math.random() * 0.025 + 0.015;
        spawned++;
      }
    }
  }

  updateAndRender(ctx) {
    for (let i = 0; i < this.max; i++) {
      const p = this.particles[i];
      if (p.active) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          p.active = false;
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
}
