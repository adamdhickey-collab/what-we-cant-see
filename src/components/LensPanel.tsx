// The last chapter's lenses: the same shore through other eyes. On a wall
// display the lenses cycle by themselves while the ride waits.

import { useEffect } from 'react';
import { director, useDirector } from '../animation/director';
import { beatStart, CH, STARTS } from '../content/chapters';
import { LENSES } from '../content/extras';

const OFFER = beatStart('return', 'lenses');

export function LensPanel({ onSource }: { onSource: (id: string) => void }) {
  const show = useDirector((s) => s.t - STARTS[CH.return] >= OFFER - 0.5);
  const lens = useDirector((s) => s.lens);
  const waiting = useDirector((s) => s.waiting === 'lenses');

  useEffect(() => {
    if (!(waiting && director.kiosk)) return;
    let i = 0;
    const id = setInterval(() => {
      if (i < LENSES.length) director.set({ lens: LENSES[i++].id });
      else {
        director.set({ lens: null });
        director.resolve();
      }
    }, 3000);
    return () => clearInterval(id);
  }, [waiting]);

  if (!show) return null;
  const active = LENSES.find((l) => l.id === lens);
  return (
    <section className="lenses" aria-labelledby="lenses-title">
      <h2 id="lenses-title" className="lab-title">Other eyes</h2>
      <div className="lens-row" role="radiogroup" aria-label="Lens">
        <button type="button" role="radio" aria-checked={lens === null} className={lens === null ? 'is-on' : undefined} onClick={() => director.set({ lens: null })}>
          Yours
        </button>
        {LENSES.map((l) => (
          <button key={l.id} type="button" role="radio" aria-checked={lens === l.id} className={lens === l.id ? 'is-on' : undefined} onClick={() => director.set({ lens: l.id })}>
            {l.name}
          </button>
        ))}
      </div>
      <p className="lens-text" aria-live="polite">
        {active ? (
          <>
            <span className="lens-who">{active.who}</span> {active.text}{' '}
            <button type="button" className="transcript-ref" onClick={() => onSource(active.sources[0])}>
              source
            </button>
          </>
        ) : (
          'What your own eyes see. Pick a lens.'
        )}
      </p>
      {waiting && (
        <button type="button" className="btn btn-primary" onClick={() => director.resolve()}>
          Continue the ride
        </button>
      )}
    </section>
  );
}
