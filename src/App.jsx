import { useRef, useState, useEffect } from 'react';
import { useLang } from './i18n.jsx';
import { useSmoother, useGsapScenes } from './hooks/useGsapScenes.js';
import { useMobileReveals } from './hooks/useMobileReveals.js';
import TwitchBanner from './components/TwitchBanner.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import TourStack from './components/TourStack.jsx';
import Streams from './components/Streams.jsx';
import Works from './components/Works.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import AiChat from './components/AiChat.jsx';

export default function App() {
  const rootRef = useRef(null);
  const { lang } = useLang();
  const smootherReady = useSmoother(rootRef);
  useGsapScenes(rootRef, lang, smootherReady);
  useMobileReveals(rootRef, lang);

  // Bilder: Rechtsklick & Drag deaktivieren
  useEffect(() => {
    const prevent = e => e.preventDefault();
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

  // WebGL-Orbs & Glow-Cursor nur auf Desktop pointer:fine, verzögert per Idle
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    let cancelled = false;

    const start = async () => {
      const { initStrandsOrbs } = await import('./lib/strands-init.js');
      if (!cancelled) initStrandsOrbs();
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
      <TwitchBanner />
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
    </div>
  );
}
