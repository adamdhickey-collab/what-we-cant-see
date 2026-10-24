// The two reading surfaces: the Sources drawer, for the basis of any claim,
// and the text version, which is the whole piece without a canvas.

import { useEffect, useRef } from 'react';
import { CHAPTERS } from '../content/chapters';
import { METERS } from '../content/extras';
import { KIND_LABEL, RETRIEVED, SOURCES, sourceById, type Source } from '../content/sources';

function Dialog({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="panel" aria-label={label} onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      <div className="panel-inner">
        <button type="button" className="panel-close" onClick={onClose}>
          Close
        </button>
        {children}
      </div>
    </dialog>
  );
}

function SourceEntry({ s, focus }: { s: Source; focus: boolean }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (focus) ref.current?.scrollIntoView({ block: 'center' });
  }, [focus]);
  return (
    <article ref={ref} className={`source${focus ? ' is-focus' : ''}`} id={`source-${s.id}`}>
      <p className={`kind kind-${s.kind}`}>{KIND_LABEL[s.kind]}</p>
      <h3 className="source-claim">{s.claim}</h3>
      <p className="source-value">{s.value}</p>
      <p className="source-ref">
        {s.url ? (
          <a href={s.url} target="_blank" rel="noreferrer">
            {s.source}
          </a>
        ) : (
          s.source
        )}
        {s.published && <span className="source-date"> · published {s.published}</span>}
      </p>
      {s.note && <p className="source-note">{s.note}</p>}
    </article>
  );
}

export function SourcesPanel({ open, focus, onClose }: { open: boolean; focus: string | null; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} label="Sources">
      <h2 className="panel-title">Sources</h2>
      <p className="panel-lede">
        Every figure in the ride, what kind of claim it is, and where it comes from. Retrieved {RETRIEVED}. Copper marks what was measured; teal, what a
        model infers or simulates; violet, what is unresolved.
      </p>
      {CHAPTERS.map((c, i) => (
        <section key={c.id} className="panel-section">
          <h2 className="panel-chapter">
            {i + 1} · {c.title} · {c.tagline}
          </h2>
          {c.sources.length ? c.sources.map((id) => sourceById(id)).filter((s): s is Source => !!s).map((s) => <SourceEntry key={s.id} s={s} focus={s.id === focus} />) : <p className="source-note">No figures in this chapter.</p>}
        </section>
      ))}
      <section className="panel-section">
        <h2 className="panel-chapter">Along the way · the meter</h2>
        {[...new Set(METERS.flatMap((x) => x.sources))]
          .filter((id) => !CHAPTERS.some((c) => c.sources.includes(id)))
          .map((id) => sourceById(id))
          .filter((s): s is Source => !!s)
          .map((s) => (
            <SourceEntry key={s.id} s={s} focus={s.id === focus} />
          ))}
      </section>
      <p className="panel-lede">{SOURCES.length} entries in all.</p>
    </Dialog>
  );
}

export function TextPanel({ open, onClose, onSource }: { open: boolean; onClose: () => void; onSource: (id: string) => void }) {
  return (
    <Dialog open={open} onClose={onClose} label="Text version">
      <h2 className="panel-title">What we can’t see</h2>
      <p className="panel-lede">The whole ride as text, with a description of what is on screen at each stop.</p>
      {CHAPTERS.map((c, i) => (
        <section key={c.id} className="panel-section">
          <h2 className="panel-chapter">
            {i + 1} · {c.title} · {c.tagline}
          </h2>
          <p className="transcript-visual">On screen: {c.camera}</p>
          {c.beats.slice(1).map((b) => (
            <div key={b.at}>
              <p className={b.question ? 'transcript-line is-question' : 'transcript-line'}>
                {b.text}{' '}
                {b.sources?.map((id) => (
                  <button key={id} type="button" className="transcript-ref" onClick={() => onSource(id)} aria-label={`Source: ${sourceById(id)?.claim}`}>
                    source
                  </button>
                ))}
              </p>
              {b.more && <p className="transcript-more">{b.more}</p>}
            </div>
          ))}
          {c.facts?.map((f) => (
            <p key={f.text} className="transcript-fact">
              Did you know? {f.text}{' '}
              <button type="button" className="transcript-ref" onClick={() => onSource(f.sources[0])}>
                source
              </button>
            </p>
          ))}
        </section>
      ))}
    </Dialog>
  );
}
