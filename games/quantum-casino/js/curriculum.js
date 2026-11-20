/**
 * Quantum Casino (كازينو الاحتمالات الكمومي): 2BAC PC Combinatorics & Probability Engine
 * Covers 100% of Topics 103 through 114:
 *   Section A (103–108): Fundamental Counting Principle, n!, Sampling Modes (Cₙᵖ, Aₙᵖ, nᵖ),
 *                        Order Coefficient, Equiprobability, Complement/Union, Conditional Prob P_A(B)
 *   Section B (109–114): Weighted Trees & Bayes, Law of Total Probability & Urn Transfer,
 *                        Independence, Discrete Random Variables X, E(X)/V(X)/σ(X), Binomial B(n,p)
 */

window.CASINO_TOPICS = {
  103: 'مبدأ الجداء في التعداد، التباديل n! وتشكيل الأعداد والرموز',
  104: 'أنواع السحب الثلاثة: التزامني Cₙᵖ، بدون إحلال Aₙᵖ، وبإحلال nᵖ',
  105: 'معامل الترتيب p! / (p₁!·p₂!...) في السحب التتابعي للأصناف',
  106: 'فرضية تساوي الاحتمال P(A) = Card(A)/Card(Ω) وسحب الكرات المرقمة',
  107: 'الحدث المضاد P(Ā)=1-P(A)، حدث «على الأقل واحد» واتحاد حدثين A∪B',
  108: 'الاحتمال الشرطي P_A(B) = P(A∩B)/P(A) وصيغة الاحتمالات المركبة',
  109: 'شجرة الاحتمالات الموزونة والاحتمال الشرطي العكسي (بايز)',
  110: 'صيغة الاحتمالات الكلية ونقل كرة بين صندوقين متتاليين U₁ → U₂',
  111: 'استقلالية حدثين: التحقق P(A∩B) = P(A)·P(B) والتجارب المستقلة',
  112: 'المتغير العشوائي المتقطع X(Ω) وقانون احتماله والشرط ∑pᵢ = 1',
  113: 'الأمل الرياضي E(X)، المغايرة V(X)، الانحراف σ(X) والخطية aX+b',
  114: 'اختبارات برنولي والقانون الحداني B(n, p): الصيغة، E(X)=np و V(X)=npq'
};

window.CASINO_SECTORS = [
  { id: 1, name: 'الجناح α — التعداد وأنواع السحب ومعامل الترتيب (103–105)', topics: [103, 104, 105], color: '#10b981' },
  { id: 2, name: 'الجناح β — تساوي الاحتمال، الاتحاد والاحتمال الشرطي (106–108)', topics: [106, 107, 108], color: '#22d3ee' },
  { id: 3, name: 'الجناح γ — شجرة الاحتمالات الكلية والاستقلالية (109–111)', topics: [109, 110, 111], color: '#fbbf24' },
  { id: 4, name: 'الجناح δ — المتغير العشوائي، المغايرة وقانون برنولي (112–114)', topics: [112, 113, 114], color: '#a855f7' }
];

window.CASINO_QUESTION_BANK = [
  // ================= SECTION A: COUNTING, SAMPLING & CONDITIONAL PROBABILITY (TOPICS 103 - 108) =================
  {
    id: 't103_even_3digit_code',
    section: 'A',
    sector: 1,
    topic: 103,
    prompt: 'نريد تكوين عدد زوجي مكون من 3 أرقام مختلفة مثنى مثنى باستعمال أرقام المجموعة E = {1, 2, 3, 4, 5}. ما عدد الأعداد الممكن تكوينها؟',
    hint: 'نبدأ بالخانة المقيدة (الآحاد): ليكون العدد زوجياً يجب اختيار الآحاد من {2, 4} أي خياران. ثم نختار المئات (4 أرقام متبقية) ثم العشرات (3 أرقام متبقية).',
    options: [
      '2 × 4 × 3 = 24 عدداً',
      '2 × 5 × 5 = 50 عدداً',
      '5 × 4 × 3 = 60 عدداً',
      '3 × 4 × 3 = 36 عدداً'
    ],
    correctIndex: 0
  },
  {
    id: 't103_odd_3digit_with_zero',
    section: 'A',
    sector: 1,
    topic: 103,
    prompt: 'كم عدداً فردياً مكوناً من 3 أرقام مختلفة مثنى مثنى يمكن تشكيله من الأرقام {0, 1, 2, 3, 4, 5} (مع العلم أن رقم المئات غير منعدم)؟',
    hint: 'رقم الآحاد فردي من {1, 3, 5} (3 اختيارات). رقم المئات ≠ 0 ولا يساوي الآحاد (4 اختيارات). رقم العشرات من الأربعة الباقين (4 اختيارات).',
    options: [
      '3 × 4 × 4 = 48 عدداً',
      '3 × 5 × 4 = 60 عدداً',
      '3 × 4 × 3 = 36 عدداً',
      '6 × 5 × 3 = 90 عدداً'
    ],
    correctIndex: 0
  },
  {
    id: 't103_books_shelf_perm',
    section: 'A',
    sector: 1,
    topic: 103,
    prompt: 'نرتب على رفّ 4 كتب رياضيات متمايزة و3 كتب فيزياء متمايزة بحيث تبقى كتب كل مادة متجاورة في كتلة واحدة. ما عدد الترتيبات الممكنة؟',
    hint: 'نرتب الكتلتين (رياضيات/فيزياء أو العكس) بـ 2! طريقة، ثم نبدل كتب الرياضيات داخلياً بـ 4! وكتب الفيزياء بـ 3!.',
    options: [
      '2! × 4! × 3! = 288',
      '4! × 3! = 144',
      '7! = 5040',
      '2 × (4! + 3!) = 60'
    ],
    correctIndex: 0
  },
  {
    id: 't104_urn_simultaneous',
    section: 'A',
    sector: 1,
    topic: 104,
    prompt: 'لاحظ الجدول والوعاء المرفقين. يحتوي صندوق على 4 كرات حمراء و3 خضراء و2 زرقاء. نسحب في آن واحد 3 كرات. ما عدد السحبات التي تضم كرة واحدة من كل لون؟',
    hint: 'السحب في آن واحد (تزامني) يوظف التوليفات Cₙᵖ. نسحب 1 من 4 حمراء و1 من 3 خضراء و1 من 2 زرقاء: C₄¹ × C₃¹ × C₂¹.',
    options: [
      '24 سحبة',
      'C₉³ = 84 سحبة',
      '144 سحبة',
      '9 سحبات'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'sampling_modes_table',
      label: 'Modes: Simultané (Cₙᵖ) vs Successif (Aₙᵖ / nᵖ)'
    }
  },
  {
    id: 't104_urn_successive_no_rep',
    section: 'A',
    sector: 1,
    topic: 104,
    prompt: 'يحتوي صندوق على 5 كرات حمراء و4 كرات خضراء (9 كرات). نسحب بالتتابع وبدون إحلال 3 كرات. ما عدد السحبات الكلي Card(Ω) وعدد سحبات «3 كرات من نفس اللون»؟',
    hint: 'السحب بالتتابع وبدون إحلال يستعمل الترتيبات Aₙᵖ: المجموع A₉³ = 9×8×7 = 504، ونفس اللون يعني (3 حمراء أو 3 خضراء): A₅³ + A₄³.',
    options: [
      'Card(Ω) = 504   و   نفس اللون = 84',
      'Card(Ω) = 84   و   نفس اللون = 14',
      'Card(Ω) = 729   و   نفس اللون = 189',
      'Card(Ω) = 504   و   نفس اللون = 60'
    ],
    correctIndex: 0
  },
  {
    id: 't104_urn_with_replacement',
    section: 'A',
    sector: 1,
    topic: 104,
    prompt: 'يضم كيس 5 كرات بيضاء و3 كرات سوداء (8 كرات). نسحب بالتتابع وبإحلال كرتين. ما احتمال الحصول على كرتين مختلفتي اللون؟',
    hint: 'السحب بالتتابع وبإحلال يعني Card(Ω) = 8² = 64. مختلفتا اللون يعني (بيضاء ثم سوداء) أو (سوداء ثم بيضاء)، أي 2 × (5 × 3).',
    options: [
      '15 / 32',
      '15 / 64',
      '15 / 28',
      '17 / 32'
    ],
    correctIndex: 0
  },
  {
    id: 't105_order_coeff_basic',
    section: 'A',
    sector: 1,
    topic: 105,
    prompt: 'لاحظ مخطط الخانات المرتبة. كيس به 4 كرات حمراء و5 كرات سوداء. نسحب بالتتابع وبدون إحلال 3 كرات. ما عدد السحبات التي تحوي كرتين حمراوين وكرة سوداء؟',
    hint: 'نضرب في معامل الترتيب لمواضع الكرتين الحمراوين والسوداء: (3! / (2!·1!)) × A₄² × A₅¹ = 3 × (4×3) × 5.',
    options: [
      '3 × 12 × 5 = 180',
      '12 × 5 = 60',
      'C₄² × C₅¹ = 30',
      '6 × 12 × 5 = 360'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'order_coeff_slots',
      label: 'Coeff. d\'ordre: 3!/(2!1!) × A₄² × A₅¹ = 180'
    }
  },
  {
    id: 't105_order_three_colors',
    section: 'A',
    sector: 1,
    topic: 105,
    prompt: 'يحتوي صندوق على 3 كرات بيضاء و2 حمراء و2 خضراء. نسحب بالتتابع وبدون إحلال 3 كرات. ما عدد السحبات للحصول على 3 كرات مختلفة الألوان مثنى مثنى؟',
    hint: 'الكرات الثلاث من 3 أصناف مختلفة (1 لكل لون)، إذن معامل الترتيب هو 3! / (1!1!1!) = 6، ونضربه في A₃¹ × A₂¹ × A₂¹.',
    options: [
      '3! × 3 × 2 × 2 = 72',
      '3 × 2 × 2 = 12',
      '3 × 3 × 2 × 2 = 36',
      'A₇³ = 210'
    ],
    correctIndex: 0
  },
  {
    id: 't105_order_odd_sum_prob',
    section: 'A',
    sector: 1,
    topic: 105,
    prompt: 'يضم صندوق 3 كرات تحمل الرقم 1 وكرتين تحملان الرقم 2. نسحب بالتتابع وبدون إحلال كرتين. ما احتمال أن يكون مجموع الرقمين المسحوبين فردياً؟',
    hint: 'يكون المجموع فردياً إذا سُحبت كرة برقم 1 وأخرى برقم 2 (الترتيبان (1,2) أو (2,1)). Card(Ω) = A₅² = 20، والبسط = 2! × 3 × 2 = 12.',
    options: [
      '3 / 5',
      '3 / 10',
      '2 / 5',
      '12 / 25'
    ],
    correctIndex: 0
  },
  {
    id: 't106_product_even',
    section: 'A',
    sector: 2,
    topic: 106,
    prompt: 'لاحظ الوعاء المرقّم. يحتوي كيس على 6 كرات مرقمة بـ {1, 2, 2, 3, 4, 5}. نسحب في آن واحد كرتين. ما احتمال أن يكون جداء الرقمين المسحوبين زوجياً؟',
    hint: 'يكون الجداء فردياً فقط إذا كان العددان معاً فرديين (من {1, 3, 5}). نستعمل الحدث المضاد: 1 - C₃² / C₆² = 1 - 3/15.',
    options: [
      '4 / 5',
      '1 / 5',
      '3 / 5',
      '2 / 3'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'urn_balls_draw',
      label: 'Urne: {1, 3, 5} impaires | {2, 2, 4} paires'
    }
  },
  {
    id: 't106_sum_even_3balls',
    section: 'A',
    sector: 2,
    topic: 106,
    prompt: 'يحتوي صندوق على 5 كرات مرقمة بـ {1, 1, 2, 2, 3}. نسحب في آن واحد 3 كرات. ما احتمال أن يكون مجموع الأرقام الثلاثة عدداً زوجياً؟',
    hint: 'لدينا 3 كرات فردية و2 زوجيتان. ليكون مجموع 3 أعداد زوجياً يجب سحب (3 زوجية: مستحيل) أو (1 زوجية و2 فرديتان): C₂¹ × C₃² / C₅³.',
    options: [
      '3 / 5',
      '2 / 5',
      '3 / 10',
      '7 / 10'
    ],
    correctIndex: 0
  },
  {
    id: 't106_product_mult_3',
    section: 'A',
    sector: 2,
    topic: 106,
    prompt: 'يحتوي كيس على 6 كرات مرقمة من 1 إلى 6: {1, 2, 3, 4, 5, 6}. نسحب تزامنياً كرتين. ما احتمال أن يكون جداء الرقمين مضاعفاً للعدد 3؟',
    hint: 'مضاعفات 3 في الوعاء هما {3, 6} (كرتان)، والباقي 4 كرات. الحدث المضاد «الجداء ليس مضاعفاً لـ 3» يعني سحب كرتين من الـ 4 المتبقية: 1 - C₄² / C₆².',
    options: [
      '3 / 5',
      '2 / 5',
      '1 / 3',
      '11 / 15'
    ],
    correctIndex: 0
  },
  {
    id: 't107_union_diff_prob',
    section: 'A',
    sector: 2,
    topic: 107,
    prompt: 'لاحظ مخطط فين المرفق. ليكن A و B حدثين بحيث P(A) = 0.4 و P(B) = 0.5 و P(A ∪ B) = 0.7. ما قيمة P(A ∩ B̄)؟',
    hint: 'أولاً نحسب التقاطع P(A∩B) = P(A) + P(B) - P(A∪B) = 0.2. وبما أن A = (A∩B) ∪ (A∩B̄) تجزيئان لـ A، فإن P(A∩B̄) = P(A) - P(A∩B).',
    options: [
      '0.2',
      '0.3',
      '0.1',
      '0.5'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'venn_complement_union',
      label: 'P(A ∪ B) = P(A) + P(B) - P(A ∩ B)'
    }
  },
  {
    id: 't107_at_least_one_red',
    section: 'A',
    sector: 2,
    topic: 107,
    prompt: 'يضم صندوق 4 كرات حمراء و5 بيضاء و3 سوداء (12 كرة). نسحب في آن واحد 3 كرات. ما احتمال الحصول على كرة حمراء واحدة على الأقل؟',
    hint: 'نستعمل الحدث المضاد «عدم سحب أي كرة حمراء» (أي سحب 3 كرات من 8 غير حمراء): 1 - C₈³ / C₁₂³ = 1 - 56 / 220.',
    options: [
      '41 / 55',
      '14 / 55',
      '3 / 11',
      '13 / 55'
    ],
    correctIndex: 0
  },
  {
    id: 't107_demorgan_both_bar',
    section: 'A',
    sector: 2,
    topic: 107,
    prompt: 'حدثان A و B يحققان P(Ā) = 0.35 و P(B̄) = 0.45 و P(A ∩ B) = 0.30. ما قيمة الاحتمال P(Ā ∩ B̄)؟',
    hint: 'حسب قانون دي مورغان: Ā ∩ B̄ هو مضاد الحدث (A ∪ B)، أي P(Ā ∩ B̄) = 1 - P(A ∪ B). احسب P(A)=0.65 و P(B)=0.55 أولاً.',
    options: [
      '0.10',
      '0.20',
      '0.90',
      '0.15'
    ],
    correctIndex: 0
  },
  {
    id: 't108_cond_subspace_basic',
    section: 'A',
    sector: 2,
    topic: 108,
    prompt: 'لاحظ تمثيل الفضاء الشرطي المقلّص. ليكن حدثان A و B بحيث P(A) = 0.6 و P(A ∩ B) = 0.24. احسب P_A(B) و P_A(B̄):',
    hint: 'الصيغة الأساسية: P_A(B) = P(A∩B) / P(A) = 0.24 / 0.6 = 0.4، و P_A(B̄) = 1 - P_A(B).',
    options: [
      'P_A(B) = 0.4   و   P_A(B̄) = 0.6',
      'P_A(B) = 0.144   و   P_A(B̄) = 0.856',
      'P_A(B) = 0.6   و   P_A(B̄) = 0.4',
      'P_A(B) = 0.24   و   P_A(B̄) = 0.76'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'conditional_subspace',
      label: 'P_A(B) = P(A ∩ B) / P(A)'
    }
  },
  {
    id: 't108_cond_two_dice',
    section: 'A',
    sector: 2,
    topic: 108,
    prompt: 'نرمي نردين متوازنين. ليكن A: «مجموع الوجهين يساوي 7» و B: «أحد الوجهين على الأقل يساوي 5». ما قيمة الاحتمال الشرطي P_A(B)؟',
    hint: 'المجموع 7 يتحقق في 6 نتائج متساوية الاحتمال: {(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)}. كم نتيجة منها تحوي الرقم 5؟ اثنتان فقط.',
    options: [
      '1 / 3',
      '1 / 6',
      '2 / 11',
      '11 / 36'
    ],
    correctIndex: 0
  },
  {
    id: 't108_cond_without_rep',
    section: 'A',
    sector: 2,
    topic: 108,
    prompt: 'كيس يحتوي على 4 كرات حمراء و6 كرات خضراء. نسحب بالتتابع وبدون إحلال كرتين. ما احتمال أن تكون الكرة الثانية حمراء علماً أن الكرة الأولى خضراء؟',
    hint: 'علماً أن الأولى خضراء، يتبقى في الكيس 9 كرات (4 حمراء و5 خضراء)، فتسحب الثانية من هذا التركيب الجديد.',
    options: [
      '4 / 9',
      '4 / 10',
      '24 / 90',
      '5 / 9'
    ],
    correctIndex: 0
  },

  // ================= SECTION B: TREES, INDEPENDENCE, RANDOM VARIABLES & BINOMIAL (TOPICS 109 - 114) =================
  {
    id: 't109_bayes_factory_tree',
    section: 'B',
    sector: 3,
    topic: 109,
    prompt: 'لاحظ شجرة الاحتمالات الموزونة. تنتج الآلة M₁ نسبة 60% من القطع بعطب 5%، وتنتج M₂ نسبة 40% بعطب 10%. وُجدت قطعة معيبة (D). ما قيمة P_D(M₁)؟',
    hint: 'أولاً احسب الاحتمال الكلي للعطب: P(D) = 0.6×0.05 + 0.4×0.10 = 0.03 + 0.04 = 0.07. ثم P_D(M₁) = P(M₁∩D) / P(D).',
    options: [
      '3 / 7',
      '4 / 7',
      '3 / 100',
      '3 / 5'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'weighted_prob_tree',
      label: 'P_D(M₁) = P(M₁ ∩ D) / P(D)'
    }
  },
  {
    id: 't109_medical_test_total',
    section: 'B',
    sector: 3,
    topic: 109,
    prompt: 'يصيب مرض ما 2% من السكان (M). يعطي الفحص نتيجة موجبة (T) بنسبة 95% عند المصابين، وبنسبة 5% عند الأصحاء (M̄). ما قيمة P(M ∩ T) و P(T)؟',
    hint: 'P(M∩T) = P(M)·P_M(T) = 0.02×0.95 = 0.019، ثم P(T) = P(M∩T) + P(M̄∩T) = 0.019 + 0.98×0.05.',
    options: [
      'P(M∩T) = 0.019   و   P(T) = 0.068',
      'P(M∩T) = 0.019   و   P(T) = 0.049',
      'P(M∩T) = 0.19   و   P(T) = 0.24',
      'P(M∩T) = 0.001   و   P(T) = 0.05'
    ],
    correctIndex: 0
  },
  {
    id: 't110_two_urns_transfer',
    section: 'B',
    sector: 3,
    topic: 110,
    prompt: 'لاحظ مخطط نقل الكرة U₁ → U₂. صندوق U₁ به 3 بيضاء و2 سوداء، وصندوق U₂ به 2 بيضاء و3 سوداء. ننقل كرة من U₁ إلى U₂ ثم نسحب كرة من U₂. ما احتمال أن تكون بيضاء (B₂)؟',
    hint: 'نفصل الحالتين حسب الكرة المنقولة من U₁: إذا كانت بيضاء (3/5) يصبح في U₂ ثلاث بيضاء من 6 (3/6)؛ وإذا كانت سوداء (2/5) يبقى في U₂ كرتان بيضاوان من 6 (2/6).',
    options: [
      '13 / 30',
      '2 / 5',
      '1 / 2',
      '9 / 30'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'two_urns_transfer',
      label: 'U₁ (3B,2N) ──▶ U₂ (2B,3N +1)'
    }
  },
  {
    id: 't110_dice_select_urn',
    section: 'B',
    sector: 3,
    topic: 110,
    prompt: 'نرمي نرداً متوازناً: إذا ظهر مضاعف لـ 3 نسحب من U₁ (4 حمراء و2 بيضاء)، وإلا نسحب من U₂ (1 حمراء و3 بيضاء). ما احتمال سحب كرة حمراء (R)؟',
    hint: 'احتمال مضاعف لـ 3 هو 2/6 = 1/3 واحتمال غير ذلك هو 2/3. إذن P(R) = (1/3)(4/6) + (2/3)(1/4) = 2/9 + 1/6.',
    options: [
      '7 / 18',
      '5 / 10',
      '2 / 9',
      '11 / 18'
    ],
    correctIndex: 0
  },
  {
    id: 't110_total_prob_branch_solve',
    section: 'B',
    sector: 3,
    topic: 110,
    prompt: 'ليكن {A, Ā} تجزيئاً للكون بحيث P(A) = 0.3 و P_A(B) = 0.8 و P(B) = 0.45. ما قيمة الاحتمال الشرطي P_Ā(B)؟',
    hint: 'من صيغة الاحتمالات الكلية: P(B) = P(A)·P_A(B) + P(Ā)·P_Ā(B) ⟺ 0.45 = 0.3×0.8 + 0.7·P_Ā(B).',
    options: [
      '0.3',
      '0.21',
      '0.7',
      '0.35'
    ],
    correctIndex: 0
  },
  {
    id: 't111_indep_die_events',
    section: 'B',
    sector: 3,
    topic: 111,
    prompt: 'لاحظ شبكة التحقق المرفقة. نرمي نرداً متوازناً: الحدث A «الرقم زوجي» و B «الرقم مضاعف لـ 3». ما هي قيم P(A) و P(B) و P(A∩B) وهل الحدثان مستقلان؟',
    hint: 'A = {2, 4, 6} إذن P(A)=1/2؛ B = {3, 6} إذن P(B)=1/3؛ A∩B = {6} إذن P(A∩B)=1/6. نقارن P(A∩B) مع P(A)×P(B).',
    options: [
      'P(A∩B) = 1/6 = P(A)·P(B) ⇐ مستقلان',
      'P(A∩B) = 1/6 ≠ P(A)·P(B) ⇐ غير مستقلين',
      'P(A∩B) = 0 ⇐ غير منسجمين ومستقلان',
      'P(A∩B) = 1/3 = P(B) ⇐ مستقلان'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'independence_matrix',
      label: 'Indépendance ⇔ P(A ∩ B) = P(A) · P(B)'
    }
  },
  {
    id: 't111_indep_two_shooters',
    section: 'B',
    sector: 3,
    topic: 111,
    prompt: 'يرمي راميان مستقلان سهماً نحو هدف؛ احتمال إصابة الأول 0.7 واحتمال إصابة الثاني 0.8. ما احتمال أن يُصاب الهدف من طرف واحد منهما على الأقل؟',
    hint: 'الحدث المضاد «لا يصيب أي منهما الهدف»: وبسبب الاستقلالية P(Ā∩B̄) = (1 - 0.7)(1 - 0.8) = 0.06، ثم نطرح من 1.',
    options: [
      '0.94',
      '0.56',
      '0.06',
      '0.88'
    ],
    correctIndex: 0
  },
  {
    id: 't111_indep_find_pb',
    section: 'B',
    sector: 3,
    topic: 111,
    prompt: 'ليكن A و B حدثين مستقلين بحيث P(A) = 0.4 و P(A ∪ B) = 0.76. ما قيمة الاحتمال P(B)؟',
    hint: 'بما أنهما مستقلان فإن P(A∩B) = 0.4·P(B). نعوض في P(A∪B) = P(A) + P(B) - P(A∩B) ⟺ 0.76 = 0.4 + 0.6·P(B).',
    options: [
      '0.6',
      '0.36',
      '0.5',
      '0.4'
    ],
    correctIndex: 0
  },
  {
    id: 't112_pmf_constant_a',
    section: 'B',
    sector: 4,
    topic: 112,
    prompt: 'لاحظ المدرج التكراري المرفق. متغير عشوائي X يأخذ القيم {0, 1, 2, 3} وفق P(X=0)=0.1, P(X=1)=2a, P(X=2)=0.3, P(X=3)=a. حدد قيمة a و P(X ≥ 2):',
    hint: 'مجموع الاحتمالات يساوي 1: 0.1 + 2a + 0.3 + a = 1 ⟺ 3a = 0.6 ⟺ a = 0.2. ثم P(X ≥ 2) = P(X=2) + P(X=3).',
    options: [
      'a = 0.2   و   P(X ≥ 2) = 0.5',
      'a = 0.3   و   P(X ≥ 2) = 0.6',
      'a = 0.2   و   P(X ≥ 2) = 0.3',
      'a = 0.15   و   P(X ≥ 2) = 0.45'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'random_var_pmf',
      label: 'Loi de X: ∑ P(X = xᵢ) = 1'
    }
  },
  {
    id: 't112_urn_random_var_red',
    section: 'B',
    sector: 4,
    topic: 112,
    prompt: 'يحتوي كيس على 3 كرات حمراء وكرتين خضراوين. نسحب في آن واحد كرتين، وليكن X عدد الكرات الحمراء المسحوبة. ما قانون احتمال X؟',
    hint: 'Card(Ω) = C₅² = 10 و X(Ω) = {0, 1, 2}: P(X=0)=C₂²/10=1/10، P(X=1)=C₃¹C₂¹/10=6/10، P(X=2)=C₃²/10=3/10.',
    options: [
      'P(0)=1/10 , P(1)=3/5 , P(2)=3/10',
      'P(0)=1/10 , P(1)=3/10 , P(2)=3/5',
      'P(0)=2/5 , P(1)=3/5 , P(2)=0',
      'P(0)=1/5 , P(1)=2/5 , P(2)=2/5'
    ],
    correctIndex: 0
  },
  {
    id: 't113_expectation_variance',
    section: 'B',
    sector: 4,
    topic: 113,
    prompt: 'لاحظ محور التشتت المرفق. متغير عشوائي X قانونه: P(X=0)=1/4, P(X=1)=1/2, P(X=2)=1/4. احسب الأمل E(X) والمغايرة V(X) والانحراف الطرازي σ(X):',
    hint: 'E(X) = 0(1/4) + 1(1/2) + 2(1/4) = 1، و E(X²) = 0 + 1/2 + 4(1/4) = 3/2، ومنه صيغة كونيغ V(X) = E(X²) - (E(X))².',
    options: [
      'E(X)=1 , V(X)=1/2 , σ(X)=√2/2',
      'E(X)=1 , V(X)=3/2 , σ(X)=√6/2',
      'E(X)=3/2 , V(X)=1/2 , σ(X)=√2/2',
      'E(X)=1 , V(X)=1/4 , σ(X)=1/2'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'variance_spread_axis',
      label: 'V(X) = E(X²) - (E(X))²  |  σ(X) = √V(X)'
    }
  },
  {
    id: 't113_affine_e_v',
    section: 'B',
    sector: 4,
    topic: 113,
    prompt: 'ليكن X متغيراً عشوائياً بحيث E(X) = 3 و σ(X) = 2. نعرف المتغير Y = -2X + 5. ما قيمة الأمل E(Y) والمغايرة V(Y)؟',
    hint: 'انتبه: خطية الأمل تعطي E(aX+b) = aE(X)+b، بينما المغايرة تُربع المعامل وتُلغي الثابت: V(aX+b) = a²·V(X) مع V(X) = σ(X)² = 4.',
    options: [
      'E(Y) = -1   و   V(Y) = 16',
      'E(Y) = -1   و   V(Y) = 8',
      'E(Y) = -1   و   V(Y) = -8',
      'E(Y) = 11   و   V(Y) = 21'
    ],
    correctIndex: 0
  },
  {
    id: 't114_binomial_exact_p',
    section: 'B',
    sector: 4,
    topic: 114,
    prompt: 'لاحظ أعمدة القانون الحداني B(4, 1/3). نكرر تجربة مستقلة 4 مرات باحتمال نجاح p = 1/3. ليكن X عدد النجاحات. احسب P(X = 2) و E(X):',
    hint: 'X ~ B(4, 1/3): إذن P(X = 2) = C₄² × (1/3)² × (2/3)² = 6 × (1/9) × (4/9) = 24/81، والأمل الرياضي هو E(X) = n·p.',
    options: [
      'P(X=2) = 8 / 27   و   E(X) = 4 / 3',
      'P(X=2) = 4 / 81   و   E(X) = 4 / 3',
      'P(X=2) = 16 / 81   و   E(X) = 8 / 9',
      'P(X=2) = 8 / 27   و   E(X) = 8 / 9'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'binomial_dist_bars',
      label: 'X ~ B(4, 1/3): P(X=k) = C₄ᵏ pᵏ (1-p)⁴⁻ᵏ'
    }
  },
  {
    id: 't114_binomial_recover_np',
    section: 'B',
    sector: 4,
    topic: 114,
    prompt: 'متغير عشوائي X يتبع قانوناً حدانياً B(n, p) بأمل رياضي E(X) = 3 ومغايرة V(X) = 2.1. حدد الوسيطين p و n:',
    hint: 'نعلم أن E(X) = np = 3 و V(X) = np(1 - p) = 2.1. بقسمة المغايرة على الأمل نجد 1 - p = 2.1 / 3 = 0.7، ومنه p ثم n.',
    options: [
      'p = 0.3   و   n = 10',
      'p = 0.7   و   n = 10',
      'p = 0.3   و   n = 30',
      'p = 0.21   و   n = 15'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'binomial_np_solver',
      label: 'V(X)/E(X) = 1 - p = 0.7 ⇒ p = 0.3, n = 10'
    }
  },
  // ================= OMEGA EXPANSION: NATIONAL EXAM TRAPS & PARAMETER PROBLEMS =================
  {
    id: 't104_simultaneous_at_most',
    section: 'A',
    sector: 1,
    topic: 104,
    prompt: 'يحتوي صندوق على 4 كرات حمراء و5 كرات بيضاء (9 كرات). نسحب في آن واحد 3 كرات. ما احتمال الحصول على كرة حمراء واحدة على الأكثر؟',
    hint: '«كرة حمراء واحدة على الأكثر» تعني (0 حمراء و3 بيضاء) أو (1 حمراء و2 بيضاء): (C₅³ + C₄¹·C₅²) / C₉³ = (10 + 40) / 84.',
    options: [
      '25 / 42',
      '10 / 21',
      '5 / 42',
      '17 / 42'
    ],
    correctIndex: 0
  },
  {
    id: 't105_order_with_replacement',
    section: 'A',
    sector: 1,
    topic: 105,
    prompt: 'يضم كيس 4 كرات خضراء و3 كرات صفراء. نسحب بالتتابع وبإحلال 3 كرات. ما عدد السحبات التي تحتوي على كرتين خضراوين وكرة صفراء؟',
    hint: 'السحب بالتتابع وبإحلال يوظف القوى مع معامل الترتيب: (3! / (2!·1!)) × 4² × 3¹ = 3 × 16 × 3.',
    options: [
      '144',
      '48',
      '108',
      '288'
    ],
    correctIndex: 0
  },
  {
    id: 't108_cond_bayes_reverse',
    section: 'A',
    sector: 2,
    topic: 108,
    prompt: 'لاحظ مخطط التجزيء العكسي. ليكن P(A) = 0.4 و P_A(B) = 0.7 و P_Ā(B) = 0.2. احسب P(B) والاحتمال الشرطي العكسي P_B(A):',
    hint: 'أولاً P(B) = P(A)·P_A(B) + P(Ā)·P_Ā(B) = 0.4×0.7 + 0.6×0.2 = 0.40، ثم P_B(A) = P(A∩B)/P(B) = 0.28/0.40.',
    options: [
      'P(B) = 0.40   و   P_B(A) = 0.7',
      'P(B) = 0.40   و   P_B(A) = 0.3',
      'P(B) = 0.90   و   P_B(A) = 0.28',
      'P(B) = 0.50   و   P_B(A) = 0.56'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'bayes_reverse_partition',
      label: 'Bayes: P_B(A) = (P(A)·P_A(B)) / P(B)'
    }
  },
  {
    id: 't109_tree_param_p',
    section: 'B',
    sector: 3,
    topic: 109,
    prompt: 'لاحظ الشجرة الوسيطية. نعتبر p ∈ ]0, 1[ بحيث P(A) = p و P_A(B) = p و P_Ā(B) = 0.3. إذا علمت أن P(B) = 0.40، فما قيمة الوسيط p؟',
    hint: 'حسب الاحتمالات الكلية: p² + 0.3(1 - p) = 0.40 ⟺ p² - 0.3p - 0.10 = 0 ⟺ (p - 0.5)(p + 0.2) = 0.',
    options: [
      'p = 0.5',
      'p = 0.2',
      'p = 0.4',
      'p = 0.7'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'weighted_prob_tree_param',
      label: 'p² + 0.3(1-p) = 0.40 ⇒ p = 0.5'
    }
  },
  {
    id: 't111_indep_complement_events',
    section: 'B',
    sector: 3,
    topic: 111,
    prompt: 'حدثان A و B مستقلان بحيث P(A) = 0.3 و P(B) = 0.6. ما قيمة الاحتمال P(Ā ∩ B)؟',
    hint: 'إذا كان A و B مستقلين فإن Ā و B مستقلان أيضاً! إذن P(Ā∩B) = P(Ā)·P(B) = (1 - 0.3) × 0.6.',
    options: [
      '0.42',
      '0.18',
      '0.28',
      '0.30'
    ],
    correctIndex: 0
  },
  {
    id: 't112_random_var_abs_diff',
    section: 'B',
    sector: 4,
    topic: 112,
    prompt: 'لاحظ شبكة الأزواج المرقمة. نسحب تزامنياً كرتين من كيس يحوي {1, 2, 3, 4}، وليكن X القيمة المطلقة لفرق الرقمين |a - b|. حدد X(Ω) و P(X = 1):',
    hint: 'الأزواج الستة هي {1,2},{2,3},{3,4} (فرقها 1)، {1,3},{2,4} (فرقها 2)، و {1,4} (فرقها 3). إذن P(X=1) = 3/6.',
    options: [
      'X(Ω) = {1, 2, 3}   و   P(X = 1) = 1 / 2',
      'X(Ω) = {0, 1, 2, 3}   و   P(X = 1) = 1 / 3',
      'X(Ω) = {1, 2, 3}   و   P(X = 1) = 1 / 3',
      'X(Ω) = {1, 2, 3}   و   P(X = 1) = 1 / 6'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'dice_diff_grid',
      label: 'C₄² = 6 paires | X = |a - b| ∈ {1, 2, 3}'
    }
  },
  {
    id: 't113_variance_param_solve',
    section: 'B',
    sector: 4,
    topic: 113,
    prompt: 'يأخذ X القيم {-1, 1, 3} بحيث P(X=-1)=a, P(X=1)=0.5, P(X=3)=b، وأمله الرياضي E(X) = 1.2. ما قيم (a, b) والانحراف الطرازي σ(X)؟',
    hint: 'من a+b=0.5 و -a+0.5+3b=1.2 نجد a=0.2 و b=0.3. ثم E(X²) = 0.2 + 0.5 + 9(0.3) = 3.4 ⟹ V(X) = 3.4 - 1.44 = 1.96.',
    options: [
      'a = 0.2 , b = 0.3   و   σ(X) = 1.4',
      'a = 0.3 , b = 0.2   و   σ(X) = 1.4',
      'a = 0.2 , b = 0.3   و   σ(X) = 1.96',
      'a = 0.25 , b = 0.25   و   σ(X) = 1.2'
    ],
    correctIndex: 0
  },
  {
    id: 't114_binomial_at_least_one_n',
    section: 'B',
    sector: 4,
    topic: 114,
    prompt: 'لاحظ عتبة التكرار n. نكرر تجربة مستقلة n مرة باحتمال نجاح p = 0.25. ما أصغر عدد صحيح طبيعي n بحيث يكون P(X ≥ 1) ≥ 0.9؟',
    hint: '1 - (0.75)ⁿ ≥ 0.9 ⟺ (0.75)ⁿ ≤ 0.1 ⟺ n ≥ ln(0.1)/ln(0.75) ≈ 8.004. وبما أن (0.75)⁸ ≈ 0.1001 > 0.1 فالأصغر هو 9!',
    options: [
      'n = 9',
      'n = 8',
      'n = 10',
      'n = 7'
    ],
    correctIndex: 0,
    graphSpec: {
      type: 'binomial_n_threshold',
      label: '1 - (0.75)ⁿ ≥ 0.9 ⇒ n ≥ 8.004 ⇒ n_min = 9'
    }
  }
];

/**
 * Cleanly shuffle options using Fisher-Yates so correct choice isn't locked to index 0.
 * @param {Object} q - Raw question record.
 * @returns {Object} Question clone with shuffled options and updated correctIndex.
 */
function shuffleCasinoQuestionOptions(q) {
  const indices = [0, 1, 2, 3];
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  const newOptions = indices.map((idx) => q.options[idx]);
  const newCorrect = indices.indexOf(q.correctIndex);
  return {
    ...q,
    options: newOptions,
    correctIndex: newCorrect
  };
}

/**
 * Select a non-repeating 2BAC PC Combinatorics/Probability question matching active filter & sector.
 * @param {string} filterId - 'all' | 'sectionA' | 'sectionB'.
 * @param {number[]} allowedTopics - Array of topic numbers.
 * @param {string[]} recentIds - Recently asked question IDs to avoid back-to-back repeats.
 * @returns {Object|null} Shuffled challenge question.
 */
window.pickCasinoChallenge = function pickCasinoChallenge(filterId, allowedTopics, recentIds) {
  const bank = window.CASINO_QUESTION_BANK || [];
  let pool = bank;

  if (Array.isArray(allowedTopics) && allowedTopics.length > 0) {
    const allowedSet = new Set(allowedTopics);
    const topicFiltered = bank.filter((q) => allowedSet.has(q.topic));
    if (topicFiltered.length > 0) pool = topicFiltered;
  } else if (filterId === 'sectionA') {
    pool = bank.filter((q) => q.section === 'A');
  } else if (filterId === 'sectionB') {
    pool = bank.filter((q) => q.section === 'B');
  }

  const recentSet = new Set(Array.isArray(recentIds) ? recentIds : []);
  const fresh = pool.filter((q) => !recentSet.has(q.id));
  const candidates = fresh.length > 0 ? fresh : pool;
  if (!candidates.length) return null;

  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  return shuffleCasinoQuestionOptions(picked);
};
