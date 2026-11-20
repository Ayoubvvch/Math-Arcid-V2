/**
 * Quantum Casino (كازينو الاحتمالات الكمومي) - Procedural Casino Heist & Bullet-Time Synthesizer
 * Zero external assets, pre-allocated white-noise buffer, zero timer leaks on mute.
 */

window.CasinoAudio = {
  ctx: null,
  masterGain: null,
  droneOsc: null,
  droneFilter: null,
  droneGain: null,
  noiseBuffer: null,
  muted: false,

  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        try {
          this.ctx = new AC();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.48, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
          this._buildNoiseBuffer();
          this._startVaultDrone();
        } catch (_) {}
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

  _startVaultDrone() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filt = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, now);
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(145, now);
      g.gain.setValueAtTime(this.muted ? 0 : 0.032, now);

      osc.connect(filt);
      filt.connect(g);
      g.connect(this.masterGain);
      osc.start(now);

      this.droneOsc = osc;
      this.droneFilter = filt;
      this.droneGain = g;
    } catch (_) {}
  },

  toggleMute() {
    this.muted = !this.muted;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.48, this.ctx.currentTime);
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
    } catch (_) {}
  },

  noise(dur = 0.16, freq = 900, q = 1.6, vol = 0.11, delay = 0) {
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
      g.gain.linearRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(filt);
      filt.connect(g);
      g.connect(this.masterGain);
      src.start(t);
      src.stop(t + dur + 0.02);
    } catch (_) {}
  },

  playDash() {
    this.init();
    this.tone(310, 740, 0.14, 'triangle', 0.12);
    this.noise(0.11, 1400, 1.5, 0.09, 0);
  },

  playCardSlice() {
    this.init();
    this.tone(860, 290, 0.13, 'sawtooth', 0.1);
    this.noise(0.12, 2400, 2.2, 0.12, 0);
  },

  playChipShot() {
    this.init();
    this.tone(1080, 420, 0.075, 'triangle', 0.085);
    this.tone(1620, 920, 0.045, 'sine', 0.045, 0.01);
  },

  playBulletTime() {
    this.init();
    this.tone(680, 140, 0.34, 'sine', 0.14);
    this.tone(420, 110, 0.36, 'triangle', 0.1, 0.04);
    this.noise(0.24, 520, 0.9, 0.09, 0);
  },

  playJackpotShock() {
    this.init();
    this.tone(180, 880, 0.34, 'sawtooth', 0.14);
    this.tone(523.25, 1046.5, 0.28, 'triangle', 0.11, 0.06);
    this.noise(0.3, 740, 1.1, 0.13, 0);
  },

  playVaultUnlock() {
    this.init();
    this.tone(523.25, 659.25, 0.16, 'triangle', 0.13, 0);
    this.tone(659.25, 783.99, 0.18, 'sine', 0.13, 0.08);
    this.tone(783.99, 1046.5, 0.26, 'sine', 0.14, 0.16);
  },

  playShieldDeflect() {
    this.init();
    this.tone(940, 1480, 0.08, 'triangle', 0.09, 0);
  },

  playBossPhaseShift() {
    this.init();
    this.tone(130, 320, 0.35, 'sawtooth', 0.13, 0);
    this.tone(195, 480, 0.32, 'triangle', 0.1, 0.05);
    this.noise(0.25, 660, 1.2, 0.11, 0);
  },

  playBeamCharge() {
    this.init();
    this.tone(240, 720, 0.45, 'sine', 0.11);
  },

  playBeamFire() {
    this.init();
    this.tone(480, 115, 0.28, 'sawtooth', 0.15);
    this.noise(0.24, 900, 1.2, 0.13, 0);
  },

  playDamage() {
    this.init();
    this.tone(175, 52, 0.22, 'sawtooth', 0.17);
    this.noise(0.16, 320, 1.1, 0.13, 0);
  },

  playOverrideFail() {
    this.init();
    this.tone(220, 130, 0.18, 'sawtooth', 0.14, 0);
    this.tone(155, 98, 0.22, 'sawtooth', 0.14, 0.09);
  },

  playVictory() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    notes.forEach((f, i) => this.tone(f, f * 1.01, 0.24, 'sine', 0.13, i * 0.09));
  },

  playUiTick() {
    this.init();
    this.tone(680, 920, 0.045, 'triangle', 0.055);
  },

  playChipPickup(kind = 'energy') {
    this.init();
    if (kind === 'hp') {
      this.tone(540, 810, 0.13, 'sine', 0.1, 0);
      this.tone(810, 1080, 0.12, 'triangle', 0.08, 0.05);
    } else {
      this.tone(480, 960, 0.11, 'triangle', 0.095, 0);
    }
  },

  playComboChime(combo = 2) {
    this.init();
    const base = Math.min(1040, 460 + combo * 55);
    this.tone(base, base * 1.25, 0.1, 'sine', 0.08);
  },

  setTimeDilationAudio(bulletActive = false, bossActive = false) {
    if (!this.ctx || !this.droneOsc || !this.droneFilter || !this.droneGain || this.muted) return;
    try {
      const now = this.ctx.currentTime;
      const targetFreq = bulletActive ? 38 : (bossActive ? 68 : 54);
      const targetCut = bulletActive ? 82 : (bossActive ? 220 : 145);
      const targetGain = bulletActive ? 0.052 : (bossActive ? 0.048 : 0.032);
      this.droneOsc.frequency.setTargetAtTime(targetFreq, now, 0.1);
      this.droneFilter.frequency.setTargetAtTime(targetCut, now, 0.1);
      this.droneGain.gain.setTargetAtTime(targetGain, now, 0.12);
    } catch (_) {}
  }
};
