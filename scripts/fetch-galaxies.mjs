// Fetches a real slice of the universe for Chapter 3: every galaxy with a
// good spectroscopic redshift in a thin band along the celestial equator,
// from the Sloan Digital Sky Survey, and places each one in 3D around us.
//
//   node scripts/fetch-galaxies.mjs
//
// Distance comes from redshift through a flat ΛCDM cosmology (Planck 2018:
// H0 = 67.7 km/s/Mpc, Ωm = 0.31), as comoving distance in megaparsecs. The
// output is Int16 positions in units of 0.05 Mpc, base64 in JSON, so 60,000
// galaxies come to about half a megabyte.
//
// SDSS data are public; credit "Funding for SDSS has been provided by the
// Alfred P. Sloan Foundation..." (https://www.sdss4.org/collaboration/citing-sdss/).

import { writeFile } from 'node:fs/promises';

const DEC = 3; // half-width of the band, degrees
const Z_MIN = 0.005;
const Z_MAX = 0.2;
const sql = `SELECT ra, dec, z FROM SpecObj WHERE class = 'GALAXY' AND zWarning = 0 AND z BETWEEN ${Z_MIN} AND ${Z_MAX} AND dec BETWEEN ${-DEC} AND ${DEC}`;
const url = `https://skyserver.sdss.org/dr17/SkyServerWS/SearchTools/SqlSearch?format=csv&cmd=${encodeURIComponent(sql)}`;
const csv = await (await fetch(url, { headers: { 'user-agent': 'what-we-cant-see/0.1 (data fetch)' } })).text();
const rows = csv
  .split('\n')
  .slice(2)
  .map((l) => l.split(',').map(Number))
  .filter((r) => r.length === 3 && r.every(Number.isFinite));
if (rows.length < 1000) throw new Error(`Only ${rows.length} rows came back:\n${csv.slice(0, 400)}`);

// Comoving distance, by trapezoid integration of c/H(z).
const C = 299_792.458, H0 = 67.7, OM = 0.31;
const E = (z) => Math.sqrt(OM * (1 + z) ** 3 + (1 - OM));
const table = [0];
const DZ = 1e-4;
for (let z = DZ; z <= Z_MAX + DZ; z += DZ) table.push(table.at(-1) + (DZ * (1 / E(z - DZ) + 1 / E(z))) / 2);
const dc = (z) => (C / H0) * table[Math.round(z / DZ)];

const UNIT = 0.05;
const pos = new Int16Array(rows.length * 3);
let far = 0;
rows.forEach(([ra, dec, z], i) => {
  const d = dc(z);
  far = Math.max(far, d);
  const a = (ra * Math.PI) / 180, b = (dec * Math.PI) / 180;
  // y is up, toward the celestial north pole; the band lies in the x–z plane.
  pos[i * 3] = Math.round((d * Math.cos(b) * Math.cos(a)) / UNIT);
  pos[i * 3 + 1] = Math.round((d * Math.sin(b)) / UNIT);
  pos[i * 3 + 2] = Math.round((d * Math.cos(b) * Math.sin(a)) / UNIT);
});

const out = {
  source: 'Sloan Digital Sky Survey DR17, SpecObj, via SkyServer',
  query: sql,
  retrieved: new Date().toISOString().slice(0, 10),
  cosmology: { H0, Om: OM, note: 'flat ΛCDM, comoving distance' },
  count: rows.length,
  farthestMpc: Math.round(far),
  unitMpc: UNIT,
  positions: Buffer.from(pos.buffer).toString('base64'),
};
await writeFile(new URL('../public/data/galaxies-sdss.json', import.meta.url), JSON.stringify(out));
console.log(`${rows.length} galaxies, out to ${Math.round(far)} Mpc`);
