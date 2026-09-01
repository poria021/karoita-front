import localFont from 'next/font/local';

/**
 * فونت محلی Vazirmatn.
 *
 * هر وزن فقط یک‌بار با یک `path` (زیرمجموعهٔ عربی/فارسی که لاتین را هم پوشش می‌دهد).
 * تکرار arabic+latin، `localFont()` دوم در `global-error.tsx` (preload پیش‌فرض)،
 * و گذاشتن دوبارهٔ کلاس فونت روی layout تو در تو، هشدار preload استفاده‌نشده می‌داد.
 *
 * `preload: false`: فیس از `--font-vazirmatn` روی `<body>` اعمال می‌شود؛
 * Next نباید preload اضافه برای فونتی که اولین paint استفاده نمی‌کند تزریق کند.
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
