# 🎮 Math-Arcid-V2 Games Directory

Every game in `Math-Arcid-V2` lives in its own self-contained subfolder under the **Gold Standard 6-Module RTL Architecture** (`evolution/GOLD_STANDARD.md`):

```
games/
├── <game-slug>/
│   ├── index.html       # Full-screen 100vw × 100dvh <html lang="ar" dir="rtl"> entry
│   ├── css/style.css    # Lightweight OLED CSS (zero backdrop-filter lag)
│   └── js/
│       ├── curriculum.js # Moroccan 2BAC PC Topics + >= 24 National Exam Qs + graphSpec
│       ├── world.js      # 60FPS arena, 4 Sector Seals, 3+ Enemy Archetypes & Boss
│       ├── renderer.js   # World renderer + live canvas graphSpec diagrams
│       ├── controls.js   # DualSense / DualShock (gameplay + modals), Keyboard & Touch
│       ├── audio.js      # Procedural Web Audio API soundscape
│       └── game.js       # Loop, HUD cache, Override modal & Progress telemetry
└── README.md
```

## Guidelines for Games:
1. **Unified Platform Core (`../../shared/arcade-core.js`)**:
   - Include `<script src="../../shared/arcade-core.js"></script>` before game scripts to use `window.ArcadeCore`:
     - `ArcadeCore.setBidiSafeMath(el, text)`: Isolates formulas (`\u0304`, sub/superscripts, sets, vectors) inside `<bdi dir="ltr" class="math-ltr">`.
     - `ArcadeCore.Gamepad`: Radial stick deadzones, Linux `axes[9]` D-Pad hat fallback, directional nav edge detection & DualSense haptics.
     - `ArcadeCore.Progress`: Persistent `localStorage['math_arcid_v2_progress']` scores, ranks, seals, accuracy & boss trophies.
     - `ArcadeCore.CanvasAxisKit`: Shared 2D grids, Cartesian axes, dashed asymptotes & LTR math labels.
   - Hub-only ES modules remain available in `../../shared/gamepad.js` and `../../shared/retro-audio.js`.
2. **Back Navigation**:
   - Always route Hub return buttons and programmatic redirects to `../../index.html?from=game` so players skip the PS5 boot curtain on return.
3. **Registration & Quality Gate**:
   - Register game metadata in `games.json` and bespoke SVG tile artwork in `js/hub.js`.
   - Run `bash evolution/scripts/verify.sh` before committing.
