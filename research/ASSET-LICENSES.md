# Asset licenses

| Asset | Where | License | Attribution shown |
| --- | --- | --- | --- |
| AlphaFold prediction AF-P04637-F1 (human p53), model v6 | `public/data/protein-P04637.json`, from alphafold.ebi.ac.uk | CC BY 4.0 | In Chapters 6 and 7 and the Sources drawer: "AlphaFold DB, EMBL-EBI and Google DeepMind" |
| Archivo, Inter, JetBrains Mono | Google Fonts | SIL Open Font License 1.1 | Not required |
| Kepler light curve of Kepler-1772, quarter 4 | `public/data/lightcurve-kic4149450.json`, from MAST | NASA data, not copyrighted | In Chapter 4 ("Kepler data") and the Sources drawer: NASA Kepler, via MAST |
| Natural Earth 1:110m land, as a half-degree land map | `public/data/earth-land.json`, from world-atlas 2.0.2 on jsDelivr | Public domain | In the Sources drawer; README credits |
| SDSS DR17 galaxy positions, equatorial slice | `public/data/galaxies-sdss.json`, from SkyServer | SDSS data are public; credit requested | In Chapter 3's More and the Sources drawer; README credits |
| Galaxy, halo, starfield, shoreline, fingertip, bacteria, lenses | Generated procedurally in shaders and code | Original | Labelled "illustrative" or "schematic" on screen |
| Sound effects | Synthesized in the browser (`src/audio/sound.ts`) | Original | Not required |
| Music: Max Richter, "On the Nature of Daylight" (MP3, 192 kbps, 6:15) | `public/audio/on-the-nature-of-daylight.mp3`, played by `src/animation/music.ts` | © the rights holders; used with permission held by Adam Hickey | On the intro and in Options when music is on; README credits |

No images or video ship in the build. The one recording, the music, is
fetched only after a viewer turns music on. Any NASA or ESA imagery added later:
NASA media is generally not copyrighted but its guidelines ask for credit and
forbid implied endorsement; ESA imagery is mostly CC BY-SA 3.0 IGO and must
be credited per image. Record each one here before it is committed.
