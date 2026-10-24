# What We Can’t See

An interactive ride through the limits of perception: what your senses leave
out, and the instruments, AI among them, that find it. By Adam Hickey.

> What happens to our understanding of ourselves when we can perceive more
> of the universe than our senses ever evolved to see?

It plays like a film, 6:15 straight through, the length of its music. It opens on a shore at
dusk as the first stars come out, stars that were there all day, and then
gives a chapter to each reason we can't see something: too far (a slow climb
past town and city to the real Earth, lit as it is right now, with
Minneapolis and Tunja, Colombia, and their live clocks; then the Sun, the
galaxy, and the dark matter holding it together), too many (113,741 real
galaxies, and the machine that looks at them for us), too faint (a planet
hidden in real Kepler data until a search finds it), too small (your cells,
your bacteria, a protein, an atom), and too unsure (an AI's own blind spots).
It ends on the same shore, seen through other eyes, and every claim says how
we know it.

**Live:** https://adamdhickey-collab.github.io/what-we-cant-see/

## Run it

```bash
npm install
npm run dev
```

```bash
npm run build      # typecheck and build to dist/
npm run preview    # serve the build
```

`?kiosk` plays from the first frame and loops after a ten-second rest, for a
wall display. `?music` turns the music
on (a wall display will also need the browser's autoplay allowed), and
`?from=<seconds>` starts it later in the story.

**On a TV or projector:** press F for full screen. Type grows with the
screen's height, margins stay inside a TV's overscan, and a few seconds into
the ride the controls and cursor fade until the mouse moves or a key is
pressed. `?tv` goes further for a big screen far away: larger type, and no
scale bar or meter.

`npm run build` also runs `scripts/check-script.mjs`, which fails on a line
over 18 words or a source missing from the ledger.

`?soundtrack` (development only) plays `local/soundtrack.mp3`, or
`?soundtrack=name.m4a` for another file in `local/`, and lets the music drive
the clock: the story lies along a recording through the cue map in
`src/content/soundtrack.ts`. `local/` is ignored by git and the public build
contains neither the code nor the file. Press M while it plays to log a moment
of the music for tuning the cues.

## What is here

| | |
| --- | --- |
| [`research/CONCEPT.md`](research/CONCEPT.md) | The three approaches evaluated, and the direction taken |
| [`research/SCIENTIFIC-SOURCES.md`](research/SCIENTIFIC-SOURCES.md) | Every figure, its source, its kind of claim |
| [`research/TECHNOLOGY.md`](research/TECHNOLOGY.md) | The stack, what was left out and why, which medium draws which scene |
| [`research/VISUAL-DIRECTION.md`](research/VISUAL-DIRECTION.md) | References, color as meaning, type, motion |
| [`research/STORYBOARD.md`](research/STORYBOARD.md) | The seven chapters, the transitions, reduced motion |
| [`research/EXPERIENCE-AUDIT.md`](research/EXPERIENCE-AUDIT.md) | The audit that turned the piece into a ride, and what changed |
| [`research/ASSET-LICENSES.md`](research/ASSET-LICENSES.md) | What ships and under what terms |

```
src/
  content/     chapters.ts (the script as data), sources.ts (the ledger), extras.ts (lenses, meter)
  animation/   director.ts (the one clock), music.ts, ease.ts
  audio/       sound.ts (synthesized beds and bells)
  experience/  Stage.ts (one renderer, crossfading scenes, labels), loaded as its own chunk
  scenes/      shore, lenses, cosmos, galaxy, sky, web, star, within
  shaders/     palette, the shared point shader, the shore shader
  data/        transit.ts (the Kepler light curve loader, box least squares)
  components/  the HTML layer: narrative, controls, scale navigator, instruments, panels
scripts/
  check-script.mjs        line length and sources, run by the build
  fetch-protein.mjs       AlphaFold DB → public/data/protein-<accession>.json
  fetch-lightcurve.py     MAST Kepler light curve → public/data/lightcurve-kic<id>.json (needs astropy)
  fetch-galaxies.mjs      SDSS DR17 equatorial slice → public/data/galaxies-sdss.json
  fetch-earth.mjs         Natural Earth land → public/data/earth-land.json (a half-degree land map)
```

## Implemented, and not yet

**Working now**

- Seven chapters, the ride (6:15, the length of the music, never stopping) and Wander, on one clock:
  play, pause, scrub, scroll or swipe by line, jump by chapter or by
  landmark on a true logarithmic scale navigator that speaks plainly.
- Scripted moments in place of interaction: a scan along real Kepler data
  and two lenses dissolving over the closing shore, one narrated line each.
- The Earth from real coastlines (Natural Earth), turned and lit as it is at
  the moment of viewing, with Minneapolis and Tunja marked, their live local
  times, and the great-circle distance between them.
- A real slice of the universe: 113,741 SDSS galaxies placed by redshift.
- The galaxy turning too fast for what we can see, and its dark matter halo.
- A working period search on 90 days of real Kepler data for Kepler-1772.
- A real AlphaFold structure (human p53) in three views.
- A fingertip, bacteria, a spectrum bar, a composition
  bar, a hidden-systems meter and an end-of-ride souvenir card.
- Music, off until chosen: Max Richter's "On the Nature of Daylight",
  served with the site, starting with the ride and following its clock.
  Synthesized sound effects are an option too.
- Every claim tagged measured, inferred, illustrative or open question,
  behind an evidence option, with a Sources drawer and a full text version
  that carries each line's detail and the side facts.
- Keyboard control, visible focus, reduced motion, phone layout, a fallback
  when WebGL is missing, Three.js split from the first load.

**Still conceptual**

- An experimental p53 fragment from the PDB to compare against the
  prediction in Chapter 6.
- A WebGPU renderer behind a capability check.

## Deployment

GitHub Pages, from `.github/workflows/pages.yml`, on every push to `main`.
The build uses a relative base, so the same `dist/` also serves from the
root of a Cloudflare Pages project: `wrangler pages deploy dist
--project-name what-we-cant-see` once a Cloudflare account is connected.

## On adamhickey.com

A Lab entry for this would be one card on `lab/index.html` pointing at the
live URL, with a capture of the SDSS wedges (Chapter 3 at about 2:35) as its
picture and one sentence: an interactive piece on scale and the instruments
of seeing, built on real AlphaFold data and a live transit search. It is a
separate site on purpose, so it carries no stylesheet or check from the
portfolio.

## Credits

Protein structure: AlphaFold DB (EMBL-EBI and Google DeepMind), CC BY 4.0.
Light curve: NASA Kepler mission, via MAST.
Music: Max Richter, "On the Nature of Daylight", used with permission.
Coastlines: Natural Earth, public domain, via world-atlas.
Galaxies: Sloan Digital Sky Survey DR17, funded by the Alfred P. Sloan
Foundation, the U.S. Department of Energy Office of Science and the
participating institutions.
Type: Archivo, Inter and JetBrains Mono, SIL Open Font License.
