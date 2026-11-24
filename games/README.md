# 🎮 Math-Arcid-V2 Games Directory

Every game inside `games/<slug>/` is a lightweight, self-contained interactive experience tailored specifically to its lesson in **`evolution/CURRICULUM.md`** (`evolution/GOLD_STANDARD.md` v3.0):

## Core Principles
1. **Unique Mechanics & Identity**: Choose whatever clean file layout (`1+` JS files, Canvas 2D / WebGL / SVG / DOM), camera, visual style, and control scheme best suits your game—never clone another game's loop, controls, or QCM popup pattern.
2. **Unified KaTeX & Platform Core (`../../shared/vendor/katex/` + `../../shared/arcade-core.js`)**:
   - Load `../../shared/vendor/katex/katex.min.css`, `../../shared/vendor/katex/katex.min.js`, and `../../shared/arcade-core.js` in every game so **zero naked math** appears anywhere:
     - `ArcadeCore.renderMath(el, text)` / `ArcadeCore.setBidiSafeMath(el, text)`: Renders LaTeX (`$...$` / `$$...$$`) and Unicode formulas with KaTeX inside `<bdi dir="ltr" class="math-ltr">`.
     - `ArcadeCore.CanvasAxisKit.drawMathRich(ctx, expr, x, y, opts)`: Draws stacked fractions, radicals, subscripts & superscripts on Canvas 2D using `KaTeX_Math`/`KaTeX_Main`.
     - `ArcadeCore.Progress.recordRun(gameId, { score, stagesCleared, totalStages, victory, accuracy })`: Persists mastery telemetry to the PS5 Hub.
     - `ArcadeCore.Gamepad`: Optional DualSense / controller helpers when appropriate for the genre.
3. **Back Navigation**: Always link back to `../../index.html?from=game` so players skip the Hub boot sequence cleanly.
4. **Registration & Gate**:
   - Add entry with unique `creativeProfile` in `games.json` and bespoke SVG tile in `js/hub.js`.
   - Run `bash evolution/scripts/verify.sh` before committing.
