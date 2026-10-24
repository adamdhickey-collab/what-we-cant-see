import { useEffect, useRef, useState } from 'react';
import { director, useDirector } from '../animation/director';
import { music, MUSIC } from '../animation/music';
import { sound } from '../audio/sound';
import { CH, chapterIndexAt, CHAPTERS, STARTS, TOTAL } from '../content/chapters';
import { EDITION, EDITION_QUERY } from '../content/edition';
import { NAROPA } from '../content/naropa';
import { Aside } from './Aside';
import { Controls } from './Controls';
import { Meter } from './Meter';
import { Narrative } from './Narrative';
import { Options } from './Options';
import { SourcesPanel, TextPanel } from './Panels';
import { ProteinPanel } from './ProteinPanel';
import { ScaleNavigator } from './ScaleNavigator';
import { Souvenir } from './Souvenir';
import { TimeLab } from './TimeLab';
import { TransitLab, warmTransit } from './TransitLab';

type Panel = null | { kind: 'sources'; focus: string | null } | { kind: 'text' };

const params = new URLSearchParams(location.search);
/** ?kiosk plays from the first frame and loops, for a wall. */
const KIOSK = params.has('kiosk');
const MINUTES = Math.round(TOTAL / 60);

export function App() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const started = useDirector((s) => s.started);
  const webgl = useDirector((s) => s.webgl);
  const ended = useDirector((s) => s.ended);
  const soundOn = useDirector((s) => s.sound);
  const musicOn = useDirector((s) => s.music);
  const ci = useDirector((s) => chapterIndexAt(s.t));
  // The instruments mount a moment before their chapter, so they fade in with it.
  const near = (i: number) => (s: { t: number }) => s.t > STARTS[i] - 0.4 && s.t < STARTS[i] + CHAPTERS[i].duration + 1;
  const showLab = useDirector(near(CH.faint));
  const showTime = useDirector(near(CH.time));

  useEffect(() => {
    // Three.js and the scenes arrive as their own chunk, so the page and its text come up first.
    let stage: { dispose(): void } | null = null;
    let gone = false;
    void import('../experience/Stage').then(({ Stage }) => {
      if (gone) return;
      stage = canvas.current && labels.current ? Stage.create(canvas.current, labels.current) : null;
      if (!stage) director.set({ webgl: false });
    });
    if (KIOSK) director.begin('guided');
    // A viewer who chose music before gets the player loading now, so it is ready by Begin.
    music.prepare();
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 300));
    idle(() => void warmTransit());
    return () => {
      gone = true;
      stage?.dispose();
    };
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
      else if (/^[1-9]$/.test(e.key) && +e.key <= CHAPTERS.length) director.goToChapter(+e.key - 1);
      else if (e.key === 's') setPanel({ kind: 'sources', focus: null });
      else if (e.key === 't') setPanel({ kind: 'text' });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel]);

  // Scrolling moves through the story at your own pace; a swipe on the caption steps a line.
  useEffect(() => {
    let acc = 0;
    let last = 0;
    const free = (el: EventTarget | null) => el instanceof HTMLElement && !el.closest('.instrument, .panel, .meter, .options-menu, .souvenir, input');
    const onWheel = (e: WheelEvent) => {
      if (!director.get().started || panel || !free(e.target)) return;
      acc += e.deltaY;
      const now = performance.now();
      if (Math.abs(acc) > 60 && now - last > 350) {
        director.explore();
        director.step(acc > 0 ? 1 : -1);
        acc = 0;
        last = now;
      }
    };
    let y0: number | null = null;
    const onStart = (e: TouchEvent) => {
      y0 = (e.target as HTMLElement).closest('.narrative') ? e.touches[0].clientY : null;
    };
    const onEnd = (e: TouchEvent) => {
      if (y0 === null) return;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dy) > 48) {
        director.explore();
        director.step(dy < 0 ? 1 : -1);
      }
      y0 = null;
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [panel]);

  const openSource = (id: string) => {
    director.pause();
    setPanel({ kind: 'sources', focus: id });
  };

  const begin = (mode: 'guided' | 'explore') => {
    if (director.get().sound) sound.unlock();
    if (director.get().music) music.wake();
    director.begin(mode);
  };

  const chapterId = CHAPTERS[ci].id;

  return (
    <div className={`app chapter-${chapterId}${started ? ' is-started' : ''}${webgl ? '' : ' no-webgl'}${ended ? ' is-ended' : ''}`}>
      <canvas ref={canvas} className="stage" aria-hidden="true" />
      <div ref={labels} className="stage-labels" aria-hidden="true" />

      <header className="top">
        <a className="wordmark" href={`./${EDITION_QUERY}`} aria-label="What We Can’t See, start over">
          What We Can’t See
        </a>
        <div className="top-links">
          <Options />
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
          {!ended && <Meter onSource={openSource} />}
          <main className="story">
            <Aside />
            <Narrative onSource={openSource} />
            {showLab && (
              <div className="instrument instrument-lab">
                <TransitLab />
              </div>
            )}
            {showTime && (
              <div className="instrument instrument-lab instrument-time">
                <TimeLab />
              </div>
            )}
            {chapterId === 'unsure' && (
              <div className="instrument instrument-protein">
                <ProteinPanel />
              </div>
            )}
            {ended && !KIOSK && <Souvenir onSources={() => setPanel({ kind: 'sources', focus: null })} />}
          </main>
          <Controls />
        </>
      )}

      {!started && (
        <section className="intro" aria-labelledby="intro-title">
          <p className="intro-kicker">{EDITION === 'naropa' ? NAROPA.kicker : 'An interactive ride by Adam Hickey'}</p>
          <h1 id="intro-title" className="intro-title">
            What We Can’t See
          </h1>
          <p className="intro-lede">
            Your senses edit the world. In about {MINUTES} minutes, go from a quiet shore to the edge of the observable universe and into your own cells,
            and find out what they leave out.{EDITION === 'naropa' && <> {NAROPA.lede}</>}
          </p>
          <ol className="intro-map" aria-label="The ride’s stops">
            {CHAPTERS.map((c) => (
              <li key={c.id}>{c.title}</li>
            ))}
          </ol>
          <div className="intro-actions">
            <button type="button" className="btn btn-primary" onClick={() => begin('guided')} autoFocus>
              Take the ride
            </button>
            <button type="button" className="btn" onClick={() => begin('explore')}>
              Wander at your own pace
            </button>
          </div>
          <div className="intro-actions intro-listen" role="group" aria-label="Listening">
            <button
              type="button"
              className="btn btn-quiet"
              aria-pressed={musicOn}
              onClick={() => {
                director.setPref({ music: !musicOn });
                if (!musicOn) music.prepare();
              }}
            >
              {musicOn ? 'Music on' : 'Play with music'}
            </button>
            <button
              type="button"
              className="btn btn-quiet"
              aria-pressed={soundOn}
              onClick={() => {
                if (!soundOn) sound.unlock();
                director.setPref({ sound: !soundOn });
              }}
            >
              {soundOn ? 'Sound effects on' : 'Sound effects off'}
            </button>
          </div>
          {musicOn && (
            <p className="intro-note">
              Music: {MUSIC.artist}, “{MUSIC.title}.”
            </p>
          )}
          <p className="intro-note">
            Sit back: it plays straight through, like a film. Space pauses, arrows or scrolling step, 1–8 jump to a chapter.{' '}
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
