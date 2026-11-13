/**
 * Math Battle: Calculus Showdown
 * Formal Calculus Differentiation Engine & Pedagogical Lifecycle
 */

import { MATCH_CONFIGS } from './config.js';

export class CalculusEngine {
  /**
   * Returns the complete derivation ladder for a match type
   */
  static getDerivationLadder(matchId) {
    const config = MATCH_CONFIGS[matchId] || MATCH_CONFIGS.x3;
    return config.chain;
  }

  /**
   * Applies d/dx operator to a target mathematical orb
   * Returns { newBalls: [...], popup: { text, color }, isAnnihilated: boolean }
   */
  static differentiate(ball, currentSpeed, bMathR) {
    const type = ball.type;

    // --- Polynomial Powers (x^n -> n * x^(n-1)) ---
    if (type === 'x4') {
      const newBalls = [];
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI / 2) + (Math.random() - 0.5) * 0.3;
        newBalls.push({
          type: 'x3',
          label: 'x³',
          power: 3,
          x: Math.max(-4.2, Math.min(4.2, ball.x + Math.cos(ang) * bMathR * 1.5)),
          y: Math.max(-4.2, Math.min(4.2, ball.y + Math.sin(ang) * bMathR * 1.5)),
          vx: Math.cos(ang) * currentSpeed,
          vy: Math.sin(ang) * currentSpeed,
          radius: 30,
          color: '#ff5500',
          halo: 'rgba(255, 85, 0, 0.25)'
        });
      }
      return {
        newBalls,
        popup: { text: 'd/dx(x⁴) = 4x³', color: '#c026d3' },
        isAnnihilated: false
      };
    }

    if (type === 'x3') {
      const newBalls = [];
      for (let i = 0; i < 3; i++) {
        const ang = (i * 2 * Math.PI / 3) + (Math.random() - 0.5) * 0.3;
        newBalls.push({
          type: 'x2',
          label: 'x²',
          power: 2,
          x: Math.max(-4.2, Math.min(4.2, ball.x + Math.cos(ang) * bMathR * 1.5)),
          y: Math.max(-4.2, Math.min(4.2, ball.y + Math.sin(ang) * bMathR * 1.5)),
          vx: Math.cos(ang) * currentSpeed,
          vy: Math.sin(ang) * currentSpeed,
          radius: 26,
          color: '#00f0ff',
          halo: 'rgba(0, 240, 255, 0.25)'
        });
      }
      return {
        newBalls,
        popup: { text: 'd/dx(x³) = 3x²', color: '#00f0ff' },
        isAnnihilated: false
      };
    }

    if (type === 'x2') {
      const newBalls = [];
      for (let i = 0; i < 2; i++) {
        const ang = (i * Math.PI) + (Math.random() - 0.5) * 0.5;
        newBalls.push({
          type: 'x',
          label: 'x',
          power: 1,
          x: Math.max(-4.2, Math.min(4.2, ball.x + Math.cos(ang) * bMathR * 1.4)),
          y: Math.max(-4.2, Math.min(4.2, ball.y + Math.sin(ang) * bMathR * 1.4)),
          vx: Math.cos(ang) * currentSpeed,
          vy: Math.sin(ang) * currentSpeed,
          radius: 22,
          color: '#f97316',
          halo: 'rgba(249, 115, 22, 0.25)'
        });
      }
      return {
        newBalls,
        popup: { text: 'd/dx(x²) = 2x', color: '#f97316' },
        isAnnihilated: false
      };
    }

    if (type === 'x') {
      const ang = Math.random() * Math.PI * 2;
      const newBalls = [{
        type: '1',
        label: '1',
        power: 0,
        x: ball.x,
        y: ball.y,
        vx: Math.cos(ang) * currentSpeed,
        vy: Math.sin(ang) * currentSpeed,
        radius: 18,
        color: '#ffd700',
        halo: 'rgba(255, 215, 0, 0.25)'
      }];
      return {
        newBalls,
        popup: { text: 'd/dx(x) = 1', color: '#ffd700' },
        isAnnihilated: false
      };
    }

    if (type === '1') {
      // d/dx(1) = 0 -> Constant derivative is 0! Ball completely disappears!
      return {
        newBalls: [],
        popup: { text: 'd/dx(1) = 0 [ZERO!]', color: '#10b981' },
        isAnnihilated: true
      };
    }

    // --- Trigonometric Cycle (sin -> cos -> -sin -> -cos -> 0) ---
    if (type === 'sin' || type === 'cos' || type === '-sin' || type === '-cos') {
      const trigMap = {
        'sin': { next: 'cos', label: 'cos(x)', color: '#06b6d4', popup: 'd/dx(sin) = cos' },
        'cos': { next: '-sin', label: '-sin(x)', color: '#e11d48', popup: 'd/dx(cos) = -sin' },
        '-sin': { next: '-cos', label: '-cos(x)', color: '#8b5cf6', popup: 'd/dx(-sin) = -cos' },
        '-cos': { next: '0', label: '0 [ZERO]', color: '#10b981', popup: 'd/dx(-cos) = sin -> 0' }
      };
      const trans = trigMap[type];
      if (trans.next === '0') {
        return {
          newBalls: [],
          popup: { text: '0 [ANNIHILATED!]', color: '#10b981' },
          isAnnihilated: true
        };
      }
      const newBalls = [{
        type: trans.next,
        label: trans.label,
        power: 3,
        x: ball.x,
        y: ball.y,
        vx: (Math.random() - 0.5) * currentSpeed * 1.4,
        vy: (Math.random() - 0.5) * currentSpeed * 1.4,
        radius: 30,
        color: trans.color,
        halo: trans.color
      }];
      return {
        newBalls,
        popup: { text: trans.popup, color: trans.color },
        isAnnihilated: false
      };
    }

    // --- Exponential Invariant (d/dx(e^x) = e^x) ---
    if (type === 'exp') {
      const ang = Math.random() * Math.PI * 2;
      const newBalls = [{
        type: 'exp',
        label: 'eˣ',
        power: 5,
        x: Math.max(-4.2, Math.min(4.2, ball.x + Math.cos(ang) * bMathR * 1.4)),
        y: Math.max(-4.2, Math.min(4.2, ball.y + Math.sin(ang) * bMathR * 1.4)),
        vx: Math.cos(ang) * currentSpeed * 1.15,
        vy: Math.sin(ang) * currentSpeed * 1.15,
        radius: 32,
        color: '#ffd700',
        halo: 'rgba(255, 215, 0, 0.25)'
      }];
      return {
        newBalls,
        popup: { text: 'd/dx(eˣ) = eˣ [EIGENFUNCTION!]', color: '#ffd700' },
        isAnnihilated: false
      };
    }

    return { newBalls: [], popup: { text: 'd/dx = 0', color: '#10b981' }, isAnnihilated: true };
  }
}
