/**
 * MathCore: Sandbox Survivor - 2D Neon Vector Renderer
 */

window.drawGame = function(ctx, canvas) {
    ctx.save();

    // Deep Cyber Space Background
    ctx.fillStyle = '#060814';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply Camera & Screen Shake
    const shakeX = (Math.random() - 0.5) * window.GameState.screenShake;
    const shakeY = (Math.random() - 0.5) * window.GameState.screenShake;
    const camOffsetX = canvas.width / 2 - window.GameState.camera.x + shakeX;
    const camOffsetY = canvas.height / 2 - window.GameState.camera.y + shakeY;
    ctx.translate(camOffsetX, camOffsetY);

    // 1. Draw Parallax Cyber Stars
    for (const st of window.GameState.stars) {
        ctx.fillStyle = st.color;
        ctx.globalAlpha = st.alpha;
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 2. Draw Interactive Sandbox Cartesian Grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.065)';
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

    // World Boundary Border
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.45)';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, window.WORLD_SIZE, window.WORLD_SIZE);

    // 3. Draw Blueprint Build Preview Cell
    const buildCell = window.getTargetBuildCell();
    const activeBlueprint = window.BUILDINGS[window.GameState.selectedBuildIndex];
    if (activeBlueprint) {
        ctx.save();
        ctx.strokeStyle = activeBlueprint.color;
        ctx.fillStyle = `${activeBlueprint.color}18`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(buildCell.gx - window.GRID_SIZE / 2 + 3, buildCell.gy - window.GRID_SIZE / 2 + 3, window.GRID_SIZE - 6, window.GRID_SIZE - 6);
        ctx.fillRect(buildCell.gx - window.GRID_SIZE / 2 + 3, buildCell.gy - window.GRID_SIZE / 2 + 3, window.GRID_SIZE - 6, window.GRID_SIZE - 6);
        ctx.restore();
    }

    // 4. Central Base Core (النواة المركزية)
    const base = window.GameState.baseCore;
    ctx.save();
    ctx.translate(base.x, base.y);
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, base.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(window.GameState.time * 0.01);
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
    ctx.strokeRect(-base.radius * 0.7, -base.radius * 0.7, base.radius * 1.4, base.radius * 1.4);
    ctx.restore();

    ctx.fillStyle = '#00f3ff';
    ctx.font = 'bold 13px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('النواة الهندسية الأم', base.x, base.y + base.radius + 20);

    // 5. Draw Sandbox Structures (Turrets & Walls)
    for (const s of window.GameState.structures) {
        ctx.save();
        ctx.translate(s.x, s.y);

        if (s.id === 'sine_healer') {
            ctx.beginPath();
            ctx.arc(0, 0, 220, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0, 255, 136, 0.14)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        ctx.fillStyle = '#0a1024';
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 12;

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

    // 6. Collectible Gems & Health Orbs
    for (const g of window.GameState.gems) {
        ctx.save();
        ctx.translate(g.x, g.y);
        const col = g.type === 'heal' ? '#00ff88' : '#00f3ff';
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, g.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // 7. Player Math Resonance Range Ring
    const p = window.GameState.player;
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, window.SandboxConfig.beamRange, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.12)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.restore();

    // Expanding Pulse Wave
    if (p.pulseWaveAlpha > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.pulseWaveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 136, ${p.pulseWaveAlpha})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    }

    // 8. Kinetic Projectiles
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

    // 9. Enemies with Math Expressions
    for (const e of window.GameState.enemies) {
        const isMatching = e.answer === p.coreX;
        const isOneStepAway = window.AVAILABLE_MATH_OPS.some(op => {
            if (!window.SandboxConfig.buttonOps.includes(op.id)) return false;
            return op.fn(p.coreX) === e.answer;
        });

        ctx.save();
        ctx.translate(e.x, e.y);

        // Lock-on Glow Ring
        if (isMatching) {
            ctx.beginPath();
            ctx.arc(0, 0, e.radius + 12 + Math.sin(window.GameState.time * 0.25) * 4, 0, Math.PI * 2);
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 15;
            ctx.stroke();
        } else if (isOneStepAway) {
            ctx.beginPath();
            ctx.arc(0, 0, e.radius + 7, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 184, 0, 0.45)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Geometric Polygon Body
        ctx.save();
        ctx.rotate(e.rotation);
        ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : '#0b1026';
        ctx.strokeStyle = isMatching ? '#00ff88' : e.color;
        ctx.lineWidth = e.isBoss ? 4 : 2.5;
        ctx.shadowColor = isMatching ? '#00ff88' : e.color;
        ctx.shadowBlur = 14;

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

    // 10. Neon Lightning Beams
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

    // 11. The Player (Math Core Craft)
    ctx.save();
    ctx.translate(p.x, p.y);

    // Outer Rotating Ring
    ctx.save();
    ctx.rotate(-window.GameState.time * 0.03);
    ctx.strokeStyle = '#00f3ff';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.restore();

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

    // Inner Core Circle
    ctx.fillStyle = '#09132c';
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, p.radius - 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // X Value
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 13px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`X=${p.coreX}`, 0, 0);
    ctx.restore();

    // 12. Particles & Floating Texts
    for (const pt of window.GameState.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

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
