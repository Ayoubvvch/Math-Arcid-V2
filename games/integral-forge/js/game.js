/**
 * Integral Forge (محرقة التكامل والمعادلات) - Main 60FPS Game Loop & Modal Coordinator
 * Manages Intro, Foundry Seal Overrides, Pause/Filter Menu, End Summary, Cached HUD Sync, and Bidi Math.
 */

(function() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  let state = window.createInitialForgeState('all');
  window.forgeGame = state;

  let viewW = window.innerWidth;
  let viewH = window.innerHeight;
  let lastTs = performance.now();
  let hudCache = {};
  let overrideResolveTimer = null;

  function resizeCanvas() {
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    canvas.style.width = viewW + 'px';
    canvas.style.height = viewH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const FILTER_MODES = [
    { key: 'all', hud: 'المحاور: 79–90', pause: 'محور الأسئلة: الكل (79–90)' },
    { key: 'sectionA', hud: 'القسم أ: التكامل (79–84)', pause: 'محور الأسئلة: الأصلية والأجزاء (79–84)' },
    { key: 'sectionB', hud: 'القسم ب: التفاضلية (85–90)', pause: 'محور الأسئلة: المساحات والتفاضلية (85–90)' }
  ];

  function updateFilterUI() {
    const cur = FILTER_MODES.find(f => f.key === state.topicFilter) || FILTER_MODES[0];
    const chipEl = document.getElementById('filterChipLabel');
    const pauseEl = document.getElementById('btnCycleFilterPause');
    if (chipEl) chipEl.textContent = cur.hud;
    if (pauseEl) pauseEl.textContent = cur.pause;

    document.querySelectorAll('#introFilterGrid .filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === state.topicFilter);
    });
  }

  window.cycleForgeFilter = function(dir = 1) {
    const idx = FILTER_MODES.findIndex(f => f.key === state.topicFilter);
    const nextIdx = (idx + dir + FILTER_MODES.length) % FILTER_MODES.length;
    state.topicFilter = FILTER_MODES[nextIdx].key;
    updateFilterUI();
    window.ForgeAudio?.playUiTick?.();
  };

  function setBidiSafeMath(el, text) {
    if (!el) return;
    el.textContent = '';
    const str = String(text || '');
    const mathRe = /(?:[+\-](?=[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβγδπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\∫Φμ])|[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβγδπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\∫Φμ])(?:[ +\-*/=<>≤≥≠∈∉⊂⊃∪∩∀∃→↔⇒⇔·×÷±≈'′∘^_:,.\\∫Φμ]*[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβγδπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\∫Φμ])*/g;

    let last = 0;
    let m;
    while ((m = mathRe.exec(str)) !== null) {
      let sIdx = m.index;
      let eIdx = m.index + m[0].length;
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
      if (sIdx > last) el.appendChild(document.createTextNode(str.slice(last, sIdx)));
      const bdi = document.createElement('bdi');
      bdi.dir = 'ltr';
      bdi.className = 'math-ltr';
      bdi.textContent = tok;
      el.appendChild(bdi);
      last = eIdx;
    }
    if (last < str.length) el.appendChild(document.createTextNode(str.slice(last)));
  }
  window.setBidiSafeMath = setBidiSafeMath;
  window.setSeqBidiSafeMath = setBidiSafeMath;

  window.startForgeFromIntro = function() {
    window.ForgeAudio?.init?.();
    window.ForgeAudio?.playUiTick?.();
    document.getElementById('introModal')?.classList.add('hidden');
    state.mode = 'play';
    window.lockForgeInputBriefly(220);
    window.setForgeBanner(state, 'المسبك α — تسلّق الرافعات واخترق الأفران الأربعة [▢ / E]', 4.5);
  };

  window.triggerNearestForgeGate = function(s) {
    const tgt = window.findNearestForgeInteract(s);
    if (tgt) {
      window.openForgeOverrideModal(s, tgt);
      return true;
    }
    window.addForgeFloatText(s, s.player.x, s.player.y - 28, 'اقترب من ختم فرن أو غولم مشلول!', '#fde047', 1.1);
    return false;
  };

  window.openForgeOverrideModal = function(s, targetInfo) {
    if (s.mode !== 'play') return;
    s.mode = 'override';
    window.lockForgeInputBriefly(220);

    const secTopics = targetInfo.kind === 'gate' ? targetInfo.gate.topics : null;
    const q = window.pickForgeChallenge(s.topicFilter, secTopics, s.recentQuestionIds);
    s.recentQuestionIds.push(q.id);
    if (s.recentQuestionIds.length > 14) s.recentQuestionIds.shift();

    s.activeOverride = { targetInfo, question: q, hintOpen: false, locked: false };

    const srcTag = document.getElementById('seqSourceTag');
    const topTag = document.getElementById('seqTopicTag');
    const promptEl = document.getElementById('seqPrompt');
    const graphWrap = document.getElementById('seqGraphWrap');
    const graphCanvas = document.getElementById('seqGraphCanvas');
    const hintBox = document.getElementById('seqHintBox');

    srcTag.textContent = targetInfo.kind === 'gate'
      ? `اختراق الختم — ${targetInfo.gate.sectorName}`
      : `تفكيك الغولم — ${targetInfo.enemy.label}`;
    topTag.textContent = `البند ${q.topic}: ${window.FORGE_TOPICS[q.topic] || ''}`;
    setBidiSafeMath(promptEl, q.prompt);

    if (q.graphSpec) {
      graphWrap.classList.remove('hidden');
      window.drawForgeGraph(graphCanvas, q.graphSpec);
    } else {
      graphWrap.classList.add('hidden');
    }

    setBidiSafeMath(hintBox, q.hint);
    hintBox.classList.add('hidden');

    for (let i = 0; i < 4; i++) {
      const btn = document.getElementById(`seqOpt${i}`);
      btn.classList.remove('opt-correct', 'opt-wrong');
      btn.disabled = false;
      setBidiSafeMath(btn.querySelector('.opt-text'), q.options[i] || '');
    }

    const bypassBtn = document.getElementById('btnOverdriveBypass');
    const canBypass = s.player.energy >= 60;
    bypassBtn.disabled = !canBypass;
    bypassBtn.textContent = canBypass
      ? '⚡ [L2 / F] تفريغ صدمة حجم الدوران: تجاوز الختم (-60% تدفق)'
      : '⚡ [L2 / F] تحتاج 60% تدفق تكامل للتجاوز التلقائي';

    document.getElementById('overrideModal')?.classList.remove('hidden');
    window.ForgeAudio?.playUiTick?.();
  };

  window.toggleForgeHint = function() {
    if (!state.activeOverride) return;
    state.activeOverride.hintOpen = !state.activeOverride.hintOpen;
    document.getElementById('seqHintBox')?.classList.toggle('hidden', !state.activeOverride.hintOpen);
    window.ForgeAudio?.playUiTick?.();
  };

  window.submitForgeOption = function(idx) {
    if (state.mode !== 'override' || !state.activeOverride || state.activeOverride.locked) return;
    const r = state.activeOverride;
    const btn = document.getElementById(`seqOpt${idx}`);
    if (!btn || btn.disabled) return;

    state.stats.questionsAnswered++;
    if (idx === r.question.correctIndex) {
      r.locked = true;
      state.stats.questionsCorrect++;
      btn.classList.add('opt-correct');
      window.ForgeAudio?.playGateBreak?.();
      window.triggerForgeHaptic?.(55, 0.25, 0.45);
      overrideResolveTimer = setTimeout(() => {
        overrideResolveTimer = null;
        resolveForgeOverride(false);
      }, 360);
    } else {
      btn.classList.add('opt-wrong');
      btn.disabled = true;
      state.player.hp = Math.max(0, state.player.hp - 15);
      state.damageFlash = 1.0;
      state.screenShake = Math.max(state.screenShake, 10);
      window.ForgeAudio?.playOverrideFail?.();
      window.triggerForgeHaptic?.(110, 0.65, 0.85);
      if (state.player.hp <= 0) {
        closeOverrideCleanly();
        window.finishForgeGame(state, false);
      }
    }
  };

  window.triggerForgeOverdriveBypass = function() {
    if (state.mode !== 'override' || !state.activeOverride || state.activeOverride.locked) return;
    if (state.player.energy < 60) return;
    state.activeOverride.locked = true;
    state.player.energy -= 60;
    state.stats.bypasses++;
    window.ForgeAudio?.playOverdrive?.();
    window.triggerForgeHaptic?.(140, 0.75, 0.9);
    resolveForgeOverride(true);
  };

  function closeOverrideCleanly() {
    document.getElementById('overrideModal')?.classList.add('hidden');
    state.activeOverride = null;
    if (state.mode === 'override') state.mode = 'play';
    window.lockForgeInputBriefly(220);
  }

  function resolveForgeOverride(wasBypass) {
    const info = state.activeOverride?.targetInfo;
    closeOverrideCleanly();
    if (!info) return;

    if (info.kind === 'gate') {
      const g = info.gate;
      if (!g.broken) {
        g.broken = true;
        state.stats.brokenGates++;
        state.stats.score += wasBypass ? 350 : 700;
        window.ForgeAudio?.playGateBreak?.();
        window.spawnForgeParticles(state, g.x, g.y, 28, g.color, 260);
        window.addForgeFloatText(state, g.x, g.y - 34, `تم صهر ختم الفرن (${state.stats.brokenGates}/4)!`, '#fde047', 1.8);

        if (!wasBypass) {
          state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 35);
          state.player.hp = Math.min(state.player.maxHp, state.player.hp + 18);
        }

        if (state.stats.brokenGates >= 4) {
          window.spawnDifferentialBoss(state);
        } else {
          window.setForgeBanner(state, `بقي ${4 - state.stats.brokenGates} أختام في المسبك — واصل التقدّم!`, 3.5);
        }
      }
    } else if (info.kind === 'execute' && info.enemy) {
      window.damageForgeEnemy(state, info.enemy, 9999, true, true);
    }
  }

  window.openForgePause = function() {
    if (state.mode === 'end' || state.mode === 'intro') return;
    if (state.mode === 'override') closeOverrideCleanly();
    state.mode = 'pause';
    updateFilterUI();
    document.getElementById('pauseModal')?.classList.remove('hidden');
    window.ForgeInput.pauseFocusIdx = 0;
    window.applyForgePauseFocus();
    window.lockForgeInputBriefly(200);
    window.ForgeAudio?.playUiTick?.();
  };

  window.closeForgePause = function() {
    document.getElementById('pauseModal')?.classList.add('hidden');
    if (state.mode === 'pause') state.mode = 'play';
    window.lockForgeInputBriefly(200);
    window.ForgeAudio?.playUiTick?.();
  };

  window.finishForgeGame = function(s, victory) {
    s.mode = 'end';
    document.getElementById('overrideModal')?.classList.add('hidden');
    document.getElementById('pauseModal')?.classList.add('hidden');

    const title = document.getElementById('endTitle');
    const sub = document.getElementById('endSubtitle');

    if (victory) {
      title.innerHTML = 'إتقان المحرقة — <span>تم سحق عملاق المعادلات التفاضلية!</span>';
      sub.textContent = 'أتقنت محاور التكامل والمعادلات التفاضلية (79–90): الدوال الأصلية، المكاملة بالأجزاء، المساحات والحجوم، وحل المعادلات التفاضلية من الرتبة 1 و 2!';
    } else {
      title.innerHTML = 'انصهار درع الآلي <span>في محرقة التكامل</span>';
      sub.textContent = 'تضرّر هيكل TITAN-∫ قبل إخماد الأختام الأربعة. استعمل مقص المساحة [◯] ودرع شال [△] وحاول مجدداً!';
    }

    const acc = s.stats.questionsAnswered > 0
      ? Math.round((s.stats.questionsCorrect / s.stats.questionsAnswered) * 100)
      : 100;

    document.getElementById('endGates').textContent = `${s.stats.brokenGates} / 4`;
    document.getElementById('endScore').textContent = String(s.stats.score);
    document.getElementById('endAccuracy').textContent = `${acc}%`;
    document.getElementById('endBypasses').textContent = String(s.stats.bypasses);

    document.getElementById('endModal')?.classList.remove('hidden');
    window.ForgeInput.endFocusIdx = 0;
    window.applyForgeEndFocus();
    window.lockForgeInputBriefly(250);
  };

  window.resetForgeGame = function() {
    if (overrideResolveTimer) {
      clearTimeout(overrideResolveTimer);
      overrideResolveTimer = null;
    }
    const keepFilter = state.topicFilter;
    document.getElementById('endModal')?.classList.add('hidden');
    document.getElementById('pauseModal')?.classList.add('hidden');
    document.getElementById('overrideModal')?.classList.add('hidden');
    document.getElementById('introModal')?.classList.add('hidden');

    state = window.createInitialForgeState(keepFilter);
    state.mode = 'play';
    window.forgeGame = state;
    hudCache = {};
    window.lockForgeInputBriefly(220);
    window.setForgeBanner(state, 'دورة صهر جديدة — اخترق الأختام الأربعة (α, β, γ, δ)', 3.5);
  };

  // Wire UI Buttons
  document.getElementById('btnStartForge')?.addEventListener('click', window.startForgeFromIntro);
  document.getElementById('filterChip')?.addEventListener('click', () => window.cycleForgeFilter(1));
  document.getElementById('btnCycleFilterPause')?.addEventListener('click', () => window.cycleForgeFilter(1));

  document.querySelectorAll('#introFilterGrid .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.topicFilter = btn.dataset.filter || 'all';
      updateFilterUI();
      window.ForgeAudio?.playUiTick?.();
    });
  });

  document.getElementById('btnAudioToggle')?.addEventListener('click', () => {
    window.ForgeAudio?.init?.();
    const muted = window.ForgeAudio?.toggleMute?.();
    document.getElementById('btnAudioToggle').textContent = muted ? '🔇' : '🔊';
    document.getElementById('btnToggleSoundPause').textContent = muted ? 'الصوت: مكتوم' : 'الصوت: مفعل';
  });
  document.getElementById('btnToggleSoundPause')?.addEventListener('click', () => document.getElementById('btnAudioToggle')?.click());
  document.getElementById('btnHelpToggle')?.addEventListener('click', () => {
    state.mode = 'intro';
    document.getElementById('pauseModal')?.classList.add('hidden');
    document.getElementById('introModal')?.classList.remove('hidden');
    updateFilterUI();
  });
  document.getElementById('btnPauseToggle')?.addEventListener('click', () => {
    if (state.mode === 'pause') window.closeForgePause();
    else window.openForgePause();
  });
  document.getElementById('btnResumeGame')?.addEventListener('click', window.closeForgePause);
  document.getElementById('btnRestartPause')?.addEventListener('click', window.resetForgeGame);
  document.getElementById('btnRetryEnd')?.addEventListener('click', window.resetForgeGame);

  for (let i = 0; i < 4; i++) {
    document.getElementById(`seqOpt${i}`)?.addEventListener('click', () => window.submitForgeOption(i));
  }
  document.getElementById('btnToggleHint')?.addEventListener('click', window.toggleForgeHint);
  document.getElementById('btnOverdriveBypass')?.addEventListener('click', window.triggerForgeOverdriveBypass);

  document.getElementById('actJump')?.addEventListener('click', () => state.mode === 'play' && window.performForgeJump(state, false));
  document.getElementById('actDash')?.addEventListener('click', () => state.mode === 'play' && window.performForgeSlice(state, window.getForgeMoveVec().x));
  document.getElementById('actOverride')?.addEventListener('click', () => state.mode === 'play' && window.triggerNearestForgeGate(state));
  document.getElementById('actAegis')?.addEventListener('click', () => state.mode === 'play' && window.performForgeAegis(state));
  document.getElementById('actPulse')?.addEventListener('click', () => state.mode === 'play' && window.performForgeCannon(state));
  document.getElementById('actOverdrive')?.addEventListener('click', () => state.mode === 'play' && window.performForgeOverdrive(state));

  // Cached HUD DOM References (Zero per-frame DOM queries or unnecessary writes)
  const hudEls = {
    hpValue: document.getElementById('hpValue'),
    hpFill: document.getElementById('hpFill'),
    energyValue: document.getElementById('energyValue'),
    energyFill: document.getElementById('energyFill'),
    gatesValue: document.getElementById('gatesValue'),
    wingValue: document.getElementById('wingValue'),
    scoreValue: document.getElementById('scoreValue'),
    comboBadge: document.getElementById('comboBadge'),
    comboCount: document.getElementById('comboCount'),
    sectorBanner: document.getElementById('sectorBanner'),
    actOverride: document.getElementById('actOverride'),
    actDash: document.getElementById('actDash'),
    actAegis: document.getElementById('actAegis'),
    actOverdrive: document.getElementById('actOverdrive')
  };

  function syncHUD() {
    const p = state.player;
    const hpStr = `${Math.ceil(p.hp)}/${p.maxHp}`;
    if (hudCache.hp !== hpStr) {
      hudCache.hp = hpStr;
      if (hudEls.hpValue) hudEls.hpValue.textContent = hpStr;
      if (hudEls.hpFill) hudEls.hpFill.style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;
    }

    const enStr = `${Math.round(p.energy)}%`;
    if (hudCache.en !== enStr) {
      hudCache.en = enStr;
      if (hudEls.energyValue) hudEls.energyValue.textContent = enStr;
      if (hudEls.energyFill) hudEls.energyFill.style.width = `${Math.max(0, (p.energy / p.maxEnergy) * 100)}%`;
    }

    const boss = state.bossSpawned ? state.enemies.find(e => e.kind === 'boss') : null;
    const gStr = boss ? `BOSS الطور ${boss.phase}` : (state.bossSpawned ? 'BOSS البوتقة' : `${state.stats.brokenGates} / 4`);
    if (hudCache.gates !== gStr) {
      hudCache.gates = gStr;
      if (hudEls.gatesValue) hudEls.gatesValue.textContent = gStr;
    }

    const wingStr = window.getForgeWingLabel(p.x, p.y);
    if (hudCache.wing !== wingStr) {
      hudCache.wing = wingStr;
      if (hudEls.wingValue) hudEls.wingValue.textContent = wingStr;
    }

    const scStr = String(state.stats.score);
    if (hudCache.score !== scStr) {
      hudCache.score = scStr;
      if (hudEls.scoreValue) hudEls.scoreValue.textContent = scStr;
    }

    const cShow = state.stats.combo >= 2;
    if (hudCache.cShow !== cShow || hudCache.cVal !== state.stats.combo) {
      hudCache.cShow = cShow;
      hudCache.cVal = state.stats.combo;
      hudEls.comboBadge?.classList.toggle('hidden', !cShow);
      if (cShow && hudEls.comboCount) hudEls.comboCount.textContent = String(state.stats.combo);
    }

    if (hudEls.sectorBanner) {
      const showB = state.bannerTimer > 0 && state.mode === 'play';
      if (hudCache.showBanner !== showB) {
        hudCache.showBanner = showB;
        hudEls.sectorBanner.classList.toggle('visible', showB);
      }
      if (showB && hudCache.banner !== state.bannerText) {
        hudCache.banner = state.bannerText;
        hudEls.sectorBanner.textContent = state.bannerText;
      }
    }

    const nearReady = state.mode === 'play' && !!window.findNearestForgeInteract(state);
    if (hudCache.nearReady !== nearReady) {
      hudCache.nearReady = nearReady;
      hudEls.actOverride?.classList.toggle('highlight-ready', nearReady);
    }
    const dashCd = p.dashCooldown > 0;
    if (hudCache.dashCd !== dashCd) {
      hudCache.dashCd = dashCd;
      hudEls.actDash?.classList.toggle('cooldown', dashCd);
    }
    const aegisCd = p.aegisCooldown > 0;
    if (hudCache.aegisCd !== aegisCd) {
      hudCache.aegisCd = aegisCd;
      hudEls.actAegis?.classList.toggle('cooldown', aegisCd);
    }
    const odCd = p.overdriveCooldown > 0 || p.energy < 40;
    if (hudCache.odCd !== odCd) {
      hudCache.odCd = odCd;
      hudEls.actOverdrive?.classList.toggle('cooldown', odCd);
    }
  }

  window.initForgeControls(() => state);
  updateFilterUI();

  function tick(ts) {
    const rawDt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;

    const { moveVec, aimVec, holdingDown } = window.pollForgeInputs(state);
    window.updateForgeWorld(state, rawDt, moveVec, aimVec, holdingDown);
    window.renderForgeFrame(ctx, viewW, viewH, state);
    syncHUD();

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
