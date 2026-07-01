(function () {
  'use strict'; // strict mode: helpt fouten sneller te vinden

  // Checkt of de gebruiker "minder beweging" heeft aangezet (prefers-reduced-motion).
  // Zo ja, dan zetten we later de animaties uit (beter voor toegankelijkheid / accessibility).
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Nav: schaduw toevoegen zodra je naar beneden scrollt ── */
  var nav = document.querySelector('nav');
  if (nav) {
    // Voeg de class 'scrolled' toe als je meer dan 40 pixels naar beneden scrollt (anders weghalen).
    function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
    onScroll(); // meteen 1x uitvoeren, voor het geval de pagina al gescrold is
    window.addEventListener('scroll', onScroll, { passive: true }); // passive: true = scrollen blijft soepel
  }

  /* ── Nav: de link van de huidige sectie oplichten tijdens het scrollen (alleen op de homepagina) ── */
  var navLinks = document.querySelector('.nav-links');
  if (navLinks) {
    // Zoek voor elke sectie het element op de pagina + de bijbehorende menu-link.
    var sections = ['benefits', 'features', 'howitworks', 'contact'].map(function (id) {
      return {
        el: document.getElementById(id),
        link: navLinks.querySelector('a[href="#' + id + '"]')
      };
    }).filter(function (s) { return s.el && s.link; }); // houd alleen secties die echt bestaan

    if (sections.length) {
      var current = null; // de sectie die nu actief (opgelicht) is
      window.addEventListener('scroll', function () {
        var next = null;
        // Zitten we (bijna) onderaan de pagina? Dan is de laatste sectie actief.
        var atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 50;
        if (atBottom) {
          next = sections[sections.length - 1];
        } else {
          // Anders: pak de laatste sectie waarvan de bovenkant boven de 160px-lijn staat.
          sections.forEach(function (s) {
            if (s.el.getBoundingClientRect().top <= 160) next = s;
          });
        }
        if (next === current) return; // niks veranderd? dan stoppen we (scheelt onnodig werk)
        current = next;
        // Eerst alle links "uit" zetten, daarna alleen de juiste link oplichten.
        navLinks.querySelectorAll('a').forEach(function (a) { a.classList.remove('active'); });
        if (current) current.link.classList.add('active');
      }, { passive: true });
    }
  }

  /* ── Mobiel menu (hamburger-knop) ── */
  var btn = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobileMenu');
  if (btn && menu) {
    // Sluit het menu en maak de pagina weer normaal scrollbaar.
    function closeMenu() {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false'); // aria-expanded: vertelt screenreaders of het menu open is
      document.body.style.overflow = '';
    }
    // Klik op de knop: menu open of dicht doen (toggle = wisselen).
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      // Menu open? Dan de achtergrond niet kunnen scrollen (overflow: hidden).
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Klik je op een link in het menu? Dan sluit het menu vanzelf.
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }

  // Wil de gebruiker minder beweging? Dan stoppen we hier (de animaties hieronder slaan we over).
  if (prefersReduced) return;

  /* ── Secties laten "infaden" zodra ze in beeld komen ── */
  // IntersectionObserver: een browser-tool die kijkt of een element zichtbaar is in het scherm.
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // Komt het element in beeld? Geef het de class 'is-in' (de CSS verzorgt de animatie).
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } // unobserve: maar 1x animeren
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }); // threshold 0.12 = reageren zodra ~12% zichtbaar is
    // Bekijk alle elementen met het attribuut data-reveal.
    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  }

  /* ── Reviews-balk: kaartjes kopiëren zodat de lus naadloos doorloopt ── */
  var track = document.querySelector('.reviews-grid');
  if (track) {
    // Maak een kopie (clone) van elk kaartje en plak die erachter; zo lijkt de rij oneindig door te lopen.
    Array.prototype.slice.call(track.children).forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true'); // aria-hidden: de kopie verbergen voor screenreaders
      track.appendChild(clone);
    });
  }
})();
