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

---

## Drawn (SVG and CSS, no prompt needed)

These stay vector. They live in `SlotsLayout.tsx`, `art.tsx`, `symbols.tsx`
and `slots.css`:

- **The cabinet**: cherry lacquer with gold trim and a neon glow on the floor
  beneath it, the marquee (neon "Lucky Prompt", the red 777, the progressive
  AGI jackpot on an LED, the TILT lamp), the chasing bulbs, the button deck,
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
