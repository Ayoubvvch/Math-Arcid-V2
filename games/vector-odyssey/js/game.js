/**
 * Vector Odyssey (أوديسا الفضاء المتجهي) — Main Game Orchestrator
 * Manages DPR-scaled 60FPS loop, Bidi-safe math rendering, HUD state diffing,
 * Orbital Seal Override Modals, filter modes, and endgame telemetry.
 */

(function () {
  'use strict';

  const FILTER_MODES = [
    {
      id: 'all',
      label: 'جميع المحاور (91-102)',
      topics: [91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102]
    },
    {
      id: 'sectionA',
      label: 'السلمي والمتجهي والمستوى (91-96)',
      topics: [91, 92, 93, 94, 95, 96]
    },
    {
      id: 'sectionB',
      label: 'الفلكة والأوضاع النسبية (97-102)',
      topics: [97, 98, 99, 100, 101, 102]
    }
  ];

  let filterIdx = 0;
  let state = null;
  let activeGate = null;
  let activeQuestion = null;
  let recentQuestionIds = [];
  let hintRevealed = false;
  let rafId = null;
  let lastFrameMs = 0;

  let canvas = null;
  let ctx = null;
  let viewW = 1280;
  let viewH = 720;

  const hudCache = {
    hpText: '',
    hpPct: '',
    energyText: '',
    energyPct: '',
    gatesText: '',
    wingText: '',
    scoreText: '',
    comboText: '',
    comboVisible: null,
    filterText: '',
    bannerText: '',
    boostCd: null,
    rollCd: null,
    aegisCd: null,
    overdriveCd: null,
    nearGate: null
  };

  let hudEls = null;

  /**
   * Cache HUD, Modal, and Action Deck DOM elements once at boot.
   * @returns {Object} Cached DOM references.
   */
  function getHudEls() {
    if (hudEls) return hudEls;
    hudEls = {
      hpValue: document.getElementById('hpValue'),
      hpFill: document.getElementById('hpFill'),
      energyValue: document.getElementById('energyValue'),
      energyFill: document.getElementById('energyFill'),
      gatesValue: document.getElementById('gatesValue'),
      wingValue: document.getElementById('wingValue'),
      scoreValue: document.getElementById('scoreValue'),
      comboBadge: document.getElementById('comboBadge'),
      comboCount: document.getElementById('comboCount'),
      filterChipLabel: document.getElementById('filterChipLabel'),
      sectorBanner: document.getElementById('sectorBanner'),
      btnAudioToggle: document.getElementById('btnAudioToggle'),
      btnHelpToggle: document.getElementById('btnHelpToggle'),
      btnPauseToggle: document.getElementById('btnPauseToggle'),
      actBoost: document.getElementById('actBoost'),
      actRoll: document.getElementById('actRoll'),
      actOverride: document.getElementById('actOverride'),
      actAegis: document.getElementById('actAegis'),
      actOverdrive: document.getElementById('actOverdrive'),
      introModal: document.getElementById('introModal'),
      btnStartOdyssey: document.getElementById('btnStartOdyssey'),
      filterBtns: Array.from(document.querySelectorAll('#introFilterGrid .filter-btn')),
      overrideModal: document.getElementById('overrideModal'),
      seqSourceTag: document.getElementById('seqSourceTag'),
      seqTopicTag: document.getElementById('seqTopicTag'),
      seqPrompt: document.getElementById('seqPrompt'),
      seqGraphWrap: document.getElementById('seqGraphWrap'),
      seqGraphCanvas: document.getElementById('seqGraphCanvas'),
      seqHintBox: document.getElementById('seqHintBox'),
      seqOpts: [
        document.getElementById('seqOpt0'),
        document.getElementById('seqOpt1'),
        document.getElementById('seqOpt2'),
        document.getElementById('seqOpt3')
      ],
      btnToggleHint: document.getElementById('btnToggleHint'),
      btnOverdriveBypass: document.getElementById('btnOverdriveBypass'),
      pauseModal: document.getElementById('pauseModal'),
      btnResumeGame: document.getElementById('btnResumeGame'),
      btnCycleFilterPause: document.getElementById('btnCycleFilterPause'),
      btnToggleSoundPause: document.getElementById('btnToggleSoundPause'),
      btnRestartPause: document.getElementById('btnRestartPause'),
      btnExitHubPause: document.getElementById('btnExitHubPause'),
      endModal: document.getElementById('endModal'),
      endTitle: document.getElementById('endTitle'),
      endSubtitle: document.getElementById('endSubtitle'),
      endGates: document.getElementById('endGates'),
      endScore: document.getElementById('endScore'),
      endAccuracy: document.getElementById('endAccuracy'),
      endBypasses: document.getElementById('endBypasses'),
      btnRetryEnd: document.getElementById('btnRetryEnd'),
      btnHubEnd: document.getElementById('btnHubEnd')
    };
    return hudEls;
  }

  /**
   * Format mixed Arabic + ASCII/Unicode math notation safely with .math-ltr spans
   * so equations never reverse in RTL paragraphs.
   * @param {HTMLElement|null} el - Target element.
   * @param {string} text - Raw text containing Arabic & math expressions.
   */
  function setBidiSafeMath(el, text) {
    if (!el) return;
    const raw = String(text ?? '');
    el.textContent = '';

    const mathSegmentRegex = /([A-Za-z0-9ℝ³∧·⊥Ωπ∪∩∈∉∅∞√°±≤≥≠≈≡×÷→⇒⇔+\-*/=^_{}()[\]|.,:;<>'"]+(?:\s+[A-Za-z0-9ℝ³∧·⊥Ωπ∪∩∈∉∅∞√°±≤≥≠≈≡×÷→⇒⇔+\-*/=^_{}()[\]|.,:;<>'"]+)*)/g;
    let lastIdx = 0;
    let match = mathSegmentRegex.exec(raw);
    while (match !== null) {
      if (match.index > lastIdx) {
        el.appendChild(document.createTextNode(raw.slice(lastIdx, match.index)));
      }
      const span = document.createElement('span');
      span.className = 'math-ltr';
      span.dir = 'ltr';
      span.textContent = match[0];
      el.appendChild(span);
      lastIdx = match.index + match[0].length;
      match = mathSegmentRegex.exec(raw);
    }
    if (lastIdx < raw.length) {
      el.appendChild(document.createTextNode(raw.slice(lastIdx)));
    }
  }

  /**
   * Dedicated sequence/equation prompt wrapper around setBidiSafeMath.
   * @param {HTMLElement|null} el - Target prompt/option container.
   * @param {string} text - Prompt or option text.
   */
  function setSeqBidiSafeMath(el, text) {
    setBidiSafeMath(el, text);
  }

  /**
   * Resize main viewport canvas with capped DPR <= 2.
   */
  function handleResize() {
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    viewW = Math.max(320, window.innerWidth);
    viewH = Math.max(320, window.innerHeight);
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    canvas.style.width = `${viewW}px`;
    canvas.style.height = `${viewH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (state && state.camera) {
      state.camera.zoom = viewW < 640 ? 0.78 : viewW < 1000 ? 0.9 : 1;
    }
  }

  /**
   * Toggle modal visibility with clean aria-hidden synchronization.
   * @param {HTMLElement|null} modalEl - Modal element.
   * @param {boolean} visible - Open state.
   */
  function setModalOpen(modalEl, visible) {
    if (!modalEl) return;
    if (visible) {
      modalEl.classList.remove('hidden');
      modalEl.setAttribute('aria-hidden', 'false');
    } else {
      modalEl.classList.add('hidden');
      modalEl.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Reset world state and transition directly into active play or intro.
   * @param {boolean} [autoPlay=true] - Start immediately in 'play' mode.
   */
  function resetMissionState(autoPlay) {
    const modeFilter = FILTER_MODES[filterIdx];
    state = window.createInitialOdysseyState(modeFilter.id);
    state.allowedTopics = modeFilter.topics.slice();
    activeGate = null;
    activeQuestion = null;
    recentQuestionIds = [];
    hintRevealed = false;
    handleResize();

    const els = getHudEls();
    setModalOpen(els.overrideModal, false);
    setModalOpen(els.pauseModal, false);
    setModalOpen(els.endModal, false);

    if (autoPlay) {
      state.mode = 'play';
      setModalOpen(els.introModal, false);
      window.setOdysseyBanner(state, 'اخترق الأختام الأربعة لتحرير نواة الفلكة Ω', 4.5);
    } else {
      state.mode = 'intro';
      setModalOpen(els.introModal, true);
    }
    syncFilterButtonsUI();
    syncHUD(state);
  }

  /**
   * Update active filter button styling across intro modal and HUD chip.
   */
  function syncFilterButtonsUI() {
    const els = getHudEls();
    const active = FILTER_MODES[filterIdx];
    for (let i = 0; i < els.filterBtns.length; i += 1) {
      const btn = els.filterBtns[i];
      const match = btn.dataset.filter === active.id;
      btn.classList.toggle('active', match);
    }
    if (els.filterChipLabel && hudCache.filterText !== active.label) {
      hudCache.filterText = active.label;
      els.filterChipLabel.textContent = active.label;
    }
    if (els.btnCycleFilterPause) {
      els.btnCycleFilterPause.textContent = `تغيير محور التدريب: ${active.label}`;
    }
  }

  /**
   * Cycle topic filter forward or backward.
   * @param {number} dir - Direction (+1 or -1).
   */
  window.cycleOdysseyFilter = function cycleOdysseyFilter(dir) {
    const step = dir >= 0 ? 1 : -1;
    filterIdx = (filterIdx + step + FILTER_MODES.length) % FILTER_MODES.length;
    const modeFilter = FILTER_MODES[filterIdx];
    if (state) {
      state.topicFilter = modeFilter.id;
      state.allowedTopics = modeFilter.topics.slice();
    }
    syncFilterButtonsUI();
    window.OdysseyAudio?.playUiTick();
  };

  /**
   * Start mission from Intro Modal.
   */
  window.startOdysseyFromIntro = function startOdysseyFromIntro() {
    window.OdysseyAudio?.init();
    window.OdysseyAudio?.playUiTick();
    window.lockOdysseyInputBriefly?.(220);
    resetMissionState(true);
  };

  /**
   * Open Pause Modal from gameplay.
   */
  window.openOdysseyPause = function openOdysseyPause() {
    if (!state || state.mode !== 'play') return;
    state.mode = 'pause';
    const els = getHudEls();
    syncFilterButtonsUI();
    setModalOpen(els.pauseModal, true);
    window.lockOdysseyInputBriefly?.(200);
    window.applyOdysseyPauseFocus?.();
    window.OdysseyAudio?.playUiTick();
  };

  /**
   * Resume gameplay from Pause Modal.
   */
  window.closeOdysseyPause = function closeOdysseyPause() {
    if (!state || state.mode !== 'pause') return;
    const els = getHudEls();
    setModalOpen(els.pauseModal, false);
    state.mode = 'play';
    window.lockOdysseyInputBriefly?.(220);
    window.OdysseyAudio?.playUiTick();
  };

  /**
   * Open Override Modal when near an unbroken Orbital Seal gate.
   * @param {Object} liveState - World state.
   */
  window.triggerNearestOdysseyGate = function triggerNearestOdysseyGate(liveState) {
    const s = liveState || state;
    if (!s || s.mode !== 'play') return;

    const nearest = window.findNearestOdysseyInteract(s);
    if (!nearest) {
      window.setOdysseyBanner(s, 'اقترب من بوابة ختم مدارية لاختراقها [□ / E]', 2.0);
      return;
    }

    if (nearest.kind === 'execute' && nearest.enemy) {
      s.player.energy = Math.min(s.player.maxEnergy, s.player.energy + 25);
      s.player.hp = Math.min(s.player.maxHp, s.player.hp + 15);
      window.damageOdysseyEnemy?.(s, nearest.enemy, 9999, true, true);
      window.OdysseyAudio?.playGateBreak?.();
      window.triggerOdysseyHaptic?.(140, 0.55, 0.85);
      window.addOdysseyFloatText(s, s.player.x, s.player.y - 32, 'تفكيك قسري!', '#4ade80', 1.2);
      syncHUD(s);
      return;
    }

    const gate = nearest.gate || nearest;
    state = s;
    activeGate = gate;
    const topicPool = s.topicFilter === 'all'
      ? (gate.topics || s.allowedTopics)
      : s.allowedTopics;
    activeQuestion = window.pickOdysseyChallenge(
      s.topicFilter,
      topicPool,
      recentQuestionIds
    );
    if (!activeQuestion) return;

    recentQuestionIds.push(activeQuestion.id);
    if (recentQuestionIds.length > 10) recentQuestionIds.shift();

    hintRevealed = false;
    s.mode = 'override';

    const els = getHudEls();
    const topicTitle = (window.ODYSSEY_TOPICS && window.ODYSSEY_TOPICS[activeQuestion.topic]) || '';
    if (els.seqSourceTag) {
      els.seqSourceTag.textContent = `${gate.sectorName} • 2BAC PC`;
    }
    if (els.seqTopicTag) {
      els.seqTopicTag.textContent = `محور ${activeQuestion.topic}: ${topicTitle}`;
    }
    setSeqBidiSafeMath(els.seqPrompt, activeQuestion.prompt);

    if (els.seqHintBox) {
      setBidiSafeMath(els.seqHintBox, activeQuestion.hint || '');
      els.seqHintBox.classList.add('hidden');
    }

    for (let i = 0; i < 4; i += 1) {
      const btn = els.seqOpts[i];
      if (!btn) continue;
      btn.classList.remove('correct', 'wrong');
      const keyTag = ['×', '○', '□', '△'][i];
      btn.textContent = '';
      const badge = document.createElement('span');
      badge.className = 'opt-gp-badge';
      badge.textContent = `${keyTag} / ${i + 1}`;
      const body = document.createElement('span');
      body.className = 'opt-body';
      setSeqBidiSafeMath(body, activeQuestion.options[i] || '');
      btn.appendChild(badge);
      btn.appendChild(body);
    }

    if (els.seqGraphWrap && els.seqGraphCanvas && activeQuestion.graphSpec) {
      els.seqGraphWrap.classList.remove('hidden');
      window.drawOdysseyGraph?.(els.seqGraphCanvas, activeQuestion.graphSpec);
    } else if (els.seqGraphWrap) {
      els.seqGraphWrap.classList.add('hidden');
    }

    setModalOpen(els.overrideModal, true);
    window.lockOdysseyInputBriefly?.(220);
    window.OdysseyAudio?.playUiTick();
  };

  /**
   * Complete gate unlock sequence and trigger HyperSphere Boss if all 4 seals are open.
   */
  function completeGateUnlock(isBypass) {
    const els = getHudEls();
    if (activeGate) {
      activeGate.broken = true;
      state.stats.brokenGates += 1;
      state.stats.score += isBypass ? 90 : 250;
      state.stats.combo += 1;
      state.stats.comboTimer = 5.0;
      window.spawnOdysseyParticles(state, activeGate.x, activeGate.y, 24, '#4ade80', 260);
      window.addOdysseyFloatText(
        state,
        activeGate.x,
        activeGate.y - 38,
        isBypass ? 'تجاوز قسري للختم!' : 'تم فتح الختم المداري!',
        '#4ade80',
        1.4
      );
    }

    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 22);
    state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 45);
    setModalOpen(els.overrideModal, false);
    state.mode = 'play';
    activeGate = null;
    activeQuestion = null;
    window.lockOdysseyInputBriefly?.(240);

    if (state.stats.brokenGates >= state.gates.length && !state.bossSpawned) {
      window.spawnHyperSphereBoss(state);
    }
    syncHUD(state);
  }

  /**
   * Evaluate player option submission in Override Equation Modal.
   * @param {number} idx - Option index [0..3].
   */
  window.submitOdysseyOption = function submitOdysseyOption(idx) {
    if (!state || state.mode !== 'override' || !activeQuestion) return;
    const els = getHudEls();
    const btn = els.seqOpts[idx];

    state.stats.questionsAnswered += 1;
    const correctIdx = typeof activeQuestion.correctIndex === 'number'
      ? activeQuestion.correctIndex
      : activeQuestion.answerIndex;
    if (idx === correctIdx) {
      state.stats.questionsCorrect += 1;
      if (btn) btn.classList.add('correct');
      window.OdysseyAudio?.playGateBreak();
      window.triggerOdysseyHaptic?.(120, 0.45, 0.75);
      completeGateUnlock(false);
    } else {
      if (btn) btn.classList.add('wrong');
      state.player.hp = Math.max(0, state.player.hp - 12);
      state.stats.combo = 0;
      state.screenShake = Math.max(state.screenShake || 0, 9);
      if (state.camera) state.camera.shake = state.screenShake;
      window.OdysseyAudio?.playOverrideFail();
      window.triggerOdysseyHaptic?.(140, 0.65, 0.85);
      window.setOdysseyBanner(state, 'معادلة خاطئة! فقدان 12 من الدرع', 2.2);

      if (state.player.hp <= 0) {
        setModalOpen(els.overrideModal, false);
        window.finishOdysseyGame(state, false);
        return;
      }
      syncHUD(state);
    }
  };

  /**
   * Reveal or hide tactical 2BAC mathematical hint inside Override Modal.
   */
  window.toggleOdysseyHint = function toggleOdysseyHint() {
    const els = getHudEls();
    if (!els.seqHintBox || !activeQuestion) return;
    hintRevealed = !hintRevealed;
    els.seqHintBox.classList.toggle('hidden', !hintRevealed);
    window.OdysseyAudio?.playUiTick();
  };

  /**
   * Spend 40 Energy inside Override Modal to force-bypass the active seal.
   */
  window.triggerOdysseyOverdriveBypass = function triggerOdysseyOverdriveBypass() {
    if (!state || state.mode !== 'override') return;
    if (state.player.energy < 40) {
      window.setOdysseyBanner(state, 'تحتاج إلى 40 طاقة على الأقل للتجاوز السريع', 2.0);
      window.OdysseyAudio?.playOverrideFail();
      return;
    }
    state.player.energy -= 40;
    state.stats.bypasses += 1;
    window.OdysseyAudio?.playOverdrive();
    window.triggerOdysseyHaptic?.(150, 0.6, 0.9);
    completeGateUnlock(true);
  };

  /**
   * Finalize mission (victory or defeat) and open summary modal.
   * @param {Object} liveState - World state.
   * @param {boolean} victory - True if Boss defeated.
   */
  window.finishOdysseyGame = function finishOdysseyGame(liveState, victory) {
    const s = liveState || state;
    if (!s || s.mode === 'end') return;
    s.mode = 'end';

    const els = getHudEls();
    setModalOpen(els.overrideModal, false);
    setModalOpen(els.pauseModal, false);

    if (els.endTitle) {
      els.endTitle.textContent = victory
        ? 'تم تحرير الفضاء الإقليدي ℝ³!'
        : 'انهار درع المركبة VECTRA-ℝ³';
    }
    if (els.endSubtitle) {
      els.endSubtitle.textContent = victory
        ? 'انتصار ساحق! أتقنت الفلكة، الجداء المتجهي والأوضاع النسبية.'
        : 'أعد الضبط المداري وحاول اختراق الأختام الفضائية مجدداً.';
    }
    if (els.endGates) els.endGates.textContent = `${s.stats.brokenGates}/4`;
    if (els.endScore) els.endScore.textContent = String(s.stats.score);

    const acc = s.stats.questionsAnswered > 0
      ? Math.round((s.stats.questionsCorrect / s.stats.questionsAnswered) * 100)
      : 100;
    if (els.endAccuracy) els.endAccuracy.textContent = `${acc}%`;
    if (els.endBypasses) els.endBypasses.textContent = String(s.stats.bypasses);

    setModalOpen(els.endModal, true);
    window.lockOdysseyInputBriefly?.(260);
    window.applyOdysseyEndFocus?.();

    if (victory) {
      window.OdysseyAudio?.playVictory();
    } else {
      window.OdysseyAudio?.playOverrideFail();
    }
  };

  /**
   * Synchronize HUD values cleanly without redundant DOM writes.
   * @param {Object} s - World state.
   */
  function syncHUD(s) {
    if (!s) return;
    const els = getHudEls();
    const p = s.player;

    const hpText = `${Math.ceil(p.hp)}/${p.maxHp}`;
    const hpPct = `${Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100)).toFixed(1)}%`;
    if (hudCache.hpText !== hpText && els.hpValue) {
      hudCache.hpText = hpText;
      els.hpValue.textContent = hpText;
    }
    if (hudCache.hpPct !== hpPct && els.hpFill) {
      hudCache.hpPct = hpPct;
      els.hpFill.style.width = hpPct;
    }

    const energyText = `${Math.floor(p.energy)}/${p.maxEnergy}`;
    const energyPct = `${Math.max(0, Math.min(100, (p.energy / p.maxEnergy) * 100)).toFixed(1)}%`;
    if (hudCache.energyText !== energyText && els.energyValue) {
      hudCache.energyText = energyText;
      els.energyValue.textContent = energyText;
    }
    if (hudCache.energyPct !== energyPct && els.energyFill) {
      hudCache.energyPct = energyPct;
      els.energyFill.style.width = energyPct;
    }

    const gatesText = `${s.stats.brokenGates}/4`;
    if (hudCache.gatesText !== gatesText && els.gatesValue) {
      hudCache.gatesText = gatesText;
      els.gatesValue.textContent = gatesText;
    }

    const sectorLabel = window.getOdysseySectorLabel?.(p.x, p.y) || 'ℝ³ Core';
    if (hudCache.wingText !== sectorLabel && els.wingValue) {
      hudCache.wingText = sectorLabel;
      els.wingValue.textContent = sectorLabel;
    }

    const scoreText = String(s.stats.score);
    if (hudCache.scoreText !== scoreText && els.scoreValue) {
      hudCache.scoreText = scoreText;
      els.scoreValue.textContent = scoreText;
    }

    const showCombo = s.stats.combo > 1;
    const comboStr = `×${s.stats.combo}`;
    if (hudCache.comboVisible !== showCombo && els.comboBadge) {
      hudCache.comboVisible = showCombo;
      els.comboBadge.classList.toggle('hidden', !showCombo);
    }
    if (hudCache.comboText !== comboStr && els.comboCount) {
      hudCache.comboText = comboStr;
      els.comboCount.textContent = comboStr;
    }

    const bannerStr = s.bannerTimer > 0 ? s.bannerText : '';
    if (hudCache.bannerText !== bannerStr && els.sectorBanner) {
      hudCache.bannerText = bannerStr;
      els.sectorBanner.textContent = bannerStr;
      els.sectorBanner.classList.toggle('hidden', !bannerStr);
    }

    // Cooldown indicators on bottom action deck
    const boostCd = p.boostCooldown > 0.05;
    if (hudCache.boostCd !== boostCd && els.actBoost) {
      hudCache.boostCd = boostCd;
      els.actBoost.classList.toggle('cooldown', boostCd);
    }
    const rollCd = p.rollCooldown > 0.05;
    if (hudCache.rollCd !== rollCd && els.actRoll) {
      hudCache.rollCd = rollCd;
      els.actRoll.classList.toggle('cooldown', rollCd);
    }
    const aegisCd = p.aegisCooldown > 0.05;
    if (hudCache.aegisCd !== aegisCd && els.actAegis) {
      hudCache.aegisCd = aegisCd;
      els.actAegis.classList.toggle('cooldown', aegisCd);
    }
    const overdriveCd = p.overdriveCooldown > 0.05 || p.energy < 40;
    if (hudCache.overdriveCd !== overdriveCd && els.actOverdrive) {
      hudCache.overdriveCd = overdriveCd;
      els.actOverdrive.classList.toggle('cooldown', overdriveCd);
    }
    const nearGate = Boolean(window.findNearestOdysseyInteract?.(s));
    if (hudCache.nearGate !== nearGate && els.actOverride) {
      hudCache.nearGate = nearGate;
      els.actOverride.classList.toggle('ready-pulse', nearGate);
    }
  }

  /**
   * Bind all UI buttons in Intro, Override, Pause, Header, and End Modals.
   */
  function bindUIEvents() {
    const els = getHudEls();

    if (els.btnStartOdyssey) {
      els.btnStartOdyssey.addEventListener('click', () => window.startOdysseyFromIntro());
    }

    for (let i = 0; i < els.filterBtns.length; i += 1) {
      const btn = els.filterBtns[i];
      btn.addEventListener('click', () => {
        const idx = FILTER_MODES.findIndex((f) => f.id === btn.dataset.filter);
        if (idx >= 0) {
          filterIdx = idx;
          if (state) {
            state.topicFilter = FILTER_MODES[idx].id;
            state.allowedTopics = FILTER_MODES[idx].topics.slice();
          }
          syncFilterButtonsUI();
          window.OdysseyAudio?.playUiTick();
        }
      });
    }

    for (let i = 0; i < els.seqOpts.length; i += 1) {
      const optBtn = els.seqOpts[i];
      if (optBtn) {
        optBtn.addEventListener('click', () => window.submitOdysseyOption(i));
      }
    }

    els.btnToggleHint?.addEventListener('click', () => window.toggleOdysseyHint());
    els.btnOverdriveBypass?.addEventListener('click', () => window.triggerOdysseyOverdriveBypass());

    const toggleMute = () => {
      window.OdysseyAudio?.init();
      const muted = window.OdysseyAudio?.toggleMute();
      if (els.btnAudioToggle) els.btnAudioToggle.textContent = muted ? '🔇' : '🔊';
      if (els.btnToggleSoundPause) {
        els.btnToggleSoundPause.textContent = muted ? 'الصوت: صامت 🔇' : 'الصوت: مفعل 🔊';
      }
    };

    els.btnAudioToggle?.addEventListener('click', toggleMute);
    els.btnToggleSoundPause?.addEventListener('click', toggleMute);
    els.btnHelpToggle?.addEventListener('click', () => {
      if (!state) return;
      state.mode = 'intro';
      setModalOpen(els.introModal, true);
      window.lockOdysseyInputBriefly?.(200);
    });
    els.btnPauseToggle?.addEventListener('click', () => {
      if (state?.mode === 'pause') window.closeOdysseyPause();
      else window.openOdysseyPause();
    });

    els.btnResumeGame?.addEventListener('click', () => window.closeOdysseyPause());
    els.btnCycleFilterPause?.addEventListener('click', () => window.cycleOdysseyFilter(1));
    els.btnRestartPause?.addEventListener('click', () => resetMissionState(true));
    els.btnExitHubPause?.addEventListener('click', () => {
      window.location.href = '../../index.html';
    });

    els.btnRetryEnd?.addEventListener('click', () => resetMissionState(true));
    els.btnHubEnd?.addEventListener('click', () => {
      window.location.href = '../../index.html';
    });
  }

  /**
   * Main 60FPS animation frame callback.
   * Polls DualSense/inputs in ALL modes so modal navigation never freezes.
   * @param {number} nowMs - High-resolution timestamp.
   */
  function gameLoop(nowMs) {
    if (!lastFrameMs) lastFrameMs = nowMs;
    const rawDt = Math.min(0.05, Math.max(0.001, (nowMs - lastFrameMs) * 0.001));
    lastFrameMs = nowMs;

    if (state) {
      const inputs = window.pollOdysseyInputs(state);
      if (state.mode === 'play') {
        window.updateOdysseyWorld(state, rawDt, inputs.moveVec, inputs.aimVec);
        syncHUD(state);
      }
      window.renderOdysseyFrame(ctx, viewW, viewH, state);
    }

    rafId = window.requestAnimationFrame(gameLoop);
  }

  /**
   * Initialize Canvas, Controls, UI Bindings, and start 60FPS frame loop.
   */
  function bootOdyssey() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d', { alpha: false });

    window.addEventListener('resize', handleResize);
    bindUIEvents();
    resetMissionState(false);
    window.initOdysseyControls?.(() => state);

    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(gameLoop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootOdyssey);
  } else {
    bootOdyssey();
  }
})();
