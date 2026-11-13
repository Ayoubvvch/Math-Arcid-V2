/**
 * Math Arcade Shared Math Engine
 * High-performance vector mathematics, calculus operators, and collision utilities.
 */

export class Vector2D {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  copy() {
    return new Vector2D(this.x, this.y);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mult(n) {
    this.x *= n;
    this.y *= n;
    return this;
  }

  div(n) {
    if (n !== 0) {
      this.x /= n;
      this.y /= n;
    }
    return this;
  }

  magSq() {
    return this.x * this.x + this.y * this.y;
  }

  mag() {
    return Math.sqrt(this.magSq());
  }

  normalize() {
    const m = this.mag();
    if (m > 0.00001) this.div(m);
    return this;
  }

  limit(max) {
    const mSq = this.magSq();
    if (mSq > max * max) {
      this.div(Math.sqrt(mSq)).mult(max);
    }
    return this;
  }

  heading() {
    return Math.atan2(this.y, this.x);
  }

  dist(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  dot(v) {
    return this.x * v.x + this.y * v.y;
  }

  static dist(v1, v2) {
    return v1.dist(v2);
  }

  static sub(v1, v2) {
    return new Vector2D(v1.x - v2.x, v1.y - v2.y);
  }
}

/**
 * Coordinate System Conversion
 */
export class CoordinateSystem {
  constructor(originX = 0, originY = 0, scale = 40) {
    this.originX = originX;
    this.originY = originY;
    this.scale = scale; // pixels per unit
  }

  toScreen(cartX, cartY) {
    return {
      x: this.originX + cartX * this.scale,
      y: this.originY - cartY * this.scale, // inverted Y for standard math
    };
  }

  toCartesian(screenX, screenY) {
    return {
      x: (screenX - this.originX) / this.scale,
      y: (this.originY - screenY) / this.scale,
    };
  }
}

/**
 * Calculus Helper Operators
 */
export const Calculus = {
  /**
   * Differentiates a simple polynomial term ax^n
   * Returns { coefficient, power }
   */
  differentiateTerm(coef, power) {
    if (power === 0) return { coef: 0, power: 0 };
    return {
      coef: coef * power,
      power: power - 1,
    };
  },

  /**
   * Formats term into human-readable LaTeX/Math string
   */
  formatTerm(coef, power) {
    if (coef === 0) return "0";
    if (power === 0) return `${coef}`;
    const sign = coef === 1 ? "" : coef === -1 ? "-" : `${coef}`;
    if (power === 1) return `${sign}x`;
    return `${sign}x^${power}`;
  },

  /**
   * Trigonometric differentiation cycle
   * sin -> cos -> -sin -> -cos -> sin
   */
  differentiateTrig(type, sign = 1) {
    if (type === "sin") return { type: "cos", sign: sign };
    if (type === "cos") return { type: "sin", sign: -sign };
    return { type: "0", sign: 0 };
  },

  /**
   * Exponential derivative d/dx (e^x) = e^x
   */
  differentiateExp(coef = 1) {
    return { type: "exp", coef: coef };
  },
};
