// The storyboard as data. Every chapter is one reason we can't see something,
// and declares what it says, what it shows and which scale it sits at; the
// director, the stage, the narrative and the scale navigator all read from
// this one list. The prose companion is research/STORYBOARD.md.
//
// The ride plays straight through, start to finish, like a film: nothing waits
// for the viewer. Two voices tell it: the outer one says what instruments
// have found, and an inner one, set apart, turns each finding toward the
// viewer's own awareness, written in the spirit of Ram Dass's teachings. The
// Naropa edition (naropa.ts) tells the same ride with another inner voice.
// Nobody writes a line's timing by hand. Each line stays on
// screen for as long as an unhurried reader needs (READ_LEAD plus READ_WPS
// words a second), so the ride can never outrun the person reading it, and
// everything that moves with the story is keyed to a line's id rather than
// to a second.
// scripts/check-script.mjs holds the line length and the sources to account.

import type { LensId } from './extras';
import type { Kind } from './sources';
// With the extension, so the script checker can run this file under Node.
import { EDITION, type Edition } from './edition.ts';
import { reviseForNaropa } from './naropa.ts';

export type SceneId = 'none' | 'shore' | 'cosmos' | 'web' | 'star' | 'within';

/** Something drawn in the page over the stage while a line is up. */
export type AsideId = 'spectrum' | 'composition';

export interface BeatDef {
  /** A name other code can key a moment to. */
  id?: string;
  text: string;
  sources?: string[];
  /** The kind of claim the line makes, shown with the evidence. */
  kind?: Kind;
  /** A question, set larger. */
  question?: boolean;
  /** The detail a curious reader can open: names, dates, the exact numbers. */
  more?: string;
  aside?: AsideId;
  /** On the closing shore, the other eyes this line looks through. */
  lens?: LensId;
  /** The inner voice: a reflection that turns the line before it inward, set apart and given room to breathe. */
  inner?: boolean;
  /** Seconds beyond reading time, for a picture that needs to land. */
  extra?: number;
}

export interface Beat extends BeatDef {
  /** Seconds from the chapter's start. */
  at: number;
  dur: number;
}

/** A scale keyframe, at a line's start (by id), plus an offset in seconds. */
export interface ScaleKeyDef {
  at: number | string;
  shift?: number;
  /** log10 of the width in view, in meters. */
  log10m: number;
}

export interface ScaleKey {
  at: number;
  log10m: number;
}

export interface Fact {
  text: string;
  sources: string[];
}

export interface ChapterDef {
  id: string;
  /** The reason we can't see it: the chapter's name on the ride map. */
  title: string;
  /** One line under the title. */
  tagline: string;
  scene: SceneId;
  beats: BeatDef[];
  scale: ScaleKeyDef[];
  /** Side doors: optional facts a viewer can open along the way. */
  facts?: Fact[];
  /** What is on screen, for the text version and for people. */
  camera: string;
  reducedMotion: string;
}

export interface Chapter extends Omit<ChapterDef, 'beats' | 'scale'> {
  beats: Beat[];
  scale: ScaleKey[];
  duration: number;
  sources: string[];
}

export const READ_WPS = 3;
export const READ_LEAD = 1.5;
export const MAX_WORDS = 18;
export const words = (text: string) => text.split(/\s+/).filter(Boolean).length;
/** Seconds an unhurried reader needs for a line, rounded up to a half second. */
export const readTime = (text: string) => Math.ceil((READ_LEAD + words(text) / READ_WPS) * 2) / 2;

const DEFS: ChapterDef[] = [
  {
    id: 'shore',
    title: 'The shore',
    tagline: 'The edges of your senses',
    scene: 'shore',
    beats: [
      { text: 'What we can’t see', extra: 1.5 },
      { text: 'You’re sitting at the edge of the water. The sun went down a few minutes ago.' },
      {
        id: 'stars',
        text: 'The first stars are coming out. They were there all day, hidden by the light.',
        sources: ['daylight-stars'],
        kind: 'inferred',
        extra: 2,
        more: 'Sunlight scattered by the air makes the daytime sky far brighter than all but the brightest stars. As it fades, the stars that were always overhead appear.',
      },
      { inner: true, text: 'Something in you is like that too: a quiet awareness, there all along beneath the noise.' },
      {
        id: 'horizon',
        text: 'Everything you can see of the sea ends 4.7 kilometers away, where the Earth curves out of sight.',
        sources: ['horizon'],
        kind: 'inferred',
        more: 'For an eye 1.7 meters above the water: distance = √(2 × Earth’s radius × height). Air bends light a little, adding a few percent.',
      },
      {
        id: 'spectrum',
        text: 'The light your eyes catch is one thin band of a spectrum far wider than color.',
        sources: ['spectrum'],
        kind: 'measured',
        aside: 'spectrum',
        extra: 2,
        more: 'Visible light runs from about 380 to 750 nanometers: less than one doubling of wavelength. Radio waves can be kilometers long; gamma rays are smaller than an atom.',
      },
      {
        id: 'blindspot',
        text: 'Even that much is edited. Each eye has a blind spot, and your brain quietly paints it over.',
        sources: ['blind-spot'],
        kind: 'measured',
        more: 'Where the optic nerve leaves the retina there are no light sensors: a gap about 15 degrees to the outer side of where you look. The brain fills it from what surrounds it.',
      },
      {
        id: 'spin',
        text: 'It feels still. It isn’t. The ground under you spins with the planet, faster than a jet flies.',
        sources: ['earth-rotation'],
        kind: 'inferred',
        more: 'Earth turns once a day: about 1,670 km/h at the equator and 1,280 km/h at 40 degrees latitude. Airliners cruise near 900 km/h.',
      },
      { id: 'lift', text: 'So what else is out there that your eyes were never built to see?', question: true, extra: 2 },
    ],
    scale: [
      { at: 0, log10m: 0.23 },
      { at: 'horizon', log10m: 0.6 },
      { at: 'horizon', shift: 6, log10m: 3.67 },
      { at: 'end', log10m: 3.9 },
    ],
    facts: [
      { text: 'Your sharp vision covers about 2 degrees, roughly your thumbnail at arm’s length. The rest is your eyes darting about.', sources: ['fovea'] },
      { text: 'Your eyes jump about three times a second. Your brain hides the blur of every jump from you.', sources: ['saccades'] },
      { text: 'Bees see ultraviolet. Many flowers carry ultraviolet patterns, invisible to you, that guide bees to their nectar.', sources: ['bee-uv'] },
    ],
    camera: 'Locked off, eye height, horizon at 42% of the frame: a person on a rock at dusk. The sky darkens and the first stars come out; the seabed is sounded as the horizon is named; a spectrum bar shows how narrow visible light is; in the last seconds the horizon becomes a row of points.',
    reducedMotion: 'Water and stars hold still; the horizon resolves to points without travelling.',
  },
  {
    id: 'far',
    title: 'Too far',
    tagline: 'Distance hides things',
    scene: 'cosmos',
    beats: [
      { text: 'Too far' },
      { id: 'earth', text: 'Rise above the shore and the horizon closes into a planet, 12,742 kilometers across.', sources: ['earth'], kind: 'measured' },
      {
        id: 'sun',
        text: 'Its light comes from the Sun. The Sun you see is the Sun of eight minutes ago.',
        sources: ['light-minutes', 'au'],
        kind: 'inferred',
        more: 'Sunlight takes about 8 minutes 19 seconds to cross 150 million kilometers. The Moon you see is about 1.3 seconds old.',
      },
      { inner: true, text: 'Everything you see is a message from the past. Only this moment is actually here.' },
      {
        id: 'grapefruit',
        text: 'Shrink the Sun to a grapefruit, and Earth is a grain of sand 14 meters away.',
        sources: ['grapefruit'],
        kind: 'inferred',
        more: 'At that scale, about 1 to 10 billion, Earth is 1.2 millimeters across and its orbit 14 meters in radius.',
      },
      { id: 'orbits', text: 'These rings are the planets’ orbits, at true scale. The planets themselves are too small to see.', sources: ['neptune'], kind: 'measured' },
      {
        id: 'proxima',
        text: 'On that scale, the nearest other star would be another grapefruit, a continent away.',
        sources: ['proxima', 'grapefruit'],
        kind: 'inferred',
        more: 'Proxima Centauri is 4.24 light-years away: about 3,700 km at grapefruit scale, roughly New York to Los Angeles.',
      },
      { id: 'galaxy', text: 'Pull back further: our galaxy, a few hundred billion stars, 100,000 light-years across.', sources: ['milky-way'], kind: 'inferred' },
      {
        id: 'fast',
        text: 'But its outer stars circle too fast. By everything we can see, it should fly apart.',
        sources: ['dark-matter'],
        kind: 'inferred',
        more: 'Stars far from a galaxy’s center orbit about as fast as those near it. Visible matter alone can’t hold them; Vera Rubin’s measurements in the 1970s made the case.',
      },
      { id: 'halo', text: 'Something invisible holds it together. We call it dark matter. No one knows what it is.', sources: ['dark-matter'], kind: 'inferred' },
      {
        id: 'five',
        text: 'Every star, planet and person ever seen adds up to about 5% of what’s out there.',
        sources: ['composition'],
        kind: 'inferred',
        aside: 'composition',
        extra: 1,
        more: 'From the Planck satellite: ordinary matter about 5%, dark matter about 27%, dark energy about 68% of the universe’s contents.',
      },
      { text: 'Distance hides things. So does sheer number.' },
    ],
    scale: [
      { at: 0, log10m: 3.9 },
      { at: 'earth', log10m: 5.6 },
      { at: 'earth', shift: 2.5, log10m: 7.42 },
      // Hold on the whole planet while its line is read, drifting out only a little.
      { at: 'sun', log10m: 7.68 },
      { at: 'sun', shift: 5, log10m: 11.4 },
      { at: 'orbits', log10m: 11.6 },
      { at: 'orbits', shift: 5, log10m: 12.95 },
      { at: 'proxima', shift: 1, log10m: 15.4 },
      { at: 'proxima', shift: 4.5, log10m: 16.4 },
      { at: 'galaxy', log10m: 17.2 },
      { at: 'galaxy', shift: 5, log10m: 21.0 },
      { at: 'halo', log10m: 21.05 },
      { at: 'halo', shift: 5, log10m: 21.5 },
      { at: 'end', log10m: 21.6 },
    ],
    facts: [{ text: 'A little of the static on an old analog TV was the afterglow of the Big Bang.', sources: ['cmb-static'] }],
    camera: 'One continuous pull-back whose distance is the scale value itself: Earth, the Sun, the orbits at true scale, Proxima, then the galaxy from above. The galaxy turns, and a halo of dark matter is drawn in violet around it (illustrative).',
    reducedMotion: 'Each line holds a still view at its scale; changes are cuts, not travel.',
  },
  {
    id: 'many',
    title: 'Too many',
    tagline: 'More than anyone can look at',
    scene: 'web',
    beats: [
      { text: 'Too many' },
      {
        id: 'web',
        text: 'Pull back far enough and every point is a galaxy: real ones, mapped by a telescope survey.',
        sources: ['sdss'],
        kind: 'measured',
        extra: 1,
        more: '113,741 galaxies in a thin slice along the celestial equator, from the Sloan Digital Sky Survey. We sit at the point of the wedge.',
      },
      { id: 'threads', text: 'They aren’t scattered evenly. They gather into threads and walls around vast empty voids.', sources: ['web', 'great-wall'], kind: 'inferred' },
      {
        id: 'map',
        text: 'No one has seen this directly. Each galaxy is placed by how much its light has stretched.',
        sources: ['web', 'sdss'],
        kind: 'inferred',
        more: 'Redshift: the universe’s expansion stretches light on its way to us, more for farther galaxies. The distance follows from a model of that expansion.',
      },
      { id: 'euclid', text: 'In 2025 the Euclid telescope sent back 26 million galaxies from one week of looking.', sources: ['euclid-q1'], kind: 'measured' },
      { id: 'tenmonths', text: 'Look at one a second, without sleeping, and you’d finish in about ten months.', sources: ['euclid-time'], kind: 'inferred' },
      {
        id: 'zoobot',
        text: 'So people trained a machine to help. A model called Zoobot sorted 380,000 of them by shape.',
        sources: ['zoobot'],
        kind: 'measured',
        more: 'Here the teal points mark the same share, about 1 in 70, of the survey’s galaxies. Which ones is illustrative.',
      },
      { id: 'looks', text: 'It learned from nearly 10,000 volunteers. It doesn’t see farther than we do. It looks at more.', sources: ['zoobot'], kind: 'measured' },
      { inner: true, text: 'Your mind holds thousands of thoughts a day. You are not any one of them.' },
      { inner: true, text: 'You are the one who notices them.' },
      { id: 'haze', text: 'Farther still, the threads blur into an even haze.', sources: ['homogeneity'], kind: 'inferred' },
      {
        id: 'limit',
        text: 'Light has had time to reach us from 46 billion light-years away. That’s not the edge of everything.',
        sources: ['observable', 'age'],
        kind: 'inferred',
        more: 'The observable universe is about 92 billion light-years across. The universe is probably larger, and whether it is finite is unknown.',
      },
      { text: 'Sometimes what you’re looking for isn’t far away at all. It’s buried in noise.' },
    ],
    scale: [
      { at: 0, log10m: 21.6 },
      { at: 'web', log10m: 22.6 },
      { at: 'web', shift: 5, log10m: 25.0 },
      { at: 'threads', shift: 2, log10m: 25.2 },
      { at: 'map', shift: 3, log10m: 25.45 },
      { at: 'euclid', shift: 3, log10m: 25.75 },
      { at: 'haze', log10m: 25.8 },
      { at: 'haze', shift: 4, log10m: 26.2 },
      // Far enough back to see the whole sphere of what light has reached us from.
      { at: 'limit', shift: 4, log10m: 27.15 },
      { at: 'end', log10m: 27.15 },
    ],
    facts: [{ text: 'Your conscious mind handles roughly 10 bits of information a second, while your senses take in vastly more.', sources: ['bits'] }],
    camera: 'Out of our galaxy into a real slice of the universe: SDSS galaxies placed by redshift, with us at the point of the wedge. Zoobot’s share is marked in teal; then a haze, and a shell of light marking the observable limit.',
    reducedMotion: 'No orbit; one composition per line.',
  },
  {
    id: 'faint',
    title: 'Too faint',
    tagline: 'Hidden in plain sight',
    scene: 'star',
    beats: [
      { text: 'Too faint' },
      { text: 'This is a real star, a little cooler than the Sun, 2,800 light-years away.', sources: ['kepler-1772-star'], kind: 'inferred' },
      {
        id: 'dots',
        text: 'A NASA telescope measured its brightness every half hour for 90 days. Each dot is one measurement.',
        sources: ['kepler-1772'],
        kind: 'measured',
        more: 'NASA’s Kepler telescope, December 2009 to March 2010: 3,803 measurements of the star Kepler-1772.',
      },
      {
        id: 'planet',
        text: 'A planet circles this star, and dims it slightly every time it passes in front.',
        sources: ['kepler-1772b', 'transit-depth'],
        kind: 'measured',
        more: 'By about 150 parts per million, or 0.015%. An Earth-size planet would dim a Sun-like star by about 84 parts per million.',
      },
      { id: 'look', text: 'Look along the dots. The planet passes again and again, and still you can’t see it.', extra: 2 },
      { id: 'nobody', text: 'Each dip is smaller than the star’s ordinary flicker.' },
      { id: 'sweep', text: 'So a computer tries every possible orbit, stacking the measurements to see if a dip lines up.', sources: ['bls'], kind: 'inferred', extra: 2 },
      { id: 'searching', text: 'Thousands of guesses give only noise. Until one lines up.', extra: 1 },
      { id: 'lock', text: 'At 3.21 days, the dip appears. No single measurement showed it.', sources: ['bls', 'kepler-1772b'], kind: 'inferred', extra: 1 },
      { inner: true, text: 'Stillness works the same way. Under the noise, something quieter was there the whole time.' },
      { text: 'Searches find thousands of dips like this. Most turn out to be something else.' },
      {
        id: 'exominer',
        text: 'A neural network called ExoMiner checked this one: very probably a planet. Measured, never seen.',
        sources: ['exominer', 'kepler-1772b'],
        kind: 'measured',
        more: 'Kepler-1772 b is one of 301 planets ExoMiner validated in 2021. “Validated” is statistical: very probably real, not independently confirmed.',
      },
      { text: 'Some things hide in time instead: too fast, or too slow, for you to notice.' },
    ],
    scale: [{ at: 0, log10m: 9.14 }],
    facts: [
      { text: 'In a famous study, about half the people counting basketball passes missed a person in a gorilla suit walking through.', sources: ['gorilla'] },
      { text: 'People routinely miss big changes between two pictures if there’s a blink between them.', sources: ['change-blindness'] },
    ],
    camera: 'Still. A single star, dim, behind the instrument: 90 days of real Kepler measurements of Kepler-1772. A scan line runs along them and finds nothing; then a period search sweeps until the 3.21-day orbit appears.',
    reducedMotion: 'The period search jumps to its result instead of sweeping.',
  },
  {
    id: 'time',
    title: 'Too fast, too slow',
    tagline: 'Hidden in time',
    scene: 'none',
    beats: [
      { text: 'Too fast, too slow' },
      { id: 'wing', text: 'A hummingbird’s wings beat dozens of times a second. You see only a blur.', sources: ['hummingbird'], kind: 'measured' },
      { id: 'clock', text: 'A clock’s hour hand moves all day. You never actually see it move.' },
      {
        id: 'drift',
        text: 'The ground under you drifts a few centimeters a year, about as fast as your fingernails grow.',
        sources: ['plate-drift', 'fingernails'],
        kind: 'measured',
      },
      {
        id: 'now',
        text: 'Even “now” arrives late. Your brain takes about a tenth of a second to build each moment.',
        sources: ['perception-lag'],
        kind: 'inferred',
        more: 'Signals take tens of milliseconds to travel from eye to brain, and processing adds more. The brain predicts ahead to cover the gap.',
      },
      { inner: true, text: 'Every moment you have ever lived, you lived now.' },
      { id: 'window', text: 'You see change only in a narrow window. Fast cameras, time-lapse and long surveys open the rest.', extra: 1 },
      { text: 'We’ve been looking outward. The strangest place might be in here.' },
    ],
    scale: [{ at: 0, log10m: 0.23 }],
    facts: [{ text: 'GPS only works because it corrects for relativity: satellite clocks gain about 38 microseconds a day on ours.', sources: ['gps'] }],
    camera: 'A ruler of time from a thousandth of a second to billions of years, with the narrow band a person can watch happen. Above it, a wing too fast to see and a clock too slow to see, which speeds itself up 3,600 times partway through its line.',
    reducedMotion: 'The wing is drawn as a still blur; the clock moves only when sped up.',
  },
  {
    id: 'small',
    title: 'Too small',
    tagline: 'The universe inside you',
    scene: 'within',
    beats: [
      { text: 'Too small' },
      { id: 'finger', text: 'Back to you. Look closely at a fingertip.', sources: ['fingertip'], kind: 'illustrative' },
      { id: 'cells', text: 'You’re made of about 30 trillion cells, each far too small to see.', sources: ['cells', 'cell-points'], kind: 'inferred' },
      {
        id: 'microbes',
        text: 'And you’re not alone in there. About as many bacteria live in and on you.',
        sources: ['microbiome'],
        kind: 'inferred',
        more: 'About 38 trillion bacteria to 30 trillion human cells, mostly in the gut. They are much smaller than your cells, so they add only a fraction of a kilogram.',
      },
      { id: 'turnover', text: 'Every second, your body quietly replaces about four million of its own cells.', sources: ['turnover'], kind: 'inferred' },
      { id: 'proteins', text: 'Inside each cell, proteins: chains that fold into shapes. The shape is the job.' },
      { id: 'p53', text: 'This one is p53. It helps stop damaged cells from dividing.', sources: ['p53'], kind: 'inferred' },
      { id: 'points', text: 'Each point is one of its 393 building blocks, placed where a computer predicts.', sources: ['p53'], kind: 'inferred' },
      {
        id: 'atom',
        text: 'Smaller still, an atom. Its electron isn’t a dot. It’s a cloud of maybes.',
        sources: ['hydrogen'],
        kind: 'inferred',
        more: 'Hydrogen’s electron is most likely found 0.053 nanometers from the nucleus. The points are samples of that probability, not a picture of an electron.',
      },
      { inner: true, text: 'None of these is you. And still, here you are, aware.' },
      { text: 'Down here, nobody can look directly. So we’ve started asking machines to guess.' },
    ],
    scale: [
      { at: 0, log10m: 0.23 },
      { at: 'finger', log10m: -1.4 },
      { at: 'finger', shift: 3, log10m: -1.75 },
      { at: 'cells', log10m: -2.1 },
      { at: 'cells', shift: 4, log10m: -4.55 },
      { at: 'microbes', log10m: -4.6 },
      { at: 'proteins', log10m: -4.75 },
      { at: 'p53', shift: 1, log10m: -7.9 },
      { at: 'atom', log10m: -7.95 },
      { at: 'atom', shift: 3, log10m: -9.65 },
      { at: 'end', log10m: -9.8 },
    ],
    facts: [
      {
        text: 'Popular stories of a “wood wide web,” with trees talking through fungi, went further than the evidence. Hidden systems need checking too.',
        sources: ['wood-wide-web'],
      },
    ],
    camera: 'Fixed. Each scale arrives as its own object growing past the frame: a fingertip’s ridges, a cell with bacteria around it, p53 (real AlphaFold coordinates), hydrogen’s electron cloud.',
    reducedMotion: 'Cuts between the fingertip, the cell, the protein and the atom.',
  },
  {
    id: 'unsure',
    title: 'Too unsure',
    tagline: 'Machines have blind spots too',
    scene: 'within',
    beats: [
      { text: 'Too unsure' },
      { text: 'For sixty years, finding a protein’s shape took months of lab work. About 190,000 were solved.', sources: ['experimental'], kind: 'measured' },
      {
        id: 'alphafold',
        text: 'AlphaFold learned from them. Now it predicts shapes from the recipe alone: 200 million so far.',
        sources: ['alphafold-db'],
        kind: 'measured',
        more: 'The recipe is the protein’s sequence of amino acids. Demis Hassabis and John Jumper shared the 2024 Nobel Prize in Chemistry for AlphaFold.',
      },
      { id: 'mark', text: 'It also marks where it is unsure. Most of the doubt gathers in the loose ends.', sources: ['plddt'], kind: 'measured' },
      { id: 'reveal', text: 'In violet: 117 of its 393 building blocks score below 50 out of 100.', sources: ['plddt', 'p53'], kind: 'measured', extra: 1 },
      { id: 'floppy', text: 'Some of that is a protein that’s genuinely floppy. Some is the model not knowing.', sources: ['plddt'], kind: 'inferred' },
      { id: 'check', text: 'Only an experiment can tell which. A machine’s blind spot, like yours, needs checking.' },
      { id: 'pattern', text: 'A model can find a pattern without understanding it.' },
      { id: 'notice', text: 'You can look at something without noticing it.' },
      {
        id: 'aware',
        text: 'Neither is the same as being aware. Whether a machine ever could be is an open question.',
        sources: ['consciousness'],
        kind: 'speculative',
        extra: 2,
      },
      { inner: true, text: 'Science can’t yet say what awareness is. You have been looking out from it your whole life.' },
      { text: 'Which brings us back to the one instrument you carry everywhere.' },
    ],
    scale: [{ at: 0, log10m: -7.9 }],
    facts: [
      { text: 'Mantis shrimp have about 12 kinds of color receptor to your 3, yet tests show they tell colors apart worse than you do.', sources: ['mantis'] },
    ],
    camera: 'The protein, turning slowly, recolored by what the instrument claims: its prediction, its confidence, and what needs checking.',
    reducedMotion: 'No turning; the views change on each line.',
  },
  {
    id: 'return',
    title: 'New eyes',
    tagline: 'The same shore, seen again',
    scene: 'shore',
    beats: [
      { text: 'New eyes' },
      { text: 'The same shore. The same dusk. Nothing in front of you has changed.' },
      { id: 'andromeda', text: 'That faint smudge is the Andromeda Galaxy, the farthest thing your eyes can see unaided.', sources: ['andromeda'], kind: 'measured' },
      { text: 'Its light left 2.5 million years ago, before there were any people.', sources: ['andromeda'], kind: 'inferred' },
      { id: 'lenses', text: 'Now look again, through eyes that aren’t yours.' },
      { lens: 'infrared', text: 'In infrared, warm things glow. A pit viper sees you like this in the dark.', sources: ['body-infrared', 'pit-viper'], kind: 'inferred', extra: 2 },
      { lens: 'radio', text: 'In radio, the air is thick with signals, and a faint hiss left by the Big Bang.', sources: ['cmb-static', 'radio-air'], kind: 'inferred', extra: 2 },
      { lens: 'neutrinos', text: 'Neutrinos from the Sun stream up through the Earth beneath you, and through you.', sources: ['neutrinos'], kind: 'inferred', extra: 2 },
      { lens: 'magnetic', text: 'Overhead arcs the magnetic field that migrating birds can feel.', sources: ['bird-magnet'], kind: 'measured', extra: 2 },
      { lens: 'dark', text: 'And all around, if our models are right, dark matter drifts through, unseen.', sources: ['dark-matter'], kind: 'inferred', extra: 2 },
      { id: 'always', text: 'Every instrument we build shows us a little more of what was always there.' },
      { inner: true, text: 'The oldest instrument is attention. It costs nothing, and it is always here.' },
      { id: 'last', text: 'So what’s in front of you right now that you haven’t learned to see?', question: true, extra: 3 },
    ],
    scale: [
      { at: 0, log10m: -2 },
      { at: 0, shift: 3, log10m: 0.23 },
    ],
    camera: 'The opening frame, exactly, with Andromeda named. Then the same frame through other eyes, one line each: infrared, radio, neutrinos, the magnetic field, dark matter. Then clear again for the closing question.',
    reducedMotion: 'Holds the opening composition; lenses change without motion.',
  },
];

function build(def: ChapterDef): Chapter {
  let at = 0;
  const beats: Beat[] = def.beats.map((b, i) => {
    const dur = (i === 0 ? 3.5 : readTime(b.text)) + (b.question || b.inner ? 1.5 : 0) + (b.extra ?? 0);
    const beat = { ...b, at, dur };
    at += dur;
    return beat;
  });
  const duration = at;
  const when = (k: ScaleKeyDef) => {
    const base = typeof k.at === 'number' ? k.at : k.at === 'end' ? duration : beats.find((b) => b.id === k.at)?.at;
    if (base === undefined) throw new Error(`No line "${k.at}" in chapter ${def.id}`);
    return Math.min(duration, base + (k.shift ?? 0));
  };
  const scale = def.scale.map((k) => ({ at: when(k), log10m: k.log10m }));
  if (scale[scale.length - 1].at < duration) scale.push({ at: duration, log10m: scale[scale.length - 1].log10m });
  const sources = [...new Set([...beats.flatMap((b) => b.sources ?? []), ...(def.facts ?? []).flatMap((f) => f.sources)])];
  return { ...def, beats, scale, duration, sources };
}

/** The ride as one edition tells it. */
export function chaptersFor(edition: Edition): Chapter[] {
  return (edition === 'naropa' ? reviseForNaropa(DEFS) : DEFS).map(build);
}

export const CHAPTERS: Chapter[] = chaptersFor(EDITION);

export const STARTS = CHAPTERS.reduce<number[]>((acc, _c, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + CHAPTERS[i - 1].duration);
  return acc;
}, []);

export const TOTAL = STARTS[STARTS.length - 1] + CHAPTERS[CHAPTERS.length - 1].duration;

/** A chapter's index by id. */
export const CH = Object.fromEntries(CHAPTERS.map((c, i) => [c.id, i])) as Record<string, number>;

/** Seconds into its chapter at which a named line starts. */
export function beatStart(chapterId: string, beatId: string): number {
  const b = CHAPTERS[CH[chapterId]].beats.find((x) => x.id === beatId);
  if (!b) throw new Error(`No line "${beatId}" in chapter ${chapterId}`);
  return b.at;
}

/** The id of the line on screen at a moment of a chapter, if it has one. */
export function beatIdAt(chapter: Chapter, local: number): string | undefined {
  return chapter.beats[beatIndexAt(chapter, local)].id;
}

export function chapterIndexAt(t: number): number {
  for (let i = CHAPTERS.length - 1; i >= 0; i--) if (t >= STARTS[i]) return i;
  return 0;
}

export function beatIndexAt(chapter: Chapter, local: number): number {
  let b = 0;
  chapter.beats.forEach((beat, i) => {
    if (local >= beat.at) b = i;
  });
  return b;
}

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** log10 of the width in view, in meters, at time t. */
export function scaleAt(t: number): number {
  const i = chapterIndexAt(t);
  const keys = CHAPTERS[i].scale;
  const local = t - STARTS[i];
  if (local <= keys[0].at) return keys[0].log10m;
  for (let k = 1; k < keys.length; k++) {
    if (local <= keys[k].at) {
      const a = keys[k - 1];
      const b = keys[k];
      if (b.at <= a.at) return b.log10m;
      return a.log10m + (b.log10m - a.log10m) * easeInOut((local - a.at) / (b.at - a.at));
    }
  }
  return keys[keys.length - 1].log10m;
}

/** The first moment the journey passes nearest a given scale. */
export function timeForScale(log10m: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let t = 0; t < TOTAL; t += 0.1) {
    const d = Math.abs(scaleAt(t) - log10m);
    if (d < bestD - 1e-3) {
      bestD = d;
      best = t;
    }
  }
  return best;
}

/**
 * Under reduced motion, the clock still runs but the picture holds each line
 * of narration's destination: a cut per line instead of travel.
 */
export function heldTime(t: number, reduced: boolean) {
  if (!reduced) return t;
  const ci = chapterIndexAt(t);
  const c = CHAPTERS[ci];
  const bi = beatIndexAt(c, t - STARTS[ci]);
  const next = bi + 1 < c.beats.length ? c.beats[bi + 1].at : c.duration;
  // Never hold a frame inside the crossfade into the next chapter.
  return STARTS[ci] + Math.max(0, Math.min(next - 0.05, c.duration - 1.7));
}
