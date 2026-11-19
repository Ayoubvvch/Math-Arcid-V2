# Math-Arcid-V2: Autonomous Grand Roadmap (Unleashed Monster Edition)

## 1. Core Engineering & Creative Charter
* **Repository**: `https://github.com/Ayoubvvch/Math-Arcid-V2`
* **Live Deployment**: `https://ayoubvvch.github.io/Math-Arcid-V2/`
* **Zero-Garbage Gold Standard (`evolution/GOLD_STANDARD.md`)**:
  - Every game is a **Full-Screen 100vw × 100dvh 60FPS** experience (`<html lang="ar" dir="rtl">`) with `setBidiSafeMath` bidirectional formula isolation.
  - Mandatory 6-Module Architecture (`js/curriculum.js`, `js/world.js`, `js/renderer.js`, `js/controls.js`, `js/audio.js`, `js/game.js`) with **≥ 2,800 lines of code** per game.
  - Complete Moroccan 2BAC PC curriculum coverage with **≥ 24 National Exam questions**, interactive HTML5 Canvas graphs (`graphSpec`), 4 Sector Gates/Seals, Stagger/Execute mechanics, and a Sector Boss Core.
  - 100% PlayStation DualSense / DualShock support (`✕`, `◯`, `▢`, `△`, `L1/R1`, `L2/R2`, `Options`, D-Pad, Twin Sticks) across gameplay and all modals.
  - Bespoke SVG tile artwork in `js/hub.js` (`buildTileArtwork`).

---

## 2. The Complete Moroccan 2BAC PC Masterpiece Catalog (10 Games)

| # | Game ID | Title (Arabic / English) | Genre | 2BAC PC Topics | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `mathcore-survivor` | **MathCore: PlayStation Survivor** | Tactical 2D Parity Arena | Algebra & Divisibility | **LIVE (Genesis)** |
| 2 | `math-battle` | **Math Battle: Calculus Showdown** | Differential Operator Boss Arena | Power/Trig/Exp Derivatives | **LIVE (Genesis)** |
| 3 | `asymptote-asylum` | **Asymptote Asylum — مصحّة المشتقة** | 2D Survival Horror & Chainsaw Action | **Topics 23–38** (الاشتقاق ودراسة الدوال) | **LIVE (Gold Standard)** |
| 4 | `sequence-strider` | **Sequence Strider — عدّاء المتتاليات** | 2D Cyber Momentum Platformer | **Topics 39–50** (المتتاليات العددية) | **LIVE (Gold Standard)** |
| 5 | `complex-plane-duel` | **Argand Citadel — قلعة أرغاند العقدية** | 2D Orbital Sector Raid & Geometry | **Topics 51–64** (الأعداد العقدية ℂ) | **LIVE (Gold Standard v2.0)** |
| 6 | `limit-abyss` | **Limit Abyss — هاوية النهايات والاتصال** | 2D Deep-Trench Subnautic Survival | **Topics 1–22** (النهايات والاتصال و TVI و $f^{-1}$) | **LIVE (Gold Standard)** |
| 7 | `logarithm-reactor` | **Logarithm Reactor — مفاعل اللوغاريتم والأسي** | 2D Bio-Cyber Metroidvania Lab | **Topics 65–78** ($\ln x$ و $e^x$ والمعادلات) | **LIVE (Gold Standard)** |
| 8 | `integral-forge` | **Integral Forge — محرقة التكامل والمعادلات** | 2D Heavy Mech Siege & Area Slicer | **Topics 79–90** (الأصلية، التكامل والمعادلات التفاضلية) | **LIVE (Gold Standard)** |
| 9 | `vector-odyssey` | **Vector Odyssey — أوديسا الفضاء المتجهي** | 2.5D Starfighter Trench & Sphere Raid | **Topics 91–102** (الهندسة الفضائية والفلكة $\mathbb{R}^3$) | **LIVE (Gold Standard)** |
| 10 | `quantum-casino` | **Quantum Casino — كازينو الاحتمالات الكمومي** | 2D Tactical Heist & Bullet-Time Roguelite | **Topics 103–114** (التعداد والاحتمالات وقانون برنولي) | **PLANNED (Cycle 013)** |

---

## 3. Perpetual Autonomous Evolution Protocol (Alpha / Omega / Auto-Architect)

1. **Morning Run (05:00 UTC) — Phase `ALPHA`**:
   - Reads `evolution/GOLD_STANDARD.md`, `evolution/STATE.json`, and `evolution/SPRINT.md`.
   - Executes `nextAlphaMilestone` (either constructing a new Gold-Standard 6-module game `≥ 2,800 LOC`, or executing a major Organization/UX/Platform milestone in `SPRINT_03+`).
   - Passes `bash evolution/scripts/verify.sh` (all 7 gates), commits, and pushes to `origin main`.

2. **Evening Run (17:00 UTC) — Phase `OMEGA`**:
   - Audits the active target game/subsystem in `Math-Arcid-V2`.
   - Executes `nextOmegaMilestone` (expands question banks, adds interactive `graphSpec` plots, refines boss AI / particle FX / DualSense haptics / UX polish, and audits locked 60FPS).
   - If the just-completed milestone finishes the active Sprint, marks `currentSprint.status = "COMPLETED_NEEDS_ROADMAP"` in `STATE.json`.

3. **Automatic Sprint Transition — Phase `ARCHITECT` (Infinite Self-Planning Loop)**:
   - Whenever `SPRINT_02` (or any subsequent Sprint) finishes, `evolution/scripts/trigger.sh` automatically enters **Phase `ARCHITECT`** on the very next cycle instead of stopping:
     - **Full Project Audit**: Scans all games, `js/hub.js`, `css/`, `shared/`, `games.json`, and `evolution/` logs to diagnose structural clutter, UX friction, and missing capabilities.
     - **`SPRINT_03` Mandate (Post-Game-10)**: Strictly prioritizes **التنظيم والترتيب وتجربة المستخدم** (Clean folder/module architecture, Hub curriculum grouping & progress persistence, unified UX/DualSense ergonomics, visual consistency, and refactoring).
     - **`SPRINT_04+` Endless Loop**: Every time a Roadmap finishes, `Phase ARCHITECT` runs again automatically to audit what is missing or next highest impact (e.g., Physics & Chemistry 2BAC PC Arcade games, National Exam Boss-Rush mode, Offline PWA support, Mastery Analytics) and generates the next multi-day Roadmap — continuing indefinitely until explicitly paused by Owner Ayoub (`autoEvolutionPaused: true`).
