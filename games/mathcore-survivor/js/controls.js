/**
 * MathCore: Sandbox Survivor - Pure PlayStation Controller, Keyboard, Mouse & Touch Engine
 * Full DualSense / DualShock Native Mapping (✕, ◯, ▢, △, L1/R1, L2/R2, D-Pad, Options, Share)
 */

window.InputState = {
    keys: {},
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    mouseDownLeft: false,
    usingMouseForBuild: false,
    gamepadConnected: false,
    gamepadSlot: -1,
    prevButtons: {},
    prevHatDirs: { up: false, down: false, left: false, right: false },
    uiNavNextTime: 0,
    playDpadNextTime: 0,
    pauseFocusIdx: 0,
    goFocusIdx: 0,
    modderFocusIdx: 0,
    touchMoveId: null,
    touchStartX: 0,
    touchStartY: 0,
    touchMoveX: 0,
    touchMoveY: 0
};

window.getActiveUIMode = function() {
    const goModal = document.getElementById('gameOverModal');
    if (goModal && !goModal.classList.contains('hidden')) return 'gameover';

    const helpModal = document.getElementById('helpModal');
    if (helpModal && !helpModal.classList.contains('hidden')) return 'help';

    const pauseModal = document.getElementById('pauseModal');
    if (pauseModal && !pauseModal.classList.contains('hidden')) return 'pause';

    const modderDrawer = document.getElementById('modderDrawer');
    if (modderDrawer && modderDrawer.classList.contains('drawer-open')) return 'modder';

    return 'play';
};

window.syncPauseStateFromModals = function() {
    const mode = window.getActiveUIMode();
    window.GameState.paused = (mode !== 'play') || !!window.GameState.gameOver;
};

window.openPauseModal = function() {
    if (window.GameState.gameOver) return;
    document.getElementById('helpModal')?.classList.add('hidden');
    const modderDrawer = document.getElementById('modderDrawer');
    if (modderDrawer?.classList.contains('drawer-open')) {
        modderDrawer.classList.remove('drawer-open');
        window.clearModderControllerFocus();
    }
    const pauseModal = document.getElementById('pauseModal');
    if (pauseModal) {
        pauseModal.classList.remove('hidden');
        window.InputState.pauseFocusIdx = 0;
        window.applyPauseMenuFocus();
    }
    window.syncPauseStateFromModals();
    window.SoundEngine?.pauseCue?.(true);
};

window.closePauseModal = function() {
    document.getElementById('pauseModal')?.classList.add('hidden');
    document.querySelectorAll('.pause-menu-btn').forEach(el => el.classList.remove('gp-focused'));
    window.syncPauseStateFromModals();
    window.SoundEngine?.pauseCue?.(false);
};

window.dismissHelpModal = function() {
    document.getElementById('helpModal')?.classList.add('hidden');
    window.SoundEngine?.init?.();
    window.syncPauseStateFromModals();
    window.SoundEngine?.uiTick?.();
};

window.applyPauseMenuFocus = function() {
    const items = Array.from(document.querySelectorAll('.pause-menu-btn'));
    if (!items.length) return;
    const len = items.length;
    window.InputState.pauseFocusIdx = ((window.InputState.pauseFocusIdx % len) + len) % len;
    items.forEach((el, idx) => {
        el.classList.toggle('gp-focused', idx === window.InputState.pauseFocusIdx);
    });
};

window.applyGameOverFocus = function() {
    const items = Array.from(document.querySelectorAll('.go-menu-btn'));
    if (!items.length) return;
    const len = items.length;
    window.InputState.goFocusIdx = ((window.InputState.goFocusIdx % len) + len) % len;
    items.forEach((el, idx) => {
        el.classList.toggle('gp-focused', idx === window.InputState.goFocusIdx);
    });
};

function getModderFocusableItems() {
    const drawer = document.getElementById('modderDrawer');
    if (!drawer) return [];
    const ordered = Array.from(drawer.querySelectorAll('.modder-body select, .modder-body input[type="range"], .modder-body button, .modder-footer button'));
    const closeBtn = drawer.querySelector('#closeModderBtn');
    if (closeBtn) ordered.push(closeBtn);
    return ordered;
}

window.clearModderControllerFocus = function() {
    document.querySelectorAll('#modderDrawer .gp-focused').forEach(el => el.classList.remove('gp-focused'));
};

window.resetModderControllerFocus = function() {
    window.InputState.modderFocusIdx = 0;
    window.applyModderFocus();
};

window.applyModderFocus = function() {
    const items = getModderFocusableItems();
    if (!items.length) return;
    const len = items.length;
    window.InputState.modderFocusIdx = ((window.InputState.modderFocusIdx % len) + len) % len;
    items.forEach((el, idx) => {
        const focused = idx === window.InputState.modderFocusIdx;
        el.classList.toggle('gp-focused', focused);
        if (focused) {
            el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    });
};

function adjustModderItem(dir) {
    const items = getModderFocusableItems();
    const target = items[window.InputState.modderFocusIdx];
    if (!target) return;

    if (target.tagName === 'SELECT') {
        const count = target.options.length;
        if (count > 0) {
            target.selectedIndex = (target.selectedIndex + dir + count) % count;
            target.dispatchEvent(new Event('change', { bubbles: true }));
            window.SoundEngine?.uiTick?.();
        }
    } else if (target.tagName === 'INPUT' && target.type === 'range') {
        const step = parseFloat(target.step || '1');
        const min = parseFloat(target.min || '0');
        const max = parseFloat(target.max || '100');
        const nextVal = Math.max(min, Math.min(max, parseFloat(target.value) + dir * step));
        target.value = String(nextVal);
        target.dispatchEvent(new Event('input', { bubbles: true }));
        window.SoundEngine?.uiTick?.();
    }
}

function activateModderItem() {
    const items = getModderFocusableItems();
    const target = items[window.InputState.modderFocusIdx];
    if (!target) return;
    if (target.tagName === 'SELECT') {
        adjustModderItem(1);
    } else if (target.tagName === 'BUTTON') {
        target.click();
    }
}

function getActiveGamepad() {
    if (!navigator.getGamepads) return null;
    const pads = navigator.getGamepads();
    if (window.InputState.gamepadSlot >= 0) {
        const cached = pads[window.InputState.gamepadSlot];
        if (cached && cached.connected) return cached;
    }
    for (let i = 0; i < pads.length; i++) {
        if (pads[i] && pads[i].connected) {
            window.InputState.gamepadSlot = i;
            return pads[i];
        }
    }
    window.InputState.gamepadSlot = -1;
    return null;
}

function detectControllerLabel(id = '') {
    const lower = String(id).toLowerCase();
    if (lower.includes('dualsense') || lower.includes('054c') || lower.includes('playstation') || lower.includes('dualshock')) {
        return 'PlayStation DualSense جاهزة (✕, ◯, ▢, △)';
    }
    if (lower.includes('xbox') || lower.includes('xinput') || lower.includes('microsoft')) {
        return 'يد التحكم متصلة (تخطيط PlayStation الكامل)';
    }
    return 'Gamepad متصل (تحكم كامل 100%)';
}

window.triggerGamepadHaptic = async function(duration = 80, weak = 0.5, strong = 0.5) {
    const gp = getActiveGamepad();
    if (gp && gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
        try {
            await gp.vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration: duration,
                weakMagnitude: weak,
                strongMagnitude: strong
            });
        } catch (e) {}
    }
};

window.addEventListener('keydown', e => {
    if (document.activeElement && (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT' && document.activeElement.type === 'text')) {
        return;
    }
    window.InputState.keys[e.code] = true;
    const mode = window.getActiveUIMode();

    if (mode === 'help') {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
            e.preventDefault();
            window.dismissHelpModal();
        }
        return;
    }

    if (mode === 'gameover') {
        const items = Array.from(document.querySelectorAll('.go-menu-btn'));
        if (e.code === 'ArrowRight' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyD') {
            e.preventDefault();
            window.InputState.goFocusIdx--;
            window.applyGameOverFocus();
        } else if (e.code === 'ArrowLeft' || e.code === 'ArrowDown' || e.code === 'KeyS' || e.code === 'KeyA') {
            e.preventDefault();
            window.InputState.goFocusIdx++;
            window.applyGameOverFocus();
        } else if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            items[window.InputState.goFocusIdx]?.click();
        }
        return;
    }

    if (mode === 'pause') {
        const items = Array.from(document.querySelectorAll('.pause-menu-btn'));
        if (e.code === 'Escape' || e.code === 'KeyP') {
            e.preventDefault();
            window.closePauseModal();
        } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
            e.preventDefault();
            window.InputState.pauseFocusIdx--;
            window.applyPauseMenuFocus();
            window.SoundEngine?.uiTick?.();
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
            e.preventDefault();
            window.InputState.pauseFocusIdx++;
            window.applyPauseMenuFocus();
            window.SoundEngine?.uiTick?.();
        } else if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            items[window.InputState.pauseFocusIdx]?.click();
        }
        return;
    }

    if (mode === 'modder') {
        if (e.code === 'Escape' || e.code === 'Tab' || e.code === 'KeyM') {
            e.preventDefault();
            window.toggleModderDrawer(false);
        }
        return;
    }

    // Play Mode
    if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        window.openPauseModal();
        return;
    }
    if (e.code === 'Tab' || e.code === 'KeyM') {
        e.preventDefault();
        window.toggleModderDrawer(true);
        return;
    }

    // 4 PlayStation Face Buttons via Keyboard
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
        const rect = canvas.getBoundingClientRect();
        const lx = e.clientX - rect.left;
        const ly = e.clientY - rect.top;
        window.InputState.mouseX = lx;
        window.InputState.mouseY = ly;
        window.InputState.usingMouseForBuild = true;
        const viewW = window.GameState.viewW || window.innerWidth;
        const viewH = window.GameState.viewH || window.innerHeight;
        const wx = lx + window.GameState.camera.x - viewW / 2;
        const wy = ly + window.GameState.camera.y - viewH / 2;
        window.GameState.player.aimAngle = Math.atan2(wy - window.GameState.player.y, wx - window.GameState.player.x);
    });

    canvas.addEventListener('mousedown', e => {
        if (window.getActiveUIMode() !== 'play') return;
        window.SoundEngine?.init?.();
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

    // Mobile / Touchscreen virtual analog drag on canvas
    canvas.addEventListener('touchstart', e => {
        if (window.getActiveUIMode() !== 'play') return;
        window.SoundEngine?.init?.();
        const t = e.changedTouches[0];
        if (!t) return;
        window.InputState.touchMoveId = t.identifier;
        window.InputState.touchStartX = t.clientX;
        window.InputState.touchStartY = t.clientY;
        window.InputState.touchMoveX = 0;
        window.InputState.touchMoveY = 0;
        window.InputState.usingMouseForBuild = false;
    }, { passive: true });

    canvas.addEventListener('touchmove', e => {
        if (window.InputState.touchMoveId === null) return;
        for (const t of e.changedTouches) {
            if (t.identifier === window.InputState.touchMoveId) {
                const dx = t.clientX - window.InputState.touchStartX;
                const dy = t.clientY - window.InputState.touchStartY;
                const maxR = 48;
                const dist = Math.hypot(dx, dy);
                if (dist > 6) {
                    const norm = Math.min(1, dist / maxR);
                    window.InputState.touchMoveX = (dx / dist) * norm;
                    window.InputState.touchMoveY = (dy / dist) * norm;
                    window.GameState.player.aimAngle = Math.atan2(dy, dx);
                } else {
                    window.InputState.touchMoveX = 0;
                    window.InputState.touchMoveY = 0;
                }
                break;
            }
        }
    }, { passive: true });

    const clearTouch = e => {
        for (const t of e.changedTouches) {
            if (t.identifier === window.InputState.touchMoveId) {
                window.InputState.touchMoveId = null;
                window.InputState.touchMoveX = 0;
                window.InputState.touchMoveY = 0;
            }
        }
    };
    canvas.addEventListener('touchend', clearTouch, { passive: true });
    canvas.addEventListener('touchcancel', clearTouch, { passive: true });
};

window.addEventListener('wheel', e => {
    if (window.getActiveUIMode() !== 'play') return;
    window.stepCoreX(e.deltaY < 0 ? 1 : -1);
});

window.addEventListener('gamepadconnected', e => {
    window.InputState.gamepadSlot = e.gamepad.index;
    window.updatePlayStationBadge(true, e.gamepad.id);
    window.triggerGamepadHaptic(110, 0.5, 0.5);
});

window.addEventListener('gamepaddisconnected', e => {
    if (window.InputState.gamepadSlot === e.gamepad.index) {
        window.InputState.gamepadSlot = -1;
    }
    const remaining = getActiveGamepad();
    window.updatePlayStationBadge(!!remaining, remaining?.id || '');
});

window.updatePlayStationBadge = function(connected, idStr = '') {
    window.InputState.gamepadConnected = connected;
    const badge = document.getElementById('gamepadBadge');
    const icon = document.getElementById('gamepadIcon');
    const text = document.getElementById('gamepadStatusText');
    if (!badge || !icon || !text) return;

    badge.classList.toggle('is-connected', connected);
    text.classList.toggle('is-connected', connected);
    if (connected) {
        icon.textContent = '✕◯';
        text.textContent = detectControllerLabel(idStr);
    } else {
        icon.textContent = '🎮';
        text.textContent = 'لوحة المفاتيح / بانتظار يد PlayStation';
    }
};

function readHatDirections(gp) {
    const hat = gp.axes && gp.axes.length > 9 ? gp.axes[9] : 0;
    const hatValid = gp.axes && gp.axes.length > 9 && hat >= -1.05 && hat <= 1.05;
    const dUp = !!(gp.buttons[12]?.pressed) || (hatValid && (hat < -0.60 || hat > 0.85));
    const dRight = !!(gp.buttons[15]?.pressed) || (hatValid && hat > -0.82 && hat < -0.04);
    const dDown = !!(gp.buttons[13]?.pressed) || (hatValid && hat > -0.25 && hat < 0.55);
    const dLeft = !!(gp.buttons[14]?.pressed) || (hatValid && hat > 0.30);
    return { up: dUp, down: dDown, left: dLeft, right: dRight };
}

window.pollGamepad = function() {
    const gp = getActiveGamepad();
    if (!gp) {
        if (window.InputState.gamepadConnected) {
            window.updatePlayStationBadge(false);
        }
        return {
            moveX: window.InputState.touchMoveX,
            moveY: window.InputState.touchMoveY,
            firing: false
        };
    }

    if (!window.InputState.gamepadConnected) {
        window.updatePlayStationBadge(true, gp.id);
    }

    const mode = window.getActiveUIMode();
    const now = performance.now();

    const btnEdge = (idx) => {
        const isDown = !!(gp.buttons[idx] && (gp.buttons[idx].pressed || gp.buttons[idx].value > 0.5));
        const wasDown = !!window.InputState.prevButtons[idx];
        window.InputState.prevButtons[idx] = isDown;
        if (isDown && !wasDown) {
            window.SoundEngine?.init?.();
            return true;
        }
        return false;
    };

    const crossEdge = btnEdge(0);
    const circleEdge = btnEdge(1);
    const squareEdge = btnEdge(2);
    const triangleEdge = btnEdge(3);
    const l1Edge = btnEdge(4);
    const r1Edge = btnEdge(5);
    const l2Edge = btnEdge(6);
    const r2Edge = btnEdge(7);
    const selectEdge = btnEdge(8);
    const startEdge = btnEdge(9);

    const hatDirs = readHatDirections(gp);
    const rawLx = gp.axes[0] || 0;
    const rawLy = gp.axes[1] || 0;
    const rawRx = gp.axes[2] || 0;
    const rawRy = gp.axes[3] || 0;

    // Rescaled smooth deadzone for axes
    const dz = 0.16;
    const rescale = v => Math.abs(v) > dz ? (v - Math.sign(v) * dz) / (1 - dz) : 0;
    const lx = rescale(rawLx);
    const ly = rescale(rawLy);

    // Directional edge + repeat helper for UI & Play D-Pad
    const navUpRaw = hatDirs.up || (mode !== 'play' && rawLy < -0.55);
    const navDownRaw = hatDirs.down || (mode !== 'play' && rawLy > 0.55);
    const navLeftRaw = hatDirs.left || (mode !== 'play' && rawLx < -0.55);
    const navRightRaw = hatDirs.right || (mode !== 'play' && rawLx > 0.55);

    const anyNavHeld = navUpRaw || navDownRaw || navLeftRaw || navRightRaw;
    const prevHat = window.InputState.prevHatDirs;
    const navFreshEdge =
        (navUpRaw && !prevHat.up) ||
        (navDownRaw && !prevHat.down) ||
        (navLeftRaw && !prevHat.left) ||
        (navRightRaw && !prevHat.right);

    // Track actual hat edges even in play mode
    const hatUpEdge = hatDirs.up && !prevHat.up;
    const hatDownEdge = hatDirs.down && !prevHat.down;
    const hatLeftEdge = hatDirs.left && !prevHat.left;
    const hatRightEdge = hatDirs.right && !prevHat.right;

    window.InputState.prevHatDirs = {
        up: mode === 'play' ? hatDirs.up : navUpRaw,
        down: mode === 'play' ? hatDirs.down : navDownRaw,
        left: mode === 'play' ? hatDirs.left : navLeftRaw,
        right: mode === 'play' ? hatDirs.right : navRightRaw
    };

    // Route UI Modals First (100% Controller Support!)
    if (mode === 'gameover') {
        if (anyNavHeld && (navFreshEdge || now >= window.InputState.uiNavNextTime)) {
            window.InputState.uiNavNextTime = now + (navFreshEdge ? 260 : 140);
            if (navLeftRaw || navDownRaw) window.InputState.goFocusIdx++;
            else if (navRightRaw || navUpRaw) window.InputState.goFocusIdx--;
            window.applyGameOverFocus();
            window.SoundEngine?.uiTick?.();
        } else if (!anyNavHeld) {
            window.InputState.uiNavNextTime = 0;
        }
        if (crossEdge) {
            const items = Array.from(document.querySelectorAll('.go-menu-btn'));
            items[window.InputState.goFocusIdx]?.click();
        } else if (circleEdge) {
            document.getElementById('btnGameOverHub')?.click();
        }
        return { moveX: 0, moveY: 0, firing: false };
    }

    if (mode === 'help') {
        if (crossEdge || circleEdge || startEdge || selectEdge) {
            window.dismissHelpModal();
        }
        return { moveX: 0, moveY: 0, firing: false };
    }

    if (mode === 'pause') {
        if (anyNavHeld && (navFreshEdge || now >= window.InputState.uiNavNextTime)) {
            window.InputState.uiNavNextTime = now + (navFreshEdge ? 260 : 135);
            if (navDownRaw) window.InputState.pauseFocusIdx++;
            else if (navUpRaw) window.InputState.pauseFocusIdx--;
            window.applyPauseMenuFocus();
            window.SoundEngine?.uiTick?.();
        } else if (!anyNavHeld) {
            window.InputState.uiNavNextTime = 0;
        }

        if (crossEdge) {
            const items = Array.from(document.querySelectorAll('.pause-menu-btn'));
            items[window.InputState.pauseFocusIdx]?.click();
        } else if (circleEdge || startEdge) {
            window.closePauseModal();
        } else if (squareEdge) {
            window.toggleModderDrawer(true);
        } else if (triangleEdge) {
            window.closePauseModal();
            document.getElementById('helpModal')?.classList.remove('hidden');
            window.syncPauseStateFromModals();
        }
        return { moveX: 0, moveY: 0, firing: false };
    }

    if (mode === 'modder') {
        if (anyNavHeld && (navFreshEdge || now >= window.InputState.uiNavNextTime)) {
            window.InputState.uiNavNextTime = now + (navFreshEdge ? 250 : 120);
            if (navDownRaw) {
                window.InputState.modderFocusIdx++;
                window.applyModderFocus();
                window.SoundEngine?.uiTick?.();
            } else if (navUpRaw) {
                window.InputState.modderFocusIdx--;
                window.applyModderFocus();
                window.SoundEngine?.uiTick?.();
            } else if (navRightRaw) {
                adjustModderItem(1);
            } else if (navLeftRaw) {
                adjustModderItem(-1);
            }
        } else if (!anyNavHeld) {
            window.InputState.uiNavNextTime = 0;
        }

        if (crossEdge) activateModderItem();
        if (circleEdge || selectEdge || startEdge) {
            window.toggleModderDrawer(false);
        }
        return { moveX: 0, moveY: 0, firing: false };
    }

    // Active Play Mode
    if (startEdge) {
        window.openPauseModal();
        return { moveX: 0, moveY: 0, firing: false };
    }
    if (selectEdge) {
        window.toggleModderDrawer(true);
        return { moveX: 0, moveY: 0, firing: false };
    }

    // Aim with Right Stick or fallback to Left Stick
    if (Math.hypot(rawRx, rawRy) > 0.22) {
        window.GameState.player.aimAngle = Math.atan2(rawRy, rawRx);
        window.InputState.usingMouseForBuild = false;
    } else if (Math.hypot(lx, ly) > 0.22) {
        window.GameState.player.aimAngle = Math.atan2(ly, lx);
        window.InputState.usingMouseForBuild = false;
    }

    // PlayStation 4 Math Face Buttons
    if (crossEdge) window.applyMathButton(0);
    if (circleEdge) window.applyMathButton(1);
    if (squareEdge) window.applyMathButton(2);
    if (triangleEdge) window.applyMathButton(3);

    // L1 / R1: Cycle Building Blueprints
    if (l1Edge) window.cycleBuildingSelection(-1);
    if (r1Edge) window.cycleBuildingSelection(1);

    // L2: Place Building
    if (l2Edge) window.placeSelectedBuilding();

    // R2: EMP Kinetic Resonance Blast + Held Plasma
    if (r2Edge) window.triggerMathResonanceCheck(true);
    const r2Held = !!(gp.buttons[7] && (gp.buttons[7].pressed || gp.buttons[7].value > 0.35));

    // D-Pad Up / Down: Step Core X smoothly (instant tap + repeat on hold)
    if (hatUpEdge || (hatDirs.up && now >= window.InputState.playDpadNextTime)) {
        window.InputState.playDpadNextTime = now + (hatUpEdge ? 230 : 105);
        window.stepCoreX(1);
    } else if (hatDownEdge || (hatDirs.down && now >= window.InputState.playDpadNextTime)) {
        window.InputState.playDpadNextTime = now + (hatDownEdge ? 230 : 105);
        window.stepCoreX(-1);
    } else if (!hatDirs.up && !hatDirs.down) {
        window.InputState.playDpadNextTime = 0;
    }

    // D-Pad Left / Right: Cycle Blueprints
    if (hatLeftEdge) window.cycleBuildingSelection(-1);
    if (hatRightEdge) window.cycleBuildingSelection(1);

    return {
        moveX: Math.abs(lx) > 0 ? lx : window.InputState.touchMoveX,
        moveY: Math.abs(ly) > 0 ? ly : window.InputState.touchMoveY,
        firing: r2Held
    };
};
