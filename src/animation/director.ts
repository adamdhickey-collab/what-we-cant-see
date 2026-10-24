// The director owns the one clock. The ride (guided) advances it, Wander
// (explore) moves it by hand, and every scene and every line of text is a
// function of it, so the two modes can never fall out of step. At a hold the
// ride stops and waits for the viewer to try something, then carries on.

import { useSyncExternalStore } from 'react';
import { CHAPTERS, HOLDS, STARTS, TOTAL, chapterIndexAt, beatIndexAt, type HoldId } from '../content/chapters';
import type { LensId } from '../content/extras';

export type Mode = 'guided' | 'explore';
export type ProteinView = 'auto' | 'prediction' | 'confidence' | 'verify';

export interface Prefs {
  /** Show each line's kind of claim and its source. */
  evidence: boolean;
  sound: boolean;
  /** Read the lines aloud with the device's voice. */
  voice: boolean;
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
  /** The hold the ride is stopped at, if any. */
  waiting: HoldId | null;
  /** What the viewer did at each hold. */
  answers: Partial<Record<HoldId, string>>;
  /** Zoobot's teal picks, which the viewer can hide to compare. */
  picks: boolean;
  lens: LensId | null;
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
  const fallback: Prefs = { evidence: false, sound: false, voice: false };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') };
  } catch {
    return fallback;
  }
}

class Director {
  private s: DirectorState;
  private listeners = new Set<Listener>();
  source: ClockSource | null = null;
  /** Set for a wall display: holds wait a few seconds, then carry on by themselves. */
  kiosk = false;

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
      waiting: null,
      answers: {},
      picks: true,
      lens: null,
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
    const { evidence, sound, voice } = this.s;
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ evidence, sound, voice }));
    } catch {
      /* A private window: the choice lasts this visit only. */
    }
  }

  tick(dt: number) {
    if (!this.s.playing) return;
    const from = this.s.t;
    let t = this.source ? this.source.read() : from + dt;
    // The ride stops at a hold it reaches while playing; a seek never trips one.
    const hold = this.s.mode === 'guided' ? HOLDS.find((h) => from < h.t && t >= h.t) : undefined;
    if (hold) {
      this.set({ t: hold.t, playing: false, waiting: hold.id });
      return;
    }
    if (t >= TOTAL) {
      t = TOTAL;
      this.set({ t, playing: false, ended: true, endedAt: this.s.endedAt ?? Date.now() });
    } else this.set({ t });
  }

  begin(mode: Mode) {
    this.set({ started: true, mode, playing: mode === 'guided', t: 0, ended: false, waiting: null, answers: {}, lens: null, beganAt: Date.now(), endedAt: null });
  }

  play() {
    const restart = this.s.ended || this.s.t >= TOTAL - 0.05;
    this.set({
      started: true,
      playing: true,
      mode: 'guided',
      ended: false,
      waiting: null,
      t: restart ? 0 : this.s.t,
      proteinView: 'auto',
      foldPeriod: null,
      ...(restart ? { answers: {}, lens: null, beganAt: Date.now(), endedAt: null } : {}),
    });
  }

  /** Record what the viewer did at a hold, without moving on. */
  answer(hold: HoldId, value: string) {
    this.set({ answers: { ...this.s.answers, [hold]: value } });
  }

  /** Carry on from a hold: the ride resumes, or in Wander the next line comes up. */
  resolve() {
    if (this.s.waiting) {
      this.set({ waiting: null });
      this.play();
    } else this.step(1);
  }

  pause() {
    this.set({ playing: false });
  }

  toggle() {
    if (this.s.playing) this.pause();
    else if (this.s.waiting) this.resolve();
    else this.play();
  }

  /** Hand control to the viewer: the clock stops and the instruments are theirs. */
  explore() {
    this.set({ playing: false, mode: 'explore', started: true, waiting: null });
  }

  seek(t: number) {
    this.set({ t: Math.max(0, Math.min(TOTAL, t)), ended: false, started: true, waiting: null });
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
