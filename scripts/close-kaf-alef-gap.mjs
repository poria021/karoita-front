/**
 * Close the gap between «ک» and «ا» on karvita-wordmark.png
 * (keep spacing further left: ا|ر|و).
 * Run: node scripts/close-kaf-alef-gap.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'public/brand/karvita-wordmark.png');
/** Leave this many transparent px between kaf and alef (0 = fully joined) */
const KEEP_GAP = 0;

async function main() {
  const srcDataUri = `data:image/png;base64,${fs.readFileSync(FILE).toString('base64')}`;
  const html = `<!DOCTYPE html><html><body><script>
(async () => {
  const img = new Image();
  img.src = ${JSON.stringify(srcDataUri)};
  await img.decode();
  const w = img.naturalWidth, h = img.naturalHeight;
  const keep = ${KEEP_GAP};
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

  // Find fully empty column runs (gaps we inserted). Rightmost gap in the
  // right third is the ک|ا separation.
  const gaps = [];
  let i = minX;
  while (i <= maxX) {
    if (colInk(i) === 0) {
      const start = i;
      while (i <= maxX && colInk(i) === 0) i++;
      const end = i - 1;
      if (end - start + 1 >= 8) gaps.push({ start, end, w: end - start + 1 });
    } else i++;
  }

  const rightThird = minX + (maxX - minX) * 0.55;
  const kafAlefGaps = gaps.filter((g) => g.start >= rightThird);
  if (!kafAlefGaps.length) throw new Error('No ک|ا gap found');
  // Rightmost empty run among candidates
  const gap = kafAlefGaps.sort((a, b) => b.start - a.start)[0];

  const remove = Math.max(0, gap.w - keep);
  if (remove === 0) {
    window.__url = c.toDataURL('image/png');
    window.__meta = { skipped: true, gap };
    document.documentElement.dataset.ready = '1';
    return;
  }

  const outW = w - remove;
  const out = document.createElement('canvas');
  out.width = outW;
  out.height = h;
  const octx = out.getContext('2d');
  // left part through gap.start + keep
  const leftW = gap.start + keep;
  octx.drawImage(c, 0, 0, leftW, h, 0, 0, leftW, h);
  // skip remove columns, draw rest
  const srcRest = gap.start + keep + remove;
  const restW = w - srcRest;
  if (restW > 0) octx.drawImage(c, srcRest, 0, restW, h, leftW, 0, restW, h);

  const od = octx.getImageData(0, 0, outW, h);
  const p = od.data;
  for (let j = 0; j < p.length; j += 4) {
    if (p[j + 3] > 40) {
      p[j] = 0; p[j + 1] = 0; p[j + 2] = 0; p[j + 3] = 255;
    } else {
      p[j] = 0; p[j + 1] = 0; p[j + 2] = 0; p[j + 3] = 0;
    }
  }
  octx.putImageData(od, 0, 0);

  window.__url = out.toDataURL('image/png');
  window.__meta = { w: outW, h, gap, remove, keep, allGaps: gaps };
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
  console.log('Closed ک|ا gap', meta);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
