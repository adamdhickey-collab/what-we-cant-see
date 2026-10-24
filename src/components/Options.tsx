// The viewer's settings, kept between visits on this device: music, sound effects
// reading the lines, and whether each line shows its kind of claim and source.

import { useEffect, useRef, useState } from 'react';
import { director, useDirector, type Prefs } from '../animation/director';
import { music, MUSIC } from '../animation/music';
import { sound } from '../audio/sound';
import { toggleFullscreen } from './fullscreen';

const ITEMS: { key: keyof Prefs; name: string; says: string }[] = [
  { key: 'music', name: 'Music', says: `${MUSIC.artist}, “${MUSIC.title},” alongside the ride.` },
  { key: 'sound', name: 'Sound effects', says: 'A quiet bed for each place, and a bell at each reveal. Quiet while the music plays.' },
  { key: 'evidence', name: 'Show the evidence', says: 'Each line’s kind of claim (measured, inferred…) and its source.' },
];

export function Options() {
  const evidence = useDirector((s) => s.evidence);
  const soundOn = useDirector((s) => s.sound);
  const musicOn = useDirector((s) => s.music);
  const prefs: Prefs = { evidence, sound: soundOn, music: musicOn };
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="options" ref={ref}>
      <button type="button" className="link-btn" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)}>
        Options
      </button>
      {open && (
        <div className="options-menu" role="group" aria-label="Options">
          {ITEMS.map((it) => (
            <label key={it.key} className="option">
              <input
                type="checkbox"
                checked={prefs[it.key]}
                onChange={(e) => {
                  if (it.key === 'sound' && e.target.checked) sound.unlock();
                  if (it.key === 'music' && e.target.checked) {
                    director.setPref({ music: true });
                    music.wake();
                  }
                  director.setPref({ [it.key]: e.target.checked });
                }}
              />
              <span className="option-name">{it.name}</span>
              <span className="option-says">{it.says}</span>
            </label>
          ))}
          <button type="button" className="option option-action" onClick={toggleFullscreen}>
            <span className="option-name">Full screen</span>
            <span className="option-says">For a TV or a projector. The F key does the same.</span>
          </button>
        </div>
      )}
    </div>
  );
}
