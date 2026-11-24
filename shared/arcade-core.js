/**
 * Math-Arcid-V2 — Unified Platform Core Engine (`window.ArcadeCore`)
 * Classic zero-dependency UMD/IIFE shared core across the PS5 Hub and all 10 games:
 *   1. ArcadeCore.setBidiSafeMath  — RTL-safe Moroccan 2BAC PC <bdi dir="ltr"> math isolation
 *   2. ArcadeCore.Gamepad          — DualSense / DualShock deadzone, D-Pad hat, D-nav & haptics
 *   3. ArcadeCore.Progress         — Versioned localStorage cross-game telemetry & rank store
 *   4. ArcadeCore.CanvasAxisKit    — Lightweight shared 2D canvas grids, axes & LTR math labels
 */
(function (root, factory) {
  const api = factory(root);
  if (root) {
    root.ArcadeCore = api;
  }
  if (typeof module === 'object' && module && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const STORAGE_KEY = 'math_arcid_v2_progress';
  const SCHEMA_VERSION = 1;
  const RANK_ORDER = { C: 1, B: 2, A: 3, S: 4 };

  // Precompiled character classes covering full Moroccan 2BAC PC notation (Topics 1-114)
  const MATH_CORE_CLASS =
    "A-Za-z0-9\\u00C0-\\u024F\\u0300-\\u030F\\u20D0-\\u20FF" +
    "ℝℚℕℤℂΩΔΣΠΦαβγδεζηθλμπρστφψω" +
    "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ᵃᵉʰⁱᵏᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻ" +
    "₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₒₓₙₚₖᵢ" +
    "\\][(){}|√∛∜∞∅∀∃∈∉⊂⊃∪∩→←↔⇒⇔⇐↦⟹⟺≤≥≠≈≡·×÷±−≈'′″∘^_∫∑∏∂∇∧∨⊥∥∠°\\\\%";

  const MATH_BRIDGE_CLASS =
    " +\\-*/=<>≤≥≠∈∉⊂⊃∪∩∀∃→←↔⇒⇔⇐↦⟹⟺·×÷±−≈'′″∘^_:,.\\\\;∫∑∏∧∨⊥";

  const MATH_SEGMENT_REGEX = new RegExp(
    "(?:[+\\-−](?=[" + MATH_CORE_CLASS + "])|[" + MATH_CORE_CLASS + "])" +
    "(?:[" + MATH_BRIDGE_CLASS + "]*[" + MATH_CORE_CLASS + "])*",
    'g'
  );

  /**
   * Format mixed Arabic RTL + math notation safely inside isolated <bdi dir="ltr" class="math-ltr"> elements
   * so equations, vectors, overbars, probabilities, and signed numbers never fracture in RTL layouts.
   * @param {HTMLElement|null} el - Target DOM container.
   * @param {string} text - Mixed Arabic & mathematical formula string.
   * @param {Object} [opts] - Optional rendering overrides.
   * @param {string} [opts.tag='bdi'] - Element tag name ('bdi' or 'span').
   * @param {string} [opts.className='math-ltr'] - CSS class applied to math runs.
   */
  function setBidiSafeMath(el, text, opts) {
    if (!el) return;
    const doc = el.ownerDocument || (typeof document !== 'undefined' ? document : null);
    const raw = String(text ?? '');
    el.textContent = '';
    if (!doc) return;

    const tag = (opts && opts.tag) || 'bdi';
    const className = (opts && opts.className) || 'math-ltr';

    MATH_SEGMENT_REGEX.lastIndex = 0;
    let lastIdx = 0;
    let match = MATH_SEGMENT_REGEX.exec(raw);

    while (match !== null) {
      let sIdx = match.index;
      let eIdx = sIdx + match[0].length;

      // Trim trailing whitespace, sentence colons/semicolons, or unbalanced parentheses
      while (eIdx > sIdx) {
        const sub = raw.slice(sIdx, eIdx);
        const ch = sub[sub.length - 1];
        if (ch === ' ' || ch === '\t') {
          eIdx -= 1;
          continue;
        }
        if ((ch === ':' || ch === ';') && eIdx === match.index + match[0].length) {
          eIdx -= 1;
          continue;
        }
        const op = (sub.match(/\(/g) || []).length;
        const cl = (sub.match(/\)/g) || []).length;
        if ((ch === '(' && op > cl) || (ch === ')' && cl > op)) {
          eIdx -= 1;
          continue;
        }
        break;
      }

      // Trim leading whitespace or unbalanced parentheses
      while (sIdx < eIdx) {
        const sub = raw.slice(sIdx, eIdx);
        const ch = sub[0];
        const op = (sub.match(/\(/g) || []).length;
        const cl = (sub.match(/\)/g) || []).length;
        if (ch === ' ' || ch === '\t' || (ch === '(' && op > cl) || (ch === ')' && cl > op)) {
          sIdx += 1;
          continue;
        }
        break;
      }

      const tok = raw.slice(sIdx, eIdx);
      if (tok && !/^[()\[\]\s]+$/.test(tok)) {
        if (sIdx > lastIdx) {
          el.appendChild(doc.createTextNode(raw.slice(lastIdx, sIdx)));
        }
        const node = doc.createElement(tag);
        node.className = className;
        node.dir = 'ltr';
        node.textContent = tok;
        el.appendChild(node);
        lastIdx = eIdx;
      }
      match = MATH_SEGMENT_REGEX.exec(raw);
    }

    if (lastIdx < raw.length) {
      el.appendChild(doc.createTextNode(raw.slice(lastIdx)));
    }
  }

  /**
   * Standard PlayStation DualSense / DualShock & W3C Gamepad calibration utilities.
   */
  const Gamepad = {
    createState() {
      return {
        connected: false,
        index: null,
        idLabel: '',
        prevButtons: [],
        axisLeftHeld: false,
        axisRightHeld: false,
        axisUpHeld: false,
        axisDownHeld: false,
        pauseFocusIdx: 0,
        endFocusIdx: 0,
        lastShownConnected: null,
        lastShownLabel: ''
      };
    },

    /**
     * Apply radial deadzone and smooth vector rescaling in [0, 1].
     * @param {number} x - Raw X axis [-1, 1].
     * @param {number} y - Raw Y axis [-1, 1].
     * @param {number} [deadzone=0.18] - Radial threshold.
     * @returns {{x: number, y: number}} Normalized stick vector.
     */
    applyRadialDeadzone(x, y, deadzone = 0.18) {
      const mag = Math.hypot(x || 0, y || 0);
      if (mag < deadzone) return { x: 0, y: 0 };
      const norm = Math.min(1, (mag - deadzone) / Math.max(0.001, 1 - deadzone));
      return {
        x: (x / mag) * norm,
        y: (y / mag) * norm
      };
    },

    /**
     * Decode standard Linux/Chrome 8-way D-Pad hat axis (axes[9]) when present.
     * @param {Gamepad|null} gp - Browser Gamepad object.
     * @returns {{up: boolean, down: boolean, left: boolean, right: boolean}} Hat directions.
     */
    decodeDpadHat(gp) {
      const dirs = { up: false, down: false, left: false, right: false };
      const h = gp && gp.axes && gp.axes.length > 9 ? gp.axes[9] : null;
      if (typeof h === 'number' && Math.abs(h) <= 1.05 && h < 1.1) {
        if (h < -0.75) { dirs.up = true; }
        else if (h < -0.52) { dirs.up = true; dirs.right = true; }
        else if (h < -0.22) { dirs.right = true; }
        else if (h < 0.05) { dirs.right = true; dirs.down = true; }
        else if (h < 0.30) { dirs.down = true; }
        else if (h < 0.58) { dirs.down = true; dirs.left = true; }
        else if (h <= 0.85) { dirs.left = true; }
        else { dirs.left = true; dirs.up = true; }
      }
      return dirs;
    },

    /**
     * Detect rising-edge press on standard Gamepad button index.
     */
    justPressed(gp, gpState, idx, threshold = 0.55) {
      const btn = gp && gp.buttons && gp.buttons[idx];
      const pressed = Boolean(btn && (btn.pressed || btn.value > threshold));
      const was = Boolean(gpState && gpState.prevButtons[idx]);
      return pressed && !was;
    },

    /**
     * Snapshot all gamepad button states for next-frame rising-edge checks.
     */
    snapshotButtons(gp, gpState, threshold = 0.55) {
      if (!gp || !gp.buttons || !gpState) return;
      for (let i = 0; i < gp.buttons.length; i += 1) {
        const btn = gp.buttons[i];
        gpState.prevButtons[i] = Boolean(btn && (btn.pressed || btn.value > threshold));
      }
    },

    /**
     * Sample edge-triggered directional navigation across D-Pad buttons, Linux hat axis, and Left Stick.
     */
    sampleDirectionalNav(gp, gpState, threshold = 0.55) {
      if (!gp || !gpState) {
        return { dLeft: false, dRight: false, dUp: false, dDown: false };
      }
      const ax = (gp.axes && gp.axes[0]) || 0;
      const ay = (gp.axes && gp.axes[1]) || 0;
      const hat = Gamepad.decodeDpadHat(gp);

      const leftNow = ax < -threshold || hat.left;
      const rightNow = ax > threshold || hat.right;
      const upNow = ay < -threshold || hat.up;
      const downNow = ay > threshold || hat.down;

      const dLeft = Gamepad.justPressed(gp, gpState, 14) || (leftNow && !gpState.axisLeftHeld);
      const dRight = Gamepad.justPressed(gp, gpState, 15) || (rightNow && !gpState.axisRightHeld);
      const dUp = Gamepad.justPressed(gp, gpState, 12) || (upNow && !gpState.axisUpHeld);
      const dDown = Gamepad.justPressed(gp, gpState, 13) || (downNow && !gpState.axisDownHeld);

      gpState.axisLeftHeld = leftNow;
      gpState.axisRightHeld = rightNow;
      gpState.axisUpHeld = upNow;
      gpState.axisDownHeld = downNow;

      return { dLeft, dRight, dUp, dDown };
    },

    /**
     * Resolve currently active connected gamepad from navigator.getGamepads().
     */
    resolveActiveGamepad(gpState) {
      if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
      const pads = navigator.getGamepads();
      if (!pads) return null;

      if (gpState && gpState.index !== null && pads[gpState.index] && pads[gpState.index].connected) {
        return pads[gpState.index];
      }
      for (let i = 0; i < pads.length; i += 1) {
        if (pads[i] && pads[i].connected) {
          if (gpState) {
            gpState.connected = true;
            gpState.index = pads[i].index;
            const lowId = (pads[i].id || '').toLowerCase();
            gpState.idLabel = (lowId.includes('dualsense') || lowId.includes('054c') || lowId.includes('dualshock') || lowId.includes('playstation'))
              ? 'DualSense جاهز'
              : 'Gamepad متصل';
          }
          return pads[i];
        }
      }
      if (gpState) {
        gpState.connected = false;
        gpState.index = null;
        gpState.idLabel = '';
      }
      return null;
    },

    /**
     * Trigger dual-rumble haptic pulse safely on supported controllers.
     */
    triggerHaptic(gpState, duration = 90, weak = 0.35, strong = 0.55) {
      if (!gpState || !gpState.connected || gpState.index === null) return;
      if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
      const pads = navigator.getGamepads();
      const gp = pads && pads[gpState.index];
      if (!gp || !gp.vibrationActuator || typeof gp.vibrationActuator.playEffect !== 'function') {
        return;
      }
      try {
        gp.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: duration || 90,
          weakMagnitude: Math.min(1, Math.max(0, weak ?? 0.35)),
          strongMagnitude: Math.min(1, Math.max(0, strong ?? 0.55))
        }).catch(() => {});
      } catch (_) {
        // Ignore browsers blocking vibration without gesture
      }
    },

    /**
     * Synchronize DualSense status pill without redundant DOM updates.
     */
    updateBanner(gpState, pillEl, statusEl, disconnectedText = 'لوحة المفاتيح / DualSense') {
      if (!gpState || !pillEl || !statusEl) return;
      if (
        gpState.lastShownConnected === gpState.connected &&
        gpState.lastShownLabel === gpState.idLabel
      ) {
        return;
      }
      gpState.lastShownConnected = gpState.connected;
      gpState.lastShownLabel = gpState.idLabel;

      pillEl.classList.toggle('connected', gpState.connected);
      pillEl.classList.toggle('disconnected', !gpState.connected);
      statusEl.textContent = gpState.connected
        ? (gpState.idLabel || 'DualSense متصل')
        : disconnectedText;
    },

    /**
     * Apply .gp-focused highlight class across modal buttons.
     */
    applyFocusRing(btns, idx) {
      if (!btns || !btns.length) return;
      const safeIdx = ((idx % btns.length) + btns.length) % btns.length;
      for (let i = 0; i < btns.length; i += 1) {
        btns[i].classList.toggle('gp-focused', i === safeIdx);
      }
    }
  };

  /**
   * Versioned cross-game progress & 2BAC PC mastery telemetry store (`localStorage`).
   */
  let memoryFallback = null;

  function createEmptyStore() {
    return {
      schemaVersion: SCHEMA_VERSION,
      updatedAt: null,
      games: {}
    };
  }

  function createEmptyGameEntry() {
    return {
      bestScore: 0,
      bestRank: null,
      sealsCleared: 0,
      stagesCleared: 0,
      totalStages: 0,
      bossDefeated: false,
      questionsAnswered: 0,
      questionsCorrect: 0,
      lastAccuracy: null,
      bypassesUsed: 0,
      runsCompleted: 0,
      masteredTopics: [],
      weakTopics: [],
      topicStats: {},
      lastPlayedISO: null
    };
  }

  function readStore() {
    try {
      const storage = root && root.localStorage;
      if (!storage) return memoryFallback || createEmptyStore();
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyStore();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.games !== 'object') {
        return createEmptyStore();
      }
      return parsed;
    } catch (_) {
      return memoryFallback || createEmptyStore();
    }
  }

  function writeStore(store) {
    store.schemaVersion = SCHEMA_VERSION;
    store.updatedAt = new Date().toISOString();
    memoryFallback = store;
    try {
      const storage = root && root.localStorage;
      if (storage) {
        storage.setItem(STORAGE_KEY, JSON.stringify(store));
      }
    } catch (_) {
      // Ignore QuotaExceededError or private browsing blocks
    }
    return store;
  }

  function ensureEntry(store, gameId) {
    if (!store.games[gameId]) {
      store.games[gameId] = createEmptyGameEntry();
    }
    return store.games[gameId];
  }

  const Progress = {
    STORAGE_KEY,

    computeRank(summary) {
      const s = summary || {};
      const victory = Boolean(s.victory);
      const seals = Number(s.sealsCleared || 0);
      const acc = typeof s.accuracy === 'number' ? s.accuracy : 100;
      const bypasses = Number(s.bypasses || 0);

      if (victory && acc >= 85 && bypasses === 0) return 'S';
      if (victory || (seals >= 4 && acc >= 75)) return 'A';
      if (seals >= 2 || acc >= 55) return 'B';
      return 'C';
    },

    recordAnswer(gameId, topicId, isCorrect) {
      if (!gameId) return null;
      const store = readStore();
      const entry = ensureEntry(store, gameId);
      entry.questionsAnswered += 1;
      if (isCorrect) entry.questionsCorrect += 1;
      entry.lastPlayedISO = new Date().toISOString();

      if (topicId !== undefined && topicId !== null) {
        const key = String(topicId);
        if (!entry.topicStats[key]) entry.topicStats[key] = { attempts: 0, correct: 0 };
        entry.topicStats[key].attempts += 1;
        if (isCorrect) entry.topicStats[key].correct += 1;

        const stats = entry.topicStats[key];
        const ratio = stats.attempts > 0 ? stats.correct / stats.attempts : 0;
        const mSet = new Set(entry.masteredTopics || []);
        const wSet = new Set(entry.weakTopics || []);
        if (stats.correct >= 1 && ratio >= 0.6) {
          mSet.add(key);
          wSet.delete(key);
        } else if (stats.attempts >= 2 && ratio < 0.6) {
          wSet.add(key);
        }
        entry.masteredTopics = Array.from(mSet);
        entry.weakTopics = Array.from(wSet);
      }

      writeStore(store);
      return entry;
    },

    recordSealProgress(gameId, sealsCleared) {
      if (!gameId) return null;
      const store = readStore();
      const entry = ensureEntry(store, gameId);
      const clamped = Math.max(0, Math.min(4, Number(sealsCleared || 0)));
      if (clamped > entry.sealsCleared) {
        entry.sealsCleared = clamped;
      }
      entry.lastPlayedISO = new Date().toISOString();
      writeStore(store);
      return entry;
    },

    recordRun(gameId, run) {
      if (!gameId || !run) return null;
      const store = readStore();
      const entry = ensureEntry(store, gameId);

      const score = Math.max(0, Math.round(Number(run.score || 0)));
      const hasStages = typeof run.totalStages === 'number' && run.totalStages > 0;
      const totalStages = hasStages ? Math.max(1, Math.round(run.totalStages)) : (entry.totalStages || 4);
      const rawStages = typeof run.stagesCleared === 'number' ? run.stagesCleared : Number(run.sealsCleared || 0);
      const stagesCleared = Math.max(0, Math.min(totalStages, Number(rawStages || 0)));
      const seals = Math.max(0, Math.min(4, Number(run.sealsCleared !== undefined ? run.sealsCleared : Math.round((stagesCleared / totalStages) * 4))));
      const qAns = Math.max(0, Number(run.runQuestionsAnswered || 0));
      const qCorr = Math.max(0, Number(run.runQuestionsCorrect || 0));
      const accuracy = typeof run.accuracy === 'number'
        ? Math.max(0, Math.min(100, Math.round(run.accuracy)))
        : (qAns > 0 ? Math.round((qCorr / qAns) * 100) : 100);
      const bypasses = Math.max(0, Number(run.bypasses || 0));
      const victory = Boolean(run.victory);

      const isNewBest = score > entry.bestScore;
      if (isNewBest) entry.bestScore = score;
      if (seals > entry.sealsCleared) entry.sealsCleared = seals;
      if (hasStages) entry.totalStages = totalStages;
      if (stagesCleared > (entry.stagesCleared || 0)) entry.stagesCleared = stagesCleared;
      if (victory) entry.bossDefeated = true;

      const rank = run.rank || Progress.computeRank({
        victory,
        accuracy,
        sealsCleared: Math.round((stagesCleared / totalStages) * 4),
        bypasses
      });
      if (!entry.bestRank || (RANK_ORDER[rank] || 0) > (RANK_ORDER[entry.bestRank] || 0)) {
        entry.bestRank = rank;
      }

      if (!run.answersAlreadyRecorded) {
        entry.questionsAnswered += qAns;
        entry.questionsCorrect += qCorr;
      }

      entry.lastAccuracy = accuracy;
      entry.bypassesUsed += bypasses;
      entry.runsCompleted += 1;
      entry.lastPlayedISO = new Date().toISOString();

      writeStore(store);
      return { entry, rank, isNewBest, accuracy };
    },

    getGameProgress(gameId) {
      const store = readStore();
      return store.games[gameId] || createEmptyGameEntry();
    },

    getAllProgress() {
      return readStore();
    },

    getSummary(totalGames = 1) {
      const store = readStore();
      const entries = Object.values(store.games || {});
      let gamesPlayed = 0;
      let bossesDefeated = 0;
      let totalSeals = 0;
      let totalStagesMax = 0;
      let questionsAnswered = 0;
      let questionsCorrect = 0;

      for (let i = 0; i < entries.length; i += 1) {
        const g = entries[i];
        if (!g) continue;
        const tStages = g.totalStages > 0 ? g.totalStages : 4;
        const cStages = typeof g.stagesCleared === 'number' && g.totalStages > 0
          ? g.stagesCleared
          : Number(g.sealsCleared || 0);
        if ((g.runsCompleted || 0) > 0 || (g.questionsAnswered || 0) > 0 || cStages > 0) {
          gamesPlayed += 1;
        }
        if (g.bossDefeated) bossesDefeated += 1;
        totalSeals += cStages;
        totalStagesMax += tStages;
        questionsAnswered += Number(g.questionsAnswered || 0);
        questionsCorrect += Number(g.questionsCorrect || 0);
      }

      const accuracyPct = questionsAnswered > 0
        ? Math.round((questionsCorrect / questionsAnswered) * 100)
        : 0;

      return {
        totalGames,
        gamesPlayed,
        bossesDefeated,
        totalSeals,
        totalStagesMax: Math.max(totalStagesMax, totalGames * 4),
        questionsAnswered,
        questionsCorrect,
        accuracyPct,
        updatedAt: store.updatedAt
      };
    },

    computeGameMetrics(gameId) {
      const e = Progress.getGameProgress(gameId);
      const bestScore = Math.max(0, Number(e.bestScore || 0));
      const totalStages = e.totalStages > 0 ? Math.max(1, Number(e.totalStages)) : 4;
      const stagesCleared = e.totalStages > 0
        ? Math.max(0, Math.min(totalStages, Number(e.stagesCleared || 0)))
        : Math.max(0, Math.min(4, Number(e.sealsCleared || 0)));
      const sealsCleared = Math.max(0, Math.min(4, Number(e.sealsCleared || 0)));
      const bossDefeated = Boolean(e.bossDefeated);
      const qAns = Math.max(0, Number(e.questionsAnswered || 0));
      const qCorr = Math.max(0, Number(e.questionsCorrect || 0));
      const accuracyPct = qAns > 0
        ? Math.min(100, Math.round((qCorr / qAns) * 100))
        : (typeof e.lastAccuracy === 'number' ? Math.max(0, Math.min(100, Math.round(e.lastAccuracy))) : 0);
      const masteredTopics = Array.isArray(e.masteredTopics) ? e.masteredTopics : [];
      const weakTopics = Array.isArray(e.weakTopics) ? e.weakTopics : [];
      const played = Boolean(
        (e.runsCompleted || 0) > 0 || qAns > 0 || stagesCleared > 0 || bossDefeated || bestScore > 0
      );

      // Weighted 0..100 mastery progress: 50% stages/challenges, 25% completion/victory, 25% accuracy
      const stageScore = (stagesCleared / totalStages) * 50;
      const bossScore = bossDefeated ? 25 : 0;
      const accScore = played ? ((qAns > 0 || typeof e.lastAccuracy === 'number') ? (accuracyPct / 100) * 25 : (bestScore > 0 ? 15 : 0)) : 0;
      const masteryPct = Math.max(0, Math.min(100, Math.round(stageScore + bossScore + accScore)));

      return {
        bestScore,
        bestRank: e.bestRank || null,
        sealsCleared,
        stagesCleared,
        totalStages,
        bossDefeated,
        questionsAnswered: qAns,
        questionsCorrect: qCorr,
        accuracyPct,
        runsCompleted: Number(e.runsCompleted || 0),
        masteredTopics,
        weakTopics,
        played,
        masteryPct,
        lastPlayedISO: e.lastPlayedISO || null
      };
    },

    getSmartReviewQueue(gamesList) {
      const list = Array.isArray(gamesList) ? gamesList : [];
      const items = [];

      for (let i = 0; i < list.length; i += 1) {
        const g = list[i];
        if (!g || !g.id) continue;
        const m = Progress.computeGameMetrics(g.id);
        let priority = 0;
        let tag = 'متقن';
        let reason = 'وحدة مكتملة بنجاح';

        if (m.weakTopics.length > 0 || (m.questionsAnswered >= 2 && m.accuracyPct < 75)) {
          priority = 3;
          tag = 'أولوية قصوى';
          reason = m.weakTopics.length > 0
            ? `${m.weakTopics.length} محاور ضعيفة • دقة ${m.accuracyPct}%`
            : `دقة ${m.accuracyPct}% تحتاج تعزيزاً`;
        } else if (m.played && !m.bossDefeated) {
          priority = 2;
          tag = 'استكمال';
          reason = `تقدّم جزئي (${m.stagesCleared}/${m.totalStages} مراحل) قبل الإكمال`;
        } else if (!m.played) {
          priority = 1;
          tag = 'لم تبدأ';
          reason = g.topicRange ? `وحدة لم تُفتح بعد (${g.topicRange})` : 'وحدة تأسيس جاهزة للانطلاق';
        } else if (m.bestRank === 'B' || m.bestRank === 'C') {
          priority = 1;
          tag = 'تحسين الرتبة';
          reason = `ترقية الرتبة الحالية (${m.bestRank}) نحو A / S`;
        }

        if (priority > 0) {
          items.push({ game: g, metrics: m, priority, tag, reason });
        }
      }

      items.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        if (a.priority === 3 && a.metrics.accuracyPct !== b.metrics.accuracyPct) {
          return a.metrics.accuracyPct - b.metrics.accuracyPct;
        }
        const oa = typeof a.game.order === 'number' ? a.game.order : 9999;
        const ob = typeof b.game.order === 'number' ? b.game.order : 9999;
        return oa - ob;
      });

      return items;
    },

    exportJSON() {
      return JSON.stringify(readStore(), null, 2);
    },

    importJSON(raw) {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!parsed || typeof parsed !== 'object' || !parsed.games || typeof parsed.games !== 'object' || Array.isArray(parsed.games)) {
        throw new Error('Invalid ArcadeCore progress backup format.');
      }
      const normalized = createEmptyStore();
      const keys = Object.keys(parsed.games);
      for (let i = 0; i < keys.length; i += 1) {
        const gid = keys[i];
        const src = parsed.games[gid];
        if (src && typeof src === 'object' && !Array.isArray(src)) {
          normalized.games[gid] = Object.assign(createEmptyGameEntry(), src);
        }
      }
      return writeStore(normalized);
    },

    resetGame(gameId) {
      const store = readStore();
      delete store.games[gameId];
      return writeStore(store);
    },

    resetAll() {
      return writeStore(createEmptyStore());
    }
  };

  /**
   * Lightweight 2D Cartesian grid, axis, asymptote & LTR math-label helper for graphSpec canvases.
   */
  const CanvasAxisKit = {
    clearWithGrid(ctx, w, h, opts) {
      if (!ctx) return;
      const o = opts || {};
      const bg = o.bg || '#060c1f';
      const gridColor = o.gridColor || 'rgba(56, 189, 248, 0.1)';
      const step = o.step || 32;
      const offset = o.offset !== undefined ? o.offset : 24;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = offset; x < w; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = offset; y < h; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    },

    drawCartesianAxes(ctx, opts) {
      if (!ctx) return;
      const o = opts || {};
      const w = o.w || 390;
      const h = o.h || 185;
      const ox = o.ox !== undefined ? o.ox : w * 0.5;
      const oy = o.oy !== undefined ? o.oy : h * 0.55;
      const axisColor = o.axisColor || 'rgba(148, 163, 184, 0.55)';
      const labelColor = o.labelColor || '#94a3b8';

      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(12, oy);
      ctx.lineTo(w - 12, oy);
      ctx.moveTo(ox, h - 10);
      ctx.lineTo(ox, 10);
      ctx.stroke();

      CanvasAxisKit.drawMathLabel(ctx, o.xLabel || 'x', w - 18, oy - 8, { color: labelColor });
      CanvasAxisKit.drawMathLabel(ctx, o.yLabel || 'y', ox + 10, 16, { color: labelColor });
      if (o.showOrigin !== false) {
        CanvasAxisKit.drawMathLabel(ctx, 'O', ox - 10, oy + 13, { color: labelColor });
      }
    },

    drawDashedLine(ctx, x1, y1, x2, y2, color, dash, lineWidth) {
      if (!ctx) return;
      ctx.save();
      ctx.setLineDash(dash || [5, 5]);
      ctx.strokeStyle = color || '#fbbf24';
      ctx.lineWidth = lineWidth || 1.6;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    },

    drawMathLabel(ctx, text, x, y, opts) {
      if (!ctx) return;
      const o = opts || {};
      ctx.save();
      ctx.direction = 'ltr';
      ctx.font = o.font || '800 11px "JetBrains Mono", monospace';
      ctx.textAlign = o.align || 'center';
      ctx.textBaseline = o.baseline || 'alphabetic';
      ctx.fillStyle = o.color || '#f8fafc';
      ctx.fillText(String(text ?? ''), x, y);
      ctx.restore();
    }
  };

  return {
    version: '1.1.0',
    setBidiSafeMath,
    Gamepad,
    Progress,
    CanvasAxisKit
  };
});
