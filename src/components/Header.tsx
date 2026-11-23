import { useState, useEffect, useRef, useCallback, createElement, type MouseEvent as ReactMouseEvent } from 'react';
import { useLang, type Lang, type TranslationKey } from '../i18n';

type Theme = 'dark' | 'light';

const NAV_ITEMS: { id: string; key: TranslationKey }[] = [
  { id: 'home', key: 'nav.home' },
  { id: 'about', key: 'nav.about' },
  { id: 'tours', key: 'nav.tours' },
  { id: 'streams', key: 'nav.streams' },
  { id: 'works', key: 'nav.works' },
  { id: 'contact', key: 'nav.contact' },
];

const THEME_KEY = 'djkridp_theme';

function getCurrentTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme');
  if (attr === 'light' || attr === 'dark') return attr;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export default function Header() {
  const { lang, t, setLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [navTop, setNavTop] = useState<number | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const headerBottom = useRef(0);

  // sibling-index() Fallback: stagger-Index per JS setzen
  useEffect(() => {
    if (!CSS.supports('transition-delay: calc(sibling-index() * 0.05s)')) {
      document.querySelectorAll<HTMLElement>('.nav-list > li').forEach((el, i) =>
        el.style.setProperty('--sibling-index', String(i + 1)));
    }
  }, []);

  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        headerBottom.current = headerRef.current.getBoundingClientRect().bottom;
        setNavTop(headerBottom.current);
      }
    };
    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  }, []);

  const smoothScrollTo = useCallback((targetId: string) => {
    const el = document.querySelector(targetId);
    if (!el) return;
    if (window.smoother) {
      window.smoother.scrollTo(el, true, `top ${headerBottom.current}px`);
    } else {
      window.scrollTo({
        top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerBottom.current),
        behavior: 'smooth'
      });
    }
  }, []);

  const openMenu = () => {
    setMenuOpen(true);
    const first = headerRef.current?.querySelector<HTMLElement>('.nav-link');
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 0);
  };
  const closeMenu = (restoreFocus = false) => {
    setMenuOpen(false);
    if (restoreFocus) headerRef.current?.querySelector<HTMLElement>('.mobile-menu-toggle')?.focus();
  };

  // Klick ausserhalb schliesst Menü und Sprach-Dropdown
  useEffect(() => {
    const onDocClick = (e: Event) => {
      const target = e.target as Element | null;
      if (menuOpen && headerRef.current && target && !headerRef.current.contains(target)) closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) closeMenu(true);
      if (e.key === 'Tab' && menuOpen && headerRef.current) {
        const focusables = [headerRef.current.querySelector<HTMLElement>('.mobile-menu-toggle'),
          ...headerRef.current.querySelectorAll<HTMLElement>('.nav-link')].filter((el): el is HTMLElement => !!el);
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [menuOpen]);

  // Menü-Zustand am Root markieren (AI-Button unter dem Panel ausblenden)
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', menuOpen);
    return () => document.documentElement.classList.remove('menu-open');
  }, [menuOpen]);

  // Desktop-Resize schliesst Mobilmenü
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Sky-Toggle: checked = Nacht/Dark, unchecked = Tag/Light
  const [theme, setThemeState] = useState(getCurrentTheme);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onScheme = (e: MediaQueryListEvent) => {
      let saved = null;
      try { saved = localStorage.getItem(THEME_KEY); } catch {}
      if (!saved) setThemeState(e.matches ? 'light' : 'dark');
    };
    mq.addEventListener('change', onScheme);
    return () => mq.removeEventListener('change', onScheme);
  }, []);

  const applyTheme = (next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
  };

  const onNavClick = (e: ReactMouseEvent, id: string) => {
    e.preventDefault();
    if (menuOpen) closeMenu();
    smoothScrollTo('#' + id);
  };

  const renderSkyToggle = (suffix: string) => (
    <label className="sky-toggle" id={`theme-toggle-label-${suffix}`} htmlFor={`theme-toggle-checkbox-${suffix}`}
           aria-label={t('theme.toggle')}
           title={theme === 'light' ? t('theme.modeLight') : t('theme.modeDark')}>
      <input type="checkbox" id={`theme-toggle-checkbox-${suffix}`} className="sky-toggle__checkbox"
             checked={theme === 'dark'}
             onChange={e => applyTheme(e.target.checked ? 'dark' : 'light')} />
      <div className="sky-toggle__container">
        <div className="sky-toggle__clouds"></div>
        <div className="sky-toggle__stars-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z" fill="currentColor" />
          </svg>
        </div>
        <div className="sky-toggle__circle-container">
          <div className="sky-toggle__sun-moon-container">
            <div className="sky-toggle__moon">
              <div className="sky-toggle__spot"></div>
              <div className="sky-toggle__spot"></div>
              <div className="sky-toggle__spot"></div>
            </div>
          </div>
        </div>
      </div>
    </label>
  );

  return (
    <header className="header" ref={headerRef}>
      <div className="header-content">
        <button className="logo" onClick={() => { if (menuOpen) closeMenu(); smoothScrollTo('#home'); }}>DJKridP</button>
        <button className={`mobile-menu-toggle${menuOpen ? ' active' : ''}`} type="button"
                aria-label={menuOpen ? t('nav.menuClose') : t('nav.menuOpen')}
                aria-expanded={menuOpen} aria-controls="site-nav"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); menuOpen ? closeMenu() : openMenu(); }}>
          <span className="menu-icon" aria-hidden="true">
            <span className="menu-line" />
            <span className="menu-line" />
            <span className="menu-line" />
          </span>
        </button>
        <nav className={`nav${menuOpen ? ' active' : ''}`} id="site-nav"
             style={navTop != null ? { top: navTop } : undefined}>
          <ul className="nav-list">
            {NAV_ITEMS.map(item => (
              <li key={item.id}>
                <a href={'#' + item.id} className="nav-link" aria-label={t(item.key)}
                   onClick={e => onNavClick(e, item.id)}>
                  <span>{t(item.key)}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-controls">
            {renderSkyToggle('nav')}
            <div className={`nav-lang lang-${lang}`} role="group" aria-label={t('nav.langLabel')}>
              <span className="nav-lang-indicator" aria-hidden="true" />
              <button className={`nav-lang-btn${lang === 'de' ? ' active' : ''}`} type="button"
                      onClick={() => setLang('de')}>DE</button>
              <button className={`nav-lang-btn${lang === 'en' ? ' active' : ''}`} type="button"
                      onClick={() => setLang('en')}>EN</button>
            </div>
          </div>
        </nav>
        <div className="header-actions">
          {renderSkyToggle('header')}
          <div className="lang-switch lang-switch-header">
            <label className="sr-only" htmlFor="lang-select">{t('nav.langLabel')}</label>
            <select id="lang-select" name="lang" className="lang-select" value={lang}
                    onChange={e => setLang(e.target.value as Lang)}>
              <button className="lang-select-button">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.9,22l4.55-12h2.1L23.1,22H21l-1.07-3.05H15.08L14,22H11.9ZM4,19L2.6,17.6l5.05-5.05q-0.88-0.88-1.59-2T4.75,8h2.1q0.5,0.97 1,1.7t1.2,1.45q0.82-0.82 1.71-2.31T12.1,6H1V4H8V2h2V4h7V6H14.1q-0.53,1.8-1.58,3.7t-2.07,2.9l2.4,2.45L12.1,17.1L9.05,13.98L4,19Zm11.7-1.8h3.6l-1.8-5.1l-1.8,5.1Z" />
                </svg>
                {createElement('selectedcontent')}
              </button>
              <option value="de">DE</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
