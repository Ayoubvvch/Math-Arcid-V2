# ⚡ MATH-ARCID-V2 (PS5 Mathematical Console & Autonomous Monster Hub)

> **The Autonomous 60FPS PlayStation Mathematical Gaming Console (Moroccan 2BAC PC Edition)**  
> 🎮 **Play Live in Browser**: **[https://ayoubvvch.github.io/Math-Arcid-V2/](https://ayoubvvch.github.io/Math-Arcid-V2/)**  
> 📦 **GitHub Repository**: **[https://github.com/Ayoubvvch/Math-Arcid-V2](https://github.com/Ayoubvvch/Math-Arcid-V2)**

---

## 🌟 Overview
**Math-Arcid-V2** is a zero-bloat, hardware-accelerated PlayStation 5 style mathematical gaming console and autonomous evolution laboratory. Every curriculum game is engineered to the **7-Stage Gold Standard (`evolution/GOLD_STANDARD.md`)**:
- **Full-Screen `100vw × 100dvh` 60FPS Canvas** with dynamic HiDPI scaling and smooth camera tracking.
- **Arabic RTL Interface (`<html lang="ar" dir="rtl">`)** with automatic `setBidiSafeMath` bidirectional formula isolation (`<bdi dir="ltr" class="math-ltr">`).
- **6-Module Clean Architecture (`≥ 2,800–4,100+ LOC` per game)**: `curriculum.js`, `world.js`, `renderer.js`, `controls.js`, `audio.js`, and `game.js`.
- **100% PlayStation DualSense / DualShock Support** (`✕`, `◯`, `▢`, `△`, `L1/R1`, `L2/R2`, `Options`, D-Pad, Twin Sticks) across gameplay and interactive mathematical modals.

---

## 🎮 Live Games Catalog

| Game | Genre | 2BAC PC Curriculum Coverage | Direct Link |
| :--- | :--- | :--- | :--- |
| **Asymptote Asylum — مصحّة المشتقة** | 2D Survival Horror & Chainsaw Action | **Topics 23–38** (الاشتقاق ودراسة الدوال) | [Play Live](https://ayoubvvch.github.io/Math-Arcid-V2/games/asymptote-asylum/) |
| **Sequence Strider — عدّاء المتتاليات** | 2D Cyber Momentum Platformer | **Topics 39–50** (المتتاليات العددية) | [Play Live](https://ayoubvvch.github.io/Math-Arcid-V2/games/sequence-strider/) |
| **Argand Citadel — قلعة أرغاند العقدية** | 2D Orbital Sector Raid & Geometry | **Topics 51–64** (الأعداد العقدية ℂ) | [Play Live](https://ayoubvvch.github.io/Math-Arcid-V2/games/complex-plane-duel/) |
| **Math Battle: Calculus Showdown** | Differential Operator Boss Arena | Power, Trig & Exponential Derivatives | [Play Live](https://ayoubvvch.github.io/Math-Arcid-V2/games/math-battle/) |
| **MathCore: PlayStation Survivor** | Tactical 2D Parity & Algebra Arena | Linear Equations & Divisibility | [Play Live](https://ayoubvvch.github.io/Math-Arcid-V2/games/mathcore-survivor/) |

---

## 🏗️ Architecture & Project Structure

```text
Math-Arcid-V2/
├── index.html                  # PS5 Console Hub Launcher (Boot Screen, Horizontal Rail, 100% Controller Nav)
├── games.json                  # Single source of truth registry for all games & metadata
├── css/
│   ├── common.css              # Shared design tokens, typography, dark/OLED aesthetics
│   └── hub.css                 # PS5 Console Hub layout, dynamic backdrop interpolation & animations
├── js/
│   └── hub.js                  # Console launcher, bespoke SVG tile renderer, DualSense navigation
├── shared/                     # Universal shared utilities
│   ├── gamepad.js              # PlayStation (✕, ◯, ▢, △) & Xbox gamepad engine with dual haptics
│   ├── math-engine.js          # Vector2D, Calculus operators, Coordinate systems
│   ├── canvas-kit.js           # HiDPI auto-scaling, Zero-GC particle pool, Cartesian grid
│   └── retro-audio.js          # Zero-asset Web Audio API pure synthesizer
├── games/                      # Self-contained 6-module games
│   ├── asymptote-asylum/       # Topics 23–38 (2D Calculus Horror, 4,166 LOC)
│   ├── sequence-strider/       # Topics 39–50 (2D Suites Platformer, 3,331 LOC)
│   ├── complex-plane-duel/     # Topics 51–64 (2D Complex Plane Citadel, 3,591 LOC)
│   ├── math-battle/            # Differential Calculus Showdown
│   └── mathcore-survivor/      # Algebra & Parity Survivor
├── evolution/                  # Autonomous Twice-Daily Evolution Engine ("The Unleashed Monster")
│   ├── GOLD_STANDARD.md        # 8-Pillar Architectural & Pedagogical Charter
│   ├── ROADMAP.md              # 10-Game Moroccan 2BAC PC Master Plan
│   ├── SPRINT.md               # Active Alpha/Omega cycle milestones
│   ├── STATE.json              # Live telemetry and cycle state
│   └── scripts/
│       ├── trigger.sh          # Twice-daily (05:00 & 17:00 UTC) awakening trigger
│       └── verify.sh           # 7-Stage Ironclad Quality Gate compiler check
└── .github/workflows/
    └── pages.yml               # Automated GitHub Pages CI/CD deployment
```

---

## 📜 License
MIT License • Created by [Ayoub (eulerx0)](https://github.com/Ayoubvvch).
