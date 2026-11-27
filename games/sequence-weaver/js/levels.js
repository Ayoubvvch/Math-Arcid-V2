/**
 * Sequence Weaver v2.1.0 — Emerald Astrolabe Curriculum Engine
 * Official Moroccan 2BAC PC Lesson 3: Suites Numériques (100% of Skills 41–52).
 * Zero Hors-programme (NO ε-N proofs, NO pre-Lesson-4 ln/exp composites).
 * Zero Color Spoilers: all un-classified orbs, capsules & portals use uniform styling.
 */

export const GAME_ID = 'sequence-weaver';

export const STAGES = [
  {
    id: 'induction-guardian',
    num: 1,
    shortTab: 'الترجع',
    tab: '1. حارس الترجع',
    title: 'حارس الترجع والمحدودية',
    mode: 'induction-catcher',
    skills: [41, 42, 51],
    targetHits: 10,
    waves: [
      {
        name: 'الموجة 1: المكبورة بالترجع',
        hitsNeeded: 5,
        boundType: 'upper',
        boundLabel: 'M',
        boundTarget: 4.0,
        boundStart: 2.8,
        domain: { min: 0, max: 6 },
        f: (x) => 0.5 * x + 2,
        formula: '$u_{n+1} = \\frac{1}{2}u_n + 2 \\quad (u_n \\le 4)$',
        goalText: 'اضبط السقف $M \\approx 4$، التقط البذور $u_0 \\le 4$ وصدّ $u_0 > 4$ بالدرع!',
        isSafe: (u0) => u0 <= 4.0,
        spawnSafe: () => 0.5 + Math.random() * 3.2,
        spawnRogue: () => 4.35 + Math.random() * 1.35
      },
      {
        name: 'الموجة 2: المصغورة بالترجع',
        hitsNeeded: 5,
        boundType: 'lower',
        boundLabel: 'm',
        boundTarget: 2.0,
        boundStart: 3.4,
        domain: { min: 0, max: 6 },
        f: (x) => Math.sqrt(Math.max(0, x + 2)),
        formula: '$u_{n+1} = \\sqrt{u_n + 2} \\quad (u_n \\ge 2)$',
        goalText: 'اضبط المصغّر $m \\approx 2$، التقط $u_0 \\ge 2$ وصدّ $u_0 < 2$ بالدرع!',
        isSafe: (u0) => u0 >= 2.0,
        spawnSafe: () => 2.3 + Math.random() * 3.3,
        spawnRogue: () => 0.25 + Math.random() * 1.45
      }
    ],
    deckHint: 'الحركة: ◀ ▶ أو العصا اليسرى • السقف/المصغّر: W · S أو L2 · R2 • الدرع: Space أو ▢',
    controls: [
      { action: 'shield', label: 'درع الصدّ', key: '▢ · Space', cls: 'rose' },
      { action: 'ceilDown', label: 'خفض الحدّ', key: 'L2 · S', cls: 'amber' },
      { action: 'ceilUp', label: 'رفع الحدّ', key: 'R2 · W', cls: 'emerald' }
    ]
  },
  {
    id: 'mct-polarity',
    num: 2,
    shortTab: 'الرتابة MCT',
    tab: '2. قنّاص الرتابة',
    title: 'قنّاص الرتابة والتقارب الرتيب',
    mode: 'monotone-shooter',
    skills: [43, 48, 51],
    targetHits: 10,
    waves: [
      {
        name: 'الموجة 1: عتبتا α=1 و β=3',
        hitsNeeded: 6,
        domain: { min: 0, max: 4.2 },
        alpha: 1,
        beta: 3,
        f: (x) => (x * x + 3) / 4,
        formula: '$u_{n+1} = \\frac{u_n^2 + 3}{4} \\quad (f(x)-x)$',
        goalText: 'اقرأ موضع $(C_f)$ بالنسبة لـ $y=x$: تزايدية متقاربة • تناقصية متقاربة • متباعدة!',
        classify: (x) => (x < 1 ? 'inc' : (x < 3 ? 'dec' : 'div')),
        sampleX: (kind) => {
          if (kind === 'inc') return 0.28 + Math.random() * 0.52;
          if (kind === 'dec') return 1.32 + Math.random() * 1.35;
          return 3.24 + Math.random() * 0.72;
        }
      },
      {
        name: 'الموجة 2: عتبتا α=1 و β=2',
        hitsNeeded: 4,
        domain: { min: 0, max: 3.4 },
        alpha: 1,
        beta: 2,
        f: (x) => (x * x + 2) / 3,
        formula: '$u_{n+1} = \\frac{u_n^2 + 2}{3} \\quad (\\beta = 2)$',
        goalText: 'تغيّر الحدّ الفاصل إلى $\\beta=2$! انتبه لموقع $u_0$ فوق أو تحت المنصّف $y=x$!',
        classify: (x) => (x < 1 ? 'inc' : (x < 2 ? 'dec' : 'div')),
        sampleX: (kind) => {
          if (kind === 'inc') return 0.24 + Math.random() * 0.54;
          if (kind === 'dec') return 1.2 + Math.random() * 0.58;
          return 2.24 + Math.random() * 0.92;
        }
      }
    ],
    deckHint: 'التوجيه: WASD أو العصا • تزايدية: ▢ · 1 • تناقصية: △ · 2 • متباعدة: ◯ · 3 • اندفاع: ✕ · Space',
    controls: [
      { action: 'beamInc', label: 'تزايدية متقاربة', key: '▢ · 1', cls: 'cyan' },
      { action: 'beamDec', label: 'تناقصية متقاربة', key: '△ · 2', cls: 'amber' },
      { action: 'beamDiv', label: 'متباعدة +∞', key: '◯ · 3', cls: 'rose' },
      { action: 'dash', label: 'اندفاع', key: '✕ · Space', cls: 'emerald' }
    ]
  },
  {
    id: 'geo-race',
    num: 3,
    shortTab: 'سباق القوى',
    tab: '3. الفرز وسباق القوى',
    title: 'فرز المتتاليات وسباق «الكمّ مقابل القوة»',
    mode: 'rhythm-race',
    skills: [44, 45, 47],
    targetHits: 12,
    waves: [
      {
        name: 'الموجة 1: بوابة فرز النهايات والمجاميع',
        hitsNeeded: 7,
        subMode: 'sorter',
        formula: '$u_n = u_0 + nr \\;\\;\\&\\;\\; v_n = v_0 q^n \\;\\;\\&\\;\\; S_n$',
        goalText: 'وجّه المحوّل [◀ ▶] لفرز كل متتالية نحو نهايتها الصحيحة واضرب [✕] لشحن قنبلة $S_n$!',
        catalog: [
          { label: '(0.6)^n', targetLane: 0, kind: 'geo', explain: '|q| = 0.6 < 1 ⇒ → 0' },
          { label: '(-0.5)^n', targetLane: 0, kind: 'geo', explain: '|q| = 0.5 < 1 ⇒ → 0' },
          { label: '\\frac{1}{n^2}', targetLane: 0, kind: 'ref', explain: '1/n² → 0' },
          { label: '\\frac{1}{\\sqrt{n}}', targetLane: 0, kind: 'ref', explain: '1/√n → 0' },
          { label: '3\\cdot(0.4)^n', targetLane: 0, kind: 'geo', explain: '|q| < 1 ⇒ → 0' },
          { label: '4\\cdot(1)^n', targetLane: 1, kind: 'geo', explain: 'q = 1 ⇒ ثابتة → 4' },
          { label: '2 + (0.5)^n', targetLane: 1, kind: 'geo', explain: '2 + 0 = 2 ≠ 0' },
          { label: '5 + 0\\cdot n', targetLane: 1, kind: 'arith', explain: 'حسابية r = 0 ⇒ → 5' },
          { label: '3 - \\frac{1}{n}', targetLane: 1, kind: 'ref', explain: '3 - 0 = 3 ≠ 0' },
          { label: '(1.4)^n', targetLane: 2, kind: 'geo', explain: 'q = 1.4 > 1 ⇒ +∞' },
          { label: '(-1.2)^n', targetLane: 2, kind: 'geo', explain: 'q ≤ -1 ⇒ متباعدة' },
          { label: 'n^2', targetLane: 2, kind: 'ref', explain: 'n² → +∞' },
          { label: '5 + 3n', targetLane: 2, kind: 'arith', explain: 'حسابية r = 3 > 0 ⇒ +∞' },
          { label: '10 - 2n', targetLane: 2, kind: 'arith', explain: 'حسابية r = -2 < 0 ⇒ -∞' }
        ]
      },
      {
        name: 'الموجة 2: سباق «الكمّ مقابل القوة» (حسابية ضد هندسية)',
        hitsNeeded: 5,
        subMode: 'function-race',
        formula: '$u_n = u_0 + nr \\;\\text{ vs }\\; v_n = v_0 q^n$',
        goalText: 'اختر القوة القادرة على اختراق برج المقاومة HP عند الرتبة $n$ [▢ حسابية • △ هندسية] ثم أطلق [✕]!',
        duels: [
          {
            title: 'جولة 1: تفوّق الكمّ المبكّر (n = 2)',
            rankN: 2,
            hp: 35,
            isSum: false,
            arithExpr: 'u_n = 30 + 6n',
            geoExpr: 'v_n = 2 \\cdot 2^n',
            arithVal: (n) => 30 + 6 * n,
            geoVal: (n) => 2 * Math.pow(2, n),
            winner: 'arith',
            verdict: 'عند n=2: u₂ = 42 > 35 بينما v₂ = 8 فقط!'
          },
          {
            title: 'جولة 2: لحظة الانقلاب الأسي! (n = 6)',
            rankN: 6,
            hp: 100,
            isSum: false,
            arithExpr: 'u_n = 30 + 6n',
            geoExpr: 'v_n = 2 \\cdot 2^n',
            arithVal: (n) => 30 + 6 * n,
            geoVal: (n) => 2 * Math.pow(2, n),
            winner: 'geo',
            verdict: 'الانقلاب عند n=5! وفي n=6: v₆ = 128 يحطم البرج أمام u₆ = 66!'
          },
          {
            title: 'جولة 3: صدام المتزايدتين (n = 8)',
            rankN: 8,
            hp: 140,
            isSum: false,
            arithExpr: 'u_n = 5 + 10n',
            geoExpr: 'v_n = 1.5 \\cdot (1.8)^n',
            arithVal: (n) => 5 + 10 * n,
            geoVal: (n) => 1.5 * Math.pow(1.8, n),
            winner: 'geo',
            verdict: 'عند n=8: v₈ ≈ 165.3 تتجاوز u₈ = 85 وتفجر البرج!'
          },
          {
            title: 'جولة 4: سباق المجموعين S₅ ضد T₅ (n = 5)',
            rankN: 5,
            hp: 110,
            isSum: true,
            arithExpr: 'S_n = \\frac{(n+1)(4+u_n)}{2}',
            geoExpr: 'T_n = 2\\frac{1-2^{n+1}}{1-2}',
            arithVal: (n) => ((n + 1) * (4 + (4 + 4 * n))) / 2,
            geoVal: (n) => 2 * (Math.pow(2, n + 1) - 1),
            winner: 'geo',
            verdict: 'S₅ = 84 بينما المجموع الهندسي T₅ = 126 > 110!'
          },
          {
            title: 'جولة 5: فخ الأساس |q| < 1! (n = 7)',
            rankN: 7,
            hp: 30,
            isSum: false,
            arithExpr: 'u_n = 10 + 4n',
            geoExpr: 'v_n = 200 \\cdot (0.6)^n',
            arithVal: (n) => 10 + 4 * n,
            geoVal: (n) => 200 * Math.pow(0.6, n),
            winner: 'arith',
            verdict: 'فخ! لأن 0<0.6<1 تتلاشى v₇ ≈ 5.6 وتنتصر الحسابية u₇ = 38!'
          }
        ]
      }
    ],
    deckHint: 'الموجة 1: ◀ ▶ لتوجيه المحوّل • ✕ للفرز السريع • ◯ لقنبلة Sₙ | الموجة 2: ▢ حسابية • △ هندسية • ✕ إطلاق',
    controls: [
      { action: 'laneLeft', label: 'يسار / حسابية', key: '◀ · ▢', cls: 'emerald' },
      { action: 'pulseHit', label: 'فرز / إطلاق', key: '✕ · Space', cls: 'cyan' },
      { action: 'laneRight', label: 'يمين / هندسية', key: '▶ · △', cls: 'amber' },
      { action: 'sumNova', label: 'قنبلة Sₙ / تسريع', key: '◯ · E', cls: 'rose' }
    ]
  },
  {
    id: 'fixed-point-boss',
    num: 4,
    shortTab: 'المساعدة',
    tab: '4. المتتالية المساعدة',
    title: 'عدسة النقط الصامدة والمتتالية المساعدة',
    mode: 'homographic-boss',
    skills: [46, 51],
    targetHits: 7,
    waves: [
      {
        name: 'الموجة 1: التآلفية vₙ = uₙ − α',
        hitsNeeded: 2,
        domain: { min: 0.4, max: 4.8 },
        f: (x) => x / 3 + 2,
        formula: '$u_{n+1} = \\frac{1}{3}u_n + 2 \\implies v_n = u_n - \\alpha$',
        goalText: 'اقفل النقطة الصامدة $\\alpha$ بـ [▢]، ثم فعّل عدسة التآلفية $v_n=u_n-\\alpha$ بـ [△]!',
        fixedTargets: [{ x: 3, y: 3, label: 'α = 3' }],
        candidates: [1, 2, 3, 4],
        auxAction: 'auxGeo',
        auxFormula: 'v_n = u_n - 3 (هندسية q = 1/3 ⇒ u_n → 3)',
        bulletSpeed: 1.45,
        spawnRate: 1.05
      },
      {
        name: 'الموجة 2: المتخاطة بنقطتين صامدتين',
        hitsNeeded: 3,
        domain: { min: 0.4, max: 4.6 },
        f: (x) => (4 * x - 3) / Math.max(0.25, x),
        formula: '$u_{n+1} = \\frac{4u_n - 3}{u_n} \\implies v_n = \\frac{u_n - \\beta}{u_n - \\alpha}$',
        goalText: 'اقفل تقاطعي $(C_f)$ مع $y=x$ ($\\alpha, \\beta$) بـ [▢] ثم أطلق العدسة الهندسية [△]!',
        fixedTargets: [
          { x: 1, y: 1, label: 'α = 1' },
          { x: 3, y: 3, label: 'β = 3' }
        ],
        candidates: [1, 2, 3, 4],
        auxAction: 'auxGeo',
        auxFormula: 'v_n = (u_n-3)/(u_n-1) (هندسية q = 1/3 ⇒ u_n → 3)',
        bulletSpeed: 1.65,
        spawnRate: 0.92
      },
      {
        name: 'الموجة 3: المتخاطة بنقطة صامدة وحيدة!',
        hitsNeeded: 2,
        domain: { min: 0.6, max: 4.6 },
        f: (x) => (4 * x - 4) / Math.max(0.3, x),
        formula: '$u_{n+1} = \\frac{4u_n - 4}{u_n} \\implies v_n = \\frac{1}{u_n - \\alpha}$',
        goalText: 'نقطة تماس وحيدة $(x-2)^2=0$! اقفل $\\alpha=2$ [▢] ثم فعّل العدسة الحسابية [◯]!',
        fixedTargets: [
          { x: 2, y: 2, label: 'α = 2' }
        ],
        candidates: [1, 2, 3, 4],
        auxAction: 'auxArith',
        auxFormula: 'v_n = 1/(u_n-2) (حسابية r = 1/2 ⇒ u_n → 2)',
        bulletSpeed: 1.85,
        spawnRate: 0.82
      }
    ],
    deckHint: 'التصويب: WASD أو العصا • إقفال نقطة: ▢ · 1 • مساعدة هندسية: △ · 2 • مساعدة حسابية: ◯ · 3 • اندفاع: ✕ · Space',
    controls: [
      { action: 'lockPoint', label: 'إقفال f(L)=L', key: '▢ · 1', cls: 'amber' },
      { action: 'auxGeo', label: 'مساعدة هندسية', key: '△ · 2', cls: 'emerald' },
      { action: 'auxArith', label: 'مساعدة حسابية', key: '◯ · 3', cls: 'rose' },
      { action: 'dash', label: 'اندفاع', key: '✕ · Space', cls: 'cyan' }
    ]
  },
  {
    id: 'gendarme-tunnel',
    num: 5,
    shortTab: 'الدركيين وهيرون',
    tab: '5. الدركيين وهيرون',
    title: 'نفق الدركيين والمركّب وتقريب هيرون',
    mode: 'squeeze-tunnel',
    skills: [49, 50, 52],
    targetHits: 12,
    waves: [
      {
        name: 'الموجة 1: نفق الدركيين ومقلاع المقارنة',
        hitsNeeded: 5,
        subMode: 'squeeze',
        yMin: 0,
        yMax: 5,
        formula: '$v_n \\le u_n \\le w_n \\;\\&\\; |u_n - L| \\le \\frac{A}{n+1} \\;\\&\\; u_n \\ge \\alpha\\sqrt{n}$',
        goalText: 'حافظ على الشرارة عند $L$، اضبط فكّي الدركيين وصدّ شهب $+\\infty$ بالدرع!'
      },
      {
        name: 'الموجة 2: مركّب دالة متصلة vₙ = g(uₙ)',
        hitsNeeded: 4,
        subMode: 'composite',
        yMin: 0,
        yMax: 5,
        formula: '$\\lim u_n = a \\text{ و } g \\text{ متصلة في } a \\implies \\lim g(u_n) = g(a)$',
        goalText: 'احسب $g(a)$ ذهنياً ثم وجّه المركبة [▲▼] نحو البوابة المطابقة على المحور العمودي!',
        portals: [
          { expr: 'u_n → 4 ,  v_n = \\sqrt{u_n}', answer: 2, decoys: [1, 4], explain: '√4 = 2 ✓' },
          { expr: 'u_n → 9 ,  v_n = \\sqrt{u_n}', answer: 3, decoys: [1, 4], explain: '√9 = 3 ✓' },
          { expr: 'u_n → 2 ,  v_n = \\frac{u_n^2 + 4}{2}', answer: 4, decoys: [2, 3], explain: '(4+4)/2 = 4 ✓' },
          { expr: 'u_n → 1 ,  v_n = \\frac{3u_n + 1}{u_n + 3}', answer: 1, decoys: [2, 3], explain: '4/4 = 1 ✓' },
          { expr: 'u_n → 0 ,  v_n = 3\\cos(u_n)', answer: 3, decoys: [1, 2], explain: '3·cos(0) = 3 ✓' }
        ]
      },
      {
        name: 'الموجة 3: تقريب هيرون التربيعي لـ √2',
        hitsNeeded: 3,
        subMode: 'heron',
        yMin: 1.0,
        yMax: 2.2,
        formula: '$u_{n+1} = \\frac{1}{2}\\left(u_n + \\frac{2}{u_n}\\right),\\; u_0 = 2 \\implies \\lim u_n = \\sqrt{2}$',
        goalText: 'حافظ على الشرارة فوق $\\sqrt{2} \\approx 1.414$، ضيّق الفكّين [L2] واقفل حلقات هيرون بـ [▢ / ✕]!',
        steps: [
          { n: 1, val: 1.5, err: 0.086, reqGap: 0.24, label: 'u_1 = 1.500' },
          { n: 2, val: 1.4167, err: 0.0025, reqGap: 0.16, label: 'u_2 = 1.417' },
          { n: 3, val: 1.4142, err: 0.000002, reqGap: 0.12, label: 'u_3 ≈ √2' }
        ]
      }
    ],
    deckHint: 'الارتفاع: ▲ ▼ أو العصا Y • الفكّان: L2 · R2 أو ◀ ▶ • درع المقارنة / قفل هيرون: ▢ · Space',
    controls: [
      { action: 'pinchIn', label: 'تضييق الحصر', key: 'L2 · ◀', cls: 'amber' },
      { action: 'pinchOut', label: 'توسيع الحصر', key: 'R2 · ▶', cls: 'emerald' },
      { action: 'shield', label: 'درع / قفل هيرون', key: '▢ · Space', cls: 'cyan' }
    ]
  }
];
