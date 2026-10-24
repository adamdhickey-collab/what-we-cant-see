// How the story's 3:40 lies along a 6:11 piece of music. The story keeps its
// own seconds, the ones every chapter and scene is written in; this map only
// says which moment of the music each moment of the story lands on. Between
// cues, time stretches evenly.
//
// The cues below sit on the chapter boundaries, spread in proportion to each
// chapter's length. They are a starting point to tune by ear: play with
// ?soundtrack, press M on a swell or a change, and the console prints that
// moment of the music; pair it with the story second it should land on. Any
// number of cues may be added, inside chapters too, as long as both columns
// keep rising.

import { STARTS, TOTAL } from './chapters';

/** The length the cues are written for: the album version of On the Nature of Daylight. */
export const MUSIC_LENGTH = 371;

export interface Cue {
  /** Seconds into the music. */
  music: number;
  /** Seconds into the story. */
  story: number;
}

export const CUES: Cue[] = [...STARTS, TOTAL].map((story) => ({
  music: Math.round((story / TOTAL) * MUSIC_LENGTH * 10) / 10,
  story,
}));
