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

### [COMPLETED — Cycle 006 Omega (17:00 UTC)] Milestone 2.2: Dual Deep Polish (Limit Abyss & Argand Citadel)
* **Limit Abyss v1.1.0 (`games/limit-abyss/`, 4,616 LOC)**:
  - Implemented full 3-Phase Mariana Leviathan Boss state machine (`Phase 1: Void Spikes`, `Phase 2: Discontinuity Beams (lim⁻ ≠ lim⁺)`, `Phase 3: TVI Resonance Shield f(a)·f(b) < 0` with rotating Root Windows `α` where `f(α) = 0`).
  - Fine-tuned Phase 3 TVI shield collision: torpedo deflection off solid arcs, piercing through rotating `α` root windows, radial submarine repulsion preventing entrapment, and `△` Sonar / `L2` Shockwave shield shattering + unified `damageBoss` victory trigger.
  - Upgraded `js/audio.js` with depth-adaptive dual-oscillator drone (`setDepthRatio`), reusable hydrophone noise buffer cavitation, thermal vent bubble chimes (`playBubblePop`), trench creaks, beam charge/fire, and Web Audio timeline echoes (zero timer leaks).
  - Fixed DualSense modal polling bug in `js/game.js` (`pollInput()` now runs even while paused/modals open), added Fisher-Yates option shuffling (`pickLimitChallenge`), DualSense haptics + analog triggers + D-Pad hat fallback (`js/controls.js`), and eliminated per-frame gradients and `shadowBlur` in `js/renderer.js` for locked 60FPS.
* **Argand Citadel v2.1.0 (`games/complex-plane-duel/`, 3,792 LOC)**:
  - Expanded `js/curriculum.js` from 26 to **32 Moroccan 2BAC PC questions** adding cubic polynomial factorization $P(z) = (z - z_0)(az^2 + bz + c)$ (real and complex coefficients), composite transformations ($T_{\vec{u}} \circ R$ and order sensitivity $R \circ T$), weighted barycenter affixes, and pure-imaginary diameter circle loci.
  - Upgraded `js/renderer.js` to **12 interactive `graphSpec` plots** (adding dedicated `half_angle_chord`, `cubic_roots`, `composite_transform`, and `diameter_circle`), full Y-axis drone culling, and dynamic RTL/LTR floating text direction.

### [COMPLETED — Cycle 007 Alpha (05:00 UTC)] Milestone 2.4: Launch Game 7 — `logarithm-reactor` (مفاعل اللوغاريتم والأسي — Topics 65–78)
* Built **مفاعل اللوغاريتم والأسي — Logarithm Reactor v1.0.0** (**4,183 LOC** across 6 modules + Bio-Cyber CSS):
  - 2D Bio-Cyber Metroidvania Lab (`2800 × 1800` facility) with one-way drop-through catwalks, twin vertical bio-elevators, `ln(x ≤ 0)` acid pools, and 4 Containment Wings (`α, β, γ, δ`).
  - Complete **Topics 65–78 (الدوال اللوغاريتمية والأسية، المعادلات والمتراجحات، المشتقات والأصلية، النمو المقارن والفروع اللانهائية)**:
    - **32 Moroccan 2BAC PC National Exam questions** with `setBidiSafeMath` and Fisher-Yates option shuffling (`pickReactorChallenge`).
    - **10 Interactive Canvas `graphSpec` plots** (`ln_domain_band`, `primitive_area_inv`, `ln_curve_tangent`, `ln_abs_both_sides`, `exp_ln_symmetry`, `exp_quad_roots`, `exp_tangent_bound`, `growth_comparison`, `ln_branch_parabolic`, `exp_parabolic_y`).
  - 6 PlayStation abilities (`✕` Double-Jump Thruster, `◯` Phase Dash, `▢` Seal Override / Execute, `△` Bio-Aegis `e^{ln x}=x`, `R2` Derivative Beam `u'/u`, `L2` Growth-Comparison Shockwave `e^x ≫ xⁿ`) + 3-Phase Asymptote Containment Boss (`مُفاعل المقاربات الأعظم`).
  - Registered in `games.json` with bespoke exponential/logarithmic symmetry SVG tile in `js/hub.js`.

### [NEXT — Cycle 008 Omega (17:00 UTC)] Milestone 2.5: Deep Polish for Logarithm Reactor & Multi-Game Audit
* Refine `logarithm-reactor` elevator & Phase 3 shield mechanics, add acid-pool splash/sizzle Web Audio synthesis, expand National Exam `ln/exp` parameter-discussion questions, and audit 60FPS performance across all 5 Gold-Standard curriculum titles.

### [UPCOMING — Cycle 009 Alpha (05:00 UTC)] Milestone 2.6: Launch Game 8 — `integral-forge` (محرقة التكامل والمعادلات — Topics 79–90)
* **Genre**: 2D Heavy Mech Siege & Area Slicer (`2600 × 1700` industrial foundry).
* **Curriculum**: **Topics 79–90 (الدوال الأصلية، التكامل بالأجزاء، حساب المساحات والحجوم، والمعادلات التفاضلية)**.
* **Architecture**: 6 modules (`≥ 3,200 LOC`), RTL Arabic, ≥ 28 questions with `graphSpec`, 4 Foundry Seals + Differential Reactor Boss.
