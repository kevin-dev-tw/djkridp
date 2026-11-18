import { useState, useEffect, useRef, useCallback } from 'react';
import SectionTitle from './SectionTitle.jsx';
import { useLang } from '../i18n.jsx';

const WORK_ROWS = [
  { num: '01', h: 'work1.h', p: 'work1.p' },
  { num: '02', h: 'work2.h', p: 'work2.p' },
  { num: '03', h: 'work3.h', p: 'work3.p' },
];

const TWITCH_CHANNEL = 'djkridp';

export default function Works() {
  const { lang, t } = useLang();
  const [isLive, setIsLive] = useState(false);
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const spotifyRef = useRef(null);
  const soundcloudRef = useRef(null);
  const liveIframeRef = useRef(null);

  // Lazy-Embeds: erst bei Annäherung an den Viewport laden
  useEffect(() => {
    const iframes = [spotifyRef.current, soundcloudRef.current].filter(Boolean);
    if (!('IntersectionObserver' in window)) {
      iframes.forEach(f => { if (f.dataset.src) f.src = f.dataset.src; });
      return;
    }
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.src = entry.target.dataset.src;
          o.unobserve(entry.target);
        }
      });
    }, { rootMargin: '300px' });
    iframes.forEach(f => obs.observe(f));
    return () => obs.disconnect();
  }, []);

  // Twitch-Live-Status via DecAPI (30s Intervall)
  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const res = await fetch(`https://decapi.me/twitch/uptime/${TWITCH_CHANNEL}`);
        const text = await res.text();
        if (!alive) return;
        setIsLive(!(text.includes('offline') || text.includes('not found')));
      } catch (e) {
        if (alive) setIsLive(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

  // Orb-Energie + Player-Lazyload synchronisieren
  useEffect(() => {
    window.twitchIsLive = isLive;
    const orbEl = document.getElementById('twitch-live-orb');
    if (orbEl) orbEl.classList.toggle('is-live', isLive);
    const orb = window.strandsLiveInstance;
    if (orb) {
      if (isLive) { orb.setEnergy(0.95, 1.6); orb.pulse(); }
      else orb.setEnergy(0.3, 0.6);
    }
    if (isLive) setPlayerLoaded(true);
  }, [isLive]);

  useEffect(() => {
    if (playerLoaded && liveIframeRef.current && !liveIframeRef.current.src) {
      liveIframeRef.current.src = liveIframeRef.current.dataset.src;
    }
  }, [playerLoaded]);

  return (
    <section id="works" className="section" aria-label={t('works.title')}>
      <div className="wrap">
        <SectionTitle i18nKey="works.title" />

        <div className="works-list">
          {WORK_ROWS.map(row => (
            <div className="work-row" key={row.num}>
              <span className="work-num">{row.num}</span>
              <div className="work-text">
                <h3>{t(row.h)}</h3>
                <p>{t(row.p)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="spotify-embed-container">
          <h2>{t('sp.title')}</h2>
          <iframe ref={spotifyRef} className="lazy-embed" title="Spotify Track Player" width="100%" height="152" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" data-src="https://open.spotify.com/embed/track/2xzEE0duyUNaVJeEy7O32l?utm_source=generator&si=0773130152c94ccd" />
        </div>

        <div className="soundcloud-embed-container" id="release">
          <h2 className="soundcloud-title"><a href="https://hypeddit.com/u1shci" target="_blank" rel="noopener noreferrer" className="soundcloud-album-link">{t('sc.title')}</a></h2>
          <iframe ref={soundcloudRef} id="soundcloud-iframe" className="lazy-embed" title="SoundCloud Mind & Soul Album Player" width="100%" height="450" scrolling="no" frameBorder="no" allow="autoplay; encrypted-media" loading="lazy" data-src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A2079462015&color=%23d3c3c5&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true" />
          <div className="soundcloud-credits">
            <a href="https://soundcloud.com/wlt-records" title="We Love Trance Records" target="_blank" rel="noopener noreferrer">We Love Trance Records</a> · <a href="https://soundcloud.com/wlt-records/sets/mind-soul-417101974" title="Mind & Soul" target="_blank" rel="noopener noreferrer">Mind &amp; Soul</a>
          </div>
        </div>

        <div className="twitch-embed-container" id="live">
          <h2 className="twitch-embed-head">
            <span className="twitch-live-orb" id="twitch-live-orb" aria-hidden="true"></span>
            <span className="twitch-embed-title" dangerouslySetInnerHTML={{ __html: t('twitch.title') }}></span>
            <span className={`twitch-live-status${isLive ? ' is-live' : ''}`} id="twitch-live-status">{isLive ? t('twitch.live') : t('twitch.offline')}</span>
          </h2>

          <div id="twitch-offline-view" style={{ display: isLive ? 'none' : 'block' }}>
            <img src="images/offline.jpg"
                 alt={t('twitch.imgAlt')}
                 width="1000"
                 height="562"
                 style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
          </div>

          <div id="twitch-live-view" style={{ display: isLive ? 'flex' : 'none' }}>
            <iframe
              ref={liveIframeRef}
              title="Twitch Live Stream Player"
              style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }}
              data-src="https://player.twitch.tv/?channel=djkridp&parent=djkridp.vercel.app&parent=localhost&parent=127.0.0.1"
              width="100%"
              height="450"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy">
            </iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
