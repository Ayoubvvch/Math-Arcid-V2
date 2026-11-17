/**
 * Logarithm Reactor (مفاعل اللوغاريتم والأسي): 2BAC PC Curriculum Engine
 * Covers 100% of Topics 65 through 78:
 *   Section A (65–70): Natural Logarithm ln(x), Domain, Algebraic Rules, Log Inequalities,
 *                      Fundamental Limits of ln, Derivatives (ln|u|)' = u'/u & Primitives
 *   Section B (71–78): Natural Exponential e^x, Inverse Symmetry, Algebraic Rules & Positivity,
 *                      (e^u)' = u'e^u, Primitives, Base-a Exponential, Comparative Growth,
 *                      Infinite Branches (Ox / Oy) & Quadratic Equations in e^x
 */

window.REACTOR_TOPICS = {
  65: 'تعريف دالة اللوغاريتم النبيري ln x ومجموعة التعريف D_f',
  66: 'الخواص الجبرية للوغاريتم وحل المعادلات والمتراجحات اللوغاريتمية',
  67: 'الترتيب والإشارة في ln واللوغاريتم للأساس a (و log₁₀)',
  68: 'النهايات الأساسية لدالة اللوغاريتم النبيري عند 0⁺ و +∞ و 1',
  69: 'اشتقاق الدوال اللوغاريتمية (ln|u|)\' = u\'/u والمماس والتقعر',
  70: 'الدوال الأصلية من الشكل u\'/u ↦ ln|u| + C',
  71: 'الدالة الأسية النبيرية eˣ كدالة عكسية لـ ln x والتماثل y = x',
  72: 'الخواص الجبرية للدالة الأسية وإشارتها الموجبة قطعاً eˣ > 0',
  73: 'حل المعادلات والمتراجحات الأسية ومشتقة المركب (eᵘ)\' = u\'·eᵘ',
  74: 'الدالة الأصلية للأسية u\'·eᵘ ↦ eᵘ + C والدالة الأسية للأساس a',
  75: 'النهايات الأساسية للدالة الأسية عند ±∞ وعند الصفر',
  76: 'مبرهنة النمو المقارن (Croissances comparées): eˣ ≫ xⁿ ≫ ln x',
  77: 'الفروع اللانهائية لدوال ln x و eˣ (في اتجاه Ox و Oy)',
  78: 'حل المعادلات التربيعية في eˣ أو ln x والأوضاع النسبية'
};

window.REACTOR_SECTORS = [
  { id: 1, name: 'الجناح α — تعريف وخواص اللوغاريتم النبيري ln x (65–67)', topics: [65, 66, 67], color: '#10b981' },
  { id: 2, name: 'الجناح β — نهايات اللوغاريتم ومشتقة u\'/u والأصلية (68–70)', topics: [68, 69, 70], color: '#22d3ee' },
  { id: 3, name: 'الجناح γ — الدالة الأسية eˣ، الخواص والمشتقات (71–74)', topics: [71, 72, 73, 74], color: '#f59e0b' },
  { id: 4, name: 'قلب المفاعل δ — النمو المقارن والفروع اللانهائية (75–78)', topics: [75, 76, 77, 78], color: '#a855f7' }
];

window.REACTOR_QUESTION_BANK = [
  // ================= SECTION A: LOGARITHM FUNCTION ln(x) (TOPICS 65 - 70) =================
  {
    id: 't65_domain_poly',
    section: 'A',
    sector: 1,
    topic: 65,
    prompt: 'لاحظ المبيان المرفق. ما مجموعة تعريف الدالة f المعرفة بـ f(x) = ln(x² - x - 2)؟',
    hint: 'شرط تعريف ln(u(x)) هو u(x) > 0 قطعا. جذرا الحدودية x² - x - 2 هما -1 و 2، وهي موجبة خارج الجذرين.',
    options: [
      'D_f = ]-∞, -1[ ∪ ]2, +∞[',
      'D_f = [-1, 2]',
      'D_f = ]-1, 2[',
      'D_f = ℝ \\ {-1, 2}'
    ],
    correctIndex: 0,
    graphSpec: { type: 'ln_domain_band' }
  },
  {
    id: 't65_domain_quotient',
    section: 'A',
    sector: 1,
    topic: 65,
    prompt: 'حدد بدقة مجموعة تعريف الدالة g(x) = ln((x - 3) / (x + 1)) في ℝ:',
    hint: 'يجب أن يكون الكسر (x - 3)/(x + 1) > 0 قطعا والمقام x + 1 ≠ 0. استعمل جدول الإشارة للخارج.',
    options: [
      'D_g = ]-∞, -1[ ∪ ]3, +∞[',
      'D_g = ]-1, 3[',
      'D_g = [3, +∞[',
      'D_g = ]-∞, -1] ∪ [3, +∞['
    ],
    correctIndex: 0
  },
  {
    id: 't65_def_primitive_e',
    section: 'A',
    sector: 1,
    topic: 65,
    prompt: 'لاحظ المبيان المرفق للمساحة تحت منحنى y = 1/x. ما التعريف الدقيق للدالة ln على ]0, +∞[ وما قيمة ln(e)؟',
    hint: 'الدالة ln هي الدالة الأصلية الوحيدة للدالة x ↦ 1/x على ]0, +∞[ التي تنعدم في 1، والعدد e يحقق ln(e) = 1.',
    options: [
      'الأصلية لـ 1/x المنعدمة في 1، والمساحة المحصورة بين 1 و e تساوي ln(e) = 1',
      'الأصلية لـ 1/x² المنعدمة في 0، وقيمة ln(e) = e',
      'دالة معرفة على ℝ بالكامل وتنعدم في الصفر',
      'الأصلية لـ 1/x التي تأخذ القيمة 1 عند x = 1'
    ],
    correctIndex: 0,
    graphSpec: { type: 'primitive_area_inv' }
  },
  {
    id: 't66_log_algebra',
    section: 'A',
    sector: 1,
    topic: 66,
    prompt: 'باستعمال الخواص الجبرية للوغاريتم النبيري، بسط العدد التالي:\nA = ln(e³) + ln(1/e²) - 2·ln(√e)',
    hint: 'تذكر أن ln(eⁿ) = n و ln(1/e²) = -2 و ln(√e) = ln(e^{1/2}) = 1/2.',
    options: [
      'A = 0  لأن  3 - 2 - 2(1/2) = 0',
      'A = 1  لأن  3 - 2 - 0 = 1',
      'A = 2  لأن  3 - 2 + 1 = 2',
      'A = -1'
    ],
    correctIndex: 0
  },
  {
    id: 't66_log_eq_trap',
    section: 'A',
    sector: 1,
    topic: 66,
    prompt: 'فخ وطني: حل في ℝ المعادلة التالية: ln(x - 1) + ln(x + 2) = ln(4).',
    hint: 'ابدأ أولاً بمجموعة التعريف D_E: x - 1 > 0 و x + 2 > 0 أي x ∈ ]1, +∞[. ثم حل (x - 1)(x + 2) = 4 واقص الحل الخارج عن D_E!',
    options: [
      'S = {2} فقط (لأن x = -3 ∉ ]1, +∞[ مرفوض)',
      'S = {-3, 2}',
      'S = {3}',
      'S = ∅'
    ],
    correctIndex: 0
  },
  {
    id: 't66_log_ineq',
    section: 'A',
    sector: 1,
    topic: 66,
    prompt: 'ما مجموعة حلول المتراجحة اللوغاريتمية: ln(2x - 3) ≤ ln(x + 1) في ℝ؟',
    hint: 'شرطا الوجود يعطيان x > 3/2، وبتطبيق تزايدية ln القطعية نحصل على 2x - 3 ≤ x + 1 أي x ≤ 4.',
    options: [
      'S = ]3/2, 4]',
      'S = ]-∞, 4]',
      'S = [3/2, 4]',
      'S = ]-1, 4]'
    ],
    correctIndex: 0
  },
  {
    id: 't67_ln_sign',
    section: 'A',
    sector: 1,
    topic: 67,
    prompt: 'حل في المجال ]0, +∞[ المتراجحة ذات الجداء: (x - 2)·ln(x) ≥ 0.',
    hint: 'ادرس إشارة كل عامل: x - 2 ينعدم في 2، و ln(x) ينعدم في 1 وسالب على ]0, 1[ وموجب على ]1, +∞[.',
    options: [
      'S = ]0, 1] ∪ [2, +∞[',
      'S = [1, 2]',
      'S = [2, +∞[ فقط',
      'S = ]0, 1[ ∪ ]2, +∞['
    ],
    correctIndex: 0
  },
  {
    id: 't67_log_base_a',
    section: 'A',
    sector: 1,
    topic: 67,
    prompt: 'نعرف اللوغاريتم للأساس 2 بـ log₂(t) = ln(t)/ln(2). ما حل المعادلة log₂(x - 1) = 3 في ]1, +∞[؟',
    hint: 'log₂(x - 1) = 3 تكافئ ln(x - 1) = 3·ln(2) = ln(2³) أي x - 1 = 8.',
    options: [
      'x = 9',
      'x = 7',
      'x = 10',
      'x = 8'
    ],
    correctIndex: 0
  },
  {
    id: 't68_lim_inf_ratio',
    section: 'A',
    sector: 2,
    topic: 68,
    prompt: 'احسب النهاية التالية عند +∞:\nlim (x → +∞) [ (ln²(x) - 3·ln(x)) / x ]',
    hint: 'فكك الكسر واكتب ln²(x)/x = (ln(x)/√x)² = (2·ln(√x)/√x)². تذكر أن lim (+∞) (ln(u)/u) = 0.',
    options: [
      '0',
      '+∞',
      '1',
      '-3'
    ],
    correctIndex: 0
  },
  {
    id: 't68_lim_zero_plus',
    section: 'A',
    sector: 2,
    topic: 68,
    prompt: 'احسب النهاية على يمين الصفر:\nlim (x → 0⁺) [ x²·ln(x) - 2x + 5 ]',
    hint: 'النهاية الاعتيادية تعطي lim (x → 0⁺) xⁿ·ln(x) = 0 لكل n ∈ ℕ*.',
    options: [
      '5',
      '-∞',
      '0',
      '+∞'
    ],
    correctIndex: 0
  },
  {
    id: 't68_lim_at_one',
    section: 'A',
    sector: 2,
    topic: 68,
    prompt: 'باستعمال النهاية الاعتيادية عند 1، احسب:\nlim (x → 1) [ ln(x) / (x² - 1) ]',
    hint: 'حلل المقام x² - 1 = (x - 1)(x + 1)، وتذكر أن lim (x → 1) [ ln(x)/(x - 1) ] = 1.',
    options: [
      '1/2',
      '1',
      '0',
      '2'
    ],
    correctIndex: 0
  },
  {
    id: 't68_lim_zero_ln1px',
    section: 'A',
    sector: 2,
    topic: 68,
    prompt: 'ما قيمة النهاية التالية عند الصفر:\nlim (x → 0) [ ln(1 + 3x) / (2x) ]',
    hint: 'اضرب البسط والمقام في 3 لتحصل على (3/2) × [ln(1 + 3x)/(3x)] واستعمل lim (t → 0) ln(1+t)/t = 1.',
    options: [
      '3/2',
      '2/3',
      '1',
      '3'
    ],
    correctIndex: 0
  },
  {
    id: 't69_deriv_lnu',
    section: 'A',
    sector: 2,
    topic: 69,
    prompt: 'لتكن f(x) = ln(x² + 3x + 5) المعرفة على ℝ. ما عبارة دالتها المشتقة f\'(x)؟',
    hint: 'إذا كانت u قابلة للاشتقاق وموجبة قطعا على I فإن (ln(u))\' = u\' / u.',
    options: [
      'f\'(x) = (2x + 3) / (x² + 3x + 5)',
      'f\'(x) = 1 / (x² + 3x + 5)',
      'f\'(x) = 1 / (2x + 3)',
      'f\'(x) = (2x + 3)·ln(x² + 3x + 5)'
    ],
    correctIndex: 0
  },
  {
    id: 't69_tangent_ineq',
    section: 'A',
    sector: 2,
    topic: 69,
    prompt: 'لاحظ المبيان المرفق لمنحنى C_ln والمماس T في النقطة A(1, 0). ما معادلة المماس وما المتراجحة المستنتجة من تقعر ln؟',
    hint: 'ln\'(1) = 1/1 = 1 فتكون معادلة المماس y = x - 1. ولأن ln\'\'(x) = -1/x² < 0 فالدالة مقعرة ويقع منحناها تحت المماس.',
    options: [
      'المماس y = x - 1  و  ∀x > 0 : ln(x) ≤ x - 1',
      'المماس y = x + 1  و  ∀x > 0 : ln(x) ≥ x + 1',
      'المماس y = x  و  ∀x > 0 : ln(x) ≤ x',
      'المماس y = 1 - x  و  ∀x > 0 : ln(x) ≥ 1 - x'
    ],
    correctIndex: 0,
    graphSpec: { type: 'ln_curve_tangent' }
  },
  {
    id: 't69_deriv_ln_abs',
    section: 'A',
    sector: 2,
    topic: 69,
    prompt: 'لاحظ مبيان الدالة ln|x| المرفق. ما مشتقة الدالة g(x) = ln|2x - 4| على كل من المجالين ]-∞, 2[ و ]2, +∞[؟',
    hint: 'تذكّر القاعدة الذهبية: (ln|u|)\' = u\' / u مهما كانت إشارة u(x) ≠ 0!',
    options: [
      'g\'(x) = 2 / (2x - 4) = 1 / (x - 2)',
      'g\'(x) = 1 / |x - 2|',
      'g\'(x) = -1 / (x - 2) على كل ℝ \\ {2}',
      'g غير قابلة للاشتقاق على ]-∞, 2['
    ],
    correctIndex: 0,
    graphSpec: { type: 'ln_abs_both_sides' }
  },
  {
    id: 't70_primitive_uprime',
    section: 'A',
    sector: 2,
    topic: 70,
    prompt: 'ما هي الدوال الأصلية F للدالة f(x) = x / (x² + 1) على المجموعة ℝ؟',
    hint: 'ضع u(x) = x² + 1 > 0، لدينا u\'(x) = 2x، إذن f(x) = (1/2) · (u\'(x) / u(x)).',
    options: [
      'F(x) = (1/2)·ln(x² + 1) + C',
      'F(x) = ln(x² + 1) + C',
      'F(x) = 2·ln(x² + 1) + C',
      'F(x) = ln|x| / (x² + 1) + C'
    ],
    correctIndex: 0
  },
  {
    id: 't70_primitive_inv_ln',
    section: 'A',
    sector: 2,
    topic: 70,
    prompt: 'حدد دالة أصلية للدالة h(x) = 1 / (x·ln(x)) على المجال ]1, +∞[:',
    hint: 'اكتب h(x) = (1/x) / ln(x) = u\'(x) / u(x) حيث u(x) = ln(x) > 0 على ]1, +∞[.',
    options: [
      'H(x) = ln(ln(x)) + C',
      'H(x) = (ln(x))² / 2 + C',
      'H(x) = -1 / (ln(x))² + C',
      'H(x) = ln(x) / x + C'
    ],
    correctIndex: 0
  },

  // ================= SECTION B: EXPONENTIAL FUNCTION e^x & COMPARATIVE GROWTH (TOPICS 71 - 78) =================
  {
    id: 't71_exp_bijection',
    section: 'B',
    sector: 3,
    topic: 71,
    prompt: 'لاحظ المبيان المرفق لمنحنيي eˣ و ln(x) والمستقيم y = x. ما العلاقة التماثلية ومجال القيم للدالة الأسية exp(x) = eˣ؟',
    hint: 'الدالة exp تقابل من ℝ نحو ]0, +∞[ وهي الدالة العكسية لـ ln، ومنحناها مماثل لـ C_ln بالنسبة للمنصف الأول y = x.',
    options: [
      'معرفة على ℝ وقيمها في ]0, +∞[، ومنحنى C_exp مماثل لـ C_ln بالنسبة للمستقيم y = x',
      'معرفة على ]0, +∞[ وقيمها في ℝ، ومنحناها مماثل بالنسبة لمحور Oy',
      'معرفة على ℝ وقيمها في ℝ، ومماثلة بالنسبة للأصل O(0,0)',
      'معرفة على [0, +∞[ وتتناقص نحو الصفر'
    ],
    correctIndex: 0,
    graphSpec: { type: 'exp_ln_symmetry' }
  },
  {
    id: 't71_exp_cancel',
    section: 'B',
    sector: 3,
    topic: 71,
    prompt: 'باستعمال علاقة التكافؤ بين الأسية واللوغاريتم، احسب القيمة المضبوطة للعدد:\nB = e^{2·ln(3)} - ln(e⁻⁵)',
    hint: 'لدينا e^{2·ln(3)} = e^{ln(3²)} = 9، وكذلك ln(e⁻⁵) = -5.',
    options: [
      'B = 14',
      'B = 4',
      'B = 1',
      'B = 11'
    ],
    correctIndex: 0
  },
  {
    id: 't72_exp_strict_pos',
    section: 'B',
    sector: 3,
    topic: 72,
    prompt: 'حل في المجموعة ℝ المتراجحة التالية: (x² - 4)·e⁻ˣ ≥ 0.',
    hint: 'تذكر دائماً في الوطني: لكل x ∈ ℝ لدينا e⁻ˣ > 0 قطعا! إذن إشارة الجداء هي إشارة الحدودية x² - 4 فقط.',
    options: [
      'S = ]-∞, -2] ∪ [2, +∞[',
      'S = [-2, 2]',
      'S = [2, +∞[ فقط',
      'S = ∅ لأن e⁻ˣ أصغر من 1'
    ],
    correctIndex: 0
  },
  {
    id: 't72_exp_quad_eq',
    section: 'B',
    sector: 3,
    topic: 72,
    prompt: 'لاحظ المبيان المرفق. حل في المجموعة ℝ المعادلة الأسية: e^{2x} - 3eˣ + 2 = 0.',
    hint: 'نضع t = eˣ (مع t > 0)، فتصبح المعادلة t² - 3t + 2 = 0 جذراها t = 1 و t = 2، ثم نطبق ln.',
    options: [
      'S = {0, ln(2)}',
      'S = {1, 2}',
      'S = {ln(2)} فقط',
      'S = {e, e²}'
    ],
    correctIndex: 0,
    graphSpec: { type: 'exp_quad_roots' }
  },
  {
    id: 't73_exp_ineq',
    section: 'B',
    sector: 3,
    topic: 73,
    prompt: 'ما مجموعة حلول المتراجحة الأسية e^{2x - 1} < 1 / e³ في ℝ؟',
    hint: 'اكتب 1/e³ = e⁻³، وبما أن الدالة exp تزايدية قطعا فإن 2x - 1 < -3.',
    options: [
      'S = ]-∞, -1[',
      'S = ]-1, +∞[',
      'S = ]-∞, 1[',
      'S = ]-∞, -2['
    ],
    correctIndex: 0
  },
  {
    id: 't73_deriv_eu',
    section: 'B',
    sector: 3,
    topic: 73,
    prompt: 'لتكن الدالة f(x) = (2x - 1)·e⁻ˣ المعرفة على ℝ. ما عبارة دالتها المشتقة f\'(x)؟',
    hint: 'طبق مشتقة جداء (u·v)\' = u\'v + uv\' مع (e⁻ˣ)\' = -e⁻ˣ، ثم عمّل بـ e⁻ˣ.',
    options: [
      'f\'(x) = (3 - 2x)·e⁻ˣ',
      'f\'(x) = (2x + 1)·e⁻ˣ',
      'f\'(x) = (1 - 2x)·e⁻ˣ',
      'f\'(x) = -2·e⁻ˣ'
    ],
    correctIndex: 0
  },
  {
    id: 't74_prim_exp',
    section: 'B',
    sector: 3,
    topic: 74,
    prompt: 'ما هي الدوال الأصلية F للدالة f(x) = x·e^{x²} على ℝ؟',
    hint: 'نضع u(x) = x² ومنه u\'(x) = 2x، إذن f(x) = (1/2)·u\'(x)·e^{u(x)}.',
    options: [
      'F(x) = (1/2)·e^{x²} + C',
      'F(x) = e^{x²} + C',
      'F(x) = 2·e^{x²} + C',
      'F(x) = (x² / 2)·e^{x²} + C'
    ],
    correctIndex: 0
  },
  {
    id: 't74_base_a_deriv',
    section: 'B',
    sector: 3,
    topic: 74,
    prompt: 'باستعمال التعريف aˣ = e^{x·ln(a)} (حيث a > 0)، ما مشتقة الدالة g(x) = 3ˣ على ℝ؟',
    hint: 'g(x) = e^{x·ln(3)}، ومشتقة e^{kx} هي k·e^{kx}.',
    options: [
      'g\'(x) = ln(3)·3ˣ',
      'g\'(x) = x·3^{x-1}',
      'g\'(x) = 3ˣ / ln(3)',
      'g\'(x) = 3ˣ'
    ],
    correctIndex: 0
  },
  {
    id: 't75_lim_zero_ex',
    section: 'B',
    sector: 4,
    topic: 75,
    prompt: 'احسب النهاية التالية عند الصفر:\nlim (x → 0) [ (e^{5x} - 1) / (2x) ]',
    hint: 'اكتب الكسر على الشكل (5/2) × [(e^{5x} - 1)/(5x)] وتذكر أن lim (t → 0) (eᵗ - 1)/t = 1.',
    options: [
      '5/2',
      '2/5',
      '1',
      '0'
    ],
    correctIndex: 0
  },
  {
    id: 't75_lim_minus_inf_tangent',
    section: 'B',
    sector: 4,
    topic: 75,
    prompt: 'لاحظ المبيان المرفق للدالة eˣ. ما المقارب عند -∞ وما الوضع النسبي بين C_exp ومماسها في النقطة (0, 1)؟',
    hint: 'lim (x → -∞) eˣ = 0 يعطي مقارباً أفقياً y = 0، والمشتقة الثانية (eˣ)\'\' = eˣ > 0 تجعل الدالة محدبة وتقع فوق مماسها y = x + 1.',
    options: [
      'المقارب y = 0 عند -∞، والمماس y = x + 1  مع  ∀x ∈ ℝ : eˣ ≥ x + 1',
      'المقارب x = 0 عند -∞، والمماس y = x - 1  مع  eˣ ≤ x - 1',
      'المقارب y = 1 عند -∞، و eˣ ≤ x + 1',
      'لا يوجد مقارب أفقي عند -∞'
    ],
    correctIndex: 0,
    graphSpec: { type: 'exp_tangent_bound' }
  },
  {
    id: 't76_growth_plus_inf',
    section: 'B',
    sector: 4,
    topic: 76,
    prompt: 'لاحظ مبيان النمو المقارن المرفق. احسب النهاية التالية عند +∞:\nlim (x → +∞) [ (x⁴ + 1) / e^{2x} ]',
    hint: 'نضع t = 2x → +∞، فيصبح الكسر (1/16)·(t⁴/eᵗ) + e⁻ᵗ. وبحسب النمو المقارن lim (+∞) (tⁿ / eᵗ) = 0.',
    options: [
      '0  لأن الدالة الأسية e^{2x} تتفوق على أي قوة xⁿ عند +∞',
      '+∞  لأن درجة البسط 4 أكبر من درجة الأس 2',
      '1/16',
      '1'
    ],
    correctIndex: 0,
    graphSpec: { type: 'growth_comparison' }
  },
  {
    id: 't76_growth_minus_inf',
    section: 'B',
    sector: 4,
    topic: 76,
    prompt: 'باستعمال النمو المقارن عند -∞، احسب:\nlim (x → -∞) [ (x² - 3x + 1)·eˣ ]',
    hint: 'انشر التعبير: x²·eˣ - 3x·eˣ + eˣ. وتذكر النهاية الأساسية lim (x → -∞) xⁿ·eˣ = 0 لكل n ∈ ℕ.',
    options: [
      '0',
      '+∞',
      '-∞',
      '1'
    ],
    correctIndex: 0
  },
  {
    id: 't77_branch_ln',
    section: 'B',
    sector: 4,
    topic: 77,
    prompt: 'لاحظ مبيان الفرع اللانهائي لـ ln(x) عند +∞. ماذا نستنتج هندسياً من lim (+∞) ln(x) = +∞ و lim (+∞) ln(x)/x = 0؟',
    hint: 'عندما تكون lim f(x) = ±∞ و lim f(x)/x = 0، فإن المنحنى C_f يقبل فرعاً شلجمياً اتجاهه محور الأفاصيل (Ox).',
    options: [
      'فرع شلجمي اتجاهه محور الأفاصيل (Ox) بجوار +∞',
      'فرع شلجمي اتجاهه محور الأراتيب (Oy) بجوار +∞',
      'مقارب مائل معادلته y = x بجوار +∞',
      'مقارب أفقي معادلته y = 0'
    ],
    correctIndex: 0,
    graphSpec: { type: 'ln_branch_parabolic' }
  },
  {
    id: 't78_branch_exp',
    section: 'B',
    sector: 4,
    topic: 78,
    prompt: 'لاحظ مبيان الفرع اللانهائي لـ eˣ عند +∞. بما أن lim (+∞) eˣ = +∞ و lim (+∞) eˣ/x = +∞، فما التأويل الهندسي الدقيق؟',
    hint: 'عندما تؤول نسبة f(x)/x إلى ±∞ عند ±∞، فإن المنحنى C_f يقبل فرعاً شلجمياً في اتجاه محور الأراتيب (Oy).',
    options: [
      'فرع شلجمي اتجاهه محور الأراتيب (Oy) بجوار +∞',
      'فرع شلجمي اتجاهه محور الأفاصيل (Ox) بجوار +∞',
      'مقارب عمودي معادلته x = 0',
      'مقارب مائل معادلته y = e·x'
    ],
    correctIndex: 0,
    graphSpec: { type: 'exp_parabolic_y' }
  },
  {
    id: 't78_quad_trap_neg_root',
    section: 'B',
    sector: 4,
    topic: 78,
    prompt: 'وطني نموذجي: حل في المجموعة ℝ المعادلة e^{2x} + eˣ - 6 = 0 مع التحقق من إشارة الوسيط t = eˣ:',
    hint: 'بوضع t = eˣ > 0 نحصل على t² + t - 6 = (t - 2)(t + 3) = 0. نرفض t = -3 لأنه سالب ويبقى eˣ = 2 فقط.',
    options: [
      'S = {ln(2)} فقط (لأن eˣ = -3 مستحيل في ℝ)',
      'S = {ln(2), ln(-3)}',
      'S = {ln(2), -ln(3)}',
      'S = {2}'
    ],
    correctIndex: 0
  },
  {
    id: 't66_log_ineq_band',
    section: 'A',
    sector: 1,
    topic: 66,
    prompt: 'لاحظ المبيان المرفق لتأطير دالة اللوغاريتم ln(x) عند x = 1. أيّ متراجحة مزدوجة صحيحة لكل x ∈ ]0, +∞[؟',
    hint: 'من التقعر لدينا ln(x) ≤ x - 1، وبتطبيق نفس المتراجحة على t = 1/x > 0 نجد ln(1/x) ≤ 1/x - 1 أي 1 - 1/x ≤ ln(x).',
    options: [
      '1 - 1/x ≤ ln(x) ≤ x - 1  (مع التساوي عند x = 1 فقط)',
      'x - 1 ≤ ln(x) ≤ 1 - 1/x',
      'ln(x) ≤ 1 - 1/x  لكل x > 0',
      '-1/x ≤ ln(x) ≤ x  لكل x > 0'
    ],
    correctIndex: 0,
    graphSpec: { type: 'log_ineq_band' }
  },
  {
    id: 't67_log_param_ineq',
    section: 'A',
    sector: 1,
    topic: 67,
    prompt: 'مناقشة بوسيط حقيقي m > 1: ما مجموعة حلول المتراجحة اللوغاريتمية ln²(x) - (m + 1)·ln(x) + m ≤ 0 في ]0, +∞[؟',
    hint: 'عمّل الثلاثية الحدودية في t = ln(x): (ln(x) - 1)(ln(x) - m) ≤ 0، وبما أن m > 1 فإن 1 ≤ ln(x) ≤ m.',
    options: [
      'S = [e, eᵐ]',
      'S = [1, m]',
      'S = ]0, e] ∪ [eᵐ, +∞[',
      'S = [e⁻ᵐ, e]'
    ],
    correctIndex: 0
  },
  {
    id: 't67_base_a_flip',
    section: 'A',
    sector: 1,
    topic: 67,
    prompt: 'فخ الأساس a ∈ ]0, 1[: حل في المجموعة ℝ المتراجحة الأسية (1/2)ˣ > 8:',
    hint: 'اكتب (1/2)ˣ = e^{x·ln(1/2)} و 8 = e^{3·ln(2)}. وبما أن ln(1/2) = -ln(2) < 0 فإن القسمة عليه تقلب منحى المتراجحة!',
    options: [
      'S = ]-∞, -3[  (لأن ln(1/2) < 0 يقلب الترتيب)',
      'S = ]-3, +∞[',
      'S = ]3, +∞[',
      'S = ]-∞, 3['
    ],
    correctIndex: 0
  },
  {
    id: 't73_inflection_xe_minus_x',
    section: 'B',
    sector: 3,
    topic: 73,
    prompt: 'لتكن الدالة f(x) = x·e⁻ˣ المعرفة على ℝ. احسب المشتقة الثانية f\'\'(x) وحدد نقطة انعطاف المنحنى C_f:',
    hint: 'لدينا f\'(x) = (1 - x)·e⁻ˣ، وباشتقاقها مجدداً نحصل على f\'\'(x) = -e⁻ˣ - (1 - x)·e⁻ˣ = (x - 2)·e⁻ˣ.',
    options: [
      'f\'\'(x) = (x - 2)·e⁻ˣ  ونقطة الانعطاف هي I(2, 2/e²)',
      'f\'\'(x) = (2 - x)·e⁻ˣ  ونقطة الانعطاف هي I(1, 1/e)',
      'f\'\'(x) = x·e⁻ˣ  ونقطة الانعطاف هي I(0, 0)',
      'المنحنى C_f لا يقبل أي نقطة انعطاف في ℝ'
    ],
    correctIndex: 0
  },
  {
    id: 't74_prim_quotient_exp',
    section: 'B',
    sector: 3,
    topic: 74,
    prompt: 'حدد الدالة الأصلية F للدالة f(x) = (2·e^{2x}) / (e^{2x} + 1) على ℝ التي تحقق الشرط البدئي F(0) = 0:',
    hint: 'لاحظ أن البسط 2·e^{2x} هو مشتقة المقام u(x) = e^{2x} + 1 > 0، إذن F(x) = ln(e^{2x} + 1) + C ثم عوض x = 0.',
    options: [
      'F(x) = ln((e^{2x} + 1) / 2)',
      'F(x) = ln(e^{2x} + 1)',
      'F(x) = 2·ln(e^{2x} + 1) - ln(4)',
      'F(x) = e^{2x} / (e^{2x} + 1) - 1/2'
    ],
    correctIndex: 0
  },
  {
    id: 't78_param_exp_eq',
    section: 'B',
    sector: 4,
    topic: 78,
    prompt: 'لاحظ المبيان المرفق لمنحنى eˣ ومماسه المار من الأصل O(0,0). ما شرط الوسيط m ∈ ]0, +∞[ لتقبل المعادلة eˣ - m·x = 0 حلين متمايزين؟',
    hint: 'المعادلة تكافئ eˣ/x = m على ]0, +∞[. الدالة x ↦ eˣ/x تبلغ قيمتها الدنيا المطلقة e عند x = 1 حيث المستقيم y = e·x يمس C_exp.',
    options: [
      'm ∈ ]e, +∞[  (بينما لـ m = e حل وحيد ولـ m ∈ ]0, e[ لا حلول)',
      'm ∈ ]0, e[',
      'm ∈ ]1, e[',
      'm ≥ 1  دائماً'
    ],
    correctIndex: 0,
    graphSpec: { type: 'exp_param_tangent' }
  },
  {
    id: 't78_ln_param_roots',
    section: 'B',
    sector: 4,
    topic: 78,
    prompt: 'لاحظ المبيان المرفق للدالة g(x) = x·ln(x) على ]0, +∞[. ما قيم الوسيط m ∈ ℝ التي تقبل عندها المعادلة x·ln(x) = m حلين متمايزين؟',
    hint: 'g\'(x) = ln(x) + 1 تنعدم في x = 1/e بقيمة دنيا g(1/e) = -1/e، و lim(0⁺) x·ln(x) = 0 بينما g(1) = 0.',
    options: [
      'm ∈ ]-1/e, 0[',
      'm ∈ ]-∞, -1/e[',
      'm ∈ [0, +∞[',
      'm ∈ ]-1, 0['
    ],
    correctIndex: 0,
    graphSpec: { type: 'ln_param_roots' }
  }
];

// Compatibility alias for Ironclad Quality Gate & Hub
window.QUESTION_BANK = window.REACTOR_QUESTION_BANK;

window.pickReactorChallenge = function(topicFilter = 'all', allowedTopics = null, recentIds = []) {
  let pool = window.REACTOR_QUESTION_BANK;

  if (Array.isArray(allowedTopics) && allowedTopics.length > 0) {
    const sectorMatches = pool.filter(q => allowedTopics.includes(q.topic));
    if (sectorMatches.length > 0) pool = sectorMatches;
  } else if (topicFilter === 'sectionA') {
    pool = pool.filter(q => q.section === 'A');
  } else if (topicFilter === 'sectionB') {
    pool = pool.filter(q => q.section === 'B');
  }

  const fresh = pool.filter(q => !recentIds.includes(q.id));
  const candidates = fresh.length > 0 ? fresh : pool;
  const base = candidates[Math.floor(Math.random() * candidates.length)];

  // Clone and Fisher-Yates shuffle options so ✕/◯/▢/△ vary dynamically
  const indexed = base.options.map((text, idx) => ({ text, isCorrect: idx === base.correctIndex }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = indexed[i];
    indexed[i] = indexed[j];
    indexed[j] = tmp;
  }

  return {
    id: base.id,
    section: base.section,
    sector: base.sector,
    topic: base.topic,
    prompt: base.prompt,
    hint: base.hint,
    options: indexed.map(o => o.text),
    correctIndex: indexed.findIndex(o => o.isCorrect),
    graphSpec: base.graphSpec || null
  };
};
