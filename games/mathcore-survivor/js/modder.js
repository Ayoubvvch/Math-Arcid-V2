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
        // Avoid duplicating change listeners on repeated init
        if (!sel.dataset.bound) {
            sel.dataset.bound = '1';
            sel.addEventListener('change', e => {
                window.SandboxConfig.buttonOps[i] = e.target.value;
                window.syncModderToHUD();
            });
        }
    }

    const modMathMode = document.getElementById('modMathMode');
    if (modMathMode && !modMathMode.dataset.bound) {
        modMathMode.dataset.bound = '1';
        modMathMode.addEventListener('change', e => {
            window.SandboxConfig.mathMode = e.target.value;
            window.syncModderToHUD();
        });
    }

    const sliderPlayerSpeed = document.getElementById('sliderPlayerSpeed');
    if (sliderPlayerSpeed && !sliderPlayerSpeed.dataset.bound) {
        sliderPlayerSpeed.dataset.bound = '1';
        sliderPlayerSpeed.addEventListener('input', e => {
            window.SandboxConfig.playerSpeed = parseFloat(e.target.value);
            const val = document.getElementById('valPlayerSpeed');
            if (val) val.textContent = window.SandboxConfig.playerSpeed.toFixed(1);
            window.syncModderToHUD();
        });
    }

    const sliderBeamRange = document.getElementById('sliderBeamRange');
    if (sliderBeamRange && !sliderBeamRange.dataset.bound) {
        sliderBeamRange.dataset.bound = '1';
        sliderBeamRange.addEventListener('input', e => {
            window.SandboxConfig.beamRange = parseInt(e.target.value, 10);
            const val = document.getElementById('valBeamRange');
            if (val) val.textContent = `${window.SandboxConfig.beamRange}px`;
            window.syncModderToHUD();
        });
    }

    // Infinite Matter & God Mode
    const infBtn = document.getElementById('btnToggleInfiniteMatter');
    if (infBtn && !infBtn.dataset.bound) {
        infBtn.dataset.bound = '1';
        infBtn.addEventListener('click', () => {
            window.SandboxConfig.infiniteMatter = !window.SandboxConfig.infiniteMatter;
            window.updateMatterHUD();
            window.syncModderToHUD();
            window.SoundEngine?.uiTick?.();
        });
    }

    const godBtn = document.getElementById('btnToggleGodMode');
    if (godBtn && !godBtn.dataset.bound) {
        godBtn.dataset.bound = '1';
        godBtn.addEventListener('click', () => {
            window.SandboxConfig.godMode = !window.SandboxConfig.godMode;
            window.syncModderToHUD();
            window.SoundEngine?.uiTick?.();
        });
    }

    const fortressBtn = document.getElementById('btnAutoBuildFortress');
    if (fortressBtn && !fortressBtn.dataset.bound) {
        fortressBtn.dataset.bound = '1';
        fortressBtn.addEventListener('click', window.autoBuildMathFortress);
    }

    const bossBtn = document.getElementById('btnSpawnBoss');
    if (bossBtn && !bossBtn.dataset.bound) {
        bossBtn.dataset.bound = '1';
        bossBtn.addEventListener('click', () => {
            window.spawnEnemy(true);
            window.addFloatingText(window.GameState.player.x, window.GameState.player.y - 50, '⚠️ زعيم المعادلات ظهر!', '#ff007f', 20);
            window.SoundEngine?.bossAlarm?.();
        });
    }

    // Reset Defaults
    const resetBtn = document.getElementById('btnResetMods');
    if (resetBtn && !resetBtn.dataset.bound) {
        resetBtn.dataset.bound = '1';
        resetBtn.addEventListener('click', () => {
            window.SandboxConfig = JSON.parse(JSON.stringify(window.DEFAULT_SANDBOX_CONFIG));
            window.syncModderToHUD();
            window.updateMatterHUD();
            window.SoundEngine?.uiTick?.();
            window.addFloatingText(window.GameState.player.x, window.GameState.player.y - 40, '↺ تمت استعادة الإعدادات', '#00f3ff', 15);
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

    const modMathMode = document.getElementById('modMathMode');
    if (modMathMode) modMathMode.value = window.SandboxConfig.mathMode;

    const sliderPlayerSpeed = document.getElementById('sliderPlayerSpeed');
    if (sliderPlayerSpeed) sliderPlayerSpeed.value = window.SandboxConfig.playerSpeed;
    const valPlayerSpeed = document.getElementById('valPlayerSpeed');
    if (valPlayerSpeed) valPlayerSpeed.textContent = Number(window.SandboxConfig.playerSpeed).toFixed(1);

    const sliderBeamRange = document.getElementById('sliderBeamRange');
    if (sliderBeamRange) sliderBeamRange.value = window.SandboxConfig.beamRange;
    const valBeamRange = document.getElementById('valBeamRange');
    if (valBeamRange) valBeamRange.textContent = `${window.SandboxConfig.beamRange}px`;

    const infBtn = document.getElementById('btnToggleInfiniteMatter');
    if (infBtn) {
        infBtn.classList.toggle('active-mod-cyan', window.SandboxConfig.infiniteMatter);
    }

    const godBtn = document.getElementById('btnToggleGodMode');
    if (godBtn) {
        godBtn.classList.toggle('active-mod-amber', window.SandboxConfig.godMode);
    }
};

window.toggleModderDrawer = function(forceOpen = null) {
    const modderDrawer = document.getElementById('modderDrawer');
    if (!modderDrawer) return;
    const isCurrentlyOpen = modderDrawer.classList.contains('drawer-open');
    const shouldOpen = forceOpen !== null ? forceOpen : !isCurrentlyOpen;

    if (!shouldOpen) {
        modderDrawer.classList.remove('drawer-open');
        window.clearModderControllerFocus?.();
        // Resume game only if no blocking modal is visible
        if (window.syncPauseStateFromModals) window.syncPauseStateFromModals();
    } else {
        // Hide pause/help modals if transitioning -> Sandbox Modder
        document.getElementById('pauseModal')?.classList.add('hidden');
        document.getElementById('helpModal')?.classList.add('hidden');
        modderDrawer.classList.add('drawer-open');
        if (window.syncPauseStateFromModals) window.syncPauseStateFromModals();
        window.resetModderControllerFocus?.();
    }
    window.SoundEngine?.uiTick?.();
};
