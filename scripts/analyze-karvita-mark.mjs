/**
 * Pixel stats for brand mark PNGs.
 * Run: node scripts/analyze-karvita-mark.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function analyze(page, filePath) {
  const b64 = fs.readFileSync(filePath).toString('base64');
  return page.evaluate(async (payload) => {
    const img = new Image();
    img.src = `data:image/png;base64,${payload}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    let ink = 0;
    let clear = 0;
    let white = 0;
    let minX = c.width;
    let minY = c.height;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        const a = d[i + 3];
        if (a < 20) {
          clear++;
          continue;
        }
        if (d[i] > 230 && d[i + 1] > 230 && d[i + 2] > 230) {
          white++;
        } else {
          ink++;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    return {
      w: c.width,
      h: c.height,
      ink,
      clear,
      white,
      bbox: ink ? { minX, minY, maxX, maxY } : null,
    };
  }, b64);
}

const chromePath =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
});
const page = await browser.newPage();
await page.setContent('<html></html>');
console.log(
  'source',
  await analyze(page, path.join(ROOT, 'public/brand/karvita-mark.source.png'))
);
console.log(
  'mask',
  await analyze(page, path.join(ROOT, 'public/brand/karvita-mark.png'))
);
await browser.close();
