/**
 * BAKINGO KANPUR — 3D CAKE INTRO & HERO VISUALIZER ENGINE
 * Built with Three.js (Procedural Multi-Tier Celebration Cake with Realistic Flames)
 */

class Cake3DEngine {
  constructor() {
    this.introContainer = document.getElementById('three-intro-container');
    this.canvas = document.getElementById('three-canvas-global');
    this.heroSlot = document.getElementById('hero-cake-canvas-slot');
    this.brandText = document.getElementById('intro-brand-text');
    this.skipBtn = document.getElementById('skip-intro-btn');
    
    this.isIntroActive = true;
    this.isHeroMode = false;
    this.isMinimized = false;
    
    // Animation state timers
    this.startTime = null;
    this.clock = null;
    
    // Three.js instances
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.cakeGroup = null;
    this.candleFlames = [];
    this.candleLights = [];
    this.particles = null;
    
    // Mouse interaction for hero mode
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isMouseDown = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.cakeRotationY = 0;
    this.targetRotationY = 0;
    
    this.init();
  }

  init() {
    if (!window.THREE) {
      console.warn('Three.js not loaded, skipping 3D initialization.');
      this.hideIntroImmediately();
      return;
    }

    // Check if user has seen intro in this session or prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeenIntro = sessionStorage.getItem('bakingo_intro_viewed');

    if (prefersReducedMotion) {
      this.hideIntroImmediately();
      return;
    }

    this.setupThreeScene();
    this.buildProceduralCake();
    this.buildCandlesAndFlames();
    this.buildFloatingParticles();
    this.setupEventListeners();
    
    // Start render loop
    this.clock = new THREE.Clock();
    this.startTime = performance.now();
    this.animate();

    // If user has already visited in this session, provide quick skip option or auto-transition after 1.5s
    if (hasSeenIntro) {
      setTimeout(() => {
        if (this.isIntroActive) {
          this.transitionToHero();
        }
      }, 1800);
    }
  }

  setupThreeScene() {
    this.scene = new THREE.Scene();
    
    // Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.camera.position.set(0, 1.8, 6.5);
    this.camera.lookAt(0, 0.5, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // Ambient and Directional Lighting (Studio Bakery Light)
    const ambientLight = new THREE.AmbientLight(0xFFF0F5, 1.4);
    this.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xFFFFFF, 1.8);
    mainLight.position.set(4, 7, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 15;
    mainLight.shadow.bias = -0.001;
    this.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xFCE4EC, 0.8);
    fillLight.position.set(-4, 3, -3);
    this.scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xFFB6C1, 1.2, 10);
    rimLight.position.set(0, 4, -4);
    this.scene.add(rimLight);
  }

  buildProceduralCake() {
    this.cakeGroup = new THREE.Group();

    // --- Premium Materials ---
    // Soft Pink Buttercream / Fondant
    const pinkFondantMat = new THREE.MeshStandardMaterial({
      color: 0xFDE4ED,
      roughness: 0.35,
      metalness: 0.05
    });

    // Pure White Whipped Cream
    const creamWhiteMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.25,
      metalness: 0.02
    });

    // Dark Chocolate Drip / Base Board
    const goldBoardMat = new THREE.MeshStandardMaterial({
      color: 0xD4AF37,
      roughness: 0.3,
      metalness: 0.7
    });

    const strawberryMat = new THREE.MeshStandardMaterial({
      color: 0xD8264A,
      roughness: 0.2,
      metalness: 0.1
    });

    // 1. Golden Cake Board Base
    const boardGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.1, 48);
    const boardMesh = new THREE.Mesh(boardGeo, goldBoardMat);
    boardMesh.position.y = -0.05;
    boardMesh.receiveShadow = true;
    this.cakeGroup.add(boardMesh);

    // 2. Bottom Tier (Large Celebration Sponge)
    const tier1Geo = new THREE.CylinderGeometry(1.8, 1.8, 1.1, 48);
    const tier1Mesh = new THREE.Mesh(tier1Geo, pinkFondantMat);
    tier1Mesh.position.y = 0.55;
    tier1Mesh.castShadow = true;
    tier1Mesh.receiveShadow = true;
    this.cakeGroup.add(tier1Mesh);

    // Bottom Tier Piping Bead Rim (Bottom)
    this.addPipingRing(1.82, 0.08, 0.04, 36, creamWhiteMat);
    // Bottom Tier Piping Bead Rim (Top)
    this.addPipingRing(1.82, 1.1, 0.04, 36, creamWhiteMat);

    // 3. Top Tier (Delicate Upper Tier)
    const tier2Geo = new THREE.CylinderGeometry(1.2, 1.2, 0.9, 48);
    const tier2Mesh = new THREE.Mesh(tier2Geo, creamWhiteMat);
    tier2Mesh.position.y = 1.55;
    tier2Mesh.castShadow = true;
    tier2Mesh.receiveShadow = true;
    this.cakeGroup.add(tier2Mesh);

    // Top Tier Piping Rim
    this.addPipingRing(1.22, 1.12, 0.035, 28, pinkFondantMat);
    this.addPipingRing(1.22, 2.0, 0.035, 28, pinkFondantMat);

    // 4. Cream Swirl Rosettes & Strawberries on Top Tier
    const rosetteCount = 8;
    for (let i = 0; i < rosetteCount; i++) {
      const angle = (i / rosetteCount) * Math.PI * 2;
      const radius = 0.95;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Cream Rosette Swirl
      const rosetteGeo = new THREE.SphereGeometry(0.12, 16, 16);
      rosetteGeo.scale(1, 0.7, 1);
      const rosette = new THREE.Mesh(rosetteGeo, creamWhiteMat);
      rosette.position.set(x, 2.05, z);
      rosette.castShadow = true;
      this.cakeGroup.add(rosette);

      // Alternate with Strawberry / Raspberry toppings
      if (i % 2 === 0) {
        const berryGeo = new THREE.ConeGeometry(0.09, 0.18, 16);
        const berry = new THREE.Mesh(berryGeo, strawberryMat);
        berry.rotation.x = Math.PI;
        berry.position.set(x * 0.75, 2.08, z * 0.75);
        berry.castShadow = true;
        this.cakeGroup.add(berry);
      }
    }

    // Centered Macaron on Top
    const macaronPink = new THREE.MeshStandardMaterial({ color: 0xF48FB1, roughness: 0.4 });
    const macaronGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.12, 24);
    const macaron = new THREE.Mesh(macaronGeo, macaronPink);
    macaron.position.set(0, 2.08, 0);
    this.cakeGroup.add(macaron);

    this.scene.add(this.cakeGroup);
  }

  addPipingRing(radius, yPos, beadRadius, count, material) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const beadGeo = new THREE.SphereGeometry(beadRadius, 10, 10);
      const bead = new THREE.Mesh(beadGeo, material);
      bead.position.set(x, yPos, z);
      this.cakeGroup.add(bead);
    }
  }

  buildCandlesAndFlames() {
    const candleCount = 3;
    const candleRadius = 0.55;
    const candleMat = new THREE.MeshStandardMaterial({
      color: 0xFFF5F8,
      roughness: 0.3,
      metalness: 0.1
    });

    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xFF9E00
    });

    for (let i = 0; i < candleCount; i++) {
      const angle = (i / candleCount) * Math.PI * 2 + (Math.PI / 6);
      const x = Math.cos(angle) * candleRadius;
      const z = Math.sin(angle) * candleRadius;

      // Candle Stick
      const stickGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.5, 16);
      const stick = new THREE.Mesh(stickGeo, candleMat);
      stick.position.set(x, 2.3, z);
      stick.castShadow = true;
      this.cakeGroup.add(stick);

      // Candle Wick
      const wickGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8);
      const wickMat = new THREE.MeshBasicMaterial({ color: 0x333333 });
      const wick = new THREE.Mesh(wickGeo, wickMat);
      wick.position.set(x, 2.58, z);
      this.cakeGroup.add(wick);

      // Animated Realistic Teardrop Flame
      const flameGeo = new THREE.ConeGeometry(0.045, 0.14, 12);
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(x, 2.68, z);
      this.cakeGroup.add(flame);
      this.candleFlames.push(flame);

      // Warm Point Light for Flame Glow
      const flameLight = new THREE.PointLight(0xFFA500, 0.8, 3);
      flameLight.position.set(x, 2.7, z);
      this.cakeGroup.add(flameLight);
      this.candleLights.push(flameLight);
    }
  }

  buildFloatingParticles() {
    const particleCount = 45;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 1] = Math.random() * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      scales[i] = Math.random() * 0.05 + 0.02;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xFFB6C1,
      size: 0.12,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, particleMat);
    this.scene.add(this.particles);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Skip Intro Button
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.transitionToHero());
    }

    // Hero interactive dragging
    const heroCanvasSlot = this.heroSlot;
    if (heroCanvasSlot) {
      heroCanvasSlot.addEventListener('mousedown', (e) => {
        if (!this.isHeroMode) return;
        this.isMouseDown = true;
        this.prevMousePos = { x: e.clientX, y: e.clientY };
      });

      window.addEventListener('mouseup', () => {
        this.isMouseDown = false;
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isHeroMode || !this.isMouseDown) return;
        const deltaX = e.clientX - this.prevMousePos.x;
        this.targetRotationY += deltaX * 0.008;
        this.prevMousePos = { x: e.clientX, y: e.clientY };
      });

      // Touch events for mobile
      heroCanvasSlot.addEventListener('touchstart', (e) => {
        if (!this.isHeroMode || e.touches.length === 0) return;
        this.isMouseDown = true;
        this.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }, { passive: true });

      window.addEventListener('touchend', () => {
        this.isMouseDown = false;
      });

      window.addEventListener('touchmove', (e) => {
        if (!this.isHeroMode || !this.isMouseDown || e.touches.length === 0) return;
        const deltaX = e.touches[0].clientX - this.prevMousePos.x;
        this.targetRotationY += deltaX * 0.008;
        this.prevMousePos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }, { passive: true });
    }
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;

    if (this.isHeroMode && this.heroSlot) {
      const width = this.heroSlot.clientWidth;
      const height = this.heroSlot.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    } else {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  }

  transitionToHero() {
    if (!this.isIntroActive) return;
    this.isIntroActive = false;
    this.isHeroMode = true;

    // Save session flag
    sessionStorage.setItem('bakingo_intro_viewed', 'true');

    // Fade out intro brand overlay
    if (this.brandText) {
      this.brandText.style.opacity = '0';
    }

    // Smoothly minimize intro container
    if (this.introContainer) {
      this.introContainer.classList.add('intro-minimized');
    }

    // Re-mount canvas inside the Hero section slot
    if (this.heroSlot && this.canvas) {
      this.heroSlot.appendChild(this.canvas);
      this.canvas.style.position = 'relative';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.onWindowResize();
    }

    // Trigger homepage entrance animation
    document.body.classList.add('homepage-active');
  }

  hideIntroImmediately() {
    this.isIntroActive = false;
    this.isHeroMode = true;
    if (this.introContainer) {
      this.introContainer.style.display = 'none';
    }
    document.body.classList.add('homepage-active');
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = (performance.now() - this.startTime) / 1000;
    const delta = this.clock ? this.clock.getDelta() : 0.016;

    // -------------------------------------------------------------
    // INTRO CINEMATIC CHOREOGRAPHY (Steps 1 to 4)
    // -------------------------------------------------------------
    if (this.isIntroActive) {
      // Step 1: Initial Scale In (0.85 -> 1.0)
      if (elapsedTime < 1.2) {
        const progress = Math.min(elapsedTime / 1.2, 1.0);
        const scale = 0.85 + (0.15 * progress);
        this.cakeGroup.scale.set(scale, scale, scale);
      } else {
        this.cakeGroup.scale.set(1.0, 1.0, 1.0);
      }

      // Step 2: Gentle Showcase Rotation (-8 deg to +8 deg)
      if (elapsedTime < 3.2) {
        const rotationAngle = Math.sin(elapsedTime * 1.5) * (8 * (Math.PI / 180));
        this.cakeGroup.rotation.y = rotationAngle;
      }

      // Step 3: Brand Reveal Text Fade In (at 3.0s)
      if (elapsedTime >= 2.8 && elapsedTime < 4.5 && this.brandText) {
        this.brandText.classList.add('visible');
      }

      // Step 4: Auto Transition to Hero (at 4.5s)
      if (elapsedTime >= 4.5) {
        this.transitionToHero();
      }
    } else if (this.isHeroMode) {
      // -------------------------------------------------------------
      // HERO MODE (Gentle ambient spin + smooth mouse inertia)
      // -------------------------------------------------------------
      this.targetRotationY += 0.003;
      this.cakeRotationY += (this.targetRotationY - this.cakeRotationY) * 0.08;
      this.cakeGroup.rotation.y = this.cakeRotationY;
      
      // Floating bob motion in hero
      this.cakeGroup.position.y = Math.sin(elapsedTime * 2) * 0.08 - 0.2;
    }

    // -------------------------------------------------------------
    // REALISTIC CANDLE FLAME FLICKER & ORGANIC GLOW
    // -------------------------------------------------------------
    this.candleFlames.forEach((flame, index) => {
      const flickerSpeed = 12 + index * 3;
      const scaleVariation = 1.0 + Math.sin(elapsedTime * flickerSpeed) * 0.12;
      const wobbleX = Math.sin(elapsedTime * (flickerSpeed * 0.7)) * 0.008;
      const wobbleZ = Math.cos(elapsedTime * (flickerSpeed * 0.8)) * 0.008;

      flame.scale.set(scaleVariation, scaleVariation * 1.08, scaleVariation);
      flame.position.x += wobbleX * 0.05;
      flame.position.z += wobbleZ * 0.05;

      // Soft light intensity flicker
      if (this.candleLights[index]) {
        this.candleLights[index].intensity = 0.75 + Math.sin(elapsedTime * flickerSpeed) * 0.25;
      }
    });

    // -------------------------------------------------------------
    // FLOATING PARTICLES DRIFT
    // -------------------------------------------------------------
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.006;
        if (positions[i] > 4.5) {
          positions[i] = 0;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate engine when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.cake3D = new Cake3DEngine();
});
