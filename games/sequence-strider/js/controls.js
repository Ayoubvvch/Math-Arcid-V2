/**
 * Sequence Strider - 100% DualSense / DualShock, Keyboard, Mouse & Touch Input System
 */

const gpCore = () => window.ArcadeCore && window.ArcadeCore.Gamepad;

window.StriderInput = {
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
  prevPlayHatUp: false,
  prevTouchJump: false,
  inputLockUntil: 0,

  pauseFocusIdx: 0,
  endFocusIdx: 0,

  touchId: null,
  touchVecX: 0,
  touchVecY: 0
};

function lockStriderInput(ms = 220) {
  window.StriderInput.inputLockUntil = performance.now() + ms;
}
window.lockStriderInputBriefly = lockStriderInput;

function applyFocusList(selector, key) {
  const items = Array.from(document.querySelectorAll(selector));
  if (!items.length) return;
  const len = items.length;
  window.StriderInput[key] = ((window.StriderInput[key] % len) + len) % len;
  gpCore()?.applyFocusRing(items, window.StriderInput[key]);
}
window.applyStriderPauseFocus = () => applyFocusList('.pause-menu-btn', 'pauseFocusIdx');
window.applyStriderEndFocus = () => applyFocusList('.end-menu-btn', 'endFocusIdx');

function findActiveGamepad() {
  return gpCore() ? gpCore().resolveActiveGamepad(window.StriderInput.gp) : null;
}

function readHatDirs(gp) {
  return gpCore() ? gpCore().decodeDpadHat(gp) : { up: false, down: false, left: false, right: false };
}

function radialStick(axX, axY, dz = 0.16) {
  return gpCore() ? gpCore().applyRadialDeadzone(axX, axY, dz) : { x: axX, y: axY };
}

window.triggerStriderHaptic = function(duration = 70, weak = 0.45, strong = 0.65) {
  gpCore()?.triggerHaptic(window.StriderInput.gp, duration, weak, strong);
};

function updateGamepadBanner() {
  gpCore()?.updateBanner(
    window.StriderInput.gp,
    document.getElementById('gamepadPill'),
    document.getElementById('gamepadStatusText'),
    'لوحة المفاتيح جاهزة'
  );
}

window.initStriderControls = function(getState) {
  window.addEventListener('keydown', (e) => {
    const state = getState();
    if (!state) return;
    const repeat = !!window.StriderInput.keys[e.code];
    window.StriderInput.keys[e.code] = true;

    if (performance.now() < window.StriderInput.inputLockUntil) return;

    if (state.mode === 'intro') {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        window.cycleSeqFilter(1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        window.cycleSeqFilter(-1);
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        window.startStriderFromIntro();
      }
      return;
    }

    if (state.mode === 'override') {
      if (e.code === 'Digit1') { e.preventDefault(); window.submitSeqOption(0); }
      else if (e.code === 'Digit2') { e.preventDefault(); window.submitSeqOption(1); }
      else if (e.code === 'Digit3') { e.preventDefault(); window.submitSeqOption(2); }
      else if (e.code === 'Digit4') { e.preventDefault(); window.submitSeqOption(3); }
      else if (e.code === 'KeyH') { e.preventDefault(); window.toggleSeqHint(); }
      else if (e.code === 'KeyF') { e.preventDefault(); window.triggerSeqOverdriveBypass(); }
      else if (e.code === 'Escape') { e.preventDefault(); window.openStriderPause(); }
      return;
    }

    if (state.mode === 'pause') {
      const items = Array.from(document.querySelectorAll('.pause-menu-btn'));
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        window.closeStriderPause();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        window.StriderInput.pauseFocusIdx--;
        window.applyStriderPauseFocus();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        window.StriderInput.pauseFocusIdx++;
        window.applyStriderPauseFocus();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        items[window.StriderInput.pauseFocusIdx]?.click();
      }
      return;
    }

    if (state.mode === 'end') {
      const items = Array.from(document.querySelectorAll('.end-menu-btn'));
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        window.StriderInput.endFocusIdx--;
        window.applyStriderEndFocus();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        window.StriderInput.endFocusIdx++;
        window.applyStriderEndFocus();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        items[window.StriderInput.endFocusIdx]?.click();
      }
      return;
    }

    // Play mode
    if (e.code === 'Escape' || e.code === 'KeyP') {
      e.preventDefault();
      window.openStriderPause();
    } else if ((e.code === 'KeyW' || e.code === 'ArrowUp') && !repeat) {
      e.preventDefault();
      window.performJump(state);
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') {
      e.preventDefault();
      window.performStriderDash(state, window.getStriderMoveVec().x);
    } else if (e.code === 'KeyE' || e.code === 'KeyL') {
      e.preventDefault();
      window.triggerNearestSeqGate(state);
    } else if (e.code === 'KeyQ' || e.code === 'KeyI') {
      e.preventDefault();
      window.performAegisShield(state);
    } else if (e.code === 'KeyJ' || e.code === 'Space') {
      e.preventDefault();
      window.performPulseShot(state);
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      window.performOverdriveWorld(state);
    } else if (e.code === 'KeyC' || e.code === 'Tab') {
      e.preventDefault();
      window.cycleSeqFilter(1);
    }
  });

  window.addEventListener('keyup', (e) => {
    window.StriderInput.keys[e.code] = false;
  });

  window.addEventListener('blur', () => {
    window.StriderInput.keys = {};
    window.StriderInput.mouseLeftDown = false;
  });

  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      window.StriderInput.mouseX = e.clientX;
      window.StriderInput.mouseY = e.clientY;
      window.StriderInput.mouseAimActive = true;
    });
    canvas.addEventListener('mousedown', (e) => {
      const state = getState();
      if (!state || state.mode !== 'play') return;
      window.SeqAudio?.init?.();
      window.StriderInput.mouseAimActive = true;
      window.StriderInput.mouseX = e.clientX;
      window.StriderInput.mouseY = e.clientY;
      if (e.button === 0) {
        window.StriderInput.mouseLeftDown = true;
        window.performPulseShot(state);
      } else if (e.button === 2) {
        window.performOverdriveWorld(state);
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) window.StriderInput.mouseLeftDown = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Mobile floating joystick
  const joy = document.getElementById('touchJoystick');
  const knob = document.getElementById('touchStickKnob');
  if (joy && knob) {
    const upd = (tx, ty) => {
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
      window.StriderInput.touchVecX = dx / maxR;
      window.StriderInput.touchVecY = dy / maxR;
    };
    joy.addEventListener('touchstart', (e) => {
      e.preventDefault();
      window.SeqAudio?.init?.();
      const t = e.changedTouches[0];
      if (!t) return;
      window.StriderInput.touchId = t.identifier;
      upd(t.clientX, t.clientY);
    }, { passive: false });
    joy.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === window.StriderInput.touchId) upd(t.clientX, t.clientY);
      }
    }, { passive: false });
    const rst = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === window.StriderInput.touchId) {
          window.StriderInput.touchId = null;
          window.StriderInput.touchVecX = 0;
          window.StriderInput.touchVecY = 0;
          knob.style.transform = 'translate(0px, 0px)';
        }
      }
    };
    joy.addEventListener('touchend', rst);
    joy.addEventListener('touchcancel', rst);
  }
};

window.getStriderMoveVec = function() {
  const k = window.StriderInput.keys;
  let x = 0;
  let y = 0;
  if (k.KeyA || k.ArrowLeft) x -= 1;
  if (k.KeyD || k.ArrowRight) x += 1;
  if (k.KeyW || k.ArrowUp) y -= 1;
  if (k.KeyS || k.ArrowDown) y += 1;
  return { x, y };
};

window.pollStriderInputs = function(state) {
  const gp = findActiveGamepad();
  updateGamepadBanner();

  let moveVec = window.getStriderMoveVec();
  if (Math.hypot(window.StriderInput.touchVecX, window.StriderInput.touchVecY) > 0.14) {
    moveVec = { x: window.StriderInput.touchVecX, y: window.StriderInput.touchVecY };
  }

  // Upward swipe on touch stick jumps cleanly once per flick
  const touchUp = window.StriderInput.touchVecY < -0.62;
  if (state.mode === 'play' && touchUp && !window.StriderInput.prevTouchJump) {
    window.performJump(state);
  }
  window.StriderInput.prevTouchJump = touchUp;

  let aimVec = null;
  if (window.StriderInput.mouseAimActive) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = window.StriderInput.mouseX - cx;
    const dy = window.StriderInput.mouseY - cy;
    if (Math.hypot(dx, dy) > 8) aimVec = { x: dx, y: dy };
  }

  const now = performance.now();
  const locked = now < window.StriderInput.inputLockUntil;

  if (state.mode === 'play' && !locked) {
    if (window.StriderInput.mouseLeftDown || window.StriderInput.keys.Space || window.StriderInput.keys.KeyJ) {
      window.performPulseShot(state);
    }
  }

  if (!gp) {
    return { moveVec, aimVec };
  }

  const gpState = window.StriderInput.gp;
  const ls = radialStick(gp.axes[0] || 0, gp.axes[1] || 0, 0.16);
  if (Math.hypot(ls.x, ls.y) > 0.06) moveVec = ls;

  if (gp.axes.length >= 4) {
    const rs = radialStick(gp.axes[2] || 0, gp.axes[3] || 0, 0.18);
    if (Math.hypot(rs.x, rs.y) > 0.06) {
      aimVec = rs;
      window.StriderInput.mouseAimActive = false;
    }
  }

  const btnDown = (i) => {
    const b = gp.buttons[i];
    return !!(b && (b.pressed || b.value > 0.55));
  };
  const edge = (i) => !locked && (gpCore() ? gpCore().justPressed(gp, gpState, i) : false);

  const hat = readHatDirs(gp);
  const dLeftHold = btnDown(14) || hat.left;
  const dRightHold = btnDown(15) || hat.right;
  const edgeDpadUp = !locked && (edge(12) || (hat.up && !window.StriderInput.prevPlayHatUp));
  window.StriderInput.prevPlayHatUp = hat.up;

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
      window.cycleSeqFilter(-1);
    } else if (!locked && (dRight || eR1)) {
      window.cycleSeqFilter(1);
    } else if (eCross) {
      window.startStriderFromIntro();
    }
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null };
  }

  if (state.mode === 'override') {
    if (eCross) window.submitSeqOption(0);
    else if (eCircle) window.submitSeqOption(1);
    else if (eSquare) window.submitSeqOption(2);
    else if (eTri) window.submitSeqOption(3);
    else if (eR1) window.toggleSeqHint();
    else if (eL2) window.triggerSeqOverdriveBypass();
    else if (eOptions) window.openStriderPause();
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null };
  }

  if (state.mode === 'pause') {
    const items = Array.from(document.querySelectorAll('.pause-menu-btn'));
    if (eCircle || eOptions) {
      window.closeStriderPause();
    } else if (!locked && dUp) {
      window.StriderInput.pauseFocusIdx--;
      window.applyStriderPauseFocus();
      window.SeqAudio?.playUiTick?.();
    } else if (!locked && dDown) {
      window.StriderInput.pauseFocusIdx++;
      window.applyStriderPauseFocus();
      window.SeqAudio?.playUiTick?.();
    } else if (eCross) {
      items[window.StriderInput.pauseFocusIdx]?.click();
    } else if (eL1 || eR1) {
      window.cycleSeqFilter(eR1 ? 1 : -1);
    }
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null };
  }

  if (state.mode === 'end') {
    const items = Array.from(document.querySelectorAll('.end-menu-btn'));
    if (!locked && (dUp || dDown)) {
      window.StriderInput.endFocusIdx += dUp ? -1 : 1;
      window.applyStriderEndFocus();
      window.SeqAudio?.playUiTick?.();
    } else if (eCross) {
      items[window.StriderInput.endFocusIdx]?.click();
    } else if (eCircle) {
      document.getElementById('btnHubEnd')?.click();
    }
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null };
  }

  // Play mode DualSense mapping (also allows D-Pad left/right walking!)
  if (Math.abs(moveVec.x) < 0.1) {
    if (dLeftHold) moveVec.x = -1;
    else if (dRightHold) moveVec.x = 1;
  }

  if (eOptions) {
    window.openStriderPause();
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec, aimVec };
  }
  if (eCross || edgeDpadUp) window.performJump(state);
  if (eCircle) window.performStriderDash(state, moveVec.x);
  if (eSquare) window.triggerNearestSeqGate(state);
  if (eTri) window.performAegisShield(state);
  if (eL2) window.performOverdriveWorld(state);
  if (eR1) window.cycleSeqFilter(1);
  if (eR2 || (!locked && btnDown(7))) {
    window.performPulseShot(state);
  }

  gpCore()?.snapshotButtons(gp, gpState);
  return { moveVec, aimVec };
};
