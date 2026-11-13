/**
 * MathCore: Sandbox Survivor - 2D Neon Vector Renderer with PlayStation Aesthetics & Tactical HUD
 */

window.drawGame = function(ctx, canvas) {
    ctx.save();

    // 1. Deep OLED Cyber Background
    ctx.fillStyle = '#060814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply Smooth Camera Follow & Screen Shake
    const shakeX = (Math.random() - 0.5) * window.GameState.screenShake;
    const shakeY = (Math.random() - 0.5) * window.GameState.screenShake;
    const camOffsetX = canvas.width / 2 - window.GameState.camera.x + shakeX;
    const camOffsetY = canvas.height / 2 - window.GameState.camera.y + shakeY;
    ctx.translate(camOffsetX, camOffsetY);

    // 2. Parallax Cyber Stars
    for (const st of window.GameState.stars) {
        ctx.fillStyle = st.color;
        ctx.globalAlpha = st.alpha;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 3. Mathematical Coordinate Grid (Cartesian Plane)
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.06)';
    const startX = Math.max(0, Math.floor((window.GameState.camera.x - canvas.width / 2) / window.GRID_SIZE) * window.GRID_SIZE);
    const endX = Math.min(window.WORLD_SIZE, window.GameState.camera.x + canvas.width / 2 + window.GRID_SIZE);
    const startY = Math.max(0, Math.floor((window.GameState.camera.y - canvas.height / 2) / window.GRID_SIZE) * window.GRID_SIZE);
    const endY = Math.min(window.WORLD_SIZE, window.GameState.camera.y + canvas.height / 2 + window.GRID_SIZE);

    ctx.beginPath();
    for (let x = startX; x <= endX; x += window.GRID_SIZE) {
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += window.GRID_SIZE) {
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // World Boundary
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.5)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, window.WORLD_SIZE, window.WORLD_SIZE);

    // 4. Defense Turret Blueprint Placement Reticle
    const buildCell = window.getTargetBuildCell();
    const activeBlueprint = window.BUILDINGS[window.GameState.selectedBuildIndex];
    if (activeBlueprint) {
        ctx.save();
        ctx.strokeStyle = activeBlueprint.color;
        ctx.fillStyle = `${activeBlueprint.color}15`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(buildCell.gx - window.GRID_SIZE / 2 + 3, buildCell.gy - window.GRID_SIZE / 2 + 3, window.GRID_SIZE - 6, window.GRID_SIZE - 6);
        ctx.fillRect(buildCell.gx - window.GRID_SIZE / 2 + 3, buildCell.gy - window.GRID_SIZE / 2 + 3, window.GRID_SIZE - 6, window.GRID_SIZE - 6);
        ctx.restore();
    }

    // 5. Central Base Core (النواة الأم)
    const base = window.GameState.baseCore;
    ctx.save();
    ctx.translate(base.x, base.y);
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, base.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(window.GameState.time * 0.012);
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
    ctx.strokeRect(-base.radius * 0.7, -base.radius * 0.7, base.radius * 1.4, base.radius * 1.4);
    ctx.restore();

    ctx.fillStyle = '#00f3ff';
    ctx.font = 'bold 12px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('النواة الهندسية الأم', base.x, base.y + base.radius + 18);

    // 6. Draw Built Structures
    for (const s of window.GameState.structures) {
        ctx.save();
        ctx.translate(s.x, s.y);

        if (s.id === 'sine_healer') {
            ctx.beginPath();
            ctx.arc(0, 0, 220, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.12)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        ctx.fillStyle = '#0a1024';
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;

        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(-24, -24, 48, 48, 10);
        } else {
            ctx.rect(-24, -24, 48, 48);
        }
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ffffff';
        ctx.font = '800 13px "JetBrains Mono"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.formula, 0, 0);

        if (s.hp < s.maxHp) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(-20, -32, 40, 4);
            ctx.fillStyle = s.color;
            ctx.fillRect(-20, -32, 40 * (s.hp / s.maxHp), 4);
        }
        ctx.restore();
    }

    // 7. Draw Smooth Flying Energy Sparks (NO STATIC CLUTTER)
    const p = window.GameState.player;
    for (let i = window.GameState.sparkOrbs.length - 1; i >= 0; i--) {
        const sp = window.GameState.sparkOrbs[i];
        // Move towards player craft
        const dx = p.x - sp.x;
        const dy = p.y - sp.y;
        const dist = Math.hypot(dx, dy);

        if (dist < p.radius + 6) {
            window.GameState.sparkOrbs.splice(i, 1);
            continue;
        }

        sp.x += (dx / dist) * sp.speed;
        sp.y += (dy / dist) * sp.speed;
        sp.speed = Math.min(18, sp.speed + 0.4);

        ctx.save();
        ctx.fillStyle = sp.color;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // 8. Player Resonance Ring & Pulse
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, window.SandboxConfig.beamRange, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.restore();

    if (p.pulseWaveAlpha > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.pulseWaveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 136, ${p.pulseWaveAlpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    }

    // 9. Kinetic Projectiles
    for (const proj of window.GameState.projectiles) {
        ctx.save();
        ctx.fillStyle = proj.color;
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // 10. Draw Enemies with Equations
    let closestEnemy = null;
    let minEnemyDist = Infinity;

    for (const e of window.GameState.enemies) {
        const dist = Math.hypot(e.x - p.x, e.y - p.y);
        if (dist < minEnemyDist) {
            minEnemyDist = dist;
            closestEnemy = e;
        }

        const isMatching = e.answer === p.coreX;

        ctx.save();
        ctx.translate(e.x, e.y);

        // Lock-on Glow Ring
        if (isMatching) {
            ctx.beginPath();
            ctx.arc(0, 0, e.radius + 12 + Math.sin(window.GameState.time * 0.25) * 4, 0, Math.PI * 2);
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 16;
            ctx.stroke();
        }

        // Polygon Body
        ctx.save();
        ctx.rotate(e.rotation);
        ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : '#0b1026';
        ctx.strokeStyle = isMatching ? '#00ff88' : e.color;
        ctx.lineWidth = e.isBoss ? 4 : 2.5;
        ctx.shadowColor = isMatching ? '#00ff88' : e.color;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        for (let s = 0; s < e.sides; s++) {
            const a = (s / e.sides) * Math.PI * 2;
            const rx = Math.cos(a) * e.radius;
            const ry = Math.sin(a) * e.radius;
            if (s === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Equation Badge Above Enemy
        ctx.font = e.isBoss ? '800 16px "JetBrains Mono"' : '800 13px "JetBrains Mono"';
        const textWidth = ctx.measureText(e.expr).width;
        const badgeW = textWidth + 16;
        const badgeH = 24;
        const badgeY = -e.radius - 28;

        ctx.fillStyle = isMatching ? 'rgba(0, 255, 136, 0.95)' : 'rgba(8, 12, 28, 0.9)';
        ctx.strokeStyle = isMatching ? '#ffffff' : e.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(-badgeW / 2, badgeY, badgeW, badgeH, 7);
        } else {
            ctx.rect(-badgeW / 2, badgeY, badgeW, badgeH);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isMatching ? '#04120a' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(e.expr, 0, badgeY + badgeH / 2);

        ctx.restore();
    }

    window.GameState.closestEnemy = closestEnemy;

    // 11. Neon Lightning Beams
    for (const b of window.GameState.lightningBeams) {
        ctx.save();
        ctx.strokeStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 18;
        ctx.lineWidth = (b.life / b.maxLife) * 4.5;
        ctx.globalAlpha = b.life / b.maxLife;
        ctx.beginPath();
        b.points.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.restore();
    }

    // 12. Tactical Mathematical Compass (Points to closest enemy)
    if (closestEnemy) {
        const angleToTarget = Math.atan2(closestEnemy.y - p.y, closestEnemy.x - p.x);
        const compassRadius = p.radius + 38;
        const cx = p.x + Math.cos(angleToTarget) * compassRadius;
        const cy = p.y + Math.sin(angleToTarget) * compassRadius;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angleToTarget);

        // Compass Arrow
        ctx.fillStyle = '#ffb800';
        ctx.shadowColor = '#ffb800';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-6, -6);
        ctx.lineTo(-2, 0);
        ctx.lineTo(-6, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Suggested Next PlayStation Button Hint under the player
        const suggestedOp = window.findSuggestedPsButton(p.coreX, closestEnemy.answer);
        if (suggestedOp && p.coreX !== closestEnemy.answer) {
            const psInfo = window.PS_ICONS[suggestedOp.psKey] || window.PS_ICONS.cross;
            ctx.save();
            ctx.fillStyle = 'rgba(10, 15, 32, 0.85)';
            ctx.strokeStyle = psInfo.border;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(p.x - 48, p.y + p.radius + 14, 96, 22, 6);
            else ctx.rect(p.x - 48, p.y + p.radius + 14, 96, 22);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = psInfo.color;
            ctx.font = '800 11px "JetBrains Mono"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${psInfo.symbol} (${suggestedOp.label}) ➔ ${closestEnemy.answer}`, p.x, p.y + p.radius + 25);
            ctx.restore();
        }
    }

    // 13. The Player (Craft with Orbiting PlayStation Symbols)
    ctx.save();
    ctx.translate(p.x, p.y);

    // Outer Orbiting PlayStation Symbols Ring
    const orbitAngle = window.GameState.time * 0.025;
    const orbitR = p.radius + 12;
    const psGlyphs = [
        { symbol: '✕', color: '#00f3ff', angle: orbitAngle },
        { symbol: '◯', color: '#ff007f', angle: orbitAngle + Math.PI / 2 },
        { symbol: '▢', color: '#b537f2', angle: orbitAngle + Math.PI },
        { symbol: '△', color: '#00ff88', angle: orbitAngle + Math.PI * 1.5 }
    ];

    ctx.font = '900 11px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const g of psGlyphs) {
        const gx = Math.cos(g.angle) * orbitR;
        const gy = Math.sin(g.angle) * orbitR;
        ctx.fillStyle = g.color;
        ctx.shadowColor = g.color;
        ctx.shadowBlur = 8;
        ctx.fillText(g.symbol, gx, gy);
    }
    ctx.shadowBlur = 0;

    // Aim Pointer
    ctx.save();
    ctx.rotate(p.aimAngle);
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.moveTo(p.radius + 10, 0);
    ctx.lineTo(p.radius - 2, -6);
    ctx.lineTo(p.radius - 2, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Inner Core
    ctx.fillStyle = '#09132c';
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Player X Value Display
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 13px "JetBrains Mono"';
    ctx.fillText(`X=${p.coreX}`, 0, 0);
    ctx.restore();

    // 14. Fast-dissolving Floating Texts (NEVER LINGER)
    for (const ft of window.GameState.floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = `800 ${ft.size}px Cairo, "JetBrains Mono", sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 6;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
    }

    ctx.restore();
};
