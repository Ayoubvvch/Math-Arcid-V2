/**
 * Asymptote Asylum (مصحّة المشتقة: الغاية تبرر الوسيلة) - Main Game Loop & Ritual UI Orchestrator
 */

(function() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  let state = window.createInitialAsylumState('all');
  window.asymptoteGame = state;

  let viewW = window.innerWidth;
  let viewH = window.innerHeight;
  let lastTs = performance.now();
  let hudCache = {};

  function resizeCanvas() {
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Filter Labels
  const FILTER_MODES = [
    { key: 'all', hud: 'المحاور: 23–38', pause: 'محور الأسئلة: الكل (23–38)' },
    { key: 'sectionA', hud: 'القسم أ: 23–29', pause: 'محور الأسئلة: الاشتقاق فقط (23–29)' },
    { key: 'sectionB', hud: 'القسم ب: 30–38', pause: 'محور الأسئلة: الدوال والمنحنيات (30–38)' }
  ];

  function updateFilterUI() {
    const cur = FILTER_MODES.find(f => f.key === state.topicFilter) || FILTER_MODES[0];
    const chip = document.getElementById('filterChipLabel');
    const pauseBtn = document.getElementById('btnCycleFilterPause');
    if (chip) chip.textContent = cur.hud;
    if (pauseBtn) pauseBtn.textContent = cur.pause;

    document.querySelectorAll('#introFilterGrid .filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === state.topicFilter);
    });
  }

  window.cycleTopicFilter = function(dir = 1) {
    const idx = FILTER_MODES.findIndex(f => f.key === state.topicFilter);
    const nextIdx = (idx + dir + FILTER_ORDER_LEN()) % FILTER_ORDER_LEN();
    state.topicFilter = FILTER_MODES[nextIdx].key;
    updateFilterUI();
    window.HorrorAudio?.playUiTick?.();
  };

  function FILTER_ORDER_LEN() {
    return FILTER_MODES.length;
  }

  window.startAsylumFromIntro = function() {
    window.HorrorAudio?.init?.();
    window.HorrorAudio?.playUiTick?.();
    document.getElementById('introModal')?.classList.add('hidden');
    state.mode = 'play';
    window.lockAsylumInputBriefly(220);
    window.setWardBanner(state, 'حطّم الأختام الأربعة حول المصحّة [▢ / L] عند المذبح', 4.5);
  };

  window.triggerNearestInteract = function(s) {
    const target = window.findNearestInteractable(s);
    if (target) {
      window.openRitualChallenge(s, target);
      return true;
    }
    window.addFloatingText(s, s.player.x, s.player.y - 26, 'اقترب من مذبح أو وحش مشلول!', '#fbbf24', 1.1);
    return false;
  };

  function setBidiSafeMath(el, text) {
    if (!el) return;
    el.textContent = '';
    const str = String(text || '');
    const mathRe = /(?:[+\-](?=[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\])|[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\])(?:[ +\-*/=<>≤≥≠∈∉⊂⊃∪∩∀∃→↔⇒⇔·×÷±≈'′∘^_:,.\\]*[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\])*/g;
    let lastIndex = 0;
    let match;
    while ((match = mathRe.exec(str)) !== null) {
      let sIdx = match.index;
      let eIdx = match.index + match[0].length;
      while (eIdx > sIdx) {
        const sub = str.slice(sIdx, eIdx);
        const op = (sub.match(/\(/g) || []).length;
        const cl = (sub.match(/\)/g) || []).length;
        if ((sub.endsWith('(') && op > cl) || (sub.endsWith(')') && cl > op) || /\s$/.test(sub)) eIdx--;
        else break;
      }
      while (sIdx < eIdx) {
        const sub = str.slice(sIdx, eIdx);
        const op = (sub.match(/\(/g) || []).length;
        const cl = (sub.match(/\)/g) || []).length;
        if ((sub.startsWith('(') && op > cl) || (sub.startsWith(')') && cl > op) || /^\s/.test(sub)) sIdx++;
        else break;
      }
      const tok = str.slice(sIdx, eIdx);
      if (!tok || /^[()\[\]\s]+$/.test(tok)) continue;
      if (sIdx > lastIndex) {
        el.appendChild(document.createTextNode(str.slice(lastIndex, sIdx)));
      }
      const bdi = document.createElement('bdi');
      bdi.dir = 'ltr';
      bdi.className = 'math-ltr';
      bdi.textContent = tok;
      el.appendChild(bdi);
      lastIndex = eIdx;
    }
    if (lastIndex < str.length) {
      el.appendChild(document.createTextNode(str.slice(lastIndex)));
    }
  }
  window.setBidiSafeMath = setBidiSafeMath;

  window.openRitualChallenge = function(s, targetInfo) {
    if (s.mode !== 'play') return;
    s.mode = 'ritual';
    window.lockAsylumInputBriefly(220);

    const wardTopics = targetInfo.kind === 'seal' ? targetInfo.seal.topics : null;
    const q = window.pickRitualChallenge(s.topicFilter, wardTopics, s.recentQuestionIds);
    s.recentQuestionIds.push(q.id);
    if (s.recentQuestionIds.length > 14) s.recentQuestionIds.shift();

    s.activeRitual = {
      targetInfo,
      question: q,
      hintOpen: false,
      lockedWrong: {}
    };

    const modal = document.getElementById('ritualModal');
    const srcTag = document.getElementById('ritualSourceTag');
    const topTag = document.getElementById('ritualTopicTag');
    const promptEl = document.getElementById('ritualPrompt');
    const graphWrap = document.getElementById('ritualGraphWrap');
    const graphCanvas = document.getElementById('ritualGraphCanvas');
    const hintBox = document.getElementById('ritualHintBox');

    if (targetInfo.kind === 'seal') {
      srcTag.textContent = `طقس المذبح — ${targetInfo.seal.wardName}`;
    } else {
      srcTag.textContent = `إعدام دموي — ${targetInfo.enemy.name}`;
    }
    topTag.textContent = `البند ${q.topic}: ${window.CURRICULUM_TOPICS[q.topic] || ''}`;
    setBidiSafeMath(promptEl, q.prompt);

    if (q.graphSpec) {
      graphWrap.classList.remove('hidden');
      window.drawRitualGraph(graphCanvas, q.graphSpec);
    } else {
      graphWrap.classList.add('hidden');
    }

    setBidiSafeMath(hintBox, q.hint);
    hintBox.classList.add('hidden');

    for (let i = 0; i < 4; i++) {
      const btn = document.getElementById(`ritualOpt${i}`);
      btn.classList.remove('opt-correct', 'opt-wrong');
      btn.disabled = false;
      const optSpan = btn.querySelector('.opt-text');
      optSpan.classList.remove('math-ltr');
      setBidiSafeMath(optSpan, q.options[i] || '');
    }

    // Check "الغاية تبرر الوسيلة" availability
    const p = s.player;
    const nearCaptive = s.captives.find(c => c.alive && Math.hypot(c.x - p.x, c.y - p.y) <= 260);
    const sacBtn = document.getElementById('btnForbiddenSacrifice');
    if (nearCaptive) {
      sacBtn.disabled = false;
      sacBtn.textContent = `🩸 [L2 / F] الغاية تبرر الوسيلة: قربان (${nearCaptive.label}) لكسر الختم فوراً (+15 دم)`;
    } else if (p.hp > 26) {
      sacBtn.disabled = false;
      sacBtn.textContent = `🩸 [L2 / F] الغاية تبرر الوسيلة: ادفع 25 من دمك لتجاوز الطقس فوراً`;
    } else {
      sacBtn.disabled = true;
      sacBtn.textContent = `🩸 [L2 / F] الدم غير كافٍ للتضحية (تحتاج > 25 دم أو سجين قريب)`;
    }

    modal.classList.remove('hidden');
    window.HorrorAudio?.playUiTick?.();
  };

  window.toggleRitualHint = function() {
    if (!state.activeRitual) return;
    state.activeRitual.hintOpen = !state.activeRitual.hintOpen;
    document.getElementById('ritualHintBox')?.classList.toggle('hidden', !state.activeRitual.hintOpen);
    window.HorrorAudio?.playUiTick?.();
  };

  window.submitRitualOption = function(optIdx) {
    if (state.mode !== 'ritual' || !state.activeRitual) return;
    const r = state.activeRitual;
    const q = r.question;
    const btn = document.getElementById(`ritualOpt${optIdx}`);
    if (!btn || btn.disabled) return;

    state.stats.questionsAnswered++;

    if (optIdx === q.correctIndex) {
      state.stats.questionsCorrect++;
      btn.classList.add('opt-correct');
      resolveRitualSuccess(false);
    } else {
      btn.classList.add('opt-wrong');
      btn.disabled = true;
      state.player.hp = Math.max(0, state.player.hp - 16);
      state.damageFlash = 1.0;
      state.screenShake = Math.max(state.screenShake, 10);
      window.HorrorAudio?.playDamage?.();
      window.triggerGamepadHaptic?.(110, 0.7, 0.85);
      if (state.player.hp <= 0) {
        closeRitualModalCleanly();
        window.triggerVictoryOrDeath(state, false);
      }
    }
  };

  window.triggerForbiddenRitualBypass = function() {
    if (state.mode !== 'ritual' || !state.activeRitual) return;
    const p = state.player;
    const nearCaptive = state.captives.find(c => c.alive && Math.hypot(c.x - p.x, c.y - p.y) <= 260);
    if (!nearCaptive && p.hp <= 26) return;

    state.stats.sacrifices++;
    window.HorrorAudio?.playSacrifice?.();
    window.triggerGamepadHaptic?.(160, 0.85, 0.95);

    if (nearCaptive) {
      nearCaptive.alive = false;
      p.hp = Math.min(p.maxHp, p.hp + 15);
      window.addBloodDecal(state, nearCaptive.x, nearCaptive.y, 48, 'blood');
      window.addBloodDecal(state, nearCaptive.x, nearCaptive.y, 24, 'bones');
      window.spawnGoreParticles(state, nearCaptive.x, nearCaptive.y, 32, '#ef4444', 320);
      window.addFloatingText(state, nearCaptive.x, nearCaptive.y - 24, 'قربان الغاية تبرر الوسيلة!', '#f87171', 1.8);
    } else {
      p.hp -= 25;
      window.addBloodDecal(state, p.x, p.y, 36, 'blood');
      window.spawnGoreParticles(state, p.x, p.y, 24, '#dc2626', 280);
      window.addFloatingText(state, p.x, p.y - 24, 'عهد الدم -25 HP!', '#f87171', 1.6);
    }

    p.frenzyTimer = Math.max(p.frenzyTimer, 6.0);
    resolveRitualSuccess(true);
  };

  function closeRitualModalCleanly() {
    document.getElementById('ritualModal')?.classList.add('hidden');
    state.activeRitual = null;
    if (state.mode === 'ritual') state.mode = 'play';
    window.lockAsylumInputBriefly(220);
  }

  function resolveRitualSuccess(wasSacrifice) {
    const info = state.activeRitual?.targetInfo;
    closeRitualModalCleanly();
    if (!info) return;

    if (info.kind === 'seal') {
      const s = info.seal;
      if (!s.broken) {
        s.broken = true;
        state.stats.brokenSeals++;
        state.stats.score += wasSacrifice ? 350 : 600;
        window.HorrorAudio?.playSealBreak?.();
        window.spawnGoreParticles(state, s.x, s.y, 28, s.color, 260);
        window.addFloatingText(state, s.x, s.y - 36, `تم تحطيم الختم (${state.stats.brokenSeals}/4)!`, '#fbbf24', 1.9);

        // Reward survivor sanity & slight HP on clean solve
        if (!wasSacrifice) {
          state.player.sanity = Math.min(state.player.maxSanity, state.player.sanity + 35);
          state.player.hp = Math.min(state.player.maxHp, state.player.hp + 15);
        }

        if (state.stats.brokenSeals >= 4) {
          window.spawnBossFiend(state);
        } else {
          window.setWardBanner(state, `بقي ${4 - state.stats.brokenSeals} أختام في المصحّة — واصل الصيد`, 3.5);
        }
      }
    } else if (info.kind === 'execute' && info.enemy) {
      window.killEnemy(state, info.enemy, true);
    }
  }

  window.openAsylumPause = function() {
    if (state.mode === 'end' || state.mode === 'intro') return;
    if (state.mode === 'ritual') {
      closeRitualModalCleanly();
    }
    state.mode = 'pause';
    updateFilterUI();
    const pauseModal = document.getElementById('pauseModal');
    pauseModal?.classList.remove('hidden');
    window.AsylumInput.pauseFocusIdx = 0;
    window.applyPauseMenuFocus();
    window.lockAsylumInputBriefly(200);
    window.HorrorAudio?.playUiTick?.();
  };

  window.closeAsylumPause = function() {
    document.getElementById('pauseModal')?.classList.add('hidden');
    if (state.mode === 'pause') state.mode = 'play';
    window.lockAsylumInputBriefly(200);
    window.HorrorAudio?.playUiTick?.();
  };

  window.triggerVictoryOrDeath = function(s, victory) {
    s.mode = 'end';
    document.getElementById('ritualModal')?.classList.add('hidden');
    document.getElementById('pauseModal')?.classList.add('hidden');

    const title = document.getElementById('endTitle');
    const sub = document.getElementById('endSubtitle');

    if (victory) {
      if (s.stats.sacrifices >= 2) {
        title.innerHTML = 'نجوت بدم الآخرين — <span>نهاية «الغاية تبرر الوسيلة»</span>';
        sub.textContent = 'تحطّمت كل الأختام وتمزق شبح المقارب اللانهائي... لكن دماء القرابين ستلاحقك خارج المصحّة للأبد.';
      } else {
        title.innerHTML = 'انتصار العقل والنجاة — <span>نهاية المصحّة النقية</span>';
        sub.textContent = 'أتقنت كل قواعد الاشتقاق ودراسة الدوال (23–38) وسحقت وحوش المصحّة دون التفريط بإنسانيتك!';
      }
    } else {
      title.innerHTML = 'التهمك الظلام في <span>مصحّة المشتقة</span>';
      sub.textContent = 'توقفت نبضات قلبك قبل تحرير الأختام الأربعة. حاول مجدداً واستعمل الشعلة والتفادي والقرابين عند الحاجة!';
    }

    const acc = s.stats.questionsAnswered > 0
      ? Math.round((s.stats.questionsCorrect / s.stats.questionsAnswered) * 100)
      : 100;

    document.getElementById('endSeals').textContent = `${s.stats.brokenSeals} / 4`;
    document.getElementById('endKills').textContent = String(s.stats.kills);
    document.getElementById('endAccuracy').textContent = `${acc}%`;
    document.getElementById('endSacrifices').textContent = String(s.stats.sacrifices);

    document.getElementById('endModal')?.classList.remove('hidden');
    window.AsylumInput.endFocusIdx = 0;
    window.applyEndMenuFocus();
    window.lockAsylumInputBriefly(250);
  };

  window.resetAsylumGame = function() {
    const keepFilter = state.topicFilter;
    document.getElementById('endModal')?.classList.add('hidden');
    document.getElementById('pauseModal')?.classList.add('hidden');
    document.getElementById('ritualModal')?.classList.add('hidden');
    document.getElementById('introModal')?.classList.add('hidden');

    state = window.createInitialAsylumState(keepFilter);
    state.mode = 'play';
    window.asymptoteGame = state;
    hudCache = {};
    window.lockAsylumInputBriefly(220);
    window.setWardBanner(state, 'جولة جديدة — حطّم الأختام الأربعة', 3.5);
  };

  // Wire static DOM buttons once
  document.getElementById('btnStartAsylum')?.addEventListener('click', window.startAsylumFromIntro);
  document.getElementById('filterChip')?.addEventListener('click', () => window.cycleTopicFilter(1));
  document.getElementById('btnCycleFilterPause')?.addEventListener('click', () => window.cycleTopicFilter(1));

  document.querySelectorAll('#introFilterGrid .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.topicFilter = btn.dataset.filter || 'all';
      updateFilterUI();
      window.HorrorAudio?.playUiTick?.();
    });
  });

  document.getElementById('btnAudioToggle')?.addEventListener('click', () => {
    window.HorrorAudio?.init?.();
    const muted = window.HorrorAudio?.toggleMute?.();
    document.getElementById('btnAudioToggle').textContent = muted ? '🔇' : '🔊';
    document.getElementById('btnToggleSoundPause').textContent = muted ? 'الصوت: مكتوم' : 'الصوت: مفعل';
  });

  document.getElementById('btnToggleSoundPause')?.addEventListener('click', () => {
    document.getElementById('btnAudioToggle')?.click();
  });

  document.getElementById('btnHelpToggle')?.addEventListener('click', () => {
    state.mode = 'intro';
    document.getElementById('pauseModal')?.classList.add('hidden');
    document.getElementById('introModal')?.classList.remove('hidden');
    updateFilterUI();
  });

  document.getElementById('btnPauseToggle')?.addEventListener('click', () => {
    if (state.mode === 'pause') window.closeAsylumPause();
    else window.openAsylumPause();
  });

  document.getElementById('btnResumeGame')?.addEventListener('click', window.closeAsylumPause);
  document.getElementById('btnRestartPause')?.addEventListener('click', window.resetAsylumGame);
  document.getElementById('btnRetryEnd')?.addEventListener('click', window.resetAsylumGame);

  // Ritual modal button clicks
  for (let i = 0; i < 4; i++) {
    document.getElementById(`ritualOpt${i}`)?.addEventListener('click', () => window.submitRitualOption(i));
  }
  document.getElementById('btnToggleHint')?.addEventListener('click', window.toggleRitualHint);
  document.getElementById('btnForbiddenSacrifice')?.addEventListener('click', window.triggerForbiddenRitualBypass);

  // Bottom Deck touch/mouse click wiring
  document.getElementById('actSlash')?.addEventListener('click', () => state.mode === 'play' && window.performSlashAttack(state));
  document.getElementById('actDash')?.addEventListener('click', () => {
    if (state.mode !== 'play') return;
    const mv = window.getKeyboardMoveVector();
    window.performBloodDash(state, mv.x, mv.y);
  });
  document.getElementById('actRitual')?.addEventListener('click', () => state.mode === 'play' && window.triggerNearestInteract(state));
  document.getElementById('actFlare')?.addEventListener('click', () => state.mode === 'play' && window.performFlare(state));
  document.getElementById('actBolt')?.addEventListener('click', () => state.mode === 'play' && window.performBloodBolt(state));
  document.getElementById('actSacrifice')?.addEventListener('click', () => state.mode === 'play' && window.performForbiddenSacrificeWorld(state));

  const hudEls = {
    hpValue: document.getElementById('hpValue'),
    hpFill: document.getElementById('hpFill'),
    sanityValue: document.getElementById('sanityValue'),
    sanityFill: document.getElementById('sanityFill'),
    sealsValue: document.getElementById('sealsValue'),
    killValue: document.getElementById('killValue'),
    comboBadge: document.getElementById('comboBadge'),
    comboCount: document.getElementById('comboCount'),
    frenzyBadge: document.getElementById('frenzyBadge'),
    frenzyTimer: document.getElementById('frenzyTimer'),
    wardBanner: document.getElementById('wardBanner'),
    actRitual: document.getElementById('actRitual'),
    actDash: document.getElementById('actDash'),
    actFlare: document.getElementById('actFlare'),
    actSacrifice: document.getElementById('actSacrifice')
  };

  // Sync HUD lazily (zero unnecessary DOM queries or writes)
  function syncHUD() {
    const p = state.player;
    const hpStr = `${Math.ceil(p.hp)}/${p.maxHp}`;
    if (hudCache.hp !== hpStr) {
      hudCache.hp = hpStr;
      if (hudEls.hpValue) hudEls.hpValue.textContent = hpStr;
      if (hudEls.hpFill) hudEls.hpFill.style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;
    }

    const sanStr = `${Math.round(p.sanity)}%`;
    if (hudCache.san !== sanStr) {
      hudCache.san = sanStr;
      if (hudEls.sanityValue) hudEls.sanityValue.textContent = sanStr;
      if (hudEls.sanityFill) hudEls.sanityFill.style.width = `${Math.max(0, (p.sanity / p.maxSanity) * 100)}%`;
    }

    const sealStr = state.bossSpawned ? 'BOSS ☠' : `${state.stats.brokenSeals} / 4`;
    if (hudCache.seal !== sealStr) {
      hudCache.seal = sealStr;
      if (hudEls.sealsValue) hudEls.sealsValue.textContent = sealStr;
    }

    const killStr = String(state.stats.kills);
    if (hudCache.kills !== killStr) {
      hudCache.kills = killStr;
      if (hudEls.killValue) hudEls.killValue.textContent = killStr;
    }

    const comboShow = state.stats.combo >= 2;
    if (hudCache.comboShow !== comboShow || hudCache.combo !== state.stats.combo) {
      hudCache.comboShow = comboShow;
      hudCache.combo = state.stats.combo;
      hudEls.comboBadge?.classList.toggle('hidden', !comboShow);
      if (comboShow && hudEls.comboCount) hudEls.comboCount.textContent = String(state.stats.combo);
    }

    const frenzySec = Math.ceil(p.frenzyTimer);
    const frenzyShow = frenzySec > 0;
    if (hudCache.frenzyShow !== frenzyShow || hudCache.frenzySec !== frenzySec) {
      hudCache.frenzyShow = frenzyShow;
      hudCache.frenzySec = frenzySec;
      hudEls.frenzyBadge?.classList.toggle('hidden', !frenzyShow);
      if (frenzyShow && hudEls.frenzyTimer) hudEls.frenzyTimer.textContent = `${frenzySec}s`;
    }

    if (hudEls.wardBanner) {
      const showB = state.bannerTimer > 0 && state.mode === 'play';
      if (hudCache.showBanner !== showB) {
        hudCache.showBanner = showB;
        hudEls.wardBanner.classList.toggle('visible', showB);
      }
      if (showB && hudCache.banner !== state.bannerText) {
        hudCache.banner = state.bannerText;
        hudEls.wardBanner.textContent = state.bannerText;
      }
    }

    // Cooldown & Ready proximity highlights
    const nearInteract = state.mode === 'play' && !!window.findNearestInteractable(state);
    if (hudCache.nearInteract !== nearInteract) {
      hudCache.nearInteract = nearInteract;
      hudEls.actRitual?.classList.toggle('highlight-ready', nearInteract);
    }
    const dashCd = p.dashCooldown > 0;
    if (hudCache.dashCd !== dashCd) {
      hudCache.dashCd = dashCd;
      hudEls.actDash?.classList.toggle('cooldown', dashCd);
    }
    const flareCd = p.flareCooldown > 0;
    if (hudCache.flareCd !== flareCd) {
      hudCache.flareCd = flareCd;
      hudEls.actFlare?.classList.toggle('cooldown', flareCd);
    }
    const sacCd = p.sacrificeCooldown > 0;
    if (hudCache.sacCd !== sacCd) {
      hudCache.sacCd = sacCd;
      hudEls.actSacrifice?.classList.toggle('cooldown', sacCd);
    }
  }

  // Initialize Controls & Launch Main 60FPS Loop
  window.initAsylumControls(() => state);
  updateFilterUI();

  function tick(ts) {
    const rawDt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;

    const { moveVec, aimVec } = window.pollAsylumInputs(state);
    window.updateAsylumWorld(state, rawDt, moveVec, aimVec);
    window.renderAsylumFrame(ctx, viewW, viewH, state);
    syncHUD();

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
