/**
 * Regenerates favicon + PWA icons from public/brand/main-logo.png.
 *
 * Favicons / any-purpose: exact mark in brand blue on transparent background.
 * Maskable + Apple touch: white mark on solid brand (platform safe-zone / opaque).
 *
 * Usage: node scripts/generate-brand-icons.mjs
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const brandDir = path.join(root, "public", "brand");
const sourcePath = path.join(brandDir, "main-logo.png");

/** hsl(220 85% 42%) ≈ #104DC6 */
const BRAND = { r: 16, g: 77, b: 198, alpha: 1 };

/** Opaque silhouette → brand RGB; keep anti-aliased alpha; clear near-empty pixels. */
async function tintedMarkBuffer(rgb = BRAND) {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 16) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
      continue;
    }
    data[i] = rgb.r;
    data[i + 1] = rgb.g;
    data[i + 2] = rgb.b;
    // keep data[i + 3] alpha
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim()
    .png()
    .toBuffer();
}

async function whiteMarkBuffer() {
  return tintedMarkBuffer({ r: 255, g: 255, b: 255, alpha: 1 });
}

async function brandMarkBuffer() {
  return tintedMarkBuffer(BRAND);
}

/**
 * Square canvas.
 * - transparent: brand-colored mark, no fill (favicon)
 * - solid: brand fill + white mark (PWA maskable / Apple)
 */
async function composeSquare(
  size,
  {
    paddingRatio = 0.14,
    radiusRatio = 0,
    transparent = false,
  } = {},
) {
  const mark = transparent ? await brandMarkBuffer() : await whiteMarkBuffer();
  const pad = Math.round(size * paddingRatio);
  const inner = size - pad * 2;

  const resized = await sharp(mark)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  let base = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: transparent
        ? { r: 0, g: 0, b: 0, alpha: 0 }
        : BRAND,
    },
  }).composite([{ input: resized, gravity: "centre" }]);

  if (radiusRatio > 0 && !transparent) {
    const r = Math.round(size * radiusRatio);
    const svg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
        <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="white"/>
      </svg>`,
    );
    base = sharp(
      await base
        .png()
        .composite([{ input: svg, blend: "dest-in" }])
        .toBuffer(),
    );
  }

  return base.png().toBuffer();
}

async function write(name, buffer) {
  const out = path.join(brandDir, name);
  await sharp(buffer).png().toFile(out);
  console.log("wrote", name, (await sharp(out).metadata()).width);
}

await mkdir(brandDir, { recursive: true });

// Favicons — exact logo, brand color, transparent background
await write(
  "favicon-32.png",
  await composeSquare(32, { paddingRatio: 0.08, transparent: true }),
);
await write(
  "favicon-48.png",
  await composeSquare(48, { paddingRatio: 0.08, transparent: true }),
);
await write(
  "favicon.png",
  await composeSquare(64, { paddingRatio: 0.08, transparent: true }),
);

// PWA any-purpose — same transparent brand mark
await write(
  "pwa-icon-192.png",
  await composeSquare(192, { paddingRatio: 0.1, transparent: true }),
);
await write(
  "pwa-icon-512.png",
  await composeSquare(512, { paddingRatio: 0.1, transparent: true }),
);

// Maskable — solid brand + white mark (Chrome safe zone)
await write(
  "pwa-icon-512-maskable.png",
  await composeSquare(512, { paddingRatio: 0.22, transparent: false }),
);

// Apple touch — opaque brand square (iOS does not like transparency)
await write(
  "apple-touch-icon.png",
  await composeSquare(180, { paddingRatio: 0.14, transparent: false }),
);

console.log("done — brand RGB", BRAND);
