/* ============================================================
   VISISPHER — Main JS
   ============================================================ */

/* Burger menu
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

/* Active nav link
   ============================================================ */
(function markActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-nav a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const page = href.split('/').pop();
    if (page === path || (path === '' && page === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* Scroll animations (Intersection Observer)
   ============================================================ */
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

/* Rotating subtitles (hero — index only)
   ============================================================ */
const rotatingEl = document.getElementById('rotatingSubtitle');
if (rotatingEl) {
  const lines = [
    'Gagnez en visibilité et démarquez-vous de vos concurrents',
    'Un site professionnel qui travaille pour vous 24h/24',
    'Attirez plus de clients grâce à une présence digitale solide',
  ];
  let idx = 0;

  function showNext() {
    rotatingEl.style.opacity = '0';
    rotatingEl.style.transform = 'translateY(8px)';
    setTimeout(() => {
      idx = (idx + 1) % lines.length;
      rotatingEl.textContent = lines[idx];
      rotatingEl.style.opacity = '1';
      rotatingEl.style.transform = 'translateY(0)';
    }, 380);
  }

  rotatingEl.textContent = lines[0];
  rotatingEl.style.transition = 'opacity 0.38s ease, transform 0.38s ease';
  setInterval(showNext, 3800);
}
