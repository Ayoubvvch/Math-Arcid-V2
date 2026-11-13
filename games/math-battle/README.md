# Math Battle: Calculus Showdown [PlayStation Edition]

An autonomous, zero-bloat mathematical arcade game built with pure modern web standards (ES Modules, HTML5 Canvas, Web Audio API, Gamepad API with Dual-Rumble Haptics).

## Mathematical Concept & Derivation Lifecycle
In **Math Battle**, you pilot the differential operator **d/dx**. Your objective is to annihilate polynomial, trigonometric, and exponential boss entities by reducing them to the zero constant through repeated differentiation:

$$\frac{d}{dx}(f(x)) \longrightarrow 0 \quad [\text{ANNIHILATION}]$$

### 1. Polynomial Power Cascade
According to the power rule $\frac{d}{dx}(x^n) = n \cdot x^{n-1}$:
- **$x^4$ (Quartic Swarm)** $\longrightarrow$ splits into $4$ orbs of $x^3$
- **$x^3$ (Cubic Boss)** $\longrightarrow$ splits into $3$ orbs of $x^2$
- **$x^2$ (Quadratic)** $\longrightarrow$ splits into $2$ orbs of $x$
- **$x$ (Linear)** $\longrightarrow$ differentiates into $1$
- **$1$ (Constant)** $\longrightarrow \frac{d}{dx}(1) = 0$ (**ANNIHILATED! The orb is completely destroyed!**)

### 2. Trigonometric Cyclic Derivation
- $\sin(x) \longrightarrow \cos(x) \longrightarrow -\sin(x) \longrightarrow -\cos(x) \longrightarrow 0$

### 3. Exponential Invariant (Eigenfunction)
- $\frac{d}{dx}(e^x) = e^x$
- The exponential function is invariant under differentiation. Strike it 15 times to cause a mathematical overload singularity!

---

## PlayStation DualSense / DualShock Controls
- **✕ (Cross)**: Triple Dash (Chain Rule) with invulnerability phase
- **▢ (Square)**: Calculus Beam Weapon
- **◯ (Circle)**: Leibniz Supernova Bomb (Screen-wide derivation shockwave)
- **△ (Triangle)**: Euler Slow-Mo Time Dilation
- **L1 / R1**: Cycle Match Roster
- **L2**: Air-Brake / Reverse Thruster
- **R2**: Rapid-Fire Calculus Beam
- **Left Analog Stick / D-Pad**: Smooth 360° Vector Flight
- **Right Analog Stick / Mouse**: 360° Calculus Aiming
- **Haptic Rumble**: Dual-rumble feedback on dash, beam, clack, bomb, and victory.

---

## Architecture
- `index.html`: Shell & responsive viewport.
- `css/style.css`: PlayStation cyber aesthetic styling.
- `js/config.js`: Arena geometry & match configurations.
- `js/audio.js`: Synthesized Web Audio engine & haptics.
- `js/calculus.js`: Formal mathematical differentiation engine.
- `js/controls.js`: PlayStation Gamepad API, touch virtual stick & keyboard/mouse.
- `js/entities.js`: Object pools (beams, particles, popups, shockwaves).
- `js/renderer.js`: High-DPI canvas renderer with the **Calculus Derivation Lifecycle Bar**.
- `js/game.js`: Master simulation loop & billiard collision physics.
