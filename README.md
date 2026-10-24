# What We Can’t See

A cinematic, interactive exploration of scale, discovery and the new
instruments of seeing. An experiment by Adam Hickey.

> What happens to our understanding of ourselves when we can perceive more
> of the universe than our senses ever evolved to see?

A person sits on a shore at dusk. The piece pulls away from them to the
largest structure ever mapped, then turns inward to the molecules that make
them, and comes back to the same shore. Along the way it asks how we know
each thing it shows: the cosmic web is a map built from redshifts, a planet
is an 84-parts-per-million dip that only a search reveals, and a protein's
shape is now usually a prediction that carries its own measure of doubt.
AI appears as an instrument in that tradition, with its limits stated.

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
wall display.

`?soundtrack` (development only) plays `local/soundtrack.mp3`, or
`?soundtrack=name.m4a` for another file in `local/`, and lets the music drive
the clock: the 3:40 story stretches along a 6:11 piece through the cue map in
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
| [`research/ASSET-LICENSES.md`](research/ASSET-LICENSES.md) | What ships and under what terms |

```
src/
  content/     chapters.ts (the storyboard as data), sources.ts (the ledger)
  animation/   director.ts (the one clock), ease.ts
  experience/  Stage.ts (one renderer, crossfading scenes, labels)
  scenes/      shore, cosmos, galaxy, sky, web, star, within
  shaders/     palette, the shared point shader, the shore shader
  data/        transit.ts (the Kepler light curve loader, box least squares)
  components/  the HTML layer: narrative, controls, scale navigator, instruments, panels
scripts/
  fetch-protein.mjs       AlphaFold DB → public/data/protein-<accession>.json
  fetch-lightcurve.py     MAST Kepler light curve → public/data/lightcurve-kic<id>.json (needs astropy)
```

## Implemented, and not yet

**Working now**

- All seven chapters, guided (3 min 40 s) and Explore, on one clock:
  play, pause, scrub, step by line, jump by chapter or by landmark on a true
  logarithmic scale navigator.
- The shoreline shader, the Earth-to-galaxy pull-back at true ratios, the
  cosmic web, the cell, the protein and the atom.
- A working period search on 90 days of real Kepler data for Kepler-1772,
  one of the planets ExoMiner validated, driven by the narration or by
  hand, with a text summary of what the fold shows.
- A real AlphaFold structure (human p53) in three views: prediction,
  confidence, needs checking.
- Every claim tagged measured, inferred, simulated, illustrative or open
  question, with a Sources drawer and a full text version.
- Keyboard control, visible focus, reduced motion, phone layout, a fallback
  when WebGL is missing.

**Still conceptual**

- A real galaxy-survey sample in place of Chapter 3's illustrative web.
- An experimental p53 fragment from the PDB to compare against the
  prediction in Chapter 6.
- Atmospheric sound (off by default by design; none ships yet).
- Code-splitting Three.js out of the first load, and a WebGPU renderer
  behind a capability check.

## Deployment

GitHub Pages, from `.github/workflows/pages.yml`, on every push to `main`.
The build uses a relative base, so the same `dist/` also serves from the
root of a Cloudflare Pages project: `wrangler pages deploy dist
--project-name what-we-cant-see` once a Cloudflare account is connected.

## On adamhickey.com

A Lab entry for this would be one card on `lab/index.html` pointing at the
live URL, with a capture of the cosmic web (Chapter 3 at about 1:22) as its
picture and one sentence: an interactive piece on scale and the instruments
of seeing, built on real AlphaFold data and a live transit search. It is a
separate site on purpose, so it carries no stylesheet or check from the
portfolio.

## Credits

Protein structure: AlphaFold DB (EMBL-EBI and Google DeepMind), CC BY 4.0.
Light curve: NASA Kepler mission, via MAST.
Type: Archivo, Inter and JetBrains Mono, SIL Open Font License.
