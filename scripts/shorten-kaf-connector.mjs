/**
 * Shorten the «ک» keshideh so ک sits flush against ا.
 * Compresses columns between alef and kaf stem.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const FILE = path.join(ROOT, 'public/brand/karvita-wordmark.png');
/** Target width of connector between alef and kaf stem (px) */
const TARGET_CONNECTOR = 8;

async function main() {
  const srcDataUri = `data:image/png;base64,${fs.readFileSync(FILE).toString('base64')}`;
  const html = `<!DOCTYPE html><html><body><script>
(async () => {
  const img = new Image();
  img.src = ${JSON.stringify(srcDataUri)};
  await img.decode();
  const w = img.naturalWidth, h = img.naturalHeight;
  const target = ${TARGET_CONNECTOR};
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, w, h).data;
  const colInk = (x) => {
    let n = 0;
    for (let y = 0; y < h; y++) if (d[(y * w + x) * 4 + 3] > 32) n++;
    return n;
  };
  const isTall = (x) => colInk(x) >= h * 0.42;

  let minX = w, maxX = 0;
  for (let x = 0; x < w; x++) if (colInk(x) > 0) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  }

  let stemR = maxX;
  for (let x = maxX; x >= minX; x--) if (isTall(x)) { stemR = x; break; }
  let stemL = stemR;
  for (let x = stemR; x >= minX; x--) {
    if (!isTall(x)) break;
    stemL = x;
  }
  let alefR = null;
  for (let x = stemL - 1; x >= minX; x--) {
    if (isTall(x)) { alefR = x; break; }
  }
  if (alefR == null) throw new Error('alef not found');

  const connL = alefR + 1;
  const connR = stemL - 1;
  const connW = connR - connL + 1;
  if (connW <= target) {
    window.__url = c.toDataURL('image/png');
    window.__meta = { skipped: true, connW, target };
    document.documentElement.dataset.ready = '1';
    return;
  }

  // Compress connector to target width
  const outW = w - (connW - target);
  const out = document.createElement('canvas');
  out.width = outW; out.height = h;
  const octx = out.getContext('2d');
  octx.imageSmoothingEnabled = true;
  // left through alef
  octx.drawImage(c, 0, 0, connL, h, 0, 0, connL, h);
  // compressed connector
  octx.drawImage(c, connL, 0, connW, h, connL, 0, target, h);
  // kaf stem and right
  const restSrc = stemL;
  const restW = w - restSrc;
  octx.drawImage(c, restSrc, 0, restW, h, connL + target, 0, restW, h);

  // Weld solid bar across seam
  const od = octx.getImageData(0, 0, outW, h);
  const p = od.data;
  // sample bar y from compressed zone
  let barTop = h, barBot = 0, hits = 0;
  const y0 = Math.floor(h * 0.5);
  for (let x = connL; x < connL + target; x++) {
    for (let y = y0; y < h; y++) {
      if (p[(y * outW + x) * 4 + 3] > 32) {
        hits++;
        if (y < barTop) barTop = y;
        if (y > barBot) barBot = y;
      }
    }
  }
  if (!hits) { barTop = Math.floor(h * 0.62); barBot = Math.floor(h * 0.78); }
  for (let x = alefR - 2; x <= connL + target + 4; x++) {
    if (x < 0 || x >= outW) continue;
    for (let y = barTop; y <= barBot; y++) {
      const i = (y * outW + x) * 4;
      p[i] = 0; p[i + 1] = 0; p[i + 2] = 0; p[i + 3] = 255;
    }
  }
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] > 40) {
      p[i] = 0; p[i + 1] = 0; p[i + 2] = 0; p[i + 3] = 255;
    } else {
      p[i] = 0; p[i + 1] = 0; p[i + 2] = 0; p[i + 3] = 0;
    }
  }
  octx.putImageData(od, 0, 0);

  window.__url = out.toDataURL('image/png');
  window.__meta = { outW, h, alefR, stemL, connW, target, removed: connW - target };
  const prev = document.createElement('canvas');
  prev.width = outW; prev.height = h;
  const pctx = prev.getContext('2d');
  pctx.fillStyle = '#fff';
  pctx.fillRect(0, 0, outW, h);
  pctx.drawImage(out, 0, 0);
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
  if (preview) {
    fs.writeFileSync(
      path.join(ROOT, 'public/brand/_join-preview.png'),
      Buffer.from(preview.split(',')[1], 'base64')
    );
  }
  console.log(meta);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
