const LY = 9.4607e15;

const words = (n: number) => {
  if (n >= 1e9) return `${+(n / 1e9).toPrecision(2)} billion`;
  if (n >= 1e6) return `${+(n / 1e6).toPrecision(2)} million`;
  if (n >= 1e4) return `${Math.round(n / 1e3).toLocaleString('en-US')} thousand`;
  return (+n.toPrecision(2)).toLocaleString('en-US');
};

/** A length in the unit a person would use for it. */
export function formatLength(m: number) {
  if (m >= LY * 0.5) return `${words(m / LY)} light-years`;
  if (m >= 1e3) return `${words(m / 1e3)} km`;
  if (m >= 1) return `${+m.toPrecision(2)} m`;
  if (m >= 1e-3) return `${+(m * 1e3).toPrecision(2)} mm`;
  if (m >= 1e-6) return `${+(m * 1e6).toPrecision(2)} µm`;
  if (m >= 1e-9) return `${+(m * 1e9).toPrecision(2)} nm`;
  if (m >= 1e-12) return `${+(m * 1e12).toPrecision(2)} pm`;
  return `${+(m * 1e15).toPrecision(2)} fm`;
}

export const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const SUP: Record<string, string> = { '-': '⁻', '.': '·', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export const power = (x: number, digits = 0) => `10${x.toFixed(digits).split('').map((c) => SUP[c] ?? c).join('')}`;
