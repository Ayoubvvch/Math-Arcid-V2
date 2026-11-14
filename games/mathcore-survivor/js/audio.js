/**
 * MathCore: Sandbox Survivor - Lightweight PlayStation Melodic Web Audio Engine
 */

window.SoundEngine = {
    ctx: null,
    muted: false,
    _lastPickupTime: 0,
    init() {
        if (typeof window === 'undefined') return;
        try {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                const res = this.ctx.resume();
                if (res && typeof res.catch === 'function') res.catch(() => {});
            }
        } catch (e) {}
    },
    playTone(freq, type = 'sine', duration = 0.12, vol = 0.14, slideFreq = null) {
        if (this.muted) return;
        try {
            this.init();
            if (!this.ctx || this.ctx.state === 'suspended') return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if (slideFreq) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideFreq), this.ctx.currentTime + duration);
            }
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    },
    // Distinct melodic note for each PlayStation button
    playPsButton(btnIndex) {
        const notes = [523.25, 659.25, 783.99, 987.77]; // C5 (✕), E5 (◯), G5 (▢), B5 (△)
        const freq = notes[((btnIndex % 4) + 4) % 4];
        this.playTone(freq, 'triangle', 0.1, 0.16, freq * 1.05);
    },
    uiTick() {
        this.playTone(740, 'sine', 0.05, 0.08, 880);
    },
    pauseCue(opening = true) {
        if (opening) {
            this.playTone(440, 'triangle', 0.1, 0.12, 330);
        } else {
            this.playTone(392, 'triangle', 0.1, 0.12, 587);
        }
    },
    mathZap() {
        this.playTone(720, 'sawtooth', 0.16, 0.15, 160);
        setTimeout(() => this.playTone(987, 'sine', 0.14, 0.13, 1400), 30);
    },
    comboChime(comboLevel) {
        const base = 440 * Math.pow(1.15, Math.min(comboLevel, 8));
        this.playTone(base, 'sine', 0.14, 0.12, base * 1.5);
    },
    waveClearFanfare() {
        const chord = [523.25, 659.25, 783.99, 1046.5];
        chord.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.22, 0.13), i * 80);
        });
    },
    bossAlarm() {
        this.playTone(220, 'sawtooth', 0.32, 0.18, 110);
    },
    kineticShot() {
        this.playTone(320, 'square', 0.05, 0.045, 90);
    },
    buildTower() {
        this.playTone(330, 'sine', 0.12, 0.14, 660);
    },
    pickup() {
        const now = performance.now();
        if (now - this._lastPickupTime < 110) return;
        this._lastPickupTime = now;
        this.playTone(880, 'sine', 0.07, 0.07, 1320);
    },
    hurt() {
        this.playTone(130, 'sawtooth', 0.2, 0.18, 45);
    }
};
