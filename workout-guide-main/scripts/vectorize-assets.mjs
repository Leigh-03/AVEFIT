import { dirname, resolve } from 'node:path';

import { findPngs, vectorizePng } from './lib/vectorize-png.mjs';

const projectRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const assetsRoot = resolve(projectRoot, 'packages', 'workout-guide', 'assets');
const pngs = await findPngs(assetsRoot);

for (const [index, png] of pngs.entries()) {
  await vectorizePng(png, png.replace(/\.png$/i, '.svg'));
  if ((index + 1) % 100 === 0) console.log(`Vectorized ${index + 1}/${pngs.length} frames.`);
}

console.log(`Vectorized ${pngs.length} transparent PNG frames as SVGs.`);
