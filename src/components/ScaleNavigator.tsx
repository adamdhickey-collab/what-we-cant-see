// The scale navigator: a true logarithmic axis from a proton to the
// observable universe. Each landmark sits at its real width, the marker at
// the width in view right now, and the middle of the axis is marked where it
// really is: about a million meters, the size of a country, not a person.

import { scaleLog } from 'd3-scale';
import { director, useDirector } from '../animation/director';
import { heldTime, scaleAt, timeForScale } from '../content/chapters';
import { formatLength, power } from './format';

const LANDMARKS: { name: string; log: number }[] = [
  { name: 'Proton', log: -14.77 },
  { name: 'Hydrogen atom', log: -9.98 },
  { name: 'Protein', log: -8 },
  { name: 'Cell', log: -4.7 },
  { name: 'You', log: 0.23 },
  { name: 'Horizon', log: 3.67 },
  { name: 'Earth', log: 7.11 },
  { name: 'Earth’s orbit', log: 11.48 },
  { name: 'Neptune’s orbit', log: 12.95 },
  { name: 'Nearest star', log: 16.6 },
  { name: 'Milky Way', log: 20.98 },
  { name: 'Andromeda', log: 22.37 },
  { name: 'Cosmic web', log: 24.7 },
  { name: 'Observable universe', log: 26.94 },
];

const MIN = -15;
const MAX = 27;
// 0% at the top, the largest scale.
const y = scaleLog().domain([10 ** MAX, 10 ** MIN]).range([0, 100]);

export function ScaleNavigator() {
  const log = useDirector((s) => Math.round(scaleAt(heldTime(s.t, s.reduced)) * 50) / 50);
  const at = y(10 ** log);
  const near = LANDMARKS.reduce((a, b) => (Math.abs(b.log - log) < Math.abs(a.log - log) ? b : a));

  return (
    <nav className="scale" aria-label="Scale navigator">
      <div className="scale-readout" aria-live="off">
        <span className="scale-power">{power(log, 1)} m</span>
        <span className="scale-words">{formatLength(10 ** log)}</span>
      </div>
      <div className="scale-track">
        {y.ticks().filter((v) => Math.round(Math.log10(v)) % 3 === 0).map((v) => (
          <span key={v} className="scale-tick" style={{ ['--pos' as string]: `${y(v)}%` }} aria-hidden="true">
            {power(Math.log10(v))}
          </span>
        ))}
        <span className="scale-mid" style={{ ['--pos' as string]: `${y(1e6)}%` }} aria-hidden="true" title="The middle of the scale, in logarithm: about a million meters">
          middle
        </span>
        <ol className="scale-landmarks">
          {LANDMARKS.map((l) => (
            <li key={l.name} style={{ ['--pos' as string]: `${y(10 ** l.log)}%` }}>
              <button
                type="button"
                className={l === near ? 'is-near' : undefined}
                onClick={() => {
                  director.explore();
                  director.seek(timeForScale(l.log));
                }}
                aria-label={`Go to ${l.name}, ${formatLength(10 ** l.log)}`}
              >
                <span className="scale-landmark-name">{l.name}</span>
              </button>
            </li>
          ))}
        </ol>
        <span className="scale-marker" style={{ ['--pos' as string]: `${at}%` }} aria-hidden="true" />
      </div>
    </nav>
  );
}
