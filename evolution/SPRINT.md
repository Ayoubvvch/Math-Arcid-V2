# Active Sprint: SPRINT_02 — Gold Standard Unleashed (Math-Arcid-V2)

## 1. Sprint Charter & Non-Negotiable Rules
* **Target Repository**: `/home/ubuntu/Math-Arcid-V2` (`https://github.com/Ayoubvvch/Math-Arcid-V2`)
* **Strict Rule**: NEVER touch `/home/ubuntu/math-arcade` (V1 is reserved exclusively for Owner Ayoub's manual development).
* **Mandatory Reference Architecture (`evolution/GOLD_STANDARD.md`)**:
  - Every new or upgraded game MUST match the 6-module full-screen Arabic RTL architecture of `asymptote-asylum` (Topics 23–38), `sequence-strider` (Topics 39–50), and `complex-plane-duel` (Topics 51–64).
  - Minimum **2,800 lines of code** per game, **≥ 24 National Exam questions** in `js/curriculum.js` with live `graphSpec` plotting, 4 Sectors + Boss in `js/world.js`, full DualSense modal + gameplay controls in `js/controls.js`, and bespoke SVG artwork in `js/hub.js`.

---

## 2. Sprint Milestones

### [COMPLETED] Milestone 2.1: Complex Plane Citadel Gold-Standard Overhaul (`games/complex-plane-duel/`)
* Replaced the legacy 540×960 prototype with **قلعة أرغاند — Complex Plane Citadel v2.0** (3,591 LOC):
  - Full-screen 100vw × 100dvh 60FPS Argand-Cauchy Plane (`2400 × 1800`) centered at $O(0,0)$.
  - Complete **Topics 51–64 (الأعداد العقدية)** curriculum engine (`js/curriculum.js`, 24 rigorous questions + 8 Argand `graphSpec` visualizations).
  - 4 Quadrant Seals (`Q1..Q4`), Polar Hazard Orbits, Euler Phase Dash (`✕`), Conjugate Reflection (`◯`), Seal Override (`▢`), Roots-of-Unity Hexagon Barrier (`△`), Affix Plasma Cannon (`R2`), Homothety Shockwave (`L2`), and the Moivre Origin Boss (`نواة موافر`).
  - Bespoke Argand SVG tile added to `js/hub.js`.

### [NEXT — Cycle 005 Omega (17:00 UTC)] Milestone 2.2: Argand Citadel Deep Polish & Question Bank Expansion
* Expand `games/complex-plane-duel/js/curriculum.js` from 24 to 32 questions (adding deep National Exam cubic polynomial factorization $P(z) = (z - z_0)(az^2 + bz + c)$ and composite transformation problems).
* Add multi-phase Moivre Boss attack patterns (rotating $n$-th root laser spokes at Origin $O$) and DualSense haptic pulse tuning.

### [UPCOMING — Cycle 006 Alpha (05:00 UTC)] Milestone 2.3: Launch Game 6 — `limit-abyss` (هاوية النهايات والاتصال — Topics 1–22)
* **Genre**: 2D Deep-Trench Subnautic Survival & Sonar Exploration (`2560 × 1600` abyssal ocean trench).
* **Curriculum**: **Topics 1–22 (النهايات، الاتصال، مبرهنة القيم الوسيطية TVI، والدالة العكسية $f^{-1}$)**:
  - Sector 1 (Topics 1–6): Limits of polynomials, rational, irrational ($\sqrt{u}$ conjugate), and trig ($\frac{\sin x}{x}$) functions.
  - Sector 2 (Topics 7–11): One-sided limits, continuity at a point $x_0$, continuity on an interval, and composite continuity.
  - Sector 3 (Topics 12–17): Image of an interval $f(I)$, Intermediate Value Theorem (TVI $f(a)\cdot f(b) < 0$), and dichotomy/uniqueness of $\alpha$.
  - Sector 4 (Topics 18–22): Bijection theorem, inverse function $f^{-1}$, domain/monotonicity of $f^{-1}$, symmetry across $y = x$, and $n$-th root $\sqrt[n]{x}$ equations.
* **Requirements**: 6 modules (`≥ 3,200 LOC`), `<html lang="ar" dir="rtl">`, `setBidiSafeMath`, 28 questions with `graphSpec` curves (TVI root crossing, $y=x$ inverse reflection, vertical/horizontal asymptote sonar), 4 Abyssal Pressure Seals + Leviathan Discontinuity Boss, and custom SVG tile in `js/hub.js`.
