document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-link');
  const logo = document.querySelector('.logo');
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav');
  const header = document.querySelector('.header');
  let cachedHeaderHeight = header ? header.offsetHeight : 0;
  window.addEventListener('resize', () => {
    if (header) cachedHeaderHeight = header.offsetHeight;
  }, { passive: true });
  const navOverlay = document.querySelector('.nav-overlay');

  function smoothScrollTo(targetId) {
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      if (window.lenis) {
        window.lenis.scrollTo(targetElement, { offset: -cachedHeaderHeight });
      } else {
        window.scrollTo({
          top: Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - cachedHeaderHeight),
          behavior: 'smooth'
        });
      }
    }
  }

  function openMenu() {
    nav.classList.remove('hidden');
    nav.classList.add('active');
    if (mobileMenuToggle) {
      mobileMenuToggle.classList.add('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      mobileMenuToggle.setAttribute('aria-label', 'Menü schließen');
    }
    if (navOverlay) {
      navOverlay.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();
  }

  function closeMenu({ restoreFocus } = { restoreFocus: false }) {
    nav.classList.remove('active');
    nav.classList.add('hidden');
    if (mobileMenuToggle) {
      mobileMenuToggle.classList.remove('active');
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      mobileMenuToggle.setAttribute('aria-label', 'Menü öffnen');
      if (restoreFocus) {
        mobileMenuToggle.focus();
      }
    }
    if (navOverlay) {
      navOverlay.classList.remove('active');
    }
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
  }

  function isMobileMenuActive() {
    return nav && nav.classList.contains('active') && window.innerWidth <= 768;
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

  if (navOverlay) {
    navOverlay.addEventListener('click', () => {
      if (isMobileMenuActive()) {
        closeMenu();
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
    if (e.key === 'Escape' && isMobileMenuActive()) {
      closeMenu({ restoreFocus: true });
    }
  });
  
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && nav) {
      nav.classList.remove('active', 'hidden');
      if (navOverlay) {
        navOverlay.classList.remove('active');
      }
      if (mobileMenuToggle) {
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-label', 'Menü öffnen');
      }
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    }
  });

  // Hash-basiertes Scrollen nur für manuelle Navigation, nicht für Reload
  // Browser-Standardverhalten für Scroll-Restoration beibehalten

});
