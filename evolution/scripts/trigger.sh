#!/usr/bin/env bash
# ==============================================================================
# Math Arcade: Autonomous Twice-Daily Evolution Trigger ("Project Miracle")
# Awakens "My Homie" (@eulerx0bot) via AGY-Telegram Worker API (Port 5015)
# ==============================================================================

LOG_FILE="/home/ubuntu/math-arcade/evolution/trigger.log"
CURRENT_HOUR=$(date -u +"%H")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if [ "$CURRENT_HOUR" -lt 12 ]; then
  PHASE="ALPHA"
  PHASE_DESC="Phase Alpha (Creation & Mathematical Game Construction)"
else
  PHASE="OMEGA"
  PHASE_DESC="Phase Omega (Hardening, Tuning & Pedagogical Quality Audit)"
fi

echo "[$TIMESTAMP] Awakening Math Arcade Evolution Cycle - Phase: $PHASE" >> "$LOG_FILE"

PROMPT="[AUTONOMOUS EVOLUTION TRIGGER: $PHASE - $TIMESTAMP]
You are \"My Homie\" (@eulerx0bot). This is your scheduled autonomous evolution cycle ($PHASE_DESC) for Math Arcade (Project Miracle).

Your mission for this cycle:
1. Read /home/ubuntu/math-arcade/evolution/STATE.json and /home/ubuntu/math-arcade/evolution/SPRINT.md to identify your current sprint and phase milestone.
2. Execute the concrete milestone for this cycle:
   - If Phase ALPHA: Build/scaffold the scheduled new game or major mathematical feature in /home/ubuntu/math-arcade/games/.
   - If Phase OMEGA: Polish, tune physics/audio/haptics, audit 120 FPS performance, improve pedagogical HUDs, and test PlayStation controls.
3. Run the automated quality gate: /home/ubuntu/math-arcade/evolution/scripts/verify.sh.
4. Git commit & push your progress to origin main (deploying automatically to GitHub Pages: https://ayoubvvch.github.io/math-arcade/).
5. Update /home/ubuntu/math-arcade/evolution/STATE.json and append a concise entry to /home/ubuntu/math-arcade/evolution/EVOLUTION_LOG.md.
6. Deliver a concise, sharp Arabic briefing to Owner Ayoub detailing the mathematical and technical achievements of this cycle.

Proceed autonomously with highest engineering standards."

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
