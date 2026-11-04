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
      if (typeof SplitText !== 'undefined') {
        gsap.registerPlugin(SplitText);
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
      } else {
        // GSAP 載入失敗——還原標題可見性（CSS opacity:0 是為了防進場閃現）
        const t = document.querySelector('.hero-title');
        if (t) t.style.opacity = '1';
      }
    };
    whenGsapReady();

    function initScenes() {
      if (prefersReducedMotion || typeof ScrollTrigger === 'undefined') return;

      // GSAP 接管的元素停用 CSS 動畫，避免 transform/opacity 屬性衝突
      document.querySelectorAll('.section-title, .bio-row, .country-item, .work-row, .contact-group, .contact-link')
        .forEach(el => { el.style.animation = 'none'; });

      // 0. Hero 標題字母級進場——SplitText 拆字 + mask 揭示（取代 CSS fadeInUp）
      const heroTitle = document.querySelector('.hero-title');
      if (heroTitle && typeof SplitText !== 'undefined') {
        heroTitle.style.animation = 'none';
        gsap.set(heroTitle, { opacity: 1 });
        const split = new SplitText(heroTitle, { type: 'chars', mask: 'chars' });
        gsap.set(split.chars, { yPercent: 120 });
        gsap.to(split.chars, {
          yPercent: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power3.out',
          delay: 0.25
        });
      }

      // 0.5 Hero 副標進場——接在標題字母播完後淡入
      document.querySelectorAll('.hero-subtitle').forEach(heroSub => {
        gsap.from(heroSub, {
          opacity: 0, y: 12, duration: 0.6, ease: 'power3.out', delay: 1.0
        });
      });

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

      // 3. 區塊標題——SplitText 字元級 scrub 揭示（字母隨滾動逐一升起）
      document.querySelectorAll('.section-title').forEach(title => {
        gsap.set(title, { opacity: 1 });
        if (typeof SplitText !== 'undefined') {
          const split = new SplitText(title, { type: 'chars', mask: 'chars' });
          gsap.set(split.chars, { yPercent: 120 });
          gsap.to(split.chars, {
            yPercent: 0,
            stagger: { amount: 0.4 },
            ease: 'none',
            scrollTrigger: { trigger: title, start: 'top 90%', end: 'top 50%', scrub: 1 }
          });
        } else {
          // SplitText 不可用時回退整體滑入
          gsap.set(title, { opacity: 0, xPercent: -8 });
          gsap.to(title, {
            opacity: 1, xPercent: 0, ease: 'none',
            scrollTrigger: { trigger: title, start: 'top 92%', end: 'top 55%', scrub: 1 }
          });
        }
      });

      // 4. Setlist 列表——ScrollTrigger.batch 批次揭示
      [
        '.bio-list .bio-row',
        '.country-list .country-item',
        '.works-list .work-row',
        '.contact-links .contact-group-label, .contact-links .contact-link'
      ].forEach(sel => {
        const items = gsap.utils.toArray(sel);
        if (!items.length) return;
        gsap.set(items, { opacity: 0, y: 14 });
        ScrollTrigger.batch(items, {
          start: 'top 88%',
          onEnter: batch => gsap.to(batch, {
            opacity: 1, y: 0, duration: 0.6, stagger: 0.05,
            ease: 'power3.out'
          })
        });
      });

      // 4.5 About 圖片——clip-path scrub 揭示（從下往上揭開）
      const aboutImg = document.querySelector('.about-image');
      if (aboutImg) {
        gsap.set(aboutImg, { clipPath: 'inset(100% 0% 0% 0%)' });
        gsap.to(aboutImg, {
          clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
          scrollTrigger: { trigger: aboutImg, start: 'top 92%', end: 'top 45%', scrub: 1 }
        });
      }

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
