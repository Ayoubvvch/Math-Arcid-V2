/**
 * Continuity Rider — Official Moroccan 2BAC PC Lesson 1 (Skills 1–22)
 * Zero Hors-programme: NO arcsin/arccos/arctan, NO study of nth-root(u(x)) for n>=3, NO Rolle/TAF.
 * All UI formulas strictly formatted in LaTeX ($...$) for universal KaTeX rendering.
 */

export const GAME_ID = 'continuity-rider';

export const SECTORS = [
  {
    id: 'sector-repair',
    tab: '1. ثقوب الاتصال',
    skills: 'المهارات 1، 4، 5، 13–15',
    tracks: [
      {
        id: '1-1',
        topic: '05_15_factor_extension',
        mode: 'hole-repair',
        title: 'جسر التعميل وإزالة $\\frac{0}{0}$',
        formula: '$f(x) = \\frac{x^2 - 4}{x - 2} \\quad (D_f = \\mathbb{R} \\setminus \\{2\\})$',
        mission: 'اختر أداة التعميل لإزالة الشكل غير المحدد $\\frac{0}{0}$ ثم اسحب سدادة التمديد بالاتصال عند $x = 2$ وأطلق المتزلّج!',
        proof: 'لدينا $f(x) = \\frac{(x - 2)(x + 2)}{x - 2} = x + 2$ لكل $x \\neq 2$. إذن $\\lim_{x \\to 2} f(x) = 4$؛ بتمديد $f(2) = 4$ تصبح متصلة في $2$.',
        view: { xMin: -1, xMax: 5.2, yMin: -0.5, yMax: 7.5 },
        xStart: -0.6,
        xEnd: 4.8,
        holeX: 2,
        targetL: 4,
        f: (x) => (Math.abs(x - 2) < 1e-4 ? NaN : (x * x - 4) / (x - 2)),
        ops: [
          { id: 'factor', label: 'التعميل $(x-2)(x+2)$', correct: true },
          { id: 'conj', label: 'المرافق المربع', correct: false },
          { id: 'deg', label: 'الحد ذو أعلى درجة', correct: false }
        ],
        slider: { key: 'plugY', label: 'ارتفاع السدادة $L$', min: 0.5, max: 6.5, step: 0.5, init: 1.5 }
      },
      {
        id: '1-2',
        topic: '13_14_onesided_weld',
        mode: 'piecewise-weld',
        title: 'لحام الاتصال يمين ويسار $x = 1$',
        formula: '$f(x) = \\begin{cases} x^2 + 1 & x \\le 1 \\\\ 2x + k & x > 1 \\end{cases}$',
        mission: 'اسحب الفرع الأيمن لتوحيد النهايتين $\\lim_{x\\to 1^-} f(x) = \\lim_{x\\to 1^+} f(x) = f(1)$ ثم أطلق المتزلّج!',
        proof: '$\\lim_{x\\to 1^-} f(x) = f(1) = 1^2 + 1 = 2$ و $\\lim_{x\\to 1^+} f(x) = 2 + k$. الاتصال في $1$ يكافئ $2 + k = 2 \\iff k = 0$.',
        view: { xMin: -1.5, xMax: 4.0, yMin: -0.5, yMax: 8.5 },
        xStart: -1.1,
        xEnd: 3.4,
        splitX: 1,
        targetK: 0,
        fLeft: (x) => x * x + 1,
        fRight: (x, k) => 2 * x + k,
        slider: { key: 'k', label: 'الإزاحة $k$', min: -2.5, max: 3.0, step: 0.5, init: 2.0 }
      }
    ]
  },
  {
    id: 'sector-surgery',
    tab: '2. المرافق والمثلثية',
    skills: 'المهارات 7–11',
    tracks: [
      {
        id: '2-1',
        topic: '07_square_conjugate',
        mode: 'hole-repair',
        title: 'جسر المرافق المربع عند $x = 1$',
        formula: '$f(x) = \\frac{4(\\sqrt{x + 3} - 2)}{x - 1}$',
        mission: 'فعّل تقنية المرافق المربع لإزالة $\\frac{0}{0}$، ضع السدادة عند النهاية $L$، ثم أطلق المتزلّج!',
        proof: 'بالضرب في المرافق $\\sqrt{x+3} + 2$ نجد $f(x) = \\frac{4(x - 1)}{(x - 1)(\\sqrt{x + 3} + 2)} = \\frac{4}{\\sqrt{x + 3} + 2} \\xrightarrow{x\\to 1} \\frac{4}{4} = 1$.',
        view: { xMin: -2.5, xMax: 5.5, yMin: -0.3, yMax: 2.8 },
        xStart: -2.0,
        xEnd: 5.0,
        holeX: 1,
        targetL: 1,
        f: (x) => (x < -3 || Math.abs(x - 1) < 1e-4 ? NaN : (4 * (Math.sqrt(x + 3) - 2)) / (x - 1)),
        ops: [
          { id: 'conj2', label: 'المرافق $\\sqrt{x+3}+2$', correct: true },
          { id: 'trig', label: 'نهاية $\\frac{\\sin x}{x}$', correct: false },
          { id: 'deg', label: 'أعلى درجة', correct: false }
        ],
        slider: { key: 'plugY', label: 'قيمة النهاية $L$', min: 0, max: 2.5, step: 0.25, init: 2.0 }
      },
      {
        id: '2-2',
        topic: '09_10_11_trig_composite',
        mode: 'hole-repair',
        title: 'موجة النهاية المثلثية والمركب',
        formula: '$f(x) = \\frac{\\sin(3x)}{x} \\quad (x \\to 0)$',
        mission: 'استعمل تغيير المتغير $t = 3x$ مع $\\lim_{t\\to 0}\\frac{\\sin t}{t} = 1$ لإغلاق الفجوة عند قمة الموجة $x = 0$!',
        proof: 'نكتب $\\frac{\\sin(3x)}{x} = 3 \\cdot \\frac{\\sin(3x)}{3x}$. بوضع $t = 3x \\to 0$ وبما أن $\\lim_{t\\to 0}\\frac{\\sin t}{t} = 1$ فإن النهاية تساوي $3$ (ومؤطرة بـ $\\pm\\frac{1}{|x|}$).',
        view: { xMin: -3.2, xMax: 3.2, yMin: -1.4, yMax: 4.2 },
        xStart: -2.8,
        xEnd: 2.8,
        holeX: 0,
        targetL: 3,
        f: (x) => (Math.abs(x) < 1e-4 ? NaN : Math.sin(3 * x) / x),
        ops: [
          { id: 'trig', label: 'مركب $3 \\cdot \\frac{\\sin(3x)}{3x}$', correct: true },
          { id: 'conj3', label: 'المرافق التكعيبي', correct: false },
          { id: 'factor', label: 'التعميل بـ $x$', correct: false }
        ],
        slider: { key: 'plugY', label: 'ارتفاع القمة $L$', min: 0, max: 4.0, step: 0.5, init: 1.0 }
      },
      {
        id: '2-3',
        topic: '08_cubic_conjugate',
        mode: 'hole-repair',
        title: 'جسر المرافق التكعيبي ($\\sqrt[3]{x}$)',
        formula: '$f(x) = \\frac{12(\\sqrt[3]{x} - 2)}{x - 8} \\quad (x \\to 8)$',
        mission: 'طبّق المتطابقة $u^3 - v^3 = (u-v)(u^2+uv+v^2)$ لإزالة $\\frac{0}{0}$ عند $x = 8$ وعبور الجسر!',
        proof: 'بضرب البسط والمقام في $(\\sqrt[3]{x})^2 + 2\\sqrt[3]{x} + 4$ نجد $f(x) = \\frac{12}{(\\sqrt[3]{x})^2 + 2\\sqrt[3]{x} + 4} \\xrightarrow{x\\to 8} \\frac{12}{4 + 4 + 4} = 1$.',
        view: { xMin: 1.5, xMax: 12.5, yMin: -0.2, yMax: 2.6 },
        xStart: 2.0,
        xEnd: 11.8,
        holeX: 8,
        targetL: 1,
        f: (x) => (Math.abs(x - 8) < 1e-4 ? NaN : (12 * (Math.cbrt(x) - 2)) / (x - 8)),
        ops: [
          { id: 'conj3', label: 'المرافق التكعيبي $u^2+uv+v^2$', correct: true },
          { id: 'conj2', label: 'المرافق المربع $u+v$', correct: false },
          { id: 'deg', label: 'الحد ذو أعلى درجة', correct: false }
        ],
        slider: { key: 'plugY', label: 'قيمة النهاية $L$', min: 0.25, max: 2.25, step: 0.25, init: 1.75 }
      }
    ]
  },
  {
    id: 'sector-floor',
    tab: '3. الجزء الصحيح E(x)',
    skills: 'المهارات 1 و 16',
    tracks: [
      {
        id: '3-1',
        topic: '16_floor_discontinuity',
        mode: 'floor-jump',
        title: 'مدرّج الجزء الصحيح $f(x) = E(x)$',
        formula: '$f(x) = E(x) = \\lfloor x \\rfloor$ (غير متصلة في $\\mathbb{Z}$)',
        mission: 'أطلق المتزلّج ثم اضغط (اقفز / Space / نقر) قبل كل قفزة عدم اتصال عند الأعداد الصحيحة $x \\in \\{1, 2, 3, 4\\}$!',
        proof: 'لكل $n \\in \\mathbb{Z}$ لدينا $\\lim_{x\\to n^-} E(x) = n - 1$ بينما $\\lim_{x\\to n^+} E(x) = E(n) = n$. إذن $E$ غير متصلة في كل $\\mathbb{Z}$ ومتصلة على كل $[n, n+1[$.',
        view: { xMin: -0.2, xMax: 5.0, yMin: -0.4, yMax: 5.2 },
        xStart: 0.15,
        xEnd: 4.75,
        jumps: [1, 2, 3, 4]
      },
      {
        id: '3-2',
        topic: '01_16_domain_interval',
        mode: 'domain-carve',
        title: 'نحت المجال المتصل داخل $D_f$',
        formula: '$f(x) = \\sqrt{x - 1} + \\frac{1.5}{4 - x}$',
        mission: 'اسحب بوابتي البداية $a$ والنهاية $b$ لتحديد أكبر مجال متصل آمن داخل $[1, 4[$ دون السقوط في $x < 1$ أو القطب $x = 4$!',
        proof: 'شرط الجذر $x - 1 \\ge 0 \\iff x \\ge 1$ وشرط المقام $4 - x \\neq 0 \\iff x \\neq 4$. إذن $D_f = [1, 4[ \\cup ]4, +\\infty[$ والدالة متصلة على $[1, 4[$.',
        view: { xMin: -0.8, xMax: 5.6, yMin: -2.0, yMax: 6.5 },
        f: (x) => (x < 1 || Math.abs(x - 4) < 0.08 ? NaN : Math.sqrt(x - 1) + 1.5 / (4 - x)),
        validMin: 1,
        poleX: 4,
        sliders: [
          { key: 'domA', label: 'البداية $a$', min: -0.5, max: 3.5, step: 0.25, init: 0.0 },
          { key: 'domB', label: 'النهاية $b$', min: 1.5, max: 5.25, step: 0.25, init: 4.75 }
        ]
      }
    ]
  },
  {
    id: 'sector-asymptote',
    tab: '4. المقاربات',
    skills: 'المهارات 2، 3، 6، 12',
    tracks: [
      {
        id: '4-1',
        topic: '06_12_oblique_asymptote',
        mode: 'asymptote-oblique',
        title: 'سكة المقارب المائل عند $+\\infty$',
        formula: '$f(x) = \\frac{x^2 + x + 2}{x} = x + 1 + \\frac{2}{x} \\quad (x > 0)$',
        mission: 'اضبط ميل $a$ وأرتوب $b$ لسكة الليزر $(\\Delta): y = ax + b$ حتى تتطابق مع المنحنى عند $+\\infty$ وأطلق المتزلّج!',
        proof: '$\\lim_{x\\to +\\infty} [f(x) - (x + 1)] = \\lim_{x\\to +\\infty} \\frac{2}{x} = 0$. إذن المستقيم $(\\Delta): y = x + 1$ مقارب مائل لـ $(\\mathcal{C}_f)$ بجوار $+\\infty$.',
        view: { xMin: 0, xMax: 8.5, yMin: 0, yMax: 10.5 },
        xStart: 0.55,
        xEnd: 8.0,
        targetA: 1,
        targetB: 1,
        f: (x) => (x <= 0.05 ? NaN : x + 1 + 2 / x),
        sliders: [
          { key: 'slopeA', label: 'الميل $a$', min: 0, max: 2.5, step: 0.25, init: 0.5 },
          { key: 'intB', label: 'الأرتوب $b$', min: -1, max: 3.5, step: 0.5, init: 2.5 }
        ]
      },
      {
        id: '4-2',
        topic: '02_03_12_vh_asymptote',
        mode: 'asymptote-vh',
        title: 'بوابة القطب العمودي وإشارة $0^\\pm$',
        formula: '$f(x) = \\frac{2x + 1}{x - 2}$',
        mission: 'ثبّت المقارب العمودي $x = a$ والأفقي $y = L$ وحدد قطبية اللانهاية على يسار ويمين $2$ ليعبر المتزلّج!',
        proof: 'الحد ذو أعلى درجة يعطي $\\lim_{x\\to\\pm\\infty} f(x) = 2$ (مقارب أفقي $y=2$). وعند $2$: البسط $\\to 5 > 0$ والمقام $0^-$ يساراً ($-\\infty$) و$0^+$ يميناً ($+\\infty$).',
        view: { xMin: -3.5, xMax: 7.5, yMin: -6, yMax: 10 },
        targetVA: 2,
        targetHA: 2,
        f: (x) => (Math.abs(x - 2) < 0.08 ? NaN : (2 * x + 1) / (x - 2)),
        sliders: [
          { key: 'va', label: 'العمودي $x = a$', min: -1, max: 5, step: 0.5, init: 0.5 },
          { key: 'ha', label: 'الأفقي $y = L$', min: -1, max: 5, step: 0.5, init: 4.0 }
        ],
        ops: [
          { id: 'neg_pos', label: '$2^- \\to -\\infty \\;\\vert\\; 2^+ \\to +\\infty$', correct: true },
          { id: 'pos_neg', label: '$2^- \\to +\\infty \\;\\vert\\; 2^+ \\to -\\infty$', correct: false },
          { id: 'both_pos', label: '$2^{\\pm} \\to +\\infty$', correct: false }
        ]
      }
    ]
  },
  {
    id: 'sector-tvi',
    tab: '5. TVI والتفرع الثنائي',
    skills: 'المهارات 17–19 و 22',
    tracks: [
      {
        id: '5-1',
        topic: '18_19_22_tvi_dichotomie',
        mode: 'bisection-slicer',
        title: 'مِقص التفرع الثنائي (Dichotomie)',
        formula: '$f(x) = x^3 + x - 3 = 0$ على $[1, 2]$',
        mission: 'شاهد إشارتي $f(a)$ و$f(c)$ و$f(b)$، ثم اشطر المجال 4 مرات محتفظاً بالنصف الذي يحقق $f(\\text{يسار}) \\cdot f(\\text{يمين}) < 0$!',
        proof: '$f$ متصلة وتزايدية قطعاً على $[1, 2]$ مع $f(1) = -1 < 0$ و $f(2) = 7 > 0$. حسب TVI يوجد حل وحيد $\\alpha \\approx 1.2134$ تحصره 4 شطرات بسعة $\\frac{1}{16} = 0.0625$.',
        f: (x) => x * x * x + x - 3,
        initA: 1.0,
        initB: 2.0,
        targetCuts: 4,
        trueRoot: 1.21341166
      },
      {
        id: '5-2',
        topic: '17_interval_image_flip',
        mode: 'image-projector',
        title: 'إسقاط صورة مجال بدالة تناقصية',
        formula: '$f(x) = \\frac{6}{x + 1}$ على $I = [1, 5]$',
        mission: 'اسحب بوابتي محور الأراتيب $[m, M]$ لحصر الصورة $f([1, 5])$ مع مراعاة قلب الترتيب لأن $f$ تناقصية قطعاً!',
        proof: '$f$ متصلة وتناقصية قطعاً على $[1, 5]$؛ إذن $f([1, 5]) = [f(5), f(1)] = \\left[\\frac{6}{6}, \\frac{6}{2}\\right] = [1, 3]$.',
        view: { xMin: -0.4, xMax: 6.2, yMin: -0.4, yMax: 5.2 },
        domA: 1,
        domB: 5,
        targetMin: 1,
        targetMax: 3,
        f: (x) => (x <= -0.9 ? NaN : 6 / (x + 1)),
        sliders: [
          { key: 'imgMin', label: 'الحد الأدنى $m$', min: 0, max: 4.5, step: 0.5, init: 0.0 },
          { key: 'imgMax', label: 'الحد الأقصى $M$', min: 0.5, max: 5.0, step: 0.5, init: 4.5 }
        ],
        ops: [
          { id: 'flip', label: 'تناقصية: $[f(5), f(1)]$', correct: true },
          { id: 'keep', label: 'تزايدية: $[f(1), f(5)]$', correct: false }
        ]
      }
    ]
  },
  {
    id: 'sector-inverse',
    tab: '6. العكسية والجذر النوني',
    skills: 'المهارات 20–21',
    tracks: [
      {
        id: '6-1',
        topic: '20_inverse_mirror',
        mode: 'inverse-mirror',
        title: 'مرآة الدالة العكسية $f^{-1}$ حول $y = x$',
        formula: '$f(x) = (x - 1)^2 + 1 \\implies f^{-1}(x) = 1 + \\sqrt{x - 1}$',
        mission: 'قصّ المنحنى إلى المجال التقابلي التزايدي $I = [1, 3]$، ثم اعكسه حول $y = x$ ليمر المتزلّج على $\\mathcal{C}_{f^{-1}}$ عبر $(5, 3)$!',
        proof: 'على $I = [1, 3]$ الدالة $f$ متصلة وتزايدية قطعاً فتقبل دالة عكسية $f^{-1}$ معرفة على $J = f(I) = [1, 5]$ ومنحناها متماثل مع $\\mathcal{C}_f$ بالنسبة للمنصف $y = x$، مع $f(3)=5 \\iff f^{-1}(5)=3$.',
        view: { xMin: -1.2, xMax: 6.2, yMin: -0.6, yMax: 6.2 },
        f: (x) => (x - 1) * (x - 1) + 1,
        fInv: (x) => (x < 1 ? NaN : 1 + Math.sqrt(x - 1)),
        targetClipX: 1,
        targetInvVal: 3,
        sliders: [
          { key: 'clipX', label: 'بداية التقابل $x_{\\min}$', min: -1, max: 2.5, step: 0.5, init: -1.0 },
          { key: 'invAns', label: 'قيمة $f^{-1}(5)$', min: 1, max: 5, step: 0.5, init: 1.5 }
        ]
      },
      {
        id: '6-2',
        topic: '21_nth_root_rational_power',
        mode: 'rational-power',
        title: 'بوابة الجذر النوني والقوى الجذرية $x^r$',
        formula: '$f(x) = x^r = \\sqrt[n]{x^m}$ مع $\\sqrt[3]{8} = 2$',
        mission: 'اختر الأس الجذري $r = \\frac{m}{n}$ لتعبر المنحنى $y = x^r$ بوابة النجم $(8, 4)$، وحلّ المعادلة $x^3 = 8$!',
        proof: 'لكل $x > 0$ لدينا $x^{m/n} = \\sqrt[n]{x^m}$. وحل $x^3 = 8$ هو $x = \\sqrt[3]{8} = 2$، ومنه $8^{2/3} = (\\sqrt[3]{8})^2 = 2^2 = 4$.',
        view: { xMin: 0, xMax: 10.2, yMin: 0, yMax: 6.5 },
        xStart: 0.3,
        xEnd: 9.5,
        star: { x: 8, y: 4 },
        ops: [
          { id: '1/3', label: '$r = \\frac{1}{3} \\;(\\sqrt[3]{x})$', exp: 1 / 3, correct: false },
          { id: '1/2', label: '$r = \\frac{1}{2} \\;(\\sqrt{x})$', exp: 0.5, correct: false },
          { id: '2/3', label: '$r = \\frac{2}{3} \\;(\\sqrt[3]{x^2})$', exp: 2 / 3, correct: true },
          { id: '3/2', label: '$r = \\frac{3}{2} \\;(\\sqrt{x^3})$', exp: 1.5, correct: false }
        ],
        slider: { key: 'rootAns', label: 'حل $x^3 = 8$', min: 1, max: 5, step: 0.5, init: 4.0 }
      }
    ]
  }
];
