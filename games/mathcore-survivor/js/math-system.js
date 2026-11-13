/**
 * MathCore: Sandbox Survivor - Math Challenge Generator & Resonance System
 */

window.generateMathChallenge = function(waveNum, forceBoss = false) {
    const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, -1, -2, -3, -4];
    const maxIndex = Math.min(pool.length, 6 + waveNum * 2);
    let answer = pool[Math.floor(Math.random() * maxIndex)];
    if (forceBoss) {
        const bossTargets = [8, 12, 15, 16, 20, -4, 9];
        answer = bossTargets[Math.floor(Math.random() * bossTargets.length)];
    }

    const mode = window.SandboxConfig.mathMode;
    let expr = `${answer}`;

    if (mode === 'numbers') {
        expr = `${answer}`;
    } else if (mode === 'arithmetic') {
        const roll = Math.random();
        if (roll < 0.4) {
            const a = Math.floor(Math.random() * 7) + 1;
            const b = answer - a;
            expr = b >= 0 ? `${a} + ${b}` : `${a} - ${Math.abs(b)}`;
        } else if (roll < 0.75 && answer % 2 === 0 && answer !== 0) {
            expr = `2 × ${answer / 2}`;
        } else if (roll < 0.9 && answer % 3 === 0 && answer !== 0) {
            expr = `3 × ${answer / 3}`;
        } else {
            const extra = Math.floor(Math.random() * 5) + 1;
            expr = `${answer + extra} - ${extra}`;
        }
    } else if (mode === 'algebra') {
        const roll = Math.random();
        if (roll < 0.5 && answer !== 0) {
            const a = [2, 3][Math.floor(Math.random() * 2)];
            expr = `${a}x = ${a * answer}`;
        } else {
            const b = Math.floor(Math.random() * 6) + 1;
            expr = `x + ${b} = ${answer + b}`;
        }
    } else if (mode === 'chaos') {
        if (answer === 4) expr = `√16`;
        else if (answer === 9) expr = `3²`;
        else if (answer === 8) expr = `2³`;
        else {
            const b = Math.floor(Math.random() * 5) + 2;
            expr = `2x - ${b} = ${2 * answer - b}`;
        }
    }

    return { answer, expr };
};

window.applyMathButton = function(slotIndex) {
    const opId = window.SandboxConfig.buttonOps[slotIndex];
    const opObj = window.AVAILABLE_MATH_OPS.find(o => o.id === opId) || window.AVAILABLE_MATH_OPS[0];
    const oldX = window.GameState.player.coreX;
    let nextX = opObj.fn(oldX);
    nextX = Math.max(-99, Math.min(999, Math.trunc(nextX)));
    window.GameState.player.coreX = nextX;

    // Visual button press feedback
    const btnEl = document.getElementById(`mathBtn${slotIndex}`);
    if (btnEl) {
        btnEl.classList.add('pressed');
        setTimeout(() => btnEl.classList.remove('pressed'), 130);
    }

    const coreXDisplay = document.getElementById('coreXDisplay');
    if (coreXDisplay) coreXDisplay.textContent = nextX;
    window.SoundEngine.mathClick(nextX);

    window.addFloatingText(window.GameState.player.x, window.GameState.player.y - 36, `X = ${nextX}`, '#00f3ff', 18);

    window.GameState.player.pulseWaveRadius = 15;
    window.GameState.player.pulseWaveAlpha = 0.85;

    // Trigger Gamepad Haptic on math operation
    if (window.triggerGamepadHaptic) {
        window.triggerGamepadHaptic(50, 0.3, 0.3);
    }

    // Immediately check resonance
    window.triggerMathResonanceCheck(true);
};

window.stepCoreX = function(delta) {
    window.GameState.player.coreX = Math.max(-99, Math.min(999, window.GameState.player.coreX + delta));
    const coreXDisplay = document.getElementById('coreXDisplay');
    if (coreXDisplay) coreXDisplay.textContent = window.GameState.player.coreX;
    window.SoundEngine.mathClick(window.GameState.player.coreX);
    window.triggerMathResonanceCheck(true);
};

window.triggerMathResonanceCheck = function(manualPulse = false) {
    const p = window.GameState.player;
    const range = window.SandboxConfig.beamRange * (manualPulse ? 1.25 : 1.0);
    let matchedCount = 0;

    for (let i = window.GameState.enemies.length - 1; i >= 0; i--) {
        const e = window.GameState.enemies[i];
        const dist = Math.hypot(e.x - p.x, e.y - p.y);

        if (e.answer === p.coreX && dist <= range) {
            matchedCount++;
            window.createLightningBeam(p.x, p.y, e.x, e.y, '#00ff88', 16);

            if (e.isBoss) {
                e.hp -= 95;
                e.hitFlash = 8;
                const newMath = window.generateMathChallenge(window.GameState.wave, true);
                e.answer = newMath.answer;
                e.expr = newMath.expr;
                window.addFloatingText(e.x, e.y - 30, `تطابق عبقري! -95`, '#00ff88', 18);
                window.spawnParticles(e.x, e.y, '#00ff88', 18);
                if (e.hp <= 0) {
                    window.destroyEnemy(i, true);
                }
            } else {
                window.addFloatingText(e.x, e.y - 24, `✓ ${e.expr} = ${p.coreX}`, '#00ff88', 16);
                window.destroyEnemy(i, true);
            }
        }
    }

    if (matchedCount > 0) {
        window.SoundEngine.mathZap();
        window.GameState.screenShake = Math.min(14, 5 + matchedCount * 3);
        if (window.triggerGamepadHaptic) {
            window.triggerGamepadHaptic(120, 0.7, 0.8);
        }
    } else if (manualPulse) {
        p.pulseWaveRadius = 10;
        p.pulseWaveAlpha = 1.0;
        window.SoundEngine.kineticShot();
        for (const e of window.GameState.enemies) {
            const d = Math.hypot(e.x - p.x, e.y - p.y);
            if (d < 220 && d > 1) {
                const pushAngle = Math.atan2(e.y - p.y, e.x - p.x);
                e.x += Math.cos(pushAngle) * 36;
                e.y += Math.sin(pushAngle) * 36;
            }
        }
        if (window.triggerGamepadHaptic) {
            window.triggerGamepadHaptic(60, 0.4, 0.4);
        }
    }
};

window.destroyEnemy = function(index, solvedByMath = false) {
    const e = window.GameState.enemies[index];
    if (!e) return;

    window.spawnParticles(e.x, e.y, e.color, e.isBoss ? 40 : 18);
    window.GameState.kills++;
    const killsText = document.getElementById('killsText');
    if (killsText) killsText.textContent = window.GameState.kills;

    const newWave = Math.floor(window.GameState.kills / 12) + 1;
    if (newWave > window.GameState.wave) {
        window.GameState.wave = newWave;
        const waveText = document.getElementById('waveText');
        if (waveText) waveText.textContent = `WAVE ${window.GameState.wave}`;
        window.addFloatingText(window.GameState.player.x, window.GameState.player.y - 60, `🌟 الموجة الرياضية ${window.GameState.wave}!`, '#ffb800', 22);
    }

    const gemCount = e.isBoss ? 8 : (solvedByMath ? 3 : 1);
    for (let g = 0; g < gemCount; g++) {
        window.GameState.gems.push({
            x: e.x + (Math.random() - 0.5) * 32,
            y: e.y + (Math.random() - 0.5) * 32,
            value: e.isBoss ? 10 : 4,
            type: Math.random() < 0.18 ? 'heal' : 'matter',
            radius: 7
        });
    }

    window.GameState.enemies.splice(index, 1);
};
