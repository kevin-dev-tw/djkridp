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

      const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      if (typeof ScrollSmoother !== 'undefined' && !isCoarsePointer) {
        if (typeof ScrollToPlugin !== 'undefined') {
          gsap.registerPlugin(ScrollToPlugin);
        }
        // 延後至首繪後建立 smoother——版面已計算完畢，量測不再觸發強制重排
        requestAnimationFrame(() => requestAnimationFrame(() => {
          window.smoother = ScrollSmoother.create({
            smooth: prefersReducedMotion ? 0 : 1.1,
            effects: false,
            normalizeScroll: { allowNestedScroll: true }
          });
        }));
      }
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      });
    }

    // Setlist 進場揭示：IntersectionObserver 驅動 gsap.from（不建 ScrollTrigger，避免量測重排）
    if (!prefersReducedMotion && typeof gsap !== 'undefined' && 'IntersectionObserver' in window) {
      requestAnimationFrame(() => {
        const revealConfigs = new Map();

        document.querySelectorAll('.section-title').forEach(title => {
          revealConfigs.set(title, {
            targets: title,
            vars: { y: 12, opacity: 0, duration: 0.35, ease: 'power2.out' }
          });
        });

        // 列表容器 (Setlists: Bio, Tours, Works, Contact) 高阻尼齒輪咬合進場
        [
          { trigger: '.bio-list', items: '.bio-row' },
          { trigger: '.country-list', items: '.country-item' },
          { trigger: '.works-list', items: '.work-row' },
          { trigger: '.contact-links', items: '.contact-group' }
        ].forEach(conf => {
          const el = document.querySelector(conf.trigger);
          const items = el ? el.querySelectorAll(conf.items) : [];
          if (el && items.length > 0) {
            revealConfigs.set(el, {
              targets: items,
              vars: { y: 10, opacity: 0, duration: 0.35, stagger: 0.05, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' }
            });
          }
        });

        // Werke 嵌入媒體區塊 (Spotify / SoundCloud / Twitch)
        document.querySelectorAll('.spotify-embed-container, .soundcloud-embed-container, .twitch-embed-container').forEach(container => {
          revealConfigs.set(container, {
            targets: container,
            vars: { y: 12, opacity: 0, duration: 0.4, ease: 'power2.out' }
          });
        });

        // rootMargin -13% ≈ ScrollTrigger start 'top 87%'
        const io = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            io.unobserve(entry.target);
            const conf = revealConfigs.get(entry.target);
            if (conf) gsap.from(conf.targets, conf.vars);
          });
        }, { rootMargin: '0px 0px -13% 0px', threshold: 0 });

        revealConfigs.forEach((_, el) => io.observe(el));
      });
    }

  } catch (error) {
    console.error('Error in main.js:', error);
  }
});

