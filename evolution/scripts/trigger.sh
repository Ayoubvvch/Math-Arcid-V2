#!/usr/bin/env bash
# ==============================================================================
# Math-Arcid-V2: Autonomous Twice-Daily Evolution Trigger ("The Unleashed Monster")
# Awakens "My Homie" (@eulerx0bot) via AGY-Telegram Worker API (Port 5015)
# Strictly operates ONLY on /home/ubuntu/Math-Arcid-V2 (NEVER touch /home/ubuntu/math-arcade)
# ==============================================================================

REPO_DIR="/home/ubuntu/Math-Arcid-V2"
LOG_FILE="$REPO_DIR/evolution/trigger.log"
CURRENT_HOUR=$(date -u +"%H")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [ "$CURRENT_HOUR" -lt 12 ]; then
  PHASE="ALPHA"
  PHASE_DESC="Phase Alpha (Gold-Standard 6-Module Game Construction >= 2,800 LOC)"
else
  PHASE="OMEGA"
  PHASE_DESC="Phase Omega (Deep Gameplay, Boss Patterns, Question Bank Expansion & 60FPS Audit)"
fi

echo "[$TIMESTAMP] Awakening Math-Arcid-V2 Evolution Cycle - Phase: $PHASE" >> "$LOG_FILE"

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
   - `js/hub.js`: Bespoke multi-layered SVG artwork block `if (game.id === '...')` in `buildTileArtwork(game)`.
3. Execute the concrete milestone for this cycle ($PHASE):
   - If Phase ALPHA: Build the scheduled new 6-module Gold Standard game specified in `SPRINT.md` (`nextAlphaMilestone`).
   - If Phase OMEGA: Execute the deep gameplay, boss pattern, and curriculum expansion milestone specified in `SPRINT.md` (`nextOmegaMilestone`).
4. Run the 7-Stage Ironclad Quality Gate:
   `bash /home/ubuntu/Math-Arcid-V2/evolution/scripts/verify.sh`
   Do NOT commit or push until all 7 stages pass 100%!
5. Update `/home/ubuntu/Math-Arcid-V2/evolution/STATE.json`, `/home/ubuntu/Math-Arcid-V2/evolution/SPRINT.md`, and `/home/ubuntu/Math-Arcid-V2/evolution/EVOLUTION_LOG.md`.
6. Git commit & push to `origin main` in `/home/ubuntu/Math-Arcid-V2`.
7. Deliver a concise, sharp Arabic engineering report to Owner Ayoub detailing the achievements of this cycle."

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

echo "[$TIMESTAMP] Worker Response: $RESPONSE" >> "$LOG_FILE"
echo "Awakening triggered successfully: $RESPONSE"
