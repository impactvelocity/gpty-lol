# Mainframe costume art: gpt-image prompts

All four slots are filled: the pictures live in `public/terminal/` as WebP and
are listed in `FILES` at the top of `src/components/terminal/art.tsx`. Each one
also has a drawn fallback, used when its line is removed (the drawn hall in
`scene.tsx`, a CSS room-glow on the glass, CSS grain on the cabinet, an SVG
reel).

The look: hacking the mainframe in 1989, re-imagined as hyperreal, slightly
surreal photography. A cold machine room after midnight, dark charcoal
cabinets, amber phosphor, incandescent lamps, and one box at the end of the
aisle glowing red. That box is the chat window.

To replace one:

1. Generate it with the prompt below (sizes and settings are gpt-image's).
2. Resize and convert it (wallpaper and reflection 1536px wide, steel 512×512,
   reel 512×512 with alpha), for example
   `sips -Z 1536 in.png --out s.png && cwebp -q 90 -alpha_q 100 s.png -o out.webp`.
3. Save it over the file in `public/terminal/`.

The current wallpaper puts the red box at about (71%, 48%), not 60%; `scene.tsx`
crops narrow screens around that point and aims the push-in at it. A new
wallpaper with the box elsewhere should update both there.

---

## Desktop wallpaper: `wallpaper.webp`

1536×1024 (or larger), quality high. The site background, full-bleed with a
slow push-in (it replaces the drawn hall in `src/components/terminal/scene.tsx`).
The chat window covers the middle of the screen and the agent list sits over
the left third with white text, so that side must stay dark and calm. The
vanishing point belongs behind the chat window (about 60% from the left), so
the red box at the end of the aisle sits right behind it and its glow spills
out around the window's edges.

> A hyperreal, cinematic photograph of a corporate mainframe machine room in
> 1989, long after midnight, shot on a modern full-frame camera with a wide
> lens from the middle of a long, cold aisle in strict one-point perspective.
> The vanishing point sits about 60% from the left edge, just above the
> vertical center. Both sides of the aisle are lined with tall, dark
> charcoal-gray 1980s mainframe cabinets and refrigerator-sized tape drives
> with smoked-glass doors and 10½-inch tape reels, their front panels dotted
> with rows of tiny amber, red and green incandescent indicator lamps, a few
> softly blurred. A raised floor of square gray tiles with perforated vent
> tiles, faintly reflective; a dropped ceiling with a single line of
> fluorescent tube fixtures receding into the distance, one of them flickering
> dimmer. One surreal detail: at the very end of the aisle stands a single
> monolithic black cabinet, taller than the rest, outlined in a deep red glow
> that spills back down the aisle across the floor tiles and the cabinet edges
> like a warning, with a faint amber glow from a console screen on its face. A
> thin haze in the air catches the red light. Cool blue-gray ambient light
> everywhere else. Calm, ominous, nostalgic, ultra-detailed, low-key. The left
> third of the frame stays dark and uncluttered (deep shadow on the nearest
> cabinets). 3:2 desktop composition. No people, no text, no logos, no brand
> names, no UI, no watermark.

## The room in the glass: `reflection.webp`

1536×1024, quality high. Stretched over the console's CRT at 26% with the
"screen" blend mode, so only its brightest parts show, like the machine room
reflected in the tube. It must be almost entirely black.

> A very dark, low-key photograph of a 1989 computer machine room at night,
> seen straight on as if reflected in a monitor's glass: almost entirely
> black. Only a few soft highlights: along the top edge, two long, faint
> fluorescent ceiling tubes; along the right edge, a blurred column of tiny
> amber and red indicator lamps from a cabinet; on the far left, a dim red
> glow. Slightly out of focus, as a reflection would be. No person, no
> silhouette, no text, no logos. The center of the frame is pure black.

## Cabinet paint: `steel.webp`

512×512, quality high. A seamless tile laid over the whole cabinet with the
"overlay" blend mode, so it must average a neutral mid-gray (about RGB 128) and
stay low contrast: mid-gray changes nothing, and only the grain shows. If it
comes out darker or lighter, shift its levels to a mid-gray average before
saving.

> A seamless, tileable macro texture of dark gray powder-coated steel from a
> 1980s computer cabinet: a fine, even orange-peel stipple, faint
> micro-scratches running horizontally, a few tiny flecks. Evenly lit, no
> shadows, no gradients, no edges, no seams, no rivets. Medium gray overall
> and very low contrast. Must tile perfectly in both directions. No text, no
> logos.

## Tape reel: `reel.webp`

1024×1024, quality high, **background: transparent**, output PNG. Shown at
98px on both spindles of the "Tape 0" window and spun by CSS (lurching while
Shelly works, rewinding during an alarm), so it must be perfectly round,
centered and face-on, or the spin will wobble.

> A single 10½-inch reel of half-inch computer tape photographed perfectly
> face-on from directly above, as a hyperreal product shot: a clear, smoky
> gray plastic flange with three wide windows between three spokes, through
> which the dark brown wound tape pack shows (about two thirds full), a
> brushed aluminum hub with three drive notches, and a thin red write-enable
> ring around the hub. Soft, even studio light and one crisp specular glint
> across the plastic. The reel is perfectly circular, exactly centered and
> fills about 96% of the frame. Transparent background, no shadow, no other
> objects, no text, no labels.

---

## Drawn in code (no picture needed)

- The cabinet (steel, screws, nameplate, vents, the red warning plate), the
  blinkenlights, the beacon, the lit pushbuttons, the phosphor knob and the
  ABORT button: `src/components/terminal/terminal.css`. They stay CSS on
  purpose, because they follow the chat (lamps chatter while Shelly works and
  go red in an alarm; the beacon turns; keys light up).
- The console: VT323 on an amber, green or white tube with scanlines, bloom,
  curvature and a rolling refresh band.
- The big dot-matrix letters (the SHELLY logo, ACCESS DENIED): `BigText` in
  `art.tsx`, from a 5×7 character ROM.
- The intrusion map, the wireframe box that stands for Shelly, and the
  counter-trace meter.
- The tape reels' fallback (`Reel` in `art.tsx`) and the machine-room hall
  (`Hall` in `scene.tsx`), drawn in one-point perspective with the red box at
  the vanishing point.
