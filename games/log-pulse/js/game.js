/**
 * سُونار اللوغاريتم (Log Pulse) — Lesson 4 (2BAC PC: Skills 53–62)
 * Real-Time Polar Bathyscaphe Sonar & Logarithmic Forge Arcade
 * Covers 100% of CURRICULUM.md §§ 53–62 with zero Hors-programme & full DualSense parity.
 */
(function (root) {
  'use strict';

  const ArcadeCore = root.ArcadeCore;
  const AC = ArcadeCore;
  const GAME_ID = 'log-pulse';
  const E = Math.E;

  // ---------- Helpers ----------
  function clamp(v, lo, hi) {
    return Math.max(lo, Math.min(hi, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  function angleDiff(a, b) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function renderDOMMath(el, txt) {
    if (!el) return;
    if (AC && typeof AC.renderMath === 'function') {
      AC.renderMath(el, txt);
    } else {
      el.textContent = txt;
    }
  }

  function toCanvasMath(expr) {
    return String(expr ?? '')
      .replace(/\\notin\b/g, '∉')
      .replace(/\\in\b/g, '∈')
      .replace(/\\ln\b/g, 'ln')
      .replace(/\\log\b/g, 'log')
      .replace(/\\\{/g, '{')
      .replace(/\\\}/g, '}')
      .replace(/D_\{ln\}/g, 'D_{ln}');
  }

  function drawMath(ctx, expr, x, y, opts) {
    const clean = toCanvasMath(expr);
    if (AC && AC.CanvasAxisKit && typeof AC.CanvasAxisKit.drawMathRich === 'function') {
      AC.CanvasAxisKit.drawMathRich(ctx, clean, x, y, opts || {});
    } else {
      ctx.save();
      ctx.fillStyle = (opts && opts.color) || '#f0fdfa';
      ctx.font = `700 ${(opts && opts.fontSize) || 13}px "KaTeX_Main", serif`;
      ctx.textAlign = (opts && opts.align) || 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(clean, x, y);
      ctx.restore();
    }
  }

  // ---------- Operation Metadata ----------
  const OPERATIONS = [
    {
      id: 'domain-primitive',
      title: 'المجال والأصلية لـ 1/x',
      skills: 'المهارات 53 • 56',
      waveCount: 3,
      topicIds: [53, 56]
    },
    {
      id: 'algebra-forge',
      title: 'مِصهر خواص اللوغاريتم',
      skills: 'المهارة 54',
      waveCount: 3,
      topicIds: [54]
    },
    {
      id: 'equations-uprime',
      title: 'المعادلات والنظمات و u\'/u',
      skills: 'المهارات 55 • 57',
      waveCount: 3,
      topicIds: [55, 57]
    },
    {
      id: 'growth-race',
      title: 'سباق التزايد المقارن والنهايات',
      skills: 'المهارات 58 • 59',
      waveCount: 3,
      topicIds: [58, 59]
    },
    {
      id: 'base-decibel-boss',
      title: 'الأساس a والديسيبل وزعيم المنحنى',
      skills: 'المهارات 60 • 61 • 62',
      waveCount: 3,
      topicIds: [60, 61, 62]
    }
  ];

  // ---------- Operation 1 Data (Skills 53, 56) ----------
  const OP1_MINES_STARTERS = [
    { xVal: -2, label: 'x = -2', kind: 'forbid', tip: 'مرفوض! $x = -2 \\le 0$ خارج مجموعة تعريف $\\ln$' },
    { xVal: 0.5, label: 'x = \\frac{1}{2}', kind: 'neg', tip: 'أحسنت! $0 < \\frac{1}{2} < 1$ إذن $\\ln(\\frac{1}{2}) < 0$' },
    { xVal: 1, label: 'x = 1', kind: 'zero', tip: 'قفل مثالي! $\\ln(1) = 0$ لأنها الأصلية المنعدمة في $1$' }
  ];

  const OP1_MINES_POOL = [
    { xVal: 3, label: 'x = 3', kind: 'pos', tip: 'ممتاز! $3 > 1$ إذن $\\ln(3) > 0$' },
    { xVal: 0, label: 'x = 0', kind: 'forbid', tip: 'محظور! $0 \\notin ]0, +\\infty[$ ومقارب عمودي $x = 0$' },
    { xVal: 1 / E, label: 'x = \\frac{1}{e}', kind: 'neg', tip: 'دقيق! $\\frac{1}{e} \\in ]0, 1[$ إذن $\\ln(\\frac{1}{e}) = -1 < 0$' },
    { xVal: E, label: 'x = e', kind: 'pos', tip: 'رائع! $e \\approx 2.72 > 1$ و $\\ln(e) = 1 > 0$' },
    { xVal: 1 - E, label: 'x = 1 - e', kind: 'forbid', tip: 'مرفوض! $1 - e \\approx -1.72 < 0$ خارج $]0, +\\infty[$' },
    { xVal: Math.SQRT1_2, label: 'x = \\frac{1}{\\sqrt{2}}', kind: 'neg', tip: 'سالب! $0 < \\frac{1}{\\sqrt{2}} < 1 \\implies \\ln(\\frac{1}{\\sqrt{2}}) < 0$' },
    { xVal: Math.sqrt(E), label: 'x = \\sqrt{e}', kind: 'pos', tip: 'موجب! $\\sqrt{e} > 1 \\implies \\ln(\\sqrt{e}) = \\frac{1}{2} > 0$' }
  ];

  const OP1_CALIBRATIONS = [
    { targetX: 1, tol: 0.22, targetTex: '\\ln(x) = 0', hintTex: 'x = 1', reason: 'الأصلية لـ $\\frac{1}{x}$ تنعدم عند $x = 1$ أي $\\ln(1) = 0$' },
    { targetX: E, tol: 0.24, targetTex: '\\ln(x) = 1', hintTex: 'x = e \\approx 2.72', reason: 'العدد النيبيري $e$ يحقق $\\ln(e) = 1$ ومساحة $\\frac{1}{t}$ من $1$ إلى $e$ تساوي $1$' },
    { targetX: 1 / E, tol: 0.14, targetTex: '\\ln(x) = -1', hintTex: 'x = \\frac{1}{e} \\approx 0.37', reason: 'عند $x = \\frac{1}{e}$ نحصل على $\\ln(\\frac{1}{e}) = -\\ln(e) = -1$' }
  ];

  const OP1_DOMAIN_WALLS = [
    {
      exprTex: '\\ln(x - 1)',
      prompt: 'احتمِ داخل مجموعة تعريف $f(x) = \\ln(x - 1)$ واضغط $[\\times]$ قبل موجة الضغط!',
      valid: (x) => x > 1.03,
      startX: -0.4,
      boundX: [1],
      reason: 'شرط التعريف $x - 1 > 0 \\iff x > 1$ أي $D_f = ]1, +\\infty[$'
    },
    {
      exprTex: '\\ln(3 - x)',
      prompt: 'احتمِ داخل مجموعة تعريف $f(x) = \\ln(3 - x)$ واضغط $[\\times]$!',
      valid: (x) => x < 2.97,
      startX: 3.7,
      boundX: [3],
      reason: 'شرط التعريف $3 - x > 0 \\iff x < 3$ أي $D_f = ]-\\infty, 3[$'
    },
    {
      exprTex: '\\ln(x^2 - 1)',
      prompt: 'احتمِ داخل مجموعة تعريف $f(x) = \\ln(x^2 - 1)$ واضغط $[\\times]$!',
      valid: (x) => Math.abs(x) > 1.04,
      startX: 0.0,
      boundX: [-1, 1],
      reason: 'شرط التعريف $x^2 - 1 > 0 \\iff x \\in ]-\\infty,-1[ \\cup ]1,+\\infty[$'
    },
    {
      exprTex: '\\ln(4 - x^2)',
      prompt: 'احتمِ داخل مجموعة تعريف $f(x) = \\ln(4 - x^2)$ واضغط $[\\times]$!',
      valid: (x) => Math.abs(x) < 1.96,
      startX: -2.85,
      boundX: [-2, 2],
      reason: 'شرط التعريف $4 - x^2 > 0 \\iff x \\in ]-2, 2[$'
    }
  ];

  // ---------- Operation 2 Data (Skill 54: Algebraic Properties) ----------
  const OP2_WAVES = [
    // Wave 1: Product & Quotient
    [
      {
        chamberVal: 2, chamberTex: '\\ln 2', targetTex: '\\ln 6',
        op: 'mul', answerVal: 3, answerTex: '\\ln 3',
        decoys: [{ v: 4, tex: '\\ln 4' }, { v: 2, tex: '\\ln 2' }, { v: 5, tex: '\\ln 5' }],
        proof: '$\\ln(2) + \\ln(3) = \\ln(2 \\times 3) = \\ln(6)$'
      },
      {
        chamberVal: 12, chamberTex: '\\ln 12', targetTex: '\\ln 4',
        op: 'div', answerVal: 3, answerTex: '\\ln 3',
        decoys: [{ v: 8, tex: '\\ln 8' }, { v: 4, tex: '\\ln 4' }, { v: 6, tex: '\\ln 6' }],
        proof: '$\\ln(12) - \\ln(3) = \\ln(\\frac{12}{3}) = \\ln(4)$'
      },
      {
        chamberVal: 5, chamberTex: '\\ln 5', targetTex: '\\ln 15',
        op: 'mul', answerVal: 3, answerTex: '\\ln 3',
        decoys: [{ v: 10, tex: '\\ln 10' }, { v: 2, tex: '\\ln 2' }, { v: 5, tex: '\\ln 5' }],
        proof: '$\\ln(5) + \\ln(3) = \\ln(15)$'
      },
      {
        chamberVal: 10, chamberTex: '\\ln 10', targetTex: '\\ln 2',
        op: 'div', answerVal: 5, answerTex: '\\ln 5',
        decoys: [{ v: 8, tex: '\\ln 8' }, { v: 2, tex: '\\ln 2' }, { v: 4, tex: '\\ln 4' }],
        proof: '$\\ln(10) - \\ln(5) = \\ln(\\frac{10}{5}) = \\ln(2)$'
      }
    ],
    // Wave 2: Reciprocal & Rational Powers
    [
      {
        chamberVal: 1, chamberTex: '-\\ln b', targetTex: '\\ln\\frac{1}{5}',
        op: 'inv', answerVal: 5, answerTex: '\\ln 5',
        decoys: [{ v: 2, tex: '\\ln 2' }, { v: 3, tex: '\\ln 3' }, { v: 10, tex: '\\ln 10' }],
        proof: '$-\\ln(5) = \\ln(\\frac{1}{5})$'
      },
      {
        chamberVal: 1, chamberTex: 'r\\ln a', targetTex: '\\ln 8',
        op: 'pow', reqExp: 3, answerVal: 2, answerTex: '\\ln 2',
        decoys: [{ v: 4, tex: '\\ln 4' }, { v: 3, tex: '\\ln 3' }, { v: 5, tex: '\\ln 5' }],
        proof: '$3\\ln(2) = \\ln(2^3) = \\ln(8)$'
      },
      {
        chamberVal: 1, chamberTex: 'r\\ln a', targetTex: '\\ln\\sqrt{7}',
        op: 'pow', reqExp: 0.5, answerVal: 7, answerTex: '\\ln 7',
        decoys: [{ v: 3, tex: '\\ln 3' }, { v: 14, tex: '\\ln 14' }, { v: 2, tex: '\\ln 2' }],
        proof: '$\\frac{1}{2}\\ln(7) = \\ln(7^{1/2}) = \\ln(\\sqrt{7})$'
      },
      {
        chamberVal: 1, chamberTex: 'r\\ln a', targetTex: '\\ln 9',
        op: 'pow', reqExp: 2, answerVal: 3, answerTex: '\\ln 3',
        decoys: [{ v: 2, tex: '\\ln 2' }, { v: 6, tex: '\\ln 6' }, { v: 5, tex: '\\ln 5' }],
        proof: '$2\\ln(3) = \\ln(3^2) = \\ln(9)$'
      }
    ],
    // Wave 3: Mixed Forge Storm (includes non-unit rational exponent r = 3/2)
    [
      {
        chamberVal: E, chamberTex: 'r\\ln a', targetTex: '2',
        op: 'pow', reqExp: 2, answerVal: E, answerTex: '\\ln e',
        decoys: [{ v: 2, tex: '\\ln 2' }, { v: 4, tex: '\\ln 4' }, { v: 3, tex: '\\ln 3' }],
        proof: '$2\\ln(e) = \\ln(e^2) = 2$'
      },
      {
        chamberVal: 1, chamberTex: '-\\ln b', targetTex: '-1',
        op: 'inv', answerVal: E, answerTex: '\\ln e',
        decoys: [{ v: 2, tex: '\\ln 2' }, { v: 10, tex: '\\ln 10' }, { v: 3, tex: '\\ln 3' }],
        proof: '$-\\ln(e) = \\ln(\\frac{1}{e}) = -1$'
      },
      {
        chamberVal: 18, chamberTex: '\\ln 18', targetTex: '\\ln 6',
        op: 'div', answerVal: 3, answerTex: '\\ln 3',
        decoys: [{ v: 12, tex: '\\ln 12' }, { v: 2, tex: '\\ln 2' }, { v: 9, tex: '\\ln 9' }],
        proof: '$\\ln(18) - \\ln(3) = \\ln(6)$'
      },
      {
        chamberVal: 1, chamberTex: 'r\\ln a', targetTex: '\\ln 8',
        op: 'pow', reqExp: 1.5, answerVal: 4, answerTex: '\\ln 4',
        decoys: [{ v: 3, tex: '\\ln 3' }, { v: 6, tex: '\\ln 6' }, { v: 16, tex: '\\ln 16' }],
        proof: '$\\frac{3}{2}\\ln(4) = \\ln(4^{3/2}) = \\ln(8)$'
      }
    ]
  ];

  // ---------- Operation 3 Data (Skills 55, 57) ----------
  const OP3_WALLS = [
    {
      eqTex: '\\ln(x - 1) = \\ln(3)',
      prompt: 'اخترق بوابة الحل الصحيح للمعادلة $\\ln(x - 1) = \\ln(3)$ داخل $D_E = ]1, +\\infty[$!',
      chutes: [
        { label: 'x = 2', ok: false, reason: 'خطأ: $2 - 1 = 1 \\neq 3$' },
        { label: 'x = 4', ok: true, reason: 'صحيح! $x - 1 = 3 \\iff x = 4 \\in ]1, +\\infty[$' },
        { label: 'x = -2', ok: false, reason: 'فخ المجال! $x = -2 \\notin ]1, +\\infty[$' }
      ]
    },
    {
      eqTex: '\\ln(x^2 - 3) = \\ln(x - 1)',
      prompt: 'انتبه لفخ $D_E$ في $\\ln(x^2 - 3) = \\ln(x - 1)$! اختر الحل المقبول فقط:',
      chutes: [
        { label: 'x = -1', ok: false, reason: 'فخ البكالوريا! $x=-1$ يلغي شرط $x-1>0$ فهو مرفوض!' },
        { label: 'x = 2', ok: true, reason: 'برافو! $x^2-x-2=0 \\Rightarrow x=2$ مقبول لأن $2>\\sqrt{3}$' },
        { label: 'x = 0', ok: false, reason: 'خارج مجموعة التعريف ($0 - 1 < 0$)' }
      ]
    },
    {
      eqTex: '\\ln(x) + \\ln(x - 2) = \\ln(3)',
      prompt: 'استعمل خاصية الجداء وشرط $D_E$ لحل $\\ln(x) + \\ln(x - 2) = \\ln(3)$!',
      chutes: [
        { label: 'x = 3', ok: true, reason: 'ممتاز! $x(x-2)=3 \\Rightarrow x\\in\\{-1,3\\}$ وبشرط $x>2$ الحل $x=3$' },
        { label: 'S = \\{-1, 3\\}', ok: false, reason: 'انتبه لـ $D_E = ]2, +\\infty[$! الحل $x=-1$ مرفوض' },
        { label: 'x = 1', ok: false, reason: 'مرفوض! $1 - 2 = -1 < 0$ خارج $D_E$' }
      ]
    },
    {
      eqTex: '(\\ln x)^2 - 3\\ln x + 2 = 0',
      prompt: 'بوضع $X = \\ln x$: اخترق بوابة مجموعة حلول $(\\ln x)^2 - 3\\ln x + 2 = 0$!',
      chutes: [
        { label: 'S = \\{1, 2\\}', ok: false, reason: 'انتبه! $X \\in \\{1, 2\\}$ هي قيم $\\ln x$ وليست $x$' },
        { label: 'S = \\{-e, e^2\\}', ok: false, reason: 'مرفوض! $-e < 0$ خارج $]0, +\\infty[$' },
        { label: 'S = \\{e, e^2\\}', ok: true, reason: 'ممتاز! $\\ln x = 1 \\Rightarrow x=e$ و $\\ln x = 2 \\Rightarrow x=e^2$' }
      ]
    }
  ];

  const OP3_INEQS = [
    {
      tex: '\\ln(x - 1) \\le 0',
      prompt: 'المتراجحة $\\ln(x - 1) \\le 0$: قد الغواصة إلى مجال الحلول داخل $D_E$ واضغط $[\\times]$ قبل العاصفة!',
      formulaHint: 'المتراجحة: $\\ln(x - 1) \\le 0$ • تذكّر شرط $D_E$ و $\\ln(1) = 0$',
      curveFn: (x) => Math.log(x - 1),
      asymX: 1,
      startX: 0.15,
      valid: (x) => x > 1.03 && x <= 2.04,
      proof: 'برافو! $\\ln(x-1)\\le 0 \\iff 0<x-1\\le 1 \\iff x\\in ]1, 2]$',
      failReason: (x) => (x <= 1.03 ? 'خارج $D_E$! يلزم $x-1>0$ أي $x>1$' : 'هنا $\\ln(x-1) > 0$! ابحث أين $0 < x - 1 \\le 1$'),
      callout: '✓ ]1, 2]'
    },
    {
      tex: '\\ln(2x - 3) > 0',
      prompt: 'المتراجحة $\\ln(2x - 3) > 0$: قد الغواصة إلى مجال الحلول واضغط $[\\times]$ قبل العاصفة!',
      formulaHint: 'المتراجحة: $\\ln(2x - 3) > 0$ • متى يكون ما بداخل $\\ln$ أكبر قطعاً من $1$؟',
      curveFn: (x) => Math.log(2 * x - 3),
      asymX: 1.5,
      startX: 0.6,
      valid: (x) => x > 2.04,
      proof: 'دقيق! $\\ln(2x-3)>0 \\iff 2x-3>1 \\iff x > 2$ أي $S = ]2, +\\infty[$',
      failReason: (x) => (x <= 1.52 ? 'خارج $D_E$! يلزم $2x-3>0$ أي $x>\\frac{3}{2}$' : 'هنا $0 < 2x-3 \\le 1$ إذن $\\ln(2x-3) \\le 0$!'),
      callout: '✓ ]2,+∞['
    }
  ];

  const OP3_UPRIME = [
    {
      mode: 'deriv',
      coreTex: '\\ln(x^2 + 1)',
      prompt: 'طور الاشتقاق: صوّب في الفجوة (تجنّب الدرع الأحمر!) نحو مشتقة $\\ln(x^2 + 1)$ واضغط $[\\times]$ أو $[▢/△/◯]$!',
      pods: [
        { tex: '\\frac{2x}{x^2+1}', ok: true, proof: '$(\\ln(x^2+1))\' = \\frac{(x^2+1)\'}{x^2+1} = \\frac{2x}{x^2+1}$' },
        { tex: '\\frac{1}{x^2+1}', ok: false, proof: 'نسيت مشتقة الداخل $u\'(x) = 2x$!' },
        { tex: '\\frac{x}{x^2+1}', ok: false, proof: 'مشتقة $x^2+1$ هي $2x$ وليس $x$' }
      ]
    },
    {
      mode: 'deriv',
      coreTex: '\\ln|2x - 3|',
      prompt: 'طور الاشتقاق: وجّه الشعاع نحو مشتقة $\\ln|2x - 3|$ على $\\mathbb{R}\\setminus\\{\\frac{3}{2}\\}$!',
      pods: [
        { tex: '\\frac{1}{2x-3}', ok: false, proof: 'مشتقة $2x-3$ هي $2$ وليس $1$!' },
        { tex: '\\frac{2}{2x-3}', ok: true, proof: '$(\\ln|2x-3|)\' = \\frac{2}{2x-3}$' },
        { tex: '\\frac{-3}{2x-3}', ok: false, proof: 'العدد $-3$ ثابت ومشتقته $0$' }
      ]
    },
    {
      mode: 'prim',
      coreTex: '\\frac{3x^2}{x^3 + 1}',
      prompt: 'طور الأصلية: التقط الدالة الأصلية لـ $\\frac{3x^2}{x^3 + 1}$ (على شكل $\\frac{u\'}{u}$)!',
      pods: [
        { tex: '\\frac{1}{3}\\ln|x^3+1|', ok: false, proof: 'البسط $3x^2$ يساوي بالضبط $u\'(x)$ بلا معامل إضافي!' },
        { tex: '3\\ln|x^3+1|', ok: false, proof: 'اشتقاق $3\\ln|x^3+1|$ يعطي $\\frac{9x^2}{x^3+1}$' },
        { tex: '\\ln|x^3+1| + C', ok: true, proof: 'بما أن $(x^3+1)\' = 3x^2$ فإن الأصلية هي $\\ln|x^3+1| + C$' }
      ]
    },
    {
      mode: 'prim',
      coreTex: '\\frac{x}{x^2 + 4}',
      prompt: 'طور الأصلية: اضبط المعامل لالتقاط أصلية $\\frac{x}{x^2 + 4} = \\frac{1}{2}\\cdot\\frac{2x}{x^2+4}$!',
      pods: [
        { tex: '\\ln(x^2+4) + C', ok: false, proof: 'مشتقة $\\ln(x^2+4)$ هي $\\frac{2x}{x^2+4}$ (ينقص معامل $\\frac{1}{2}$)' },
        { tex: '\\frac{1}{2}\\ln(x^2+4) + C', ok: true, proof: 'أبدعت! $\\frac{x}{x^2+4} = \\frac{1}{2}\\frac{u\'}{u} \\Rightarrow \\frac{1}{2}\\ln(x^2+4) + C$' },
        { tex: '2\\ln(x^2+4) + C', ok: false, proof: 'المعامل الصحيح هو $\\frac{1}{2}$ وليس $2$' }
      ]
    },
    {
      mode: 'prim',
      coreTex: '\\frac{1}{2x + 1}',
      prompt: 'طور الأصلية: استنتج الدالة الأصلية لـ $\\frac{1}{2x + 1}$ على $]-\\frac{1}{2}, +\\infty[$!',
      pods: [
        { tex: '\\frac{1}{2}\\ln|2x+1| + C', ok: true, proof: 'ممتاز! $\\frac{1}{2x+1} = \\frac{1}{2}\\cdot\\frac{(2x+1)\'}{2x+1} \\mapsto \\frac{1}{2}\\ln|2x+1|+C$' },
        { tex: '\\ln|2x+1| + C', ok: false, proof: 'اشتقاق $\\ln|2x+1|$ يعطي $\\frac{2}{2x+1}$ وليس $\\frac{1}{2x+1}$' },
        { tex: '2\\ln|2x+1| + C', ok: false, proof: 'يجب القسمة على $2$ لا الضرب فيها!' }
      ]
    }
  ];

  // ---------- Operation 4 Data (Skills 58, 59: Standard Limits & Comparative Growth) ----------
  const OP4_RUNS = [
    // Wave 1
    [
      {
        tex: '\\lim_{x\\to 0^+} \\ln x',
        mineLabel: '0^+',
        mineKey: 'circle',
        lane: 3, // 0:+inf, 1:1, 2:0, 3:-inf
        fn: (u) => -0.6 - 2.2 * Math.pow(u, 2.2),
        proof: '$\\lim_{x\\to 0^+} \\ln x = -\\infty$ (مقارب عمودي $x=0$)'
      },
      {
        tex: '\\lim_{x\\to +\\infty} \\frac{\\ln x}{x}',
        mineLabel: '\\frac{\\infty}{\\infty}',
        mineKey: 'square',
        lane: 2,
        fn: (u) => { const x = 1.5 + u * 28; return Math.log(x) / x * 2.2; },
        proof: 'التزايد المقارن: القوة $x$ تغلب $\\ln x$ إذن $\\lim_{x\\to+\\infty}\\frac{\\ln x}{x} = 0^+$'
      },
      {
        tex: '\\lim_{x\\to 0^+} x\\ln x',
        mineLabel: '0 \\times \\infty',
        mineKey: 'square',
        lane: 2,
        fn: (u) => { const x = Math.max(0.005, 0.55 * (1 - u * 0.985)); return x * Math.log(x) * 2.4; },
        proof: 'التزايد المقارن عند $0^+$: $\\lim_{x\\to 0^+} x\\ln x = 0^-$'
      }
    ],
    // Wave 2
    [
      {
        tex: '\\lim_{x\\to 1} \\frac{\\ln x}{x - 1}',
        mineLabel: '\\frac{0}{0}',
        mineKey: 'triangle',
        lane: 1,
        fn: (u) => { const x = 0.25 + u * 0.74; return Math.log(x) / (x - 1); },
        proof: 'العدد المشتق لـ $\\ln$ في $1$: $\\lim_{x\\to 1}\\frac{\\ln x}{x-1} = \\ln\'(1) = 1$'
      },
      {
        tex: '\\lim_{x\\to 0} \\frac{\\ln(1 + x)}{x}',
        mineLabel: '\\frac{0}{0}',
        mineKey: 'triangle',
        lane: 1,
        fn: (u) => { const x = 0.85 * (1 - u * 0.98) + 0.01; return Math.log(1 + x) / x; },
        proof: 'نهاية أساسية: $\\lim_{x\\to 0}\\frac{\\ln(1+x)}{x} = 1$'
      },
      {
        tex: '\\lim_{x\\to +\\infty} \\ln x',
        mineLabel: '+\\infty',
        mineKey: 'circle',
        lane: 0,
        fn: (u) => 0.3 + Math.log(1 + u * 22) * 0.65,
        proof: '$\\lim_{x\\to +\\infty} \\ln x = +\\infty$ (ببطء، فرع شلجمي اتجاهه $(Ox)$)'
      }
    ],
    // Wave 3 (Generalized comparative growth x^n and sqrt(x))
    [
      {
        tex: '\\lim_{x\\to +\\infty} \\frac{\\ln x}{x^3}',
        mineLabel: '\\frac{\\infty}{\\infty}',
        mineKey: 'square',
        lane: 2,
        fn: (u) => { const x = 1.2 + u * 6; return (Math.log(x) / (x * x * x)) * 3.8; },
        proof: 'لكل $n\\in\\mathbb{N}^*$: $\\lim_{x\\to+\\infty}\\frac{\\ln x}{x^n} = 0$'
      },
      {
        tex: '\\lim_{x\\to 0^+} x^2\\ln x',
        mineLabel: '0 \\times \\infty',
        mineKey: 'square',
        lane: 2,
        fn: (u) => { const x = Math.max(0.004, 0.65 * (1 - u * 0.985)); return x * x * Math.log(x) * 3.0; },
        proof: 'لكل $n\\in\\mathbb{N}^*$: $\\lim_{x\\to 0^+} x^n\\ln x = 0^-$'
      },
      {
        tex: '\\lim_{x\\to +\\infty} \\frac{\\ln x}{\\sqrt{x}}',
        mineLabel: 't=\\sqrt{x}',
        mineKey: 'square',
        lane: 2,
        fn: (u) => { const x = 1.5 + u * 55; return (Math.log(x) / Math.sqrt(x)) * 1.4; },
        proof: 'بوضع $t=\\sqrt{x}$: $\\frac{\\ln x}{\\sqrt{x}} = 2\\frac{\\ln t}{t} \\to 0$'
      },
      {
        tex: '\\lim_{x\\to 0^+} \\sqrt{x}\\ln x',
        mineLabel: '0 \\times \\infty',
        mineKey: 'square',
        lane: 2,
        fn: (u) => { const x = Math.max(0.002, 0.5 * (1 - u * 0.99)); return Math.sqrt(x) * Math.log(x) * 1.1; },
        proof: 'بوضع $t=\\sqrt{x}\\to 0^+$: $2t\\ln t \\to 0^-$'
      }
    ]
  ];

  // ---------- Operation 5 Data (Skills 60, 61, 62) ----------
  const BASE_OPTIONS = [
    { a: 0.25, tex: '\\frac{1}{4}', inc: false },
    { a: 0.5, tex: '\\frac{1}{2}', inc: false },
    { a: 2, tex: '2', inc: true },
    { a: E, tex: 'e', inc: true },
    { a: 10, tex: '10', inc: true }
  ];

  const OP5_BASE_BEACONS = [
    { bx: 2, by: 1, label: '(2, 1)', reqIdx: 2, prompt: 'اضبط الأساس $a$ بـ $[L2/R2]$ أو الأسهم ليمر $\\log_a(x)$ بالنقطة $(2, 1)$ ثم اضغط $[\\times]$!', proof: '$\\log_2(2) = 1$ (دالة تزايدية لأن $a = 2 > 1$)' },
    { bx: 4, by: -2, label: '(4, -2)', reqIdx: 1, prompt: 'اقلب الأساس نحو $0 < a < 1$ ليمر $\\log_a(x)$ بـ $(4, -2)$ ثم اضغط $[\\times]$!', proof: '$\\log_{1/2}(4) = \\frac{\\ln 4}{-\\ln 2} = -2$ (دالة تناقصية لأن $0 < \\frac{1}{2} < 1$)' },
    { bx: E, by: 1, label: '(e, 1)', reqIdx: 3, prompt: 'اضبط الأساس على العدد النيبيري $e$ ليمر المنحنى بـ $(e, 1)$ ثم اضغط $[\\times]$!', proof: '$\\log_e(x) = \\ln(x)$ و $\\ln(e) = 1$' },
    { bx: 4, by: -1, label: '(4, -1)', reqIdx: 0, prompt: 'اضبط الأساس التناقصي $a$ ليمر المنحنى بـ $(4, -1)$ ثم اضغط $[\\times]$!', proof: '$\\log_{1/4}(4) = -1$ ومشتقتها $\\frac{1}{x\\ln(1/4)} < 0$' },
    { bx: Math.sqrt(10), by: 0.5, label: '(\\sqrt{10},\\frac{1}{2})', reqIdx: 4, prompt: 'اضبط الأساس العشري ليمر المنحنى بـ $(\\sqrt{10}, \\frac{1}{2})$ ثم اضغط $[\\times]$!', proof: '$\\log_{10}(\\sqrt{10}) = \\log(10^{1/2}) = \\frac{1}{2}$ (اللوغاريتم العشري)' }
  ];

  const OP5_DECIBEL_WAVES = [
    { tex: '10^x = 100', mode: 'eq', target: 2, tol: 0.34, proof: '$10^x = 100 \\iff x = \\log(10^2) = 2$' },
    { tex: '10^x = 0.1', mode: 'eq', target: -1, tol: 0.34, proof: '$10^x = 10^{-1} \\iff x = \\log(0.1) = -1$' },
    { tex: '10^x = 1000', mode: 'eq', target: 3, tol: 0.34, proof: '$10^x = 10^3 \\iff x = \\log(1000) = 3$' },
    { tex: '10^x \\le 10', mode: 'le', bound: 1, proof: '$10^x \\le 10^1 \\iff x \\le \\log(10) = 1$' },
    { tex: '10^x \\ge 100', mode: 'ge', bound: 2, proof: '$10^x \\ge 10^2 \\iff x \\ge \\log(100) = 2$' }
  ];

  // ---------- Main Game Class ----------
  class LogPulseGame {
    constructor() {
      this.canvas = document.getElementById('sonarCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.audio = new root.LogSonarAudio();

      // DOM References
      this.elHull = document.getElementById('hudHull');
      this.elScore = document.getElementById('hudScore');
      this.elCombo = document.getElementById('hudCombo');
      this.elOpBadge = document.getElementById('hudOpBadge');
      this.elSkills = document.getElementById('hudSkills');
      this.elWavePips = document.getElementById('wavePips');
      this.elPrompt = document.getElementById('hudPrompt');
      this.elFormulaBar = document.getElementById('hudFormulaBar');
      this.elLiveReadout = document.getElementById('liveReadout');
      this.elToast = document.getElementById('sonarToast');
      this.elGpBadge = document.getElementById('gpBadge');
      this.elGpLabel = document.getElementById('gpLabel');
      this.elResult = document.getElementById('resultOverlay');

      this.opTabs = Array.from(document.querySelectorAll('.op-tab'));
      this.deckBtns = {
        cross: document.getElementById('actCross'),
        square: document.getElementById('actSquare'),
        triangle: document.getElementById('actTriangle'),
        circle: document.getElementById('actCircle'),
        l2: document.getElementById('actL2'),
        r2: document.getElementById('actR2'),
        trigPair: document.getElementById('triggerPair')
      };
      this.deckLbls = {
        cross: document.getElementById('lblCross'),
        square: document.getElementById('lblSquare'),
        triangle: document.getElementById('lblTriangle'),
        circle: document.getElementById('lblCircle'),
        l2: document.getElementById('lblL2'),
        r2: document.getElementById('lblR2')
      };

      // Global Gameplay State
      this.W = 1280;
      this.H = 720;
      this.dpr = 1;
      this.play = { x: 40, y: 110, w: 1200, h: 500 };

      this.opIdx = 0;
      this.waveIdx = 0;
      this.clearedOps = new Set();
      this.hull = 4;
      this.maxHull = 4;
      this.score = 0;
      this.combo = 1;
      this.maxCombo = 1;
      this.correctCount = 0;
      this.totalAttempts = 0;

      this.time = 0;
      this.hitStop = 0;
      this.shakeTime = 0;
      this.shakeAmp = 0;
      this.damageFlash = 0;
      this.invulnTimer = 0;
      this.waveGuard = 0;
      this.radarAngle = 0;
      this.paused = false;
      this.resultOpen = false;
      this.resultFocusIdx = 0;
      this.toastTimer = 0;
      this.lastReadoutKey = '';
      this.deckMode = 'quad';
      this.lastActionAt = Object.create(null);
      this.lastLockKey = '';
      this.lastSweetSpot = false;
      this.lastWarnSec = -1;

      // Particles, shockwaves, floating callouts, submarine wake trail
      this.particles = [];
      this.rings = [];
      this.callouts = [];
      this.trail = [];
      this.ambientDots = Array.from({ length: 44 }, (_, i) => ({
        x: ((i * 73) % 100) / 100,
        y: ((i * 41) % 100) / 100,
        r: 1 + (i % 3) * 0.6,
        spd: 0.008 + (i % 5) * 0.004,
        teal: i % 3 !== 0
      }));

      // Input state (mode-tracked so idle mouse NEVER hijacks keyboard or DualSense!)
      this.keys = Object.create(null);
      this.inputMode = 'idle';
      this.pointer = { active: false, down: false, x: 640, y: 360, moved: false, startX: 640, startY: 360 };
      this.dpadVec = { x: 0, y: 0 };
      this.gpState = ArcadeCore && ArcadeCore.Gamepad ? ArcadeCore.Gamepad.createState() : null;
      this.lastFrameAt = performance.now();

      // Operation-specific live state
      this.opState = {};

      // Pause Menu (Start button 9 / Esc / P)
      this.pauseMenu = ArcadeCore && ArcadeCore.PauseMenu ? ArcadeCore.PauseMenu.attach({
        title: 'سُونار اللوغاريتم — إيقاف مؤقت',
        subtitle: 'الدرس 4 (2BAC PC): الدوال اللوغاريتمية (المهارات 53–62)',
        gpState: this.gpState,
        exitUrl: '../../index.html?from=game',
        controlsHelp: [
          'عصا اليسار / D-Pad / WASD / الماوس: توجيه الغواصة وتدوير السونار 360°',
          'عصا اليمين (Right Stick): تصويب فائق الدقة ومعايرة منحنى ln و log_a',
          '✕ (Space / نقر): نبضة القفل / صهر الجداء / اختراق البوابة / الرنين',
          '▢ / △ / ◯ (J / K / L): نبضات الإشارة والمجال والخارج والمقلوب والقوى',
          'L2 / R2 (Q / E): ضبط الأس r أو تبديل الأساس log_a لحظياً',
          'L1 / R1 (Tab / Shift+Tab): التنقل بين العمليات الصوتية الخمس'
        ],
        onPause: () => { this.paused = true; },
        onResume: () => { this.paused = false; this.lastFrameAt = performance.now(); },
        onRestart: () => { this.startOperation(this.opIdx, true); }
      }) : null;

      this.bindEvents();
      this.resize();
      this.startOperation(0, true);
      requestAnimationFrame((t) => this.loop(t));
    }

    isSinglePrimaryActionWave() {
      if (this.opIdx === 0 && (this.waveIdx === 1 || this.waveIdx === 2)) return true;
      if (this.opIdx === 2) return true;
      if (this.opIdx === 4 && (this.waveIdx === 0 || this.waveIdx === 1)) return true;
      return false;
    }

    bindEvents() {
      root.addEventListener('resize', () => this.resize());

      this.opTabs.forEach((btn) => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-op') || 0);
          this.audio.playPulse('cross');
          this.startOperation(idx, false);
        });
      });

      document.getElementById('btnPause')?.addEventListener('click', () => {
        this.pauseMenu?.toggle();
      });

      document.getElementById('btnMute')?.addEventListener('click', () => {
        const m = this.audio.toggleMute();
        const el = document.getElementById('btnMute');
        if (el) el.textContent = m ? '🔇' : '🔊';
      });

      // Bottom Tactile Action Deck
      ['cross', 'square', 'triangle', 'circle', 'l2', 'r2'].forEach((act) => {
        const btn = this.deckBtns[act];
        if (!btn) return;
        btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.flashPad(act);
          this.triggerAction(act);
        });
      });

      // Result Overlay buttons
      document.getElementById('btnResNext')?.addEventListener('click', () => {
        this.hideResult();
        const nextOp = (this.opIdx + 1) % OPERATIONS.length;
        this.startOperation(nextOp, true);
      });
      document.getElementById('btnResRetry')?.addEventListener('click', () => {
        this.hideResult();
        this.startOperation(this.opIdx, true);
      });

      // Keyboard
      root.addEventListener('keydown', (e) => {
        if (this.pauseMenu && this.pauseMenu.isOpen()) return;
        const wasDown = Boolean(this.keys[e.code]);
        this.keys[e.code] = true;

        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
          this.inputMode = 'keyboard';
        }

        if (this.resultOpen) {
          if (e.code === 'Enter' || e.code === 'Space') {
            e.preventDefault();
            const btns = this.getResultBtns();
            btns[this.resultFocusIdx]?.click();
          } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
            e.preventDefault();
            this.moveResultFocus(-1);
          } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
            e.preventDefault();
            this.moveResultFocus(1);
          } else if (e.code === 'KeyR') {
            e.preventDefault();
            document.getElementById('btnResRetry')?.click();
          }
          return;
        }

        // Edge-triggered discrete base flip on Op 5 Wave 1 via ArrowLeft/Right or A/D
        if (!wasDown && this.opIdx === 4 && this.waveIdx === 0) {
          if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            e.preventDefault();
            this.flashPad('l2');
            this.triggerAction('l2');
            return;
          }
          if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            e.preventDefault();
            this.flashPad('r2');
            this.triggerAction('r2');
            return;
          }
        }

        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          if (!wasDown) { this.flashPad('cross'); this.triggerAction('cross'); }
        } else if (e.code === 'KeyJ' || e.code === 'KeyZ' || e.code === 'Digit1') {
          e.preventDefault();
          if (!wasDown) { this.flashPad('square'); this.triggerAction('square'); }
        } else if (e.code === 'KeyK' || e.code === 'KeyX' || e.code === 'Digit2') {
          e.preventDefault();
          if (!wasDown) { this.flashPad('triangle'); this.triggerAction('triangle'); }
        } else if (e.code === 'KeyL' || e.code === 'KeyC' || e.code === 'Digit3') {
          e.preventDefault();
          if (!wasDown) { this.flashPad('circle'); this.triggerAction('circle'); }
        } else if (e.code === 'KeyQ') {
          e.preventDefault();
          if (!wasDown) { this.flashPad('l2'); this.triggerAction('l2'); }
        } else if (e.code === 'KeyE') {
          e.preventDefault();
          if (!wasDown) { this.flashPad('r2'); this.triggerAction('r2'); }
        } else if (e.code === 'Tab') {
          e.preventDefault();
          const dir = e.shiftKey ? -1 : 1;
          this.startOperation((this.opIdx + dir + OPERATIONS.length) % OPERATIONS.length, false);
        } else if (e.code === 'BracketRight') {
          e.preventDefault();
          this.startOperation((this.opIdx + 1) % OPERATIONS.length, false);
        } else if (e.code === 'BracketLeft') {
          e.preventDefault();
          this.startOperation((this.opIdx - 1 + OPERATIONS.length) % OPERATIONS.length, false);
        } else if (e.code === 'KeyM') {
          const m = this.audio.toggleMute();
          const el = document.getElementById('btnMute');
          if (el) el.textContent = m ? '🔇' : '🔊';
        }
      });

      root.addEventListener('keyup', (e) => {
        this.keys[e.code] = false;
      });

      // Canvas Pointer / Touch (distinguishes drag vs tap; never misfires cross on multi-weapon waves!)
      this.canvas.addEventListener('pointerdown', (e) => {
        if (this.paused || this.resultOpen) return;
        const rect = this.canvas.getBoundingClientRect();
        this.inputMode = 'pointer';
        this.pointer.active = true;
        this.pointer.down = true;
        this.pointer.moved = false;
        this.pointer.startX = e.clientX - rect.left;
        this.pointer.startY = e.clientY - rect.top;
        this.pointer.x = this.pointer.startX;
        this.pointer.y = this.pointer.startY;
        this.applyPointerImmediate();
      });

      this.canvas.addEventListener('pointermove', (e) => {
        if (this.paused || this.resultOpen) return;
        const rect = this.canvas.getBoundingClientRect();
        const nx = e.clientX - rect.left;
        const ny = e.clientY - rect.top;
        const movedDelta = dist(nx, ny, this.pointer.x, this.pointer.y);
        if (movedDelta > 3.5 || this.pointer.down) {
          this.inputMode = 'pointer';
          this.pointer.active = true;
        }
        if (this.pointer.down && dist(nx, ny, this.pointer.startX, this.pointer.startY) > 12) {
          this.pointer.moved = true;
        }
        this.pointer.x = nx;
        this.pointer.y = ny;
      });

      this.canvas.addEventListener('pointerup', () => {
        if (this.paused || this.resultOpen) return;
        const wasTap = this.pointer.down && !this.pointer.moved;
        this.pointer.down = false;
        if (wasTap) {
          if (this.isSinglePrimaryActionWave()) {
            this.flashPad('cross');
            this.triggerAction('cross');
          } else {
            // On multi-weapon waves, canvas tap cleanly locks aim/position with a tactile sonar blip
            this.audio.playLockTick(false);
            this.spawnRing(this.pointer.x, this.pointer.y, '#5eead4', 38);
          }
        }
      });

      this.canvas.addEventListener('pointerleave', () => {
        this.pointer.down = false;
      });
    }

    resize() {
      const wrap = document.getElementById('sonarStageWrap');
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      this.W = Math.max(320, Math.floor(rect.width));
      this.H = Math.max(360, Math.floor(rect.height));
      this.dpr = Math.min(2, root.devicePixelRatio || 1);
      this.canvas.width = Math.floor(this.W * this.dpr);
      this.canvas.height = Math.floor(this.H * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

      const isMobile = this.W <= 680;
      const topPad = isMobile ? 114 : 114;
      const botPad = isMobile
        ? (this.deckMode === 'triggers' ? 186 : (this.deckMode === 'single' ? 108 : 146))
        : 108;
      const sidePad = isMobile ? 16 : Math.max(30, this.W * 0.045);
      this.play = {
        x: sidePad,
        y: topPad,
        w: Math.max(240, this.W - sidePad * 2),
        h: Math.max(170, this.H - topPad - botPad)
      };

      // Keep active mines cleanly inside resized viewport
      if (this.opState && Array.isArray(this.opState.mines)) {
        for (const m of this.opState.mines) {
          m.px = clamp(m.px, this.play.x + 34, this.play.x + this.play.w - 34);
          m.py = clamp(m.py, this.play.y + 24, this.play.y + this.play.h - 34);
        }
      }
    }

    clampLabelX(px, pad = 46) {
      return clamp(px, this.play.x + pad, this.play.x + this.play.w - pad);
    }

    pushTrail(x, y, color = '#2dd4bf') {
      const last = this.trail[this.trail.length - 1];
      if (!last || dist(last.x, last.y, x, y) >= 5) {
        this.trail.push({ x, y, life: 0.42, maxLife: 0.42, color });
        if (this.trail.length > 26) this.trail.shift();
      }
    }

    flashPad(act) {
      const btn = this.deckBtns[act];
      if (!btn) return;
      btn.classList.add('pressed');
      setTimeout(() => btn.classList.remove('pressed'), 120);
    }

    showToast(text, kind = 'info', duration = 2.6) {
      if (!this.elToast) return;
      renderDOMMath(this.elToast, text);
      this.elToast.className = `sonar-toast visible ${kind}`;
      this.toastTimer = duration;
    }

    setReadout(texOrText) {
      if (!this.elLiveReadout || this.lastReadoutKey === texOrText) return;
      this.lastReadoutKey = texOrText;
      renderDOMMath(this.elLiveReadout, texOrText);
    }

    configureDeck(cfg) {
      let visibleCount = 0;
      ['cross', 'square', 'triangle', 'circle', 'l2', 'r2'].forEach((k) => {
        const btn = this.deckBtns[k];
        const lbl = this.deckLbls[k];
        if (!btn || !lbl) return;
        if (!cfg[k]) {
          btn.classList.add('hidden-pad');
        } else {
          btn.classList.remove('hidden-pad');
          renderDOMMath(lbl, cfg[k]);
          visibleCount += 1;
        }
      });
      const hasTriggers = Boolean(cfg.l2 || cfg.r2);
      if (this.deckBtns.trigPair) {
        this.deckBtns.trigPair.classList.toggle('hidden-pad', !hasTriggers);
      }
      const nextMode = hasTriggers ? 'triggers' : (visibleCount <= 1 ? 'single' : 'quad');
      const wrap = document.getElementById('sonarStageWrap');
      if (wrap) {
        wrap.classList.toggle('has-triggers', nextMode === 'triggers');
        wrap.classList.toggle('single-pad', nextMode === 'single');
      }
      if (this.deckMode !== nextMode) {
        this.deckMode = nextMode;
        this.resize();
      }
    }

    updateTopHUD() {
      const op = OPERATIONS[this.opIdx];
      if (this.elHull) {
        const full = '♥'.repeat(Math.max(0, this.hull));
        const empty = '♡'.repeat(Math.max(0, this.maxHull - this.hull));
        this.elHull.textContent = full + empty;
      }
      if (this.elScore) this.elScore.textContent = String(this.score);
      if (this.elCombo) {
        this.elCombo.textContent = `×${this.combo}`;
        this.elCombo.classList.toggle('hot', this.combo >= 4);
      }
      if (this.elOpBadge) this.elOpBadge.textContent = `العملية ${this.opIdx + 1}/${OPERATIONS.length}`;
      if (this.elSkills) this.elSkills.textContent = op.skills;

      if (this.elWavePips) {
        this.elWavePips.innerHTML = '';
        for (let i = 0; i < op.waveCount; i += 1) {
          const pip = document.createElement('span');
          pip.className = 'wave-pip' + (i < this.waveIdx ? ' done' : (i === this.waveIdx ? ' active' : ''));
          this.elWavePips.appendChild(pip);
        }
      }

      this.opTabs.forEach((btn, idx) => {
        btn.classList.toggle('active', idx === this.opIdx);
        btn.classList.toggle('cleared', this.clearedOps.has(idx));
      });
    }

    spawnBurst(x, y, color, count = 16, speed = 150) {
      for (let i = 0; i < count; i += 1) {
        const ang = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
        const spd = speed * (0.45 + Math.random() * 0.75);
        this.particles.push({
          x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          r: 2 + Math.random() * 2.8,
          color,
          life: 0.45 + Math.random() * 0.35,
          maxLife: 0.8
        });
      }
    }

    spawnRing(x, y, color, maxR = 110) {
      this.rings.push({ x, y, r: 10, maxR, color, life: 0.52, maxLife: 0.52 });
    }

    spawnCallout(x, y, text, color = '#5eead4') {
      this.callouts.push({ x, y, text, color, life: 1.05, maxLife: 1.05 });
    }

    awardHit(x, y, pts, topicId, toastMsg, callout = '+100', color = '#2dd4bf') {
      this.totalAttempts += 1;
      this.correctCount += 1;
      this.score += Math.round(pts * this.combo);
      this.combo = Math.min(8, this.combo + 1);
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      this.hitStop = 0.038;
      this.spawnBurst(x, y, color, 20, 185);
      this.spawnRing(x, y, color, 100);
      this.spawnCallout(x, y - 16, callout, color);
      this.audio.playFusionChord(this.combo);
      if (this.gpState && AC) AC.Gamepad.triggerHaptic(this.gpState, 65, 0.3, 0.45);
      if (AC && AC.Progress && topicId) AC.Progress.recordAnswer(GAME_ID, topicId, true);
      if (toastMsg) this.showToast(toastMsg, 'good', 2.6);
      this.updateTopHUD();
    }

    penalize(x, y, topicId, toastMsg, damage = true, isHazard = false) {
      if (isHazard && this.invulnTimer > 0) return;
      this.totalAttempts += 1;
      this.combo = 1;
      this.shakeTime = 0.24;
      this.shakeAmp = 6;
      this.damageFlash = 0.32;
      if (damage) {
        this.hull = Math.max(0, this.hull - 1);
        if (isHazard) this.invulnTimer = 0.9;
      }
      this.spawnBurst(x, y, '#f43f5e', 14, 150);
      this.spawnRing(x, y, '#f43f5e', 80);
      this.audio.playHit();
      if (this.gpState && AC) AC.Gamepad.triggerHaptic(this.gpState, 120, 0.7, 0.8);
      if (AC && AC.Progress && topicId) AC.Progress.recordAnswer(GAME_ID, topicId, false);
      if (toastMsg) this.showToast(toastMsg, 'bad', 2.8);
      this.updateTopHUD();
      if (this.hull <= 0) {
        this.openResult(false);
      }
    }

    // ---------- Operation Lifecycle ----------
    startOperation(idx, resetScore = false) {
      this.opIdx = ((idx % OPERATIONS.length) + OPERATIONS.length) % OPERATIONS.length;
      this.waveIdx = 0;
      this.hull = this.maxHull;
      this.combo = 1;
      this.invulnTimer = 0;
      this.waveGuard = 0;
      this.toastTimer = 0;
      this.elToast?.classList.remove('visible');
      this.trail = [];
      this.particles = [];
      this.rings = [];
      this.callouts = [];
      if (resetScore) {
        this.score = 0;
        this.maxCombo = 1;
        this.correctCount = 0;
        this.totalAttempts = 0;
      }
      this.hideResult();
      this.initWave();
      this.updateTopHUD();
    }

    advanceWave() {
      const op = OPERATIONS[this.opIdx];
      this.audio.playWaveClear();
      this.waveIdx += 1;
      if (this.waveIdx >= op.waveCount) {
        this.clearedOps.add(this.opIdx);
        this.audio.playVictory();
        this.openResult(true);
      } else {
        this.initWave();
        this.updateTopHUD();
      }
    }

    initWave() {
      this.trail = [];
      if (this.opIdx === 0) this.initOp1Wave();
      else if (this.opIdx === 1) this.initOp2Wave();
      else if (this.opIdx === 2) this.initOp3Wave();
      else if (this.opIdx === 3) this.initOp4Wave();
      else this.initOp5Wave();
    }

    // ---------- OP 1: Domain & Primitive of 1/x (Skills 53, 56) ----------
    buildOp1Queue() {
      const pool = OP1_MINES_POOL.slice();
      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
      }
      return OP1_MINES_STARTERS.concat(pool);
    }

    initOp1Wave() {
      this.lastLockKey = '';
      this.lastSweetSpot = false;
      if (this.waveIdx === 0) {
        this.configureDeck({
          cross: 'قفل $\\ln(1)=0$',
          square: 'حظر $x \\le 0$',
          triangle: 'سالب $\\ln x < 0$',
          circle: 'موجب $\\ln x > 0$'
        });
        renderDOMMath(this.elPrompt, 'فجّر الألغام حسب المجال $D_{\\ln} = ]0, +\\infty[$ وإشارة $\\ln x$ قبل وصولها للقاع!');
        renderDOMMath(this.elFormulaBar, '$x\\le 0 \\notin D_{\\ln}$ • $]0,1[ \\Rightarrow \\ln<0$ • $\\ln(1)=0$ • $]1,+\\infty[ \\Rightarrow \\ln>0$');
        this.opState = {
          subX: 1.5, subY: 0.4,
          queue: this.buildOp1Queue(),
          mines: [],
          shotBeam: null,
          curveEcho: null,
          spawnTimer: 0.25,
          cleared: 0,
          targetClear: 7
        };
        this.spawnOp1Mine();
      } else if (this.waveIdx === 1) {
        this.configureDeck({
          cross: 'قفل المعايرة'
        });
        const cal = OP1_CALIBRATIONS[0];
        renderDOMMath(this.elPrompt, 'حرّك الغواصة على منحنى $\\ln x$ لمطابقة مساحة $\\frac{1}{t}$ من $1$ إلى $x$ واضغط $[\\times]$ مع تفادي الكبسولات!');
        renderDOMMath(this.elFormulaBar, `الهدف: $${cal.targetTex}$ • المشتقة $(\\ln x)' = \\frac{1}{x} > 0$`);
        this.opState = {
          subX: 1.95,
          calIdx: 0,
          hazards: [
            { x: 0.9, y: 3.1, vy: 1.25 },
            { x: 2.3, y: 4.0, vy: 1.35 },
            { x: 3.7, y: 2.6, vy: 1.15 }
          ]
        };
      } else {
        this.configureDeck({
          cross: 'درع المجال $u(x)>0$'
        });
        const wall = OP1_DOMAIN_WALLS[0];
        renderDOMMath(this.elPrompt, wall.prompt);
        renderDOMMath(this.elFormulaBar, `الدالة: $f(x) = ${wall.exprTex}$ • شرط التعريف: ما بداخل $\\ln$ موجب قطعاً`);
        this.opState = {
          subX: wall.startX,
          wallIdx: 0,
          sweepProgress: 0,
          sweepSpeed: 0.145,
          revealFlash: null
        };
      }
    }

    spawnOp1Mine() {
      const s = this.opState;
      if (!s.queue || s.queue.length === 0) {
        s.queue = this.buildOp1Queue();
      }
      const tpl = s.queue.shift();
      // Keep mines spaced cleanly across the sonar bay without piling on top of each other
      let px = this.play.x + this.play.w * (0.16 + Math.random() * 0.68);
      for (let tries = 0; tries < 5; tries += 1) {
        const tooClose = s.mines.some((m) => Math.abs(m.px - px) < 76 && m.py < this.play.y + 95);
        if (!tooClose) break;
        px = this.play.x + this.play.w * (0.16 + Math.random() * 0.68);
      }
      s.mines.push({
        ...tpl,
        uid: `${tpl.label}_${Date.now()}_${Math.random()}`,
        px,
        py: this.play.y + 22,
        vy: 36 + s.cleared * 3.8,
        r: 29,
        pulse: Math.random() * 6
      });
    }

    // ---------- OP 2: Algebraic Forge (Skill 54) ----------
    initOp2Wave() {
      this.lastLockKey = '';
      this.configureDeck({
        cross: 'جداء $\\ln(ab)$',
        square: 'خارج $\\ln(\\frac{a}{b})$',
        triangle: 'مقلوب $-\\ln b$',
        circle: 'قوة $r\\ln a$',
        l2: '$-r$',
        r2: '$+r$'
      });
      this.opState = {
        roundIdx: 0,
        aimAngle: -Math.PI * 0.5,
        expList: [0.5, 1.5, 2, 3],
        expIdx: 2,
        orbs: [],
        beamFlash: null
      };
      this.loadOp2Round();
    }

    loadOp2Round() {
      const rounds = OP2_WAVES[this.waveIdx];
      const r = rounds[this.opState.roundIdx];
      const cx = this.play.x + this.play.w * 0.5;
      const cy = this.play.y + this.play.h * 0.52;
      const maxR = Math.min(this.play.w, this.play.h) * 0.43;

      const items = [{ v: r.answerVal, tex: r.answerTex, isAnswer: true }]
        .concat(r.decoys.map((d) => ({ ...d, isAnswer: false })));
      const baseOff = this.opState.roundIdx * 0.9 + this.waveIdx * 0.6;
      this.opState.orbs = items.map((it, idx) => ({
        ...it,
        uid: `${this.waveIdx}_${this.opState.roundIdx}_${idx}`,
        angle: baseOff + (Math.PI * 2 * idx) / items.length,
        dist: maxR * (0.86 + (idx % 2) * 0.11),
        angVel: (idx % 2 === 0 ? 1 : -1) * (0.34 + this.waveIdx * 0.055),
        inwardVel: 8.2 + this.waveIdx * 2.1,
        r: 27,
        cx, cy
      }));

      const expTex = this.formatExpTex();
      const opNames = {
        mul: 'أطلق شعاع الجمع $[\\times]$ لصهر $\\ln a + \\ln b = \\ln(ab)$',
        div: 'أطلق شعاع الطرح $[▢]$ لصهر $\\ln a - \\ln b = \\ln(\\frac{a}{b})$',
        inv: 'أطلق شعاع المقلوب $[△]$ نحو الكرة المناسبة: $-\\ln b = \\ln(\\frac{1}{b})$',
        pow: 'اضبط الأس $r$ بـ $[L2/R2]$ ثم أطلق شعاع القوة $[◯]$: $r\\ln a = \\ln(a^r)$'
      };
      renderDOMMath(this.elPrompt, `صوّب السونار القطبي 360° نحو الكرة المناسبة: ${opNames[r.op]}!`);
      renderDOMMath(this.elFormulaBar, `الغرفة: $${r.chamberTex}$ • الهدف: $${r.targetTex}$ • الأس النشط: $r = ${expTex}$`);
    }

    formatExpTex(val) {
      const v = val !== undefined ? val : this.opState.expList[this.opState.expIdx];
      if (Math.abs(v - 0.5) < 0.01) return '\\frac{1}{2}';
      if (Math.abs(v - 1.5) < 0.01) return '\\frac{3}{2}';
      return String(v);
    }

    // ---------- OP 3: Equations, Inequalities, Systems & u'/u (Skills 55, 57) ----------
    initOp3Wave() {
      this.lastLockKey = '';
      if (this.waveIdx === 0) {
        this.configureDeck({
          cross: 'اندفاع الاختراق'
        });
        this.opState = {
          subYNorm: 0.5,
          wallIdx: 0,
          wallXNorm: 1.04,
          wallSpeed: 0.12,
          dashFlash: null
        };
        this.syncOp3WallPrompt();
      } else if (this.waveIdx === 1) {
        this.configureDeck({
          cross: 'قفل الحل'
        });
        const firstIneq = OP3_INEQS[0];
        this.opState = {
          phase: 'ineq',
          ineqIdx: 0,
          subX: firstIneq.startX,
          subY: 2.0,
          sweep: 0,
          sweepSpeed: 0.14,
          patrolAng: 0,
          sysPoints: [
            { x: 6, y: 2, ok: true, label: '(6, 2)' },
            { x: 4, y: 3, ok: false, label: '(4, 3)' },
            { x: 3, y: 4, ok: false, label: '(3, 4)' },
            { x: 2, y: 6, ok: false, label: '(2, 6)' }
          ]
        };
        renderDOMMath(this.elPrompt, firstIneq.prompt);
        renderDOMMath(this.elFormulaBar, firstIneq.formulaHint);
      } else {
        this.configureDeck({
          cross: 'إطلاق الشعاع',
          square: 'الكبسولة 1',
          triangle: 'الكبسولة 2',
          circle: 'الكبسولة 3'
        });
        this.opState = {
          roundIdx: 0,
          aimAngle: -Math.PI * 0.5,
          hazardAng: 0.4,
          beamFlash: null
        };
        this.loadOp3UPrimeRound();
      }
    }

    syncOp3WallPrompt() {
      const w = OP3_WALLS[this.opState.wallIdx];
      renderDOMMath(this.elPrompt, w.prompt);
      renderDOMMath(this.elFormulaBar, `المعادلة: $${w.eqTex}$ • وجّه الغواصة عمودياً واضغط $[\\times]$ للاختراق`);
    }

    loadOp3UPrimeRound() {
      const r = OP3_UPRIME[this.opState.roundIdx];
      renderDOMMath(this.elPrompt, r.prompt);
      const tag = r.mode === 'deriv' ? 'الاشتقاق $(\\ln|u|)\' = \\frac{u\'}{u}$' : 'الأصلية $\\frac{u\'}{u} \\mapsto \\ln|u| + C$';
      renderDOMMath(this.elFormulaBar, `${tag} • القلب: $${r.coreTex}$`);
      this.opState.pods = r.pods.map((p, i) => ({
        ...p,
        idx: i,
        angle: -Math.PI * 0.5 + (Math.PI * 2 * i) / 3 + this.opState.roundIdx * 0.5
      }));
    }

    // ---------- OP 4: Standard Limits & Comparative Growth (Skills 58, 59) ----------
    initOp4Wave() {
      this.configureDeck({
        cross: 'تثبيت المسار',
        square: 'هيمنة $x^n / \\sqrt{x}$',
        triangle: 'مشتقة عند $1$ أو $0$',
        circle: 'نهاية مباشرة $\\pm\\infty$'
      });
      this.opState = {
        runIdx: 0,
        subYNorm: 0.5,
        progress: 0,
        speed: 0.14 + this.waveIdx * 0.014,
        mineCleared: false,
        mineHit: false,
        mineBeam: null,
        dashFlash: null
      };
      this.syncOp4RunPrompt();
    }

    syncOp4RunPrompt() {
      const run = OP4_RUNS[this.waveIdx][this.opState.runIdx];
      renderDOMMath(this.elPrompt, 'فكّك اللغم بالقاعدة المناسبة ($▢$ تزايد مقارن • $△$ عدد مشتق $0/0$ • $◯$ نهاية مباشرة) ثم ادخل بوابة الناتج!');
      renderDOMMath(this.elFormulaBar, `النهاية الجارية: $${run.tex}$ • البوابات: $+\\infty$ | $1$ | $0$ | $-\\infty$`);
    }

    // ---------- OP 5: Base-a, Common Log 10^x=a, and Curve Study Boss (Skills 60, 61, 62) ----------
    initOp5Wave() {
      this.lastSweetSpot = false;
      this.lastWarnSec = -1;
      if (this.waveIdx === 0) {
        this.configureDeck({
          cross: 'رنين $\\log_a(x)$',
          square: 'خفض الأساس $a$',
          triangle: 'رفع الأساس $a$',
          l2: 'خفض $a$',
          r2: 'رفع $a$'
        });
        this.opState = {
          baseIdx: 3, // starts at e
          beaconIdx: 0,
          timer: 14,
          maxTimer: 14
        };
        this.syncOp5BasePrompt();
      } else if (this.waveIdx === 1) {
        this.configureDeck({
          cross: 'موجة الإلغاء $10^x = a$'
        });
        this.opState = {
          roundIdx: 0,
          needleX: 0.0,
          waveY: 0.0,
          waveSpeed: 0.112,
          beamFlash: null
        };
        this.syncOp5DecibelPrompt();
      } else {
        this.configureDeck({
          cross: 'المطراف $f\'=0$',
          square: 'مقارب $x=0$',
          triangle: 'أفقي $y=0$',
          circle: 'فرع $y=x$'
        });
        this.opState = {
          bossIdx: 0, // 0: f(x)=x-1-ln(x), 1: g(x)=ln(x)/x
          stepIdx: 0, // 0: asymptote x=0, 1: extremum, 2: infinity branch
          subX: 2.0,
          orbs: [
            { x: 4.6, y: 1.4, vx: -0.92, vy: 0.28 },
            { x: 3.5, y: -1.1, vx: -0.78, vy: -0.35 }
          ]
        };
        this.syncOp5BossPrompt();
      }
    }

    syncOp5BasePrompt() {
      const b = OP5_BASE_BEACONS[this.opState.beaconIdx];
      const cur = BASE_OPTIONS[this.opState.baseIdx];
      const mono = cur.inc ? 'تزايدية ($a>1$)' : 'تناقصية ($0<a<1$)';
      renderDOMMath(this.elPrompt, b.prompt);
      renderDOMMath(this.elFormulaBar, `الأساس الحالي: $a = ${cur.tex}$ • $\\log_a(x) = \\frac{\\ln x}{\\ln a}$ • ${mono}`);
    }

    syncOp5DecibelPrompt() {
      const w = OP5_DECIBEL_WAVES[this.opState.roundIdx];
      const msg = w.mode === 'eq'
        ? `وجّه إبرة الأس $x$ نحو حل $${w.tex}$ واضغط $[\\times]$ لتدمير موجة الديسيبل!`
        : `المتراجحة $${w.tex}$: وجّه الإبرة إلى مجال الحلول الصحيح واضغط $[\\times]$!`;
      renderDOMMath(this.elPrompt, msg);
      renderDOMMath(this.elFormulaBar, `موجة الديسيبل: $${w.tex}$ • تذكير: $\\log(10^n) = n$`);
    }

    syncOp5BossPrompt() {
      const bi = this.opState.bossIdx;
      const si = this.opState.stepIdx;
      if (bi === 0) {
        const steps = [
          'زعيم المنحنى $f(x) = x - 1 - \\ln x$: اقترب من $0^+$ واختم المقارب العمودي $x=0$ بـ $[▢]$!',
          'زعيم المنحنى $f(x) = x - 1 - \\ln x$: حدّد موضع انعدام المشتقة $f\'(x)=\\frac{x-1}{x}=0$ واضرب $[\\times]$!',
          'زعيم المنحنى $f(x) = x - 1 - \\ln x$: عند $+\\infty$ لدينا $\\frac{f(x)}{x}\\to 1$ و $f(x)-x\\to -\\infty$؛ اقفِل الفرع اللانهائي!'
        ];
        renderDOMMath(this.elPrompt, steps[si]);
        renderDOMMath(this.elFormulaBar, 'الطور 1 من 2: $f(x) = x - 1 - \\ln x$ على $]0, +\\infty[$ • $f\'(x) = \\frac{x-1}{x}$');
      } else {
        const steps = [
          'الزعيم النهائي $g(x) = \\frac{\\ln x}{x}$: اقترب من $0^+$ واختم المقارب العمودي $x=0$ بـ $[▢]$!',
          'الزعيم النهائي $g(x) = \\frac{\\ln x}{x}$: قُد الغواصة نحو القيمة القصوى حيث $g\'(x)=\\frac{1-\\ln x}{x^2}=0$ واضرب $[\\times]$!',
          'الزعيم النهائي $g(x) = \\frac{\\ln x}{x}$: استعمل التزايد المقارن عند $+\\infty$ لختم المقارب الصحيح!'
        ];
        renderDOMMath(this.elPrompt, steps[si]);
        renderDOMMath(this.elFormulaBar, 'الطور 2 من 2: $g(x) = \\frac{\\ln x}{x}$ على $]0, +\\infty[$ • $g\'(x) = \\frac{1-\\ln x}{x^2}$');
      }
    }

    // ---------- Coordinate Transforms ----------
    xToPx(x, xMin, xMax) {
      return this.play.x + ((x - xMin) / (xMax - xMin)) * this.play.w;
    }
    pxToX(px, xMin, xMax) {
      return xMin + ((px - this.play.x) / this.play.w) * (xMax - xMin);
    }
    yToPx(y, yMin, yMax) {
      return this.play.y + this.play.h - ((y - yMin) / (yMax - yMin)) * this.play.h;
    }
    pxToY(py, yMin, yMax) {
      return yMin + ((this.play.y + this.play.h - py) / this.play.h) * (yMax - yMin);
    }

    // ---------- Pointer Immediate Response ----------
    applyPointerImmediate() {
      const p = this.pointer;
      if (this.opIdx === 1) {
        const cx = this.play.x + this.play.w * 0.5;
        const cy = this.play.y + this.play.h * 0.52;
        this.opState.aimAngle = Math.atan2(p.y - cy, p.x - cx);
      } else if (this.opIdx === 2 && this.waveIdx === 2) {
        const cx = this.play.x + this.play.w * 0.5;
        const cy = this.play.y + this.play.h * 0.52;
        this.opState.aimAngle = Math.atan2(p.y - cy, p.x - cx);
      }
    }

    // ---------- Unified Action Dispatch (DualSense + Keyboard + Click) ----------
    triggerAction(act, bypassGuard = false) {
      if (this.paused || this.resultOpen) return;
      const now = performance.now();
      const isTrigger = act === 'l2' || act === 'r2';
      if (!bypassGuard) {
        if (!isTrigger && this.waveGuard > 0) return;
        const minGap = isTrigger ? 80 : 140;
        if (this.lastActionAt[act] && now - this.lastActionAt[act] < minGap) return;
        this.lastActionAt[act] = now;
      }
      this.audio.playPulse(act);

      if (this.opIdx === 0) this.handleOp1Action(act);
      else if (this.opIdx === 1) this.handleOp2Action(act);
      else if (this.opIdx === 2) this.handleOp3Action(act);
      else if (this.opIdx === 3) this.handleOp4Action(act);
      else this.handleOp5Action(act);
    }

    handleOp1Action(act) {
      const s = this.opState;
      if (this.waveIdx === 0) {
        if (!s.mines.length) return;
        const subPx = this.xToPx(s.subX, -2.5, 5.2);
        const subPy = this.yToPx(s.subY, -2.4, 3.0);
        let best = s.mines[0];
        let bestScore = Infinity;
        for (const m of s.mines) {
          const sc = dist(m.px, m.py, subPx, subPy) - m.py * 0.45;
          if (sc < bestScore) { bestScore = sc; best = m; }
        }
        const mapAct = { cross: 'zero', square: 'forbid', triangle: 'neg', circle: 'pos' };
        const chosen = mapAct[act];
        if (!chosen) return;

        const beamCol = { zero: '#2dd4bf', forbid: '#f43f5e', neg: '#c084fc', pos: '#fcd34d' }[chosen];
        s.shotBeam = { x1: subPx, y1: subPy, x2: best.px, y2: best.py, color: beamCol, life: 0.22, maxLife: 0.22 };

        if (chosen === best.kind) {
          s.mines = s.mines.filter((m) => m !== best);
          s.cleared += 1;
          s.curveEcho = {
            xVal: best.xVal,
            forbid: best.xVal <= 0,
            color: beamCol,
            life: 0.72,
            maxLife: 0.72
          };
          this.audio.playLogPing(best.xVal > 0 ? Math.log(best.xVal) : -2);
          const cleanLbl = best.label
            .replace(/\\frac\{1\}\{2\}/, '1/2')
            .replace(/\\frac\{1\}\{e\}/, '1/e')
            .replace(/\\frac\{1\}\{\\sqrt\{2\}\}/, '1/√2')
            .replace(/\\sqrt\{e\}/, '√e');
          this.awardHit(best.px, best.py, 120, best.kind === 'forbid' ? 53 : 56, best.tip, '✓ ' + cleanLbl, beamCol);
          if (s.cleared >= s.targetClear) {
            this.advanceWave();
          } else if (s.mines.length === 0) {
            this.spawnOp1Mine();
          }
        } else {
          this.penalize(best.px, best.py, 53, `نبضة خاطئة لـ $${best.label}$! تحقّق من المجال $x>0$ وإشارة $\\ln x$`, true);
        }
      } else if (this.waveIdx === 1) {
        if (act !== 'cross') return;
        const cal = OP1_CALIBRATIONS[s.calIdx];
        const px = this.xToPx(s.subX, 0.05, 4.6);
        const py = this.yToPx(Math.log(s.subX), -2.2, 2.4);
        if (Math.abs(s.subX - cal.targetX) <= cal.tol) {
          this.audio.playLogPing(Math.log(cal.targetX));
          this.awardHit(px, py, 160, 53, cal.reason, '✓ ' + cal.hintTex.replace(/\\approx.*/, '').replace(/\\frac\{1\}\{e\}/, '1/e'), '#fcd34d');
          s.calIdx += 1;
          this.waveGuard = 0.28;
          this.lastSweetSpot = false;
          if (s.calIdx >= OP1_CALIBRATIONS.length) {
            this.advanceWave();
          } else {
            const nxt = OP1_CALIBRATIONS[s.calIdx];
            renderDOMMath(this.elFormulaBar, `الهدف: $${nxt.targetTex}$ • المشتقة $(\\ln x)' = \\frac{1}{x} > 0$`);
          }
        } else {
          this.penalize(px, py, 53, `المعايرة غير دقيقة! المطلوب $${cal.targetTex}$ أي عند $${cal.hintTex}$`, false);
        }
      } else {
        if (act !== 'cross' || s.revealFlash) return;
        const wall = OP1_DOMAIN_WALLS[s.wallIdx];
        const px = this.xToPx(s.subX, -3.5, 4.5);
        const py = this.play.y + this.play.h * 0.56;
        if (wall.valid(s.subX)) {
          this.awardHit(px, py, 150, 53, wall.reason, '✓ D_f');
          this.waveGuard = 0.42;
          s.revealFlash = { wall, life: 0.42, maxLife: 0.42 };
        } else {
          this.penalize(px, py, 53, `خطر! أنت خارج مجموعة التعريف: ${wall.reason}`, true);
          s.sweepProgress = Math.min(s.sweepProgress, 0.45);
        }
      }
    }

    handleOp2Action(act) {
      const s = this.opState;
      if (act === 'l2' || act === 'r2') {
        const delta = act === 'r2' ? 1 : -1;
        s.expIdx = (s.expIdx + delta + s.expList.length) % s.expList.length;
        this.audio.playBaseFlip(delta > 0);
        const r = OP2_WAVES[this.waveIdx][s.roundIdx];
        renderDOMMath(this.elFormulaBar, `الغرفة: $${r.chamberTex}$ • الهدف: $${r.targetTex}$ • الأس النشط: $r = ${this.formatExpTex()}$`);
        return;
      }

      const opMap = { cross: 'mul', square: 'div', triangle: 'inv', circle: 'pow' };
      const beamOp = opMap[act];
      if (!beamOp || !s.orbs.length) return;

      const cx = this.play.x + this.play.w * 0.5;
      const cy = this.play.y + this.play.h * 0.52;
      let best = null;
      let bestDiff = 0.58;
      for (const o of s.orbs) {
        const d = Math.abs(angleDiff(s.aimAngle, o.angle));
        if (d < bestDiff) { bestDiff = d; best = o; }
      }
      const beamCol = { mul: '#2dd4bf', div: '#fb7185', inv: '#c084fc', pow: '#fcd34d' }[beamOp];
      s.beamFlash = { angle: s.aimAngle, color: beamCol, life: 0.22 };

      if (!best) {
        this.showToast('وجّه السونار مباشرة نحو إحدى الكرات الدوارة أولاً!', 'info', 1.6);
        return;
      }

      const ox = cx + Math.cos(best.angle) * best.dist;
      const oy = cy + Math.sin(best.angle) * best.dist;
      const round = OP2_WAVES[this.waveIdx][s.roundIdx];

      const expOk = round.op !== 'pow' || Math.abs(s.expList[s.expIdx] - round.reqExp) < 0.01;
      if (best.isAnswer && beamOp === round.op && expOk) {
        this.audio.playLogPing(Math.log(Math.max(0.2, best.v)));
        this.awardHit(ox, oy, 160, 54, `انصهار ناجح! ${round.proof}`, '✓ ' + round.targetTex.replace(/\\frac\{1\}\{5\}/, '1/5').replace(/\\sqrt\{(\d+)\}/, '√$1'), beamCol);
        s.roundIdx += 1;
        this.waveGuard = 0.25;
        if (s.roundIdx >= OP2_WAVES[this.waveIdx].length) {
          this.advanceWave();
        } else {
          this.loadOp2Round();
        }
      } else if (best.isAnswer && beamOp === 'pow' && !expOk) {
        this.penalize(ox, oy, 54, `الأس غير مطابق! بدّل قيمة $r$ بـ $[L2/R2]$ لتصبح $r = ${this.formatExpTex(round.reqExp)}$`, false);
      } else {
        this.penalize(ox, oy, 54, `انصهار خاطئ! راجع القانون المطلوب للوصول إلى $${round.targetTex}$`, true);
      }
    }

    handleOp3Action(act) {
      const s = this.opState;
      if (this.waveIdx === 0) {
        if (act !== 'cross') return;
        this.audio.playDash();
        this.resolveOp3Wall(true);
      } else if (this.waveIdx === 1) {
        if (act !== 'cross') return;
        if (s.phase === 'ineq') {
          const iq = OP3_INEQS[s.ineqIdx];
          const px = this.xToPx(s.subX, -1.2, 4.8);
          const py = this.play.y + this.play.h * 0.55;
          if (iq.valid(s.subX)) {
            this.awardHit(px, py, 160, 55, iq.proof, iq.callout);
            s.ineqIdx += 1;
            s.sweep = 0;
            this.waveGuard = 0.34;
            if (s.ineqIdx < OP3_INEQS.length) {
              const nxt = OP3_INEQS[s.ineqIdx];
              s.subX = nxt.startX;
              renderDOMMath(this.elPrompt, nxt.prompt);
              renderDOMMath(this.elFormulaBar, nxt.formulaHint);
            } else {
              s.phase = 'sys';
              s.subX = 1.5;
              s.subY = 1.5;
              this.trail = [];
              renderDOMMath(this.elPrompt, 'النظمة اللوغاريتمية: قُد الغواصة إلى الحل $(x,y)$ وتفادَ الشحنة الدوارة ثم اضغط $[\\times]$!');
              renderDOMMath(this.elFormulaBar, '$\\begin{cases} \\ln x + \\ln y = \\ln 12 \\\\ \\ln x - \\ln y = \\ln 3 \\end{cases}$ • استعمل خواص $\\ln$ لإيجاد $(x,y)$');
            }
          } else {
            this.penalize(px, py, 55, iq.failReason(s.subX), true);
            s.sweep = Math.min(s.sweep, 0.42);
          }
        } else {
          // System grid lock
          let nearest = null;
          let bestD = 1.15;
          for (const pt of s.sysPoints) {
            const d = dist(s.subX, s.subY, pt.x, pt.y);
            if (d < bestD) { bestD = d; nearest = pt; }
          }
          const px = this.xToPx(s.subX, 0.5, 7.2);
          const py = this.yToPx(s.subY, 0.5, 7.2);
          if (!nearest) {
            this.showToast('اقترب من إحدى نقاط الحلول $(x, y)$ ثم اضغط $[\\times]$!', 'info', 1.8);
            return;
          }
          if (nearest.ok) {
            this.awardHit(px, py, 190, 55, 'حل نظمة مثالي! $xy=12$ و $\\frac{x}{y}=3 \\Rightarrow x^2=36 \\Rightarrow (x,y)=(6,2)$', '✓ (6, 2)', '#fcd34d');
            this.advanceWave();
          } else {
            this.penalize(px, py, 55, `النقطة $${nearest.label}$ لا تحقق المعادلة الثانية $\\ln x - \\ln y = \\ln 3$!`, true);
          }
        }
      } else {
        // Wave 3: u'/u Reactor with REAL orbiting Singularity Blocker deflection!
        let targetIdx = -1;
        if (act === 'square') targetIdx = 0;
        else if (act === 'triangle') targetIdx = 1;
        else if (act === 'circle') targetIdx = 2;
        else if (act === 'cross') {
          let bestD = Infinity;
          s.pods.forEach((p, idx) => {
            const d = Math.abs(angleDiff(s.aimAngle, p.angle));
            if (d < bestD) { bestD = d; targetIdx = idx; }
          });
        }
        if (targetIdx < 0 || !s.pods[targetIdx]) return;
        const pod = s.pods[targetIdx];
        const cx = this.play.x + this.play.w * 0.5;
        const cy = this.play.y + this.play.h * 0.52;
        const rad = this.W <= 680 ? Math.min(this.play.w * 0.30, this.play.h * 0.33) : Math.min(this.play.w, this.play.h) * 0.34;

        // Check if orbiting armored Singularity Shield intercepts the beam!
        if (Math.abs(angleDiff(pod.angle, s.hazardAng)) < 0.24) {
          const blkR = rad * 0.56;
          const bx = cx + Math.cos(pod.angle) * blkR;
          const by = cy + Math.sin(pod.angle) * blkR;
          s.beamFlash = { angle: pod.angle, len: blkR, color: '#fb7185', life: 0.22 };
          this.audio.playDeflect();
          this.spawnBurst(bx, by, '#fb7185', 14, 160);
          this.spawnRing(bx, by, '#fcd34d', 44);
          this.spawnCallout(bx, by - 14, 'صدّ!', '#fb7185');
          if (this.gpState && AC) AC.Gamepad.triggerHaptic(this.gpState, 55, 0.45, 0.25);
          this.showToast('صدّ درع التفرد الشعاع! انتظر لحظة مرور الدرع وصوّب في الفجوة الصافية', 'info', 2.0);
          return;
        }

        const px = cx + Math.cos(pod.angle) * rad;
        const py = cy + Math.sin(pod.angle) * rad;
        s.beamFlash = { angle: pod.angle, len: rad, color: pod.ok ? '#2dd4bf' : '#f43f5e', life: 0.24 };

        if (pod.ok) {
          this.awardHit(px, py, 175, 57, pod.proof, '✓ u\'/u');
          s.roundIdx += 1;
          this.waveGuard = 0.26;
          if (s.roundIdx >= OP3_UPRIME.length) {
            this.advanceWave();
          } else {
            this.loadOp3UPrimeRound();
          }
        } else {
          this.penalize(px, py, 57, pod.proof, true);
        }
      }
    }

    resolveOp3Wall(boosted) {
      const s = this.opState;
      const wall = OP3_WALLS[s.wallIdx];
      const chuteIdx = s.subYNorm < 0.34 ? 0 : (s.subYNorm < 0.67 ? 1 : 2);
      const chosen = wall.chutes[chuteIdx];
      const subPx = this.play.x + this.play.w * 0.22;
      const wallPx = this.play.x + this.play.w * clamp(s.wallXNorm, 0.24, 0.96);
      const py = this.play.y + this.play.h * (0.18 + chuteIdx * 0.32);

      if (boosted) {
        s.dashFlash = { x1: subPx, x2: wallPx, y: py, color: chosen.ok ? '#2dd4bf' : '#f43f5e', life: 0.24, maxLife: 0.24 };
      }

      if (chosen.ok) {
        this.awardHit(boosted ? wallPx : subPx, py, boosted ? 175 : 140, 55, chosen.reason, '✓ ' + chosen.label.replace(/\\\{/g, '{').replace(/\\\}/g, '}'));
        s.wallIdx += 1;
        s.wallXNorm = 1.04;
        this.waveGuard = 0.28;
        if (s.wallIdx >= OP3_WALLS.length) {
          this.advanceWave();
        } else {
          this.syncOp3WallPrompt();
        }
      } else {
        this.penalize(boosted ? wallPx : subPx, py, 55, chosen.reason, true);
        s.wallXNorm = 1.04;
        this.waveGuard = 0.28;
      }
    }

    handleOp4Action(act) {
      const s = this.opState;
      const run = OP4_RUNS[this.waveIdx][s.runIdx];
      if (act === 'cross') {
        if (s.progress >= 0.58 || s.mineCleared) {
          const subPx = this.play.x + 34 + s.progress * (this.play.w - 135);
          const subPy = this.play.y + this.play.h * s.subYNorm;
          s.dashFlash = { x1: subPx, x2: this.play.x + this.play.w - 78, y: subPy, color: '#2dd4bf', life: 0.24, maxLife: 0.24 };
          this.audio.playDash();
          this.resolveOp4Gate();
        } else {
          this.showToast('فكّك اللغم أولاً بالقاعدة المناسبة $[▢ / △ / ◯]$ قبل تثبيت المسار!', 'info', 1.6);
        }
        return;
      }
      if (s.mineCleared || s.mineHit) return;
      const subPx = this.play.x + 34 + s.progress * (this.play.w - 135);
      const subPy = this.play.y + this.play.h * s.subYNorm;
      const mx = this.play.x + (this.play.w - 90) * clamp(1 - (s.progress - 0.12) * 1.15, 0.18, 0.72);
      const my = this.play.y + this.play.h * 0.5;
      s.mineBeam = { x1: subPx, y1: subPy, x2: mx, y2: my, color: act === run.mineKey ? '#fcd34d' : '#f43f5e', life: 0.22, maxLife: 0.22 };

      if (act === run.mineKey) {
        s.mineCleared = true;
        this.awardHit(mx, my, 120, this.waveIdx === 2 ? 59 : 58, 'تفكيك مثالي! الآن وجّه الغواصة نحو بوابة الناتج واضغط $[\\times]$ للاندفاع!', '⚡ تفكيك', '#fcd34d');
      } else {
        this.penalize(mx, my, 58, 'قاعدة خاطئة! طابق النوع: $▢$ تزايد مقارن • $△$ عدد مشتق $0/0$ • $◯$ نهاية مباشرة $\\pm\\infty$', true);
      }
    }

    resolveOp4Gate() {
      const s = this.opState;
      const run = OP4_RUNS[this.waveIdx][s.runIdx];
      const chosenLane = clamp(Math.floor(s.subYNorm * 4), 0, 3);
      const gx = this.play.x + this.play.w * 0.88;
      const gy = this.play.y + this.play.h * ((chosenLane + 0.5) / 4);
      const laneNames = ['+∞', '1', '0', '-∞'];

      if (chosenLane === run.lane) {
        this.awardHit(gx, gy, s.mineCleared ? 185 : 140, this.waveIdx === 2 ? 59 : 58, run.proof, `✓ → ${laneNames[run.lane]}`);
        s.runIdx += 1;
        s.progress = 0;
        s.mineCleared = false;
        s.mineHit = false;
        this.trail = [];
        this.waveGuard = 0.28;
        if (s.runIdx >= OP4_RUNS[this.waveIdx].length) {
          this.advanceWave();
        } else {
          this.syncOp4RunPrompt();
        }
      } else {
        this.penalize(gx, gy, this.waveIdx === 2 ? 59 : 58, `بوابة خاطئة (${laneNames[chosenLane]})! الصحيح: ${run.proof}`, true);
        s.progress = 0;
        s.mineCleared = false;
        s.mineHit = false;
        this.trail = [];
        this.waveGuard = 0.28;
      }
    }

    handleOp5Action(act) {
      const s = this.opState;
      if (this.waveIdx === 0) {
        if (act === 'l2' || act === 'square') {
          s.baseIdx = Math.max(0, s.baseIdx - 1);
          this.audio.playBaseFlip(BASE_OPTIONS[s.baseIdx].inc);
          this.syncOp5BasePrompt();
          return;
        }
        if (act === 'r2' || act === 'triangle') {
          s.baseIdx = Math.min(BASE_OPTIONS.length - 1, s.baseIdx + 1);
          this.audio.playBaseFlip(BASE_OPTIONS[s.baseIdx].inc);
          this.syncOp5BasePrompt();
          return;
        }
        if (act === 'cross') {
          const b = OP5_BASE_BEACONS[s.beaconIdx];
          const px = this.xToPx(b.bx, 0.1, 6.2);
          const py = this.yToPx(b.by, -2.8, 2.8);
          if (s.baseIdx === b.reqIdx) {
            this.awardHit(px, py, 170, 60, b.proof, '✓ log_a', '#fcd34d');
            s.beaconIdx += 1;
            s.timer = s.maxTimer;
            this.lastWarnSec = -1;
            this.waveGuard = 0.26;
            if (s.beaconIdx >= OP5_BASE_BEACONS.length) {
              this.advanceWave();
            } else {
              this.syncOp5BasePrompt();
            }
          } else {
            this.penalize(px, py, 60, `المنحنى لا يمر بالمنارة $${b.label}$! غيّر الأساس $a$ بـ $[L2/R2]$ أو الأسهم`, true);
          }
        }
      } else if (this.waveIdx === 1) {
        if (act !== 'cross') return;
        const w = OP5_DECIBEL_WAVES[s.roundIdx];
        const px = this.xToPx(s.needleX, -2.2, 3.8);
        const trackY = this.play.y + this.play.h * 0.72;
        const wy = this.play.y + s.waveY * (trackY - this.play.y);
        const ok = w.mode === 'eq'
          ? Math.abs(s.needleX - w.target) <= w.tol
          : (w.mode === 'le' ? s.needleX <= w.bound + 0.08 : s.needleX >= w.bound - 0.08);
        s.beamFlash = { x: px, y1: trackY, y2: wy, color: ok ? '#2dd4bf' : '#f43f5e', life: 0.22, maxLife: 0.22 };
        if (ok) {
          const tag = w.mode === 'eq' ? `✓ x=${w.target}` : (w.mode === 'le' ? `✓ x≤${w.bound}` : `✓ x≥${w.bound}`);
          this.awardHit(px, wy, 170, 61, w.proof, tag);
          s.roundIdx += 1;
          s.waveY = 0;
          this.waveGuard = 0.28;
          if (s.roundIdx >= OP5_DECIBEL_WAVES.length) {
            this.advanceWave();
          } else {
            this.syncOp5DecibelPrompt();
          }
        } else {
          this.penalize(px, trackY, 61, `تردد غير متطابق! ${w.proof}`, true);
          s.waveY = Math.min(s.waveY, 0.35);
        }
      } else {
        // Wave 3: Logarithmic Curve Study Boss (Skill 62)
        const bi = s.bossIdx;
        const si = s.stepIdx;
        const yFn = bi === 0 ? (x) => x - 1 - Math.log(x) : (x) => Math.log(x) / x;
        const px = this.xToPx(s.subX, 0.08, 6.2);
        const py = this.yToPx(yFn(s.subX), -2.4, 3.2);

        if (si === 0) {
          if (act === 'square' && s.subX <= 0.74) {
            this.awardHit(px, py, 160, 62, 'تم ختم المقارب العمودي $x = 0$ بنجاح!', '✓ x=0', '#fb7185');
            s.stepIdx = 1;
            this.waveGuard = 0.28;
            this.syncOp5BossPrompt();
          } else {
            this.penalize(px, py, 62, 'اقترب من جدار $x \\to 0^+$ (يسار الشاشة) واضغط $[▢]$ لختم المقارب العمودي!', false);
          }
        } else if (si === 1) {
          const targetX = bi === 0 ? 1 : E;
          if (act === 'cross' && Math.abs(s.subX - targetX) <= 0.34) {
            const msg = bi === 0
              ? 'إصابة حاسمة! $f\'(1)=0$ وقيمة دنوية $f(1)=0 \\implies \\ln x \\le x - 1$'
              : 'إصابة حاسمة! $g\'(e)=0$ وقيمة قصوى $g(e)=\\frac{1}{e} \\approx 0.37$';
            this.awardHit(px, py, 190, 62, msg, bi === 0 ? '✓ Min(1,0)' : '✓ Max(e,1/e)', '#fcd34d');
            s.stepIdx = 2;
            this.waveGuard = 0.28;
            this.syncOp5BossPrompt();
          } else {
            this.penalize(px, py, 62, 'راقب إشارة المشتقة في العداد وتوقّف بدقة عند انعدامها ($f\'(x)=0$) ثم اضغط $[\\times]$!', false);
          }
        } else {
          const wantAct = bi === 0 ? 'circle' : 'triangle';
          if (act === wantAct) {
            const msg = bi === 0
              ? 'تفكيك الطور 1! $\\lim_{+\\infty}\\frac{f(x)}{x}=1$ و $f(x)-x=-1-\\ln x\\to -\\infty$ (فرع شلجمي $y=x$)'
              : 'انتصار كامل على زعيم اللوغاريتم! $\\lim_{+\\infty}\\frac{\\ln x}{x}=0$ (مقارب أفقي $y=0$)';
            this.awardHit(px, py, 240, 62, msg, bi === 0 ? '✓ y=x' : '✓ y=0', '#2dd4bf');
            this.waveGuard = 0.32;
            if (bi === 0) {
              s.bossIdx = 1;
              s.stepIdx = 0;
              s.subX = 2.0;
              this.trail = [];
              this.syncOp5BossPrompt();
            } else {
              this.advanceWave();
            }
          } else {
            this.penalize(px, py, 62, bi === 0 ? 'عند $+\\infty$ لـ $x-1-\\ln x$ لدينا فرع شلجمي اتجاهه $y=x$ — اضغط $[◯]$!' : 'عند $+\\infty$ لـ $\\frac{\\ln x}{x}$ النهاية $0$ (مقارب أفقي $y=0$) — اضغط $[△]$!', true);
          }
        }
      }
    }

    // ---------- Gamepad Polling (DualSense Parity + Full D-Pad + Right Stick + Start PauseMenu) ----------
    pollGamepad(dt) {
      this.dpadVec.x = 0;
      this.dpadVec.y = 0;
      if (!AC || !AC.Gamepad || !this.gpState) return { lx: 0, ly: 0, rx: 0, ry: 0 };
      const gp = AC.Gamepad.resolveActiveGamepad(this.gpState);
      AC.Gamepad.updateBanner(this.gpState, this.elGpBadge, this.elGpLabel, 'DualSense / لوحة');
      if (!gp) return { lx: 0, ly: 0, rx: 0, ry: 0 };

      // 1. PauseMenu Start (Button 9) FIRST!
      if (this.pauseMenu && this.pauseMenu.pollGamepad(gp, this.gpState)) {
        return { lx: 0, ly: 0, rx: 0, ry: 0 };
      }

      // 2. Result Overlay Navigation
      if (this.resultOpen) {
        const nav = AC.Gamepad.sampleDirectionalNav(gp, this.gpState);
        if (nav.dUp) this.moveResultFocus(-1);
        if (nav.dDown) this.moveResultFocus(1);
        if (AC.Gamepad.justPressed(gp, this.gpState, 0)) {
          const btns = this.getResultBtns();
          AC.Gamepad.snapshotButtons(gp, this.gpState);
          btns[this.resultFocusIdx]?.click();
          return { lx: 0, ly: 0, rx: 0, ry: 0 };
        }
        if (AC.Gamepad.justPressed(gp, this.gpState, 3)) {
          AC.Gamepad.snapshotButtons(gp, this.gpState);
          document.getElementById('btnResRetry')?.click();
          return { lx: 0, ly: 0, rx: 0, ry: 0 };
        }
        if (AC.Gamepad.justPressed(gp, this.gpState, 1)) {
          AC.Gamepad.snapshotButtons(gp, this.gpState);
          root.location.href = '../../index.html?from=game';
          return { lx: 0, ly: 0, rx: 0, ry: 0 };
        }
        AC.Gamepad.snapshotButtons(gp, this.gpState);
        return { lx: 0, ly: 0, rx: 0, ry: 0 };
      }

      // 3. Active Gameplay Analog Sticks + D-Pad Continuous + Face/Trigger/Shoulder Buttons
      const axes = AC.Gamepad.sampleAnalogAxes(gp, 0.16);
      const nav = AC.Gamepad.sampleDirectionalNav(gp, this.gpState);
      const hat = AC.Gamepad.decodeDpadHat(gp);
      const b = gp.buttons || [];
      if ((b[14] && b[14].pressed) || hat.left) this.dpadVec.x -= 1;
      if ((b[15] && b[15].pressed) || hat.right) this.dpadVec.x += 1;
      if ((b[12] && b[12].pressed) || hat.up) this.dpadVec.y -= 1;
      if ((b[13] && b[13].pressed) || hat.down) this.dpadVec.y += 1;

      if (Math.hypot(axes.lx, axes.ly) > 0.18 || Math.hypot(axes.rx, axes.ry) > 0.18 || this.dpadVec.x !== 0 || this.dpadVec.y !== 0) {
        this.inputMode = 'gamepad';
      }

      if (AC.Gamepad.justPressed(gp, this.gpState, 0)) { this.flashPad('cross'); this.triggerAction('cross'); }
      if (AC.Gamepad.justPressed(gp, this.gpState, 2)) { this.flashPad('square'); this.triggerAction('square'); }
      if (AC.Gamepad.justPressed(gp, this.gpState, 3)) { this.flashPad('triangle'); this.triggerAction('triangle'); }
      if (AC.Gamepad.justPressed(gp, this.gpState, 1)) { this.flashPad('circle'); this.triggerAction('circle'); }
      if (AC.Gamepad.justPressed(gp, this.gpState, 6, 0.45)) { this.flashPad('l2'); this.triggerAction('l2'); }
      if (AC.Gamepad.justPressed(gp, this.gpState, 7, 0.45)) { this.flashPad('r2'); this.triggerAction('r2'); }

      if (AC.Gamepad.justPressed(gp, this.gpState, 4)) {
        this.startOperation((this.opIdx - 1 + OPERATIONS.length) % OPERATIONS.length, false);
      }
      if (AC.Gamepad.justPressed(gp, this.gpState, 5)) {
        this.startOperation((this.opIdx + 1) % OPERATIONS.length, false);
      }

      // Allow D-pad / Left Stick discrete nudges on base-flipping wave
      if (nav.dLeft && this.opIdx === 4 && this.waveIdx === 0) { this.flashPad('l2'); this.triggerAction('l2'); }
      if (nav.dRight && this.opIdx === 4 && this.waveIdx === 0) { this.flashPad('r2'); this.triggerAction('r2'); }

      AC.Gamepad.snapshotButtons(gp, this.gpState);
      return axes;
    }

    sampleMoveVector(gpAxes) {
      let vx = (gpAxes.lx || 0) + this.dpadVec.x;
      let vy = (gpAxes.ly || 0) + this.dpadVec.y;
      if (this.keys.ArrowLeft || this.keys.KeyA) vx -= 1;
      if (this.keys.ArrowRight || this.keys.KeyD) vx += 1;
      if (this.keys.ArrowUp || this.keys.KeyW) vy -= 1;
      if (this.keys.ArrowDown || this.keys.KeyS) vy += 1;
      const m = Math.hypot(vx, vy);
      if (m > 1) { vx /= m; vy /= m; }
      return { vx, vy, rx: gpAxes.rx || 0, ry: gpAxes.ry || 0 };
    }

    // ---------- Update Loop ----------
    update(dt, gpAxes) {
      this.time += dt;
      this.radarAngle = (this.radarAngle + dt * 0.95) % (Math.PI * 2);

      if (this.toastTimer > 0) {
        this.toastTimer -= dt;
        if (this.toastTimer <= 0 && this.elToast) {
          this.elToast.classList.remove('visible');
        }
      }
      if (this.shakeTime > 0) this.shakeTime = Math.max(0, this.shakeTime - dt);
      if (this.damageFlash > 0) this.damageFlash = Math.max(0, this.damageFlash - dt);
      if (this.invulnTimer > 0) this.invulnTimer = Math.max(0, this.invulnTimer - dt);
      if (this.waveGuard > 0) this.waveGuard = Math.max(0, this.waveGuard - dt);

      // Update particles, rings, callouts, wake trail
      for (let i = this.particles.length - 1; i >= 0; i -= 1) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= dt;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
      for (let i = this.rings.length - 1; i >= 0; i -= 1) {
        const r = this.rings[i];
        r.life -= dt;
        r.r = lerp(12, r.maxR, 1 - r.life / r.maxLife);
        if (r.life <= 0) this.rings.splice(i, 1);
      }
      for (let i = this.callouts.length - 1; i >= 0; i -= 1) {
        const c = this.callouts[i];
        c.y -= 28 * dt;
        c.life -= dt;
        if (c.life <= 0) this.callouts.splice(i, 1);
      }
      for (let i = this.trail.length - 1; i >= 0; i -= 1) {
        this.trail[i].life -= dt;
        if (this.trail[i].life <= 0) this.trail.splice(i, 1);
      }

      if (this.hitStop > 0) {
        this.hitStop -= dt;
        return;
      }

      const mv = this.sampleMoveVector(gpAxes);
      if (this.opIdx === 0) this.updateOp1(dt, mv);
      else if (this.opIdx === 1) this.updateOp2(dt, mv);
      else if (this.opIdx === 2) this.updateOp3(dt, mv);
      else if (this.opIdx === 3) this.updateOp4(dt, mv);
      else this.updateOp5(dt, mv);
    }

    updateOp1(dt, mv) {
      const s = this.opState;
      const usePointer = this.inputMode === 'pointer' && this.pointer.active;
      if (this.waveIdx === 0) {
        if (Math.abs(mv.vx) > 0.05 || Math.abs(mv.vy) > 0.05) {
          s.subX = clamp(s.subX + mv.vx * 3.8 * dt, -2.2, 4.9);
          s.subY = clamp(s.subY - mv.vy * 3.2 * dt, -2.0, 2.5);
        } else if (usePointer) {
          s.subX = lerp(s.subX, clamp(this.pxToX(this.pointer.x, -2.5, 5.2), -2.2, 4.9), Math.min(1, dt * 8));
          s.subY = lerp(s.subY, clamp(this.pxToY(this.pointer.y, -2.4, 3.0), -2.0, 2.5), Math.min(1, dt * 8));
        }
        const subPx = this.xToPx(s.subX, -2.5, 5.2);
        const subPy = this.yToPx(s.subY, -2.4, 3.0);
        this.pushTrail(subPx, subPy, '#2dd4bf');

        if (s.shotBeam) {
          s.shotBeam.life -= dt;
          if (s.shotBeam.life <= 0) s.shotBeam = null;
        }
        if (s.curveEcho) {
          s.curveEcho.life -= dt;
          if (s.curveEcho.life <= 0) s.curveEcho = null;
        }

        s.spawnTimer -= dt;
        if (s.spawnTimer <= 0 && s.mines.length < 3) {
          this.spawnOp1Mine();
          s.spawnTimer = 2.55;
        }

        // Tactile lock-on chime when switching targeted mine
        let bestMine = null;
        let bestSc = Infinity;
        for (const m of s.mines) {
          const sc = dist(m.px, m.py, subPx, subPy) - m.py * 0.45;
          if (sc < bestSc) { bestSc = sc; bestMine = m; }
        }
        if (bestMine && bestMine.uid !== this.lastLockKey) {
          if (this.lastLockKey) this.audio.playLockTick(false);
          this.lastLockKey = bestMine.uid;
        }

        for (let i = s.mines.length - 1; i >= 0; i -= 1) {
          const m = s.mines[i];
          m.py += m.vy * dt;
          m.pulse += dt * 4;
          if (m.py >= this.play.y + this.play.h - 20) {
            s.mines.splice(i, 1);
            this.penalize(m.px, this.play.y + this.play.h - 24, 53, `انفجر اللغم $${m.label}$! صنّفه أسرع قبل وصوله للقاع`, true);
          }
        }
        const lnTxt = s.subX > 0.02 ? `\\ln(${s.subX.toFixed(2)}) = ${Math.log(s.subX).toFixed(2)}` : '\\notin D_{\\ln}';
        this.setReadout(`الغواصة: $x=${s.subX.toFixed(2)}$ • $${lnTxt}$ • تفكيك ${s.cleared} من ${s.targetClear}`);
      } else if (this.waveIdx === 1) {
        const stepX = mv.vx * 2.1 + mv.rx * 0.8;
        if (Math.abs(stepX) > 0.04) {
          s.subX = clamp(s.subX + stepX * dt, 0.18, 4.4);
        } else if (usePointer) {
          s.subX = lerp(s.subX, clamp(this.pxToX(this.pointer.x, 0.05, 4.6), 0.18, 4.4), Math.min(1, dt * 9));
        }
        const subPx = this.xToPx(s.subX, 0.05, 4.6);
        const subPy = this.yToPx(Math.log(s.subX), -2.2, 2.4);
        this.pushTrail(subPx, subPy, '#fcd34d');

        const cal = OP1_CALIBRATIONS[s.calIdx];
        const inSweet = Math.abs(s.subX - cal.targetX) <= cal.tol;
        if (inSweet && !this.lastSweetSpot) {
          this.audio.playLockTick(true);
        }
        this.lastSweetSpot = inSweet;

        for (const h of s.hazards) {
          h.y -= h.vy * dt;
          if (h.y < -2.3) {
            h.y = 2.6 + Math.random() * 1.2;
            h.x = 0.4 + Math.random() * 3.8;
          }
          const hx = this.xToPx(h.x, 0.05, 4.6);
          const hy = this.yToPx(h.y, -2.2, 2.4);
          if (dist(hx, hy, subPx, subPy) < 22) {
            h.y = 2.8;
            this.penalize(subPx, subPy, 56, 'اصطدام بكبسولة ضغط! تفادها أثناء المعايرة', true, true);
          }
        }
        this.setReadout(`$x = ${s.subX.toFixed(2)}$ • $\\ln(x) = ${Math.log(s.subX).toFixed(2)}$ • الميل $\\frac{1}{x} = ${(1 / s.subX).toFixed(2)}$`);
      } else {
        if (s.revealFlash) {
          s.revealFlash.life -= dt;
          if (s.revealFlash.life <= 0) {
            s.revealFlash = null;
            s.wallIdx += 1;
            s.sweepProgress = 0;
            if (s.wallIdx >= OP1_DOMAIN_WALLS.length) {
              this.advanceWave();
              return;
            }
            const nw = OP1_DOMAIN_WALLS[s.wallIdx];
            s.subX = nw.startX;
            this.trail = [];
            renderDOMMath(this.elPrompt, nw.prompt);
            renderDOMMath(this.elFormulaBar, `الدالة: $f(x) = ${nw.exprTex}$ • شرط التعريف: ما بداخل $\\ln$ موجب قطعاً`);
          }
          return;
        }
        const stepX = mv.vx * 3.6 + mv.rx * 1.3;
        if (Math.abs(stepX) > 0.04) {
          s.subX = clamp(s.subX + stepX * dt, -3.2, 4.2);
        } else if (usePointer) {
          s.subX = lerp(s.subX, clamp(this.pxToX(this.pointer.x, -3.5, 4.5), -3.2, 4.2), Math.min(1, dt * 9));
        }
        this.pushTrail(this.xToPx(s.subX, -3.5, 4.5), this.play.y + this.play.h * 0.56, '#2dd4bf');

        s.sweepProgress += s.sweepSpeed * dt;
        if (s.sweepProgress >= 1) {
          s.sweepProgress = 0;
          this.handleOp1Action('cross');
        }
        const wall = OP1_DOMAIN_WALLS[s.wallIdx];
        if (wall) {
          this.setReadout(`موقعك: $x = ${s.subX.toFixed(2)}$ • الدالة: $${wall.exprTex}$ • جدار ${s.wallIdx + 1} من ${OP1_DOMAIN_WALLS.length}`);
        }
      }
    }

    updateOp2(dt, mv) {
      const s = this.opState;
      const cx = this.play.x + this.play.w * 0.5;
      const cy = this.play.y + this.play.h * 0.52;
      const usePointer = this.inputMode === 'pointer' && this.pointer.active;

      if (Math.hypot(mv.rx, mv.ry) > 0.2) {
        s.aimAngle = Math.atan2(mv.ry, mv.rx);
      } else if (Math.hypot(mv.vx, mv.vy) > 0.2) {
        if (Math.abs(mv.vy) > 0.25) {
          s.aimAngle = Math.atan2(mv.vy, mv.vx);
        } else {
          s.aimAngle += mv.vx * 2.9 * dt;
        }
      } else if (usePointer) {
        s.aimAngle = Math.atan2(this.pointer.y - cy, this.pointer.x - cx);
      }

      if (s.beamFlash) {
        s.beamFlash.life -= dt;
        if (s.beamFlash.life <= 0) s.beamFlash = null;
      }

      // Lock-on chirp when polar aim acquires a new orb
      let lockedOrb = null;
      let bestDiff = 0.58;
      for (const o of s.orbs) {
        const d = Math.abs(angleDiff(s.aimAngle, o.angle));
        if (d < bestDiff) { bestDiff = d; lockedOrb = o; }
      }
      const lockKey = lockedOrb ? lockedOrb.uid : '';
      if (lockKey && lockKey !== this.lastLockKey) {
        if (this.lastLockKey) this.audio.playLockTick(false);
        this.lastLockKey = lockKey;
      } else if (!lockKey) {
        this.lastLockKey = '';
      }

      const maxR = Math.min(this.play.w, this.play.h) * 0.43;
      for (const o of s.orbs) {
        o.angle += o.angVel * dt;
        o.dist -= o.inwardVel * dt;
        if (o.dist <= 44) {
          o.dist = maxR * 0.94;
          this.penalize(cx, cy, 54, 'اصطدمت كرة بالقلب! صوّب وأطلق شعاع الصهر أسرع', true, true);
        }
      }

      const r = OP2_WAVES[this.waveIdx][s.roundIdx];
      this.setReadout(`الهدف: $${r.targetTex}$ • الأس $r=${this.formatExpTex()}$ • جولة ${s.roundIdx + 1} من ${OP2_WAVES[this.waveIdx].length}`);
    }

    updateOp3(dt, mv) {
      const s = this.opState;
      const usePointer = this.inputMode === 'pointer' && this.pointer.active;
      if (this.waveIdx === 0) {
        if (Math.abs(mv.vy) > 0.05) {
          s.subYNorm = clamp(s.subYNorm + mv.vy * 1.15 * dt, 0.14, 0.86);
        } else if (usePointer) {
          s.subYNorm = lerp(s.subYNorm, clamp((this.pointer.y - this.play.y) / this.play.h, 0.14, 0.86), Math.min(1, dt * 10));
        }
        this.pushTrail(this.play.x + this.play.w * 0.22, this.play.y + this.play.h * s.subYNorm, '#2dd4bf');

        if (s.dashFlash) {
          s.dashFlash.life -= dt;
          if (s.dashFlash.life <= 0) s.dashFlash = null;
        }

        s.wallXNorm -= s.wallSpeed * dt;
        if (s.wallXNorm <= 0.24) {
          this.resolveOp3Wall(false);
        }
        const chuteIdx = s.subYNorm < 0.34 ? 0 : (s.subYNorm < 0.67 ? 1 : 2);
        const w = OP3_WALLS[s.wallIdx];
        if (w) {
          this.setReadout(`المسار المختار: $${w.chutes[chuteIdx].label}$ • بوابة ${s.wallIdx + 1} من ${OP3_WALLS.length}`);
        }
      } else if (this.waveIdx === 1) {
        if (s.phase === 'ineq') {
          const stepX = mv.vx * 3.1 + mv.rx * 1.2;
          if (Math.abs(stepX) > 0.04) s.subX = clamp(s.subX + stepX * dt, -0.9, 4.5);
          else if (usePointer) s.subX = lerp(s.subX, clamp(this.pxToX(this.pointer.x, -1.2, 4.8), -0.9, 4.5), Math.min(1, dt * 9));
          this.pushTrail(this.xToPx(s.subX, -1.2, 4.8), this.play.y + this.play.h * 0.55, '#2dd4bf');

          s.sweep += s.sweepSpeed * dt;
          if (s.sweep >= 1) {
            s.sweep = 0;
            this.handleOp3Action('cross');
          }
          const iq = OP3_INEQS[s.ineqIdx];
          if (iq) {
            const argVal = s.ineqIdx === 0 ? s.subX - 1 : 2 * s.subX - 3;
            const valTex = argVal > 0.01 ? `\\ln(${argVal.toFixed(2)}) = ${Math.log(argVal).toFixed(2)}` : '\\notin D_E';
            this.setReadout(`$x = ${s.subX.toFixed(2)}$ • $${valTex}$ • متراجحة ${s.ineqIdx + 1} من ${OP3_INEQS.length}`);
          }
        } else {
          if (Math.abs(mv.vx) > 0.05 || Math.abs(mv.vy) > 0.05) {
            s.subX = clamp(s.subX + mv.vx * 3.5 * dt, 0.8, 6.9);
            s.subY = clamp(s.subY - mv.vy * 3.5 * dt, 0.8, 6.9);
          } else if (usePointer) {
            s.subX = lerp(s.subX, clamp(this.pxToX(this.pointer.x, 0.5, 7.2), 0.8, 6.9), Math.min(1, dt * 8));
            s.subY = lerp(s.subY, clamp(this.pxToY(this.pointer.y, 0.5, 7.2), 0.8, 6.9), Math.min(1, dt * 8));
          }
          this.pushTrail(this.xToPx(s.subX, 0.5, 7.2), this.yToPx(s.subY, 0.5, 7.2), '#2dd4bf');

          s.patrolAng += dt * 1.45;
          const hx = 3.8 + Math.cos(s.patrolAng) * 1.65;
          const hy = 3.8 + Math.sin(s.patrolAng) * 1.65;
          if (dist(s.subX, s.subY, hx, hy) < 0.52) {
            s.subX = 1.4; s.subY = 1.4;
            this.penalize(this.xToPx(hx, 0.5, 7.2), this.yToPx(hy, 0.5, 7.2), 55, 'تجنّب الشحنة الدوارة وتوجّه نحو حل النظمة!', true, true);
          }
          this.setReadout(`الموقع: $(x, y) = (${s.subX.toFixed(1)}, ${s.subY.toFixed(1)})$ • $xy = ${(s.subX * s.subY).toFixed(1)}$`);
        }
      } else {
        const cx = this.play.x + this.play.w * 0.5;
        const cy = this.play.y + this.play.h * 0.52;
        if (Math.hypot(mv.rx, mv.ry) > 0.2) s.aimAngle = Math.atan2(mv.ry, mv.rx);
        else if (Math.hypot(mv.vx, mv.vy) > 0.2) s.aimAngle = Math.atan2(mv.vy, mv.vx);
        else if (usePointer) s.aimAngle = Math.atan2(this.pointer.y - cy, this.pointer.x - cx);

        for (const p of s.pods) p.angle += 0.42 * dt;
        s.hazardAng -= 1.05 * dt;
        if (s.beamFlash) {
          s.beamFlash.life -= dt;
          if (s.beamFlash.life <= 0) s.beamFlash = null;
        }
        const r = OP3_UPRIME[s.roundIdx];
        if (r) {
          this.setReadout(`مفاعل ${s.roundIdx + 1} من ${OP3_UPRIME.length}: $${r.coreTex}$ • تجنّب الدرع الأحمر وأطلق $[\\times / ▢ / △ / ◯]$`);
        }
      }
    }

    updateOp4(dt, mv) {
      const s = this.opState;
      const usePointer = this.inputMode === 'pointer' && this.pointer.active;
      if (Math.abs(mv.vy) > 0.05) {
        s.subYNorm = clamp(s.subYNorm + mv.vy * 1.15 * dt, 0.1, 0.9);
      } else if (usePointer) {
        s.subYNorm = lerp(s.subYNorm, clamp((this.pointer.y - this.play.y) / this.play.h, 0.1, 0.9), Math.min(1, dt * 10));
      }

      if (s.mineBeam) {
        s.mineBeam.life -= dt;
        if (s.mineBeam.life <= 0) s.mineBeam = null;
      }
      if (s.dashFlash) {
        s.dashFlash.life -= dt;
        if (s.dashFlash.life <= 0) s.dashFlash = null;
      }

      s.progress += s.speed * dt;
      const subPx = this.play.x + 34 + s.progress * (this.play.w - 135);
      const subPy = this.play.y + this.play.h * s.subYNorm;
      this.pushTrail(subPx, subPy, '#2dd4bf');

      if (!s.mineCleared && !s.mineHit && s.progress >= 0.54) {
        s.mineHit = true;
        const mx = this.play.x + this.play.w * 0.54;
        const my = this.play.y + this.play.h * 0.5;
        this.penalize(mx, my, this.waveIdx === 2 ? 59 : 58, 'فاتك تفكيك اللغم قبل المنتصف! استخدم $[▢/△/◯]$ أسرع', false);
      }
      if (s.progress >= 0.95) {
        this.resolveOp4Gate();
      }
      const laneNames = ['+\\infty', '1', '0', '-\\infty'];
      const chosenLane = clamp(Math.floor(s.subYNorm * 4), 0, 3);
      this.setReadout(`البوابة المختارة: $${laneNames[chosenLane]}$ • مسار ${s.runIdx + 1} من ${OP4_RUNS[this.waveIdx].length}`);
    }

    updateOp5(dt, mv) {
      const s = this.opState;
      const usePointer = this.inputMode === 'pointer' && this.pointer.active;
      if (this.waveIdx === 0) {
        s.timer -= dt;
        const ceilSec = Math.ceil(s.timer);
        if (ceilSec <= 3 && ceilSec > 0 && ceilSec !== this.lastWarnSec) {
          this.lastWarnSec = ceilSec;
          this.audio.playWarnTick();
        }
        if (s.timer <= 0) {
          s.timer = s.maxTimer;
          this.lastWarnSec = -1;
          const b = OP5_BASE_BEACONS[s.beaconIdx];
          this.penalize(this.xToPx(b.bx, 0.1, 6.2), this.yToPx(b.by, -2.8, 2.8), 60, 'نفد وقت المعايرة! بدّل الأساس $a$ بـ $[L2/R2]$ ثم $[\\times]$', true);
        }
        const cur = BASE_OPTIONS[s.baseIdx];
        const b = OP5_BASE_BEACONS[s.beaconIdx];
        const yAtB = Math.log(b.bx) / Math.log(cur.a);
        const bxTex = b.bx === E ? 'e' : (Math.abs(b.bx - Math.sqrt(10)) < 0.01 ? '\\sqrt{10}' : String(b.bx));
        this.setReadout(`$a=${cur.tex}$ • $\\log_a(${bxTex}) = ${yAtB.toFixed(2)}$ • الوقت: ${Math.max(0, ceilSec)}ث`);
      } else if (this.waveIdx === 1) {
        const stepX = mv.vx * 3.0 + mv.rx * 1.15;
        if (Math.abs(stepX) > 0.04) {
          s.needleX = clamp(s.needleX + stepX * dt, -2.0, 3.5);
        } else if (usePointer) {
          s.needleX = lerp(s.needleX, clamp(this.pxToX(this.pointer.x, -2.2, 3.8), -2.0, 3.5), Math.min(1, dt * 10));
        }
        this.pushTrail(this.xToPx(s.needleX, -2.2, 3.8), this.play.y + this.play.h * 0.72, '#2dd4bf');

        if (s.beamFlash) {
          s.beamFlash.life -= dt;
          if (s.beamFlash.life <= 0) s.beamFlash = null;
        }
        s.waveY += s.waveSpeed * dt;
        if (s.waveY >= 0.92) {
          s.waveY = 0;
          this.handleOp5Action('cross');
        }
        const powVal = Math.pow(10, s.needleX);
        const powStr = powVal >= 100 ? Math.round(powVal) : powVal.toFixed(2);
        const dbVal = Math.round(10 * s.needleX);
        this.setReadout(`$x = ${s.needleX.toFixed(2)}$ • $10^x \\approx ${powStr}$ • ${dbVal >= 0 ? '+' : ''}${dbVal}\\,\\text{dB}`);
      } else {
        const stepX = mv.vx * 2.5 + mv.rx * 0.95;
        if (Math.abs(stepX) > 0.04) {
          s.subX = clamp(s.subX + stepX * dt, 0.2, 5.9);
        } else if (usePointer) {
          s.subX = lerp(s.subX, clamp(this.pxToX(this.pointer.x, 0.08, 6.2), 0.2, 5.9), Math.min(1, dt * 9));
        }
        const yFn = s.bossIdx === 0 ? (x) => x - 1 - Math.log(x) : (x) => Math.log(x) / x;
        const subPx = this.xToPx(s.subX, 0.08, 6.2);
        const subPy = this.yToPx(yFn(s.subX), -2.4, 3.2);
        this.pushTrail(subPx, subPy, s.bossIdx === 0 ? '#2dd4bf' : '#c084fc');

        if (s.stepIdx === 1) {
          const targetX = s.bossIdx === 0 ? 1 : E;
          const inSweet = Math.abs(s.subX - targetX) <= 0.34;
          if (inSweet && !this.lastSweetSpot) this.audio.playLockTick(true);
          this.lastSweetSpot = inSweet;
        } else {
          this.lastSweetSpot = false;
        }

        for (const o of s.orbs) {
          o.x += o.vx * dt;
          o.y += o.vy * dt;
          if (o.x < 0.25) { o.x = 6.05; o.y = -1.6 + Math.random() * 3.8; }
          if (o.y < -2.1 || o.y > 2.9) o.vy *= -1;
          const ox = this.xToPx(o.x, 0.08, 6.2);
          const oy = this.yToPx(o.y, -2.4, 3.2);
          if (dist(ox, oy, subPx, subPy) < 22) {
            o.x = 6.05;
            this.penalize(subPx, subPy, 62, 'أصابتك نبضة الزعيم! تحرّك على المنحنى لتفاديها', true, true);
          }
        }
        const dVal = s.bossIdx === 0 ? (s.subX - 1) / s.subX : (1 - Math.log(s.subX)) / (s.subX * s.subX);
        this.setReadout(`$x=${s.subX.toFixed(2)}$ • المشتقة $= ${dVal.toFixed(2)}$ • ختم ${s.stepIdx + 1} من 3`);
      }
    }

    // ---------- Rendering (Zero shadowBlur, Pure 60FPS Crisp Bioluminescent Sonar) ----------
    draw() {
      const ctx = this.ctx;
      ctx.save();

      // Screen shake on damage
      if (this.shakeTime > 0) {
        const mag = this.shakeAmp * (this.shakeTime / 0.24);
        ctx.translate((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2);
      }

      // Deep abyssal sonar backdrop
      ctx.fillStyle = '#040d12';
      ctx.fillRect(0, 0, this.W, this.H);

      // Subtle bioluminescent depth plankton & polar sonar backdrop grid
      this.drawAbyssBackdrop(ctx);

      // Operation-specific canvas scene
      if (this.opIdx === 0) this.drawOp1(ctx);
      else if (this.opIdx === 1) this.drawOp2(ctx);
      else if (this.opIdx === 2) this.drawOp3(ctx);
      else if (this.opIdx === 3) this.drawOp4(ctx);
      else this.drawOp5(ctx);

      // Shockwave rings
      for (const r of this.rings) {
        const alpha = clamp(r.life / r.maxLife, 0, 1);
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = alpha * 0.85;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Particles
      for (const p of this.particles) {
        ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Floating callouts
      for (const c of this.callouts) {
        ctx.globalAlpha = clamp(c.life / c.maxLife, 0, 1);
        drawMath(ctx, c.text, this.clampLabelX(c.x, 38), c.y, { color: c.color, fontSize: 15, bold: true });
      }
      ctx.globalAlpha = 1;

      // Damage edge vignette
      if (this.damageFlash > 0) {
        ctx.strokeStyle = `rgba(244, 63, 94, ${this.damageFlash * 1.8})`;
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, this.W - 10, this.H - 10);
      }

      ctx.restore();
    }

    drawAbyssBackdrop(ctx) {
      const cx = this.play.x + this.play.w * 0.5;
      const cy = this.play.y + this.play.h * 0.52;
      const maxR = Math.min(this.play.w, this.play.h) * 0.52;

      // Concentric faint sonar circles
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.075)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i += 1) {
        ctx.beginPath();
        ctx.arc(cx, cy, (maxR * i) / 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Live rotating sonar sweep ray
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.14)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(this.radarAngle) * maxR, cy + Math.sin(this.radarAngle) * maxR);
      ctx.stroke();

      // Drifting bioluminescent specks
      for (const d of this.ambientDots) {
        const y = ((d.y - this.time * d.spd) % 1 + 1) % 1;
        const x = d.x + Math.sin(this.time * 0.8 + d.y * 10) * 0.008;
        ctx.fillStyle = d.teal ? 'rgba(45, 212, 191, 0.22)' : 'rgba(244, 63, 94, 0.18)';
        ctx.beginPath();
        ctx.arc(x * this.W, y * this.H, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawTrail(ctx) {
      if (!this.trail.length) return;
      for (let i = 0; i < this.trail.length; i += 1) {
        const t = this.trail[i];
        const a = clamp(t.life / t.maxLife, 0, 1);
        ctx.fillStyle = this.combo >= 4 ? '#fcd34d' : t.color;
        ctx.globalAlpha = a * 0.42;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.8 + a * 3.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    drawSubmarine(ctx, x, y, color = '#2dd4bf', facingRight = true) {
      this.drawTrail(ctx);
      ctx.save();
      ctx.translate(x, y);
      if (this.invulnTimer > 0 && Math.floor(this.time * 18) % 2 === 0) {
        ctx.globalAlpha = 0.45;
      }
      if (!facingRight) ctx.scale(-1, 1);

      // Combo Overdrive double acoustic aura ring
      const hot = this.combo >= 4;
      ctx.strokeStyle = hot ? '#fcd34d' : color;
      ctx.globalAlpha *= 0.38 + 0.16 * Math.sin(this.time * 6);
      ctx.lineWidth = hot ? 2.2 : 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, hot ? 25 : 22, 0, Math.PI * 2);
      ctx.stroke();
      if (hot) {
        ctx.strokeStyle = '#5eead4';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, 29 + 2 * Math.sin(this.time * 9), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = this.invulnTimer > 0 && Math.floor(this.time * 18) % 2 === 0 ? 0.5 : 1;

      // Hull capsule
      ctx.fillStyle = '#0a2632';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 17, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Conning tower
      ctx.fillStyle = color;
      ctx.fillRect(-4, -14, 9, 5);

      // Glowing viewport
      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(7, -1, 4, 0, Math.PI * 2);
      ctx.fill();

      // Tail fin
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-23, -6);
      ctx.lineTo(-23, 6);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    drawAxes(ctx, xMin, xMax, yMin, yMax, opts = {}) {
      const ox = this.xToPx(0, xMin, xMax);
      const oy = this.yToPx(0, yMin, yMax);

      // Vertical & horizontal grid lines
      ctx.strokeStyle = 'rgba(148, 179, 188, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = Math.ceil(xMin); gx <= Math.floor(xMax); gx += 1) {
        const px = this.xToPx(gx, xMin, xMax);
        ctx.moveTo(px, this.play.y);
        ctx.lineTo(px, this.play.y + this.play.h);
      }
      for (let gy = Math.ceil(yMin); gy <= Math.floor(yMax); gy += 1) {
        const py = this.yToPx(gy, yMin, yMax);
        ctx.moveTo(this.play.x, py);
        ctx.lineTo(this.play.x + this.play.w, py);
      }
      ctx.stroke();

      // Main axes
      ctx.strokeStyle = 'rgba(240, 253, 250, 0.42)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      if (oy >= this.play.y && oy <= this.play.y + this.play.h) {
        ctx.moveTo(this.play.x, oy);
        ctx.lineTo(this.play.x + this.play.w, oy);
      }
      if (ox >= this.play.x && ox <= this.play.x + this.play.w) {
        ctx.moveTo(ox, this.play.y);
        ctx.lineTo(ox, this.play.y + this.play.h);
      }
      ctx.stroke();

      // Integer tick numbers (below x-axis)
      for (let gx = Math.ceil(xMin); gx <= Math.floor(xMax); gx += 1) {
        if (gx === 0 && opts.skipZero) continue;
        const px = this.xToPx(gx, xMin, xMax);
        drawMath(ctx, String(gx), px, clamp(oy + 14, this.play.y + 12, this.play.y + this.play.h - 10), {
          color: '#94b3bc', fontSize: 11, bold: false
        });
      }
      // Special Euler constant marker e placed ABOVE axis so it NEVER collides with '3' on mobile!
      if (opts.showE && E > xMin && E < xMax) {
        const ex = this.xToPx(E, xMin, xMax);
        ctx.strokeStyle = 'rgba(252, 211, 77, 0.42)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ex, this.play.y);
        ctx.lineTo(ex, this.play.y + this.play.h);
        ctx.stroke();
        ctx.setLineDash([]);
        // Crisp gold tick + pill label above axis
        const ey = clamp(oy - 15, this.play.y + 16, this.play.y + this.play.h - 18);
        ctx.fillStyle = 'rgba(7, 21, 29, 0.9)';
        ctx.strokeStyle = 'rgba(252, 211, 77, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(ex - 9, ey - 9, 18, 17, 5);
        ctx.fill();
        ctx.stroke();
        drawMath(ctx, 'e', ex, ey, { color: '#fcd34d', fontSize: 12 });
      }
    }

    drawCurve(ctx, fn, xMin, xMax, yMin, yMax, color, width = 2.6, startX = null) {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      let started = false;
      const sx = startX !== null ? startX : xMin;
      const steps = 180;
      for (let i = 0; i <= steps; i += 1) {
        const x = sx + ((xMax - sx) * i) / steps;
        const y = fn(x);
        if (!Number.isFinite(y) || y < yMin || y > yMax) {
          started = false;
          continue;
        }
        const px = this.xToPx(x, xMin, xMax);
        const py = this.yToPx(y, yMin, yMax);
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // ---------- Draw OP 1 ----------
    drawOp1(ctx) {
      const s = this.opState;
      if (this.waveIdx === 0) {
        const xMin = -2.5, xMax = 5.2, yMin = -2.4, yMax = 3.0;
        const wallX = this.xToPx(0, xMin, xMax);
        // Forbidden red zone x <= 0
        ctx.fillStyle = 'rgba(244, 63, 94, 0.14)';
        ctx.fillRect(this.play.x, this.play.y, Math.max(0, wallX - this.play.x), this.play.h);

        this.drawAxes(ctx, xMin, xMax, yMin, yMax, { showE: true });
        this.drawCurve(ctx, (x) => Math.log(x), xMin, xMax, yMin, yMax, '#2dd4bf', 2.8, 0.06);

        // Glowing Domain Wall x = 0
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(wallX, this.play.y);
        ctx.lineTo(wallX, this.play.y + this.play.h);
        ctx.stroke();

        drawMath(ctx, 'x \\le 0 \\notin D_{ln}', this.clampLabelX(this.play.x + (wallX - this.play.x) * 0.5, 48), this.play.y + 20, { color: '#fda4af', fontSize: 12 });
        drawMath(ctx, 'y = \\ln(x)', this.clampLabelX(this.xToPx(4.35, xMin, xMax), 40), this.yToPx(Math.log(4.35) - 0.45, yMin, yMax), { color: '#5eead4', fontSize: 13 });

        // Reference anchor (1, 0)
        const p1x = this.xToPx(1, xMin, xMax);
        const p1y = this.yToPx(0, yMin, yMax);
        ctx.fillStyle = '#fcd34d';
        ctx.beginPath();
        ctx.arc(p1x, p1y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Curve echo projection after destroying a mine (shows true point on ln(x) or bounce off x=0!)
        if (s.curveEcho) {
          const ea = clamp(s.curveEcho.life / s.curveEcho.maxLife, 0, 1);
          ctx.save();
          ctx.globalAlpha = ea;
          if (s.curveEcho.forbid) {
            ctx.strokeStyle = '#f43f5e';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(wallX, this.play.y);
            ctx.lineTo(wallX, this.play.y + this.play.h);
            ctx.stroke();
          } else {
            const ex = this.xToPx(s.curveEcho.xVal, xMin, xMax);
            const ey = this.yToPx(Math.log(s.curveEcho.xVal), yMin, yMax);
            ctx.strokeStyle = s.curveEcho.color;
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ex, this.yToPx(0, yMin, yMax));
            ctx.lineTo(ex, ey);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = s.curveEcho.color;
            ctx.beginPath();
            ctx.arc(ex, ey, 7, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Active firing laser pulse
        if (s.shotBeam) {
          ctx.save();
          ctx.globalAlpha = clamp(s.shotBeam.life / s.shotBeam.maxLife, 0, 1);
          ctx.strokeStyle = s.shotBeam.color;
          ctx.lineWidth = 5.5;
          ctx.beginPath();
          ctx.moveTo(s.shotBeam.x1, s.shotBeam.y1);
          ctx.lineTo(s.shotBeam.x2, s.shotBeam.y2);
          ctx.stroke();
          ctx.restore();
        }

        // Draw incoming sonar mines with danger proximity glow
        const subPx = this.xToPx(s.subX, xMin, xMax);
        const subPy = this.yToPx(s.subY, yMin, yMax);
        let lockedMine = null;
        let bestSc = Infinity;
        for (const m of s.mines) {
          const sc = dist(m.px, m.py, subPx, subPy) - m.py * 0.45;
          if (sc < bestSc) { bestSc = sc; lockedMine = m; }
        }

        for (const m of s.mines) {
          const isLock = m === lockedMine;
          const danger = m.py > this.play.y + this.play.h * 0.68;
          if (danger) {
            ctx.strokeStyle = 'rgba(244, 63, 94, 0.55)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(m.px, m.py, m.r + 6 + 3 * Math.sin(this.time * 12), 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = '#091b25';
          ctx.strokeStyle = isLock ? '#fcd34d' : (danger ? '#fb7185' : '#94b3bc');
          ctx.lineWidth = isLock ? 3 : 2;
          ctx.beginPath();
          ctx.arc(m.px, m.py, m.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          if (isLock) {
            ctx.strokeStyle = 'rgba(252, 211, 77, 0.55)';
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(subPx, subPy);
            ctx.lineTo(m.px, m.py);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          drawMath(ctx, m.label, m.px, m.py, { color: '#f0fdfa', fontSize: 13 });
        }

        this.drawSubmarine(ctx, subPx, subPy, '#2dd4bf', true);
      } else if (this.waveIdx === 1) {
        const xMin = 0.05, xMax = 4.6, yMin = -2.2, yMax = 2.4;
        this.drawAxes(ctx, xMin, xMax, yMin, yMax, { showE: true });

        // Shaded hyperbolic region under y = 1/t from 1 to subX
        const a = Math.min(1, s.subX);
        const b = Math.max(1, s.subX);
        const oy = this.yToPx(0, yMin, yMax);
        ctx.fillStyle = s.subX >= 1 ? 'rgba(45, 212, 191, 0.24)' : 'rgba(192, 132, 252, 0.28)';
        ctx.beginPath();
        ctx.moveTo(this.xToPx(a, xMin, xMax), oy);
        for (let i = 0; i <= 40; i += 1) {
          const t = lerp(a, b, i / 40);
          ctx.lineTo(this.xToPx(t, xMin, xMax), clamp(this.yToPx(1 / t, yMin, yMax), this.play.y, this.play.y + this.play.h));
        }
        ctx.lineTo(this.xToPx(b, xMin, xMax), oy);
        ctx.closePath();
        ctx.fill();

        // Signed hyperbolic area live readout near shaded region
        const midAreaX = this.clampLabelX(this.xToPx((a + b) * 0.5, xMin, xMax), 46);
        drawMath(ctx, `A = ${Math.log(s.subX).toFixed(2)}`, midAreaX, oy - 18, {
          color: s.subX >= 1 ? '#5eead4' : '#e9d5ff', fontSize: 12
        });

        this.drawCurve(ctx, (x) => 1 / x, xMin, xMax, yMin, yMax, 'rgba(252, 211, 77, 0.78)', 2.1, 0.22);
        this.drawCurve(ctx, (x) => Math.log(x), xMin, xMax, yMin, yMax, '#2dd4bf', 3, 0.09);

        drawMath(ctx, 'y = \\frac{1}{x}', this.clampLabelX(this.xToPx(0.85, xMin, xMax), 36), this.yToPx(1.55, yMin, yMax), { color: '#fcd34d', fontSize: 14 });
        drawMath(ctx, 'y = \\ln(x)', this.clampLabelX(this.xToPx(3.95, xMin, xMax), 40), this.yToPx(1.78, yMin, yMax), { color: '#5eead4', fontSize: 14 });

        // Target calibration beacon (with sweet-spot golden lock glow & safe clamped label!)
        const cal = OP1_CALIBRATIONS[s.calIdx];
        const tx = this.xToPx(cal.targetX, xMin, xMax);
        const ty = this.yToPx(Math.log(cal.targetX), yMin, yMax);
        const inSweet = Math.abs(s.subX - cal.targetX) <= cal.tol;
        const pulseR = (inSweet ? 20 : 16) + 4 * Math.sin(this.time * (inSweet ? 11 : 6));
        ctx.strokeStyle = inSweet ? '#2dd4bf' : '#fcd34d';
        ctx.lineWidth = inSweet ? 3.6 : 2.6;
        ctx.beginPath();
        ctx.arc(tx, ty, pulseR, 0, Math.PI * 2);
        ctx.stroke();
        drawMath(ctx, inSweet ? '✓ ' + cal.targetTex : cal.targetTex, this.clampLabelX(tx, 52), clamp(ty - 30, this.play.y + 18, this.play.y + this.play.h - 18), {
          color: inSweet ? '#5eead4' : '#fcd34d', fontSize: 13
        });

        // Falling pressure hazards
        for (const h of s.hazards) {
          const hx = this.xToPx(h.x, xMin, xMax);
          const hy = this.yToPx(h.y, yMin, yMax);
          ctx.fillStyle = '#4c0519';
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(hx, hy, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Live tangent slope line + right differential triangle (dx, dy = 1/x · dx) at submarine
        const sx = this.xToPx(s.subX, xMin, xMax);
        const sy = this.yToPx(Math.log(s.subX), yMin, yMax);
        const slope = 1 / s.subX;
        const dx = 0.45;
        const x1Px = this.xToPx(s.subX - dx, xMin, xMax);
        const y1Px = this.yToPx(Math.log(s.subX) - slope * dx, yMin, yMax);
        const x2Px = this.xToPx(s.subX + dx, xMin, xMax);
        const y2Px = this.yToPx(Math.log(s.subX) + slope * dx, yMin, yMax);
        // Differential triangle legs
        ctx.strokeStyle = 'rgba(251, 113, 133, 0.52)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(x2Px, sy);
        ctx.lineTo(x2Px, y2Px);
        ctx.stroke();
        ctx.setLineDash([]);
        // Main tangent segment
        ctx.strokeStyle = '#fb7185';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x1Px, y1Px);
        ctx.lineTo(x2Px, y2Px);
        ctx.stroke();

        this.drawSubmarine(ctx, sx, sy, inSweet ? '#fcd34d' : '#2dd4bf', true);
      } else {
        // Wave 3: Domain Shelter Wall with post-solve valid/invalid domain reveal flash
        const xMin = -3.5, xMax = 4.5, yMin = -2, yMax = 2;
        const wall = s.revealFlash ? s.revealFlash.wall : OP1_DOMAIN_WALLS[s.wallIdx];
        if (!wall) return;

        if (s.revealFlash) {
          const alpha = clamp(s.revealFlash.life / s.revealFlash.maxLife, 0, 1) * 0.28;
          const samples = 48;
          const segW = this.play.w / samples;
          for (let i = 0; i < samples; i += 1) {
            const mx = xMin + ((xMax - xMin) * (i + 0.5)) / samples;
            ctx.fillStyle = wall.valid(mx) ? `rgba(45, 212, 191, ${alpha})` : `rgba(244, 63, 94, ${alpha})`;
            ctx.fillRect(this.play.x + i * segW, this.play.y, segW + 1, this.play.h);
          }
        }

        this.drawAxes(ctx, xMin, xMax, yMin, yMax);

        // Draw boundary pillars (without spoiling valid side!)
        for (const bx of wall.boundX) {
          const px = this.xToPx(bx, xMin, xMax);
          ctx.strokeStyle = '#fcd34d';
          ctx.setLineDash([6, 5]);
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(px, this.play.y);
          ctx.lineTo(px, this.play.y + this.play.h);
          ctx.stroke();
          ctx.setLineDash([]);
          drawMath(ctx, `x = ${bx}`, this.clampLabelX(px, 32), this.play.y + 22, { color: '#fcd34d', fontSize: 13 });
        }

        // Approaching pressure sweep line from top
        const sweepY = this.play.y + s.sweepProgress * this.play.h * 0.56;
        ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
        ctx.fillRect(this.play.x, this.play.y, this.play.w, Math.max(0, sweepY - this.play.y));
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(this.play.x, sweepY);
        ctx.lineTo(this.play.x + this.play.w, sweepY);
        ctx.stroke();
        drawMath(ctx, wall.exprTex, this.play.x + this.play.w * 0.5, clamp(sweepY - 16, this.play.y + 18, this.play.y + this.play.h - 20), { color: '#fda4af', fontSize: 16 });

        const sx = this.xToPx(s.subX, xMin, xMax);
        const sy = this.play.y + this.play.h * 0.56;
        this.drawSubmarine(ctx, sx, sy, '#2dd4bf', true);
      }
    }

    // ---------- Draw OP 2 (360° Polar Logarithmic Forge) ----------
    drawOp2(ctx) {
      const s = this.opState;
      const cx = this.play.x + this.play.w * 0.5;
      const cy = this.play.y + this.play.h * 0.52;
      const maxR = Math.min(this.play.w, this.play.h) * 0.44;
      const r = OP2_WAVES[this.waveIdx][s.roundIdx];

      // Polar crosshair lines
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.14)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i += 1) {
        const a = (Math.PI * i) / 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
        ctx.stroke();
      }

      // Aiming sonar cone
      ctx.fillStyle = 'rgba(45, 212, 191, 0.1)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, s.aimAngle - 0.18, s.aimAngle + 0.18);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#5eead4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(s.aimAngle) * maxR, cy + Math.sin(s.aimAngle) * maxR);
      ctx.stroke();

      // Active beam flash
      if (s.beamFlash) {
        ctx.strokeStyle = s.beamFlash.color;
        ctx.lineWidth = 7;
        ctx.globalAlpha = s.beamFlash.life / 0.22;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(s.beamFlash.angle) * maxR, cy + Math.sin(s.beamFlash.angle) * maxR);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Orbiting logarithmic orbs
      let lockedOrb = null;
      let bestDiff = 0.58;
      for (const o of s.orbs) {
        const d = Math.abs(angleDiff(s.aimAngle, o.angle));
        if (d < bestDiff) { bestDiff = d; lockedOrb = o; }
      }

      for (const o of s.orbs) {
        const ox = cx + Math.cos(o.angle) * o.dist;
        const oy = cy + Math.sin(o.angle) * o.dist;
        const isLocked = o === lockedOrb;
        const nearCore = o.dist < 85;

        // Spiral trail hint
        ctx.strokeStyle = nearCore ? 'rgba(244, 63, 94, 0.55)' : 'rgba(244, 63, 94, 0.22)';
        ctx.lineWidth = nearCore ? 2.2 : 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, o.dist, o.angle - 0.35, o.angle);
        ctx.stroke();

        if (nearCore) {
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.65)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ox, oy, o.r + 5 + 3 * Math.sin(this.time * 14), 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.fillStyle = isLocked ? '#103442' : '#081b25';
        ctx.strokeStyle = isLocked ? '#fcd34d' : (nearCore ? '#fb7185' : '#2dd4bf');
        ctx.lineWidth = isLocked ? 3.2 : 2;
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        drawMath(ctx, o.tex, ox, oy, { color: isLocked ? '#fef08a' : '#f0fdfa', fontSize: 15 });
      }

      // Center Harmonic Emitter Hub
      ctx.fillStyle = '#071a24';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      drawMath(ctx, r.chamberTex, cx, cy - 10, { color: '#5eead4', fontSize: 14 });
      drawMath(ctx, '→ ' + r.targetTex, cx, cy + 12, { color: '#fcd34d', fontSize: 13 });

      // Live active exponent pill directly below emitter hub
      ctx.fillStyle = 'rgba(7, 21, 29, 0.92)';
      ctx.strokeStyle = r.op === 'pow' ? '#fcd34d' : 'rgba(148, 179, 188, 0.35)';
      ctx.lineWidth = r.op === 'pow' ? 2 : 1.2;
      ctx.beginPath();
      ctx.roundRect(cx - 34, cy + 49, 68, 22, 8);
      ctx.fill();
      ctx.stroke();
      drawMath(ctx, `r = ${this.formatExpTex()}`, cx, cy + 60, { color: r.op === 'pow' ? '#fcd34d' : '#94b3bc', fontSize: 12 });
    }

    // ---------- Draw OP 3 (Equations, Systems & u'/u) ----------
    drawOp3(ctx) {
      const s = this.opState;
      if (this.waveIdx === 0) {
        const w = OP3_WALLS[s.wallIdx];
        if (!w) return;
        const wallPx = this.play.x + this.play.w * s.wallXNorm;
        const subPx = this.play.x + this.play.w * 0.22;
        const subPy = this.play.y + this.play.h * s.subYNorm;
        const isMobile = this.W <= 680;
        const chuteW = isMobile ? 96 : 118;

        // 3 horizontal trench tracks
        for (let i = 0; i < 3; i += 1) {
          const ly = this.play.y + this.play.h * (0.18 + i * 0.32);
          ctx.strokeStyle = 'rgba(45, 212, 191, 0.16)';
          ctx.setLineDash([8, 8]);
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(this.play.x, ly);
          ctx.lineTo(this.play.x + this.play.w, ly);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Dash breach beam
        if (s.dashFlash) {
          ctx.save();
          ctx.globalAlpha = clamp(s.dashFlash.life / s.dashFlash.maxLife, 0, 1);
          ctx.strokeStyle = s.dashFlash.color;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(s.dashFlash.x1, s.dashFlash.y);
          ctx.lineTo(s.dashFlash.x2, s.dashFlash.y);
          ctx.stroke();
          ctx.restore();
        }

        // Approaching Bulkhead Wall with 3 Chutes (clipped horizontally to playfield)
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.play.x - 4, this.play.y - 4, this.play.w + 8, this.play.h + 8);
        ctx.clip();

        ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
        ctx.fillRect(wallPx - 14, this.play.y, 28, this.play.h);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.4;
        ctx.strokeRect(wallPx - 14, this.play.y, 28, this.play.h);

        w.chutes.forEach((ch, idx) => {
          const cy = this.play.y + this.play.h * (0.18 + idx * 0.32);
          const activeChute = (s.subYNorm < 0.34 ? 0 : (s.subYNorm < 0.67 ? 1 : 2)) === idx;
          ctx.fillStyle = activeChute ? '#0d3442' : '#081b25';
          ctx.strokeStyle = activeChute ? '#fcd34d' : '#2dd4bf';
          ctx.lineWidth = activeChute ? 3 : 2;
          ctx.beginPath();
          ctx.roundRect(wallPx - chuteW * 0.5, cy - 24, chuteW, 48, 12);
          ctx.fill();
          ctx.stroke();
          drawMath(ctx, ch.label, wallPx, cy, { color: '#f0fdfa', fontSize: isMobile ? 13 : 15 });
        });
        ctx.restore();

        this.drawSubmarine(ctx, subPx, subPy, '#2dd4bf', true);
      } else if (this.waveIdx === 1) {
        if (s.phase === 'ineq') {
          const iq = OP3_INEQS[s.ineqIdx];
          if (!iq) return;
          const xMin = -1.2, xMax = 4.8, yMin = -2, yMax = 2;
          this.drawAxes(ctx, xMin, xMax, yMin, yMax);
          this.drawCurve(ctx, iq.curveFn, xMin, xMax, yMin, yMax, '#2dd4bf', 2.8, iq.asymX + 0.05);

          // Domain asymptote x = asymX
          const ax = this.xToPx(iq.asymX, xMin, xMax);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(ax, this.play.y);
          ctx.lineTo(ax, this.play.y + this.play.h);
          ctx.stroke();
          drawMath(ctx, `x = ${iq.asymX === 1.5 ? '\\frac{3}{2}' : iq.asymX}`, this.clampLabelX(ax + 28, 36), this.play.y + 20, { color: '#fda4af', fontSize: 13 });

          // Sweeping wave
          const wy = this.play.y + s.sweep * this.play.h * 0.55;
          ctx.fillStyle = 'rgba(252, 211, 77, 0.09)';
          ctx.fillRect(this.play.x, this.play.y, this.play.w, Math.max(0, wy - this.play.y));
          ctx.strokeStyle = '#fcd34d';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(this.play.x, wy);
          ctx.lineTo(this.play.x + this.play.w, wy);
          ctx.stroke();

          this.drawSubmarine(ctx, this.xToPx(s.subX, xMin, xMax), this.play.y + this.play.h * 0.55, '#2dd4bf', true);
        } else {
          // System 2D grid
          const xMin = 0.5, xMax = 7.2, yMin = 0.5, yMax = 7.2;
          this.drawAxes(ctx, xMin, xMax, yMin, yMax);
          // Hyperbola xy = 12 and line x = 3y
          this.drawCurve(ctx, (x) => 12 / x, xMin, xMax, yMin, yMax, 'rgba(45, 212, 191, 0.55)', 2.2, 1.5);
          this.drawCurve(ctx, (x) => x / 3, xMin, xMax, yMin, yMax, 'rgba(252, 211, 77, 0.55)', 2.2, 0.6);

          for (const pt of s.sysPoints) {
            const px = this.xToPx(pt.x, xMin, xMax);
            const py = this.yToPx(pt.y, yMin, yMax);
            const near = dist(s.subX, s.subY, pt.x, pt.y) < 1.15;
            ctx.fillStyle = '#09222d';
            ctx.strokeStyle = near ? '#fcd34d' : '#2dd4bf';
            ctx.lineWidth = near ? 3 : 2;
            ctx.beginPath();
            ctx.arc(px, py, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            drawMath(ctx, pt.label, px, py, { color: '#f0fdfa', fontSize: 12 });
          }

          // Patrolling hazard
          const hx = this.xToPx(3.8 + Math.cos(s.patrolAng) * 1.65, xMin, xMax);
          const hy = this.yToPx(3.8 + Math.sin(s.patrolAng) * 1.65, yMin, yMax);
          ctx.fillStyle = '#4c0519';
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.arc(hx, hy, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          this.drawSubmarine(ctx, this.xToPx(s.subX, xMin, xMax), this.yToPx(s.subY, yMin, yMax), '#2dd4bf', true);
        }
      } else {
        // Wave 3: u'/u Reactor with active Armored Singularity Shield Arc!
        const cx = this.play.x + this.play.w * 0.5;
        const cy = this.play.y + this.play.h * 0.52;
        const isMobile = this.W <= 680;
        const rad = isMobile ? Math.min(this.play.w * 0.30, this.play.h * 0.33) : Math.min(this.play.w, this.play.h) * 0.34;
        const podW = isMobile ? 102 : 124;
        const r = OP3_UPRIME[s.roundIdx];
        if (!r) return;

        // Orbit circle
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.24)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Singularity shield track
        const blkR = rad * 0.56;
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.16)';
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, blkR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Aim ray (shows crimson warning tint if currently blocked by Singularity Shield!)
        const aimBlocked = Math.abs(angleDiff(s.aimAngle, s.hazardAng)) < 0.24;
        ctx.strokeStyle = aimBlocked ? '#fb7185' : '#5eead4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const rayLen = aimBlocked ? blkR : rad + 22;
        ctx.lineTo(cx + Math.cos(s.aimAngle) * rayLen, cy + Math.sin(s.aimAngle) * rayLen);
        ctx.stroke();

        if (s.beamFlash) {
          ctx.strokeStyle = s.beamFlash.color;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(s.beamFlash.angle) * (s.beamFlash.len || rad), cy + Math.sin(s.beamFlash.angle) * (s.beamFlash.len || rad));
          ctx.stroke();
        }

        // Orbiting Drone Pods
        const podBadges = ['▢', '△', '◯'];
        const podCols = ['#fb7185', '#c084fc', '#fcd34d'];
        let lockedIdx = 0;
        let bestD = Infinity;
        s.pods.forEach((p, idx) => {
          const d = Math.abs(angleDiff(s.aimAngle, p.angle));
          if (d < bestD) { bestD = d; lockedIdx = idx; }
        });

        s.pods.forEach((p, idx) => {
          const px = cx + Math.cos(p.angle) * rad;
          const py = cy + Math.sin(p.angle) * rad;
          const isLock = idx === lockedIdx;
          const podBlocked = Math.abs(angleDiff(p.angle, s.hazardAng)) < 0.24;
          ctx.fillStyle = isLock ? '#113747' : '#081b25';
          ctx.strokeStyle = podBlocked ? '#f43f5e' : (isLock ? '#fcd34d' : podCols[idx]);
          ctx.lineWidth = isLock ? 3.2 : 2.2;
          ctx.beginPath();
          ctx.roundRect(px - podW * 0.5, py - 24, podW, 48, 12);
          ctx.fill();
          ctx.stroke();
          drawMath(ctx, p.tex, px, py + 2, { color: '#f0fdfa', fontSize: isMobile ? 12 : 14 });
          drawMath(ctx, podBadges[idx], px - podW * 0.5 + 14, py - 14, { color: podCols[idx], fontSize: 11 });
        });

        // Armored Singularity Deflector Shield Arc (real blocker!)
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 7;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, blkR, s.hazardAng - 0.21, s.hazardAng + 0.21);
        ctx.stroke();
        ctx.lineCap = 'butt';
        const hx = cx + Math.cos(s.hazardAng) * blkR;
        const hy = cy + Math.sin(s.hazardAng) * blkR;
        ctx.fillStyle = '#4c0519';
        ctx.strokeStyle = '#fda4af';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hx, hy, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Central Reactor
        ctx.fillStyle = '#071a24';
        ctx.strokeStyle = r.mode === 'deriv' ? '#2dd4bf' : '#fcd34d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, isMobile ? 40 : 48, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        drawMath(ctx, r.coreTex, cx, cy, { color: '#f0fdfa', fontSize: isMobile ? 13 : 15 });
      }
    }

    // ---------- Draw OP 4 (Comparative Growth Trench Race) ----------
    drawOp4(ctx) {
      const s = this.opState;
      const run = OP4_RUNS[this.waveIdx][s.runIdx];
      if (!run) return;
      const lanes = [
        { label: '+\\infty', col: '#5eead4' },
        { label: '1', col: '#fcd34d' },
        { label: '0', col: '#38bdf8' },
        { label: '-\\infty', col: '#fb7185' }
      ];
      const activeLane = clamp(Math.floor(s.subYNorm * 4), 0, 3);

      // 4 Asymptotic Altitude Channels
      lanes.forEach((ln, i) => {
        const yTop = this.play.y + (this.play.h * i) / 4;
        const lh = this.play.h / 4;
        ctx.fillStyle = i === activeLane ? 'rgba(45, 212, 191, 0.12)' : 'rgba(7, 21, 29, 0.35)';
        ctx.fillRect(this.play.x, yTop, this.play.w, lh - 3);
        ctx.strokeStyle = 'rgba(148, 179, 188, 0.16)';
        ctx.strokeRect(this.play.x, yTop, this.play.w, lh - 3);

        // Right-edge glowing exit gate
        const gx = this.play.x + this.play.w - 78;
        ctx.fillStyle = i === activeLane ? 'rgba(45, 212, 191, 0.25)' : 'rgba(8, 25, 34, 0.9)';
        ctx.strokeStyle = ln.col;
        ctx.lineWidth = i === activeLane ? 3 : 1.8;
        ctx.beginPath();
        ctx.roundRect(gx, yTop + 6, 70, lh - 15, 10);
        ctx.fill();
        ctx.stroke();
        drawMath(ctx, ln.label, gx + 35, yTop + lh * 0.5, { color: ln.col, fontSize: 16 });
      });

      // Non-spoiler asymptotic echo trail: only reveals BEHIND the submarine's progress!
      const revealLimit = clamp(s.progress * 0.65, 0.04, 0.52);
      ctx.strokeStyle = 'rgba(252, 211, 77, 0.36)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      const steps = 28;
      for (let i = 0; i <= steps; i += 1) {
        const u = (i / steps) * revealLimit;
        const px = this.play.x + u * (this.play.w - 90);
        const val = clamp(run.fn(u), -2.2, 2.5);
        const py = this.play.y + this.play.h * clamp(0.62 - val * 0.22, 0.08, 0.92);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      const subPx = this.play.x + 34 + s.progress * (this.play.w - 135);
      const subPy = this.play.y + this.play.h * s.subYNorm;

      // Active Mine (properly hidden once cleared OR hit!) + pulsing sonar lock line
      if (!s.mineCleared && !s.mineHit) {
        const mx = this.play.x + (this.play.w - 90) * clamp(1 - (s.progress - 0.12) * 1.15, 0.18, 0.72);
        const my = this.play.y + this.play.h * 0.5;
        ctx.strokeStyle = 'rgba(252, 211, 77, 0.45)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(subPx, subPy);
        ctx.lineTo(mx, my);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#3b0718';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(mx, my, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        drawMath(ctx, run.mineLabel, mx, my, { color: '#fecdd3', fontSize: 16 });
      }

      if (s.mineBeam) {
        ctx.save();
        ctx.globalAlpha = clamp(s.mineBeam.life / s.mineBeam.maxLife, 0, 1);
        ctx.strokeStyle = s.mineBeam.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(s.mineBeam.x1, s.mineBeam.y1);
        ctx.lineTo(s.mineBeam.x2, s.mineBeam.y2);
        ctx.stroke();
        ctx.restore();
      }

      if (s.dashFlash) {
        ctx.save();
        ctx.globalAlpha = clamp(s.dashFlash.life / s.dashFlash.maxLife, 0, 1);
        ctx.strokeStyle = s.dashFlash.color;
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.moveTo(s.dashFlash.x1, s.dashFlash.y);
        ctx.lineTo(s.dashFlash.x2, s.dashFlash.y);
        ctx.stroke();
        ctx.restore();
      }

      this.drawSubmarine(ctx, subPx, subPy, '#2dd4bf', true);
    }

    // ---------- Draw OP 5 (Base-a, Decibel 10^x=a, Curve Study Boss) ----------
    drawOp5(ctx) {
      const s = this.opState;
      if (this.waveIdx === 0) {
        const xMin = 0.1, xMax = 6.2, yMin = -2.8, yMax = 2.8;
        this.drawAxes(ctx, xMin, xMax, yMin, yMax, { showE: true });

        const cur = BASE_OPTIONS[s.baseIdx];
        const curveCol = cur.inc ? '#2dd4bf' : '#f43f5e';
        this.drawCurve(ctx, (x) => Math.log(x) / Math.log(cur.a), xMin, xMax, yMin, yMax, curveCol, 3.2, 0.14);

        // Live derivative sign card in upper-left corner of plot
        const cardX = this.play.x + 8;
        const cardY = this.play.y + 8;
        ctx.fillStyle = 'rgba(7, 21, 29, 0.9)';
        ctx.strokeStyle = curveCol;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, 152, 30, 8);
        ctx.fill();
        ctx.stroke();
        drawMath(ctx, `(\\log_a x)' = \\frac{1}{x\\ln a} ${cur.inc ? '> 0' : '< 0'}`, cardX + 76, cardY + 15, { color: curveCol, fontSize: 12 });

        // Universal Invariant Pivot (1, 0) & (a, 1)
        const ax = this.xToPx(1, xMin, xMax);
        const ay = this.yToPx(0, yMin, yMax);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ax, ay, 5, 0, Math.PI * 2);
        ctx.fill();
        drawMath(ctx, '(1,0)', this.clampLabelX(ax + 18, 28), ay + 16, { color: '#e2e8f0', fontSize: 11 });

        if (cur.a <= 6) {
          const pax = this.xToPx(cur.a, xMin, xMax);
          const pay = this.yToPx(1, yMin, yMax);
          ctx.fillStyle = curveCol;
          ctx.beginPath();
          ctx.arc(pax, pay, 6, 0, Math.PI * 2);
          ctx.fill();
          drawMath(ctx, `(a,1)`, this.clampLabelX(pax, 28), pay - 18, { color: curveCol, fontSize: 12 });
        }

        // Target Beacon with live countdown ring
        const b = OP5_BASE_BEACONS[s.beaconIdx];
        const bx = this.xToPx(b.bx, xMin, xMax);
        const by = this.yToPx(b.by, yMin, yMax);
        const aligned = s.baseIdx === b.reqIdx;
        const timerFrac = clamp(s.timer / s.maxTimer, 0, 1);

        // Countdown progress arc around beacon
        ctx.strokeStyle = timerFrac < 0.28 ? '#f43f5e' : 'rgba(94, 234, 212, 0.55)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(bx, by, 26, -Math.PI * 0.5, -Math.PI * 0.5 + Math.PI * 2 * timerFrac);
        ctx.stroke();

        ctx.strokeStyle = aligned ? '#fcd34d' : '#ffffff';
        ctx.lineWidth = aligned ? 3.5 : 2.2;
        ctx.beginPath();
        ctx.arc(bx, by, 17 + 3 * Math.sin(this.time * 7), 0, Math.PI * 2);
        ctx.stroke();
        drawMath(ctx, b.label, this.clampLabelX(bx, 42), clamp(by - 34, this.play.y + 16, this.play.y + this.play.h - 16), { color: '#fcd34d', fontSize: 13 });
      } else if (this.waveIdx === 1) {
        const xMin = -2.2, xMax = 3.8;
        const w = OP5_DECIBEL_WAVES[s.roundIdx];
        if (!w) return;
        const trackY = this.play.y + this.play.h * 0.72;

        // Logarithmic Decade Ruler along trackY
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.play.x, trackY);
        ctx.lineTo(this.play.x + this.play.w, trackY);
        ctx.stroke();

        const ticks = [
          { x: -2, p: '0.01' }, { x: -1, p: '0.1' }, { x: 0, p: '1' },
          { x: 1, p: '10' }, { x: 2, p: '100' }, { x: 3, p: '1000' }
        ];
        for (const t of ticks) {
          const px = this.xToPx(t.x, xMin, xMax);
          ctx.strokeStyle = '#5eead4';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, trackY - 10);
          ctx.lineTo(px, trackY + 10);
          ctx.stroke();
          drawMath(ctx, `x=${t.x}`, this.clampLabelX(px, 24), trackY + 26, { color: '#f0fdfa', fontSize: 12 });
          drawMath(ctx, t.p, this.clampLabelX(px, 22), trackY - 22, { color: '#fcd34d', fontSize: 12 });
        }

        // Descending Decibel Shockwave
        const wy = this.play.y + s.waveY * (trackY - this.play.y);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.22)';
        ctx.fillRect(this.play.x, wy - 20, this.play.w, 40);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.play.x, wy + 20);
        ctx.lineTo(this.play.x + this.play.w, wy + 20);
        ctx.stroke();
        drawMath(ctx, w.tex, this.play.x + this.play.w * 0.5, wy, { color: '#ffe4e6', fontSize: 18 });

        // Vertical frequency aiming guide & active cancel beam
        const nxPx = this.xToPx(s.needleX, xMin, xMax);
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.35)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(nxPx, trackY);
        ctx.lineTo(nxPx, wy + 20);
        ctx.stroke();
        ctx.setLineDash([]);

        if (s.beamFlash) {
          ctx.save();
          ctx.globalAlpha = clamp(s.beamFlash.life / s.beamFlash.maxLife, 0, 1);
          ctx.strokeStyle = s.beamFlash.color;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(s.beamFlash.x, s.beamFlash.y1);
          ctx.lineTo(s.beamFlash.x, s.beamFlash.y2);
          ctx.stroke();
          ctx.restore();
        }

        // Player Tuning Submarine
        this.drawSubmarine(ctx, nxPx, trackY, '#2dd4bf', true);
      } else {
        // Wave 3: Logarithmic Curve Study Boss (Skill 62 — No Spoiler Labels + 6-Seal Integrity Bar + Live Variation Strip!)
        const xMin = 0.08, xMax = 6.2, yMin = -2.4, yMax = 3.2;
        this.drawAxes(ctx, xMin, xMax, yMin, yMax, { showE: true });
        const bi = s.bossIdx;
        const yFn = bi === 0 ? (x) => x - 1 - Math.log(x) : (x) => Math.log(x) / x;

        // 6-Segment Boss Integrity Bar (Top Center of Playfield)
        const totalSeals = 6;
        const brokenSeals = bi * 3 + s.stepIdx;
        const barW = Math.min(260, this.play.w - 30);
        const segW = (barW - (totalSeals - 1) * 5) / totalSeals;
        const barX = this.play.x + (this.play.w - barW) * 0.5;
        const barY = this.play.y + 8;
        for (let k = 0; k < totalSeals; k += 1) {
          const sxBar = barX + k * (segW + 5);
          const broken = k < brokenSeals;
          const curSeal = k === brokenSeals;
          ctx.fillStyle = broken ? '#2dd4bf' : (curSeal ? '#f43f5e' : 'rgba(148, 179, 188, 0.2)');
          ctx.beginPath();
          ctx.roundRect(sxBar, barY, segW, 7, 4);
          ctx.fill();
        }

        // Live Variation Sign Strip (unlocks cleanly after Step 1, positioned in guaranteed curve-free quadrant!)
        if (s.stepIdx >= 2) {
          const stripW = 180;
          const stripX = this.play.x + this.play.w - stripW - 8;
          const stripY = bi === 0 ? (this.play.y + this.play.h - 38) : (this.play.y + 20);
          ctx.fillStyle = 'rgba(7, 21, 29, 0.94)';
          ctx.strokeStyle = 'rgba(252, 211, 77, 0.6)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.roundRect(stripX, stripY, stripW, 28, 8);
          ctx.fill();
          ctx.stroke();
          const varTxt = bi === 0 ? "f'<0 ↘ | 0 | f'>0 ↗" : "g'>0 ↗ | 0 | g'<0 ↘";
          drawMath(ctx, varTxt, stripX + stripW * 0.5, stripY + 14, { color: '#fcd34d', fontSize: 11 });
        }

        // Vertical asymptote wall x = 0
        const ax = this.xToPx(0.08, xMin, xMax);
        ctx.strokeStyle = s.stepIdx === 0 ? '#f43f5e' : 'rgba(45, 212, 191, 0.5)';
        ctx.lineWidth = s.stepIdx === 0 ? 4 : 2;
        ctx.beginPath();
        ctx.moveTo(ax, this.play.y);
        ctx.lineTo(ax, this.play.y + this.play.h);
        ctx.stroke();

        // Reference asymptote / parabolic branch hint
        if (bi === 0) {
          this.drawCurve(ctx, (x) => x, xMin, xMax, yMin, yMax, 'rgba(252, 211, 77, 0.3)', 1.7);
          drawMath(ctx, 'y = x', this.clampLabelX(this.xToPx(3.0, xMin, xMax), 30), this.yToPx(2.8, yMin, yMax), { color: '#fcd34d', fontSize: 13 });
        } else if (s.stepIdx >= 2) {
          const y0Px = this.yToPx(0, yMin, yMax);
          ctx.strokeStyle = 'rgba(192, 132, 252, 0.55)';
          ctx.setLineDash([6, 4]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(this.play.x, y0Px);
          ctx.lineTo(this.play.x + this.play.w, y0Px);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Boss Curve
        this.drawCurve(ctx, yFn, xMin, xMax, yMin, yMax, bi === 0 ? '#2dd4bf' : '#c084fc', 3.4, 0.14);

        // Extremum marker: ONLY reveal coordinates AFTER Step 1 is actually locked (zero spoiler!)
        const extX = bi === 0 ? 1 : E;
        const exPx = this.xToPx(extX, xMin, xMax);
        const exPy = this.yToPx(yFn(extX), yMin, yMax);
        if (s.stepIdx >= 2) {
          ctx.fillStyle = '#fcd34d';
          ctx.beginPath();
          ctx.arc(exPx, exPy, 6, 0, Math.PI * 2);
          ctx.fill();
          drawMath(ctx, bi === 0 ? '(1,0)' : '(e,\\frac{1}{e})', this.clampLabelX(exPx, 36), exPy - 22, { color: '#fcd34d', fontSize: 12 });
        }

        // Boss Leviathan hazard orbs + right-edge incoming warning chevron
        for (const o of s.orbs) {
          const ox = this.xToPx(o.x, xMin, xMax);
          const oy = this.yToPx(o.y, yMin, yMax);
          if (o.x > 5.5) {
            ctx.fillStyle = '#f43f5e';
            ctx.beginPath();
            ctx.arc(this.play.x + this.play.w - 8, oy, 5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#4c0519';
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.arc(ox, oy, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Player Bathyscaphe riding the Boss Curve with live derivative sweet-spot halo during Step 1
        const sx = this.xToPx(s.subX, xMin, xMax);
        const sy = this.yToPx(yFn(s.subX), yMin, yMax);
        const inExtSweet = s.stepIdx === 1 && Math.abs(s.subX - extX) <= 0.34;
        if (inExtSweet) {
          ctx.strokeStyle = '#fcd34d';
          ctx.lineWidth = 2.8;
          ctx.beginPath();
          ctx.arc(sx, sy, 28 + 3 * Math.sin(this.time * 12), 0, Math.PI * 2);
          ctx.stroke();
          drawMath(ctx, "f'=0!", this.clampLabelX(sx, 30), sy - 34, { color: '#fcd34d', fontSize: 12 });
        }
        this.drawSubmarine(ctx, sx, sy, inExtSweet ? '#fcd34d' : '#2dd4bf', true);
      }
    }

    // ---------- Result Modal & Progress Recording ----------
    getResultBtns() {
      return Array.from(this.elResult.querySelectorAll('.res-btn'));
    }

    moveResultFocus(delta) {
      const btns = this.getResultBtns();
      if (!btns.length) return;
      this.resultFocusIdx = (this.resultFocusIdx + delta + btns.length) % btns.length;
      if (AC && AC.Gamepad) AC.Gamepad.applyFocusRing(btns, this.resultFocusIdx);
    }

    openResult(victory) {
      this.resultOpen = true;
      const acc = this.totalAttempts > 0 ? Math.round((this.correctCount / this.totalAttempts) * 100) : 100;
      const allCleared = this.clearedOps.size >= OPERATIONS.length;
      const rank = AC && AC.Progress
        ? AC.Progress.computeRank({ victory: victory && allCleared, accuracy: acc, sealsCleared: this.clearedOps.size, bypasses: 0 })
        : (victory ? 'S' : 'C');

      if (AC && AC.Progress) {
        AC.Progress.recordRun(GAME_ID, {
          score: this.score,
          stagesCleared: this.clearedOps.size,
          totalStages: OPERATIONS.length,
          victory: victory && allCleared,
          accuracy: acc,
          answersAlreadyRecorded: true
        });
      }

      const op = OPERATIONS[this.opIdx];
      document.getElementById('resEyebrow').textContent = victory ? 'OPERATION COMPLETE • تم الإتقان' : 'HULL BREACH • تحطم الهيكل';
      document.getElementById('resTitle').textContent = victory
        ? (allCleared ? 'أتممت سُونار اللوغاريتم 100%!' : `اكتملت: ${op.title}`)
        : 'انخفضت طاقة الهيكل — أعد المحاولة!';
      renderDOMMath(document.getElementById('resSub'), victory
        ? `تغطية ${op.skills} بدقة عالية • العمليات المنجزة: ${this.clearedOps.size} من ${OPERATIONS.length}`
        : 'راجع خواص $\\ln$ ومجال التعريف $]0, +\\infty[$ وانطلق مجدداً!');
      document.getElementById('resScore').textContent = String(this.score);
      document.getElementById('resAcc').textContent = `${acc}%`;
      document.getElementById('resCombo').textContent = `×${this.maxCombo}`;
      document.getElementById('resRank').textContent = rank;

      const btnNext = document.getElementById('btnResNext');
      if (btnNext) {
        btnNext.querySelector('span').textContent = this.opIdx < OPERATIONS.length - 1
          ? `▶ العملية ${this.opIdx + 2}: ${OPERATIONS[this.opIdx + 1].title}`
          : '▶ جولة جديدة من العملية 1';
      }

      this.elResult.classList.remove('hidden');
      this.resultFocusIdx = 0;
      if (AC && AC.Gamepad) AC.Gamepad.applyFocusRing(this.getResultBtns(), 0);
    }

    hideResult() {
      this.resultOpen = false;
      this.elResult?.classList.add('hidden');
    }

    // ---------- Main 60FPS RAF Loop ----------
    loop(now) {
      const dt = Math.min(0.05, Math.max(0.001, (now - this.lastFrameAt) / 1000));
      this.lastFrameAt = now;

      const gpAxes = this.pollGamepad(dt);
      if (!this.paused && !this.resultOpen) {
        this.update(dt, gpAxes);
      }
      this.draw();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  root.addEventListener('DOMContentLoaded', () => {
    if (AC && typeof AC.renderAllMath === 'function') AC.renderAllMath(document);
    root.__logPulse = new LogPulseGame();
  });
})(window);
