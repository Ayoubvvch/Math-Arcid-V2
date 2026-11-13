/**
 * MathCore: Sandbox Survivor - Configuration & PlayStation Standards
 */

// Official PlayStation Button Colors & Glyphs
window.PS_ICONS = {
    cross: { symbol: '✕', label: 'Cross', color: '#00f3ff', border: 'rgba(0, 243, 255, 0.8)', bg: 'rgba(0, 243, 255, 0.15)' },
    circle: { symbol: '◯', label: 'Circle', color: '#ff007f', border: 'rgba(255, 0, 127, 0.8)', bg: 'rgba(255, 0, 127, 0.15)' },
    square: { symbol: '▢', label: 'Square', color: '#b537f2', border: 'rgba(181, 55, 242, 0.8)', bg: 'rgba(181, 55, 242, 0.15)' },
    triangle: { symbol: '△', label: 'Triangle', color: '#00ff88', border: 'rgba(0, 255, 136, 0.8)', bg: 'rgba(0, 255, 136, 0.15)' }
};

window.AVAILABLE_MATH_OPS = [
    { id: '+1', label: '+1', fn: x => x + 1, psKey: 'cross' },
    { id: '-1', label: '-1', fn: x => x - 1, psKey: 'circle' },
    { id: 'x2', label: '×2', fn: x => x * 2, psKey: 'square' },
    { id: 'reset', label: 'X=0', fn: () => 0, psKey: 'triangle' },
    { id: '+5', label: '+5', fn: x => x + 5, psKey: 'triangle' },
    { id: '-5', label: '-5', fn: x => x - 5, psKey: 'circle' },
    { id: '+2', label: '+2', fn: x => x + 2, psKey: 'cross' },
    { id: '-2', label: '-2', fn: x => x - 2, psKey: 'circle' },
    { id: '+10', label: '+10', fn: x => x + 10, psKey: 'triangle' },
    { id: 'x3', label: '×3', fn: x => x * 3, psKey: 'square' },
    { id: 'div2', label: '÷2', fn: x => Math.trunc(x / 2), psKey: 'square' },
    { id: 'sq', label: 'X²', fn: x => Math.min(999, x * x), psKey: 'square' },
    { id: 'neg', label: '-X', fn: x => -x, psKey: 'circle' }
];

window.DEFAULT_SANDBOX_CONFIG = {
    buttonOps: ['+1', '-1', 'x2', 'reset'], // Mapped to ✕, ◯, ▢, △
    mathMode: 'algebra', // 'numbers' | 'arithmetic' | 'algebra' | 'chaos'
    playerSpeed: 6.0,
    beamRange: 450,
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
        cost: 20,
        color: '#00f3ff',
        icon: 'fa-bolt',
        desc: 'صاعقة نيون تلقائية ضد الوحوش ذات الناتج الزوجي',
        maxHp: 150
    },
    {
        id: 'odd_turret',
        name: 'برج الفردي',
        formula: '2n+1',
        cost: 20,
        color: '#ff007f',
        icon: 'fa-fire-flame-curved',
        desc: 'صاعقة نيون تلقائية ضد الوحوش ذات الناتج الفردي',
        maxHp: 150
    },
    {
        id: 'mod3_coil',
        name: 'وشيعة القواسم',
        formula: '3n',
        cost: 30,
        color: '#ffb800',
        icon: 'fa-tower-broadcast',
        desc: 'صاعقة متسلسلة للوحوش التي تقبل القسمة على 3',
        maxHp: 160
    },
    {
        id: 'sine_healer',
        name: 'مولد الجيب',
        formula: 'sin(t)',
        cost: 35,
        color: '#00ff88',
        icon: 'fa-wave-square',
        desc: 'يشفي درع المركبة بأمواج جيبية متناغمة',
        maxHp: 180
    },
    {
        id: 'matrix_wall',
        name: 'جدار المصفوفة',
        formula: '[M]',
        cost: 10,
        color: '#b537f2',
        icon: 'fa-border-all',
        desc: 'حاجز صلب يصد الوحوش ويعكس 80% من الضرر',
        maxHp: 350
    }
];

window.WORLD_SIZE = 2600;
window.GRID_SIZE = 65;
