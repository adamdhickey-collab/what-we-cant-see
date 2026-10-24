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
version. Nobody times a line by hand: each stays up for 1.8 seconds plus a
second for every 2.7 words, an unhurried pace, and the closing line holds
until the music's last notes. `npm run build` fails if a line runs past 18
words, cites a source the ledger lacks, or the ride and the music differ by
more than a second (`scripts/check-script.mjs`).

## The idea that holds it together

Every chapter is **one reason we can't see something**, and its title says
which: too far, too many, too faint, too small, too unsure. The arc:

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
| 1 | The shore | 0:00–0:50 | `shore` shader | 0.2 → 3.9 | The title at dusk. The first stars come out: "They were there all day, hidden by the light." The horizon, the spectrum bar |
| 2 | Too far | 0:50–2:18 | `cosmos` | 3.9 → 21.6 | A slow climb: a town, a city, a coast, then the whole Earth from real coastlines, lit as it is right now. Minneapolis and Tunja, Colombia, 4,790 km apart, with their live clocks. A long pull out to the eight-minute-old Sun, the orbits, the galaxy turning too fast, a violet halo, 5% of everything |
| 3 | Too many | 2:18–3:01 | `web`, real SDSS galaxies | 21.6 → 26.0 | 113,741 real galaxies in two wedges meeting at us, gathered into threads. Euclid's 26 million would take ten months to look at; Zoobot's picks appear in teal |
| 4 | Too faint | 3:01–3:58 | `star` + transit lab | 9.1 | A scan line runs along 90 days of Kepler data and finds nothing; then the period search sweeps and Kepler-1772 b appears at 3.21 days |
| 5 | Too small | 3:58–4:44 | `within` | 0.2 → −9.8 | A fingertip, a cell with bacteria around it, p53, hydrogen's cloud of maybes |
| 6 | Too unsure | 4:44–5:20 | `within` + protein panel | −7.9 | AlphaFold marks its own doubt; the loose ends turn violet. Pattern is not understanding; machine awareness, an open question |
| 7 | New eyes | 5:20–6:15 | `shore` + lenses | 0.2 | Andromeda named. The same shore through other eyes: infrared, then neutrinos. Clear again for the closing question, held to the music's last notes, then the souvenir |

## Bridges

Every chapter's last line opens the next, so no change of place arrives
unexplained: "Distance hides things. So does sheer number." / "Sometimes
what you're looking for isn't far away. It's buried in noise." / "We've been
looking outward. The strangest place might be in here." / "Down here, nobody
can look directly. So we've started asking machines to guess." / "Which
brings us back to the one instrument you carry everywhere."

## Alongside the script

- **The Text version** carries what the screen leaves out: each line's
  names, dates and exact figures (`more`) and each chapter's side facts
  (`facts`), each sourced. Nothing under the caption asks to be clicked.
- **The Earth's clocks** are each city's live local time, and its day/night
  line is drawn from where the Sun is overhead at the moment of viewing.
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
  plays), the evidence tags, and full screen.

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
