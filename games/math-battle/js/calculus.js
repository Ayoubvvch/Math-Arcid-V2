/**
 * Math Battle: Calculus Showdown
 * Formal Calculus Differentiation Engine & Pedagogical Lifecycle
 */

import { MATCH_CONFIGS } from './config.js';

export class CalculusEngine {
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

    if (type === 'x4') {
      const newBalls = [];
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI / 2) + (Math.random() - 0.5) * 0.25;
        newBalls.push({
          type: 'x3',
          label: 'x³',
          power: 3,
          x: Math.max(-4.1, Math.min(4.1, ball.x + Math.cos(ang) * bMathR * 1.4)),
          y: Math.max(-4.1, Math.min(4.1, ball.y + Math.sin(ang) * bMathR * 1.4)),
          vx: Math.cos(ang) * currentSpeed,
          vy: Math.sin(ang) * currentSpeed,
          radius: 30,
          color: '#ff5500',
          halo: 'rgba(255, 85, 0, 0.24)',
          grace: 0.16
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
        const ang = (i * 2 * Math.PI / 3) + (Math.random() - 0.5) * 0.25;
        newBalls.push({
          type: 'x2',
          label: 'x²',
          power: 2,
          x: Math.max(-4.1, Math.min(4.1, ball.x + Math.cos(ang) * bMathR * 1.4)),
          y: Math.max(-4.1, Math.min(4.1, ball.y + Math.sin(ang) * bMathR * 1.4)),
          vx: Math.cos(ang) * currentSpeed,
          vy: Math.sin(ang) * currentSpeed,
          radius: 25,
          color: '#00f0ff',
          halo: 'rgba(0, 240, 255, 0.24)',
          grace: 0.16
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
        const ang = (i * Math.PI) + (Math.random() - 0.5) * 0.4;
        newBalls.push({
          type: 'x',
          label: 'x',
          power: 1,
          x: Math.max(-4.1, Math.min(4.1, ball.x + Math.cos(ang) * bMathR * 1.3)),
          y: Math.max(-4.1, Math.min(4.1, ball.y + Math.sin(ang) * bMathR * 1.3)),
          vx: Math.cos(ang) * currentSpeed,
          vy: Math.sin(ang) * currentSpeed,
          radius: 21,
          color: '#f97316',
          halo: 'rgba(249, 115, 22, 0.24)',
          grace: 0.16
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
        radius: 17,
        color: '#ffd700',
        halo: 'rgba(255, 215, 0, 0.24)',
        grace: 0.14
      }];
      return {
        newBalls,
        popup: { text: 'd/dx(x) = 1', color: '#ffd700' },
        isAnnihilated: false
      };
    }

    if (type === '1') {
      return {
        newBalls: [],
        popup: { text: 'd/dx(1) = 0 [ZERO!]', color: '#10b981' },
        isAnnihilated: true
      };
    }

    // --- Trigonometric Cycle (sin -> cos -> -sin -> -cos -> 0) ---
    if (type === 'sin' || type === 'cos' || type === '-sin' || type === '-cos') {
      const trigMap = {
        'sin': { next: 'cos', label: 'cos(x)', color: '#06b6d4', halo: 'rgba(6, 182, 212, 0.24)', popup: 'd/dx(sin) = cos' },
        'cos': { next: '-sin', label: '-sin(x)', color: '#e11d48', halo: 'rgba(225, 29, 72, 0.24)', popup: 'd/dx(cos) = -sin' },
        '-sin': { next: '-cos', label: '-cos(x)', color: '#8b5cf6', halo: 'rgba(139, 92, 246, 0.24)', popup: 'd/dx(-sin) = -cos' },
        '-cos': { next: '0', label: '0 [ZERO]', color: '#10b981', halo: 'rgba(16, 185, 129, 0.24)', popup: 'd/dx(-cos) = sin → 0' }
      };
      const trans = trigMap[type];
      if (trans.next === '0') {
        return {
          newBalls: [],
          popup: { text: '0 [ANNIHILATED!]', color: '#10b981' },
          isAnnihilated: true
        };
      }
      const ang = Math.random() * Math.PI * 2;
      const newBalls = [{
        type: trans.next,
        label: trans.label,
        power: 3,
        x: ball.x,
        y: ball.y,
        vx: Math.cos(ang) * currentSpeed,
        vy: Math.sin(ang) * currentSpeed,
        radius: 28,
        color: trans.color,
        halo: trans.halo,
        grace: 0.16
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
        x: Math.max(-4.1, Math.min(4.1, ball.x + Math.cos(ang) * bMathR * 1.1)),
        y: Math.max(-4.1, Math.min(4.1, ball.y + Math.sin(ang) * bMathR * 1.1)),
        vx: Math.cos(ang) * currentSpeed * 1.12,
        vy: Math.sin(ang) * currentSpeed * 1.12,
        radius: 33,
        color: '#ffd700',
        halo: 'rgba(255, 215, 0, 0.24)',
        grace: 0.14
      }];
      return {
        newBalls,
        popup: { text: 'd/dx(eˣ) = eˣ [INVARIANT!]', color: '#ffd700' },
        isAnnihilated: false
      };
    }

    return { newBalls: [], popup: { text: 'd/dx = 0', color: '#10b981' }, isAnnihilated: true };
  }
}
