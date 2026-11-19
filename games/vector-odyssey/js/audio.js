/**
 * Vector Odyssey (أوديسا الفضاء المتجهي) - Procedural Starfighter & Orbital Audio Synthesizer
 * Zero external assets, pre-allocated noise buffer, zero timer leaks on mute.
 */

window.OdysseyAudio = {
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
          this._startSpaceDrone();
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

  _startSpaceDrone() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filt = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(52, now);
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(135, now);
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

  playBoost() {
    this.init();
    this.tone(240, 620, 0.17, 'triangle', 0.13);
    this.noise(0.14, 1100, 1.2, 0.11, 0);
  },

  playRollDash() {
    this.init();
    this.tone(720, 260, 0.16, 'sawtooth', 0.11);
    this.noise(0.15, 1600, 1.3, 0.12, 0);
  },

  playRailgun() {
    this.init();
    this.tone(920, 310, 0.08, 'square', 0.08);
  },

  playAegis() {
    this.init();
    this.tone(330, 660, 0.24, 'sine', 0.13);
    this.tone(495, 990, 0.24, 'triangle', 0.09, 0.04);
  },

  playOverdrive() {
    this.init();
    this.tone(130, 860, 0.38, 'sawtooth', 0.15);
    this.tone(210, 1080, 0.38, 'triangle', 0.11, 0.03);
    this.noise(0.32, 520, 0.9, 0.15, 0);
  },

  playGateBreak() {
    this.init();
    this.tone(440, 660, 0.18, 'triangle', 0.13, 0);
    this.tone(660, 880, 0.20, 'sine', 0.13, 0.08);
    this.tone(880, 1320, 0.28, 'sine', 0.14, 0.16);
  },

  playBossPhaseShift() {
    this.init();
    this.tone(120, 260, 0.35, 'sawtooth', 0.13, 0);
    this.tone(180, 390, 0.35, 'triangle', 0.1, 0.05);
    this.noise(0.26, 620, 1.1, 0.11, 0);
  },

  playShieldDeflect() {
    this.init();
    this.tone(820, 1280, 0.09, 'triangle', 0.09, 0);
  },

  playBeamCharge() {
    this.init();
    this.tone(250, 640, 0.48, 'sine', 0.12);
  },

  playBeamFire() {
    this.init();
    this.tone(440, 105, 0.32, 'sawtooth', 0.16);
    this.noise(0.28, 860, 1.2, 0.14, 0);
  },

  playDamage() {
    this.init();
    this.tone(160, 48, 0.24, 'sawtooth', 0.18);
    this.noise(0.18, 300, 1.0, 0.14, 0);
  },

  playOverrideFail() {
    this.init();
    this.tone(210, 140, 0.18, 'sawtooth', 0.15, 0);
    this.tone(150, 105, 0.24, 'sawtooth', 0.15, 0.1);
  },

  playVictory() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((f, i) => this.tone(f, f * 1.01, 0.25, 'sine', 0.14, i * 0.1));
  },

  playUiTick() {
    this.init();
    this.tone(620, 820, 0.05, 'triangle', 0.06);
  },

  playOrbPickup(kind = 'energy') {
    this.init();
    if (kind === 'hp') {
      this.tone(520, 780, 0.14, 'sine', 0.1, 0);
      this.tone(780, 1040, 0.14, 'triangle', 0.08, 0.05);
    } else {
      this.tone(440, 880, 0.12, 'triangle', 0.1, 0);
    }
  },

  playComboChime(combo = 2) {
    this.init();
    const base = Math.min(980, 440 + combo * 55);
    this.tone(base, base * 1.25, 0.11, 'sine', 0.08);
  },

  setCombatIntensity(speedNorm = 0, bossActive = false) {
    if (!this.ctx || !this.humOsc || !this.humGain || this.muted) return;
    try {
      const now = this.ctx.currentTime;
      const targetFreq = (bossActive ? 64 : 50) + Math.min(1, Math.max(0, speedNorm)) * 22;
      const targetGain = bossActive ? 0.055 : 0.038;
      this.humOsc.frequency.setTargetAtTime(targetFreq, now, 0.12);
      this.humGain.gain.setTargetAtTime(targetGain, now, 0.15);
    } catch (_) {}
  }
};
