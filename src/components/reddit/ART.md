# reddit costume art: gpt-image prompts

All slots are filled: the generated pictures live in `public/reddit/` as
WebP and are listed in `FILES` at the top of `src/components/reddit/art.tsx`.
Every slot also has a drawn SVG fallback, used when its line is removed. The
wallpaper is used by the reddit scene in `src/components/Scenes.tsx`.

The look: reddit in June 2009. A white page, the pale blue header
(#cee3f8, edged #5f99cf), link blue (#369), orangered (#ff4500) up arrows and
periwinkle (#9494ff) down arrows, inside Firefox 3 on Ubuntu 9.04's warm brown
"Human" theme. Arthur is the orangered (#ff4500) gpty alien: a wide, smooth
head with one antenna and a ball on top, two big white oval eyes, no mouth, no
limbs. He is not reddit's mascot and must never look like it (no white face,
no ears, no body, no black outline): he's a flat orangered blob with eyes.

To replace one:

1. Generate it with the prompt below (sizes and settings are gpt-image's).
2. Resize and convert it (the wallpaper 1536px wide, the ad 600×500, the
   cut-out 512px with alpha), for example
   `sips -Z 1536 in.png --out s.png && cwebp -q 90 s.png -o out.webp`, and
   for the cut-out `cwebp -q 92 -alpha_q 100 s.png -o out.webp`.
3. Save it over the file named below in `public/reddit/`.

---

## Desktop wallpaper: `wallpaper.webp`

1536×1024 (or larger), quality high. The site background behind the window,
full-bleed with a slow push-in. The site's agent list sits on the left third
in white text, so that side must stay dark and calm; the window covers the
middle, so the best part should sit low and to the right. Replaces the drawn
night town with rising upvote lanterns.

A redditor's basement at 2am: where Arthur is right now, refreshing.

> A hyperreal, cinematic photograph of a cozy, cluttered basement at 2am in
> June 2009, shot from a low angle with a long lens and shallow depth of
> field. The only light is the cold blue glow of a chunky CRT monitor on a
> cheap desk in the lower right, plus a string of warm orange Christmas
> lights stapled along a wood-paneled wall, and a faint orangered glow from a
> lava lamp. On the desk: a pyramid of empty soda cans stacked with real
> care, a greasy open pizza box with one slice left, a tangle of beige
> cables, a wireless router with green blinking lights, a mechanical keyboard
> with worn keys, a mug full of pens, a dusty Rubik's cube, and a small
> orangered plush toy shaped like a wide round blob with one antenna and big
> white eyes, sitting on top of the monitor. Behind the desk: a sagging plaid
> futon with a crumpled blanket, a mini fridge with magnets, a stack of
> programming books, a beige computer tower with its side panel off, a poster
> of a stick-figure comic pinned crooked to the wall (too blurry to read), and
> a high basement window showing a sliver of deep navy night and a pale blue
> moon. A few orangered sticky notes shaped like upward arrows are stuck to
> the monitor bezel. Concrete floor, a worn rug, haze in the air catching the
> monitor light. Warm and lived-in, funny but affectionate, never gross. The
> left third is in deep shadow: a dark wall and the edge of the futon, calm,
> with almost no detail. 1536×1024, landscape. No readable text, no logos,
> no people, no watermark.

## Sidebar ad: `ad.webp`

1200×1000, then resized to 600×500 (it's shown at 300×250 in the sidebar,
under "advertisement"). Replaces the drawn T-shirt house ad.

> A crisp, slightly retro 2009 web banner ad, re-imagined as a modern
> product photo: a heather-grey cotton T-shirt laid flat on a pale blue
> (#eaf3fc) seamless background, soft studio light from the upper left, real
> fabric texture and creases. Screen-printed on the chest in a chunky
> lowercase sans-serif, black ink: "ask me about my karma", with a small
> orangered upward arrow above the words. To the right of the shirt, in
> clean bold blue (#336699) type: "karma you can wear.", and below it a
> rounded orangered button that reads "$14.99 »". Lots of air, centered
> composition, cheerful and a little smug. Exactly that text and no other
> text, no logos, no watermark.

## Error picture: `broke.webp`

1024×1024, **background: transparent**, quality high. Shown at 64px beside
"you broke reddit." when a reply fails, so keep the silhouette bold and the
idea readable that small. Replaces the drawn shaking gpty.

> A hyperreal 3D render of a cute, smooth, glossy orangered (#ff4500)
> character: a wide rounded head with no body, one thin antenna with a small
> ball on top, two big white oval eyes with small dark pupils looking dazed
> and slightly crossed, no mouth, no limbs. Its antenna is bent sideways
> with a little band-aid wrapped around the middle, and three tiny cartoon
> stars circle above it. Soft studio light from the upper left, a gentle
> specular highlight on the top of the head. Funny, sheepish, endearing.
> Centered with generous padding, transparent background. No text, no logos.

---

## Vector pieces (SVG prompts)

These are drawn in code and stay vector: they're crisp at every size and
change color with state. They live in `art.tsx` (and the scene in
`Scenes.tsx`). If you want to redraw any of them with an SVG generator or by
hand, here are the briefs. Keep the viewBox, keep gradients' ids unique per
instance (the components make them with `useId`), and no text unless asked.

**Favicon** (`Favicon`, viewBox `2 2 44 44`, shown at 16px in the tab, the
address bar and the bookmarks bar):

> A 16px favicon in flat vector: Arthur's head, a wide orangered (#ff4500)
> oval with a thin antenna rising to the right ending in a round ball, a
> darker orangered (#c23400) 1.5px outline, and two tall white oval eyes
> side by side in the middle. No mouth, no ears, no body. Must read at 16px.

**Vote arrows** (`VoteArrow`, viewBox `0 0 15 14`, shown at 15×14px; the
down arrow is the same drawing rotated 180°):

> A 15×14px upvote arrow in the style of late-2000s web buttons: a fat triangular
> head on a short square stalk, about half the head's width, with slightly
> rounded joins. Three states: unvoted light grey (#c2c2c2 to #d9d9d9) with
> a #ababab outline; upvoted orangered (#ff9a6e at the top to #ff4500) with
> a #d13a00 outline; downvoted periwinkle (#c4c4ff to #8a8af5) with a #6f6fe0
> outline. A thin white highlight along the upper-left edge of the head.

**Mail envelope** (`Envelope`, viewBox `0 0 16 11`, shown at 16×11px in the
header, bigger in the scene):

> A 16×11px envelope icon with a slightly rounded rectangle body and a V
> flap line. Read: light grey gradient (#f4f4f4 to #d6d6d6), #9a9a9a outline
> and flap. Unread ("orangered"): orangered gradient (#ff7a45 to #ff4500),
> #c23400 outline, white flap.

**Firefox 3 toolbar icons on Linux** (`NavIcon`, viewBox `0 0 24 24`, shown
at 22–26px; each has an enabled and a greyed-out state):

> A set of five 24px toolbar icons in the Tango Desktop Project style: soft
> top-to-bottom gradients, 1px darker outlines, a thin white inner highlight,
> gentle rounded corners. Back: a fat left-pointing arrow in sky blue (#a9cdf2
> to #4f86c6, outline #204a87). Forward: the same, pointing right. Reload: a
> circular arrow, same blue. Stop: a red octagon (#ff8a8a to #a40000, outline
> #820000) with a bold white X. Home: a small house with cream walls, a red
> brown roof stroke, a wooden door and one blue window. Disabled versions
> are the same shapes in flat greys.

**Window icon** (`Globe`, viewBox `0 0 16 16`): a generic blue web browser
globe, glossy, with faint white meridians. Not any real browser's logo.

**Window buttons** (CSS, `.rd-wm` in `reddit.css`): Ubuntu 9.04 Human-style
title bar buttons, 21×18px rounded rectangles in a tan-to-brown gloss with
white minimize, maximize and close glyphs; the close button glossy orange
(#f6a970 to #d65d1f).

**Scene lantern** (`Lantern`, viewBox `-4 -4 23 22`, 12–42px): the vote
arrow as a glowing paper lantern, filled with a radial glow from pale yellow
in the middle to orangered at the edges, a faint halo around it and two
faint rib lines across the stalk. A periwinkle version sinks upside down.

**House ad fallback** (`AdFallback`, viewBox `0 0 300 250`): the T-shirt ad
above as flat vector, the shirt grey with "ask me about my karma" and a
small orangered arrow, the blue "karma you can wear." pitch and the
orangered "$14.99 »" button.

**Night town** (drawn in `Scenes.tsx`, function `Upvotes`): two rows of
flat navy building silhouettes along the bottom third with a few warm and
monitor-blue lit windows, the odd rooftop water tank and a radio mast with
a blinking orangered light, under rising lanterns, a soft pale-blue moon and
stars.

## Drawn in CSS (no prompt needed)

- Firefox's tab throbber, the striped orange progress bar in the status bar,
  the Human title bar, menus, address bar, search box and native-looking
  buttons.
- The header's live gpty alien is the same `Gpty` component as the sidebar,
  so it blinks, watches your pointer and hops while Arthur types.
