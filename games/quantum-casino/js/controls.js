/**
 * Quantum Casino (كازينو الاحتمالات الكمومي) — Input, Touch & DualSense Controls
 * Implements 100% PlayStation DualSense / DualShock, Keyboard/Mouse, and Mobile Touch
 * heist controls, modal navigation focus rings, and dual-rumble haptic pulses.
 */

(function () {
  'use strict';

  const DEADZONE = 0.21;
  const AIM_DEADZONE = 0.25;

  const keys = Object.create(null);
  const pointer = {
    x: 0,
    y: 0,
    hasMoved: false,
    down: false
  };

  const touchStick = {
    active: false,
    id: null,
    originX: 0,
    originY: 0,
    dx: 0,
    dy: 0,
    maxRadius: 42
  };

  const gpState = {
    connected: false,
    index: null,
    idLabel: '',
    prevButtons: [],
    axisLeftHeld: false,
    axisRightHeld: false,
    axisUpHeld: false,
    axisDownHeld: false,
    pauseFocusIdx: 0,
    endFocusIdx: 0,
    lastShownConnected: null,
    lastShownLabel: ''
  };

  let inputLockUntil = 0;
  let stateGetter = null;
  let domCache = null;

  /**
   * Cache frequently touched DOM nodes for zero-allocation HUD/gamepad status updates.
   * @returns {Object} Cached DOM references.
   */
  function getDomCache() {
    if (domCache) return domCache;
    domCache = {
      gamepadPill: document.getElementById('gamepadPill'),
      gamepadStatusText: document.getElementById('gamepadStatusText'),
      touchJoystick: document.getElementById('touchJoystick'),
      touchStickKnob: document.getElementById('touchStickKnob'),
      btnStartCasino: document.getElementById('btnStartCasino'),
      seqOpt0: document.getElementById('seqOpt0'),
      seqOpt1: document.getElementById('seqOpt1'),
      seqOpt2: document.getElementById('seqOpt2'),
      seqOpt3: document.getElementById('seqOpt3'),
      btnToggleHint: document.getElementById('btnToggleHint'),
      btnOverdriveBypass: document.getElementById('btnOverdriveBypass'),
      actDash: document.getElementById('actDash'),
      actSlice: document.getElementById('actSlice'),
      actOverride: document.getElementById('actOverride'),
      actBulletTime: document.getElementById('actBulletTime'),
      actShoot: document.getElementById('actShoot'),
      actJackpot: document.getElementById('actJackpot'),
      filterBtns: Array.from(document.querySelectorAll('#introFilterGrid .filter-btn')),
      pauseBtns: Array.from(document.querySelectorAll('.pause-menu-btn')),
      endBtns: Array.from(document.querySelectorAll('.end-menu-btn'))
    };
    return domCache;
  }

  /**
   * Apply radial deadzone and normalize analog stick vector.
   * @param {number} x - Raw X axis [-1, 1].
   * @param {number} y - Raw Y axis [-1, 1].
   * @param {number} deadzone - Radial threshold.
   * @returns {{x: number, y: number}} Filtered stick vector.
   */
  function applyRadialDeadzone(x, y, deadzone) {
    const mag = Math.hypot(x, y);
    if (mag < deadzone) return { x: 0, y: 0 };
    const norm = Math.min(1, (mag - deadzone) / (1 - deadzone));
    return {
      x: (x / mag) * norm,
      y: (y / mag) * norm
    };
  }

  /**
   * Detect rising edge for a gamepad button index.
   * @param {Gamepad} gp - Browser Gamepad object.
   * @param {number} idx - Standard Gamepad button index.
   * @returns {boolean} True only on frame pressed.
   */
  function justPressed(gp, idx) {
    const btn = gp.buttons[idx];
    const pressed = Boolean(btn && (btn.pressed || btn.value > 0.55));
    const was = Boolean(gpState.prevButtons[idx]);
    return pressed && !was;
  }

  /**
   * Snapshot current gamepad buttons for next-frame rising-edge detection.
   * @param {Gamepad} gp - Browser Gamepad object.
   */
  function snapshotButtons(gp) {
    for (let i = 0; i < gp.buttons.length; i += 1) {
      const btn = gp.buttons[i];
      gpState.prevButtons[i] = Boolean(btn && (btn.pressed || btn.value > 0.55));
    }
  }

  /**
   * Prevent accidental bleed-through input immediately after modal transitions.
   * @param {number} [ms=220] - Lock duration in milliseconds.
   */
  window.lockCasinoInputBriefly = function lockCasinoInputBriefly(ms) {
    const duration = typeof ms === 'number' ? ms : 220;
    inputLockUntil = performance.now() + duration;
  };

  /**
   * Trigger DualSense / DualShock dual-rumble haptic actuator when available.
   * @param {number} [duration=90] - Vibration duration in ms.
   * @param {number} [weak=0.35] - High-frequency motor magnitude [0..1].
   * @param {number} [strong=0.55] - Low-frequency motor magnitude [0..1].
   */
  window.triggerCasinoHaptic = function triggerCasinoHaptic(duration, weak, strong) {
    if (!gpState.connected || gpState.index === null) return;
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const pads = navigator.getGamepads();
    const gp = pads && pads[gpState.index];
    if (!gp || !gp.vibrationActuator || typeof gp.vibrationActuator.playEffect !== 'function') {
      return;
    }
    try {
      gp.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: duration || 90,
        weakMagnitude: Math.min(1, Math.max(0, weak ?? 0.35)),
        strongMagnitude: Math.min(1, Math.max(0, strong ?? 0.55))
      }).catch(() => {});
    } catch (_) {}
  };

  /**
   * Update HUD DualSense pill without redundant DOM writes.
   */
  function updateGamepadBanner() {
    const cache = getDomCache();
    if (!cache.gamepadPill || !cache.gamepadStatusText) return;
    if (
      gpState.lastShownConnected === gpState.connected &&
      gpState.lastShownLabel === gpState.idLabel
    ) {
      return;
    }
    gpState.lastShownConnected = gpState.connected;
    gpState.lastShownLabel = gpState.idLabel;

    cache.gamepadPill.classList.toggle('connected', gpState.connected);
    cache.gamepadPill.classList.toggle('disconnected', !gpState.connected);
    cache.gamepadStatusText.textContent = gpState.connected
      ? (gpState.idLabel || 'DualSense متصل')
      : 'لوحة المفاتيح / DualSense';
  }

  /**
   * Clear .gp-focused class from a button collection and apply to active index.
   */
  function applyFocusRing(btns, idx) {
    if (!btns || !btns.length) return;
    const safeIdx = ((idx % btns.length) + btns.length) % btns.length;
    for (let i = 0; i < btns.length; i += 1) {
      btns[i].classList.toggle('gp-focused', i === safeIdx);
    }
  }

  window.applyCasinoPauseFocus = function applyCasinoPauseFocus() {
    applyFocusRing(getDomCache().pauseBtns, gpState.pauseFocusIdx);
  };

  window.applyCasinoEndFocus = function applyCasinoEndFocus() {
    applyFocusRing(getDomCache().endBtns, gpState.endFocusIdx);
  };

  /**
   * Resolve active Gamepad object from navigator.getGamepads().
   */
  function resolveActiveGamepad() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
    const pads = navigator.getGamepads();
    if (!pads) return null;

    if (gpState.index !== null && pads[gpState.index]) {
      return pads[gpState.index];
    }
    for (let i = 0; i < pads.length; i += 1) {
      if (pads[i] && pads[i].connected) {
        gpState.connected = true;
        gpState.index = pads[i].index;
        gpState.idLabel = pads[i].id && pads[i].id.toLowerCase().includes('dualsense')
          ? 'DualSense جاهز'
          : 'Gamepad متصل';
        return pads[i];
      }
    }
    return null;
  }

  /**
   * Decode standard Linux/Chrome D-Pad hat axis (axes[9]) when present.
   */
  function decodeDpadHat(gp) {
    const hat = gp && typeof gp.axes?.[9] === 'number' ? gp.axes[9] : null;
    if (hat === null || hat > 1.1) {
      return { up: false, down: false, left: false, right: false };
    }
    return {
      up: hat >= -1.05 && hat <= -0.78,
      right: hat >= -0.65 && hat <= -0.22,
      down: hat >= -0.15 && hat <= 0.35,
      left: hat >= 0.45 && hat <= 0.95
    };
  }

  /**
   * Compute combined normalized heist movement vector from keyboard, touch stick, and Left Stick.
   */
  window.getCasinoMoveVec = function getCasinoMoveVec() {
    let vx = 0;
    let vy = 0;

    if (keys['KeyA'] || keys['ArrowLeft']) vx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) vx += 1;
    if (keys['KeyW'] || keys['ArrowUp']) vy -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) vy += 1;

    if (touchStick.active) {
      vx += touchStick.dx;
      vy += touchStick.dy;
    }

    const gp = resolveActiveGamepad();
    if (gp) {
      const lStick = applyRadialDeadzone(gp.axes[0] || 0, gp.axes[1] || 0, DEADZONE);
      vx += lStick.x;
      vy += lStick.y;

      const hat = decodeDpadHat(gp);
      if (gp.buttons[14]?.pressed || hat.left) vx -= 0.75;
      if (gp.buttons[15]?.pressed || hat.right) vx += 0.75;
      if (gp.buttons[12]?.pressed || hat.up) vy -= 0.75;
      if (gp.buttons[13]?.pressed || hat.down) vy += 0.75;
    }

    const mag = Math.hypot(vx, vy);
    if (mag > 1) return { x: vx / mag, y: vy / mag };
    return { x: vx, y: vy };
  };

  /**
   * Compute aim vector from Right Stick or Mouse pointer relative to canvas center.
   */
  function getAimVec(state) {
    const gp = resolveActiveGamepad();
    if (gp) {
      const rStick = applyRadialDeadzone(gp.axes[2] || 0, gp.axes[3] || 0, AIM_DEADZONE);
      if (Math.hypot(rStick.x, rStick.y) > 0.1) return rStick;
    }

    if (pointer.hasMoved && state && state.camera) {
      const canvas = document.getElementById('gameCanvas');
      const rect = canvas ? canvas.getBoundingClientRect() : null;
      const cssW = rect ? rect.width : window.innerWidth;
      const cssH = rect ? rect.height : window.innerHeight;
      const sx = ((state.player.x - state.camera.x) * state.camera.zoom) + cssW * 0.5;
      const sy = ((state.player.y - state.camera.y) * state.camera.zoom) + cssH * 0.5;
      const dx = pointer.x - sx;
      const dy = pointer.y - sy;
      const dist = Math.hypot(dx, dy);
      if (dist > 6) return { x: dx / dist, y: dy / dist };
    }
    return { x: 0, y: 0 };
  }

  function handleIntroGamepad(gp, dLeft, dRight) {
    if (dLeft || justPressed(gp, 4)) {
      window.cycleCasinoFilter?.(-1);
    } else if (dRight || justPressed(gp, 5)) {
      window.cycleCasinoFilter?.(1);
    }
    if (justPressed(gp, 0) || justPressed(gp, 9)) {
      window.startCasinoFromIntro?.();
    }
  }

  function handleOverrideGamepad(gp) {
    if (justPressed(gp, 0)) window.submitCasinoOption?.(0);
    else if (justPressed(gp, 1)) window.submitCasinoOption?.(1);
    else if (justPressed(gp, 2)) window.submitCasinoOption?.(2);
    else if (justPressed(gp, 3)) window.submitCasinoOption?.(3);
    else if (justPressed(gp, 5) || justPressed(gp, 4)) window.toggleCasinoHint?.();
    else if (justPressed(gp, 6)) window.triggerCasinoOverdriveBypass?.();
  }

  function handlePauseGamepad(gp, dUp, dDown) {
    const btns = getDomCache().pauseBtns;
    if (!btns.length) return;

    if (dUp) {
      gpState.pauseFocusIdx = (gpState.pauseFocusIdx - 1 + btns.length) % btns.length;
      window.applyCasinoPauseFocus();
      window.CasinoAudio?.playUiTick();
    } else if (dDown) {
      gpState.pauseFocusIdx = (gpState.pauseFocusIdx + 1) % btns.length;
      window.applyCasinoPauseFocus();
      window.CasinoAudio?.playUiTick();
    }

    if (justPressed(gp, 1) || justPressed(gp, 9)) {
      window.closeCasinoPause?.();
      return;
    }
    if (justPressed(gp, 0)) {
      btns[gpState.pauseFocusIdx]?.click();
    }
  }

  function handleEndGamepad(gp, dLeft, dRight) {
    const btns = getDomCache().endBtns;
    if (!btns.length) return;

    if (dLeft || dRight) {
      gpState.endFocusIdx = (gpState.endFocusIdx + 1) % btns.length;
      window.applyCasinoEndFocus();
      window.CasinoAudio?.playUiTick();
    }

    if (justPressed(gp, 0) || justPressed(gp, 9)) {
      (btns[gpState.endFocusIdx] || btns[0])?.click();
    }
  }

  /**
   * Poll DualSense, mouse hold-fire, and modal navigation each frame.
   */
  window.pollCasinoInputs = function pollCasinoInputs(state) {
    const moveVec = window.getCasinoMoveVec();
    const aimVec = getAimVec(state);
    const gp = resolveActiveGamepad();
    updateGamepadBanner();

    if (!gp) {
      if (state.mode === 'play' && (pointer.down || keys['KeyJ'])) {
        if (Math.hypot(aimVec.x, aimVec.y) > 0.05) {
          state.player.aimAngle = Math.atan2(aimVec.y, aimVec.x);
        }
        window.performCasinoShoot?.(state);
      }
      return { moveVec, aimVec };
    }

    const now = performance.now();
    const ax = gp.axes[0] || 0;
    const ay = gp.axes[1] || 0;
    const hat = decodeDpadHat(gp);

    const axisLeftNow = ax < -0.55 || hat.left;
    const axisRightNow = ax > 0.55 || hat.right;
    const axisUpNow = ay < -0.55 || hat.up;
    const axisDownNow = ay > 0.55 || hat.down;

    const dLeft = justPressed(gp, 14) || (axisLeftNow && !gpState.axisLeftHeld);
    const dRight = justPressed(gp, 15) || (axisRightNow && !gpState.axisRightHeld);
    const dUp = justPressed(gp, 12) || (axisUpNow && !gpState.axisUpHeld);
    const dDown = justPressed(gp, 13) || (axisDownNow && !gpState.axisDownHeld);

    gpState.axisLeftHeld = axisLeftNow;
    gpState.axisRightHeld = axisRightNow;
    gpState.axisUpHeld = axisUpNow;
    gpState.axisDownHeld = axisDownNow;

    if (now >= inputLockUntil) {
      if (state.mode === 'intro') {
        handleIntroGamepad(gp, dLeft, dRight);
      } else if (state.mode === 'override') {
        handleOverrideGamepad(gp);
      } else if (state.mode === 'pause') {
        handlePauseGamepad(gp, dUp, dDown);
      } else if (state.mode === 'end') {
        handleEndGamepad(gp, dLeft, dRight);
      } else if (state.mode === 'play') {
        if (justPressed(gp, 9)) {
          window.openCasinoPause?.();
        } else {
          // R2 (7) or Hold Mouse/J -> Prism Chip Blaster
          const r2Held = Boolean(gp.buttons[7] && (gp.buttons[7].pressed || gp.buttons[7].value > 0.35));
          if (r2Held || pointer.down || keys['KeyJ']) {
            if (Math.hypot(aimVec.x, aimVec.y) > 0.05) {
              state.player.aimAngle = Math.atan2(aimVec.y, aimVec.x);
            }
            window.performCasinoShoot?.(state);
          }
          // ✕ (0) -> Quantum Blink Dash
          if (justPressed(gp, 0)) window.performCasinoDash?.(state, moveVec);
          // ◯ (1) -> Card-Slice Evade
          if (justPressed(gp, 1)) window.performCasinoSlice?.(state, moveVec);
          // ▢ (2) -> Vault Seal Override / Execute Staggered Guard
          if (justPressed(gp, 2)) window.triggerNearestCasinoGate?.(state);
          // △ (3) or L1 (4) -> Bullet-Time Quantum Dilation
          if (justPressed(gp, 3) || justPressed(gp, 4)) window.performCasinoBulletTime?.(state);
          // R1 (5) or L2 (6) -> Bernoulli Jackpot Shockwave
          if (justPressed(gp, 5) || justPressed(gp, 6)) window.performCasinoJackpot?.(state);
        }
      }
    }

    snapshotButtons(gp);
    return { moveVec, aimVec };
  };

  function handleKeyDown(e) {
    keys[e.code] = true;
    const state = stateGetter ? stateGetter() : null;
    if (!state || performance.now() < inputLockUntil) return;

    if (e.code === 'Escape' || e.code === 'KeyP') {
      if (state.mode === 'play') window.openCasinoPause?.();
      else if (state.mode === 'pause') window.closeCasinoPause?.();
      return;
    }

    if (state.mode === 'intro') {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        window.startCasinoFromIntro?.();
      } else if (e.code === 'ArrowLeft') {
        window.cycleCasinoFilter?.(-1);
      } else if (e.code === 'ArrowRight') {
        window.cycleCasinoFilter?.(1);
      }
      return;
    }

    if (state.mode === 'override') {
      if (e.code === 'Digit1' || e.code === 'Numpad1') window.submitCasinoOption?.(0);
      else if (e.code === 'Digit2' || e.code === 'Numpad2') window.submitCasinoOption?.(1);
      else if (e.code === 'Digit3' || e.code === 'Numpad3') window.submitCasinoOption?.(2);
      else if (e.code === 'Digit4' || e.code === 'Numpad4') window.submitCasinoOption?.(3);
      else if (e.code === 'KeyH') window.toggleCasinoHint?.();
      else if (e.code === 'KeyF' || e.code === 'KeyV') window.triggerCasinoOverdriveBypass?.();
      return;
    }

    if (state.mode === 'pause') {
      const cache = getDomCache();
      if (e.code === 'ArrowUp') {
        gpState.pauseFocusIdx = (gpState.pauseFocusIdx - 1 + cache.pauseBtns.length) % Math.max(1, cache.pauseBtns.length);
        window.applyCasinoPauseFocus?.();
      } else if (e.code === 'ArrowDown') {
        gpState.pauseFocusIdx = (gpState.pauseFocusIdx + 1) % Math.max(1, cache.pauseBtns.length);
        window.applyCasinoPauseFocus?.();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        cache.pauseBtns[gpState.pauseFocusIdx]?.click();
      }
      return;
    }

    if (state.mode === 'end') {
      const cache = getDomCache();
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        gpState.endFocusIdx = (gpState.endFocusIdx + 1) % Math.max(1, cache.endBtns.length);
        window.applyCasinoEndFocus?.();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        (cache.endBtns[gpState.endFocusIdx] || cache.endBtns[0])?.click();
      }
      return;
    }

    if (state.mode !== 'play') return;

    const moveVec = window.getCasinoMoveVec();
    if (e.code === 'Space') {
      e.preventDefault();
      window.performCasinoDash?.(state, moveVec);
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') {
      window.performCasinoSlice?.(state, moveVec);
    } else if (e.code === 'KeyE') {
      window.triggerNearestCasinoGate?.(state);
    } else if (e.code === 'KeyL' || e.code === 'KeyQ') {
      window.performCasinoBulletTime?.(state);
    } else if (e.code === 'KeyF' || e.code === 'KeyR') {
      window.performCasinoJackpot?.(state);
    } else if (e.code === 'KeyJ') {
      window.performCasinoShoot?.(state);
    }
  }

  function bindTouchControls() {
    const cache = getDomCache();
    const joy = cache.touchJoystick;
    const knob = cache.touchStickKnob;

    if (joy && knob) {
      joy.addEventListener('touchstart', (e) => {
        if (!e.changedTouches.length) return;
        const t = e.changedTouches[0];
        const rect = joy.getBoundingClientRect();
        touchStick.active = true;
        touchStick.id = t.identifier;
        touchStick.originX = rect.left + rect.width * 0.5;
        touchStick.originY = rect.top + rect.height * 0.5;
        touchStick.dx = 0;
        touchStick.dy = 0;
        e.preventDefault();
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (!touchStick.active) return;
        for (let i = 0; i < e.changedTouches.length; i += 1) {
          const t = e.changedTouches[i];
          if (t.identifier !== touchStick.id) continue;
          const rawDx = t.clientX - touchStick.originX;
          const rawDy = t.clientY - touchStick.originY;
          const dist = Math.hypot(rawDx, rawDy);
          const clampDist = Math.min(dist, touchStick.maxRadius);
          const nx = dist > 0.5 ? rawDx / dist : 0;
          const ny = dist > 0.5 ? rawDy / dist : 0;
          knob.style.transform = `translate(${nx * clampDist}px, ${ny * clampDist}px)`;
          touchStick.dx = dist > 8 ? nx * (clampDist / touchStick.maxRadius) : 0;
          touchStick.dy = dist > 8 ? ny * (clampDist / touchStick.maxRadius) : 0;
          break;
        }
      }, { passive: true });

      const endStick = (e) => {
        if (!touchStick.active) return;
        for (let i = 0; i < e.changedTouches.length; i += 1) {
          if (e.changedTouches[i].identifier === touchStick.id) {
            touchStick.active = false;
            touchStick.id = null;
            touchStick.dx = 0;
            touchStick.dy = 0;
            knob.style.transform = 'translate(0px, 0px)';
            break;
          }
        }
      };
      window.addEventListener('touchend', endStick, { passive: true });
      window.addEventListener('touchcancel', endStick, { passive: true });
    }

    const bindDeckBtn = (btn, handler) => {
      if (!btn) return;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const state = stateGetter ? stateGetter() : null;
        if (!state || state.mode !== 'play') return;
        handler(state);
      });
    };

    bindDeckBtn(cache.actDash, (s) => window.performCasinoDash?.(s, window.getCasinoMoveVec()));
    bindDeckBtn(cache.actSlice, (s) => window.performCasinoSlice?.(s, window.getCasinoMoveVec()));
    bindDeckBtn(cache.actOverride, (s) => window.triggerNearestCasinoGate?.(s));
    bindDeckBtn(cache.actBulletTime, (s) => window.performCasinoBulletTime?.(s));
    bindDeckBtn(cache.actShoot, (s) => window.performCasinoShoot?.(s));
    bindDeckBtn(cache.actJackpot, (s) => window.performCasinoJackpot?.(s));
  }

  window.initCasinoControls = function initCasinoControls(getStateFn) {
    stateGetter = getStateFn;
    const canvas = document.getElementById('gameCanvas');

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', (e) => {
      keys[e.code] = false;
    });

    if (canvas) {
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
        pointer.hasMoved = true;
      });
      canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
          const rect = canvas.getBoundingClientRect();
          pointer.x = e.clientX - rect.left;
          pointer.y = e.clientY - rect.top;
          pointer.hasMoved = true;
          pointer.down = true;
          const state = stateGetter ? stateGetter() : null;
          if (state && state.mode === 'play') {
            window.performCasinoShoot?.(state);
          }
        }
      });
    }

    window.addEventListener('mouseup', () => {
      pointer.down = false;
    });

    window.addEventListener('gamepadconnected', (e) => {
      gpState.connected = true;
      gpState.index = e.gamepad.index;
      const rawId = (e.gamepad.id || '').toLowerCase();
      gpState.idLabel = rawId.includes('dualsense') || rawId.includes('054c')
        ? 'DualSense متصل'
        : 'Gamepad متصل';
      updateGamepadBanner();
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      if (gpState.index === e.gamepad.index) {
        gpState.connected = false;
        gpState.index = null;
        gpState.idLabel = '';
        gpState.prevButtons.length = 0;
        updateGamepadBanner();
      }
    });

    bindTouchControls();
    updateGamepadBanner();
  };
})();
