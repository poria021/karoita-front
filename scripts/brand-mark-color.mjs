/** Matches `PWA_THEME_COLOR` / `--kv-brand`: hsl(221 85% 42%). */
export const BRAND_MARK_RGB = { r: 16, g: 74, b: 198 };

/**
 * Silhouette PNG → brand-colored glyph (alpha preserved).
 */
export async function recolorSilhouetteToBrand(sharp, input) {
  const resized = await sharp(input).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const pixels = Buffer.from(resized.data);
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] === 0) continue;
    pixels[i] = BRAND_MARK_RGB.r;
    pixels[i + 1] = BRAND_MARK_RGB.g;
    pixels[i + 2] = BRAND_MARK_RGB.b;
  }
  return sharp(pixels, {
    raw: {
      width: resized.info.width,
      height: resized.info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}
