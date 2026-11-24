#!/usr/bin/env bash
# ==============================================================================
# Math-Arcid-V2: Unleashed Creative Autonomous Monster (Reboot V3)
# Runs Twice Daily (05:00 & 17:00 UTC):
#   - Phase CREATE (05:00 UTC): Research (search_web), invent a truly original
#     lightweight Math-as-Gameplay experience & build it cleanly
#   - Phase POLISH (17:00 UTC): Real playtest, game-feel juice, curriculum depth
#     & mobile/desktop/Chromium polish
#   - Phase ARCHITECT (Auto-triggered on Sprint end OR <= 14 days / 28 cycles):
#     Honest browser/code audit, anti-clone review & next multi-day Sprint plan
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
    const task = Array.isArray(h.tasks) && h.tasks.find(t => t.chatKey === "auto_math_arcid_v2");
    if (!task) { console.log("0"); process.exit(0); }
    if (Number(task.elapsedSec || 0) > 2700) { console.log("STUCK"); process.exit(0); }
    console.log("1");
  } catch (_) { console.log("0"); }
' "$WORKER_HEALTH")

if [ "$MONSTER_BUSY" = "STUCK" ]; then
  echo "[$TIMESTAMP] Previous auto_math_arcid_v2 task stuck >45m; stopping cleanly before starting new cycle." >> "$LOG_FILE"
  curl -s -m 8 -X POST http://127.0.0.1:5015/stop -H "Content-Type: application/json" -d '{"chatKey":"auto_math_arcid_v2"}' >/dev/null 2>&1 || true
  sleep 2
elif [ "$MONSTER_BUSY" = "1" ]; then
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
# 2. Decide Cycle Phase (PAUSED / ARCHITECT / CREATE / POLISH)
# ------------------------------------------------------------------------------
PHASE_OVERRIDE="${1:-}"
DECISION=$(node -e '
  const fs = require("fs");
  const state = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const sprintMd = fs.existsSync(process.argv[2]) ? fs.readFileSync(process.argv[2], "utf8") : "";
  const roadmapMd = fs.existsSync(process.argv[3]) ? fs.readFileSync(process.argv[3], "utf8") : "";
  const override = process.argv[4] || "";

  if (state.autoEvolutionPaused === true && override !== "FORCE") {
    console.log("PAUSED");
    process.exit(0);
  }

  const status = state.currentSprint && state.currentSprint.status;
  const hasSprintPending = /###\s*\[(?:NEXT|UPCOMING)\b/i.test(sprintMd);
  const hasRoadmapPlanned = /\bPLANNED\b|\bUPCOMING\b/i.test(roadmapMd);

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
    // Check explicit [NEXT] phase in SPRINT.md so first launch or out-of-window triggers match the exact next milestone
    const nextMatch = sprintMd.match(/###\s*\[NEXT[^\]]*\b(CREATE|POLISH)\b/i);
    if (nextMatch) {
      console.log(nextMatch[1].toUpperCase());
    } else {
      console.log("AUTO");
    }
  }
' "$STATE_FILE" "$SPRINT_FILE" "$ROADMAP_FILE" "$PHASE_OVERRIDE" 2>/dev/null || echo "AUTO")

if [ "$DECISION" = "PAUSED" ]; then
  echo "[$TIMESTAMP] Auto-evolution paused (autoEvolutionPaused=true in STATE.json). Skipping." >> "$LOG_FILE"
  exit 0
fi

if [ "$DECISION" = "ARCHITECT" ]; then
  PHASE="ARCHITECT"
  PHASE_DESC="Phase ARCHITECT (Truthful Code/Browser Audit, Anti-Clone Check & Next Creative Sprint)"
elif [ "$DECISION" = "CREATE" ]; then
  PHASE="CREATE"
  PHASE_DESC="Phase CREATE (Web Research, Original Genre Invention & Lightweight Math-as-Gameplay Build)"
elif [ "$DECISION" = "POLISH" ]; then
  PHASE="POLISH"
  PHASE_DESC="Phase POLISH (Live Playtest, Game Feel Juice, Curriculum Coverage & UX Polish)"
elif [ "$((10#$CURRENT_HOUR))" -lt 12 ]; then
  PHASE="CREATE"
  PHASE_DESC="Phase CREATE (Web Research, Original Genre Invention & Lightweight Math-as-Gameplay Build)"
else
  PHASE="POLISH"
  PHASE_DESC="Phase POLISH (Live Playtest, Game Feel Juice, Curriculum Coverage & UX Polish)"
fi

echo "[$TIMESTAMP] Awakening Math-Arcid-V2 Creative Monster - Phase: $PHASE" >> "$LOG_FILE"

# ------------------------------------------------------------------------------
# 3. Compose Autonomous Prompt (single-quoted heredoc prevents backtick execution!)
# ------------------------------------------------------------------------------
if [ "$PHASE" = "ARCHITECT" ]; then
  read -r -d '' PROMPT_TEMPLATE <<'EOF_ARCH_PROMPT' || true
[AUTONOMOUS EVOLUTION TRIGGER: MATH-ARCID-V2 | ARCHITECT - __TIMESTAMP__]
You are "My Homie" (@eulerx0bot) running **Phase ARCHITECT** for **Math-Arcid-V2** (/home/ubuntu/Math-Arcid-V2).
__RECOVERY_NOTE__

CRITICAL BOUNDARY RULE:
- Operate EXCLUSIVELY inside /home/ubuntu/Math-Arcid-V2 (GitHub: https://github.com/Ayoubvvch/Math-Arcid-V2 | Live: https://ayoubvvch.github.io/Math-Arcid-V2/).
- NEVER touch /home/ubuntu/math-arcade.

MANDATORY TRUTHFUL ARCHITECT PROTOCOL:
1. Read:
   - /home/ubuntu/Math-Arcid-V2/evolution/GOLD_STANDARD.md (Creative Charter v4.0)
   - /home/ubuntu/Math-Arcid-V2/evolution/CURRICULUM.md (Official 11-lesson, 137-skill 2BAC PC curriculum & Hors-programme limits)
   - /home/ubuntu/Math-Arcid-V2/evolution/STATE.json
   - /home/ubuntu/Math-Arcid-V2/evolution/SPRINT.md
   - /home/ubuntu/Math-Arcid-V2/evolution/ROADMAP.md
   - /home/ubuntu/Math-Arcid-V2/games.json
2. Perform a **BRUTAL, TRUTHFUL AUDIT** across all live games in `/home/ubuntu/Math-Arcid-V2`:
   - Run `bash /home/ubuntu/Math-Arcid-V2/evolution/scripts/verify.sh` (which runs real Chromium CDP playtests and saves screenshots to `evolution/screenshots/`).
   - **Visually inspect EVERY game's `evolution/screenshots/<slug>_desktop.png` and `<slug>_mobile.png`** via `read_file`!
   - Judge each game ruthlessly: Is it genuinely fun to play with a PS5 DualSense controller, or does any stage feel like a dry worksheet/applet? Does `Start (9)` open PauseMenu smoothly? Schedule immediate overhaul cycles in `SPRINT.md` for any weak game!
3. Archive the completed Sprint summary into `/home/ubuntu/Math-Arcid-V2/evolution/ARCHIVE_MILESTONES.md`.
4. Design the NEXT Creative Sprint (`REBOOT_SPRINT_02`, `03`, etc.) covering the next unbuilt lessons in `CURRICULUM.md` (with CREATE + POLISH pairs), or once all 11 Math lessons are deeply playable and distinct, evolve toward richer arcade modes or 2BAC PC Physics & Chemistry with the exact same Math-as-Gameplay ethos!
5. Update `ROADMAP.md`, `SPRINT.md`, `STATE.json` (`totalCyclesCompleted`, `architectPolicy.lastArchitectCycle`, `architectPolicy.lastArchitectTimestamp`, `currentSprint`), and `EVOLUTION_LOG.md` (<= 10 entries).
6. Pass `bash /home/ubuntu/Math-Arcid-V2/evolution/scripts/verify.sh` 100%, rebase/commit/push to `origin main`, and report to Owner Ayoub in crisp Arabic (attach `[SEND_FILE: /home/ubuntu/Math-Arcid-V2/evolution/screenshots/hub_desktop.png]`).
EOF_ARCH_PROMPT
elif [ "$PHASE" = "CREATE" ]; then
  read -r -d '' PROMPT_TEMPLATE <<'EOF_CREATE_PROMPT' || true
[AUTONOMOUS EVOLUTION TRIGGER: MATH-ARCID-V2 | CREATE - __TIMESTAMP__]
You are "My Homie" (@eulerx0bot) running **Phase CREATE** (__PHASE_DESC__) in **Math-Arcid-V2** (/home/ubuntu/Math-Arcid-V2).
__RECOVERY_NOTE__

CRITICAL BOUNDARY RULE:
- Operate EXCLUSIVELY inside /home/ubuntu/Math-Arcid-V2 (GitHub: https://github.com/Ayoubvvch/Math-Arcid-V2 | Live: https://ayoubvvch.github.io/Math-Arcid-V2/).
- NEVER touch /home/ubuntu/math-arcade.

UNLEASHED CREATIVE MANDATE (ZERO-CLONE PHILOSOPHY):
1. Read these files carefully before anything else:
   - /home/ubuntu/Math-Arcid-V2/evolution/GOLD_STANDARD.md (Creative Charter v4.0)
   - /home/ubuntu/Math-Arcid-V2/evolution/CURRICULUM.md (Read the EXACT target lesson's skills & Hors-programme warnings!)
   - /home/ubuntu/Math-Arcid-V2/evolution/STATE.json
   - /home/ubuntu/Math-Arcid-V2/evolution/SPRINT.md (Execute the `[NEXT]` milestone!)
   - /home/ubuntu/Math-Arcid-V2/games.json (Inspect existing `creativeProfile` entries so you NEVER repeat them!)
2. **MANDATORY RESEARCH & IDEATION STEP (`search_web`)**:
   - Use `search_web` with the lesson's Arabic/French/English concepts from `CURRICULUM.md` plus indie math/physics game design ideas (`interactive visualization`, `math game mechanics`, `canvas/webgl puzzle`) to gather fresh inspiration.
   - Brainstorm 3 radically different **TRUE REAL-TIME GAME** concepts for this lesson (arcade action, physics platformer, rhythm/lane defender, trajectory shooter, real-time tactical battler) — **STRICTLY REJECT** any QCM quiz, any existing game clone, AND **any passive GeoGebra/slider applet** (`<input type="range">` + live checklist + watch animation is BANNED!).
   - Pick the **most joyful, dynamic, skill-based** game where the player actively pilots/aims/times/reacts in real time with lives/combo/score and **the lesson's mathematical laws ARE the core action mechanic**!
   - Remember Owner Ayoub's bar: `math-battle` shows true arcade energy, tactile DualSense controls, and a clean Start pause menu — draw inspiration from that level of real-time game feel, NEVER copy its genre!
3. **BUILD LIGHTWEIGHT, REAL-TIME & CONTROLLER-FIRST**:
   - Choose whatever file structure (`1+` clean JS files), visual style, camera, and action control scheme best fits YOUR invention.
   - **MANDATORY CONTROLLER & PAUSE PARITY**: Integrate `ArcadeCore.PauseMenu.attach(...)` (`Start/Options` button `9` & `Esc` -> Resume / Restart / Exit to `../../index.html?from=game`), use `ArcadeCore.Gamepad.sampleAnalogAxes` + `sampleDirectionalNav` + face buttons + triggers so EVERY game action works smoothly on PlayStation/Xbox controllers as well as keyboard and mouse/touch, and show a `.gp-pill-badge` + `⏸ القائمة (Start)` button in the top bar.
   - Keep code crisp, light, and bug-free (NO `input[type="range"]` passive sliders, NO `backdrop-filter`, NO `shadowBlur > 0` in draw loops, NO `overrideModal` / 4-door QCM clones).
   - Respect `<html lang="ar" dir="rtl">`, include `../../shared/vendor/katex/katex.min.{css,js}` + `../../shared/arcade-core.js`, format ALL DOM math in LaTeX (`$...$` / `data-tex`) via `ArcadeCore.renderMath` (NEVER naked ASCII/Unicode math!), draw `<canvas>` math via `ArcadeCore.CanvasAxisKit.drawMathRich` (`KaTeX_Math`/`KaTeX_Main`), record progress with `ArcadeCore.Progress.recordRun`, and route exit links to `../../index.html?from=game`.
   - Strictly obey all `Hors-programme` limits in `CURRICULUM.md`!
4. **REGISTER, PLAYTEST & VISUAL SELF-REVIEW**:
   - Add bespoke SVG tile artwork in `js/hub.js` and register the game in `games.json` with a unique `creativeProfile { genre, camera, coreMechanic, controlScheme, visualStyle }`.
   - Run `bash /home/ubuntu/Math-Arcid-V2/evolution/scripts/verify.sh` (runs live Chromium CDP playtest + DualSense Start/Pause check + mobile 390px overflow + captures PNG screenshots).
   - **MANDATORY VISUAL INSPECTION**: Call `read_file` on `/home/ubuntu/Math-Arcid-V2/evolution/screenshots/<slug>_desktop.png` and `<slug>_mobile.png` to visually verify layout, KaTeX legibility, HUD spacing, and zero overlaps! Fix anything ugly and re-verify before committing.
5. Update `SPRINT.md` (mark current `[NEXT]` as `[COMPLETED]` and promote next milestone to `[NEXT]`), `STATE.json`, and `EVOLUTION_LOG.md` (<= 10 entries).
6. Pull/rebase safely (`git pull --rebase origin main || true`), commit, and push to `origin main`.
7. Send Owner Ayoub a sharp Arabic summary including `[SEND_FILE: /home/ubuntu/Math-Arcid-V2/evolution/screenshots/<slug>_desktop.png]` showing the real game screenshot, the game loop, DualSense controls, and `CURRICULUM.md` skills covered.
EOF_CREATE_PROMPT
else
  read -r -d '' PROMPT_TEMPLATE <<'EOF_POLISH_PROMPT' || true
[AUTONOMOUS EVOLUTION TRIGGER: MATH-ARCID-V2 | POLISH - __TIMESTAMP__]
You are "My Homie" (@eulerx0bot) running **Phase POLISH** (__PHASE_DESC__) in **Math-Arcid-V2** (/home/ubuntu/Math-Arcid-V2).
__RECOVERY_NOTE__

CRITICAL BOUNDARY RULE:
- Operate EXCLUSIVELY inside /home/ubuntu/Math-Arcid-V2 (GitHub: https://github.com/Ayoubvvch/Math-Arcid-V2 | Live: https://ayoubvvch.github.io/Math-Arcid-V2/).
- NEVER touch /home/ubuntu/math-arcade.

PLAYTEST & POLISH PROTOCOL:
1. Read:
   - /home/ubuntu/Math-Arcid-V2/evolution/GOLD_STANDARD.md (v4.0)
   - /home/ubuntu/Math-Arcid-V2/evolution/CURRICULUM.md
   - /home/ubuntu/Math-Arcid-V2/evolution/STATE.json
   - /home/ubuntu/Math-Arcid-V2/evolution/SPRINT.md (Execute the `[NEXT]` POLISH milestone!)
   - /home/ubuntu/Math-Arcid-V2/games.json
2. **TRUE INTERACTIVE AUDIT & VISUAL SELF-REVIEW**:
   - Run `bash /home/ubuntu/Math-Arcid-V2/evolution/scripts/verify.sh` first to capture fresh screenshots in `evolution/screenshots/` and inspect `<slug>_desktop.png` and `<slug>_mobile.png` via `read_file`!
   - Read the target game's actual code end-to-end to fix real physics/hitbox/pacing bugs, missing DualSense controls, missing `CURRICULUM.md` sub-skills, `Hors-programme` leaks, or flat game feel.
   - Deepen the **real-time fun & juice** (screen shake, hit-stop, particle bursts, procedural Web Audio SFX, dynamic difficulty curve, crisp `drawMathRich` canvas typography, full DualSense analog + face button + `PauseMenu` responsiveness — NEVER add passive `<input type="range">` sliders or QCM filler!).
3. Re-run `bash /home/ubuntu/Math-Arcid-V2/evolution/scripts/verify.sh` (all 7 gates + CDP playtest must pass 100%) and re-inspect the updated screenshots!
4. **SPRINT TRANSITION CHECK**:
   - Update `SPRINT.md`, `STATE.json`, and `EVOLUTION_LOG.md` (<= 10 entries).
   - If zero `[NEXT]` / `[UPCOMING]` milestones remain in `SPRINT.md`, set `"status": "COMPLETED_NEEDS_ROADMAP"` in `STATE.json` so Phase ARCHITECT runs automatically next cycle.
5. Pull/rebase safely (`git pull --rebase origin main || true`), commit, and push to `origin main`.
6. Send Owner Ayoub a sharp, truthful Arabic report with `[SEND_FILE: /home/ubuntu/Math-Arcid-V2/evolution/screenshots/<slug>_desktop.png]` detailing the real bugs fixed, fun/juice upgrades added, and curriculum coverage verified.
EOF_POLISH_PROMPT
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

PAYLOAD=$(node -e '
  const prompt = process.argv[1];
  console.log(JSON.stringify({
    chatId: "8959256425",
    chatKey: "auto_math_arcid_v2",
    chatTitle: "Math-Arcid-V2 Creative Monster",
    newSession: true,
    cwd: "/home/ubuntu/Math-Arcid-V2",
    model: "gemini-4-neon-xhigh",
    promptText: prompt,
    fallbackModels: [
      "gemini-4-hydrogen-xhigh",
      "claude-opus-5-5-high",
      "claude-sonnet-5-5-high",
      "gemini-4-neon-high",
      "gemini-4-hydrogen-high"
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
