# Storyboard

The storyboard is data: [`src/content/chapters.ts`](../src/content/chapters.ts)
declares every chapter's lines, scale keyframes, side facts, sources
and reduced-motion behavior, and the director, the stage, the narrative, the
sound and the scale navigator all read it. This page is the overview; the
file is the script.

Running time: **6:15**, straight through, the length of its music. The ride
never stops or asks anything of the viewer; it plays like a film, and the
script is cut to fit the song, not the song stretched to fit the script.
Science cut from the ride lives on in each chapter's side facts, in the Text
version. Nobody times a line by hand: each stays up for 1.5
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

**Two voices.** The outer voice says what instruments have found. After the
key finding in each chapter, an inner voice (`inner: true`, set in italics,
given an extra moment) turns it toward the viewer's own awareness, in the
language of the contemplative psychology taught at Naropa University: the
stars hidden by daylight and basic goodness; dark matter and beginner's mind;
the cosmic web and dependent arising; a flood of galaxies and mindfulness; a
signal found only by stacking, and practice; the late-built "now" and
impermanence; your bacteria and interbeing; the parts of a person and no self
among them; a model's loose ends and maitri. A line that names a teaching is
tagged *Contemplative teaching* and cites where Naropa teaches it
([`NAROPA-EDITION.md`](NAROPA-EDITION.md)); where a teaching and a
measurement rhyme, the line says which is which.

AI appears where it actually works in science, as an attention machine:
Zoobot and ExoMiner don't see farther than we do, they look at more. The
blind spot named on the shore and the model's blind spot in Chapter 7 are
the same idea, a person's and a machine's.

## Chapters

| # | Chapter | Time | Scene | Scale (log₁₀ m) | The moment |
| --- | --- | --- | --- | --- | --- |
| 1 | The shore | 0:00–0:45 | `shore` shader | 0.2 → 3.9 | The title at dusk. The first stars come out: "They were there all day, hidden by the light." Basic goodness; the horizon; the blind spot your brain paints over |
| 2 | Too far | 0:45–1:34 | `cosmos` | 3.9 → 21.6 | Earth, the eight-minute-old Sun, the orbits, the galaxy. It turns too fast; a violet halo appears; 5% of everything; beginner's mind |
| 3 | Too many | 1:34–2:19 | `web`, real SDSS galaxies | 21.6 → 27.2 | 113,741 real galaxies in two wedges meeting at us, gathered into threads: dependent arising. Euclid's 26 million; Zoobot's picks appear in teal; mindfulness. The observable limit as a shell of light |
| 4 | Too faint | 2:19–3:09 | `star` + transit lab | 9.1 | A scan line runs along 90 days of Kepler data and finds nothing; then the period search sweeps and Kepler-1772 b appears at 3.21 days. Practice, too, shows itself in the stacking |
| 5 | Too fast, too slow | 3:09–3:52 | page only, time lab | 0.2 | A wing you see as a blur, a clock you never see move until it speeds itself up 3,600×, a "now" built late, impermanence, the narrow band a person can watch |
| 6 | Too small | 3:52–4:40 | `within` | 0.2 → −9.8 | A fingertip, a cell with bacteria around it (interbeing), p53, hydrogen's cloud of maybes, and no self found among the parts |
| 7 | Too unsure | 4:40–5:25 | `within` + protein panel | −7.9 | AlphaFold marks its own doubt; the loose ends turn violet; maitri. Then: pattern, understanding, awareness, an open question |
| 8 | New eyes | 5:25–6:15 | `shore` + lenses | 0.2 | Andromeda named. The same shore through other eyes: infrared, then neutrinos. "Health and wellbeing are innate." Clear again for the closing question, then the souvenir |

## Bridges

The chapter titles carry each change of place: every title names the next
reason we can't see something. The spoken bridges between chapters were cut
to fit the music.

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
  follows a scrub, and, being as long as the ride, ends with it.
- **Options**: music, sound effects (synthesized; quiet while the music
  plays), the device's voice reading each line, and the evidence tags.

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
