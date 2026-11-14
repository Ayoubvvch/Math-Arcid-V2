/**
 * Asymptote Asylum (مصحّة المشتقة): 2D Calculus Horror Curriculum Engine
 * Covers 100% of Topics 23 through 38:
 *   Section A (23-29): Derivative Rules, Limits, Unilateral Derivatives, Chain & Inverse Rules
 *   Section B (30-38): Variations, Auxiliary Function, Graphical Solving, Optimization/Inequalities,
 *                      Concavity/Inflection, Infinite Branches, Relative Position, Symmetry & Curve Sketching
 */

window.CURRICULUM_TOPICS = {
  23: 'قابلية الاشتقاق في نقطة (1.2.5)',
  24: 'معادلة المماس والتقريب التآلفي',
  25: 'الاشتقاق على اليمين واليسار والنقطة المزواة',
  26: 'جدول مشتقات الدوال الاعتيادية',
  27: 'العمليات على الدوال المشتقة',
  28: 'مشتقة مركب دالتين وجذر الرتبة n',
  29: 'مشتقة الدالة العكسية (1.2.11)',
  30: 'الرتابة وجدول التغيرات (1.2.7)',
  31: 'تقنية الدالة المساعدة وإشارتها (1.2.8)',
  32: 'القراءة المبيانية وحل المعادلات (1.2.9 / 1.2.10)',
  33: 'المطاريف والاستمثال وإثبات المتفاوتات (1.2.12 / 1.2.13)',
  34: 'المشتقة الثانية والتحدب ونقط الانعطاف',
  35: 'شجرة الفروع اللانهائية كاملة',
  36: 'الوضع النسبي لمنحنى ومقارب/مماس',
  37: 'الزوجية والدورية وعناصر التماثل (1.2.22)',
  38: 'الإنشاء الهندسي للمنحنى (Cf) و (Cf⁻¹)'
};

window.ASYLUM_WARDS = [
  {
    id: 1,
    name: 'جناح المشرحة — قابلية الاشتقاق والمماسات (23–26)',
    topics: [23, 24, 25, 26],
    sealColor: '#ef4444'
  },
  {
    id: 2,
    name: 'قبو العمليات — قواعد التركيب والعكسية (27–29)',
    topics: [27, 28, 29],
    sealColor: '#f59e0b'
  },
  {
    id: 3,
    name: 'عنبر المرايا — الرتابة والدالة المساعدة والمبيان (30–34)',
    topics: [30, 31, 32, 33, 34],
    sealColor: '#10b981'
  },
  {
    id: 4,
    name: 'المذبح اللانهائي — الفروع، التماثل والإنشاء (35–38)',
    topics: [35, 36, 37, 38],
    sealColor: '#c084fc'
  }
];

window.RITUAL_QUESTION_BANK = [
  // ================= SECTION A: DERIVATIVES (23 - 29) =================
  {
    id: 't23_poly_lim',
    section: 'A',
    topic: 23,
    prompt: 'نعتبر الدالة f(x) = x² + 3x. احسب النهاية:\nlim(x→1) [f(x) - f(1)] / (x - 1) =',
    hint: 'النهاية تساوي العدد المشتق f\'(1) حيث f\'(x) = 2x + 3.',
    options: ['5', '4', '3', 'غير قابلة للاشتقاق'],
    correctIndex: 0
  },
  {
    id: 't23_sqrt_lim',
    section: 'A',
    topic: 23,
    prompt: 'احسب قيمة النهاية باستعمال العدد المشتق:\nlim(x→2) [√(x + 2) - 2] / (x - 2) =',
    hint: 'ضع f(x) = √(x+2)، إذن النهاية هي f\'(2) = 1 / (2√4).',
    options: ['1/2', '1/4', '2', '0'],
    correctIndex: 1
  },
  {
    id: 't23_trig_lim',
    section: 'A',
    topic: 23,
    prompt: 'باستعمال العدد المشتق للدالة f(x) = cos(x) عند x₀ = 0:\nlim(x→0) [cos(x) - 1] / x =',
    hint: 'f\'(x) = -sin(x) ومنه f\'(0) = -sin(0).',
    options: ['1', '-1', '0', '+∞'],
    correctIndex: 2
  },
  {
    id: 't24_tangent_eq',
    section: 'A',
    topic: 24,
    prompt: 'لتكن f(x) = x² - 2x + 3. ما معادلة المماس (T) لمنحنى (Cf) في النقطة ذات الأفصول x₀ = 2؟',
    hint: 'f(2) = 3 و f\'(2) = 2، نطبق (T): y = f\'(2)(x - 2) + f(2).',
    options: ['y = 2x + 3', 'y = 2x - 1', 'y = 4x - 5', 'y = x + 1'],
    correctIndex: 1,
    graphSpec: { type: 'tangent_parabola' }
  },
  {
    id: 't24_affine_approx',
    section: 'A',
    topic: 24,
    prompt: 'باستعمال التقريب التآلفي للدالة f(x) = √x بجوار x₀ = 9:\n√(9.06) ≈ f\'(9)(9.06 - 9) + f(9) ≈',
    hint: 'f(9) = 3 و f\'(9) = 1/(2×3) = 1/6، والفرق h = 0.06.',
    options: ['3.06', '3.03', '3.01', '3.005'],
    correctIndex: 2
  },
  {
    id: 't24_sin_approx',
    section: 'A',
    topic: 24,
    prompt: 'التقريب التآلفي للدالة f(x) = (1 + x)³ بجوار x₀ = 0 يعطي (1.01)³ ≈',
    hint: 'f(0) = 1 و f\'(0) = 3(1+0)² = 3، إذن f(x) ≈ 1 + 3x.',
    options: ['1.01', '1.03', '1.06', '1.30'],
    correctIndex: 1
  },
  {
    id: 't25_point_anguleux',
    section: 'A',
    topic: 25,
    prompt: 'لاحظ المبيان لـ f(x) = |x - 1| عند x₀ = 1:\nf\'d(1) = +1  و  f\'g(1) = -1.\nما التأويل الهندسي عند x₀ = 1؟',
    hint: 'العددان المشتقان على اليمين واليسار مختلفان (1 ≠ -1).',
    options: [
      'نقطة انعطاف ومماس أفقي',
      'نصفا مماسين يحددان نقطة مزواة (Point anguleux)',
      'مقارب عمودي x = 1',
      'نصف مماس عمودي نحو الأعلى'
    ],
    correctIndex: 1,
    graphSpec: { type: 'point_anguleux' }
  },
  {
    id: 't25_vertical_right',
    section: 'A',
    topic: 25,
    prompt: 'إذا كان lim(x→0⁺) [f(x) - f(0)] / (x - 0) = +∞، فإن (Cf) يقبل على يمين 0:',
    hint: 'على اليمين (+): النهاية +∞ توافق الاتجاه نحو الأعلى.',
    options: [
      'مماساً أفقياً معادلته y = f(0)',
      'نصف مماس عمودي موجه نحو الأسفل',
      'نصف مماس عمودي موجه نحو الأعلى',
      'فرعاً شلجمياً اتجاهه (Ox)'
    ],
    correctIndex: 2,
    graphSpec: { type: 'vertical_half_tangent' }
  },
  {
    id: 't25_vertical_left',
    section: 'A',
    topic: 25,
    prompt: 'إذا كان lim(x→2⁻) [f(x) - f(2)] / (x - 2) = +∞، فإن (Cf) يقبل على يسار 2:',
    hint: 'انتبه! على اليسار (x - 2 < 0): خارج القسمة موجب يعني f(x) - f(2) < 0، أي المنحنى تحت f(2).',
    options: [
      'نصف مماس عمودي موجه نحو الأسفل',
      'نصف مماس عمودي موجه نحو الأعلى',
      'نقطة مزواة بميلين 1 و -1',
      'نصف مماس أفقي'
    ],
    correctIndex: 0
  },
  {
    id: 't26_usual_tan',
    section: 'A',
    topic: 26,
    prompt: 'ما المشتقة الصحيحة للدالة الاعتيادية f(x) = tan(x) على مجال اشتقاقها؟',
    hint: 'تذكر tan(x) = sin(x)/cos(x) وتطبيق (u/v)\'.',
    options: ['1 / sin²(x)', '-1 / cos²(x)', '1 + tan²(x) = 1/cos²(x)', 'sec(x)'],
    correctIndex: 2
  },
  {
    id: 't26_usual_mix',
    section: 'A',
    topic: 26,
    prompt: 'احسب مشتقة الدالة الاعتيادية:\nf(x) = (1 / x) + 4√x - 2cos(x)  ⇒  f\'(x) =',
    hint: '(1/x)\' = -1/x² ، (√x)\' = 1/(2√x) ، (cos x)\' = -sin x.',
    options: [
      '-1/x² + 2/√x + 2sin(x)',
      '1/x² + 2/√x - 2sin(x)',
      '-1/x² + 4/√x + 2sin(x)',
      '-1/x + 2√x + 2sin(x)'
    ],
    correctIndex: 0
  },
  {
    id: 't27_quotient',
    section: 'A',
    topic: 27,
    prompt: 'احسب مشتقة الدالة الكسرية (u/v)\' لـ f(x) = (2x + 1) / (x - 1):',
    hint: 'u\'v - uv\' = 2(x - 1) - 1(2x + 1) الكل مقسوم على (x - 1)².',
    options: ['3 / (x - 1)²', '-3 / (x - 1)²', '2 / (x - 1)²', '-1 / (x - 1)²'],
    correctIndex: 1
  },
  {
    id: 't27_power_u',
    section: 'A',
    topic: 27,
    prompt: 'بتطبيق القاعدة (uⁿ)\' = n·u\'·uⁿ⁻¹، ما مشتقة f(x) = (x² + 1)⁴؟',
    hint: 'u = x² + 1 و u\' = 2x والأس n = 4.',
    options: ['4(x² + 1)³', '8x(x² + 1)³', '4x(x² + 1)³', '8(x² + 1)³'],
    correctIndex: 1
  },
  {
    id: 't27_rational_exp',
    section: 'A',
    topic: 27,
    prompt: 'بتطبيق (uʳ)\' = r·u\'·uʳ⁻¹، ما مشتقة f(x) = (3x + 2)^(2/3) حيث 3x + 2 > 0؟',
    hint: 'r = 2/3 و u\' = 3؛ لاحظ اختزال 3 مع المقام 3!',
    options: [
      '2(3x + 2)^(-1/3)',
      '(2/3)(3x + 2)^(-1/3)',
      '6(3x + 2)^(-1/3)',
      '2(3x + 2)^(1/3)'
    ],
    correctIndex: 0
  },
  {
    id: 't28_chain_rule',
    section: 'A',
    topic: 28,
    prompt: 'باستعمال مشتقة مركب دالتين (v∘u)\'(x) = u\'(x)·v\'(u(x)):\nما مشتقة f(x) = cos(3x² - 1)؟',
    hint: 'u\'(x) = 6x و v\'(t) = -sin(t).',
    options: [
      '-sin(3x² - 1)',
      '6x·sin(3x² - 1)',
      '-6x·sin(3x² - 1)',
      '-3·sin(6x)'
    ],
    correctIndex: 2
  },
  {
    id: 't28_nth_root',
    section: 'A',
    topic: 28,
    prompt: 'مشتقة جذر الرتبة n هي (ⁿ√u)\' = u\' / (n · ⁿ√(uⁿ⁻¹)).\nإذن مشتقة f(x) = ³√(x² + 1) هي:',
    hint: 'هنا n = 3 و u = x² + 1 و u\' = 2x.',
    options: [
      '2x / (3 · ³√(x² + 1)²)',
      '1 / (3 · ³√(x² + 1)²)',
      '2x / ³√(x² + 1)',
      '2x / (2√(x² + 1))'
    ],
    correctIndex: 0
  },
  {
    id: 't28_chain_eval',
    section: 'A',
    topic: 28,
    prompt: 'إذا علمت أن u(1) = 4 و u\'(1) = 3 و v\'(4) = -2، فما قيمة (v∘u)\'(1)؟',
    hint: '(v∘u)\'(1) = u\'(1) × v\'(u(1)).',
    options: ['-8', '5', '-6', '-2/3'],
    correctIndex: 2
  },
  {
    id: 't29_inv_value',
    section: 'A',
    topic: 29,
    prompt: 'نعتبر f(x) = x³ + x تقابلاً من ℝ نحو ℝ (البند 1.2.11).\nبملاحظة أن f(1) = 2، احسب (f⁻¹)\'(2):',
    hint: 'نطبق (f⁻¹)\'(y₀) = 1 / f\'(x₀) مع x₀ = 1 و f\'(x) = 3x² + 1.',
    options: ['1/2', '4', '1/4', '1/3'],
    correctIndex: 2
  },
  {
    id: 't29_inv_condition',
    section: 'A',
    topic: 29,
    prompt: 'لتكن f قابلة للاشتقاق في x₀ حيث y₀ = f(x₀). ما الشرط الضروري لتكون f⁻¹ قابلة للاشتقاق في y₀؟',
    hint: 'يظهر f\'(x₀) في المقام في صيغة مشتقة الدالة العكسية!',
    options: ['f\'(x₀) = 0', 'f\'(x₀) ≠ 0', 'f(x₀) > 0', 'f\'\'(x₀) = 0'],
    correctIndex: 1
  },
  {
    id: 't29_inv_interval',
    section: 'A',
    topic: 29,
    prompt: 'ما التعبير العام لمشتقة الدالة العكسية (f⁻¹)\'(x) على مجال J؟',
    hint: 'نحافظ على تركيب f\' مع f⁻¹ في المقام.',
    options: [
      '1 / f(f⁻¹(x))',
      'f\'(f⁻¹(x))',
      '1 / f\'(f⁻¹(x))',
      '-f\'(x) / [f(x)]²'
    ],
    correctIndex: 2
  },

  // ================= SECTION B: CURVE STUDY & FUNCTIONS (30 - 38) =================
  {
    id: 't30_monotony_sign',
    section: 'B',
    topic: 30,
    prompt: 'لاحظ إشارة f\'(x) = x² - 4.\nعلى أي مجال تكون الدالة f تناقصية قطعا؟',
    hint: 'f تناقصية عندما تكون المشتقة f\'(x) ≤ 0.',
    options: [']-∞, -2]', '[-2, 2]', '[2, +∞[', '[0, 4]'],
    correctIndex: 1,
    graphSpec: { type: 'sign_fprime' }
  },
  {
    id: 't30_extremum_from_deriv',
    section: 'B',
    topic: 30,
    prompt: 'إذا كانت f\'(x) = (x - 3) / (x² + 1)، فماذا تقبل الدالة f عند x = 3؟',
    hint: 'f\'(x) سالبة لـ x < 3 ثم موجبة لـ x > 3.',
    options: [
      'قيمة قصوى مطلقة',
      'قيمة دنوية (Minimum)',
      'نقطة انعطاف دون مطراف',
      'فرعاً شلجمياً عمودياً'
    ],
    correctIndex: 1
  },
  {
    id: 't31_aux_min',
    section: 'B',
    topic: 31,
    prompt: 'الدالة المساعدة g تقبل على ]0, +∞[ قيمة دنوية هي g(1) = 2 > 0.\nعلماً أن f\'(x) = g(x) / x²، ماذا نستنتج عن رتابة f؟',
    hint: 'بما أن g(1) = 2 هي القيمة الدنوية فإن ∀x>0: g(x) ≥ 2 > 0.',
    options: [
      'f تناقصية قطعا على ]0, +∞[',
      'f تغير رتابتها عند x = 1',
      'f تزايدية قطعا على ]0, +∞[',
      'f منعدمة عند x = 2'
    ],
    correctIndex: 2
  },
  {
    id: 't31_aux_alpha',
    section: 'B',
    topic: 31,
    prompt: 'في الجزء الأول من مسألة (البند 1.2.8): g متصلة وتزايدية قطعا وتنعدم في α (g(α)=0).\nإذا كان f\'(x) = g(x)، فإن إشارة f\'(x) هي:',
    hint: 'إذا تزايدت g وعبرت الصفر في α، فهي سالبة على اليسار وموجبة على اليمين.',
    options: [
      'سالبة على ]-∞, α] وموجبة على [α, +∞[',
      'موجبة على ]-∞, α] وسالبة على [α, +∞[',
      'موجبة دائماً على ℝ',
      'سالبة دائماً على ℝ'
    ],
    correctIndex: 0
  },
  {
    id: 't32_graph_ineq',
    section: 'B',
    topic: 32,
    prompt: 'انطلاقاً من المبيان أمامك (Cf باللون الأزرق و Cg باللون الأحمر):\nما مجموعة حلول المتراجحة f(x) ≤ g(x)؟',
    hint: 'المجال الذي يقع فيه المنحنى (Cf) تحت المنحنى (Cg) بين نقطتي التقاطع.',
    options: [']-∞, -1]', '[-1, 2]', '[2, +∞[', ']-∞, -1] ∪ [2, +∞['],
    correctIndex: 1,
    graphSpec: { type: 'intersect_fg' }
  },
  {
    id: 't32_graph_sign',
    section: 'B',
    topic: 32,
    prompt: 'من المبيان لـ (Cf) وتقاطعاته مع محور الأفاصيل عند -2 و 0 و 2:\nما مجموعة حلول المتراجحة f(x) ≥ 0؟',
    hint: 'ابحث عن المجالات التي يقع فيها (Cf) فوق محور الأفاصيل (Ox).',
    options: [
      '[-2, 0] ∪ [2, +∞[',
      ']-∞, -2] ∪ [0, 2]',
      '[-2, 2]',
      '[0, +∞['
    ],
    correctIndex: 0,
    graphSpec: { type: 'cubic_ox_sign' }
  },
  {
    id: 't33_ineq_exp',
    section: 'B',
    topic: 33,
    prompt: 'بدراسة تغيرات h(x) = eˣ - x - 1 على ℝ، ما المتفاوتة الصحيحة لجميع x ∈ ℝ؟',
    hint: 'h\'(x) = eˣ - 1 تنعدم في 0 وتكون h(0) = 0 قيمة دنوية.',
    options: ['eˣ ≤ x + 1', 'eˣ ≥ x + 1', 'eˣ ≤ x', 'eˣ - x < 0'],
    correctIndex: 1
  },
  {
    id: 't33_ineq_ln',
    section: 'B',
    topic: 33,
    prompt: 'لتوظيف الرتابة على ]-1, +∞[ مع h(x) = x - ln(1 + x):\nبما أن القيمة الدنوية هي h(0) = 0، نستنتج:',
    hint: 'h(x) ≥ 0 تكافئ x ≥ ln(1 + x).',
    options: [
      'ln(1 + x) ≥ x',
      'ln(1 + x) ≤ x',
      'ln(1 + x) > x + 1',
      'ln(x) ≤ x - 2'
    ],
    correctIndex: 1
  },
  {
    id: 't33_optim_rect',
    section: 'B',
    topic: 33,
    prompt: 'مسألة استمثال (1.2.12): مستطيل محيطه 20m (إذن الطول y = 10 - x).\nما قيمة x التي تجعل المساحة S(x) = x(10 - x) قصوى؟',
    hint: 'S\'(x) = 10 - 2x = 0.',
    options: ['x = 2', 'x = 4', 'x = 5 (مساحة 25m²)', 'x = 8'],
    correctIndex: 2
  },
  {
    id: 't34_concavity_inflect',
    section: 'B',
    topic: 34,
    prompt: 'لتكن f(x) = x³ - 3x² + 4 (ومنه f\'\'(x) = 6x - 6).\nما نقطة الانعطاف I وما مجال تحدب المنحنى (f\'\'(x) ≥ 0)؟',
    hint: 'f\'\'(x) = 0 ⇔ x = 1 وتغير إشارتها، و f(1) = 2.',
    options: [
      'I(1, 2) ومحدب على [1, +∞[',
      'I(0, 4) ومقعر على [1, +∞[',
      'I(2, 0) ومحدب على ]-∞, 1]',
      'لا توجد نقطة انعطاف'
    ],
    correctIndex: 0,
    graphSpec: { type: 'inflection_cubic' }
  },
  {
    id: 't34_fprime_inflect',
    section: 'B',
    topic: 34,
    prompt: 'بلا حساب f\'\'، متى تحدد المشتقة الأولى f\' نقطة انعطاف في x₀؟',
    hint: 'مثال كلاسيكي: f(x) = x³ عند x₀ = 0 حيث f\'(x) = 3x² ≥ 0.',
    options: [
      'إذا كانت f\' ثابتة وموجبة',
      'إذا انعدمت f\' في x₀ دون أن تغير إشارتها',
      'إذا كانت f\' غير متصلة في x₀',
      'إذا انعدمت f\' وغيرت إشارتها من + إلى -'
    ],
    correctIndex: 1
  },
  {
    id: 't35_branch_ox',
    section: 'B',
    topic: 35,
    prompt: 'في شجرة الفروع اللانهائية: lim(x→+∞) f(x) = +∞  و  lim(x→+∞) f(x)/x = 0.\nما طبيعة الفرع اللانهائي لـ (Cf) بجوار +∞؟',
    hint: 'نهاية f(x)/x منعدمة تعني أن النمو أبطأ من أي مستقيم مائل.',
    options: [
      'فرع شلجمي اتجاهه محور الأراتيب (Oy)',
      'فرع شلجمي اتجاهه محور الأفاصيل (Ox)',
      'مقارب أفقي y = 0',
      'مقارب مائل y = x'
    ],
    correctIndex: 1,
    graphSpec: { type: 'branch_parabolic_ox' }
  },
  {
    id: 't35_branch_oy',
    section: 'B',
    topic: 35,
    prompt: 'إذا كان lim(x→+∞) f(x) = +∞  و  lim(x→+∞) f(x)/x = +∞، فإن (Cf) يقبل بجوار +∞:',
    hint: 'النمو أسرع من كل مستقيم مائل (مثل الدالة الأسية أو x²).',
    options: [
      'فرع شلجمي اتجاهه محور الأراتيب (Oy)',
      'فرع شلجمي اتجاهه محور الأفاصيل (Ox)',
      'مقارب مائل معامل توجيهه +∞',
      'مقارب عمودي'
    ],
    correctIndex: 0
  },
  {
    id: 't35_branch_oblique',
    section: 'B',
    topic: 35,
    prompt: 'إذا كان lim(x→+∞) f(x)/x = 2  و  lim(x→+∞) [f(x) - 2x] = -3، فإن (Cf) يقبل:',
    hint: 'lim[f(x) - ax] = b ∈ ℝ يعطي مقارباً مائلاً y = ax + b.',
    options: [
      'فرعاً شلجمياً اتجاهه المستقيم y = 2x',
      'مقارباً مائلاً معادلته y = 2x - 3',
      'مقارباً أفقياً y = -3',
      'مقارباً مائلاً y = -3x + 2'
    ],
    correctIndex: 1,
    graphSpec: { type: 'oblique_asymptote' }
  },
  {
    id: 't35_branch_parab_ax',
    section: 'B',
    topic: 35,
    prompt: 'إذا كان lim(x→+∞) f(x)/x = 3  و  lim(x→+∞) [f(x) - 3x] = +∞، فإن (Cf) يقبل:',
    hint: 'وجود ±∞ في المرحلة الثانية [f(x)-ax] يعني فرعاً شلجمياً!',
    options: [
      'مقارباً مائلاً y = 3x',
      'فرعاً شلجمياً اتجاهه محور الأراتيب (Oy)',
      'فرعاً شلجمياً اتجاهه المستقيم y = 3x',
      'مقارباً عمودياً x = 3'
    ],
    correctIndex: 2
  },
  {
    id: 't36_rel_pos_calc',
    section: 'B',
    topic: 36,
    prompt: 'ليكن المقارب المائل (D): y = 2x + 1 بحيث f(x) - (2x + 1) = (x - 3) / (x² + 1).\nمتى يقع المنحنى (Cf) فوق المستقيم (D)؟',
    hint: 'يكون (Cf) فوق (D) عندما يكون الفرق f(x) - y > 0.',
    options: [
      'على المجال ]-∞, 3[',
      'على المجال ]3, +∞[',
      'على كل ℝ',
      'على المجال ]-∞, 0['
    ],
    correctIndex: 1
  },
  {
    id: 't36_rel_pos_graph',
    section: 'B',
    topic: 36,
    prompt: 'في المبيان: يظهر (Cf) والمقارب المائل (D): y = x - 1.\nعلى أي مجال يقع المنحنى (Cf) تحت المقارب (D)؟',
    hint: 'لاحظ موضع المنحنى (Cf) أسفل الخط المتقطع (D).',
    options: [']-∞, 0[', ']0, +∞[', ']1, +∞[', '[-1, 1]'],
    correctIndex: 0,
    graphSpec: { type: 'relative_position' }
  },
  {
    id: 't37_axis_sym',
    section: 'B',
    topic: 37,
    prompt: 'ما العلاقة التي تثبت أن المستقيم (Δ): x = 3 محور تماثل للمنحنى (Cf) (البند 1.2.22)؟',
    hint: 'الصيغة لمحور التماثل x = a هي (2a - x) ∈ Df و f(2a - x) = f(x).',
    options: [
      'f(3 - x) = f(x)',
      'f(6 - x) = f(x) مع (6 - x) ∈ Df',
      'f(6 - x) + f(x) = 6',
      'f(-x) = -f(x)'
    ],
    correctIndex: 1
  },
  {
    id: 't37_center_sym',
    section: 'B',
    topic: 37,
    prompt: 'إذا تحقق ∀x ∈ Df: (4 - x) ∈ Df و f(4 - x) + f(x) = 6،\nفما إحداثيات مركز التماثل Ω(a, b)؟',
    hint: 'نطابق مع 2a - x = 4 - x و 2b = 6.',
    options: ['Ω(4, 6)', 'Ω(2, 3)', 'Ω(3, 2)', 'Ω(2, 6)'],
    correctIndex: 1
  },
  {
    id: 't37_parity_periodic',
    section: 'B',
    topic: 37,
    prompt: 'ادرس زوجية الدالة f(x) = x³ / cos(x) على مجالها المتماثل بالنسبة لـ 0:',
    hint: '(-x)³ = -x³ و cos(-x) = cos(x).',
    options: [
      'زوجية (محور التماثل هو Oy)',
      'فردية (مركز التماثل هو أصل المعلم O)',
      'دورية دورها T = 3',
      'لا زوجية ولا فردية'
    ],
    correctIndex: 1
  },
  {
    id: 't38_inverse_sketch',
    section: 'B',
    topic: 38,
    prompt: 'كيف يُنشأ منحنى الدالة العكسية (Cf⁻¹) انطلاقاً من (Cf) في معلم متعامد ممنظم؟',
    hint: 'تتبادل إحداثيات كل نقطة: M(x, y) ∈ (Cf) ⇔ M\'(y, x) ∈ (Cf⁻¹).',
    options: [
      'بالتماثل بالنسبة لمحور الأفاصيل (Ox)',
      'بالتماثل بالنسبة لمحور الأراتيب (Oy)',
      'بالتماثل المحوري بالنسبة للمنصف الأول (D): y = x',
      'بالإزاحة بالمتجهة u(1, 1)'
    ],
    correctIndex: 2,
    graphSpec: { type: 'inverse_curve_sym' }
  },
  {
    id: 't38_transform_features',
    section: 'B',
    topic: 38,
    prompt: 'يقبل (Cf) مقارباً أفقياً y = 2 بجوار +∞ ومماساً عمودياً في A(0, 1).\nما خصائص منحنى الدالة العكسية (Cf⁻¹) الموافقة؟',
    hint: 'بالتماثل بالنسبة لـ y = x تنقلب x ↔ y (الأفقي يصبح عمودياً والعمودي أفقياً!).',
    options: [
      'مقارب عمودي x = 2 ومماس أفقي في A\'(1, 0)',
      'مقارب أفقي y = -2 ومماس عمودي في (0, -1)',
      'مقارب مائل y = 2x ومماس في (0, 1)',
      'مقارب عمودي x = 1 ومماس أفقي في (2, 0)'
    ],
    correctIndex: 0
  }
];

/**
 * Selects a question matching active topic filter & ward preferences cleanly without immediate repeats
 */
window.pickRitualChallenge = function(filterMode = 'all', wardTopics = null, recentIds = []) {
  let pool = window.RITUAL_QUESTION_BANK;

  if (filterMode === 'sectionA') {
    pool = pool.filter(q => q.section === 'A');
  } else if (filterMode === 'sectionB') {
    pool = pool.filter(q => q.section === 'B');
  } else if (Array.isArray(wardTopics) && wardTopics.length > 0) {
    const wardPool = pool.filter(q => wardTopics.includes(q.topic));
    if (wardPool.length > 0) pool = wardPool;
  }

  let fresh = pool.filter(q => !recentIds.includes(q.id));
  if (fresh.length === 0) fresh = pool;

  return fresh[Math.floor(Math.random() * fresh.length)];
};
