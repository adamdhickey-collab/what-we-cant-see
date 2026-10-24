// The storyboard as data. Every chapter declares what it says, what it shows,
// how long it lasts and which scale it sits at, and the director, the stage,
// the narrative and the scale navigator all read from this one list. The
// prose companion is research/STORYBOARD.md.

import type { Kind } from './sources';

export type SceneId = 'shore' | 'cosmos' | 'web' | 'star' | 'within';

export interface Beat {
  /** Seconds from the chapter's start. */
  at: number;
  text: string;
  sources?: string[];
  /** The kind of claim the line makes, shown beside it. */
  kind?: Kind;
  /** The chapter's one question, set larger. */
  question?: boolean;
}

/** A scale keyframe: log10 of the width in view, in meters. */
export interface ScaleKey {
  at: number;
  log10m: number;
}

export interface Chapter {
  id: string;
  title: string;
  duration: number;
  scene: SceneId;
  beats: Beat[];
  scale: ScaleKey[];
  /** Production notes, read by the storyboard doc and by people. */
  camera: string;
  controls: string;
  reducedMotion: string;
  sources: string[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'moment',
    title: 'One human moment',
    duration: 24,
    scene: 'shore',
    beats: [
      { at: 0, text: 'What we can’t see' },
      { at: 5, text: 'Someone is sitting at the edge of the water. The sun went down a few minutes ago.' },
      {
        at: 11,
        text: 'Everything they can see of the sea ends about 4.7 kilometers away, where the Earth curves out of sight.',
        sources: ['horizon'],
        kind: 'inferred',
      },
      { at: 17, text: 'How much is out there that no eye was made to see?', question: true },
    ],
    scale: [
      { at: 0, log10m: 0.23 },
      { at: 9, log10m: 0.6 },
      { at: 16, log10m: 3.67 },
      { at: 24, log10m: 3.9 },
    ],
    camera: 'Locked off, eye height, horizon at 42% of the frame. In the last six seconds the horizon line becomes a row of points.',
    controls: 'Play, pause, chapter rail, scale navigator.',
    reducedMotion: 'Water and stars hold still; the horizon resolves to points without travelling.',
    sources: ['horizon'],
  },
  {
    id: 'horizon',
    title: 'Beyond the horizon',
    duration: 34,
    scene: 'cosmos',
    beats: [
      { at: 0, text: 'Beyond the horizon' },
      { at: 4, text: 'Rise until the horizon closes into a planet, 12,742 kilometers across.', sources: ['earth'], kind: 'measured' },
      {
        at: 11,
        text: 'Its light comes from a star 150 million kilometers away. Sunlight takes eight minutes and nineteen seconds to make the trip.',
        sources: ['au', 'light-minutes'],
        kind: 'measured',
      },
      {
        at: 18,
        text: 'These rings are the planets’ orbits, drawn to true scale. Neptune’s is thirty times wider than ours. The planets themselves are too small to see.',
        sources: ['neptune'],
        kind: 'measured',
      },
      {
        at: 23,
        text: 'The nearest other star is 4.24 light-years away. Between here and there is almost nothing at all.',
        sources: ['proxima'],
        kind: 'measured',
      },
      {
        at: 29,
        text: 'Our galaxy is about 100,000 light-years across, a few hundred billion stars. Seen from inside, it is the faint band in a dark sky.',
        sources: ['milky-way'],
        kind: 'inferred',
      },
    ],
    scale: [
      { at: 0, log10m: 3.9 },
      { at: 4, log10m: 5.5 },
      { at: 8, log10m: 7.4 },
      { at: 12, log10m: 9.2 },
      { at: 16, log10m: 11.6 },
      { at: 21, log10m: 12.95 },
      { at: 25, log10m: 16.7 },
      { at: 28, log10m: 17.0 },
      { at: 34, log10m: 21.1 },
    ],
    camera: 'One continuous pull-back whose distance is the scale value itself, so the navigator and the picture cannot disagree. The view tilts from the ecliptic to above the galaxy.',
    controls: 'Scrubbing moves the camera; landmarks on the scale navigator jump to their moment.',
    reducedMotion: 'Each line of text holds a still view at its scale; changes are cuts, not travel.',
    sources: ['earth', 'au', 'light-minutes', 'neptune', 'proxima', 'milky-way'],
  },
  {
    id: 'structure',
    title: 'The great structure',
    duration: 40,
    scene: 'web',
    beats: [
      { at: 0, text: 'The great structure' },
      {
        at: 5,
        text: 'Pull back far enough and every point is a galaxy. They are not scattered evenly. They gather into walls and filaments around enormous voids.',
        sources: ['web', 'web-points'],
        kind: 'illustrative',
      },
      {
        at: 12,
        text: 'No one has ever seen this. It is a map, built from the light of millions of galaxies, each placed by how much its light has stretched on the way to us.',
        sources: ['web'],
        kind: 'inferred',
      },
      {
        at: 20,
        text: 'In March 2025, ESA’s Euclid telescope released 26 million galaxies from one week of observing. A model called Zoobot, trained with the help of 9,976 volunteers, sorted 380,000 of them by shape: about one in seventy, marked here in teal.',
        sources: ['euclid-q1', 'zoobot'],
        kind: 'measured',
      },
      {
        at: 30,
        text: 'Farther out still, the web evens into a nearly uniform haze.',
        sources: ['homogeneity'],
        kind: 'inferred',
      },
      {
        at: 35,
        text: 'The observable universe is about 92 billion light-years across. That is how far light has had time to reach us, not the edge of everything.',
        sources: ['observable', 'age'],
        kind: 'inferred',
      },
    ],
    scale: [
      { at: 0, log10m: 21.1 },
      { at: 6, log10m: 22.6 },
      { at: 14, log10m: 23.9 },
      { at: 24, log10m: 24.7 },
      { at: 30, log10m: 25.0 },
      { at: 36, log10m: 26.94 },
      { at: 40, log10m: 26.94 },
    ],
    camera: 'Starts inside one galaxy, pulls out through the filaments while orbiting slowly, then out past the box until a sphere marks the observable limit.',
    controls: 'Drag to turn the structure while paused.',
    reducedMotion: 'No orbit; one composition per line of text.',
    sources: ['web', 'web-points', 'euclid-q1', 'zoobot', 'homogeneity', 'observable', 'age'],
  },
  {
    id: 'patterns',
    title: 'The patterns we miss',
    duration: 40,
    scene: 'star',
    beats: [
      { at: 0, text: 'The patterns we miss' },
      { at: 4, text: 'Collecting light and understanding it are different jobs.' },
      {
        at: 9,
        text: 'This is a real star, a little cooler than the Sun and 2,800 light-years away. NASA’s Kepler telescope measured its brightness every thirty minutes for ninety days. It looks like noise.',
        sources: ['kepler-1772', 'kepler-1772-star'],
        kind: 'measured',
      },
      {
        at: 15,
        text: 'Hidden in it, a planet a few times wider than Earth crosses in front of the star every few days, dimming it by about 150 parts per million.',
        sources: ['kepler-1772b', 'transit-depth'],
        kind: 'measured',
      },
      {
        at: 20,
        text: 'So try every possible orbit. For each one, stack the measurements as if that were the planet’s period, and look for a dip.',
        sources: ['bls'],
        kind: 'inferred',
      },
      {
        at: 31,
        text: 'At 3.21 days, the measurements line up and the planet appears. No single point showed it.',
        sources: ['bls', 'kepler-1772b'],
        kind: 'inferred',
      },
      {
        at: 35,
        text: 'Searches find thousands of dips like this, and most are not planets. This one is Kepler-1772 b, among the 301 that NASA’s ExoMiner, a neural network trained to tell planets from look-alikes, validated in 2021: very probably real, never seen.',
        sources: ['exominer', 'kepler-1772b', 'exominer-pp'],
        kind: 'measured',
      },
    ],
    scale: [
      { at: 0, log10m: 9.14 },
      { at: 40, log10m: 9.14 },
    ],
    camera: 'Still. A single star, dim, behind the instrument: 90 days of real Kepler measurements of Kepler-1772, folded at trial periods until the planet’s 3.21-day orbit appears.',
    controls: 'Fold period slider, a Search button that runs the period search, and a text summary of the result.',
    reducedMotion: 'The period search jumps to its result instead of sweeping.',
    sources: ['kepler-1772', 'kepler-1772-star', 'kepler-1772b', 'transit-depth', 'bls', 'exominer', 'exominer-pp'],
  },
  {
    id: 'within',
    title: 'The universe within',
    duration: 25,
    scene: 'within',
    beats: [
      { at: 0, text: 'The universe within' },
      { at: 4, text: 'Now turn inward. The person on the shore is made of about 30 trillion cells.', sources: ['cells', 'cell-points'], kind: 'inferred' },
      {
        at: 9,
        text: 'Inside each, proteins: chains of amino acids that fold into shapes, and the shape is the job.',
      },
      {
        at: 13,
        text: 'This is p53, which helps stop damaged cells from dividing. Each point is one of its 393 amino acids, where a model predicts it sits.',
        sources: ['p53'],
        kind: 'inferred',
      },
      {
        at: 20,
        text: 'Below that, atoms. Hydrogen’s electron is not a dot but a likelihood, densest a twenty-billionth of a meter from the center.',
        sources: ['hydrogen'],
        kind: 'inferred',
      },
    ],
    scale: [
      { at: 0, log10m: 0.23 },
      { at: 6, log10m: -4.55 },
      { at: 9.5, log10m: -4.75 },
      { at: 13, log10m: -7.9 },
      { at: 18.5, log10m: -7.95 },
      { at: 21.5, log10m: -9.65 },
      { at: 25, log10m: -9.8 },
    ],
    camera: 'Fixed. Each scale arrives as its own object growing past the frame, a cut in structure rather than a pretend camera move through a body.',
    controls: 'Drag to turn the protein while paused.',
    reducedMotion: 'Cuts between the cell, the protein and the atom.',
    sources: ['cells', 'cell-points', 'p53', 'hydrogen'],
  },
  {
    id: 'instrument',
    title: 'A new instrument',
    duration: 32,
    scene: 'within',
    beats: [
      { at: 0, text: 'A new instrument' },
      {
        at: 3,
        text: 'For sixty years, finding a protein’s shape meant months of experiment. About 190,000 were solved that way, and they taught the machine.',
        sources: ['experimental'],
        kind: 'measured',
      },
      {
        at: 9,
        text: 'AlphaFold predicts a shape from the sequence alone. Its database now holds about 200 million predictions.',
        sources: ['alphafold-db'],
        kind: 'measured',
      },
      {
        at: 15,
        text: 'It also says where it is unsure. For p53, 117 of the 393 amino acids score below 50 out of 100.',
        sources: ['plddt', 'p53'],
        kind: 'measured',
      },
      {
        at: 21,
        text: 'Some of that is a protein that is genuinely loose. Some is the model not knowing. Only an experiment can say which.',
        sources: ['plddt'],
        kind: 'inferred',
      },
      {
        at: 27,
        text: 'Finding a pattern is not understanding it, and understanding is not consciousness. Whether a machine could ever be conscious is an open question.',
        sources: ['consciousness'],
        kind: 'speculative',
      },
    ],
    scale: [
      { at: 0, log10m: -7.9 },
      { at: 32, log10m: -7.9 },
    ],
    camera: 'The protein, turning slowly, recolored by what the instrument claims.',
    controls: 'Prediction, Confidence and Needs checking views; drag to turn.',
    reducedMotion: 'No turning; the views change on each line of text.',
    sources: ['experimental', 'alphafold-db', 'plddt', 'p53', 'consciousness'],
  },
  {
    id: 'shore',
    title: 'Back to the shore',
    duration: 25,
    scene: 'shore',
    beats: [
      { at: 0, text: 'Back to the shore' },
      { at: 4, text: 'The same shore. The same dusk. Nothing in front of them has changed.' },
      {
        at: 10,
        text: 'That faint smudge above the water is the Andromeda Galaxy, 2.5 million light-years away: the farthest thing a human eye can see unaided. The light arriving tonight left before there were people.',
        sources: ['andromeda'],
        kind: 'measured',
      },
      { at: 17, text: 'Every instrument we build shows us a little more of what was always there.' },
      { at: 21, text: 'What is in front of us that we have not learned to see yet?', question: true },
    ],
    scale: [
      { at: 0, log10m: -2 },
      { at: 3, log10m: 0.23 },
      { at: 25, log10m: 0.23 },
    ],
    camera: 'The opening frame, exactly. Points along the horizon settle back into a line.',
    controls: 'Replay, or open the sources.',
    reducedMotion: 'Holds the opening composition.',
    sources: ['andromeda'],
  },
];

export const STARTS = CHAPTERS.reduce<number[]>((acc, _c, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + CHAPTERS[i - 1].duration);
  return acc;
}, []);

export const TOTAL = STARTS[STARTS.length - 1] + CHAPTERS[CHAPTERS.length - 1].duration;

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
