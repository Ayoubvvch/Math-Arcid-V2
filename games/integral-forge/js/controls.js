/**
 * Integral Forge (محرقة التكامل والمعادلات) - 100% DualSense / DualShock, Keyboard, Mouse & Touch Input System
 */

window.ForgeInput = {
  keys: {},
  mouseX: window.innerWidth / 2,
  mouseY: window.innerHeight / 2,
  mouseLeftDown: false,
  mouseAimActive: false,

  gamepadSlot: -1,
  gamepadConnected: false,
  prevButtons: {},
  prevHat: { up: false, down: false, left: false, right: false },
  prevTouchJump: false,
  navCooldownAt: 0,
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
  items.forEach((el, idx) => el.classList.toggle('gp-focused', idx === window.ForgeInput[key]));
}
window.applyForgePauseFocus = () => applyForgeFocusList('.pause-menu-btn', 'pauseFocusIdx');
window.applyForgeEndFocus = () => applyForgeFocusList('.end-menu-btn', 'endFocusIdx');

function findActiveForgeGamepad() {
  if (!navigator.getGamepads) return null;
  const pads = navigator.getGamepads();
  if (window.ForgeInput.gamepadSlot >= 0) {
    const p = pads[window.ForgeInput.gamepadSlot];
    if (p && p.connected) return p;
  }
  for (let i = 0; i < pads.length; i++) {
    if (pads[i] && pads[i].connected) {
      window.ForgeInput.gamepadSlot = i;
      return pads[i];
    }
  }
  window.ForgeInput.gamepadSlot = -1;
  return null;
}

function readForgeHatDirs(gp) {
  const dirs = { up: false, down: false, left: false, right: false };
  if (gp.axes && gp.axes.length > 9) {
    const h = gp.axes[9];
    if (typeof h === 'number' && Math.abs(h) <= 1.05 && h < 1.1) {
      if (h < -0.75) { dirs.up = true; }
      else if (h < -0.35) { dirs.up = true; dirs.right = true; }
      else if (h < -0.05) { dirs.right = true; }
      else if (h < 0.25) { dirs.right = true; dirs.down = true; }
      else if (h < 0.52) { dirs.down = true; }
      else if (h < 0.78) { dirs.down = true; dirs.left = true; }
      else if (h <= 0.92) { dirs.left = true; }
      else { dirs.left = true; dirs.up = true; }
    }
  }
  return dirs;
}

function radialStickForge(axX, axY, dz = 0.16) {
  const m = Math.hypot(axX, axY);
  if (m < dz) return { x: 0, y: 0 };
  const c = Math.min(1, m);
  const s = (c - dz) / (1 - dz);
  return { x: (axX / m) * s, y: (axY / m) * s };
}

window.triggerForgeHaptic = async function(duration = 75, weak = 0.45, strong = 0.65) {
  const gp = findActiveForgeGamepad();
  if (gp && gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
    try {
      await gp.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0, duration, weakMagnitude: weak, strongMagnitude: strong
      });
    } catch (e) {}
  }
};

let cachedForgeGpPill = null;
let cachedForgeGpStatusText = null;

function updateForgeGamepadBanner(gp) {
  if (!cachedForgeGpPill) cachedForgeGpPill = document.getElementById('gamepadPill');
  if (!cachedForgeGpStatusText) cachedForgeGpStatusText = document.getElementById('gamepadStatusText');
  const pill = cachedForgeGpPill;
  const txt = cachedForgeGpStatusText;
  if (!pill || !txt) return;
  if (gp) {
    if (!window.ForgeInput.gamepadConnected) {
      window.ForgeInput.gamepadConnected = true;
      pill.classList.remove('disconnected');
      const id = String(gp.id || '').toLowerCase();
      txt.textContent = (id.includes('dualsense') || id.includes('054c') || id.includes('dualshock') || id.includes('playstation'))
        ? 'PS5 DualSense متصل 100%'
        : 'يد التحكم متصلة 100%';
    }
  } else if (window.ForgeInput.gamepadConnected) {
    window.ForgeInput.gamepadConnected = false;
    pill.classList.add('disconnected');
    txt.textContent = 'لوحة المفاتيح جاهزة';
  }
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
  updateForgeGamepadBanner(gp);

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
  const edge = (i) => {
    const cur = btnDown(i);
    const prev = !!window.ForgeInput.prevButtons[i];
    window.ForgeInput.prevButtons[i] = cur;
    return !locked && cur && !prev;
  };

  const hat = readForgeHatDirs(gp);
  const dUpRaw = btnDown(12) || hat.up || (ls.y < -0.58);
  const dDownRaw = btnDown(13) || hat.down || (ls.y > 0.58);
  const dLeftRaw = btnDown(14) || hat.left || (ls.x < -0.58);
  const dRightRaw = btnDown(15) || hat.right || (ls.x > 0.58);
  if (dDownRaw) holdingDown = true;

  const edgeUp = !locked && ((btnDown(12) && !window.ForgeInput.prevButtons[12]) || (hat.up && !window.ForgeInput.prevHat.up));
  const edgeDown = !locked && ((btnDown(13) && !window.ForgeInput.prevButtons[13]) || (hat.down && !window.ForgeInput.prevHat.down));
  const edgeLeft = !locked && ((btnDown(14) && !window.ForgeInput.prevButtons[14]) || (hat.left && !window.ForgeInput.prevHat.left));
  const edgeRight = !locked && ((btnDown(15) && !window.ForgeInput.prevButtons[15]) || (hat.right && !window.ForgeInput.prevHat.right));
  window.ForgeInput.prevHat = hat;

  const eCross = edge(0);
  const eCircle = edge(1);
  const eSquare = edge(2);
  const eTri = edge(3);
  const eL1 = edge(4);
  const eR1 = edge(5);
  const eL2 = edge(6);
  const eR2 = edge(7);
  const eOptions = edge(9);
  edge(12); edge(13); edge(14); edge(15);

  const canRepeat = !locked && now >= window.ForgeInput.navCooldownAt;

  if (state.mode === 'intro') {
    if (edgeLeft || eL1 || (dLeftRaw && canRepeat)) {
      window.cycleForgeFilter(-1);
      window.ForgeInput.navCooldownAt = now + 200;
    } else if (edgeRight || eR1 || (dRightRaw && canRepeat)) {
      window.cycleForgeFilter(1);
      window.ForgeInput.navCooldownAt = now + 200;
    } else if (eCross || eOptions) {
      window.startForgeFromIntro();
    }
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
    return { moveVec: { x: 0, y: 0 }, aimVec: null, holdingDown: false };
  }

  if (state.mode === 'pause') {
    const items = Array.from(document.querySelectorAll('.pause-menu-btn'));
    if (eCircle || eOptions) {
      window.closeForgePause();
    } else if (edgeUp || (dUpRaw && canRepeat)) {
      window.ForgeInput.pauseFocusIdx--;
      window.applyForgePauseFocus();
      window.ForgeAudio?.playUiTick?.();
      window.ForgeInput.navCooldownAt = now + 185;
    } else if (edgeDown || (dDownRaw && canRepeat)) {
      window.ForgeInput.pauseFocusIdx++;
      window.applyForgePauseFocus();
      window.ForgeAudio?.playUiTick?.();
      window.ForgeInput.navCooldownAt = now + 185;
    } else if (eCross) {
      items[window.ForgeInput.pauseFocusIdx]?.click();
    } else if (eL1 || eR1) {
      window.cycleForgeFilter(eR1 ? 1 : -1);
    }
    return { moveVec: { x: 0, y: 0 }, aimVec: null, holdingDown: false };
  }

  if (state.mode === 'end') {
    const items = Array.from(document.querySelectorAll('.end-menu-btn'));
    if (edgeUp || edgeDown || ((dUpRaw || dDownRaw) && canRepeat)) {
      window.ForgeInput.endFocusIdx++;
      window.applyForgeEndFocus();
      window.ForgeAudio?.playUiTick?.();
      window.ForgeInput.navCooldownAt = now + 200;
    } else if (eCross) {
      items[window.ForgeInput.endFocusIdx]?.click();
    } else if (eCircle) {
      document.getElementById('btnHubEnd')?.click();
    }
    return { moveVec: { x: 0, y: 0 }, aimVec: null, holdingDown: false };
  }

  // Play mode DualSense mapping
  if (Math.abs(moveVec.x) < 0.1) {
    if (dLeftRaw) moveVec.x = -1;
    else if (dRightRaw) moveVec.x = 1;
  }

  if (eOptions) {
    window.openForgePause();
    return { moveVec, aimVec, holdingDown };
  }
  if (eCross) window.performForgeJump(state, holdingDown);
  if (eCircle) window.performForgeSlice(state, moveVec.x);
  if (eSquare) window.triggerNearestForgeGate(state);
  if (eTri) window.performForgeAegis(state);
  if (eL2) window.performForgeOverdrive(state);
  if (eR1) window.cycleForgeFilter(1);
  if (eR2 || (!locked && btnDown(7))) {
    window.performForgeCannon(state);
  }

  return { moveVec, aimVec, holdingDown };
};
