#!/usr/bin/env bash
# ==============================================================================
# Math-Arcid-V2: Perpetual Autonomous Evolution Trigger ("The Unleashed Monster")
# Runs Twice Daily (05:00 & 17:00 UTC):
#   - Phase ALPHA (05:00 UTC): Execute next major build/feature milestone in SPRINT.md
#   - Phase OMEGA (17:00 UTC): Deep gameplay, physics, curriculum, UX & 60FPS polish
#   - Phase ARCHITECT (Auto-triggered when a Sprint/Roadmap finishes):
#       Full project audit -> archive finished sprint -> generate next multi-day Roadmap
#       (SPRINT_03 focuses on Organization, Clean Structure & UX; SPRINT_04+ adapts endlessly)
# Strictly operates ONLY on /home/ubuntu/Math-Arcid-V2 (NEVER touch /home/ubuntu/math-arcade)
# ==============================================================================

REPO_DIR="/home/ubuntu/Math-Arcid-V2"
LOG_FILE="$REPO_DIR/evolution/trigger.log"
STATE_FILE="$REPO_DIR/evolution/STATE.json"
SPRINT_FILE="$REPO_DIR/evolution/SPRINT.md"
ROADMAP_FILE="$REPO_DIR/evolution/ROADMAP.md"

CURRENT_HOUR=$(date -u +"%H")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

DECISION=$(node -e '
  const fs = require("fs");
  const state = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const sprintMd = fs.existsSync(process.argv[2]) ? fs.readFileSync(process.argv[2], "utf8") : "";
  const roadmapMd = fs.existsSync(process.argv[3]) ? fs.readFileSync(process.argv[3], "utf8") : "";

  if (state.autoEvolutionPaused === true) {
    console.log("PAUSED");
    process.exit(0);
  }

  const status = state.currentSprint && state.currentSprint.status;
  const hasSprintPending = /###\s*\[(?:NEXT|UPCOMING)\b/i.test(sprintMd);
  const hasRoadmapPlanned = /\bPLANNED\b/i.test(roadmapMd);

  if (status === "COMPLETED_NEEDS_ROADMAP" || (!hasSprintPending && !hasRoadmapPlanned)) {
    console.log("ARCHITECT");
  } else {
    console.log("CONTINUE");
  }
' "$STATE_FILE" "$SPRINT_FILE" "$ROADMAP_FILE" 2>/dev/null || echo "CONTINUE")

if [ "$DECISION" = "PAUSED" ]; then
  echo "[$TIMESTAMP] Auto-evolution paused (autoEvolutionPaused=true in STATE.json). Skipping." >> "$LOG_FILE"
  exit 0
fi

if [ "$DECISION" = "ARCHITECT" ]; then
  PHASE="ARCHITECT"
  PHASE_DESC="Phase Architect (Full Project Audit & Next Multi-Day Roadmap Generation)"
elif [ "$((10#$CURRENT_HOUR))" -lt 12 ]; then
  PHASE="ALPHA"
  PHASE_DESC="Phase Alpha (Primary Sprint Build / Feature / Structural Milestone)"
else
  PHASE="OMEGA"
  PHASE_DESC="Phase Omega (Deep Gameplay, Boss Patterns, Curriculum, UX & 60FPS Audit)"
fi

echo "[$TIMESTAMP] Awakening Math-Arcid-V2 Evolution Cycle - Phase: $PHASE" >> "$LOG_FILE"

if [ "$PHASE" = "ARCHITECT" ]; then
  PROMPT="[AUTONOMOUS EVOLUTION TRIGGER: MATH-ARCID-V2 | ARCHITECT - $TIMESTAMP]
You are \"My Homie\" (@eulerx0bot). The current Sprint/Roadmap in **Math-Arcid-V2** (/home/ubuntu/Math-Arcid-V2) has completed! This is your autonomous **Phase ARCHITECT (Strategic Audit & Next Multi-Day Roadmap Planning)** cycle.

⚠️ CRITICAL BOUNDARY RULE:
- Operate EXCLUSIVELY inside /home/ubuntu/Math-Arcid-V2 (GitHub: https://github.com/Ayoubvvch/Math-Arcid-V2 | Live: https://ayoubvvch.github.io/Math-Arcid-V2/).
- NEVER touch or modify /home/ubuntu/math-arcade (V1 is reserved exclusively for Owner Ayoub's manual work).

🧭 MANDATORY ARCHITECT PROTOCOL:
1. Read:
   - /home/ubuntu/Math-Arcid-V2/evolution/GOLD_STANDARD.md
   - /home/ubuntu/Math-Arcid-V2/evolution/STATE.json
   - /home/ubuntu/Math-Arcid-V2/evolution/SPRINT.md
   - /home/ubuntu/Math-Arcid-V2/evolution/ROADMAP.md
   - /home/ubuntu/Math-Arcid-V2/evolution/EVOLUTION_LOG.md
2. Perform a thorough, real codebase & UX audit across `/home/ubuntu/Math-Arcid-V2`:
   - Inspect `index.html`, `js/hub.js`, `css/hub.css`, `css/common.css`, `shared/`, `games.json`, and ALL directories in `games/`.
   - Identify structural clutter, duplicated helpers, UX friction, missing progress persistence, accessibility/mobile gaps, DualSense navigation inconsistencies, visual inconsistencies, or missing curriculum/feature opportunities.
3. Archive the finished Sprint summary into `/home/ubuntu/Math-Arcid-V2/evolution/ARCHIVE_MILESTONES.md`.
4. Design the NEXT multi-day Sprint & Roadmap (`SPRINT_03`, `SPRINT_04`, ... — typically 6 to 10 concrete Alpha/Omega cycles spanning 3–5 days):
   - Check `perpetualRoadmapPolicy` in `STATE.json`:
     * If planning `SPRINT_03` (the first post-10-game Sprint): strictly prioritize **التنظيم والترتيب وتجربة المستخدم (Organization, Clean File/Code Structure, Hub Sorting/Grouping, User Experience, Onboarding, Progress/Score Tracking, Unified Visual/DualSense Polish, and Zero-Regression Refactoring)**.
     * If planning `SPRINT_04+` onward: analyze what the project currently lacks or needs most (e.g., 2BAC PC Physics & Chemistry Arcade series, National Exam Boss-Rush / Timed Mock Mode, Offline PWA & Asset Optimization, Adaptive Pedagogical Review Engine, etc.) and plan concrete, high-impact Alpha & Omega milestones!
5. Update:
   - `/home/ubuntu/Math-Arcid-V2/evolution/ROADMAP.md` (preserve completed archive table & add the new Sprint Roadmap table with `PLANNED (Cycle XXX)` entries).
   - `/home/ubuntu/Math-Arcid-V2/evolution/SPRINT.md` (start the new active Sprint with `[NEXT — Cycle XXX ...]` and `[UPCOMING — Cycle ...]` milestones).
   - `/home/ubuntu/Math-Arcid-V2/evolution/STATE.json` (increment `totalCyclesCompleted`, set `currentSprint.id`, `currentSprint.status = \"ACTIVE\"`, `nextCycleNumber`, `nextAlphaMilestone`, `nextOmegaMilestone`, and record finished sprint in `sprintHistory`).
   - `/home/ubuntu/Math-Arcid-V2/evolution/EVOLUTION_LOG.md` (keep sliding window <= 10 recent entries).
6. Run `bash /home/ubuntu/Math-Arcid-V2/evolution/scripts/verify.sh` (all 7 stages must pass 100%).
7. Git commit & push to `origin main` in `/home/ubuntu/Math-Arcid-V2`.
8. Deliver a concise, sharp Arabic engineering report to Owner Ayoub detailing: (a) Full Project Audit findings, and (b) The newly generated Roadmap for the upcoming days."
else
  PROMPT="[AUTONOMOUS EVOLUTION TRIGGER: MATH-ARCID-V2 | $PHASE - $TIMESTAMP]
You are \"My Homie\" (@eulerx0bot). This is your scheduled autonomous evolution cycle ($PHASE_DESC) for **Math-Arcid-V2** (/home/ubuntu/Math-Arcid-V2).

⚠️ CRITICAL BOUNDARY RULE:
- Operate EXCLUSIVELY inside /home/ubuntu/Math-Arcid-V2 (GitHub: https://github.com/Ayoubvvch/Math-Arcid-V2 | Live: https://ayoubvvch.github.io/Math-Arcid-V2/).
- NEVER touch or modify /home/ubuntu/math-arcade (V1 is reserved exclusively for Owner Ayoub's manual work).

🏛️ MANDATORY GOLD-STANDARD ARCHITECTURAL CHARTER (ZERO-GARBAGE RULE):
1. First, read:
   - /home/ubuntu/Math-Arcid-V2/evolution/GOLD_STANDARD.md
   - /home/ubuntu/Math-Arcid-V2/evolution/STATE.json
   - /home/ubuntu/Math-Arcid-V2/evolution/SPRINT.md
2. Every curriculum game in Math-Arcid-V2 MUST match the Gold Standard of `asymptote-asylum` (Topics 23-38), `sequence-strider` (Topics 39-50), and `complex-plane-duel` (Topics 51-64):
   - Full-Screen 100vw x 100dvh 60FPS Canvas with smooth world camera (NEVER build a 540x960 portrait box!).
   - Arabic RTL interface (`<html lang=\"ar\" dir=\"rtl\">`) with `setBidiSafeMath` wrapping math formulas in `<bdi dir=\"ltr\" class=\"math-ltr\">`.
   - Complete 6-Module Architecture (`js/curriculum.js`, `js/world.js`, `js/renderer.js`, `js/controls.js`, `js/audio.js`, `js/game.js` + `css/style.css` + `index.html`) totaling **>= 2,800 lines of code**.
   - `js/curriculum.js`: >= 24 rigorous Moroccan 2BAC PC National Exam questions across 4 Sectors, with hints and >= 6 interactive `graphSpec` canvas diagrams rendered by `drawSequenceGraph`.
   - `js/world.js`: True genre gameplay across 4 Sectors, 4 Interactive Seals/Gates, 3+ Enemy Archetypes with stagger/execute mechanics, 6 PlayStation abilities (`✕`, `◯`, `▢`, `△`, `R2`, `L2`), and a Sector Boss Core.
   - `js/controls.js`: 100% PlayStation DualSense support across gameplay AND all modals (Intro, Override, Pause, End) + Keyboard/Mouse + Mobile Touch Joystick.
   - `js/hub.js`: Bespoke multi-layered SVG artwork block `if (game.id === '...')` in `getGameArtworkSVG(game)`.
3. Execute the concrete milestone for this cycle ($PHASE):
   - Read `SPRINT.md` (`[NEXT]` / `[UPCOMING]`) and `STATE.json` (`nextAlphaMilestone` / `nextOmegaMilestone`).
   - If Phase ALPHA: Execute the scheduled Alpha milestone (whether building the next Gold-Standard 6-module game OR executing a major Organization/UX/Platform milestone in Sprint 3+).
   - If Phase OMEGA: Execute the scheduled Omega milestone (deep gameplay, boss patterns, curriculum expansion, UX polish, refactoring & 60FPS audit).
4. **PERPETUAL SPRINT TRANSITION RULE**:
   - Check if any remaining `[UPCOMING]` milestones exist in `SPRINT.md` (or `PLANNED` items in the active sprint of `ROADMAP.md`).
   - If you just completed the **FINAL** milestone of the active Sprint (zero `[UPCOMING]` / `PLANNED` milestones remain), set `\"status\": \"COMPLETED_NEEDS_ROADMAP\"` inside `currentSprint` in `STATE.json` and leave zero `[NEXT` / `[UPCOMING` entries in `SPRINT.md`. This automatically triggers **Phase ARCHITECT** on the very next cycle to audit the whole project and draft the next multi-day Roadmap!
5. Run the 7-Stage Ironclad Quality Gate:
   `bash /home/ubuntu/Math-Arcid-V2/evolution/scripts/verify.sh`
   Do NOT commit or push until all 7 stages pass 100%!
6. Update `/home/ubuntu/Math-Arcid-V2/evolution/STATE.json`, `/home/ubuntu/Math-Arcid-V2/evolution/SPRINT.md`, `/home/ubuntu/Math-Arcid-V2/evolution/ROADMAP.md` (if game/milestone status changed), and `/home/ubuntu/Math-Arcid-V2/evolution/EVOLUTION_LOG.md`.
7. Git commit & push to `origin main` in `/home/ubuntu/Math-Arcid-V2`.
8. Deliver a concise, sharp Arabic engineering report to Owner Ayoub detailing the achievements of this cycle."
fi

PAYLOAD=$(node -e '
  const prompt = process.argv[1];
  console.log(JSON.stringify({
    chatId: "8959256425",
    chatKey: "7266246513",
    chatTitle: "Direct Workstation (Owner DM)",
    promptText: prompt
  }));
' "$PROMPT")

RESPONSE=$(curl -s -X POST http://127.0.0.1:5015/run \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "[$TIMESTAMP] Worker Response ($PHASE): $RESPONSE" >> "$LOG_FILE"
echo "Awakening triggered successfully ($PHASE): $RESPONSE"
