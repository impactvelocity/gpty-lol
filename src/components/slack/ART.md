# Slack costume art: gpt-image prompts

All slots are filled: the generated pictures live in `public/slack/` as WebP
and are listed in `FILES` at the top of `src/components/slack/art.tsx`. Every
slot also has a drawn SVG or CSS fallback, used when its line is removed. The
wallpaper is used by the Slack scene in `src/components/Scenes.tsx`. The team
logo is cropped to the tile (no studio margin), since it's shown in a rounded
square.

The look: Slack in early 2014 at a mid-size company that just "switched off
email", re-imagined as hyperreal, slightly surreal photography and 3D. Very
familiar at a glance, modern up close, with one odd detail per picture.

To replace one:

1. Generate it with the prompt below (sizes and settings are gpt-image's).
2. Resize and convert it (avatars 256×256, the team logo 512×512, GIF stills
   640px wide, the wallpaper 1536px wide), for example
   `sips -Z 256 in.png --out s.png && cwebp -q 90 s.png -o out.webp`.
3. Save it over the file named below in `public/slack/`.

---

## Desktop wallpaper: `wallpaper.webp`

1536×1024 (or larger), quality high. The site background behind the Slack
window, full-bleed with a slow push-in. The site's agent list sits on the left
third in white text, so that side must stay dark and calm. The window covers
the middle, so the best part should sit low and to the right.

The 2014 Mac desktop everyone had was Mavericks' giant wave. This is that wave,
at dusk, in Slack's colors, with emails being washed away as the odd detail.

> A hyperreal, modern take on the giant-surf-wave desktop wallpaper of 2014: one
> enormous wave curling and breaking from right to left at dusk, shot from water
> level with a long lens. The water is deep aubergine purple in the trough,
> turning luminous teal and seafoam green where the light passes through the lip
> of the wave, with fine spray and mist catching a warm pink-and-amber sunset
> glow. The odd detail: the spray blowing off the crest is full of hundreds of
> small white paper envelopes, tumbling and dissolving into the mist like sea
> foam. Above, a dusky violet sky with a few faint stars in teal, mustard
> yellow, raspberry and green. Cinematic, calm, awe-struck, ultra-detailed,
> crisp water texture. The left third stays dark, quiet sky and flat water with
> no strong shapes; the wave fills the lower right. 3:2 composition. No text, no
> logos, no UI, no people, no surfers, no watermark.

## Team logo: `team.webp`

1024×1024, quality high. Paradigm Dynamics' logo, shown at 22–36px as a
rounded square (custom emoji, notifications). Keep it bold and simple.

> A 2014 flat-design company logo turned into a hyperreal physical object: a
> rounded-square app-icon tile made of glossy blue (#2a80b9) glazed ceramic,
> with a chunky white letter "P" in a geometric sans-serif standing out from it
> in slight relief, and the trendy "long shadow" of 2014 cast diagonally from
> the P to the bottom-right corner as a real, darker-blue groove in the glaze.
> Soft studio light from the top left, a subtle specular highlight along the
> top edge, on a seamless pale grey background with a soft contact shadow.
> Square, centered, the tile fills about 80% of the frame. No other text, no
> watermark.

---

## People: the company directory

1024×1024 each, quality high, then shrink to 256×256. Shown at 36px beside
messages and 40–44px in the directory and DM headers, in rounded squares, so
the subject must read at a glance.

Everyone at Paradigm Dynamics had their headshot taken on the same day in the
same studio. None of them are people. Use the same style block for all of them
so they match; add the subject line at the end.

**Style block (start every people prompt with this):**

> A professional corporate headshot for a 2014 company directory, shot in a
> photography studio against the classic mottled grey-blue painted canvas
> backdrop, with soft key light from the left, a gentle hair light, and shallow
> depth of field. Hyperreal and photographic, warm and slightly absurd. The
> subject is not a person: it sits exactly where a person's head and shoulders
> would be, centered and filling most of the frame, posed with great dignity,
> as if it is about to say "I'm excited to be here." Square crop. No text, no
> logos, no watermark. The subject:

| File | Who | Subject (append to the style block) |
| --- | --- | --- |
| `dp-channing.webp` | channing, Internal Comms & Synergy | a cute glossy purple (#8a4fd8) capsule-shaped character with two big glossy white oval eyes and small dark pupils, no mouth and no limbs, wearing a company lanyard with a blank white badge, beaming with enthusiasm. |
| `dp-marcus.webp` | marcus, CEO | a polished chrome executive desk toy, a Newton's cradle, wearing a tiny navy silk tie, lit like a magazine cover. |
| `dp-linda.webp` | linda, General Counsel | a heavy black fountain pen standing upright beside a neat stack of legal pads, with small reading glasses perched on the pen's cap. |
| `dp-gary.webp` | gary, IT | a beige 2001-era desktop tower computer, slightly yellowed, with a hand-written sticky note on the front (no readable text) and a tangle of cables behind it, looking tired. |
| `dp-brad.webp` | brad, VP Sales | a golf ball wearing tiny aviator sunglasses, sitting on a small putting-green mug, unbothered and confident. |
| `dp-priya.webp` | priya, Design Lead | a fanned-out deck of colour swatch cards in aubergine, teal, mustard yellow and raspberry, with one card casting a long, crisp diagonal shadow. |
| `dp-devon.webp` | devon, Engineering | a yellow rubber duck wearing over-ear studio headphones, deeply focused. |
| `dp-tiff.webp` | tiff, People & Culture | a shiny brass service bell with a curl of party streamer around it and a tiny paper party hat on top. |
| `dp-you.webp` | you, the new hire | nothing at all: an empty black office swivel chair, turned slightly towards the camera, waiting for someone to sit in it and upload a profile picture. |

---

## GIFs for /giphy: `gif-1.webp` … `gif-4.webp`

1536×1024 each, quality high, then shrink to 640px wide. Shown at 320px wide
as the GIF that /giphy posts (yours or Channing's); a search word always lands
on the same one. They should look unmistakably like a frame of a 2014 reaction
GIF: low-fi and dithered, but with one surreal idea.

**Style block (start every GIF prompt with this):**

> A single frame from a looping 2014 reaction GIF: slightly low-resolution,
> visible 256-colour dithering and banding, a little motion blur and
> compression, warm overexposed office lighting, funny and surreal. 3:2 frame.
> No captions, no text, no logos, no watermark. The frame:

| File | Frame (append to the style block) |
| --- | --- |
| `gif-1.webp` | an empty open-plan office at night, and one office chair in the middle spinning on its own, motion-blurred, under a single lit ceiling panel. |
| `gif-2.webp` | a golden retriever in a shirt and tie at a standing desk, typing furiously on a keyboard with both paws, ears flying. |
| `gif-3.webp` | an office party celebrating inbox zero: thousands of white paper envelopes raining down like confetti over a cheering crowd of coworkers seen from behind, arms up, one person crowd-surfing on a beanbag. |
| `gif-4.webp` | a cat wearing a tiny call-centre headset at a desk with a flat monitor, staring straight into the camera, completely deadpan. |
