// The scale navigator: a true logarithmic axis from an atom to the
// observable universe. Each landmark sits at its real width and the marker at
// the width in view right now. On the ride it speaks plainly (about the width
// of the Sun) and shows the main stops; in Wander it is the full ruler, with
// powers of ten.

import { scaleLog } from 'd3-scale';
import { director, useDirector } from '../animation/director';
import { heldTime, scaleAt, timeForScale } from '../content/chapters';
import { formatLength, power } from './format';

const LANDMARKS: { name: string; log: number; main?: boolean }[] = [
  { name: 'Proton', log: -14.77 },
  { name: 'Atom', log: -9.98, main: true },
  { name: 'Protein', log: -8, main: true },
  { name: 'Bacterium', log: -5.7 },
  { name: 'Cell', log: -4.7, main: true },
  { name: 'Fingertip', log: -1.7 },
  { name: 'You', log: 0.23, main: true },
  { name: 'Horizon', log: 3.67 },
  { name: 'Earth', log: 7.11, main: true },
  { name: 'Sun', log: 9.14, main: true },
  { name: 'Solar system', log: 12.95 },
  { name: 'Nearest star', log: 16.6, main: true },
  { name: 'Milky Way', log: 20.98, main: true },
  { name: 'Andromeda', log: 22.37 },
  { name: 'Survey slice', log: 25.7 },
  { name: 'Observable universe', log: 26.94, main: true },
];

/** Something a person knows, about as wide as the view. */
const LIKE: [number, string][] = [
  [-9.98, 'an atom'],
  [-8, 'a protein'],
  [-5.7, 'a bacterium'],
  [-4.7, 'one of your cells'],
  [-3.3, 'a grain of salt'],
  [-1.7, 'a fingertip'],
  [0.23, 'you'],
  [2, 'a city block'],
  [3.67, 'the sea out to the horizon'],
  [5, 'a big city'],
  [6.3, 'a country'],
  [7.11, 'the Earth'],
  [8.6, 'the Moon’s orbit'],
  [9.14, 'the Sun'],
  [11.48, 'Earth’s orbit'],
  [12.95, 'the solar system'],
  [14.5, 'the Sun’s farthest comets'],
  [16.6, 'the gap to the nearest star'],
  [19, 'our neighborhood of stars'],
  [20.98, 'the Milky Way'],
  [22.6, 'our group of galaxies'],
  [24.2, 'a cosmic void'],
  [25.7, 'the survey slice'],
  [26.94, 'the observable universe'],
];

const MIN = -15;
const MAX = 27;
// 0% at the top, the largest scale.
const y = scaleLog().domain([10 ** MAX, 10 ** MIN]).range([0, 100]);

export function ScaleNavigator() {
  const log = useDirector((s) => Math.round(scaleAt(heldTime(s.t, s.reduced)) * 50) / 50);
  const full = useDirector((s) => s.mode === 'explore');
  const at = y(10 ** log);
  const shown = LANDMARKS.filter((l) => full || l.main);
  const near = shown.reduce((a, b) => (Math.abs(b.log - log) < Math.abs(a.log - log) ? b : a));
  const like = LIKE.reduce((a, b) => (Math.abs(b[0] - log) < Math.abs(a[0] - log) ? b : a));

  return (
    <nav className={`scale${full ? ' is-full' : ''}`} aria-label="Scale navigator">
      <div className="scale-readout" aria-live="off">
        <span className="scale-label">Width in view</span>
        <span className="scale-words">{formatLength(10 ** log)}</span>
        <span className="scale-like">about {like[1]}</span>
        {full && <span className="scale-power">{power(log, 1)} m</span>}
      </div>
      <div className="scale-track">
        {full &&
          y
            .ticks()
            .filter((v) => Math.round(Math.log10(v)) % 3 === 0)
            .map((v) => (
              <span key={v} className="scale-tick" style={{ ['--pos' as string]: `${y(v)}%` }} aria-hidden="true">
                {power(Math.log10(v))}
              </span>
            ))}
        <ol className="scale-landmarks">
          {shown.map((l) => (
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
