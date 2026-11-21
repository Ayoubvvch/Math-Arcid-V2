/**
 * Quantum Casino (كازينو الاحتمالات الكمومي) — Main Game Orchestrator
 * Manages DPR-scaled 60FPS loop, Bidi-safe math rendering, HUD state diffing,
 * Vault Seal Override Modals, topic filters (103–114), and endgame telemetry.
 */

(function () {
  'use strict';

  const FILTER_MODES = [
    {
      id: 'all',
      label: 'المحاور: 103–114',
      topics: [103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114]
    },
    {
      id: 'sectionA',
      label: 'التعداد والشرطي (103–108)',
      topics: [103, 104, 105, 106, 107, 108]
    },
    {
      id: 'sectionB',
      label: 'الشجرة وبرنولي (109–114)',
      topics: [109, 110, 111, 112, 113, 114]
    }
  ];

  let filterIdx = 0;
  let state = null;
  let activeGate = null;
  let activeQuestion = null;
  let recentQuestionIds = [];
  let hintRevealed = false;
  let introOpenedAsHelp = false;
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
    bulletVisible: null,
    bulletText: '',
    filterText: '',
    bannerText: '',
    dashCd: null,
    sliceCd: null,
    shootCd: null,
    bulletCd: null,
    jackpotCd: null,
    nearGate: null
  };

  let hudEls = null;

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
      bulletBadge: document.getElementById('bulletBadge'),
      comboBadge: document.getElementById('comboBadge'),
      comboCount: document.getElementById('comboCount'),
      filterChip: document.getElementById('filterChip'),
      filterChipLabel: document.getElementById('filterChipLabel'),
      sectorBanner: document.getElementById('sectorBanner'),
      btnAudioToggle: document.getElementById('btnAudioToggle'),
      btnHelpToggle: document.getElementById('btnHelpToggle'),
      btnPauseToggle: document.getElementById('btnPauseToggle'),
      actDash: document.getElementById('actDash'),
      actSlice: document.getElementById('actSlice'),
      actOverride: document.getElementById('actOverride'),
      actBulletTime: document.getElementById('actBulletTime'),
      actShoot: document.getElementById('actShoot'),
      actJackpot: document.getElementById('actJackpot'),
      introModal: document.getElementById('introModal'),
      btnStartCasino: document.getElementById('btnStartCasino'),
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
   * Isolate embedded math expressions with <bdi dir="ltr" class="math-ltr">
   * so probability formulas never flip inside RTL Arabic sentences.
   */
  function setBidiSafeMath(el, text) {
    if (!el) return;
    if (window.ArcadeCore && typeof window.ArcadeCore.setBidiSafeMath === 'function') {
      window.ArcadeCore.setBidiSafeMath(el, text);
      return;
    }
    el.textContent = String(text ?? '');
  }

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

  function setModalOpen(modalEl, visible) {
    if (!modalEl) return;
    modalEl.classList.toggle('hidden', !visible);
    modalEl.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function resetMissionState(autoPlay) {
    const modeFilter = FILTER_MODES[filterIdx];
    state = window.createInitialCasinoState(modeFilter.id);
    state.allowedTopics = modeFilter.topics.slice();
    activeGate = null;
    activeQuestion = null;
    recentQuestionIds = [];
    hintRevealed = false;
    introOpenedAsHelp = false;
    handleResize();

    const els = getHudEls();
    setModalOpen(els.overrideModal, false);
    setModalOpen(els.pauseModal, false);
    setModalOpen(els.endModal, false);

    if (autoPlay) {
      state.mode = 'play';
      setModalOpen(els.introModal, false);
      window.setCasinoBanner(state, 'اخترق أختام الكازينو الأربعة لتحرير نواة برنولي!', 4.5);
    } else {
      state.mode = 'intro';
      setModalOpen(els.introModal, true);
    }
    syncFilterButtonsUI();
    syncHUD(state);
  }

  function syncFilterButtonsUI() {
    const els = getHudEls();
    const active = FILTER_MODES[filterIdx];
    for (let i = 0; i < els.filterBtns.length; i += 1) {
      const btn = els.filterBtns[i];
      btn.classList.toggle('active', btn.dataset.filter === active.id);
    }
    if (els.filterChipLabel && hudCache.filterText !== active.label) {
      hudCache.filterText = active.label;
      els.filterChipLabel.textContent = active.label;
    }
    if (els.btnCycleFilterPause) {
      els.btnCycleFilterPause.textContent = `محور الأسئلة: ${active.label}`;
    }
  }

  window.cycleCasinoFilter = function cycleCasinoFilter(dir) {
    const step = dir >= 0 ? 1 : -1;
    filterIdx = (filterIdx + step + FILTER_MODES.length) % FILTER_MODES.length;
    const modeFilter = FILTER_MODES[filterIdx];
    if (state) {
      state.topicFilter = modeFilter.id;
      state.allowedTopics = modeFilter.topics.slice();
    }
    syncFilterButtonsUI();
    window.CasinoAudio?.playUiTick();
  };

  window.startCasinoFromIntro = function startCasinoFromIntro() {
    window.CasinoAudio?.init();
    window.CasinoAudio?.playUiTick();
    window.lockCasinoInputBriefly?.(220);
    if (introOpenedAsHelp && state) {
      introOpenedAsHelp = false;
      setModalOpen(getHudEls().introModal, false);
      state.mode = 'play';
      syncHUD(state);
      return;
    }
    resetMissionState(true);
  };

  window.openCasinoPause = function openCasinoPause() {
    if (!state || state.mode !== 'play') return;
    state.mode = 'pause';
    const els = getHudEls();
    syncFilterButtonsUI();
    setModalOpen(els.pauseModal, true);
    window.lockCasinoInputBriefly?.(200);
    window.applyCasinoPauseFocus?.();
    window.CasinoAudio?.playUiTick();
  };

  window.closeCasinoPause = function closeCasinoPause() {
    if (!state || state.mode !== 'pause') return;
    setModalOpen(getHudEls().pauseModal, false);
    state.mode = 'play';
    window.lockCasinoInputBriefly?.(220);
    window.CasinoAudio?.playUiTick();
  };

  window.triggerNearestCasinoGate = function triggerNearestCasinoGate(liveState) {
    const s = liveState || state;
    if (!s || s.mode !== 'play') return;

    const nearest = window.findNearestCasinoInteract(s);
    if (!nearest) {
      window.setCasinoBanner(s, 'اقترب من ختم خزنة أو حارس مشلول للاختراق [▢ / E]', 2.0);
      return;
    }

    if (nearest.kind === 'execute' && nearest.enemy) {
      s.player.energy = Math.min(s.player.maxEnergy, s.player.energy + 25);
      s.player.hp = Math.min(s.player.maxHp, s.player.hp + 15);
      window.damageCasinoEnemy?.(s, nearest.enemy, 9999, true, true);
      window.CasinoAudio?.playExecute?.();
      window.triggerCasinoHaptic?.(140, 0.55, 0.85);
      window.addCasinoFloatText(s, s.player.x, s.player.y - 32, 'تصفية كمومية!', '#34d399', 1.2);
      syncHUD(s);
      return;
    }

    const gate = nearest.gate || nearest;
    state = s;
    activeGate = gate;
    const topicPool = s.topicFilter === 'all'
      ? (gate.topics || s.allowedTopics)
      : s.allowedTopics;
    activeQuestion = window.pickCasinoChallenge(
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
    const topicTitle = (window.CASINO_TOPICS && window.CASINO_TOPICS[activeQuestion.topic]) || '';
    if (els.seqSourceTag) {
      els.seqSourceTag.textContent = `${gate.sectorName} • 2BAC PC`;
    }
    if (els.seqTopicTag) {
      els.seqTopicTag.textContent = `البند ${activeQuestion.topic}: ${topicTitle}`;
    }
    setBidiSafeMath(els.seqPrompt, activeQuestion.prompt);

    if (els.seqHintBox) {
      setBidiSafeMath(els.seqHintBox, activeQuestion.hint || '');
      els.seqHintBox.classList.add('hidden');
    }

    const psClasses = ['ps-x', 'ps-o', 'ps-sq', 'ps-tri'];
    for (let i = 0; i < 4; i += 1) {
      const btn = els.seqOpts[i];
      if (!btn) continue;
      btn.classList.remove('opt-correct', 'opt-wrong');
      const keyTag = ['✕', '◯', '▢', '△'][i];
      btn.textContent = '';
      const badge = document.createElement('span');
      badge.className = `ps-badge ${psClasses[i]}`;
      badge.textContent = keyTag;
      const numTag = document.createElement('span');
      numTag.className = 'opt-gp-badge';
      numTag.textContent = `${i + 1}`;
      const body = document.createElement('span');
      body.className = 'opt-body';
      setBidiSafeMath(body, activeQuestion.options[i] || '');
      btn.appendChild(badge);
      btn.appendChild(numTag);
      btn.appendChild(body);
    }

    if (els.seqGraphWrap && els.seqGraphCanvas && activeQuestion.graphSpec) {
      els.seqGraphWrap.classList.remove('hidden');
      window.drawCasinoGraph?.(els.seqGraphCanvas, activeQuestion.graphSpec);
    } else if (els.seqGraphWrap) {
      els.seqGraphWrap.classList.add('hidden');
    }

    setModalOpen(els.overrideModal, true);
    window.lockCasinoInputBriefly?.(220);
    window.CasinoAudio?.playUiTick();
  };

  function completeGateUnlock(isBypass) {
    const els = getHudEls();
    if (activeGate) {
      activeGate.broken = true;
      state.stats.brokenGates += 1;
      state.stats.score += isBypass ? 95 : 260;
      state.stats.combo += 1;
      state.stats.comboTimer = 5.0;
      window.spawnCasinoParticles(state, activeGate.x, activeGate.y, 24, '#34d399', 260);
      window.addCasinoFloatText(
        state,
        activeGate.x,
        activeGate.y - 38,
        isBypass ? 'اختراق قسري للخزنة!' : 'تم فتح الخزنة الكمومية!',
        '#34d399',
        1.4
      );
    }

    state.player.hp = Math.min(state.player.maxHp, state.player.hp + 22);
    state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 45);
    setModalOpen(els.overrideModal, false);
    state.mode = 'play';
    activeGate = null;
    activeQuestion = null;
    window.lockCasinoInputBriefly?.(240);

    if (state.stats.brokenGates >= state.gates.length && !state.bossSpawned) {
      window.spawnSyndicateBoss(state);
    }
    window.ArcadeCore?.Progress?.recordSealProgress('quantum-casino', state.stats.brokenGates);
    syncHUD(state);
  }

  window.submitCasinoOption = function submitCasinoOption(idx) {
    if (!state || state.mode !== 'override' || !activeQuestion) return;
    const els = getHudEls();
    const btn = els.seqOpts[idx];

    state.stats.questionsAnswered += 1;
    const isCorrect = idx === activeQuestion.correctIndex;
    window.ArcadeCore?.Progress?.recordAnswer('quantum-casino', activeQuestion.topic, isCorrect);
    if (isCorrect) {
      state.stats.questionsCorrect += 1;
      if (btn) btn.classList.add('opt-correct');
      window.CasinoAudio?.playVaultUnlock();
      window.triggerCasinoHaptic?.(120, 0.45, 0.75);
      completeGateUnlock(false);
    } else {
      if (btn) btn.classList.add('opt-wrong');
      state.player.hp = Math.max(0, state.player.hp - 12);
      state.stats.combo = 0;
      state.screenShake = Math.max(state.screenShake || 0, 9);
      if (state.camera) state.camera.shake = state.screenShake;
      window.CasinoAudio?.playOverrideFail();
      window.triggerCasinoHaptic?.(140, 0.65, 0.85);
      window.setCasinoBanner(state, 'احتمال خاطئ! خصم 12 من درع العميل', 2.2);

      if (state.player.hp <= 0) {
        setModalOpen(els.overrideModal, false);
        window.finishCasinoGame(state, false);
        return;
      }
      syncHUD(state);
    }
  };

  window.toggleCasinoHint = function toggleCasinoHint() {
    const els = getHudEls();
    if (!els.seqHintBox || !activeQuestion) return;
    hintRevealed = !hintRevealed;
    els.seqHintBox.classList.toggle('hidden', !hintRevealed);
    window.CasinoAudio?.playUiTick();
  };

  window.triggerCasinoOverdriveBypass = function triggerCasinoOverdriveBypass() {
    if (!state || state.mode !== 'override') return;
    if (state.player.energy < 40) {
      window.setCasinoBanner(state, 'تحتاج إلى 40 تدفق احتمال على الأقل للاختراق القسري', 2.0);
      window.CasinoAudio?.playOverrideFail();
      return;
    }
    state.player.energy -= 40;
    state.stats.bypasses += 1;
    window.CasinoAudio?.playJackpotShock();
    window.triggerCasinoHaptic?.(150, 0.6, 0.9);
    completeGateUnlock(true);
  };

  window.finishCasinoGame = function finishCasinoGame(liveState, victory) {
    const s = liveState || state;
    if (!s || s.mode === 'end') return;
    s.mode = 'end';

    const els = getHudEls();
    setModalOpen(els.overrideModal, false);
    setModalOpen(els.pauseModal, false);

    const acc = s.stats.questionsAnswered > 0
      ? Math.round((s.stats.questionsCorrect / s.stats.questionsAnswered) * 100)
      : 100;
    const progressRes = window.ArcadeCore?.Progress?.recordRun('quantum-casino', {
      score: s.stats.score,
      sealsCleared: s.stats.brokenGates,
      victory: Boolean(victory),
      runQuestionsAnswered: s.stats.questionsAnswered,
      runQuestionsCorrect: s.stats.questionsCorrect,
      bypasses: s.stats.bypasses,
      answersAlreadyRecorded: true
    });
    const rankSuffix = progressRes
      ? ` • الرتبة: ${progressRes.rank}${progressRes.isNewBest && s.stats.score > 0 ? ' • 🏆 رقم قياسي جديد!' : ''}`
      : '';

    if (els.endTitle) {
      els.endTitle.textContent = victory
        ? 'تم تفكيك نقابة برنولي الكمومية!'
        : 'سقط درع العميل QUANTUM-Ω';
    }
    if (els.endSubtitle) {
      els.endSubtitle.textContent = (victory
        ? 'سيطرة كاملة على التعداد، الاحتمال الشرطي، شجرة الاحتمالات وقانون برنولي!'
        : 'أعد اقتحام الخزنة وتحكم في تمديد الزمن لتفادي طلقات الحراس.') + rankSuffix;
    }
    if (els.endGates) els.endGates.textContent = `${s.stats.brokenGates}/4`;
    if (els.endScore) els.endScore.textContent = String(s.stats.score);

    if (els.endAccuracy) els.endAccuracy.textContent = `${acc}%`;
    if (els.endBypasses) els.endBypasses.textContent = String(s.stats.bypasses);

    setModalOpen(els.endModal, true);
    window.lockCasinoInputBriefly?.(260);
    window.applyCasinoEndFocus?.();

    if (victory) window.CasinoAudio?.playVictory();
    else window.CasinoAudio?.playOverrideFail();
  };

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

    const wingLabel = window.getCasinoSectorLabel?.(p.x, p.y) || 'Ω';
    if (hudCache.wingText !== wingLabel && els.wingValue) {
      hudCache.wingText = wingLabel;
      els.wingValue.textContent = wingLabel;
    }

    const scoreText = String(s.stats.score);
    if (hudCache.scoreText !== scoreText && els.scoreValue) {
      hudCache.scoreText = scoreText;
      els.scoreValue.textContent = scoreText;
    }

    const showBullet = p.bulletTimeTimer > 0.05;
    if (hudCache.bulletVisible !== showBullet && els.bulletBadge) {
      hudCache.bulletVisible = showBullet;
      els.bulletBadge.classList.toggle('hidden', !showBullet);
    }
    if (showBullet && els.bulletBadge) {
      const btStr = `⏱ ${p.bulletTimeTimer.toFixed(1)}s`;
      if (hudCache.bulletText !== btStr) {
        hudCache.bulletText = btStr;
        els.bulletBadge.textContent = btStr;
      }
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
      els.sectorBanner.classList.toggle('visible', Boolean(bannerStr));
    }

    const dashCd = p.dashCooldown > 0.05;
    if (hudCache.dashCd !== dashCd && els.actDash) {
      hudCache.dashCd = dashCd;
      els.actDash.classList.toggle('cooldown', dashCd);
    }
    const sliceCd = p.sliceCooldown > 0.05;
    if (hudCache.sliceCd !== sliceCd && els.actSlice) {
      hudCache.sliceCd = sliceCd;
      els.actSlice.classList.toggle('cooldown', sliceCd);
    }
    const shootCd = p.shootCooldown > 0.05;
    if (hudCache.shootCd !== shootCd && els.actShoot) {
      hudCache.shootCd = shootCd;
      els.actShoot.classList.toggle('cooldown', shootCd);
    }
    const bulletCd = p.bulletTimeCooldown > 0.05;
    if (hudCache.bulletCd !== bulletCd && els.actBulletTime) {
      hudCache.bulletCd = bulletCd;
      els.actBulletTime.classList.toggle('cooldown', bulletCd);
    }
    const jackpotCd = p.jackpotCooldown > 0.05 || p.energy < 40;
    if (hudCache.jackpotCd !== jackpotCd && els.actJackpot) {
      hudCache.jackpotCd = jackpotCd;
      els.actJackpot.classList.toggle('cooldown', jackpotCd);
    }
    const nearGate = Boolean(window.findNearestCasinoInteract?.(s));
    if (hudCache.nearGate !== nearGate && els.actOverride) {
      hudCache.nearGate = nearGate;
      els.actOverride.classList.toggle('highlight-ready', nearGate);
    }
  }

  function bindUIEvents() {
    const els = getHudEls();

    els.btnStartCasino?.addEventListener('click', () => window.startCasinoFromIntro());

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
          window.CasinoAudio?.playUiTick();
        }
      });
    }

    for (let i = 0; i < els.seqOpts.length; i += 1) {
      const optBtn = els.seqOpts[i];
      if (optBtn) optBtn.addEventListener('click', () => window.submitCasinoOption(i));
    }

    els.btnToggleHint?.addEventListener('click', () => window.toggleCasinoHint());
    els.btnOverdriveBypass?.addEventListener('click', () => window.triggerCasinoOverdriveBypass());

    const toggleMute = () => {
      window.CasinoAudio?.init();
      const muted = window.CasinoAudio?.toggleMute();
      if (els.btnAudioToggle) els.btnAudioToggle.textContent = muted ? '🔇' : '🔊';
      if (els.btnToggleSoundPause) {
        els.btnToggleSoundPause.textContent = muted ? 'الصوت: صامت 🔇' : 'الصوت: مفعل 🔊';
      }
    };

    els.filterChip?.addEventListener('click', () => window.cycleCasinoFilter(1));
    els.btnAudioToggle?.addEventListener('click', toggleMute);
    els.btnToggleSoundPause?.addEventListener('click', toggleMute);
    els.btnHelpToggle?.addEventListener('click', () => {
      if (!state) return;
      introOpenedAsHelp = state.mode === 'play' || state.mode === 'pause';
      state.mode = 'intro';
      setModalOpen(els.pauseModal, false);
      setModalOpen(els.introModal, true);
      window.lockCasinoInputBriefly?.(200);
    });
    els.btnPauseToggle?.addEventListener('click', () => {
      if (state?.mode === 'pause') window.closeCasinoPause();
      else window.openCasinoPause();
    });

    els.btnResumeGame?.addEventListener('click', () => window.closeCasinoPause());
    els.btnCycleFilterPause?.addEventListener('click', () => window.cycleCasinoFilter(1));
    els.btnRestartPause?.addEventListener('click', () => resetMissionState(true));
    els.btnRetryEnd?.addEventListener('click', () => resetMissionState(true));
  }

  function gameLoop(nowMs) {
    if (!lastFrameMs) lastFrameMs = nowMs;
    const rawDt = Math.min(0.05, Math.max(0.001, (nowMs - lastFrameMs) * 0.001));
    lastFrameMs = nowMs;

    if (state) {
      const inputs = window.pollCasinoInputs(state);
      if (state.mode === 'play') {
        window.updateCasinoWorld(state, rawDt, inputs.moveVec, inputs.aimVec);
        syncHUD(state);
      }
      window.renderCasinoFrame(ctx, viewW, viewH, state);
    }

    rafId = window.requestAnimationFrame(gameLoop);
  }

  function bootCasino() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d', { alpha: false });

    window.addEventListener('resize', handleResize);
    bindUIEvents();
    resetMissionState(false);
    window.initCasinoControls?.(() => state);

    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = window.requestAnimationFrame(gameLoop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootCasino);
  } else {
    bootCasino();
  }
})();
