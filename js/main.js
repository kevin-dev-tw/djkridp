document.addEventListener('DOMContentLoaded', () => {
  try {
    // Lenis smooth scroll
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Register GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (typeof Lenis !== 'undefined') {
      const lenis = new Lenis({
        duration: 1.1,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
      window.lenis = lenis;

      // GSAP 官方整合架構：由 gsap.ticker 統一驅動 Lenis 影格時脈
      if (typeof gsap !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });
        // 關閉 lagSmoothing 避免滾動中發生影格補償跳動
        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    }

    // GSAP Preset 3: Setlist Staggered Reveal (齒輪滾輪瀑布揭示)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      // 標題單獨輕快揭示
      document.querySelectorAll('.section-title').forEach(title => {
        gsap.from(title, {
          scrollTrigger: {
            trigger: title,
            start: 'top 88%',
            toggleActions: 'play none none none'
          },
          y: 12,
          opacity: 0,
          duration: 0.35,
          ease: 'power2.out'
        });
      });

      // 列表容器 (Setlists: Bio, Tours, Works, Contact) 高阻尼齒輪咬合進場
      const setlistConfigs = [
        { trigger: '.bio-list', items: '.bio-row' },
        { trigger: '.country-list', items: '.country-item' },
        { trigger: '.works-list', items: '.work-row' },
        { trigger: '.contact-links', items: '.contact-group' }
      ];

      setlistConfigs.forEach(conf => {
        const triggerEl = document.querySelector(conf.trigger);
        if (triggerEl) {
          const items = triggerEl.querySelectorAll(conf.items);
          if (items.length > 0) {
            gsap.from(items, {
              scrollTrigger: {
                trigger: triggerEl,
                start: 'top 85%',
                toggleActions: 'play none none none'
              },
              y: 10,
              opacity: 0,
              duration: 0.35,
              stagger: 0.05,
              ease: 'cubic-bezier(0.16, 1, 0.3, 1)'
            });
          }
        }
      });

      // Werke 嵌入播放器雙欄 (Listen Grid) 與 Twitch 全寬區塊
      const listenGrid = document.querySelector('.listen-grid');
      if (listenGrid) {
        gsap.from(listenGrid.children, {
          scrollTrigger: {
            trigger: listenGrid,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 12,
          opacity: 0,
          duration: 0.4,
          stagger: 0.08,
          ease: 'power2.out'
        });
      }

      const twitchContainer = document.querySelector('.spotify-embed-container.embed-full');
      if (twitchContainer) {
        gsap.from(twitchContainer, {
          scrollTrigger: {
            trigger: twitchContainer,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 12,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    }

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

