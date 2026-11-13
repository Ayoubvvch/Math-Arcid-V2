/**
 * Math Battle: Calculus Showdown [PlayStation Edition]
 * PlayStation DualSense / DualShock Native Controller, Touch & Fallback Input
 */

import { PLAYSTATION_BUTTONS, toScreenX, toScreenY } from './config.js';
import { audio } from './audio.js';

export class ControlsManager {
  constructor(canvas) {
    this.canvas = canvas;

    // Movement & Aiming vectors
    this.moveX = 0;
    this.moveY = 0;
    this.facingAng = 0;
    this.isBraking = false;

    // Action Triggers (latched per frame)
    this.actions = {
      dash: false,
      beam: false,
      bomb: false,
      slowMo: false,
      cycleLeft: false,
      cycleRight: false,
      togglePilot: false,
      pauseToggle: false
    };

    // Gamepad state
    this.gamepadConnected = false;
    this.gamepadIndex = -1;
    this.prevButtons = {};

    // Keyboard state
    this.keys = {};

    // Touch Virtual Joystick
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
    // Gamepad Event Listeners
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadConnected = true;
      this.gamepadIndex = e.gamepad.index;
      this.updateGamepadBadge(true, e.gamepad.id);
      audio.triggerRumble(0.2, 0.4, 200);
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      if (this.gamepadIndex === e.gamepad.index) {
        this.gamepadConnected = false;
        this.gamepadIndex = -1;
        this.updateGamepadBadge(false);
      }
    });

    // Keyboard Listeners
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'Space') {
        this.actions.dash = true;
        e.preventDefault();
      } else if (e.code === 'KeyF') {
        this.actions.beam = true;
      } else if (e.code === 'KeyE') {
        this.actions.bomb = true;
      } else if (e.code === 'KeyQ') {
        this.actions.slowMo = true;
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        this.actions.pauseToggle = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse Aiming & Firing
    if (this.canvas) {
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
        const mouseY = ((e.clientY - rect.top) / rect.height) * this.canvas.height;
        this.lastMousePos = { x: mouseX, y: mouseY };
      });

      this.canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
          this.actions.beam = true;
        } else if (e.button === 2) {
          this.actions.dash = true;
          e.preventDefault();
        }
      });

      this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // Touch Virtual Joystick
    const touchStickArea = document.getElementById('touchStickArea');
    if (touchStickArea) {
      touchStickArea.addEventListener('touchstart', (e) => {
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

    // Touch Buttons
    const bindTouchBtn = (id, action) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => {
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
  }

  updateGamepadBadge(connected, name = '') {
    const padStatus = document.getElementById('padStatus');
    const padDot = document.getElementById('padDot');
    if (!padStatus || !padDot) return;

    if (connected) {
      padStatus.textContent = name.toLowerCase().includes('dualsense') || name.toLowerCase().includes('wireless controller')
        ? 'PS DUALSENSE READY'
        : 'PLAYSTATION CONTROLLER ACTIVE';
      padStatus.style.color = '#00ff88';
      padDot.style.background = '#00ff88';
      padDot.style.boxShadow = '0 0 8px #00ff88';
    } else {
      padStatus.textContent = 'PS CONTROLLER: CONNECT VIA USB / BT';
      padStatus.style.color = '#64748b';
      padDot.style.background = '#64748b';
      padDot.style.boxShadow = 'none';
    }
  }

  poll(playerMathX, playerMathY) {
    let mx = 0;
    let my = 0;
    let newAimAng = null;
    this.isBraking = false;

    // 1. Poll PlayStation Gamepad
    if (navigator.getGamepads) {
      const gamepads = navigator.getGamepads();
      const gp = (this.gamepadIndex >= 0 && gamepads[this.gamepadIndex]) ? gamepads[this.gamepadIndex] : null;

      if (gp && gp.connected) {
        if (!this.gamepadConnected) {
          this.gamepadConnected = true;
          this.updateGamepadBadge(true, gp.id);
        }

        // Left Analog Stick (Movement) with deadzone
        const deadzone = 0.16;
        const stickLx = gp.axes[0] || 0;
        const stickLy = gp.axes[1] || 0;
        if (Math.hypot(stickLx, stickLy) > deadzone) {
          mx += stickLx;
          my -= stickLy; // Invert Y for Cartesian math coordinates
        }

        // D-Pad Movement
        if (gp.buttons[PLAYSTATION_BUTTONS.DPAD_UP]?.pressed) my += 1;
        if (gp.buttons[PLAYSTATION_BUTTONS.DPAD_DOWN]?.pressed) my -= 1;
        if (gp.buttons[PLAYSTATION_BUTTONS.DPAD_LEFT]?.pressed) mx -= 1;
        if (gp.buttons[PLAYSTATION_BUTTONS.DPAD_RIGHT]?.pressed) mx += 1;

        // Right Analog Stick (Aiming)
        const stickRx = gp.axes[2] || 0;
        const stickRy = gp.axes[3] || 0;
        if (Math.hypot(stickRx, stickRy) > deadzone) {
          newAimAng = Math.atan2(-stickRy, stickRx);
        }

        // Helper for Single-Press / Continuous
        const isPressed = (btnIndex) => Boolean(gp.buttons[btnIndex]?.pressed);
        const isJustPressed = (btnIndex) => {
          const pressed = isPressed(btnIndex);
          const wasPressed = Boolean(this.prevButtons[btnIndex]);
          return pressed && !wasPressed;
        };

        // PlayStation Buttons:
        // ✕ (Cross): Dash
        if (isJustPressed(PLAYSTATION_BUTTONS.CROSS)) this.actions.dash = true;

        // ▢ (Square) or R2: Beam Weapon
        if (isJustPressed(PLAYSTATION_BUTTONS.SQUARE) || isPressed(PLAYSTATION_BUTTONS.R2)) {
          this.actions.beam = true;
        }

        // ◯ (Circle): Supernova Bomb
        if (isJustPressed(PLAYSTATION_BUTTONS.CIRCLE)) this.actions.bomb = true;

        // △ (Triangle): Slow-Mo
        if (isJustPressed(PLAYSTATION_BUTTONS.TRIANGLE)) this.actions.slowMo = true;

        // L2: Air Brake
        if (isPressed(PLAYSTATION_BUTTONS.L2)) this.isBraking = true;

        // L1 / R1: Cycle Match
        if (isJustPressed(PLAYSTATION_BUTTONS.L1)) this.actions.cycleLeft = true;
        if (isJustPressed(PLAYSTATION_BUTTONS.R1)) this.actions.cycleRight = true;

        // SELECT: Toggle Pilot
        if (isJustPressed(PLAYSTATION_BUTTONS.SELECT)) this.actions.togglePilot = true;

        // START: Pause
        if (isJustPressed(PLAYSTATION_BUTTONS.START)) this.actions.pauseToggle = true;

        // Save prev button states
        for (let b = 0; b < gp.buttons.length; b++) {
          this.prevButtons[b] = gp.buttons[b]?.pressed;
        }
      }
    }

    // 2. Poll Keyboard
    if (this.keys['KeyW'] || this.keys['ArrowUp']) my += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) my -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) mx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) mx += 1;
    if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) this.isBraking = true;

    // 3. Poll Virtual Touch Stick
    if (this.touchJoystick.active) {
      mx += this.touchJoystick.dx;
      my -= this.touchJoystick.dy;
    }

    // Normalize movement vector
    const moveLen = Math.hypot(mx, my);
    if (moveLen > 1) {
      this.moveX = mx / moveLen;
      this.moveY = my / moveLen;
    } else {
      this.moveX = mx;
      this.moveY = my;
    }

    // Aiming Direction
    if (newAimAng !== null) {
      this.facingAng = newAimAng;
    } else if (this.lastMousePos && this.canvas) {
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
}
