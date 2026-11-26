/**
 * LogSonarAudio — Logarithmic Pitch & Deep-Sea Acoustic Web Audio Synthesizer
 * Pitch scales logarithmically with x: f(x) = 220 * 2^(ln(x)/ln(2)) = 220 * x (clamped),
 * turning every logarithmic fusion, inversion, and base flip into real musical acoustics!
 */
(function (root) {
  'use strict';

  class LogSonarAudio {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    ensure() {
      if (this.muted) return null;
      if (!this.ctx) {
        const AC = root.AudioContext || root.webkitAudioContext;
        if (!AC) return null;
        try {
          this.ctx = new AC();
        } catch (_) {
          return null;
        }
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }

    toggleMute() {
      this.muted = !this.muted;
      return this.muted;
    }

    tone(freq, dur, type = 'sine', vol = 0.08, delay = 0, slideTo = null) {
      const ctx = this.ensure();
      if (!ctx) return;
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(70, Math.min(2200, freq)), now);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(70, Math.min(2200, slideTo)), now + dur);
      }
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    }

    // Logarithmic pitch ping: equal steps in ln(x) produce equal musical intervals!
    playLogPing(lnVal = 0) {
      const clamped = Math.max(-2.5, Math.min(3.5, Number(lnVal) || 0));
      const freq = 330 * Math.pow(2, clamped * 0.42);
      this.tone(freq, 0.16, 'sine', 0.08, 0, freq * 1.12);
      this.tone(freq * 2, 0.09, 'triangle', 0.03, 0.02);
    }

    playFusionChord(combo = 1) {
      const base = 261.63 * Math.pow(1.06, Math.min(10, combo));
      this.tone(base, 0.18, 'triangle', 0.08, 0);
      this.tone(base * 1.25, 0.2, 'sine', 0.07, 0.045);
      this.tone(base * 1.5, 0.24, 'sine', 0.075, 0.09);
    }

    playPulse(kind = 'cross') {
      if (kind === 'square') {
        this.tone(240, 0.13, 'sawtooth', 0.055, 0, 180);
      } else if (kind === 'triangle') {
        this.tone(420, 0.14, 'triangle', 0.065, 0, 560);
      } else if (kind === 'circle') {
        this.tone(520, 0.15, 'sine', 0.07, 0, 680);
      } else {
        this.tone(360, 0.12, 'sine', 0.065, 0, 540);
      }
    }

    playBaseFlip(increasing = true) {
      if (increasing) {
        this.tone(290, 0.12, 'triangle', 0.07, 0, 480);
      } else {
        this.tone(480, 0.12, 'triangle', 0.07, 0, 260);
      }
    }

    playWaveClear() {
      const notes = [392, 493.88, 587.33, 783.99];
      notes.forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.075, i * 0.065));
    }

    playError() {
      this.tone(175, 0.18, 'sawtooth', 0.07, 0, 125);
      this.tone(132, 0.16, 'square', 0.045, 0.05, 98);
    }

    playHit() {
      this.tone(110, 0.26, 'sawtooth', 0.095, 0, 58);
      this.tone(82, 0.22, 'triangle', 0.08, 0.03, 46);
    }

    playVictory() {
      const arp = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
      arp.forEach((f, i) => this.tone(f, 0.28, 'sine', 0.085, i * 0.07));
    }
  }

  root.LogSonarAudio = LogSonarAudio;
})(window);
