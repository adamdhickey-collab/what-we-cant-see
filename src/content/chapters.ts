// The storyboard as data. Every chapter is one reason we can't see something,
// and declares what it says, what it shows and which scale it sits at; the
// director, the stage, the narrative and the scale navigator all read from
// this one list. The prose companion is research/STORYBOARD.md.
//
// The ride plays straight through, start to finish, like a film, and lasts
// as long as its music: nothing waits for the viewer. Two voices tell it:
// the outer one says what instruments have found, and an inner one, set
// apart, turns each finding toward the viewer's own awareness, drawn from the
// contemplative psychology taught at Naropa University. A line that names a
// teaching is tagged 'contemplative' and cites where Naropa teaches it: a
// view from a tradition, not a finding (research/NAROPA-EDITION.md).
// Nobody writes a line's timing by hand. Each line stays on
// screen for as long as an unhurried reader needs (READ_LEAD plus READ_WPS
// words a second), so the ride can never outrun the person reading it, and
// everything that moves with the story is keyed to a line's id rather than
// to a second.
// scripts/check-script.mjs holds the line length and the sources to account.

import type { LensId } from './extras';
import type { Kind } from './sources';

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

interface ChapterDef {
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

/** The music's length, On the Nature of Daylight as served: the ride is cut to it. */
export const MUSIC_SECONDS = 374.9;

export const READ_WPS = 3;
export const READ_LEAD = 1.5;
export const MAX_WORDS = 18;
export const words = (text: string) => text.split(/\s+/).filter(Boolean).length;
/** Seconds an unhurried reader needs for a line, rounded up to a half second. */
export const readTime = (text: string) => Math.ceil((READ_LEAD + words(text) / READ_WPS) * 2) / 2;

const inner = (text: string): BeatDef => ({ inner: true, text });
/** An inner line that names a teaching, citing where Naropa teaches it. */
const teaching = (text: string, source: string): BeatDef => ({ inner: true, text, kind: 'contemplative', sources: [source] });

const DEFS: ChapterDef[] = [
  {
    id: 'shore',
    title: 'The shore',
    tagline: 'The edges of your senses',
    scene: 'shore',
    beats: [
      { text: 'What we can’t see', extra: 1.5 },
      { text: 'You’re sitting by the water. The sun set a few minutes ago.' },
      {
        id: 'stars',
        text: 'The first stars are coming out. They were there all day, hidden by the light.',
        sources: ['daylight-stars'],
        kind: 'inferred',
        more: 'Sunlight scattered by the air makes the daytime sky far brighter than all but the brightest stars. As it fades, the stars that were always overhead appear.',
      },
      teaching('What busy thought hides, Naropa’s founder called basic goodness: there all along, like the stars.', 'basic-goodness'),
      {
        id: 'horizon',
        text: 'The sea you can see ends 4.7 kilometers away, where Earth curves out of sight.',
        sources: ['horizon'],
        kind: 'inferred',
        more: 'For an eye 1.7 meters above the water: distance = √(2 × Earth’s radius × height). Air bends light a little, adding a few percent.',
      },
      {
        id: 'blindspot',
        text: 'Each eye has a blind spot, and your brain quietly paints it over.',
        sources: ['blind-spot'],
        kind: 'measured',
        more: 'Where the optic nerve leaves the retina there are no light sensors: a gap about 15 degrees to the outer side of where you look. The brain fills it from what surrounds it.',
      },
      { id: 'lift', text: 'What else is out there that your eyes were never built to see?', question: true },
    ],
    scale: [
      { at: 0, log10m: 0.23 },
      { at: 'horizon', log10m: 0.6 },
      { at: 'horizon', shift: 6, log10m: 3.67 },
      { at: 'end', log10m: 3.9 },
    ],
    facts: [
      { text: 'The light your eyes catch is one thin band of a spectrum far wider than color: less than one doubling of wavelength.', sources: ['spectrum'] },
      { text: 'It feels still. It isn’t. The ground under you spins with the planet, faster than a jet flies.', sources: ['earth-rotation'] },
      { text: 'Your sharp vision covers about 2 degrees, roughly your thumbnail at arm’s length. The rest is your eyes darting about.', sources: ['fovea'] },
      { text: 'Your eyes jump about three times a second. Your brain hides the blur of every jump from you.', sources: ['saccades'] },
      { text: 'Bees see ultraviolet. Many flowers carry ultraviolet patterns, invisible to you, that guide bees to their nectar.', sources: ['bee-uv'] },
    ],
    camera: 'Locked off, eye height, horizon at 42% of the frame: a person on a rock at dusk. The sky darkens and the first stars come out; the seabed is sounded as the horizon is named; in the last seconds the horizon becomes a row of points.',
    reducedMotion: 'Water and stars hold still; the horizon resolves to points without travelling.',
  },
  {
    id: 'far',
    title: 'Too far',
    tagline: 'Distance hides things',
    scene: 'cosmos',
    beats: [
      { text: 'Too far' },
      { id: 'earth', text: 'Rise, and the horizon closes into a planet 12,742 kilometers across.', sources: ['earth'], kind: 'measured' },
      {
        id: 'sun',
        text: 'Its light comes from the Sun: the Sun of eight minutes ago.',
        sources: ['light-minutes', 'au'],
        kind: 'inferred',
        more: 'Sunlight takes about 8 minutes 19 seconds to cross 150 million kilometers. The Moon you see is about 1.3 seconds old.',
      },
      { id: 'galaxy', text: 'Pull back further: our galaxy, a few hundred billion stars, 100,000 light-years across.', sources: ['milky-way'], kind: 'inferred' },
      {
        id: 'fast',
        text: 'But its outer stars circle too fast. By all we can see, it should fly apart.',
        sources: ['dark-matter'],
        kind: 'inferred',
        more: 'Stars far from a galaxy’s center orbit about as fast as those near it. Visible matter alone can’t hold them; Vera Rubin’s measurements in the 1970s made the case.',
      },
      { id: 'halo', text: 'Something unseen holds it together. We call it dark matter. No one knows what it is.', sources: ['dark-matter'], kind: 'inferred' },
      {
        id: 'five',
        text: 'Every star, planet and person ever seen adds up to about 5% of what’s out there.',
        sources: ['composition'],
        kind: 'inferred',
        aside: 'composition',
        more: 'From the Planck satellite: ordinary matter about 5%, dark matter about 27%, dark energy about 68% of the universe’s contents.',
      },
      teaching('Science’s honest answer is “we don’t know.” Zen calls that beginner’s mind.', 'beginners-mind'),
    ],
    scale: [
      { at: 0, log10m: 3.9 },
      { at: 'earth', log10m: 5.6 },
      { at: 'earth', shift: 2.5, log10m: 7.42 },
      // Hold on the whole planet while its line is read, then out past the orbits.
      { at: 'sun', log10m: 7.68 },
      { at: 'sun', shift: 4.5, log10m: 12.95 },
      { at: 'galaxy', log10m: 13.4 },
      { at: 'galaxy', shift: 5, log10m: 21.0 },
      { at: 'halo', log10m: 21.05 },
      { at: 'halo', shift: 5, log10m: 21.5 },
      { at: 'end', log10m: 21.6 },
    ],
    facts: [
      { text: 'Shrink the Sun to a grapefruit, and Earth is a grain of sand 14 meters away.', sources: ['grapefruit'] },
      { text: 'At true scale the planets are far too small to see beside their orbits; Neptune’s is 9 billion kilometers across.', sources: ['neptune'] },
      { text: 'On grapefruit scale, the nearest other star would be another grapefruit, a continent away.', sources: ['proxima'] },
      { text: 'A little of the static on an old analog TV was the afterglow of the Big Bang.', sources: ['cmb-static'] },
    ],
    camera: 'One continuous pull-back whose distance is the scale value itself: Earth, the Sun, the orbits at true scale, then the galaxy from above. The galaxy turns, and a halo of dark matter is drawn in violet around it (illustrative).',
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
        text: 'Pull back, and every point is a galaxy: real ones, mapped by a telescope survey.',
        sources: ['sdss'],
        kind: 'measured',
        more: '113,741 galaxies in a thin slice along the celestial equator, from the Sloan Digital Sky Survey. We sit at the point of the wedge. Each is placed by how much its light has stretched.',
      },
      { id: 'threads', text: 'They gather into threads and walls around vast empty voids.', sources: ['web', 'great-wall'], kind: 'inferred' },
      teaching('It’s gravity, not a teaching. But Buddhism names the pattern: dependent arising, nothing on its own.', 'dependent-origination'),
      { id: 'euclid', text: 'In 2025 the Euclid telescope sent back 26 million galaxies from one week of looking.', sources: ['euclid-q1'], kind: 'measured' },
      {
        id: 'zoobot',
        text: 'So a model called Zoobot, taught by nearly 10,000 volunteers, sorted 380,000 of them by shape.',
        sources: ['zoobot'],
        kind: 'measured',
        more: 'It doesn’t see farther than we do; it looks at more. Here the teal points mark the same share, about 1 in 70, of the survey’s galaxies. Which ones is illustrative.',
      },
      teaching('Your attention faces the same flood. Mindfulness trains where it rests, and notices when it wanders.', 'mindfulness-awareness'),
    ],
    scale: [
      { at: 0, log10m: 21.6 },
      { at: 'web', log10m: 22.6 },
      { at: 'web', shift: 5, log10m: 25.0 },
      { at: 'threads', shift: 2, log10m: 25.3 },
      { at: 'euclid', shift: 3, log10m: 25.75 },
      { at: 'zoobot', shift: 5, log10m: 26.2 },
      // Far enough back to see the whole sphere of what light has reached us from.
      { at: 'end', log10m: 27.15 },
    ],
    facts: [
      { text: 'Look at one Euclid galaxy a second, without sleeping, and you’d finish in about ten months.', sources: ['euclid-time'] },
      { text: 'Your conscious mind handles roughly 10 bits of information a second, while your senses take in vastly more.', sources: ['bits'] },
      { text: 'Farther still, the threads blur into an even haze.', sources: ['homogeneity'] },
      { text: 'Light has had time to reach us from 46 billion light-years away. That’s not the edge of everything.', sources: ['observable', 'age'] },
    ],
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
      {
        id: 'dots',
        text: 'NASA’s Kepler measured this star every half hour for 90 days. Each dot is one measurement.',
        sources: ['kepler-1772', 'kepler-1772-star'],
        kind: 'measured',
        more: 'December 2009 to March 2010: 3,803 measurements of Kepler-1772, a star a little cooler than the Sun, 2,800 light-years away.',
      },
      {
        id: 'look',
        text: 'A planet dims it each time it passes. Look along the dots: you still can’t see it.',
        sources: ['kepler-1772b', 'transit-depth'],
        kind: 'measured',
        more: 'By about 150 parts per million, or 0.015%. An Earth-size planet would dim a Sun-like star by about 84 parts per million.',
      },
      { id: 'nobody', text: 'Each dip is smaller than the star’s ordinary flicker.' },
      { id: 'sweep', text: 'So a computer tries every possible orbit, stacking measurements until a dip lines up.', sources: ['bls'], kind: 'inferred', extra: 1 },
      { id: 'lock', text: 'At 3.21 days, the dip appears. No single measurement showed it.', sources: ['bls', 'kepler-1772b'], kind: 'inferred', extra: 0.5 },
      inner('No single sitting shows much either. What practice reveals appears in the stacking.'),
      {
        id: 'exominer',
        text: 'A neural network, ExoMiner, judged it very probably a planet. Measured, never seen.',
        sources: ['exominer', 'kepler-1772b'],
        kind: 'measured',
        more: 'Kepler-1772 b is one of 301 planets ExoMiner validated in 2021. “Validated” is statistical: very probably real, not independently confirmed.',
      },
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
      { id: 'wing', text: 'A hummingbird’s wings beat dozens of times a second. You see a blur.', sources: ['hummingbird'], kind: 'measured' },
      { id: 'clock', text: 'A clock’s hour hand moves all day. You never see it move.', extra: 2 },
      {
        id: 'drift',
        text: 'The ground drifts a few centimeters a year, about as fast as fingernails grow.',
        sources: ['plate-drift', 'fingernails'],
        kind: 'measured',
      },
      {
        id: 'now',
        text: 'Even “now” arrives late: your brain takes about a tenth of a second to build it.',
        sources: ['perception-lag'],
        kind: 'inferred',
        more: 'Signals take tens of milliseconds to travel from eye to brain, and processing adds more. The brain predicts ahead to cover the gap.',
      },
      teaching('Meditators who watch the present closely find impermanence: nothing holds still.', 'impermanence'),
      { id: 'window', text: 'You see change in a narrow window. Instruments open the rest.' },
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
        text: 'And about as many bacteria live in and on you.',
        sources: ['microbiome'],
        kind: 'inferred',
        more: 'About 38 trillion bacteria to 30 trillion human cells, mostly in the gut. They are much smaller than your cells, so they add only a fraction of a kilogram.',
      },
      teaching('Thich Nhat Hanh called this interbeing. A biologist would say symbiosis.', 'interbeing'),
      {
        id: 'p53',
        text: 'Inside each cell, proteins fold into shapes. This one, p53, helps stop damaged cells dividing.',
        sources: ['p53'],
        kind: 'inferred',
        more: 'Each point is one of its 393 building blocks, placed where a computer predicts. The shape is the job.',
      },
      {
        id: 'atom',
        text: 'Smaller still, an atom. Its electron isn’t a dot. It’s a cloud of maybes.',
        sources: ['hydrogen'],
        kind: 'inferred',
        more: 'Hydrogen’s electron is most likely found 0.053 nanometers from the nucleus. The points are samples of that probability, not a picture of an electron.',
      },
      teaching('Buddhist psychology searches a person’s parts for a self, and finds none. Still, here you are, aware.', 'skandhas'),
    ],
    scale: [
      { at: 0, log10m: 0.23 },
      { at: 'finger', log10m: -1.4 },
      { at: 'finger', shift: 3, log10m: -1.75 },
      { at: 'cells', log10m: -2.1 },
      { at: 'cells', shift: 4, log10m: -4.55 },
      { at: 'microbes', log10m: -4.6 },
      { at: 'p53', log10m: -4.75 },
      { at: 'p53', shift: 2.5, log10m: -7.9 },
      { at: 'atom', log10m: -7.95 },
      { at: 'atom', shift: 3, log10m: -9.65 },
      { at: 'end', log10m: -9.8 },
    ],
    facts: [
      { text: 'Every second, your body quietly replaces about four million of its own cells.', sources: ['turnover'] },
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
      {
        id: 'alphafold',
        text: 'AlphaFold learned from 190,000 lab-solved shapes. Now it predicts them from the recipe: 200 million so far.',
        sources: ['experimental', 'alphafold-db'],
        kind: 'measured',
        more: 'The recipe is the protein’s sequence of amino acids. Lab work took sixty years to solve those 190,000. Demis Hassabis and John Jumper shared the 2024 Nobel Prize in Chemistry for AlphaFold.',
      },
      { id: 'reveal', text: 'It marks its own doubt. In violet, 117 of 393 building blocks score below 50.', sources: ['plddt', 'p53'], kind: 'measured' },
      { id: 'floppy', text: 'Some of that is a protein that’s genuinely floppy. Some is the model not knowing.', sources: ['plddt'], kind: 'inferred' },
      { id: 'check', text: 'Only an experiment can tell which. A machine’s blind spot, like yours, needs checking.' },
      teaching('Maitri begins the same way: seeing your own loose ends clearly, without judgment.', 'maitri'),
      {
        id: 'aware',
        text: 'Finding a pattern isn’t understanding it. Whether a machine could ever be aware is an open question.',
        sources: ['consciousness'],
        kind: 'speculative',
      },
    ],
    scale: [{ at: 0, log10m: -7.9 }],
    facts: [
      { text: 'Contemplative neuroscience studies awareness from both sides: the brain on the scan, and the person sitting inside it.', sources: ['contemplative-neuro'] },
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
      { id: 'andromeda', text: 'That faint smudge is the Andromeda Galaxy. Its light left 2.5 million years ago.', sources: ['andromeda'], kind: 'measured' },
      { id: 'lenses', text: 'Now look again, through eyes that aren’t yours.' },
      { lens: 'infrared', text: 'In infrared, warm things glow. A pit viper sees you like this.', sources: ['body-infrared', 'pit-viper'], kind: 'inferred', extra: 1 },
      { lens: 'neutrinos', text: 'Neutrinos from the Sun stream up through the Earth beneath you, and through you.', sources: ['neutrinos'], kind: 'inferred', extra: 1 },
      { id: 'always', text: 'Every instrument shows a little more of what was always there.' },
      teaching('Naropa’s psychology begins here: health and wellbeing are innate, there before anything is added.', 'naropa-psych'),
      { id: 'last', text: 'So what’s in front of you right now that you haven’t learned to see?', question: true },
    ],
    scale: [
      { at: 0, log10m: -2 },
      { at: 0, shift: 3, log10m: 0.23 },
    ],
    facts: [
      { text: 'In radio, the air is thick with signals, and a faint hiss left by the Big Bang.', sources: ['radio-air'] },
      { text: 'Overhead arcs the magnetic field that migrating birds can feel.', sources: ['bird-magnet'] },
    ],
    camera: 'The opening frame, exactly, with Andromeda named. Then the same frame through other eyes, one line each: infrared, then neutrinos. Then clear again for the closing question.',
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

export const CHAPTERS: Chapter[] = DEFS.map(build);

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
