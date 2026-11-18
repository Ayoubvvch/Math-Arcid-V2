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

### [COMPLETED — Cycle 008 Omega (17:00 UTC)] Milestone 2.5: Deep Polish for Logarithm Reactor & Multi-Game Audit
* **Logarithm Reactor v1.1.0 (`games/logarithm-reactor/`, 4,678 LOC)**:
  - Fixed `override` bullet-time elevator drift by decoupling `state.worldTime += dt` from `state.time`, tuned twin bio-elevator range (`y: 490..1470`) with terminal dwell plateaus, dynamic `▲/▼/●` track indicators, direction-reversal lock, and hydraulic Web Audio cues (`playElevatorBoard`, `playElevatorDock`).
  - Added full `ln(x ≤ 0)` acid-pool physics (viscous drag, upward caustic splash burst, continuous bubble sizzle particles, `playAcidSplash` / `playAcidSizzle` Web Audio synthesis, thermal bounce with jump recovery, and safe neutralization under `△` Equivalence Aegis `e^{ln x} = x`) plus animated wave surfaces in `js/renderer.js`.
  - Upgraded the Phase 3 **Asymptote Containment Boss (`مُفاعل المقاربات الأعظم`)** with a rotating **Equivalence Root Window `α = 1`** (`shieldAngle`), projectile piercing vs solid-arc deflection (`playShieldDeflect`), shield recharge & stun windows, radial separation repulsion, and twin orthogonal Cross-Asymptote Beams.
  - Expanded `js/curriculum.js` from 32 to **39 Moroccan 2BAC PC questions** (+7 questions covering parameter discussions $e^x = mx$, $x\ln x = m$, $\ln^2 x - (m+1)\ln x + m \le 0$, $1-\frac{1}{x} \le \ln x \le x-1$, base-$a$ flip $(1/2)^x > 8$, $x e^{-x}$ inflection point, and $F(0)=0$ primitive) with **13 live `graphSpec` plots** (`log_ineq_band`, `exp_param_tangent`, `ln_param_roots`).
* **Multi-Game 60FPS Audit (All 5 Gold-Standard Titles)**:
  - Eliminated full-screen GPU `backdrop-filter: blur(...)` overhead over the 60FPS canvas in `games/limit-abyss/css/style.css`.
  - Cached `coneGrad` and `darkGrad` radial gradients in `games/asymptote-asylum/js/renderer.js` (zero per-frame gradient allocations).
  - Added full X+Y viewport culling across orbs, drones, projectiles, particles, and floating texts in `sequence-strider`, `complex-plane-duel`, `asymptote-asylum`, and `logarithm-reactor`, cached `affixStr` formatting in `complex-plane-duel`, and cached HUD element refs & boolean states across all `syncHUD()` loops.

### [COMPLETED — Cycle 009 Alpha (05:00 UTC)] Milestone 2.6: Launch Game 8 — `integral-forge` (محرقة التكامل والمعادلات — Topics 79–90)
* Built **محرقة التكامل والمعادلات — Integral Forge v1.0.0** (**4,485 LOC** across 6 modules + Molten Foundry CSS):
  - 2D Heavy Mech Siege & Area Slicer (`2600 × 1700` molten foundry) starring `TITAN-∫`, twin magnetic gantry cranes (`y: 490..1410` with terminal dwell), one-way catwalks, molten slag cooling channels with splash/sizzle physics, and 4 Foundry Wings (`α, β, γ, δ`).
  - Complete **Topics 79–90 (الدوال الأصلية، التكامل المحدود، المكاملة بالأجزاء ALPES، التفكيك و Φ(x)، حساب المساحات والحجوم، والمعادلات التفاضلية من الرتبة 1 و 2)**:
    - **30 Moroccan 2BAC PC National Exam questions** with `setBidiSafeMath` and Fisher-Yates option shuffling (`pickForgeChallenge`).
    - **10 Interactive Canvas `graphSpec` plots** (`primitive_shift`, `chasles_split`, `riemann_integral_sign`, `ipp_area_ln`, `integral_phi_deriv`, `area_below_ox`, `area_between_curves`, `volume_revolution_ox`, `ode_first_order`, `ode_second_harmonic`).
  - 3 Foundry Enemy Archetypes (`drone_riemann`, `turret_flux`, `golem_ode` with Stagger/Execute), 6 PlayStation Mech Abilities (`✕` Magnetic Double-Jump, `◯` Area Slicer Cleave `|f-g|`, `▢` Seal Override / Golem Execute, `△` Chasles Thermal Aegis `∫_a^c + ∫_c^b`, `R2` Riemann Plasma Cannon, `L2` Volume of Revolution Shockwave `π∫f² dx`), and the 3-Phase **Differential Colossus Boss (`عملاق المعادلات التفاضلية`)** featuring a rotating Characteristic Root Window `r₀` in Phase 3.
  - Registered in `games.json` with bespoke area-under-curve, solid-of-revolution & harmonic-wave SVG artwork in `js/hub.js`.

### [NEXT — Cycle 010 Omega (17:00 UTC)] Milestone 2.7: Deep Polish for Integral Forge
* Refine integration-by-parts & volume-revolution `graphSpec` visuals, boss shield & slag/crane cues, expand parameter-integral & ODE National Exam questions, DualSense feedback & 60FPS audit in `games/integral-forge/`.

### [UPCOMING — Cycle 011 Alpha (05:00 UTC)] Milestone 2.8: Launch Game 9 — `vector-odyssey` (أوديسا الفضاء المتجهي — Topics 91–102)
* **Genre**: 2.5D Starfighter Trench & Sphere Raid (`2600 × 1700` 3D-projected space sector).
* **Curriculum**: **Topics 91–102 (الهندسة الفضائية، الجداء السلمي والمتجهي، المستقيم والمستوى والفلكة $\mathbb{R}^3$)**.
* **Architecture**: 6 modules (`≥ 3,200 LOC`), RTL Arabic, ≥ 28 questions with `graphSpec`, 4 Orbital Seals + Sphere Core Boss.

### [UPCOMING — Cycle 012 Omega (17:00 UTC)] Milestone 2.9: Deep Polish for Vector Odyssey
* Upgrade 3D projection depth cues, tangent-plane intersection `graphSpec` plots, and 60FPS culling in `games/vector-odyssey/`.

### [UPCOMING — Cycle 013 Alpha (05:00 UTC)] Milestone 2.10: Launch Game 10 — `quantum-casino` (كازينو الاحتمالات الكمومي — Topics 103–114)
* **Genre**: 2D Tactical Heist & Bullet-Time Roguelite (`2560 × 1600` probability vault).
* **Curriculum**: **Topics 103–114 (التعداد، الاحتمال الشرطي، الاستقلالية، المتغير العشوائي وقانون برنولي/الحداني)**.
* **Architecture**: 6 modules (`≥ 3,200 LOC`), RTL Arabic, ≥ 28 questions with probability tree/binomial `graphSpec` plots, 4 Vault Seals + Bernoulli Syndicate Boss.

### [UPCOMING — Cycle 014 Omega (17:00 UTC)] Milestone 2.11: Deep Polish for Quantum Casino & SPRINT_02 Closure
* Finalize `quantum-casino` balance, probability visualizations, and 60FPS audit.
* **Sprint Transition Trigger**: Upon completing Cycle 014 Omega, mark `currentSprint.status = "COMPLETED_NEEDS_ROADMAP"` in `STATE.json` and clear pending tags in `SPRINT.md` so **Cycle 015 enters Phase `ARCHITECT`**, audits the full 10-game platform, and generates **`SPRINT_03` (Organization, Code Structure & UX Masterclass)** automatically.
