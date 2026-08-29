/**
 * Opaque PWA / Apple home-screen tiles (white canvas required).
 * Tab favicon is `public/brand/karvita-mark.png`.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'public', 'brand', 'karvita-mark.png');
const outDir = path.join(root, 'public', 'brand');

const white = { r: 255, g: 255, b: 255, alpha: 1 };

async function squareIcon(size, fileName) {
  await sharp(src)
    .resize(size, size, { fit: 'contain', background: white })
    .flatten({ background: white })
    .png()
    .toFile(path.join(outDir, fileName));
}

async function maskable512() {
  const inner = 410;
  const canvas = 512;
  const padded = await sharp(src)
    .resize(inner, inner, { fit: 'contain', background: white })
    .flatten({ background: white })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 3,
      background: white,
    },
  })
    .composite([
      {
        input: padded,
        left: Math.round((canvas - inner) / 2),
        top: Math.round((canvas - inner) / 2),
      },
    ])
    .png()
    .toFile(path.join(outDir, 'pwa-icon-512-maskable.png'));
}

await squareIcon(192, 'pwa-icon-192.png');
await squareIcon(512, 'pwa-icon-512.png');
await squareIcon(180, 'apple-touch-icon.png');
await maskable512();

console.log('Wrote PWA icons under public/brand/');
