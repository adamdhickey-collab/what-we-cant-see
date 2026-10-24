// The Naropa edition, ?edition=naropa: the ride as a student of contemplative
// psychology at Naropa University might be shown it. The outer voice, the
// scenes, the scale and every figure are the original's, untouched. What
// changes is the inner voice: it is drawn from what the BA in Psychology
// teaches (mindfulness-awareness, maitri, impermanence, interbeing, dependent
// arising, contemplative neuroscience), and it invites a few moments of first-
// person inquiry, the program's other instrument.
//
// A line that names a teaching is tagged 'contemplative' and cites where
// Naropa teaches it. That says what the line is, a view from a tradition, not
// a finding; where a teaching and a measurement rhyme, the line says which is
// which. research/NAROPA-EDITION.md has the research behind each choice.

import type { BeatDef, ChapterDef } from './chapters.ts';

interface Revision {
  /** Inner lines added after a named line of the original, in order. */
  after: Record<string, BeatDef[]>;
}

const inner = (text: string, more?: Partial<BeatDef>): BeatDef => ({ inner: true, text, ...more });
const teaching = (text: string, source: string): BeatDef => inner(text, { kind: 'contemplative', sources: [source] });
/** An invitation to try it, with time to. */
const practice = (text: string, extra: number) => inner(text, { extra });

const REVISIONS: Record<string, Revision> = {
  shore: {
    after: {
      stars: [teaching('Naropa’s founder had a word for what busy thought hides like daylight: basic goodness, there all along.', 'basic-goodness')],
      blindspot: [inner('You could meditate for years and never find that gap. The cushion and the lab see different things.')],
      spin: [practice('Try it now: feel your weight settle into a stillness that is racing east.', 3)],
    },
  },
  far: {
    after: {
      sun: [inner('Everything you see has already happened. Practice is learning to meet it freshly, as it arrives.')],
      five: [teaching('Science’s honest answer is “we don’t know.” Zen calls that beginner’s mind: not knowing, and looking anyway.', 'beginners-mind')],
    },
  },
  many: {
    after: {
      threads: [teaching('The web is gravity, not a teaching. Still, Buddhist psychology names the pattern: dependent arising.', 'dependent-origination')],
      looks: [
        inner('Your attention faces the same flood. Your conscious mind handles about ten bits a second.', { kind: 'inferred', sources: ['bits'] }),
        teaching('Meditation isn’t a wider channel. It is practice in where attention rests, and noticing when it wanders.', 'mindfulness-awareness'),
      ],
    },
  },
  faint: {
    after: {
      lock: [inner('No single sitting shows much either. What practice reveals appears in the stacking, day after day.')],
      exominer: [inner('“Very probably,” not “certainly.” Holding a finding lightly is a discipline, in the lab and on the cushion.')],
    },
  },
  time: {
    after: {
      now: [teaching('Even “now” is built. Meditators who watch it closely find impermanence: nothing holds still to be seen.', 'impermanence')],
      window: [practice('Try one breath, start to finish. Notice where it begins, and the moment your mind leaves it.', 4)],
    },
  },
  small: {
    after: {
      microbes: [teaching('Thich Nhat Hanh’s word for this is interbeing. A biologist would say symbiosis.', 'interbeing')],
      turnover: [inner('The body that began this ride is already not quite the body watching it.')],
      atom: [teaching('Buddhist psychology searches the parts of a person for a self, and finds none there.', 'skandhas'), inner('And still, here you are, aware.')],
    },
  },
  unsure: {
    after: {
      check: [teaching('Maitri, friendliness toward yourself, begins the same way: seeing your own loose ends clearly, without judgment.', 'maitri')],
      aware: [
        teaching('Contemplative neuroscience studies awareness from both sides: the brain on the scan, the person sitting inside it.', 'contemplative-neuro'),
        inner('Science can’t yet say what awareness is. You have been looking out from it your whole life.'),
      ],
    },
  },
  return: {
    after: {
      always: [
        teaching('Naropa’s psychology begins from one conviction: health and wellbeing are innate, there before anything is added.', 'naropa-psych'),
        inner('The oldest instrument is attention. It costs nothing, and it is always here.'),
      ],
    },
  },
};

/** The original's chapters with its inner voice replaced by this edition's. */
export function reviseForNaropa(defs: ChapterDef[]): ChapterDef[] {
  return defs.map((c) => {
    const r = REVISIONS[c.id];
    if (!r) return c;
    for (const id of Object.keys(r.after)) if (!c.beats.some((b) => b.id === id)) throw new Error(`Naropa edition: no line "${id}" in chapter ${c.id}`);
    const beats = c.beats.filter((b) => !b.inner).flatMap((b) => [b, ...((b.id && r.after[b.id]) || [])]);
    return { ...c, beats };
  });
}

/** What the page says about this edition. */
export const NAROPA = {
  kicker: 'An interactive ride by Adam Hickey · The Naropa edition',
  lede: 'Alongside it runs an inner voice drawn from the contemplative psychology taught at Naropa University.',
  textNote:
    'The lines in italics are the inner voice, drawn from the contemplative psychology taught at Naropa University. Those that name a teaching say so, and cite where Naropa teaches it.',
};
