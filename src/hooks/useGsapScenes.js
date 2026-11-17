import { useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, useGSAP);

const isCoarse = () => window.matchMedia('(pointer: coarse)').matches;
const isReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ScrollSmoother — persistent, sprachunabhängig (Neuaufbau würde Scrollposition zurücksetzen)
export function useSmoother(rootRef) {
  const [ready, setReady] = useState(false);

  useGSAP(() => {
    if (isCoarse()) { setReady(true); return; }
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const wrapper = document.getElementById('smooth-wrapper');
    if (wrapper) wrapper.classList.add('smooth-active');
    let cancelled = false;
    const raf1 = requestAnimationFrame(() => requestAnimationFrame(() => {
      if (cancelled) return;
      try {
        window.smoother = ScrollSmoother.create({
          smooth: isReduced() ? 0 : 1.1,
          effects: false
        });
      } catch (err) {
        if (wrapper) wrapper.classList.remove('smooth-active');
      }
      setReady(true);
    }));
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf1);
    };
  }, { scope: rootRef });

  return ready;
}

// Alle Scroll-Szenen — werden bei Sprachwechsel revertiert & frisch aufgebaut,
// weil React die Titel-Texte neu rendert und die .char-Spans neu entstehen.
export function useGsapScenes(rootRef, lang, smootherReady) {
  useGSAP(() => {
    if (!smootherReady || isCoarse() || isReduced()) return;

    // Von GSAP übernommene Elemente: CSS-Animationen aus, um transform/opacity-Konflikte zu vermeiden
    gsap.utils.toArray('.section-title, .bio-row, .tour-card, .work-row, .contact-group, .contact-link')
      .forEach(el => { el.style.animation = 'none'; });

    // 0. Hero-Titel-Entrance — Zeichen-Aufstieg mit Maske (Chars kommen aus <CharSplit/>)
    const heroTitle = rootRef.current.querySelector('.hero-title');
    let heroChars = [];
    if (heroTitle) {
      heroTitle.style.animation = 'none';
      heroTitle.style.opacity = '1';
      heroChars = heroTitle.querySelectorAll('.char');
      if (heroChars.length) {
        gsap.fromTo(heroChars, { yPercent: 120 }, {
          yPercent: 0,
          duration: 0.65,
          stagger: 0.045,
          ease: 'power3.out',
          delay: 0.2
        });
      }
    }

    // 2. Hero-Halbtonpunkte — Scroll-Drift (per CSS-Variable gesteuerte ::before-Transform)
    const home = rootRef.current.querySelector('#home');
    if (home) {
      ScrollTrigger.create({
        trigger: '#home', start: 'top top', end: 'bottom top', scrub: true,
        onUpdate: self => home.style.setProperty('--dots-y', (self.progress * -60) + 'px')
      });
    }

    // 3. Abschnittstitel — zeichenweise aus Maske nach oben gestaffelt
    rootRef.current.querySelectorAll('.section-title').forEach(title => {
      title.style.opacity = '1';
      const chars = title.querySelectorAll('.char');
      if (!chars.length) return;
      gsap.set(chars, { yPercent: 120 });
      gsap.to(chars, {
        yPercent: 0,
        duration: 0.55,
        stagger: 0.035,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: title,
          start: 'top 88%',
          toggleActions: 'play none none none'
        }
      });
    });

    // 4. Setlist-Listen — ScrollTrigger.batch-Stapel-Reveal
    [
      '.bio-list .bio-row',
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

    // 4.4 Tours-Karten — Clip-Reveal + manuelles Stapeln unter ScrollSmoother
    // (natives sticky greift im transformierten Smooth-Wrapper nicht; Mobil: CSS-sticky)
    const tourStack = document.getElementById('country-stack');
    const tourCards = gsap.utils.toArray('#tours .tour-card');
    let stackMeasure = null;
    let stackFontsDone = false;
    if (tourCards.length) {
      gsap.set(tourCards, { clipPath: 'inset(100% 0% 0% 0%)' });
      ScrollTrigger.batch(tourCards, {
        start: 'top 92%',
        onEnter: batch => gsap.to(batch, {
          clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, stagger: 0.08,
          ease: 'power3.out'
        })
      });

      if (window.smoother && tourStack) {
        const smoothContent = document.getElementById('smooth-content');
        const pinTops = tourCards.map((card, i) => {
          const t = parseFloat(getComputedStyle(card).top);
          return isNaN(t) ? 144 + i * 14 : t;
        });
        tourCards.forEach(card => { card.style.position = 'static'; });
        let docTops = [], heights = [], stackDocBottom = 0;
        const measureStack = () => {
          docTops = tourCards.map(card => {
            let y = 0, el = card;
            while (el && el !== smoothContent) { y += el.offsetTop; el = el.offsetParent; }
            return y;
          });
          heights = tourCards.map(card => card.offsetHeight);
          let sy = 0, el = tourStack;
          while (el && el !== smoothContent) { sy += el.offsetTop; el = el.offsetParent; }
          stackDocBottom = sy + tourStack.offsetHeight;
        };
        const updateStack = () => {
          const sy = window.smoother.scrollTop();
          tourCards.forEach((card, i) => {
            const target = pinTops[i] - docTops[i] + sy;
            const max = stackDocBottom - heights[i] - docTops[i] + sy;
            card.style.transform = `translate3d(0, ${Math.max(0, Math.min(target, max)).toFixed(1)}px, 0)`;
          });
        };
        measureStack();
        updateStack();
        stackMeasure = () => { measureStack(); updateStack(); };
        ScrollTrigger.create({
          trigger: '#tours', start: 'top bottom', end: 'bottom top',
          onUpdate: updateStack,
          onRefresh: () => { measureStack(); updateStack(); }
        });
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(() => { if (!stackFontsDone) { stackFontsDone = true; measureStack(); updateStack(); } });
        }
      }
    }

    // 4.5 About-Bild — Clip-Reveal durch Abschnitts-Stapel ersetzt (Konflikt mit Pinning)
    const aboutImg = rootRef.current.querySelector('.about-image');
    if (aboutImg) gsap.set(aboutImg, { clipPath: 'inset(0% 0% 0% 0%)' });

    // 5. Media-Embeds — Parallax-Drift (Scrub)
    rootRef.current.querySelectorAll('.spotify-embed-container, .soundcloud-embed-container, .twitch-embed-container')
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

    // 8. Maus-Szene — Hero-Zeichen-Repulsion
    const heroEl = rootRef.current.querySelector('#home');
    let onHeroMove = null;
    if (heroEl && heroChars.length) {
      const chars = [...heroChars];
      const xTo = chars.map(c => gsap.quickTo(c, 'x', { duration: 0.3, ease: 'power3.out' }));
      const yTo = chars.map(c => gsap.quickTo(c, 'y', { duration: 0.3, ease: 'power3.out' }));
      const RADIUS = 120;
      onHeroMove = e => {
        chars.forEach((c, i) => {
          const r = c.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const dist = Math.hypot(dx, dy);
          const f = dist < RADIUS ? (RADIUS - dist) / RADIUS : 0;
          xTo[i](-dx * f * 0.4);
          yTo[i](-dy * f * 0.4);
        });
      };
      heroEl.addEventListener('mousemove', onHeroMove);
    }

    const onResize = () => { if (stackMeasure) stackMeasure(); };
    window.addEventListener('resize', onResize, { passive: true });

    const fontsP = document.fonts && document.fonts.ready
      ? document.fonts.ready.then(() => ScrollTrigger.refresh())
      : null;

    return () => {
      window.removeEventListener('resize', onResize);
      if (onHeroMove && heroEl) heroEl.removeEventListener('mousemove', onHeroMove);
    };
  }, { scope: rootRef, dependencies: [lang, smootherReady] });
}
