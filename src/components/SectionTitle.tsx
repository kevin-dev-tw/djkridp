import CharSplit from './CharSplit';
import { useLang, type TranslationKey } from '../i18n';

// Abschnittstitel mit Zeichen-Maske — Text wird bei Sprachwechsel neu gerendert
// und useGsapScenes (deps: [lang]) baut die Trigger frisch auf.
export default function SectionTitle({ i18nKey }: { i18nKey: TranslationKey }) {
  const { t } = useLang();
  return <h2 className="section-title"><CharSplit text={t(i18nKey)} /></h2>;
}
