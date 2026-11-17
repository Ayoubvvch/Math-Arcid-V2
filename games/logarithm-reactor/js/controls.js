/**
 * Logarithm Reactor (مفاعل اللوغاريتم والأسي) - 100% DualSense / DualShock, Keyboard, Mouse & Touch Input System
 */

window.ReactorInput = {
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

function lockReactorInput(ms = 220) {
  window.ReactorInput.inputLockUntil = performance.now() + ms;
}
window.lockReactorInputBriefly = lockReactorInput;

function applyReactorFocusList(selector, key) {
  const items = Array.from(document.querySelectorAll(selector));
  if (!items.length) return;
  const len = items.length;
  window.ReactorInput[key] = ((window.ReactorInput[key] % len) + len) % len;
  items.forEach((el, idx) => el.classList.toggle('gp-focused', idx === window.ReactorInput[key]));
}
window.applyReactorPauseFocus = () => applyReactorFocusList('.pause-menu-btn', 'pauseFocusIdx');
window.applyReactorEndFocus = () => applyReactorFocusList('.end-menu-btn', 'endFocusIdx');

function findActiveReactorGamepad() {
  if (!navigator.getGamepads) return null;
  const pads = navigator.getGamepads();
  if (window.ReactorInput.gamepadSlot >= 0) {
    const p = pads[window.ReactorInput.gamepadSlot];
    if (p && p.connected) return p;
  }
  for (let i = 0; i < pads.length; i++) {
    if (pads[i] && pads[i].connected) {
      window.ReactorInput.gamepadSlot = i;
      return pads[i];
    }
  }
  window.ReactorInput.gamepadSlot = -1;
  return null;
}

function readReactorHatDirs(gp) {
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

function radialStickReactor(axX, axY, dz = 0.16) {
  const m = Math.hypot(axX, axY);
  if (m < dz) return { x: 0, y: 0 };
  const c = Math.min(1, m);
  const s = (c - dz) / (1 - dz);
  return { x: (axX / m) * s, y: (axY / m) * s };
}

window.triggerReactorHaptic = async function(duration = 75, weak = 0.45, strong = 0.65) {
  const gp = findActiveReactorGamepad();
  if (gp && gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
    try {
      await gp.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0, duration, weakMagnitude: weak, strongMagnitude: strong
      });
    } catch (e) {}
  }
};

function updateReactorGamepadBanner(gp) {
  const pill = document.getElementById('gamepadPill');
  const txt = document.getElementById('gamepadStatusText');
  if (!pill || !txt) return;
  if (gp) {
    if (!window.ReactorInput.gamepadConnected) {
      window.ReactorInput.gamepadConnected = true;
      pill.classList.remove('disconnected');
      const id = String(gp.id || '').toLowerCase();
      txt.textContent = (id.includes('dualsense') || id.includes('054c') || id.includes('dualshock') || id.includes('playstation'))
        ? 'PS5 DualSense متصل 100%'
        : 'يد التحكم متصلة 100%';
    }
  } else if (window.ReactorInput.gamepadConnected) {
    window.ReactorInput.gamepadConnected = false;
    pill.classList.add('disconnected');
    txt.textContent = 'لوحة المفاتيح جاهزة';
  }
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
  updateReactorGamepadBanner(gp);

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
  const edge = (i) => {
    const cur = btnDown(i);
    const prev = !!window.ReactorInput.prevButtons[i];
    window.ReactorInput.prevButtons[i] = cur;
    return !locked && cur && !prev;
  };

  const hat = readReactorHatDirs(gp);
  const dUpRaw = btnDown(12) || hat.up || (ls.y < -0.58);
  const dDownRaw = btnDown(13) || hat.down || (ls.y > 0.58);
  const dLeftRaw = btnDown(14) || hat.left || (ls.x < -0.58);
  const dRightRaw = btnDown(15) || hat.right || (ls.x > 0.58);
  if (dDownRaw) holdingDown = true;

  const edgeUp = !locked && ((btnDown(12) && !window.ReactorInput.prevButtons[12]) || (hat.up && !window.ReactorInput.prevHat.up));
  const edgeDown = !locked && ((btnDown(13) && !window.ReactorInput.prevButtons[13]) || (hat.down && !window.ReactorInput.prevHat.down));
  const edgeLeft = !locked && ((btnDown(14) && !window.ReactorInput.prevButtons[14]) || (hat.left && !window.ReactorInput.prevHat.left));
  const edgeRight = !locked && ((btnDown(15) && !window.ReactorInput.prevButtons[15]) || (hat.right && !window.ReactorInput.prevHat.right));
  window.ReactorInput.prevHat = hat;

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

  const canRepeat = !locked && now >= window.ReactorInput.navCooldownAt;

  if (state.mode === 'intro') {
    if (edgeLeft || eL1 || (dLeftRaw && canRepeat)) {
      window.cycleReactorFilter(-1);
      window.ReactorInput.navCooldownAt = now + 200;
    } else if (edgeRight || eR1 || (dRightRaw && canRepeat)) {
      window.cycleReactorFilter(1);
      window.ReactorInput.navCooldownAt = now + 200;
    } else if (eCross || eOptions) {
      window.startReactorFromIntro();
    }
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
    return { moveVec: { x: 0, y: 0 }, aimVec: null, holdingDown: false };
  }

  if (state.mode === 'pause') {
    const items = Array.from(document.querySelectorAll('.pause-menu-btn'));
    if (eCircle || eOptions) {
      window.closeReactorPause();
    } else if (edgeUp || (dUpRaw && canRepeat)) {
      window.ReactorInput.pauseFocusIdx--;
      window.applyReactorPauseFocus();
      window.ReactorAudio?.playUiTick?.();
      window.ReactorInput.navCooldownAt = now + 185;
    } else if (edgeDown || (dDownRaw && canRepeat)) {
      window.ReactorInput.pauseFocusIdx++;
      window.applyReactorPauseFocus();
      window.ReactorAudio?.playUiTick?.();
      window.ReactorInput.navCooldownAt = now + 185;
    } else if (eCross) {
      items[window.ReactorInput.pauseFocusIdx]?.click();
    } else if (eL1 || eR1) {
      window.cycleReactorFilter(eR1 ? 1 : -1);
    }
    return { moveVec: { x: 0, y: 0 }, aimVec: null, holdingDown: false };
  }

  if (state.mode === 'end') {
    const items = Array.from(document.querySelectorAll('.end-menu-btn'));
    if (edgeUp || edgeDown || ((dUpRaw || dDownRaw) && canRepeat)) {
      window.ReactorInput.endFocusIdx++;
      window.applyReactorEndFocus();
      window.ReactorAudio?.playUiTick?.();
      window.ReactorInput.navCooldownAt = now + 200;
    } else if (eCross) {
      items[window.ReactorInput.endFocusIdx]?.click();
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
    window.openReactorPause();
    return { moveVec, aimVec, holdingDown };
  }
  if (eCross) window.performReactorJump(state, holdingDown);
  if (eCircle) window.performReactorDash(state, moveVec.x);
  if (eSquare) window.triggerNearestReactorGate(state);
  if (eTri) window.performReactorAegis(state);
  if (eL2) window.performReactorOverdrive(state);
  if (eR1) window.cycleReactorFilter(1);
  if (eR2 || (!locked && btnDown(7))) {
    window.performReactorPulse(state);
  }

  return { moveVec, aimVec, holdingDown };
};
