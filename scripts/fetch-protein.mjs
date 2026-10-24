// Fetches one AlphaFold DB prediction and reduces it to what the experience
// draws: the alpha-carbon of each residue and its pLDDT confidence, which
// AlphaFold writes into the B-factor column of its PDB files.
//
//   node scripts/fetch-protein.mjs [UNIPROT]     (default P04637, human p53)
//
// AlphaFold DB content is CC BY 4.0 (EMBL-EBI / Google DeepMind). The output
// carries its own attribution so the file never travels without it.

import { writeFile } from 'node:fs/promises';

const headers = { 'user-agent': 'what-we-cant-see/0.1 (data fetch)' };
const accession = process.argv[2] ?? 'P04637';
const meta = (await (await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${accession}`, { headers })).json())[0];
const pdb = await (await fetch(meta.pdbUrl, { headers })).text();

const residues = [];
for (const line of pdb.split('\n')) {
  if (!line.startsWith('ATOM') || line.slice(12, 16).trim() !== 'CA') continue;
  residues.push([
    +line.slice(30, 38), +line.slice(38, 46), +line.slice(46, 54), // x y z in Å
    +line.slice(60, 66),                                           // pLDDT
  ]);
}

const out = {
  accession,
  entryId: meta.entryId,
  name: meta.uniprotDescription,
  gene: meta.gene,
  modelVersion: meta.latestVersion,
  modelCreatedDate: meta.modelCreatedDate,
  source: meta.pdbUrl,
  retrieved: new Date().toISOString().slice(0, 10),
  license: 'CC BY 4.0, AlphaFold DB (EMBL-EBI and Google DeepMind)',
  units: 'x, y, z in angstroms; pLDDT 0-100',
  residues,
};
await writeFile(new URL(`../public/data/protein-${accession}.json`, import.meta.url), JSON.stringify(out));
console.log(`${out.entryId} v${out.modelVersion}: ${residues.length} residues`);
