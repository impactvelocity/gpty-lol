# ICQ costume art: gpt-image prompts

All slots are filled: the generated pictures live in `public/icq/` as WebP
and are listed in `FILES` at the top of `src/components/icq/art.tsx`. Every
slot also has a drawn SVG or CSS fallback, used when its line is removed. The
wallpaper is used by the ICQ scene in `src/components/Scenes.tsx`.

To replace one, generate it with the prompt below, resize and convert it,
and save it over the file in `public/icq/`.

The look: ICQ 2000b on Windows 98 (the teal desktop, grey bevels, the green
flower, beige computers, dial-up) re-imagined as hyperreal, slightly surreal
photography and 3D. Familiar at a glance, modern up close, one odd detail per
picture.

Resize and convert: icons 128×128, the picture 512×512, wide pictures 1536px
wide, for example
`sips -Z 128 in.png --out s.png && cwebp -q 92 -alpha_q 100 s.png -o out.webp`.
The banner ads are cropped to a strip (see below) before converting.

---

## Desktop wallpaper: `wallpaper.webp`

1536×1024, quality high. The site background behind the ICQ window, full
bleed with a slow push-in. The agent list sits on its left third with white
text, so that side must stay dark and calm; the window covers the middle, so
the best part should sit low and to the right.

> A hyperreal, slightly surreal photograph that is also the classic Windows 98
> desktop: an endless meadow at dusk under a smooth, deep teal sky the exact
> color of the old default desktop (#008080), darkening toward the top. The
> meadow is thousands of glossy flowers, each with eight plump rounded green
> petals and a golden-yellow center; here and there one flower has a single
> red petal. Low on the right, half-sunk among the flowers, a chunky beige CRT
> monitor from 1999 glows softly, its screen showing only a gentle green
> light, its cable trailing off into the grass. A few fireflies drift like
> dust. Shot with a modern full-frame camera, shallow depth of field, crisp
> detail, calm and dreamy. The left third stays darker and quiet (smooth teal
> sky, flowers out of focus). No text, no logos, no UI, no people, no
> watermark.

## Daisy's picture: `dp-buddy.webp`

1024×1024, quality high. Shown square at 62px in the header and 54px in User
Details, so the face must read tiny. This is Daisy, the green flower gpty.

> A glossy, hyperreal 3D render of a cute character for a 2000-era
> instant-messenger profile picture: a flower-shaped creature, eight plump,
> rounded, glossy green petals (#3fbd4c) around a round green face with two big
> glossy white oval eyes and small dark pupils, no mouth, no limbs. One petal
> is a little bent, like it was slept on. It's lit and framed like a 2000
> webcam snapshot (slightly soft, warm color cast, a hint of flash glare) but
> rendered with modern detail: specular highlights, soft subsurface glow in
> the petals. Background, blurred: a teenage bedroom in 2000, a beige CRT
> monitor glowing teal, glow-in-the-dark star stickers, a lava lamp. Square
> composition, character centered and filling about 70% of the frame. No
> text, no logos.

## Conversation background (optional): `backdrop.webp`

1536×1024, quality high. Shown behind the message history at 14% opacity, so
it must be very light and low-contrast.

> A very soft, high-key, low-contrast background for behind chat text: almost
> entirely white with the palest mint and teal. In the bottom-right corner, a
> few large green-petaled flowers with yellow centers, softly out of focus,
> as if seen through frosted glass. Faint dappled sunlight. Gentle and airy,
> like a 2000 desktop theme photographed with a modern camera. The rest stays
> nearly blank and even, no strong shapes or dark areas. No text, no logos.

---

## Toolbar icons

1024×1024 each, quality high, **background: transparent**, output PNG. Shown
at 28px (20px in narrow windows, 16px in the history), so silhouettes must be
bold and simple. Use the same style block for all five so they match; add
the subject line at the end.

**Style block (start every icon prompt with this):**

> A single toolbar icon in the spirit of a 1999-2000 Windows desktop
> application's chunky 32×32 icons, re-rendered as a modern hyperreal 3D
> object: tactile, slightly toy-like materials (glossy plastic, beige computer
> plastic, enamel), soft studio light from the top left, a crisp highlight
> along the top edges, a soft contact shadow, three-quarter front view. A
> limited, bold palette: flower green, sunflower yellow, navy blue, signal
> red, beige and white. Centered with generous padding (the object fills
> about 75% of the frame), transparent background. It must still read clearly
> at 20×20 pixels: one bold, simple silhouette with few details. No text, no
> letters, no logos. Subject:

| File | Subject (append to the style block) |
| --- | --- |
| `icon-info.png` | a chunky ID card in cream plastic with a navy-blue top stripe, a small green round-headed person silhouette in its photo window, and a glossy blue round badge with a white "information" dot-and-stem symbol at its lower right. |
| `icon-file.png` | a navy-blue 3.5-inch floppy disk with a brushed-silver metal shutter and a white paper label with two red ruled lines, slightly tilted, with a glossy green round badge holding a white right-pointing arrow at its lower right. |
| `icon-chat.png` | two glossy speech balloons overlapping: a green one behind, and a white one in front with two grey text lines and a small red text cursor. |
| `icon-random.png` | a glossy blue globe with bright green continents, and a white die with red pips tumbling in front of its lower right. |
| `icon-history.png` | a small maroon hardcover book with cream page edges and a gold flower emblem on the cover, with a round white clock-face badge at its lower right. |

---

## Banner ads

1536×1024 each, quality high. The banner is a thin strip under the header,
so each picture is cropped to the middle 1536×176 band before converting
(trim any letterbox bars too; `ad-modem.webp` is 1536×158). It's shown at the
banner's full height, just left of the button, fading into the ad's own
background color at both ends. The headline, the button and the
"Advertisement" label are live text, so the pictures carry none.

**Style block (start every ad prompt with this):**

> A wide background for a 2000-era website banner ad, re-imagined as a
> hyperreal, slightly surreal modern photograph. Everything important sits
> inside a thin horizontal band across the vertical middle of the image, on
> the right half; the rest will be cropped away. The left half of that band
> is calm, a smooth gradient in the background color, because bold text sits
> on top of it. No text, no letters, no numbers, no logos, no UI, no people,
> no watermark. Scene:

| File | Scene (append to the style block) |
| --- | --- |
| `ad-visitor.png` | on a deep red to tomato-orange background, a shiny gold trophy cup on a small red velvet cushion, golden confetti frozen mid-air, and a big yellow cartoon starburst behind it, lit like a game-show stage. Gloriously cheesy. |
| `ad-smileys.png` | on a bright sky-blue to white gradient, a cluster of glossy round yellow smiley-face balloons (simple black eyes and smiles, one winking, one laughing) bobbing on short strings among soft little clouds, shot like a product photo. |
| `ad-modem.png` | on a deep navy-to-black background, a beige external 56k modem on a desk, its row of tiny red and green front lights glowing, a coiled grey phone cord trailing off, and faint green light streaks leaking out of it very, very slowly, like data stuck in traffic. Moody tech-ad lighting. |
| `ad-homepage.png` | on a black, star-speckled night background, a tiny construction site the size of a toy set: a yellow diamond road sign with a little digging worker, a striped black-and-yellow barrier and an orange traffic cone, with glowing magenta sparkles drifting around it like a homemade web page's animated GIFs. |
