import { useDirector } from '../animation/director';
import { beatIndexAt, chapterIndexAt, CHAPTERS, STARTS } from '../content/chapters';
import { KIND_LABEL } from '../content/sources';

export function Narrative({ onSource }: { onSource: (id: string) => void }) {
  const key = useDirector((s) => {
    const ci = chapterIndexAt(s.t);
    return ci * 100 + beatIndexAt(CHAPTERS[ci], s.t - STARTS[ci]);
  });
  const ci = Math.floor(key / 100);
  const bi = key % 100;
  const chapter = CHAPTERS[ci];
  const beat = chapter.beats[bi];
  const opening = ci === 0 && bi === 0;
  const cls = opening ? 'beat beat-hero' : bi === 0 ? 'beat beat-title' : beat.question ? 'beat beat-question' : 'beat';

  return (
    <section className={`narrative narrative-${chapter.id}`} aria-live="polite" aria-atomic="true">
      <p className="kicker">
        <span className="kicker-num">{String(ci + 1).padStart(2, '0')}</span> {chapter.title}
      </p>
      <p key={key} className={cls}>
        {beat.text}
      </p>
      {beat.sources && beat.kind && (
        <button key={`s${key}`} type="button" className={`claim kind-${beat.kind}`} onClick={() => onSource(beat.sources![0])}>
          <span className="claim-dot" aria-hidden="true" />
          {KIND_LABEL[beat.kind]} · source
        </button>
      )}
    </section>
  );
}
