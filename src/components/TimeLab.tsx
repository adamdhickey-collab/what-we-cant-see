// The time chapter's instrument. Above, two things you can't see change: a
// wing beating 50 times a second, drawn the way you see it (a blur), and a
// clock at the real time, whose hour hand you never see move, until partway
// through its line time speeds up 3,600 times by itself. Below, a ruler of durations from a millisecond to billions
// of years, with the narrow band a person can watch happen.

import { useEffect, useRef } from 'react';
import { useDirector } from '../animation/director';
import { beatIdAt, beatStart, CH, CHAPTERS, STARTS } from '../content/chapters';

const YEAR = 3.156e7;
const MIN = -3, MAX = 17;
const at = (seconds: number) => `${((Math.log10(seconds) - MIN) / (MAX - MIN)) * 100}%`;
const MARKS: { s: number; name: string; beat?: string }[] = [
  { s: 0.001, name: 'A nerve cell fires' },
  { s: 0.02, name: 'One wingbeat', beat: 'wing' },
  { s: 0.1, name: 'Your “now”', beat: 'now' },
  { s: 120, name: 'Hour hand moves one degree', beat: 'clock' },
  { s: 86_400, name: 'A day' },
  { s: YEAR, name: 'In a year, nails grow 4 cm and the ground drifts a few', beat: 'drift' },
  { s: 80 * YEAR, name: 'A human life' },
  { s: 2.5e6 * YEAR, name: 'Andromeda’s light reaches you' },
];
const TICKS: [number, string][] = [
  [0.001, '1 ms'],
  [1, '1 s'],
  [3600, '1 hour'],
  [YEAR, '1 year'],
  [1000 * YEAR, '1,000 years'],
  [1e9 * YEAR, '1 billion years'],
];
const SPEED = 3600;
// The clock runs at real time for the first part of its line, then fast until the next.
const FAST_FROM = beatStart('time', 'clock') + 3.5;
const FAST_TO = beatStart('time', 'drift');

function Demos({ reduced, fast }: { reduced: boolean; fast: boolean }) {
  const wing = useRef<SVGGElement>(null);
  const hour = useRef<SVGLineElement>(null);
  const minute = useRef<SVGLineElement>(null);
  const clock = useRef({ base: Date.now(), at: performance.now() });

  useEffect(() => {
    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const c = clock.current;
      const ms = c.base + (performance.now() - c.at) * (fast ? SPEED : 1);
      const d = new Date(ms);
      const m = d.getMinutes() + d.getSeconds() / 60 + d.getMilliseconds() / 60000;
      const h = (d.getHours() % 12) + m / 60;
      hour.current?.setAttribute('transform', `rotate(${h * 30} 60 60)`);
      minute.current?.setAttribute('transform', `rotate(${m * 6} 60 60)`);
      // The wing is drawn as you see it: every position at once, faintly.
      if (wing.current && !reduced) wing.current.style.opacity = String(0.85 + 0.15 * Math.sin(performance.now() / 40));
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [fast, reduced]);

  // Re-base the clock at each change of speed, so the hands never jump.
  const was = useRef(fast);
  if (was.current !== fast) {
    const c = clock.current;
    c.base = c.base + (performance.now() - c.at) * (was.current ? SPEED : 1);
    c.at = performance.now();
    was.current = fast;
  }

  return (
    <div className="time-demos">
      <figure className="time-demo">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <g ref={wing}>
            {Array.from({ length: 13 }, (_, i) => (
              <line key={i} x1="34" y1="70" x2={34 + 70 * Math.cos(((-60 + i * 10) * Math.PI) / 180)} y2={70 + 70 * Math.sin(((-60 + i * 10) * Math.PI) / 180)} className="wing-blur" />
            ))}
          </g>
          <circle cx="34" cy="70" r="5" className="wing-body" />
        </svg>
        <figcaption>
          <strong>Too fast.</strong> About 50 beats a second: you see a blur.
        </figcaption>
      </figure>
      <figure className="time-demo">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="50" className="clock-face" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="60" y1="14" x2="60" y2="20" transform={`rotate(${i * 30} 60 60)`} className="clock-tick" />
          ))}
          <line ref={minute} x1="60" y1="60" x2="60" y2="18" className="clock-minute" />
          <line ref={hour} x1="60" y1="60" x2="60" y2="32" className="clock-hour" />
        </svg>
        <figcaption>
          {fast ? (
            <>
              <strong>Sped up {SPEED.toLocaleString('en-US')}×.</strong> An hour passes every second, and now you see it move.
            </>
          ) : (
            <>
              <strong>Too slow.</strong> The real time: the hour hand never seems to move.
            </>
          )}
        </figcaption>
      </figure>
    </div>
  );
}

export function TimeLab() {
  const id = useDirector((s) => beatIdAt(CHAPTERS[CH.time], s.t - STARTS[CH.time]));
  const reduced = useDirector((s) => s.reduced);
  const fast = useDirector((s) => {
    const local = s.t - STARTS[CH.time];
    return local >= FAST_FROM && local < FAST_TO;
  });
  return (
    <section className="lab time-lab" aria-labelledby="time-title">
      <header className="lab-head">
        <h2 id="time-title" className="lab-title">How long things take</h2>
      </header>
      <Demos reduced={reduced} fast={fast} />
      <div className="time-ruler" role="img" aria-label="A logarithmic ruler of durations from a thousandth of a second to billions of years. What a person can watch happen spans roughly a tenth of a second to an hour.">
        <span className={`time-window${id === 'window' ? ' is-on' : ''}`} style={{ left: at(0.1), width: `calc(${at(3600)} - ${at(0.1)})` }}>
          <span className="time-window-name">What you can watch happen</span>
        </span>
        <span className="time-axis" />
        {TICKS.map(([v, name]) => (
          <span key={name} className="time-tick" style={{ left: at(v) }}>
            {name}
          </span>
        ))}
        {/* Every mark is drawn; only the ones the narration is on are named, so the names never crowd. */}
        {MARKS.map((m) => (
          <span key={m.name} className={`time-mark${m.beat && m.beat === id ? ' is-on' : ''}`} style={{ left: at(m.s) }} title={m.name}>
            <span className="time-mark-name">{m.name}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
