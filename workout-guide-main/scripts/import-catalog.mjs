import { copyFile, mkdir, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import sharp from 'sharp';
import ts from 'typescript';

import { vectorizePng } from './lib/vectorize-png.mjs';

const projectRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const sourceArgument = process.argv[2];
if (!sourceArgument) {
  throw new Error('Provide the path to a compatible exercise source export.');
}
const sourceRoot = resolve(sourceArgument);
const packageRoot = join(projectRoot, 'packages', 'workout-guide');
const outputAssets = join(packageRoot, 'assets');

const exerciseLibraryPath = join(sourceRoot, 'src', 'lib', 'exercise-library.ts');
const poseAssetsPath = join(sourceRoot, 'src', 'lib', 'exercise-pose-assets.ts');
const sourceAssets = join(sourceRoot, 'assets', 'images', 'exercises');

for (const requiredPath of [exerciseLibraryPath, poseAssetsPath, sourceAssets]) {
  if (!existsSync(requiredPath)) {
    throw new Error(`Exercise source is incomplete: ${requiredPath}`);
  }
}

function extractExerciseDefinitions(source) {
  const marker = 'export const SEEDED_EXERCISES';
  const markerIndex = source.indexOf(marker);
  const start = source.indexOf('[', markerIndex);
  const end = source.indexOf('\n];', start);
  if (markerIndex < 0 || start < 0 || end < 0) {
    throw new Error('Could not locate SEEDED_EXERCISES in the exercise source.');
  }
  return Function(`"use strict"; return (${source.slice(start, end + 2)});`)();
}

async function loadEverkineticAssets(source) {
  const exportable = source.replace(
    'const EXERCISE_POSE_ASSETS_BY_ID:',
    'export const EXERCISE_POSE_ASSETS_BY_ID:',
  );
  const compiled = ts.transpileModule(exportable, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const temporaryModule = join(tmpdir(), `workout-guide-pose-assets-${process.pid}.mjs`);
  await writeFile(temporaryModule, compiled);
  try {
    const loaded = await import(`${pathToFileURL(temporaryModule).href}?v=${Date.now()}`);
    return loaded.EXERCISE_POSE_ASSETS_BY_ID;
  } finally {
    await unlink(temporaryModule).catch(() => {});
  }
}

const exerciseSource = await readFile(exerciseLibraryPath, 'utf8');
const poseSource = await readFile(poseAssetsPath, 'utf8');
const definitions = extractExerciseDefinitions(exerciseSource);
const everkineticAssets = await loadEverkineticAssets(poseSource);

if (definitions.length !== 302) {
  throw new Error(`Expected 302 exercises, found ${definitions.length}.`);
}

if (!outputAssets.startsWith(packageRoot)) {
  throw new Error('Refusing to replace an asset directory outside the package.');
}
await rm(outputAssets, { recursive: true, force: true });
await mkdir(outputAssets, { recursive: true });

let rasterizedFirstFrames = 0;
const manifest = [];

for (const definition of definitions) {
  const slug = definition.id.replace(/^exercise-/, '');
  const destination = join(outputAssets, slug);
  const originalFirstFrame = join(sourceAssets, `${definition.id}.png`);
  const secondFrame = join(sourceAssets, `${definition.id}-frame-2.png`);
  const thirdFrame = join(sourceAssets, `${definition.id}-frame-3.png`);

  if (!existsSync(secondFrame) || !existsSync(thirdFrame)) {
    throw new Error(`Missing animation frames for ${definition.id}.`);
  }

  await mkdir(destination, { recursive: true });
  let sourceAttribution;

  if (existsSync(originalFirstFrame)) {
    await copyFile(originalFirstFrame, join(destination, 'frame-1.png'));
  } else {
    const source = everkineticAssets[definition.id];
    if (!source) {
      throw new Error(`No first-pose source exists for ${definition.id}.`);
    }
    await sharp(Buffer.from(source.xml))
      .resize(464, 464, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .extend({
        top: 24,
        right: 24,
        bottom: 24,
        left: 24,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png({ palette: true, quality: 100, effort: 10, adaptiveFiltering: true })
      .toFile(join(destination, 'frame-1.png'));
    rasterizedFirstFrames += 1;
    sourceAttribution = {
      name: 'Everkinetic',
      url: source.sourceUrl,
      license: 'CC BY-SA 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      changes: 'Rasterized on a transparent 512 × 512 canvas, recolored for monochrome display, and vector-traced.',
    };
  }

  await copyFile(secondFrame, join(destination, 'frame-2.png'));
  await copyFile(thirdFrame, join(destination, 'frame-3.png'));

  for (const index of [1, 2, 3]) {
    await vectorizePng(
      join(destination, `frame-${index}.png`),
      join(destination, `frame-${index}.svg`),
    );
  }

  const baseAttribution = {
    creator: 'Bryl Lim',
    creatorUrl: 'https://bryllim.com',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  };
  const firstFrameAttribution = {
    ...baseAttribution,
    ...(sourceAttribution ? { source: sourceAttribution } : {}),
  };

  manifest.push({
    id: definition.id,
    slug,
    name: definition.name,
    exerciseType: definition.exerciseType,
    equipment: definition.equipment,
    primaryMuscle: definition.primaryMuscle,
    secondaryMuscles: definition.secondaryMuscles,
    isStretch: definition.isStretch === true,
    frames: [1, 2, 3].map((index) => ({
      index,
      path: `assets/${slug}/frame-${index}.svg`,
      width: 512,
      height: 512,
      format: 'svg',
      attribution: index === 1 ? firstFrameAttribution : baseAttribution,
    })),
    attribution: firstFrameAttribution,
  });
}

await writeFile(join(packageRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

for (const filename of ['LICENSE', 'LICENSE-ASSETS', 'LICENSES.md', 'ATTRIBUTION.md']) {
  await copyFile(join(projectRoot, filename), join(packageRoot, filename));
}

console.log(`Imported ${manifest.length} exercises with PNG sources and ${manifest.length * 3} SVG frames.`);
console.log(`Rasterized ${rasterizedFirstFrames} Everkinetic first poses.`);
