/**
 * MathCore: Sandbox Survivor - Pure PlayStation Controller Engine
 * DualSense / DualShock Native Mapping (✕, ◯, ▢, △, L1/R1, L2/R2, D-Pad, Options)
 */

window.InputState = {
    keys: {},
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    mouseDownLeft: false,
    usingMouseForBuild: false,
    gamepadConnected: false,
    prevButtons: {}
};

window.triggerGamepadHaptic = async function(duration = 80, weak = 0.5, strong = 0.5) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0] || gamepads[1];
    if (gp && gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
        try {
            await gp.vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration: duration,
                weakMagnitude: weak,
                strongMagnitude: strong,
            });
        } catch (e) {}
    }
};

window.addEventListener('keydown', e => {
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
    window.InputState.keys[e.code] = true;

    // 4 PlayStation Face Buttons via Keyboard:
    // ✕ Cross:    Key 1 / Numpad 1 / Key J
    // ◯ Circle:   Key 2 / Numpad 2 / Key K
    // ▢ Square:   Key 3 / Numpad 3 / Key L
    // △ Triangle: Key 4 / Numpad 4 / Key I
    if (e.code === 'Digit1' || e.code === 'Numpad1' || e.code === 'KeyJ') window.applyMathButton(0);
    if (e.code === 'Digit2' || e.code === 'Numpad2' || e.code === 'KeyK') window.applyMathButton(1);
    if (e.code === 'Digit3' || e.code === 'Numpad3' || e.code === 'KeyL') window.applyMathButton(2);
    if (e.code === 'Digit4' || e.code === 'Numpad4' || e.code === 'KeyI') window.applyMathButton(3);

    // L1 / R1 equivalent (Q / E)
    if (e.code === 'KeyQ') window.cycleBuildingSelection(-1);
    if (e.code === 'KeyE') window.cycleBuildingSelection(1);

    // L2 equivalent (F / Space)
    if (e.code === 'KeyF') window.placeSelectedBuilding();
    if (e.code === 'Space') {
        e.preventDefault();
        window.triggerMathResonanceCheck(true);
    }
});

window.addEventListener('keyup', e => {
    window.InputState.keys[e.code] = false;
});

window.initCanvasControls = function(canvas) {
    canvas.addEventListener('mousemove', e => {
        window.InputState.mouseX = e.clientX;
        window.InputState.mouseY = e.clientY;
        window.InputState.usingMouseForBuild = true;
        const wx = e.clientX + window.GameState.camera.x - canvas.width / 2;
        const wy = e.clientY + window.GameState.camera.y - canvas.height / 2;
        window.GameState.player.aimAngle = Math.atan2(wy - window.GameState.player.y, wx - window.GameState.player.x);
    });

    canvas.addEventListener('mousedown', e => {
        if (e.button === 0) {
            window.InputState.mouseDownLeft = true;
            window.triggerMathResonanceCheck(false);
        } else if (e.button === 2) {
            window.placeSelectedBuilding();
        }
    });

    window.addEventListener('mouseup', e => {
        if (e.button === 0) window.InputState.mouseDownLeft = false;
    });

    canvas.addEventListener('contextmenu', e => e.preventDefault());
};

window.addEventListener('wheel', e => {
    const modder = document.getElementById('modderDrawer');
    if (modder && modder.classList.contains('translate-x-0')) return;
    window.stepCoreX(e.deltaY < 0 ? 1 : -1);
});

// PlayStation Gamepad Connection Listeners
window.addEventListener('gamepadconnected', e => {
    window.updatePlayStationBadge(true, e.gamepad.id);
    window.triggerGamepadHaptic(120, 0.6, 0.6);
});

window.addEventListener('gamepaddisconnected', () => {
    window.updatePlayStationBadge(false);
});

window.updatePlayStationBadge = function(connected, idStr = '') {
    window.InputState.gamepadConnected = connected;
    const badge = document.getElementById('gamepadBadge');
    const icon = document.getElementById('gamepadIcon');
    const text = document.getElementById('gamepadStatusText');
    if (!badge || !icon || !text) return;

    if (connected) {
        badge.classList.add('border-cyan-400');
        badge.style.boxShadow = '0 0 20px rgba(0, 243, 255, 0.3)';
        icon.className = 'fa-brands fa-playstation text-cyan-400 text-lg animate-pulse';
        text.textContent = 'PlayStation Controller جاهزة (✕, ◯, ▢, △)';
        text.className = 'text-cyan-300 text-[11px] font-bold';
    } else {
        badge.classList.remove('border-cyan-400');
        badge.style.boxShadow = 'none';
        icon.className = 'fa-solid fa-gamepad text-slate-400 text-base';
        text.textContent = 'لوحة المفاتيح / بانتظار يد PlayStation';
        text.className = 'text-slate-300 text-[11px]';
    }
};

window.pollGamepad = function() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0] || gamepads[1];
    if (!gp) return { moveX: 0, moveY: 0, firing: false };

    if (!window.InputState.gamepadConnected) {
        window.updatePlayStationBadge(true, gp.id);
    }

    const deadzone = 0.16;
    let lx = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
    let ly = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;

    // Right stick aim
    let rx = gp.axes[2] || 0;
    let ry = gp.axes[3] || 0;
    if (Math.hypot(rx, ry) > 0.22) {
        window.GameState.player.aimAngle = Math.atan2(ry, rx);
        window.InputState.usingMouseForBuild = false;
    } else if (Math.hypot(lx, ly) > 0.22) {
        window.GameState.player.aimAngle = Math.atan2(ly, lx);
        window.InputState.usingMouseForBuild = false;
    }

    const justPressed = (idx) => {
        const isDown = gp.buttons[idx] && gp.buttons[idx].pressed;
        const wasDown = !!window.InputState.prevButtons[idx];
        window.InputState.prevButtons[idx] = isDown;
        return isDown && !wasDown;
    };

    // 100% PURE PLAYSTATION BUTTON ASSIGNMENTS
    // Button 0: ✕ (Cross)
    if (justPressed(0)) window.applyMathButton(0);
    // Button 1: ◯ (Circle)
    if (justPressed(1)) window.applyMathButton(1);
    // Button 2: ▢ (Square)
    if (justPressed(2)) window.applyMathButton(2);
    // Button 3: △ (Triangle)
    if (justPressed(3)) window.applyMathButton(3);

    // L1 (4) / R1 (5): Cycle Turret Blueprints
    if (justPressed(4)) window.cycleBuildingSelection(-1);
    if (justPressed(5)) window.cycleBuildingSelection(1);

    // L2 (6): Place Selected Turret
    if (justPressed(6)) window.placeSelectedBuilding();

    // R2 (7): EMP Kinetic Blast
    if (justPressed(7)) window.triggerMathResonanceCheck(true);
    const r2Held = gp.buttons[7] && gp.buttons[7].pressed;

    // Options / Start (9): Toggle Sandbox Modder Drawer
    if (justPressed(9)) window.toggleModderDrawer();

    // Share / Select (8): Toggle Help Guide
    if (justPressed(8)) {
        const modal = document.getElementById('helpModal');
        if (modal) modal.classList.toggle('hidden');
    }

    // D-Pad:
    // D-Pad Up (12) / Down (13): Fast Step Core X
    if (justPressed(12)) window.stepCoreX(1);
    if (justPressed(13)) window.stepCoreX(-1);
    // D-Pad Left (14) / Right (15): Cycle Blueprints
    if (justPressed(14)) window.cycleBuildingSelection(-1);
    if (justPressed(15)) window.cycleBuildingSelection(1);

    return { moveX: lx, moveY: ly, firing: r2Held };
};
