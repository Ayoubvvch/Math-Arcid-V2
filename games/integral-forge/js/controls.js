/**
 * Integral Forge (محرقة التكامل والمعادلات) - 100% DualSense / DualShock, Keyboard, Mouse & Touch Input System
 */

const gpCore = () => window.ArcadeCore && window.ArcadeCore.Gamepad;

window.ForgeInput = {
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

function lockForgeInput(ms = 220) {
  window.ForgeInput.inputLockUntil = performance.now() + ms;
}
window.lockForgeInputBriefly = lockForgeInput;

function applyForgeFocusList(selector, key) {
  const items = Array.from(document.querySelectorAll(selector));
  if (!items.length) return;
  const len = items.length;
  window.ForgeInput[key] = ((window.ForgeInput[key] % len) + len) % len;
  gpCore()?.applyFocusRing(items, window.ForgeInput[key]);
}
window.applyForgePauseFocus = () => applyForgeFocusList('.pause-menu-btn', 'pauseFocusIdx');
window.applyForgeEndFocus = () => applyForgeFocusList('.end-menu-btn', 'endFocusIdx');

function findActiveForgeGamepad() {
  return gpCore() ? gpCore().resolveActiveGamepad(window.ForgeInput.gp) : null;
}

function readForgeHatDirs(gp) {
  return gpCore() ? gpCore().decodeDpadHat(gp) : { up: false, down: false, left: false, right: false };
}

function radialStickForge(axX, axY, dz = 0.16) {
  return gpCore() ? gpCore().applyRadialDeadzone(axX, axY, dz) : { x: axX, y: axY };
}

window.triggerForgeHaptic = function(duration = 75, weak = 0.45, strong = 0.65) {
  gpCore()?.triggerHaptic(window.ForgeInput.gp, duration, weak, strong);
};

function updateForgeGamepadBanner() {
  gpCore()?.updateBanner(
    window.ForgeInput.gp,
    document.getElementById('gamepadPill'),
    document.getElementById('gamepadStatusText'),
    'لوحة المفاتيح جاهزة'
  );
}

window.initForgeControls = function(getState) {
  window.addEventListener('keydown', (e) => {
    const state = getState();
    if (!state) return;
    const repeat = !!window.ForgeInput.keys[e.code];
    window.ForgeInput.keys[e.code] = true;

    if (performance.now() < window.ForgeInput.inputLockUntil) return;

    if (state.mode === 'intro') {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        window.cycleForgeFilter(1);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        window.cycleForgeFilter(-1);
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        window.startForgeFromIntro();
      }
      return;
    }

    if (state.mode === 'override') {
      if (e.code === 'Digit1') { e.preventDefault(); window.submitForgeOption(0); }
      else if (e.code === 'Digit2') { e.preventDefault(); window.submitForgeOption(1); }
      else if (e.code === 'Digit3') { e.preventDefault(); window.submitForgeOption(2); }
      else if (e.code === 'Digit4') { e.preventDefault(); window.submitForgeOption(3); }
      else if (e.code === 'KeyH') { e.preventDefault(); window.toggleForgeHint(); }
      else if (e.code === 'KeyF') { e.preventDefault(); window.triggerForgeOverdriveBypass(); }
      else if (e.code === 'Escape') { e.preventDefault(); window.openForgePause(); }
      return;
    }

    if (state.mode === 'pause') {
      const items = Array.from(document.querySelectorAll('.pause-menu-btn'));
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        window.closeForgePause();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        window.ForgeInput.pauseFocusIdx--;
        window.applyForgePauseFocus();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        window.ForgeInput.pauseFocusIdx++;
        window.applyForgePauseFocus();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        items[window.ForgeInput.pauseFocusIdx]?.click();
      }
      return;
    }

    if (state.mode === 'end') {
      const items = Array.from(document.querySelectorAll('.end-menu-btn'));
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        window.ForgeInput.endFocusIdx--;
        window.applyForgeEndFocus();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        window.ForgeInput.endFocusIdx++;
        window.applyForgeEndFocus();
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        items[window.ForgeInput.endFocusIdx]?.click();
      }
      return;
    }

    // Play Mode
    const k = window.ForgeInput.keys;
    const holdingDown = !!(k.KeyS || k.ArrowDown);

    if (e.code === 'Escape' || e.code === 'KeyP') {
      e.preventDefault();
      window.openForgePause();
    } else if ((e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') && !repeat) {
      e.preventDefault();
      window.performForgeJump(state, holdingDown);
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') {
      e.preventDefault();
      window.performForgeSlice(state, window.getForgeMoveVec().x);
    } else if (e.code === 'KeyE' || e.code === 'KeyL') {
      e.preventDefault();
      window.triggerNearestForgeGate(state);
    } else if (e.code === 'KeyQ' || e.code === 'KeyI') {
      e.preventDefault();
      window.performForgeAegis(state);
    } else if (e.code === 'KeyJ') {
      e.preventDefault();
      window.performForgeCannon(state);
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      window.performForgeOverdrive(state);
    } else if (e.code === 'KeyC' || e.code === 'Tab') {
      e.preventDefault();
      window.cycleForgeFilter(1);
    }
  });

  window.addEventListener('keyup', (e) => {
    window.ForgeInput.keys[e.code] = false;
  });

  window.addEventListener('blur', () => {
    window.ForgeInput.keys = {};
    window.ForgeInput.mouseLeftDown = false;
  });

  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      window.ForgeInput.mouseX = e.clientX;
      window.ForgeInput.mouseY = e.clientY;
      window.ForgeInput.mouseAimActive = true;
    });
    canvas.addEventListener('mousedown', (e) => {
      const state = getState();
      if (!state || state.mode !== 'play') return;
      window.ForgeAudio?.init?.();
      window.ForgeInput.mouseAimActive = true;
      window.ForgeInput.mouseX = e.clientX;
      window.ForgeInput.mouseY = e.clientY;
      if (e.button === 0) {
        window.ForgeInput.mouseLeftDown = true;
        window.performForgeCannon(state);
      } else if (e.button === 2) {
        window.performForgeOverdrive(state);
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) window.ForgeInput.mouseLeftDown = false;
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
      window.ForgeInput.touchVecX = dx / maxR;
      window.ForgeInput.touchVecY = dy / maxR;
    };
    joy.addEventListener('touchstart', (e) => {
      e.preventDefault();
      window.ForgeAudio?.init?.();
      const t = e.changedTouches[0];
      if (!t) return;
      window.ForgeInput.touchId = t.identifier;
      upd(t.clientX, t.clientY);
    }, { passive: false });
    joy.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === window.ForgeInput.touchId) upd(t.clientX, t.clientY);
      }
    }, { passive: false });
    const rst = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === window.ForgeInput.touchId) {
          window.ForgeInput.touchId = null;
          window.ForgeInput.touchVecX = 0;
          window.ForgeInput.touchVecY = 0;
          knob.style.transform = 'translate(0px, 0px)';
        }
      }
    };
    joy.addEventListener('touchend', rst);
    joy.addEventListener('touchcancel', rst);
  }
};

window.getForgeMoveVec = function() {
  const k = window.ForgeInput.keys;
  let x = 0;
  let y = 0;
  if (k.KeyA || k.ArrowLeft) x -= 1;
  if (k.KeyD || k.ArrowRight) x += 1;
  if (k.KeyW || k.ArrowUp) y -= 1;
  if (k.KeyS || k.ArrowDown) y += 1;
  return { x, y };
};

window.pollForgeInputs = function(state) {
  const gp = findActiveForgeGamepad();
  const gpState = window.ForgeInput.gp;
  updateForgeGamepadBanner();

  let moveVec = window.getForgeMoveVec();
  if (Math.hypot(window.ForgeInput.touchVecX, window.ForgeInput.touchVecY) > 0.14) {
    moveVec = { x: window.ForgeInput.touchVecX, y: window.ForgeInput.touchVecY };
  }

  const touchUp = window.ForgeInput.touchVecY < -0.62;
  if (state.mode === 'play' && touchUp && !window.ForgeInput.prevTouchJump) {
    window.performForgeJump(state, false);
  }
  window.ForgeInput.prevTouchJump = touchUp;

  let holdingDown = !!(window.ForgeInput.keys.KeyS || window.ForgeInput.keys.ArrowDown || window.ForgeInput.touchVecY > 0.65);

  let aimVec = null;
  if (window.ForgeInput.mouseAimActive) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = window.ForgeInput.mouseX - cx;
    const dy = window.ForgeInput.mouseY - cy;
    if (Math.hypot(dx, dy) > 8) aimVec = { x: dx, y: dy };
  }

  const now = performance.now();
  const locked = now < window.ForgeInput.inputLockUntil;

  if (state.mode === 'play' && !locked) {
    if (window.ForgeInput.mouseLeftDown || window.ForgeInput.keys.KeyJ) {
      window.performForgeCannon(state);
    }
  }

  if (!gp) {
    return { moveVec, aimVec, holdingDown };
  }

  const ls = radialStickForge(gp.axes[0] || 0, gp.axes[1] || 0, 0.16);
  if (Math.hypot(ls.x, ls.y) > 0.06) {
    moveVec = ls;
    if (ls.y > 0.62) holdingDown = true;
  }

  if (gp.axes.length >= 4) {
    const rs = radialStickForge(gp.axes[2] || 0, gp.axes[3] || 0, 0.18);
    if (Math.hypot(rs.x, rs.y) > 0.06) {
      aimVec = rs;
      window.ForgeInput.mouseAimActive = false;
    }
  }

  const btnDown = (i) => {
    const b = gp.buttons[i];
    return !!(b && (b.pressed || b.value > 0.55));
  };
  const edge = (i) => !locked && (gpCore() ? gpCore().justPressed(gp, gpState, i, 0.55) : false);

  const hat = readForgeHatDirs(gp);
  const dDownHold = btnDown(13) || hat.down;
  const dLeftHold = btnDown(14) || hat.left;
  const dRightHold = btnDown(15) || hat.right;
  if (dDownHold || ls.y > 0.58) holdingDown = true;

  const edgeDpadUp = !locked && (edge(12) || (hat.up && !window.ForgeInput.prevPlayHatUp));
  window.ForgeInput.prevPlayHatUp = hat.up;

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
      window.cycleForgeFilter(-1);
    } else if (!locked && (dRight || eR1)) {
      window.cycleForgeFilter(1);
    } else if (eCross || eOptions) {
      window.startForgeFromIntro();
    }
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null, holdingDown: false };
  }

  if (state.mode === 'override') {
    if (eCross) window.submitForgeOption(0);
    else if (eCircle) window.submitForgeOption(1);
    else if (eSquare) window.submitForgeOption(2);
    else if (eTri) window.submitForgeOption(3);
    else if (eR1) window.toggleForgeHint();
    else if (eL2) window.triggerForgeOverdriveBypass();
    else if (eOptions) window.openForgePause();
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null, holdingDown: false };
  }

  if (state.mode === 'pause') {
    const items = Array.from(document.querySelectorAll('.pause-menu-btn'));
    if (eCircle || eOptions) {
      window.closeForgePause();
    } else if (!locked && dUp) {
      window.ForgeInput.pauseFocusIdx--;
      window.applyForgePauseFocus();
      window.ForgeAudio?.playUiTick?.();
    } else if (!locked && dDown) {
      window.ForgeInput.pauseFocusIdx++;
      window.applyForgePauseFocus();
      window.ForgeAudio?.playUiTick?.();
    } else if (eCross) {
      items[window.ForgeInput.pauseFocusIdx]?.click();
    } else if (eL1 || eR1) {
      window.cycleForgeFilter(eR1 ? 1 : -1);
    }
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec: { x: 0, y: 0 }, aimVec: null, holdingDown: false };
  }

  if (state.mode === 'end') {
    const items = Array.from(document.querySelectorAll('.end-menu-btn'));
    if (!locked && (dUp || dDown)) {
      window.ForgeInput.endFocusIdx += dUp ? -1 : 1;
      window.applyForgeEndFocus();
      window.ForgeAudio?.playUiTick?.();
    } else if (eCross) {
      items[window.ForgeInput.endFocusIdx]?.click();
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
    window.openForgePause();
    gpCore()?.snapshotButtons(gp, gpState);
    return { moveVec, aimVec, holdingDown };
  }
  if (eCross || edgeDpadUp) window.performForgeJump(state, holdingDown);
  if (eCircle) window.performForgeSlice(state, moveVec.x);
  if (eSquare) window.triggerNearestForgeGate(state);
  if (eTri) window.performForgeAegis(state);
  if (eL2) window.performForgeOverdrive(state);
  if (eR1) window.cycleForgeFilter(1);
  if (eR2 || (!locked && btnDown(7))) {
    window.performForgeCannon(state);
  }

  gpCore()?.snapshotButtons(gp, gpState);
  return { moveVec, aimVec, holdingDown };
};
