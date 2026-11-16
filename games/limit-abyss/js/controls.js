/**
 * Limit Abyss — هاوية النهايات والاتصال 2BAC PC
 * 100% DualSense / DualShock, Keyboard, Mouse & Mobile Touch Input System
 * Includes DualSense Haptic Rumble, Analog Trigger Thresholds, D-Pad Hat Fallback & Right-Stick Aim.
 */

window.AbyssInput = (function() {
  const state = {
    keys: {},
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    isMouseDown: false,

    gamepadSlot: -1,
    gamepadConnected: false,
    prevButtons: {},
    prevHat: { up: false, down: false, left: false, right: false },
    navCooldownUntil: 0,

    pauseFocusIdx: 0,
    endFocusIdx: 0,

    touchActive: false,
    touchStartX: 0,
    touchStartY: 0,
    touchVecX: 0,
    touchVecY: 0
  };

  function initControls() {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', () => {
      state.keys = {};
      state.isMouseDown = false;
    });

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    window.addEventListener('gamepadconnected', onGamepadConnected);
    window.addEventListener('gamepaddisconnected', onGamepadDisconnected);

    setupTouchControls();
    hookDeckButtons();
  }

  function findActiveGamepad() {
    if (!navigator.getGamepads) return null;
    const pads = navigator.getGamepads();
    if (state.gamepadSlot >= 0 && pads[state.gamepadSlot]?.connected) {
      return pads[state.gamepadSlot];
    }
    for (let i = 0; i < pads.length; i++) {
      if (pads[i] && pads[i].connected) {
        state.gamepadSlot = i;
        if (!state.gamepadConnected) updateGamepadUI(true, pads[i].id);
        return pads[i];
      }
    }
    state.gamepadSlot = -1;
    return null;
  }

  function readHatDirs(gp) {
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

  async function triggerHaptic(duration = 80, weak = 0.4, strong = 0.65) {
    const gp = findActiveGamepad();
    if (gp && gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
      try {
        await gp.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration,
          weakMagnitude: weak,
          strongMagnitude: strong
        });
      } catch (e) {}
    }
  }

  function onKeyDown(e) {
    state.keys[e.key] = true;
    state.keys[e.code] = true;

    const isOverrideOpen = !document.getElementById('overrideModal')?.classList.contains('hidden');
    const isPauseOpen = !document.getElementById('pauseModal')?.classList.contains('hidden');
    const isIntroOpen = !document.getElementById('introModal')?.classList.contains('hidden');
    const isEndOpen = !document.getElementById('endModal')?.classList.contains('hidden');

    if (e.key === 'Escape' || e.code === 'KeyP') {
      e.preventDefault();
      if (!isIntroOpen && !isEndOpen) {
        window.toggleAbyssPause?.();
      }
      return;
    }

    if (isIntroOpen) {
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        window.startAbyssFromIntro?.();
      }
      return;
    }

    if (isOverrideOpen) {
      if (e.code === 'Digit1' || e.key === '1') window.selectAbyssOption?.(0);
      else if (e.code === 'Digit2' || e.key === '2') window.selectAbyssOption?.(1);
      else if (e.code === 'Digit3' || e.key === '3') window.selectAbyssOption?.(2);
      else if (e.code === 'Digit4' || e.key === '4') window.selectAbyssOption?.(3);
      else if (e.code === 'KeyH') window.toggleAbyssHint?.();
      else if (e.code === 'KeyF') window.triggerAbyssBypass?.();
      return;
    }

    if (isPauseOpen) {
      if (e.key === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); navigatePauseMenu(-1); }
      else if (e.key === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); navigatePauseMenu(1); }
      else if (e.key === 'Enter' || e.code === 'Space') { e.preventDefault(); activatePauseMenu(); }
      return;
    }

    if (isEndOpen) {
      if (e.key === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); navigateEndMenu(-1); }
      else if (e.key === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); navigateEndMenu(1); }
      else if (e.key === 'Enter' || e.code === 'Space') { e.preventDefault(); activateEndMenu(); }
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      window.AbyssWorld?.actJump?.();
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      window.AbyssWorld?.actDash?.();
    } else if (e.code === 'KeyE') {
      window.triggerInteractOrOverride?.();
    } else if (e.code === 'KeyQ') {
      window.AbyssWorld?.actAegis?.();
    } else if (e.code === 'KeyJ') {
      window.AbyssWorld?.actPulse?.();
    } else if (e.code === 'KeyF') {
      window.AbyssWorld?.actOverdrive?.();
    }
  }

  function onKeyUp(e) {
    state.keys[e.key] = false;
    state.keys[e.code] = false;
  }

  function onMouseMove(e) {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
  }

  function onMouseDown(e) {
    if (e.button === 0) {
      state.isMouseDown = true;
      const isModalOpen = !document.getElementById('overrideModal')?.classList.contains('hidden') ||
                          !document.getElementById('pauseModal')?.classList.contains('hidden') ||
                          !document.getElementById('introModal')?.classList.contains('hidden') ||
                          !document.getElementById('endModal')?.classList.contains('hidden');
      if (!isModalOpen) {
        window.AbyssAudio?.init?.();
        window.AbyssWorld?.actPulse?.();
      }
    }
  }

  function onMouseUp(e) {
    if (e.button === 0) state.isMouseDown = false;
  }

  function onGamepadConnected(e) {
    state.gamepadSlot = e.gamepad.index;
    state.gamepadConnected = true;
    updateGamepadUI(true, e.gamepad.id);
  }

  function onGamepadDisconnected(e) {
    if (state.gamepadSlot === e.gamepad.index) {
      state.gamepadSlot = -1;
      state.gamepadConnected = false;
      updateGamepadUI(false);
    }
  }

  function updateGamepadUI(connected, name = '') {
    const pill = document.getElementById('gamepadPill');
    const label = document.getElementById('gamepadStatusText');
    if (!pill || !label) return;
    if (connected) {
      pill.classList.remove('disconnected');
      pill.classList.add('connected');
      const idLow = String(name).toLowerCase();
      const shortName = (idLow.includes('dualsense') || idLow.includes('054c') || idLow.includes('playstation'))
        ? 'DualSense PS5 جاهزة'
        : (idLow.includes('xbox') ? 'Xbox Controller' : 'يد تحكم متصلة');
      label.textContent = shortName;
    } else {
      pill.classList.remove('connected');
      pill.classList.add('disconnected');
      label.textContent = 'لوحة المفاتيح جاهزة';
    }
  }

  function setupTouchControls() {
    const joy = document.getElementById('touchJoystick');
    const knob = document.getElementById('touchStickKnob');
    if (!joy || !knob) return;

    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      joy.style.display = 'block';
    }

    let touchId = null;

    joy.addEventListener('touchstart', e => {
      e.preventDefault();
      window.AbyssAudio?.init?.();
      const t = e.changedTouches[0];
      touchId = t.identifier;
      const rect = joy.getBoundingClientRect();
      state.touchStartX = rect.left + rect.width / 2;
      state.touchStartY = rect.top + rect.height / 2;
      handleTouchMove(t.clientX, t.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', e => {
      if (touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          handleTouchMove(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
          break;
        }
      }
    }, { passive: false });

    const endTouch = e => {
      if (touchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchId = null;
          state.touchVecX = 0;
          state.touchVecY = 0;
          knob.style.transform = 'translate(0px, 0px)';
          break;
        }
      }
    };

    window.addEventListener('touchend', endTouch);
    window.addEventListener('touchcancel', endTouch);

    function handleTouchMove(cx, cy) {
      const dx = cx - state.touchStartX;
      const dy = cy - state.touchStartY;
      const dist = Math.hypot(dx, dy);
      const maxR = 40;
      const ang = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxR);
      const kx = Math.cos(ang) * clampedDist;
      const ky = Math.sin(ang) * clampedDist;
      knob.style.transform = `translate(${kx}px, ${ky}px)`;
      state.touchVecX = kx / maxR;
      state.touchVecY = ky / maxR;
    }
  }

  function hookDeckButtons() {
    document.getElementById('actJump')?.addEventListener('click', () => window.AbyssWorld?.actJump?.());
    document.getElementById('actDash')?.addEventListener('click', () => window.AbyssWorld?.actDash?.());
    document.getElementById('actOverride')?.addEventListener('click', () => window.triggerInteractOrOverride?.());
    document.getElementById('actAegis')?.addEventListener('click', () => window.AbyssWorld?.actAegis?.());
    document.getElementById('actPulse')?.addEventListener('click', () => window.AbyssWorld?.actPulse?.());
    document.getElementById('actOverdrive')?.addEventListener('click', () => window.AbyssWorld?.actOverdrive?.());
  }

  function navigatePauseMenu(delta) {
    const btns = Array.from(document.querySelectorAll('.pause-menu-btn'));
    if (!btns.length) return;
    state.pauseFocusIdx = ((state.pauseFocusIdx + delta) % btns.length + btns.length) % btns.length;
    btns.forEach((b, i) => b.classList.toggle('gp-focused', i === state.pauseFocusIdx));
    window.AbyssAudio?.playUiTick?.();
  }

  function activatePauseMenu() {
    const btns = Array.from(document.querySelectorAll('.pause-menu-btn'));
    if (btns[state.pauseFocusIdx]) btns[state.pauseFocusIdx].click();
  }

  function navigateEndMenu(delta) {
    const btns = Array.from(document.querySelectorAll('.end-menu-btn'));
    if (!btns.length) return;
    state.endFocusIdx = ((state.endFocusIdx + delta) % btns.length + btns.length) % btns.length;
    btns.forEach((b, i) => b.classList.toggle('gp-focused', i === state.endFocusIdx));
    window.AbyssAudio?.playUiTick?.();
  }

  function activateEndMenu() {
    const btns = Array.from(document.querySelectorAll('.end-menu-btn'));
    if (btns[state.endFocusIdx]) btns[state.endFocusIdx].click();
  }

  // 60FPS POLL INPUT (Runs in both gameplay & modals so DualSense controls all menus cleanly)
  function pollInput() {
    const p = window.AbyssWorld?.getState?.()?.player;
    if (!p) return;

    let moveX = 0;
    let moveY = 0;

    if (state.keys['ArrowLeft'] || state.keys['KeyA']) moveX -= 1;
    if (state.keys['ArrowRight'] || state.keys['KeyD']) moveX += 1;
    if (state.keys['ArrowUp'] || state.keys['KeyW']) moveY -= 1;
    if (state.keys['ArrowDown'] || state.keys['KeyS']) moveY += 1;

    if (Math.hypot(state.touchVecX, state.touchVecY) > 0.15) {
      moveX += state.touchVecX;
      moveY += state.touchVecY;
    }

    const gp = findActiveGamepad();
    if (gp && gp.connected) {
      const deadzone = 0.18;
      const ax0 = gp.axes[0] || 0;
      const ax1 = gp.axes[1] || 0;
      if (Math.abs(ax0) > deadzone) moveX += ax0;
      if (Math.abs(ax1) > deadzone) moveY += ax1;

      const btnDown = idx => {
        const b = gp.buttons[idx];
        return !!(b && (b.pressed || b.value > 0.55));
      };

      const hat = readHatDirs(gp);
      const dUp = btnDown(12) || hat.up;
      const dDown = btnDown(13) || hat.down;
      const dLeft = btnDown(14) || hat.left;
      const dRight = btnDown(15) || hat.right;

      if (dLeft) moveX -= 1;
      if (dRight) moveX += 1;
      if (dUp) moveY -= 1;
      if (dDown) moveY += 1;

      // Right Analog Stick aiming (overrides sub orientation cleanly while pushed)
      if (gp.axes.length >= 4) {
        const ax2 = gp.axes[2] || 0;
        const ax3 = gp.axes[3] || 0;
        if (Math.hypot(ax2, ax3) > 0.28) {
          p.angle = Math.atan2(ax3, ax2);
        }
      }

      const isOverrideOpen = !document.getElementById('overrideModal')?.classList.contains('hidden');
      const isPauseOpen = !document.getElementById('pauseModal')?.classList.contains('hidden');
      const isIntroOpen = !document.getElementById('introModal')?.classList.contains('hidden');
      const isEndOpen = !document.getElementById('endModal')?.classList.contains('hidden');

      const now = performance.now();
      const btnJustPressed = idx => btnDown(idx) && !state.prevButtons[idx];

      if (isOverrideOpen) {
        if (btnJustPressed(0)) window.selectAbyssOption?.(0); // ✕
        if (btnJustPressed(1)) window.selectAbyssOption?.(1); // ◯
        if (btnJustPressed(2)) window.selectAbyssOption?.(2); // ▢
        if (btnJustPressed(3)) window.selectAbyssOption?.(3); // △
        if (btnJustPressed(5)) window.toggleAbyssHint?.();    // R1
        if (btnJustPressed(6)) window.triggerAbyssBypass?.(); // L2
        if (btnJustPressed(9)) window.toggleAbyssPause?.();   // Options
      } else if (isPauseOpen) {
        if (now > state.navCooldownUntil) {
          if (dUp || ax1 < -0.45) { navigatePauseMenu(-1); state.navCooldownUntil = now + 180; }
          if (dDown || ax1 > 0.45) { navigatePauseMenu(1); state.navCooldownUntil = now + 180; }
        }
        if (btnJustPressed(0)) activatePauseMenu(); // ✕
        if (btnJustPressed(1) || btnJustPressed(9)) window.toggleAbyssPause?.(); // ◯ or Options
      } else if (isIntroOpen) {
        if (btnJustPressed(0) || btnJustPressed(9)) window.startAbyssFromIntro?.();
      } else if (isEndOpen) {
        if (now > state.navCooldownUntil) {
          if (dUp || ax1 < -0.45) { navigateEndMenu(-1); state.navCooldownUntil = now + 180; }
          if (dDown || ax1 > 0.45) { navigateEndMenu(1); state.navCooldownUntil = now + 180; }
        }
        if (btnJustPressed(0)) activateEndMenu();
        if (btnJustPressed(1)) document.getElementById('btnHubEnd')?.click();
      } else {
        if (btnJustPressed(0)) window.AbyssWorld?.actJump?.();       // ✕
        if (btnJustPressed(1)) window.AbyssWorld?.actDash?.();       // ◯
        if (btnJustPressed(2)) window.triggerInteractOrOverride?.(); // ▢
        if (btnJustPressed(3)) window.AbyssWorld?.actAegis?.();      // △
        if (btnJustPressed(7) || btnDown(7)) window.AbyssWorld?.actPulse?.(); // R2 rapid/press
        if (btnJustPressed(6)) window.AbyssWorld?.actOverdrive?.();  // L2
        if (btnJustPressed(9)) window.toggleAbyssPause?.();          // Options
      }

      for (let i = 0; i < gp.buttons.length; i++) {
        state.prevButtons[i] = btnDown(i);
      }
      state.prevHat = hat;
    }

    if (state.isMouseDown) {
      const isModalOpen = !document.getElementById('overrideModal')?.classList.contains('hidden') ||
                          !document.getElementById('pauseModal')?.classList.contains('hidden') ||
                          !document.getElementById('introModal')?.classList.contains('hidden') ||
                          !document.getElementById('endModal')?.classList.contains('hidden');
      if (!isModalOpen) window.AbyssWorld?.actPulse?.();
    }

    const len = Math.hypot(moveX, moveY);
    if (len > 0.05) {
      const spd = p.speed;
      const norm = Math.min(1, len);
      p.targetVx = (moveX / len) * spd * norm;
      p.targetVy = (moveY / len) * spd * norm;
    } else {
      p.targetVx = 0;
      p.targetVy = 0;
    }
  }

  return {
    initControls,
    pollInput,
    triggerHaptic
  };
})();
