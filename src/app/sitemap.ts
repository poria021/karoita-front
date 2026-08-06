import type { MetadataRoute } from 'next';

import { getSiteUrl } from '@/lib/site-seo';
import { RouteService } from '@/services/route.service';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().origin;

  return [
    {
      url: `${base}${RouteService.marketing.home()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
