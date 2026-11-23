/**
 * Logarithm Reactor (مفاعل اللوغاريتم والأسي) - 100% DualSense / DualShock, Keyboard, Mouse & Touch Input System
 */

const gpCore = () => window.ArcadeCore && window.ArcadeCore.Gamepad;

window.ReactorInput = {
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

function lockReactorInput(ms = 220) {
  window.ReactorInput.inputLockUntil = performance.now() + ms;
}
window.lockReactorInputBriefly = lockReactorInput;

function applyReactorFocusList(selector, key) {
  const items = Array.from(document.querySelectorAll(selector));
  if (!items.length) return;
  const len = items.length;
  window.ReactorInput[key] = ((window.ReactorInput[key] % len) + len) % len;
  gpCore()?.applyFocusRing(items, window.ReactorInput[key]);
}
window.applyReactorPauseFocus = () => applyReactorFocusList('.pause-menu-btn', 'pauseFocusIdx');
window.applyReactorEndFocus = () => applyReactorFocusList('.end-menu-btn', 'endFocusIdx');

function findActiveReactorGamepad() {
  return gpCore() ? gpCore().resolveActiveGamepad(window.ReactorInput.gp) : null;
}

function readReactorHatDirs(gp) {
  return gpCore() ? gpCore().decodeDpadHat(gp) : { up: false, down: false, left: false, right: false };
}

function radialStickReactor(axX, axY, dz = 0.16) {
  return gpCore() ? gpCore().applyRadialDeadzone(axX, axY, dz) : { x: axX, y: axY };
}

window.triggerReactorHaptic = function(duration = 75, weak = 0.45, strong = 0.65) {
  gpCore()?.triggerHaptic(window.ReactorInput.gp, duration, weak, strong);
};

function updateReactorGamepadBanner() {
  gpCore()?.updateBanner(
    window.ReactorInput.gp,
    document.getElementById('gamepadPill'),
    document.getElementById('gamepadStatusText'),
    'لوحة المفاتيح جاهزة'
  );
}

window.initReactorControls = function(getState) {
  window.addEventListener('keydown', (e) => {
    const state = getState();
    if (!state) return;
    const repeat = !!window.ReactorInput.keys[e.code];
    window.ReactorInput.keys[e.code] = true;

    if (performance.now() < window.ReactorInput.inputLockUntil) return;

    if (state.mode === 'intro') {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        window.cycleReactorFilter(1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        window.cycleReactorFilter(-1);
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        window.startReactorFromIntro();
      }
      return;
    }

    if (state.mode === 'override') {
      if (e.code === 'Digit1') { e.preventDefault(); window.submitReactorOption(0); }
      else if (e.code === 'Digit2') { e.preventDefault(); window.submitReactorOption(1); }
      else if (e.code === 'Digit3') { e.preventDefault(); window.submitReactorOption(2); }
      else if (e.code === 'Digit4') { e.preventDefault(); window.submitReactorOption(3); }
      else if (e.code === 'KeyH') { e.preventDefault(); window.toggleReactorHint(); }
      else if (e.code === 'KeyF') { e.preventDefault(); window.triggerReactorOverdriveBypass(); }
      else if (e.code === 'Escape') { e.preventDefault(); window.openReactorPause(); }
      return;
    }

    if (state.mode === 'pause') {
      const items = Array.from(document.querySelectorAll('.pause-menu-btn'));
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        window.closeReactorPause();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        window.ReactorInput.pauseFocusIdx--;
        window.applyReactorPauseFocus();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        window.ReactorInput.pauseFocusIdx++;
        window.applyReactorPauseFocus();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        items[window.ReactorInput.pauseFocusIdx]?.click();
      }
      return;
    }

    if (state.mode === 'end') {
      const items = Array.from(document.querySelectorAll('.end-menu-btn'));
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        window.ReactorInput.endFocusIdx--;
        window.applyReactorEndFocus();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        window.ReactorInput.endFocusIdx++;
        window.applyReactorEndFocus();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        items[window.ReactorInput.endFocusIdx]?.click();
      }
      return;
    }

    // Play Mode
    const k = window.ReactorInput.keys;
    const holdingDown = !!(k.KeyS || k.ArrowDown);

    if (e.code === 'Escape' || e.code === 'KeyP') {
      e.preventDefault();
      window.openReactorPause();
    } else if ((e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') && !repeat) {
      e.preventDefault();
      window.performReactorJump(state, holdingDown);
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') {
      e.preventDefault();
      window.performReactorDash(state, window.getReactorMoveVec().x);
    } else if (e.code === 'KeyE' || e.code === 'KeyL') {
      e.preventDefault();
      window.triggerNearestReactorGate(state);
    } else if (e.code === 'KeyQ' || e.code === 'KeyI') {
      e.preventDefault();
      window.performReactorAegis(state);
    } else if (e.code === 'KeyJ') {
      e.preventDefault();
      window.performReactorPulse(state);
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      window.performReactorOverdrive(state);
    } else if (e.code === 'KeyC' || e.code === 'Tab') {
      e.preventDefault();
      window.cycleReactorFilter(1);
    }
  });

  window.addEventListener('keyup', (e) => {
    window.ReactorInput.keys[e.code] = false;
  });

  window.addEventListener('blur', () => {
    window.ReactorInput.keys = {};
    window.ReactorInput.mouseLeftDown = false;
  });

  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      window.ReactorInput.mouseX = e.clientX;
      window.ReactorInput.mouseY = e.clientY;
      window.ReactorInput.mouseAimActive = true;
    });
    canvas.addEventListener('mousedown', (e) => {
      const state = getState();
      if (!state || state.mode !== 'play') return;
      window.ReactorAudio?.init?.();
      window.ReactorInput.mouseAimActive = true;
      window.ReactorInput.mouseX = e.clientX;
      window.ReactorInput.mouseY = e.clientY;
      if (e.button === 0) {
        window.ReactorInput.mouseLeftDown = true;
        window.performReactorPulse(state);
      } else if (e.button === 2) {
        window.performReactorOverdrive(state);
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) window.ReactorInput.mouseLeftDown = false;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Mobile floating touch joystick
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
      window.ReactorInput.touchVecX = dx / maxR;
      window.ReactorInput.touchVecY = dy / maxR;
    };
    joy.addEventListener('touchstart', (e) => {
      e.preventDefault();
      window.ReactorAudio?.init?.();
      const t = e.changedTouches[0];
      if (!t) return;
      window.ReactorInput.touchId = t.identifier;
      upd(t.clientX, t.clientY);
    }, { passive: false });
    joy.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === window.ReactorInput.touchId) upd(t.clientX, t.clientY);
      }
    }, { passive: false });
    const rst = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === window.ReactorInput.touchId) {
          window.ReactorInput.touchId = null;
          window.ReactorInput.touchVecX = 0;
          window.ReactorInput.touchVecY = 0;
          knob.style.transform = 'translate(0px, 0px)';
        }
      }
    };
    joy.addEventListener('touchend', rst);
    joy.addEventListener('touchcancel', rst);
  }
};

window.getReactorMoveVec = function() {
  const k = window.ReactorInput.keys;
  let x = 0;
  let y = 0;
  if (k.KeyA || k.ArrowLeft) x -= 1;
  if (k.KeyD || k.ArrowRight) x += 1;
  if (k.KeyW || k.ArrowUp) y -= 1;
  if (k.KeyS || k.ArrowDown) y += 1;
  return { x, y };
};

window.pollReactorInputs = function(state) {
  const gp = findActiveReactorGamepad();
  const gpState = window.ReactorInput.gp;
  updateReactorGamepadBanner();

  let moveVec = window.getReactorMoveVec();
  if (Math.hypot(window.ReactorInput.touchVecX, window.ReactorInput.touchVecY) > 0.14) {
    moveVec = { x: window.ReactorInput.touchVecX, y: window.ReactorInput.touchVecY };
  }

  const touchUp = window.ReactorInput.touchVecY < -0.62;
  if (state.mode === 'play' && touchUp && !window.ReactorInput.prevTouchJump) {
    window.performReactorJump(state, false);
  }
  window.ReactorInput.prevTouchJump = touchUp;

  let holdingDown = !!(window.ReactorInput.keys.KeyS || window.ReactorInput.keys.ArrowDown || window.ReactorInput.touchVecY > 0.65);

  let aimVec = null;
  if (window.ReactorInput.mouseAimActive) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = window.ReactorInput.mouseX - cx;
    const dy = window.ReactorInput.mouseY - cy;
    if (Math.hypot(dx, dy) > 8) aimVec = { x: dx, y: dy };
  }

  const now = performance.now();
  const locked = now < window.ReactorInput.inputLockUntil;

  if (state.mode === 'play' && !locked) {
    if (window.ReactorInput.mouseLeftDown || window.ReactorInput.keys.KeyJ) {
      window.performReactorPulse(state);
    }
  }

  if (!gp) {
    return { moveVec, aimVec, holdingDown };
  }

  const ls = radialStickReactor(gp.axes[0] || 0, gp.axes[1] || 0, 0.16);
  if (Math.hypot(ls.x, ls.y) > 0.06) {
    moveVec = ls;
    if (ls.y > 0.62) holdingDown = true;
  }

  if (gp.axes.length >= 4) {
    const rs = radialStickReactor(gp.axes[2] || 0, gp.axes[3] || 0, 0.18);
    if (Math.hypot(rs.x, rs.y) > 0.06) {
      aimVec = rs;
      window.ReactorInput.mouseAimActive = false;
    }
  }

  const btnDown = (i) => {
    const b = gp.buttons[i];
    return !!(b && (b.pressed || b.value > 0.55));
  };
  const edge = (i) => !locked && (gpCore() ? gpCore().justPressed(gp, gpState, i, 0.55) : false);

  const hat = readReactorHatDirs(gp);
  const dDownHold = btnDown(13) || hat.down;
  const dLeftHold = btnDown(14) || hat.left;
  const dRightHold = btnDown(15) || hat.right;
  if (dDownHold || ls.y > 0.58) holdingDown = true;

  const edgeDpadUp = !locked && (edge(12) || (hat.up && !window.ReactorInput.prevPlayHatUp));
  window.ReactorInput.prevPlayHatUp = hat.up;

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
      window.cycleReactorFilter(-1);
    } else if (!locked && (dRight || eR1)) {
      window.cycleReactorFilter(1);
    } else if (eCross || eOptions) {
      window.startReactorFromIntro();
    }
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null, holdingDown: false };
  }

  if (state.mode === 'override') {
    if (eCross) window.submitReactorOption(0);
    else if (eCircle) window.submitReactorOption(1);
    else if (eSquare) window.submitReactorOption(2);
    else if (eTri) window.submitReactorOption(3);
    else if (eR1) window.toggleReactorHint();
    else if (eL2) window.triggerReactorOverdriveBypass();
    else if (eOptions) window.openReactorPause();
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null, holdingDown: false };
  }

  if (state.mode === 'pause') {
    const items = Array.from(document.querySelectorAll('.pause-menu-btn'));
    if (eCircle || eOptions) {
      window.closeReactorPause();
    } else if (!locked && dUp) {
      window.ReactorInput.pauseFocusIdx--;
      window.applyReactorPauseFocus();
      window.ReactorAudio?.playUiTick?.();
    } else if (!locked && dDown) {
      window.ReactorInput.pauseFocusIdx++;
      window.applyReactorPauseFocus();
      window.ReactorAudio?.playUiTick?.();
    } else if (eCross) {
      items[window.ReactorInput.pauseFocusIdx]?.click();
    } else if (eL1 || eR1) {
      window.cycleReactorFilter(eR1 ? 1 : -1);
    }
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null, holdingDown: false };
  }

  if (state.mode === 'end') {
    const items = Array.from(document.querySelectorAll('.end-menu-btn'));
    if (!locked && (dUp || dDown)) {
      window.ReactorInput.endFocusIdx += dUp ? -1 : 1;
      window.applyReactorEndFocus();
      window.ReactorAudio?.playUiTick?.();
    } else if (eCross) {
      items[window.ReactorInput.endFocusIdx]?.click();
    } else if (eCircle) {
      document.getElementById('btnHubEnd')?.click();
    }
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null, holdingDown: false };
  }

  // Play mode DualSense mapping
  if (Math.abs(moveVec.x) < 0.1) {
    if (dLeftHold) moveVec.x = -1;
    else if (dRightHold) moveVec.x = 1;
  }

  if (eOptions) {
    window.openReactorPause();
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec, aimVec, holdingDown };
  }
  if (eCross || edgeDpadUp) window.performReactorJump(state, holdingDown);
  if (eCircle) window.performReactorDash(state, moveVec.x);
  if (eSquare) window.triggerNearestReactorGate(state);
  if (eTri) window.performReactorAegis(state);
  if (eL2) window.performReactorOverdrive(state);
  if (eR1) window.cycleReactorFilter(1);
  if (eR2 || (!locked && btnDown(7))) {
    window.performReactorPulse(state);
  }

  gpCore()?.snapshotButtons(gp, gpState);
  return { moveVec, aimVec, holdingDown };
};
