/**
 * Central State Store for Bakingo Kanpur
 */

class Store {
  constructor() {
    this.cart = this.loadLocalStorage('bakingo_cart', []);
    this.wishlist = this.loadLocalStorage('bakingo_wishlist', []);
    this.appliedCoupon = null;
    this.deliverySlot = { id: 'standard', name: 'Standard Delivery', price: 0 };
    this.deliveryPincode = '208012';
    this.deliveryArea = 'Darshan Purwa / Ram Krishna Nagar';
    this.activeCategory = 'all';
    this.activeOccasion = 'all';
    this.searchQuery = '';
    this.listeners = [];
  }

  loadLocalStorage(key, defaultVal) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }

  saveLocalStorage(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(event, payload) {
    this.listeners.forEach(fn => fn(event, payload, this));
  }

  // --- Cart Operations ---
  addToCart(product, weightObj = null, customMsg = '') {
    const selectedWeight = weightObj || (product.weights && product.weights[0]) || { weight: '0.5 kg', price: product.starting_price || 599 };
    const cartItemId = `${product.id}-${selectedWeight.weight}-${customMsg.trim()}`;

    const existingIndex = this.cart.findIndex(item => item.cartItemId === cartItemId);
    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += 1;
    } else {
      this.cart.push({
        cartItemId,
        id: product.id,
        name: product.name,
        tagline: product.tagline || '',
        category: product.category || 'cakes',
        image: product.image,
        weight: selectedWeight.weight,
        price: selectedWeight.price,
        quantity: 1,
        is_eggless: product.is_eggless !== false,
        cake_message: customMsg.trim()
      });
    }

    this.saveLocalStorage('bakingo_cart', this.cart);
    this.notify('cart_updated', this.cart);
    this.showToast(`Added ${product.name} (${selectedWeight.weight}) to sweet basket 🎀`);
  }

  updateQuantity(cartItemId, delta) {
    const index = this.cart.findIndex(item => item.cartItemId === cartItemId);
    if (index > -1) {
      this.cart[index].quantity += delta;
      if (this.cart[index].quantity <= 0) {
        this.cart.splice(index, 1);
        this.showToast('Item removed from basket');
      }
      this.saveLocalStorage('bakingo_cart', this.cart);
      this.notify('cart_updated', this.cart);
    }
  }

  removeFromCart(cartItemId) {
    this.cart = this.cart.filter(item => item.cartItemId !== cartItemId);
    this.saveLocalStorage('bakingo_cart', this.cart);
    this.notify('cart_updated', this.cart);
    this.showToast('Item removed from basket');
  }

  clearCart() {
    this.cart = [];
    this.appliedCoupon = null;
    this.saveLocalStorage('bakingo_cart', this.cart);
    this.notify('cart_updated', this.cart);
  }

  getCartCount() {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  getCartSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCartTotal() {
    const subtotal = this.getCartSubtotal();
    const deliveryFee = this.deliverySlot.price || 0;
    const discount = this.appliedCoupon ? this.appliedCoupon.discount : 0;
    return Math.max(0, subtotal + deliveryFee - discount);
  }

  // --- Wishlist Operations ---
  toggleWishlist(product) {
    const exists = this.wishlist.some(p => p.id === product.id);
    if (exists) {
      this.wishlist = this.wishlist.filter(p => p.id !== product.id);
      this.showToast(`Removed ${product.name} from wishlist ♡`);
    } else {
      this.wishlist.push({
        id: product.id,
        name: product.name,
        starting_price: product.starting_price,
        image: product.image,
        category: product.category,
        rating: product.rating
      });
      this.showToast(`Saved ${product.name} to wishlist ♡`);
    }
    this.saveLocalStorage('bakingo_wishlist', this.wishlist);
    this.notify('wishlist_updated', this.wishlist);
  }

  isInWishlist(productId) {
    return this.wishlist.some(p => p.id === productId);
  }

  // --- Toast Notifications ---
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'sweet-toast';
    toast.innerHTML = `
      <span style="font-size: 1.15rem; color: #E86F92;">🌸</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

window.store = new Store();
