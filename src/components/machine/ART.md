# The Machine (Cora, 2199) costume art

The look: no window, no title, no glow. The conversation floats on black,
in white mono type, and none of it is in plain English: every word is
machinespeak (see `garble.ts`). The only colour is the backdrop's few lit
marks and the cyan of a word that flickers to another reading.

## Backdrop: `public/machine/wallpaper.webp` → `wallpaper` in `art.tsx`

1585×992, converted from `public/cora-bg.png` with
`cwebp -q 95 -sharp_yuv cora-bg.png -o wallpaper.webp` (the sharp YUV keeps
the hairlines crisp). Near-black (#000104) with fine circuitry, grid lines and
runes around the edges, most of it in the bottom right. The left 270px are
empty on purpose: that's where the agent list sits.

It's drawn as an SVG `<image>` (`MachineScene` in `art.tsx`), pinned left
on desktop (`xMinYMid slice`) so the empty band stays under the list, and
pinned right on phones (`xMaxYMid slice`). It breathes: its opacity eases
between 100% and 50% over 16s each way (`mx-sc-breathe` in `machine.css`).
Small rects over its coloured
marks blink now and then (`MARKS`, in the image's own pixels); if the image
is replaced, re-measure those or remove them.

To replace it, keep the same size and the empty left band, and keep the
middle clear: the column of text floats there.

## Drawn (no image needed)

- **The rain** (`rain.tsx`): a canvas over the backdrop, after Aceternity's
  Matrix Trail. A faint grid of machinespeak characters with brighter
  columns falling through it, and a trail that lights up behind the pointer
  and fades. It runs at 30fps only while Cora's scene is showing, is quieter
  behind the agent list, and stands still with reduced motion. Its density,
  speed and fade are the constants at the top of the file.
- **Icons** (`Icon` in `art.tsx`): send (↵), stop and go-to-newest.
- **Machinespeak** (`garble.ts`): the transcoder, the churning tail on a live
  reply and the words that flicker to another reading.
- **Effects** (`machine.css`): /glitch tears the window, /scan sweeps a line
  of light down it, /ping sends rings out from the middle, /override shakes it.
- **The sidebar chip** (`SidebarRow.tsx`): a black chip with corner ticks and
  a dot that blinks cyan while Cora answers.

## Unused

The earlier violet look's pictures are still in `public/machine/` but no
longer referenced: `wallpaper-old.webp`, `void.webp`, `eye.webp`,
`monolith.webp` and `icon-ping.webp`, `icon-scan.webp`, `icon-override.webp`.
