// Fetches the world's land outlines and turns them into a small land/sea map
// for the Earth in Chapter 2, so its continents are real and real cities can
// sit on them.
//
//   node scripts/fetch-earth.mjs
//
// Source: Natural Earth 1:110m land, public domain, as TopoJSON in the
// world-atlas package (https://github.com/topojson/world-atlas). The output is
// an equirectangular bitmap, one bit per half degree (720 x 360), base64 in
// JSON: about 43 KB. Row 0 is the north edge; column 0 is longitude -180.

import { writeFile } from 'node:fs/promises';

const URL_LAND = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json';
const topo = await (await fetch(URL_LAND)).json();

// Decode TopoJSON arcs: quantized, delta-encoded points.
const { scale, translate } = topo.transform;
const arcs = topo.arcs.map((arc) => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
  });
});
const ring = (indices) => {
  const pts = [];
  for (const i of indices) {
    const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
    pts.push(...(pts.length ? a.slice(1) : a));
  }
  return pts;
};
const rings = [];
for (const g of topo.objects.land.geometries) {
  const polys = g.type === 'Polygon' ? [g.arcs] : g.arcs;
  for (const poly of polys) for (const r of poly) rings.push(ring(r));
}

// Scanline fill, even-odd, at each cell's center.
const W = 720, H = 360;
const bits = new Uint8Array((W * H) / 8);
for (let row = 0; row < H; row++) {
  const lat = 90 - (row + 0.5) * (180 / H);
  const xs = [];
  for (const pts of rings) {
    for (let k = 0; k < pts.length - 1; k++) {
      const [x1, y1] = pts[k], [x2, y2] = pts[k + 1];
      if ((y1 > lat) !== (y2 > lat)) xs.push(x1 + ((lat - y1) / (y2 - y1)) * (x2 - x1));
    }
  }
  xs.sort((a, b) => a - b);
  for (let k = 0; k + 1 < xs.length; k += 2) {
    const c0 = Math.max(0, Math.ceil((xs[k] + 180) / (360 / W) - 0.5));
    const c1 = Math.min(W - 1, Math.floor((xs[k + 1] + 180) / (360 / W) - 0.5));
    for (let c = c0; c <= c1; c++) {
      const i = row * W + c;
      bits[i >> 3] |= 1 << (i & 7);
    }
  }
}

let land = 0;
for (let i = 0; i < W * H; i++) if (bits[i >> 3] & (1 << (i & 7))) land++;
const out = {
  source: 'Natural Earth 1:110m land (public domain), via world-atlas 2.0.2',
  url: URL_LAND,
  retrieved: new Date().toISOString().slice(0, 10),
  width: W,
  height: H,
  note: 'Equirectangular, one bit per cell, row 0 at 90°N, column 0 at 180°W.',
  bits: Buffer.from(bits).toString('base64'),
};
await writeFile(new URL('../public/data/earth-land.json', import.meta.url), JSON.stringify(out));
console.log(`${rings.length} rings, land in ${((land / (W * H)) * 100).toFixed(1)}% of cells`);
