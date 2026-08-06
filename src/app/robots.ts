import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/site-seo';
import { RouteService } from '@/services/route.service';

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl().origin;

  return {
    rules: [
      {
        userAgent: '*',
        allow: RouteService.marketing.home(),
        disallow: ['/karvita/', '/auth/', '/api/'],
      },
    ],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
