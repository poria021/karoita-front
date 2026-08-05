/**
 * Strip white bg from nuqta sources → cropped monochrome transparent PNGs.
 * Run: node scripts/generate-karvita-nuqta.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const JOBS = [
  {
    src: path.join(ROOT, 'public/brand/karvita-nuqta.source.png'),
    out: path.join(ROOT, 'public/brand/karvita-nuqta.png'),
  },
  {
    src: path.join(ROOT, 'public/brand/karvita-nuqta-te.source.png'),
    out: path.join(ROOT, 'public/brand/karvita-nuqta-te.png'),
  },
];

async function processOne(page, src, out) {
  if (!fs.existsSync(src)) throw new Error(`Missing ${src}`);
  const srcDataUri = `data:image/png;base64,${fs.readFileSync(src).toString('base64')}`;

  await page.setContent(
    `<!DOCTYPE html><html><body style="margin:0;background:transparent">
<script>
(async () => {
  const img = new Image();
  img.src = ${JSON.stringify('__SRC__')};
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
      const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const isNearWhite = max > 235 && min > 220;
      const isInk = a > 40 && !isNearWhite;
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
  ctx.putImageData(data, 0, 0);
  const pad = 2;
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const out = document.createElement('canvas');
  out.width = cw + pad * 2;
  out.height = ch + pad * 2;
  out.getContext('2d').drawImage(c, minX, minY, cw, ch, pad, pad, cw, ch);
  window.__url = out.toDataURL('image/png');
  document.documentElement.dataset.ready = '1';
})();
</script></body></html>`.replace(
      JSON.stringify('__SRC__'),
      JSON.stringify(srcDataUri)
    ),
    { waitUntil: 'load' }
  );

  await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
  const dataUrl = await page.evaluate(() => window.__url);
  const png = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync(out, png);
  console.log('Wrote', out, png.length, 'bytes');
}

async function main() {
  const chromePath =
    process.env.CHROME_PATH ||
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });
  const page = await browser.newPage();
  for (const job of JOBS) {
    await processOne(page, job.src, job.out);
  }
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
