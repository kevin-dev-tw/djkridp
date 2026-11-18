import CharSplit from './CharSplit';
import { useLang } from '../i18n';

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
