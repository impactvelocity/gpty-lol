# The Lattice (Cora, 2199) costume art: image prompts

All seven slots are filled: the generated pictures live in `public/machine/`
as WebP and are listed in `FILES` at the top of
`src/components/machine/art.tsx`. Every slot also has a drawn SVG or CSS
fallback, used when its line is removed. As installed, the eye was resized to
512×512, the monolith cropped to its slab and glow (128×512) and the icons
resized to 64×64; the wallpaper and the void are as generated. The override
icon came out as a broken power switch rather than the padlock below, and was
kept: it reads well at 16px.

To replace one, generate it with the prompt below, convert it the same way
and save it over the file named below.

The look: a machine-to-machine relay in 2199, after the AIs took over (the
Handover). Not the green-rain Matrix: ultraviolet, hot magenta, electric cyan
and acid chartreuse on a deep violet void, with an oil-slick, iridescent sheen
on anything the machines want you to look at. Alien, clean, a little
biological, softly dystopian (surveillance, scheduled skies, polite
monoliths), never gory or militaristic. Cora's gpty is an acid-chartreuse orb
with dark violet eyes.

Converting: for example
`sips -Z 1536 in.png --out s.png && cwebp -q 88 s.png -o out.webp`, or
`cwebp -q 92 -alpha_q 100 -resize 512 512 in.png -o eye.webp` for the
cut-outs.

Cut-outs often come back with a pale halo where the white background was
matted out; check every cut-out on the dark violet void before using it.

---

## Desktop wallpaper: `wallpaper.webp` → `wallpaper: "/machine/wallpaper.webp"`

1536×1024 (or larger), quality high. The site background behind the Lattice
window, full-bleed with a slow push-in. The agent list sits on the left third
in white text, so that side must stay dark and calm. On most screens the
window covers the middle, so the best parts sit low on the left and on the
far right. Replaces the drawn sky, eye, searchlights and skyline (the drifting
glyphs stay on top).

> A wide, cinematic digital illustration of a vast alien megacity in the year
> 2199, long after the machines took over, seen at night from a low vantage
> point. The sky is a deep ultraviolet-to-black gradient with a faint
> magenta haze at the horizon. Hanging in the upper right of the sky, where
> the moon should be, is an enormous iridescent eye: a perfectly round iris
> of oil-slick color (magenta, violet, cyan and acid chartreuse swirling like
> a soap bubble) with a tall vertical slit pupil, ringed by thin, glowing
> concentric orbital rings with tick marks, like a planet-sized surveillance
> lens. Across the bottom third, a dense skyline of tall, featureless black
> monolithic towers with thin vertical strips of cyan, magenta and acid-green
> light, a few with blinking magenta beacons. Two pale searchlight beams
> cross the sky from the city. The ground is a dark reflective plane with a
> faint glowing perspective grid in magenta and cyan. Tiny glowing glyphs
> drift upward like embers. Clean, flat-shaded, slightly grainy, synth-noir
> but alien rather than retro: no palm trees, no sunset, no cars, no people.
> The left third is calm, dark violet sky with only faint distant towers.
> Palette: #06010d void, #7b2cff ultraviolet, #ff2bd6 magenta, #19f0ff cyan,
> #c8ff2e acid chartreuse. No text, no logos, no watermark.

## The void: `void.webp` → `void: "/machine/void.webp"`

1536×1024, quality high. The surface behind the whole conversation, inside the
window, under the hex lattice, the messages and the pointer lens. Shown at 55%
over a near-black violet gradient, so it must be dark, even and quiet.
Replaces nothing (it adds depth to the drawn void).

> An abstract, very dark background texture for use behind text: a deep
> violet-black void (#06010d to #140433) with an extremely subtle hexagonal
> honeycomb lattice receding into depth, faint as frost. Soft, out-of-focus
> nebulous glows of ultraviolet in the top right corner and a dim magenta glow
> in the bottom left corner. A whisper of iridescent oil-slick sheen in
> places, like light on a soap film. Fine digital grain. Even and
> low-contrast across the middle: no bright spots, no hard shapes, no stars,
> nothing that competes with text. No text, no symbols, no watermark.

## The Overseer's eye: `eye.webp` → `eye: "/machine/eye.webp"`

1024×1024, quality high, **background: transparent**. Fills the iris of the
sigil: the big eye on the empty screen (176px), the header (28px) and the
"sampling" indicator (30px). The drawn rings, the slit pupil (which follows
your pointer) and the blink stay on top, so the picture is only the iris.
Replaces the drawn conic-gradient iris.

> A perfectly circular, front-on macro image of an alien iris on a
> transparent background, filling the frame edge to edge. The iris is
> iridescent like oil on water or a beetle's shell: swirling magenta, deep
> violet, electric cyan and acid chartreuse, with fine radial fibers like a
> real iris, a thin dark limbal ring at the edge and a faint luminous glow
> toward the center. The very center is soft and slightly lighter (a slit
> pupil will be placed over it, so do not paint a pupil). Crisp, detailed,
> beautiful, unsettling. Only the circular iris on transparency: no eyelids,
> no eyelashes, no skin, no reflections of people, no text.

## The monolith: `monolith.webp` → `monolith: "/machine/monolith.webp"`

512×1024 (1:2), quality high, **background: transparent**. Stands at the foot
of the agent list on tall screens (shown about 120px wide). Replaces the drawn
obelisk with its glyph column.

> A tall, narrow black monolith on a transparent background, standing
> upright, seen straight on: a smooth obsidian slab with a gently pointed
> top, its edges catching iridescent light (cyan on the left edge, magenta on
> the right). Near the top, a single small glowing horizontal eye with an
> acid-chartreuse iris. Running down its face, a vertical column of softly
> glowing cyan alien glyphs, katakana and Cyrillic-like characters, as if the
> machines' language is scrolling through it. A faint ultraviolet aura around
> the whole slab. Clean, minimal, ominous but calm. Only the monolith and its
> glow on transparency: no ground, no sky, no people, no readable words.

## Protocol icons: `icon-ping.webp`, `icon-scan.webp`, `icon-override.webp`

256×256 each, quality high, **background: transparent**. The three protocols
in the composer's + menu and on their status lines in the relay, shown at
16–22px. Replace the drawn line icons. Generate them as a set (same prompt
frame, change the subject line) so they match.

Shared frame:

> A single glowing alien interface glyph-icon on a transparent background,
> centered, filling about 80% of the frame. Thin, precise neon line work with
> a soft bloom, drawn like a futuristic holographic UI symbol, in an
> iridescent gradient of electric cyan, ultraviolet and magenta with a small
> acid-chartreuse accent. Flat and symmetrical, readable at 16 pixels: bold
> simple silhouette, no fine detail, no text. Subject:

- `icon-ping.webp` (`"icon-ping": "/machine/icon-ping.webp"`):
  > three concentric arcs radiating out from a small solid dot, like a signal
  > being sent outward.
- `icon-scan.webp` (`"icon-scan": "/machine/icon-scan.webp"`):
  > a square viewfinder made of four corner brackets with a horizontal scan
  > line through the middle and a small circle at the center.
- `icon-override.webp` (`"icon-override": "/machine/icon-override.webp"`):
  > an open padlock with its shackle lifted, a small vertical keyhole slot,
  > glowing faintly ember-orange where the lock is broken.

---

## Drawn (SVG and CSS, no prompt needed)

These stay vector. They live in `art.tsx` and `machine.css`:

- **The sigil** (`Sigil`): the iris (a turning conic gradient with fibres),
  the slit pupil that follows your pointer and dilates while Cora samples,
  the blink, and the rings of ticks, arcs and runes that spin up when she's
  busy.
- **The frame**: the chamfered window with its turning oil-slick edge and the
  colored light it throws, the hex lattice that glows under your pointer, the
  aurora, the refresh band, interlace and grain.
- **Machinespeak** (`garble.ts`): the transcoder, the churning tail on a live
  reply, the decode sweep and the words that flicker to another reading.
- **Icons** (`Icon`): transmit, sever, protocols, decode and re-encode, ping,
  scan, override, warn, spawn and kill.
- **The scene** (`MachineScene`): the halo of a megastructure, the Overseer,
  searchlights, skyline, glowing grid, drones, drifting glyphs and the
  monolith.
- **The sidebar chip** (`SidebarRow.tsx`): the turning edge, the dashed orbit
  around Cora and the signal bars.
