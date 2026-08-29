/**
 * Strip white background from official mark → monochrome transparent PNG.
 * Keeps source at public/brand/karvita-mark.source.png
 * Run: node scripts/generate-karvita-mark.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public/brand/karvita-mark.source.png');
const OUT_PNG = path.join(ROOT, 'public/brand/karvita-mark.png');

async function main() {
  const fallback = path.join(ROOT, 'public/brand/karvita-mark.png');
  if (!fs.existsSync(SRC)) {
    if (!fs.existsSync(fallback)) {
      throw new Error('Missing logo PNG to process');
    }
    fs.copyFileSync(fallback, SRC);
  }

  const srcB64 = fs.readFileSync(SRC).toString('base64');
  const srcDataUri = `data:image/png;base64,${srcB64}`;

  const html = `<!DOCTYPE html>
<html><body style="margin:0;background:transparent">
<canvas id="c"></canvas>
<script>
(async () => {
  try {
    const img = new Image();
    img.src = ${JSON.stringify(srcDataUri)};
    await img.decode();
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const c = document.getElementById('c');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, w, h);
    const d = data.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const a = d[i + 3];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const isNearWhite = max > 235 && min > 220;
      const isInk = a > 40 && !isNearWhite;
      if (isInk) {
        d[i] = 0;
        d[i + 1] = 0;
        d[i + 2] = 0;
        d[i + 3] = 255;
      } else {
        d[i] = 0;
        d[i + 1] = 0;
        d[i + 2] = 0;
        d[i + 3] = 0;
      }
    }
    ctx.putImageData(data, 0, 0);
    document.documentElement.dataset.ready = '1';
    document.documentElement.dataset.w = String(w);
    document.documentElement.dataset.h = String(h);
  } catch (e) {
    document.documentElement.dataset.err = String(e && e.message ? e.message : e);
  }
})();
</script>
</body></html>`;

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

  const meta = await page.evaluate(() => ({
    w: Number(document.documentElement.dataset.w),
    h: Number(document.documentElement.dataset.h),
  }));

  const dataUrl = await page.evaluate(() =>
    document.getElementById('c').toDataURL('image/png')
  );
  const png = Buffer.from(dataUrl.split(',')[1], 'base64');
  fs.writeFileSync(OUT_PNG, png);

  console.log('Wrote', OUT_PNG, `(${meta.w}×${meta.h}, ${png.length} bytes)`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
