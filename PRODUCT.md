# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Whoever arrives: listeners and fans of DJKridP, and people checking where he has played or how to reach him.

## Product Purpose

DJKridP's official site. It states who he is, where he has played, what he has released, where he streams, and how to follow or reach him. Success is a visitor finding those facts and the real links without a second, conflicting account.

The site is one poster page — a single scroll, no annexes, no second entrances. Everything lives on `index.html`.

## Positioning

The poster page is the complete record. A neighboring DJ site could copy a layout; it could not truthfully claim this biography, these releases, this Twitch channel, this stream schedule, and this country list.

## Operating Context

Visitors use a browser, in German or English (German is the default). The page is one scroll: home, about, tours, streams, works, contact — plus an AI assistant that answers from the same facts (biography, Future Breeze, countries played, releases, booking and contact). Live status comes from the Twitch channel `djkridp` (polled via DecAPI); the upcoming stream schedule comes from the Twitch Helix API through a serverless function.

## Capabilities and Constraints

- Identity the site already states: DJKridP, multi-genre DJ, based in Osnabrück, Germany, active since the late 1990s, former member of Future Breeze. Sets played in Germany, Canada, South Africa, Japan, Russia, Poland, Spain, Italy, and other countries. Tours are a country list, not a calendar of upcoming dates.
- Streams: the upcoming Twitch broadcast schedule (segment title, date, time, category, cancellations, vacation) fetched live from Twitch Helix. The section renders only when real data arrives — it is absent, never a placeholder.
- Works: multi-genre sets, Future Breeze, live performances. Embeds: one Spotify track, the SoundCloud album Mind & Soul (We Love Trance Records), Twitch player with an offline still and live-status text.
- Follow and music links already on the page: Twitch, Instagram, WhatsApp channel, Discord, Spotify, Apple Music, YouTube Music, StreamElements tips. TikTok and Facebook links are present and disabled.
- Languages: German and English; all visible strings go through `data-i18n` keys.
- AI assistant on the page, backed by a serverless function that needs `GROQ_API_KEY`.
- The schedule function needs `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` (optional `TWITCH_CHANNEL`, default `djkridp`).
- Stack: static HTML/CSS/JS + Vercel serverless functions (`api/chat.js`, `api/twitch-schedule.js`). Local development mirrors both endpoints in `server.js` (Express). A service worker (`sw.js`) caches the static shell, never API responses.
- CSS has one source of truth: `css/*.css` is compiled into `index.html`'s inline block by `node build-inline-css.js` (`npm run build`).
- The page does not invent a second biography, a second date list, or a second catalog.

## Brand Commitments

The name is DJKridP. Public copy stays factual and specific to the biography already published. Do not add listener counts, upcoming dates beyond what Twitch reports, venues, or releases that the site does not already show. The visual system is the locked Acid Poster design in `DESIGN.md`.

## Evidence on Hand

- Poster page: `index.html`, with German and English strings in `js/i18n.js`.
- Portrait: `images/Foto_539.jpg`. Twitch offline still: `images/offline.jpg`.
- Spotify track embed id `2xzEE0duyUNaVJeEy7O32l`. Artist: https://open.spotify.com/artist/22Mjn2JlrMAPgUEqozf4Re
- SoundCloud album Mind & Soul, playlist `2079462015`, label We Love Trance Records. Hypeddit: https://hypeddit.com/u1shci
- Twitch: https://www.twitch.tv/djkridp — schedule: https://www.twitch.tv/djkridp/schedule
- No press quotes, testimonials, follower counts, or announced show dates are in the repo beyond live Twitch data. Do not write them.

## Product Principles

- The poster page is the record.
- Claims stay inside the biography, countries, releases, and links already published.
- One homepage. Do not add a second entrance that restyles the site.
- Dynamic data (schedule, live status) comes from real APIs or is absent — never fabricated.
