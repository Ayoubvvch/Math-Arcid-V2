# ⚡ MATH-ARCID-V2 (Creative Mathematical Gaming Console)

> **منصة ألعاب تعليمية تفاعلية لمقرر الرياضيات 2BAC PC (11 درساً • 137 مهارة)**  
> 🎮 **Play Live**: **[https://ayoubvvch.github.io/Math-Arcid-V2/](https://ayoubvvch.github.io/Math-Arcid-V2/)**  
> 📦 **GitHub**: **[https://github.com/Ayoubvvch/Math-Arcid-V2](https://github.com/Ayoubvvch/Math-Arcid-V2)**

---

## 🌟 Philosophy (Reboot V3 — Math-IS-The-Gameplay)
**Math-Arcid-V2** transforms each lesson of the Moroccan **2BAC PC** official syllabus (`evolution/CURRICULUM.md`, 11 lessons / 137 skills) into a **distinct, lightweight, genuinely fun game** where mathematical laws *are* the gameplay mechanics—not recycled quiz popups:
- **Zero-Clone Diversity (`creativeProfile`)**: Every lesson gets its own genre, camera, art style, and natural control scheme.
- **RTL Arabic & Lossless Math (`ArcadeCore.setBidiSafeMath`)**: Seamless Arabic UI with clean LTR math formula isolation.
- **Cross-Game Mastery Hub (`ArcadeCore.Progress`)**: Tracks progress, ranks, accuracy, and Smart Review directly on the PS5-inspired launcher.

---

## 🎮 Live Games Catalog

| Game | Domain & Lesson | Creative Genre | Play |
| :--- | :--- | :--- | :--- |
| **Math Battle — نزال المشتقات التفاضلي** | الأساسيات • الاشتقاق (`d/dx`) | Bullet-Hell Operator Arena (`xⁿ`, `sin`, `eˣ`) | [Play Live](https://ayoubvvch.github.io/Math-Arcid-V2/games/math-battle/) |

*(New original games are autonomously researched, built, playtested, and added twice daily starting with **Lesson 3: المتتاليات العددية**.)*

---

## 🏗️ Project Structure

```text
Math-Arcid-V2/
├── index.html                  # PS5-inspired Console Hub Launcher (RTL Arabic + DualSense)
├── games.json                  # Dynamic catalog + creativeProfile anti-clone registry
├── css/                        # Shared OLED tokens & Hub layout (zero backdrop-filter)
├── js/hub.js                   # Launcher controller, bespoke SVGs & progress telemetry
├── shared/
│   ├── arcade-core.js          # Bidi math isolation, Gamepad utils, Progress & CanvasAxisKit
│   ├── gamepad.js              # Hub ES module gamepad controller
│   └── retro-audio.js          # Web Audio API procedural synthesizer
├── games/
│   └── math-battle/            # Genesis calculus operator arcade (retained classic)
└── evolution/                  # Unleashed Creative Autonomous Engine (Reboot V3)
    ├── CURRICULUM.md           # Official 11-lesson / 137-skill 2BAC PC curriculum & limits
    ├── GOLD_STANDARD.md        # Unleashed Creative Charter (Zero-Clone / Math-as-Gameplay)
    ├── ROADMAP.md              # 11-lesson progression starting with Sequences (Lesson 3)
    ├── SPRINT.md               # Active sprint milestones (CREATE / POLISH)
    ├── STATE.json              # Live cycle telemetry
    └── scripts/
        ├── trigger.sh          # Twice-daily autonomous awakening (05:00 & 17:00 UTC)
        └── verify.sh           # Anti-clone, Bidi/RTL, performance & Chromium verification
```

---

## 📜 License
MIT License • Created by [Ayoub (eulerx0)](https://github.com/Ayoubvvch).
