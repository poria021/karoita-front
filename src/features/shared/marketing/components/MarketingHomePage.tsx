import { MarketingAboutSection } from '@/features/shared/marketing/components/MarketingAboutSection';
import { MarketingAdvantagesSection } from '@/features/shared/marketing/components/MarketingAdvantagesSection';
import { MarketingBenefitsSection } from '@/features/shared/marketing/components/MarketingBenefitsSection';
import { MarketingHomeHero } from '@/features/shared/marketing/components/MarketingHomeHero';
import { MarketingInternshipSection } from '@/features/shared/marketing/components/MarketingInternshipSection';
import { MarketingShell } from '@/features/shared/marketing/components/MarketingShell';
import { MarketingTrustBadges } from '@/features/shared/marketing/components/MarketingTrustBadges';
import type { MarketingChromeData } from '@/features/shared/marketing/lib/loadMarketingChrome';
import { MarketingPanel } from '@/features/shared/marketing/lib/marketingPanelContext';

type MarketingHomePageProps = {
  /** SSR chrome from Landing CMS / Nest so first HTML is crawlable. */
  initialChrome: MarketingChromeData;
};

/**
 * Public landing as RSC composition.
 * Client leaves: hero carousel, nav panels, dock (via shell), benefits tabs.
 */
export function MarketingHomePage({ initialChrome }: MarketingHomePageProps) {
  return (
    <MarketingShell initialChrome={initialChrome} overlayHeader>
      <MarketingHomeHero />
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
