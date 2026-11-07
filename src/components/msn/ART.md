# MSN costume art: gpt-image prompts

All slots are filled: the generated pictures live in `public/msn/` as WebP
and are listed in `FILES` at the top of `src/components/msn/art.tsx`. Every
slot also has a drawn SVG fallback, used when its line is removed. The
wallpaper is used by the MSN scene in `src/components/Scenes.tsx`.

To replace one:

1. Generate it with the prompt below (sizes and settings are gpt-image's).
2. Resize and convert it (icons 128×128, display pictures 512×512, wide
   pictures 1536px wide), for example
   `sips -Z 128 in.png --out s.png && cwebp -q 92 -alpha_q 100 s.png -o out.webp`.
3. Save it over the file in `public/msn/`.

---

## Header scene: `scene.jpg`

1536×1024, quality high. Shown as a wide strip (about 7:1) across the top of
the window, cropped to the middle band and anchored right. The left side gets a
white wash so the contact's name stays readable.

> Hyperreal, dreamlike banner art for the header of a chat app, in the glossy
> "Frutiger Aero" look of mid-2000s Windows, re-imagined with modern
> photographic fidelity. A luminous pale-blue morning sky that fades to almost
> white on the left, with soft volumetric light coming from the upper right. In
> the right third: three iridescent butterflies (sapphire blue, leaf green,
> tangerine orange) with translucent, glass-like wings catching rim light,
> drifting above a gentle curve of dewy, vivid green grass dotted with tiny
> white daisies, in shallow depth of field. Translucent ribbons of light arc
> across the whole frame like bent glass; scattered soft bokeh orbs and a faint
> lens flare. Airy, optimistic, high-key, crisp micro-detail, a subtle
> pearlescent sheen. The left half is calm and empty (smooth gradient only)
> because text sits on top of it. Keep every important element inside the
> middle horizontal band of the image. No text, no logos, no UI, no people, no
> watermark.

## Conversation background: `backdrop.jpg`

1536×1024, quality high. Shown behind the message history at 16% opacity, so
it must be very light and low-contrast.

> A very soft, high-key, low-contrast background for behind chat text: almost
> entirely white and pale sky blue. In the bottom-right corner, one large
> translucent butterfly made of frosted glass, softly out of focus, with a hint
> of blue and green iridescence. Faint curved ribbons of light sweep from the
> lower left to the upper right. Gentle, airy, dreamlike, like a 2000s desktop
> theme photographed with a modern camera. The rest of the image stays nearly
> blank and even, with no strong shapes or dark areas. No text, no logos.

## Your buddy's display picture: `dp-buddy.png`

1024×1024, quality high. Shown at 104px in a glowing green frame, and at 48px
in the toast. This is Nudge, the pink drop-shaped gpty.

> A glossy, hyperreal 3D render of a cute character for a 2005 instant-messenger
> display picture: a smooth, rounded, bubblegum-pink (#f0559b) water-drop shape
> with a soft rounded point on top, no mouth and no limbs, and two big glossy
> white oval eyes with small dark pupils, looking slightly up at the camera.
> It's posing for a high-angle "MySpace angle" webcam selfie: tilted head, a
> tiny glittery pink butterfly clip near the top. Lit like an early-2000s
> digital camera with the flash on, but rendered with modern detail: specular
> highlights, soft subsurface glow. Background: a blurry teenage bedroom wall
> with band posters, glow-in-the-dark star stickers and fairy lights in pink and
> blue bokeh. Square composition, character centered and filling about 70% of
> the frame. No text, no logos.

## Your display picture: `dp-you.png`

1024×1024, quality high. The default picture everyone had before choosing one.

> The classic instant-messenger "default contact" icon re-imagined as a
> hyperreal 3D object: two rounded person silhouettes (round head over rounded
> shoulders, no faces), a glossy lime-green one in front and a glossy cobalt-blue
> one slightly behind and to the right, made of polished translucent candy-like
> plastic with soft internal glow and crisp specular highlights. They stand on
> a seamless pale-blue to white studio background with a soft reflection
> beneath. Clean, friendly, mid-2000s Windows aesthetic with modern rendering.
> Square composition, centered. No text, no logos.

Alternative, if you'd rather be a classic picked-from-the-list picture:

> A glossy yellow rubber duck wearing tiny black sunglasses, hyperreal 3D render
> with soft studio light and a crisp specular highlight, on a seamless sky-blue
> gradient background. Square, centered, mid-2000s instant-messenger display
> picture style. No text.

---

## Toolbar icons

1024×1024 each, quality high, **background: transparent**, output PNG. Shown
at 28×28px, so silhouettes must be bold and simple. Use the same style block
for all six so they match; add the subject line at the end.

**Style block (start every icon prompt with this):**

> A single toolbar icon in the glossy mid-2000s Windows XP / Frutiger Aero
> style, re-rendered as a modern hyperreal 3D object. Soft studio light from
> the top left, a glossy highlight along the top edges, gentle inner glow,
> saturated but clean colors, crisp edges, a soft contact shadow underneath,
> three-quarter front view. Centered with generous padding (the object fills
> about 75% of the frame), transparent background. It must still read clearly
> when shrunk to 28×28 pixels: one bold, simple silhouette with few details. No
> text, no letters, no logos. Subject:

| File | Subject (append to the style block) |
| --- | --- |
| `icon-invite.png` | two friendly person silhouettes (round head, rounded shoulders, no faces) in glossy candy-like plastic, a green one in front and a blue one behind, with a small glossy orange round badge with a white plus sign at the lower right. |
| `icon-files.png` | an open manila-yellow folder with a white sheet of paper peeking out of it and a glossy green arrow curving up and out to the right. |
| `icon-webcam.png` | a classic spherical desktop webcam: a pearl-white glossy ball with a deep blue glass lens in the center and a tiny green LED, on a small silver stand. |
| `icon-audio.png` | a headset with a dark graphite headband and glossy cobalt-blue ear cups, with a short boom microphone. |
| `icon-activities.png` | a glossy orange jigsaw puzzle piece, slightly tilted, with a small sparkling blue four-point star above its top-right corner. |
| `icon-games.png` | two dice: a glossy cherry-red die with white pips in front, and a white die with blue pips tumbling just behind it. |

---

## Desktop wallpaper: `wallpaper.webp`

1536×1024, quality high. The site background behind the MSN window, shown by
the MSN scene in `src/components/Scenes.tsx` with a slow push-in.

> A hyperreal, slightly surreal take on the classic 2000s desktop wallpaper:
> one smooth, rolling hill of impossibly vivid green grass under a deep,
> saturated blue sky with a few soft white cumulus clouds, shot at golden hour
> with a modern full-frame camera. Every blade of grass is crisp; a light breeze
> ripples across the hill; a handful of iridescent butterflies drift far off.
> Clean horizon in the lower third, open sky above for windows to sit on.
> Optimistic, calm, ultra-detailed, no people, no buildings, no text.
