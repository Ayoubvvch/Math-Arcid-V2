/**
 * Integral Forge (محرقة التكامل والمعادلات): 2BAC PC Curriculum Engine
 * Covers 100% of Topics 79 through 90:
 *   Section A (79–84): Primitives, Initial-Condition Primitives, Chasles/Linearity/Mean Value,
 *                      Integration by Parts (ALPES), Algebraic/Trig Splits & Φ(x) = ∫_a^x f(t)dt
 *   Section B (85–90): Signed Integral vs Area, Unit Conversion (cm²), Area Between Two Curves,
 *                      Volume of Revolution around (Ox), 1st-Order ODEs (y'=ay, y'=ay+b),
 *                      and 2nd-Order Linear ODEs (Δ>0, Δ=0, Δ<0)
 */

window.FORGE_TOPICS = {
  79: 'الدوال الأصلية الاعتيادية والمركبة (u\'uⁿ, u\'/u, u\'/√u, u\'eᵘ)',
  80: 'تحديد الدالة الأصلية الوحيدة F(x₀)=y₀ وحساب ∫_a^b f(x)dx',
  81: 'خواص التكامل: علاقة شال، الخطانية، القيمة المتوسطة والتأطير',
  82: 'المكاملة بالأجزاء (ALPES): ∫ u\'v = [uv] - ∫ uv\'',
  83: 'تقنيات التفكيك الجبري والإخطاط المثلثي في حساب التكامل',
  84: 'الدالة المعرفة بالتكامل Φ(x) = ∫_a^x f(t)dt ومشتقتها Φ\'(x)=f(x)',
  85: 'حساب مساحة حيز محصور بين C_f و (Ox) وانتباه الإشارة والوحدة (cm²)',
  86: 'حساب المساحة بين منحنيين C_f و C_g والوضع النسبي',
  87: 'حساب حجم مجسم الدوران حول محور الأفاصيل V = π ∫_a^b (f(x))² dx',
  88: 'المعادلة التفاضلية المتجانسة y\' = ay والشرط البدئي',
  89: 'المعادلة التفاضلية y\' = ay + b والحل الخاص الثابت',
  90: 'المعادلات التفاضلية من الرتبة الثانية y\'\' + ay\' + by = 0 (Δ>0, =0, <0)'
};

window.FORGE_SECTORS = [
  { id: 1, name: 'مسبك الأصلية α — الدوال الأصلية وخواص التكامل (79–81)', topics: [79, 80, 81], color: '#f59e0b' },
  { id: 2, name: 'مطرقة الأجزاء β — المكاملة بالأجزاء والتفكيك و Φ(x) (82–84)', topics: [82, 83, 84], color: '#fb923c' },
  { id: 3, name: 'فرن المساحات γ — المساحات والحجوم الدورانية (85–87)', topics: [85, 86, 87], color: '#38bdf8' },
  { id: 4, name: 'قلب التفاضلية δ — المعادلات التفاضلية من الرتبة 1 و 2 (88–90)', topics: [88, 89, 90], color: '#ef4444' }
];

window.FORGE_QUESTION_BANK = [
  // ================= SECTION A: PRIMITIVES & INTEGRATION (TOPICS 79 - 84) =================
  {
    id: 't79_prim_sqrt_comp',
    section: 'A',
    sector: 1,
    topic: 79,
    prompt: 'ما هي الدوال الأصلية F للدالة f(x) = x·√(x² + 3) على المجموعة ℝ؟',
    hint: 'نضع u(x) = x² + 3 > 0، لدينا u\'(x) = 2x، إذن f(x) = (1/2)·u\'(x)·(u(x))^{1/2} وأصلية u\'·u^{1/2} هي (2/3)·u^{3/2}.',
    options: [
      'F(x) = (1/3)·(x² + 3)·√(x² + 3) + C',
      'F(x) = (2/3)·(x² + 3)·√(x² + 3) + C',
      'F(x) = (1/2)·√(x² + 3) + C',
      'F(x) = 2·(x² + 3)^{3/2} + C'
    ],
    correctIndex: 0
  },
  {
    id: 't79_prim_trig_exp',
    section: 'A',
    sector: 1,
    topic: 79,
    prompt: 'حدد الدوال الأصلية F للدالة g(x) = cos(2x)·e^{sin(2x)} على ℝ:',
    hint: 'نضع u(x) = sin(2x) ومنه u\'(x) = 2·cos(2x). إذن g(x) = (1/2)·u\'(x)·e^{u(x)}.',
    options: [
      'F(x) = (1/2)·e^{sin(2x)} + C',
      'F(x) = 2·e^{sin(2x)} + C',
      'F(x) = -(1/2)·e^{sin(2x)} + C',
      'F(x) = sin(2x)·e^{sin(2x)} + C'
    ],
    correctIndex: 0
  },
  {
    id: 't79_prim_inv_square',
    section: 'A',
    sector: 1,
    topic: 79,
    prompt: 'على المجال ]0, +∞[، ما هي الدوال الأصلية للدالة h(x) = (3x² + 1) / (x³ + x + 2)²؟',
    hint: 'لاحظ أن u(x) = x³ + x + 2 مشتقتها u\'(x) = 3x² + 1، فالدالة على الشكل u\'/u² وأصليتها -1/u + C.',
    options: [
      'H(x) = -1 / (x³ + x + 2) + C',
      'H(x) = ln(x³ + x + 2) + C',
      'H(x) = 1 / (x³ + x + 2) + C',
      'H(x) = -2 / (x³ + x + 2)³ + C'
    ],
    correctIndex: 0
  },
  {
    id: 't80_unique_prim_cond',
    section: 'A',
    sector: 1,
    topic: 80,
    prompt: 'لاحظ المبيان المرفق. حدد الدالة الأصلية الوحيدة F للدالة f(x) = (2x - 1)·e^{x² - x} على ℝ التي تحقق الشرط البدئي F(1) = 4:',
    hint: 'الدالة على الشكل u\'·eᵘ حيث u(x) = x² - x، ومنه F(x) = e^{x² - x} + C. بتعويض x = 1 نجد e⁰ + C = 4 أي C = 3.',
    options: [
      'F(x) = e^{x² - x} + 3',
      'F(x) = e^{x² - x} + 4',
      'F(x) = e^{x² - x} - 1',
      'F(x) = (x² - x)·e^{x² - x} + 4'
    ],
    correctIndex: 0,
    graphSpec: { type: 'primitive_shift' }
  },
  {
    id: 't80_def_integral_ln',
    section: 'A',
    sector: 1,
    topic: 80,
    prompt: 'احسب قيمة التكامل المحدود التالي:\nI = ∫₁ᵉ (1 + 1/x) dx',
    hint: 'دالة أصلية لـ 1 + 1/x على [1, e] هي F(x) = x + ln(x). احسب F(e) - F(1) مع ln(e) = 1 و ln(1) = 0.',
    options: [
      'I = e',
      'I = e + 1',
      'I = e - 1',
      'I = 1'
    ],
    correctIndex: 0
  },
  {
    id: 't81_chasles_linearity',
    section: 'A',
    sector: 1,
    topic: 81,
    prompt: 'لاحظ المبيان المرفق. إذا علمت أن ∫₀² f(x)dx = 5 و ∫₂⁵ f(x)dx = -2، فما قيمة التكامل J = ∫₀⁵ (2·f(x) - 1) dx؟',
    hint: 'استعمل علاقة شال: ∫₀⁵ f = ∫₀² f + ∫₂⁵ f = 5 - 2 = 3. ثم طبّق الخطانية: J = 2·∫₀⁵ f(x)dx - ∫₀⁵ 1 dx.',
    options: [
      'J = 1',
      'J = 6',
      'J = 5',
      'J = -1'
    ],
    correctIndex: 0,
    graphSpec: { type: 'chasles_split' }
  },
  {
    id: 't81_mean_value',
    section: 'A',
    sector: 1,
    topic: 81,
    prompt: 'ما هي القيمة المتوسطة μ للدالة f(x) = x² على المجال [0, 3]؟',
    hint: 'القيمة المتوسطة على [a, b] تُعرّف بـ μ = 1/(b - a) · ∫_a^b f(x)dx. هنا b - a = 3 و ∫₀³ x² dx = [x³/3]₀³ = 9.',
    options: [
      'μ = 3',
      'μ = 9',
      'μ = 9/2',
      'μ = 1'
    ],
    correctIndex: 0
  },
  {
    id: 't81_signed_vs_area',
    section: 'A',
    sector: 1,
    topic: 81,
    prompt: 'لاحظ المبيان المرفق للدالة f(x) = x - 1 على [0, 2]. قارن بين التكامل الجبري I = ∫₀² (x - 1)dx ومساحة الحيز A = ∫₀² |x - 1|dx:',
    hint: 'التكامل الجبري يحسب المساحة فوق (Ox) بالموجب وتحته بالسالب! بما أن المنحنى متماثل حول (1, 0) فإن I = 0 بينما المساحة الهندسية موجبة.',
    options: [
      'I = 0  بينما المساحة الهندسية A = 1 u.a',
      'I = 1  و  A = 1 u.a',
      'I = 0  و  A = 0 u.a',
      'I = -1  و  A = 1 u.a'
    ],
    correctIndex: 0,
    graphSpec: { type: 'riemann_integral_sign' }
  },
  {
    id: 't82_ipp_lnx',
    section: 'A',
    sector: 2,
    topic: 82,
    prompt: 'لاحظ المبيان المرفق. باستعمال المكاملة بالأجزاء، احسب قيمة التكامل:\nI = ∫₁ᵉ ln(x) dx',
    hint: 'وفق قاعدة ALPES نضع u(x) = ln(x) و v\'(x) = 1، ومنه u\'(x) = 1/x و v(x) = x. إذن I = [x·ln(x)]₁ᵉ - ∫₁ᵉ 1 dx.',
    options: [
      'I = 1',
      'I = e - 1',
      'I = e',
      'I = 0'
    ],
    correctIndex: 0,
    graphSpec: { type: 'ipp_area_ln' }
  },
  {
    id: 't82_ipp_xe2x',
    section: 'A',
    sector: 2,
    topic: 82,
    prompt: 'وطني نموذجي: باستعمال المكاملة بالأجزاء، احسب التكامل التالي:\nJ = ∫₀¹ x·e^{2x} dx',
    hint: 'نضع u(x) = x و v\'(x) = e^{2x}، ومنه u\'(x) = 1 و v(x) = (1/2)e^{2x}. ثم نحسب [uv]₀¹ - (1/2)∫₀¹ e^{2x}dx.',
    options: [
      'J = (e² + 1) / 4',
      'J = (e² - 1) / 4',
      'J = (e² + 1) / 2',
      'J = e² / 2'
    ],
    correctIndex: 0
  },
  {
    id: 't82_ipp_xlnx',
    section: 'A',
    sector: 2,
    topic: 82,
    prompt: 'باستعمال المكاملة بالأجزاء، احسب قيمة التكامل:\nK = ∫₁ᵉ x·ln(x) dx',
    hint: 'اختر u(x) = ln(x) (الأولى في ALPES) و v\'(x) = x، إذن v(x) = x²/2. تحصل على [ (x²/2)ln(x) ]₁ᵉ - ∫₁ᵉ (x/2) dx.',
    options: [
      'K = (e² + 1) / 4',
      'K = (e² - 1) / 4',
      'K = e² / 2',
      'K = (e² - 1) / 2'
    ],
    correctIndex: 0
  },
  {
    id: 't82_ipp_xsinx',
    section: 'A',
    sector: 2,
    topic: 82,
    prompt: 'ما قيمة التكامل المثلثي بالأجزاء: L = ∫₀^π x·sin(x) dx؟',
    hint: 'نضع u(x) = x و v\'(x) = sin(x) أي v(x) = -cos(x). فيصبح L = [-x·cos(x)]₀^π + ∫₀^π cos(x)dx.',
    options: [
      'L = π',
      'L = 2π',
      'L = -π',
      'L = 0'
    ],
    correctIndex: 0
  },
  {
    id: 't83_split_rational',
    section: 'A',
    sector: 2,
    topic: 83,
    prompt: 'بتفكيك الكسر الجبري، احسب قيمة التكامل:\nM = ∫₀¹ (x² / (x + 1)) dx',
    hint: 'اكتب x² = (x² - 1) + 1 = (x - 1)(x + 1) + 1، فيصبح الكسر x - 1 + 1/(x + 1) الذي يسهل مكاملته!',
    options: [
      'M = ln(2) - 1/2',
      'M = ln(2) + 1/2',
      'M = ln(2)',
      'M = 1/2 - ln(2)'
    ],
    correctIndex: 0
  },
  {
    id: 't83_trig_linearize',
    section: 'A',
    sector: 2,
    topic: 83,
    prompt: 'باستعمال صيغة الإخطاط المثلثي cos²(x) = (1 + cos(2x))/2، احسب:\nN = ∫₀^{π/2} cos²(x) dx',
    hint: 'أصلية (1 + cos(2x))/2 هي x/2 + sin(2x)/4. عوض بين 0 و π/2 وتذكر أن sin(π) = 0.',
    options: [
      'N = π / 4',
      'N = π / 2',
      'N = π / 8',
      'N = 1 / 2'
    ],
    correctIndex: 0
  },
  {
    id: 't83_exp_split_frac',
    section: 'A',
    sector: 2,
    topic: 83,
    prompt: 'فخ وطني شائع: احسب التكامل P = ∫₀^{ln 2} (1 / (eˣ + 1)) dx:',
    hint: 'لاحظ أن 1 / (eˣ + 1) = (eˣ + 1 - eˣ) / (eˣ + 1) = 1 - eˣ / (eˣ + 1) = 1 - u\'/u!',
    options: [
      'P = ln(4/3)',
      'P = ln(3/2)',
      'P = ln(2/3)',
      'P = ln(3)'
    ],
    correctIndex: 0
  },
  {
    id: 't84_phi_extremum',
    section: 'A',
    sector: 2,
    topic: 84,
    prompt: 'لاحظ المبيان المرفق. لتكن الدالة المعرفة بالتكامل Φ(x) = ∫₁ˣ ((t - 2)·e⁻ᵗ) dt على ℝ. ما مشتقة Φ\'(x) وما نوع القيمة عند x = 2؟',
    hint: 'بما أن الدالة t ↦ (t - 2)e⁻ᵗ متصلة على ℝ فإن Φ قابلة للاشتقاق و Φ\'(x) = (x - 2)e⁻ˣ؛ تنعدم في 2 وتتحول من سالبة إلى موجبة.',
    options: [
      'Φ\'(x) = (x - 2)·e⁻ˣ  وتقبل قيمة دنيا عند x = 2',
      'Φ\'(x) = (x - 2)·e⁻ˣ  وتقبل قيمة قصوى عند x = 2',
      'Φ\'(x) = (x - 1)·e⁻ˣ  ولا تقبل مطرافاً',
      'Φ\'(x) = 0  لأن المتغير t ينتهي بالتكامل'
    ],
    correctIndex: 0,
    graphSpec: { type: 'integral_phi_deriv' }
  },
  {
    id: 't84_phi_tangent_slope',
    section: 'A',
    sector: 2,
    topic: 84,
    prompt: 'نعتبر الدالة Φ(x) = ∫₀ˣ ln(1 + t²) dt. ما هو المعامل الموجه للمماس لمنحنى C_Φ في النقطة ذات الأفصول x₀ = 1؟',
    hint: 'المعامل الموجه للمماس عند x₀ = 1 هو Φ\'(1)، والدالة المشتقة هي Φ\'(x) = ln(1 + x²).',
    options: [
      'Φ\'(1) = ln(2)',
      'Φ\'(1) = 1/2',
      'Φ\'(1) = 1',
      'Φ\'(1) = 0'
    ],
    correctIndex: 0
  },

  // ================= SECTION B: AREAS, VOLUMES & ODES (TOPICS 85 - 90) =================
  {
    id: 't85_area_unit_cm2',
    section: 'B',
    sector: 3,
    topic: 85,
    prompt: 'فخ الوحدة في الوطني: في معلم متعامد ممنظم حيث ||i|| = ||j|| = 2 cm، احسب بالـ cm² مساحة الحيز المحصور بين C_f (حيث f(x) = eˣ - 1) و(Ox) و x = 0 و x = ln(2):',
    hint: 'على [0, ln 2] لدينا eˣ - 1 ≥ 0، وتكاملها يساوي 1 - ln(2) وحدة مساحة. لا تنسَ الضرب في u.a = ||i||·||j|| = 2 × 2 = 4 cm²!',
    options: [
      '4·(1 - ln(2)) cm²',
      '(1 - ln(2)) cm²',
      '2·(1 - ln(2)) cm²',
      '4·(1 + ln(2)) cm²'
    ],
    correctIndex: 0
  },
  {
    id: 't85_area_below_ox',
    section: 'B',
    sector: 3,
    topic: 85,
    prompt: 'لاحظ المبيان المرفق للدالة f(x) = x² - 4 على [-2, 2]. ما مساحة الحيز المحصور بين C_f ومحور الأفاصيل (Ox) على [-2, 2] بوحدة المساحة (u.a = 1)؟',
    hint: 'انتبه: على [-2, 2] المنحنى C_f يقع تحت (Ox) أي f(x) ≤ 0! إذن المساحة هي A = ∫₋₂² -(x² - 4) dx = ∫₋₂² (4 - x²) dx.',
    options: [
      'A = 32 / 3  u.a',
      'A = -32 / 3  u.a',
      'A = 16 / 3  u.a',
      'A = 8  u.a'
    ],
    correctIndex: 0,
    graphSpec: { type: 'area_below_ox' }
  },
  {
    id: 't86_area_between_asymptote',
    section: 'B',
    sector: 3,
    topic: 86,
    prompt: 'لاحظ المبيان المرفق. لتكن f(x) = x + e⁻ˣ و (D): y = x مقاربها المائل. ما مساحة الحيز المحصور بين C_f و (D) والمستقيمين x = 0 و x = ln(3) (مع u.a = 1)؟',
    hint: 'بما أن f(x) - x = e⁻ˣ > 0 فإن C_f فوق (D). إذن A = ∫₀^{ln 3} e⁻ˣ dx = [-e⁻ˣ]₀^{ln 3}.',
    options: [
      'A = 2 / 3  u.a',
      'A = 1 / 3  u.a',
      'A = 4 / 3  u.a',
      'A = ln(3)  u.a'
    ],
    correctIndex: 0,
    graphSpec: { type: 'area_between_curves' }
  },
  {
    id: 't86_area_x_x2',
    section: 'B',
    sector: 3,
    topic: 86,
    prompt: 'احسب مساحة الحيز المحصور بين المنحنيين y = x و y = x² على المجال [0, 1] بوحدة المساحة u.a = 1:',
    hint: 'لكل x ∈ [0, 1] لدينا x ≥ x² (أي المستقيم يعلو القطع المكافئ)، ومنه A = ∫₀¹ (x - x²) dx.',
    options: [
      'A = 1 / 6  u.a',
      'A = 1 / 3  u.a',
      'A = 1 / 2  u.a',
      'A = 5 / 6  u.a'
    ],
    correctIndex: 0
  },
  {
    id: 't87_vol_exp_ox',
    section: 'B',
    sector: 3,
    topic: 87,
    prompt: 'لاحظ المبيان المرفق. ما حجم المجسم المولّد بدوران الجزء من منحنى f(x) = eˣ على [0, 1] دورة كاملة حول محور الأفاصيل (Ox)؟',
    hint: 'قانون حجم الدوران حول (Ox) هو V = π · ∫_a^b (f(x))² dx u.v. انتبه إلى أن (eˣ)² = e^{2x} وليس e^{x²}!',
    options: [
      'V = (π / 2)·(e² - 1)  u.v',
      'V = π·(e - 1)  u.v',
      'V = π·(e² - 1)  u.v',
      'V = (1 / 2)·(e² - 1)  u.v'
    ],
    correctIndex: 0,
    graphSpec: { type: 'volume_revolution_ox' }
  },
  {
    id: 't87_vol_sqrt_ln',
    section: 'B',
    sector: 3,
    topic: 87,
    prompt: 'وطني مركّب: احسب حجم المجسم المولّد بدوران منحنى g(x) = √(ln(x)) على المجال [1, e] حول المحور (Ox) (بوحدة الحجوم u.v):',
    hint: 'طبق V = π · ∫₁ᵉ (√(ln x))² dx = π · ∫₁ᵉ ln(x) dx، وتذكر أن ∫₁ᵉ ln(x) dx = 1!',
    options: [
      'V = π  u.v',
      'V = π·(e - 1)  u.v',
      'V = π / 2  u.v',
      'V = 2π  u.v'
    ],
    correctIndex: 0
  },
  {
    id: 't87_vol_cone',
    section: 'B',
    sector: 3,
    topic: 87,
    prompt: 'بدوران القطعة y = (R/h)·x على [0, h] حول المحور (Ox) نحصل على مخروط دوراني. ما الحجم الناتج من صيغة التكامل V = π∫₀ʰ (f(x))² dx؟',
    hint: 'احسب π · (R² / h²) · ∫₀ʰ x² dx = π · (R² / h²) · (h³ / 3).',
    options: [
      'V = (1/3)·π·R²·h',
      'V = π·R²·h',
      'V = (1/2)·π·R²·h',
      'V = (4/3)·π·R³'
    ],
    correctIndex: 0
  },
  {
    id: 't88_ode_homog',
    section: 'B',
    sector: 4,
    topic: 88,
    prompt: 'لاحظ المبيان المرفق. حل المعادلة التفاضلية 2y\' + 6y = 0 مع الشرط البدئي y(0) = 5:',
    hint: 'اكتب المعادلة على الشكل y\' = -3y. الحل العام هو y(x) = k·e^{-3x}، وبشرط y(0) = 5 نجد k = 5.',
    options: [
      'y(x) = 5·e^{-3x}',
      'y(x) = 5·e^{3x}',
      'y(x) = 5·e^{-6x}',
      'y(x) = 5·e^{-x/3}'
    ],
    correctIndex: 0,
    graphSpec: { type: 'ode_first_order' }
  },
  {
    id: 't89_ode_inhomog_init',
    section: 'B',
    sector: 4,
    topic: 89,
    prompt: 'حدد الحل الخاص للمعادلة التفاضلية y\' - 2y = 6 الذي يحقق الشرط البدئي y(0) = 1:',
    hint: 'نكتبها y\' = 2y + 6 (أي a = 2, b = 6). الحل العام هو y(x) = k·e^{2x} - b/a = k·e^{2x} - 3. عوض x = 0 لتجد k - 3 = 1.',
    options: [
      'y(x) = 4·e^{2x} - 3',
      'y(x) = 4·e^{2x} + 3',
      'y(x) = e^{2x} - 3',
      'y(x) = -2·e^{2x} + 3'
    ],
    correctIndex: 0
  },
  {
    id: 't89_ode_const_sol',
    section: 'B',
    sector: 4,
    topic: 89,
    prompt: 'ما هو الحل الثابت للمعادلة التفاضلية 3y\' + 12y = 8 في ℝ؟',
    hint: 'الحل الثابت y(x) = c يحقق y\'(x) = 0، أي 12c = 8.',
    options: [
      'y(x) = 2 / 3',
      'y(x) = -2 / 3',
      'y(x) = 8 / 3',
      'y(x) = 3 / 2'
    ],
    correctIndex: 0
  },
  {
    id: 't90_ode2_pos_disc',
    section: 'B',
    sector: 4,
    topic: 90,
    prompt: 'ما الحل العام في ℝ للمعادلة التفاضلية من الرتبة الثانية: y\'\' - 5y\' + 6y = 0؟',
    hint: 'المعادلة المميزة هي r² - 5r + 6 = 0، جذراها r₁ = 2 و r₂ = 3 (مميز Δ = 1 > 0).',
    options: [
      'y(x) = α·e^{2x} + β·e^{3x}   (α, β ∈ ℝ)',
      'y(x) = (αx + β)·e^{2x}   (α, β ∈ ℝ)',
      'y(x) = α·e^{-2x} + β·e^{-3x}   (α, β ∈ ℝ)',
      'y(x) = α·cos(2x) + β·sin(3x)'
    ],
    correctIndex: 0
  },
  {
    id: 't90_ode2_double_root',
    section: 'B',
    sector: 4,
    topic: 90,
    prompt: 'حل المعادلة التفاضلية y\'\' - 4y\' + 4y = 0 التي تحقق الشروط البدئية y(0) = 1 و y\'(0) = 5:',
    hint: 'المعادلة المميزة (r - 2)² = 0 تقبل جذراً مزدوجاً r = 2، إذن y(x) = (αx + β)e^{2x}. عوض y(0) = β = 1 ثم اشتق لحساب y\'(0) = α + 2β = 5.',
    options: [
      'y(x) = (3x + 1)·e^{2x}',
      'y(x) = (5x + 1)·e^{2x}',
      'y(x) = (x + 3)·e^{2x}',
      'y(x) = (3x + 1)·e^{-2x}'
    ],
    correctIndex: 0
  },
  {
    id: 't90_ode2_harmonic_osc',
    section: 'B',
    sector: 4,
    topic: 90,
    prompt: 'لاحظ المبيان المرفق. حل المعادلة التفاضلية التوافقية y\'\' + 4y = 0 بحيث y(0) = 2 و y\'(0) = -6:',
    hint: 'المعادلة المميزة r² + 4 = 0 جذراها r = ±2i. الحل العام y(x) = A·cos(2x) + B·sin(2x)، ومنه y(0) = A = 2 و y\'(0) = 2B = -6.',
    options: [
      'y(x) = 2·cos(2x) - 3·sin(2x)',
      'y(x) = 2·cos(2x) - 6·sin(2x)',
      'y(x) = 2·cos(4x) - 3·sin(4x)',
      'y(x) = 2·e^{2x} - 3·e^{-2x}'
    ],
    correctIndex: 0,
    graphSpec: { type: 'ode_second_harmonic' }
  },
  {
    id: 't81_seq_integral_bound',
    section: 'A',
    sector: 1,
    topic: 81,
    prompt: 'وطني نموذجي (التكامل والمتتاليات): لكل n ∈ ℕ نضع Iₙ = ∫₀¹ xⁿ·e⁻ˣ dx. استعمل التأطير لحساب نهاية lim (n → +∞) Iₙ:',
    hint: 'لكل x ∈ [0, 1] لدينا 0 < e⁻ˣ ≤ 1، ومنه 0 ≤ xⁿ·e⁻ˣ ≤ xⁿ. بمكاملة التأطير على [0, 1] نجد 0 ≤ Iₙ ≤ 1/(n + 1).',
    options: [
      '0  لأن 0 ≤ Iₙ ≤ 1 / (n + 1)',
      '1  لأن e⁰ = 1',
      '1 / e',
      '+∞'
    ],
    correctIndex: 0
  },
  {
    id: 't82_ipp_param_alpha',
    section: 'A',
    sector: 2,
    topic: 82,
    prompt: 'لاحظ المبيان المرفق. ليكن α > 0، باستعمال المكاملة بالأجزاء احسب I(α) = ∫₀^α x·e⁻ˣ dx ثم حدد نهايته عندما يؤول α إلى +∞:',
    hint: 'نضع u(x) = x و v\'(x) = e⁻ˣ (أي v = -e⁻ˣ)، فنحصل على [-x·e⁻ˣ]₀^α + ∫₀^α e⁻ˣ dx = 1 - (α + 1)e⁻^α، ومع النمو المقارن α·e⁻^α → 0.',
    options: [
      'I(α) = 1 - (α + 1)·e⁻^α   و   lim (α → +∞) I(α) = 1',
      'I(α) = (α - 1)·e⁻^α + 1   و   lim = +∞',
      'I(α) = 1 - α·e⁻^α   و   lim = 0',
      'I(α) = (α + 1)·e⁻^α - 1   و   lim = -1'
    ],
    correctIndex: 0,
    graphSpec: { type: 'ipp_x_exp_area' }
  },
  {
    id: 't83_param_ln_limit_a',
    section: 'A',
    sector: 2,
    topic: 83,
    prompt: 'مناقشة بوسيط: حدد قيمة العدد الحقيقي a > 1 التي تحقق المعادلة التكاملية التالية:\n∫₁ᵃ (ln(x) / x) dx = 1 / 2',
    hint: 'لاحظ أن ln(x)/x = (1/x)·ln(x) = u\'(x)·u(x) حيث u(x) = ln(x)، إذن الدالة الأصلية هي (1/2)·(ln x)².',
    options: [
      'a = e',
      'a = e²',
      'a = √e',
      'a = 2'
    ],
    correctIndex: 0
  },
  {
    id: 't87_vol_cone_param',
    section: 'B',
    sector: 3,
    topic: 87,
    prompt: 'لاحظ المبيان المرفق. احسب حجم المخروط المولّد بدوران القطعة المستقيمية y = 2x على المجال [0, 2] حول محور الأفاصيل (Ox) بوحدة الحجوم u.v:',
    hint: 'طبق الصيغة V = π · ∫₀² (2x)² dx = π · ∫₀² 4x² dx = π · [ (4/3)·x³ ]₀².',
    options: [
      'V = (32π / 3) u.v',
      'V = (16π / 3) u.v',
      'V = 8π u.v',
      'V = (32 / 3) u.v'
    ],
    correctIndex: 0,
    graphSpec: { type: 'volume_cone_disc' }
  },
  {
    id: 't87_vol_unit_cm3',
    section: 'B',
    sector: 3,
    topic: 87,
    prompt: 'فخ وحدة الحجوم بالوطني: في معلم متعامد ممنظم بحيث ||i|| = 2 cm، إذا كان حجم مجسم الدوران هو V = (3π / 2) u.v، فما قيمته بالـ cm³؟',
    hint: 'وحدة الحجوم هي u.v = ||i||³ = 2³ = 8 cm³! اضرب الحجم بوحدة u.v في 8.',
    options: [
      'V = 12π cm³',
      'V = 3π cm³',
      'V = 6π cm³',
      'V = (3π / 2) cm³'
    ],
    correctIndex: 0
  },
  {
    id: 't89_ode_rc_relax',
    section: 'B',
    sector: 4,
    topic: 89,
    prompt: 'تطبيق فيزيائي-رياضي (ثنائي القطب RC): حل المعادلة التفاضلية y\' + (1/τ)·y = E/τ (حيث τ > 0) مع الشرط البدئي y(0) = 0:',
    hint: 'اكتب y\' = -(1/τ)·y + E/τ. الحل الخاص الثابت هو E، والحل العام y(x) = k·e^{-x/τ} + E؛ عوض y(0) = 0 لتجد k = -E.',
    options: [
      'y(x) = E·(1 - e^{-x/τ})',
      'y(x) = E·e^{-x/τ}',
      'y(x) = E·(1 + e^{-x/τ})',
      'y(x) = (E / τ)·(1 - e^{-x/τ})'
    ],
    correctIndex: 0
  },
  {
    id: 't90_ode2_param_m',
    section: 'B',
    sector: 4,
    topic: 90,
    prompt: 'لاحظ المبيان المرفق. لتكن المعادلة التفاضلية ذات الوسيط m ∈ ℝ: y\'\' - 4y\' + m·y = 0. ما قيمة الوسيط m التي تقبل عندها المعادلة حلولاً من الشكل (Ax + B)·e^{2x}؟',
    hint: 'تظهر الصيغة (Ax + B)·e^{rx} عندما يكون للمعادلة المميزة r² - 4r + m = 0 جذر مزدوج (أي المميز Δ = 16 - 4m = 0).',
    options: [
      'm = 4  (مميز منعدم Δ = 0 وجذر مزدوج r₀ = 2)',
      'm = 2',
      'm = 0',
      'm = 8  (Δ < 0)'
    ],
    correctIndex: 0,
    graphSpec: { type: 'ode_damped_pos_disc' }
  }
];

// Compatibility alias for Ironclad Quality Gate & Hub
window.QUESTION_BANK = window.FORGE_QUESTION_BANK;

window.pickForgeChallenge = function(topicFilter = 'all', allowedTopics = null, recentIds = []) {
  let pool = window.FORGE_QUESTION_BANK;

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
