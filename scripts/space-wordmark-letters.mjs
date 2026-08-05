/**
 * Add slight gaps between ک، ا، ر، و on karvita-wordmark.png.
 * Run: node scripts/space-wordmark-letters.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'public/brand/karvita-wordmark.png');
const GAP = 32;

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
  const gap = ${GAP};

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

  const tall = h * 0.42;
  const series = [];
  for (let x = minX; x <= maxX; x++) series.push(colInk(x));

  // Smooth ink profile
  const sm = series.map((_, i) => {
    let s = 0, n = 0;
    for (let k = -3; k <= 3; k++) {
      const j = i + k;
      if (j >= 0 && j < series.length) { s += series[j]; n++; }
    }
    return s / n;
  });

  // Find local minima (valleys) in the right half (ک ا ر و zone)
  const rightZoneStart = Math.round(minX + (maxX - minX) * 0.42);
  const valleys = [];
  for (let i = 4; i < sm.length - 4; i++) {
    const x = minX + i;
    if (x < rightZoneStart) continue;
    const v = sm[i];
    if (v < sm[i - 1] && v <= sm[i + 1] && v < tall * 0.55) {
      valleys.push({ x, n: v, i });
    }
  }

  // Pick 3 valleys for: re|vav, alef|re, kaf|alef — from left-of-zone toward right
  // Cluster: keep valleys separated by >= 20px, take deepest in each cluster, then
  // take the 3 rightmost clusters in the ک/ر/و area.
  valleys.sort((a, b) => a.x - b.x);
  const clusters = [];
  for (const v of valleys) {
    const last = clusters[clusters.length - 1];
    if (!last || v.x - last.x > 22) clusters.push(v);
    else if (v.n < last.n) {
      clusters[clusters.length - 1] = v;
    }
  }
  // Rightmost part of word: last ~3 clusters before kaf stem end
  const picked = clusters.slice(-3);
  if (picked.length < 2) {
    // Fallback fixed fractions of right content
    const cw = maxX - minX;
    picked.length = 0;
    picked.push(
      { x: Math.round(maxX - cw * 0.22) },
      { x: Math.round(maxX - cw * 0.14) },
      { x: Math.round(maxX - cw * 0.08) }
    );
  }

  const inserts = picked
    .map((p) => p.x)
    .filter((x, i, arr) => arr.indexOf(x) === i)
    .sort((a, b) => a - b);

  const outW = w + inserts.length * gap;
  const out = document.createElement('canvas');
  out.width = outW;
  out.height = h;
  const octx = out.getContext('2d');

  let srcCursor = 0;
  let dstCursor = 0;
  for (const split of inserts) {
    const chunkW = split - srcCursor;
    if (chunkW > 0) {
      octx.drawImage(c, srcCursor, 0, chunkW, h, dstCursor, 0, chunkW, h);
      dstCursor += chunkW;
    }
    dstCursor += gap;
    srcCursor = split;
  }
  const restW = w - srcCursor;
  if (restW > 0) octx.drawImage(c, srcCursor, 0, restW, h, dstCursor, 0, restW, h);

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
  window.__meta = { w: outW, h, inserts, gap, clusters: clusters.slice(-5) };
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
  console.log('Spaced letters', meta);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
