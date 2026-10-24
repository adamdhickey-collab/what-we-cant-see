// The souvenir at the exit: the viewer's ride by the numbers, and the closing
// question, as a card they can save or share. The picture is drawn on a
// canvas in the page's own colors and fonts, and never leaves the browser
// unless they choose to share it.

import { useState } from 'react';
import { director } from '../animation/director';
import { CHAPTERS } from '../content/chapters';
import { EDITION_QUERY } from '../content/edition';
import { METERS } from '../content/extras';
import { clock } from './format';
import { meterValue, useRideSeconds } from './Meter';

const QUESTION = CHAPTERS[CHAPTERS.length - 1].beats.find((b) => b.id === 'last')!.text;

function lines(seconds: number) {
  return METERS.map((m) => ({ value: meterValue(m.rate, seconds), label: m.label[0].toLowerCase() + m.label.slice(1) }));
}

function draw(seconds: number) {
  const W = 1200, H = 630;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const display = css('--font-display'), data = css('--font-data'), text = css('--font-text');
  g.fillStyle = css('--ink');
  g.fillRect(0, 0, W, H);
  // The horizon, as on the shore.
  g.fillStyle = css('--copper');
  g.globalAlpha = 0.5;
  g.fillRect(0, H * 0.58, W, 1);
  g.globalAlpha = 1;
  g.fillStyle = css('--text-dim');
  g.font = `16px ${data}`;
  g.fillText('WHAT WE CAN’T SEE', 64, 72);
  g.fillText(`MY RIDE · ${clock(seconds)}`, 64, 100);
  g.fillStyle = css('--ivory');
  g.font = `300 40px ${display}`;
  g.fillText('While I watched, unseen:', 64, 168);
  lines(seconds).forEach((l, i) => {
    g.fillStyle = css('--ivory');
    g.font = `400 30px ${data}`;
    g.fillText(l.value, 64, 228 + i * 48);
    g.fillStyle = css('--text-dim');
    g.font = `22px ${text}`;
    g.fillText(l.label, 360, 226 + i * 48);
  });
  g.fillStyle = css('--ivory');
  g.font = `300 30px ${display}`;
  g.fillText(QUESTION, 64, H - 72);
  return c;
}

export function Souvenir({ onSources }: { onSources: () => void }) {
  const seconds = useRideSeconds();
  const [note, setNote] = useState('');
  const summary = `What We Can’t See. While I watched for ${clock(seconds)}: ${lines(seconds)
    .map((l) => `${l.value} ${l.label}`)
    .join('; ')}. ${QUESTION} ${location.href.split('?')[0]}${EDITION_QUERY}`;

  const save = () => {
    draw(seconds).toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'what-we-cant-see.png';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
  };
  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: 'What We Can’t See', text: summary });
      else {
        await navigator.clipboard.writeText(summary);
        setNote('Copied.');
      }
    } catch {
      /* Dismissed. */
    }
  };

  return (
    <section className="souvenir" aria-labelledby="souvenir-title">
      <p className="kicker">Your ride · {clock(seconds)}</p>
      <h2 id="souvenir-title" className="souvenir-title">
        While you watched, unseen:
      </h2>
      <dl className="souvenir-list">
        {lines(seconds).map((l) => (
          <div key={l.label} className="souvenir-row">
            <dt>{l.label}</dt>
            <dd>{l.value}</dd>
          </div>
        ))}
      </dl>
      <p className="souvenir-question">{QUESTION}</p>
      <div className="souvenir-actions">
        <button type="button" className="btn btn-primary" onClick={() => director.play()}>
          Ride again
        </button>
        <button type="button" className="btn" onClick={save}>
          Save as image
        </button>
        <button type="button" className="btn" onClick={share}>
          Share
        </button>
        <button type="button" className="link-btn" onClick={onSources}>
          Sources
        </button>
        <span className="souvenir-note" aria-live="polite">
          {note}
        </span>
      </div>
    </section>
  );
}
