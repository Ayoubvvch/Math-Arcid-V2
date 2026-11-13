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
      console.log('🎮 Gamepad connected:', e.gamepad.id);
      if (this.onConnect) this.onConnect(e.gamepad);
      this.triggerHaptic(60, 0.4, 0.4);
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      console.log('🎮 Gamepad disconnected:', e.gamepad.id);
      if (this.connectedGamepad && this.connectedGamepad.index === e.gamepad.index) {
        this.connectedGamepad = null;
      }
      if (this.onDisconnect) this.onDisconnect(e.gamepad);
    });
  }

  /**
   * Must be called inside the game/animation loop (requestAnimationFrame)
   */
  poll() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = null;

    // Pick first active gamepad
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i] && gamepads[i].connected) {
        gp = gamepads[i];
        break;
      }
    }

    if (!gp) {
      this.connectedGamepad = null;
      return false;
    }

    this.connectedGamepad = gp;

    // Save previous state for press edge detection
    this.prevButtons = { ...this.buttons };

    // Update buttons
    const btn = (idx) => gp.buttons[idx] && gp.buttons[idx].pressed;
    const btnVal = (idx) => (gp.buttons[idx] ? gp.buttons[idx].value : 0);

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
      dpadUp: btn(12),
      dpadDown: btn(13),
      dpadLeft: btn(14),
      dpadRight: btn(15),
    };

    // Update Axes with Deadzone
    const applyDeadzone = (v) => (Math.abs(v) < this.deadzone ? 0 : v);
    this.axes.leftX = applyDeadzone(gp.axes[0] || 0);
    this.axes.leftY = applyDeadzone(gp.axes[1] || 0);
    this.axes.rightX = applyDeadzone(gp.axes[2] || 0);
    this.axes.rightY = applyDeadzone(gp.axes[3] || 0);

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
          weakMagnitude: weak,
          strongMagnitude: strong,
        });
      }
    } catch {
      // Haptics unsupported or disabled
    }
  }

  /**
   * Returns human-readable controller label
   */
  getControllerType() {
    if (!this.connectedGamepad) return 'None';
    const id = this.connectedGamepad.id.toLowerCase();
    if (id.includes('dual') || id.includes('playstation') || id.includes('sony') || id.includes('ps4') || id.includes('ps5')) {
      return 'PlayStation (✕, ◯, ▢, △)';
    }
    if (id.includes('xbox') || id.includes('microsoft')) {
      return 'Xbox (A, B, X, Y)';
    }
    if (id.includes('nintendo') || id.includes('pro controller')) {
      return 'Nintendo Switch (B, A, Y, X)';
    }
    return 'Standard Gamepad (Cross ✕ / Circle ◯)';
  }
}

export const gamepad = new GamepadEngine();
