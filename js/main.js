/* ============================================================
   VISISPHER — Main JS
   ============================================================ */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktop = window.matchMedia('(pointer: fine)').matches;

/* 1. Custom cursor (desktop only)
   ============================================================ */
if (isDesktop && !prefersReduced) {
  const dot  = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.setAttribute('aria-hidden', 'true');

  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  document.addEventListener('mouseleave', () => { dot.classList.add('hidden'); ring.classList.add('hidden'); });
  document.addEventListener('mouseenter', () => { dot.classList.remove('hidden'); ring.classList.remove('hidden'); });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  /* Grow on hover over interactive elements */
  document.querySelectorAll('a, button, summary, .card, .testimonial, .pricing-card, input, select, textarea').forEach(el => {
    el.addEventListener('mouseenter', () => dot.classList.add('hover'));
    el.addEventListener('mouseleave', () => dot.classList.remove('hover'));
  });
}

/* 2. Particles (hero)
   ============================================================ */
function spawnParticles(container, count = 35) {
  if (prefersReduced) return;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    const size = Math.random() * 2.5 + 1;
    p.style.cssText = [
      `left:${Math.random() * 100}%`,
      `top:${Math.random() * 100}%`,
      `width:${size}px`,
      `height:${size}px`,
      `--dur:${(Math.random() * 10 + 8).toFixed(1)}s`,
      `--delay:${(Math.random() * 10).toFixed(1)}s`,
      `--dx:${((Math.random() - 0.5) * 70).toFixed(0)}px`,
      `--max-opacity:${(Math.random() * 0.5 + 0.3).toFixed(2)}`,
      `box-shadow:0 0 ${Math.round(size * 3)}px rgba(143,130,251,0.8)`,
    ].join(';');
    container.appendChild(p);
  }
}

const particleContainer = document.getElementById('particles');
if (particleContainer) spawnParticles(particleContainer);

/* 3. Header shrink on scroll
   ============================================================ */
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* 4. Burger menu
   ============================================================ */
const burger    = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');

if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    mobileNav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileNav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* 5. Active nav link
   ============================================================ */
(function markActiveNav() {
  // Normalise le chemin courant : gère les anciennes URLs .html et les slashs finaux
  let path = window.location.pathname.replace(/index\.html$/, '').replace(/\.html$/, '/');
  if (path !== '/' && !path.endsWith('/')) path += '/';

  document.querySelectorAll('.site-nav a, .mobile-nav a, .hero-nav a, .nav-pill a').forEach(a => {
    const href = (a.getAttribute('href') || '').split('?')[0].split('#')[0];
    if (!href.startsWith('/')) return;
    const isMatch = href === path || (href !== '/' && path === href);
    if (isMatch) a.classList.add('active');
  });
})();

/* 6. Scroll animations with stagger
   ============================================================ */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    /* Stagger siblings within same parent grid */
    const parent = el.parentElement;
    if (parent) {
      const siblings = [...parent.querySelectorAll('.fade-in:not(.visible)')];
      const idx = siblings.indexOf(el);
      if (idx > 0 && !el.style.transitionDelay) {
        el.style.transitionDelay = `${idx * 0.1}s`;
      }
    }

    el.classList.add('visible');
    revealObserver.unobserve(el);
  });
}, { threshold: 0.1 });

document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));

/* 7. Counter animation
   ============================================================ */
function animateCounter(el) {
  if (prefersReduced) {
    el.textContent = el.dataset.counter + (el.dataset.suffix || '');
    return;
  }

  const target   = parseFloat(el.dataset.counter);
  const suffix   = el.dataset.suffix || '';
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
  const duration = 2200;
  const start    = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const value    = eased * target;
    el.textContent = (decimals ? value.toFixed(decimals) : Math.round(value)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

/* 8. Rotating subtitles (hero — crossfade)
   ============================================================ */
const rotatingEl = document.getElementById('rotatingSubtitle');
if (rotatingEl) {
  const lines = [
    'Gagnez en visibilité et démarquez-vous de vos concurrents',
    'Un site professionnel qui travaille pour vous 24h/24',
    'Attirez plus de clients grâce à une présence digitale solide',
  ];

  let idx = 0;
  let busy = false;

  rotatingEl.textContent = lines[0];
  rotatingEl.style.opacity = '1';

  if (!prefersReduced) {
    setInterval(() => {
      if (busy) return;
      busy = true;
      rotatingEl.style.opacity = '0';
      rotatingEl.style.transform = 'translateY(8px)';
      setTimeout(() => {
        idx = (idx + 1) % lines.length;
        rotatingEl.textContent = lines[idx];
        rotatingEl.style.opacity = '1';
        rotatingEl.style.transform = 'translateY(0)';
        setTimeout(() => { busy = false; }, 420);
      }, 420);
    }, 3200);
  }
}

/* 9. Réseau de données — champ de particules persistant (toutes les pages)
   ============================================================
   Une seule couche visuelle, présente sur chaque page, qui exprime
   "un même univers que l'on traverse" : particules multi-profondeur
   reliées par de fines connexions, ralenties/estompées près de
   Guillaume, et qui accélèrent en éclat directionnel lors d'un
   changement de page (voir section 10). */
(function initNetworkField() {
  const canvas = document.getElementById('network-field');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const narrow = window.innerWidth < 700;
  const COUNT     = narrow || coarse ? 55 : 115;
  const LINK_DIST = narrow ? 95 : 150;

  const PALETTE = [
    [143, 130, 251], // indigo signature
    [79, 224, 201],  // turquoise glacé
    [185, 169, 255], // reflet lavande
    [255, 255, 255], // blanc froid — rare, réservé aux points les plus proches
  ];
  function pickColor() {
    const r = Math.random();
    if (r < 0.07) return PALETTE[3];
    if (r < 0.42) return PALETTE[0];
    if (r < 0.72) return PALETTE[1];
    return PALETTE[2];
  }

  let w, h, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width  = Math.round(window.innerWidth  * dpr);
    h = canvas.height = Math.round(window.innerHeight * dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  function makeParticle() {
    const layer = Math.random(); // 0 = lointain (petit, lent) → 1 = proche (grand, vif)
    return {
      x: Math.random(), y: Math.random(),
      layer,
      vx: (Math.random() - 0.5) * (0.00006 + layer * 0.00014),
      vy: (Math.random() - 0.5) * (0.00006 + layer * 0.00014),
      r: 1.1 + layer * 2.5,
      color: pickColor(),
    };
  }
  const particles = Array.from({ length: COUNT }, makeParticle);

  /* Éclat de traversée déclenché lors d'un changement de page */
  let warp = 0;
  window.networkWarp = () => { warp = 1; };

  let lastTime = performance.now();
  let tabHidden = false;
  document.addEventListener('visibilitychange', () => { tabHidden = document.hidden; });

  function drawFrame(dt) {
    const calm = !!window.networkCalm;
    const speedMul   = (calm ? 0.22 : 1) * (1 + warp * 7);
    const opacityMul = calm ? 0.3 : 1;

    ctx.clearRect(0, 0, w, h);

    for (const p of particles) {
      p.x += p.vx * dt * speedMul;
      p.y += p.vy * dt * speedMul;
      if (p.x < -0.05) p.x = 1.05; else if (p.x > 1.05) p.x = -0.05;
      if (p.y < -0.05) p.y = 1.05; else if (p.y > 1.05) p.y = -0.05;
    }

    /* Connexions — seulement entre particules de profondeur proche, coupées pendant l'éclat */
    if (warp < 0.15) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          if (Math.abs(a.layer - b.layer) > 0.35) continue;
          const dx = (a.x - b.x) * w, dy = (a.y - b.y) * h;
          const dist = Math.hypot(dx, dy);
          const maxDist = LINK_DIST * dpr * (0.55 + a.layer * 0.6);
          if (dist < maxDist) {
            const o = (1 - dist / maxDist) * 0.26 * opacityMul;
            ctx.strokeStyle = `rgba(${a.color[0]},${a.color[1]},${a.color[2]},${o.toFixed(3)})`;
            ctx.lineWidth = dpr;
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        }
      }
    }

    const cx = w / 2, cy = h / 2;
    for (const p of particles) {
      const px = p.x * w, py = p.y * h;
      const baseOpacity = (0.34 + p.layer * 0.56) * opacityMul;
      const size = p.r * dpr * (1 + p.layer);

      if (warp > 0.15) {
        const dx = px - cx, dy = py - cy;
        const len = Math.hypot(dx, dy) || 1;
        const streak = warp * (0.15 + p.layer * 0.55) * Math.hypot(w, h);
        ctx.strokeStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${(baseOpacity * warp).toFixed(3)})`;
        ctx.lineWidth = size * 0.8;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + (dx / len) * streak, py + (dy / len) * streak);
        ctx.stroke();
      }

      ctx.shadowBlur = size * 2.2;
      ctx.shadowColor = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${(baseOpacity * 0.9).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(px, py, size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${baseOpacity.toFixed(3)})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  if (prefersReduced) {
    drawFrame(16); // une seule image fixe, pas de boucle d'animation
    return;
  }

  function loop(now) {
    if (!tabHidden) {
      const dt = Math.min(now - lastTime, 50);
      lastTime = now;
      warp *= 0.93;
      drawFrame(dt);
    } else {
      lastTime = now;
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();

/* 10. Transitions entre pages ("plonger plus loin dans le réseau")
   ============================================================ */
if (!prefersReduced) {
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel') && !href.startsWith('#')) {
      link.addEventListener('click', e => {
        e.preventDefault();
        if (window.networkWarp) window.networkWarp();
        document.body.classList.add('page-out');
        setTimeout(() => { window.location.href = href; }, 400);
      });
    }
  });

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-out');
    document.body.classList.add('page-in');
    setTimeout(() => document.body.classList.remove('page-in'), 400);
  });
}

/* 10.5 Guillaume — le réseau s'efface devant l'humain
   ============================================================ */
(function initHumanCalm() {
  const el = document.querySelector('.human-moment');
  if (!el) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => { window.networkCalm = entry.isIntersecting; });
  }, { threshold: 0.4 });
  obs.observe(el);
})();

/* 10.6 Titres transmis — les mots du H1 apparaissent comme reçus, pas tapés
   ============================================================ */
(function initTransmittedHeading() {
  if (prefersReduced) return;
  const heading = document.querySelector('.hero__title');
  if (!heading) return;

  heading.setAttribute('aria-label', heading.textContent.trim());

  const nodes = Array.from(heading.childNodes);
  heading.textContent = '';
  let wordIndex = 0;

  nodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.split(/(\s+)/).forEach(part => {
        if (part === '') return;
        if (/^\s+$/.test(part)) {
          heading.appendChild(document.createTextNode(part));
          return;
        }
        const span = document.createElement('span');
        span.className = 'transmit-word';
        span.textContent = part;
        span.style.transitionDelay = `${wordIndex * 0.055}s`;
        wordIndex++;
        heading.appendChild(span);
      });
    } else {
      // Élément existant (ex : .glow-word) — conservé tel quel, juste synchronisé dans le flux
      node.classList.add('transmit-word');
      node.style.transitionDelay = `${wordIndex * 0.055}s`;
      wordIndex++;
      heading.appendChild(node);
    }
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => heading.classList.add('is-transmitted'));
  });
})();

/* 11. Beat reveal (homepage V2 — un seul mouvement par écran)
   ============================================================ */
const beatObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    beatObserver.unobserve(entry.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.beat__inner').forEach(el => beatObserver.observe(el));

/* 12. Système de fenêtres (homepage V2)
   ============================================================ */
(function initWindows() {
  const overlay = document.querySelector('[data-window-overlay]');
  if (!overlay) return;

  const triggers = document.querySelectorAll('[data-window-trigger]');
  const windows = document.querySelectorAll('.window');
  let activeWindow = null;
  let lastFocused = null;

  function closeWindow() {
    if (!activeWindow) return;
    activeWindow.classList.remove('is-open');
    activeWindow.setAttribute('aria-hidden', 'true');
    activeWindow.inert = true;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus({ preventScroll: true });
    activeWindow = null;
  }

  function openWindow(id, triggerEl) {
    const win = document.getElementById('window-' + id);
    if (!win) return;
    if (activeWindow) closeWindow();
    lastFocused = triggerEl || document.activeElement;
    win.inert = false;
    // force reflow so the transition runs
    void win.offsetWidth;
    win.classList.add('is-open');
    win.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    activeWindow = win;
    const closeBtn = win.querySelector('.window__close');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      openWindow(trigger.dataset.windowTrigger, trigger);
    });
  });

  windows.forEach(win => {
    const closeBtn = win.querySelector('.window__close');
    if (closeBtn) closeBtn.addEventListener('click', closeWindow);
  });

  overlay.addEventListener('click', closeWindow);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && activeWindow) closeWindow();
  });

  /* Mini-tabs à l'intérieur d'une fenêtre (ex : Google / IA & GEO / Structure) */
  document.querySelectorAll('.window__tabs').forEach(tabList => {
    const tabs = [...tabList.querySelectorAll('.window__tab')];
    const win = tabList.closest('.window');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
        tab.setAttribute('aria-selected', 'true');
        win.querySelectorAll('.window__panel').forEach(panel => {
          panel.classList.toggle('is-active', panel.id === tab.getAttribute('aria-controls'));
        });
      });
    });
  });
})();

/* 13. Carousel réalisations (homepage V2)
   ============================================================ */
document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const slides = [...carousel.querySelectorAll('.carousel__slide')];
  const dotsWrap = carousel.querySelector('.carousel__dots');
  const prevBtn = carousel.querySelector('.carousel__prev');
  const nextBtn = carousel.querySelector('.carousel__next');
  if (!slides.length) return;

  let current = slides.findIndex(s => s.classList.contains('is-active'));
  if (current < 0) current = 0;

  const dots = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel__dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Projet ${i + 1} sur ${slides.length}`);
    dot.addEventListener('click', () => show(i));
    if (dotsWrap) dotsWrap.appendChild(dot);
    return dot;
  });

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => d.setAttribute('aria-current', i === current ? 'true' : 'false'));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => show(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => show(current + 1));
  show(current);
});

/* 14. FAQ navigable — une réponse ouverte à la fois
   ============================================================ */
document.querySelectorAll('.faq-q').forEach(item => {
  const trigger = item.querySelector('.faq-q__trigger');
  if (!trigger) return;
  trigger.addEventListener('click', () => {
    const willOpen = !item.classList.contains('is-open');
    item.closest('.faq-browser__list').querySelectorAll('.faq-q.is-open').forEach(open => {
      open.classList.remove('is-open');
      open.querySelector('.faq-q__trigger').setAttribute('aria-expanded', 'false');
    });
    if (willOpen) {
      item.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
  });
});
