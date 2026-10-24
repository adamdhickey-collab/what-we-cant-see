// A simulated light curve and a real search. The data is synthetic and says
// so: an Earth-size planet's 84 ppm transit, 3.9 hours long, every 9.7 days,
// in 70 ppm of noise per 30-minute measurement over 90 days. That noise is
// chosen so no single transit is visible and the folded signal is, which is
// the real situation for small planets.
//
// The search is box least squares (Kovács, Zucker & Mazeh 2002), the family
// of method transit pipelines use: for each trial period, fold the data,
// slide a box across the phase, and score how far the in-box mean sits below
// the rest in units of its own noise.

import { rng } from '../animation/ease';

export const TRUE_PERIOD = 9.7;
export const DEPTH = 84e-6;
export const DURATION = 3.9 / 24;
export const NOISE = 70e-6;
const T0 = 3.1;
const BASELINE = 90;
const CADENCE = 0.5 / 24;

export interface LightCurve {
  time: Float64Array;
  /** Relative brightness minus one, in ppm. */
  ppm: Float32Array;
}

export function simulate(seed = 3): LightCurve {
  const n = Math.round(BASELINE / CADENCE);
  const r = rng(seed);
  const time = new Float64Array(n);
  const ppm = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i * CADENCE;
    const phase = (((t - T0) % TRUE_PERIOD) + TRUE_PERIOD) % TRUE_PERIOD;
    const inTransit = phase < DURATION / 2 || phase > TRUE_PERIOD - DURATION / 2;
    time[i] = t;
    ppm[i] = (r.gauss() * NOISE - (inTransit ? DEPTH : 0)) * 1e6;
  }
  return { time, ppm };
}

export interface BoxFit {
  period: number;
  /** Phase of the box's center, 0..1. */
  phase: number;
  depthPpm: number;
  /** Signal to noise of the dip. */
  snr: number;
  durationDays: number;
}

const BINS = 240;
const WIDTHS_H = [2, 3, 4, 5, 6];

export function boxSearch(lc: LightCurve, period: number): BoxFit {
  const sum = new Float64Array(BINS);
  const cnt = new Float64Array(BINS);
  let mean = 0;
  for (let i = 0; i < lc.ppm.length; i++) mean += lc.ppm[i];
  mean /= lc.ppm.length;
  let varSum = 0;
  for (let i = 0; i < lc.ppm.length; i++) {
    const ph = (lc.time[i] / period) % 1;
    const b = Math.min(BINS - 1, Math.floor(ph * BINS));
    const d = lc.ppm[i] - mean;
    sum[b] += d;
    cnt[b] += 1;
    varSum += d * d;
  }
  const sigma = Math.sqrt(varSum / lc.ppm.length);
  let best: BoxFit = { period, phase: 0, depthPpm: 0, snr: 0, durationDays: 0 };
  for (const hours of WIDTHS_H) {
    const w = Math.max(1, Math.round((hours / 24 / period) * BINS));
    let s = 0, c = 0;
    for (let k = 0; k < w; k++) {
      s += sum[k];
      c += cnt[k];
    }
    for (let j = 0; j < BINS; j++) {
      if (c > 0) {
        const depth = -s / c;
        const snr = (depth * Math.sqrt(c)) / sigma;
        if (snr > best.snr) best = { period, phase: ((j + w / 2) / BINS) % 1, depthPpm: depth, snr, durationDays: (w / BINS) * period };
      }
      s += sum[(j + w) % BINS] - sum[j];
      c += cnt[(j + w) % BINS] - cnt[j];
    }
  }
  return best;
}

export const P_MIN = 1;
export const P_MAX = 20;

/** Scores across a log-spaced grid of trial periods. Fine enough that no phase drifts by a transit's width. */
export function periodogram(lc: LightCurve, steps = 3000) {
  const periods = new Float64Array(steps);
  const snr = new Float32Array(steps);
  let best: BoxFit = boxSearch(lc, P_MIN);
  for (let i = 0; i < steps; i++) {
    const p = P_MIN * Math.pow(P_MAX / P_MIN, i / (steps - 1));
    const fit = boxSearch(lc, p);
    periods[i] = p;
    snr[i] = fit.snr;
    if (fit.snr > best.snr) best = fit;
  }
  return { periods, snr, best };
}

/** The measurements folded at a period and centered on a phase, binned for a readable line. */
export function fold(lc: LightCurve, period: number, center: number, binHours = 0.5, spanHours = 24) {
  const half = spanHours / 2 / 24;
  const nb = Math.round(spanHours / binHours);
  const sum = new Float64Array(nb), cnt = new Float64Array(nb);
  const x: number[] = [], y: number[] = [];
  for (let i = 0; i < lc.ppm.length; i++) {
    let d = ((lc.time[i] / period - center) % 1 + 1.5) % 1 - 0.5;
    d *= period;
    if (Math.abs(d) > half) continue;
    x.push(d * 24);
    y.push(lc.ppm[i]);
    const b = Math.min(nb - 1, Math.floor(((d + half) / (2 * half)) * nb));
    sum[b] += lc.ppm[i];
    cnt[b] += 1;
  }
  const bins = Array.from({ length: nb }, (_, b) => ({ hours: -spanHours / 2 + (b + 0.5) * binHours, ppm: cnt[b] ? sum[b] / cnt[b] : 0 }));
  return { x, y, bins };
}
