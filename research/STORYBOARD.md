# Storyboard

The storyboard is data: [`src/content/chapters.ts`](../src/content/chapters.ts)
declares every chapter's lines, scale keyframes, side facts, sources
and reduced-motion behavior, and the director, the stage, the narrative, the
sound and the scale navigator all read it. This page is the overview; the
file is the script.

Running time: **9 minutes**, straight through. The ride never stops or asks
anything of the viewer; it plays like a film. Nobody times a line by hand: each stays up for 1.5
seconds plus a second for every three words, and `npm run build` fails if a
line runs past 18 words or cites a source the ledger lacks
(`scripts/check-script.mjs`).

## The idea that holds it together

Every chapter is **one reason we can't see something**, and its title says
which: too far, too many, too faint, too fast or too slow, too small, too
unsure. The arc:

> The stars were there all day → your senses edit the world → we built
> instruments to get past each limit →
> now we see more than anyone can look at → so we built machines to look for
> us → and they have blind spots too → so what's still in front of you?

AI appears where it actually works in science, as an attention machine:
Zoobot and ExoMiner don't see farther than we do, they look at more. The
blind spot named on the shore and the model's blind spot in Chapter 7 are
the same idea, a person's and a machine's.

## Chapters

| # | Chapter | Time | Scene | Scale (log₁₀ m) | The moment |
| --- | --- | --- | --- | --- | --- |
| 1 | The shore | 0:00–1:00 | `shore` shader | 0.2 → 3.9 | The title at dusk. The first stars come out: "They were there all day, hidden by the light." The horizon, the spectrum bar, the blind spot your brain paints over, the ground spinning faster than a jet |
| 2 | Too far | 1:00–2:12 | `cosmos` | 3.9 → 21.6 | Earth, the eight-minute-old Sun, grapefruit scale, orbits, Proxima, the galaxy. It turns too fast; a violet halo appears; 5% of everything |
| 3 | Too many | 2:12–3:23 | `web`, real SDSS galaxies | 21.6 → 27.2 | 113,741 real galaxies in two wedges meeting at us. Euclid's 26 million would take ten months to look at; Zoobot's picks appear in teal. The observable limit as a shell of light |
| 4 | Too faint | 3:23–4:42 | `star` + transit lab | 9.1 | A scan line runs along 90 days of Kepler data and finds nothing; then the period search sweeps and Kepler-1772 b appears at 3.21 days |
| 5 | Too fast, too slow | 4:42–5:26 | page only, time lab | 0.2 | A wing you see as a blur, a clock you never see move until it speeds itself up 3,600×, a ruler of time with the narrow band a person can watch |
| 6 | Too small | 5:26–6:24 | `within` | 0.2 → −9.8 | A fingertip, a cell with bacteria around it, four million cells replaced a second, p53, hydrogen's cloud of maybes |
| 7 | Too unsure | 6:24–7:35 | `within` + protein panel | −7.9 | AlphaFold marks its own doubt; the loose ends turn violet. Then: pattern, noticing, awareness, an open question |
| 8 | New eyes | 7:35–9:00 | `shore` + lenses | 0.2 | Andromeda named. The same shore through other eyes, one line each, dissolving into the next: infrared, radio, neutrinos, magnetic field, dark matter. Clear again for the closing question, then the souvenir |

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
- **Music**, off until chosen on the intro or in Options: "On the Nature of
  Daylight" follows the story's own clock, so lines keep their reading time.
  It starts the moment the ride does, pauses only if the viewer pauses,
  follows a scrub, and, being 6:15 against a 9-minute ride, ends during
  *Too small*.
- **Options**: music, sound effects (synthesized; quiet while the music
  plays, back for the stretch after it), the device's voice reading each line, and the evidence tags.

## Transitions

Scenes crossfade over 3.2 seconds around each chapter boundary, by weight,
in one render pass each. The intro sits over the opening shore, and the ride
begins in that same frame. Within a scene, change of scale is the camera's
distance (Chapters 2 and 3) or an object's size (Chapter 6),
driven by the same `scaleAt(t)` the navigator shows. Anything that moves
with the story (the stars, the halo, the scan, the clock, the lenses) is keyed to a
line's id, so rewriting a line never breaks the picture.

## Reduced motion

`heldTime()` holds each line's destination composition: the picture cuts
when the narration moves on rather than travelling, ambient drift stops, the
water, stars and lenses hold still, the galaxy does not turn, and the period
search shows its result. Text still fades, by opacity only.
