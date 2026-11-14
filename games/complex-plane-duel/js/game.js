/**
 * Sequence Strider (عدّاء المتتاليات) - Main 60FPS Game Loop & Sequence Override Orchestrator
 */

(function() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  let state = window.createInitialStriderState('all');
  window.sequenceGame = state;

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

  const FILTER_MODES = [
    { key: 'all', hud: 'المحاور: 51–64', pause: 'محور الأسئلة: الكل (51–64)' },
    { key: 'sectionA', hud: 'القسم أ: 51–57', pause: 'محور الأسئلة: الجبري والمثلثي والأسي (51–57)' },
    { key: 'sectionB', hud: 'القسم ب: 58–64', pause: 'محور الأسئلة: الهندسة والتحويلات (58–64)' }
  ];

  function updateFilterUI() {
    const cur = FILTER_MODES.find(f => f.key === state.topicFilter) || FILTER_MODES[0];
    document.getElementById('filterChipLabel').textContent = cur.hud;
    document.getElementById('btnCycleFilterPause').textContent = cur.pause;
    document.querySelectorAll('#introFilterGrid .filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === state.topicFilter);
    });
  }

  window.cycleSeqFilter = function(dir = 1) {
    const idx = FILTER_MODES.findIndex(f => f.key === state.topicFilter);
    const nextIdx = (idx + dir + FILTER_MODES.length) % FILTER_MODES.length;
    state.topicFilter = FILTER_MODES[nextIdx].key;
    updateFilterUI();
    window.SeqAudio?.playUiTick?.();
  };

  function setBidiSafeMath(el, text) {
    if (!el) return;
    el.textContent = '';
    const str = String(text || '');
    const mathRe = /(?:[+\-](?=[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\])|[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\])(?:[ +\-*/=<>≤≥≠∈∉⊂⊃∪∩∀∃→↔⇒⇔·×÷±≈'′∘^_:,.\\]*[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\])*/g;
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
  window.setSeqBidiSafeMath = setBidiSafeMath;

  window.startStriderFromIntro = function() {
    window.SeqAudio?.init?.();
    window.SeqAudio?.playUiTick?.();
    document.getElementById('introModal')?.classList.add('hidden');
    state.mode = 'play';
    window.lockStriderInputBriefly(220);
    window.setSectorBanner(state, 'الربع الأول Q1 — حلّق في مستوى أرغاند واخترق الأختام الأربعة [▢ / E]', 4.5);
  };

  window.triggerNearestSeqGate = function(s) {
    const tgt = window.findNearestSeqInteract(s);
    if (tgt) {
      window.openSeqOverrideModal(s, tgt);
      return true;
    }
    window.addSeqFloatText(s, s.player.x, s.player.y - 26, 'اقترب من ختم أرغاند أو كيان عقدي مشلول!', '#fbbf24', 1.1);
    return false;
  };

  window.openSeqOverrideModal = function(s, targetInfo) {
    if (s.mode !== 'play') return;
    s.mode = 'override';
    window.lockStriderInputBriefly(220);

    const secTopics = targetInfo.kind === 'gate' ? targetInfo.gate.topics : null;
    const q = window.pickSequenceChallenge(s.topicFilter, secTopics, s.recentQuestionIds);
    s.recentQuestionIds.push(q.id);
    if (s.recentQuestionIds.length > 14) s.recentQuestionIds.shift();

    s.activeOverride = { targetInfo, question: q, hintOpen: false };

    const srcTag = document.getElementById('seqSourceTag');
    const topTag = document.getElementById('seqTopicTag');
    const promptEl = document.getElementById('seqPrompt');
    const graphWrap = document.getElementById('seqGraphWrap');
    const graphCanvas = document.getElementById('seqGraphCanvas');
    const hintBox = document.getElementById('seqHintBox');

    srcTag.textContent = targetInfo.kind === 'gate'
      ? `اختراق ختم أرغاند — ${targetInfo.gate.sectorName}`
      : `تفكيك النواة — ${targetInfo.drone.label}`;
    topTag.textContent = `البند ${q.topic}: ${window.SEQ_TOPICS[q.topic] || ''}`;
    setBidiSafeMath(promptEl, q.prompt);

    if (q.graphSpec) {
      graphWrap.classList.remove('hidden');
      window.drawSequenceGraph(graphCanvas, q.graphSpec);
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
      ? '⚡ [L2 / F] شحن أولير الفائق: تجاوز الختم (-60% طاقة)'
      : '⚡ [L2 / F] تحتاج 60% طاقة أولير للتجاوز التلقائي';

    document.getElementById('overrideModal')?.classList.remove('hidden');
    window.SeqAudio?.playUiTick?.();
  };

  window.toggleSeqHint = function() {
    if (!state.activeOverride) return;
    state.activeOverride.hintOpen = !state.activeOverride.hintOpen;
    document.getElementById('seqHintBox')?.classList.toggle('hidden', !state.activeOverride.hintOpen);
    window.SeqAudio?.playUiTick?.();
  };

  window.submitSeqOption = function(idx) {
    if (state.mode !== 'override' || !state.activeOverride) return;
    const r = state.activeOverride;
    const btn = document.getElementById(`seqOpt${idx}`);
    if (!btn || btn.disabled) return;

    state.stats.questionsAnswered++;
    if (idx === r.question.correctIndex) {
      state.stats.questionsCorrect++;
      btn.classList.add('opt-correct');
      resolveSeqOverride(false);
    } else {
      btn.classList.add('opt-wrong');
      btn.disabled = true;
      state.player.hp = Math.max(0, state.player.hp - 15);
      state.damageFlash = 1.0;
      state.screenShake = Math.max(state.screenShake, 10);
      window.SeqAudio?.playDamage?.();
      window.triggerStriderHaptic?.(100, 0.65, 0.8);
      if (state.player.hp <= 0) {
        closeOverrideCleanly();
        window.finishSequenceGame(state, false);
      }
    }
  };

  window.triggerSeqOverdriveBypass = function() {
    if (state.mode !== 'override' || !state.activeOverride) return;
    if (state.player.energy < 60) return;
    state.player.energy -= 60;
    state.stats.bypasses++;
    window.SeqAudio?.playOverdrive?.();
    window.triggerStriderHaptic?.(140, 0.75, 0.9);
    resolveSeqOverride(true);
  };

  function closeOverrideCleanly() {
    document.getElementById('overrideModal')?.classList.add('hidden');
    state.activeOverride = null;
    if (state.mode === 'override') state.mode = 'play';
    window.lockStriderInputBriefly(220);
  }

  function resolveSeqOverride(wasBypass) {
    const info = state.activeOverride?.targetInfo;
    closeOverrideCleanly();
    if (!info) return;

    if (info.kind === 'gate') {
      const g = info.gate;
      if (!g.broken) {
        g.broken = true;
        state.stats.brokenGates++;
        state.stats.score += wasBypass ? 350 : 650;
        window.SeqAudio?.playGateBreak?.();
        window.spawnSeqParticles(state, g.x, g.y, 26, g.color, 260);
        window.addSeqFloatText(state, g.x, g.y - 34, `تم اختراق ختم أرغاند (${state.stats.brokenGates}/4)!`, '#fbbf24', 1.8);

        if (!wasBypass) {
          state.player.energy = Math.min(state.player.maxEnergy, state.player.energy + 35);
          state.player.hp = Math.min(state.player.maxHp, state.player.hp + 15);
        }

        if (state.stats.brokenGates >= 4) {
          window.spawnFixedPointBoss(state);
        } else {
          window.setSectorBanner(state, `بقي ${4 - state.stats.brokenGates} أختام في أرباع أرغاند — تابع التحليق!`, 3.5);
        }
      }
    } else if (info.kind === 'execute' && info.drone) {
      window.damageSeqDrone(state, info.drone, 9999, true);
    }
  }

  window.openStriderPause = function() {
    if (state.mode === 'end' || state.mode === 'intro') return;
    if (state.mode === 'override') closeOverrideCleanly();
    state.mode = 'pause';
    updateFilterUI();
    document.getElementById('pauseModal')?.classList.remove('hidden');
    window.StriderInput.pauseFocusIdx = 0;
    window.applyStriderPauseFocus();
    window.lockStriderInputBriefly(200);
    window.SeqAudio?.playUiTick?.();
  };

  window.closeStriderPause = function() {
    document.getElementById('pauseModal')?.classList.add('hidden');
    if (state.mode === 'pause') state.mode = 'play';
    window.lockStriderInputBriefly(200);
    window.SeqAudio?.playUiTick?.();
  };

  window.finishSequenceGame = function(s, victory) {
    s.mode = 'end';
    document.getElementById('overrideModal')?.classList.add('hidden');
    document.getElementById('pauseModal')?.classList.add('hidden');

    const title = document.getElementById('endTitle');
    const sub = document.getElementById('endSubtitle');

    if (victory) {
      title.innerHTML = 'تحرير مستوى أرغاند — <span>دمّرْتَ نواة موافر الأعظم!</span>';
      sub.textContent = 'أتقنت كل محاور الأعداد العقدية (51–64): الشكل الجبري والمثلثي والأسي، المرافق والمعيار، الهندسة العقدية، والتحويلات!';
    } else {
      title.innerHTML = 'انهيار المعيار <span>|z| → 0</span> في المستوى العقدي';
      sub.textContent = 'تحطمت مركبة اللحق M(z) قبل كسر الأختام الأربعة. استعمل دوران أولير [✕] ودرع جذور الوحدة [△] وحلّق مجدداً!';
    }

    const acc = s.stats.questionsAnswered > 0
      ? Math.round((s.stats.questionsCorrect / s.stats.questionsAnswered) * 100)
      : 100;

    document.getElementById('endGates').textContent = `${s.stats.brokenGates} / 4`;
    document.getElementById('endScore').textContent = String(s.stats.score);
    document.getElementById('endAccuracy').textContent = `${acc}%`;
    document.getElementById('endBypasses').textContent = String(s.stats.bypasses);

    document.getElementById('endModal')?.classList.remove('hidden');
    window.StriderInput.endFocusIdx = 0;
    window.applyStriderEndFocus();
    window.lockStriderInputBriefly(250);
  };

  window.resetStriderGame = function() {
    const keepFilter = state.topicFilter;
    document.getElementById('endModal')?.classList.add('hidden');
    document.getElementById('pauseModal')?.classList.add('hidden');
    document.getElementById('overrideModal')?.classList.add('hidden');
    document.getElementById('introModal')?.classList.add('hidden');

    state = window.createInitialStriderState(keepFilter);
    state.mode = 'play';
    window.sequenceGame = state;
    hudCache = {};
    window.lockStriderInputBriefly(220);
    window.setSectorBanner(state, 'جولة جديدة — اخترق أختام أرغاند الأربعة (Q1..Q4)', 3.5);
  };

  // Wire UI Buttons
  document.getElementById('btnStartStrider')?.addEventListener('click', window.startStriderFromIntro);
  document.getElementById('filterChip')?.addEventListener('click', () => window.cycleSeqFilter(1));
  document.getElementById('btnCycleFilterPause')?.addEventListener('click', () => window.cycleSeqFilter(1));

  document.querySelectorAll('#introFilterGrid .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.topicFilter = btn.dataset.filter || 'all';
      updateFilterUI();
      window.SeqAudio?.playUiTick?.();
    });
  });

  document.getElementById('btnAudioToggle')?.addEventListener('click', () => {
    window.SeqAudio?.init?.();
    const muted = window.SeqAudio?.toggleMute?.();
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
    if (state.mode === 'pause') window.closeStriderPause();
    else window.openStriderPause();
  });
  document.getElementById('btnResumeGame')?.addEventListener('click', window.closeStriderPause);
  document.getElementById('btnRestartPause')?.addEventListener('click', window.resetStriderGame);
  document.getElementById('btnRetryEnd')?.addEventListener('click', window.resetStriderGame);

  for (let i = 0; i < 4; i++) {
    document.getElementById(`seqOpt${i}`)?.addEventListener('click', () => window.submitSeqOption(i));
  }
  document.getElementById('btnToggleHint')?.addEventListener('click', window.toggleSeqHint);
  document.getElementById('btnOverdriveBypass')?.addEventListener('click', window.triggerSeqOverdriveBypass);

  document.getElementById('actJump')?.addEventListener('click', () => state.mode === 'play' && window.performJump(state));
  document.getElementById('actDash')?.addEventListener('click', () => state.mode === 'play' && window.performStriderDash(state, window.getStriderMoveVec().x));
  document.getElementById('actOverride')?.addEventListener('click', () => state.mode === 'play' && window.triggerNearestSeqGate(state));
  document.getElementById('actAegis')?.addEventListener('click', () => state.mode === 'play' && window.performAegisShield(state));
  document.getElementById('actPulse')?.addEventListener('click', () => state.mode === 'play' && window.performPulseShot(state));
  document.getElementById('actOverdrive')?.addEventListener('click', () => state.mode === 'play' && window.performOverdriveWorld(state));

  function syncHUD() {
    const p = state.player;
    const hpStr = `${Math.ceil(p.hp)}/${p.maxHp}`;
    if (hudCache.hp !== hpStr) {
      hudCache.hp = hpStr;
      document.getElementById('hpValue').textContent = hpStr;
      document.getElementById('hpFill').style.width = `${Math.max(0, (p.hp / p.maxHp) * 100)}%`;
    }

    const enStr = `${Math.round(p.energy)}%`;
    if (hudCache.en !== enStr) {
      hudCache.en = enStr;
      document.getElementById('energyValue').textContent = enStr;
      document.getElementById('energyFill').style.width = `${Math.max(0, (p.energy / p.maxEnergy) * 100)}%`;
    }

    const gStr = state.bossSpawned ? 'BOSS موافر' : `${state.stats.brokenGates} / 4`;
    if (hudCache.gates !== gStr) {
      hudCache.gates = gStr;
      document.getElementById('gatesValue').textContent = gStr;
    }

    const scStr = String(state.stats.score);
    if (hudCache.score !== scStr) {
      hudCache.score = scStr;
      document.getElementById('scoreValue').textContent = scStr;
    }

    const cShow = state.stats.combo >= 2;
    if (hudCache.cShow !== cShow || hudCache.cVal !== state.stats.combo) {
      hudCache.cShow = cShow;
      hudCache.cVal = state.stats.combo;
      document.getElementById('comboBadge')?.classList.toggle('hidden', !cShow);
      if (cShow) document.getElementById('comboCount').textContent = String(state.stats.combo);
    }

    const bannerEl = document.getElementById('sectorBanner');
    if (bannerEl) {
      const showB = state.bannerTimer > 0 && state.mode === 'play';
      bannerEl.classList.toggle('visible', showB);
      if (showB && hudCache.banner !== state.bannerText) {
        hudCache.banner = state.bannerText;
        bannerEl.textContent = state.bannerText;
      }
    }

    const nearInt = state.mode === 'play' ? window.findNearestSeqInteract(state) : null;
    document.getElementById('actOverride')?.classList.toggle('highlight-ready', !!nearInt);
    document.getElementById('actDash')?.classList.toggle('cooldown', p.dashCooldown > 0);
    document.getElementById('actAegis')?.classList.toggle('cooldown', p.aegisCooldown > 0);
    document.getElementById('actOverdrive')?.classList.toggle('cooldown', p.overdriveCooldown > 0 || p.energy < 40);
  }

  window.initStriderControls(() => state);
  updateFilterUI();

  function tick(ts) {
    const rawDt = Math.min(0.05, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;

    const { moveVec, aimVec } = window.pollStriderInputs(state);
    window.updateStriderWorld(state, rawDt, moveVec, aimVec);
    window.renderStriderFrame(ctx, viewW, viewH, state);
    syncHUD();

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
