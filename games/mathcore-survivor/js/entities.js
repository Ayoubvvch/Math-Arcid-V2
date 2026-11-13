/**
 * MathCore: Sandbox Survivor - World State, Objectives, & PlayStation Entities
 */

window.GameState = {
    paused: false,
    time: 0,
    wave: 1,
    waveProgress: 0,
    waveGoal: 6,
    score: 0,
    highScore: parseInt(localStorage.getItem('mathcore_high_score') || '0', 10),
    combo: 0,
    lastKillTime: 0,
    kills: 0,
    matter: 120,
    selectedBuildIndex: 0,
    screenShake: 0,
    camera: { x: window.WORLD_SIZE / 2, y: window.WORLD_SIZE / 2 },
    closestEnemy: null,
    player: {
        x: window.WORLD_SIZE / 2,
        y: window.WORLD_SIZE / 2 + 90,
        vx: 0,
        vy: 0,
        radius: 24,
        hp: 100,
        maxHp: 100,
        coreX: 0,
        aimAngle: -Math.PI / 2,
        lastAutoZap: 0,
        lastKineticShot: 0,
        pulseWaveRadius: 0,
        pulseWaveAlpha: 0
    },
    baseCore: {
        x: window.WORLD_SIZE / 2,
        y: window.WORLD_SIZE / 2,
        hp: 500,
        maxHp: 500,
        radius: 46
    },
    structures: [],
    enemies: [],
    projectiles: [],
    lightningBeams: [],
    particles: [],
    sparkOrbs: [], // Smooth flying energy sparks that fly to the player
    floatingTexts: [],
    stars: []
};

// Parallax Cyber Stars
for (let i = 0; i < 180; i++) {
    window.GameState.stars.push({
        x: Math.random() * window.WORLD_SIZE,
        y: Math.random() * window.WORLD_SIZE,
        size: Math.random() * 2.4 + 0.6,
        alpha: Math.random() * 0.6 + 0.2,
        color: ['#00f3ff', '#ff007f', '#b537f2', '#00ff88'][Math.floor(Math.random() * 4)]
    });
}

window.spawnEnemy = function(isBoss = false) {
    const canvas = document.getElementById('gameCanvas');
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(canvas.width, canvas.height) * 0.6 + 160;
    const spawnX = Math.max(100, Math.min(window.WORLD_SIZE - 100, window.GameState.player.x + Math.cos(angle) * dist));
    const spawnY = Math.max(100, Math.min(window.WORLD_SIZE - 100, window.GameState.player.y + Math.sin(angle) * dist));

    const math = window.generateMathChallenge(window.GameState.wave, isBoss);

    let color = Math.abs(math.answer) % 2 === 0 ? '#00f3ff' : '#ff007f';
    if (math.answer !== 0 && math.answer % 3 === 0) color = '#ffb800';
    if (isBoss) color = '#b537f2';

    const baseHp = isBoss ? 320 + window.GameState.wave * 50 : 25 + window.GameState.wave * 5;

    window.GameState.enemies.push({
        x: spawnX,
        y: spawnY,
        vx: 0,
        vy: 0,
        radius: isBoss ? 38 : 20,
        hp: baseHp,
        maxHp: baseHp,
        speed: isBoss ? 1.05 : (1.3 + Math.random() * 0.5 + Math.min(window.GameState.wave * 0.05, 1.0)),
        answer: math.answer,
        expr: math.expr,
        color: color,
        isBoss: isBoss,
        sides: isBoss ? 8 : (Math.abs(math.answer) % 2 === 0 ? 4 : 3),
        rotation: Math.random() * Math.PI * 2,
        hitFlash: 0
    });
};

window.renderBuildBarUI = function() {
    const container = document.getElementById('buildBarContainer');
    if (!container) return;
    container.innerHTML = '';
    window.BUILDINGS.forEach((b, idx) => {
        const isSelected = idx === window.GameState.selectedBuildIndex;
        const btn = document.createElement('button');
        btn.className = `cyber-btn rounded-xl px-2.5 py-1.5 flex items-center gap-2 border transition-all shrink-0 ${
            isSelected
                ? 'bg-cyan-500/25 border-cyan-300 shadow-[0_0_15px_rgba(0,243,255,0.35)] scale-105'
                : 'bg-slate-900/70 border-slate-700/80 opacity-80 hover:opacity-100'
        }`;
        btn.onclick = () => {
            window.GameState.selectedBuildIndex = idx;
            window.renderBuildBarUI();
        };
        btn.innerHTML = `
            <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black math-font" style="background:${b.color}22; color:${b.color}; border:1px solid ${b.color}88">
                ${b.formula}
            </div>
            <div class="text-right">
                <div class="text-[11px] font-bold text-white leading-tight">${b.name}</div>
                <div class="text-[10px] math-font text-cyan-300 font-bold">${b.cost} 💎</div>
            </div>
        `;
        container.appendChild(btn);
    });
};

window.cycleBuildingSelection = function(dir) {
    window.GameState.selectedBuildIndex = (window.GameState.selectedBuildIndex + dir + window.BUILDINGS.length) % window.BUILDINGS.length;
    window.renderBuildBarUI();
    window.SoundEngine.playPsButton(window.GameState.selectedBuildIndex);
};

window.getTargetBuildCell = function() {
    const canvas = document.getElementById('gameCanvas');
    if (window.InputState.usingMouseForBuild) {
        const wx = window.InputState.mouseX + window.GameState.camera.x - canvas.width / 2;
        const wy = window.InputState.mouseY + window.GameState.camera.y - canvas.height / 2;
        return {
            gx: Math.floor(wx / window.GRID_SIZE) * window.GRID_SIZE + window.GRID_SIZE / 2,
            gy: Math.floor(wy / window.GRID_SIZE) * window.GRID_SIZE + window.GRID_SIZE / 2
        };
    } else {
        const tx = window.GameState.player.x + Math.cos(window.GameState.player.aimAngle) * 90;
        const ty = window.GameState.player.y + Math.sin(window.GameState.player.aimAngle) * 90;
        return {
            gx: Math.floor(tx / window.GRID_SIZE) * window.GRID_SIZE + window.GRID_SIZE / 2,
            gy: Math.floor(ty / window.GRID_SIZE) * window.GRID_SIZE + window.GRID_SIZE / 2
        };
    }
};

window.placeSelectedBuilding = function() {
    const blueprint = window.BUILDINGS[window.GameState.selectedBuildIndex];
    const cell = window.getTargetBuildCell();

    const existingIdx = window.GameState.structures.findIndex(s => Math.hypot(s.x - cell.gx, s.y - cell.gy) < 20);
    if (existingIdx !== -1) {
        window.addFloatingText(cell.gx, cell.gy - 20, 'الموقع مشغول!', '#ff007f', 14);
        return;
    }

    if (!window.SandboxConfig.infiniteMatter && window.GameState.matter < blueprint.cost) {
        window.addFloatingText(window.GameState.player.x, window.GameState.player.y - 35, `تحتاج ${blueprint.cost} بلورة!`, '#ff007f', 15);
        window.SoundEngine.hurt();
        return;
    }

    if (!window.SandboxConfig.infiniteMatter) {
        window.GameState.matter -= blueprint.cost;
        window.updateMatterHUD();
    }

    window.GameState.structures.push({
        id: blueprint.id,
        name: blueprint.name,
        formula: blueprint.formula,
        color: blueprint.color,
        x: cell.gx,
        y: cell.gy,
        hp: blueprint.maxHp,
        maxHp: blueprint.maxHp,
        cooldown: 0,
        pulse: 0
    });

    window.SoundEngine.buildTower();
    window.spawnParticles(cell.gx, cell.gy, blueprint.color, 16);
    window.addFloatingText(cell.gx, cell.gy - 25, `بناء: ${blueprint.name}`, blueprint.color, 15);
};

window.autoBuildMathFortress = function() {
    const cx = Math.floor(window.GameState.baseCore.x / window.GRID_SIZE) * window.GRID_SIZE + window.GRID_SIZE / 2;
    const cy = Math.floor(window.GameState.baseCore.y / window.GRID_SIZE) * window.GRID_SIZE + window.GRID_SIZE / 2;
    const layout = [
        { dx: -2, dy: -2, bIdx: 0 },
        { dx: 2, dy: -2, bIdx: 1 },
        { dx: -2, dy: 2, bIdx: 2 },
        { dx: 2, dy: 2, bIdx: 0 },
        { dx: 0, dy: -2, bIdx: 3 },
        { dx: -3, dy: 0, bIdx: 4 },
        { dx: 3, dy: 0, bIdx: 4 },
        { dx: 0, dy: 3, bIdx: 4 }
    ];
    layout.forEach(item => {
        const gx = cx + item.dx * window.GRID_SIZE;
        const gy = cy + item.dy * window.GRID_SIZE;
        const b = window.BUILDINGS[item.bIdx];
        if (!window.GameState.structures.some(s => Math.hypot(s.x - gx, s.y - gy) < 20)) {
            window.GameState.structures.push({
                id: b.id,
                name: b.name,
                formula: b.formula,
                color: b.color,
                x: gx,
                y: gy,
                hp: b.maxHp,
                maxHp: b.maxHp,
                cooldown: 0,
                pulse: 0
            });
            window.spawnParticles(gx, gy, b.color, 10);
        }
    });
    window.SoundEngine.buildTower();
    window.addFloatingText(cx, cy - 50, '🏰 تم تشييد القلعة الهندسية!', '#00ff88', 20);
};

window.spawnParticles = function(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5.0 + 1.2;
        window.GameState.particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 3.0 + 1.2,
            color,
            alpha: 1,
            decay: Math.random() * 0.04 + 0.03
        });
    }
};

// Spawn smooth flying energy spark that flows directly into player's core
window.spawnEnergyReward = function(fromX, fromY, count = 3) {
    for (let i = 0; i < count; i++) {
        window.GameState.sparkOrbs.push({
            x: fromX + (Math.random() - 0.5) * 20,
            y: fromY + (Math.random() - 0.5) * 20,
            radius: 3.5,
            color: '#00f3ff',
            speed: 7.0 + Math.random() * 3.0
        });
    }
};

window.createLightningBeam = function(x1, y1, x2, y2, color = '#00ff88', life = 14) {
    const segments = 7;
    const points = [{ x: x1, y: y1 }];
    for (let i = 1; i < segments; i++) {
        const t = i / segments;
        const bx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 26;
        const by = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 26;
        points.push({ x: bx, y: by });
    }
    points.push({ x: x2, y: y2 });
    window.GameState.lightningBeams.push({ points, color, life, maxLife: life });
};

// Crisp, fast-fading floating text that NEVER stays on screen
window.addFloatingText = function(x, y, text, color = '#ffffff', size = 16) {
    window.GameState.floatingTexts.push({
        x, y,
        text,
        color,
        size,
        alpha: 1,
        vy: -2.0
    });
};

window.updateWaveHUD = function() {
    const waveEl = document.getElementById('waveText');
    const waveProgressEl = document.getElementById('waveProgressBar');
    const waveGoalText = document.getElementById('waveGoalText');

    if (waveEl) waveEl.textContent = `WAVE ${window.GameState.wave}`;
    const pct = Math.min(100, (window.GameState.waveProgress / window.GameState.waveGoal) * 100);
    if (waveProgressEl) waveProgressEl.style.width = `${pct}%`;
    if (waveGoalText) waveGoalText.textContent = `${window.GameState.waveProgress} / ${window.GameState.waveGoal} معادلة`;
};

window.updateScoreHUD = function() {
    const scoreEl = document.getElementById('scoreText');
    const highScoreEl = document.getElementById('highScoreText');
    const comboEl = document.getElementById('comboText');

    if (scoreEl) scoreEl.textContent = window.GameState.score;
    if (highScoreEl) highScoreEl.textContent = window.GameState.highScore;

    if (comboEl) {
        if (window.GameState.combo > 1) {
            comboEl.textContent = `COMBO x${window.GameState.combo}! 🔥`;
            comboEl.style.opacity = '1';
        } else {
            comboEl.style.opacity = '0';
        }
    }
};

window.updateMatterHUD = function() {
    const el = document.getElementById('matterText');
    if (el) el.textContent = window.SandboxConfig.infiniteMatter ? '∞' : window.GameState.matter;
};

window.updateHpHUD = function() {
    const p = window.GameState.player;
    const hpText = document.getElementById('hpText');
    const hpBar = document.getElementById('hpBar');
    if (hpText) hpText.textContent = `${Math.max(0, Math.ceil(p.hp))}/${p.maxHp}`;
    if (hpBar) hpBar.style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;
};
