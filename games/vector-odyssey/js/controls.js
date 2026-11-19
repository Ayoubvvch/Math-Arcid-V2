/**
 * Vector Odyssey (أوديسا الفضاء المتجهي) — Input, Touch & DualSense Controls
 * Implements 100% PlayStation DualSense / DualShock, Keyboard/Mouse, and Mobile Touch
 * flight controls, modal navigation focus rings, and haptic feedback pulses.
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
      btnStartOdyssey: document.getElementById('btnStartOdyssey'),
      seqOpt0: document.getElementById('seqOpt0'),
      seqOpt1: document.getElementById('seqOpt1'),
      seqOpt2: document.getElementById('seqOpt2'),
      seqOpt3: document.getElementById('seqOpt3'),
      btnToggleHint: document.getElementById('btnToggleHint'),
      btnOverdriveBypass: document.getElementById('btnOverdriveBypass'),
      actBoost: document.getElementById('actBoost'),
      actRoll: document.getElementById('actRoll'),
      actOverride: document.getElementById('actOverride'),
      actAegis: document.getElementById('actAegis'),
      actPulse: document.getElementById('actPulse'),
      actOverdrive: document.getElementById('actOverdrive'),
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
  window.lockOdysseyInputBriefly = function lockOdysseyInputBriefly(ms) {
    const duration = typeof ms === 'number' ? ms : 220;
    inputLockUntil = performance.now() + duration;
  };

  /**
   * Trigger DualSense / DualShock dual-rumble haptic actuator when available.
   * @param {number} [duration=90] - Vibration duration in ms.
   * @param {number} [weak=0.35] - High-frequency motor magnitude [0..1].
   * @param {number} [strong=0.55] - Low-frequency motor magnitude [0..1].
   */
  window.triggerOdysseyHaptic = function triggerOdysseyHaptic(duration, weak, strong) {
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
    } catch (_) {
      // Ignore unsupported browser actuator states
    }
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

    if (gpState.connected) {
      cache.gamepadPill.classList.add('connected');
      cache.gamepadStatusText.textContent = gpState.idLabel || 'DualSense متصل';
    } else {
      cache.gamepadPill.classList.remove('connected');
      cache.gamepadStatusText.textContent = 'يد التحكم: لوحة المفاتيح / DualSense';
    }
  }

  /**
   * Clear .gp-focused class from a button collection and apply to active index.
   * @param {HTMLElement[]} btns - Button array.
   * @param {number} idx - Active focus index.
   */
  function applyFocusRing(btns, idx) {
    if (!btns || !btns.length) return;
    const safeIdx = ((idx % btns.length) + btns.length) % btns.length;
    for (let i = 0; i < btns.length; i += 1) {
      if (i === safeIdx) {
        btns[i].classList.add('gp-focused');
      } else {
        btns[i].classList.remove('gp-focused');
      }
    }
  }

  /**
   * Highlight active button inside Pause Modal when navigating via DualSense.
   */
  window.applyOdysseyPauseFocus = function applyOdysseyPauseFocus() {
    const cache = getDomCache();
    applyFocusRing(cache.pauseBtns, gpState.pauseFocusIdx);
  };

  /**
   * Highlight active button inside End Modal when navigating via DualSense.
   */
  window.applyOdysseyEndFocus = function applyOdysseyEndFocus() {
    const cache = getDomCache();
    applyFocusRing(cache.endBtns, gpState.endFocusIdx);
  };

  /**
   * Resolve active Gamepad object from navigator.getGamepads().
   * @returns {Gamepad|null} Active gamepad if present.
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
   * Compute combined normalized flight movement vector from keyboard, touch stick, and Left Stick.
   * @returns {{x: number, y: number}} Normalized 2D thrust vector.
   */
  window.getOdysseyMoveVec = function getOdysseyMoveVec() {
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

      // Also honor D-pad micro-maneuvering during active combat
      if (gp.buttons[14]?.pressed) vx -= 0.75;
      if (gp.buttons[15]?.pressed) vx += 0.75;
      if (gp.buttons[12]?.pressed) vy -= 0.75;
      if (gp.buttons[13]?.pressed) vy += 0.75;
    }

    const mag = Math.hypot(vx, vy);
    if (mag > 1) {
      return { x: vx / mag, y: vy / mag };
    }
    return { x: vx, y: vy };
  };

  /**
   * Compute aim vector from Right Stick or Mouse pointer relative to canvas center.
   * @param {Object} state - Live world state.
   * @returns {{x: number, y: number}} Unit or zero aim vector.
   */
  function getAimVec(state) {
    const gp = resolveActiveGamepad();
    if (gp) {
      const rStick = applyRadialDeadzone(gp.axes[2] || 0, gp.axes[3] || 0, AIM_DEADZONE);
      if (Math.hypot(rStick.x, rStick.y) > 0.1) {
        return rStick;
      }
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
      if (dist > 6) {
        return { x: dx / dist, y: dy / dist };
      }
    }
    return { x: 0, y: 0 };
  }

  /**
   * Handle DualSense navigation inside Intro Modal.
   * @param {Gamepad} gp - Active gamepad.
   * @param {boolean} dLeft - Left rising edge.
   * @param {boolean} dRight - Right rising edge.
   */
  function handleIntroGamepad(gp, dLeft, dRight) {
    if (dLeft || justPressed(gp, 4)) {
      if (typeof window.cycleOdysseyFilter === 'function') window.cycleOdysseyFilter(-1);
    } else if (dRight || justPressed(gp, 5)) {
      if (typeof window.cycleOdysseyFilter === 'function') window.cycleOdysseyFilter(1);
    }
    if (justPressed(gp, 0) || justPressed(gp, 9)) {
      if (typeof window.startOdysseyFromIntro === 'function') window.startOdysseyFromIntro();
    }
  }

  /**
   * Handle DualSense answers & tactical triggers inside Override Equation Modal.
   * × = Option A (0), ○ = Option B (1), □ = Option C (2), △ = Option D (3).
   * @param {Gamepad} gp - Active gamepad.
   */
  function handleOverrideGamepad(gp) {
    if (justPressed(gp, 0)) {
      if (typeof window.submitOdysseyOption === 'function') window.submitOdysseyOption(0);
    } else if (justPressed(gp, 1)) {
      if (typeof window.submitOdysseyOption === 'function') window.submitOdysseyOption(1);
    } else if (justPressed(gp, 2)) {
      if (typeof window.submitOdysseyOption === 'function') window.submitOdysseyOption(2);
    } else if (justPressed(gp, 3)) {
      if (typeof window.submitOdysseyOption === 'function') window.submitOdysseyOption(3);
    } else if (justPressed(gp, 4)) {
      if (typeof window.toggleOdysseyHint === 'function') window.toggleOdysseyHint();
    } else if (justPressed(gp, 5)) {
      if (typeof window.triggerOdysseyOverdriveBypass === 'function') {
        window.triggerOdysseyOverdriveBypass();
      }
    }
  }

  /**
   * Handle DualSense D-pad / Left Stick navigation inside Pause Modal.
   * @param {Gamepad} gp - Active gamepad.
   * @param {boolean} dUp - Up rising edge.
   * @param {boolean} dDown - Down rising edge.
   */
  function handlePauseGamepad(gp, dUp, dDown) {
    const cache = getDomCache();
    const btns = cache.pauseBtns;
    if (!btns.length) return;

    if (dUp) {
      gpState.pauseFocusIdx = (gpState.pauseFocusIdx - 1 + btns.length) % btns.length;
      window.applyOdysseyPauseFocus();
      if (window.OdysseyAudio) window.OdysseyAudio.playUiTick();
    } else if (dDown) {
      gpState.pauseFocusIdx = (gpState.pauseFocusIdx + 1) % btns.length;
      window.applyOdysseyPauseFocus();
      if (window.OdysseyAudio) window.OdysseyAudio.playUiTick();
    }

    if (justPressed(gp, 1) || justPressed(gp, 9)) {
      if (typeof window.closeOdysseyPause === 'function') window.closeOdysseyPause();
      return;
    }
    if (justPressed(gp, 0)) {
      const target = btns[gpState.pauseFocusIdx];
      if (target) target.click();
    }
  }

  /**
   * Handle DualSense navigation inside End Mission Modal.
   * @param {Gamepad} gp - Active gamepad.
   * @param {boolean} dLeft - Left rising edge.
   * @param {boolean} dRight - Right rising edge.
   */
  function handleEndGamepad(gp, dLeft, dRight) {
    const cache = getDomCache();
    const btns = cache.endBtns;
    if (!btns.length) return;

    if (dLeft || dRight) {
      gpState.endFocusIdx = (gpState.endFocusIdx + 1) % btns.length;
      window.applyOdysseyEndFocus();
      if (window.OdysseyAudio) window.OdysseyAudio.playUiTick();
    }

    if (justPressed(gp, 0) || justPressed(gp, 9)) {
      const target = btns[gpState.endFocusIdx] || btns[0];
      if (target) target.click();
    }
  }

  /**
   * Poll DualSense, mouse hold-fire, and modal navigation each frame.
   * @param {Object} state - Current Odyssey world state.
   * @returns {{moveVec: {x:number,y:number}, aimVec: {x:number,y:number}}} Vectors for physics update.
   */
  window.pollOdysseyInputs = function pollOdysseyInputs(state) {
    const moveVec = window.getOdysseyMoveVec();
    const aimVec = getAimVec(state);
    const gp = resolveActiveGamepad();
    updateGamepadBanner();

    if (!gp) {
      if (state.mode === 'play' && (pointer.down || keys['KeyJ']) && typeof window.performOdysseyRailgun === 'function') {
        if (Math.hypot(aimVec.x, aimVec.y) > 0.05) {
          state.player.aimAngle = Math.atan2(aimVec.y, aimVec.x);
        }
        window.performOdysseyRailgun(state);
      }
      return { moveVec, aimVec };
    }

    const now = performance.now();
    const ax = gp.axes[0] || 0;
    const ay = gp.axes[1] || 0;

    const axisLeftNow = ax < -0.55;
    const axisRightNow = ax > 0.55;
    const axisUpNow = ay < -0.55;
    const axisDownNow = ay > 0.55;

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
          if (typeof window.openOdysseyPause === 'function') window.openOdysseyPause();
        } else {
          // R2 (button 7) or Hold Mouse/J -> Vector Railgun Fire
          const r2Held = Boolean(gp.buttons[7] && (gp.buttons[7].pressed || gp.buttons[7].value > 0.35));
          if ((r2Held || pointer.down || keys['KeyJ']) && typeof window.performOdysseyRailgun === 'function') {
            if (Math.hypot(aimVec.x, aimVec.y) > 0.05) {
              state.player.aimAngle = Math.atan2(aimVec.y, aimVec.x);
            }
            window.performOdysseyRailgun(state);
          }

          // × (0) -> Afterburner Vector Boost
          if (justPressed(gp, 0) && typeof window.performOdysseyBoost === 'function') {
            window.performOdysseyBoost(state, moveVec);
          }
          // ○ (1) -> Barrel Roll / Cross-Product Bolt Slice
          if (justPressed(gp, 1) && typeof window.performOdysseyRoll === 'function') {
            window.performOdysseyRoll(state, moveVec);
          }
          // □ (2) -> Open Orbital Gate Equation Override
          if (justPressed(gp, 2) && typeof window.triggerNearestOdysseyGate === 'function') {
            window.triggerNearestOdysseyGate(state);
          }
          // △ (3) or L1 (4) -> Tri-Axis Cross-Product Aegis Shield
          if ((justPressed(gp, 3) || justPressed(gp, 4)) && typeof window.performOdysseyAegis === 'function') {
            window.performOdysseyAegis(state);
          }
          // R1 (5) or L2 (6) -> Scalar Hyper-Overdrive
          const l2Press = justPressed(gp, 6);
          if ((justPressed(gp, 5) || l2Press) && typeof window.performOdysseyOverdrive === 'function') {
            window.performOdysseyOverdrive(state);
          }
        }
      }
    }

    snapshotButtons(gp);
    return { moveVec, aimVec };
  };

  /**
   * Handle discrete keyboard shortcuts across gameplay and modal states.
   * @param {KeyboardEvent} e - DOM KeyboardEvent.
   */
  function handleKeyDown(e) {
    keys[e.code] = true;
    const state = stateGetter ? stateGetter() : null;
    if (!state) return;
    if (performance.now() < inputLockUntil) return;

    if (e.code === 'Escape' || e.code === 'KeyP') {
      if (state.mode === 'play' && typeof window.openOdysseyPause === 'function') {
        window.openOdysseyPause();
      } else if (state.mode === 'pause' && typeof window.closeOdysseyPause === 'function') {
        window.closeOdysseyPause();
      }
      return;
    }

    if (state.mode === 'intro') {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        if (typeof window.startOdysseyFromIntro === 'function') window.startOdysseyFromIntro();
      } else if (e.code === 'ArrowLeft') {
        if (typeof window.cycleOdysseyFilter === 'function') window.cycleOdysseyFilter(-1);
      } else if (e.code === 'ArrowRight') {
        if (typeof window.cycleOdysseyFilter === 'function') window.cycleOdysseyFilter(1);
      }
      return;
    }

    if (state.mode === 'override') {
      if (e.code === 'Digit1' || e.code === 'Numpad1') window.submitOdysseyOption?.(0);
      else if (e.code === 'Digit2' || e.code === 'Numpad2') window.submitOdysseyOption?.(1);
      else if (e.code === 'Digit3' || e.code === 'Numpad3') window.submitOdysseyOption?.(2);
      else if (e.code === 'Digit4' || e.code === 'Numpad4') window.submitOdysseyOption?.(3);
      else if (e.code === 'KeyH') window.toggleOdysseyHint?.();
      else if (e.code === 'KeyV') window.triggerOdysseyOverdriveBypass?.();
      return;
    }

    if (state.mode !== 'play') return;

    const moveVec = window.getOdysseyMoveVec();
    if (e.code === 'Space' || e.code === 'ShiftLeft') {
      e.preventDefault();
      window.performOdysseyBoost?.(state, moveVec);
    } else if (e.code === 'KeyK') {
      window.performOdysseyRoll?.(state, moveVec);
    } else if (e.code === 'KeyE') {
      window.triggerNearestOdysseyGate?.(state);
    } else if (e.code === 'KeyL' || e.code === 'KeyQ') {
      window.performOdysseyAegis?.(state);
    } else if (e.code === 'KeyR') {
      window.performOdysseyOverdrive?.(state);
    } else if (e.code === 'KeyJ') {
      window.performOdysseyRailgun?.(state);
    }
  }

  /**
   * Bind touch virtual joystick and mobile action deck buttons.
   */
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

    bindDeckBtn(cache.actBoost, (s) => window.performOdysseyBoost?.(s, window.getOdysseyMoveVec()));
    bindDeckBtn(cache.actRoll, (s) => window.performOdysseyRoll?.(s, window.getOdysseyMoveVec()));
    bindDeckBtn(cache.actOverride, (s) => window.triggerNearestOdysseyGate?.(s));
    bindDeckBtn(cache.actAegis, (s) => window.performOdysseyAegis?.(s));
    bindDeckBtn(cache.actPulse, (s) => window.performOdysseyRailgun?.(s));
    bindDeckBtn(cache.actOverdrive, (s) => window.performOdysseyOverdrive?.(s));
  }

  /**
   * Initialize all keyboard, mouse, touch, and DualSense listeners.
   * @param {Function} getStateFn - Accessor returning live game state.
   */
  window.initOdysseyControls = function initOdysseyControls(getStateFn) {
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
            window.performOdysseyRailgun?.(state);
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
