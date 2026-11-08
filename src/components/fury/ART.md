# Firewall Fury costume art: gpt-image prompts

Nothing here is needed to run the costume: every slot has a drawn fallback
(the SVG and CSS Grid in `scene.tsx`, stars behind the terminal glass, the
vector Shelly in `art.tsx`, a CSS chrome gradient). Generated pictures make
it richer. Save each one in `public/fury/` and uncomment its line in `FILES`
at the top of `src/components/fury/art.tsx`.

The look: hacking the mainframe in 1985, the way the movies drew it, with
the dial turned up. Miami at night, a neon grid racing toward a striped
sunset, chrome and hot-pink brush lettering, palms, VHS grain. Think of an
over-the-top 80s action-movie VHS cover. Palette: deep indigo and violet sky,
hot pink (#ff2e88), electric cyan (#2ef2ff), sunset yellow and orange, red
(#ff1f3d) for the alarm. Shelly is the pink Gpty cone in wayfarer sunglasses
and a red headband.

To add one:

1. Generate it with the prompt below (sizes and settings are gpt-image's).
2. Resize and convert it, for example
   `sips -Z 1536 in.png --out s.png && cwebp -q 90 -alpha_q 100 s.png -o out.webp`.
3. Save it as the file named in the heading, in `public/fury/`.
4. Uncomment its line in `FILES` in `src/components/fury/art.tsx`.

---

## 1. Desktop wallpaper: `wallpaper.webp`

1536×1024, quality high. The site background, full-bleed with a slow push-in
(it replaces the drawn Grid in `scene.tsx`). The chat window covers the
middle of the screen and the agent list sits over the left third with white
text, so that side must stay dark and calm. The sun and the laser wall
belong behind the chat window (about 62% from the left, horizon about 60%
down), so their glow spills out around the window's edges. A new wallpaper
with the sun somewhere else should update `object-position` and
`transformOrigin` in `scene.tsx`.

> A cinematic 1980s synthwave illustration in the style of an airbrushed VHS
> action-movie cover, 3:2 landscape. A vast glowing neon-magenta
> perspective grid floor stretches to the horizon, which sits about 60% of
> the way down the frame. On the horizon, about 62% from the left edge, a
> huge striped retro sun (yellow at the top fading to orange and hot pink,
> cut by horizontal bands that widen toward the bottom) sets behind a wall
> of vertical pink laser beams that rises from the horizon like a force
> field. Low wireframe mountains in cyan and magenta outline along the
> horizon. A deep indigo-to-violet night sky full of stars, with a faint
> comet streaking across the upper left. Black palm-tree silhouettes with
> thin pink rim light on the far left and far right edges. Subtle VHS grain
> and soft bloom. The left third of the frame stays dark and uncluttered,
> apart from the palm silhouettes. No people, no text, no logos, no
> watermark, no UI.

## 2. The sky behind the glass: `sky.webp`

1536×1024, quality high. Laid over the top two thirds of Shelly's terminal
screen, behind the text, at about 30% opacity with the "screen" blend mode,
so only the bright parts show. It must be mostly black, or the text gets
hard to read.

> A very dark 1980s synthwave night sky seen straight on, as the backdrop of
> a retro computer graphics scene: almost entirely black and deep indigo,
> scattered with small sharp white and pale-cyan stars and a faint purple
> Milky Way band running diagonally. Along the very bottom edge, a soft
> horizontal glow of hot pink and violet, like a horizon just out of frame.
> No sun, no grid, no planets, no text, no logos. The middle of the frame is
> dark and calm.

## 3. Shelly's fighter card: `portrait.webp`

1024×1536 (portrait), quality high. Fills the "Your opponent" card on the
right of the window (about 230×410 px, cropped to fit, so keep her in the
middle), like a fighting-game character-select portrait. Her name and a BOSS
tag are drawn over the top corners, so keep the top 15% simple. Replaces the
vector Shelly there only; the sidebar keeps the drawing.

> An airbrushed 1980s arcade fighting-game character portrait in the style
> of a VHS action-movie cover. The character is "Shelly": a cute, glossy,
> hot-pink cone-shaped creature (a soft rounded triangle with no arms or
> legs, smooth like vinyl, with a bright pink-to-magenta gradient) wearing
> black wayfarer sunglasses that reflect a striped sunset, and a red kung fu
> headband tied at the side whose two tails flutter behind her. She stands
> in a confident, smug boss pose, centered, filling the lower two thirds of
> the frame. Behind her: a huge striped retro sun (yellow to orange to hot
> pink) setting on a glowing magenta perspective grid floor, under a
> starry indigo sky. Strong rim light: warm gold on one side, electric cyan
> on the other. Chrome highlights, soft bloom, subtle VHS grain. The top 15%
> of the frame is plain sky. No text, no logos, no watermark.

## 4. Chrome lettering: `chrome.webp`

1536×1024, quality high. Clipped to the shape of every chrome word on the
cabinet (FIREWALL FURY, VS, OMNIVAC, SHELLY in the sidebar), stretched to
fit each one. It must read as the classic 80s chrome-logo gradient top to
bottom and stay even from left to right, because each word only shows a
slice of it.

> A seamless horizontal band of classic 1980s chrome-logo metal, filling the
> whole frame, evenly lit from left to right: from top to bottom, a pale
> sky-blue reflection fading to bright white, then a hard dark horizon line
> across the exact middle of the frame, then a deep violet-brown reflected
> ground warming into orange and a pale gold glow at the bottom edge. A few
> soft horizontal streaks and one subtle star glint. Polished, mirror-like,
> airbrushed. No shapes, no letters, no text, no objects, no logos.

---

## Shelly's song: `song.m4a` (for a music model, not gpt-image)

Every other themed agent has a looping song in the player above its window.
Generate this with a music model (for example Suno or Udio), trim it to a
clean loop of about 2 to 3 minutes, export AAC (`.m4a`), save it as
`public/fury/song.m4a`, then add this to Shelly's `fury` entry in
`src/lib/agents.ts`:

```ts
song: { src: "/fury/song.m4a", title: "Laser Grid", artist: "Black ICE" },
```

The player already has a skin for her (chrome and neon, with a sunset
visualizer).

> Style: 1985 synthwave / outrun, driving and cinematic, 118 BPM, minor key.
> Analog polysynth pads, a pulsing arpeggiated sawtooth bass, big gated-reverb
> snare, LinnDrum-style drum machine, a soaring lead synth hook, a short
> electric guitar solo near the end, a touch of saxophone. Feels like the
> opening credits of a VHS action movie: speeding across a neon grid toward a
> sunset at midnight in Miami. Instrumental, except for a deep, deadpan
> spoken vocoder line in the breakdown: "Access denied." Clean loop point,
> no fade-out.

---

## Drawn in code (no picture needed)

- The terminal: VT323 on a curved CRT, with magenta and cyan ghosts on every
  letter, bloom, scanlines, a rolling refresh band, glare and VHS grain,
  tracking noise and head-switching at the LP and EP tape speeds:
  `fury.css`. It stays CSS on purpose, because it follows the chat (the
  grid speeds up while Shelly talks, the tube burns red in an alarm, the
  health bars drain).
- The neon block letters (FIREWALL FURY, VS, BLOCKED!, ACCESS DENIED, K.O.):
  `BlockText` in `art.tsx`, from a 5×7 character ROM, filled with the sunset.
- The striped sun, the wireframe mountains, the stars and the palms: `Sun`,
  `Mountains`, `Stars` and `Palm` in `art.tsx`.
- Shelly herself (the cone in wayfarers and a headband, with laser eyes in
  an alarm): `Portrait` in `art.tsx`, used on the fighter card unless a
  portrait is added, and always in the sidebar.
- The cabinet, the arcade buttons, the coin door and the VCR deck: `fury.css`.
