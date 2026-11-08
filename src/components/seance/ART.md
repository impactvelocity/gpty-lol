# Mortimer's séance (1888): image-model prompts

Everything in this costume is drawn in SVG and CSS, so it works with no
pictures at all. The slots below let generated pictures replace the drawn
versions for a final polish. Each slot is a line in `FILES` at the top of
`src/components/seance/art.tsx`, commented out until its file exists in
`public/seance/`. The wallpaper is used by the séance scene in
`src/components/Scenes.tsx`.

The look follows Lottery Clock's Ouija theme: there is no window, just a
dark room. A spirit board engraved in antique gold (#C9A55A) and bone
(#ECE3CF) floats over warm charcoal (#26221E fading to #0D0B0A), between
small clusters of black candles on gold saucers; anything the spirits touch
glows ember (#FF6A2B, highlights #FFE2B8), and the whole room is seen
through old film (grain, dust, specks, scratches, a warm light leak). Fine,
even engraved line work; occult motifs (the all-seeing eye, sun and moon
faces, four-pointed stars, crescents, moths). Elegant and eerie, never gory,
never cartoonish. Type is IM Fell English, so any lettering in a picture
should look like 1880s printing.

To add one:

1. Generate it with the prompt below (sizes and settings are gpt-image's).
2. Resize and convert it, for example
   `sips -Z 1536 in.png --out s.png && cwebp -q 88 s.png -o out.webp`, or
   `cwebp -q 92 -alpha_q 100` for the cut-outs.
3. Save it as the file named below in `public/seance/` and uncomment its
   line in `FILES`.

Cut-outs often come back with a pale halo where the background was matted
out. On this costume the halo shows badly against charcoal, so check each
one on #110E0C and, if needed, rebuild the alpha from brightness (bone and
gold lines opaque, dark transparent).

---

## Desktop wallpaper: `wallpaper.webp`

1536×1024 (or larger), quality high. The room itself: it fills the whole
site behind the floating board, the words and the agent list, with a slow
push-in. The agent list sits on the left third in white text and the board
floats in the middle, so keep the left third and the center dark and calm,
with the interest around the edges. Replaces the drawn room (stars, letter
ring, moon, film).

> A dark, atmospheric illustration in the style of a Victorian engraving
> printed in antique gold and bone ink on warm charcoal paper: the inside of
> a séance parlour at midnight, almost entirely in shadow. Around the edges,
> barely lit: heavy drapes, the curve of a high-backed chair, a tall arched
> window at the top right with a sleeping crescent moon looking in, small
> four-pointed stars engraved in gold scattered across the dark. A huge,
> faint ring of the letters A to Z and the numerals, like the alphabet of a
> talking board, turns in the air at the lower left. Wisps of pale smoke
> curl up from below, and a faint ember glow smoulders up from the bottom
> edge as if from candles out of frame. The center is empty, soft darkness.
> Fine cross-hatching, mottled like an old handled print, with film grain,
> dust specks and faint vertical scratches. Palette: warm charcoal (#26221E
> to #0D0B0A), antique gold (#C9A55A), bone (#ECE3CF), a little ember
> (#FF6A2B). No people, no table, no board in the center, no text, no
> logos, no watermark.

## The sun (YES): `sun.webp`

1024×1024, quality high, **background: transparent**. Sits in the top left
corner of the board beside YES, about 120px wide. Replaces the drawn sun.

> A sun with a serene sleeping face, drawn as fine line art in the style of
> an antique occult engraving: a round face with closed eyes and long
> lashes, a long nose and a small calm smile, inside a double circle, the
> inner one dotted. Around it, seventy-two very fine straight rays,
> alternating long and short, with every sixth reaching furthest. The face
> lines are bone-white (#ECE3CF), the rays antique gold (#C9A55A), with
> delicate engraver's hatching. Centered, filling about 90% of the frame.
> Only the line art on a transparent background: no fill behind the face,
> no paper, no text.

## The moon (NO): `moon.webp`

1024×1024, quality high, **background: transparent**. Sits in the top right
corner of the board beside NO, about 170px wide. Replaces the drawn moon.

> A crescent moon with a sleeping profile face, drawn as fine line art in
> the style of an antique engraving: the crescent opens to the right and
> its inner edge is a woman's serene profile with a closed eye, long
> lashes, a delicate nose and lips. The back of the moon is shaded with
> curved engraver's hatching. Two small four-pointed stars and a few dots
> beside it. Bone-white line (#ECE3CF) with the hatching and stars in
> antique gold (#C9A55A). Centered, filling about 90% of the frame. Only
> the line art on a transparent background: no fill, no paper, no text.

## The all-seeing eye: `eye.webp`

1536×1024, quality high, **background: transparent**. Sits at the top
center of the board, about 220×150px. Note: the drawn eye follows your
pointer and watches the planchette; a picture can't, so only use this if
it's worth losing that.

> An all-seeing eye in the style of an antique occult engraving: a single
> wide almond-shaped eye looking straight ahead, with a detailed iris of
> fine radiating lines, a dark pupil with a small highlight, and upper
> lashes. A fan of thin straight rays bursts upward from behind the eye in
> a half circle, alternating long and short. Small four-pointed sparkles
> float on either side. Iris and rays in antique gold (#C9A55A), eye outline
> and lashes in bone-white (#ECE3CF). Centered, the eye about 60% of the
> width. Only the line art on a transparent background: no paper, no text.

---

## For vector work (trace to SVG, no slot)

These replace drawings in `art.tsx` and `Board.tsx`. Generate them as
images, trace them to SVG (for example with vectorizer.ai or Illustrator's
Image Trace), clean up the paths and swap them in.

### Icon set

Replaces the 16 `ICONS` in `art.tsx` (24×24, drawn with a 1.45 stroke).

> A sheet of 16 matching occult icons in a 4 by 4 grid, each in its own
> square cell, drawn as fine monoline line art in antique gold (#C9A55A) on
> warm charcoal (#110E0C), in the style of Victorian engraved ornaments
> simplified to a modern icon set: consistent 1.5px stroke weight, rounded
> line ends, no fills, no shading, centered with even padding. The icons:
> an open eye with lashes, a top hat, a lit candle, a heart, a quill pen, a
> knuckle rapping on a table with three small impact lines, a crescent
> moon, a four-pointed star, a skull, a hand bell, an arched door, a ledger
> book, a heart-shaped planchette with a round window, a moth with open
> wings, an hourglass, a raven. Clean, legible at small sizes, no text.

### The planchette

Replaces `PLANCHETTE` and `PlanchetteBody` in `art.tsx`. The board puts a
glass lens (radius 15 in a 94×113 shape) at 0,0, so the round window must
sit on the vertical center line about 58% of the way down from the tip.

> A talking-board planchette seen from directly above, drawn as fine line
> art in the style of an antique occult engraving: a heart shape pointing
> straight up, with a double outline, rounded lobes at the bottom and a
> small notch between them. In the middle, an open almond-shaped eye whose
> iris is a round glass window. A fan of short rays above the eye, a small
> crescent moon near the tip, two tiny four-pointed stars at the lower
> lobes and a dot between them. Outline in bone-white (#ECE3CF), inner
> dotted outline, rays and crescent in antique gold (#C9A55A), the body
> like smoked glass, on warm charcoal (#110E0C). Symmetrical, centered,
> filling 85% of the frame. No text.

### Candles and moths

Replaces `CandleCluster` and `Moth` in `art.tsx`. The flames, their glow
and the smoke are animated in code, so trace the candles unlit and keep
each wick's tip clear.

> Two small clusters of three unlit pillar candles each, drawn as fine line
> art in the style of an antique occult engraving: black candles of uneven
> heights with melted lips and a drip down the front, each standing on a
> shallow gold saucer, short black wicks, no flames. Beside them, three
> line-art moths with open wings in different poses. Candle outlines and
> saucers in antique gold (#C9A55A), the moths in bone (#ECE3CF), on warm
> charcoal (#110E0C), laid out separately with space between them. No
> smoke, no glow, no text.

### Board ornaments

Pieces for the board in `Board.tsx`: the frame's corners, the brackets
round YES, NO and GOODBYE, and the stars.

> A set of matching ornaments for a Victorian talking board, drawn as fine
> line art in antique gold (#C9A55A) on warm charcoal (#110E0C), in the
> style of an antique occult engraving, laid out separately with space
> between them: a frame corner made of two parallel rules with a concave
> quarter-circle notch cut into the corner and a four-pointed star sitting
> in the notch, a set of four L-shaped corner brackets, a row of
> four-pointed stars from tiny to large, a pair of open hands reaching up,
> a row of moon phases from new to full, and a short divider of a crescent,
> a four-pointed star and a crescent facing each other. Even line weight,
> symmetrical, no text.

### Wordmark (optional)

For a share card or a title. Shown on its own, not wired into the window.

> The word "MORTIMER" in tall, condensed Victorian display capitals with
> small spurs and ball terminals, like 1880s wood type, printed in bone
> white on solid black and heavily distressed: worn, pitted letterforms,
> ink specks, dust and fine scratches, like an old film title card.
> Centered, with generous black space around it. Nothing else in the
> frame.

---

## Drawn (SVG, no prompt needed)

These stay vector. They live in `art.tsx` and `Board.tsx`:

- **The board**: two arcs of letters, the numerals, YES, NO and GOODBYE in
  corner brackets, a double gold rule with a star in each concave notch, a
  faint sunburst and dotted arcs. Every letter has a known spot so the
  planchette can travel; a letter it reaches flares ember.
- **The planchette**: smoked glass, a heart with an eye whose iris is a
  lens; whatever is under it is shown magnified (a clipped copy of the
  letters).
- **The eye at the top**: follows your pointer and watches the planchette
  while it spells; it blinks.
- **Candles and moths** (`CandleCluster`, `Moth`): three candles a side on
  gold saucers, with flames that flare while he spells, pools of light,
  smoke once they're snuffed, and a moth circling each cluster.
- **Floating**: the board levitates over its own shadow; the words, the
  suggestions and your slip each bob on their own slow breath; embers rise
  while he spells.
- **Ink and film**: two SVG filters (`SeanceDefs`) that roughen line edges,
  and `FilmFX`: moving grain, dust, flashing specks, skipping scratches, a
  running line and a warm light leak.
