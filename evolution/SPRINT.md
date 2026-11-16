# Active Sprint: SPRINT_02 — Gold Standard Unleashed (Math-Arcid-V2)

## 1. Sprint Charter & Non-Negotiable Rules
* **Target Repository**: `/home/ubuntu/Math-Arcid-V2` (`https://github.com/Ayoubvvch/Math-Arcid-V2`)
* **Strict Rule**: NEVER touch `/home/ubuntu/math-arcade` (V1 is reserved exclusively for Owner Ayoub's manual development).
* **Mandatory Reference Architecture (`evolution/GOLD_STANDARD.md`)**:
  - Every new or upgraded game MUST match the 6-module full-screen Arabic RTL architecture of `asymptote-asylum` (Topics 23–38), `sequence-strider` (Topics 39–50), `complex-plane-duel` (Topics 51–64), and `limit-abyss` (Topics 1–22).
  - Minimum **2,800 lines of code** per game, **≥ 24 National Exam questions** in `js/curriculum.js` with live `graphSpec` plotting, 4 Sectors + Boss in `js/world.js`, full DualSense modal + gameplay controls in `js/controls.js`, and bespoke SVG artwork in `js/hub.js`.

---

## 2. Sprint Milestones

### [COMPLETED] Milestone 2.1: Complex Plane Citadel Gold-Standard Overhaul (`games/complex-plane-duel/`)
* Replaced the legacy 540×960 prototype with **قلعة أرغاند — Complex Plane Citadel v2.0** (3,591 LOC):
  - Full-screen 100vw × 100dvh 60FPS Argand-Cauchy Plane (`2400 × 1800`) centered at $O(0,0)$.
  - Complete **Topics 51–64 (الأعداد العقدية)** curriculum engine (`js/curriculum.js`, 24 rigorous questions + 8 Argand `graphSpec` visualizations).
  - 4 Quadrant Seals (`Q1..Q4`), Polar Hazard Orbits, Euler Phase Dash (`✕`), Conjugate Reflection (`◯`), Seal Override (`▢`), Roots-of-Unity Hexagon Barrier (`△`), Affix Plasma Cannon (`R2`), Homothety Shockwave (`L2`), and the Moivre Origin Boss (`نواة موافر`).
  - Bespoke Argand SVG tile added to `js/hub.js`.

### [COMPLETED] Milestone 2.3: Launch Game 6 — `limit-abyss` (هاوية النهايات والاتصال — Topics 1–22)
* Built **هاوية النهايات والاتصال — Limit Abyss v1.0.0** (**4,012 LOC**):
  - 2D Deep-Trench Subnautic Survival & Sonar Exploration (`2560 × 1600` abyssal Mariana trench with 4 stratified depth sectors).
  - Pilot the submersible `Nautilus-ε` equipped with Hydro-Jet boost (`✕`), Sub-Vortex Evasion (`◯`), Pressure Seal Override (`▢`), Continuity Sonar Ping (`△`), Conjugate Torpedo (`R2`), and TVI Overdrive Shockwave (`L2`).
  - Complete **Topics 1–22 (النهايات، الاتصال، مبرهنة القيم الوسيطية TVI، والدالة العكسية $f^{-1}$)**:
    - 28 Moroccan National Exam questions with `setBidiSafeMath`.
    - 8 interactive HTML5 Canvas `graphSpec` visualizers (`spec_conjugate_hole`, `spec_trig_limit`, `spec_step_discontinuity`, `spec_piecewise_continuity`, `spec_interval_image`, `spec_tvi_roots`, `spec_inverse_reflection`, `spec_nth_root`).
  - 4 Abyssal Pressure Seals (`ختم الشفق`, `ختم الظلام`, `ختم الهاوية`, `ختم خندق الهدال`) + Leviathan Discontinuity Boss (`لوفياثان الانقطاع العظيم`).
  - Bespoke multi-layered SVG tile in `js/hub.js` with glowing sonar caustics.
  - Passed all 7 stages of the Ironclad Quality Gate (`evolution/scripts/verify.sh`).

### [NEXT — Cycle 005 Omega (17:00 UTC)] Milestone 2.2: Dual Deep Polish (Limit Abyss & Argand Citadel)
* Fine-tune Mariana Leviathan Phase 3 TVI shield collision and synthesize deep-ocean acoustic soundscape nuances in `games/limit-abyss/`.
* Expand `games/complex-plane-duel/js/curriculum.js` from 26 to 32 questions (adding deep National Exam cubic polynomial factorization $P(z) = (z - z_0)(az^2 + bz + c)$ and composite transformation problems).

### [UPCOMING — Cycle 006 Alpha (05:00 UTC)] Milestone 2.4: Launch Game 7 — `logarithm-reactor` (مفاعل اللوغاريتم والأسي — Topics 65–78)
* **Genre**: 2D Bio-Cyber Metroidvania Lab (`2800 × 1800` containment facility).
* **Curriculum**: **Topics 65–78 (الدوال اللوغاريتمية والأسية، حل المعادلات والمتراجحات، النهايات الأساسية والمقارنة الإضافية)**.
* **Architecture**: 6 modules (`≥ 3,200 LOC`), RTL Arabic, 28 questions with `graphSpec`, 4 core containment seals + Asymptote Containment Boss.
