// Holds the script to account before a build: every line short enough for a
// general audience, every claim pointing at a real source, every figure in
// the ledger used. Timing needs no check, since chapters.ts derives each
// line's time from its length.
//
//   node scripts/check-script.mjs

import { CHAPTERS, MAX_WORDS, words, readTime } from '../src/content/chapters.ts';
import { SOURCES } from '../src/content/sources.ts';
import { METERS } from '../src/content/extras.ts';

const ids = new Set(SOURCES.map((s) => s.id));
const used = new Set();
const problems = [];

for (const c of CHAPTERS) {
  c.beats.forEach((b, i) => {
    const where = `${c.id}, line ${i + 1}`;
    if (i > 0 && words(b.text) > MAX_WORDS) problems.push(`${where}: ${words(b.text)} words, over ${MAX_WORDS}: “${b.text}”`);
    if (i > 0 && b.dur < readTime(b.text)) problems.push(`${where}: ${b.dur}s on screen, needs ${readTime(b.text)}s`);
    if (b.kind && !b.sources?.length) problems.push(`${where}: tagged ${b.kind} with no source`);
    if (b.sources?.length && !b.kind) problems.push(`${where}: has sources but no kind`);
  });
  for (const id of c.sources) {
    used.add(id);
    if (!ids.has(id)) problems.push(`${c.id}: unknown source “${id}”`);
  }
}
for (const x of METERS)
  for (const id of x.sources) {
    used.add(id);
    if (!ids.has(id)) problems.push(`${x.id}: unknown source “${id}”`);
  }
for (const id of ids) if (!used.has(id)) problems.push(`source “${id}” is in the ledger but nothing uses it`);

if (problems.length) {
  console.error(`Script check failed:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`Script check: ${CHAPTERS.reduce((n, c) => n + c.beats.length, 0)} lines, ${used.size} sources, all within ${MAX_WORDS} words.`);
