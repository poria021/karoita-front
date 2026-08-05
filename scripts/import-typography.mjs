/**
 * Import public/Typography.png → public/brand/karvita-wordmark.png (mask).
 * Drop Typography.png in public/, then: node scripts/import-typography.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public/Typography.png');
const OUT_DIR = path.join(ROOT, 'public/brand');
const OUT = path.join(OUT_DIR, 'karvita-wordmark.png');

async function main() {
  if (!fs.existsSync(SRC)) throw new Error(`Missing ${SRC}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const srcDataUri = `data:image/png;base64,${fs.readFileSync(SRC).toString('base64')}`;

  const html = `<!DOCTYPE html><html><body><script>
(async () => {
  const img = new Image();
  img.src = ${JSON.stringify(srcDataUri)};
  await img.decode();
  const w = img.naturalWidth, h = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h);
  const d = data.data;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
      const a = d[i + 3];
      // Gray/mid ink on dark canvas (or dark ink on light) → opaque black mask
      const isInk = a > 20 && lum >= 25 && lum <= 230;
      if (isInk) {
        d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 255;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      } else {
        d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 0;
      }
    }
  }
  if (maxX < minX) throw new Error('No ink found in Typography.png');
  ctx.putImageData(data, 0, 0);
  const pad = 4;
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const outC = document.createElement('canvas');
  outC.width = cw + pad * 2;
  outC.height = ch + pad * 2;
  outC.getContext('2d').drawImage(c, minX, minY, cw, ch, pad, pad, cw, ch);
  window.__url = outC.toDataURL('image/png');
  window.__meta = { w: outC.width, h: outC.height };
  document.documentElement.dataset.ready = '1';
})().catch((e) => {
  document.documentElement.dataset.err = String(e && e.message ? e.message : e);
});
</script></body></html>`;

  const chromePath =
    process.env.CHROME_PATH ||
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForFunction(
    () =>
      document.documentElement.dataset.ready === '1' ||
      Boolean(document.documentElement.dataset.err),
    { timeout: 60000 }
  );
  const err = await page.evaluate(() => document.documentElement.dataset.err);
  if (err) throw new Error(err);
  const meta = await page.evaluate(() => window.__meta);
  const dataUrl = await page.evaluate(() => window.__url);
  fs.writeFileSync(OUT, Buffer.from(dataUrl.split(',')[1], 'base64'));
  fs.unlinkSync(SRC);
  console.log('Wrote', OUT, meta, '(removed public/Typography.png)');
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
