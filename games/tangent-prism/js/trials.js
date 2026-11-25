/**
 * Tangent Prism — Lesson 2 (2BAC PC: Skills 23–40) Exact Mathematical Definitions
 * Strictly compliant with evolution/CURRICULUM.md (Zero Hors-programme items).
 */

export const TRIALS = [
  {
    id: 'tangent-ricochet',
    index: 0,
    shortTab: '1. عاكس المماس',
    name: 'عاكس المماس والانكسار',
    skillsLabel: 'المهارات 23–30',
    goalCount: 10,
    hint: 'عصا يسار / ◀▶ / الماوس: تحريك الموشور • عصا يمين: تصويب دقيق • [✕ / Space]: شعاع المماس $(T)$ • [▢/△/◯/L2]: تفكيك الشذوذ',
    waves: [
      {
        title: 'المماس والكتابة التفاضلية',
        skillId: 25,
        formulaTex: 'f(x) = \\frac{1}{2}x^2 - 1 \\quad , \\quad f\'(x) = x',
        liveTex: 'dy = x\\,dx \\quad ; \\quad (T): y = f\'(x_0)(x - x_0) + f(x_0)',
        goalText: 'حرّك الموشور على $(C_f)$ ليقطع شعاع المماس $(T)$ البلورة الذهبية ثم أطلق [✕]، وفكّك شذوذ المماس المائل بـ [▢].',
        xRange: [-4.5, 4.5],
        yRange: [-3.2, 5.2],
        f: (x) => 0.5 * x * x - 1,
        df: (x) => x,
        d2f: () => 1,
        anomaly: {
          x0: 1.5,
          kind: 'smooth',
          labelCanvas: 'f\'(1.5) = 1.5',
          toastGood: 'ممتاز! دالة قابلة للاشتقاق: مماس وحيد وتقريب تآلفي $dy = f\'(x)\\,dx$'
        }
      },
      {
        title: 'مشتقة المركّب والخارج و $\\sqrt[3]{u}$',
        skillId: 29,
        formulaTex: 'f(x) = \\sqrt{x^2 + 2} \\quad , \\quad (\\sqrt{u})\' = \\frac{u\'}{2\\sqrt{u}}',
        liveTex: '\\left(\\frac{u}{v}\\right)\'=\\frac{u\'v-uv\'}{v^2} \\; ; \\; (\\sqrt[3]{x^2+1})\' = \\frac{2x}{3\\sqrt[3]{(x^2+1)^2}}',
        goalText: 'صوّب شعاع المماس لمركّب الجذر بـ [✕]، وفكّك شذوذ المماس الأفقي $f\'(0)=0$ بـ [▢] (مشتقة $\\sqrt[3]{u}$ فقط وفق المقرر).',
        xRange: [-4.5, 4.5],
        yRange: [-1.4, 5.4],
        f: (x) => Math.sqrt(x * x + 2),
        df: (x) => x / Math.sqrt(x * x + 2),
        d2f: (x) => 2 / Math.pow(x * x + 2, 1.5),
        anomaly: {
          x0: 0,
          kind: 'smooth',
          labelCanvas: 'f\'(0) = 0',
          toastGood: 'رائع! مماس أفقي عند $x_0 = 0$ لأن $u(x) = x^2 + 2 > 0$'
        }
      },
      {
        title: 'نقطة مزواة (اتصال بلا اشتقاق)',
        skillId: 26,
        formulaTex: 'f(x) = |x^2 - 1| - 1 \\quad \\text{متصلة في } 1',
        liveTex: 'f\'_g(1) = -2 \\neq f\'_d(1) = 2 \\implies \\text{نقطة مزواة}',
        goalText: 'دالة متصلة في $x=\\pm 1$ لكن غير قابلة للاشتقاق! اضرب البلورة بـ [✕] وفكّك شذوذ النقطة المزواة بـ [△].',
        xRange: [-3.2, 3.2],
        yRange: [-2.2, 4.8],
        f: (x) => Math.abs(x * x - 1) - 1,
        df: (x) => (Math.abs(x) >= 1 ? 2 * x : -2 * x),
        d2f: (x) => (Math.abs(x) >= 1 ? 2 : -2),
        singularPoints: [
          { x: 1, y: -1, leftSlope: -2, rightSlope: 2 },
          { x: -1, y: -1, leftSlope: -2, rightSlope: 2 }
        ],
        anomaly: {
          x0: 1,
          kind: 'angular',
          labelCanvas: 'f\'_g \\neq f\'_d',
          toastGood: 'أحسنت! نقطة مزواة عند $x=1$: متصلة ولكن $f\'_g(1) \\neq f\'_d(1)$!'
        }
      },
      {
        title: 'نصف المماس العمودي ($\\pm\\infty$)',
        skillId: 26,
        formulaTex: 'f(x) = \\sqrt{x + 2} - 1 \\quad (D_f = [-2, +\\infty[)',
        liveTex: '\\lim_{x \\to -2^+} \\frac{f(x) - f(-2)}{x + 2} = +\\infty \\implies \\text{نصف مماس عمودي}',
        goalText: 'الدالة متصلة في $-2^+$ وتقبل نصف مماس عمودياً موجهاً للأعلى! صوّب بـ [✕] وفكّك الشذوذ العمودي بـ [◯].',
        xRange: [-3.2, 4.8],
        yRange: [-2.0, 3.6],
        domainMin: -1.96,
        f: (x) => (x >= -2 ? Math.sqrt(Math.max(0, x + 2)) - 1 : NaN),
        df: (x) => (x > -1.995 ? 0.5 / Math.sqrt(x + 2) : 14),
        d2f: (x) => (x > -1.98 ? -0.25 / Math.pow(x + 2, 1.5) : -14),
        verticalHalfTangent: { x: -2, y: -1, dir: 1 },
        anomaly: {
          x0: -2,
          kind: 'vertical',
          labelCanvas: 'f\'_d(-2)=+\\infty',
          toastGood: 'صحيح 100%! معدل التغيّر يؤول إلى $+\\infty \\implies$ نصف مماس عمودي!'
        }
      },
      {
        title: 'مشتقة الدالة العكسية $f^{-1}$',
        skillId: 30,
        formulaTex: 'f(x) = \\frac{1}{3}x^3 + x \\quad \\implies \\quad (f^{-1})\'(y_0) = \\frac{1}{f\'(x_0)}',
        liveTex: 'x_0 = 1,\\; y_0 = \\frac{4}{3},\\; f\'(1) = 2 \\implies (f^{-1})\'(\\tfrac{4}{3}) = \\frac{1}{2}',
        goalText: 'شاهد مماس $(C_{f^{-1}})$ المقلوب لحظياً عبر $y=x$! أطلق [✕] على البلورات واقتنص شذوذ العكسية بـ [L2].',
        xRange: [-3.6, 3.6],
        yRange: [-4.2, 4.2],
        f: (x) => (x * x * x) / 3 + x,
        df: (x) => x * x + 1,
        d2f: (x) => 2 * x,
        showInverseGhost: true,
        anomaly: {
          x0: 1,
          kind: 'inverse',
          labelCanvas: '(f^{-1})\'=\\frac{1}{2}',
          toastGood: 'تطابق عكسي دقيق! $(f^{-1})\'(y_0) = \\frac{1}{f\'(x_0)} = \\frac{1}{2}$'
        }
      }
    ],
    actions: [
      { id: 'fire', key: '✕ / Space', label: 'شعاع المماس $(T)$', tone: 'gold', span2: true },
      { id: 'smooth', key: '▢ / 1', label: 'مماس مائل $f\'\\in\\mathbb{R}$', tone: 'jade' },
      { id: 'angular', key: '△ / 2', label: 'مزواة $f\'_d\\neq f\'_g$', tone: 'rose' },
      { id: 'vertical', key: '◯ / 3', label: 'عمودي $\\pm\\infty$', tone: 'violet' },
      { id: 'inverse', key: 'L2 / Q', label: 'عكسية $(f^{-1})\'$', tone: 'amber' }
    ]
  },

  {
    id: 'aux-extrema',
    index: 1,
    shortTab: '2. المساعدة والمطاريف',
    name: 'شرارة الدالة المساعدة والمطاريف',
    skillsLabel: 'المهارات 31–34 و 39',
    goalCount: 9,
    hint: 'عصا يسار / WASD / الماوس: توجيه المسبار • [▢]: $g>0$ • [△]: $g<0$ • [✕]: مطراف/تقاطع/استمثال • [◯]: نبضة متفاوتة لصد الشرر',
    waves: [
      {
        mode: 'aux',
        title: 'الدالة المساعدة وإشارة $f\'$',
        skillId: 32,
        formulaTex: 'f\'(x) = g(x) = x^2 - 2x - 3 = (x+1)(x-3)',
        liveTex: 'g(x) > 0 \\iff x \\in ]-\\infty,-1[\\cup]3,+\\infty[',
        goalText: 'تتبّع إسقاط النيزك على المنحنى $g(x)$: إن كان $g(x)>0$ اضغط [▢]، وإن كان $g(x)<0$ اضغط [△]، وعند المطاريف ($-1, 3$) اضغط [✕]!',
        xRange: [-4.2, 5.2],
        yRange: [-5.2, 5.8],
        f: (x) => x * x - 2 * x - 3,
        df: (x) => 2 * x - 2,
        d2f: () => 2,
        roots: [-1, 3]
      },
      {
        mode: 'graphical',
        title: 'الحل المبياني $f(x)=g(x)$ و $f\\le g$',
        skillId: 33,
        formulaTex: 'f(x) = \\sqrt{x + 2} \\quad \\text{و} \\quad g(x) = x \\quad (x \\ge 0)',
        liveTex: 'f(x)=g(x) \\iff x=2 \\quad ; \\quad f(x)\\le g(x) \\iff x \\ge 2',
        goalText: 'احتمِ داخل منطقة $f(x) \\le g(x)$ عند هبوب العاصفة، وحَلّق لقفل نقاط التقاطع الحقيقية بـ [✕]!',
        xRange: [-2.6, 5.2],
        yRange: [-1.8, 4.8],
        substages: [
          {
            formulaTex: 'f(x) = \\sqrt{x + 2} \\quad \\text{و} \\quad g(x) = x \\quad (x \\ge 0)',
            liveTex: '\\sqrt{x+2}=x \\iff x=2 \\;(\\text{رفض }-1) \\; ; \\; f\\le g \\iff x\\ge 2',
            f: (x) => (x >= -2 ? Math.sqrt(Math.max(0, x + 2)) : NaN),
            g: (x) => x,
            df: (x) => (x > -1.98 ? 0.5 / Math.sqrt(x + 2) : 8),
            d2f: (x) => (x > -1.95 ? -0.25 / Math.pow(x + 2, 1.5) : -8),
            safeInterval: [2, 5.2],
            intersections: [{ x: 2, y: 2, label: 'I(2,2)' }]
          },
          {
            formulaTex: 'f(x) = \\frac{1}{2}x^2 - \\frac{1}{2} \\quad \\text{و} \\quad g(x) = \\frac{1}{2}x + \\frac{1}{2}',
            liveTex: 'f(x)=g(x) \\iff x\\in\\{-1, 2\\} \\; ; \\; f\\le g \\iff x\\in[-1, 2]',
            f: (x) => 0.5 * x * x - 0.5,
            g: (x) => 0.5 * x + 0.5,
            df: (x) => x,
            d2f: () => 1,
            safeInterval: [-1, 2],
            intersections: [
              { x: -1, y: 0, label: 'A(-1,0)' },
              { x: 2, y: 1.5, label: 'B(2,1.5)' }
            ]
          }
        ],
        f: (x) => (x >= -2 ? Math.sqrt(Math.max(0, x + 2)) : NaN),
        g: (x) => x,
        df: (x) => (x > -1.98 ? 0.5 / Math.sqrt(x + 2) : 8),
        d2f: (x) => (x > -1.95 ? -0.25 / Math.pow(x + 2, 1.5) : -8),
        intersections: [{ x: 2, y: 2 }]
      },
      {
        mode: 'optimize',
        title: 'الاستمثال والمتفاوتة الحية',
        skillId: 34,
        formulaTex: 'A(x) = 2x(H - x^2) \\quad , \\quad A\'(x) = 2H - 6x^2',
        liveTex: 'A\'(x) = 0 \\iff x^* = \\sqrt{\\frac{H}{3}} \\quad ; \\quad [\\bigcirc]\\text{ لصد الشرر بـ }x+\\frac{1}{x}\\ge 2',
        goalText: 'اضبط المستطيل تحت $y=H-x^2$ حتى ينعدم $A\'(x)$ ثم اقفله بـ [✕]، وبدّد شرر الحمل الزائد بنبضة المتفاوتة [◯]!',
        xRange: [-2.8, 2.8],
        yRange: [-0.8, 5.4],
        heights: [4.0, 3.0, 4.8],
        f: (x) => 4 - x * x,
        df: (x) => 8 - 6 * x * x,
        d2f: (x) => -12 * x,
        optX: 2 / Math.sqrt(3)
      }
    ],
    actions: [
      { id: 'lock', key: '✕ / Space', label: 'قفل مطراف / تقاطع / استمثال', tone: 'gold', span2: true },
      { id: 'inc', key: '▢ / 1', label: 'تزايدية $g > 0$', tone: 'jade' },
      { id: 'dec', key: '△ / 2', label: 'تناقصية $g < 0$', tone: 'rose' },
      { id: 'ineq', key: '◯ / 3', label: 'درع المتفاوتة $x+\\frac{1}{x}\\ge 2$', tone: 'amber', span2: true }
    ]
  },

  {
    id: 'concavity-lens',
    index: 2,
    shortTab: '3. التحدّب والانعطاف',
    name: 'عدسة التحدّب وبوابات الانعطاف',
    skillsLabel: 'المهارة 35',
    goalCount: 10,
    hint: 'عصا يسار / ◀▶ / الماوس: توجيه المركبة • [▢]: محدّب $f\'\'>0$ • [△]: مقعّر $f\'\'<0$ • [✕]: انعطاف حقيقي • [◯]: كشف فخ $x^4$',
    waves: [
      {
        title: 'نقطة انعطاف بمماس مائل',
        skillId: 35,
        formulaTex: 'f(x) = \\frac{1}{3}x^3 - x \\quad , \\quad f\'\'(x) = 2x',
        liveTex: 'x < 0 \\implies f\'\' < 0\\;(\\cap) \\quad | \\quad x > 0 \\implies f\'\' > 0\\;(\\cup)',
        goalText: 'طابق درع التحدّب [▢] حيث $f\'\'>0$ والتقعّر [△] حيث $f\'\'<0$ لجمع البلورات، واعبر بوابة الانعطاف $I(0,0)$ بـ [✕]!',
        xRange: [-3.2, 3.2],
        yRange: [-3.2, 3.2],
        f: (x) => (x * x * x) / 3 - x,
        df: (x) => x * x - 1,
        d2f: (x) => 2 * x,
        inflections: [{ x: 0, real: true, label: 'I(0,0)' }]
      },
      {
        title: 'انعدام $f\'$ دون تغيير إشارتها',
        skillId: 35,
        formulaTex: 'f(x) = \\frac{1}{4}x^3 \\quad , \\quad f\'(x) = \\frac{3}{4}x^2 \\ge 0',
        liveTex: 'f\'(0) = 0 \\text{ بلا تغيير إشارة } \\implies O(0,0) \\text{ انعطاف بمماس أفقي!}',
        goalText: 'معيار آخر للانعطاف: $f\'(0)=0$ دون أن تغيّر إشارتها! اعبر $O(0,0)$ بـ [✕] وطابق بلورات التقعّر والتحدّب!',
        xRange: [-3.0, 3.0],
        yRange: [-3.2, 3.2],
        f: (x) => 0.25 * x * x * x,
        df: (x) => 0.75 * x * x,
        d2f: (x) => 1.5 * x,
        inflections: [{ x: 0, real: true, label: 'O(0,0)\\;f\'=0' }]
      },
      {
        title: 'بوابتا انعطاف مزدوجتان',
        skillId: 35,
        formulaTex: 'f(x) = \\frac{1}{6}x^4 - x^2 + 1 \\quad , \\quad f\'\'(x) = 2(x^2 - 1)',
        liveTex: 'f\'\'(x) = 0 \\iff x = -1 \\;\\text{أو}\\; x = 1 \\;(\\text{تغيير إشارة})',
        goalText: 'المنحنى مقعّر $\\cap$ بين $-1$ و $1$ ومحدّب $\\cup$ خارجهما! افتح البوابتين $I_1$ و $I_2$ بـ [✕] واجمع البلورات!',
        xRange: [-3.0, 3.0],
        yRange: [-1.4, 3.6],
        f: (x) => (x * x * x * x) / 6 - x * x + 1,
        df: (x) => (2 * x * x * x) / 3 - 2 * x,
        d2f: (x) => 2 * x * x - 2,
        inflections: [
          { x: -1, real: true, label: 'I_1(-1,\\frac{1}{6})' },
          { x: 1, real: true, label: 'I_2(1,\\frac{1}{6})' }
        ]
      },
      {
        title: 'فخ البكالوريا: $f\'\'(0)=0$ بلا تغيير إشارة!',
        skillId: 35,
        formulaTex: 'f(x) = \\frac{1}{4}x^4 - 1 \\quad , \\quad f\'\'(x) = 3x^2 \\ge 0',
        liveTex: 'f\'\'(0) = 0 \\;\\text{لا تغير إشارتها} \\implies \\text{ليست نقطة انعطاف!}',
        goalText: 'انتبه للفخ! $f\'\'(0)=0$ لكن المنحنى يبقى محدّباً $\\cup$ دائماً! دمّر البوابة الوهمية في $x=0$ بـ [◯] لا بـ [✕]!',
        xRange: [-2.6, 2.6],
        yRange: [-1.8, 3.6],
        f: (x) => 0.25 * x * x * x * x - 1,
        df: (x) => x * x * x,
        d2f: (x) => 3 * x * x,
        inflections: [{ x: 0, real: false, label: 'f\'\'(0)=0 (!)' }]
      }
    ],
    actions: [
      { id: 'inflect', key: '✕ / Space', label: 'بوابة انعطاف حقيقية!', tone: 'gold', span2: true },
      { id: 'convex', key: '▢ / 1', label: 'محدّب $\\cup\\; (f\'\'>0)$', tone: 'jade' },
      { id: 'concave', key: '△ / 2', label: 'مقعّر $\\cap\\; (f\'\'<0)$', tone: 'rose' },
      { id: 'trap', key: '◯ / 3', label: 'فخ: لا انعطاف!', tone: 'violet', span2: true }
    ]
  },

  {
    id: 'asymptote-tree',
    index: 3,
    shortTab: '4. الفروع والوضع النسبي',
    name: 'شجرة الفروع اللانهائية والوضع النسبي',
    skillsLabel: 'المهارات 36–37 و 39',
    goalCount: 10,
    hint: 'عصا يسار / ▲▼ / الماوس: التحليق فوق/تحت $(\\Delta)$ وتفادي شهب التباعد • [▢/△/◯/L2]: قفل البوابة • [✕]: نبضة الوضع النسبي/الصد',
    waves: [
      {
        title: 'فرع شلجمي باتجاه $(Ox)$',
        skillId: 36,
        formulaTex: 'f(x) = 2\\sqrt{x + 1} \\quad (x \\to +\\infty)',
        liveTex: '\\lim_{+\\infty} f(x)=+\\infty \\quad , \\quad \\lim_{+\\infty} \\frac{f(x)}{x} = 0',
        goalText: 'النهاية $\\frac{f(x)}{x} \\to 0$! اقفل بوابة الفرع الشلجمي $(Ox)$ بـ [▢] وتفادَ شهب التباعد أو بدّدها بنبضة [✕]!',
        branchType: 'parab-ox',
        ratioHint: '\\frac{f(x)}{x} \\to 0',
        f: (x) => 2 * Math.sqrt(Math.max(0, x + 1)),
        df: (x) => 1 / Math.sqrt(Math.max(0.1, x + 1)),
        d2f: (x) => -0.5 / Math.pow(Math.max(0.1, x + 1), 1.5),
        asym: null,
        relSign: 1
      },
      {
        title: 'فرع شلجمي باتجاه $(Oy)$',
        skillId: 36,
        formulaTex: 'f(x) = \\frac{1}{3}x^2 - \\frac{1}{2}x \\quad (x \\to +\\infty)',
        liveTex: '\\lim_{+\\infty} f(x)=+\\infty \\quad , \\quad \\lim_{+\\infty} \\frac{f(x)}{x} = +\\infty',
        goalText: 'المنحنى يتسارع عمودياً: $\\frac{f(x)}{x} \\to +\\infty$! اقفل الفرع الشلجمي $(Oy)$ بـ [△] وتفادَ الشهب!',
        branchType: 'parab-oy',
        ratioHint: '\\frac{f(x)}{x} \\to +\\infty',
        f: (x) => (x * x) / 3 - 0.5 * x,
        df: (x) => (2 * x) / 3 - 0.5,
        d2f: () => 2 / 3,
        asym: null,
        relSign: 1
      },
      {
        title: 'مقارب مائل ووضع نسبي فوق $(\\Delta)$',
        skillId: 37,
        formulaTex: 'f(x) = 0.6x - 0.5 + \\frac{2.2}{x + 1} \\quad , \\quad (\\Delta): y = 0.6x - 0.5',
        liveTex: 'f(x) - y_\\Delta = \\frac{2.2}{x + 1} > 0 \\implies (C_f) \\text{ فوق } (\\Delta)',
        goalText: 'اقفل المقارب المائل بـ [◯]، ثم التقط حلقات الوضع النسبي فوق $(\\Delta)$ أو فجّرها بنبضة [✕]!',
        branchType: 'oblique',
        ratioHint: 'f(x)-y_\\Delta \\to 0^+',
        f: (x) => 0.6 * x - 0.5 + 2.2 / Math.max(0.45, x + 1),
        df: (x) => 0.6 - 2.2 / Math.pow(Math.max(0.45, x + 1), 2),
        d2f: (x) => 4.4 / Math.pow(Math.max(0.45, x + 1), 3),
        asym: (x) => 0.6 * x - 0.5,
        asymLabel: 'y = 0.6x - 0.5',
        relSign: 1
      },
      {
        title: 'مقارب مائل لدالة لاجذرية تحت $(\\Delta)$',
        skillId: 39,
        formulaTex: 'f(x) = \\sqrt{x^2 + 2x} - 0.5 \\quad , \\quad (\\Delta): y = x + 0.5',
        liveTex: '\\lim_{+\\infty}[f(x)-x]=0.5 \\;\\text{و}\\; f(x) < x+0.5 \\;\\text{تحت }(\\Delta)',
        goalText: 'دالة لاجذرية تقترب من $(\\Delta)$ من الأسفل! اقفل المقارب المائل [◯] والتقط حلقات تحت $(\\Delta)$!',
        branchType: 'oblique',
        ratioHint: 'f(x)-y_\\Delta \\to 0^-',
        f: (x) => Math.sqrt(Math.max(0.04, x * x + 2 * x)) - 0.5,
        df: (x) => (x + 1) / Math.sqrt(Math.max(0.04, x * x + 2 * x)),
        d2f: (x) => -1 / Math.pow(Math.max(0.04, x * x + 2 * x), 1.5),
        asym: (x) => x + 0.5,
        asymLabel: 'y = x + 0.5',
        relSign: -1
      },
      {
        title: 'فرع شلجمي باتجاه $y = ax$',
        skillId: 36,
        formulaTex: 'f(x) = 0.6x + 1.3\\sqrt{x} \\quad (x \\to +\\infty)',
        liveTex: '\\lim_{+\\infty}\\frac{f(x)}{x} = 0.6 \\quad , \\quad \\lim_{+\\infty}[f(x)-0.6x] = +\\infty',
        goalText: 'احذر! $\\lim \\frac{f}{x} = 0.6$ لكن $f(x)-0.6x \\to +\\infty$! فرع شلجمي باتجاه $y=0.6x$ — أقفله بـ [L2] والتقط الحلقات!',
        branchType: 'parab-ax',
        ratioHint: 'f(x)-0.6x \\to +\\infty',
        f: (x) => 0.6 * x + 1.3 * Math.sqrt(Math.max(0, x)),
        df: (x) => 0.6 + 0.65 / Math.sqrt(Math.max(0.1, x)),
        d2f: (x) => -0.325 / Math.pow(Math.max(0.1, x), 1.5),
        asym: (x) => 0.6 * x,
        asymLabel: 'y = 0.6x',
        relSign: 1
      }
    ],
    actions: [
      { id: 'rel', key: '✕ / Space', label: 'نبضة الوضع النسبي / صد الشهب', tone: 'gold', span2: true },
      { id: 'parab-ox', key: '▢ / 1', label: 'فرع شلجمي $(Ox)$', tone: 'jade' },
      { id: 'parab-oy', key: '△ / 2', label: 'فرع شلجمي $(Oy)$', tone: 'rose' },
      { id: 'oblique', key: '◯ / 3', label: 'مقارب مائل $y=ax+b$', tone: 'amber' },
      { id: 'parab-ax', key: 'L2 / Q', label: 'فرع شلجمي $y=ax$', tone: 'violet' }
    ]
  },

  {
    id: 'symmetry-twin',
    index: 4,
    shortTab: '5. التوأم المتماثل',
    name: 'التوأم المتماثل والإنشاء الهندسي',
    skillsLabel: 'المهارات 38–40',
    goalCount: 10,
    hint: 'عصا يسار / WASD / الماوس: توجيه المركبة $M$ • [▢/△/◯/L2/R2]: قانون التماثل للتوأم $M\'$ • [✕]: رنين مزدوج لإنشاء $(C_f)$',
    waves: [
      {
        title: 'دالة زوجية — محور $(Oy)$',
        skillId: 38,
        symMode: 'even',
        formulaTex: 'f(x) = \\frac{1}{2}x^2 - 2 \\quad \\implies \\quad f(-x) = f(x)',
        liveTex: 'M(x, y) \\longleftrightarrow M\'(-x, y) \\quad \\text{محور } (Oy)',
        goalText: 'فعّل قانون الدالة الزوجية [▢]، ثم وجّه مركبتك للبلورة الذهبية ليلامس توأمك البلورة الوردية واضرب [✕]!',
        xRange: [-4.2, 4.2],
        yRange: [-3.2, 4.2],
        f: (x) => 0.5 * x * x - 2,
        df: (x) => x,
        d2f: () => 1,
        mirror: (x, y) => ({ x: -x, y }),
        axisX: 0,
        targetX: [1.6, 2.5]
      },
      {
        title: 'دالة فردية — المركز $O(0,0)$',
        skillId: 38,
        symMode: 'odd',
        formulaTex: 'f(x) = \\frac{1}{3}x^3 - x \\quad \\implies \\quad f(-x) = -f(x)',
        liveTex: 'M(x, y) \\longleftrightarrow M\'(-x, -y) \\quad \\text{المركز } O(0,0)',
        goalText: 'دالة فردية! فعّل التماثل المركزي حول $O$ بـ [△] وطابق المركبة والتوأم على النقطتين المتماثلتين ثم [✕]!',
        xRange: [-3.8, 3.8],
        yRange: [-3.6, 3.6],
        f: (x) => (x * x * x) / 3 - x,
        df: (x) => x * x - 1,
        d2f: (x) => 2 * x,
        mirror: (x, y) => ({ x: -x, y: -y }),
        center: { x: 0, y: 0 },
        targetX: [1.4, 2.1]
      },
      {
        title: 'محور التماثل $x = a$',
        skillId: 38,
        symMode: 'axis',
        formulaTex: 'f(x) = (x - 1)^2 - 2 \\quad \\implies \\quad f(2 - x) = f(x)',
        liveTex: 'M(x, y) \\longleftrightarrow M\'(2a - x, y) \\quad (a = 1)',
        goalText: 'محور التماثل هو $x = 1$! فعّل [◯] وحلّق نحو البلورة الذهبية ليلتقط توأمك صورتها المتماثلة ثم [✕]!',
        xRange: [-3.2, 5.2],
        yRange: [-3.0, 4.4],
        f: (x) => (x - 1) * (x - 1) - 2,
        df: (x) => 2 * (x - 1),
        d2f: () => 2,
        mirror: (x, y) => ({ x: 2 - x, y }),
        axisX: 1,
        targetX: [2.2, 2.9]
      },
      {
        title: 'مركز التماثل $\\Omega(a, b)$',
        skillId: 38,
        symMode: 'center',
        formulaTex: 'f(x) = 1 + \\frac{1.4}{x - 1} \\quad \\implies \\quad f(2 - x) + f(x) = 2',
        liveTex: 'M(x, y) \\longleftrightarrow M\'(2 - x, 2 - y) \\quad \\Omega(1, 1)',
        goalText: 'المركز $\\Omega(1, 1)$ يحقق $f(2a-x)+f(x)=2b$! فعّل [L2] وقُد التوأم نحو التطابق المزدوج ثم [✕]!',
        xRange: [-3.2, 5.2],
        yRange: [-3.2, 5.2],
        f: (x) => (Math.abs(x - 1) < 0.2 ? NaN : 1 + 1.4 / (x - 1)),
        df: (x) => (Math.abs(x - 1) < 0.2 ? 0 : -1.4 / Math.pow(x - 1, 2)),
        d2f: (x) => (Math.abs(x - 1) < 0.2 ? 0 : 2.8 / Math.pow(x - 1, 3)),
        mirror: (x, y) => ({ x: 2 - x, y: 2 - y }),
        center: { x: 1, y: 1 },
        asymptoteCross: { x: 1, y: 1 },
        targetX: [2.0, 2.9]
      },
      {
        title: 'دورية $T$ والإنشاء الهندسي $(C_f)$',
        skillId: 40,
        symMode: 'periodic',
        formulaTex: 'f(x) = 2\\cos\\!\\left(\\frac{\\pi}{2}x\\right) \\quad , \\quad f(x + 4) = f(x)',
        liveTex: 'M(x, y) \\longleftrightarrow M\'(x \\pm T, y) \\quad (T = 4)',
        goalText: 'دالة دورية دورها $T=4$! فعّل الإزاحة الدورية [R2] وأكمل الإنشاء الهندسي للمنحنى $(C_f)$ بالرنين المزدوج [✕]!',
        xRange: [-4.4, 4.4],
        yRange: [-3.2, 3.2],
        f: (x) => 2 * Math.cos((Math.PI * x) / 2),
        df: (x) => -Math.PI * Math.sin((Math.PI * x) / 2),
        d2f: (x) => -(Math.PI * Math.PI * 0.5) * Math.cos((Math.PI * x) / 2),
        mirror: (x, y) => ({ x: x <= 0 ? x + 4 : x - 4, y }),
        periodT: 4,
        targetX: [-2.4, -1.0]
      }
    ],
    actions: [
      { id: 'sync', key: '✕ / Space', label: 'رنين التوأم المزدوج!', tone: 'gold', span2: true },
      { id: 'even', key: '▢ / 1', label: 'زوجية $(Oy)$', tone: 'jade' },
      { id: 'odd', key: '△ / 2', label: 'فردية $O(0,0)$', tone: 'rose' },
      { id: 'axis', key: '◯ / 3', label: 'محور $x = a$', tone: 'amber' },
      { id: 'center', key: 'L2 / Q', label: 'مركز $\\Omega(a,b)$', tone: 'violet' },
      { id: 'periodic', key: 'R2 / E', label: 'دورية $T$ (إزاحة)', tone: 'jade', span2: true }
    ]
  }
];
