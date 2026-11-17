import CharSplit from './CharSplit.jsx';
import { useLang } from '../i18n.jsx';

// Abschnittstitel mit Zeichen-Maske — Text wird bei Sprachwechsel neu gerendert
// und useGsapScenes (deps: [lang]) baut die Trigger frisch auf.
export default function SectionTitle({ i18nKey }) {
  const { t } = useLang();
  return <h2 className="section-title"><CharSplit text={t(i18nKey)} /></h2>;
}
