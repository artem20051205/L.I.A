(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Nav: add shadow when page is scrolled ── */
  var nav = document.querySelector('nav');
  if (nav) {
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Nav: highlight the current section link while scrolling (index page only) ── */
  var navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    var sections = ['benefits', 'features', 'howitworks'].map(function (id) {
      return {
        el:   document.getElementById(id),
        link: navLinks.querySelector('a[href="#' + id + '"]')
      };
    }).filter(function (s) { return s.el && s.link; });

    if (sections.length) {
      var current = null;
      window.addEventListener('scroll', function () {
        var next = null;
        sections.forEach(function (s) {
          if (s.el.getBoundingClientRect().top <= 160) next = s;
        });
        if (next === current) return;
        current = next;
        navLinks.querySelectorAll('a').forEach(function (a) { a.classList.remove('active'); });
        if (current) current.link.classList.add('active');
      }, { passive: true });
    }
  }

  /* ── Mobile menu ── */
  var btn  = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobileMenu');
  if (btn && menu) {
    function closeMenu() {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  if (prefersReduced) return;

  /* ── Fade sections in as they scroll into view ── */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  }

  /* ── Reviews marquee: clone cards so the loop is seamless ── */
  var track = document.querySelector('.reviews-grid');
  if (track) {
    Array.prototype.slice.call(track.children).forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }
})();
