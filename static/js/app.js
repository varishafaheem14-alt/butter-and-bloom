/**
 * Main Application Coordinator for Bakingo Kanpur
 */

class App {
  constructor() {
    this.products = [];
    this.categories = [];
    this.occasions = [];
    this.activeCategory = 'all';
    this.activeOccasion = 'all';

    // Elements
    this.bestsellersGrid = document.getElementById('bestsellers-grid');
    this.occasionsGrid = document.getElementById('occasions-products-grid');
    this.dessertsGrid = document.getElementById('desserts-scroll-grid');
    this.giftsGrid = document.getElementById('gifts-grid');
    this.reviewsGrid = document.getElementById('kanpur-reviews-grid');
    this.productModal = document.getElementById('product-detail-modal-overlay');

    this.init();
  }

  async init() {
    await this.loadInitialData();
    this.setupNavigation();
    this.setupCategoryFilters();
    this.setupOccasionFilters();
    this.setupKanpurPincodeChecker();
    this.setupMobileMenu();
    this.setupWishlistModal();
    this.renderAllSections();

    // Initialize custom cake designer if element exists
    if (window.CakeCustomizer) {
      new window.CakeCustomizer();
    }
  }

  async loadInitialData() {
    try {
      const [prodRes, catRes, occRes, revRes] = await Promise.all([
        window.API.getProducts(),
        window.API.getCategories(),
        window.API.getOccasions(),
        window.API.getReviews()
      ]);

      this.products = prodRes.products || [];
      this.categories = catRes || [];
      this.occasions = occRes || [];
      this.reviews = revRes.reviews || [];
    } catch (e) {
      console.error('Error initializing data:', e);
    }
  }

  setupNavigation() {
    // Header scroll background effect
    window.addEventListener('scroll', () => {
      const header = document.getElementById('main-header');
      if (header) {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });

    // Replay 3D intro button
    document.querySelectorAll('.replay-3d-intro-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sessionStorage.removeItem('bakingo_intro_viewed');
        window.location.reload();
      });
    });
  }

  setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle-btn');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    const closeBtn = document.getElementById('close-mobile-nav-btn');

    if (mobileMenuBtn && mobileDrawer) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileDrawer.classList.toggle('hidden');
      });
    }

    if (closeBtn && mobileDrawer) {
      closeBtn.addEventListener('click', () => {
        mobileDrawer.classList.add('hidden');
      });
    }

    // Close mobile nav when clicking nav links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (mobileDrawer) mobileDrawer.classList.add('hidden');
      });
    });
  }

  setupCategoryFilters() {
    document.querySelectorAll('.quick-category-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.quick-category-tab').forEach(t => t.classList.remove('active', 'border-pink-500', 'bg-pink-50'));
        tab.classList.add('active', 'border-pink-500', 'bg-pink-50');

        const cat = tab.dataset.category;
        this.activeCategory = cat;
        this.renderBestsellers(cat);
      });
    });
  }

  setupOccasionFilters() {
    document.querySelectorAll('.occasion-filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.occasion-filter-chip').forEach(c => {
          c.classList.remove('bg-pink-600', 'text-white', 'border-pink-600');
          c.classList.add('bg-white', 'text-gray-700', 'border-pink-200');
        });
        chip.classList.remove('bg-white', 'text-gray-700', 'border-pink-200');
        chip.classList.add('bg-pink-600', 'text-white', 'border-pink-600');

        const occ = chip.dataset.occasion;
        this.activeOccasion = occ;
        this.renderOccasions(occ);
      });
    });
  }

  setupKanpurPincodeChecker() {
    const pinInput = document.getElementById('kanpur-hub-pincode-input');
    const pinBtn = document.getElementById('kanpur-hub-pincode-btn');
    const pinResult = document.getElementById('kanpur-hub-pincode-result');

    if (pinBtn && pinInput) {
      pinBtn.addEventListener('click', async () => {
        const pin = pinInput.value.trim();
        if (pin.length !== 6) {
          pinResult.innerHTML = '<span class="text-rose-500 font-medium">Please enter a valid 6-digit Kanpur pincode</span>';
          return;
        }
        pinResult.innerHTML = '<span class="text-gray-400">Verifying delivery route from Darshan Purwa Hub...</span>';
        const res = await window.API.checkPincode(pin);
        if (res.available) {
          pinResult.innerHTML = `
            <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs mt-2">
              <span class="font-bold">✓ ${res.message}</span>
              <p class="mt-0.5 text-emerald-700">Estimated transit: <strong>${res.delivery_time}</strong> to ${res.area}</p>
            </div>
          `;
        } else {
          pinResult.innerHTML = `
            <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs mt-2">
              <span>✕ ${res.message}</span>
            </div>
          `;
        }
      });
    }
  }

  setupWishlistModal() {
    const wishlistBackdrop = document.getElementById('wishlist-modal-overlay');
    document.querySelectorAll('.open-wishlist-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (wishlistBackdrop) {
          wishlistBackdrop.classList.add('open');
          document.body.style.overflow = 'hidden';
          this.renderWishlistItems();
        }
      });
    });

    document.querySelectorAll('.close-wishlist-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        if (wishlistBackdrop) {
          wishlistBackdrop.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });
  }

  renderWishlistItems() {
    const container = document.getElementById('wishlist-items-container');
    const wishlist = window.store.wishlist;

    if (!container) return;

    if (wishlist.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 px-4">
          <div class="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">♡</div>
          <h4 class="font-serif text-lg font-bold text-gray-800">Your wishlist is empty</h4>
          <p class="text-xs text-gray-500 mt-1 mb-4">Tap the heart on any cake to save it for your next celebration.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = wishlist.map(p => `
      <div class="flex items-center justify-between p-3 border border-pink-100 rounded-xl hover:bg-pink-50/40">
        <div class="flex items-center gap-3">
          <img src="${p.image}" alt="${p.name}" class="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
          <div>
            <h5 class="text-xs font-bold text-gray-900">${p.name}</h5>
            <p class="text-xs text-pink-600 font-semibold mt-0.5">Starting ₹${p.starting_price}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="window.app.openProductModal('${p.id}'); document.getElementById('wishlist-modal-overlay').classList.remove('open');" class="btn-primary-pink text-xs py-1.5 px-3">
            View Details
          </button>
          <button onclick="window.store.toggleWishlist({id: '${p.id}', name: '${p.name}'}); window.app.renderWishlistItems();" class="text-gray-400 hover:text-rose-500 text-xs p-1">
            ✕
          </button>
        </div>
      </div>
    `).join('');
  }

  renderAllSections() {
    this.renderBestsellers('all');
    this.renderOccasions('all');
    this.renderDesserts();
    this.renderGifts();
    this.renderReviews();
  }

  renderBestsellers(category = 'all') {
    if (!this.bestsellersGrid) return;

    let list = this.products.filter(p => p.is_bestseller || p.category === 'chocolate' || p.category === 'love');
    if (category !== 'all') {
      list = this.products.filter(p => p.category === category);
    }

    this.bestsellersGrid.innerHTML = list.slice(0, 8).map(p => this.createProductCardHTML(p)).join('');
  }

  renderOccasions(occasion = 'all') {
    if (!this.occasionsGrid) return;

    let list = this.products;
    if (occasion !== 'all') {
      list = this.products.filter(p => (p.occasions || []).includes(occasion));
    }

    this.occasionsGrid.innerHTML = list.slice(0, 6).map(p => this.createProductCardHTML(p)).join('');
  }

  renderDesserts() {
    if (!this.dessertsGrid) return;
    const desserts = this.products.filter(p => p.category === 'desserts');
    this.dessertsGrid.innerHTML = desserts.map(p => this.createProductCardHTML(p)).join('');
  }

  renderGifts() {
    if (!this.giftsGrid) return;
    const gifts = this.products.filter(p => p.category === 'gifts');
    this.giftsGrid.innerHTML = gifts.map(p => this.createProductCardHTML(p)).join('');
  }

  renderReviews() {
    if (!this.reviewsGrid) return;
    this.reviewsGrid.innerHTML = this.reviews.map(r => `
      <div class="bg-white p-6 rounded-2xl border border-pink-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5">
              <img src="${r.avatar}" alt="${r.name}" class="w-10 h-10 rounded-full object-cover border border-pink-200" />
              <div>
                <h5 class="text-sm font-bold text-gray-900">${r.name}</h5>
                <p class="text-[11px] text-pink-600 font-medium">${r.location}</p>
              </div>
            </div>
            <div class="text-amber-400 text-xs">★★★★★</div>
          </div>
          <p class="text-xs text-gray-600 leading-relaxed italic">"${r.comment}"</p>
        </div>
        <div class="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between text-[11px] text-gray-400">
          <span class="truncate pr-2 font-medium text-gray-700">Ordered: ${r.product_name}</span>
          <span class="flex-shrink-0">${r.date}</span>
        </div>
      </div>
    `).join('');
  }

  createProductCardHTML(p) {
    const isWishlisted = window.store.isInWishlist(p.id);
    return `
      <div class="product-card group">
        <div class="product-img-wrapper cursor-pointer" onclick="window.app.openProductModal('${p.id}')">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
          <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation(); window.app.handleWishlistToggle('${p.id}', this)" title="Add to Wishlist">
            ♡
          </button>
          <div class="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1.5 pointer-events-none">
            ${p.is_bestseller ? '<span class="badge-bestseller">★ Bestseller</span>' : ''}
            ${p.is_eggless ? '<span class="badge-eggless"><span class="badge-eggless-icon"></span>100% Veg</span>' : ''}
          </div>
        </div>
        <div class="p-4 flex flex-col flex-1 justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span class="font-medium text-pink-600 uppercase tracking-wider text-[10px]">${p.category_name || 'Cake'}</span>
              <span class="flex items-center text-amber-500 font-semibold">★ ${p.rating} <span class="text-gray-400 font-normal ml-0.5">(${p.reviews_count || 50}+)</span></span>
            </div>
            <h4 class="font-serif font-bold text-gray-900 text-base mb-1 group-hover:text-pink-600 transition-colors cursor-pointer" onclick="window.app.openProductModal('${p.id}')">
              ${p.name}
            </h4>
            <p class="text-xs text-gray-500 line-clamp-2 mb-3">${p.tagline || p.description}</p>
          </div>

          <div class="pt-3 border-t border-pink-50 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-gray-400 block">Starting from</span>
              <span class="font-bold text-gray-900 text-base">₹${p.starting_price}</span>
            </div>
            <button onclick="window.app.openProductModal('${p.id}')" class="btn-primary-pink text-xs py-2 px-3.5 shadow-none">
              View Options 🎀
            </button>
          </div>
        </div>
      </div>
    `;
  }

  handleWishlistToggle(productId, btnEl) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      window.store.toggleWishlist(product);
      if (btnEl) {
        btnEl.classList.toggle('active');
      }
    }
  }

  async openProductModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product || !this.productModal) return;

    let activeWeight = (product.weights && product.weights[0]) || { weight: '0.5 kg', price: product.starting_price, servings: '4-6 Portions' };

    const modalContent = document.getElementById('product-detail-modal-body');
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <!-- Image & Gallery -->
        <div>
          <div class="rounded-2xl overflow-hidden bg-pink-50 border border-pink-100 relative shadow-sm">
            <img id="modal-main-img" src="${product.image}" alt="${product.name}" class="w-full h-80 object-cover" />
            <div class="absolute top-3 left-3 flex gap-1.5">
              ${product.is_eggless ? '<span class="badge-eggless"><span class="badge-eggless-icon"></span>100% Eggless Pure Veg</span>' : ''}
            </div>
          </div>
          ${product.gallery && product.gallery.length > 1 ? `
            <div class="flex gap-2 mt-3 overflow-x-auto pb-1">
              ${product.gallery.map(img => `
                <img src="${img}" class="w-16 h-16 rounded-xl object-cover border-2 border-pink-200 cursor-pointer hover:border-pink-500 flex-shrink-0" onclick="document.getElementById('modal-main-img').src='${img}'" />
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Product Options & Details -->
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-bold text-pink-600 uppercase tracking-wider">${product.category_name || 'Artisan Cake'}</span>
              <span class="text-xs text-amber-500 font-bold">★ ${product.rating} (${product.reviews_count || 80}+ reviews)</span>
            </div>
            <h3 class="font-serif text-2xl font-bold text-gray-900 mb-2">${product.name}</h3>
            <p class="text-xs text-gray-600 mb-4 leading-relaxed">${product.description}</p>

            <!-- Weight Selection -->
            ${product.weights && product.weights.length > 0 ? `
              <div class="mb-4">
                <label class="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-2">Select Weight / Size:</label>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" id="modal-weight-selector">
                  ${product.weights.map((w, idx) => `
                    <button class="modal-weight-btn border ${idx === 0 ? 'border-pink-500 bg-pink-50/80 text-pink-700 font-bold' : 'border-gray-200 text-gray-700'} p-2 rounded-xl text-center text-xs transition-all hover:border-pink-400" data-weight="${w.weight}" data-price="${w.price}" data-servings="${w.servings || ''}">
                      <div class="font-semibold">${w.weight}</div>
                      <div class="text-[11px] text-gray-500">₹${w.price}</div>
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Cake Inscription -->
            <div class="mb-4">
              <label class="text-xs font-bold text-gray-800 uppercase tracking-wider block mb-1.5">Personalized Message on Cake (Free):</label>
              <input type="text" id="modal-cake-message-input" placeholder="e.g. Happy Birthday Riya ♡" maxlength="30" class="w-full text-xs px-3.5 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 bg-pink-50/30" />
            </div>

            <!-- Kanpur Pincode Quick Checker -->
            <div class="bg-pink-50/60 p-3 rounded-xl border border-pink-100 mb-4 text-xs">
              <div class="flex items-center justify-between mb-1">
                <span class="font-semibold text-gray-800">🚀 Express Kanpur Delivery</span>
                <span class="text-emerald-700 font-bold">208012 Hub Active</span>
              </div>
              <p class="text-[11px] text-gray-500">Earliest Delivery: <strong>Today within 120 Mins</strong> (or select Midnight Slot)</p>
            </div>
          </div>

          <!-- Action Footer -->
          <div class="pt-4 border-t border-pink-100 flex items-center justify-between gap-3">
            <div>
              <span class="text-[10px] text-gray-400 block uppercase font-medium">Total Price</span>
              <span class="text-2xl font-bold text-pink-600" id="modal-live-price">₹${activeWeight.price}</span>
            </div>
            <div class="flex gap-2">
              <button id="modal-add-to-cart-btn" class="btn-primary-pink text-xs py-2.5 px-5">
                Add to Basket 🎀
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Weight selection interaction
    modalContent.querySelectorAll('.modal-weight-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalContent.querySelectorAll('.modal-weight-btn').forEach(b => {
          b.classList.remove('border-pink-500', 'bg-pink-50/80', 'text-pink-700', 'font-bold');
          b.classList.add('border-gray-200', 'text-gray-700');
        });
        btn.classList.add('border-pink-500', 'bg-pink-50/80', 'text-pink-700', 'font-bold');
        btn.classList.remove('border-gray-200', 'text-gray-700');

        activeWeight = {
          weight: btn.dataset.weight,
          price: parseFloat(btn.dataset.price),
          servings: btn.dataset.servings
        };
        const priceEl = document.getElementById('modal-live-price');
        if (priceEl) priceEl.textContent = `₹${activeWeight.price}`;
      });
    });

    // Add to cart click
    const addBtn = document.getElementById('modal-add-to-cart-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const msgInput = document.getElementById('modal-cake-message-input');
        const customMsg = msgInput ? msgInput.value.trim() : '';
        window.store.addToCart(product, activeWeight, customMsg);
        this.closeProductModal();
      });
    }

    this.productModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeProductModal() {
    if (this.productModal) {
      this.productModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();

  // Close modal bindings
  document.querySelectorAll('.close-product-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      window.app.closeProductModal();
    });
  });

  const modalOverlay = document.getElementById('product-detail-modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        window.app.closeProductModal();
      }
    });
  }
});
