// The meter of hidden systems: what has been going on, unnoticed, since the
// viewer pressed Begin. It counts the viewer's own time, pauses included,
// because none of these stop when the story does.

import { useEffect, useState } from 'react';
import { useDirector } from '../animation/director';
import { countWords, METERS } from '../content/extras';

/** Seconds since the ride began, ticking a few times a second. */
export function useRideSeconds() {
  const beganAt = useDirector((s) => s.beganAt);
  const endedAt = useDirector((s) => s.endedAt);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (endedAt) return;
    const id = setInterval(() => setNow(Date.now()), 120);
    return () => clearInterval(id);
  }, [endedAt]);
  return beganAt ? Math.max(0, ((endedAt ?? now) - beganAt) / 1000) : 0;
}

export function meterValue(rate: number, seconds: number) {
  return countWords(rate * seconds);
}

export function Meter({ onSource }: { onSource: (id: string) => void }) {
  const seconds = useRideSeconds();
  const [open, setOpen] = useState(true);
  return (
    <aside className={`meter${open ? '' : ' is-closed'}`} aria-label="Hidden systems since you began">
      <button type="button" className="meter-head" aria-expanded={open} onClick={() => setOpen(!open)}>
        Since you began
      </button>
      {open && (
        <dl className="meter-list">
          {METERS.map((m) => (
            <div key={m.id} className="meter-row">
              <dt>
                <button type="button" className="meter-label" onClick={() => onSource(m.sources[0])}>
                  {m.label}
                </button>
              </dt>
              <dd>{meterValue(m.rate, seconds)}</dd>
            </div>
          ))}
        </dl>
      )}
    </aside>
  );
}
