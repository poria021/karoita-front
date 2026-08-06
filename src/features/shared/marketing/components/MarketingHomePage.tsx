'use client';

import { MarketingAboutSection } from '@/features/shared/marketing/components/MarketingAboutSection';
import { MarketingAdvantagesSection } from '@/features/shared/marketing/components/MarketingAdvantagesSection';
import { MarketingBenefitsSection } from '@/features/shared/marketing/components/MarketingBenefitsSection';
import { MarketingHeroCarousel } from '@/features/shared/marketing/components/MarketingHeroCarousel';
import { MarketingInternshipSection } from '@/features/shared/marketing/components/MarketingInternshipSection';
import { MarketingShell } from '@/features/shared/marketing/components/MarketingShell';
import { MarketingTrustBadges } from '@/features/shared/marketing/components/MarketingTrustBadges';
import { useMarketingChrome } from '@/features/shared/marketing/hooks/useMarketingChrome';
import type { MarketingChromeData } from '@/features/shared/marketing/lib/loadMarketingChrome';
import { MarketingPanel } from '@/features/shared/marketing/lib/marketingPanelContext';

type MarketingHomePageProps = {
  /** SSR seed / Nest chrome so crawlers see content on first HTML. */
  initialChrome: MarketingChromeData;
};

/**
 * Public landing — sections stay in the document for SEO; nav scrolls to them.
 * Chrome (banners / dock / socials) hydrates from Landing CMS after mount.
 */
export function MarketingHomePage({ initialChrome }: MarketingHomePageProps) {
  const { data } = useMarketingChrome(initialChrome);

  return (
    <MarketingShell
      products={data.products}
      socials={data.socials}
      overlayHeader
    >
      <MarketingHeroCarousel banners={data.banners} />
      <MarketingTrustBadges />

      <MarketingPanel id="benefits">
        <MarketingBenefitsSection />
      </MarketingPanel>
      <MarketingPanel id="about">
        <MarketingAboutSection />
      </MarketingPanel>
      <MarketingPanel id="internship">
        <MarketingInternshipSection />
      </MarketingPanel>
      <MarketingPanel id="advantages">
        <MarketingAdvantagesSection />
      </MarketingPanel>
    </MarketingShell>
  );
}
