/**
 * Limit Abyss — هاوية النهايات والاتصال 2BAC PC
 * Core Game Loop, State Coordinator & Modal Manager (60FPS Locked)
 */

window.AbyssGame = (function() {
  const FILTER_MODES = [
    { key: 'all', label: 'المحاور: الكل (1–22)' },
    { key: 's1', label: 'المحور 1: النهايات (1–6)', sector: 1 },
    { key: 's2', label: 'المحور 2: الاتصال (7–11)', sector: 2 },
    { key: 's3', label: 'المحور 3: TVI وصورة المجال (12–17)', sector: 3 },
    { key: 's4', label: 'المحور 4: التقابل و f⁻¹ والجذور (18–22)', sector: 4 }
  ];

  let currentFilterIdx = 0;
  let isPaused = true;
  let isRunning = false;
  let animId = null;

  let activeGate = null;
  let activeQuestion = null;
  let isModalLocked = false;
  let overrideTimerId = null;
  let endModalShown = false;
  let recentQuestionIds = [];
  let hudCache = {};

  // BIDIRECTIONAL MATHEMATICAL ISOLATION (setBidiSafeMath with balanced parentheses)
  function setBidiSafeMath(el, text) {
    if (!el) return;
    el.textContent = '';
    const str = String(text || '');
    const mathRe = /(?:[+\-](?=[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\])|[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\])(?:[ +\-*/=<>≤≥≠∈∉⊂⊃∪∩∀∃→↔⇒⇔·×÷±≈'′∘^_:,.\\]*[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\])*/g;

    let lastIdx = 0;
    let match;
    while ((match = mathRe.exec(str)) !== null) {
      let sIdx = match.index;
      let eIdx = sIdx + match[0].length;
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
      if (sIdx > lastIdx) {
        el.appendChild(document.createTextNode(str.slice(lastIdx, sIdx)));
      }
      const bdi = document.createElement('bdi');
      bdi.className = 'math-ltr';
      bdi.dir = 'ltr';
      bdi.textContent = tok;
      el.appendChild(bdi);
      lastIdx = eIdx;
    }
    if (lastIdx < str.length) {
      el.appendChild(document.createTextNode(str.slice(lastIdx)));
    }
  }
  window.setBidiSafeMath = setBidiSafeMath;
  window.setSeqBidiSafeMath = setBidiSafeMath;

  function initGame() {
    window.AbyssWorld.initWorld();
    window.AbyssRenderer.initRenderer();
    window.AbyssInput.initControls();

    hookUIButtons();
    updateFilterUI();

    isPaused = true;
    isRunning = true;
    loop();
  }

  function hookUIButtons() {
    const btnAudio = document.getElementById('btnAudioToggle');
    const btnAudioPause = document.getElementById('btnToggleSoundPause');
    const onToggleAudio = () => {
      window.AbyssAudio?.init?.();
      const muted = window.AbyssAudio?.toggleMute?.();
      const txt = muted ? '🔇' : '🔊';
      if (btnAudio) btnAudio.textContent = txt;
      if (btnAudioPause) btnAudioPause.textContent = `الصوت: ${muted ? 'معطل' : 'مفعل'}`;
    };
    btnAudio?.addEventListener('click', onToggleAudio);
    btnAudioPause?.addEventListener('click', onToggleAudio);

    document.getElementById('btnPauseToggle')?.addEventListener('click', togglePause);
    document.getElementById('btnResumeGame')?.addEventListener('click', togglePause);

    document.getElementById('btnHelpToggle')?.addEventListener('click', () => {
      isPaused = true;
      document.getElementById('pauseModal')?.classList.add('hidden');
      document.getElementById('introModal')?.classList.remove('hidden');
    });

    const onCycleFilter = () => {
      currentFilterIdx = (currentFilterIdx + 1) % FILTER_MODES.length;
      updateFilterUI();
      window.AbyssAudio?.playUiTick?.();
    };
    document.getElementById('filterChip')?.addEventListener('click', onCycleFilter);
    document.getElementById('btnCycleFilterPause')?.addEventListener('click', onCycleFilter);

    for (let i = 0; i < 4; i++) {
      const btn = document.getElementById(`seqOpt${i}`);
      btn?.addEventListener('click', () => selectOption(i));
    }
    document.getElementById('btnToggleHint')?.addEventListener('click', toggleHint);
    document.getElementById('btnOverdriveBypass')?.addEventListener('click', triggerBypass);

    document.getElementById('btnRestartPause')?.addEventListener('click', restartGame);
    document.getElementById('btnRetryEnd')?.addEventListener('click', restartGame);
  }

  function updateFilterUI() {
    const mode = FILTER_MODES[currentFilterIdx];
    const chip = document.getElementById('filterChipLabel');
    const pauseBtn = document.getElementById('btnCycleFilterPause');
    if (chip) chip.textContent = mode.label;
    if (pauseBtn) pauseBtn.textContent = `محور الأسئلة: ${mode.label}`;
  }

  function startGame() {
    window.AbyssAudio?.init?.();
    window.AbyssAudio?.playUiTick?.();
    document.getElementById('introModal')?.classList.add('hidden');
    isPaused = false;
    if (!isRunning) {
      isRunning = true;
      loop();
    }
  }
  window.startAbyssFromIntro = startGame;

  function togglePause() {
    if (endModalShown) return;
    isPaused = !isPaused;
    const modal = document.getElementById('pauseModal');
    if (isPaused) {
      modal?.classList.remove('hidden');
      window.AbyssAudio?.playUiTick?.();
    } else {
      modal?.classList.add('hidden');
      window.AbyssAudio?.playUiTick?.();
    }
  }
  window.toggleAbyssPause = togglePause;

  function restartGame() {
    if (overrideTimerId) {
      clearTimeout(overrideTimerId);
      overrideTimerId = null;
    }
    document.getElementById('pauseModal')?.classList.add('hidden');
    document.getElementById('endModal')?.classList.add('hidden');
    document.getElementById('overrideModal')?.classList.add('hidden');
    window.AbyssWorld.initWorld();
    isPaused = false;
    isModalLocked = false;
    endModalShown = false;
    activeGate = null;
    activeQuestion = null;
    hudCache = {};
    if (!isRunning) {
      isRunning = true;
      loop();
    }
  }

  function triggerInteractOrOverride() {
    if (isPaused) return;

    const staggeredEnemy = window.AbyssWorld.findNearbyStaggeredEnemy();
    if (staggeredEnemy) {
      window.AbyssWorld.executeStaggeredEnemy(staggeredEnemy);
      return;
    }

    const gate = window.AbyssWorld.findNearbyGate();
    if (gate) {
      openOverrideModal(gate);
    }
  }
  window.triggerInteractOrOverride = triggerInteractOrOverride;

  function openOverrideModal(gate) {
    activeGate = gate;
    isPaused = true;
    isModalLocked = false;

    let targetSector = gate.sectorId;
    const filter = FILTER_MODES[currentFilterIdx];
    if (filter && filter.sector) targetSector = filter.sector;

    if (typeof window.pickLimitChallenge === 'function') {
      activeQuestion = window.pickLimitChallenge(targetSector, recentQuestionIds);
    } else {
      const bank = window.LIMIT_QUESTION_BANK || [];
      let pool = bank.filter(q => q.sector === targetSector);
      if (!pool.length) pool = bank;
      activeQuestion = pool[Math.floor(Math.random() * pool.length)];
    }

    if (activeQuestion?.id) {
      recentQuestionIds.push(activeQuestion.id);
      if (recentQuestionIds.length > 14) recentQuestionIds.shift();
    }

    const modal = document.getElementById('overrideModal');
    const srcTag = document.getElementById('seqSourceTag');
    const topTag = document.getElementById('seqTopicTag');
    const promptEl = document.getElementById('seqPrompt');
    const graphWrap = document.getElementById('seqGraphWrap');
    const graphCanvas = document.getElementById('seqGraphCanvas');
    const hintBox = document.getElementById('seqHintBox');

    srcTag.textContent = gate.sectorName;
    topTag.textContent = `البند ${activeQuestion.topic}: ${window.LIMIT_TOPICS[activeQuestion.topic] || ''}`;
    setBidiSafeMath(promptEl, activeQuestion.prompt);

    if (activeQuestion.graphSpec) {
      graphWrap.classList.remove('hidden');
      window.drawLimitGraph(graphCanvas, activeQuestion.graphSpec);
    } else {
      graphWrap.classList.add('hidden');
    }

    setBidiSafeMath(hintBox, activeQuestion.hint);
    hintBox.classList.add('hidden');

    for (let i = 0; i < 4; i++) {
      const btn = document.getElementById(`seqOpt${i}`);
      btn.classList.remove('opt-correct', 'opt-wrong');
      btn.disabled = false;
      setBidiSafeMath(btn.querySelector('.opt-text'), activeQuestion.options[i] || '');
    }

    const bypassBtn = document.getElementById('btnOverdriveBypass');
    const canBypass = window.AbyssWorld.getState().player.energy >= 60;
    bypassBtn.disabled = !canBypass;

    modal.classList.remove('hidden');
    window.AbyssAudio?.playUiTick?.();
  }

  function toggleHint() {
    const box = document.getElementById('seqHintBox');
    if (!box) return;
    box.classList.toggle('hidden');
    window.AbyssAudio?.playUiTick?.();
  }
  window.toggleAbyssHint = toggleHint;

  function triggerBypass() {
    if (!activeGate || isModalLocked) return;
    const ok = window.AbyssWorld.bypassGateWithEnergy(activeGate);
    if (ok) {
      closeOverrideModal();
    }
  }
  window.triggerAbyssBypass = triggerBypass;

  function selectOption(idx) {
    if (!activeQuestion || !activeGate || isModalLocked) return;
    isModalLocked = true;

    const wState = window.AbyssWorld.getState();
    wState.totalAnswers++;

    const isCorrect = idx === activeQuestion.correctIndex;
    const clickedBtn = document.getElementById(`seqOpt${idx}`);

    if (isCorrect) {
      wState.correctAnswers++;
      clickedBtn?.classList.add('opt-correct');
      window.AbyssAudio?.playOverrideSuccess?.();

      overrideTimerId = setTimeout(() => {
        overrideTimerId = null;
        window.AbyssWorld.unlockGate(activeGate);
        closeOverrideModal();
      }, 650);
    } else {
      clickedBtn?.classList.add('opt-wrong');
      const correctBtn = document.getElementById(`seqOpt${activeQuestion.correctIndex}`);
      correctBtn?.classList.add('opt-correct');

      window.AbyssAudio?.playOverrideFail?.();
      window.AbyssInput?.triggerHaptic?.(120, 0.6, 0.85);
      wState.player.hp = Math.max(10, wState.player.hp - 20);

      overrideTimerId = setTimeout(() => {
        overrideTimerId = null;
        closeOverrideModal();
      }, 1350);
    }
  }
  window.selectAbyssOption = selectOption;

  function closeOverrideModal() {
    document.getElementById('overrideModal')?.classList.add('hidden');
    isPaused = false;
    isModalLocked = false;
    activeGate = null;
    activeQuestion = null;
  }

  function updateHUD() {
    const s = window.AbyssWorld.getState();
    const p = s.player;

    const hpStr = `${Math.round(p.hp)}/${p.maxHp}`;
    if (hudCache.hp !== hpStr) {
      hudCache.hp = hpStr;
      const hpFill = document.getElementById('hpFill');
      const hpVal = document.getElementById('hpValue');
      if (hpFill && hpVal) {
        hpFill.style.width = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100)) + '%';
        hpVal.textContent = hpStr;
      }
    }

    const enStr = `${Math.round(p.energy)}%`;
    if (hudCache.en !== enStr) {
      hudCache.en = enStr;
      const energyFill = document.getElementById('energyFill');
      const energyVal = document.getElementById('energyValue');
      if (energyFill && energyVal) {
        energyFill.style.width = Math.max(0, Math.min(100, (p.energy / p.maxEnergy) * 100)) + '%';
        energyVal.textContent = enStr;
      }
    }

    const depthStr = `${Math.round(p.y * 4)} m`;
    if (hudCache.depth !== depthStr) {
      hudCache.depth = depthStr;
      const depthEl = document.getElementById('depthValue');
      if (depthEl) depthEl.textContent = depthStr;
    }

    const gatesStr = s.boss ? `BOSS الطور ${s.boss.phase}` : `${s.gatesCleared} / 4`;
    if (hudCache.gates !== gatesStr) {
      hudCache.gates = gatesStr;
      const gatesEl = document.getElementById('gatesValue');
      if (gatesEl) gatesEl.textContent = gatesStr;
    }

    const scoreStr = s.score.toLocaleString();
    if (hudCache.score !== scoreStr) {
      hudCache.score = scoreStr;
      const scoreEl = document.getElementById('scoreValue');
      if (scoreEl) scoreEl.textContent = scoreStr;
    }

    if (hudCache.combo !== s.combo) {
      hudCache.combo = s.combo;
      const comboBadge = document.getElementById('comboBadge');
      const comboCount = document.getElementById('comboCount');
      if (comboBadge && comboCount) {
        if (s.combo > 1) {
          comboBadge.classList.remove('hidden');
          comboCount.textContent = s.combo;
        } else {
          comboBadge.classList.add('hidden');
        }
      }
    }

    let bannerText;
    if (s.boss) {
      if (s.boss.phase === 3 && s.boss.shieldActive) {
        bannerText = '⚠ الطور 3: درع TVI نشط! اكسره بـ [△] سونار أو [L2] صدمة أو استهدف نافذة الجذر α';
      } else if (s.boss.phase === 3) {
        bannerText = '⚡ انكسر درع TVI مؤقتاً — أطلق طوربيدات المرافق [R2] نحو النواة!';
      } else if (s.boss.phase === 2) {
        bannerText = '⚠ الطور 2: حزم قفزة الانقطاع (lim⁻ ≠ lim⁺) — استعمل [◯] للتفادي!';
      } else {
        bannerText = '⚠ لوفياثان الانقطاع العظيم — دمره بطوربيدات المرافق [R2] وصدمة [L2]!';
      }
    } else {
      const sectorNames = [
        'منطقة الشفق البحري — اخترق أختام الضغط الأربعة عبر النهايات (1–6)',
        'منطقة الظلام الدامس — الاتصال في نقطة والتمديد والمركب (7–11)',
        'منطقة الهاوية — صورة المجال ومبرهنة القيم الوسيطية TVI (12–17)',
        'خندق الهدال — التقابل والدالة العكسية والجذور النونية (18–22)'
      ];
      bannerText = sectorNames[s.currentSectorIdx] || sectorNames[0];
    }

    if (hudCache.banner !== bannerText) {
      hudCache.banner = bannerText;
      const banner = document.getElementById('sectorBanner');
      if (banner) banner.textContent = bannerText;
    }

    if ((s.isVictory || s.isGameOver) && !endModalShown) {
      endModalShown = true;
      showEndModal(s);
    }
  }

  function showEndModal(s) {
    isPaused = true;
    const modal = document.getElementById('endModal');
    const title = document.getElementById('endTitle');
    const sub = document.getElementById('endSubtitle');

    if (s.isVictory) {
      title.innerHTML = 'تحرير <span>الهاوية وقاع الخندق!</span>';
      sub.textContent = 'تم إبادة لوفياثان الانقطاع العظيم وكسر أختام الضغط الأربعة بنجاح منهجي 100% في مقرر 2BAC PC!';
    } else {
      title.innerHTML = 'انهيار <span>هيكل الغواصة</span>';
      sub.textContent = 'تجاوز ضغط الماء قدرة تحمل الهيكل. تذكر دائماً: إزالة عدم التحديد قبل التعويض المباشر!';
    }

    const accuracy = s.totalAnswers > 0 ? Math.round((s.correctAnswers / s.totalAnswers) * 100) : 100;
    document.getElementById('endGates').textContent = `${s.gatesCleared} / 4`;
    document.getElementById('endScore').textContent = s.score.toLocaleString();
    document.getElementById('endAccuracy').textContent = `${accuracy}%`;
    document.getElementById('endBypasses').textContent = s.bypassesUsed;

    modal?.classList.remove('hidden');
  }

  // MAIN 60FPS LOOP (Polls Gamepad in all states so DualSense works inside every modal!)
  function loop() {
    window.AbyssInput.pollInput();
    if (!isPaused) {
      window.AbyssWorld.updateWorld();
      updateHUD();
    }
    window.AbyssRenderer.renderWorld();
    animId = requestAnimationFrame(loop);
  }

  return {
    initGame
  };
})();

window.addEventListener('DOMContentLoaded', () => {
  window.AbyssGame.initGame();
});
