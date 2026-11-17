import { useState, useEffect, useMemo } from 'react';
import SectionTitle from './SectionTitle.jsx';
import { useLang } from '../i18n.jsx';

export default function Streams() {
  const { lang, t } = useLang();
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/twitch-schedule')
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (alive && data) setSchedule(data); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const locale = lang === 'en' ? 'en-US' : 'de-DE';
  const fmtDate = d => new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(d);
  const fmtTime = d => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d);

  const { items, vacationText } = useMemo(() => {
    if (!schedule) return { items: [], vacationText: null };
    const { segments, vacation } = schedule;
    const nextId = (segments || []).find(s => !s.canceled)?.id;
    return {
      vacationText: vacation
        ? t('twitch.scheduleVacation').replace('{date}', fmtDate(new Date(vacation.end)))
        : null,
      items: (segments || []).slice(0, 8).map(s => ({
        id: s.id,
        canceled: !!s.canceled,
        isNext: s.id === nextId,
        date: fmtDate(new Date(s.start)),
        time: `${fmtTime(new Date(s.start))}–${fmtTime(new Date(s.end))}`,
        title: s.title || t('twitch.scheduleUntitled'),
        category: s.category || null
      }))
    };
  }, [schedule, lang]);

  const empty = !schedule || (!items.length && !vacationText);

  // Sektion war beim Setup versteckt → ScrollTrigger-Positionen neu messen
  useEffect(() => {
    if (!empty && typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(raf);
    }
  }, [empty]);

  return (
    <section id="streams" className="section" aria-label={t('streams.title')} hidden={empty}>
      <div className="container" id="twitch-schedule">
        <SectionTitle i18nKey="streams.title" />
        <ul className="twitch-schedule-list" id="twitch-schedule-list">
          {vacationText && <li className="twitch-schedule-vacation">{vacationText}</li>}
          {items.map(item => (
            <li key={item.id}
                className={`twitch-schedule-item${item.canceled ? ' is-canceled' : ''}${item.isNext ? ' is-next' : ''}`}>
              <span className="twitch-schedule-date">{item.date}</span>
              <span className="twitch-schedule-time">{item.time}</span>
              <span className="twitch-schedule-title">
                {item.title}
                {item.category && <> <span className="twitch-schedule-cat">{item.category}</span></>}
              </span>
              {item.canceled && <span className="twitch-schedule-badge">{t('twitch.scheduleCanceled')}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
