/**
 * Complex Plane Citadel (قلعة أرغاند) - Procedural Harmonic WebAudio Synthesizer
 * Zero external assets, low CPU overhead, crisp PS5 DualSense audio feedback.
 */

window.SeqAudio = {
  ctx: null,
  muted: false,

  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        try { this.ctx = new AC(); } catch (e) {}
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  },

  _ok() {
    return !this.muted && this.ctx && this.ctx.state === 'running';
  },

  tone(f1, f2, dur, type = 'sine', vol = 0.11, delay = 0) {
    if (!this._ok()) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(25, f1), t);
    if (f2 && f2 !== f1) osc.frequency.exponentialRampToValueAtTime(Math.max(25, f2), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  },

  playJump(doubleJump = false) {
    // Euler Phase Dash
    this.init();
    this.tone(doubleJump ? 420 : 280, doubleJump ? 840 : 560, 0.15, 'triangle', 0.12);
    this.tone(560, 880, 0.12, 'sine', 0.08, 0.03);
  },

  playDash() {
    // Conjugate Reflection z -> z_bar
    this.init();
    this.tone(640, 180, 0.16, 'sawtooth', 0.11);
    this.tone(320, 640, 0.14, 'sine', 0.09, 0.04);
  },

  playPulse() {
    // Affix Vector Cannon
    this.init();
    this.tone(780, 240, 0.09, 'square', 0.07);
  },

  playAegis() {
    // Roots of Unity z^n = 1 Polygon Barrier
    this.init();
    this.tone(330, 660, 0.22, 'sine', 0.12);
    this.tone(495, 990, 0.22, 'triangle', 0.09, 0.05);
  },

  playOverdrive() {
    // Homothety Shockwave z' = k*z
    this.init();
    this.tone(160, 780, 0.35, 'sawtooth', 0.14);
    this.tone(240, 960, 0.36, 'triangle', 0.11, 0.04);
  },

  playGateBreak() {
    // Argand Seal Override Success
    this.init();
    this.tone(440, 880, 0.22, 'triangle', 0.13, 0);
    this.tone(660, 1320, 0.28, 'sine', 0.12, 0.08);
  },

  playDamage() {
    this.init();
    this.tone(150, 48, 0.22, 'sawtooth', 0.16);
  },

  playUiTick() {
    this.init();
    this.tone(560, 760, 0.05, 'triangle', 0.06);
  }
};
