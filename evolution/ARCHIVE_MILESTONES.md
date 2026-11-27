# Math Arcade: Permanent Milestone Archive

## REBOOT_SPRINT_01 — Creative Rebirth & Charter v4.0 Real-Time Pivot (Cycles 001–008 | Nov 24–26, 2026)
* **Curriculum Built (4 of 11 Lessons — Skills 1–62)**:
  1. **`sequence-weaver` (Lesson 3: المتتاليات العددية | 41–52)** — Initially built as a cobweb/bounds puzzle in Cycles 001–002, then emergency-rebuilt as a 5-mode real-time arcade (`v2.0.0`) in Cycle 004.
  2. **`continuity-rider` (Lesson 1: النهايات والاتصال | 1–22)** — Initially built as a track/bisection puzzle in Cycle 003, then emergency-rebuilt as a 5-sector curve-skater (`v2.0.0`) in Cycle 004.
  3. **`tangent-prism` v1.1.0 (Lesson 2: الاشتقاق ودراسة الدوال | 23–40)** — Built in Cycle 005 & deeply polished in Cycle 006: split optical-bench atelier with live $f'/f''$ scope, 5 real-time observatories (22 waves), zero spoilers, full DualSense parity (**Architect Grade: A-**).
  4. **`log-pulse` v1.1.0 (Lesson 4: الدوال اللوغاريتمية | 53–62)** — Built in Cycle 007 & deeply polished in Cycle 008: full-bleed abyssal bathyscaphe polar sonar with log-frequency audio, 5 operations (15 waves), zero spoilers, single-screen mobile `390px` ergonomics (**Architect Grade: A+**).
* **Platform Infrastructure Upgrades Shipped**:
  * Upgraded Charter to **`GOLD_STANDARD.md` v4.0** (permanently banning passive `<input type="range">` GeoGebra slider applets and requiring real-time action gameplay + full DualSense parity).
  * Deployed unified **`ArcadeCore.PauseMenu.attach`** (`Start(9)` / `Esc` -> Resume / Restart / Exit to Hub) & **`ArcadeCore.Gamepad.sampleAnalogAxes`** in `shared/arcade-core.js`.
  * Built **`evolution/scripts/playtest_cdp.py`**: live Headless Chromium CDP interactive playtester verifying KaTeX, live animated `<canvas>`, simulated DualSense `Start(9)` PauseMenu, mobile `390px` overflow, and desktop/mobile PNG screenshot capture.
* **Cycle 009 Truthful Architect Post-Mortem**:
  * **Platform Hub Bugs Caught & Fixed Immediately**: Fixed `.tile-badge-pill` (`dir="ltr"`) overlapping the `0%` `.tile-ring-badge`, fixed 55-char `.tile-lvl` captions smashing across cards and leaking raw `$...$` LaTeX, tightened `1280×800` showcase/footer spacing, added accurate `totalStages` metadata, and upgraded `playtest_cdp.py` with automated Hub bounding-box collision & mobile overflow guards.
  * **Unpolished Rebuild Debt Identified**: Because `sequence-weaver` v2.0 and `continuity-rider` v2.0 were rebuilt simultaneously in Cycle 004 without subsequent POLISH cycles, both shipped with critical defects (`sequence-weaver` Stage 3 mathematically unwinnable ~67% of notes + color-spoilers + mouse hijack + missing Skills 44/46/50/52; `continuity-rider` Sector 4 fake random TVI spoilers + empty Sector 5 $f^{-1}$/$\sqrt[n]{x}$ + missing Skills 6/10/11/13–14/17; plus a shared 91-line UI shell clone). Both were scheduled as **priority overhaul cycles (Cycles 010–011)** at the head of `REBOOT_SPRINT_02`.

---

## Reboot V3 — Creative Reset (Nov 24, 2026)
* At Owner Ayoub's explicit directive, the 8 lookalike 6-module QCM-gate clones (`limit-abyss`, `asymptote-asylum`, `sequence-strider`, `complex-plane-duel`, `logarithm-reactor`, `integral-forge`, `vector-odyssey`, `quantum-casino`) and `mathcore-survivor` were purged cleanly.
* Retained **`math-battle`** as the sole Genesis classic (pure `d/dx` differential-operator arcade combat).
* Replaced the rigid clone charter with **`evolution/GOLD_STANDARD.md` v3.0 (Unleashed Creative Charter)** and installed the verified official 11-lesson, 137-skill Moroccan 2BAC PC curriculum in **`evolution/CURRICULUM.md`**, launching fresh from **Lesson 3: المتتاليات العددية (`Suites Numériques`, Skills 41–52)**.

---

## Pre-Reboot Archive (V1 & V2 | Nov 13–23, 2026 | Legacy Sprints 01–03)
* **2026-11-13**: Platform established with PS5 Console Hub Launcher (`index.html`, `js/hub.js`, `css/hub.css`), procedural Web Audio (`shared/retro-audio.js`), Gamepad engine (`shared/gamepad.js`), and Genesis `math-battle` (`d/dx` differentiation arcade).
* **2026-11-14 – 2026-11-20 (`SPRINT_01`–`SPRINT_02`)**: Built 8 curriculum games using the former 6-module template; retired during Reboot V3 due to gameplay/UI homogenization.
* **2026-11-21 – 2026-11-23 (`SPRINT_03` Cycles 015–020)**: Shipped unified `shared/arcade-core.js` (`setBidiSafeMath`, `Gamepad`, `Progress`, `CanvasAxisKit`), Arabic RTL PS5 Hub, Smart Review filter & Progress modal, and self-healing worker orchestration (`trigger.sh`, `verify.sh`).
