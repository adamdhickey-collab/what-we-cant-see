// The caption: one line at a time, in a fixed place at the bottom of the
// frame so the picture owns the middle. Nothing here asks to be clicked; the
// kind of claim and its source show only when the viewer turns on evidence in
// Options. A line's longer detail and a chapter's side facts live in the Text
// version, for anyone who wants them.

import { useDirector } from '../animation/director';
import { beatIndexAt, chapterIndexAt, CHAPTERS, STARTS } from '../content/chapters';
import { KIND_LABEL } from '../content/sources';

export function Narrative({ onSource }: { onSource: (id: string) => void }) {
  const key = useDirector((s) => {
    const ci = chapterIndexAt(s.t);
    return ci * 100 + beatIndexAt(CHAPTERS[ci], s.t - STARTS[ci]);
  });
  const evidence = useDirector((s) => s.evidence);
  const ci = Math.floor(key / 100);
  const bi = key % 100;
  const chapter = CHAPTERS[ci];
  const beat = chapter.beats[bi];

  const opening = chapter.id === 'shore' && bi === 0;
  const cls = opening ? 'beat beat-hero' : bi === 0 ? 'beat beat-title' : beat.question ? 'beat beat-question' : 'beat';

  return (
    <section className={`narrative narrative-${chapter.id}`} aria-live="polite" aria-atomic="true">
      <p className="kicker">
        <span className="kicker-num">{String(ci + 1).padStart(2, '0')}</span> {chapter.title}
        {bi === 0 && !opening && <span className="kicker-tagline"> · {chapter.tagline}</span>}
      </p>
      <p key={key} className={cls}>
        {beat.text}
      </p>
      {evidence && beat.sources && beat.kind && (
        <div className="beat-tools" key={`t${key}`}>
          <button type="button" className={`claim kind-${beat.kind}`} onClick={() => onSource(beat.sources![0])}>
            <span className="claim-dot" aria-hidden="true" />
            {KIND_LABEL[beat.kind]} · source
          </button>
        </div>
      )}
    </section>
  );
}
