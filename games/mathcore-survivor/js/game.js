/**
 * MathCore: Sandbox Survivor - Main Game Engine Loop & Bootstrap
 */

let lastSpawnTick = 0;

window.resizeCanvas = function(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
};

window.updateGame = function() {
    if (window.GameState.paused) return;
    window.GameState.time++;

    const p = window.GameState.player;
    const gpState = window.pollGamepad();

    // 1. Movement: Left Stick / WASD with Inertia
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

    // Thruster Particle Trail
    if (mag > 0.1 && Math.random() < 0.4) {
        window.GameState.particles.push({
            x: p.x - Math.cos(p.aimAngle) * 14,
            y: p.y - Math.sin(p.aimAngle) * 14,
            vx: -p.vx * 0.5 + (Math.random() - 0.5),
            vy: -p.vy * 0.5 + (Math.random() - 0.5),
            radius: Math.random() * 2.5 + 1.0,
            color: '#00f3ff',
            alpha: 0.7,
            decay: 0.05
        });
    }

    // Camera follow
    window.GameState.camera.x += (p.x - window.GameState.camera.x) * 0.12;
    window.GameState.camera.y += (p.y - window.GameState.camera.y) * 0.12;

    // Screen Shake Decay
    if (window.GameState.screenShake > 0) window.GameState.screenShake *= 0.84;
    if (window.GameState.screenShake < 0.2) window.GameState.screenShake = 0;

    // Pulse Wave
    if (p.pulseWaveAlpha > 0) {
        p.pulseWaveRadius += 14;
        p.pulseWaveAlpha -= 0.04;
    }

    // Combo streak decay
    if (window.GameState.combo > 0 && Date.now() - window.GameState.lastKillTime > 3200) {
        window.GameState.combo = 0;
        window.updateScoreHUD();
    }

    // 2. Automatic Math Resonance Detection
    const matchingEnemiesOnScreen = window.GameState.enemies.filter(
        e => e.answer === p.coreX && Math.hypot(e.x - p.x, e.y - p.y) <= window.SandboxConfig.beamRange
    );
    const banner = document.getElementById('matchAlertBanner');
    if (banner) {
        if (matchingEnemiesOnScreen.length > 0) {
            banner.classList.remove('opacity-0', 'scale-90');
            banner.classList.add('opacity-100', 'scale-100');
            if (window.GameState.time - p.lastAutoZap > 12) {
                p.lastAutoZap = window.GameState.time;
                window.triggerMathResonanceCheck(false);
            }
        } else {
            banner.classList.add('opacity-0', 'scale-90');
            banner.classList.remove('opacity-100', 'scale-100');
        }
    }

    // 3. Kinetic Blaster (Left Click or Gamepad R2)
    if ((window.InputState.mouseDownLeft || gpState.firing) && window.GameState.time - p.lastKineticShot > 10) {
        p.lastKineticShot = window.GameState.time;
        window.GameState.projectiles.push({
            x: p.x + Math.cos(p.aimAngle) * 24,
            y: p.y + Math.sin(p.aimAngle) * 24,
            vx: Math.cos(p.aimAngle) * 12,
            vy: Math.sin(p.aimAngle) * 12,
            color: '#00f3ff',
            damage: 10,
            life: 50
        });
        window.SoundEngine.kineticShot();
    }

    // 4. Enemy Spawning
    const spawnInterval = Math.max(30, Math.floor(130 / window.SandboxConfig.enemySpawnMultiplier) - window.GameState.wave * 4);
    if (window.GameState.time - lastSpawnTick > spawnInterval && window.GameState.enemies.length < 32) {
        lastSpawnTick = window.GameState.time;
        window.spawnEnemy(false);
    }

    // 5. Update Structures
    for (let i = window.GameState.structures.length - 1; i >= 0; i--) {
        const s = window.GameState.structures[i];
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
            const targetIdx = window.GameState.enemies.findIndex(e => {
                const d = Math.hypot(e.x - s.x, e.y - s.y);
                if (d > 340) return false;
                if (s.id === 'even_turret') return Math.abs(e.answer) % 2 === 0;
                if (s.id === 'odd_turret') return Math.abs(e.answer) % 2 === 1;
                if (s.id === 'mod3_coil') return e.answer !== 0 && e.answer % 3 === 0;
                return false;
            });

            if (targetIdx !== -1) {
                const target = window.GameState.enemies[targetIdx];
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
    for (let i = window.GameState.projectiles.length - 1; i >= 0; i--) {
        const proj = window.GameState.projectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life--;
        if (proj.life <= 0) {
            window.GameState.projectiles.splice(i, 1);
            continue;
        }
        for (let j = window.GameState.enemies.length - 1; j >= 0; j--) {
            const e = window.GameState.enemies[j];
            if (Math.hypot(proj.x - e.x, proj.y - e.y) <= e.radius + 6) {
                e.hp -= proj.damage;
                e.hitFlash = 4;
                e.x += proj.vx * 0.5;
                e.y += proj.vy * 0.5;
                window.spawnParticles(proj.x, proj.y, '#00f3ff', 4);
                window.GameState.projectiles.splice(i, 1);
                if (e.hp <= 0) {
                    window.destroyEnemy(j, false);
                }
                break;
            }
        }
    }

    // 7. Update Enemies
    for (let i = window.GameState.enemies.length - 1; i >= 0; i--) {
        const e = window.GameState.enemies[i];
        e.rotation += 0.025;
        if (e.hitFlash > 0) e.hitFlash--;

        const angle = Math.atan2(p.y - e.y, p.x - e.x);
        e.vx = Math.cos(angle) * e.speed;
        e.vy = Math.sin(angle) * e.speed;

        // Collision with Structures
        for (let sIdx = window.GameState.structures.length - 1; sIdx >= 0; sIdx--) {
            const s = window.GameState.structures[sIdx];
            const distS = Math.hypot(e.x - s.x, e.y - s.y);
            if (distS < e.radius + 26) {
                const pushAngle = Math.atan2(e.y - s.y, e.x - s.x);
                e.x = s.x + Math.cos(pushAngle) * (e.radius + 28);
                e.y = s.y + Math.sin(pushAngle) * (e.radius + 28);
                s.hp -= 0.4;
                if (s.id === 'matrix_wall') {
                    e.hp -= 0.6;
                }
                if (s.hp <= 0) {
                    window.spawnParticles(s.x, s.y, s.color, 15);
                    window.GameState.structures.splice(sIdx, 1);
                }
            }
        }

        e.x += e.vx;
        e.y += e.vy;

        // Collision with Player
        const distP = Math.hypot(e.x - p.x, e.y - p.y);
        if (distP < e.radius + p.radius) {
            const pushAngle = Math.atan2(e.y - p.y, e.x - p.x);
            e.x += Math.cos(pushAngle) * 30;
            e.y += Math.sin(pushAngle) * 30;

            if (!window.SandboxConfig.godMode) {
                p.hp -= e.isBoss ? 15 : 8;
                window.GameState.screenShake = 8;
                window.SoundEngine.hurt();
                window.updateHpHUD();
                window.addFloatingText(p.x, p.y - 25, `-8 درع`, '#ff007f', 15);
                if (window.triggerGamepadHaptic) {
                    window.triggerGamepadHaptic(150, 0.8, 0.8);
                }

                if (p.hp <= 0) {
                    p.hp = p.maxHp;
                    p.x = window.GameState.baseCore.x;
                    p.y = window.GameState.baseCore.y + 80;
                    window.updateHpHUD();
                    window.addFloatingText(p.x, p.y - 40, '🔄 تمت إعادة شحن درع المركبة!', '#00f3ff', 18);
                }
            }
        }
    }

    // 8. Update Beams & Dissolve Particles
    for (let i = window.GameState.lightningBeams.length - 1; i >= 0; i--) {
        window.GameState.lightningBeams[i].life--;
        if (window.GameState.lightningBeams[i].life <= 0) window.GameState.lightningBeams.splice(i, 1);
    }

    for (let i = window.GameState.particles.length - 1; i >= 0; i--) {
        const pt = window.GameState.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vx *= 0.94;
        pt.vy *= 0.94;
        pt.alpha -= pt.decay;
        if (pt.alpha <= 0) window.GameState.particles.splice(i, 1);
    }

    // 9. Fast Decay Floating Texts (ZERO LINGERING ON SCREEN)
    for (let i = window.GameState.floatingTexts.length - 1; i >= 0; i--) {
        const ft = window.GameState.floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.035; // Fades completely within ~28 frames
        if (ft.alpha <= 0) window.GameState.floatingTexts.splice(i, 1);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    window.resizeCanvas(canvas);
    window.addEventListener('resize', () => window.resizeCanvas(canvas));
    window.initCanvasControls(canvas);

    window.renderBuildBarUI();
    window.initSandboxModderUI();
    window.updateWaveHUD();
    window.updateScoreHUD();
    window.updateMatterHUD();
    window.updateHpHUD();

    // Spawn 4 initial enemies
    for (let i = 0; i < 4; i++) window.spawnEnemy(false);

    // Event listeners
    document.getElementById('modderToggleBtn')?.addEventListener('click', window.toggleModderDrawer);
    document.getElementById('closeModderBtn')?.addEventListener('click', window.toggleModderDrawer);
    document.getElementById('placeBuildBtn')?.addEventListener('click', window.placeSelectedBuilding);
    document.getElementById('empPulseBtn')?.addEventListener('click', () => window.triggerMathResonanceCheck(true));

    document.getElementById('soundToggleBtn')?.addEventListener('click', () => {
        window.SoundEngine.muted = !window.SoundEngine.muted;
        const icon = document.getElementById('soundIcon');
        if (icon) {
            icon.className = window.SoundEngine.muted
                ? 'fa-solid fa-volume-xmark text-rose-400'
                : 'fa-solid fa-volume-high text-cyan-300';
        }
    });

    const helpModal = document.getElementById('helpModal');
    document.getElementById('helpToggleBtn')?.addEventListener('click', () => {
        helpModal?.classList.toggle('hidden');
    });
    document.getElementById('startPlayingBtn')?.addEventListener('click', () => {
        helpModal?.classList.add('hidden');
        window.SoundEngine.init();
    });

    function loop() {
        window.updateGame();
        window.drawGame(ctx, canvas);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
});
