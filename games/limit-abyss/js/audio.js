/**
 * Limit Abyss — هاوية النهايات والاتصال 2BAC PC
 * Procedural Web Audio API Soundscape & Subnautic Acoustic Engine
 * Pure synthesized audio without external assets.
 */

window.AbyssAudio = (function() {
  let ctx = null;
  let masterGain = null;
  let ambientOsc = null;
  let ambientGain = null;
  let isMuted = false;
  let isInitialized = false;

  function init() {
    if (isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      ctx = new AudioContext();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.45, ctx.currentTime);
      masterGain.connect(ctx.destination);

      startAmbientDrone();
      isInitialized = true;
    } catch (e) {
      console.warn('Web Audio not supported or blocked:', e);
    }
  }

  function startAmbientDrone() {
    if (!ctx) return;
    try {
      // Sub-aquatic rumble (deep ocean drone)
      ambientOsc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      ambientGain = ctx.createGain();

      ambientOsc.type = 'sawtooth';
      ambientOsc.frequency.setValueAtTime(42, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, ctx.currentTime);

      ambientGain.gain.setValueAtTime(isMuted ? 0 : 0.08, ctx.currentTime);

      ambientOsc.connect(filter);
      filter.connect(ambientGain);
      ambientGain.connect(masterGain);

      ambientOsc.start();
    } catch (e) {}
  }

  function playTone(freq, duration = 0.2, type = 'sine', gainVal = 0.3) {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    try {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      g.gain.setValueAtTime(gainVal, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(g);
      g.connect(masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  function playSonarPing() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    try {
      const now = ctx.currentTime;
      // High sonar ping
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1420, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.85);

      g.gain.setValueAtTime(0.35, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(g);
      g.connect(masterGain);

      osc.start(now);
      osc.stop(now + 1.2);

      // Reverb / echo ping
      setTimeout(() => {
        if (!ctx || isMuted) return;
        const eOsc = ctx.createOscillator();
        const eG = ctx.createGain();
        const eNow = ctx.currentTime;
        eOsc.type = 'sine';
        eOsc.frequency.setValueAtTime(880, eNow);
        eG.gain.setValueAtTime(0.12, eNow);
        eG.gain.exponentialRampToValueAtTime(0.001, eNow + 0.9);
        eOsc.connect(eG);
        eG.connect(masterGain);
        eOsc.start(eNow);
        eOsc.stop(eNow + 0.9);
      }, 340);
    } catch (e) {}
  }

  function playJetBoost() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.28);

      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(g);
      g.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  function playTorpedo() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);

      g.gain.setValueAtTime(0.28, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(g);
      g.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  function playExplosion() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.45);

      g.gain.setValueAtTime(0.38, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(g);
      g.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  function playOverrideSuccess() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((f, idx) => {
      setTimeout(() => playTone(f, 0.22, 'sine', 0.28), idx * 85);
    });
  }

  function playOverrideFail() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    playTone(180, 0.18, 'sawtooth', 0.35);
    setTimeout(() => playTone(130, 0.28, 'sawtooth', 0.35), 110);
  }

  function playVictoryFanfare() {
    if (!ctx || isMuted) return;
    if (ctx.state === 'suspended') ctx.resume();
    const fanfare = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.18 },
      { f: 1046.5, d: 0.45 }
    ];
    let time = 0;
    fanfare.forEach(item => {
      setTimeout(() => playTone(item.f, item.d, 'sine', 0.32), time);
      time += item.d * 1000 + 40;
    });
  }

  function playUiTick() {
    playTone(720, 0.05, 'sine', 0.12);
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (ambientGain && ctx) {
      ambientGain.gain.setValueAtTime(isMuted ? 0 : 0.08, ctx.currentTime);
    }
    return isMuted;
  }

  return {
    init,
    playSonarPing,
    playJetBoost,
    playTorpedo,
    playExplosion,
    playOverrideSuccess,
    playOverrideFail,
    playVictoryFanfare,
    playUiTick,
    toggleMute,
    isMuted: () => isMuted
  };
})();
