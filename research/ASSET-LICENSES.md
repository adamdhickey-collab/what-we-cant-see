# Asset licenses

| Asset | Where | License | Attribution shown |
| --- | --- | --- | --- |
| AlphaFold prediction AF-P04637-F1 (human p53), model v6 | `public/data/protein-P04637.json`, from alphafold.ebi.ac.uk | CC BY 4.0 | In Chapters 7 and 8 and the Sources drawer: "AlphaFold DB, EMBL-EBI and Google DeepMind" |
| Archivo, Inter, JetBrains Mono | Google Fonts | SIL Open Font License 1.1 | Not required |
| Kepler light curve of Kepler-1772, quarter 4 | `public/data/lightcurve-kic4149450.json`, from MAST | NASA data, not copyrighted | In Chapter 5 ("Kepler data") and the Sources drawer: NASA Kepler, via MAST |
| SDSS DR17 galaxy positions, equatorial slice | `public/data/galaxies-sdss.json`, from SkyServer | SDSS data are public; credit requested | In Chapter 4's More and the Sources drawer; README credits |
| Galaxy, halo, starfield, shoreline, fingertip, bacteria, lenses | Generated procedurally in shaders and code | Original | Labelled "illustrative" or "schematic" on screen |
| Sound effects | Synthesized in the browser (`src/audio/sound.ts`) | Original | Not required |
| Music: Max Richter, "On the Nature of Daylight" | Not in the repository. Played from Fatcat Records' official YouTube upload (`rVN1B-tUpgs`) through YouTube's embedded player (`src/animation/music.ts`) | © the rights holders; embedded under YouTube's Terms of Service, which the uploader allows | On the intro and in Options when music is on; README credits |

No images, video or recorded audio ship in the build. The music is never
downloaded or re-hosted: it streams from YouTube only after a viewer turns it
on, through the no-cookie player, which stays visible at YouTube's minimum
size of 200 × 200 px as its policies require. Any NASA or ESA imagery added later:
NASA media is generally not copyrighted but its guidelines ask for credit and
forbid implied endorsement; ESA imagery is mostly CC BY-SA 3.0 IGO and must
be credited per image. Record each one here before it is committed.
