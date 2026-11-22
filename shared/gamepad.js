/**
 * Math Arcade - Universal Gamepad Engine (PlayStation / Xbox / Generic)
 * Provides standardized gamepad inputs, deadzones, haptics, and button mappings.
 */

export class GamepadEngine {
  constructor(options = {}) {
    this.deadzone = options.deadzone || 0.18;
    this.onConnect = options.onConnect || null;
    this.onDisconnect = options.onDisconnect || null;
    this.connectedGamepad = null;
    this.activeIndex = -1;
    this._wasConnected = false;

    // Standard Gamepad Button Mapping (W3C Standard)
    // 0: A / Cross ✕
    // 1: B / Circle ◯
    // 2: X / Square ▢
    // 3: Y / Triangle △
    // 4: L1 / LB
    // 5: R1 / RB
    // 6: L2 / LT (analog trigger)
    // 7: R2 / RT (analog trigger)
    // 8: Select / Share / Back
    // 9: Start / Options
    // 10: L3 / Left Stick Press
    // 11: R3 / Right Stick Press
    // 12: D-Pad Up
    // 13: D-Pad Down
    // 14: D-Pad Left
    // 15: D-Pad Right
    // 16: Guide / PS Home

    this.buttons = {
      cross: false, // ✕ / A
      circle: false, // ◯ / B
      square: false, // ▢ / X
      triangle: false, // △ / Y
      l1: false,
      r1: false,
      l2: 0,
      r2: 0,
      select: false,
      start: false,
      l3: false,
      r3: false,
      dpadUp: false,
      dpadDown: false,
      dpadLeft: false,
      dpadRight: false,
    };

    this.prevButtons = { ...this.buttons };

    this.axes = {
      leftX: 0,
      leftY: 0,
      rightX: 0,
      rightY: 0,
    };

    this.listeners = new Map();
    this.init();
  }

  init() {
    window.addEventListener('gamepadconnected', (e) => {
      this.connectedGamepad = e.gamepad;
      this.activeIndex = e.gamepad.index;
      this._wasConnected = true;
      if (this.onConnect) this.onConnect(e.gamepad);
      this.triggerHaptic(60, 0.35, 0.35);
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      if (this.connectedGamepad && this.connectedGamepad.index === e.gamepad.index) {
        this.connectedGamepad = null;
        this.activeIndex = -1;
        this._wasConnected = false;
      }
      if (this.onDisconnect) this.onDisconnect(e.gamepad);
    });
  }

  /**
   * Finds the best active connected gamepad across all browser slots
   */
  _findActiveGamepad() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    if (!gamepads) return null;

    if (this.activeIndex >= 0 && gamepads[this.activeIndex] && gamepads[this.activeIndex].connected) {
      return gamepads[this.activeIndex];
    }

    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i].connected) {
        this.activeIndex = i;
        return gamepads[i];
      }
    }
    return null;
  }

  /**
   * Must be called inside the game/animation loop (requestAnimationFrame)
   */
  poll() {
    const gp = this._findActiveGamepad();

    if (!gp) {
      if (this._wasConnected) {
        this._wasConnected = false;
        this.connectedGamepad = null;
        this.activeIndex = -1;
        if (this.onDisconnect) this.onDisconnect(null);
      }
      return false;
    }

    const newlyDiscovered = !this._wasConnected;
    this.connectedGamepad = gp;
    this._wasConnected = true;

    if (newlyDiscovered && this.onConnect) {
      this.onConnect(gp);
    }

    // Save previous state for edge detection
    this.prevButtons = { ...this.buttons };

    const btn = (idx) => Boolean(gp.buttons[idx] && gp.buttons[idx].pressed);
    const btnVal = (idx) => (gp.buttons[idx] ? gp.buttons[idx].value : 0);

    // Hat-switch fallback (axes[9] on non-standard controllers; centered resting value is outside [-1.05, 1.05])
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

    this.buttons = {
      cross: btn(0), // ✕ / A
      circle: btn(1), // ◯ / B
      square: btn(2), // ▢ / X
      triangle: btn(3), // △ / Y
      l1: btn(4),
      r1: btn(5),
      l2: btnVal(6),
      r2: btnVal(7),
      select: btn(8),
      start: btn(9),
      l3: btn(10),
      r3: btn(11),
      dpadUp: btn(12) || hatUp,
      dpadDown: btn(13) || hatDown,
      dpadLeft: btn(14) || hatLeft,
      dpadRight: btn(15) || hatRight,
    };

    // Radial deadzone so stick diagonal movement & neutral rest feel silky-smooth
    const applyRadialDeadzone = (x, y) => {
      const mag = Math.hypot(x || 0, y || 0);
      if (mag < this.deadzone) return { x: 0, y: 0 };
      const clamped = Math.min(1, mag);
      const norm = (clamped - this.deadzone) / Math.max(0.001, 1 - this.deadzone);
      return {
        x: (x / mag) * norm,
        y: (y / mag) * norm
      };
    };

    const ls = applyRadialDeadzone(gp.axes[0] || 0, gp.axes[1] || 0);
    const rs = applyRadialDeadzone(gp.axes[2] || 0, gp.axes[3] || 0);
    this.axes.leftX = ls.x;
    this.axes.leftY = ls.y;
    this.axes.rightX = rs.x;
    this.axes.rightY = rs.y;

    // Trigger justPressed events
    for (const key of Object.keys(this.buttons)) {
      if (this.isJustPressed(key)) {
        this.emit('press', key);
      }
    }

    return true;
  }

  isPressed(name) {
    return !!this.buttons[name];
  }

  isJustPressed(name) {
    return !!this.buttons[name] && !this.prevButtons[name];
  }

  isJustReleased(name) {
    return !this.buttons[name] && !!this.prevButtons[name];
  }

  isAnyJustPressed() {
    for (const key of Object.keys(this.buttons)) {
      if (this.isJustPressed(key)) return true;
    }
    return false;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    const cbs = this.listeners.get(event);
    if (cbs) {
      cbs.forEach((cb) => cb(data));
    }
  }

  /**
   * Dual-Rumble Haptic Feedback
   */
  async triggerHaptic(duration = 100, weak = 0.5, strong = 0.5) {
    if (!this.connectedGamepad) return;
    try {
      const actuator = this.connectedGamepad.vibrationActuator;
      if (actuator && typeof actuator.playEffect === 'function') {
        await actuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: duration,
          weakMagnitude: Math.min(1, Math.max(0, weak)),
          strongMagnitude: Math.min(1, Math.max(0, strong)),
        });
      }
    } catch {
      // Haptics unsupported or disabled
    }
  }

  /**
   * Returns short & readable controller label
   */
  getControllerType() {
    if (!this.connectedGamepad) return 'None';
    const id = this.connectedGamepad.id.toLowerCase();
    if (id.includes('dualsense') || id.includes('0ce6')) {
      return 'PS5 DualSense';
    }
    if (id.includes('dualshock') || id.includes('playstation') || id.includes('sony') || id.includes('ps4') || id.includes('ps5') || id.includes('wireless controller')) {
      return 'PlayStation (✕, ◯, ▢, △)';
    }
    if (id.includes('xbox') || id.includes('microsoft') || id.includes('xinput')) {
      return 'Xbox Controller';
    }
    if (id.includes('nintendo') || id.includes('pro controller')) {
      return 'Nintendo Pro';
    }
    return 'Gamepad Ready';
  }
}

export const gamepad = new GamepadEngine();
