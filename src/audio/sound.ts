// Sound, off until the viewer turns it on. Everything is synthesized in the
// browser, so no recording ships: a bed per kind of scene (the sea, space,
// the instrument, the body, a quiet room), crossfading with the chapters on
// the same clock as the picture, a soft bell at each reveal, and a clock's
// tick through the chapter about time. The voice option reads each line with
// the device's own speech voice.

import { director, type DirectorState } from '../animation/director';
import { beatIndexAt, beatStart, CH, chapterIndexAt, CHAPTERS, STARTS, type SceneId } from '../content/chapters';

type Layer = 'sea' | 'space' | 'lab' | 'inner' | 'room';
const LAYER_OF: Record<SceneId, Layer> = { shore: 'sea', cosmos: 'space', web: 'space', star: 'lab', within: 'inner', none: 'room' };
const LEVEL: Record<Layer, number> = { sea: 0.5, space: 0.4, lab: 0.25, inner: 0.35, room: 0.2 };
const FADE = 2;
const LOCK = STARTS[CH.faint] + beatStart('faint', 'lock');

class Sound {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private layers = {} as Record<Layer, GainNode>;
  private noise!: AudioBuffer;
  private raf = 0;
  private lastKey = -1;
  private lastT = 0;
  private lastTick = 0;
  private prev: DirectorState | null = null;
  /** Whether the master is up, as last set; null forces the next frame to set it. */
  private on: boolean | null = null;

  constructor() {
    director.subscribe(this.onChange);
  }

  /** Create or wake the audio graph. Call from a click: browsers start sound only on a gesture. */
  unlock() {
    if (!this.ctx) this.build();
    void this.ctx!.resume();
    this.apply();
  }

  private build() {
    const ctx = (this.ctx = new AudioContext());
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    // Brown noise: a random walk, softer than white.
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.5;
    }
    for (const l of Object.keys(LEVEL) as Layer[]) {
      const g = ctx.createGain();
      g.gain.value = 0;
      g.connect(this.master);
      this.layers[l] = g;
    }
    const osc = (type: OscillatorType, f: number, gain: number, to: AudioNode) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = gain;
      o.connect(g).connect(to);
      o.start();
      return o;
    };
    const lfo = (rate: number, depth: number, param: AudioParam) => {
      const o = ctx.createOscillator();
      o.frequency.value = rate;
      const g = ctx.createGain();
      g.gain.value = depth;
      o.connect(g).connect(param);
      o.start();
    };
    const filter = (type: BiquadFilterType, f: number, to: AudioNode) => {
      const b = ctx.createBiquadFilter();
      b.type = type;
      b.frequency.value = f;
      b.connect(to);
      return b;
    };
    const noiseInto = (to: AudioNode) => {
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      src.loop = true;
      src.connect(to);
      src.start();
    };

    // The sea: low noise with a slow swell.
    const swell = ctx.createGain();
    swell.gain.value = 0.6;
    swell.connect(this.layers.sea);
    lfo(0.09, 0.4, swell.gain);
    noiseInto(filter('lowpass', 420, swell));
    // Space: a low open fifth, breathing through a slowly opening filter.
    const air = filter('lowpass', 500, this.layers.space);
    lfo(0.03, 250, air.frequency);
    [55, 82.41, 110.3, 164.8].forEach((f, i) => osc('sine', f, 0.16 / (i + 1), air));
    // The instrument: a faint, high, steady tone.
    const tone = filter('lowpass', 2000, this.layers.lab);
    [659.25, 987.77].forEach((f) => osc('sine', f, 0.03, tone));
    noiseInto(filter('highpass', 3000, this.layers.lab));
    // The body: warm, low, a little inner pulse.
    const warm = ctx.createGain();
    warm.gain.value = 0.7;
    warm.connect(filter('lowpass', 800, this.layers.inner));
    lfo(1.1, 0.25, warm.gain);
    [146.83, 220, 293.66].forEach((f, i) => osc('triangle', f, 0.07 / (i + 1), warm));
    // A quiet room.
    osc('sine', 98, 0.05, this.layers.room);
    noiseInto(filter('bandpass', 900, this.layers.room));
    this.layers.room.gain.value = 0;

    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      this.mix();
    };
    loop();
  }

  /** Ask the next frame to bring the master level in line with the settings. */
  private apply() {
    this.on = null;
  }

  /** Each bed's level from the clock, crossfading over the chapter boundaries like the picture. */
  private mix() {
    const ctx = this.ctx!;
    const s = director.get();
    const on = s.sound && s.started && !s.music;
    if (on !== this.on) {
      this.on = on;
      this.master.gain.cancelScheduledValues(ctx.currentTime);
      this.master.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, on ? 0.8 : 0.3);
    }
    const target: Record<Layer, number> = { sea: 0, space: 0, lab: 0, inner: 0, room: 0 };
    CHAPTERS.forEach((c, i) => {
      const a = STARTS[i], b = a + c.duration;
      const w = Math.min(1, Math.max(0, (s.t - a + FADE) / (2 * FADE))) * Math.min(1, Math.max(0, (b - s.t + FADE) / (2 * FADE)));
      target[LAYER_OF[c.scene]] += w;
    });
    for (const l of Object.keys(target) as Layer[]) this.layers[l].gain.setTargetAtTime(Math.min(1, target[l]) * LEVEL[l], ctx.currentTime, 0.4);

    // A clock's tick, once a second of story, through the chapter about time.
    const ci = chapterIndexAt(s.t);
    if (ci === CH.time && s.playing && Math.floor(s.t) !== this.lastTick) {
      this.lastTick = Math.floor(s.t);
      this.click();
    }
    // A chord as the planet's dip appears.
    if (this.lastT < LOCK && s.t >= LOCK && s.playing) this.bell([523.25, 659.25, 783.99], 0.12);
    this.lastT = s.t;
  }

  private click() {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2400;
    bp.Q.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    src.connect(bp).connect(g).connect(this.master);
    src.start(ctx.currentTime, Math.random(), 0.06);
  }

  private bell(freqs: number[], level = 0.1) {
    const ctx = this.ctx;
    if (!ctx || !director.get().sound) return;
    const now = ctx.currentTime;
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now + i * 0.06);
      g.gain.linearRampToValueAtTime(level, now + i * 0.06 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0005, now + i * 0.06 + 3);
      o.connect(g).connect(this.master);
      o.start(now + i * 0.06);
      o.stop(now + i * 0.06 + 3.2);
    });
  }

  private speak(text: string) {
    if (typeof speechSynthesis === 'undefined') return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/·/g, ','));
    u.rate = 1.02;
    speechSynthesis.speak(u);
  }

  private onChange = () => {
    const s = director.get();
    const p = this.prev;
    this.prev = s;
    if (p && (p.sound !== s.sound || p.started !== s.started)) this.apply();
    if (p && p.voice && !s.voice && typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();

    const ci = chapterIndexAt(s.t);
    const bi = beatIndexAt(CHAPTERS[ci], s.t - STARTS[ci]);
    const key = ci * 100 + bi;
    if (key !== this.lastKey) {
      const beat = CHAPTERS[ci].beats[bi];
      if (s.playing || s.mode === 'explore') {
        if (bi === 0) this.bell([392], 0.06);
        else if (beat.question) this.bell([493.88, 659.25], 0.07);
        if (s.voice && s.started) this.speak(beat.text);
      }
      this.lastKey = key;
    }
    if (p && !p.waiting && s.waiting) this.bell([587.33], 0.07);
    if (p && p.answers !== s.answers) this.bell([783.99, 1046.5], 0.06);
    if (p && p.playing && !s.playing && !s.waiting && typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  };

  dispose() {
    cancelAnimationFrame(this.raf);
    void this.ctx?.close();
  }
}

export const sound = new Sound();

// A handle for browser automation in development only; production builds drop it.
if (import.meta.env.DEV) (window as unknown as { sound: Sound }).sound = sound;
