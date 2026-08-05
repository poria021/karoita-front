import { MarketingHeroCarousel } from '@/features/shared/marketing/components/MarketingHeroCarousel';
import { MarketingShell } from '@/features/shared/marketing/components/MarketingShell';
import { MarketingTrustBadges } from '@/features/shared/marketing/components/MarketingTrustBadges';
import { MarketingBenefitsSection } from '@/features/shared/marketing/components/MarketingBenefitsSection';
import { MarketingAboutSection } from '@/features/shared/marketing/components/MarketingAboutSection';
import { MarketingInternshipSection } from '@/features/shared/marketing/components/MarketingInternshipSection';
import { MarketingAdvantagesSection } from '@/features/shared/marketing/components/MarketingAdvantagesSection';
import { MarketingPanel } from '@/features/shared/marketing/lib/marketingPanelContext';
import { loadMarketingChrome } from '@/features/shared/marketing/lib/loadMarketingChrome';

export default async function MarketingHomePage() {
  const { banners, products, socials } = await loadMarketingChrome();

  return (
    <MarketingShell products={products} socials={socials} overlayHeader>
      <MarketingHeroCarousel banners={banners} />
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
