document.addEventListener('DOMContentLoaded', () => {
  try {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // 行動端不載入 GSAP——原生滾動 + CSS 動畫，省下下載/解析/執行
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarsePointer) return;

    const initGsap = () => {
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        gsap.ticker.lagSmoothing(0);
      }
      if (typeof ScrollToPlugin !== 'undefined') {
        gsap.registerPlugin(ScrollToPlugin);
      }
      if (typeof ScrollSmoother !== 'undefined') {
        // 延後至首繪後建立 smoother——版面已計算完畢，量測不再觸發強制重排
        requestAnimationFrame(() => requestAnimationFrame(() => {
          window.smoother = ScrollSmoother.create({
            smooth: prefersReducedMotion ? 0 : 1.1,
            effects: false,
            normalizeScroll: { allowNestedScroll: true }
          });
        }));
      }

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        });
      }

      initReveals();
    };

    // GSAP 由條件載入器注入，可能比 DCL 晚到——短輪詢等待（同源檔案通常即時）
    let attempts = 0;
    const whenGsapReady = () => {
      if (typeof gsap !== 'undefined') {
        initGsap();
      } else if (++attempts < 80) {
        setTimeout(whenGsapReady, 50);
      }
    };
    whenGsapReady();

    function initReveals() {
    // Setlist 進場揭示：IntersectionObserver 驅動 gsap.from（不建 ScrollTrigger，避免量測重排）
    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
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
    }

  } catch (error) {
    console.error('Error in main.js:', error);
  }
});

