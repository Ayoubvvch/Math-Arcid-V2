/**
 * Sequence Weaver v2.0 — True Real-Time Arcade Definitions
 * Official Moroccan 2BAC PC Lesson 3: Suites Numériques (Skills 41–52).
 * Zero Hors-programme: NO formal ε-N limit proofs.
 */

export const GAME_ID = 'sequence-weaver';

export const STAGES = [
  {
    id: 'induction-guardian',
    tab: '1. حارس الترجع',
    title: 'حارس الترجع والمكبر ($u_{n+1} = f(u_n)$)',
    formula: '$u_{n+1} = \\frac{1}{2}u_n + 2 \\quad (L = 4)$',
    mode: 'induction-catcher',
    targetHits: 10,
    domain: { min: 0, max: 6 },
    fixedPoint: 4,
    f: (x) => 0.5 * x + 2,
    goalText: 'التقط البذور الآمنة ($u_0 \\le 4$) وصدّ الشاذة ($u_0 > 4$) بـ [▢ / Space] مع إبقاء السقف $M \\approx 4$',
    deckHint: 'التحرك: عصا يسار / ◀▶ / الماوس • رفع/خفض السقف M: W/S أو L2/R2 • صدّ الشاذة: ▢ / Space',
    controls: [
      { action: 'shield', label: 'صدّ الشاذة [▢ / Space]', cls: 'rose' },
      { action: 'ceilDown', label: 'خفض M [L2 / S]', cls: 'amber' },
      { action: 'ceilUp', label: 'رفع M [R2 / W]', cls: 'emerald' }
    ]
  },
  {
    id: 'mct-polarity',
    tab: '2. قنّاص الرتابة MCT',
    title: 'قنّاص الرتابة والتقارب الرتيب ($f(x) - x$)',
    formula: '$u_{n+1} = \\frac{u_n^2 + 3}{4} \\quad (\\alpha=1,\\; \\beta=3)$',
    mode: 'monotone-shooter',
    targetHits: 12,
    domain: { min: 0, max: 4.2 },
    f: (x) => (x * x + 3) / 4,
    goalText: 'اقترب من كل حدّ وأطلق الشعاع المطابق: تزايدية [▢] • تناقصية [△] • متباعدة [◯]',
    deckHint: 'التوجيه: عصا يسار / WASD / الماوس • تزايدية [▢/1] • تناقصية [△/2] • متباعدة [◯/3] • اندفاع [✕/Space]',
    controls: [
      { action: 'beamInc', label: 'تزايدية f(x)>x [▢ / 1]', cls: 'cyan' },
      { action: 'beamDec', label: 'تناقصية f(x)<x [△ / 2]', cls: 'amber' },
      { action: 'beamDiv', label: 'متباعدة [◯ / 3]', cls: 'rose' },
      { action: 'dash', label: 'اندفاع [✕ / Space]', cls: 'emerald' }
    ]
  },
  {
    id: 'geo-rhythm',
    tab: '3. إيقاع الهندسية و Sn',
    title: 'طريق الهندسية و $n^p$ والمجاميع $S_n$',
    formula: '$u_n = u_0 q^n \\;\\&\\; S_n = u_0\\frac{1-q^{n+1}}{1-q}$',
    mode: 'rhythm-lanes',
    targetHits: 14,
    goalText: 'وجّه المسار الصحيح عند خط الإيقاع واضغط [✕ / Space] • أطلق قنبلة المجموع $S_n$ بـ [◯ / E]',
    deckHint: 'تبديل المسار: عصا يسار / ◀▶ / نقر المسار • ضرب النبضة: ✕ / Space • قنبلة المجموع Sₙ: ◯ / E',
    controls: [
      { action: 'laneLeft', label: 'مسار → 0 [◀]', cls: 'emerald' },
      { action: 'pulseHit', label: 'ضرب الإيقاع [✕ / Space]', cls: 'cyan' },
      { action: 'laneRight', label: 'مسار ∞ [▶]', cls: 'rose' },
      { action: 'sumNova', label: 'طاقة Sₙ [◯ / E]', cls: 'amber' }
    ]
  },
  {
    id: 'fixed-point-boss',
    tab: '4. عدسة النقط الصامدة',
    title: 'صائد $f(L) = L$ للمتتالية المتخاطة',
    formula: '$u_{n+1} = \\frac{4u_n - 3}{u_n} \\implies v_n = \\frac{u_n - \\alpha}{u_n - \\beta}$',
    mode: 'homographic-boss',
    targetHits: 8,
    domain: { min: 0.4, max: 4.5 },
    f: (x) => (4 * x - 3) / Math.max(0.25, x),
    fixedTargets: [
      { x: 1, y: 1, label: 'α=1' },
      { x: 3, y: 3, label: 'β=3' }
    ],
    goalText: 'تفادَ القذائف بالاندفاع [✕] وصوّب على تقاطعات $y=f(x)$ و $y=x$ لإقفال $\\alpha, \\beta$ بـ [▢ / كليك]!',
    deckHint: 'تصويب وحركة: عصا يسار / WASD / الماوس • إقفال نقطة صامدة: ▢ / كليك • اندفاع التفادي: ✕ / Space',
    controls: [
      { action: 'lockPoint', label: 'إقفال النقطة الصامدة [▢ / كليك]', cls: 'amber' },
      { action: 'dash', label: 'اندفاع التفادي [✕ / Space]', cls: 'cyan' }
    ]
  },
  {
    id: 'gendarme-tunnel',
    tab: '5. نفق الدركيين',
    title: 'نفق الدركيين ومقلاع المقارنة ($v_n \\le u_n \\le w_n$)',
    formula: '$|u_n - L| \\le \\frac{A}{n+1} \\;\\&\\; u_n \\ge \\alpha\\sqrt{n}$',
    mode: 'squeeze-tunnel',
    targetHits: 12,
    goalText: 'حافظ على الشرارة عند $L$ [▲▼] واضبط فكيّ الدركيين [L2/R2 أو ◀▶] للعبور وصدّ شهب $+\\infty$ بـ [▢]',
    deckHint: 'ارتفاع L: عصا يسار Y / W-S / الماوس • ضغط/فتح فك الدركيين: L2/R2 أو ◀▶ • درع المقارنة: ▢ / Space',
    controls: [
      { action: 'pinchIn', label: 'تضييق الحصر [L2 / ◀]', cls: 'amber' },
      { action: 'pinchOut', label: 'توسيع الحصر [R2 / ▶]', cls: 'emerald' },
      { action: 'shield', label: 'درع α√n [▢ / Space]', cls: 'cyan' }
    ]
  }
];
