/**
 * Brand install + tab icons from `karvita-mark.png`.
 *
 * Tab favicon: maximize width inside the square (wide mark → bigger in 16px tabs).
 * PWA tiles: contain fit so the full mark stays visible on home screens.
 *
 * Run: node scripts/generate-pwa-icons.mjs
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { recolorSilhouetteToBrand } from './brand-mark-color.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'public', 'brand', 'karvita-mark.png');
const outDir = path.join(root, 'public', 'brand');

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

async function brandGlyphFromBuffer(buffer) {
  return recolorSilhouetteToBrand(sharp, buffer);
}

async function compositeCentered(size, glyph, fileName, sharpen = false) {
  let pipeline = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: transparent,
    },
  }).composite([{ input: glyph, gravity: 'centre' }]);

  if (sharpen) {
    pipeline = pipeline.sharpen({ sigma: 0.45, m1: 0.5, m2: 0.25 });
  }

  await pipeline.png().toFile(path.join(outDir, fileName));
}

/** Wide mark — scale to nearly full canvas width; height follows aspect ratio. */
async function squareTabIcon(size, fileName, widthRatio = 0.96) {
  const targetWidth = Math.round(size * widthRatio);
  const resized = await sharp(src)
    .resize({ width: targetWidth, fit: 'inside' })
    .ensureAlpha()
    .png()
    .toBuffer();
  const glyph = await brandGlyphFromBuffer(resized);
  await compositeCentered(size, glyph, fileName, true);
}

async function squareTransparentIcon(size, fileName, fillRatio) {
  const inner = Math.round(size * fillRatio);
  const resized = await sharp(src)
    .resize(inner, inner, {
      fit: 'contain',
      background: transparent,
    })
    .ensureAlpha()
    .png()
    .toBuffer();
  const glyph = await brandGlyphFromBuffer(resized);
  await compositeCentered(size, glyph, fileName, false);
}

/** Native tab sizes — crisp at 16px / 20px chrome without blurry downscale. */
await squareTabIcon(32, 'favicon-32.png', 0.96);
await squareTabIcon(48, 'favicon-48.png', 0.96);
await squareTabIcon(64, 'favicon.png', 0.96);
await squareTransparentIcon(192, 'pwa-icon-192.png', 0.9);
await squareTransparentIcon(512, 'pwa-icon-512.png', 0.9);
await squareTransparentIcon(180, 'apple-touch-icon.png', 0.9);
/** Maskable safe zone ≈ 80% — mark slightly inset for Android adaptive icons. */
await squareTransparentIcon(512, 'pwa-icon-512-maskable.png', 0.74);

console.log('Wrote favicon + PWA icons under public/brand/');
