/**
 * Sequence Strider (عدّاء المتتاليات): Suites Numériques Curriculum Engine
 * Covers 100% of Topics 39 through 50:
 *   Section A (39-44): Induction, Bounds, Monotonicity, Arithmetic, Geometric, Auxiliary (1.1.1)
 *   Section B (45-50): Reference & q^n Limits, Monotone Convergence, Squeeze/Criteria (1.1.2),
 *                      Function Composition (1.1.3), Recursive u_{n+1}=f(u_n) (1.1.4), Modeling (1.1.5)
 */

window.SEQ_TOPICS = {
  39: 'البرهان بالترجع (Récurrence)',
  40: 'المتتالية المكبورة والمصغورة والمحدودة',
  41: 'رتابة متتالية وإشارة الفرق / f(x)-x',
  42: 'المتتالية الحسابية ومجموع حدودها',
  43: 'المتتالية الهندسية ومجموع حدودها',
  44: 'المتتالية المساعدة للتآلفية والمتخاطة (1.1.1)',
  45: 'نهايات المتتاليات المرجعية و qⁿ (1.1.2)',
  46: 'مبرهنات التقارب الرتيب',
  47: 'مصاديق التقارب والدركيين والحصر (1.1.2)',
  48: 'نهاية مركب متتالية ودالة متصلة (1.1.3)',
  49: 'المتتالية الترجعية uₙ₊₁ = f(uₙ) (1.1.4)',
  50: 'توظيف المتتاليات في مسائل متنوعة (1.1.5)'
};

window.SEQ_SECTORS = [
  { id: 1, name: 'القطاع 1 — الترجع، المحدودية والرتابة (39–41)', topics: [39, 40, 41], color: '#38bdf8' },
  { id: 2, name: 'القطاع 2 — الحسابية، الهندسية والمساعدة (42–44)', topics: [42, 43, 44], color: '#a855f7' },
  { id: 3, name: 'القطاع 3 — النهايات، التقارب الرتيب والدركيين (45–47)', topics: [45, 46, 47], color: '#10b981' },
  { id: 4, name: 'القطاع 4 — النقطة الصامدة والنمذجة (48–50)', topics: [48, 49, 50], color: '#f59e0b' }
];

window.SEQ_QUESTION_BANK = [
  // ================= SECTION A: BASIC CONCEPTS & PROGRESSION (39 - 44) =================
  {
    id: 't39_steps',
    section: 'A',
    topic: 39,
    prompt: 'ما الترتيب المنطقي الصحيح لمراحل البرهان بالترجع لإثبات خاصية P(n) لجميع n ≥ n₀؟',
    hint: 'تبدأ بالتحقق عند الحد الأول n₀، ثم تفترض الصحة عند n، ثم تبرهن عليها عند n+1.',
    options: [
      'الافتراض ثم التحقق البدئي ثم نهاية المتتالية',
      'التحقق من P(n₀)، افتراض P(n) لـ n ثابت، ثم إثبات P(n+1)',
      'إثبات P(n+1) مباشرة دون شرط بدئي',
      'حساب u₁ و u₂ يكفي لجميع n ∈ ℕ'
    ],
    correctIndex: 1
  },
  {
    id: 't39_induction_rec',
    section: 'A',
    topic: 39,
    prompt: 'لتكن u₀ = 2 و uₙ₊₁ = √(2 + uₙ). نريد بالترجع إثبات أن uₙ > 1.\nبعد افتراض uₙ > 1، كيف نبرهن على uₙ₊₁ > 1؟',
    hint: 'نؤطر 2 + uₙ انطلاقاً من افتراض الترجع uₙ > 1 ثم ندخل الجذر المربع.',
    options: [
      '2 + uₙ > 3 > 1 ⇒ √(2 + uₙ) > 1',
      'uₙ₊₁ - uₙ > 0 مباشرة',
      '2 + uₙ < 4 ⇒ uₙ₊₁ < 1',
      'نحسب u₀ = 2 > 1 وهذا يكفي للمرتبة n+1'
    ],
    correctIndex: 0
  },
  {
    id: 't39_divisibility',
    section: 'A',
    topic: 39,
    prompt: 'لإثبات أن 4ⁿ - 1 مضاعف للعدد 3 بالترجع: نفترض 4ⁿ - 1 = 3k.\nما التبسيط الصحيح للعبارة 4ⁿ⁺¹ - 1؟',
    hint: 'اكتب 4ⁿ⁺¹ = 4 × 4ⁿ وعوض 4ⁿ = 3k + 1.',
    options: [
      '4(3k) - 1 = 12k - 1',
      '4(3k + 1) - 1 = 12k + 3 = 3(4k + 1)',
      '3(4ⁿ - 1) - 4',
      '4ⁿ + 3k'
    ],
    correctIndex: 1
  },
  {
    id: 't40_bounds_def',
    section: 'A',
    topic: 40,
    prompt: 'لاحظ المبيان المرفق للمتتالية (uₙ) المحصورة بين المستقيمين y = 4 و y = -1.\nماذا نقول عن المتتالية (uₙ)؟',
    hint: 'إذا وُجد m و M بحيث ∀n ∈ ℕ: m ≤ uₙ ≤ M فهي مكبورة ومصغورة معاً.',
    options: [
      'مكبورة فقط بالعدد 4 وغير مصغورة',
      'مصغورة فقط بالعدد -1',
      'محدودة (Bornée): مصغورة بـ -1 ومكبورة بـ 4',
      'متباعدة نحو +∞'
    ],
    correctIndex: 2,
    graphSpec: { type: 'bounded_scatter' }
  },
  {
    id: 't40_fraction_bound',
    section: 'A',
    topic: 40,
    prompt: 'نعتبر المتتالية uₙ = (2n + 3) / (n + 1) لكل n ∈ ℕ.\nبملاحظة أن uₙ = 2 + 1/(n + 1)، ما التأطير الدقيق لـ uₙ؟',
    hint: 'بما أن n ≥ 0 فإن 0 < 1/(n + 1) ≤ 1.',
    options: [
      '0 < uₙ ≤ 2',
      '2 < uₙ ≤ 3 (ومنه محدودة)',
      '3 ≤ uₙ < 5',
      'uₙ غير مكبورة'
    ],
    correctIndex: 1
  },
  {
    id: 't41_monotone_fx',
    section: 'A',
    topic: 41,
    prompt: 'لتكن uₙ₊₁ = f(uₙ) حيث ∀n: uₙ ∈ [1, 3].\nعلى المبيان نلاحظ أن منحنى (Cf) يقع تحت المستقيم y = x على [1, 3] أي f(x) ≤ x.\nما رتابة (uₙ)؟',
    hint: 'uₙ₊₁ - uₙ = f(uₙ) - uₙ ≤ 0 لجميع n.',
    options: [
      '(uₙ) متزايدة',
      '(uₙ) متناقصة',
      '(uₙ) ثابتة دائماً',
      '(uₙ) متناوبة الإشارة'
    ],
    correctIndex: 1,
    graphSpec: { type: 'fx_below_x' }
  },
  {
    id: 't41_diff_quad',
    section: 'A',
    topic: 41,
    prompt: 'إذا تحقق لكل n ∈ ℕ: 1 < uₙ < 2  و  uₙ₊₁ - uₙ = [(uₙ - 1)(2 - uₙ)] / (uₙ + 1)،\nفإن المتتالية (uₙ):',
    hint: 'بما أن 1 < uₙ < 2 فإن (uₙ - 1) > 0 و (2 - uₙ) > 0 و (uₙ + 1) > 0.',
    options: [
      'متزايدة قطعا لأن uₙ₊₁ - uₙ > 0',
      'متناقصة قطعا لأن uₙ₊₁ - uₙ < 0',
      'ثابتة على ℕ',
      'ليست رتيبة'
    ],
    correctIndex: 0
  },
  {
    id: 't42_arith_term',
    section: 'A',
    topic: 42,
    prompt: '(uₙ) متتالية حسابية أساسها r = -3 بحيث u₂ = 10.\nباستعمال صيغة الحد العام uₙ = uₚ + (n - p)r، ما قيمة u₉؟',
    hint: 'نعوض n = 9 و p = 2: u₉ = 10 + (9 - 2)×(-3).',
    options: ['-11', '-17', '31', '-8'],
    correctIndex: 0
  },
  {
    id: 't42_arith_sum',
    section: 'A',
    topic: 42,
    prompt: 'احسب مجموع الحدود الحسابية S = u₂ + u₃ + ... + u₁₁\nعلماً أن u₂ = 4 و u₁₁ = 22:',
    hint: 'عدد الحدود هو (11 - 2 + 1) = 10، ثم نطبق S = [(عدد الحدود)(u₂ + u₁₁)] / 2.',
    options: ['117', '130', '260', '104'],
    correctIndex: 1
  },
  {
    id: 't43_geo_term',
    section: 'A',
    topic: 43,
    prompt: '(vₙ) متتالية هندسية أساسها q = 2 بحيث v₁ = 3.\nباستعمال vₙ = vₚ · qⁿ⁻ᵖ، ما قيمة v₅؟',
    hint: 'الأس هو 5 - 1 = 4 وليس 5.',
    options: ['96', '48', '24', '30'],
    correctIndex: 1
  },
  {
    id: 't43_geo_sum',
    section: 'A',
    topic: 43,
    prompt: 'ما القيمة المضبوطة للمجموع الهندسي:\nS = 1 + (1/2) + (1/2)² + ... + (1/2)⁵ =',
    hint: 'عدد الحدود هو 5 - 0 + 1 = 6 وحدها الأول u₀ = 1 و q = 1/2: S = (1 - q⁶)/(1 - q).',
    options: ['63/32', '31/16', '63/64', '33/16'],
    correctIndex: 0
  },
  {
    id: 't44_affine_aux',
    section: 'A',
    topic: 44,
    prompt: 'نعتبر التآلفية uₙ₊₁ = (1/3)uₙ + 4 و u₀ = 10 (البند 1.1.1).\nنضع vₙ = uₙ - α بحيث (vₙ) هندسية. ما قيمة α وما نهاية uₙ؟',
    hint: 'النقطة الصامدة α تحقق α = (1/3)α + 4، وبما أن q = 1/3 ∈ ]-1, 1[ فإن vₙ → 0.',
    options: [
      'α = 6  و  lim uₙ = 6',
      'α = 4  و  lim uₙ = 4',
      'α = 12  و  lim uₙ = +∞',
      'α = -6  و  lim uₙ = 0'
    ],
    correctIndex: 0
  },
  {
    id: 't44_homographic_two',
    section: 'A',
    topic: 44,
    prompt: 'في المتتالية المتخاطة uₙ₊₁ = (3uₙ - 2) / uₙ، تقبل f(x) = x حلين هما 2 و 1.\nما المتتالية المساعدة الهندسية القياسية لدراستها (البند 1.1.1)؟',
    hint: 'نكوّن النسبة vₙ = (uₙ - α)/(uₙ - β) باستعمال الجذرين α و β.',
    options: [
      'vₙ = uₙ - 2',
      'vₙ = (uₙ - 2) / (uₙ - 1)',
      'vₙ = 1 / uₙ',
      'vₙ = uₙ² - 1'
    ],
    correctIndex: 1,
    graphSpec: { type: 'homographic_curve' }
  },
  {
    id: 't44_homographic_one',
    section: 'A',
    topic: 44,
    prompt: 'لتكن المتتالية المتخاطة uₙ₊₁ = (4uₙ - 4) / uₙ حيث المعادلة f(x) = x تقبل حلاً وحيداً α = 2.\nما طبيعة المتتالية المساعدة vₙ = 1 / (uₙ - 2)؟',
    hint: 'عند وجود حل وحيد α لـ f(x) = x، المقلوب vₙ = 1/(uₙ - α) يعطي متتالية حسابية!',
    options: [
      'هندسية أساسها 4',
      'حسابية أساسها r = 1/2',
      'ثابتة تساوي 2',
      'متباعدة متناوبة'
    ],
    correctIndex: 1
  },
  {
    id: 't44_explicit_un',
    section: 'A',
    topic: 44,
    prompt: 'إذا كان لدينا vₙ = (uₙ - 1)/(uₙ + 2) ووجدنا vₙ = (1/2)ⁿ،\nفما التعبير الصريح لـ uₙ بدلالة n؟',
    hint: 'ننشر uₙ - 1 = vₙ·uₙ + 2vₙ ثم نعزل uₙ.',
    options: [
      'uₙ = (1 + 2vₙ) / (1 - vₙ)',
      'uₙ = (1 - 2vₙ) / (1 + vₙ)',
      'uₙ = (vₙ - 1) / (vₙ + 2)',
      'uₙ = 2vₙ + 1'
    ],
    correctIndex: 0
  },

  // ================= SECTION B: LIMITS & CONVERGENCE (45 - 50) =================
  {
    id: 't45_ref_power',
    section: 'B',
    topic: 45,
    prompt: 'باستعمال المتتاليات المرجعية nʳ و 1/nʳ (r ∈ ℚ₊*)، احسب النهاية:\nlim(n→+∞) (4√n + 5) / (2√n - n⁻¹/²)',
    hint: 'نعمل بـ √n في البسط والمقام ثم نستعمل lim(1/√n) = 0 و lim(1/n) = 0.',
    options: ['+∞', '0', '2', '4'],
    correctIndex: 2
  },
  {
    id: 't45_qn_converge',
    section: 'B',
    topic: 45,
    prompt: 'احسب نهاية المتتالية: lim(n→+∞) [3 - 5·(-2/3)ⁿ + 4/n^(3/2)] =',
    hint: 'بما أن -1 < -2/3 < 1 فإن lim (-2/3)ⁿ = 0، وكذلك lim 1/n^(3/2) = 0.',
    options: ['+∞', '3', '-2', 'ليس لها نهاية'],
    correctIndex: 1,
    graphSpec: { type: 'geo_limits' }
  },
  {
    id: 't45_qn_cases',
    section: 'B',
    topic: 45,
    prompt: 'متى تكون المتتالية الهندسية (qⁿ) لا تقبل أي نهاية عند +∞ (البند 1.1.2)؟',
    hint: 'عندما تتناوب الإشارة دون أن تقترب من 0.',
    options: [
      'عندما -1 < q < 1',
      'عندما q > 1',
      'عندما q ≤ -1 (مثل (-1)ⁿ أو (-2)ⁿ)',
      'عندما q = 1'
    ],
    correctIndex: 2
  },
  {
    id: 't46_monotone_conv',
    section: 'B',
    topic: 46,
    prompt: 'نعلم أن (uₙ) متزايدة ومكبورة بالعدد 5 (أي uₙ ≤ 5 لكل n).\nما الاستنتاج الدقيق وفق مبرهنة التقارب الرتيب؟',
    hint: 'انتبه: المكبر M يضمن وجود نهاية L، لكن L ليس بالضرورة مساوياً لـ M!',
    options: [
      '(uₙ) متقاربة ونهايتها تساوي 5 حتماً',
      '(uₙ) متقاربة نحو نهاية L تحقق L ≤ 5',
      '(uₙ) تؤول إلى +∞',
      '(uₙ) متناقصة نحو 0'
    ],
    correctIndex: 1
  },
  {
    id: 't46_dec_minor',
    section: 'B',
    topic: 46,
    prompt: 'أي الشروط التالية يضمن تقارب المتتالية (uₙ) دون معرفة تعبيرها الصريح؟',
    hint: 'طابق مع مبرهنتي التقارب الرتيب.',
    options: [
      '(uₙ) تناقصية فقط دون مصغر',
      '(uₙ) مصغورة بـ 0 فقط دون رتابة',
      '(uₙ) تناقصية ومصغورة بالعدد m = 1',
      '(uₙ) تزايدية ومصغورة بالعدد 1'
    ],
    correctIndex: 2
  },
  {
    id: 't47_squeeze_graph',
    section: 'B',
    topic: 47,
    prompt: 'في المبيان المرفق: المتتالية uₙ = 2 + sin(n)/√n محصورة بين الدالتين vₙ و wₙ:\n2 - 1/√n ≤ uₙ ≤ 2 + 1/√n.\nما نهاية (uₙ) حسب مبرهنة الدركيين؟',
    hint: 'نهايتا الحدين المحيطين متساويتان عند +∞: lim(2 - 1/√n) = lim(2 + 1/√n) = 2.',
    options: ['0', '2', '+∞', 'ليس لها نهاية'],
    correctIndex: 1,
    graphSpec: { type: 'squeeze_envelope' }
  },
  {
    id: 't47_abs_criterion',
    section: 'B',
    topic: 47,
    prompt: 'إذا تحقق لجميع n ∈ ℕ: |uₙ - 3| ≤ 5 · (1/4)ⁿ،\nفإن المتتالية (uₙ) حسب مصداق القيمة المطلقة (البند 1.1.2):',
    hint: 'بما أن -1 < 1/4 < 1 فإن lim 5·(1/4)ⁿ = 0.',
    options: [
      'تؤول إلى 5',
      'متقاربة ونهايتها L = 3',
      'متباعدة نحو +∞',
      'تؤول إلى 1/4'
    ],
    correctIndex: 1
  },
  {
    id: 't47_comp_inf',
    section: 'B',
    topic: 47,
    prompt: 'نعلم أن لجميع n ≥ 1: uₙ ≥ 2ⁿ + cos(n) ≥ 2ⁿ - 1.\nماذا نستنتج عن نهاية (uₙ)؟',
    hint: 'بما أن 2 > 1 فإن lim(2ⁿ - 1) = +∞.',
    options: [
      'lim uₙ = -1',
      'lim uₙ = 0',
      'lim uₙ = +∞ (بالمقارنة عند اللانهاية)',
      'متقاربة نحو 2'
    ],
    correctIndex: 2
  },
  {
    id: 't48_comp_limit',
    section: 'B',
    topic: 48,
    prompt: 'نعلم أن lim(n→+∞) uₙ = 4، ونضع vₙ = √(uₙ + 5) (البند 1.1.3).\nلماذا وما قيمة lim vₙ؟',
    hint: 'الدالة f(x) = √(x + 5) متصلة عند x = 4، إذن lim f(uₙ) = f(4).',
    options: [
      '9 لأن 4 + 5 = 9',
      '3 لأن f(x)=√(x+5) متصلة في 4 و f(4)=3',
      '2 لأن √4 = 2',
      '+∞'
    ],
    correctIndex: 1
  },
  {
    id: 't48_trig_exp_comp',
    section: 'B',
    topic: 48,
    prompt: 'إذا كان lim(n→+∞) uₙ = 0، فإن نهاية المتتالية vₙ = e^(uₙ) + 2cos(uₙ) هي:',
    hint: 'الدالة f(x) = eˣ + 2cos(x) متصلة عند 0، احسب f(0).',
    options: ['1', '2', '3', 'e + 2'],
    correctIndex: 2
  },
  {
    id: 't49_five_conditions',
    section: 'B',
    topic: 49,
    prompt: 'لتحديد نهاية متتالية ترجعية uₙ₊₁ = f(uₙ) بحل المعادلة f(L) = L (البند 1.1.4)،\nأي الشروط الخمسة يجب تحققها كاملة على المجال I؟',
    hint: 'الاتصال على I، الاستقرار f(I) ⊂ I، u₀ ∈ I، تقارب (uₙ)، وحل f(L)=L في I.',
    options: [
      'يكفي فقط أن تكون f(L) = L',
      'f متصلة على I، f(I)⊂I، u₀∈I، و (uₙ) متقاربة ⇒ L∈I تحقق f(L)=L',
      'يجب أن تكون f دالة خطية فقط',
      'u₀ > L وفقط'
    ],
    correctIndex: 1,
    graphSpec: { type: 'cobweb_converge' }
  },
  {
    id: 't49_root_selection',
    section: 'B',
    topic: 49,
    prompt: 'في المبيان العنكبوتي لـ uₙ₊₁ = √(uₙ + 2) مع ∀n: uₙ ∈ I = [1, 3] و (uₙ) متقاربة.\nحلول f(L) = L هي L = 2 و L = -1. ما نهاية (uₙ)؟',
    hint: 'يجب أن تنتمي النهاية L إلى المجال المستقر I = [1, 3]!',
    options: [
      'L = -1',
      'L = 2 لأن 2 ∈ [1, 3] بينما -1 ∉ [1, 3]',
      'L = 1',
      'تقبل نهايتين 2 و -1'
    ],
    correctIndex: 1,
    graphSpec: { type: 'cobweb_converge' }
  },
  {
    id: 't50_modeling_pop',
    section: 'B',
    topic: 50,
    prompt: 'مسألة نمذجة (البند 1.1.5): خزان يفقد يومياً 20% من مائه ويُضاف إليه 40L:\nuₙ₊₁ = 0.8 uₙ + 40. على المدى الطويل (n → +∞)، كم سيستقر حجم الماء في الخزان؟',
    hint: 'نحل معادلة الاستقرار L = 0.8 L + 40 (أو نضع متتالية مساعدة هندسية q = 0.8).',
    options: ['160 L', '200 L', '320 L', '40 L'],
    correctIndex: 1
  },
  {
    id: 't50_implicit_seq',
    section: 'B',
    topic: 50,
    prompt: 'لكل n ≥ 1، المعادلة xⁿ + x - 1 = 0 تقبل حلاً وحيداً xₙ ∈ ]0, 1[ (متتالية ضمنية 1.1.5).\nبتزايد (xₙ) وتقاربها، علماً أن xₙⁿ = 1 - xₙ < 1 - x₁، ماذا نستنتج عن lim xₙ؟',
    hint: 'بما أن xₙ تزايدية في ]0, 1[ فهي تتقارب نحو L ∈ ]0, 1]؛ لو كان L < 1 لآل xₙⁿ → 0 مما يناقض 1 - L > 0.',
    options: [
      'lim xₙ = 0',
      'lim xₙ = 1/2',
      'lim xₙ = 1',
      'lim xₙ = +∞'
    ],
    correctIndex: 2
  }
];

window.pickSequenceChallenge = function(filterMode = 'all', sectorTopics = null, recentIds = []) {
  let pool = window.SEQ_QUESTION_BANK;

  if (filterMode === 'sectionA') {
    pool = pool.filter(q => q.section === 'A');
  } else if (filterMode === 'sectionB') {
    pool = pool.filter(q => q.section === 'B');
  } else if (Array.isArray(sectorTopics) && sectorTopics.length > 0) {
    const secPool = pool.filter(q => sectorTopics.includes(q.topic));
    if (secPool.length > 0) pool = secPool;
  }

  let fresh = pool.filter(q => !recentIds.includes(q.id));
  if (fresh.length === 0) fresh = pool;

  const base = fresh[Math.floor(Math.random() * fresh.length)];
  const indexed = base.options.map((text, idx) => ({ text, isCorrect: idx === base.correctIndex }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = indexed[i];
    indexed[i] = indexed[j];
    indexed[j] = tmp;
  }

  return {
    ...base,
    options: indexed.map(o => o.text),
    correctIndex: indexed.findIndex(o => o.isCorrect)
  };
};
