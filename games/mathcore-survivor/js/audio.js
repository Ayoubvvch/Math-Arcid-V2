/**
 * MathCore: Sandbox Survivor - PlayStation Melodic Web Audio Engine
 */

window.SoundEngine = {
    ctx: null,
    muted: false,
    init() {
        if (!this.ctx && typeof window !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    playTone(freq, type = 'sine', duration = 0.12, vol = 0.15, slideFreq = null) {
        if (this.muted) return;
        try {
            this.init();
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if (slideFreq) {
                osc.frequency.exponentialRampToValueAtTime(slideFreq, this.ctx.currentTime + duration);
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
        const freq = notes[btnIndex % 4];
        this.playTone(freq, 'triangle', 0.1, 0.18, freq * 1.05);
    },
    mathZap() {
        this.playTone(720, 'sawtooth', 0.18, 0.18, 160);
        setTimeout(() => this.playTone(987, 'sine', 0.15, 0.15, 1400), 30);
    },
    comboChime(comboLevel) {
        const base = 440 * Math.pow(1.15, Math.min(comboLevel, 8));
        this.playTone(base, 'sine', 0.15, 0.14, base * 1.5);
    },
    waveClearFanfare() {
        const chord = [523.25, 659.25, 783.99, 1046.5];
        chord.forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'triangle', 0.25, 0.15), i * 80);
        });
    },
    bossAlarm() {
        this.playTone(220, 'sawtooth', 0.35, 0.2, 110);
    },
    kineticShot() {
        this.playTone(320, 'square', 0.06, 0.05, 90);
    },
    buildTower() {
        this.playTone(330, 'sine', 0.12, 0.15, 660);
    },
    pickup() {
        this.playTone(880, 'sine', 0.08, 0.08, 1320);
    },
    hurt() {
        this.playTone(130, 'sawtooth', 0.22, 0.2, 45);
    }
};
