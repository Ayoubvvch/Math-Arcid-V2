/**
 * Asymptote Asylum - 100% DualSense / DualShock, Keyboard, Mouse & Touch Input System
 * Guarantees zero dropped button presses, rescaled radial stick curves, hat-switch D-Pad support,
 * and clean modal-transition isolation.
 */

const gpCore = () => window.ArcadeCore && window.ArcadeCore.Gamepad;

window.AsylumInput = {
  keys: {},
  mouseX: window.innerWidth / 2,
  mouseY: window.innerHeight / 2,
  mouseLeftDown: false,
  mouseAimActive: false,

  gp: gpCore() ? gpCore().createState() : {
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
  },
  inputLockUntil: 0,

  introFilterIdx: 0,
  pauseFocusIdx: 0,
  endFocusIdx: 0,

  // Virtual touch joystick
  touchId: null,
  touchStartX: 0,
  touchStartY: 0,
  touchVecX: 0,
  touchVecY: 0
};

function lockInputBriefly(ms = 220) {
  window.AsylumInput.inputLockUntil = performance.now() + ms;
}

window.lockAsylumInputBriefly = lockInputBriefly;

function applyListFocus(selector, idxKey) {
  const items = Array.from(document.querySelectorAll(selector));
  if (!items.length) return;
  const len = items.length;
  window.AsylumInput[idxKey] = ((window.AsylumInput[idxKey] % len) + len) % len;
  gpCore()?.applyFocusRing(items, window.AsylumInput[idxKey]);
}

window.applyPauseMenuFocus = () => applyListFocus('.pause-menu-btn', 'pauseFocusIdx');
window.applyEndMenuFocus = () => applyListFocus('.end-menu-btn', 'endFocusIdx');

function findActiveGamepad() {
  return gpCore() ? gpCore().resolveActiveGamepad(window.AsylumInput.gp) : null;
}

function radialStick(axX, axY, deadzone = 0.16) {
  return gpCore() ? gpCore().applyRadialDeadzone(axX, axY, deadzone) : { x: axX, y: axY };
}

window.triggerGamepadHaptic = function(duration = 70, weak = 0.45, strong = 0.65) {
  gpCore()?.triggerHaptic(window.AsylumInput.gp, duration, weak, strong);
};

function updateGamepadBanner() {
  gpCore()?.updateBanner(
    window.AsylumInput.gp,
    document.getElementById('gamepadPill'),
    document.getElementById('gamepadStatusText'),
    'لوحة المفاتيح جاهزة'
  );
}

window.initAsylumControls = function(getState) {
  // Keyboard bindings
  window.addEventListener('keydown', (e) => {
    const state = getState();
    if (!state) return;
    window.AsylumInput.keys[e.code] = true;

    if (performance.now() < window.AsylumInput.inputLockUntil) return;

    if (state.mode === 'intro') {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        window.cycleTopicFilter(1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        window.cycleTopicFilter(-1);
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        window.startAsylumFromIntro();
      }
      return;
    }

    if (state.mode === 'ritual') {
      if (e.code === 'Digit1') { e.preventDefault(); window.submitRitualOption(0); }
      else if (e.code === 'Digit2') { e.preventDefault(); window.submitRitualOption(1); }
      else if (e.code === 'Digit3') { e.preventDefault(); window.submitRitualOption(2); }
      else if (e.code === 'Digit4') { e.preventDefault(); window.submitRitualOption(3); }
      else if (e.code === 'KeyH') { e.preventDefault(); window.toggleRitualHint(); }
      else if (e.code === 'KeyF') { e.preventDefault(); window.triggerForbiddenRitualBypass(); }
      else if (e.code === 'Escape') { e.preventDefault(); window.openAsylumPause(); }
      return;
    }

    if (state.mode === 'pause') {
      const items = Array.from(document.querySelectorAll('.pause-menu-btn'));
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        window.closeAsylumPause();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        window.AsylumInput.pauseFocusIdx--;
        window.applyPauseMenuFocus();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        window.AsylumInput.pauseFocusIdx++;
        window.applyPauseMenuFocus();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        items[window.AsylumInput.pauseFocusIdx]?.click();
      }
      return;
    }

    if (state.mode === 'end') {
      const items = Array.from(document.querySelectorAll('.end-menu-btn'));
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        window.AsylumInput.endFocusIdx--;
        window.applyEndMenuFocus();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        window.AsylumInput.endFocusIdx++;
        window.applyEndMenuFocus();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        items[window.AsylumInput.endFocusIdx]?.click();
      }
      return;
    }

    // Play Mode hotkeys
    if (e.code === 'Escape' || e.code === 'KeyP') {
      e.preventDefault();
      window.openAsylumPause();
    } else if (e.code === 'KeyJ' || e.code === 'Enter') {
      e.preventDefault();
      window.performSlashAttack(state);
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') {
      e.preventDefault();
      const mv = window.getKeyboardMoveVector();
      window.performBloodDash(state, mv.x, mv.y);
    } else if (e.code === 'KeyL' || e.code === 'KeyE') {
      e.preventDefault();
      window.triggerNearestInteract(state);
    } else if (e.code === 'KeyQ' || e.code === 'KeyI') {
      e.preventDefault();
      window.performFlare(state);
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      window.performForbiddenSacrificeWorld(state);
    } else if (e.code === 'KeyC' || e.code === 'Tab') {
      e.preventDefault();
      window.cycleTopicFilter(1);
    }
  });

  window.addEventListener('keyup', (e) => {
    window.AsylumInput.keys[e.code] = false;
  });

  window.addEventListener('blur', () => {
    window.AsylumInput.keys = {};
    window.AsylumInput.mouseLeftDown = false;
  });

  // Mouse aiming & canvas shooting / sacrifice
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      window.AsylumInput.mouseX = e.clientX;
      window.AsylumInput.mouseY = e.clientY;
      window.AsylumInput.mouseAimActive = true;
    });
    canvas.addEventListener('mousedown', (e) => {
      const state = getState();
      if (!state || state.mode !== 'play') return;
      window.HorrorAudio?.init?.();
      window.AsylumInput.mouseAimActive = true;
      window.AsylumInput.mouseX = e.clientX;
      window.AsylumInput.mouseY = e.clientY;
      if (e.button === 0) {
        window.AsylumInput.mouseLeftDown = true;
        window.performBloodBolt(state);
      } else if (e.button === 2) {
        window.performForbiddenSacrificeWorld(state);
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) window.AsylumInput.mouseLeftDown = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Mobile floating joystick
  const joy = document.getElementById('touchJoystick');
  const knob = document.getElementById('touchStickKnob');
  if (joy && knob) {
    const updateTouch = (tx, ty) => {
      const rect = joy.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const maxR = rect.width * 0.38;
      let dx = tx - cx;
      let dy = ty - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxR && dist > 0) {
        dx = (dx / dist) * maxR;
        dy = (dy / dist) * maxR;
      }
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      window.AsylumInput.touchVecX = dx / maxR;
      window.AsylumInput.touchVecY = dy / maxR;
    };

    joy.addEventListener('touchstart', (e) => {
      e.preventDefault();
      window.HorrorAudio?.init?.();
      const t = e.changedTouches[0];
      if (!t) return;
      window.AsylumInput.touchId = t.identifier;
      updateTouch(t.clientX, t.clientY);
    }, { passive: false });

    joy.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === window.AsylumInput.touchId) {
          updateTouch(t.clientX, t.clientY);
        }
      }
    }, { passive: false });

    const resetTouch = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === window.AsylumInput.touchId) {
          window.AsylumInput.touchId = null;
          window.AsylumInput.touchVecX = 0;
          window.AsylumInput.touchVecY = 0;
          knob.style.transform = 'translate(0px, 0px)';
        }
      }
    };
    joy.addEventListener('touchend', resetTouch);
    joy.addEventListener('touchcancel', resetTouch);
  }
};

window.getKeyboardMoveVector = function() {
  const k = window.AsylumInput.keys;
  let x = 0;
  let y = 0;
  if (k.KeyA || k.ArrowLeft) x -= 1;
  if (k.KeyD || k.ArrowRight) x += 1;
  if (k.KeyW || k.ArrowUp) y -= 1;
  if (k.KeyS || k.ArrowDown) y += 1;
  const mag = Math.hypot(x, y);
  if (mag > 1) { x /= mag; y /= mag; }
  return { x, y };
};

/**
 * Polls Gamepad + combines Keyboard/Touch move & aim vectors every animation frame.
 */
window.pollAsylumInputs = function(state) {
  const gp = findActiveGamepad();
  updateGamepadBanner();

  let moveVec = window.getKeyboardMoveVector();
  if (Math.hypot(window.AsylumInput.touchVecX, window.AsylumInput.touchVecY) > 0.12) {
    moveVec = { x: window.AsylumInput.touchVecX, y: window.AsylumInput.touchVecY };
  }

  let aimVec = null;
  if (window.AsylumInput.mouseAimActive) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = window.AsylumInput.mouseX - cx;
    const dy = window.AsylumInput.mouseY - cy;
    if (Math.hypot(dx, dy) > 8) aimVec = { x: dx, y: dy };
  }

  const now = performance.now();
  const locked = now < window.AsylumInput.inputLockUntil;

  // Continuous mouse / space bolt fire in play mode
  if (state.mode === 'play' && !locked) {
    if (window.AsylumInput.mouseLeftDown || window.AsylumInput.keys.Space) {
      window.performBloodBolt(state);
    }
  }

  if (!gp) {
    return { moveVec, aimVec };
  }

  const gpState = window.AsylumInput.gp;
  const ls = radialStick(gp.axes[0] || 0, gp.axes[1] || 0, 0.16);
  if (Math.hypot(ls.x, ls.y) > 0.05) {
    moveVec = ls;
  }

  if (gp.axes.length >= 4) {
    const rs = radialStick(gp.axes[2] || 0, gp.axes[3] || 0, 0.18);
    if (Math.hypot(rs.x, rs.y) > 0.05) {
      aimVec = rs;
      window.AsylumInput.mouseAimActive = false;
    }
  }

  const btnDown = (i) => {
    const b = gp.buttons[i];
    return !!(b && (b.pressed || b.value > 0.55));
  };
  const edge = (i) => !locked && (gpCore() ? gpCore().justPressed(gp, gpState, i) : false);
  const { dLeft, dRight, dUp, dDown } = gpCore()
    ? gpCore().sampleDirectionalNav(gp, gpState, 0.55)
    : { dLeft: false, dRight: false, dUp: false, dDown: false };

  const eCross = edge(0);
  const eCircle = edge(1);
  const eSquare = edge(2);
  const eTri = edge(3);
  const eL1 = edge(4);
  const eR1 = edge(5);
  const eL2 = edge(6);
  const eR2 = edge(7);
  const eOptions = edge(9);

  if (state.mode === 'intro') {
    if (!locked && (dLeft || eL1)) {
      window.cycleTopicFilter(-1);
    } else if (!locked && (dRight || eR1)) {
      window.cycleTopicFilter(1);
    } else if (eCross) {
      window.startAsylumFromIntro();
    }
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null };
  }

  if (state.mode === 'ritual') {
    if (eCross) window.submitRitualOption(0);
    else if (eCircle) window.submitRitualOption(1);
    else if (eSquare) window.submitRitualOption(2);
    else if (eTri) window.submitRitualOption(3);
    else if (eR1) window.toggleRitualHint();
    else if (eL2) window.triggerForbiddenRitualBypass();
    else if (eOptions) window.openAsylumPause();
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null };
  }

  if (state.mode === 'pause') {
    const items = Array.from(document.querySelectorAll('.pause-menu-btn'));
    if (eCircle || eOptions) {
      window.closeAsylumPause();
    } else if (!locked && dUp) {
      window.AsylumInput.pauseFocusIdx--;
      window.applyPauseMenuFocus();
      window.HorrorAudio?.playUiTick?.();
    } else if (!locked && dDown) {
      window.AsylumInput.pauseFocusIdx++;
      window.applyPauseMenuFocus();
      window.HorrorAudio?.playUiTick?.();
    } else if (eCross) {
      items[window.AsylumInput.pauseFocusIdx]?.click();
    } else if (eL1 || eR1) {
      window.cycleTopicFilter(eR1 ? 1 : -1);
    }
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null };
  }

  if (state.mode === 'end') {
    const items = Array.from(document.querySelectorAll('.end-menu-btn'));
    if (!locked && (dUp || dDown)) {
      window.AsylumInput.endFocusIdx += dUp ? -1 : 1;
      window.applyEndMenuFocus();
      window.HorrorAudio?.playUiTick?.();
    } else if (eCross) {
      items[window.AsylumInput.endFocusIdx]?.click();
    } else if (eCircle) {
      document.getElementById('btnHubEnd')?.click();
    }
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null };
  }

  // PLAY MODE DualSense Actions
  if (eOptions) {
    window.openAsylumPause();
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec, aimVec };
  }
  if (eCross) window.performSlashAttack(state);
  if (eCircle) window.performBloodDash(state, moveVec.x, moveVec.y);
  if (eSquare) window.triggerNearestInteract(state);
  if (eTri) window.performFlare(state);
  if (eL2) window.performForbiddenSacrificeWorld(state);
  if (eR1) window.cycleTopicFilter(1);

  // R2 supports press or hold fire!
  if (eR2 || (!locked && btnDown(7))) {
    window.performBloodBolt(state);
  }

  gpCore()?.snapshotButtons(gp, gpState);
  return { moveVec, aimVec };
};
