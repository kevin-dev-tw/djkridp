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

  } catch (error) {
    console.error('Error in main.js:', error);
  }
});

