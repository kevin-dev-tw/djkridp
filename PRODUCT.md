# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Whoever arrives: listeners and fans of DJKridP, and people checking where he has played or how to reach him.

## Product Purpose

DJKridP’s official site. It states who he is, where he has played, what he has released, where he streams, and how to follow or reach him. Success is a visitor finding those facts and the real links without a second, conflicting account.

The site is one poster page. A separate WebGL room lives at `/room/` as an annex — an open-air beach at dusk with a crowd watching the stream and a lantern post that plays Mind & Soul. It is not a second entrance: the only way out is back to the poster.

## Positioning

The poster page is the complete record. A neighboring DJ site could copy a layout; it could not truthfully claim this biography, these releases, this Twitch channel, and this country list.

## Operating Context

Visitors use a browser, in German or English (German is the default). The page is one scroll: home, about, tours, works, contact, plus an AI assistant that answers from the same facts (biography, Future Breeze, countries played, releases, booking and contact). Live status comes from the Twitch channel `djkridp`.

## Capabilities and Constraints

- Identity the site already states: DJKridP, multi-genre DJ, based in Osnabrück, Germany, active since the late 1990s, former member of Future Breeze. Sets played in Germany, Canada, South Africa, Japan, Russia, Poland, Spain, Italy, and other countries. Tours are a country list, not a calendar of upcoming dates.
- Works: multi-genre sets, Future Breeze, live performances. Embeds: one Spotify track, the SoundCloud album Mind & Soul (We Love Trance Records), Twitch player with an offline still.
- Follow and music links already on the page: Twitch, Instagram, WhatsApp channel, Discord, Spotify, Apple Music, YouTube Music, StreamElements tips. TikTok and Facebook links are present and disabled.
- Languages: German and English.
- AI assistant on the page, backed by a serverless function that needs `GROQ_API_KEY` on Vercel.
- Stack already in the repo: static HTML, CSS, and JavaScript, with a small Node server for local AI chat. The `/room/` page is a React + react-three-fiber app in `room-app/`, built by `npm run build` into `room/`. Deployed at https://djkridp.vercel.app/.
- The page does not invent a second biography, a second date list, or a second catalog.

## Brand Commitments

The name is DJKridP. Public copy stays factual and specific to the biography already published. Do not add listener counts, upcoming dates, venues, or releases that the site does not already show.

## Evidence on Hand

- Poster page: `index.html`, with German and English strings in `js/i18n.js`.
- Portrait: `images/Foto_539.jpg`. Twitch offline still: `images/offline.jpg`.
- Spotify track embed id `2xzEE0duyUNaVJeEy7O32l`. Artist: https://open.spotify.com/artist/22Mjn2JlrMAPgUEqozf4Re
- SoundCloud album Mind & Soul, playlist `2079462015`, label We Love Trance Records. Hypeddit: https://hypeddit.com/u1shci
- Twitch: https://www.twitch.tv/djkridp
- No press quotes, testimonials, follower counts, or announced show dates are in the repo. Do not write them.

## Product Principles

- The poster page is the record.
- Claims stay inside the biography, countries, releases, and links already published.
- One homepage. Do not add a second entrance that restyles the site.
