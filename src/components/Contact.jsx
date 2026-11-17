import SectionTitle from './SectionTitle.jsx';
import { useLang } from '../i18n.jsx';

const GROUPS = [
  {
    label: 'contact.follow',
    links: [
      { name: 'Twitch', handle: 'djkridp', href: 'https://www.twitch.tv/djkridp', platform: 'twitch' },
      { name: 'Instagram', handle: 'dj_krid_p', href: 'https://www.instagram.com/dj_krid_p', platform: 'instagram' },
      { name: 'TikTok', handle: '@krid_p', href: 'https://www.tiktok.com/@krid_p', platform: 'tiktok', disabled: true },
      { name: 'Facebook', handle: 'djkridp', href: 'https://www.facebook.com/djkridp/', platform: 'facebook', disabled: true },
      { name: 'WhatsApp', handleKey: 'contact.channel', href: 'https://www.whatsapp.com/channel/0029Vb6FeSm9hXF7H6qEIk3k', platform: 'whatsapp' },
      { name: 'Discord', handleKey: 'contact.server', href: 'https://discord.gg/3xmER2Gc3B', platform: 'discord' },
    ]
  },
  {
    label: 'contact.music',
    links: [
      { name: 'Spotify', handle: 'Krid P', href: 'https://open.spotify.com/artist/22Mjn2JlrMAPgUEqozf4Re', platform: 'spotify-artist' },
      { name: 'Apple Music', handle: 'Krid P', href: 'https://music.apple.com/tw/artist/krid-p/66265843', platform: 'apple-music' },
      { name: 'YouTube Music', handle: 'Krid P', href: 'https://music.youtube.com/channel/UCnEAOng3XE_Mb1ObbbxGAqg', platform: 'youtube-music' },
    ]
  },
  {
    label: 'contact.support',
    links: [
      { name: 'Donate', handle: 'djkridp', href: 'https://streamelements.com/djkridp/tip', platform: 'streamelements' },
    ]
  }
];

export default function Contact() {
  const { t } = useLang();
  return (
    <section id="contact" className="section" aria-label={t('contact.title')}>
      <div className="container">
        <div className="contact-content">
          <SectionTitle i18nKey="contact.title" />
          <div className="contact-links">
            {GROUPS.map(group => (
              <div className="contact-group" key={group.label}>
                <p className="contact-group-label">{t(group.label)}</p>
                {group.links.map(link => (
                  <a key={link.platform}
                     className={`contact-link${link.disabled ? ' disabled' : ''}`}
                     href={link.href}
                     data-platform={link.platform}
                     target="_blank" rel="noopener noreferrer"
                     aria-disabled={link.disabled ? 'true' : undefined}
                     tabIndex={link.disabled ? -1 : undefined}>
                    <span className="contact-name">{link.name}</span>
                    <span className="contact-handle">{link.handleKey ? t(link.handleKey) : link.handle}</span>
                    <span className="contact-arrow" aria-hidden="true">&#8594;</span>
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
