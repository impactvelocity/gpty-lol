# Skype costume art: gpt-image prompts

All slots are filled: the generated pictures live in `public/skype/` as WebP
and are listed in `FILES` at the top of `src/components/skype/art.tsx`. Every
slot also has a drawn SVG or CSS fallback, used when its line is removed. The
wallpaper is used by the Skype scene in `src/components/Scenes.tsx`.

The look: Skype's 2007 sky (cyan blue, puffy white clouds, glossy Aero
buttons) re-imagined as hyperreal, slightly surreal photography and 3D. Very
familiar at a glance, modern up close, with one odd detail per picture.

To replace one:

1. Generate it with the prompt below (sizes and settings are gpt-image's).
2. Resize and convert it (icons 128×128, pictures 512×512, the frozen video
   frame 512px wide, backgrounds 1536px wide), for example
   `sips -Z 128 in.png --out s.png && cwebp -q 92 -alpha_q 100 s.png -o out.webp`.
3. Save it over the file in `public/skype/`.

---

## Header sky: `scene.webp`

1536×1024, quality high. Shown as a wide strip (about 6:1) across the right
two-thirds of the header, behind the title bar, contact card and toolbar,
cropped to the middle band. It's deliberately kept quiet: screened onto the
drawn sky at 66% with a slight blur, and faded out on the left where the name
sits. The current picture is louder than ideal; if you regenerate it, this
prompt asks for less.

> Hyperreal, dreamlike banner art for the header of a chat app, in the bright,
> glossy look of 2007 desktop software, re-imagined with modern photographic
> fidelity. A luminous morning sky in saturated cyan blue that fades to almost
> white on the left. Toward the right: a few thin, wispy, translucent clouds,
> soft-edged and low-contrast, almost dissolving into the blue, with one small
> faint cloud that hints at the shape of a speech bubble. Soft volumetric
> light from the upper right and a very faint lens flare. Airy, calm,
> high-key, nothing crisp or heavy, no big cumulus. The left half is empty
> (smooth gradient only) because text sits on top of it. Keep everything
> inside the middle horizontal band of the image. No text, no logos, no UI,
> no people, no watermark.

## Conversation background: `backdrop.webp`

1536×1024, quality high. Shown behind the message history at 22% opacity, so
it must be very light and low-contrast.

> A very soft, high-key, low-contrast background for behind chat text: almost
> entirely white and the palest sky blue. Along the bottom edge, the soft,
> out-of-focus tops of a sea of clouds, as if seen from a plane window just
> above them. One small, faint cloud shaped like a speech bubble far off in the
> upper right. Gentle, airy, dreamlike, like a 2007 desktop theme photographed
> with a modern camera. The rest stays nearly blank and even, with no strong
> shapes or dark areas. No text, no logos.

## Desktop wallpaper: `wallpaper.webp`

1536×1024 (or larger), quality high. The site background behind the Skype
window, shown full-bleed with a slow push-in. The sidebar sits on its left
third with dark text, so that side must stay bright and calm. The window
covers the middle, so the picture's best part should sit low and to the right.

The 2007 desktop everyone had was Vista's: ribbons of light and glass. This
is that, in Skype's colors, with the cord and the bubbles as the only odd
details.

> A hyperreal, modern take on a 2007 Windows Vista-era desktop wallpaper, in
> a cyan-and-sky-blue palette with a touch of fresh lime green. Long, flowing
> ribbons of translucent glass and light sweep across the frame from the lower
> left to the upper right, with soft caustics, fine iridescent edges, gentle
> internal glow and a few soft bokeh highlights, over a bright, airy
> background that fades from pale blue to almost white. One of the ribbons
> twists into the tight spiral of a coiled telephone cord, and a handful of
> small, glossy glass speech bubbles drift between the ribbons like bubbles
> rising in water, catching highlights. Clean, calm, premium, ultra-detailed,
> lit and shot like a macro product photograph with shallow depth of field.
> The left third stays bright and quiet (soft gradient, no strong shapes);
> the ribbons and bubbles gather center-right and toward the bottom. 3:2
> desktop composition. No clouds, no sky, no text, no logos, no UI, no
> people, no watermark.

Alternative, darker (the shell would switch to light text for it; say if you
use it):

> A hyperreal, modern desktop wallpaper: Earth seen from low orbit at the line
> between night and day, the night side glittering with city lights and the
> day side bright cyan ocean. Thin, glowing cyan arcs of light leap between
> cities across the oceans, like calls in progress around the world, and one
> arc forms the loose spiral of a coiled telephone cord. A soft lime-green
> aurora along the horizon. Calm, awe-struck, ultra-detailed. Keep the left
> third dark, quiet space; the planet fills the lower right. No text, no
> logos, no UI, no people.

## Cal's picture: `dp-buddy.webp`

1024×1024, quality high. Shown in a circle at 70px in the header, 52px in the
call bar, 44px in notifications and 20px beside messages, so keep everything
important inside the central circle. This is Cal, the sky-blue cloud gpty.

> A glossy, hyperreal 3D render of a cute character for a 2007 chat-app profile
> picture: a soft, puffy, sky-blue (#16aeef) cloud with a flattish bottom, two
> big glossy white oval eyes with small dark pupils, no mouth and no limbs. It
> wears a chunky silver-and-black USB headset with a boom mic, slightly too big
> for it, and is lit by the cool glow of a computer monitor and a warm desk
> lamp. Background: a blurry, cozy home office at night in 2007, a round
> webcam clipped to a flat monitor, and through the window the out-of-focus
> lights of a harbour city. Square composition, character centered and
> filling about 65% of the frame, ready to be cropped to a circle. No text, no
> logos.

## Your picture: `dp-you.webp`

1024×1024, quality high. The picture everyone had before uploading one. Shown
in a circle at 20px beside your messages.

> The classic chat-app "no picture yet" silhouette re-imagined as a hyperreal
> 3D object: one rounded person bust (round head over rounded shoulders, no
> face) made of frosted, pale blue-grey glass with a soft inner glow and crisp
> specular highlights, on a seamless white-to-pale-sky-blue studio background
> with a soft reflection beneath and one tiny wisp of cloud behind the
> shoulder. Clean, friendly, 2007 aesthetic with modern rendering. Square,
> centered, ready to be cropped to a circle. No text, no logos.

## Frozen video frame: `video-frozen.webp`

1536×864 (16:9), quality high. Shown at 112×63px in the call bar when a video
call freezes. Easiest made as an edit of `dp-buddy`, so Cal stays the same
character.

> A deliberately degraded webcam still from a 2007 video call, 16:9: the same
> sky-blue puffy cloud character with big white eyes and an oversized headset,
> caught mid-blink with one eye half closed and turning away, in heavy
> compression: big blocky macroblocks, smeared motion, a band of misaligned
> pixels across the middle, slightly green-tinted color. Funny, a little
> uncanny, unmistakably "you froze". Lit by monitor glow in a dark room. No
> text, no UI, no logos.

---

## Toolbar icons

1024×1024 each, quality high, **background: transparent**, output PNG. Shown
at 22×22px next to their labels, so silhouettes must be bold and simple. Use
the same style block for all five so they match; add the subject line at the
end.

**Style block (start every icon prompt with this):**

> A single toolbar icon in the glossy 2007 Windows Vista / Aero style,
> re-rendered as a modern hyperreal 3D object. Soft studio light from the top
> left, a glossy highlight along the top edges, gentle inner glow, clean sky
> blues, fresh greens and pearl whites, crisp edges, a soft contact shadow
> underneath, three-quarter front view. Centered with generous padding (the
> object fills about 75% of the frame), transparent background. It must still
> read clearly when shrunk to 22×22 pixels: one bold, simple silhouette with
> few details. No text, no letters, no logos. Subject:

| File | Subject (append to the style block) |
| --- | --- |
| `icon-video.png` | a classic spherical desktop webcam: a pearl-white glossy ball with a deep blue glass lens in the center and a tiny cyan LED, on a small silver clip. |
| `icon-files.png` | a white sheet of paper with a folded top-right corner, and a glossy green round badge with a white upward arrow at its lower right. |
| `icon-add.png` | one friendly person silhouette (round head, rounded shoulders, no face) in glossy sky-blue candy-like plastic, with a glossy green round badge with a white plus sign at its lower right. |
| `icon-sms.png` | a small silver candybar mobile phone with a glowing cyan screen, and a glossy sky-blue speech bubble with three white dots floating at its upper right. |
| `icon-extras.png` | a glossy sky-blue jigsaw puzzle piece, slightly tilted, with a small sparkling yellow four-point star above its top-right corner. |
