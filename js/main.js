document.addEventListener('DOMContentLoaded', () => {
  try {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Kein GSAP auf Mobilgeräten — natives Scrollen + CSS-Animationen spart Download/Parsing/Ausführung
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
        // fixed-Stil vorab setzen — verhindert das Native-Scroll-Fenster bis zur Smoother-Aktivierung
        const wrapper = document.getElementById('smooth-wrapper');
        if (wrapper) wrapper.classList.add('smooth-active');
        // Smoother erst nach dem ersten Paint erstellen — Layout fertig, Messung löst keinen Reflow aus
        requestAnimationFrame(() => requestAnimationFrame(() => {
          try {
            window.smoother = ScrollSmoother.create({
              smooth: prefersReducedMotion ? 0 : 1.1,
              effects: false,
              normalizeScroll: { allowNestedScroll: true }
            });
          } catch (err) {
            // Bei Fehlschlag auf natives Scrollen zurückfallen, damit die Seite nicht blockiert
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

    // GSAP wird vom bedingten Loader injiziert und kann nach DCL eintreffen — kurzes Polling (same-origin meist sofort)
    // Fünf Dateien laufen der Reihe nach, SplitText zuletzt — erst dann ist alles bereit, kein Fallback-Race
    let attempts = 0;
    const whenGsapReady = () => {
      if (typeof gsap !== 'undefined' && typeof SplitText !== 'undefined') {
        initGsap();
      } else if (++attempts < 80) {
        setTimeout(whenGsapReady, 50);
      } else if (typeof gsap !== 'undefined') {
        // Teil-Plugins per Timeout nicht geladen — degradiert initialisieren (SplitText-Szenen nutzen Fallback)
        initGsap();
      } else {
        // GSAP-Ladefehler — Titel-Sichtbarkeit wiederherstellen (CSS opacity:0 ist Anti-Flash)
        const t = document.querySelector('.hero-title');
        if (t) t.style.opacity = '1';
      }
    };
    whenGsapReady();

    function initScenes() {
      if (prefersReducedMotion || typeof ScrollTrigger === 'undefined') return;

      // Von GSAP übernommene Elemente: CSS-Animationen aus, um transform/opacity-Konflikte zu vermeiden
      document.querySelectorAll('.section-title, .bio-row, .country-item, .work-row, .contact-group, .contact-link')
        .forEach(el => { el.style.animation = 'none'; });

      // 0. Hero-Titel-Zeichen-Entrance — SplitText + Mask-Reveal (ersetzt CSS fadeInUp)
      const heroTitle = document.querySelector('.hero-title');
      if (heroTitle && typeof SplitText !== 'undefined') {
        heroTitle.style.animation = 'none';
        gsap.set(heroTitle, { opacity: 1 });
        const split = new SplitText(heroTitle, { type: 'chars', mask: 'chars' });
        heroTitle._splitChars = split.chars;
        gsap.set(split.chars, { yPercent: 120 });
        gsap.to(split.chars, {
          yPercent: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power3.out',
          delay: 0.25
        });
      }

      // 1. Hero-Exit-Scrub — Titel driftet nach oben, blendet aus + skaliert
      gsap.to('.hero-title', {
        y: -80, opacity: 0.15, scale: 0.94, ease: 'none',
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero-subtitle', {
        y: -30, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '#home', start: 'top top', end: '60% top', scrub: true }
      });

      // 2. Hero-Halbtonpunkte — Scroll-Drift (per CSS-Variable gesteuerte ::before-Transform)
      const home = document.getElementById('home');
      if (home) {
        ScrollTrigger.create({
          trigger: '#home', start: 'top top', end: 'bottom top', scrub: true,
          onUpdate: self => home.style.setProperty('--dots-y', (self.progress * -60) + 'px')
        });
      }

      // 3. Abschnittstitel — SplitText-Scrub-Reveal zeichenweise (Buchstaben steigen beim Scrollen)
      const sectionTitleTweens = new Map();
      function initSectionTitleScenes() {
        document.querySelectorAll('.section-title').forEach(title => {
          const prev = sectionTitleTweens.get(title);
          if (prev) {
            if (prev.scrollTrigger) prev.scrollTrigger.kill();
            prev.kill();
            sectionTitleTweens.delete(title);
          }
          gsap.set(title, { opacity: 1 });
          if (typeof SplitText !== 'undefined') {
            const split = new SplitText(title, { type: 'chars', mask: 'chars' });
            gsap.set(split.chars, { yPercent: 120 });
            const tween = gsap.to(split.chars, {
              yPercent: 0,
              stagger: { amount: 0.4 },
              ease: 'none',
              scrollTrigger: { trigger: title, start: 'top 90%', end: 'top 50%', scrub: 1 }
            });
            sectionTitleTweens.set(title, tween);
          } else {
            // Fallback bei fehlendem SplitText: Ganztitel-Einschieben
            gsap.set(title, { opacity: 0, xPercent: -8 });
            const tween = gsap.to(title, {
              opacity: 1, xPercent: 0, ease: 'none',
              scrollTrigger: { trigger: title, start: 'top 92%', end: 'top 55%', scrub: 1 }
            });
            sectionTitleTweens.set(title, tween);
          }
        });
      }
      initSectionTitleScenes();
      // Sprachwechsel überschreibt Titel per textContent und zerstört SplitText-Knoten — neu splitten + Fortschritt refreshen
      document.addEventListener('langchange', () => {
        initSectionTitleScenes();
        ScrollTrigger.refresh();
      });

      // 4. Setlist-Listen — ScrollTrigger.batch-Stapel-Reveal
      [
        '.bio-list .bio-row',
        '.country-list .country-item',
        '.works-list .work-row',
        '.contact-links .contact-group-label, .contact-links .contact-link:not(.disabled)'
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

      // 4.5 About-Bild — clip-path-Scrub-Reveal (von unten nach oben aufgedeckt)
      const aboutImg = document.querySelector('.about-image');
      if (aboutImg) {
        gsap.set(aboutImg, { clipPath: 'inset(100% 0% 0% 0%)' });
        gsap.to(aboutImg, {
          clipPath: 'inset(0% 0% 0% 0%)', ease: 'none',
          scrollTrigger: { trigger: aboutImg, start: 'top 92%', end: 'top 45%', scrub: 1 }
        });
      }

      // 5. Media-Embeds — Parallax-Drift (Scrub)
      document.querySelectorAll('.spotify-embed-container, .soundcloud-embed-container, .twitch-embed-container')
        .forEach(el => {
          gsap.fromTo(el, { y: 50 }, {
            y: -50, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 }
          });
        });

      // 6. Header-Fortschrittslinie — reagiert live auf den Scroll-Fortschritt
      const header = document.querySelector('.header');
      if (header) {
        ScrollTrigger.create({
          start: 0, end: 'max',
          onUpdate: self => header.style.setProperty('--scroll-progress', self.progress)
        });
      }

      // 7. Maus-Szenen — Hero-Zeichen-Repulsion + Nav-Link-Magnetismus
      const heroEl = document.getElementById('home');
      const heroTitleEl = document.querySelector('.hero-title');
      if (heroEl && heroTitleEl && heroTitleEl._splitChars && heroTitleEl._splitChars.length) {
        const chars = heroTitleEl._splitChars;
        const xTo = [...chars].map(c => gsap.quickTo(c, 'x', { duration: 0.3, ease: 'power3.out' }));
        const yTo = [...chars].map(c => gsap.quickTo(c, 'y', { duration: 0.3, ease: 'power3.out' }));
        const RADIUS = 120;
        heroEl.addEventListener('mousemove', e => {
          chars.forEach((c, i) => {
            const r = c.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const dist = Math.hypot(dx, dy);
            const f = dist < RADIUS ? (RADIUS - dist) / RADIUS : 0;
            xTo[i](-dx * f * 0.4);
            yTo[i](-dy * f * 0.4);
          });
        });
      }

    }

  } catch (error) {
    console.error('Error in main.js:', error);
  }
});
