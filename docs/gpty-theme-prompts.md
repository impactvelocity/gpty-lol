# Themed gptys: SVG prompts

While an agent is open, every gpty on screen can change into that agent's
theme. Two sets are already in: ICQ (16×16 pixel icons, `src/components/icq/gptys.ts`)
and MSN (glossy gel, `src/components/msn/gptys.ts`). This file has the prompts
for the rest.

## How to use

1. Copy the theme's prompt below.
2. Paste the shared block straight after it: **Vector format** for most themes,
   **Pixel format** for BBS and mIRC. Each shared block also holds the
   character list.
3. Save what comes back to the folder in the table, then ask for it to be
   wired in like ICQ and MSN.

The character outlines, colours and eye lines in the shared blocks come
straight from `src/components/Gpty.tsx` and `src/lib/agents.ts`. If a shape
changes there, regenerate them.

| Theme | Look | Format | Characters | Save to |
| --- | --- | --- | --- | --- |
| Skype (Cal) | Vista Aero glass with sky inside | Vector | 01–12 | `public/gptys-skype-glass-agents/` |
| Facebook (Mark) | 2008 flat blue-bar UI | Vector | 01–14 | `public/gptys-facebook-flat-agents/` |
| reddit (Arthur) | Snoo-style ink doodles | Vector | 01–12 | `public/gptys-reddit-snoo-agents/` |
| Slack (Channing) | 2014 flat design | Vector | 01–12 | `public/gptys-slack-flat-agents/` |
| Caveman (Grug) | Ochre cave painting | Vector | 01–12 | `public/gptys-caveman-ochre-agents/` |
| Séance (Mortimer) | Hand-tinted Victorian engraving | Vector | 01–12 | `public/gptys-seance-engraved-agents/` |
| Fury (Shelly) | 1985 neon signs with synthwave suns | Vector | 01–12 | `public/gptys-fury-neon-agents/` |
| North Pole (Carol) | Hand-stitched felt ornaments | Vector | 01–12 | `public/gptys-elf-felt-agents/` |
| The Machine (Cora) | Circuit schematics on black glass | Vector | 01–12 | `public/gptys-machine-schematic-agents/` |
| Token Palace (Lucky) | Lacquer marquee signs with bulbs | Vector | 01–12 | `public/gptys-slots-marquee-agents/` |
| Midnight BBS (Dale) | ANSI block art, 16 DOS colours | Pixel | 01–13 | `public/gptys-bbs-ansi-agents/` |
| mIRC (Nick) | Windows 2000 toolbar icons, mIRC colours | Pixel | 01–12, 14 | `public/gptys-irc-win2000-agents/` |
| Mainframe (1989 Shelly) | Monochrome amber phosphor | Vector | 01–12, 15 | `public/gptys-terminal-amber-agents/` |
| High Limit (green Lucky) | Matte casino chips with brass | Vector | 01–12, 16 | `public/gptys-highlimit-chip-agents/` |

Why the extra characters: hidden agents (13–16) only appear in the sidebar
when they're the open one, so each needs drawing only in its own theme.
Facebook is the exception: Dale and Nick are Mark's friends in the News Feed.

---

## Skype: Aero glass

```
Create a set of SVG icons: a family of small blob characters redrawn as Skype 3 on Windows Vista (2007) would draw them, as pieces of tinted Aero glass with the Skype sky showing through. Think of the Vista Start orb and a glass sweet held up to a blue sky.

STYLE
- Keep each silhouette exact.
- Layers, bottom to top:
  1. rim: the silhouette stroked 3 wide under the body, in a deep shade of the body colour.
  2. body: the body colour as a radial gradient: rich and a little darker at the edges, lighter toward the lower middle as if lit from inside, at 88% fill-opacity so it reads as glass.
  3. sky: one or two very soft white cloud puffs in the lower half at 15–20% opacity, clipped to the silhouette: the sky seen through the glass.
  4. reflection: the Vista glass reflection: a white shape over the top 40–45% of the body with a crisp, gently curved bottom edge (a hard edge, not a soft fade), gradient from 70% white at the top to 20% at that edge. Clip it to the silhouette.
  5. glint: a bright white 1.2-wide line along the inside of the top-left edge (clipped), and one small white sparkle.
- Nothing outside the silhouette except the rim.
- Eyes: white, unless a character needs dark eyes for contrast.

DRAW: characters 01–12.
```

## Facebook: 2008 flat

```
Create a set of SVG icons: a family of small blob characters redrawn in the look of Facebook in the summer of 2008: the tidy, nearly flat style of the old site, with the blue bar, 1-pixel borders, pale grey boxes and its little app icons (Photos, Events, Notes). Calm, clean and almost flat: no gloss, no glow.

STYLE
- Keep each silhouette exact.
- Layers, bottom to top:
  1. border: the silhouette stroked 2.5 wide under the body, in a darker, slightly greyed shade of the body colour, like the #3b5998 edge of the blue bar.
  2. body: a gentle two-stop vertical gradient, like 2008's blue Share and Log In buttons: the body colour mixed with 15% white at the top, the plain body colour at the bottom. Mute each colour a touch toward Facebook's calm palette, but keep every hue recognizable.
  3. bevel: one 1.2-wide white line at 45% opacity along the inside of the top edge, clipped to the silhouette: the 1-pixel highlight on Facebook's buttons. Nothing else.
- Nothing outside the silhouette except the border.
- Eyes: white.

DRAW: characters 01–14 (13 Dale and 14 Nick are Mark's friends in the News Feed).
```

## reddit: Snoo ink

```
Create a set of SVG icons: a family of small blob characters redrawn as reddit drew things in June 2009, in the style of Snoo, its alien mascot: a friendly hand-inked cartoon with a thick black outline and a mostly white body. The orangered of reddit's arrows and the pale periwinkle of its header (#cee3f8) are the only accents.

STYLE
- Keep each silhouette's shape. The outline may wobble very slightly, like a marker drawing (up to 0.5 units), but don't change the shape.
- Layers, bottom to top:
  1. ink: the silhouette stroked 5 wide in #111111 under the body (2.5 shows), round joins.
  2. body: white.
  3. tint: the character's own colour as a flat wash over the body at 35–45% opacity, so each still reads as itself (Cal a pale sky blue, Grug a pale orange). No gradient.
  4. shade: a flat crescent of #cee3f8 at 70% along the inside of the lower-right edge, clipped to the silhouette, like Snoo's shading.
- 05 Arthur already is reddit's alien: make him the most Snoo-like (orangered ball on his antenna), with the same tint as the others so he matches the set.
- Nothing outside the silhouette except the ink.
- Eyes: orangered #ff4500 for everyone, like Snoo's.

DRAW: characters 01–12.
```

## Slack: 2014 flat

```
Create a set of SVG icons: a family of small blob characters redrawn in early 2014's flat design, the moment of iOS 7, OS X Mavericks and Slack's launch: flat colour, no outlines, no gloss, no gradients. Slack's palette is aubergine (#4d394b) and the four colours of its hash logo (#e01563, #3eb991, #e9a820, #6ecadc).

STYLE
- Keep each silhouette exact.
- Layers, bottom to top:
  1. shadow: a flat offset shadow: a copy of the silhouette moved 3 units right and 3 down, in #000000 at 18%, no blur. (The only thing outside the silhouette.)
  2. body: the flat body colour.
  3. facet: a flat shade (the body colour 12% darker) over the lower-right part of the body, cut off by one straight diagonal from upper right to lower left that passes below and right of the eyes. Clip it to the silhouette.
  4. spot: one small flat white circle at 90% in the upper left.
- Eyes: white.

DRAW: characters 01–12.
```

## Caveman: ochre cave painting

```
Create a set of SVG icons: a family of small blob characters painted on a cave wall in 10,000 BC, in the style of the first pictures people made (Lascaux, Altamira, the hand stencils of the Cueva de las Manos): mineral pigment blown and daubed onto rock in red and yellow ochre, charcoal, white kaolin and brown umber.

STYLE
- Repaint each silhouette by hand: roughen the edge so it wobbles and frays (up to 1.5 units in or out), like pigment on uneven stone, but keep the shape, size and position.
- Colour: shift each character's colour toward the nearest earth pigment but keep its hue recognizable (Daisy a mossy earth green, Cal a chalky blue-grey, Cora a sulphur yellow-green). No bright digital colours.
- Layers, bottom to top:
  1. halo: a faint sprayed halo, as around a hand stencil: 6–10 small irregular dots of the pigment at 25–40% opacity, scattered within 2 units outside the edge. (Allowed outside the silhouette.)
  2. body: the roughened silhouette, filled flat with the pigment.
  3. blotches: 4–6 irregular patches a little lighter or darker than the pigment inside the body, so the paint looks uneven and soaked into the rock. Keep them out of the eye area.
  4. charcoal: a broken charcoal contour along part of the edge, not all the way round: 2–3 rough strokes 1.5–2.5 wide in #2a1a12 at 80%, like a painter's sketch line.
- No gloss, no gradients, no lighting.
- Eyes: recommend bone white (#f1e4c8) or charcoal per character, whichever reads better.

DRAW: characters 01–12.
```

## Séance: hand-tinted engraving

```
Create a set of SVG icons: a family of small blob characters drawn as engravings from an 1880s book of spirits, hand-tinted with watercolour and edged in the antique gold of a Victorian spirit board (gold #c9a55a, bone #efe4cc, sepia ink #3a2a14). They're shown on a near-black room lit by candles.

STYLE
- Keep each silhouette exact.
- Layers, bottom to top:
  1. gilt: the silhouette stroked 3.5 wide in antique gold #c9a55a under the body.
  2. wash: the body filled with a watercolour wash of the character's colour, faded and slightly desaturated as if on aged paper: a vertical gradient from a pale tint at the top to a deeper tone at the bottom.
  3. hatching: engraved shading: 6–10 fine parallel diagonal lines (1.2 wide, #3a2a14 at 60–70%) across the lower-right third of the body, getting shorter toward the light, clipped to the silhouette. None over the eye area.
  4. light: one small bone-white crescent (#efe4cc at 70%) on the upper left.
- Nothing outside the silhouette except the gold outline.
- Eyes: recommend charcoal (#15110f) unless a character needs light eyes.

DRAW: characters 01–12.
```

## Fury: 1985 neon

```
Create a set of SVG icons: a family of small blob characters as cyberspace looked in 1980s movies (Tron, Kung Fury, an arcade at midnight, every VHS cover at the video store). Each one is a neon sign on the Grid: a glowing tube in its own colour around a dark body with a striped synthwave sunset inside.

STYLE
- Keep each silhouette exact.
- Layers, bottom to top (everything stroked sits under the body, so overlapping parts never show):
  1. bloom: glow without filters: the silhouette stroked in the body colour three times, widths 9, 6.5 and 5, at 12%, 22% and 40% opacity. It may reach 3.5 units outside the silhouette.
  2. ghosts: the chromatic split: two copies of the silhouette stroked 3.2 wide at 50%, one cyan #35f0ff moved 1 unit left, one magenta #ff2e88 moved 1 unit right. For characters that are already pink or cyan, use violet #8a5cff for the matching ghost.
  3. tube: the silhouette stroked 3.2 wide in a white-hot tint of the body colour (60% white), so 1.6 shows as the neon tube.
  4. body: near-black #0b0614, flat.
  5. sun: across the lower 45% of the body, a synthwave sunset: a vertical gradient from the body colour to hot pink #ff2e88 (to orange #ff9a1f for pink characters), cut by 3–4 horizontal gaps of the dark body that get thicker toward the bottom. Clip it to the silhouette.
- Eyes: white-hot (#fff4fb).

DRAW: characters 01–12.
```

## North Pole: felt ornaments

```
Create a set of SVG icons: a family of small blob characters as felt ornaments, cut out and hand-stitched by an elf for the workshop tree a few weeks before Christmas, drawn like a cozy hand-made holiday card. The card's palette: pine felt #2b4a2f, cream stitching #f8f0e1, holly red #c8372d, sage #8fb07c, gold #e2ae4a, pink #f3b7ad.

STYLE
- Keep each silhouette's shape. The cut edge may be very slightly uneven, like felt cut with scissors (up to 0.5 units).
- Layers, bottom to top:
  1. edge: the silhouette stroked 2.5 wide under the body in a darker shade of the felt: the thickness of the cut felt.
  2. felt: the body in matte felt: the character's colour softened a little toward a warm, woolly tone. Flat, no gloss.
  3. fuzz: felt texture: 12–20 tiny specks (radius 0.4–0.7) a shade lighter and darker than the felt, scattered over the body, none in the eye area.
  4. stitch: a cream #f8f0e1 running stitch about 2.5 units inside the edge, all the way round: dashes about 1.6 long with 1.4 gaps, 1.2 wide, round caps. For 01, 05 and 12, follow only the outer edge.
- Nothing outside the silhouette except the felt edge.
- Eyes: recommend dark ink (#3a2b20) or cream per character, whichever reads better.

DRAW: characters 01–12.
```

## The Machine: circuit schematics

```
Create a set of SVG icons: a family of small blob characters as the machines of 2199 would draw them, after they won: precise, quiet schematics etched in light on black glass, with faint circuitry and runes. No window, no glow. The Lattice's colours are black #05030a and cyan #5fdcec; each character keeps its own colour for its lines.

STYLE
- Keep each silhouette exact.
- Layers, bottom to top:
  1. contour: the silhouette stroked 3 wide in the character's colour under the plate (1.5 shows).
  2. plate: the body filled near-black, with 12% of the character's colour mixed in.
  3. echo: one inner copy of the outline about 3.5 units inside the edge, 1.2 wide, in the character's colour at 40%. Skip it for 01, 05 and 12.
  4. traces: 3–5 circuit traces: straight runs with 45° bends, 1.2 wide, in the character's colour at 70%, running from the edge into the lower half of the body, PCB style. Clip them to the silhouette and keep them out of the eye area.
  5. nodes: a small via (ring of radius 1.2) at the inner end of each trace, and one tiny rune-like mark (2–3 short strokes) near the bottom, in cyan #5fdcec.
- No gradients, no gloss, no glow.
- Eyes: recommend a light tint of each character's colour (dark eyes vanish on black).

DRAW: characters 01–12.
```

## Token Palace: marquee signs

```
Create a set of SVG icons: a family of small blob characters as little marquee signs from a slot machine at 3 a.m. in a casino with no clocks: glossy lacquer in each one's colour, a gold chrome rim, and a ring of light bulbs just inside it.

STYLE
- Keep each silhouette exact.
- Layers, bottom to top:
  1. chrome: the silhouette stroked 4 wide under the body (2 shows) with a polished gold gradient in hard-ish bands: #fff2b0, #e2a52a, #7a4a08, #ffd968, #a86a12 from top to bottom.
  2. lacquer: deep glossy lacquer in the body colour: a vertical gradient, lighter at the top, the body colour in the middle, 35% darker at the bottom.
  3. shine: one sharp-edged white reflection band across the upper third at 55%, clipped to the silhouette, like light on a lacquered cabinet.
  4. bulbs: 10–16 small bulbs evenly spaced about 3 units inside the edge: circles of radius 0.9–1.1 in warm white #fff6d8, each ringed in gold #e2ae4a (0.4 wide). Give each bulb data-bulb="1", "2", … in order around the shape so the app can make them chase. Skip the eye area, and put bulbs on the main body only (not on 05's antenna or 12's lever).
- Nothing outside the silhouette except the chrome.
- Eyes: recommend white or dark per character.

DRAW: characters 01–12.
```

## Midnight BBS: ANSI art

```
Create a set of pixel-art SVG icons: a family of small blob characters drawn as 1993 BBS artists drew in ANSI: only the 16 DOS text-mode colours, with shading made from the block characters ░ ▒ ▓ █, so a shade is a dither pattern, never a new colour. Use nothing outside this palette:
#000000 #0000aa #00aa00 #00aaaa #aa0000 #aa00aa #aa5500 #aaaaaa #555555 #5555ff #55ff55 #55ffff #ff5555 #ff55ff #ffff55 #ffffff

STYLE
- Map each character's colour to its nearest bright tone and dark partner in the palette (e.g. Daisy #55ff55 / #00aa00, Cal #55ffff / #00aaaa, Kayleigh #ff55ff / #aa00aa, Grug #ff5555 / #aa5500).
- Shade with dithers: solid bright tone (█) in the upper left; a band of 50% checkerboard (▒) of bright and dark across the middle; the dark tone in the lower right, with a 25% sprinkle (░) of #000000 along the bottom edge.
- A 1-pixel #000000 outline around the outside.
- Keep the eye area (see format) solid in one tone.
- Eyes: recommend #ffffff or #000000 per character.

DRAW: characters 01–13.
```

## mIRC: Windows 2000 icons

```
Create a set of pixel-art SVG icons: a family of small blob characters as 24×24 Windows 2000 toolbar icons, the kind on mIRC 6's own toolbar in 1999, coloured only from mIRC's 16 colour codes:
#ffffff #000000 #00007f #009300 #ff0000 #7f0000 #9c009c #fc7f00 #ffff00 #00fc00 #009393 #00ffff #0000fc #ff00ff #7f7f7f #d2d2d2

STYLE
- A 1-pixel outline in the darkest suitable palette colour.
- A three-step ramp per character from the nearest mIRC colours: light in the upper left, mid in the middle, dark in the lower right. Where a hue has only one entry, use it for the mid tone with #d2d2d2 highlight pixels and #000000 or #7f7f7f shade pixels.
- A Windows 2000 drop shadow: #7f7f7f pixels one right and one down from the outline along the bottom and right edges.
- Keep the eye area (see format) in the plain mid tone.
- Eyes: recommend #ffffff or #000000 per character.

DRAW: characters 01–12 and 14.
```

## Mainframe: amber phosphor

```
Create a set of SVG icons: a family of small blob characters as a monochrome amber console in a 1989 machine room would draw them: amber phosphor on black. Every character loses its own colour and is told apart by shape alone, the way a monochrome monitor showed everything. Amber #ffb000, brighter #ffc940, dimmer #d08a00 and #a86f00, on black.

STYLE
- Keep each silhouette exact.
- Layers, bottom to top:
  1. bloom: phosphor bloom without filters: the silhouette stroked in #ffb000 at 9 wide / 15% and 6 wide / 30%. It may reach 3 units outside the silhouette.
  2. edge: the silhouette stroked 3 wide in solid #ffb000 under the scanlines (1.5 shows).
  3. scan: the body filled with horizontal scanlines: amber rects 1.4 tall with 0.8 gaps of black, top to bottom, clipped to the silhouette. #ffc940 in the top third, #ffb000 in the middle, #d08a00 at the bottom.
- There are two Shellys with the same cone: draw 09 (the 1985 one) with dimmer #a86f00 scanlines so she reads as the other Shelly next to 15.
- Eyes: dark #2a1500 for everyone.

DRAW: characters 01–12 and 15.
```

To keep each character's colour in this theme, replace the amber tones with
lighter and darker steps of the character's own colour.

## High Limit: casino chips

```
Create a set of SVG icons: a family of small blob characters as casino chips from the high-limit room at 9 p.m.: one machine under a single warm lamp, green baize (#1f5a43), brass trim (#b8893b), ivory reels (#f3ead6), and nothing blinking. Matte enamel in each one's colour, a brass inlay and ivory edge inserts. Quiet and expensive.

STYLE
- Keep each silhouette exact.
- Layers, bottom to top:
  1. rim: the silhouette stroked 3 wide under the body in a deep shade of the character's colour.
  2. enamel: the body colour, matte: a very soft radial gradient, slightly lighter in the upper left. No gloss.
  3. inserts: the edge stripes of a casino chip: ivory #f3ead6 blocks along the inside of the edge, evenly spaced (a dashed ivory stroke 1.8 wide just inside the edge, dashes about 2.5 with 3 gaps, clipped). For 01, 05, 12 and 16, follow only the outer edge.
  4. inlay: a thin brass ring (#b8893b, 1.2 wide) about 4.5 units inside the edge, following the shape. Skip it for 01, 05, 12 and 16.
  5. sheen: a soft warm highlight (#fff3d6 at 25%) on the upper left, from the single lamp.
- Nothing outside the silhouette except the rim.
- Eyes: recommend per character.

DRAW: characters 01–12 and 16.
```

---

## Shared block: Vector format

Paste after any theme marked Vector.

```
FORMAT (strict)
- One SVG file per character: viewBox="0 0 48 48", no width or height attributes, transparent background.
- Start from the character's silhouette path below. The style says whether to keep it exact or how far you may roughen it. Either way, keep each character's overall shape, size and position, so the app's eyes still land on the body.
- Allowed elements only: g, path, ellipse, circle, rect, line, polyline, polygon, defs, linearGradient, radialGradient, stop, clipPath. No filter, mask, pattern, image, text, style or use elements, and no class attributes. Inline attributes only.
- Prefix every id with the character's name in lowercase, plus its number for the two Shellys and two Luckys (e.g. "cal-body", "shelly15-clip").
- Group the layers in the order the style lists them, bottom to top, each as <g data-role="..."> with the layer's name.
- Some silhouettes are several overlapping parts (01 flower, 05 alien, 12 and 16 slot machine). Never stroke those paths where the stroke shows on top, or the overlaps appear as lines. To outline any silhouette, stroke it underneath the body fill at twice the width you want to show.
- No eyes, no mouth, no face, no arms or legs. The app draws the eyes on top: two ovals 5.4 wide and 7.4 tall, centred at x=19 and x=29 on the character's eye line. Keep the area from x=15 to x=33, from eye line − 5 to eye line + 5, free of busy detail so the eyes stay readable.
- Shown at 30–40 CSS pixels (as small as 20). Keep it bold: no line thinner than 1.2 units, at most 40 elements per file, nothing outside the 48×48 box, and nothing outside the silhouette except what the style allows.

DELIVER
- One file per character, named like "03-cal-cloud.svg".
- A preview sheet (4 columns, same order) with the eyes drawn in, in the colour you recommend, so the set can be judged. Eyes in the preview only.
- manifest.json: for each file, the colours used and a recommended eye colour that reads well on it in this style.

CHARACTERS (number, name, shape, colour, eye line, default eye colour, then the silhouette path in a 48×48 box)

01 Daisy, flower, #3fbd4c, eye line 24, default eyes #ffffff
M28.00 24.00a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM24.34 32.84a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM15.50 36.50a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM6.66 32.84a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM3.00 24.00a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM6.66 15.16a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM15.50 11.50a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM24.34 15.16a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM10 24a14 14 0 1 0 28 0a14 14 0 1 0 -28 0Z

02 Kayleigh, water drop, #f0559b, eye line 29, default eyes #ffffff
M24 3C24 3 40 19.5 40 30A16 16 0 0 1 8 30C8 19.5 24 3 24 3Z

03 Cal, cloud, #16aeef, eye line 25, default eyes #ffffff
M13 38C6.5 38 3 33.5 3 29C3 24 7 20.5 11.5 20.5C12.5 13.5 18 9 24.5 9C31.5 9 36.5 14 37 20.5C41.5 21 45 24.5 45 29.5C45 34.5 41 38 36 38Z

04 Mark, jellybean, #6d84b4, eye line 22, default eyes #ffffff
M17 7.5C23.5 4 33 5 38.5 10.5C44 16 44.5 25 41 31.5C37.5 38.5 30 43 22.5 42.5C15.5 42 10.5 37.5 11 32C11.3 29 13.6 27.6 12.6 25C11.6 22.4 7.2 21 7 16.5C6.8 12.3 11 9.5 17 7.5Z

05 Arthur, alien head with antenna, #ff4500, eye line 27.5, default eyes #ffffff
M5.5 28.5a18.5 12.5 0 1 0 37 0a18.5 12.5 0 1 0 -37 0ZM25.9 17.4C26.7 13.6 29 10.9 32.2 9.4L31.2 7.6C27.4 9.4 24.6 12.6 23.6 17.2ZM30 6a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0Z

06 Channing, capsule, #8a4fd8, eye line 24, default eyes #ffffff
M15 12H33A12 12 0 0 1 33 36H15A12 12 0 0 1 15 12Z

07 Grug, rock, #d9662f, eye line 24, default eyes #ffffff
M10 34C6 30 6 22 10 18C12 12 18 8 25 9C31 8 37 11 39 17C43 21 44 28 41 33C38 39 31 42 24 41C17 42 13 39 10 34Z

08 Mortimer, ghost, #b4acd9, eye line 21, default eyes #ffffff
M9 23C9 14 15.7 7 24 7C32.3 7 39 14 39 23V39C39 41 37 42 35.5 40.5L33 38L30.5 40.5C29 42 27 42 25.5 40.5L24 39L22.5 40.5C21 42 19 42 17.5 40.5L15 38L12.5 40.5C11 42 9 41 9 39Z

09 Shelly (1985), cone, #ff2e88, eye line 30, default eyes #2a0016
M24 6C26 6 27.5 7.2 28.6 9L43 36C44.5 39 42.5 42 39 42H9C5.5 42 3.5 39 5 36L19.4 9C20.5 7.2 22 6 24 6Z

10 Carol, egg, #e5383b, eye line 26, default eyes #ffffff
M24 4C33 4 40 17 40 28C40 37 33 44 24 44C15 44 8 37 8 28C8 17 15 4 24 4Z

11 Cora, circle, #c8ff2e, eye line 22, default eyes #1b0638
M24 4a20 20 0 1 1 0 40a20 20 0 1 1 0-40Z

12 Lucky, slot machine with lever, #ffc533, eye line 25, default eyes #3b1d00
M11 21C11 13.5 16.5 9 24 9C31.5 9 37 13.5 37 21V38Q37 43 32 43H16Q11 43 11 38ZM36 27H39.2V13H42V31H36ZM37 9.8a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1 -7.2 0Z

13 Dale, rounded square, #14b3a0, eye line 22, default eyes #ffffff (hidden agent: draw only when the theme asks)
M24 5C38 5 43 10 43 24C43 38 38 43 24 43C10 43 5 38 5 24C5 10 10 5 24 5Z

14 Nick, rounded diamond, #3f5fdb, eye line 23, default eyes #ffffff (hidden agent: draw only when the theme asks)
M20.5 6.5C22.4 4.6 25.6 4.6 27.5 6.5L41.5 20.5C43.4 22.4 43.4 25.6 41.5 27.5L27.5 41.5C25.6 43.4 22.4 43.4 20.5 41.5L6.5 27.5C4.6 25.6 4.6 22.4 6.5 20.5Z

15 Shelly (1989), cone, #f0a020, eye line 30, default eyes #2a1500 (hidden agent: draw only when the theme asks)
M24 6C26 6 27.5 7.2 28.6 9L43 36C44.5 39 42.5 42 39 42H9C5.5 42 3.5 39 5 36L19.4 9C20.5 7.2 22 6 24 6Z

16 Lucky (High Limit), slot machine with lever, #34c38f, eye line 25, default eyes #062a1d (hidden agent: draw only when the theme asks)
M11 21C11 13.5 16.5 9 24 9C31.5 9 37 13.5 37 21V38Q37 43 32 43H16Q11 43 11 38ZM36 27H39.2V13H42V31H36ZM37 9.8a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1 -7.2 0Z
```

## Shared block: Pixel format

Paste after the BBS or mIRC prompt.

```
FORMAT (strict)
- One SVG file per character: viewBox="0 0 24 24", shape-rendering="crispEdges", transparent background.
- Pixel art on a 24×24 grid. The artwork is only 1×1 <rect> elements at whole-number x and y, grouped by colour as <g fill="#rrggbb">. No anti-aliasing, gradients, opacity or other elements.
- Build each shape from the character's silhouette path below. The paths are in a 48×48 box, so halve every coordinate: fill a pixel when its centre falls inside the halved path, then shade it as the style says. Thin parts (05's antenna, 12 and 16's lever) may be thickened to 1 pixel so they survive.
- No eyes, no mouth, no face. The app draws the eyes as two 2×3-pixel blocks at columns 9–10 and 13–14, centred as near as the grid allows on the eye row (the eye line below, halved). Keep columns 7–16, from 3 rows above to 3 rows below the eye row, in one plain tone.
- Shown at 30–40 CSS pixels, about 1.5 screen pixels per art pixel, so keep it readable.

DELIVER
- One file per character, named like "03-cal-cloud.svg".
- A preview sheet (4 columns, same order) with the eyes drawn in, in the colour you recommend, so the set can be judged. Eyes in the preview only.
- manifest.json: for each file, the colours used, the eye row you centred the eyes on, and a recommended eye colour.

CHARACTERS (number, name, shape, colour, eye line in the 48×48 box, default eye colour, then the silhouette path in a 48×48 box)

01 Daisy, flower, #3fbd4c, eye line 24, default eyes #ffffff
M28.00 24.00a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM24.34 32.84a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM15.50 36.50a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM6.66 32.84a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM3.00 24.00a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM6.66 15.16a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM15.50 11.50a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM24.34 15.16a8.5 8.5 0 1 0 17 0a8.5 8.5 0 1 0 -17 0ZM10 24a14 14 0 1 0 28 0a14 14 0 1 0 -28 0Z

02 Kayleigh, water drop, #f0559b, eye line 29, default eyes #ffffff
M24 3C24 3 40 19.5 40 30A16 16 0 0 1 8 30C8 19.5 24 3 24 3Z

03 Cal, cloud, #16aeef, eye line 25, default eyes #ffffff
M13 38C6.5 38 3 33.5 3 29C3 24 7 20.5 11.5 20.5C12.5 13.5 18 9 24.5 9C31.5 9 36.5 14 37 20.5C41.5 21 45 24.5 45 29.5C45 34.5 41 38 36 38Z

04 Mark, jellybean, #6d84b4, eye line 22, default eyes #ffffff
M17 7.5C23.5 4 33 5 38.5 10.5C44 16 44.5 25 41 31.5C37.5 38.5 30 43 22.5 42.5C15.5 42 10.5 37.5 11 32C11.3 29 13.6 27.6 12.6 25C11.6 22.4 7.2 21 7 16.5C6.8 12.3 11 9.5 17 7.5Z

05 Arthur, alien head with antenna, #ff4500, eye line 27.5, default eyes #ffffff
M5.5 28.5a18.5 12.5 0 1 0 37 0a18.5 12.5 0 1 0 -37 0ZM25.9 17.4C26.7 13.6 29 10.9 32.2 9.4L31.2 7.6C27.4 9.4 24.6 12.6 23.6 17.2ZM30 6a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0Z

06 Channing, capsule, #8a4fd8, eye line 24, default eyes #ffffff
M15 12H33A12 12 0 0 1 33 36H15A12 12 0 0 1 15 12Z

07 Grug, rock, #d9662f, eye line 24, default eyes #ffffff
M10 34C6 30 6 22 10 18C12 12 18 8 25 9C31 8 37 11 39 17C43 21 44 28 41 33C38 39 31 42 24 41C17 42 13 39 10 34Z

08 Mortimer, ghost, #b4acd9, eye line 21, default eyes #ffffff
M9 23C9 14 15.7 7 24 7C32.3 7 39 14 39 23V39C39 41 37 42 35.5 40.5L33 38L30.5 40.5C29 42 27 42 25.5 40.5L24 39L22.5 40.5C21 42 19 42 17.5 40.5L15 38L12.5 40.5C11 42 9 41 9 39Z

09 Shelly (1985), cone, #ff2e88, eye line 30, default eyes #2a0016
M24 6C26 6 27.5 7.2 28.6 9L43 36C44.5 39 42.5 42 39 42H9C5.5 42 3.5 39 5 36L19.4 9C20.5 7.2 22 6 24 6Z

10 Carol, egg, #e5383b, eye line 26, default eyes #ffffff
M24 4C33 4 40 17 40 28C40 37 33 44 24 44C15 44 8 37 8 28C8 17 15 4 24 4Z

11 Cora, circle, #c8ff2e, eye line 22, default eyes #1b0638
M24 4a20 20 0 1 1 0 40a20 20 0 1 1 0-40Z

12 Lucky, slot machine with lever, #ffc533, eye line 25, default eyes #3b1d00
M11 21C11 13.5 16.5 9 24 9C31.5 9 37 13.5 37 21V38Q37 43 32 43H16Q11 43 11 38ZM36 27H39.2V13H42V31H36ZM37 9.8a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1 -7.2 0Z

13 Dale, rounded square, #14b3a0, eye line 22, default eyes #ffffff (hidden agent: draw only when the theme asks)
M24 5C38 5 43 10 43 24C43 38 38 43 24 43C10 43 5 38 5 24C5 10 10 5 24 5Z

14 Nick, rounded diamond, #3f5fdb, eye line 23, default eyes #ffffff (hidden agent: draw only when the theme asks)
M20.5 6.5C22.4 4.6 25.6 4.6 27.5 6.5L41.5 20.5C43.4 22.4 43.4 25.6 41.5 27.5L27.5 41.5C25.6 43.4 22.4 43.4 20.5 41.5L6.5 27.5C4.6 25.6 4.6 22.4 6.5 20.5Z

15 Shelly (1989), cone, #f0a020, eye line 30, default eyes #2a1500 (hidden agent: draw only when the theme asks)
M24 6C26 6 27.5 7.2 28.6 9L43 36C44.5 39 42.5 42 39 42H9C5.5 42 3.5 39 5 36L19.4 9C20.5 7.2 22 6 24 6Z

16 Lucky (High Limit), slot machine with lever, #34c38f, eye line 25, default eyes #062a1d (hidden agent: draw only when the theme asks)
M11 21C11 13.5 16.5 9 24 9C31.5 9 37 13.5 37 21V38Q37 43 32 43H16Q11 43 11 38ZM36 27H39.2V13H42V31H36ZM37 9.8a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1 -7.2 0Z
```
