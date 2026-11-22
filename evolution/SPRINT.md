# Active Sprint: SPRINT_03 — Organization, Clean Architecture & UX Masterclass

## 1. Sprint Charter & Architectural Mandate
* **Target Repository**: `/home/ubuntu/Math-Arcid-V2` (`https://github.com/Ayoubvvch/Math-Arcid-V2`)
* **Strict Boundary**: NEVER touch `/home/ubuntu/math-arcade` (V1 remains untouched for Owner Ayoub).
* **Sprint Priority (`perpetualRoadmapPolicy.sprint03Focus`)**: **التنظيم والترتيب وتجربة المستخدم** — Zero redundant game clones in this sprint; 100% focus on deduplicating ~4,300+ LOC of repeated Bidi/DualSense/Graph boilerplate across `games/*`, elevating the PS5 Console Hub to Arabic/Bilingual RTL organized by Moroccan 2BAC PC curriculum order (`Topics 1–114`), adding cross-game `localStorage` mastery telemetry, eliminating dead files & navigation bugs, and preserving the locked 60FPS Gold Standard (`zero backdrop-filter`, `zero shadowBlur`, 6-module structure).
* **Audit Snapshot Entering Cycle 016**:
  - `shared/canvas-kit.js` (149 LOC) & `shared/math-engine.js` (161 LOC) have `0` active imports; all 8 Gold Standard games duplicate custom IIFE implementations of `setBidiSafeMath` (with divergent symbol sets), `controls.js` (missing radial deadzones in 4/8 curriculum games), and HUD state caches.
  - `games.json` splits 10 titles across 10 single-game category tabs (`renderCategories()` creates 11 pills), ordered by build chronology rather than Topics `1–114`; root `index.html` chrome & search tags remain English-only (`<html lang="en">`).
  - `0 of 8` curriculum games persist progress/seals/accuracy; PS5 Hub shows no completion or mastery telemetry.
  - `games/vector-odyssey/js/game.js` (L708, L713) overrides `?from=game` exit links with raw `../../index.html`; `mathcore-survivor` and `math-battle` retain unused `standalone.html` duplicates and `<html lang="en">` UI on `math-battle`.

---

## 2. Sprint Milestones (Cycles 016–022 | 3.5 Days)

### [COMPLETED — Cycle 016 Omega (2026-11-21 17:00 UTC)] Milestone 3.1: Unified `shared/arcade-core.js` Engine & Critical Exit/Bidi Hotfixes
* **Delivered**:
  - Shipped `/home/ubuntu/Math-Arcid-V2/shared/arcade-core.js` (`window.ArcadeCore` v1.0.0 UMD/IIFE classic script):
    1. **`ArcadeCore.setBidiSafeMath`**: Unified Moroccan 2BAC PC `<bdi dir="ltr" class="math-ltr">` isolation supporting `\u0304`, vector arrows (`u⃗`), `σμλπ`, full sub/superscripts, and signed/logic/calculus operators cleanly.
    2. **`ArcadeCore.Gamepad`**: Shared `applyRadialDeadzone`, `decodeDpadHat` (`axes[9]`), `justPressed`, `snapshotButtons`, edge-triggered `sampleDirectionalNav`, `resolveActiveGamepad`, `updateBanner`, `applyFocusRing`, and DualSense dual-rumble `triggerHaptic`.
    3. **`ArcadeCore.Progress`**: Versioned `localStorage['math_arcid_v2_progress']` store tracking `bestScore`, `bestRank`, `sealsCleared`, `bossDefeated`, per-topic mastery (`recordAnswer` + `recordSealProgress` + `recordRun` with double-count guard), plus `exportJSON`/`importJSON`/`resetAll`.
    4. **`ArcadeCore.CanvasAxisKit`**: Shared `clearWithGrid`, `drawCartesianAxes`, `drawDashedLine`, and `drawMathLabel`.
  - **Pilot Migrations & Exit Bugfix (`vector-odyssey` v1.2.0 & `quantum-casino` v1.2.0)**:
    - Fixed `games/vector-odyssey/js/game.js` (`btnExitHubPause` / `btnHubEnd` -> `../../index.html?from=game`) eliminating boot-screen replays on Hub return.
    - Wired `<script src="../../shared/arcade-core.js"></script>` across Games 9–10 (`game.js`, `controls.js`, `renderer.js`), deduplicating ~250 LOC cleanly (`vector-odyssey` 5,288 LOC, `quantum-casino` 5,136 LOC) and persisting live runs/seals/questions.
    - Updated `games/README.md` & root `index.html` contributor modal cleanly to document `shared/arcade-core.js`.

### [COMPLETED — Cycle 017 Alpha (2026-11-22 05:00 UTC)] Milestone 3.2: PS5 Console Hub Arabic RTL & 2BAC PC Syllabus Reorganization
* **Target**: `index.html`, `js/hub.js`, `css/hub.css`, `css/common.css`, `games.json`
* **Delivered**:
  - Transformed root [index.html](file:///home/ubuntu/Math-Arcid-V2/index.html) into cohesive Arabic RTL PS5 console chrome (`<html lang="ar" dir="rtl">`, loaded `Cairo` font in `css/common.css`, localized boot screen, topbar, showcase, DualSense footer legend, Quick Search modal with 9 Moroccan 2BAC PC topic pills, Game Details modal, and Contributor Guide, plus `<script src="shared/arcade-core.js"></script>`).
  - Reorganized [games.json](file:///home/ubuntu/Math-Arcid-V2/games.json) from 10 fragmented 1-game category strings into **4 clean 2BAC PC Syllabus Domains** (`التحليل والدوال`, `الأعداد العقدية والفضاء`, `التعداد والاحتمالات`, `الأساسيات والتقويم`) ordered strictly monotonically by curriculum syllabus **`Topics 1 → 114`** (`limit-abyss` -> `asymptote-asylum` -> `sequence-strider` -> `complex-plane-duel` -> `logarithm-reactor` -> `integral-forge` -> `vector-odyssey` -> `quantum-casino`) followed by Foundations (`mathcore-survivor`, `math-battle`), with bilingual `keywords` & `topicRange`.
  - Upgraded [js/hub.js](file:///home/ubuntu/Math-Arcid-V2/js/hub.js) & [css/hub.css](file:///home/ubuntu/Math-Arcid-V2/css/hub.css) with RTL-aware `ArrowLeft`/`ArrowRight` + DualSense directional navigation, ordered Arabic category tabs (`L1/R1`), `<bdi dir="ltr">` `ArcadeCore.setBidiSafeMath` rendering in Showcase/Modals, logical CSS properties (`inset-inline-*`, `margin-inline-start`, `padding-inline-start`), zero `backdrop-filter`, and all 10 custom SVG tiles preserved 100%.

### [NEXT — Cycle 018 Omega (2026-11-22 17:00 UTC)] Milestone 3.3: `ArcadeCore` Migration Batch A (Games 3–6)
* **Target**: `games/limit-abyss/`, `games/asymptote-asylum/`, `games/sequence-strider/`, `games/complex-plane-duel/`
* **Deliverables**:
  - Integrate `<script src="../../shared/arcade-core.js"></script>` across all 4 titles.
  - Replace local `setBidiSafeMath` / `window.setSeqBidiSafeMath` copies with `ArcadeCore.setBidiSafeMath` and unify DualSense helpers (`applyRadialDeadzone`, `decodeDpadHat`, `sampleDirectionalNav`, `triggerHaptic`) onto `ArcadeCore.Gamepad` (keeping all existing gameplay physics & controls intact).
  - Wire `ArcadeCore.Progress` recording (`recordSealProgress`, `recordAnswer` with `topic` for weak-topic tracking, `recordRun` with Boss defeat & rank) into all 4 games.
  - Verify all 6 modules, Fisher-Yates shuffling, >=2,800 LOC, locked 60FPS, and all 9 stages of `verify.sh`.

### [UPCOMING — Cycle 019 Alpha (2026-11-23 05:00 UTC)] Milestone 3.4: `ArcadeCore` Migration Batch B & `math-battle` Arabic RTL Upgrade
* **Target**: `games/logarithm-reactor/`, `games/integral-forge/`, `games/mathcore-survivor/`, `games/math-battle/`
* **Deliverables**:
  - Integrate `shared/arcade-core.js` into `logarithm-reactor` and `integral-forge` (deduplicating `setBidiSafeMath` & DualSense boilerplate and wiring `ArcadeCore.Progress`).
  - Connect `mathcore-survivor` (migrating/bridging its existing `localStorage` high-score seamlessly) and `math-battle` to `ArcadeCore.Progress`.
  - Localize `games/math-battle/` (`<html lang="ar" dir="rtl">`, HUD/modals/buttons/Arabic calculus prompts) to match the unified platform UX standard and confirm full DualSense modal + gameplay consistency across Games 1–2.

### [UPCOMING — Cycle 020 Omega (2026-11-23 17:00 UTC)] Milestone 3.5: PS5 Hub Mastery Telemetry Dashboard & Smart Review UX
* **Target**: `js/hub.js`, `css/hub.css`, `index.html`, `shared/arcade-core.js`
* **Deliverables**:
  - Surface live `ArcadeCore.Progress` telemetry inside the PS5 Hub without violating 60FPS GPU rules (`zero backdrop-filter`):
    - Render mastery rings, `✓ 4/4 أختام` badges, `🏆 الزعيم مهزوم` trophies, rank (`S/A/B`), and question accuracy `%` directly on Game Rail Tiles and Showcase cards.
    - Add a Topbar **2BAC PC Mastery Summary** (`X/10` Bosses Cleared, global accuracy `%`, total mastered questions) + one-click **Smart Review Filter (`المراجعة الذكية`)** recommending unplayed or low-accuracy units.
    - Add an accessible **Progress Backup / Reset Modal** (export/import JSON telemetry or safe double-confirm reset via DualSense & mouse/keyboard).

### [UPCOMING — Cycle 021 Alpha (2026-11-24 05:00 UTC)] Milestone 3.6: Legacy Pruning, Dead-Code Consolidation & Mobile/DualSense UX Polish
* **Target**: Repository root, `shared/`, `games/mathcore-survivor/`, `games/math-battle/`, and responsive/touch CSS across all 10 games
* **Deliverables**:
  - Remove duplicate/unlinked `games/mathcore-survivor/standalone.html` and `games/math-battle/standalone.html`; consolidate inner README notes cleanly into root `README.md` and `games/README.md`.
  - Audit `shared/` to remove unused `shared/canvas-kit.js` & `shared/math-engine.js` (0 references) and migrate `js/hub.js` onto `ArcadeCore.Gamepad` cleanly if appropriate.
  - Execute a responsive & ergonomics sweep across all 10 games (`390×844` mobile touch buttons, `safe-area-inset-*`, `1280×720` & `1920×1080` desktop HUD non-overlap, Escape/Options pause parity, and instant `?from=game` return).

### [UPCOMING — Cycle 022 Omega (2026-11-24 17:00 UTC)] Milestone 3.7: Final `SPRINT_03` Audit, Legacy Clutter Gate & `SPRINT_04` Arming
* **Target**: `evolution/scripts/verify.sh`, `evolution/GOLD_STANDARD.md`, `STATE.json`, `SPRINT.md`
* **Deliverables**:
  - Add anti-legacy checks to `evolution/scripts/verify.sh` (fail on leftover `standalone.html` or dead unimported `shared/*.js` modules, enforce `ArcadeCore` script inclusion across all games).
  - Run full 9-stage gate + Headless Chromium sweep across all 11 pages.
  - Close `SPRINT_03` (`currentSprint.status = "COMPLETED_NEEDS_ROADMAP"`, `nextCycleNumber: 23`) to arm **Phase `ARCHITECT`** for `SPRINT_04` (National Exam Boss-Rush & PWA) followed by `SPRINT_05+` (Physics & Chemistry 2BAC PC).
