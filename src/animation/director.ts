// The director owns the one clock. The ride (guided) advances it straight
// through, start to finish; Wander (explore) moves it by hand. Every scene and
// every line of text is a function of it, so the two can never fall out of step.

import { useSyncExternalStore } from 'react';
import { CHAPTERS, STARTS, TOTAL, chapterIndexAt, beatIndexAt } from '../content/chapters';

export type Mode = 'guided' | 'explore';
export type ProteinView = 'auto' | 'prediction' | 'confidence' | 'verify';

export interface Prefs {
  /** Show each line's kind of claim and its source. */
  evidence: boolean;
  sound: boolean;
  /** Play On the Nature of Daylight alongside the ride; the built-in sound then stays quiet. */
  music: boolean;
}

export interface DirectorState extends Prefs {
  t: number;
  playing: boolean;
  mode: Mode;
  started: boolean;
  ended: boolean;
  reduced: boolean;
  /** 'auto' follows the narration; anything else is the viewer's choice. */
  proteinView: ProteinView;
  /** Days, or null while the narration drives the period search. */
  foldPeriod: number | null;
  webgl: boolean;
  /** Wall-clock milliseconds when the ride began, and when it ended, for the meter. */
  beganAt: number;
  endedAt: number | null;
}

/**
 * Something other than the frame clock that says where the story is, such
 * as a soundtrack. While playing, the director reads it instead of adding dt,
 * and the transport shows its time rather than the story's.
 */
export interface ClockSource {
  /** Story time now. */
  read(): number;
  /** The source's own time for a story time, and its full length, for display. */
  display(t: number): number;
  total: number;
}

type Listener = () => void;

const PREFS_KEY = 'wwcs-prefs';
function loadPrefs(): Prefs {
  const fallback: Prefs = { evidence: false, sound: false, music: false };
  // ?music turns the music on for this visit, for a wall or a link that wants it.
  const asked = typeof location !== 'undefined' && new URLSearchParams(location.search).has('music') ? { music: true } : {};
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}'), ...asked };
  } catch {
    return { ...fallback, ...asked };
  }
}

class Director {
  private s: DirectorState;
  private listeners = new Set<Listener>();
  source: ClockSource | null = null;

  constructor() {
    const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.s = {
      t: 0,
      playing: false,
      mode: 'guided',
      started: false,
      ended: false,
      reduced,
      proteinView: 'auto',
      foldPeriod: null,
      webgl: true,
      beganAt: 0,
      endedAt: null,
      ...loadPrefs(),
    };
    if (typeof matchMedia !== 'undefined') {
      matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => this.set({ reduced: e.matches }));
    }
  }

  get = () => this.s;

  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  set(patch: Partial<DirectorState>) {
    this.s = { ...this.s, ...patch };
    this.listeners.forEach((l) => l());
  }

  setPref(patch: Partial<Prefs>) {
    this.set(patch);
    const { evidence, sound, music } = this.s;
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ evidence, sound, music }));
    } catch {
      /* A private window: the choice lasts this visit only. */
    }
  }

  tick(dt: number) {
    if (!this.s.playing) return;
    let t = this.source ? this.source.read() : this.s.t + dt;
    if (t >= TOTAL) {
      t = TOTAL;
      this.set({ t, playing: false, ended: true, endedAt: this.s.endedAt ?? Date.now() });
    } else this.set({ t });
  }

  begin(mode: Mode) {
    this.set({ started: true, mode, playing: mode === 'guided', t: 0, ended: false, beganAt: Date.now(), endedAt: null });
  }

  play() {
    const restart = this.s.ended || this.s.t >= TOTAL - 0.05;
    this.set({
      started: true,
      playing: true,
      mode: 'guided',
      ended: false,
      t: restart ? 0 : this.s.t,
      proteinView: 'auto',
      foldPeriod: null,
      ...(restart ? { beganAt: Date.now(), endedAt: null } : {}),
    });
  }

  pause() {
    this.set({ playing: false });
  }

  toggle() {
    if (this.s.playing) this.pause();
    else this.play();
  }

  /** Hand control to the viewer: the clock stops and the instruments are theirs. */
  explore() {
    this.set({ playing: false, mode: 'explore', started: true });
  }

  seek(t: number) {
    this.set({ t: Math.max(0, Math.min(TOTAL, t)), ended: false, started: true });
  }

  goToChapter(i: number) {
    const c = Math.max(0, Math.min(CHAPTERS.length - 1, i));
    this.seek(STARTS[c] + 0.01);
  }

  /** Step to the next or previous line of narration, across chapters. */
  step(dir: 1 | -1) {
    const ci = chapterIndexAt(this.s.t);
    const local = this.s.t - STARTS[ci];
    const bi = beatIndexAt(CHAPTERS[ci], local);
    const beats = CHAPTERS.flatMap((c, i) => c.beats.map((b) => STARTS[i] + b.at));
    const flat = CHAPTERS.slice(0, ci).reduce((n, c) => n + c.beats.length, 0) + bi;
    const target = beats[Math.max(0, Math.min(beats.length - 1, flat + dir))];
    this.seek(target + 0.01);
  }
}

export const director = new Director();

export function useDirector<T>(select: (s: DirectorState) => T): T {
  return useSyncExternalStore(director.subscribe, () => select(director.get()));
}

// A handle for browser automation in development only; production builds drop it.
if (import.meta.env.DEV) (window as unknown as { director: Director }).director = director;
