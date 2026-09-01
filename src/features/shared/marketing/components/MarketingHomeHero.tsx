'use client';

import { MarketingHeroCarousel } from '@/features/shared/marketing/components/MarketingHeroCarousel';
import { useMarketingChromeData } from '@/features/shared/marketing/lib/marketingChromeContext';

/**
 * بنرهای هیرو از context مشترک chrome لندینگ (پشتیبانی CMS).
 */
export function MarketingHomeHero() {
  const { banners } = useMarketingChromeData();
  return <MarketingHeroCarousel banners={banners} />;
}
