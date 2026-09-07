# Butter & Bloom ♡ — Premium Bakery & 3D Interactive Web Experience

**Butter & Bloom** is a production-ready, full-stack web application and e-commerce experience for a luxury artisan bakery and cake-delivery boutique. Combining high-end editorial aesthetics, real-time 3D WebGL graphics, and full shopping interactions, the platform delivers a memorable culinary brand journey.

---

## ✨ Signature Highlights & Features

### 1. 🎂 3D Procedural Cake Intro & Seamless Hero Continuity
- **Screen State 1 (Cinematic Opening)**: A fullscreen 3D celebration cake procedural rendered with Three.js, featuring blush pink fondant, whipped cream bead piping rims, rosettes, and strawberries.
- **Realistic Candle Physics & Glow**: 3D birthday candles with animated multi-octave flickering flames, wobble dynamics, and organic point-light illumination.
- **Cinematic Sequence**:
  1. *Scale-In (0.0s – 1.2s)*: Cake scales into view from `0.85 → 1.0`.
  2. *Showcase Rotation (1.2s – 3.2s)*: Gentle camera orbit and showcase rotation (`-8° → +8°`).
  3. *Brand Reveal (3.2s – 4.2s)*: *"Baked for your sweetest moments ♡"* and *"BUTTER & BLOOM"*.
  4. *Hero Minimization (4.2s – 5.2s)*: The exact same 3D cake smoothly minimizes directly into the Homepage Hero visual slot without reloading or resetting.
- **Interactive Orbit**: Supports smooth mouse and touch-drag rotation with ambient floating bob.
- **Accessibility**: Includes Skip Intro button, `prefers-reduced-motion` compliance, and `sessionStorage` first-visit caching.

### 2. 🎀 Dreamy Pink & White Editorial Design System
- **Color Palette**: 70% Ivory/White (`#FFFFFF`, `#FFF9FB`), 20% Soft Blush Pink (`#FDF0F4`, `#FCE4EC`), 10% Rose Pink Accents (`#E86F92`, `#D84B77`), and Deep Charcoal Text (`#2A2428`).
- **Typography**: *Playfair Display* & *Cormorant Garamond* (Editorial Serif) paired with *Plus Jakarta Sans* (Modern Sans).

### 3. 🛍️ Storefront & Interactive Modules
- **Quick Categories**: 🎂 All Cakes, 🎉 Birthday, 💍 Anniversary, ❤️ Love, 🍰 Desserts, 🎁 Gifts, 🍫 Chocolate, 🌸 Designer Cakes.
- **Bestsellers ("Loved at First Bite")**: Dynamic cards with 100% Eggless pure veg badges, ratings, weight selectors (0.5 kg – 2.0 kg), and modal views.
- **Interactive Custom Cake Studio ("Have a Sweet Idea? 🎀")**: Dynamic 2D/Canvas cake designer with tier selection, sponge flavor choices, frosting palette, personalized message inscription on the cake board, and real-time price calculation.
- **Gourmet Desserts & Gifting**: Fudgy walnut brownies, layered jar cakes, New York cheesecake slices, and cake + fresh rose hampers.
- **Local Hub & Pincode Checker**: Integrated verification across postal zones with transit time estimation.
- **Slide-Over Cart Drawer**: Quantity adjustment, cake message inscription, delivery slots (Standard Free, 2-Hour Express, Midnight 12 AM), and promo coupon engine (`FIRSTBITE`, `KANPURFREE`, `SWEET50`, `CELEBRATE100`).
- **Multi-Step Checkout**: Recipient address form, delivery date/slot scheduler, payment simulator, and instant order ID generation (`#BK-KNP-xxxx` / `#BB-xxxx`).
- **Live Order Tracker**: Real-time 5-stage progress timeline with simulated kitchen status.
- **Live Instant Search**: `Cmd+K` / search modal with debounced query matching.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, ES6 JavaScript Modules, Tailwind CSS, Three.js (r128), HTML5 Canvas.
- **Backend**: Python 3.14, FastAPI, Uvicorn, SQLite, Pydantic v2.
- **Testing**: Pytest, Starlette TestClient, HTTPX.
- **Deployment**: GitHub Pages, Vercel, Netlify, Docker-ready.

---

## 📂 Project Structure

```
butter-and-bloom/
├── index.html              # Main production entry point
├── vercel.json             # Vercel configuration
├── netlify.toml            # Netlify configuration
├── package.json            # NPM project manifest
├── requirements.txt        # Python backend dependencies
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── main.py                 # FastAPI backend server
├── database.py             # SQLite persistence layer
├── data/
│   ├── products.json       # Catalog data (24+ artisan items)
│   ├── categories.json     # Categories, occasions, zones, coupons
│   └── reviews.json        # Verified customer reviews
├── static/
│   ├── index.html          # Static entry point mirror
│   ├── css/
│   │   └── style.css       # Custom design tokens, animations, layout
│   └── js/
│       ├── api.js          # Resilient API service with static fallback
│       ├── app.js          # Main coordinator & product renderers
│       ├── cake-builder.js # Interactive 2D/Canvas custom cake visualizer
│       ├── cart.js         # Slide-over cart drawer & coupons
│       ├── checkout.js     # Multi-step checkout & order submission
│       ├── search.js       # Live search with debouncing
│       ├── state.js        # Reactive store & toast notifications
│       ├── three-cake.js   # Three.js procedural 3D cake engine
│       └── tracker.js      # Live order timeline tracker
└── tests/
    └── test_api.py         # Automated API test suite
```

---

## 🚀 Getting Started Locally

### 1. Clone the Repository
```bash
git clone https://github.com/varishafaheem14-alt/butter-and-bloom.git
cd butter-and-bloom
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Development Server
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Open your browser at **[http://localhost:8000](http://localhost:8000)**.

### 4. Run Automated Tests
```bash
python -m pytest tests/test_api.py -v
```

---

## 🌐 Public Deployment

### Deploy to GitHub Pages
The project is configured for GitHub Pages directly from the `main` branch root (`/`).

### Deploy to Vercel
Import the repository into [Vercel](https://vercel.com) — `vercel.json` is preconfigured for zero-configuration instant deployment.

### Deploy to Netlify
Import the repository into [Netlify](https://netlify.com) — `netlify.toml` handles routing and instant static publishing.

---

## 📄 License

This project is licensed under the MIT License — feel free to customize and enjoy! Baked fresh for moments worth celebrating ♡
