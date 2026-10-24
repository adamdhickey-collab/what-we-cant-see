// What runs alongside the script: the meter of hidden systems that counts
// from the moment the ride begins, citing the same ledger as the narration.

/** The other eyes the closing shore looks through, one line of the script each. */
export type LensId = 'infrared' | 'radio' | 'neutrinos' | 'magnetic' | 'dark';

export interface Meter {
  id: string;
  label: string;
  /** Per second of the viewer’s own time. */
  rate: number;
  sources: string[];
}

export const METERS: Meter[] = [
  { id: 'neutrinos', label: 'Solar neutrinos through your thumbnail', rate: 6.5e10, sources: ['neutrinos'] },
  { id: 'orbit', label: 'Kilometers Earth has carried you around the Sun', rate: 29.78, sources: ['earth-orbit'] },
  { id: 'cells', label: 'Cells your body has replaced', rate: 3.8e6, sources: ['turnover'] },
  { id: 'saccades', label: 'Eye jumps your brain hid from you', rate: 3, sources: ['saccades'] },
];

/** A big count in words a person reads at a glance. */
export function countWords(n: number) {
  const units: [number, string][] = [
    [1e15, 'quadrillion'],
    [1e12, 'trillion'],
    [1e9, 'billion'],
    [1e6, 'million'],
  ];
  for (const [v, w] of units) if (n >= v) return `${(n / v).toFixed(n / v < 10 ? 1 : 0)} ${w}`;
  return Math.floor(n).toLocaleString('en-US');
}
