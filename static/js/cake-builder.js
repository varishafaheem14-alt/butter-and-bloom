/**
 * Interactive Custom Cake Studio for Bakingo Kanpur
 * Live 2D/Canvas Visualizer with dynamic tier rendering, frosting styles, and real-time custom inscription.
 */

class CakeCustomizer {
  constructor() {
    this.canvas = document.getElementById('cake-studio-visualizer');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    // Config state
    this.state = {
      tier: '1-tier',
      flavor: 'chocolate',
      flavorName: 'Belgian Dark Truffle',
      frosting: 'pink-blush',
      frostingColor: '#FAD4E2',
      frostingSecondary: '#FFFFFF',
      toppings: ['strawberries', 'gold-leaf'],
      message: 'Happy Celebration ♡',
      basePrice: 899
    };

    this.pricing = {
      '1-tier': 899,
      '2-tier': 1999,
      'bento': 499
    };

    this.flavorAddons = {
      'chocolate': 0,
      'red-velvet': 50,
      'mango': 50,
      'rose-pistachio': 100,
      'vanilla': 0
    };

    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.setupBindings();
    this.render();
  }

  setupBindings() {
    // Tier buttons
    document.querySelectorAll('.tier-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tier-select-btn').forEach(b => b.classList.remove('active', 'border-pink-500', 'bg-pink-50'));
        btn.classList.add('active', 'border-pink-500', 'bg-pink-50');
        this.state.tier = btn.dataset.tier;
        this.updatePrice();
        this.render();
      });
    });

    // Flavor radios / buttons
    document.querySelectorAll('.flavor-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.flavor-select-btn').forEach(b => b.classList.remove('active', 'border-pink-500', 'bg-pink-50'));
        btn.classList.add('active', 'border-pink-500', 'bg-pink-50');
        this.state.flavor = btn.dataset.flavor;
        this.state.flavorName = btn.dataset.name || 'Belgian Chocolate';
        this.updatePrice();
        this.render();
      });
    });

    // Frosting color chips
    document.querySelectorAll('.frosting-color-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.frosting-color-btn').forEach(b => b.classList.remove('ring-4', 'ring-pink-300'));
        btn.classList.add('ring-4', 'ring-pink-300');
        this.state.frostingColor = btn.dataset.color;
        this.state.frostingSecondary = btn.dataset.secondary || '#FFFFFF';
        this.render();
      });
    });

    // Inscription text input
    const messageInput = document.getElementById('custom-cake-msg-input');
    if (messageInput) {
      messageInput.addEventListener('input', (e) => {
        this.state.message = e.target.value;
        this.render();
      });
    }

    // Add custom cake to cart button
    const addCustomBtn = document.getElementById('add-custom-cake-to-cart');
    if (addCustomBtn) {
      addCustomBtn.addEventListener('click', () => {
        const customProduct = {
          id: `custom-cake-${Date.now()}`,
          name: `Custom Designer Cake (${this.state.tier.toUpperCase()})`,
          tagline: `${this.state.flavorName} • ${this.state.frostingColor} Palette`,
          category: 'designer',
          starting_price: this.calculatePrice(),
          is_eggless: true,
          image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=80',
          weights: [{ weight: this.state.tier === '2-tier' ? '2.0 kg' : '1.0 kg', price: this.calculatePrice() }]
        };

        window.store.addToCart(customProduct, customProduct.weights[0], this.state.message);
      });
    }
  }

  calculatePrice() {
    const tierCost = this.pricing[this.state.tier] || 899;
    const flavorCost = this.flavorAddons[this.state.flavor] || 0;
    return tierCost + flavorCost;
  }

  updatePrice() {
    const priceEl = document.getElementById('custom-cake-price-display');
    if (priceEl) {
      priceEl.textContent = `₹${this.calculatePrice()}`;
    }
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width = this.canvas.clientWidth;
    const h = this.canvas.height = this.canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const baseY = h * 0.76;

    // 1. Draw Golden Cake Board Base
    ctx.save();
    ctx.fillStyle = '#D4AF37';
    ctx.shadowColor = 'rgba(212, 175, 55, 0.3)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(centerX, baseY + 20, 140, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Draw Bottom Tier
    const tier1Radius = this.state.tier === 'bento' ? 80 : 110;
    const tier1Height = this.state.tier === 'bento' ? 65 : 85;
    const tier1Y = baseY - (tier1Height / 2);

    this.drawCakeTier(ctx, centerX, tier1Y, tier1Radius, tier1Height, this.state.frostingColor);

    // 3. Draw Top Tier (if 2-tier)
    if (this.state.tier === '2-tier') {
      const tier2Radius = 75;
      const tier2Height = 65;
      const tier2Y = tier1Y - tier1Height + 10;
      this.drawCakeTier(ctx, centerX, tier2Y, tier2Radius, tier2Height, this.state.frostingSecondary);

      // Candles on top tier
      this.drawCandles(ctx, centerX, tier2Y - (tier2Height / 2) - 10, 3);
    } else {
      // Candles on bottom tier
      this.drawCandles(ctx, centerX, tier1Y - (tier1Height / 2) - 10, 3);
    }

    // 4. Draw Inscription Text on Cake Board / Ribbon
    if (this.state.message) {
      ctx.save();
      ctx.font = 'italic 600 13px "Playfair Display", Georgia, serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Text background ribbon
      ctx.fillStyle = '#E86F92';
      ctx.shadowColor = 'rgba(232, 111, 146, 0.4)';
      ctx.shadowBlur = 8;
      const textWidth = ctx.measureText(this.state.message).width + 30;
      ctx.beginPath();
      ctx.roundRect(centerX - (textWidth / 2), baseY + 28, textWidth, 24, 12);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(this.state.message, centerX, baseY + 40);
      ctx.restore();
    }
  }

  drawCakeTier(ctx, x, y, radius, height, color) {
    ctx.save();

    // Body
    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(x, y + height / 2, radius, radius * 0.26, 0, 0, Math.PI * 2);
    ctx.ellipse(x, y - height / 2, radius, radius * 0.26, 0, 0, Math.PI * 2);
    ctx.rect(x - radius, y - height / 2, radius * 2, height);
    ctx.fill();

    // Top Surface
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(x, y - height / 2, radius, radius * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cream Rosettes Piping Ring
    const rosettes = 12;
    for (let i = 0; i < rosettes; i++) {
      const angle = (i / rosettes) * Math.PI * 2;
      const rx = x + Math.cos(angle) * (radius - 5);
      const ry = (y - height / 2) + Math.sin(angle) * ((radius - 5) * 0.25);

      ctx.fillStyle = '#FFF5F8';
      ctx.beginPath();
      ctx.arc(rx, ry, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawCandles(ctx, x, y, count) {
    for (let i = 0; i < count; i++) {
      const offsetX = (i - 1) * 24;
      const candleX = x + offsetX;
      const candleY = y;

      // Candle Stick
      ctx.fillStyle = '#FFF0F5';
      ctx.fillRect(candleX - 2, candleY, 4, 22);

      // Flame
      ctx.save();
      ctx.fillStyle = '#FFA500';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(candleX, candleY - 6, 3.5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

window.CakeCustomizer = CakeCustomizer;
