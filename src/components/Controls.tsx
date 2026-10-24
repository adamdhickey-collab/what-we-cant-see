// The transport: play and pause, the timeline, the chapters, and the switch
// between being taken through it and taking yourself.

import { director, useDirector } from '../animation/director';
import { chapterIndexAt, CHAPTERS, STARTS, TOTAL } from '../content/chapters';
import { clock } from './format';

export function Controls() {
  const t = useDirector((s) => Math.round(s.t * 10) / 10);
  const playing = useDirector((s) => s.playing);
  const ended = useDirector((s) => s.ended);
  const mode = useDirector((s) => s.mode);
  const ci = chapterIndexAt(t);

  return (
    <div className="controls" role="group" aria-label="Playback">
      <div className="controls-row">
        <button type="button" className="icon-btn" onClick={() => director.step(-1)} aria-label="Previous line">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10.5 3.5 6 8l4.5 4.5" /></svg>
        </button>
        <button type="button" className="play" onClick={() => director.toggle()} aria-label={playing ? 'Pause' : ended ? 'Replay' : 'Play'}>
          {playing ? (
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5v9M10.5 3.5v9" /></svg>
          ) : ended ? (
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8a4.5 4.5 0 1 0 1.4-3.3M3.5 2.5v2.4h2.4" /></svg>
          ) : (
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6L12.5 8z" className="fill" /></svg>
          )}
        </button>
        <button type="button" className="icon-btn" onClick={() => director.step(1)} aria-label="Next line">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 3.5 10 8l-4.5 4.5" /></svg>
        </button>
        <span className="time" aria-hidden="true">
          {clock(director.source ? director.source.display(t) : t)}{' '}
          <span className="time-total">/ {clock(director.source ? director.source.total : TOTAL)}</span>
        </span>
        <div className="mode" role="radiogroup" aria-label="Mode">
          <button type="button" role="radio" aria-checked={mode === 'guided'} className={mode === 'guided' ? 'is-on' : undefined} onClick={() => director.play()}>
            Guided
          </button>
          <button type="button" role="radio" aria-checked={mode === 'explore'} className={mode === 'explore' ? 'is-on' : undefined} onClick={() => director.explore()}>
            Explore
          </button>
        </div>
      </div>
      <div className="timeline">
        <input
          type="range"
          className="scrub"
          min={0}
          max={TOTAL}
          step={0.1}
          value={t}
          style={{ ['--p' as string]: `${(t / TOTAL) * 100}%` }}
          aria-label="Timeline"
          aria-valuetext={`${clock(t)}, chapter ${ci + 1}, ${CHAPTERS[ci].title}`}
          onChange={(e) => {
            director.explore();
            director.seek(+e.target.value);
          }}
        />
        <ol className="chapters">
          {CHAPTERS.map((c, i) => (
            <li key={c.id} style={{ flexGrow: c.duration }}>
              <button
                type="button"
                className={i === ci ? 'is-current' : i < ci ? 'is-past' : undefined}
                aria-current={i === ci ? 'step' : undefined}
                onClick={() => director.goToChapter(i)}
              >
                <span className="chapter-num">{i + 1}</span>
                <span className="chapter-name">{c.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <span className="sr-only">{STARTS.length} chapters.</span>
    </div>
  );
}
