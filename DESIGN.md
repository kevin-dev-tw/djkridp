# Design System: DJKridP — Acid Poster

Locked design system for `index.html`. One page, one world: a rave flyer rendered as a website. Source of truth for tokens is `css/variables.css`; page styles live in `css/*.css` and are inlined into `index.html` by `build-inline-css.js` — edit the source files, never the inline block.

## 1. Visual Theme & Atmosphere
Cold, high-voltage, underground — the atmosphere of a Berlin warehouse at 4am translated into hairline rules and oversized type. The site should feel printed, not rendered: ink on black paper. Density is moderate — breathing room everywhere, but every element earns its place. Motion is restrained: one marquee, snap-fast hovers, GSAP scroll reveals, nothing ambient. There is exactly one accent color and it is spent like a scream, not a conversation.

## 2. Color Palette & Roles
- **Void Black** `#0A0A0B` (`--midnight-base`) — Page canvas. Never pure `#000`.
- **Paper Bone** `#F4F4F0` (`--on-surface`) — Primary text and headline ink. Never pure `#FFF`.
- **Ash Grey** `#94949C` / `#71717A` (`--on-surface-variant`) — Secondary text, metadata, captions.
- **Hairline** `#26262A` (`--outline-variant`, `--glass-border`) — All borders and dividers, 1px structural lines only.
- **Panel Zinc** `#131316` (`--surface`, `--glass-bg`) — Elevated surfaces: embeds, chat panel, dropdowns.
- **Hazard Amber** `#FFB13D` (`--color-acid`) — THE accent. CTAs, hover states, marquee text, live states, the "next stream" row. Only accent permitted.
- **Acid Ink** `#0A0A0B` (`--on-primary`) — Text placed on accent fills. Never white-on-accent.
- Error states use the Material error ramp (`--error`, `--error-container`) — only inside forms/chat, never as decoration.

Every color and font goes through a `:root` token. No literal hex or `font-family` outside `variables.css`.

## 3. Typography Rules
- **Display:** `Archivo Black` — self-hosted `fonts/archivo-black-latin.woff2`, preloaded. Uppercase only, `letter-spacing: -0.02em`, single fixed weight — hierarchy comes from scale. Hero `clamp(3.5rem, 15vw, 12rem)`, `line-height: 0.95`.
- **Body:** `Hanken Grotesk` (400/500/700, Google Fonts) — 1rem base, descriptions in Ash Grey.
- **Mono:** `JetBrains Mono` (400/500/700, Google Fonts) — ALL metadata: nav links, dates, times, badges, footer, section eyebrows. Uppercase, `letter-spacing: 0.05–0.1em`. Mono is the connective tissue of the flyer aesthetic.
- **Icons:** Material Symbols Outlined — chat affordances and UI glyphs only, never emoji.
- **Banned:** Inter, system defaults, serif. No gradient text, no outlined/hollow display type.

## 4. Page Structure
Fixed announcement marquee (34px) → fixed header → `#home` hero → `#about` → `#tours` → `#streams` → `#works` → `#contact` → footer. Floating AI chat orb bottom-right. Language dropdown (DE/EN) in the header.

- **Announcement bar** `.twitch-banner` — Void Black band, 1px bottom Hairline, Acid-colored display-type marquee text (20s linear `translateX` loop). The flyer's rotating sticker — the only perpetual animation besides hover feedback.
- **Header** — fixed at `top: var(--announcement-height)`, Void Black, 1px bottom Hairline via `::after`. Wordmark left, Mono nav links right, language dropdown far right. No pill, no glass, no blur.
- **Hero** — `min-height: 100dvh`, left-aligned inside the centered container. `DJKRIDP` in Archivo Black at 15vw, one Mono uppercase subtitle line beneath. No image, no arrows, no "scroll to explore". The empty space is the composition.
- **Section titles** `.section-title` — display type, left-aligned above the section's Hairline. Unnumbered; numbering lives in the works list instead.
- **Tours** `.country-list` — a flat roster of countries played, display-type names in Hairline-divided cells. A setlist of places, not a table of dates.
- **Streams** `#streams` — Twitch schedule rendered as baseline-aligned list rows (`twitch-schedule-item`): Mono Acid date | Mono muted time | title | muted category. Hairline under each row, subtle row hover fill. The upcoming row turns Acid; canceled rows are struck through at 50% opacity. Section stays `hidden` until `/api/twitch-schedule` returns real data — never shows a skeleton or an empty state.
- **Werke** — numbered work rows (`.work-row`: Mono `01`/`02`/`03` + text block) followed by framed embeds: Spotify track, SoundCloud album (with credits), Twitch live player with `.twitch-live-status` Mono text indicator that turns Acid when live. Iframes lazy-load via `data-src`.
- **Contact** — booking links and socials in the same Hairline/Mono grammar.
- **Footer** — Void Black, top Hairline, Mono text.
- **AI chat** — circular orb button bottom-right (canvas "strands" treatment), opens a Panel Zinc panel with Hairline borders; header, message list, Mono-accented input and send button.

## 5. Component Stylings
- **Buttons:** Sharp corners — every radius token resolves to `2px`. Primary = Acid fill + Acid Ink text. Secondary = 1px Hairline border + Bone text → hover inverts to Acid. `transition: 100–150ms` max, never `transition: all`.
- **Cards:** BANNED as decoration. Content groups use 1px Hairline borders or naked negative space. A "card" here is a bordered cell — Panel Zinc fill optional, radius 0–2px.
- **Embeds:** 1px Hairline frame, Panel Zinc header strip labeled in Mono. The iframe is content, the frame is design.
- **Inputs:** Label in Mono above, Void Black field + 1px Hairline, focus = Acid border/outline. Error text in Mono below field.
- **Badges/Tags:** Mono uppercase text, 1px Hairline border. The "next stream" marker is a small Acid dot inline before the title; live status is Acid Mono text.
- **Shadows:** All shadow tokens are `none`. Flat is the rule.
- **i18n:** German is the document language; every visible string switches via `data-i18n` keys in `js/i18n.js`. New UI text ships with both `de` and `en` entries.
- **Bilingual dates:** schedule dates/times format through `Intl.DateTimeFormat` with the active locale — never hardcode a format string.

## 6. Layout Principles
- Single centered `.container`, capped width — gutters grow at wide viewports, the measure does not.
- `html` and `body` use `overflow-x: clip`. No `100vw` on content; `scroll-margin-top: var(--header-offset)` on sections so anchors clear the fixed chrome.
- GSAP ScrollSmoother wraps `#smooth-wrapper > #smooth-content`; ScrollTrigger drives section reveals. Normal document flow — no pinned/stolen scroll.
- Section spacing via `--spacing-section-lg` (120px) / `--spacing-section-sm` (64px) tokens, separated by Hairlines.
- Below 768px every multi-column layout collapses to a single column. Display type scales via `clamp()`; tap targets ≥44px; nav collapses to the mobile menu.

## 7. Motion & Interaction
- **One marquee:** the announcement bar, `transform` translateX only, linear, 20s.
- **Hovers snap:** 100–150ms max (`--transition-fast`/`--transition-base`). State changes flip like print — underline, invert, done.
- **Scroll reveals:** `opacity` + `translateY(8px)` via GSAP, `cubic-bezier(0.16, 1, 0.3, 1)` feel, sibling stagger ~60ms.
- **Animate only `transform` and `opacity`.** Never `width`/`height`/`top`/`left`, never filters.
- **No ambient motion:** no breathing, floating, or drifting backgrounds. Static is a feature.
- `prefers-reduced-motion`: all animation off; content is fully visible and functional with scripting off (progressive enhancement — embeds are `data-src`, schedule section simply stays hidden).

## 8. Anti-Patterns (Banned)
- No purple/blue neon, no glow shadows, no `box-shadow` halos
- No gradients of any kind — flat fills only
- No glassmorphism, no backdrop-blur, no frosted panels
- No pills/capsules — max 2px radius site-wide
- No pure black `#000`, no pure white `#FFF`
- No centered hero text, no scroll arrows, no "scroll to explore"
- No Inter, no serif fonts, no emoji in UI
- No equal-width card grids, no rounded cards
- No placeholder copy, no stock photos, no invented metrics/testimonials
- No AI copywriting: "Elevate", "Unleash", "Next-Gen", "Seamless"
- No custom cursors, no parallax, no WebGL/3D canvases
- No fake stats ("99.99%", "10K+ listeners")
