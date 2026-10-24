// Music, alongside the ride: Max Richter's On the Nature of Daylight, from
// its official upload, through YouTube's own embedded player. Nothing is
// downloaded or re-hosted. The player loads only once the viewer chooses
// music, uses YouTube's no-cookie domain, and stays visible in a corner at
// the minimum size YouTube's terms allow.
//
// The music does not drive the clock. The story keeps its own seconds, so
// every line still gets its full reading time, and the music follows: it
// plays while the ride plays, waits at every stop and pause, and jumps when
// the viewer scrubs. It is placed so its last note lands just after the
// closing question; ?from=<story seconds> starts it somewhere else.

import { beatStart, CH, STARTS } from '../content/chapters';
import { director } from './director';

export const MUSIC = {
  id: 'rVN1B-tUpgs',
  title: 'On the Nature of Daylight',
  artist: 'Max Richter',
  label: 'Fatcat Records',
};
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
  mute(): void;
  unMute(): void;
}
type YTNamespace = { Player: new (el: HTMLElement, opts: object) => YTPlayer };

function loadApi(): Promise<YTNamespace> {
  const w = window as unknown as { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void };
  if (w.YT?.Player) return Promise.resolve(w.YT);
  return new Promise((resolve, reject) => {
    w.onYouTubeIframeAPIReady = () => resolve(w.YT!);
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

class Music {
  private player: YTPlayer | null = null;
  private box: HTMLElement | null = null;
  private loading: Promise<void> | null = null;
  private ready = false;
  private playing = false;
  private length = FALLBACK_LENGTH;
  private from: number | null = null;

  constructor() {
    const from = new URLSearchParams(location.search).get('from');
    this.from = from === null ? null : +from;
    director.subscribe(this.sync);
  }

  private offset() {
    return this.from ?? LAND - this.length;
  }

  /** Load the player, if the viewer wants music. Safe to call often. */
  prepare() {
    if (!director.get().music || this.loading) return;
    this.loading = loadApi()
      .then((YT) => {
        const box = (this.box = document.createElement('div'));
        box.className = 'music-player';
        box.setAttribute('aria-label', `Music: ${MUSIC.title}, ${MUSIC.artist}`);
        const host = document.createElement('div');
        box.appendChild(host);
        document.body.appendChild(box);
        this.player = new YT.Player(host, {
          width: 200,
          height: 200,
          videoId: MUSIC.id,
          host: 'https://www.youtube-nocookie.com',
          playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
          events: {
            onReady: () => {
              this.ready = true;
              this.length = this.player!.getDuration() || FALLBACK_LENGTH;
              this.sync();
            },
          },
        });
        if (import.meta.env.DEV) (window as unknown as { musicPlayer: YTPlayer }).musicPlayer = this.player;
      })
      .catch(() => {
        // YouTube unreachable or blocked: the ride goes on without it.
        this.loading = null;
      });
  }

  /**
   * Call from a click. Browsers start sound only on a gesture, so a ready
   * player is woken here, muted for a moment, and can then come in on cue.
   */
  wake() {
    this.prepare();
    const p = this.player;
    if (!this.ready || !p || this.playing) return;
    p.mute();
    p.playVideo();
    setTimeout(() => {
      if (!this.playing) p.pauseVideo();
      p.unMute();
    }, 400);
  }

  private sync = () => {
    const s = director.get();
    if (this.box) this.box.hidden = !s.music || !s.started;
    const p = this.player;
    if (!this.ready || !p) return;
    const at = s.t - this.offset();
    const inside = at >= 0 && at < this.length;
    const should = s.music && s.playing && inside;
    if (inside && Math.abs(p.getCurrentTime() - at) > 0.6) p.seekTo(at, true);
    if (should && !this.playing) p.playVideo();
    if (!should && this.playing) p.pauseVideo();
    this.playing = should;
  };
}

export const music = new Music();
