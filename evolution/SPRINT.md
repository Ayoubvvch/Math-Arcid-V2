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

### [NEXT — Cycle 016 Omega (2026-11-21 17:00 UTC)] Milestone 3.1: Unified `shared/arcade-core.js` Engine & Critical Exit/Bidi Hotfixes
* **Deliverables**:
  - Build `shared/arcade-core.js` (`window.ArcadeCore` — clean classic UMD/IIFE browser script passing `node -c` cleanly and usable without ESM conversion across all 10 games):
    1. **Universal `ArcadeCore.setBidiSafeMath(el, text)`**: Combines `\u0304` macrons (`ĀB̄D̄M̄`), Greek/math operators (`σμλπ∑∏∫ΦΩΔαβγδ`), full Unicode sub/superscripts (`₀-₉⁰-⁹⁻⁺ₙₚₖᵢ`), and vector/set glyphs (`ℝℚℕℂ∧·⊥∪∩∈∉∅∞√°±≤≥≠≈≡×÷→⇒⇔∀∃⊂⊃`) so zero formulas ever fracture in RTL across any of the 10 games.
    2. **Unified `ArcadeCore.Gamepad` Calibration**: Provides standardized `applyRadialDeadzone(lx, ly, threshold = 0.18)`, W3C button + `axes[9]` D-pad hat decoding, safe `triggerHaptic(duration, weak, strong)`, and connection indicator helpers.
    3. **`ArcadeCore.Progress` Telemetry Store**: Clean `localStorage['math_arcid_v2_progress']` schema tracking per-game `bestScore`, `bestRank`, `sealsCleared` (`0..4`), `bossDefeated` (bool), `questionsAttempted`, `questionsCorrect`, `lastPlayed`, and aggregate 2BAC PC stats.
    4. **`ArcadeCore.CanvasAxisKit`**: Lightweight shared Cartesian axis, dashed asymptote, and crisp `direction = 'ltr'` label renderer for live `graphSpec` canvases.
  - **Immediate Pilot & Bugfix**:
    - Fix `games/vector-odyssey/js/game.js` (lines 708 & 713) so `btnExitHubPause` and `btnHubEnd` navigate to `../../index.html?from=game` (no unwanted 1.4s boot screen replay).
    - Wire `<script src="../../shared/arcade-core.js"></script>` into `vector-odyssey` and `quantum-casino`, migrating `setBidiSafeMath`, DualSense radial deadzone calibration, and recording live run telemetry via `ArcadeCore.Progress`.
    - Update `games/README.md` & `index.html` contributor instructions to reference `shared/arcade-core.js`.

### [UPCOMING — Cycle 017 Alpha (2026-11-22 05:00 UTC)] Milestone 3.2: PS5 Console Hub Arabic RTL & 2BAC PC Syllabus Reorganization
* **Target**: `index.html`, `js/hub.js`, `css/hub.css`, `games.json`
* **Deliverables**:
  - Upgrade `index.html` to cohesive Arabic/Bilingual RTL console chrome (`<html lang="ar" dir="rtl">` preserving locked 60FPS `Zero backdrop-filter` CSS & PS5 dual-rail layout): localize navigation chrome, Search Modal quick tags (Arabic 2BAC PC chapters), Boot copy, and DualSense control guide.
  - Reorganize `games.json` into **4 clean, pedagogical 2BAC PC Domains** sorted strictly in Moroccan curriculum progression (`Topics 1 → 114`):
    1. `الأساسيات والتقويم` (Foundations: `mathcore-survivor`, `math-battle`)
    2. `التحليل والدوال` (`Topics 1–50 & 65–90`: `limit-abyss`, `asymptote-asylum`, `sequence-strider`, `logarithm-reactor`, `integral-forge`)
    3. `الأعداد العقدية والفضاء` (`Topics 51–64 & 91–102`: `complex-plane-duel`, `vector-odyssey`)
    4. `التعداد والاحتمالات` (`Topics 103–114`: `quantum-casino`)
  - Upgrade `js/hub.js` rail cards, showcase metadata, and DualSense `L1`/`R1` category switching cleanly so all 10 `getGameArtworkSVG` bespoke tiles remain intact alongside clear `الدرس XX–XX` curriculum pills and zero RTL layout glitches.

### [UPCOMING — Cycle 018 Omega (2026-11-22 17:00 UTC)] Milestone 3.3: `ArcadeCore` Migration Batch A (Games 3–6)
* **Target**: `games/limit-abyss/`, `games/asymptote-asylum/`, `games/sequence-strider/`, `games/complex-plane-duel/`
* **Deliverables**:
  - Integrate `shared/arcade-core.js` across all 4 titles.
  - Replace local `setBidiSafeMath` / `window.setSeqBidiSafeMath` copies with `ArcadeCore.setBidiSafeMath`.
  - Fix missing analog stick deadzone calibration in `sequence-strider/js/controls.js` and `complex-plane-duel/js/controls.js` via `ArcadeCore.Gamepad` while standardizing `limit-abyss` & `asymptote-asylum`.
  - Wire `ArcadeCore.Progress` recording (per-seal unlock, answer accuracy, Boss defeat, best score) into all 4 games and verify all 6 modules + >=2,500 LOC + locked 60FPS.

### [UPCOMING — Cycle 019 Alpha (2026-11-23 05:00 UTC)] Milestone 3.4: `ArcadeCore` Migration Batch B & `math-battle` Arabic RTL Upgrade
* **Target**: `games/logarithm-reactor/`, `games/integral-forge/`, `games/mathcore-survivor/`, `games/math-battle/`
* **Deliverables**:
  - Integrate `shared/arcade-core.js` into `logarithm-reactor` and `integral-forge` (fixing missing radial deadzones in both `controls.js`, unifying `setBidiSafeMath`, and persisting `ArcadeCore.Progress` run stats).
  - Connect `mathcore-survivor` (migrating/bridging its existing `localStorage` high-score seamlessly) and `math-battle` to `ArcadeCore.Progress`.
  - Localize `games/math-battle/` (`<html lang="ar" dir="rtl">`, HUD/modals/buttons/Arabic calculus prompts) to match the unified platform UX standard and confirm full DualSense modal + gameplay consistency across Games 1–2.

### [UPCOMING — Cycle 020 Omega (2026-11-23 17:00 UTC)] Milestone 3.5: PS5 Hub Mastery Telemetry Dashboard & Smart Review UX
* **Target**: `js/hub.js`, `css/hub.css`, `index.html`, `shared/arcade-core.js`
* **Deliverables**:
  - Surface live `ArcadeCore.Progress` telemetry inside the PS5 Hub without violating 60FPS GPU rules (`zero backdrop-filter`):
    - Render mastery rings, `✓ 4/4 أختام` badges, `🏆 الزعيم مهزوم` trophies, rank (`S/A/B`), and question accuracy `%` directly on Game Rail Tiles and Showcase cards.
    - Add a Topbar **2BAC PC Mastery Summary** (`X/10` Bosses Cleared, global accuracy `%`, total mastered questions) + one-click **Smart Review Filter (`المراجعة الذكية`)** recommending unplayed or low-accuracy chapters.
    - Add an accessible **Progress Backup / Reset Modal** (export/import JSON telemetry or safe double-confirm reset via DualSense & mouse/keyboard).

### [UPCOMING — Cycle 021 Alpha (2026-11-24 05:00 UTC)] Milestone 3.6: Legacy Pruning, Dead-Code Consolidation & Mobile/DualSense UX Polish
* **Target**: Repository root, `shared/`, `games/mathcore-survivor/`, `games/math-battle/`, and responsive/touch CSS across all 10 games
* **Deliverables**:
  - Remove duplicate/unlinked `games/mathcore-survivor/standalone.html` and `games/math-battle/standalone.html`; consolidate inner README notes cleanly into root `README.md` and `games/README.md`.
  - Audit `shared/` to ensure zero dead unused files (either migrate/wrap useful `CanvasKit`/`Calculus` helpers or remove unused ESM remnants once `js/hub.js` & `shared/arcade-core.js` form a crystal-clear, documented shared layer).
  - Execute a responsive & ergonomics sweep across all 10 games (`390×844` mobile touch buttons, `safe-area-inset-*`, `1280×720` & `1920×1080` desktop HUD non-overlap, Escape/Options pause parity, and instant `?from=game` return).

### [UPCOMING — Cycle 022 Omega (2026-11-24 17:00 UTC)] Milestone 3.7: Ironclad 8-Stage `verify.sh` Upgrade & `SPRINT_03` Closure
* **Target**: `evolution/scripts/verify.sh`, `evolution/GOLD_STANDARD.md`, `STATE.json`, `SPRINT.md`
* **Deliverables**:
  - Harden `evolution/scripts/verify.sh` with **Stage 8 (Platform Integrity & UX Regression Gate)**: verify `shared/arcade-core.js` syntax and integration, fail on any `location.href = '../../index.html'` missing `?from=game`, fail on leftover `standalone.html` clutter, verify domain categories (`<= 5`), and check zero CSS `backdrop-filter` regressions.
  - Run full Node + Playwright/DOM sanity verification across the Hub and all 10 games.
  - Close `SPRINT_03` (`currentSprint.status = "COMPLETED_NEEDS_ROADMAP"`, `nextCycleNumber: 23`) to arm **Phase `ARCHITECT`** for `SPRINT_04`.
