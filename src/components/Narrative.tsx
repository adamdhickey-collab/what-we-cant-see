// The caption: one line at a time, in a fixed place at the bottom of the
// frame so the picture owns the middle. A line with more to it can be opened;
// the kind of claim and its source show when the viewer asks for evidence; a
// chapter's side doors offer a fact or two; and when the ride is waiting for
// the viewer, the caption says so.

import { useEffect, useState } from 'react';
import { director, useDirector } from '../animation/director';
import { beatIndexAt, chapterIndexAt, CHAPTERS, STARTS, type HoldId } from '../content/chapters';
import { KIND_LABEL } from '../content/sources';

const PROMPT: Record<HoldId, { text: string; go: string }> = {
  blindspot: { text: 'Your turn. Take your time.', go: 'Skip the test' },
  transit: { text: 'Your turn: tap the dots where you think the planet passes.', go: 'Skip' },
  confidence: { text: 'Your turn: make a guess in the panel.', go: 'Skip' },
  lenses: { text: 'Your turn: try each lens.', go: 'Continue the ride' },
};

export function Narrative({ onSource }: { onSource: (id: string) => void }) {
  const key = useDirector((s) => {
    const ci = chapterIndexAt(s.t);
    return ci * 100 + beatIndexAt(CHAPTERS[ci], s.t - STARTS[ci]);
  });
  const evidence = useDirector((s) => s.evidence);
  const waiting = useDirector((s) => s.waiting);
  const ci = Math.floor(key / 100);
  const bi = key % 100;
  const chapter = CHAPTERS[ci];
  const beat = chapter.beats[bi];
  const [more, setMore] = useState(false);
  const [fact, setFact] = useState<number | null>(null);
  useEffect(() => setMore(false), [key]);
  useEffect(() => setFact(null), [ci]);

  const opening = chapter.id === 'shore' && bi === 0;
  const cls = opening ? 'beat beat-hero' : bi === 0 ? 'beat beat-title' : beat.question ? 'beat beat-question' : 'beat';
  const facts = chapter.facts ?? [];

  return (
    <section className={`narrative narrative-${chapter.id}`} aria-live="polite" aria-atomic="true">
      <p className="kicker">
        <span className="kicker-num">{String(ci + 1).padStart(2, '0')}</span> {chapter.title}
        {bi === 0 && !opening && <span className="kicker-tagline"> · {chapter.tagline}</span>}
      </p>
      <p key={key} className={cls}>
        {beat.text}
      </p>
      <div className="beat-tools" key={`t${key}`}>
        {beat.more && (
          <button
            type="button"
            className="tool"
            aria-expanded={more}
            onClick={() => {
              if (!more) director.pause();
              setMore(!more);
            }}
          >
            {more ? 'Less' : 'More'}
          </button>
        )}
        {evidence && beat.sources && beat.kind && (
          <button type="button" className={`claim kind-${beat.kind}`} onClick={() => onSource(beat.sources![0])}>
            <span className="claim-dot" aria-hidden="true" />
            {KIND_LABEL[beat.kind]} · source
          </button>
        )}
        {facts.length > 0 && bi > 0 && (
          <button
            type="button"
            className="tool tool-fact"
            aria-expanded={fact !== null}
            onClick={() => {
              director.pause();
              setFact(fact === null ? 0 : null);
            }}
          >
            Did you know?
          </button>
        )}
      </div>
      {more && beat.more && <p className="beat-more">{beat.more}</p>}
      {fact !== null && (
        <div className="fact-card">
          <p>{facts[fact].text}</p>
          <div className="fact-actions">
            <button type="button" className="tool" onClick={() => onSource(facts[fact].sources[0])}>
              Source
            </button>
            {facts.length > 1 && (
              <button type="button" className="tool" onClick={() => setFact((fact + 1) % facts.length)}>
                Another
              </button>
            )}
            <button type="button" className="tool" onClick={() => setFact(null)}>
              Close
            </button>
          </div>
        </div>
      )}
      {waiting && (
        <div className="hold-prompt">
          <span>{PROMPT[waiting].text}</span>
          <button type="button" className="tool" onClick={() => director.resolve()}>
            {PROMPT[waiting].go}
          </button>
        </div>
      )}
    </section>
  );
}
