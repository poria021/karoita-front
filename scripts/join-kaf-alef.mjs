/**
 * Inspect right-side columns of wordmark; force-join ک+ا if a gap remains.
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
  const d = ctx.getImageData(0, 0, w, h).data;

  const colInk = (x) => {
    let n = 0;
    for (let y = 0; y < h; y++) if (d[(y * w + x) * 4 + 3] > 32) n++;
    return n;
  };
  const colTopBottom = (x) => {
    let top = h, bot = -1, n = 0;
    for (let y = 0; y < h; y++) {
      if (d[(y * w + x) * 4 + 3] > 32) {
        n++;
        if (y < top) top = y;
        if (y > bot) bot = y;
      }
    }
    return { n, top: n ? top : null, bot: n ? bot : null, tall: n > h * 0.42 };
  };

  let minX = w, maxX = 0;
  for (let x = 0; x < w; x++) if (colInk(x) > 0) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  }

  // Walk from right: kaf stem (tall), then maybe gap/connector, then alef (tall)
  const profile = [];
  for (let x = maxX; x >= Math.max(minX, maxX - 350); x--) {
    profile.push({ x, ...colTopBottom(x) });
  }

  // Find rightmost tall run = kaf stem
  let stemR = null, stemL = null;
  for (const p of profile) {
    if (p.tall) { stemR = p.x; break; }
  }
  for (const p of profile) {
    if (p.x > stemR) continue;
    if (!p.tall && p.n > 0) { stemL = p.x + 1; break; }
    if (p.n === 0) { stemL = p.x + 1; break; }
    stemL = p.x;
  }

  // Left of stem: empty or short connector, then alef tall
  let gapStart = null, gapEnd = null, alefR = null, alefL = null;
  for (let x = stemL - 1; x >= minX; x--) {
    const info = colTopBottom(x);
    if (info.n === 0) {
      if (gapEnd == null) gapEnd = x;
      gapStart = x;
      continue;
    }
    if (gapEnd != null && info.tall) {
      alefR = x;
      break;
    }
    if (gapEnd == null && info.tall) {
      // no empty gap — short connector only
      alefR = x;
      break;
    }
    if (gapEnd == null && !info.tall) {
      // connector ink — keep scanning
      continue;
    }
    if (gapEnd != null && !info.tall) {
      // ink after empty? unusual
      continue;
    }
  }
  if (alefR != null) {
    for (let x = alefR; x >= minX; x--) {
      if (!colTopBottom(x).tall) { alefL = x + 1; break; }
      alefL = x;
    }
  }

  // Also measure empty runs in right 40%
  const gaps = [];
  let i = Math.round(minX + (maxX - minX) * 0.5);
  while (i <= maxX) {
    if (colInk(i) === 0) {
      const s = i;
      while (i <= maxX && colInk(i) === 0) i++;
      gaps.push({ start: s, end: i - 1, w: i - s });
    } else i++;
  }

  window.__meta = {
    w, h, minX, maxX, stemL, stemR, gapStart, gapEnd, alefL, alefR, gaps,
    near: profile.filter((p) => p.x >= (alefL ?? stemL) - 5 && p.x <= stemR).slice(0, 80),
  };

  // If empty gap between alef and kaf — remove it entirely
  // If only thin connector but visual separation from keshideh stretch:
  // also pull kaf left by removing any near-empty columns (ink < 3% height)
  let cutStart = null, cutEnd = null;
  if (gapStart != null && gapEnd != null && alefR != null && gapStart > alefR) {
    cutStart = gapStart;
    cutEnd = gapEnd;
  } else {
    // Find sparsest run between alefR and stemL
    const leftBound = alefR != null ? alefR + 1 : stemL - 40;
    const rightBound = stemL - 1;
    let best = null;
    for (let x = leftBound; x <= rightBound; x++) {
      const n = colInk(x);
      if (n < h * 0.08) {
        if (!best) best = { start: x, end: x };
        else best.end = x;
      } else if (best) {
        if (!cutStart || best.end - best.start > cutEnd - cutStart) {
          cutStart = best.start; cutEnd = best.end;
        }
        best = null;
      }
    }
    if (best && (!cutStart || best.end - best.start >= (cutEnd - cutStart || 0))) {
      cutStart = best.start; cutEnd = best.end;
    }
  }

  window.__meta.cutStart = cutStart;
  window.__meta.cutEnd = cutEnd;

  if (cutStart == null || cutEnd == null || cutEnd < cutStart) {
    // Fallback: remove widest gap in right 30%
    const rightGaps = gaps.filter((g) => g.start >= minX + (maxX - minX) * 0.7);
    if (rightGaps.length) {
      const g = rightGaps.sort((a, b) => b.w - a.w)[0];
      cutStart = g.start; cutEnd = g.end;
      window.__meta.cutFallback = g;
    }
  }

  if (cutStart != null && cutEnd >= cutStart) {
    const remove = cutEnd - cutStart + 1;
    const outW = w - remove;
    const out = document.createElement('canvas');
    out.width = outW; out.height = h;
    const octx = out.getContext('2d');
    octx.drawImage(c, 0, 0, cutStart, h, 0, 0, cutStart, h);
    const restSrc = cutEnd + 1;
    const restW = w - restSrc;
    if (restW > 0) octx.drawImage(c, restSrc, 0, restW, h, cutStart, 0, restW, h);

    // Bridge: paint a short horizontal bar at baseline height to join ک-ا if needed
    const od = octx.getImageData(0, 0, outW, h);
    const p = od.data;
    const inkAt = (x, y) => p[(y * outW + x) * 4 + 3] > 32;
    // Find baseline y near join (from alef right edge)
    let joinX = cutStart;
    let baseYs = [];
    for (let x = Math.max(0, joinX - 8); x < Math.min(outW, joinX + 8); x++) {
      for (let y = 0; y < h; y++) if (inkAt(x, y)) baseYs.push(y);
    }
    baseYs.sort((a, b) => a - b);
    const yLow = baseYs.length ? baseYs[Math.floor(baseYs.length * 0.72)] : Math.floor(h * 0.7);
    const barH = Math.max(6, Math.round(h * 0.12));
    // Ensure continuous ink across join ±2px
    for (let x = Math.max(0, joinX - 3); x <= Math.min(outW - 1, joinX + 3); x++) {
      for (let y = yLow; y < Math.min(h, yLow + barH); y++) {
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
    window.__meta.outW = outW;
    window.__meta.remove = remove;
    window.__meta.joined = true;
  } else {
    window.__url = c.toDataURL('image/png');
    window.__meta.joined = false;
  }

  // preview white bg
  const prev = document.createElement('canvas');
  const srcImg = new Image();
  srcImg.src = window.__url;
  await srcImg.decode();
  prev.width = srcImg.width; prev.height = srcImg.height;
  const pctx = prev.getContext('2d');
  pctx.fillStyle = '#fff';
  pctx.fillRect(0, 0, prev.width, prev.height);
  pctx.drawImage(srcImg, 0, 0);
  // red line at join
  if (cutStart != null) {
    pctx.strokeStyle = 'red';
    pctx.beginPath();
    pctx.moveTo(cutStart, 0);
    pctx.lineTo(cutStart, prev.height);
    pctx.stroke();
  }
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
  console.log(JSON.stringify(meta, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
