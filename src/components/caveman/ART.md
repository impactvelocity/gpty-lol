# GrugPT costume art: gpt-image prompts

All four slots are filled: the generated pictures live in `public/caveman/`
as WebP and are listed in `FILES` at the top of
`src/components/caveman/art.tsx`. Every slot also has a drawn SVG or CSS
fallback, used when its line is removed. The wallpaper is used by the caveman
scene in `src/components/Scenes.tsx`.

The look: a modern AI chat app painted on a cave wall at red twilight. Red
and yellow ochre, charcoal and bone on warm, dark rock; prehistoric paintings
with a dry, sprayed, speckled texture; and the grainy flat-illustration light
of a risograph print. Dark and warm, clean and a little playful, never
cartoonish. Grug is the ochre rock gpty with two cream eyes.

To add one:

1. Generate it with the prompt below (sizes and settings are gpt-image's).
2. Resize and convert it (the wallpaper and the wall 1536px wide, the frieze
   1536×512 with alpha, the hand 512×512 with alpha), for example
   `sips -Z 1536 in.png --out s.png && cwebp -q 88 s.png -o out.webp`, or
   `cwebp -q 92 -alpha_q 100` for the cut-outs.
3. Save it over the file named below in `public/caveman/`.

Cut-outs often come back with a pale halo where the white background was
matted out. The hand had one: it was cleaned by keeping only the red pigment
(alpha follows how red each pixel is), so check any new cut-out on dark rock.

---

## Desktop wallpaper: `wallpaper.webp`

1536×1024 (or larger), quality high. The site background behind the GrugPT
window, full-bleed with a slow push-in. The site's agent list sits on the left
third in white text, so that side must stay dark and calm. The window covers
the middle, so the best part should sit low and to the right. Replaces the
drawn cave mouth, sun and herd.

> A grainy, painterly flat illustration in the style of a modern risograph
> print: the view from deep inside a cave, looking out through its jagged
> mouth at a wide valley at red twilight. The sky fades from deep plum and
> wine red at the top to burnt orange and glowing amber at the horizon, with
> the first few pale stars. A large, soft, red-orange sun sinks behind
> flat-topped mesas in the right half. Far off, a small herd of woolly
> mammoths walks in silhouette along a low ridge, tiny against the glow. The
> cave frames everything: the left third is the cave's inner wall in deep
> shadow, near-black brown rock with a few faint red-ochre handprints and a
> small painted deer, lit by the warm glow of a campfire just out of frame at
> the bottom left; jagged rock and short stalactites along the top edge, a
> sliver of dark wall on the right. Simple, bold shapes, a limited palette
> (plum, wine red, burnt orange, amber, ochre, near-black brown), soft
> gradients and fine film grain throughout. Calm, warm, a little mysterious,
> not cartoonish. The left third stays dark and quiet with no strong shapes.
> No text, no people, no logos, no watermark.

## The wall: `wall.webp`

1536×1024, quality high. The rock behind the whole conversation, full-bleed
inside the window under the text, Grug's paintings and the torchlight. It must
be dark, even and low-contrast. Replaces the drawn rock texture.

> A flat, straight-on photograph of a smooth cave wall, for use as a
> background behind text: warm dark rock in deep reddish brown and burgundy
> (roughly #2a120f to #4a2018), gently uneven limestone with soft bumps, faint
> mineral streaks and a few shallow hairline cracks. Lit softly from below by
> firelight, so the bottom edge glows slightly warmer orange and the top falls
> away into darkness. Very faint traces of old red ochre pigment and a few
> ghostly painted dots, barely visible. Even and low-contrast: no bright
> highlights, no deep holes, nothing in the middle that competes with text.
> Fine grain. No animals, no handprints, no text, no people, no watermark.

## The frieze: `frieze.webp`

1536×512 (3:1), quality high, **background: transparent**. Painted across the
empty wall above "What Grug help with?", shown about 540px wide on dark rock.
Replaces the drawn herd (which runs in place; the picture stays still).

> A prehistoric cave-painting frieze on a transparent background, painted in
> red ochre and yellow ochre pigment with a dry, speckled, sprayed texture
> like real ancient cave paintings. A row of animals running from left to
> right: two leaping deer with thin legs and branched antlers, a woolly
> mammoth with curved tusks, a heavy bison with a big shoulder hump, and one
> more running deer. On the far right, a sun made of concentric rings and a
> spiral, with short rays all around. A painted line of irregular round dots
> runs along the top edge and another along the bottom, like a border, with a
> few dots scattered between the animals. Flat silhouettes with hand-made
> edges: bodies filled with red ochre, glowing warm yellow ochre in the
> middle, legs thin and brushy. Elegant, evenly spaced, balanced, not
> cartoonish. Only the paint on a transparent background: no rock, no
> texture behind it, no text.

## Your hand: `hand.webp`

1024×1024, quality high, **background: transparent**. A negative hand
stencil: your picture in the top bar (36px), the stencils hidden in the
rock, and behind Grug in the site's sidebar.
Keep the hand big and the spray cloud round.

> A prehistoric negative hand stencil on a transparent background: the shape
> of an open left hand with fingers spread, left completely bare, surrounded by
> a round cloud of red ochre pigment that was blown around it through a reed.
> The pigment is dense deep red close to the hand and fades out into fine,
> speckled spray at the edges, with tiny droplets and a slightly uneven edge,
> exactly like the hand stencils in ancient caves. Centered, the spray cloud
> about 90% of the frame. The hand shape itself is fully transparent (cut out,
> no fill), and so is everything outside the spray. No rock, no text.

---

## Drawn (SVG, no prompt needed)

These are vector and stay vector. They live in `art.tsx` and `pictos.tsx`:

- **24 pictograms** (`pictos.tsx`): mammoth, deer, bison, wolf, fish, bird,
  snake, fire, sun, moon, star, water, tree, flower, berry, hand, eye, man,
  tribe, spear, meat, rock, shiny (rock) and cave. Grug writes them as codes,
  like (mammoth); a line of only pictures is painted large, as a mural.
  They're also the gifts (berry, meat, fish, shiny, flower, fire), the
  suggestions, the model picker and the + menu.
- **Marks**: GrugPT's spiral sun, the flint-arrowhead send button, and the
  brushed icons (the +, the model picker's checks and the rest), and the
  painted waves over the writing band.
- **The paint**: one SVG filter (`CaveDefs`) that roughens edges and leaves
  small gaps where the pigment didn't take; the rock bumps and grain are SVG
  noise in `caveman.css`.
- **Old paintings in the rock** (`OldPaintings`): handprints, a stencil, a
  herd, a hunter, a tally of moons, revealed by the torch at your pointer.
- **Fallbacks for the pictures above**: the drawn frieze (`Frieze`), the drawn
  hand stencil (`HandStencil`), the SVG rock and the drawn twilight cave scene
  (`Cave` in `Scenes.tsx`).
