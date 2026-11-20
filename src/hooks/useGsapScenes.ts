import { useState, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, useGSAP);

const isCoarse = () => window.matchMedia('(pointer: coarse)').matches;
const isReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ScrollSmoother — persistent, sprachunabhängig (Neuaufbau würde Scrollposition zurücksetzen)
export function useSmoother(rootRef: RefObject<HTMLElement | null>) {
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
      } catch {
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
export function useGsapScenes(rootRef: RefObject<HTMLElement | null>, lang: string, smootherReady: boolean) {
  useGSAP(() => {
    if (!smootherReady || isCoarse() || isReduced()) return;
    const root = rootRef.current;
    if (!root) return;

    // Von GSAP übernommene Elemente: CSS-Animationen aus, um transform/opacity-Konflikte zu vermeiden
    gsap.utils.toArray<HTMLElement>('.section-title, .bio-row, .tour-card, .work-row, .contact-group, .contact-link')
      .forEach(el => { el.style.animation = 'none'; });

    // 0. Hero-Titel-Entrance — Zeichen-Aufstieg mit Maske (Chars kommen aus <CharSplit/>)
    const heroTitle = root.querySelector<HTMLElement>('.hero-title');
    let heroChars: NodeListOf<Element> | never[] = [];
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
    const home = root.querySelector<HTMLElement>('#home');
    if (home) {
      ScrollTrigger.create({
        trigger: '#home', start: 'top top', end: 'bottom top', scrub: true,
        onUpdate: self => home.style.setProperty('--dots-y', (self.progress * -60) + 'px')
      });
    }

    // 3. Abschnittstitel — zeichenweise aus Maske nach oben gestaffelt
    root.querySelectorAll<HTMLElement>('.section-title').forEach(title => {
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
      const items = gsap.utils.toArray<HTMLElement>(sel);
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

    // 4.4 Tours-Karten — Fade-Reveal + GSAP-Pin-Stapelung
    // (natives sticky greift im transformierten Smooth-Wrapper nicht;
    //  ScrollTrigger pinnt unter ScrollSmoother automatisch via pinType 'transform'. Mobil: CSS-sticky)
    const tourStack = document.getElementById('country-stack');
    const tourCards = gsap.utils.toArray<HTMLElement>('#tours .tour-card');
    if (tourCards.length) {
      gsap.set(tourCards, { opacity: 0 });
      ScrollTrigger.batch(tourCards, {
        start: 'top 92%',
        onEnter: batch => gsap.to(batch, {
          opacity: 1, duration: 0.6, stagger: 0.08,
          ease: 'power3.out'
        })
      });

      if (window.smoother && tourStack) {
        // Pin-Tops aus dem CSS-sticky-Wert auslesen, dann top/position neutralisieren,
        // damit GSAP den Offset nicht zusätzlich in Layout und Pin-Position einrechnet
        const pinTops = tourCards.map((card, i) => {
          const t = parseFloat(getComputedStyle(card).top);
          return isNaN(t) ? 144 + i * 14 : t;
        });
        tourCards.forEach(card => { card.style.position = 'relative'; card.style.top = '0px'; });
        tourCards.forEach((card, i) => {
          ScrollTrigger.create({
            trigger: card,
            start: `top ${pinTops[i]}px`,
            endTrigger: tourStack,
            end: () => `bottom ${pinTops[i] + card.offsetHeight}px`,
            pin: true,
            pinSpacing: false
          });
        });
      }
    }

    // 4.5 About-Bild — Clip-Reveal durch Abschnitts-Stapel ersetzt (Konflikt mit Pinning)
    const aboutImg = root.querySelector<HTMLElement>('.about-image');
    if (aboutImg) gsap.set(aboutImg, { clipPath: 'inset(0% 0% 0% 0%)' });

    // 5. Media-Embeds — Parallax-Drift (Scrub)
    root.querySelectorAll<HTMLElement>('.spotify-embed-container, .soundcloud-embed-container, .twitch-embed-container')
      .forEach(el => {
        gsap.fromTo(el, { y: 50 }, {
          y: -50, ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
      });

    // 6. Header-Fortschrittslinie — reagiert live auf den Scroll-Fortschritt
    const header = document.querySelector<HTMLElement>('.header');
    if (header) {
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: self => header.style.setProperty('--scroll-progress', String(self.progress))
      });
    }

    const fontsP = document.fonts && document.fonts.ready
      ? document.fonts.ready.then(() => ScrollTrigger.refresh())
      : null;

    return () => {
      // position/top sind Inline-Overrides und werden vom gsap.context-Revert nicht zurückgesetzt
      tourCards.forEach(card => { card.style.position = ''; card.style.top = ''; });
    };
  }, { scope: rootRef, dependencies: [lang, smootherReady] });
}
