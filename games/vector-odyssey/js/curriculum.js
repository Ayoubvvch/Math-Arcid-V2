/**
 * Vector Odyssey (أوديسا الفضاء المتجهي): 2BAC PC Spatial Geometry (ℝ³) Curriculum Engine
 * Covers 100% of Topics 91 through 102:
 *   Section A (91–96): Orthonormal Frame ℝ³, Norm, Midpoint, Dot Product u⃗·v⃗, Plane Equation,
 *                      Point-to-Plane Distance d(A,P), Parametric Lines & Intersections, Cross Product u⃗∧v⃗
 *   Section B (97–102): Sphere Equations, Diameter Sphere, Relative Position Sphere/Plane & Circle (C),
 *                       Relative Position Sphere/Line, Tetrahedron Volume & National Exam Synthesis
 */

window.ODYSSEY_TOPICS = {
  91: 'المعلم المتعامد الممنظم ℝ³: المتجهة AB، المنظم ||u⃗||، المنتصف والاستقامية',
  92: 'الجداء السلمي في الفضاء u⃗·v⃗ = xx\' + yy\' + zz\' والتعامد والزاوية',
  93: 'المعادلة الديكارتية لمستوى (P): ax + by + cz + d = 0 والمتجهة المنظمية n⃗',
  94: 'المسافة بين نقطة والمستوى d(A, (P)) والمسقط العمودي H',
  95: 'التمثيل البارامتري لمستقيم (D)، تقاطع مستقيم ومستوى وأوضاع مستويين',
  96: 'الجداء المتجهي u⃗∧v⃗، مساحة المثلث (1/2)||AB∧AC|| والمسافة d(M, (D))',
  97: 'معادلة الفلكة (S) بالمركز Ω(a,b,c) والشعاع R والصيغة المنشورة',
  98: 'الفلكة المعرفة بأحد أقطارها [AB] (MA⃗·MB⃗ = 0) والمستوى المماس في نقطة',
  99: 'الوضع النسبي لفلكة (S) ومستوى (P): مقارنة d(Ω, (P)) مع R والمماسة',
  100: 'دائرة التقاطع (C) = (S) ∩ (P): المركز H والشعاع r = √(R² - d²)',
  101: 'الوضع النسبي لفلكة (S) ومستقيم (D): d(Ω, (D)) وحل جملة التقاطع',
  102: 'تركيبات وطنية في ℝ³: المستوى الواسط، حجم رباعي الأوجه والتماس'
};

window.ODYSSEY_SECTORS = [
  { id: 1, name: 'القطاع α — الجداء السلمي والمستوى في ℝ³ (91–93)', topics: [91, 92, 93], color: '#38bdf8' },
  { id: 2, name: 'القطاع β — المسافات والتمثيل البارامتري و u⃗∧v⃗ (94–96)', topics: [94, 95, 96], color: '#22d3ee' },
  { id: 3, name: 'القطاع γ — معادلة الفلكة والوضع النسبي مع مستوى (97–99)', topics: [97, 98, 99], color: '#818cf8' },
  { id: 4, name: 'القطاع δ — دائرة التقاطع، المستقيم والفلكة ورباعي الأوجه (100–102)', topics: [100, 101, 102], color: '#fbbf24' }
];

window.ODYSSEY_QUESTION_BANK = [
  // ================= SECTION A: DOT PRODUCT, PLANES, LINES & CROSS PRODUCT (TOPICS 91 - 96) =================
  {
    id: 't91_norm_midpoint',
    section: 'A',
    sector: 1,
    topic: 91,
    prompt: 'في الفضاء المنسوب إلى معلم متعامد ممنظم (O, i⃗, j⃗, k⃗)، نعتبر النقطتين A(1, -2, 3) و B(3, 2, -1). ما منظم المتجهة AB⃗ وإحداثيات منتصف القطعة [AB]؟',
    hint: 'نحسب AB⃗ = (3-1, 2-(-2), -1-3) = (2, 4, -4)، ثم ||AB⃗|| = √(2² + 4² + (-4)²)، والمنتصف I = ((x_A+x_B)/2, ...).',
    options: [
      '||AB⃗|| = 6   و   I(2, 0, 1)',
      '||AB⃗|| = 36   و   I(2, 0, 1)',
      '||AB⃗|| = 6   و   I(1, 2, -2)',
      '||AB⃗|| = 2√6   و   I(2, 1, 1)'
    ],
    correctIndex: 0
  },
  {
    id: 't91_collinear_vec',
    section: 'A',
    sector: 1,
    topic: 91,
    prompt: 'لتكن المتجهتان u⃗(2, -3, 1) و v⃗(-4, m, -2) في الفضاء ℝ³. ما قيمة العدد الحقيقي m التي تجعل المتجهتين u⃗ و v⃗ مستقيميتين؟',
    hint: 'المتجهتان مستقيميتان إذا وجد k ∈ ℝ بحيث v⃗ = k·u⃗. من المركبة الأولى نجد -4 = k·2 أي k = -2.',
    options: [
      'm = 6',
      'm = -6',
      'm = 3/2',
      'm = -3'
    ],
    correctIndex: 0
  },
  {
    id: 't92_dot_ortho',
    section: 'A',
    sector: 1,
    topic: 92,
    prompt: 'ما قيمة الوسيط m ∈ ℝ التي يكون عندها المتجهتان u⃗(2, m, -1) و v⃗(3, -2, 4) متعامدتين (u⃗ ⊥ v⃗)؟',
    hint: 'شرط التعامد هو u⃗·v⃗ = 0، أي 2(3) + m(-2) + (-1)(4) = 0 ⟺ 6 - 2m - 4 = 0.',
    options: [
      'm = 1',
      'm = 5',
      'm = -1',
      'm = 2'
    ],
    correctIndex: 0
  },
  {
    id: 't92_cos_angle',
    section: 'A',
    sector: 1,
    topic: 92,
    prompt: 'نعتبر u⃗(1, 1, 0) و v⃗(1, 0, 1). باستعمال الجداء السلمي u⃗·v⃗ = ||u⃗||·||v⃗||·cos(θ)، ما قياس الزاوية الهندسية θ = (u⃗, v⃗)؟',
    hint: 'احسب u⃗·v⃗ = 1 و ||u⃗|| = √2 و ||v⃗|| = √2، إذن cos(θ) = 1 / (√2·√2) = 1/2.',
    options: [
      'θ = π / 3',
      'θ = π / 6',
      'θ = π / 4',
      'θ = π / 2'
    ],
    correctIndex: 0
  },
  {
    id: 't93_plane_eq',
    section: 'A',
    sector: 1,
    topic: 93,
    prompt: 'لاحظ الشكل ثلاثي الأبعاد المرفق. ما المعادلة الديكارتية للمستوى (P) المار من النقطة A(1, 0, -2) والمتجهة n⃗(2, -1, 3) منظمية عليه؟',
    hint: 'المعادلة على الشكل 2(x - 1) - 1(y - 0) + 3(z + 2) = 0 ثم انشر وبسط.',
    options: [
      '(P): 2x - y + 3z + 4 = 0',
      '(P): 2x - y + 3z - 4 = 0',
      '(P): x - 2y + 3z + 5 = 0',
      '(P): 2x - y + 3z + 8 = 0'
    ],
    correctIndex: 0,
    graphSpec: { type: 'plane_normal_3d' }
  },
  {
    id: 't93_plane_parallel',
    section: 'A',
    sector: 1,
    topic: 93,
    prompt: 'نعتبر المستويين (P): 2x - 4y + 6z - 1 = 0 و (Q): -x + 2y - 3z + 5 = 0. ما الوضع النسبي للمستويين (P) و (Q)؟',
    hint: 'قارن المتجهتين المنظميتين n⃗_P(2, -4, 6) و n⃗_Q(-1, 2, -3): نلاحظ أن n⃗_P = -2·n⃗_Q، لكن المعادلتين غير متناسبتين في الحد الثابت.',
    options: [
      'متوازيان قطعاً ((P) ∩ (Q) = ∅)',
      'متطابقان ((P) = (Q))',
      'متعامدان ((P) ⊥ (Q))',
      'يتقاطعان وفق مستقيم مائل'
    ],
    correctIndex: 0
  },
  {
    id: 't94_dist_point_plane',
    section: 'A',
    sector: 2,
    topic: 94,
    prompt: 'لاحظ المبيان المرفق. احسب المسافة d(A, (P)) بين النقطة A(2, -1, 1) والمستوى (P): x - 2y + 2z + 3 = 0:',
    hint: 'طبق الصيغة d(A, (P)) = |1(2) - 2(-1) + 2(1) + 3| / √(1² + (-2)² + 2²).',
    options: [
      'd(A, (P)) = 3',
      'd(A, (P)) = 9',
      'd(A, (P)) = 1',
      'd(A, (P)) = 5 / 3'
    ],
    correctIndex: 0,
    graphSpec: { type: 'dist_point_plane_3d' }
  },
  {
    id: 't94_ortho_proj_point',
    section: 'A',
    sector: 2,
    topic: 94,
    prompt: 'حدد مثلوث إحداثيات المسقط العمودي H للنقطة A(1, 3, -1) على المستوى (P): x - y + 2z - 2 = 0:',
    hint: 'المستقيم (AH) يمر من A وموجه بـ n⃗(1, -1, 2): x = 1+t, y = 3-t, z = -1+2t. عوض في (P) لإيجاد t ثم احسب H.',
    options: [
      'H(2, 2, 1)',
      'H(0, 4, -3)',
      'H(2, 4, 1)',
      'H(3, 1, 3)'
    ],
    correctIndex: 0
  },
  {
    id: 't95_line_plane_inter',
    section: 'A',
    sector: 2,
    topic: 95,
    prompt: 'لاحظ الشكل ثلاثي الأبعاد. حدد نقطة تقاطع المستقيم (D) ذي التمثيل البارامتري x = 1 + t, y = -2 + 2t, z = 3 - t (t ∈ ℝ) مع المستوى (P): 2x + y - z - 7 = 0:',
    hint: 'عوض x, y, z بدلالة t في معادلة (P): 2(1 + t) + (-2 + 2t) - (3 - t) - 7 = 0 أي 5t - 10 = 0.',
    options: [
      'H(3, 2, 1)   (لـ t = 2)',
      'H(2, 0, 2)   (لـ t = 1)',
      'H(-1, -6, 5)   (لـ t = -2)',
      'المستقيم يوازي المستوى قطعاً'
    ],
    correctIndex: 0,
    graphSpec: { type: 'line_plane_intersect_3d' }
  },
  {
    id: 't95_line_parallel_plane',
    section: 'A',
    sector: 2,
    topic: 95,
    prompt: 'فخ وطني: نعتبر المستقيم (D): x = 2 + t, y = -1 + 2t, z = 3t (t ∈ ℝ) والمستوى (P): 2x - y - 1 = 0. ما العلاقة بين (D) و (P)؟',
    hint: 'احسب u⃗·n⃗ حيث u⃗(1, 2, 3) موجهة لـ (D) و n⃗(2, -1, 0) منظمية على (P): u⃗·n⃗ = 0، ثم تحقق هل النقطة (2, -1, 0) تنتمي لـ (P)!',
    options: [
      '(D) يوازي المستوى (P) قطعاً ((D) ∩ (P) = ∅)',
      '(D) محتوى بالكامل في (P)',
      '(D) يخترق (P) في نقطة وحيدة',
      '(D) عمودي على (P)'
    ],
    correctIndex: 0
  },
  {
    id: 't95_planes_ortho',
    section: 'A',
    sector: 2,
    topic: 95,
    prompt: 'ما قيمة العدد الحقيقي m التي تجعل المستويين (P): x + m·y - 2z + 1 = 0 و (Q): 3x - y + z - 4 = 0 متعامدين؟',
    hint: 'المستويان متعامدان إذا وفقط إذا كانت متجهتاهما المنظميتان متعامدتين: n⃗_P·n⃗_Q = 0 ⟺ 3 - m - 2 = 0.',
    options: [
      'm = 1',
      'm = -1',
      'm = 5',
      'm = 3'
    ],
    correctIndex: 0
  },
  {
    id: 't96_cross_product',
    section: 'A',
    sector: 2,
    topic: 96,
    prompt: 'لاحظ الشكل المرفق. احسب إحداثيات الجداء المتجهي u⃗ ∧ v⃗ حيث u⃗(1, 2, -1) و v⃗(2, -1, 1):',
    hint: 'احسب المحددات الصغرى الثلاثة ولا تنسَ الإشارة السالبة في المركبة الوسطى (أو الدور الدائري yz - zy, zx - xz, xy - yx)! ثم تحقق بالتعامد u⃗·(u⃗∧v⃗) = 0.',
    options: [
      'u⃗ ∧ v⃗ = (1, -3, -5)',
      'u⃗ ∧ v⃗ = (1, 3, -5)',
      'u⃗ ∧ v⃗ = (-1, 3, 5)',
      'u⃗ ∧ v⃗ = (3, -3, -3)'
    ],
    correctIndex: 0,
    graphSpec: { type: 'cross_product_3d' }
  },
  {
    id: 't96_triangle_area',
    section: 'A',
    sector: 2,
    topic: 96,
    prompt: 'نعتبر النقط A(1, 0, 1) و B(2, 2, 1) و C(1, 1, 3). احسب مساحة المثلث ABC باستعمال الجداء المتجهي:',
    hint: 'احسب AB⃗(1, 2, 0) و AC⃗(0, 1, 2)، ثم AB⃗ ∧ AC⃗ = (4, -2, 1). وتذكر معامل 1/2 في مساحة المثلث: A = (1/2)||AB⃗ ∧ AC⃗||.',
    options: [
      'A = √21 / 2',
      'A = √21',
      'A = √21 / 4',
      'A = 21 / 2'
    ],
    correctIndex: 0
  },
  {
    id: 't96_dist_point_line',
    section: 'A',
    sector: 2,
    topic: 96,
    prompt: 'لاحظ الشكل المرفق. احسب المسافة d(M, (D)) بين النقطة M(2, 2, 0) والمستقيم (D) المار من A(0, 1, 2) والموجه بالمتجهة u⃗(1, 0, -1):',
    hint: 'احسب AM⃗ = (2, 1, -2) ثم AM⃗ ∧ u⃗ = (-1, 0, -1). المسافة هي ||AM⃗ ∧ u⃗|| / ||u⃗||.',
    options: [
      'd(M, (D)) = 1',
      'd(M, (D)) = √2',
      'd(M, (D)) = 2',
      'd(M, (D)) = √3'
    ],
    correctIndex: 0,
    graphSpec: { type: 'dist_point_line_3d' }
  },
  {
    id: 't96_plane_from_3_pts',
    section: 'A',
    sector: 2,
    topic: 96,
    prompt: 'حدد معادلة ديكارتية للمستوى (ABC) المحدد بالنقط غير المستقيمية A(1, 0, 1), B(2, 1, 0), C(0, 2, 1):',
    hint: 'المتجهة المنظمية هي n⃗ = AB⃗ ∧ AC⃗ حيث AB⃗(1, 1, -1) و AC⃗(-1, 2, 0)، فنحصل على n⃗ = (2, 1, 3)، ثم نمرّره من A.',
    options: [
      '2x + y + 3z - 5 = 0',
      '2x - y + 3z - 5 = 0',
      '2x + y + 3z + 5 = 0',
      'x + 2y + 3z - 4 = 0'
    ],
    correctIndex: 0
  },

  // ================= SECTION B: SPHERES & RELATIVE POSITIONS IN ℝ³ (TOPICS 97 - 102) =================
  {
    id: 't97_sphere_center_radius',
    section: 'B',
    sector: 3,
    topic: 97,
    prompt: 'لاحظ الشكل المرفق. لتكن الفلكة (S) ذات المعادلة الديكارتية:\nx² + y² + z² - 4x + 2y - 6z + 5 = 0\nحدد مركزها Ω وشعاعها R:',
    hint: 'أتمم المربعات الكاملة: (x - 2)² - 4 + (y + 1)² - 1 + (z - 3)² - 9 + 5 = 0 ⟹ ... = 9.',
    options: [
      'Ω(2, -1, 3)   و   R = 3',
      'Ω(-2, 1, -3)   و   R = 3',
      'Ω(2, -1, 3)   و   R = 9',
      'Ω(4, -2, 6)   و   R = √5'
    ],
    correctIndex: 0,
    graphSpec: { type: 'sphere_center_3d' }
  },
  {
    id: 't97_sphere_existence_trap',
    section: 'B',
    sector: 3,
    topic: 97,
    prompt: 'وطني نموذجي: لتكن المجموعة (E_m): x² + y² + z² - 2x + 4y + m = 0. ما شرط الوسيط m ∈ ℝ لتكون (E_m) فلكة غير فارغة ذات شعاع موجب قطعا؟',
    hint: 'بتتميم المربعين نحصل على (x - 1)² + (y + 2)² + z² = 1² + (-2)² - m = 5 - m. نحتاج أن يكون الطرف الأيمن > 0 قطعا!',
    options: [
      'm < 5  (أي m ∈ ]-∞, 5[)',
      'm ≤ 5',
      'm > 5',
      'm > 0'
    ],
    correctIndex: 0
  },
  {
    id: 't98_sphere_diameter',
    section: 'B',
    sector: 3,
    topic: 98,
    prompt: 'لاحظ الشكل المرفق. ما معادلة الفلكة (S) التي أحد أقطارها القطعة [AB] حيث A(2, -1, 3) و B(0, 3, 1)؟',
    hint: 'المركز Ω هو منتصف [AB] أي Ω(1, 1, 2)، والشعاع R = AB/2 = √((-2)² + 4² + (-2)²)/2 = √6، أو استعمل MA⃗·MB⃗ = 0.',
    options: [
      'x² + y² + z² - 2x - 2y - 4z = 0',
      'x² + y² + z² - 2x - 2y - 4z - 6 = 0',
      'x² + y² + z² + 2x + 2y + 4z = 0',
      '(x - 1)² + (y - 1)² + (z - 2)² = 24'
    ],
    correctIndex: 0,
    graphSpec: { type: 'sphere_diameter_3d' }
  },
  {
    id: 't98_tangent_plane_point',
    section: 'B',
    sector: 3,
    topic: 98,
    prompt: 'نعتبر الفلكة (S) التي مركزها Ω(1, -2, 3) وتمر من النقطة A(3, 0, 2). ما معادلة المستوى (P) المماس للفلكة (S) في النقطة A؟',
    hint: 'المستوى المماس في A عمودي على الشعاع [ΩA]، إذن المتجهة المنظمية هي ΩA⃗(2, 2, -1) ويمر من A(3, 0, 2).',
    options: [
      '(P): 2x + 2y - z - 4 = 0',
      '(P): 2x + 2y - z + 4 = 0',
      '(P): x - 2y + 3z - 9 = 0',
      '(P): 2x + 2y + z - 8 = 0'
    ],
    correctIndex: 0
  },
  {
    id: 't99_sphere_plane_tangent',
    section: 'B',
    sector: 3,
    topic: 99,
    prompt: 'لاحظ الشكل المرفق. فلكة (S) مركزها Ω(1, 2, -1) وشعاعها R = 3، ومستوى (P_d): 2x - y + 2z + d = 0. ما قيمتا d ∈ ℝ اللتان تجعلان (P_d) مماساً لـ (S)؟',
    hint: 'يكون المستوى مماساً للفلكة إذا وفقط إذا كان d(Ω, (P_d)) = R، أي |2(1) - 2 + 2(-1) + d| / √(4 + 1 + 4) = 3 ⟺ |d - 2| = 9.',
    options: [
      'd = 11  أو  d = -7',
      'd = 9  أو  d = -9',
      'd = 7  أو  d = -11',
      'd = 5  فقط'
    ],
    correctIndex: 0,
    graphSpec: { type: 'sphere_plane_tan_3d' }
  },
  {
    id: 't99_tangent_contact_point',
    section: 'B',
    sector: 3,
    topic: 99,
    prompt: 'نعتبر الفلكة (S) مركزها Ω(1, 0, -1) والمستوى المماس (P): 2x + 2y - z - 12 = 0. حدد نقطة التماس H:',
    hint: 'نقطة التماس H هي المسقط العمودي لـ Ω على (P): نكتب x = 1 + 2t, y = 2t, z = -1 - t ونعوض في (P) فنجد 9t - 9 = 0 أي t = 1.',
    options: [
      'H(3, 2, -2)',
      'H(-1, -2, 0)',
      'H(2, 2, -1)',
      'H(5, 4, -3)'
    ],
    correctIndex: 0
  },
  {
    id: 't100_circle_intersection',
    section: 'B',
    sector: 4,
    topic: 100,
    prompt: 'لاحظ المبيان المرفق. فلكة (S) مركزها Ω(0, 1, -2) وشعاعها R = 5، يقطعها المستوى (P): 2x + y - 2z + 7 = 0 وفق دائرة (C). ما شعاع الدائرة r؟',
    hint: 'احسب أولاً d = d(Ω, (P)) = |0 + 1 + 4 + 7| / √(4 + 1 + 4) = 12/3 = 4 < 5، ثم طبق فيتاغورس الفضائي r = √(R² - d²).',
    options: [
      'r = 3',
      'r = 4',
      'r = √41',
      'r = 1'
    ],
    correctIndex: 0,
    graphSpec: { type: 'sphere_plane_circle_3d' }
  },
  {
    id: 't100_circle_center_H',
    section: 'B',
    sector: 4,
    topic: 100,
    prompt: 'يقطع المستوى (P): x - 2y + 2z - 16 = 0 الفلكة (S) التي مركزها Ω(1, -1, 2) وشعاعها R = 5 وفق دائرة (C). حدد مركز الدائرة H:',
    hint: 'مركز الدائرة H هو المسقط العمودي لـ Ω على (P): (ΩH): x = 1 + t, y = -1 - 2t, z = 2 + 2t. بالتعويض في (P) نجد 9t - 9 = 0.',
    options: [
      'H(2, -3, 4)',
      'H(1, -2, 2)',
      'H(0, 1, 0)',
      'H(3, -5, 6)'
    ],
    correctIndex: 0
  },
  {
    id: 't100_circle_bisector_r',
    section: 'B',
    sector: 4,
    topic: 100,
    prompt: 'لتكن الفلكة (S): x² + y² + z² = 169 (مركزها O وشعاعها 13) والمستوى (P): 3x + 4z - 25 = 0. حدد مركز H وشعاع r لدائرة التقاطع (S) ∩ (P):',
    hint: 'd(O, (P)) = |-25| / √(9 + 16) = 5 < 13، ومنه r = √(13² - 5²) = 12، و (OH) موجه بـ (3, 0, 4) يعطي 25t = 25 أي t = 1.',
    options: [
      'H(3, 0, 4)   و   r = 12',
      'H(3, 0, 4)   و   r = 5',
      'H(6, 0, 8)   و   r = 12',
      'المستوى مماس للفلكة في H(3, 0, 4)'
    ],
    correctIndex: 0
  },
  {
    id: 't101_sphere_line_tan',
    section: 'B',
    sector: 4,
    topic: 101,
    prompt: 'لاحظ الشكل المرفق. نعتبر الفلكة (S): x² + y² + z² = 9 والمستقيم (D): x = 1 + 2t, y = 2 - 2t, z = 2 + t (t ∈ ℝ). ما تقاطع (D) و (S)؟',
    hint: 'عوض إحداثيات (D) في معادلة (S): (1 + 2t)² + (2 - 2t)² + (2 + t)² = 9 ⟺ 9t² = 0 (حل وحيد t = 0).',
    options: [
      '(D) مماس لـ (S) في النقطة الوحيدة T(1, 2, 2)',
      '(D) يقطع (S) في نقطتين متمايزتين',
      '(D) خارج الفلكة ((D) ∩ (S) = ∅)',
      '(D) يمر من مركز الفلكة O(0, 0, 0)'
    ],
    correctIndex: 0,
    graphSpec: { type: 'sphere_line_3d' }
  },
  {
    id: 't101_sphere_line_secant',
    section: 'B',
    sector: 4,
    topic: 101,
    prompt: 'حدّد نقطتي تقاطع المستقيم (D): x = 1 + 2t, y = 2 - 2t, z = 2 + t مع الفلكة (S\'): x² + y² + z² = 18:',
    hint: 'بعد التعويض في x² + y² + z² = 18 نحصل على 9t² + 9 = 18 أي t² = 1 ⟹ t = 1 أو t = -1.',
    options: [
      'E(3, 0, 3)  و  F(-1, 4, 1)',
      'E(1, 2, 2)  و  F(3, 0, 3)',
      'E(5, -2, 4)  و  F(-3, 6, 0)',
      'تقاطعهما فارغ (t² < 0)'
    ],
    correctIndex: 0
  },
  {
    id: 't102_tetrahedron_volume',
    section: 'B',
    sector: 4,
    topic: 102,
    prompt: 'في رباعي الأوجه ABCD لدينا AB⃗(2, 1, 0) و AC⃗(0, 2, 1) و AD⃗(2, -1, 2). احسب حجم رباعي الأوجه باستعمال الجداء المختلط:',
    hint: 'V = (1/6)·|(AB⃗ ∧ AC⃗)·AD⃗|. لدينا AB⃗ ∧ AC⃗ = (1, -2, 4)، وجداؤه السلمي مع AD⃗(2, -1, 2) يساوي 2 + 2 + 8 = 12.',
    options: [
      'V = 2',
      'V = 12',
      'V = 4',
      'V = 6'
    ],
    correctIndex: 0
  },
  {
    id: 't102_sphere_tangent_xoy',
    section: 'B',
    sector: 4,
    topic: 102,
    prompt: 'ما معادلة الفلكة (S) التي مركزها Ω(2, -1, 3) والمماسة للمستوى الإحداثي (xOy) ذي المعادلة z = 0؟',
    hint: 'بما أن (S) مماسة للمستوى (z = 0) فإن شعاعها يساوي المسافة R = d(Ω, (xOy)) = |z_Ω| = 3.',
    options: [
      '(x - 2)² + (y + 1)² + (z - 3)² = 9',
      '(x - 2)² + (y + 1)² + (z - 3)² = 3',
      '(x - 2)² + (y + 1)² + (z - 3)² = 14',
      '(x + 2)² + (y - 1)² + (z + 3)² = 9'
    ],
    correctIndex: 0
  },
  {
    id: 't102_mediator_plane',
    section: 'B',
    sector: 4,
    topic: 102,
    prompt: 'حدد معادلة المستوى الواسط (P) للقطعة [AB] في ℝ³ حيث A(1, 2, 0) و B(3, 0, 2):',
    hint: 'المستوى الواسط لـ [AB] يمر من المنتصف I(2, 1, 1) وعمودي على المتجهة AB⃗(2, -2, 2) (أو المنظمية المبسطة n⃗(1, -1, 1)).',
    options: [
      'x - y + z - 2 = 0',
      'x - y + z + 2 = 0',
      'x + y + z - 4 = 0',
      '2x - 2y + 2z - 1 = 0'
    ],
    correctIndex: 0
  },
  {
    id: 't96_collinear_points',
    section: 'A',
    sector: 2,
    topic: 96,
    prompt: 'ما الشرط اللازم والكافي لاستقامية ثلاث نقط A و B و C في الفضاء ℝ³ باستعمال الجداء المتجهي؟',
    hint: 'مساحة المثلث ABC منعدمة إذا وفقط إذا كان ||AB⃗ ∧ AC⃗|| = 0.',
    options: [
      'AB⃗ ∧ AC⃗ = 0⃗',
      'AB⃗ · AC⃗ = 0',
      '||AB⃗ ∧ AC⃗|| = 1',
      'AB⃗ + AC⃗ = 0⃗'
    ],
    correctIndex: 0
  },

  // ================= CYCLE 012-OMEGA: PARAMETER-IN-SPACE & NATIONAL EXAM SYNTHESIS (+8 QUESTIONS) =================
  {
    id: 't93_param_line_in_plane',
    section: 'A',
    sector: 1,
    topic: 93,
    prompt: 'وسيط فضائي: ما قيمتا a, b ∈ ℝ لكي يكون المستقيم (D): x = 1 + t, y = 2 - t, z = a + 2t (t ∈ ℝ) محتوى بالكامل في المستوى (P): 2x + b·y - z + 3 = 0؟',
    hint: 'شرط الاحتواء (D) ⊂ (P) مزدوج: أولاً u⃗(1, -1, 2) ⊥ n⃗(2, b, -1) يعطي 2 - b - 2 = 0؛ ثانياً النقطة M₀(1, 2, a) ∈ (P) يعطي 2 + 0 - a + 3 = 0.',
    options: [
      'a = 5   و   b = 0',
      'a = 0   و   b = 5',
      'a = -5   و   b = 2',
      'a = 3   و   b = -1'
    ],
    correctIndex: 0
  },
  {
    id: 't94_param_dist_plane',
    section: 'A',
    sector: 2,
    topic: 94,
    prompt: 'وسيط وطني: نعتبر النقطة المتحركة A_m(1, m, 1) والمستوى (P): 2x - y + 2z - 1 = 0. ما قيمتا m ∈ ℝ اللتان تحققان d(A_m, (P)) = 2؟',
    hint: 'احسب d(A_m, (P)) = |2(1) - m + 2(1) - 1| / √(4 + 1 + 4) = |3 - m| / 3 = 2، إذن |3 - m| = 6 (حلان متمايزان!).',
    options: [
      'm = -3   أو   m = 9',
      'm = -3   فقط',
      'm = 3   أو   m = -9',
      'm = 5   أو   m = -1'
    ],
    correctIndex: 0
  },
  {
    id: 't96_param_cross_area',
    section: 'A',
    sector: 2,
    topic: 96,
    prompt: 'لتكن النقط A(1, 0, 1) و B(2, 1, 1) و C_m(1, m, 3). ما قيمتا الوسيط m ∈ ℝ بحيث تكون مساحة المثلث ABC_m مساوية لـ 3/2؟',
    hint: 'لدينا AB⃗(1, 1, 0) و AC_m⃗(0, m, 2)، إذن AB⃗ ∧ AC_m⃗ = (2, -2, m). ومنه (1/2)√(4 + 4 + m²) = 3/2 ⟺ 8 + m² = 9.',
    options: [
      'm = 1   أو   m = -1',
      'm = 3   أو   m = -3',
      'm = 1   فقط',
      'm = √7   أو   m = -√7'
    ],
    correctIndex: 0
  },
  {
    id: 't97_param_sphere_radius',
    section: 'B',
    sector: 3,
    topic: 97,
    prompt: 'وسيط فضائي: لتكن المجموعة (S_m): x² + y² + z² - 2m·x + 2m·y + 2z - 7 = 0. ما قيمتا m ∈ ℝ اللتان تكون عندهما (S_m) فلكة شعاعها R = 4؟',
    hint: 'بإتمام المربعات: (x - m)² + (y + m)² + (z + 1)² = m² + m² + 1 + 7 = 2m² + 8. نساوي 2m² + 8 = R² = 16.',
    options: [
      'm = 2   أو   m = -2',
      'm = 4   أو   m = -4',
      'm = √8   أو   m = -√8',
      'm = 2   فقط'
    ],
    correctIndex: 0
  },
  {
    id: 't99_param_tangent_planes',
    section: 'B',
    sector: 3,
    topic: 99,
    prompt: 'لاحظ المبيان ثلاثي الأبعاد المرفق. نعتبر الفلكة (S) مركزها Ω(2, -1, 1) وشعاعها R = 2، وعائلة المستويات المتوازية (P_m): x + 2y - 2z + m = 0. ما قيمتا m اللتان يكون عندهما (P_m) مماساً لـ (S)؟',
    hint: 'المستوى (P_m) مماس لـ (S) إذا وفقط إذا كان d(Ω, (P_m)) = R: |2 + 2(-1) - 2(1) + m| / √(1 + 4 + 4) = 2 ⟺ |m - 2| / 3 = 2.',
    options: [
      'm = 8   أو   m = -4',
      'm = 4   أو   m = -8',
      'm = 6   أو   m = -6',
      'm = 8   فقط'
    ],
    correctIndex: 0,
    graphSpec: { type: 'sphere_tangent_plane_param_3d', label: 'd(Ω, P_m) = R  ⇒  Twin Tangent Planes' }
  },
  {
    id: 't100_param_circle_radius',
    section: 'B',
    sector: 4,
    topic: 100,
    prompt: 'لاحظ الشكل المرفق. الفلكة (S) مركزها Ω(1, 0, -1) وشعاعها R = 5، يقطعها المستوى (P_k): 2x - 2y + z + k = 0 وفق دائرة (C) شعاعها r = 4. ما قيمتا الوسيط k ∈ ℝ؟',
    hint: 'من r² = R² - d² نجد d = √(25 - 16) = 3. إذن |2(1) - 0 + (-1) + k| / 3 = 3 ⟺ |k + 1| = 9.',
    options: [
      'k = 8   أو   k = -10',
      'k = 10   أو   k = -8',
      'k = 4   أو   k = -6',
      'k = 9   أو   k = -9'
    ],
    correctIndex: 0,
    graphSpec: { type: 'sphere_circle_param_3d', label: 'r = √(R² - d²) = 4  ⇒  d = 3' }
  },
  {
    id: 't101_sphere_line_dist_method',
    section: 'B',
    sector: 4,
    topic: 101,
    prompt: 'لاحظ الشكل المرفق. باستعمال صيغة المسافة d(Ω, (D)) = ||ΩA⃗ ∧ u⃗|| / ||u⃗||، نعتبر (S) مركزها Ω(1, 1, 0) وشعاعها R = 2، والمستقيم (D) المار من A(2, 1, 2) والموجه بـ u⃗(2, -1, 2). ما الوضع النسبي لـ (D) و (S)؟',
    hint: 'احسب ΩA⃗ = (1, 0, 2) ثم ΩA⃗ ∧ u⃗ = (2, 2, -1) ومنه ||ΩA⃗ ∧ u⃗|| = 3 و ||u⃗|| = 3، إذن d(Ω, (D)) = 1 < R.',
    options: [
      '(D) يقطع الفلكة (S) في نقطتين متمايزتين (d = 1 < R)',
      '(D) مماس للفلكة (S) في نقطة وحيدة (d = R)',
      '(D) لا يقطع الفلكة (S) أبداً (d > R)',
      '(D) يمر مباشرة من مركز الفلكة Ω'
    ],
    correctIndex: 0,
    graphSpec: { type: 'sphere_line_dist_3d', label: 'd(Ω, (D)) = ||ΩA ∧ u|| / ||u|| < R' }
  },
  {
    id: 't102_tetrahedron_height',
    section: 'B',
    sector: 4,
    topic: 102,
    prompt: 'لاحظ الشكل المرفق. في رباعي الأوجه ABCD لدينا AB⃗ ∧ AC⃗ = (2, -1, 2) و AD⃗ = (3, 0, 3). احسب مساحة القاعدة ABC والارتفاع h = d(D, (ABC)):',
    hint: 'مساحة القاعدة A_ABC = (1/2)||AB⃗ ∧ AC⃗|| = 3/2، والحجم V = (1/6)|(AB⃗ ∧ AC⃗)·AD⃗| = 2، والارتفاع h = |(AB⃗ ∧ AC⃗)·AD⃗| / ||AB⃗ ∧ AC⃗||.',
    options: [
      'A_ABC = 3/2   و   h = 4',
      'A_ABC = 3   و   h = 2',
      'A_ABC = 3/2   و   h = 12',
      'A_ABC = 9/2   و   h = 4/3'
    ],
    correctIndex: 0,
    graphSpec: { type: 'tetrahedron_volume_3d', label: 'V = (1/6)|(AB ∧ AC)·AD| = (1/3)A·h' }
  }
];

// Compatibility alias for Ironclad Quality Gate & Hub
window.QUESTION_BANK = window.ODYSSEY_QUESTION_BANK;

window.pickOdysseyChallenge = function(topicFilter = 'all', allowedTopics = null, recentIds = []) {
  let pool = window.ODYSSEY_QUESTION_BANK;

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
