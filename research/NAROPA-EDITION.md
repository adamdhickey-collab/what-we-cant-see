# The Naropa edition

`?edition=naropa`: the ride for a student of contemplative psychology at
Naropa University in Boulder. The scenes, the data, the scale and every
figure are the original's. The inner voice is new, drawn from what her
program teaches, and the ride runs about 12 minutes instead of 10.

## What the program teaches

Naropa now calls the major the **BA in Psychology**, and still calls the
field contemplative psychology. Read in the 2025–26 Academic Catalog
(pp. 216–222) and the 2026–27 web catalog, retrieved 2026-10-24.

- **Its founding principle:** the program is "guided by the principle that
  psychological health and wellbeing are innate".
- **Its ways of knowing:** contemplative practice, empirical research,
  theoretical analysis, narrative, group dynamics and community engagement.
  First-person inquiry sits beside the lab, and doesn't replace it.
- **Required of every student:**
  - PSYB-101 Introduction to Psychology
  - **PSYB-314 Psychology of Mindfulness Meditation** (mindfulness-awareness
    practice from the Tibetan and Zen traditions)
  - PSYB-301 Research Methods and Statistics
  - a contemplative community retreat (sitting and walking meditation, tonglen,
    Maitri Space Awareness)
  - one of two milestone courses, **PSYB-325 Awakening Compassion** or
    **PSYB-368 Psychology & Neuroscience of Emotion**
- **Its concentrations:**
  - Contemplative Neuroscience (**PSYB-462**, which treats practice "as
    laboratory for investigating their own mind and brain")
  - Psychological Science (including **PSYB-234 Perception**, which pairs
    introspection with lab work on perception)
  - Health and Healing
  - Somatic Psychology
  - Transpersonal and Humanistic
- **Naropa-wide:** a contemplative core (REL-160 Meditation Practicum, on "the
  discovery of impermanence" and "the cultivation of maitri"; COR-130, on
  basic goodness and beginner's mind) and the Tree of Contemplative
  Education (embodiment, interbeing, basic goodness, brilliant sanity).
- **Its founding:** Chögyam Trungpa founded Naropa in 1974, with the Jack
  Kerouac School begun by Allen Ginsberg and Anne Waldman.

## How the edition uses it

The original's inner voice, written in the spirit of Ram Dass, is replaced
in this edition by 21 lines of three kinds:

- **Teachings.** Ten lines name an idea from the program. Each is tagged
  *Contemplative teaching*, shown in ivory (the page's color for the human
  observer), and cites the Naropa course or page that teaches it.
- **Reflections.** Plain lines that turn a finding toward the viewer, with
  no claim to cite.
- **Practices.** Three invitations to try something and notice it: feel your
  weight on the rock, follow one breath. Each gets a few extra seconds.

| Where | The finding | What the edition sets beside it |
| --- | --- | --- |
| Shore | Stars hidden all day by the light | Basic goodness, hidden by busy thought (Trungpa) |
| Shore | The blind spot the brain paints over | Introspection and the lab see different things (PSYB-234) |
| Shore | The still ground spins east | Feel your weight settle: practice |
| Too far | Dark matter: "no one knows what it is" | Beginner's mind: not knowing, and looking anyway |
| Too many | Galaxies gathered into a web | Dependent arising, with the guard that the web is gravity, not a teaching |
| Too many | Zoobot looks at more, not farther | About 10 bits a second of conscious throughput, and mindfulness-awareness (PSYB-314) as training where attention rests |
| Too faint | No single measurement shows the planet | No single sitting shows much either |
| Too faint | "Validated" means very probably | Holding a finding lightly, in the lab and on the cushion |
| Too fast, too slow | "Now" is built a tenth of a second late | Impermanence (REL-160); then one breath, start to finish |
| Too small | 38 trillion bacteria live in and on you | Interbeing (Thich Nhat Hanh), or symbiosis in biology's word |
| Too small | 3.8 million cells replaced a second | The body that began the ride isn't quite the one watching |
| Too small | Down to an atom | The five skandhas: no self found in the parts |
| Too unsure | AlphaFold marks its own doubt | Maitri: seeing your own loose ends without judgment (PSYB-415) |
| Too unsure | Whether a machine could be aware is an open question | Contemplative neuroscience studies awareness from both sides (PSYB-462) |
| New eyes | Every instrument shows more of what was there | Health and wellbeing are innate: the program's founding principle |

## Guards

- **A teaching is never a finding.** Where a teaching and a measurement rhyme,
  the line says which is which, as in "The web is gravity, not a teaching"
  and "A biologist would say symbiosis".
- **No quantum mysticism.** The electron cloud is followed by the skandhas as
  a turn from the parts of matter to the parts of a person, and its ledger
  entry says the atom says nothing about selves.
- **No promises from meditation.** The edition never claims meditation
  widens perception or raises conscious bandwidth. It trains where attention
  goes.
- **Every name and phrase comes from a Naropa catalog course or Naropa page.**
  The skandhas are taught in a graduate course (CNSC-603), and the ledger
  says so.

The ledger entries are in [`src/content/sources.ts`](../src/content/sources.ts),
marked `edition: 'naropa'`. The lines are in
[`src/content/naropa.ts`](../src/content/naropa.ts).
`npm run build` checks both editions.
