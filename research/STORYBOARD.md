# Storyboard

The storyboard is data: [`src/content/chapters.ts`](../src/content/chapters.ts)
declares every chapter's lines, timings, scale keyframes, camera, controls,
sources and reduced-motion behavior, and the director, the stage, the
narrative and the scale navigator all read it. This page is the overview;
the file is the script.

Running time: **3 min 40 s** guided.

| # | Chapter | Time | Scene | Scale (log₁₀ m) | The moment |
| --- | --- | --- | --- | --- | --- |
| 1 | One human moment | 0:00–0:24 | `shore` shader | 0.2 → 3.9 | A person at dusk. The horizon, 4.7 km away, becomes a row of points |
| 2 | Beyond the horizon | 0:24–0:58 | `cosmos` points + lines | 3.9 → 21.1 | The points rise into stars; Earth; orbits at true scale; Proxima; the galaxy, "The Sun is here" |
| 3 | The great structure | 0:58–1:38 | `web` points | 21.1 → 26.9 | **The big one.** Out of one galaxy into filaments and voids; Zoobot's 1.5% in teal; the web evens into haze inside the observable limit |
| 4 | The patterns we miss | 1:38–2:18 | `star` + transit instrument | 9.1 | 3,803 real Kepler measurements that look like noise; the period search sweeps; at 3.21 days Kepler-1772 b appears |
| 5 | The universe within | 2:18–2:43 | `within` points | 0.2 → −9.8 | A cell, then p53 (real AlphaFold coordinates), then hydrogen's 1s cloud |
| 6 | A new instrument | 2:43–3:15 | `within` + protein panel | −7.9 | Prediction, Confidence, Needs checking: the instrument's claims and its doubt |
| 7 | Back to the shore | 3:15–3:40 | `shore` | 0.2 | The same frame; Andromeda named; the closing question |

## The three proof-of-concept moments

The brief asked for at least three connected visual moments. All seven
chapters run, and these three carry the most work:

1. **Shoreline opening** (Chapter 1). A full-screen shader: twilight sky
   with stars that appear as it darkens, a sea whose reflected glow is
   broken by two octaves of moving noise, a shore, and a seated figure cut
   as negative space. The horizon hairline resolves into points, and those
   points are where Chapter 2's stars rise from.
2. **Expansion into the cosmic structure** (Chapters 2 and 3). One
   continuous pull-back from Earth to the galaxy whose camera distance is
   computed from the scale value, then 180,000 galaxies along procedural
   filaments, orbited, out past a sphere marking the observable limit.
3. **Data revelation** (Chapter 4). A real box-least-squares search over a
   real Kepler light curve, drawn live: raw copper measurements, the fold in
   teal, and the periodogram building as the narration sweeps the period.
   Scrubbing the timeline scrubs the search.

## Transitions

Scenes crossfade over 3.2 seconds around each chapter boundary, by weight,
in one render pass each: the shore paints opaquely first, the point scenes
add light on top. Within a scene, change of scale is the camera's distance
(Chapters 2 and 3) or an object's size (Chapter 5), driven by the same
`scaleAt(t)` the navigator shows. There is never one physical scene across
the whole range: the shore, the solar system, the web and the molecule are
four coordinate systems, in meters-as-pixels, AU, megaparsecs and ångströms.

## Reduced motion

`heldTime()` holds each line's destination composition: the picture cuts
when the narration moves on rather than travelling, ambient drift stops, the
water and stars hold still, and the period search shows its result. Text
still fades, by opacity only.
