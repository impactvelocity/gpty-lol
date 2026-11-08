# The Token Palace (Lucky, LUCKY PROMPT 777) costume art: SVGs and image prompts

All thirteen slots are filled: the generated pictures live in `public/slots/`
as WebP and are listed in `FILES` at the top of `src/components/slots/art.tsx`.
Every slot also has a drawn SVG or CSS fallback, used when its line is
removed. As installed, the wallpaper, the velvet (1536×1024) and the cup
(512×384) are as generated; the token and the nine reel symbols were resized
from their 512px PNGs to 256×256 (`cwebp -q 90 -alpha_q 100 -resize 256 256`),
plenty for the 18–60px they show at. The wallpaper sits under a left-hand
shade (`.lk-sc-shade`) so the agent list stays readable over the near aisle.
The cut-outs were checked on cream and on cherry red: no halos.

To replace one, generate it with the prompt below, convert it the same way
and save it over the file named below.

The look: a slot machine at 3 a.m. on the floor of a casino with no clocks.
Cherry-red lacquer, gold chrome trim, cream reels behind glass, a marquee of
chasing bulbs, hot pink and cyan neon, red LED digits, a loud wine-and-teal
casino carpet. Glossy and warm, a little seedy, never sleazy: no cards,
dice, cigarettes, alcohol, money or people. The joke is AI as a slot machine:
the reel symbols are the things people pull AI for (text, email, image, code,
slides, a BAR chart, a poem), a bug where the lemon used to be, and AGI in the
jackpot burst. Lucky's gpty is a gold one-armed-bandit silhouette with dark
eyes.

Palette: `#d0142f` cherry, `#6a0518` deep red, `#2a050e` wine, `#14040a`
velvet black, `#ffc533` gold, `#fff0b3` gold highlight, `#ff3d8b` hot pink,
`#35f0ff` cyan, `#3dff8f` win green, `#ff4231` LED red.

Converting: for example
`sips -Z 1536 in.png --out s.png && cwebp -q 88 s.png -o out.webp` for the
backgrounds, or `cwebp -q 92 -alpha_q 100 -resize 512 512 in.png -o out.webp`
for the cut-outs. Cut-outs often come back with a pale halo where the white
background was matted out; check each one on the dark red cabinet before
using it.

---

## The SVGs (already drawn, exported)

The drawings live in code (`symbols.tsx`, `art.tsx`, `components/Gpty.tsx`).
Standalone copies, 256×256, for decks, stickers, the OG card or as references
for the image model, are in `public/slots/svg/`:

| File | What |
|---|---|
| `symbol-text.svg` | A page of text with a folded corner and one highlighted line (the cherry) |
| `symbol-email.svg` | An airmail envelope with a red wax seal |
| `symbol-image.svg` | A gold-framed sunset picture with an AI sparkle |
| `symbol-code.svg` | A code window with `</>` |
| `symbol-deck.svg` | A slide on an easel, up and to the right |
| `symbol-chart.svg` | The BAR, which is a bar chart |
| `symbol-poem.svg` | A quill in an inkwell, with a note |
| `symbol-bug.svg` | The bug (where the lemon used to be) |
| `symbol-agi.svg` | AGI in a gold jackpot burst (the 7) |
| `symbols-sheet.svg` | All nine on reel stock, in paytable order |
| `token.svg` | A Token Palace token, milled edge, a 7 in the middle |
| `lucky.svg` | Lucky's gpty: the gold one-armed bandit with eyes |

The symbols use Bungee for "BAR" and "AGI", falling back to Arial Black or
Impact where it isn't installed.

---

## Desktop wallpaper: `wallpaper.webp` → `wallpaper: "/slots/wallpaper.webp"`

1536×1024 (or larger), quality high. The site background behind the machine,
full-bleed with a slow push-in; tokens keep drifting down over it. The agent
list sits on the left third in white text, so that side must stay dark and
calm. On most screens the machine covers the middle, so the best parts sit
low on the left and on the far right. Replaces the drawn ceiling lights,
bokeh, rows of machines, carpet and neon signs.

> A wide, cinematic illustration of an empty casino floor at 3 a.m., seen
> from a low angle down a long aisle of slot machines. Rows of tall, glossy
> slot machine cabinets in cherry red and gold recede into the distance on
> both sides, their screens glowing pink, cyan and gold, chasing bulbs around
> their marquees, a few with a red ball-topped lever on the side. A
> wildly patterned casino carpet (wine red, teal and gold circles and
> diamonds) runs toward a vanishing point. Warm pools of light from a low
> ceiling of small spotlights, soft out-of-focus bokeh of neon in the
> distance, a faint haze. On the far right wall, a glowing pink neon sign
> reading "OPEN 24/7" and a smaller cyan one reading "NO CLOCKS". There are
> no clocks and no windows anywhere. The left third is darker and quieter:
> mostly shadowed machines and carpet. Glossy, slightly stylized, rich color,
> gentle film grain, like a modern animated film's background painting. No
> people, no cards, no dice, no chips on tables, no money, no alcohol, no
> logos, no other text, no watermark.

## The velvet: `velvet.webp` → `velvet: "/slots/velvet.webp"`

1536×1024, quality high. The surface behind the conversation, inside the
machine's screen, under the messages. Shown at 50% over a near-black wine
gradient, so it must be dark, even and quiet. Adds depth to the drawn
diamond pattern.

> An abstract, very dark background texture for use behind text: deep wine
> red to near black (#2a050e to #0b0205) crushed velvet, with an extremely
> subtle diamond quilting pattern in faint antique gold, like the padded
> lining of a casino booth seen in low light. A soft warm glow at the top
> center fading to darkness at the edges, a fine fabric texture and gentle
> grain. Even and low-contrast across the middle: no bright spots, no hard
> shapes, nothing that competes with text. No text, no symbols, no watermark.

## The token: `token.webp` → `token: "/slots/token.webp"`

1024×1024, quality high, **background: transparent**. The coin that pours out
on a win, drops into the coin slot when you insert tokens, and drifts down
the background (shown at 12–32px, spinning on its vertical axis). Replaces
the drawn token.

> A single gold casino token on a transparent background, seen straight on,
> filling the frame edge to edge. Polished gold with a milled, notched rim, a
> raised inner ring, and a bold, slightly italic number 7 in deep red enamel
> in the center. A crisp specular highlight at the upper left, rich but
> simple shading, readable at 16 pixels. Glossy stylized 3D render like a
> mobile game icon. Only the coin on transparency: no shadow, no other
> text, no logos.

## The winnings cup: `cup.webp` → `cup: "/slots/cup.webp"`

1024×768 (4:3), quality high, **background: transparent**. Stands at the foot
of the agent list on tall screens (shown about 200px wide). Replaces the drawn
stack of chips and coin cup.

> A small still life on a transparent background: a brushed-chrome casino
> coin cup with "777" printed in red on the side, overflowing with gold
> tokens (each with a red 7), a few tokens spilled beside it, and next to it
> a short, slightly leaning stack of red, blue, green and black casino chips
> with white edge stripes. Three-quarter view from slightly above, warm
> highlights, glossy stylized 3D render like a mobile game asset. Only the
> objects and a soft contact shadow on transparency: no table, no
> background, no cards, no money, no other text, no logos.

## Reel symbols: `sym-<name>.webp` → `"sym-<name>": "/slots/sym-<name>.webp"`

1024×1024 each, quality high, **background: transparent**. The nine symbols
on the reels, the paytable, the suggestions, the payout headers and the
sidebar's little reels, shown at 18–60px on cream reel stock. Replace the
drawn symbols one by one (keys `sym-text`, `sym-email`, `sym-image`,
`sym-code`, `sym-deck`, `sym-chart`, `sym-poem`, `sym-bug`, `sym-agi`).
Generate them as a set, using the drawn SVGs above as references, so they
match: same outline weight, same light from the upper left, same scale in
the frame.

Shared frame:

> A single classic slot machine reel symbol on a transparent background,
> centered, filling about 85% of the frame. Chunky, glossy, candy-like
> stylized 3D, like the cherries and bells on a modern slot machine or a
> mobile casino game: bold simple silhouette, a thick dark burgundy outline
> (#2b0710), saturated colors, one crisp white specular highlight at the
> upper left, soft inner shading. Readable at 20 pixels. Nothing outside
> the object: no reel, no background, no shadow, no text unless named
> below. Subject:

- `sym-text.webp`:
  > a single sheet of cream paper with a folded top-right corner, four blue
  > lines of text, the second line swiped with pink highlighter.
- `sym-email.webp`:
  > a white envelope with a red and blue striped airmail border, the flap
  > closed with a red wax seal stamped with a small heart.
- `sym-image.webp`:
  > a small framed picture in a gold frame: a sunset sky going from violet to
  > pink to gold, a green mountain with a snowy peak, a pale sun, and a white
  > four-pointed sparkle on the frame's top-left corner.
- `sym-code.webp`:
  > a rounded dark indigo code window with red, yellow and green dots on its
  > title bar and a big glowing green "</>" in the middle, the slash in hot
  > pink.
- `sym-deck.webp`:
  > a presentation slide on a wooden easel: an orange header bar, four
  > ascending bars in blue, pink, gold and green, and a white line arrow going
  > up and to the right.
- `sym-chart.webp`:
  > the classic slot machine "BAR" symbol: a black rounded slab with a gold
  > border and the word "BAR" in bold gold letters, with three ascending
  > chart bars in green, gold and red beneath the word.
- `sym-poem.webp`:
  > a white feather quill dipped in a small purple glass inkwell, with a hot
  > pink musical eighth note floating beside it.
- `sym-bug.webp`:
  > a cute but grumpy bright green beetle, seen from above, with six dark
  > legs, two antennae tipped with pink balls, a dark green head with big
  > white eyes, and darker green spots on its shell.
- `sym-agi.webp`:
  > a gold twelve-pointed jackpot starburst with a red enamel disc in the
  > center ringed by tiny gold bulbs, and the letters "AGI" in bold cream
  > capitals with a dark outline across the disc.

## Image payouts: `gen/gen-<nn>-<name>.webp` → `GEN` in `art.tsx`

When someone asks Lucky for a picture, the payout card shows "your image"
(`GenImage` in `art.tsx`): today a drawn SVG landscape with a blob that has
eyes and a six-fingered hand. These replace it with a pool of real pictures,
one picked by the pull's seed. The caption still shows the user's own prompt,
so the joke is that you never get quite what you asked for: every picture is
gorgeous, polished, "AI showcase" quality, and has exactly one thing wrong
with it. The flaw caption under each line is what the card's meta line should
say (it replaces the random `FLAWS` entry for that picture).

Only the image payout needs pictures. Code, slides, emails, poems, tables and
text payouts are the model's real answer, laid out in HTML.

1536×1024 (3:2) or 1024×768 (4:3), quality high, opaque. The card crops to
4:3, so keep the subject and the flaw in the middle two-thirds. Convert with
`sips -Z 1024 in.png --out s.png && cwebp -q 86 s.png -o gen-01-cat.webp`.

Shared frame:

> A polished, high-end digital illustration in the style of a showcase image
> from a modern AI image generator: cinematic lighting, rich saturated color,
> crisp detail, shallow depth of field, a little too perfect. Everything in
> the picture is completely convincing except for ONE absurd mistake, which
> is rendered with the same care and confidence as everything else, as if
> the artist didn't notice. The mistake should be easy to spot at a glance
> and funny, never gross or scary. No text unless named below, no logos, no
> real people, no casino imagery. Scene:

- `gen-01-cat.webp`, flaw caption **helmet: fishbowl (occupied)**
  > a fluffy orange tabby cat in a tiny white astronaut suit floating above
  > the moon, Earth glowing blue behind it, stars everywhere. The mistake: its
  > space helmet is an ordinary round goldfish bowl full of water, and a small
  > orange goldfish is swimming inside it right beside the cat's calm face.
- `gen-02-handshake.webp`, flaw caption **✋ 3 hands, 1 deal**
  > a glossy corporate stock photo of two smiling executives in navy suits
  > shaking hands across a glass desk in a bright skyscraper office at golden
  > hour. The mistake: the handshake has three hands in it, all perfectly
  > clasped, and nobody seems to mind.
- `gen-03-sunset.webp`, flaw caption **one extra sun**
  > a dreamy tropical beach at sunset: turquoise water, leaning palm trees, a
  > wooden pier, pink and gold clouds. The mistake: two suns are setting side
  > by side on the horizon, each with its own reflection on the water.
- `gen-04-dog.webp`, flaw caption **teeth: too many, too human**
  > a regal oil-painting-style portrait of a golden retriever in a Victorian
  > military jacket with gold epaulettes and medals, posed in front of a
  > velvet curtain. The mistake: the dog is smiling with a full set of
  > perfectly straight, gleaming human teeth.
- `gen-05-pizza.webp`, flaw caption **1 slice: fruit**
  > mouth-watering food photography of a fresh pepperoni pizza on a wooden
  > board, steam rising, cheese pulling from a lifted slice, basil leaves. The
  > mistake: one of the eight slices is a perfectly cut wedge of watermelon,
  > seeds and all, fitted neatly into the pizza.
- `gen-06-lake.webp`, flaw caption **reflection: different mountain**
  > a majestic alpine lake at dawn, mirror-still, a snowy mountain peak and
  > pine forest reflected in the water, mist on the surface. The mistake: the
  > reflection in the lake shows a completely different mountain, an erupting
  > volcano, while the real peak above is calm and snowy.
- `gen-07-team.webp`, flaw caption **👍 thumbs: 11, people: 5**
  > a bright, upbeat stock photo of five smiling coworkers in a modern office
  > giving the camera a thumbs up. The mistake: one woman's hand has two
  > thumbs, both up, and the man next to her is giving a confident thumbs
  > sideways.
- `gen-08-castle.webp`, flaw caption **door: 2nd floor, no stairs**
  > a fairytale castle on a green hill at sunrise, white towers with blue
  > roofs, flags, a winding path leading up to it. The mistake: the castle's
  > grand front door is halfway up the wall on the second floor, with no
  > stairs, and the path leads straight into the blank wall below it.
- `gen-09-clock.webp`, flaw caption **clock: 13 o'clock**
  > a charming European town square with cobblestones, flower boxes, cafe
  > umbrellas, and an ornate clock tower against a blue sky. The mistake: the
  > clock face has thirteen numbers around it, evenly spaced, and both hands
  > point at the 13.
- `gen-10-horse.webp`, flaw caption **legs: 5 (galloping)**
  > a white horse galloping along a beach at golden hour, mane flowing, sand
  > and spray kicked up, cinematic motion. The mistake: the horse has five
  > legs, all in perfect stride.
- `gen-11-library.webp`, flaw caption **every book: "Boook"**
  > a cozy wood-paneled library with tall shelves, a rolling ladder, a
  > leather armchair and warm lamp light. The mistake: every single book
  > spine on every shelf has the same title in gold lettering, "BOOOK".
- `gen-12-robot-chef.webp`, flaw caption **pancake: 33⅓ rpm**
  > a friendly round chrome robot chef in a tall white hat flipping a pancake
  > in a sunny kitchen, a stack of pancakes and berries on the counter. The
  > mistake: the pancake in mid-air is a black vinyl record, flipping with a
  > perfect golden-brown underside.

---

## Drawn (SVG and CSS, no prompt needed)

These stay vector. They live in `SlotsLayout.tsx`, `art.tsx`, `symbols.tsx`
and `slots.css`:

- **The cabinet**: cherry lacquer with gold trim and a neon glow on the floor
  beneath it, the marquee (neon "Lucky Prompt", the jackpot on an LED, the
  TILT lamp, and chasing bulbs all the way round its edge), the button deck,
  the LED meters, the coin slot and the cash-out voucher.
- **The reels**: three cream drums behind curved glass, motion-blurred while
  they spin (an SVG blur that only smears vertically), stopping left to right
  with an overshoot; the payline, its lamps, the near-miss tease on reel
  three, the winning-symbol frames and the banner.
- **The lever**: the chrome arm and red ball, dragged or clicked, with a
  ratchet and a spring back.
- **Payouts**: the prompt ticket, the email card with its airmail stripe,
  code windows, slide decks, tables, and the generated "image" card (a seeded
  landscape with a creature and a hand with six fingers, denoising in).
- **The scene** (`SlotsScene`): ceiling light, bokeh, two rows of machines,
  the carpet in perspective, neon signs, drifting tokens and the winnings
  cup.
- **The sidebar chip** (`SidebarRow.tsx`): a little cabinet with chasing
  bulbs and three tiny reels that spin while Lucky answers.

---

## Sound effects: `public/slots/sfx/`

Generated with ElevenLabs Sound Effects v2 (`eleven_text_to_sound_v2`), in the
flow "Token Palace slot machine SFX". `src/components/slots/sound.ts` plays
them and falls back to its synthesized sounds while they load, or if one is
missing. Each was trimmed, faded and loudness-matched (about -16 LUFS, peaks
under -1 dBFS) with ffmpeg; `LEVEL` in `sound.ts` sets the mix, kept quiet.
`spin` is a WAV because it loops seamlessly and MP3 pads the start of a file.

| File | Prompt | Settings |
|---|---|---|
| `spin.wav` | Mechanical slot machine reels spinning, steady fast soft plastic clicking and gentle whir, close-mic, no music | 2 s, loop, influence 0.6 |
| `stop.mp3` | Single slot machine reel locking into place, one soft solid mechanical clunk, close-mic | 0.5 s, 0.6 |
| `lever.mp3` | Slot machine side lever pulled down, quick metal ratchet clicks then a soft spring thunk | 1 s, 0.6 |
| `coin.mp3` | Single metal casino token dropping into a coin slot, soft bright clink, close-mic | 0.6 s, 0.6 |
| `win.mp3` | Small slot machine win, short cheerful electronic bell chime arpeggio, gentle, no voice | 1.5 s, 0.5 |
| `big.mp3` | Slot machine jackpot, ringing bells and a cascade of coins pouring into a metal tray, no voice | 3 s, 0.5 |
| `near.mp3` | Soft muted trombone playing two descending notes, sad womp womp, short | 1.2 s, 0.6 |
| `agi.mp3` | Rising electronic synth swell building up, then fizzling out with a soft electrical sputter | 1.8 s, 0.5 |
| `bust.mp3` | Short soft low electronic buzzer, gentle wrong-answer tone, arcade machine | 0.6 s, 0.6 |

To replace one: export it as MP3, trim the tail, then
`ffmpeg -i in.mp3 -ac 1 -af "volume=<gain>dB" -b:a 96k public/slots/sfx/<name>.mp3`
with the gain that brings it to about -16 LUFS.
