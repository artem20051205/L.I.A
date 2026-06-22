(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Nav: scroll shadow + theme switch ── */
  const nav = document.querySelector('nav');
  const LIGHT_IDS = ['benefits', 'features'];

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 40);

    let isLight = false;
    LIGHT_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top < 88 && r.bottom > 0) isLight = true;
    });
    nav.classList.toggle('nav-light', isLight);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Liquid-glass scroll-progress bar ── */
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    let pTick = false;
    function updateProgress() {
      pTick = false;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(1, h.scrollTop / max) : 0;
      progressBar.style.transform = 'scaleX(' + p + ')';
    }
    updateProgress();
    window.addEventListener('scroll', function () {
      if (!pTick) { pTick = true; requestAnimationFrame(updateProgress); }
    }, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
  }

  /* ── Nav: active link highlight ── */
  const navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    const sections = ['benefits', 'features', 'howitworks'].map(id => ({
      el:   document.getElementById(id),
      link: navLinks.querySelector('a[href="#' + id + '"]')
    })).filter(s => s.el && s.link);

    if (sections.length) {
      let current = null;
      window.addEventListener('scroll', function () {
        let next = null;
        sections.forEach(s => { if (s.el.getBoundingClientRect().top <= 160) next = s; });
        if (next === current) return;
        current = next;
        navLinks.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        if (current) current.link.classList.add('active');
      }, { passive: true });
    }
  }

  /* ── Mobile menu ── */
  const menuBtn  = document.querySelector('.nav-toggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    function closeMenu() {
      mobileMenu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    menuBtn.addEventListener('click', function () {
      const open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  }

  if (prefersReduced) return;

  /* ── Scroll reveal ── */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -5% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  }

  /* ── Reviews marquee: clone cards for seamless loop ── */
  const reviewTrack = document.querySelector('.reviews-grid');
  if (reviewTrack) {
    Array.from(reviewTrack.children).forEach(function (card) {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      reviewTrack.appendChild(clone);
    });
  }

  /* ── Logo cloud: clone items for seamless loop ── */
  const logoItems = document.querySelector('.logo-cloud-items');
  if (logoItems) {
    const clone = logoItems.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    logoItems.parentElement.appendChild(clone);
  }

  /* ══════════════════════════════════════
     ★  LIQUID GLASS: mouse-tracking
        specular highlight

     Moves the radial-gradient "hot spot"
     (::after) as the mouse moves over
     each .glass element. Sets --gx / --gy
     CSS custom properties that the glass
     ::after uses for radial-gradient center.
  ══════════════════════════════════════ */
  function initGlassTracking() {
    document.querySelectorAll('.glass').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width)  * 100;
        const y = ((e.clientY - r.top)  / r.height) * 100;
        el.style.setProperty('--gx', x + '%');
        el.style.setProperty('--gy', y + '%');
      });
      el.addEventListener('mouseleave', function () {
        el.style.setProperty('--gx', '28%');
        el.style.setProperty('--gy', '18%');
      });
    });
  }

  /* ══════════════════════════════════════
     ★  3-D TILT  on [data-tilt] cards

     Tracks mouse position relative to the
     card centre and tilts on X/Y axes,
     simulating a physically lit glass pane.
  ══════════════════════════════════════ */
  function initTilt() {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      const MAX   = parseFloat(el.dataset.tiltMax || '10');
      const SCALE = parseFloat(el.dataset.tiltScale || '1.025');
      let raf = 0;
      let targetRx = 0, targetRy = 0;
      let currentRx = 0, currentRy = 0;

      el.addEventListener('mousemove', function (e) {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width  - 0.5;   // -0.5 … +0.5
        const ny = (e.clientY - r.top)  / r.height - 0.5;

        targetRx = -ny * MAX * 2;
        targetRy =  nx * MAX * 2;

        /* also update glass specular */
        el.style.setProperty('--gx', ((nx + 0.5) * 100) + '%');
        el.style.setProperty('--gy', ((ny + 0.5) * 100) + '%');

        if (!raf) raf = requestAnimationFrame(tick);
      });

      el.addEventListener('mouseleave', function () {
        targetRx = 0; targetRy = 0;
        el.style.setProperty('--gx', '28%');
        el.style.setProperty('--gy', '18%');
        if (!raf) raf = requestAnimationFrame(tick);
      });

      function tick() {
        raf = 0;
        const dx = targetRx - currentRx;
        const dy = targetRy - currentRy;
        if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
          currentRx = targetRx; currentRy = targetRy;
          el.style.transform =
            (currentRx === 0 && currentRy === 0)
              ? ''
              : 'perspective(1400px) rotateX(' + currentRx + 'deg) rotateY(' + currentRy + 'deg) scale(' + SCALE + ')';
          return;
        }
        currentRx += dx * 0.14;
        currentRy += dy * 0.14;
        el.style.transform =
          'perspective(1400px) rotateX(' + currentRx + 'deg) rotateY(' + currentRy + 'deg) scale(' + SCALE + ')';
        raf = requestAnimationFrame(tick);
      }
    });
  }

  initGlassTracking();
  initTilt();

  /* ══════════════════════════════════════
     ★  Orbiting rim glint
        Inject a .glass-glint into every
        .glass card; CSS animates the conic
        light around the rim (gated to view).
  ══════════════════════════════════════ */
  document.querySelectorAll('.glass').forEach(function (el) {
    const g = document.createElement('i');
    g.className = 'glass-glint';
    g.setAttribute('aria-hidden', 'true');
    el.appendChild(g);
  });

  /* ══════════════════════════════════════
     ★  In-view gating
        Toggle .in-view on glass cards and
        scenes so their continuous animations
        (prism, glint, blobs) only run while
        on screen — big perf saver.
  ══════════════════════════════════════ */
  if ('IntersectionObserver' in window) {
    const viewIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle('in-view', e.isIntersecting);
      });
    }, { rootMargin: '120px 0px 120px 0px', threshold: 0 });
    document.querySelectorAll('.glass, .scene').forEach(function (el) { viewIO.observe(el); });
  } else {
    document.querySelectorAll('.glass, .scene').forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ══════════════════════════════════════
     ★  Magnetic buttons
        Primary buttons drift toward the
        cursor and lift, then spring back.
  ══════════════════════════════════════ */
  document.querySelectorAll('.btn').forEach(function (btn) {
    const PULL = 0.32;          // how strongly it follows the cursor
    btn.addEventListener('mousemove', function (e) {
      const r = btn.getBoundingClientRect();
      const mx = (e.clientX - r.left - r.width  / 2) * PULL;
      const my = (e.clientY - r.top  - r.height / 2) * PULL;
      btn.style.transform = 'translate(' + mx + 'px,' + (my - 3) + 'px) scale(1.04)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });

    /* click ripple */
    btn.addEventListener('pointerdown', function (e) {
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 1.6;
      const ink = document.createElement('span');
      ink.className = 'ripple';
      ink.style.width = ink.style.height = size + 'px';
      ink.style.left = (e.clientX - r.left) + 'px';
      ink.style.top  = (e.clientY - r.top)  + 'px';
      btn.appendChild(ink);
      ink.addEventListener('animationend', function () { ink.remove(); });
    });
  });

  /* ══════════════════════════════════════
     ★  Hero parallax
        Blobs drift with the cursor to give
        the hero real depth.
  ══════════════════════════════════════ */
  const heroScene = document.querySelector('.hero-scene');
  if (heroScene) {
    const blobs = Array.from(heroScene.querySelectorAll('.blob'));
    let hraf = 0, tx = 0, ty = 0;
    heroScene.addEventListener('mousemove', function (e) {
      const r = heroScene.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width  - 0.5);
      ty = ((e.clientY - r.top)  / r.height - 0.5);
      if (!hraf) hraf = requestAnimationFrame(moveBlobs);
    });
    heroScene.addEventListener('mouseleave', function () {
      tx = 0; ty = 0;
      if (!hraf) hraf = requestAnimationFrame(moveBlobs);
    });
    function moveBlobs() {
      hraf = 0;
      blobs.forEach(function (b, i) {
        const depth = (i + 1) * 14;   // deeper blobs move more
        b.style.translate = (tx * depth) + 'px ' + (ty * depth) + 'px';
      });
    }
  }

})();
