'use client';

import { MarketingAboutSection } from '@/features/shared/marketing/components/MarketingAboutSection';
import { MarketingAdvantagesSection } from '@/features/shared/marketing/components/MarketingAdvantagesSection';
import { MarketingBenefitsSection } from '@/features/shared/marketing/components/MarketingBenefitsSection';
import { MarketingHeroCarousel } from '@/features/shared/marketing/components/MarketingHeroCarousel';
import { MarketingInternshipSection } from '@/features/shared/marketing/components/MarketingInternshipSection';
import { MarketingShell } from '@/features/shared/marketing/components/MarketingShell';
import { MarketingTrustBadges } from '@/features/shared/marketing/components/MarketingTrustBadges';
import { useMarketingChrome } from '@/features/shared/marketing/hooks/useMarketingChrome';
import { MarketingPanel } from '@/features/shared/marketing/lib/marketingPanelContext';

/**
 * Public landing — chrome (banners / dock / socials) from Landing CMS client store.
 * Plain canvas while the first mock LS read resolves (no marketing skeletons).
 */
export function MarketingHomePage() {
  const { data, isReady } = useMarketingChrome();

  if (!isReady) {
    return (
      <div
        className="kv-brand-atmosphere kv-blueprint-bg min-h-dvh bg-kv-canvas"
        aria-busy="true"
        aria-live="polite"
      />
    );
  }

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
