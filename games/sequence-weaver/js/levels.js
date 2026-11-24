/**
 * Sequence Weaver — Official 2BAC PC Lesson 3 (Skills 41–52)
 * Mathematical definitions, invariant evaluators & interactive round configs.
 * All formulas are formatted in clean LaTeX ($...$) for universal KaTeX rendering.
 * Strictly respects Hors-programme limits (no ε-N formal limit proofs).
 */

export const GAME_ID = 'sequence-weaver';

export const STAGES = [
  {
    id: 'stage-induction',
    tabTitle: '1. الترجع والمحدودية',
    skillLabel: 'المهارات 41–42',
    rounds: [
      {
        id: '1-1',
        skillTopic: '41_42_bounded_above',
        mode: 'cobweb-bound-ceil',
        title: 'برج الترجع والمكبر: $u_{n+1} = \\frac{1}{2}u_n + 2$',
        formula: '$u_{n+1} = \\frac{1}{2}u_n + 2$',
        mission: 'اسحب $u_0$ داخل المجال الآمن $[0, M]$ واضبط أصغر سقف $M$ يحقق استقرار المجال $f([0, M]) \\subset [0, M]$.',
        proof: 'التحقق: $u_0 \\in [0, 4]$. الافتراض: $0 \\le u_n \\le 4$. الإتمام: بالضرب في $\\frac{1}{2}$ وإضافة $2$ نجد $2 \\le u_{n+1} \\le 4$، إذن $(u_n)$ مكبورة بـ $M = 4$.',
        domain: { min: -0.4, max: 6.2 },
        f: (x) => 0.5 * x + 2,
        fixedPoints: [4],
        params: [
          { key: 'u0', label: 'البذرة البدئية $u_0$', min: 0, max: 5.5, step: 0.25, init: 0.75 },
          { key: 'boundM', label: 'السقف المكبر $M$', min: 2.0, max: 6.0, step: 0.25, init: 5.5 }
        ],
        evaluate(st) {
          const u0 = st.u0;
          const M = st.boundM;
          const baseOk = u0 >= 0 && u0 <= M && u0 <= 3.75;
          const imageMax = 0.5 * M + 2;
          const stepOk = imageMax <= M + 1e-6;
          const sharpOk = M <= 4.25;
          const checks = [
            { label: `التحقق البدئي: $u_0 = ${u0.toFixed(2)} \\in [0, M[$`, ok: baseOk },
            { label: `الاستقرار $f([0, M]) \\subset [0, M]$ ($f(M) = ${imageMax.toFixed(2)}$)`, ok: stepOk },
            { label: 'أصغر مكبر دقيق ($M \\approx 4$)', ok: stepOk && sharpOk }
          ];
          let failMsg = '';
          if (!baseOk) failMsg = u0 > M ? `$u_0 = ${u0.toFixed(2)}$ تتجاوز السقف $M$!` : 'اختر $u_0 < 4$ لملاحظة الصعود نحو السقف!';
          else if (!stepOk) failMsg = `انكسر الترجع! $f(${M.toFixed(2)}) = ${imageMax.toFixed(2)} > ${M.toFixed(2)}$`;
          else if (!sharpOk) failMsg = `$M = ${M.toFixed(2)}$ مكبر مقبول لكنه ليس الأصغر؛ قرّبه إلى النقطة الصامدة $4$!`;
          return {
            ok: baseOk && stepOk && sharpOk,
            checks,
            failMsg,
            okMsg: 'تطابق تام! السلسلة الترجعية صعدت داخل $[0, 4]$ واستقرت عند $4$.',
            boundBox: { min: 0, max: M }
          };
        }
      },
      {
        id: '1-2',
        skillTopic: '41_42_bounded_below',
        mode: 'cobweb-bound-floor',
        title: 'المصغورة بالترجع: $u_{n+1} = \\sqrt{u_n + 2}$',
        formula: '$u_{n+1} = \\sqrt{u_n + 2}$',
        mission: 'ضع $u_0 \\ge 2.5$ وارفع الحاجز السفلي $m$ إلى أكبر قيمة صامدة تجعل $f([m, 6]) \\subset [m, 6]$.',
        proof: 'التحقق: $u_0 \\ge 2$. الافتراض: $u_n \\ge 2 \\Rightarrow u_n + 2 \\ge 4 \\Rightarrow \\sqrt{u_n + 2} \\ge 2$. إذن المتتالية مصغورة بأكبر مصغر صامد $m = 2$.',
        domain: { min: 0, max: 6.5 },
        f: (x) => (x + 2 >= 0 ? Math.sqrt(x + 2) : NaN),
        fixedPoints: [2],
        params: [
          { key: 'u0', label: 'البذرة البدئية $u_0$', min: 1.0, max: 6.0, step: 0.25, init: 5.25 },
          { key: 'boundm', label: 'الحاجز المصغر $m$', min: 0.5, max: 4.0, step: 0.25, init: 0.75 }
        ],
        evaluate(st) {
          const u0 = st.u0;
          const m = st.boundm;
          const baseOk = u0 >= m && u0 >= 2.5 && u0 <= 6;
          const imageMin = Math.sqrt(m + 2);
          const stepOk = imageMin >= m - 1e-6;
          const sharpOk = m >= 1.85;
          const checks = [
            { label: `التحقق البدئي: $u_0 = ${u0.toFixed(2)} \\in [m, 6]$`, ok: baseOk },
            { label: `الاستقرار $f(m) = ${imageMin.toFixed(2)} \\ge m$`, ok: stepOk },
            { label: 'أكبر مصغر دقيق ($m = 2$)', ok: stepOk && sharpOk }
          ];
          let failMsg = '';
          if (!baseOk) failMsg = u0 < m ? '$u_0$ تحت الحاجز $m$!' : 'ضع $u_0 \\ge 2.5$ لتنزل المتتالية نحو المصغر!';
          else if (!stepOk) failMsg = `انكسر الترجع! $\\sqrt{${m.toFixed(2)} + 2} = ${imageMin.toFixed(2)} < ${m.toFixed(2)}$`;
          else if (!sharpOk) failMsg = `$m = ${m.toFixed(2)}$ مصغر صحيح لكنه فضفاض؛ ارفعه نحو $2$!`;
          return {
            ok: baseOk && stepOk && sharpOk,
            checks,
            failMsg,
            okMsg: 'ممتاز! المتتالية الترجعية بقيت محمية فوق المصغر الحرج $m = 2$.',
            boundBox: { min: m, max: 6 }
          };
        }
      }
    ]
  },
  {
    id: 'stage-monotone',
    tabTitle: '2. الرتابة و MCT',
    skillLabel: 'المهارات 43 و 48',
    rounds: [
      {
        id: '2-1',
        skillTopic: '43_48_mct_decreasing',
        mode: 'monotone-balance',
        title: 'ميزان $f(x) - x$ والتقارب الرتيب',
        formula: '$u_{n+1} = \\frac{u_n^2 + 3}{4}$',
        mission: 'اسحب $u_0$ إلى المنطقة التي تكون فيها $(u_n)$ تناقصية ومصغورة لتتقارب، ثم حدد رتابتها.',
        proof: '$u_{n+1} - u_n = \\frac{(u_n - 1)(u_n - 3)}{4}$. على $]1, 3[$ يكون $f(x) - x < 0$ (تناقصية) ومصغورة بـ $1$، فتتقارب نحو $1$ بمبرهنة التقارب الرتيب.',
        domain: { min: -0.2, max: 4.2 },
        f: (x) => (x * x + 3) / 4,
        fixedPoints: [1, 3],
        params: [
          { key: 'u0', label: 'البذرة البدئية $u_0$', min: 0.1, max: 3.9, step: 0.1, init: 3.4 }
        ],
        choice: {
          key: 'dir',
          label: 'تحديد إشارة $u_{n+1} - u_n$',
          options: [
            { value: 'inc', label: 'تزايدية ($f(x) > x$)' },
            { value: 'dec', label: 'تناقصية ($f(x) < x$)' }
          ],
          init: 'inc'
        },
        evaluate(st) {
          const u0 = st.u0;
          const inZone = u0 > 1.15 && u0 < 2.85;
          const actualDec = ((u0 * u0 + 3) / 4) - u0 < -1e-6;
          const dirOk = st.dir === 'dec' && actualDec;
          const checks = [
            { label: `التموضع في مجال التناقص $]1, 3[$: $u_0 = ${u0.toFixed(2)}$`, ok: inZone },
            { label: 'تأكيد إشارة الفرق $u_{n+1} - u_n < 0$', ok: dirOk },
            { label: 'مبرهنة التقارب الرتيب: تناقصية + مصغورة بـ $1$', ok: inZone && dirOk }
          ];
          let failMsg = '';
          if (u0 >= 3) failMsg = 'انتبه! لـ $u_0 > 3$ المتتالية تزايدية وغير مكبورة فتتباعد نحو $+\\infty$!';
          else if (u0 <= 1.15) failMsg = 'هنا $(u_n)$ تزايدية نحو $1$، والمطلوب مجال التناقص $]1, 3[$!';
          else if (!dirOk) failMsg = 'تحقق من إشارة الفرق $f(u_0) - u_0$ أسفل المستقيم $y = x$!';
          return {
            ok: inZone && dirOk,
            checks,
            failMsg,
            okMsg: 'أحسنت! تناقصية على $]1, 3[$ ومصغورة بـ $1 \\Rightarrow$ متقاربة نحو $1$.'
          };
        }
      },
      {
        id: '2-2',
        skillTopic: '43_48_mct_increasing',
        mode: 'monotone-balance',
        title: 'تزايدية ومكبورة أم متناقصة؟',
        formula: '$u_{n+1} = \\frac{3u_n}{1 + u_n}$',
        mission: 'اسحب $u_0$ لتكون $(u_n)$ تزايدية ومكبورة بـ $2$ ثم ثبّت اختيار الرتابة الصحيح لتتقارب نحو $2$.',
        proof: '$u_{n+1} - u_n = \\frac{u_n(2 - u_n)}{1 + u_n}$. إذا كان $u_0 \\in ]0, 2[$ فإن $u_{n+1} - u_n > 0$ (تزايدية) و $u_n < 2$ (مكبورة)، إذن متقاربة نحو $2$.',
        domain: { min: 0, max: 4.0 },
        f: (x) => (3 * x) / (1 + x),
        fixedPoints: [0, 2],
        params: [
          { key: 'u0', label: 'البذرة البدئية $u_0$', min: 0.2, max: 3.6, step: 0.1, init: 3.1 }
        ],
        choice: {
          key: 'dir',
          label: 'تحديد إشارة $u_{n+1} - u_n$',
          options: [
            { value: 'inc', label: 'تزايدية ($f(x) > x$)' },
            { value: 'dec', label: 'تناقصية ($f(x) < x$)' }
          ],
          init: 'dec'
        },
        evaluate(st) {
          const u0 = st.u0;
          const inZone = u0 >= 0.2 && u0 <= 1.85;
          const dirOk = st.dir === 'inc' && (((3 * u0) / (1 + u0)) - u0 > 0);
          const checks = [
            { label: `مجال التزايد المكبور $]0, 2[$: $u_0 = ${u0.toFixed(2)}$`, ok: inZone },
            { label: 'إشارة الفرق $u_{n+1} - u_n > 0$', ok: dirOk },
            { label: 'تزايدية + مكبورة بـ $2 \\Rightarrow$ متقاربة', ok: inZone && dirOk }
          ];
          let failMsg = '';
          if (!inZone) failMsg = 'لـ $u_0 > 2$ المتتالية تناقصية! اسحب $u_0$ إلى $]0, 2[$ لتكون تزايدية ومكبورة.';
          else if (!dirOk) failMsg = 'المنحنى فوق $y = x$ في $]0, 2[$؛ غيّر التشخيص إلى تزايدية!';
          return {
            ok: inZone && dirOk,
            checks,
            failMsg,
            okMsg: 'ممتاز! تزايدية ومكبورة بـ $2 \\Rightarrow$ متقاربة نحو $L = 2$.'
          };
        }
      }
    ]
  },
  {
    id: 'stage-progression',
    tabTitle: '3. الحسابية والهندسية',
    skillLabel: 'المهارات 44، 45، 47',
    rounds: [
      {
        id: '3-1',
        skillTopic: '45_47_geometric_limit',
        mode: 'geometric-spectrum',
        title: 'رنين المتتالية الهندسية ونهاية $q^n$',
        formula: '$u_n = 4 \\cdot q^n$',
        mission: 'اضبط الأساس $q$ لتكون $(u_n)$ متناوبة الإشارة ومتقاربة نحو $0$ وتمر بالبوابة $u_2 = 1$.',
        proof: 'لأن $-1 < q < 1$ فإن $\\lim_{n\\to+\\infty} q^n = 0$. ولتحقيق $u_2 = 4q^2 = 1$ مع التناوب ($q < 0$) يكون $q = -\\frac{1}{2}$.',
        params: [
          { key: 'q', label: 'الأساس الهندسي $q$', min: -1.35, max: 1.35, step: 0.05, init: 1.1 }
        ],
        u0: 4,
        targetGate: { n: 2, y: 1 },
        evaluate(st) {
          const q = st.q;
          const convZero = Math.abs(q) < 1;
          const altSign = q < 0;
          const u2 = 4 * q * q;
          const hitGate = Math.abs(u2 - 1) <= 0.04;
          const checks = [
            { label: `شرط التقارب نحو $0$: $|q| < 1$ ($q = ${q.toFixed(2)}$)`, ok: convZero },
            { label: 'التناوب: $q < 0$', ok: altSign },
            { label: `عبور البوابة $u_2 = 4q^2 = 1$ (الحالي $${u2.toFixed(2)}$)`, ok: hitGate }
          ];
          let failMsg = '';
          if (q <= -1) failMsg = 'عند $q \\le -1$ تتأرجح المتتالية ولا تقبل نهاية (متباعدة)!';
          else if (q >= 1) failMsg = 'عند $q > 1$ تؤول المتتالية نحو $+\\infty$ (متباعدة)!';
          else if (!altSign) failMsg = 'اجعل $q$ سالباً لتحقيق التناوب والمرور من البوابة!';
          else if (!hitGate) failMsg = `$u_2 = ${u2.toFixed(2)} \\neq 1$؛ اضبط $q = -0.50$!`;
          return {
            ok: convZero && altSign && hitGate,
            checks,
            failMsg,
            okMsg: 'رنين مثالي! $q = -\\frac{1}{2}$ يحقق $u_2 = 1$ والتقارب المتناوب نحو $0$.'
          };
        }
      },
      {
        id: '3-2',
        skillTopic: '44_47_arithmetic_and_ref',
        mode: 'arithmetic-and-ref',
        title: 'الجسر الحسابي والحدود المرجعية $n^p$',
        formula: '$u_n = u_2 + (n - 2)r \\quad|\\quad w_n = n^p$',
        mission: 'اضبط أساس الحسابية $r$ لتبلغ البوابة $u_7 = 20$ (حيث $u_2 = 5$ ومجموع $6$ حدود $= 75$)، ثم اختر أساً $p$ يجعل $w_n = n^p$ متقاربة نحو $0$.',
        proof: '$u_7 = u_2 + 5r \\Rightarrow 20 = 5 + 5r \\Rightarrow r = 3$، والمجموع $S = \\frac{6(5+20)}{2} = 75$. ولـ $p < 0$ تؤول $n^p = \\frac{1}{n^{-p}}$ نحو $0$.',
        params: [
          { key: 'r', label: 'أساس الحسابية $r$', min: -1, max: 6, step: 0.5, init: 1 },
          { key: 'p', label: 'أس المرجعية $p$ في $n^p$', min: -2, max: 2, step: 0.5, init: 1 }
        ],
        evaluate(st) {
          const r = st.r;
          const p = st.p;
          const u7 = 5 + 5 * r;
          const sum = (6 * (5 + u7)) / 2;
          const rOk = Math.abs(r - 3) < 0.05;
          const pOk = p < -0.05;
          const checks = [
            { label: `الحد السابع $u_7 = ${u7.toFixed(1)}$ (الهدف $20$)`, ok: rOk },
            { label: `مجموع الحدود $S = ${sum.toFixed(1)}$ (الهدف $75$)`, ok: rOk },
            { label: 'تقارب المرجعية $n^p \\to 0$ (شرط $p < 0$)', ok: pOk }
          ];
          let failMsg = '';
          if (!rOk) failMsg = `مع $r = ${r.toFixed(1)}$ نجد $u_7 = ${u7.toFixed(1)}$ و $S = ${sum.toFixed(1)}$ (الهدف $20$ و $75$)!`;
          else if (!pOk) failMsg = 'عند $p \\ge 0$ لا تؤول $n^p$ إلى $0$؛ اختر $p < 0$ مثل $-1$ أو $-0.5$!';
          return {
            ok: rOk && pOk,
            checks,
            failMsg,
            okMsg: 'جسر مضبوط! $r = 3$ يمنح $S = 75$، و $\\frac{1}{n^{-p}}$ يؤول نحو $0$.'
          };
        }
      },
      {
        id: '3-3',
        skillTopic: '45_geometric_sum',
        mode: 'geometric-sum-tower',
        title: 'خزان المجموع الهندسي $S_4 = u_0 \\frac{1 - q^5}{1 - q}$',
        formula: '$S_4 = \\sum_{k=0}^{4} u_0 q^k = u_0 \\frac{1 - q^5}{1 - q} \\quad (u_0 = 1)$',
        mission: 'اضبط الأساس $q$ لملء خزان المجموع الهندسي للحدود الخمسة الأولى ($k=0..4$) حتى المستوى الهدف $S_4 = 31$.',
        proof: 'لـ $q \\neq 1$ لدينا $S_4 = u_0 \\frac{1 - q^{4-0+1}}{1 - q} = \\frac{1 - q^5}{1 - q}$. وبالتعويض بـ $q = 2$ نجد $S_4 = \\frac{1 - 32}{1 - 2} = 31$ (أما لـ $q = 1$ فالمجموع $5u_0 = 5$).',
        u0: 1,
        targetSum: 31,
        params: [
          { key: 'q', label: 'الأساس الهندسي $q$', min: -1.0, max: 2.5, step: 0.25, init: 1.0 }
        ],
        evaluate(st) {
          const q = st.q;
          const isOne = Math.abs(q - 1) < 1e-4;
          const sum = isOne ? 5 : (1 - Math.pow(q, 5)) / (1 - q);
          const hit = Math.abs(sum - 31) <= 0.15;
          const checks = [
            { label: isOne ? 'حالة خاصة $q = 1 \\Rightarrow S_4 = 5u_0 = 5$' : `قيمة الصيغة $S_4 = \\frac{1 - q^5}{1 - q} = ${sum.toFixed(2)}$`, ok: !isOne && hit },
            { label: 'مطابقة خزان الطاقة الهدف $S_4 = 31$', ok: hit }
          ];
          let failMsg = '';
          if (isOne) failMsg = 'عند $q = 1$ لا نطبق الكسر $\\frac{1-q^5}{1-q}$ بل $S_4 = 5u_0 = 5$! ارفع $q$ نحو $2$.';
          else if (sum < 31) failMsg = `المجموع الحالي $S_4 = ${sum.toFixed(2)}$ أقل من $31$؛ زد الأساس $q$!`;
          else if (sum > 31) failMsg = `المجموع الحالي $S_4 = ${sum.toFixed(2)}$ تجاوز $31$؛ خفّض $q$ إلى $2$!`;
          return {
            ok: hit,
            checks,
            failMsg,
            okMsg: 'تعبئة هندسية دقيقة! $1 + 2 + 4 + 8 + 16 = \\frac{1 - 2^5}{1 - 2} = 31$.'
          };
        }
      }
    ]
  },
  {
    id: 'stage-auxiliary',
    tabTitle: '4. المتتالية المساعدة',
    skillLabel: 'المهارة 46',
    rounds: [
      {
        id: '4-1',
        skillTopic: '46_aux_affine',
        mode: 'auxiliary-affine',
        title: 'العدسة التآلفية: $u_{n+1} = \\frac{1}{3}u_n + 4$',
        formula: '$u_{n+1} = \\frac{1}{3}u_n + 4 \\quad|\\quad v_n = u_n - \\alpha$',
        mission: 'اسحب القطب $\\alpha$ لتصبح $v_n = u_n - \\alpha$ متتالية هندسية منتظمة النسب، ثم طابق الأساس $q$.',
        proof: 'نحل $\\alpha = \\frac{1}{3}\\alpha + 4$ فنجد $\\alpha = 6$. بوضع $v_n = u_n - 6$ نجد $v_{n+1} = \\frac{1}{3}v_n$، إذن $u_n = 6 - 5\\left(\\frac{1}{3}\\right)^n \\to 6$.',
        domain: { min: -0.5, max: 8.5 },
        u0: 1,
        f: (x) => x / 3 + 4,
        auxFn: (u, alpha) => u - alpha,
        auxType: 'ratio',
        params: [
          { key: 'alpha', label: 'القطب المساعد $\\alpha$', min: 1, max: 8, step: 0.5, init: 2.5 }
        ],
        choice: {
          key: 'qPick',
          label: 'أساس $v_n$ الهندسية ($q$)',
          options: [
            { value: '0.25', label: '$\\frac{1}{4}$' },
            { value: '0.333', label: '$\\frac{1}{3}$' },
            { value: '0.5', label: '$\\frac{1}{2}$' },
            { value: '0.667', label: '$\\frac{2}{3}$' }
          ],
          init: '0.5'
        },
        evaluate(st) {
          const aOk = Math.abs(st.alpha - 6) < 0.05;
          const qOk = st.qPick === '0.333';
          const checks = [
            { label: `استقامة النسب $\\frac{v_{n+1}}{v_n}$ عند $\\alpha = ${st.alpha.toFixed(1)}$`, ok: aOk },
            { label: 'تطابق الأساس الهندسي $q = \\frac{1}{3}$', ok: aOk && qOk }
          ];
          let failMsg = '';
          if (!aOk) failMsg = 'النسب $\\frac{v_{n+1}}{v_n}$ غير متساوية بعد! اسحب $\\alpha$ إلى تقاطع المنحنى مع $y = x$.';
          else if (!qOk) failMsg = '$v_n$ أصبحت هندسية، اختر أساسها الصحيح $q = \\frac{1}{3}$ من اللوحة!';
          return {
            ok: aOk && qOk,
            checks,
            failMsg,
            okMsg: 'ممتاز! $v_n = u_n - 6$ هندسية أساسها $\\frac{1}{3}$، ومنه $u_n = 6 - 5\\left(\\frac{1}{3}\\right)^n \\to 6$.'
          };
        }
      },
      {
        id: '4-2',
        skillTopic: '46_aux_homographic_2',
        mode: 'auxiliary-homographic2',
        title: 'عدسة المتخاطة بنقطتين صامدتين',
        formula: '$u_{n+1} = \\frac{3}{4 - u_n} \\quad|\\quad v_n = \\frac{u_n - \\alpha}{u_n - \\beta}$',
        mission: 'ضع القطبين $\\alpha < \\beta$ على نقطتي تقاطع $y = \\frac{3}{4-x}$ مع $y = x$ لتحويل $v_n$ إلى متتالية هندسية أساسها $\\frac{1}{3}$.',
        proof: 'حلول $f(x) = x$ هي $x^2 - 4x + 3 = 0$ أي $\\alpha = 1$ و $\\beta = 3$. نجد $v_{n+1} = \\frac{1}{3}v_n \\Rightarrow v_n = -\\left(\\frac{1}{3}\\right)^n \\to 0 \\Rightarrow u_n \\to 1$.',
        domain: { min: 0, max: 3.7 },
        u0: 2,
        f: (x) => 3 / (4 - x),
        auxFn: (u, a, b) => (Math.abs(u - b) < 1e-4 ? NaN : (u - a) / (u - b)),
        auxType: 'ratio',
        params: [
          { key: 'alpha', label: 'القطب الأصغر $\\alpha$', min: 0.5, max: 2.5, step: 0.5, init: 0.5 },
          { key: 'beta', label: 'القطب الأكبر $\\beta$', min: 2.0, max: 3.5, step: 0.5, init: 3.5 }
        ],
        evaluate(st) {
          const aOk = Math.abs(st.alpha - 1) < 0.05;
          const bOk = Math.abs(st.beta - 3) < 0.05;
          const checks = [
            { label: `القطب الأول $\\alpha = ${st.alpha.toFixed(1)}$ (تقاطع أصغر)`, ok: aOk },
            { label: `القطب الثاني $\\beta = ${st.beta.toFixed(1)}$ (تقاطع أكبر)`, ok: bOk },
            { label: 'ثبات النسبة $\\frac{v_{n+1}}{v_n} = \\frac{1}{3}$', ok: aOk && bOk }
          ];
          const failMsg = !(aOk && bOk)
            ? 'النسب $\\frac{v_{n+1}}{v_n}$ متباينة! طابق $\\alpha = 1$ و $\\beta = 3$ على المستقيم $y = x$.'
            : '';
          return {
            ok: aOk && bOk,
            checks,
            failMsg,
            okMsg: 'تحويل هندسي متقن! $v_{n+1} = \\frac{1}{3}v_n$ يقود $u_n$ نحو النهاية $1$.'
          };
        }
      },
      {
        id: '4-3',
        skillTopic: '46_aux_homographic_1',
        mode: 'auxiliary-homographic1',
        title: 'عدسة المتخاطة بنقطة صامدة وحيدة',
        formula: '$u_{n+1} = \\frac{4u_n - 4}{u_n} \\quad|\\quad v_n = \\frac{1}{u_n - \\alpha}$',
        mission: 'أطبق المماس على النقطة الصامدة الوحيدة $\\alpha$ فتتحول $v_n = \\frac{1}{u_n - \\alpha}$ إلى متتالية حسابية خطية!',
        proof: 'المعادلة $x^2 - 4x + 4 = 0$ تقبل حلاً وحيداً $\\alpha = 2$. وبحساب $v_{n+1} - v_n$ نجد أساساً ثابتاً $r = \\frac{1}{2}$ ومنه $v_n \\to +\\infty \\Rightarrow u_n \\to 2$.',
        domain: { min: 0.6, max: 4.5 },
        u0: 3,
        f: (x) => (4 * x - 4) / x,
        auxFn: (u, a) => (Math.abs(u - a) < 1e-4 ? NaN : 1 / (u - a)),
        auxType: 'diff',
        params: [
          { key: 'alpha', label: 'النقطة الصامدة الوحيدة $\\alpha$', min: 1.0, max: 3.5, step: 0.25, init: 1.0 }
        ],
        evaluate(st) {
          const aOk = Math.abs(st.alpha - 2) < 0.05;
          const checks = [
            { label: `مماس المنحنى مع $y = x$ عند $\\alpha = ${st.alpha.toFixed(2)}$`, ok: aOk },
            { label: 'ثبات الفرق الحسابي $v_{n+1} - v_n = +0.50$', ok: aOk }
          ];
          const failMsg = !aOk ? 'الفروق $v_{n+1} - v_n$ غير متساوية! ضع $\\alpha$ على نقطة التماس $\\alpha = 2$.' : '';
          return {
            ok: aOk,
            checks,
            failMsg,
            okMsg: 'بارع! تحولت المتخاطة إلى متتالية حسابية أساسها $r = \\frac{1}{2}$.'
          };
        }
      }
    ]
  },
  {
    id: 'stage-squeeze',
    tabTitle: '5. ممر الدركيين',
    skillLabel: 'المهارة 49',
    rounds: [
      {
        id: '5-1',
        skillTopic: '49_squeeze_gendarmes',
        mode: 'squeeze-corridor',
        title: 'حصر التذبذب بممر الدركيين',
        formula: '$u_n = 2 + \\frac{1.6 \\cos(1.7n)}{n + 1}$',
        mission: 'وجّه مركز الممر $L$ نحو بلورة النهاية وقلّص السعة $A$ بحيث تحصر الحافتين $L \\pm \\frac{A}{n+1}$ كل الحدود بإحكام.',
        proof: 'بما أن $|\\cos(1.7n)| \\le 1$ فإن $2 - \\frac{A}{n+1} \\le u_n \\le 2 + \\frac{A}{n+1}$ لـ $A \\ge 1.6$، وحين تؤول الحافتين نحو $2$ فإن $\\lim_{n\\to+\\infty} u_n = 2$.',
        seqFn: (n) => 2 + (1.6 * Math.cos(1.7 * n)) / (n + 1),
        trueL: 2,
        params: [
          { key: 'L', label: 'مركز الممر $L$', min: 0.5, max: 3.5, step: 0.25, init: 1.25 },
          { key: 'A', label: 'سعة التطويق $A$', min: 0.6, max: 3.4, step: 0.2, init: 0.8 }
        ],
        evaluate(st) {
          let breaches = 0;
          let firstBreach = -1;
          for (let n = 0; n <= 22; n += 1) {
            const u = 2 + (1.6 * Math.cos(1.7 * n)) / (n + 1);
            const lo = st.L - st.A / (n + 1);
            const hi = st.L + st.A / (n + 1);
            if (u < lo - 1e-6 || u > hi + 1e-6) {
              breaches += 1;
              if (firstBreach === -1) firstBreach = n;
            }
          }
          const trapped = breaches === 0;
          const centerOk = Math.abs(st.L - 2) < 0.05;
          const tightOk = st.A <= 2.45;
          const checks = [
            { label: trapped ? 'حصر جميع الحدود $v_n \\le u_n \\le w_n$' : `خرق عند $n = ${firstBreach}$ (${breaches} خروقات)`, ok: trapped },
            { label: `تقارب الحافتين نحو $L = 2$ (الحالي $${st.L.toFixed(2)}$)`, ok: centerOk },
            { label: 'دقة التطويق ($A \\le 2.4$)', ok: tightOk }
          ];
          let failMsg = '';
          if (!trapped) failMsg = `خرجت $u_n$ من ممر الدركيين عند $n = ${firstBreach}$! عدّل $L$ أو زد السعة $A$.`;
          else if (!centerOk) failMsg = 'الحافتين تتقاربان نحو مركز بعيد عن بلورة النهاية $L = 2$!';
          else if (!tightOk) failMsg = 'الممر واسع جداً؛ اضغط $A$ إلى حدود $1.6 - 2.4$ لتحقيق حصر أنيق!';
          return {
            ok: trapped && centerOk && tightOk,
            checks,
            failMsg,
            okMsg: 'إغلاق محكم! تلاقت الحافتين عند $2$ فأجبرتا المتذبذبة على التقارب نحو $2$.'
          };
        }
      },
      {
        id: '5-2',
        skillTopic: '49_squeeze_abs_contraction',
        mode: 'squeeze-contraction',
        title: 'متفاوتة القيمة المطلقة $|v_n - L| \\le 2k^n$',
        formula: '$|v_n - L| \\le 2k^n \\quad (v_n = 3 + 1.8(-0.55)^n)$',
        mission: 'اضبط المركز $L$ ومعامل الانكماش $k \\in ]0, 1[$ ليحصر البوق الأسي $2k^n$ المتتالية ويجبرها على التقارب.',
        proof: 'لـ $L = 3$ و $k = 0.6$ نجد $|v_n - 3| \\le 2(0.6)^n$ ولكون $|0.6| < 1$ فإن $\\lim 2(0.6)^n = 0 \\Rightarrow \\lim v_n = 3$.',
        seqFn: (n) => 3 + 1.8 * Math.pow(-0.55, n),
        trueL: 3,
        params: [
          { key: 'L', label: 'المركز $L$', min: 1.5, max: 4.5, step: 0.25, init: 2.0 },
          { key: 'k', label: 'معامل الانكماش $k$', min: 0.25, max: 1.15, step: 0.05, init: 1.05 }
        ],
        evaluate(st) {
          let breaches = 0;
          let firstBreach = -1;
          for (let n = 0; n <= 16; n += 1) {
            const v = 3 + 1.8 * Math.pow(-0.55, n);
            const rad = 2 * Math.pow(st.k, n);
            if (Math.abs(v - st.L) > rad + 1e-6) {
              breaches += 1;
              if (firstBreach === -1) firstBreach = n;
            }
          }
          const trapped = breaches === 0;
          const kConv = st.k < 0.96;
          const centerOk = Math.abs(st.L - 3) < 0.05;
          const checks = [
            { label: trapped ? 'تحقق التفاوتة لكل $n$' : `انفلات خارج البوق عند $n = ${firstBreach}$`, ok: trapped },
            { label: `شرط التلاشي: $0 < k < 1$ ($k = ${st.k.toFixed(2)}$)`, ok: kConv },
            { label: 'المركز $L = 3$', ok: centerOk }
          ];
          let failMsg = '';
          if (!kConv) failMsg = 'عند $k \\ge 1$ لا تؤول $k^n$ إلى $0$ ولا ينكمش البوق!';
          else if (!trapped) failMsg = `خرقت المتتالية التفاوتة عند $n = ${firstBreach}$! راجع $L$ أو $k$.`;
          else if (!centerOk) failMsg = 'المركز $L$ يجب أن يساوي $3$!';
          return {
            ok: trapped && kConv && centerOk,
            checks,
            failMsg,
            okMsg: 'تحقق الانكماش! $|v_n - 3| \\le 2k^n \\to 0$ ومنه $\\lim_{n\\to+\\infty} v_n = 3$.'
          };
        }
      },
      {
        id: '5-3',
        skillTopic: '49_comparison_infinity',
        mode: 'comparison-infinity',
        title: 'مقلاع المقارنة نحو $+\\infty$: $u_n \\ge \\alpha\\sqrt{n}$',
        formula: '$u_n = 1.6\\sqrt{n} + 1.2\\sin(1.4n) + 1.5 \\ge \\alpha\\sqrt{n}$',
        mission: 'اضبط معامل المصغِّر $\\alpha > 0$ بحيث يبقى المنحنى $w_n = \\alpha\\sqrt{n}$ تحت كل حدود $u_n$ فيدفعها نحو $+\\infty$.',
        proof: 'بما أن $1.2\\sin(1.4n) + 1.5 \\ge 0.3 > 0$ فإن $u_n \\ge \\alpha\\sqrt{n}$ لكل $0 < \\alpha \\le 1.6$. وبما أن $\\lim \\alpha\\sqrt{n} = +\\infty$ فإن $\\lim u_n = +\\infty$.',
        seqFn: (n) => 1.6 * Math.sqrt(n) + 1.2 * Math.sin(1.4 * n) + 1.5,
        params: [
          { key: 'alpha', label: 'معامل المقارنة $\\alpha$', min: -0.4, max: 2.3, step: 0.1, init: 2.1 }
        ],
        evaluate(st) {
          const a = st.alpha;
          let breaches = 0;
          let firstBreach = -1;
          for (let n = 1; n <= 20; n += 1) {
            const u = 1.6 * Math.sqrt(n) + 1.2 * Math.sin(1.4 * n) + 1.5;
            const w = a * Math.sqrt(n);
            if (w > u + 1e-6) {
              breaches += 1;
              if (firstBreach === -1) firstBreach = n;
            }
          }
          const belowOk = breaches === 0 && a <= 1.6 + 1e-6;
          const posOk = a >= 1.0 - 1e-6;
          const checks = [
            { label: belowOk ? 'تحقق المقارنة $\\forall n \\ge 1, \\; u_n \\ge \\alpha\\sqrt{n}$' : `تجاوز المصغّر $u_n$ عند $n = ${firstBreach}$`, ok: belowOk },
            { label: `شرط التباعد القوي نحو $+\\infty$: $\\alpha \\ge 1.0$ ($\\alpha = ${a.toFixed(1)}$)`, ok: posOk }
          ];
          let failMsg = '';
          if (a <= 0) failMsg = 'انتبه! عند $\\alpha \\le 0$ لا يؤول $\\alpha\\sqrt{n}$ نحو $+\\infty$!';
          else if (!belowOk) failMsg = `خرق المقارنة! $w_n = ${a.toFixed(1)}\\sqrt{n}$ يتجاوز $u_n$؛ خفّض $\\alpha \\le 1.6$.`;
          else if (!posOk) failMsg = 'اختر مصغّراً موجباً أقوى ($\\alpha \\ge 1.0$) لإثبات التباعد بوضوح!';
          return {
            ok: belowOk && posOk,
            checks,
            failMsg,
            okMsg: 'مقارنة صارمة! بما أن $u_n \\ge \\alpha\\sqrt{n}$ و $\\lim \\alpha\\sqrt{n} = +\\infty$ فإن $\\lim u_n = +\\infty$.'
          };
        }
      }
    ]
  },
  {
    id: 'stage-fixedpoint',
    tabTitle: '6. النقطة الصامدة والتقريب',
    skillLabel: 'المهارات 50–52',
    rounds: [
      {
        id: '6-1',
        skillTopic: '50_51_fixed_point_composite',
        mode: 'fixed-point-composite',
        title: 'حوض النقطة الصامدة والمركب $g(u_n)$',
        formula: '$u_{n+1} = \\frac{u_n^2 + 2}{3} \\quad|\\quad g(x) = \\frac{3x + 5}{\\sqrt{x + 3}}$',
        mission: 'ضع $u_0$ داخل حوض الجذب المستقر $[0, 2[$ لتتقارب $u_n$ نحو $L = 1$، ثم اضبط بوابة نهاية المركب $v_n = g(u_n)$.',
        proof: 'الدالة $f$ متصلة وتحقق $f([0,2]) \\subset [0,2]$. بتقارب $(u_n)$ نحو $L=1$ وباتصال $g$ في $1$ نحصل على $\\lim g(u_n) = g(1) = \\frac{8}{2} = 4$.',
        domain: { min: -0.2, max: 2.8 },
        f: (x) => (x * x + 2) / 3,
        g: (x) => (3 * x + 5) / Math.sqrt(x + 3),
        fixedPoints: [1, 2],
        params: [
          { key: 'u0', label: 'البذرة $u_0$ داخل $I$', min: 0.1, max: 2.5, step: 0.1, init: 2.3 },
          { key: 'gLim', label: 'بوابة نهاية المركب $g(L)$', min: 1.5, max: 6.0, step: 0.25, init: 2.0 }
        ],
        evaluate(st) {
          const inBasin = st.u0 >= 0 && st.u0 <= 1.85;
          const gOk = Math.abs(st.gLim - 4) < 0.05;
          const checks = [
            { label: `استقرار الحوض: $u_0 = ${st.u0.toFixed(2)} \\in [0, 2[$`, ok: inBasin },
            { label: 'تحقق النقطة الصامدة $f(L) = L = 1$', ok: inBasin },
            { label: `نهاية المركب المتصل $g(1) = ${st.gLim.toFixed(2)}$ (الهدف $4$)`, ok: gOk }
          ];
          let failMsg = '';
          if (st.u0 > 2) failMsg = 'خطر! لـ $u_0 > 2$ تهرب المتتالية نحو $+\\infty$ بعيداً عن النقطة الصامدة $1$!';
          else if (!inBasin) failMsg = 'اختر $u_0$ داخل $[0, 1.85]$ لتشاهد الانجذاب الواضح نحو $L = 1$!';
          else if (!gOk) failMsg = 'بما أن $g$ متصلة في $1$، احسب $g(1) = \\frac{3(1) + 5}{\\sqrt{1+3}}$ واضبط البوابة!';
          return {
            ok: inBasin && gOk,
            checks,
            failMsg,
            okMsg: 'تزامن رائع! تقاربت $u_n \\to 1$ وعبرت دالة المركب $g$ نحو $4$.'
          };
        }
      },
      {
        id: '6-2',
        skillTopic: '52_heron_approximation',
        mode: 'heron-approx',
        title: 'توظيف المتتاليات لتقريب $\\sqrt{2}$ (هيرون)',
        formula: '$u_{n+1} = \\frac{1}{2}\\left(u_n + \\frac{2}{u_n}\\right) \\quad|\\quad \\sqrt{2} \\approx 1.4142$',
        mission: 'اضبط البذرة $u_0$ وعدد الخطوات $N$ حتى يدخل $u_n$ نطاق الخطأ $|u_n - \\sqrt{2}| < 0.005$، ثم ثبّت مؤشر التأطير.',
        proof: 'لأي $u_0 > 0$ تتقارب متتالية هيرون بسرعة تربيعية نحو $\\sqrt{2} \\approx 1.41421$، وعند $N = 3$ يكون التقريب بدقة $10^{-4}$.',
        domain: { min: 0.4, max: 3.2 },
        f: (x) => 0.5 * (x + 2 / x),
        fixedPoints: [Math.SQRT2],
        params: [
          { key: 'u0', label: 'القيمة الابتدائية $u_0$', min: 1.0, max: 3.0, step: 0.25, init: 2.5 },
          { key: 'steps', label: 'عدد التكرارات $N$', min: 1, max: 5, step: 1, init: 1 },
          { key: 'est', label: 'مؤشر التقريب $\\sqrt{2}$', min: 1.38, max: 1.45, step: 0.002, init: 1.39 }
        ],
        evaluate(st) {
          let u = st.u0;
          for (let i = 0; i < Math.round(st.steps); i += 1) {
            u = 0.5 * (u + 2 / u);
          }
          const err = Math.abs(u - Math.SQRT2);
          const convOk = err < 0.005;
          const estErr = Math.abs(st.est - Math.SQRT2);
          const estOk = estErr <= 0.004;
          const checks = [
            { label: `قيمة التكرار $u_{${Math.round(st.steps)}} = ${u.toFixed(5)}$ (خطأ $${err.toFixed(4)}$)`, ok: convOk },
            { label: `دقة مؤشر التأطير $[${(st.est - 0.004).toFixed(3)}, ${(st.est + 0.004).toFixed(3)}]$`, ok: estOk }
          ];
          let failMsg = '';
          if (!convOk) failMsg = `ما زال $u_{${Math.round(st.steps)}} = ${u.toFixed(4)}$ بعيداً عن $\\sqrt{2}$! زد عدد التكرارات $N$.`;
          else if (!estOk) failMsg = `اقتربت $u_{${Math.round(st.steps)}}$ بدقة! ثبّت الآن مؤشر التقريب عند $1.414$.`;
          return {
            ok: convOk && estOk,
            checks,
            failMsg,
            okMsg: 'دقة علمية فائقة! حصرت $\\sqrt{2}$ في مجال سعته أقل من $0.008$.',
            finalVal: u
          };
        }
      }
    ]
  }
];
