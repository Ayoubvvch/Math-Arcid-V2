/**
 * MathCore: Sandbox Survivor - Universal Input Engine (Gamepad + Keyboard/Mouse)
 * Enhanced for PlayStation (Cross ✕, Circle ◯, Square ▢, Triangle △) & Xbox (A, B, X, Y)
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

// Dual-Rumble Haptic Feedback
window.triggerGamepadHaptic = async function(duration = 80, weak = 0.4, strong = 0.4) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
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

    // 4 Math Core Buttons via Keyboard (1, 2, 3, 4 or J, K, L, I)
    if (e.code === 'Digit1' || e.code === 'Numpad1' || e.code === 'KeyJ') window.applyMathButton(0);
    if (e.code === 'Digit2' || e.code === 'Numpad2' || e.code === 'KeyK') window.applyMathButton(1);
    if (e.code === 'Digit3' || e.code === 'Numpad3' || e.code === 'KeyL') window.applyMathButton(2);
    if (e.code === 'Digit4' || e.code === 'Numpad4' || e.code === 'KeyI') window.applyMathButton(3);

    // Cycle Building (Q / E)
    if (e.code === 'KeyQ') window.cycleBuildingSelection(-1);
    if (e.code === 'KeyE') window.cycleBuildingSelection(1);

    // Place Building (F)
    if (e.code === 'KeyF') window.placeSelectedBuilding();

    // Manual Math Pulse (Space)
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

// Mouse wheel adjusts X by +1 / -1 smoothly
window.addEventListener('wheel', e => {
    const modder = document.getElementById('modderDrawer');
    if (modder && modder.classList.contains('translate-x-0')) return;
    window.stepCoreX(e.deltaY < 0 ? 1 : -1);
});

// Gamepad API Connection Listeners
window.addEventListener('gamepadconnected', e => {
    window.updateGamepadBadge(true, e.gamepad.id);
    window.triggerGamepadHaptic(100, 0.5, 0.5);
});

window.addEventListener('gamepaddisconnected', () => {
    window.updateGamepadBadge(false);
});

window.updateGamepadBadge = function(connected, idStr = '') {
    window.InputState.gamepadConnected = connected;
    const badge = document.getElementById('gamepadBadge');
    const icon = document.getElementById('gamepadIcon');
    const text = document.getElementById('gamepadStatusText');
    if (!badge || !icon || !text) return;

    if (connected) {
        const isPS = idStr.toLowerCase().includes('dual') || idStr.toLowerCase().includes('sony') || idStr.toLowerCase().includes('playstation');
        const isXbox = idStr.toLowerCase().includes('xbox') || idStr.toLowerCase().includes('microsoft');
        const typeLabel = isPS ? 'PlayStation (✕, ◯, ▢, △)' : (isXbox ? 'Xbox (A, B, X, Y)' : 'يد تحكم نشطة');

        badge.classList.add('border-emerald-400/80');
        icon.className = 'fa-solid fa-gamepad text-emerald-400 text-base animate-pulse';
        text.textContent = typeLabel;
        text.className = 'text-emerald-300 text-[11px] font-bold';
    } else {
        badge.classList.remove('border-emerald-400/80');
        icon.className = 'fa-solid fa-gamepad text-slate-400 text-base';
        text.textContent = 'لوحة المفاتيح / بانتظار يد';
        text.className = 'text-slate-300 text-[11px]';
    }
};

window.pollGamepad = function() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
    if (!gp) return { moveX: 0, moveY: 0, firing: false };

    if (!window.InputState.gamepadConnected) {
        window.updateGamepadBadge(true, gp.id);
    }

    const deadzone = 0.18;
    let lx = Math.abs(gp.axes[0]) > deadzone ? gp.axes[0] : 0;
    let ly = Math.abs(gp.axes[1]) > deadzone ? gp.axes[1] : 0;

    // Right stick aim
    let rx = gp.axes[2] || 0;
    let ry = gp.axes[3] || 0;
    if (Math.hypot(rx, ry) > 0.25) {
        window.GameState.player.aimAngle = Math.atan2(ry, rx);
        window.InputState.usingMouseForBuild = false;
    } else if (Math.hypot(lx, ly) > 0.25) {
        window.GameState.player.aimAngle = Math.atan2(ly, lx);
        window.InputState.usingMouseForBuild = false;
    }

    // Single-press detection helper
    const justPressed = (idx) => {
        const isDown = gp.buttons[idx] && gp.buttons[idx].pressed;
        const wasDown = !!window.InputState.prevButtons[idx];
        window.InputState.prevButtons[idx] = isDown;
        return isDown && !wasDown;
    };

    // Face Buttons:
    // Button 0: PlayStation ✕ (Cross) / Xbox A -> Op 0
    // Button 1: PlayStation ◯ (Circle) / Xbox B -> Op 1
    // Button 2: PlayStation ▢ (Square) / Xbox X -> Op 2
    // Button 3: PlayStation △ (Triangle) / Xbox Y -> Op 3
    if (justPressed(0)) window.applyMathButton(0);
    if (justPressed(1)) window.applyMathButton(1);
    if (justPressed(2)) window.applyMathButton(2);
    if (justPressed(3)) window.applyMathButton(3);

    // Bumpers LB (4) / RB (5) -> Cycle Building Blueprint
    if (justPressed(4)) window.cycleBuildingSelection(-1);
    if (justPressed(5)) window.cycleBuildingSelection(1);

    // Left Trigger LT (6) -> Place Building
    if (justPressed(6)) window.placeSelectedBuilding();

    // Right Trigger RT (7) -> Manual Math Pulse + Kinetic Fire
    if (justPressed(7)) window.triggerMathResonanceCheck(true);
    const rtHeld = gp.buttons[7] && gp.buttons[7].pressed;

    // D-Pad Up (12) / Down (13) -> Quick +1 / -1 on X
    if (justPressed(12)) window.stepCoreX(1);
    if (justPressed(13)) window.stepCoreX(-1);
    if (justPressed(14)) window.cycleBuildingSelection(-1);
    if (justPressed(15)) window.cycleBuildingSelection(1);

    return { moveX: lx, moveY: ly, firing: rtHeld };
};
