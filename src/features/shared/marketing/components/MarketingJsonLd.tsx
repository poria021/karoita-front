import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_TITLE,
  absoluteSiteUrl,
  getSiteUrl,
} from '@/lib/site-seo';
import { RouteService } from '@/services/route.service';

/**
 * JSON-LD سازمان + وب‌سایت برای خانهٔ مارکتینگ عمومی (SSR).
 */
export function MarketingJsonLd() {
  const siteOrigin = getSiteUrl().origin;
  const homeUrl = absoluteSiteUrl(RouteService.marketing.home());
  const logoUrl = absoluteSiteUrl(SITE_OG_IMAGE);

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteOrigin}/#organization`,
        name: SITE_NAME,
        url: homeUrl,
        logo: {
          '@type': 'ImageObject',
          url: logoUrl,
        },
        description: SITE_DESCRIPTION,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IR',
          addressLocality: 'تهران',
          streetAddress: 'خیابان انقلاب',
          postalCode: '1417753111',
        },
        telephone: '+98-21-91222079',
      },
      {
        '@type': 'WebSite',
        '@id': `${siteOrigin}/#website`,
        url: homeUrl,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        inLanguage: 'fa-IR',
        publisher: { '@id': `${siteOrigin}/#organization` },
      },
      {
        '@type': 'WebPage',
        '@id': `${homeUrl}#webpage`,
        url: homeUrl,
        name: SITE_TITLE,
        description: SITE_DESCRIPTION,
        isPartOf: { '@id': `${siteOrigin}/#website` },
        about: { '@id': `${siteOrigin}/#organization` },
        inLanguage: 'fa-IR',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
