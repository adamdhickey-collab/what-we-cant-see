// Chapter 6's instrument: three ways to look at one prediction. What the
// model says, how sure it is, and what an experiment still has to settle.

import { useEffect, useState } from 'react';
import { director, useDirector, type ProteinView } from '../animation/director';
import { beatIndexAt, CHAPTERS, STARTS } from '../content/chapters';

const VIEWS: { id: Exclude<ProteinView, 'auto'>; name: string; says: string }[] = [
  { id: 'prediction', name: 'Prediction', says: 'Where AlphaFold places each of p53’s 393 amino acids.' },
  { id: 'confidence', name: 'Confidence', says: 'Its own score for each one, from 0 to 100 (pLDDT).' },
  { id: 'verify', name: 'Needs checking', says: 'The amino acids scoring below about 70: an experiment has to say what they really do.' },
];

const BANDS = [
  { name: 'Very high', range: 'above 90', min: 90, max: 101, swatch: 'var(--teal)' },
  { name: 'Confident', range: '70 to 90', min: 70, max: 90, swatch: 'color-mix(in srgb, var(--teal) 80%, var(--ink))' },
  { name: 'Low', range: '50 to 70', min: 50, max: 70, swatch: 'color-mix(in srgb, var(--teal) 35%, var(--violet))' },
  { name: 'Very low', range: 'below 50', min: 0, max: 50, swatch: 'var(--violet)' },
];

export function ProteinPanel() {
  const chosen = useDirector((s) => s.proteinView);
  const beat = useDirector((s) => beatIndexAt(CHAPTERS[5], s.t - STARTS[5]));
  const [counts, setCounts] = useState<number[] | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/protein-P04637.json`)
      .then((r) => r.json())
      .then((d: { residues: number[][] }) => setCounts(BANDS.map((b) => d.residues.filter((x) => x[3] >= b.min && x[3] < b.max).length)))
      .catch(() => setCounts(null));
  }, []);

  const auto = beat < 2 ? null : beat === 2 ? 'prediction' : beat === 3 || beat === 5 ? 'confidence' : 'verify';
  const current = chosen === 'auto' ? auto : chosen;

  return (
    <section className="protein" aria-labelledby="protein-title">
      <header className="lab-head">
        <h2 id="protein-title" className="lab-title">Human p53, as predicted</h2>
        <span className="kind kind-inferred">AlphaFold DB · model</span>
      </header>
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
      <p className="protein-says">{VIEWS.find((v) => v.id === current)?.says ?? 'The shape, before asking how far to trust it.'}</p>
      <ul className="bands" aria-label="Confidence bands, amino acids in each">
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
