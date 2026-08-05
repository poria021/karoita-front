/**
 * Physically weld «ک» horizontal bar into «ا» on the wordmark mask.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'public/brand/karvita-wordmark.png');

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
  const image = ctx.getImageData(0, 0, w, h);
  const d = image.data;

  const alpha = (x, y) => d[(y * w + x) * 4 + 3];
  const setInk = (x, y) => {
    const i = (y * w + x) * 4;
    d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = 255;
  };
  const colInk = (x) => {
    let n = 0;
    for (let y = 0; y < h; y++) if (alpha(x, y) > 32) n++;
    return n;
  };
  const isTall = (x) => colInk(x) >= h * 0.42;

  let minX = w, maxX = 0;
  for (let x = 0; x < w; x++) if (colInk(x) > 0) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  }

  // kaf stem = rightmost tall run
  let stemR = maxX;
  for (let x = maxX; x >= minX; x--) if (isTall(x)) { stemR = x; break; }
  let stemL = stemR;
  for (let x = stemR; x >= minX; x--) {
    if (!isTall(x)) break;
    stemL = x;
  }

  // alef = next tall run left of kaf body (skip short connector columns)
  let alefR = null;
  for (let x = stemL - 1; x >= minX; x--) {
    if (isTall(x)) { alefR = x; break; }
  }
  if (alefR == null) throw new Error('alef not found');
  let alefL = alefR;
  for (let x = alefR; x >= minX; x--) {
    if (!isTall(x)) break;
    alefL = x;
  }

  // Measure kaf bar thickness from a column just left of stem
  const sampleX = Math.max(alefR + 2, stemL - 20);
  let barTop = h, barBot = 0, hits = 0;
  // Prefer lower half ink (baseline bar, not sarkesh)
  const y0 = Math.floor(h * 0.45);
  for (let x = sampleX; x < stemL; x++) {
    for (let y = y0; y < h; y++) {
      if (alpha(x, y) > 32) {
        hits++;
        if (y < barTop) barTop = y;
        if (y > barBot) barBot = y;
      }
    }
  }
  if (!hits) {
    barTop = Math.floor(h * 0.62);
    barBot = Math.floor(h * 0.78);
  }
  // Slightly thicken bar for a solid weld
  const pad = 2;
  barTop = Math.max(0, barTop - pad);
  barBot = Math.min(h - 1, barBot + pad);

  // Remove any fully empty columns between alef and kaf bar
  const emptyCols = [];
  for (let x = alefR + 1; x < stemL; x++) {
    if (colInk(x) === 0) emptyCols.push(x);
  }

  // First: fill weld rectangle from alefR into kaf bar (even across empty)
  // Extend from inside alef (alefR - 2) to inside kaf connector
  const weldL = Math.max(alefL, alefR - 4);
  const weldR = Math.min(stemL + 4, stemR);
  for (let x = weldL; x <= weldR; x++) {
    for (let y = barTop; y <= barBot; y++) setInk(x, y);
  }

  ctx.putImageData(image, 0, 0);

  // If empty columns exist, collapse them after welding (optional — weld already fills)
  // Collapse empty run(s) between alef and stem so letters sit flush
  let outC = c;
  let outW = w;
  if (emptyCols.length) {
    // merge contiguous empties into ranges, remove all between alef and stem
    const removeRanges = [];
    let s = emptyCols[0], prev = emptyCols[0];
    for (let i = 1; i < emptyCols.length; i++) {
      if (emptyCols[i] === prev + 1) prev = emptyCols[i];
      else {
        removeRanges.push([s, prev]);
        s = prev = emptyCols[i];
      }
    }
    removeRanges.push([s, prev]);

    // remove right-to-left
    let cur = document.createElement('canvas');
    cur.width = w; cur.height = h;
    cur.getContext('2d').drawImage(c, 0, 0);
    let curW = w;
    for (const [rs, re] of removeRanges.sort((a, b) => b[0] - a[0])) {
      const remove = re - rs + 1;
      const next = document.createElement('canvas');
      next.width = curW - remove;
      next.height = h;
      const nctx = next.getContext('2d');
      nctx.drawImage(cur, 0, 0, rs, h, 0, 0, rs, h);
      const rest = curW - (re + 1);
      if (rest > 0) nctx.drawImage(cur, re + 1, 0, rest, h, rs, 0, rest, h);
      // re-weld across seam
      const nd = nctx.getImageData(0, 0, next.width, h);
      const p = nd.data;
      for (let x = Math.max(0, rs - 4); x <= Math.min(next.width - 1, rs + 4); x++) {
        for (let y = barTop; y <= barBot; y++) {
          const i = (y * next.width + x) * 4;
          p[i] = 0; p[i + 1] = 0; p[i + 2] = 0; p[i + 3] = 255;
        }
      }
      nctx.putImageData(nd, 0, 0);
      cur = next;
      curW = next.width;
    }
    outC = cur;
    outW = curW;
  }

  // binarize
  const final = outC.getContext('2d').getImageData(0, 0, outW, h);
  const p = final.data;
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] > 40) {
      p[i] = 0; p[i + 1] = 0; p[i + 2] = 0; p[i + 3] = 255;
    } else {
      p[i] = 0; p[i + 1] = 0; p[i + 2] = 0; p[i + 3] = 0;
    }
  }
  outC.getContext('2d').putImageData(final, 0, 0);

  window.__url = outC.toDataURL('image/png');
  window.__meta = {
    outW, h, alefL, alefR, stemL, stemR, barTop, barBot,
    emptyCols: emptyCols.length, weldL, weldR,
  };

  const prev = document.createElement('canvas');
  prev.width = outW; prev.height = h;
  const pctx = prev.getContext('2d');
  pctx.fillStyle = '#fff';
  pctx.fillRect(0, 0, outW, h);
  pctx.drawImage(outC, 0, 0);
  window.__preview = prev.toDataURL('image/png');
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
  const preview = await page.evaluate(() => window.__preview);
  fs.writeFileSync(FILE, Buffer.from(dataUrl.split(',')[1], 'base64'));
  fs.writeFileSync(
    path.join(ROOT, 'public/brand/_join-preview.png'),
    Buffer.from(preview.split(',')[1], 'base64')
  );
  console.log(meta);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
