/**
 * Sequence Strider - Procedural Cyber Synth Audio Engine
 * Zero external assets, low CPU overhead, crisp PS5-style feedback.
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
    this.init();
    this.tone(doubleJump ? 340 : 240, doubleJump ? 680 : 480, 0.14, 'triangle', 0.12);
  },

  playDash() {
    this.init();
    this.tone(520, 140, 0.16, 'sawtooth', 0.11);
  },

  playPulse() {
    this.init();
    this.tone(740, 220, 0.09, 'square', 0.07);
  },

  playAegis() {
    this.init();
    this.tone(360, 720, 0.22, 'sine', 0.12);
    this.tone(540, 880, 0.2, 'triangle', 0.08, 0.05);
  },

  playOverdrive() {
    this.init();
    this.tone(180, 760, 0.34, 'sawtooth', 0.14);
    this.tone(240, 960, 0.36, 'triangle', 0.11, 0.04);
  },

  playGateBreak() {
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
