// The two things that run alongside the script: the lenses offered on the
// shore at the end, and the meter of hidden systems that counts from the
// moment the ride begins. Both cite the same ledger as the narration.

export type LensId = 'infrared' | 'radio' | 'neutrinos' | 'magnetic' | 'dark';

export interface Lens {
  id: LensId;
  name: string;
  /** Whose eyes, if anyone’s. */
  who: string;
  text: string;
  sources: string[];
}

export const LENSES: Lens[] = [
  { id: 'infrared', name: 'Infrared', who: 'A pit viper', text: 'Warm things glow. A pit viper sees you like this in the dark.', sources: ['body-infrared', 'pit-viper'] },
  { id: 'radio', name: 'Radio', who: 'A radio telescope', text: 'The air is full of phone, Wi-Fi and broadcast signals. The faint hiss behind them is the Big Bang’s afterglow.', sources: ['radio-air', 'cmb-static'] },
  { id: 'neutrinos', name: 'Neutrinos', who: 'A detector deep underground', text: 'The Sun has set, but its neutrinos still arrive: straight up through the Earth, and through you.', sources: ['neutrinos'] },
  { id: 'magnetic', name: 'Magnetic field', who: 'A migrating bird', text: 'Earth’s magnetic field arcs overhead. Many migrating birds can feel which way it runs.', sources: ['bird-magnet'] },
  { id: 'dark', name: 'Dark matter', who: 'No one yet', text: 'If our best models are right, dark matter is drifting through here too, unseen and unfelt.', sources: ['dark-matter'] },
];

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
