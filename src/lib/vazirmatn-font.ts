import localFont from 'next/font/local';

/**
 * Vazirmatn local font.
 *
 * Each weight is declared ONCE with a single `path` (the Arabic/Persian
 * subset which also covers Latin). Declaring arabic + latin as two separate
 * src entries per weight caused Next.js to emit a <link rel="preload"> for
 * every entry — 8 preload tags total — but the browser only consumed the
 * first matching one, triggering:
 *   "preloaded but not used within a few seconds from the window's load event"
 *
 * Fix: use the Arabic woff2 (which is a full Unicode-range file covering both
 * Arabic/Persian and Latin glyphs) as the single source per weight.
 * This produces exactly 4 preload tags — one per weight — all of which are
 * consumed immediately by the CSS @font-face rule.
 */
export const vazirmatn = localFont({
  src: [
    {
      path: '../fonts/vazirmatn/vazirmatn-arabic-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/vazirmatn/vazirmatn-arabic-500-normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/vazirmatn/vazirmatn-arabic-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/vazirmatn/vazirmatn-arabic-900-normal.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-vazirmatn',
  display: 'swap',
  preload: false,
  fallback: ['Tahoma', 'Arial', 'sans-serif'],
});
