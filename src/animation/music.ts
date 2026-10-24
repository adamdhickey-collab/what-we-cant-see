// Music, alongside the ride: Max Richter's On the Nature of Daylight, served
// with the site from public/audio. Nothing is fetched until the viewer
// chooses music, and the choice is remembered like the other options.
//
// The music does not drive the clock. The story keeps its own seconds, so
// every line still gets its full reading time, and the music follows: it
// plays while the ride plays, waits at every stop and pause, and jumps when
// the viewer scrubs. The script is cut to the recording's length, so music
// and ride start together and end together (scripts/check-script.mjs holds
// them to it). ?from=<story seconds> starts it somewhere else.

import { director } from './director';
import { MUSIC_SECONDS } from '../content/chapters';

export const MUSIC = {
  src: 'audio/on-the-nature-of-daylight.mp3',
  title: 'On the Nature of Daylight',
  artist: 'Max Richter',
};
/** The recording's length, until the file reports its own. */
const FALLBACK_LENGTH = MUSIC_SECONDS;
/** How far the music may drift from the story before it is moved back in step. */
const DRIFT = 0.4;

class Music {
  private audio: HTMLAudioElement | null = null;
  private length = FALLBACK_LENGTH;
  private from: number | null = null;
  /** Story time at which the music's first note falls. */
  private anchor = 0;
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
