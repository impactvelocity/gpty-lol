# BBS costume art: gpt-image prompts

All four slots are filled: the pictures live in `public/bbs/` as WebP and are
listed in `FILES` at the top of `src/components/bbs/art.tsx`. Each one also has
a drawn fallback, used when its line is removed (the drawn town in
`Scenes.tsx`, a CSS window reflection, an SVG floppy, CSS grain). The monitor,
modem, sticky note and ANSI splash are always drawn in code (see the end of
this file).

The look: a 1993 basement BBS at midnight, re-imagined as hyperreal, slightly
surreal photography. Familiar at a glance (beige plastic, phone lines, a glowing
basement window), modern up close, with one odd detail per picture: the night
itself is made of ANSI art.

To replace one:

1. Generate it with the prompt below (sizes and settings are gpt-image's).
2. Resize and convert it (wallpaper and reflection 1536px wide, floppy 256×256,
   plastic 512×512), for example
   `sips -Z 1536 in.png --out s.png && cwebp -q 90 -alpha_q 100 s.png -o out.webp`.
3. Save it over the file in `public/bbs/`.

---

## Desktop wallpaper: `wallpaper.webp`

1536×1024 (or larger), quality high. The site background behind the monitor,
shown full-bleed with a slow push-in (it replaces the drawn town in
`Midnight()` in `src/components/Scenes.tsx`). It's a dark scene: the sidebar
sits on its left third with white text, so that side must stay dark and calm.
The monitor covers the middle, so what people actually see is the left third
and the bottom edge. Put the house and pole low on the left.

> A hyperreal, cinematic photograph of a quiet American suburb at midnight in
> 1993, shot on a modern full-frame camera with a wide lens. A vast, deep navy
> night sky fills the top two thirds. One surreal detail: the stars are tiny,
> perfectly square pixels in old DOS colors (cyan, magenta, pale yellow,
> white), some softly glowing, and the large crescent moon in the upper right
> is shaded at its edge with a visible coarse checkerboard dither pattern, as if
> drawn in ANSI block characters, while still looking photographic. In the lower
> left: a modest two-story house with a dark roof, every window dark except one
> small basement window at ground level glowing an eerie cyan-green, the glow of
> a CRT monitor spilling onto the lawn. Beside it, a wooden telephone pole with
> a crossarm and glass insulators; black phone wires sag from it to the house
> and sweep off across the sky to the right, carrying a few faint pulses of cyan
> and magenta light along them like data. A distant low skyline on the horizon
> with scattered lit windows. Dew on the grass, a hint of mist, cool moonlight,
> calm and nostalgic, ultra-detailed, low-key. The left third stays dark and
> uncluttered above the house. 3:2 desktop composition. No people, no cars, no
> text, no logos, no UI, no watermark.

## The room in the glass: `reflection.webp`

1536×1024, quality high. Stretched over the CRT's glass at 28% with the "screen"
blend mode, so only its brightest parts show, like a dark room reflected in a
monitor. It must be almost entirely black.

> A very dark, low-key photograph of a 1993 basement den at midnight, seen
> straight on as if reflected in a monitor: almost entirely black. Only a few
> soft highlights: in the upper left, a small four-pane window with a cool blue
> night glow and the faint orange smear of a distant streetlight; along the
> right edge, the warm, dim cone of a desk lamp; the faint vertical lines of
> wood paneling barely catching light. Slightly out of focus, as a reflection
> would be. No person, no silhouette, no text, no logos. The center of the
> frame is pure black.

## The floppy on the desk: `floppy.webp`

1024×1024, quality high, **background: transparent**, output PNG. Shown at
56px, tilted back in perspective by CSS, so shoot it perfectly flat from
directly above. Clicking it opens the dialing directory.

> A single 3.5-inch floppy disk photographed perfectly top-down and flat, as a
> hyperreal product shot: slightly worn matte black plastic with a cut top-right
> corner, a brushed aluminum shutter at the top with its rectangular window, a
> small write-protect slider at the bottom-left, and a white paper label with a
> thin orange-red stripe along its top edge, handwritten in blue ballpoint in
> confident capitals: "BBS LIST", underlined once. Soft, even studio light, a
> crisp specular glint on the metal, tiny scuffs. The disk fills about 85% of
> the frame, perfectly square to the camera. Transparent background, no shadow,
> no other objects.

## Monitor plastic: `plastic.webp`

512×512, quality high. A seamless tile laid over the beige monitor and stand with
the "multiply" blend mode, so it must be light (nearly white on average) and
low contrast: it only adds grain. The current file was generated beige and then
shifted to an average of about (249, 248, 242) with sharp so it doesn't darken
the bezel; do the same to a new one.

> A seamless, tileable macro texture of the matte beige ABS plastic of an early
> 1990s computer monitor, very slightly yellowed with age: a fine, even molded
> stipple grain, a few microscopic flecks, extremely subtle variation. Very
> light and low contrast, close to off-white overall, evenly lit with no
> shadows, no gradients, no scratches, no edges. Must tile perfectly in both
> directions. No text, no logos.

---

## Drawn in code (no picture needed)

- The ANSI splash ("MIDNIGHT BBS", the crescent moon, Dale's house, the phone
  pole and Dale) and the scene's moon: `buildSplash()` and `moonGrid()`
  in `src/components/bbs/art.tsx`, rendered as vector half-block pixels with
  real ░ ▒ ▓ dithering.
- The monitor, the knobs and buttons, the sticky note and the modem with its
  live lights: `src/components/bbs/bbs.css`. They stay CSS on purpose, because
  they react to the chat (the modem's RD and SD lights, power, degauss).
