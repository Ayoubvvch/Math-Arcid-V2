/**
 * Integral Forge (محرقة التكامل والمعادلات) - Procedural Industrial Foundry & Mech Audio Synthesizer
 * Zero external assets, pre-allocated noise buffer, zero timer leaks on mute.
 */

window.ForgeAudio = {
  ctx: null,
  masterGain: null,
  humOsc: null,
  humGain: null,
  noiseBuffer: null,
  muted: false,

  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        try {
          this.ctx = new AC();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.5, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
          this._buildNoiseBuffer();
          this._startFoundryDrone();
        } catch (e) {}
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },

  _buildNoiseBuffer() {
    if (!this.ctx || this.noiseBuffer) return;
    const len = Math.floor(this.ctx.sampleRate * 1.0);
    this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = this.noiseBuffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  },

  _startFoundryDrone() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filt = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(46, now);
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(115, now);
      g.gain.setValueAtTime(this.muted ? 0 : 0.04, now);

      osc.connect(filt);
      filt.connect(g);
      g.connect(this.masterGain);
      osc.start(now);

      this.humOsc = osc;
      this.humGain = g;
    } catch (e) {}
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.5, this.ctx.currentTime);
    }
    return this.muted;
  },

  _ok() {
    return !this.muted && this.ctx && this.masterGain && this.ctx.state === 'running';
  },

  tone(f1, f2, dur, type = 'sine', vol = 0.12, delay = 0) {
    if (!this._ok()) return;
    try {
      const t = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(25, f1), t);
      if (f2 && f2 !== f1) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(25, f2), t + dur);
      }
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    } catch (e) {}
  },

  noise(dur = 0.18, freq = 700, q = 1.5, vol = 0.12, delay = 0) {
    if (!this._ok() || !this.noiseBuffer) return;
    try {
      const t = this.ctx.currentTime + delay;
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filt = this.ctx.createBiquadFilter();
      filt.type = 'bandpass';
      filt.frequency.setValueAtTime(freq, t);
      filt.Q.setValueAtTime(q, t);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(filt);
      filt.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + dur + 0.02);
    } catch (e) {}
  },

  playJump(isDouble = false) {
    this.init();
    this.tone(isDouble ? 280 : 190, isDouble ? 620 : 410, 0.16, 'triangle', 0.14);
    this.noise(0.12, isDouble ? 1050 : 620, 1.2, 0.09, 0);
  },

  playSlice() {
    this.init();
    this.tone(740, 210, 0.18, 'sawtooth', 0.13);
    this.noise(0.18, 1650, 1.3, 0.13, 0);
    this.tone(1120, 540, 0.11, 'triangle', 0.09, 0.03);
  },

  playCannon() {
    this.init();
    this.tone(540, 180, 0.09, 'square', 0.09);
    this.noise(0.06, 950, 1.8, 0.05, 0);
  },

  playAegis() {
    this.init();
    this.tone(293.66, 587.33, 0.25, 'sine', 0.13);
    this.tone(440, 880, 0.25, 'triangle', 0.09, 0.04);
  },

  playOverdrive() {
    this.init();
    this.tone(115, 760, 0.38, 'sawtooth', 0.16);
    this.tone(180, 980, 0.38, 'triangle', 0.12, 0.03);
    this.noise(0.35, 420, 0.85, 0.17, 0);
  },

  playGateBreak() {
    this.init();
    this.tone(392, 587.33, 0.18, 'triangle', 0.13, 0);
    this.tone(587.33, 783.99, 0.20, 'sine', 0.13, 0.08);
    this.tone(783.99, 1174.66, 0.28, 'sine', 0.14, 0.16);
  },

  playSlagSplash() {
    this.init();
    this.noise(0.24, 720, 1.1, 0.16, 0);
    this.tone(195, 85, 0.18, 'sawtooth', 0.11, 0);
    this.tone(310, 520, 0.12, 'triangle', 0.08, 0.05);
  },

  playSlagSizzle() {
    this.init();
    this.noise(0.18, 2200, 1.9, 0.1, 0);
    const popF = 440 + Math.random() * 380;
    this.tone(popF, popF * 1.35, 0.07, 'sine', 0.055, 0.02);
  },

  playCraneBoard() {
    this.init();
    this.tone(185, 295, 0.11, 'triangle', 0.08, 0);
    this.tone(295, 415, 0.12, 'sine', 0.06, 0.04);
  },

  playCraneDock() {
    this.init();
    this.tone(145, 92, 0.15, 'sine', 0.075, 0);
    this.noise(0.08, 560, 2.1, 0.045, 0);
  },

  playBossPhaseShift() {
    this.init();
    this.tone(110, 220, 0.34, 'sawtooth', 0.13, 0);
    this.tone(165, 330, 0.34, 'triangle', 0.1, 0.05);
    this.noise(0.28, 520, 1.1, 0.12, 0);
  },

  playShieldDeflect() {
    this.init();
    this.tone(760, 1220, 0.095, 'triangle', 0.09, 0);
  },

  playBeamCharge() {
    this.init();
    this.tone(210, 580, 0.48, 'sine', 0.12);
  },

  playBeamFire() {
    this.init();
    this.tone(380, 88, 0.34, 'sawtooth', 0.16);
    this.noise(0.28, 760, 1.2, 0.14, 0);
  },

  playDamage() {
    this.init();
    this.tone(145, 45, 0.24, 'sawtooth', 0.18);
    this.noise(0.18, 280, 1.0, 0.14, 0);
  },

  playOverrideFail() {
    this.init();
    this.tone(195, 130, 0.18, 'sawtooth', 0.15, 0);
    this.tone(140, 95, 0.24, 'sawtooth', 0.15, 0.1);
  },

  playVictory() {
    this.init();
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((f, i) => this.tone(f, f * 1.01, 0.25, 'sine', 0.14, i * 0.1));
  },

  playUiTick() {
    this.init();
    this.tone(580, 760, 0.05, 'triangle', 0.06);
  }
};
