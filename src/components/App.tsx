import { useEffect, useRef, useState } from 'react';
import { director, useDirector } from '../animation/director';
import { chapterIndexAt, STARTS, TOTAL } from '../content/chapters';
import { Stage } from '../experience/Stage';
import { Controls } from './Controls';
import { Narrative } from './Narrative';
import { SourcesPanel, TextPanel } from './Panels';
import { ProteinPanel } from './ProteinPanel';
import { ScaleNavigator } from './ScaleNavigator';
import { TransitLab, warmTransit } from './TransitLab';

type Panel = null | { kind: 'sources'; focus: string | null } | { kind: 'text' };

const params = new URLSearchParams(location.search);
/** ?kiosk plays from the first frame and loops, for a wall. */
const KIOSK = params.has('kiosk');

export function App() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const started = useDirector((s) => s.started);
  const webgl = useDirector((s) => s.webgl);
  const ended = useDirector((s) => s.ended);
  const ci = useDirector((s) => chapterIndexAt(s.t));
  // The instruments mount a moment before their chapter, so they fade in with it.
  const showLab = useDirector((s) => s.t > STARTS[3] - 0.4 && s.t < STARTS[4] + 1);

  useEffect(() => {
    const stage = canvas.current && labels.current ? Stage.create(canvas.current, labels.current) : null;
    if (!stage) director.set({ webgl: false });
    if (KIOSK) director.begin('guided');
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 300));
    idle(() => warmTransit());
    return () => stage?.dispose();
  }, []);

  useEffect(() => {
    if (!(KIOSK && ended)) return;
    const id = setTimeout(() => director.play(), 10_000);
    return () => clearTimeout(id);
  }, [ended]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panel || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement;
      const typing = el.matches('input, select, textarea');
      const onButton = el.matches('button, a');
      if ((e.key === ' ' && !onButton && !typing) || e.key === 'k') {
        e.preventDefault();
        director.toggle();
      } else if (!typing && e.key === 'ArrowRight') director.step(1);
      else if (!typing && e.key === 'ArrowLeft') director.step(-1);
      else if (/^[1-7]$/.test(e.key)) director.goToChapter(+e.key - 1);
      else if (e.key === 's') setPanel({ kind: 'sources', focus: null });
      else if (e.key === 't') setPanel({ kind: 'text' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel]);

  const openSource = (id: string) => {
    director.pause();
    setPanel({ kind: 'sources', focus: id });
  };

  const showProtein = ci === 5;

  return (
    <div className={`app chapter-${ci + 1}${started ? ' is-started' : ''}${webgl ? '' : ' no-webgl'}`}>
      <canvas ref={canvas} className="stage" aria-hidden="true" />
      <div ref={labels} className="stage-labels" aria-hidden="true" />

      <header className="top">
        <a className="wordmark" href="./" aria-label="What We Can’t See, start over">
          What We Can’t See
        </a>
        <div className="top-links">
          <button type="button" className="link-btn" onClick={() => setPanel({ kind: 'text' })}>
            Text<span className="hide-narrow"> version</span>
          </button>
          <button type="button" className="link-btn" onClick={() => setPanel({ kind: 'sources', focus: null })}>
            Sources
          </button>
        </div>
      </header>

      {started && (
        <>
          <ScaleNavigator />
          <main className="story">
            <Narrative onSource={openSource} />
            {showLab && (
              <div className="instrument instrument-lab">
                <TransitLab />
              </div>
            )}
            {showProtein && (
              <div className="instrument instrument-protein">
                <ProteinPanel />
              </div>
            )}
          </main>
          <Controls />
        </>
      )}

      {!started && (
        <section className="intro" aria-labelledby="intro-title">
          <p className="intro-kicker">An interactive experiment by Adam Hickey</p>
          <h1 id="intro-title" className="intro-title">
            What We Can’t See
          </h1>
          <p className="intro-lede">
            From a person on a shore to the largest structure ever mapped, and back into the molecules that make them. A piece about scale, and about
            the instruments, the newest of them AI, that let us see what our senses cannot.
          </p>
          <div className="intro-actions">
            <button type="button" className="btn btn-primary" onClick={() => director.begin('guided')} autoFocus>
              Begin · {Math.round(TOTAL / 60 * 2) / 2} minutes
            </button>
            <button type="button" className="btn" onClick={() => director.begin('explore')}>
              Explore at your own pace
            </button>
          </div>
          <p className="intro-note">
            No sound. Space pauses, arrow keys step, 1–7 jump to a chapter.{' '}
            <button type="button" className="link-btn" onClick={() => setPanel({ kind: 'text' })}>
              Read it as text
            </button>
          </p>
          {!webgl && <p className="intro-note">This browser cannot draw the 3D scenes, so you will see the text, the scale and the data without them.</p>}
        </section>
      )}

      <SourcesPanel open={panel?.kind === 'sources'} focus={panel?.kind === 'sources' ? panel.focus : null} onClose={() => setPanel(null)} />
      <TextPanel open={panel?.kind === 'text'} onClose={() => setPanel(null)} onSource={(id) => setPanel({ kind: 'sources', focus: id })} />
    </div>
  );
}
