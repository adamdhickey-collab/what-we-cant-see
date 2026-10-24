// Which way the protein is shown, as the narration calls for it. Kept apart
// from the scene so the page's panel can share it without loading Three.js.

import type { ProteinView } from '../animation/director';
import { beatIdAt, beatStart, CH, CHAPTERS } from '../content/chapters';

/** The view the narration calls for at a moment in the protein's own chapter. */
export function autoView(local: number): Exclude<ProteinView, 'auto'> | 'shape' {
  const c = CHAPTERS[CH.unsure];
  if (local < beatStart('unsure', 'alphafold')) return 'shape';
  const id = beatIdAt(c, local);
  // The viewer guesses before the confidence is shown.
  if (id === 'alphafold' || id === 'guess') return 'prediction';
  if (id === 'floppy' || id === 'check') return 'verify';
  return 'confidence';
}
