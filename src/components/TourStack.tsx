import type { CSSProperties } from 'react';
import SectionTitle from './SectionTitle';
import { useLang } from '../i18n';

const COUNTRIES = ['de', 'ca', 'za', 'jp', 'ru', 'pl', 'es', 'it'] as const;

export default function TourStack() {
  const { t } = useLang();
  return (
    <section id="tours" className="section" aria-label={t('tours.title')}>
      <div className="wrap">
        <SectionTitle i18nKey="tours.title" />
        <div className="country-stack" id="country-stack">
          {COUNTRIES.map((code, i) => (
            <article className="tour-card" style={{ '--card-index': i } as CSSProperties} key={code}>
              <div className="tour-card-header">
                <span className="tour-card-num">{String(i + 1).padStart(2, '0')} / {String(COUNTRIES.length).padStart(2, '0')}</span>
                <span className="tour-card-tag">TOUR ARCHIVE</span>
              </div>
              <div className="tour-card-body">
                <h3 className="tour-card-country">{t(`country.${code}`)}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
