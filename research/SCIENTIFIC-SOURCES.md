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
| `simulated` | Produced by a simulation or synthetic data | (none in the ride now; the light curve is measured) |
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
| `kepler-1772` | The light curve in Chapter 4 | 3,803 measurements of Kepler-1772 (KIC 4149450), 29.4-minute cadence, 19 Dec 2009 to 19 Mar 2010 | measured | NASA Kepler quarter 4 long cadence, MAST: `kplr004149450-2010078095331_llc.fits` | Reduced by `scripts/fetch-lightcurve.py` (below) |
| `kepler-1772-star` | The star | ≈ 5,540 K, 0.93 R☉, ≈ 870 pc (2,800 ly) | inferred | NASA Exoplanet Archive, composite parameters | |
| `kepler-1772b` | The planet | P = 3.21509 d; depth ≈ 158 ppm; ≈ 3.9 h | inferred | NASA Exoplanet Archive; validated in Valizadegan et al. 2022 | Radius 1.5 R⊕ (KOI table) or 2.7 R⊕ (composite): the star's size is uncertain, so the piece says "a few times wider than Earth" |
| `bls` | The period search | 3.215 d at signal-to-noise ≈ 11; fitted depth ≈ 130 ppm; strongest unrelated period ≈ 6 | inferred | Box least squares, Kovács, Zucker & Mazeh 2002, A&A 391, 369, run live over 3,000 periods | Multiples of the period (12.86 d) score higher than 6 because they contain the same dips |
| `transit-depth` | For scale: dimming as an Earth crosses a Sun | ≈ 84 ppm (0.0084%) | inferred | (R⊕/R☉)², R☉ = 695,700 km (IAU 2015 B3) | ~13 hours for a central transit |
| `alphafold-db` | Structures in the AlphaFold Protein Structure Database | ≈ 200 million | measured | EMBL-EBI, 9 Oct 2024 | Launched July 2021 with ~360,000 |
| `nobel-2024` | Nobel Prize in Chemistry 2024 | Baker (design); Hassabis and Jumper (prediction) | measured | EMBL-EBI as above | |
| `plddt` | What AlphaFold's confidence score means | > 90 very high, 70-90 confident, 50-70 low, < 50 very low | measured | Jumper et al. 2021, Nature 596, 583 | Low can mean disorder **or** a poor prediction |
| `p53` | The structure drawn in the two inner chapters | AF-P04637-F1, model v6, 393 residues, 117 below pLDDT 50 | measured | alphafold.ebi.ac.uk, fetched by `scripts/fetch-protein.mjs` | p53's ends are known to be intrinsically disordered |

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

## Your senses and your attention

| id | Claim | Value | Kind | Source | Notes |
| --- | --- | --- | --- | --- | --- |
| `blind-spot` | Each eye’s blind spot, where the optic nerve leaves the retina | about 5 degrees wide and 7 tall, centered about 15 degrees to the outer side of where you look | measured | Purves et al., Neuroscience, 2nd edition (Sinauer, 2001), chapter 11, “Vision: The Eye” | There are no rods or cones where the nerve and blood vessels leave. The brain fills the gap from what surrounds it, which is why a line through the dot looks unbroken. |
| `fovea` | How much of the view is seen sharply | about 2 degrees, the fovea: roughly a thumbnail at arm’s length | measured | Wandell, Foundations of Vision (Sinauer, 1995) (https://foundationsofvision.stanford.edu/) |  |
| `saccades` | How often the eyes jump, and what the brain does about it | about 3 jumps (saccades) a second, between fixations of 200 to 300 ms; vision is suppressed during each jump | measured | Rayner 1998, Psychological Bulletin 124, 372; Matin 1974, Psychological Bulletin 81, 899 (saccadic suppression) (https://doi.org/10.1037/0033-2909.124.3.372) |  |
| `spectrum` | The range of light a human eye detects | about 380 to 750 nanometers: less than one doubling of wavelength | measured | NASA Science, “Visible Light” (https://science.nasa.gov/ems/09_visiblelight/) | The electromagnetic spectrum runs from radio waves kilometers long to gamma rays smaller than an atom. The bar on screen is logarithmic. |
| `earth-rotation` | How fast the ground moves as Earth turns | about 1,670 km/h at the equator, 1,280 km/h at 40 degrees latitude | inferred | Earth’s equatorial circumference (40,075 km) over one rotation (23.93 hours), times the cosine of latitude; NASA Earth Fact Sheet (https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html) | Faster than an airliner’s cruise, about 900 km/h, anywhere below about 57 degrees latitude. |
| `perception-lag` | How late the brain’s “now” is | visual signals take roughly 50 to 100 ms or more to be processed; the brain extrapolates to compensate | inferred | Nijhawan 2008, “Visual prediction”, Behavioral and Brain Sciences 31, 179 (https://doi.org/10.1017/S0140525X08003804) |  |
| `bits` | The pace of conscious thought, against the senses’ intake | about 10 bits a second for behavior and thought; the senses gather many orders of magnitude more | inferred | Zheng & Meister, “The unbearable slowness of being: Why do we live at 10 bits/s?”, Neuron 113, 192 (2025) (https://doi.org/10.1016/j.neuron.2024.11.008) | The often-quoted “11 million bits in, 40 bits conscious” has no solid primary source and is not used here. |
| `gorilla` | Inattentional blindness: the “invisible gorilla” | about half of people counting basketball passes failed to notice a person in a gorilla suit cross the scene | measured | Simons & Chabris 1999, “Gorillas in our midst”, Perception 28, 1059 (https://doi.org/10.1068/p281059) |  |
| `change-blindness` | Change blindness | large changes between two alternating images go unnoticed for many seconds when a brief blank separates them | measured | Rensink, O’Regan & Clark 1997, Psychological Science 8, 368 (https://doi.org/10.1111/j.1467-9280.1997.tb00427.x) |  |

## Other animals’ senses

| id | Claim | Value | Kind | Source | Notes |
| --- | --- | --- | --- | --- | --- |
| `bee-uv` | Bees see ultraviolet, and flowers use it | bees’ three receptor types peak in ultraviolet, blue and green; many flowers carry ultraviolet nectar guides | measured | Briscoe & Chittka 2001, “The evolution of color vision in insects”, Annual Review of Entomology 46, 471 (https://doi.org/10.1146/annurev.ento.46.1.471) |  |
| `pit-viper` | Pit vipers sense infrared | pit organs detect the warmth of nearby bodies, through the heat-sensitive channel TRPA1 | measured | Gracheva et al. 2010, “Molecular basis of infrared detection by snakes”, Nature 464, 1006 (https://doi.org/10.1038/nature08943) |  |
| `mantis` | Mantis shrimp color vision | 12 types of color receptor, yet poorer at telling close colors apart than humans | measured | Thoen et al. 2014, “A different form of color vision in mantis shrimp”, Science 343, 411 (https://doi.org/10.1126/science.1245824) | A popular fun fact (“they see colors we can’t imagine”) that experiment turned around. |
| `bird-magnet` | Migratory birds sense Earth’s magnetic field | used as a compass, and possibly as a map, on long-distance migration | measured | Mouritsen 2018, “Long-distance navigation and magnetoreception in migratory animals”, Nature 558, 50 (https://doi.org/10.1038/s41586-018-0176-1) |  |
| `hummingbird` | Hummingbird wingbeats while hovering | roughly 20 to 80 beats a second, depending on species and size | measured | Altshuler & Dudley 2002, “The ecological and evolutionary interface of hummingbird flight physiology”, Journal of Experimental Biology 205, 2325 (https://doi.org/10.1242/jeb.205.16.2325) |  |

## Hidden systems, and the comparisons that give numbers a body

| id | Claim | Value | Kind | Source | Notes |
| --- | --- | --- | --- | --- | --- |
| `grapefruit` | The solar system at grapefruit scale | Sun 13 cm; Earth 1.2 mm at 14 m; Proxima Centauri about 3,700 km away | inferred | Arithmetic: a scale of about 1 to 10.7 billion, from the IAU nominal solar radius (695,700 km), the astronomical unit and Proxima’s distance |  |
| `dark-matter` | Galaxies hold together with more mass than we can see | stars far from a galaxy’s center orbit about as fast as those near it, which visible matter alone cannot explain | inferred | Rubin, Ford & Thonnard 1980, Astrophysical Journal 238, 471 (https://doi.org/10.1086/158003) | What dark matter is remains unknown. The violet halo in Chapter 2, and the dark matter lens at the end, are illustrative. |
| `composition` | What the universe is made of | ordinary matter about 5%, dark matter about 27%, dark energy about 68% | inferred | Planck Collaboration 2020, “Planck 2018 results VI”, A&A 641, A6 (https://doi.org/10.1051/0004-6361/201833910) |  |
| `cmb-static` | The Big Bang’s afterglow in everyday static | the cosmic microwave background, 2.725 K, arrives from every direction; a small part (often estimated near 1%) of an untuned analog TV’s static came from it | inferred | NASA WMAP, “Tests of Big Bang: The CMB” (https://map.gsfc.nasa.gov/universe/bb_tests_cmb.html) | The share of static depends on the antenna and the set; the figure is an estimate. |
| `neutrinos` | Neutrinos from the Sun | about 65 billion per square centimeter per second at Earth, by day and by night | inferred | Bahcall, Serenelli & Basu 2005, Astrophysical Journal 621, L85 (standard solar model), confirmed by solar neutrino detectors (https://doi.org/10.1086/428929) | Almost all pass through the whole Earth untouched, so at night they arrive from below. A thumbnail is about one square centimeter. |
| `body-infrared` | The infrared glow of a human body | skin near 34 °C radiates most strongly at about 9.5 micrometers | inferred | Wien’s displacement law: peak wavelength = 2,898 µm·K ÷ temperature |  |
| `radio-air` | The radio lens at the end | waves drawn to show that phone, Wi-Fi and broadcast signals fill the air | illustrative | Drawn in the browser; not a measurement of any place |  |
| `earth-orbit` | Earth’s speed around the Sun | 29.78 km/s on average | measured | NASA Goddard, Earth Fact Sheet (https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html) |  |
| `gps` | Relativity in GPS | satellite clocks gain about 38 microseconds a day on clocks on the ground (45.9 from weaker gravity, minus 7.2 from their speed) | inferred | Ashby 2003, “Relativity in the Global Positioning System”, Living Reviews in Relativity 6, 1 (https://doi.org/10.12942/lrr-2003-1) | Uncorrected, positions would drift by roughly 10 km a day. |
| `plate-drift` | How fast tectonic plates move | a few centimeters a year, typically 2 to 5 | measured | USGS, This Dynamic Earth: The Story of Plate Tectonics (https://pubs.usgs.gov/gip/dynamic/understanding.html) | Measured directly by GPS stations. |
| `fingernails` | How fast fingernails grow | about 3.5 mm a month, a little over 4 cm a year | measured | Yaemsiri, Hou, Slining & He 2010, Journal of the European Academy of Dermatology and Venereology 24, 420 (https://doi.org/10.1111/j.1468-3083.2009.03426.x) |  |
| `sdss` | The galaxies drawn in Chapter 3 | 113,741 galaxies with spectroscopic redshifts between 0.005 and 0.2, in a band 6 degrees wide along the celestial equator | measured | Sloan Digital Sky Survey Data Release 17 (Abdurro’uf et al. 2022, ApJS 259, 35), queried through SkyServer (https://doi.org/10.3847/1538-4365/ac4414) | Positions are measured on the sky; distances are inferred from redshift with a flat ΛCDM cosmology (H0 = 67.7 km/s/Mpc, Ωm = 0.31), out to about 2.7 billion light-years (scripts/fetch-galaxies.mjs). |
| `great-wall` | The Sloan Great Wall | a sheet of galaxies about 1.37 billion light-years long, about a billion light-years away | measured | Gott et al. 2005, “A map of the universe”, Astrophysical Journal 624, 463 (https://doi.org/10.1086/428890) | Found in the same survey drawn here. Whether it is one bound structure is debated; it is a pattern in the map. |
| `euclid-time` | Looking at Euclid’s 26 million galaxies yourself | 26 million seconds is about 301 days | inferred | Arithmetic, one galaxy a second without a break |  |
| `fingertip` | The fingertip drawn in Chapter 6 | generated ridges, about 2 cm across | illustrative | Generated in the browser |  |
| `microbiome` | Bacteria in and on a reference adult | about 38 trillion (3.8 × 10¹³), a ratio to human cells of about 1.3 to 1 | inferred | Sender, Fuchs & Milo 2016, PLoS Biology 14(8): e1002533 (https://doi.org/10.1371/journal.pbio.1002533) | Mostly in the colon. The bacteria drawn around the cell are schematic. |
| `turnover` | Cells the body replaces | about 330 billion a day, about 3.8 million a second, mostly blood cells and gut lining | inferred | Sender & Milo 2021, “The distribution of cellular turnover in the human body”, Nature Medicine 27, 45 (https://doi.org/10.1038/s41591-020-01182-9) |  |
| `wood-wide-web` | The “wood wide web” | field evidence that trees share resources or warnings through fungal networks is weaker than popular accounts say | inferred | Karst et al. 2023, Nature Ecology & Evolution 7, 501 (https://doi.org/10.1038/s41559-023-01986-1) |  |

## Illustrative, said so on screen

- **Chapter 2's galaxy is illustrative**: a two-armed log spiral with a bar,
  roughly the Milky Way's form. Its dark matter halo is illustrative too:
  the extent follows the models, the look does not depict data.
- **Chapter 3's galaxies are real** (`sdss`): every point beyond our own
  galaxy is an SDSS galaxy with a measured redshift. Zoobot's teal share is
  the true ratio, about 1 in 70, but which galaxies are marked is
  illustrative, and the Euclid galaxies Zoobot actually sorted are not these.
- **The fingertip, the bacteria around the cell, and the cell** in Chapter 6
  are schematic.
- **The lenses** on the shore at the end draw real phenomena in an
  illustrative way; `radio-air` says so.

## Still to source

- An experimental p53 structure fragment from the PDB to compare against the
  prediction in the protein chapter.
