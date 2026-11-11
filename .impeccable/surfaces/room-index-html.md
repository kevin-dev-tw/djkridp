---
version: 1
slug: "room-index-html"
primary_target: "room/index.html"
related_targets: ["index.html"]
---

# Raum

Mode: experience. A separate page from the poster — an open-air beach in daylight the visitor explores freely. A virtual crowd faces a big screen playing the live stream; a lantern post opens interactive playback of the Mind & Soul set. The only exit is the return to the poster. The poster page is not restyled.

## Direction contract

THESIS: The room is the afterparty on the sand — a crowd gathered under a day sky watching djkridp's stream on a truss LED wall, a lantern-lit spot to play the record yourself. An indoor render or neon void is the arrangement this page refuses.

OWN-WORLD: Day blue #3A7BC2 zenith over pale haze #CFE3EE at the horizon, sun high over the water; sea #1E6E8C turquoise with foam laps and a sun path; sand #C9B795 bright; the screen's phosphor trace #8FE388 as the only cool signal; fire #FF9A3C as warm point sources (lantern, campfire, pars). The crowd is silhouette-black and always backlit. Labels are working marks on wood and canvas — nothing ornamental.

STORY: The visitor stands in the crowd as the sun sits over the water. The stream breathes on the big screen, figures sway, a fire flickers between the two zones. They look around, walk the sand toward the screen, find the lantern, and play Mind & Soul from the page itself.

FIRST VIEWPORT: Inside the crowd facing the screen: LED wall glowing mid-frame with LIVE badge and breathing trace, heads dotted along the ember horizon, truss pars struck amber. Campfire mid-ground, lantern post right with its pulsing phosphor ring and PLAY sign. Return to the poster top right, quiet. Signature: free look — drag turns the head, wheel walks the sand, hover parallax; the lantern ring and the HUD play chip open the SoundCloud player.

FORM: Open-air beach broadcast — user-pinned direction (supersedes the dealt assignment). seed:9ec892f169451b8c

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Built

React + react-three-fiber (room-app/, Vite → room/ at /room/). Shader sky dome, animated sea, and procedural sand (wet band, ember streak, foam edge, light pools), canvas-texture LED wall with LIVE badge, instanced swaying crowd (26 figures), flickering campfire, lantern post with pulsing ring + canvas sign; SoundCloud playlist embed (2079462015) in a DOM panel via in-scene click or HUD chip.
