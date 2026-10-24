# Visual direction

## References, and what each is for

- **Ryoji Ikeda, *data-verse* (2019-20).** Data as material at monumental
  scale, in black and white, at a precision that becomes emotional. Taken:
  fine lines, monospaced numerals, the courage of emptiness. Not taken: the
  strobe and the density, which would fight reading.
- **NASA SVS, *Cosmic Web* and Illustris/TNG flythroughs.** The real
  morphology of filaments, nodes and voids. Taken: the shape. Not taken: the
  saturated false color.
- **Eames, *Powers of Ten* (1977).** The arc. Not taken: the continuous zoom.
- **Editorial interactives (NYT, Pudding).** Text that stays readable over
  moving pictures, data that is the story rather than its caption.

## Color carries meaning

| Token | Hex | Means |
| --- | --- | --- |
| `--ink` | `#0A1423` | The ground. Space, the night |
| `--slate` | `#17273B` | Surfaces, the sea at dusk |
| `--ivory` | `#F3F1EA` | Text, and **the human view**: what an eye could see |
| `--copper` | `#CFA67A` | **Observation**: measured light, the real data |
| `--teal` | `#81C8C6` | **Model**: what computation infers or predicts |
| `--violet` | `#7C8EBA` | **The unresolved**: uncertainty, open questions |

The rule: copper is never used for anything modelled, and teal is never used
for anything measured. In Chapter 4 the raw measurements are copper and the
folded model is teal; in Chapter 6 confident residues are teal and the
uncertain ones fade to violet.

## Type

- **Display**: *Archivo* (variable width and weight). Titles are set expanded
  (width 125), extra-light and in capitals: the lettering of instrument
  panels and mission documents, modern without the retro sci-fi of Orbitron,
  Michroma or Exo. The narration uses the same family at normal width and
  light weight, so the voice stays one voice. (Fraunces, a serif, was the
  first draft; it read as literary where the piece wants to read as
  instrument.)
- **Text**: *Inter*, for reading copy.
- **Data**: *JetBrains Mono*, for every number, unit and axis.
- **Inner voice**: *Cormorant Garamond* italic, 500, for the reflective
  lines. A calligraphic serif beside the instrument lettering: a poet's hand,
  after Naropa's roots in brush calligraphy (Chögyam Trungpa) and poetics
  (the Jack Kerouac School). Centered in the open frame over a soft
  darkening, it fades in from a slight blur, like a thought surfacing.

All three from Google Fonts. Display sizes are fluid with `clamp()` so a
title is enormous on a wall display and still fits a phone.

## Motion

- One clock. Everything moves because time moved.
- A few large moments (the rise from horizon to stars; the cosmic web turning
  into view; the folded transit snapping into place) and stillness between.
- Easing is slow out, slower in (`easeInOutCubic`, `easeOutQuint`); nothing
  bounces.
- Reduced motion keeps the compositions and drops the travel.

## Rejected

Neon, lens flares, glowing brains, circuit-board textures, random floating
particles with no referent, and bloom on everything.
