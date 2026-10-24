// Music, alongside the ride: Max Richter's On the Nature of Daylight, served
// with the site from public/audio. Nothing is fetched until the viewer
// chooses music, and the choice is remembered like the other options.
//
// The music does not drive the clock. The story keeps its own seconds, so
// every line still gets its full reading time, and the music follows: it
// plays while the ride plays, waits at every stop and pause, and jumps when
// the viewer scrubs. At a stop, where the ride waits for the viewer to try
// something, the music keeps going and the story picks up under wherever it
// has got to. It starts the moment the ride does and, being shorter
// than the ride, ends partway through; the sound effects, if on, carry the
// rest. ?from=<story seconds> starts it somewhere else.

import { director } from './director';

export const MUSIC = {
  src: 'audio/on-the-nature-of-daylight.mp3',
  title: 'On the Nature of Daylight',
  artist: 'Max Richter',
};
/** The recording's length, until the file reports its own. */
const FALLBACK_LENGTH = 374.9;
/** How far the music may drift from the story before it is moved back in step. */
const DRIFT = 0.4;

class Music {
  private audio: HTMLAudioElement | null = null;
  private length = FALLBACK_LENGTH;
  private from: number | null = null;
  /** Story time at which the music's first note falls; moves on by however long each stop takes. */
  private anchor = 0;
  private began = 0;
  private holding = false;
  private playing = false;

  constructor() {
    const from = new URLSearchParams(location.search).get('from');
    this.from = from === null ? null : +from;
    this.anchor = this.from ?? 0;
    director.subscribe(this.sync);
  }

  private offset() {
    return this.anchor;
  }

  /** Whether the music is playing at a moment of the story, so other sound can step aside. */
  covers(t: number) {
    const at = t - this.offset();
    return director.get().music && at >= 0 && at < this.length;
  }

  /** Start loading the recording, if the viewer wants music. Safe to call often. */
  prepare() {
    if (!director.get().music || this.audio) return;
    const a = (this.audio = new Audio(`${import.meta.env.BASE_URL}${MUSIC.src}`));
    a.preload = 'auto';
    a.addEventListener('loadedmetadata', () => {
      if (Number.isFinite(a.duration)) this.length = a.duration;
      this.sync();
    });
    if (import.meta.env.DEV) (window as unknown as { musicAudio: HTMLAudioElement }).musicAudio = a;
  }

  /**
   * Call from a click. Some browsers let an audio element start only from a
   * gesture the first time, so it is started silently here and can then come
   * in on cue without one.
   */
  wake() {
    this.prepare();
    const a = this.audio;
    if (!a || this.playing) return;
    a.muted = true;
    a.play()
      .then(() => {
        if (!this.playing) a.pause();
      })
      .catch(() => {})
      .finally(() => {
        a.muted = false;
        this.sync();
      });
  }

  private sync = () => {
    const a = this.audio;
    if (!a) return;
    const s = director.get();
    // A new ride, or a replay, starts the music from its own beginning again.
    if (s.beganAt !== this.began) {
      this.began = s.beganAt;
      this.anchor = this.from ?? 0;
    }
    // Through a stop the music plays on; afterwards the story continues under it.
    if (s.waiting && this.playing && s.music) {
      this.holding = true;
      return;
    }
    if (this.holding) {
      this.holding = false;
      this.anchor = s.t - a.currentTime;
    }
    // Scrubbed back before where the music now starts: line it up with the story again.
    if (this.from === null && s.t < this.anchor) this.anchor = 0;
    const at = s.t - this.offset();
    const inside = at >= 0 && at < this.length;
    const should = s.music && s.playing && inside;
    if (inside && Math.abs(a.currentTime - at) > DRIFT) a.currentTime = at;
    if (should && !this.playing) void a.play().catch(() => {});
    if (!should && this.playing) a.pause();
    this.playing = should;
  };
}

export const music = new Music();
