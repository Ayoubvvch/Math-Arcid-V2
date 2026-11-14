/**
 * Math Battle: Calculus Showdown [PlayStation Edition]
 * PlayStation DualSense / DualShock Native Controller, Touch & Keyboard Input
 */

import { PLAYSTATION_BUTTONS, toScreenX, toScreenY } from './config.js';
import { audio } from './audio.js';

export class ControlsManager {
  constructor(canvas) {
    this.canvas = canvas;

    this.moveX = 0;
    this.moveY = 0;
    this.facingAng = Math.PI / 2;
    this.isBraking = false;
    this.aimSource = 'move'; // 'stick' | 'mouse' | 'move'
    this.lastMousePos = null;
    this.mouseDownLeft = false;

    this.actions = {
      dash: false,
      beam: false,
      bomb: false,
      slowMo: false,
      cycleLeft: false,
      cycleRight: false,
      togglePilot: false,
      pauseToggle: false,
      menuConfirm: false,
      menuBack: false,
      menuAlt: false,
      dpadUp: false,
      dpadDown: false,
      dpadLeft: false,
      dpadRight: false
    };

    this.heldButtons = {
      cross: false,
      square: false,
      circle: false,
      triangle: false,
      l2: false,
      r2: false
    };

    this.gamepadConnected = false;
    this.gamepadIndex = -1;
    this.prevButtons = {};
    this.keys = {};

    this.touchJoystick = {
      active: false,
      identifier: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      dx: 0,
      dy: 0
    };

    this.initListeners();
  }

  initListeners() {
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadConnected = true;
      this.gamepadIndex = e.gamepad.index;
      this.updateGamepadBadge(true, e.gamepad.id);
      audio.init();
      audio.triggerRumble(0.2, 0.35, 160);
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      if (this.gamepadIndex === e.gamepad.index) {
        this.gamepadConnected = false;
        this.gamepadIndex = -1;
        this.updateGamepadBadge(false);
      }
    });

    window.addEventListener('keydown', (e) => {
      audio.init();
      this.keys[e.code] = true;

      if (e.code === 'Space') {
        this.actions.dash = true;
        this.actions.menuConfirm = true;
        e.preventDefault();
      } else if (e.code === 'Enter') {
        this.actions.menuConfirm = true;
      } else if (e.code === 'KeyF') {
        this.actions.beam = true;
        this.actions.menuAlt = true;
      } else if (e.code === 'KeyE') {
        this.actions.bomb = true;
      } else if (e.code === 'KeyQ') {
        this.actions.slowMo = true;
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        this.actions.pauseToggle = true;
      } else if (e.code === 'BracketLeft') {
        this.actions.cycleLeft = true;
      } else if (e.code === 'BracketRight') {
        this.actions.cycleRight = true;
      } else if (e.code === 'ArrowUp') {
        this.actions.dpadUp = true;
      } else if (e.code === 'ArrowDown') {
        this.actions.dpadDown = true;
      } else if (e.code === 'ArrowLeft') {
        this.actions.dpadLeft = true;
      } else if (e.code === 'ArrowRight') {
        this.actions.dpadRight = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    if (this.canvas) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const mouseX = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
        const mouseY = ((e.clientY - rect.top) / rect.height) * this.canvas.height;
        this.lastMousePos = { x: mouseX, y: mouseY };
        this.aimSource = 'mouse';
      });

      this.canvas.addEventListener('mousedown', (e) => {
        audio.init();
        if (e.button === 0) {
          this.mouseDownLeft = true;
          this.actions.beam = true;
        } else if (e.button === 2) {
          this.actions.dash = true;
          e.preventDefault();
        }
      });

      window.addEventListener('mouseup', (e) => {
        if (e.button === 0) this.mouseDownLeft = false;
      });

      this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    const touchStickArea = document.getElementById('touchStickArea');
    if (touchStickArea && this.canvas) {
      touchStickArea.addEventListener('touchstart', (e) => {
        audio.init();
        if (this.touchJoystick.active) return;
        const touch = e.changedTouches[0];
        this.touchJoystick.active = true;
        this.touchJoystick.identifier = touch.identifier;
        const rect = this.canvas.getBoundingClientRect();
        this.touchJoystick.startX = ((touch.clientX - rect.left) / rect.width) * this.canvas.width;
        this.touchJoystick.startY = ((touch.clientY - rect.top) / rect.height) * this.canvas.height;
        this.touchJoystick.currentX = this.touchJoystick.startX;
        this.touchJoystick.currentY = this.touchJoystick.startY;
        this.touchJoystick.dx = 0;
        this.touchJoystick.dy = 0;
      }, { passive: false });

      touchStickArea.addEventListener('touchmove', (e) => {
        if (!this.touchJoystick.active) return;
        e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === this.touchJoystick.identifier) {
            const rect = this.canvas.getBoundingClientRect();
            this.touchJoystick.currentX = ((touch.clientX - rect.left) / rect.width) * this.canvas.width;
            this.touchJoystick.currentY = ((touch.clientY - rect.top) / rect.height) * this.canvas.height;
            const maxDist = 65;
            const rx = this.touchJoystick.currentX - this.touchJoystick.startX;
            const ry = this.touchJoystick.currentY - this.touchJoystick.startY;
            const dist = Math.hypot(rx, ry);
            if (dist > 0.001) {
              const clampedDist = Math.min(dist, maxDist);
              this.touchJoystick.dx = (rx / dist) * (clampedDist / maxDist);
              this.touchJoystick.dy = (ry / dist) * (clampedDist / maxDist);
            }
            break;
          }
        }
      }, { passive: false });

      const endTouch = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          if (e.changedTouches[i].identifier === this.touchJoystick.identifier) {
            this.touchJoystick.active = false;
            this.touchJoystick.identifier = null;
            this.touchJoystick.dx = 0;
            this.touchJoystick.dy = 0;
            break;
          }
        }
      };
      touchStickArea.addEventListener('touchend', endTouch);
      touchStickArea.addEventListener('touchcancel', endTouch);
    }

    const bindTouchBtn = (id, action) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
        audio.init();
        this.actions[action] = true;
        el.classList.add('active');
        e.preventDefault();
      }, { passive: false });
      el.addEventListener('touchend', () => el.classList.remove('active'));
      el.addEventListener('touchcancel', () => el.classList.remove('active'));
    };

    bindTouchBtn('touchDashBtn', 'dash');
    bindTouchBtn('touchBeamBtn', 'beam');
    bindTouchBtn('touchBombBtn', 'bomb');
    bindTouchBtn('touchSlowBtn', 'slowMo');
  }

  _findActiveGamepad() {
    if (!navigator.getGamepads) return null;
    const gamepads = navigator.getGamepads();
    if (!gamepads) return null;

    if (this.gamepadIndex >= 0 && gamepads[this.gamepadIndex] && gamepads[this.gamepadIndex].connected) {
      return gamepads[this.gamepadIndex];
    }

    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i].connected) {
        this.gamepadIndex = i;
        return gamepads[i];
      }
    }
    return null;
  }

  updateGamepadBadge(connected, name = '') {
    const padStatus = document.getElementById('padStatus');
    const padDot = document.getElementById('padDot');
    if (!padStatus || !padDot) return;

    if (connected) {
      const lower = name.toLowerCase();
      if (lower.includes('dualsense') || lower.includes('0ce6')) {
        padStatus.textContent = 'PS5 DUALSENSE READY';
      } else if (lower.includes('dualshock') || lower.includes('playstation') || lower.includes('wireless controller')) {
        padStatus.textContent = 'PS CONTROLLER READY';
      } else if (lower.includes('xbox')) {
        padStatus.textContent = 'XBOX CONTROLLER READY';
      } else {
        padStatus.textContent = 'GAMEPAD CONNECTED';
      }
      padStatus.style.color = '#00ff88';
      padDot.style.background = '#00ff88';
      padDot.style.boxShadow = '0 0 8px #00ff88';
    } else {
      padStatus.textContent = 'CONTROLLER: CONNECT OR USE KEYS';
      padStatus.style.color = '#94a3b8';
      padDot.style.background = '#64748b';
      padDot.style.boxShadow = 'none';
    }
  }

  poll(playerMathX, playerMathY) {
    let mx = 0;
    let my = 0;
    let newAimAng = null;
    this.isBraking = false;

    const gp = this._findActiveGamepad();

    if (gp) {
      if (!this.gamepadConnected) {
        this.gamepadConnected = true;
        this.updateGamepadBadge(true, gp.id);
      }

      const deadzone = 0.16;
      const scaleAxis = (v) => {
        const a = Math.abs(v);
        if (a < deadzone) return 0;
        return (v < 0 ? -1 : 1) * Math.min(1, (a - deadzone) / (1 - deadzone));
      };

      const stickLx = scaleAxis(gp.axes[0] || 0);
      const stickLy = scaleAxis(gp.axes[1] || 0);
      if (stickLx !== 0 || stickLy !== 0) {
        mx += stickLx;
        my -= stickLy;
      }

      // Hat-switch fallback
      let hatUp = false, hatDown = false, hatLeft = false, hatRight = false;
      if (gp.axes && gp.axes.length > 9 && gp.axes[9] !== undefined) {
        const h = gp.axes[9];
        if (h >= -1.05 && h <= 1.05) {
          hatUp = h < -0.60 || h > 0.85;
          hatRight = h > -0.82 && h < -0.04;
          hatDown = h > -0.25 && h < 0.55;
          hatLeft = h > 0.30;
        }
      }

      const isPressed = (btnIndex) => Boolean(gp.buttons[btnIndex]?.pressed);
      const dUp = isPressed(PLAYSTATION_BUTTONS.DPAD_UP) || hatUp;
      const dDown = isPressed(PLAYSTATION_BUTTONS.DPAD_DOWN) || hatDown;
      const dLeft = isPressed(PLAYSTATION_BUTTONS.DPAD_LEFT) || hatLeft;
      const dRight = isPressed(PLAYSTATION_BUTTONS.DPAD_RIGHT) || hatRight;

      if (dUp) my += 1;
      if (dDown) my -= 1;
      if (dLeft) mx -= 1;
      if (dRight) mx += 1;

      // Right Analog Stick (Aiming)
      const stickRx = scaleAxis(gp.axes[2] || 0);
      const stickRy = scaleAxis(gp.axes[3] || 0);
      if (Math.hypot(stickRx, stickRy) > 0.08) {
        newAimAng = Math.atan2(-stickRy, stickRx);
        this.aimSource = 'stick';
      }

      const isJustPressed = (btnIndex, currentBool) => {
        const pressed = currentBool !== undefined ? currentBool : isPressed(btnIndex);
        return pressed && !Boolean(this.prevButtons[btnIndex]);
      };

      // Face & Trigger Actions
      if (isJustPressed(PLAYSTATION_BUTTONS.CROSS)) {
        audio.init();
        this.actions.dash = true;
        this.actions.menuConfirm = true;
      }
      if (isPressed(PLAYSTATION_BUTTONS.SQUARE) || isPressed(PLAYSTATION_BUTTONS.R2)) {
        audio.init();
        this.actions.beam = true;
      }
      if (isJustPressed(PLAYSTATION_BUTTONS.SQUARE)) {
        this.actions.menuAlt = true;
      }
      if (isJustPressed(PLAYSTATION_BUTTONS.CIRCLE)) {
        audio.init();
        this.actions.bomb = true;
        this.actions.menuBack = true;
      }
      if (isJustPressed(PLAYSTATION_BUTTONS.TRIANGLE)) {
        audio.init();
        this.actions.slowMo = true;
      }

      if (isPressed(PLAYSTATION_BUTTONS.L2)) this.isBraking = true;

      if (isJustPressed(PLAYSTATION_BUTTONS.L1)) this.actions.cycleLeft = true;
      if (isJustPressed(PLAYSTATION_BUTTONS.R1)) this.actions.cycleRight = true;
      if (isJustPressed(PLAYSTATION_BUTTONS.SELECT)) this.actions.togglePilot = true;
      if (isJustPressed(PLAYSTATION_BUTTONS.START)) this.actions.pauseToggle = true;

      if (isJustPressed(PLAYSTATION_BUTTONS.DPAD_UP, dUp)) this.actions.dpadUp = true;
      if (isJustPressed(PLAYSTATION_BUTTONS.DPAD_DOWN, dDown)) this.actions.dpadDown = true;
      if (isJustPressed(PLAYSTATION_BUTTONS.DPAD_LEFT, dLeft)) this.actions.dpadLeft = true;
      if (isJustPressed(PLAYSTATION_BUTTONS.DPAD_RIGHT, dRight)) this.actions.dpadRight = true;

      this.heldButtons.cross = isPressed(PLAYSTATION_BUTTONS.CROSS);
      this.heldButtons.square = isPressed(PLAYSTATION_BUTTONS.SQUARE);
      this.heldButtons.circle = isPressed(PLAYSTATION_BUTTONS.CIRCLE);
      this.heldButtons.triangle = isPressed(PLAYSTATION_BUTTONS.TRIANGLE);
      this.heldButtons.l2 = isPressed(PLAYSTATION_BUTTONS.L2);
      this.heldButtons.r2 = isPressed(PLAYSTATION_BUTTONS.R2);

      for (let b = 0; b < gp.buttons.length; b++) {
        this.prevButtons[b] = Boolean(gp.buttons[b]?.pressed);
      }
      this.prevButtons[PLAYSTATION_BUTTONS.DPAD_UP] = dUp;
      this.prevButtons[PLAYSTATION_BUTTONS.DPAD_DOWN] = dDown;
      this.prevButtons[PLAYSTATION_BUTTONS.DPAD_LEFT] = dLeft;
      this.prevButtons[PLAYSTATION_BUTTONS.DPAD_RIGHT] = dRight;
    } else if (this.gamepadConnected) {
      this.gamepadConnected = false;
      this.gamepadIndex = -1;
      this.updateGamepadBadge(false);
    }

    // Keyboard Movement & Hold-to-Fire
    if (this.keys['KeyW'] || this.keys['ArrowUp']) my += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) my -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) mx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) mx += 1;
    if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) this.isBraking = true;
    if (this.keys['KeyF'] || this.mouseDownLeft) this.actions.beam = true;

    // Virtual Touch Stick
    if (this.touchJoystick.active) {
      mx += this.touchJoystick.dx;
      my -= this.touchJoystick.dy;
    }

    const moveLen = Math.hypot(mx, my);
    if (moveLen > 1) {
      this.moveX = mx / moveLen;
      this.moveY = my / moveLen;
    } else {
      this.moveX = mx;
      this.moveY = my;
    }

    if (newAimAng !== null) {
      this.facingAng = newAimAng;
    } else if (this.aimSource === 'mouse' && this.lastMousePos && this.canvas) {
      const px = toScreenX(playerMathX);
      const py = toScreenY(playerMathY);
      this.facingAng = Math.atan2(-(this.lastMousePos.y - py), this.lastMousePos.x - px);
    } else if (moveLen > 0.15) {
      this.facingAng = Math.atan2(this.moveY, this.moveX);
    }
  }

  consumeAction(action) {
    const val = this.actions[action];
    this.actions[action] = false;
    return val;
  }

  clearGameplayActions() {
    this.actions.dash = false;
    this.actions.beam = false;
    this.actions.bomb = false;
    this.actions.slowMo = false;
  }
}
