/**
 * Elongate the «ک» keshideh (horizontal connector) on karvita-wordmark.png.
 * Inserts extra width in the low connector between kaf stem and alef — does
 * not fatten the kaf stem itself.
 * Run: node scripts/stretch-wordmark-kaf.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'public/brand/karvita-wordmark.png');
/** Extra pixels of horizontal bar (source resolution ~1200px) */
const EXTRA_PX = 48;

async function main() {
  const srcDataUri = `data:image/png;base64,${fs.readFileSync(FILE).toString('base64')}`;
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

  const colInk = (x) => {
    let n = 0;
    for (let y = 0; y < h; y++) if (d[(y * w + x) * 4 + 3] > 32) n++;
    return n;
  };

  let minX = w, maxX = 0;
  for (let x = 0; x < w; x++) {
    if (colInk(x) > 0) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }

  const tallThresh = h * 0.42;
  // Rightmost tall run = kaf stem
  let stemR = -1;
  for (let x = maxX; x >= minX; x--) {
    if (colInk(x) >= tallThresh) { stemR = x; break; }
  }
  if (stemR < 0) throw new Error('kaf stem not found');
  let stemL = stemR;
  for (let x = stemR; x >= minX; x--) {
    if (colInk(x) < tallThresh * 0.5) break;
    stemL = x;
  }
  // Walk left: connector (short columns), then alef (tall again)
  let connR = stemL - 1;
  let connL = connR;
  for (let x = stemL - 1; x >= minX; x--) {
    if (colInk(x) >= tallThresh) break;
    connL = x;
  }
  if (connR - connL < 2) {
    // Fallback: insert just left of stem
    connL = Math.max(minX, stemL - 8);
    connR = stemL - 1;
  }

  const mid = Math.round((connL + connR) / 2);
  const sliceW = Math.min(6, Math.max(2, connR - connL));
  const sliceL = Math.max(connL, mid - Math.floor(sliceW / 2));
  const extra = ${EXTRA_PX};

  const outW = w + extra;
  const out = document.createElement('canvas');
  out.width = outW;
  out.height = h;
  const octx = out.getContext('2d');

  // Everything left of insert point
  octx.drawImage(c, 0, 0, sliceL, h, 0, 0, sliceL, h);
  // Stretched connector slice
  octx.imageSmoothingEnabled = true;
  octx.drawImage(c, sliceL, 0, sliceW, h, sliceL, 0, sliceW + extra, h);
  // Rest (including kaf stem)
  const restSrc = sliceL + sliceW;
  const restW = w - restSrc;
  octx.drawImage(c, restSrc, 0, restW, h, sliceL + sliceW + extra, 0, restW, h);

  const od = octx.getImageData(0, 0, outW, h);
  const p = od.data;
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] > 40) {
      p[i] = 0; p[i + 1] = 0; p[i + 2] = 0; p[i + 3] = 255;
    } else {
      p[i] = 0; p[i + 1] = 0; p[i + 2] = 0; p[i + 3] = 0;
    }
  }
  octx.putImageData(od, 0, 0);

  window.__url = out.toDataURL('image/png');
  window.__meta = { w: outW, h, stemL, stemR, connL, connR, sliceL, sliceW, extra };
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
  fs.writeFileSync(FILE, Buffer.from(dataUrl.split(',')[1], 'base64'));
  console.log('Kaf keshideh elongated', FILE, meta);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
