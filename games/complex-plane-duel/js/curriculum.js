/**
 * Complex Plane Citadel (قلعة أرغاند): Nombres Complexes 2BAC PC Curriculum Engine
 * Covers 100% of Topics 51 through 64:
 *   Section A (51-57): Algebraic Form, Conjugate, Modulus & Loci, Argument & Trigonometric Form,
 *                      Exponential Notation, Euler & Moivre Formulas, Half-Angle & Linearization
 *   Section B (58-64): Vector & Midpoint Affixes, Oriented Angles, Collinearity & Orthogonality,
 *                      Triangle Nature, Quadratic Equations in C & Roots of Unity,
 *                      Translation, Homothety & Rotation in the Complex Plane
 */

window.SEQ_TOPICS = {
  51: 'الشكل الجبري والجزء الحقيقي والتخيلي (z = a + ib)',
  52: 'المرافق العقدي وخواصه الجبرية والهندسية (z̄)',
  53: 'المعيار والمسافة ومجموعات النقط الدائرية والواسطية',
  54: 'العمدة والشكل المثلثي لعدد عقدي غير منعدم',
  55: 'العمليات على العمدة والمعيار في الشكل المثلثي',
  56: 'الترميز الأسي وصيغتا أولير وموافر (r·e^{iθ})',
  57: 'الإخطاط (Linéarisation) وتقنية نصف الزاوية',
  58: 'لحق متجهة ولحق منتصف قطعة ومرجح نقط',
  59: 'قياس الزوايا الموجهة بالعمدة arg((zC-zA)/(zB-zA))',
  60: 'شروط الاستقامية والتعامد وتداور أربع نقط',
  61: 'تحديد طبيعة المثلثات والرباعيات في المستوى العقدي',
  62: 'المعادلات من الدرجة الثانية في ℂ والجذور النونية',
  63: 'التمثيل العقدي للإزاحة والتحاكي (Translation & Homothétie)',
  64: 'التمثيل العقدي للدوران (Rotation) وتركيب التحويلات'
};

window.SEQ_SECTORS = [
  { id: 1, name: 'الربع الأول Q1 — الجبري، المرافق ومجموعات النقط (51–53)', topics: [51, 52, 53], color: '#fbbf24' },
  { id: 2, name: 'الربع الثاني Q2 — المثلثي، الأسي، أولير والإخطاط (54–57)', topics: [54, 55, 56, 57], color: '#38bdf8' },
  { id: 3, name: 'الربع الثالث Q3 — الزوايا، الاستقامية وطبيعة المثلثات (58–61)', topics: [58, 59, 60, 61], color: '#a855f7' },
  { id: 4, name: 'الربع الرابع Q4 — المعادلات، الإزاحة، التحاكي والدوران (62–64)', topics: [62, 63, 64], color: '#10b981' }
];

window.SEQ_QUESTION_BANK = [
  // ================= SECTION A: ALGEBRAIC, TRIG & EXPONENTIAL (51 - 57) =================
  {
    id: 't51_alg_form',
    section: 'A',
    topic: 51,
    prompt: 'ما الشكل الجبري للعدد العقدي z = (1 + i√3) / (1 - i) بعد الضرب في مرافق المقام؟',
    hint: 'اضرب البسط والمقام في (1 + i) وتذكر أن (1 - i)(1 + i) = 1² + 1² = 2.',
    options: [
      'z = ((1 - √3)/2) + i((1 + √3)/2)',
      'z = ((1 + √3)/2) + i((1 - √3)/2)',
      'z = (1 - √3) + i(1 + √3)',
      'z = (1/2) + i(√3/2)'
    ],
    correctIndex: 0
  },
  {
    id: 't51_pure_imag',
    section: 'A',
    topic: 51,
    prompt: 'ليكن z = (x - 2) + i(y + 3) حيث (x, y) ∈ ℝ². متى يكون العدد z تخيلياً صرفاً غير منعدم (z ∈ iℝ*)؟',
    hint: 'العدد التخيلي الصرف ينعدم جزؤه الحقيقي Re(z) = 0 ويخالف جزؤه التخيلي الصفر Im(z) ≠ 0.',
    options: [
      'x = 2 و y ≠ -3',
      'y = -3 و x ≠ 2',
      'x = 2 و y = -3',
      'x = -2 و y = 3'
    ],
    correctIndex: 0
  },
  {
    id: 't52_conj_char',
    section: 'A',
    topic: 52,
    prompt: 'أي من العلاقات التالية تكافئ كون العدد العقدي z تخيلياً صرفاً (z ∈ iℝ) باستعمال المرافق z̄؟',
    hint: 'نعلم أن z + z̄ = 2·Re(z) وأن z - z̄ = 2i·Im(z).',
    options: [
      'z̄ = z',
      'z̄ = -z (أي z + z̄ = 0)',
      'z · z̄ = -1',
      'z̄ = 1 / z'
    ],
    correctIndex: 1
  },
  {
    id: 't52_conj_prod',
    section: 'A',
    topic: 52,
    prompt: 'إذا كان |z| = 1 (أي النقطة M(z) تنتمي إلى الدائرة المثلثية)، فما قيمة المرافق z̄ بدلالة z؟',
    hint: 'لدينا z · z̄ = |z|² = 1.',
    options: [
      'z̄ = -z',
      'z̄ = 1 / z',
      'z̄ = z²',
      'z̄ = -1 / z'
    ],
    correctIndex: 1,
    graphSpec: { type: 'unit_trig' }
  },
  {
    id: 't53_locus_med',
    section: 'A',
    topic: 53,
    prompt: 'في المستوى العقدي، ما مجموعة النقط M(z) التي تحقق العلاقة |z - 2 + i| = |z + 1 - 3i|؟',
    hint: 'اكتب العلاقة على الشكل |z - z_A| = |z - z_B| أي AM = BM حيث A(2 - i) و B(-1 + 3i).',
    options: [
      'الدائرة التي قطرها [AB]',
      'واسط القطعة [AB] حيث z_A = 2 - i و z_B = -1 + 3i',
      'واسط القطعة [AB] حيث z_A = -2 + i و z_B = 1 - 3i',
      'المستقيم (AB) المحذوف منه النقطتان A و B'
    ],
    correctIndex: 1,
    graphSpec: { type: 'mediatrice_ab' }
  },
  {
    id: 't53_locus_circle',
    section: 'A',
    topic: 53,
    prompt: 'ما طبيعة مجموعة النقط M(z) التي تحقق |z̄ - 1 + 2i| = 3؟',
    hint: 'استعمل خاصية |z̄ - w| = |z - w̄| (لأن معيار المرافق يساوي معيار العدد): |z - (1 + 2i)| = 3.',
    options: [
      'الدائرة التي مركزها Ω(1 + 2i) وشعاعها R = 3',
      'الدائرة التي مركزها Ω(1 - 2i) وشعاعها R = 3',
      'الدائرة التي مركزها Ω(-1 + 2i) وشعاعها R = 9',
      'واسط القطعة [OΩ] حيث Ω(1 + 2i)'
    ],
    correctIndex: 0,
    graphSpec: { type: 'circle_locus' }
  },
  {
    id: 't54_trig_trap',
    section: 'A',
    topic: 54,
    prompt: 'فخ وطني كلاسيكي: ليكن z = -2(cos(π/5) + i·sin(π/5)). ما المعيار |z| والعمدة arg(z) الصحيحان؟',
    hint: 'المعيار موجب قطعا (r = 2)! للتخلص من الإشارة السالبة نطبق: -cos(θ) - i·sin(θ) = cos(θ + π) + i·sin(θ + π).',
    options: [
      '|z| = -2 و arg(z) ≡ π/5 [2π]',
      '|z| = 2 و arg(z) ≡ 6π/5 [2π]',
      '|z| = 2 و arg(z) ≡ -π/5 [2π]',
      '|z| = 2 و arg(z) ≡ 4π/5 [2π]'
    ],
    correctIndex: 1
  },
  {
    id: 't54_trig_standard',
    section: 'A',
    topic: 54,
    prompt: 'ما الشكل المثلثي للعدد العقدي z = √3 - i؟',
    hint: 'المعيار |z| = √(3 + 1) = 2، ولدينا cos(θ) = √3/2 و sin(θ) = -1/2 إذن θ ≡ -π/6 [2π].',
    options: [
      'z = 2(cos(-π/6) + i·sin(-π/6))',
      'z = 2(cos(π/6) + i·sin(π/6))',
      'z = 2(cos(-π/3) + i·sin(-π/3))',
      'z = 4(cos(-π/6) + i·sin(-π/6))'
    ],
    correctIndex: 0,
    graphSpec: { type: 'unit_trig' }
  },
  {
    id: 't55_arg_quotient',
    section: 'A',
    topic: 55,
    prompt: 'ليكن z₁ = 1 + i و z₂ = √3 + i. ما عمدة الخارج Z = z₁ / z₂؟',
    hint: 'arg(z₁) ≡ π/4 [2π] و arg(z₂) ≡ π/6 [2π]، ولدينا arg(z₁/z₂) ≡ arg(z₁) - arg(z₂) [2π].',
    options: [
      'arg(Z) ≡ π/12 [2π]',
      'arg(Z) ≡ 5π/12 [2π]',
      'arg(Z) ≡ -π/12 [2π]',
      'arg(Z) ≡ π/24 [2π]'
    ],
    correctIndex: 0
  },
  {
    id: 't55_power_real',
    section: 'A',
    topic: 55,
    prompt: 'ليكن z = 1 + i√3. ما أصغر عدد صحيح طبيعي غير منعدم n يجعل العدد zⁿ عدداً حقيقياً (zⁿ ∈ ℝ)؟',
    hint: 'عمدة z هي π/3، إذن arg(zⁿ) ≡ nπ/3 [2π]. لكي يكون zⁿ ∈ ℝ يجب أن يكون nπ/3 = kπ أي n مضاعف للعدد 3.',
    options: [
      'n = 2',
      'n = 3',
      'n = 6',
      'n = 4'
    ],
    correctIndex: 1
  },
  {
    id: 't56_moivre_power',
    section: 'A',
    topic: 56,
    prompt: 'باستعمال الترميز الأسي وصيغة موافر، ما القيمة المبسطة للعدد (1 + i)¹²؟',
    hint: 'لدينا 1 + i = √2 · e^{iπ/4}، ومنه (1 + i)¹² = (√2)¹² · e^{i·12π/4} = 2⁶ · e^{i·3π} = 64 · (-1).',
    options: [
      '-64',
      '64',
      '64i',
      '-64i'
    ],
    correctIndex: 0
  },
  {
    id: 't56_euler_sin',
    section: 'A',
    topic: 56,
    prompt: 'ما الصيغة الصحيحة لـ sin(θ) وفق صيغتي أولير (Formules d’Euler)؟',
    hint: 'انتبه جيداً لوجود 2i في المقام بالنسبة لدالة الجيب sin(θ)!',
    options: [
      'sin(θ) = (e^{iθ} - e^{-iθ}) / (2i)',
      'sin(θ) = (e^{iθ} - e^{-iθ}) / 2',
      'sin(θ) = (e^{iθ} + e^{-iθ}) / (2i)',
      'sin(θ) = (e^{iθ} + e^{-iθ}) / 2'
    ],
    correctIndex: 0
  },
  {
    id: 't57_half_angle',
    section: 'A',
    topic: 57,
    prompt: 'بتعميل نصف الزاوية في العبارة z = 1 + e^{iθ} حيث θ ∈ ]-π, π[، نحصل على:',
    hint: 'عمّل بـ e^{iθ/2}: z = e^{iθ/2}(e^{-iθ/2} + e^{iθ/2}) = 2·cos(θ/2)·e^{iθ/2}.',
    options: [
      'z = 2·cos(θ/2)·e^{iθ/2}',
      'z = 2i·sin(θ/2)·e^{iθ/2}',
      'z = cos(θ/2)·e^{iθ}',
      'z = 2·cos(θ)·e^{iθ/2}'
    ],
    correctIndex: 0,
    graphSpec: { type: 'half_angle_chord' }
  },
  {
    id: 't57_linearisation',
    section: 'A',
    topic: 57,
    prompt: 'ما نتيجة إخطاط (Linéarisation) التعبير cos³(x) باستعمال صيغة أولير؟',
    hint: 'cos³(x) = ((e^{ix}+e^{-ix})/2)³ = (1/8)[(e^{i3x}+e^{-i3x}) + 3(e^{ix}+e^{-ix})].',
    options: [
      '(1/4)·cos(3x) + (3/4)·cos(x)',
      '(1/8)·cos(3x) + (3/8)·cos(x)',
      '(1/4)·cos(3x) - (3/4)·cos(x)',
      '(1/2)·cos(3x) + (1/2)·cos(x)'
    ],
    correctIndex: 0
  },

  // ================= SECTION B: GEOMETRY, EQUATIONS & TRANSFORMATIONS (58 - 64) =================
  {
    id: 't58_parallelogram',
    section: 'B',
    topic: 58,
    prompt: 'لتكن A(z_A) و B(z_B) و C(z_C) ثلاث نقط. ما لحق النقطة D لكي يكون الرباعي ABCD متوازي أضلاع؟',
    hint: 'ABCD متوازي أضلاع يكافئ المتجهة AB = المتجهة DC، أي z_B - z_A = z_C - z_D.',
    options: [
      'z_D = z_A + z_C - z_B',
      'z_D = z_A + z_B - z_C',
      'z_D = z_B + z_C - z_A',
      'z_D = (z_A + z_B + z_C) / 3'
    ],
    correctIndex: 0
  },
  {
    id: 't59_angle_order',
    section: 'B',
    topic: 59,
    prompt: 'ما العبارة العقدية التي تعطي قياس الزاوية الموجهة (AB⃗, AC⃗) بترديد 2π؟',
    hint: 'المتجهة الثانية (AC⃗) تكون في البسط والمتجهة الأولى (AB⃗) تكون في المقام!',
    options: [
      'arg((z_C - z_A) / (z_B - z_A)) [2π]',
      'arg((z_B - z_A) / (z_C - z_A)) [2π]',
      'arg((z_C - z_B) / (z_A - z_B)) [2π]',
      'arg(z_C - z_A) + arg(z_B - z_A) [2π]'
    ],
    correctIndex: 0
  },
  {
    id: 't60_collinear_orth',
    section: 'B',
    topic: 60,
    prompt: 'إذا وجدنا أن (z_C - z_A) / (z_B - z_A) = -2i، فماذا نستنتج هندسياً حول المثلث ABC؟',
    hint: 'بما أن الخارج تخيلي صرف (-2i ∈ iℝ*) فإن (AB) ⊥ (AC)، وبما أن معياره |-2i| = 2 فإن AC = 2·AB.',
    options: [
      'المثلث ABC قائم الزاوية في A ولدينا AC = 2·AB',
      'النقط A و B و C مستقيمية',
      'المثلث ABC قائم الزاوية ومتساوي الساقين في A',
      'المثلث ABC متساوي الأضلاع'
    ],
    correctIndex: 0
  },
  {
    id: 't60_cocyclic',
    section: 'B',
    topic: 60,
    prompt: 'متى تكون أربع نقط غير مستقيمية مثنى مثنى A و B و C و D متداورة (تنتمي إلى نفس الدائرة)؟',
    hint: 'شرط التداور هو أن يكون خارج النسبتين ((z_C - z_A)/(z_B - z_A)) ÷ ((z_C - z_D)/(z_B - z_D)) عدداً حقيقياً غير منعدم.',
    options: [
      'إذا كان ((z_C - z_A)/(z_B - z_A)) × ((z_B - z_D)/(z_C - z_D)) ∈ ℝ*',
      'إذا كان (z_C - z_A)/(z_B - z_D) ∈ iℝ*',
      'إذا كان z_A + z_B = z_C + z_D',
      'إذا كان |z_A| = |z_B| = |z_C| = |z_D| دائماً فقط'
    ],
    correctIndex: 0
  },
  {
    id: 't61_equilateral',
    section: 'B',
    topic: 61,
    prompt: 'إذا كان (z_C - z_A) / (z_B - z_A) = (1/2) + i(√3/2) = e^{iπ/3}، فما طبيعة المثلث ABC؟',
    hint: 'المعيار يساوي 1 (إذن AC = AB) والعمدة تساوي π/3 (إذن قياس الزاوية A هو π/3).',
    options: [
      'مثلث متساوي الأضلاع (Équilatéral)',
      'مثلث قائم الزاوية ومتساوي الساقين في A',
      'مثلث متساوي الساقين فقط زاويته π/6',
      'مثلث قائم الزاوية في B'
    ],
    correctIndex: 0,
    graphSpec: { type: 'equilateral_abc' }
  },
  {
    id: 't61_right_iso',
    section: 'B',
    topic: 61,
    prompt: 'إذا كان (z_B - z_C) / (z_A - z_C) = i، فما طبيعة المثلث ABC بدقة؟',
    hint: 'النقطة المتكررة في البسط والمقام هي C! المعيار |i| = 1 يعطي CB = CA، والعمدة π/2 تعطي (CA⃗, CB⃗) ≡ π/2.',
    options: [
      'قائم الزاوية ومتساوي الساقين في C',
      'قائم الزاوية ومتساوي الساقين في A',
      'متساوي الأضلاع مركزه C',
      'قائم الزاوية في B غير متساوي الساقين'
    ],
    correctIndex: 0,
    graphSpec: { type: 'right_iso_abc' }
  },
  {
    id: 't62_quad_eq',
    section: 'B',
    topic: 62,
    prompt: 'ما حلا المعادلة z² - 2√3·z + 4 = 0 في المجموعة ℂ؟',
    hint: 'احسب المميز Δ = (-2√3)² - 4(1)(4) = 12 - 16 = -4 = (2i)².',
    options: [
      'z₁ = √3 + i و z₂ = √3 - i',
      'z₁ = 1 + i√3 و z₂ = 1 - i√3',
      'z₁ = -√3 + i و z₂ = -√3 - i',
      'z₁ = 2√3 + 2i و z₂ = 2√3 - 2i'
    ],
    correctIndex: 0
  },
  {
    id: 't62_roots_unity',
    section: 'B',
    topic: 62,
    prompt: 'ليكن j = e^{i·2π/3} = -1/2 + i(√3/2) الجذر التكعيبي للوحدة. ما قيمة المجموع 1 + j + j²؟',
    hint: 'جذور الوحدة من الرتبة n تشكل مضلعاً منتظماً مركز ثقله الأصل O(0,0)، أو استعمل متتالية هندسية (1 - j³)/(1 - j) مع j³ = 1.',
    options: [
      '0',
      '1',
      '-1',
      'i√3'
    ],
    correctIndex: 0,
    graphSpec: { type: 'roots_unity' }
  },
  {
    id: 't63_translation',
    section: 'B',
    topic: 63,
    prompt: 'ما التمثيل العقدي للإزاحة T ذات المتجهة u⃗ التي لحقها b = -3 + 2i؟',
    hint: 'M\'(z\') صورة M(z) بالإزاحة T_u⃗ تكافئ MM\'⃗ = u⃗ أي z\' - z = b.',
    options: [
      'z\' = z - 3 + 2i',
      'z\' = (-3 + 2i)·z',
      'z\' = z + 3 - 2i',
      'z\' + 3 - 2i = 2(z + 3 - 2i)'
    ],
    correctIndex: 0
  },
  {
    id: 't63_homothety',
    section: 'B',
    topic: 63,
    prompt: 'نعتبر التحويل العقدي z\' = -3z + 4 + 8i. ما طبيعة هذا التحويل وما عناصره المميزة؟',
    hint: 'من الشكل z\' = az + b حيث a = -3 ∈ ℝ\\{0,1}: إنه تحاكي نسبته k = -3 ومركزه النقطة الصامدة ω = b/(1 - a) = (4+8i)/4.',
    options: [
      'تحاكي نسبته k = -3 ومركزه Ω(1 + 2i)',
      'تحاكي نسبته k = 3 ومركزه Ω(1 + 2i)',
      'دوران زاويته π ومركزه Ω(4 + 8i)',
      'إزاحة متجهتها u⃗(4 + 8i)'
    ],
    correctIndex: 0
  },
  {
    id: 't64_rotation_eq',
    section: 'B',
    topic: 64,
    prompt: 'ما التمثيل العقدي للدوران R الذي مركزه Ω(ω) وزاويته π/2 (ربع دورة مباشر)؟',
    hint: 'الصيغة العامة للدوران هي z\' - ω = e^{iθ}(z - ω)، وبما أن e^{iπ/2} = i نحصل على النتيجة مباشرة.',
    options: [
      'z\' - ω = i(z - ω)',
      'z\' - ω = -i(z - ω)',
      'z\' = i·z + ω',
      'z\' - ω = (1 + i)(z - ω)'
    ],
    correctIndex: 0,
    graphSpec: { type: 'rotation_center' }
  },
  {
    id: 't64_rotation_identify',
    section: 'B',
    topic: 64,
    prompt: 'نعتبر التحويل F المعرف بـ z\' = i·z + 1 - i. ما طبيعة التحويل F وعناصره المميزة؟',
    hint: 'لدينا a = i حيث |a| = 1 و a ≠ 1، إذن F دوران زاويته arg(i) ≡ π/2 [2π]، ومركزه يحقق ω = i·ω + 1 - i أي ω(1 - i) = 1 - i.',
    options: [
      'دوران مركزه Ω(1) وزاويته π/2',
      'دوران مركزه Ω(i) وزاويته -π/2',
      'تحاكي نسبته i ومركزه Ω(1 - i)',
      'دوران مركزه Ω(0) وزاويته π/2'
    ],
    correctIndex: 0
  }
];

window.pickSequenceChallenge = function(topicFilter = 'all', allowedTopics = null, recentIds = []) {
  let pool = window.SEQ_QUESTION_BANK;

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

  // Clone and shuffle options so PlayStation button answers vary every time
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
    topic: base.topic,
    prompt: base.prompt,
    hint: base.hint,
    options: indexed.map(o => o.text),
    correctIndex: indexed.findIndex(o => o.isCorrect),
    graphSpec: base.graphSpec || null
  };
};
