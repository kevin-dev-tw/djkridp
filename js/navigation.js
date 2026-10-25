document.addEventListener('DOMContentLoaded', () => {
  const tr = (key, fallback) => (typeof window.t === 'function' ? window.t(key) : fallback);
  const navLinks = document.querySelectorAll('.nav-link');
  const logo = document.querySelector('.logo');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav');
  const header = document.querySelector('.header');

  document.body.style.overflow = '';

  let cachedHeaderHeight = header ? header.offsetHeight : 0;
  window.addEventListener('resize', () => {
    if (header) cachedHeaderHeight = header.offsetHeight;
  }, { passive: true });

  function smoothScrollTo(targetId) {
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      if (window.smoother) {
        window.smoother.scrollTo(targetElement, true, `top ${cachedHeaderHeight}px`);
      } else {
        window.scrollTo({
          top: Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - cachedHeaderHeight),
          behavior: 'smooth'
        });
      }
    }
  }

  function openMenu() {
    nav.classList.add('active');
    if (mobileMenuToggle) {
      mobileMenuToggle.classList.add('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      mobileMenuToggle.setAttribute('aria-label', tr('nav.menuClose', 'Menü schließen'));
    }
    document.body.style.overflow = 'hidden';
    if (window.smoother) window.smoother.paused(true);
    const firstLink = nav.querySelector('.nav-link');
    if (firstLink) firstLink.focus({ preventScroll: true });
  }

  function closeMenu({ restoreFocus } = { restoreFocus: false }) {
    nav.classList.remove('active');
    if (mobileMenuToggle) {
      mobileMenuToggle.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      mobileMenuToggle.setAttribute('aria-label', tr('nav.menuOpen', 'Menü öffnen'));
      if (restoreFocus) {
        mobileMenuToggle.focus();
      }
    }
    document.body.style.overflow = '';
    if (window.smoother) window.smoother.paused(false);
  }

  function isMobileMenuActive() {
    return nav && nav.classList.contains('active');
  }

  // Logo-Klick behandeln
  if (logo) {
    logo.addEventListener('click', () => {
      const target = logo.getAttribute('data-target');
      if (target) {
        if (isMobileMenuActive()) {
          closeMenu();
        }
        smoothScrollTo(`#${target}`);
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        if (isMobileMenuActive()) {
          closeMenu();
        }
        smoothScrollTo(href);
      }
    });
  });

  if (mobileMenuToggle && nav) {
    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const isActive = isMobileMenuActive();
      if (isActive) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  document.addEventListener('click', (event) => {
    if (!isMobileMenuActive()) return;
    const clickInsideNav = nav.contains(event.target);
    const clickToggle = mobileMenuToggle && mobileMenuToggle.contains(event.target);
    const clickHeader = header && header.contains(event.target);
    if (!clickInsideNav && !clickToggle && !clickHeader) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!isMobileMenuActive()) return;
    if (e.key === 'Escape') {
      closeMenu({ restoreFocus: true });
      return;
    }
    if (e.key === 'Tab') {
      const focusables = [mobileMenuToggle, ...nav.querySelectorAll('.nav-link')].filter(Boolean);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && nav) {
      nav.classList.remove('active');
      if (mobileMenuToggle) {
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-label', tr('nav.menuOpen', 'Menü öffnen'));
      }
      document.body.style.overflow = '';
      if (window.smoother) window.smoother.paused(false);
    }
  });

  document.addEventListener('langchange', () => {
    if (!mobileMenuToggle) return;
    const expanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    mobileMenuToggle.setAttribute('aria-label', tr(expanded ? 'nav.menuClose' : 'nav.menuOpen', 'Menü öffnen'));
  });

  // Hash-basiertes Scrollen nur für manuelle Navigation, nicht für Reload
  // Browser-Standardverhalten für Scroll-Restoration beibehalten

});
