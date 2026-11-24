/**
 * Math-Arcid-V2 — Unified Platform Core Engine (`window.ArcadeCore`)
 * Classic zero-dependency UMD/IIFE shared core across the PS5 Hub and all 10 games:
 *   1. ArcadeCore.setBidiSafeMath  — RTL-safe Moroccan 2BAC PC <bdi dir="ltr"> math isolation
 *   2. ArcadeCore.Gamepad          — DualSense / DualShock deadzone, D-Pad hat, D-nav & haptics
 *   3. ArcadeCore.Progress         — Versioned localStorage cross-game telemetry & rank store
 *   4. ArcadeCore.CanvasAxisKit    — Lightweight shared 2D canvas grids, axes & LTR math labels
 */
(function (root, factory) {
  const api = factory(root);
  if (root) {
    root.ArcadeCore = api;
  }
  if (typeof module === 'object' && module && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function (root) {
  'use strict';

  const STORAGE_KEY = 'math_arcid_v2_progress';
  const SCHEMA_VERSION = 1;
  const RANK_ORDER = { C: 1, B: 2, A: 3, S: 4 };

  // Precompiled character classes covering full Moroccan 2BAC PC notation (Topics 1-114)
  const MATH_CORE_CLASS =
    "A-Za-z0-9\\u00C0-\\u024F\\u0300-\\u030F\\u20D0-\\u20FF" +
    "ℝℚℕℤℂΩΔΣΠΦαβγδεζηθλμπρστφψω" +
    "⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ᵃᵉʰⁱᵏᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻ" +
    "₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₒₓₙₚₖᵢ" +
    "\\][(){}|√∛∜∞∅∀∃∈∉⊂⊃∪∩→←↔⇒⇔⇐↦⟹⟺≤≥≠≈≡·×÷±−≈'′″∘^_∫∑∏∂∇∧∨⊥∥∠°\\\\%";

  const MATH_BRIDGE_CLASS =
    " +\\-*/=<>≤≥≠∈∉⊂⊃∪∩∀∃→←↔⇒⇔⇐↦⟹⟺·×÷±−≈'′″∘^_:,.\\\\;∫∑∏∧∨⊥";

  const MATH_SEGMENT_REGEX = new RegExp(
    "(?:[+\\-−](?=[" + MATH_CORE_CLASS + "])|[" + MATH_CORE_CLASS + "])" +
    "(?:[" + MATH_BRIDGE_CLASS + "]*[" + MATH_CORE_CLASS + "])*",
    'g'
  );

  const SUB_MAP = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
    '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
    '₊': '+', '₋': '-', '₌': '=', '₍': '(', '₎': ')',
    'ₐ': 'a', 'ₑ': 'e', 'ₒ': 'o', 'ₓ': 'x', 'ₙ': 'n', 'ₚ': 'p', 'ₖ': 'k', 'ᵢ': 'i'
  };
  const SUP_MAP = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
    '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    '⁺': '+', '⁻': '-', '⁼': '=', '⁽': '(', '⁾': ')',
    'ᵃ': 'a', 'ᵉ': 'e', 'ʰ': 'h', 'ⁱ': 'i', 'ᵏ': 'k', 'ᵐ': 'm',
    'ⁿ': 'n', 'ᵒ': 'o', 'ᵖ': 'p', 'ʳ': 'r', 'ˢ': 's', 'ᵗ': 't',
    'ᵘ': 'u', 'ᵛ': 'v', 'ʷ': 'w', 'ˣ': 'x', 'ʸ': 'y', 'ᶻ': 'z'
  };

  function isPlainNonMathToken(tok) {
    if (!tok) return true;
    const t = tok.trim();
    if (/^(WASD|PS5|Hub|DualSense|RTL|LTR|JSON|HTML|CSS|SVG|FPS|CPU|GPU|URL|ID|AI|PC|2BAC|Space|Enter|Esc|Escape|Shift|Options|Select|Start|Cross|Circle|Square|Triangle|LMB|RMB|L1|R1|L2|R2|D-Pad|Arrow|Mouse|Touch|MCT|TVI|ODE|ALPES|IPP|v\d+(?:\.\d+)*|\d+(?:\.\d+)?[x%]?)$/i.test(t)) {
      return true;
    }
    // Multi-word shortcut pairs like "Space / RMB", "L1 / R1", "Options / Esc"
    if (/^[A-Za-z0-9\-+\s]+(?:\s*\/\s*[A-Za-z0-9\-+\s]+)+$/.test(t) && !/d\s*\/\s*dx|\d+\s*\/\s*\d+/.test(t)) {
      return true;
    }
    return false;
  }

  function isTrueMathFormula(tok) {
    if (!tok || isPlainNonMathToken(tok)) return false;
    const t = tok.trim();
    if (/^[0-9]+(?:[.,][0-9]+)?$/.test(t)) return false;
    // Any explicit math operator, script, Greek, set symbol, function call, or fraction
    return /[=<>≤≥≠≈≡±×·÷→⇒⇔←↔∀∃∈∉⊂⊃∪∩∞√∛∜∫∑∏∂∇∧∨⊥∥∠⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻ⁿˣ₀₁₂₃₄₅₆₇₈₉ₙ₊₋\^_ℝℂℕℤℚα-ωΔΣΠΦΩ]|\\(?:frac|sqrt|lim|sin|cos|tan|ln|log|exp|mathbb)|\b(?:sin|cos|tan|ln|log|exp|lim)\b|\b[A-Za-z]'?\([A-Za-z0-9, +\-*/]+\)|[A-Za-z0-9)\]]\s*\/\s*[A-Za-z0-9(\[]/.test(t);
  }

  function convertUnicodeScripts(str) {
    let out = '';
    let i = 0;
    while (i < str.length) {
      if (SUB_MAP[str[i]]) {
        let run = '';
        while (i < str.length && SUB_MAP[str[i]]) {
          run += SUB_MAP[str[i]];
          i += 1;
        }
        out += `_{${run}}`;
      } else if (SUP_MAP[str[i]]) {
        let run = '';
        while (i < str.length && SUP_MAP[str[i]]) {
          run += SUP_MAP[str[i]];
          i += 1;
        }
        out += `^{${run}}`;
      } else {
        out += str[i];
        i += 1;
      }
    }
    return out;
  }

  function plainMathToLatex(tok) {
    let s = convertUnicodeScripts(String(tok || '').trim());
    // Normalize combining macron / vector arrows
    s = s.replace(/([A-Za-z0-9])\u0304/g, '\\overline{$1}');
    s = s.replace(/([A-Za-z0-9])\u20D7/g, '\\vec{$1}');
    // Roots: √(expr) or √2 or ∛(expr)
    s = s.replace(/∛\(([^)]+)\)/g, '\\sqrt[3]{$1}');
    s = s.replace(/∛([A-Za-z0-9_{}^]+)/g, '\\sqrt[3]{$1}');
    s = s.replace(/√\(([^)]+)\)/g, '\\sqrt{$1}');
    s = s.replace(/√([A-Za-z0-9_{}^]+)/g, '\\sqrt{$1}');
    // Simple fractions like d/dx, 1/2, (u_n^2+3)/4, 3/(4-u_n)
    s = s.replace(/\bd\/dx\b/g, '\\frac{d}{dx}');
    s = s.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
    s = s.replace(/\(([^()]+)\)\s*\/\s*([A-Za-z0-9_{}^]+)/g, '\\frac{$1}{$2}');
    s = s.replace(/([A-Za-z0-9_{}^]+)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
    s = s.replace(/(^|[\s=+\-(])(\d+|[a-zA-Z](?:_\{[^}]+\}|_[a-zA-Z0-9])?)\s*\/\s*(\d+|[a-zA-Z](?:_\{[^}]+\}|_[a-zA-Z0-9])?)(?=$|[\s=+\-).,;])/g, '$1\\frac{$2}{$3}');
    // Functions & sets
    s = s.replace(/\b(lim|sin|cos|tan|ln|log|exp)\b/g, '\\$1');
    s = s.replace(/ℝ/g, '\\mathbb{R}').replace(/ℂ/g, '\\mathbb{C}')
         .replace(/ℕ/g, '\\mathbb{N}').replace(/ℤ/g, '\\mathbb{Z}')
         .replace(/ℚ/g, '\\mathbb{Q}');
    const symMap = {
      '×': '\\times ', '·': '\\cdot ', '÷': '\\div ', '±': '\\pm ', '−': '-',
      '≤': '\\le ', '≥': '\\ge ', '≠': '\\neq ', '≈': '\\approx ', '≡': '\\equiv ',
      '∈': '\\in ', '∉': '\\notin ', '⊂': '\\subset ', '⊃': '\\supset ',
      '∪': '\\cup ', '∩': '\\cap ', '∅': '\\emptyset ', '∞': '\\infty ',
      '∀': '\\forall ', '∃': '\\exists ', '→': '\\to ', '←': '\\leftarrow ',
      '↔': '\\leftrightarrow ', '⇒': '\\Rightarrow ', '⇔': '\\Leftrightarrow ',
      '⇐': '\\Leftarrow ', '↦': '\\mapsto ', '⟹': '\\implies ', '⟺': '\\iff ',
      '∧': '\\wedge ', '∨': '\\vee ', '⊥': '\\perp ', '∥': '\\parallel ',
      '∠': '\\angle ', '∫': '\\int ', '∑': '\\sum ', '∏': '\\prod ', '∂': '\\partial ',
      'α': '\\alpha ', 'β': '\\beta ', 'γ': '\\gamma ', 'δ': '\\delta ',
      'ε': '\\varepsilon ', 'θ': '\\theta ', 'λ': '\\lambda ', 'μ': '\\mu ',
      'π': '\\pi ', 'ρ': '\\rho ', 'σ': '\\sigma ', 'τ': '\\tau ',
      'φ': '\\varphi ', 'ω': '\\omega ', 'Δ': '\\Delta ', 'Ω': '\\Omega ',
      'Σ': '\\Sigma ', 'Π': '\\Pi ', 'Φ': '\\Phi '
    };
    s = s.replace(/[×·÷±−≤≥≠≈≡∈∉⊂⊃∪∩∅∞∀∃→←↔⇒⇔⇐↦⟹⟺∧∨⊥∥∠∫∑∏∂αβγδεθλμπρστφωΔΩΣΠΦ]/g, (ch) => symMap[ch] || ch);
    return s;
  }

  function appendPlainBidiSegments(el, doc, rawChunk, tag, className) {
    if (!rawChunk) return;
    MATH_SEGMENT_REGEX.lastIndex = 0;
    let lastIdx = 0;
    let match = MATH_SEGMENT_REGEX.exec(rawChunk);

    while (match !== null) {
      let sIdx = match.index;
      let eIdx = sIdx + match[0].length;

      while (eIdx > sIdx) {
        const sub = rawChunk.slice(sIdx, eIdx);
        const ch = sub[sub.length - 1];
        if (ch === ' ' || ch === '\t') { eIdx -= 1; continue; }
        if ((ch === ':' || ch === ';') && eIdx === match.index + match[0].length) { eIdx -= 1; continue; }
        const op = (sub.match(/\(/g) || []).length;
        const cl = (sub.match(/\)/g) || []).length;
        if ((ch === '(' && op > cl) || (ch === ')' && cl > op)) { eIdx -= 1; continue; }
        break;
      }

      while (sIdx < eIdx) {
        const sub = rawChunk.slice(sIdx, eIdx);
        const ch = sub[0];
        const op = (sub.match(/\(/g) || []).length;
        const cl = (sub.match(/\)/g) || []).length;
        if (ch === ' ' || ch === '\t' || (ch === '(' && op > cl) || (ch === ')' && cl > op)) {
          sIdx += 1;
          continue;
        }
        break;
      }

      const tok = rawChunk.slice(sIdx, eIdx);
      if (tok && !/^[()\[\]\s]+$/.test(tok)) {
        if (sIdx > lastIdx) {
          el.appendChild(doc.createTextNode(rawChunk.slice(lastIdx, sIdx)));
        }
        const node = doc.createElement(tag);
        node.dir = 'ltr';
        if (root && root.katex && typeof root.katex.render === 'function' && isTrueMathFormula(tok)) {
          node.className = `${className} katex-bdi`;
          try {
            root.katex.render(plainMathToLatex(tok), node, { throwOnError: false, displayMode: false, strict: 'ignore' });
          } catch (_) {
            node.textContent = tok;
          }
        } else {
          node.className = className;
          node.textContent = tok;
        }
        el.appendChild(node);
        lastIdx = eIdx;
      }
      match = MATH_SEGMENT_REGEX.exec(rawChunk);
    }

    if (lastIdx < rawChunk.length) {
      el.appendChild(doc.createTextNode(rawChunk.slice(lastIdx)));
    }
  }

  /**
   * Render mixed Arabic RTL + LaTeX ($...$ / $$...$$) + Unicode math via KaTeX inside <bdi dir="ltr">.
   */
  function renderMath(el, text, opts) {
    if (!el) return;
    const doc = el.ownerDocument || (typeof document !== 'undefined' ? document : null);
    const raw = String(text ?? '');
    el.textContent = '';
    if (!doc) return;

    const tag = (opts && opts.tag) || 'bdi';
    const className = (opts && opts.className) || 'math-ltr';
    const latexRegex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
    let lastIdx = 0;
    let m = latexRegex.exec(raw);

    while (m !== null) {
      if (m.index > lastIdx) {
        appendPlainBidiSegments(el, doc, raw.slice(lastIdx, m.index), tag, className);
      }
      const isDisplay = m[1] !== undefined;
      const tex = (isDisplay ? m[1] : m[2]).trim();
      const node = doc.createElement(isDisplay ? 'div' : tag);
      node.dir = 'ltr';
      node.className = isDisplay ? `${className} katex-display-wrap` : `${className} katex-bdi`;
      if (root && root.katex && typeof root.katex.render === 'function') {
        try {
          root.katex.render(tex, node, { throwOnError: false, displayMode: isDisplay, strict: 'ignore' });
        } catch (_) {
          node.textContent = tex;
        }
      } else {
        node.textContent = m[0];
      }
      el.appendChild(node);
      lastIdx = m.index + m[0].length;
      m = latexRegex.exec(raw);
    }

    if (lastIdx < raw.length) {
      appendPlainBidiSegments(el, doc, raw.slice(lastIdx), tag, className);
    }
  }

  function setBidiSafeMath(el, text, opts) {
    return renderMath(el, text, opts);
  }

  function renderAllMath(container) {
    const scope = container || (typeof document !== 'undefined' ? document : null);
    if (!scope || !scope.querySelectorAll) return;
    const texEls = scope.querySelectorAll('[data-tex]');
    for (let i = 0; i < texEls.length; i += 1) {
      const node = texEls[i];
      if (node.dataset && node.dataset.katexDone === '1') continue;
      const tex = node.getAttribute('data-tex');
      const disp = node.getAttribute('data-display') === 'true';
      node.dir = 'ltr';
      if (node.dataset) node.dataset.katexDone = '1';
      if (root && root.katex && typeof root.katex.render === 'function') {
        try {
          root.katex.render(tex, node, { throwOnError: false, displayMode: disp, strict: 'ignore' });
        } catch (_) {
          node.textContent = tex;
        }
      }
    }
    const autoEls = scope.querySelectorAll('.math-auto');
    for (let i = 0; i < autoEls.length; i += 1) {
      const node = autoEls[i];
      if (node.hasAttribute('data-tex') || (node.dataset && node.dataset.katexDone === '1')) continue;
      if (node.querySelector && node.querySelector('.katex')) continue;
      const src = (node.dataset && node.dataset.rawMath) || node.textContent;
      if (node.dataset) {
        node.dataset.rawMath = src;
        node.dataset.katexDone = '1';
      }
      renderMath(node, src);
    }
  }

  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('DOMContentLoaded', () => {
      renderAllMath(document);
    });
  }

  /**
   * Standard PlayStation DualSense / DualShock & W3C Gamepad calibration utilities.
   */
  const Gamepad = {
    createState() {
      return {
        connected: false,
        index: null,
        idLabel: '',
        prevButtons: [],
        axisLeftHeld: false,
        axisRightHeld: false,
        axisUpHeld: false,
        axisDownHeld: false,
        pauseFocusIdx: 0,
        endFocusIdx: 0,
        lastShownConnected: null,
        lastShownLabel: ''
      };
    },

    /**
     * Apply radial deadzone and smooth vector rescaling in [0, 1].
     * @param {number} x - Raw X axis [-1, 1].
     * @param {number} y - Raw Y axis [-1, 1].
     * @param {number} [deadzone=0.18] - Radial threshold.
     * @returns {{x: number, y: number}} Normalized stick vector.
     */
    applyRadialDeadzone(x, y, deadzone = 0.18) {
      const mag = Math.hypot(x || 0, y || 0);
      if (mag < deadzone) return { x: 0, y: 0 };
      const norm = Math.min(1, (mag - deadzone) / Math.max(0.001, 1 - deadzone));
      return {
        x: (x / mag) * norm,
        y: (y / mag) * norm
      };
    },

    /**
     * Decode standard Linux/Chrome 8-way D-Pad hat axis (axes[9]) when present.
     * @param {Gamepad|null} gp - Browser Gamepad object.
     * @returns {{up: boolean, down: boolean, left: boolean, right: boolean}} Hat directions.
     */
    decodeDpadHat(gp) {
      const dirs = { up: false, down: false, left: false, right: false };
      const h = gp && gp.axes && gp.axes.length > 9 ? gp.axes[9] : null;
      if (typeof h === 'number' && Math.abs(h) <= 1.05 && h < 1.1) {
        if (h < -0.75) { dirs.up = true; }
        else if (h < -0.52) { dirs.up = true; dirs.right = true; }
        else if (h < -0.22) { dirs.right = true; }
        else if (h < 0.05) { dirs.right = true; dirs.down = true; }
        else if (h < 0.30) { dirs.down = true; }
        else if (h < 0.58) { dirs.down = true; dirs.left = true; }
        else if (h <= 0.85) { dirs.left = true; }
        else { dirs.left = true; dirs.up = true; }
      }
      return dirs;
    },

    /**
     * Detect rising-edge press on standard Gamepad button index.
     */
    justPressed(gp, gpState, idx, threshold = 0.55) {
      const btn = gp && gp.buttons && gp.buttons[idx];
      const pressed = Boolean(btn && (btn.pressed || btn.value > threshold));
      const was = Boolean(gpState && gpState.prevButtons[idx]);
      return pressed && !was;
    },

    /**
     * Snapshot all gamepad button states for next-frame rising-edge checks.
     */
    snapshotButtons(gp, gpState, threshold = 0.55) {
      if (!gp || !gp.buttons || !gpState) return;
      for (let i = 0; i < gp.buttons.length; i += 1) {
        const btn = gp.buttons[i];
        gpState.prevButtons[i] = Boolean(btn && (btn.pressed || btn.value > threshold));
      }
    },

    /**
     * Sample edge-triggered directional navigation across D-Pad buttons, Linux hat axis, and Left Stick.
     */
    sampleDirectionalNav(gp, gpState, threshold = 0.55) {
      if (!gp || !gpState) {
        return { dLeft: false, dRight: false, dUp: false, dDown: false };
      }
      const ax = (gp.axes && gp.axes[0]) || 0;
      const ay = (gp.axes && gp.axes[1]) || 0;
      const hat = Gamepad.decodeDpadHat(gp);

      const leftNow = ax < -threshold || hat.left;
      const rightNow = ax > threshold || hat.right;
      const upNow = ay < -threshold || hat.up;
      const downNow = ay > threshold || hat.down;

      const dLeft = Gamepad.justPressed(gp, gpState, 14) || (leftNow && !gpState.axisLeftHeld);
      const dRight = Gamepad.justPressed(gp, gpState, 15) || (rightNow && !gpState.axisRightHeld);
      const dUp = Gamepad.justPressed(gp, gpState, 12) || (upNow && !gpState.axisUpHeld);
      const dDown = Gamepad.justPressed(gp, gpState, 13) || (downNow && !gpState.axisDownHeld);

      gpState.axisLeftHeld = leftNow;
      gpState.axisRightHeld = rightNow;
      gpState.axisUpHeld = upNow;
      gpState.axisDownHeld = downNow;

      return { dLeft, dRight, dUp, dDown };
    },

    /**
     * Resolve currently active connected gamepad from navigator.getGamepads().
     */
    resolveActiveGamepad(gpState) {
      if (typeof navigator === 'undefined' || !navigator.getGamepads) return null;
      const pads = navigator.getGamepads();
      if (!pads) return null;

      if (gpState && gpState.index !== null && pads[gpState.index] && pads[gpState.index].connected) {
        return pads[gpState.index];
      }
      for (let i = 0; i < pads.length; i += 1) {
        if (pads[i] && pads[i].connected) {
          if (gpState) {
            gpState.connected = true;
            gpState.index = pads[i].index;
            const lowId = (pads[i].id || '').toLowerCase();
            gpState.idLabel = (lowId.includes('dualsense') || lowId.includes('054c') || lowId.includes('dualshock') || lowId.includes('playstation'))
              ? 'DualSense جاهز'
              : 'Gamepad متصل';
          }
          return pads[i];
        }
      }
      if (gpState) {
        gpState.connected = false;
        gpState.index = null;
        gpState.idLabel = '';
      }
      return null;
    },

    /**
     * Trigger dual-rumble haptic pulse safely on supported controllers.
     */
    triggerHaptic(gpState, duration = 90, weak = 0.35, strong = 0.55) {
      if (!gpState || !gpState.connected || gpState.index === null) return;
      if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
      const pads = navigator.getGamepads();
      const gp = pads && pads[gpState.index];
      if (!gp || !gp.vibrationActuator || typeof gp.vibrationActuator.playEffect !== 'function') {
        return;
      }
      try {
        gp.vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: duration || 90,
          weakMagnitude: Math.min(1, Math.max(0, weak ?? 0.35)),
          strongMagnitude: Math.min(1, Math.max(0, strong ?? 0.55))
        }).catch(() => {});
      } catch (_) {
        // Ignore browsers blocking vibration without gesture
      }
    },

    /**
     * Synchronize DualSense status pill without redundant DOM updates.
     */
    updateBanner(gpState, pillEl, statusEl, disconnectedText = 'لوحة المفاتيح / DualSense') {
      if (!gpState || !pillEl || !statusEl) return;
      if (
        gpState.lastShownConnected === gpState.connected &&
        gpState.lastShownLabel === gpState.idLabel
      ) {
        return;
      }
      gpState.lastShownConnected = gpState.connected;
      gpState.lastShownLabel = gpState.idLabel;

      pillEl.classList.toggle('connected', gpState.connected);
      pillEl.classList.toggle('disconnected', !gpState.connected);
      statusEl.textContent = gpState.connected
        ? (gpState.idLabel || 'DualSense متصل')
        : disconnectedText;
    },

    /**
     * Apply .gp-focused highlight class across modal buttons.
     */
    applyFocusRing(btns, idx) {
      if (!btns || !btns.length) return;
      const safeIdx = ((idx % btns.length) + btns.length) % btns.length;
      for (let i = 0; i < btns.length; i += 1) {
        btns[i].classList.toggle('gp-focused', i === safeIdx);
      }
    }
  };

  /**
   * Versioned cross-game progress & 2BAC PC mastery telemetry store (`localStorage`).
   */
  let memoryFallback = null;

  function createEmptyStore() {
    return {
      schemaVersion: SCHEMA_VERSION,
      updatedAt: null,
      games: {}
    };
  }

  function createEmptyGameEntry() {
    return {
      bestScore: 0,
      bestRank: null,
      sealsCleared: 0,
      stagesCleared: 0,
      totalStages: 0,
      bossDefeated: false,
      questionsAnswered: 0,
      questionsCorrect: 0,
      lastAccuracy: null,
      bypassesUsed: 0,
      runsCompleted: 0,
      masteredTopics: [],
      weakTopics: [],
      topicStats: {},
      lastPlayedISO: null
    };
  }

  function readStore() {
    try {
      const storage = root && root.localStorage;
      if (!storage) return memoryFallback || createEmptyStore();
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return createEmptyStore();
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.games !== 'object') {
        return createEmptyStore();
      }
      return parsed;
    } catch (_) {
      return memoryFallback || createEmptyStore();
    }
  }

  function writeStore(store) {
    store.schemaVersion = SCHEMA_VERSION;
    store.updatedAt = new Date().toISOString();
    memoryFallback = store;
    try {
      const storage = root && root.localStorage;
      if (storage) {
        storage.setItem(STORAGE_KEY, JSON.stringify(store));
      }
    } catch (_) {
      // Ignore QuotaExceededError or private browsing blocks
    }
    return store;
  }

  function ensureEntry(store, gameId) {
    if (!store.games[gameId]) {
      store.games[gameId] = createEmptyGameEntry();
    }
    return store.games[gameId];
  }

  const Progress = {
    STORAGE_KEY,

    computeRank(summary) {
      const s = summary || {};
      const victory = Boolean(s.victory);
      const seals = Number(s.sealsCleared || 0);
      const acc = typeof s.accuracy === 'number' ? s.accuracy : 100;
      const bypasses = Number(s.bypasses || 0);

      if (victory && acc >= 85 && bypasses === 0) return 'S';
      if (victory || (seals >= 4 && acc >= 75)) return 'A';
      if (seals >= 2 || acc >= 55) return 'B';
      return 'C';
    },

    recordAnswer(gameId, topicId, isCorrect) {
      if (!gameId) return null;
      const store = readStore();
      const entry = ensureEntry(store, gameId);
      entry.questionsAnswered += 1;
      if (isCorrect) entry.questionsCorrect += 1;
      entry.lastPlayedISO = new Date().toISOString();

      if (topicId !== undefined && topicId !== null) {
        const key = String(topicId);
        if (!entry.topicStats[key]) entry.topicStats[key] = { attempts: 0, correct: 0 };
        entry.topicStats[key].attempts += 1;
        if (isCorrect) entry.topicStats[key].correct += 1;

        const stats = entry.topicStats[key];
        const ratio = stats.attempts > 0 ? stats.correct / stats.attempts : 0;
        const mSet = new Set(entry.masteredTopics || []);
        const wSet = new Set(entry.weakTopics || []);
        if (stats.correct >= 1 && ratio >= 0.6) {
          mSet.add(key);
          wSet.delete(key);
        } else if (stats.attempts >= 2 && ratio < 0.6) {
          wSet.add(key);
        }
        entry.masteredTopics = Array.from(mSet);
        entry.weakTopics = Array.from(wSet);
      }

      writeStore(store);
      return entry;
    },

    recordSealProgress(gameId, sealsCleared) {
      if (!gameId) return null;
      const store = readStore();
      const entry = ensureEntry(store, gameId);
      const clamped = Math.max(0, Math.min(4, Number(sealsCleared || 0)));
      if (clamped > entry.sealsCleared) {
        entry.sealsCleared = clamped;
      }
      entry.lastPlayedISO = new Date().toISOString();
      writeStore(store);
      return entry;
    },

    recordRun(gameId, run) {
      if (!gameId || !run) return null;
      const store = readStore();
      const entry = ensureEntry(store, gameId);

      const score = Math.max(0, Math.round(Number(run.score || 0)));
      const hasStages = typeof run.totalStages === 'number' && run.totalStages > 0;
      const totalStages = hasStages ? Math.max(1, Math.round(run.totalStages)) : (entry.totalStages || 4);
      const rawStages = typeof run.stagesCleared === 'number' ? run.stagesCleared : Number(run.sealsCleared || 0);
      const stagesCleared = Math.max(0, Math.min(totalStages, Number(rawStages || 0)));
      const seals = Math.max(0, Math.min(4, Number(run.sealsCleared !== undefined ? run.sealsCleared : Math.round((stagesCleared / totalStages) * 4))));
      const qAns = Math.max(0, Number(run.runQuestionsAnswered || 0));
      const qCorr = Math.max(0, Number(run.runQuestionsCorrect || 0));
      const accuracy = typeof run.accuracy === 'number'
        ? Math.max(0, Math.min(100, Math.round(run.accuracy)))
        : (qAns > 0 ? Math.round((qCorr / qAns) * 100) : 100);
      const bypasses = Math.max(0, Number(run.bypasses || 0));
      const victory = Boolean(run.victory);

      const isNewBest = score > entry.bestScore;
      if (isNewBest) entry.bestScore = score;
      if (seals > entry.sealsCleared) entry.sealsCleared = seals;
      if (hasStages) entry.totalStages = totalStages;
      if (stagesCleared > (entry.stagesCleared || 0)) entry.stagesCleared = stagesCleared;
      if (victory) entry.bossDefeated = true;

      const rank = run.rank || Progress.computeRank({
        victory,
        accuracy,
        sealsCleared: Math.round((stagesCleared / totalStages) * 4),
        bypasses
      });
      if (!entry.bestRank || (RANK_ORDER[rank] || 0) > (RANK_ORDER[entry.bestRank] || 0)) {
        entry.bestRank = rank;
      }

      if (!run.answersAlreadyRecorded) {
        entry.questionsAnswered += qAns;
        entry.questionsCorrect += qCorr;
      }

      entry.lastAccuracy = accuracy;
      entry.bypassesUsed += bypasses;
      entry.runsCompleted += 1;
      entry.lastPlayedISO = new Date().toISOString();

      writeStore(store);
      return { entry, rank, isNewBest, accuracy };
    },

    getGameProgress(gameId) {
      const store = readStore();
      return store.games[gameId] || createEmptyGameEntry();
    },

    getAllProgress() {
      return readStore();
    },

    getSummary(totalGames = 1) {
      const store = readStore();
      const entries = Object.values(store.games || {});
      let gamesPlayed = 0;
      let bossesDefeated = 0;
      let totalSeals = 0;
      let totalStagesMax = 0;
      let questionsAnswered = 0;
      let questionsCorrect = 0;

      for (let i = 0; i < entries.length; i += 1) {
        const g = entries[i];
        if (!g) continue;
        const tStages = g.totalStages > 0 ? g.totalStages : 4;
        const cStages = typeof g.stagesCleared === 'number' && g.totalStages > 0
          ? g.stagesCleared
          : Number(g.sealsCleared || 0);
        if ((g.runsCompleted || 0) > 0 || (g.questionsAnswered || 0) > 0 || cStages > 0) {
          gamesPlayed += 1;
        }
        if (g.bossDefeated) bossesDefeated += 1;
        totalSeals += cStages;
        totalStagesMax += tStages;
        questionsAnswered += Number(g.questionsAnswered || 0);
        questionsCorrect += Number(g.questionsCorrect || 0);
      }

      const accuracyPct = questionsAnswered > 0
        ? Math.round((questionsCorrect / questionsAnswered) * 100)
        : 0;

      return {
        totalGames,
        gamesPlayed,
        bossesDefeated,
        totalSeals,
        totalStagesMax: Math.max(totalStagesMax, totalGames * 4),
        questionsAnswered,
        questionsCorrect,
        accuracyPct,
        updatedAt: store.updatedAt
      };
    },

    computeGameMetrics(gameId) {
      const e = Progress.getGameProgress(gameId);
      const bestScore = Math.max(0, Number(e.bestScore || 0));
      const totalStages = e.totalStages > 0 ? Math.max(1, Number(e.totalStages)) : 4;
      const stagesCleared = e.totalStages > 0
        ? Math.max(0, Math.min(totalStages, Number(e.stagesCleared || 0)))
        : Math.max(0, Math.min(4, Number(e.sealsCleared || 0)));
      const sealsCleared = Math.max(0, Math.min(4, Number(e.sealsCleared || 0)));
      const bossDefeated = Boolean(e.bossDefeated);
      const qAns = Math.max(0, Number(e.questionsAnswered || 0));
      const qCorr = Math.max(0, Number(e.questionsCorrect || 0));
      const accuracyPct = qAns > 0
        ? Math.min(100, Math.round((qCorr / qAns) * 100))
        : (typeof e.lastAccuracy === 'number' ? Math.max(0, Math.min(100, Math.round(e.lastAccuracy))) : 0);
      const masteredTopics = Array.isArray(e.masteredTopics) ? e.masteredTopics : [];
      const weakTopics = Array.isArray(e.weakTopics) ? e.weakTopics : [];
      const played = Boolean(
        (e.runsCompleted || 0) > 0 || qAns > 0 || stagesCleared > 0 || bossDefeated || bestScore > 0
      );

      // Weighted 0..100 mastery progress: 50% stages/challenges, 25% completion/victory, 25% accuracy
      const stageScore = (stagesCleared / totalStages) * 50;
      const bossScore = bossDefeated ? 25 : 0;
      const accScore = played ? ((qAns > 0 || typeof e.lastAccuracy === 'number') ? (accuracyPct / 100) * 25 : (bestScore > 0 ? 15 : 0)) : 0;
      const masteryPct = Math.max(0, Math.min(100, Math.round(stageScore + bossScore + accScore)));

      return {
        bestScore,
        bestRank: e.bestRank || null,
        sealsCleared,
        stagesCleared,
        totalStages,
        bossDefeated,
        questionsAnswered: qAns,
        questionsCorrect: qCorr,
        accuracyPct,
        runsCompleted: Number(e.runsCompleted || 0),
        masteredTopics,
        weakTopics,
        played,
        masteryPct,
        lastPlayedISO: e.lastPlayedISO || null
      };
    },

    getSmartReviewQueue(gamesList) {
      const list = Array.isArray(gamesList) ? gamesList : [];
      const items = [];

      for (let i = 0; i < list.length; i += 1) {
        const g = list[i];
        if (!g || !g.id) continue;
        const m = Progress.computeGameMetrics(g.id);
        let priority = 0;
        let tag = 'متقن';
        let reason = 'وحدة مكتملة بنجاح';

        if (m.weakTopics.length > 0 || (m.questionsAnswered >= 2 && m.accuracyPct < 75)) {
          priority = 3;
          tag = 'أولوية قصوى';
          reason = m.weakTopics.length > 0
            ? `${m.weakTopics.length} محاور ضعيفة • دقة ${m.accuracyPct}%`
            : `دقة ${m.accuracyPct}% تحتاج تعزيزاً`;
        } else if (m.played && !m.bossDefeated) {
          priority = 2;
          tag = 'استكمال';
          reason = `تقدّم جزئي (${m.stagesCleared}/${m.totalStages} مراحل) قبل الإكمال`;
        } else if (!m.played) {
          priority = 1;
          tag = 'لم تبدأ';
          reason = g.topicRange ? `وحدة لم تُفتح بعد (${g.topicRange})` : 'وحدة تأسيس جاهزة للانطلاق';
        } else if (m.bestRank === 'B' || m.bestRank === 'C') {
          priority = 1;
          tag = 'تحسين الرتبة';
          reason = `ترقية الرتبة الحالية (${m.bestRank}) نحو A / S`;
        }

        if (priority > 0) {
          items.push({ game: g, metrics: m, priority, tag, reason });
        }
      }

      items.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        if (a.priority === 3 && a.metrics.accuracyPct !== b.metrics.accuracyPct) {
          return a.metrics.accuracyPct - b.metrics.accuracyPct;
        }
        const oa = typeof a.game.order === 'number' ? a.game.order : 9999;
        const ob = typeof b.game.order === 'number' ? b.game.order : 9999;
        return oa - ob;
      });

      return items;
    },

    exportJSON() {
      return JSON.stringify(readStore(), null, 2);
    },

    importJSON(raw) {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!parsed || typeof parsed !== 'object' || !parsed.games || typeof parsed.games !== 'object' || Array.isArray(parsed.games)) {
        throw new Error('Invalid ArcadeCore progress backup format.');
      }
      const normalized = createEmptyStore();
      const keys = Object.keys(parsed.games);
      for (let i = 0; i < keys.length; i += 1) {
        const gid = keys[i];
        const src = parsed.games[gid];
        if (src && typeof src === 'object' && !Array.isArray(src)) {
          normalized.games[gid] = Object.assign(createEmptyGameEntry(), src);
        }
      }
      return writeStore(normalized);
    },

    resetGame(gameId) {
      const store = readStore();
      delete store.games[gameId];
      return writeStore(store);
    },

    resetAll() {
      return writeStore(createEmptyStore());
    }
  };

  /**
   * Lightweight 2D Cartesian grid, axis, asymptote & LTR math-label helper for graphSpec canvases.
   */
  const CanvasAxisKit = {
    clearWithGrid(ctx, w, h, opts) {
      if (!ctx) return;
      const o = opts || {};
      const bg = o.bg || '#060c1f';
      const gridColor = o.gridColor || 'rgba(56, 189, 248, 0.1)';
      const step = o.step || 32;
      const offset = o.offset !== undefined ? o.offset : 24;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = offset; x < w; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = offset; y < h; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();
    },

    drawCartesianAxes(ctx, opts) {
      if (!ctx) return;
      const o = opts || {};
      const w = o.w || 390;
      const h = o.h || 185;
      const ox = o.ox !== undefined ? o.ox : w * 0.5;
      const oy = o.oy !== undefined ? o.oy : h * 0.55;
      const axisColor = o.axisColor || 'rgba(148, 163, 184, 0.55)';
      const labelColor = o.labelColor || '#94a3b8';

      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(12, oy);
      ctx.lineTo(w - 12, oy);
      ctx.moveTo(ox, h - 10);
      ctx.lineTo(ox, 10);
      ctx.stroke();

      CanvasAxisKit.drawMathLabel(ctx, o.xLabel || 'x', w - 18, oy - 8, { color: labelColor });
      CanvasAxisKit.drawMathLabel(ctx, o.yLabel || 'y', ox + 10, 16, { color: labelColor });
      if (o.showOrigin !== false) {
        CanvasAxisKit.drawMathLabel(ctx, 'O', ox - 10, oy + 13, { color: labelColor });
      }
    },

    drawDashedLine(ctx, x1, y1, x2, y2, color, dash, lineWidth) {
      if (!ctx) return;
      ctx.save();
      ctx.setLineDash(dash || [5, 5]);
      ctx.strokeStyle = color || '#fbbf24';
      ctx.lineWidth = lineWidth || 1.6;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    },

    drawMathLabel(ctx, text, x, y, opts) {
      if (!ctx) return;
      const o = opts || {};
      if (o.rich !== false && /[₀₁₂₃₄₅₆₇₈₉ₙ⁰¹²³⁴⁵⁶⁷⁸⁹ˣⁿ√]|_\{|\^\{|\b(?:d\/dx)\b|\\frac|\\sqrt/.test(String(text ?? ''))) {
        CanvasAxisKit.drawMathRich(ctx, text, x, y, o);
        return;
      }
      ctx.save();
      ctx.direction = 'ltr';
      ctx.font = o.font || '800 11px "KaTeX_Main", "JetBrains Mono", monospace';
      ctx.textAlign = o.align || 'center';
      ctx.textBaseline = o.baseline || 'alphabetic';
      ctx.fillStyle = o.color || '#f8fafc';
      ctx.fillText(String(text ?? ''), x, y);
      ctx.restore();
    },

    /**
     * Draw crisp textbook math on Canvas 2D using KaTeX_Math / KaTeX_Main fonts:
     * supports stacked fractions (d/dx, \frac{a}{b}), roots (√2, \sqrt{...}), subscripts & superscripts.
     */
    drawMathRich(ctx, expr, x, y, opts) {
      if (!ctx) return;
      const o = opts || {};
      const size = Number(o.fontSize || 13);
      const color = o.color || '#f8fafc';
      const bold = o.bold !== false;
      const align = o.align || 'center';
      const baseline = o.baseline || 'middle';
      const norm = convertUnicodeScripts(String(expr ?? ''));

      const mainFont = (sz) => `${bold ? '700 ' : ''}${sz}px "KaTeX_Main", "Cambria Math", Georgia, serif`;
      const mathFont = (sz) => `italic ${bold ? '700 ' : ''}${sz}px "KaTeX_Math", "Cambria Math", Georgia, serif`;

      // Fast parse tokens: \frac{a}{b}, d/dx, \sqrt{a}, √a, base_{sub}, base^{sup}, words/operators
      function tokenizeRich(s) {
        const parts = [];
        let i = 0;
        const readBrace = () => {
          if (s[i] !== '{') { const ch = s[i] || ''; i += 1; return ch; }
          let depth = 1; i += 1;
          const start = i;
          while (i < s.length && depth > 0) {
            if (s[i] === '{') depth += 1;
            else if (s[i] === '}') depth -= 1;
            i += 1;
          }
          return s.slice(start, i - 1);
        };
        while (i < s.length) {
          if (s.startsWith('\\frac', i)) {
            i += 5;
            const num = readBrace();
            const den = readBrace();
            parts.push({ type: 'frac', num, den });
          } else if (s.startsWith('d/dx', i)) {
            i += 4;
            parts.push({ type: 'frac', num: 'd', den: 'dx' });
          } else if (s.startsWith('\\sqrt', i)) {
            i += 5;
            const arg = readBrace();
            parts.push({ type: 'sqrt', arg });
          } else if (s[i] === '√') {
            i += 1;
            let arg = '';
            if (s[i] === '(') {
              let d = 1; i += 1; const st = i;
              while (i < s.length && d > 0) {
                if (s[i] === '(') d += 1; else if (s[i] === ')') d -= 1;
                i += 1;
              }
              arg = s.slice(st, i - 1);
            } else {
              while (i < s.length && /[A-Za-z0-9.]/.test(s[i])) { arg += s[i]; i += 1; }
            }
            parts.push({ type: 'sqrt', arg });
          } else if (s[i] === '_' || s[i] === '^') {
            const kind = s[i] === '_' ? 'sub' : 'sup';
            i += 1;
            const val = s[i] === '{' ? readBrace() : (s[i++] || '');
            parts.push({ type: kind, val });
          } else if (/[A-Za-z]/.test(s[i])) {
            let word = '';
            while (i < s.length && /[A-Za-z]/.test(s[i])) { word += s[i]; i += 1; }
            const isFn = /^(sin|cos|tan|ln|log|exp|lim|dx)$/.test(word);
            parts.push({ type: 'text', val: word, italic: !isFn });
          } else {
            let chunk = '';
            while (i < s.length && !/[A-Za-z_^√\\]/.test(s[i]) && !s.startsWith('d/dx', i)) {
              chunk += s[i];
              i += 1;
            }
            if (chunk) parts.push({ type: 'text', val: chunk, italic: false });
          }
        }
        return parts;
      }

      function measureRich(tokens, sz) {
        let w = 0;
        const subSz = Math.max(8, Math.round(sz * 0.7));
        for (let k = 0; k < tokens.length; k += 1) {
          const t = tokens[k];
          if (t.type === 'frac') {
            const fSz = Math.max(8, Math.round(sz * 0.72));
            const wN = measureRich(tokenizeRich(t.num), fSz);
            const wD = measureRich(tokenizeRich(t.den), fSz);
            w += Math.max(wN, wD) + 4;
          } else if (t.type === 'sqrt') {
            w += sz * 0.65 + measureRich(tokenizeRich(t.arg), sz) + 3;
          } else if (t.type === 'sub' || t.type === 'sup') {
            ctx.font = mathFont(subSz);
            w += ctx.measureText(t.val).width + 1;
          } else {
            ctx.font = t.italic ? mathFont(sz) : mainFont(sz);
            w += ctx.measureText(t.val).width;
          }
        }
        return w;
      }

      function paintRich(tokens, startX, baseY, sz) {
        let cx = startX;
        const subSz = Math.max(8, Math.round(sz * 0.7));
        for (let k = 0; k < tokens.length; k += 1) {
          const t = tokens[k];
          if (t.type === 'frac') {
            const fSz = Math.max(8, Math.round(sz * 0.72));
            const nTok = tokenizeRich(t.num);
            const dTok = tokenizeRich(t.den);
            const wN = measureRich(nTok, fSz);
            const wD = measureRich(dTok, fSz);
            const fw = Math.max(wN, wD) + 4;
            paintRich(nTok, cx + (fw - wN) * 0.5, baseY - sz * 0.44, fSz);
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, sz * 0.085);
            ctx.beginPath();
            ctx.moveTo(cx + 1, baseY);
            ctx.lineTo(cx + fw - 1, baseY);
            ctx.stroke();
            paintRich(dTok, cx + (fw - wD) * 0.5, baseY + sz * 0.48, fSz);
            cx += fw + 1;
          } else if (t.type === 'sqrt') {
            const aTok = tokenizeRich(t.arg);
            const aW = measureRich(aTok, sz);
            const radW = sz * 0.62;
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1.1, sz * 0.09);
            ctx.beginPath();
            ctx.moveTo(cx + 1, baseY + sz * 0.08);
            ctx.lineTo(cx + radW * 0.35, baseY + sz * 0.38);
            ctx.lineTo(cx + radW * 0.78, baseY - sz * 0.45);
            ctx.lineTo(cx + radW + aW + 2, baseY - sz * 0.45);
            ctx.stroke();
            paintRich(aTok, cx + radW, baseY + sz * 0.04, sz);
            cx += radW + aW + 4;
          } else if (t.type === 'sub' || t.type === 'sup') {
            ctx.font = /^[0-9+\-=()]+$/.test(t.val) ? mainFont(subSz) : mathFont(subSz);
            ctx.fillText(t.val, cx, baseY + (t.type === 'sub' ? sz * 0.28 : -sz * 0.34));
            cx += ctx.measureText(t.val).width + 1;
          } else {
            ctx.font = t.italic ? mathFont(sz) : mainFont(sz);
            ctx.fillText(t.val, cx, baseY);
            cx += ctx.measureText(t.val).width;
          }
        }
      }

      const tokens = tokenizeRich(norm);
      ctx.save();
      ctx.direction = 'ltr';
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const totalW = measureRich(tokens, size);
      const sx = align === 'center' ? x - totalW * 0.5 : (align === 'right' ? x - totalW : x);
      const sy = baseline === 'alphabetic' ? y - size * 0.3 : y;
      paintRich(tokens, sx, sy, size);
      ctx.restore();
    }
  };

  return {
    version: '1.2.0',
    renderMath,
    renderAllMath,
    setBidiSafeMath,
    Gamepad,
    Progress,
    CanvasAxisKit
  };
});
