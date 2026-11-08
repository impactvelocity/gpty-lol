# mIRC costume art: gpt-image prompts

The five pictures are in: the generated files live in `public/irc/` as WebP
and are listed in `FILES` at the top of `src/components/irc/art.tsx`. The
nine toolbar icons are still to do; their lines are commented out there and
the drawn SVG icons are used until they exist. Every slot has a drawn
fallback, used when its line is removed. The wallpaper is used by the mIRC
scene in `src/components/Scenes.tsx`. The trout is cropped to the fish (no
empty margin), so the "*SLAP*" lands on it.

The look: 1999, 3am, a CRT glowing in a dark bedroom, re-imagined as
hyperreal, slightly surreal photography and 3D. Very familiar at a glance,
modern up close, with one odd detail per picture (a sky of `#` constellations,
a phone cord growing into the night, a trout).

To add one:

1. Generate it with the prompt below (sizes and settings are gpt-image's).
2. Resize and convert it (icons 128×128, pictures 512px, backgrounds 1536px
   wide), for example
   `sips -Z 128 in.png --out s.png && cwebp -q 92 -alpha_q 100 s.png -o out.webp`.
3. Save it in `public/irc/` under the file name given, and uncomment its line
   in `FILES`.

---

## Desktop wallpaper: `wallpaper.webp`

1536×1024 (or larger), quality high. The site background behind the mIRC
window, shown full-bleed with a slow push-in. The sidebar sits on its left
third with light text, so that side must stay dark and calm. The window covers
the middle, so the picture's best part should sit low and to the right.

> A hyperreal, dreamlike photograph of a teenager's bedroom desk at 3am in
> 1999, seen from slightly above, with nobody in it. A chunky beige CRT monitor
> glows a soft blue-white and is the only light: it falls across a beige
> keyboard, a ball mouse on a mousepad, a stack of blank CD-Rs, a soda can and
> an external 56k modem with tiny green lights. Through the window behind the
> desk, a deep navy night sky full of stars, where some of the stars are joined
> by faint lines into constellations shaped like # signs. A coiled beige phone
> cord runs from the modem up and out of the window, climbing into the sky like
> a vine. Quiet, nostalgic, cinematic, shot with a modern full-frame camera,
> shallow depth of field, crisp detail, cool blue and warm amber light. The
> left third stays dark and calm (night sky and shadow, no strong shapes); the
> desk and the monitor's glow sit in the lower right. 3:2. No readable text on
> the screen, no logos, no people, no watermark.

## Behind the windows: `scene.webp`

1536×1024, quality high. mIRC let you put a picture behind its windows; this
is that. It shows around the cascaded Status and channel windows and fills
the area when they're minimized, so keep it dark and moody enough for the gray
window frames to stand out, with the interest spread toward the edges.

> A hyperreal, surreal night landscape: looking out over a dark field of tall
> grass under a vast deep-navy 1999 sky. Hanging in the sky like a moon is a
> huge # sign made of softly frosted glass, glowing from inside with a cool
> blue light and casting a faint glow on the grass. Tiny square, pixel-like
> stars drift around it. On the horizon, the silhouette of a lone wooden
> telephone pole with its wires sagging out of frame. A hint of magenta in the
> upper left corner of the sky. Calm, mysterious, fine film grain, mostly dark
> blues. No text, no logos, no people, no watermark.

## Channel background: `backdrop.webp`

1536×1024, quality high. Shown behind the channel text at 12% opacity, so it
must be very light and low-contrast.

> A very soft, high-key, low-contrast background for behind chat text: almost
> entirely white with the faintest cool blue-gray. A ghostly, out-of-focus
> scatter of tiny pale-blue square pixel stars that thins out toward the top,
> and in the bottom-right corner, very faint and blurred, the soft glowing
> outline of a # sign, like light through frosted glass. Clean, airy, calm. No
> dark areas, no strong shapes, no text, no logos.

## Nick's picture: `dp-nick.webp`

1024×1024, quality high. Shown at 80px in the /whois card. This is Nick, the
cobalt-blue diamond gpty, as the photo on his GeoCities homepage.

> A hyperreal 3D render of a cute character, photographed like a 1999 webcam
> picture for a personal homepage: a smooth, cobalt-blue (#3f5fdb) diamond
> shape (a rounded square standing on one corner), no mouth and no limbs, with
> two big glossy white oval eyes with small dark pupils, looking just past the
> camera with a relaxed, knowing look. A small pair of foam-padded portable CD
> player headphones sits around its top corner. Lit by the cool glow of a CRT
> from the front and a warm desk lamp from the side; behind it, a blurry
> bedroom wall with a lava lamp, glow-in-the-dark star stickers and a poster
> glowing green. A touch of webcam softness and a faint scanline in the
> background, the character itself crisp. Square, character centered, filling
> about 65% of the frame. No text, no logos.

## The large trout: `trout.webp`

1024×1024, quality high, **background: transparent**, output PNG. Shown about
170px wide, flying across the channel whenever someone gets slapped, nose
first. It must face right.

> A single hyperreal rainbow trout in mid-air, side view, facing right, its
> body in a gentle comic S-curve as if it has just been swung, glistening wet
> with a few water droplets flying off its tail. Olive-green back with dark
> spots, an iridescent pink stripe along its side, a silvery-white belly, crisp
> scales and a slightly startled glossy eye. Bright, clean studio light with a
> soft rim light. The fish fills about 85% of the width; nothing else in the
> frame. Transparent background. No text, no logos.

---

## Toolbar icons

1024×1024 each, quality high, **background: transparent**, output PNG. Shown
at 22×22px, so silhouettes must be bold and simple. Use the same style block
for all nine so they match; add the subject line at the end.

**Style block (start every icon prompt with this):**

> A single toolbar icon in the style of a 1999 Windows 98 / Windows 2000
> program, re-rendered as a modern hyperreal 3D object: chunky, friendly and a
> little toy-like, with crisp edges, saturated flat-ish colors, a subtle glossy
> highlight along the top edges, soft studio light from the top left and a
> small contact shadow underneath, three-quarter front view. Centered with
> generous padding (the object fills about 75% of the frame), transparent
> background. It must still read clearly when shrunk to 22×22 pixels: one bold,
> simple silhouette with very few details. No text, no letters, no logos.
> Subject:

| File | Subject (append to the style block) |
| --- | --- |
| `icon-connect.png` | a chunky yellow lightning bolt with a warm orange edge. |
| `icon-options.png` | a small claw hammer with a polished steel head and a warm wooden handle, tilted diagonally. |
| `icon-channels.png` | an open manila-yellow folder with a bold navy-blue # symbol embossed on its front. |
| `icon-send.png` | a white sheet of paper with a folded top-right corner, and a glossy green round badge with a white upward arrow at its lower right. |
| `icon-chat.png` | two overlapping speech bubbles, a white one behind and a pale yellow one in front with three small dark dots. |
| `icon-notify.png` | a glossy golden-yellow bell with a small round clapper, swinging slightly. |
| `icon-np.png` | a shiny silver compact disc with a rainbow sheen, with a black eighth note leaning against its right side. |
| `icon-colors.png` | a wooden painter's palette with five glossy paint blobs: red, yellow, green, blue and purple. |
| `icon-about.png` | a glossy round cobalt-blue button with a white question-mark symbol on it (the one symbol allowed). |
