/**
 * Limit Abyss — هاوية النهايات والاتصال 2BAC PC
 * 100% DualSense / DualShock, Keyboard, Mouse & Mobile Touch Input System
 * Includes DualSense Haptic Rumble, Analog Trigger Thresholds, D-Pad Hat Fallback & Right-Stick Aim.
 */

window.AbyssInput = (function() {
  const gpCore = () => window.ArcadeCore && window.ArcadeCore.Gamepad;

  const state = {
    keys: {},
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    isMouseDown: false,

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
    updateGamepadBanner();
  }

  function findActiveGamepad() {
    return gpCore() ? gpCore().resolveActiveGamepad(state.gp) : null;
  }

  function readHatDirs(gp) {
    return gpCore() ? gpCore().decodeDpadHat(gp) : { up: false, down: false, left: false, right: false };
  }

  function triggerHaptic(duration = 80, weak = 0.4, strong = 0.65) {
    gpCore()?.triggerHaptic(state.gp, duration, weak, strong);
  }

  function updateGamepadBanner() {
    gpCore()?.updateBanner(
      state.gp,
      document.getElementById('gamepadPill'),
      document.getElementById('gamepadStatusText'),
      'لوحة المفاتيح جاهزة'
    );
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
      if (e.target?.closest?.('button, a, .hud-header, .bottom-deck, .modal-card, .touch-joystick')) {
        return;
      }
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
    state.gp.index = e.gamepad.index;
    state.gp.connected = true;
    const idLow = String(e.gamepad.id || '').toLowerCase();
    state.gp.idLabel = (idLow.includes('dualsense') || idLow.includes('054c') || idLow.includes('dualshock') || idLow.includes('playstation'))
      ? 'DualSense PS5 جاهزة'
      : (idLow.includes('xbox') ? 'Xbox Controller' : 'يد تحكم متصلة');
    updateGamepadBanner();
  }

  function onGamepadDisconnected(e) {
    if (state.gp.index === e.gamepad.index) {
      state.gp.index = null;
      state.gp.connected = false;
      state.gp.idLabel = '';
      state.gp.prevButtons.length = 0;
      updateGamepadBanner();
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
    state.gp.pauseFocusIdx = ((state.gp.pauseFocusIdx + delta) % btns.length + btns.length) % btns.length;
    gpCore()?.applyFocusRing(btns, state.gp.pauseFocusIdx);
    window.AbyssAudio?.playUiTick?.();
  }

  function activatePauseMenu() {
    const btns = Array.from(document.querySelectorAll('.pause-menu-btn'));
    if (btns[state.gp.pauseFocusIdx]) btns[state.gp.pauseFocusIdx].click();
  }

  window.applyAbyssPauseFocus = function applyAbyssPauseFocus() {
    state.gp.pauseFocusIdx = 0;
    gpCore()?.applyFocusRing(Array.from(document.querySelectorAll('.pause-menu-btn')), state.gp.pauseFocusIdx);
  };

  function navigateEndMenu(delta) {
    const btns = Array.from(document.querySelectorAll('.end-menu-btn'));
    if (!btns.length) return;
    state.gp.endFocusIdx = ((state.gp.endFocusIdx + delta) % btns.length + btns.length) % btns.length;
    gpCore()?.applyFocusRing(btns, state.gp.endFocusIdx);
    window.AbyssAudio?.playUiTick?.();
  }

  function activateEndMenu() {
    const btns = Array.from(document.querySelectorAll('.end-menu-btn'));
    if (btns[state.gp.endFocusIdx]) btns[state.gp.endFocusIdx].click();
  }

  window.applyAbyssEndFocus = function applyAbyssEndFocus() {
    state.gp.endFocusIdx = 0;
    gpCore()?.applyFocusRing(Array.from(document.querySelectorAll('.end-menu-btn')), state.gp.endFocusIdx);
  };

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
    updateGamepadBanner();
    if (gp && gp.connected) {
      const lStick = gpCore()
        ? gpCore().applyRadialDeadzone(gp.axes[0] || 0, gp.axes[1] || 0, 0.18)
        : { x: gp.axes[0] || 0, y: gp.axes[1] || 0 };
      moveX += lStick.x;
      moveY += lStick.y;

      const btnDown = idx => {
        const b = gp.buttons[idx];
        return !!(b && (b.pressed || b.value > 0.55));
      };

      const hat = readHatDirs(gp);
      if (btnDown(14) || hat.left) moveX -= 1;
      if (btnDown(15) || hat.right) moveX += 1;
      if (btnDown(12) || hat.up) moveY -= 1;
      if (btnDown(13) || hat.down) moveY += 1;

      // Right Analog Stick aiming (radial deadzone via ArcadeCore)
      if (gp.axes.length >= 4) {
        const rStick = gpCore()
          ? gpCore().applyRadialDeadzone(gp.axes[2] || 0, gp.axes[3] || 0, 0.24)
          : { x: gp.axes[2] || 0, y: gp.axes[3] || 0 };
        if (Math.hypot(rStick.x, rStick.y) > 0.08) {
          p.angle = Math.atan2(rStick.y, rStick.x);
        }
      }

      const isOverrideOpen = !document.getElementById('overrideModal')?.classList.contains('hidden');
      const isPauseOpen = !document.getElementById('pauseModal')?.classList.contains('hidden');
      const isIntroOpen = !document.getElementById('introModal')?.classList.contains('hidden');
      const isEndOpen = !document.getElementById('endModal')?.classList.contains('hidden');

      const btnJustPressed = idx => (gpCore() ? gpCore().justPressed(gp, state.gp, idx) : false);
      const { dUp: navUp, dDown: navDown } = gpCore()
        ? gpCore().sampleDirectionalNav(gp, state.gp, 0.55)
        : { dUp: false, dDown: false };

      if (isOverrideOpen) {
        if (btnJustPressed(0)) window.selectAbyssOption?.(0); // ✕
        if (btnJustPressed(1)) window.selectAbyssOption?.(1); // ◯
        if (btnJustPressed(2)) window.selectAbyssOption?.(2); // ▢
        if (btnJustPressed(3)) window.selectAbyssOption?.(3); // △
        if (btnJustPressed(5)) window.toggleAbyssHint?.();    // R1
        if (btnJustPressed(6)) window.triggerAbyssBypass?.(); // L2
        if (btnJustPressed(9)) window.toggleAbyssPause?.();   // Options
      } else if (isPauseOpen) {
        if (navUp) navigatePauseMenu(-1);
        if (navDown) navigatePauseMenu(1);
        if (btnJustPressed(0)) activatePauseMenu(); // ✕
        if (btnJustPressed(1) || btnJustPressed(9)) window.toggleAbyssPause?.(); // ◯ or Options
      } else if (isIntroOpen) {
        if (btnJustPressed(0) || btnJustPressed(9)) window.startAbyssFromIntro?.();
      } else if (isEndOpen) {
        if (navUp) navigateEndMenu(-1);
        if (navDown) navigateEndMenu(1);
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

      gpCore()?.snapshotButtons(gp, state.gp);
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
