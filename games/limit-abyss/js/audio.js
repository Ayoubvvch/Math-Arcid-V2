/**
 * Limit Abyss — هاوية النهايات والاتصال 2BAC PC
 * Procedural Web Audio API Soundscape & Depth-Adaptive Subnautic Acoustic Engine
 * Pure synthesized audio without external assets (zero per-frame GC allocation).
 */

window.AbyssAudio = (function() {
  let ctx = null;
  let masterGain = null;
  let ambientOsc = null;
  let ambientSubOsc = null;
  let ambientFilter = null;
  let ambientGain = null;
  let lfoOsc = null;
  let noiseBuffer = null;
  let isMuted = false;
  let isInitialized = false;
  let currentDepthRatio = 0;

  function init() {
    if (isInitialized) {
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      return;
    }
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      ctx = new AudioContext();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.45, ctx.currentTime);
      masterGain.connect(ctx.destination);

      buildNoiseBuffer();
      startAmbientDrone();
      isInitialized = true;
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  function buildNoiseBuffer() {
    if (!ctx || noiseBuffer) return;
    const length = Math.floor(ctx.sampleRate * 1.5);
    noiseBuffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  function startAmbientDrone() {
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      ambientFilter = ctx.createBiquadFilter();
      ambientFilter.type = 'lowpass';
      ambientFilter.frequency.setValueAtTime(160, now);
      ambientFilter.Q.setValueAtTime(2.2, now);

      ambientGain = ctx.createGain();
      ambientGain.gain.setValueAtTime(isMuted ? 0 : 0.075, now);

      // Primary deep hull rumble
      ambientOsc = ctx.createOscillator();
      ambientOsc.type = 'sawtooth';
      ambientOsc.frequency.setValueAtTime(38, now);

      // Sub-harmonic fifth for oceanic depth pressure
      ambientSubOsc = ctx.createOscillator();
      ambientSubOsc.type = 'triangle';
      ambientSubOsc.frequency.setValueAtTime(57, now);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.42, now);

      // Slow ocean-current LFO modulating lowpass cutoff
      lfoOsc = ctx.createOscillator();
      lfoOsc.type = 'sine';
      lfoOsc.frequency.setValueAtTime(0.08, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(28, now);

      lfoOsc.connect(lfoGain);
      lfoGain.connect(ambientFilter.frequency);

      ambientOsc.connect(ambientFilter);
      ambientSubOsc.connect(subGain);
      subGain.connect(ambientFilter);
      ambientFilter.connect(ambientGain);
      ambientGain.connect(masterGain);

      ambientOsc.start(now);
      ambientSubOsc.start(now);
      lfoOsc.start(now);
    } catch (e) {}
  }

  function setDepthRatio(ratio) {
    const clamped = Math.max(0, Math.min(1, Number(ratio) || 0));
    if (Math.abs(clamped - currentDepthRatio) < 0.03) return;
    currentDepthRatio = clamped;
    if (!ctx || !ambientFilter || !ambientGain || isMuted) return;
    try {
      const now = ctx.currentTime;
      const cutoff = 185 - clamped * 110; // 185Hz near surface -> 75Hz in Hadal Trench
      const droneLevel = 0.065 + clamped * 0.045;
      ambientFilter.frequency.setTargetAtTime(cutoff, now, 0.35);
      ambientGain.gain.setTargetAtTime(droneLevel, now, 0.35);
    } catch (e) {}
  }

  function playNoiseBurst(duration = 0.25, centerFreq = 600, q = 1.4, gainVal = 0.16, startOffset = 0) {
    if (!ctx || isMuted || !noiseBuffer) return;
    try {
      const now = ctx.currentTime + startOffset;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(centerFreq, now);
      filter.Q.setValueAtTime(q, now);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(gainVal, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration);

      src.connect(filter);
      filter.connect(g);
      g.connect(masterGain);

      src.start(now);
      src.stop(now + duration + 0.02);
    } catch (e) {}
  }

  function playTone(freq, duration = 0.2, type = 'sine', gainVal = 0.3, startOffset = 0, endFreq = null) {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    try {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const now = ctx.currentTime + startOffset;

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(20, freq), now);
      if (endFreq && endFreq !== freq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
      }

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(gainVal, now + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(g);
      g.connect(masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (e) {}
  }

  function playSonarPing() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    // Primary metallic hydro-sonar + scheduled acoustic trench echoes (no setTimeout leaks)
    playTone(1420, 1.15, 'sine', 0.32, 0, 880);
    playTone(880, 0.85, 'sine', 0.12, 0.34, 865);
    playTone(660, 0.70, 'sine', 0.055, 0.68, 645);
  }

  function playJetBoost() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    playTone(88, 0.34, 'triangle', 0.24, 0, 265);
    playNoiseBurst(0.28, 420, 1.1, 0.14, 0);
  }

  function playBubblePop() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const base = 360 + Math.random() * 280;
    playTone(base, 0.11, 'sine', 0.075, 0, base * 1.48);
  }

  function playAbyssCreak() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    playTone(135, 1.1, 'sine', 0.14, 0, 62);
    playTone(202, 0.9, 'triangle', 0.06, 0.12, 95);
  }

  function playTorpedo() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    playTone(460, 0.32, 'sawtooth', 0.22, 0, 125);
    playNoiseBurst(0.16, 950, 2.0, 0.09, 0);
  }

  function playExplosion() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    playTone(135, 0.48, 'square', 0.30, 0, 34);
    playNoiseBurst(0.42, 240, 0.8, 0.26, 0);
  }

  function playShieldDeflect() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    playTone(940, 0.20, 'triangle', 0.24, 0, 420);
    playTone(1410, 0.16, 'sine', 0.14, 0.02, 760);
  }

  function playShieldBreak() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    playTone(620, 0.45, 'sawtooth', 0.26, 0, 110);
    playTone(930, 0.40, 'triangle', 0.20, 0.04, 180);
    playNoiseBurst(0.38, 1200, 1.2, 0.22, 0);
  }

  function playBeamCharge() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    playTone(220, 0.55, 'sine', 0.15, 0, 560);
  }

  function playBeamFire() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    playTone(340, 0.42, 'sawtooth', 0.24, 0, 95);
    playNoiseBurst(0.35, 720, 1.5, 0.18, 0);
  }

  function playBossPhaseShift() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    playTone(110, 0.65, 'sawtooth', 0.22, 0, 165);
    playTone(220, 0.75, 'triangle', 0.18, 0.12, 330);
    playAbyssCreak();
  }

  function playOverrideSuccess() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((f, idx) => {
      playTone(f, 0.24, 'sine', 0.26, idx * 0.085);
    });
  }

  function playOverrideFail() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    playTone(185, 0.18, 'sawtooth', 0.30, 0);
    playTone(130, 0.28, 'sawtooth', 0.30, 0.11);
  }

  function playVictoryFanfare() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const fanfare = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.18 },
      { f: 1046.5, d: 0.48 }
    ];
    let offset = 0;
    fanfare.forEach(item => {
      playTone(item.f, item.d, 'sine', 0.30, offset);
      offset += item.d + 0.04;
    });
  }

  function playUiTick() {
    playTone(720, 0.05, 'sine', 0.12);
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (ctx) {
      const now = ctx.currentTime;
      if (masterGain) {
        masterGain.gain.setValueAtTime(isMuted ? 0 : 0.45, now);
      }
      if (ambientGain) {
        ambientGain.gain.setValueAtTime(isMuted ? 0 : (0.065 + currentDepthRatio * 0.045), now);
      }
    }
    return isMuted;
  }

  return {
    init,
    setDepthRatio,
    playSonarPing,
    playJetBoost,
    playBubblePop,
    playAbyssCreak,
    playTorpedo,
    playExplosion,
    playShieldDeflect,
    playShieldBreak,
    playBeamCharge,
    playBeamFire,
    playBossPhaseShift,
    playOverrideSuccess,
    playOverrideFail,
    playVictoryFanfare,
    playUiTick,
    toggleMute,
    isMuted: () => isMuted
  };
})();
