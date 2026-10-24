// Small diagrams drawn in the page over the stage while a line is up: how
// narrow visible light is, and how little of the universe is the stuff we
// have ever seen. Ivory is the human view; violet is what is unresolved.

import { useDirector } from '../animation/director';
import { beatIndexAt, chapterIndexAt, CHAPTERS, STARTS, type AsideId } from '../content/chapters';

// The spectrum on a logarithmic axis of wavelength, from 1 picometer to 1 kilometer.
const MIN = -12, MAX = 3;
const at = (log: number) => `${((log - MIN) / (MAX - MIN)) * 100}%`;
const BANDS = [
  { name: 'Gamma', from: -12, to: -11 },
  { name: 'X-ray', from: -11, to: -8 },
  { name: 'UV', from: -8, to: -6.42 },
  { name: 'Infrared', from: -6.12, to: -3 },
  { name: 'Microwave', from: -3, to: -1 },
  { name: 'Radio', from: -1, to: 3 },
];

function Spectrum() {
  return (
    <figure className="aside aside-spectrum">
      <div className="spectrum-bar">
        {BANDS.map((b, i) => (
          <span key={b.name} className={`spectrum-band${i % 2 ? ' is-high' : ''}`} style={{ left: at(b.from), width: `calc(${at(b.to)} - ${at(b.from)})` }}>
            <span className="spectrum-name">{b.name}</span>
          </span>
        ))}
        <span className="spectrum-visible" style={{ left: at(-6.42), width: `calc(${at(-6.12)} - ${at(-6.42)})` }} />
        <span className="spectrum-callout" style={{ left: at(-6.27) }}>
          What your eyes catch
        </span>
      </div>
      <figcaption className="aside-caption">
        <span>Smaller than an atom</span>
        <span>Wavelength</span>
        <span>A kilometer</span>
      </figcaption>
    </figure>
  );
}

const PARTS = [
  { name: 'Everything ever seen', share: 5, cls: 'is-seen' },
  { name: 'Dark matter', share: 27, cls: 'is-dark' },
  { name: 'Dark energy', share: 68, cls: 'is-energy' },
];

function Composition() {
  return (
    <figure className="aside aside-composition">
      <div className="composition-bar">
        {PARTS.map((p) => (
          <span key={p.name} className={`composition-part ${p.cls}`} style={{ flexGrow: p.share }} />
        ))}
      </div>
      <figcaption className="composition-key">
        {PARTS.map((p) => (
          <span key={p.name} className={`composition-label ${p.cls}`}>
            <strong>{p.share}%</strong> {p.name}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export function Aside() {
  const aside = useDirector((s): AsideId | undefined => {
    const ci = chapterIndexAt(s.t);
    return CHAPTERS[ci].beats[beatIndexAt(CHAPTERS[ci], s.t - STARTS[ci])].aside;
  });
  if (aside === 'spectrum') return <Spectrum />;
  if (aside === 'composition') return <Composition />;
  return null;
}
