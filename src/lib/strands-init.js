// Strands-Wiring — ersetzt den DOMContentLoaded-Block aus strands.js.
// strands.js stellt window.initStrands / ensureHeaderOrb / pauseHeaderOrb bereit.
import './strands.js';

const AMBER_PALETTE = ['#FFA24C', '#FFB13D', '#E09320', '#FFF5E6', '#FFC970', '#E09320', '#995500'];
const RISO_PALETTE = ['#FF7A47', '#FF4D00', '#D93800', '#FFF5EE', '#FFA07A', '#C93B00', '#802000'];

const getActiveTheme = () => {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};
const getThemePalette = () => (getActiveTheme() === 'light' ? RISO_PALETTE : AMBER_PALETTE);

let started = false;

export function initStrandsOrbs() {
  if (started || !window.initStrands) return;
  started = true;
  const palette = getThemePalette();

  const btn = document.getElementById('ai-chat-button');
  if (btn && !window.strandsInstance) {
    window.strandsInstance = window.initStrands(btn, {
      colors: palette,
      energy: 0.7,
      speed: 1.1,
      glass: true,
      glassSize: 1.05,
      rim: 1.2,
      refraction: 1.1,
      dispersion: 0.7,
      glow: 1.2
    });
  }

  const liveOrb = document.getElementById('twitch-live-orb');
  if (liveOrb && !window.strandsLiveInstance) {
    const liveSection = document.getElementById('live') || liveOrb;
    const liveObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        liveObserver.disconnect();
        window.strandsLiveInstance = window.initStrands(liveOrb, {
          colors: getThemePalette(),
          energy: 0.3,
          speed: 0.6,
          glass: true,
          glassSize: 1.0,
          rim: 1.0,
          refraction: 0.9,
          dispersion: 0.5,
          glow: 0.9,
          interactive: false,
          clickPulse: false
        });
        if (window.twitchIsLive === true) {
          window.strandsLiveInstance.setEnergy(0.95, 1.6);
        }
      }
    }, { rootMargin: '300px' });
    liveObserver.observe(liveSection);
  }

  const updateAllStrandsPalettes = () => {
    const pal = getThemePalette();
    window.strandsInstance?.setColors(pal);
    window.strandsHeaderInstance?.setColors(pal);
    window.strandsLiveInstance?.setColors(pal);
    window.strandsInstance?.wake();
    window.strandsHeaderInstance?.wake();
    window.strandsLiveInstance?.wake();
  };

  document.addEventListener('themechange', updateAllStrandsPalettes);
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', updateAllStrandsPalettes);
  }
}
