import CharSplit from './CharSplit.jsx';
import { useLang } from '../i18n.jsx';

export default function Hero() {
  const { t } = useLang();
  return (
    <section id="home" className="hero">
      <div className="wrap">
        <h1 className="hero-title"><CharSplit text="DJKridP" /></h1>
        <p className="hero-subtitle">{t('hero.subtitle')}</p>
      </div>
    </section>
  );
}
