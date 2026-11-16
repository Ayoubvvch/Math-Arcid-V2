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
  let isPaused = false;
  let isRunning = false;
  let animId = null;

  let activeGate = null;
  let activeQuestion = null;
  let isModalLocked = false;

  // BIDIRECTIONAL MATHEMATICAL ISOLATION (setBidiSafeMath)
  function setBidiSafeMath(el, text) {
    if (!el) return;
    el.textContent = '';
    const str = String(text || '');
    // Regex matching mathematical expressions, Greek symbols, brackets, exponents, square roots
    const mathRe = /(?:[+\-](?=[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\])|[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\])(?:[ +\-*/=<>≤≥≠∈∉⊂⊃∪∩∀∃→↔⇒⇔·×÷±≈'′∘^_:,.\\]*[A-Za-z0-9\u00C0-\u024F\]\[(){}|√ⁿʳˣᵖ⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻₀₁₂₃₄₅₆₇₈₉₊₋ₙₚΩΔαβπℚℝℕ∞∀∃∈∉⊂⊃∪∩→↔⇒⇔≤≥≠·×÷±≈'′∘^_\\])*/g;

    let lastIdx = 0;
    let match;
    while ((match = mathRe.exec(str)) !== null) {
      const sIdx = match.index;
      const eIdx = sIdx + match[0].length;
      if (sIdx > lastIdx) {
        el.appendChild(document.createTextNode(str.slice(lastIdx, sIdx)));
      }
      const bdi = document.createElement('bdi');
      bdi.className = 'math-ltr';
      bdi.dir = 'ltr';
      bdi.textContent = match[0];
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
  }

  function hookUIButtons() {
    // Sound Toggles
    const btnAudio = document.getElementById('btnAudioToggle');
    const btnAudioPause = document.getElementById('btnToggleSoundPause');
    const onToggleAudio = () => {
      const muted = window.AbyssAudio?.toggleMute?.();
      const txt = muted ? '🔇' : '🔊';
      if (btnAudio) btnAudio.textContent = txt;
      if (btnAudioPause) btnAudioPause.textContent = `الصوت: ${muted ? 'معطل' : 'مفعل'}`;
    };
    btnAudio?.addEventListener('click', onToggleAudio);
    btnAudioPause?.addEventListener('click', onToggleAudio);

    // Pause Toggle
    document.getElementById('btnPauseToggle')?.addEventListener('click', togglePause);
    document.getElementById('btnResumeGame')?.addEventListener('click', togglePause);

    // Help Toggle opens Intro modal
    document.getElementById('btnHelpToggle')?.addEventListener('click', () => {
      isPaused = true;
      document.getElementById('introModal')?.classList.remove('hidden');
    });

    // Filter Chips
    const onCycleFilter = () => {
      currentFilterIdx = (currentFilterIdx + 1) % FILTER_MODES.length;
      updateFilterUI();
      window.AbyssAudio?.playUiTick?.();
    };
    document.getElementById('filterChip')?.addEventListener('click', onCycleFilter);
    document.getElementById('btnCycleFilterPause')?.addEventListener('click', onCycleFilter);

    // Challenge Modal Buttons
    for (let i = 0; i < 4; i++) {
      const btn = document.getElementById(`seqOpt${i}`);
      btn?.addEventListener('click', () => selectOption(i));
    }
    document.getElementById('btnToggleHint')?.addEventListener('click', toggleHint);
    document.getElementById('btnOverdriveBypass')?.addEventListener('click', triggerBypass);

    // Restarts
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
    isRunning = true;
    loop();
  }
  window.startAbyssFromIntro = startGame;

  function togglePause() {
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
    document.getElementById('pauseModal')?.classList.add('hidden');
    document.getElementById('endModal')?.classList.add('hidden');
    document.getElementById('overrideModal')?.classList.add('hidden');
    window.AbyssWorld.initWorld();
    isPaused = false;
    isModalLocked = false;
    activeGate = null;
    activeQuestion = null;
    if (!isRunning) {
      isRunning = true;
      loop();
    }
  }

  // INTERACTION DISPATCHER (Triggered by ▢ or E)
  function triggerInteractOrOverride() {
    if (isPaused) return;

    // Check if near staggered enemy to execute
    const staggeredEnemy = window.AbyssWorld.findNearbyStaggeredEnemy();
    if (staggeredEnemy) {
      window.AbyssWorld.executeStaggeredEnemy(staggeredEnemy);
      return;
    }

    // Check if near an abyssal gate to open challenge
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

    // Pick a question matching gate sector or user filter
    let targetSector = gate.sectorId;
    const filter = FILTER_MODES[currentFilterIdx];
    if (filter && filter.sector) targetSector = filter.sector;

    const bank = window.LIMIT_QUESTION_BANK || [];
    let pool = bank.filter(q => q.sector === targetSector);
    if (!pool.length) pool = bank;

    activeQuestion = pool[Math.floor(Math.random() * pool.length)];

    // Populate Modal Elements
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

    // Interactive Graph Visualizer
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

    // Bypass button energy state
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

      setTimeout(() => {
        window.AbyssWorld.unlockGate(activeGate);
        closeOverrideModal();
      }, 700);
    } else {
      clickedBtn?.classList.add('opt-wrong');
      const correctBtn = document.getElementById(`seqOpt${activeQuestion.correctIndex}`);
      correctBtn?.classList.add('opt-correct');

      window.AbyssAudio?.playOverrideFail?.();
      // Hull pressure damage penalty for incorrect deduction
      wState.player.hp = Math.max(10, wState.player.hp - 20);

      setTimeout(() => {
        closeOverrideModal();
      }, 1400);
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

  // 60FPS UPDATE HUD
  function updateHUD() {
    const s = window.AbyssWorld.getState();
    const p = s.player;

    // HP & Energy Bars
    const hpFill = document.getElementById('hpFill');
    const hpVal = document.getElementById('hpValue');
    if (hpFill && hpVal) {
      const pct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
      hpFill.style.width = pct + '%';
      hpVal.textContent = `${Math.round(p.hp)}/${p.maxHp}`;
    }

    const energyFill = document.getElementById('energyFill');
    const energyVal = document.getElementById('energyValue');
    if (energyFill && energyVal) {
      const pct = Math.max(0, Math.min(100, (p.energy / p.maxEnergy) * 100));
      energyFill.style.width = pct + '%';
      energyVal.textContent = `${Math.round(p.energy)}%`;
    }

    // Depth & Stats
    const depthEl = document.getElementById('depthValue');
    if (depthEl) depthEl.textContent = `${Math.round(p.y * 4)} m`;

    const gatesEl = document.getElementById('gatesValue');
    if (gatesEl) gatesEl.textContent = `${s.gatesCleared} / 4`;

    const scoreEl = document.getElementById('scoreValue');
    if (scoreEl) scoreEl.textContent = s.score.toLocaleString();

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

    // Sector Banner
    const banner = document.getElementById('sectorBanner');
    if (banner) {
      const sectorNames = [
        'منطقة الشفق البحري — اخترق أختام الضغط الأربعة عبر النهايات (1–6)',
        'منطقة الظلام الدامس — الاتصال في نقطة والتمديد والمركب (7–11)',
        'منطقة الهاوية — صورة المجال ومبرهنة القيم الوسيطية TVI (12–17)',
        'خندق الهدال — التقابل والدالة العكسية والجذور النونية (18–22)'
      ];
      banner.textContent = sectorNames[s.currentSectorIdx] || sectorNames[0];
    }

    // Check Victory / Game Over
    if (s.isVictory || s.isGameOver) {
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
      sub.textContent = 'تم إبادة لوفياثان الانقطاع العظيم وكسر أختام الضغط الأربعة بنجاح منهجـي 100% في مقرر 2BAC PC!';
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

  // MAIN 60FPS LOOP
  function loop() {
    if (!isPaused) {
      window.AbyssInput.pollInput();
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

// Start system on page load
window.addEventListener('DOMContentLoaded', () => {
  window.AbyssGame.initGame();
});
