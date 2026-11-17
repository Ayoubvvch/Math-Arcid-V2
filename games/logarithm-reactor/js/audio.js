/**
 * Logarithm Reactor (مفاعل اللوغاريتم والأسي) - Procedural Bio-Cyber Reactor Audio Synthesizer
 * Zero external assets, pre-allocated noise buffer, zero timer leaks on mute.
 */

window.ReactorAudio = {
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
          this._startReactorHum();
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

  _startReactorHum() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filt = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(54, now);
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(140, now);
      g.gain.setValueAtTime(this.muted ? 0 : 0.045, now);

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
    this.tone(isDouble ? 360 : 240, isDouble ? 760 : 480, 0.16, 'triangle', 0.14);
    if (isDouble) this.noise(0.14, 900, 1.4, 0.09, 0);
  },

  playDash() {
    this.init();
    this.tone(620, 190, 0.16, 'sawtooth', 0.11);
    this.noise(0.16, 1200, 1.2, 0.12, 0);
  },

  playPulse() {
    this.init();
    this.tone(860, 290, 0.085, 'square', 0.08);
  },

  playAegis() {
    this.init();
    this.tone(330, 660, 0.24, 'sine', 0.13);
    this.tone(495, 990, 0.24, 'triangle', 0.09, 0.04);
  },

  playOverdrive() {
    this.init();
    this.tone(140, 820, 0.36, 'sawtooth', 0.15);
    this.tone(220, 1040, 0.36, 'triangle', 0.11, 0.03);
    this.noise(0.32, 480, 0.9, 0.16, 0);
  },

  playGateBreak() {
    this.init();
    this.tone(440, 660, 0.18, 'triangle', 0.13, 0);
    this.tone(660, 880, 0.20, 'sine', 0.13, 0.08);
    this.tone(880, 1320, 0.28, 'sine', 0.14, 0.16);
  },

  playAcidSplash() {
    this.init();
    this.noise(0.24, 980, 1.1, 0.16, 0);
    this.tone(290, 110, 0.16, 'sine', 0.12, 0);
    this.tone(380, 740, 0.12, 'triangle', 0.08, 0.05);
  },

  playAcidSizzle() {
    this.init();
    this.noise(0.19, 2400, 1.8, 0.11, 0);
    const popF = 520 + Math.random() * 440;
    this.tone(popF, popF * 1.45, 0.075, 'sine', 0.06, 0.02);
  },

  playElevatorBoard() {
    this.init();
    this.tone(240, 360, 0.11, 'triangle', 0.075, 0);
    this.tone(360, 480, 0.12, 'sine', 0.06, 0.05);
  },

  playElevatorDock() {
    this.init();
    this.tone(175, 115, 0.14, 'sine', 0.065, 0);
    this.noise(0.08, 620, 2.0, 0.04, 0);
  },

  playShieldDeflect() {
    this.init();
    this.tone(720, 1140, 0.09, 'triangle', 0.085, 0);
  },

  playBeamCharge() {
    this.init();
    this.tone(240, 620, 0.48, 'sine', 0.12);
  },

  playBeamFire() {
    this.init();
    this.tone(420, 95, 0.32, 'sawtooth', 0.16);
    this.noise(0.28, 820, 1.2, 0.14, 0);
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
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this.tone(f, f * 1.01, 0.24, 'sine', 0.14, i * 0.11));
  },

  playUiTick() {
    this.init();
    this.tone(620, 820, 0.05, 'triangle', 0.06);
  }
};
