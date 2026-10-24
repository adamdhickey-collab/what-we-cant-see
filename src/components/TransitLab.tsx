// Chapter 4's instrument. Ninety days of a real star's brightness from
// NASA's Kepler, a fold at a trial period, and the search across every period. In Guided mode the
// narration drives the period, so scrubbing the timeline scrubs the search;
// in Explore mode the slider and the Search button are the viewer's.

import { scaleLinear, scaleLog } from 'd3-scale';
import { useEffect, useRef, useState } from 'react';
import { director, useDirector } from '../animation/director';
import { easeInOutCubic, range } from '../animation/ease';
import { beatStart, CH, STARTS } from '../content/chapters';
import { boxSearch, fold, loadLightCurve, periodogram, P_MAX, P_MIN, STAR, type LightCurve } from '../data/transit';

const CHAPTER = CH.faint;
const LOOK = beatStart('faint', 'look');
const NOBODY = beatStart('faint', 'nobody');
const SWEEP_START = beatStart('faint', 'sweep');
const LOCK = beatStart('faint', 'lock');
const SWEEP_END = LOCK - 1.5;

type Search = { lc: LightCurve; pg: ReturnType<typeof periodogram> };
let cache: Promise<Search> | null = null;
/** The data is 54 KB and the search about a tenth of a second, so both happen before anyone needs them. */
export function warmTransit() {
  cache ??= loadLightCurve(import.meta.env.BASE_URL).then((lc) => ({ lc, pg: periodogram(lc) }));
  return cache;
}

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const toSlider = (p: number) => Math.round((Math.log(p / P_MIN) / Math.log(P_MAX / P_MIN)) * 1000);
const fromSlider = (v: number) => P_MIN * Math.pow(P_MAX / P_MIN, v / 1000);

export function TransitLab() {
  const [data, setData] = useState<Search | null>(null);
  useEffect(() => {
    warmTransit().then(setData, () => setData(null));
  }, []);
  if (!data) {
    return (
      <section className="lab" aria-label="A star’s brightness">
        <p className="lab-summary">Loading 90 days of Kepler measurements…</p>
      </section>
    );
  }
  return <LabView {...data} />;
}

function LabView({ lc, pg }: Search) {
  const local = useDirector((s) => s.t - STARTS[CHAPTER]);
  const reduced = useDirector((s) => s.reduced);
  const manual = useDirector((s) => s.foldPeriod);
  // While the narration asks you to look, a scan line runs along the measurements, finding nothing.
  const scan = local >= LOOK && local < NOBODY ? (local - LOOK) / (NOBODY - LOOK) : null;
  const [searched, setSearched] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const glide = useRef(0);

  // The period on show, and how much of the search is revealed.
  let period: number | null;
  let revealed: number;
  if (manual !== null) {
    period = manual;
    revealed = searched ? 1 : 0;
  } else if (local < SWEEP_START) {
    period = null;
    revealed = 0;
  } else if (reduced || local >= LOCK) {
    period = pg.best.period;
    revealed = 1;
  } else {
    const u = range(local, SWEEP_START, SWEEP_END);
    const sweep = P_MIN * Math.pow(P_MAX / P_MIN, u);
    period = local < SWEEP_END ? sweep : Math.exp(Math.log(P_MAX) + (Math.log(pg.best.period) - Math.log(P_MAX)) * easeInOutCubic(range(local, SWEEP_END, LOCK)));
    revealed = u;
  }
  const fit = period ? boxSearch(lc, period) : null;
  const locked = fit !== null && Math.abs(fit.period - pg.best.period) < 0.02;

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const W = c.clientWidth, H = c.clientHeight;
    if (c.width !== Math.round(W * dpr)) c.width = Math.round(W * dpr);
    if (c.height !== Math.round(H * dpr)) c.height = Math.round(H * dpr);
    const g = c.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const copper = css('--copper'), teal = css('--teal'), ivory = css('--ivory'), faint = css('--text-faint'), hair = css('--hairline');
    // Chart text grows with the page's root size, so it reads on a TV as on a laptop.
    const k = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
    g.font = `${Math.round(11 * k)}px ${css('--font-data')}`;
    g.textBaseline = 'top';

    const narrow = W < 480;
    const gap = Math.round((narrow ? 16 : 22) * k);
    // The height of one row of chart text.
    const T = Math.round(14 * k);
    const rawH = Math.round(H * 0.3), foldH = Math.round(H * 0.38), pgH = H - rawH - foldH - gap * 3;
    const label = (text: string, x: number, yy: number, color = faint, align: CanvasTextAlign = 'left') => {
      g.fillStyle = color;
      g.textAlign = align;
      g.fillText(text, x, yy);
    };
    const yppm = (top: number, h: number) => scaleLinear().domain([260, -320]).range([top, top + h]).clamp(true);

    // 1. Ninety days of measurements.
    let top = T;
    const xd = scaleLinear().domain([0, lc.span]).range([0, W]);
    const yr = yppm(top, rawH);
    label(narrow ? 'Each dot: one brightness measurement' : 'Each dot: one measurement of the star’s brightness, over 90 days', 0, 0, scan !== null ? ivory : faint);
    g.fillStyle = copper;
    g.globalAlpha = 0.55;
    for (let i = 0; i < lc.ppm.length; i++) g.fillRect(xd(lc.time[i]), yr(lc.ppm[i]), 1.4, 1.4);
    g.globalAlpha = 1;
    if (locked && fit) {
      g.fillStyle = teal;
      for (let t = fit.phase * fit.period; t < lc.span; t += fit.period) g.fillRect(xd(t) - 0.5, top + rawH + 3, 1, 6);
      if (W > 700) label('ticks: every time the planet passes', W, 0, teal, 'right');
    }
    if (scan !== null && !reduced) {
      const sx = easeInOutCubic(Math.min(1, scan * 1.15)) * W;
      const grad = g.createLinearGradient(sx - 60, 0, sx, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, ivory);
      g.globalAlpha = 0.18;
      g.fillStyle = grad;
      g.fillRect(sx - 60, T, 60, rawH);
      g.globalAlpha = 0.8;
      g.fillStyle = ivory;
      g.fillRect(sx - 0.5, T, 1, rawH);
      g.globalAlpha = 1;
    }

    // 2. The fold.
    top += rawH + gap;
    const xh = scaleLinear().domain([-12, 12]).range([0, W]);
    const yf = yppm(top + T, foldH - T);
    if (period && fit) {
      label(narrow ? `Stacked every ${period.toFixed(2)} days` : `Stacked as if the planet circled every ${period.toFixed(2)} days · hours from the middle of a pass`, 0, top);
      const f = fold(lc, period, fit.phase);
      g.fillStyle = copper;
      g.globalAlpha = 0.28;
      for (let i = 0; i < f.x.length; i++) g.fillRect(xh(f.x[i]), yf(f.y[i]), 1.4, 1.4);
      g.globalAlpha = 1;
      g.strokeStyle = teal;
      g.lineWidth = 1.6;
      g.beginPath();
      f.bins.forEach((b, i) => (i ? g.lineTo(xh(b.hours), yf(b.ppm)) : g.moveTo(xh(b.hours), yf(b.ppm))));
      g.stroke();
      if (locked) {
        const half = (fit.durationDays * 24) / 2;
        g.setLineDash([3, 4]);
        g.strokeStyle = ivory;
        g.globalAlpha = 0.7;
        g.beginPath();
        g.moveTo(0, yf(0));
        g.lineTo(xh(-half), yf(0));
        g.lineTo(xh(-half), yf(-fit.depthPpm));
        g.lineTo(xh(half), yf(-fit.depthPpm));
        g.lineTo(xh(half), yf(0));
        g.lineTo(W, yf(0));
        g.stroke();
        g.setLineDash([]);
        g.globalAlpha = 1;
        label(`−${Math.round(fit.depthPpm)} ppm`, xh(half) + 8, yf(-fit.depthPpm) - 6, ivory);
      }
    } else {
      label('Stacked · waiting for an orbit to try', 0, top);
      g.strokeStyle = hair;
      g.beginPath();
      g.moveTo(0, yf(0));
      g.lineTo(W, yf(0));
      g.stroke();
    }

    // 3. The search.
    top += foldH + gap;
    const xp = scaleLog().domain([P_MIN, P_MAX]).range([0, W]);
    const ys = scaleLinear().domain([0, pg.best.snr * 1.1]).range([top + pgH, top + T]);
    label(narrow ? 'How well each orbit lines up' : 'How well each guess lines up · orbits from 1 to 20 days', 0, top);
    const n = Math.floor(revealed * (pg.periods.length - 1));
    g.strokeStyle = teal;
    g.lineWidth = 1;
    g.beginPath();
    for (let i = 0; i <= n; i++) (i ? g.lineTo(xp(pg.periods[i]), ys(pg.snr[i])) : g.moveTo(xp(pg.periods[i]), ys(pg.snr[i])));
    g.stroke();
    g.strokeStyle = hair;
    g.beginPath();
    g.moveTo(0, top + pgH + 0.5);
    g.lineTo(W, top + pgH + 0.5);
    g.stroke();
    (W < 420 ? [1, 10, 20] : [1, 2, 5, 10, 20]).forEach((p) => label(`${p} d`, xp(p), top + pgH + 4, faint, p === 1 ? 'left' : p === 20 ? 'right' : 'center'));
    if (period) {
      g.fillStyle = ivory;
      g.fillRect(xp(period) - 0.5, top + T, 1, pgH - T);
    }
    if (revealed >= 1) label(`${pg.best.period.toFixed(2)} days`, xp(pg.best.period) + 6, top + T + 2, ivory);
  });

  const take = () => director.explore();
  const search = () => {
    take();
    setSearched(true);
    const from = manual ?? period ?? 3;
    const to = pg.best.period;
    if (reduced) return director.set({ foldPeriod: to });
    const t0 = performance.now();
    cancelAnimationFrame(glide.current);
    const step = (now: number) => {
      const u = easeInOutCubic(Math.min(1, (now - t0) / 1400));
      director.set({ foldPeriod: Math.exp(Math.log(from) + (Math.log(to) - Math.log(from)) * u) });
      if (u < 1) glide.current = requestAnimationFrame(step);
    };
    glide.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelAnimationFrame(glide.current), []);

  const summary = !fit
    ? `90 days of Kepler measurements of ${STAR}, ${lc.ppm.length.toLocaleString('en-US')} in all. No period has been tried yet.`
    : fit.snr >= 8
      ? `Folded at ${fit.period.toFixed(2)} days, the brightness drops by about ${Math.round(fit.depthPpm)} parts per million for ${(fit.durationDays * 24).toFixed(1)} hours: ${fit.snr.toFixed(1)} times the noise. A planet-like signal.`
      : `Folded at ${fit.period.toFixed(2)} days, nothing stands out: the strongest dip is ${fit.snr.toFixed(1)} times the noise, which chance alone produces.`;

  return (
    <section className="lab" aria-labelledby="lab-title">
      <header className="lab-head">
        <h2 id="lab-title" className="lab-title">A star’s brightness</h2>
        <span className="kind kind-measured">Kepler data · 2009–10</span>
      </header>
      <canvas ref={canvas} className="lab-canvas" role="img" aria-label={summary} />
      <p className="lab-summary" aria-live={manual !== null ? 'polite' : 'off'}>
        {summary}
      </p>
      <div className="lab-controls">
        <label className="lab-slider">
          <span className="hide-narrow">Fold period</span>
          <input
            type="range"
            min={0}
            max={1000}
            value={toSlider(manual ?? period ?? 3)}
            aria-valuetext={`${(manual ?? period ?? 3).toFixed(2)} days`}
            onChange={(e) => {
              take();
              director.set({ foldPeriod: fromSlider(+e.target.value) });
            }}
          />
          <output>{(manual ?? period ?? 3).toFixed(2)} d</output>
        </label>
        <button type="button" className="btn" onClick={search}>
          Search<span className="hide-narrow"> every period</span>
        </button>
      </div>
    </section>
  );
}
