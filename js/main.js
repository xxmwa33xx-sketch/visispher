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
  document.querySelectorAll('a, button, .card, .testimonial, .pricing-card, input, select, textarea').forEach(el => {
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
      `box-shadow:0 0 ${Math.round(size * 3)}px rgba(79,209,255,0.8)`,
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
  const path = window.location.pathname;
  const page = path === '/' || path === '' ? '/' : path.split('/').pop();

  document.querySelectorAll('.site-nav a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const isHome = (href === '/' && (page === '/' || page === 'index.html' || page === ''));
    const isPage = href !== '/' && href.split('/').pop() === page;
    if (isHome || isPage) a.classList.add('active');
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
