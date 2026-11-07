# Facebook costume art: gpt-image prompts

The costume is complete without any of these: every slot has a drawn SVG
fallback in `src/components/facebook/art.tsx`. The generated pictures make
it look like the MSN and Skype windows: very familiar at a glance, hyperreal
and slightly surreal up close.

The look: Facebook in the summer of 2008. Facebook blue (#3b5998), pale blue
panels, harsh point-and-shoot flash photos, thrown sheep. Mark is the
periwinkle (#6d84b4) jellybean gpty with big white eyes.

To add one:

1. Generate it with the prompt below (sizes and settings are gpt-image's).
2. Resize and convert it (pictures 512×512, photos 512×384, the sheep 512px
   and the hand 1024px wide with alpha, wide pictures 1536px wide), for example
   `sips -Z 512 in.png --out s.png && cwebp -q 92 -alpha_q 100 s.png -o out.webp`.
3. Save it in `public/facebook/` and uncomment its line in `FILES` at the top
   of `src/components/facebook/art.tsx`.

---

## Desktop wallpaper: `wallpaper.webp`

1536×1024 (or larger), quality high. The site background behind the window,
shown full-bleed with a slow push-in by the Facebook scene in
`src/components/Scenes.tsx`. The sidebar sits on its left third with white
text, so that side must stay darker and calm. Replaces the drawn sky of
drifting sheep.

> A hyperreal, dreamlike photograph of a deep, saturated cornflower-blue
> summer sky (close to #3b5998 at the top, fading to pale periwinkle near the
> horizon) where every cloud is a fluffy white sheep: dozens of plump,
> woolly sheep floating at different distances like cumulus clouds, legs
> tucked in, a few tumbling mid-air as if they've just been thrown, all
> rim-lit by a low golden sun from the right. Below, a gentle rolling hill of
> vivid green pasture in the lower fifth, crisp blades of grass, one tiny
> wooden fence. Soft volumetric light, shallow depth of field on the nearest
> sheep, modern full-frame camera, ultra-detailed, whimsical but calm. The
> left third is darker, empty blue sky with only two or three tiny, distant
> sheep. No text, no logos, no UI, no people, no watermark.

## Chat background: `backdrop.webp`

1536×1024, quality high. Shown behind the chat history at 14% opacity, so it
must be very light and low-contrast.

> A very soft, high-key, low-contrast background for behind chat text: almost
> entirely white and the palest periwinkle blue. Out-of-focus tufts of white
> wool drift across it like clouds, with one blurry, friendly sheep's face
> peeking in from the lower right corner. Gentle, airy, dreamlike, shot with
> a modern camera at a very shallow depth of field. The rest stays nearly
> blank and even, with no strong shapes or dark areas. No text, no logos.

## Mark's profile picture: `dp-buddy.webp`

1024×1024, quality high. Shown square at 52px in the chat card, 50px in the
feed and 28 to 32px beside messages, so keep the face large and centered.
This is Mark, the periwinkle jellybean gpty.

> A 2008 profile picture, re-imagined as a hyperreal 3D render: a cute,
> smooth, periwinkle-blue (#6d84b4) jellybean-shaped character tipped on its
> side, with a soft dent on one side, two big glossy white oval eyes with
> small dark pupils, no mouth and no limbs. It's taking its own photo at
> arm's length with a silver point-and-shoot camera, the direct flash
> blasting it: hard specular highlights, a slightly blown-out face, the
> background falling off fast into the dark. Behind it, a blurry college
> dorm room at night: string lights, a poster on the wall, the glow of a
> white plastic laptop. Funny, warm, a little overexposed, unmistakably 2008.
> Square composition, character centered and filling about 70% of the frame.
> No text, no logos.

## Your profile picture: `dp-you.webp`

1024×1024, quality high. Everyone's picture before they uploaded one. Shown
square at 28 to 50px.

> The classic social-network "no photo yet" silhouette re-imagined as a
> hyperreal 3D object: one rounded person bust (round head over rounded
> shoulders, no face) made of smooth matte white porcelain with a soft inner
> glow, standing on a seamless pale blue-grey studio background (#d8dfea)
> with a soft shadow beneath. Clean, quiet, slightly uncanny, modern product
> photography. Square, centered. No text, no logos.

---

## The album "Spring Break 08!!!"

Three photos, 1536×1152 (4:3) each, quality high. Shown at 118×88px as
tilted prints in the feed. Generate them with the same character as
`dp-buddy` (easiest as edits of it) so Mark is recognisably in all three.
Every one is shot with a cheap point-and-shoot and its on-camera flash.

**`photo-beach.webp`**

> A 2008 point-and-shoot vacation photo, re-imagined as hyperreal: the
> periwinkle jellybean character with big white eyes sitting on a beach at
> sunset, lit by the camera's direct flash so it's bright against the orange
> and pink sky; a palm tree on the left, the sea glittering behind, a small
> sandcastle beside it. Slightly crooked framing, a date stamp feel without
> any actual text. Fun, sunny, a little overexposed. No text, no logos.

**`photo-party.webp`**

> A 2008 house-party photo, re-imagined as hyperreal: the periwinkle
> jellybean character with big eyes caught by a harsh on-camera flash in a
> dark room, with bright RED-EYE glowing in both of its eyes. Behind it,
> out-of-focus string lights and colored bokeh, two red plastic party cups on
> a table in the foreground. Candid, funny, a little chaotic. No people, no
> text, no logos.

**`photo-roadtrip.webp`**

> A 2008 road-trip photo taken from the back seat of a car, re-imagined as
> hyperreal: the periwinkle jellybean character in the passenger seat wearing
> tiny oversized sunglasses, framed by the dark car window; outside, a
> straight desert highway and red mesas under a blue sky. Warm afternoon
> light plus a weak on-camera flash. No people, no text, no logos.

---

## Cut-outs (transparent background)

Output PNG with **background: transparent**, quality high.

**`sheep.webp`**: 1024×1024. The thrown sheep. It flies across the screen at
150px, sits in the feed at 74px and the sponsored box at 96px, floats in the
sky behind the window, and shrinks to 24px on the chat window's SuperPoke
button, so keep the silhouette bold.

> A hyperreal, very fluffy white sheep caught mid-air as if it has just been
> thrown, facing right: body a round cloud of bright, clean wool, short dark
> legs splayed out, a dark grey face with big startled white eyes and floppy
> ears, a tiny tuft on its head. Soft studio light from the upper left, crisp
> wool detail, a subtle motion feel but no blur on the face. Funny,
> surprised, endearing. Centered with generous padding, transparent
> background. No text, no logos.

**`finger.webp`**: 1536×768 (2:1). The poke. A hand that reaches in from
the right of the screen and pokes it at about 360px wide, and pokes Mark's
picture at 88px. It is shown flipped as well as as-is, so it must point
exactly right with the cuff at the left edge.

> A hyperreal, slightly cartoonish human hand pointing to the right with only
> the index finger extended, the other fingers curled and the thumb tucked
> across them, as if about to poke something. A rolled cuff of a blue
> button-down shirt at the wrist on the far left. Warm, natural skin, soft
> studio light from above, a clean specular highlight on the fingernail.
> Playful, clean, like a modern product shot. Horizontal, the fingertip near
> the right edge, the cuff touching the left edge, transparent background.
> No text, no logos.

---

## Already drawn (SVG, no prompt needed)

These are vector and stay vector. They live in `art.tsx` and
`emoticons.tsx` and need nothing generated:

- **Marks**: the blue "f" favicon, the red video-site tab icon, the Google "G"
  and the traffic lights, keyhole Back and Forward buttons (CSS).
- **Pictures**: the pale default silhouette (`DefaultPic`), and the drawn
  album photos (`PhotoScene`: beach, party with red-eye, road trip), with the
  gptys composited on top and a flash hot spot.
- **App icons** (16px, `AppIcon`): News Feed, Messages, Events, Photos,
  Friends, Groups, Notes, Video, SuperPoke!, Scrabulous, Top Friends,
  Zombies, Marketplace, Chat, the notifications flag and Applications.
- **Poke and SuperPoke**: the pointing hand (`Finger`) and the sheep
  (`Sheep`), each used until its picture above is in.
- **Scene**: the sheep sky and the green pasture hill (`SheepSkyHill`).
- **Odds and ends**: the typing pencil and the search glass.
- **23 chat emoticons**: :) :( :P :D ;) :O :/ :'( >:( 8-) 8| <3 ^_^ O:) 3:)
  -_- o.O :3 >:O :* (^^^) <(") :42:.
