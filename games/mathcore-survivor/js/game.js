/**
 * MathCore: Sandbox Survivor - Main Game Engine Loop & Lifecycle
 */

let lastSpawnTick = 0;
let lastBannerVisible = null;

window.resizeCanvas = function(canvas) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas._dpr = dpr;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    window.GameState.viewW = w;
    window.GameState.viewH = h;
};

window.triggerGameOver = function() {
    const gs = window.GameState;
    gs.gameOver = true;
    gs.paused = true;
    window.SoundEngine?.hurt?.();
    if (window.triggerGamepadHaptic) {
        window.triggerGamepadHaptic(220, 0.9, 0.9);
    }

    const goScore = document.getElementById('goScore');
    const goHigh = document.getElementById('goHighScore');
    const goWave = document.getElementById('goWave');
    const goKills = document.getElementById('goKills');
    const newRecBadge = document.getElementById('gameOverNewRecordBadge');

    if (goScore) goScore.textContent = String(gs.score);
    if (goHigh) goHigh.textContent = String(gs.highScore);
    if (goWave) goWave.textContent = `WAVE ${gs.wave}`;
    if (goKills) goKills.textContent = String(gs.kills);
    if (newRecBadge) newRecBadge.classList.toggle('hidden', !gs.isNewRecord);

    document.getElementById('pauseModal')?.classList.add('hidden');
    document.getElementById('helpModal')?.classList.add('hidden');
    const modderDrawer = document.getElementById('modderDrawer');
    modderDrawer?.classList.remove('drawer-open');

    const goModal = document.getElementById('gameOverModal');
    if (goModal) {
        goModal.classList.remove('hidden');
        window.InputState.goFocusIdx = 0;
        window.applyGameOverFocus?.();
    }
};

window.updateGame = function() {
    // Always poll gamepad so Help, Pause, Modder, and GameOver remain 100% controller navigable
    const gpState = window.pollGamepad();

    const gs = window.GameState;
    if (gs.paused || gs.gameOver) {
        if (lastBannerVisible !== false) {
            const banner = document.getElementById('matchAlertBanner');
            banner?.classList.remove('is-visible');
            lastBannerVisible = false;
        }
        return;
    }

    gs.time++;
    const p = gs.player;
    if (p.invulnTimer > 0) p.invulnTimer--;

    // 1. Movement: Left Stick / Touch / WASD with Inertia
    let mx = gpState.moveX;
    let my = gpState.moveY;
    if (window.InputState.keys['KeyW'] || window.InputState.keys['ArrowUp']) my -= 1;
    if (window.InputState.keys['KeyS'] || window.InputState.keys['ArrowDown']) my += 1;
    if (window.InputState.keys['KeyA'] || window.InputState.keys['ArrowLeft']) mx -= 1;
    if (window.InputState.keys['KeyD'] || window.InputState.keys['ArrowRight']) mx += 1;

    const mag = Math.hypot(mx, my);
    if (mag > 1) {
        mx /= mag;
        my /= mag;
    }

    p.vx = p.vx * 0.82 + mx * window.SandboxConfig.playerSpeed * 0.18;
    p.vy = p.vy * 0.82 + my * window.SandboxConfig.playerSpeed * 0.18;
    p.x = Math.max(50, Math.min(window.WORLD_SIZE - 50, p.x + p.vx));
    p.y = Math.max(50, Math.min(window.WORLD_SIZE - 50, p.y + p.vy));

    // Thruster Particle Trail (Pool-capped)
    if (mag > 0.1 && gs.particles.length < 150 && Math.random() < 0.35) {
        gs.particles.push({
            x: p.x - Math.cos(p.aimAngle) * 14,
            y: p.y - Math.sin(p.aimAngle) * 14,
            vx: -p.vx * 0.5 + (Math.random() - 0.5),
            vy: -p.vy * 0.5 + (Math.random() - 0.5),
            radius: Math.random() * 2.2 + 1.0,
            color: '#00f3ff',
            alpha: 0.7,
            decay: 0.055
        });
    }

    // Gentle Base Core Repair Aura
    const base = gs.baseCore;
    if (p.hp < p.maxHp && Math.hypot(p.x - base.x, p.y - base.y) <= 110) {
        base.healTick++;
        if (base.healTick >= 45) {
            base.healTick = 0;
            p.hp = Math.min(p.maxHp, p.hp + 2);
            window.updateHpHUD();
            window.addFloatingText(p.x, p.y - 26, '+2 ♥', '#00ff88', 13);
        }
    } else {
        base.healTick = 0;
    }

    // Smooth camera follow
    gs.camera.x += (p.x - gs.camera.x) * 0.14;
    gs.camera.y += (p.y - gs.camera.y) * 0.14;

    // Screen Shake Decay
    if (gs.screenShake > 0) gs.screenShake *= 0.84;
    if (gs.screenShake < 0.2) gs.screenShake = 0;

    // Pulse Wave
    if (p.pulseWaveAlpha > 0) {
        p.pulseWaveRadius += 14;
        p.pulseWaveAlpha -= 0.045;
    }

    // Combo streak decay
    if (gs.combo > 0 && Date.now() - gs.lastKillTime > 3200) {
        gs.combo = 0;
        window.updateScoreHUD();
    }

    // 2. Automatic Math Resonance Detection (cached banner DOM update)
    const rangeSq = window.SandboxConfig.beamRange * window.SandboxConfig.beamRange;
    let hasMatchingInRange = false;
    for (let i = 0; i < gs.enemies.length; i++) {
        const e = gs.enemies[i];
        if (e.answer === p.coreX) {
            const dx = e.x - p.x;
            const dy = e.y - p.y;
            if (dx * dx + dy * dy <= rangeSq) {
                hasMatchingInRange = true;
                break;
            }
        }
    }

    if (hasMatchingInRange !== lastBannerVisible) {
        const banner = document.getElementById('matchAlertBanner');
        banner?.classList.toggle('is-visible', hasMatchingInRange);
        lastBannerVisible = hasMatchingInRange;
    }

    if (hasMatchingInRange && gs.time - p.lastAutoZap > 12) {
        p.lastAutoZap = gs.time;
        window.triggerMathResonanceCheck(false);
    }

    // 3. Kinetic Blaster (Left Click or Gamepad R2)
    if ((window.InputState.mouseDownLeft || gpState.firing) && gs.time - p.lastKineticShot > 10) {
        p.lastKineticShot = gs.time;
        gs.projectiles.push({
            x: p.x + Math.cos(p.aimAngle) * 24,
            y: p.y + Math.sin(p.aimAngle) * 24,
            vx: Math.cos(p.aimAngle) * 12.5,
            vy: Math.sin(p.aimAngle) * 12.5,
            color: '#00f3ff',
            damage: 11,
            life: 50
        });
        window.SoundEngine.kineticShot();
    }

    // 4. Enemy Spawning
    const spawnInterval = Math.max(32, Math.floor(130 / window.SandboxConfig.enemySpawnMultiplier) - gs.wave * 4);
    if (gs.time - lastSpawnTick > spawnInterval && gs.enemies.length < 30) {
        lastSpawnTick = gs.time;
        window.spawnEnemy(false);
    }

    // 5. Update Structures
    for (let i = gs.structures.length - 1; i >= 0; i--) {
        const s = gs.structures[i];
        if (s.cooldown > 0) s.cooldown -= window.SandboxConfig.turretFireRateMultiplier;

        if (s.id === 'sine_healer') {
            if (s.cooldown <= 0) {
                s.cooldown = 60;
                if (Math.hypot(p.x - s.x, p.y - s.y) <= 220 && p.hp < p.maxHp) {
                    p.hp = Math.min(p.maxHp, p.hp + 6);
                    window.updateHpHUD();
                    window.addFloatingText(p.x, p.y - 25, '+6 ♥', '#00ff88', 14);
                }
            }
        } else if (s.id !== 'matrix_wall' && s.cooldown <= 0) {
            const targetIdx = gs.enemies.findIndex(e => {
                const d = Math.hypot(e.x - s.x, e.y - s.y);
                if (d > 340) return false;
                if (s.id === 'even_turret') return Math.abs(e.answer) % 2 === 0;
                if (s.id === 'odd_turret') return Math.abs(e.answer) % 2 === 1;
                if (s.id === 'mod3_coil') return e.answer !== 0 && e.answer % 3 === 0;
                return false;
            });

            if (targetIdx !== -1) {
                const target = gs.enemies[targetIdx];
                s.cooldown = 50;
                window.createLightningBeam(s.x, s.y, target.x, target.y, s.color, 12);
                target.hp -= 26;
                target.hitFlash = 5;
                window.SoundEngine.kineticShot();
                if (target.hp <= 0) {
                    window.addFloatingText(target.x, target.y - 20, `${s.formula} ✓`, s.color, 15);
                    window.destroyEnemy(targetIdx, true);
                }
            }
        }
    }

    // 6. Update Projectiles
    for (let i = gs.projectiles.length - 1; i >= 0; i--) {
        const proj = gs.projectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life--;
        if (proj.life <= 0) {
            gs.projectiles.splice(i, 1);
            continue;
        }
        for (let j = gs.enemies.length - 1; j >= 0; j--) {
            const e = gs.enemies[j];
            if (Math.hypot(proj.x - e.x, proj.y - e.y) <= e.radius + 6) {
                e.hp -= proj.damage;
                e.hitFlash = 4;
                e.x += proj.vx * 0.45;
                e.y += proj.vy * 0.45;
                window.spawnParticles(proj.x, proj.y, '#00f3ff', 4);
                gs.projectiles.splice(i, 1);
                if (e.hp <= 0) {
                    window.destroyEnemy(j, false);
                }
                break;
            }
        }
    }

    // 7. Update Enemies & Collisions
    for (let i = gs.enemies.length - 1; i >= 0; i--) {
        const e = gs.enemies[i];
        e.rotation += 0.025;
        if (e.hitFlash > 0) e.hitFlash--;

        const angle = Math.atan2(p.y - e.y, p.x - e.x);
        e.vx = Math.cos(angle) * e.speed;
        e.vy = Math.sin(angle) * e.speed;

        // Collision with Structures
        for (let sIdx = gs.structures.length - 1; sIdx >= 0; sIdx--) {
            const s = gs.structures[sIdx];
            const distS = Math.hypot(e.x - s.x, e.y - s.y);
            if (distS < e.radius + 26) {
                const pushAngle = Math.atan2(e.y - s.y, e.x - s.x);
                e.x = s.x + Math.cos(pushAngle) * (e.radius + 28);
                e.y = s.y + Math.sin(pushAngle) * (e.radius + 28);
                s.hp -= 0.4;
                if (s.id === 'matrix_wall') {
                    e.hp -= 0.7;
                }
                if (s.hp <= 0) {
                    window.spawnParticles(s.x, s.y, s.color, 12);
                    gs.structures.splice(sIdx, 1);
                }
            }
        }

        e.x += e.vx;
        e.y += e.vy;

        // Collision with Player (with fair invulnerability frames)
        const distP = Math.hypot(e.x - p.x, e.y - p.y);
        if (distP < e.radius + p.radius) {
            const pushAngle = Math.atan2(e.y - p.y, e.x - p.x);
            e.x += Math.cos(pushAngle) * 34;
            e.y += Math.sin(pushAngle) * 34;

            if (!window.SandboxConfig.godMode && p.invulnTimer <= 0) {
                const dmg = e.isBoss ? 18 : 10;
                p.hp -= dmg;
                p.invulnTimer = 38;
                gs.screenShake = 8;
                window.SoundEngine.hurt();
                window.updateHpHUD();
                window.addFloatingText(p.x, p.y - 25, `-${dmg} درع`, '#ff007f', 15);
                if (window.triggerGamepadHaptic) {
                    window.triggerGamepadHaptic(140, 0.75, 0.75);
                }

                if (p.hp <= 0) {
                    window.triggerGameOver();
                    return;
                }
            }
        }
    }

    // 8. Update Spark Orbs (now properly paused when paused, plus grants +1 energy pickup)
    for (let i = gs.sparkOrbs.length - 1; i >= 0; i--) {
        const sp = gs.sparkOrbs[i];
        const dx = p.x - sp.x;
        const dy = p.y - sp.y;
        const dist = Math.hypot(dx, dy);

        if (dist < p.radius + 8) {
            gs.sparkOrbs.splice(i, 1);
            if (!window.SandboxConfig.infiniteMatter) {
                gs.matter += 1;
                window.updateMatterHUD();
            }
            window.SoundEngine.pickup();
            continue;
        }

        sp.x += (dx / dist) * sp.speed;
        sp.y += (dy / dist) * sp.speed;
        sp.speed = Math.min(18, sp.speed + 0.42);
    }

    // 9. Update Beams & Dissolve Particles
    for (let i = gs.lightningBeams.length - 1; i >= 0; i--) {
        gs.lightningBeams[i].life--;
        if (gs.lightningBeams[i].life <= 0) gs.lightningBeams.splice(i, 1);
    }

    for (let i = gs.particles.length - 1; i >= 0; i--) {
        const pt = gs.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vx *= 0.94;
        pt.vy *= 0.94;
        pt.alpha -= pt.decay;
        if (pt.alpha <= 0) gs.particles.splice(i, 1);
    }

    // 10. Fast Decay Floating Texts
    for (let i = gs.floatingTexts.length - 1; i >= 0; i--) {
        const ft = gs.floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.036;
        if (ft.alpha <= 0) gs.floatingTexts.splice(i, 1);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    window.resizeCanvas(canvas);
    window.addEventListener('resize', () => window.resizeCanvas(canvas));
    window.initCanvasControls(canvas);

    window.renderBuildBarUI();
    window.initSandboxModderUI();
    window.updateCoreXHUD();
    window.updateWaveHUD();
    window.updateScoreHUD();
    window.updateMatterHUD();
    window.updateHpHUD();

    // Spawn 4 initial enemies cleanly (held paused behind intro modal until player starts)
    for (let i = 0; i < 4; i++) window.spawnEnemy(false);

    // HUD Buttons
    document.getElementById('modderToggleBtn')?.addEventListener('click', () => window.toggleModderDrawer());
    document.getElementById('closeModderBtn')?.addEventListener('click', () => window.toggleModderDrawer(false));
    document.getElementById('pauseToggleBtn')?.addEventListener('click', window.openPauseModal);
    document.getElementById('placeBuildBtn')?.addEventListener('click', window.placeSelectedBuilding);
    document.getElementById('empPulseBtn')?.addEventListener('click', () => window.triggerMathResonanceCheck(true));

    document.getElementById('soundToggleBtn')?.addEventListener('click', () => {
        window.SoundEngine.muted = !window.SoundEngine.muted;
        const btn = document.getElementById('soundToggleBtn');
        const icon = document.getElementById('soundIcon');
        if (icon) {
            icon.textContent = window.SoundEngine.muted ? '🔇' : '🔊';
        }
        if (btn) {
            btn.classList.toggle('text-rose', window.SoundEngine.muted);
            btn.classList.toggle('text-cyan', !window.SoundEngine.muted);
        }
    });

    const helpModal = document.getElementById('helpModal');
    document.getElementById('helpToggleBtn')?.addEventListener('click', () => {
        if (window.GameState.gameOver) return;
        const hidden = helpModal?.classList.contains('hidden');
        if (hidden) {
            helpModal.classList.remove('hidden');
            window.syncPauseStateFromModals();
        } else {
            window.dismissHelpModal();
        }
    });
    document.getElementById('startPlayingBtn')?.addEventListener('click', window.dismissHelpModal);

    // Pause Modal Buttons
    document.getElementById('btnPauseResume')?.addEventListener('click', window.closePauseModal);
    document.getElementById('btnPauseModder')?.addEventListener('click', () => window.toggleModderDrawer(true));
    document.getElementById('btnPauseHelp')?.addEventListener('click', () => {
        document.getElementById('pauseModal')?.classList.add('hidden');
        document.getElementById('helpModal')?.classList.remove('hidden');
        window.syncPauseStateFromModals();
    });
    document.getElementById('btnPauseRestart')?.addEventListener('click', () => {
        lastSpawnTick = 0;
        window.resetMathCoreGame(true);
    });

    // Game Over Replay Button
    document.getElementById('btnGameOverRetry')?.addEventListener('click', () => {
        lastSpawnTick = 0;
        window.resetMathCoreGame(true);
    });

    window.syncPauseStateFromModals();

    function loop() {
        window.updateGame();
        window.drawGame(ctx, canvas);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
});
