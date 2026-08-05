/**
 * Convert public/Logo-Brand.png → mask-ready mark asset.
 * For wordmark: drop Typography.png in public/ and run import-typography.mjs
 * Run: node scripts/import-brand-assets.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public/brand');

const JOBS = [
  {
    src: path.join(ROOT, 'public/Logo-Brand.png'),
    out: path.join(OUT_DIR, 'karvita-mark.png'),
    sourceOut: path.join(OUT_DIR, 'karvita-mark.source.png'),
  },
];

async function processOne(page, src, out) {
  const srcDataUri = `data:image/png;base64,${fs.readFileSync(src).toString('base64')}`;
  await page.setContent(
    `<!DOCTYPE html><html><body style="margin:0;background:transparent"><script>
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
      const r = d[i], g = d[i+1], b = d[i+2], a = d[i+3];
      const lum = (r + g + b) / 3;
      // Source: dark-gray ink on near-black bg → keep brighter ink, wipe bg
      const isInk = a > 20 && lum > 28;
      if (isInk) {
        d[i]=0; d[i+1]=0; d[i+2]=0; d[i+3]=255;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      } else {
        d[i]=0; d[i+1]=0; d[i+2]=0; d[i+3]=0;
      }
    }
  }
  ctx.putImageData(data, 0, 0);
  const pad = 4;
  const cw = Math.max(1, maxX - minX + 1);
  const ch = Math.max(1, maxY - minY + 1);
  const outC = document.createElement('canvas');
  outC.width = cw + pad * 2;
  outC.height = ch + pad * 2;
  outC.getContext('2d').drawImage(c, minX, minY, cw, ch, pad, pad, cw, ch);
  window.__url = outC.toDataURL('image/png');
  window.__meta = { w: outC.width, h: outC.height };
  document.documentElement.dataset.ready = '1';
})().catch((e) => { document.documentElement.dataset.err = String(e && e.message ? e.message : e); });
</script></body></html>`,
    { waitUntil: 'load' }
  );
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
  const png = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync(out, png);
  return { ...meta, bytes: png.length };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const chromePath =
    process.env.CHROME_PATH ||
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });
  const page = await browser.newPage();

  for (const job of JOBS) {
    if (!fs.existsSync(job.src)) throw new Error(`Missing ${job.src}`);
    fs.copyFileSync(job.src, job.sourceOut);
    const meta = await processOne(page, job.src, job.out);
    console.log('Wrote', job.out, meta);
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
