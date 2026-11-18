import SectionTitle from './SectionTitle.jsx';
import { useLang } from '../i18n.jsx';

const BIO_ROWS = [
  { era: '01', h: 'bio1.h', p: 'bio1.p' },
  { era: '02', h: 'bio2.h', p: 'bio2.p' },
  { era: '03', h: 'bio3.h', p: 'bio3.p' },
  { era: '04', h: 'bio4.h', p: 'bio4.p' },
];

export default function About() {
  const { t } = useLang();
  return (
    <section id="about" className="section" aria-label={t('about.title')}>
      <div className="wrap">
        <SectionTitle i18nKey="about.title" />
        <div className="about-layout">
          <div className="bio-list">
            {BIO_ROWS.map(row => (
              <div className="bio-row" key={row.era}>
                <span className="bio-era">{row.era}</span>
                <div className="bio-text">
                  <h3>{t(row.h)}</h3>
                  <p>{t(row.p)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="about-visual">
            <img src="images/Foto_539.jpg"
                 alt={t('about.imgAlt')}
                 className="about-image"
                 width="400"
                 height="460"
                 loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}
