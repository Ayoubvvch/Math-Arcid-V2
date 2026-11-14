/**
 * Asymptote Asylum - Procedural Web Audio Horror Engine
 * Zero external MP3 dependencies, instant unlock, low CPU usage.
 */

window.HorrorAudio = {
  ctx: null,
  muted: false,
  noiseBuffer: null,

  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        try {
          this.ctx = new AC();
        } catch (e) {}
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.noiseBuffer) {
      const len = this.ctx.sampleRate * 0.4;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buf;
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  },

  _ok() {
    return !this.muted && this.ctx && this.ctx.state === 'running';
  },

  playTone(freq, endFreq, dur, type = 'sine', vol = 0.14, delay = 0) {
    if (!this._ok()) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), t);
    if (endFreq && endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t + dur);
    }
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  },

  playNoise(dur, filterFreq = 800, vol = 0.12, delay = 0) {
    if (!this._ok() || !this.noiseBuffer) return;
    const t = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, t);
    filter.Q.value = 1.6;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(t);
    src.stop(t + dur);
  },

  playHeartbeat(intensity = 0.6) {
    if (!this._ok()) return;
    const v = Math.min(0.28, 0.08 + intensity * 0.16);
    this.playTone(62, 34, 0.12, 'sine', v, 0);
    this.playTone(54, 30, 0.14, 'sine', v * 0.78, 0.16);
  },

  playSlash() {
    this.init();
    this.playTone(340, 95, 0.14, 'sawtooth', 0.13);
    this.playNoise(0.14, 1600, 0.14);
  },

  playExecuteGore() {
    this.init();
    this.playTone(130, 32, 0.34, 'sawtooth', 0.22);
    this.playNoise(0.26, 620, 0.22);
    this.playTone(420, 110, 0.2, 'square', 0.09, 0.06);
  },

  playBolt() {
    this.init();
    this.playTone(620, 170, 0.11, 'triangle', 0.11);
    this.playNoise(0.06, 2200, 0.06);
  },

  playDash() {
    this.init();
    this.playNoise(0.16, 480, 0.14);
    this.playTone(190, 75, 0.15, 'sine', 0.08);
  },

  playFlare() {
    this.init();
    this.playTone(480, 980, 0.25, 'sine', 0.11);
    this.playNoise(0.28, 2800, 0.08);
  },

  playSacrifice() {
    this.init();
    this.playTone(146.8, 73.4, 0.65, 'sawtooth', 0.22);
    this.playTone(220, 110, 0.55, 'triangle', 0.15, 0.04);
    this.playNoise(0.32, 420, 0.18, 0.05);
  },

  playSealBreak() {
    this.init();
    this.playTone(293.6, 587.3, 0.3, 'triangle', 0.15, 0);
    this.playTone(440, 880, 0.4, 'sine', 0.14, 0.1);
    this.playNoise(0.22, 2400, 0.1, 0.06);
  },

  playDamage() {
    this.init();
    this.playTone(115, 42, 0.24, 'sawtooth', 0.22);
    this.playNoise(0.18, 950, 0.18);
  },

  playJumpscare() {
    this.init();
    this.playTone(760, 290, 0.38, 'sawtooth', 0.16);
    this.playTone(812, 315, 0.36, 'square', 0.12, 0.02);
    this.playNoise(0.3, 1900, 0.18);
  },

  playUiTick() {
    this.init();
    this.playTone(540, 720, 0.055, 'triangle', 0.07);
  }
};
