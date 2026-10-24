# Storyboard

The storyboard is data: [`src/content/chapters.ts`](../src/content/chapters.ts)
declares every chapter's lines, scale keyframes, stops, side facts, sources
and reduced-motion behavior, and the director, the stage, the narrative, the
sound and the scale navigator all read it. This page is the overview; the
file is the script.

Running time: **about 8 min 40 s** riding, plus however long the viewer
spends at the four stops. Nobody times a line by hand: each stays up for 1.5
seconds plus a second for every three words, and `npm run build` fails if a
line runs past 18 words or cites a source the ledger lacks
(`scripts/check-script.mjs`).

## The idea that holds it together

Every chapter is **one reason we can't see something**, and its title says
which: too far, too many, too faint, too fast or too slow, too small, too
unsure. The arc:

> Your senses edit the world → we built instruments to get past each limit →
> now we see more than anyone can look at → so we built machines to look for
> us → and they have blind spots too → so what's still in front of you?

AI appears where it actually works in science, as an attention machine:
Zoobot and ExoMiner don't see farther than we do, they look at more. The
blind spot in the pre-show and the model's blind spot in Chapter 8 are the
same idea, a person's and a machine's.

## Chapters

| # | Chapter | Time | Scene | Scale (log₁₀ m) | The moment |
| --- | --- | --- | --- | --- | --- |
| 1 | Your eyes | 0:00–0:36 | page only | 0.2 | **Stop:** find your own blind spot. The dot vanishes and the line runs straight through it |
| 2 | The shore | 0:36–1:21 | `shore` shader | 0.2 → 3.9 | The opening title. The horizon, the spectrum bar (visible light as a sliver), the ground spinning faster than a jet |
| 3 | Too far | 1:21–2:32 | `cosmos` | 3.9 → 21.6 | Earth, the eight-minute-old Sun, grapefruit scale, orbits, Proxima, the galaxy. It turns too fast; a violet halo appears; 5% of everything |
| 4 | Too many | 2:32–3:44 | `web`, real SDSS galaxies | 21.6 → 27.2 | 113,741 real galaxies in two wedges meeting at us. 26 million from Euclid would take ten months to look at; Zoobot's picks in teal, toggleable. The observable limit as a shell of light |
| 5 | Too faint | 3:44–5:02 | `star` + transit lab | 9.1 | **Stop:** tap where you think the planet is. Then the period search sweeps and Kepler-1772 b appears at 3.21 days |
| 6 | Too fast, too slow | 5:02–5:47 | page only, time lab | 0.2 | A wing you see as a blur, a clock you never see move (with a 3,600× button), a ruler of time with the narrow band a person can watch |
| 7 | Too small | 5:47–6:44 | `within` | 0.2 → −9.8 | A fingertip, a cell with bacteria around it, four million cells replaced a second, p53, hydrogen's cloud of maybes |
| 8 | Too unsure | 6:44–7:54 | `within` + protein panel | −7.9 | **Stop:** guess where AlphaFold is least sure. The loose ends, in violet. Then: pattern, noticing, awareness, an open question |
| 9 | New eyes | 7:54–8:39 | `shore` + lenses | 0.2 | Andromeda named. **Stop:** five lenses over the same shore (infrared, radio, neutrinos, magnetic field, dark matter). The closing question, then the souvenir |

## Stops

At the end of a line marked `hold`, the ride stops and waits (`HOLDS`
in chapters.ts, `director.tick`). The caption says it's the viewer's turn and
offers a skip. A seek never trips a stop, so scrubbing and Wander mode move
freely. On a wall (`?kiosk`) each stop carries on by itself after seven
seconds, and the lenses cycle on their own.

## Bridges

Every chapter's last line opens the next, so no change of place arrives
unexplained: "Distance hides things. So does sheer number." / "Sometimes
what you're looking for isn't far away at all. It's buried in noise." /
"Some things hide in time instead." / "We've been looking outward. The
strangest place might be in here." / "Down here, nobody can look directly.
So we've started asking machines to guess." / "Which brings us back to the
one instrument you carry everywhere."

## Alongside the script

- **More** on a line opens the names, dates and exact figures that the
  general-audience line leaves out.
- **Did you know?** opens a chapter's side facts (`facts`), each sourced.
- **The meter** counts hidden systems from the moment the ride begins:
  neutrinos through your thumbnail, kilometers around the Sun, cells
  replaced, eye jumps hidden (`src/content/extras.ts`).
- **The souvenir** at the end shows the meter's totals and the closing
  question, to save as an image or share.
- **Options**: sound (synthesized, off by default), the device's voice
  reading each line, and the evidence tags on each line.

## Transitions

Scenes crossfade over 3.2 seconds around each chapter boundary, by weight,
in one render pass each. The intro sits over the opening shore, which fades
to the dark pre-show when the ride begins. Within a scene, change of scale is
the camera's distance (Chapters 3 and 4) or an object's size (Chapter 7),
driven by the same `scaleAt(t)` the navigator shows. Anything that moves
with the story (the halo, the planet's crossing, the bacteria) is keyed to a
line's id, so rewriting a line never breaks the picture.

## Reduced motion

`heldTime()` holds each line's destination composition: the picture cuts
when the narration moves on rather than travelling, ambient drift stops, the
water, stars and lenses hold still, the galaxy does not turn, and the period
search shows its result. Text still fades, by opacity only.
