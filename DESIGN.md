# Design System: DJKridP — Acid Poster

## 1. Visual Theme & Atmosphere
A rave flyer rendered as a website. Cold, high-voltage, underground — the atmosphere of a Berlin warehouse at 4am translated into strict grid lines and oversized type. Density sits at Daily-App Balanced (5/10): breathing room everywhere, but every element earns its place. Variance is aggressive (8/10) — headlines bleed to edges, columns split asymmetrically, nothing is centered unless the grid demands it. Motion is restrained (4/10): a single authentic marquee, snap-fast hovers, no ambient animation. The site should feel printed, not rendered — like ink on black paper.

## 2. Color Palette & Roles
- **Void Black** (#0A0A0B) — Page canvas. Absolute dark base, never pure #000.
- **Paper Bone** (#F4F4F0) — Primary text and headline ink. Warm white, never pure #FFF.
- **Ash Grey** (#71717A) — Secondary text, metadata, timestamps, captions (Zinc-500).
- **Hairline** (#26262A) — All borders, dividers, table rules. 1px structural lines only.
- **Panel Zinc** (#131316) — Elevated surfaces: cards, embeds, the navigation bar.
- **Hazard Amber** (#FFB13D) — THE accent. Single permitted color: CTAs, hover states, active nav, marquee background, live indicators. Used sparingly — a scream, not a conversation.
- **Acid Ink** (#0A0A0B) — Text placed on accent fills. Never white-on-accent.

## 3. Typography Rules
- **Display:** `Archivo Black` or `Anton` — Uppercase only, track-tight (-0.02em), weight is fixed so hierarchy comes from SCALE: hero 15vw, section titles `clamp(3rem, 8vw, 7rem)`, no mid-sizes. Headlines are architecture, not decoration.
- **Body:** `Satoshi` or `Hanken Grotesk` — 1rem/1.65 leading, max 60ch, Ash Grey for descriptions.
- **Mono:** `JetBrains Mono` — ALL metadata: dates, locations, set lists, stats, labels, footer text. Uppercase, letter-spacing 0.08em. Mono is the connective tissue of the flyer aesthetic.
- **Banned:** Inter, system defaults, any serif. No gradient text, no outlined/hollow display type.

## 4. Component Stylings
- **Buttons:** Sharp corners (max 2px radius). Primary = Acid fill + Acid Ink text. Secondary = 1px Hairline border + Bone text → hover inverts to Acid. Tactile -1px translate on :active. No shadows, no glows, no transitions longer than 150ms.
- **Cards:** BANNED as decoration. Content groups use 1px Hairline borders or naked negative space. A "card" here is a bordered cell in a grid — Panel Zinc fill optional, radius 0.
- **Nav:** Fixed top bar — Void Black with 1px bottom Hairline. Wordmark in Display type left, links in Mono right. Active link = Acid underline 2px. No pill, no glass, no blur.
- **Mobile Nav:** Bottom dock replaced by a full-width top sheet or a Mono-text bottom bar. Same Hairline rule system.
- **Tours:** Rendered as a schedule table, not cards — full-width rows divided by Hairlines. Columns: DATE (mono) | CITY/COUNTRY (display, mid-weight). Hover row = Acid text. This is a setlist, not a gallery.
- **Embeds (Spotify/Twitch):** Framed by 1px Hairline border, Panel Zinc header strip labeled in Mono ("SPOTIFY — WEEKLY ROTATION"). The iframe is content, the frame is design.
- **Inputs/Forms:** Label in Mono above, input is Void Black + 1px Hairline, focus ring = 2px Acid. Error text in Mono, Acid color, below field.
- **Loaders:** Skeletal bars matching layout dimensions, Panel Zinc fill. No spinners anywhere.
- **Badges/Tags:** Mono uppercase text inside 1px Hairline border. Live status = Acid square (4px), not a rounded dot.
- **Empty States:** Composed Mono-caption compositions — e.g. an empty setlist row reading "NO DATES ANNOUNCED —" waiting to be filled. Never a bare "No data" line.
- **Texture (optional):** a single fixed `body::after` grain overlay (SVG feTurbulence, 3–4% opacity, `pointer-events: none`) may add print-paper tooth. Fixed pseudo-element only — never animated, never on content layers.

## 5. Layout Principles
- Hero is LEFT-ALIGNED, asymmetric: "DJKRIDP" in Archivo Black spanning full 15vw, breaking across two lines if needed, with the tagline set in Mono offset to the right column. The empty space is the composition.
- **Inline image typography (signature move):** a small live-performance photo sits inline inside the headline — at cap-height between two words of the second line (e.g. between "LIVE" and "SETS"), rounded 2px, height locked to the type. On mobile it stacks below the headline. One image maximum; it punctuates, it does not illustrate.
- **CTA restraint:** at most one primary CTA in the hero (Acid fill). No secondary "learn more" ghost links.
- A visible 12-column grid with `max-width: 1400px` containment. Hairline rules may extend full-bleed beyond the content column — the frame is part of the design.
- Section titles sit LEFT above a full-width Hairline. Numbered in Mono ("01 — TOURS", "02 — WERKE") like a tracklist.
- No three-equal-card rows anywhere. Tour entries are table rows; other content uses 2-column zig-zag or asymmetric 8/4 splits.
- Section spacing: `clamp(4rem, 10vw, 8rem)` top padding, separated by full-bleed Hairlines.
- Full-height sections use `min-h-[100dvh]`, never `h-screen`.

**Responsive rules:**
- Below 768px every multi-column layout collapses to a single column — no exceptions, no horizontal scroll
- Display type scales via `clamp()`; body text never below 1rem (14px metadata allowed in Mono)
- All tap targets minimum 44px
- Desktop top nav collapses to a clean mobile menu or Mono bottom bar; table rows reflow: date stacks above city

## 6. Motion & Interaction
- **One marquee allowed:** A ticker strip — Hazard Amber background, Acid Ink Mono uppercase text scrolling site-wide announcements or genre tags. This is the flyer's rotating sticker. `transform` translateX loop, linear, ~20s.
- **Hovers snap:** `transition: none` or 100–150ms max. Elements flip instantly like a printed state change — underline appears, invert happens, done.
- **Scroll reveals:** `opacity` + `translateY(8px)` only, spring feel via cubic-bezier(0.16, 1, 0.3, 1) at ~400ms (stiffness 100, damping 20 equivalent). Stagger siblings by 60ms.
- **Perpetual micro-loop:** the only always-on animation besides the marquee is the live indicator — a 4px Acid square pulsing `opacity` 1 → 0.4 on a 1.6s cycle. Everything else is inert until touched.
- **Animate only `transform` and `opacity`.** Never position properties, never filter animations.
- **No ambient motion:** No breathing, no floating, no drifting backgrounds. Static is a feature — the poster doesn't move, the reader does.
- `prefers-reduced-motion`: all animation off, marquee becomes static centered text.

## 7. Anti-Patterns (Banned)
- No purple/blue neon, no glow shadows, no `box-shadow` halos
- No gradients of any kind — flat fills only
- No glassmorphism, no backdrop-blur, no frosted panels
- No pills/capsules — max 2px radius site-wide
- No pure black #000, no pure white #FFF
- No centered hero, no hero scroll arrows, no "scroll to explore"
- No Inter, no serif fonts, no emoji in UI
- No 3-column equal card grids, no rounded cards
- No lorem-style placeholder copy, no stock-photo fillers
- No AI copywriting: "Elevate", "Unleash", "Next-Gen", "Seamless"
- No custom cursors, no parallax, no WebGL canvases
- No fake stats ("99.99%", "10K+ listeners")

---

# Surface: Raum (/room/)

A separate world from the Acid Poster — an open-air beach in daylight, not print. Standalone React + react-three-fiber page built from `room-app/`; the poster's rules do not cross over, and the room never restyles the poster.

## Palette
- **Day Blue** `#3A7BC2` — zenith and page ground.
- ****Haze** `#CFE3EE` — the pale band at the horizon; **Sun** white-hot over the water.
- ******Sea** `#1E6E8C` turquoise and **Sand** `#C9B795` — the ground plane split at the waterline; the sea carries swell rows, foam laps and a sun path.
- **Phosphor** `#8FE388` — the stream trace on the LED wall and the lantern's affordance ring; the only cool signal.
- **Fire** `#FF9A3C` — every warm point source: campfire, lantern globe, play chip.
- The crowd is warm-clothed `#453B33` — sunlit masses, never detailed.

## Type & Labels
- HUD chrome in `Sora` small tracked caps — minimal: brand, return link, one caption, one hint, one play chip.
- In-scene text is working marks only — the stream's LIVE badge and channel tag drawn into the screen texture, the lantern's painted `PLAY ▸ MIND & SOUL` board. Nothing decorative.

## Scene & Motion
- One beach — sky, sea and sand all shader-drawn (procedural sand with wet band, ember streak, breathing foam edge, fire and lantern pools) — two zones: the crowd facing a truss-mounted LED wall (canvas-texture stream, breathing phosphor trace + scanlines), and the lantern-lit listening post with blanket and crate that opens the real SoundCloud playlist in a DOM panel.
- Free look only: pointer drag turns the head (yaw ±166°, pitch clamped), wheel walks the sand toward the screen, hover adds micro-parallax, faint idle sway. Arrow keys step the view; Esc closes the player.
- Ambient life is the point: 26 instanced figures sway on individual phases, the fire flickers its light, sea glints drift, first stars hold still.
- `prefers-reduced-motion`: near-instant response, sway and flicker damped.
- Aspect-aware FOV: portrait screens widen so the screen and horizon stay in frame.
- Figure discipline: figures read as clothed masses in daylight — never render faces, hands, or clothing detail.
