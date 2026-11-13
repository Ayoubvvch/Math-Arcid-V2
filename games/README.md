# 🎮 Math Arcade Games Directory

Every game in this arcade lives in its own self-contained subfolder:

```
games/
├── math-battle/
│   ├── index.html       # Standalone game runner
│   ├── style.css        # Game-specific styles
│   ├── js/              # Modular game scripts
│   └── README.md        # Math principles & rules
└── <new-game>/
```

## Guidelines for New Games:
1. **Self-Contained & Lightweight**:
   - Prefer vanilla HTML5, Canvas 2D / WebGL, and modern ES6 modules.
   - Use hardware-accelerated rendering and object pooling to avoid GC pauses on mobile devices.
2. **Back Navigation**:
   - Provide a top-left button linking back to `../../index.html` (the Math Arcade Hub).
3. **Shared Utilities**:
   - You can import shared modules from `../../shared/`:
     - `math-engine.js`: `Vector2D`, `Calculus`, `CoordinateSystem`.
     - `canvas-kit.js`: `CanvasKit.setupHiDPI`, `ParticlePool`, `drawCartesianGrid`.
     - `retro-audio.js`: Synthesized Web Audio API sound effects.
4. **Registration**:
   - Add your game metadata to `games.json` in the root folder so the Hub displays it automatically!
