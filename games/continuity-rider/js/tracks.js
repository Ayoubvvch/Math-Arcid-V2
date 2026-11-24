/**
 * Continuity Rider v2.0 — Real-Time Physics Curve-Skating Action Platformer
 * Official Moroccan 2BAC PC Lesson 1 (Skills 1–22).
 * Zero Hors-programme: NO arcsin/arccos/arctan, NO nth-root(u(x)) for n>=3, NO Rolle/TAF.
 */

export const GAME_ID = 'continuity-rider';

export const SECTORS = [
  {
    id: 'indeterminate-skate',
    tab: '1. جسور 0/0',
    title: 'التزلّج وإزالة الأشكال غير المحددة ($\\frac{0}{0}$)',
    formula: '$\\frac{x^2-4}{x-2},\\; \\frac{\\sqrt{x+3}-2}{x-1},\\; \\frac{\\sqrt[3]{x}-2}{x-8},\\; \\frac{\\sin(3x)}{x}$',
    mode: 'bridge-skater',
    targetLength: 10,
    goalText: 'أطلق الشعاع الصحيح لردم فجوة $\\frac{0}{0}$ أمامك قبل السقوط: تعميل [▢] • مرافق [△] • مثلثية [◯] • قفز [✕]',
    deckHint: 'التسارع/الفرملة: عصا يسار / ◀▶ • القفز المزدوج: ✕ / Space • تعميل [▢/1] • مرافق [△/2] • مثلثية [◯/3]',
    controls: [
      { action: 'jump', label: 'قفز مزدوج [✕ / Space]', cls: 'emerald' },
      { action: 'beamFactor', label: 'تعميل (x−a) [▢ / 1]', cls: 'cyan' },
      { action: 'beamConj', label: 'مرافق √/∛ [△ / 2]', cls: 'amber' },
      { action: 'beamTrig', label: 'مثلثية sin [◯ / 3]', cls: 'rose' }
    ]
  },
  {
    id: 'floor-and-domain',
    tab: '2. مدرّج E(x) و Df',
    title: 'منصّات الجزء الصحيح $E(x)$ وفجوات $D_f$',
    formula: '$E(x)=\\lfloor x \\rfloor \\;\\text{غير متصلة في}\\; \\mathbb{Z}$',
    mode: 'stair-runner',
    targetLength: 12,
    goalText: 'اقفز [✕ / Space] فوق انقطاعات $E(x)$ عند $\\mathbb{Z}$ وفوق فجوات $D_f$ ($x<1$ أو المقام المنعدم) واجمع بلورات الاتصال!',
    deckHint: 'التحكم بالسرعة: عصا يسار / ◀▶ • القفز والقفز المزدوج: ✕ / Space / نقر الشاشة',
    controls: [
      { action: 'jump', label: 'قفز / قفز مزدوج [✕ / Space / نقر]', cls: 'emerald' }
    ]
  },
  {
    id: 'asymptote-surf',
    tab: '3. ركوب المقاربات',
    title: 'ركوب المقاربات الأفقية والمائلة ($x \\to +\\infty$)',
    formula: '$\\lim_{x\\to+\\infty}[f(x)-(ax+b)] = 0$',
    mode: 'asymptote-surfer',
    targetLength: 10,
    goalText: 'ارفع/اخفض زاوية اللوح [▲▼ / W-S] لمطابقة المقارب وتفادَ أقطاب المقاربات العمودية $x=a$ بالقفز [✕]',
    deckHint: 'ضبط زاوية التزلج (الميل a): عصا يسار Y / W-S / الماوس • القفز فوق القطب العمودي: ✕ / Space',
    controls: [
      { action: 'pitchUp', label: 'رفع الميل [▲ / W]', cls: 'amber' },
      { action: 'pitchDown', label: 'خفض الميل [▼ / S]', cls: 'cyan' },
      { action: 'jump', label: 'قفز فوق القطب x=a [✕ / Space]', cls: 'rose' }
    ]
  },
  {
    id: 'tvi-bisection-dash',
    tab: '4. تفرع TVI الثنائي',
    title: 'تحطيم حواجز $f(\\alpha)=0$ بالتفرع الثنائي',
    formula: '$f([a,b]) \\;\\text{متصلة ورتيبة} \\;\\&\\; f(a)\\cdot f(b)<0$',
    mode: 'tvi-dash',
    targetLength: 8,
    goalText: 'عند الاقتراب من الحاجز، اختر نصف المجال ذي الإشارتين المتعاكستين: أيسر [L2 / Q] أو أيمن [R2 / E] لتحطيمه!',
    deckHint: 'شطر أيسر [a,c]: L2 / Q • شطر أيمن [c,b]: R2 / E • قفز طوارئ: ✕ / Space',
    controls: [
      { action: 'sliceLeft', label: 'نصف أيسر [a, c] (L2 / Q)', cls: 'cyan' },
      { action: 'sliceRight', label: 'نصف أيمن [c, b] (R2 / E)', cls: 'amber' },
      { action: 'jump', label: 'قفز [✕ / Space]', cls: 'emerald' }
    ]
  },
  {
    id: 'inverse-mirror-flip',
    tab: '5. مرآة f⁻¹ و ⁿ√x',
    title: 'الانقلاب البُعدي عبر $y = x$ والجذر النوني $\\sqrt[n]{x}$',
    formula: '$(C_{f^{-1}}) \\;\\text{تماثل}\\; (C_f) \\;\\text{حول}\\; y=x \\;\\&\\; x^{\\frac{p}{q}}$',
    mode: 'mirror-flipper',
    targetLength: 10,
    goalText: 'بدّل البُعد بين مسار $f$ ومسار $f^{-1}$ بـ [◯ / Shift / R2] لتفادي جدران البُعد الآخر والتقاط قوى $x^r$!',
    deckHint: 'قلب البُعد (f ↔ f⁻¹): ◯ / R2 / Shift • القفز: ✕ / Space • السرعة: ◀▶',
    controls: [
      { action: 'flipMirror', label: 'قلب المرآة f ↔ f⁻¹ [◯ / R2 / Shift]', cls: 'amber' },
      { action: 'jump', label: 'قفز [✕ / Space]', cls: 'cyan' }
    ]
  }
];
