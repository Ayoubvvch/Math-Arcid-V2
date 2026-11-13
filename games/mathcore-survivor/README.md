# ⚡ MathCore: Sandbox Survivor

> **2D Mathematical Equation Survival & Geometric Sandbox**  
> Play live in the Math Arcade: **[https://ayoubvvch.github.io/math-arcade/games/mathcore-survivor/](https://ayoubvvch.github.io/math-arcade/games/mathcore-survivor/)**

---

## 🎮 Core Premise & Mechanics

You pilot an autonomous mathematical core craft inside an orthonormal Cartesian 2D grid ($WORLD\_SIZE = 2400 \times 2400$). Swarms of geometric equation orbs converge on your core.

### 1. Dynamic Equation Matching
Every enemy orb carries a real-time mathematical challenge (e.g. `3 + 2`, `2x = 10`, `3 × 4`, or `√16`).
- Your core craft maintains an internal variable $X$.
- When you use your 4 face buttons to transform $X$ such that **$X = \text{Enemy Solution}$**, a high-voltage **Neon Resonance Lightning Beam** automatically strikes and annihilates the enemy!

### 2. Controller & Gamepad Support (PlayStation & Xbox)
- **Left Stick / WASD**: Omni-directional craft movement.
- **Right Stick / Mouse Aim**: Directional aim.
- **Button 0 (`✕` Cross / `A`)**: Operation 1 (default: $+1$).
- **Button 1 (`◯` Circle / `B`)**: Operation 2 (default: $-1$).
- **Button 2 (`▢` Square / `X`)**: Operation 3 (default: $\times 2$).
- **Button 3 (`△` Triangle / `Y`)**: Operation 4 (default: $X = 0$).
- **Right Trigger (`RT` / `Space`)**: Manual EMP shockwave & kinetic plasma bolt.
- **Left Trigger (`LT` / `F`)**: Place selected geometric defense turret.
- **Bumpers (`LB` / `RB` / `Q` / `E`)**: Cycle through blueprint structures.
- **D-Pad (`Up` / `Down` / `Mouse Wheel`)**: Fine-tuning $X$ step-by-step.
- **Dual-Rumble Haptics**: Vibration feedback on resonance strikes, building, and hits.

### 3. Geometric Defense Towers (Algebraic & Parity Defenses)
- **Even Number Turret ($2n$)**: Automatically targets enemies with even solutions.
- **Odd Number Turret ($2n+1$)**: Automatically targets enemies with odd solutions.
- **Divisibility Coil ($3n$)**: Chain lightning on solutions divisible by 3.
- **Sine Healer ($\sin(t)$)**: Emits periodic harmonic healing waves.
- **Matrix Wall ($[M]$)**: High-durability reflector barricade.

---

## 🏗️ Modular Architecture

The monolithic 2,056-line HTML file has been decoupled into clean, maintainable modules:

```text
games/mathcore-survivor/
├── index.html           # Clean markup, HUD & modal UI (~210 lines)
├── css/
│   └── style.css        # Cyberpunk glassmorphism & neon glow CSS (~90 lines)
├── js/
│   ├── config.js        # Math operations catalogue, sandbox defaults, buildings (~80 lines)
│   ├── audio.js         # Web Audio API pure synthesizer (~65 lines)
│   ├── entities.js      # GameState, structures, gems, particles, HUD sync (~180 lines)
│   ├── math-system.js   # Challenge generator & resonance detection (~120 lines)
│   ├── controls.js      # Universal Gamepad (PS ✕,◯,▢,△ / Xbox) & keyboard engine (~130 lines)
│   ├── renderer.js      # 2D canvas drawing pipeline, stars, grid, lighting (~290 lines)
│   ├── modder.js        # Live in-game Sandbox Modder drawer & JSON modding (~110 lines)
│   └── game.js          # Main game loop, canvas resize, enemy spawning (~210 lines)
└── standalone.html      # Original standalone backup
```

---

## 🛠️ In-Game Live Sandbox Modder
Press the **"عدّل اللعبة (Sandbox)"** button or toggle the modder drawer to:
1. Re-map any of the 4 buttons to operations like $\times 3$, $\div 2$, $X^2$, or $-X$.
2. Switch difficulty between Numbers, Mental Arithmetic, Algebra, and Chaos.
3. Tweak world physics (Speed, Lightning Range, Turret Fire Rate, Spawn Frequency).
4. Export and import raw JSON configurations for custom community levels.
