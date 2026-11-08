# WorkshopChat (Carol) costume art: gpt-image prompts

All six slots are filled: the generated pictures live in `public/elf/` as WebP
and are listed in `FILES` at the top of `src/components/elf/art.tsx`. Every slot
also has a drawn SVG or CSS fallback, used when its line is removed. The
wallpaper is used by the North Pole scene in `src/components/Scenes.tsx`.

The look: a cozy, hand-made holiday card. Flat gouache and colored-pencil
illustration with a dry, grainy, risograph-like texture, small cream line
details (running stitches, zigzags, dots, stripes) and soft, slightly wobbly
edges. A limited palette: deep pine green (#2b4a2f), cream (#f8f0e1), holly red
(#c8372d), sage green (#8fb07c), mustard gold (#e2ae4a), soft pink (#f3b7ad),
with a touch of teal (#5aaea2) and gingerbread tan (#c98d52). Warm and
charming, like a children's picture book; never glossy, 3D or photographic.
Carol is the red egg-shaped gpty in a pine-green elf hat with a pink zigzag cuff.

To replace one:

1. Generate it with the prompt below (sizes and settings are gpt-image's).
2. Resize and convert it, for example:
   - wallpaper: `sips -Z 1536 in.png --out s.png && cwebp -q 86 s.png -o public/elf/wallpaper.webp`
   - garland: `sips -c 512 1536 in.png --out s.png && cwebp -q 90 -alpha_q 100 s.png -o public/elf/hero.webp`
     (crops the middle 1536×512 band), then trim the empty transparent rows
     above and below the doodles, keeping about 20px of air. The current one
     is 1536×298, about 5:1 like the drawn garland, so it fills the same space.
   - Carol and the stickers: `sips -Z 256 in.png --out s.png && cwebp -q 90 -alpha_q 100 s.png -o public/elf/<name>.webp`
3. Save it over the file named below in `public/elf/` (and make sure its line
   is in `FILES` in `art.tsx`).

The cut-outs sit on deep pine green, so check each one on a dark green
background for a pale halo around the edge.

---

## Desktop wallpaper: `wallpaper.webp`

1536×1024, quality high. The site background behind Carol's window, full-bleed
with a slow push-in, and snow falls over it. The site's agent list sits on the
left third in white text, so that side must stay dark and calm. The window
covers the middle, so the best part should sit low and to the right. Replaces
the drawn aurora, hills and cabin.

> A cozy, grainy hand-drawn gouache illustration in the style of a modern
> children's picture book and a risograph-printed holiday card: the North Pole
> at night. Low on the right, Santa's workshop: a long, crooked timber building
> with a steep snow-heavy roof, warm golden light glowing from many small
> windows, a big wreath with a red bow over the door, a string of colored
> lights along the eaves and a thin curl of smoke from a brick chimney. A few
> smaller cottages and snow-covered pine trees around it, a wooden sign post,
> and a conveyor of tiny wrapped presents running from a side door to a red
> sleigh waiting in the snow. Rolling snowy hills in soft blue-white, lit
> warmly near the windows. Above, a deep midnight-blue sky fading to dark teal
> at the horizon, with a soft green-and-teal aurora, small cream stars and
> gentle falling snow. Limited palette: midnight blue, deep pine green, cream,
> holly red, mustard gold, soft pink and sage; flat shapes with dry-brush
> grain and cream line details. Calm, warm, magical, not busy. The left third
> stays dark night sky and quiet snowy hill with no buildings or strong
> shapes. No text, no people, no Santa, no logos, no watermark.

## The garland: `hero.webp`

1536×1024, quality high, **background: transparent**, then crop to the middle
1536×512 band (step 2). Hung across the empty bench above "What are we
wrapping tonight?", shown up to 600px wide on deep pine green. Replaces the
drawn garland of doodles.

> A single row of cozy Christmas doodles on a transparent background, arranged
> in a gentle, slightly smiling arc across the middle third of the image, with
> nothing above or below it: a pine sprig, a red-and-cream candy cane, a
> gingerbread man with white icing, a red bauble with a cream zigzag band, a
> red present with a gold ribbon and bow (the largest, in the center), a
> mustard-gold folded paper star, a green mug of cocoa with marshmallows and
> steam, a pink knitted mitten with a cream cuff and little red crosses, a
> holly sprig with red berries, and a cream snowflake. Each item is tilted a
> little and evenly spaced. Hand-drawn gouache and colored-pencil style with a
> dry, grainy texture, flat shapes, soft wobbly edges and fine cream line
> details (stitches, zigzags, dots), like a cozy holiday card. Limited palette:
> holly red, cream, sage green, mustard gold, soft pink, gingerbread tan. The
> doodles must read on a dark green background: no white outlines, no
> drop shadows, no background, no text.

## Carol: `carol.webp`

1024×1024, quality high. Carol's picture: the top bar (40px), beside each of
her messages (34px) and in the site's sidebar (34px), always as a circle.
Keep it bold and centered. Note: once it's in, it replaces the live gpty with
the hat (the one whose eyes follow your pointer and hops while she types),
the same trade the Slack costume makes.

> A cute character portrait in a soft, painterly children's-book style
> (digital gouache with visible grain and gentle texture, like a character
> sheet for a cozy Christmas game): a round, red (#e5383b) egg-shaped little
> creature with two tall, glossy white oval eyes with small dark pupils, no
> mouth, no arms or legs. She wears a pine-green felt elf hat that flops over
> to one side, with a soft pink zigzag cuff, a running cream stitch and a tiny
> gold jingle bell at the tip, and a curl of red ribbon and a strip of tape
> stuck to her side, as if she just stepped away from wrapping. Warm, rosy
> rim light, cheerful and a little frazzled. Plain background of deep pine
> green felt (#2b4a2f) with a faint lighter-green doodle of a star and a
> snowflake. Square, centered, the character fills about 75% of the frame. No
> text, no watermark.

## Stickers

Used in the + menu (on a pine-green tile), the little notes in the chat ("You
threw a snowball at Carol") and the big moment when one lands (about 120px).
Each replaces the drawn doodle of the same name.

### `cocoa.webp`

1024×1024, quality high, **background: transparent**.

> A single cozy hand-drawn sticker of a mug of hot cocoa on a transparent
> background: a sage-green enamel mug with a cream zigzag stitch band and a
> rounded handle, filled to the brim with marshmallows, three soft curls of
> cream steam rising from it. Hand-drawn gouache and colored-pencil style with
> a dry, grainy texture, flat shapes and soft wobbly edges, like a cozy
> holiday card. Limited palette: sage green, cream, cocoa brown, a touch of
> holly red. Centered, filling about 80% of the frame. No outline, no drop
> shadow, no background, no text.

### `snowball.webp`

1024×1024, quality high, **background: transparent**.

> A single hand-drawn sticker of a freshly packed snowball on a transparent
> background: round but a little lumpy, with crumbly packed-snow texture,
> soft pale blue-grey shading on the lower right, a few loose flecks of snow
> falling off it and two tiny sparkles. Hand-drawn gouache and colored-pencil
> style with a dry, grainy texture and soft edges, like a cozy holiday card.
> Palette: snow white, pale blue-grey, a hint of cream. Centered, filling
> about 75% of the frame. No outline, no drop shadow, no background, no text.

### `bell.webp`

1024×1024, quality high, **background: transparent**.

> A single cozy hand-drawn sticker of a mustard-gold handbell on a transparent
> background, the kind on a workbench to call someone over: a classic bell
> shape with a darker gold rim and a round clapper peeking out, a soft cream
> highlight down one side, and a red velvet bow tied at the top with a sprig
> of holly. Hand-drawn gouache and colored-pencil style with a dry, grainy
> texture, flat shapes and soft wobbly edges, like a cozy holiday card.
> Limited palette: mustard gold, holly red, sage green, cream. Centered,
> upright, filling about 80% of the frame. No outline, no drop shadow, no
> background, no text.

---

## Drawn (SVG, no prompt needed)

These are vector and stay vector. They live in `art.tsx`:

- **14 doodles**: candy cane, star, bauble, holly, mitten, present, cocoa,
  snowflake, gingerbread man, bell, tree, stocking, pine sprig and snowball,
  with one SVG filter (`ElfDefs`) for the gouache wobble and grain. They make
  the wrapping-paper print (tone-on-tone on the felt), the garland, the
  gift-tag suggestions and the fallbacks for the stickers above.
- **Carol's elf hat** (`ElfHat`), worn over her gpty so it hops and ponders
  with her.
- **The presents** on the conveyor (`Present`), the **string lights**, the
  **snowball splat** and the line icons.
- **Fallbacks for the pictures above**: the drawn garland (`Frieze`), Carol's
  gpty with the hat (`CarolFace`), the doodles, and the drawn North Pole scene
  (`NorthPole` in `Scenes.tsx`).
