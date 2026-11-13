/**
 * Math Arcade - Hub Controller
 * Dynamic catalog rendering, real-time filtering, audio feedback, and modal controllers.
 */

import { sound } from '../shared/retro-audio.js';

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
    this.modalBox = document.getElementById('modal-content');
    this.guideModal = document.getElementById('guide-modal');
    this.soundToggleBtn = document.getElementById('sound-toggle');

    this.init();
  }

  async init() {
    this.bindEvents();
    await this.loadGames();
    this.renderCategories();
    this.render();
  }

  async loadGames() {
    try {
      const response = await fetch('games.json?t=' + Date.now());
      if (!response.ok) throw new Error('Failed to load games.json');
      this.games = await response.json();
    } catch (err) {
      console.error('Error loading game catalog:', err);
      this.grid.innerHTML = `
        <div class="empty-state">
          <p>⚠️ Failed to load games catalog.</p>
          <small>${err.message}</small>
        </div>
      `;
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
      this.guideModal?.classList.add('active');
    });

    // Sound toggle
    this.soundToggleBtn?.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      this.soundToggleBtn.innerHTML = isMuted ? '🔇 Audio Muted' : '🔊 Audio Active';
      if (!isMuted) sound.playClick();
    });
  }

  renderCategories() {
    if (!this.categoryContainer) return;

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

    const filtered = this.getFilteredGames();

    if (this.statsCounter) {
      this.statsCounter.innerText = `${filtered.length} of ${this.games.length} Games Active`;
    }

    if (filtered.length === 0) {
      this.grid.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <p>No mathematical games found matching "${this.searchQuery}".</p>
          <small style="color:var(--text-dim); margin-top:0.4rem; display:block;">Try clearing filters or search for "Calculus", "Matrix", or "Linear".</small>
        </div>
      `;
      return;
    }

    this.grid.innerHTML = filtered
      .map((game) => {
        const catClass = (game.category || '').replace(/[^a-zA-Z]/g, '');
        const isPlayable = game.status === 'ready';
        const isPending = game.status === 'pending_integration';

        let actionBtn = '';
        if (isPlayable) {
          actionBtn = `<a href="${game.path}" class="btn-play">▶ Launch Game</a>`;
        } else if (isPending) {
          actionBtn = `<button class="btn-play" style="background:rgba(0, 240, 255, 0.15); color:var(--accent-cyan); border:1px solid rgba(0, 240, 255, 0.4);" data-action="inspect" data-id="${game.id}">⏳ Ready for Code</button>`;
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

    // Attach event listeners to card buttons
    this.grid.querySelectorAll('[data-action="info"], [data-action="inspect"]').forEach((btn) => {
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
      modalControls.innerHTML = (game.controls || ['Standard Mouse / Touch controls']).map((c) => `<li>${c}</li>`).join('');
    }

    if (modalAction) {
      if (game.status === 'ready') {
        modalAction.innerHTML = `<a href="${game.path}" class="btn-play" style="width:100%;">▶ Launch Simulator</a>`;
      } else if (game.status === 'pending_integration') {
        modalAction.innerHTML = `
          <div style="background:rgba(0, 240, 255, 0.05); border:1px solid rgba(0, 240, 255, 0.2); padding:1rem; border-radius:8px; font-size:0.85rem; color:var(--text-muted);">
            ⚡ <strong>Awaiting First Game Injection</strong><br>
            The game framework is staged. Paste the HTML and our system will automatically parse, modularize, and deploy it live!
          </div>
        `;
      } else {
        modalAction.innerHTML = `<button class="btn-play disabled" style="width:100%;">Under Active Development</button>`;
      }
    }

    this.modalOverlay?.classList.add('active');
  }

  closeModals() {
    this.modalOverlay?.classList.remove('active');
    this.guideModal?.classList.remove('active');
  }
}

// Bootstrap
window.addEventListener('DOMContentLoaded', () => {
  new ArcadeHub();
});
