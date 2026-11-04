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
        // 預先加上 fixed 樣式——消除首繪後才啟用 smoother 的原生滾動空窗期
        const wrapper = document.getElementById('smooth-wrapper');
        if (wrapper) wrapper.classList.add('smooth-active');
        // 延後至首繪後建立 smoother——版面已計算完畢，量測不再觸發強制重排
        requestAnimationFrame(() => requestAnimationFrame(() => {
          try {
            window.smoother = ScrollSmoother.create({
              smooth: prefersReducedMotion ? 0 : 1.1,
              effects: false,
              normalizeScroll: { allowNestedScroll: true }
            });
          } catch (err) {
            // 建立失敗回退原生滾動，避免鎖死頁面
            if (wrapper) wrapper.classList.remove('smooth-active');
          }
          initScenes();
        }));
      } else {
        initScenes();
      }

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
          }
        });
      }
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

    function initScenes() {
      if (prefersReducedMotion || typeof ScrollTrigger === 'undefined') return;

      // GSAP 接管的元素停用 CSS 動畫，避免 transform/opacity 屬性衝突
      document.querySelectorAll('.section-title, .bio-row, .country-item, .work-row, .contact-group')
        .forEach(el => { el.style.animation = 'none'; });

      // 1. Hero 離場 scrub——標題上飄淡出 + 縮放
      gsap.to('.hero-title', {
        y: -80, opacity: 0.15, scale: 0.94, ease: 'none',
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero-subtitle', {
        y: -30, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '#home', start: 'top top', end: '60% top', scrub: true }
      });

      // 2. Hero 半調網點——滾動漂移（經 CSS 變數驅動 ::before transform）
      const home = document.getElementById('home');
      if (home) {
        ScrollTrigger.create({
          trigger: '#home', start: 'top top', end: 'bottom top', scrub: true,
          onUpdate: self => home.style.setProperty('--dots-y', (self.progress * -60) + 'px')
        });
      }

      // 3. 區塊標題——橫向 scrub 滑入（與滾動同步的滑移）
      document.querySelectorAll('.section-title').forEach(title => {
        gsap.set(title, { opacity: 0, xPercent: -8 });
        gsap.to(title, {
          opacity: 1, xPercent: 0, ease: 'none',
          scrollTrigger: { trigger: title, start: 'top 92%', end: 'top 55%', scrub: 1 }
        });
      });

      // 4. Setlist 列表——ScrollTrigger.batch 批次揭示
      [
        '.bio-list .bio-row',
        '.country-list .country-item',
        '.works-list .work-row',
        '.contact-links .contact-group'
      ].forEach(sel => {
        const items = gsap.utils.toArray(sel);
        if (!items.length) return;
        gsap.set(items, { opacity: 0, y: 14 });
        ScrollTrigger.batch(items, {
          start: 'top 88%',
          onEnter: batch => gsap.to(batch, {
            opacity: 1, y: 0, duration: 0.35, stagger: 0.05,
            ease: 'cubic-bezier(0.16, 1, 0.3, 1)'
          })
        });
      });

      // 5. 媒體嵌入——視差漂移（scrub parallax）
      document.querySelectorAll('.spotify-embed-container, .soundcloud-embed-container, .twitch-embed-container')
        .forEach(el => {
          gsap.fromTo(el, { y: 50 }, {
            y: -50, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 }
          });
        });

      // 6. Header 進度髮線——滾動進度即時反應
      const header = document.querySelector('.header');
      if (header) {
        ScrollTrigger.create({
          start: 0, end: 'max',
          onUpdate: self => header.style.setProperty('--scroll-progress', self.progress)
        });
      }

    }

  } catch (error) {
    console.error('Error in main.js:', error);
  }
});
