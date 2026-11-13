/**
 * Math Battle: Calculus Showdown [PlayStation Edition]
 * Configuration & Mathematical Arena Constants
 */

export const ARENA = {
  x: 35,
  y: 195,
  width: 470,
  height: 470,
  xMin: -5,
  xMax: 5,
  yMin: -5,
  yMax: 5
};

export const CANVAS_SIZE = {
  width: 540,
  height: 960
};

export const MATCH_CONFIGS = {
  x3: {
    id: 'x3',
    title: 'x³ CUBIC BOSS',
    badge: 'CUBIC BOSS',
    color: '#ff5500',
    initialType: 'x3',
    initialHits: 16,
    summonInterval: 5.0,
    chain: [
      { id: 'x3', label: 'x³', color: '#ff5500', radius: 36 },
      { id: 'x2', label: '3x²', color: '#00f0ff', radius: 26 },
      { id: 'x', label: '2x', color: '#f97316', radius: 22 },
      { id: '1', label: '1', color: '#ffd700', radius: 18 },
      { id: '0', label: '0 [ZERO]', color: '#10b981', radius: 0 }
    ]
  },
  x4: {
    id: 'x4',
    title: 'x⁴ QUARTIC SWARM',
    badge: 'QUARTIC SWARM',
    color: '#c026d3',
    initialType: 'x4',
    initialHits: 24,
    summonInterval: 4.5,
    chain: [
      { id: 'x4', label: 'x⁴', color: '#c026d3', radius: 40 },
      { id: 'x3', label: '4x³', color: '#ff5500', radius: 30 },
      { id: 'x2', label: '3x²', color: '#00f0ff', radius: 24 },
      { id: 'x', label: '2x', color: '#f97316', radius: 20 },
      { id: '1', label: '1', color: '#ffd700', radius: 16 },
      { id: '0', label: '0 [ZERO]', color: '#10b981', radius: 0 }
    ]
  },
  sin: {
    id: 'sin',
    title: 'sin(x) TRIG WAVE',
    badge: 'TRIG WAVE',
    color: '#10b981',
    initialType: 'sin',
    initialHits: 16,
    summonInterval: 4.2,
    chain: [
      { id: 'sin', label: 'sin(x)', color: '#10b981', radius: 32 },
      { id: 'cos', label: 'cos(x)', color: '#06b6d4', radius: 30 },
      { id: '-sin', label: '-sin(x)', color: '#e11d48', radius: 30 },
      { id: '-cos', label: '-cos(x)', color: '#8b5cf6', radius: 30 },
      { id: '0', label: '0 [ZERO]', color: '#10b981', radius: 0 }
    ]
  },
  exp: {
    id: 'exp',
    title: 'eˣ IMMORTAL',
    badge: 'IMMORTAL',
    color: '#ffd700',
    initialType: 'exp',
    initialHits: 15,
    summonInterval: 3.8,
    chain: [
      { id: 'exp', label: 'eˣ', color: '#ffd700', radius: 35 },
      { id: 'd/dx', label: 'd/dx(eˣ) = eˣ', color: '#ff5500', radius: 35 },
      { id: 'overload', label: 'OVERLOAD (0)', color: '#10b981', radius: 0 }
    ]
  }
};

export const PLAYER_CONFIG = {
  maxHp: 100,
  baseSpeed: 4.8,
  dashSpeed: 11.0,
  dashDuration: 0.22,
  dashInvulnerableDuration: 0.35,
  maxDashCharges: 3,
  dashRechargeTime: 0.75,
  radius: 17,
  color: '#00f0ff',
  beamCooldown: 0.18,
  beamSpeed: 16.0,
  maxBombEnergy: 100,
  bombEnergyPerHit: 6
};

export const BASE_BALL_SPEED = 2.4;

export const PLAYSTATION_BUTTONS = {
  CROSS: 0,      // ✕: Triple Dash (Chain Rule) / Select
  CIRCLE: 1,     // ◯: Leibniz Supernova Bomb / Back
  SQUARE: 2,     // ▢: Calculus Beam Weapon
  TRIANGLE: 3,   // △: Euler Slow-Mo Time Dilation
  L1: 4,         // Cycle match left
  R1: 5,         // Cycle match right
  L2: 6,         // Air-Brake / Reverse Thruster
  R2: 7,         // Continuous Beam Fire
  SELECT: 8,     // Toggle Auto Pilot
  START: 9,      // Pause / Resume
  L3: 10,        // Stick Click
  R3: 11,        // Stick Click
  DPAD_UP: 12,   // Speed Up
  DPAD_DOWN: 13, // Speed Down
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15
};

export function toScreenX(x) {
  return ARENA.x + ((x - ARENA.xMin) / (ARENA.xMax - ARENA.xMin)) * ARENA.width;
}

export function toScreenY(y) {
  return ARENA.y + ((ARENA.yMax - y) / (ARENA.yMax - ARENA.yMin)) * ARENA.height;
}

export function toMathX(sx) {
  return ARENA.xMin + ((sx - ARENA.x) / ARENA.width) * (ARENA.xMax - ARENA.xMin);
}

export function toMathY(sy) {
  return ARENA.yMax - ((sy - ARENA.y) / ARENA.height) * (ARENA.yMax - ARENA.yMin);
}
