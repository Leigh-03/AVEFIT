import { readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

import potrace from 'potrace';
import sharp from 'sharp';
import { optimize } from 'svgo';

const TRACE_OPTIONS = {
  alphaMax: 1,
  background: potrace.Potrace.COLOR_TRANSPARENT,
  color: '#fff',
  optCurve: true,
  optTolerance: 0.2,
  threshold: 128,
  turdSize: 0,
};

function traceMask(mask) {
  return new Promise((resolve, reject) => {
    const tracer = new potrace.Potrace(TRACE_OPTIONS);
    tracer.loadImage(mask, (error) => {
      if (error) reject(error);
      else resolve(tracer.getSVG());
    });
  });
}

export async function vectorizePng(inputPath, outputPath) {
  const metadata = await sharp(inputPath).metadata();
  if (!metadata.hasAlpha) {
    throw new Error(`${inputPath} must have an alpha channel to be vectorized.`);
  }

  const alphaMask = await sharp(await readFile(inputPath))
    .ensureAlpha()
    .extractChannel('alpha')
    .negate()
    .png()
    .toBuffer();
  const svg = await traceMask(alphaMask);
  const optimized = optimize(svg, {
    multipass: true,
    path: outputPath,
  });
  await writeFile(outputPath, `${optimized.data}\n`);
}

export async function findPngs(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await findPngs(path));
    else if (entry.isFile() && extname(entry.name).toLowerCase() === '.png') paths.push(path);
  }
  return paths.sort();
}
