/**
 * Math Arcade - Hub Controller
 * Dynamic catalog rendering, Gamepad API navigation, real-time filtering, audio feedback, and modal controllers.
 */

import { sound } from '../shared/retro-audio.js';
import { gamepad } from '../shared/gamepad.js';

class ArcadeHub {
  constructor() {
    this.games = [];
    this.activeCategory = 'All';
    this.searchQuery = '';

    // DOM Elements
    this.grid = document.getElementById('games-grid');
    this.searchInput = document.getElementById('search-input');
    this.categoryContainer = document.getElementById('category-pills');
    this.statsCounter = document.getElementById('stats-counter');
    this.modalOverlay = document.getElementById('game-modal');
    this.guideModal = document.getElementById('guide-modal');
    this.soundToggleBtn = document.getElementById('sound-toggle');
    this.gamepadBadge = document.getElementById('gamepad-status-badge');
    this.gamepadHud = document.getElementById('gamepad-hud');
    this.gpName = document.getElementById('gp-name');

    // Gamepad Navigation State
    this.focusableElements = [];
    this.focusedIndex = -1;
    this.gamepadNavCooldown = 0;

    this.init();
  }

  async init() {
    this.bindEvents();
    this.initGamepad();
    await this.loadGames();
    this.renderCategories();
    this.render();
    this.startLoop();
  }

  async loadGames() {
    try {
      const response = await fetch('games.json?t=' + Date.now());
      if (!response.ok) throw new Error('Failed to load games.json');
      this.games = await response.json();
    } catch (err) {
      console.error('Error loading game catalog:', err);
      this.games = [];
    }
  }

  bindEvents() {
    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.searchInput) {
        e.preventDefault();
        this.searchInput?.focus();
      }
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });

    // Modal background clicks
    this.modalOverlay?.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) this.closeModals();
    });
    this.guideModal?.addEventListener('click', (e) => {
      if (e.target === this.guideModal) this.closeModals();
    });

    // Contributor guide button
    document.getElementById('btn-add-game-guide')?.addEventListener('click', () => {
      sound.playClick();
      this.openGuideModal();
    });

    // Sound toggle
    this.soundToggleBtn?.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      this.soundToggleBtn.innerHTML = isMuted ? '🔇 Audio Muted' : '🔊 Audio Active';
      if (!isMuted) sound.playClick();
    });
  }

  initGamepad() {
    gamepad.onConnect = (gp) => {
      sound.playAnnihilation();
      if (this.gamepadBadge) {
        this.gamepadBadge.style.display = 'inline-block';
        this.gamepadBadge.innerText = '🎮 ' + gamepad.getControllerType();
      }
      if (this.gamepadHud) {
        this.gamepadHud.classList.add('visible');
      }
      if (this.gpName) {
        this.gpName.innerText = gamepad.getControllerType().split(' ')[0] || 'Gamepad';
      }
    };

    gamepad.onDisconnect = () => {
      if (this.gamepadBadge) {
        this.gamepadBadge.style.display = 'none';
      }
      if (this.gamepadHud) {
        this.gamepadHud.classList.remove('visible');
      }
      this.clearGamepadFocus();
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
    const hasGamepad = gamepad.poll();
    if (!hasGamepad) return;

    // Show HUD if connected
    if (this.gamepadHud && !this.gamepadHud.classList.contains('visible')) {
      this.gamepadHud.classList.add('visible');
      if (this.gamepadBadge) {
        this.gamepadBadge.style.display = 'inline-block';
        this.gamepadBadge.innerText = '🎮 ' + gamepad.getControllerType();
      }
    }

    // Cooldown for navigational stick/dpad inputs (approx 180ms)
    if (timestamp < this.gamepadNavCooldown) return;

    const stickY = gamepad.axes.leftY;
    const stickX = gamepad.axes.leftX;
    const dpadUp = gamepad.buttons.dpadUp;
    const dpadDown = gamepad.buttons.dpadDown;
    const dpadLeft = gamepad.buttons.dpadLeft;
    const dpadRight = gamepad.buttons.dpadRight;

    // Navigation triggers
    const navDown = dpadDown || stickY > 0.5;
    const navUp = dpadUp || stickY < -0.5;
    const navRight = dpadRight || stickX > 0.5;
    const navLeft = dpadLeft || stickX < -0.5;

    if (navDown || navUp || navRight || navLeft) {
      this.handleGamepadDirection(navDown || navRight ? 1 : -1);
      this.gamepadNavCooldown = timestamp + 180;
      sound.playClick();
      gamepad.triggerHaptic(40, 0.2, 0.2);
    }

    // Button 0: Cross ✕ / A -> Confirm / Click
    if (gamepad.isJustPressed('cross')) {
      this.handleGamepadConfirm();
      this.gamepadNavCooldown = timestamp + 220;
    }

    // Button 1: Circle ◯ / B -> Back / Cancel / Close Modals
    if (gamepad.isJustPressed('circle')) {
      this.handleGamepadBack();
      this.gamepadNavCooldown = timestamp + 220;
    }

    // Button 3: Triangle △ / Y -> Focus Search
    if (gamepad.isJustPressed('triangle')) {
      if (this.searchInput) {
        this.searchInput.focus();
        sound.playClick();
        gamepad.triggerHaptic(50, 0.3, 0.3);
      }
      this.gamepadNavCooldown = timestamp + 220;
    }

    // Button 2: Square ▢ / X -> Toggle Add Game Guide
    if (gamepad.isJustPressed('square')) {
      this.toggleGuideModal();
      this.gamepadNavCooldown = timestamp + 220;
    }

    // L1 / R1: Cycle Category Tabs
    if (gamepad.isJustPressed('l1')) {
      this.cycleCategories(-1);
      this.gamepadNavCooldown = timestamp + 200;
    }
    if (gamepad.isJustPressed('r1')) {
      this.cycleCategories(1);
      this.gamepadNavCooldown = timestamp + 200;
    }
  }

  refreshFocusableElements() {
    // Collect interactive elements visible on page
    const isModalActive = this.modalOverlay?.classList.contains('active') || this.guideModal?.classList.contains('active');

    let selector = '';
    if (isModalActive) {
      selector = '.modal-overlay.active button, .modal-overlay.active a';
    } else {
      selector = '#search-input, .category-pill, .btn-ghost, .btn-play, .btn-info, #btn-deploy-empty';
    }

    this.focusableElements = Array.from(document.querySelectorAll(selector)).filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && !el.disabled;
    });

    if (this.focusedIndex >= this.focusableElements.length) {
      this.focusedIndex = 0;
    }
  }

  handleGamepadDirection(delta) {
    this.refreshFocusableElements();
    if (this.focusableElements.length === 0) return;

    this.clearGamepadFocus();

    if (this.focusedIndex === -1) {
      this.focusedIndex = delta > 0 ? 0 : this.focusableElements.length - 1;
    } else {
      this.focusedIndex = (this.focusedIndex + delta + this.focusableElements.length) % this.focusableElements.length;
    }

    const target = this.focusableElements[this.focusedIndex];
    if (target) {
      target.classList.add('gp-focused');
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  clearGamepadFocus() {
    this.focusableElements.forEach((el) => el.classList.remove('gp-focused'));
  }

  handleGamepadConfirm() {
    this.refreshFocusableElements();
    const target = this.focusableElements[this.focusedIndex];
    if (target) {
      sound.playDerivativeHit();
      gamepad.triggerHaptic(80, 0.5, 0.5);
      target.click();
    }
  }

  handleGamepadBack() {
    sound.playClick();
    gamepad.triggerHaptic(60, 0.3, 0.3);
    const wasModalOpen = this.modalOverlay?.classList.contains('active') || this.guideModal?.classList.contains('active');
    this.closeModals();

    if (!wasModalOpen && this.searchInput && (this.searchInput.value || document.activeElement === this.searchInput)) {
      this.searchInput.value = '';
      this.searchQuery = '';
      this.searchInput.blur();
      this.render();
    }
  }

  toggleGuideModal() {
    sound.playClick();
    gamepad.triggerHaptic(50, 0.3, 0.3);
    if (this.guideModal?.classList.contains('active')) {
      this.closeModals();
    } else {
      this.openGuideModal();
    }
  }

  openGuideModal() {
    this.closeModals();
    this.guideModal?.classList.add('active');
    this.focusedIndex = -1;
  }

  cycleCategories(direction) {
    const pills = Array.from(document.querySelectorAll('.category-pill'));
    if (pills.length <= 1) return;

    const currentIdx = pills.findIndex((p) => p.classList.contains('active'));
    const nextIdx = (currentIdx + direction + pills.length) % pills.length;
    pills[nextIdx].click();
    gamepad.triggerHaptic(40, 0.2, 0.2);
  }

  renderCategories() {
    if (!this.categoryContainer) return;

    if (this.games.length === 0) {
      this.categoryContainer.innerHTML = `
        <span class="category-pill active">All Categories</span>
      `;
      return;
    }

    // Collect unique categories
    const categories = ['All', ...new Set(this.games.map((g) => g.category).filter(Boolean))];

    this.categoryContainer.innerHTML = categories
      .map(
        (cat) => `
        <button class="category-pill ${cat === this.activeCategory ? 'active' : ''}" data-cat="${cat}">
          ${cat}
        </button>
      `
      )
      .join('');

    this.categoryContainer.querySelectorAll('.category-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.playClick();
        this.activeCategory = btn.getAttribute('data-cat');
        this.categoryContainer.querySelectorAll('.category-pill').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.render();
      });
    });
  }

  getFilteredGames() {
    return this.games.filter((game) => {
      const matchCat = this.activeCategory === 'All' || game.category === this.activeCategory;
      if (!matchCat) return false;

      if (!this.searchQuery) return true;

      const title = (game.title || '').toLowerCase();
      const desc = (game.description || '').toLowerCase();
      const cat = (game.category || '').toLowerCase();
      const concepts = (game.mathConcepts || []).join(' ').toLowerCase();

      return title.includes(this.searchQuery) || desc.includes(this.searchQuery) || cat.includes(this.searchQuery) || concepts.includes(this.searchQuery);
    });
  }

  render() {
    if (!this.grid) return;

    // Case 1: Fresh Empty Platform (0 games added yet)
    if (this.games.length === 0) {
      if (this.statsCounter) {
        this.statsCounter.innerText = '0 Games Installed • Ready';
      }

      this.grid.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-radar-icon">🎮</div>
          <h2 class="empty-title">The Arcade is Ready for Your First Game</h2>
          <p class="empty-desc">
            The platform architecture, high-speed Canvas engine, Gamepad controller module (PlayStation ✕, ◯, ▢, △ / Xbox), and GitHub Pages deployment are live and standing by.
          </p>

          <div class="empty-specs">
            <span class="empty-spec-pill highlight">⚡ Zero Build Dependencies</span>
            <span class="empty-spec-pill highlight">🎮 Gamepad API Active (✕ Select • ◯ Back)</span>
            <span class="empty-spec-pill highlight">📐 Calculus & Physics Engine Ready</span>
            <span class="empty-spec-pill highlight">🌐 Hosted on GitHub Pages</span>
          </div>

          <div style="margin-top: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap; justify-content: center;">
            <button id="btn-deploy-empty" class="btn-play" style="max-width: 280px;">
              🚀 Ready to Inject HTML
            </button>
          </div>
        </div>
      `;

      document.getElementById('btn-deploy-empty')?.addEventListener('click', () => {
        sound.playDerivativeHit();
        this.openGuideModal();
      });
      return;
    }

    // Case 2: Games exist, apply filtering
    const filtered = this.getFilteredGames();

    if (this.statsCounter) {
      this.statsCounter.innerText = `${filtered.length} of ${this.games.length} Games Active`;
    }

    if (filtered.length === 0) {
      this.grid.innerHTML = `
        <div class="empty-state">
          <p>No mathematical games found matching "${this.searchQuery}".</p>
          <small style="color:var(--text-dim); margin-top:0.4rem; display:block;">Try clearing filters or search for another term.</small>
        </div>
      `;
      return;
    }

    this.grid.innerHTML = filtered
      .map((game) => {
        const catClass = (game.category || '').replace(/[^a-zA-Z]/g, '');
        const isPlayable = game.status === 'ready';

        let actionBtn = '';
        if (isPlayable) {
          actionBtn = `<a href="${game.path}" class="btn-play">▶ Launch Game</a>`;
        } else {
          actionBtn = `<button class="btn-play disabled">🔒 In Development</button>`;
        }

        return `
          <article class="game-card" data-id="${game.id}">
            <div class="card-watermark">${game.icon || 'ƒ'}</div>
            <div class="card-header">
              <div class="card-badge-row">
                <span class="badge-tag ${catClass}">${game.category}</span>
                <span class="badge-difficulty diff-${game.difficultyLevel || 3}">Lvl ${game.difficultyLevel || 3} • ${game.difficulty}</span>
              </div>
            </div>

            <h2 class="card-title">${game.title}</h2>
            <p class="card-desc">${game.description}</p>

            <div class="card-concepts">
              ${(game.mathConcepts || []).map((c) => `<span class="concept-chip">${c}</span>`).join('')}
            </div>

            <div class="card-actions">
              ${actionBtn}
              <button class="btn-info" data-action="info" data-id="${game.id}" title="Game Info & Controls">
                ℹ️
              </button>
            </div>
          </article>
        `;
      })
      .join('');

    // Attach listeners
    this.grid.querySelectorAll('[data-action="info"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.playDerivativeHit();
        const id = btn.getAttribute('data-id');
        this.openGameModal(id);
      });
    });
  }

  openGameModal(id) {
    const game = this.games.find((g) => g.id === id);
    if (!game) return;

    const modalTitle = document.getElementById('modal-game-title');
    const modalDesc = document.getElementById('modal-game-desc');
    const modalConcepts = document.getElementById('modal-game-concepts');
    const modalControls = document.getElementById('modal-game-controls');
    const modalAction = document.getElementById('modal-game-action');

    if (modalTitle) modalTitle.innerText = game.title;
    if (modalDesc) modalDesc.innerText = game.description;

    if (modalConcepts) {
      modalConcepts.innerHTML = (game.mathConcepts || []).map((c) => `<li>${c}</li>`).join('');
    }

    if (modalControls) {
      modalControls.innerHTML = (game.controls || ['Standard Gamepad / Keyboard / Touch']).map((c) => `<li>${c}</li>`).join('');
    }

    if (modalAction) {
      modalAction.innerHTML = `<a href="${game.path}" class="btn-play" style="width:100%;">▶ Launch Simulator</a>`;
    }

    this.modalOverlay?.classList.add('active');
    this.focusedIndex = -1;
  }

  closeModals() {
    this.modalOverlay?.classList.remove('active');
    this.guideModal?.classList.remove('active');
    this.focusedIndex = -1;
    this.clearGamepadFocus();
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  new ArcadeHub();
});
