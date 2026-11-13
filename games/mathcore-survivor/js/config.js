/**
 * MathCore: Sandbox Survivor - Configuration & Constants
 */

window.AVAILABLE_MATH_OPS = [
    { id: '+1', label: '+1', fn: x => x + 1 },
    { id: '-1', label: '-1', fn: x => x - 1 },
    { id: '+2', label: '+2', fn: x => x + 2 },
    { id: '-2', label: '-2', fn: x => x - 2 },
    { id: '+3', label: '+3', fn: x => x + 3 },
    { id: '-3', label: '-3', fn: x => x - 3 },
    { id: '+5', label: '+5', fn: x => x + 5 },
    { id: '-5', label: '-5', fn: x => x - 5 },
    { id: '+10', label: '+10', fn: x => x + 10 },
    { id: 'x2', label: '×2', fn: x => x * 2 },
    { id: 'x3', label: '×3', fn: x => x * 3 },
    { id: 'div2', label: '÷2', fn: x => Math.trunc(x / 2) },
    { id: 'sq', label: 'X²', fn: x => Math.min(999, x * x) },
    { id: 'neg', label: '-X', fn: x => -x },
    { id: 'reset', label: 'X=0', fn: () => 0 }
];

window.DEFAULT_SANDBOX_CONFIG = {
    buttonOps: ['+1', '-1', 'x2', 'reset'],
    mathMode: 'arithmetic', // 'numbers' | 'arithmetic' | 'algebra' | 'chaos'
    playerSpeed: 5.5,
    beamRange: 420,
    turretFireRateMultiplier: 1.0,
    enemySpawnMultiplier: 1.0,
    infiniteMatter: false,
    godMode: false
};

window.SandboxConfig = JSON.parse(JSON.stringify(window.DEFAULT_SANDBOX_CONFIG));

window.BUILDINGS = [
    {
        id: 'even_turret',
        name: 'برج الزوجي',
        formula: '2n',
        cost: 15,
        color: '#00f3ff',
        icon: 'fa-bolt',
        desc: 'يهاجم الوحوش ذات الناتج الزوجي تلقائياً',
        maxHp: 120
    },
    {
        id: 'odd_turret',
        name: 'برج الفردي',
        formula: '2n+1',
        cost: 15,
        color: '#ff007f',
        icon: 'fa-fire-flame-curved',
        desc: 'يهاجم الوحوش ذات الناتج الفردي تلقائياً',
        maxHp: 120
    },
    {
        id: 'mod3_coil',
        name: 'وشيعة القواسم',
        formula: '3n',
        cost: 25,
        color: '#ffb800',
        icon: 'fa-tower-broadcast',
        desc: 'صاعقة متسلسلة للوحوش التي تقبل القسمة على 3',
        maxHp: 140
    },
    {
        id: 'sine_healer',
        name: 'مولد الجيب',
        formula: 'sin(t)',
        cost: 30,
        color: '#00ff88',
        icon: 'fa-wave-square',
        desc: 'يعالج المركبة والمباني المجاورة بموجات جيبية',
        maxHp: 150
    },
    {
        id: 'matrix_wall',
        name: 'جدار المصفوفة',
        formula: '[M]',
        cost: 8,
        color: '#b537f2',
        icon: 'fa-border-all',
        desc: 'حاجز دفاعي صلب يصد الوحوش ويعكس الضرر',
        maxHp: 320
    }
];

window.WORLD_SIZE = 2400;
window.GRID_SIZE = 60;
