// A procedural barred spiral, roughly the Milky Way's form: two major arms,
// two minor ones, a bar and a bulge. Illustrative, and labelled so. Positions
// are in thousands of light-years, centered on the galaxy's core.

import { rng } from '../animation/ease';
import { rgb } from '../shaders/palette';

export function galaxyPoints(count: number, seed = 5) {
  const r = rng(seed);
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const ivory = rgb('ivory');
  const violet = rgb('violet');
  const copper = rgb('copper');
  const pitch = Math.tan((12 * Math.PI) / 180);
  const bar = 0.45;
  for (let i = 0; i < count; i++) {
    const k = r.next();
    let x: number, y: number, z: number;
    let warm = 0;
    let bright = 0.5;
    if (k < 0.08) {
      // Bulge
      const rad = Math.abs(r.gauss()) * 2.6;
      const th = r.next() * Math.PI * 2;
      const ph = Math.acos(r.next() * 2 - 1);
      x = rad * Math.sin(ph) * Math.cos(th);
      z = rad * Math.sin(ph) * Math.sin(th);
      y = rad * Math.cos(ph) * 0.55;
      warm = 0.35;
      bright = 0.38;
    } else if (k < 0.15) {
      // Bar
      const s = (r.next() * 2 - 1) * 9;
      const w = r.gauss() * 1.3;
      x = s * Math.cos(bar) - w * Math.sin(bar);
      z = s * Math.sin(bar) + w * Math.cos(bar);
      y = r.gauss() * 0.5;
      warm = 0.25;
      bright = 0.4;
    } else if (k < 0.84) {
      // Arms: logarithmic spirals, r = r0 e^(b θ)
      const major = r.next() < 0.72;
      const arm = major ? (r.next() < 0.5 ? 0 : Math.PI) : r.next() < 0.5 ? Math.PI / 2 : (3 * Math.PI) / 2;
      const rad = Math.min(54, 4.5 - Math.log(Math.max(r.next(), 1e-6)) * 12);
      const th = Math.log(rad / 4.5) / pitch + arm + bar + r.gauss() * 0.18;
      const spread = 0.5 + rad * 0.045;
      x = rad * Math.cos(th) + r.gauss() * spread;
      z = rad * Math.sin(th) + r.gauss() * spread;
      y = r.gauss() * 0.35;
      bright = major ? 0.62 : 0.42;
    } else {
      // Diffuse disk
      const rad = -Math.log(Math.max(r.next(), 1e-6)) * 11;
      const th = r.next() * Math.PI * 2;
      x = rad * Math.cos(th);
      z = rad * Math.sin(th);
      y = r.gauss() * 0.5;
      bright = 0.28;
    }
    pos.set([x, y, z], i * 3);
    const b = bright * (0.5 + 0.5 * r.next());
    const cool = k >= 0.84 ? 0.5 : 0.12;
    for (let c = 0; c < 3; c++) {
      col[i * 3 + c] = b * (ivory[c] * (1 - warm - cool) + copper[c] * warm + violet[c] * cool);
    }
    size[i] = 0.7 + 1.1 * Math.pow(r.next(), 4);
  }
  return { pos, col, size };
}
