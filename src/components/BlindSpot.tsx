// The pre-show: find your own blind spot. A cross and a dot sit on one line,
// far enough apart that, with the left eye closed and the right eye on the
// cross, the dot falls about 15 degrees out, onto the optic disc, at a
// comfortable distance from the screen. When it vanishes, the line looks
// unbroken: the brain has filled the gap.

import { director, useDirector } from '../animation/director';
import { beatStart, CH, STARTS } from '../content/chapters';

const TEST = beatStart('eyes', 'test');
const PAINT = beatStart('eyes', 'paint');

export function BlindSpot() {
  const local = useDirector((s) => s.t - STARTS[CH.eyes]);
  const waiting = useDirector((s) => s.waiting === 'blindspot');
  const answer = useDirector((s) => s.answers.blindspot);
  const show = waiting || (local >= TEST - 0.3 && local < PAINT);
  if (!show) return null;

  const pick = (value: string) => {
    director.answer('blindspot', value);
    director.resolve();
  };

  return (
    <section className="blindspot" aria-labelledby="blindspot-title">
      <h2 id="blindspot-title" className="sr-only">
        Blind spot test
      </h2>
      <div className={`blindspot-field${answer ? ' is-done' : ''}`} aria-hidden="true">
        <span className="blindspot-line" />
        <span className="blindspot-cross">+</span>
        <span className="blindspot-dot" />
      </div>
      {!answer ? (
        <>
          <p className="blindspot-hint">
            Left eye closed, right eye on the <strong>+</strong>. Start about an arm’s length away and come in slowly
            <span className="show-narrow">, phone held sideways if you can</span>.
          </p>
          <div className="blindspot-actions">
            <button type="button" className="btn btn-primary" onClick={() => pick('yes')}>
              The dot vanished
            </button>
            <button type="button" className="btn" onClick={() => pick('no')}>
              I can’t find it
            </button>
          </div>
        </>
      ) : (
        <p className="blindspot-hint">
          {answer === 'yes'
            ? 'And the line ran straight through where it was. Your brain drew that in.'
            : 'It takes patience, and it’s there either way. Try again later, slowly, keeping your eye on the cross.'}
        </p>
      )}
    </section>
  );
}
