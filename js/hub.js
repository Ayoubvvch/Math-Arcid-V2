/**
 * Math Arcade - PlayStation 5 Style Console Hub Controller
 * Cinematic boot sequence, zero-scroll horizontal game launcher,
 * smooth DualSense / Xbox / Keyboard navigation with zero dropped inputs.
 */

import { sound } from '../shared/retro-audio.js';
import { gamepad } from '../shared/gamepad.js';

function getGameArtworkSVG(game) {
  const accent = game.accentColor || '#00e5ff';

  if (game.id === 'mathcore-survivor') {
    return `
      <svg class="tile-svg" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="mcGlow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stop-color="#00f3ff" stop-opacity="0.32" />
            <stop offset="100%" stop-color="#060914" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="#070c1a" />
        <circle cx="160" cy="100" r="85" fill="url(#mcGlow)" />
        <circle cx="160" cy="100" r="56" fill="none" stroke="#00f3ff" stroke-opacity="0.28" stroke-dasharray="6 6" stroke-width="1.5" />
        <circle cx="160" cy="100" r="28" fill="#09152e" stroke="#00f3ff" stroke-width="2.5" />
        <text x="160" y="106" text-anchor="middle" fill="#ffffff" font-family="JetBrains Mono, monospace" font-weight="800" font-size="16">X=n</text>
        <path d="M72 58 L134 88 M248 142 L186 112" stroke="#00ff88" stroke-width="2" stroke-linecap="round" stroke-opacity="0.85" />
        <polygon points="72,44 86,68 58,68" fill="none" stroke="#ff007f" stroke-width="2.2" />
        <rect x="234" y="128" width="26" height="26" rx="4" fill="none" stroke="#ffb800" stroke-width="2.2" />
        <text x="247" y="54" text-anchor="middle" fill="#00e5ff" font-family="JetBrains Mono, monospace" font-weight="800" font-size="14">✕ ◯ ▢ △</text>
      </svg>
    `;
  }

  if (game.id === 'math-battle') {
    return `
      <svg class="tile-svg" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="mbGlow" cx="55%" cy="48%" r="55%">
            <stop offset="0%" stop-color="#b537f2" stop-opacity="0.34" />
            <stop offset="100%" stop-color="#070914" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="#090714" />
        <circle cx="165" cy="98" r="88" fill="url(#mbGlow)" />
        <line x1="40" y1="100" x2="280" y2="100" stroke="#ffffff" stroke-opacity="0.14" stroke-width="1" />
        <line x1="160" y1="24" x2="160" y2="176" stroke="#ffffff" stroke-opacity="0.14" stroke-width="1" />
        <path d="M46 155 Q 115 30, 175 100 T 274 45" fill="none" stroke="#ff5500" stroke-width="2.5" stroke-opacity="0.85" />
        <circle cx="105" cy="122" r="19" fill="#001524" stroke="#00f0ff" stroke-width="2.5" />
        <text x="105" y="127" text-anchor="middle" fill="#00f0ff" font-family="Cambria Math, Georgia, serif" font-style="italic" font-weight="700" font-size="14">d/dx</text>
        <circle cx="222" cy="76" r="24" fill="#1b071e" stroke="#ff5500" stroke-width="2.5" />
        <text x="222" y="83" text-anchor="middle" fill="#ff5500" font-family="Cambria Math, Georgia, serif" font-style="italic" font-weight="700" font-size="20">x³</text>
        <text x="255" y="152" text-anchor="middle" fill="#10b981" font-family="JetBrains Mono, monospace" font-weight="800" font-size="13">→ 0</text>
      </svg>
    `;
  }

  if (game.id === 'asymptote-asylum') {
    return `
      <svg class="tile-svg" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="aaGlow" cx="50%" cy="52%" r="55%">
            <stop offset="0%" stop-color="#ef4444" stop-opacity="0.38" />
            <stop offset="100%" stop-color="#050205" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="#070204" />
        <circle cx="160" cy="104" r="92" fill="url(#aaGlow)" />
        <circle cx="160" cy="100" r="54" fill="none" stroke="#dc2626" stroke-width="2" stroke-opacity="0.55" />
        <circle cx="160" cy="100" r="38" fill="none" stroke="#991b1b" stroke-dasharray="6 5" stroke-width="1.5" />
        <path d="M46 156 Q 112 130 160 88 T 274 36" fill="none" stroke="#38bdf8" stroke-width="2.4" />
        <line x1="78" y1="146" x2="246" y2="30" stroke="#fbbf24" stroke-dasharray="5 4" stroke-width="1.8" />
        <circle cx="160" cy="88" r="5" fill="#fbbf24" />
        <ellipse cx="92" cy="148" rx="18" ry="8" fill="#7f1d1d" fill-opacity="0.8" />
        <ellipse cx="242" cy="146" rx="22" ry="10" fill="#991b1b" fill-opacity="0.72" />
        <circle cx="240" cy="70" r="3.2" fill="#ff2a2a" />
        <circle cx="252" cy="70" r="3.2" fill="#ff2a2a" />
        <text x="160" y="166" text-anchor="middle" fill="#fecaca" font-family="JetBrains Mono, monospace" font-weight="800" font-size="13">f'(x₀) — 23..38</text>
      </svg>
    `;
  }

  if (game.id === 'sequence-strider') {
    return `
      <svg class="tile-svg" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="ssGlow" cx="55%" cy="48%" r="55%">
            <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.34" />
            <stop offset="100%" stop-color="#030712" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="#040916" />
        <circle cx="176" cy="96" r="88" fill="url(#ssGlow)" />
        <line x1="40" y1="36" x2="280" y2="36" stroke="#fb7185" stroke-dasharray="6 4" stroke-width="1.5" />
        <line x1="40" y1="164" x2="280" y2="164" stroke="#fb7185" stroke-dasharray="6 4" stroke-width="1.5" />
        <line x1="45" y1="160" x2="275" y2="42" stroke="#94a3b8" stroke-dasharray="4 4" stroke-width="1.4" />
        <path d="M46 155 Q 130 92, 272 52" fill="none" stroke="#38bdf8" stroke-width="2.5" />
        <polyline points="82,160 82,124 118,124 118,104 156,104 156,88 214,72" fill="none" stroke="#fbbf24" stroke-width="1.8" />
        <circle cx="214" cy="72" r="6" fill="#10b981" />
        <text x="160" y="182" text-anchor="middle" fill="#bae6fd" font-family="JetBrains Mono, monospace" font-weight="800" font-size="12">uₙ₊₁ = f(uₙ) → L (39..50)</text>
      </svg>
    `;
  }

  if (game.id === 'complex-plane-duel') {
    return `
      <svg class="tile-svg" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="cpGlow" cx="50%" cy="48%" r="55%">
            <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.34" />
            <stop offset="100%" stop-color="#040714" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="#040714" />
        <circle cx="160" cy="96" r="88" fill="url(#cpGlow)" />
        <line x1="40" y1="96" x2="280" y2="96" stroke="#fbbf24" stroke-opacity="0.35" stroke-width="1.5" />
        <line x1="160" y1="18" x2="160" y2="168" stroke="#fbbf24" stroke-opacity="0.35" stroke-width="1.5" />
        <circle cx="160" cy="96" r="54" fill="none" stroke="#38bdf8" stroke-opacity="0.65" stroke-width="2" />
        <polygon points="214,96 187,49 133,49 106,96 133,143 187,143" fill="none" stroke="#34d399" stroke-dasharray="5 4" stroke-width="1.6" />
        <line x1="160" y1="96" x2="207" y2="69" stroke="#fbbf24" stroke-width="2.6" />
        <line x1="160" y1="96" x2="207" y2="123" stroke="#f43f5e" stroke-dasharray="4 4" stroke-width="1.8" />
        <circle cx="207" cy="69" r="5.5" fill="#fbbf24" />
        <circle cx="207" cy="123" r="4.5" fill="#f43f5e" />
        <text x="234" y="66" text-anchor="middle" fill="#fde68a" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11">M(z)</text>
        <text x="234" y="130" text-anchor="middle" fill="#fda4af" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11">M̄(z̄)</text>
        <text x="160" y="184" text-anchor="middle" fill="#fef3c7" font-family="JetBrains Mono, monospace" font-weight="800" font-size="12">z = r·e^{iθ} ∈ ℂ (51..64)</text>
      </svg>
    `;
  }

  if (game.id === 'limit-abyss') {
    return `
      <svg class="tile-svg" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="abyssGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stop-color="#00f3ff" stop-opacity="0.32" />
            <stop offset="60%" stop-color="#0284c7" stop-opacity="0.12" />
            <stop offset="100%" stop-color="#01040a" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="#01040a" />
        <circle cx="160" cy="95" r="88" fill="url(#abyssGlow)" />
        <!-- Sonar Concentric Rings -->
        <circle cx="160" cy="95" r="76" fill="none" stroke="#00f3ff" stroke-opacity="0.22" stroke-width="1.2" stroke-dasharray="4 6" />
        <circle cx="160" cy="95" r="48" fill="none" stroke="#00f3ff" stroke-opacity="0.35" stroke-width="1.5" />
        <circle cx="160" cy="95" r="22" fill="none" stroke="#38bdf8" stroke-opacity="0.55" stroke-width="1.8" />
        <!-- Light cones from submarine -->
        <polygon points="160,95 270,40 270,150" fill="#00f3ff" fill-opacity="0.12" />
        <!-- Submarine Silhouette -->
        <ellipse cx="160" cy="95" rx="22" ry="12" fill="#0369a1" stroke="#00f3ff" stroke-width="2" />
        <circle cx="168" cy="95" r="4.5" fill="#38bdf8" />
        <rect x="156" y="80" width="7" height="4" fill="#0284c7" />
        <!-- Discontinuity Curve & Hole -->
        <path d="M 50 145 Q 110 90, 150 90" fill="none" stroke="#10b981" stroke-width="2.2" />
        <path d="M 170 90 Q 210 90, 270 50" fill="none" stroke="#10b981" stroke-width="2.2" />
        <circle cx="160" cy="90" r="4" fill="#01040a" stroke="#f59e0b" stroke-width="2" />
        <!-- Math Indicators -->
        <text x="75" y="42" fill="#38bdf8" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">TVI: f(a)·f(b)&lt;0</text>
        <text x="245" y="42" fill="#f472b6" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">f⁻¹(x) ↔ y=x</text>
        <text x="160" y="184" text-anchor="middle" fill="#bae6fd" font-family="JetBrains Mono, monospace" font-weight="800" font-size="12">lim_{x→x₀} f(x) = L (1..22)</text>
      </svg>
    `;
  }

  if (game.id === 'logarithm-reactor') {
    return `
      <svg class="tile-svg" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="lrGlow" cx="50%" cy="50%" r="58%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.34" />
            <stop offset="55%" stop-color="#84cc16" stop-opacity="0.12" />
            <stop offset="100%" stop-color="#03090c" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="#03090c" />
        <circle cx="160" cy="98" r="90" fill="url(#lrGlow)" />
        <!-- Containment Reactor Rings -->
        <circle cx="160" cy="98" r="66" fill="none" stroke="#10b981" stroke-opacity="0.28" stroke-dasharray="7 5" stroke-width="1.6" />
        <circle cx="160" cy="98" r="44" fill="none" stroke="#a855f7" stroke-opacity="0.35" stroke-width="1.5" />
        <!-- Axes & Symmetry Line y=x -->
        <line x1="48" y1="98" x2="272" y2="98" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1" />
        <line x1="160" y1="22" x2="160" y2="170" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1" />
        <line x1="72" y1="168" x2="248" y2="28" stroke="#94a3b8" stroke-dasharray="4 4" stroke-width="1.3" />
        <!-- Exponential Curve e^x -->
        <path d="M 65 94 Q 145 92, 180 62 T 212 24" fill="none" stroke="#f59e0b" stroke-width="2.6" />
        <!-- Logarithm Curve ln(x) -->
        <path d="M 164 166 Q 170 98, 212 72 T 268 48" fill="none" stroke="#10b981" stroke-width="2.6" />
        <!-- Key Points (0,1) and (1,0) -->
        <circle cx="160" cy="76" r="4.5" fill="#fbbf24" />
        <circle cx="182" cy="98" r="4.5" fill="#34d399" />
        <text x="128" y="66" fill="#fde68a" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11">eˣ</text>
        <text x="242" y="42" fill="#6ee7b7" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11">ln(x)</text>
        <text x="88" y="42" fill="#e9d5ff" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">eˣ ≫ xⁿ ≫ ln x</text>
        <text x="160" y="185" text-anchor="middle" fill="#a7f3d0" font-family="JetBrains Mono, monospace" font-weight="800" font-size="12">(ln|u|)' = u'/u | (65..78)</text>
      </svg>
    `;
  }

  if (game.id === 'integral-forge') {
    return `
      <svg class="tile-svg" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="ifGlow" cx="50%" cy="52%" r="58%">
            <stop offset="0%" stop-color="#f97316" stop-opacity="0.36" />
            <stop offset="55%" stop-color="#f59e0b" stop-opacity="0.14" />
            <stop offset="100%" stop-color="#090605" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="#090605" />
        <circle cx="160" cy="100" r="92" fill="url(#ifGlow)" />
        <!-- Axes -->
        <line x1="36" y1="122" x2="284" y2="122" stroke="#ffffff" stroke-opacity="0.26" stroke-width="1.2" />
        <line x1="78" y1="24" x2="78" y2="168" stroke="#ffffff" stroke-opacity="0.22" stroke-width="1.2" />
        <!-- Shaded Definite Integral Area & Revolution Disc -->
        <path d="M 105 122 L 105 90 Q 150 42, 215 62 L 215 122 Z" fill="#f97316" fill-opacity="0.28" />
        <path d="M 105 122 L 105 154 Q 150 176, 215 158 L 215 122 Z" fill="#38bdf8" fill-opacity="0.14" />
        <!-- Boundary Verticals x=a, x=b -->
        <line x1="105" y1="56" x2="105" y2="156" stroke="#fde047" stroke-dasharray="4 3" stroke-width="1.3" />
        <line x1="215" y1="50" x2="215" y2="160" stroke="#fde047" stroke-dasharray="4 3" stroke-width="1.3" />
        <!-- Revolution Cross-Section Ellipse -->
        <ellipse cx="215" cy="122" rx="10" ry="38" fill="none" stroke="#38bdf8" stroke-width="2" />
        <ellipse cx="160" cy="122" rx="8" ry="44" fill="none" stroke="#fbbf24" stroke-opacity="0.55" stroke-dasharray="3 3" stroke-width="1.4" />
        <!-- Curves f(x) and Harmonic ODE Wave -->
        <path d="M 48 106 Q 145 24, 268 78" fill="none" stroke="#fb923c" stroke-width="2.8" />
        <path d="M 48 136 Q 90 104, 130 136 T 212 136 T 276 122" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-opacity="0.85" />
        <!-- Heavy Integral Glyph -->
        <text x="52" y="70" fill="#fde047" font-family="Cambria Math, serif" font-weight="900" font-size="36">∫</text>
        <text x="160" y="34" text-anchor="middle" fill="#fed7aa" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10.5">V = π ∫ (f(x))² dx  |  y'' + ω²y = 0</text>
        <text x="105" y="170" text-anchor="middle" fill="#fde047" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">a</text>
        <text x="215" y="170" text-anchor="middle" fill="#fde047" font-family="JetBrains Mono, monospace" font-weight="700" font-size="10">b</text>
        <text x="160" y="188" text-anchor="middle" fill="#fbbf24" font-family="JetBrains Mono, monospace" font-weight="800" font-size="12">∫_a^b f(x)dx &amp; EDO | (79..90)</text>
      </svg>
    `;
  }

  if (game.id === 'vector-odyssey') {
    return `
      <svg class="tile-svg" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="320" height="200" fill="#040817" />
        <g stroke="#38bdf8" stroke-opacity="0.16" stroke-width="1">
          <line x1="20" y1="150" x2="300" y2="150" /><line x1="20" y1="120" x2="300" y2="120" />
          <line x1="65" y1="25" x2="65" y2="180" /><line x1="255" y1="25" x2="255" y2="180" />
        </g>
        <!-- 3D Coordinate Axes O, i, j, k -->
        <g stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="3 3">
          <line x1="78" y1="138" x2="78" y2="48" />
          <line x1="78" y1="138" x2="220" y2="138" />
          <line x1="78" y1="138" x2="42" y2="168" />
        </g>
        <!-- Tilted Plane (P) and Wireframe Sphere (S) -->
        <polygon points="82,118 242,118 212,150 52,150" fill="#38bdf8" fill-opacity="0.14" stroke="#7dd3fc" stroke-width="1.5" />
        <circle cx="164" cy="96" r="46" fill="#818cf8" fill-opacity="0.14" stroke="#a78bfa" stroke-width="2.2" />
        <ellipse cx="164" cy="96" rx="46" ry="15" fill="none" stroke="#c4b5fd" stroke-opacity="0.55" stroke-width="1.2" stroke-dasharray="4 3" />
        <!-- Section Circle (C) = (S) ∩ (P) -->
        <ellipse cx="164" cy="126" rx="34" ry="11" fill="#4ade80" fill-opacity="0.18" stroke="#4ade80" stroke-width="2" />
        <!-- Cross-Product Normal Vector u ∧ v -->
        <line x1="164" y1="126" x2="164" y2="30" stroke="#fbbf24" stroke-width="2.4" />
        <polygon points="164,22 159,34 169,34" fill="#fbbf24" />
        <line x1="164" y1="96" x2="198" y2="126" stroke="#f472b6" stroke-width="1.6" stroke-dasharray="3 2" />
        <!-- Markers Omega, H, Starfighter silhouette -->
        <circle cx="164" cy="96" r="3.4" fill="#fbbf24" />
        <circle cx="164" cy="126" r="3.2" fill="#4ade80" />
        <polygon points="274,64 252,54 258,64 252,74" fill="#38bdf8" stroke="#e0f2fe" stroke-width="1.2" />
        <text x="176" y="42" fill="#fde047" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11">u ∧ v</text>
        <text x="150" y="92" fill="#fde047" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11">Ω</text>
        <text x="206" y="138" fill="#4ade80" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10">H | r²=R²-d²</text>
        <text x="160" y="188" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11.5">(S) ∩ (P) &amp; d(Ω,(P)) | ℝ³ (91..102)</text>
      </svg>
    `;
  }

  if (game.id === 'quantum-casino') {
    return `
      <svg class="tile-svg" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="qcGlow" cx="50%" cy="48%" r="58%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.34" />
            <stop offset="55%" stop-color="#fbbf24" stop-opacity="0.14" />
            <stop offset="100%" stop-color="#030907" stop-opacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="200" fill="#030907" />
        <circle cx="160" cy="96" r="90" fill="url(#qcGlow)" />
        <!-- Roulette Ring -->
        <circle cx="160" cy="94" r="64" fill="none" stroke="#fbbf24" stroke-opacity="0.32" stroke-dasharray="6 5" stroke-width="1.6" />
        <circle cx="160" cy="94" r="46" fill="none" stroke="#34d399" stroke-opacity="0.45" stroke-width="1.6" />
        <!-- Weighted Probability Tree -->
        <g stroke="#34d399" stroke-width="1.8">
          <line x1="50" y1="94" x2="112" y2="58" />
          <line x1="50" y1="94" x2="112" y2="130" />
          <line x1="112" y1="58" x2="162" y2="42" />
          <line x1="112" y1="58" x2="162" y2="74" />
        </g>
        <circle cx="50" cy="94" r="4" fill="#fbbf24" />
        <circle cx="112" cy="58" r="3.5" fill="#34d399" />
        <circle cx="112" cy="130" r="3.5" fill="#f43f5e" />
        <!-- Binomial Distribution B(n,p) Bars -->
        <rect x="192" y="106" width="14" height="32" rx="2" fill="#a855f7" fill-opacity="0.82" />
        <rect x="212" y="78" width="14" height="60" rx="2" fill="#fbbf24" fill-opacity="0.92" />
        <rect x="232" y="64" width="14" height="74" rx="2" fill="#34d399" fill-opacity="0.92" />
        <rect x="252" y="92" width="14" height="46" rx="2" fill="#22d3ee" fill-opacity="0.82" />
        <rect x="272" y="118" width="14" height="20" rx="2" fill="#a855f7" fill-opacity="0.72" />
        <!-- Card & Dice Accents -->
        <text x="90" y="112" fill="#34d399" font-family="JetBrains Mono, monospace" font-weight="900" font-size="16">♠</text>
        <text x="164" y="104" fill="#fde047" font-family="JetBrains Mono, monospace" font-weight="900" font-size="11">P_A(B)</text>
        <text x="239" y="52" text-anchor="middle" fill="#fde68a" font-family="JetBrains Mono, monospace" font-weight="800" font-size="10.5">B(n,p) | E=np</text>
        <text x="160" y="185" text-anchor="middle" fill="#a7f3d0" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11.5">Cₙᵖ, Aₙᵖ &amp; P(X=k) | (103..114)</text>
      </svg>
    `;
  }

  return `
    <svg class="tile-svg" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="320" height="200" fill="#070c18" />
      <circle cx="160" cy="100" r="46" fill="none" stroke="${accent}" stroke-opacity="0.45" stroke-width="2" />
      <text x="160" y="114" text-anchor="middle" fill="#ffffff" font-family="Cambria Math, serif" font-size="48" font-weight="700">${game.icon || '∫'}</text>
    </svg>
  `;
}

function formatControlEntry(text) {
  const idx = text.indexOf(':');
  if (idx === -1) return { key: 'INPUT', desc: text };
  return {
    key: text.slice(0, idx).trim(),
    desc: text.slice(idx + 1).trim(),
  };
}

class ArcadeConsoleHub {
  constructor() {
    this.games = [];
    this.filteredGames = [];
    this.activeCategory = 'All';
    this.searchQuery = '';
    this.smartReviewOnly = false;
    this.selectedIndex = 0;

    // Reset double-confirm safety state
    this.resetConfirmArmed = false;
    this.resetConfirmTimer = null;

    // Navigation state: 'rail' | 'actions' | 'modal'
    this.navZone = 'rail';
    this.actionIndex = 0;
    this.modalFocusIndex = 0;
    this.bootDismissed = false;
    this.isLaunching = false;

    // Gamepad repeat timing (kept separate from face button presses so buttons NEVER get dropped!)
    this.nextDirRepeatAt = 0;
    this.lastDirVector = null;

    // DOM Cache
    this.bootOverlay = document.getElementById('ps5-boot');
    this.consoleShell = document.getElementById('console-shell');
    this.launchCurtain = document.getElementById('launch-curtain');
    this.launchIcon = document.getElementById('launch-icon');
    this.launchLabel = document.getElementById('launch-label');

    this.rail = document.getElementById('games-rail');
    this.consoleMain = document.querySelector('.console-main');
    this.categoryTabs = document.getElementById('category-tabs');
    this.railStatusText = document.getElementById('rail-filter-status');
    this.statsCounter = document.getElementById('stats-counter');

    this.showcase = document.getElementById('ps5-showcase');
    this.showcaseCategory = document.getElementById('showcase-category');
    this.showcaseDiff = document.getElementById('showcase-difficulty');
    this.showcaseVersion = document.getElementById('showcase-version');
    this.showcaseStatus = document.getElementById('showcase-status');
    this.showcaseTitle = document.getElementById('showcase-title');
    this.showcaseDesc = document.getElementById('showcase-desc');
    this.showcaseConcepts = document.getElementById('showcase-concepts');
    this.showcaseControls = document.getElementById('showcase-controls');
    this.blueprintArtBadge = document.getElementById('blueprint-art-badge');
    this.ambientPrimary = document.getElementById('ambient-glow-primary');

    this.btnPlaySelected = document.getElementById('btn-play-selected');
    this.btnInfoSelected = document.getElementById('btn-info-selected');
    this.btnProgressModal = document.getElementById('btn-progress-modal');
    this.topbarMasteryText = document.getElementById('topbar-mastery-text');
    this.btnSmartReview = document.getElementById('btn-smart-review');
    this.smartReviewCount = document.getElementById('smart-review-count');

    this.showcaseMasteryArc = document.getElementById('showcase-mastery-arc');
    this.showcaseMasteryPct = document.getElementById('showcase-mastery-pct');
    this.showcaseTelemetryRank = document.getElementById('showcase-telemetry-rank');
    this.showcaseTelemetrySeals = document.getElementById('showcase-telemetry-seals');
    this.showcaseTelemetryBoss = document.getElementById('showcase-telemetry-boss');
    this.showcaseTelemetryAcc = document.getElementById('showcase-telemetry-acc');
    this.showcaseWeakPill = document.getElementById('showcase-weak-pill');

    this.searchModal = document.getElementById('search-modal');
    this.gameModal = document.getElementById('game-modal');
    this.guideModal = document.getElementById('guide-modal');
    this.progressModal = document.getElementById('progress-modal');
    this.progressImportFile = document.getElementById('progress-import-file');
    this.searchInput = document.getElementById('search-input');

    this.controllerPill = document.getElementById('controller-pill');
    this.controllerLabel = document.getElementById('controller-label');
    this.soundToggleBtn = document.getElementById('sound-toggle');
    this.soundIcon = document.getElementById('sound-icon');
    this.soundLabel = document.getElementById('sound-label');
    this.clockEl = document.getElementById('console-clock');

    this.init();
  }

  async init() {
    this.startClock();
    this.setupBootSequence();
    this.bindEvents();
    this.initGamepad();
    await this.loadGames();
    this.renderCategories();
    this.renderTelemetrySummary();
    this.applyFilters();
    this.startLoop();
  }

  setupBootSequence() {
    const params = new URLSearchParams(window.location.search);
    const returningFromGame = params.get('from') === 'game' || (document.referrer && document.referrer.includes('/games/'));

    if (returningFromGame && this.bootOverlay) {
      // Fast console wake when coming back from a game (no waiting annoyance!)
      this.bootDismissed = true;
      this.bootOverlay.classList.add('boot-hidden');
      requestAnimationFrame(() => {
        this.consoleShell?.classList.add('ready');
      });
      if (params.has('from')) {
        window.history.replaceState({}, '', window.location.pathname);
      }
      return;
    }

    // Grand cinematic boot reveal (auto completes at 1.4s, skippable anytime)
    const finishBoot = () => this.dismissBoot();
    this.bootTimer = setTimeout(finishBoot, 1400);

    this.bootOverlay?.addEventListener('click', () => {
      sound.init();
      sound.playConsoleBoot();
      this.dismissBoot();
    }, { once: true });
  }

  dismissBoot() {
    if (this.bootDismissed) return;
    this.bootDismissed = true;
    clearTimeout(this.bootTimer);

    if (this.bootOverlay) {
      this.bootOverlay.classList.add('boot-exit');
      setTimeout(() => {
        this.bootOverlay?.classList.add('boot-hidden');
      }, 460);
    }

    requestAnimationFrame(() => {
      this.consoleShell?.classList.add('ready');
    });
  }

  startClock() {
    const update = () => {
      if (!this.clockEl) return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      this.clockEl.textContent = `${hh}:${mm}`;
    };
    update();
    setInterval(update, 15000);
  }

  async loadGames() {
    const subjectOrder = { math: 1, physics: 2, chemistry: 3, pc: 4 };
    try {
      const response = await fetch('games.json?t=' + Date.now());
      if (!response.ok) throw new Error('Failed to load games.json');
      const rawGames = await response.json();
      this.games = (Array.isArray(rawGames) ? rawGames : []).slice().sort((a, b) => {
        const sa = subjectOrder[a.subject || 'math'] || 99;
        const sb = subjectOrder[b.subject || 'math'] || 99;
        if (sa !== sb) return sa - sb;
        const oa = typeof a.order === 'number' ? a.order : 9999;
        const ob = typeof b.order === 'number' ? b.order : 9999;
        if (oa !== ob) return oa - ob;
        const ta = typeof a.topicStart === 'number' ? a.topicStart : 9999;
        const tb = typeof b.topicStart === 'number' ? b.topicStart : 9999;
        return ta - tb;
      });
    } catch (err) {
      console.error('Error loading game catalog:', err);
      this.games = [];
    }
  }

  bindEvents() {
    // Unlock Web Audio cleanly on first pointer/key interaction
    const unlockAudio = () => {
      sound.init();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio, { passive: true });

    // Top bar triggers
    document.getElementById('btn-search-trigger')?.addEventListener('click', () => {
      sound.playClick();
      this.openSearchModal();
    });

    document.getElementById('btn-add-game-guide')?.addEventListener('click', () => {
      sound.playClick();
      this.openGuideModal();
    });

    this.btnProgressModal?.addEventListener('click', () => {
      sound.playClick();
      this.openProgressModal();
    });

    this.btnSmartReview?.addEventListener('click', () => {
      this.toggleSmartReview();
    });

    this.soundToggleBtn?.addEventListener('click', () => {
      this.toggleAudio();
    });

    // Showcase CTA buttons
    this.btnPlaySelected?.addEventListener('click', () => {
      this.launchSelectedGame();
    });

    this.btnInfoSelected?.addEventListener('click', () => {
      const game = this.filteredGames[this.selectedIndex];
      if (game) {
        sound.playClick();
        this.openGameModal(game);
      }
    });

    // Search input live filter
    this.searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.applyFilters();
    });

    document.getElementById('btn-clear-search')?.addEventListener('click', () => {
      sound.playClick();
      this.searchQuery = '';
      if (this.searchInput) this.searchInput.value = '';
      this.applyFilters();
    });

    document.querySelectorAll('.quick-tag-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.playNavTick();
        const q = btn.getAttribute('data-query') || '';
        this.searchQuery = q;
        if (this.searchInput) this.searchInput.value = q;
        this.applyFilters();
        this.closeModals();
      });
    });

    // Modal close buttons & backdrop clicks
    document.getElementById('btn-close-search')?.addEventListener('click', () => this.closeModals());
    document.getElementById('btn-close-game-modal')?.addEventListener('click', () => this.closeModals());
    document.getElementById('btn-close-guide-modal')?.addEventListener('click', () => this.closeModals());
    document.getElementById('btn-guide-done')?.addEventListener('click', () => this.closeModals());
    document.getElementById('btn-close-progress-modal')?.addEventListener('click', () => this.closeModals());
    document.getElementById('btn-progress-done')?.addEventListener('click', () => this.closeModals());

    document.getElementById('btn-export-progress')?.addEventListener('click', () => this.exportProgressBackup());
    document.getElementById('btn-import-progress')?.addEventListener('click', () => {
      sound.playClick();
      this.progressImportFile?.click();
    });
    this.progressImportFile?.addEventListener('change', (e) => {
      const file = e.target?.files?.[0];
      if (file) this.importProgressBackup(file);
      if (e.target) e.target.value = '';
    });
    document.getElementById('btn-reset-progress')?.addEventListener('click', () => this.handleResetProgressClick());

    [this.searchModal, this.gameModal, this.guideModal, this.progressModal].forEach((overlay) => {
      overlay?.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeModals();
      });
    });

    // Refresh live telemetry when returning cleanly from a game via bfcache
    window.addEventListener('pageshow', () => {
      if (this.games.length > 0) {
        this.renderTelemetrySummary();
        this.applyFilters();
      }
    });

    // Full Keyboard PS5-style Controls
    window.addEventListener('keydown', (e) => {
      if (!this.bootDismissed) {
        if (['Enter', 'Space', 'Escape', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
          sound.playConsoleBoot();
          this.dismissBoot();
        }
        return;
      }

      const isTyping = document.activeElement === this.searchInput;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (this.getActiveModal()) {
          this.closeModals();
        } else if (this.searchQuery) {
          this.searchQuery = '';
          if (this.searchInput) this.searchInput.value = '';
          this.applyFilters();
        }
        return;
      }

      if (isTyping) {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.closeModals();
        }
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        this.openSearchModal();
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        this.toggleAudio();
        return;
      }

      if (e.key === 'i' || e.key === 'I') {
        const g = this.filteredGames[this.selectedIndex];
        if (g) this.openGameModal(g);
        return;
      }

      if (e.key === 'g' || e.key === 'G') {
        this.openGuideModal();
        return;
      }

      if (e.key === 'p' || e.key === 'P') {
        if (this.getActiveModal() === this.progressModal) {
          this.closeModals();
        } else {
          sound.playClick();
          this.openProgressModal();
        }
        return;
      }

      if (e.key === 'r' || e.key === 'R') {
        if (!this.getActiveModal()) {
          this.toggleSmartReview();
        }
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        this.cycleCategories(e.shiftKey ? -1 : 1);
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        this.handleDirection('right');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        this.handleDirection('left');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        this.handleDirection('down');
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        this.handleDirection('up');
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.handleConfirm();
      }
    });
  }

  toggleAudio() {
    const isMuted = sound.toggleMute();
    if (this.soundIcon) this.soundIcon.textContent = isMuted ? '🔇' : '🔊';
    if (this.soundLabel) this.soundLabel.textContent = isMuted ? 'صامت' : 'الصوت';
    if (!isMuted) sound.playClick();
  }

  initGamepad() {
    const updateBadge = (connected) => {
      if (!this.controllerPill || !this.controllerLabel) return;
      if (connected) {
        this.controllerPill.classList.add('connected');
        this.controllerLabel.textContent = gamepad.getControllerType();
      } else {
        this.controllerPill.classList.remove('connected');
        this.controllerLabel.textContent = 'لوحة المفاتيح';
      }
    };

    gamepad.onConnect = () => {
      updateBadge(true);
      sound.playConsoleBoot();
      gamepad.triggerHaptic(70, 0.35, 0.35);
    };

    gamepad.onDisconnect = () => {
      updateBadge(false);
    };
  }

  startLoop() {
    const loop = (timestamp) => {
      this.updateGamepad(timestamp);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  updateGamepad(timestamp) {
    const connected = gamepad.poll();
    if (!connected) return;

    if (this.controllerPill && !this.controllerPill.classList.contains('connected')) {
      this.controllerPill.classList.add('connected');
      if (this.controllerLabel) this.controllerLabel.textContent = gamepad.getControllerType();
    }

    // Skip boot immediately on any controller input
    if (!this.bootDismissed) {
      if (gamepad.isAnyJustPressed() || Math.abs(gamepad.axes.leftX) > 0.5 || Math.abs(gamepad.axes.leftY) > 0.5) {
        sound.init();
        sound.playConsoleBoot();
        this.dismissBoot();
      }
      return;
    }

    // 1. Face & Shoulder Buttons (Edge-triggered, NEVER blocked by directional cooldown!)
    if (gamepad.isJustPressed('cross')) {
      this.handleConfirm();
      gamepad.triggerHaptic(55, 0.45, 0.45);
    }

    if (gamepad.isJustPressed('circle')) {
      this.handleBack();
      gamepad.triggerHaptic(40, 0.25, 0.25);
    }

    if (gamepad.isJustPressed('square')) {
      if (this.getActiveModal() === this.gameModal) {
        this.closeModals();
      } else {
        const game = this.filteredGames[this.selectedIndex];
        if (game) {
          sound.playClick();
          this.openGameModal(game);
        }
      }
      gamepad.triggerHaptic(40, 0.25, 0.25);
    }

    if (gamepad.isJustPressed('triangle')) {
      if (this.getActiveModal() === this.searchModal) {
        this.closeModals();
      } else {
        sound.playClick();
        this.openSearchModal();
      }
      gamepad.triggerHaptic(40, 0.25, 0.25);
    }

    if (gamepad.isJustPressed('l1')) {
      this.cycleCategories(-1);
      gamepad.triggerHaptic(35, 0.2, 0.2);
    }

    if (gamepad.isJustPressed('r1')) {
      this.cycleCategories(1);
      gamepad.triggerHaptic(35, 0.2, 0.2);
    }

    if (gamepad.isJustPressed('start')) {
      this.toggleAudio();
      gamepad.triggerHaptic(35, 0.2, 0.2);
    }

    if (gamepad.isJustPressed('select')) {
      if (this.getActiveModal() === this.guideModal) {
        this.closeModals();
      } else {
        sound.playClick();
        this.openGuideModal();
      }
    }

    const l2Edge = gamepad.buttons.l2 > 0.5 && !(gamepad.prevButtons.l2 > 0.5);
    if (l2Edge && !this.getActiveModal()) {
      this.toggleSmartReview();
      gamepad.triggerHaptic(35, 0.25, 0.25);
    }

    const r2Edge = gamepad.buttons.r2 > 0.5 && !(gamepad.prevButtons.r2 > 0.5);
    if (r2Edge) {
      if (this.getActiveModal() === this.progressModal) {
        this.closeModals();
      } else {
        sound.playClick();
        this.openProgressModal();
      }
      gamepad.triggerHaptic(35, 0.25, 0.25);
    }

    // 2. Directional Input with Initial Delay + Smooth Repeat
    const lx = gamepad.axes.leftX;
    const ly = gamepad.axes.leftY;
    let dir = null;

    if (gamepad.buttons.dpadLeft || lx < -0.5) dir = 'left';
    else if (gamepad.buttons.dpadRight || lx > 0.5) dir = 'right';
    else if (gamepad.buttons.dpadUp || ly < -0.5) dir = 'up';
    else if (gamepad.buttons.dpadDown || ly > 0.5) dir = 'down';

    if (!dir) {
      this.lastDirVector = null;
      this.nextDirRepeatAt = 0;
      return;
    }

    if (dir !== this.lastDirVector) {
      this.lastDirVector = dir;
      this.nextDirRepeatAt = timestamp + 270;
      this.handleDirection(dir);
      gamepad.triggerHaptic(28, 0.18, 0.18);
    } else if (timestamp >= this.nextDirRepeatAt) {
      this.nextDirRepeatAt = timestamp + 115;
      this.handleDirection(dir);
      gamepad.triggerHaptic(20, 0.14, 0.14);
    }
  }

  getActiveModal() {
    if (this.searchModal?.classList.contains('active')) return this.searchModal;
    if (this.gameModal?.classList.contains('active')) return this.gameModal;
    if (this.guideModal?.classList.contains('active')) return this.guideModal;
    if (this.progressModal?.classList.contains('active')) return this.progressModal;
    return null;
  }

  getModalFocusables(modal) {
    if (!modal) return [];
    return Array.from(modal.querySelectorAll('button, a.cta-play, input')).filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && !el.disabled;
    });
  }

  clearFocusClasses() {
    document.querySelectorAll('.gp-focused').forEach((el) => el.classList.remove('gp-focused'));
  }

  updateZoneUI() {
    this.clearFocusClasses();
    if (this.consoleMain) {
      this.consoleMain.classList.toggle('zone-rail', this.navZone === 'rail');
    }

    if (this.navZone === 'actions') {
      const actionBtns = [this.btnPlaySelected, this.btnInfoSelected].filter(Boolean);
      const target = actionBtns[this.actionIndex % actionBtns.length];
      target?.classList.add('gp-focused');
    } else if (this.navZone === 'modal') {
      const modal = this.getActiveModal();
      const items = this.getModalFocusables(modal);
      if (items.length > 0) {
        const idx = ((this.modalFocusIndex % items.length) + items.length) % items.length;
        this.modalFocusIndex = idx;
        items[idx].classList.add('gp-focused');
      }
    }
  }

  handleDirection(dir) {
    const isRtl = document.documentElement.dir === 'rtl';
    const activeModal = this.getActiveModal();
    if (activeModal) {
      this.navZone = 'modal';
      const items = this.getModalFocusables(activeModal);
      if (items.length === 0) return;
      const forward = isRtl
        ? (dir === 'left' || dir === 'down')
        : (dir === 'right' || dir === 'down');
      const delta = forward ? 1 : -1;
      this.modalFocusIndex = (this.modalFocusIndex + delta + items.length) % items.length;
      sound.playNavTick();
      this.updateZoneUI();
      return;
    }

    if (this.navZone === 'rail') {
      if (dir === 'left' || dir === 'right') {
        if (this.filteredGames.length > 1) {
          // In RTL rail, cards flow right-to-left so ArrowLeft advances forward (+1)
          const delta = isRtl
            ? (dir === 'left' ? 1 : -1)
            : (dir === 'right' ? 1 : -1);
          this.selectGame((this.selectedIndex + delta + this.filteredGames.length) % this.filteredGames.length);
        }
      } else if (dir === 'down') {
        this.navZone = 'actions';
        this.actionIndex = 0;
        sound.playNavTick();
        this.updateZoneUI();
      }
      return;
    }

    if (this.navZone === 'actions') {
      if (dir === 'up') {
        this.navZone = 'rail';
        sound.playNavTick();
        this.updateZoneUI();
      } else if (dir === 'left' || dir === 'right') {
        this.actionIndex = this.actionIndex === 0 ? 1 : 0;
        sound.playNavTick();
        this.updateZoneUI();
      }
    }
  }

  handleConfirm() {
    const activeModal = this.getActiveModal();
    if (activeModal) {
      const items = this.getModalFocusables(activeModal);
      const target = items[this.modalFocusIndex] || items[0];
      if (target) {
        if (target.tagName === 'INPUT') {
          target.focus();
        } else {
          target.click();
        }
      }
      return;
    }

    if (this.navZone === 'actions') {
      if (this.actionIndex === 0) {
        this.launchSelectedGame();
      } else {
        const game = this.filteredGames[this.selectedIndex];
        if (game) {
          sound.playClick();
          this.openGameModal(game);
        }
      }
      return;
    }

    // In PS5 rail zone: pressing ✕ immediately launches the selected game!
    this.launchSelectedGame();
  }

  handleBack() {
    const activeModal = this.getActiveModal();
    if (activeModal) {
      sound.playBack();
      this.closeModals();
      return;
    }

    if (this.navZone === 'actions') {
      this.navZone = 'rail';
      sound.playBack();
      this.updateZoneUI();
      return;
    }

    if (this.searchQuery || this.activeCategory !== 'All' || this.smartReviewOnly) {
      sound.playBack();
      this.activeCategory = 'All';
      this.searchQuery = '';
      this.smartReviewOnly = false;
      if (this.searchInput) this.searchInput.value = '';
      this.renderTelemetrySummary();
      this.renderCategories();
      this.applyFilters();
    }
  }

  cycleCategories(direction) {
    const tabs = Array.from(document.querySelectorAll('.category-tab'));
    if (tabs.length <= 1) return;
    const currentIdx = tabs.findIndex((t) => t.classList.contains('active'));
    const nextIdx = (currentIdx + direction + tabs.length) % tabs.length;
    tabs[nextIdx].click();
  }

  renderCategories() {
    if (!this.categoryTabs) return;
    const domainOrder = [
      'التحليل والدوال',
      'الأعداد العقدية والفضاء',
      'التعداد والاحتمالات',
      'الأساسيات والتقويم',
      'الفيزياء 2BAC PC',
      'الكيمياء 2BAC PC'
    ];
    const present = Array.from(new Set(this.games.map((g) => g.category).filter(Boolean)));
    present.sort((a, b) => {
      const ia = domainOrder.indexOf(a);
      const ib = domainOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    const categories = ['All', ...present];

    this.categoryTabs.innerHTML = categories
      .map(
        (cat) => `
          <button class="category-tab ${cat === this.activeCategory ? 'active' : ''}" data-cat="${cat}" type="button">
            ${cat === 'All' ? 'الكل' : cat}
          </button>
        `
      )
      .join('');

    this.categoryTabs.querySelectorAll('.category-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.playNavTick();
        this.activeCategory = btn.getAttribute('data-cat') || 'All';
        this.categoryTabs.querySelectorAll('.category-tab').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyFilters();
      });
    });
  }

  getGameMetrics(gameId) {
    if (window.ArcadeCore?.Progress?.computeGameMetrics) {
      return window.ArcadeCore.Progress.computeGameMetrics(gameId);
    }
    return {
      bestScore: 0,
      bestRank: null,
      sealsCleared: 0,
      bossDefeated: false,
      questionsAnswered: 0,
      questionsCorrect: 0,
      accuracyPct: 0,
      runsCompleted: 0,
      masteredTopics: [],
      weakTopics: [],
      played: false,
      masteryPct: 0
    };
  }

  renderTelemetrySummary() {
    const total = this.games.length || 10;
    const summary = window.ArcadeCore?.Progress?.getSummary
      ? window.ArcadeCore.Progress.getSummary(total)
      : { bossesDefeated: 0, totalSeals: 0, questionsAnswered: 0, accuracyPct: 0 };

    if (this.topbarMasteryText) {
      this.topbarMasteryText.textContent = `${summary.bossesDefeated}/${total} • ${summary.accuracyPct}%`;
    }

    const queue = window.ArcadeCore?.Progress?.getSmartReviewQueue
      ? window.ArcadeCore.Progress.getSmartReviewQueue(this.games)
      : [];
    this._reviewReasonMap = new Map(queue.map((q) => [q.game.id, q]));

    if (this.smartReviewCount) {
      this.smartReviewCount.textContent = String(queue.length);
    }
    if (this.btnSmartReview) {
      this.btnSmartReview.classList.toggle('active', this.smartReviewOnly);
      this.btnSmartReview.setAttribute('aria-pressed', this.smartReviewOnly ? 'true' : 'false');
    }
  }

  toggleSmartReview() {
    sound.playNavTick();
    this.smartReviewOnly = !this.smartReviewOnly;
    this.selectedIndex = 0;
    this.renderTelemetrySummary();
    this.applyFilters();
  }

  applyFilters() {
    this.renderTelemetrySummary();

    const baseFiltered = this.games.filter((game) => {
      const matchCat = this.activeCategory === 'All' || game.category === this.activeCategory;
      if (!matchCat) return false;
      if (!this.searchQuery) return true;

      const haystack = [
        game.title,
        game.description,
        game.category,
        game.topicRange || '',
        game.badge || '',
        ...(game.keywords || []),
        ...(game.mathConcepts || []),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(this.searchQuery);
    });

    if (this.smartReviewOnly && window.ArcadeCore?.Progress?.getSmartReviewQueue) {
      const prioritized = window.ArcadeCore.Progress.getSmartReviewQueue(baseFiltered);
      this.filteredGames = prioritized.map((item) => item.game);
    } else {
      this.filteredGames = baseFiltered;
    }

    if (this.selectedIndex >= this.filteredGames.length) {
      this.selectedIndex = 0;
    }

    this.renderRail();
    this.renderShowcase();
    this.updateZoneUI();
  }

  renderRail() {
    if (!this.rail) return;

    const filterLabel = this.smartReviewOnly
      ? '🎯 المراجعة الذكية: أولويات الضعف والوحدات غير المكتملة'
      : this.searchQuery
      ? `تصفية البحث: "${this.searchQuery}"`
      : this.activeCategory === 'All'
      ? 'المقرر الكامل 2BAC PC (1–114) • جاهز للتشغيل'
      : `المجال: ${this.activeCategory}`;

    if (this.railStatusText) this.railStatusText.textContent = filterLabel;
    if (this.statsCounter) {
      this.statsCounter.textContent = `${this.filteredGames.length} من ${this.games.length} ألعاب`;
    }

    if (this.filteredGames.length === 0) {
      const emptyTitle = this.smartReviewOnly
        ? 'أحسنت! جميع الوحدات الظاهرة متقنة بدرجة عالية'
        : 'لا توجد ألعاب مطابقة للبحث';
      const emptySub = this.smartReviewOnly
        ? 'لا توجد نقاط ضعف مسجلة حالياً في هذا القسم.'
        : 'امسح كلمة البحث أو اختر مجالاً آخر من المقرر.';
      this.rail.innerHTML = `
        <div class="rail-empty-card">
          <div>
            <div style="font-weight:800; color:#fff; margin-bottom:0.2rem;">${emptyTitle}</div>
            <div style="font-size:0.84rem; color:var(--text-muted);">${emptySub}</div>
          </div>
          <button id="btn-reset-filters-inline" class="cta-secondary" type="button">عرض كل الوحدات</button>
        </div>
      `;
      document.getElementById('btn-reset-filters-inline')?.addEventListener('click', () => {
        this.activeCategory = 'All';
        this.searchQuery = '';
        this.smartReviewOnly = false;
        if (this.searchInput) this.searchInput.value = '';
        this.renderCategories();
        this.applyFilters();
      });
      return;
    }

    const tileRingCirc = 62.83;
    this.rail.innerHTML = this.filteredGames
      .map((game, idx) => {
        const isSelected = idx === this.selectedIndex;
        const accent = game.accentColor || '#00e5ff';
        const pillText = game.badge || game.category;
        const rangeText = game.topicRange || `المستوى ${game.difficultyLevel || 3}`;
        const rangeLabel = game.unitLabel ? `${game.unitLabel} • ${rangeText}` : rangeText;
        const m = this.getGameMetrics(game.id);
        const rev = this._reviewReasonMap?.get(game.id);
        const offset = (tileRingCirc * (1 - m.masteryPct / 100)).toFixed(2);
        const rankClass = m.bestRank ? `rank-${m.bestRank.toLowerCase()}` : 'rank-none';
        const ringLabel = m.bestRank ? m.bestRank : (m.played ? `${m.masteryPct}%` : '0%');

        let progClass = '';
        let progText = '0/4 أختام';
        if (m.bossDefeated) {
          progClass = 'is-mastered';
          progText = m.questionsAnswered > 0
            ? `🏆 ✓ ${m.sealsCleared}/4 • ${m.accuracyPct}%`
            : `🏆 ✓ ${m.sealsCleared}/4`;
        } else if (m.played) {
          progClass = rev && rev.priority >= 3 ? 'is-priority' : '';
          const prefix = rev && rev.priority >= 3 ? '🎯 ' : '✓ ';
          progText = m.questionsAnswered > 0
            ? `${prefix}${m.sealsCleared}/4 • ${m.accuracyPct}%`
            : `${prefix}${m.sealsCleared}/4 أختام`;
        } else if (this.smartReviewOnly && rev) {
          progClass = 'is-priority';
          progText = `🎯 ${rev.tag}`;
        }

        return `
          <button
            class="ps5-tile ${isSelected ? 'selected' : ''}"
            data-index="${idx}"
            role="option"
            aria-selected="${isSelected ? 'true' : 'false'}"
            style="--tile-accent: ${accent};"
            type="button"
          >
            <div class="tile-art-frame">
              ${getGameArtworkSVG(game)}
              <span class="tile-badge-pill" dir="ltr">${pillText}</span>
              <div class="tile-ring-badge" title="الإتقان ${m.masteryPct}%">
                <svg class="tile-ring-svg" viewBox="0 0 28 28" aria-hidden="true">
                  <circle class="ring-track" cx="14" cy="14" r="10"></circle>
                  <circle class="ring-fill" cx="14" cy="14" r="10" stroke-dasharray="${tileRingCirc}" stroke-dashoffset="${offset}"></circle>
                </svg>
                <span class="tile-ring-label ${rankClass}" dir="ltr">${ringLabel}</span>
              </div>
              <span class="tile-progress-pill ${progClass}">${progText}</span>
            </div>
            <div class="tile-meta">
              <span class="tile-title">${game.title}</span>
              <span class="tile-lvl">${rangeLabel}</span>
            </div>
          </button>
        `;
      })
      .join('');

    this.rail.querySelectorAll('.ps5-tile').forEach((tile) => {
      tile.addEventListener('click', () => {
        const idx = parseInt(tile.getAttribute('data-index'), 10);
        if (idx === this.selectedIndex) {
          this.launchSelectedGame();
        } else {
          this.navZone = 'rail';
          this.selectGame(idx);
        }
      });
    });

    this.scrollSelectedTileIntoView();
  }

  selectGame(index) {
    if (index < 0 || index >= this.filteredGames.length) return;
    this.selectedIndex = index;
    sound.playNavTick();

    this.rail?.querySelectorAll('.ps5-tile').forEach((tile, idx) => {
      const sel = idx === index;
      tile.classList.toggle('selected', sel);
      tile.setAttribute('aria-selected', sel ? 'true' : 'false');
    });

    this.scrollSelectedTileIntoView();
    this.renderShowcase(true);
    this.updateZoneUI();
  }

  scrollSelectedTileIntoView() {
    const activeTile = this.rail?.querySelector('.ps5-tile.selected');
    if (activeTile) {
      activeTile.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  setSafeText(el, text) {
    if (!el) return;
    if (window.ArcadeCore && typeof window.ArcadeCore.setBidiSafeMath === 'function') {
      window.ArcadeCore.setBidiSafeMath(el, text);
    } else {
      el.textContent = String(text ?? '');
    }
  }

  renderShowcase(animate = false) {
    const game = this.filteredGames[this.selectedIndex];

    if (!game) {
      if (this.showcaseTitle) this.showcaseTitle.textContent = 'لا توجد لعبة محددة';
      if (this.showcaseDesc) this.showcaseDesc.textContent = 'امسح الفلتر أو أضف لعبة إلى games.json.';
      if (this.showcaseConcepts) this.showcaseConcepts.innerHTML = '';
      if (this.showcaseControls) this.showcaseControls.innerHTML = '';
      if (this.btnPlaySelected) this.btnPlaySelected.disabled = true;
      return;
    }

    if (animate && this.showcase) {
      this.showcase.classList.add('switching');
      setTimeout(() => this.showcase?.classList.remove('switching'), 120);
    }

    if (this.btnPlaySelected) {
      const playable = game.status === 'ready';
      this.btnPlaySelected.disabled = !playable;
      this.btnPlaySelected.classList.toggle('disabled', !playable);
    }

    if (this.showcaseCategory) this.showcaseCategory.textContent = game.category || 'الرياضيات';
    if (this.showcaseDiff) {
      this.showcaseDiff.textContent = game.topicRange
        ? `${game.topicRange} • ${game.difficulty || '2BAC PC'}`
        : `المستوى ${game.difficultyLevel || 3} • ${game.difficulty || 'قياسي'}`;
    }
    if (this.showcaseVersion) this.showcaseVersion.textContent = `v${game.version || '1.0'}`;
    if (this.showcaseStatus) {
      this.showcaseStatus.textContent = game.status === 'ready' ? '● جاهز للعب' : '● قيد التطوير';
    }
    if (this.showcaseTitle) this.showcaseTitle.textContent = game.title;
    this.setSafeText(this.showcaseDesc, game.description);
    if (this.blueprintArtBadge) this.blueprintArtBadge.textContent = game.icon || '∫';

    // Update live Showcase Mastery Telemetry Strip
    const m = this.getGameMetrics(game.id);
    const rev = this._reviewReasonMap?.get(game.id);
    const showCirc = 87.96;
    if (this.showcaseMasteryArc) {
      this.showcaseMasteryArc.style.strokeDashoffset = (showCirc * (1 - m.masteryPct / 100)).toFixed(2);
      this.showcaseMasteryArc.style.stroke = game.accentColor || '#00e5ff';
    }
    if (this.showcaseMasteryPct) {
      this.showcaseMasteryPct.textContent = `${m.masteryPct}%`;
    }
    if (this.showcaseTelemetryRank) {
      const rankCls = m.bestRank ? `rank-${m.bestRank.toLowerCase()}` : 'rank-none';
      this.showcaseTelemetryRank.className = `telemetry-chip ${rankCls}`;
      this.showcaseTelemetryRank.textContent = m.bestRank ? `الرتبة ${m.bestRank}` : (m.played ? 'قيد التقدّم' : 'جديد');
    }
    if (this.showcaseTelemetrySeals) {
      this.showcaseTelemetrySeals.textContent = `✓ ${m.sealsCleared}/4 أختام`;
      this.showcaseTelemetrySeals.classList.toggle('is-cleared', m.sealsCleared >= 4);
    }
    if (this.showcaseTelemetryBoss) {
      this.showcaseTelemetryBoss.textContent = m.bossDefeated ? '🏆 الزعيم مهزوم' : '⚔ الزعيم صامد';
      this.showcaseTelemetryBoss.classList.toggle('is-cleared', m.bossDefeated);
    }
    if (this.showcaseTelemetryAcc) {
      const accStr = m.questionsAnswered > 0 ? `${m.accuracyPct}%` : '—';
      this.showcaseTelemetryAcc.textContent = `الدقة: ${accStr} • أعلى نتيجة: ${m.bestScore}`;
    }
    if (this.showcaseWeakPill) {
      if (m.weakTopics.length > 0) {
        this.showcaseWeakPill.classList.remove('hidden');
        this.setSafeText(this.showcaseWeakPill, `⚠ مراجعة: ${m.weakTopics.slice(0, 3).join('، ')}`);
      } else if (rev && rev.priority >= 2) {
        this.showcaseWeakPill.classList.remove('hidden');
        this.setSafeText(this.showcaseWeakPill, `🎯 ${rev.reason}`);
      } else {
        this.showcaseWeakPill.classList.add('hidden');
      }
    }

    if (this.showcaseConcepts) {
      this.showcaseConcepts.textContent = '';
      for (const concept of game.mathConcepts || []) {
        const pill = document.createElement('span');
        pill.className = 'concept-pill';
        this.setSafeText(pill, concept);
        this.showcaseConcepts.appendChild(pill);
      }
    }

    if (this.showcaseControls) {
      this.showcaseControls.textContent = '';
      for (const entry of (game.controls || ['Left Stick / WASD: تحرك']).slice(0, 6)) {
        const { key, desc } = formatControlEntry(entry);
        const li = document.createElement('li');
        li.className = 'blueprint-control-row';
        const kSpan = document.createElement('span');
        kSpan.className = 'ctrl-key';
        kSpan.dir = 'ltr';
        kSpan.textContent = key;
        const dSpan = document.createElement('span');
        dSpan.className = 'ctrl-desc';
        this.setSafeText(dSpan, desc);
        li.appendChild(kSpan);
        li.appendChild(dSpan);
        this.showcaseControls.appendChild(li);
      }
    }

    // Shift ambient glow color subtly to match game theme (pure CSS opacity/background, zero blur)
    if (this.ambientPrimary) {
      const accent = game.accentColor || '#00e5ff';
      this.ambientPrimary.style.background = `radial-gradient(circle, ${accent}26 0%, transparent 68%)`;
    }
  }

  launchSelectedGame() {
    if (this.isLaunching) return;
    const game = this.filteredGames[this.selectedIndex];
    if (!game || game.status !== 'ready') return;

    this.isLaunching = true;
    sound.playLaunch();
    gamepad.triggerHaptic(110, 0.7, 0.7);

    if (this.launchIcon) this.launchIcon.textContent = game.icon || '∫';
    if (this.launchLabel) this.launchLabel.textContent = `جارٍ تشغيل ${game.title}...`;
    this.launchCurtain?.classList.add('active');

    setTimeout(() => {
      window.location.href = game.path;
    }, 240);
  }

  openSearchModal() {
    this.closeModals(true);
    this.searchModal?.classList.add('active');
    this.searchModal?.setAttribute('aria-hidden', 'false');
    this.navZone = 'modal';
    this.modalFocusIndex = 1;
    this.updateZoneUI();
    setTimeout(() => this.searchInput?.focus(), 60);
  }

  openGameModal(game) {
    this.closeModals(true);
    const titleEl = document.getElementById('modal-game-title');
    const descEl = document.getElementById('modal-game-desc');
    const conceptsEl = document.getElementById('modal-game-concepts');
    const controlsEl = document.getElementById('modal-game-controls');
    const actionEl = document.getElementById('modal-game-action');

    if (titleEl) titleEl.textContent = game.title;
    this.setSafeText(descEl, game.description);
    if (conceptsEl) {
      conceptsEl.textContent = '';
      for (const c of game.mathConcepts || []) {
        const li = document.createElement('li');
        this.setSafeText(li, c);
        conceptsEl.appendChild(li);
      }
    }
    if (controlsEl) {
      controlsEl.textContent = '';
      for (const c of game.controls || ['يد التحكم DualSense / لوحة المفاتيح']) {
        const li = document.createElement('li');
        this.setSafeText(li, c);
        controlsEl.appendChild(li);
      }
    }
    if (actionEl) {
      actionEl.innerHTML = `
        <button id="btn-modal-launch" class="cta-play" type="button">
          <span class="gp-dot gp-cross">✕</span>
          <span>تشغيل ${game.title}</span>
        </button>
        <button id="btn-modal-back" class="cta-secondary" type="button">
          <span class="gp-dot gp-cir">◯</span>
          <span>رجوع</span>
        </button>
      `;
      document.getElementById('btn-modal-launch')?.addEventListener('click', () => this.launchSelectedGame());
      document.getElementById('btn-modal-back')?.addEventListener('click', () => this.closeModals());
    }

    this.gameModal?.classList.add('active');
    this.gameModal?.setAttribute('aria-hidden', 'false');
    this.navZone = 'modal';
    this.modalFocusIndex = 1;
    this.updateZoneUI();
  }

  openGuideModal() {
    this.closeModals(true);
    this.guideModal?.classList.add('active');
    this.guideModal?.setAttribute('aria-hidden', 'false');
    this.navZone = 'modal';
    this.modalFocusIndex = 1;
    this.updateZoneUI();
  }

  openProgressModal() {
    this.closeModals(true);
    this.disarmResetConfirm();
    this.renderProgressModal();
    this.progressModal?.classList.add('active');
    this.progressModal?.setAttribute('aria-hidden', 'false');
    this.navZone = 'modal';
    this.modalFocusIndex = 0;
    this.updateZoneUI();
  }

  renderProgressModal() {
    const total = this.games.length || 10;
    const summary = window.ArcadeCore?.Progress?.getSummary
      ? window.ArcadeCore.Progress.getSummary(total)
      : { bossesDefeated: 0, totalSeals: 0, questionsAnswered: 0, accuracyPct: 0 };

    const elBosses = document.getElementById('prog-sum-bosses');
    const elSeals = document.getElementById('prog-sum-seals');
    const elAcc = document.getElementById('prog-sum-acc');
    const elQs = document.getElementById('prog-sum-questions');
    if (elBosses) elBosses.textContent = `${summary.bossesDefeated} / ${total}`;
    if (elSeals) elSeals.textContent = `${summary.totalSeals} / ${total * 4}`;
    if (elAcc) elAcc.textContent = `${summary.accuracyPct}%`;
    if (elQs) elQs.textContent = String(summary.questionsAnswered || 0);

    const listEl = document.getElementById('prog-review-list');
    if (!listEl) return;
    listEl.textContent = '';

    const queue = window.ArcadeCore?.Progress?.getSmartReviewQueue
      ? window.ArcadeCore.Progress.getSmartReviewQueue(this.games).slice(0, 5)
      : [];

    if (queue.length === 0) {
      const doneDiv = document.createElement('div');
      doneDiv.className = 'review-item';
      doneDiv.textContent = '🏆 إتقان مثالي! كل الوحدات مكتملة دون نقاط ضعف مسجلة.';
      listEl.appendChild(doneDiv);
      return;
    }

    for (const item of queue) {
      const row = document.createElement('div');
      row.className = 'review-item';

      const meta = document.createElement('div');
      meta.className = 'review-item-meta';

      const title = document.createElement('span');
      title.className = 'review-item-title';
      title.textContent = item.game.title;

      const reason = document.createElement('span');
      reason.className = 'review-item-reason';
      this.setSafeText(reason, `${item.tag}: ${item.reason}`);

      meta.appendChild(title);
      meta.appendChild(reason);

      const jumpBtn = document.createElement('button');
      jumpBtn.type = 'button';
      jumpBtn.className = 'review-jump-btn';
      jumpBtn.textContent = 'اختيار الوحدة';
      jumpBtn.addEventListener('click', () => {
        sound.playClick();
        this.activeCategory = 'All';
        this.searchQuery = '';
        this.smartReviewOnly = false;
        if (this.searchInput) this.searchInput.value = '';
        this.renderCategories();
        this.applyFilters();
        const targetIdx = this.filteredGames.findIndex((g) => g.id === item.game.id);
        this.closeModals();
        if (targetIdx >= 0) this.selectGame(targetIdx);
      });

      row.appendChild(meta);
      row.appendChild(jumpBtn);
      listEl.appendChild(row);
    }
  }

  setProgressFeedback(msg, isError = false) {
    const el = document.getElementById('progress-feedback-msg');
    if (!el) return;
    el.textContent = msg || '';
    el.style.color = isError ? '#fb7185' : '#34d399';
  }

  exportProgressBackup() {
    if (!window.ArcadeCore?.Progress) return;
    sound.playClick();
    const json = window.ArcadeCore.Progress.exportJSON();
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `math-arcid-v2-progress-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 500);
      this.setProgressFeedback('تم تنزيل نسخة التقدم الاحتياطية (JSON) بنجاح.');
    } catch (_) {
      this.setProgressFeedback('تعذر التصدير في هذا المتصفح.', true);
    }
  }

  async importProgressBackup(file) {
    if (!file || !window.ArcadeCore?.Progress) return;
    try {
      const raw = await file.text();
      window.ArcadeCore.Progress.importJSON(raw);
      sound.playNavTick();
      this.renderTelemetrySummary();
      this.applyFilters();
      this.renderProgressModal();
      this.setProgressFeedback('تم استيراد سجل التقدم وتحديث جميع الوحدات بنجاح!');
    } catch (_) {
      this.setProgressFeedback('ملف غير صالح: تأكد أنه نسخة JSON صادرة عن المنصة.', true);
    }
  }

  disarmResetConfirm() {
    this.resetConfirmArmed = false;
    if (this.resetConfirmTimer) {
      clearTimeout(this.resetConfirmTimer);
      this.resetConfirmTimer = null;
    }
    const btn = document.getElementById('btn-reset-progress');
    if (btn) {
      btn.classList.remove('confirming');
      btn.textContent = '🗑 مسح جميع البيانات';
    }
  }

  handleResetProgressClick() {
    const btn = document.getElementById('btn-reset-progress');
    if (!this.resetConfirmArmed) {
      sound.playNavTick();
      this.resetConfirmArmed = true;
      if (btn) {
        btn.classList.add('confirming');
        btn.textContent = '⚠️ اضغط مجدداً لتأكيد المسح النهائي';
      }
      this.setProgressFeedback('تنبيه: اضغط نفس الزر مرة ثانية خلال 4 ثوانٍ لتأكيد التصفير.', true);
      this.resetConfirmTimer = setTimeout(() => this.disarmResetConfirm(), 4000);
      return;
    }

    this.disarmResetConfirm();
    window.ArcadeCore?.Progress?.resetAll?.();
    try {
      localStorage.removeItem('mathcore_high_score');
    } catch (_) {}
    sound.playBack();
    this.renderTelemetrySummary();
    this.applyFilters();
    this.renderProgressModal();
    this.setProgressFeedback('تم تصفير جميع بيانات الإتقان والتقدم بنجاح.');
  }

  closeModals(silent = false) {
    this.disarmResetConfirm();
    this.setProgressFeedback('');
    [this.searchModal, this.gameModal, this.guideModal, this.progressModal].forEach((m) => {
      m?.classList.remove('active');
      m?.setAttribute('aria-hidden', 'true');
    });
    if (!silent) {
      this.navZone = 'rail';
      this.updateZoneUI();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ArcadeConsoleHub();
});
