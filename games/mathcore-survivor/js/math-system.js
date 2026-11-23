/**
 * MathCore: Sandbox Survivor - Math Equation Engine & PlayStation Combo Solver
 */

window.generateMathChallenge = function(waveNum, forceBoss = false) {
    const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 16, 20, -1, -2, -3, -4];
    const maxIndex = Math.min(pool.length, 6 + waveNum * 2);
    let answer = pool[Math.floor(Math.random() * maxIndex)];
    if (forceBoss) {
        const bossTargets = [6, 8, 10, 12, 15, 16, 20];
        answer = bossTargets[Math.floor(Math.random() * bossTargets.length)];
    }

    const mode = window.SandboxConfig.mathMode;
    let expr = `${answer}`;

    if (mode === 'numbers') {
        expr = `${answer}`;
    } else if (mode === 'arithmetic') {
        const roll = Math.random();
        if (roll < 0.4) {
            const a = Math.floor(Math.random() * 6) + 1;
            const b = answer - a;
            expr = b >= 0 ? `${a} + ${b}` : `${a} - ${Math.abs(b)}`;
        } else if (roll < 0.75 && answer % 2 === 0 && answer !== 0) {
            expr = `2 × ${answer / 2}`;
        } else if (roll < 0.9 && answer % 3 === 0 && answer !== 0) {
            expr = `3 × ${answer / 3}`;
        } else {
            const extra = Math.floor(Math.random() * 4) + 1;
            expr = `${answer + extra} - ${extra}`;
        }
    } else if (mode === 'algebra') {
        const roll = Math.random();
        if (roll < 0.45 && answer !== 0) {
            const a = [2, 3][Math.floor(Math.random() * 2)];
            expr = `${a}x = ${a * answer}`;
        } else if (roll < 0.75) {
            const b = Math.floor(Math.random() * 5) + 1;
            expr = `x + ${b} = ${answer + b}`;
        } else {
            const b = Math.floor(Math.random() * 4) + 1;
            expr = `x - ${b} = ${answer - b}`;
        }
    } else if (mode === 'chaos') {
        if (answer === 4) expr = `√16`;
        else if (answer === 9) expr = `3²`;
        else if (answer === 8) expr = `2³`;
        else if (answer === 16) expr = `4²`;
        else {
            const b = Math.floor(Math.random() * 4) + 2;
            expr = `2x - ${b} = ${2 * answer - b}`;
        }
    }

    return { answer, expr };
};

// Calculate the single best PlayStation button to reach target
window.findSuggestedPsButton = function(currentX, targetX) {
    if (currentX === targetX) return null;
    let bestOp = null;
    let minDiff = Infinity;

    for (let i = 0; i < 4; i++) {
        const opId = window.SandboxConfig.buttonOps[i];
        const opObj = window.AVAILABLE_MATH_OPS.find(o => o.id === opId);
        if (!opObj) continue;
        const res = opObj.fn(currentX);
        const diff = Math.abs(res - targetX);
        if (diff < minDiff) {
            minDiff = diff;
            bestOp = { index: i, ...opObj };
        }
    }
    return bestOp;
};

window.applyMathButton = function(slotIndex) {
    if (window.GameState.paused || window.GameState.gameOver) return;
    window.SoundEngine.init();
    const opId = window.SandboxConfig.buttonOps[slotIndex];
    const opObj = window.AVAILABLE_MATH_OPS.find(o => o.id === opId) || window.AVAILABLE_MATH_OPS[0];
    const oldX = window.GameState.player.coreX;
    let nextX = opObj.fn(oldX);
    nextX = Math.max(-99, Math.min(999, Math.trunc(nextX)));
    window.GameState.player.coreX = nextX;

    // Visual button press animation on PlayStation UI
    const btnEl = document.getElementById(`psMathBtn${slotIndex}`);
    if (btnEl) {
        btnEl.classList.add('pressed');
        setTimeout(() => btnEl.classList.remove('pressed'), 120);
    }

    window.updateCoreXHUD();

    // PlayStation Melodic Sound
    window.SoundEngine.playPsButton(slotIndex);

    // Expanding Ring
    window.GameState.player.pulseWaveRadius = 15;
    window.GameState.player.pulseWaveAlpha = 0.85;

    // Dual Haptic Feedback
    if (window.triggerGamepadHaptic) {
        window.triggerGamepadHaptic(45, 0.3, 0.3);
    }

    // Immediately trigger resonance check
    window.triggerMathResonanceCheck(true);
};

window.stepCoreX = function(delta) {
    if (window.GameState.paused || window.GameState.gameOver) return;
    window.SoundEngine.init();
    window.GameState.player.coreX = Math.max(-99, Math.min(999, window.GameState.player.coreX + delta));
    window.updateCoreXHUD();
    window.SoundEngine.playPsButton(delta > 0 ? 0 : 1);
    window.triggerMathResonanceCheck(true);
};

window.triggerMathResonanceCheck = function(manualPulse = false) {
    if (window.GameState.paused || window.GameState.gameOver) return;
    const p = window.GameState.player;
    const range = window.SandboxConfig.beamRange * (manualPulse ? 1.25 : 1.0);
    let matchedCount = 0;

    const now = Date.now();
    const isCombo = (now - window.GameState.lastKillTime) < 3200;

    for (let i = window.GameState.enemies.length - 1; i >= 0; i--) {
        const e = window.GameState.enemies[i];
        const dist = Math.hypot(e.x - p.x, e.y - p.y);

        if (e.answer === p.coreX && dist <= range) {
            matchedCount++;
            window.createLightningBeam(p.x, p.y, e.x, e.y, '#00ff88', 16);

            // Combo handling
            if (isCombo) {
                window.GameState.combo = Math.min(5, window.GameState.combo + 1);
            } else {
                window.GameState.combo = 1;
            }
            window.GameState.lastKillTime = now;

            if (window.GameState.combo > 1) {
                window.SoundEngine.comboChime(window.GameState.combo);
            }

            if (e.isBoss) {
                e.hp -= 110;
                e.hitFlash = 10;
                const newMath = window.generateMathChallenge(window.GameState.wave, true);
                e.answer = newMath.answer;
                e.expr = newMath.expr;
                window.addFloatingText(e.x, e.y - 30, `صاعقة الزعيم! -110`, '#ff007f', 18);
                window.spawnParticles(e.x, e.y, '#ff007f', 24);
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
            window.triggerGamepadHaptic(120, 0.7, 0.9);
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

    window.spawnParticles(e.x, e.y, e.color, e.isBoss ? 45 : 20);

    // Smooth Flying Energy Reward directly to player
    window.spawnEnergyReward(e.x, e.y, e.isBoss ? 8 : 4);

    // Score & Kills
    window.GameState.kills++;
    if (solvedByMath) {
        window.GameState.mathSolved = (window.GameState.mathSolved || 0) + 1;
        const modeKey = window.SandboxConfig?.mathMode || 'algebra';
        window.ArcadeCore?.Progress?.recordAnswer('mathcore-survivor', modeKey, true);
    }
    const comboMult = Math.max(1, window.GameState.combo);
    const earnedPoints = (e.isBoss ? 500 : 100) * comboMult;
    window.GameState.score += earnedPoints;

    if (window.GameState.score > window.GameState.highScore) {
        window.GameState.highScore = window.GameState.score;
        window.GameState.isNewRecord = true;
        localStorage.setItem('mathcore_high_score', window.GameState.highScore.toString());
    }

    // Direct Matter reward
    window.GameState.matter += (e.isBoss ? 40 : 12);

    // Wave Progress
    window.GameState.waveProgress++;
    if (window.GameState.waveProgress >= window.GameState.waveGoal) {
        window.advanceWave();
    } else {
        window.updateWaveHUD();
        window.updateScoreHUD();
        window.updateMatterHUD();
    }

    window.GameState.enemies.splice(index, 1);
};

window.advanceWave = function() {
    window.GameState.wave++;
    const spawnedWave = window.GameState.wave;
    window.ArcadeCore?.Progress?.recordSealProgress('mathcore-survivor', Math.min(4, Math.max(0, spawnedWave - 1)));
    window.GameState.waveProgress = 0;
    window.GameState.waveGoal = 6 + window.GameState.wave * 2;

    window.GameState.score += 500; // Wave bonus
    window.SoundEngine.waveClearFanfare();

    window.addFloatingText(
        window.GameState.player.x,
        window.GameState.player.y - 70,
        `🎉 اكتملت الموجة! بداية WAVE ${window.GameState.wave}`,
        '#00ff88',
        22
    );

    // Wave 5, 10, 15... Boss Wave!
    if (window.GameState.wave % 5 === 0) {
        window.SoundEngine.bossAlarm();
        setTimeout(() => {
            if (window.GameState.gameOver || window.GameState.wave !== spawnedWave) return;
            window.spawnEnemy(true);
            window.addFloatingText(window.GameState.player.x, window.GameState.player.y - 90, '⚠️ تحذير: ظهر زعيم المعادلات!', '#ff007f', 24);
        }, 1200);
    }

    window.updateWaveHUD();
    window.updateScoreHUD();
    window.updateMatterHUD();
};
