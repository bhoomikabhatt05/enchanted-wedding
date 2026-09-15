/**
 * One-time asset optimization pass.
 *
 * Reads the originals in `public/assets/`, writes optimized `.webp`
 * derivatives next to them (same folder structure, so `/assets/...`
 * paths are unchanged on Vercel). Originals are never modified.
 *
 * - Resizes to the per-file target width (fit: inside, no upscaling).
 * - Quality 82 for photographs, 85 for illustrations/line-art.
 * - WebP preserves the alpha channel for the transparent PNGs.
 *
 * Run: node scripts/optimize-assets.mjs
 */
import { mkdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import sharp from "sharp";

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets");

const TARGETS = {
  "couple/couple-main.jpg": { width: 1920, quality: 82 },
  "couple/couple-formal.jpg": { width: 1920, quality: 82 },
  "couple/couple-lake.jpg": { width: 1920, quality: 82 },
  "couple/couple-lights.jpg": { width: 1920, quality: 82 },
  "couple/first-meeting.jpg": { width: 1600, quality: 82 },
  "couple/first-walk.jpg": { width: 1600, quality: 82 },
  "couple/cafe-memory.jpg": { width: 1200, quality: 82 },
  "couple/dinner-memory.jpg": { width: 1200, quality: 82 },
  "couple/memory-ceremony.jpg": { width: 1200, quality: 82 },
  "events/wedding-venue.jpg": { width: 1920, quality: 82 },
  "events/wedding-ceremony.jpg": { width: 1920, quality: 82 },
  "events/wedding-reception.jpg": { width: 1920, quality: 82 },
  "events/couple-wedding.jpg": { width: 1920, quality: 82 },
  "illustrations/celestial-star-chart.png": { width: 1920, quality: 85 },
  "illustrations/couple-storybook.png": { width: 1600, quality: 85 },
  "illustrations/magical-map.png": { width: 1600, quality: 85 },
  "illustrations/celestial-ornament.png": { width: 800, quality: 85 },
};

const log = [];
let originalTotal = 0;
let optimizedTotal = 0;

for (const [rel, { width, quality }] of Object.entries(TARGETS)) {
  const input = join(PUBLIC, rel);
  const output = input.replace(/\.(jpe?g|png)$/i, ".webp");

  const meta = await sharp(input).metadata();
  const original = await stat(input);
  originalTotal += original.size;

  await mkdir(dirname(output), { recursive: true });
  await sharp(input)
    .resize({ width, fit: "inside", withoutEnlargement: true })
    .webp({ quality, alphaQuality: 100 })
    .toFile(output);

  const optimized = await stat(output);
  optimizedTotal += optimized.size;

  log.push(
    `${rel}  ${meta.width}x${meta.height}  alpha=${Boolean(meta.hasAlpha)}  ` +
      `${(original.size / 1024).toFixed(0)}KB -> ${(optimized.size / 1024).toFixed(0)}KB  ` +
      `(-${(100 - (optimized.size / original.size) * 100).toFixed(0)}%)`,
  );
}

console.log(log.join("\n"));
console.log("\n-----------------------------");
console.log(`Original total : ${(originalTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`Optimized total: ${(optimizedTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`Savings        : ${(100 - (optimizedTotal / originalTotal) * 100).toFixed(1)}%`);
console.log(`Files created  : ${log.length}`);