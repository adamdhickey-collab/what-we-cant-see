// Music from YouTube, alongside the ride: ?music plays the official upload of
// Max Richter's On the Nature of Daylight (or ?music=<video id>) through
// YouTube's own embedded player, which stays visible in a corner as YouTube
// requires. Nothing is downloaded.
//
// Unlike ?soundtrack, the music does not drive the clock. The story keeps its
// own seconds, so every line still gets its full reading time, and the music
// follows: it plays while the ride plays, waits at every stop and pause, and
// jumps when the viewer scrubs. By default it is placed so its last note
// lands just after the closing question; &from=<story seconds> starts it
// somewhere else instead. Development only, like the soundtrack.

import { beatStart, CH, STARTS } from '../content/chapters';
import { director } from './director';

const DEFAULT_ID = 'rVN1B-tUpgs';
/** The official upload's length, until the player reports its own. */
const FALLBACK_LENGTH = 375;
/** Story time at which the last note should fall: a few seconds into the closing question. */
const LAND = STARTS[CH.return] + beatStart('return', 'last') + 5;

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(s: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  mute(): void;
  unMute(): void;
}
type YTNamespace = { Player: new (el: HTMLElement, opts: object) => YTPlayer; PlayerState: { PLAYING: number } };

function loadApi(): Promise<YTNamespace> {
  const w = window as unknown as { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void };
  if (w.YT?.Player) return Promise.resolve(w.YT);
  return new Promise((resolve) => {
    w.onYouTubeIframeAPIReady = () => resolve(w.YT!);
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  });
}

export async function attachMusic(id: string, from: number | null) {
  const YT = await loadApi();
  const box = document.createElement('div');
  box.className = 'music-player';
  box.setAttribute('aria-label', 'Music: On the Nature of Daylight, Max Richter');
  const host = document.createElement('div');
  box.appendChild(host);
  document.body.appendChild(box);

  let ready = false;
  let length = FALLBACK_LENGTH;
  const offset = () => from ?? LAND - length;
  const player = new YT.Player(host, {
    width: 200,
    height: 200,
    videoId: id || DEFAULT_ID,
    playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0, modestbranding: 1 },
    events: {
      onReady: () => {
        ready = true;
        length = player.getDuration() || FALLBACK_LENGTH;
        console.info(`Music: ${id || DEFAULT_ID}, ${length.toFixed(0)} s, from story ${offset().toFixed(1)} s to ${(offset() + length).toFixed(1)} s.`);
        sync();
      },
    },
  });
  (window as unknown as { musicPlayer: YTPlayer }).musicPlayer = player;
  // The built-in sound bed steps aside while there is music.
  director.set({ music: true });

  let playing = false;
  const sync = () => {
    if (!ready) return;
    const s = director.get();
    const at = s.t - offset();
    const inside = at >= 0 && at < length;
    const should = s.playing && inside;
    if (inside && Math.abs(player.getCurrentTime() - at) > 0.6) player.seekTo(at, true);
    if (should && !playing) player.playVideo();
    if (!should && playing) player.pauseVideo();
    playing = should;
  };
  director.subscribe(sync);

  // Browsers only start sound inside a click. The first click anywhere wakes
  // the player, muted, so it can come in later on cue without one.
  addEventListener(
    'pointerdown',
    () => {
      if (!ready || playing) return;
      player.mute();
      player.playVideo();
      setTimeout(() => {
        if (!playing) player.pauseVideo();
        player.unMute();
      }, 400);
    },
    { once: true, capture: true },
  );
}
