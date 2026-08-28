import localFont from 'next/font/local';

/**
 * Vazirmatn local font.
 *
 * Each weight is declared ONCE with a single `path` (the Arabic/Persian
 * subset which also covers Latin). Duplicate arabic+latin src entries, a
 * second `localFont()` in `global-error.tsx` (default preload: true), and
 * re-applying the font class on nested layouts all caused unused
 * `<link rel="preload">` warnings.
 *
 * `preload: false`: the face is applied via `--font-vazirmatn` on <body>;
 * Next must not inject extra font preloads that the first paint never uses.
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
