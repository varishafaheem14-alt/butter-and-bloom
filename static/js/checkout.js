/**
 * Multi-Step Kanpur Checkout Engine for Bakingo
 */

class CheckoutManager {
  constructor() {
    this.modalOverlay = document.getElementById('checkout-modal-overlay');
    this.checkoutForm = document.getElementById('bakingo-checkout-form');
    this.confirmationView = document.getElementById('checkout-confirmation-view');
    this.formStepsContainer = document.getElementById('checkout-form-steps');
    
    this.init();
  }

  init() {
    this.setupListeners();
  }

  setupListeners() {
    // Open checkout modal trigger from cart drawer
    const proceedBtn = document.getElementById('proceed-to-checkout-btn');
    if (proceedBtn) {
      proceedBtn.addEventListener('click', () => {
        if (window.store.cart.length === 0) {
          window.store.showToast('Please add delicious treats to your basket first! 🧁');
          return;
        }
        if (window.cartManager) {
          window.cartManager.closeDrawer();
        }
        this.openModal();
      });
    }

    // Close modal trigger
    document.querySelectorAll('.close-checkout-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeModal();
      });
    });

    // Pincode validation button inside checkout
    const checkPinBtn = document.getElementById('checkout-verify-pin-btn');
    const pinInput = document.getElementById('checkout-pincode-input');
    const pinStatus = document.getElementById('checkout-pin-status');

    if (checkPinBtn && pinInput) {
      checkPinBtn.addEventListener('click', async () => {
        const pin = pinInput.value.trim();
        if (pin.length !== 6) {
          pinStatus.innerHTML = '<span class="text-rose-500">Please enter a valid 6-digit Kanpur pincode</span>';
          return;
        }
        pinStatus.innerHTML = '<span class="text-gray-400">Checking delivery zone...</span>';
        const res = await window.API.checkPincode(pin);
        if (res.available) {
          pinStatus.innerHTML = `<span class="text-emerald-600 font-medium">✓ ${res.message}</span>`;
          window.store.deliveryPincode = pin;
          if (res.area) window.store.deliveryArea = res.area;
        } else {
          pinStatus.innerHTML = `<span class="text-rose-500 font-medium">✕ ${res.message}</span>`;
        }
      });
    }

    // Submit Checkout
    if (this.checkoutForm) {
      this.checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleOrderSubmit();
      });
    }
  }

  openModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      this.populateSummary();
      
      // Reset view to form
      if (this.formStepsContainer) this.formStepsContainer.style.display = 'block';
      if (this.confirmationView) this.confirmationView.style.display = 'none';
    }
  }

  closeModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  populateSummary() {
    const summaryContainer = document.getElementById('checkout-order-summary-box');
    if (!summaryContainer) return;

    const cart = window.store.cart;
    const subtotal = window.store.getCartSubtotal();
    const deliveryFee = window.store.deliverySlot.price || 0;
    const discount = window.store.appliedCoupon ? window.store.appliedCoupon.discount : 0;
    const total = Math.max(0, subtotal + deliveryFee - discount);

    summaryContainer.innerHTML = `
      <div class="bg-pink-50/70 p-4 rounded-2xl border border-pink-100 mb-4">
        <h5 class="text-xs font-bold uppercase tracking-wider text-pink-700 mb-2">Order Items (${cart.length})</h5>
        <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          ${cart.map(item => `
            <div class="flex justify-between text-xs text-gray-700">
              <span class="truncate pr-2">${item.name} (${item.weight}) × ${item.quantity}</span>
              <span class="font-semibold flex-shrink-0">₹${(item.price * item.quantity).toFixed(0)}</span>
            </div>
          `).join('')}
        </div>
        <div class="border-t border-pink-200 mt-3 pt-2 space-y-1 text-xs">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹${subtotal.toFixed(0)}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Delivery (${window.store.deliverySlot.name})</span>
            <span>${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee}</span>
          </div>
          ${discount > 0 ? `
            <div class="flex justify-between text-emerald-600 font-semibold">
              <span>Discount</span>
              <span>-₹${discount.toFixed(0)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-pink-100">
            <span>Total Payable</span>
            <span class="text-pink-600">₹${total.toFixed(0)}</span>
          </div>
        </div>
      </div>
    `;
  }

  async handleOrderSubmit() {
    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    const addressInput = document.getElementById('checkout-address');
    const pincodeInput = document.getElementById('checkout-pincode-input');
    const messageInput = document.getElementById('checkout-cake-message');
    const paymentRadio = document.querySelector('input[name="checkout_payment"]:checked');
    const submitBtn = document.getElementById('submit-order-btn');

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Baking & Confirming...</span>`;
    }

    const orderPayload = {
      customer_name: nameInput ? nameInput.value.trim() : 'Guest',
      phone: phoneInput ? phoneInput.value.trim() : '',
      address: addressInput ? addressInput.value.trim() : '',
      pincode: pincodeInput ? pincodeInput.value.trim() : window.store.deliveryPincode,
      area: window.store.deliveryArea,
      delivery_slot: window.store.deliverySlot.name,
      delivery_date: 'Today',
      cake_message: messageInput ? messageInput.value.trim() : '',
      items: window.store.cart,
      subtotal: window.store.getCartSubtotal(),
      delivery_fee: window.store.deliverySlot.price || 0,
      discount: window.store.appliedCoupon ? window.store.appliedCoupon.discount : 0,
      total: window.store.getCartTotal(),
      payment_method: paymentRadio ? paymentRadio.value : 'UPI'
    };

    const res = await window.API.placeOrder(orderPayload);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Pay & Confirm Order 🎀</span>`;
    }

    if (res.success && res.order) {
      // Clear cart
      window.store.clearCart();

      // Show confirmation screen
      if (this.formStepsContainer) this.formStepsContainer.style.display = 'none';
      if (this.confirmationView) {
        this.confirmationView.style.display = 'block';
        this.confirmationView.innerHTML = `
          <div class="text-center py-6 px-4">
            <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
              ✓
            </div>
            <span class="inline-block bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full mb-2">Order Confirmed</span>
            <h3 class="font-serif text-2xl font-bold text-gray-900 mb-1">Thank you, ${res.order.customer_name}! ♡</h3>
            <p class="text-sm text-gray-600 mb-4">Your sweet celebration is officially underway at our Kanpur Kitchen (Darshan Purwa Hub).</p>
            
            <div class="bg-pink-50/60 p-4 rounded-2xl border border-pink-100 max-w-md mx-auto text-left mb-6">
              <div class="flex justify-between items-center pb-2 border-b border-pink-200">
                <span class="text-xs text-gray-500 font-semibold uppercase">Tracking ID</span>
                <span class="font-mono font-bold text-pink-600 text-base">${res.order.id}</span>
              </div>
              <div class="flex justify-between items-center py-1.5 text-xs text-gray-700">
                <span>Total Amount</span>
                <span class="font-semibold">₹${res.order.total}</span>
              </div>
              <div class="flex justify-between items-center py-1.5 text-xs text-gray-700">
                <span>Delivery Hub</span>
                <span class="font-semibold">178/B, Ram Krishna Nagar, Kanpur</span>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button onclick="window.trackerManager.trackDirect('${res.order.id}'); window.checkoutManager.closeModal();" class="btn-primary-pink text-sm">
                Track Order Live 🚀
              </button>
              <button onclick="window.checkoutManager.closeModal();" class="btn-secondary-white text-sm">
                Continue Sweet Browsing ♡
              </button>
            </div>
          </div>
        `;
      }
      window.store.showToast(`Order ${res.order.id} placed successfully! 🎉`);
    } else {
      alert('Could not process order: ' + (res.message || 'Please try again.'));
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.checkoutManager = new CheckoutManager();
});
