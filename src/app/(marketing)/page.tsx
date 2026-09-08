// محتوای لندینگ از CMS ادمین می‌آید — نباید در build بیک شود
export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';

import { MarketingHomePage } from '@/features/shared/marketing/components/MarketingHomePage';
import { MarketingJsonLd } from '@/features/shared/marketing/components/MarketingJsonLd';
import { loadMarketingChrome } from '@/features/shared/marketing/lib/loadMarketingChrome';
import { homePageTitle } from '@/lib/document-title';
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
} from '@/lib/site-seo';
import { RouteService } from '@/services/route.service';

export const metadata: Metadata = {
  title: homePageTitle(),
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: RouteService.marketing.home(),
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: RouteService.marketing.home(),
  },
};

export default async function MarketingHomeRoute() {
  const initialChrome = await loadMarketingChrome();

  return (
    <>
      <MarketingJsonLd />
      <MarketingHomePage initialChrome={initialChrome} />
    </>
  );
}
