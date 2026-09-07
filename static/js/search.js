/**
 * Live Search Modal for Bakingo Kanpur
 */

class SearchManager {
  constructor() {
    this.modalOverlay = document.getElementById('search-modal-overlay');
    this.searchInput = document.getElementById('live-search-input');
    this.resultsContainer = document.getElementById('live-search-results');
    this.debounceTimer = null;

    this.init();
  }

  init() {
    this.setupListeners();
  }

  setupListeners() {
    // Open search modal triggers
    document.querySelectorAll('.open-search-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    });

    // Close search modal triggers
    document.querySelectorAll('.close-search-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeModal();
      });
    });

    // Keyboard shortcuts (Cmd+K or Ctrl+K or /)
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openModal();
      }
      if (e.key === 'Escape' && this.modalOverlay && this.modalOverlay.classList.contains('open')) {
        this.closeModal();
      }
    });

    // Search Input Debouncing
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        clearTimeout(this.debounceTimer);
        const query = e.target.value.trim();
        this.debounceTimer = setTimeout(() => {
          this.performSearch(query);
        }, 220);
      });
    }

    // Quick tag clicks in search modal
    document.querySelectorAll('.search-quick-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const text = tag.dataset.query || tag.textContent.trim();
        if (this.searchInput) {
          this.searchInput.value = text;
          this.performSearch(text);
        }
      });
    });
  }

  openModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        if (this.searchInput) this.searchInput.focus();
      }, 100);
    }
  }

  closeModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  async performSearch(query) {
    if (!this.resultsContainer) return;

    if (!query) {
      this.resultsContainer.innerHTML = `
        <div class="py-6 text-center text-xs text-gray-400">
          Type to find cakes, cupcakes, brownies, cheesecakes & gift hampers in Kanpur...
        </div>
      `;
      return;
    }

    this.resultsContainer.innerHTML = `
      <div class="text-center py-6">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-pink-500 border-t-transparent"></div>
      </div>
    `;

    const res = await window.API.getProducts({ search: query });
    const products = res.products || [];

    if (products.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="py-8 text-center px-4">
          <div class="text-3xl mb-2">🍰</div>
          <p class="text-sm font-semibold text-gray-700">No sweet results for "${query}"</p>
          <p class="text-xs text-gray-500 mt-1">Try searching for "Chocolate", "Red Velvet", "Birthday", or "Cheesecake".</p>
        </div>
      `;
      return;
    }

    this.resultsContainer.innerHTML = `
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Found ${products.length} sweet matches in Kanpur</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
        ${products.map(p => `
          <div class="flex items-center gap-3 p-2.5 rounded-xl border border-pink-100 hover:border-pink-300 hover:bg-pink-50/50 transition-all cursor-pointer" onclick="window.app.openProductModal('${p.id}'); window.searchManager.closeModal();">
            <img src="${p.image}" alt="${p.name}" class="w-14 h-14 rounded-lg object-cover flex-shrink-0 shadow-sm" />
            <div class="flex-1 min-w-0">
              <h5 class="text-xs font-bold text-gray-900 truncate">${p.name}</h5>
              <p class="text-[11px] text-gray-500 truncate">${p.tagline}</p>
              <div class="flex items-center justify-between mt-1">
                <span class="text-xs font-bold text-pink-600">Starting ₹${p.starting_price}</span>
                <span class="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded font-medium">${p.category_name || 'Cake'}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.searchManager = new SearchManager();
});
