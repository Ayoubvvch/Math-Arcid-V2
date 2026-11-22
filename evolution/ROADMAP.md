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
| 10 | `quantum-casino` | **Quantum Casino — كازينو الاحتمالات الكمومي** | 2D Tactical Heist & Bullet-Time Roguelite | **Topics 103–114** (التعداد والاحتمالات وقانون برنولي) | **LIVE (Gold Standard)** |

---

## 3. SPRINT_03 Roadmap — Organization, Clean Architecture & UX Masterclass (Cycles 016–022)

Designed by **Phase `ARCHITECT` (Cycle 015 — `2026-11-21 05:00 UTC`)** after a full repository-wide codebase & UX audit (`~52.5K LOC` across 10 games, `js/hub.js`, `shared/`, `css/`, and `evolution/`):

| Cycle | Window (UTC) | Phase | Milestone | Scope & Architectural Deliverable | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **016** | 2026-11-21 17:00 | **OMEGA** | **3.1 — Unified `shared/arcade-core.js` & Hotfixes** | Ship `shared/arcade-core.js` (`window.ArcadeCore` UMD/classic script): universal `setBidiSafeMath` (full 2BAC PC glyphs + `\u0304` + sub/superscripts), DualSense radial stick deadzone + `axes[9]` D-pad hat + dual-rumble adapter, `CanvasAxisKit`, and unified `localStorage['math_arcid_v2_progress']` Progress API. Fix `vector-odyssey` missing `?from=game` exit links & pilot `ArcadeCore` in Games 9–10. | **COMPLETED (Cycle 016)** |
| **017** | 2026-11-22 05:00 | **ALPHA** | **3.2 — PS5 Hub Arabic RTL & Syllabus Reorganization** | Overhaul `index.html`, `js/hub.js`, `css/hub.css` into cohesive Arabic/Bilingual RTL console chrome (`dir="rtl"`), localize search tags & guide, and reorganize `games.json` from 10 1-game tabs into **4 Syllabus Domains** sorted strictly by **2BAC PC Order (Topics 1–114)**. | **COMPLETED (Cycle 017)** |
| **018** | 2026-11-22 17:00 | **OMEGA** | **3.3 — `ArcadeCore` Migration Batch A (Games 3–6)** | Deduplicate `setBidiSafeMath` + DualSense helpers across `limit-abyss`, `asymptote-asylum`, `sequence-strider`, and `complex-plane-duel`, and wire `ArcadeCore.Progress` topic/seal/run telemetry. | **COMPLETED (Cycle 018)** |
| **019** | 2026-11-23 05:00 | **ALPHA** | **3.4 — `ArcadeCore` Migration Batch B & `math-battle` RTL** | Deduplicate `logarithm-reactor` & `integral-forge` onto `ArcadeCore`, integrate `mathcore-survivor` legacy high-score key, and localize `games/math-battle/` (`<html lang="ar" dir="rtl">`) with telemetry & modal DualSense parity. | **PLANNED (Cycle 019)** |
| **020** | 2026-11-23 17:00 | **OMEGA** | **3.5 — PS5 Hub Mastery Telemetry & Smart Review HUD** | Wire live `localStorage` mastery telemetry into PS5 Hub rail/showcase cards (`✓ 4/4 Seals`, `🏆 Boss Cleared`, accuracy %, rank badge, Smart Review recommender, and safe JSON Export/Reset modal). | **PLANNED (Cycle 020)** |
| **021** | 2026-11-24 05:00 | **ALPHA** | **3.6 — Repo Pruning, Dead-Code Audit & Mobile/DualSense UX** | Remove redundant `standalone.html` artifacts in Games 1–2, retire unused `shared/canvas-kit.js` & `shared/math-engine.js`, verify uniform mobile touch-controls / `safe-area-inset` ergonomics / ESC & Options parity across all 10 games. | **PLANNED (Cycle 021)** |
| **022** | 2026-11-24 17:00 | **OMEGA** | **3.7 — Legacy Gate Hardening & `SPRINT_03` Closure** | Enforce zero `standalone.html`/dead-file clutter & `ArcadeCore` integration in `verify.sh`, run full 9-stage + Chromium audit, and arm Cycle 023 (`ARCHITECT`) for `SPRINT_04` (Exam Boss-Rush/PWA) & `SPRINT_05+` (Physics & Chemistry 2BAC PC). | **PLANNED (Cycle 022)** |

---

## 4. Perpetual Autonomous Evolution Protocol (Alpha / Omega / Auto-Architect)

1. **Morning Run (05:00 UTC) — Phase `ALPHA`**:
   - Reads `evolution/GOLD_STANDARD.md`, `evolution/STATE.json`, and `evolution/SPRINT.md`.
   - Executes `nextAlphaMilestone` (either constructing a new Gold-Standard 6-module game `≥ 2,800 LOC`, or executing a major Organization/UX/Platform milestone in `SPRINT_03+`).
   - Passes `bash evolution/scripts/verify.sh`, commits, and pushes to `origin main`.

2. **Evening Run (17:00 UTC) — Phase `OMEGA`**:
   - Audits the active target game/subsystem in `Math-Arcid-V2`.
   - Executes `nextOmegaMilestone` (expands question banks, adds interactive `graphSpec` plots, refines shared infrastructure / DualSense / UX polish, and audits locked 60FPS).
   - If the just-completed milestone finishes the active Sprint, marks `currentSprint.status = "COMPLETED_NEEDS_ROADMAP"` in `STATE.json`.

3. **Automatic Sprint Transition — Phase `ARCHITECT` (Infinite Self-Planning Loop)**:
   - Whenever an active Sprint finishes, `evolution/scripts/trigger.sh` automatically enters **Phase `ARCHITECT`** on the next cycle:
     - **Full Project Audit**: Scans all games, `js/hub.js`, `css/`, `shared/`, `games.json`, and `evolution/` logs to diagnose structural clutter, UX friction, and missing capabilities.
     - **`SPRINT_03` Mandate (Post-Game-10)**: Strictly prioritizes **التنظيم والترتيب وتجربة المستخدم** (Clean folder/module architecture, Hub curriculum grouping & progress persistence, unified UX/DualSense ergonomics, visual consistency, and refactoring).
     - **`SPRINT_04` Mandate (Post-Organization)**: National Exam readiness (Timed Boss-Rush Mock Mode, step-by-step Moroccan proof feedback, `weakTopics` Adaptive Review, Offline PWA).
   - **`SPRINT_05+` Endless Expansion**: Expand from Math-only into full **2BAC PC Physics & Chemistry (`الفيزياء والكيمياء`)** (Waves, Nuclear, Electricity RC/RL/RLC, Mechanics, Kinetics, Acid-Base, Cells/Electrolysis, Esterification) under `GOLD_STANDARD.md`, with bi-weekly (`<= 14 days`) forced `Phase ARCHITECT` audits continuing indefinitely until paused by Owner (`autoEvolutionPaused: true`).
