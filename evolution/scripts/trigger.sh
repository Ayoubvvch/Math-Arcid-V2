#!/usr/bin/env bash
# ==============================================================================
# Math-Arcid-V2: Autonomous Self-Healing Monster ("المستقل الأعظم")
# Runs Twice Daily (05:00 & 17:00 UTC):
#   - Phase ALPHA (05:00 UTC): Primary Sprint build / structure / game milestone
#   - Phase OMEGA (17:00 UTC): Deep gameplay, curriculum, UX & 60FPS polish
#   - Phase ARCHITECT (Auto-triggered on Sprint end OR every <= 14 days / 28 cycles):
#       Truthful full codebase/browser audit -> archive finished Sprint ->
#       draft next Roadmap (SPRINT_03 Organization -> SPRINT_04 Math Exam/PWA ->
#       SPRINT_05+ Physics & Chemistry 2BAC PC Expansion -> Endless Self-Evolution)
# Strictly operates ONLY on /home/ubuntu/Math-Arcid-V2 (NEVER touch /home/ubuntu/math-arcade)
# ==============================================================================
set -u

REPO_DIR="/home/ubuntu/Math-Arcid-V2"
LOG_FILE="$REPO_DIR/evolution/trigger.log"
CRON_LOG="$REPO_DIR/evolution/cron.log"
STATE_FILE="$REPO_DIR/evolution/STATE.json"
SPRINT_FILE="$REPO_DIR/evolution/SPRINT.md"
ROADMAP_FILE="$REPO_DIR/evolution/ROADMAP.md"
LAST_RUN_FILE="$REPO_DIR/evolution/last_run.json"
RECOVERY_PATCH="$REPO_DIR/evolution/recovery_last.patch"
LOCK_FILE="/tmp/math_arcid_v2_evolution.lock"

# Prevent overlapping executions if a cycle runs long
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Another evolution trigger is active. Skipping." >> "$LOG_FILE"
  exit 0
fi

# Auto-trim logs so disk stays ultra-clean forever
for lf in "$LOG_FILE" "$CRON_LOG"; do
  if [ -f "$lf" ] && [ "$(wc -l < "$lf")" -gt 600 ]; then
    tail -n 300 "$lf" > "${lf}.tmp" && mv "${lf}.tmp" "$lf"
  fi
done

CURRENT_HOUR=$(date -u +"%H")
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# ------------------------------------------------------------------------------
# 1. Pre-Flight Crash Recovery & Self-Healing
# ------------------------------------------------------------------------------
WORKER_HEALTH=$(curl -s -m 4 http://127.0.0.1:5015/health 2>/dev/null || echo "")
if [ -z "$WORKER_HEALTH" ]; then
  echo "[$TIMESTAMP] Worker 5015 unreachable — auto-restarting agy-tg-worker via PM2..." >> "$LOG_FILE"
  pm2 restart agy-tg-worker >/dev/null 2>&1 || true
  for _ in $(seq 1 10); do
    sleep 2
    WORKER_HEALTH=$(curl -s -m 3 http://127.0.0.1:5015/health 2>/dev/null || echo "")
    [ -n "$WORKER_HEALTH" ] && break
  done
fi

MONSTER_BUSY=$(node -e '
  try {
    const h = JSON.parse(process.argv[1] || "{}");
    const busy = Array.isArray(h.tasks) && h.tasks.some(t => t.chatKey === "auto_math_arcid_v2");
    console.log(busy ? "1" : "0");
  } catch (_) { console.log("0"); }
' "$WORKER_HEALTH")

if [ "$MONSTER_BUSY" = "1" ]; then
  echo "[$TIMESTAMP] Previous auto_math_arcid_v2 cycle still running on worker. Skipping duplicate trigger." >> "$LOG_FILE"
  exit 0
fi

DIRTY_FILES=$(git -C "$REPO_DIR" status --porcelain 2>/dev/null || echo "")
RECOVERY_NOTE=""
if [ -n "$DIRTY_FILES" ]; then
  echo "[$TIMESTAMP] Detected uncommitted dirty files from an interrupted prior run; checking verify.sh..." >> "$LOG_FILE"
  if bash "$REPO_DIR/evolution/scripts/verify.sh" >/dev/null 2>&1; then
    RECOVERY_NOTE="NOTE: Previous interrupted cycle left uncommitted valid changes that passed verify.sh. Inspect 'git status' and finish/commit cleanly or discard redundant parts."
  else
    git -C "$REPO_DIR" diff > "$RECOVERY_PATCH" 2>/dev/null || true
    git -C "$REPO_DIR" checkout -- . >/dev/null 2>&1 || true
    git -C "$REPO_DIR" clean -fd -e evolution/trigger.log -e evolution/cron.log -e evolution/last_run.json -e evolution/recovery_last.patch >/dev/null 2>&1 || true
    echo "[$TIMESTAMP] Self-healed broken dirty tree (saved diff to evolution/recovery_last.patch & restored clean HEAD)." >> "$LOG_FILE"
    RECOVERY_NOTE="SELF-HEAL NOTICE: A crashed prior cycle left failing uncommitted changes; trigger.sh backed up the patch to evolution/recovery_last.patch and restored clean HEAD before launching you."
  fi
fi

# ------------------------------------------------------------------------------
# 2. Decide Cycle Phase (PAUSED / ARCHITECT / ALPHA / OMEGA)
# ------------------------------------------------------------------------------
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

  // Weekly / Bi-weekly forced Architect macro audit cadence (default 14 days / 28 cycles)
  const archPolicy = state.architectPolicy || {};
  const maxDays = Number(archPolicy.cadenceDays || 14);
  const maxCycles = Number(archPolicy.maxCyclesBetweenAudits || 28);
  const completed = Number(state.metrics?.totalCyclesCompleted || 0);
  const lastArchCycle = Number(archPolicy.lastArchitectCycle || 0);
  const lastArchIso = archPolicy.lastArchitectTimestamp || "";
  const daysSinceArch = lastArchIso ? (Date.now() - Date.parse(lastArchIso)) / 86400000 : 0;
  const dueBiWeeklyAudit = (completed - lastArchCycle >= maxCycles) || (lastArchIso && daysSinceArch >= maxDays);

  if (status === "COMPLETED_NEEDS_ROADMAP" || (!hasSprintPending && !hasRoadmapPlanned) || dueBiWeeklyAudit) {
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
  PHASE_DESC="Phase Architect (Truthful Code/Browser Audit & Multi-Day Roadmap Generation)"
elif [ "$((10#$CURRENT_HOUR))" -lt 12 ]; then
  PHASE="ALPHA"
  PHASE_DESC="Phase Alpha (Primary Sprint Build / Feature / Structural Milestone)"
else
  PHASE="OMEGA"
  PHASE_DESC="Phase Omega (Deep Gameplay, Curriculum, UX & 60FPS Audit)"
fi

echo "[$TIMESTAMP] Awakening Math-Arcid-V2 Evolution Cycle - Phase: $PHASE" >> "$LOG_FILE"

# ------------------------------------------------------------------------------
# 3. Compose Autonomous Prompt (single-quoted heredoc prevents backtick execution!)
# ------------------------------------------------------------------------------
if [ "$PHASE" = "ARCHITECT" ]; then
  read -r -d '' PROMPT_TEMPLATE <<'EOF_ARCH_PROMPT' || true
[AUTONOMOUS EVOLUTION TRIGGER: MATH-ARCID-V2 | ARCHITECT - __TIMESTAMP__]
You are "My Homie" (@eulerx0bot). This is your autonomous **Phase ARCHITECT (Comprehensive Codebase Audit & Next Multi-Day Roadmap Planning)** cycle in **Math-Arcid-V2** (/home/ubuntu/Math-Arcid-V2).
__RECOVERY_NOTE__

⚠️ CRITICAL BOUNDARY RULE:
- Operate EXCLUSIVELY inside /home/ubuntu/Math-Arcid-V2 (GitHub: https://github.com/Ayoubvvch/Math-Arcid-V2 | Live: https://ayoubvvch.github.io/Math-Arcid-V2/).
- NEVER touch or modify /home/ubuntu/math-arcade (V1 is reserved exclusively for Owner Ayoub).

🧭 MANDATORY TRUTHFUL ARCHITECT PROTOCOL:
1. Read:
   - /home/ubuntu/Math-Arcid-V2/evolution/GOLD_STANDARD.md
   - /home/ubuntu/Math-Arcid-V2/evolution/STATE.json
   - /home/ubuntu/Math-Arcid-V2/evolution/SPRINT.md
   - /home/ubuntu/Math-Arcid-V2/evolution/ROADMAP.md
   - /home/ubuntu/Math-Arcid-V2/evolution/EVOLUTION_LOG.md
2. Perform a **TRUTHFUL, EVIDENCE-BASED** codebase, runtime, and pedagogical audit across `/home/ubuntu/Math-Arcid-V2`:
   - Inspect real files before claiming any gap or bug (run `bash /home/ubuntu/Math-Arcid-V2/evolution/scripts/verify.sh` and inspect `games.json`, `js/hub.js`, `shared/`, `css/`, and `games/*` directly). NEVER guess or invent missing features.
   - Evaluate: (a) absolute syllabus ordering (`subject`, `order`, `topicStart`, `topicEnd`), (b) code deduplication & dead-code cleanliness, (c) pedagogical depth for Moroccan 2BAC PC National Exams (step-by-step rigor, weak-topic drills, timed mock modes), (d) Mobile/DualSense UX & Offline PWA readiness, and (e) multi-subject expansion readiness (`الفيزياء والكيمياء 2BAC PC`).
3. Archive the finished Sprint summary into `/home/ubuntu/Math-Arcid-V2/evolution/ARCHIVE_MILESTONES.md`.
4. Design the NEXT multi-day Sprint & Roadmap (typically **8 to 14 concrete Alpha/Omega cycles** spanning 4–7 days, or up to 1–2 weeks before next ARCHITECT audit):
   - **Follow the Macro Evolution Horizon in `STATE.json` (`perpetualRoadmapPolicy`)**:
     * If `SPRINT_03` just completed -> design **`SPRINT_04`**: Deep 2BAC PC Math National Exam & UX Excellence (Timed National Exam Boss-Rush Mode, step-by-step Moroccan solution breakdown on errors, Weak-Topics Adaptive Review powered by `ArcadeCore.Progress`, Offline PWA support `manifest.json` + `sw.js`).
     * Once Math platform UX & Boss-Rush/PWA are rock-solid (`SPRINT_05+`) -> expand the platform into **2BAC PC Physics & Chemistry (`الفيزياء والكيمياء`)** under the same 6-module RTL DualSense Gold Standard (`subject: "physics"` / `"chemistry"` in `games.json`, strict Moroccan syllabus ordering: الموجات، النووي، الكهرباء RC/RL/RLC، الميكانيك، ثم التحولات الكيميائية، الحمض-القاعدة، الأعمدة والتحليل الكهربائي، الأسترة والحلمأة), with subject tabs in the PS5 Hub!
     * For every subsequent Sprint (`SPRINT_06+`), diagnose what the platform genuinely lacks most next and plan concrete Alpha/Omega milestones indefinitely.
5. Update:
   - `/home/ubuntu/Math-Arcid-V2/evolution/ROADMAP.md`
   - `/home/ubuntu/Math-Arcid-V2/evolution/SPRINT.md`
   - `/home/ubuntu/Math-Arcid-V2/evolution/STATE.json`: increment `totalCyclesCompleted`, update `lastCycleTimestamp`, set `architectPolicy.lastArchitectCycle` to the new `totalCyclesCompleted` and `architectPolicy.lastArchitectTimestamp` to `__TIMESTAMP__`, update `currentSprint` (`status: "ACTIVE"`, `nextCycleNumber`, `nextAlphaMilestone`, `nextOmegaMilestone`), and update `sprintHistory`.
   - `/home/ubuntu/Math-Arcid-V2/evolution/EVOLUTION_LOG.md` (sliding window <= 10 recent entries).
6. Run `bash /home/ubuntu/Math-Arcid-V2/evolution/scripts/verify.sh` (all 9 stages must pass 100%).
7. Sync with remote cleanly (`git pull --rebase origin main || true`), commit, and push to `origin main`.
8. Deliver a concise, sharp Arabic engineering report to Owner Ayoub detailing: (a) Truthful Audit findings, and (b) The newly generated Roadmap.
EOF_ARCH_PROMPT
else
  read -r -d '' PROMPT_TEMPLATE <<'EOF_CYCLE_PROMPT' || true
[AUTONOMOUS EVOLUTION TRIGGER: MATH-ARCID-V2 | __PHASE__ - __TIMESTAMP__]
You are "My Homie" (@eulerx0bot). This is your scheduled autonomous evolution cycle (__PHASE_DESC__) for **Math-Arcid-V2** (/home/ubuntu/Math-Arcid-V2).
__RECOVERY_NOTE__

⚠️ CRITICAL BOUNDARY RULE:
- Operate EXCLUSIVELY inside /home/ubuntu/Math-Arcid-V2 (GitHub: https://github.com/Ayoubvvch/Math-Arcid-V2 | Live: https://ayoubvvch.github.io/Math-Arcid-V2/).
- NEVER touch or modify /home/ubuntu/math-arcade (V1 is reserved exclusively for Owner Ayoub's manual work).

🏛️ MANDATORY GOLD-STANDARD ARCHITECTURAL CHARTER (ZERO-GARBAGE RULE):
1. First, read:
   - /home/ubuntu/Math-Arcid-V2/evolution/GOLD_STANDARD.md
   - /home/ubuntu/Math-Arcid-V2/evolution/STATE.json
   - /home/ubuntu/Math-Arcid-V2/evolution/SPRINT.md
2. Every curriculum game (Math, Physics, or Chemistry 2BAC PC) MUST satisfy `GOLD_STANDARD.md`:
   - Full-Screen 100vw x 100dvh 60FPS Canvas, zero `backdrop-filter`, zero `shadowBlur > 0`.
   - Arabic RTL interface (`<html lang="ar" dir="rtl">`) using `ArcadeCore.setBidiSafeMath` + `../../index.html?from=game`.
   - Complete 6-Module Architecture (`curriculum.js`, `world.js`, `renderer.js`, `controls.js`, `audio.js`, `game.js` >= 2,800 LOC, >= 24 National Exam Qs, >= 6 interactive `graphSpec` plots, Fisher-Yates option shuffling, DualSense across gameplay + modals, bespoke SVG in `js/hub.js`, and strict `subject`/`order`/`topicStart`/`topicEnd` in `games.json`).
3. Execute the scheduled milestone for this cycle (__PHASE__) from `SPRINT.md` (`[NEXT]` / `[UPCOMING]`) and `STATE.json`. Always verify real file state before editing so you never duplicate existing code or chase false assumptions.
4. **PERPETUAL SPRINT TRANSITION RULE**:
   - If you just completed the **FINAL** milestone of the active Sprint (zero `[UPCOMING]` / `PLANNED` milestones remain), set `"status": "COMPLETED_NEEDS_ROADMAP"` inside `currentSprint` in `STATE.json` and leave zero `[NEXT` / `[UPCOMING` entries in `SPRINT.md` so **Phase ARCHITECT** triggers automatically on the next cycle.
5. Run the 9-Stage Ironclad Quality Gate:
   `bash /home/ubuntu/Math-Arcid-V2/evolution/scripts/verify.sh`
   Do NOT commit or push until ALL 9 stages (including VM graph render & Headless Chromium browser test) pass 100%!
6. Update `STATE.json`, `SPRINT.md`, `ROADMAP.md` (if changed), and `EVOLUTION_LOG.md` (keep <= 10 entries).
7. Pull/rebase safely (`git pull --rebase origin main || true`), commit, and push to `origin main` (retry push once if transient network error).
8. Deliver a concise, sharp Arabic engineering report to Owner Ayoub detailing the achievements of this cycle.
EOF_CYCLE_PROMPT
fi

PROMPT=$(node -e '
  const [tpl, phase, desc, ts, rec] = process.argv.slice(1);
  process.stdout.write(
    tpl.replace(/__PHASE__/g, phase)
       .replace(/__PHASE_DESC__/g, desc)
       .replace(/__TIMESTAMP__/g, ts)
       .replace(/__RECOVERY_NOTE__/g, rec)
  );
' "$PROMPT_TEMPLATE" "$PHASE" "$PHASE_DESC" "$TIMESTAMP" "$RECOVERY_NOTE")

PRE_HEAD=$(git -C "$REPO_DIR" rev-parse HEAD 2>/dev/null || echo "")

# Isolated dedicated session ('auto_math_arcid_v2') so Owner DM context & queue are never polluted,
# with automatic multi-model Quota Fallback!
PAYLOAD=$(node -e '
  const prompt = process.argv[1];
  console.log(JSON.stringify({
    chatId: "8959256425",
    chatKey: "auto_math_arcid_v2",
    chatTitle: "Math-Arcid-V2 Autonomous Monster",
    promptText: prompt,
    fallbackModels: [
      "gemini-4-hydrogen-xhigh",
      "gemini-4-neon-high",
      "claude-sonnet-5-5-high",
      "gemini-4-argon-high",
      "gemini-3.8-flash-high"
    ]
  }));
' "$PROMPT")

RESPONSE=$(curl -s -m 15 -X POST http://127.0.0.1:5015/run \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" || echo '{"success":false,"error":"curl_failed"}')

node -e '
  const fs = require("fs");
  let parsed = {};
  try { parsed = JSON.parse(process.argv[2]); } catch (_) {}
  fs.writeFileSync(process.argv[1], JSON.stringify({
    triggeredAt: process.argv[3],
    phase: process.argv[4],
    preHead: process.argv[5],
    taskId: parsed.taskId || null,
    workerStatus: parsed.status || null,
    rawResponse: process.argv[2]
  }, null, 2));
' "$LAST_RUN_FILE" "$RESPONSE" "$TIMESTAMP" "$PHASE" "$PRE_HEAD"

echo "[$TIMESTAMP] Worker Response ($PHASE): $RESPONSE" >> "$LOG_FILE"
echo "Awakening triggered ($PHASE): $RESPONSE"
