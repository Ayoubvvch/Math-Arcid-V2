/**
 * MathCore: Sandbox Survivor - Live Sandbox Modder Controller
 */

window.initSandboxModderUI = function() {
    // Populate the 4 button selects
    for (let i = 0; i < 4; i++) {
        const sel = document.getElementById(`modBtn${i}Select`);
        if (!sel) continue;
        sel.innerHTML = '';
        window.AVAILABLE_MATH_OPS.forEach(op => {
            const opt = document.createElement('option');
            opt.value = op.id;
            opt.textContent = op.label;
            if (window.SandboxConfig.buttonOps[i] === op.id) opt.selected = true;
            sel.appendChild(opt);
        });
        sel.addEventListener('change', e => {
            window.SandboxConfig.buttonOps[i] = e.target.value;
            window.syncModderToHUD();
        });
    }

    const modMathMode = document.getElementById('modMathMode');
    if (modMathMode) {
        modMathMode.addEventListener('change', e => {
            window.SandboxConfig.mathMode = e.target.value;
            window.syncModderToHUD();
        });
    }

    const sliderPlayerSpeed = document.getElementById('sliderPlayerSpeed');
    if (sliderPlayerSpeed) {
        sliderPlayerSpeed.addEventListener('input', e => {
            window.SandboxConfig.playerSpeed = parseFloat(e.target.value);
            const val = document.getElementById('valPlayerSpeed');
            if (val) val.textContent = window.SandboxConfig.playerSpeed;
            window.syncModderToHUD();
        });
    }

    const sliderBeamRange = document.getElementById('sliderBeamRange');
    if (sliderBeamRange) {
        sliderBeamRange.addEventListener('input', e => {
            window.SandboxConfig.beamRange = parseInt(e.target.value, 10);
            const val = document.getElementById('valBeamRange');
            if (val) val.textContent = `${window.SandboxConfig.beamRange}px`;
            window.syncModderToHUD();
        });
    }

    const sliderTurretRate = document.getElementById('sliderTurretRate');
    if (sliderTurretRate) {
        sliderTurretRate.addEventListener('input', e => {
            window.SandboxConfig.turretFireRateMultiplier = parseFloat(e.target.value);
            const val = document.getElementById('valTurretRate');
            if (val) val.textContent = `${window.SandboxConfig.turretFireRateMultiplier}x`;
            window.syncModderToHUD();
        });
    }

    const sliderSpawnRate = document.getElementById('sliderSpawnRate');
    if (sliderSpawnRate) {
        sliderSpawnRate.addEventListener('input', e => {
            window.SandboxConfig.enemySpawnMultiplier = parseFloat(e.target.value);
            const val = document.getElementById('valSpawnRate');
            if (val) val.textContent = `${window.SandboxConfig.enemySpawnMultiplier}x`;
            window.syncModderToHUD();
        });
    }

    // Infinite Matter & God Mode
    const infBtn = document.getElementById('btnToggleInfiniteMatter');
    if (infBtn) {
        infBtn.addEventListener('click', () => {
            window.SandboxConfig.infiniteMatter = !window.SandboxConfig.infiniteMatter;
            infBtn.classList.toggle('border-cyan-400', window.SandboxConfig.infiniteMatter);
            infBtn.classList.toggle('bg-cyan-950/80', window.SandboxConfig.infiniteMatter);
            window.updateMatterHUD();
            window.syncModderToHUD();
        });
    }

    const godBtn = document.getElementById('btnToggleGodMode');
    if (godBtn) {
        godBtn.addEventListener('click', () => {
            window.SandboxConfig.godMode = !window.SandboxConfig.godMode;
            godBtn.classList.toggle('border-amber-400', window.SandboxConfig.godMode);
            godBtn.classList.toggle('bg-amber-950/80', window.SandboxConfig.godMode);
            window.syncModderToHUD();
        });
    }

    const fortressBtn = document.getElementById('btnAutoBuildFortress');
    if (fortressBtn) fortressBtn.addEventListener('click', window.autoBuildMathFortress);

    const bossBtn = document.getElementById('btnSpawnBoss');
    if (bossBtn) {
        bossBtn.addEventListener('click', () => {
            window.spawnEnemy(true);
            window.addFloatingText(window.GameState.player.x, window.GameState.player.y - 50, '⚠️ زعيم المعادلات ظهر!', '#ff007f', 20);
        });
    }

    // Apply JSON mod
    const applyJsonBtn = document.getElementById('btnApplyJsonMod');
    if (applyJsonBtn) {
        applyJsonBtn.addEventListener('click', () => {
            try {
                const parsed = JSON.parse(document.getElementById('jsonModTextarea').value);
                window.SandboxConfig = { ...window.SandboxConfig, ...parsed };
                window.syncModderToHUD();
                window.addFloatingText(window.GameState.player.x, window.GameState.player.y - 40, '✅ تم تطبيق كود JSON بنجاح!', '#00ff88', 16);
            } catch (err) {
                window.addFloatingText(window.GameState.player.x, window.GameState.player.y - 40, '❌ خطأ في صيغة JSON!', '#ff007f', 16);
            }
        });
    }

    // Reset Defaults
    const resetBtn = document.getElementById('btnResetMods');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            window.SandboxConfig = JSON.parse(JSON.stringify(window.DEFAULT_SANDBOX_CONFIG));
            window.initSandboxModderUI();
            window.syncModderToHUD();
            window.updateMatterHUD();
        });
    }

    window.syncModderToHUD();
};

window.syncModderToHUD = function() {
    for (let i = 0; i < 4; i++) {
        const opObj = window.AVAILABLE_MATH_OPS.find(o => o.id === window.SandboxConfig.buttonOps[i]) || window.AVAILABLE_MATH_OPS[0];
        const lbl = document.getElementById(`mathBtnLabel${i}`);
        if (lbl) lbl.textContent = opObj.label;
        const sel = document.getElementById(`modBtn${i}Select`);
        if (sel) sel.value = opObj.id;
    }
    const jsonArea = document.getElementById('jsonModTextarea');
    if (jsonArea) jsonArea.value = JSON.stringify(window.SandboxConfig, null, 2);
};

window.toggleModderDrawer = function() {
    const modderDrawer = document.getElementById('modderDrawer');
    if (!modderDrawer) return;
    const isOpen = modderDrawer.classList.contains('translate-x-0');
    if (isOpen) {
        modderDrawer.classList.remove('translate-x-0', 'opacity-100', 'pointer-events-auto');
        modderDrawer.classList.add('-translate-x-[120%]', 'opacity-0', 'pointer-events-none');
    } else {
        modderDrawer.classList.remove('-translate-x-[120%]', 'opacity-0', 'pointer-events-none');
        modderDrawer.classList.add('translate-x-0', 'opacity-100', 'pointer-events-auto');
    }
};
