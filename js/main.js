// Shared header/footer snippet helper - pages use same structure
// Main site JavaScript

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initCelestialBodies();
  initNavigation();
  initHeaderScroll();
  initAdmissionModalTriggers();
});

function initStarfield() {
  const container = document.getElementById('starfield');
  if (!container) return;

  const count = 80;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    const size = Math.random() > 0.7 ? 'lg' : Math.random() > 0.4 ? 'md' : 'sm';
    star.className = `star star--${size}`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty('--duration', `${2 + Math.random() * 4}s`);
    star.style.setProperty('--delay', `${Math.random() * 5}s`);
    star.style.setProperty('--opacity', `${0.3 + Math.random() * 0.7}`);
    container.appendChild(star);
  }
}

function initCelestialBodies() {
  const layer = document.getElementById('celestial-layer');
  if (!layer) return;

  const bodies = [
    { type: 'planet', size: 48, top: '12%', left: '4%', bg: 'radial-gradient(circle at 30% 30%, #fde047, #f59e0b, #7c3aed)', dur: 7, delay: 0, rot: -15 },
    { type: 'moon', size: 32, top: '28%', right: '6%', dur: 5, delay: 1, rot: 10 },
    { type: 'ring', size: 56, top: '55%', left: '2%', dur: 8, delay: 2, rot: 25 },
    { type: 'star-shape', top: '18%', right: '18%', size: '1.8rem', dur: 4, delay: 0.5 },
    { type: 'planet', size: 36, top: '70%', right: '4%', bg: 'radial-gradient(circle at 35% 35%, #22d3ee, #6366f1, #ec4899)', dur: 6, delay: 1.5, rot: 20 },
    { type: 'star-shape', top: '45%', left: '8%', size: '1.2rem', dur: 5, delay: 2.5 },
    { type: 'moon', size: 24, top: '82%', left: '12%', dur: 6, delay: 0.8, rot: -8 },
    { type: 'star-shape', top: '8%', left: '42%', size: '1rem', dur: 3.5, delay: 1.2 }
  ];

  bodies.forEach(b => {
    const el = document.createElement('div');
    el.className = `celestial-body celestial-body--${b.type}`;
    el.style.top = b.top;
    if (b.left) el.style.left = b.left;
    if (b.right) el.style.right = b.right;
    el.style.setProperty('--float-dur', `${b.dur}s`);
    el.style.setProperty('--float-delay', `${b.delay}s`);
    el.style.setProperty('--rot', `${b.rot || 0}deg`);

    if (b.type === 'star-shape') {
      el.textContent = '✦';
      el.style.setProperty('--star-size', b.size);
    } else {
      el.style.width = `${b.size}px`;
      el.style.height = `${b.size}px`;
      if (b.bg) el.style.setProperty('--planet-bg', b.bg);
    }
    layer.appendChild(el);
  });

  const shoot = document.createElement('div');
  shoot.className = 'shooting-star';
  shoot.style.top = '15%';
  shoot.style.left = '20%';
  layer.appendChild(shoot);
}

function initNavigation() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Highlight Daycare in nav
  document.querySelectorAll('.nav-links a[href="daycare.html"]').forEach(link => {
    link.classList.add('nav-daycare');
  });

  // Highlight active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });
}

function initAdmissionModalTriggers() {
  const modal = document.getElementById('admission-modal');
  if (!modal) return;

  const triggers = [
    document.getElementById('join-galaxy-btn'),
    document.getElementById('join-galaxy-hero'),
    document.getElementById('join-galaxy-cta'),
    ...document.querySelectorAll('[data-open-admission]')
  ].filter(Boolean);

  triggers.forEach(btn => {
    btn.addEventListener('click', () => openAdmissionModal());
  });
}

function openAdmissionModal() {
  const modal = document.getElementById('admission-modal');
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  const firstInput = modal.querySelector('input, select, textarea');
  if (firstInput) setTimeout(() => firstInput.focus(), 100);
}

function closeAdmissionModal() {
  const modal = document.getElementById('admission-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Export for other modules
window.TwinkleStars = {
  openAdmissionModal,
  closeAdmissionModal,
  showToast
};
