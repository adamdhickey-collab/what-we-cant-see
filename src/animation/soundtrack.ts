// A soundtrack that drives the clock. While it plays, the story's time is
// read from the music's position through the cue map, so picture and sound
// cannot drift; pausing, scrubbing and chapter jumps move the music to match.
// Loaded only in development, from a file that never leaves this machine.

import { TOTAL } from '../content/chapters';
import { CUES, MUSIC_LENGTH } from '../content/soundtrack';
import { director } from './director';

function along(x: number, xs: number[], ys: number[]) {
  if (x <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) {
    if (x <= xs[i]) return ys[i - 1] + ((ys[i] - ys[i - 1]) * (x - xs[i - 1])) / (xs[i] - xs[i - 1]);
  }
  return ys[ys.length - 1];
}

export function attachSoundtrack(src: string) {
  const audio = new Audio(src);
  audio.preload = 'auto';
  // A recording a few seconds longer or shorter than the cues assume stretches them to fit.
  let k = 1;
  const music = () => CUES.map((c) => c.music * k);
  const story = CUES.map((c) => c.story);
  const storyAt = (m: number) => along(m, music(), story);
  const musicAt = (t: number) => along(t, story, music());

  let last = director.get().t;
  director.source = {
    read: () => (last = audio.ended ? TOTAL : storyAt(audio.currentTime)),
    display: musicAt,
    total: MUSIC_LENGTH,
  };

  audio.addEventListener('loadedmetadata', () => {
    k = audio.duration / MUSIC_LENGTH;
    director.source!.total = audio.duration;
    console.info(`Soundtrack: ${src}, ${audio.duration.toFixed(1)} s, driving the clock.`);
  });
  audio.addEventListener('error', () => {
    director.source = null;
    console.warn(`Soundtrack: could not load ${src}. Put the file in local/ and reload; the story runs on its own clock until then.`);
  });

  let playing = false;
  director.subscribe(() => {
    const s = director.get();
    if (s.playing !== playing) {
      playing = s.playing;
      if (playing) {
        audio.currentTime = musicAt(s.t);
        last = s.t;
        audio.play().catch(() => console.warn('Soundtrack: the browser wants a click before it plays sound. Press play.'));
      } else audio.pause();
    } else if (Math.abs(s.t - last) > 0.25) {
      // A seek that did not come from the music: a scrub, a chapter, a step.
      audio.currentTime = musicAt(s.t);
      last = s.t;
    }
  });

  // M marks a moment in the music, a swell or a change, to pair with the story
  // moment it should land on and paste into src/content/soundtrack.ts.
  addEventListener('keydown', (e) => {
    if (e.key !== 'm' || e.metaKey || e.ctrlKey) return;
    const m = Math.round((audio.currentTime / k) * 10) / 10;
    console.info(`Soundtrack mark: music ${m} s (story is at ${director.get().t.toFixed(1)} s now) → { music: ${m}, story: ? },`);
  });
}
