/**
 * Brand install + tab icons from `karvita-mark.png`.
 * Square canvas, `contain` fit — wide mark keeps its natural aspect ratio.
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

async function squareTransparentIcon(size, fileName, fillRatio) {
  const inner = Math.round(size * fillRatio);
  const resized = await sharp(src)
    .resize(inner, inner, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
  const glyph = await recolorSilhouetteToBrand(sharp, resized);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: glyph, gravity: 'centre' }])
    .png()
    .toFile(path.join(outDir, fileName));
}

/** Tab favicon — small square; browsers scale down without squashing the mark. */
await squareTransparentIcon(64, 'favicon.png', 0.88);
await squareTransparentIcon(192, 'pwa-icon-192.png', 0.88);
await squareTransparentIcon(512, 'pwa-icon-512.png', 0.88);
await squareTransparentIcon(180, 'apple-touch-icon.png', 0.88);
/** Maskable safe zone ≈ 80% — mark slightly inset for Android adaptive icons. */
await squareTransparentIcon(512, 'pwa-icon-512-maskable.png', 0.72);

console.log('Wrote favicon + PWA icons under public/brand/');
