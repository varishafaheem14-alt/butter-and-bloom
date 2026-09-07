/**
 * Cart Drawer & Cart Operations for Bakingo Kanpur
 */

class CartManager {
  constructor() {
    this.drawerBackdrop = document.getElementById('cart-drawer-backdrop');
    this.cartItemsContainer = document.getElementById('cart-items-list');
    this.cartSubtotalEl = document.getElementById('cart-subtotal-val');
    this.cartDiscountEl = document.getElementById('cart-discount-val');
    this.cartDeliveryEl = document.getElementById('cart-delivery-val');
    this.cartTotalEl = document.getElementById('cart-total-val');
    this.cartCountBadges = document.querySelectorAll('.cart-count-badge');
    this.couponInput = document.getElementById('cart-coupon-input');
    this.couponBtn = document.getElementById('apply-coupon-btn');
    this.couponMsgEl = document.getElementById('coupon-msg-feedback');

    this.init();
  }

  init() {
    // Subscribe to store updates
    window.store.subscribe((event) => {
      if (event === 'cart_updated' || event === 'coupon_updated') {
        this.renderCart();
      }
    });

    this.setupListeners();
    this.renderCart();
  }

  setupListeners() {
    // Open cart drawer triggers
    document.querySelectorAll('.open-cart-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    // Close cart drawer triggers
    document.querySelectorAll('.close-cart-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeDrawer();
      });
    });

    // Close on backdrop click
    if (this.drawerBackdrop) {
      this.drawerBackdrop.addEventListener('click', (e) => {
        if (e.target === this.drawerBackdrop) {
          this.closeDrawer();
        }
      });
    }

    // Apply Coupon
    if (this.couponBtn && this.couponInput) {
      this.couponBtn.addEventListener('click', async () => {
        const code = this.couponInput.value.trim();
        if (!code) return;

        const subtotal = window.store.getCartSubtotal();
        const res = await window.API.validateCoupon(code, subtotal);

        if (res.valid) {
          window.store.appliedCoupon = res;
          this.couponMsgEl.innerHTML = `<span class="text-emerald-600 font-medium">✓ ${res.message}</span>`;
          window.store.showToast(`Applied code ${res.code} 🎉`);
          this.renderCart();
        } else {
          this.couponMsgEl.innerHTML = `<span class="text-rose-500 font-medium">✕ ${res.message}</span>`;
        }
      });
    }

    // Delivery Slot Radio Change
    document.querySelectorAll('input[name="delivery_slot_radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const price = parseFloat(e.target.dataset.price || 0);
        const name = e.target.dataset.name || 'Standard Delivery';
        window.store.deliverySlot = { id: e.target.value, name, price };
        this.renderCart();
      });
    });
  }

  openDrawer() {
    if (this.drawerBackdrop) {
      this.drawerBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  closeDrawer() {
    if (this.drawerBackdrop) {
      this.drawerBackdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  renderCart() {
    const cart = window.store.cart;
    const count = window.store.getCartCount();
    const subtotal = window.store.getCartSubtotal();
    const deliveryFee = window.store.deliverySlot.price || 0;
    const discount = window.store.appliedCoupon ? window.store.appliedCoupon.discount : 0;
    const total = Math.max(0, subtotal + deliveryFee - discount);

    // Update Header and mobile badges
    this.cartCountBadges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });

    if (this.cartSubtotalEl) this.cartSubtotalEl.textContent = `₹${subtotal.toFixed(0)}`;
    if (this.cartDeliveryEl) this.cartDeliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(0)}`;
    if (this.cartDiscountEl) this.cartDiscountEl.textContent = discount > 0 ? `-₹${discount.toFixed(0)}` : '₹0';
    if (this.cartTotalEl) this.cartTotalEl.textContent = `₹${total.toFixed(0)}`;

    if (!this.cartItemsContainer) return;

    if (cart.length === 0) {
      this.cartItemsContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-center px-4">
          <div class="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-3xl mb-4 shadow-inner">
            🧁
          </div>
          <h4 class="font-serif text-xl font-bold text-gray-800 mb-1">Your sweet basket is empty</h4>
          <p class="text-sm text-gray-500 mb-6 max-w-xs">Freshly baked celebrations in Kanpur are just a click away!</p>
          <button onclick="window.cartManager.closeDrawer(); window.location.hash='#bestsellers';" class="btn-primary-pink text-sm">
            Explore Sweet Bestsellers ♡
          </button>
        </div>
      `;
      return;
    }

    this.cartItemsContainer.innerHTML = cart.map(item => `
      <div class="flex gap-3 py-3.5 border-b border-pink-100 last:border-0 items-start">
        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-xl object-cover border border-pink-100 flex-shrink-0 shadow-sm" />
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start">
            <h5 class="text-sm font-semibold text-gray-800 truncate pr-2">${item.name}</h5>
            <button onclick="window.store.removeFromCart('${item.cartItemId}')" class="text-gray-400 hover:text-rose-500 text-xs p-1">
              ✕
            </button>
          </div>
          <div class="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            <span class="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded font-medium">${item.weight}</span>
            ${item.is_eggless ? '<span class="text-emerald-700 font-medium">100% Pure Veg</span>' : ''}
          </div>
          ${item.cake_message ? `<p class="text-[11px] text-pink-600 italic truncate mt-1">"${item.cake_message}"</p>` : ''}
          
          <div class="flex items-center justify-between mt-2.5">
            <span class="font-bold text-gray-900 text-sm">₹${(item.price * item.quantity).toFixed(0)}</span>
            
            <div class="flex items-center border border-pink-200 rounded-lg bg-pink-50/50">
              <button onclick="window.store.updateQuantity('${item.cartItemId}', -1)" class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-pink-100 rounded-l text-sm font-bold">-</button>
              <span class="w-7 text-center text-xs font-semibold">${item.quantity}</span>
              <button onclick="window.store.updateQuantity('${item.cartItemId}', 1)" class="w-6 h-6 flex items-center justify-center text-gray-600 hover:bg-pink-100 rounded-r text-sm font-bold">+</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.cartManager = new CartManager();
});
