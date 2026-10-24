// The storyboard as data. Every chapter is one reason we can't see something,
// and declares what it says, what it shows and which scale it sits at; the
// director, the stage, the narrative and the scale navigator all read from
// this one list. The prose companion is research/STORYBOARD.md.
//
// The ride plays straight through, start to finish, like a film, and lasts
// exactly as long as its music: nothing waits for the viewer. Nobody writes a line's timing by hand. Each line stays on
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

export const READ_WPS = 2.7;
export const READ_LEAD = 1.8;
export const MAX_WORDS = 18;
/** The length of the music, On the Nature of Daylight, in seconds. The ride is cut to it. */
export const MUSIC_SECONDS = 374.9;
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
        extra: 1.5,
        more: 'Sunlight scattered by the air makes the daytime sky far brighter than all but the brightest stars. As it fades, the stars that were always overhead appear.',
      },
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
        extra: 1,
        more: 'Visible light runs from about 380 to 750 nanometers: less than one doubling of wavelength. Radio waves can be kilometers long; gamma rays are smaller than an atom.',
      },
      { id: 'lift', text: 'So what else is out there that your eyes were never built to see?', question: true, extra: 1.5 },
    ],
    scale: [
      { at: 0, log10m: 0.23 },
      { at: 'horizon', log10m: 0.6 },
      { at: 'horizon', shift: 7, log10m: 3.67 },
      { at: 'end', log10m: 3.9 },
    ],
    facts: [
      { text: 'Each eye has a blind spot where the nerve leaves it, and your brain quietly paints it over.', sources: ['blind-spot'] },
      { text: 'The ground under you spins with the planet, faster than a jet flies, and it feels perfectly still.', sources: ['earth-rotation'] },
      { text: 'Your sharp vision covers about 2 degrees, roughly your thumbnail at arm’s length. The rest is your eyes darting about.', sources: ['fovea'] },
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
      { id: 'rise', text: 'Rise from the shore. A town shrinks to a speck, then a city, then a whole coast.', extra: 2.5 },
      { id: 'earth', text: 'Then the horizon closes into a planet, 12,742 kilometers across.', sources: ['earth'], kind: 'measured', extra: 2 },
      {
        id: 'cities',
        text: 'Minneapolis and Tunja, Colombia, nearly 4,800 kilometers apart, fit in a single glance.',
        sources: ['city-distance', 'earth-land'],
        kind: 'inferred',
        extra: 1.5,
        more: 'The shortest path over the Earth’s surface between them: about 4,790 km, a little over five hours by plane, and a sixtieth of a second for light.',
      },
      {
        id: 'clocks',
        text: 'Their clocks are live, and the line between day and night is where it is right now.',
        sources: ['terminator'],
        kind: 'inferred',
        extra: 1.5,
      },
      {
        id: 'sun',
        text: 'That daylight comes from the Sun, and the Sun you see is eight minutes old.',
        sources: ['light-minutes', 'au'],
        kind: 'inferred',
        extra: 2.5,
        more: 'Sunlight takes about 8 minutes 19 seconds to cross 150 million kilometers. The Moon you see is about 1.3 seconds old.',
      },
      { id: 'orbits', text: 'These rings are the planets’ orbits, at true scale. The planets themselves are too small to see.', sources: ['neptune'], kind: 'measured' },
      { id: 'galaxy', text: 'Pull back further: our galaxy, a few hundred billion stars, 100,000 light-years across.', sources: ['milky-way'], kind: 'inferred', extra: 1 },
      {
        id: 'fast',
        text: 'Its stars circle too fast for what we can see. Something invisible holds them: dark matter.',
        sources: ['dark-matter'],
        kind: 'inferred',
        extra: 1.5,
        more: 'Stars far from a galaxy’s center orbit about as fast as those near it. Visible matter alone can’t hold them; Vera Rubin’s measurements in the 1970s made the case. No one yet knows what dark matter is.',
      },
      {
        id: 'five',
        text: 'Everything ever seen adds up to about 5% of what’s out there.',
        sources: ['composition'],
        kind: 'inferred',
        aside: 'composition',
        extra: 0.5,
      },
      { text: 'Distance hides things. So does sheer number.' },
    ],
    scale: [
      { at: 0, log10m: 3.9 },
      // A slow climb, town to city to coast, before the planet arrives.
      { at: 'rise', log10m: 3.95 },
      { at: 'rise', shift: 9, log10m: 6.3 },
      { at: 'earth', log10m: 6.5 },
      { at: 'earth', shift: 5, log10m: 7.42 },
      // Lean in a little for the cities, then hold on the whole planet while the clocks are read.
      { at: 'cities', shift: 2, log10m: 7.3 },
      { at: 'clocks', shift: 6, log10m: 7.45 },
      // Then a long, unhurried pull out to the Sun.
      { at: 'sun', log10m: 7.6 },
      { at: 'sun', shift: 9, log10m: 11.4 },
      { at: 'orbits', log10m: 11.6 },
      { at: 'orbits', shift: 6, log10m: 12.95 },
      { at: 'galaxy', log10m: 13.6 },
      { at: 'galaxy', shift: 7, log10m: 21.0 },
      { at: 'fast', shift: 4, log10m: 21.1 },
      { at: 'five', log10m: 21.5 },
      { at: 'end', log10m: 21.6 },
    ],
    facts: [
      { text: 'Shrink the Sun to a grapefruit, and Earth is a grain of sand 14 meters away.', sources: ['grapefruit'] },
      { text: 'At that scale the nearest other star, 4.24 light-years away, is another grapefruit a continent away.', sources: ['proxima'] },
      { text: 'A little of the static on an old analog TV was the afterglow of the Big Bang.', sources: ['cmb-static'] },
    ],
    camera: 'One continuous pull-back whose distance is the scale value itself: up from the shore past town and city scale to the whole Earth, drawn from real coastlines and lit as it is at this moment, with Minneapolis and Tunja marked and their live local times; then the Sun, the orbits at true scale, and the galaxy with a halo of dark matter (illustrative).',
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
        more: '113,741 galaxies in a thin slice along the celestial equator, from the Sloan Digital Sky Survey, each placed by how much its light has stretched. We sit at the point of the wedge.',
      },
      { id: 'threads', text: 'They gather into threads and walls around vast empty voids.', sources: ['web', 'great-wall'], kind: 'inferred', extra: 0.5 },
      {
        id: 'euclid',
        text: 'One telescope sent back 26 million galaxies in a week. Looking yourself would take ten months.',
        sources: ['euclid-q1', 'euclid-time'],
        kind: 'measured',
      },
      {
        id: 'zoobot',
        text: 'So we trained a machine to sort them. It doesn’t see farther. It looks at more.',
        sources: ['zoobot'],
        kind: 'measured',
        extra: 0.5,
        more: 'Zoobot, trained with the help of nearly 10,000 volunteers, sorted 380,000 Euclid galaxies by shape. The teal points mark the same share, about 1 in 70, of the survey’s galaxies.',
      },
      { text: 'Sometimes what you’re looking for isn’t far away. It’s buried in noise.' },
    ],
    scale: [
      { at: 0, log10m: 21.6 },
      { at: 'web', log10m: 22.6 },
      { at: 'web', shift: 6, log10m: 25.0 },
      { at: 'threads', shift: 2, log10m: 25.3 },
      { at: 'euclid', shift: 4, log10m: 25.75 },
      // Drift out slowly, keeping the web in view under the closing line.
      { at: 'end', log10m: 26.0 },
    ],
    facts: [
      { text: 'Each galaxy is placed by how much its light has stretched on the way here, the universe’s expansion read as distance.', sources: ['web'] },
      { text: 'Farther still, the threads blur into an even haze.', sources: ['homogeneity'] },
      { text: 'Light has had time to reach us from about 46 billion light-years in every direction. That isn’t the edge of everything.', sources: ['observable', 'age'] },
      { text: 'Your conscious mind handles roughly 10 bits of information a second, while your senses take in vastly more.', sources: ['bits'] },
    ],
    camera: 'Out of our galaxy into a real slice of the universe: SDSS galaxies placed by redshift, with us at the point of the wedge. Zoobot’s share is marked in teal, and the web drifts back as the chapter closes.',
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
        text: 'This real star was measured every half hour for 90 days. Each dot is one measurement.',
        sources: ['kepler-1772', 'kepler-1772-star'],
        kind: 'measured',
        more: 'NASA’s Kepler telescope, December 2009 to March 2010: 3,803 measurements of Kepler-1772, a star a little cooler than the Sun, 2,800 light-years away.',
      },
      {
        id: 'planet',
        text: 'A planet circles it, dimming it slightly each time it passes in front.',
        sources: ['kepler-1772b', 'transit-depth'],
        kind: 'measured',
      },
      { id: 'look', text: 'Look along the dots. Each dip is smaller than the star’s own flicker.', extra: 1.5 },
      { id: 'sweep', text: 'So a computer tries every possible orbit, stacking the measurements until a dip lines up.', sources: ['bls'], kind: 'inferred', extra: 2.5 },
      { id: 'lock', text: 'At 3.21 days, the planet appears. No single measurement showed it.', sources: ['bls', 'kepler-1772b'], kind: 'inferred', extra: 1 },
      {
        id: 'exominer',
        text: 'A neural network called ExoMiner checked it: very probably a planet. Measured, never seen.',
        sources: ['exominer'],
        kind: 'measured',
        more: 'Kepler-1772 b is one of 301 planets ExoMiner validated in 2021. “Validated” is statistical: very probably real, not independently confirmed.',
      },
      { text: 'We’ve been looking outward. The strangest place might be in here.' },
    ],
    scale: [{ at: 0, log10m: 9.14 }],
    facts: [
      { text: 'In a famous study, about half the people counting basketball passes missed a person in a gorilla suit walking through.', sources: ['gorilla'] },
      { text: 'People routinely miss big changes between two pictures if there’s a blink between them.', sources: ['change-blindness'] },
      { text: 'A hummingbird’s wings beat dozens of times a second: you see a blur.', sources: ['hummingbird'] },
      { text: 'The ground drifts a few centimeters a year, about as fast as your fingernails grow.', sources: ['plate-drift', 'fingernails'] },
      { text: 'Your brain takes about a tenth of a second to build each moment, and predicts ahead to cover the gap.', sources: ['perception-lag'] },
      { text: 'GPS only works because it corrects for relativity: satellite clocks gain about 38 microseconds a day.', sources: ['gps'] },
    ],
    camera: 'Still. A single star, dim, behind the instrument: 90 days of real Kepler measurements of Kepler-1772. A scan line runs along them and finds nothing; then a period search sweeps until the 3.21-day orbit appears.',
    reducedMotion: 'The period search jumps to its result instead of sweeping.',
  },
  {
    id: 'small',
    title: 'Too small',
    tagline: 'The universe inside you',
    scene: 'within',
    beats: [
      { text: 'Too small' },
      { id: 'finger', text: 'Back to you. Look closely at a fingertip.', sources: ['fingertip'], kind: 'illustrative', extra: 0.5 },
      { id: 'cells', text: 'You’re made of about 30 trillion cells, each far too small to see.', sources: ['cells', 'cell-points'], kind: 'inferred' },
      { id: 'microbes', text: 'And about as many bacteria live in and on you.', sources: ['microbiome'], kind: 'inferred' },
      { id: 'p53', text: 'Inside each cell, proteins fold into shapes. This one, p53, helps stop damaged cells dividing.', sources: ['p53'], kind: 'inferred', extra: 1 },
      {
        id: 'atom',
        text: 'Smaller still, an atom. Its electron isn’t a dot. It’s a cloud of maybes.',
        sources: ['hydrogen'],
        kind: 'inferred',
        extra: 1.5,
      },
      { text: 'Down here, nobody can look directly. So we’ve started asking machines to guess.' },
    ],
    scale: [
      { at: 0, log10m: 0.23 },
      { at: 'finger', log10m: -1.4 },
      { at: 'finger', shift: 3, log10m: -1.75 },
      { at: 'cells', log10m: -2.1 },
      { at: 'cells', shift: 5, log10m: -4.55 },
      { at: 'microbes', log10m: -4.6 },
      { at: 'p53', log10m: -4.75 },
      { at: 'p53', shift: 4, log10m: -7.9 },
      { at: 'atom', log10m: -7.95 },
      { at: 'atom', shift: 4, log10m: -9.65 },
      { at: 'end', log10m: -9.8 },
    ],
    facts: [
      { text: 'Every second, your body quietly replaces about four million of its own cells.', sources: ['turnover'] },
      { text: 'Popular stories of a “wood wide web,” with trees talking through fungi, went further than the evidence. Hidden systems need checking too.', sources: ['wood-wide-web'] },
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
        text: 'A program called AlphaFold now predicts protein shapes from their recipe alone: 200 million so far.',
        sources: ['alphafold-db', 'experimental'],
        kind: 'measured',
        more: 'It learned from about 190,000 structures solved by experiment over sixty years. Demis Hassabis and John Jumper shared the 2024 Nobel Prize in Chemistry for it.',
      },
      { id: 'mark', text: 'It also marks where it is unsure. The doubt gathers in the loose ends, in violet.', sources: ['plddt', 'p53'], kind: 'measured', extra: 1 },
      {
        id: 'aware',
        text: 'Finding a pattern isn’t understanding it. Whether a machine could ever be aware is an open question.',
        sources: ['consciousness'],
        kind: 'speculative',
        extra: 1.5,
      },
      { text: 'Which brings us back to the one instrument you carry everywhere.' },
    ],
    scale: [{ at: 0, log10m: -7.9 }],
    facts: [
      { text: 'Some of AlphaFold’s doubt is a protein that is genuinely floppy; some is the model not knowing. Only experiment can say which.', sources: ['plddt'] },
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
      { id: 'andromeda', text: 'That faint smudge is the Andromeda Galaxy. Its light left 2.5 million years ago.', sources: ['andromeda'], kind: 'measured', extra: 0.5 },
      { id: 'lenses', text: 'Now look again, through other eyes.' },
      { lens: 'infrared', text: 'In infrared, warm things glow, the way a pit viper sees you in the dark.', sources: ['body-infrared', 'pit-viper'], kind: 'inferred', extra: 1.5 },
      { lens: 'neutrinos', text: 'Neutrinos from the Sun stream up through the Earth, and through you.', sources: ['neutrinos'], kind: 'inferred', extra: 1.5 },
      { id: 'always', text: 'Every instrument we build shows us a little more of what was always there.' },
      // Held, beyond its reading time, until the music's last notes (FILL).
      { id: 'last', text: 'So what’s in front of you right now that you haven’t learned to see?', question: true },
    ],
    scale: [
      { at: 0, log10m: -2 },
      { at: 0, shift: 3, log10m: 0.23 },
    ],
    facts: [{ text: 'Many migrating birds sense Earth’s magnetic field and use it to find their way.', sources: ['bird-magnet'] }],
    camera: 'The opening frame, exactly, with Andromeda named. Then the same frame through other eyes, one line each: infrared, then neutrinos. Clear again for the closing question, held to the last notes of the music.',
    reducedMotion: 'Holds the opening composition; lenses change without motion.',
  },
];
/** Build a chapter; `fill` lingers on its last line, so the ride ends with its music. */
function build(def: ChapterDef, fill = 0): Chapter {
  let at = 0;
  const beats: Beat[] = def.beats.map((b, i) => {
    const dur = (i === 0 ? 3.5 : readTime(b.text)) + (b.question ? 1.5 : 0) + (b.extra ?? 0) + (i === def.beats.length - 1 ? fill : 0);
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

const DRAFT = DEFS.map((d) => build(d));
/** Seconds the closing line holds beyond its reading time, to land on the music's last notes. */
export const FILL = Math.max(0, MUSIC_SECONDS - DRAFT.reduce((t, c) => t + c.duration, 0));
export const CHAPTERS: Chapter[] = DEFS.map((d, i) => (i === DEFS.length - 1 ? build(d, FILL) : DRAFT[i]));

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
