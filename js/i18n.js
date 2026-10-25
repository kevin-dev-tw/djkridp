// DJKridP i18n — 單頁即時語言切換（DE / EN）
// 用法：HTML 元素加 data-i18n="key"（textContent）、data-i18n-html="key"（innerHTML）、
// data-i18n-attr="aria-label:key;placeholder:key2"（屬性翻譯）
(function () {
  const LANG_KEY = 'djkridp_lang';
  const SUPPORTED = ['de', 'en'];

  const I18N = {
    de: {
      'meta.title': 'DJKridP | Multi-Genre DJ from Osnabrück',
      'meta.description': 'DJKridP – Multi-Genre DJ und ehemaliges Mitglied von Future Breeze aus Osnabrück, Deutschland. Live Sets, Releases, Playlists und Tourdaten.',

      'nav.home': 'Startseite',
      'nav.about': 'Über mich',
      'nav.tours': 'Tours',
      'nav.works': 'Werke',
      'nav.contact': 'Kontakt',
      'nav.menuOpen': 'Menü öffnen',
      'nav.menuClose': 'Menü schließen',
      'nav.langLabel': 'Sprache wählen',

      'hero.subtitle': 'Multi-Genre DJ und ehemaliges Mitglied von Future Breeze aus Osnabrück (Deutschland)',

      'about.title': 'Über mich',
      'about.imgAlt': 'DJKridP Live DJ Performance an den Turntables',
      'bio1.h': 'Seit Ende der 90er Jahre aktiv',
      'bio1.p': 'Meine Karriere als DJ begann Ende der 90er Jahre und hat mich durch zahlreiche Länder geführt. Als ehemaliges Mitglied von Future Breeze habe ich Erfahrung in der elektronischen Musikszene gesammelt und setze diese bis heute fort.',
      'bio2.h': 'Ehemaliges Mitglied von Future Breeze',
      'bio2.p': 'Seit Ende der 90er Jahre spiele ich DJ-Sets in Deutschland, Kanada, Südafrika, Japan, Russland, Polen, Spanien, Italien und vielen weiteren Ländern.',
      'bio3.h': 'Internationale Erfahrung',
      'bio3.p': 'Seit Ende der 90er Jahre habe ich auf internationalen Bühnen gespielt und meine Musik in verschiedenen Ländern und Kulturen geteilt. Jede Tour war eine einzigartige Erfahrung und hat meine Musik und mein Verständnis für verschiedene Musikstile erweitert.',
      'bio4.h': 'Osnabrück, Deutschland',
      'bio4.p': 'Als Multi-Genre DJ bringe ich eine vielseitige Musikauswahl in meine Sets. Meine Erfahrung reicht von den Anfängen in den 90er Jahren bis heute, wo ich weiterhin auf internationalen Bühnen performe.',

      'tours.title': 'Tours',
      'country.de': 'Deutschland',
      'country.ca': 'Kanada',
      'country.za': 'Südafrika',
      'country.jp': 'Japan',
      'country.ru': 'Russland',
      'country.pl': 'Polen',
      'country.es': 'Spanien',
      'country.it': 'Italien',

      'works.title': 'Werke',
      'work1.h': 'Multi-Genre Sets',
      'work1.p': 'Als Multi-Genre DJ präsentiere ich verschiedene Musikstile in meinen Sets, von elektronischer Musik bis hin zu verschiedenen Genres, die die Vielfalt meiner musikalischen Erfahrung widerspiegeln.',
      'work2.h': 'Future Breeze',
      'work2.p': 'Als ehemaliges Mitglied von Future Breeze war ich Teil eines Projekts, das die elektronische Musikszene geprägt hat. Diese Erfahrung hat meine musikalische Entwicklung maßgeblich beeinflusst.',
      'work3.h': 'Live Performances',
      'work3.p': 'Meine Live-Performances umfassen DJ-Sets auf internationalen Bühnen in zahlreichen Ländern. Jede Performance ist eine einzigartige Erfahrung, die das Publikum mit verschiedenen Musikstilen verbindet.',
      'sc.title': 'Mind & Soul – Album (Klicken zum Ansehen)',
      'twitch.title': 'Live Streaming auf <a href="https://www.twitch.tv/djkridp" target="_blank" rel="noopener noreferrer" class="twitch-link">Twitch</a>',
      'twitch.imgAlt': 'DJKridP Twitch Stream Offline Vorschau',

      'contact.title': 'Kontakt',
      'contact.follow': 'Folgen',
      'contact.music': 'Musik',
      'contact.support': 'Support',
      'contact.channel': 'Kanal',
      'contact.server': 'Server',

      'chat.buttonAria': 'AI-Assistent',
      'chat.title': 'AI-Assistent',
      'chat.clear': 'Verlauf löschen',
      'chat.close': 'Schließen',
      'chat.welcome': 'Willkommen',
      'chat.ask': 'Stellen Sie mir eine Frage:',
      'chat.q1': 'Über deine DJ-Karriere',
      'chat.q1q': 'Erzähl mir über deine DJ-Karriere',
      'chat.q2': 'Was ist Future Breeze?',
      'chat.q2q': 'Was ist Future Breeze?',
      'chat.q3': 'Deine Musikstile',
      'chat.q3q': 'Welche Musikstile spielst du?',
      'chat.placeholder': 'Geben Sie Ihre Frage ein...',
      'chat.inputAria': 'Nachricht eingeben',
      'chat.send': 'Senden',
      'chat.dialogTitle': 'Verlauf löschen',
      'chat.dialogBody': 'Möchten Sie wirklich den gesamten Verlauf löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      'chat.cancel': 'Abbrechen',
      'chat.confirm': 'Löschen',
      'chat.noResponse': 'Keine Antwort erhalten. Bitte versuchen Sie es erneut.',
      'chat.noResponseShort': 'Keine Antwort erhalten.',
      'chat.apiError': 'API-Anfrage fehlgeschlagen',
      'chat.sendError': 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
    },

    en: {
      'meta.title': 'DJKridP | Multi-Genre DJ from Osnabrück',
      'meta.description': 'DJKridP – Multi-genre DJ and former member of Future Breeze from Osnabrück, Germany. Live sets, releases, playlists and tour dates.',

      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.tours': 'Tours',
      'nav.works': 'Works',
      'nav.contact': 'Contact',
      'nav.menuOpen': 'Open menu',
      'nav.menuClose': 'Close menu',
      'nav.langLabel': 'Choose language',

      'hero.subtitle': 'Multi-genre DJ and former member of Future Breeze from Osnabrück, Germany',

      'about.title': 'About',
      'about.imgAlt': 'DJKridP live DJ performance at the turntables',
      'bio1.h': 'Active since the late 90s',
      'bio1.p': 'My career as a DJ began in the late 90s and has taken me to numerous countries. As a former member of Future Breeze, I gained experience in the electronic music scene and continue to build on it to this day.',
      'bio2.h': 'Former member of Future Breeze',
      'bio2.p': 'Since the late 90s, I have played DJ sets in Germany, Canada, South Africa, Japan, Russia, Poland, Spain, Italy and many other countries.',
      'bio3.h': 'International experience',
      'bio3.p': 'Since the late 90s I have performed on international stages, sharing my music across different countries and cultures. Every tour was a unique experience that expanded my music and my understanding of different styles.',
      'bio4.h': 'Osnabrück, Germany',
      'bio4.p': 'As a multi-genre DJ, I bring a diverse selection of music to my sets. My experience ranges from the beginnings in the 90s to today, where I continue to perform on international stages.',

      'tours.title': 'Tours',
      'country.de': 'Germany',
      'country.ca': 'Canada',
      'country.za': 'South Africa',
      'country.jp': 'Japan',
      'country.ru': 'Russia',
      'country.pl': 'Poland',
      'country.es': 'Spain',
      'country.it': 'Italy',

      'works.title': 'Works',
      'work1.h': 'Multi-Genre Sets',
      'work1.p': 'As a multi-genre DJ, I present various music styles in my sets, from electronic music to different genres that reflect the diversity of my musical experience.',
      'work2.h': 'Future Breeze',
      'work2.p': 'As a former member of Future Breeze, I was part of a project that shaped the electronic music scene. This experience significantly influenced my musical development.',
      'work3.h': 'Live Performances',
      'work3.p': 'My live performances include DJ sets on international stages in numerous countries. Each performance is a unique experience that connects the audience with different music styles.',
      'sc.title': 'Mind & Soul – Album (Click to view)',
      'twitch.title': 'Live streaming on <a href="https://www.twitch.tv/djkridp" target="_blank" rel="noopener noreferrer" class="twitch-link">Twitch</a>',
      'twitch.imgAlt': 'DJKridP Twitch stream offline preview',

      'contact.title': 'Contact',
      'contact.follow': 'Follow',
      'contact.music': 'Music',
      'contact.support': 'Support',
      'contact.channel': 'Channel',
      'contact.server': 'Server',

      'chat.buttonAria': 'AI Assistant',
      'chat.title': 'AI Assistant',
      'chat.clear': 'Clear history',
      'chat.close': 'Close',
      'chat.welcome': 'Welcome',
      'chat.ask': 'Ask me a question:',
      'chat.q1': 'About your DJ career',
      'chat.q1q': 'Tell me about your DJ career',
      'chat.q2': 'What is Future Breeze?',
      'chat.q2q': 'What is Future Breeze?',
      'chat.q3': 'Your music styles',
      'chat.q3q': 'What music styles do you play?',
      'chat.placeholder': 'Type your question...',
      'chat.inputAria': 'Enter message',
      'chat.send': 'Send',
      'chat.dialogTitle': 'Clear history',
      'chat.dialogBody': 'Do you really want to delete the entire history? This action cannot be undone.',
      'chat.cancel': 'Cancel',
      'chat.confirm': 'Delete',
      'chat.noResponse': 'No response received. Please try again.',
      'chat.noResponseShort': 'No response received.',
      'chat.apiError': 'API request failed',
      'chat.sendError': 'Sorry, an error occurred. Please try again later.'
    }
  };

  function getLang() {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      return SUPPORTED.includes(stored) ? stored : 'de';
    } catch (e) {
      return 'de';
    }
  }

  function t(key) {
    const lang = getLang();
    const val = I18N[lang] && I18N[lang][key];
    if (val !== undefined) return val;
    return I18N.de[key] !== undefined ? I18N.de[key] : key;
  }

  function applyLang(lang) {
    if (!SUPPORTED.includes(lang)) lang = 'de';
    const dict = I18N[lang];

    document.documentElement.lang = lang;
    document.title = dict['meta.title'];
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', dict['meta.description']);

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const val = dict[el.dataset.i18n];
      if (val !== undefined) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const val = dict[el.dataset.i18nHtml];
      if (val !== undefined) el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.dataset.i18nAttr.split(';').forEach(pair => {
        const idx = pair.indexOf(':');
        if (idx === -1) return;
        const attr = pair.slice(0, idx).trim();
        const key = pair.slice(idx + 1).trim();
        const val = dict[key];
        if (val !== undefined) el.setAttribute(attr, val);
      });
    });

    document.querySelectorAll('.lang-select .lang-current').forEach(el => {
      el.textContent = lang.toUpperCase();
    });
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.setAttribute('aria-selected', opt.dataset.lang === lang ? 'true' : 'false');
    });

    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
    window.I18N_LANG = lang;
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));

    if (typeof ScrollTrigger !== 'undefined' && typeof ScrollTrigger.refresh === 'function') {
      ScrollTrigger.refresh();
    }
  }

  function openDropdown(dd) {
    dd.classList.add('open');
    const btn = dd.querySelector('.lang-select');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown(dd) {
    dd.classList.remove('open');
    const btn = dd.querySelector('.lang-select');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.lang-dropdown.open').forEach(closeDropdown);
  }

  document.addEventListener('click', e => {
    const opt = e.target.closest('.lang-option');
    if (opt && opt.dataset.lang) {
      applyLang(opt.dataset.lang);
      closeAllDropdowns();
      return;
    }
    const toggle = e.target.closest('.lang-select');
    if (toggle) {
      const dd = toggle.closest('.lang-dropdown');
      if (!dd) return;
      if (dd.classList.contains('open')) {
        closeDropdown(dd);
      } else {
        closeAllDropdowns();
        openDropdown(dd);
      }
      return;
    }
    closeAllDropdowns();
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const open = document.querySelectorAll('.lang-dropdown.open');
    if (!open.length) return;
    open.forEach(dd => {
      closeDropdown(dd);
      const btn = dd.querySelector('.lang-select');
      if (btn) btn.focus({ preventScroll: true });
    });
    e.stopImmediatePropagation();
  });

  document.addEventListener('DOMContentLoaded', () => {
    applyLang(getLang());
  });

  window.I18N = I18N;
  window.I18N_LANG = getLang();
  window.t = t;
})();
