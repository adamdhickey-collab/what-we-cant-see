// The protein chapter's instrument: three ways to look at one prediction.
// What the model says, how sure it is, and what an experiment still has to
// settle. Before the confidence is shown, the viewer guesses where it is low.

import { useEffect, useState } from 'react';
import { director, useDirector, type ProteinView } from '../animation/director';
import { beatIdAt, CH, CHAPTERS, STARTS } from '../content/chapters';
import { autoView } from '../scenes/views';

const VIEWS: { id: Exclude<ProteinView, 'auto'>; name: string; says: string }[] = [
  { id: 'prediction', name: 'Prediction', says: 'Where AlphaFold places each of p53’s 393 building blocks.' },
  { id: 'confidence', name: 'Confidence', says: 'Its own score for each one, from 0 to 100. Teal is sure; violet is a guess.' },
  { id: 'verify', name: 'Needs checking', says: 'The parts scoring below about 70: an experiment has to say what they really do.' },
];

const BANDS = [
  { name: 'Very sure', range: 'above 90', min: 90, max: 101, swatch: 'var(--teal)' },
  { name: 'Sure', range: '70 to 90', min: 70, max: 90, swatch: 'color-mix(in srgb, var(--teal) 80%, var(--ink))' },
  { name: 'Unsure', range: '50 to 70', min: 50, max: 70, swatch: 'color-mix(in srgb, var(--teal) 35%, var(--violet))' },
  { name: 'Guessing', range: 'below 50', min: 0, max: 50, swatch: 'var(--violet)' },
];

const GUESSES = [
  { id: 'middle', name: 'The folded middle' },
  { id: 'ends', name: 'The loose ends' },
];

export function ProteinPanel() {
  const chosen = useDirector((s) => s.proteinView);
  const local = useDirector((s) => s.t - STARTS[CH.unsure]);
  const waiting = useDirector((s) => s.waiting === 'confidence');
  const guess = useDirector((s) => s.answers.confidence);
  const [counts, setCounts] = useState<number[] | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/protein-P04637.json`)
      .then((r) => r.json())
      .then((d: { residues: number[][] }) => setCounts(BANDS.map((b) => d.residues.filter((x) => x[3] >= b.min && x[3] < b.max).length)))
      .catch(() => setCounts(null));
  }, []);

  const auto = autoView(local);
  const current = chosen === 'auto' ? (auto === 'shape' ? null : auto) : chosen;
  // The guess is offered on its line, and the ride waits for it at the line's end.
  const asking = !guess && (waiting || beatIdAt(CHAPTERS[CH.unsure], local) === 'guess');
  const revealed = current === 'confidence' || current === 'verify';

  return (
    <section className="protein" aria-labelledby="protein-title">
      <header className="lab-head">
        <h2 id="protein-title" className="lab-title">Human p53, as predicted</h2>
        <span className="kind kind-inferred">AlphaFold · model</span>
      </header>
      {asking ? (
        <div className="guess" role="group" aria-label="Your guess">
          <p className="protein-says">Where do you think the model is least sure?</p>
          <div className="guess-options">
            {GUESSES.map((g) => (
              <button
                key={g.id}
                type="button"
                className="btn"
                onClick={() => {
                  director.answer('confidence', g.id);
                  director.resolve();
                }}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="segmented" role="radiogroup" aria-label="How to look at the prediction">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={current === v.id}
                className={current === v.id ? 'is-on' : undefined}
                onClick={() => {
                  director.explore();
                  director.set({ proteinView: v.id });
                }}
              >
                {v.name}
              </button>
            ))}
          </div>
          <p className="protein-says">
            {guess && revealed ? (guess === 'ends' ? 'You guessed the loose ends. Right: ' : 'You guessed the middle. It’s the other way round: ') : ''}
            {VIEWS.find((v) => v.id === current)?.says ?? 'The shape, before asking how far to trust it.'}
          </p>
        </>
      )}
      <ul className={`bands${revealed ? '' : ' is-hidden'}`} aria-label="Confidence bands, building blocks in each">
        {BANDS.map((b, i) => (
          <li key={b.name}>
            <span className="band-swatch" style={{ background: b.swatch }} aria-hidden="true" />
            <span className="band-name">{b.name}</span>
            <span className="band-range">{b.range}</span>
            <span className="band-count">{counts ? counts[i] : '–'}</span>
          </li>
        ))}
      </ul>
      <p className="protein-foot">
        Model AF-P04637-F1 v6, AlphaFold DB (EMBL-EBI and Google DeepMind), CC BY 4.0. Drag to turn it.
      </p>
    </section>
  );
}
