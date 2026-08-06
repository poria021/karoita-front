'use client';

import { MarketingHeroCarousel } from '@/features/shared/marketing/components/MarketingHeroCarousel';
import { useMarketingChromeData } from '@/features/shared/marketing/lib/marketingChromeContext';

/**
 * Hero banners from shared landing chrome context (CMS-backed).
 */
export function MarketingHomeHero() {
  const { banners } = useMarketingChromeData();
  return <MarketingHeroCarousel banners={banners} />;
}
