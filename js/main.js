document.addEventListener('DOMContentLoaded', () => {
  try {
    // Lenis smooth scroll
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    if (typeof Lenis !== 'undefined') {
      const lenis = new Lenis({
        duration: 1.1,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
      window.lenis = lenis;

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
      }
    }

    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Scroll Reveal Animation
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

    // Hero Halftone Spotlight Interaction
    const heroSection = document.getElementById('home');
    if (heroSection && window.matchMedia('(pointer: fine)').matches) {
      let isHeroHovered = false;

      heroSection.addEventListener('pointerenter', () => {
        isHeroHovered = true;
        heroSection.style.setProperty('--spotlight-opacity', '1');
      });

      heroSection.addEventListener('pointermove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        heroSection.style.setProperty('--mouse-x', `${x}px`);
        heroSection.style.setProperty('--mouse-y', `${y}px`);
        if (!isHeroHovered) {
          isHeroHovered = true;
          heroSection.style.setProperty('--spotlight-opacity', '1');
        }
      });

      heroSection.addEventListener('pointerleave', () => {
        isHeroHovered = false;
        heroSection.style.setProperty('--spotlight-opacity', '0');
      });
    }

  } catch (error) {
    console.error('Error in main.js:', error);
  }
});

