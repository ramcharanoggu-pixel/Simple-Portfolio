/* ==========================================================
   Oggu Ram Charan — Portfolio
   Vanilla JS, split into small independent modules.
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initYear();
  initScrollProgress();
  initCustomCursor();
  initNavbar();
  initThemeToggle();
  initTypingAnimation();
  initBackgroundCanvas();
  initRevealAnimations();
  initStatCounters();
  initSkillBars();
  initProjectFilter();
  initProjectModal();
  initBackToTop();
  initCopyEmail();
  initContactForm();
  initCommandPalette();
});

/* ---------- Loader ---------- */
function initLoader() {
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 500);
  });
  // fallback in case 'load' already fired or is slow
  setTimeout(() => loader.classList.add('hidden'), 2200);
}

/* ---------- Footer year ---------- */
function initYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ---------- Scroll progress bar ---------- */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  const update = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    bar.style.width = pct + '%';
  };
  document.addEventListener('scroll', update, { passive: true });
  update();
}

/* ---------- Custom cursor (desktop only) ---------- */
function initCustomCursor() {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;
  let started = false;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
    if (!started) { document.body.classList.add('cursor-ready'); started = true; }
  });

  function raf() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(raf);
  }
  raf();

  const hoverTargets = 'a, button, .project-card, input, textarea, .skill-group, .stat-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) ring.classList.remove('hover');
  });
}

/* ---------- Navbar: scroll bg + active link + mobile menu ---------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('navMenu');
  const links = document.querySelectorAll('.nav-link');
  const sections = Array.from(links).map(l => document.getElementById(l.dataset.section)).filter(Boolean);

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);

    let currentId = sections[0] ? sections[0].id : null;
    const offset = 120;
    sections.forEach(sec => {
      if (window.scrollY + offset >= sec.offsetTop) currentId = sec.id;
    });
    links.forEach(l => l.classList.toggle('active', l.dataset.section === currentId));
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.forEach(l => l.addEventListener('click', () => {
    menu.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

/* ---------- Theme toggle (persisted) ---------- */
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  const root = document.documentElement;
  const saved = localStorage.getItem('portfolio-theme');

  // Default theme is the warm cream/vintage look (no attribute).
  // 'dark' is the alt mode, applied via data-theme="dark".
  if (saved === 'dark') {
    root.setAttribute('data-theme', 'dark');
  } else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.setAttribute('data-theme', 'dark');
  }

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    if (next === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    localStorage.setItem('portfolio-theme', next);
    showToast(`Switched to ${next} mode`);
  });
}

/* ---------- Typing animation in hero ---------- */
function initTypingAnimation() {
  const el = document.getElementById('typed-role');
  if (!el) return;
  const roles = ['Software Developer', 'Web Developer', 'Problem Solver', 'DSA Enthusiast'];
  let roleIndex = 0, charIndex = 0, deleting = false;

  function tick() {
    const word = roles[roleIndex];
    if (!deleting) {
      charIndex++;
      el.textContent = word.slice(0, charIndex);
      if (charIndex === word.length) {
        deleting = true;
        setTimeout(tick, 1400);
        return;
      }
    } else {
      charIndex--;
      el.textContent = word.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }
    setTimeout(tick, deleting ? 45 : 85);
  }
  tick();
}

/* ---------- Animated background: floating particles ---------- */
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function makeParticles() {
    const count = Math.min(34, Math.floor((w * h) / 34000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 5 + 3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      hue: Math.random() > 0.5 ? '107,122,79' : '201,123,90' // sage / terracotta
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20 || p.x > w + 20) p.vx *= -1;
      if (p.y < -20 || p.y > h + 20) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue}, 0.16)`;
      ctx.fill();
    });
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  resize();
  makeParticles();
  draw();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); makeParticles(); }, 200);
  });
}

/* ---------- Scroll reveal (IntersectionObserver) ---------- */
function initRevealAnimations() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || items.length === 0) {
    items.forEach(i => i.classList.add('in-view'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach(i => obs.observe(i));
}

/* ---------- Stat counters ---------- */
function initStatCounters() {
  const nums = document.querySelectorAll('.stat-num');
  if (nums.length === 0) return;

  const animate = (el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  };

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  nums.forEach(n => obs.observe(n));
}

/* ---------- Skill bar fill animation ---------- */
function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar span');
  if (bars.length === 0) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('filled');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  bars.forEach(b => obs.observe(b));
}

/* ---------- Project filter ---------- */
function initProjectFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if (buttons.length === 0) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const cats = (card.dataset.cat || '').split(' ');
        const show = filter === 'all' || cats.includes(filter);
        card.classList.toggle('hidden-by-filter', !show);
      });
    });
  });
}

/* ---------- Project quick-view modal ---------- */
function initProjectModal() {
  const modal = document.getElementById('project-modal');
  const cards = document.querySelectorAll('.project-card');
  if (!modal || cards.length === 0) return;

  const thumb = document.getElementById('modalThumb');
  const title = document.getElementById('modalTitle');
  const desc = document.getElementById('modalDesc');
  const featuresEl = document.getElementById('modalFeatures');
  const techEl = document.getElementById('modalTech');
  const githubLink = document.getElementById('modalGithub');
  const demoLink = document.getElementById('modalDemo');

  let lastFocused = null;

  function openModal(card) {
    lastFocused = document.activeElement;
    title.textContent = card.dataset.title || '';
    desc.textContent = card.dataset.desc || '';

    featuresEl.innerHTML = '';
    (card.dataset.features || '').split('·').map(f => f.trim()).filter(Boolean).forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      featuresEl.appendChild(li);
    });

    techEl.innerHTML = '';
    (card.dataset.tech || '').split(',').map(t => t.trim()).filter(Boolean).forEach(t => {
      const span = document.createElement('span');
      span.textContent = t;
      techEl.appendChild(span);
    });

    githubLink.href = card.dataset.github || '#';
    demoLink.href = card.dataset.demo || '#';

    const thumbEl = card.querySelector('.project-thumb');
    thumb.style.background = thumbEl ? getComputedStyle(thumbEl).background : '';

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // let GitHub/demo links work normally
      openModal(card);
    });
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
    });
  });

  modal.querySelectorAll('[data-modal-close]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });
}

/* ---------- Back to top ---------- */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  document.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---------- Copy email button ---------- */
function initCopyEmail() {
  const btn = document.getElementById('copyEmailBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const email = 'ramcharanoggu@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      showToast('Email copied!');
    } catch (err) {
      showToast('Could not copy — please copy manually');
    }
  });
}

/* ---------- Contact form validation ---------- */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const fields = {
    name: form.querySelector('#cf-name'),
    email: form.querySelector('#cf-email'),
    subject: form.querySelector('#cf-subject'),
    message: form.querySelector('#cf-message'),
  };

  function setError(input, message) {
    const row = input.closest('.form-row');
    const errorEl = form.querySelector(`[data-error-for="${input.id}"]`);
    row.classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validate() {
    let valid = true;

    if (!fields.name.value.trim()) { setError(fields.name, 'Please enter your name.'); valid = false; }
    else setError(fields.name, '');

    if (!fields.email.value.trim()) { setError(fields.email, 'Please enter your email.'); valid = false; }
    else if (!isValidEmail(fields.email.value.trim())) { setError(fields.email, 'Please enter a valid email address.'); valid = false; }
    else setError(fields.email, '');

    if (!fields.subject.value.trim()) { setError(fields.subject, 'Please add a subject.'); valid = false; }
    else setError(fields.subject, '');

    const msg = fields.message.value.trim();
    if (!msg) { setError(fields.message, 'Please write a message.'); valid = false; }
    else if (msg.length < 20) { setError(fields.message, `Message should be at least 20 characters (currently ${msg.length}).`); valid = false; }
    else setError(fields.message, '');

    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validate()) {
      showToast('Message ready to send — connect this form to your backend or a service like Formspree.');
      form.reset();
      Object.values(fields).forEach(f => setError(f, ''));
    } else {
      showToast('Please fix the highlighted fields.');
    }
  });

  Object.values(fields).forEach(f => {
    f.addEventListener('blur', validate);
  });
}

/* ---------- Toast notifications ---------- */
function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 320);
  }, 2600);
}

/* ---------- Command palette (Ctrl/Cmd + K) ---------- */
function initCommandPalette() {
  const palette = document.getElementById('command-palette');
  const input = document.getElementById('cmdk-input');
  const list = document.getElementById('cmdk-list');
  const trigger = document.getElementById('cmdkTrigger');
  if (!palette || !input || !list) return;

  const commands = [
    { label: 'Go to Home', hint: 'section', action: () => scrollToSection('home') },
    { label: 'Go to About', hint: 'section', action: () => scrollToSection('about') },
    { label: 'Go to Skills', hint: 'section', action: () => scrollToSection('skills') },
    { label: 'Go to Projects', hint: 'section', action: () => scrollToSection('projects') },
    { label: 'Go to Resume', hint: 'section', action: () => scrollToSection('resume') },
    { label: 'Go to Contact', hint: 'section', action: () => scrollToSection('contact') },
    { label: 'Toggle Theme', hint: 'action', action: () => document.getElementById('themeToggle').click() },
  ];

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  let filtered = commands;
  let activeIndex = 0;

  function render() {
    list.innerHTML = '';
    filtered.forEach((cmd, i) => {
      const li = document.createElement('li');
      li.className = 'cmdk-item' + (i === activeIndex ? ' active' : '');
      li.innerHTML = `<span>${cmd.label}</span><small>${cmd.hint}</small>`;
      li.addEventListener('click', () => runCommand(cmd));
      list.appendChild(li);
    });
  }

  function runCommand(cmd) {
    cmd.action();
    close();
  }

  function open() {
    palette.hidden = false;
    input.value = '';
    filtered = commands;
    activeIndex = 0;
    render();
    setTimeout(() => input.focus(), 30);
  }

  function close() {
    palette.hidden = true;
  }

  document.addEventListener('keydown', (e) => {
    const isK = e.key.toLowerCase() === 'k';
    if ((e.metaKey || e.ctrlKey) && isK) {
      e.preventDefault();
      palette.hidden ? open() : close();
    }
    if (e.key === 'Escape' && !palette.hidden) close();
    if (!palette.hidden) {
      if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, filtered.length - 1); render(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); render(); }
      if (e.key === 'Enter' && filtered[activeIndex]) { runCommand(filtered[activeIndex]); }
    }
  });

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    filtered = commands.filter(c => c.label.toLowerCase().includes(q));
    activeIndex = 0;
    render();
  });

  trigger.addEventListener('click', open);
  palette.querySelectorAll('[data-cmdk-close]').forEach(el => el.addEventListener('click', close));
}
