import { useRef, useState, useEffect } from 'react';
import { useLang } from './i18n';
import { useSmoother, useGsapScenes } from './hooks/useGsapScenes';
import { useMobileReveals } from './hooks/useMobileReveals';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import TourStack from './components/TourStack';
import Streams from './components/Streams';
import Works from './components/Works';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AiChat from './components/AiChat';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { lang } = useLang();
  const smootherReady = useSmoother(rootRef);
  useGsapScenes(rootRef, lang, smootherReady);
  useMobileReveals(rootRef, lang);

  // Bilder: Rechtsklick & Drag deaktivieren
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    const imgs = document.querySelectorAll('img');
    imgs.forEach(img => {
      img.addEventListener('contextmenu', prevent);
      img.addEventListener('dragstart', prevent);
    });
    return () => imgs.forEach(img => {
      img.removeEventListener('contextmenu', prevent);
      img.removeEventListener('dragstart', prevent);
    });
  }, []);

  // WebGL-Orbs auf allen Geraeten (Sichtbarkeits-Gating in strands.js);
  // Glow-Cursor bleibt Desktop pointer:fine (Mauseffekt)
  useEffect(() => {
    const isFine = window.matchMedia('(pointer: fine)').matches;
    let cancelled = false;

    const start = async () => {
      const { initStrandsOrbs } = await import('./lib/strands-init.js');
      if (!cancelled) initStrandsOrbs();
      if (!isFine) return;
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => { if (!cancelled) import('./lib/glow-cursor.js'); }, { timeout: 1500 });
      } else {
        setTimeout(() => { if (!cancelled) import('./lib/glow-cursor.js'); }, 300);
      }
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(start, { timeout: 1200 });
    } else {
      setTimeout(start, 250);
    }
    return () => { cancelled = true; };
  }, []);

  return (
    <div ref={rootRef}>
      <Header />
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main id="main-content">
            <Hero />
            <About />
            <TourStack />
            <Streams />
            <Works />
            <Contact />
          </main>
          <Footer />
        </div>
      </div>
      <AiChat />
      <Analytics />
    </div>
  );
}
