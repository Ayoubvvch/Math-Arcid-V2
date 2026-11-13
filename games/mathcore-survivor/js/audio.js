/**
 * MathCore: Sandbox Survivor - Web Audio API Synthesizer
 */

window.SoundEngine = {
    ctx: null,
    muted: false,
    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },
    playTone(freq, type = 'sine', duration = 0.12, vol = 0.12, slideFreq = null) {
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
    mathClick(val) {
        // Pitch scales slightly with X value for satisfying feedback
        const base = 280 + Math.min(Math.abs(val) * 18, 520);
        this.playTone(base, 'triangle', 0.09, 0.14, base * 1.25);
    },
    mathZap() {
        this.playTone(620, 'sawtooth', 0.22, 0.16, 140);
        setTimeout(() => this.playTone(880, 'sine', 0.18, 0.14, 1320), 40);
    },
    kineticShot() {
        this.playTone(340, 'square', 0.07, 0.06, 110);
    },
    buildTower() {
        this.playTone(260, 'sine', 0.15, 0.15, 520);
        setTimeout(() => this.playTone(520, 'triangle', 0.18, 0.15, 780), 70);
    },
    pickup() {
        this.playTone(700, 'sine', 0.08, 0.08, 1050);
    },
    hurt() {
        this.playTone(150, 'sawtooth', 0.25, 0.18, 55);
    }
};
