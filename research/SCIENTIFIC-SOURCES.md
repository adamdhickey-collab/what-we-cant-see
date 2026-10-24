# Scientific source ledger

The in-app ledger is [`src/content/sources.ts`](../src/content/sources.ts); it
is what the Sources drawer reads, and every figure on screen points at an
entry there by id. This file is its reading copy with the reasoning. When the
two disagree, the code is the bug-free one by construction (the screen draws
from it), so fix this file.

Retrieved: **2026-10-24** unless noted.

## Kinds of claim

Every entry is tagged with exactly one, and the tag is shown to the viewer:

| Tag | Means | Example |
| --- | --- | --- |
| `measured` | A direct observation or a defined constant | The astronomical unit |
| `inferred` | A value derived from measurement through a physical model | The size of the observable universe |
| `simulated` | Produced by a simulation or synthetic data | The light curve in Chapter 4 |
| `illustrative` | A visual arrangement chosen to explain, not to depict data | The cosmic web's points |
| `speculative` | An open question, stated as one | Machine consciousness |

## Scale

| id | Claim | Value | Kind | Source | Notes |
| --- | --- | --- | --- | --- | --- |
| `horizon` | Distance to the sea horizon for an eye 1.7 m up | ≈ 4.7 km | inferred | Geometry, d = √(2Rh), R = 6,371 km | Ignores refraction, which adds a few percent |
| `earth-radius` | Earth's mean radius | 6,371.0 km | measured | NASA Earth Fact Sheet, nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html | Volumetric mean |
| `au` | Astronomical unit | 149,597,870,700 m (exact) | measured | IAU 2012 Resolution B2 | A defined unit |
| `light-minutes` | Sunlight's travel time to Earth | ≈ 499 s, 8 min 19 s | inferred | au / c, c = 299,792,458 m/s (exact) | |
| `proxima` | Nearest star beyond the Sun | ≈ 4.24 light-years | measured | NASA, science.nasa.gov (Proxima Centauri) | Parallax |
| `milky-way` | Diameter of the Milky Way's disk | ≈ 100,000 light-years | inferred | NASA, "How Big Is Space?" (Small Steps, Giant Leaps ep. 61) | Edge is not sharp; estimates range widely |
| `andromeda` | Distance to the Andromeda Galaxy | ≈ 2.5 million light-years | measured | NASA, science.nasa.gov (Andromeda) | Farthest object most people can see unaided |
| `observable` | Diameter of the observable universe | ≈ 92 billion light-years | inferred | NASA, "How Big Is Space?" | Depends on the expansion history in ΛCDM. **The whole universe is probably larger; whether it is finite is unknown** (same source) |
| `age` | Age of the universe | 13.787 ± 0.020 billion years | inferred | Planck Collaboration 2020, A&A 641, A6 | |
| `composition` | Ordinary matter, dark matter, dark energy | ≈ 4.9%, 26.6%, 68.5% | inferred | Planck 2018 (as above), base ΛCDM | Model-dependent |
| `cells` | Cells in a reference adult human | ≈ 3.0 × 10¹³ | inferred | Sender, Fuchs & Milo 2016, PLoS Biol 14(8): e1002533 | 70 kg reference man; most are red blood cells |
| `bohr` | Bohr radius (scale of a hydrogen atom) | 5.29 × 10⁻¹¹ m | measured | CODATA 2018 | |
| `proton` | Proton charge radius | 0.8414 fm | measured | CODATA 2018 | |

**A thing the numbers say that the piece uses.** The range from a proton
(~1.7 × 10⁻¹⁵ m across) to the observable universe (~8.7 × 10²⁶ m) is about
42 orders of magnitude. Its midpoint, in logarithm, is near 10⁶ m, the size
of a country. **People are not at the center of the scale**, and the scale
navigator draws it that way rather than flattering the viewer.

## Instruments and AI

| id | Claim | Value | Kind | Source | Notes |
| --- | --- | --- | --- | --- | --- |
| `euclid-q1` | Euclid's first quick data release | 19 March 2025; 26 million galaxies; 63.1 deg² in three deep fields | measured | ESA, "Euclid opens data treasure trove, offers glimpse of deep fields" | One week of observations; farthest galaxies ~10.5 billion light-years |
| `zoobot` | Galaxies classified by the Zoobot model in that release | > 380,000, trained with 9,976 Galaxy Zoo volunteers | measured | Same | A catalogue of shapes, not distances |
| `euclid-lenses` | Strong gravitational lens candidates | 500, almost all new | measured | Same | Built from AI, citizen science, **expert vetting** and modelling |
| `exominer` | Kepler planets validated by ExoMiner | 301 | measured | Valizadegan et al. 2022, ApJ 926, 120; NASA Ames, 22 Nov 2021 | "Validated" is statistical, not independent confirmation. At 99% precision it recovered 93.6% of known planets in its test set |
| `exominer-pp` | TESS candidates from ExoMiner++'s first run | ≈ 7,000 | measured | NASA Science, "Deep learning exoplanets TESS", 22 Jan 2026 | **Candidates**, each needing follow-up |
| `kepler-1772` | The light curve in Chapter 4 | 3,803 measurements of Kepler-1772 (KIC 4149450), 29.4-minute cadence, 19 Dec 2009 to 19 Mar 2010 | measured | NASA Kepler quarter 4 long cadence, MAST: `kplr004149450-2010078095331_llc.fits` | Reduced by `scripts/fetch-lightcurve.py` (below) |
| `kepler-1772-star` | The star | ≈ 5,540 K, 0.93 R☉, ≈ 870 pc (2,800 ly) | inferred | NASA Exoplanet Archive, composite parameters | |
| `kepler-1772b` | The planet | P = 3.21509 d; depth ≈ 158 ppm; ≈ 3.9 h | inferred | NASA Exoplanet Archive; validated in Valizadegan et al. 2022 | Radius 1.5 R⊕ (KOI table) or 2.7 R⊕ (composite): the star's size is uncertain, so the piece says "a few times wider than Earth" |
| `bls` | The period search | 3.215 d at signal-to-noise ≈ 11; fitted depth ≈ 130 ppm; strongest unrelated period ≈ 6 | inferred | Box least squares, Kovács, Zucker & Mazeh 2002, A&A 391, 369, run live over 3,000 periods | Multiples of the period (12.86 d) score higher than 6 because they contain the same dips |
| `transit-depth` | For scale: dimming as an Earth crosses a Sun | ≈ 84 ppm (0.0084%) | inferred | (R⊕/R☉)², R☉ = 695,700 km (IAU 2015 B3) | ~13 hours for a central transit |
| `alphafold-db` | Structures in the AlphaFold Protein Structure Database | ≈ 200 million | measured | EMBL-EBI, 9 Oct 2024 | Launched July 2021 with ~360,000 |
| `nobel-2024` | Nobel Prize in Chemistry 2024 | Baker (design); Hassabis and Jumper (prediction) | measured | EMBL-EBI as above | |
| `plddt` | What AlphaFold's confidence score means | > 90 very high, 70-90 confident, 50-70 low, < 50 very low | measured | Jumper et al. 2021, Nature 596, 583 | Low can mean disorder **or** a poor prediction |
| `p53` | The structure drawn in Chapters 5 and 6 | AF-P04637-F1, model v6, 393 residues, 117 below pLDDT 50 | measured | alphafold.ebi.ac.uk, fetched by `scripts/fetch-protein.mjs` | p53's ends are known to be intrinsically disordered |

## Chapter 4's data, and how it was chosen

The light curve is real: NASA Kepler's quarter 4 observations of
Kepler-1772, a planet that ExoMiner validated in 2021. It was chosen in three
steps, recorded so the choice can be checked:

1. From the NASA Exoplanet Archive, single-planet systems whose discovery
   reference is Valizadegan et al. 2022 (the ExoMiner paper), with periods
   from 1.5 to 20 days.
2. Of those, ranked by the Kepler pipeline's own model signal-to-noise over
   the whole mission, a planet strong enough to stand out in one 90-day
   quarter (Kepler-1772 b, 53) with a dip smaller than the scatter of a
   single measurement (158 ppm against 132 ppm), so no one crossing is
   visible. Kepler-1933 b, the first choice, was rejected at this step: its
   126 ppm dip sits under 400 to 900 ppm of scatter.
3. Of that star's quarters, the full one with the least scatter: quarter 4.

`scripts/fetch-lightcurve.py` then takes the pipeline's systematics-corrected
flux (PDCSAP), keeps good-quality cadences, normalizes the quarter, removes
the star's slow variability with a two-day running median, and drops points
more than 5 sigma above the trend. No step uses the planet's period or
position; a pipeline that did would be answering its own question. The search
in the browser then recovers 3.215 days, against the catalog's 3.21509.

The search is box least squares, the family of method the Kepler pipeline
used. It is not ExoMiner, and the chapter says what ExoMiner added: sorting
real signals from look-alikes.

## Illustrative, said so on screen

- **Chapter 3's cosmic web is illustrative.** Points are placed along
  procedural filaments between nodes to resemble the morphology in redshift
  surveys and N-body simulations. It is not a map of any real region.
- **Chapter 2's galaxy is illustrative**: a two-armed log spiral with a bar,
  roughly the Milky Way's form.

## Still to source

- A real large-scale-structure sample (SDSS or 2MRS) for Chapter 3.
- An experimental p53 structure fragment from the PDB to compare against the
  prediction in Chapter 6.
