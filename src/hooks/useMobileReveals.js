import { useEffect } from 'react';

const SELECTOR = [
  '.section-title',
  '.bio-row',
  '.work-row',
  '.tour-card',
  '.twitch-schedule-list',
  '.contact-group',
  '.spotify-embed-container',
  '.soundcloud-embed-container',
  '.twitch-embed-container',
  '.about-visual',
  '.footer-wordmark'
].join(', ');

// Mobile Reveal — IntersectionObserver statt GSAP (pointer:coarse laedt kein GSAP)
export function useMobileReveals(rootRef, lang) {
  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    const els = [...rootRef.current.querySelectorAll(SELECTOR)]
      .filter(el => !el.closest('.hero'));
    els.forEach(el => el.classList.add('reveal-init'));

    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });

    els.forEach(el => io.observe(el));
    return () => {
      io.disconnect();
      els.forEach(el => el.classList.remove('reveal-init', 'revealed'));
    };
  }, [rootRef, lang]);
}
