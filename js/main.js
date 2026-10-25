document.addEventListener('DOMContentLoaded', () => {
  try {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Register GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      gsap.ticker.lagSmoothing(0);

      if (typeof ScrollSmoother !== 'undefined') {
        if (typeof ScrollToPlugin !== 'undefined') {
          gsap.registerPlugin(ScrollToPlugin);
        }
        window.smoother = ScrollSmoother.create({
          smooth: prefersReducedMotion ? 0 : 1.1,
          effects: false,
          normalizeScroll: { allowNestedScroll: true }
        });
      }
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      });
    }

    // GSAP Preset 3: Setlist Staggered Reveal (齒輪滾輪瀑布揭示)
    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
      // 延後一影格待首屏繪製完成後再註冊 ScrollTrigger，避免初始化阻塞首屏算繪
      requestAnimationFrame(() => {
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

        // Werke 嵌入媒體區塊 (SoundCloud 專輯 & Twitch 實況)
        const mediaContainers = document.querySelectorAll('.soundcloud-embed-container, .twitch-embed-container');
        mediaContainers.forEach(container => {
          gsap.from(container, {
            scrollTrigger: {
              trigger: container,
              start: 'top 85%',
              toggleActions: 'play none none none'
            },
            y: 12,
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out'
          });
        });
      });
    }

  } catch (error) {
    console.error('Error in main.js:', error);
  }
});

