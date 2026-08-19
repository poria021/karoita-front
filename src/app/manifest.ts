import type { MetadataRoute } from 'next';

import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site-seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    lang: 'fa-IR',
    dir: 'rtl',
    background_color: 'hsl(0 0% 100%)',
    theme_color: 'hsl(221 85% 42%)',
    icons: [
      {
        src: '/brand/karvita-mark.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        purpose: 'any',
      },
      {
        src: '/brand/karvita-mark.png',
        type: 'image/png',
        sizes: '192x192',
        purpose: 'any',
      },
      {
        src: '/brand/karvita-mark.png',
        type: 'image/png',
        sizes: '512x512',
        purpose: 'maskable',
      },
    ],
  };
}
