/**
 * Live Order Tracker Modal for Bakingo Kanpur
 */

class TrackerManager {
  constructor() {
    this.modalOverlay = document.getElementById('tracker-modal-overlay');
    this.searchInput = document.getElementById('tracker-order-id-input');
    this.searchBtn = document.getElementById('tracker-search-btn');
    this.resultContainer = document.getElementById('tracker-result-container');

    this.init();
  }

  init() {
    this.setupListeners();
  }

  setupListeners() {
    // Open tracker modal triggers
    document.querySelectorAll('.open-tracker-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    });

    // Close tracker modal triggers
    document.querySelectorAll('.close-tracker-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeModal();
      });
    });

    // Search button
    if (this.searchBtn && this.searchInput) {
      this.searchBtn.addEventListener('click', () => {
        const orderId = this.searchInput.value.trim();
        if (orderId) {
          this.fetchAndRender(orderId);
        }
      });

      this.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const orderId = this.searchInput.value.trim();
          if (orderId) {
            this.fetchAndRender(orderId);
          }
        }
      });
    }
  }

  openModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  trackDirect(orderId) {
    this.openModal();
    if (this.searchInput) {
      this.searchInput.value = orderId;
    }
    this.fetchAndRender(orderId);
  }

  async fetchAndRender(orderId) {
    if (!this.resultContainer) return;
    this.resultContainer.innerHTML = `
      <div class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent"></div>
        <p class="text-xs text-gray-500 mt-2">Connecting to Kanpur Kitchen Hub...</p>
      </div>
    `;

    const res = await window.API.trackOrder(orderId);

    if (res.success && res.order) {
      const order = res.order;
      const timeline = order.timeline;
      const currentStep = timeline.current_step;

      this.resultContainer.innerHTML = `
        <div class="bg-pink-50/50 p-5 rounded-2xl border border-pink-100 mt-4">
          <div class="flex flex-wrap justify-between items-center pb-3 border-b border-pink-200 gap-2">
            <div>
              <span class="text-xs text-gray-500 font-semibold uppercase">Order Tracking</span>
              <h4 class="font-mono font-bold text-lg text-pink-600">${order.id}</h4>
            </div>
            <div class="text-right">
              <span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                ${timeline.step_title}
              </span>
            </div>
          </div>

          <!-- Status Highlight Card -->
          <div class="my-4 p-3.5 bg-white rounded-xl border border-pink-100 flex items-center gap-3 shadow-sm">
            <div class="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-lg flex-shrink-0">
              🛵
            </div>
            <div>
              <p class="text-xs text-gray-500 font-medium">Estimated Status</p>
              <p class="text-sm font-semibold text-gray-900">${timeline.estimated_status}</p>
            </div>
          </div>

          <!-- Stepper Timeline -->
          <div class="relative pl-6 space-y-6 my-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-pink-200">
            ${timeline.steps.map(s => {
              const isCompleted = s.step < currentStep;
              const isCurrent = s.step === currentStep;
              return `
                <div class="relative flex items-start gap-3">
                  <div class="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-pink-500 border-pink-500' : isCurrent ? 'bg-white border-pink-600 ring-4 ring-pink-100' : 'bg-white border-gray-300'} flex items-center justify-center">
                    ${isCompleted ? '<span class="text-white text-[9px]">✓</span>' : ''}
                  </div>
                  <div>
                    <h5 class="text-xs font-bold ${isCurrent ? 'text-pink-700' : isCompleted ? 'text-gray-800' : 'text-gray-400'}">${s.label}</h5>
                    <p class="text-[11px] text-gray-500">${s.time}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Order Summary Details -->
          <div class="bg-white/80 p-3.5 rounded-xl border border-pink-100 text-xs text-gray-600 space-y-1">
            <div class="flex justify-between">
              <span>Customer:</span>
              <span class="font-semibold text-gray-900">${order.customer_name}</span>
            </div>
            <div class="flex justify-between">
              <span>Delivery Address:</span>
              <span class="font-semibold text-gray-900">${order.address || order.area}</span>
            </div>
            <div class="flex justify-between">
              <span>Slot:</span>
              <span class="font-semibold text-gray-900">${order.delivery_slot}</span>
            </div>
            ${order.cake_message ? `
              <div class="flex justify-between pt-1 border-t border-pink-100 text-pink-600 italic">
                <span>Message on Cake:</span>
                <span>"${order.cake_message}"</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    } else {
      this.resultContainer.innerHTML = `
        <div class="text-center py-6 px-4 bg-rose-50 rounded-2xl border border-rose-100 mt-4">
          <p class="text-rose-600 text-sm font-semibold mb-1">Order Not Found</p>
          <p class="text-xs text-gray-600">Please verify your tracking ID (e.g. BK-KNP-8492) or contact our Kanpur support at 088825 53333.</p>
        </div>
      `;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.trackerManager = new TrackerManager();
});
